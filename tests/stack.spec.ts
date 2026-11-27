import { expect, test, type Page } from '@playwright/test';
import { featuredSoftware, featuredWebsite } from '../src/data/projects';
import { demoIngredients } from '../src/data/rowszein-demo';
import { tableGroups, traceSteps } from '../src/data/rowszein-trace';
import { formatStock, initialState, recordSale } from '../src/lib/rowszein-demo';

const CLOSED = 'See what’s underneath';
const OPEN = 'Put it back together';

const hero = (page: Page) => page.locator('[data-active][data-entrance]');
const scene = (page: Page) => page.locator('[data-stack-scene]');
const toggle = (page: Page) => page.getByRole('button', { name: new RegExp(`${CLOSED}|${OPEN}`) });
const layer = (page: Page, id: string) => page.locator(`[data-layer="${id}"]`);
const BALANCE_CHECK = 'Work out every new balance before writing anything';
const balanceCheck = traceSteps.findIndex((step) => step.title === BALANCE_CHECK);

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
    await settled(page);
    await page.getByRole('radio', { name: new RegExp(featuredWebsite.title) }).click();
    // The handoff flies the windows; the stack closes at once rather than sweeping its sheets across the hero.
    const stackMotion = await page.evaluate(() =>
      document
        .getAnimations()
        .filter((animation) => {
          const target = (animation.effect as KeyframeEffect | null)?.target;
          return target?.matches('[data-stack-scene], [data-stack-labels], [data-layer], [data-label-for], [data-label-for] > *');
        })
        .map((animation) => (animation instanceof CSSTransition ? animation.transitionProperty : 'animation')),
    );
    expect(stackMotion).toEqual([]);
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

  test('opening tells a screen reader what the layers show, and closing says so', async ({ page }) => {
    const status = hero(page).getByRole('status');
    await toggle(page).click();
    await expect(status).toContainText('Opened into four layers');
    for (const step of traceSteps) await expect(status).toContainText(step.title);
    for (const { table } of tableGroups.flatMap((group) => group.tables)) await expect(status).toContainText(table);
    await expect(status).toContainText('demonstration data');
    await toggle(page).click();
    await expect(status).toHaveText('Put back together.');
  });

  test('the design layer shows the app’s colours, type and spacing', async ({ page }) => {
    await toggle(page).click();
    const design = layer(page, 'design');
    await expect(design).toContainText('Newsreader');
    await expect(design).toContainText('Spacing');
    const steps = design.locator('[data-space]');
    await expect(steps).toHaveText(['4', '8', '12', '16', '24']);
    const widths = await steps.evaluateAll((els) => els.map((el) => parseFloat(getComputedStyle(el, '::before').width)));
    for (let i = 1; i < widths.length; i++) expect(widths[i], `step ${i} drawn larger than the one before`).toBeGreaterThan(widths[i - 1]);
  });

  test('a fine pointer over the stack tilts it, closed and open, and leaving sets it back', async ({ page }) => {
    const drawn = () =>
      layer(page, 'interface').evaluate((el) => {
        const { left, top, right, bottom } = el.getBoundingClientRect();
        return [left, top, right, bottom];
      });
    const moved = (from: number[], to: number[]) => Math.max(...from.map((value, i) => Math.abs(value - to[i])));
    await expect
      .poll(() => page.locator('[data-id="software"]').evaluate((el) => getComputedStyle(el).transform), { timeout: 4000 })
      .toBe('none');

    for (const open of [false, true]) {
      if (open) await toggle(page).click();
      await settled(page);
      const rest = await drawn();
      const box = (await layer(page, 'interface').boundingBox())!;
      await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.2, { steps: 4 });
      await expect.poll(async () => moved(rest, await drawn()), { message: `tilts when ${open ? 'open' : 'closed'}` }).toBeGreaterThan(2);
      await page.mouse.move(2, 2, { steps: 4 });
      await expect.poll(async () => moved(rest, await drawn()), { message: `settles back when ${open ? 'open' : 'closed'}` }).toBeLessThan(0.5);
    }
  });

  test('no tilt under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    await ready(page);
    const box = (await layer(page, 'interface').boundingBox())!;
    await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.2, { steps: 4 });
    await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
    expect(await scene(page).evaluate((el) => getComputedStyle(el).rotate)).toBe('none');
    expect(await scene(page).evaluate((el) => el.getAnimations().length)).toBe(0);
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
    await expect(lit(page)).toHaveCount(traceSteps.length, { timeout: 2000 });
    await expect(layer(page, 'logic').locator('[data-stopped]')).toHaveCount(0);
    await expect(card(page, 'Sale')).toContainText('₱55.00');
    await expect(card(page, 'Sale')).not.toContainText('Ube Cream');
    await expect(card(page, 'SaleItem')).toContainText('1× Ube Cream');
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
    for (const product of ['Classic Glazed', 'Ube Cream', 'Chocolate Dip']) await expect(card(page, 'SaleItem')).toContainText(`1× ${product}`);
    await expect(lit(page)).toHaveCount(traceSteps.length);
  });

  test('quick sales with the stack open never blank the figures or the newest sale', async ({ page }) => {
    let state = initialState();
    for (const id of ['ube-cream', 'classic-glazed'] as const) {
      const result = recordSale(state, id);
      if (!result.ok) throw new Error(`The demo refused ${id}`);
      state = result.state;
    }
    const flourIngredient = demoIngredients.find((ingredient) => ingredient.id === 'flour')!;
    const expected = formatStock(state.stock.flour, flourIngredient.unit);

    await toggle(page).click();
    await settled(page);
    // Samples every frame, as drawn: an element's opacity times its ancestors' within the data layer.
    const sampling = page.evaluate(async (ms) => {
      const data = document.querySelector('[data-layer="data"]')!;
      const drawn = (el: Element | null | undefined) => {
        let opacity = 1;
        for (let node = el ?? null; node && node !== data; node = node.parentElement) opacity *= parseFloat(getComputedStyle(node).opacity);
        return opacity;
      };
      const samples = [];
      const end = performance.now() + ms;
      while (performance.now() < end) {
        await new Promise(requestAnimationFrame);
        const flour = [...data.querySelectorAll('[data-table="Ingredient"] li')].find((li) => li.textContent?.includes('All-purpose flour'));
        const sale = data.querySelector('[data-table="Sale"] li');
        samples.push({
          flour: flour?.lastElementChild?.textContent,
          flourOpacity: drawn(flour?.lastElementChild),
          sale: sale?.textContent ?? null,
          saleOpacity: drawn(sale),
        });
      }
      return samples;
    }, 2200);
    await sell(page, 'Ube Cream').click();
    await page.waitForTimeout(300);
    await sell(page, 'Classic Glazed').click();
    const samples = await sampling;
    for (const sample of samples) {
      expect(sample.flourOpacity, `flour drawn at ${sample.flour}`).toBe(1);
      if (sample.sale !== null) expect(sample.saleOpacity, `newest sale drawn at ${sample.sale}`).toBe(1);
    }
    expect(samples.at(-1)).toMatchObject({ flour: expected, sale: '₱35.00' });
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
    await expect(lit(page)).toHaveCount(balanceCheck + 1);
    const stopped = layer(page, 'logic').locator('[data-stopped]');
    await expect(stopped).toHaveCount(1);
    await expect(stopped).toContainText(BALANCE_CHECK);
    await expect(stopped).toContainText('Stopped: not enough all-purpose flour');
    await expect(layer(page, 'data').locator('[data-written]')).toHaveCount(0);
    expect(await layer(page, 'data').innerText()).toBe(before);
    await expect(status(page)).toContainText('Underneath, the real app checks every balance first');
  });

  test('reset returns the data layer to the start and lights nothing', async ({ page }) => {
    const start = await flour(page);
    await toggle(page).click();
    await sell(page, 'Ube Cream').click();
    await sell(page, 'Classic Glazed').click();
    await expect(lit(page)).toHaveCount(traceSteps.length);
    await sales(page).getByRole('button', { name: 'Reset demo' }).click();
    await expect(lit(page)).toHaveCount(0);
    await expect(card(page, 'Sale').locator('li')).toHaveCount(0);
    await expect(card(page, 'SaleItem').locator('li')).toHaveCount(0);
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
  // The peek starts a second after the demo is ready; this is long enough to know it did not.
  const pastPeek = (page: Page) => page.waitForTimeout(1800);

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
    await pastPeek(page);
    await expect(peeking(page)).toHaveCount(0);
  });

  test('a visit that starts below the hero keeps the peek until the stack is in view', async ({ page }) => {
    await page.goto('/#contact');
    await expect(page.locator('[data-live="ready"]').first()).toBeAttached({ timeout: 10_000 });
    await expect.poll(() => page.evaluate(() => scrollY > innerHeight)).toBe(true);
    await pastPeek(page);
    await expect(peeking(page)).toHaveCount(0);
    expect(await peekedKey(page)).toBeNull();

    await page.locator('[data-id="software"]').scrollIntoViewIfNeeded();
    await expect(peeking(page)).toBeAttached({ timeout: 3000 });
    expect(await peekedKey(page)).toBe('1');
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
    await pastPeek(page);
    await expect(peeking(page)).toHaveCount(0);
  });

  test('an early switch to Websites cancels the peek and the handoff still lands', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-live="ready"]').first()).toBeAttached({ timeout: 10_000 });
    await page.getByRole('radio', { name: new RegExp(featuredWebsite.title) }).click();
    await pastPeek(page);
    await expect(peeking(page)).toHaveCount(0);
    await expect(page.locator('[data-id="web"]')).toHaveAttribute('data-role', 'primary');
  });

  test('an early sale cancels the peek', async ({ page }) => {
    await page.goto('/');
    await ready(page);
    await page.getByRole('group', { name: 'Try Rowszein’s Delight' }).getByRole('button', { name: /Sell 1 Ube Cream/ }).click();
    await pastPeek(page);
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

test.describe('The stack on phones and under reduced motion', () => {
  /** The union of the boxes the layers and their labels are drawn in, as the visitor sees them. */
  const drawn = (page: Page) =>
    page.evaluate(() => {
      const boxes = [...document.querySelectorAll('[data-layer], [data-label-for] > *')].map((el) => el.getBoundingClientRect());
      return {
        left: Math.min(...boxes.map((b) => b.left)),
        right: Math.max(...boxes.map((b) => b.right)),
        top: Math.min(...boxes.map((b) => b.top)),
        bottom: Math.max(...boxes.map((b) => b.bottom)),
      };
    });
  const noOverflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
  /** Brings the window to the middle of the screen, where on phones its scroll-driven unfold has finished, and lets it settle. */
  const inView = async (page: Page) => {
    await layer(page, 'interface').evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await settled(page);
    await expect
      .poll(() => page.locator('[data-id="software"]').evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).isIdentity))
      .toBe(true);
  };

  test('under reduced motion, opening fades instead of moving', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await skipPeek(page);
    await page.goto('/');
    await ready(page);

    const motion = () =>
      page.evaluate(() => {
        const parts = [...document.querySelectorAll('[data-stack-scene], [data-stack-labels], [data-layer], [data-label-for], [data-label-for] > *')];
        return parts.flatMap((el) => {
          const style = getComputedStyle(el);
          const transitions = style.transitionProperty.split(', ');
          const moving = el.getAnimations().filter((animation) =>
            animation instanceof CSSTransition
              ? animation.transitionProperty === 'transform'
              : (animation.effect as KeyframeEffect).getKeyframes().some((frame) => 'transform' in frame),
          );
          const problems = [];
          if (transitions.includes('transform') || transitions.includes('all')) problems.push(`transitions ${style.transitionProperty}`);
          if (style.transitionDelay.split(', ').some((delay) => parseFloat(delay) !== 0)) problems.push(`delays ${style.transitionDelay}`);
          if (moving.length) problems.push(`${moving.length} transform animations`);
          return problems.map((problem) => `${el.getAttribute('data-layer') ?? el.getAttribute('data-label-for') ?? el.className}: ${problem}`);
        });
      });
    const ms = (time: string) => parseFloat(time) * (time.trim().endsWith('ms') ? 1 : 1000);
    // The fade runs on the scene's perspective box: opacity below 1 on a 3D scene would flatten it.
    const fade = async () => {
      const { name, duration, flat, fadesOpacity } = await scene(page).evaluate((el) => {
        const style = getComputedStyle(el.parentElement!);
        const rules = (list: CSSRuleList): CSSRule[] =>
          [...list].flatMap((rule) => ('cssRules' in rule ? [rule, ...rules((rule as CSSGroupingRule).cssRules)] : [rule]));
        const keyframes = [...document.styleSheets]
          .flatMap((sheet) => rules(sheet.cssRules))
          .find((rule): rule is CSSKeyframesRule => rule instanceof CSSKeyframesRule && rule.name === style.animationName);
        return {
          name: style.animationName,
          duration: style.animationDuration,
          flat: style.transformStyle === 'flat',
          fadesOpacity: !!keyframes && [...keyframes.cssRules].some((frame) => (frame as CSSKeyframeRule).style.opacity !== ''),
        };
      });
      expect(flat).toBe(true);
      expect(fadesOpacity).toBe(true);
      return { name, duration: ms(duration) };
    };
    const micro = ms(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--dur-micro')));

    await toggle(page).click();
    await expect(scene(page)).toHaveAttribute('data-open', 'true');
    expect(await motion()).toEqual([]);
    const opening = await fade();
    expect(opening.name).not.toBe('none');
    expect(opening.duration).toBe(micro);

    await toggle(page).click();
    await expect(scene(page)).toHaveAttribute('data-open', 'false');
    expect(await motion()).toEqual([]);
    const closing = await fade();
    expect(closing.name).not.toBe('none');
    expect(closing.name).not.toBe(opening.name);
    expect(closing.duration).toBe(micro);
  });

  test('on phones the open stack fits the column with labels inside the layers', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'The phone layout.');
    await skipPeek(page);
    for (const width of [320, 375, 390]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('/');
      await ready(page);
      await toggle(page).click();
      await expect(scene(page)).toHaveAttribute('data-open', 'true');
      await inView(page);
      expect(await noOverflow(page), `overflow at ${width}px`).toBe(true);
      // Hit-testing follows the 3D transforms, so it tells whether each corner of a label, as drawn,
      // lies on its own sheet. The corners are found with probes placed inside the label itself.
      await page.addStyleTag({ content: '[data-layer] { pointer-events: auto !important; }' });
      const layers = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>('[data-layer]')].map((el) => {
          const { left, right } = el.getBoundingClientRect();
          const label = document.querySelector(`[data-label-for="${el.dataset.layer}"] > *`)!;
          const onSheet = ['left:2px;top:2px', 'right:2px;top:2px', 'left:2px;bottom:2px', 'right:2px;bottom:2px'].every((corner) => {
            const probe = document.createElement('i');
            probe.style.cssText = `position:absolute;${corner};width:0;height:0`;
            label.appendChild(probe);
            const { x, y } = probe.getBoundingClientRect();
            probe.remove();
            return document.elementsFromPoint(x, y).some((hit) => el.contains(hit));
          });
          return { id: el.dataset.layer, left, right, onSheet };
        }),
      );
      for (const { id, left, right, onSheet } of layers) {
        expect(left, `${id} left at ${width}px`).toBeGreaterThanOrEqual(0);
        expect(right, `${id} right at ${width}px`).toBeLessThanOrEqual(width);
        expect(onSheet, `${id} label inside its layer at ${width}px`).toBe(true);
      }
      const size = await toggle(page).boundingBox();
      expect(size!.width).toBeGreaterThanOrEqual(44);
      expect(size!.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('between phone and tablet sizes the open stack stays inside the hero', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Small-tablet widths.');
    await skipPeek(page);
    for (const [width, height] of [
      [640, 900],
      [700, 1000],
    ]) {
      await page.setViewportSize({ width, height });
      await page.goto('/');
      await ready(page);
      await toggle(page).click();
      await expect(scene(page)).toHaveAttribute('data-open', 'true');
      await inView(page);
      expect(await noOverflow(page), `overflow at ${width}px`).toBe(true);
      const stack = await drawn(page);
      const box = await hero(page).evaluate((el) => {
        const { left, right, top, bottom } = el.getBoundingClientRect();
        return { left, right, top, bottom };
      });
      expect(stack.left, `left at ${width}px`).toBeGreaterThanOrEqual(box.left);
      expect(stack.right, `right at ${width}px`).toBeLessThanOrEqual(box.right);
      expect(stack.top, `top at ${width}px`).toBeGreaterThanOrEqual(box.top);
      expect(stack.bottom, `bottom at ${width}px`).toBeLessThanOrEqual(box.bottom);
      const parts = await page.evaluate(() =>
        [...document.querySelectorAll('[data-layer], [data-label-for] > *')].map((el) => {
          const { left, right } = el.getBoundingClientRect();
          return { name: el.getAttribute('data-layer') ?? el.textContent, left, right };
        }),
      );
      for (const { name, left, right } of parts) {
        expect(left, `${name} left at ${width}px`).toBeGreaterThanOrEqual(0);
        expect(right, `${name} right at ${width}px`).toBeLessThanOrEqual(width);
      }
    }
  });

  test('resizing while open keeps the stack inside the hero', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Starts at a laptop size.');
    await skipPeek(page);
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await ready(page);
    await toggle(page).click();
    await settled(page);
    await page.setViewportSize({ width: 375, height: 812 });
    await inView(page);
    expect(await noOverflow(page)).toBe(true);
    const stack = await drawn(page);
    const box = await hero(page).evaluate((el) => {
      const { left, right, top, bottom } = el.getBoundingClientRect();
      return { left, right, top, bottom };
    });
    expect(stack.left).toBeGreaterThanOrEqual(box.left);
    expect(stack.right).toBeLessThanOrEqual(box.right);
    expect(stack.top).toBeGreaterThanOrEqual(box.top);
    expect(stack.bottom).toBeLessThanOrEqual(box.bottom);
  });
});
