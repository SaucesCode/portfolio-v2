import { expect, test } from '@playwright/test';
import { composeInquiryEmail } from '../src/lib/inquiry/email';
import { checkField, parseInquiry } from '../src/lib/inquiry/rules';

const long = 'We need stock tracking for two shops.';

test.describe('Inquiry rules', () => {
  test('accepts a complete inquiry and trims it', () => {
    const result = parseInquiry({ need: 'system', message: `  ${long}  `, name: ' Ana ', email: '  Ana@Example.com ' });
    expect(result).toEqual({ ok: true, inquiry: { need: 'system', message: long, name: 'Ana', email: 'Ana@Example.com' } });
  });

  test('keeps an optional timeline when one is chosen', () => {
    const result = parseInquiry({ need: 'website', message: long, name: 'Ana', email: 'a@b.co', timeline: 'quarter' });
    expect(result).toMatchObject({ ok: true, inquiry: { timeline: 'quarter' } });
  });

  test('names the first invalid field with its message', () => {
    const base = { need: 'system', message: long, name: 'Ana', email: 'a@b.co' };
    expect(parseInquiry({ ...base, need: 'x' })).toEqual({ ok: false, field: 'need', message: 'Choose what you need.' });
    expect(parseInquiry({ ...base, message: '   ' })).toEqual({ ok: false, field: 'message', message: 'Tell me a little about the project.' });
    expect(parseInquiry({ ...base, message: 'too short' })).toEqual({
      ok: false,
      field: 'message',
      message: 'A bit more detail, please: at least 20 characters.',
    });
    expect(parseInquiry({ ...base, message: 'a'.repeat(2001) })).toEqual({ ok: false, field: 'message', message: 'Keep it under 2,000 characters.' });
    expect(parseInquiry({ ...base, timeline: 'never' })).toEqual({ ok: false, field: 'timeline', message: 'Choose one of the options.' });
    expect(parseInquiry({ ...base, name: '' })).toEqual({ ok: false, field: 'name', message: 'Add your name.' });
    expect(parseInquiry({ ...base, name: 'a'.repeat(101) })).toEqual({ ok: false, field: 'name', message: 'Keep your name under 100 characters.' });
    expect(parseInquiry({ ...base, email: '' })).toEqual({ ok: false, field: 'email', message: 'Add an email address James can reply to.' });
    expect(parseInquiry({ ...base, email: 'not-an-email' })).toEqual({ ok: false, field: 'email', message: "That email address doesn't look right." });
    expect(parseInquiry(null)).toMatchObject({ ok: false, field: 'need' });
  });

  test('checks one field at a time for the form', () => {
    expect(checkField('email', 'a@b')).toBe("That email address doesn't look right.");
    expect(checkField('email', ' a@b.co ')).toBeNull();
    expect(checkField('timeline', '')).toBeNull();
  });

  test('the email is plain text and keeps what the visitor typed literally', () => {
    const { subject, text } = composeInquiryEmail({
      need: 'wordpress',
      timeline: 'month',
      name: 'Ana',
      email: 'ana@example.com',
      message: '<b>Hi</b>\nLine two',
    });
    expect(subject).toBe('Project inquiry: A WordPress site from Ana');
    expect(text).toContain('<b>Hi</b>\nLine two');
    expect(text).toContain('When: Within a month');
    expect(text).toContain('Reply to this email to answer Ana (ana@example.com).');
    expect(composeInquiryEmail({ need: 'unsure', name: 'Bo', email: 'b@c.co', message: long }).text).toContain('When: Not given');
  });
});

