use axum::{
    async_trait,
    extract::FromRequestParts,
    http::{request::Parts, StatusCode},
    Json,
};
use serde_json::json;

use crate::auth::{verify_access_token, Claims};

// ── Helper: extract Bearer token from Authorization header ────────────────────

fn extract_bearer(parts: &Parts) -> Option<&str> {
    parts
        .headers
        .get("authorization")
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer "))
}

// ── OptionalAuth ──────────────────────────────────────────────────────────────
/// Extractor for public routes that *may* have an authenticated caller.
/// Never returns an error — `None` means anonymous.
pub struct OptionalAuth(pub Option<Claims>);

#[async_trait]
impl<S> FromRequestParts<S> for OptionalAuth
where
    S: Send + Sync,
    crate::AppState: axum::extract::FromRef<S>,
{
    type Rejection = (StatusCode, Json<serde_json::Value>);

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let app: crate::AppState = axum::extract::FromRef::from_ref(state);
        let token = extract_bearer(parts);
        if let Some(t) = token {
            if let Ok(claims) = verify_access_token(t, &app.jwt_secret) {
                return Ok(OptionalAuth(Some(claims)));
            }
        }
        Ok(OptionalAuth(None))
    }
}

// ── RequireAuth ───────────────────────────────────────────────────────────────
/// Extractor that requires a valid JWT (any role).
/// Returns 401 if missing or invalid.
pub struct RequireAuth(pub Claims);

#[async_trait]
impl<S> FromRequestParts<S> for RequireAuth
where
    S: Send + Sync,
    crate::AppState: axum::extract::FromRef<S>,
{
    type Rejection = (StatusCode, Json<serde_json::Value>);

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let app: crate::AppState = axum::extract::FromRef::from_ref(state);
        let token = extract_bearer(parts).ok_or((
            StatusCode::UNAUTHORIZED,
            Json(json!({"error": "missing Authorization header"})),
        ))?;
        let claims = verify_access_token(token, &app.jwt_secret).map_err(|_| {
            (
                StatusCode::UNAUTHORIZED,
                Json(json!({"error": "invalid or expired token"})),
            )
        })?;
        Ok(RequireAuth(claims))
    }
}

// ── RequireAdmin ──────────────────────────────────────────────────────────────
/// Extractor that requires a valid JWT with role == "admin".
/// Returns 401 if missing/invalid, 403 if insufficient role.
pub struct RequireAdmin(pub Claims);

#[async_trait]
impl<S> FromRequestParts<S> for RequireAdmin
where
    S: Send + Sync,
    crate::AppState: axum::extract::FromRef<S>,
{
    type Rejection = (StatusCode, Json<serde_json::Value>);

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let app: crate::AppState = axum::extract::FromRef::from_ref(state);
        let token = extract_bearer(parts).ok_or((
            StatusCode::UNAUTHORIZED,
            Json(json!({"error": "missing Authorization header"})),
        ))?;
        let claims = verify_access_token(token, &app.jwt_secret).map_err(|_| {
            (
                StatusCode::UNAUTHORIZED,
                Json(json!({"error": "invalid or expired token"})),
            )
        })?;
        if claims.role != "admin" {
            return Err((
                StatusCode::FORBIDDEN,
                Json(json!({"error": "admin role required"})),
            ));
        }
        Ok(RequireAdmin(claims))
    }
}
