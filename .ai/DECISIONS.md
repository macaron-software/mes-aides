# Mes Aides — Key Decisions

## AD-001: Rust as Single Source of Truth
- **Date:** 2024-11
- **Decision:** Rust core (cdylib+rlib+wasm) for eligibility calc
- **Rationale:** One codebase for web (WASM), iOS (UniFFI), Android (JNI)
- **Trade-off:** Steeper learning curve, fewer Rust devs

## AD-002: 100% Local Computation
- **Date:** 2024-11
- **Decision:** Zero data collection, all calc in browser/device
- **Rationale:** Privacy-first, no GDPR burden, no backend attack surface
- **Trade-off:** No user history, no personalization

## AD-003: Static Site First
- **Date:** 2024-11
- **Decision:** Web = static HTML/CSS/JS, API optional
- **Rationale:** Simplicity, hosting cost, offline-capable
- **Trade-off:** No server-side rendering (optional Axum API available)

## AD-004: Vanilla JS (No Framework)
- **Date:** 2024-12
- **Decision:** Vanilla HTML/CSS/JS for web
- **Rationale:** No build step, no bundle bloat, SEO-friendly
- **Trade-off:** More DOM code, but smaller + faster load

## AD-005: CSS Custom Properties (No Sass/Tailwind)
- **Date:** 2024-12
- **Decision:** CSS vars for design tokens
- **Rationale:** Native, no build, supports runtime theming
- **Trade-off:** CSS nesting now available natively

## AD-006: Teal Primary Color
- **Date:** 2024-12
- **Decision:** Primary #0B6E4F (teal), NOT DSFR blue
- **Rationale:** Brand differentiation, accessibility contrast
- **Constraint:** Never use DSFR blue (#0055D3)

## AD-007: Feather SVG Icons
- **Date:** 2024-12
- **Decision:** Feather style (stroke, round linecap/join, 2px)
- **Rationale:** Consistent, lightweight, professional
- **Forbidden:** Emoji, filled icons

## AD-008: No External Fonts
- **Date:** 2024-12
- **Decision:** system-ui stack only, zero external deps
- **Rationale:** Privacy, performance, no CDN dependency
- **Forbidden:** Google Fonts, @font-face to external URLs

## AD-009: Baremes Embedded in Rust
- **Date:** 2024-11
- **Decision:** 2026 baremes embedded in Rust binary
- **Rationale:** Offline capability, no runtime fetch, deterministic
- **Trade-off:** New baremes require code deploy

## AD-010: WCAG 2.2 AA Accessibility
- **Date:** 2024-12
- **Decision:** Full WCAG 2.2 AA compliance
- **Rationale:** Inclusivity, legal requirement (RGAA in France)
- **Includes:** RTL for ar, he, keyboard nav, screen reader support
