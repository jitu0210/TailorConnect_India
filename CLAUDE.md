# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TailorConnect India is a **location-based marketplace** where local tailors open digital storefronts and customers find trusted needlework nearby. Tagline: *"Bespoke, nearby."* The platform's primary contact channel is **WhatsApp** — CTAs connect customers directly to tailors via WhatsApp, not an in-app chat.

Reference documents in the root:
- `Product Requirements Document (PRD) TailorConnect India.pdf`
- `Technical Requirements Document (TRD).pdf`
- `TailorConnect Design System - Standalone.html` — open in browser (12 sections: Identity → Responsive → Guidelines)
- `TailorConnect Brand Guidelines (1).html` — open in browser (Brand Book v1.0)

## Repository Structure

Monorepo:
- `Client/` — frontend (not yet initialized)
- `Server/` — Node.js backend (initialized, no source files yet)

## Server

**Stack:** Node.js · Express 5 · Mongoose (MongoDB)

```bash
cd Server && npm install

# Run (once Server/index.js exists):
node index.js
npx nodemon index.js   # with auto-restart
```

Entry point is `Server/index.js`. MongoDB connection string via `process.env.MONGODB_URI` in a `.env` file (gitignored).

**Express 5 note:** Route handlers must handle rejected promises explicitly (`async/await` + error middleware). Several Express 4 APIs changed.

## Design System & Brand

The entire UI is **monochromatic — ink on paper, no accent colors.** All color, spacing, and type decisions flow from a single CSS file (`styles.css`) that exports the tokens below.

### Color tokens

| Token | Value | Role |
|---|---|---|
| `--ink-900` | `#111111` | Primary text, solid actions, the mark |
| `--ink-800` | `#1d1d1d` | Default body text |
| `--ink-700` | `#2b2b2b` | Secondary text |
| `--ink-600` | `#4a4a4a` | Muted text, italic copy |
| `--ink-500` | `#6e6e6e` | Labels, eyebrows, captions |
| `--ink-400` | `#9a9a9a` | Disabled, placeholders |
| `--ink-300` | `#c4c4c4` | Dividers |
| `--ink-200` | `#dcd9d2` | Border default |
| `--ink-100` | `#eceae3` | Border subtle, muted backgrounds |
| `--paper-50` | `#faf9f5` | Default page background |
| `--paper-0` | `#ffffff` | Card surface |
| `--paper-100` | `#f4f2ea` | Inset / sunken areas |
| `--paper-200` | `#ece9df` | Pressed state |

Semantic aliases: `--fg-primary`, `--fg-secondary`, `--fg-muted`, `--fg-disabled`, `--fg-inverse`, `--bg-canvas`, `--bg-surface`, `--bg-raised`, `--bg-sunken`, `--border-default`, `--border-strong`, `--border-subtle`.

### Typography — three faces

| Token | Family | Role |
|---|---|---|
| `--font-serif-d` | `'Cormorant Garamond', Georgia, serif` | Display: headlines, hero text, shop names |
| `--font-serif-t` | `'EB Garamond', Georgia, serif` | Body: descriptions, reviews, running text |
| `--font-sans` | `'Archivo', 'Helvetica Neue', Arial, sans-serif` | UI: labels, buttons, badges, nav, inputs |

Both Google Fonts are loaded via `<link rel="preconnect">` + `@font-face`.

### Spacing (4 px base)

`--space-1: 4px` · `--space-2: 8px` · `--space-3: 12px` · `--space-4: 16px` · `--space-5: 24px` · `--space-6: 32px` · `--space-7: 48px` · `--space-8: 64px` · `--space-9: 96px` · `--space-10: 128px`

### Other tokens

- **Radius:** `--radius-sm: 2px` · `--radius-md: 3px` (cards, buttons, inputs) · `--radius-pill: 9999px`
- **Shadows:** `--shadow-xs` · `--shadow-sm` · `--shadow-md: 0 4px 14px rgba(17,17,17,.08)` (card hover lift) · `--shadow-lg`
- **Motion:** `--dur-fast: 120ms` · `--dur-base: 200ms` · `--dur-slow: 360ms` · `--ease-out: cubic-bezier(0.16,1,0.3,1)` · `--ease-std: cubic-bezier(0.4,0,0.2,1)`
- **Signature divider:** `--cut: 1.5px dashed var(--ink-900)` — the brand's cut-line motif (limit to 1–2 per view)

### Logo

The mark is a black geometric glyph: open triangular blades radiating from a focal point (scissors/craft, precision) plus a dashed line extending right (the tailor's "cut here" stitch line). Monochrome only. Scales from favicon to shopfront board.

Wordmark: `TailorConnect` in `--font-serif-d` (Cormorant Garamond, weight 600) · `India` subtitle in `--font-sans` uppercase, wide letter-spacing, `--ink-500`.

### Components (React kit)

The design system defines these components (CSS classes prefixed `tc-`):

- **Button** (`tc-btn`) — solid / outline / ghost variants; sm / base / lg sizes
- **Badge** (`tc-badge`) — solid / outline / ghost / muted
- **Tag** (`tc-tag`) — supports bilingual label (English + Hindi subline via `.tc-tag__hi`)
- **Input** (`tc-input`) + Label + Hint; **Select** (`tc-select`)
- **Avatar** (`tc-avatar`) — sm / base / lg
- **Toggle** (`tc-toggle`)
- **Alert** (`tc-alert`) — warning variant
- **SearchBar** (`tc-searchbar`) — split field: keyword search + location, separated by `--cut`
- **TailorCard** (`tc-tailor-card`) — the primary listing card: cover image, badges (Verified / Top Rated / Open Now), distance (km), shop name, meta, specialty text, star rating, WhatsApp + View Shop actions

### Voice & tone

Warm, plain-spoken, trustworthy. Never hypey. Address customers as **"you"**; keep tailors in the third person. No exclamation-mark marketing. Hero copy: *"Find a trusted tailor near you."*

UI supports bilingual text (English + Hindi) in tags and labels where relevant.
