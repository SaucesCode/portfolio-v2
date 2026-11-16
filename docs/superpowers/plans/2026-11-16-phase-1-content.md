# Phase 1: Client-Facing Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the new headline, a "Working with me" section with real prices and terms, a personal About paragraph, and a trimmed gallery.

**Architecture:** Prices and terms live in data modules (`services.ts` gains `fromUsd`, a new `terms.ts`). The new section, the Person JSON-LD offers and `llms.txt` all read from them, so a price exists in exactly one place. The gallery splits projects into cards and a compact "More experiments" list through a `tier` field on each project.

**Tech Stack:** Next.js 16 (App Router, static), React 19, TypeScript, Tailwind CSS 4 + CSS Modules, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-16-portfolio-showcase-design.md` (Phase 1 section)

## Global Constraints

- Copy is exactly as approved in the spec. Use typographic apostrophes (’), as the site already does ("I’m").
- Prices: landing pages from US$500, WordPress sites from US$1,200, custom web apps and business systems from US$3,500. "APIs, databases and integrations" has no from-price.
- Timelines: 1–2 weeks, 3–5 weeks, 6–12 weeks. Updates twice a week. Reply within one business day. Overlap 3–4 hours. UTC+8. 30 days of free fixes. Payment 50% to start, 50% at launch; three milestones for business systems.
- Availability line: "Currently taking on new projects, local and international."
- Honesty rules: no project presented as client work; nothing that isn't in the spec presented as fact.
- WCAG 2.2 AA, keyboard reachable, visible focus, touch targets ≥ 44px, prefers-reduced-motion respected. Motion uses the existing tokens (`--dur-*`, cubic-bezier(0.2, 0.8, 0.2, 1)) and animates transform and opacity only.
- Before building any UI (Tasks 2–4), state the design direction for that piece in one short paragraph: how it uses the existing type scale, grid and tokens. Introduce no new fonts or colours.
- Test server: `npm run build`, then `npx next start -p 3001`. Run tests with `PLAYWRIGHT_BASE_URL=http://localhost:3001 npx playwright test --workers=1`. When a test run finishes, stop the server by killing the process that owns port 3001; stopping `npx` alone leaves it running. Never use ports 5173 or 8000.
- Branch: `feat/portfolio-showcase`. Commit after each task.

## Review Focus

1. Services links to list-tier projects ("See Valence Capital and Nexus AI") must still land on something. The list items keep the `work-<slug>` ids that `Services.anchorFor` targets. Test in Task 4.
2. The header gains a fifth section link ("Pricing"). From 768px to 1440px nothing may overflow or collide. The existing "Responsive boundaries" test covers this and must pass after Task 2.
3. A price must read the same in the section, the JSON-LD and `llms.txt`. Task 1 tests the data paths and Task 2 tests the rendered text against the same `services` values.
4. The longer headline must still let the dimension line attach to the lit line, and must not overflow at 320px. The existing hero and responsive tests cover this and must pass after Task 3.
5. On case-study pages the "Pricing" nav link must go to `/#working`, not `#working`. Test in Task 2.

---

### Task 1: Prices and terms data, wired into JSON-LD and llms.txt

**Files:**
- Modify: `src/data/services.ts` (add `fromUsd`)
- Create: `src/data/terms.ts`
- Modify: `src/data/site.ts` (add `availability`)
- Modify: `src/app/layout.tsx` (Offer `priceSpecification`)
- Modify: `src/app/llms.txt/route.ts` (prices, terms, availability)
- Test: `tests/homepage.spec.ts`, `tests/case-studies.spec.ts`

**Interfaces:**
- Produces: `Service.fromUsd?: number`, set to `websites: 500`, `wordpress: 1200`, `applications: 3500`. `backend` gets none.
- Produces: `formatUsd(amount: number): string` in `src/data/terms.ts`, returning `"US$1,200"`.
- Produces: `interface Term { id: 'pricing' | 'timeline' | 'timezones' | 'after-launch' | 'payment'; title: string; body: string }` and `export const terms: Term[]`, in that order. Titles: "How pricing works", "How long it takes", "Working across time zones", "After launch", "Payment". Bodies are the spec's copy. The pricing body is composed from `services` using `formatUsd`, never from literal numbers.
- Produces: `site.availability: string`.

