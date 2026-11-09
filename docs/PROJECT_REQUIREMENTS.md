# Portfolio Project Requirements Specification

**Document Identifier:** `PRD-PORTFOLIO-2026-PHASE1C`  
**Revision:** 3.0 (Remediated for Next.js 16 Active LTS & Cache Components)  
**Status:** PROPOSED (Awaiting User Phase 1 Approval Gate)  
**Author:** Principal Software Architect, ISO-Aligned Quality Engineer & UI/UX Strategist  
**Target Repository:** `SaucesCode/new-portfolio`  
**Standards Alignment:** ISO/IEC 25010:2023, ISO/IEC 27001:2022 (Principles), WCAG 2.2 Level AA / ISO/IEC 40500:2025

---

## 1. Executive Summary & Vision

The objective of this project is to architect and build an exceptionally modern, unique, interactive, and high-performance software engineering portfolio for **James Patrick De Mesa (`SaucesCode`)**.

### Confirmed Strategic Core Ambition `[CONFIRMED]`
The portfolio must be an authoritative, professionally art-directed engineering showcase that tangibly demonstrates deep software engineering competence across desktop systems, browser extensions, mobile AI platforms, and enterprise full-stack systems.

**Zero Tolerance for AI Slop `[CONFIRMED]`:**  
The portfolio must deliberately reject generic AI-generated templates (such as repetitive glassmorphic cards without utility, gratuitous gradients, and unverified boilerplate claims). Every section, interaction, and technical case study must reflect intentional design engineering, accessibility, and architectural depth.

---

## 2. Requirements Classification Framework

To ensure architectural integrity, every requirement is categorized strictly according to its decision authority:

| Classification | Definition | Mutability & Decision Authority |
| :--- | :--- | :--- |
| **`[CONFIRMED]`** | High-level project mandate, platform boundary, or confirmed constraint established by the project owner. | Baseline project commitment. |
| **`[PROPOSED]`** | Architectural, structural, or candidate recommendation formulated during Phase 1 planning. | Subject to review and requires explicit user approval before execution. |
| **`[UNRESOLVED]`** | Open content decision, employment claim, or visual direction requiring explicit user confirmation. | Must be decided during or prior to the corresponding phase (e.g., visual direction in Phase 2). |

---

## 3. Target Audiences & User Personas

| Persona | Primary Goal | Critical Pain Point in Generic Portfolios | Portfolio Design Response |
| :--- | :--- | :--- | :--- |
| **Senior Engineering Leader / Staff+ Architect** | Evaluate technical depth, system design competence, code craftsmanship, and architectural maturity. | Flashy animations hiding shallow "CRUD" apps with zero documentation, weak architecture, or unverified claims. | Exhaustive case studies detailing problem statements, architecture diagrams, trade-off evaluations, error recovery, and verified source code links. |
| **Technical Recruiter / Talent Sourcer** | Quick screening for core competencies, stack match, career trajectory, and verifiable contact avenues. | Cluttered navigation, obscure role definitions, slow loading times, lack of downloadable/scannable credentials. | High-signal Hero section with clear identity, categorized skill matrix, scannable experience timeline, and 1-click contact actions. |
| **Startup Founder / Product Client** | Assess delivery velocity, UX/UI aesthetic refinement, business impact, and product intuition. | Bland corporate templates or broken mobile layouts that feel disjointed and uninspired. | Premium art direction, fluid interactions, demonstrated full-lifecycle ownership from design to deployment. |

---

## 4. Functional Requirements

### FR-01: Hero & Identity Layer
- **FR-01.1 `[CONFIRMED]`:** Must prominently present professional identity: **James Patrick De Mesa** (`SaucesCode`), Software Engineer specializing in Full-Stack Web Development, Backend & Systems, and Frontend Design Engineering.
- **FR-01.2 `[CONFIRMED]`:** Must feature a concise, authoritative positioning statement communicating engineering philosophy (craftsmanship, precision, security, and performance).
- **FR-01.3 `[UNRESOLVED]`:** Dynamic status indicator:
  - *Proposal:* Live availability pill (e.g., "Available for Software Engineering Roles").  
  - *Status:* **Unresolved** — The exact text, employment status, and availability messaging must be confirmed by the user before production rendering.
