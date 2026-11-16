'use client';

import { useEffect, useState } from 'react';
import type { StylePreset, TypePair } from '@/data/thread-and-form';
import type { DemoState } from '@/lib/rowszein-demo';
import { LiveDashboard } from './LiveDashboard';
import { LiveTheme } from './LiveTheme';
import type { RecentSale } from './useRowszeinDemo';

// Loaded with next/dynamic, so these mount only when their code has arrived. onReady fires from
// inside, once the demo has rendered and its fonts have loaded, and the hero swaps it in.

/** Calls back once the fonts the page has started loading are ready, or after 1.5 s at most. */
function useFontsReady(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const done = () => !cancelled && setReady(true);
    const timer = setTimeout(done, 1500);
    // One frame first, so the demo has been laid out and its font loads have started.
    const frame = requestAnimationFrame(() => {
      document.fonts.ready.then(done, done);
    });
    return () => {
      cancelled = true;
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, []);
  return ready;
}

export function SoftwareLayer({ state, recent, onReady }: { state: DemoState; recent: RecentSale[]; onReady: () => void }) {
  const fonts = useFontsReady();
  useEffect(() => {
    if (fonts) onReady();
  }, [fonts, onReady]);
  return <LiveDashboard state={state} recent={recent} />;
}

export function WebLayer({ preset, type, onReady }: { preset: StylePreset; type: TypePair; onReady: () => void }) {
  const fonts = useFontsReady();
  // A photo that fails still leaves a restyleable page, so an error counts as settled too.
  const [photo, setPhoto] = useState(false);
  useEffect(() => {
    if (fonts && photo) onReady();
  }, [fonts, photo, onReady]);
  return <LiveTheme preset={preset} type={type} onImageSettled={() => setPhoto(true)} />;
}
