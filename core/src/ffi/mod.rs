/// FFI entry points for UniFFI (iOS Swift / Android Kotlin)

use crate::engine::Simulator;
use crate::engine::Situation as CoreSituation;
use crate::i18n::I18n;

// ── FFI-compatible flat structs ───────────────────────────────────────────────

#[derive(Debug, Clone, uniffi::Record)]
pub struct FfiSituation {
    pub age: u8,
    pub situation_familiale: String,   // "celibataire" | "couple" | "monoparental_mere" | ...
    pub nb_enfants: u8,
    pub ages_enfants: Vec<u8>,
    pub logement: String,              // "locataire" | "proprietaire" | "heberge" | ...
    pub loyer_mensuel: f64,
    pub code_postal: Option<String>,
    pub zone_apl: Option<u8>,
    pub revenus_nets_mensuels: f64,
    pub revenus_conjoint: f64,
    pub patrimoine_estime: f64,
    pub ald: bool,
    pub rqth: bool,
    pub invalidite: bool,
    pub dependance: bool,
    pub gir: Option<u8>,
    pub cmu_c: bool,
    pub emploi: String,                // "salarie" | "chomeur" | "etudiant" | ...
    pub anciennete_emploi_mois: u32,
    pub heures_semaine: f64,
    pub primo_accedant: bool,
    pub etudiant_boursier: bool,
}

#[derive(Debug, Clone, uniffi::Record)]
pub struct FfiAideResult {
    pub aide_id: String,
    pub eligible: bool,
    pub montant_mensuel: Option<f64>,
    pub montant_annuel: Option<f64>,
    pub score: f64,
    pub raisons: Vec<String>,
    pub raisons_ineligible: Vec<String>,
    pub nb_etapes: u8,
}

#[derive(Debug, Clone, uniffi::Record)]
pub struct FfiSimulationResult {
    pub aides_eligibles: Vec<FfiAideResult>,
    pub aides_ineligibles: Vec<FfiAideResult>,
    pub total_mensuel: f64,
    pub total_annuel: f64,
    pub calcule_le: String,
    pub version_baremes: String,
}

#[derive(Debug, Clone, uniffi::Record)]
pub struct FfiAideInfo {
    pub id: String,
    pub slug: String,
    pub nom: String,
    pub description: String,
    pub categorie: String,
    pub montant_min: Option<f64>,
    pub montant_max: Option<f64>,
    pub periodicite: String,
    pub organisme: String,
    pub url_info: String,
}

// ── UniFFI exports ────────────────────────────────────────────────────────────

#[uniffi::export]
pub fn simulate(situation: FfiSituation) -> FfiSimulationResult {
    let core_sit = CoreSituation {
        age: situation.age,
        situation_familiale: parse_enum(&situation.situation_familiale),
        nb_enfants: situation.nb_enfants,
        ages_enfants: situation.ages_enfants,
        logement: parse_enum(&situation.logement),
        loyer_mensuel: situation.loyer_mensuel,
        code_postal: situation.code_postal,
        zone_apl: situation.zone_apl,
        revenus_nets_mensuels: situation.revenus_nets_mensuels,
        revenus_conjoint: situation.revenus_conjoint,
        aides_perçues: vec![],
        patrimoine_estime: situation.patrimoine_estime,
        ald: situation.ald,
        rqth: situation.rqth,
        invalidite: situation.invalidite,
        dependance: situation.dependance,
        gir: situation.gir,
        cmu_c: situation.cmu_c,
        emploi: parse_enum(&situation.emploi),
        anciennete_emploi_mois: situation.anciennete_emploi_mois,
        heures_semaine: situation.heures_semaine,
        primo_accedant: situation.primo_accedant,
        etudiant_boursier: situation.etudiant_boursier,
    };

    let result = Simulator::new().simulate(&core_sit);

    FfiSimulationResult {
        aides_eligibles: result.aides_eligibles.into_iter().map(to_ffi_aide).collect(),
        aides_ineligibles: result.aides_ineligibles.into_iter().map(to_ffi_aide).collect(),
        total_mensuel: result.total_mensuel,
        total_annuel: result.total_annuel,
        calcule_le: result.calcule_le,
        version_baremes: result.version_baremes,
    }
}

#[uniffi::export]
pub fn list_aides() -> Vec<FfiAideInfo> {
    crate::aides::all_aides()
        .into_iter()
        .map(|a| FfiAideInfo {
            id: format!("{:?}", a.id).to_lowercase(),
            slug: a.slug.to_string(),
            nom: a.nom.to_string(),
            description: a.description.to_string(),
            categorie: format!("{:?}", a.categorie).to_lowercase(),
            montant_min: a.montant_min,
            montant_max: a.montant_max,
            periodicite: a.periodicite.to_string(),
            organisme: a.organisme.to_string(),
            url_info: a.url_info.to_string(),
        })
        .collect()
}

// ── i18n FFI ──────────────────────────────────────────────────────────────────

#[uniffi::export]
pub fn translate(lang: String, key: String) -> String {
    I18n::t(&lang, &key)
}

#[uniffi::export]
pub fn supported_langs() -> Vec<String> {
    I18n::supported_langs()
}

// ── Helpers ───────────────────────────────────────────────────────────────────

fn to_ffi_aide(a: crate::engine::AideResult) -> FfiAideResult {
    FfiAideResult {
        aide_id: format!("{:?}", a.aide_id).to_lowercase(),
        eligible: a.eligible,
        montant_mensuel: a.montant_mensuel,
        montant_annuel: a.montant_annuel,
        score: a.score,
        raisons: a.raisons,
        raisons_ineligible: a.raisons_ineligible,
        nb_etapes: a.nb_etapes,
    }
}

fn parse_enum<T: serde::de::DeserializeOwned + Default>(raw: &str) -> T {
    serde_json::from_value(serde_json::Value::String(raw.to_string())).unwrap_or_default()
}

// Remove scaffolding from submodule - it's in lib.rs
