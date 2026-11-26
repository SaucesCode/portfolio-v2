# Exploded stack, phase 1: implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The hero's Rowszein's Delight window becomes a four-layer 3D stack (design, interface, logic, data) that rests at a gentle tilt, opens and closes with a button, peeks once per visit, and shows each recorded sale travelling through the real app's steps and tables.

**Architecture:** A generic `LayerStack` component draws layers in a CSS `preserve-3d` scene inside the software window. Its tilt lives on an inner scene element, so the window keeps its existing FLIP handoff and unfold untouched. One React state (`stackOpen`) in `HeroShowcase` drives the button, the focus state and the visuals. A pure function maps each demo event (sold, refused, reset) to a `StackFlow` that the logic and data layers render. Everything they name comes from `src/data/rowszein-trace.ts`.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, Playwright (unit and end-to-end). No new dependencies.

**Spec:** `docs/superpowers/specs/2026-11-26-exploded-stack-design.md` (phase 1 only).

## Global Constraints

- No new dependencies. CSS 3D only; no WebGL.
- Animate only `transform` and `opacity` (`filter` on at most one layer at a time, and only if it holds 60 fps).
- Motion tokens from `src/app/globals.css`: open and close use `--dur-page` (420 ms) with `--ease-in-out`. The per-layer stagger is 40 ms, and logic steps light about 120 ms apart.
- LCP stays the hero screenshot, and the screenshot `<img>` itself is never transformed by the stack (the tilt is on a parent). CLS under 0.1: opening and closing never changes layout size.
- Every step title and table name shown comes from `traceSteps` and `tableGroups` in `src/data/rowszein-trace.ts`. The data layer shows only live demo state and is labelled as demonstration data.
- The 3D layers are `aria-hidden`. Information reaches assistive tech through the toggle button (`aria-pressed`) and the existing status announcement.
- `prefers-reduced-motion: reduce`: nothing slides apart, travels or peeks. Open and closed swap with a short fade, and sales update the layers in place.
- Touch targets at least 44×44 px. WCAG 2.2 AA contrast for every label on a layer.
- The early-pick script, the Software/Websites switch and handoff, the dimension line, `PhoneDemo` and every existing test keep working.
- This machine is low on RAM: one production server (port 3001) and one browser at a time. End-to-end runs go through `bash .superpowers/tmp/serve-test.sh [--no-build] <playwright args>`.

## Review Focus

1. **Rapid toggling mid-transition.** Pressing the button several times quickly must end in the state of the last press, with `aria-pressed` and the visuals agreeing. Test in Task 2.
2. **Several sales in quick succession while open.** Each sale restarts the flow, nothing piles up, and the data layer shows every sale. Test in Task 3.
3. **Switching to Websites while open, then back.** The stack closes, the focus state clears and the copy is fully visible again. Test in Task 2.
4. **Resizing while open (a phone rotating, a window narrowing).** No horizontal overflow, and the stack stays inside the hero. Test in Task 5.
5. **The peek colliding with an early action.** A click on the switch or a sale during the peek's wait cancels the peek, and the handoff still lands. Test in Task 4.

---

### Task 1: Demo events and the flow mapping

**Files:**
- Modify: `src/components/live/useRowszeinDemo.ts`
- Create: `src/lib/stack-flow.ts`
- Test: `tests/stack-flow.spec.ts` (unit tests in Playwright, no server, like the "Site knowledge" block in `tests/ask.spec.ts`)

**Interfaces:**
- Produces, in `useRowszeinDemo.ts`: `RowszeinDemo` gains `event: DemoEvent | null`, where
  `export type DemoEvent = { key: number; kind: 'sold'; productId: DemoProduct['id'] } | { key: number; kind: 'refused'; productId: DemoProduct['id']; shortOf: DemoIngredient } | { key: number; kind: 'reset' }`.
  `key` increases on every `sell` and `reset` call, refusals included. `sell` and `reset` keep returning their existing announcement strings unchanged.
