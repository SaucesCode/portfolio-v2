import { expect, test, type Page } from '@playwright/test';
import { caseStudies, featuredSoftware, featuredWebsite, galleryCards, galleryProjects, heroProjects, moreExperiments, projects } from '../src/data/projects';
import { services } from '../src/data/services';
import { site } from '../src/data/site';
import { terms } from '../src/data/terms';

const viewerSlider = (page: Page) =>
  page.getByRole('slider', { name: `Scroll position in the ${featuredWebsite.title} page` });

const waitForFullPage = (slider: ReturnType<typeof viewerSlider>) =>
  expect(slider).toHaveAttribute('aria-disabled', 'false', { timeout: 20_000 });

const tourOf = (page: Page) => page.getByRole('region', { name: `Guided tour of ${featuredSoftware.title}` });

const steps = featuredSoftware.walkthrough!;

test.describe('Identity and SEO', () => {
  test('uses the full name and professional email everywhere', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(`${site.name}, full-stack software engineer`);
    await expect(page.getByRole('banner').getByRole('link', { name: site.name })).toBeVisible();
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /full-stack software engineer/);
    await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute('content', site.name);

    const mailtos = await page.locator('a[href^="mailto:"]').evaluateAll((links) => links.map((a) => a.getAttribute('href')));
    expect(mailtos.length).toBeGreaterThanOrEqual(3);
    for (const href of mailtos) expect(href).toMatch(new RegExp(`^mailto:${site.email}`));
    await expect(page.getByRole('link', { name: site.email })).toBeVisible();

    const html = await page.content();
    expect(html).not.toContain('jamessdemesa@gmail.com');
    expect(html).not.toMatch(/James De Mesa(?!\w)/);
  });

  test('has canonical URL, social image and accurate structured data', async ({ page, request }) => {
    await page.goto('/');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', site.url);

    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    const ogResponse = await request.get(new URL(ogImage!).pathname + new URL(ogImage!).search);
    expect(ogResponse.ok()).toBe(true);
    expect(ogResponse.headers()['content-type']).toContain('image/png');

    const blocks = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((t) => JSON.parse(t));
    const graph = blocks.flatMap((b) => b['@graph'] ?? []);
    const person = graph.find((node) => node['@type'] === 'Person');
    expect(person.name).toBe(site.name);
    expect(person.email).toBe(`mailto:${site.email}`);
    expect(person.jobTitle).toMatch(/software engineer/i);
    expect(person.makesOffer.length).toBeGreaterThan(0);
    // Prices are discussed per project, never published.
    expect(JSON.stringify(blocks)).not.toMatch(/price/i);
    expect(person.makesOffer).toHaveLength(services.length);
    const profile = graph.find((node) => node['@type'] === 'ProfilePage');
    expect(profile.mainEntity['@id']).toBe(person['@id']);
    const list = graph.find((node) => node['@type'] === 'ItemList');
    expect(list.itemListElement).toHaveLength(projects.length);
  });

  test('working terms never state an amount', () => {
    expect(terms.map((t) => t.id)).toEqual(['approach', 'timeline', 'timezones', 'after-launch', 'payment']);
    // The approach to pricing is described; no figure in any currency ever is.
    for (const term of terms) expect(term.body).not.toMatch(/\$|₱|USD|PHP|\d[\d,]*\s*(dollars|pesos)/i);
  });

  test('sitemap lists only routes that exist', async ({ request }) => {
    const sitemap = await (await request.get('/sitemap.xml')).text();
    // The homepage plus one entry per case study (checked in detail in case-studies.spec.ts).
    expect(sitemap.match(/<loc>/g)).toHaveLength(1 + caseStudies.length);
    expect(await (await request.get('/robots.txt')).text()).toContain('Sitemap:');
  });
});

