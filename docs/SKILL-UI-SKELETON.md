# SKILL-UI-SKELETON.md — Skeleton + Placeholder + Annotation System

## Overview

Skeleton/placeholder system for progressive loading + design annotation workflow.
Inspired by Agentation format for AI-agent-friendly UI feedback.

## 1. Skeleton Components

### Purpose
- Show content structure during load
- Reduce perceived latency (Doherty <400ms threshold)
- Maintain layout stability (CLS)

### CSS Variables
```css
:root {
  --skeleton-bg: #e5e7eb;       /* gray-200 */
  --skeleton-shine: #f3f4f6;    /* gray-100 */
  --skeleton-radius: var(--radius-sm);
  --skeleton-duration: 1.5s;
}
```

### Base Skeleton
```css
.skeleton {
  background: var(--skeleton-bg);
  border-radius: var(--skeleton-radius);
  animation: skeleton-pulse var(--skeleton-duration) ease-in-out infinite;
}

@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Shimmer variant */
.skeleton--shimmer {
  background: linear-gradient(
    90deg,
    var(--skeleton-bg) 0%,
    var(--skeleton-shine) 50%,
    var(--skeleton-bg) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer var(--skeleton-duration) infinite;
}

@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Skeleton Types

| Type | Class | Use Case |
|------|-------|----------|
| Text line | `.skeleton-text` | Single line placeholder |
| Paragraph | `.skeleton-paragraph` | Multi-line text block |
| Avatar | `.skeleton-avatar` | User photo placeholder |
| Button | `.skeleton-button` | Action button |
| Card | `.skeleton-card` | Full card layout |
| Image | `.skeleton-image` | Image placeholder |
| Badge | `.skeleton-badge` | Status indicators |
| Input | `.skeleton-input` | Form field |

### HTML Examples
```html
<!-- Text skeleton -->
<div class="skeleton skeleton-text" style="width: 60%"></div>

<!-- Paragraph (3 lines) -->
<div class="skeleton-paragraph">
  <div class="skeleton skeleton-text"></div>
  <div class="skeleton skeleton-text" style="width: 90%"></div>
  <div class="skeleton skeleton-text" style="width: 70%"></div>
</div>

<!-- Card skeleton -->
<article class="skeleton-card">
  <div class="skeleton skeleton-image"></div>
  <div class="skeleton skeleton-text" style="width: 80%"></div>
  <div class="skeleton skeleton-text" style="width: 60%"></div>
  <div class="skeleton skeleton-button"></div>
</article>

<!-- Result card skeleton (Mes Aides specific) -->
<div class="aide-card skeleton-card">
  <div class="skeleton skeleton-badge"></div>
  <div class="skeleton skeleton-text" style="width: 70%"></div>
  <div class="skeleton skeleton-text" style="width: 40%"></div>
  <div class="skeleton skeleton-button"></div>
</div>
```

---

## 2. Placeholder System

### Purpose
- Design-time element positioning
- Annotatable for AI agents
- Draggable in design mode

### Placeholder HTML
```html
<div class="placeholder" 
     data-placeholder-id="ph_001"
     data-placeholder-type="component"
     data-placeholder-name="CTA Button"
     data-draggable="true">
  <span class="placeholder__label">CTA Button</span>
  <span class="placeholder__type">button</span>
</div>
```

### Placeholder CSS
```css
.placeholder {
  position: relative;
  border: 2px dashed var(--c-primary);
  border-radius: var(--radius-md);
  padding: var(--sp-md);
  background: color-mix(in srgb, var(--c-primary) 5%, transparent);
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-sm);
}

.placeholder__label {
  font-size: var(--fs-sm);
  color: var(--c-primary);
  font-weight: 500;
}

.placeholder__type {
  font-size: var(--fs-xs);
  color: var(--c-text-muted);
  background: var(--c-surface);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

/* Design mode: draggable */
.design-mode .placeholder {
  cursor: move;
}

.design-mode .placeholder:hover {
  border-color: var(--c-accent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--c-accent) 20%, transparent);
}

