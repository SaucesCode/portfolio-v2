'use client';

import Image, { getImageProps } from 'next/image';
import { Pause, Play } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import type { FullLengthCapture, Shot } from '@/data/projects';
import styles from './FullLengthViewer.module.css';

type Device = 'desktop' | 'phone';
type Mode = 'auto' | Device;

const DEVICES: Device[] = ['desktop', 'phone'];
const PHONE_QUERY = '(max-width: 767px)';
const DESKTOP_QUERY = '(min-width: 768px)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const BLANK_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

interface Props {
  title: string;
  captures: Record<Device, FullLengthCapture>;
  /** `sizes` attribute for the images in each device frame. */
  sizes: Record<Device, string>;
  /** Fetch the poster at high priority; use for the piece above the fold. */
  priority?: boolean;
}

interface PosterProps {
  shot: Shot;
  sizes: string;
  /** Media query under which this frame is hidden in auto mode; it then resolves to a blank pixel. */
  hiddenMedia: string;
  priority: boolean;
  onReady: () => void;
}

/**
 * The top-of-page crop, painted first and kept as the LCP element. It is art-directed so the
 * frame hidden by the current screen size requests nothing, and the full-length capture only
 * mounts once this has loaded.
 */
function Poster({ shot, sizes, hiddenMedia, priority, onReady }: PosterProps) {
  const { props } = getImageProps({
    src: shot.src,
    width: shot.width,
    height: shot.height,
    sizes,
    alt: '',
    loading: 'eager',
    fetchPriority: priority ? 'high' : 'auto',
  });

  // An image can finish loading before hydration attaches onLoad, so also check on mount.
  const ref = useCallback(
    (img: HTMLImageElement | null) => {
      if (img?.complete && img.naturalWidth > 0) onReady();
    },
    [onReady],
  );

  return (
    <picture>
      <source media={hiddenMedia} srcSet={BLANK_PIXEL} />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- alt="" comes from getImageProps: decorative duplicate */}
      <img {...props} ref={ref} className={styles.poster} draggable={false} onLoad={onReady} />
    </picture>
  );
}

type Drag =
  | { kind: 'rail'; top: number; travel: number; offset: number }
  | { kind: 'page'; startY: number; startP: number; travel: number };

const clamp = (value: number) => Math.min(1, Math.max(0, value));

/** Share of the full page that one viewport shows, e.g. 900 / 7774. */
const visibleShare = (capture: FullLengthCapture) => capture.poster.height / capture.full.height;

const describePosition = (p: number) => {
  if (p < 0.01) return 'Top of the page';
  if (p > 0.99) return 'Bottom of the page';
  return `${Math.round(p * 100)}% down the page`;
};

