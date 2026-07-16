# ily-pages — Claude Instructions

> **`ily-pages` — one domain in Thomas's `~/repos` workspace.**
> **Owns:** iloveyouth public GitHub Pages previews — brand/logo previews, design directions, concept site.
> Master cross-repo rules & area map: `~/repos/CLAUDE.md` (source: `systems/repos-CLAUDE.md`). Keep out-of-scope work in its home repo.
> **Sync:** `syncpull` at session start · `syncpush` after edits (`dbpush`/`ilypush` brand-scoped, `dbs` status) — see `~/repos/SYNC-GUIDE.md`.
> **Cowork:** Claude edits files (they sync to disk) but does **NOT** run git — the mount corrupts `.git/index`. Thomas runs the sync commands; read-only git inspection is fine.

Public GitHub Pages previews for iloveyouth. Push to `main` → live at
`https://duttonbrown.github.io/ily-pages/...` in ~60s (no build step).

## The shared brand layer — how style changes propagate

Every page links three shared stylesheets from `brand/`, in this order. Change
one of these files and **every page that links it updates on the next push** —
that is the whole point. Do not defeat it (see "Locked rules" below).

| Order | File | Owns | Source of truth |
|---|---|---|---|
| 1 | `brand/tokens.css` | Colors, fonts (incl. `--ily-font-mono`), spacing, sizes, radii (locked from v5 2026-07-03), measure, motion (CSS variables) | `ily-brand/tokens.css` |
| 2 | `brand/base.css` | `body`, heading **type scale** (h1–h2 Light ≥30px, h3 Medium 20px, h4–h6 Medium), `p`/`li`/`dd` measure cap, `a`, full table styling (collapse, left-aligned th, padding, row rules, captions), `code`/`pre`, `hr` (legibility) | `ily-brand/base.css` |
| 3 | `brand/components.css` | `.ily-link`, `.ily-logo`, document components: `.eyebrow`, `.lede`, `.fine`/`.meta`/`.stamp`, `.callout` (+`.blue`/`.warm`), `.chip`, `.card`, `.kv`, `.table-scroll`, `.num` | `ily-brand/components.css` |

All three are **downstream mirrors** of the private `ily-brand` repo. Canonical
edits happen in `ily-brand` first, then copy the file here, then push both.

## Locked rules (break these and pages drift out of sync)

1. **Every new page links all three shared files, in the order above**, before
   the page's own `<style>`. Start from [`_template.html`](./_template.html) —
   it already has them. Adjust the `brand/` path prefix for the page's folder
   depth (`brand/` at root, `../brand/` in `packaging/`, etc.).

2. **A page's inline `<style>` is for page-specific LAYOUT only.** Never
   redefine `body{}`, `h1`–`h6`, `a{}`, or brand colors there. The inline block
   loads *after* the shared files, so a page-local rule silently overrides them
   and breaks propagation. This is the #1 cause of drift — it's how the
   font-weight-300 haze bug and the invisible-link-hover bug both spread.

3. **Always use `var(--ily-*)` for brand values.** Never hardcode hex
   (`#2A2220`) or raw font-weights (`300`/`400`). A literal can't track a token
   change.

## Legibility standard (why body is weight 400, not 300)

- **Body / UI / table / caption text = weight 400** (`--ily-font-regular`).
  `base.css` sets this. Light (300) is for **large display headings only** —
  h1–h2, which base sizes at 30px+ so Light can never render below its
  legibility floor. **h3 is Medium 500 at 20px** (too small for Light; changed
  2026-07-16 — before that, unsized h3s rendered ~18.7px in Light). Body at
  300 reads hazy / must-focus, badly so on non-Retina and fractional-DPI
  displays (e.g. Windows at 125%).
- **No `-webkit-font-smoothing: antialiased` on body.** It thins strokes and,
  with light/regular weight, compounds the haze. Let the OS render at full
  weight. `base.css` omits it deliberately — don't add it back.
- This matches `ily-brand/brand-identity.md` → Typography and the weight
  comments in `tokens.css`.

## Link styling

Use `class="ily-link"` on inline anchors, or rely on the base `a` rule. Both
give the canonical pattern: **dark text, Frosted Blue accent in the underline
only** — never accent-colored text (it fails contrast). Never write
`a:hover { color: var(--ily-accent-hover) }`.

## Logo on a background

The wordmark/brandmark ships in **two inks**: a **dark** (Shadow Grey) file for
light surfaces and a **white** (#FFFFFF) file for dark surfaces. Put the wrong
ink on a surface and the mark disappears — a white mark on a light surface reads
as a faint ghost; a dark mark on a dark surface is invisible.

**ily-pages is ALWAYS Ghost White.** The page surface never follows the OS theme.
So:

- **Use the DARK wordmark, chosen explicitly:**
  ```html
  <img class="ily-logo ily-logo--on-light"
       src="brand/logos/wordmark/Satoshi%20Regular%20-%20400/ily-wordmark-dark-rect-400.svg"
       alt="iloveyouth.">
  ```
- **Favicon: ship the dark `favicon.svg` only** — no `prefers-color-scheme: dark`
  `<link>`.
- **NEVER use `<picture>` + `prefers-color-scheme` to swap the logo here.** That
  pattern serves the *white* mark when the visitor's OS is in dark mode — but the
  page stays Ghost White, so the logo vanishes. **This was a real bug** (June 2026):
  the homepage wordmark went faint/ghosted for anyone browsing in OS dark mode.
  Auto-swap is only correct for chrome that *actually* changes color with the OS,
  which ily-pages never does.

**The rule, generalized:** if the surface color is fixed (you chose it — which is
every ily-pages page, and every brand-colored section), choose the ink to match
the surface. Reserve `<picture>` auto-swap for genuinely OS-theme-following chrome.
On a deliberately **dark** section, use the white file with `ily-logo--on-dark`.
The helper classes (`.ily-logo`, `.ily-logo--on-light`, `.ily-logo--on-dark`) live
in `components.css` and document the intended surface so a wrong file/surface
pairing is catchable in review. This mirrors `ily-brand/brand-identity.md` → Logo
→ "Logo color & background".

## Syncing the brand layer from ily-brand

When `ily-brand` updates any shared file, mirror it here in the same session:

```
cp ily-brand/tokens.css      ily-pages/brand/tokens.css
cp ily-brand/base.css        ily-pages/brand/base.css
cp ily-brand/components.css  ily-pages/brand/components.css
```

Then commit + push both repos (independent `main` branches). The logo preview
(`brand/index.html`) and logos sync separately — see [README.md](./README.md).

## Asset / theming conventions

Logo ink and favicon rules live in "Logo on a background" above — explicit
dark ink, dark-only favicon, **never** `<picture>` + `prefers-color-scheme`
auto-swap on this always-Ghost-White surface. (An earlier version of this
section mandated the auto-swap pattern; that contradicted the June 2026
logo-ghost fix and was corrected 2026-07-16.)

## Scope note

`directions/v1–v5` and `brand/weight-preview/` are self-contained design
explorations that predate the shared layer — they inline everything and are not
wired. Leave them unless explicitly asked to migrate them.

> **Known bug, deferred:** `directions/v2*.html` use the white wordmark as the
> `<picture>` *default* (`src="assets/ily-wordmark-white.svg"`), so the mark is
> faint/invisible on their light surface in *both* themes — a worse version of
> the logo-on-background bug fixed elsewhere. They use a separate `assets/` logo
> path, not the shared `brand/` layer, so they were left untouched per the scope
> rule above. Fix them if/when these explorations are revived or migrated.
