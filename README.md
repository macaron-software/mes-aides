# Mes Aides — French social aid simulator

Free eligibility simulator for French social benefits. Rust core, WASM, SwiftUI, Kotlin. 40 languages.

**Live**: https://aides.macaron-software.com

## Stack

- `core/` — Rust lib: eligibility engine, 71+ aids, datagouv-mcp client, i18n
- `api/` — Rust/Axum backend: `/api/simulate`, `/api/aides`, `/api/pdf`
- `web/` — HTML/CSS/JS vanilla + WASM (no framework)
- `ios/` — SwiftUI + UniFFI Rust bindings
- `android/` — Kotlin + JNI Rust bindings
- `infra/` — Nginx, systemd

## Data source

Live baremes from [data.gouv.fr](https://mcp.data.gouv.fr/mcp) via datagouv-mcp.
Fallback: embedded 2026 baremes.

## Run locally

```bash
# API
cargo run -p aides-api

# Web (any static server)
cd web && python3 -m http.server 8000
```

## Deploy

VPS: `aides.macaron-software.com` — debian@54.36.183.124
Nginx config: `infra/nginx/aides.conf`
Service: `infra/systemd/aides-api.service`

## License

MIT
