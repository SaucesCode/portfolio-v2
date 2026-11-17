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

test.describe('Project form', () => {
  const message = 'We run two bakeries and need one place for orders and stock.';
  const openForm = async (page: import('@playwright/test').Page) => {
    await page.getByRole('main').getByRole('link', { name: 'Start a project' }).first().click();
    const form = page.getByRole('dialog', { name: 'Start a project' });
    await expect(form).toBeVisible();
    return form;
  };
  const fill = async (form: import('@playwright/test').Locator, name = 'Ana Panel') => {
    await form.getByRole('radio', { name: 'A business system or web app' }).check();
    await form.getByRole('textbox', { name: 'Tell me about it' }).fill(message);
    await form.getByRole('textbox', { name: 'Your name' }).fill(name);
    await form.getByRole('textbox', { name: 'Your email' }).fill('ana@example.com');
  };

  test('every Start a project button opens the form instead of a mail app', async ({ page, isMobile }) => {
    await page.goto('/');
    await openForm(page);
    await page.keyboard.press('Escape');
    // Narrow phones show a round envelope labelled Contact in place of the header capsule.
    await page.getByRole('banner').getByRole('link', { name: isMobile ? 'Contact' : 'Start a project', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'Start a project' })).toBeVisible();
  });

  test('shows each problem next to its field and focuses the first', async ({ page }) => {
    await page.goto('/');
    const form = await openForm(page);
    await form.getByRole('textbox', { name: 'Your email' }).fill('not-an-email');
    await form.getByRole('button', { name: 'Send to James' }).click();
    await expect(form.getByText('Choose what you need.')).toBeVisible();
    await expect(form.getByRole('textbox', { name: 'Your email' })).toHaveAccessibleDescription("That email address doesn't look right.");
    await expect(form.getByRole('textbox', { name: 'Your email' })).toHaveAttribute('aria-invalid', 'true');
    await expect(form.getByRole('radio', { name: 'A business system or web app' })).toBeFocused();
  });

  test('sends, confirms with the reply address, and clears the draft', async ({ page, request }, info) => {
    await page.setExtraHTTPHeaders({ 'X-Forwarded-For': `198.51.100.${info.project.name.length + 200}` });
    await page.goto('/');
    const form = await openForm(page);
    const name = `Ana ${info.project.name}`;
    await fill(form, name);
    // A person takes a few seconds; the endpoint quietly drops instant submissions as bots.
    await page.waitForTimeout(3100);
    await form.getByRole('button', { name: 'Send to James' }).click();
    await expect(form.getByText('Sent. James will reply to ana@example.com.')).toBeVisible();
    expect((await (await request.get('http://127.0.0.1:3092/last')).json()).subject).toContain(name);
    await page.keyboard.press('Escape');
    const again = await openForm(page);
    await expect(again.getByRole('textbox', { name: 'Tell me about it' })).toHaveValue('');
  });

  test('a failed send keeps the text and offers email and copy', async ({ page }) => {
    await page.route('**/api/inquiry', (route) => route.fulfill({ status: 502, json: { state: 'error' } }));
    await page.goto('/');
    const form = await openForm(page);
    await fill(form);
    await form.getByRole('button', { name: 'Send to James' }).click();
    await expect(form.getByText('That didn’t send. Your message is still here.')).toBeVisible();
    await expect(form.getByRole('textbox', { name: 'Tell me about it' })).toHaveValue(message);
    const fallback = form.getByRole('link', { name: 'Email it instead' });
    await expect(fallback).toHaveAttribute('href', new RegExp(`^mailto:.*${encodeURIComponent('two bakeries')}`));
    await expect(form.getByRole('button', { name: 'Copy address' })).toBeVisible();
  });

  test('too many sends says so and still offers email', async ({ page }) => {
    await page.route('**/api/inquiry', (route) => route.fulfill({ status: 429, json: { state: 'limited', retryAfterSeconds: 600 } }));
    await page.goto('/');
    const form = await openForm(page);
    await fill(form);
    await form.getByRole('button', { name: 'Send to James' }).click();
    await expect(form.getByText('You’ve sent a few already. Try again later, or email James directly.')).toBeVisible();
    await expect(form.getByRole('link', { name: 'Email it instead' })).toBeVisible();
  });

  test('a draft survives closing and leaving the page, and wins over a case study opening line', async ({ page }) => {
    await page.goto('/');
    const form = await openForm(page);
    await form.getByRole('textbox', { name: 'Tell me about it' }).fill(message);
    await page.keyboard.press('Escape');
    await page.goto('/work/rowszeins-delight');
    await page.getByRole('link', { name: 'Email me about a system' }).click();
    await expect(page.getByRole('dialog', { name: 'Start a project' }).getByRole('textbox', { name: 'Tell me about it' })).toHaveValue(message);
  });

  test('a case study opens the form with its opening line', async ({ page }) => {
    await page.goto('/work/rowszeins-delight');
    await page.getByRole('link', { name: 'Email me about a system' }).click();
    const box = page.getByRole('dialog', { name: 'Start a project' }).getByRole('textbox', { name: 'Tell me about it' });
    await expect(box).toHaveValue(/^A system for my business/);
  });

  test('the assistant’s email action opens the filled form', async ({ page }) => {
    await page.route('**/api/ask', (route) =>
      route.fulfill({ json: { answer: 'Yes, James builds those.', actions: [{ type: 'draft_inquiry', summary: 'A stock system for a bakery' }] } }),
    );
    await page.goto('/');
    await page.getByRole('banner').getByRole('button', { name: 'Ask about my work' }).click();
    const ask = page.getByRole('dialog', { name: 'Ask about my work' });
    await ask.getByRole('textbox', { name: 'Your question' }).fill('Can you build stock tracking?');
    await ask.getByRole('button', { name: 'Ask', exact: true }).click();
    await ask.getByRole('button', { name: 'Email James about this' }).click();
    const box = page.getByRole('dialog', { name: 'Start a project' }).getByRole('textbox', { name: 'Tell me about it' });
    await expect(box).toHaveValue('A stock system for a bakery');
  });

  test('Esc closes the form and focus returns to the button that opened it', async ({ page }) => {
    await page.goto('/');
    const opener = page.getByRole('main').getByRole('link', { name: 'Start a project' }).first();
    await opener.click();
    await expect(page.getByRole('dialog', { name: 'Start a project' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Start a project' })).toBeHidden();
    await expect(opener).toBeFocused();
  });
});
