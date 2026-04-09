/**
 * country-routing.js — SEO keyword personalization for Mes Aides (international)
 * Auto-detects country from URL path (/simulateur/{cc}.html → cc)
 * Shows personalized banner with top aid info.
 * Adds cross-links between simulateur and monde/aides pages.
 * Vanilla JS, no dependencies, < 8KB.
 */
'use strict';

(function () {

  const COUNTRY_MAP = {
    // Europe
    ae: { name: 'Émirats arabes unis', flag: '🇦🇪', lang: 'ar', topAid: 'Aide sociale fédérale', topAmount: '5 000 AED/mois', color: '#00732F' },
    al: { name: 'Albanie', flag: '🇦🇱', lang: 'sq', topAid: 'Ndihma Ekonomike', topAmount: '5 500 ALL/mois', color: '#E41E20' },
    am: { name: 'Arménie', flag: '🇦🇲', lang: 'hy', topAid: 'Pension d\'invalidité', topAmount: '55 000 AMD/mois', color: '#D90012' },
    ao: { name: 'Angola', flag: '🇦🇴', lang: 'pt', topAid: 'Bolsa de Proteção Social', topAmount: '30 000 AOA/mois', color: '#CC0000' },
    ar: { name: 'Argentine', flag: '🇦🇷', lang: 'es', topAid: 'AUH', topAmount: 'ARS 70 000/mois', color: '#74ACDF' },
    at: { name: 'Autriche', flag: '🇦🇹', lang: 'de', topAid: 'Mindestsicherung', topAmount: '1 059 €/mois', color: '#EF3340' },
    au: { name: 'Australie', flag: '🇦🇺', lang: 'en', topAid: 'JobSeeker', topAmount: 'A$762/mois', color: '#00008B' },
    az: { name: 'Azerbaïdjan', flag: '🇦🇿', lang: 'az', topAid: 'Aide sociale ciblée', topAmount: '270 AZN/mois', color: '#0092BC' },
    ba: { name: 'Bosnie-Herzégovine', flag: '🇧🇦', lang: 'bs', topAid: 'Novčana naknada', topAmount: '220 BAM/mois', color: '#003087' },
    bd: { name: 'Bangladesh', flag: '🇧🇩', lang: 'bn', topAid: 'Old Age Allowance', topAmount: '500 BDT/mois', color: '#006A4E' },
    be: { name: 'Belgique', flag: '🇧🇪', lang: 'fr', topAid: 'Revenu d\'intégration', topAmount: '1 175 €/mois', color: '#000000' },
    bo: { name: 'Bolivie', flag: '🇧🇴', lang: 'es', topAid: 'Bono Juancito Pinto', topAmount: '200 BOB/an', color: '#D52B1E' },
    br: { name: 'Brésil', flag: '🇧🇷', lang: 'pt', topAid: 'Bolsa Família', topAmount: 'R$600/mois', color: '#009C3B' },
    by: { name: 'Biélorussie', flag: '🇧🇾', lang: 'be', topAid: 'Aide sociale d\'État', topAmount: '250 BYN/mois', color: '#CF101A' },
    ca: { name: 'Canada', flag: '🇨🇦', lang: 'en', topAid: 'OAS', topAmount: 'CA$698/mois', color: '#FF0000' },
    cd: { name: 'RD Congo', flag: '🇨🇩', lang: 'fr', topAid: 'Filets sociaux', topAmount: '50 000 CDF/mois', color: '#007FFF' },
    ch: { name: 'Suisse', flag: '🇨🇭', lang: 'fr', topAid: 'PC AVS/AI', topAmount: '2 308 CHF/mois', color: '#FF0000' },
    ci: { name: 'Côte d\'Ivoire', flag: '🇨🇮', lang: 'fr', topAid: 'Filet Social', topAmount: '36 000 XOF/trimestre', color: '#F77F00' },
    cl: { name: 'Chili', flag: '🇨🇱', lang: 'es', topAid: 'Pensión Garantizada Universal', topAmount: '214 296 CLP/mois', color: '#D52B1E' },
    cm: { name: 'Cameroun', flag: '🇨🇲', lang: 'fr', topAid: 'Aide sociale familiale', topAmount: '30 000 XAF/trimestre', color: '#007A5E' },
    cn: { name: 'Chine', flag: '🇨🇳', lang: 'zh', topAid: '低保 (Dibao)', topAmount: '¥665–935/mois', color: '#DE2910' },
    co: { name: 'Colombie', flag: '🇨🇴', lang: 'es', topAid: 'Colombia Mayor', topAmount: '80 000 COP/mois', color: '#FCD116' },
    cr: { name: 'Costa Rica', flag: '🇨🇷', lang: 'es', topAid: 'IMAS Avancemos', topAmount: '50 000 CRC/mois', color: '#002B7F' },
    cu: { name: 'Cuba', flag: '🇨🇺', lang: 'es', topAid: 'Asistencia social', topAmount: '1 528 CUP/mois', color: '#002A8F' },
    de: { name: 'Allemagne', flag: '🇩🇪', lang: 'de', topAid: 'Bürgergeld', topAmount: '563 €/mois', color: '#000000' },
    dk: { name: 'Danemark', flag: '🇩🇰', lang: 'da', topAid: 'Kontanthjælp', topAmount: '13 591 DKK/mois', color: '#C60C30' },
    do: { name: 'Rép. Dominicaine', flag: '🇩🇴', lang: 'es', topAid: 'Progresando con Solidaridad', topAmount: '2 000 DOP/mois', color: '#002D62' },
    dz: { name: 'Algérie', flag: '🇩🇿', lang: 'ar', topAid: 'Allocation chômage', topAmount: '15 000 DZD/mois', color: '#006233' },
    ec: { name: 'Équateur', flag: '🇪🇨', lang: 'es', topAid: 'Bono de Desarrollo Humano', topAmount: '50 USD/mois', color: '#FFD100' },
    eg: { name: 'Égypte', flag: '🇪🇬', lang: 'ar', topAid: 'Takaful & Karama', topAmount: '900 EGP/mois', color: '#CE1126' },
    es: { name: 'Espagne', flag: '🇪🇸', lang: 'es', topAid: 'IMV', topAmount: '470–1 350 €/mois', color: '#AA151B' },
    et: { name: 'Éthiopie', flag: '🇪🇹', lang: 'am', topAid: 'PSNP (filet social)', topAmount: '450 ETB/mois', color: '#078930' },
    fi: { name: 'Finlande', flag: '🇫🇮', lang: 'fi', topAid: 'Perustoimeentulotuki', topAmount: '576 €/mois', color: '#003580' },
    fr: { name: 'France', flag: '🇫🇷', lang: 'fr', topAid: 'RSA', topAmount: '635,71 €/mois', color: '#002395' },
    gb: { name: 'Royaume-Uni', flag: '🇬🇧', lang: 'en', topAid: 'Universal Credit', topAmount: '£311/mois', color: '#012169' },
    ge: { name: 'Géorgie', flag: '🇬🇪', lang: 'ka', topAid: 'Aide sociale ciblée', topAmount: '100 GEL/mois', color: '#FF0000' },
    gh: { name: 'Ghana', flag: '🇬🇭', lang: 'en', topAid: 'LEAP', topAmount: '64 GHS/mois', color: '#006B3F' },
    gt: { name: 'Guatemala', flag: '🇬🇹', lang: 'es', topAid: 'Mi Bono Seguro', topAmount: '300 GTQ/mois', color: '#4997D0' },
    hn: { name: 'Honduras', flag: '🇭🇳', lang: 'es', topAid: 'Bono Vida Mejor', topAmount: '3 000 HNL/mois', color: '#0073CF' },
    ht: { name: 'Haïti', flag: '🇭🇹', lang: 'ht', topAid: 'Aide humanitaire', topAmount: '2 500 HTG/mois', color: '#00209F' },
    id: { name: 'Indonésie', flag: '🇮🇩', lang: 'id', topAid: 'PKH', topAmount: '750 000 IDR/mois', color: '#CE1126' },
    il: { name: 'Israël', flag: '🇮🇱', lang: 'he', topAid: 'Revenu minimum', topAmount: '4 218 ILS/mois', color: '#003399' },
    in: { name: 'Inde', flag: '🇮🇳', lang: 'hi', topAid: 'PM-KISAN', topAmount: '6 000 INR/an', color: '#FF9933' },
    iq: { name: 'Irak', flag: '🇮🇶', lang: 'ar', topAid: 'Réseau de Protection Sociale', topAmount: '150 000 IQD/mois', color: '#007A3D' },
    it: { name: 'Italie', flag: '🇮🇹', lang: 'it', topAid: 'ADI', topAmount: '500 €/mois', color: '#009246' },
    jo: { name: 'Jordanie', flag: '🇯🇴', lang: 'ar', topAid: 'Programme National d\'Aide', topAmount: '136 JOD/mois', color: '#007A3D' },
    jp: { name: 'Japon', flag: '🇯🇵', lang: 'ja', topAid: '生活保護', topAmount: '¥84 260/mois', color: '#BC002D' },
    ke: { name: 'Kenya', flag: '🇰🇪', lang: 'sw', topAid: 'Inua Jamii', topAmount: '2 000 KES/mois', color: '#006600' },
    kg: { name: 'Kirghizistan', flag: '🇰🇬', lang: 'ky', topAid: 'Aide sociale mensuelle', topAmount: '1 500 KGS/mois', color: '#E8112D' },
    kh: { name: 'Cambodge', flag: '🇰🇭', lang: 'km', topAid: 'Cash transfers', topAmount: '100 000 KHR/mois', color: '#032EA1' },
    kr: { name: 'Corée du Sud', flag: '🇰🇷', lang: 'ko', topAid: 'Revenu de base', topAmount: '623 368 KRW/mois', color: '#003478' },
    kw: { name: 'Koweït', flag: '🇰🇼', lang: 'ar', topAid: 'Aide sociale', topAmount: '150 KWD/mois', color: '#007A3D' },
    kz: { name: 'Kazakhstan', flag: '🇰🇿', lang: 'kk', topAid: 'Aide sociale d\'État', topAmount: '28 284 KZT/mois', color: '#00AFCA' },
    la: { name: 'Laos', flag: '🇱🇦', lang: 'lo', topAid: 'Protection sociale', topAmount: '300 000 LAK/mois', color: '#CE1126' },
    lb: { name: 'Liban', flag: '🇱🇧', lang: 'ar', topAid: 'NPTP', topAmount: '1 200 000 LBP/mois', color: '#00A651' },
    lk: { name: 'Sri Lanka', flag: '🇱🇰', lang: 'si', topAid: 'Samurdhi', topAmount: '3 500 LKR/mois', color: '#8D153A' },
    ma: { name: 'Maroc', flag: '🇲🇦', lang: 'ar', topAid: 'AMO (Ramed)', topAmount: '0–500 MAD/mois', color: '#C1272D' },
    md: { name: 'Moldavie', flag: '🇲🇩', lang: 'ro', topAid: 'Ajutor social', topAmount: '2 200 MDL/mois', color: '#003DA5' },
    me: { name: 'Monténégro', flag: '🇲🇪', lang: 'sr', topAid: 'Matérialno obezbedjenje', topAmount: '196 EUR/mois', color: '#D4AF37' },
    mk: { name: 'Macédoine du Nord', flag: '🇲🇰', lang: 'mk', topAid: 'Socijalna parična pomoc', topAmount: '5 500 MKD/mois', color: '#CE2028' },
    mm: { name: 'Myanmar', flag: '🇲🇲', lang: 'my', topAid: 'Aide sociale', topAmount: '50 000 MMK/mois', color: '#FECB00' },
    mn: { name: 'Mongolie', flag: '🇲🇳', lang: 'mn', topAid: 'Child Money Program', topAmount: '20 000 MNT/mois', color: '#C4272F' },
    mu: { name: 'Maurice', flag: '🇲🇺', lang: 'fr', topAid: 'Social Aid', topAmount: '6 410 MUR/mois', color: '#EA2839' },
    mx: { name: 'Mexique', flag: '🇲🇽', lang: 'es', topAid: 'Pensión Bienestar', topAmount: '3 500 MXN/mois', color: '#006847' },
    my: { name: 'Malaisie', flag: '🇲🇾', lang: 'ms', topAid: 'Bantuan Sara Hidup', topAmount: '2 400 MYR/an', color: '#CC0001' },
    mz: { name: 'Mozambique', flag: '🇲🇿', lang: 'pt', topAid: 'PSSB', topAmount: '1 700 MZN/mois', color: '#009A44' },
    ng: { name: 'Nigeria', flag: '🇳🇬', lang: 'en', topAid: 'NSIO Cash Transfer', topAmount: '5 000 NGN/mois', color: '#008751' },
    ni: { name: 'Nicaragua', flag: '🇳🇮', lang: 'es', topAid: 'Amor para los más Chiquitos', topAmount: '1 000 NIO/mois', color: '#3A75C4' },
    nl: { name: 'Pays-Bas', flag: '🇳🇱', lang: 'nl', topAid: 'Bijstand', topAmount: '1 132 €/mois', color: '#AE1C28' },
    no: { name: 'Norvège', flag: '🇳🇴', lang: 'no', topAid: 'Sosialhjelp', topAmount: '7 200 NOK/mois', color: '#EF2B2D' },
    np: { name: 'Népal', flag: '🇳🇵', lang: 'ne', topAid: 'Social Security Allowance', topAmount: '4 000 NPR/mois', color: '#003893' },
    nz: { name: 'Nouvelle-Zélande', flag: '🇳🇿', lang: 'en', topAid: 'Jobseeker Support', topAmount: 'NZ$250/semaine', color: '#00247D' },
    om: { name: 'Oman', flag: '🇴🇲', lang: 'ar', topAid: 'Aide sociale', topAmount: '100 OMR/mois', color: '#DB161B' },
    pa: { name: 'Panama', flag: '🇵🇦', lang: 'es', topAid: '120 a los 65', topAmount: '120 PAB/mois', color: '#005293' },
    pe: { name: 'Pérou', flag: '🇵🇪', lang: 'es', topAid: 'Pensión 65', topAmount: '250 PEN/mois', color: '#D91023' },
    ph: { name: 'Philippines', flag: '🇵🇭', lang: 'tl', topAid: 'Pantawid Pamilya (4Ps)', topAmount: '1 400 PHP/mois', color: '#0038A8' },
    pk: { name: 'Pakistan', flag: '🇵🇰', lang: 'ur', topAid: 'Ehsaas Kafaalat', topAmount: '2 000 PKR/mois', color: '#01411C' },
    pl: { name: 'Pologne', flag: '🇵🇱', lang: 'pl', topAid: '800+', topAmount: '800 PLN/enfant', color: '#DC143C' },
    pt: { name: 'Portugal', flag: '🇵🇹', lang: 'pt', topAid: 'RSI', topAmount: '520 €/mois', color: '#006600' },
    qa: { name: 'Qatar', flag: '🇶🇦', lang: 'ar', topAid: 'Aide sociale', topAmount: '3 000 QAR/mois', color: '#8D1B3D' },
    rs: { name: 'Serbie', flag: '🇷🇸', lang: 'sr', topAid: 'Novčana socijalna pomoć', topAmount: '13 500 RSD/mois', color: '#C6363C' },
    ru: { name: 'Russie', flag: '🇷🇺', lang: 'ru', topAid: 'Aide sociale unifiée', topAmount: '15 000 RUB/mois', color: '#D52B1E' },
    rw: { name: 'Rwanda', flag: '🇷🇼', lang: 'rw', topAid: 'VUP Cash Transfer', topAmount: '10 000 RWF/mois', color: '#20603D' },
    sa: { name: 'Arabie saoudite', flag: '🇸🇦', lang: 'ar', topAid: 'Hafiz', topAmount: '2 000 SAR/mois', color: '#006C35' },
    se: { name: 'Suède', flag: '🇸🇪', lang: 'sv', topAid: 'A-kassa', topAmount: '25 800 kr/mois', color: '#006AA7' },
    sg: { name: 'Singapour', flag: '🇸🇬', lang: 'en', topAid: 'ComCare', topAmount: 'S$1 000/mois', color: '#EF3340' },
    sn: { name: 'Sénégal', flag: '🇸🇳', lang: 'fr', topAid: 'Programme National BSF', topAmount: '25 000 XOF/trimestre', color: '#00853F' },
    sv: { name: 'Salvador', flag: '🇸🇻', lang: 'es', topAid: 'Bono 75 años', topAmount: '75 USD/mois', color: '#0F47AF' },
    th: { name: 'Thaïlande', flag: '🇹🇭', lang: 'th', topAid: 'State Welfare Card', topAmount: '300 THB/mois', color: '#A51931' },
    tj: { name: 'Tadjikistan', flag: '🇹🇯', lang: 'tg', topAid: 'Aide sociale ciblée', topAmount: '170 TJS/mois', color: '#CC0000' },
    tn: { name: 'Tunisie', flag: '🇹🇳', lang: 'ar', topAid: 'Programme AMEN', topAmount: '180 TND/mois', color: '#E70013' },
    tr: { name: 'Turquie', flag: '🇹🇷', lang: 'tr', topAid: 'Sosyal Yardımlaşma', topAmount: '4 500 TRY/mois', color: '#E30A17' },
    tw: { name: 'Taïwan', flag: '🇹🇼', lang: 'zh', topAid: 'Assistance sociale', topAmount: 'NT$17 000/mois', color: '#003087' },
    tz: { name: 'Tanzanie', flag: '🇹🇿', lang: 'sw', topAid: 'TASAF PSSN', topAmount: '20 000 TZS/mois', color: '#1EB53A' },
    ua: { name: 'Ukraine', flag: '🇺🇦', lang: 'uk', topAid: 'Aide sociale garantie', topAmount: '2 361 UAH/mois', color: '#005BBB' },
    ug: { name: 'Ouganda', flag: '🇺🇬', lang: 'en', topAid: 'SCG Programme', topAmount: '25 000 UGX/mois', color: '#000000' },
    us: { name: 'États-Unis', flag: '🇺🇸', lang: 'en', topAid: 'SSI', topAmount: '$967/mois', color: '#3C3B6E' },
    uy: { name: 'Uruguay', flag: '🇺🇾', lang: 'es', topAid: 'Tarjeta Uruguay Social', topAmount: '1 500 UYU/mois', color: '#FFFFFF' },
    uz: { name: 'Ouzbékistan', flag: '🇺🇿', lang: 'uz', topAid: 'Aide sociale d\'État', topAmount: '440 000 UZS/mois', color: '#1EB53A' },
    ve: { name: 'Venezuela', flag: '🇻🇪', lang: 'es', topAid: 'Carnet de la Patria', topAmount: '130 USD/mois', color: '#CF142B' },
    vn: { name: 'Viêt Nam', flag: '🇻🇳', lang: 'vi', topAid: 'Trợ cấp xã hội', topAmount: '360 000 VND/mois', color: '#DA251D' },
    za: { name: 'Afrique du Sud', flag: '🇿🇦', lang: 'en', topAid: 'Social Relief of Distress', topAmount: 'R370/mois', color: '#007A4D' },
    zm: { name: 'Zambie', flag: '🇿🇲', lang: 'en', topAid: 'Social Cash Transfer', topAmount: '120 ZMW/mois', color: '#198A00' },
  };

  /**
   * Extract country code from current URL path.
   * /simulateur/de.html → "de"
   * /aides/monde/ar.html → "ar"
   */
  function detectCountryFromPath() {
    const path = window.location.pathname;
    const match = path.match(/\/(?:simulateur|monde)\/([a-z]{2})\.html/i);
    return match ? match[1].toLowerCase() : null;
  }

  /**
   * Get ?pays= param from URL (legacy support for /simulateur.html?pays=de)
   */
  function getPaysParam() {
    const params = new URLSearchParams(window.location.search);
    return params.get('pays');
  }

  /**
   * Get ?aide= param from URL (keyword landing on country pages)
   */
  function getAideParam() {
    const params = new URLSearchParams(window.location.search);
    return params.get('aide');
  }

  /**
   * Determine if current page is a simulateur page.
   */
  function isSimulateurPage() {
    return window.location.pathname.includes('/simulateur/');
  }

  /**
   * Determine if current page is an aides/monde page.
   */
  function isMondesPage() {
    return window.location.pathname.includes('/aides/monde/') ||
           window.location.pathname.includes('/monde/');
  }

  /**
   * Inject a personalized country banner at the top of the page.
   */
  function injectCountryBanner(cc, country) {
    const aideName = getAideParam() || country.topAid;
    const banner = document.createElement('div');
    banner.id = 'country-banner';
    banner.setAttribute('role', 'banner');
    banner.setAttribute('aria-label', 'Pays sélectionné : ' + country.name);
    banner.style.cssText = [
      'background: linear-gradient(135deg, ' + country.color + '22 0%, ' + country.color + '11 100%)',
      'border-left: 4px solid ' + country.color,
      'border-radius: 0 8px 8px 0',
      'padding: 12px 20px',
      'margin: 0 0 16px 0',
      'font-family: inherit',
      'display: flex',
      'align-items: center',
      'gap: 12px',
      'flex-wrap: wrap',
    ].join(';');

    const pageType = isSimulateurPage() ? 'Simulateur d\'aides sociales' : 'Aides sociales';
    const crossLinkHtml = isSimulateurPage()
      ? '<a href="/aides/monde/' + cc + '.html" style="color:' + country.color + ';text-decoration:underline;font-size:0.85em;white-space:nowrap;">Voir la fiche ' + country.name + ' →</a>'
      : '<a href="/simulateur/' + cc + '.html" style="color:' + country.color + ';text-decoration:underline;font-size:0.85em;white-space:nowrap;">Simuler mes aides en ' + country.name + ' →</a>';

    banner.innerHTML =
      '<span style="font-size:1.6em;flex-shrink:0;" aria-hidden="true">' + country.flag + '</span>' +
      '<div style="flex:1;min-width:200px;">' +
        '<strong style="font-size:1em;color:' + country.color + ';">' + pageType + ' — ' + country.name + '</strong>' +
        '<div style="font-size:0.85em;color:#666;margin-top:2px;">' +
          '<span>Aide principale : <strong>' + aideName + '</strong></span>' +
          ' · <span>' + country.topAmount + '</span>' +
        '</div>' +
      '</div>' +
      crossLinkHtml;

    // Insert after first heading or at top of main
    const main = document.querySelector('main') || document.body;
    const firstH1 = main.querySelector('h1');
    if (firstH1 && firstH1.parentNode) {
      firstH1.parentNode.insertBefore(banner, firstH1.nextSibling);
    } else {
      main.insertBefore(banner, main.firstChild);
    }
  }

  /**
   * Update page <title> and <meta description> dynamically for keyword SEO.
   */
  function updateMetaForKeyword(cc, country) {
    const aide = getAideParam();
    if (!aide) return;

    const title = document.querySelector('title');
    if (title && !title.getAttribute('data-seo-locked')) {
      title.textContent =
        country.name + ' — ' + aide + ' · Simulation | Mes Aides';
    }

    const desc = document.querySelector('meta[name="description"]');
    if (desc && !desc.getAttribute('data-seo-locked')) {
      desc.setAttribute('content',
        aide + ' ' + country.name + ' 2026 : ' + country.topAmount +
        '. Simulateur d\'aides sociales gratuit. ' + country.topAid + ' et autres prestations.'
      );
    }
  }

  /**
   * Add structured data (JSON-LD) for the country aid page.
   */
  function injectStructuredData(cc, country) {
    const existing = document.querySelector('script[type="application/ld+json"][data-country-routing]');
    if (existing) return;

    const ld = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'Aides sociales ' + country.name + ' 2026',
      'description': country.topAid + ' : ' + country.topAmount + '. Simulateur gratuit.',
      'url': window.location.href,
      'inLanguage': country.lang,
      'about': {
        '@type': 'GovernmentService',
        'name': country.topAid,
        'serviceType': 'Social Benefits',
        'areaServed': {
          '@type': 'Country',
          'identifier': cc.toUpperCase()
        }
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-country-routing', '1');
    script.textContent = JSON.stringify(ld, null, 2);
    document.head.appendChild(script);
  }

  // ─── Main ────────────────────────────────────────────────────────────────

  function init() {
    const cc = detectCountryFromPath() || getPaysParam();
    if (!cc) return;

    const country = COUNTRY_MAP[cc];
    if (!country) return;

    injectCountryBanner(cc, country);
    updateMetaForKeyword(cc, country);
    injectStructuredData(cc, country);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
