# Project Form and Phone Demo View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Visitors can send a project inquiry from any "Start a project" button without a mail app, and phone visitors can use the Rowszein demo full screen in a phone layout.

**Architecture:** A pure `src/lib/inquiry/` core (field rules shared by panel and server, email composition) behind `POST /api/inquiry`, which reuses the assistant's origin check and one-round-trip `CounterStore.admit`, and sends through Resend's REST API. One client `InquiryPanel` mounted in the root layout intercepts clicks on links marked `data-inquiry`. The phone view is a `<dialog>` in the hero that renders `LiveDashboard layout="phone"` from the hero's existing demo state.

**Tech Stack:** Next.js 16 App Router (read `node_modules/next/dist/docs/` for route handlers before writing one), React 19, TypeScript, CSS Modules + Tailwind 4, Upstash REST, Resend REST, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-17-inquiry-form-and-phone-demo-design.md`

## Global Constraints

- No prices and no budget field anywhere.
- The visitor's name, email and message never appear in logs.
- The email body is plain text only (`text`, no `html`).
- Field rules (spec): need is required, one of `system` "A business system or web app", `wordpress` "A WordPress site", `website` "A website or landing page", `unsure` "Not sure yet". Message is required, 20–2,000 characters after trimming. Timeline is optional, one of `asap` "As soon as possible", `month` "Within a month", `quarter` "In 1–3 months", `flexible` "Flexible". Name is required, 1–100 characters. Email is required and must be valid.
- Limits: 3 per hour and 6 per day per visitor, 40 per day for the site, kill switch Redis key `inquiry:enabled` = "0".
- Bots: a filled honeypot field `company`, or less than 3,000 ms between `startedAt` and arrival, gets 200 `{ ok: true }` and nothing is sent.
- Resend: `POST {RESEND_BASE_URL ?? 'https://api.resend.com'}/emails` with Bearer `RESEND_API_KEY`, an `Idempotency-Key` header, and an 8 s timeout. From is `RESEND_FROM ?? 'Portfolio <onboarding@resend.dev>'`, to is `INQUIRY_TO ?? site.email`, `reply_to` is the visitor. Subject is `Project inquiry: {need label} from {name}`.
- Copy under the Send button: "James replies within one business day." Below it: "Your message is emailed to James; this site doesn't store it."
- Touch targets ≥ 44×44 px; every control has hover, focus-visible, active, disabled and loading states; reduced motion gets a plain fade.
- The phone view appears only below 600 px (`37.5rem`, the hero's existing breakpoint).
- Never use ports 5173 or 8000. Never read or print `.env.local` or keys.

## Review Focus

1. **Double click or network retry on Send:** exactly one email goes out (same `Idempotency-Key`). Test in Task 2.
2. **A message with HTML or line breaks:** it arrives as literal text and shows as text in the panel. Test in Task 1.
3. **An email typed with spaces or capitals:** it is trimmed and accepted, and `reply_to` uses the trimmed value. Test in Task 1.
4. **A visitor with a saved draft opens the form from a case study:** the draft is kept, and the case study's opening line is used only when the message is empty. Test in Task 3.
5. **A phone rotated or resized past 600 px while full screen:** the view closes itself, focus returns, and nothing scrolls sideways. Test in Task 4.

---

### Task 1: Inquiry rules and email text

**Files:**
- Create: `src/lib/inquiry/rules.ts`, `src/lib/inquiry/email.ts`
- Test: `tests/inquiry.spec.ts` (node-side `test.describe('Inquiry rules')`, the same style as the unit tests in `tests/ask.spec.ts`)

**Interfaces:**
- Produces:
  - `type Need = 'system' | 'wordpress' | 'website' | 'unsure'`
  - `type Timeline = 'asap' | 'month' | 'quarter' | 'flexible'`
  - `const needs: { id: Need; label: string }[]` and `const timelines: { id: Timeline; label: string }[]`
  - `interface Inquiry { need: Need; message: string; timeline?: Timeline; name: string; email: string }`
  - `type Field = 'need' | 'message' | 'timeline' | 'name' | 'email'`
  - `checkField(field: Field, value: string): string | null`, which returns the error copy or null and is used by the panel on blur
  - `parseInquiry(body: unknown): { ok: true; inquiry: Inquiry } | { ok: false; field: Field; message: string }`, which trims every string and lower-cases nothing
  - `composeInquiryEmail(inquiry: Inquiry): { subject: string; text: string }`
- Error copy (exact):
  - need: "Choose what you need."
  - message empty: "Tell me a little about the project."
  - message under 20 characters: "A bit more detail, please: at least 20 characters."
  - message over 2,000: "Keep it under 2,000 characters."
  - timeline invalid: "Choose one of the options."
  - name: "Add your name."
  - name over 100: "Keep your name under 100 characters."
  - email empty: "Add an email address James can reply to."
  - email invalid: "That email address doesn't look right."

- [ ] **Step 1: Write the failing tests**

```ts
test('accepts a complete inquiry and trims it', () => {
  const r = parseInquiry({ need: 'system', message: '  We need stock tracking for two shops.  ', name: ' Ana ', email: '  Ana@Example.com ' });
  expect(r).toEqual({ ok: true, inquiry: { need: 'system', message: 'We need stock tracking for two shops.', name: 'Ana', email: 'Ana@Example.com' } });
});
test('names the first invalid field with its message', () => {
  expect(parseInquiry({ need: 'x', message: 'a'.repeat(30), name: 'A', email: 'a@b.co' })).toMatchObject({ ok: false, field: 'need', message: 'Choose what you need.' });
  expect(parseInquiry({ need: 'system', message: 'too short', name: 'A', email: 'a@b.co' })).toMatchObject({ field: 'message', message: 'A bit more detail, please: at least 20 characters.' });
  expect(parseInquiry({ need: 'system', message: 'a'.repeat(2001), name: 'A', email: 'a@b.co' })).toMatchObject({ field: 'message' });
  expect(parseInquiry({ need: 'system', message: 'a'.repeat(30), name: '', email: 'a@b.co' })).toMatchObject({ field: 'name' });
  expect(parseInquiry({ need: 'system', message: 'a'.repeat(30), name: 'A', email: 'not-an-email' })).toMatchObject({ field: 'email', message: "That email address doesn't look right." });
  expect(parseInquiry({ need: 'system', message: 'a'.repeat(30), name: 'A', email: 'a@b.co', timeline: 'never' })).toMatchObject({ field: 'timeline' });
});
test('the email is plain text and keeps what the visitor typed literally', () => {
  const { subject, text } = composeInquiryEmail({ need: 'wordpress', timeline: 'month', name: 'Ana', email: 'ana@example.com', message: '<b>Hi</b>\nLine two' });
  expect(subject).toBe('Project inquiry: A WordPress site from Ana');
  expect(text).toContain('<b>Hi</b>\nLine two');
  expect(text).toContain('When: Within a month');
  expect(text).toContain('Reply to this email to answer Ana (ana@example.com).');
});
```

- [ ] **Step 2: Run them and check they fail**

Run: `npx playwright test tests/inquiry.spec.ts -g "Inquiry rules" --project="Desktop Chrome"`. These are node-side tests, so no server is needed. Expected: FAIL, because the module isn't found.

- [ ] **Step 3: Implement `rules.ts` and `email.ts`**

The email check is `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` after trimming. The text body has these lines, in order: Need, When (or "When: Not given"), From name and email, a blank line, the message, a blank line, then the reply line.

- [ ] **Step 4: Run the tests and check they pass.** Then run `npm run -s typecheck && npm run -s lint`.

- [ ] **Step 5: Commit** with `git commit -m "feat: inquiry field rules and plain-text email"`.

### Task 2: `POST /api/inquiry`

**Files:**
- Create:
  - `src/app/api/inquiry/route.ts`
  - `src/lib/inquiry/limits.ts`
  - `src/lib/inquiry/send.ts`
  - `src/lib/inquiry/log.ts`
  - `src/lib/request.ts`
  - `tests/fixtures/resend-mock.mjs`
- Modify:
  - `src/app/api/ask/route.ts`: import `visitorIp` from `@/lib/request` instead of defining it
  - `.env.example`: add `RESEND_API_KEY`, `RESEND_FROM`, `INQUIRY_TO` and `RESEND_BASE_URL`, each with a one-line comment
  - `.superpowers/tmp/serve-test.sh`: also start the Resend mock on `:3092` and pass `RESEND_BASE_URL=http://127.0.0.1:3092 RESEND_API_KEY=test`, and stop port 3092 in `stop()`
