# Aida — Social Aid Eligibility App

## Identity
| Field | Value |
|-------|-------|
| App | Aida |
| Dir | _HELP/aides-macaron |
| Brand | #1565C0 (deep blue) |
| Platform | iOS + Web (aida.macaron-software.com) |
| Stack | SwiftUI + SvelteKit + Rust core (aida-core) |
| Status | Greenfield |
| Privacy | Highest sensitivity (precarious situations) |

## Purpose
Social aid eligibility checker + volunteer/intervenant coordination for vulnerable populations (migrants, refugees, precarious situations).

## Language
- FR primary
- 47 locales supported (multilingual for migrants/refugees)
- Flesch-Kincaid <=60 (plain language MANDATORY)

## Backend (aida-core)
- Rust crate: `aida-core/` -- eligibility engine, 71 aids, 2026 baremes
- Axum API srv on port 3001 (optional SSR/native backend)
- WASM runs entirely in-browser (zero network for personal data)
- All amounts in cents (u64), never float
- Baremes embedded in Rust, not fetched at runtime

## Benefits Data (France 2024-2026)

| Benefit | Type | Source |
|---------|------|--------|
| APL | Housing | CAF |
| ALS | Housing | CAF |
| AAH | Disability | CAF |
| RSA | Income | CAF |
| Prime d'activite | Income | CAF |
| Allocation naissance | Family | CAF |
| Allocation parental | Family | CAF |
| CMU-C | Healthcare | CPAM |
| AMELI | Healthcare | CPAM |
| Micro-credit | Finance | BPI |
| Isolation | Energy | ANAH |
| Chauffage | Energy | CAF |
| Transport | Mobility | Regional |

- All amounts in cents (u64)
- Annual review needed (January each year)
- Income ceilings from CAF baremes

## Roles
| Role | Access |
|------|--------|
| beneficiary | Self eligibility check, aid catalog |
| intervenant | Social worker, intervention planning |
| volunteer | Matching to beneficiaries |
| coordinator | Admin, assignment management |
| admin | Full access |

## Key Features
| Feature | Description |
|---------|-------------|
| Eligibility calculator | Local computation, zero data collection |
| Aid catalog | 13 FR benefits with official sources |
| Intervention planning | Intervenant + beneficiary workflow |
| Volunteer matching | Skills-based pairing |
| Unsafe visit flag | Protocol PDF + admin alert |
| Intervenant absent | Auto-reassign + notify beneficiary |

## Incident Flows
| Incident | UI Response |
|----------|-------------|
| Intervenant absent | Auto-reassign workflow + beneficiary notified |
| Unsafe visit flag | Protocol PDF + admin alert |
| High urgency | Coordinator immediate notification |

## Privacy & Security
- 100% local computation
- Zero data collection
- No analytics, no tracking
- No personal data leaves device
- Static site = minimal attack surface
- CSP strict, X-Frame DENY, X-Content-Type nosniff

## Onboarding Flow
1. Language selection (47 locales)
2. Country selection (France complete, others scaffolded)
3. Questionnaire -> Eligibility engine calculates
4. Results with official sources cited

## Eligibility Engine
```
Questionnaire answers -> Eligibility Engine -> Results with official sources
```
- Evidence-based: all amounts from official government sources
- Medical/legal disclaimer on ALL results screens
- Personalized advice avoided: always 'contact your local CAF'

## Cross-Promotion (Bidirectional)
Aida can send/receive CP cards from other apps per Life ecosystem rules.

## Tech Stack
| Layer | Tech |
|-------|------|
| Core | Rust (cdylib+rlib+wasm) |
| Web | SvelteKit 5 + static adapter + svelte-i18n + Lucide |
| iOS | SwiftUI + LifeDS + AidaBrand + UniFFI |
| Android | Compose + Material 3 + UniFFI |
| API srv | Axum (optional) |

## Build
```bash
cd aides-macaron && cargo test -p aides-core
cd aides-macaron/web && npm run build
cd aides-macaron/ios && xcodebuild build -scheme Aida CODE_SIGN_IDENTITY="" CODE_SIGNING_REQUIRED=NO
```

## ❌ TODO
- [ ] iOS build verification
- [ ] Android build
- [ ] E2E tests
- [ ] Full 71 aids coverage
- [ ] Multi-country support

## Forbidden
- Emoji (SF Symbols / Lucide / Material Icons only)
- Float for money (cents only)
- Hardcoded strings (i18n only)
- Personalized advice (always: 'contact your local CAF')
- Analytics/tracking
- test.skip() / test.fixme()
