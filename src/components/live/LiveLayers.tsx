'use client';

import { useEffect } from 'react';
import type { StylePreset, TypePair } from '@/data/thread-and-form';
import type { DemoState } from '@/lib/rowszein-demo';
import { LiveDashboard } from './LiveDashboard';
import { LiveTheme } from './LiveTheme';
import type { RecentSale } from './useRowszeinDemo';

// Loaded with next/dynamic, so these mount only when their code has arrived; onReady then fires from
// inside, after the demo has really rendered, and the hero swaps it in over the screenshot.

export function SoftwareLayer({ state, recent, onReady }: { state: DemoState; recent: RecentSale[]; onReady: () => void }) {
  useEffect(onReady, [onReady]);
  return <LiveDashboard state={state} recent={recent} />;
}

export function WebLayer({ preset, type, onReady }: { preset: StylePreset; type: TypePair; onReady: () => void }) {
  return <LiveTheme preset={preset} type={type} onImageLoad={onReady} />;
}
