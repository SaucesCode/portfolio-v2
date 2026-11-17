import { site } from '@/data/site';

/**
 * Sends one inquiry through Resend's REST API. The Idempotency-Key makes a retried submission
 * deliver once; the body is plain text only.
 */
export async function sendInquiry(
  email: { subject: string; text: string; replyTo: string },
  idempotencyKey: string,
): Promise<{ ok: true } | { ok: false; detail: string }> {
  const base = (process.env.RESEND_BASE_URL ?? 'https://api.resend.com').replace(/\/$/, '');
  let response: Response;
  try {
    response = await fetch(`${base}/emails`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY ?? ''}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || 'Portfolio <onboarding@resend.dev>',
        to: [process.env.INQUIRY_TO || site.email],
        reply_to: email.replyTo,
        subject: email.subject,
        text: email.text,
      }),
      signal: AbortSignal.timeout(8000),
      cache: 'no-store',
    });
  } catch (error) {
    return { ok: false, detail: error instanceof Error && error.name === 'TimeoutError' ? 'timeout' : 'network' };
  }
  return response.ok ? { ok: true } : { ok: false, detail: `resend ${response.status}` };
}