- Test: `tests/inquiry.spec.ts` (`test.describe('Inquiry endpoint')`)

**Interfaces:**
- Consumes:
  - `parseInquiry` and `composeInquiryEmail` (Task 1)
  - `storeFromEnv()` and `CounterStore.admit` from `@/lib/ask/store`
  - `isAllowedOrigin` from `@/lib/ask/origin`
  - `LimitResult` from `@/lib/ask/limits`
- Produces:
  - `visitorIp(request: Request): string`
  - `checkInquiryLimits(store: CounterStore, ip: string, now: number): Promise<LimitResult>`, with keys `inquiry:ip:{ip}:hour:{n}` (3600 s, 3), `inquiry:ip:{ip}:day:{date}` (86,400 s, 6) and `inquiry:site:day:{date}` (86,400 s, 40), plus the switch `inquiry:enabled`
  - `sendInquiry(email: { subject: string; text: string; replyTo: string }, idempotencyKey: string): Promise<{ ok: true } | { ok: false; detail: string }>`
  - `formatInquiryLog(entry: InquiryLog): string` and `logInquiry(entry: InquiryLog)`, where `InquiryLog` is `{ requestId, outcome, ms, detail? }` and outcome is one of `sent | dropped | invalid | forbidden | limited | busy | off | error`. The log carries no visitor fields, by type.
