# “Smoky Speakeasy” — Dark Theme Color Palette

A low‑key, lounge‑style palette with warm amber highlights – perfect for a classic bar ambience.

| Role               | Hex      | Preview | Notes                                             |
|--------------------|----------|---------|---------------------------------------------------|
| **bg‑primary**     | `#0E0E0F` | ▉ | Ultra‑dark charcoal, main background              |
| **bg‑elevated**    | `#1A1B1D` | ▉ | Slightly lighter surface for cards & modals       |
| **border**         | `#2C2D30` | ▉ | Subtle separators / outlines                      |
| **text‑primary**   | `#E6E6E8` | ▉ | Headings & body text                              |
| **text‑muted**     | `#9A9A9F` | ▉ | Secondary labels / disabled states                |
| **accent‑amber**   | `#FFB248` | ▉ | Call‑to‑action buttons, brand highlight           |
| **accent‑emerald** | `#27C192` | ▉ | “Success” / ingredient available                  |
| **accent‑crimson** | `#FF5160` | ▉ | Errors / low‑stock warnings                       |
| **brand‑highlight**| `#725AF0` | ▉ | Optional extra accent (links, focus rings)        |

## Quick CSS Variables

```css
:root {
  --bg-primary:   #0E0E0F;
  --bg-elevated:  #1A1B1D;
  --border:       #2C2D30;
  --text-primary: #E6E6E8;
  --text-muted:   #9A9A9F;
  --accent:       #FFB248; /* amber */
  --success:      #27C192;
  --danger:       #FF5160;
  --highlight:    #725AF0;
}
```

> **Tip:** All color pairs above meet WCAG AA contrast on large text; for small text keep weight ≥ 400 and size ≥ 14 px.
