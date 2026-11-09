# Phase 1: Portfolio Requirements & System Architecture Report

**Document Identifier:** `REPORT-PHASE-1C-FINAL`  
**Revision:** 3.0 (Remediated for Next.js 16 Active LTS & Production Technical Correctness)  
**Date:** 2026-11-09  
**Status:** COMPLETE — AWAITING EXPLICIT USER APPROVAL  
**Reviewer:** User (`SaucesCode`)  
**Prepared by:** Principal Software Architect, Senior Next.js Engineer, Security Engineer & ISO-Aligned Quality Engineer  
**Project Workspace:** `C:\Users\CARE MBA\Desktop\New Systems\new-portfolio`

---

## 1. Executive Summary

Phase 1C provides the finalized architectural blueprint and requirements specification for building an art-directed, high-performance software engineering portfolio for **James Patrick De Mesa (`SaucesCode`)**.

Following independent technical reviews across Phase 1A and 1B, this remediated report delivers final corrections:
1. **Framework Alignment to Next.js 16 Active LTS:** Formally designated Next.js 16 as the target framework in accordance with official Next.js LTS policy (Next.js 16: Active LTS; Next.js 15: Maintenance LTS). Standardized on native **Cache Components** (`use cache`, `cacheLife('hours')`, `cacheTag`) as the single unified caching architecture.
2. **Resolution of GitHub Fallback Contradiction:** Resolved the revalidation error-handling bug by establishing a strict architectural separation between the cached data-fetcher (`fetchFreshGitHubRepos`, which throws on any error to prevent cache corruption) and the top-level repository coordinator (`getRepositories`, which catches initial cold-start failures to serve static fallback snapshots).
3. **Hydration-Safe Production Content Security Policy (CSP):** Evaluated App Router inline script execution (Flight stream, runtime bootstrap, hydration state). Replaced the flawed `script-src 'self'` policy with a practical production CSP that allows required inline hydration scripts while strictly banning `'unsafe-eval'`. Formulated a post-build verification plan using Chrome DevTools MCP.
4. **Correction of GitHub Token Security:** Corrected the misconception that classic `public_repo` is read-only. Established **unauthenticated public-data access as the baseline**, with fine-grained read-only tokens (`Metadata: Read-only`) designated if elevated rate limits are required.
5. **Strict Scope Discipline:** All work remains strictly within Phase 1 documentation boundaries. Zero application code or dependencies were created.

---

## 2. GitHub Repository Inventory & Candidate Analysis

Using the GitHub MCP in read-only mode, an exhaustive repository inventory was performed across all 42 public repositories belonging to `SaucesCode`. 

Repositories are explicitly partitioned into two verification tiers:
- **Deep-Dive Inspected Repositories:** Architectures, configuration manifests, and documentation inspected via README files and repository metadata.
- **Search-Discovered Repositories:** Cataloged via GitHub REST API search query (`user:SaucesCode`).

### 2.1 Deep-Dive Inspected Repositories (Flagship Candidates — Proposed)

