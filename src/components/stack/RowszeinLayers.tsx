import type { CSSProperties } from 'react';
import { demoIngredients, watchedIngredientIds } from '@/data/rowszein-demo';
import { tableGroups, traceSteps } from '@/data/rowszein-trace';
import { formatPeso, formatStock, type DemoState } from '@/lib/rowszein-demo';
import type { StackFlow } from '@/lib/stack-flow';
import type { RecentSale } from '../live/useRowszeinDemo';
import palette from '../live/RowszeinPalette.module.css';
import styles from './RowszeinLayers.module.css';

const swatches = ['page', 'card', 'soft', 'accent', 'plum', 'ink', 'ok', 'low'];
const watched = demoIngredients.filter((ingredient) => watchedIngredientIds.includes(ingredient.id));

/** The app's own palette and type, as a translucent sheet above the interface. */
export function DesignLayer() {
  return (
    <span className={`${styles.sheet} ${styles.design} ${palette.palette}`}>
      <span className={styles.board}>
        <span className={styles.swatches}>
          {swatches.map((name) => (
            <span key={name} className={styles.swatch} style={{ '--swatch': `var(--rz-${name})` } as CSSProperties}>
              {name}
            </span>
          ))}
        </span>
        <span className={styles.type}>
          <span className={styles.specimen}>
            <span className={styles.serif}>Aa</span>
            Newsreader
          </span>
          <span className={styles.specimen}>
            <span className={styles.sans}>Aa</span>
            System UI
          </span>
        </span>
      </span>
    </span>
  );
}

/**
 * The server's steps for one sale, by their titles, in order. A recorded sale lights them one after
 * another; a refused one stops at the step that refused it.
 */
export function LogicLayer({ flow }: { flow: StackFlow | null }) {
  return (
    <div className={styles.sheet}>
      <ol key={flow?.key} className={styles.steps}>
        {traceSteps.map((step, i) => (
          <li
            key={step.title}
            className={styles.step}
            data-lit={i < (flow?.lit ?? 0)}
            data-stopped={i === flow?.stoppedAt || undefined}
            style={{ '--order': i } as CSSProperties}
          >
            <span className={styles.number}>{String(i + 1).padStart(2, '0')}</span>
            <span>
              {step.title}
              {i === flow?.stoppedAt && <span className={styles.stop}>Stopped: not enough {flow.shortOf}</span>}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** The tables a sale is written to, grouped as the app groups them, with the demo's own rows. */
export function DataLayer({ state, recent, flow }: { state: DemoState; recent: RecentSale[]; flow: StackFlow | null }) {
  return (
    <div className={styles.sheet}>
      <div
        key={flow?.key}
        className={styles.groups}
        data-reset={!flow || undefined}
        style={{ '--order': flow?.lit ?? 0 } as CSSProperties}
      >
        {tableGroups.map((group) => (
          <div key={group.name} className={styles.group}>
            <span className={styles.groupName}>{group.name}</span>
            <ul className={styles.tables}>
              {group.tables.map(({ table }) => (
                <li key={table} data-table={table} data-written={flow?.written.includes(table) || undefined}>
                  <span className={styles.table}>{table}</span>
                  {table === 'Ingredient' && (
                    <ul className={styles.rows}>
                      {watched.map((ingredient) => (
                        <li key={ingredient.id}>
                          <span>{ingredient.name}</span>
                          <span className={`${styles.value} ${styles.fresh}`}>{formatStock(state.stock[ingredient.id], ingredient.unit)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {(table === 'Sale' || table === 'SaleItem') && recent.length > 0 && (
                    <ul className={styles.rows}>
                      {recent.map((sale, i) => (
                        <li key={sale.key} className={i === 0 ? styles.fresh : undefined}>
                          {table === 'Sale' ? formatPeso(sale.priceCentavos) : `1× ${sale.name}`}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
