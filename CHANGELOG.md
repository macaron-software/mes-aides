# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- PWA manifest and Service Worker for offline support
- Preload hints for critical CSS
- Reduced motion support (`prefers-reduced-motion`)
- IHM context headers for development mode
- Comprehensive documentation suite:
  - SKILL-UX.md (30 UX laws)
  - SKILL-UI.md (60 components + design tokens)
  - SKILL-A11Y.md (WCAG 2.2 + 30 ARIA patterns)
  - SKILL-SECURITY.md (25 SecureByDesign controls)
  - SKILL-UI-SKELETON.md (skeleton + placeholder system)
- OpenAPI 3.1 specification
- Tracability SQLite database (SAFe hierarchy)
- GDPR lifecycle documentation
- Disaster Recovery plan (RTO 15min)
- CONTRIBUTING.md guidelines
- Lighthouse CI GitHub Action
- ESLint configuration
- Clippy CI for Rust

### Changed
- Updated CLAUDE.md to English telegraphic style
- Added copilot-instructions.md

## [0.1.0] - 2026-03-01

### Added
- Initial release
- Rust core library with 28 aids implemented:
  - RSA, Prime d'Activité, ASS, ARE
  - APL, ALS, Visale, MaPrimeRénov'
  - AAH, MVA, PCH, AEEH, ASI, Pension Invalidité
  - CSS (Complémentaire Santé Solidaire)
  - Allocations Familiales, Complément Familial, PAJE, ASF, ARS
  - Chèque Énergie, ASPA, MICO
  - CEJ, Bourse CROUS, Pass Culture
  - Prime de Noël, Aide Juridictionnelle
- Web application (vanilla HTML/CSS/JS)
- 50 locales with RTL support
- Barèmes 2026 embedded
- Dark/light theme
- Axum API server (optional)
- PDF export functionality
- datagouv MCP integration (partial)

### Security
- CSP headers configured
- X-Frame-Options: DENY
- No cookies, no tracking
- 100% local calculation

---

## Version History

| Version | Date | Highlights |
|---------|------|------------|
| 0.1.0 | 2026-03-01 | Initial release, 28 aids |

[Unreleased]: https://github.com/macaron-software/mes-aides/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/macaron-software/mes-aides/releases/tag/v0.1.0
