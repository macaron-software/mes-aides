# Aida (MesAides) — CLAUDE.md

## PROJECT
Social benefit eligibility checker. 100% local, zero data collection. Domain: aides.macaron-software.com. 28/71 aids implemented. EU expansion (30 countries) rolling out 2026-Q2.

## STACK
- **aida-core/** Rust lib (cdylib+rlib+wasm) — Simulator engine, 71 aids, baremes 2026
- **api/** Axum :3001 — (optional) POST /api/simulate, intervenant coordination
- **web/** SvelteKit static adapter — i18n (47 locales), Lucide icons
- **ios/** SwiftUI + LifeDS + UniFFI → libcore.a
- **android/** Kotlin Compose + Material 3 + JNI → libcore.so
- **infra/** Nginx static-only, CSP strict

## SCRAPER
- **File**: `scripts/scrape_aids_fr.py` (Python, httpx, BeautifulSoup)
- **Output**: `data/aids_fr.json` (71 aids + source metadata)
- **Sources** (priority): service-public.fr → data.gouv.fr → CAF API → regional/dept/city
- **Rate limit**: 1 req/sec (no hammer)
- **Cron**: `0 3 * * * scripts/cron_update.sh` (daily 3am)
- **Error handling**: Keep last known on fail (resilient scraper)
- **Schema**: `{id, name, category, source, slug, url, min_age, requires, max_income_2024, monthly_max, notes}`

## DATA PIPELINE
```
1. scrape_aids_fr.py          → data/aids_fr.json
2. Rust build script          → embed baremes in CBOR binary (256KB, ~2000 values)
3. wasm-pack build            → browser-only WASM (zero network)
4. SvelteKit generator        → HTML pages per aid (/fr/aides/{slug})
5. nginx static               → serve all pages (SEO-friendly)
```

## AIDS ENGINE (aida-core/)
```
pub struct Situation {
    age: u8,
    revenus_mensuels: u64,  // cents
    composition_familiale: FamilyComposition,
    logement: LogementType,
    handicap_taux: Option<u8>,
    ...
}
pub fn simulate(situation: &Situation) -> Vec<Eligibility>
```
- Returns sorted by `montant_mensuel_max DESC`
- Baremes embedded in Rust binary (CAF 2026 rates)
- All amounts: cents (u64), never float
- Evidence-based: all from official sources (CAF, CPAM, ANAH)

## EU EXPANSION (30 countries, tier 1+2)

### Tier 1 — Implemented by Q2 2026
FR (100%), DE ES IT PT BE NL (70-80%), SE DK FI NO (85%), AT CH PL (70%)
UK (60%) — 12 countries, 2000+ aids total

### Tier 2 — Scaffolded pre-Q3 2026
RO CZ HU SK GR HR LT LV EE CY LU MT IE SI (13 countries, pending data mapping)

### Per-country implementation
- `data/aids_{cc}.json` — country-specific aids (same schema as FR)
- `core/src/countries/{country}.rs` — Rust country module (stubs)
- `web/aides/europe/{cc}.html` — HTML landing page (per country)

### Welfare model mapping
| Model | Countries | Benefit Types |
|-------|-----------|---------------|
| Bismarckian | DE AT CH | Employment-based social insurance |
| Nordic | SE DK FI NO | Universal tax-funded, generous |
| Liberal | UK IE | Means-tested, selective |
| Mediterranean | IT ES PT GR | Family-centric, fragmented |
| Central-European | PL CZ HU | Transitional EU harmonization |

## NEW AID CATEGORIES

| Category | Examples | Tier |
|----------|----------|------|
| Transport | Navigo Solidarité, SNCF Solidarité, TCL, Tisseo, TER | FR done, EU pending |
| Regional | 13 régions FR + regional budgets per country | FR in progress |
| Departmental | FSL, APA, PCH, MDPH services | FR in progress |
| Municipal | Paris, Lyon, Marseille, Bordeaux, Toulouse, Nantes CCAS | FR scaffolded |

## DESIGN TOKENS
```
--c-primary: #1565C0  /* Aida deep blue */
--c-surface: #FAFAFA
--c-text: #1F1F1F
font: system-ui
icons: Lucide style (stroke, round)
NO EMOJIS, NO gradient abuse
```

## A11Y
WCAG 2.2 AA target
- Keyboard accessible, focus-visible always visible
- Contrast ≥4.5:1 text, ≥3:1 UI components
- Touch targets ≥44px iOS, ≥48dp Android
- Lang attrs, skip links, error association
- RTL: ar, he (svelte-i18n RTL aware)
- Flesch-Kincaid ≤60 (plain language mandatory)

## SEO & DISCOVERABILITY
- URLs: `/fr/aides/{slug}` structure (slug = aid ID)
- Sitemap: Auto-generated per country
- JSON-LD: aids schema + FAQPage structured data
- Meta tags: og:title, og:description, og:image
- Canonical tags: prevent duplicate content
- Robots: Allow indexing (aides.macaron-software.com)
- Alt text: All images (a11y + SEO)

## SECURITY
Tier: LOW (static site for web)
- CSP: `default-src 'self'`; `script-src 'self'`; `object-src 'none'`
- Headers: X-Frame-Options DENY, X-Content-Type-Options nosniff
- Zero data collection (no analytics, no cookies)
- GDPR Tier 3 (precarious data) — no PII transmitted
- Legal disclaimer: Mandatory on all results screens

## i18n (47 locales)
Done: fr (100%), en (100%)
In progress: ar (80%), de, es, it, pt, pl (70-85%)
RTL: ar, he via `svelte-i18n` with `dir="rtl"`
Auto-detect: OS language on first launch

## COMMANDS
```bash
# Dev
cd aida-core && cargo test --workspace
cd web && npm run dev (or: python3 -m http.server 8000)

# Build
cd aida-core && wasm-pack build --target web --release
cd web && npm run build

# Test
cd aida-core && cargo test --release

# Deploy (static)
rsync -avz web/dist/ debian@aides.macaron-software.com:/var/www/aides/

# Cron update (daily 3am)
0 3 * * * /path/to/scripts/cron_update.sh >> /var/log/aida_scraper.log 2>&1
```

## RULES
- NO emojis (Lucide icons only in web, SF Symbols in iOS, Material in Android)
- NO float for money (cents u64 only)
- NO hardcoded strings (i18n keys mandatory)
- NO personal medical advice (always: "contact your local CAF")
- NO analytics, NO trackers, NO cookies
- NO competitor URLs in code/docs
- All aid amounts: from official sources with citation
- WASM: only compute, never transmit PII
- Static site: zero external dependencies

@.ai/ARCHITECTURE.md
@.ai/PLANS.md
@.github/skills/aida-scraper.md
@.github/skills/aida-europe.md
