# This Site Case Study Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A case study page at `/work/this-site` about this portfolio, with a "Following one question through the assistant" trace, and a gallery card.

**Architecture:** A new `projects` entry (slug `this-site`) makes the page join the gallery, the sitemap, `llms.txt`, the JSON-LD and the shared case-study tests. The page copies QuickAid's page structure and helpers (`caseStudyMetadata`, `caseStudyJsonLd`, `NextCase`, `Contact`). The trace copies `SaleTrace`'s pattern, with its steps in a data file.

**Tech Stack:** Next.js 16 App Router (static page), React 19, CSS Modules + Tailwind 4, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-17-this-site-case-study-design.md`

## Global Constraints

- No prices, no limit numbers (no "10", "30", "400", "3 per hour" next to "questions" or "messages"), and no internal switch or key names (`assistant:enabled`, `inquiry:enabled`).
- Use only the spec's "Facts the copy may use", the repo, or the latest suite run. No visitor counts, conversion rates or client results.
- The owner's approved quote, verbatim: "This is what I can build, especially with AI. I want to show people what I can build and what else I can do, and show it already with this portfolio."
- James is named in the third person in descriptive copy, and in the first person only where existing case studies use "I"/"my" (the facts list, "My part").
- Contact: headline lines `['Want an assistant', 'like this on', 'your site?']`, subject `A site like this one`, action `Email me about a site like this`.
- WCAG 2.2 AA. The trace works by keyboard and screen reader, and with reduced motion nothing animates.
- Never use ports 5173 or 8000. Never read `.env.local`.

## Review Focus

1. **The trace on phones:** the steps read as plain text, the drawing is hidden or stacked, and nothing scrolls sideways at 375 px. Test in Task 2.
2. **The trace with a fast scroll or a jump link:** the active step still matches the step in the middle of the screen. Test in Task 2.
3. **Dark mode:** the page's own colours keep text contrast at 4.5:1 or above. Check in Task 3's screenshots, and assert it in Task 1 through the existing heading test run in dark mode.
4. **"Ask the assistant" on the case study page:** it opens the Ask panel in place, keeps focus inside the panel and returns focus to the button. Test in Task 1.
5. **A price or limit number creeping into the copy:** caught by a text test. Test in Task 1.

---

### Task 1: Project entry, page and gallery card

**Files:**
- Modify:
  - `src/data/projects.ts`: add the `this-site` entry after `quickaid`
  - `tests/case-studies.spec.ts`: add `{ slug: 'this-site', cta: 'Want an assistant like this on your site?', type: 'WebSite' }` to `cases`
  - `src/components/ask/AskPanel.tsx`: listen for `ASK_OPEN_EVENT`
- Create:
  - `src/app/work/this-site/page.tsx`, plus `this-site.module.css`, `opengraph-image.tsx`, `twitter-image.tsx` and `social-image.tsx` (copy QuickAid's three image files and change the content)
  - `src/components/ask/open.ts`, exporting `ASK_OPEN_EVENT = 'ask:open'` and `openAsk(): void`
  - `src/components/case/AskButton.tsx`, a client button "Ask the assistant" that calls `openAsk()`
  - `public/work/this-site/desktop-poster.jpg` (1440×900, captured from `next start`)
  - `public/work/this-site/demo.jpg`, `tour.jpg`, `assistant.jpg`, `form.jpg` (captured at 1440×900, JPEG quality about 82; the assistant capture uses a recorded real answer, "A WordPress site usually takes 3 to 5 weeks, depending on the scope of the project.", fulfilled through `page.route`)
- Test: `tests/case-studies.spec.ts`

**Interfaces:**
- Produces:
  - the project `this-site`, with `caseStudy: '/work/this-site'` and `caseStudyDates: { published: '2026-11-17', updated: '2026-11-17' }`
  - category `web`, classification `personal`, medium `Portfolio website with an AI assistant`, year 2026
  - links: `{ href: 'https://www.saucescode.xyz/', label: 'Visit the live site' }` and `github('portfolio-v2')`
  - `openAsk()` and `ASK_OPEN_EVENT`
- Page sections, in order:
  - header: breadcrumb, eyebrow "Case study, web and AI", h1 = project title, lede, facts, figure = `demo.jpg`
  - problem: the approved quote as a `<blockquote>`
  - "What a visitor can do": four figures with alt text
  - `<section aria-labelledby="trace-title">`: an empty placeholder in this task, filled in Task 2
  - architecture: layers Browser, Vercel, Next.js server routes, Upstash Redis, Gemini, Resend
  - testing, then limits (a `<ul>`)
  - the link row, `<NextCase>`, `<Contact>`, JSON-LD with work type `WebSite`
- The project title is "This site". The page title is "This site: a portfolio that shows its work, with an AI assistant".

- [ ] **Step 1: Write the failing tests**

```ts
// in cases[]: { slug: 'this-site', cta: 'Want an assistant like this on your site?', type: 'WebSite' }

