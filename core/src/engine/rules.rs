use crate::engine::types::{EmploiStatus, FamilleStatus, LogementStatus, Situation};
use crate::engine::simulator::AideResult;
use crate::aides::AideId;

// ── Baremes 2026 ─────────────────────────────────────────────────────────────
// Source: service-public.fr, CAF, France Travail — verifies mars 2026

#[derive(Debug, Clone)]
pub struct Baremes {
    pub version: String,
    // RSA
    pub rsa_seul: f64,
    pub rsa_couple: f64,
    pub rsa_parent_isole: f64,
    pub rsa_par_enfant: f64,
    // Prime d'activite
    pub pa_forfait_seul: f64,
    pub pa_forfait_couple: f64,
    pub pa_bonif_max: f64,
    pub pa_seuil_bonif: f64,
    pub smic_net: f64,
    // APL zones
    pub apl_plafond_loyer_z1: f64,
    pub apl_plafond_loyer_z2: f64,
    pub apl_plafond_loyer_z3: f64,
    pub apl_plafond_rev_z1: f64,
    pub apl_plafond_rev_z2: f64,
    pub apl_plafond_rev_z3: f64,
    // AAH
    pub aah_max: f64,
    pub aah_plafond_annuel: f64,
    // MVA
    pub mva_montant: f64,
    // ASS
    pub ass_journalier: f64,
    pub ass_plafond_seul: f64,
    pub ass_plafond_couple: f64,
    // ARE
    pub are_min_journalier: f64,
    pub are_part_fixe: f64,
    // Cheque energie
    pub ce_t1_seul: f64,
    pub ce_t2_seul: f64,
    pub ce_t3_seul: f64,
    pub ce_t4_seul: f64,
    pub ce_plafond_uc: f64,
    // AF
    pub af_2enf_modeste: f64,
    pub af_2enf_moyen: f64,
    pub af_2enf_eleve: f64,
    pub af_par_enf_sup_modeste: f64,
    pub af_par_enf_sup_moyen: f64,
    pub af_par_enf_sup_eleve: f64,
    pub af_seuil_modeste: f64,
    pub af_seuil_moyen: f64,
    // CF
    pub cf_modeste: f64,
    pub cf_majore: f64,
    pub cf_plafond_rev: f64,
    // CSS
    pub css_gratuit_seul: f64,
    pub css_payant_seul: f64,
    // ARS
    pub ars_6_10: f64,
    pub ars_11_14: f64,
    pub ars_15_18: f64,
    pub ars_plafond_1enf: f64,
    pub ars_par_enf_sup: f64,
    // ASPA
    pub aspa_seul: f64,
    pub aspa_couple: f64,
    // ASI
    pub asi_max: f64,
    // PAJE
    pub paje_prime_naissance: f64,
    pub paje_alloc_base: f64,
    pub paje_alloc_partielle: f64,
    pub paje_plafond_tp_seul: f64,
    pub paje_plafond_tp_couple: f64,
    // Prime de Noel
    pub noel_seul: f64,
    pub noel_couple: f64,
    pub noel_par_enf: f64,
    // CEJ
    pub cej_max: f64,
    // Bourse CROUS echelons 0bis..7
    pub bcs_echelon: [f64; 8],
    // ASF
    pub asf_par_enf: f64,
    // AEEH
    pub aeeh_base: f64,
    // Pass Culture
    pub pass_culture: f64,
    // Visale
    pub visale_plafond_z1: f64,
    pub visale_plafond_z2: f64,
    pub visale_plafond_z3: f64,
    // PCH
    pub pch_taux_horaire: f64,
    pub pch_plafond_hum: f64,
    // APA — barème 2026 (source: service-public.fr/F10009)
    pub apa_gir1: f64,
    pub apa_gir2: f64,
    pub apa_gir3: f64,
    pub apa_gir4: f64,
    pub apa_seuil_participation: f64,
}

