# Mes Aides — Plans

## Active Milestones

### S2: Web UI + i18n
- Landing page
- Wizard (5-step form)
- Results page + aid details
- Design sys integration (tokens.css)
- i18n: fr/en (100%), ar (80%), es/de/it/pt (85%)
- RTL: ar, he

### S3: 71 Aids + Datagouv
- Implement all 71 aids in Rust
- datagouv MCP client for live baremes
- PDF generation
- i18n: 40 langs

### S4: iOS App
- SwiftUI via UniFFI
- libcore.a integration
- App Store submission

### S5: Android App
- Kotlin + JNI
- libcore.so integration
- Play Store submission

## Completed

### S1: Foundation
- [x] Rust core types + 28 aids
- [x] Axum API (:3001)
- [x] nginx + systemd
- [x] WASM target

## Key Metrics

| Metric | Value |
|--------|-------|
| Aids impl | 28/71 |
| i18n coverage | fr/en (100%), ar (80%) |
| Bundle size | ~50KB gzip |
| Rust LOC | ~2,300 |
| JS LOC | ~2,000 |