.placeholder.dragging {
  opacity: 0.5;
  border-style: solid;
}
```

---

## 3. Annotation System (Agentation-inspired)

### Annotation Schema (AFS v1 compatible)
```typescript
interface Annotation {
  id: string;              // "ann_k8x2m"
  comment: string;         // User feedback
  elementPath: string;     // CSS selector path
  timestamp: number;       // Unix ms
  x: number;               // % viewport width
  y: number;               // px from doc top
  element: string;         // Tag name
  
  // Optional context
  url?: string;
  boundingBox?: { x: number; y: number; width: number; height: number };
  cssClasses?: string;
  nearbyText?: string;
  selectedText?: string;
  
  // Lifecycle
  intent?: "fix" | "change" | "question" | "approve";
  severity?: "blocking" | "important" | "suggestion";
  status?: "pending" | "acknowledged" | "resolved" | "dismissed";
  
  // Mes Aides specific
  persona_udid?: string;   // Link to persona
  story_udid?: string;     // Link to user story
  screen_udid?: string;    // Link to IHM screen
}
```

### Annotation Markers
```html
<!-- Annotation marker -->
<div class="annotation-marker" 
     data-annotation-id="ann_001"
     style="left: 45%; top: 120px;">
  <button class="annotation-marker__pin" aria-label="View annotation">
    <span class="annotation-marker__number">1</span>
  </button>
</div>

<!-- Annotation panel -->
<aside class="annotation-panel" data-annotation-id="ann_001">
  <header class="annotation-panel__header">
    <span class="annotation-panel__element">.aide-card > .montant</span>
    <span class="annotation-panel__severity" data-severity="important">Important</span>
  </header>
  <div class="annotation-panel__comment">
    Le montant devrait être plus visible, augmenter la taille de police.
  </div>
  <footer class="annotation-panel__meta">
    <span>Story: US011</span>
    <span>Persona: senior</span>
  </footer>
</aside>
```

### Annotation CSS
```css
.annotation-marker {
  position: absolute;
  z-index: 1000;
  pointer-events: none;
}

.annotation-marker__pin {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--c-accent);
  color: white;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  font-size: var(--fs-xs);
  font-weight: 600;
  cursor: pointer;
  pointer-events: auto;
}

.annotation-marker__pin:hover {
  transform: scale(1.1);
}

.annotation-panel {
  position: fixed;
  width: 300px;
  background: var(--c-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  padding: var(--sp-md);
  z-index: 1001;
}

.annotation-panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--sp-sm);
  font-family: monospace;
  font-size: var(--fs-xs);
}

.annotation-panel__severity[data-severity="blocking"] {
  color: var(--c-error);
}

.annotation-panel__severity[data-severity="important"] {
  color: var(--c-warning);
}

.annotation-panel__severity[data-severity="suggestion"] {
  color: var(--c-success);
}
```

---

## 4. Design Mode JavaScript

```javascript
// design-mode.js — Placeholder drag + annotation system

