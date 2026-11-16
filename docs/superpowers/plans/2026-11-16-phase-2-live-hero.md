# Phase 2: Live Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the hero's main window interactive. Visitors record sales in a Rowszein's Delight dashboard that follows the real app's stock and profit rules, or restyle the Thread & Form hero from its real theme tokens.

**Architecture:** The sale rules are a pure TypeScript module, ported from the Rowszein's Delight backend and tested on their own. Both demos are client components, code-split with `next/dynamic` and mounted after hydration, when the browser is idle. Until a demo is ready, the frame shows today's static screenshot at the same size, so first paint and LCP don't change. Each demo is laid out at a fixed 16:10 design size in container-query units, so it scales with the frame the way the screenshot does. Its controls sit full size in a strip under the main window. A tiny inline script records hero choices made before hydration, so an early tap is never lost.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules with container queries, next/font, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-16-portfolio-showcase-design.md` (Phase 2 section and the change log; prices are never published)

## Global Constraints

- **Sources are read-only:** the Rowszein's Delight repo at `C:\Users\CARE MBA\Desktop\Rowszein-s-Delight` (`backend/sales/inventory_math.py`, `backend/recipes/models.py`, `backend/ingredients/models.py`, `backend/dashboard/views.py`) and the Thread & Form theme clone in the session scratchpad. Never modify, run or install anything in them.
- **Every live frame carries the label** "Live demo · sample data, running in your browser". The current "Demonstration data" tag stays on static screenshots.
- **First paint stays finished and unchanged:** live demos mount only after hydration plus idle (`requestIdleCallback`, falling back to a 300 ms `setTimeout`), and replace the image only when rendered. No layout shift. The hero LCP element is the same as on `main`.
- **Motion:** transform and opacity only, existing tokens (`--dur-micro`, `--dur-component`, cubic-bezier(0.2, 0.8, 0.2, 1)). With `prefers-reduced-motion: reduce`, values swap with no animation.
- **Accessibility:** controls are real buttons, at least 44×44px, with visible focus. Every sale and every restyle is announced in one polite live region. The live dashboard and theme are `aria-hidden` visuals, because the controls and announcements carry the information. The support frame's live layer is `inert`.
- **Money in the logic is integer centavos; stock is integer quanta of 1e-9** (bigint), as in `inventory_math.py`. Floats never touch either.
- **No prices of the owner's services anywhere.** Product prices inside the demo (₱35 etc.) are the shop's sample data and are fine.
- **Test server:** `.superpowers/tmp/serve-test.sh [--no-build] [playwright args]` (builds, serves on 3001, runs, stops). One server, one browser, `--workers=1`. Never use ports 5173 or 8000.
- **Branch:** `feat/live-hero`, cut from `main`. Commit after each task.
- **Before each UI task (3–5), state the design direction** in one paragraph: type, spacing and token use. No new colours beyond each project's own palette.

## Review Focus

1. A visitor taps a hero control before hydration on a slow phone. The choice must still win once the page hydrates. Covered in Task 5 with JS chunks delayed by network routing.
2. Switching windows back and forth mid-demo must keep the sales already recorded and the chosen colour and type, never reset them. Test in Task 5.
3. Repeated selling until an ingredient runs out must disable that product with a reason, not throw, and must leave every number unchanged. Test in Task 1 (logic) and Task 3 (UI).
4. The live layer must never be visible before it has rendered (no blank or half-styled frame), including with fonts still loading. Test in Task 5: the frame always shows either the image or a rendered demo.
5. With JavaScript disabled, the hero must look exactly like today's. Test in Task 5 with `javaScriptEnabled: false`.

---

### Task 1: Rowszein's Delight sale logic, ported and tested

**Files:**
- Create: `src/data/rowszein-demo.ts` (catalogue)
- Create: `src/lib/rowszein-demo.ts` (pure logic)
- Test: `tests/live-demos.spec.ts` (data-only tests, no page)

**Interfaces:**
- Produces, in `src/data/rowszein-demo.ts`:
  - `DemoIngredient { id: string; name: string; unit: 'kg' | 'g' | 'l' | 'pcs'; costPerUnit: string; minimum: string; start: string }` (decimal strings)
  - `DemoProduct { id: 'classic-glazed' | 'ube-cream' | 'chocolate-dip'; name: string; priceCentavos: number; yieldQuantity: 12; batch: Record<string, string> }`, where `batch` is the base recipe merged with the product's extras
  - `demoIngredients: DemoIngredient[]`
  - `demoProducts: DemoProduct[]`
  - `demoStartTotals = { netSalesCentavos: 18_001_000, expensesCentavos: 11_858_600 }`
