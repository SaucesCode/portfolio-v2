import { expect, test, type Page } from '@playwright/test';
import { caseStudies, getCaseStudy, isHeroProject } from '../src/data/projects';
import { traceSteps } from '../src/data/rowszein-trace';
import { site } from '../src/data/site';

const cases = [
  { slug: 'rowszeins-delight', cta: 'Need a system tailored to your business?', type: 'SoftwareApplication' },
  { slug: 'thread-and-form', cta: 'Have a website idea worth building?', type: 'CreativeWork' },
  { slug: 'quickaid', cta: 'Have data that belongs on a map?', type: 'SoftwareApplication' },
].map((entry) => ({ ...entry, project: getCaseStudy(entry.slug) }));

const jsonLdGraphs = (page: Page) =>
  page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((scripts) => scripts.map((s) => JSON.parse(s.textContent ?? '{}')['@graph'] ?? []).flat());

/** Collects every view-transition pseudo-element animation with a duration that runs from now on. */
const recordViewTransitions = (page: Page) =>
  page.evaluate(() => {
    const seen = new Set<string>();
    (window as unknown as { __vt: Set<string> }).__vt = seen;
    const tick = () => {
      for (const animation of document.getAnimations()) {
        const pseudo = (animation.effect as KeyframeEffect | null)?.pseudoElement;
        // React also adds zero-length helper animations to every transition; those never move anything.
        const moves = Number(animation.effect?.getComputedTiming().duration) > 0;
        if (pseudo?.startsWith('::view-transition') && moves) seen.add(pseudo);
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

const recordedViewTransitions = (page: Page) =>
  page.evaluate(() => [...(window as unknown as { __vt: Set<string> }).__vt]);

test.describe('Case studies: content and SEO', () => {
  for (const { slug, project, cta, type } of cases) {
    test(`${project.title} loads directly with its own metadata`, async ({ page, request }) => {
      const response = await page.goto(project.caseStudy);
      expect(response?.status()).toBe(200);

      await expect(page).toHaveTitle(new RegExp(`^${project.title}: .+ \\| ${site.name}$`));
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{80,}/);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(`${project.caseStudy}$`));
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', new RegExp(`${project.caseStudy}$`));
      await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');

      for (const property of ['og:image', 'twitter:image']) {
        const attribute = property.startsWith('og') ? 'property' : 'name';
        const url = await page.locator(`meta[${attribute}="${property}"]`).first().getAttribute('content');
        expect(url, property).toContain(`/work/${slug}/`);
        const image = await request.get(new URL(url!).pathname + new URL(url!).search);
        expect(image.ok()).toBe(true);
        expect(image.headers()['content-type']).toBe('image/png');
      }

      const graph = await jsonLdGraphs(page);
      const types = graph.map((node: { '@type'?: string }) => node['@type']);
      for (const expected of ['Article', type, 'SoftwareSourceCode', 'BreadcrumbList', 'Person']) expect(types).toContain(expected);
      const work = graph.find((node: { '@type'?: string }) => node['@type'] === type);
      expect(work.name).toBe(project.title);
      const article = graph.find((node: { '@type'?: string }) => node['@type'] === 'Article');
      expect(article.datePublished).toBe(project.caseStudyDates.published);
      expect(article.dateModified).toBe(project.caseStudyDates.updated);
      await expect(page.locator('meta[property="article:modified_time"]')).toHaveAttribute('content', project.caseStudyDates.updated);
    });

    test(`${project.title} has one h1, ordered headings and described images`, async ({ page }) => {
      await page.goto(project.caseStudy);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(project.title);

      const levels = await page.locator('main h1, main h2, main h3, main h4, footer h2').evaluateAll((hs) => hs.map((h) => Number(h.tagName[1])));
      expect(levels.filter((level) => level === 1)).toHaveLength(1);
      for (let i = 1; i < levels.length; i++) expect(levels[i] - levels[i - 1], `heading ${i}`).toBeLessThanOrEqual(1);

      const images = await page.locator('img').evaluateAll((imgs) => imgs.map((img) => img.getAttribute('alt')));
      expect(images.every((alt) => alt !== null)).toBe(true);
      const firstContentImage = page.locator('main figure img').first();
      await expect(firstContentImage).toHaveAttribute('alt', /.{40,}/);
    });

    test(`${project.title} ends with its own call to action and links onward`, async ({ page }) => {
      await page.goto(project.caseStudy);
      const footer = page.locator('#contact');
      await expect(footer.getByRole('heading', { level: 2 })).toHaveText(cta);
      const mailtos = await footer.locator('a[href^="mailto:"]').evaluateAll((links) => links.map((a) => a.getAttribute('href')));
      expect(mailtos.length).toBeGreaterThanOrEqual(2);
      for (const href of mailtos) expect(href).toMatch(new RegExp(`^mailto:${site.email}\\?subject=`));

      const other = caseStudies[(caseStudies.indexOf(project) + 1) % caseStudies.length];
      await expect(page.getByRole('navigation', { name: 'Next case study' }).getByRole('link', { name: new RegExp(other.title) })).toHaveAttribute(
        'href',
        other.caseStudy,
      );
      // Featured projects sit in the featured section; the rest live in the gallery.
      await expect(page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: 'Work' })).toHaveAttribute(
        'href',
        isHeroProject(slug) ? '/#featured' : '/#work',
      );
      for (const link of project.links) await expect(page.locator(`main a[href="${link.href}"]`).first()).toBeVisible();
    });

    test(`${project.title} lazy-loads imagery below the hero`, async ({ page }) => {
      await page.goto(project.caseStudy);
      const loading = await page.locator('main img').evaluateAll((imgs) => imgs.map((img) => img.getAttribute('loading')));
      expect(loading[0]).not.toBe('lazy');
      expect(loading.slice(1).every((value) => value === 'lazy')).toBe(true);
    });
  }

  test('the sitemap lists the homepage and exactly the case studies that exist', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text();
    const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]).pathname);
    expect(paths.sort()).toEqual(['/', ...caseStudies.map((p) => p.caseStudy)].sort());
    for (const path of paths) expect((await request.get(path)).status()).toBe(200);
    for (const project of caseStudies) {
      expect(xml).toContain(`${project.caseStudy}</loc>
<lastmod>${project.caseStudyDates.updated}`);
    }
  });

  test('llms.txt maps the site in plain text for language models', async ({ request }) => {
    const response = await request.get('/llms.txt');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/plain');
    const text = await response.text();
    expect(text.startsWith(`# ${site.name}

> `)).toBe(true);
    for (const project of caseStudies) expect(text).toContain(`[${project.title}](${site.url}${project.caseStudy})`);
    expect(text).toContain(site.email);
  });

  test('a case study that does not exist returns 404', async ({ request }) => {
    expect((await request.get('/work/not-a-project')).status()).toBe(404);
  });

  test('no placeholder press quotes or client claims appear', async ({ page }) => {
    for (const { project } of cases) {
      await page.goto(project.caseStudy);
      const text = (await page.locator('main').innerText()).toLowerCase();
      for (const phrase of ['vogue', 'harper', 'awwwards', 'testimonial', 'our client', 'commissioned by']) expect(text, phrase).not.toContain(phrase);
    }
  });
});

