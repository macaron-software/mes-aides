/**
 * theme.js — Light / Dark / High-contrast mode
 * Apply stored theme before first paint (no flash).
 * Cycle: light → dark → contrast → light
 */
(function () {
  const THEMES = ['light', 'dark', 'contrast'];
  const LABELS = { light: 'Mode sombre', dark: 'Mode contraste', contrast: 'Mode clair' };
  const ICONS  = {
    light:    '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
    dark:     '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
    contrast: '<circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20z" fill="currentColor"/>',
  };

  function getTheme() {
    return localStorage.getItem('theme') || 'light';
  }

  function applyTheme(theme) {
    const html = document.documentElement;
    if (theme === 'light') {
      html.removeAttribute('data-theme');
    } else {
      html.setAttribute('data-theme', theme);
    }
  }

  function updateButton(theme) {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    const next = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
    btn.setAttribute('aria-label', LABELS[theme]);
    btn.setAttribute('title', LABELS[theme]);
    const svgContent = ICONS[theme];
    btn.querySelector('svg').innerHTML = svgContent;
  }

  // Apply immediately before paint
  const saved = getTheme();
  applyTheme(saved);

  window.__theme = {
    cycle() {
      const current = getTheme();
      const next = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length];
      localStorage.setItem('theme', next);
      applyTheme(next);
      updateButton(next);
    },
    init() {
      const t = getTheme();
      applyTheme(t);
      updateButton(t);
      const btn = document.getElementById('theme-toggle');
      if (btn) btn.addEventListener('click', () => window.__theme.cycle());
    }
  };

  // Also respect system dark mode if no saved preference
  if (!localStorage.getItem('theme')) {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      applyTheme('dark');
      localStorage.setItem('theme', 'dark');
    }
  }

  document.addEventListener('DOMContentLoaded', () => window.__theme.init());
})();
