/**
 * nav.js — Shared: language selector (all pages)
 * Theme is handled by theme.js — load theme.js then nav.js.
 */
const LANG_NAMES = {
  fr:'Français',    en:'English',      de:'Deutsch',      es:'Español',
  it:'Italiano',    pt:'Português',    nl:'Nederlands',   ru:'Русский',
  ja:'日本語',      ko:'한국어',        zh:'中文',          ar:'العربية',
  hi:'हिन्दी',     tr:'Türkçe',       pl:'Polski',        sv:'Svenska',
  da:'Dansk',       nb:'Norsk',        fi:'Suomi',         cs:'Čeština',
  sk:'Slovenčina',  hu:'Magyar',       ro:'Română',        el:'Ελληνικά',
  uk:'Українська',  bg:'Български',    hr:'Hrvatski',      id:'Indonesia',
  ms:'Melayu',      th:'ภาษาไทย',      vi:'Tiếng Việt',    he:'עברית',
  fa:'فارسی',       bn:'বাংলা',        ca:'Català',        am:'አማርኛ',
  sw:'Kiswahili',   so:'Soomaali',     ha:'Hausa',         tl:'Filipino',
  ku:'Kurdî',       ps:'پښتو',         ur:'اردو',          sr:'Srpski',
  yo:'Yorùbá'
};

(function initLangSelector() {
  const langBtn     = document.getElementById('lang-btn');
  const langDropdown= document.getElementById('lang-dropdown');
  const currentEl   = document.getElementById('current-lang');
  if (!langBtn || !langDropdown) return;

  const supported = (window.SUPPORTED_LANGS || Object.keys(LANG_NAMES));

  // Populate
  supported.forEach(code => {
    const item = document.createElement('button');
    item.className = 'lang-dropdown__item';
    item.setAttribute('role', 'option');
    item.setAttribute('data-lang', code);
    item.innerHTML = `<span>${LANG_NAMES[code] || code}</span><span class="lang-dropdown__code">${code.toUpperCase()}</span>`;
    item.addEventListener('click', () => {
      window.I18n?.setLang(code);
      if (currentEl) currentEl.textContent = code.toUpperCase();
      langDropdown.classList.remove('open');
      langBtn.setAttribute('aria-expanded', 'false');
      langDropdown.querySelectorAll('.lang-dropdown__item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
    langDropdown.appendChild(item);
  });

  // Toggle open
  langBtn.addEventListener('click', e => {
    e.stopPropagation();
    const open = langDropdown.classList.contains('open');
    langDropdown.classList.toggle('open', !open);
    langBtn.setAttribute('aria-expanded', String(!open));
  });
  document.addEventListener('click', () => {
    langDropdown.classList.remove('open');
    langBtn.setAttribute('aria-expanded', 'false');
  });
  langDropdown.addEventListener('click', e => e.stopPropagation());

  // Mark active
  const lang = localStorage.getItem('lang') || navigator.language?.slice(0,2) || 'fr';
  if (currentEl) currentEl.textContent = lang.toUpperCase();
  langDropdown.querySelectorAll('.lang-dropdown__item').forEach(i => {
    i.classList.toggle('active', i.getAttribute('data-lang') === lang);
  });
})();

// ── App Shell loader ─────────────────────────────────────────────────────────
// Injected here so all pages (which load nav.js) get the layout shell.
(function loadShell() {
  // CSS
  if (!document.querySelector('link[href*="layout.css"]')) {
    var lnk = document.createElement('link');
    lnk.rel = 'stylesheet';
    // Resolve path relative to root regardless of current page depth
    var base = window.location.origin;
    lnk.href = base + '/css/layout.css';
    document.head.appendChild(lnk);
  }
  // JS
  if (!document.querySelector('script[src*="app-shell.js"]')) {
    var scr = document.createElement('script');
    scr.src = window.location.origin + '/js/app-shell.js';
    document.head.appendChild(scr);
  }
})();
