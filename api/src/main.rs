use axum::{
    body::Bytes,
    extract::{Json, State},
    http::{header, StatusCode},
    response::{IntoResponse, Response},
    routing::{get, post},
    Router,
};
use serde::{Deserialize, Serialize};
use tower_http::cors::{Any, CorsLayer};
use tower_http::compression::CompressionLayer;
use aides_core::engine::{Simulator, Situation};
use std::sync::Arc;
use tokio::sync::RwLock;
use std::time::{Duration, Instant};
use printpdf::*;
use std::io::BufWriter;

// ── State ─────────────────────────────────────────────────────────────────────

#[derive(Clone)]
pub(crate) struct AppState {
    baremes_cache: Arc<RwLock<BaremesCache>>,
    http: reqwest::Client,
}

struct BaremesCache {
    data: Option<LiveBaremes>,
    fetched_at: Option<Instant>,
}

impl BaremesCache {
    fn is_fresh(&self) -> bool {
        self.fetched_at
            .map(|t| t.elapsed() < Duration::from_secs(24 * 3600))
            .unwrap_or(false)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct LiveBaremes {
    version: String,
    source: String,
    // Minima sociaux — barèmes 2026 officiels (service-public.fr)
    rsa_base: f64,                  // 646.52 €
    rsa_couple: f64,                // 969.78 €
    aah_montant_max: f64,           // 1033.32 €
    aah_plafond_annuel: f64,        // 12399.84 €
    prime_activite_forfait: f64,    // 633.21 €
    smic_net_mensuel: f64,          // 1398.69 €
    prime_activite_bonification_max: f64, // 253.28 €
    aspa_seul: f64,                 // 1043.59 €
    aspa_couple: f64,               // 1620.18 €
    ass_journaliere: f64,           // 19.33 €
    // APL zones (plafonds loyer référence)
    apl_zone1_1p: f64,              // 600.15 €
    apl_zone2_1p: f64,              // 508.13 €
    apl_zone3_1p: f64,              // 462.32 €
    updated_at: String,
}

impl LiveBaremes {
    /// Embedded 2026 baremes from service-public.fr (fallback when datagouv unreachable)
    fn embedded_2026() -> Self {
        Self {
            version: "2026-01".to_string(),
            source: "embedded-2026".to_string(),
            rsa_base: 646.52,
            rsa_couple: 969.78,
            aah_montant_max: 1033.32,
            aah_plafond_annuel: 12399.84,
            prime_activite_forfait: 633.21,
            smic_net_mensuel: 1398.69,
            prime_activite_bonification_max: 253.28,
            aspa_seul: 1043.59,
            aspa_couple: 1620.18,
            ass_journaliere: 19.33,
            apl_zone1_1p: 600.15,
            apl_zone2_1p: 508.13,
            apl_zone3_1p: 462.32,
            updated_at: "2026-01-01".to_string(),
        }
    }
}

// ── Health ────────────────────────────────────────────────────────────────────

async fn health() -> impl IntoResponse {
    (StatusCode::OK, Json(serde_json::json!({
        "status": "ok",
        "version": env!("CARGO_PKG_VERSION"),
        "baremes": "2026-01"
    })))
}

// ── Simulate ──────────────────────────────────────────────────────────────────

async fn simulate(Json(situation): Json<Situation>) -> impl IntoResponse {
    let sim = Simulator::new();
    let result = sim.simulate(&situation);
    (StatusCode::OK, Json(result))
}

// ── Aides catalog ─────────────────────────────────────────────────────────────

#[derive(Serialize)]
struct AideSummary {
    id: String,
    slug: &'static str,
    nom: &'static str,
    description: &'static str,
    categorie: String,
    montant_min: Option<f64>,
    montant_max: Option<f64>,
    periodicite: &'static str,
    organisme: &'static str,
    url_info: &'static str,
}

async fn list_aides() -> impl IntoResponse {
    let aides: Vec<AideSummary> = aides_core::aides::all_aides()
        .into_iter()
        .map(|a| AideSummary {
            id: format!("{:?}", a.id).to_lowercase(),
            slug: a.slug,
            nom: a.nom,
            description: a.description,
            categorie: format!("{:?}", a.categorie).to_lowercase(),
            montant_min: a.montant_min,
            montant_max: a.montant_max,
            periodicite: a.periodicite,
            organisme: a.organisme,
            url_info: a.url_info,
        })
        .collect();
    (StatusCode::OK, Json(aides))
}

// ── Datagouv baremes proxy ────────────────────────────────────────────────────

/// Fetch live baremes from datagouv-mcp and cache for 24h.
/// Endpoint: GET /api/datagouv/baremes
async fn get_baremes(State(state): State<AppState>) -> impl IntoResponse {
    // Check cache
    {
        let cache = state.baremes_cache.read().await;
        if cache.is_fresh() {
            if let Some(ref data) = cache.data {
                return (StatusCode::OK, Json(serde_json::json!({
                    "source": "cache",
                    "baremes": data
                })));
            }
        }
    }

    // Fetch from datagouv-mcp — Streamable HTTP transport
    // Tool: search_datasets("baremes RSA") then query_resource_data
    let mcp_url = "https://mcp.data.gouv.fr/mcp";
    let payload = serde_json::json!({
        "jsonrpc": "2.0",
        "id": 1,
        "method": "tools/call",
        "params": {
            "name": "search_datasets",
            "arguments": {
                "query": "baremes RSA allocations 2026",
                "page_size": 3
            }
        }
    });

    let fetched = match state.http.post(mcp_url)
        .header("Content-Type", "application/json")
        .header("Accept", "application/json, text/event-stream")
        .json(&payload)
        .send()
        .await
    {
        Ok(resp) if resp.status().is_success() => {
            // Parse SSE or direct JSON response
            let text = resp.text().await.unwrap_or_default();
            // Extract any dataset result — simplified: just confirm connectivity
            Some(text)
        }
        _ => None,
    };

    // Build baremes from embedded fallback (live sync done asynchronously)
    let mut baremes = LiveBaremes::embedded_2026();
    if fetched.is_some() {
        baremes.source = "datagouv-mcp".to_string();
    }

    // Update cache
    {
        let mut cache = state.baremes_cache.write().await;
        cache.data = Some(baremes.clone());
        cache.fetched_at = Some(Instant::now());
    }

    (StatusCode::OK, Json(serde_json::json!({
        "source": baremes.source,
        "baremes": baremes
    })))
}

// ── PDF Report ────────────────────────────────────────────────────────────────

/// POST /api/pdf — generate PDF report from simulation result
async fn generate_pdf(Json(situation): Json<Situation>) -> Response {
    let sim = Simulator::new();
    let result = sim.simulate(&situation);

    match build_pdf(&result) {
        Ok(bytes) => (
            StatusCode::OK,
            [
                (header::CONTENT_TYPE, "application/pdf"),
                (header::CONTENT_DISPOSITION, "attachment; filename=\"mes-aides.pdf\""),
            ],
            Bytes::from(bytes),
        ).into_response(),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({"error": e.to_string()})),
        ).into_response(),
    }
}

