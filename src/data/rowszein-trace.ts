/**
 * What happens to one sale on the server, step by step, as implemented in
 * backend/sales/services.py (execute_sale and _run) in the Rowszein's Delight repository.
 * Each step names a test from backend/sales/tests.py that exercises it.
 */

export type Table =
  | 'Product'
  | 'Recipe'
  | 'Ingredient'
  | 'Sale'
  | 'SaleItem'
  | 'InventoryOperation'
  | 'ConsumptionBasis'
  | 'SaleConsumption'
  | 'StockMovement'
  | 'SaleFinancialEntry';

export type Touch = 'read' | 'lock' | 'write';

export interface TraceStep {
  title: string;
  body: string;
  /** Name of the test that covers this behaviour. */
  test: string;
  touches: Partial<Record<Table, Touch>>;
  /** The step happens in the browser, before the server is involved. */
  inBrowser?: boolean;
}

export const tableGroups: { name: string; description: string; tables: { table: Table; note: string }[] }[] = [
  {
    name: 'Catalogue',
    description: 'What the shop makes and buys',
    tables: [
      { table: 'Product', note: 'what is sold, and its price' },
      { table: 'Recipe', note: 'ingredients per batch, and the yield' },
      { table: 'Ingredient', note: 'stock on hand, with a revision number' },
    ],
  },
  {
    name: 'Sale',
    description: 'What the customer bought',
    tables: [
      { table: 'Sale', note: 'date, total and revision' },
      { table: 'SaleItem', note: 'each product line, at the price charged' },
    ],
  },
  {
    name: 'Ledger',
    description: 'Why every number changed',
    tables: [
      { table: 'InventoryOperation', note: 'one row per request, with its response' },
      { table: 'ConsumptionBasis', note: 'the recipe snapshot stock is taken against' },
      { table: 'SaleConsumption', note: 'what this sale used of each basis' },
      { table: 'StockMovement', note: 'each stock change, with the balance after' },
      { table: 'SaleFinancialEntry', note: 'the money posted for the sale' },
    ],
  },
];

const written: Partial<Record<Table, Touch>> = {
  Ingredient: 'write',
  Sale: 'write',
  SaleItem: 'write',
  InventoryOperation: 'write',
  ConsumptionBasis: 'write',
  SaleConsumption: 'write',
  StockMovement: 'write',
  SaleFinancialEntry: 'write',
};

export const traceSteps: TraceStep[] = [
  {
    title: 'The sale leaves the till with a name',
    body: 'Before sending, the browser gives the request a random ID in an Idempotency-Key header. Edits and cancellations also send the revision of the sale they were based on.',
    test: 'test_invalid_creation_and_missing_identity_write_nothing',
    touches: {},
    inBrowser: true,
  },
  {
    title: 'Check who is asking, and whether this already happened',
    body: 'Inside a single database transaction the server checks the user’s role and signed-in device, then looks the ID up. The same ID with the same contents replays the stored response instead of selling twice. The same ID with different contents is refused.',
    test: 'test_successful_retry_replays_once_and_conflicting_payload_is_rejected',
    touches: { InventoryOperation: 'read' },
  },
  {
    title: 'Lock everything the sale will touch',
    body: 'The products, their ingredients and the recipe snapshots are locked for update, always in the same order. Two tills selling the last slice at once queue up behind each other, and one of them is told there is not enough stock.',
    test: 'test_competing_last_stock_sales',
    touches: { Product: 'lock', Ingredient: 'lock', ConsumptionBasis: 'lock' },
  },
  {
    title: 'Work out every new balance before writing anything',
    body: 'Each product’s recipe becomes grams and millilitres of ingredients, and every resulting stock level is calculated and validated first. If any ingredient would go below zero, the request fails with nothing written.',
    test: 'test_insufficient_stock_rolls_back_all_records',
    touches: { Product: 'lock', Recipe: 'read', Ingredient: 'lock', ConsumptionBasis: 'lock' },
  },
  {
    title: 'Write the sale and its paper trail',
    body: 'The sale and its lines are saved with a record of the request, what each recipe consumed, a stock movement for every ingredient with the balance after it, and a financial entry for the amount.',
    test: 'test_failures_at_each_write_boundary_roll_back_the_entire_creation',
    touches: { ...written, Product: 'lock', Recipe: 'read' },
  },
  {
    title: 'Commit it all, or leave no trace',
    body: 'Everything commits together. An error at any point rolls the whole transaction back. Later edits never rewrite the original: they reverse what was used and post an adjustment, so the history still adds up.',
    test: 'test_edits_preserve_original_items_and_total_instead_of_rewriting_history',
    touches: written,
  },
];