test.describe('Homepage structure', () => {
  test('working together explains how a project runs, without prices', async ({ page }) => {
    await page.goto('/');
    const section = page.locator('#process');
    await expect(section.getByRole('heading', { level: 2, name: 'Working together' })).toBeVisible();
    for (const term of terms) await expect(section.getByRole('heading', { level: 3, name: term.title })).toBeAttached();
    await expect(section).not.toContainText(/₱|US\$|USD/);
    await expect(section.getByRole('link', { name: /Start a project/ })).toHaveAttribute('href', /^mailto:/);
  });

  test('working together shows the five phases of a project at a glance, in order', async ({ page }) => {
    await page.goto('/');
    const phases = page.locator('#process').getByRole('list', { name: 'How a project runs' }).getByRole('listitem');
    await expect(phases).toHaveCount(5);
    const titles = await phases.locator('[data-phase-title]').allInnerTexts();
    expect(titles).toEqual(['Short call', 'Fixed price', 'Build', 'Launch', '30 days of fixes']);
    await expect(phases.nth(1)).toContainText('50% to start');
    await expect(phases.nth(3)).toContainText('50% at launch');
  });

  test('the phases read left to right on desktop and top to bottom on phones, without sideways scrolling', async ({ page, isMobile }) => {
    await page.goto('/');
    const phases = page.locator('#process').getByRole('list', { name: 'How a project runs' }).getByRole('listitem');
    const first = (await phases.first().boundingBox())!;
    const second = (await phases.nth(1).boundingBox())!;
    if (isMobile) expect(second.y).toBeGreaterThan(first.y + first.height - 1);
    else expect(Math.abs(second.y - first.y)).toBeLessThan(2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test('the window label never covers the live dashboard\'s greeting', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Desktop hero windows.');
    for (const [width, height] of [[1024, 768], [1280, 800], [1440, 900]]) {
      await page.setViewportSize({ width, height });
      await page.goto('/');
      await expect(page.locator('[data-live="ready"]').first()).toBeAttached({ timeout: 10_000 });
      const overlap = await page.evaluate(() => {
        const primary = document.querySelector('[data-role="primary"]')!;
        const label = primary.querySelector('[class*="tag"]')!;
        if (getComputedStyle(label).visibility === 'hidden') return false;
        const tag = label.getBoundingClientRect();
        const greeting = [...primary.querySelectorAll('p')].find((p) => p.textContent?.startsWith('Good afternoon'))!.getBoundingClientRect();
        return tag.left < greeting.right && greeting.left < tag.right && tag.top < greeting.bottom && greeting.top < tag.bottom;
      });
      expect(overlap, `label over greeting at ${width}x${height}`).toBe(false);
    }
  });

  test('loads privacy-friendly visitor analytics', async ({ page }) => {
    await page.goto('/');
    // Locally the script is /_vercel/insights/script.js; on Vercel it is served from a randomised path.
    await expect(page.locator('script[src$="/script.js"]:not([src*="/_next/"])')).toHaveCount(1);
  });

  test('leads with the proposition, then software and website work', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Systems your business runs on.Websites it’s found by.');

    const order = await page.evaluate(() =>
      ['intro-title', 'featured', 'work', 'services', 'process', 'about', 'contact'].map(
        (id) => document.getElementById(id)!.getBoundingClientRect().top,
      ),
    );
    expect([...order].sort((a, b) => a - b)).toEqual(order);

    const software = await page.locator(`#${featuredSoftware.slug}`).boundingBox();
    const website = await page.locator(`#${featuredWebsite.slug}`).boundingBox();
    expect(software!.y).toBeLessThan(website!.y);
  });

  test('shows a real software screen above the fold', async ({ page }) => {
    // The hero now leads with the app itself, so the full tour starts just below it.
    await page.goto('/');
    const box = await page.locator('[data-id="software"]').boundingBox();
    expect(box!.y + box!.height / 2).toBeLessThan(page.viewportSize()!.height);
  });

  test('has no horizontal overflow', async ({ page }) => {
    await page.goto('/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
  });
});

test.describe('Hero: two disciplines', () => {
  const heroCaption = (page: Page) => page.locator('#main-content section').first().locator('[aria-live="polite"]');

  test('offers both calls to action', async ({ page }) => {
    await page.goto('/');
    const hero = page.locator('#main-content section').first();
    await expect(hero.getByRole('link', { name: 'Explore my work' })).toHaveAttribute('href', '#featured');
    await expect(hero.getByRole('link', { name: 'Start a project' })).toHaveAttribute('href', new RegExp(`^mailto:${site.email}`));
  });

  test('choosing a discipline hands the primary frame to that project', async ({ page }) => {
    await page.goto('/');
    const software = page.getByRole('radio', { name: new RegExp(featuredSoftware.title) });
    const web = page.getByRole('radio', { name: new RegExp(featuredWebsite.title) });

    await expect(software).toHaveAttribute('aria-checked', 'true');
    await expect(page.locator('[data-id="software"]')).toHaveAttribute('data-role', 'primary');
    await expect(heroCaption(page).getByRole('link')).toHaveAttribute('href', `#${featuredSoftware.slug}`);

    await web.click();
    await expect(web).toHaveAttribute('aria-checked', 'true');
    await expect(page.locator('[data-id="web"]')).toHaveAttribute('data-role', 'primary');
    await expect(page.locator('[data-id="software"]')).toHaveAttribute('data-role', 'support');
    await expect(heroCaption(page)).toContainText(featuredWebsite.title);
    await expect(heroCaption(page).getByRole('link')).toHaveAttribute('href', `#${featuredWebsite.slug}`);
  });

  test('clicking the supporting window hands it off too', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-id="web"]').click();
    await expect(page.locator('[data-id="web"]')).toHaveAttribute('data-role', 'primary');
    await expect(page.getByRole('radio', { name: new RegExp(featuredWebsite.title) })).toHaveAttribute('aria-checked', 'true');
  });

  test('rapid switching settles cleanly on the last choice', async ({ page }) => {
    await page.goto('/');
    const software = page.getByRole('radio', { name: new RegExp(featuredSoftware.title) });
    const web = page.getByRole('radio', { name: new RegExp(featuredWebsite.title) });
    for (let i = 0; i < 7; i++) await (i % 2 ? software : web).click({ delay: 0 });

    await expect(web).toHaveAttribute('aria-checked', 'true');
    await expect(page.locator('[data-id="web"]')).toHaveAttribute('data-role', 'primary');
    await expect
      .poll(() =>
        page.locator('[data-role]').evaluateAll((els) =>
          els.map((el) => `${el.getAnimations().length}|${getComputedStyle(el).transform}|${(el as HTMLElement).style.zIndex}`),
        ),
      )
      .toEqual(['0|none|', '0|none|']);
  });

  test('the dimension line attaches to the lit headline line', async ({ page, isMobile }) => {
    test.skip(isMobile, 'The line is drawn from tablet-landscape width up.');
    await page.goto('/');
    const web = page.getByRole('radio', { name: new RegExp(featuredWebsite.title) });
    await web.click();
    await page.waitForTimeout(900);
    const gap = await page.evaluate(() => {
      const line = document.querySelector('[data-lit="true"] > span')!;
      const range = document.createRange();
      range.selectNodeContents(line);
      const rects = range.getClientRects();
      const end = rects[rects.length - 1];
      const dot = document.querySelector('svg circle')!.getBoundingClientRect();
      return Math.hypot(dot.left + dot.width / 2 - end.right, dot.top + dot.height / 2 - (end.top + end.height / 2));
    });
    expect(gap).toBeLessThan(40);
  });

  test('the dimension line never crosses the headline and ends on the main window', async ({ page, isMobile }) => {
    test.skip(isMobile, 'The line is drawn from tablet-landscape width up.');
    const measure = () =>
      page.evaluate(() => {
        const path = document.querySelector('svg[data-ready] path') as SVGPathElement;
        const ctm = path.ownerSVGElement!.getScreenCTM()!;
        const total = path.getTotalLength();
        const points = Array.from({ length: 120 }, (_, i) => {
          const p = path.getPointAtLength((total * i) / 119).matrixTransform(ctm);
          return { x: p.x, y: p.y };
        });
        const words = [...document.querySelectorAll('#intro-title > span > span')].flatMap((line) => {
          const range = document.createRange();
          range.selectNodeContents(line);
          return [...range.getClientRects()];
        });
        // Points within a few pixels of the start dot sit just after the last word by design.
        const crossings = points
          .filter((p) => Math.hypot(p.x - points[0].x, p.y - points[0].y) > 8)
          .filter((p) => words.some((r) => p.x > r.left - 2 && p.x < r.right + 2 && p.y > r.top + 2 && p.y < r.bottom - 2)).length;
        const frame = document.querySelector('[data-role="primary"]')!.getBoundingClientRect();
        const end = points[points.length - 1];
        const onEdge =
          end.x >= frame.left - 2 && end.x <= frame.right + 2 && end.y >= frame.top - 2 && end.y <= frame.bottom + 2 &&
          Math.min(Math.abs(end.x - frame.left), Math.abs(end.y - frame.top)) <= 2;
        return { crossings, onEdge };
      });
    for (const width of [1024, 1280, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await expect(page.locator('svg[data-ready]')).toBeAttached();
      await page.waitForTimeout(900);
      expect(await measure(), `software at ${width}px`).toEqual({ crossings: 0, onEdge: true });
      await page.getByRole('radio', { name: new RegExp(featuredWebsite.title) }).click();
      await page.waitForTimeout(900);
      expect(await measure(), `website at ${width}px`).toEqual({ crossings: 0, onEdge: true });
    }
  });

  test('works as a radio group from the keyboard', async ({ page }) => {
    await page.goto('/');
    const software = page.getByRole('radio', { name: new RegExp(featuredSoftware.title) });
    const web = page.getByRole('radio', { name: new RegExp(featuredWebsite.title) });

    await expect(software).toHaveAttribute('tabindex', '0');
    await expect(web).toHaveAttribute('tabindex', '-1');
    await software.focus();
    await page.keyboard.press('ArrowRight');
    await expect(web).toBeFocused();
    await expect(web).toHaveAttribute('aria-checked', 'true');
    await page.keyboard.press('ArrowLeft');
    await expect(software).toBeFocused();
    await expect(software).toHaveAttribute('aria-checked', 'true');
  });

  test('a tap selects on touch screens', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Touch fallback.');
    await page.goto('/');
    const web = page.getByRole('radio', { name: new RegExp(featuredWebsite.title) });
    await web.tap();
    await expect(web).toHaveAttribute('aria-checked', 'true');
    await expect(heroCaption(page)).toContainText(featuredWebsite.title);
  });

  test('reduced motion swaps instantly without flight animations', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.getByRole('radio', { name: new RegExp(featuredWebsite.title) }).click();
    const running = await page.locator('[data-role]').evaluateAll((els) => els.map((el) => el.getAnimations().length));
    expect(running).toEqual([0, 0]);
    await expect(page.locator('[data-id="web"]')).toHaveAttribute('data-role', 'primary');
  });

  test('controls are comfortable to tap', async ({ page }) => {
    await page.goto('/');
    const controls = [
      page.getByRole('link', { name: 'Explore my work' }),
      page.locator('#main-content section').first().getByRole('link', { name: 'Start a project' }),
      ...((await page.getByRole('radio').all()) as ReturnType<Page['getByRole']>[]),
      page.locator(`#work-${moreExperiments[0].slug} a`).first(),
    ];
    for (const control of controls) {
      const box = await control.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
  });
});

