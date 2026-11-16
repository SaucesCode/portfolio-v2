import { statSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { liveHero, palette, stylePresets, typePairs } from '../src/data/thread-and-form';
import { demoProducts, type DemoIngredient } from '../src/data/rowszein-demo';
import {
  costPerPieceCentavos,
  cumulativeQuanta,
  formatPeso,
  formatStock,
  initialState,
  lowStock,
  netProfitCentavos,
  recordSale,
  toQuanta,
  type DemoState,
} from '../src/lib/rowszein-demo';

const sell = (state: DemoState, id: Parameters<typeof recordSale>[1], times = 1) => {
  let next = state;
  for (let i = 0; i < times; i++) {
    const result = recordSale(next, id);
    if (!result.ok) throw new Error(`refused: short of ${result.shortOf.id}`);
    next = result.state;
  }
  return next;
};

const product = (id: string) => demoProducts.find((p) => p.id === id)!;

test.describe('Rowszein demo logic', () => {
  test('consumption follows the app’s cumulative half-up rounding', () => {
    expect(cumulativeQuanta('1.0', 12, 1)).toBe(83_333_333n);
    expect(cumulativeQuanta('1.0', 12, 12)).toBe(1_000_000_000n);
  });

  test('twelve single sales use exactly one batch and add up the money', () => {
    const state = sell(initialState(), 'classic-glazed', 12);
    expect(toQuanta('5.40') - state.stock['flour']).toBe(1_000_000_000n);
    expect(state.netSalesCentavos).toBe(18_001_000 + 12 * 3500);
    expect(netProfitCentavos(state)).toBe(state.netSalesCentavos - 11_858_600);
  });

  test('flour turns low on the fifth Ube Cream', () => {
    const four = sell(initialState(), 'ube-cream', 4);
    expect(lowStock(four).map((i) => i.id)).toEqual([]);
    expect(lowStock(sell(four, 'ube-cream')).map((i) => i.id)).toEqual(['flour']);
  });

  test('running out refuses the sale and changes nothing', () => {
    const start = initialState();
    const empty: DemoState = { ...start, stock: { ...start.stock, 'ube-halaya': 0n } };
    const refused = recordSale(empty, 'ube-cream');
    expect(refused.ok).toBe(false);
    expect((refused as { ok: false; shortOf: DemoIngredient }).shortOf.id).toBe('ube-halaya');
    expect(empty.stock['ube-halaya']).toBe(0n);
    expect(empty.netSalesCentavos).toBe(start.netSalesCentavos);
  });

  test('cost per piece matches the app’s recipe costing', () => {
    expect(costPerPieceCentavos(product('classic-glazed'))).toBe(1878);
    expect(costPerPieceCentavos(product('ube-cream'))).toBe(3153);
    expect(costPerPieceCentavos(product('chocolate-dip'))).toBe(2323);
  });

  test('money and stock read like the owner panel', () => {
    expect(formatPeso(18_001_000)).toBe('₱180,010.00');
    expect(formatStock(toQuanta('4.983333333'), 'kg')).toBe('4.98 kg');
    expect(formatStock(toQuanta('344'), 'pcs')).toBe('344 pcs');
  });
});

test.describe('Thread & Form demo data', () => {
  test('every preset colour comes from the theme palette', () => {
    const hexes = new Set(palette.map((swatch) => swatch.hex));
    expect(stylePresets.map((preset) => preset.id)).toEqual(['paper', 'sand', 'blue', 'navy']);
    for (const preset of stylePresets) {
      for (const colour of [preset.ground, preset.ink, preset.muted, preset.accent]) expect(hexes, `${preset.id} ${colour}`).toContain(colour);
    }
    expect(typePairs.map((pair) => pair.id)).toEqual(['serif', 'sans']);
  });

  test('the live hero photo is small enough to load after first paint', () => {
    const bytes = statSync(`public${liveHero.image.src}`).size;
    expect(bytes).toBeGreaterThan(10_000);
    expect(bytes).toBeLessThanOrEqual(120 * 1024);
  });
});

test.describe('Live Rowszein demo in the hero', () => {
  test.skip(({ isMobile }) => isMobile, 'Interaction is covered on desktop; the phone layout is checked in the hero tests.');
  const live = (page: import('@playwright/test').Page) => page.locator('[data-live="ready"][data-live-id="software"]');
  const controls = (page: import('@playwright/test').Page) => page.getByRole('group', { name: 'Try Rowszein’s Delight' });

  test('selling shows the low-stock alert and announces it', async ({ page }) => {
    await page.goto('/');
    await expect(live(page)).toBeVisible();
    for (let i = 0; i < 5; i++) await controls(page).getByRole('button', { name: /Sell 1 Ube Cream/ }).click();
    await expect(live(page)).toContainText('All-purpose flour');
    await expect(page.getByRole('status').filter({ hasText: 'Sold 1 Ube Cream' })).toContainText('All-purpose flour is now low.');
  });

  test('net sales add up and reset restores the start', async ({ page }) => {
    await page.goto('/');
    await expect(live(page)).toBeVisible();
    for (let i = 0; i < 3; i++) await controls(page).getByRole('button', { name: /Sell 1 Classic Glazed/ }).click();
    await expect(live(page)).toContainText('₱180,115.00');
    await controls(page).getByRole('button', { name: 'Reset demo' }).click();
    await expect(live(page)).toContainText('₱180,010.00');
    await expect(live(page)).not.toContainText('running low');
  });
});

test.describe('Live Thread & Form demo in the hero', () => {
  test.skip(({ isMobile }) => isMobile, 'Interaction is covered on desktop; the phone layout is checked in the hero tests.');
  const showWebsite = async (page: import('@playwright/test').Page) => {
    await page.goto('/');
    await page.getByRole('radio', { name: /Thread & Form/ }).click();
    const live = page.locator('[data-live="ready"][data-live-id="web"]');
    await expect(live).toBeVisible();
    return { live, colours: page.getByRole('radiogroup', { name: 'Colour' }), type: page.getByRole('radiogroup', { name: 'Type' }) };
  };

  test('a colour preset restyles the whole hero', async ({ page }) => {
    const { live, colours } = await showWebsite(page);
    await colours.getByRole('radio', { name: 'Navy' }).click();
    await expect(live.locator('[data-theme-ground]')).toHaveCSS('background-color', 'rgb(17, 20, 26)');
    await expect(page.getByRole('status').filter({ hasText: 'Thread & Form restyled' })).toContainText('Navy, Serif.');
  });

  test('the type choice swaps the display face', async ({ page }) => {
    const { live, type } = await showWebsite(page);
    await type.getByRole('radio', { name: 'Sans' }).click();
    const family = await live.locator('[data-theme-headline]').evaluate((el) => getComputedStyle(el).fontFamily);
    expect(family).toMatch(/Jakarta/i);
  });

  test('swatches work as a radio group from the keyboard', async ({ page }) => {
    const { colours } = await showWebsite(page);
    const paper = colours.getByRole('radio', { name: 'Paper' });
    await paper.focus();
    await page.keyboard.press('ArrowRight');
    await expect(colours.getByRole('radio', { name: 'Sand' })).toBeFocused();
    await expect(colours.getByRole('radio', { name: 'Sand' })).toHaveAttribute('aria-checked', 'true');
  });
});

test.describe('Live hero behaviour', () => {
  test('a tap made before the page has hydrated still wins', async ({ page }) => {
    await page.route('**/_next/static/chunks/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await route.continue();
    });
    await page.goto('/', { waitUntil: 'commit' });
    const web = page.getByRole('radio', { name: /Thread & Form/ });
    await web.click();
    await expect(web).toHaveAttribute('aria-checked', 'true', { timeout: 15_000 });
    await expect(page.locator('[data-id="web"][data-role]')).toHaveAttribute('data-role', 'primary');
  });

  test('switching windows keeps sales and styling', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Covered on desktop.');
    await page.goto('/');
    const software = page.getByRole('radio', { name: /Rowszein/ });
    const web = page.getByRole('radio', { name: /Thread & Form/ });
    await expect(page.locator('[data-live="ready"][data-live-id="software"]')).toBeVisible();
    const sell = page.getByRole('group', { name: 'Try Rowszein’s Delight' }).getByRole('button', { name: /Sell 1 Ube Cream/ });
    await sell.click();
    await sell.click();
    await web.click();
    await page.getByRole('radiogroup', { name: 'Colour' }).getByRole('radio', { name: 'Navy' }).click();
    await software.click();
    await expect(page.locator('[data-live="ready"][data-live-id="software"]')).toContainText('₱180,120.00');
    await web.click();
    await expect(page.getByRole('radiogroup', { name: 'Colour' }).getByRole('radio', { name: 'Navy' })).toHaveAttribute('aria-checked', 'true');
  });

  test('the main window says it is a live demo once live', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-role="primary"]')).toContainText('Live demo · sample data, running in your browser');
  });

  test('without JavaScript the hero shows its screenshots and no live layer', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.locator('[data-role] img')).toHaveCount(2);
    await expect(page.locator('[data-live]')).toHaveCount(0);
    await context.close();
  });
});

