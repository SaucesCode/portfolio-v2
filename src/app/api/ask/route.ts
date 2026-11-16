import { askGemini, type Turn } from '@/lib/ask/gemini';
import { assistantEnabled, checkLimits } from '@/lib/ask/limits';
import { logAsk, type AskLog } from '@/lib/ask/log';
import { systemPrompt } from '@/lib/ask/prompt';
import { storeFromEnv } from '@/lib/ask/store';
import { getBaseUrl } from '@/lib/seo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_QUESTION = 300;
const MAX_TURNS = 4;
const MAX_TURN_TEXT = 1200;

/** The site itself, its Vercel deployment and branch URLs, and any origins configured for local runs. */
function allowedOrigins(): Set<string> {
  const origins = new Set([getBaseUrl()]);
  for (const host of [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL]) if (host) origins.add(`https://${host}`);
  for (const origin of (process.env.ASSISTANT_ALLOWED_ORIGINS ?? '').split(',')) if (origin.trim()) origins.add(origin.trim());
  return origins;
}

/** On Vercel the platform sets X-Forwarded-For; the first address is the visitor's. */
const visitorIp = (request: Request) =>
  request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';

type Parsed = { ok: true; question: string; history: Turn[] } | { ok: false; field: string; message: string };

function parse(body: unknown): Parsed {
  if (!body || typeof body !== 'object') return { ok: false, field: 'question', message: 'Send a question.' };
  const { question, history } = body as { question?: unknown; history?: unknown };
  if (typeof question !== 'string' || !question.trim()) return { ok: false, field: 'question', message: 'Type a question first.' };
  if (question.trim().length > MAX_QUESTION) {
    return { ok: false, field: 'question', message: `Keep it to ${MAX_QUESTION} characters.` };
  }
  const turns = Array.isArray(history) ? history : [];
  const valid = turns.filter(
    (turn): turn is Turn =>
      !!turn && (turn.role === 'user' || turn.role === 'model') && typeof turn.text === 'string' && turn.text.length <= MAX_TURN_TEXT,
  );
  if (valid.length !== turns.length) return { ok: false, field: 'history', message: 'The conversation could not be read.' };
  return { ok: true, question: question.trim(), history: valid.slice(-MAX_TURNS) };
}

export async function POST(request: Request) {
  const started = Date.now();
  const requestId = crypto.randomUUID();
  const reply = (status: number, body: unknown, outcome: AskLog['outcome'], tokens = 0, headers: HeadersInit = {}) => {
    logAsk({ requestId, outcome, ms: Date.now() - started, tokens });
    return Response.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } });
  };

  if (!allowedOrigins().has(request.headers.get('origin') ?? '')) return reply(403, { state: 'forbidden' }, 'forbidden');

  try {
    const store = storeFromEnv();
    if (!store || !process.env.GEMINI_API_KEY || !(await assistantEnabled(store))) return reply(503, { state: 'off' }, 'off');

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      body = null;
    }
    const parsed = parse(body);
    if (!parsed.ok) return reply(400, { state: 'invalid', field: parsed.field, message: parsed.message }, 'invalid');

    const limit = await checkLimits(store, visitorIp(request), Date.now());
    if (!limit.ok) {
      const status = limit.state === 'limited' ? 429 : 503;
      return reply(status, { state: limit.state, retryAfterSeconds: limit.retryAfterSeconds }, limit.state, 0, {
        'Retry-After': String(limit.retryAfterSeconds),
      });
    }

    const result = await askGemini(systemPrompt(getBaseUrl()), parsed.history, parsed.question);
    if (!result.ok) return reply(503, { state: result.state }, result.state);
    return reply(200, { answer: result.answer, actions: result.actions }, 'answered', result.tokens);
  } catch {
    // The counter store or anything else unexpected: the visitor sees a friendly retry state.
    return reply(503, { state: 'error' }, 'error');
  }
}
