'use client';

import { useEffect } from 'react';

/**
 * Back and forward should land where the visitor left, at once. The page scrolls smoothly for
 * in-page links (globals.css), and without this the browser would also animate its scroll
 * restoration from the top of the page. Next.js's data-scroll-behavior covers its own link
 * navigations but not history traversal, so smooth scrolling is paused briefly around each one.
 */
export function InstantHistoryScroll() {
  useEffect(() => {
    const root = document.documentElement;
    let timer: number | undefined;
    const onTraverse = () => {
      root.style.scrollBehavior = 'auto';
      window.clearTimeout(timer);
      timer = window.setTimeout(() => root.style.removeProperty('scroll-behavior'), 600);
    };
    window.addEventListener('popstate', onTraverse);
    return () => {
      window.removeEventListener('popstate', onTraverse);
      window.clearTimeout(timer);
    };
  }, []);

  return null;
}
