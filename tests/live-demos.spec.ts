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
  const live = (page: import('@playwright/test').Page) => page.locator('[data-live="ready"][data-id="software"]');
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