- **FR-01.4 `[PROPOSED]`:** Real-time GitHub telemetry quick-stat badge (e.g., total public repositories count and latest push activity indicator).
- **FR-01.5 `[CONFIRMED]`:** Primary action links:
  - Direct navigation to Featured Projects.
  - Direct contact action (clipboard copy of email address).
  - External verified links to GitHub (`https://github.com/SaucesCode`) and LinkedIn.

### FR-02: Featured Engineering Projects
- **FR-02.1 `[CONFIRMED]`:** Must present an art-directed selection of flagship projects demonstrating breadth and engineering depth across distinct technical disciplines.
- **FR-02.2 `[PROPOSED]`:** The candidate 5-project featured lineup:
  1. `sentinel-organizer` (Desktop Systems, Electron 33, SHA-256 duplicate detection, transactional undo)
  2. `meeting-mode` (Browser Privacy Extension, Manifest V3, live on Microsoft Edge Store)
  3. `siaMeal-Snap` (Mobile AI, React Native/Expo SDK 57, Gemini Vision, Supabase Edge Functions)
  4. `QuickAid-Geomapping` (Enterprise Full-Stack GIS, Django REST Framework, Leaflet.js, PostgreSQL)
  5. `valence-capital-landing-page` (Frontend Design Engineering, 3D card physics, vanilla web technologies)
  - *Status:* **Proposed** — Awaiting user approval to freeze this specific lineup or make substitutions.
- **FR-02.3 `[CONFIRMED]`:** Each featured project entry must display:
  - Project title and architecture summary.
  - Engineering domain tag (Desktop Systems, Security, Mobile AI, Full-Stack GIS, Design Engineering).
  - Primary technology stack tags.
  - Dynamic GitHub telemetry (stars, forks, last push timestamp).
  - Verified deployment/demo badge where supported by evidence (e.g., "Microsoft Edge Store", "Interactive Web Build").
  - Direct links to repository source code and deep-dive case study.

### FR-03: Projects Explorer & Repository Archive
- **FR-03.1 `[CONFIRMED]`:** Must provide an interactive directory of all public repositories retrieved from GitHub.
- **FR-03.2 `[CONFIRMED]`:** Must support instantaneous client-side searching by project name, description, topic, or language without triggering full page reloads.
- **FR-03.3 `[CONFIRMED]`:** Must provide multi-facet filtering:
  - By Primary Domain: Full-Stack, Desktop/Systems, Browser Extensions, Mobile/AI, Design Engineering, WordPress/Themes.
  - By Primary Language: TypeScript, JavaScript, Python, PHP, HTML/CSS.
- **FR-03.4 `[CONFIRMED]`:** Must support client-side sorting by:
  - Most Recently Pushed (`pushed_at`).
  - Star Count (`stargazers_count`).
  - Alphabetical (`name`).
- **FR-03.5 `[PROPOSED]`:** Repository exclusion and archiving policy:
  - Forked repositories (`fork: true`) excluded from the default archive view (toggleable via "Include forks").
  - Archived repositories (`archived: true`) clearly labeled with an "Archived" badge.
- **FR-03.6 `[CONFIRMED]`:** Clear empty state with 1-click filter reset when search criteria yield zero matches.

### FR-04: Deep-Dive Project Case Studies
- **FR-04.1 `[CONFIRMED]`:** Dedicated case study routes (e.g., `/projects/[slug]`) combining curated technical narratives with live GitHub telemetry.
- **FR-04.2 `[CONFIRMED]`:** Standardized case study anatomy:
  1. **Header & Context:** Verified title, role, timeline, source repository link, and live demo link (if verified).
  2. **Problem Statement & Scope:** Motivation and domain challenge.
  3. **System Architecture & Data Flow:** Architectural topology and component diagrams.
  4. **Key Technical Innovations:** Specific algorithms, concurrency models, DOM heuristics, or data pipelines.
  5. **Security, Privacy & Performance:** Concrete hardening and optimization decisions.
  6. **Retrospective & Trade-offs:** Engineering lessons and architectural evaluations.

