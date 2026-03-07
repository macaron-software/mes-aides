use serde::{Deserialize, Serialize};

/// Situation complète d'un foyer pour le calcul d'éligibilité.
/// Toutes les valeurs numériques sont en euros/mois sauf indication contraire.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct Situation {
    // ── Identité ─────────────────────────────────────────────────────────────
    pub age: u8,
    pub situation_familiale: FamilleStatus,

    // ── Enfants ──────────────────────────────────────────────────────────────
    pub nb_enfants: u8,
    /// Âges des enfants (pour aides spécifiques jeunes enfants, bourses…)
    pub ages_enfants: Vec<u8>,

    // ── Logement ─────────────────────────────────────────────────────────────
    pub logement: LogementStatus,
    /// Loyer mensuel charges comprises (0 si propriétaire / hébergé)
    pub loyer_mensuel: f64,
    /// Code postal (pour zonage APL)
    pub code_postal: Option<String>,
    /// Zone géographique APL : 1 = Île-de-France, 2 = grandes villes, 3 = reste
    pub zone_apl: Option<u8>,

    // ── Revenus ──────────────────────────────────────────────────────────────
    /// Revenus nets mensuels du foyer (tous actifs confondus)
    pub revenus_nets_mensuels: f64,
    /// Revenus du conjoint (si couple)
    pub revenus_conjoint: f64,
    /// Aides déjà perçues (pour éviter double-compte)
    pub aides_perçues: Vec<String>,
    /// Patrimoine estimé (pour certains plafonds)
    pub patrimoine_estime: f64,

    // ── Santé ─────────────────────────────────────────────────────────────────
    pub ald: bool,          // Affection longue durée
    pub rqth: bool,         // Reconnu travailleur handicapé
    pub invalidite: bool,
    pub dependance: bool,   // GIR 1-4
    pub gir: Option<u8>,    // Grade GIR (1-6)

    // ── Emploi ───────────────────────────────────────────────────────────────
    pub emploi: EmploiStatus,
    /// Ancienneté emploi actuel (en mois)
    pub anciennete_emploi_mois: u32,
    /// Heures travaillées par semaine (pour prime d'activité)
    pub heures_semaine: f64,

    // ── Flags spéciaux ───────────────────────────────────────────────────────
    pub primo_accedant: bool,   // Accession à la propriété
    pub etudiant_boursier: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum FamilleStatus {
    #[default]
    Celibataire,
    Couple,
    MonoparentalMere,
    MonoparentalPere,
    Veuf,
    Divorce,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum LogementStatus {
    #[default]
    Locataire,
    Proprietaire,
    Heberge,
    SansDomicile,
    Foyer,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum EmploiStatus {
    #[default]
    Salarie,
    Independant,
    Chomeur,
    Etudiant,
    Retraite,
    SansEmploi,
    AlternantApprentissage,
    FonctionnairePublic,
}

impl Situation {
    /// Revenu total du foyer (demandeur + conjoint)
    pub fn revenu_foyer(&self) -> f64 {
        self.revenus_nets_mensuels + self.revenus_conjoint
    }

    /// Nombre d'unités de consommation (échelle OCDE modifiée)
    pub fn unites_consommation(&self) -> f64 {
        let adultes = match self.situation_familiale {
            FamilleStatus::Couple => 2.0,
            _ => 1.0,
        };
        let enfants: f64 = self.nb_enfants as f64 * 0.3;
        1.0 + (adultes - 1.0) * 0.5 + enfants
    }

    /// Revenu par unité de consommation
    pub fn revenu_par_uc(&self) -> f64 {
        self.revenu_foyer() / self.unites_consommation()
    }
}