- Produces, in `src/lib/rowszein-demo.ts`:
  - `toQuanta(decimal: string): bigint`
  - `cumulativeQuanta(batch: string, yieldQuantity: number, units: number): bigint`
  - `interface DemoState { stock: Record<string, bigint>; sold: Record<string, number>; netSalesCentavos: number; expensesCentavos: number }`
  - `initialState(): DemoState`
  - `recordSale(state: DemoState, productId: DemoProduct['id']): { ok: true; state: DemoState } | { ok: false; shortOf: DemoIngredient }`
  - `lowStock(state: DemoState): DemoIngredient[]`
  - `netProfitCentavos(state: DemoState): number`
  - `costPerPieceCentavos(product: DemoProduct): number`
  - `formatPeso(centavos: number): string` → `"₱180,010.00"`
  - `formatStock(quanta: bigint, unit: DemoIngredient['unit']): string` → `"4.98 kg"`, rounded half-up to 2 places, `pcs` with 0

Catalogue values, verbatim from the seed that produced the walkthrough screenshots:
- **Ingredients** (name, unit, cost, minimum): All-purpose flour kg 58 min 5; White sugar kg 70 min 3; Unsalted butter kg 480 min 2; Eggs pcs 9 min 60; Fresh milk l 95 min 4; Instant yeast g 1.2 min 200; Cocoa powder kg 520 min 1; Powdered sugar kg 90 min 2; Ube halaya kg 360 min 2.
- **Base batch** (yield 12): flour 1.0, white sugar 0.15, butter 0.12, eggs 3, milk 0.3, yeast 14.
- **Products:** Classic Glazed ₱35 + powdered sugar 0.3; Ube Cream ₱55 + ube halaya 0.5; Chocolate Dip ₱40 + cocoa 0.12 + powdered sugar 0.2.
- **Demo start stock** (my call, chosen so a few taps show the alert): flour 5.40; white sugar 20; butter 12; eggs 400; milk 30; yeast 2000; cocoa 6; powdered sugar 2.20; ube halaya 2.30.

Rules to port:
- `cumulativeQuanta` is `inventory_math.cumulative_quanta`: `numerator = toQuanta(batch) * units`, `quotient, remainder = divmod(numerator, yield)`, `+1 if 2*remainder >= yield`.
- A sale of one unit deducts, for each batch ingredient, `cumulativeQuanta(batch, y, sold+1) - cumulativeQuanta(batch, y, sold)` (the allocation cursor).
- If any resulting stock < 0, return `{ ok: false, shortOf }` with the state untouched (`InsufficientStock`).
- Low stock is `quantity <= minimum` (`Ingredient.is_low_stock`).
- Net profit is net sales − expenses; this shop has no partner payouts (`dashboard/views.py`).
- Cost per piece is `round2(round2(Σ qty × cost) / yield)`, using ROUND_HALF_EVEN as Python's `round()` does on Decimal (`Recipe.cost_per_unit`).

- [ ] **Step 1: Write the failing tests** (`test.describe('Rowszein demo logic')`, no `page`):

```ts
expect(cumulativeQuanta('1.0', 12, 1)).toBe(83_333_333n);
expect(cumulativeQuanta('1.0', 12, 12)).toBe(1_000_000_000n);
// Twelve single sales deduct exactly one batch: the cursor never drifts.
let s = initialState(); for (let i = 0; i < 12; i++) s = (recordSale(s, 'classic-glazed') as { ok: true; state: DemoState }).state;
expect(toQuanta('5.40') - s.stock['flour']).toBe(1_000_000_000n);
expect(s.netSalesCentavos).toBe(18_001_000 + 12 * 3500);
expect(netProfitCentavos(s)).toBe(s.netSalesCentavos - 11_858_600);
// Flour turns low on the 5th sale (5.40 - 5/12 = 4.983 <= 5).
let t = initialState(); for (let i = 0; i < 4; i++) t = (recordSale(t, 'ube-cream') as { ok: true; state: DemoState }).state;
expect(lowStock(t).map((i) => i.id)).toEqual([]);
t = (recordSale(t, 'ube-cream') as { ok: true; state: DemoState }).state;
expect(lowStock(t).map((i) => i.id)).toEqual(['flour']);
// Running out refuses the sale and changes nothing.
const empty = { ...initialState(), stock: { ...initialState().stock, 'ube-halaya': 0n } };
const refused = recordSale(empty, 'ube-cream');
expect(refused.ok).toBe(false);
expect((refused as { ok: false; shortOf: DemoIngredient }).shortOf.id).toBe('ube-halaya');
expect(costPerPieceCentavos(demoProducts.find((p) => p.id === 'classic-glazed')!)).toBe(1878);
expect(costPerPieceCentavos(demoProducts.find((p) => p.id === 'ube-cream')!)).toBe(3153);
expect(costPerPieceCentavos(demoProducts.find((p) => p.id === 'chocolate-dip')!)).toBe(2323);
expect(formatPeso(18_001_000)).toBe('₱180,010.00');
expect(formatStock(toQuanta('4.983333333'), 'kg')).toBe('4.98 kg');
```
Ingredient ids are kebab-case names (`flour`, `white-sugar`, `butter`, `eggs`, `milk`, `yeast`, `cocoa`, `powdered-sugar`, `ube-halaya`).

