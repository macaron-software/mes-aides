# Mes Aides — French social aid simulator

Free eligibility simulator for French social benefits. Covers 28+ official aids (RSA, APL, prime d'activité, AAH…) with verified 2026 baremes.

Full Rust core, WASM, SwiftUI (iOS), Kotlin (Android). 40+ languages.

## Stack

- `core/` — Rust lib: eligibility engine, 28 aids, datagouv-mcp client, i18n
- `api/` — Rust/Axum backend: `/api/simulate`, `/api/aides`, `/api/pdf`
- `web/` — Vanilla HTML/CSS/JS frontend (no framework)
- `ios/` — SwiftUI + UniFFI Rust bindings
- `android/` — Kotlin + JNI Rust bindings
- `infra/` — systemd service unit

## Data source

Live baremes from [data.gouv.fr](https://mcp.data.gouv.fr/mcp) via datagouv-mcp.
Fallback: embedded 2026 baremes (RSA 635.71€, APL, prime d'activité, AAH 1033.32€…).

## Run locally

```bash
# API (default port 3001, override with PORT env var)
cargo run -p aides-api

# Web (any static server)
cd web && python3 -m http.server 8000
```

## Deploy

```bash
# Build static Linux binary
docker build --platform linux/amd64 -t mes-aides .
docker create --name extract mes-aides && docker cp extract:/usr/local/bin/aides-api ./aides-api && docker rm extract

# Configure
export PORT=3001
export CORS_ORIGIN=https://yourdomain.com  # optional, default: open

# Systemd service template
cp infra/systemd/aides-api.service /etc/systemd/system/
systemctl enable --now aides-api
```

## Tests

```bash
cargo test -p aides-core   # 44 unit tests
```

## License

MIT
