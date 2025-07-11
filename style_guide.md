# Bar Manager – Design Guide  (Dark Theme “Smoky Speakeasy”)

A concise but complete set of tokens, scales, and component rules for building the UI.

---

## 1. Brand Foundations

| Token | Value | Purpose |
|-------|-------|---------|
| `--brand-name` | **Bar Manager** | Appears in logo & meta |
| `--brand-font-display` | `"Playfair Display", serif` | Headlines / logo word‑mark |
| `--brand-font-sans` | `"Inter", "Helvetica Neue", sans-serif` | UI body text |
| `--brand-radius` | `6 px` (cards) / `9999 px` (pill buttons) | Consistent curvature |
| `--brand-shadow` | `0 4 12px rgba(0,0,0,.40)` | Single elevation token |

---

## 2. Color System

```css
/* Core surfaces */
--bg-primary:       #1A1B1D;
--bg-elevated:      #242526;
--border:           #2C2D30;

/* Text */
--text-primary:     #E6E6E8;
--text-secondary:   #9A9A9F;
--text-disabled:    #5C5C5F;

/* Accents */
--accent:           #FFB248;   /* Amber – main CTA */
--accent-hover:     #FFCA75;
--success:          #27C192;
--danger:           #FF5160;
--highlight:        #725AF0;   /* Links / focus ring */
```

> **Contrast:** All body‑text pairs meet WCAG AA with font ≥ 14 px weight 400. Use amber on ~10 % of the UI to keep the glow special.

---

## 3. Typography Scale

| Role | Font | Size | Line | Weight |
|------|------|------|------|--------|
| Display 1 | Playfair Display | 40 px | 48 px | 600 |
| H1        | Playfair Display | 32 px | 40 px | 600 |
| H2        | Inter            | 24 px | 32 px | 600 |
| H3        | Inter            | 20 px | 28 px | 600 |
| Body 1    | Inter            | 16 px | 24 px | 400 |
| Body 2    | Inter            | 14 px | 20 px | 400 |
| Caption   | Inter            | 12 px | 16 px | 400 |

*Display serif only for page titles; all other text is sans.*

---

## 4. Spacing & Layout

* **4‑pt grid:** 4 px, 8 px, 12 px…  
* **Max width:** 1280 px; gutters 24 px desktop, 16 px mobile.  
* **Columns:** 12‑col ≥ 1024 px, 4‑col tablet, single‑col phone.

### Spacing Tokens

| Token | 4‑pt Steps | Typical Use |
|-------|------------|-------------|
| `--space‑1` | 4 px | Icon padding |
| `--space‑2` | 8 px | Label gap |
| `--space‑3` | 12 px | Field inner |
| `--space‑4` | 16 px | Card padding |
| `--space‑6` | 24 px | Section gap |
| `--space‑8` | 32 px | Page gap |

---

## 5. Components

### 5.1 Buttons

| State | Background | Text | Border |
|-------|------------|------|--------|
| Default | `--accent` | `#000` | none |
| Hover   | `--accent-hover` | `#000` | none |
| Disabled| `--border` | `--text-disabled` | none |

Rounded pill for prominent CTA, radius 6 px for regular.

### 5.2 Inputs

* Height 40 px, 1 px border `--border`, bg `--bg-elevated`.  
* **Focus:** 2 px outline `--highlight`.  
* **Disabled:** bg `#1A1A1A`, text `--text-disabled`.

### 5.3 Cards

```css
.card {
  background: var(--bg-elevated);
  border-radius: var(--brand-radius);
  box-shadow: var(--brand-shadow);
  padding: var(--space-4);
}
```

### 5.4 List Rows

* 1 px bottom divider `--border`.  
* Quantity badge colours: `--success` (stock) or `--danger` (out).

### 5.5 Modal / Drawer

* Overlay `rgba(0,0,0,.60)`; content width min(96 vw, 540 px).

---

## 6. Iconography

* Library: **Lucide** or **Phosphor** → 1.5 px stroke.  
* Size 20 px for buttons, 16 px inline; stroke inherits text colour.

---

## 7. Motion

| Action | Duration | Easing |
|--------|----------|--------|
| Card fade‑in | 160 ms | `ease-out` |
| Drawer slide | 240 ms | `cubic-bezier(.25,.8,.25,1)` |
| Button press | 100 ms | `scale(.97)` |

Respect `prefers-reduced-motion`.

---

## 8. Accessibility Checklist

1. All colour pairs contrast‑checked.  
2. Keyboard focus order = DOM; add ARIA roles for custom widgets.  
3. Reduce motion on user preference.  
4. Colour badges also show icon/label.

---

## 9. Code Snippets

### Tailwind Button

```tsx
<button
  className="inline-flex items-center gap-2 rounded-full
             bg-amber-400 hover:bg-amber-300 disabled:bg-zinc-800
             px-4 py-2 font-semibold text-black transition
             disabled:text-zinc-500">
  <IconPlus size={16} />
  Add Item
</button>
```

### Tailwind Config Extension

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'bg-primary':  '#1A1B1D',
        'bg-elevated': '#242526',
        border:        '#2C2D30',
        accent:        '#FFB248',
        success:       '#27C192',
        danger:        '#FF5160',
        highlight:     '#725AF0',
      },
      borderRadius: {
        brand: '6px',
      },
      boxShadow: {
        brand: '0 4px 12px rgba(0,0,0,.40)',
      },
    },
  },
};
```

---

## 10. File & Naming Conventions

* **Tokens:** `/styles/tokens.scss` or Tailwind `theme.extend`.  
* **Global CSS:** `_base.scss` sets root font‑size and variables.  
* **Components:** one root class per file (`Button.jsx`, `Card.jsx`).  
* **Images:** `/assets/img/recipes/` (640 × 480 webp).

---

## Quick Start Checklist

1. Implement CSS variables (section 2).  
2. Apply typography scale (section 3).  
3. Build Button, Card, Input (sections 4–5).  
4. Prototype Inventory page, iterate.

– **Happy designing & cheers!**
