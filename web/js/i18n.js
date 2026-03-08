const SUPPORTED = [
  'fr','en','de','es','it','pt','nl','ru','ja','ko','zh','ar',
  'hi','tr','pl','sv','da','nb','fi','cs','sk','hu','ro','el',
  'uk','bg','hr','id','ms','th','vi','he','fa','bn','ca','am',
  // kept from original
  'sw','so','ha','tl','ku','ps','ur','sr','yo'
];

const RTL_LANGS = ['ar','fa','he','ur','ps','ku'];

const I18n = {
  lang: localStorage.getItem('lang') || navigator.language?.slice(0,2) || 'fr',
  data: {},

  async load(lang) {
    const l = SUPPORTED.includes(lang) ? lang : 'fr';
    try {
      const res = await fetch(`/locales/${l}.json`);
      if (!res.ok) throw new Error('404');
      this.data = await res.json();
      this.lang = l;
      localStorage.setItem('lang', l);
      document.documentElement.lang = l;
      document.documentElement.dir = RTL_LANGS.includes(l) ? 'rtl' : 'ltr';
      this.apply();
      if (l !== 'fr' && !Object.keys(this.fallback).length) {
        fetch('/locales/fr.json').then(r => r.ok ? r.json() : {}).then(d => { this.fallback = d; });
      }
    } catch {
      if (l !== 'fr') {
        try {
          const r2 = await fetch('/locales/fr.json');
          if (r2.ok) {
            this.data = await r2.json();
            this.lang = 'fr';
          }
        } catch { /* use HTML defaults */ }
      }
    }
  },

  /** Resolve dot-separated key: "step1.title" -> data.step1.title */
  fallback: {},

  t(key, vars = {}) {
    const resolve = (data, k) => {
      const parts = k.split('.');
      let v = data;
      for (const p of parts) { if (v == null) return null; v = v[p]; }
      return typeof v === 'string' ? v : null;
    };
    let val = resolve(this.data, key) ?? resolve(this.fallback, key);
    if (val === null) return key;
    return val.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
  },

  /** Apply translations to all [data-i18n] elements in the document */
  apply() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const tr = this.t(key);
      if (tr !== key) el.textContent = tr;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const tr = this.t(key);
      if (tr !== key) el.setAttribute('placeholder', tr);
    });
  },

  setLang(lang) {
    this.load(lang);
  }
};

// Init
(async () => {
  const lang = localStorage.getItem('lang') || navigator.language?.slice(0,2) || 'fr';
  await I18n.load(lang);
})();

window.I18n = I18n;
window.SUPPORTED_LANGS = SUPPORTED;
