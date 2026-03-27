# aides-macaron — Agent Collaboration

## PROJECT
Fr social benefits simulator. 100% local computation, zero data collection. Target: aides.macaron-software.com

## STACK
- Rust core lib (cdylib+rlib+wasm) — eligibility engine, 71 aids, 2026 baremes
- Axum API srv on port 3001
- Vanilla HTML/CSS/JS web frontend with design tokens
- SwiftUI iOS via UniFFI
- Kotlin Android via JNI
- nginx static-only hosting

## ARCHITECTURE
Rust core = single source of truth for benefit calc. Web version runs entirely in-browser (WASM). Thin Axum API srv = optional for SSR or native app backends.

Simulator accepts Situation struct (age, income, family composition, housing, disability status, etc.) and returns SimulationResult sorted by monthly amt desc.

## DESIGN SYS
CSS custom props only, defined in web/css/tokens.css. Primary teal #0B6E4F. No ext fonts (system-ui stack). Icons: feather SVG style. No emojis anywhere.

## ACCESSIBILITY
WCAG 2.2 AA required. All interactive elems keyboard accessible with visible focus. Contrast ≥4.5:1 text, ≥3:1 UI. Touch targets min 44x44px. RTL langs: ar, he.

## SECURITY
Static site = no backend attack surface. Controls: CSP strict, X-Frame DENY, X-Content-Type nosniff. No analytics, no tracking, no data leaves browser.

## WORKING WITH CODEBASE
- Rust code: core/src/
- Web assets: web/
- API srv: api/src/
- All 71 aids: core/src/aides/ + rules in core/src/engine/rules.rs
- Baremes 2026 embedded in Rust, not fetched at runtime
- Tests: cargo test -p aides-core

## KEY CONSTRAINTS
- Never emoji in code, docs, or UI
- Never ext font deps
- Never analytics or tracking code
- Icons: feather SVG style
- Primary color: teal, not DSFR blue