- [ ] **Step 1: Write the failing tests**

In `tests/homepage.spec.ts`, inside the existing "has canonical URL, social image and accurate structured data" test:
```ts
const priced = services.filter((s) => s.fromUsd);
for (const service of priced) {
  const offer = person.makesOffer.find((o: { itemOffered: { name: string } }) => o.itemOffered.name === service.name);
  expect(offer.priceSpecification).toEqual({ '@type': 'PriceSpecification', minPrice: service.fromUsd, priceCurrency: 'USD' });
}
expect(person.makesOffer.find((o: { itemOffered: { name: string } }) => o.itemOffered.name === 'APIs, databases and integrations').priceSpecification).toBeUndefined();
```
In `tests/case-studies.spec.ts`, extend the llms.txt test:
```ts
expect(text).toContain('## Working with me');
for (const term of terms) expect(text).toContain(term.body);
expect(text).toContain(site.availability);
expect(text).toContain('From US$3,500.');
```
Add a data-only test (no page) in `tests/homepage.spec.ts`:
```ts
test('pricing copy is built from the service prices', () => {
  expect(formatUsd(1200)).toBe('US$1,200');
  const pricing = terms.find((t) => t.id === 'pricing')!;
  for (const s of services.filter((s) => s.fromUsd)) expect(pricing.body).toContain(formatUsd(s.fromUsd!));
  expect(terms.map((t) => t.id)).toEqual(['pricing', 'timeline', 'timezones', 'after-launch', 'payment']);
});
```

- [ ] **Step 2: Run them and confirm they fail**

Run: `npm run typecheck`
Expected: errors for the missing `fromUsd`, `terms`, `formatUsd` and `availability`.

- [ ] **Step 3: Implement the data and wiring**

`layout.tsx`: each Offer gets `priceSpecification` only when `service.fromUsd` is set. `llms.txt`: each service line ends with `From US$X.` when priced. Add a `## Working with me` section listing each term as `- <title>: <body>`, and put the availability line under the opening summary.

- [ ] **Step 4: Build, start the server and run the tests**

Run: `npm run typecheck && npm run lint && npm run build`, start the server, then `PLAYWRIGHT_BASE_URL=http://localhost:3001 npx playwright test --workers=1 -g "structured data|llms|pricing copy"`
Expected: all pass.

- [ ] **Step 5: Commit**

`git commit -m "feat: service prices and working terms as data, in JSON-LD and llms.txt"`

---

### Task 2: "Working with me" section and the Pricing nav link

