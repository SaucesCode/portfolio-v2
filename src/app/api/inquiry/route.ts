import { storeFromEnv } from '@/lib/ask/store';
import { isAllowedOrigin } from '@/lib/ask/origin';
import { composeInquiryEmail } from '@/lib/inquiry/email';
import { checkInquiryLimits } from '@/lib/inquiry/limits';
import { logInquiry, type InquiryLog } from '@/lib/inquiry/log';
import { parseInquiry } from '@/lib/inquiry/rules';
import { sendInquiry } from '@/lib/inquiry/send';
import { visitorIp } from '@/lib/request';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** A person takes longer than this to fill in the form; a script usually does not. */
const MIN_FILL_MS = 3000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  const started = Date.now();
  const requestId = crypto.randomUUID();
  const reply = (status: number, body: unknown, outcome: InquiryLog['outcome'], headers: HeadersInit = {}, detail?: string) => {
    logInquiry({ requestId, outcome, ms: Date.now() - started, detail });
    return Response.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } });
  };

  if (!isAllowedOrigin(request.headers.get('origin'))) return reply(403, { state: 'forbidden' }, 'forbidden');

  try {
    const store = storeFromEnv();
    if (!store || !process.env.RESEND_API_KEY) return reply(503, { state: 'off' }, 'off');

    let body: Record<string, unknown> = {};
    try {
      const json = await request.json();
      if (json && typeof json === 'object') body = json;
    } catch {
      // An unreadable body fails validation below like an empty one.
    }
    const parsed = parseInquiry(body);
    if (!parsed.ok) return reply(400, { state: 'invalid', field: parsed.field, message: parsed.message }, 'invalid');

    // Bots fill the hidden field or submit instantly; they get a normal answer and nothing is sent.
    const startedAt = typeof body.startedAt === 'number' ? body.startedAt : 0;
    if ((typeof body.company === 'string' && body.company.trim()) || started - startedAt < MIN_FILL_MS) {
      return reply(200, { ok: true }, 'dropped');
    }

    const limit = await checkInquiryLimits(store, visitorIp(request), started);
    if (!limit.ok && limit.state === 'off') return reply(503, { state: 'off' }, 'off');
    if (!limit.ok) {
      return reply(limit.state === 'limited' ? 429 : 503, { state: limit.state, retryAfterSeconds: limit.retryAfterSeconds }, limit.state, {
        'Retry-After': String(limit.retryAfterSeconds),
      });
    }

    const key = typeof body.idempotencyKey === 'string' && UUID.test(body.idempotencyKey) ? body.idempotencyKey : requestId;
    const sent = await sendInquiry({ ...composeInquiryEmail(parsed.inquiry), replyTo: parsed.inquiry.email }, key);
    if (!sent.ok) return reply(502, { state: 'error' }, 'error', {}, sent.detail);
    return reply(200, { ok: true }, 'sent');
  } catch (error) {
    return reply(502, { state: 'error' }, 'error', {}, error instanceof Error ? error.name : 'unknown');
  }
}
