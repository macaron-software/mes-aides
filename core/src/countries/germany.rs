//! Germany (Deutschland) — country module stub.
//! Benefits: Bürgergeld, Wohngeld, Kindergeld, Arbeitslosengeld I, BAföG.

pub const COUNTRY_CODE: &str = "DE";
pub const CURRENCY: &str = "EUR";
pub const LANGUAGE: &str = "de";

/// Bürgergeld (Basic Income Support) — standard rate 2026
pub const BUERGERGELD_SINGLE_EUR: f64 = 563.0;
/// Wohngeld max housing benefit 2026
pub const WOHNGELD_MAX_EUR: f64 = 450.0;
/// Kindergeld per child 2026
pub const KINDERGELD_PER_CHILD_EUR: f64 = 255.0;
/// ALG I max duration solo (months)
pub const ALG1_MAX_MONTHS: u32 = 24;
/// BAföG max grant 2026
pub const BAFOEG_MAX_EUR: f64 = 812.0;
