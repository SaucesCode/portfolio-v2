'use client';

import { useEffect, useRef, useState } from 'react';
import { partLabels, partOrder, questionSteps } from '@/data/question-trace';
import styles from './QuestionTrace.module.css';

/**
 * One question followed through the assistant. The steps scroll past like any other text; on wide
 * screens a drawing of the five parts stays beside them and lights the parts the step in the
 * middle of the screen uses. Every step names its parts in words too, so the drawing is never the
 * only place that information lives.
 */
export function QuestionTrace() {
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

  const lit = new Set(questionSteps[active].parts);

  return (
    <div className={styles.trace}>
      <ol className={styles.steps}>
        {questionSteps.map((step, i) => (
          <li
            key={step.title}
            ref={(node) => {
              stepRefs.current[i] = node;
            }}
            data-index={i}
            data-trace-step
            data-active={i === active}
            className={styles.step}
          >
            <span className={styles.number} aria-hidden>
              {i + 1}
            </span>
            <h3 className={styles.title}>{step.title}</h3>
            <p className={styles.body}>{step.body}</p>
            <ul className={styles.parts} aria-label="Parts involved">
              {step.parts.map((part) => (
                <li key={part}>{partLabels[part]}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      {/* The drawing repeats what each step already says in words. */}
      <div className={styles.drawing} data-trace-drawing aria-hidden>
        {partOrder.map((part) => (
          <div key={part} className={styles.part} data-part={part} data-on={lit.has(part)}>
            {partLabels[part]}
          </div>
        ))}
      </div>
    </div>
  );
}
