---
name: accessibility-a11y
description: Implement WCAG 2.2 accessibility and WAI-ARIA patterns. Use this skill when creating interactive components, forms, navigation, or validating accessibility compliance. Covers 30 ARIA patterns with keyboard interactions.
---

# Accessibility (a11y) Skill

Reference: https://www.w3.org/WAI/ARIA/apg/patterns/

## WCAG 2.2 QUICK REFERENCE

### Level A (Minimum)
- 1.1.1 Non-text Content: Alt text for images
- 1.3.1 Info and Relationships: Semantic HTML
- 1.4.1 Use of Color: Don't rely solely on color
- 2.1.1 Keyboard: All functionality via keyboard
- 2.4.1 Bypass Blocks: Skip links
- 2.4.2 Page Titled: Descriptive titles
- 3.1.1 Language of Page: lang attribute
- 4.1.1 Parsing: Valid HTML
- 4.1.2 Name, Role, Value: ARIA labels

### Level AA (Standard Target)
- 1.4.3 Contrast (Minimum): 4.5:1 for text
- 1.4.4 Resize Text: Up to 200%
- 1.4.10 Reflow: No horizontal scroll at 320px
- 1.4.11 Non-text Contrast: 3:1 for UI
- 2.4.6 Headings and Labels: Descriptive
- 2.4.7 Focus Visible: Clear focus indicator
- 2.5.5 Target Size: Minimum 24x24px (44x44 recommended)
- 3.2.3 Consistent Navigation: Same order
- 3.2.4 Consistent Identification: Same labels

---

## ARIA PATTERNS (30 Patterns)

### Navigation Components

#### Breadcrumb
```html
<nav aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/category">Category</a></li>
    <li><a href="/category/page" aria-current="page">Current</a></li>
  </ol>
</nav>
```
- role: none needed (semantic HTML)
- aria-current="page" on current item

#### Tabs
```html
<div role="tablist" aria-label="Section tabs">
  <button role="tab" aria-selected="true" aria-controls="panel1" id="tab1">Tab 1</button>
  <button role="tab" aria-selected="false" aria-controls="panel2" id="tab2" tabindex="-1">Tab 2</button>
</div>
<div role="tabpanel" id="panel1" aria-labelledby="tab1">Content 1</div>
<div role="tabpanel" id="panel2" aria-labelledby="tab2" hidden>Content 2</div>
```
**Keyboard:**
- Arrow Left/Right: Move between tabs
- Home/End: First/last tab
- Enter/Space: Activate tab

#### Landmarks
```html
<header role="banner">Site header</header>
<nav role="navigation" aria-label="Main">Navigation</nav>
<main role="main">Main content</main>
<aside role="complementary">Sidebar</aside>
<footer role="contentinfo">Footer</footer>
<form role="search">Search</form>
```

### Form Controls

#### Button
```html
<button type="button" aria-label="Close dialog">
  <svg aria-hidden="true">...</svg>
</button>
```
- Use `<button>` not `<div role="button">`
- aria-label when no visible text
- aria-pressed for toggle buttons
- aria-expanded for buttons that control disclosure

#### Checkbox
```html
<div role="group" aria-labelledby="group-label">
  <p id="group-label">Options</p>
  <label><input type="checkbox" name="opt1"> Option 1</label>
  <label><input type="checkbox" name="opt2"> Option 2</label>
</div>
```
**Keyboard:** Space to toggle

#### Radio Group
```html
<fieldset>
  <legend>Choose one:</legend>
  <label><input type="radio" name="choice" value="a"> A</label>
  <label><input type="radio" name="choice" value="b"> B</label>
</fieldset>
```
**Keyboard:** 
- Arrow Up/Down: Move selection
- Tab: Enter/exit group

#### Combobox (Autocomplete)
```html
<label for="search">Search</label>
<input type="text" id="search" 
       role="combobox"
       aria-expanded="false"
       aria-autocomplete="list"
       aria-controls="suggestions">
<ul id="suggestions" role="listbox" hidden>
  <li role="option" id="opt1">Option 1</li>
  <li role="option" id="opt2">Option 2</li>
</ul>
```
**Keyboard:**
- Arrow Down: Open list, move to next
- Arrow Up: Move to previous
- Enter: Select current
- Escape: Close list

#### Slider
```html
<label for="volume">Volume</label>
<input type="range" id="volume" 
       min="0" max="100" value="50"
       aria-valuemin="0" 
       aria-valuemax="100" 
       aria-valuenow="50"
       aria-valuetext="50 percent">
```
**Keyboard:**
- Arrow Left/Down: Decrease
- Arrow Right/Up: Increase
- Home/End: Min/max
- Page Up/Down: Large increment