test.describe('First load', () => {
  test('hero text and screenshots are visible from the first frame and only ever transformed', async ({ page }) => {
    await page.goto('/', { waitUntil: 'commit' });
    await page.locator('#intro-title').waitFor();
    const state = await page.evaluate(() =>
      [...document.querySelectorAll('#intro-title, #intro-title > span, [data-role], [data-role] img')].map((el) => ({
        opacity: getComputedStyle(el).opacity,
        clip: getComputedStyle(el).clipPath,
        animates: [...new Set(el.getAnimations().flatMap((a) => (a.effect as KeyframeEffect).getKeyframes().flatMap((k) => Object.keys(k))))]
          .filter((key) => !['offset', 'easing', 'composite', 'computedOffset'].includes(key))
          .join(','),
      })),
    );
    for (const item of state) {
      expect(item.opacity).toBe('1');
      expect(item.clip).toBe('none');
      expect(['', 'transform']).toContain(item.animates);
    }
    await expect(page.locator('[data-id="software"]')).toHaveAttribute('data-role', 'primary');
    await expect(page.locator('[data-id="web"]')).toHaveAttribute('data-role', 'support');
  });

  test('the timed entrance is over within a second and a half and leaves no transform behind', async ({ page, isMobile }) => {
    test.skip(isMobile, 'On phones the unfold follows scrolling instead of a timer.');
    await page.goto('/', { waitUntil: 'commit' });
    await page.locator('[data-role="primary"]').waitFor();
    const ends = await page.evaluate(() =>
      [...document.querySelectorAll('[data-role], #intro-title > span, [data-role="primary"] i')].flatMap((el) =>
        el.getAnimations().map((a) => Number(a.effect!.getComputedTiming().endTime)),
      ),
    );
    expect(ends.length).toBeGreaterThan(0);
    for (const end of ends) expect(end).toBeLessThanOrEqual(1500);
    await expect
      .poll(() => page.locator('[data-role]').evaluateAll((els) => els.map((el) => getComputedStyle(el).transform)), { timeout: 4000 })
      .toEqual(['none', 'none']);
  });

  test('on phones the unfold follows scrolling and settles once the windows are in view', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Phone-only behaviour.');
    await page.goto('/');
    const scrollDriven = await page.locator('[data-role="primary"]').evaluate((el) => el.getAnimations().some((a) => a.timeline !== document.timeline));
    test.skip(!scrollDriven, 'This browser has no scroll timelines; the timed entrance is used instead.');
    await page.locator('[data-role="primary"]').evaluate((el) => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await expect.poll(() => page.locator('[data-role="primary"]').evaluate((el) => getComputedStyle(el).transform)).toMatch(/^(none|matrix\(1, 0, 0, 1, 0, 0\))$/);
  });

  test('a choice made during the entrance wins immediately', async ({ page }) => {
    await page.goto('/', { waitUntil: 'commit' });
    const web = page.getByRole('radio', { name: new RegExp(featuredWebsite.title) });
    await web.click();
    await expect(web).toHaveAttribute('aria-checked', 'true');
    await expect(page.locator('[data-id="web"]')).toHaveAttribute('data-role', 'primary');
    await expect
      .poll(() => page.locator('[data-role]').evaluateAll((els) => els.map((el) => `${el.getAnimations().length}|${getComputedStyle(el).transform}`)))
      .toEqual(['0|none', '0|none']);
  });

  test('only the hero screenshots are fetched eagerly', async ({ page }) => {
    await page.goto('/');
    const eager = await page.locator('img[loading="eager"]').evaluateAll((imgs) => imgs.map((img) => img.closest('[data-role]') !== null));
    expect(eager).toEqual([true, true]);
  });
});