impl Baremes {
    pub fn current() -> Self {
        Self {
            version: "2026-01".to_string(),
            rsa_seul: 646.52,
            rsa_couple: 969.78,
            rsa_parent_isole: 969.78,
            rsa_par_enfant: 258.61,
            pa_forfait_seul: 633.21,
            pa_forfait_couple: 949.82,
            pa_bonif_max: 253.28,
            pa_seuil_bonif: 813.12,
            smic_net: 1398.69,
            apl_plafond_loyer_z1: 900.0,
            apl_plafond_loyer_z2: 650.0,
            apl_plafond_loyer_z3: 550.0,
            apl_plafond_rev_z1: 1700.0,
            apl_plafond_rev_z2: 1500.0,
            apl_plafond_rev_z3: 1300.0,
            aah_max: 1033.32,
            aah_plafond_annuel: 12399.84,
            mva_montant: 107.48,
            ass_journalier: 19.33,
            ass_plafond_seul: 1353.10,
            ass_plafond_couple: 2126.30,
            are_min_journalier: 32.13,
            are_part_fixe: 13.18,
            ce_t1_seul: 194.0,
            ce_t2_seul: 146.0,
            ce_t3_seul: 98.0,
            ce_t4_seul: 48.0,
            ce_plafond_uc: 11500.0,
            af_2enf_modeste: 151.05,
            af_2enf_moyen: 75.53,
            af_2enf_eleve: 37.77,
            af_par_enf_sup_modeste: 193.81,
            af_par_enf_sup_moyen: 96.91,
            af_par_enf_sup_eleve: 48.45,
            af_seuil_modeste: 5708.0,
            af_seuil_moyen: 7583.0,
            cf_modeste: 173.08,
            cf_majore: 259.09,
            cf_plafond_rev: 2700.0,
            css_gratuit_seul: 930.0,
            css_payant_seul: 1254.0,
            ars_6_10: 423.48,
            ars_11_14: 446.85,
            ars_15_18: 462.32,
            ars_plafond_1enf: 27900.0,
            ars_par_enf_sup: 8200.0,
            aspa_seul: 1043.59,
            aspa_couple: 1620.18,
            asi_max: 466.26,
            paje_prime_naissance: 1053.07,
            paje_alloc_base: 196.59,
            paje_alloc_partielle: 98.30,
            paje_plafond_tp_seul: 2500.0,
            paje_plafond_tp_couple: 3750.0,
            noel_seul: 152.45,
            noel_couple: 228.67,
            noel_par_enf: 60.98,
            cej_max: 528.60,
            bcs_echelon: [106.65, 183.51, 263.83, 344.14, 424.46, 471.25, 517.92, 563.50],
            asf_par_enf: 170.62,
            aeeh_base: 140.33,
            pass_culture: 300.0,
            visale_plafond_z1: 1500.0,
            visale_plafond_z2: 1300.0,
            visale_plafond_z3: 1000.0,
            pch_taux_horaire: 18.18,
            pch_plafond_hum: 1743.0,
            apa_gir1: 1955.61,
            apa_gir2: 1574.39,
            apa_gir3: 1133.68,
            apa_gir4: 752.46,
            apa_seuil_participation: 817.0,
        }
    }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

fn ok(id: AideId, montant: f64, raison: impl Into<String>, nb_etapes: u8) -> AideResult {
    AideResult {
        aide_id: id,
        eligible: true,
        montant_mensuel: Some((montant * 100.0).round() / 100.0),
        montant_annuel: Some((montant * 12.0 * 100.0).round() / 100.0),
        score: 0.90,
        raisons: vec![raison.into()],
        raisons_ineligible: vec![],
        nb_etapes,
    }
}

fn ko(id: AideId, raison: impl Into<String>) -> AideResult {
    AideResult {
        aide_id: id,
        eligible: false,
        montant_mensuel: None,
        montant_annuel: None,
        score: 0.0,
        raisons: vec![],
        raisons_ineligible: vec![raison.into()],
        nb_etapes: 0,
    }
}

fn plafond_foyer(base: f64, nb_adultes: usize, nb_enf: u8) -> f64 {
    base + (nb_adultes.saturating_sub(1) as f64 * base * 0.5)
        + (nb_enf as f64 * base * 0.3)
}

// ── RSA ───────────────────────────────────────────────────────────────────────

pub fn calc_rsa(s: &Situation, b: &Baremes) -> AideResult {
    let age_ok = s.age >= 25 || s.nb_enfants > 0;
    if !age_ok { return ko(AideId::Rsa, "Age < 25 ans sans enfant"); }
    if matches!(s.emploi, EmploiStatus::Etudiant) && s.nb_enfants == 0 {
        return ko(AideId::Rsa, "Etudiant sans enfant");
    }
    if matches!(s.emploi, EmploiStatus::Retraite) { return ko(AideId::Rsa, "Retraite"); }

    let plafond = match &s.situation_familiale {
        FamilleStatus::Couple => b.rsa_couple + s.nb_enfants as f64 * b.rsa_par_enfant,
        FamilleStatus::MonoparentalMere | FamilleStatus::MonoparentalPere =>
            b.rsa_parent_isole + s.nb_enfants as f64 * b.rsa_par_enfant,
        _ => b.rsa_seul + s.nb_enfants as f64 * b.rsa_par_enfant,
    };
    let montant = (plafond - s.revenu_foyer()).max(0.0);
    if montant < 1.0 {
        return ko(AideId::Rsa,
            format!("Revenus ({:.0}) >= plafond ({:.0})", s.revenu_foyer(), plafond));
    }
    ok(AideId::Rsa, montant,
        format!("Plafond {plafond:.0}€ - revenus {:.0}€", s.revenu_foyer()), 5)
}

// ── APL ───────────────────────────────────────────────────────────────────────

pub fn calc_apl(s: &Situation, b: &Baremes) -> AideResult {
    if !matches!(s.logement, LogementStatus::Locataire | LogementStatus::Foyer) {
        return ko(AideId::Apl, "Non locataire");
    }
    if s.loyer_mensuel < 10.0 { return ko(AideId::Apl, "Loyer non renseigne"); }

    let zone = s.zone_apl.unwrap_or(3);
    let (plafond_loyer, plafond_rev) = match zone {
        1 => (b.apl_plafond_loyer_z1, b.apl_plafond_rev_z1 + s.nb_enfants as f64 * 300.0),
        2 => (b.apl_plafond_loyer_z2, b.apl_plafond_rev_z2 + s.nb_enfants as f64 * 250.0),
        _ => (b.apl_plafond_loyer_z3, b.apl_plafond_rev_z3 + s.nb_enfants as f64 * 200.0),
    };
    let rev = s.revenu_foyer();
    if rev >= plafond_rev {
        return ko(AideId::Apl,
            format!("Revenus ({rev:.0}) >= plafond ({plafond_rev:.0})"));
    }
    let loyer = s.loyer_mensuel.min(plafond_loyer);
    let taux = 1.0 - (rev / plafond_rev).min(0.95);
    let montant = (loyer * 0.40 * taux).max(0.0).round();
    if montant < 10.0 { return ko(AideId::Apl, "Montant calcule < 10€"); }
    ok(AideId::Apl, montant, format!("Zone {zone}, loyer {:.0}€", s.loyer_mensuel), 4)
}

// ── ALS ───────────────────────────────────────────────────────────────────────

pub fn calc_als(s: &Situation, b: &Baremes) -> AideResult {
    if !matches!(s.logement, LogementStatus::Locataire | LogementStatus::Foyer) {
        return ko(AideId::Als, "Non locataire");
    }
    if s.loyer_mensuel < 10.0 { return ko(AideId::Als, "Loyer non renseigne"); }
    let zone = s.zone_apl.unwrap_or(3);
    let (plafond_loyer, plafond_rev) = match zone {
        1 => (b.apl_plafond_loyer_z1, b.apl_plafond_rev_z1),
        2 => (b.apl_plafond_loyer_z2, b.apl_plafond_rev_z2),
        _ => (b.apl_plafond_loyer_z3, b.apl_plafond_rev_z3),
    };
    let rev = s.revenu_foyer();
    if rev >= plafond_rev { return ko(AideId::Als, "Revenus trop eleves"); }
    let loyer = s.loyer_mensuel.min(plafond_loyer);
    let taux = 1.0 - (rev / plafond_rev).min(0.95);
    let montant = (loyer * 0.35 * taux).max(0.0).round();
    if montant < 10.0 { return ko(AideId::Als, "Montant < 10€"); }
    ok(AideId::Als, montant, format!("ALS zone {zone}"), 4)
}

// ── Prime d'activite ─────────────────────────────────────────────────────────

pub fn calc_prime_activite(s: &Situation, b: &Baremes) -> AideResult {
    let actif = matches!(
        s.emploi,
        EmploiStatus::Salarie | EmploiStatus::Independant
            | EmploiStatus::AlternantApprentissage | EmploiStatus::FonctionnairePublic
    );
    if !actif { return ko(AideId::PrimeActivite, "Pas en activite professionnelle"); }
    if s.age < 18 { return ko(AideId::PrimeActivite, "Age < 18 ans"); }
    if matches!(s.emploi, EmploiStatus::AlternantApprentissage)
        && s.revenus_nets_mensuels < 1082.0
    {
        return ko(AideId::PrimeActivite, "Apprenti < 1082€/mois");
    }
    let ra = s.revenus_nets_mensuels;
    let mf = match &s.situation_familiale {
        FamilleStatus::Couple => b.pa_forfait_couple,
        _ => b.pa_forfait_seul,
    };
    let bonif = if ra >= b.pa_seuil_bonif {
        (b.pa_bonif_max * ((ra - b.pa_seuil_bonif) / (b.smic_net - b.pa_seuil_bonif)))
            .min(b.pa_bonif_max)
    } else { 0.0 };
    let pa_brut = mf + 0.61 * ra + bonif;
    let montant = (pa_brut - s.revenu_foyer()).max(0.0);
    if montant < 10.0 {
        return ko(AideId::PrimeActivite,
            format!("Prime nulle (revenus {ra:.0}€)"));
    }
    if ra > b.smic_net * 1.5 {
        return ko(AideId::PrimeActivite, "Revenus > 1.5 SMIC");
    }
    ok(AideId::PrimeActivite, montant,
        format!("Revenus activite {ra:.0}€/mois"), 5)
}

// ── AAH ───────────────────────────────────────────────────────────────────────

pub fn calc_aah(s: &Situation, b: &Baremes) -> AideResult {
    if !s.rqth && !s.invalidite && !s.ald {
        return ko(AideId::Aah, "Pas de reconnaissance handicap (RQTH/invalidite/ALD)");
    }
    if s.age < 20 { return ko(AideId::Aah, "Age < 20 ans"); }
    let abat = if matches!(s.emploi,
        EmploiStatus::Salarie | EmploiStatus::Independant) { 0.20 } else { 0.0 };
    let rev_annuel = s.revenus_nets_mensuels * (1.0 - abat) * 12.0;
    if rev_annuel >= b.aah_plafond_annuel {
        return ko(AideId::Aah,
            format!("Revenus annuels {rev_annuel:.0}€ >= plafond {:.0}€",
                b.aah_plafond_annuel));
    }
    let montant = (b.aah_max - s.revenus_nets_mensuels * (1.0 - abat)).max(0.0);
    ok(AideId::Aah, montant.min(b.aah_max),
        "Handicap reconnu, deconjugalise depuis 10/2023", 6)
}

// ── MVA ───────────────────────────────────────────────────────────────────────

pub fn calc_mva(s: &Situation, b: &Baremes) -> AideResult {
    if !s.invalidite && !s.rqth { return ko(AideId::Mva, "Pas handicap >= 80%"); }
    if !matches!(s.logement, LogementStatus::Locataire) {
        return ko(AideId::Mva, "Non locataire autonome");
    }
    ok(AideId::Mva, b.mva_montant, "AAH + taux 80% + locataire", 2)
}

// ── PCH ───────────────────────────────────────────────────────────────────────

pub fn calc_pch(s: &Situation, b: &Baremes) -> AideResult {
    if !s.invalidite && !s.rqth { return ko(AideId::Pch, "Pas de handicap reconnu"); }
    if s.age < 20 { return ko(AideId::Pch, "Age < 20 ans (voir AEEH)"); }
    let heures_mois = 4.0 * 30.0;
    let montant = (b.pch_taux_horaire * heures_mois).min(b.pch_plafond_hum);
    ok(AideId::Pch, montant, "Handicap reconnu, aide humaine 4h/j estimee", 7)
}

// ── AEEH ──────────────────────────────────────────────────────────────────────

pub fn calc_aeeh(s: &Situation, b: &Baremes) -> AideResult {
    let enfant_handi = s.ages_enfants.iter().any(|&a| a < 20);
    if !enfant_handi || !s.rqth {
        return ko(AideId::Aeeh, "Pas d'enfant handicape < 20 ans");
    }
    ok(AideId::Aeeh, b.aeeh_base, "Enfant handicape, MDPH", 6)
}

// ── Cheque energie ────────────────────────────────────────────────────────────

pub fn calc_cheque_energie(s: &Situation, b: &Baremes) -> AideResult {
    let uc = s.unites_consommation();
    let rfr_uc = s.revenu_foyer() * 12.0 / uc;
    let montant_annuel = if rfr_uc < 5700.0 {
        b.ce_t1_seul + (uc - 1.0) * 30.0
    } else if rfr_uc < 7700.0 {
        b.ce_t2_seul + (uc - 1.0) * 25.0
    } else if rfr_uc < 10700.0 {
        b.ce_t3_seul + (uc - 1.0) * 20.0
    } else if rfr_uc < b.ce_plafond_uc {
        b.ce_t4_seul
    } else {
        return ko(AideId::ChequeEnergie,
            format!("RFR/UC {rfr_uc:.0}€ > plafond {:.0}€", b.ce_plafond_uc));
    };
    let mensuel = (montant_annuel / 12.0 * 100.0).round() / 100.0;
    ok(AideId::ChequeEnergie, mensuel,
        format!("RFR/UC {rfr_uc:.0}€, envoi automatique en avril"), 1)
}

// ── Allocations familiales ────────────────────────────────────────────────────

pub fn calc_allocations_familiales(s: &Situation, b: &Baremes) -> AideResult {
    if s.nb_enfants < 2 {
        return ko(AideId::AllocationsFamiliales, "Moins de 2 enfants");
    }
    let rev = s.revenu_foyer();
    let (base_2, par_sup) = if rev < b.af_seuil_modeste {
        (b.af_2enf_modeste, b.af_par_enf_sup_modeste)
    } else if rev < b.af_seuil_moyen {
        (b.af_2enf_moyen, b.af_par_enf_sup_moyen)
    } else {
        (b.af_2enf_eleve, b.af_par_enf_sup_eleve)
    };
    let montant = base_2 + s.nb_enfants.saturating_sub(2) as f64 * par_sup;
    ok(AideId::AllocationsFamiliales, montant,
        format!("{} enfants, revenus {rev:.0}€", s.nb_enfants), 3)
}

// ── Complement familial ───────────────────────────────────────────────────────

pub fn calc_complement_familial(s: &Situation, b: &Baremes) -> AideResult {
    if s.nb_enfants < 3 {
        return ko(AideId::ComplementFamilial, "Moins de 3 enfants");
    }
    let all_3plus = s.ages_enfants.is_empty()
        || s.ages_enfants.iter().all(|&a| a >= 3 && a <= 21);
    if !all_3plus {
        return ko(AideId::ComplementFamilial, "Enfants pas tous 3-21 ans");
    }
    let rev = s.revenu_foyer();
    let plafond = b.cf_plafond_rev + s.nb_enfants.saturating_sub(3) as f64 * 200.0;
    if rev > plafond {
        return ko(AideId::ComplementFamilial,
            format!("Revenus {rev:.0}€ > plafond {plafond:.0}€"));
    }
    let monopar = matches!(s.situation_familiale,
        FamilleStatus::MonoparentalMere | FamilleStatus::MonoparentalPere);
    let montant = if monopar { b.cf_majore } else { b.cf_modeste };
    ok(AideId::ComplementFamilial, montant,
        format!("{} enfants 3-21 ans", s.nb_enfants), 3)
}

// ── CSS ───────────────────────────────────────────────────────────────────────

pub fn calc_css(s: &Situation, b: &Baremes) -> AideResult {
    if s.cmu_c { return ko(AideId::Css, "Deja beneficiaire CSS"); }
    let nb_adultes = if matches!(s.situation_familiale, FamilleStatus::Couple) { 2 } else { 1 };
    let plafond_gratuit = plafond_foyer(b.css_gratuit_seul, nb_adultes, s.nb_enfants);
    let plafond_payant = plafond_foyer(b.css_payant_seul, nb_adultes, s.nb_enfants);
    let rev = s.revenu_foyer();
    if rev > plafond_payant {
        return ko(AideId::Css,
            format!("Revenus {rev:.0}€ > plafond payant {plafond_payant:.0}€"));
    }
    let gratuit = rev <= plafond_gratuit;
    let val_annuelle = if s.age < 30 { 700.0 } else if s.age < 50 { 900.0 } else { 1100.0 };
    let raison = if gratuit { "CSS gratuite (100% rembourse)" } else { "CSS participation < 1€/jour" };
    ok(AideId::Css, val_annuelle / 12.0, raison, 3)
}

// ── ASS ───────────────────────────────────────────────────────────────────────

pub fn calc_ass(s: &Situation, b: &Baremes) -> AideResult {
    if !s.emploi.is_sans_emploi() { return ko(AideId::Ass, "Pas demandeur emploi"); }
    if s.anciennete_emploi_mois < 60 {
        return ko(AideId::Ass, "Moins de 5 ans travailles (60 mois requis)");
    }
    let plafond = if matches!(s.situation_familiale, FamilleStatus::Couple) {
        b.ass_plafond_couple
    } else { b.ass_plafond_seul };
    let rev = s.revenu_foyer();
    if rev > plafond {
        return ko(AideId::Ass,
            format!("Revenus {rev:.0}€ > plafond ASS {plafond:.0}€"));
    }
    ok(AideId::Ass, b.ass_journalier * 30.0,
        "Droits ARE epuises, 5 ans travail valides", 4)
}

// ── ARE (allocation chomage) ──────────────────────────────────────────────────

pub fn calc_allocation_chomage(s: &Situation, b: &Baremes) -> AideResult {
    if !s.emploi.is_sans_emploi() {
        return ko(AideId::AllocationChomage, "Pas demandeur emploi");
    }
    if s.anciennete_emploi_mois < 6 {
        return ko(AideId::AllocationChomage,
            "Moins de 6 mois travailles (130j ou 910h)");
    }
    if matches!(s.emploi, EmploiStatus::Retraite) {
        return ko(AideId::AllocationChomage, "Retraite");
    }
    let salaire_ref = if s.revenus_nets_mensuels > 0.0 {
        s.revenus_nets_mensuels
    } else { b.smic_net };
    let sjr = salaire_ref * 12.0 / 365.0;
    let f1 = 0.404 * sjr + b.are_part_fixe;
    let f2 = 0.57 * sjr;
    let journalier = f1.max(f2).max(b.are_min_journalier);
    ok(AideId::AllocationChomage, journalier * 30.0,
        format!("57% SJR, ref {salaire_ref:.0}€/mois"), 5)
}

// ── ARS ───────────────────────────────────────────────────────────────────────

pub fn calc_allocation_rentree_scolaire(s: &Situation, b: &Baremes) -> AideResult {
    let enfants_scol: Vec<u8> = s.ages_enfants.iter().copied()
        .filter(|&a| a >= 6 && a <= 18).collect();
    let nb_enf = if !enfants_scol.is_empty() { enfants_scol.len() }
                 else if s.nb_enfants > 0 { s.nb_enfants as usize }
                 else {
                     return ko(AideId::AllocationRentreeScolaire,
                         "Pas d'enfant 6-18 ans");
                 };
    let rev_annuel = s.revenu_foyer() * 12.0;
    let plafond = b.ars_plafond_1enf + nb_enf.saturating_sub(1) as f64 * b.ars_par_enf_sup;
    if rev_annuel > plafond {
        return ko(AideId::AllocationRentreeScolaire,
            format!("Revenus annuels {rev_annuel:.0}€ > plafond {plafond:.0}€"));
    }
    let montant_annuel: f64 = if enfants_scol.is_empty() {
        b.ars_11_14 * s.nb_enfants as f64
    } else {
        enfants_scol.iter().map(|&a|
            if a <= 10 { b.ars_6_10 }
            else if a <= 14 { b.ars_11_14 }
            else { b.ars_15_18 }
        ).sum()
    };
    let mensuel = (montant_annuel / 12.0 * 100.0).round() / 100.0;
    ok(AideId::AllocationRentreeScolaire, mensuel,
        format!("Versee en aout, total annuel {montant_annuel:.0}€"), 2)
}

// ── ASPA ──────────────────────────────────────────────────────────────────────

pub fn calc_aspa(s: &Situation, b: &Baremes) -> AideResult {
    if s.age < 65 && !s.ald {
        return ko(AideId::Aspa, "Age < 65 ans sans inaptitude");
    }
    if !matches!(s.emploi,
        EmploiStatus::Retraite | EmploiStatus::SansEmploi | EmploiStatus::SansSituation)
    {
        return ko(AideId::Aspa, "Pas retraite/sans emploi");
    }
    let (plafond, base) = if matches!(s.situation_familiale, FamilleStatus::Couple) {
        (b.aspa_couple, b.aspa_couple)
    } else { (b.aspa_seul, b.aspa_seul) };
    let rev = s.revenu_foyer();
    if rev >= plafond {
        return ko(AideId::Aspa,
            format!("Revenus {rev:.0}€ >= plafond ASPA {plafond:.0}€"));
    }
    let montant = (base - rev).max(0.0);
    ok(AideId::Aspa, montant,
        "Complement minimum vieillesse (ATTENTION: recup succession > 105300€)", 5)
}

// ── PAJE ──────────────────────────────────────────────────────────────────────

pub fn calc_paje(s: &Situation, b: &Baremes) -> AideResult {
    let enfant_moins_3 = s.ages_enfants.iter().any(|&a| a < 3)
        || (s.ages_enfants.is_empty() && s.nb_enfants > 0);
    if !enfant_moins_3 { return ko(AideId::Paje, "Pas d'enfant < 3 ans"); }
    let rev = s.revenu_foyer();
    let plafond = if matches!(s.situation_familiale, FamilleStatus::Couple) {
        b.paje_plafond_tp_couple
    } else { b.paje_plafond_tp_seul };
    let alloc = if rev <= plafond { b.paje_alloc_base } else { b.paje_alloc_partielle };
    ok(AideId::Paje, alloc,
        format!("Enfant < 3 ans, revenus {rev:.0}€"), 4)
}

// ── Prime de Noel ─────────────────────────────────────────────────────────────

pub fn calc_prime_noel(s: &Situation, b: &Baremes) -> AideResult {
    let rsa = calc_rsa(s, b);
    let ass = calc_ass(s, b);
    if !rsa.eligible && !ass.eligible {
        return ko(AideId::PrimeNoel, "Pas beneficiaire RSA ni ASS");
    }
    let montant = if matches!(s.situation_familiale, FamilleStatus::Couple) {
        b.noel_couple + s.nb_enfants as f64 * b.noel_par_enf
    } else {
        b.noel_seul + s.nb_enfants as f64 * b.noel_par_enf
    };
    ok(AideId::PrimeNoel, montant / 12.0,
        "Versee automatiquement en decembre", 1)
}

// ── ASF ───────────────────────────────────────────────────────────────────────

pub fn calc_asf(s: &Situation, b: &Baremes) -> AideResult {
    let monopar = matches!(s.situation_familiale,
        FamilleStatus::MonoparentalMere | FamilleStatus::MonoparentalPere);
    if !monopar || s.nb_enfants == 0 {
        return ko(AideId::Asf, "Parent isole avec enfant requis");
    }
    ok(AideId::Asf, b.asf_par_enf * s.nb_enfants as f64,
        format!("{} enfant(s) sans soutien familial garanti", s.nb_enfants), 3)
}

// ── CEJ ───────────────────────────────────────────────────────────────────────

pub fn calc_cej(s: &Situation, b: &Baremes) -> AideResult {
    let age_ok = s.age >= 16 && (s.age < 26 || (s.rqth && s.age < 30));
    if !age_ok { return ko(AideId::Cej, "Age hors 16-25 ans (29 si RQTH)"); }
    if matches!(s.emploi,
        EmploiStatus::Salarie | EmploiStatus::Independant | EmploiStatus::Retraite)
    {
        return ko(AideId::Cej, "Deja en emploi ou retraite");
    }
    ok(AideId::Cej, b.cej_max, "Jeune sans emploi ni formation eligible", 3)
}

// ── Bourse CROUS ──────────────────────────────────────────────────────────────

pub fn calc_bourse_crous(s: &Situation, b: &Baremes) -> AideResult {
    if !matches!(s.emploi, EmploiStatus::Etudiant) {
        return ko(AideId::BourceCrous, "Pas etudiant");
    }
    if s.age >= 28 { return ko(AideId::BourceCrous, "Age >= 28 ans"); }
    let rev = s.revenu_foyer();
    let echelon = if rev < 300.0 { 7usize }
        else if rev < 500.0 { 6 }
        else if rev < 700.0 { 5 }
        else if rev < 900.0 { 4 }
        else if rev < 1100.0 { 3 }
        else if rev < 1400.0 { 2 }
        else if rev < 1800.0 { 1 }
        else if rev < 2200.0 { 0 }
        else { return ko(AideId::BourceCrous, format!("Revenus {rev:.0}€ trop eleves")); };
    ok(AideId::BourceCrous, b.bcs_echelon[echelon],
        format!("Echelon {echelon}, {:.0}€/mois sur 10 mois", b.bcs_echelon[echelon]), 5)
}

// ── MaPrimeRenov ─────────────────────────────────────────────────────────────

pub fn calc_ma_prime_renov(s: &Situation, b: &Baremes) -> AideResult {
    if !matches!(s.logement, LogementStatus::Proprietaire) {
        return ko(AideId::MaPrimeRenov, "Proprietaire requis");
    }
    let rfr_uc = s.revenu_foyer() / s.unites_consommation();
    let _ = b;
    let montant_annuel = if rfr_uc < 2500.0 { 6000.0 }
        else if rfr_uc < 3500.0 { 4200.0 }
        else if rfr_uc < 5000.0 { 3000.0 }
        else { 1800.0 };
    ok(AideId::MaPrimeRenov, montant_annuel / 12.0,
        "Proprietaire eligible, montant selon travaux RGE", 6)
}

// ── Pass Culture ──────────────────────────────────────────────────────────────

pub fn calc_pass_culture(s: &Situation, b: &Baremes) -> AideResult {
    if s.age != 18 {
        return ko(AideId::PassCulture, "Credit 300€ uniquement a 18 ans");
    }
    ok(AideId::PassCulture, b.pass_culture / 12.0,
        "Credit culture 300€ a 18 ans (passculture.app)", 1)
}

// ── Visale ────────────────────────────────────────────────────────────────────

pub fn calc_visale(s: &Situation, b: &Baremes) -> AideResult {
    if !matches!(s.logement, LogementStatus::Locataire) {
        return ko(AideId::Visale, "Non locataire");
    }
    let age_ok = s.age < 30;
    let salarie_ok = matches!(s.emploi, EmploiStatus::Salarie)
        && s.revenus_nets_mensuels < 1500.0;
    if !age_ok && !salarie_ok {
        return ko(AideId::Visale, "Age >= 30 et revenus >= 1500€");
    }
    let zone = s.zone_apl.unwrap_or(3);
    let plafond = match zone {
        1 => b.visale_plafond_z1,
        2 => b.visale_plafond_z2,
        _ => b.visale_plafond_z3,
    };
    if s.loyer_mensuel > plafond && s.loyer_mensuel > 0.0 {
        return ko(AideId::Visale,
            format!("Loyer {:.0}€ > plafond Visale z{zone} {plafond:.0}€",
                s.loyer_mensuel));
    }
    ok(AideId::Visale, 0.0,
        "Garantie caution locative gratuite jusqu'a 36 mois", 2)
}

// ── Pension invalidite ────────────────────────────────────────────────────────

pub fn calc_pension_invalidite(s: &Situation, b: &Baremes) -> AideResult {
    if !s.invalidite {
        return ko(AideId::PensionInvalidite, "Invalidite non reconnue");
    }
    if s.age >= 62 {
        return ko(AideId::PensionInvalidite, "Age >= 62 (conversion retraite)");
    }
    let sam = if s.revenus_nets_mensuels > 0.0 {
        s.revenus_nets_mensuels
    } else { b.smic_net };
    ok(AideId::PensionInvalidite, sam * 0.50,
        "2eme categorie: 50% du salaire annuel moyen", 5)
}

// ── Aide juridictionnelle ─────────────────────────────────────────────────────

pub fn calc_aide_juridictionnelle(s: &Situation, b: &Baremes) -> AideResult {
    let rev = s.revenu_foyer();
    let _ = b;
    if rev < 1100.0 {
        return ok(AideId::AideJuridictionnelle, 0.0,
            "Aide totale: frais avocat + huissier pris en charge", 2);
    }
    if rev < 1650.0 {
        return ok(AideId::AideJuridictionnelle, 0.0,
            "Aide partielle selon revenus", 2);
    }
    ko(AideId::AideJuridictionnelle,
        format!("Revenus {rev:.0}€ > plafond 1650€"))
}

// ── Minimum retraite (MICO) ───────────────────────────────────────────────────

pub fn calc_minimum_retraite(s: &Situation, b: &Baremes) -> AideResult {
    if !matches!(s.emploi, EmploiStatus::Retraite) {
        return ko(AideId::MinimumRetraite, "Pas retraite");
    }
    let mico = 934.27_f64;
    let rev = s.revenus_nets_mensuels;
    let _ = b;
    if rev >= mico {
        return ko(AideId::MinimumRetraite,
            format!("Retraite {rev:.0}€ >= MICO {mico:.0}€"));
    }
    ok(AideId::MinimumRetraite, mico - rev,
        "Complement minimum contributif", 4)
}

// ── ASI ───────────────────────────────────────────────────────────────────────

pub fn calc_asi(s: &Situation, b: &Baremes) -> AideResult {
    if !s.invalidite || s.age >= 65 {
        return ko(AideId::Asi, "Invalidite + age < 65 requis");
    }
    let rev = s.revenu_foyer();
    if rev >= b.asi_max {
        return ko(AideId::Asi,
            format!("Revenus {rev:.0}€ >= plafond ASI {:.0}€", b.asi_max));
    }
    ok(AideId::Asi, (b.asi_max - rev).max(0.0),
        "Complement invalidite < 65 ans", 4)
}

// ─────────────────────────────────────────────────────────────────────────────

// ── ALF ───────────────────────────────────────────────────────────────────────
// Source: https://www.service-public.fr/particuliers/vosdroits/F13132 -- bareme 2026

pub fn calc_alf(s: &Situation, b: &Baremes) -> AideResult {
    if s.nb_enfants == 0 {
        return ko(AideId::Alf, "Pas d'enfant a charge");
    }
    if !matches!(s.logement, LogementStatus::Locataire | LogementStatus::Foyer) {
        return ko(AideId::Alf, "Non locataire");
    }
    if s.loyer_mensuel < 10.0 {
        return ko(AideId::Alf, "Loyer non renseigne");
    }
    let zone = s.zone_apl.unwrap_or(3);
    let (plafond_loyer, plafond_rev) = match zone {
        1 => (b.apl_plafond_loyer_z1, 2000.0 + s.nb_enfants as f64 * 200.0),
        2 => (b.apl_plafond_loyer_z2, 1800.0 + s.nb_enfants as f64 * 200.0),
        _ => (b.apl_plafond_loyer_z3, 1600.0 + s.nb_enfants as f64 * 200.0),
    };
    let rev = s.revenu_foyer();
    if rev >= plafond_rev {
        return ko(AideId::Alf,
            format!("Revenus ({rev:.0}) >= plafond ({plafond_rev:.0})"));
    }
    let loyer = s.loyer_mensuel.min(plafond_loyer);
    let taux = 1.0 - (rev / plafond_rev).min(0.95);
    let montant = (loyer * 0.35 * taux).max(0.0).round();
    if montant < 10.0 {
        return ko(AideId::Alf, "Montant < 10€");
    }
    ok(AideId::Alf, montant,
        format!("ALF zone {zone}, {} enfant(s)", s.nb_enfants), 5)
}

// ── APA ───────────────────────────────────────────────────────────────────────
// Source: https://www.service-public.fr/particuliers/vosdroits/F10009 -- bareme 2026

pub fn calc_apa(s: &Situation, b: &Baremes) -> AideResult {
    if s.age < 60 {
        return ko(AideId::Apa, "Age < 60 ans");
    }
    if !s.dependance {
        return ko(AideId::Apa, "Dependance non declaree (GIR 1-4 requis)");
    }
    let gir = s.gir.unwrap_or(4);
    if gir == 0 || gir > 4 {
        return ko(AideId::Apa, "GIR invalide (1-4 attendu)");
    }
    let plafond_gir = match gir {
        1 => b.apa_gir1,
        2 => b.apa_gir2,
        3 => b.apa_gir3,
        _ => b.apa_gir4,
    };
    let rev = s.revenu_foyer();
    let participation = if rev <= b.apa_seuil_participation {
        0.0
    } else {
        ((rev - b.apa_seuil_participation) / (plafond_gir * 2.0)).min(0.90)
    };
    let montant = plafond_gir * (1.0 - participation);
    ok(AideId::Apa, montant,
        format!("GIR {} -- plafond {plafond_gir:.0}€/mois", gir), 5)
}

// ── Tarif Social Mobile ───────────────────────────────────────────────────────
// Source: Decision ARCEP 2015-0202 -- operateurs > 1M abonnes (Orange, SFR, Bouygues, Free)

pub fn calc_tarif_social_mobile(s: &Situation, b: &Baremes) -> AideResult {
    let eligible = s.cmu_c || s.revenu_foyer() <= b.rsa_seul * 1.5;
    if !eligible {
        return ko(AideId::TarifSocialMobile,
            "RSA ou CSS requis -- revenus trop eleves");
    }
    ok(AideId::TarifSocialMobile, 10.0,
        "Economie ~10€/mois vs offre standard (Orange/SFR/Bouygues/Free)", 3)
}

// ── Internet Social ───────────────────────────────────────────────────────────
// Source: Decret 2022-669 du 29 avril 2022 (service universel numerique)

pub fn calc_internet_social(s: &Situation, b: &Baremes) -> AideResult {
    let eligible = s.cmu_c || s.revenu_foyer() <= b.rsa_seul * 1.5;
    if !eligible {
        return ko(AideId::InternetSocial,
            "RSA ou CSS requis -- revenus trop eleves");
    }
    ok(AideId::InternetSocial, 15.0,
        "Offre internet 30 Mbps a 15€/mois (decret 2022-669)", 3)
}

// ── MaPrimeAdapt' ─────────────────────────────────────────────────────────────
// Source: ANAH -- https://www.anah.gouv.fr/maprimeadapt -- bareme 2026

pub fn calc_maprimeadapt(s: &Situation, _b: &Baremes) -> AideResult {
    let eligible_profil = s.age >= 70
        || (s.age >= 60 && s.invalidite)
        || s.rqth;
    if !eligible_profil {
        return ko(AideId::MaPrimeAdapt,
            "Profil non eligible -- age >= 70, invalidite >= 60 ans, ou RQTH requis");
    }
    if matches!(s.logement, LogementStatus::SansDomicile) {
        return ko(AideId::MaPrimeAdapt, "Logement stable requis");
    }
    let rev_annuel = s.revenu_foyer() * 12.0;
    let plafond_travaux = 70_000.0_f64;
    let (taux, cat) = if rev_annuel <= 21_805.0 {
        (0.70_f64, "modeste")
    } else if rev_annuel <= 27_343.0 {
        (0.50_f64, "intermediaire")
    } else {
        return ko(AideId::MaPrimeAdapt,
            "Revenus trop eleves (seuil modeste: 21 805€/an, intermediaire: 27 343€/an)");
    };
    let montant_total = plafond_travaux * taux;
    ok(AideId::MaPrimeAdapt, montant_total / 12.0,
        format!("Menage {} -- {:.0}% sur 70 000€ max travaux adaptation", cat, taux * 100.0), 4)
}

// ── Cheques-Vacances ANCV ─────────────────────────────────────────────────────
// Source: ANCV -- Loi 85-19 du 4 janvier 1985

pub fn calc_cheques_vacances(s: &Situation, _b: &Baremes) -> AideResult {
    if !matches!(s.emploi, EmploiStatus::Salarie | EmploiStatus::FonctionnairePublic) {
        return ko(AideId::ChequesVacances,
            "Reserve aux salaries et fonctionnaires");
    }
    if s.heures_semaine < 10.0 {
        return ko(AideId::ChequesVacances, "Minimum 10h/semaine requis");
    }
    let seuil = 1398.69 * 3.5;
    if s.revenu_foyer() > seuil {
        return ko(AideId::ChequesVacances,
            format!("Revenus > {seuil:.0}€/mois (plafond 3.5x SMIC)"));
    }
    ok(AideId::ChequesVacances, 500.0 / 12.0,
        "Jusqu'a 500€/an en cheques-vacances ANCV (co-financement employeur)", 3)
}

// ── FSL ───────────────────────────────────────────────────────────────────────
// Source: https://www.service-public.fr/particuliers/vosdroits/F1334

pub fn calc_fsl(s: &Situation, b: &Baremes) -> AideResult {
    if matches!(s.logement, LogementStatus::Proprietaire) {
        return ko(AideId::Fsl, "Reserve aux locataires et personnes sans logement stable");
    }
    let plafond = b.rsa_couple * 2.0;
    let rev = s.revenu_foyer();
    if rev >= plafond {
        return ko(AideId::Fsl,
            format!("Revenus ({rev:.0}€) >= plafond FSL ({plafond:.0}€)"));
    }
    ok(AideId::Fsl, 1_500.0 / 12.0,
        "Aide ponctuelle impayes loyer/energie -- max 1 500€ (variable par dept)", 4)
}

// ── Aides Mobilite Emploi ─────────────────────────────────────────────────────
// Source: France Travail -- https://www.francetravail.fr/candidat/vos-droits-aux-aides-et-prestations/aides-a-la-mobilite.html

pub fn calc_aides_mobilite_emploi(s: &Situation, _b: &Baremes) -> AideResult {
    if !s.emploi.is_sans_emploi() {
        return ko(AideId::AidesMobiliteEmploi,
            "Reserve aux demandeurs d'emploi inscrits France Travail");
    }
    ok(AideId::AidesMobiliteEmploi, 5_000.0 / 12.0,
        "Aide demenagement jusqu'a 5 000€ + visite 300€ + entretien 200€", 3)
}

// ── Aide Dentaire RAC0 ────────────────────────────────────────────────────────
// Source: https://www.service-public.fr/particuliers/vosdroits/F34055

pub fn calc_aide_dentaire(s: &Situation, _b: &Baremes) -> AideResult {
    if !s.cmu_c {
        return ko(AideId::AideDentaire,
            "CSS gratuite requise pour RAC0 dentaire");
    }
    ok(AideId::AideDentaire, 500.0 / 12.0,
        "Soins dentaires sans reste a charge (RAC0) via CSS", 2)
}

// ── Prime a la Conversion Automobile ─────────────────────────────────────────
// Source: https://www.service-public.fr/particuliers/vosdroits/F35580 -- bareme 2026

pub fn calc_prime_conversion_auto(s: &Situation, _b: &Baremes) -> AideResult {
    let rev_uc = s.revenu_par_uc();
    let (montant_max, cat) = if rev_uc <= 1_174.0 {
        (7_000.0_f64, "tres modeste")
    } else if rev_uc <= 2_348.0 {
        (5_000.0_f64, "modeste")
    } else if rev_uc <= 3_521.0 {
        (3_000.0_f64, "standard")
    } else {
        return ko(AideId::PrimeConversionAuto,
            "Revenus/UC trop eleves pour la prime a la conversion");
    };
    ok(AideId::PrimeConversionAuto, montant_max / 12.0,
        format!("Menage {} -- jusqu'a {montant_max:.0}€ pour VE ou PHEV", cat), 3)
}

// ── Carte Avantage Famille SNCF ───────────────────────────────────────────────
// Source: https://www.sncf-connect.com/aide/carte-famille-nombreuse

pub fn calc_carte_avantage_famille(s: &Situation, _b: &Baremes) -> AideResult {
    if s.nb_enfants < 3 {
        return ko(AideId::CarteAvantageFamille,
            "3 enfants minimum requis (carte famille nombreuse)");
    }
    ok(AideId::CarteAvantageFamille, 300.0 / 12.0,
        "Reduction 30-75% TGV/Intercites pour famille avec 3+ enfants", 2)
}

// ── Remboursement Transport Domicile-Travail ──────────────────────────────────
// Source: Code du travail Art. L3261-2

pub fn calc_remboursement_transport(s: &Situation, _b: &Baremes) -> AideResult {
    if !matches!(s.emploi, EmploiStatus::Salarie | EmploiStatus::FonctionnairePublic) {
        return ko(AideId::RemboursementTransport,
            "Reserve aux salaries (obligation employeur)");
    }
    if s.heures_semaine < 10.0 {
        return ko(AideId::RemboursementTransport, "Minimum 10h/semaine requis");
    }
    ok(AideId::RemboursementTransport, 75.0,
        "50% abonnement transport en commun pris en charge par l'employeur (C. trav. L3261-2)", 2)
}

// ── Bonus Reparation ──────────────────────────────────────────────────────────
// Source: https://www.bonusreparation.fr -- lance decembre 2022

pub fn calc_bonus_reparation(s: &Situation, _b: &Baremes) -> AideResult {
    let _ = s;
    ok(AideId::BonusReparation, 26.0 / 12.0,
        "De 7€ a 45€ par reparation selon categorie (electronique, vetements, etc.)", 2)
}

// ── Aides Regionales a la Formation ──────────────────────────────────────────
// Source: https://www.intercariforef.org -- variable selon region

pub fn calc_aides_regionales_formation(s: &Situation, _b: &Baremes) -> AideResult {
    let eligible = s.emploi.is_sans_emploi()
        || matches!(s.emploi, EmploiStatus::AlternantApprentissage);
    if !eligible {
        return ko(AideId::AidesRegionalesFormation,
            "Reserve aux demandeurs d'emploi et alternants");
    }
    let seuil = 1398.69 * 2.0;
    if s.revenu_foyer() > seuil {
        return ko(AideId::AidesRegionalesFormation,
            format!("Revenus > {seuil:.0}€/mois (plafond 2x SMIC)"));
    }
    ok(AideId::AidesRegionalesFormation, 2_000.0 / 12.0,
        "Aide a la formation jusqu'a 2 000€/an selon region (Conseil Regional)", 4)
}

// ─────────────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use crate::engine::types::{EmploiStatus, FamilleStatus, LogementStatus, Situation};

