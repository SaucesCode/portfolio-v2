# DESIGN SYSTEM SPECIFICATION V2
## "DE MESA — Digital Craft & Bespoke Web Systems"

**Document Status:** Complete & Awaiting Phase 2E Approval Gate  
**Version:** 2.0 (Phase 2E Upgrade)  
**Author:** Principal Creative Director, Design Systems Architect & Accessibility Specialist  
**Brand Identity:** James Patrick De Mesa (`SaucesCode`)  
**Scope Boundary:** Design System Tokens, Typography, Layout Geometry, and Visual Language (No Code Initialized)

---

## 1. Visual Philosophy: The Rhythmic Editorial Atelier

Phase 2E upgrades Direction A ("DE MESA — Digital Craft") from a traditional static editorial layout into a **dynamic, rhythmic digital craft experience**. 

### 1.1 The Core Strategic Challenge & Solution
- **The Challenge:** Monochromatic light websites often feel flat, visually repetitive, and biased toward fashion or boutique agencies, underrepresenting technical engineering depth. Conversely, dark tech portfolios often look like generic AI-generated developer consoles.
- **The V2 Solution — Rhythmic Dynamic Contrast:**  
  We introduce a **deliberate alternating cadence** between warm unbleached linen paper sections and deep obsidian architectural engineering bays:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   THE V2 RHYTHMIC BREATHING ARCHITECTURE                         │
