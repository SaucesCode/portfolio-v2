# MOTION DESIGN SYSTEM SPECIFICATION V2
## Tokens, Physics Targets, Empirical Testing Standards & Accessibility Fallbacks

**Document Status:** Revised (Final Closeout Revision)  
**Version:** 2.1 (Phase 2E Closeout Revision)  
**Author:** Senior Creative Frontend Engineer & Motion Specialist  
**Brand Identity:** James Patrick De Mesa (`SaucesCode`) — Subject to Owner Approval  
**Scope Boundary:** Motion Design Tokens, Choreography Timelines, Testing Goals & Accessibility Standards

---

## 1. Executive Summary & Motion Philosophy

Motion in the V2 portfolio is engineered for **tactile precision, physical plausibility, and zero cognitive interference**. 

> [!NOTE]
> **Empirical Testing Standard:** High frame rates ($60\text{fps}$), low Interaction to Next Paint ($\text{INP} \le 100\text{ms}$), minimal Cumulative Layout Shift ($\text{CLS} \le 0.02$), and compositor-thread execution are **engineering targets and design goals subject to empirical verification during browser testing**. While CSS `transform` and `opacity` are preferred to avoid forced reflows, actual GPU composite behavior depends on browser layer trees, device memory, and display hardware. These targets will be formally measured using Chrome DevTools MCP profiling and automated Playwright Test assertions in implementation phases.

### 1.1 Core Motion Design Targets
1. **Target Zero Layout Shifts:** Interactive transitions target properties that avoid altering layout geometry (`transform`, `opacity`, `clip-path`).
2. **Immediate Interaction Feedback:** Interactive controls target perceived response times of **$< 100\text{ms}$**.
3. **Restrained Sequence Ceiling:** Choreographed entrance sequences are budgeted to complete within **$\le 450\text{ms}$** to avoid delaying content comprehension.
4. **Voluntary Level AAA Reduced Motion:** When `@media (prefers-reduced-motion: reduce)` is enabled, all animations transition to instantaneous `0.001ms` states with zero spatial movement.

---

## 2. Motion Design Tokens

```css
:root {
  /* ================= DURATION SCALE ================= */
  --duration-instant: 80ms;   /* Active click, tactile tap feedback, focus ring appearance */
  --duration-fast: 150ms;      /* Hover states, trailing arrow slide, badge reveals */
  --duration-normal: 250ms;    /* Tab switches, split-curtain settling, card lift */
  --duration-slow: 400ms;      /* Navigation drawer slides, modal dialog entry */
  --duration-entrance: 450ms;  /* Total hero entrance choreography ceiling */

  /* ================= EASING CURVES ================= */
  /* Smooth decelerating curve for entrances and micro-interactions */
  --ease-out-cubic: cubic-bezier(0.33, 1, 0.68, 1);
  
  /* High-energy spring curve for tactile card hover and interactive reveal snaps */
  --ease-spring: cubic-bezier(0.16, 1, 0.3, 1);
  
  /* Symmetrical curve for route cross-fades */
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);

  /* Quick exit curve for modal dismissal */
  --ease-in-quad: cubic-bezier(0.55, 0, 1, 0.45);
}

/* ================= VOLUNTARY LEVEL AAA REDUCED MOTION OVERRIDE ================= */
@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-instant: 0.001ms;
    --duration-fast: 0.001ms;
    --duration-normal: 0.001ms;
    --duration-slow: 0.001ms;
    --duration-entrance: 0.001ms;
    --ease-out-cubic: linear;
    --ease-spring: linear;
    --ease-in-out: linear;
  }
  
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
    transform: none !important;
  }
}
```

---

## 3. Physical Spring Parameters (For Web Animations API & Framer/Motion)

Where JavaScript spring solvers are utilized (such as dragging the "Finished vs Behind-the-Build" curtain or interactive mobile drawers), parameters strictly adhere to underdamped physical stability:

