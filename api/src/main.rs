use axum::{
    extract::Json,
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Router,
};
use serde::Serialize;
use tower_http::cors::{Any, CorsLayer};
use tower_http::compression::CompressionLayer;
use aides_core::engine::{Simulator, Situation};

// ── Health ────────────────────────────────────────────────────────────────────

async fn health() -> impl IntoResponse {
    (StatusCode::OK, Json(serde_json::json!({"status":"ok","version":"0.1.0"})))
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
    categorie: String,
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
            categorie: format!("{:?}", a.categorie).to_lowercase(),
            montant_max: a.montant_max,
            periodicite: a.periodicite,
            organisme: a.organisme,
            url_info: a.url_info,
        })
        .collect();
    (StatusCode::OK, Json(aides))
}

// ── Router ────────────────────────────────────────────────────────────────────

pub fn app() -> Router {
    let cors = CorsLayer::new()
        .allow_origin("https://aides.macaron-software.com".parse::<axum::http::HeaderValue>().unwrap())
        .allow_methods(Any)
        .allow_headers(Any);

    Router::new()
        .route("/api/health",   get(health))
        .route("/api/simulate", post(simulate))
        .route("/api/aides",    get(list_aides))
        .layer(cors)
        .layer(CompressionLayer::new())
}

#[tokio::main]
async fn main() {
    let port = std::env::var("PORT").unwrap_or_else(|_| "3001".to_string());
    let addr = format!("0.0.0.0:{port}");
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    println!("aides-api listening on {addr}");
    axum::serve(listener, app()).await.unwrap();
}