const DesignMode = {
  enabled: false,
  annotations: [],
  
  init() {
    // Check URL param or localStorage
    this.enabled = new URLSearchParams(location.search).has('design') 
      || localStorage.getItem('design-mode') === 'true';
    
    if (this.enabled) {
      document.body.classList.add('design-mode');
      this.loadAnnotations();
      this.setupDragDrop();
      this.setupAnnotationCreation();
    }
  },
  
  setupDragDrop() {
    document.querySelectorAll('.placeholder[data-draggable="true"]').forEach(el => {
      el.draggable = true;
      el.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', el.dataset.placeholderId);
        el.classList.add('dragging');
      });
      el.addEventListener('dragend', () => {
        el.classList.remove('dragging');
      });
    });
  },
  
  setupAnnotationCreation() {
    document.addEventListener('click', e => {
      if (!e.altKey) return; // Alt+Click to annotate
      
      const rect = e.target.getBoundingClientRect();
      const annotation = {
        id: `ann_${Date.now().toString(36)}`,
        comment: '',
        elementPath: this.getElementPath(e.target),
        timestamp: Date.now(),
        x: (e.clientX / window.innerWidth) * 100,
        y: e.pageY,
        element: e.target.tagName.toLowerCase(),
        cssClasses: e.target.className,
        boundingBox: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        status: 'pending'
      };
      
      this.annotations.push(annotation);
      this.showAnnotationEditor(annotation);
      this.saveAnnotations();
    });
  },
  
  getElementPath(el) {
    const path = [];
    while (el && el !== document.body) {
      let selector = el.tagName.toLowerCase();
      if (el.id) selector += `#${el.id}`;
      else if (el.className) selector += `.${el.className.split(' ').join('.')}`;
      path.unshift(selector);
      el = el.parentElement;
    }
    return 'body > ' + path.join(' > ');
  },
  
  showAnnotationEditor(annotation) {
    const panel = document.createElement('div');
    panel.className = 'annotation-editor';
    panel.innerHTML = `
      <textarea placeholder="Describe the issue..."></textarea>
      <select data-field="severity">
        <option value="suggestion">Suggestion</option>
        <option value="important">Important</option>
        <option value="blocking">Blocking</option>
      </select>
      <select data-field="intent">
        <option value="fix">Fix</option>
        <option value="change">Change</option>
        <option value="question">Question</option>
      </select>
      <button data-action="save">Save</button>
      <button data-action="cancel">Cancel</button>
    `;
    panel.style.cssText = `left:${annotation.x}%;top:${annotation.y}px;`;
    document.body.appendChild(panel);
    
    panel.querySelector('[data-action="save"]').onclick = () => {
      annotation.comment = panel.querySelector('textarea').value;
      annotation.severity = panel.querySelector('[data-field="severity"]').value;
      annotation.intent = panel.querySelector('[data-field="intent"]').value;
      this.renderMarker(annotation);
      this.saveAnnotations();
      panel.remove();
    };
    
    panel.querySelector('[data-action="cancel"]').onclick = () => {
      this.annotations = this.annotations.filter(a => a.id !== annotation.id);
      panel.remove();
    };
  },
  
  renderMarker(annotation) {
    const marker = document.createElement('div');
    marker.className = 'annotation-marker';
    marker.dataset.annotationId = annotation.id;
    marker.style.cssText = `left:${annotation.x}%;top:${annotation.y}px;`;
    marker.innerHTML = `
      <button class="annotation-marker__pin" aria-label="View annotation">
        <span class="annotation-marker__number">${this.annotations.indexOf(annotation) + 1}</span>
      </button>
    `;
    document.body.appendChild(marker);
  },
  
  loadAnnotations() {
    const stored = localStorage.getItem('annotations');
    if (stored) {
      this.annotations = JSON.parse(stored);
      this.annotations.forEach(a => this.renderMarker(a));
    }
  },
  
  saveAnnotations() {
    localStorage.setItem('annotations', JSON.stringify(this.annotations));
  },
  
  exportMarkdown() {
    return this.annotations.map((a, i) => `
## Annotation #${i + 1}

**Element:** ${a.element}${a.cssClasses ? '.' + a.cssClasses.split(' ').join('.') : ''}
**Path:** ${a.elementPath}
**Position:** ${a.boundingBox?.x}px, ${a.boundingBox?.y}px (${a.boundingBox?.width}×${a.boundingBox?.height}px)
**Feedback:** ${a.comment}
**Severity:** ${a.severity || 'suggestion'}
**Intent:** ${a.intent || 'fix'}
**Status:** ${a.status}
`).join('\n---\n');
  },
  
  exportJSON() {
    return JSON.stringify(this.annotations, null, 2);
  }
};

