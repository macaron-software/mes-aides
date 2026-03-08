use anyhow::Result;
use axum::{
    extract::{Json, State},
    http::StatusCode,
    response::IntoResponse,
};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};
use uuid::Uuid;

use crate::db::{self, DbPool};

// ── Constants ──────────────────────────────────────────────────────────────────

pub const ACCESS_TOKEN_SECS: u64 = 15 * 60;       // 15 minutes
pub const REFRESH_TOKEN_SECS: u64 = 7 * 24 * 3600; // 7 days

// ── JWT Claims ─────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,   // user_id
    pub email: String,
    pub role: String,  // "user" | "admin"
    pub exp: usize,
    pub iat: usize,
}

// ── Token helpers ──────────────────────────────────────────────────────────────

fn now_secs() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}

pub fn sign_access_token(
    user_id: &str,
    email: &str,
    role: &str,
    secret: &[u8],
) -> Result<String> {
    let now = now_secs();
    let claims = Claims {
        sub: user_id.to_string(),
        email: email.to_string(),
        role: role.to_string(),
        exp: (now + ACCESS_TOKEN_SECS) as usize,
        iat: now as usize,
    };
    Ok(encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret),
    )?)
}

pub fn verify_access_token(token: &str, secret: &[u8]) -> Result<Claims> {
    let data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret),
        &Validation::default(),
    )?;
    Ok(data.claims)
}

pub fn generate_refresh_token() -> String {
    Uuid::new_v4().to_string()
}

fn _refresh_expires_at_iso() -> String {
    // Unused: we store unix epoch seconds directly for simplicity
    let exp = now_secs() + REFRESH_TOKEN_SECS;
    format!("{exp}")
}

// ── Request / Response DTOs ────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Deserialize)]
pub struct RegisterRequest {
    pub email: String,
    pub password: String,
    #[serde(default = "default_role")]
    pub role: String,
}
fn default_role() -> String { "user".to_string() }

#[derive(Debug, Deserialize)]
pub struct RefreshRequest {
    pub refresh_token: String,
}

#[derive(Debug, Deserialize)]
pub struct LogoutRequest {
    pub refresh_token: String,
}

#[derive(Debug, Serialize)]
pub struct AuthResponse {
    pub access_token: String,
    pub refresh_token: String,
    pub token_type: &'static str,
    pub expires_in: u64,
    pub user: UserInfo,
}

#[derive(Debug, Serialize)]
pub struct UserInfo {
    pub id: String,
    pub email: String,
    pub role: String,
}

fn auth_error(msg: &'static str) -> (StatusCode, axum::Json<serde_json::Value>) {
    (
        StatusCode::UNAUTHORIZED,
        axum::Json(serde_json::json!({"error": msg})),
    )
}

fn bad_request(msg: &str) -> (StatusCode, axum::Json<serde_json::Value>) {
    (
        StatusCode::BAD_REQUEST,
        axum::Json(serde_json::json!({"error": msg})),
    )
}

fn conflict(msg: &str) -> (StatusCode, axum::Json<serde_json::Value>) {
    (
        StatusCode::CONFLICT,
        axum::Json(serde_json::json!({"error": msg})),
    )
}

fn forbidden(msg: &str) -> (StatusCode, axum::Json<serde_json::Value>) {
    (
        StatusCode::FORBIDDEN,
        axum::Json(serde_json::json!({"error": msg})),
    )
}

// ── Handlers ───────────────────────────────────────────────────────────────────