test.describe('Application walkthrough', () => {
  test('moves through steps with buttons and the keyboard', async ({ page }) => {
    await page.goto('/');
    const tour = tourOf(page);
    const caption = tour.getByRole('heading', { level: 4 });

    await expect(caption).toHaveText(steps[0].title);
    await expect(tour.getByRole('button', { name: 'Previous' })).toBeDisabled();
    // The step that follows is named beside the counter, not inside the button.
    await expect(tour.getByText(`Up next: ${steps[1].title}`)).toBeVisible();
    const next = tour.getByRole('button', { name: 'Next', exact: true });
    const height = (await next.boundingBox())!.height;
    expect(height).toBeLessThanOrEqual(48);
    await next.click();
    await expect(caption).toHaveText(steps[1].title);

    await tour.locator('[tabindex="0"]').focus();
    await page.keyboard.press('End');
    await expect(caption).toHaveText(steps.at(-1)!.title);
    await expect(tour.getByRole('button', { name: /^Next/ })).toHaveCount(0);
    await page.keyboard.press('ArrowLeft');
    await expect(caption).toHaveText(steps.at(-2)!.title);
    await page.keyboard.press('Home');
    await expect(caption).toHaveText(steps[0].title);

    await expect(tour.getByText('Demonstration data')).toBeVisible();
  });

  test('steps are arranged as a sequence around the current one', async ({ page }) => {
    await page.goto('/');
    const tour = tourOf(page);
    await tour.getByRole('button', { name: 'Next' }).click();
    await tour.getByRole('button', { name: 'Next' }).click();
    const positions = await tour.locator('[data-pos]').evaluateAll((els) => els.map((el) => el.getAttribute('data-pos')));
    const steps = featuredSoftware.walkthrough!.length;
    expect(positions).toEqual(['before', 'before', 'current', ...Array<string>(steps - 3).fill('after')]);
  });

  test('shows one step at a time, with progress segments that jump and a note that opens', async ({ page }) => {
    await page.goto('/');
    const tour = tourOf(page);
    // Only the current step's title is on screen: no list of every step.
    for (const later of steps.slice(2)) await expect(tour.getByText(later.title, { exact: true })).toHaveCount(0);
    await expect(tour.getByText(`01 / ${String(steps.length).padStart(2, '0')}`)).toBeVisible();
    const segment = tour.getByRole('button', { name: `Go to step 4: ${steps[3].title}` });
    await segment.click();
    await expect(tour.getByRole('heading', { level: 4 })).toHaveText(steps[3].title);
    await expect(segment).toHaveAttribute('aria-current', 'step');
    await tour.getByText('How it works').click();
    await expect(tour.getByText(steps[3].detail)).toBeVisible();
  });

  test('the last step offers to start again', async ({ page }) => {
    await page.goto('/');
    const tour = tourOf(page);
    await tour.getByRole('button', { name: `Go to step ${steps.length}: ${steps.at(-1)!.title}` }).click();
    await tour.getByRole('button', { name: 'Start again' }).click();
    await expect(tour.getByRole('heading', { level: 4 })).toHaveText(steps[0].title);
  });

  test('swipes between steps on touch screens', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Swipe is a touch interaction.');
    await page.goto('/');
    const tour = tourOf(page);
    const stage = tour.locator('[tabindex="0"]');
    const box = (await stage.boundingBox())!;
    const y = box.y + box.height / 2;
    await stage.dispatchEvent('pointerdown', { pointerType: 'touch', clientX: box.x + box.width * 0.8, clientY: y });
    await stage.dispatchEvent('pointerup', { pointerType: 'touch', clientX: box.x + box.width * 0.2, clientY: y });
    await expect(tour.getByRole('heading', { level: 4 })).toHaveText(steps[1].title);
  });
});

