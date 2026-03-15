# Mes Aides — Copilot Instructions

## PROJECT

```
Type: Social benefits simulator (French aids)
Privacy: 100% local, zero data transmission
Stack: Rust core + vanilla HTML/CSS/JS + SwiftUI + Kotlin
URL: aides.macaron-software.com
```

## STRUCTURE

```
core/     Rust lib (cdylib+rlib) — 28 aids impl, baremes 2026
api/      Axum :3001 — POST /api/simulate, GET /api/aides, POST /api/pdf
web/      HTML/CSS/JS vanilla — tokens.css DS, feather icons
ios/      SwiftUI + UniFFI
android/  Kotlin + JNI
docs/     SKILL-*.md, openapi.yaml, tracability.db
```

## TOKENS (css/tokens.css)

```
Primary: #0B6E4F (teal, NOT DSFR blue)
Accent:  #D97706 (orange)
Font:    system-ui (0 external fonts)
Spacing: 4/8/16/24/32px (xs-xl)
Radius:  4/8/12px (sm-lg)
```

## RULES

- NO emojis (code, docs, UI)
- NO external fonts/analytics/trackers
- NO competitor URLs
- SVG icons: feather style (stroke, round, 2px)
- All calcs local — WASM or native engine
- A11Y: WCAG 2.2 AA, keyboard nav, 4.5:1 contrast
- i18n: 50 locales, RTL support (ar, he, fa)

## AIDS ENGINE

```rust
Simulator::new().simulate(&Situation) -> SimulationResult
// 28 aids: RSA, APL, AAH, Prime Activité, Chèque Énergie...
// Baremes 2026 embedded, live update via datagouv MCP
```

## COMMANDS

```bash
# Web dev
cd web && python3 -m http.server 8000

# Rust build
cargo build --release -p aides-core
cargo build --release -p aides-api

# Tests
cargo test -p aides-core

# Deploy static
rsync -avz web/ debian@OVH_IP:/var/www/aides/
```

## DOCS (docs/)

| File | Content |
|------|---------|
| SKILL-UX.md | 30 UX laws |
| SKILL-UI.md | 60 components + tokens |
| SKILL-A11Y.md | WCAG + 30 ARIA patterns |
| SKILL-SECURITY.md | 25 SecureByDesign controls |
| SKILL-UI-SKELETON.md | Skeleton + placeholder system |
| openapi.yaml | API spec v1.0 |
| tracability.db | SQLite: personas/features/stories/tests |
| GDPR-LIFECYCLE.md | Data policy (no collection) |
| DR-PLAN.md | RTO 15min, RPO 0 |
| AUDIT-LEAN.md | Dependency audit |
| AUDIT-PATTERNS.md | Architecture patterns |
| AUDIT-SECURITY.md | CVE scan results |

## TRACABILITY DB

```sql
-- Query personas
SELECT * FROM personas;

-- Query features with stories
SELECT f.code, f.title, COUNT(us.udid) as stories
FROM features f
LEFT JOIN user_stories us ON us.feature_udid = f.udid
GROUP BY f.udid;

-- Coverage matrix
SELECT * FROM v_traceability_matrix;
```

## SECURITY

- Tier: LOW (static site, no backend for web)
- No cookies, no sessions, no accounts
- CSP: default-src 'self'
- Headers: X-Frame-Options DENY, nosniff
- cargo audit: 0 critical/high (2 low warnings in build deps)

## WHEN EDITING

1. Check SKILL-*.md for guidelines
2. Respect tokens.css values
3. Maintain a11y (keyboard, ARIA, contrast)
4. Test with RTL (ar locale)
5. No new npm/external deps without discussion
