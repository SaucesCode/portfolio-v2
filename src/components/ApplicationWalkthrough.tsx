'use client';

import Image from 'next/image';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { useId, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import type { WalkthroughStep } from '@/data/projects';
import styles from './ApplicationWalkthrough.module.css';
import { Morph } from './Morph';

interface Props {
  title: string;
  steps: WalkthroughStep[];
  /** Shared view-transition name for the screen, see Morph. */
  transitionName?: string;
}

const SWIPE_DISTANCE = 40;

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * A guided tour through real screens of an application. Each step crossfades in and the
 * "camera" settles on the part of the screen the caption talks about.
 */
export function ApplicationWalkthrough({ title, steps, transitionName }: Props) {
  const [index, setIndex] = useState(0);
  const swipeRef = useRef<{ x: number; y: number } | null>(null);
  const captionId = useId();
  const upNextId = useId();
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
      <Morph name={transitionName}>
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
              <span className={styles.focus} aria-hidden />
              {/* Every step stays in the page's text for search engines and AI crawlers, while visitors see one
                  step at a time; screen readers already hear the live caption, so this copy is hidden from them. */}
              <span className="sr-only" aria-hidden>
                {item.title}. {item.body}
              </span>
            </div>
          ))}
          <span className={styles.badge}>Demonstration data</span>
        </div>
      </Morph>

      <div className={styles.below}>
        <div id={captionId} className={styles.caption} aria-live="polite">
          {/* Keyed by step, so each new caption slides in once. */}
          <div key={index} className={styles.enter}>
            <p className="sr-only">
              Step {index + 1} of {steps.length}
            </p>
            <h4 className={styles.title}>{step.title}</h4>
            <p className={styles.body}>{step.body}</p>
            <details className={styles.detail}>
              <summary>How it works</summary>
              <p>{step.detail}</p>
            </details>
          </div>
        </div>

        <nav className={styles.nav} aria-label={`${title} tour steps`}>
          {/* The number and what comes next, side by side; the buttons below stay one size. */}
          <div className={styles.heading}>
            <p className={styles.counter} aria-hidden>
              {pad(index + 1)} <span>/ {pad(steps.length)}</span>
            </p>
            <p id={upNextId} className={styles.upNext}>
              {index < last ? `Up next: ${steps[index + 1].title}` : 'Last step'}
            </p>
          </div>
          {/* One segment per step: progress at a glance, and a way to jump without listing every step. */}
          <div className={styles.segments}>
            {steps.map((item, i) => (
              <button
                key={item.title}
                type="button"
                aria-label={`Go to step ${i + 1}: ${item.title}`}
                aria-current={i === index ? 'step' : undefined}
                data-done={i < index}
                onClick={() => go(i)}
              />
            ))}
          </div>
          <div className={styles.arrows}>
            <button type="button" onClick={() => go(index - 1)} disabled={index === 0}>
              <ChevronLeft aria-hidden size={18} />
              Previous
            </button>
            {index < last ? (
              <button type="button" aria-describedby={upNextId} onClick={() => go(index + 1)}>
                Next
                <ChevronRight aria-hidden size={18} />
              </button>
            ) : (
              <button type="button" onClick={() => go(0)}>
                Start again
                <RotateCcw aria-hidden size={16} />
              </button>
            )}
          </div>
        </nav>
      </div>
    </section>
  );
}
