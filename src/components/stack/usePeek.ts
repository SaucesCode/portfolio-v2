import { useEffect, useRef, useState } from 'react';

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
 * True for PEEK_MS, PEEK_DELAY_MS after the live demo is ready, once per browser session, so
 * visitors see that the stack opens. A visitor's first action cancels it for good.
 */
export function usePeek({ ready, interacted }: { ready: boolean; interacted: boolean }): boolean {
  const [peeking, setPeeking] = useState(false);
  const acted = useRef(false);

  useEffect(() => {
    if (interacted) acted.current = true;
    if (!ready || acted.current || alreadyPeeked() || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const start = setTimeout(() => {
      rememberPeek();
      setPeeking(true);
    }, PEEK_DELAY_MS);
    return () => clearTimeout(start);
  }, [ready, interacted]);

  useEffect(() => {
    if (!peeking) return;
    const end = setTimeout(() => setPeeking(false), PEEK_MS);
    return () => clearTimeout(end);
  }, [peeking]);

  return peeking && !interacted;
}
