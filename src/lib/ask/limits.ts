import type { CounterStore } from './store';

const PER_VISITOR_WINDOW = { limit: 10, seconds: 600 };
const PER_VISITOR_DAY = 30;
/** Below the free tier's daily request limit, so the site says "busy" before Google refuses. */
const SITE_DAY = 400;
const SWITCH_KEY = 'assistant:enabled';

export type LimitResult =
  | { ok: true }
  | { ok: false; state: 'off' }
  | { ok: false; state: 'busy' | 'limited'; retryAfterSeconds: number };

const day = (now: number) => new Date(now).toISOString().slice(0, 10);
const secondsToMidnight = (now: number) => Math.max(1, Math.ceil((86_400_000 - (now % 86_400_000)) / 1000));

/**
 * One round trip: the kill switch, then fixed windows of 10 per 10 minutes and 30 per UTC day per
 * visitor, then 400 per day for the whole site. A visitor over their own limit does not use up the
 * site's allowance. Counting happens before the model is called, so a failed answer still counts.
 * ASSISTANT_ENABLED=false switches it off without touching the store.
 */
export async function checkLimits(store: CounterStore, ip: string, now: number): Promise<LimitResult> {
  if (process.env.ASSISTANT_ENABLED === 'false') return { ok: false, state: 'off' };
  const windowStart = Math.floor(now / 1000 / PER_VISITOR_WINDOW.seconds);
  const today = day(now);
  const outcome = await store.admit(SWITCH_KEY, [
    { key: `ask:ip:${ip}:10m:${windowStart}`, ttlSeconds: PER_VISITOR_WINDOW.seconds, limit: PER_VISITOR_WINDOW.limit },
    { key: `ask:ip:${ip}:day:${today}`, ttlSeconds: 86_400, limit: PER_VISITOR_DAY },
    { key: `ask:site:day:${today}`, ttlSeconds: 86_400, limit: SITE_DAY },
  ]);
  if (outcome === 'ok') return { ok: true };
  if (outcome === 'off') return { ok: false, state: 'off' };
  if (outcome === 0) {
    const retry = PER_VISITOR_WINDOW.seconds - (Math.floor(now / 1000) % PER_VISITOR_WINDOW.seconds);
    return { ok: false, state: 'limited', retryAfterSeconds: Math.max(1, retry) };
  }
  return { ok: false, state: outcome === 1 ? 'limited' : 'busy', retryAfterSeconds: secondsToMidnight(now) };
}
