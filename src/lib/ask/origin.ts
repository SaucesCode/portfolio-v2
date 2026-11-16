import { getBaseUrl } from '@/lib/seo';

const LOCAL = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

/**
 * Who may call /api/ask: the site itself, its Vercel deployment and branch URLs, origins configured in
 * ASSISTANT_ALLOWED_ORIGINS, and, in development only, any localhost port.
 */
export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (process.env.NODE_ENV === 'development' && LOCAL.test(origin)) return true;
  const allowed = new Set([getBaseUrl()]);
  for (const host of [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL]) if (host) allowed.add(`https://${host}`);
  for (const extra of (process.env.ASSISTANT_ALLOWED_ORIGINS ?? '').split(',')) if (extra.trim()) allowed.add(extra.trim());
  return allowed.has(origin);
}
