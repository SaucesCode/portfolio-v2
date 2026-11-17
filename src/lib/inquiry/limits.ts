import type { LimitResult } from '@/lib/ask/limits';
import type { CounterStore } from '@/lib/ask/store';

const PER_VISITOR_HOUR = 3;
const PER_VISITOR_DAY = 6;
/** Well under Resend's free 100 emails a day. */
const SITE_DAY = 40;
const SWITCH_KEY = 'inquiry:enabled';

const secondsToMidnight = (now: number) => Math.max(1, Math.ceil((86_400_000 - (now % 86_400_000)) / 1000));

/** One round trip: the kill switch, 3 an hour and 6 a day per visitor, then 40 a day for the site. */
export async function checkInquiryLimits(store: CounterStore, ip: string, now: number): Promise<LimitResult> {
  const hour = Math.floor(now / 3_600_000);
  const today = new Date(now).toISOString().slice(0, 10);
  const outcome = await store.admit(SWITCH_KEY, [
    { key: `inquiry:ip:${ip}:hour:${hour}`, ttlSeconds: 3600, limit: PER_VISITOR_HOUR },
    { key: `inquiry:ip:${ip}:day:${today}`, ttlSeconds: 86_400, limit: PER_VISITOR_DAY },
    { key: `inquiry:site:day:${today}`, ttlSeconds: 86_400, limit: SITE_DAY },
  ]);
  if (outcome === 'ok') return { ok: true };
  if (outcome === 'off') return { ok: false, state: 'off' };
  if (outcome === 0) return { ok: false, state: 'limited', retryAfterSeconds: Math.max(1, 3600 - Math.floor((now % 3_600_000) / 1000)) };
  return { ok: false, state: outcome === 1 ? 'limited' : 'busy', retryAfterSeconds: secondsToMidnight(now) };
}