export function FullLengthViewer({ title, captures, sizes, priority = false }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const positionRef = useRef(0);
  const dragRef = useRef<Drag | null>(null);
  const frameRef = useRef<number | null>(null);

  const [mode, setMode] = useState<Mode>('auto');
  const [autoDevice, setAutoDevice] = useState<Device>('desktop');
  const [postered, setPostered] = useState<Record<Device, boolean>>({ desktop: false, phone: false });
  const [loaded, setLoaded] = useState<Record<Device, boolean>>({ desktop: false, phone: false });
  const [markPostered] = useState(() => ({
    desktop: () => setPostered((state) => (state.desktop ? state : { ...state, desktop: true })),
    phone: () => setPostered((state) => (state.phone ? state : { ...state, phone: true })),
  }));
  const [playing, setPlaying] = useState(false);

  const hintId = useId();
  const device: Device = mode === 'auto' ? autoDevice : mode;
  const share = visibleShare(captures[device]);
  const ready = loaded[device];

  useEffect(() => {
    const query = window.matchMedia(PHONE_QUERY);
    const sync = () => setAutoDevice(query.matches ? 'phone' : 'desktop');
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  const setPosition = useCallback((next: number, animate: boolean) => {
    const root = rootRef.current;
    const rail = railRef.current;
    if (!root || !rail) return;
    const p = clamp(next);
    positionRef.current = p;
    root.dataset.animate = String(animate);
    root.style.setProperty('--p', p.toFixed(4));
    const label = describePosition(p);
    rail.setAttribute('aria-valuenow', String(Math.round(p * 100)));
    rail.setAttribute('aria-valuetext', label);
    if (readoutRef.current) readoutRef.current.textContent = label;
  }, []);

  const stopPlaying = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    setPlaying(false);
  }, []);

  useEffect(() => stopPlaying, [stopPlaying]);

  useEffect(() => {
    if (readoutRef.current) {
      readoutRef.current.textContent = ready ? describePosition(positionRef.current) : 'Loading the full page…';
    }
  }, [ready]);

  const startPlaying = () => {
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return;
    // Roughly one second per screen of content, kept between 5 and 14 seconds overall.
    const duration = Math.min(14000, Math.max(5000, (1 / share) * 1000));
    if (positionRef.current > 0.99) setPosition(0, false);
    let last = performance.now();
    const step = (now: number) => {
      const next = positionRef.current + (now - last) / duration;
      last = now;
      setPosition(next, false);
      if (next >= 1) {
        stopPlaying();
        return;
      }
      frameRef.current = requestAnimationFrame(step);
    };
    setPlaying(true);
    frameRef.current = requestAnimationFrame(step);
  };

  const activeElement = (selector: string) =>
    rootRef.current?.querySelector<HTMLElement>(`${selector}[data-device="${device}"]`) ?? null;

  const onRailPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!ready || event.button !== 0) return;
    stopPlaying();
    const track = activeElement('[data-track]');
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const windowHeight = rect.height * share;
    const travel = rect.height - windowHeight;
    const windowTop = rect.top + positionRef.current * travel;
    const grabbedWindow = event.clientY >= windowTop && event.clientY <= windowTop + windowHeight;
    const offset = grabbedWindow ? event.clientY - windowTop : windowHeight / 2;
    dragRef.current = { kind: 'rail', top: rect.top, travel, offset };
    // Stops the browser from starting a text selection; focus is moved to the slider explicitly.
    event.preventDefault();
    event.currentTarget.focus({ preventScroll: true });
    event.currentTarget.setPointerCapture(event.pointerId);
    if (!grabbedWindow) setPosition((event.clientY - rect.top - offset) / travel, true);
  };

  const onPagePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    // Touch and pen keep native page scrolling; the rail is the touch control.
    if (!ready || event.pointerType !== 'mouse' || event.button !== 0) return;
    stopPlaying();
    const page = activeElement('[data-page]');
    if (!page) return;
    const travel = page.getBoundingClientRect().height * (1 - share);
    dragRef.current = { kind: 'page', startY: event.clientY, startP: positionRef.current, travel };
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    rootRef.current?.setAttribute('data-dragging', 'true');
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    if (drag.kind === 'rail') {
      setPosition((event.clientY - drag.top - drag.offset) / drag.travel, false);
    } else {
      setPosition(drag.startP - (event.clientY - drag.startY) / drag.travel, false);
    }
  };

  const endDrag = () => {
    dragRef.current = null;
    rootRef.current?.removeAttribute('data-dragging');
  };

  const onRailKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!ready) return;
    // One "screen" expressed in slider units: the page scrolls through (1 - share) of its height.
    const screen = share / (1 - share);
    const moves: Record<string, number> = {
      ArrowDown: positionRef.current + screen * 0.5,
      ArrowRight: positionRef.current + screen * 0.5,
      ArrowUp: positionRef.current - screen * 0.5,
      ArrowLeft: positionRef.current - screen * 0.5,
      PageDown: positionRef.current + screen * 0.9,
      PageUp: positionRef.current - screen * 0.9,
      Home: 0,
      End: 1,
    };
    if (!(event.key in moves)) return;
    event.preventDefault();
    stopPlaying();
    setPosition(moves[event.key], true);
  };

  const chooseDevice = (next: Device) => {
    stopPlaying();
    setMode(next);
  };

  return (
    <div
      ref={rootRef}
      className={styles.viewer}
      data-mode={mode}
      role="group"
      aria-label={`Full-page preview of ${title}`}
    >
      <div className={styles.body}>
        <div className={styles.stage}>
          {DEVICES.map((option) => {
            const capture = captures[option];
            return (
              <div
                key={option}
                className={styles.frame}
                data-device={option}
                data-loaded={loaded[option]}
                style={{ '--r': visibleShare(capture) } as CSSProperties}
                onPointerDown={onPagePointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
              >
                {postered[option] && (
                  <Image
                    data-page
                    data-device={option}
                    className={styles.page}
                    src={capture.full.src}
                    width={capture.full.width}
                    height={capture.full.height}
                    sizes={sizes[option]}
                    alt={`Full-length screenshot of the ${title} ${option} homepage`}
                    loading="lazy"
                    fetchPriority="low"
                    draggable={false}
                    onLoad={() => setLoaded((state) => ({ ...state, [option]: true }))}
                  />
                )}
                <Poster
                  shot={capture.poster}
                  sizes={sizes[option]}
                  hiddenMedia={option === 'desktop' ? PHONE_QUERY : DESKTOP_QUERY}
                  priority={priority}
                  onReady={markPostered[option]}
                />
              </div>
            );
          })}
        </div>

        <div
          ref={railRef}
          className={styles.rail}
          role="slider"
          tabIndex={0}
          aria-label={`Scroll position in the ${title} page`}
          aria-orientation="vertical"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={0}
          aria-valuetext={describePosition(0)}
          aria-describedby={hintId}
          aria-disabled={!ready}
          onPointerDown={onRailPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={onRailKeyDown}
        >
          {DEVICES.map((option) => {
            const capture = captures[option];
            return (
              <div
                key={option}
                className={styles.track}
                data-track
                data-device={option}
                style={
                  {
                    '--r': visibleShare(capture),
                    '--ar': capture.full.width / capture.full.height,
                  } as CSSProperties
                }
              >
                <Image
                  className={styles.thumb}
                  src={capture.full.src}
                  width={capture.full.width}
                  height={capture.full.height}
                  sizes={option === 'desktop' ? '120px' : '40px'}
                  alt=""
                  loading="lazy"
                  draggable={false}
                />
                <span className={styles.window} aria-hidden />
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.segmented} role="group" aria-label="Preview size">
          {DEVICES.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={device === option}
              onClick={() => chooseDevice(option)}
            >
              {option === 'desktop' ? 'Desktop' : 'Phone'}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={styles.play}
          onClick={playing ? stopPlaying : startPlaying}
          disabled={!ready}
        >
          {playing ? <Pause aria-hidden size={16} /> : <Play aria-hidden size={16} />}
          {playing ? 'Pause' : 'Auto-scroll'}
        </button>
        {/* Text is written imperatively so dragging never re-renders the images. */}
        <span ref={readoutRef} className={styles.readout} aria-hidden />
      </div>

      <p id={hintId} className={styles.hint}>
        <span className={styles.hintFine}>Drag the page or the bar beside it to see the whole site. </span>
        <span className={styles.hintCoarse}>Drag the bar beside the page to see the whole site. </span>
        <span className={styles.hintKeys}>With a keyboard, focus the bar and use the arrow keys.</span>
      </p>
    </div>
  );
}
