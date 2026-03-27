# Mes Aides — CLAUDE.md

## PROJECT
Fr social benefits simulator. 100% local, zero data collection. URL: aides.macaron-software.com

## STACK
- **core/** Rust lib (cdylib+rlib+wasm) — eligibility engine, 71 aids, baremes 2026
- **api/** Axum :3001 — POST /api/simulate (optional)
- **web/** Vanilla HTML/CSS/JS — tokens.css DS, feather SVG icons
- **ios/** SwiftUI + UniFFI → libcore.a
- **android/** Kotlin + JNI → libcore.so
- **infra/** nginx static-only

## AIDS ENGINE (core/)
```
Simulator::simulate(situation: &Situation) -> SimulationResult
Result sorted by montant_mensuel desc
Situation: age, revenus_mensuels, composition_familiale, logement, handicap_taux, ...
```
Impl: 28 aids (RSA, PA, ARE, ASS, APL, ALS, AAH, PCH, CEJ, etc.)
Target: 71 aids

## DESIGN TOKENS (web/css/tokens.css)
```
--c-primary: #0B6E4F  /* teal — NOT DSFR blue */
--c-accent: #D97706   /* orange */
font: system-ui (0 ext deps)
icons: feather style (stroke, round, 2px)
NO EMOJIS
```

## A11Y
WCAG 2.2 AA target
- keyboard accessible, focus visible
- contrast ≥4.5:1 text, ≥3:1 UI
- touch targets ≥44x44px
- skip links, form labels, error association
- lang="fr" + RTL support (ar, he)

## SECURITY
Tier: LOW (static site, no backend for web)
CSP: default-src 'self'; script-src 'self'; object-src 'none'
Headers: X-Frame-Options DENY, X-Content-Type-Options nosniff
ZERO data collection

## i18n
Done: fr (100%), en (100%)
Started: ar (80%), es, de, it, pt (85%)
RTL: ar, he

## COMMANDS
```bash
# Dev
cd web && python3 -m http.server 8000
cargo test -p aides-core

# Build
cargo build --release -p aides-core
cargo build --release -p aides-api

# Deploy (static)
rsync -avz web/ debian@OVH_IP:/var/www/aides/
```

## RULES
- NO emojis (code, docs, UI)
- NO ext fonts (system-ui only)
- NO analytics/trackers
- NO competitor URLs in code/docs
- SVG icons: feather style only
- Primary color: teal #0B6E4F (NOT DSFR blue)

@.ai/ARCHITECTURE.md
@.ai/PLANS.md