test.describe('Inquiry endpoint', () => {
  // The endpoint behaves the same at any viewport; one project keeps the shared counters predictable.
  test.skip(({ isMobile }) => isMobile, 'Endpoint tests run once, on desktop.');

  const mock = 'http://127.0.0.1:3092';
  let visitor = 0;
  const valid = { need: 'system', message: long, name: 'Ana', email: 'ana@example.com', company: '' };
  const send = (request: import('@playwright/test').APIRequestContext, overrides: Record<string, unknown> = {}, ip = `198.51.100.${++visitor}`, origin = 'http://localhost:3001') =>
    request.post('/api/inquiry', {
      data: { ...valid, startedAt: Date.now() - 10_000, idempotencyKey: crypto.randomUUID(), ...overrides },
      headers: { Origin: origin, 'X-Forwarded-For': ip },
    });
  const count = async (request: import('@playwright/test').APIRequestContext) => (await (await request.get(`${mock}/count`)).json()).count as number;

  test('sends a valid inquiry with the visitor as Reply-To, in plain text', async ({ request }) => {
    const response = await send(request, { email: ' Ana@Example.com ' });
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    const last = await (await request.get(`${mock}/last`)).json();
    expect(last.reply_to).toBe('Ana@Example.com');
    expect(last.html).toBeUndefined();
    expect(last.subject).toBe('Project inquiry: A business system or web app from Ana');
    expect(last.to).toEqual(['jamesspatrickdm@gmail.com']);
  });

  test('the same submission sent twice delivers once', async ({ request }) => {
    const before = await count(request);
    const idempotencyKey = crypto.randomUUID();
    expect((await send(request, { idempotencyKey })).status()).toBe(200);
    expect((await send(request, { idempotencyKey })).status()).toBe(200);
    expect(await count(request)).toBe(before + 1);
  });

  test('bots get a normal answer and nothing is sent', async ({ request }) => {
    const before = await count(request);
    const trapped = await send(request, { company: 'Acme SEO' });
    expect(trapped.status()).toBe(200);
    expect(await trapped.json()).toEqual({ ok: true });
    expect((await send(request, { startedAt: Date.now() })).status()).toBe(200);
    expect(await count(request)).toBe(before);
  });

  test('invalid fields come back named', async ({ request }) => {
    const response = await send(request, { email: 'x' });
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ state: 'invalid', field: 'email', message: "That email address doesn't look right." });
  });

  test('other sites are refused', async ({ request }) => {
    expect((await send(request, {}, undefined, 'https://evil.example')).status()).toBe(403);
  });

  test('a fourth inquiry in an hour from one visitor is limited', async ({ request }) => {
    const ip = '198.51.100.250';
    for (let i = 0; i < 3; i++) expect((await send(request, {}, ip)).status()).toBe(200);
    const fourth = await send(request, {}, ip);
    expect(fourth.status()).toBe(429);
    expect((await fourth.json()).state).toBe('limited');
    expect(Number(fourth.headers()['retry-after'])).toBeGreaterThan(0);
  });

  test('a provider failure is reported, not hidden', async ({ request }) => {
    const response = await send(request, { message: `${long} RESENDFAIL` });
    expect(response.status()).toBe(502);
    expect(await response.json()).toEqual({ state: 'error' });
  });

  test('logs carry no visitor details', async () => {
    const { formatInquiryLog } = await import('../src/lib/inquiry/log');
    const line = JSON.parse(formatInquiryLog({ requestId: 'r1', outcome: 'sent', ms: 640 }));
    expect(line).toEqual({ event: 'inquiry', requestId: 'r1', outcome: 'sent', ms: 640 });
  });

  test('limits: three an hour per visitor, and the switch turns them off', async () => {
    const { checkInquiryLimits } = await import('../src/lib/inquiry/limits');
    const { memoryStore } = await import('../src/lib/ask/store');
    const store = memoryStore();
    const now = Date.UTC(2026, 10, 17, 9);
    for (let i = 0; i < 3; i++) expect(await checkInquiryLimits(store, '203.0.113.9', now)).toEqual({ ok: true });
    expect(await checkInquiryLimits(store, '203.0.113.9', now)).toMatchObject({ ok: false, state: 'limited' });
    await store.set('inquiry:enabled', '0');
    expect(await checkInquiryLimits(store, '203.0.113.10', now)).toEqual({ ok: false, state: 'off' });
  });
});
