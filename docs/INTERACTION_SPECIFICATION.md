# INTERACTION SPECIFICATION V2
## "Finished Product ↔ Behind the Build" & Restrained Client Micro-Interactions

**Document Status:** Complete & Awaiting Phase 2E Approval Gate  
**Version:** 2.0 (Phase 2E Signature Experience)  
**Author:** Senior Creative Frontend Engineer & UX Strategist  
**Brand Identity:** James Patrick De Mesa (`SaucesCode`)  
**Scope Boundary:** Interaction Mechanics, State Diagrams, Touch Adaptations & Accessibility Fallbacks

---

## 1. Executive Summary & Interaction Philosophy

Every interaction in the portfolio exists to serve a **concrete client experience goal**:
1. **Immediate Comprehension:** Non-technical visitors must see the finished, beautiful live website immediately upon landing.
2. **Effortless Proof of Craft:** Prospective clients and technical evaluators must be able to verify underlying code cleanliness, architectural rigor, and performance with a single gesture.
3. **Zero Friction:** No interaction may ever block reading, hijack scrolling, trap focus, or cause motion sickness.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             INTERACTION PURPOSE MATRIX                           │
├──────────────────────────┬──────────────────────────┬────────────────────────────┤
│ Interaction              │ Client Experience Goal   │ Engineering Invariant      │
├──────────────────────────┼──────────────────────────┼────────────────────────────┤
│ Finished ↔ Behind Build  │ Prove both visual beauty │ CSS clip-path masking only;│
│ (Desktop Split Curtain)  │ and code architecture.   │ 0ms re-layout, 60fps.      │
├──────────────────────────┼──────────────────────────┼────────────────────────────┤
│ Mobile Labeled Tabs      │ Frictionless mobile tap; │ Zero touch gesture drag    │
│ (Tap-to-Flip Switcher)   │ no scroll interference.  │ conflict; instant swap.    │
├──────────────────────────┼──────────────────────────┼────────────────────────────┤
│ Hero Typographic Stagger │ Lead eye to value prop   │ Total budget < 450ms;      │
│ (Subtle Entrance)        │ without loading delays.  │ opacity + translateY only. │
├──────────────────────────┼──────────────────────────┼────────────────────────────┤
│ Button-in-Button Shift   │ Tactile feedback confirming│ 120ms ease; +4px shift;  │
│ (Trailing Icon Slide)    │ actionable next step.    │ hardware-accelerated.      │
└──────────────────────────┴──────────────────────────┴────────────────────────────┘
```

---

## 2. The Primary Interaction: "Finished Product ↔ Behind the Build"

### 2.1 The Default View: Finished Product
- **Non-Negotiable Rule:** The **Finished Product** is the default state for every project card.
- **Client Rationale:** A non-technical business owner, marketing director, or founder evaluates design elegance, branding, visual polish, and layout first. Showing raw code or schemas by default alienates commercial clients.
- **The "Behind the Build" Value:** An interactive slider or toggle allows CTOs, technical founders, and evaluators to unmask the underlying engineering (WordPress `theme.json`, Gutenberg blocks, Prisma schemas, Next.js route caching) on demand.

### 2.2 Desktop Interaction: Draggable Reveal Curtain
On viewports $\ge 768\text{px}$:
- **Mechanism:** The card renders two layered panes:
  - Base Layer: *Finished Client Experience* (Lookbook, live product UI, typography).
  - Overlay Layer: *Behind the Build* (Syntax-highlighted schema, architecture notes, performance tokens).
- **Masking Technology:** CSS `clip-path: polygon(...)` bound to the horizontal coordinate of the cursor or grab handle.
- **Grab Handle:** A circular terracotta pill (`#b84218`, $44\text{px}$ diameter) centered along the vertical divider line displaying `⇄ DRAG REVEAL`.
- **Drag Physics:**
  - Cursor `pointerdown`: Locks pointer capture to the container.
  - Cursor `pointermove`: Updates CSS custom property `--split-pos: [0-100]%` via `requestAnimationFrame`.
  - Zero forced layout reflows (no altering DOM widths or re-measuring text containers).
  - Bounded between $10\%$ and $90\%$ width to prevent accidental total occlusion.

### 2.3 Keyboard & Screen-Reader Accessible Alternative (WCAG 2.1.1 & 2.4.11 AA)
Because mouse dragging requires fine motor control, an explicit, accessible alternative is permanently provided:
- **Dedicated Mode Button:** Located at the top-right of the card header:  
  `<button aria-pressed="false" aria-label="Switch to behind the build architecture view">[Switch to Architecture View ↵]</button>`
