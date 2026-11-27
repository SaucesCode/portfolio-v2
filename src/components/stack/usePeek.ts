import { useEffect, useRef, useState, type RefObject } from 'react';

const PEEK_DELAY_MS = 1000;
const PEEK_MS = 900;
const SESSION_KEY = 'stack-peeked';

// Storage is unavailable in some private or locked-down browsers, where reading it throws.
// There the peek is treated as not yet shown, so it runs once per page load instead.
function alreadyPeeked() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

function rememberPeek() {
  try {
    sessionStorage.setItem(SESSION_KEY, '1');
  } catch {
    // Writing is refused too; the peek then simply isn't remembered.
  }
}

/**
 * True for PEEK_MS, once per browser session, so visitors see that the stack opens. It starts
 * PEEK_DELAY_MS after the live demo is ready and the stack is on screen in a visible tab, so it is
 * never used up unseen. A visitor's first action cancels it for good.
 */
export function usePeek({
  ready,
  interacted,
  target,
}: {
  ready: boolean;
  interacted: boolean;
  target: RefObject<Element | null>;
}): boolean {
  const [peeking, setPeeking] = useState(false);
  const acted = useRef(false);
  const shown = useRef(false);

  useEffect(() => {
    if (interacted) acted.current = true;
    const el = target.current;
    if (!ready || !el || acted.current || shown.current || alreadyPeeked()) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let onScreen = false;
    let start: ReturnType<typeof setTimeout> | undefined;
    const arm = () => {
      clearTimeout(start);
      if (!onScreen || document.visibilityState !== 'visible') return;
      start = setTimeout(() => {
        shown.current = true;
        stop();
        rememberPeek();
        setPeeking(true);
      }, PEEK_DELAY_MS);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        arm();
      },
      { threshold: 0.5 },
    );
    const stop = () => {
      clearTimeout(start);
      observer.disconnect();
      document.removeEventListener('visibilitychange', arm);
    };
    observer.observe(el);
    document.addEventListener('visibilitychange', arm);
    return stop;
  }, [ready, interacted, target]);

  useEffect(() => {
    if (!peeking) return;
    const end = setTimeout(() => setPeeking(false), PEEK_MS);
    return () => clearTimeout(end);
  }, [peeking]);

  return peeking && !interacted;
}
