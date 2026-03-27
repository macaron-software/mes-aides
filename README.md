# Mes Aides — Social Benefits Simulator

Fr social benefits simulator. Free, open-source, 100% confidential. Covers 71 aids (RSA, APL, prime activite, AAH...) with 2026 baremes.

**Zero personal data collected, transmitted, or stored.**

## Architecture — 100% Local

```
Browser/Mobile App
  User Input → Embedded Calc Engine → Local Results
  Nothing leaves the device.
```

- `core/` — Rust engine: eligibility rules, 71 aids, embedded 2026 baremes
- `web/` — Vanilla HTML/CSS/JS, zero framework, embedded engine
- `ios/` — SwiftUI + LocalEngine.swift (native Swift, embedded baremes)
- `android/` — Kotlin + LocalEngine (native Kotlin, embedded baremes)
- `infra/` — nginx config (static files only)

**No backend. No API. No database.**

## Privacy & GDPR

| Data | Treatment |
|------|-----------|
| Personal situation (age, income, housing...) | Calc in browser/app, never transmitted |
| Simulation results | Displayed in memory, never saved |
| Analytics | **None** — no trackers, no analytics |
| Language/theme prefs | localStorage only, never transmitted |
| Identifiers | None — no accounts created |

### Compliance
- **GDPR:** zero personal data processed — no consent needed, no DPO required
- **No cookies** (UI prefs only)
- **No third parties:** zero ext SDKs, zero ext CDNs, zero ext fonts
- **Strict CSP:** `script-src 'self'`, `connect-src 'self'`
- **Open source:** code auditable by all

## Local Dev

```bash
# Web (static server)
cd web && python3 -m http.server 8000
# → http://localhost:8000
```

## Deploy (static)

```bash
# Copy web/ to any static host (nginx, Caddy, GitHub Pages...)
rsync -avz web/ user@server:/var/www/aides/
```

## Aids Covered (71)

### Implemented (baremes 2026 calc)

| # | Aid | Key |
|---|-----|-----|
| 1 | Revenu de Solidarité Active | RSA |
| 2 | Prime Activite | PA |
| 3 | Allocation de Solidarité Spécifique | ASS |
| 4 | Allocation Retour à l'Emploi | ARE |
| 5 | Aide Personnalisée au Logement | APL |
| 6 | Allocation de Logement Sociale | ALS |
| 7 | Garantie Caution Locative | Visale |
| 8 | MaPrimeRénov' | - |
| 9 | Allocation aux Adultes Handicapés | AAH |
| 10 | Majoration Vie Autonome | MVA |
| 11 | Prestation de Compensation du Handicap | PCH |
| 12 | Allocation Éducation Enfant Handicapé | AEEH |
| 13 | Allocation Supplémentaire d'Invalidité | ASI |
| 14 | Pension d'Invalidité | - |
| 15 | Complémentaire Santé Solidaire | CSS |
| 16-28 | Allocations Familiales, PAJE, ASF, ARS, Chèque Energie, ASPA, MICO, CEJ, Bourse CROUS, Pass Culture, Prime Noël, Aide Juridictionnelle | various |

### In Progress (analysis + guide, calc being integrated)

| # | Aid | Category |
|---|-----|----------|
| 29-71 | See full catalog in web/aides.html |

## Tests

```bash
cargo test -p aides-core   # Rust unit tests
```

## License

MIT — contributions welcome.
