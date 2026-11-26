import { projectSlugs, sectionIds, type SectionId } from '@/lib/site-knowledge';

export type AskAction =
  | { type: 'show_section'; id: SectionId }
  | { type: 'focus_demo'; id: 'software' | 'web' }
  | { type: 'open_project'; slug: string }
  | { type: 'draft_inquiry'; summary: string };

export interface Turn {
  role: 'user' | 'model';
  text: string;
}

export type ProviderResult =
  | { ok: true; answer: string; actions: AskAction[]; tokens: number }
  /** detail is for the log only (an HTTP status or failure kind), never shown to the visitor. */
  | { ok: false; state: 'busy' | 'error'; detail: string };

/**
 * The reply's shape. Gemini's structured output guarantees an answer string every time, which tool
 * calls did not (it often replied with tool calls alone). Actions name a target the client checks.
 */
const responseSchema = {
  type: 'OBJECT',
  properties: {
    answer: { type: 'STRING' },
    actions: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          type: { type: 'STRING', enum: ['show_section', 'focus_demo', 'open_project', 'draft_inquiry'] },
          target: { type: 'STRING' },
          summary: { type: 'STRING' },
        },
        required: ['type'],
      },
    },
  },
  required: ['answer', 'actions'],
};

interface RawAction {
  type?: unknown;
  target?: unknown;
  summary?: unknown;
}

/** Only actions naming a known section, demo or project survive; anything else the model invents is dropped. */
function toAction(raw: RawAction): AskAction | null {
  const target = typeof raw.target === 'string' ? raw.target : '';
  switch (raw.type) {
    case 'show_section':
      return sectionIds.includes(target as SectionId) ? { type: 'show_section', id: target as SectionId } : null;
    case 'focus_demo':
      return target === 'software' || target === 'web' ? { type: 'focus_demo', id: target } : null;
    case 'open_project':
      return projectSlugs.includes(target) ? { type: 'open_project', slug: target } : null;
    case 'draft_inquiry':
      return typeof raw.summary === 'string' && raw.summary.trim()
        ? { type: 'draft_inquiry', summary: raw.summary.trim().slice(0, 500) }
        : null;
    default:
      return null;
  }
}

/** Both attempts share one deadline, so a question never waits longer than this. */
const DEADLINE_MS = 9000;
/**
 * Answers usually arrive in 1.5–3 s. A main model still silent after this has most likely stalled
 * (on the live site about one question in three did), so the fallback starts alongside it.
 */
const HEDGE_MS = 3500;
/** A fallback only starts if at least this much time is left. */
const MIN_ATTEMPT_MS = 2500;

type Attempt = ProviderResult | { ok: false; state: 'retry'; detail: string };
type Answer = Extract<ProviderResult, { ok: true }>;

const failureKind = (error: unknown) => {
  const name = error instanceof Error ? error.name : '';
  return name === 'TimeoutError' ? 'timeout' : name === 'AbortError' ? 'cancelled' : 'network';
};

/** One generateContent call. The key travels in a header, never in the URL. */
async function attempt(model: string, body: string, signal: AbortSignal): Promise<Attempt> {
  const base = (process.env.GEMINI_BASE_URL ?? 'https://generativelanguage.googleapis.com').replace(/\/$/, '');
  let response: Response;
  try {
    response = await fetch(`${base}/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY ?? '' },
      body,
      signal,
      cache: 'no-store',
    });
  } catch (error) {
    return { ok: false, state: 'error', detail: `${model} ${failureKind(error)}` };
  }
  // 500 and 503 mean the model is briefly overloaded: worth one try on another model. A 429 is this
  // key's per-minute limit, so it reads as "try again in a moment" and is never retried.
  if (response.status === 500 || response.status === 503) return { ok: false, state: 'retry', detail: `${model} ${response.status}` };
  if (!response.ok) return { ok: false, state: 'error', detail: `${model} ${response.status}` };

  let reply: { answer?: unknown; actions?: unknown };
  let tokens = 0;
  try {
    const data = (await response.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[]; usageMetadata?: { totalTokenCount?: number } };
    tokens = data.usageMetadata?.totalTokenCount ?? 0;
    reply = JSON.parse((data.candidates?.[0]?.content?.parts ?? []).map((part) => part.text ?? '').join(''));
  } catch {
    return { ok: false, state: 'error', detail: `${model} bad body` };
  }
  const answer = typeof reply.answer === 'string' ? reply.answer.trim() : '';
  if (!answer) return { ok: false, state: 'retry', detail: `${model} empty answer` };
  // One action of each kind at most, and two in all.
  const seen = new Set<string>();
  const actions = (Array.isArray(reply.actions) ? reply.actions : [])
    .map((raw) => toAction(raw as RawAction))
    .filter((action): action is AskAction => action !== null && !seen.has(action.type) && !!seen.add(action.type))
    .slice(0, 2);
  return { ok: true, answer, actions, tokens };
}

/** Resolves with the first answer, or with every failure once all the attempts have failed. */
function firstAnswer(attempts: Promise<Attempt>[]): Promise<Answer | string[]> {
  return new Promise((resolve) => {
    const failures: string[] = [];
    const settle = (result: Attempt) => {
      if (result.ok) resolve(result);
      else if (failures.push(result.detail) === attempts.length) resolve(failures);
    };
    for (const pending of attempts) pending.then(settle, (error: unknown) => settle({ ok: false, state: 'error', detail: failureKind(error) }));
  });
}

/**
 * Asks the main model (gemini-3.1-flash-lite: about 1.6 s in testing). The fallback starts at once
 * if the main model is briefly overloaded or returns no answer, and alongside it if the main model
 * has not answered within HEDGE_MS; the first answer wins and the other request is cancelled.
 * Everything shares one deadline.
 */
export async function askGemini(system: string, history: Turn[], question: string): Promise<ProviderResult> {
  const [main, fallback] = [process.env.GEMINI_MODEL ?? 'gemini-3.1-flash-lite', process.env.GEMINI_FALLBACK_MODEL ?? 'gemini-3.5-flash-lite'];
  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: system }] },
    contents: [...history, { role: 'user', text: question }].map((turn) => ({ role: turn.role, parts: [{ text: turn.text }] })),
    generationConfig: { maxOutputTokens: 400, temperature: 0.2, responseMimeType: 'application/json', responseSchema },
  });
  const started = Date.now();
  const deadline = AbortSignal.timeout(DEADLINE_MS);
  const cancels: AbortController[] = [];
  const run = (model: string) => {
    const cancel = new AbortController();
    cancels.push(cancel);
    return attempt(model, body, AbortSignal.any([deadline, cancel.signal]));
  };
  const finish = (result: ProviderResult) => {
    for (const cancel of cancels) cancel.abort();
    return result;
  };

  const first = run(main);
  let hedge: ReturnType<typeof setTimeout> | undefined;
  const early = await Promise.race([first, new Promise<null>((resolve) => (hedge = setTimeout(resolve, HEDGE_MS, null)))]);
  clearTimeout(hedge);

  const details: string[] = [];
  if (early) {
    if (early.ok || early.state !== 'retry') return finish(early);
    details.push(early.detail);
    if (DEADLINE_MS - (Date.now() - started) < MIN_ATTEMPT_MS) return finish({ ok: false, state: 'error', detail: details.join(', ') });
  }

  const outcome = await firstAnswer(early ? [run(fallback)] : [first, run(fallback)]);
  if (!Array.isArray(outcome)) return finish(outcome);
  return finish({ ok: false, state: 'error', detail: [...details, ...outcome].join(', ') });
}