test.describe('Case studies: navigation', () => {
  test('the homepage links to both case studies, and back and forward work', async ({ page }) => {
    await page.goto('/');
    // Featured projects carry the link on their wall label, the others on their gallery card.
    for (const project of caseStudies) {
      await expect(page.getByRole('link', { name: `Read the case study: ${project.title}` })).toHaveAttribute('href', project.caseStudy);
    }

    const first = caseStudies[0];
    const link = page.locator(`#${first.slug}`).getByRole('link', { name: /Read the case study/ });
    await link.scrollIntoViewIfNeeded();
    const scrollBefore = await page.evaluate(() => scrollY);
    await link.click();
    await expect(page).toHaveURL(new RegExp(`${first.caseStudy}$`));
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(first.title);
    expect(await page.evaluate(() => scrollY)).toBeLessThan(10);

    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator(`#${first.slug}`)).toBeInViewport();
    // Restored at once, not scrolled down to from the top of the page.
    await page.waitForTimeout(100);
    expect(Math.abs((await page.evaluate(() => scrollY)) - scrollBefore)).toBeLessThan(40);

    await page.goForward();
    await expect(page).toHaveURL(new RegExp(`${first.caseStudy}$`));
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(first.title);
  });

  test('header links on a case study lead back to homepage sections', async ({ page, isMobile }) => {
    test.skip(isMobile, 'The section links are shown from tablet width up.');
    await page.goto(caseStudies[0].caseStudy);
    const nav = page.getByRole('navigation', { name: 'Primary' });
    await expect(nav.getByRole('link', { name: 'Work' })).toHaveAttribute('href', '/#featured');
    await expect(nav.getByRole('link', { name: 'Services' })).toHaveAttribute('href', '/#services');
    await expect(nav.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '#contact');
    await nav.getByRole('link', { name: 'Services' }).click();
    await expect(page).toHaveURL(/\/#services$/);
    await expect(page.locator('#services')).toBeInViewport();
    await page.getByRole('banner').getByRole('link', { name: site.name }).click();
    await expect(page).toHaveURL(/#top$/);
  });

  test('keyboard: skip link reaches the case study content', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Keyboard navigation is checked on desktop.');
    await page.goto(caseStudies[1].caseStudy);
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to main content' });
    await expect(skip).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main-content$/);
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.closest('main') !== null);
    expect(focused).toBe(true);
  });

  test('following a case study link moves the project frame into place', async ({ page, browserName, isMobile }) => {
    test.skip(browserName !== 'chromium' || isMobile, 'Checked where view transitions are supported, at desktop size.');
    await page.goto('/');
    const link = page.locator(`#${caseStudies[0].slug}`).getByRole('link', { name: /Read the case study/ });
    await link.scrollIntoViewIfNeeded();
    await recordViewTransitions(page);
    await link.click();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect.poll(() => recordedViewTransitions(page)).toContain(`::view-transition-group(work-${caseStudies[0].slug})`);
  });

  test('with reduced motion, page changes do not animate', async ({ browser, browserName }) => {
    test.skip(browserName !== 'chromium', 'View transitions are checked in Chromium.');
    const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto('/');
    const link = page.locator(`#${caseStudies[1].slug}`).getByRole('link', { name: /Read the case study/ });
    await link.scrollIntoViewIfNeeded();
    await recordViewTransitions(page);
    await link.click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(caseStudies[1].title);
    await page.waitForTimeout(600);
    const running = await page.evaluate(() =>
      document.getAnimations().filter((a) => Number(a.effect?.getComputedTiming().activeDuration) > 20).length,
    );
    expect(running).toBe(0);
    const vt = await page.evaluate(() =>
      [...(window as unknown as { __vt: Set<string> }).__vt].length,
    );
    expect(vt).toBe(0);
    await context.close();
  });
});