- Request body: the Task 1 fields, plus `company` (honeypot, must be empty), `startedAt` (ms epoch) and `idempotencyKey` (UUID).
- Responses:
  - 200 `{ ok: true }`
  - 400 `{ state: 'invalid', field, message }`
  - 403 `{ state: 'forbidden' }`
  - 429 or 503 `{ state: 'limited' | 'busy', retryAfterSeconds }` with a `Retry-After` header
  - 503 `{ state: 'off' }`, returned when `RESEND_API_KEY` is missing, the store is missing, or the switch is off
  - 502 `{ state: 'error' }`
- The mock: `POST /emails` requires `Authorization: Bearer test`. A text containing `RESENDFAIL` gets a 500. A repeated `Idempotency-Key` returns the first response without counting. `GET /last` returns the last counted body, and `GET /count` returns how many were counted.

- [ ] **Step 1: Write the failing tests**

Use a helper `send(request, overrides)` that posts a valid body with `Origin: http://localhost:3001`, `startedAt: Date.now() - 10_000`, a fresh `idempotencyKey` and a distinct `X-Forwarded-For`.

```ts
test('sends a valid inquiry with the visitor as Reply-To, in plain text', async ({ request }) => {
  expect((await send(request, { email: ' Ana@Example.com ' })).status()).toBe(200);
  const last = await (await request.get('http://127.0.0.1:3092/last')).json();
  expect(last.reply_to).toBe('Ana@Example.com');
  expect(last.html).toBeUndefined();
  expect(last.subject).toBe('Project inquiry: A business system or web app from Ana');
});
test('the same submission sent twice delivers once', async ({ request }) => {
  const before = (await (await request.get('http://127.0.0.1:3092/count')).json()).count;
  const key = crypto.randomUUID();
  await send(request, { idempotencyKey: key });
  await send(request, { idempotencyKey: key });
  expect((await (await request.get('http://127.0.0.1:3092/count')).json()).count).toBe(before + 1);
});
test('bots get a normal answer and nothing is sent', async ({ request }) => { /* company filled → 200, count unchanged; startedAt = now → 200, count unchanged */ });
test('invalid fields come back named', async ({ request }) => { /* email 'x' → 400 { field: 'email' } */ });
test('other sites are refused', async ({ request }) => { /* Origin https://evil.example → 403 */ });
test('a fourth inquiry in an hour from one visitor is limited', async ({ request }) => { /* same X-Forwarded-For x4 → 4th is 429 with Retry-After */ });
test('a provider failure is reported, not hidden', async ({ request }) => { /* message containing RESENDFAIL → 502 { state: 'error' } */ });
test('logs carry no visitor details', async () => { /* formatInquiryLog output has no name/email/message keys, as the ask log test does */ });
```

- [ ] **Step 2: Run the tests and check they fail.** Run `.superpowers/tmp/serve-test.sh tests/inquiry.spec.ts`. Expected: the endpoint tests fail with 404.
- [ ] **Step 3: Implement the files above.** `/api/ask`'s route shows the order: origin, configuration, parse, bot drop, limits, send, then reply. Every reply is `Cache-Control: no-store`, and a thrown error from the store or the sender is a 502 `error` with a log entry.
- [ ] **Step 4: Run the tests and check they pass.** Also run `tests/ask.spec.ts`, since `visitorIp` moved. Then run `npm run -s typecheck && npm run -s lint`.
- [ ] **Step 5: Commit** with `git commit -m "feat: inquiry endpoint sends through Resend with limits and bot traps"`.