- Produces, in `stack-flow.ts`:
  - `export interface StackFlow { key: number; lit: number; stoppedAt: number | null; shortOf: string | null; written: Table[] }`. `lit` is how many logic steps light, counted from the first.
  - `export function flowFor(event: DemoEvent | null): StackFlow | null`. Returns `null` for `null` and for `reset`.
  - `export function describeFlow(flow: StackFlow): string`

- [ ] **Step 1: Write the failing tests** in `tests/stack-flow.spec.ts`:

```ts
import { expect, test } from '@playwright/test';
import { tableGroups, traceSteps } from '../src/data/rowszein-trace';
import { demoIngredients } from '../src/data/rowszein-demo';
import { describeFlow, flowFor } from '../src/lib/stack-flow';

const flour = demoIngredients.find((i) => i.id === 'flour')!;
const allTables = tableGroups.flatMap((g) => g.tables.map((t) => t.table));

test.describe('Stack flow', () => {
  test('a sale lights every step and writes what step five writes, in table order', () => {
    const flow = flowFor({ key: 3, kind: 'sold', productId: 'ube-cream' })!;
    expect(flow).toMatchObject({ key: 3, lit: traceSteps.length, stoppedAt: null, shortOf: null });
    const step5 = traceSteps.find((s) => s.title === 'Write the sale and its paper trail')!;
    const expected = allTables.filter((t) => step5.touches[t] === 'write');
    expect(flow.written).toEqual(expected);
    expect(flow.written).toContain('Sale');
    expect(flow.written).not.toContain('Recipe');
  });

  test('a refused sale stops at the balance check and writes nothing', () => {
    const flow = flowFor({ key: 4, kind: 'refused', productId: 'classic-glazed', shortOf: flour })!;
    const stop = traceSteps.findIndex((s) => s.title === 'Work out every new balance before writing anything');
    expect(flow).toEqual({ key: 4, lit: stop + 1, stoppedAt: stop, shortOf: 'all-purpose flour', written: [] });
  });

  test('reset and no event light nothing', () => {
    expect(flowFor({ key: 5, kind: 'reset' })).toBeNull();
    expect(flowFor(null)).toBeNull();
  });

  test('the sentences say what happened underneath', () => {
    expect(describeFlow(flowFor({ key: 1, kind: 'sold', productId: 'ube-cream' })!)).toBe(
      'Underneath, the real app writes this sale and its paper trail in one transaction.',
    );
    expect(describeFlow(flowFor({ key: 2, kind: 'refused', productId: 'ube-cream', shortOf: flour })!)).toBe(
      'Underneath, the real app checks every balance first; with too little all-purpose flour it writes nothing.',
    );
  });
});
```

- [ ] **Step 2: Run them to see them fail**

Run: `PLAYWRIGHT_BASE_URL=http://localhost:3999 npx playwright test tests/stack-flow.spec.ts --project="Desktop Chrome" --workers=1`
Expected: FAIL, because `src/lib/stack-flow` cannot be resolved.

- [ ] **Step 3: Implement `flowFor` and `describeFlow` in `src/lib/stack-flow.ts`, and the `event` field in `useRowszeinDemo.ts`**

Find the steps by title, never by a hard-coded index. `written` is `tableGroups` order filtered by the "Write the sale and its paper trail" step's `'write'` touches. `shortOf` is the ingredient name in lower case, matching the existing "Not enough …" announcement. In the hook, keep `event` and `next` in the same state object as `state` and `recent`, so a refusal sets `event` without touching the figures. Reset sets `event: { key, kind: 'reset' }` and returns the figures to `START`.

- [ ] **Step 4: Run the tests to see them pass**, then `npm run typecheck` and `npx eslint src tests`.

Expected: 4 passed; no type or lint errors.

- [ ] **Step 5: Commit**

```bash
git add src/lib/stack-flow.ts src/components/live/useRowszeinDemo.ts tests/stack-flow.spec.ts
git commit -m "feat: demo events and the flow a sale takes through the real app"
```

---

### Task 2: LayerStack and the hero's software stack (rest, open, close, focus)

