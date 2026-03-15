# MES AIDES — CLAUDE.md

## PROJECT

```
Mes Aides: French social benefits simulator (open-source, 100% local, no backend)
URL: aides.macaron-software.com
Stack: Rust core + vanilla HTML/CSS/JS + SwiftUI iOS + Kotlin Android
Privacy: ZERO data collection — all calculations local
```

## ARCHITECTURE

```
core/     Rust lib (cdylib+rlib) — eligibility engine, 71 aids, baremes 2026
api/      Axum :3001 — POST /api/simulate (optional, for API access)
web/      HTML/CSS/JS vanilla — tokens.css DS, feather SVG icons
ios/      SwiftUI + UniFFI → libcore.a
android/  Kotlin + JNI → libcore.so
infra/    nginx static only (no backend required)
docs/     SKILL-*.md + tracability.db (SQLite)
```

## DESIGN TOKENS (tokens.css)

```css
--c-primary: #0B6E4F     /* teal — NOT DSFR blue */
--c-accent:  #D97706     /* orange */
--c-success: #22c55e
--c-warning: #f59e0b
--c-error:   #ef4444
--sp-xs/sm/md/lg/xl: 4/8/16/24/32px
--fs-xs/sm/base/lg/xl: 12/14/16/18/20px
--radius-sm/md/lg: 4/8/12px
font: system-ui stack (0 external deps)
icons: feather style (stroke, round, 2px)
NO EMOJIS anywhere
```

## TRACABILITY DB (docs/tracability.db)

```sql
-- Core tables
personas        -- 6 personas (precaire, senior, jeune, famille, handicap, travailleur)
features        -- 9 features (simulateur, resultats, catalogue, guides, i18n, a11y...)
user_stories    -- 22 stories with as_a/i_want/so_that
acceptance_criteria  -- GIVEN/WHEN/THEN
ihm_screens     -- 10 screens with routes
code_modules    -- 17 modules (rust + js + css)
unit_tests / e2e_tests

-- RBAC
roles           -- anonymous, admin
rbac_rules      -- screen→role→permission
crud_operations -- screen→resource→CRUD

-- Design System
ui_tokens       -- 33 tokens (color, spacing, font, radius, shadow)
ui_components   -- atomic design levels
ux_laws         -- 30 laws from lawsofux.com
a11y_patterns   -- WCAG/ARIA patterns
a11y_checklist  -- per-screen compliance

-- Security
security_controls  -- SOC2/ISO27001 controls
cve_tracking       -- vulnerability tracking

-- i18n
languages       -- 40 languages target incl RTL
i18n_keys       -- translation keys
```

## SKILLS (docs/SKILL-*.md)

| Skill | Content |
|-------|---------|
| SKILL-UX.md | 30 UX laws from lawsofux.com |
| SKILL-UI.md | 60 components, design tokens, atomic design |
| SKILL-A11Y.md | WCAG 2.2, 30 ARIA patterns, keyboard nav |
| SKILL-SECURITY.md | 25 SecureByDesign controls, OWASP Top 10 |

## AIDS ENGINE (core/)

```rust
// core/src/engine/simulator.rs
pub struct Simulator { baremes: Baremes2026 }
impl Simulator {
    pub fn simulate(&self, situation: &Situation) -> SimulationResult
}

// Situation fields
struct Situation {
    age: u8,
    revenus_mensuels: f64,
    composition_familiale: FamilleType,
    logement: LogementType,
    handicap_taux: Option<u8>,
    // ... 20+ fields
}

// Result sorted by amount desc
struct SimulationResult {
    aides: Vec<AideEligible>,
    total_mensuel: f64,
}
```

## IMPLEMENTED AIDS (28)

```
RSA, Prime d'Activité, ASS, ARE, APL, ALS, Visale, MaPrimeRénov',
AAH, MVA, PCH, AEEH, ASI, Pension Invalidité, CSS,
Allocations Familiales, Complément Familial, PAJE, ASF, ARS,
Chèque Énergie, ASPA, MICO, CEJ, Bourse CROUS, Pass Culture,
Prime de Noël, Aide Juridictionnelle
```

## SCREENS (IHM)

| Route | File | Stories |
|-------|------|---------|
| / | index.html | — |
| /simulateur | simulateur.html | US001-US007 |
| /resultats | resultats.html | US010-US015 |
| /aides | aides.html | US020-US023 |
| /guides | guides.html | — |
| /accessibilite | accessibilite.html | US040-US042 |

## A11Y REQUIREMENTS

```
WCAG 2.2 AA target
- All interactive keyboard accessible
- Focus visible on all elements
- Color contrast ≥4.5:1 text, ≥3:1 UI
- Touch targets ≥44x44px
- Skip links
- Form labels associated
- Error messages programmatically associated
- lang="fr" + RTL support (ar, he)
```

## SECURITY PROFILE

```
Tier: LOW (static site, no backend for web)
Controls applied: SBD-01, SBD-03, SBD-09, SBD-14
CSP: default-src 'self'; script-src 'self'; object-src 'none'
Headers: X-Frame-Options DENY, X-Content-Type-Options nosniff
Data: ZERO collection, all local
```

## i18n (40 LANGUAGES TARGET)

```
Done:    fr (100%), en (100%)
Started: ar (80%), es (90%), de (85%), it (85%), pt (85%)
RTL:     ar, he, fa
```

## COMMANDS

```bash
# Dev
cd web && python3 -m http.server 8000   # static server
cargo test -p aides-core                # unit tests

# Build
cargo build --release -p aides-core     # Rust lib
cargo build --release -p aides-api      # API server

# Deploy (static)
rsync -avz web/ debian@OVH_IP:/var/www/aides/
```

## RULES

- NO emojis (code, docs, UI)
- NO external fonts (system-ui only)
- NO analytics/trackers
- NO competitor URLs in code/docs
- SVG icons: feather style only
- Primary color: teal #0B6E4F (NOT DSFR blue)
