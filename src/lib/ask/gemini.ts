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
  | { ok: false; state: 'busy' | 'error' };

const tools = [
  {
    functionDeclarations: [
      {
        name: 'show_section',
        description: 'Scroll the homepage to one of its sections.',
        parameters: { type: 'object', properties: { id: { type: 'string', enum: [...sectionIds] } }, required: ['id'] },
      },
      {
        name: 'focus_demo',
        description: 'Show the live demo in the homepage hero: software (Rowszein’s Delight) or web (Thread & Form).',
        parameters: { type: 'object', properties: { id: { type: 'string', enum: ['software', 'web'] } }, required: ['id'] },
      },
      {
        name: 'open_project',
        description: 'Open a project: its case study if it has one, otherwise its card on the homepage.',
        parameters: { type: 'object', properties: { slug: { type: 'string', enum: projectSlugs } }, required: ['slug'] },
      },
      {
        name: 'draft_inquiry',
        description: 'Prepare an email to James summarising what the visitor needs.',
        parameters: { type: 'object', properties: { summary: { type: 'string' } }, required: ['summary'] },
      },
    ],
  },
];

/** Only actions naming a known section, demo or project survive; anything else the model invents is dropped. */
function toAction(call: { name?: string; args?: Record<string, unknown> }): AskAction | null {
  const args = call.args ?? {};
  switch (call.name) {
    case 'show_section':
      return sectionIds.includes(args.id as SectionId) ? { type: 'show_section', id: args.id as SectionId } : null;
    case 'focus_demo':
      return args.id === 'software' || args.id === 'web' ? { type: 'focus_demo', id: args.id } : null;
    case 'open_project':
      return typeof args.slug === 'string' && projectSlugs.includes(args.slug) ? { type: 'open_project', slug: args.slug } : null;
    case 'draft_inquiry':
      return typeof args.summary === 'string' && args.summary.trim()
        ? { type: 'draft_inquiry', summary: args.summary.trim().slice(0, 500) }
        : null;
    default:
      return null;
  }
}

/** One generateContent call. The key travels in a header, never in the URL. */
export async function askGemini(system: string, history: Turn[], question: string): Promise<ProviderResult> {
  const base = (process.env.GEMINI_BASE_URL ?? 'https://generativelanguage.googleapis.com').replace(/\/$/, '');
  const model = process.env.GEMINI_MODEL ?? 'gemini-3.5-flash-lite';
  let response: Response;
  try {
    response = await fetch(`${base}/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY ?? '' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [...history, { role: 'user', text: question }].map((turn) => ({ role: turn.role, parts: [{ text: turn.text }] })),
        tools,
        generationConfig: { maxOutputTokens: 300, temperature: 0.2, thinkingConfig: { thinkingBudget: 0 } },
      }),
      signal: AbortSignal.timeout(8000),
      cache: 'no-store',
    });
  } catch {
    return { ok: false, state: 'error' };
  }
  if (response.status === 429) return { ok: false, state: 'busy' };
  if (!response.ok) return { ok: false, state: 'error' };

  let data: { candidates?: { content?: { parts?: { text?: string; functionCall?: { name?: string; args?: Record<string, unknown> } }[] } }[]; usageMetadata?: { totalTokenCount?: number } };
  try {
    data = await response.json();
  } catch {
    return { ok: false, state: 'error' };
  }
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  const answer = parts.map((part) => part.text ?? '').join('').trim();
  const actions = parts.flatMap((part) => (part.functionCall ? [toAction(part.functionCall)] : [])).filter((a): a is AskAction => a !== null).slice(0, 2);
  if (!answer && actions.length === 0) return { ok: false, state: 'error' };
  return { ok: true, answer: answer || 'Here is where to look.', actions, tokens: data.usageMetadata?.totalTokenCount ?? 0 };
}