test.describe('This site case study', () => {
  test('quotes the owner and never shows prices, limit numbers or internal names', async ({ page }) => {
    await page.goto('/work/this-site');
    await expect(page.locator('main blockquote')).toContainText('This is what I can build, especially with AI.');
    const text = (await page.locator('main').innerText()).toLowerCase();
    for (const banned of ['₱', 'us$', 'usd', 'assistant:enabled', 'inquiry:enabled', '400 a day', '30 a day', '10 per', '3 an hour', 'per hour']) expect(text, banned).not.toContain(banned);
  });

  test('"Ask the assistant" opens the assistant in place and returns focus', async ({ page }) => {
    await page.goto('/work/this-site');
    const button = page.getByRole('main').getByRole('button', { name: 'Ask the assistant' });
    await button.click();
    await expect(page.getByRole('dialog', { name: 'Ask about my work' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(button).toBeFocused();
  });
});
```

- [ ] **Step 2: Run them and check they fail.** Run `.superpowers/tmp/serve-test.sh tests/case-studies.spec.ts`. Expected: the new `this-site` cases fail, because `getCaseStudy('this-site')` throws or the page is 404.
- [ ] **Step 3: Implement.** Add the data entry, the event and the button, then capture the images with a throwaway Playwright script in `.superpowers/tmp/` against `next start`, then write the page and the social images. The `AskPanel` listener calls its existing `open()`, and its `onClose` must return focus to the element that was focused before opening (it currently focuses the header trigger), so store the opener the way `InquiryPanel` does.
- [ ] **Step 4: Run** `.superpowers/tmp/serve-test.sh tests/case-studies.spec.ts tests/ask.spec.ts tests/homepage.spec.ts`. Expected: all pass. Then run the typecheck and lint.
- [ ] **Step 5: Commit** with `git commit -m "feat: case study of this site"`.

### Task 2: "Following one question through the assistant"

**Files:**
- Create: `src/data/question-trace.ts`, `src/components/case/QuestionTrace.tsx`, `src/components/case/QuestionTrace.module.css`
- Modify: `src/app/work/this-site/page.tsx`, filling the trace section on the dark band, as on Rowszein's page
- Test: `tests/case-studies.spec.ts`

**Interfaces:**
- Produces:
  - `type Part = 'browser' | 'server' | 'counters' | 'model' | 'page'`
  - `interface QuestionStep { title: string; body: string; parts: Part[] }`
  - `const partLabels: Record<Part, string>`, with the labels "The visitor's browser", "This site's server", "The counter store", "The AI model" and "The page"
  - `const questionSteps: QuestionStep[]`: six steps, in the spec's order and with its wording
- The component copies `SaleTrace`'s IntersectionObserver band (`rootMargin: '-45% 0px -45% 0px'`) and `data-active`. Each step renders `<ul aria-label="Parts involved">` naming its parts in text. From `lg` up, a sticky drawing of the five parts highlights the active step's parts (`data-on`) and is `aria-hidden`. Below `lg` the drawing is not shown.

- [ ] **Step 1: Write the failing tests**

```ts
test('the question trace names every step and its parts in text', async ({ page }) => {
  await page.goto('/work/this-site');
  const steps = page.getByRole('region', { name: 'Following one question through the assistant' }).getByRole('listitem').filter({ has: page.getByRole('heading', { level: 3 }) });
  await expect(steps).toHaveCount(6);
  for (const step of await steps.all()) await expect(step.getByRole('list', { name: 'Parts involved' }).getByRole('listitem').first()).toBeVisible();
});

test('the step in the middle of the screen is the active one, even after a jump', async ({ page, isMobile }) => {
  test.skip(isMobile, 'The drawing is shown from large screens up.');
  await page.goto('/work/this-site');
  const last = page.locator('[data-trace-step]').last();
  await last.scrollIntoViewIfNeeded();
  await page.evaluate(() => document.querySelector('[data-trace-step]:last-of-type')!.scrollIntoView({ block: 'center' }));
  await expect(last).toHaveAttribute('data-active', 'true');
  await expect(page.locator('[data-trace-drawing] [data-part="page"]')).toHaveAttribute('data-on', 'true');
});

test('the trace fits a phone without sideways scrolling', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Phone width.');
  await page.goto('/work/this-site');
  await page.getByRole('heading', { name: 'Following one question through the assistant' }).scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
```

- [ ] **Step 2: Run them and check they fail.** Expected: the region or the steps are not found.
- [ ] **Step 3: Implement** the data, the component and the section copy.
- [ ] **Step 4: Run** `.superpowers/tmp/serve-test.sh tests/case-studies.spec.ts`. Expected: PASS. Then run the typecheck and lint.
- [ ] **Step 5: Commit** with `git commit -m "feat: follow one question through the assistant"`.

### Task 3: Verify and hand over

- [ ] Run the full suite with `.superpowers/tmp/serve-test.sh`. Expected: all pass. Put the passed count in the page's testing copy if it changed, then rerun the case study tests.
- [ ] Take screenshots of `/work/this-site` at 375, 768, 1280 and 1440 px, in light and dark mode, and review them against the spec and the global standards. Fix what fails.
- [ ] Update the spec's status to "Built", and commit.
