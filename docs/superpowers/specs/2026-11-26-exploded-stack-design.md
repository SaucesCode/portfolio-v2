# The exploded stack: design

Date: 2026-11-26. Status: reviewed by a builder check; awaiting the owner's approval.

## Why

The owner sees developer portfolios on LinkedIn that use 3D and strong animation while still showing what the person does and who they are, and wants one that is unmistakably their own. In their words, the one thing a visitor should remember is "that I can build something beautiful and fascinating, and something to be remembered".

The current site works well (live demos, guided tour, assistant, case studies, fast and accessible), but its look could belong to any polished studio: a dark neutral theme, one blue-violet accent, a sans-serif, capsule buttons. Nothing visual is specific to James.

## The idea

The owner chose direction A, "the exploded stack", from three working sketches (`.superpowers/brainstorm/1551-1795674494/content/3d-directions-v3.html`).

One of James's real apps floats in 3D and comes apart into its layers (design, interface, logic, data), then goes back together. The layers are not decoration: when a visitor records a sale in the live Rowszein's Delight demo on the top layer, they watch it travel down. The logic layer lights up the steps the real app runs, a row lands in the data layer and the stock count drops. The visitor sees that James builds the beautiful top and everything underneath it, which is his line "from the database to the last pixel" made literal.

## Goals

- The hero's Rowszein's Delight window becomes a 3D stack of four layers that opens and closes, with the working demo as its interface layer.
- A sale recorded in the demo visibly travels through the logic and data layers, using steps and tables that match the real app.
- The idea carries through the site: the Services section and each case study use the same stack language, so the site feels designed as one piece.
- It stays fast, accessible and readable on phones.

## Non-goals

- No WebGL or 3D library. Considered and rejected (see Approaches).
- No new palette or typeface as part of this work. The existing tokens in `src/app/globals.css` stay; the distinctiveness comes from the stack and its motion. A visual refresh can be a separate decision later.
- No change to the assistant, the project form, the guided tour's content, or the gallery's contents.

## Anti-goals

- 3D that is only an effect. If a layer shows something the real app does not do, it is wrong, however good it looks.
- Scroll-jacking: the page must never stop the visitor's scroll or take control of it.
- A hero that arrives empty or half-built. The first paint shows the finished, closed stack (an existing rule for this hero: entrance motion is limited to small transform and opacity changes, because larger entrances caused first-load stutter).
- Anything that makes the site slower to load or janky on a mid-range phone.

## Constraints

- **Honesty.** Every step and table name in the logic and data layers comes from `src/data/rowszein-trace.ts`, which is already verified against the Rowszein's Delight repository (`backend/sales/services.py`, with a covering test per step). The data layer shows demonstration data and says so. For the Websites stack, every layer label must be checked against the Thread & Form theme repository before it ships.
- **Performance.** No new dependencies. Animate only `transform` and `opacity` (plus `filter` on at most one layer at a time, if it holds 60 fps). LCP stays the hero screenshot, as now. CLS under 0.1: the stack reserves its full size from the first paint. The live layers stay lazy, after first paint, as they are now (`useIdleMount`, `next/dynamic`).
- **Accessibility.** WCAG 2.2 AA. The 3D layers are a picture (`aria-hidden`), as the live dashboard already is. The information travels through controls and announcements: the existing sale buttons and status announcement, plus a short sentence describing what changed underneath. Opening and closing the stack has a real button with `aria-pressed`, so it works by keyboard and without scrolling. Touch targets at least 44 px.
- **Reduced motion.** With `prefers-reduced-motion: reduce`, nothing slides apart or travels. The button switches between the closed stack and the open diagram with a short fade, and a sale updates the layers in place.
- **Browsers.** Chromium supports scroll-driven animations; Firefox and some Safari versions do not. Wherever scroll drives the stack, an `@supports (animation-timeline: …)` path is used, and without it the stack opens and closes only through its button and the sale flow, never broken. The hero already follows this pattern for its unfold.
- **Existing behaviour.** The early-pick script (taps before hydration), the Software/Websites switch and handoff, the phone full-screen demo, the guided tour link and every existing test in `tests/` keep working. Tests that check old markup may be updated, but not to weaken what they verify.
- **This machine.** RAM is often low: one production server (port 3001) and one browser at a time when verifying.

## Approaches

- **CSS 3D with real page elements (chosen by the owner).** The layers are ordinary elements in a `preserve-3d` scene; the interface layer is the live demo itself, so it stays sharp and its controls stay usable. No new libraries, and it extends the hero's existing isometric unfold. Trade-off: it looks designed rather than rendered. Depth comes from shadow, blur and light, not real lighting or reflections.
- **WebGL with Three.js.** Real lighting and camera moves, the biggest effect. Rejected: it roughly doubles the page's JavaScript, the demo would become a texture and stop being usable, it is heavier on phones, and it still needs a flat fallback.
- **CSS 3D plus a particle layer.** As chosen, with the sale travelling as particles. Rejected for now: more spectacle for extra weight and another moving part to keep smooth. A particle trail can be reconsidered after the stack ships.

## Design

### The stack (one component, used everywhere)

A `LayerStack` component draws N layers in an isometric `preserve-3d` scene. It has two states, closed (layers a few pixels apart, reading as one object) and open (layers spread apart with a label beside each), plus a "travelling" highlight that moves from one layer to the next. Its layers are passed in, so the hero, Services and case studies all use the same component with different content.

Closed to open uses `--dur-page` (420 ms) with `--ease-in-out`; the per-layer stagger is 40 ms. A pointer over the stack tilts it slightly (a few degrees, ease-out, desktop pointers only).

### The hero, Software (phase 1)

Top to bottom:

