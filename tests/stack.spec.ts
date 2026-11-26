import { expect, test, type Page } from '@playwright/test';
import { featuredSoftware, featuredWebsite } from '../src/data/projects';
import { tableGroups, traceSteps } from '../src/data/rowszein-trace';

const CLOSED = 'See what’s underneath';
const OPEN = 'Put it back together';

const hero = (page: Page) => page.locator('[data-active][data-entrance]');
const scene = (page: Page) => page.locator('[data-stack-scene]');
const toggle = (page: Page) => page.getByRole('button', { name: new RegExp(`${CLOSED}|${OPEN}`) });
const layer = (page: Page, id: string) => page.locator(`[data-layer="${id}"]`);

async function ready(page: Page) {
  await expect(page.locator('[data-live="ready"]').first()).toBeAttached({ timeout: 10_000 });
  await expect(toggle(page)).toBeVisible();
}

/** Waits until the scene and its layers have no running transitions or animations. */
async function settled(page: Page) {
  await expect.poll(() => scene(page).evaluate((el) => el.getAnimations({ subtree: true }).length)).toBe(0);
}

test.describe('The software stack', () => {
  test.beforeEach(async ({ page, isMobile }) => {
    test.skip(isMobile, 'Desktop hero; phones are covered by the overflow check below.');
    await page.goto('/');
    await ready(page);
  });

  test('the stack rests closed at a gentle tilt and the window itself carries no transform', async ({ page }) => {
    await expect(toggle(page)).toHaveAccessibleName(CLOSED);
    await expect(toggle(page)).not.toHaveAttribute('aria-pressed');
    expect(await scene(page).evaluate((el) => getComputedStyle(el).transform)).not.toBe('none');
    await expect
      .poll(() => page.locator('[data-role]').evaluateAll((els) => els.map((el) => getComputedStyle(el).transform)), {
        timeout: 4000,
      })
      .toEqual(['none', 'none']);
    expect(await layer(page, 'design').evaluate((el) => getComputedStyle(el).opacity)).toBe('0');
  });

  test('the button opens and closes the stack, by mouse and keyboard', async ({ page }) => {
    await toggle(page).click();
    await expect(toggle(page)).toHaveAccessibleName(OPEN);
    await expect(toggle(page)).not.toHaveAttribute('aria-pressed');
    await expect(hero(page)).toHaveAttribute('data-stack', 'open');
    await expect(scene(page)).toHaveAttribute('data-open', 'true');

    await toggle(page).focus();
    await page.keyboard.press('Space');
    await expect(toggle(page)).toHaveAccessibleName(CLOSED);
    await expect(hero(page)).toHaveAttribute('data-stack', 'closed');
    await expect(scene(page)).toHaveAttribute('data-open', 'false');

    await page.keyboard.press('Enter');
    await expect(toggle(page)).toHaveAccessibleName(OPEN);
    await expect(scene(page)).toHaveAttribute('data-open', 'true');
  });

  test('rapid presses end in the state of the last press', async ({ page }) => {
    for (let i = 0; i < 5; i++) await toggle(page).click({ delay: 0 });
    await expect(toggle(page)).toHaveAccessibleName(OPEN);
    await expect(scene(page)).toHaveAttribute('data-open', 'true');
    const pageMs = await page.evaluate(() =>
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--dur-page')),
    );
    await page.waitForTimeout(pageMs + 300);
    await settled(page);
    await expect(toggle(page)).toHaveAccessibleName(OPEN);
    await expect(scene(page)).toHaveAttribute('data-open', 'true');
  });

  test('opening never changes the hero’s layout size', async ({ page }) => {
    const size = () =>
      hero(page).evaluate((el) => {
        const { width, height } = el.getBoundingClientRect();
        return { width, height };
      });
    const closed = await size();
    await toggle(page).click();
    await settled(page);
    expect(await size()).toEqual(closed);
  });

  test('switching to Websites closes the stack and clears the focus state', async ({ page }) => {
    await toggle(page).click();
    await expect(hero(page)).toHaveAttribute('data-stack', 'open');
    await page.getByRole('radio', { name: new RegExp(featuredWebsite.title) }).click();
    await expect(toggle(page)).toHaveCount(0);
    await expect(hero(page)).not.toHaveAttribute('data-stack', 'open');
    await expect
      .poll(() =>
        hero(page)
          .locator(':scope > [class*="copy"]')
          .evaluate((el) => getComputedStyle(el).opacity),
      )
      .toBe('1');

    await page.getByRole('radio', { name: new RegExp(featuredSoftware.title) }).click();
    await expect(toggle(page)).toHaveAccessibleName(CLOSED);
    await expect(scene(page)).toHaveAttribute('data-open', 'false');
  });

  test('while open, the dimmed hero copy leaves the tab order', async ({ page }) => {
    const copy = hero(page).locator(':scope > [class*="copy"]');
    await toggle(page).click();
    await expect(copy).toHaveAttribute('inert', '');
    await toggle(page).focus();
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Shift+Tab');
      expect(await copy.evaluate((el) => el.contains(document.activeElement)), `focus after ${i + 1} Shift+Tab`).toBe(false);
    }
    await toggle(page).click();
    await expect(copy).not.toHaveAttribute('inert');
    await expect(copy.getByRole('link', { name: 'Explore my work' })).toBeVisible();
  });

  test('the open stack names the real steps and tables', async ({ page }) => {
    await toggle(page).click();
    for (const step of traceSteps) await expect(layer(page, 'logic')).toContainText(step.title);
    for (const group of tableGroups) {
      await expect(layer(page, 'data')).toContainText(group.name);
      for (const { table } of group.tables) await expect(layer(page, 'data')).toContainText(table);
    }
  });
});

test.describe('The software stack at every size', () => {
  test('with the stack open, the switch and sale buttons stay on screen at laptop sizes', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Laptop heights.');
    for (const [width, height] of [
      [1024, 768],
      [1280, 720],
      [1366, 768],
      [1440, 900],
    ]) {
      await page.setViewportSize({ width, height });
      await page.goto('/');
      await ready(page);
      await toggle(page).click();
      await expect(scene(page)).toHaveAttribute('data-open', 'true');
      const heroBottom = await page.evaluate(() => {
        const last = [
          ...document.querySelectorAll('[class*="tryRow"] button, [role="radiogroup"][aria-label="Show a discipline"]'),
        ];
        return Math.max(...last.map((el) => el.getBoundingClientRect().bottom));
      });
      expect(heroBottom, `hero controls at ${width}x${height}`).toBeLessThanOrEqual(height);
    }
  });

  test('no horizontal overflow with the stack open', async ({ page }) => {
    for (const width of [320, 375, 768, 1280, 1440]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/');
      await ready(page);
      await toggle(page).click();
      await settled(page);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `overflow at ${width}px`).toBe(true);
    }
  });
});
