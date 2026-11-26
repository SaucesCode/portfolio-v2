import type { CSSProperties } from 'react';
import { demoIngredients, watchedIngredientIds } from '@/data/rowszein-demo';
import { tableGroups, traceSteps } from '@/data/rowszein-trace';
import { formatStock, type DemoState } from '@/lib/rowszein-demo';
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

/** The server's steps for one sale, by their titles, in order. */
export function LogicLayer({ flow }: { flow: StackFlow | null }) {
  return (
    <span className={styles.sheet}>
      <ol key={flow?.key} className={styles.steps}>
        {traceSteps.map((step, i) => (
          <li key={step.title} className={styles.step}>
            <span className={styles.number}>{String(i + 1).padStart(2, '0')}</span>
            {step.title}
          </li>
        ))}
      </ol>
    </span>
  );
}

/** The tables a sale is written to, grouped as the app groups them, with the demo's own rows. */
export function DataLayer({ state, recent, flow }: { state: DemoState; recent: RecentSale[]; flow: StackFlow | null }) {
  return (
    <span className={styles.sheet}>
      <span key={flow?.key} className={styles.groups}>
        {tableGroups.map((group) => (
          <span key={group.name} className={styles.group}>
            <span className={styles.groupName}>{group.name}</span>
            <ul className={styles.tables}>
              {group.tables.map(({ table }) => (
                <li key={table} data-table={table}>
                  <span className={styles.table}>{table}</span>
                  {table === 'Ingredient' && (
                    <ul className={styles.rows}>
                      {watched.map((ingredient) => (
                        <li key={ingredient.id}>
                          <span>{ingredient.name}</span>
                          <span className={styles.value}>{formatStock(state.stock[ingredient.id], ingredient.unit)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {table === 'Sale' && recent.length > 0 && (
                    <ul className={styles.rows}>
                      {recent.map((sale) => (
                        <li key={sale.key}>1× {sale.name}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </span>
        ))}
      </span>
    </span>
  );
}
