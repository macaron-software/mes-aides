pub mod fr;
pub use fr::I18n;

pub const SUPPORTED_LANGS: &[&str] = &[
    // Priority 1 — FR + diaspora present in France
    "fr", "en", "ar", "es", "pt", "tr", "ro", "pl", "zh", "ru",
    "de", "it", "nl", "fa", "am",
    // Priority 2
    "uk", "sw", "so", "ha", "bn", "hi", "tl", "vi", "ku",
    "ps", "ur", "sr", "hr", "bg", "cs", "sk", "hu", "el",
    "he", "ko", "ja", "th", "id", "ms", "yo",
];
