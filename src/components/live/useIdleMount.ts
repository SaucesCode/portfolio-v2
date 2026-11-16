'use client';

import { useEffect, useState } from 'react';

/** True once the page has hydrated and the browser is idle, so live demos never compete with first paint. */
export function useIdleMount(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(() => setReady(true), { timeout: 1500 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(() => setReady(true), 300);
    return () => clearTimeout(id);
  }, []);
  return ready;
}
