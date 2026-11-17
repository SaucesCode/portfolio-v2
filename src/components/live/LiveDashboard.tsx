import { demoIngredients } from "@/data/rowszein-demo";
import {
  formatPeso,
  formatStock,
  lowStock,
  netProfitCentavos,
  toQuanta,
  type DemoState,
} from "@/lib/rowszein-demo";
import type { RecentSale } from "./useRowszeinDemo";
import styles from "./LiveDashboard.module.css";

const nav = [
  "Home",
  "Orders",
  "Sales register",
  "Pantry",
  "Recipe costing",
  "Profit & analytics",
];
const watched = ["flour", "powdered-sugar", "ube-halaya"];

/**
 * A miniature of the Rowszein's Delight owner panel, drawn from live demo state. It is a picture
 * for sighted visitors (aria-hidden); the controls and their announcements carry the information.
 * The phone layout follows the real app on phones: no sidebar, one column, readable sizes.
 */
export function LiveDashboard({
  state,
  recent,
  layout = "desktop",
}: {
  state: DemoState;
  recent: RecentSale[];
  layout?: "desktop" | "phone";
}) {
  const low = lowStock(state);
  const spent = state.expensesCentavos;
  return (
    <div className={styles.shell} data-layout={layout} aria-hidden>
      <div className={styles.panel}>
        <aside className={styles.sidebar}>
          <p className={styles.brand}>Rowszein’s Delight</p>
          <ul>
            {nav.map((item, i) => (
              <li key={item} data-active={i === 0}>
                {item}
                {item === "Orders" && <span className={styles.badge}>2</span>}
              </li>
            ))}
          </ul>
        </aside>

        <div className={styles.main}>
          <header className={styles.top}>
            <div>
              <p className={styles.date}>Monday, November 16</p>
              <p className={styles.greeting}>Good afternoon, Demo-owner</p>
            </div>
            <span className={styles.record}>+ Record a sale</span>
          </header>

          <div className={styles.grid}>
            <section className={styles.card}>
              <p className={styles.label}>Net sales this year</p>
              <p
                key={state.netSalesCentavos}
                data-figure="net-sales"
                className={`${styles.figure} ${styles.changed}`}
              >
                {formatPeso(state.netSalesCentavos)}
              </p>
              <dl className={styles.totals}>
                <div>
                  <dt>Spent</dt>
                  <dd>{formatPeso(spent)}</dd>
                </div>
                <div>
                  <dt>Profit</dt>
                  <dd key={netProfitCentavos(state)} className={styles.changed}>
                    {formatPeso(netProfitCentavos(state))}
                  </dd>
                </div>
              </dl>
              <p className={styles.label}>Latest sales</p>
              <ol className={styles.recent}>
                {recent.length === 0 && (
                  <li className={styles.empty}>
                    Sales you record appear here.
                  </li>
                )}
                {recent.map((sale) => (
                  <li key={sale.key} className={styles.changed}>
                    <span>Just now · 1× {sale.name}</span>
                    <span>{formatPeso(sale.priceCentavos)}</span>
                  </li>
                ))}
              </ol>
            </section>

            <section className={styles.card}>
              <p className={styles.label}>Needs attention</p>
              {low.length === 0 ? (
                <p className={styles.calm}>
                  Everything in the pantry is above its restock level.
                </p>
              ) : (
                <p
                  key={low.length}
                  className={`${styles.alert} ${styles.changed}`}
                >
                  {low.length === 1
                    ? "1 ingredient is"
                    : `${low.length} ingredients are`}{" "}
                  running low: {low.map((i) => i.name).join(", ")}
                </p>
              )}
              <p className={styles.label}>Pantry</p>
              <ul className={styles.meters}>
                {demoIngredients
                  .filter((ingredient) => watched.includes(ingredient.id))
                  .map((ingredient) => {
                    const quantity = state.stock[ingredient.id];
                    const minimum = toQuanta(ingredient.minimum);
                    const fill = Math.min(
                      1,
                      Number(quantity) / Number(minimum * 3n),
                    );
                    const isLow = quantity <= minimum;
                    return (
                      <li key={ingredient.id} data-low={isLow}>
                        <span>{ingredient.name}</span>
                        <span className={styles.amount}>
                          {formatStock(quantity, ingredient.unit)}
                        </span>
                        <span className={styles.track}>
                          <span style={{ transform: `scaleX(${fill})` }} />
                        </span>
                      </li>
                    );
                  })}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
