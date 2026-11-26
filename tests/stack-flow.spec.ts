import { expect, test } from '@playwright/test';
import { tableGroups, traceSteps } from '../src/data/rowszein-trace';
import { demoIngredients } from '../src/data/rowszein-demo';
import { describeFlow, flowFor } from '../src/lib/stack-flow';

const flour = demoIngredients.find((i) => i.id === 'flour')!;
const allTables = tableGroups.flatMap((g) => g.tables.map((t) => t.table));

test.describe('Stack flow', () => {
  test('a sale lights every step and writes what step five writes, in table order', () => {
    const flow = flowFor({ key: 3, kind: 'sold', productId: 'ube-cream' })!;
    expect(flow).toMatchObject({ key: 3, lit: traceSteps.length, stoppedAt: null, shortOf: null });
    const step5 = traceSteps.find((s) => s.title === 'Write the sale and its paper trail')!;
    const expected = allTables.filter((t) => step5.touches[t] === 'write');
    expect(flow.written).toEqual(expected);
    expect(flow.written).toContain('Sale');
    expect(flow.written).not.toContain('Recipe');
  });

  test('a refused sale stops at the balance check and writes nothing', () => {
    const flow = flowFor({ key: 4, kind: 'refused', productId: 'classic-glazed', shortOf: flour })!;
    const stop = traceSteps.findIndex((s) => s.title === 'Work out every new balance before writing anything');
    expect(flow).toEqual({ key: 4, lit: stop + 1, stoppedAt: stop, shortOf: 'all-purpose flour', written: [] });
  });

  test('reset and no event light nothing', () => {
    expect(flowFor({ key: 5, kind: 'reset' })).toBeNull();
    expect(flowFor(null)).toBeNull();
  });

  test('the sentences say what happened underneath', () => {
    expect(describeFlow(flowFor({ key: 1, kind: 'sold', productId: 'ube-cream' })!)).toBe(
      'Underneath, the real app writes this sale and its paper trail in one transaction.',
    );
    expect(describeFlow(flowFor({ key: 2, kind: 'refused', productId: 'ube-cream', shortOf: flour })!)).toBe(
      'Underneath, the real app checks every balance first; with too little all-purpose flour it writes nothing.',
    );
  });
});
