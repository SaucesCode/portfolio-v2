# Motion Design Plan & Animation Choreography

**Document Identifier:** `MOTION-PLAN-2026-PHASE2`  
**Status:** PROPOSED (Phase 2 Creative Exploration)  
**Author:** Motion Choreographer, Creative Frontend Engineer & UI/UX Designer  
**Project:** Software Engineering Portfolio for James Patrick De Mesa (`SaucesCode`)  
**Standards Alignment:** WCAG 2.2 AA (Criterion 2.3.3 Animation from Interactions), ISO/IEC 25010:2023 (Interaction Capability)

---

## 1. Motion Philosophy & The Animation Decision Framework

Motion in this portfolio is an engineering discipline, not a decorative layer. Every animation must serve a clear cognitive purpose: **communicating spatial relationships, providing tactile feedback, or guiding visual hierarchy**.

### Core Tenet: "Beauty is Leverage, Restraint is Mastery"
- **Frequency-Based Animation Rule:** High-frequency actions (actions a user triggers dozens of times, like typing in the repository search bar or navigating with keyboard arrows) must have **zero animation latency**. Low-frequency transitions (opening a case study, expanding a mobile navigation drawer) employ smooth mass-based physics.
- **Never Animate Keyboard-Initiated Actions:** Keyboard triggers (e.g., Tab navigation, Enter to open, Esc to dismiss) must execute with 0ms transition delay. Animation on repetitive keyboard actions creates cognitive lag.
- **Strict Anti-Patterns:**
  - ❌ **No Scroll Hijacking:** Never alter the native scroll physics of the browser window.
  - ❌ **No Disorienting Camera Tilts:** Avoid full-page 3D perspective shifts that cause motion sickness.
  - ❌ **No Continuous Canvas Loops:** Avoid unceasing background particle animations that drain laptop batteries and inflate CPU usage.
  - ❌ **No Unanchored Floating Elements:** Nothing floats from a mathematical scale of 0. Elements scale from a grounded `scale(0.96)` to `scale(1.0)`.

---

## 2. Standardized Motion Durations & Easing Tokens

To guarantee visual consistency, all transitions and animations are bound to an exact timing and easing scale:

### 2.1 Motion Duration Ranges

| Token | Duration | Intended Use Case & Context |
| :--- | :--- | :--- |
| `--duration-instant` | `0ms` | Keyboard interactions, search query typing, active tab switching, and `prefers-reduced-motion`. |
| `--duration-micro` | `100ms - 150ms` | Micro-interactions: button press down (`:active`), icon translation, checkbox/radio toggles. |
| `--duration-standard` | `200ms - 280ms` | Element hover highlights, tooltip fades, badge color shifts, dropdown menu reveals. |
| `--duration-macro` | `300ms - 420ms` | Card expansions, mobile drawer slides, modal dialog entry, section scroll reveals. |
| `--duration-page` | `400ms - 500ms` | App Router route transitions, deep-dive case study page cross-fades. |

### 2.2 Easing Curves & Spring Physics Tokens

```css
/* Custom CSS Transition Timing Functions */
:root {
  /* The Apple / Fluid Curve: Rapid acceleration, long natural deceleration */
  --ease-fluid: cubic-bezier(0.16, 1, 0.3, 1);
  
  /* The Mechanical Decelerate: Snappy exit from view */
  --ease-out-quad: cubic-bezier(0.25, 1, 0.5, 1);
  
  /* The Natural Emphasized Curve: For modal and drawer entrances */
  --ease-emphasized: cubic-bezier(0.2, 0, 0, 1);
}
```

### Motion (Framer Motion) Spring Configurations:
```typescript
export const springPresets = {
  // Snappy: Buttons, icon shifts, tooltips
  snappy: { type: 'spring', stiffness: 450, damping: 35, mass: 0.8 },
  
  // Natural: Card hovers, bento item lifts, accordion expands
  natural: { type: 'spring', stiffness: 320, damping: 28, mass: 1 },
  
  // Gentle: Page transitions, large modal sheets
  gentle: { type: 'spring', stiffness: 200, damping: 24, mass: 1.2 },
} as const;
```

---

## 3. Detailed Component Interaction Choreography

### 3.1 Button & Interactive Capsule Micro-Interactions
- **Hover State:**  
  - Background surface luminance elevates by `+4%`.  
  - Border hairline shifts from `--border-subtle` to `--border-hairline`.  
  - Trailing icon (`↗` inside nested circle) translates `+2px` on the X-axis and `-2px` on the Y-axis over `150ms` (`--ease-fluid`).
- **Active / Press State (`:active`):**  
  - Immediate `scale(0.97)` depression over `80ms` providing instant haptic feedback.
- **Copy-to-Clipboard Action:**  
  - Clicking the email address pill triggers an immediate icon rotation where the clipboard icon shrinks (`scale: 0.8`, `opacity: 0`) and the checkmark icon springs in (`scale: 1.0`, `opacity: 1`) over `180ms`, holding for 2 seconds before reverting.

### 3.2 Featured Project Card Choreography (The Concentric Lift)
- **Resting State:**  
  - Chassis sits flush with `--surface-raised` background and a 1px boundary border (`--border-subtle`). Specular inset highlight at 10% opacity.
- **Hover State (Desktop):**  
  - Smooth upward translation `translateY(-3px)` via CSS transform.  
  - Border transitions to `--border-bright` with a soft ambient glow (`box-shadow: 0 12px 32px -8px rgba(0, 0, 0, 0.4)`).  
  - Embedded project preview screenshot scales subtly from `scale(1.0)` to `scale(1.02)` over `300ms` with overflow clipping.
