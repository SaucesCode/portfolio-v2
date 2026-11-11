'use client';

import { useEffect, useRef, useState } from 'react';
import { tableGroups, traceSteps, type Table, type Touch } from '@/data/rowszein-trace';
import styles from './SaleTrace.module.css';

const touchLabel: Record<Touch, string> = { read: 'Read', lock: 'Locked', write: 'Written' };

/**
 * One sale followed through the server. The steps scroll past like any other text; on wide
 * screens a drawing of the database stays beside them and shows which tables the step in the
 * middle of the screen reads, locks or writes. Every step also lists its tables in words, so the
 * drawing is never the only place that information lives.
 */
export function SaleTrace() {
  const [active, setActive] = useState(0);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
        }
      },
      // A thin band across the middle of the viewport: whichever step crosses it is current.
      { rootMargin: '-45% 0px -45% 0px' },
    );
    stepRefs.current.forEach((step) => step && observer.observe(step));
    return () => observer.disconnect();
  }, []);

  const step = traceSteps[active];

  return (
    <div className={styles.trace}>
      <ol className={styles.steps}>
        {traceSteps.map((item, i) => (
          <li
            key={item.title}
            ref={(node) => {
              stepRefs.current[i] = node;
            }}
            data-index={i}
            data-active={i === active}
            className={styles.step}
          >
            <span className={styles.number} aria-hidden>
              {i + 1}
            </span>
            <h3 className={styles.title}>{item.title}</h3>
            <p className={styles.body}>{item.body}</p>
            <ul className={styles.touches} aria-label="Tables involved">
              {item.inBrowser && <li data-touch="browser">In the browser, before the server</li>}
              {(Object.entries(item.touches) as [Table, Touch][]).map(([table, touch]) => (
                <li key={table} data-touch={touch}>
                  {touchLabel[touch]}: <code>{table}</code>
                </li>
              ))}
            </ul>
            <p className={styles.test}>
              Covered by <code>{item.test}</code>
            </p>
          </li>
        ))}
      </ol>

      {/* The drawing repeats what each step already says in words. */}
      <div className={styles.drawing} aria-hidden>
        <div className={styles.request} data-on={Boolean(step.inBrowser)}>
          <span>POST /api/sales/</span>
          <span>Idempotency-Key: 6f1c…</span>
        </div>
        <div className={styles.transaction} data-on={!step.inBrowser} data-committed={active === traceSteps.length - 1}>
          <span className={styles.transactionLabel}>
            {active === traceSteps.length - 1 ? 'Transaction committed' : 'One database transaction'}
          </span>
          {tableGroups.map((group) => (
            <div key={group.name} className={styles.group}>
              <p className={styles.groupName}>
                {group.name}
                <span>{group.description}</span>
              </p>
              <ul>
                {group.tables.map(({ table, note }) => {
                  const touch = step.touches[table];
                  return (
                    <li key={table} data-touch={touch ?? 'none'} className={styles.table}>
                      <span className={styles.tableName}>{table}</span>
                      <span className={styles.tableNote}>{note}</span>
                      <span className={styles.tableState}>{touch ? touchLabel[touch] : ''}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
        <p className={styles.legend}>
          <span data-touch="read">Read</span>
          <span data-touch="lock">Locked for update</span>
          <span data-touch="write">Written</span>
        </p>
      </div>
    </div>
  );
}
