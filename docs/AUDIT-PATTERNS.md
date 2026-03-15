# Patterns & Anti-Patterns — Mes Aides

## Applied Patterns ✅

### Architecture

| Pattern | Implementation | Location |
|---------|---------------|----------|
| **Privacy by Design** | Zero data transmission, 100% local calc | core/src/engine/ |
| **Offline-First** | Service worker, localStorage | web/js/app.js |
| **Progressive Enhancement** | Works without JS for content | web/*.html |
| **Feature Flags** | Optional WASM/UniFFI builds | Cargo.toml features |
| **Monorepo** | core/api/web/ios/android in one repo | Root structure |

### UI/UX

| Pattern | Implementation | Location |
|---------|---------------|----------|
| **Wizard Pattern** | Multi-step form with progress | simulateur.html |
| **Card Pattern** | Aid results as cards | resultats.html |
| **Skeleton Loading** | Placeholder during load | SKILL-UI-SKELETON.md |
| **Dark/Light Mode** | CSS custom properties | css/tokens.css |
| **Mobile-First** | min-width media queries | css/components.css |

### Code

| Pattern | Implementation | Location |
|---------|---------------|----------|
| **Strategy Pattern** | Aid calculators as strategies | core/src/aides/*.rs |
| **Builder Pattern** | Situation construction | core/src/engine/situation.rs |
| **Result Type** | Rust error handling | All Rust files |
| **Type-Safe i18n** | Typed keys + JSON | web/locales/*.json |
| **CSS Tokens** | Design system variables | css/tokens.css |
| **Atomic Design** | atoms → molecules → organisms | css/components.css |

### Security

| Pattern | Implementation | Location |
|---------|---------------|----------|
| **CSP Headers** | Strict content policy | infra/nginx/aides.conf |
| **SRI** | Subresource integrity | (if CDN used) |
| **No Cookies** | Zero tracking | Entire project |
| **CORS Restricted** | API-only, same-origin | api/src/main.rs |

---

## Anti-Patterns: NOT PRESENT ✅

### Architecture Anti-Patterns Avoided

| Anti-Pattern | Status | Notes |
|--------------|--------|-------|
| **Big Ball of Mud** | ✅ Avoided | Clear module boundaries |
| **God Object** | ✅ Avoided | No single mega-class |
| **Spaghetti Code** | ✅ Avoided | Linear control flow |
| **Golden Hammer** | ✅ Avoided | Right tool for each job |
| **Premature Optimization** | ✅ Avoided | Simple first |

### UI Anti-Patterns Avoided

| Anti-Pattern | Status | Notes |
|--------------|--------|-------|
| **Mystery Meat Navigation** | ✅ Avoided | Clear labels |
| **Infinite Scroll** | ✅ Avoided | Pagination when needed |
| **Dark Patterns** | ✅ Avoided | No manipulative UI |
| **CAPTCHA Everywhere** | ✅ Avoided | No backend = no spam |
| **Popup Hell** | ✅ Avoided | No interruptions |

### Security Anti-Patterns Avoided

| Anti-Pattern | Status | Notes |
|--------------|--------|-------|
| **Security by Obscurity** | ✅ Avoided | Open source |
| **Plaintext Secrets** | ✅ Avoided | No secrets needed |
| **Trust Client Data** | ✅ N/A | No backend |
| **Hardcoded Credentials** | ✅ Avoided | No credentials |

### Performance Anti-Patterns Avoided

| Anti-Pattern | Status | Notes |
|--------------|--------|-------|
| **N+1 Queries** | ✅ N/A | No database |
| **Blocking Main Thread** | ✅ Avoided | Async where needed |
| **Memory Leaks** | ✅ Avoided | Rust ownership |
| **Bundle Bloat** | ✅ Avoided | No npm deps |

---

## Potential Improvements

### Low Priority

| Item | Impact | Effort |
|------|--------|--------|
| Extract shared header/footer | Medium | Low |
| Add PWA manifest | Medium | Low |
| HTTP/2 push hints | Low | Low |
| Preload critical fonts | Low | Low |

### Not Needed

| Item | Reason |
|------|--------|
| State management lib | Too simple for it |
| CSS framework | Custom tokens sufficient |
| Build pipeline | Vanilla JS works |
| API versioning | Static site |

---

## Pattern Decisions Log

### Decision: Vanilla JS over Framework
- **Date:** 2024-12
- **Rationale:** No complex state, simple forms, SEO priority
- **Trade-off:** More DOM code, but smaller bundle, faster load

### Decision: CSS Custom Properties over Sass
- **Date:** 2024-12
- **Rationale:** Native, no build, supports runtime theming
- **Trade-off:** No nesting (CSS nesting now available)

### Decision: Rust over Node for core
- **Date:** 2024-11
- **Rationale:** Single codebase for web (WASM), iOS, Android
- **Trade-off:** Steeper learning curve, fewer devs

### Decision: No Database
- **Date:** 2024-11
- **Rationale:** Privacy-first, no user accounts, no tracking
- **Trade-off:** No user history, no personalization

---

## Conclusion

**Architecture is clean and pattern-compliant.**

Key strengths:
- Clear separation of concerns
- No unnecessary complexity
- Security by default (no data = no breach)
- Performance by default (no deps = fast load)
