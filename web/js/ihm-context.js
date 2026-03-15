/**
 * IHM Context Header — Shows persona, feature, RBAC, CRUD, user stories context
 * Injected at top of each page in design/dev mode
 */

const IHMContext = {
  enabled: false,
  
  // Screen → context mapping (from tracability.db)
  screens: {
    '/': {
      code: 'SCR001',
      name: 'Home / Landing',
      personas: ['precaire', 'senior', 'jeune', 'famille', 'handicap', 'travailleur'],
      feature: 'F001-simulateur',
      stories: [],
      rbac: { anonymous: ['read'], admin: ['read'] },
      crud: { visitors: 'R' }
    },
    '/simulateur.html': {
      code: 'SCR002',
      name: 'Simulateur — Wizard',
      personas: ['precaire', 'senior', 'jeune', 'famille', 'handicap', 'travailleur'],
      feature: 'F001-simulateur',
      stories: ['US001', 'US002', 'US003', 'US004', 'US005', 'US006', 'US007'],
      rbac: { anonymous: ['read', 'execute'], admin: ['read', 'execute'] },
      crud: { situation: 'C' }  // Create situation locally
    },
    '/resultats.html': {
      code: 'SCR003',
      name: 'Résultats — Eligible aids',
      personas: ['precaire', 'senior', 'famille', 'handicap'],
      feature: 'F002-resultats',
      stories: ['US010', 'US011', 'US012', 'US013', 'US014', 'US015'],
      rbac: { anonymous: ['read'], admin: ['read'] },
      crud: { results: 'R' }
    },
    '/aides.html': {
      code: 'SCR004',
      name: 'Catalogue — All aids',
      personas: ['precaire', 'senior', 'jeune', 'famille', 'handicap', 'travailleur'],
      feature: 'F003-catalogue',
      stories: ['US020', 'US021', 'US022', 'US023'],
      rbac: { anonymous: ['read'], admin: ['read', 'update'] },
      crud: { aides: 'R' }
    },
    '/guides.html': {
      code: 'SCR005',
      name: 'Guides — Help articles',
      personas: ['senior', 'famille'],
      feature: 'F004-guides',
      stories: [],
      rbac: { anonymous: ['read'], admin: ['read', 'update'] },
      crud: { guides: 'R' }
    },
    '/accessibilite.html': {
      code: 'SCR006',
      name: 'Accessibilité — A11y statement',
      personas: ['handicap'],
      feature: 'F006-a11y',
      stories: ['US040', 'US041', 'US042'],
      rbac: { anonymous: ['read'], admin: ['read', 'update'] },
      crud: { statement: 'R' }
    }
  },
  
  // Persona descriptions
  personas: {
    precaire: { label: 'Personne précaire', icon: '👤', color: '#dc2626' },
    senior: { label: 'Senior 60+', icon: '👴', color: '#7c3aed' },
    jeune: { label: 'Jeune 18-25', icon: '🎓', color: '#2563eb' },
    famille: { label: 'Famille avec enfants', icon: '👨‍👩‍👧', color: '#059669' },
    handicap: { label: 'Personne handicapée', icon: '♿', color: '#d97706' },
    travailleur: { label: 'Travailleur modeste', icon: '💼', color: '#0891b2' }
  },
  
  init() {
    // Enable with ?context or localStorage
    this.enabled = new URLSearchParams(location.search).has('context')
      || localStorage.getItem('ihm-context') === 'true';
    
    if (this.enabled) {
      this.render();
    }
  },
  
  getCurrentScreen() {
    const path = location.pathname;
    return this.screens[path] || this.screens[path.replace(/^\//, '')] || null;
  },
  
  render() {
    const screen = this.getCurrentScreen();
    if (!screen) return;
    
    const header = document.createElement('div');
    header.className = 'ihm-context-header';
    header.setAttribute('role', 'banner');
    header.setAttribute('aria-label', 'Development context');
    
    // Build personas badges
    const personaBadges = screen.personas.map(p => {
      const persona = this.personas[p];
      return `<span class="ihm-persona" style="--persona-color: ${persona.color}" title="${persona.label}">${persona.label}</span>`;
    }).join('');
    
    // Build RBAC
    const rbacHtml = Object.entries(screen.rbac).map(([role, perms]) => 
      `<span class="ihm-rbac"><strong>${role}:</strong> ${perms.join(', ')}</span>`
    ).join(' ');
    
    // Build CRUD
    const crudHtml = Object.entries(screen.crud).map(([resource, ops]) =>
      `<span class="ihm-crud"><strong>${resource}:</strong> ${ops}</span>`
    ).join(' ');
    
    header.innerHTML = `
      <div class="ihm-context-row">
        <span class="ihm-screen">${screen.code}: ${screen.name}</span>
        <span class="ihm-feature">${screen.feature}</span>
      </div>
      <div class="ihm-context-row">
        <span class="ihm-label">Personas:</span> ${personaBadges}
      </div>
      <div class="ihm-context-row">
        <span class="ihm-label">Stories:</span>
        <span class="ihm-stories">${screen.stories.length > 0 ? screen.stories.join(', ') : '—'}</span>
      </div>
      <div class="ihm-context-row">
        <span class="ihm-label">RBAC:</span> ${rbacHtml}
        <span class="ihm-label" style="margin-left: 16px;">CRUD:</span> ${crudHtml}
      </div>
      <button class="ihm-close" aria-label="Close context header" onclick="IHMContext.hide()">×</button>
    `;
    
    // Inject styles
    if (!document.getElementById('ihm-context-styles')) {
      const style = document.createElement('style');
      style.id = 'ihm-context-styles';
      style.textContent = `
        .ihm-context-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 9999;
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          color: #f1f5f9;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 12px;
          padding: 8px 40px 8px 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        .ihm-context-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 4px;
        }
        .ihm-context-row:last-of-type { margin-bottom: 0; }
        .ihm-label {
          color: #94a3b8;
          font-weight: 500;
        }
        .ihm-screen {
          font-weight: 600;
          color: #38bdf8;
        }
        .ihm-feature {
          background: #0B6E4F;
          color: white;
          padding: 2px 8px;
          border-radius: 4px;
          font-weight: 500;
        }
        .ihm-persona {
          background: color-mix(in srgb, var(--persona-color) 20%, transparent);
          border: 1px solid var(--persona-color);
          color: var(--persona-color);
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
        }
        .ihm-stories {
          font-family: monospace;
          color: #fbbf24;
        }
        .ihm-rbac, .ihm-crud {
          font-family: monospace;
          color: #a5f3fc;
        }
        .ihm-close {
          position: absolute;
          top: 8px;
          right: 8px;
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 20px;
          cursor: pointer;
          line-height: 1;
        }
        .ihm-close:hover { color: #f1f5f9; }
        
        /* Push page content down when header visible */
        body.ihm-context-active {
          padding-top: 100px !important;
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.classList.add('ihm-context-active');
    document.body.insertBefore(header, document.body.firstChild);
  },
  
  hide() {
    const header = document.querySelector('.ihm-context-header');
    if (header) header.remove();
    document.body.classList.remove('ihm-context-active');
    localStorage.removeItem('ihm-context');
  },
  
  toggle() {
    if (this.enabled) {
      this.hide();
      this.enabled = false;
    } else {
      this.enabled = true;
      localStorage.setItem('ihm-context', 'true');
      this.render();
    }
  }
};

// Auto-init
document.addEventListener('DOMContentLoaded', () => IHMContext.init());

// Export for console access
window.IHMContext = IHMContext;
