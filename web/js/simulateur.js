    const TOTAL_STEPS = 5;
    let currentStep = 1;

    // Saisies : mémoire uniquement (rien persisté, rien transmis)
    const answers = {};
    function saveAnswers() { /* mémoire uniquement — pas de stockage */ }

    // Choice buttons
    document.querySelectorAll('.choice-btn[data-field]').forEach(btn => {
      btn.addEventListener('click', () => {
        const field = btn.dataset.field;
        const value = btn.dataset.value;
        // Deselect siblings
        document.querySelectorAll(`.choice-btn[data-field="${field}"]`).forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        answers[field] = value;
      });
    });

    // Sliders
    ['age', 'loyer', 'revenu', 'anciennete'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => {
          answers[id] = parseInt(el.value);
        });
      }
    });

    function updateRevenu(val) {
      const n = parseInt(val);
      document.getElementById('revenuDisplay').firstChild.textContent =
        n.toLocaleString('fr-FR') + ' ';
      answers.revenu = n;
      saveAnswers();
    }

    function updateUI() {
      // Steps visibility
      document.querySelectorAll('.sim-step').forEach((el, i) => {
        el.classList.toggle('active', i + 1 === currentStep);
      });

      // Progress
      const pct = (currentStep / TOTAL_STEPS) * 100;
      document.getElementById('progressFill').style.width = pct + '%';
      document.getElementById('progressbar').setAttribute('aria-valuenow', currentStep);
      document.getElementById('stepCounter').textContent = `Etape ${currentStep} / ${TOTAL_STEPS}`;

      // Dots
      document.querySelectorAll('.step-dot').forEach((dot, i) => {
        dot.classList.toggle('done', i + 1 < currentStep);
        dot.classList.toggle('active', i + 1 === currentStep);
      });

      // Buttons
      document.getElementById('btnBack').disabled = currentStep === 1;
      const nextLabel = document.getElementById('btnNextLabel');
      if (currentStep === TOTAL_STEPS) {
        nextLabel.setAttribute('data-i18n', 'simulator.see_results');
        nextLabel.textContent = 'Voir mes resultats';
      } else {
        nextLabel.setAttribute('data-i18n', 'common.next');
        nextLabel.textContent = 'Suivant';
      }
    }

    function nextStep() {
      if (currentStep < TOTAL_STEPS) {
        currentStep++;
        updateUI();
        window.scrollTo({ top: 0, behavior: 'smooth' });

      } else {
        submitSimulation();
      }
    }

    function prevStep() {
      if (currentStep > 1) {
        currentStep--;
        updateUI();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }

    async function submitSimulation() {
      const btnNext = document.getElementById('btnNext');
      btnNext.disabled = true;
      btnNext.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Calcul en cours…';

      const payload = buildPayload();

      // Moteur local — calcul dans le navigateur, rien n'est transmis ni stocké
      const results = simulate(payload);
      displayResults(results);
    }

    function buildPayload() {
      const age = parseInt(document.getElementById('age').value);
      const revenu = parseInt(document.getElementById('revenu').value);
      const loyer = parseInt(document.getElementById('loyer').value);
      const anciennete = parseInt(document.getElementById('anciennete').value);
      const nbEnfants = parseInt(answers.nb_enfants) || 0;
      const tauxIncapacite = parseInt(answers.taux_incapacite) || 0;

      // Map frontend statut_emploi values to backend EmploiStatus enum
      const emploiMap = {
        salarie_cdi: 'salarie', salarie_cdd: 'salarie',
        independant: 'independant', chomeur: 'chomeur',
        etudiant: 'etudiant', retraite: 'retraite',
        sans_emploi: 'sans_emploi', apprenti: 'alternant_apprentissage'
      };
      const emploi = emploiMap[answers.statut_emploi] || answers.statut_emploi || 'chomeur';

      // Map frontend logement values to backend LogementStatus enum
      const logementMap = {
        locataire: 'locataire', proprietaire: 'proprietaire',
        heberge: 'heberge', sans_domicile: 'sans_domicile', foyer: 'foyer'
      };
      const logement = logementMap[answers.statut_logement] || 'locataire';

      return {
        age,
        revenus_nets_mensuels: revenu,
        revenus_conjoint: 0,
        loyer_mensuel: loyer,
        anciennete_emploi_mois: anciennete,
        heures_semaine: emploi === 'salarie' ? 35 : 0,
        situation_familiale: answers.situation_familiale || 'celibataire',
        nb_enfants: nbEnfants,
        ages_enfants: Array.from({ length: nbEnfants }, () => 5),
        logement,
        zone_apl: parseInt(answers.zone_apl) || 3,
        patrimoine_estime: 0,
        aides_percues: [],
        ald: answers.ald === 'true',
        rqth: answers.rqth === 'true' || tauxIncapacite >= 50,
        invalidite: tauxIncapacite >= 80,
        dependance: false,
        gir: null,
        cmu_c: answers.cmu_c === 'true',
        emploi,
        primo_accedant: false,
        etudiant_boursier: answers.allocations_caf === 'true'
      };
    }

    // ── Barèmes 2026 (source: service-public.fr, CAF, France Travail) ──────────
    const B = {
      rsa_seul: 646.52, rsa_couple: 969.78, rsa_parent_isole: 969.78, rsa_par_enfant: 258.61,
      pa_forfait_seul: 633.21, pa_forfait_couple: 949.82, pa_bonif_max: 253.28, pa_seuil_bonif: 813.12, smic_net: 1398.69,
      apl_plafond_loyer: [900, 650, 550], apl_plafond_rev: [1700, 1500, 1300],
      aah_max: 1033.32, mva_montant: 107.48,
      ass_journalier: 19.33, ass_plafond_seul: 1353.10, ass_plafond_couple: 2126.30,
      are_min_journalier: 32.13, are_part_fixe: 13.18,
      ce_rfr_uc: [5700, 10800, 17400, 27700], ce_montant: [194, 146, 98, 48],
      af_2enf_modeste: 151.05, af_2enf_moyen: 75.53, af_2enf_eleve: 37.77,
      af_par_enf_sup_modeste: 193.81, af_par_enf_sup_moyen: 96.91, af_par_enf_sup_eleve: 48.45,
      af_seuil_modeste: 5708, af_seuil_moyen: 7583,
      cf_modeste: 173.08, cf_majore: 259.09, cf_plafond_rev: 2700,
      css_gratuit_seul: 930, css_payant_seul: 1254,
      ars_montants: [423.48, 446.85, 462.32], ars_plafond_1enf: 27900, ars_par_enf_sup: 8200,
      aspa_seul: 1043.59, aspa_couple: 1620.18,
      asi_max: 466.26,
      paje_alloc_base: 196.59, paje_alloc_partielle: 98.30, paje_plafond_tp_seul: 2500, paje_plafond_tp_couple: 3750,
      noel_seul: 152.45, noel_couple: 228.67, noel_par_enf: 60.98,
      cej_max: 528.60,
      bcs_echelon: [106.65, 183.51, 263.83, 344.14, 424.46, 471.25, 517.92, 563.50],
      asf_par_enf: 170.62, aeeh_base: 140.33,
      pch_taux_horaire: 18.18, pch_plafond_hum: 1743,
    };

    // ── Helpers ───────────────────────────────────────────────────────────────
    function revFoyer(p) { return (p.revenus_nets_mensuels || 0) + (p.revenus_conjoint || 0); }
    function isCouple(p) { return p.situation_familiale === 'couple' || p.situation_familiale === 'marie'; }
    function isParentIsole(p) { return p.situation_familiale === 'parent_isole' || p.situation_familiale === 'veuf'; }
    function plafondFoyer(base, nbAdultes, nbEnf) { return base + (nbAdultes - 1) * base * 0.5 + nbEnf * base * 0.3; }
    function nbAdultes(p) { return isCouple(p) ? 2 : 1; }
    function aide(id, nom, montant, cat, etapes, desc) {
      return { id, nom, montant_mensuel: Math.round(montant * 100) / 100, categorie: cat, nb_etapes: etapes, desc };
    }

    // ── Moteur de calcul — 20 aides, barèmes 2026 ────────────────────────────
    function simulate(p) {
      const results = [];
      const rev = revFoyer(p);
      const emploi = p.emploi || 'sans_emploi';
      const nb_enf = p.nb_enfants || 0;
      const age = p.age || 30;

      // ── RSA ──────────────────────────────────────────────────────────────
      const exRsa = emploi === 'salarie' || emploi === 'independant' || emploi === 'retraite' || emploi === 'etudiant' || emploi === 'alternant_apprentissage';
      if (!exRsa && !(age < 25 && nb_enf === 0)) {
        const plafond = isCouple(p) ? B.rsa_couple : isParentIsole(p) ? B.rsa_parent_isole + nb_enf * B.rsa_par_enfant : B.rsa_seul;
        const m = Math.max(0, plafond - rev);
        if (m >= 1) results.push(aide('rsa', 'RSA — Revenu de Solidarité Active', m, 'revenus', 5, 'Minimum social pour ceux sans revenu ou revenus très faibles.'));
      }

      // ── Prime d'activité ─────────────────────────────────────────────────
      if (emploi === 'salarie' && rev < 1800) {
        const mf = isCouple(p) ? B.pa_forfait_couple : B.pa_forfait_seul;
        const bonif = rev >= B.pa_seuil_bonif ? Math.min(B.pa_bonif_max, (rev - B.pa_seuil_bonif) * 0.61) : 0;
        const pa_brut = mf + 0.61 * rev + bonif;
        const m = Math.max(0, pa_brut - rev);
        if (m >= 10) results.push(aide('prime-activite', "Prime d'Activité", m, 'revenus', 3, 'Complément de revenu pour les travailleurs à salaire modeste.'));
      }

      // ── APL ──────────────────────────────────────────────────────────────
      if ((p.logement === 'locataire' || p.logement === 'foyer') && p.loyer_mensuel >= 10) {
        const z = (p.zone_apl || 3) - 1;
        const plafLoy = B.apl_plafond_loyer[z] || 550;
        const plafRev = B.apl_plafond_rev[z] || 1300;
        const loyer = Math.min(p.loyer_mensuel, plafLoy);
        const taux = Math.max(0, 1 - rev / plafRev);
        const m = Math.round(loyer * 0.40 * taux);
        if (m >= 10) results.push(aide('apl', 'APL — Aide Personnalisée au Logement', m, 'logement', 4, 'Aide au paiement du loyer versée par la CAF.'));
      }

      // ── ALS (si APL non applicable) ───────────────────────────────────────
      const hasApl = results.some(a => a.id === 'apl');
      if (!hasApl && (p.logement === 'locataire') && p.loyer_mensuel >= 10) {
        const z = (p.zone_apl || 3) - 1;
        const plafLoy = B.apl_plafond_loyer[z] || 550;
        const plafRev = B.apl_plafond_rev[z] || 1300;
        const loyer = Math.min(p.loyer_mensuel, plafLoy);
        const taux = Math.max(0, 1 - rev / plafRev);
        const m = Math.round(loyer * 0.35 * taux);
        if (m >= 10) results.push(aide('als', 'ALS — Allocation de Logement Sociale', m, 'logement', 4, 'Aide logement pour les personnes non éligibles à l'APL.'));
      }

      // ── AAH ──────────────────────────────────────────────────────────────
      if (p.invalidite || p.rqth) {
        const abat = (emploi === 'salarie') ? 0.80 : 0;
        const m = Math.max(0, B.aah_max - rev * (1 - abat));
        if (m >= 1) results.push(aide('aah', 'AAH — Allocation aux Adultes Handicapés', m, 'handicap', 6, 'Allocation mensuelle garantissant un minimum de ressources aux personnes handicapées.'));
      }

      // ── MVA ───────────────────────────────────────────────────────────────
      if ((p.invalidite || p.rqth) && p.logement === 'locataire' && !isCouple(p)) {
        const aahResult = results.find(a => a.id === 'aah');
        if (aahResult && aahResult.montant_mensuel >= B.aah_max * 0.9) {
          results.push(aide('mva', 'MVA — Majoration Vie Autonome', B.mva_montant, 'handicap', 2, 'Majoration pour handicapés vivant seuls en logement autonome.'));
        }
      }

      // ── PCH ───────────────────────────────────────────────────────────────
      if (p.invalidite) {
        const heures_mois = 4 * 30;
        const m = Math.min(B.pch_taux_horaire * heures_mois, B.pch_plafond_hum);
        results.push(aide('pch', 'PCH — Prestation de Compensation du Handicap', m, 'handicap', 7, 'Aide humaine pour les personnes en situation de handicap sévère nécessitant assistance au quotidien.'));
      }

      // ── Chèque énergie ────────────────────────────────────────────────────
      const uc = Math.max(1, nbAdultes(p) + nb_enf * 0.5);
      const rfr_uc = rev * 12 / uc;
      let ce_m = 0;
      for (let i = 0; i < B.ce_rfr_uc.length; i++) {
        if (rfr_uc < B.ce_rfr_uc[i]) { ce_m = B.ce_montant[i] / 12; break; }
      }
      if (ce_m > 0) results.push(aide('cheque-energie', 'Chèque Énergie', ce_m, 'energie', 1, 'Aide automatique envoyée par courrier pour payer les factures d'énergie.'));

      // ── CSS ───────────────────────────────────────────────────────────────
      const cssPlafond = plafondFoyer(B.css_gratuit_seul, nbAdultes(p), nb_enf);
      if (rev <= plafondFoyer(B.css_payant_seul, nbAdultes(p), nb_enf)) {
        const gratuit = rev <= cssPlafond;
        const val = gratuit ? (age < 30 ? 700 : age < 50 ? 900 : 1100) / 12 : 25;
        results.push(aide('css', 'CSS — Complémentaire Santé Solidaire', val, 'sante', 2, gratuit ? 'Mutuelle santé 100% gratuite (remplace CMU-C).' : 'Participation inférieure à 1€/jour pour une mutuelle complète.'));
      }

      // ── Allocations familiales ────────────────────────────────────────────
      if (nb_enf >= 2) {
        const rev_annuel = rev * 12;
        let base2, parSup;
        if (rev_annuel < B.af_seuil_modeste) { base2 = B.af_2enf_modeste; parSup = B.af_par_enf_sup_modeste; }
        else if (rev_annuel < B.af_seuil_moyen) { base2 = B.af_2enf_moyen; parSup = B.af_par_enf_sup_moyen; }
        else { base2 = B.af_2enf_eleve; parSup = B.af_par_enf_sup_eleve; }
        const m = base2 + Math.max(0, nb_enf - 2) * parSup;
        if (m >= 1) results.push(aide('allocations-familiales', 'Allocations Familiales', m, 'famille', 2, 'Aide mensuelle pour les familles ayant au moins 2 enfants à charge.'));
      }

      // ── Complément familial ───────────────────────────────────────────────
      const ages_enf = p.ages_enfants || Array(nb_enf).fill(5);
      const nb_enf_3plus = ages_enf.filter(a => a >= 3).length;
      if (nb_enf >= 3 && nb_enf_3plus >= 3 && rev <= B.cf_plafond_rev + Math.max(0, nb_enf - 3) * 200) {
        const monopar = isParentIsole(p);
        results.push(aide('complement-familial', 'Complément Familial', monopar ? B.cf_majore : B.cf_modeste, 'famille', 3, 'Aide pour les familles nombreuses (3 enfants et plus de 3 ans).'));
      }

      // ── PAJE ─────────────────────────────────────────────────────────────
      const nb_enf_0_3 = ages_enf.filter(a => a < 3).length;
      if (nb_enf_0_3 > 0) {
        const plafPaje = isCouple(p) ? B.paje_plafond_tp_couple : B.paje_plafond_tp_seul;
        const m = rev <= plafPaje ? B.paje_alloc_base : B.paje_alloc_partielle;
        if (m > 0) results.push(aide('paje', 'PAJE — Prestation d'Accueil du Jeune Enfant', m, 'famille', 3, 'Aide mensuelle pour les familles avec un enfant de moins de 3 ans.'));
      }

      // ── ARS ───────────────────────────────────────────────────────────────
      const nb_enf_scol = ages_enf.filter(a => a >= 6 && a <= 18).length;
      if (nb_enf_scol > 0) {
        const rev_annuel = rev * 12;
        const plafArs = B.ars_plafond_1enf + Math.max(0, nb_enf_scol - 1) * B.ars_par_enf_sup;
        if (rev_annuel <= plafArs) {
          const age_ref = ages_enf.find(a => a >= 6 && a <= 18) || 12;
          const idx = age_ref <= 10 ? 0 : age_ref <= 14 ? 1 : 2;
          const m_annuel = B.ars_montants[idx] * nb_enf_scol;
          results.push(aide('ars', 'ARS — Allocation de Rentrée Scolaire', m_annuel / 12, 'famille', 1, 'Aide versée chaque août pour les frais de rentrée scolaire (6-18 ans).'));
        }
      }

      // ── ASF (parent isolé) ────────────────────────────────────────────────
      if (isParentIsole(p) && nb_enf >= 1) {
        results.push(aide('asf', 'ASF — Allocation de Soutien Familial', B.asf_par_enf * nb_enf, 'famille', 3, 'Aide pour les familles sans soutien de l'autre parent (séparation, décès).'));
      }

      // ── ASPA (minimum vieillesse) ─────────────────────────────────────────
      if (emploi === 'retraite' && age >= 65) {
        const plafond = isCouple(p) ? B.aspa_couple : B.aspa_seul;
        const base = isCouple(p) ? B.aspa_couple - 635 : B.aspa_seul - 646.52;
        const m = Math.max(0, base - (rev - 646));
        if (m >= 1) results.push(aide('aspa', 'ASPA — Minimum Vieillesse', m, 'seniors', 4, 'Allocation complémentaire pour les retraités aux très faibles revenus (65 ans et plus).'));
      }

      // ── MICO (minimum contributif) ────────────────────────────────────────
      if (emploi === 'retraite' && rev < 934) {
        const m = Math.max(0, 934.27 - rev);
        if (m >= 5) results.push(aide('minimum-retraite', 'MICO — Minimum Contributif Retraite', m, 'seniors', 3, 'Complément automatique pour porter les petites retraites à un minimum de 934€/mois.'));
      }

      // ── ARE ───────────────────────────────────────────────────────────────
      if ((emploi === 'chomeur' || emploi === 'sans_emploi') && p.anciennete_emploi_mois >= 6) {
        const salRef = rev > 0 ? rev : 1400;
        const sjr = salRef * 12 / 365;
        const journalier = Math.max(B.are_min_journalier, Math.max(0.404 * sjr + B.are_part_fixe, 0.57 * sjr));
        const m = journalier * 30;
        results.push(aide('are', 'ARE — Allocation de Retour à l'Emploi', m, 'emploi', 3, 'Indemnisation chômage versée par France Travail après perte d'emploi involontaire.'));
      }

      // ── ASS (après ARE) ───────────────────────────────────────────────────
      if ((emploi === 'chomeur' || emploi === 'sans_emploi') && p.anciennete_emploi_mois >= 60 && !results.some(a => a.id === 'are')) {
        const plafond = isCouple(p) ? B.ass_plafond_couple : B.ass_plafond_seul;
        if (rev < plafond) {
          const m = B.ass_journalier * 30;
          results.push(aide('ass', 'ASS — Allocation de Solidarité Spécifique', m, 'emploi', 4, 'Allocation pour les chômeurs en fin de droits ARE ayant travaillé 5 ans au cours des 10 dernières années.'));
        }
      }

      // ── CEJ ───────────────────────────────────────────────────────────────
      if (age >= 16 && age <= 25 && (emploi === 'sans_emploi' || emploi === 'chomeur' || emploi === 'etudiant') && rev < 800) {
        results.push(aide('cej', 'CEJ — Contrat Engagement Jeune', B.cej_max, 'jeunes', 2, 'Accompagnement intensif vers l'emploi/formation pour les 16-25 ans (allocation jusqu'à 528€/mois).'));
      }

      // ── Bourse CROUS ──────────────────────────────────────────────────────
      if (emploi === 'etudiant') {
        let echelon = -1;
        if (rev < 300) echelon = 7;
        else if (rev < 500) echelon = 6;
        else if (rev < 700) echelon = 5;
        else if (rev < 900) echelon = 4;
        else if (rev < 1100) echelon = 3;
        else if (rev < 1400) echelon = 2;
        else if (rev < 1800) echelon = 1;
        if (echelon >= 0) results.push(aide('bourse-crous', 'Bourse CROUS — Critères Sociaux', B.bcs_echelon[echelon], 'jeunes', 2, `Bourse mensuelle sur critères sociaux (échelon ${echelon}) pour financer les études supérieures.`));
      }

      // ── Prime de Noël ─────────────────────────────────────────────────────
      const hasRsaOrAss = results.some(a => a.id === 'rsa' || a.id === 'ass');
      if (hasRsaOrAss) {
        const m_annuel = isCouple(p) ? B.noel_couple + nb_enf * B.noel_par_enf : B.noel_seul + nb_enf * B.noel_par_enf;
        results.push(aide('prime-noel', 'Prime de Noël', m_annuel / 12, 'revenus', 1, 'Prime annuelle versée en décembre aux bénéficiaires du RSA ou de l'ASS.'));
      }

      // ── MaPrimeRénov ──────────────────────────────────────────────────────
      if (p.logement === 'proprietaire') {
        const rfr_uc_renov = rev * 12 / uc;
        let m_annuel = 0;
        if (rfr_uc_renov < 2500) m_annuel = 6000;
        else if (rfr_uc_renov < 3500) m_annuel = 4000;
        else if (rfr_uc_renov < 7500) m_annuel = 2500;
        else if (rfr_uc_renov < 14000) m_annuel = 1500;
        if (m_annuel > 0) results.push(aide('ma-prime-renov', "MaPrimeRénov'", m_annuel / 12, 'logement', 5, 'Aide à la rénovation énergétique pour les propriétaires occupants.'));
      }

      results.sort((a, b) => b.montant_mensuel - a.montant_mensuel);

      return {
        aides: results,
        total_mensuel: results.reduce((s, a) => s + a.montant_mensuel, 0),
        nb_aides: results.length,
        situation: p
      };
    }

    // ── Icônes par catégorie ──────────────────────────────────────────────────
    const CAT_ICONS = {
      revenus:  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
      logement: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
      handicap: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="4" r="2"/><path d="M19 13s-3.5-1-7-1-7 1-7 1l1 4h12l1-4z"/><path d="M8 17v4m8-4v4"/></svg>',
      energie:  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
      sante:    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
      famille:  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
      emploi:   '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>',
      seniors:  '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="7" r="4"/><path d="M6 21v-2a6 6 0 0 1 6-6"/><path d="M18 17a3 3 0 0 1-6 0v-2h6v2z"/></svg>',
      jeunes:   '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>',
    };

    function displayResults(res) {
      document.querySelector('.sim-wizard')?.classList.add('hidden');
      document.getElementById('stepNav')?.classList.add('hidden');

      let section = document.getElementById('sim-results');
      if (!section) {
        section = document.createElement('section');
        section.id = 'sim-results';
        section.setAttribute('aria-label', 'Résultats de simulation');
        document.querySelector('main')?.appendChild(section);
      }

      const total = res.total_mensuel || 0;
      const aides = res.aides || [];

      if (aides.length === 0) {
        section.innerHTML = `
          <div class="sr-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--c-text-muted)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="8" y1="15" x2="16" y2="15"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
            <p>Aucune aide détectée avec ces informations.</p>
            <p class="sr-empty-sub">Essayez de modifier vos réponses ou consultez directement les organismes (CAF, France Travail, MDPH).</p>
            <button class="btn btn-outline" id="btnRestart">Recommencer le questionnaire</button>
          </div>`;
      } else {
        const totalFormatted = Math.round(total).toLocaleString('fr-FR');
        section.innerHTML = `
          <div class="sr-hero">
            <div class="sr-hero__inner">
              <p class="sr-hero__label">Vos aides estimées</p>
              <div class="sr-hero__total">
                <span class="sr-hero__amount">${totalFormatted} €</span>
                <span class="sr-hero__period">/mois</span>
              </div>
              <p class="sr-hero__sub">${aides.length} aide${aides.length > 1 ? 's' : ''} identifiée${aides.length > 1 ? 's' : ''} · Calcul 100% local, aucune donnée transmise</p>
            </div>
          </div>

          <ul class="sr-list" role="list">
            ${aides.map(a => {
              const icon = CAT_ICONS[a.categorie] || CAT_ICONS.revenus;
              const amt = a.montant_mensuel >= 1 ? Math.round(a.montant_mensuel).toLocaleString('fr-FR') + ' €/mois' : 'Variable';
              return `
                <li class="sr-card">
                  <div class="sr-card__icon sr-card__icon--${a.categorie}">${icon}</div>
                  <div class="sr-card__body">
                    <div class="sr-card__name">${a.nom}</div>
                    ${a.desc ? `<p class="sr-card__desc">${a.desc}</p>` : ''}
                  </div>
                  <div class="sr-card__right">
                    <span class="sr-card__amount">${amt}</span>
                    <a href="aides/${a.id}.html" class="sr-card__link">En savoir plus</a>
                  </div>
                </li>`;
            }).join('')}
          </ul>

          <div class="sr-footer">
            <p class="sr-note">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Estimation basée sur les barèmes officiels 2026 · Calculé localement dans votre navigateur, aucune donnée transmise, aucun stockage
            </p>
            <button class="btn btn-outline" id="btnRestart">Refaire la simulation</button>
          </div>`;
      }

      section.classList.remove('hidden');
      section.scrollIntoView({ behavior: 'smooth' });

      // Listener on restart button (no inline onclick)
      const btnRestart = document.getElementById('btnRestart');
      if (btnRestart) btnRestart.addEventListener('click', resetSimulation);
    }

    function resetSimulation() {
      document.getElementById('sim-results')?.remove();
      document.querySelector('.sim-wizard')?.classList.remove('hidden');
      document.getElementById('stepNav')?.classList.remove('hidden');
      Object.keys(answers).forEach(k => delete answers[k]);
      currentStep = 1;
      updateUI();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }


    // Restaure UI depuis answers en mémoire (pré-remplissage profil URL)
    function restoreUI() {
      Object.entries(answers).forEach(([field, value]) => {
        const btn = document.querySelector(`.choice-btn[data-field="${field}"][data-value="${value}"]`);
        if (btn) {
          document.querySelectorAll(`.choice-btn[data-field="${field}"]`).forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
        }
        const slider = document.getElementById(field);
        if (slider) {
          slider.value = value;
          slider.dispatchEvent(new Event('input'));
        }
      });
    }

    // Pré-remplissage depuis paramètre URL ?profil=
    (function applyProfile() {
      const profil = new URLSearchParams(location.search).get('profil');
      if (!profil) return;
      const presets = {
        parent:  { situation_familiale: 'parent_isole', nb_enfants: '1' },
        jeune:   { statut_emploi: 'etudiant' },
        salarie: { statut_emploi: 'salarie_cdi' },
        chomeur: { statut_emploi: 'chomeur' },
        senior:  { statut_emploi: 'retraite' },
        handicap:{ rqth: 'true', taux_incapacite: '80' }
      };
      const p = presets[profil];
      if (p) {
        Object.assign(answers, p);
        saveAnswers();
        // Analytics : quelle persona a cliqué

      }
    })();

    updateUI();

// ── Event listeners (replaces inline handlers) ────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  // Slider: age
  const ageEl = document.getElementById('age');
  if (ageEl) ageEl.addEventListener('input', function() {
    document.getElementById('ageDisplay').firstChild.textContent = this.value + ' ';
    answers.age = parseInt(this.value);
  });

  // Slider: loyer
  const loyerEl = document.getElementById('loyer');
  if (loyerEl) loyerEl.addEventListener('input', function() {
    document.getElementById('loyerDisplay').firstChild.textContent = this.value + ' ';
    answers.loyer = parseInt(this.value);
  });

  // Slider: anciennete
  const ancEl = document.getElementById('anciennete');
  if (ancEl) ancEl.addEventListener('input', function() {
    document.getElementById('ancienneteDisplay').firstChild.textContent = this.value + ' ';
    answers.anciennete = parseInt(this.value);
  });

  // Slider: revenu
  const revEl = document.getElementById('revenu');
  if (revEl) revEl.addEventListener('input', function() { updateRevenu(this.value); });

  // Nav buttons
  const btnBack = document.getElementById('btnBack');
  const btnNext = document.getElementById('btnNext');
  if (btnBack) btnBack.addEventListener('click', prevStep);
  if (btnNext) btnNext.addEventListener('click', nextStep);
});
