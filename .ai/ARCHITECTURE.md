# Mes Aides — Architecture

## Stack

| Layer | Tech | Role |
|-------|------|------|
| Core | Rust (cdylib+rlib+wasm) | Eligibility calc, 71 aids, baremes 2026 |
| API | Axum (:3001) | Optional REST for native apps |
| Web | Vanilla HTML/CSS/JS | Static, runs in-browser (WASM) |
| iOS | SwiftUI + UniFFI | libcore.a |
| Android | Kotlin + JNI | libcore.so |
| Hosting | nginx | Static only |

## Data Model

```
Situation { age, revenus_mensuels, composition_familiale, logement, handicap_taux, nb_enfants, ages_enfants, ... }
SimulationResult { aides_eligibles[], aides_ineligibles[], total_mensuel, total_annuel, calcule_le, version_baremes }
AideResult { aide_id, nom, montant_mensuel, periodicite, raisons[], url_demande }
```

## Core Modules

- `core/src/engine/simulator.rs` — Simulator::simulate()
- `core/src/engine/rules.rs` — Baremes 2026, calc_* per aid
- `core/src/aides/catalog.rs` — 71 aids defs
- `core/src/aides/types.rs` — AideId, Categorie, AideResult
- `core/src/engine/types.rs` — Situation, SimulationResult
- `core/src/ffi/mod.rs` — UniFFI/JNI bindings
- `core/src/wasm_bindings.rs` — wasm-bindgen exports

## Design Tokens (web/css/tokens.css)

```css
--c-primary: #0B6E4F  /* teal — NOT DSFR blue */
--c-accent: #D97706   /* orange */
--font: system-ui     /* 0 ext deps */
```

## Invariants

1. Zero data leaves browser — all calc local
2. Simulator::simulate() is pure — no side effects
3. Results sorted by monthly amt desc
4. Baremes versioned + embedded — never fetched at runtime
5. No ext fonts or analytics deps
6. All interactive elems keyboard accessible
7. RTL: ar, he fully supported

## Security (Tier: LOW — static site)

| Control | Status |
|---------|--------|
| CSP | strict: default-src 'self'; script-src 'self'; object-src 'none' |
| X-Frame-Options | DENY |
| X-Content-Type-Options | nosniff |
| No cookies | UI prefs only in localStorage |
| No tracking | Zero data collected |

## Compliance

- GDPR: zero personal data collected — no consent needed, no DPO required
- CNIL: no cookie banner (no cookies)
- RGPD Art. 5: lawfulness, purpose limitation, data minimization — all satisfied
- SOC2: Security ✅, Availability ✅, Privacy ✅ (by design)

## Resilience (DR)

| Metric | Target |
|--------|--------|
| RTO | 15 min (static files, redeploy from git) |
| RPO | 0 (no user data stored) |

Failover: GitHub Pages / Cloudflare Pages / Netlify (5-10 min setup)

## Observability

Web Vitals (privacy-safe, no PII):
- LCP <2.5s, FID <100ms, CLS <0.1, TTFB <800ms
- Aggregate only: wizard_step, wizard_complete, wizard_abandon

NOT collected: IP, UA, query params, user IDs, sessions

## Accessibility (WCAG 2.2 AA)

- Keyboard: all interactive elems accessible, focus visible
- Contrast: ≥4.5:1 text, ≥3:1 UI components
- Touch: ≥44x44px min
- Skip links, form labels, error association
- lang="fr" + RTL: ar, he

## Forbidden Patterns

- console.log or data exfil
- External font <link> (use system-ui)
- Emoji in code/docs/UI
- Competitor URLs in code/docs
- Non-feather SVG icons
- DSFR blue (#0055D3) as primary
- Baremes fetched at runtime
- Fetching baremes at runtime instead of embedding in Rust
