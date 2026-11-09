# Software Quality Standards & ISO-Aligned Engineering Model

**Document Identifier:** `QA-PORTFOLIO-2026-PHASE1C`  
**Revision:** 3.0 (Remediated for Next.js 16 Active LTS & Cache Components)  
**Status:** PROPOSED (Awaiting User Phase 1 Approval Gate)  
**Author:** Software Quality Engineer, Senior Frontend Engineer & Technical Reviewer  
**Reference Frameworks:**  
- **ISO/IEC 25010:2023** (Systems and software engineering — Software product Quality Requirements and Evaluation [SQuaRE] — Product quality model)
- **ISO/IEC 27001:2022** (Information security, cybersecurity and privacy protection — Information security management principles)
- **WCAG 2.2 Level AA / ISO/IEC 40500:2025** (Information technology — W3C Web Content Accessibility Guidelines)

> **Important Standards Disclaimer:**  
> This specification adopts the quality model, terminology, and verification methodologies defined by international engineering standards (ISO/IEC 25010:2023, ISO/IEC 27001:2022 principles, and WCAG 2.2 Level AA) to govern the quality of this software engineering portfolio. Adopting these engineering principles does **not** constitute or imply formal organizational or third-party accredited ISO certification.

---

## 1. ISO/IEC 25010:2023 Product Quality Model

The 2023 edition of ISO/IEC 25010 supersedes the 2011 standard by expanding the product quality model to **nine distinct characteristics**, modernizing terminology (e.g., replacing "Usability" with "Interaction capability", expanding "Portability" into "Flexibility", and adding "Safety"). Below is the operationalization of all nine characteristics for this portfolio:

### 1.1 Functional Suitability
*The degree to which a product provides functions that meet stated and implied needs when used under specified conditions.*

| Sub-Characteristic | Measurable Acceptance Criteria | Verification Method |
| :--- | :--- | :--- |
| **Functional Completeness** | 100% of confirmed functional requirements (FR-01 to FR-10) implemented prior to final release. | Requirements Traceability Matrix review. |
| **Functional Correctness** | Rendered GitHub statistics (stars, forks, languages, push timestamps) match upstream API data within normal Next.js 16 cache revalidation windows (`cacheLife: 'hours'`). | Integration test comparing API response with rendered DOM. |
| **Functional Appropriateness** | Filter and search mechanisms return accurate subsets in < 50ms without UI freezing. | Vitest unit tests on filtering algorithms. |

---

### 1.2 Performance Efficiency
*The performance relative to the amount of resources used under stated conditions.*

To prevent unrealistic or misleading benchmarks, performance requirements are partitioned into **Baseline Release Criteria** (Google CWV thresholds at the 75th percentile) and **Ambitious Optimization Targets**:

| Performance Dimension | Baseline Release Criteria (Google CWV p75) | Ambitious Optimization Target (Stretch) | Lab Measurement Conditions |
| :--- | :--- | :--- | :--- |
| **Largest Contentful Paint (LCP)** | **≤ 2.5 seconds** (p75) | **Desktop: ≤ 1.2s**<br>**Mobile: ≤ 2.0s** | Mobile: Moto G4, Throttled 4G, 4x CPU slowdown.<br>Desktop: Unthrottled. |
| **Interaction to Next Paint (INP)** | **≤ 200 milliseconds** (p75) | **≤ 80ms** (Desktop)<br>**≤ 100ms** (Mobile) | Chrome DevTools Performance Trace during search, filter, and modal interaction. |
| **Cumulative Layout Shift (CLS)** | **≤ 0.1** (p75) | **≤ 0.02** (Desktop)<br>**≤ 0.05** (Mobile) | Layout shift tracing during font loading and image hydration. |
| **First Contentful Paint (FCP)** | **≤ 1.8 seconds** | **≤ 0.8s** (Desktop)<br>**≤ 1.5s** (Mobile) | Chrome DevTools Lighthouse audit. |
| **Initial Client JS Payload** | **≤ 100 kB gzipped** | **≤ 85 kB gzipped** (Home Route) | Next.js build bundle analyzer (`@next/bundle-analyzer`). |
| **Edge Cache Hit Ratio** | **≥ 90%** | **≥ 95%** | Vercel CDN analytics telemetry. |

