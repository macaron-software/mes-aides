/**
 * app-shell.js — Responsive 3-breakpoint App Shell for Mes Aides
 *
 * mobile (<768px)  : sticky top toolbar + top-right drawer + bottom tabbar
 * large  (768-1023): fixed left sidebar 240px + 1 content column
 * wide   (≥1024px) : fixed left sidebar 240px + 2 content columns
 *
 * Wraps existing <body> content in .app-shell > .shell-sidebar + .shell-main
 * No page edits required — loaded via nav.js on all pages.
 */
(function buildShell() {
  const NAV = [
    {
      id: 'home', label: 'Accueil', href: '/',
      icon: '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    },
    {
      id: 'simulateur', label: 'Simulateur', href: '/simulateur.html',
      icon: '<rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/>',
    },
    {
      id: 'aides', label: 'Aides', href: '/aides.html',
      icon: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
    },
    {
      id: 'guides', label: 'Guides', href: '/guides.html',
      icon: '<path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>',
    },
  ];

  const LOGO_SVG = `<svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <rect width="32" height="32" rx="8" fill="var(--c-primary)"/>
    <path d="M16 6L8 10V17C8 22.5 11.6 27.4 16 29C20.4 27.4 24 22.5 24 17V10L16 6Z" fill="white" opacity=".2"/>
    <path d="M12 18l3 3 5-6" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

  const SUN_SVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
  const MOON_SVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>`;
  const MENU_SVG = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`;
  const CLOSE_SVG = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

  /** Determine active nav item from current URL */
  function getActiveId() {
    const p = window.location.pathname;
    if (p === '/' || p === '/index.html') return 'home';
    if (p.includes('simulateur')) return 'simulateur';
    if (p.includes('resultats')) return 'simulateur';
    if (p.includes('guides')) return 'guides';
    if (p.includes('aides') || p.includes('/aides/') || p.includes('/europe')) return 'aides';
    return 'home';
  }

  /** Build an SVG icon element */
  function icon(pathData, size) {
    size = size || 20;
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${pathData}</svg>`;
  }

  /** Build the sidebar HTML */
  function buildSidebar(activeId) {
    var navItems = NAV.map(function(tab) {
      var active = tab.id === activeId ? ' active' : '';
      var aria = tab.id === activeId ? ' aria-current="page"' : '';
      return `<a href="${tab.href}" class="shell-sidebar__item${active}"${aria}>
        ${icon(tab.icon)}
        <span>${tab.label}</span>
      </a>`;
    }).join('');

    return `<aside class="shell-sidebar" aria-label="Navigation principale" role="navigation">
      <div class="shell-sidebar__header">
        <a href="/" class="shell-sidebar__brand" aria-label="Mes Aides — accueil">
          ${LOGO_SVG}
          <span class="shell-sidebar__brand-name">Mes Aides</span>
        </a>
      </div>
      <nav class="shell-sidebar__nav" aria-label="Sections principales">
        ${navItems}
      </nav>
      <div class="shell-sidebar__footer">
        <div class="shell-sidebar__tools">
          <button class="shell-sidebar__tool-btn" id="shell-theme-btn" aria-label="Basculer le thème">
            ${SUN_SVG}
          </button>
        </div>
      </div>
    </aside>`;
  }

  /** Build the mobile top toolbar HTML */
  function buildTopbar() {
    return `<div class="shell-topbar" role="banner">
      <a href="/" class="shell-topbar__brand" aria-label="Mes Aides — accueil">
        ${LOGO_SVG}
        <span>Mes Aides</span>
      </a>
      <div class="shell-topbar__right">
        <button class="shell-topbar__btn" id="shell-theme-btn-mobile" aria-label="Basculer le thème">
          ${SUN_SVG}
        </button>
        <button class="shell-topbar__btn" id="shell-drawer-btn" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="shell-drawer">
          ${MENU_SVG}
        </button>
      </div>
    </div>`;
  }

  /** Build the top-right drawer HTML */
  function buildDrawer(activeId) {
    var items = NAV.map(function(tab) {
      var active = tab.id === activeId ? ' active' : '';
      var aria = tab.id === activeId ? ' aria-current="page"' : '';
      return `<a href="${tab.href}" class="shell-drawer__item${active}"${aria}>
        ${icon(tab.icon, 18)}
        <span>${tab.label}</span>
      </a>`;
    }).join('');
    return `<nav class="shell-drawer" id="shell-drawer" role="menu" aria-label="Navigation" aria-hidden="true">
      ${items}
    </nav>`;
  }

  /** Build the bottom TabBar HTML */
  function buildTabbar(activeId) {
    var tabs = NAV.map(function(tab) {
      var active = tab.id === activeId ? ' active' : '';
      var aria = tab.id === activeId ? ' aria-current="page"' : '';
      return `<a href="${tab.href}" class="shell-tabbar__tab${active}"${aria} role="tab" aria-label="${tab.label}">
        ${icon(tab.icon, 22)}
        <span class="shell-tabbar__tab-label">${tab.label}</span>
      </a>`;
    }).join('');
    return `<nav class="shell-tabbar" role="tablist" aria-label="Navigation principale">
      ${tabs}
    </nav>`;
  }

  /** Wire up theme toggle buttons */
  function wireTheme() {
    function updateIcon(btn) {
      if (!btn) return;
      var dark = document.documentElement.getAttribute('data-theme') === 'dark';
      btn.innerHTML = dark ? SUN_SVG : MOON_SVG;
      btn.setAttribute('aria-label', dark ? 'Passer au mode clair' : 'Passer au mode sombre');
    }
    function toggle() {
      var current = document.documentElement.getAttribute('data-theme');
      var next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      ['shell-theme-btn', 'shell-theme-btn-mobile'].forEach(function(id) {
        updateIcon(document.getElementById(id));
      });
      // Sync the existing theme toggle if present
      var old = document.getElementById('theme-toggle');
      if (old) old.dispatchEvent(new MouseEvent('click'));
    }
    ['shell-theme-btn', 'shell-theme-btn-mobile'].forEach(function(id) {
      var btn = document.getElementById(id);
      if (!btn) return;
      updateIcon(btn);
      btn.addEventListener('click', toggle);
    });
  }

  /** Wire up the top-right drawer */
  function wireDrawer() {
    var btn = document.getElementById('shell-drawer-btn');
    var drawer = document.getElementById('shell-drawer');
    if (!btn || !drawer) return;

    function close() {
      drawer.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
    }
    function open() {
      drawer.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      drawer.setAttribute('aria-hidden', 'false');
      btn.innerHTML = CLOSE_SVG;
    }

    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      if (drawer.classList.contains('open')) {
        close();
        btn.innerHTML = MENU_SVG;
      } else {
        open();
      }
    });

    document.addEventListener('click', function() {
      if (drawer.classList.contains('open')) {
        close();
        btn.innerHTML = MENU_SVG;
      }
    });

    drawer.addEventListener('click', function(e) { e.stopPropagation(); });

    // Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && drawer.classList.contains('open')) {
        close();
        btn.innerHTML = MENU_SVG;
        btn.focus();
      }
    });
  }

  /** Main: wrap body in app-shell */
  function init() {
    var activeId = getActiveId();

    // Collect all existing body children
    var bodyChildren = Array.prototype.slice.call(document.body.children);

    // Hide the original site-header (sidebar replaces it on ≥768px, topbar replaces on mobile)
    bodyChildren.forEach(function(el) {
      if (el.classList && el.classList.contains('site-header')) {
        el.setAttribute('data-shell-replaced', 'true');
      }
    });

    // Build shell container
    var shell = document.createElement('div');
    shell.className = 'app-shell';

    // Sidebar
    shell.innerHTML = buildSidebar(activeId);

    // Main area
    var mainArea = document.createElement('div');
    mainArea.className = 'shell-main';

    // Mobile topbar (prepend inside main-area)
    mainArea.insertAdjacentHTML('afterbegin', buildTopbar());

    // Move all existing body children into main-area
    bodyChildren.forEach(function(el) {
      // Skip skip-link (keep at body level for a11y)
      if (el.classList && el.classList.contains('skip-link')) return;
      mainArea.appendChild(el);
    });

    // Mobile drawer (after topbar, before content)
    mainArea.querySelector('.shell-topbar').insertAdjacentHTML('afterend', buildDrawer(activeId));

    // Bottom TabBar (at end of main-area)
    mainArea.insertAdjacentHTML('beforeend', buildTabbar(activeId));

    shell.appendChild(mainArea);
    document.body.appendChild(shell);

    // Wire interactions
    wireTheme();
    wireDrawer();
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
