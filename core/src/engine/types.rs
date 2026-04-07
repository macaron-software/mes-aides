use serde::{Deserialize, Serialize};

/// Situation complète d'un foyer pour le calcul d'éligibilité.
/// Toutes les valeurs numériques sont en euros/mois sauf indication contraire.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct Situation {
    // ── Identité ─────────────────────────────────────────────────────────────
    #[serde(default)]
    pub age: u8,
    #[serde(default)]
    pub situation_familiale: FamilleStatus,

    // ── Enfants ──────────────────────────────────────────────────────────────
    #[serde(default)]
    pub nb_enfants: u8,
    /// Âges des enfants (pour aides spécifiques jeunes enfants, bourses…)
    #[serde(default)]
    pub ages_enfants: Vec<u8>,

    // ── Logement ─────────────────────────────────────────────────────────────
    #[serde(default)]
    pub logement: LogementStatus,
    /// Loyer mensuel charges comprises (0 si propriétaire / hébergé)
    #[serde(default)]
    pub loyer_mensuel: f64,
    /// Code postal (pour zonage APL)
    #[serde(default)]
    pub code_postal: Option<String>,
    /// Zone géographique APL : 1 = Île-de-France, 2 = grandes villes, 3 = reste
    #[serde(default)]
    pub zone_apl: Option<u8>,

    // ── Revenus ──────────────────────────────────────────────────────────────
    /// Revenus nets mensuels du foyer (tous actifs confondus)
    #[serde(default, alias = "revenu_mensuel")]
    pub revenus_nets_mensuels: f64,
    /// Revenus du conjoint (si couple)
    #[serde(default)]
    pub revenus_conjoint: f64,
    /// Aides déjà perçues (pour éviter double-compte)
    #[serde(default, alias = "aides_percues")]
    pub aides_perçues: Vec<String>,
    /// Patrimoine estimé (pour certains plafonds)
    #[serde(default)]
    pub patrimoine_estime: f64,

    // ── Sante ─────────────────────────────────────────────────────────────────
    #[serde(default)]
    pub ald: bool,
    #[serde(default)]
    pub rqth: bool,
    #[serde(default)]
    pub invalidite: bool,
    #[serde(default)]
    pub dependance: bool,
    #[serde(default)]
    pub gir: Option<u8>,
    #[serde(default)]
    pub cmu_c: bool,

    // ── Emploi ───────────────────────────────────────────────────────────────
    #[serde(default)]
    pub emploi: EmploiStatus,
    /// Ancienneté emploi actuel (en mois)
    #[serde(default)]
    pub anciennete_emploi_mois: u32,
    /// Heures travaillées par semaine (pour prime d'activité)
    #[serde(default)]
    pub heures_semaine: f64,

    // ── Flags spéciaux ───────────────────────────────────────────────────────
    #[serde(default)]
    pub primo_accedant: bool,
    #[serde(default)]
    pub etudiant_boursier: bool,

    /// ISO 3166-1 alpha-2 country code (e.g. "FR", "DE", "ES")
    #[serde(default)]
    pub country: Option<String>,
    /// BCP 47 language tag for UI/messages
    #[serde(default)]
    pub language: Option<String>,
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
    SansSituation,
    Etudiant,
    Retraite,
    SansEmploi,
    AlternantApprentissage,
    FonctionnairePublic,
}

// Alias: SansEmploi == SansSituation for compat
impl EmploiStatus {
    pub fn is_sans_emploi(&self) -> bool {
        matches!(self, EmploiStatus::Chomeur | EmploiStatus::SansSituation | EmploiStatus::SansEmploi)
    }
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
