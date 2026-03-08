use anyhow::{Context, Result};
use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use rusqlite::{params, Connection};
use std::sync::{Arc, Mutex};
use uuid::Uuid;

pub type DbPool = Arc<Mutex<Connection>>;

// ── Models ─────────────────────────────────────────────────────────────────────

#[derive(Debug, Clone)]
pub struct User {
    pub id: String,
    pub email: String,
    pub password_hash: String,
    pub role: String, // "user" | "admin"
    pub active: bool,
    pub created_at: String,
}

// ── Init ───────────────────────────────────────────────────────────────────────

pub fn init_db(path: &str) -> Result<DbPool> {
    let conn = Connection::open(path).context("open sqlite")?;
    conn.execute_batch(
        r#"
        PRAGMA journal_mode=WAL;
        PRAGMA foreign_keys=ON;

        CREATE TABLE IF NOT EXISTS users (
            id           TEXT PRIMARY KEY,
            email        TEXT UNIQUE NOT NULL COLLATE NOCASE,
            password_hash TEXT NOT NULL,
            role         TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user','admin')),
            active       INTEGER NOT NULL DEFAULT 1,
            created_at   TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS refresh_tokens (
            token       TEXT PRIMARY KEY,
            user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            expires_at  TEXT NOT NULL,
            revoked     INTEGER NOT NULL DEFAULT 0,
            created_at  TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE INDEX IF NOT EXISTS idx_rt_user    ON refresh_tokens(user_id);
        CREATE INDEX IF NOT EXISTS idx_rt_expires ON refresh_tokens(expires_at);
        "#,
    )
    .context("schema init")?;
    Ok(Arc::new(Mutex::new(conn)))
}

// ── Password helpers ───────────────────────────────────────────────────────────

pub fn hash_password(password: &str) -> Result<String> {
    let salt = SaltString::generate(&mut OsRng);
    let hash = Argon2::default()
        .hash_password(password.as_bytes(), &salt)
        .map_err(|e| anyhow::anyhow!("hash error: {e}"))?
        .to_string();
    Ok(hash)
}

pub fn verify_password(password: &str, hash: &str) -> bool {
    let Ok(parsed) = PasswordHash::new(hash) else {
        return false;
    };
    Argon2::default()
        .verify_password(password.as_bytes(), &parsed)
        .is_ok()
}

// ── User CRUD ──────────────────────────────────────────────────────────────────

pub fn user_count(pool: &DbPool) -> Result<i64> {
    let conn = pool.lock().unwrap();
    let n: i64 = conn.query_row("SELECT COUNT(*) FROM users", [], |r| r.get(0))?;
    Ok(n)
}

pub fn find_user_by_email(pool: &DbPool, email: &str) -> Result<Option<User>> {
    let conn = pool.lock().unwrap();
    let mut stmt = conn.prepare(
        "SELECT id,email,password_hash,role,active,created_at FROM users WHERE email=?1 COLLATE NOCASE",
    )?;
    let mut rows = stmt.query(params![email])?;
    if let Some(row) = rows.next()? {
        return Ok(Some(User {
            id: row.get(0)?,
            email: row.get(1)?,
            password_hash: row.get(2)?,
            role: row.get(3)?,
            active: row.get::<_, i32>(4)? != 0,
            created_at: row.get(5)?,
        }));
    }
    Ok(None)
}

pub fn find_user_by_id(pool: &DbPool, id: &str) -> Result<Option<User>> {
    let conn = pool.lock().unwrap();
    let mut stmt = conn.prepare(
        "SELECT id,email,password_hash,role,active,created_at FROM users WHERE id=?1",
    )?;
    let mut rows = stmt.query(params![id])?;
    if let Some(row) = rows.next()? {
        return Ok(Some(User {
            id: row.get(0)?,
            email: row.get(1)?,
            password_hash: row.get(2)?,
            role: row.get(3)?,
            active: row.get::<_, i32>(4)? != 0,
            created_at: row.get(5)?,
        }));
    }
    Ok(None)
}

pub fn list_users(pool: &DbPool) -> Result<Vec<User>> {
    let conn = pool.lock().unwrap();
    let mut stmt = conn.prepare(
        "SELECT id,email,password_hash,role,active,created_at FROM users ORDER BY created_at DESC",
    )?;
    let users = stmt
        .query_map([], |row| {
            Ok(User {
                id: row.get(0)?,
                email: row.get(1)?,
                password_hash: row.get(2)?,
                role: row.get(3)?,
                active: row.get::<_, i32>(4)? != 0,
                created_at: row.get(5)?,
            })
        })?
        .collect::<rusqlite::Result<Vec<_>>>()?;
    Ok(users)
}

pub fn create_user(pool: &DbPool, email: &str, password: &str, role: &str) -> Result<User> {
    let id = Uuid::new_v4().to_string();
    let hash = hash_password(password)?;
    let conn = pool.lock().unwrap();
    conn.execute(
        "INSERT INTO users (id,email,password_hash,role) VALUES (?1,?2,?3,?4)",
        params![id, email, hash, role],
    )?;
    let created_at: String =
        conn.query_row("SELECT created_at FROM users WHERE id=?1", params![id], |r| {
            r.get(0)
        })?;
    Ok(User {
        id,
        email: email.to_string(),
        password_hash: hash,
        role: role.to_string(),
        active: true,
        created_at,
    })
}

pub fn delete_user(pool: &DbPool, id: &str) -> Result<bool> {
    let conn = pool.lock().unwrap();
    let n = conn.execute("DELETE FROM users WHERE id=?1", params![id])?;
    Ok(n > 0)
}

pub fn set_user_active(pool: &DbPool, id: &str, active: bool) -> Result<bool> {
    let conn = pool.lock().unwrap();
    let n = conn.execute(
        "UPDATE users SET active=?1 WHERE id=?2",
        params![active as i32, id],
    )?;
    Ok(n > 0)
}

// ── Refresh tokens ─────────────────────────────────────────────────────────────

pub fn store_refresh_token(pool: &DbPool, token: &str, user_id: &str, expires_at: &str) -> Result<()> {
    let conn = pool.lock().unwrap();
    conn.execute(
        "INSERT INTO refresh_tokens (token,user_id,expires_at) VALUES (?1,?2,?3)",
        params![token, user_id, expires_at],
    )?;
    Ok(())
}

pub fn find_refresh_token(pool: &DbPool, token: &str) -> Result<Option<(String, String, bool)>> {
    let conn = pool.lock().unwrap();
    let mut stmt = conn.prepare(
        "SELECT user_id,expires_at,revoked FROM refresh_tokens WHERE token=?1",
    )?;
    let mut rows = stmt.query(params![token])?;
    if let Some(row) = rows.next()? {
        let revoked: i32 = row.get(2)?;
        return Ok(Some((row.get(0)?, row.get(1)?, revoked != 0)));
    }
    Ok(None)
}

pub fn revoke_refresh_token(pool: &DbPool, token: &str) -> Result<()> {
    let conn = pool.lock().unwrap();
    conn.execute(
        "UPDATE refresh_tokens SET revoked=1 WHERE token=?1",
        params![token],
    )?;
    Ok(())
}

pub fn revoke_all_user_tokens(pool: &DbPool, user_id: &str) -> Result<()> {
    let conn = pool.lock().unwrap();
    conn.execute(
        "UPDATE refresh_tokens SET revoked=1 WHERE user_id=?1",
        params![user_id],
    )?;
    Ok(())
}

/// Purge expired tokens (call periodically)
pub fn purge_expired_tokens(pool: &DbPool) -> Result<usize> {
    let conn = pool.lock().unwrap();
    let n = conn.execute(
        "DELETE FROM refresh_tokens WHERE expires_at < datetime('now')",
        [],
    )?;
    Ok(n)
}