    fn b() -> Baremes { Baremes::current() }

    fn seul_sans_revenus(age: u8) -> Situation {
        Situation {
            age,
            emploi: EmploiStatus::SansEmploi,
            revenus_nets_mensuels: 0.0,
            ..Default::default()
        }
    }

    // ── RSA ──────────────────────────────────────────────────────────────────

    #[test]
    fn rsa_seul_0_revenus() {
        let s = seul_sans_revenus(30);
        let r = calc_rsa(&s, &b());
        assert!(r.eligible);
        let m = r.montant_mensuel.unwrap();
        assert!((m - 646.52).abs() < 0.5, "RSA seul={m}");
    }

    #[test]
    fn rsa_revenus_trop_eleves() {
        let s = Situation { age: 30, revenus_nets_mensuels: 2000.0, ..Default::default() };
        assert!(!calc_rsa(&s, &b()).eligible);
    }

    #[test]
    fn rsa_moins_25_sans_enfant() {
        assert!(!calc_rsa(&seul_sans_revenus(22), &b()).eligible);
    }

    #[test]
    fn rsa_moins_25_avec_enfant() {
        let s = Situation { age: 22, nb_enfants: 1, revenus_nets_mensuels: 0.0,
            emploi: EmploiStatus::SansEmploi, ..Default::default() };
        assert!(calc_rsa(&s, &b()).eligible);
    }

