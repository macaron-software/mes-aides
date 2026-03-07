use crate::engine::types::Situation;
use crate::engine::rules::Baremes;
use crate::engine::simulator::AideResult;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "snake_case")]
pub enum AideId {
    Rsa, Apl, Als, Alf, PrimeActivite, Are,
    Aah, Pch, Aeeh, Css, Ald,
    AllocationsFamiliales, Paje, Cmg, PreparE, Ars,
    ChequeEnergie, MaPrimeRenov, PrimeNoel,
    Cej, GarantieJeunes, BoursCrous, VisaLe, LocaPass,
    Aspa, AideAlimentaire,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Categorie {
    Logement,
    RevenusEmploi,
    Famille,
    Sante,
    Energie,
    Jeunes,
    Retraite,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EtapeDemarche {
    pub numero: u8,
    pub titre: String,
    pub description: String,
    pub url_officielle: Option<String>,
    pub organisme: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Demarche {
    pub etapes: Vec<EtapeDemarche>,
    pub delai_traitement: String,
    pub organisme_principal: String,
    pub url_formulaire: Option<String>,
}

/// Static aide definition with embedded calculation function
pub struct Aide {
    pub id: AideId,
    pub slug: &'static str,
    pub nom: &'static str,
    pub description: &'static str,
    pub categorie: Categorie,
    pub montant_min: Option<f64>,
    pub montant_max: Option<f64>,
    pub periodicite: &'static str, // "mensuel" | "annuel" | "unique"
    pub organisme: &'static str,
    pub url_info: &'static str,
    pub calculer: fn(&Situation, &Baremes) -> AideResult,
}