test.describe('Full-length website preview', () => {
  test('responds to the keyboard', async ({ page }) => {
    await page.goto('/');
    const slider = viewerSlider(page);
    await slider.scrollIntoViewIfNeeded();
    await waitForFullPage(slider);

    await slider.focus();
    await page.keyboard.press('End');
    await expect(slider).toHaveAttribute('aria-valuetext', 'Bottom of the page');
    await page.keyboard.press('Home');
    await expect(slider).toHaveAttribute('aria-valuetext', 'Top of the page');
  });

  test('can be dragged with a mouse without selecting text', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Mouse drag is a desktop interaction.');
    await page.goto('/');
    const slider = viewerSlider(page);
    await slider.scrollIntoViewIfNeeded();
    await waitForFullPage(slider);

    const rail = (await slider.boundingBox())!;
    await page.mouse.move(rail.x + rail.width / 2, rail.y + 10);
    await page.mouse.down();
    await page.mouse.move(rail.x + rail.width / 2, rail.y + rail.height + 40, { steps: 8 });
    await page.mouse.up();
    await expect(slider).toHaveAttribute('aria-valuetext', 'Bottom of the page');
    expect(await page.evaluate(() => String(window.getSelection()).length)).toBe(0);
  });

  test('preview size follows the screen and only that capture downloads', async ({ page, isMobile }) => {
    const requested: string[] = [];
    page.on('request', (req) => {
      const url = decodeURIComponent(req.url());
      if (url.includes(`/work/${featuredWebsite.slug}/`)) requested.push(url);
    });
    await page.goto('/');
    const slider = viewerSlider(page);
    await slider.scrollIntoViewIfNeeded();
    await waitForFullPage(slider);

    const pressed = page
      .locator(`#${featuredWebsite.slug}`)
      .getByRole('button', { name: isMobile ? 'Phone' : 'Desktop', exact: true });
    await expect(pressed).toHaveAttribute('aria-pressed', 'true');
    expect(requested.some((url) => url.includes(isMobile ? 'desktop-full' : 'phone-full'))).toBe(false);
  });

  test('auto-scroll is hidden when the visitor prefers reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Auto-scroll' })).toBeHidden();
  });
});

