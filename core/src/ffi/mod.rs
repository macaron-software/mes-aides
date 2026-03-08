/// FFI entry points for UniFFI (iOS Swift / Android Kotlin)
/// Build commands:
///   iOS:     cargo build --release --target aarch64-apple-ios
///   Android: cargo build --release --target aarch64-linux-android
///
/// Then generate bindings:
///   uniffi-bindgen generate --library target/aarch64-apple-ios/release/libaides_core.a \
///     --language swift --out-dir ../ios/Sources/MesAidesCore/
///   uniffi-bindgen generate --library target/aarch64-linux-android/release/libaides_core.so \
///     --language kotlin --out-dir ../android/app/src/main/kotlin/uniffi/

use crate::engine::{Simulator, Situation as CoreSituation};
use serde::Deserialize;

// ── FFI-compatible flat structs ───────────────────────────────────────────────

#[derive(Debug, Clone, uniffi::Record)]
pub struct FfiSituation {
    pub age: u32,
    pub en_couple: bool,
    pub nb_enfants: u32,
    pub handicap: bool,
    pub locataire: bool,
    pub loyer_mensuel: f64,
    pub zone: u32,
    pub salaire_net_mensuel: f64,
    pub autres_revenus: f64,
    pub patrimoine: f64,
    pub ald: bool,
    pub dependance: bool,
    pub cmu_c: bool,
    pub emploi_status_raw: String,
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
        en_couple: situation.en_couple,
        nb_enfants: situation.nb_enfants,
        handicap: situation.handicap,
        locataire: situation.locataire,
        loyer_mensuel: situation.loyer_mensuel,
        zone: situation.zone,
        salaire_net_mensuel: situation.salaire_net_mensuel,
        autres_revenus: situation.autres_revenus,
        patrimoine: situation.patrimoine,
        ald: situation.ald,
        dependance: situation.dependance,
        cmu_c: situation.cmu_c,
        emploi_status: situation.emploi_status_raw.parse().unwrap_or_default(),
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

uniffi::setup_scaffolding!();
