use crate::engine::types::Situation;
use crate::engine::simulator::AideResult;
use crate::aides::AideId;

/// Live and fallback baremes (updated via datagouv-mcp, embedded as fallback)
#[derive(Debug, Clone)]
pub struct Baremes {
    pub version: String,
    // RSA
    pub rsa_base_personne_seule: f64,
    pub rsa_majoration_parent_isole: f64,
    pub rsa_plafond_par_enfant: f64,
    // Prime d'activité
    pub pa_montant_forfaitaire: f64,
    pub pa_seuil_revenu_max: f64,
    // APL (simplifiée — calcul réel très complexe)
    pub apl_montant_base_zone1: f64,
    pub apl_montant_base_zone2: f64,
    pub apl_montant_base_zone3: f64,
    pub apl_plafond_loyer_zone1: f64,
    pub apl_plafond_loyer_zone2: f64,
    pub apl_plafond_loyer_zone3: f64,
    // AAH
    pub aah_montant_max: f64,
    pub aah_plafond_revenu_seul: f64,
    pub aah_plafond_revenu_couple: f64,
    // Cheque energie
    pub cheque_energie_min: f64,
    pub cheque_energie_max: f64,
    pub cheque_energie_plafond_revenu: f64,
    // Allocations familiales
    pub af_montant_2_enfants: f64,
    pub af_montant_par_enfant_sup: f64,
    // Complement familial
    pub cf_montant_base: f64,
    pub cf_plafond_revenu: f64,
}

impl Baremes {
    /// Baremes 2026 embarques (fallback si datagouv indisponible)
    pub fn current() -> Self {
        Self {
            version: "2026-01".to_string(),
            rsa_base_personne_seule: 635.71,
            rsa_majoration_parent_isole: 952.0,
            rsa_plafond_par_enfant: 169.52,
            pa_montant_forfaitaire: 635.71,
            pa_seuil_revenu_max: 1800.0,
            apl_montant_base_zone1: 380.0,
            apl_montant_base_zone2: 290.0,
            apl_montant_base_zone3: 250.0,
            apl_plafond_loyer_zone1: 900.0,
            apl_plafond_loyer_zone2: 650.0,
            apl_plafond_loyer_zone3: 550.0,
            aah_montant_max: 1016.85,
            aah_plafond_revenu_seul: 12202.20,
            aah_plafond_revenu_couple: 24404.40,
            cheque_energie_min: 48.0,
            cheque_energie_max: 277.0,
            cheque_energie_plafond_revenu: 11000.0,
            af_montant_2_enfants: 140.27,
            af_montant_par_enfant_sup: 180.01,
            cf_montant_base: 220.12,
            cf_plafond_revenu: 3400.0,
        }
    }
}

/// Compute RSA eligibility and amount
pub fn calc_rsa(s: &Situation, b: &Baremes) -> AideResult {
    use crate::engine::types::{EmploiStatus, FamilleStatus};
    let mut raisons = Vec::new();
    let mut raisons_ko = Vec::new();

    // Eligibility conditions
    let age_ok = s.age >= 25
        || (s.nb_enfants > 0)
        || matches!(s.emploi, EmploiStatus::AlternantApprentissage);
    let not_student = !matches!(s.emploi, EmploiStatus::Etudiant) || s.nb_enfants > 0;
    let not_retired = !matches!(s.emploi, EmploiStatus::Retraite);

    let plafond = match s.situation_familiale {
        FamilleStatus::MonoparentalMere | FamilleStatus::MonoparentalPere => {
            b.rsa_majoration_parent_isole + (s.nb_enfants as f64 * b.rsa_plafond_par_enfant)
        }
        FamilleStatus::Couple => {
            b.rsa_base_personne_seule * 1.5 + (s.nb_enfants as f64 * b.rsa_plafond_par_enfant)
        }
        _ => b.rsa_base_personne_seule + (s.nb_enfants as f64 * b.rsa_plafond_par_enfant),
    };

    let revenu_net = s.revenu_foyer();
    let montant = (plafond - revenu_net).max(0.0);
    let eligible = age_ok && not_student && not_retired && montant > 0.0;

    if age_ok { raisons.push("Age >= 25 ans ou enfant a charge".to_string()); }
    else { raisons_ko.push("Age < 25 ans sans enfant a charge".to_string()); }
    if !not_student { raisons_ko.push("Etudiant sans enfant (exclu RSA)".to_string()); }
    if !not_retired { raisons_ko.push("Retraite (exclu RSA)".to_string()); }
    if eligible { raisons.push(format!("Revenus ({revenu_net:.0}€) < plafond ({plafond:.0}€)")); }
    else if age_ok { raisons_ko.push(format!("Revenus ({revenu_net:.0}€) >= plafond ({plafond:.0}€)")); }

    AideResult {
        aide_id: AideId::Rsa,
        eligible,
        montant_mensuel: if eligible { Some(montant.round()) } else { None },
        montant_annuel: if eligible { Some((montant * 12.0).round()) } else { None },
        score: if eligible { 0.95 } else { 0.0 },
        raisons,
        raisons_ineligible: raisons_ko,
        nb_etapes: 3,
    }
}

