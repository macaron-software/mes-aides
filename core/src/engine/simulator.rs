use crate::aides::AideId;
use crate::engine::types::Situation;
use serde::{Deserialize, Serialize};

/// Résultat d'une simulation pour une aide
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AideResult {
    pub aide_id: AideId,
    pub eligible: bool,
    /// Montant mensuel estimé en euros (None si non calculable)
    pub montant_mensuel: Option<f64>,
    /// Montant annuel estimé
    pub montant_annuel: Option<f64>,
    /// Score d'éligibilité 0.0–1.0 (1.0 = certain)
    pub score: f64,
    /// Raisons de l'éligibilité (pour affichage transparent)
    pub raisons: Vec<String>,
    /// Raisons d'inéligibilité (pour feedback)
    pub raisons_ineligible: Vec<String>,
    /// Nombre d'étapes de démarche
    pub nb_etapes: u8,
}

/// Résultat complet d'une simulation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SimulationResult {
    pub aides_eligibles: Vec<AideResult>,
    pub aides_ineligibles: Vec<AideResult>,
    /// Montant mensuel total estimé
    pub total_mensuel: f64,
    /// Montant annuel total estimé
    pub total_annuel: f64,
    /// Timestamp ISO 8601
    pub calcule_le: String,
    /// Version des barèmes utilisés
    pub version_baremes: String,
}

/// Simulateur principal — sans état, thread-safe
pub struct Simulator {
    baremes: crate::engine::rules::Baremes,
}

impl Default for Simulator {
    fn default() -> Self {
        Self::new()
    }
}

impl Simulator {
    pub fn new() -> Self {
        Self {
            baremes: crate::engine::rules::Baremes::current(),
        }
    }

    /// Calcule l'éligibilité à toutes les aides pour une situation donnée
    pub fn simulate(&self, situation: &Situation) -> SimulationResult {
        let all_aides = crate::aides::all_aides();
        let mut eligibles = Vec::new();
        let mut ineligibles = Vec::new();

        for aide in &all_aides {
            let result = (aide.calculer)(situation, &self.baremes);
            if result.eligible {
                eligibles.push(result);
            } else {
                ineligibles.push(result);
            }
        }

        // Tri par montant décroissant
        eligibles.sort_by(|a, b| {
            b.montant_mensuel
                .unwrap_or(0.0)
                .partial_cmp(&a.montant_mensuel.unwrap_or(0.0))
                .unwrap_or(std::cmp::Ordering::Equal)
        });

        let total_mensuel: f64 = eligibles
            .iter()
            .filter_map(|a| a.montant_mensuel)
            .sum();

        SimulationResult {
            aides_eligibles: eligibles,
            aides_ineligibles: ineligibles,
            total_mensuel,
            total_annuel: total_mensuel * 12.0,
            calcule_le: "2026".to_string(),
            version_baremes: self.baremes.version.clone(),
        }
    }
}
