'use client';

import { useCallback, useState } from 'react';
import { demoProducts, type DemoIngredient, type DemoProduct } from '@/data/rowszein-demo';
import { costPerPieceCentavos, formatPeso, initialState, lowStock, recordSale, type DemoState } from '@/lib/rowszein-demo';

export interface RecentSale {
  key: number;
  name: string;
  priceCentavos: number;
}

export type DemoEvent =
  | { key: number; kind: 'sold'; productId: DemoProduct['id'] }
  | { key: number; kind: 'refused'; productId: DemoProduct['id']; shortOf: DemoIngredient }
  | { key: number; kind: 'reset' };

export interface RowszeinDemo {
  state: DemoState;
  recent: RecentSale[];
  /** The latest sell or reset call, refusals included; its key rises on every call. */
  event: DemoEvent | null;
  /** Records one piece and returns the sentence to announce. */
  sell: (id: DemoProduct['id']) => string;
  reset: () => string;
}

const START = { state: initialState(), recent: [] as RecentSale[], event: null as DemoEvent | null, next: 1 };

/** The live demo's state lives above the hero windows, so switching windows never resets it. */
export function useRowszeinDemo(): RowszeinDemo {
  const [demo, setDemo] = useState(START);

  const sell = useCallback(
    (id: DemoProduct['id']) => {
      const product = demoProducts.find((p) => p.id === id)!;
      const result = recordSale(demo.state, id);
      if (!result.ok) {
        setDemo({ ...demo, event: { key: demo.next, kind: 'refused', productId: id, shortOf: result.shortOf }, next: demo.next + 1 });
        return `Not enough ${result.shortOf.name.toLowerCase()} for one more ${product.name}.`;
      }
      const wasLow = new Set(lowStock(demo.state).map((i) => i.id));
      const nowLow = lowStock(result.state).filter((i) => !wasLow.has(i.id));
      setDemo({
        state: result.state,
        recent: [{ key: demo.next, name: product.name, priceCentavos: product.priceCentavos }, ...demo.recent].slice(0, 3),
        event: { key: demo.next, kind: 'sold', productId: id },
        next: demo.next + 1,
      });
      const earned = formatPeso(product.priceCentavos - costPerPieceCentavos(product));
      return (
        `Sold 1 ${product.name} for ${formatPeso(product.priceCentavos)}. Net sales ${formatPeso(result.state.netSalesCentavos)}. ` +
        `Earned ${earned} over recipe cost.` +
        nowLow.map((i) => ` ${i.name} is now low.`).join('')
      );
    },
    [demo],
  );

  const reset = useCallback(() => {
    setDemo((current) => ({ ...START, event: { key: current.next, kind: 'reset' }, next: current.next + 1 }));
    return 'Demo reset to the starting figures.';
  }, []);

  return { state: demo.state, recent: demo.recent, event: demo.event, sell, reset };
}
