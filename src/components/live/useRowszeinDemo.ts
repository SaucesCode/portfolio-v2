'use client';

import { useCallback, useState } from 'react';
import { demoProducts, type DemoProduct } from '@/data/rowszein-demo';
import { costPerPieceCentavos, formatPeso, initialState, lowStock, recordSale, type DemoState } from '@/lib/rowszein-demo';

export interface RecentSale {
  key: number;
  name: string;
  priceCentavos: number;
}

export interface RowszeinDemo {
  state: DemoState;
  recent: RecentSale[];
  /** Records one piece and returns the sentence to announce. */
  sell: (id: DemoProduct['id']) => string;
  reset: () => string;
}

const START = { state: initialState(), recent: [] as RecentSale[], next: 1 };

/** The live demo's state lives above the hero windows, so switching windows never resets it. */
export function useRowszeinDemo(): RowszeinDemo {
  const [demo, setDemo] = useState(START);

  const sell = useCallback(
    (id: DemoProduct['id']) => {
      const product = demoProducts.find((p) => p.id === id)!;
      const result = recordSale(demo.state, id);
      if (!result.ok) return `Not enough ${result.shortOf.name.toLowerCase()} for one more ${product.name}.`;
      const wasLow = new Set(lowStock(demo.state).map((i) => i.id));
      const nowLow = lowStock(result.state).filter((i) => !wasLow.has(i.id));
      setDemo({
        state: result.state,
        recent: [{ key: demo.next, name: product.name, priceCentavos: product.priceCentavos }, ...demo.recent].slice(0, 3),
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
    setDemo(START);
    return 'Demo reset to the starting figures.';
  }, []);

  return { state: demo.state, recent: demo.recent, sell, reset };
}
