# Copilot Instructions — aides-macaron

READ: CLAUDE.md, .ai/ARCHITECTURE.md, .ai/PLANS.md, .ai/DECISIONS.md

## Project
Fr social benefits simulator. 100% local, zero data collection.
URL: aides.macaron-software.com
Target: 71 aids, baremes 2026 embedded.

## Stack
- **core/** Rust lib (cdylib+rlib+wasm) — eligibility engine, 71 aids
- **api/** Axum :3001 — POST /api/simulate (optional)
- **web/** Vanilla HTML/CSS/JS — tokens.css DS, feather SVG icons, WASM
- **ios/** SwiftUI + UniFFI → libcore.a
- **android/** Kotlin + JNI → libcore.so
- **infra/** nginx static-only

## Architecture
```
Simulator::simulate(situation: &Situation) -> SimulationResult
  Situation: age, revenus_mensuels, composition_familiale, logement, handicap_taux, nb_enfants, ages_enfants
  Result: aides_eligibles[], total_mensuel, total_annuel, calcule_le, version_baremes
  Sorted: montant_mensuel desc
```

Core modules:
- `core/src/engine/simulator.rs` — Simulator::simulate()
- `core/src/engine/rules.rs` — Baremes 2026, calc_* per aid
- `core/src/aides/catalog.rs` — 71 aids defs
- `core/src/aides/types.rs` — AideId, Categorie, AideResult
- `core/src/engine/types.rs` — Situation, SimulationResult
- `core/src/ffi/mod.rs` — UniFFI/JNI bindings
- `core/src/wasm_bindings.rs` — wasm-bindgen exports

Data: Situation struct → Rust calc → SimulationResult (sorted desc)

## Commands
```bash
# Dev
cargo test -p aides-core
cd web && python3 -m http.server 8000

# Build
cargo build --release -p aides-core
cargo build --release -p aides-api

# Deploy (static)
rsync -avz web/ debian@OVH_IP:/var/www/aides/
```

## Invariants
1. Zero data leaves browser — all calc local
2. Simulator::simulate() is pure — no side effects
3. Results sorted by montant_mensuel desc
4. Baremes versioned + embedded — never fetched at runtime
5. No ext fonts (system-ui only) or analytics deps
6. All interactive elems keyboard accessible (WCAG 2.2 AA)
7. RTL: ar, he fully supported
8. GDPR: zero personal data collected, no consent needed
9. RTO 15min (static redeploy), RPO 0 (no user data)

## Forbidden
- emojis in code/docs/UI (use feather SVG icons)
- ext font deps (system-ui only)
- DSFR blue (#0055D3) as primary color — use teal #0B6E4F
- non-feather SVG icons
- console.log or data exfil
- analytics/tracking/cookies
- baremes fetched at runtime (embed in Rust)
- competitor URLs in code/docs

## Active Milestones
- **S2:** Web UI + i18n — landing, 5-step wizard, results, tokens.css, fr/en (100%), ar (80%), es/de/it/pt (85%), RTL ar+he
- **S3:** 71 aids + Datagouv — all aids impl, datagouv MCP client, PDF gen, 40 langs
- **S4:** iOS App — SwiftUI + UniFFI, libcore.a, App Store
- **S5:** Android App — Kotlin + JNI, libcore.so, Play Store

Completed: S1 foundation (28 aids, Axum API, nginx, systemd, WASM).

Metrics: 28/71 aids impl, ~50KB gzip, ~2300 Rust LOC, ~2000 JS LOC.

## Key Decisions
- **AD-001:** Rust as single source of truth (web WASM + iOS UniFFI + Android JNI)
- **AD-002:** 100% local computation — privacy-first, no GDPR burden, no backend attack surface
- **AD-003:** Static site first — simplicity, hosting cost, offline-capable
- **AD-004:** Vanilla JS — no build step, no bundle bloat, SEO-friendly
- **AD-005:** CSS custom props — no Sass/Tailwind, native, runtime theming
- **AD-006:** Teal primary #0B6E4F — brand differentiation, accessibility contrast
- **AD-007:** Feather SVG icons — stroke, round linecap/join, 2px width
- **AD-008:** No ext fonts — system-ui stack only (privacy, perf, no CDN)
- **AD-009:** Baremes embedded in Rust — offline capable, deterministic, no runtime fetch
- **AD-010:** WCAG 2.2 AA — inclusivity, RGAA legal req France, RTL, keyboard, screen reader

## Design Tokens (web/css/tokens.css)
```
--c-primary: #0B6E4F  (teal)
--c-accent: #D97706   (orange)
--font: system-ui      (0 ext deps)
```

## Security (Tier: LOW)
- CSP: default-src 'self'; script-src 'self'; object-src 'none'
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- No cookies (UI prefs only localStorage)
- Zero data collected