**Files:**
- Create: `src/components/stack/LayerStack.tsx`, `src/components/stack/LayerStack.module.css`
- Create: `src/components/stack/RowszeinLayers.tsx`, `src/components/stack/RowszeinLayers.module.css`
- Create: `src/components/stack/StackToggle.tsx` (its styles may live in `src/components/live/LiveControls.module.css` beside the sale chips)
- Modify: `src/components/HeroShowcase.tsx`, `src/components/HeroShowcase.module.css`
- Test: `tests/stack.spec.ts`

**Interfaces:**
- Consumes: nothing from Task 1 yet (the layers render with `flow = null`).
- Produces:
  - `export interface StackLayer { id: string; label: string; offset: number; content: ReactNode; hiddenWhenClosed?: boolean }`. `offset` is the layer's position relative to the interface: Design `1`, Interface `0`, Logic `-1`, Data `-2`.
  - `export function LayerStack({ layers, open, peek = false }: { layers: StackLayer[]; open: boolean; peek?: boolean }): JSX.Element`. It renders a scene element with `data-stack-scene`, `data-open={open}` and `data-peek={peek}`, and one element per layer with `data-layer={id}`.
  - `export function DesignLayer(): JSX.Element`, `export function LogicLayer({ flow }: { flow: StackFlow | null }): JSX.Element`, `export function DataLayer({ state, recent, flow }: { state: DemoState; recent: RecentSale[]; flow: StackFlow | null }): JSX.Element`
  - `export function StackToggle({ open, onToggle }: { open: boolean; onToggle: () => void }): JSX.Element`. A `<button type="button" aria-pressed={open}>` labelled "See what's underneath" when closed and "Put it back together" when open.
  - In `HeroShowcase`: `const [stackOpen, setStackOpen] = useState(false)`; `choose('web')` sets it to `false`; the hero root gets `data-stack={stackOpen ? 'open' : 'closed'}` on the software selection.

- [ ] **Step 1: Write the failing end-to-end tests** in `tests/stack.spec.ts` (desktop project unless noted; wait for `[data-live="ready"]` first as the fit test does):

  - `the stack rests closed at a gentle tilt and the window itself carries no transform`: the scene's computed `transform` is not `none`; both `[data-role]` windows compute `none`; the toggle has `aria-pressed="false"` and the text "See what's underneath"; the `design` layer's computed opacity is `0`.
  - `the button opens and closes the stack, by mouse and keyboard`: click → `aria-pressed="true"`, text "Put it back together", hero `data-stack="open"`, scene `data-open="true"`. Then focus it and press `Space` → closed; press `Enter` → open.
  - `rapid presses end in the state of the last press`: five clicks with no waits → `aria-pressed="true"` and `data-open="true"`; after `--dur-page` plus a margin, the scene's `getAnimations()` and running transitions have settled and still read open.
  - `opening never changes the hero's layout size`: the hero's `getBoundingClientRect()` width and height are equal closed and open (transforms only).
  - `switching to Websites closes the stack and clears the focus state`: open, then choose Websites → toggle not rendered, hero has no `data-stack="open"`, and `.copy`'s computed opacity is `1`. Choose Software → the stack is closed.
  - `the open stack names the real steps and tables`: open → the logic layer contains every `traceSteps[i].title`; the data layer contains every `tableGroups[i].name` and every table name.
  - `with the stack open, the switch and sale buttons stay on screen at laptop sizes`: for `[1024,768], [1280,720], [1366,768], [1440,900]`, open the stack and assert the same `heroBottom <= height` check as `tests/homepage.spec.ts` "the hero and the tour fit on common laptop screens", with the toggle included in the measured buttons.
  - `no horizontal overflow with the stack open` (both projects): at widths 320, 375, 768, 1280 and 1440, open the stack and assert `document.documentElement.scrollWidth <= innerWidth`.

- [ ] **Step 2: Run them to see them fail**