    #[test]
    fn rsa_etudiant_exclu() {
        let s = Situation { age: 26, emploi: EmploiStatus::Etudiant, ..Default::default() };
        assert!(!calc_rsa(&s, &b()).eligible);
    }

    #[test]
    fn rsa_retraite_exclu() {
        let s = Situation { age: 67, emploi: EmploiStatus::Retraite,
            revenus_nets_mensuels: 800.0, ..Default::default() };
        assert!(!calc_rsa(&s, &b()).eligible);
    }

    #[test]
    fn rsa_parent_isole_montant() {
        let s = Situation {
            age: 28, situation_familiale: FamilleStatus::MonoparentalMere,
            nb_enfants: 1, revenus_nets_mensuels: 400.0,
            emploi: EmploiStatus::SansEmploi, ..Default::default()
        };
        let r = calc_rsa(&s, &b());
        assert!(r.eligible);
        let m = r.montant_mensuel.unwrap();
        // plafond = 969.78 + 258.61 = 1228.39, montant = 1228.39 - 400 = 828.39
        assert!((m - 828.39).abs() < 1.0, "RSA parent isole={m}");
    }

    // ── APL ──────────────────────────────────────────────────────────────────

    #[test]
    fn apl_locataire_zone2_loyer600_rev1000() {
        let s = Situation {
            age: 30, logement: LogementStatus::Locataire,
            loyer_mensuel: 600.0, zone_apl: Some(2),
            revenus_nets_mensuels: 1000.0, ..Default::default()
        };
        let r = calc_apl(&s, &b());
        assert!(r.eligible);
        let m = r.montant_mensuel.unwrap();
        assert!(m > 50.0 && m < 200.0, "APL z2={m}");
    }

