# Contributing to Mes Aides

Thank you for your interest in contributing! This guide will help you get started.

## Code of Conduct

Be respectful and inclusive. We welcome contributions from everyone.

## Getting Started

### Prerequisites

- Rust 1.75+ (for core)
- Python 3.10+ (for local server)
- Git

### Setup

```bash
# Clone
git clone https://github.com/macaron-software/mes-aides.git
cd mes-aides

# Build Rust core
cargo build --release -p aides-core

# Start local web server
cd web && python3 -m http.server 8000
# Visit http://localhost:8000
```

## Project Structure

```
core/     Rust library — eligibility engine (28 aids)
api/      Axum server — REST API (optional)
web/      Static site — HTML/CSS/JS (no build step)
ios/      SwiftUI app (UniFFI bindings)
android/  Kotlin app (JNI bindings)
docs/     Documentation, skills, tracability DB
```

## How to Contribute

### Report Bugs

1. Check existing [issues](https://github.com/macaron-software/mes-aides/issues)
2. Create new issue with:
   - Clear title
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser/OS version

### Suggest Features

Open an issue tagged `enhancement` with:
- Use case description
- Proposed solution
- Impact on privacy (must remain 100% local)

### Submit Code

1. Fork the repository
2. Create feature branch: `git checkout -b feat/my-feature`
3. Make changes
4. Run tests: `cargo test -p aides-core`
5. Commit with clear message (see below)
6. Push and create Pull Request

## Coding Standards

### Rust (core/)

```bash
# Check formatting
cargo fmt --check

# Run linter
cargo clippy -- -D warnings

# Run tests
cargo test
```

### JavaScript (web/js/)

- Vanilla JS only — no frameworks
- No npm dependencies
- JSDoc comments for public functions
- Follow existing style (2-space indent)

### CSS (web/css/)

- Use design tokens from `tokens.css`
- No Tailwind/Bootstrap
- Mobile-first media queries
- BEM-ish naming

### HTML

- Semantic elements
- ARIA attributes for accessibility
- `data-i18n` for translatable strings

## Commit Messages

Format: `type(scope): description`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Tests
- `chore`: Maintenance

Examples:
```
feat(core): add CSS eligibility calculation
fix(web): correct RTL layout in results page
docs: update API examples
```

## Adding a New Aid

1. Add aid definition in `core/src/aides/mod.rs`
2. Implement calculation in `core/src/aides/<category>.rs`
3. Add tests in `core/src/aides/<category>.rs`
4. Update aid count in documentation
5. Add HTML page in `web/aides/<slug>.html`
6. Add translations in `web/locales/*.json`

## Testing

### Rust

```bash
cargo test -p aides-core
cargo test -p aides-api
```

### Manual Web Testing

1. Test all pages in Chrome, Firefox, Safari
2. Test with keyboard navigation
3. Test with screen reader (VoiceOver/NVDA)
4. Test RTL layout (`?lang=ar`)
5. Test dark mode
6. Test offline (DevTools > Network > Offline)

## Privacy Requirements

**All contributions must maintain 100% local processing:**

- ❌ No analytics
- ❌ No tracking
- ❌ No external API calls from web
- ❌ No cookies
- ✅ All calculations in browser/device
- ✅ localStorage for user preferences only

## License

By contributing, you agree that your contributions will be licensed under AGPL-3.0.

## Questions?

Open an issue or reach out to the maintainers.
