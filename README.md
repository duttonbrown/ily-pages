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

Every page uses the auto-theming `<picture>` + `prefers-color-scheme` pattern for the wordmark and brandmark, and the matching `<link rel="icon" media="...">` pattern for the favicon. Light theme renders the dark ink, dark theme renders the white ink. Do not break this pattern in new pages.

Full theming spec lives in the private `ily-brand/brand-identity.md` → "Responsive theming — auto-swap by user preference".
