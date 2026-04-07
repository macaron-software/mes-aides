//! Italy (Italia) — country module stub.
//! Benefits: Assegno di Inclusione, NASpI, Assegno Unico.

pub const COUNTRY_CODE: &str = "IT";
pub const CURRENCY: &str = "EUR";
pub const LANGUAGE: &str = "it";

/// Assegno di Inclusione minimum 2026
pub const ADI_MIN_EUR: f64 = 500.0;
/// Assegno di Inclusione maximum 2026
pub const ADI_MAX_EUR: f64 = 780.0;
/// Assegno Unico per child (max) 2026
pub const ASSEGNO_UNICO_MAX_EUR: f64 = 189.0;
/// NASpI initial replacement rate (first 4 years contributions)
pub const NASPI_RATE_1: f64 = 0.75;
