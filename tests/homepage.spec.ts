import { expect, test, type Page } from '@playwright/test';
import { categoryLabels, featuredSoftware, featuredWebsite, projects } from '../src/data/projects';
import { site } from '../src/data/site';

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
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https?:\/\/[^/]+\/?$/);

    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    const ogResponse = await request.get(new URL(ogImage!).pathname + new URL(ogImage!).search);
    expect(ogResponse.ok()).toBe(true);
    expect(ogResponse.headers()['content-type']).toContain('image/png');

    const blocks = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((t) => JSON.parse(t));
    const person = blocks.flatMap((b) => b['@graph'] ?? []).find((node) => node['@type'] === 'Person');
    expect(person.name).toBe(site.name);
    expect(person.email).toBe(`mailto:${site.email}`);
    expect(person.jobTitle).toMatch(/software engineer/i);
    const list = blocks.find((b) => b['@type'] === 'ItemList');
    expect(list.itemListElement).toHaveLength(projects.length);
  });

  test('sitemap lists only routes that exist', async ({ request }) => {
    const sitemap = await (await request.get('/sitemap.xml')).text();
    expect(sitemap.match(/<loc>/g)).toHaveLength(1);
    expect(await (await request.get('/robots.txt')).text()).toContain('Sitemap:');
  });
});

test.describe('Homepage structure', () => {
  test('leads with the proposition, then software and website work', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Software that works.Experiences that stand out.');

    const order = await page.evaluate(() =>
      ['intro-title', 'featured', 'work', 'services', 'about', 'contact'].map(
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
      page.locator('#work').getByRole('button', { name: /^All work/ }),
    ];
    for (const control of controls) {
      const box = await control.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
  });
});

test.describe('Application walkthrough', () => {
  test('moves through steps with buttons and the keyboard', async ({ page }) => {
    await page.goto('/');
    const tour = tourOf(page);
    const caption = tour.getByRole('heading', { level: 4 });

    await expect(caption).toHaveText(steps[0].title);
    await expect(tour.getByRole('button', { name: 'Previous' })).toBeDisabled();
    await tour.getByRole('button', { name: 'Next' }).click();
    await expect(caption).toHaveText(steps[1].title);

    await tour.locator('[tabindex="0"]').focus();
    await page.keyboard.press('End');
    await expect(caption).toHaveText(steps.at(-1)!.title);
    await expect(tour.getByRole('button', { name: 'Next' })).toBeDisabled();
    await page.keyboard.press('ArrowLeft');
    await expect(caption).toHaveText(steps.at(-2)!.title);
    await page.keyboard.press('Home');
    await expect(caption).toHaveText(steps[0].title);

    await expect(tour.getByText('Demonstration data')).toBeVisible();
  });

  test('step list jumps directly and the technical note opens', async ({ page, isMobile }) => {
    test.skip(isMobile, 'The step list is shown from tablet width up; phones use previous and next.');
    await page.goto('/');
    const tour = tourOf(page);
    await tour.getByRole('button', { name: steps[3].title }).click();
    await expect(tour.getByRole('button', { name: steps[3].title })).toHaveAttribute('aria-current', 'step');
    await tour.getByText('How it works').click();
    await expect(tour.getByText(steps[3].detail)).toBeVisible();
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
  test('filters by category and announces the result', async ({ page }) => {
    await page.goto('/');
    const gallery = page.locator('#work');
    const items = gallery.locator('ul > li');
    await expect(items).toHaveCount(projects.length);

    for (const category of ['software', 'web', 'experiments'] as const) {
      const expected = projects.filter((p) => p.category === category).length;
      await gallery.getByRole('button', { name: new RegExp(`^${categoryLabels[category]}`) }).click();
      await expect(items).toHaveCount(expected);
      await expect(gallery.getByText(`Showing ${expected} projects in ${categoryLabels[category]}`)).toBeAttached();
    }
    await gallery.getByRole('button', { name: /^All work/ }).click();
    await expect(items).toHaveCount(projects.length);
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
    for (const project of projects) {
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
    const project = projects.find((p) => p.captures && p.brand)!;
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
    await expect(page.getByRole('link', { name: site.email })).toBeVisible();
  });
});
