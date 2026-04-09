/**
 * @fileoverview Internal linking strategy for Mes Aides.
 * Auto-injects "You might also check" related-country sections and
 * "Simulator for this country" CTAs to improve crawl depth and PageRank flow.
 */
'use strict';

(function() {

  /* ── Country metadata ─────────────────────────────────────────────────── */

  const COUNTRIES = {
    de: { name: 'Germany',        flag: '🇩🇪', region: 'europe' },
    es: { name: 'Spain',          flag: '🇪🇸', region: 'europe' },
    it: { name: 'Italy',          flag: '🇮🇹', region: 'europe' },
    pt: { name: 'Portugal',       flag: '🇵🇹', region: 'europe' },
    be: { name: 'Belgium',        flag: '🇧🇪', region: 'europe' },
    nl: { name: 'Netherlands',    flag: '🇳🇱', region: 'europe' },
    se: { name: 'Sweden',         flag: '🇸🇪', region: 'europe' },
    dk: { name: 'Denmark',        flag: '🇩🇰', region: 'europe' },
    fi: { name: 'Finland',        flag: '🇫🇮', region: 'europe' },
    at: { name: 'Austria',        flag: '🇦🇹', region: 'europe' },
    ch: { name: 'Switzerland',    flag: '🇨🇭', region: 'europe' },
    no: { name: 'Norway',         flag: '🇳🇴', region: 'europe' },
    gb: { name: 'United Kingdom', flag: '🇬🇧', region: 'europe' },
    pl: { name: 'Poland',         flag: '🇵🇱', region: 'europe' },
    jp: { name: 'Japan',          flag: '🇯🇵', region: 'asia-pacific' },
    ca: { name: 'Canada',         flag: '🇨🇦', region: 'north-america' },
    mx: { name: 'Mexico',         flag: '🇲🇽', region: 'north-america' },
    us: { name: 'United States',  flag: '🇺🇸', region: 'north-america' },
    cn: { name: 'China',          flag: '🇨🇳', region: 'asia-pacific' },
    au: { name: 'Australia',      flag: '🇦🇺', region: 'asia-pacific' },
  };

  /** Related countries per country (same region + adjacent interest). */
  const RELATED = {
    de: ['at', 'ch', 'nl', 'be', 'fr'],
    es: ['pt', 'it', 'fr', 'be', 'mx'],
    it: ['es', 'pt', 'fr', 'de', 'ch'],
    pt: ['es', 'it', 'fr', 'be', 'br'],
    be: ['nl', 'fr', 'de', 'lu', 'gb'],
    nl: ['be', 'de', 'fr', 'gb', 'dk'],
    se: ['no', 'dk', 'fi', 'de', 'nl'],
    dk: ['se', 'no', 'de', 'nl', 'fi'],
    fi: ['se', 'no', 'dk', 'de', 'pl'],
    at: ['de', 'ch', 'it', 'hu', 'pl'],
    ch: ['de', 'at', 'it', 'fr', 'be'],
    no: ['se', 'dk', 'fi', 'gb', 'nl'],
    gb: ['ie', 'fr', 'de', 'nl', 'se'],
    pl: ['de', 'at', 'cs', 'sk', 'hu'],
    jp: ['cn', 'au', 'de', 'fr', 'gb'],
    ca: ['us', 'gb', 'fr', 'au', 'de'],
    mx: ['us', 'ca', 'es', 'pt', 'it'],
    us: ['ca', 'gb', 'au', 'de', 'fr'],
    cn: ['jp', 'au', 'de', 'us', 'fr'],
    au: ['gb', 'ca', 'us', 'jp', 'de'],
  };

  /* ── French aid aliases (for keyword-based suggestions) ──────────────── */

  /** Maps legacy/variant search terms to canonical aide IDs used in ?aide= param. */
  const AIDE_ALIASES = {
    rmi:                     'rsa',   // Revenu Minimum d'Insertion → RSA depuis 2009
    'revenu minimum insertion': 'rsa',
    'simulation rsa':        'rsa',
    'simulateur rsa':        'rsa',
    'montant rsa':           'rsa',
    'simulateur aah':        'aah',
    'simulation aah':        'aah',
    'montant aah':           'aah',
    'simulation apl':        'apl',
    'simulateur apl':        'apl',
    'allocations familiales': 'af',
    'montant caf':           'af',
    'montant paje':          'paje',
    'allocation de base paje': 'paje',
    'montant pch':           'pch',
    'cheque energie':        'ce',
    'chèque énergie':        'ce',
    ancv:                    'ancv',
    'cheques vacances':      'ancv',
    'chèques vacances':      'ancv',
    'prime activite':        'pa',
    'prime activité':        'pa',
    'prime d\'activité':     'pa',
  };

  /**
   * Resolves a raw search/keyword string to a canonical aide ID.
   * Returns the aide id string, or null if no match.
   */
  function resolveAideAlias(query) {
    if (!query) return null;
    const q = query.toLowerCase().trim();
    for (const alias in AIDE_ALIASES) {
      if (q.indexOf(alias) !== -1) return AIDE_ALIASES[alias];
    }
    return null;
  }

  /* Expose for use by keyword-routing.js if loaded in same page. */
  if (typeof window !== 'undefined') {
    window._mesAidesResolveAlias = resolveAideAlias;
  }

  /* ── Detect current page context ─────────────────────────────────────── */

  const path = location.pathname;

  /**
   * Extract the country code from a path like /simulateur/de.html
   * or /aides/europe/de.html.
   */
  function detectCC() {
    const m = path.match(/\/(?:simulateur|aides\/(?:europe|monde)?)\/([a-z]{2})\.html$/);
    return m ? m[1] : null;
  }

  const cc = detectCC();

  /* ── Inject "Simulator for this country" CTA ─────────────────────────── */

  function injectSimulatorCTA(cc) {
    const simPath = '/simulateur/' + cc + '.html';
    if (path.startsWith('/simulateur/')) return; // already on sim page
    if (document.querySelector('[data-internal-sim-cta]')) return;

    const country = COUNTRIES[cc];
    if (!country) return;

    const cta = document.createElement('div');
    cta.setAttribute('data-internal-sim-cta', cc);
    cta.style.cssText = [
      'margin: 24px auto',
      'max-width: 680px',
      'padding: 20px 24px',
      'background: var(--c-surface, #fff)',
      'border: 2px solid #2d4b8e',
      'border-radius: 24px 28px 26px 22px',
      'display: flex',
      'align-items: center',
      'gap: 16px',
      'flex-wrap: wrap',
    ].join(';');

    cta.innerHTML = [
      '<div style="flex:1;min-width:200px">',
        '<p style="font-size:1rem;font-weight:700;color:var(--c-text,#111);margin:0 0 4px">',
          country.flag + ' Check your eligibility in ' + country.name,
        '</p>',
        '<p style="font-size:.875rem;color:var(--c-muted,#6b7280);margin:0">',
          'Use our free benefits simulator — results in under 3 minutes.',
        '</p>',
      '</div>',
      '<a href="' + simPath + '" ',
         'style="display:inline-flex;align-items:center;gap:8px;',
                'padding:12px 24px;background:#2d4b8e;color:#fff;border:none;',
                'border-radius:24px 28px 26px 22px;font-size:1rem;font-weight:700;',
                'text-decoration:none;min-height:44px;transition:opacity .2s" ',
         'onmouseover="this.style.opacity=.88" onmouseout="this.style.opacity=1">',
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>',
        'Run Simulator',
      '</a>',
    ].join('');

    /* Insert after first <main> child or before first article */
    const main = document.getElementById('main-content') || document.querySelector('main');
    if (main) {
      const firstSection = main.querySelector('section, article, .results-list, .aids-list');
      if (firstSection) {
        main.insertBefore(cta, firstSection.nextSibling);
      } else {
        main.appendChild(cta);
      }
    }
  }

  /* ── Inject "You might also check" related countries section ──────────── */

  function injectRelatedCountries(cc) {
    if (document.querySelector('[data-internal-related]')) return;

    const related = (RELATED[cc] || []).filter(r => COUNTRIES[r]);
    if (!related.length) return;

    const wrapper = document.createElement('section');
    wrapper.setAttribute('data-internal-related', cc);
    wrapper.setAttribute('aria-label', 'Related countries');
    wrapper.style.cssText = [
      'margin: 32px auto',
      'max-width: 720px',
      'padding: 0 16px',
    ].join(';');

    const links = related.map(r => {
      const c = COUNTRIES[r];
      const simUrl = '/simulateur/' + r + '.html';
      return [
        '<a href="' + simUrl + '" ',
           'style="display:inline-flex;align-items:center;gap:8px;',
                  'padding:10px 16px;background:var(--c-surface,#fff);',
                  'border:2px solid var(--c-border,#e5e7eb);',
                  'border-radius:24px 28px 26px 22px;',
                  'text-decoration:none;color:var(--c-text,#111);',
                  'font-size:.875rem;font-weight:600;',
                  'transition:border-color .2s,transform .15s" ',
           'onmouseover="this.style.borderColor=\'#2d4b8e\';this.style.transform=\'translateY(-1px)\'" ',
           'onmouseout="this.style.borderColor=\'\';this.style.transform=\'\'" ',
           'data-testid="internal-link-' + r + '">',
          '<span>' + c.flag + '</span>',
          '<span>' + c.name + '</span>',
        '</a>',
      ].join('');
    }).join('\n');

    wrapper.innerHTML = [
      '<p style="font-size:.75rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;',
                'color:var(--c-muted,#6b7280);margin:0 0 12px">',
        'You might also check',
      '</p>',
      '<div style="display:flex;flex-wrap:wrap;gap:8px">',
        links,
      '</div>',
    ].join('');

    /* Append near end of main or before footer */
    const main = document.getElementById('main-content') || document.querySelector('main');
    const footer = document.querySelector('footer');
    if (footer && footer.parentNode) {
      footer.parentNode.insertBefore(wrapper, footer);
    } else if (main) {
      main.appendChild(wrapper);
    } else {
      document.body.appendChild(wrapper);
    }
  }

  /* ── Entrypoint ───────────────────────────────────────────────────────── */

  function init() {
    if (!cc) return;

    /* On aide detail pages: inject simulator CTA */
    if (path.includes('/aides/')) {
      injectSimulatorCTA(cc);
    }

    /* On all country pages: inject related-country links */
    injectRelatedCountries(cc);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