test.describe('Selected work gallery', () => {
  test('shows the main projects as cards and the rest as a short list', async ({ page }) => {
    await page.goto('/');
    const gallery = page.locator('#work');
    await expect(gallery.locator(':scope ul').first().locator(':scope > li')).toHaveCount(galleryCards.length);
    await expect(gallery.getByRole('heading', { level: 3, name: 'More experiments' })).toBeVisible();
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
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) await expect(page.locator(href)).toBeAttached();
  });

  test('hero projects are not repeated in the gallery', async ({ page }) => {
    await page.goto('/');
    const heroSlugs = Object.values(heroProjects).map((p) => p.slug);
    expect(galleryProjects.map((p) => p.slug).filter((slug) => heroSlugs.includes(slug))).toEqual([]);
    for (const slug of heroSlugs) {
      await expect(page.locator(`#work-${slug}`)).toHaveCount(0);
      // Each hero project still has its own showcase section to link to.
      await expect(page.locator(`#${slug}`)).toHaveCount(1);
    }
    const tileIds = await page.locator('#work ul > li article').evaluateAll((els) => els.map((el) => el.id));
    expect(new Set(tileIds).size).toBe(tileIds.length);
  });

  test('the default view mixes software and websites near the top', async ({ page }) => {
    await page.goto('/');
    const firstFour = await page
      .locator('#work ul > li')
      .evaluateAll((els) => els.slice(0, 4).map((el) => el.getAttribute('data-category')));
    expect(firstFour).toContain('software');
    expect(firstFour).toContain('web');
  });

  test('every project shows its provenance and verified links', async ({ page }) => {
    await page.goto('/');
    for (const project of galleryProjects) {
      const tile = page.locator(`#work-${project.slug}`);
      await expect(tile.getByRole('heading', { name: project.title })).toBeVisible();
      await expect(tile.getByText(`${project.medium}, ${project.year}`, { exact: true }).filter({ visible: true })).toHaveCount(1);
      await expect(tile.getByText(project.provenance, { exact: false }).filter({ visible: true })).toHaveCount(1);
      for (const link of project.links) {
        await expect(tile.locator(`a[href="${link.href}"]`).filter({ visible: true })).toHaveCount(1);
      }
    }
  });

  test('website projects open a full-page preview dialog and return focus', async ({ page }) => {
    await page.goto('/');
    const project = galleryCards.find((p) => p.captures && p.brand)!;
    const trigger = page.getByRole('button', { name: `View the full ${project.title} page` });
    await trigger.click();

    const dialog = page.getByRole('dialog', { name: project.title });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('slider')).toHaveAttribute('aria-disabled', 'false', { timeout: 20_000 });
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });
});