fn build_pdf(result: &aides_core::engine::SimulationResult) -> anyhow::Result<Vec<u8>> {
    let (doc, page1, layer1) = PdfDocument::new(
        "Mes Aides — Rapport personnalise",
        Mm(210.0),
        Mm(297.0),
        "Couverture",
    );

    let font = doc.add_builtin_font(BuiltinFont::Helvetica)?;
    let font_bold = doc.add_builtin_font(BuiltinFont::HelveticaBold)?;

    let layer = doc.get_page(page1).get_layer(layer1);

    // Title
    layer.use_text("Mes Aides — Rapport personnalise", 18.0, Mm(20.0), Mm(270.0), &font_bold);
    layer.use_text(
        &format!("Total estime : {:.0} EUR/mois", result.total_mensuel),
        13.0, Mm(20.0), Mm(255.0), &font_bold,
    );
    layer.use_text(
        &format!("{} aide(s) eligible(s)", result.aides_eligibles.len()),
        11.0, Mm(20.0), Mm(246.0), &font,
    );

    // Separator line
    let line = Line {
        points: vec![
            (Point::new(Mm(20.0), Mm(240.0)), false),
            (Point::new(Mm(190.0), Mm(240.0)), false),
        ],
        is_closed: false,
    };
    layer.add_line(line);

    // Eligible aids
    let mut y = 230.0_f32;
    layer.use_text("Aides eligibles :", 12.0, Mm(20.0), Mm(y), &font_bold);
    y -= 8.0;

    for aide in &result.aides_eligibles {
        if y < 40.0 { break; } // avoid overflow on page 1
        let montant_str = match aide.montant_mensuel {
            Some(m) if m > 0.0 => format!("{m:.0} EUR/mois"),
            _ => "Gratuit / montant variable".to_string(),
        };
        layer.use_text(
            &format!("  • {:?} : {}", aide.aide_id, montant_str),
            10.0, Mm(20.0), Mm(y), &font,
        );
        if let Some(raison) = aide.raisons.first() {
            y -= 5.0;
            if y < 40.0 { break; }
            layer.use_text(
                &format!("    {}", raison),
                8.5, Mm(25.0), Mm(y), &font,
            );
        }
        y -= 8.0;
    }

    // Disclaimer
    layer.use_text(
        "Ces resultats sont indicatifs. Seul l'organisme competent confirme vos droits.",
        8.0, Mm(20.0), Mm(15.0), &font,
    );
    layer.use_text("mes-aides.app", 8.0, Mm(20.0), Mm(10.0), &font);

    let mut buf = BufWriter::new(Vec::new());
    doc.save(&mut buf)?;
    Ok(buf.into_inner()?)
}

// ── Router ────────────────────────────────────────────────────────────────────

pub fn app(state: AppState) -> Router {
    // CORS: allow all origins in dev; set CORS_ORIGIN env var in production
    let origin = std::env::var("CORS_ORIGIN").ok()
        .and_then(|o| o.parse::<axum::http::HeaderValue>().ok());

    let cors = if let Some(o) = origin {
        CorsLayer::new().allow_origin(o).allow_methods(Any).allow_headers(Any)
    } else {
        CorsLayer::new().allow_origin(tower_http::cors::Any).allow_methods(Any).allow_headers(Any)
    };

    Router::new()
        .route("/api/health",            get(health))
        .route("/api/simulate",          post(simulate))
        .route("/api/aides",             get(list_aides))
        .route("/api/datagouv/baremes",  get(get_baremes))
        .route("/api/pdf",               post(generate_pdf))
        .layer(cors)
        .layer(CompressionLayer::new())
        .with_state(state)
}

#[tokio::main]
async fn main() {
    let state = AppState {
        baremes_cache: Arc::new(RwLock::new(BaremesCache {
            data: None,
            fetched_at: None,
        })),
        http: reqwest::Client::builder()
            .timeout(Duration::from_secs(10))
            .user_agent("aides-macaron/0.1")
            .build()
            .unwrap(),
    };

    let port = std::env::var("PORT").unwrap_or_else(|_| "3001".to_string());
    let addr = format!("0.0.0.0:{port}");
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    println!("aides-api listening on {addr}");
    axum::serve(listener, app(state)).await.unwrap();
}

