//! Europe — catalog loader and country registry.
//! Loads aids_eu.json at runtime if available.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EuAid {
    pub id: String,
    pub slug: String,
    pub nom: String,
    pub description_en: String,
    pub categorie: String,
    pub organisme: String,
    pub montant_min_eur: f64,
    pub montant_max_eur: f64,
    pub periodicite: String,
    pub url_info: String,
    pub eligibility_criteria: Vec<String>,
    pub amounts_baremes_year: u16,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CountryData {
    pub name: String,
    pub name_local: String,
    pub language: String,
    pub currency: String,
    pub welfare_model: String,
    pub sources: Vec<String>,
    pub aids: Vec<EuAid>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EuCatalog {
    pub version: String,
    pub last_scraped: String,
    pub countries: std::collections::HashMap<String, CountryData>,
}

impl EuCatalog {
    /// Parse catalog from JSON bytes.
    pub fn from_json(bytes: &[u8]) -> Result<Self, serde_json::Error> {
        serde_json::from_slice(bytes)
    }

    /// Get all aids for a given ISO 3166-1 alpha-2 country code.
    pub fn aids_for_country(&self, code: &str) -> Vec<&EuAid> {
        self.countries
            .get(code)
            .map(|c| c.aids.iter().collect())
            .unwrap_or_default()
    }
}