### FR-05: About & Professional Background
- **FR-05.1 `[CONFIRMED]`:** Narrative detailing professional background, technical values, and approach to software development.
- **FR-05.2 `[UNRESOLVED]`:** Exact bio copy, education milestones, and career trajectory claims must be reviewed and verified by the user before release.
- **FR-05.3 `[CONFIRMED]`:** Geographical base: Philippines (UTC+8 / PHT) with local time display.

### FR-06: Technical Skills & Competency Matrix
- **FR-06.1 `[CONFIRMED]`:** Structured taxonomy of technical skills categorized into clear functional domains:
  - *Languages:* TypeScript, JavaScript (ESNext), Python, SQL, PHP, HTML5/CSS3.
  - *Frontend & Design Engineering:* React 19, Next.js 16 (App Router), Tailwind CSS, NativeWind, Leaflet.js, Recharts, Motion primitives.
  - *Backend, Systems & Desktop:* Node.js, Express, Django REST Framework, Electron, Supabase (Edge Functions / Deno), PostgreSQL, Prisma ORM, RESTful API design.
  - *Browser & Security:* Manifest V3 extensions, DOM traversal/mutation heuristics, CSP hardening, SHA-256 integrity verification, JWT security.
  - *Tooling & DevOps:* Git/GitHub, Docker, Vite, Vercel, npm/pnpm, Postman, Linux/Windows.
- **FR-06.2 `[CONFIRMED]`:** Each skill should cross-reference the projects in the portfolio that substantiate it.

### FR-07: Professional Experience & Milestones
- **FR-07.1 `[CONFIRMED]`:** Chronological career milestone timeline highlighting key projects and open-source releases.
- **FR-07.2 `[UNRESOLVED]`:** Company names, employment dates, and specific organizational metrics must be verified by the user. Strictly zero fabricated employer names or metrics.

### FR-08: Contact & Inquiries
- **FR-08.1 `[CONFIRMED]`:** 1-Click Copy-to-Clipboard action for email address with immediate visual feedback (micro-toast / animated checkmark).
- **FR-08.2 `[CONFIRMED]`:** Verified social links (GitHub profile `SaucesCode`, LinkedIn profile, personal email).
- **FR-08.3 `[PROPOSED]`:** Lightweight contact form powered by a secure server action with honeypot spam protection.

### FR-09: Responsive Shell & Universal Navigation
- **FR-09.1 `[CONFIRMED]`:** Persistent, accessible navigation header with active section tracking (IntersectionObserver-based spy).
- **FR-09.2 `[CONFIRMED]`:** Ergonomic mobile drawer adhering to thumb-zone ergonomics, supporting natural touch gestures and hardware-safe viewports (`dvh`).
- **FR-09.3 `[CONFIRMED]`:** Keyboard accessibility: Full Tab navigation, visible high-contrast focus rings, and Escape key dismissal of overlays/modals.

### FR-10: Dynamic GitHub Data Synchronization
- **FR-10.1 `[CONFIRMED]`:** Server-side synchronization fetching public repository metadata from the GitHub REST API (`api.github.com/users/SaucesCode/repos`).
- **FR-10.2 `[PROPOSED]`:** Next.js 16 Cache Components caching model using `'use cache'` and `cacheLife('hours')` (revalidate: 1 hour, stale: 5 min, expire: 1 day).
- **FR-10.3 `[CONFIRMED]`:** Three-tier non-destructive data resilience:
  1. Fresh GitHub API data (retrieved on successful revalidation).
  2. Last-known-good cached data (preserved by Next.js cache handler if upstream revalidation fails).
  3. Bundled build-time fallback snapshot (`lib/fallback-repos.json`) used solely on initial cold starts if GitHub is unreachable and no cache exists.
  - A failed revalidation must never overwrite valid cached data with older fallback snapshots.
- **FR-10.4 `[PROPOSED]`:** Unauthenticated public-data access preferred initially. If authentication is required, use a fine-grained Personal Access Token with read-only permissions (`Metadata: Read-only`), stored strictly in server-side environment variables.

---

## 5. Optional Features (Phase-Deferred Scope) `[PROPOSED]`

The following features are valuable enhancements but are explicitly proposed for deferral to maintain a clean, rapid delivery of the core portfolio:

