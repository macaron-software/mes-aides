use std::collections::HashMap;
use std::sync::LazyLock;
use serde_json::Value;

pub const SUPPORTED_LANGS: &[&str] = &[
    "fr", "en", "ar", "es", "pt", "tr", "ro", "pl", "zh", "ru",
    "de", "it", "nl", "fa", "am", "uk", "sw", "so", "ha", "bn",
    "hi", "tl", "vi", "ku", "ps", "ur", "sr", "hr", "bg", "cs",
    "sk", "hu", "el", "he", "ko", "ja", "th", "id", "ms", "yo",
    "sv", "da", "nb", "fi", "ca", "fr-CA", "es-MX", "pt-PT",
    "zh-CN", "zh-TW",
];

static TRANSLATIONS: LazyLock<HashMap<&'static str, Value>> = LazyLock::new(|| {
    let pairs: &[(&str, &str)] = &[
        ("fr",    include_str!("../../../web/locales/fr.json")),
        ("en",    include_str!("../../../web/locales/en.json")),
        ("ar",    include_str!("../../../web/locales/ar.json")),
        ("am",    include_str!("../../../web/locales/am.json")),
        ("bg",    include_str!("../../../web/locales/bg.json")),
        ("bn",    include_str!("../../../web/locales/bn.json")),
        ("ca",    include_str!("../../../web/locales/ca.json")),
        ("cs",    include_str!("../../../web/locales/cs.json")),
        ("da",    include_str!("../../../web/locales/da.json")),
        ("de",    include_str!("../../../web/locales/de.json")),
        ("el",    include_str!("../../../web/locales/el.json")),
        ("es",    include_str!("../../../web/locales/es.json")),
        ("es-MX", include_str!("../../../web/locales/es-MX.json")),
        ("fa",    include_str!("../../../web/locales/fa.json")),
        ("fi",    include_str!("../../../web/locales/fi.json")),
        ("fr-CA", include_str!("../../../web/locales/fr-CA.json")),
        ("ha",    include_str!("../../../web/locales/ha.json")),
        ("he",    include_str!("../../../web/locales/he.json")),
        ("hi",    include_str!("../../../web/locales/hi.json")),
        ("hr",    include_str!("../../../web/locales/hr.json")),
        ("hu",    include_str!("../../../web/locales/hu.json")),
        ("id",    include_str!("../../../web/locales/id.json")),
        ("it",    include_str!("../../../web/locales/it.json")),
        ("ja",    include_str!("../../../web/locales/ja.json")),
        ("ko",    include_str!("../../../web/locales/ko.json")),
        ("ku",    include_str!("../../../web/locales/ku.json")),
        ("ms",    include_str!("../../../web/locales/ms.json")),
        ("nb",    include_str!("../../../web/locales/nb.json")),
        ("nl",    include_str!("../../../web/locales/nl.json")),
        ("pl",    include_str!("../../../web/locales/pl.json")),
        ("ps",    include_str!("../../../web/locales/ps.json")),
        ("pt",    include_str!("../../../web/locales/pt.json")),
        ("pt-PT", include_str!("../../../web/locales/pt-PT.json")),
        ("ro",    include_str!("../../../web/locales/ro.json")),
        ("ru",    include_str!("../../../web/locales/ru.json")),
        ("sk",    include_str!("../../../web/locales/sk.json")),
        ("so",    include_str!("../../../web/locales/so.json")),
        ("sr",    include_str!("../../../web/locales/sr.json")),
        ("sv",    include_str!("../../../web/locales/sv.json")),
        ("sw",    include_str!("../../../web/locales/sw.json")),
        ("th",    include_str!("../../../web/locales/th.json")),
        ("tl",    include_str!("../../../web/locales/tl.json")),
        ("tr",    include_str!("../../../web/locales/tr.json")),
        ("uk",    include_str!("../../../web/locales/uk.json")),
        ("ur",    include_str!("../../../web/locales/ur.json")),
        ("vi",    include_str!("../../../web/locales/vi.json")),
        ("yo",    include_str!("../../../web/locales/yo.json")),
        ("zh",    include_str!("../../../web/locales/zh.json")),
        ("zh-CN", include_str!("../../../web/locales/zh-CN.json")),
        ("zh-TW", include_str!("../../../web/locales/zh-TW.json")),
    ];
    let mut map = HashMap::with_capacity(pairs.len());
    for (lang, json_str) in pairs {
        if let Ok(val) = serde_json::from_str(json_str) {
            map.insert(*lang, val);
        }
    }
    map
});

pub struct I18n;

impl I18n {
    /// Resolve a dot-separated key (e.g. "nav.simulator") for a given locale.
    /// Fallback chain: lang → "en" → "fr" → raw key.
    pub fn t(lang: &str, key: &str) -> String {
        // Try requested lang, then base lang (e.g. "fr-CA" → "fr"), then en, then fr
        let base = lang.split('-').next().unwrap_or(lang);
        let attempts = [lang, base, "en", "fr"];

        for attempt in attempts {
            if let Some(root) = TRANSLATIONS.get(attempt) {
                if let Some(val) = Self::resolve(root, key) {
                    return val;
                }
            }
        }
        key.to_string()
    }

    /// List all supported locale codes.
    pub fn supported_langs() -> Vec<String> {
        SUPPORTED_LANGS.iter().map(|s| s.to_string()).collect()
    }

    fn resolve(root: &Value, key: &str) -> Option<String> {
        let mut current = root;
        for part in key.split('.') {
            current = current.get(part)?;
        }
        match current {
            Value::String(s) => Some(s.clone()),
            other => Some(other.to_string()),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_fr_resolution() {
        let val = I18n::t("fr", "nav.simulator");
        assert_ne!(val, "nav.simulator", "FR key should resolve: got {}", val);
    }

    #[test]
    fn test_en_resolution() {
        let val = I18n::t("en", "nav.simulator");
        assert_ne!(val, "nav.simulator", "EN key should resolve: got {}", val);
    }

    #[test]
    fn test_ar_resolution() {
        let val = I18n::t("ar", "nav.simulator");
        assert_ne!(val, "nav.simulator", "AR key should resolve: got {}", val);
    }

    #[test]
    fn test_fallback_to_key() {
        let val = I18n::t("fr", "nonexistent.key.path");
        assert_eq!(val, "nonexistent.key.path");
    }

    #[test]
    fn test_lang_fallback_chain() {
        // fr-CA should fallback to fr
        let val_ca = I18n::t("fr-CA", "nav.simulator");
        let val_fr = I18n::t("fr", "nav.simulator");
        // Either fr-CA has its own or falls back to fr
        assert_ne!(val_ca, "nav.simulator");
        assert!(!val_fr.is_empty());
    }

    #[test]
    fn test_supported_langs_count() {
        let langs = I18n::supported_langs();
        assert!(langs.len() >= 40, "Expected 40+ langs, got {}", langs.len());
    }

    #[test]
    fn test_all_50_locales_loaded() {
        let loaded = TRANSLATIONS.len();
        assert_eq!(loaded, 50, "Expected 50 locales embedded, got {}", loaded);
    }
}