### Task 3: The project form panel

**Files:**
- Create: `src/components/inquiry/InquiryPanel.tsx`, `src/components/inquiry/InquiryPanel.module.css`
- Modify:
  - `src/app/layout.tsx`: mount `<InquiryPanel />` once inside `<body>`, and import its CSS module there, as is already done for the Ask panel because of the 404 route
  - `src/components/ButtonLink.tsx`: an `inquiry?: string | true` prop that renders `data-inquiry`, with the string being the opening line
  - Mark these call sites:
    - `SiteHeader.tsx` (the button and the round phone mail link)
    - `Intro.tsx`
    - `WorkingTogether.tsx`
    - `Contact.tsx` (passes `subject` as the opening line)
    - `not-found.tsx`, if it has a project button
  - `src/components/ask/actions.ts`: `draft_inquiry` dispatches `INQUIRY_OPEN_EVENT` with the summary instead of `window.open(mailto)`
- Test: `tests/inquiry.spec.ts` (`test.describe('Project form')`)

**Interfaces:**
- Consumes: `needs`, `timelines`, `checkField` and `Field` (Task 1); `POST /api/inquiry` (Task 2)
- Produces:
  - `INQUIRY_OPEN_EVENT = 'inquiry:open'`, a `CustomEvent<{ opening?: string }>`
  - `openInquiry(opening?: string): void`, exported from `src/components/inquiry/open.ts`
