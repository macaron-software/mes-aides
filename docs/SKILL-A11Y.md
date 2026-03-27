---
name: accessibility-a11y
description: Implement WCAG 2.2 + WAI-ARIA patterns for interactive components.
---

# Accessibility (a11y) Skill

Ref: https://www.w3.org/WAI/ARIA/apg/

## WCAG 2.2 QUICK REF

### Level A
- 1.1.1 Alt text for images
- 1.3.1 Semantic HTML
- 1.4.1 Don't rely solely on color
- 2.1.1 All functionality via keyboard
- 2.4.1 Skip links
- 4.1.2 Name, Role, Value for widgets

### Level AA
- 1.4.3 Contrast ≥4.5:1 text, ≥3:1 UI
- 1.4.10 No horizontal scroll at 320px
- 2.4.6 Descriptive headings/labels
- 2.4.7 Visible focus
- 2.5.5 Target size ≥24x24px (44x44 recommended)

## ARIA PATTERNS

### Tabs
```html
<div role="tablist">
  <button role="tab" aria-selected="true" aria-controls="p1">Tab 1</button>
  <button role="tab" aria-selected="false" aria-controls="p2" tabindex="-1">Tab 2</button>
</div>
<div role="tabpanel" id="p1">Content 1</div>
<div role="tabpanel" id="p2" hidden>Content 2</div>
```
Keyboard: Arrow L/R move tabs, Enter/Space activate.

### Dialog (Modal)
```html
<div role="dialog" aria-modal="true" aria-labelledby="title">
  <h2 id="title">Confirm</h2>
  <button>Cancel</button> <button>Confirm</button>
</div>
```
Keyboard: Tab cycles within, Escape closes, focus trap required.

### Alert
```html
<div role="alert" aria-live="assertive">Error message</div>
```

### Switch (Toggle)
```html
<button role="switch" aria-checked="false" aria-label="Dark mode">Off</button>
```

## FOCUS INDICATOR

```css
:focus-visible { outline: 2px solid var(--c-primary); outline-offset: 2px; }
:focus:not(:focus-visible) { outline: none; }
```

## TEST CHECKLIST

```
□ All interactive elems keyboard accessible
□ Focus order logical
□ Focus visible everywhere
□ No keyboard traps (except modals)
□ Skip link to main content
□ All images have alt text
□ Contrast ≥4.5:1 text, ≥3:1 UI
□ Page works at 200% zoom
□ No horiz scroll at 320px
□ Form inputs have visible labels
□ Error msgs associated with inputs
□ lang attr on html
□ Headings in logical order
□ Works with screen reader
```