    #[test]
    fn apl_proprietaire_ineligible() {
        let s = Situation { logement: LogementStatus::Proprietaire, ..Default::default() };
        assert!(!calc_apl(&s, &b()).eligible);
    }

    #[test]
    fn apl_revenus_trop_eleves() {
        let s = Situation {
            logement: LogementStatus::Locataire, loyer_mensuel: 600.0,
            zone_apl: Some(2), revenus_nets_mensuels: 3000.0, ..Default::default()
        };
        assert!(!calc_apl(&s, &b()).eligible);
    }

    // ── Prime d'activite ─────────────────────────────────────────────────────

    #[test]
    fn pa_smic_seul() {
        let s = Situation { age: 25, emploi: EmploiStatus::Salarie,
            revenus_nets_mensuels: 1398.69, ..Default::default() };
        let r = calc_prime_activite(&s, &b());
        assert!(r.eligible);
        let m = r.montant_mensuel.unwrap();
        assert!(m > 150.0 && m < 400.0, "PA SMIC={m}");
    }

    #[test]
    fn pa_chomeur_ineligible() {
        let s = Situation { age: 30, emploi: EmploiStatus::Chomeur,
            revenus_nets_mensuels: 600.0, ..Default::default() };
        assert!(!calc_prime_activite(&s, &b()).eligible);
    }

