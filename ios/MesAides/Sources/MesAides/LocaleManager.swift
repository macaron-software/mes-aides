import SwiftUI

/// Locale manager backed by Rust core (50 embedded locales, 0 network).
/// All translations are compiled into the Rust binary via include_str!.
@MainActor
final class LocaleManager: ObservableObject {
    static let shared = LocaleManager()

    @AppStorage("appLocale") var currentLocale: String = "fr" {
        didSet { objectWillChange.send() }
    }

    /// Translate a dot-separated key (e.g. "nav.simulator") using the current locale.
    func t(_ key: String) -> String {
        translate(lang: currentLocale, key: key)
    }

    /// Translate with explicit locale override.
    func t(_ key: String, lang: String) -> String {
        translate(lang: lang, key: key)
    }

    /// All supported locale codes from the Rust core.
    var availableLocales: [String] {
        supportedLangs()
    }
}