/// POST /api/auth/login
pub async fn login(
    State(state): State<crate::AppState>,
    Json(req): Json<LoginRequest>,
) -> impl IntoResponse {
    if req.email.is_empty() || req.password.is_empty() {
        return bad_request("email and password required").into_response();
    }

    let user = match db::find_user_by_email(&state.db, &req.email) {
        Ok(Some(u)) => u,
        Ok(None) => return auth_error("invalid credentials").into_response(),
        Err(_) => return auth_error("internal error").into_response(),
    };

    if !user.active {
        return auth_error("account disabled").into_response();
    }

    if !db::verify_password(&req.password, &user.password_hash) {
        return auth_error("invalid credentials").into_response();
    }

    let access_token = match sign_access_token(&user.id, &user.email, &user.role, &state.jwt_secret) {
        Ok(t) => t,
        Err(_) => return auth_error("token generation failed").into_response(),
    };

    let refresh_token = generate_refresh_token();
    let exp_secs = now_secs() + REFRESH_TOKEN_SECS;
    if db::store_refresh_token(&state.db, &refresh_token, &user.id, &exp_secs.to_string()).is_err() {
        return auth_error("internal error").into_response();
    }

    (
        StatusCode::OK,
        axum::Json(AuthResponse {
            access_token,
            refresh_token,
            token_type: "Bearer",
            expires_in: ACCESS_TOKEN_SECS,
            user: UserInfo {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        }),
    )
        .into_response()
}

/// POST /api/auth/refresh
pub async fn refresh(
    State(state): State<crate::AppState>,
    Json(req): Json<RefreshRequest>,
) -> impl IntoResponse {
    if req.refresh_token.is_empty() {
        return bad_request("refresh_token required").into_response();
    }

    let (user_id, expires_at_str, revoked) =
        match db::find_refresh_token(&state.db, &req.refresh_token) {
            Ok(Some(t)) => t,
            Ok(None) => return auth_error("invalid refresh token").into_response(),
            Err(_) => return auth_error("internal error").into_response(),
        };

    if revoked {
        return auth_error("refresh token revoked").into_response();
    }

    // Check expiry (stored as unix seconds string)
    let expires_at: u64 = expires_at_str.parse().unwrap_or(0);
    if expires_at < now_secs() {
        return auth_error("refresh token expired").into_response();
    }

    let user = match db::find_user_by_id(&state.db, &user_id) {
        Ok(Some(u)) => u,
        _ => return auth_error("user not found").into_response(),
    };

    if !user.active {
        return auth_error("account disabled").into_response();
    }

    // Rotate: revoke old, issue new pair
    let _ = db::revoke_refresh_token(&state.db, &req.refresh_token);

    let access_token = match sign_access_token(&user.id, &user.email, &user.role, &state.jwt_secret) {
        Ok(t) => t,
        Err(_) => return auth_error("token generation failed").into_response(),
    };

    let new_refresh = generate_refresh_token();
    let exp_secs = now_secs() + REFRESH_TOKEN_SECS;
    if db::store_refresh_token(&state.db, &new_refresh, &user.id, &exp_secs.to_string()).is_err() {
        return auth_error("internal error").into_response();
    }

    (
        StatusCode::OK,
        axum::Json(AuthResponse {
            access_token,
            refresh_token: new_refresh,
            token_type: "Bearer",
            expires_in: ACCESS_TOKEN_SECS,
            user: UserInfo {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        }),
    )
        .into_response()
}

/// POST /api/auth/logout — revoke the provided refresh token
pub async fn logout(
    State(state): State<crate::AppState>,
    Json(req): Json<LogoutRequest>,
) -> impl IntoResponse {
    let _ = db::revoke_refresh_token(&state.db, &req.refresh_token);
    (StatusCode::NO_CONTENT, "").into_response()
}

/// POST /api/auth/register
///
/// Open only when no users exist (bootstrap first admin).
/// After that, requires an existing admin JWT.
pub async fn register(
    State(state): State<crate::AppState>,
    caller: crate::middleware::OptionalAuth,
    Json(req): Json<RegisterRequest>,
) -> impl IntoResponse {
    if req.email.is_empty() || req.password.len() < 8 {
        return bad_request("email required, password >= 8 chars").into_response();
    }

    let count = db::user_count(&state.db).unwrap_or(1);

    if count > 0 {
        // Subsequent registrations require admin
        match &caller.0 {
            None => return auth_error("authentication required").into_response(),
            Some(claims) if claims.role != "admin" => {
                return forbidden("admin role required").into_response()
            }
            _ => {}
        }
    }

    // Validate role
    let role = match req.role.as_str() {
        "admin" | "user" => req.role.as_str(),
        _ => return bad_request("role must be 'user' or 'admin'").into_response(),
    };

    // Check duplicate
    if db::find_user_by_email(&state.db, &req.email).ok().flatten().is_some() {
        return conflict("email already registered").into_response();
    }

    match db::create_user(&state.db, &req.email, &req.password, role) {
        Ok(user) => (
            StatusCode::CREATED,
            axum::Json(serde_json::json!({
                "id": user.id,
                "email": user.email,
                "role": user.role,
                "created_at": user.created_at
            })),
        )
            .into_response(),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            axum::Json(serde_json::json!({"error": e.to_string()})),
        )
            .into_response(),
    }
}
