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

#[cfg(test)]
mod tests {
    use super::*;
    use crate::engine::types::{Situation, EmploiStatus, FamilleStatus, LogementStatus};

    fn situation_base() -> Situation {
        Situation {
            age: 35,
            revenus_nets_mensuels: 0.0,
            situation_familiale: FamilleStatus::Celibataire,
            nb_enfants: 0,
            ages_enfants: vec![],
            logement: LogementStatus::Locataire,
            loyer_mensuel: 500.0,
            zone_apl: Some(2),
            emploi: EmploiStatus::SansEmploi,
            ..Default::default()
        }
    }

    #[test]
    fn test_rsa_eligible_revenus_zero() {
        let sim = Simulator::new();
        let sit = situation_base();
        let result = sim.simulate(&sit);
        let rsa = result.aides_eligibles.iter().find(|a| a.aide_id == AideId::Rsa);
        assert!(rsa.is_some(), "RSA should be eligible with zero income");
        assert!(rsa.unwrap().montant_mensuel.unwrap_or(0.0) > 500.0, "RSA amount should be > 500€");
    }

    #[test]
    fn test_rsa_ineligible_high_income() {
        let sim = Simulator::new();
        let mut sit = situation_base();
        sit.revenus_nets_mensuels = 2000.0;
        let result = sim.simulate(&sit);
        let rsa = result.aides_eligibles.iter().find(|a| a.aide_id == AideId::Rsa);
        assert!(rsa.is_none(), "RSA should not be eligible with 2000€ income");
    }

    #[test]
    fn test_aah_eligible_with_disability() {
        let sim = Simulator::new();
        let mut sit = situation_base();
        sit.invalidite = true;
        let result = sim.simulate(&sit);
        let aah = result.aides_eligibles.iter().find(|a| a.aide_id == AideId::Aah);
        assert!(aah.is_some(), "AAH should be eligible with disability");
    }

    #[test]
    fn test_aah_ineligible_no_disability() {
        let sim = Simulator::new();
        let sit = situation_base();
        let result = sim.simulate(&sit);
        let aah = result.aides_eligibles.iter().find(|a| a.aide_id == AideId::Aah);
        assert!(aah.is_none(), "AAH should not be eligible without disability");
    }

    #[test]
    fn test_apl_eligible_locataire() {
        let sim = Simulator::new();
        let sit = situation_base();
        let result = sim.simulate(&sit);
        let apl = result.aides_eligibles.iter().find(|a| a.aide_id == AideId::Apl);
        assert!(apl.is_some(), "APL should be eligible for low-income tenant");
    }

    #[test]
    fn test_apl_ineligible_owner() {
        let sim = Simulator::new();
        let mut sit = situation_base();
        sit.logement = LogementStatus::Proprietaire;
        let result = sim.simulate(&sit);
        let apl = result.aides_eligibles.iter().find(|a| a.aide_id == AideId::Apl);
        assert!(apl.is_none(), "APL should not be eligible for owners");
    }

    #[test]
    fn test_cheque_energie_eligible() {
        let sim = Simulator::new();
        let sit = situation_base();
        let result = sim.simulate(&sit);
        let ce = result.aides_eligibles.iter().find(|a| a.aide_id == AideId::ChequeEnergie);
        assert!(ce.is_some(), "Cheque Energie should be eligible for low income");
    }

    #[test]
    fn test_prime_activite_eligible_low_salary() {
        let sim = Simulator::new();
        let mut sit = situation_base();
        sit.emploi = EmploiStatus::Salarie;
        sit.revenus_nets_mensuels = 900.0;
        let result = sim.simulate(&sit);
        let pa = result.aides_eligibles.iter().find(|a| a.aide_id == AideId::PrimeActivite);
        assert!(pa.is_some(), "Prime d'Activite should be eligible for low salary worker");
    }

    #[test]
    fn test_aspa_eligible_senior() {
        let sim = Simulator::new();
        let mut sit = situation_base();
        sit.age = 67;
        sit.emploi = EmploiStatus::Retraite;
        sit.revenus_nets_mensuels = 500.0;
        let result = sim.simulate(&sit);
        let aspa = result.aides_eligibles.iter().find(|a| a.aide_id == AideId::Aspa);
        assert!(aspa.is_some(), "ASPA should be eligible for senior with low pension");
    }

    #[test]
    fn test_allocations_familiales_with_children() {
        let sim = Simulator::new();
        let mut sit = situation_base();
        sit.situation_familiale = FamilleStatus::Couple;
        sit.nb_enfants = 2;
        sit.ages_enfants = vec![5, 10];
        let result = sim.simulate(&sit);
        let af = result.aides_eligibles.iter().find(|a| a.aide_id == AideId::AllocationsFamiliales);
        assert!(af.is_some(), "Allocations Familiales should be eligible with 2 children");
    }

    #[test]
    fn test_total_mensuel_sum() {
        let sim = Simulator::new();
        let sit = situation_base();
        let result = sim.simulate(&sit);
        let manual_sum: f64 = result.aides_eligibles
            .iter()
            .filter_map(|a| a.montant_mensuel)
            .sum();
        assert!((result.total_mensuel - manual_sum).abs() < 0.01,
            "total_mensuel should equal sum of eligible aids");
    }

    #[test]
    fn test_sorted_by_amount() {
        let sim = Simulator::new();
        let sit = situation_base();
        let result = sim.simulate(&sit);
        for i in 0..result.aides_eligibles.len().saturating_sub(1) {
            let a = result.aides_eligibles[i].montant_mensuel.unwrap_or(0.0);
            let b = result.aides_eligibles[i + 1].montant_mensuel.unwrap_or(0.0);
            assert!(a >= b, "Results should be sorted by amount descending");
        }
    }
}
