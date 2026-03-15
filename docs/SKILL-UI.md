---
name: ui-components
description: Design and implement UI components following atomic design principles and design system patterns. Use this skill when creating forms, navigation, feedback, or any interface elements. Covers 60 components with tokenization and accessibility requirements.
---

# UI Components Skill

Reference: https://component.gallery/

## ATOMIC DESIGN LEVELS

### Atoms
Smallest building blocks — cannot be broken down further
- Button, Link, Icon, Input, Label, Badge, Avatar, Separator

### Molecules
Groups of atoms functioning together
- Form field (label + input + error), Search (input + button), Card header

### Organisms
Complex components made of molecules and atoms
- Header, Footer, Card, Form, Navigation, Modal, Table

### Templates
Page-level layouts
- Dashboard layout, Form page, List page, Detail page

### Pages
Specific instances of templates with real content

---

## COMPONENT CATALOG (60 Components)

### NAVIGATION
| Component | Aliases | Description |
|-----------|---------|-------------|
| Breadcrumb | Breadcrumb trail | Location in hierarchy |
| Navigation | Nav, Menu | Container for nav links |
| Pagination | — | Navigate between pages |
| Skip link | — | Keyboard skip to content |
| Tabs | Tabbed interface | Panel navigation |
| Tree view | — | Nested hierarchical display |

### INPUTS
| Component | Aliases | Description |
|-----------|---------|-------------|
| Button | — | Trigger actions |
| Button group | Toolbar | Related buttons wrapper |
| Checkbox | — | Binary or multiple selection |
| Color input | — | Choose a color |
| Combobox | Autocomplete, Autosuggest | Select with text filter |
| Date input | — | Day/month/year fields |
| Date picker | Calendar | Visual date selection |
| File input | Upload, Dropzone | Upload files |
| Radio button | Radio group | Single selection from list |
| Rich text editor | RTE, WYSIWYG | Formatted text editing |
| Search input | Search | Find content |
| Segmented control | Toggle button group | Switch between options |
| Select | Dropdown | Choose from list |
| Slider | Range input | Value within range |
| Spin button | Nudger, Counter | +/- numeric value |
| Switch | Toggle | On/off binary |
| Text input | — | Single line text |
| Textarea | Textbox | Multi-line text |

### FEEDBACK
| Component | Aliases | Description |
|-----------|---------|-------------|
| Alert | Notification, Banner | Inform user prominently |
| Empty state | — | No data message |
| Progress bar | Progress | Task completion status |
| Progress steps | Stepper, Timeline | Discrete step progress |
| Skeleton | Skeleton loader | Loading placeholder |
| Spinner | Loader | Background process indicator |
| Toast | Snackbar | Temporary notification |
| Tooltip | Toggletip | Hover description |

### LAYOUT
| Component | Aliases | Description |
|-----------|---------|-------------|
| Accordion | Collapse, Disclosure | Expandable sections |
| Card | Tile | Content container |
| Carousel | Content slider | Multiple slides |
| Drawer | Tray, Flyout, Sheet | Slide-out panel |
| Form | — | Input controls group |
| Fieldset | — | Related fields group |
| Header | — | Top page element |
| Footer | — | Bottom page element |
| Hero | Jumbotron, Banner | Large banner |
| Modal | Dialog, Popup | Overlay content |
| Popover | — | Click-triggered popup |
| Spacer | — | Consistent margins |

### CONTENT
| Component | Aliases | Description |
|-----------|---------|-------------|
| Avatar | — | User representation |
| Badge | Tag, Label, Chip | Status/metadata label |
| Dropdown menu | Select menu | Hidden action menu |
| File | Attachment, Download | File representation |
| Heading | — | Section titles |
| Icon | — | Graphic symbol |
| Image | Picture | Embedded images |
| Label | Form label | Input text label |
| Link | Anchor, Hyperlink | Reference to resource |
| List | — | Grouped items |
| Quote | Pull quote, Block quote | Quotation display |
| Rating | — | Star rating |
| Separator | Divider, HR | Element separator |
| Table | Data table | Rows and columns |
| Video | Video player | Video content |
| Visually hidden | Screenreader only | A11y invisible text |

---

