# Aida — Social Benefit Eligibility + Intervenant Coordination

## Identity
| Field | Value |
|-------|-------|
| App | Aida / MesAides |
| Dir | _HELP/aides-macaron |
| Brand | #1565C0 (deep blue) |
| Domain | aides.macaron-software.com |
| Platform | iOS + Android + Web (SvelteKit) |
| Stack | Rust (core + WASM) + SvelteKit + SwiftUI + Kotlin |
| Status | Greenfield (28/71 aids implemented) |
| Privacy | GDPR Tier 3 (precarious data) |

## Purpose
Evidence-based eligibility checker for vulnerable populations. Local-first: zero data collection, 100% device computation. Intervenant coordination for social workers + volunteers.

## Language & A11y
- i18n: 47 locales (FR primary)
- RTL: ar, he (RTL via Svelte i18n)
- Flesch-Kincaid ≤60 (plain language, mandatory)
- WCAG 2.2 AA (a11y, focus, contrast ≥4.5:1 text, ≥3:1 UI)

## Data Architecture

### Core Engine (Rust, WASM)
- File: `aida-core/src/simulator.rs`
- Method: `simulate(situation: &Situation) -> Vec<Eligibility>`
- Amounts: cents only (u64), never float
- Baremes: embedded in binary (2026 CAF/CPAM/ANAH rates)
- Binary format: CBOR in `data/baremes.bin` (256KB, ~2000 values)

### Data Pipeline
```
1. scrape_aids_fr.py          → data/aids_fr.json (71 aids, metadata)
2. Rust build script           → embed baremes in binary
3. WASM compilation           → browser-only computation
4. HTML pages generated       → per-country, per-aid
```

### JSON Schema (aids_fr.json)
```json
{
  "id": "apl_caf",
  "name": "Aide Personnalisée au Logement",
  "category": "housing | income | health | disability | family | transport | regional | departmental | municipal",
  "source": "CAF | CPAM | ANAH | SNCF | Regional | City",
  "slug": "apl",
  "url": "/fr/aides/apl",
  "min_age": 18,
  "requires": ["revenus", "logement"],
  "depends_on": [],
  "max_income_2024": 15000,
  "monthly_max": 50000,
  "notes": "..."
}
```

### Scraper Architecture
- **File**: `scripts/scrape_aids_fr.py` (Python, httpx, BeautifulSoup)
- **Sources** (priority order):
  1. service-public.fr (national)
  2. data.gouv.fr (datasets)
  3. CAF API (income limits)
  4. Regional/Departmental dossier (13 regions + 96 depts)
  5. City/CCAS (500+ municipalities)
  6. Transport APIs (Navigo, SNCF, TER regional)
- **Rate limit**: 1 req/sec (no hammer)
- **Cron**: Daily 3am (`0 3 * * * scripts/cron_update.sh`)
- **Error handling**: Keep last known on fail (resilient)
- **Output**: `data/aids_fr.json` (71 aids, source metadata)

## Benefits Data

### Implemented (28/71)
| Category | Count | Examples |
|----------|-------|----------|
| Income | 4 | RSA, ARE, ASS, Prime d'activité |
| Housing | 3 | APL, ALS, Allocation logement |
| Disability | 3 | AAH, PCH, MDPH |
| Health | 4 | CMU-C, ACS, AMELI |
| Family | 3 | Allocation naissance, parental, jeune enfant |
| Energy | 2 | Chauffage, Isolation (ANAH) |
| Transport | 2 | Navigo Solidarité, SNCF Solidarité |
| Regional | 2 | Varies by région |
| Departmental | 1 | FSL (Fonds Solidarité Logement) |

### Pending (43/71)
- Municipal benefits (Paris, Lyon, Marseille, Bordeaux, Toulouse, Nantes, etc.)
- Transport: TCL, Tisseo, TER per region
- Micro-credit (BPI)
- Additional healthcare benefits (SAMU-15 hotlines by region)

## EU Expansion (30 countries, 2-tier rollout)

### Tier 1 (Implemented 2026-Q2)
- **Core**: FR (100%), DE (80%), ES (75%), IT (70%), PT (65%), BE (80%), NL (75%)
- **Nordic**: SE, DK, FI, NO (85% each)
- **Central/East**: AT, CH, PL (70% each)
- **UK**: 60%
- File structure: `data/aids_{cc}.json` (per-country, same schema as `aids_fr.json`)

### Tier 2 (Scaffolded, pre-2026-Q3)
- RO, CZ, HU, SK, GR, HR, LT, LV, EE, CY, LU, MT, IE, SI