1. **Command Palette (`Cmd+K` / `Ctrl+K`)**: Rapid keyboard navigation across projects, skills, and links.
2. **Interactive Terminal Emulator**: Minimal interactive bash-style widget allowing technical visitors to run CLI commands (`whoami`, `cat skills`, `open project`).
3. **Interactive 3D Card / Canvas Physics**: Porting the custom 3D card tilt physics from `valence-capital-landing-page` as an interactive hero ornament.
4. **Blog / Technical Essays Module**: Long-form markdown articles for software engineering essays.
5. **On-Demand Webhook Revalidation (`/api/revalidate`)**: Instant cache invalidation triggered by GitHub webhook events on commit push.

---

## 6. ISO/IEC 25010:2023 Requirements Traceability Matrix (RTM)

The matrix below maps each functional requirement to its governing quality characteristics under the official nine characteristics of ISO/IEC 25010:2023:

| Req ID | Requirement Summary | Classification | Primary Characteristic (ISO 25010:2023) | Sub-Characteristic | Verification Method |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FR-01** | Hero & Identity with telemetry | `[CONFIRMED]` / `[UNRESOLVED]` (Status) | Interaction capability | User interface aesthetics & Inclusivity | Chrome DevTools DOM verification |
| **FR-02** | Featured Projects Lineup | `[PROPOSED]` (Lineup) / `[CONFIRMED]` (Spec) | Functional suitability | Functional completeness | Visual inspection & component snapshots |
| **FR-03** | Searchable & Filterable Archive | `[CONFIRMED]` | Performance efficiency & Interaction capability | Time behavior & Operability | Client search unit test (< 50ms) |
| **FR-04** | Deep-Dive Case Studies | `[CONFIRMED]` | Maintainability | Analyzability & Modularity | MDX compilation & schema validation |
| **FR-05** | About & Professional Values | `[CONFIRMED]` / `[UNRESOLVED]` (Claims) | Functional suitability | Functional correctness | Content verification with user |
| **FR-06** | Technical Skills Matrix | `[CONFIRMED]` | Maintainability | Modularity | Cross-link integrity checks |
| **FR-07** | Experience Timeline | `[CONFIRMED]` / `[UNRESOLVED]` (Claims) | Functional suitability | Functional correctness | Content verification with user |
| **FR-08** | Contact & Social Avenues | `[CONFIRMED]` / `[PROPOSED]` (Form) | Interaction capability & Security | Operability & Confidentiality | Clipboard test & link 200 OK checks |
| **FR-09** | Responsive Navigation Shell | `[CONFIRMED]` | Interaction capability & Flexibility | Inclusivity & Adaptability | Viewport emulation (320px–2560px) & Keyboard audit |
| **FR-10** | Dynamic GitHub Integration | `[CONFIRMED]` / `[PROPOSED]` (Next.js 16 Cache) | Reliability & Security | Fault tolerance & Confidentiality | Simulated 403 test & token hygiene scan |

### Scope Justification for ISO/IEC 25010:2023 Characteristics:
- **Safety:** Non-applicable (N/A). The portfolio is a static informational web application; it controls no physical processes, medical devices, or financial execution systems. No personal or environmental physical hazards exist.
- **Flexibility:** Applicable primarily through the *Adaptability* sub-characteristic (responsive behavior across device viewports, orientation, and input methods).

---

## 7. Acceptance Criteria for Phase 1 Sign-Off

The following criteria govern the completion of Phase 1 requirements planning:

- [x] All functional requirements classified into `[CONFIRMED]`, `[PROPOSED]`, or `[UNRESOLVED]`.
- [x] Framework aligned to Next.js 16 Active LTS with Cache Components.
- [x] ISO/IEC 25010:2023 updated to reflect the nine 2023 characteristics (Interaction capability, Flexibility, Safety scope justification).
- [x] Core Web Vitals structured with Google baseline criteria (LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 at 75th percentile) and separate stretch goals.
- [x] Three-tier non-destructive data resilience and unauthenticated-first GitHub access specified.
- [x] No application code, dependencies, or UI source files created during Phase 1.
- [ ] Explicit user approval obtained on unresolved decisions before initiating Phase 2.