Run: `bash .superpowers/tmp/serve-test.sh tests/stack.spec.ts`
Expected: FAIL, because there is no `[data-stack-scene]` or toggle button.

- [ ] **Step 3: Implement `LayerStack`**

The scene is `transform-style: preserve-3d` with a parent `perspective`. Starting values (tune visually; the exact angles are left to the builder):

| State | Scene transform | Layer transform |
|---|---|---|
| Closed (rest) | `rotateX(9deg) rotateY(-11deg)` | `translateZ(calc(var(--offset) * 3px))`, so the slab's edges show |
| Open | `rotateX(56deg) rotateZ(-34deg) scale(0.8)` | `translateZ(calc(var(--offset) * var(--gap)))`, `--gap: clamp(56px, 7vw, 120px)` |

Transitions use `--dur-page` and `--ease-in-out`, with each layer delayed `calc(abs(var(--offset)) * 40ms)`. `hiddenWhenClosed` layers are `opacity: 0` when closed. Every layer except the interface has `pointer-events: none`. Each layer carries its `label` as a small tab at its top-left edge, which must meet AA contrast. The stack does not change the window's layout box.

- [ ] **Step 4: Implement the Rowszein layers and wire them into `HeroShowcase`**

Only in the software window, wrap the existing `.frame` (image, live layer, demo label) as the `interface` layer, offset `0`, label "Interface". Add `design` (offset `1`, `hiddenWhenClosed`, label "Design": the dashboard miniature's own colour swatches and a type sample, taken from `src/components/live/LiveDashboard.module.css`), `logic` (offset `-1`, label "Logic": each `traceSteps` title as one line) and `data` (offset `-2`, label "Data · demonstration data": one card per `tableGroups` group listing its tables). The registration marks and `.tag` stay on the window, and the dimension line still targets `windows.current.software`.

`StackToggle` renders in the software branch of `.tryRow`, before `SaleControls`. Focus state, under `.hero[data-stack="open"]`: `.headline`, `.copy`, `.window[data-role="support"]` and `.thread` go to `opacity: 0.15` over `--dur-component`. While open, the software window's `z-index` rises above the support window.

- [ ] **Step 5: Run the stack tests, then the existing hero tests**

Run: `bash .superpowers/tmp/serve-test.sh --no-build tests/stack.spec.ts tests/homepage.spec.ts tests/live-demos.spec.ts` (after one build)
Expected: all pass, including "the timed entrance … leaves no transform behind" and the laptop fit test unchanged.

- [ ] **Step 6: Commit**

```bash
git add src/components/stack src/components/HeroShowcase.tsx src/components/HeroShowcase.module.css src/components/live/LiveControls.module.css tests/stack.spec.ts
git commit -m "feat: the hero's app opens into its design, interface, logic and data layers"
```

---

### Task 3: A sale travels through the layers

**Files:**
- Modify: `src/components/stack/RowszeinLayers.tsx`, `src/components/stack/RowszeinLayers.module.css`, `src/components/stack/StackToggle.tsx`, `src/components/HeroShowcase.tsx`
- Test: `tests/stack.spec.ts`

**Interfaces:**
- Consumes: `demo.event`, `flowFor`, `describeFlow` and `StackFlow` from Task 1; `LogicLayer`, `DataLayer`, `StackToggle` and `stackOpen` from Task 2.
- Produces: `StackToggle` gains `hint: boolean`, which shows the visible text "Your sale went underneath too" beside the button, tied to it with `aria-describedby`.

- [ ] **Step 1: Write the failing tests** in `tests/stack.spec.ts`:
  - `a sale with the stack open lights every step and lands in the data layer`: open; click "Sell 1 Ube Cream …" → within 2 s the logic layer has 6 `[data-lit="true"]` steps and 0 `[data-stopped]`; the `Sale` card contains "Ube Cream"; the `Ingredient` card's flour figure differs from before the sale; the `role="status"` text contains "Underneath, the real app writes this sale and its paper trail in one transaction."
  - `three quick sales all land and the flow ends lit`: open; click three products with no waits → the `Sale` card lists all three names, and the logic layer ends with 6 lit steps.
  - `a sale with the stack closed updates the dashboard and hints once`: sell while closed → the status has no "Underneath" sentence, the hint text is visible, and the stack is still closed. Open, close and sell again → no hint.
  - `a refused sale stops at the balance check and writes nothing`: use the stock-out loop from `tests/live-demos.spec.ts` around line 300 until the button has `aria-disabled="true"`. Open; record the data layer's text; click the refused product → 4 lit steps, the step titled "Work out every new balance before writing anything" has `data-stopped` and contains "all-purpose flour", no card has `data-written`, and the data layer's text is unchanged.
  - `reset returns the data layer to the start and lights nothing`: open; sell twice; press "Reset demo" → 0 lit steps, the `Sale` card has no rows, and the flour figure equals its starting value from page load.

- [ ] **Step 2: Run them to see them fail**

Run: `bash .superpowers/tmp/serve-test.sh tests/stack.spec.ts -g "sale|reset"`
Expected: FAIL, with no `[data-lit]` steps.

- [ ] **Step 3: Implement the flow in the layers**

In `HeroShowcase`, `const flow = useMemo(() => flowFor(demo.event), [demo.event])`. When `stackOpen` and the flow is not null, the status announcement becomes `sell(...)`'s sentence plus a space plus `describeFlow(flow)`. Do this in the announce callback passed to `SaleControls`, without changing `SaleControls`.

`LogicLayer` keys its step list on `flow?.key`, so every new event replays: step `i` gets `data-lit` when `i < flow.lit`, `data-stopped` when `i === flow.stoppedAt` (plus "Stopped: not enough {shortOf}"), and `transition-delay: calc(var(--order) * 120ms)`. `DataLayer` cards get `data-written` when their table is in `flow.written`, with a one-shot highlight keyed on `flow.key`. The `Ingredient` card shows flour, powdered sugar and ube halaya with `formatStock`; the `Sale` card shows `recent`. The hint shows on the first `sold` event while closed, once per page, and hides when the stack opens.

- [ ] **Step 4: Run the stack tests and the live-demo tests**

Run: `bash .superpowers/tmp/serve-test.sh tests/stack.spec.ts tests/live-demos.spec.ts`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/stack src/components/HeroShowcase.tsx tests/stack.spec.ts
git commit -m "feat: a recorded sale travels through the real app's steps and tables"
```

---

### Task 4: The one-time peek

**Files:**
- Create: `src/components/stack/usePeek.ts`
- Modify: `src/components/HeroShowcase.tsx`, `src/components/stack/LayerStack.module.css`
- Test: `tests/stack.spec.ts`

**Interfaces:**
- Consumes: `LayerStack`'s `peek` prop (Task 2); `liveReady.software`.
- Produces: `export function usePeek({ ready, interacted }: { ready: boolean; interacted: boolean }): boolean`, with `PEEK_DELAY_MS = 1000`, `PEEK_MS = 900` and the session key `'stack-peeked'`.

- [ ] **Step 1: Write the failing tests** in `tests/stack.spec.ts`:
  - `the stack peeks once per visit`: load, wait for `[data-live="ready"]` → within 3 s the scene has `data-peek="true"`, then `"false"` again; `sessionStorage['stack-peeked'] === '1'`. Reload → no `data-peek="true"` within 3 s of ready.
  - `no peek under reduced motion`: `page.emulateMedia({ reducedMotion: 'reduce' })`, load → no `data-peek="true"` within 3 s of ready.
  - `an early action cancels the peek and the handoff still lands`: as soon as `[data-live="ready"]`, click the Websites switch → no `data-peek="true"` within 3 s; `[data-id="web"]` has `data-role="primary"`. A second case does the same with a sale instead of the switch.
  - `the peek works where storage is blocked`: block `sessionStorage` with an init script, as `tests/ask.spec.ts` "the panel works where storage is blocked" does → the page has no errors and the peek still runs once.

- [ ] **Step 2: Run them to see them fail**

Run: `bash .superpowers/tmp/serve-test.sh tests/stack.spec.ts -g peek`
Expected: FAIL, because `data-peek` never becomes `"true"`.

- [ ] **Step 3: Implement `usePeek` and the peek motion**

The hook returns `true` for `PEEK_MS`, starting `PEEK_DELAY_MS` after `ready` turns true. It never peeks when reduced motion matches, when the session key is set, or when `interacted` is true before it starts; `interacted` turning true during the wait cancels it. Storage access can throw where blocked: catch only that access, treat it as "not yet peeked", and say why in a comment. `interacted` in `HeroShowcase` becomes true on the first toggle, sale, reset or switch to Websites. CSS: under `[data-peek="true"]`, the closed layers spread to `translateZ(calc(var(--offset) * 16px))` and back within `PEEK_MS` (one keyframe animation, `--ease-in-out`), declared only under `prefers-reduced-motion: no-preference`.

- [ ] **Step 4: Run the peek tests and the whole homepage suite**

Run: `bash .superpowers/tmp/serve-test.sh tests/stack.spec.ts tests/homepage.spec.ts`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/stack/usePeek.ts src/components/stack/LayerStack.module.css src/components/HeroShowcase.tsx tests/stack.spec.ts
git commit -m "feat: the stack peeks open once per visit to show it opens"
```

---

### Task 5: Phones, reduced motion, and the full verification

**Files:**
- Modify: `src/components/stack/LayerStack.module.css`, `src/components/stack/RowszeinLayers.module.css`
- Test: `tests/stack.spec.ts`

- [ ] **Step 1: Write the failing tests** in `tests/stack.spec.ts`:
  - `under reduced motion, opening fades instead of moving`: emulate reduce; open → `data-open="true"`, and no running animation or transition on the scene or layers animates `transform` (inspect `getAnimations()` for `transform` keyframes and `transitionProperty` for `transform`).
  - `on phones the open stack fits the column with labels inside the layers` (Mobile Chrome project): open → no horizontal overflow, every `[data-layer]`'s bounding box lies within `0..innerWidth`, and the toggle is at least 44×44 px.
  - `resizing while open keeps the stack inside the hero`: at 1280×800, open; resize to 375×812 → no horizontal overflow, and the scene's bounding box lies within the hero's.

- [ ] **Step 2: Run them to see them fail**

Run: `bash .superpowers/tmp/serve-test.sh tests/stack.spec.ts -g "reduced|phones|resizing"`
Expected: FAIL in at least the reduced-motion and phone cases.

- [ ] **Step 3: Implement the phone layout and reduced motion**

Below 768 px: open scene `rotateX(48deg) rotateZ(-24deg) scale(0.9)`, `--gap: 44px`, and labels positioned inside each layer. Under `prefers-reduced-motion: reduce`: no transform transitions or animations on the scene or layers. The open and closed states swap instantly, with a `--dur-micro` opacity fade-in on the scene, keyed on the open value.

- [ ] **Step 4: Run the full suite with a fresh build**

Run: `bash .superpowers/tmp/serve-test.sh`
Expected: every test passes (the suite has 326 passing tests before this branch, plus the new ones).

- [ ] **Step 5: Visual and performance check**

- Screenshots, closed and open, at 375, 768, 1280 and 1440 px in Chromium, Firefox and WebKit (`npx playwright` against `http://localhost:3001`). Review them against the spec and the global standards: hierarchy, contrast and alignment.
- On the production build at 1280×800, measure LCP (its element must still be the hero screenshot), CLS (under 0.1) and total script transfer, before (on `main`) and after. The script added must be under 15 KB.
- Frame rate: with Chromium's CPU throttling at 4× (through the CDP `Emulation.setCPUThrottlingRate`), count `requestAnimationFrame` callbacks across an open, a close and one sale flow. Expect at least 50 fps.

- [ ] **Step 6: Commit**

```bash
git add src/components/stack tests/stack.spec.ts
git commit -m "feat: the stack on phones and under reduced motion"
```
