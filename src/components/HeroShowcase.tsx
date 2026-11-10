'use client';

import Image from 'next/image';
import { ArrowDown } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { categoryLabels, featuredSoftware, featuredWebsite, type Shot } from '@/data/projects';
import styles from './HeroShowcase.module.css';

export type Discipline = 'software' | 'web';

interface Artifact {
  id: Discipline;
  option: string;
  label: string;
  title: string;
  medium: string;
  shot: Shot;
  href: string;
  action: string;
}

const artifacts: Record<Discipline, Artifact> = {
  software: {
    id: 'software',
    option: 'Software',
    label: categoryLabels.software,
    title: featuredSoftware.title,
    medium: featuredSoftware.medium,
    shot: featuredSoftware.walkthrough?.[0].shot ?? featuredSoftware.poster,
    href: `#${featuredSoftware.slug}`,
    action: 'Take the guided tour',
  },
  web: {
    id: 'web',
    option: 'Experiences',
    label: 'Web & Experiences',
    title: featuredWebsite.title,
    medium: featuredWebsite.medium,
    shot: featuredWebsite.poster,
    href: `#${featuredWebsite.slug}`,
    action: 'Preview the full site',
  },
};

const order: Discipline[] = ['software', 'web'];
const headline: Record<Discipline, string> = { software: 'Software that works.', web: 'Experiences that stand out.' };
const other = (id: Discipline): Discipline => (id === 'software' ? 'web' : 'software');

const HANDOFF_MS = 620;
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * "The handoff". The chosen project travels into the primary frame while the other travels out
 * to the supporting position, each from wherever it currently is (FLIP), so rapid switching never
 * jumps. A dimension line then hands over from the old headline line to the new primary frame.
 */
