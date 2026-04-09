/**
 * keyword-routing.js — SEO keyword personalization for Mes Aides
 * Reads ?aide= URL param and injects a personalized hero banner.
 * Vanilla JS, no dependencies, < 5KB.
 */
'use strict';

(function () {

  const KEYWORD_MAP = {
    rsa: {
      title: 'RSA — Revenu de Solidarité Active',
      montant: '635,71 €/mois (personne seule)',
      description: 'Vous pouvez recevoir jusqu\'à 635,71 €/mois si vos ressources sont insuffisantes.',
      page: '/aides/rsa.html',
      color: '#1565C0',
      keywords: ['rsa', 'rmi', 'revenu solidarité active', 'revenu minimum insertion', 'simulation rsa', 'simulateur rsa']
    },
    aah: {
      title: 'AAH — Allocation aux Adultes Handicapés',
      montant: '1 016,05 €/mois',
      description: 'L\'AAH vous garantit un revenu minimum si vous êtes en situation de handicap.',
      page: '/aides/aah.html',
      color: '#6A1B9A',
      keywords: ['aah', 'adultes handicapés', 'allocation handicap', 'simulateur aah', 'simulation aah']
    },
    apl: {
      title: 'APL — Aide Personnalisée au Logement',
      montant: 'jusqu\'à 380 €/mois',
      description: 'L\'APL réduit votre loyer ou vos mensualités selon vos revenus.',
      page: '/aides/apl.html',
      color: '#00695C',
      keywords: ['apl', 'aide logement', 'allocation logement', 'simulation apl']
    },
    af: {
      title: 'Allocations Familiales',
      montant: '148,52 €/mois (2 enfants)',
      description: 'La CAF verse 148,52 €/mois pour 2 enfants, 339,96 €/mois pour 3 enfants.',
      page: '/aides/caf-allocations-familiales.html',
      color: '#E65100',
      keywords: ['allocations familiales', 'caf enfants', 'af', 'allocations familiales caf']
    },
    paje: {
      title: 'PAJE — Prestation d\'Accueil du Jeune Enfant',
      montant: 'jusqu\'à 184,62 €/mois',
      description: 'L\'allocation de base PAJE soutient les familles avec un enfant de moins de 3 ans.',
      page: '/aides/paje.html',
      color: '#AD1457',
      keywords: ['paje', 'prestation accueil jeune enfant', 'allocation de base paje']
    },
    pch: {
      title: 'PCH — Prestation de Compensation du Handicap',
      montant: 'variable selon besoins',
      description: 'La PCH finance les aides humaines, techniques et animalières liées au handicap.',
      page: '/aides/pch.html',
      color: '#558B2F',
      keywords: ['pch', 'prestation compensation handicap', 'montant pch']
    },
    ce: {
      title: 'Chèque Énergie 2026',
      montant: '150 € à 277 €',
      description: 'Le chèque énergie est envoyé automatiquement aux ménages modestes pour payer leurs factures d\'énergie.',
      page: '/aides/cheque-energie.html',
      color: '#F57F17',
      keywords: ['chèque énergie', 'cheque energie', 'aide énergie', 'chèque énergie 2026']
    },
    ancv: {
      title: 'Chèques-Vacances ANCV',
      montant: 'jusqu\'à 460 €/an',
      description: 'Les chèques-vacances ANCV permettent de financer hébergement, transport et loisirs.',
      page: '/aides/cheque-vacances.html',
      color: '#0277BD',
      keywords: ['ancv', 'chèques vacances', 'cheques vacances', 'ancv 2026']
    },
    pa: {
      title: 'Prime d\'Activité',
      montant: 'jusqu\'à 635,71 €/mois',
      description: 'La prime d\'activité complète les revenus des travailleurs modestes.',
      page: '/aides/prime-activite.html',
      color: '#2E7D32',
      keywords: ['prime activité', 'prime activite', 'prime d\'activité', 'prime activite simulation']
    }
  };

  /** Read ?aide= from current URL. Returns aide id string or null. */
  function detectAideFromURL() {
    try {
      var params = new URLSearchParams(window.location.search);
      var id = params.get('aide');
      return id && KEYWORD_MAP[id] ? id : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Attempt to detect aide from Google organic referrer.
   * Very limited: Google encrypts search terms; only works for non-SSL referrers.
   * Returns aide id string or null.
   */
  function detectAideFromReferrer() {
    try {
      var ref = document.referrer;
      if (!ref) return null;
      var url = new URL(ref);
      if (!/(google|bing|duckduckgo|yahoo)\./.test(url.hostname)) return null;
      var q = url.searchParams.get('q') || '';
      if (!q) return null;
      var qLower = q.toLowerCase().trim();
      for (var id in KEYWORD_MAP) {
        var kws = KEYWORD_MAP[id].keywords;
        for (var i = 0; i < kws.length; i++) {
          if (qLower.indexOf(kws[i]) !== -1) return id;
        }
      }
    } catch (e) { /* ignore */ }
    return null;
  }

  /** Build and return the personalized banner HTML string. */
  function buildBannerHTML(id) {
    var data = KEYWORD_MAP[id];
    var c = data.color;
    return '<div class="keyword-hero" role="complementary" aria-label="Aide correspondant à votre recherche" ' +
      'style="background:linear-gradient(135deg,' + c + '15,' + c + '05);' +
      'border-left:4px solid ' + c + ';border-radius:0 12px 12px 0;' +
      'padding:16px 20px;margin-bottom:24px;">' +
      '<div style="display:flex;align-items:flex-start;gap:12px;">' +
      '<div style="flex:1">' +
      '<p style="font-size:13px;color:#666;margin:0 0 4px">Vous cherchez :</p>' +
      '<h2 style="font-size:18px;font-weight:700;color:' + c + ';margin:0 0 4px">' + esc(data.title) + '</h2>' +
      '<p style="font-size:14px;color:#444;margin:0 0 8px">' + esc(data.montant) + '</p>' +
      '<p style="font-size:13px;color:#555;margin:0 0 12px">' + esc(data.description) + '</p>' +
      '<a href="' + esc(data.page) + '" ' +
        'style="display:inline-block;background:' + c + ';color:#fff;padding:8px 16px;' +
        'border-radius:20px;text-decoration:none;font-size:13px;font-weight:600;">' +
        'Voir les conditions →</a>' +
      '<span style="margin:0 8px;color:#999">ou</span>' +
      '<a href="/simulateur.html?aide=' + encodeURIComponent(id) + '" ' +
        'style="display:inline-block;border:1px solid ' + c + ';color:' + c + ';padding:8px 16px;' +
        'border-radius:20px;text-decoration:none;font-size:13px;font-weight:600;">' +
        'Simuler mon éligibilité</a>' +
      '</div></div></div>';
  }

  /** Simple HTML escape to avoid XSS in data values. */
  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /**
   * Inject the personalized hero banner.
   * Tries #keyword-hero-placeholder first, then before .sim-card, then before <main>.
   */
  function showPersonalizedHero(id) {
    var html = buildBannerHTML(id);
    var placeholder = document.getElementById('keyword-hero-placeholder');
    if (placeholder) {
      placeholder.innerHTML = html;
      return;
    }
    var card = document.querySelector('.sim-card');
    if (card && card.parentNode) {
      var div = document.createElement('div');
      div.innerHTML = html;
      card.parentNode.insertBefore(div.firstChild, card);
      return;
    }
    var main = document.querySelector('main');
    if (main) {
      var div2 = document.createElement('div');
      div2.innerHTML = html;
      main.insertBefore(div2.firstChild, main.firstChild);
    }
  }

  /**
   * Highlight the relevant aid result row after simulation completes.
   * Looks for .result-item or .aide-card with a data-aide or id matching the aide id.
   */
  function addAideCTAToSimulator(id) {
    var data = KEYWORD_MAP[id];
    if (!data) return;
    // Poll up to 3s for results to be rendered (simulator is async)
    var attempts = 0;
    var timer = setInterval(function () {
      attempts++;
      var cards = document.querySelectorAll('[data-aide="' + id + '"], #aide-' + id + ', .result-item');
      if (cards.length > 0) {
        clearInterval(timer);
        cards.forEach(function (card) {
          card.style.outline = '2px solid ' + data.color;
          card.style.outlineOffset = '2px';
        });
      }
      if (attempts >= 30) clearInterval(timer);
    }, 100);
  }

  /** Entry point — called on DOMContentLoaded. */
  function init() {
    var id = detectAideFromURL() || detectAideFromReferrer();
    if (!id) return;
    showPersonalizedHero(id);
    addAideCTAToSimulator(id);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