/// Compute APL eligibility and amount (simplified model)
pub fn calc_apl(s: &Situation, b: &Baremes) -> AideResult {
    use crate::engine::types::LogementStatus;
    let mut raisons = Vec::new();
    let mut raisons_ko = Vec::new();

    let is_locataire = matches!(s.logement, LogementStatus::Locataire | LogementStatus::Foyer);
    let has_loyer = s.loyer_mensuel > 0.0;
    let not_owner = !matches!(s.logement, LogementStatus::Proprietaire);

    let zone = s.zone_apl.unwrap_or(3);
    let (base, plafond_loyer) = match zone {
        1 => (b.apl_montant_base_zone1, b.apl_plafond_loyer_zone1),
        2 => (b.apl_montant_base_zone2, b.apl_plafond_loyer_zone2),
        _ => (b.apl_montant_base_zone3, b.apl_plafond_loyer_zone3),
    };

    let loyer_retenu = s.loyer_mensuel.min(plafond_loyer);
    // Simplified: APL ~ base * (loyer_retenu/plafond) * (1 - revenu_foyer/plafond_revenu)
    let plafond_revenu = 2000.0 + (s.nb_enfants as f64 * 300.0);
    let taux_revenu = (1.0 - (s.revenu_foyer() / plafond_revenu)).max(0.0).min(1.0);
    let montant = (base * (loyer_retenu / plafond_loyer) * taux_revenu).round();

    let eligible = is_locataire && has_loyer && not_owner && montant > 0.0;

    if is_locataire { raisons.push("Locataire eligible".to_string()); }
    else { raisons_ko.push("Non locataire (APL = logement loue)".to_string()); }
    if !has_loyer { raisons_ko.push("Loyer non renseigne".to_string()); }
    if eligible { raisons.push(format!("Zone APL {zone}, loyer {:.0}€", s.loyer_mensuel)); }

    AideResult {
        aide_id: AideId::Apl,
        eligible,
        montant_mensuel: if eligible { Some(montant) } else { None },
        montant_annuel: if eligible { Some(montant * 12.0) } else { None },
        score: if eligible { 0.85 } else { 0.0 },
        raisons,
        raisons_ineligible: raisons_ko,
        nb_etapes: 2,
    }
}

/// Compute prime d'activite
pub fn calc_prime_activite(s: &Situation, b: &Baremes) -> AideResult {
    use crate::engine::types::EmploiStatus;
    let mut raisons = Vec::new();
    let mut raisons_ko = Vec::new();

    let is_actif = matches!(
        s.emploi,
        EmploiStatus::Salarie | EmploiStatus::Independant | EmploiStatus::AlternantApprentissage
    );
    let age_ok = s.age >= 18;
    let revenu = s.revenu_foyer();
    let revenu_ok = revenu > 0.0 && revenu < b.pa_seuil_revenu_max;

    // Bonus individuel = montant_forfaitaire * min(revenu/smic, 1) * 0.61
    let smic_net_mensuel = 1398.69;
    let bonus = b.pa_montant_forfaitaire * (revenu / smic_net_mensuel).min(1.0) * 0.61;
    let montant = (b.pa_montant_forfaitaire + bonus - revenu * 0.38).max(0.0).round();

    let eligible = is_actif && age_ok && revenu_ok && montant > 0.0;

    if is_actif { raisons.push("En activite professionnelle".to_string()); }
    else { raisons_ko.push("Pas en activite (salarie/independant requis)".to_string()); }
    if revenu_ok { raisons.push(format!("Revenus ({revenu:.0}€) dans la plage eligible")); }
    else if revenu >= b.pa_seuil_revenu_max {
        raisons_ko.push(format!("Revenus ({revenu:.0}€) depassent le plafond ({:.0}€)", b.pa_seuil_revenu_max));
    }

    AideResult {
        aide_id: AideId::PrimeActivite,
        eligible,
        montant_mensuel: if eligible { Some(montant) } else { None },
        montant_annuel: if eligible { Some(montant * 12.0) } else { None },
        score: if eligible { 0.9 } else { 0.0 },
        raisons,
        raisons_ineligible: raisons_ko,
        nb_etapes: 2,
    }
}