**Files:**
- Create: `src/components/WorkingWithMe.tsx` (+ `WorkingWithMe.module.css` only if Tailwind can't express it)
- Modify: `src/app/page.tsx` (render between `<Services />` and `<About />`)
- Modify: `src/components/SiteHeader.tsx` (add `{ id: 'working', label: 'Pricing' }` between Services and About)
- Test: `tests/homepage.spec.ts`, `tests/case-studies.spec.ts`

**Interfaces:**
- Consumes: `terms`, `formatUsd` and `services[].fromUsd` from Task 1; `inquiryHref` from `site.ts`.
- Produces: a section with `id="working"`, `aria-labelledby="working-title"`, an h2 "Working with me", and each term as an h3 with its title.

Layout direction: match the Services and About sections (12-column grid, `font-wide` h2 at the same clamp scale, `scroll-mt-20`). The focal point is a row of the three from-prices set large in tabular figures, each labelled with its service name and "from". Below it, the five terms as h3 + body in a two-column grid on large screens and one column on phones. The section ends with the "Start a project" `ButtonLink` (mail icon).

- [ ] **Step 1: Write the failing tests**

In `tests/homepage.spec.ts`:
- In "leads with the proposition…", change the id list to `['intro-title', 'featured', 'work', 'services', 'working', 'about', 'contact']`.
- New test "working with me shows real prices and terms":
```ts
await page.goto('/');
const section = page.locator('#working');
await expect(section.getByRole('heading', { level: 2, name: 'Working with me' })).toBeVisible();
for (const term of terms) await expect(section.getByRole('heading', { level: 3, name: term.title })).toBeAttached();
for (const s of services.filter((s) => s.fromUsd)) await expect(section.getByText(formatUsd(s.fromUsd!)).first()).toBeVisible();
await expect(section.getByRole('link', { name: /Start a project/ })).toHaveAttribute('href', /^mailto:/);
```
In `tests/case-studies.spec.ts`, "header links on a case study…": add
`await expect(nav.getByRole('link', { name: 'Pricing' })).toHaveAttribute('href', '/#working');`

- [ ] **Step 2: Run them and confirm they fail**

Run, against a fresh build: `-g "working with me|proposition|header links on a case study"`
Expected: FAIL (`#working` not found, Pricing link missing).

- [ ] **Step 3: Implement `WorkingWithMe()` and add the nav entry**

The prices come from `services`, not from typed-in numbers.

- [ ] **Step 4: Run the new tests plus the responsive and header tests**

Run: `-g "working with me|proposition|header links|Responsive boundaries"` on both projects.
Expected: all pass, with no header overflow at any width the test covers.

- [ ] **Step 5: Commit**

`git commit -m "feat: working with me section with prices, timelines and terms"`

---

### Task 3: Headline and the personal About paragraph

**Files:**
- Modify: `src/components/HeroShowcase.tsx` (`headline` record; the web artifact's `option` becomes `'Websites'`)
- Modify: `src/components/About.tsx`
- Test: `tests/homepage.spec.ts`

**Interfaces:**
- Consumes: `site.availability` from Task 1.
- Produces: h1 text `Systems your business runs on.` + `Websites it’s found by.`. The About section becomes h2 "About me" (`id="about-title"`), containing the personal paragraph, the availability line, then the existing two paragraphs. The principles column is introduced by an h3 "How I work", and each principle title becomes an h4.

Layout direction: the personal paragraph is the section's lede, larger than body text (the same size as the Services intro lede or one step up), max about 60ch. The availability line sits under it in `text-graphite` with a small `--signal` dot marked `aria-hidden`. The principles column keeps its rail styling.

- [ ] **Step 1: Write the failing tests**

In `tests/homepage.spec.ts`:
- Change the h1 expectation to `'Systems your business runs on.Websites it’s found by.'`.
- In the test that checks `'How I work'`, also assert:
```ts
await expect(page.getByRole('heading', { level: 2, name: 'About me' })).toBeVisible();
await expect(page.locator('#about').getByText('I like building software that’s actually useful to someone.', { exact: false })).toBeVisible();
await expect(page.locator('#about').getByText(site.availability)).toBeVisible();
```

- [ ] **Step 2: Run them and confirm they fail**

Run: `-g "proposition|How I work|About"`
Expected: FAIL on the h1 text and the About heading.

- [ ] **Step 3: Implement the headline and About changes**

The About paragraph is the spec's two-sentence-plus-one copy, verbatim.

- [ ] **Step 4: Run the hero, About and responsive tests**

Run: `-g "proposition|How I work|dimension line|handoff|Responsive boundaries"` on both projects.
Expected: all pass. The dimension line still attaches to the lit line.

- [ ] **Step 5: Commit**

`git commit -m "feat: audience headline and a personal About paragraph"`

---

### Task 4: Gallery tiers and "More experiments"

**Files:**
- Modify: `src/data/projects.ts` (add `tier?: 'card' | 'list'`; set `'list'` on `valence-capital`, `nexus-ai`, `page-fishing`; export `galleryCards` and `moreExperiments`)
- Modify: `src/components/WorkGallery.tsx` (render cards from `galleryCards`; remove the category filter, its FLIP logic and its live status; add the list)
- Modify: `src/components/WorkGallery.module.css` (only if the list needs it)
- Test: `tests/homepage.spec.ts`

**Interfaces:**
- Produces: `galleryCards = galleryProjects.filter((p) => p.tier !== 'list')` and `moreExperiments = galleryProjects.filter((p) => p.tier === 'list')`. `galleryProjects` stays as is (all non-hero projects) for JSON-LD and llms.txt.
- Produces: after the cards, an h3 "More experiments" and a `<ul>`. Each `<li id={`work-${slug}`}>` has an h4 title, `medium · year`, the summary, the provenance and note in `text-graphite`, and its links via `ExternalLink`. There are no images.

Why the filter goes: with four cards the filters would read "Software 2 / Web 1 / Experiments 1", which is noise. The intro paragraph under "Selected work" stays.

Layout direction: the cards keep the existing alternating slots (with four cards that's two rows: 7/5, then 5/7). The list sits below on the same grid, separated by a `border-rule` line. On large screens it's a three-column row; on phones it stacks.

- [ ] **Step 1: Rewrite the gallery tests to fail**

Replace the two filter tests ("filters by category…", "rapid filter changes…") with:
```ts
test('shows the main projects as cards and the rest as a short list', async ({ page }) => {
  await page.goto('/');
  const gallery = page.locator('#work');
  await expect(gallery.locator(':scope ul').first().locator(':scope > li')).toHaveCount(galleryCards.length);
  const list = gallery.getByRole('heading', { level: 3, name: 'More experiments' });
  await expect(list).toBeVisible();
  for (const project of moreExperiments) {
    const item = gallery.locator(`#work-${project.slug}`);
    await expect(item.getByRole('heading', { level: 4, name: project.title })).toBeVisible();
    await expect(item.locator('img')).toHaveCount(0);
    for (const link of project.links) await expect(item.locator(`a[href="${link.href}"]`)).toBeVisible();
  }
  await expect(gallery.getByRole('button', { name: /^All work/ })).toHaveCount(0);
});