1. **Design.** A translucent sheet showing the Rowszein app's own colour swatches, type sample and spacing grid. *(Builder-check call)* It is invisible while the stack is closed, so it never veils the demo or the LCP screenshot, and it fades in as it lifts off the interface when the stack opens.
2. **Interface.** The live `LiveDashboard`, exactly as now. This is the layer the visitor reads at rest, and the dimension line attaches to it.
3. **Logic.** The six steps from `rowszein-trace.ts`, by their titles, one line each.
4. **Data.** The tables from `rowszein-trace.ts` `tableGroups`, as small table cards; Ingredient and Sale show a few demonstration rows from the live demo state.

A sale travels Interface → Logic → Data. The Design layer takes no part in it.

**One open/closed state, owned by script.** *(Builder-check call)* The stack's state lives in React, so the button's label and `aria-pressed`, the sale flow and the visuals always agree. The hero has no scroll-driven opening: a stack opening as the hero leaves the screen would mostly be seen half-gone, and a CSS-only scrub cannot tell the button or the sale flow whether it is open. Visitors learn that it opens from a one-time peek (see Decided by the owner).

**Where the open stack gets its room.** *(Builder-check call)* Open is a focus state: the hero copy and the small Websites window fade to about 15% opacity and the stack spreads into the hero's whole width, using transforms only, so nothing reflows and no space is reserved when closed. The Software/Websites switch, the sale buttons and the open/close button stay exactly where they are and stay usable, so a visitor can press a sale and watch it go down. The existing fit test (switch and sale buttons on screen at 1024×768, 1280×720, 1366×768 and up) must keep passing in both states. On phones the same applies within the column.

When a sale is recorded and the stack is open, the sale travels: the interface's new sale row pulses, then each logic step lights in order (about 120 ms apart), then the written tables flash in the data layer and the ingredient counts update. If the stack is closed, the sale updates the dashboard as now and the button shows a one-time hint that the sale also went underneath. The stack never opens by itself on a sale.

**A sale that fails, and Reset.** *(Builder-check call)* A sale refused for lack of stock shows what the real app does (`test_insufficient_stock_rolls_back_all_records`): the logic steps light up to "Work out every new balance before writing anything", that step is marked as stopping the sale with the ingredient that ran short, the later steps stay dark, and the data layer does not change. Reset returns the data layer's rows and counts to the demo's starting state with a short fade, and lights nothing.

The registration marks, the Software/Websites switch and the dimension line stay.

### The hero, Websites (phase 2)

The Thread & Form window gets its own stack with the same component. Draft layers, to be checked against the theme repository: Design (`theme.json` colours and type, the presets the visitor can switch), Interface (the live page), Templates and patterns (the page's sections), Content (the posts and products it shows). The flow runs the other way: choosing a style preset lights the design layer and travels up into the page.

### Phones

Below 768 px the stack is smaller and less tilted. It opens only through the button, with no scroll-driven opening, and the labels sit inside each layer instead of beside it. The full-screen phone demo (`PhoneDemo`) is unchanged.

### Across the site (phase 2 and 3)

- **Services (phase 2).** The four layers in `Services.tsx` (Data, Logic, Interface, Design) become a `LayerStack`. Each service lights the layers it covers. It opens as the section scrolls into view where supported, and is shown open otherwise.
- **Case studies (phase 3).** Each case study opens with its own project's stack, built from that project's "Built with" and architecture list, which are already on its page. This uses no live demo, so it is a lighter, static version that opens on load. *(Builder-check call)* A project's stack has only the layers its own page can back, three or four; no layer is invented to make four, and none is shown empty. Thread & Form's layers come from its theme repository, checked before writing. On Rowszein's Delight the stack opens the page and the existing `SaleTrace` stays further down as the detailed version.

### Phasing

Each phase ships on its own branch and pull request, which the owner merges.

1. The `LayerStack` component and the hero's Software stack with the sale flow.
2. The Websites stack and the Services section.
3. The case study stacks.

## Decided by the owner after the builder check

1. **Resting pose: a gentle tilt.** Closed, the stack sits at a slight 3D angle, enough to read as an object that can open, while the live demo stays easy to read and tap. The full sketch angle is used only when open. Tilting is a parent transform on the scene, not on the screenshot image, so the LCP image itself is not transformed. The unfold entrance now ends at this resting pose, so the test "the timed entrance … leaves no transform behind" changes to check that the entrance ends exactly at the resting pose within the same time limit.
2. **Discovery: a one-time peek, plus the button.** About a second after the live demo is ready, the layers lift slightly apart and settle back (under 1 s in all), once per visit (remembered for the browser session). It is skipped with reduced motion, and skipped if the visitor has already opened the stack, recorded a sale or switched to Websites. The "See what's underneath" button does the full opening.

## Testing and verification

- Unit tests for the mapping from a recorded sale to the layer updates (which steps light, which tables, which counts change), with the step and table names checked against `rowszein-trace.ts`.
- End-to-end: the button opens and closes the stack by mouse and keyboard; a sale with the stack open lights the steps and updates the data layer; reduced motion shows no movement; the early-pick tap still lands; no horizontal overflow at 320, 375, 768, 1280 and 1440 px.
- Screenshots at 375, 768, 1280 and 1440 px in Chromium, Firefox and WebKit, reviewed against these standards.
- Performance: Lighthouse on the production build before and after (LCP, CLS, total JavaScript), and a frame-rate check of the open and close animation and the sale flow with a mid-range phone CPU throttle.

## Left to the builder

- Exact angles, layer gaps, shadows and the label typography.
- How the component's API is shaped, and how a layer's content is passed in.
- The exact wording of the button, the hint and the announcement sentence (plain, specific, in the site's existing voice).
- Which few rows the data layer shows, as long as they come from the live demo state.