test.describe('Case studies: responsive', () => {
  for (const width of [320, 360, 390, 768, 1024, 1440, 1920]) {
    test(`no sideways scrolling at ${width}px`, async ({ page, isMobile }) => {
      test.skip(isMobile, 'Widths are set explicitly.');
      await page.setViewportSize({ width, height: 900 });
      for (const project of caseStudies) {
        await page.goto(project.caseStudy);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow, project.title).toBe(0);
        const offscreen = await page
          .locator('main h1, main h2, main h3, main a, main button, footer a')
          .evaluateAll((els) =>
            els
              .filter((el) => el.getBoundingClientRect().width > 0 && !el.classList.contains('sr-only'))
              .filter((el) => el.getBoundingClientRect().right > innerWidth + 1 || el.getBoundingClientRect().left < -1)
              .map((el) => el.textContent?.trim().slice(0, 30)),
          );
        expect(offscreen, project.title).toEqual([]);
      }
    });
  }
});

test.describe('Rowszein’s Delight: the sale trace', () => {
  test('every step is readable as text, with its tables and its test', async ({ page }) => {
    await page.goto('/work/rowszeins-delight');
    const steps = page.getByRole('region', { name: 'Following one sale through the system' }).locator('ol > li');
    await expect(steps).toHaveCount(traceSteps.length);
    for (const [i, step] of traceSteps.entries()) {
      await expect(steps.nth(i).getByRole('heading', { level: 3 })).toHaveText(step.title);
      await expect(steps.nth(i)).toContainText(step.test);
    }
  });

  test('the drawing follows the step in the middle of the screen', async ({ page, isMobile }) => {
    test.skip(isMobile, 'The drawing is shown on wide screens.');
    await page.goto('/work/rowszeins-delight');
    const steps = page.getByRole('region', { name: 'Following one sale through the system' }).locator('ol > li');
    // The table in the drawing, not the "Read: Recipe" chip in the step text.
    const recipe = page.locator('li[data-touch]:has(> span:text-is("Recipe"))');
    const recipeState = () => recipe.getAttribute('data-touch');

    await steps.nth(2).evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await expect(steps.nth(2)).toHaveAttribute('data-active', 'true');
    expect(await recipeState()).toBe('none');

    await steps.nth(3).evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
    await expect(steps.nth(3)).toHaveAttribute('data-active', 'true');
    expect(await recipeState()).toBe('read');
  });
});

