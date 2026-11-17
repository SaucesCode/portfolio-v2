/**
 * Durable counters for the assistant's limits. Serverless instances share no memory, so production
 * counts in Upstash Redis (over its REST API, no client library); `next dev` and tests can count in
 * process memory.
 */

/** One limit to check: the counter key, how long it lives, and the most it may reach. */
export interface Step {
  key: string;
  ttlSeconds: number;
  limit: number;
}

/**
 * The outcome of one admit call: 'off' when the kill switch is set, 'ok' when every step passed, or
 * the index of the first step over its limit. Steps after a refused one are not counted, so a visitor
 * over their own limit never uses up the site's allowance.
 */
export type Admission = 'off' | 'ok' | number;

export interface CounterStore {
  /** Checks the kill switch and counts each step in order, stopping at the first one over its limit. */
  admit(switchKey: string, steps: Step[]): Promise<Admission>;
  set(key: string, value: string): Promise<void>;
}

export function memoryStore(): CounterStore {
  const values = new Map<string, { value: string; expires: number }>();
  const live = (key: string) => {
    const entry = values.get(key);
    if (entry && entry.expires <= Date.now()) values.delete(key);
    return values.get(key);
  };
  return {
    async admit(switchKey, steps) {
      if (live(switchKey)?.value === '0') return 'off';
      for (const [index, step] of steps.entries()) {
        const entry = live(step.key);
        const count = Number(entry?.value ?? 0) + 1;
        values.set(step.key, { value: String(count), expires: entry?.expires ?? Date.now() + step.ttlSeconds * 1000 });
        if (count > step.limit) return index;
      }
      return 'ok';
    },
    async set(key, value) {
      values.set(key, { value, expires: Number.POSITIVE_INFINITY });
    },
  };
}

/** The same rules as memoryStore().admit, run inside Redis in one round trip. Returns -2 off, -1 ok, or a step index. */
const ADMIT_SCRIPT = `
if redis.call('GET', KEYS[1]) == '0' then return -2 end
for i = 2, #KEYS do
  local count = redis.call('INCR', KEYS[i])
  if count == 1 then redis.call('EXPIRE', KEYS[i], ARGV[(i - 2) * 2 + 1]) end
  if count > tonumber(ARGV[(i - 2) * 2 + 2]) then return i - 2 end
end
return -1
`;

/** Upstash reports a failed command as { error } with HTTP 200; anything but a whole number must not count as allowed. */
export function readCount(body: unknown): number {
  const result = (body as { result?: unknown } | null)?.result;
  if (typeof result !== 'number' || !Number.isInteger(result)) {
    const error = (body as { error?: unknown } | null)?.error;
    throw new Error(`Upstash returned no count${typeof error === 'string' ? `: ${error}` : ''}`);
  }
  return result;
}

export function upstashStore(url: string, token: string): CounterStore {
  const command = async (args: string[]) => {
    const response = await fetch(url.replace(/\/$/, ''), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
      signal: AbortSignal.timeout(2000),
      cache: 'no-store',
    });
    if (!response.ok) throw new Error(`Upstash responded ${response.status}`);
    return response.json();
  };
  return {
    async admit(switchKey, steps) {
      const keys = [switchKey, ...steps.map((step) => step.key)];
      const args = steps.flatMap((step) => [String(step.ttlSeconds), String(step.limit)]);
      const outcome = readCount(await command(['EVAL', ADMIT_SCRIPT, String(keys.length), ...keys, ...args]));
      return outcome === -2 ? 'off' : outcome === -1 ? 'ok' : outcome;
    },
    async set(key, value) {
      await command(['SET', key, value]);
    },
  };
}

let memory: CounterStore | undefined;
let upstash: CounterStore | undefined;

/**
 * The store the route uses. Upstash when configured (either the Upstash or the Vercel KV variable
 * names), the in-process store when asked for or under `next dev`, and otherwise none, which turns
 * the assistant off rather than running without limits.
 */
export function storeFromEnv(): CounterStore | null {
  if (process.env.ASSISTANT_STORE === 'memory') return (memory ??= memoryStore());
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (url && token) return (upstash ??= upstashStore(url, token));
  // `next dev` on this machine has no Upstash connection, and nothing to protect, so it counts in memory.
  return process.env.NODE_ENV === 'development' ? (memory ??= memoryStore()) : null;
}
