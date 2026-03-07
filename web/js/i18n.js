// i18n stub — full 40-lang implementation in Sprint 3
const I18n = {
  lang: localStorage.getItem('lang') || navigator.language?.slice(0, 2) || 'fr',
  data: {},
  async load(lang) {
    try {
      const res = await fetch(`/locales/${lang}.json`);
      if (!res.ok) throw new Error();
      this.data = await res.json();
      this.lang = lang;
      localStorage.setItem('lang', lang);
    } catch {
      // fallback: no translation, native HTML text
    }
  },
  t(key) { return this.data[key] ?? key; },
};

if (I18n.lang !== 'fr') I18n.load(I18n.lang);
window.I18n = I18n;
