import type { CounterStore } from './store';

const PER_VISITOR_WINDOW = { limit: 10, seconds: 600 };
const PER_VISITOR_DAY = 30;
/** Below the free tier's daily request limit, so the site says "busy" before Google refuses. */
const SITE_DAY = 400;

export type LimitResult = { ok: true } | { ok: false; state: 'busy' | 'limited'; retryAfterSeconds: number };

const day = (now: number) => new Date(now).toISOString().slice(0, 10);
const secondsToMidnight = (now: number) => Math.max(1, Math.ceil((86_400_000 - (now % 86_400_000)) / 1000));

/**
 * Fixed windows: per visitor 10 per 10 minutes and 30 per UTC day, then 400 per day for the whole
 * site. A visitor over their own limit does not use up the site's allowance. Counting happens before
 * the model is called, so a failed answer still counts.
 */
export async function checkLimits(store: CounterStore, ip: string, now: number): Promise<LimitResult> {
  const windowStart = Math.floor(now / 1000 / PER_VISITOR_WINDOW.seconds);
  const inWindow = await store.incr(`ask:ip:${ip}:10m:${windowStart}`, PER_VISITOR_WINDOW.seconds);
  if (inWindow > PER_VISITOR_WINDOW.limit) {
    const retry = PER_VISITOR_WINDOW.seconds - (Math.floor(now / 1000) % PER_VISITOR_WINDOW.seconds);
    return { ok: false, state: 'limited', retryAfterSeconds: Math.max(1, retry) };
  }
  const today = day(now);
  if ((await store.incr(`ask:ip:${ip}:day:${today}`, 86_400)) > PER_VISITOR_DAY) {
    return { ok: false, state: 'limited', retryAfterSeconds: secondsToMidnight(now) };
  }
  if ((await store.incr(`ask:site:day:${today}`, 86_400)) > SITE_DAY) {
    return { ok: false, state: 'busy', retryAfterSeconds: secondsToMidnight(now) };
  }
  return { ok: true };
}

/** Off when ASSISTANT_ENABLED=false (after a redeploy) or instantly when Redis holds assistant:enabled = "0". */
export async function assistantEnabled(store: CounterStore): Promise<boolean> {
  if (process.env.ASSISTANT_ENABLED === 'false') return false;
  return (await store.get('assistant:enabled')) !== '0';
}