    // ── AAH ──────────────────────────────────────────────────────────────────

    #[test]
    fn aah_invalide_0_revenus() {
        let s = Situation { age: 30, invalidite: true,
            revenus_nets_mensuels: 0.0, ..Default::default() };
        let r = calc_aah(&s, &b());
        assert!(r.eligible);
        let m = r.montant_mensuel.unwrap();
        assert!((m - 1033.32).abs() < 1.0, "AAH max={m}");
    }

    #[test]
    fn aah_sans_handicap_ineligible() {
        let s = Situation { age: 30, ..Default::default() };
        assert!(!calc_aah(&s, &b()).eligible);
    }

    // ── Cheque energie ────────────────────────────────────────────────────────

    #[test]
    fn ce_revenus_tres_faibles() {
        let s = Situation { age: 30, revenus_nets_mensuels: 400.0, ..Default::default() };
        assert!(calc_cheque_energie(&s, &b()).eligible);
    }

    #[test]
    fn ce_revenus_trop_eleves() {
        let s = Situation { age: 30, revenus_nets_mensuels: 2000.0, ..Default::default() };
        assert!(!calc_cheque_energie(&s, &b()).eligible);
    }

    // ── AF ────────────────────────────────────────────────────────────────────

    #[test]
    fn af_2_enfants_modestes() {
        let s = Situation { nb_enfants: 2, revenus_nets_mensuels: 1500.0, ..Default::default() };
        let r = calc_allocations_familiales(&s, &b());
        assert!(r.eligible);
        let m = r.montant_mensuel.unwrap();
        assert!((m - 151.05).abs() < 0.5, "AF 2enf modeste={m}");
    }