- Behaviour:
  - A capture-phase document click listener catches `a[data-inquiry]` (plain left click with no modifier keys), calls `preventDefault`, and opens the panel with `showModal()`, remembering the link to return focus to.
  - The draft is saved under the sessionStorage key `inquiry:draft` on every change, inside try/catch.
  - When a draft exists, the opening line is ignored.
  - The panel title is "Start a project". The send button reads "Send to James". While sending it reads "Sending…", with `aria-busy` and disabled.
  - Success replaces the form with "Sent. James will reply to {email}." and a Close button, and clears the draft.
  - On failure the text is kept and the panel shows: "That didn't send. Your message is still here." (limited: "You've sent a few already. Try again later, or email James directly."), followed by a link "Email it instead" (`mailto:` with the subject and the visitor's message as the body) and `<CopyEmail />`.
  - Errors sit next to their field, linked with `aria-describedby` and `aria-invalid`. Submitting focuses the first invalid field.
  - A hidden `company` input (`tabIndex={-1}`, `autoComplete="off"`, visually hidden, `aria-hidden`).
  - `startedAt` is taken when the panel first opens; `idempotencyKey` is created once per draft and renewed after a successful send.

- [ ] **Step 1: Write the failing tests** (browser, both projects, with the mock already running)

```ts
test('every Start a project button opens the form instead of a mail app', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /Start a project/ }).first().click();
  await expect(page.getByRole('dialog', { name: 'Start a project' })).toBeVisible();
});
test('shows each problem next to its field and focuses the first', async ({ page }) => { /* submit empty → 'Choose what you need.' visible, the need group is focused */ });
test('sends, confirms with the reply address, and clears the draft', async ({ page }) => { /* fill with a 3 s+ wait or page.clock, submit → 'Sent. James will reply to ana@example.com.' */ });
test('a failed send keeps the text and offers email and copy', async ({ page }) => { /* route /api/inquiry → 502; message still in textbox; 'Email it instead' href starts mailto: and contains the encoded message */ });
test('a draft survives closing and reloading, and wins over a case study opening line', async ({ page }) => { /* type, close, reload, open from /work/rowszeins-delight → typed text kept */ });
test('a case study opens the form with its opening line', async ({ page }) => { /* fresh context, /work/rowszeins-delight Contact button → message starts with that page's subject */ });
test('the assistant\'s email action opens the filled form', async ({ page }) => { /* mock /api/ask returning a draft_inquiry action → click chip → dialog shows the summary */ });
test('keyboard: Esc closes and focus returns to the button', async ({ page }) => { /* ... */ });
```

- [ ] **Step 2: Run them and check they fail.** Run `.superpowers/tmp/serve-test.sh tests/inquiry.spec.ts -g "Project form"`.
- [ ] **Step 3: Implement the panel, the wiring and the action change.** Style it with the Ask panel's tokens: the same dialog shell, field styles from the existing tokens, and dark mode through the existing color variables.
- [ ] **Step 4: Run the tests and check they pass.** Also run `tests/ask.spec.ts` and `tests/homepage.spec.ts`, then `npm run -s typecheck && npm run -s lint`.
- [ ] **Step 5: Commit** with `git commit -m "feat: project form panel replaces mail drafts on every project button"`.

### Task 4: Phone layout and full-screen demo view

**Files:**
- Create: `src/components/live/PhoneDemo.tsx`, `src/components/live/PhoneDemo.module.css`
- Modify: `src/components/live/LiveDashboard.tsx` + `.module.css`. Add `layout?: 'desktop' | 'phone'` (default `'desktop'`), rendered as `data-layout` on `.shell`, and `data-figure="net-sales"` on the net sales figure. The phone layout:
  - The sidebar is hidden.
  - A top bar shows a decorative lucide `Menu` icon and "Rowszein’s Delight", as the real app's phone top bar does.
  - Below it, in one column: date and greeting, the net sales card (with spent and profit), "Needs attention" stock, and latest sales.
  - Sizes are in rem, not `cqi`: body text ≥ 14 px, the net sales figure ≥ 28 px.
  - The desktop layout is unchanged.
- Modify: `src/components/HeroShowcase.tsx`, which renders `<PhoneDemo demo={demo} recent={…} announce={setAnnouncement} />` next to `SaleControls` when the software demo is live
- Test: `tests/live-demos.spec.ts` (`test.describe('Phone demo view')`)

**Interfaces:**
- Consumes:
  - `SaleControls({ demo, announce })` and the `useRowszeinDemo()` return value, as `HeroShowcase` already uses them
- Behaviour:
  - The trigger is a button "Try it full screen", shown only below `37.5rem` (CSS `display: none` from 37.5rem).
  - It opens a `<dialog>` with `showModal()`, `aria-label="Rowszein’s Delight demo"`.
  - The top bar has a Close button `aria-label="Close the demo"` (44×44).
  - The middle scrolls; the bottom has `SaleControls`, docked.
  - The page behind does not scroll: `overflow: hidden` on `<html>` while open.
  - A `matchMedia('(min-width: 37.5rem)')` change to true closes it.
  - On close, focus returns to the trigger.
  - Entrance: rise and fade, 250 ms, ease-out. Reduced motion: opacity only.

- [ ] **Step 1: Write the failing tests** (they skip unless `isMobile`; one desktop test checks the button is hidden)

```ts
test('phones can open the demo full screen and sell in it', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Try it full screen' }).click();
  const view = page.getByRole('dialog', { name: 'Rowszein’s Delight demo' });
  await expect(view).toBeVisible();
  const before = await view.locator('[data-layout="phone"] [data-figure="net-sales"]').innerText();
  await view.getByRole('button', { name: /Sell 1 Ube Cream/ }).click();
  await expect(view.locator('[data-layout="phone"] [data-figure="net-sales"]')).not.toHaveText(before);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const size = await view.locator('[data-layout="phone"] [data-figure="net-sales"]').evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  expect(size).toBeGreaterThanOrEqual(28);
});
test('closing keeps the sale and returns focus', async ({ page }) => { /* close → the hero figure equals the full-screen figure; the trigger is focused */ });
test('turning the phone wide closes the view', async ({ page }) => { /* setViewportSize 812x375 → dialog hidden */ });
test('desktop has no full-screen button', async ({ page, isMobile }) => { /* skip on mobile; button count 0 or hidden */ });
```

The existing `tests/live-demos.spec.ts` checks keep the desktop layout honest.

- [ ] **Step 2: Run them and check they fail.**
- [ ] **Step 3: Implement the phone layout, `PhoneDemo` and the hero wiring.**
- [ ] **Step 4: Run** `.superpowers/tmp/serve-test.sh tests/live-demos.spec.ts`. Expected: PASS. Then run the typecheck and lint.
- [ ] **Step 5: Commit** with `git commit -m "feat: full-screen Rowszein demo on phones, in the app's phone layout"`.

### Task 5: Verify and hand over

- [ ] Run the full suite with `.superpowers/tmp/serve-test.sh`. Expected: all pass, with no new flakes on a second run of the new files.
- [ ] Take screenshots against `next start` (port 3001, with the mocks) at 375, 768, 1280 and 1440 px, in light and dark: the form (empty, with errors, sending, sent, failed) and the phone view. Review them against the spec and the global standards, and fix what fails.
- [ ] If the owner has added `RESEND_API_KEY` to `.env.local`, send one real inquiry from `next dev` and confirm it arrives. Otherwise, record it as the first check after release.
- [ ] Update the spec's status line to "Built", and commit.