---

### 1.3 Compatibility
*The degree to which a product can exchange information with other products and perform its required functions while sharing the same hardware or software environment.*

| Sub-Characteristic | Measurable Acceptance Criteria | Verification Method |
| :--- | :--- | :--- |
| **Co-existence** | Application runs cleanly without injecting global namespace pollution, prototype mutations, or conflicting with browser extensions. | Browser console runtime audit. |
| **Interoperability** | Structured JSON-LD schema (`Person`, `WebSite`, `CreativeWork`) parses cleanly with zero errors on Google Rich Results validator. | Google Rich Results Test / Schema.org validator. |
| **Cross-Browser Parity** | Flawless visual and functional parity across all major rendering engines: Chromium (Chrome, Edge, Brave), WebKit (Safari iOS/macOS), and Gecko (Firefox). | Cross-browser manual inspection and Playwright test matrix. |

---

### 1.4 Interaction Capability *(formerly Usability)*
*The degree to which a product can be used by specified users to achieve specified goals with effectiveness, efficiency, and satisfaction in a specified context of use.*

This characteristic directly incorporates **WCAG 2.2 Level AA / ISO/IEC 40500:2025** accessibility criteria:

| Sub-Characteristic | Requirement & Acceptance Criteria | Verification Method |
| :--- | :--- | :--- |
| **Inclusivity & Accessibility (WCAG 2.2 AA)** | • Minimum contrast ratio: **4.5:1** for body text; **3:1** for UI borders and icons.<br>• Minimum target size: **24×24 CSS px** (44×44px preferred for mobile buttons).<br>• Full adherence to `@media (prefers-reduced-motion: reduce)`. | • Chrome DevTools MCP color contrast audit.<br>• Automated axe-core / Lighthouse audit.<br>• Manual reduced-motion toggle verification. |
| **Operability & Keyboard Navigation** | 100% of interactive elements operable via Tab / Shift+Tab and Enter / Space. Focus trap enabled on open modals; Escape key dismisses overlays. | Manual keyboard-only walkthrough. |
| **Self-Descriptiveness & Focus Visibility** | Visible, high-contrast focus rings on all focused elements (`outline: 2px solid var(--accent); outline-offset: 2px`). Accessible `aria-label`s on icon buttons. | Screen-reader audit (VoiceOver / NVDA) + visual focus ring check. |
| **User Interface Aesthetics** | Bespoke typography, OKLCH color spaces, balanced whitespace, and zero generic "AI slop" patterns. | Design review pass in Phase 2. |
| **User Error Protection** | Clear empty states with 1-click filter reset when search yields zero results. | Interactive test case verification. |

> **Critical Quality Note:** A Lighthouse accessibility score of 100 does **not** equate to full WCAG 2.2 Level AA conformance. Automated scanners catch only ~30–40% of accessibility defects. Full conformance mandates manual keyboard traversal, screen reader verification, and focus order inspection.

---

### 1.5 Reliability
*The degree to which a system performs specified functions under specified conditions for a specified period of time.*

| Sub-Characteristic | Measurable Acceptance Criteria | Verification Method |
| :--- | :--- | :--- |
| **Availability** | Target ~99.9% uptime powered by Vercel global CDN edge network. | Uptime monitoring. |
| **Fault Tolerance (Safe Revalidation)** | Upstream GitHub API rate-limiting (403) or downtime (5xx) must preserve last-known-good cached data. Background revalidation failures must never overwrite valid cache with older fallback snapshots. | Synthetic 403 rate-limit test. |
| **Recoverability** | Root error boundary (`app/error.tsx`) catches unexpected rendering faults, presents a graceful recovery UI, and provides a "Try Again" action. | Chaos engineering test throwing synthetic error in React tree. |

---

### 1.6 Security
*The degree to which a product protects information and data so that persons or systems have the degree of data access appropriate to their types and levels of authorization.*

Aligned with **ISO/IEC 27001:2022** principles:

