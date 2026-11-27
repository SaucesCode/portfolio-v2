/**
 * The live hero demo's catalogue: the same donuts, prices, recipes and ingredient costs as the
 * fictional data the Rowszein's Delight screenshots were captured with
 * (docs/superpowers/scripts/rowszein-capture/seed_catalog.py). Starting stock is set so a few
 * sales show the low-stock alert. Quantities are decimal strings, as the app stores them.
 */
export type DemoUnit = 'kg' | 'g' | 'l' | 'pcs';

export interface DemoIngredient {
  id: string;
  name: string;
  unit: DemoUnit;
  costPerUnit: string;
  minimum: string;
  start: string;
}

export interface DemoProduct {
  id: 'classic-glazed' | 'ube-cream' | 'chocolate-dip';
  name: string;
  priceCentavos: number;
  yieldQuantity: 12;
  /** Ingredient id to quantity per batch: the shared dough plus the product's own extras. */
  batch: Record<string, string>;
}

export const demoIngredients: DemoIngredient[] = [
  { id: 'flour', name: 'All-purpose flour', unit: 'kg', costPerUnit: '58', minimum: '5', start: '5.40' },
  { id: 'white-sugar', name: 'White sugar', unit: 'kg', costPerUnit: '70', minimum: '3', start: '20' },
  { id: 'butter', name: 'Unsalted butter', unit: 'kg', costPerUnit: '480', minimum: '2', start: '12' },
  { id: 'eggs', name: 'Eggs', unit: 'pcs', costPerUnit: '9', minimum: '60', start: '400' },
  { id: 'milk', name: 'Fresh milk', unit: 'l', costPerUnit: '95', minimum: '4', start: '30' },
  { id: 'yeast', name: 'Instant yeast', unit: 'g', costPerUnit: '1.2', minimum: '200', start: '2000' },
  { id: 'cocoa', name: 'Cocoa powder', unit: 'kg', costPerUnit: '520', minimum: '1', start: '6' },
  { id: 'powdered-sugar', name: 'Powdered sugar', unit: 'kg', costPerUnit: '90', minimum: '2', start: '2.20' },
  { id: 'ube-halaya', name: 'Ube halaya', unit: 'kg', costPerUnit: '360', minimum: '2', start: '2.30' },
];

/** The ingredients that start just above their restock level, shown by the pantry and the data layer. */
export const watchedIngredientIds = ['flour', 'powdered-sugar', 'ube-halaya'];

const dough = { flour: '1.0', 'white-sugar': '0.15', butter: '0.12', eggs: '3', milk: '0.3', yeast: '14' };

export const demoProducts: DemoProduct[] = [
  { id: 'classic-glazed', name: 'Classic Glazed', priceCentavos: 3500, yieldQuantity: 12, batch: { ...dough, 'powdered-sugar': '0.3' } },
  { id: 'ube-cream', name: 'Ube Cream', priceCentavos: 5500, yieldQuantity: 12, batch: { ...dough, 'ube-halaya': '0.5' } },
  {
    id: 'chocolate-dip',
    name: 'Chocolate Dip',
    priceCentavos: 4000,
    yieldQuantity: 12,
    batch: { ...dough, cocoa: '0.12', 'powdered-sugar': '0.2' },
  },
];

/** Net sales and expenses on the captured dashboard the demo continues from, in centavos. */
export const demoStartTotals = { netSalesCentavos: 18_001_000, expensesCentavos: 11_858_600 };