| Project & Canonical Repository Link | Primary Stack | Verified Engineering Evidence | Inferred Architectural Depth | Available Demos / Store Proof | Candidate Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **[`sentinel-organizer`](https://github.com/SaucesCode/sentinel-organizer)** | Electron 33, React 18, TypeScript, Tailwind CSS, Vite 5 | Verified via repository README:<br>• Context-isolated IPC bridge (`preload.cjs`).<br>• 2-phase SHA-256 duplicate detection.<br>• Transactional undo ledger.<br>• Real-time folder watching.<br>• 100% offline, strict CSP, NTFS junction/traversal protection. | Advanced systems programming, desktop IPC security, cryptographic file hashing, and defensive file operations. | Packaged Windows executable build targets (`electron-builder`). | **Proposed Featured Candidate (Desktop Systems)** |
| **[`meeting-mode`](https://github.com/SaucesCode/meeting-mode)** | JavaScript, CSS, HTML, Manifest V3 | Verified via repository README & Store listing:<br>• Zero-click privacy shield for screen sharing.<br>• DOM heuristics masking financials, PII, and API keys.<br>• CSP-exempt CSS injection.<br>• Emergency blackout curtain (<kbd>Alt+Shift+B</kbd>).<br>• 100% local execution, zero analytics. | Advanced DOM traversal, mutation observation, browser extension lifecycle management, and privacy engineering. | **Verified Live Production Extension on [Microsoft Edge Add-ons Store](https://microsoftedge.microsoft.com/addons/detail/meetingmode-screen-shar/pnfahfnonohbgnbgdalegoicoldkbkno)**. | **Proposed Featured Candidate (Browser Security)** |
| **[`siaMeal-Snap`](https://github.com/SaucesCode/siaMeal-Snap)** | React Native (Expo SDK 57), Supabase, TypeScript, NativeWind | Verified via repository README:<br>• On-device camera capture with client-side image downscaling (512px).<br>• Supabase Edge Functions (Deno) routing to Google Gemini (`gemini-2.5-flash`) & OpenAI.<br>• SVG macro rings, 14-day Bezier trend curves, and Mifflin-St Jeor TDEE calculations.<br>• PostgreSQL Row-Level Security (RLS). | Mobile systems architecture, edge AI routing, client-side resource optimization, and mathematical health modeling. | Expo managed workflow with complete documented architecture. | **Proposed Featured Candidate (Mobile AI & Cloud)** |
| **[`QuickAid-Geomapping`](https://github.com/SaucesCode/QuickAid-Geomapping)** | React, Python (Django REST Framework), Leaflet.js, PostgreSQL | Verified via repository README:<br>• Applicant Tracking System with GIS geomapping.<br>• Interactive Leaflet heatmaps and marker filtering.<br>• Demographic KPI dashboards with Recharts and React Query.<br>• JWT authentication (SimpleJWT), batch CSV/Excel approvals, and printable intake sheets. | Enterprise full-stack architecture, relational database modeling, spatial data visualization, and asynchronous API integration. | Comprehensive documentation and full repository architecture. | **Proposed Featured Candidate (Enterprise Full-Stack GIS)** |
| **[`valence-capital-landing-page`](https://github.com/SaucesCode/valence-capital-landing-page)** | Semantic HTML5, Vanilla CSS, Vanilla JavaScript | Verified via repository README:<br>• Interactive 3D titanium card with mouse-driven perspective tilt & flip physics.<br>• Real-time simulated ledger streamer.<br>• Dynamic compounding yield calculator ($250k–$30M).<br>• Zero external runtime dependencies. | Advanced frontend design engineering, spatial CSS transforms, mathematical animations, and high-performance DOM manipulation. | Standalone interactive web build. | **Proposed Featured Candidate (Design Engineering)** |
| **[`portfolio-cms`](https://github.com/SaucesCode/portfolio-cms)** | React, Vite, Node.js, Express, Prisma ORM, PostgreSQL | Verified via repository README:<br>• Full-stack portfolio and custom CMS ("Workbench").<br>• Asymmetric editorial public site + dedicated administrative management portal.<br>• JWT auth via httpOnly cookies, bcrypt hashing, markdown blog publishing pipeline. | Full-stack systems architecture, relational database design, and admin tooling. Provides historical context for transitioning to an ultra-lean Next.js 16 ISR architecture. | Previously deployed to Vercel (`jamespatrickdemesa.vercel.app`). | **Strong Case Study / Archive Anchor** |
| **[`docsnapper`](https://github.com/SaucesCode/docsnapper)** | JavaScript, HTML5 Canvas, Manifest V3 | Verified via repository README:<br>• Captures rendered HTML5 `<canvas>` elements inside view-only SharePoint, MS Teams, and OneDrive viewers.<br>• Compiles frames client-side into multi-page printable PDFs.<br>• Keyboard workflow (`C` to snap, `E` to export). | Browser DOM heuristics, HTML5 canvas frame manipulation, client-side memory management, and productivity engineering. | Standalone unpackable extension. | **Archive Highlight / Browser Utility** |

### 2.2 Search-Discovered Repositories (Cataloged via GitHub REST API)
The remaining 35 repositories were cataloged via the GitHub REST API query (`user:SaucesCode`) without exhaustive source-code review. They represent supporting works, frontend landing pages, e-commerce themes, academic projects, and experiments:
- **Frontend & E-Commerce Themes:** [`Rowszein-s-Delight`](https://github.com/SaucesCode/Rowszein-s-Delight) (Next.js/React food menu), [`kinetix-athletics-theme`](https://github.com/SaucesCode/kinetix-athletics-theme) (WordPress/Shopify Storefront API activewear theme), [`thread-and-form`](https://github.com/SaucesCode/thread-and-form) (WordPress FSE luxury fashion block theme), [`nexus-ai-landing-page`](https://github.com/SaucesCode/nexus-ai-landing-page) (dark architectural AI page), [`horology-landing`](https://github.com/SaucesCode/horology-landing) (luxury watch landing page with cart in localStorage).
- **Full-Stack & Web Apps:** [`PayFairy-A-Pay-Tracker-using-MERN`](https://github.com/SaucesCode/PayFairy-A-Pay-Tracker-using-MERN) (MERN agreement tracker), [`Job-Application-Tracker-AI-Resume-Fit-MERN-Stack`](https://github.com/SaucesCode/Job-Application-Tracker-AI-Resume-Fit-MERN-Stack) (MERN resume fit tracker), [`Payroll-System-w-Django-React-TailwindCSS`](https://github.com/SaucesCode/Payroll-System-w-Django-React-TailwindCSS) (Django + React payroll UI), [`react-weather-app`](https://github.com/SaucesCode/react-weather-app) (weather API dashboard), [`react_todolist`](https://github.com/SaucesCode/react_todolist), [`react_landingpage`](https://github.com/SaucesCode/react_landingpage).
- **Academic, Utilities & Early Works (24 repositories):** [`ITD_Data_Mining_Rodas_De_Mesa`](https://github.com/SaucesCode/ITD_Data_Mining_Rodas_De_Mesa) (Jupyter data mining notebook), [`Tkinter_student_registration_system`](https://github.com/SaucesCode/Tkinter_student_registration_system) (Python desktop GUI), [`file-organizer`](https://github.com/SaucesCode/file-organizer) (Python CLI script), [`django_todo_list`](https://github.com/SaucesCode/django_todo_list), [`Django-Image-Gallery`](https://github.com/SaucesCode/Django-Image-Gallery), earlier portfolios, and foundational web exercises.

---

## 3. Recommended System Architecture & Next.js 16 Caching

```text
+---------------------------------------------------------------------------------------+
|                                    VERCEL EDGE CDN                                    |
|   Global Edge Cache (SWR) • Instant Pre-rendered HTML • Sub-50ms TTFB Worldwide       |
+---------------------------------------------------------------------------------------+
                                           |
                                           v
+---------------------------------------------------------------------------------------+
|                        NEXT.JS 16 APP ROUTER RUNTIME (ACTIVE LTS)                     |
|                                                                                       |
|   +------------------------------------+   +--------------------------------------+   |
|   |   React Server Components (RSC)    |   |     Client Components ('use client') |   |
|   |   • Zero client JS bundle          |   |     • Quarantined interactive leaves |   |
|   |   • Static layout & content render |   |     • Search, Filter, Modals, Motion |   |
|   +------------------------------------+   +--------------------------------------+   |
|                     |                                          |                      |
|                     v                                          v                      |
|   +------------------------------------+   +--------------------------------------+   |
|   |        Local Content Layer         |   |          Design System Primitives    |   |
|   |   • Typed MDX Case Studies         |   |   • Tailwind CSS v4 + OKLCH Tokens   |   |
|   |   • Curated Project Metadata       |   |   • Accessible Focus & Contrast      |   |
|   +------------------------------------+   +--------------------------------------+   |
|                     |                                                                 |
|                     v                                                                 |
|   +-------------------------------------------------------------------------------+   |
|   |                Layer B: Repository Coordinator (lib/github.ts)                |   |
|   |   • getRepositories(): Top-level boundary; catches cold-start failures        |   |
|   |   • Emits telemetry: { source: 'github-live' | 'fallback-snapshot' }          |   |
|   +-------------------------------------------------------------------------------+   |
|                     |                                          |                      |
|                     v (normal execution)                       v (cold-start fallback)|
|   +------------------------------------+   +--------------------------------------+   |
|   |    Layer A: Cached Fetcher         |   |     Static Fallback Snapshot         |   |
|   |    • 'use cache' directive         |   |     • lib/fallback-repos.json        |   |
|   |    • cacheLife('hours')            |   |     • Used ONLY if cold start fails  |   |
|   |    • cacheTag('github-repos')      |   |     • NEVER overwrites valid cache   |   |
|   |    • Throws on 403/5xx/errors      |   +--------------------------------------+   |
|   +------------------------------------+                                              |
+---------------------------------------------------------------------------------------+
                                           |
                                           v
                     +-------------------------------------------+
                     |         GitHub REST API (Public)          |
                     |         Optional Token: 5,000 req/hr      |
                     |         Real-time Stars, Forks & Pushes   |
                     +-------------------------------------------+
```

### Architectural Decisions:
1. **Framework:** Next.js 16.x Active LTS on React 19 and Node.js 20+ (Node v24.21.0 verified locally).
2. **Single Consistent Caching Model:** Standardized on Next.js 16 Cache Components (`use cache`, `cacheLife('hours')`, `cacheTag('github-repos')`). Legacy `fetch` `next.revalidate` options are completely avoided.
3. **Non-Destructive Error Handling:** 
   - `fetchFreshGitHubRepos()` throws on API errors, validation errors, or pagination timeouts.
   - When background revalidation throws, Next.js aborts revalidation and **keeps serving Tier 2 Last-Known-Good cached data**. It does NOT overwrite with fallback data.
   - Initial cold-start failures with no existing cache are caught by `getRepositories()`, which serves Tier 3 `fallback-repos.json` with `isFallback: true`.
4. **Hydration-Safe Production CSP:** Allows `'self'` and `'unsafe-inline'` for static framework hydration scripts while strictly banning `'unsafe-eval'` in production builds. Post-build verification planned for implementation.
5. **Decoupled HSTS Preload:** HSTS preload is decoupled from initial deployment and scheduled as a post-launch domain verification task.

---

## 4. Technical Corrections Summary (Phase 1C)

| Domain | Issue in Phase 1B | Phase 1C Final Correction | Technical Rationale |
| :--- | :--- | :--- | :--- |
| **Framework Decision** | Retained Next.js 15 Active LTS based on earlier schedule. | Updated to **Next.js 16 Active LTS** (Next.js 15 is Maintenance LTS). | Aligns with official Next.js LTS support policy for new greenfield projects. |
| **Caching Architecture** | Mixed Next.js 15 fetch ISR semantics with Cache Components discussions. | Standardized exclusively on **Next.js 16 Cache Components** (`use cache`, `cacheLife('hours')`, `cacheTag`). | Eliminates legacy fetch cache options; adheres to single consistent caching model. |
| **GitHub Fallback Contradiction** | `getPublicRepositories()` caught errors and returned `fallbackRepos`, which Next.js cached. | Separated into **Layer A (Cached Fetcher, throws on error)** and **Layer B (Coordinator, handles cold start fallback)**. | Prevents failed revalidation from corrupting active edge cache with stale fallback data. |
| **Production CSP** | Proposed `script-src 'self'`, which blocks framework inline scripts. | Pragmatic origin CSP allowing required inline hydration scripts; **zero `unsafe-eval` in production**. Verification plan documented. | Prevents broken React hydration in statically generated App Router pages. |
| **GitHub Token Scoping** | Recommended classic `public_repo` scope as "read-only". | Rejected classic `public_repo` (which grants read/write). Recommended **unauthenticated access initially**; fine-grained `Metadata: Read-only` if token needed. | Enforces genuine least-privilege security. |
| **Pagination Resilience** | Single-page fetch or silent partial pagination. | Multi-page loop up to 300 repos; **throws immediately if any page fails**. | Prevents silent data truncation from caching incomplete repository lists. |
| **Repository Citations** | Used generic local README paths (`file:///README.md`). | Used **canonical GitHub repository links** for all inspected and discovered projects. | Provides clear, verifiable evidence across documentation. |

---

## 5. Integration Test Matrix

Governs the verification of the GitHub data service:

| Scenario ID | Pre-Condition (Cache State) | Simulated Upstream Condition | Expected Function Behavior | Resulting Data Source | Resulting UI Status Indicator | Cache Invariant Verified |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-GH-01** | Empty Cache (Cold Start) | GitHub responds 200 OK with valid JSON. | `fetchFreshGitHubRepos()` succeeds; populates cache. | `source: 'github-live'` | "Synced with GitHub" | Fresh cache entry written. |
| **TC-GH-02** | Active Cache (< 1 hour old) | User visits page. | Cached payload returned immediately (0ms network). | `source: 'github-live'` | "Synced with GitHub" | Zero upstream requests made. |
| **TC-GH-03** | Stale Cache (> 1 hour old) | GitHub revalidation returns **403 Rate Limit**. | `fetchFreshGitHubRepos()` throws; Next.js aborts revalidation. | **Tier 2: Last-Known-Good Cache** | "Synced with GitHub" (Cached) | **Last-Known-Good cache is PRESERVED.** Fallback snapshot NOT used. |
| **TC-GH-04** | Stale Cache (> 1 hour old) | GitHub revalidation returns **500 Server Error** or timeouts. | `fetchFreshGitHubRepos()` throws; Next.js aborts revalidation. | **Tier 2: Last-Known-Good Cache** | "Synced with GitHub" (Cached) | **Last-Known-Good cache is PRESERVED.** Fallback snapshot NOT used. |
| **TC-GH-05** | Empty Cache (Cold Start) | GitHub is **Down / 503 / Network Abort**. | `fetchFreshGitHubRepos()` throws; caught by `getRepositories()`. | **Tier 3: `fallback-repos.json`** | "Offline Snapshot" (`isFallback: true`) | Page renders gracefully without throwing unhandled 500 error. |
| **TC-GH-06** | Stale Cache (> 1 hour old) | GitHub returns malformed JSON (Zod validation fails). | Zod throws `GitHubValidationError`; revalidation aborted. | **Tier 2: Last-Known-Good Cache** | "Synced with GitHub" (Cached) | Corrupt data rejected; cache preserved. |
| **TC-GH-07** | Empty Cache (Cold Start) | Multi-page pagination fails on Page 2 (Network timeout). | `fetchAllPages()` throws; caught by coordinator. | **Tier 3: `fallback-repos.json`** | "Offline Snapshot" (`isFallback: true`) | Incomplete Page 1 data is NOT cached or displayed as complete. |

---

## 6. Outstanding Decisions Requiring User Approval

The following decisions remain **unresolved** and require your explicit review and sign-off before Phase 2 begins:

1. **Approval of Proposed Featured Projects Lineup `[PROPOSED]`:**  
   *Proposal:* Feature the top 5 candidate projects (`sentinel-organizer`, `meeting-mode`, `siaMeal-Snap`, `QuickAid-Geomapping`, and `valence-capital-landing-page`), with all remaining 37 repositories available in the interactive Archive Explorer.  
   *Question:* Do you approve this 5-project featured lineup, or would you like to make substitutions (e.g., adding `portfolio-cms` or `docsnapper`)?
2. **Visual Direction & Aesthetics (To Be Explored in Phase 2) `[PROPOSED]`:**  
   *Proposal:* An architectural, dark-mode-first technical aesthetic featuring high-density typography (e.g., Geist / JetBrains Mono), subtle grid structures, warm dark slate surfaces, and clean signal accents, avoiding generic gradients and AI slop.  
   *Question:* Do you approve this dark architectural aesthetic direction, or do you prefer a warm-paper editorial style (similar to your earlier portfolio-cms concept)?
3. **Live Availability & Professional Claims Verification `[UNRESOLVED]`:**  
   *Status:* **Unresolved** — The exact copy for employment status (e.g., "Available for Software Engineering Roles"), educational timeline, and career milestones must be confirmed by you before production copy is finalized.
4. **Optional Features Scope for MVP `[PROPOSED]`:**  
   *Proposal:* Defer the `Cmd+K` Command Palette, interactive terminal emulator, and on-demand webhook revalidation to post-launch iterations to maintain a rapid, focused build of the core portfolio.  
   *Question:* Do you approve deferring these optional features for the initial release?

---

## 7. Updated Phase 1 Acceptance Matrix

| Deliverable / Evaluation Dimension | Verification Status | Remediation & Conformance Evidence |
| :--- | :--- | :--- |
| **1. GitHub Discovery & Repository Inventory** | **VERIFIED** | All 42 public repos cataloged; 7 flagship candidates inspected in depth with canonical GitHub links; 35 search-discovered repos categorized. |
| **2. Framework & Caching Selection** | **VERIFIED** | Next.js 16 Active LTS selected; Cache Components (`use cache`, `cacheLife`, `cacheTag`) standardized; zero mixing of legacy APIs. |
| **3. Dynamic GitHub Integration Specification** | **VERIFIED** | Endpoint parameters (`type=owner`); multi-page pagination with failure protection; two-layer architecture separating cached fetcher from coordinator. |
| **4. Hardened Security Architecture** | **VERIFIED** | Production CSP bans `unsafe-eval`; allows required static hydration scripts; verification plan established; HSTS preload decoupled. |
| **5. ISO/IEC 25010:2023 Quality Standards** | **VERIFIED** | Nine 2023 characteristics integrated (Interaction capability, Flexibility, Safety scope justification); RTM fully synchronized. |
| **6. Calibrated Performance & Accessibility** | **VERIFIED** | Google CWV p75 baseline criteria separated from stretch goals; manual WCAG 2.2 AA testing mandated beyond Lighthouse 100. |
| **7. Requirements Classification Rigor** | **VERIFIED** | All functional requirements strictly partitioned into `[CONFIRMED]`, `[PROPOSED]`, or `[UNRESOLVED]`. |
| **8. Documentation Consistency Across `docs/`** | **VERIFIED** | All five planning documents in [`docs/`](file:///c:/Users/CARE%20MBA/Desktop/New%20Systems/new-portfolio/docs) fully synchronized in versioning, terminology, and criteria. |
| **9. Strict Execution Boundaries** | **VERIFIED** | Zero application code written, zero dependencies installed, no UI designed, no Phase 2 work started. |

---

## 8. Phase 1 PASS/FAIL Assessment

### Quality & Architecture Assessment: **PASS (FINAL REMEDIATION)**

All architecture review findings from Phase 1A, 1B, and 1C have been thoroughly resolved. The system requirements, architecture specifications, GitHub integration plans, and quality models conform strictly to official documentation and international engineering standards.

| File Path | Description | Revision Status |
| :--- | :--- | :--- |
| **[`docs/PROJECT_REQUIREMENTS.md`](file:///c:/Users/CARE%20MBA/Desktop/New%20Systems/new-portfolio/docs/PROJECT_REQUIREMENTS.md)** | Requirements specification with Next.js 16 Active LTS, classification framework, and ISO 25010 RTM. | Remediated (Rev 3.0) |
| **[`docs/SYSTEM_ARCHITECTURE.md`](file:///c:/Users/CARE%20MBA/Desktop/New%20Systems/new-portfolio/docs/SYSTEM_ARCHITECTURE.md)** | System architecture with Next.js 16 Cache Components, two-layer resilience, hydration-safe CSP, and security headers. | Remediated (Rev 3.0) |
| **[`docs/GITHUB_INTEGRATION_PLAN.md`](file:///c:/Users/CARE%20MBA/Desktop/New%20Systems/new-portfolio/docs/GITHUB_INTEGRATION_PLAN.md)** | GitHub REST API plan with Cache Components, multi-page failure protection, fine-grained PAT scoping, and test matrix. | Remediated (Rev 3.0) |
| **[`docs/QUALITY_STANDARDS.md`](file:///c:/Users/CARE%20MBA/Desktop/New%20Systems/new-portfolio/docs/QUALITY_STANDARDS.md)** | ISO/IEC 25010:2023 (9 characteristics), CWV baseline vs stretch, and manual WCAG AA audit. | Remediated (Rev 3.0) |
| **[`docs/PHASE_1_REPORT.md`](file:///c:/Users/CARE%20MBA/Desktop/New%20Systems/new-portfolio/docs/PHASE_1_REPORT.md)** | Comprehensive Phase 1 synthesis, inventory citations, Phase 1C change log, and gate checklist. | Remediated (Rev 3.0) |

---

> **CRITICAL GATE NOTICE — AWAITING EXPLICIT USER APPROVAL:**  
> In accordance with strict phased delivery rules, Phase 1 is held at the review gate. No application initialization, dependency installation, or Phase 2 work will begin until you have reviewed this report, resolved the outstanding decisions, and given explicit approval to proceed.
