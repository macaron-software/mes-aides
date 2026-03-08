// ── Accordion ──────────────────────────────────────────────────────────────
document.querySelectorAll('.accordion__trigger').forEach(btn => {
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    // Fermer tous les autres
    document.querySelectorAll('.accordion__trigger').forEach(b => {
      b.setAttribute('aria-expanded', 'false');
      document.getElementById(b.getAttribute('aria-controls'))?.classList.remove('open');
    });
    if (!expanded) {
      btn.setAttribute('aria-expanded', 'true');
      document.getElementById(btn.getAttribute('aria-controls'))?.classList.add('open');
    }
  });
});

// ── Lang selector ──────────────────────────────────────────────────────────
const LANG_NAMES = {
  fr:'Francais',en:'English',de:'Deutsch',es:'Espanol',it:'Italiano',
  pt:'Portugues',nl:'Nederlands',ru:'Russkiy',ja:'Japanese',ko:'Korean',
  zh:'Chinese',ar:'Arabic',hi:'Hindi',tr:'Turkce',pl:'Polski',
  sv:'Svenska',da:'Dansk',nb:'Norsk',fi:'Suomi',cs:'Cestina',
  sk:'Slovencina',hu:'Magyar',ro:'Romana',el:'Ellhnika',uk:'Ukrayinska',
  bg:'Bulgarski',hr:'Hrvatski',id:'Indonesia',ms:'Melayu',th:'Thai',
  vi:'Vietnamese',he:'Hebrew',fa:'Farsi',bn:'Bangla',ca:'Catala',
  am:'Amharic',sw:'Swahili',so:'Somali',ha:'Hausa',tl:'Filipino',
  ku:'Kurdish',ps:'Pashto',ur:'Urdu',sr:'Serbian',yo:'Yoruba'
};
const langBtn = document.getElementById('lang-btn');
const langDropdown = document.getElementById('lang-dropdown');
const currentLang = document.getElementById('current-lang');

// Populate dropdown
(window.SUPPORTED_LANGS || Object.keys(LANG_NAMES)).forEach(code => {
  const item = document.createElement('button');
  item.className = 'lang-dropdown__item';
  item.setAttribute('role', 'option');
  item.setAttribute('data-lang', code);
  item.innerHTML = `<span>${LANG_NAMES[code] || code}</span><span class="lang-dropdown__code">${code.toUpperCase()}</span>`;
  item.addEventListener('click', () => {
    window.I18n?.setLang(code);
    currentLang.textContent = code.toUpperCase();
    langDropdown.classList.remove('open');
    langBtn.setAttribute('aria-expanded', 'false');
    document.querySelectorAll('.lang-dropdown__item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
  });
  langDropdown.appendChild(item);
});

langBtn.addEventListener('click', (e) => {
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

// Init current lang display
window.addEventListener('load', () => {
  const lang = localStorage.getItem('lang') || navigator.language?.slice(0,2) || 'fr';
  currentLang.textContent = lang.toUpperCase();
  langDropdown.querySelectorAll('.lang-dropdown__item').forEach(i => {
    i.classList.toggle('active', i.getAttribute('data-lang') === lang);
  });

// ── Contrast toggle (replaces inline onclick) ─────────────────────────────
(function() {
  var btn = document.getElementById('contrast-toggle');
  if (!btn) return;
  btn.addEventListener('click', function() {
    var h = document.documentElement;
    var cur = h.getAttribute('data-theme');
    if (cur === 'contrast') {
      var saved = localStorage.getItem('theme-before-contrast') || 'light';
      h.setAttribute('data-theme', saved === 'light' ? 'light' : saved);
      if (saved === 'light') h.removeAttribute('data-theme');
      localStorage.removeItem('theme-before-contrast');
    } else {
      localStorage.setItem('theme-before-contrast', cur || 'light');
      h.setAttribute('data-theme', 'contrast');
      localStorage.setItem('theme', 'contrast');
    }
  });
})();
