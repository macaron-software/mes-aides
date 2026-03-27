---
name: ui-components
description: Design + impl UI components using atomic design + design sys patterns.
---

# UI Components Skill

Ref: https://component.gallery/

## ATOMIC DESIGN

| Level | Examples |
|-------|----------|
| Atoms | Button, Link, Icon, Input, Label, Badge, Avatar |
| Molecules | Form field, Search, Card header |
| Organisms | Header, Footer, Card, Form, Nav, Modal, Table |
| Templates | Dashboard, Form page, List page, Detail page |

## COMPONENTS (60)

| Category | Components |
|----------|------------|
| Navigation | Breadcrumb, Nav, Pagination, Skip link, Tabs, Tree view |
| Inputs | Button, Checkbox, Combobox, Date picker, File input, Radio, Select, Slider, Switch, Text input, Textarea |
| Feedback | Alert, Empty state, Progress, Skeleton, Spinner, Toast, Tooltip |
| Layout | Accordion, Card, Carousel, Drawer, Form, Header, Footer, Modal, Popover |
| Content | Avatar, Badge, Dropdown, Icon, Image, Label, Link, List, Table |

## TOKENS

```css
/* Color */
--c-primary: #0B6E4F;   /* teal */
--c-accent: #D97706;     /* orange */
--c-success: #22c55e;
--c-warning: #f59e0b;
--c-error: #ef4444;

/* Font */
--font: system-ui, -apple-system, sans-serif;
--fs-xs: 0.75rem; --fs-sm: 0.875rem; --fs-base: 1rem;
--fs-lg: 1.125rem; --fs-xl: 1.25rem; --fs-2xl: 1.5rem;

/* Spacing */
--sp-1: 4px; --sp-2: 8px; --sp-4: 16px; --sp-6: 24px; --sp-8: 32px;

/* Radius */
--radius-sm: 4px; --radius-md: 8px; --radius-lg: 12px; --radius-full: 9999px;
```

## ICONS (Feather)

- Stroke-based, 24x24 viewBox, 2px stroke, round linecap/join
- NO emojis

## REQS

Every component: semantic HTML, ARIA attrs, keyboard support, focus indicator, responsive, theme support, i18n ready.

Size variants: xs(24px), sm(32px), md(40px), lg(48px), xl(56px).
Touch targets: ≥44x44px (WCAG 2.5.5).
