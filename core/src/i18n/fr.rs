/// Minimal i18n stub — full 40-lang JSON loaded by platform layer (web/mobile).
/// Core lib only needs key names; translations live in web/locales/ and mobile res/.
pub struct I18n;

impl I18n {
    pub fn t(_lang: &str, key: &str) -> String {
        key.to_string()
    }
}