export function HeroShowcase({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<Discipline>('software');
  const rootRef = useRef<HTMLDivElement>(null);
  const windows = useRef<Record<Discipline, HTMLDivElement | null>>({ software: null, web: null });
  const lines = useRef<Record<Discipline, HTMLSpanElement | null>>({ software: null, web: null });
  const options = useRef<Record<Discipline, HTMLButtonElement | null>>({ software: null, web: null });
  const threadRef = useRef<SVGGElement>(null);
  const firstRects = useRef<Record<Discipline, DOMRect> | null>(null);
  const captionRef = useRef<HTMLParagraphElement>(null);
  const current = artifacts[selected];

  /** Draws the dimension line from the end of the lit headline line to the primary frame's corner. */
  const drawThread = useCallback(
    (animate: boolean) => {
      const root = rootRef.current;
      const group = threadRef.current;
      const line = lines.current[selected];
      const frame = windows.current[selected];
      if (!root || !group || !line || !frame) return;
      const path = group.querySelector('path')!;
      const [start, end] = group.querySelectorAll('circle');
      const box = root.getBoundingClientRect();
      // The end of the last rendered line of text, not the edge of its (possibly wider) box.
      const range = document.createRange();
      range.selectNodeContents(line);
      const lineRects = range.getClientRects();
      const text = lineRects[lineRects.length - 1] ?? line.getBoundingClientRect();
      // While the handoff plays, measure the frame's destination rather than its moving position.
      const moving = frame.getAnimations();
      moving.forEach((a) => a.pause());
      const saved = moving.map((a) => a.currentTime);
      moving.forEach((a) => (a.currentTime = (a.effect?.getComputedTiming().endTime as number) ?? 0));
      const rect = frame.getBoundingClientRect();
      moving.forEach((a, i) => {
        a.currentTime = saved[i];
        a.play();
      });
      const ax = text.right - box.left + 14;
      const ay = text.bottom - box.top - text.height * 0.32;
      const bx = rect.left - box.left;
      const by = rect.top - box.top + 22;
      const elbow = Math.max(ax + 24, Math.min(bx - 24, ax + 48));
      path.setAttribute('d', `M ${ax} ${ay} H ${elbow} L ${bx} ${by}`);
      start.setAttribute('cx', String(ax));
      start.setAttribute('cy', String(ay));
      end.setAttribute('cx', String(bx));
      end.setAttribute('cy', String(by));
      if (!animate || reducedMotion()) return;
      path.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
        duration: 460,
        delay: 200,
        easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
        fill: 'backwards',
      });
      for (const [dot, delay] of [
        [start, 220],
        [end, 680],
      ] as const) {
        dot.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay, easing: 'ease-out', fill: 'backwards' });
      }
    },
    [selected],
  );

  const choose = (next: Discipline) => {
    if (next === selected) return;
    const rects = {} as Record<Discipline, DOMRect>;
    for (const id of order) rects[id] = windows.current[id]!.getBoundingClientRect();
    firstRects.current = rects;
    setSelected(next);
  };

  // The handoff itself: invert each window from its old on-screen rect, then play to its new slot.
  useLayoutEffect(() => {
    const first = firstRects.current;
    firstRects.current = null;
    if (!first) return;
    for (const id of order) {
      const el = windows.current[id]!;
      el.getAnimations().forEach((a) => a.cancel());
      if (reducedMotion()) continue;
      const last = el.getBoundingClientRect();
      const from = first[id];
      const arriving = id === selected;

      const dx = from.left - last.left;
      const dy = from.top - last.top;
      const s = from.width / last.width;
      // Both windows bow away from the straight line on opposite sides, so they pass rather than collide.
      const length = Math.hypot(dx, dy) || 1;
      const bow = (arriving ? -1 : 1) * Math.min(60, length * 0.12);
      const nx = (-dy / length) * bow;
      const ny = (dx / length) * bow;
      // The arriving project travels in front of the one leaving.
      el.style.zIndex = arriving ? '3' : '';
      const flight = el.animate(
        [
          { transform: `translate(${dx}px, ${dy}px) scale(${s})` },
          { transform: `translate(${dx / 2 + nx}px, ${dy / 2 + ny}px) scale(${(s + 1) / 2})`, offset: 0.5 },
          { transform: 'none' },
        ],
        {
          duration: arriving ? HANDOFF_MS : HANDOFF_MS - 60,
          easing: arriving ? 'cubic-bezier(0.22, 1, 0.36, 1)' : 'cubic-bezier(0.55, 0, 0.25, 1)',
        },
      );
      // A cancelled flight (rapid switching) rejects; the next handoff sets its own stacking.
      flight.finished.then(() => (el.style.zIndex = ''), () => undefined);
    }
    captionRef.current?.animate([{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], {
      duration: 420,
      delay: 180,
      easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
      fill: 'backwards',
    });
    drawThread(true);
  }, [selected, drawThread]);

  // The page arrives finished; the only load motion is the thread drawing itself once the web
  // font has settled the headline. After that it just stays attached through resizes.
  useEffect(() => {
    const root = rootRef.current;
    const svg = threadRef.current?.ownerSVGElement;
    if (!root || !svg) return;
    let observer: ResizeObserver | undefined;
    let cancelled = false;
    const attach = () => {
      if (cancelled) return;
      if (svg.hasAttribute('data-ready')) {
        drawThread(false);
      } else {
        svg.setAttribute('data-ready', 'true');
        drawThread(true);
      }
      observer = new ResizeObserver(() => drawThread(false));
      observer.observe(root);
    };
    if (document.fonts) document.fonts.ready.then(attach);
    else attach();
    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, [drawThread]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next: Discipline = event.key === 'Home' ? 'software' : event.key === 'End' ? 'web' : other(selected);
    choose(next);
    options.current[next]?.focus();
  };

  return (
    <div ref={rootRef} className={styles.hero} data-active={selected}>
      <h1 id="intro-title" className={styles.headline}>
        {order.map((id) => (
          <span key={id} className={id === 'software' ? styles.lineSoftware : styles.lineWeb} data-lit={selected === id}>
            <span
              ref={(node) => {
                lines.current[id] = node;
              }}
              className={styles.lineInner}
            >
              {headline[id]}
            </span>
          </span>
        ))}
      </h1>

      <div className={styles.copy}>{children}</div>

      {order.map((id) => {
        const artifact = artifacts[id];
        return (
          <div
            key={id}
            ref={(node) => {
              windows.current[id] = node;
            }}
            className={styles.window}
            data-role={selected === id ? 'primary' : 'support'}
            data-id={id}
            aria-hidden
            onClick={() => choose(id)}
          >
            <span className={styles.frame}>
              <Image
                src={artifact.shot.src}
                width={artifact.shot.width}
                height={artifact.shot.height}
                sizes="(min-width: 1024px) 46vw, 92vw"
                alt=""
                loading="eager"
                fetchPriority={id === 'software' ? 'high' : 'auto'}
                draggable={false}
              />
              {id === 'software' && <span className={styles.demo}>Demonstration data</span>}
            </span>
            <span className={styles.tag}>{artifact.label}</span>
          </div>
        );
      })}

      <div className={styles.controls}>
        <div className={styles.switch} role="radiogroup" aria-label="Show a discipline" onKeyDown={onKeyDown}>
          <span className={styles.thumb} aria-hidden />
          {order.map((id) => (
            <button
              key={id}
              ref={(node) => {
                options.current[id] = node;
              }}
              type="button"
              role="radio"
              aria-checked={selected === id}
              aria-label={`${artifacts[id].label}: ${artifacts[id].title}`}
              tabIndex={selected === id ? 0 : -1}
              onClick={() => choose(id)}
            >
              {artifacts[id].option}
            </button>
          ))}
        </div>
        <p ref={captionRef} className={styles.caption} aria-live="polite">
          <span className={styles.captionText}>
            <span className={styles.captionTitle}>{current.title}</span>
            <span className={styles.captionMedium}>{current.medium}</span>
          </span>
          <a href={current.href} className={styles.captionLink}>
            {current.action}
            <ArrowDown aria-hidden size={16} />
          </a>
        </p>
      </div>

      <svg className={styles.thread} aria-hidden>
        <g ref={threadRef}>
          <path pathLength={1} />
          <circle r={3.5} />
          <circle r={3.5} />
        </g>
      </svg>
    </div>
  );
}