## DESIGN TOKENS

### Color Tokens
```css
/* Primary palette */
--c-primary: #0B6E4F;      /* Teal - main actions */
--c-primary-hover: #085A40;
--c-primary-active: #064832;

/* Accent */
--c-accent: #D97706;       /* Orange - highlights */

/* Semantic */
--c-success: #22c55e;
--c-warning: #f59e0b;
--c-error: #ef4444;
--c-info: #3b82f6;

/* Neutral */
--c-bg-primary: #ffffff;
--c-bg-secondary: #f8fafc;
--c-bg-tertiary: #f1f5f9;
--c-text-primary: #0f172a;
--c-text-secondary: #64748b;
--c-text-muted: #94a3b8;
--c-border: #e2e8f0;
--c-border-focus: #0B6E4F;
```

### Spacing Tokens
```css
--sp-0: 0;
--sp-1: 4px;    /* xs */
--sp-2: 8px;    /* sm */
--sp-3: 12px;
--sp-4: 16px;   /* md */
--sp-5: 20px;
--sp-6: 24px;   /* lg */
--sp-8: 32px;   /* xl */
--sp-10: 40px;
--sp-12: 48px;  /* 2xl */
--sp-16: 64px;
--sp-20: 80px;
```

### Typography Tokens
```css
/* Font family - system stack, no external fonts */
--font-sans: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;

/* Font sizes */
--fs-xs: 0.75rem;   /* 12px */
--fs-sm: 0.875rem;  /* 14px */
--fs-base: 1rem;    /* 16px */
--fs-lg: 1.125rem;  /* 18px */
--fs-xl: 1.25rem;   /* 20px */
--fs-2xl: 1.5rem;   /* 24px */
--fs-3xl: 1.875rem; /* 30px */
--fs-4xl: 2.25rem;  /* 36px */

/* Font weights */
--fw-normal: 400;
--fw-medium: 500;
--fw-semibold: 600;
--fw-bold: 700;

/* Line heights */
--lh-tight: 1.25;
--lh-normal: 1.5;
--lh-relaxed: 1.75;
```

### Border Radius Tokens
```css
--radius-none: 0;
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;
```

### Shadow Tokens
```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

### Z-Index Tokens
```css
--z-base: 0;
--z-dropdown: 1000;
--z-sticky: 1100;
--z-fixed: 1200;
--z-modal-backdrop: 1300;
--z-modal: 1400;
--z-popover: 1500;
--z-tooltip: 1600;
```

### Transition Tokens
```css
--transition-fast: 150ms ease;
--transition-normal: 200ms ease;
--transition-slow: 300ms ease;
```

---

## COMPONENT REQUIREMENTS

### Every Component Must Have
1. **Semantic HTML** - Correct element (button not div)
2. **ARIA attributes** - role, label, describedby
3. **Keyboard support** - Tab, Enter, Escape, Arrow keys
4. **Focus indicator** - Visible focus ring
5. **Responsive** - Works on all viewports
6. **Theme support** - Light/dark mode
7. **i18n ready** - RTL support, translatable text

### Size Variants
```
xs:   height 24px, font 12px, padding 4px 8px
sm:   height 32px, font 14px, padding 6px 12px
md:   height 40px, font 16px, padding 8px 16px (default)
lg:   height 48px, font 18px, padding 10px 20px
xl:   height 56px, font 20px, padding 12px 24px
```

### Touch Targets
- Minimum 44x44px (WCAG 2.5.5)
- 48x48px recommended for mobile

---

## ICONS (Feather Style)

Use Feather icons or similar:
- Stroke-based (not filled)
- 24x24 viewBox default
- 2px stroke width
- Round linecap and linejoin
- No emojis ever

```html
<svg class="icon" width="24" height="24" viewBox="0 0 24 24" 
     fill="none" stroke="currentColor" stroke-width="2" 
     stroke-linecap="round" stroke-linejoin="round">
  <!-- paths -->
</svg>
```

---

## REFERENCES

- Component Gallery: https://component.gallery/
- Design Systems Gallery: https://component.gallery/design-systems/
- Atomic Design: https://atomicdesign.bradfrost.com/
- Inclusive Components: https://inclusive-components.design/
