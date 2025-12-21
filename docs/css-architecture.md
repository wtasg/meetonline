# CSS Architecture

This document describes the layered CSS architecture used in the MeetOnline React client application.

## Overview

The CSS is organized into three layers, imported in a specific order to ensure proper variable resolution and style cascading.

```
src/styles/
├── primitives/           # Raw design tokens
│   ├── colors.css        # Base color palette
│   ├── spacing.css       # Spacing scale
│   ├── typography.css    # Font definitions
│   └── breakpoints.css   # Max-widths and breakpoints
├── semantics/            # Theme-aware mappings
│   └── themes.css        # Light/dark/high-contrast schemes
├── components/           # UI component styles
│   ├── layout.css        # Reset, container, flex, grid
│   ├── buttons.css       # Button variants
│   ├── forms.css         # Form elements
│   ├── cards.css         # Cards, boxes, list items
│   ├── navigation.css    # Nav, header, footer, dropdown
│   ├── notifications.css # Badges, messages
│   └── settings.css      # Settings modal
└── index.css             # Entry point
```

## Layer 1: Primitives

Raw design tokens that don't change based on theme or scheme.

### Colors (`colors.css`)
```css
--color-gray-50 to --color-gray-950   /* Gray scale */
--color-accent-primary                 /* Primary accent */
--color-success/warning/danger/info    /* State colors */
```

### Spacing (`spacing.css`)
```css
--space-1: 0.25rem   /* 4px */
--space-2: 0.5rem    /* 8px */
--space-3: 1rem      /* 16px */
--space-4: 1.5rem    /* 24px */
--space-5: 2rem      /* 32px */
--space-6: 3rem      /* 48px */
```

### Typography (`typography.css`)
```css
--font-family-sans        /* System UI stack */
--font-family-mono        /* Monospace stack */
--font-size-xs to -4xl    /* Font sizes */
--font-weight-*           /* Font weights */
```

### Breakpoints (`breakpoints.css`)
```css
--bp-sm: 640px     --max-w-xs: 20rem
--bp-md: 768px     --max-w-sm: 24rem
--bp-lg: 1024px    --max-w-md: 28rem
--bp-xl: 1280px    --max-w-lg: 32rem
```

## Layer 2: Semantics

Theme-aware CSS variables that map primitives to semantic meanings.

### Theme System (`themes.css`)

**Themes** (color palette): `gray`, `teal`, `pink`  
**Schemes** (light/dark): `light`, `dark`, `high-contrast`  
**Filters** (color intensity): `default`, `natural`, `vivid`, `muted`

```css
/* Semantic color variables */
--background-primary/secondary/tertiary
--text-primary/secondary/tertiary
--border-primary/secondary
--state-success/warning/danger/info-*
--button-primary/secondary-*
--input-*
```

Applied via HTML attributes:
```html
<html data-theme="teal" data-filter="vivid" class="dark">
```

## Layer 3: Components

Component-specific styles using utility classes.

### Layout Utilities
```css
.container        /* Centered max-width container */
.flex / .vflex    /* Flexbox with gap */
.grid / .vgrid    /* Grid layouts */
.p-1 to .p-5      /* Padding */
.m-1 to .m-4      /* Margin */
.gap-1 to .gap-4  /* Gap sizes */
```

### Button Classes
```css
.btn              /* Base button */
.btn-primary      /* Primary action */
.btn-danger       /* Destructive action */
.btn-small        /* Compact size */
```

### Form Classes
```css
.form-container   /* Form wrapper */
.form-group       /* Field group */
.form-input       /* Input element */
.editable-input   /* Inline edit field */
```

### Card Classes
```css
.card             /* Card container */
.detail-card      /* Detail view card */
.box              /* Generic box */
.list-item        /* List item */
```

## Usage

Single import in App.jsx:
```jsx
import "./styles/index.css";
```

## Theming JavaScript API

```javascript
import { applyTheme, applyScheme, applyFilter } from "./utils/theme";

applyTheme("teal");           // gray | teal | pink
applyScheme("dark");          // light | dark | high-contrast
applyFilter("vivid");         // default | natural | vivid | muted
```

## Design Principles

1. **Mobile-first**: Base styles for mobile, media queries for larger screens
2. **CSS Variables**: All values use CSS custom properties
3. **No inline styles**: All styling via CSS classes
4. **Layered specificity**: Primitives → Semantics → Components
5. **Theme inheritance**: Semantic variables reference base colors
