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

    function simulate(p) {
      const aides = [];
      const rev = p.revenus_nets_mensuels || 0;

      if (p.emploi !== 'salarie' && p.emploi !== 'retraite' && rev < 1000) {
        aides.push({ id: 'rsa', nom: 'Revenu de Solidarite Active (RSA)', montant_mensuel: Math.max(0, 635 - rev * 0.68), categorie: 'revenus', eligible: true, nb_etapes: 5 });
      }

      if (p.logement === 'locataire' && p.loyer_mensuel > 0) {
        const bases = [380, 290, 250];
        const base = bases[(p.zone_apl || 3) - 1] || 250;
        const montant = Math.max(0, base - rev * 0.2);
        aides.push({ id: 'apl', nom: 'Aide Personnalisee au Logement (APL)', montant_mensuel: montant, categorie: 'logement', eligible: true, nb_etapes: 4 });
      }

      if (p.emploi === 'salarie' && rev < 1800) {
        aides.push({ id: 'prime-activite', nom: 'Prime d\'Activite', montant_mensuel: Math.max(0, 300 - (rev - 1000) * 0.38), categorie: 'revenus', eligible: true, nb_etapes: 3 });
      }

      if (p.invalidite && rev < 1016) {
        aides.push({ id: 'aah', nom: 'Allocation aux Adultes Handicapes (AAH)', montant_mensuel: 1016.85, categorie: 'handicap', eligible: true, nb_etapes: 6 });
      }

      if (rev < 2500) {
        aides.push({ id: 'cheque-energie', nom: 'Cheque Energie', montant_mensuel: Math.round(200 / 12), categorie: 'energie', eligible: true, nb_etapes: 1 });
      }

      aides.sort((a, b) => b.montant_mensuel - a.montant_mensuel);

      return {
        aides,
        total_mensuel: aides.reduce((s, a) => s + a.montant_mensuel, 0),
        nb_aides: aides.length,
        situation: p
      };
    }

    function displayResults(res) {
      // Masque le wizard
      document.querySelector('.sim-wizard')?.classList.add('hidden');
      document.getElementById('stepNav')?.classList.add('hidden');

      // Affiche la section résultats (créée dynamiquement si absente)
      let section = document.getElementById('sim-results');
      if (!section) {
        section = document.createElement('section');
        section.id = 'sim-results';
        section.className = 'results-section';
        document.querySelector('main')?.appendChild(section);
      }

      const total = res.total_mensuel || 0;
      const aides = res.aides || [];

      section.innerHTML = `
        <div class="results-header">
          <h2>Vos aides estimées</h2>
          <p class="results-total">Jusqu'à <strong>${Math.round(total)} €/mois</strong> au total</p>
        </div>
        <ul class="results-list" role="list">
          ${aides.length === 0
            ? '<li class="result-empty">Aucune aide détectée avec ces informations.</li>'
            : aides.map(a => `
              <li class="result-card">
                <div class="result-card-name">${a.nom}</div>
                <div class="result-card-amount">${a.montant_mensuel > 0 ? Math.round(a.montant_mensuel) + ' €/mois' : 'Montant variable'}</div>
                <a href="aides/${a.id}.html" class="result-card-link">En savoir plus →</a>
              </li>`).join('')}
        </ul>
        <p class="results-note">Estimation basée sur les barèmes 2026. Calculé localement dans votre navigateur — aucune donnée transmise.</p>
        <button class="btn-secondary" onclick="resetSimulation()">Recommencer</button>
      `;
      section.classList.remove('hidden');
      section.scrollIntoView({ behavior: 'smooth' });
    }

    function resetSimulation() {
      document.getElementById('sim-results')?.remove();
      document.querySelector('.sim-wizard')?.classList.remove('hidden');
      document.getElementById('stepNav')?.classList.remove('hidden');
      // Reset
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