test.describe('Live demo scale', () => {
  test('demo text scales with its window, not the viewport', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Checked at desktop width.');
    await page.goto('/');
    const layer = page.locator('[data-live="ready"][data-live-id="software"]');
    await expect(layer).toBeVisible();
    const ratio = await layer.evaluate((el) => {
      const item = el.querySelector('aside li')!;
      return parseFloat(getComputedStyle(item).fontSize) / el.getBoundingClientRect().width;
    });
    // The panel's base size is 1.45% of the window; the viewport fallback was about three times that.
    expect(ratio).toBeGreaterThan(0.01);
    expect(ratio).toBeLessThan(0.02);
  });
});

test.describe('Live hero review fixes', () => {
  const tryRow = (page: import('@playwright/test').Page) => page.locator('[class*="tryRow"]');

  test('the hero does not move when the live demo arrives, or when switching', async ({ page }) => {
    await page.goto('/', { waitUntil: 'commit' });
    await page.locator('#intro-title').waitFor();
    const before = await page.locator('#intro-title').evaluate((el) => el.getBoundingClientRect().top + scrollY);
    await expect(page.locator('[data-live="ready"]').first()).toBeAttached({ timeout: 10_000 });
    await page.waitForTimeout(400);
    const after = await page.locator('#intro-title').evaluate((el) => el.getBoundingClientRect().top + scrollY);
    expect(Math.abs(after - before)).toBeLessThanOrEqual(1);
    const softwareRow = (await tryRow(page).boundingBox())!.height;
    await page.getByRole('radio', { name: /Thread & Form/ }).click();
    await expect(page.getByRole('radiogroup', { name: 'Colour' })).toBeVisible();
    expect((await tryRow(page).boundingBox())!.height).toBeCloseTo(softwareRow, 0);
  });

  test('without JavaScript the controls row takes no space', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/');
    const box = await page.locator('[class*="tryRow"]').evaluate((el) => {
      const style = getComputedStyle(el);
      return el.getBoundingClientRect().height + parseFloat(style.marginTop);
    });
    expect(box).toBe(0);
    await context.close();
  });

  test('controls appear only once their live demo is showing', async ({ page }) => {
    await page.route('**/live-hero.jpg*', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.continue();
    });
    await page.route('**/_next/image?url=%2Fwork%2Fthread-and-form%2Flive-hero.jpg*', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.continue();
    });
    await page.goto('/');
    await expect(page.locator('[data-live="ready"][data-live-id="software"]')).toBeAttached();
    await page.getByRole('radio', { name: /Thread & Form/ }).click();
    for (let i = 0; i < 15; i++) {
      const controls = await page.getByRole('radiogroup', { name: 'Colour' }).count();
      const ready = await page.locator('[data-live="ready"][data-live-id="web"]').count();
      expect(controls === 0 || ready === 1, `poll ${i}`).toBe(true);
      await page.waitForTimeout(100);
    }
  });

  test('a demo is marked ready only after its fonts have loaded', async ({ page }) => {
    await page.route('**/*.woff2', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 900));
      await route.continue();
    });
    await page.addInitScript(() => {
      new MutationObserver((records) => {
        for (const record of records) {
          const el = record.target as HTMLElement;
          if (el.dataset?.live === 'ready' && !(window as unknown as { __fontsAtReady?: number }).__fontsAtReady) {
            (window as unknown as { __fontsAtReady: number }).__fontsAtReady =
              [...document.fonts].filter((font) => font.status === 'loading').length + 1;
          }
        }
      }).observe(document, { subtree: true, attributes: true, attributeFilter: ['data-live'] });
    });
    await page.goto('/');
    await expect(page.locator('[data-live="ready"]').first()).toBeAttached({ timeout: 10_000 });
    // Stored as count + 1 so that "no font still loading" reads as 1.
    expect(await page.evaluate(() => (window as unknown as { __fontsAtReady: number }).__fontsAtReady)).toBe(1);
  });

  test('a failed demo download leaves the hero and its screenshots in place', async ({ page, request }) => {
    const html = await (await request.get('/')).text();
    const initial = new Set([...html.matchAll(/\/_next\/static\/chunks\/[^"']+\.js/g)].map((m) => m[0]));
    await page.route('**/_next/static/chunks/**', (route) =>
      initial.has(new URL(route.request().url()).pathname) ? route.continue() : route.abort(),
    );
    await page.goto('/');
    await page.waitForTimeout(3000);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('[data-role] img')).toHaveCount(2);
    await expect(page.getByText(/Application error/i)).toHaveCount(0);
  });

  test('the main window always shows its screenshot or a ready demo', async ({ page }) => {
    await page.goto('/', { waitUntil: 'commit' });
    await page.locator('[data-role="primary"]').waitFor();
    for (let i = 0; i < 25; i++) {
      const state = await page.locator('[data-role="primary"]').evaluate((el) => {
        const img = el.querySelector('img')!;
        const live = el.querySelector('[data-live]') as HTMLElement | null;
        return { image: getComputedStyle(img).opacity === '1', live: live?.dataset.live ?? 'none', liveOpacity: live ? getComputedStyle(live).opacity : '0' };
      });
      expect(state.image || state.live === 'ready', `poll ${i}`).toBe(true);
      if (state.live !== 'ready') expect(state.liveOpacity, `poll ${i}`).toBe('0');
      await page.waitForTimeout(100);
    }
  });

  test('selling out keeps focus on the button and says why', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Keyboard behaviour is checked on desktop.');
    await page.goto('/');
    const button = page.getByRole('group', { name: 'Try Rowszein’s Delight' }).getByRole('button', { name: /Sell 1 Classic Glazed/ });
    await button.focus();
    for (let i = 0; i < 65; i++) await page.keyboard.press('Enter');
    await expect(button).toBeFocused();
    await expect(button).toHaveAttribute('aria-disabled', 'true');
    await expect(page.getByRole('status').filter({ hasText: 'Not enough' })).toContainText('all-purpose flour');
  });
});