- [ ] **Step 2: Confirm they fail**

Run: `npm run typecheck`
Expected: module-not-found errors for both new files.

- [ ] **Step 3: Implement both modules** to the interfaces above.

- [ ] **Step 4: Run the tests**

Run: `PLAYWRIGHT_BASE_URL=http://localhost:3001 npx playwright test tests/live-demos.spec.ts --project="Desktop Chrome" -g "Rowszein demo logic"`. Setting the URL stops Playwright from starting a dev server; these tests never open a page.
Expected: pass.

- [ ] **Step 5: Commit** `feat: Rowszein's Delight sale rules ported for the live demo`

---

### Task 2: Thread & Form theme data and hero image

**Files:**
- Create: `public/work/thread-and-form/live-hero.jpg` (from the theme's `assets/images/campaign.png`, resized to 900px wide, JPEG quality 80, ≤ 120 KB)
- Modify: `src/data/thread-and-form.ts` (add `liveHero` copy and `stylePresets`)
- Modify: `src/app/layout.tsx`: extend the existing `Plus_Jakarta_Sans` weights to `['400', '600', '800']`, and move the Thread & Form case study's `Playfair_Display` (`--font-playfair`, weight 500, normal and italic) here. Both stay `preload: false`.
- Modify: `src/app/work/thread-and-form/page.tsx`: drop its own Playfair instance and use the root `--font-playfair`, so the font is never loaded twice.
- Test: `tests/live-demos.spec.ts`

**Interfaces:**
- Produces: `liveHero = { tag: 'VOL. 01 / WINTER CAPSULE — PORTO ATELIER', lineOne: 'A study in', lineTwo: 'deliberate form.', lead: <the pattern's lead sentence verbatim>, primary: 'Explore Collection', secondary: 'The Studio Manifesto', image: { src: '/work/thread-and-form/live-hero.jpg', width, height } }`
- Produces: `stylePresets: { id: 'paper' | 'sand' | 'blue' | 'navy'; label: string; ground: string; ink: string; muted: string; accent: string }[]`, built only from `palette` hexes. Paper: ground #fbfaf7, ink #11141a, muted #5c6773, accent #b36b43. Sand: ground #f2eee7, others as Paper. Blue: ground #e2ebf2, others as Paper. Navy: ground #11141a, ink #fbfaf7, muted #e5e0d8, accent #b36b43.
- Produces: `typePairs: { id: 'serif' | 'sans'; label: 'Serif' | 'Sans'; display: string }[]`, mapping Serif to `var(--font-playfair)` and Sans to `var(--font-jakarta)`.

- [ ] **Step 1: Failing test:** every preset colour is one of the `palette` hexes; the image file exists and is ≤ 120 KB (`fs.statSync`).
- [ ] **Step 2: Confirm it fails** (typecheck error, missing exports).
- [ ] **Step 3: Implement.** Convert the image with Python PIL from the scratchpad clone path, so nothing in the clone is executed. Add the font variables to `<html>`.
- [ ] **Step 4: Run the test.** Expected: pass.
- [ ] **Step 5: Commit** `feat: Thread & Form live-demo copy, presets and image`

---

### Task 3: Live dashboard component (software demo)

**Files:**
- Create: `src/components/live/LiveDashboard.tsx` + `LiveDashboard.module.css`
- Create: `src/components/live/SaleControls.tsx`
- Test: `tests/live-demos.spec.ts`. These UI tests are written now and pass once Task 5 mounts the component in the hero.

**Interfaces:**
- Consumes: Task 1 logic.
- Produces: `LiveDashboard({ state }: { state: DemoState })`, which is purely presentational: the owner-panel look (white panel, pink accent as in the screenshots) at a 16:10 design size in `cqi` units. It shows the "Business Overview" header, KPI tiles (Net sales, Net profit, Low stock count), stock meters for flour, powdered sugar and ube halaya (fill = quantity ÷ (minimum × 3), capped at 100%), and the yellow low-stock alert naming the first low ingredient. A changed value pulses once (opacity/transform).
- Produces: `SaleControls({ state, onSell, onReset, announce })` with three buttons ("Sell 1 Classic Glazed" etc., showing ₱ price), a "Reset demo" button, and a disabled state with its reason ("Not enough ube halaya for one more"). After a sale it announces `Sold 1 Ube Cream for ₱55.00. Net sales ₱180,065.00. Earned ₱23.47 over recipe cost.`, followed by ` Flour is now low.` when that changes.

UI tests (written now, green after Task 5):
- Selling Ube Cream five times shows the low-stock alert containing "All-purpose flour", and the live region text contains "Flour is now low."
- Net sales after three Classic Glazed reads `₱180,115.00`.
- Reset restores `₱180,010.00` and clears the alert.

- [ ] Steps: write the UI tests → implement → typecheck/lint → commit `feat: live Rowszein's Delight dashboard and sale controls`

---

### Task 4: Live theme component (website demo)

**Files:**
- Create: `src/components/live/LiveTheme.tsx` + `LiveTheme.module.css`
- Create: `src/components/live/StyleControls.tsx`
- Test: `tests/live-demos.spec.ts`

**Interfaces:**
- Consumes: Task 2 data.
- Produces: `LiveTheme({ preset, type }: { preset: StylePreset; type: TypePair })`, the theme's hero region (season tag, two-line headline with the italic second line, lead, two actions, image) at a 16:10 design size in `cqi` units. Colours and the display font come from CSS custom properties set from `preset` and `type`, so a change restyles everything at once (colour transition 200 ms; none under reduced motion).
- Produces: `StyleControls({ preset, type, onPreset, onType, announce })`: a radio group of four swatches labelled by preset name, and a two-option radio group "Serif / Sans", with arrow-key behaviour like the hero switch. It announces `Thread & Form restyled: Navy, Serif.`

UI tests (green after Task 5): choosing Navy sets the live frame's computed background to `rgb(17, 20, 26)`; choosing Sans changes the headline's computed font-family to include "Plus Jakarta Sans"; arrow keys move between swatches.

- [ ] Steps: write the UI tests → implement → typecheck/lint → commit `feat: live Thread & Form restyle demo`

---

### Task 5: Integrate into the hero, keep early taps, label and verify

**Files:**
- Modify: `src/components/HeroShowcase.tsx` + `HeroShowcase.module.css`
- Create: `src/components/live/useIdleMount.ts`
- Test: `tests/homepage.spec.ts`, `tests/live-demos.spec.ts`

**Interfaces:**
- Consumes: Tasks 3–4.
- Produces: `useIdleMount(): boolean`, true after hydration plus idle.
- HeroShowcase owns the demo state (`useReducer` for `DemoState`; `useState` for preset and type), so switching windows never resets it.
- Each window gets a live layer, loaded with `next/dynamic({ ssr: false })` and absolutely positioned over the image at the frame's size. It is visible only when the window is primary and rendered (`data-live="ready"`). In the support window it stays mounted but hidden and `inert`.
- A control strip under the primary window shows `SaleControls` or `StyleControls` for the selected project, plus the live label. On phones it wraps under the caption.
- The window chip label "Web & Experiences" becomes "Websites".
- **Early taps:** an inline `<script>`, rendered before the hero markup, listens for clicks on `[data-hero-pick]` until hydration and stores the id in `document.documentElement.dataset.heroPick`. On mount, HeroShowcase applies it with the same handoff a normal click uses, then deletes it. Radios get `data-hero-pick={id}`.

- [ ] **Step 1: Failing tests**
  - Pre-hydration tap: in a test with `page.route('**/_next/static/chunks/**')` delaying chunks by 1500 ms, `goto` with `waitUntil: 'commit'`, click the Websites radio, then expect `aria-checked="true"` within 5 s.
  - Persistence: sell 2 Ube Cream, switch to Websites, choose Navy, switch back. Net sales still reads `₱180,120.00`; switching to Websites again still shows Navy.
  - No JS: with a new `javaScriptEnabled: false` context, the hero shows both `img` elements and no `[data-live]` layer.
  - Never blank: from `commit` until 3 s, polled every 100 ms, the primary frame always has either a fully opaque image or `data-live="ready"` (never neither).
  - Label: the primary frame shows "Live demo · sample data, running in your browser" once live.
  - Plus Task 3's and Task 4's UI tests.
- [ ] **Step 2: Confirm they fail** against a fresh build.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** `-g "live|hero|Hero|First load|Responsive boundaries|handoff|dimension"` on both projects. Expected: all pass.
- [ ] **Step 5: Commit** `feat: live demos in the hero, with early taps kept`

---

### Task 6: Phase verification and release

- [ ] **Full suite** on a fresh build: 0 failed.
- [ ] **Performance check:** first-load JS for `/` from the `next build` output; the live demos must be separate chunks. Compare LCP on `main` and on this branch: 5 loads each at 1440 and at 390 (with 4× CPU throttling via CDP), median within +100 ms.
- [ ] **Screenshots** at 375, 768, 1280 and 1440 of both demos before and after interaction, reviewed against the global standards. Fix anything found, with a test where it's behavioural.
- [ ] **Final whole-branch review** (fresh reviewer), with the Review Focus above.
- [ ] **Owner review, then release:** fast-forward `main`, push, and check the live site.