    #[test]
    fn af_1_enfant_ineligible() {
        assert!(!calc_allocations_familiales(
            &Situation { nb_enfants: 1, ..Default::default() }, &b()).eligible);
    }

    // ── CSS ───────────────────────────────────────────────────────────────────

    #[test]
    fn css_gratuite_faibles_revenus() {
        let s = Situation { age: 30, revenus_nets_mensuels: 700.0, ..Default::default() };
        let r = calc_css(&s, &b());
        assert!(r.eligible);
        assert!(r.raisons.iter().any(|x| x.contains("gratuite")));
    }

    #[test]
    fn css_trop_eleves() {
        let s = Situation { age: 30, revenus_nets_mensuels: 2000.0, ..Default::default() };
        assert!(!calc_css(&s, &b()).eligible);
    }

    // ── ASS ───────────────────────────────────────────────────────────────────

    #[test]
    fn ass_long_parcours() {
        let s = Situation { age: 45, emploi: EmploiStatus::Chomeur,
            anciennete_emploi_mois: 72, ..Default::default() };
        let r = calc_ass(&s, &b());
        assert!(r.eligible);
        let m = r.montant_mensuel.unwrap();
        assert!((m - 579.90).abs() < 1.0, "ASS={m}");
    }

    #[test]
    fn ass_parcours_trop_court() {
        let s = Situation { age: 35, emploi: EmploiStatus::Chomeur,
            anciennete_emploi_mois: 36, ..Default::default() };
        assert!(!calc_ass(&s, &b()).eligible);
    }

    // ── ASPA ──────────────────────────────────────────────────────────────────

    #[test]
    fn aspa_retraite_300() {
        let s = Situation { age: 70, emploi: EmploiStatus::Retraite,
            revenus_nets_mensuels: 300.0, ..Default::default() };
        let r = calc_aspa(&s, &b());
        assert!(r.eligible);
        let m = r.montant_mensuel.unwrap();
        assert!((m - 743.59).abs() < 1.0, "ASPA={m}");
    }

    #[test]
    fn aspa_revenus_eleves() {
        let s = Situation { age: 70, emploi: EmploiStatus::Retraite,
            revenus_nets_mensuels: 1100.0, ..Default::default() };
        assert!(!calc_aspa(&s, &b()).eligible);
    }

    #[test]
    fn aspa_moins_65() {
        let s = Situation { age: 60, emploi: EmploiStatus::Retraite,
            revenus_nets_mensuels: 500.0, ..Default::default() };
        assert!(!calc_aspa(&s, &b()).eligible);
    }

    // ── Bourse CROUS ──────────────────────────────────────────────────────────

    #[test]
    fn bcs_etudiant_echelon7() {
        let s = Situation { age: 21, emploi: EmploiStatus::Etudiant,
            revenus_nets_mensuels: 200.0, ..Default::default() };
        let r = calc_bourse_crous(&s, &b());
        assert!(r.eligible);
        let m = r.montant_mensuel.unwrap();
        assert!((m - 563.50).abs() < 1.0, "BCS e7={m}");
    }

    #[test]
    fn bcs_pas_etudiant() {
        let s = Situation { age: 21, emploi: EmploiStatus::Salarie, ..Default::default() };
        assert!(!calc_bourse_crous(&s, &b()).eligible);
    }

    // ── PAJE ──────────────────────────────────────────────────────────────────

    #[test]
    fn paje_enfant_1_an() {
        let s = Situation { age: 28, nb_enfants: 1, ages_enfants: vec![1],
            revenus_nets_mensuels: 1500.0, ..Default::default() };
        assert!(calc_paje(&s, &b()).eligible);
    }

    #[test]
    fn paje_enfant_4_ans_ineligible() {
        let s = Situation { age: 28, nb_enfants: 1, ages_enfants: vec![4], ..Default::default() };
        assert!(!calc_paje(&s, &b()).eligible);
    }

    // ── ARS ───────────────────────────────────────────────────────────────────

    #[test]
    fn ars_3_enfants_scolarises() {
        let s = Situation { age: 35, nb_enfants: 3, ages_enfants: vec![8, 12, 16],
            revenus_nets_mensuels: 1800.0, ..Default::default() };
        let r = calc_allocation_rentree_scolaire(&s, &b());
        assert!(r.eligible);
        let annuel = r.montant_mensuel.unwrap() * 12.0;
        // 423.48 + 446.85 + 462.32 = 1332.65
        assert!((annuel - 1332.65).abs() < 2.0, "ARS annuel={annuel}");
    }

    // ── CF ────────────────────────────────────────────────────────────────────

