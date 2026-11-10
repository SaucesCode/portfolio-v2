'use client';

import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useId, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import type { WalkthroughStep } from '@/data/projects';
import styles from './ApplicationWalkthrough.module.css';

interface Props {
  title: string;
  steps: WalkthroughStep[];
}

const SWIPE_DISTANCE = 40;

/**
 * A guided tour through real screens of an application. Each step crossfades in and the
 * "camera" settles on the part of the screen the caption talks about.
 */
export function ApplicationWalkthrough({ title, steps }: Props) {
  const [index, setIndex] = useState(0);
  const swipeRef = useRef<{ x: number; y: number } | null>(null);
  const captionId = useId();
  const step = steps[index];
  const last = steps.length - 1;

  const go = (next: number) => setIndex(Math.min(last, Math.max(0, next)));

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, number> = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: last };
    if (!(event.key in moves)) return;
    event.preventDefault();
    go(moves[event.key]);
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse') return;
    swipeRef.current = { x: event.clientX, y: event.clientY };
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = swipeRef.current;
    swipeRef.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < SWIPE_DISTANCE || Math.abs(dx) < Math.abs(dy)) return;
    go(dx < 0 ? index + 1 : index - 1);
  };

  return (
    <section className={styles.tour} aria-roledescription="carousel" aria-label={`Guided tour of ${title}`}>
      <div
        className={styles.stage}
        tabIndex={0}
        aria-describedby={captionId}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (swipeRef.current = null)}
      >
        {steps.map((item, i) => (
          <div
            key={item.shot.src}
            className={styles.slide}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${steps.length}: ${item.title}`}
            aria-hidden={i !== index}
            data-active={i === index}
            data-pos={i < index ? 'before' : i > index ? 'after' : 'current'}
            style={
              {
                '--fx': `${item.focus.x}%`,
                '--fy': `${item.focus.y}%`,
                '--zoom': item.focus.zoom,
              } as CSSProperties
            }
          >
            <Image
              src={item.shot.src}
              width={item.shot.width}
              height={item.shot.height}
              sizes="(min-width: 1024px) 66vw, 94vw"
              alt={`${title}: ${item.title}`}
              loading="lazy"
              draggable={false}
            />
          </div>
        ))}
        <span className={styles.badge}>Demonstration data</span>
      </div>

      <div className={styles.below}>
        <div id={captionId} className={styles.caption} aria-live="polite">
          <p className={styles.count}>
            Step {index + 1} of {steps.length}
          </p>
          <h4 className={styles.title}>{step.title}</h4>
          <p className={styles.body}>{step.body}</p>
          <details className={styles.detail}>
            <summary>How it works</summary>
            <p>{step.detail}</p>
          </details>
        </div>

        <nav className={styles.nav} aria-label={`${title} tour steps`}>
          <ol className={styles.steps}>
            {steps.map((item, i) => (
              <li key={item.title}>
                <button type="button" aria-current={i === index ? 'step' : undefined} onClick={() => go(i)}>
                  <span className={styles.stepNumber} aria-hidden>
                    {i + 1}
                  </span>
                  {item.title}
                </button>
              </li>
            ))}
          </ol>
          <div className={styles.arrows}>
            <button type="button" onClick={() => go(index - 1)} disabled={index === 0}>
              <ChevronLeft aria-hidden size={18} />
              Previous
            </button>
            <div className={styles.progress} aria-hidden>
              <span style={{ transform: `scaleX(${(index + 1) / steps.length})` }} />
            </div>
            <button type="button" onClick={() => go(index + 1)} disabled={index === last}>
              Next
              <ChevronRight aria-hidden size={18} />
            </button>
          </div>
        </nav>
      </div>
    </section>
  );
}