// Auto-init
document.addEventListener('DOMContentLoaded', () => DesignMode.init());
```

---

## 5. Mes Aides Screen Skeletons

### Simulateur Skeleton
```html
<main class="simulateur skeleton-container">
  <div class="wizard-progress">
    <div class="skeleton skeleton-text" style="width: 100%; height: 8px;"></div>
  </div>
  
  <h1 class="skeleton skeleton-text" style="width: 50%; height: 32px;"></h1>
  
  <form class="form-section">
    <div class="form-group">
      <div class="skeleton skeleton-text" style="width: 30%; height: 16px;"></div>
      <div class="skeleton skeleton-input"></div>
    </div>
    <div class="form-group">
      <div class="skeleton skeleton-text" style="width: 40%; height: 16px;"></div>
      <div class="skeleton skeleton-input"></div>
    </div>
    <div class="skeleton skeleton-button" style="width: 150px;"></div>
  </form>
</main>
```

### Résultats Skeleton
```html
<main class="resultats skeleton-container">
  <header class="resultats-header">
    <div class="skeleton skeleton-text" style="width: 60%; height: 28px;"></div>
    <div class="skeleton skeleton-badge" style="width: 120px;"></div>
  </header>
  
  <div class="aides-list">
    <!-- Repeat 3-5 times -->
    <article class="aide-card skeleton-card">
      <div class="skeleton skeleton-badge" style="width: 80px;"></div>
      <div class="skeleton skeleton-text" style="width: 70%"></div>
      <div class="skeleton skeleton-text" style="width: 40%"></div>
      <div class="skeleton skeleton-button"></div>
    </article>
  </div>
</main>
```

---

## 6. API Loading Pattern

### REST with gzip
```javascript
async function fetchAides(situation) {
  const response = await fetch('/api/simulate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept-Encoding': 'gzip'
    },
    body: JSON.stringify(situation)
  });
  return response.json();
}
```

### Progressive Enhancement
```javascript
// 1. Show skeleton immediately
showSkeleton('resultats');

// 2. Fetch data
const result = await fetchAides(situation);

// 3. Replace skeleton with real content
replaceSkeleton('resultats', renderAides(result.aides));
```

---

## 7. Tracability Integration

### DB Schema Extension
```sql
-- Annotations table
CREATE TABLE annotations (
    udid TEXT PRIMARY KEY,
    screen_udid TEXT REFERENCES ihm_screens(udid),
    story_udid TEXT REFERENCES user_stories(udid),
    persona_udid TEXT REFERENCES personas(udid),
    element_path TEXT NOT NULL,
    comment TEXT NOT NULL,
    intent TEXT CHECK(intent IN ('fix', 'change', 'question', 'approve')),
    severity TEXT CHECK(severity IN ('blocking', 'important', 'suggestion')),
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'acknowledged', 'resolved', 'dismissed')),
    x_pct REAL,
    y_px REAL,
    bounding_box TEXT,  -- JSON
    resolved_at TEXT,
    resolved_by TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_annotations_screen ON annotations(screen_udid);
CREATE INDEX idx_annotations_status ON annotations(status);
```

### Export for AI Agents
```sql
-- Get pending annotations as markdown
SELECT 
  '## Annotation #' || ROW_NUMBER() OVER (ORDER BY created_at) || E'\n\n' ||
  '**Screen:** ' || s.name || ' (' || s.route || ')' || E'\n' ||
  '**Element:** ' || a.element_path || E'\n' ||
  '**Feedback:** ' || a.comment || E'\n' ||
  '**Severity:** ' || a.severity || E'\n' ||
  '**Story:** ' || us.code || E'\n' ||
  '**Persona:** ' || p.name || E'\n\n---\n'
FROM annotations a
LEFT JOIN ihm_screens s ON a.screen_udid = s.udid
LEFT JOIN user_stories us ON a.story_udid = us.udid
LEFT JOIN personas p ON a.persona_udid = p.udid
WHERE a.status = 'pending';
```

---

## 8. Best Practices

### Skeleton
- Match real content dimensions closely
- Use consistent animation timing
- Remove skeleton only when content fully loaded
- Maintain layout stability (no CLS)

### Placeholders
- Clear labels and types
- Respect min touch target (44x44px)
- Draggable only in design mode
- Preserve after drop

### Annotations
- Alt+Click to create (non-destructive)
- One issue per annotation
- Include severity + intent
- Link to story/persona when possible
- Export both JSON (for agents) and Markdown (for chat)