- **Keyboard Navigation:**
  - Pressing `Space` or `Enter` on the button or grab handle toggles between $0\%$ and $100\%$ split.
  - Arrow keys (`ArrowLeft` / `ArrowRight`) step the curtain position in $10\%$ increments when focused.
  - Visible $2\text{px}$ solid focus ring (`#3b82f6`) with $2\text{px}$ offset when navigated via keyboard.

### 2.4 Mobile Adaptation: Labeled Tab Switcher (No Dragging)
On touch viewports (< $768\text{px}$):
- **Problem with Dragging on Mobile:** Horizontal drag sliders conflict directly with native mobile vertical page scrolling, resulting in stutter, accidental page freezing, and user frustration.
- **Solution:** The drag curtain is automatically unmounted on mobile and replaced with a clean, labeled segmented tab bar:  
  `[● Finished Product] [Behind the Build]`
- **Touch Target:** $48\text{px}$ minimum height; instantaneous state swap; zero layout shifts.

---

## 3. Restrained Set of Supporting Micro-Interactions

Every additional animation is strictly justified by an explicit user experience purpose:

### 3.1 Hero Entrance Choreography
- **UX Purpose:** Focus client attention on the core service offering without feeling static or jarring.
- **Sequence:**
  1. *0ms–120ms:* Header masthead stamp and navigation pill fade in (`opacity: 0 → 1`).
  2. *100ms–260ms:* Eyebrow and headline slide up $8\text{px}$ (`translateY: 8px → 0px`).
  3. *220ms–380ms:* 3-pillar service selector pills stagger in with $40\text{ms}$ delay between pills.
- **Budget:** Entire sequence completes within **$450\text{ms}$**. No blocking splash screens or loading spinners.

### 3.2 Refined Route & Project Page Transitions
- **UX Purpose:** Create seamless continuity between the portfolio homepage and dedicated case studies.
- **App Router Mechanism:** Implemented at the Next.js `template.tsx` level:
  - Exit Route: Opacity fades from $1 \rightarrow 0$ over $80\text{ms}$ (`ease-in`).
  - Enter Route: Opacity fades from $0 \rightarrow 1$ with subtle $6\text{px}$ translateY over $140\text{ms}$ (`ease-out`).
  - Scroll position resets cleanly to top ($0,0$).

### 3.3 Tactile Hover Interactions
- **Cards:** On hover, project cards lift by $-1.5\text{px}$ on the Y-axis over $150\text{ms}$ (`cubic-bezier(0.16, 1, 0.3, 1)`), and the hairline border shifts from `#dfdbd2` to subtle terracotta `#b84218`.
- **Button-in-Button Shift:** Inside primary buttons, the trailing arrow glyph (`→`) slides $+4\text{px}$ to the right on hover over $120\text{ms}$.
- **Images:** Project preview screenshots scale to $1.02\times$ inside an `overflow: hidden` bounding box over $250\text{ms}$.

### 3.4 Progressive Scroll Reveals
- **UX Purpose:** Signal new content entry as the client scrolls down the page.
- **Implementation:** Modern CSS `@starting-style` with Intersection Observer fallback:
  - Threshold: $0.15$
  - Translation: $12\text{px}$ Y-axis lift over $280\text{ms}$.
  - Above-the-fold content renders immediately without waiting for observer triggers.

---

## 4. Explicitly Prohibited Interactions (Anti-Slop Enforcement)

The following trendy but harmful design patterns are strictly banned:

| Prohibited Interaction | Reason for Prohibition |
| :--- | :--- |
| **Scroll Hijacking** | Overriding native mouse wheel or trackpad momentum frustrates users and breaks operating system gestures. |
| **Forced Intro / Splash Screen** | Full-screen animations that make clients wait before seeing content increase bounce rates by up to 40%. |
| **Custom Trailing Ball Cursors** | Replacing the native OS cursor introduces mouse lag, confuses clicking, and breaks on touch screens. |
| **Heavy Three.js Particle Backgrounds** | Unnecessary GPU loops drain laptop batteries and trigger fan noise during client discovery calls. |
| **Excessive Parallax Tilt** | Severe multi-layer 3D tilt causes motion sickness and fails WCAG 2.3.3 Level AAA guidance. |