| Sub-Characteristic | Measurable Acceptance Criteria | Verification Method |
| :--- | :--- | :--- |
| **Confidentiality & Secret Hygiene** | Zero exposure of `GITHUB_TOKEN`, private keys, or internal environment variables in client-side bundles or Git commits. Classic `public_repo` scope rejected. | Pre-commit secret scanning, bundle inspection. |
| **Content Security Policy (CSP)** | Enforce strict origin/hash CSP. **Zero `unsafe-eval` in production.** Production scripts locked to `'self'` and required inline hydration. | SecurityHeaders.com / Mozilla Observatory audit. |
| **Transport Layer Security & HSTS** | Enforce HTTPS. `Strict-Transport-Security: max-age=63072000; includeSubDomains`. Preload evaluated separately post-domain verification. | SSL Labs SSL Test. |
| **Resistance & Dependency Integrity** | Zero high or critical vulnerabilities in production dependencies. | Automated `npm audit`. |

---

### 1.7 Maintainability
*The degree of effectiveness and efficiency with which a product or system can be modified by the intended performers.*

| Sub-Characteristic | Measurable Acceptance Criteria | Verification Method |
| :--- | :--- | :--- |
| **Modularity & Decoupling** | Strict separation of concerns (UI tokens in `components/ui`, features in `components/features`, business logic in `lib/`). | Architecture review. |
| **Analyzability & Type Safety** | 100% TypeScript coverage with `strict: true`. Zero usage of `any` types across the codebase. | `tsc --noEmit` compiler verification. |
| **Modifiability** | Adding a new featured project or case study requires modifying only a single MDX file in `content/case-studies/`. | Developer workflow test. |
| **Testability** | Pure utility functions (formatting, filtering, data merging) maintain **≥ 90% unit test branch coverage**. | Vitest test coverage report. |

---

### 1.8 Flexibility *(formerly Portability)*
*The degree to which a system can adapt to different or changing environments, requirements, or contexts of use.*

| Sub-Characteristic | Measurable Acceptance Criteria | Verification Method |
| :--- | :--- | :--- |
| **Adaptability** | Seamless responsive adaptation across viewports from 320px (iPhone SE) to 2560px (4K displays) with zero horizontal overflow (`overflow-x: hidden`). | Chrome DevTools viewport emulation (320px, 375px, 768px, 1024px, 1440px, 2560px). |
| **Replaceability** | GitHub data access logic is isolated behind a typed interface in `lib/github.ts`, allowing future migration to another data source without altering UI components. | Code decoupling audit. |

---

### 1.9 Safety
*The degree to which a system under specified conditions does not lead to a state in which human life, health, property, or the environment is endangered.*

- **Scope & Applicability Assessment:** **Non-Applicable (N/A).**
- **Justification:** The portfolio is an informational static/ISR web application. It does not monitor or control physical hardware, industrial systems, medical devices, financial transactions, or life-critical workflows. In accordance with ISO/IEC 25010:2023 guidance on tailoring quality characteristics, Safety is formally documented as non-applicable to avoid creating meaningless or superficial requirements.

---

## 2. Lighthouse Target Matrix & Measurement Conditions

| Category | Minimum Baseline Criteria | Ambitious Optimization Target | Lab Measurement Profile |
| :--- | :--- | :--- | :--- |
| **Performance** | **≥ 90** | **≥ 95** | Mobile: Moto G4, Throttled 4G, 4x CPU slowdown.<br>Desktop: Unthrottled. |
| **Accessibility** | **≥ 95** | **100** | Full automated axe-core / Lighthouse suite (supplemented by manual WCAG checks). |
| **Best Practices** | **100** | **100** | HTTPS, modern image formats, zero console errors, valid doctype. |
| **SEO** | **100** | **100** | Meta tags, OpenGraph images, robots.txt, dynamic sitemap, structured JSON-LD. |

---

## 3. Acceptance Criteria Checklist for Phase 1 Sign-Off

- [x] ISO/IEC 25010:2023 updated to the official nine characteristics (including Interaction capability, Flexibility, and Safety scope justification).
- [x] Performance requirements split into Google baseline CWV (p75) criteria and ambitious stretch targets.
- [x] Manual accessibility verification established (keyboard, focus, screen reader, reduced motion) beyond automated Lighthouse scores.
- [x] ISO/IEC 27001 principles integrated into token hygiene, CSP, and secret management with explicit non-certification disclaimer.
- [x] Zero application code written; read-only and planning boundary strictly observed.
- [ ] Explicit user approval obtained on unresolved decisions before initiating Phase 2.