├──────────────────────────────────────────────────────────────────────────────────┤
│ SECTION 1: HERO & VALUE PROPOSITION                                             │
│ Canvas: Warm Unbleached Linen (#fbf9f5) | Text: Charcoal (#161614)               │
│ Atmosphere: Editorial warmth, literary poise, 5-second client clarity.           │
├──────────────────────────────────────────────────────────────────────────────────┤
│ SECTION 2: FLAGSHIP SHOWCASE ("FINISHED PRODUCT ↔ BEHIND THE BUILD")            │
│ Canvas: Deep Obsidian Slate (#0d0f14) | Accent: Terracotta & Gold               │
│ Atmosphere: Engineering bay, syntax-highlighted tokens, technical authority.     │
├──────────────────────────────────────────────────────────────────────────────────┤
│ SECTION 3: WORDPRESS & E-COMMERCE COLLECTION GALLERY                             │
│ Canvas: Warm Linen Paper (#fbf9f5) | Accent: Terracotta (#b84218)                │
│ Atmosphere: Tactile lookbooks, live client storefronts, responsive layout cards. │
├──────────────────────────────────────────────────────────────────────────────────┤
│ SECTION 4: FULL-STACK BUSINESS SYSTEMS & DATABASE BLUEPRINTS                     │
│ Canvas: Dark Graphite Slate (#11141c) | Accent: Cobalt & Emerald                 │
│ Atmosphere: Prisma schemas, JWT security models, operational reliability.        │
├──────────────────────────────────────────────────────────────────────────────────┤
│ SECTION 5: COLLABORATION PROCESS & DISCOVERY CONVERSION FOOTPRINT                │
│ Canvas: Warm Linen Paper (#fbf9f5) | Text: Charcoal (#161614)                   │
│ Atmosphere: Low-pressure consultation booking, clear timeline, direct contact.   │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Visual Identity & Brand Signature

### 2.1 The Architectural Monogram Stamp (`JM / 01`)
The portfolio introduces an authentic, recognizable mark:
- A minimalist $44 \times 44\text{px}$ geometric stamp rendered in deep carbon charcoal (`#161614`) with crisp off-white serif typography (`JM`) set in `Newsreader`.
- Paired with an architectural design registration mark (`REF: DIGITAL CRAFT V2`) and an availability capsule: `● OPEN TO CONTRACT & FULL-STACK ROLES` (availability status subject to owner confirmation).

### 2.2 Commercial Balance (Beyond Pure Luxury Fashion)
To ensure prospective clients seeking enterprise platforms and operational tools understand James's capabilities immediately, the design strictly balances three commercial domains:
1. **Custom WordPress & Full Site Editing (FSE) Themes:** `thread-and-form` (editorial boutique theme) and `kinetix-athletics-theme` (activewear e-commerce storefront).
2. **Full-Stack Web Applications & Bespoke CMS:** `portfolio-cms` (secure admin portal + PostgreSQL) and `Payroll-System` (Django REST enterprise operations).
3. **High-Performance Kinetic Landing Pages:** `valence-capital-landing-page` (bespoke CSS 3D asset transforms and compounding calculators).

---

## 3. Canonical Color Tokens & Contrast Verification

All tokens are defined in perceptual OKLCH color space, mapped to exact canonical hex codes for implementation:

### 3.1 Token Definitions

```css
:root {
  /* ================= WARM PAPER FOUNDATION (DAY / EDITORIAL SECTIONS) ================= */
  --paper-canvas: oklch(0.98 0.008 85);       /* #fbf9f5 - Warm unbleached linen canvas */
  --paper-surface: oklch(0.96 0.012 85);      /* #f2eee7 - Elevated paper cards & pills */
  --paper-border: oklch(0.88 0.015 85);       /* #dfdbd2 - Hairline architectural rules */
  --paper-border-strong: oklch(0.78 0.02 85); /* #c2bcb0 - Active borders & dividers */
  
  --text-charcoal: oklch(0.18 0.005 85);      /* #161614 - Primary high-contrast prose */
  --text-stone: oklch(0.45 0.015 85);         /* #58564e - Secondary explanatory copy */
  --text-muted-paper: oklch(0.56 0.018 85);   /* #747269 - Verified metadata & captions */

  /* ================= OBSIDIAN SLATE FOUNDATION (NIGHT / ENGINEERING SECTIONS) ================= */
  --slate-canvas: oklch(0.12 0.015 260);      /* #0d0f14 - Deep obsidian engineering bay */
  --slate-panel: oklch(0.16 0.02 260);       /* #11141c - Structural card container */
  --slate-elevated: oklch(0.20 0.025 260);    /* #181d2a - Code inspection boxes */
  --slate-border: oklch(0.26 0.025 260);      /* #1f2433 - Hairline inner bezels */
  --slate-border-active: oklch(0.35 0.035 260);/* #283247 - Active code borders */

  --text-chalk: oklch(0.96 0.005 260);       /* #f0f3f8 - Primary off-white heading */
  --text-ash: oklch(0.72 0.03 260);          /* #9da7b8 - Secondary technical prose */
  --text-muted-slate: oklch(0.62 0.035 260);  /* #7d8ca6 - Code comments & metadata */

  /* ================= ACCENT & SIGNAL PALETTE ================= */
  --accent-terracotta: oklch(0.55 0.18 35);   /* #b84218 - Primary craft accent & CTAs */
  --accent-terracotta-hover: oklch(0.48 0.18 35); /* #9a3412 - Tactile button active */
  --signal-champagne: oklch(0.82 0.11 85);    /* #e5c07b - FSE tokens & code highlights */
  --signal-emerald: oklch(0.72 0.17 155);     /* #10b981 - Availability & verified badges */
  --signal-cobalt: oklch(0.65 0.18 250);      /* #3b82f6 - Full-stack systems & links */
  --signal-focus: oklch(0.60 0.20 250);       /* #3b82f6 - WCAG 2.4.11 compliant focus ring */
}
```

### 3.2 WCAG 2.2 AA Contrast Audit Matrix

$$\text{Contrast Ratio} = \frac{L_{\text{lighter}} + 0.05}{L_{\text{darker}} + 0.05}$$

| Context / Surface | Foreground Token | Canonical Hex | Relative Luminance ($L$) | Calculated Ratio | WCAG 2.2 AA Standard | Evaluation Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Paper Canvas (`#fbf9f5`)** | `--text-charcoal` | `#161614` | 0.016 vs 0.952 | **15.2:1** | $\ge 4.5:1$ (Normal Text) | **PASS (AAA)** |
| **Paper Canvas (`#fbf9f5`)** | `--text-stone` | `#58564e` | 0.098 vs 0.952 | **7.11:1** | $\ge 4.5:1$ (Normal Text) | **PASS (AAA)** |
| **Paper Canvas (`#fbf9f5`)** | `--text-muted-paper` | `#747269` | 0.170 vs 0.952 | **4.55:1** | $\ge 4.5:1$ (Normal Text) | **PASS (AA Baseline)** |
| **Paper Canvas (`#fbf9f5`)** | `--accent-terracotta`| `#b84218` | 0.138 vs 0.952 | **5.33:1** | $\ge 4.5:1$ (Normal Text) | **PASS (AA Baseline)** |
| **Slate Canvas (`#0d0f14`)** | `--text-chalk` | `#f0f3f8` | 0.893 vs 0.007 | **16.5:1** | $\ge 4.5:1$ (Normal Text) | **PASS (AAA)** |
| **Slate Canvas (`#0d0f14`)** | `--text-ash` | `#9da7b8` | 0.385 vs 0.007 | **7.63:1** | $\ge 4.5:1$ (Normal Text) | **PASS (AAA)** |
| **Slate Canvas (`#0d0f14`)** | `--text-muted-slate`| `#7d8ca6` | 0.264 vs 0.007 | **5.51:1** | $\ge 4.5:1$ (Normal Text) | **PASS (AA Baseline)** |
| **Slate Canvas (`#0d0f14`)** | `--signal-champagne`| `#e5c07b` | 0.552 vs 0.007 | **10.5:1** | $\ge 4.5:1$ (Normal Text) | **PASS (AAA)** |
| **Slate Canvas (`#0d0f14`)** | `--signal-emerald` | `#10b981` | 0.355 vs 0.007 | **7.10:1** | $\ge 4.5:1$ (Normal Text) | **PASS (AAA)** |
| **Either Canvas** | `--signal-focus` | `#3b82f6` | 0.241 (with 2px offset)| **> 3.0:1** | $\ge 3.0:1$ for Focus Indicators| **PASS (WCAG 2.4.11 AA)**|

---

## 4. Typography Hierarchy & Font Pairing

All fonts are open-source (SIL Open Font License) loaded with zero layout shift via `next/font/google`:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             TYPOGRAPHIC PAIRING V2                               │
├─────────────────────┬─────────────────────┬──────────────────────────────────────┤
│ Font Family         │ Assigned Roles      │ Open-Source License & Loading        │
├─────────────────────┼─────────────────────┼──────────────────────────────────────┤
│ Newsreader          │ Hero headlines,     │ Google Fonts (SIL OFL)               │
│ (Editorial Serif)   │ case-study titles,  │ Loaded via `next/font/google`        │
│                     │ italic accents      │ Optical sizing: `opsz` 6–72          │
├─────────────────────┼─────────────────────┼──────────────────────────────────────┤
│ Geist Sans          │ Subheadings, body,  │ Vercel Open Source (SIL OFL)         │
│ (Modernist Sans)    │ interface labels,   │ High x-height, Swiss clarity,        │
│                     │ buttons, navigation │ native variable weight support       │
├─────────────────────┼─────────────────────┼──────────────────────────────────────┤
│ Geist Mono          │ Code schemas,       │ Vercel Open Source (SIL OFL)         │
│ (Technical Mono)    │ tabular numbers,    │ Tabular figures enabled by default   │
│                     │ metadata tags       │ (`font-variant-numeric: tabular-nums`)│
└─────────────────────┴─────────────────────┴──────────────────────────────────────┘
```

### 4.1 Type Scale
- **Display 1 (Hero Title):** `clamp(2.5rem, 5vw, 4rem)` / Line height `1.15` / `Newsreader` + `Geist Sans`
- **Heading 1 (`h1` Page Titles):** `clamp(2.0rem, 3.5vw, 2.75rem)` / Line height `1.2` / `Newsreader`
- **Heading 2 (`h2` Section Titles):** `clamp(1.5rem, 2.5vw, 2.0rem)` / Line height `1.25` / `Newsreader`
- **Heading 3 (`h3` Card Headers):** `1.25rem` ($20\text{px}$) / Line height `1.3` / `Geist Sans` Bold
- **Body Regular:** `1.0rem` ($16\text{px}$) / Line height `1.6` / `Geist Sans` Regular
- **Body Small:** `0.875rem` ($14\text{px}$) / Line height `1.5` / `Geist Sans` Regular
- **Caption & Code:** `0.75rem`–`0.8125rem` ($12\text{px}$–$13\text{px}$) / Line height `1.4` / `Geist Mono`

---

## 5. Component Primitives Specification

### 5.1 Primary Call-to-Action Button (`Button`)
- **Visuals:** $44\text{px}$ height ($36\text{px}$ compact), fully rounded pill shape (`border-radius: 9999px`).
- **Surface:** Terracotta gradient (`#b84218` $\rightarrow$ `#9a3412`) with crisp white label (`#ffffff`).
- **Micro-Interaction:** Trailing arrow glyph (`→`) translated $+4\text{px}$ horizontally on hover over $120\text{ms}$ (`ease-out`). Tactile press scales to $0.98$ over $80\text{ms}$.
- **Accessibility:** Minimum touch target size $44 \times 44\text{px}$ on mobile. Visible $2\text{px}$ solid focus ring (`#3b82f6`) with $2\text{px}$ offset when focused via keyboard.

### 5.2 The 3-Pillar Client Service Selector (`ServiceSelector`)
- **Role:** Guarantees 5-second client comprehension directly in the hero.
- **Pillars:**
  1. *Full-Stack Web Systems* (Cobalt indicator)
  2. *Custom WordPress & FSE Themes* (Terracotta indicator)
  3. *E-Commerce & Landing Pages* (Emerald indicator)
- **Geometry:** Horizontal trio on desktop ($\ge 1024\text{px}$); stacked vertically on mobile (< $768\text{px}$).
- **Interaction:** Tapping a pillar filters the project showcase below without triggering full page reloads.

### 5.3 Labeled Mobile Tab Switcher (`MobileTabSwitcher`)
- **Role:** Replaces desktop draggable curtain on mobile screens to prevent gesture collisions with vertical scrolling.
- **Geometry:** $32\text{px}$ pill bar containing two equal-width segments: `[● Finished Product] [Behind the Build]`.
- **Accessibility:** Rendered as accessible ARIA tablist (`role="tablist"` with `aria-selected="true"`).

---

## 6. Layout Spacing & Grid System

- **Desktop Max-Width:** $1440\text{px}$ with $80\text{px}$ outer gutters.
- **Laptop Max-Width:** $1200\text{px}$ with $48\text{px}$ outer gutters.
- **Tablet Grid:** 8-column grid with $32\text{px}$ gutters.
- **Mobile Grid:** 4-column grid with $16\text{px}$ gutters. Minimum interactive element spacing: $8\text{px}$.