#### Switch (Toggle)
```html
<button role="switch" 
        aria-checked="false"
        aria-label="Dark mode">
  <span aria-hidden="true">Off</span>
</button>
```
**Keyboard:** Space/Enter to toggle

### Feedback Components

#### Alert
```html
<div role="alert" aria-live="assertive">
  Error: Please fix the form.
</div>
```
- role="alert" auto-announces
- Use for important, time-sensitive info

#### Dialog (Modal)
```html
<div role="dialog" 
     aria-modal="true" 
     aria-labelledby="dialog-title"
     aria-describedby="dialog-desc">
  <h2 id="dialog-title">Confirm action</h2>
  <p id="dialog-desc">Are you sure?</p>
  <button>Cancel</button>
  <button>Confirm</button>
</div>
```
**Keyboard:**
- Tab: Cycle focus within dialog
- Escape: Close dialog
- Focus trap required

#### Tooltip
```html
<button aria-describedby="tip1">Help</button>
<div role="tooltip" id="tip1">More information here</div>
```
- Shows on focus and hover
- Escape to dismiss

### Disclosure Components

#### Accordion
```html
<div class="accordion">
  <h3>
    <button aria-expanded="false" aria-controls="sect1">
      Section 1
    </button>
  </h3>
  <div id="sect1" hidden>Content 1</div>
  
  <h3>
    <button aria-expanded="true" aria-controls="sect2">
      Section 2
    </button>
  </h3>
  <div id="sect2">Content 2</div>
</div>
```
**Keyboard:**
- Enter/Space: Toggle section
- Optional: Arrow keys between headers

#### Disclosure (Show/Hide)
```html
<button aria-expanded="false" aria-controls="content">
  Show more
</button>
<div id="content" hidden>
  Hidden content revealed on click
</div>
```

### Data Components

#### Table
```html
<table>
  <caption>Data table description</caption>
  <thead>
    <tr>
      <th scope="col">Header 1</th>
      <th scope="col">Header 2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Row header</th>
      <td>Data</td>
    </tr>
  </tbody>
</table>
```
- Use scope="col" and scope="row"
- caption for table description

#### Listbox
```html
<label id="lb-label">Choose item</label>
<ul role="listbox" aria-labelledby="lb-label" tabindex="0">
  <li role="option" aria-selected="true">Item 1</li>
  <li role="option" aria-selected="false">Item 2</li>
</ul>
```
**Keyboard:**
- Arrow Up/Down: Move selection
- Home/End: First/last
- Type characters: Jump to matching

#### Tree View
```html
<ul role="tree" aria-label="File browser">
  <li role="treeitem" aria-expanded="true">
    Folder
    <ul role="group">
      <li role="treeitem">File 1</li>
      <li role="treeitem">File 2</li>
    </ul>
  </li>
</ul>
```
**Keyboard:**
- Arrow Right: Expand/enter child
- Arrow Left: Collapse/parent
- Arrow Up/Down: Previous/next

---

## KEYBOARD NAVIGATION PATTERNS

### Focus Management
```javascript
// Save and restore focus
const previousFocus = document.activeElement;
openModal();
// On close:
previousFocus.focus();

// Focus trap for modals
function trapFocus(element) {
  const focusable = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  
  element.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}
```

### Common Keyboard Shortcuts
| Key | Action |
|-----|--------|
| Tab | Next focusable |
| Shift+Tab | Previous focusable |
| Enter | Activate button/link |
| Space | Activate button, toggle checkbox/switch |
| Escape | Close modal/popover/dropdown |
| Arrow keys | Navigate within component |
| Home/End | First/last item |

---

## FOCUS INDICATOR

```css
/* Visible focus ring */
:focus-visible {
  outline: 2px solid var(--c-primary);
  outline-offset: 2px;
}

/* Remove default for mouse users */
:focus:not(:focus-visible) {
  outline: none;
}
```

---

## TESTING CHECKLIST

```
□ All interactive elements keyboard accessible
□ Focus order logical (DOM order)
□ Focus visible on all focusable elements
□ No keyboard traps (except modals)
□ Skip link to main content
□ All images have alt text
□ Color contrast ≥ 4.5:1 text, ≥ 3:1 UI
□ Page works at 200% zoom
□ No horizontal scroll at 320px
□ Form inputs have visible labels
□ Error messages associated with inputs
□ Page title describes content
□ lang attribute on html element
□ Headings in logical order (no skipping)
□ Works with screen reader (VoiceOver/NVDA)
```

---

## REFERENCES

- WAI-ARIA APG: https://www.w3.org/WAI/ARIA/apg/
- WCAG 2.2: https://www.w3.org/WAI/WCAG22/quickref/
- A11y Project Checklist: https://www.a11yproject.com/checklist/
- Inclusive Components: https://inclusive-components.design/