    #[test]
    fn cf_3_enfants_3plus() {
        let s = Situation { age: 35, nb_enfants: 3, ages_enfants: vec![4, 7, 10],
            revenus_nets_mensuels: 1500.0, ..Default::default() };
        let r = calc_complement_familial(&s, &b());
        assert!(r.eligible);
        let m = r.montant_mensuel.unwrap();
        assert!((m - 173.08).abs() < 1.0, "CF={m}");
    }

    // ── ASF ───────────────────────────────────────────────────────────────────

    #[test]
    fn asf_parent_isole() {
        let s = Situation { age: 28,
            situation_familiale: FamilleStatus::MonoparentalMere,
            nb_enfants: 1, ..Default::default() };
        let r = calc_asf(&s, &b());
        assert!(r.eligible);
        let m = r.montant_mensuel.unwrap();
        assert!((m - 170.62).abs() < 0.5, "ASF={m}");
    }

    // ── CEJ ───────────────────────────────────────────────────────────────────

    #[test]
    fn cej_jeune_20_ans() {
        let s = Situation { age: 20, emploi: EmploiStatus::SansEmploi, ..Default::default() };
        let r = calc_cej(&s, &b());
        assert!(r.eligible);
        assert!((r.montant_mensuel.unwrap() - 528.60).abs() < 1.0);
    }

    #[test]
    fn cej_26_ans_exclu() {
        let s = Situation { age: 26, emploi: EmploiStatus::SansEmploi, ..Default::default() };
        assert!(!calc_cej(&s, &b()).eligible);
    }

    // ── Pass Culture ──────────────────────────────────────────────────────────

    #[test]
    fn pass_culture_18() {
        assert!(calc_pass_culture(&Situation { age: 18, ..Default::default() }, &b()).eligible);
    }

    #[test]
    fn pass_culture_pas_18() {
        assert!(!calc_pass_culture(&Situation { age: 19, ..Default::default() }, &b()).eligible);
    }

    // ── MVA ───────────────────────────────────────────────────────────────────

    #[test]
    fn mva_invalide_locataire() {
        let s = Situation { age: 30, invalidite: true,
            logement: LogementStatus::Locataire, ..Default::default() };
        let r = calc_mva(&s, &b());
        assert!(r.eligible);
        assert!((r.montant_mensuel.unwrap() - 107.48).abs() < 0.5);
    }

    // ── Minimum retraite ──────────────────────────────────────────────────────

    #[test]
    fn mico_faible_pension() {
        let s = Situation { age: 67, emploi: EmploiStatus::Retraite,
            revenus_nets_mensuels: 650.0, ..Default::default() };
        let r = calc_minimum_retraite(&s, &b());
        assert!(r.eligible);
        assert!((r.montant_mensuel.unwrap() - 284.27).abs() < 1.0);
    }

    // ── ARE ───────────────────────────────────────────────────────────────────

    #[test]
    fn are_chomeur_ancien_2000() {
        let s = Situation { age: 35, emploi: EmploiStatus::Chomeur,
            anciennete_emploi_mois: 12, revenus_nets_mensuels: 2000.0, ..Default::default() };
        let r = calc_allocation_chomage(&s, &b());
        assert!(r.eligible);
        let m = r.montant_mensuel.unwrap();
        assert!(m > 900.0 && m < 1600.0, "ARE={m}");
    }

    // ── Personas (user journeys) ──────────────────────────────────────────────

    /// P1 Marie: 28 ans, mere isolee, CDI mi-temps, 900€, locataire z2, 1 enfant
    #[test]
    fn p1_marie_mere_isolee() {
        let s = Situation {
            age: 28,
            situation_familiale: FamilleStatus::MonoparentalMere,
            nb_enfants: 1,
            ages_enfants: vec![2],
            emploi: EmploiStatus::Salarie,
            revenus_nets_mensuels: 900.0,
            logement: LogementStatus::Locataire,
            loyer_mensuel: 550.0,
            zone_apl: Some(2),
            ..Default::default()
        };
        let b = b();
        // RSA: plafond parent isole + 1 enf = 969.78 + 258.61 = 1228.39, montant = 328.39
        let rsa = calc_rsa(&s, &b);
        assert!(rsa.eligible, "P1: RSA eligible");
        assert!(rsa.montant_mensuel.unwrap() > 300.0);
        // APL: locataire z2
        assert!(calc_apl(&s, &b).eligible, "P1: APL eligible");
        // Prime activite
        let pa = calc_prime_activite(&s, &b);
        assert!(pa.eligible, "P1: PA eligible");
        // PAJE enfant < 3 ans
        assert!(calc_paje(&s, &b).eligible, "P1: PAJE eligible");
        // ASF parent isole
        assert!(calc_asf(&s, &b).eligible, "P1: ASF eligible");
    }

    /// P2 Ahmed: 45 ans, CDI SMIC, locataire z2, pas RSA
    #[test]
    fn p2_ahmed_salarie_smic() {
        let s = Situation {
            age: 45,
            emploi: EmploiStatus::Salarie,
            revenus_nets_mensuels: 1398.69,
            logement: LogementStatus::Locataire,
            loyer_mensuel: 600.0,
            zone_apl: Some(2),
            ..Default::default()
        };
        let b = b();
        assert!(!calc_rsa(&s, &b).eligible, "P2: pas RSA");
        assert!(calc_prime_activite(&s, &b).eligible, "P2: PA eligible");
        assert!(calc_apl(&s, &b).eligible, "P2: APL eligible");
        // SMIC = 16784€/UC/an > plafond CE 11500€ → ineligible cheque energie
        assert!(!calc_cheque_energie(&s, &b).eligible, "P2: SMIC > plafond CE");
    }

    /// P3 Pauline: 22 ans, etudiante, 0€, locataire z2
    #[test]
    fn p3_pauline_etudiante() {
        let s = Situation {
            age: 22,
            emploi: EmploiStatus::Etudiant,
            revenus_nets_mensuels: 0.0,
            logement: LogementStatus::Locataire,
            loyer_mensuel: 400.0,
            zone_apl: Some(2),
            ..Default::default()
        };
        let b = b();
        assert!(calc_bourse_crous(&s, &b).eligible, "P3: BCS eligible");
        assert!(calc_apl(&s, &b).eligible, "P3: APL eligible");
        assert!(calc_visale(&s, &b).eligible, "P3: Visale eligible");
        assert!(calc_css(&s, &b).eligible, "P3: CSS eligible");
    }

    /// P4 Robert: 72 ans, retraite 900€, locataire z3
    #[test]
    fn p4_robert_retraite() {
        let s = Situation {
            age: 72,
            emploi: EmploiStatus::Retraite,
            revenus_nets_mensuels: 900.0,
            logement: LogementStatus::Locataire,
            loyer_mensuel: 450.0,
            zone_apl: Some(3),
            ..Default::default()
        };
        let b = b();
        let aspa = calc_aspa(&s, &b);
        assert!(aspa.eligible, "P4: ASPA eligible");
        let m = aspa.montant_mensuel.unwrap();
        assert!((m - 143.59).abs() < 1.0, "P4 ASPA complement={m}"); // 1043.59 - 900
        assert!(calc_cheque_energie(&s, &b).eligible, "P4: cheque energie eligible");
    }

    /// P5 Famille: 35 ans, 3 enfants, 0€, locataire z2 → > 1500€/mois total
    #[test]
    fn p5_famille_nombreuse_total() {
        let s = Situation {
            age: 35,
            emploi: EmploiStatus::SansEmploi,
            nb_enfants: 3,
            ages_enfants: vec![2, 5, 8],
            revenus_nets_mensuels: 0.0,
            logement: LogementStatus::Locataire,
            loyer_mensuel: 700.0,
            zone_apl: Some(2),
            ..Default::default()
        };
        let b = b();
        let rsa = calc_rsa(&s, &b);
        let apl = calc_apl(&s, &b);
        let af = calc_allocations_familiales(&s, &b);
        let paje = calc_paje(&s, &b);
        let noel = calc_prime_noel(&s, &b);
        assert!(rsa.eligible, "P5: RSA");
        assert!(apl.eligible, "P5: APL");
        assert!(af.eligible, "P5: AF");
        assert!(paje.eligible, "P5: PAJE");
        assert!(noel.eligible, "P5: PrimeNoel");
        let total: f64 = [&rsa, &apl, &af, &paje, &noel]
            .iter()
            .filter_map(|r| r.montant_mensuel)
            .sum();
        assert!(total > 1500.0, "P5: total mensuel {total:.0}€ >= 1500€");
    }
}

