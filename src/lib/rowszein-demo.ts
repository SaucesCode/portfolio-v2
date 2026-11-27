/**
 * Rowszein's Delight sale rules, ported for the live hero demo. Each rule names its source in the
 * app's backend (repo main 26f0f63). Stock is integer quanta of 1e-9, as in sales/inventory_math.py;
 * money is integer centavos. Floats never touch either.
 */
import { demoIngredients, demoProducts, demoStartTotals, type DemoIngredient, type DemoProduct, type DemoUnit } from '@/data/rowszein-demo';

const QUANTA_PER_UNIT = 1_000_000_000n;

/** inventory_math.quantity_quanta: an exact decimal string as integer quanta. */
export function toQuanta(decimal: string): bigint {
  const match = /^(\d+)(?:\.(\d{1,9}))?$/.exec(decimal);
  if (!match) throw new Error(`Not a non-negative decimal with at most 9 places: ${decimal}`);
  return BigInt(match[1]) * QUANTA_PER_UNIT + BigInt((match[2] ?? '').padEnd(9, '0'));
}

/** Positive integer division rounded half up. */
const divHalfUp = (n: bigint, d: bigint) => n / d + (2n * (n % d) >= d ? 1n : 0n);

/** Positive integer division rounded half to even, as Python's round() does on Decimal. */
function divHalfEven(n: bigint, d: bigint) {
  const q = n / d;
  const twice = 2n * (n % d);
  if (twice > d) return q + 1n;
  if (twice < d) return q;
  return q % 2n === 0n ? q : q + 1n;
}

/** inventory_math.cumulative_quanta: what `units` pieces consume in total, rounded half up once. */
export function cumulativeQuanta(batch: string, yieldQuantity: number, units: number): bigint {
  return divHalfUp(toQuanta(batch) * BigInt(units), BigInt(yieldQuantity));
}

export interface DemoState {
  stock: Record<string, bigint>;
  /** Pieces sold per product: the allocation cursor, so consumption never drifts. */
  sold: Record<string, number>;
  netSalesCentavos: number;
  expensesCentavos: number;
}

/** One call to the demo's sell or reset; its key rises on every call, refusals included. */
export type DemoEvent =
  | { key: number; kind: 'sold'; productId: DemoProduct['id'] }
  | { key: number; kind: 'refused'; productId: DemoProduct['id']; shortOf: DemoIngredient }
  | { key: number; kind: 'reset' };

export function initialState(): DemoState {
  return {
    stock: Object.fromEntries(demoIngredients.map((ingredient) => [ingredient.id, toQuanta(ingredient.start)])),
    sold: Object.fromEntries(demoProducts.map((product) => [product.id, 0])),
    ...demoStartTotals,
  };
}

const ingredientById = new Map(demoIngredients.map((ingredient) => [ingredient.id, ingredient]));

/**
 * One piece sold. inventory_math.allocate takes each ingredient's share from the cursor interval
 * [sold, sold + 1); apply_deltas refuses the whole sale if any stock would go negative.
 */
export function recordSale(
  state: DemoState,
  productId: DemoProduct['id'],
): { ok: true; state: DemoState } | { ok: false; shortOf: DemoIngredient } {
  const product = demoProducts.find((p) => p.id === productId);
  if (!product) throw new Error(`Unknown demo product: ${productId}`);
  const sold = state.sold[productId];
  const stock = { ...state.stock };
  for (const ingredient of demoIngredients) {
    const batch = product.batch[ingredient.id];
    if (!batch) continue;
    const used = cumulativeQuanta(batch, product.yieldQuantity, sold + 1) - cumulativeQuanta(batch, product.yieldQuantity, sold);
    stock[ingredient.id] -= used;
    if (stock[ingredient.id] < 0n) return { ok: false, shortOf: ingredient };
  }
  return {
    ok: true,
    state: {
      ...state,
      stock,
      sold: { ...state.sold, [productId]: sold + 1 },
      netSalesCentavos: state.netSalesCentavos + product.priceCentavos,
    },
  };
}

/** Ingredient.is_low_stock: quantity at or below the minimum. */
export const lowStock = (state: DemoState) =>
  demoIngredients.filter((ingredient) => state.stock[ingredient.id] <= toQuanta(ingredient.minimum));

/** dashboard/views.py: net sales minus partner payouts (none in this demo) minus expenses. */
export const netProfitCentavos = (state: DemoState) => state.netSalesCentavos - state.expensesCentavos;

/** Recipe.cost_per_unit: round(round(sum(quantity x cost), 2) / yield, 2), both rounded half to even. */
export function costPerPieceCentavos(product: DemoProduct): number {
  // quanta x centavos keeps every product exact, in units of 1e-9 centavo.
  let total = 0n;
  for (const [id, quantity] of Object.entries(product.batch)) {
    total += toQuanta(quantity) * (toQuanta(ingredientById.get(id)!.costPerUnit) / 10_000_000n);
  }
  const batchCentavos = divHalfEven(total, QUANTA_PER_UNIT);
  return Number(divHalfEven(batchCentavos, BigInt(product.yieldQuantity)));
}

const peso = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatPeso = (centavos: number) => `₱${peso.format(centavos / 100)}`;

/** Stock as the pantry shows it: two places (pieces as whole numbers), rounded half up. */
export function formatStock(quanta: bigint, unit: DemoUnit): string {
  if (unit === 'pcs') return `${divHalfUp(quanta, QUANTA_PER_UNIT)} pcs`;
  const hundredths = divHalfUp(quanta, 10_000_000n);
  return `${hundredths / 100n}.${String(hundredths % 100n).padStart(2, '0')} ${unit}`;
}
