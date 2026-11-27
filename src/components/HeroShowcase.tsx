'use client';

import Image from 'next/image';
import { ArrowDown } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { categoryLabels, featuredSoftware, featuredWebsite, type Shot } from '@/data/projects';
import { stylePresets, typePairs } from '@/data/thread-and-form';
import { CLOSED_SENTENCE, describeFlow, flowFor, OPENED_SENTENCE } from '@/lib/stack-flow';
import { LiveBoundary } from './live/LiveBoundary';
import { PhoneDemo } from './live/PhoneDemo';
import { SaleControls } from './live/SaleControls';
import { StyleControls } from './live/StyleControls';
import { useIdleMount } from './live/useIdleMount';
import { useRowszeinDemo } from './live/useRowszeinDemo';
import { LayerStack } from './stack/LayerStack';
import { DataLayer, DesignLayer, LogicLayer } from './stack/RowszeinLayers';
import { StackToggle } from './stack/StackToggle';
import { usePeek } from './stack/usePeek';
import { HERO_FOCUS_EVENT, takeHeroFocus } from './ask/actions';
import styles from './HeroShowcase.module.css';

// The live demos are their own chunks, fetched only after first paint.
const SoftwareLayer = dynamic(() => import('./live/LiveLayers').then((m) => m.SoftwareLayer), { ssr: false });
const WebLayer = dynamic(() => import('./live/LiveLayers').then((m) => m.WebLayer), { ssr: false });

/**
 * Taps on the switch before hydration would be lost, so this runs while the page is still parsing:
 * it remembers the last choice until the hero mounts and applies it.
 */
const EARLY_PICK = `(function(){var r=document.documentElement;r.dataset.js='';document.addEventListener('click',function(e){if('heroHydrated' in r.dataset)return;var t=e.target,b=t&&t.closest&&t.closest('[data-hero-pick]');if(b)r.dataset.heroPick=b.getAttribute('data-hero-pick');},true);})();`;

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
    option: 'Websites',
    label: 'Websites',
    title: featuredWebsite.title,
    medium: featuredWebsite.medium,
    shot: featuredWebsite.poster,
    href: `#${featuredWebsite.slug}`,
    action: 'Preview the full site',
  },
};