test.describe('Services and contact', () => {
  test('pointing at a service lights the part of the stack it covers', async ({ page }) => {
    await page.goto('/');
    const services = page.locator('#services');
    const lit = () => services.locator('ol li[data-on="true"]').allTextContents();
    await expect.poll(lit).toEqual(['Data', 'Logic', 'Interface', 'Design']);

    await services.getByRole('link', { name: 'Valence Capital' }).focus();
    await expect.poll(lit).toEqual(['Interface', 'Design']);
    await expect(services.getByText('Websites, stores and landing pages').last()).toBeVisible();

    await services.getByRole('link', { name: 'QuickAid' }).focus();
    await expect.poll(lit).toEqual(['Data', 'Logic', 'Interface']);
  });

  test('service examples link to sections that exist', async ({ page }) => {
    await page.goto('/');
    const hrefs = await page.locator('#services a[href^="#"]').evaluateAll((links) => links.map((a) => a.getAttribute('href')!));
    expect(hrefs.length).toBe(8);
    for (const href of hrefs) await expect(page.locator(href)).toHaveCount(1);
  });

  test('the email address can be copied and stays a visible mail link', async ({ page, context, browserName }) => {
    test.skip(browserName !== 'chromium', 'Clipboard permissions are Chromium-only in Playwright.');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/');
    const contact = page.locator('#contact');
    await expect(contact.getByRole('link', { name: site.email })).toHaveAttribute('href', new RegExp(`^mailto:${site.email}`));
    await contact.getByRole('button', { name: 'Copy address' }).click();
    await expect(contact.getByRole('button', { name: 'Address copied' })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(site.email);
  });
});

test.describe('Responsive boundaries', () => {
  test('the hero and the tour fit on common laptop screens without scrolling to reach their controls', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Laptop and desktop heights.');
    for (const [width, height] of [[1024, 768], [1280, 720], [1280, 800], [1366, 768], [1440, 900], [1536, 864], [1920, 1080]]) {
      await page.setViewportSize({ width, height });
      await page.goto('/');
      await expect(page.locator('[data-live="ready"]').first()).toBeAttached({ timeout: 10_000 });
      const heroBottom = await page.evaluate(() => {
        const last = [...document.querySelectorAll('[class*="tryRow"] button, [role="radiogroup"][aria-label="Show a discipline"]')];
        return Math.max(...last.map((el) => el.getBoundingClientRect().bottom));
      });
      expect(heroBottom, `hero controls at ${width}x${height}`).toBeLessThanOrEqual(height);
      const stageWidth = await page.locator('[aria-label^="Guided tour of"] [tabindex="0"]').evaluate((el) => el.getBoundingClientRect().width);
      expect(stageWidth, `tour screen width at ${width}x${height}`).toBeGreaterThan(600);
      const tourOverflow = await page.evaluate(() => {
        const header = document.querySelector('header')!.getBoundingClientRect().height;
        const tour = document.querySelector('[aria-label^="Guided tour of"]')!;
        const nav = tour.querySelector('nav')!;
        return nav.getBoundingClientRect().bottom - tour.getBoundingClientRect().top - (innerHeight - header);
      });
      expect(tourOverflow, `tour controls at ${width}x${height}`).toBeLessThanOrEqual(0);
    }
  });

  test('the header stays on one row on phones', async ({ page }) => {
    await page.goto('/');
    const banner = page.getByRole('banner');
    for (const width of [320, 360, 390, 430, 600]) {
      await page.setViewportSize({ width, height: 800 });
      expect((await banner.boundingBox())!.height, `header height at ${width}px`).toBeLessThanOrEqual(64.5);
      await expect(banner.getByRole('link', { name: 'Contact' }).or(banner.getByRole('link', { name: 'Start a project' }))).toBeVisible();
      await expect(banner.getByRole('button', { name: 'Ask about my work' })).toBeVisible();
    }
  });

  test('the header stays on one row at tablet and desktop widths', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Section links are shown from tablet width up.');
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const banner = page.getByRole('banner');
    const desktop = (await banner.boundingBox())!.height;
    await expect(banner.getByRole('link', { name: 'Pricing' })).toHaveCount(0);
    await expect(page.locator('#working')).toHaveCount(0);
    for (const width of [768, 800, 912, 1024, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      expect((await banner.boundingBox())!.height, `header height at ${width}px`).toBeLessThanOrEqual(desktop + 0.5);
    }
  });

  const widths = [320, 344, 375, 430, 600, 768, 912, 1024, 1366, 1920];

  test('no overflow and no collisions in the header or hero at any width', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Widths are set explicitly; one project is enough.');
    test.setTimeout(90_000);
    await page.goto('/');
    await page.evaluate(() => Promise.allSettled(document.getAnimations().filter((x) => x.timeline === document.timeline).map((x) => x.finished)));
    for (const width of widths) {
      await page.setViewportSize({ width, height: width < 768 ? 780 : 900 });
      // Overflow is measured with motion live; geometry is measured with everything at rest,
      // because scroll-driven pieces below the fold wait off-position by design.
      const liveOverflow = await page.evaluate(() => {
        document.getElementById('still')?.remove();
        return document.documentElement.scrollWidth - document.documentElement.clientWidth;
      });
      expect(liveOverflow, `live overflow at ${width}px`).toBe(0);
      await page.evaluate(() => {
        const still = document.createElement('style');
        still.id = 'still';
        still.textContent = '*,*::before,*::after{animation:none!important}';
        document.head.appendChild(still);
      });
      const report = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        const box = (el: Element) => el.getBoundingClientRect();
        const hit = (a: DOMRect, b: DOMRect) => !(a.right <= b.left + 1 || b.right <= a.left + 1 || a.bottom <= b.top + 1 || b.bottom <= a.top + 1);
        const visible = (el: Element) => box(el).width > 0 && getComputedStyle(el).display !== 'none';
        const header = [...document.querySelector('header')!.querySelectorAll(':scope > div > *')].filter(visible).map(box);
        const frames = [...document.querySelectorAll('[data-role] > :first-child')].map(box);
        // Text inside a window (the live demos) is part of that window's picture, not page text.
        const text = [...document.querySelectorAll('#intro-title span span, #main-content > section p')]
          .filter((el) => visible(el) && !el.closest('[data-role]'))
          .map(box);
        const controls = [...document.querySelectorAll('#main-content > section a, #main-content > section button')].filter(visible).map(box);
        return {
          overflow: document.documentElement.scrollWidth - vw,
          headerCollision: header.some((a, i) => header.some((b, j) => j > i && hit(a, b))),
          frameOffscreen: frames.some((f) => f.left < 0 || f.right > vw),
          frameOverText: frames.some((f) => text.some((t) => hit(f, t))),
          controlsOverFrames: controls.some((c) => frames.some((f) => hit(c, f))),
          controlCollision: controls.some((a, i) => controls.some((b, j) => j > i && hit(a, b))),
        };
      });
      expect(report, `at ${width}px`).toEqual({
        overflow: 0,
        headerCollision: false,
        frameOffscreen: false,
        frameOverText: false,
        controlsOverFrames: false,
        controlCollision: false,
      });
    }
  });

  test('the preview dialog is usable on a small phone', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Small-screen dialog check.');
    await page.setViewportSize({ width: 344, height: 640 });
    await page.goto('/');
    const project = galleryCards.find((p) => p.captures)!;
    await page.getByRole('button', { name: `View the full ${project.title} page` }).click();
    const dialog = page.getByRole('dialog', { name: project.title });
    await expect(dialog).toBeVisible();
    const close = dialog.getByRole('button', { name: 'Close preview' });
    // Measure once the sheet has finished growing out of its card.
    await expect.poll(() => dialog.evaluate((el) => el.getAnimations({ subtree: true }).length)).toBe(0);
    await expect(close).toBeInViewport();
    const closeBox = (await close.boundingBox())!;
    expect(closeBox.height).toBeGreaterThanOrEqual(44);
    const fits = await dialog.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return r.left >= 0 && r.right <= window.innerWidth && r.top >= 0 && r.bottom <= window.innerHeight;
    });
    expect(fits).toBe(true);
    await expect(dialog.getByRole('slider')).toHaveAttribute('aria-disabled', 'false', { timeout: 20_000 });
    await close.click();
    await expect(dialog).toBeHidden();
  });
});

