'use client';

import { useId } from 'react';
import { demoProducts } from '@/data/rowszein-demo';
import { formatPeso, recordSale } from '@/lib/rowszein-demo';
import type { RowszeinDemo } from './useRowszeinDemo';
import styles from './LiveControls.module.css';

/** Full-size controls under the hero window: record one piece at a time, or start over. */
export function SaleControls({ demo, announce }: { demo: RowszeinDemo; announce: (message: string) => void }) {
  // The hero and the phone's full-screen view can both show these controls; ids must stay unique.
  const uid = useId();
  return (
    <div role="group" aria-label="Try Rowszein’s Delight" className={styles.controls}>
      {/* Reset sits beside the heading, so the three products keep one row even in a narrow column. */}
      <div className={styles.heading}>
        <p className={styles.prompt}>Record a sale:</p>
        <button type="button" className={styles.reset} onClick={() => announce(demo.reset())}>
          Reset demo
        </button>
      </div>
      <div className={styles.options}>
        {demoProducts.map((product) => {
          const attempt = recordSale(demo.state, product.id);
          const reasonId = `${uid}-reason-${product.id}`;
          return (
            <span key={product.id} className={styles.option}>
              <button
                type="button"
                className={styles.chip}
                // aria-disabled, not disabled: the button keeps focus when it runs out, and a press
                // explains why instead of doing nothing.
                aria-disabled={!attempt.ok}
                aria-describedby={attempt.ok ? undefined : reasonId}
                aria-label={`Sell 1 ${product.name} for ${formatPeso(product.priceCentavos)}`}
                onClick={() => announce(demo.sell(product.id))}
              >
                {product.name} <span className={styles.price}>₱{product.priceCentavos / 100}</span>
              </button>
              {!attempt.ok && (
                <span id={reasonId} className={styles.reason}>
                  Not enough {attempt.shortOf.name.toLowerCase()} for one more
                </span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}
