import { expect, test, type Page } from '@playwright/test';
import { collection, featured, projects, supporting } from '../src/data/projects';
import { site } from '../src/data/site';

const featuredSlider = (page: Page) =>
  page.getByRole('slider', { name: `Scroll position in the ${featured.title} page` });

const waitForFullPage = (slider: ReturnType<typeof featuredSlider>) =>
  expect(slider).toHaveAttribute('aria-disabled', 'false', { timeout: 20_000 });

test.describe('Homepage, Full Length / Gallery Edition', () => {
  test('has metadata, canonical URL, social image and structured data', async ({ page, request }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/James De Mesa/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /WordPress/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https?:\/\/[^/]+\/?$/);

    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(ogImage).toBeTruthy();
    const ogResponse = await request.get(new URL(ogImage!).pathname + new URL(ogImage!).search);
    expect(ogResponse.ok()).toBe(true);
    expect(ogResponse.headers()['content-type']).toContain('image/png');

    const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
    const parsed = jsonLd.map((text) => JSON.parse(text));
    expect(parsed.some((block) => JSON.stringify(block).includes('"Person"'))).toBe(true);
    const list = parsed.find((block) => block['@type'] === 'ItemList');
    expect(list.itemListElement).toHaveLength(projects.length);
  });

  test('sitemap lists only routes that exist', async ({ request }) => {
    const sitemap = await (await request.get('/sitemap.xml')).text();
    expect(sitemap.match(/<loc>/g)).toHaveLength(1);
    const robots = await (await request.get('/robots.txt')).text();
    expect(robots).toContain('Sitemap:');
  });

  test('leads with a concise intro and a visible contact action', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Websites, built to be looked at closely.');
    await expect(page.locator('a[href="#main-content"]')).toBeAttached();

    const headerCta = page.getByRole('banner').getByRole('link', { name: 'Start a project' });
    await expect(headerCta).toBeVisible();
    await expect(headerCta).toHaveAttribute('href', new RegExp(`^mailto:${site.email}`));
  });

  test('shows the featured site above the fold', async ({ page }) => {
    await page.goto('/');
    const frame = page.locator('[data-loaded]').filter({ visible: true }).first();
    const box = await frame.boundingBox();
    const viewport = page.viewportSize()!;
    expect(box).not.toBeNull();
    expect(box!.y).toBeLessThan(viewport.height);
  });

  test('full-length preview responds to the keyboard', async ({ page }) => {
    await page.goto('/');
    const slider = featuredSlider(page);
    await waitForFullPage(slider);

    await slider.focus();
    await page.keyboard.press('End');
    await expect(slider).toHaveAttribute('aria-valuetext', 'Bottom of the page');
    await page.keyboard.press('PageUp');
    await expect(slider).toHaveAttribute('aria-valuenow', /^(8\d|9\d)$/);
    await page.keyboard.press('Home');
    await expect(slider).toHaveAttribute('aria-valuetext', 'Top of the page');
  });

  test('full-length preview can be dragged with a mouse without selecting text', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Mouse drag is a desktop interaction; touch is covered separately.');
    await page.goto('/');
    const slider = featuredSlider(page);
    await waitForFullPage(slider);

    const rail = (await slider.boundingBox())!;
    await page.mouse.move(rail.x + rail.width / 2, rail.y + 10);
    await page.mouse.down();
    await page.mouse.move(rail.x + rail.width / 2, rail.y + rail.height + 40, { steps: 8 });
    await page.mouse.up();

    await expect(slider).toHaveAttribute('aria-valuetext', 'Bottom of the page');
    expect(await page.evaluate(() => String(window.getSelection()).length)).toBe(0);
  });

  test('preview size follows the screen and can be switched', async ({ page, isMobile }) => {
    await page.goto('/');
    const desktop = page.getByRole('button', { name: 'Desktop', exact: true });
    const phone = page.getByRole('button', { name: 'Phone', exact: true });

    await expect(isMobile ? phone : desktop).toHaveAttribute('aria-pressed', 'true');
    await (isMobile ? desktop : phone).click();
    await expect(isMobile ? desktop : phone).toHaveAttribute('aria-pressed', 'true');
    await expect(featuredSlider(page)).toHaveAttribute('aria-disabled', 'false', { timeout: 20_000 });
  });

  test('only the capture for the current screen size is downloaded', async ({ page, isMobile }) => {
    const requested: string[] = [];
    page.on('request', (req) => {
      const url = decodeURIComponent(req.url());
      if (url.includes(`/work/${featured.slug}/`)) requested.push(url);
    });
    await page.goto('/');
    await waitForFullPage(featuredSlider(page));

    const hidden = isMobile ? 'desktop-' : 'phone-';
    expect(requested.some((url) => url.includes(hidden))).toBe(false);
  });

  test('auto-scroll is hidden when the visitor prefers reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Auto-scroll' })).toBeHidden();
  });

  test('supporting projects open a full-page preview dialog and return focus', async ({ page }) => {
    await page.goto('/');
    const [first] = supporting;
    const trigger = page.getByRole('button', { name: `View the full ${first.title} page` });
    await trigger.click();

    const dialog = page.getByRole('dialog', { name: first.title });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('slider')).toHaveAttribute('aria-disabled', 'false', { timeout: 20_000 });
    await expect(dialog.getByRole('link', { name: /Visit the live site/ })).toHaveAttribute('href', first.liveUrl);

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('every project shows its classification and verified links', async ({ page }) => {
    await page.goto('/');
    for (const project of [featured, ...supporting, ...collection]) {
      const item = page.locator(`#${project.slug}`);
      await expect(item.getByRole('heading', { name: project.title })).toBeVisible();
      // The closed preview dialog repeats the provenance, so only count what is on screen.
      await expect(item.getByText(project.provenance).filter({ visible: true })).toHaveCount(1);
      await expect(item.locator(`a[href="${project.liveUrl}"]`).filter({ visible: true })).toHaveCount(1);
      await expect(item.locator(`a[href="${project.repoUrl}"]`).filter({ visible: true })).toHaveCount(1);
    }
  });

  test('has no horizontal overflow', async ({ page }) => {
    await page.goto('/');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBe(0);
  });
});

test.describe('Without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('project titles, summaries, services and links stay crawlable', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    for (const project of projects) {
      await expect(page.getByRole('heading', { name: project.title }).first()).toBeAttached();
      await expect(page.getByText(project.summary).first()).toBeAttached();
    }
    await expect(page.getByRole('heading', { name: 'What I can build for you' })).toBeVisible();
    // The featured poster is a real image in the HTML, so the static fallback still shows the site.
    await expect(page.locator(`img[src*="${encodeURIComponent(featured.captures!.desktop.poster.src)}"]`).first()).toBeAttached();
  });
});
