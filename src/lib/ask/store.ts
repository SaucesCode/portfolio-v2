/**
 * Durable counters for the assistant's limits. Serverless instances share no memory, so production
 * counts in Upstash Redis (over its REST API, no client library); local runs and tests can choose an
 * in-process store explicitly with ASSISTANT_STORE=memory.
 */
export interface CounterStore {
  /** Adds one and returns the new count; the key expires ttlSeconds after it was first created. */
  incr(key: string, ttlSeconds: number): Promise<number>;
  get(key: string): Promise<string | null>;
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
    async incr(key, ttlSeconds) {
      const entry = live(key);
      const count = Number(entry?.value ?? 0) + 1;
      values.set(key, { value: String(count), expires: entry?.expires ?? Date.now() + ttlSeconds * 1000 });
      return count;
    },
    async get(key) {
      return live(key)?.value ?? null;
    },
    async set(key, value) {
      values.set(key, { value, expires: Number.POSITIVE_INFINITY });
    },
  };
}

export function upstashStore(url: string, token: string): CounterStore {
  const call = async (path: string, body?: unknown) => {
    const response = await fetch(`${url.replace(/\/$/, '')}${path}`, {
      method: body ? 'POST' : 'GET',
      headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(2000),
      cache: 'no-store',
    });
    if (!response.ok) throw new Error(`Upstash responded ${response.status}`);
    return response.json();
  };
  return {
    async incr(key, ttlSeconds) {
      // One round trip: count, and start the expiry only when the key is new.
      const [count] = (await call('/pipeline', [
        ['INCR', key],
        ['EXPIRE', key, String(ttlSeconds), 'NX'],
      ])) as { result: number }[];
      return Number(count.result);
    },
    async get(key) {
      const { result } = (await call(`/get/${encodeURIComponent(key)}`)) as { result: string | null };
      return result;
    },
    async set(key, value) {
      await call('/pipeline', [['SET', key, value]]);
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