| Spring Preset | Mass ($m$) | Stiffness ($k$) | Damping ($c$) | Damping Ratio ($\zeta$) | Target Settling Time | Assigned Use Case |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Tactile Snap** | $1.0$ | $320\text{ N/m}$ | $28\text{ Ns/m}$ | $\zeta = 0.78$ | $\approx 180\text{ms}$ | Button presses, tab indicator switches, mobile toggle pills. |
| **Curtain Settle**| $1.2$ | $240\text{ N/m}$ | $30\text{ Ns/m}$ | $\zeta = 0.88$ | $\approx 240\text{ms}$ | Release of the split-reveal drag handle settling to rest. |
| **Modal Sheet** | $1.0$ | $180\text{ N/m}$ | $24\text{ Ns/m}$ | $\zeta = 0.89$ | $\approx 320\text{ms}$ | Mobile discovery inquiry drawer sliding up from bottom dock. |

---

## 4. The Split Reveal: Accessibility & Multi-Modal Semantics

The "Finished Product ↔ Behind the Build" interaction is designed with three distinct input modalities to ensure full usability across all devices and assistive technologies:

### 4.1 Modality A: Desktop Pointer Drag
- Bound to cursor coordinate using CSS `clip-path: polygon(...)`.
- Updates CSS custom property `--split-pos: [0-100]%` via `requestAnimationFrame`.
- Target: smooth tracking without triggering synchronous layout recalcs.

### 4.2 Modality B: Keyboard-Operable Button & Stepping Alternative
- **Visible Button:** `<button aria-pressed="false" aria-label="Toggle behind the build architecture view">[Switch to Architecture View ↵]</button>`
- **Keyboard Controls:**
  - `Enter` or `Space`: Toggles view between 0% and 100% split.
  - `ArrowLeft` / `ArrowRight`: Increments/decrements reveal curtain by 10% when focused.
  - Visible $2\text{px}$ solid cobalt focus ring (`#3b82f6`) with $2\text{px}$ offset rendered immediately ($0\text{ms}$).

### 4.3 Modality C: Mobile Semantic Segmented Tabs (Zero Dragging)
- On touch viewports (< $768\text{px}$), draggable curtains are completely disabled to avoid colliding with native vertical scrolling.
- Rendered as accessible tablist:
  ```html
  <div role="tablist" aria-label="Project presentation view">
    <button role="tab" aria-selected="true" id="tab-finished" aria-controls="panel-finished">Finished Product</button>
    <button role="tab" aria-selected="false" id="tab-code" aria-controls="panel-code">Behind the Build</button>
  </div>
  ```
- Touch target height $\ge 48\text{px}$; instantaneous state transition.

### 4.4 Reduced-Motion Behavior
- When `prefers-reduced-motion: reduce` is active:
  - Draggable curtains are disabled.
  - Side-by-side or tabbed buttons switch views with **$0\text{ms}$ transition time** and zero spatial animation.

---

## 5. Performance Criteria & Empirical Verification Matrix

The following metrics represent target quality goals to be measured and validated during Phase 3 browser testing:

| Performance Metric | Target Goal (Design Budget) | Verification Protocol in Browser Testing |
| :--- | :--- | :--- |
| **Rendering Frame Rate** | Target $60\text{fps}$ ($16.6\text{ms}$ budget) on mid-range devices | Chrome DevTools Performance Trace during split-reveal drag and scroll. |
| **Main-Thread Reflows** | Target zero forced synchronous layout thrashing | Audit layout tree recalculations during CSS clip-path updates. |
| **Cumulative Layout Shift**| Target $\text{CLS} \le 0.02$ (Target ideal: $0.00$) | Web Vitals instrumentation confirming container dimensions remain stable. |
| **Interaction to Next Paint**| Target $\text{INP} \le 100\text{ms}$ (Good threshold) | Chrome DevTools INP measurement during tab toggles and button presses. |
| **Reduced-Motion Check** | $100\%$ compliance with prefers-reduced-motion | Playwright Test browser emulation asserting $0\text{ms}$ duration and zero translation. |

---

## 6. WCAG 2.2 Standards & Level AAA Motion Policy

- **WCAG 2.2 Criterion 2.2.2 (Pause, Stop, Hide - Level AA):** No automated moving or scrolling elements run for $> 5$ seconds. All entrance choreographies complete in $< 450\text{ms}$.
- **WCAG 2.2 Criterion 2.3.3 (Animation from Interactions - Level AAA):** All non-essential animations triggered by user interaction can be completely suppressed via system preferences (`prefers-reduced-motion`), preserving 100% functionality and content readability.
