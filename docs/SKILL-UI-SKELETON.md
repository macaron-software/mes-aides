---
name: ui-skeleton
description: Skeleton + placeholder + annotation system for progressive loading.
---

# Skeleton + Placeholder System

## Skeleton Components

Purpose: show structure during load, reduce perceived latency, maintain layout stability (CLS).

### CSS
```css
.skeleton {
  background: var(--skeleton-bg, #e5e7eb);
  border-radius: var(--radius-sm);
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}
@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.skeleton--shimmer {
  background: linear-gradient(90deg, var(--skeleton-bg) 0%, var(--skeleton-shine, #f3f4f6) 50%, var(--skeleton-bg) 100%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
}
```

### Types
| Type | Class | Use Case |
|------|-------|----------|
| Text | `.skeleton-text` | Single line |
| Paragraph | `.skeleton-paragraph` | Multi-line |
| Card | `.skeleton-card` | Full card |
| Button | `.skeleton-button` | Action button |
| Badge | `.skeleton-badge` | Status indicators |
| Input | `.skeleton-input` | Form field |

### Example
```html
<div class="aide-card skeleton-card">
  <div class="skeleton skeleton-badge"></div>
  <div class="skeleton skeleton-text" style="width: 70%"></div>
  <div class="skeleton skeleton-text" style="width: 40%"></div>
  <div class="skeleton skeleton-button"></div>
</div>
```

## Annotation System (Agentation-style)

### Schema
```typescript
interface Annotation {
  id: string;
  comment: string;
  elementPath: string;  // CSS selector path
  x: number; y: number; // % viewport, px from top
  intent?: "fix" | "change" | "question" | "approve";
  severity?: "blocking" | "important" | "suggestion";
  status?: "pending" | "acknowledged" | "resolved" | "dismissed";
}
```

### Marker + Panel
```html
<div class="annotation-marker" data-annotation-id="ann_001" style="left: 45%; top: 120px;">
  <button class="annotation-marker__pin" aria-label="View annotation">
    <span class="annotation-marker__number">1</span>
  </button>
</div>
```

## Progressive Enhancement Pattern
```javascript
// 1. Show skeleton immediately
showSkeleton('resultats');
// 2. Fetch data
const result = await fetchAides(situation);
// 3. Replace skeleton with real content
replaceSkeleton('resultats', renderAides(result.aides));
```

## Best Practices
- Match real content dimensions closely
- Consistent animation timing
- Remove skeleton only when content fully loaded
- Maintain layout stability (no CLS)
- Alt+Click to create annotation (non-destructive)
- One issue per annotation
