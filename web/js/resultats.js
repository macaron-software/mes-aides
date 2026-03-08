    // Journey steps data per aide
    const JOURNEYS = {
      rsa: {
        cat: 'revenus',
        steps: [
          { title: 'Verifier votre eligibilite', desc: 'Etes-vous age de plus de 25 ans (ou moins de 25 ans avec enfant a charge) ? Residez-vous en France depuis plus de 5 ans ? Si oui, vous pouvez faire la demande.', link: { label: 'Simuler sur CAF.fr', href: 'https://www.caf.fr/allocataires/aides-et-demarches/droits-et-prestations/solidarite/le-revenu-de-solidarite-active-rsa' } },
          { title: 'Rassembler les justificatifs', desc: 'Carte nationale d\'identite ou titre de sejour, RIB, justificatifs de revenus des 3 derniers mois, justificatif de domicile de moins de 3 mois.', link: null },
          { title: 'Faire la demande en ligne', desc: 'Rendez-vous sur CAF.fr > Mon compte > Faire une demande > RSA. La demande prend 15 minutes en ligne.', link: { label: 'Demande RSA sur CAF.fr', href: 'https://wwwd.caf.fr/wps/portal/caffr/aidesetservices/lesservicesen ligne/faire-une-demande-de-prestation' } },
          { title: 'Signer le contrat d\'engagement', desc: 'Dans les 2 mois suivant l\'accord, vous rencontrez un conseiller France Travail pour definir votre projet d\'insertion professionnelle.', link: { label: 'France Travail', href: 'https://www.francetravail.fr' } },
          { title: 'Percevoir le RSA', desc: 'Le RSA est verse le 5 de chaque mois. Premier versement dans les 2 semaines apres accord.', link: null }
        ]
      },
      apl: {
        cat: 'logement',
        steps: [
          { title: 'Verifier votre eligibilite', desc: 'Vous devez etre locataire, et votre logement doit etre conventionne APL ou eligble ALS. Demandez a votre bailleur.', link: { label: 'Verifier sur CAF.fr', href: 'https://www.caf.fr/allocataires/aides-et-demarches/droits-et-prestations/logement/les-aides-au-logement' } },
          { title: 'Creer votre espace CAF', desc: 'Si vous n\'avez pas de compte CAF, creez-en un sur caf.fr. Munissez-vous de votre numero de Securite sociale.', link: { label: 'Creer un compte CAF', href: 'https://wwwd.caf.fr/wps/portal/caffr/login' } },
          { title: 'Faire la demande en ligne', desc: 'Mon compte > Faire une demande > Aides au logement. Renseignez les infos de votre logement et votre bail.', link: { label: 'Demande APL', href: 'https://wwwd.caf.fr/wps/portal/caffr/aidesetservices/lesservicesen ligne/faire-une-demande-de-prestation' } },
          { title: 'Attendre la reponse', desc: 'La CAF traite la demande en 1 a 2 mois. L\'APL est versee directement au bailleur (en general) ou a vous.', link: null }
        ]
      },
      'prime-activite': {
        cat: 'revenus',
        steps: [
          { title: 'Verifier votre eligibilite', desc: 'Vous devez travailler et avoir des revenus inferieurs a environ 1 800 €/mois. Pas de condition d\'age.', link: { label: 'Simulateur CAF', href: 'https://wwwd.caf.fr/wps/portal/caffr/aidesetservices/lesservicesen ligne/estimervosdroits/prime-d-activite' } },
          { title: 'Declarer vos revenus', desc: 'Si vous avez deja un compte CAF, verifiez que vos revenus sont a jour. Mise a jour trimestrielle.', link: { label: 'Mon compte CAF', href: 'https://wwwd.caf.fr' } },
          { title: 'Faire la demande', desc: 'Mon compte CAF > Faire une demande > Prime d\'activite. Rapide, environ 10 minutes.', link: { label: 'Demande prime activite', href: 'https://wwwd.caf.fr/wps/portal/caffr/aidesetservices/lesservicesen ligne/faire-une-demande-de-prestation' } }
        ]
      },
      aah: {
        cat: 'handicap',
        steps: [
          { title: 'Constituer un dossier MDPH', desc: 'Remplir le formulaire Cerfa 15692*01 (demande MDPH). Joindre: certificat medical detaille, justificatifs identite, jugement de tutelle si applicable.', link: { label: 'Telecharger le Cerfa', href: 'https://www.service-public.fr/particuliers/vosdroits/R19993' } },
          { title: 'Deposer le dossier a la MDPH', desc: 'Envoyez le dossier par lettre recommandee a la MDPH de votre departement ou deposez-le en main propre.', link: { label: 'Trouver votre MDPH', href: 'https://www.mdph.fr' } },
          { title: 'Passer devant la commission (CDAPH)', desc: 'La Commission se reunira dans les 4 mois. Elle evalue votre taux d\'incapacite. Vous pouvez etre auditionne.', link: null },
          { title: 'Recevoir la notification de decision', desc: 'La MDPH vous envoie sa decision. En cas de refus, vous avez 2 mois pour faire un recours gracieux ou contentieux.', link: null },
          { title: 'Faire la demande d\'AAH a la CAF', desc: 'Apres accord MDPH, creez ou connectez-vous a votre compte CAF et faites la demande d\'AAH.', link: { label: 'Demande AAH CAF', href: 'https://wwwd.caf.fr' } },
          { title: 'Percevoir l\'AAH', desc: 'Versement mensuel le 5 du mois. L\'AAH est attribuee pour une duree de 1 a 5 ans (renouvelable).', link: null }
        ]
      },
      'cheque-energie': {
        cat: 'energie',
        steps: [
          { title: 'Aucune demarche requise', desc: 'Le cheque energie est envoye automatiquement par La DGFiP en mars-avril a tous les foyers eligible. Verifiez votre boite aux lettres.', link: { label: 'En savoir plus', href: 'https://chequeenergie.gouv.fr' } }
        ]
      }
    };

    const ICONS = {
      revenus:  '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
      logement: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
      handicap: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="5" r="2"/><path d="M10 22v-5h4v5M7 9l2 2 4-4"/></svg>',
      energie:  '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
      sante:    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
      famille:  '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'
    };

    function renderResults(data) {
      const list = document.getElementById('aidesList');
      const hero = document.getElementById('resultsHero');

      if (!data || !data.aides || data.aides.length === 0) {
        list.innerHTML = `
          <div class="no-results">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--c-muted)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="8" y1="15" x2="16" y2="15"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
            <p style="margin-top:var(--sp-4)">Aucune aide detectable avec les informations fournies.</p>
            <a href="simulateur.html" class="btn btn-primary">Recommencer le questionnaire</a>
          </div>`;
        return;
      }

      // Update hero
      const total = data.aides.reduce((s, a) => s + (a.montant_mensuel || 0), 0);
      document.getElementById('totalAmount').textContent = Math.round(total).toLocaleString('fr-FR');

      // Build cards
      let html = `<p class="results-section-title">${data.nb_aides} aide${data.nb_aides > 1 ? 's' : ''} identifiee${data.nb_aides > 1 ? 's' : ''}</p>`;

      data.aides.forEach(aide => {
        const journey = JOURNEYS[aide.id] || { cat: aide.categorie || 'revenus', steps: [] };
        const cat = journey.cat;
        const icon = ICONS[cat] || ICONS.revenus;
        const amount = Math.round(aide.montant_mensuel || 0);
        const nb = aide.nb_etapes || journey.steps.length;

        let stepsHtml = '';
        journey.steps.forEach((step, i) => {
          const linkHtml = step.link
            ? `<a href="${step.link.href}" target="_blank" rel="noopener noreferrer" class="journey-step-link">${step.link.label} <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>`
            : '';
          stepsHtml += `
            <div class="journey-step">
              <div class="journey-step-num">${i + 1}</div>
              <div class="journey-step-body">
                <div class="journey-step-title">${step.title}</div>
                <div class="journey-step-desc">${step.desc}</div>
                ${linkHtml}
              </div>
            </div>`;
        });

        html += `
          <div class="aide-card" id="card-${aide.id}">
            <div class="aide-card-header" onclick="toggleCard('${aide.id}')" role="button" tabindex="0" aria-expanded="false" aria-controls="journey-${aide.id}">
              <div class="aide-icon ${cat}">${icon}</div>
              <div class="aide-info">
                <div class="aide-name">${aide.nom}</div>
                <div style="font-size:var(--fs-sm);color:var(--c-muted);margin-top:2px;">${nb} etape${nb > 1 ? 's' : ''} pour faire la demande</div>
              </div>
              <div style="text-align:right;flex-shrink:0;">
                <div class="aide-amount-badge">+${amount.toLocaleString('fr-FR')} €</div>
                <div class="aide-amount-sub">/mois estime</div>
              </div>
              <svg class="aide-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            <div class="aide-journey" id="journey-${aide.id}" role="region" aria-label="Demarches ${aide.nom}">
              <div class="journey-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                Guide de demarche
              </div>
              ${stepsHtml}
              <div class="journey-cta">
                <a href="aides/${aide.id}.html" class="btn btn-outline">
                  Fiche complete de l'aide
                </a>
              </div>
            </div>
          </div>`;
      });

      list.innerHTML = html;
      document.getElementById('actionsBar').style.display = 'flex';

      // Keyboard support for cards
      document.querySelectorAll('.aide-card-header').forEach(el => {
        el.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            el.click();
          }
        });
      });
    }

    function toggleCard(id) {
      const card = document.getElementById('card-' + id);
      const header = card.querySelector('.aide-card-header');
      const isOpen = card.classList.toggle('open');
      header.setAttribute('aria-expanded', isOpen.toString());
    }

    function shareResults() {
      const url = window.location.href;
      if (navigator.share) {
        navigator.share({ title: 'Mes aides sociales', url });
      } else {
        navigator.clipboard.writeText(url).then(() => {
          alert('Lien copie dans le presse-papier.');
        });
      }
    }

    // La page résultats est accessible directement (guide par aide)

// ── Button event listeners (replaces inline onclick) ──────────────────────
document.addEventListener('DOMContentLoaded', function() {
  var btnPrint = document.getElementById('btnPrint');
  if (btnPrint) btnPrint.addEventListener('click', function() { window.print(); });

  var btnShare = document.getElementById('btnShare');
  if (btnShare) btnShare.addEventListener('click', shareResults);
});