const order: Discipline[] = ['software', 'web'];
const headline: Record<Discipline, string> = { software: 'Systems your business runs on.', web: 'Websites it’s found by.' };
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
  const idle = useIdleMount();
  const demo = useRowszeinDemo();
  const [preset, setPreset] = useState(stylePresets[0]);
  const [type, setType] = useState(typePairs[0]);
  const [liveReady, setLiveReady] = useState<Record<Discipline, boolean>>({ software: false, web: false });
  // A sale's sentence is made when it is recorded, but its flow only exists once the demo has
  // re-rendered, so the announcement keeps whether to add what happened underneath.
  const [announcement, setAnnouncement] = useState({ text: '', underneath: false });
  const [stackOpen, setStackOpen] = useState(false);
  const [stackOpened, setStackOpened] = useState(false);
  const peek = usePeek({
    ready: liveReady.software,
    interacted: stackOpened || demo.event !== null || selected === 'web',
  });
  const flow = useMemo(() => flowFor(demo.event), [demo.event]);
  const announce = useCallback((text: string) => setAnnouncement({ text, underneath: false }), []);
  const announceSale = (text: string) => setAnnouncement({ text, underneath: stackOpen });
  const status = announcement.underneath && flow ? `${announcement.text} ${describeFlow(flow)}` : announcement.text;
  // Only a sale recorded with the stack open travels from its dashboard row; a refusal adds no row.
  const pulseKey = announcement.underneath && flow && !flow.shortOf ? flow.key : null;
  const toggleStack = () => {
    setStackOpen(!stackOpen);
    setStackOpened(true);
    announce(stackOpen ? CLOSED_SENTENCE : OPENED_SENTENCE);
  };
  const markSoftwareReady = useCallback(() => setLiveReady((ready) => ({ ...ready, software: true })), []);
  const markWebReady = useCallback(() => setLiveReady((ready) => ({ ...ready, web: true })), []);

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
      // Only time-based animations can be seeked to their end; scroll-driven ones have no end time.
      const moving = frame.getAnimations().filter((animation) => animation.timeline === document.timeline);
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
      const frameLeft = rect.left - box.left;
      const frameTop = rect.top - box.top;
      let bx: number;
      let by: number;
      if (ax + 48 <= frameLeft) {
        // The text ends before the window: run out, then angle into its left edge.
        bx = frameLeft;
        by = frameTop + 22;
        const elbow = Math.max(ax + 24, Math.min(bx - 24, ax + 48));
        path.setAttribute('d', `M ${ax} ${ay} H ${elbow} L ${bx} ${by}`);
      } else {
        // The headline reaches over the window's column, so an angled line would cut back through the
        // words. Run past the end of every headline line, then drop straight into the window's top edge.
        const textRight = Math.max(
          ...Object.values(lines.current).map((node) => {
            if (!node) return 0;
            const lineRange = document.createRange();
            lineRange.selectNodeContents(node);
            return Math.max(...Array.from(lineRange.getClientRects(), (r) => r.right));
          }),
        );
        bx = Math.min(Math.max(ax + 24, textRight - box.left + 24), rect.right - box.left - 24);
        by = frameTop;
        path.setAttribute('d', `M ${ax} ${ay} H ${bx} V ${by}`);
      }
      start.setAttribute('cx', String(ax));
      start.setAttribute('cy', String(ay));
      end.setAttribute('cx', String(bx));
      end.setAttribute('cy', String(by));
      if (!animate || reducedMotion()) return;
      path.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
        duration: 420,
        delay: 160,
        easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
        fill: 'backwards',
      });
      for (const [dot, delay] of [
        [start, 120],
        [end, 560],
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
    rootRef.current?.setAttribute('data-touched', '');
    setStackOpen(false);
    setSelected(next);
  };

  // The assistant can ask for a demo while the visitor is already on the homepage.
  const chooseRef = useRef(choose);
  useEffect(() => {
    chooseRef.current = choose;
  });
  useEffect(() => {
    const onFocus = (event: Event) => {
      const id = (event as CustomEvent<string>).detail;
      if (id === 'software' || id === 'web') chooseRef.current(id);
    };
    window.addEventListener(HERO_FOCUS_EVENT, onFocus);
    return () => window.removeEventListener(HERO_FOCUS_EVENT, onFocus);
  }, []);

  // A tap on the switch before hydration (kept by EARLY_PICK) wins as soon as the hero can act on it.
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.heroHydrated = '';
    // Read on the next frame, once the windows have laid out, so the handoff measures them. Reading
    // inside the frame also survives React's development double-run, which cancels the first frame.
    const frame = requestAnimationFrame(() => {
      // An early tap, or a demo the assistant asked for before navigating home.
      const pick = root.dataset.heroPick ?? takeHeroFocus() ?? undefined;
      delete root.dataset.heroPick;
      if (pick === 'software' || pick === 'web') choose(pick);
    });
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, on mount, with the first render's choose
  }, []);

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

  // The unfold is CSS, so it starts with the first paint and runs off the main thread.
  // Once the windows have landed (or a choice has interrupted them) the dimension line is drawn,
  // and from then on it simply stays attached through resizes.
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
    const landed = () =>
      Promise.allSettled(
        order.flatMap(
          (id) =>
            windows.current[id]
              ?.getAnimations()
              .filter((animation) => animation.timeline === document.timeline)
              .map((animation) => animation.finished) ?? [],
        ),
      );
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(landed).then(attach);
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
    <div
      ref={rootRef}
      className={styles.hero}
      data-active={selected}
      data-stack={selected === 'software' ? (stackOpen ? 'open' : 'closed') : undefined}
      data-entrance
    >
      <script dangerouslySetInnerHTML={{ __html: EARLY_PICK }} />
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

      {/* While the stack is open the copy is dimmed and partly under the sheets, so it leaves the tab order. */}
      <div className={styles.copy} inert={selected === 'software' && stackOpen}>
        {children}
      </div>

      {order.map((id) => {
        const artifact = artifacts[id];
        const frame = (
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
            {idle && (
              <span
                className={styles.live}
                data-live={liveReady[id] ? 'ready' : 'loading'}
                data-live-id={id}
                inert={selected !== id}
              >
                <LiveBoundary>
                  {id === 'software' ? (
                    <SoftwareLayer
                      state={demo.state}
                      recent={demo.recent}
                      pulseKey={pulseKey}
                      onReady={markSoftwareReady}
                    />
                  ) : (
                    <WebLayer preset={preset} type={type} onReady={markWebReady} />
                  )}
                </LiveBoundary>
              </span>
            )}
            {liveReady[id] ? (
              <span className={styles.demo}>Live demo · sample data, running in your browser</span>
            ) : (
              id === 'software' && <span className={styles.demo}>Demonstration data</span>
            )}
          </span>
        );
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
            {id === 'software' ? (
              <LayerStack
                open={stackOpen}
                peek={peek}
                layers={[
                  { id: 'design', label: 'Design', offset: 1, content: <DesignLayer />, hiddenWhenClosed: true },
                  { id: 'interface', label: 'Interface', offset: 0, content: frame },
                  { id: 'logic', label: 'Logic', offset: -1, content: <LogicLayer flow={flow} /> },
                  {
                    id: 'data',
                    label: 'Data · demonstration data',
                    offset: -2,
                    content: <DataLayer state={demo.state} recent={demo.recent} flow={flow} />,
                  },
                ]}
              />
            ) : (
              frame
            )}
            <span className={styles.tag}>{artifact.label}</span>
            {/* Registration marks: the corners a printer lines up before the work is trimmed. */}
            <span className={styles.marks} aria-hidden>
              <i />
              <i />
              <i />
              <i />
            </span>
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
              data-hero-pick={id}
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

      <div className={styles.tryRow}>
        {liveReady[selected] &&
          (selected === 'software' ? (
            <>
              <span className={styles.stackToggle}>
                <StackToggle
                  open={stackOpen}
                  hint={!stackOpen && !stackOpened && demo.recent.length > 0}
                  onToggle={toggleStack}
                />
              </span>
              <SaleControls demo={demo} announce={announceSale} />
              <PhoneDemo demo={demo} announce={announce} />
            </>
          ) : (
            <StyleControls preset={preset} type={type} onPreset={setPreset} onType={setType} announce={announce} />
          ))}
      </div>
      <p role="status" className="sr-only">
        {status}
      </p>

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