### Welfare Model Mapping
| Model | Countries | Benefit Types |
|-------|-----------|---------------|
| Bismarckian | DE AT CH | Employment-based, social insurance |
| Nordic | SE DK FI NO | Universal, generous, tax-funded |
| Liberal | UK IE | Means-tested, selective |
| Mediterranean | IT ES PT GR | Family-oriented, fragmented |
| Central-European | PL CZ HU | Transitional, EU harmonization |

### Country File Format
```
core/src/countries/de.rs       # Rust stubs per country
data/aids_de.json              # German benefits
web/aides/europe/de.html       # HTML page (generated)
```

## Roles & Access

| Role | Access | Use Case |
|------|--------|----------|
| beneficiary | Self check, aid catalog | "Am I eligible?" |
| intervenant | Beneficiary interventions, planning | Social worker, case management |
| volunteer | Matching to beneficiaries, skills | Volunteer coordination |
| coordinator | Assignment, reassignment, incidents | Admin, dispatch |
| admin | Full access, settings, audit log | System admin |

## Features

| Feature | Status | Notes |
|---------|--------|-------|
| Eligibility calculator | ✓ Done | Local WASM, zero network |
| Aid catalog | ✓ Done | 28 implemented + metadata |
| Questionnaire | ✓ Done | Adaptive, i18n |
| Results page | ✓ Done | Slug-based URLs, structured data |
| Intervention planning | Pending | Intervenant + beneficiary workflow |
| Volunteer matching | Pending | Skills-based pairing |
| Unsafe visit flag | Pending | Protocol PDF + admin alert |
| Intervenant absent | Pending | Auto-reassign + notify |

## Incident Flows

| Incident | UI Response | Severity |
|----------|-------------|----------|
| Intervenant absent | Auto-reassign + notify beneficiary | High |
| Unsafe visit flag | Protocol PDF + admin alert | Critical |
| High urgency | Coordinator immediate push | Critical |
| Eligibility expired | Reminder + recalc CTA | Medium |

## Privacy & Security

| Rule | Implementation |
|------|----------------|
| Zero data collection | No network for personal data |
| Local computation | 100% device-side WASM |
| No analytics | Zero telemetry, no tracking pixels |
| No personal data leaves device | Encrypted local storage only |
| Static site | Minimal attack surface, CSP strict |
| GDPR compliant | Tier 3 regulated data (precarious) |
| Legal disclaimer | Mandatory on all results |
| CSP Headers | `default-src 'self'`, `script-src 'self'` |
| X-Frame-Options | DENY |
| X-Content-Type-Options | nosniff |

## Onboarding Flow

1. **Language** — 47 locales, auto-detect OS
2. **Country** — FR complete, others scaffolded
3. **Role** — beneficiary / intervenant / volunteer / coordinator
4. **Questionnaire** → Eligibility Engine calculates
5. **Results** — Eligible aids + official sources cited

## SEO & Discoverability

| Aspect | Implementation |
|--------|-----------------|
| URLs | `/fr/aides/{slug}` (slug = aid ID) |
| Sitemap | Auto-generated per country |
| Structured data | JSON-LD aids schema + FAQPage |
| Meta tags | `og:title`, `og:description`, `og:image` |
| Indexing | Google OK (no robots.txt block) |
| Canonical | `<link rel="canonical" href="...">` |
| Alt text | All images (accessibility + SEO) |

## Tech Stack

| Layer | Tech |
|-------|------|
| Core | Rust (cdylib+rlib+wasm) |
| WASM | `wasm32-unknown-unknown` target |
| Web | SvelteKit 5 + static adapter + svelte-i18n |
| iOS | SwiftUI + LifeDS + UniFFI |
| Android | Kotlin + Compose + Material 3 + JNI |
| API (optional) | Axum :3001 (intervention coordination) |
| Icons | Lucide (web) + SF Symbols (iOS) + Material (Android) |
| Colors | Aida brand #1565C0 (deep blue) |

## Build & Deploy

```bash
# Core
cd aida-core && cargo test --workspace
cd aida-core && wasm-pack build --target web --release

# Web
cd web && npm run build  # static HTML output

# iOS
cd ios && xcodebuild build -scheme Aida \
  -destination 'platform=iOS Simulator,name=iPhone 16 Pro' \
  CODE_SIGN_IDENTITY="" CODE_SIGNING_REQUIRED=NO

# Cron scraper (daily 3am)
0 3 * * * /path/to/scripts/cron_update.sh

# Deploy
rsync -avz web/dist/ debian@aides.macaron-software.com:/var/www/aides/
```

## Forbidden
- Emoji (Lucide / SF Symbols / Material Icons only)
- Float for money (cents u64 only)
- Hardcoded strings (i18n keys only)
- Personalized medical advice (always: "contact your local CAF")
- Analytics / tracking pixels
- `test.skip()` / `test.fixme()`
- Network calls for personal data
- Unverified aid amounts (all from official sources)