test.describe('Case studies without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('both pages render their full content', async ({ page }) => {
    for (const project of caseStudies) {
      await page.goto(project.caseStudy);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(project.title);
      await expect(page.locator('#contact a[href^="mailto:"]').first()).toBeVisible();
    }
    await page.goto('/work/rowszeins-delight');
    for (const step of traceSteps) await expect(page.getByText(step.title)).toBeVisible();
  });
});

test.describe('QuickAid: where a point on the map comes from', () => {
  const region = (page: Page) => page.getByRole('region', { name: 'Where a point on the map comes from' });

  test('the overview draws every reference point inside the area, with an accessible summary', async ({ page }) => {
    await page.goto('/work/quickaid');
    const map = region(page).getByRole('img', { name: /Map of the 168 barangay reference points/ });
    await expect(map).toBeVisible();
    expect(await map.locator('circle[data-id]').count()).toBe(165);
    await expect(map).toContainText('3 points about');
  });

  test('choosing a barangay with the keyboard updates the read-out and the close-up', async ({ page }) => {
    await page.goto('/work/quickaid');
    const area = region(page);
    await expect(area.getByRole('heading', { level: 3, name: 'Bignay 2, Sariaya' })).toBeVisible();
    const town = area.getByRole('combobox', { name: 'Municipality' });
    await town.focus();
    await town.selectOption('Dolores');
    const barangay = area.getByRole('combobox', { name: 'Barangay' });
    await barangay.selectOption({ label: 'Kinabuhayan' });
    await expect(area.getByRole('heading', { level: 3, name: 'Kinabuhayan, Dolores' })).toBeVisible();
    await expect(area.getByText(/° N, .*° E/)).toBeVisible();
    await expect(area.getByRole('img', { name: /Close-up of Kinabuhayan/ }).locator('g circle')).toHaveCount(8);
  });

  test('a far-off reference point explains itself', async ({ page }) => {
    await page.goto('/work/quickaid');
    const area = region(page);
    await area.getByRole('combobox', { name: 'Municipality' }).selectOption('Lucena City');
    await area.getByRole('combobox', { name: 'Barangay' }).selectOption({ label: 'Barangay 5' });
    // The geocoder placed this barangay in Manila, roughly 100 km away.
    await expect(area.getByText(/about \d{2,3} km from Lucena City/)).toBeVisible();
  });
});

test.describe('Thread & Form on phones', () => {
  test('phones get the live demo’s own phone captures, desktops the desktop ones', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Widths are set explicitly.');
    const sources = () =>
      page.locator('main picture img').evaluateAll((imgs) => imgs.slice(0, 3).map((img) => (img as HTMLImageElement).currentSrc));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/work/thread-and-form');
    await page.locator('main picture img').nth(2).scrollIntoViewIfNeeded();
    await expect.poll(async () => (await sources()).every((src) => /phone/.test(decodeURIComponent(src)))).toBe(true);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/work/thread-and-form');
    await page.locator('main picture img').nth(2).scrollIntoViewIfNeeded();
    await expect.poll(async () => (await sources()).every((src) => /desktop/.test(decodeURIComponent(src)))).toBe(true);
  });
});
