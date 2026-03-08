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

    // ── Barèmes 2026 (source: service-public.fr, CAF, France Travail, ADEME) ─
    const B = {
      rsa_seul: 646.52, rsa_couple: 969.78, rsa_parent_isole: 969.78, rsa_par_enfant: 258.61,
      pa_forfait_seul: 633.21, pa_forfait_couple: 949.82, pa_bonif_max: 253.28, pa_seuil_bonif: 813.12, smic_net: 1398.69,
      apl_plafond_loyer: [900, 650, 550], apl_plafond_rev: [1700, 1500, 1300],
      aah_max: 1033.32, mva_montant: 107.48,
      pch_taux_horaire: 18.18, pch_plafond_hum: 1743,
      aeeh_base: 140.33, asi_max: 466.26,
      ass_journalier: 19.33, ass_plafond_seul: 1353.10, ass_plafond_couple: 2126.30,
      are_min_journalier: 32.13, are_part_fixe: 13.18,
      ce_rfr_uc: [5700, 7700, 10700, 11500], ce_montant_base: [194, 146, 98, 48],
      af_2enf_modeste: 151.05, af_2enf_moyen: 75.53, af_2enf_eleve: 37.77,
      af_par_enf_sup_modeste: 193.81, af_par_enf_sup_moyen: 96.91, af_par_enf_sup_eleve: 48.45,
      af_seuil_modeste: 5708, af_seuil_moyen: 7583,
      cf_modeste: 173.08, cf_majore: 259.09, cf_plafond_rev: 2700,
      paje_alloc_base: 196.59, paje_alloc_partielle: 98.30, paje_plafond_tp_seul: 2500, paje_plafond_tp_couple: 3750,
      asf_par_enf: 170.62,
      ars_montants: [423.48, 446.85, 462.32], ars_plafond_1enf: 27900, ars_par_enf_sup: 8200,
      css_gratuit_seul: 930, css_payant_seul: 1254,
      aspa_seul: 1043.59, aspa_couple: 1620.18,
      cej_max: 528.60,
      bcs_echelon: [106.65, 183.51, 263.83, 344.14, 424.46, 471.25, 517.92, 563.50],
      pass_culture: 300,
      noel_seul: 152.45, noel_couple: 228.67, noel_par_enf: 60.98,
      visale_plafond: [1500, 1300, 1000],
    };

    // ── Helpers ───────────────────────────────────────────────────────────────
    function revFoyer(p) { return (p.revenus_nets_mensuels || 0) + (p.revenus_conjoint || 0); }
    function isCouple(p) { return p.situation_familiale === 'couple' || p.situation_familiale === 'marie'; }
    function isParentIsole(p) { return p.situation_familiale === 'parent_isole' || p.situation_familiale === 'veuf'; }
    function nbAdultes(p) { return isCouple(p) ? 2 : 1; }
    function plafondFoyer(base, nba, nbEnf) { return base + (nba - 1) * base * 0.5 + nbEnf * base * 0.3; }
    function r2(n) { return Math.round(n * 100) / 100; }
    function mk(id, nom, montant, cat, etapes, desc, opts) {
      return Object.assign({ id, nom, montant_mensuel: r2(Math.max(0, montant)), categorie: cat, nb_etapes: etapes, desc }, opts || {});
    }
    function mka(id, nom, montant, cat, desc) {
      return mk(id, nom, montant, cat, 2, desc, { approx: true });
    }
    function infoaide(id, nom, cat, desc) {
      return mk(id, nom, 0, cat, 2, desc, { info_only: true });
    }

    // ── Moteur 71 aides — barèmes 2026 ───────────────────────────────────────
    function simulate(p) {
      const out = [];
      const add = (a) => { if (a) out.push(a); };

      const rev   = revFoyer(p);
      const emploi = p.emploi || 'sans_emploi';
      const log   = p.logement || 'locataire';
      const nb_enf = p.nb_enfants || 0;
      const age   = p.age || 30;
      const anc   = p.anciennete_emploi_mois || 0;
      const zone  = p.zone_apl || 3;
      const loyer = p.loyer_mensuel || 0;
      const ages_enf = p.ages_enfants || Array(nb_enf).fill(5);
      const uc    = Math.max(1, nbAdultes(p) + nb_enf * 0.5);
      const rfr_uc = rev * 12 / uc;

      const est_invalide   = !!p.invalidite;
      const est_rqth       = !!p.rqth || est_invalide;
      const est_ald        = !!p.ald;
      const est_salarie    = emploi === 'salarie';
      const est_chomeur    = emploi === 'chomeur' || emploi === 'sans_emploi';
      const est_retraite   = emploi === 'retraite';
      const est_etudiant   = emploi === 'etudiant';
      const est_independant = emploi === 'independant';
      const est_proprio    = log === 'proprietaire';
      const est_locataire  = log === 'locataire' || log === 'foyer';
      const monopar = isParentIsole(p);
      const couple  = isCouple(p);
      const nb0_3   = ages_enf.filter(a => a < 3).length;
      const nb_scol = ages_enf.filter(a => a >= 6 && a <= 18).length;
      const nb3plus = ages_enf.filter(a => a >= 3).length;

      // ── 1. RSA ────────────────────────────────────────────────────────────
      const exRsa = est_salarie || est_independant || est_retraite || est_etudiant || emploi === 'alternant_apprentissage';
      if (!exRsa && !(age < 25 && nb_enf === 0)) {
        const plaf = couple ? B.rsa_couple : monopar ? B.rsa_parent_isole + nb_enf * B.rsa_par_enfant : B.rsa_seul;
        const m = Math.max(0, plaf - rev);
        if (m >= 1) add(mk('rsa','RSA \u2014 Revenu de Solidarit\u00e9 Active', m, 'revenus', 5,
          'Revenu minimum garanti pour les personnes sans emploi ou aux ressources tr\u00e8s faibles.'));
      }

      // ── 2. Prime d'activit\u00e9 ─────────────────────────────────────────────
      if (est_salarie && rev < 1800) {
        const mf = couple ? B.pa_forfait_couple : B.pa_forfait_seul;
        const bonif = rev >= B.pa_seuil_bonif ? Math.min(B.pa_bonif_max, (rev - B.pa_seuil_bonif) * 0.61) : 0;
        const m = Math.max(0, mf + 0.61 * rev + bonif - rev);
        if (m >= 10) add(mk('prime-activite','Prime d\u2019Activit\u00e9', m, 'revenus', 3,
          'Compl\u00e9ment mensuel pour les travailleurs \u00e0 salaire modeste (SMIC ou proche).'));
      }

      // ── 3. ARE ───────────────────────────────────────────────────────────
      if (est_chomeur && anc >= 6) {
        const salRef = rev > 0 ? rev : B.smic_net;
        const sjr = salRef * 12 / 365;
        const jour = Math.max(B.are_min_journalier, Math.max(0.404 * sjr + B.are_part_fixe, 0.57 * sjr));
        add(mk('are','ARE \u2014 Allocation de Retour \u00e0 l\u2019Emploi', jour * 30, 'emploi', 3,
          'Indemnisation ch\u00f4mage vers\u00e9e par France Travail apr\u00e8s perte d\u2019emploi involontaire.'));
      }

      // ── 4. ASS ───────────────────────────────────────────────────────────
      if (est_chomeur && anc >= 60 && !out.some(a => a.id === 'are')) {
        const plaf = couple ? B.ass_plafond_couple : B.ass_plafond_seul;
        if (rev < plaf) add(mk('ass','ASS \u2014 Allocation de Solidarit\u00e9 Sp\u00e9cifique', B.ass_journalier * 30, 'emploi', 4,
          'Allocation pour les ch\u00f4meurs en fin de droits ARE ayant travaill\u00e9 5 ans dans les 10 derni\u00e8res ann\u00e9es.'));
      }

      // ── 5. APL ───────────────────────────────────────────────────────────
      if (est_locataire && loyer >= 10) {
        const z = zone - 1;
        const m = Math.round(Math.min(loyer, B.apl_plafond_loyer[z]||550) * 0.40 * Math.max(0, 1 - rev / (B.apl_plafond_rev[z]||1300)));
        if (m >= 10) add(mk('apl','APL \u2014 Aide Personnalis\u00e9e au Logement', m, 'logement', 4,
          'Aide mensuelle vers\u00e9e par la CAF pour r\u00e9duire votre loyer. Calcul\u00e9e selon zone, loyer et revenus.'));
      }

      // ── 6. ALS ───────────────────────────────────────────────────────────
      if (!out.some(a => a.id === 'apl') && est_locataire && loyer >= 10) {
        const z = zone - 1;
        const m = Math.round(Math.min(loyer, B.apl_plafond_loyer[z]||550) * 0.35 * Math.max(0, 1 - rev / (B.apl_plafond_rev[z]||1300)));
        if (m >= 10) add(mk('als','ALS \u2014 Allocation de Logement Sociale', m, 'logement', 4,
          'Aide logement pour les locataires non \u00e9ligibles \u00e0 l\u2019APL (personnes seules, \u00e9tudiants, retrait\u00e9s\u2026).'));
      }

      // ── 7. Visale ─────────────────────────────────────────────────────────
      if (est_locataire && (age < 30 || (est_salarie && rev < 1500))) {
        const plafV = B.visale_plafond[zone - 1] || 1000;
        if (loyer <= plafV || loyer === 0) add(infoaide('visale','Visale \u2014 Garantie Caution Locative', 'logement',
          'Caution locative gratuite (Action Logement) \u2014 couvre jusqu\u2019\u00e0 36 mois d\u2019impa\u00ey\u00e9s. Aucune caution bancaire n\u00e9cessaire.'));
      }

      // ── 8. MaPrimeR\u00e9nov\u2019 ────────────────────────────────────────────────
      if (est_proprio && rfr_uc < 14000) {
        const ma = rfr_uc < 2500 ? 6000 : rfr_uc < 3500 ? 4000 : rfr_uc < 7500 ? 2500 : 1500;
        add(mka('ma-prime-renov','MaPrimeR\u00e9nov\u2019', ma / 12, 'logement',
          'Subvention pour travaux de r\u00e9novation \u00e9nerg\u00e9tique (isolation, chauffage). Vers\u00e9e par l\u2019ANAH.'));
      }

      // ── 9. AAH ───────────────────────────────────────────────────────────
      if (est_rqth) {
        const abat = est_salarie ? 0.80 : 0;
        const m = Math.max(0, B.aah_max - rev * (1 - abat));
        if (m >= 1) add(mk('aah','AAH \u2014 Allocation aux Adultes Handicap\u00e9s', m, 'handicap', 6,
          'Revenu minimum garanti pour les personnes handicap\u00e9es. D\u00e9conjugalis\u00e9e depuis 2023.'));
      }

      // ── 10. MVA ──────────────────────────────────────────────────────────
      if (est_rqth && est_locataire && !couple) {
        const aahR = out.find(a => a.id === 'aah');
        if (aahR && aahR.montant_mensuel >= B.aah_max * 0.9)
          add(mk('mva','MVA \u2014 Majoration Vie Autonome', B.mva_montant, 'handicap', 2,
            'Suppl\u00e9ment automatique \u00e0 l\u2019AAH pour les personnes handicap\u00e9es vivant seules en logement autonome.'));
      }

      // ── 11. PCH ──────────────────────────────────────────────────────────
      if (est_invalide)
        add(mk('pch','PCH \u2014 Prestation de Compensation du Handicap',
          Math.min(B.pch_taux_horaire * 120, B.pch_plafond_hum), 'handicap', 7,
          'Aide humaine (jusqu\u2019\u00e0 1 743\u20ac/mois) pour les personnes en situation de handicap s\u00e9v\u00e8re.'));

      // ── 12. AEEH ─────────────────────────────────────────────────────────
      if (est_rqth && ages_enf.some(a => a < 20))
        add(mk('aeeh','AEEH \u2014 Allocation \u00c9ducation Enfant Handicap\u00e9', B.aeeh_base, 'handicap', 6,
          'Aide pour les familles avec un enfant handicap\u00e9 de moins de 20 ans (taux incapacit\u00e9 \u2265 50%).'));

      // ── 13. ASI ──────────────────────────────────────────────────────────
      if (est_invalide && age < 65 && rev < B.asi_max)
        add(mk('asi','ASI \u2014 Allocation Suppl\u00e9mentaire d\u2019Invalidit\u00e9', Math.max(0, B.asi_max - rev), 'handicap', 4,
          'Compl\u00e9ment de ressources pour les invalides de moins de 65 ans dont la pension est tr\u00e8s faible.'));

      // ── 14. Pension d\u2019invalidit\u00e9 ──────────────────────────────────────────
      if (est_invalide && age < 62 && anc >= 12) {
        const sam = rev > 0 ? rev : B.smic_net;
        add(mk('pension-invalidite','Pension d\u2019Invalidit\u00e9', sam * 0.50, 'handicap', 5,
          'Rente mensuelle vers\u00e9e par la CPAM (50% du salaire r\u00e9f\u00e9rence) pour r\u00e9duction de 2/3 de capacit\u00e9 de travail.'));
      }

      // ── 15. CSS ──────────────────────────────────────────────────────────
      if (rev <= plafondFoyer(B.css_payant_seul, nbAdultes(p), nb_enf)) {
        const gratuit = rev <= plafondFoyer(B.css_gratuit_seul, nbAdultes(p), nb_enf);
        const val = gratuit ? (age < 30 ? 700 : age < 50 ? 900 : 1100) / 12 : 25;
        add(mk('css','CSS \u2014 Compl\u00e9mentaire Sant\u00e9 Solidaire', val, 'sante', 2,
          gratuit ? 'Mutuelle sant\u00e9 100% gratuite pour les revenus les plus modestes (remplace la CMU-C).'
                  : 'Mutuelle compl\u00e8te \u00e0 moins de 1\u20ac/jour pour les foyers \u00e0 revenus interm\u00e9diaires.'));
      }

      // ── 16. Allocations familiales ────────────────────────────────────────
      if (nb_enf >= 2) {
        const ra = rev * 12;
        const b2 = ra < B.af_seuil_modeste ? B.af_2enf_modeste : ra < B.af_seuil_moyen ? B.af_2enf_moyen : B.af_2enf_eleve;
        const sp = ra < B.af_seuil_modeste ? B.af_par_enf_sup_modeste : ra < B.af_seuil_moyen ? B.af_par_enf_sup_moyen : B.af_par_enf_sup_eleve;
        const m = b2 + Math.max(0, nb_enf - 2) * sp;
        if (m >= 1) add(mk('allocations-familiales','Allocations Familiales', m, 'famille', 2,
          'Versement mensuel automatique pour les familles avec 2 enfants ou plus de moins de 20 ans.'));
      }

      // ── 17. Compl\u00e9ment familial ──────────────────────────────────────────
      if (nb_enf >= 3 && nb3plus >= 3 && rev <= B.cf_plafond_rev + Math.max(0, nb_enf - 3) * 200)
        add(mk('complement-familial','Compl\u00e9ment Familial', monopar ? B.cf_majore : B.cf_modeste, 'famille', 3,
          'Aide mensuelle pour les familles nombreuses (3 enfants et plus de 3 ans).'));

      // ── 18. PAJE ─────────────────────────────────────────────────────────
      if (nb0_3 > 0) {
        const plafP = couple ? B.paje_plafond_tp_couple : B.paje_plafond_tp_seul;
        add(mk('paje','PAJE \u2014 Prestation d\u2019Accueil du Jeune Enfant',
          rev <= plafP ? B.paje_alloc_base : B.paje_alloc_partielle, 'famille', 3,
          'Allocation mensuelle pour les familles avec un enfant de moins de 3 ans.'));
      }

      // ── 19. ASF ──────────────────────────────────────────────────────────
      if (monopar && nb_enf >= 1)
        add(mk('asf','ASF \u2014 Allocation de Soutien Familial', B.asf_par_enf * nb_enf, 'famille', 3,
          'Aide pour les parents seuls dont l\u2019enfant n\u2019a pas l\u2019autre parent (s\u00e9paration, d\u00e9c\u00e8s).'));

      // ── 20. ARS ──────────────────────────────────────────────────────────
      if (nb_scol > 0) {
        const plafA = B.ars_plafond_1enf + Math.max(0, nb_scol - 1) * B.ars_par_enf_sup;
        if (rev * 12 <= plafA) {
          const ar = ages_enf.find(a => a >= 6 && a <= 18) || 12;
          const ma = B.ars_montants[ar <= 10 ? 0 : ar <= 14 ? 1 : 2] * nb_scol;
          add(mk('ars','ARS \u2014 Allocation de Rentr\u00e9e Scolaire', ma / 12, 'famille', 1,
            'Aide vers\u00e9e chaque ann\u00e9e en ao\u00fbt pour les frais scolaires des enfants de 6 \u00e0 18 ans.'));
        }
      }

      // ── 21. Ch\u00e8que \u00c9nergie ───────────────────────────────────────────────
      let ce_m = 0;
      for (let i = 0; i < B.ce_rfr_uc.length; i++) {
        if (rfr_uc < B.ce_rfr_uc[i]) { ce_m = (B.ce_montant_base[i] + (uc - 1) * [30,25,20,0][i]) / 12; break; }
      }
      if (ce_m > 0) add(mk('cheque-energie','Ch\u00e8que \u00c9nergie', ce_m, 'energie', 1,
        'Aide automatique envoy\u00e9e chaque avril par la DGFiP pour payer les factures d\u2019\u00e9nergie.'));

      // ── 22. ASPA ─────────────────────────────────────────────────────────
      if (est_retraite && age >= 65) {
        const plaf = couple ? B.aspa_couple : B.aspa_seul;
        const m = Math.max(0, plaf - rev);
        if (m >= 1) add(mk('aspa','ASPA \u2014 Minimum Vieillesse', m, 'seniors', 4,
          'Compl\u00e9ment de retraite pour les personnes de 65 ans et plus dont les revenus sont inf\u00e9rieurs au minimum l\u00e9gal.'));
      }

      // ── 23. MICO ─────────────────────────────────────────────────────────
      if (est_retraite && rev < 934.27) {
        const m = Math.max(0, 934.27 - rev);
        if (m >= 5) add(mk('minimum-retraite','MICO \u2014 Minimum Contributif Retraite', m, 'seniors', 3,
          'Compl\u00e9ment automatique pour porter la pension au minimum contributif (934\u20ac/mois).'));
      }

      // ── 24. CEJ ──────────────────────────────────────────────────────────
      if (age >= 16 && age <= 25 && est_chomeur && rev < 800)
        add(mk('cej','CEJ \u2014 Contrat Engagement Jeune', B.cej_max, 'jeunes', 2,
          'Accompagnement intensif vers l\u2019emploi pour les 16-25 ans (allocation jusqu\u2019\u00e0 528\u20ac/mois).'));

      // ── 25. Bourse CROUS ──────────────────────────────────────────────────
      if (est_etudiant) {
        const seuils = [1800,1400,1100,900,700,500,300];
        const e = seuils.findIndex(s => rev < s);
        if (e >= 0) add(mk('bourse-crous','Bourse CROUS \u2014 Crit\u00e8res Sociaux', B.bcs_echelon[e+1] || B.bcs_echelon[7], 'jeunes', 2,
          'Bourse mensuelle sur crit\u00e8res sociaux pour financer les \u00e9tudes sup\u00e9rieures (107 \u00e0 563\u20ac/mois).'));
      }

      // ── 26. Pass Culture ──────────────────────────────────────────────────
      if (age === 18)
        add(mk('pass-culture','Pass Culture \u2014 Cr\u00e9dit 300\u20ac', B.pass_culture / 12, 'jeunes', 1,
          'Cr\u00e9dit de 300\u20ac sur l\u2019application Pass Culture \u00e0 18 ans pour des offres culturelles.'));

      // ── 27. Prime de No\u00ebl ────────────────────────────────────────────────
      if (out.some(a => a.id === 'rsa' || a.id === 'ass')) {
        const mn = (couple ? B.noel_couple : B.noel_seul) + nb_enf * B.noel_par_enf;
        add(mk('prime-noel','Prime de No\u00ebl', mn / 12, 'revenus', 1,
          'Prime annuelle vers\u00e9e automatiquement en d\u00e9cembre aux b\u00e9n\u00e9ficiaires du RSA ou de l\u2019ASS.'));
      }

      // ── 28. Aide Juridictionnelle ─────────────────────────────────────────
      if (rev < 1650)
        add(infoaide('aide-juridictionnelle','Aide Juridictionnelle', 'justice',
          rev < 1100 ? 'Prise en charge totale des frais d\u2019avocat et de justice (revenus < 1\u202f100\u20ac/mois).'
                     : 'Prise en charge partielle des frais d\u2019avocat selon revenus (jusqu\u2019\u00e0 1\u202f650\u20ac/mois).'));

      // ──────────────────────────────────────────────────────────────────────
      // GROUPE B — 43 aides r\u00e9pertori\u00e9es (montants approx. barèmes 2026)
      // ──────────────────────────────────────────────────────────────────────

      // 29. ALF
      if (!out.some(a => a.id === 'apl' || a.id === 'als') && nb_enf >= 1 && est_locataire && loyer >= 10) {
        const z = zone - 1;
        const m = Math.round(Math.min(loyer, B.apl_plafond_loyer[z]||550) * 0.30 * Math.max(0, 1 - rev / (B.apl_plafond_rev[z]||1300)));
        if (m >= 10) add(mka('alf','ALF \u2014 Allocation de Logement Familiale', m, 'logement',
          'Aide au logement pour les familles avec enfants non \u00e9ligibles \u00e0 l\u2019APL.'));
      }

      // 30. FSL
      if (est_locataire && loyer > 0 && loyer / Math.max(rev, 1) > 0.33 && rev < 1500)
        add(mka('fsl','FSL \u2014 Fonds de Solidarit\u00e9 Logement', 200, 'logement',
          'Aide d\u00e9partementale ponctuelle (200\u20132\u202f000\u20ac) pour impay\u00e9s de loyer, charges ou d\u00e9p\u00f4t de garantie.'));

      // 31. Loca-Pass
      if (est_salarie && age < 30 && est_locataire)
        add(infoaide('loca-pass','Loca-Pass \u2014 Avance Caution', 'logement',
          'Avance gratuite du d\u00e9p\u00f4t de garantie (jusqu\u2019\u00e0 1\u202f200\u20ac), remboursable sur 25 mois sans int\u00e9r\u00eats (Action Logement).'));

      // 32. APL Accession
      if (est_proprio && p.primo_accedant && rev < 2000)
        add(mka('apl-accession','APL Accession', 100, 'logement',
          'Aide mensuelle pour les primo-acc\u00e9dants avec un pr\u00eat immobilier conventionn\u00e9 (PAS ou PC).'));

      // 33. CEE
      if (rfr_uc * 12 < 17000 && (est_proprio || est_locataire))
        add(mka('cee','CEE \u2014 Certificats d\u2019\u00c9conomies d\u2019\u00c9nergie', 42, 'energie',
          'Prime travaux \u00e9conomies d\u2019\u00e9nergie (isolation, pompe \u00e0 chaleur\u2026) vers\u00e9e par les fournisseurs. Cumulable avec MaPrimeR\u00e9nov\u2019.'));

      // 34. Tarif social \u00e9nergie
      if (rev < 2000)
        add(mka('tarif-social-energie','Tarif Social Gaz et \u00c9lectricit\u00e9', 10, 'energie',
          'R\u00e9duction automatique sur vos factures d\u2019\u00e9nergie (env. 80\u2013130\u20ac/an) sur crit\u00e8res de revenus.'));

      // 35. Prime \u00e0 la conversion
      if (age >= 18 && rev < 2000)
        add(mka('prime-conversion','Prime \u00e0 la Conversion V\u00e9hicule', 200, 'energie',
          'Aide (jusqu\u2019\u00e0 2\u202f500\u20ac) pour remplacer un vieux v\u00e9hicule polluant par un mod\u00e8le moins \u00e9metteur.'));

      // 36. Bonus \u00e9cologique
      if (age >= 18)
        add(mka('bonus-ecologique','Bonus \u00c9cologique VE', 250, 'energie',
          'Aide \u00e0 l\u2019achat d\u2019un v\u00e9hicule \u00e9lectrique neuf ou d\u2019occasion (jusqu\u2019\u00e0 3\u202f000\u20ac sous conditions de revenus).'));

      // 37. ACRE
      if (est_chomeur || est_independant)
        add(mka('acre','ACRE \u2014 Aide Cr\u00e9ation/Reprise Entreprise', 250, 'emploi',
          'Exon\u00e9ration partielle de charges sociales pendant 12 mois pour les cr\u00e9ateurs ou repreneurs d\u2019entreprise.'));

      // 38. Ch\u00e8ques Vacances
      if (est_salarie && rev < 2500)
        add(mka('cheques-vacances','Ch\u00e8ques Vacances ANCV', 30, 'emploi',
          'Titre de paiement vacances co-financ\u00e9 par l\u2019employeur (env. 360\u20ac/an) pour salari\u00e9s de PME.'));

      // 39. Aide mobilit\u00e9 France Travail
      if (est_chomeur && anc >= 3)
        add(mka('aide-mobilite','Aide \u00e0 la Mobilit\u00e9 France Travail', 150, 'emploi',
          'Prise en charge des frais de d\u00e9placement pour entretien d\u2019embauche ou formation \u00e9loign\u00e9e.'));

      // 40. AREF
      if (est_chomeur && out.some(a => a.id === 'are'))
        add(infoaide('aref','AREF \u2014 Aide Retour \u00e0 l\u2019Emploi Formation', 'emploi',
          'Maintien de l\u2019ARE pendant toute la dur\u00e9e d\u2019une formation prescrite par France Travail + remboursement frais.'));

      // 41. CLCMG
      if (nb0_3 > 0 && rev < 3000)
        add(mka('clcmg','CLCMG \u2014 Compl\u00e9ment Mode de Garde', 400, 'famille',
          'Aide (jusqu\u2019\u00e0 600\u20ac/mois) pour les frais de garde d\u2019un enfant de moins de 6 ans chez une assistante maternelle agr\u00e9\u00e9e.'));

      // 42. PreParE
      if (nb_enf >= 1 && ages_enf.some(a => a < 3) && (est_salarie || est_independant))
        add(mka('prepare','PreParE \u2014 Cong\u00e9 Parental R\u00e9mun\u00e9r\u00e9', 406, 'famille',
          'Allocation mensuelle (406\u20ac) lors d\u2019un cong\u00e9 parental pour s\u2019occuper d\u2019un enfant de moins de 3 ans.'));

      // 43. AJPP
      if (ages_enf.some(a => a < 20) && (est_rqth || est_ald))
        add(mka('ajpp','AJPP \u2014 Pr\u00e9sence Parentale (enfant malade)', 1400, 'famille',
          'Allocation pour le parent qui r\u00e9duit son activit\u00e9 pour accompagner un enfant gravement malade (64\u20ac/j \u00d7 22 j max).'));

      // 44. AJPA
      if (nb_enf === 0 && (est_invalide || est_ald || (age >= 60 && est_retraite)))
        add(mka('ajpa','AJPA \u2014 Proche Aidant', 64, 'sante',
          'Allocation journali\u00e8re (64\u20ac/jour, max 66 jours) pour les personnes qui cessent de travailler pour aider un proche d\u00e9pendant.'));

      // 45. Bourse coll\u00e8ge/lyc\u00e9e
      if (nb_scol > 0 && rev < 1800)
        add(mka('bourse-scolaire','Bourse Coll\u00e8ge/Lyc\u00e9e Sociale', 45, 'famille',
          'Bourse annuelle (de 100 \u00e0 700\u20ac) pour les coll\u00e9giens et lyc\u00e9ens issus de familles modestes.'));

      // 46. Aide transport scolaire
      if (nb_scol > 0)
        add(infoaide('transport-scolaire','Aide au Transport Scolaire', 'famille',
          'Prise en charge partielle ou totale des transports scolaires selon le d\u00e9partement et la distance.'));

      // 47. ALD 100%
      if (est_ald || est_invalide)
        add(infoaide('ald','ALD 100% \u2014 Remboursement Int\u00e9gral S\u00e9cu', 'sante',
          'Prise en charge \u00e0 100% par l\u2019Assurance Maladie de tous les soins li\u00e9s \u00e0 la maladie longue dur\u00e9e.'));

      // 48. CMI
      if (est_rqth)
        add(infoaide('cmi','CMI \u2014 Carte Mobilit\u00e9 Inclusion', 'handicap',
          'Carte ouvrant droit \u00e0 des avantages (transports, stationnement, priorit\u00e9s) selon le taux d\u2019incapacit\u00e9 reconnu par la MDPH.'));

      // 49. RQTH
      if (est_rqth)
        add(infoaide('rqth-statut','RQTH \u2014 Statut Travailleur Handicap\u00e9', 'handicap',
          'Reconnaissance l\u00e9gale donnant acc\u00e8s \u00e0 des aides \u00e0 l\u2019emploi, formations adapt\u00e9es et obligation d\u2019emploi pour l\u2019employeur.'));

      // 50. Aide audioproth\u00e8se
      if (est_rqth || age >= 60)
        add(mka('audioprothese','Aide Audioproth\u00e8se 100% Sant\u00e9', 79, 'sante',
          'Remboursement int\u00e9gral S\u00e9cu + mutuelle d\u2019une proth\u00e8se auditive dans le cadre du 100% Sant\u00e9 (950\u20ac/oreille).'));

      // 51. PUMa
      if (est_salarie || est_independant || est_etudiant)
        add(infoaide('puma','PUMa \u2014 Protection Universelle Maladie', 'sante',
          'Protection maladie universelle garantissant le remboursement des soins \u00e0 toute personne travaillant ou r\u00e9sidant en France.'));

      // 52. IJ Maladie/Maternit\u00e9
      if (est_salarie && anc >= 12)
        add(mka('ij-maladie','IJ \u2014 Indemnit\u00e9s Journali\u00e8res Maladie/Maternit\u00e9', rev * 0.5, 'sante',
          'En cas d\u2019arr\u00eat maladie, indemnisation \u00e0 50% du salaire journalier de r\u00e9f\u00e9rence d\u00e8s le 4e jour d\u2019arr\u00eat.'));

      // 53. APA
      if (age >= 60 && (est_invalide || est_ald || age >= 65))
        add(mka('apa','APA \u2014 Allocation Personnalis\u00e9e d\u2019Autonomie', 600, 'seniors',
          'Aide \u00e0 domicile ou en \u00e9tablissement pour les personnes en perte d\u2019autonomie de 60 ans et plus (jusqu\u2019\u00e0 1\u202f800\u20ac/mois).'));

      // 54. SAAD
      if (age >= 65 || est_invalide)
        add(mka('saad','SAAD \u2014 Services d\u2019Aide \u00e0 Domicile', 200, 'seniors',
          'Services \u00e0 domicile (m\u00e9nage, courses, soins) partiellement pris en charge par le d\u00e9partement et la CAF.'));

      // 55. ARDH
      if (age >= 60 || est_invalide)
        add(infoaide('ardh','ARDH \u2014 Retour \u00e0 Domicile apr\u00e8s Hospitalisation', 'seniors',
          'Aide temporaire de la CNAV (repas, m\u00e9nage, transport) pour faciliter la sortie d\u2019hospitalisation.'));

      // 56. CMG (garde 3-6 ans)
      if (ages_enf.some(a => a >= 3 && a < 6) && rev < 3500)
        add(mka('cmg','CMG \u2014 Compl\u00e9ment Mode de Garde (3-6 ans)', 300, 'famille',
          'Aide pour la garde d\u2019un enfant de 3 \u00e0 6 ans chez une assistante maternelle agr\u00e9\u00e9e ou une garde \u00e0 domicile.'));

      // 57. Aide poste ESAT
      if (est_invalide && est_salarie)
        add(infoaide('esat','Aide au Poste ESAT \u2014 Travail Prot\u00e9g\u00e9', 'handicap',
          'Compl\u00e9ment de salaire financ\u00e9 par l\u2019\u00c9tat pour les travailleurs handicap\u00e9s en ESAT.'));

      // 58. Bourse mobilit\u00e9 Master
      if (est_etudiant && age >= 21 && age <= 30)
        add(mka('bourse-master','Bourse Mobilit\u00e9 en Master', 83, 'jeunes',
          'Aide de 1\u202f000\u20ac/an pour les \u00e9tudiants en master qui changent de r\u00e9gion acad\u00e9mique entre la licence et le master.'));

      // 59. Aide logement \u00e9tudiant CROUS
      if (est_etudiant && est_locataire)
        add(mka('logement-crous','Aide Logement \u00c9tudiant CROUS', 100, 'jeunes',
          'R\u00e9duction de loyer pour les \u00e9tudiants log\u00e9s en r\u00e9sidence CROUS (sous conditions de ressources).'));

      // 60. Permis \u00e0 1\u20ac
      if (age >= 15 && age <= 25)
        add(infoaide('permis-1euro','Permis \u00e0 1\u20ac/jour', 'jeunes',
          'Financement du permis de conduire en 30 mensualit\u00e9s de 30\u20ac (taux z\u00e9ro), accessible d\u00e8s 15 ans.'));

      // 61. TPS \u2014 Tarif social t\u00e9l\u00e9phone
      if (rev < 900)
        add(mka('tps','TPS \u2014 Tarif Social T\u00e9l\u00e9phone/Internet', 10, 'divers',
          'R\u00e9duction mensuelle (environ 10\u20ac/mois) sur votre abonnement t\u00e9l\u00e9phonique ou internet sur crit\u00e8res de revenus.'));

      // 62. Micro-cr\u00e9dit social
      if (est_salarie && rev < 1500)
        add(infoaide('micro-credit','Micro-Cr\u00e9dit Social CAF/FASTT', 'emploi',
          'Pr\u00eat \u00e0 taux r\u00e9duit (1\u20135\u202f000\u20ac) pour les travailleurs en difficult\u00e9 (v\u00e9hicule, loyer, \u00e9quipement).'));

      // 63. Garantie jeunes (= CEJ) \u2014 fusion\u00e9e, d\u00e9j\u00e0 comptabilis\u00e9e

      // 64. Aide diff\u00e9rentielle ex-combattants
      if (age >= 65 && est_retraite)
        add(infoaide('exca','Aide Diff\u00e9rentielle Ex-Combattants', 'divers',
          'Allocation compl\u00e9mentaire pour les anciens combattants dont les revenus sont inf\u00e9rieurs au plafond r\u00e9glementaire.'));

      // 65. Aide aux victimes
      add(infoaide('aide-victimes','Aide aux Victimes d\u2019Infractions (FGTI)', 'justice',
        'Indemnisation possible via le Fonds de Garantie pour les victimes d\u2019infractions p\u00e9nales (agression, vol avec violence\u2026).'));

      // 66. Visale \u00e9tudiant
      if (est_etudiant && est_locataire)
        add(infoaide('visale-etudiant','Visale \u00c9tudiant \u2014 Caution Gratuite', 'logement',
          'Garantie de caution locative gratuite pour les \u00e9tudiants de moins de 30 ans hors r\u00e9sidence familiale.'));

      // 67. Aide d\u2019urgence CAF
      if (rev < 1500 && p.allocations_caf)
        add(mka('aide-urgence-caf','Aide d\u2019Urgence CAF', 200, 'revenus',
          'Aide ponctuelle non remboursable (100\u2013500\u20ac) du fonds CAF pour les allocataires en situation d\u2019urgence financi\u00e8re.'));

      // 68. FAJ \u2014 Fonds d\u2019aide aux jeunes
      if (age >= 18 && age <= 25 && rev < 600)
        add(mka('faj','FAJ \u2014 Fonds d\u2019Aide aux Jeunes', 42, 'jeunes',
          'Aide d\u00e9partementale ponctuelle (jusqu\u2019\u00e0 500\u20ac) pour les 18-25 ans en grande difficult\u00e9 financi\u00e8re.'));

      // 69. RSO (Outre-Mer) \u2014 ignor\u00e9, pas de donn\u00e9e g\u00e9ographique

      // 70. Allocation Veuvage
      if (p.situation_familiale === 'veuf' && age >= 18 && age < 55)
        add(mk('allocation-veuvage','Allocation Veuvage', 706.24, 'famille', 3,
          'Pension mensuelle (706\u20ac) vers\u00e9e par la CNAV aux personnes veuves de moins de 55 ans dont le conjoint cotisait \u00e0 l\u2019Assurance vieillesse.'));

      // 71. AER \u2014 Allocation \u00c9quivalent Retraite
      if (est_chomeur && age >= 57 && anc >= 120)
        add(mka('aer','AER \u2014 Allocation \u00c9quivalent Retraite', 800, 'emploi',
          'Allocation pour les ch\u00f4meurs de 57 ans et plus justifiant de 40 trimestres, en attente de la retraite.'));

      // ── Tri : exact desc, approx desc, info en dernier ──────────────────────
      out.sort((a, b) => {
        if (!!a.info_only !== !!b.info_only) return a.info_only ? 1 : -1;
        if (!!a.approx !== !!b.approx) return a.approx ? 1 : -1;
        return b.montant_mensuel - a.montant_mensuel;
      });

      const exact = out.filter(a => !a.info_only && !a.approx);
      const approx = out.filter(a => a.approx);
      const infos = out.filter(a => a.info_only);

      return {
        aides: out,
        total_mensuel: exact.reduce((s, a) => s + a.montant_mensuel, 0),
        total_approx:  approx.reduce((s, a) => s + a.montant_mensuel, 0),
        nb_aides: out.length,
        nb_exact: exact.length,
        nb_approx: approx.length,
        nb_info: infos.length,
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
      const totalApprox = res.total_approx || 0;
      const aides = res.aides || [];
      const nbExact = res.nb_exact || 0;
      const nbApprox = res.nb_approx || 0;
      const nbInfo  = res.nb_info || 0;

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
        const approxLine = totalApprox > 0
          ? `<p class="sr-hero__approx">+ potentiellement ~${Math.round(totalApprox).toLocaleString('fr-FR')} €/mois supplémentaires (estimés)</p>`
          : '';
        const counterParts = [];
        if (nbExact > 0) counterParts.push(`${nbExact} aide${nbExact > 1 ? 's' : ''} calculée${nbExact > 1 ? 's' : ''}`);
        if (nbApprox > 0) counterParts.push(`${nbApprox} estimée${nbApprox > 1 ? 's' : ''}`);
        if (nbInfo > 0)   counterParts.push(`${nbInfo} à vérifier`);
        const counterLine = counterParts.join(' · ');

        section.innerHTML = `
          <div class="sr-hero">
            <div class="sr-hero__inner">
              <p class="sr-hero__label">Vos aides estimées</p>
              <div class="sr-hero__total">
                <span class="sr-hero__amount">${totalFormatted} €</span>
                <span class="sr-hero__period">/mois</span>
              </div>
              ${approxLine}
              <p class="sr-hero__sub">${counterLine} · 100% local, aucune donnée transmise</p>
            </div>
          </div>

          <ul class="sr-list" role="list">
            ${aides.map(a => {
              const icon = CAT_ICONS[a.categorie] || CAT_ICONS.revenus;
              let amt, amtClass;
              if (a.info_only) {
                amt = 'À vérifier';
                amtClass = 'sr-card__amount sr-card__amount--info';
              } else if (a.approx) {
                amt = '~' + Math.round(a.montant_mensuel).toLocaleString('fr-FR') + ' €/mois';
                amtClass = 'sr-card__amount sr-card__amount--approx';
              } else {
                amt = a.montant_mensuel >= 1 ? Math.round(a.montant_mensuel).toLocaleString('fr-FR') + ' €/mois' : 'Variable';
                amtClass = 'sr-card__amount';
              }
              const badge = a.info_only
                ? `<span class="sr-card__badge sr-card__badge--info">Info</span>`
                : a.approx
                  ? `<span class="sr-card__badge sr-card__badge--approx">Estimé</span>`
                  : '';
              return `
                <li class="sr-card${a.info_only ? ' sr-card--info' : a.approx ? ' sr-card--approx' : ''}">
                  <div class="sr-card__icon sr-card__icon--${a.categorie}">${icon}</div>
                  <div class="sr-card__body">
                    <div class="sr-card__name">${a.nom} ${badge}</div>
                    ${a.desc ? `<p class="sr-card__desc">${a.desc}</p>` : ''}
                  </div>
                  <div class="sr-card__right">
                    <span class="${amtClass}">${amt}</span>
                    <a href="aides/${a.id}.html" class="sr-card__link">En savoir plus →</a>
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