- **Mobile Touch State:**  
  - Hover effects disabled via `@media (hover: none)`.  
  - Tap down triggers a subtle, instant `scale(0.98)` feedback before navigation.

### 3.3 Scroll-Reveal & Section Choreography
- **Trigger Mechanism:** Native browser `IntersectionObserver` via lightweight Motion viewport triggers (`viewport: { once: true, margin: '-60px' }`).
- **Animation Execution:**  
  - Container opacity animates from `0` to `1`.  
  - Y-axis translation from `+16px` to `0px` (gentle entrance, never large 100px leaps).  
  - Staggered child reveals: `staggerChildren: 0.08s` across featured cards, ensuring content appears rhythmically without stalling the scroll.
- **Zero Scroll Blocking:** Sections reveal asynchronously without interrupting the visitor's manual scroll velocity.

### 3.4 Interactive 3D Perspective Card (Isolated Showcase Widget)
Ported from James's verified engineering in [`valence-capital-landing-page`](https://github.com/SaucesCode/valence-capital-landing-page):
- **Activation Scope:** Restricted strictly to the desktop Hero showcase ornament; completely disabled on mobile viewports.
- **Physics Execution:**  
  - Cursor coordinates calculate normalized offsets:  
    $$\text{rotX} = (\text{mouseY} - \text{centerY}) \times -0.05^\circ, \quad \text{rotY} = (\text{mouseX} - \text{centerX}) \times 0.05^\circ$$
  - Dynamic specular glare gradient shifts opposite to cursor position.
  - Executed strictly via GPU-accelerated CSS `transform: perspective(1000px) rotateX(...) rotateY(...)`.
- **Exit Reset:** When the mouse leaves the card container, the card smoothly springs back to neutral `rotateX(0deg) rotateY(0deg)` over `400ms`.

### 3.5 Page Transitions (Next.js 16 App Router)
- **Route Navigation (Home -> Case Study):**  
  - Exiting page content fades from opacity `1` to `0` over `150ms`.  
  - New case study route mounts with an opacity fade from `0` to `1` and a tiny Y-axis rise from `+10px` to `0px` over `250ms`.  
  - Window scroll position resets to `(0, 0)` instantaneously before content paints, preventing jarring scroll snaps.

---

## 4. Mobile Motion Adaptation (Touch Ergonomics)

On mobile and touch-screen devices, motion principles adapt to prevent latency and accidental triggers:

1. **Hover Suppression:** All hover-triggered transforms (`translateY(-3px)`, scale shifts) are strictly disabled via CSS media queries:
   ```css
   @media (hover: none) {
     .card-hover {
       transform: none !important;
       box-shadow: none !important;
     }
   }
   ```
2. **Instant Tap Feedback:** Interactive cards and list items use `:active` tap states (`scale(0.98)`, transition duration: `80ms`).
3. **Mobile Drawer Spring Physics:** The mobile navigation drawer slides in from the bottom or right using a natural spring (`stiffness: 350, damping: 32`), following the thumb swipe trajectory.

---

## 5. Accessibility & Reduced-Motion Conformance (WCAG 2.2 AA)

To satisfy **WCAG 2.2 Criterion 2.3.3 (Animation from Interactions - Level AAA)** and **ISO/IEC 25010:2023 (Inclusivity)**:

### Strict Reduced-Motion Rules:
When `@media (prefers-reduced-motion: reduce)` is detected in the operating system or browser:
1. **Zero Transform Displacements:** All `translateY`, `scale`, and `rotate` animations are completely disabled.
2. **Instant Transitions or Subtle Fades:** Essential state changes (such as opening dialogs or switching tabs) use a simple, instant `opacity` fade over `100ms` or execute with `duration: 0s`.
3. **3D Card Tilt Deactivated:** The 3D perspective card sits completely static at `rotate(0deg)`.
4. **Implementation Standard:**
   ```css
   @media (prefers-reduced-motion: reduce) {
     *,
     *::before,
     *::after {
       animation-duration: 0.01ms !important;
       animation-iteration-count: 1 !important;
       transition-duration: 0.01ms !important;
       scroll-behavior: auto !important;
     }
   }
   ```

---

## 6. Motion Performance Budget & Compositor Isolation

To guarantee that animations never degrade the **Interaction to Next Paint (INP ≤ 100ms)** or **Cumulative Layout Shift (CLS ≤ 0.05)**:

1. **Compositor-Only Properties:** Animations are strictly restricted to `transform` and `opacity`. Never animate `width`, `height`, `margin`, `padding`, `top`, `left`, or `border-width`, which trigger expensive browser layout and paint cycles.
2. **Hardware Acceleration:** Cards with interactive transforms include `will-change: transform` only during active hover/drag states, purged on idle to release GPU memory.
3. **Battery & Background Optimization:** If the user switches browser tabs (`document.hidden === true`), all running animation timers or requestAnimationFrame loops pause instantly.

---

## 7. Motion Plan Approval Gate

- [x] Timing scale, duration ranges, and easing tokens formally defined.
- [x] Frequency-based motion rules established (0ms keyboard actions).
- [x] Component choreography detailed for buttons, cards, scroll reveals, and 3D card tilt.
- [x] Touch adaptations and comprehensive WCAG reduced-motion standards specified.
- [ ] Explicit user approval required to freeze motion language before Phase 3 implementation.
