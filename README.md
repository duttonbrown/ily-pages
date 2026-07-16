# ily-pages

Public previews for the iloveyouth brand — shareable links for collaborators and partners. Hosted via GitHub Pages.

## What's here

| Folder | What it is |
|---|---|
| [`brand/`](./brand/) | Logo preview — the canonical wordmark + brandmark across surfaces, parked colored-period direction, brand-in-use mockups. Mirrored from the private `ily-brand` repo. |
| [`directions/`](./directions/) | Four standalone homepage / product / collection design-direction prototypes (v1–v4). |
| [`concept/`](./concept/) | Single-file homepage site concept styled to the locked brand tokens. |

## What is NOT here

The canonical brand spec, voice doc, locked decisions, and competitive positioning live in the **private** `ily-brand` repo. This repo is **public** — only the visual previews ship here. Anything strategic stays private.

## How to share

The whole site is published at GitHub Pages — share the root URL or any subfolder URL. No login required.

## Editing

- Direct file edits, commit, push. GitHub Pages rebuilds automatically.
- The brand/ folder is a downstream mirror of `ily-brand/`. When `ily-brand` updates the canonical preview, sync the changes here:
  - copy `ily-brand/logo-preview.html` → `ily-pages/brand/index.html`
  - copy any updated `ily-brand/logos/` subfolders → `ily-pages/brand/logos/`
  - copy `ily-brand/tokens.css` → `ily-pages/brand/tokens.css`
  - swap the canonical-spec footer link for the private-repo note
- The directions/ and concept/ folders are self-contained — edit in place.

## Asset conventions

The ily-pages surface is **always Ghost White** — it never follows the OS theme. Every page therefore uses the **dark** wordmark/brandmark ink, chosen explicitly (`.ily-logo .ily-logo--on-light`), and ships the dark favicon only. **Never** use the `<picture>` + `prefers-color-scheme` auto-swap here — it serves the white mark to OS-dark visitors on a light page and the logo vanishes (real bug, June 2026). An earlier version of this section mandated the auto-swap pattern; corrected 2026-07-16.

Full logo-on-background rules: `CLAUDE.md` → "Logo on a background" and the private `ily-brand/brand-identity.md` → Logo.