/// Compute AAH
pub fn calc_aah(s: &Situation, b: &Baremes) -> AideResult {
    use crate::engine::types::FamilleStatus;
    let mut raisons = Vec::new();
    let mut raisons_ko = Vec::new();

    let has_handicap = s.rqth || s.invalidite;
    let plafond = match s.situation_familiale {
        FamilleStatus::Couple => b.aah_plafond_revenu_couple,
        _ => b.aah_plafond_revenu_seul,
    };
    let revenu_annuel = s.revenu_foyer() * 12.0;
    let revenu_ok = revenu_annuel <= plafond;
    let montant = if has_handicap && revenu_ok {
        (b.aah_montant_max - (s.revenu_foyer() * 0.8)).max(0.0).round()
    } else {
        0.0
    };
    let eligible = has_handicap && revenu_ok && montant > 0.0;

    if has_handicap { raisons.push("RQTH ou invalidite reconnue".to_string()); }
    else { raisons_ko.push("Pas de reconnaissance handicap (RQTH/invalidite requise)".to_string()); }
    if revenu_ok && has_handicap { raisons.push(format!("Revenus annuels ({revenu_annuel:.0}€) <= plafond ({plafond:.0}€)")); }
    else if !revenu_ok { raisons_ko.push(format!("Revenus annuels ({revenu_annuel:.0}€) > plafond ({plafond:.0}€)")); }

    AideResult {
        aide_id: AideId::Aah,
        eligible,
        montant_mensuel: if eligible { Some(montant) } else { None },
        montant_annuel: if eligible { Some(montant * 12.0) } else { None },
        score: if eligible { 0.9 } else { 0.0 },
        raisons,
        raisons_ineligible: raisons_ko,
        nb_etapes: 5,
    }
}

/// Compute cheque energie
pub fn calc_cheque_energie(s: &Situation, b: &Baremes) -> AideResult {
    let mut raisons = Vec::new();
    let mut raisons_ko = Vec::new();

    let revenu_annuel = s.revenu_foyer() * 12.0;
    let eligible = revenu_annuel <= b.cheque_energie_plafond_revenu;

    // Montant varie selon revenus et composition foyer
    let montant = if eligible {
        let taux = 1.0 - (revenu_annuel / b.cheque_energie_plafond_revenu);
        let base = b.cheque_energie_min + taux * (b.cheque_energie_max - b.cheque_energie_min);
        // Majoration foyers nombreux
        let majoration = s.nb_enfants as f64 * 20.0;
        (base + majoration).min(b.cheque_energie_max).round()
    } else {
        0.0
    };

    if eligible {
        raisons.push(format!("Revenus annuels ({revenu_annuel:.0}€) <= {:.0}€", b.cheque_energie_plafond_revenu));
        raisons.push(format!("Montant annuel estime: {montant:.0}€"));
    } else {
        raisons_ko.push(format!("Revenus annuels ({revenu_annuel:.0}€) > plafond ({:.0}€)", b.cheque_energie_plafond_revenu));
    }

    // Note: cheque energie verse annuellement, on met montant_mensuel = None, annuel = montant
    AideResult {
        aide_id: AideId::ChequeEnergie,
        eligible,
        montant_mensuel: None,
        montant_annuel: if eligible { Some(montant) } else { None },
        score: if eligible { 0.95 } else { 0.0 },
        raisons,
        raisons_ineligible: raisons_ko,
        nb_etapes: 1, // Automatique via impots
    }
}