test('service examples link to projects that exist on the page', async ({ page }) => {
  await page.goto('/');
  const hrefs = await page.locator('#services a[href^="#"]').evaluateAll((as) => as.map((a) => a.getAttribute('href')!));
  for (const href of hrefs) await expect(page.locator(href)).toBeAttached();
});
```
Import `galleryCards` and `moreExperiments`. Remove imports the deleted tests used, if they're now unused.

- [ ] **Step 2: Run them and confirm they fail**

Run: `-g "cards and the rest|service examples"`
Expected: FAIL (the filter buttons still exist and the list is missing).

- [ ] **Step 3: Implement the tiers, the list and the filter removal**

Delete the now-dead code: `filters`, `count`, `choose`, `status`, `flushSync`, the `useState` and `useRef` imports, and any CSS used only by the filter. Keep the card rendering as it is.

- [ ] **Step 4: Run the gallery, services and structure tests**

Run: `-g "cards and the rest|service examples|everything is reachable|Responsive boundaries"` on both projects.
Expected: all pass. The existing test that every project title and summary is on the page still passes, because list items carry them.

- [ ] **Step 5: Commit**

`git commit -m "feat: four-card gallery with a compact more-experiments list"`

---

### Task 5: Phase verification and release

**Files:** none new.

- [ ] **Step 1: Run the full suite on a fresh build**

Run: `npm run typecheck && npm run lint && npm run build`, start the server, then `PLAYWRIGHT_BASE_URL=http://localhost:3001 npx playwright test --workers=1`
Expected: 0 failed.

- [ ] **Step 2: Screenshot and review**

Take full-page screenshots of `/` at 375, 768, 1280 and 1440 wide, and a first-screen screenshot at 390, using the scratchpad `shoot.mjs` pattern against port 3001. Review them against the global standards (hierarchy, spacing, contrast, no overflow) and fix anything found, with a test where it's behavioural.

- [ ] **Step 3: Owner review, then release**

Show the owner the screenshots. On approval: `git checkout main && git merge --ff-only feat/portfolio-showcase && git push`. Then wait for Vercel and check `https://www.saucescode.xyz/` shows "Working with me", and that `https://www.saucescode.xyz/llms.txt` lists the prices.
