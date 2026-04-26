# iloveyouth — directions

Four brand-direction prototypes for [iloveyouth](https://iloveyouth.com), a premium skincare brand.

Each direction is a complete world — homepage, collection, and product detail page — with the same locked brand system: Satoshi (300/400/500), four colors, the period-as-signature typography, every claim sourced.

## directions

| | direction | feel | live |
|---|---|---|---|
| **v1** | first cut | dark hero, period system applied liberally, animated mesh blobs | [open →](https://duttonbrown.github.io/ily-pages/directions/v1.html) |
| **v2** | the floor | restored restraint, light editorial, real hamburger menu, single hero accent | [open →](https://duttonbrown.github.io/ily-pages/directions/v2.html) |
| **v3** | the campaign | period-as-architecture, hydration-fill wordmark, ingredient names at hero scale | [open →](https://duttonbrown.github.io/ily-pages/directions/v3.html) |
| **v4** | the future | a 2030 thought experiment — citation-as-architecture, constellation hero, recommender, view transitions | [open →](https://duttonbrown.github.io/ily-pages/directions/v4.html) |

Index page: [duttonbrown.github.io/ily-pages/directions](https://duttonbrown.github.io/ily-pages/directions/)

## locked brand rules (held constant across all directions)

- **brand name** — `iloveyouth` (lowercase, one word — never "I Love Youth" in any UI, copy, or code)
- **tagline** — "youth starts with you." (exact casing, period included)
- **typeface** — Satoshi · 300 / 400 / 500 only (no 700, no 900)
- **palette** — Shadow Grey `#2a2220`, Frosted Blue `#ade8f9`, Ghost White `#f0f3fa`, Almond Silk `#ffd5c6`
- **accent rule** — Frosted Blue is the hero accent; Almond Silk is supporting (≈10:1 ratio per surface)
- **voice** — ingredient-forward; every marketing number sourced
- **positioning** — premium skincare, DTC-only, target retail: Sephora

## structure

```
.
├── index.html              # landing page · all 4 directions linked
├── README.md
├── assets/
│   ├── ily-wordmark-dark.svg
│   └── ily-wordmark-white.svg
├── v1.html · v1-about.html · v1-products.html · v1-product.html · v1.css
├── v2.html · v2-collection.html · v2-product.html · v2.css
├── v3.html · v3-collection.html · v3-product.html · v3.css
└── v4.html · v4-collection.html · v4-product.html · v4.css
```

Each direction page has a small switcher pill in the top-right corner so reviewers can flip between v1 → v4 without going back to the index.

## stack

Pure HTML / CSS / JS — no build tools, no framework, no dependencies beyond the Satoshi webfont (loaded from Fontshare). Open any file in a browser and it works.

The brand source of truth lives in a separate repo (`ily-brand`); these prototypes mirror its tokens but don't import them — every value is inlined for portability.
