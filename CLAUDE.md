# ily-pages — Claude Instructions

> **`ily-pages` — one domain in Thomas's `~/repos` workspace.**
> **Owns:** iloveyouth public GitHub Pages previews — brand/logo previews, design directions, concept site.
> Master cross-repo rules & area map: `~/repos/CLAUDE.md` (source: `systems/repos-CLAUDE.md`). Keep out-of-scope work in its home repo.
> **Sync:** `syncpull` at session start · `syncpush` after edits (`dbpush`/`ilypush` brand-scoped, `dbs` status) — see `~/repos/SYNC-GUIDE.md`.
> **Cowork:** Claude edits files (they sync to disk) but does **NOT** run git — not even read-only; any git command in the Cowork mount strands `.git/index.lock` (fix: `rm -f .git/index.lock`). Thomas runs the sync commands.

Public GitHub Pages previews for iloveyouth. Push to `main` → live at
`https://duttonbrown.github.io/ily-pages/...` in ~60s (no build step).

## The shared brand layer

Every page links three shared stylesheets from `brand/`, in this order, so one
edit propagates to every page on the next push. All three are **downstream
mirrors** of the private `ily-brand` repo (canonical files:
`ily-brand/tokens.css` / `base.css` / `components.css`).

| Order | File | Owns |
|---|---|---|
| 1 | `brand/tokens.css` | Colors, fonts (incl. `--ily-font-mono`), spacing, sizes, radii (locked from v5 2026-07-03), measure, motion |
| 2 | `brand/base.css` | Element defaults, heading type scale, measure cap, tables, `code`/`pre` — incl. the legibility rules (body weight 400, Light 300 only at 30px+; rules live in `ily-brand/base.css`) |
| 3 | `brand/components.css` | `.ily-link`, `.ily-logo` (+`--on-light`/`--on-dark`), `.eyebrow`, `.lede`, `.fine`/`.meta`/`.stamp`, `.callout`, `.chip`, `.card`, `.kv`, `.table-scroll`, `.num` |

## Locked rules

1. **Never edit the local `brand/` copies of the shared files** — canonical edits happen in `ily-brand` first, then copy here, then push both.
2. **Every new page links all three shared files, in the order above**, before the page's own `<style>` — start from [`_template.html`](./_template.html) and adjust the `brand/` path prefix for folder depth.
3. **A page's inline `<style>` is page-specific LAYOUT only** — never redefine `body{}`, `h1`–`h6`, `a{}`, or brand colors there (the inline block loads after the shared files and silently overrides them).
4. **Always use `var(--ily-*)` for brand values** — never hardcode hex or raw font-weights; a literal can't track a token change.

Links: use `class="ily-link"` or the base `a` rule — dark text, Frosted Blue in
the **underline only**, never accent-colored text (fails contrast).

## Logo on a background

- Every ily-pages surface is **fixed Ghost White** — it never follows the OS theme. Use the **dark** wordmark, chosen explicitly: `class="ily-logo ily-logo--on-light"`.
- **Favicon:** ship the dark `favicon.svg` only — no `prefers-color-scheme` `<link>`.
- **NEVER** `<picture>` + `prefers-color-scheme` auto-swap the logo on a fixed surface (see `ily-brand`'s rule; this caused the June 2026 logo-ghost bug in ily-pages).
- White ink + `.ily-logo--on-dark` only on deliberately **dark** sections.
- Auto-swap is only for chrome that genuinely follows the OS theme — which ily-pages never has.
- Full rules: `ily-brand/brand-identity.md` → Logo → "Logo color & background"; helper classes documented in `components.css`.

## Syncing the brand layer from ily-brand

```
cp ily-brand/{tokens,base,components}.css ily-pages/brand/
# then commit + push both repos (independent main branches)
```

Logo preview (`brand/index.html`) and logos sync separately — see [README.md](./README.md).

Scope note: `directions/` (v1–v5) and `brand/weight-preview/` are self-contained explorations that predate the shared layer — leave them unless explicitly asked to migrate them. Known deferred bug in `directions/v2*.html`: README.md → "Known issues".

## Show Your Work

**Show Thomas whatever you make, in the same turn, without being asked.** A file path is not a deliverable — if he has to ask "how do I look at this?", it wasn't delivered.

- Image / screenshot / chart / render → read it back so it renders inline
- Video / audio / several files → build a small local `review.html` that plays them all, then `Start-Process` it
- HTML page / dashboard / prototype → open it in the browser; publish an Artifact if it should be shareable
- Report / analysis → lead with the findings in the response, don't just link the file
- Data / query result → show the actual numbers, formatted

Then open it yourself and confirm it renders. Full rule: `~/repos/CLAUDE.md` → Show Your Work Rule.