test.describe('Without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('projects, services and contact stay crawlable', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('radio')).toHaveCount(2);
    await expect(page.getByRole('link', { name: 'Explore my work' })).toBeVisible();
    for (const project of projects) {
      await expect(page.getByRole('heading', { name: project.title }).first()).toBeAttached();
      await expect(page.getByText(project.summary).first()).toBeAttached();
    }
    for (const step of steps) await expect(page.getByText(step.title).first()).toBeAttached();
    await expect(page.getByRole('heading', { name: 'What I can build for you' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'How I work' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'About me' })).toBeVisible();
    const about = page.locator('#about');
    await expect(about.getByText('I like building software that’s actually useful to someone.', { exact: false })).toBeVisible();
    await expect(about.getByText(site.availability)).toBeVisible();
    await expect(page.getByRole('link', { name: site.email })).toBeVisible();
  });
});

test.describe('UX audit fixes', () => {
  test('the homepage outline never skips a heading level', async ({ page }) => {
    await page.goto('/');
    const levels = await page.locator('main h1, main h2, main h3, main h4, footer h2').evaluateAll((hs) => hs.map((h) => Number(h.tagName[1])));
    for (let i = 1; i < levels.length; i++) expect(levels[i] - levels[i - 1], `heading ${i}`).toBeLessThanOrEqual(1);
  });

  test('each featured project is named before its work, in reading and focus order', async ({ page }) => {
    await page.goto('/');
    for (const id of ['rowszeins-delight', 'thread-and-form']) {
      const order = await page.locator(`#${id}`).evaluate((article) => {
        const title = article.querySelector('h3')!;
        const work = article.querySelector('[data-reveal="frame"]')!;
        return title.compareDocumentPosition(work) & Node.DOCUMENT_POSITION_FOLLOWING ? 'title first' : 'work first';
      });
      expect(order, id).toBe('title first');
    }
  });

  test('on phones the window being tried sits in front of the other one', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'The windows overlap on phones.');
    await page.goto('/');
    await expect(page.locator('[data-live="ready"]').first()).toBeAttached({ timeout: 10_000 });
    const front = await page.evaluate(() => {
      const primary = document.querySelector('[data-role="primary"]')!;
      const support = document.querySelector('[data-role="support"]')!;
      const a = primary.getBoundingClientRect();
      const b = support.getBoundingClientRect();
      // A point inside both windows: the overlap's centre.
      const x = (Math.max(a.left, b.left) + Math.min(a.right, b.right)) / 2;
      const y = (Math.max(a.top, b.top) + Math.min(a.bottom, b.bottom)) / 2;
      primary.scrollIntoView({ block: 'center' });
      const r = primary.getBoundingClientRect();
      const top = document.elementFromPoint(x, r.top + (y - a.top));
      return primary.contains(top) ? 'primary' : support.contains(top) ? 'support' : 'neither';
    });
    expect(front).toBe('primary');
  });

  test('the full-screen button keeps its distance from the sale buttons', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'The full-screen button is for phones.');
    await page.goto('/');
    const trigger = page.getByRole('button', { name: 'Try it full screen' });
    await expect(trigger).toBeVisible({ timeout: 15_000 });
    const gap = await page.evaluate(() => {
      const buttons = [...document.querySelectorAll('[role="group"][aria-label="Try Rowszein’s Delight"] button')].filter((b) => !b.closest('dialog'));
      const lowest = Math.max(...buttons.map((b) => b.getBoundingClientRect().bottom));
      const t = [...document.querySelectorAll('button')].find((b) => b.textContent?.includes('Try it full screen'))!;
      return t.getBoundingClientRect().top - lowest;
    });
    expect(gap).toBeGreaterThanOrEqual(12);
  });
});

