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

/** Marks the peek as already shown this session, so tests that are not about it see the stack at rest. */
const skipPeek = (page: Page) => page.addInitScript(() => sessionStorage.setItem('stack-peeked', '1'));

test.describe('The software stack', () => {
  test.beforeEach(async ({ page, isMobile }) => {
    test.skip(isMobile, 'Desktop hero; phones are covered by the overflow check below.');
    await skipPeek(page);
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

test.describe('A sale through the stack', () => {
  const HINT = 'Your sale went underneath too';
  const BALANCE_CHECK = 'Work out every new balance before writing anything';
  const sales = (page: Page) => page.getByRole('group', { name: 'Try Rowszein’s Delight' });
  const sell = (page: Page, product: string) => sales(page).getByRole('button', { name: new RegExp(`Sell 1 ${product}`) });
  const lit = (page: Page) => layer(page, 'logic').locator('[data-lit="true"]');
  const card = (page: Page, table: string) => layer(page, 'data').locator(`[data-table="${table}"]`);
  const flour = (page: Page) => card(page, 'Ingredient').locator('li', { hasText: 'All-purpose flour' }).innerText();
  const status = (page: Page) => hero(page).getByRole('status');

  test.beforeEach(async ({ page, isMobile }) => {
    test.skip(isMobile, 'Desktop hero; the flow is the same on phones.');
    await skipPeek(page);
    await page.goto('/');
    await ready(page);
  });

  test('a sale with the stack open lights every step and lands in the data layer', async ({ page }) => {
    await toggle(page).click();
    const before = await flour(page);
    await sell(page, 'Ube Cream').click();
    await expect(lit(page)).toHaveCount(6, { timeout: 2000 });
    await expect(layer(page, 'logic').locator('[data-stopped]')).toHaveCount(0);
    await expect(card(page, 'Sale')).toContainText('Ube Cream');
    expect(await flour(page)).not.toBe(before);
    await expect(status(page)).toContainText('Underneath, the real app writes this sale and its paper trail in one transaction.');
  });

  test('with the stack open the new dashboard row pulses first, then the logic lights', async ({ page }) => {
    const pulse = layer(page, 'interface').locator('[data-pulse]');
    const pseudoTiming = (el: Element) => {
      const style = getComputedStyle(el, '::before');
      return { name: style.animationName, delay: parseFloat(style.animationDelay) };
    };
    await toggle(page).click();
    await sell(page, 'Ube Cream').click();
    await expect(pulse).toHaveCount(1);
    await expect(pulse).toContainText('Ube Cream');
    const row = await pulse.evaluate(pseudoTiming);
    const firstStep = await lit(page).first().evaluate(pseudoTiming);
    expect(row.name).not.toBe('none');
    expect(firstStep.name).not.toBe('none');
    expect(firstStep.delay).toBeGreaterThanOrEqual(row.delay + 0.1);
  });

  test('with the stack closed a sale adds no pulse, even once the stack opens', async ({ page }) => {
    await sell(page, 'Ube Cream').click();
    await expect(status(page)).toContainText('Sold 1 Ube Cream');
    await expect(layer(page, 'interface').locator('[data-pulse]')).toHaveCount(0);
    await toggle(page).click();
    await expect(layer(page, 'interface').locator('[data-pulse]')).toHaveCount(0);
  });

  test('three quick sales all land and the flow ends lit', async ({ page }) => {
    await toggle(page).click();
    for (const product of ['Classic Glazed', 'Ube Cream', 'Chocolate Dip']) await sell(page, product).click();
    for (const product of ['Classic Glazed', 'Ube Cream', 'Chocolate Dip']) await expect(card(page, 'Sale')).toContainText(product);
    await expect(lit(page)).toHaveCount(6);
  });

  test('a sale with the stack closed updates the dashboard and hints once', async ({ page }) => {
    await sell(page, 'Ube Cream').click();
    await expect(status(page)).toContainText('Sold 1 Ube Cream');
    await expect(status(page)).not.toContainText('Underneath');
    await expect(page.getByText(HINT)).toBeVisible();
    await expect(toggle(page)).toHaveAccessibleDescription(HINT);
    await expect(toggle(page)).toHaveAccessibleName(CLOSED);
    await expect(scene(page)).toHaveAttribute('data-open', 'false');

    await toggle(page).click();
    await expect(page.getByText(HINT)).toBeHidden();
    await toggle(page).click();
    await sell(page, 'Classic Glazed').click();
    await expect(status(page)).toContainText('Sold 1 Classic Glazed');
    await expect(page.getByText(HINT)).toBeHidden();
    await expect(toggle(page)).toHaveAccessibleDescription('');
  });

  test('a refused sale stops at the balance check and writes nothing', async ({ page }) => {
    const glazed = sell(page, 'Classic Glazed');
    await glazed.focus();
    for (let i = 0; i < 65; i++) await page.keyboard.press('Enter');
    await expect(glazed).toHaveAttribute('aria-disabled', 'true');

    await toggle(page).click();
    const before = await layer(page, 'data').innerText();
    await glazed.focus();
    await page.keyboard.press('Enter');
    await expect(lit(page)).toHaveCount(4);
    const stopped = layer(page, 'logic').locator('[data-stopped]');
    await expect(stopped).toHaveCount(1);
    await expect(stopped).toContainText(BALANCE_CHECK);
    await expect(stopped).toContainText('Stopped: not enough all-purpose flour');
    await expect(layer(page, 'data').locator('[data-written]')).toHaveCount(0);
    expect(await layer(page, 'data').innerText()).toBe(before);
  });

  test('reset returns the data layer to the start and lights nothing', async ({ page }) => {
    const start = await flour(page);
    await toggle(page).click();
    await sell(page, 'Ube Cream').click();
    await sell(page, 'Classic Glazed').click();
    await expect(lit(page)).toHaveCount(6);
    await sales(page).getByRole('button', { name: 'Reset demo' }).click();
    await expect(lit(page)).toHaveCount(0);
    await expect(card(page, 'Sale').locator('li')).toHaveCount(0);
    expect(await flour(page)).toBe(start);
  });
});

test.describe('The software stack at every size', () => {
  test('with the stack open, the switch and sale buttons stay on screen at laptop sizes', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Laptop heights.');
    await skipPeek(page);
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
    await skipPeek(page);
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

test.describe('The one-time peek', () => {
  const peeking = (page: Page) => scene(page).and(page.locator('[data-peek="true"]'));
  const peekedKey = (page: Page) => page.evaluate(() => sessionStorage.getItem('stack-peeked'));

  test.beforeEach(({ isMobile }) => {
    test.skip(isMobile, 'Desktop hero; the peek is the same on phones.');
  });

  test('the stack peeks once per visit', async ({ page }) => {
    await page.goto('/');
    await ready(page);
    await expect(peeking(page)).toBeAttached({ timeout: 3000 });
    await expect(scene(page)).toHaveAttribute('data-peek', 'false', { timeout: 3000 });
    expect(await peekedKey(page)).toBe('1');

    await page.reload();
    await ready(page);
    await page.waitForTimeout(3000);
    await expect(peeking(page)).toHaveCount(0);
  });

  test('the peek lifts the closed layers apart and settles back', async ({ page }) => {
    await page.goto('/');
    await ready(page);
    await expect(peeking(page)).toBeAttached({ timeout: 3000 });
    await expect
      .poll(() => layer(page, 'logic').evaluate((el) => el.getAnimations().map((a) => (a as CSSAnimation).animationName).length))
      .toBeGreaterThan(0);
    await expect(scene(page)).toHaveAttribute('data-peek', 'false', { timeout: 3000 });
    await settled(page);
    expect(await scene(page).getAttribute('data-open')).toBe('false');
  });

  test('no peek under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await ready(page);
    await page.waitForTimeout(3000);
    await expect(peeking(page)).toHaveCount(0);
  });

  test('an early switch to Websites cancels the peek and the handoff still lands', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-live="ready"]').first()).toBeAttached({ timeout: 10_000 });
    await page.getByRole('radio', { name: new RegExp(featuredWebsite.title) }).click();
    await page.waitForTimeout(3000);
    await expect(peeking(page)).toHaveCount(0);
    await expect(page.locator('[data-id="web"]')).toHaveAttribute('data-role', 'primary');
  });

  test('an early sale cancels the peek', async ({ page }) => {
    await page.goto('/');
    await ready(page);
    await page.getByRole('group', { name: 'Try Rowszein’s Delight' }).getByRole('button', { name: /Sell 1 Ube Cream/ }).click();
    await page.waitForTimeout(3000);
    await expect(peeking(page)).toHaveCount(0);
    await expect(page.locator('[data-id="software"]')).toHaveAttribute('data-role', 'primary');
  });

  test('the peek works where storage is blocked', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.addInitScript(() => {
      Object.defineProperty(window, 'sessionStorage', { get() { throw new Error('storage blocked'); } });
    });
    await page.goto('/');
    await expect(page.locator('[data-live="ready"]').first()).toBeAttached({ timeout: 10_000 });
    await expect(peeking(page)).toBeAttached({ timeout: 3000 });
    await expect(scene(page)).toHaveAttribute('data-peek', 'false', { timeout: 3000 });
    expect(errors).toEqual([]);
  });
});
