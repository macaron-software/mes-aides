//! Spain (España) — country module stub.
//! Benefits: SEPE/ARE, IMV (Ingreso Mínimo Vital), child benefit.

pub const COUNTRY_CODE: &str = "ES";
pub const CURRENCY: &str = "EUR";
pub const LANGUAGE: &str = "es";

/// IMV minimum (single person) 2026
pub const IMV_MIN_EUR: f64 = 470.0;
/// IMV maximum (large household) 2026
pub const IMV_MAX_EUR: f64 = 1350.0;
/// SEPE initial replacement rate (first 180 days)
pub const SEPE_RATE_1: f64 = 0.70;
/// SEPE subsequent replacement rate
pub const SEPE_RATE_2: f64 = 0.60;
/// SEPE max duration (months)
pub const SEPE_MAX_MONTHS: u32 = 24;
