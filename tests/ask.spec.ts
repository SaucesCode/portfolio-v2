import { expect, test } from '@playwright/test';
import { caseStudies, projects } from '../src/data/projects';
import { site } from '../src/data/site';
import { terms } from '../src/data/terms';
import { projectSlugs, sectionIds, siteKnowledge } from '../src/lib/site-knowledge';

test.describe('Site knowledge', () => {
  test('carries every case study, term and the contact, and no prices', () => {
    const text = siteKnowledge('https://www.saucescode.xyz');
    for (const project of caseStudies) expect(text).toContain(`https://www.saucescode.xyz${project.caseStudy}`);
    for (const term of terms) expect(text).toContain(term.body);
    expect(text).toContain(site.email);
    expect(text).not.toMatch(/₱|US\$|USD/);
  });

  test('names the homepage sections and every project', () => {
    expect([...sectionIds]).toEqual(['featured', 'work', 'services', 'process', 'about', 'contact']);
    expect(projectSlugs).toEqual(projects.map((p) => p.slug));
  });
});

test.describe('Assistant limits', () => {
  const now = Date.UTC(2026, 10, 16, 9, 3, 20);

  test('ten questions per ten minutes per visitor, then a retry time', async () => {
    const { checkLimits } = await import('../src/lib/ask/limits');
    const { memoryStore } = await import('../src/lib/ask/store');
    const store = memoryStore();
    for (let i = 0; i < 10; i++) expect(await checkLimits(store, '203.0.113.7', now)).toEqual({ ok: true });
    const refused = await checkLimits(store, '203.0.113.7', now);
    expect(refused.ok).toBe(false);
    if (!refused.ok) {
      expect(refused.state).toBe('limited');
      expect(refused.retryAfterSeconds).toBeGreaterThanOrEqual(1);
      expect(refused.retryAfterSeconds).toBeLessThanOrEqual(600);
    }
    expect(await checkLimits(store, '198.51.100.2', now)).toEqual({ ok: true });
  });

  test('thirty questions a day per visitor', async () => {
    const { checkLimits } = await import('../src/lib/ask/limits');
    const { memoryStore } = await import('../src/lib/ask/store');
    const store = memoryStore();
    for (let i = 0; i < 30; i++) expect((await checkLimits(store, '203.0.113.9', now + i * 11 * 60_000)).ok).toBe(true);
    const refused = await checkLimits(store, '203.0.113.9', now + 30 * 11 * 60_000);
    expect(refused).toMatchObject({ ok: false, state: 'limited' });
  });

  test('the site answers at most 400 questions a day in total', async () => {
    const { checkLimits } = await import('../src/lib/ask/limits');
    const { memoryStore } = await import('../src/lib/ask/store');
    const store = memoryStore();
    for (let i = 0; i < 400; i++) expect((await checkLimits(store, `10.0.${Math.floor(i / 9)}.${i % 9}`, now)).ok).toBe(true);
    expect(await checkLimits(store, '10.9.9.9', now)).toMatchObject({ ok: false, state: 'busy' });
  });

  test('the off switch turns the assistant off', async () => {
    const { assistantEnabled } = await import('../src/lib/ask/limits');
    const { memoryStore } = await import('../src/lib/ask/store');
    const store = memoryStore();
    expect(await assistantEnabled(store)).toBe(true);
    await store.set('assistant:enabled', '0');
    expect(await assistantEnabled(store)).toBe(false);
  });
});

test.describe('POST /api/ask', () => {
  test.skip(({ isMobile }) => isMobile, 'Server behaviour is the same for every viewport.');
  let visitor = 0;
  const ask = (request: import('@playwright/test').APIRequestContext, data: unknown, origin = 'http://localhost:3001') =>
    request.post('/api/ask', { data, headers: { Origin: origin, 'X-Forwarded-For': `192.0.2.${++visitor % 250}` } });

  test('answers from the site and suggests a page action', async ({ request }) => {
    const response = await ask(request, { question: 'How long does a WordPress site take?' });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.answer).toContain('3–5 weeks');
    expect(body.actions).toEqual([{ type: 'show_section', id: 'process' }]);
  });

  test('accepts 300 characters, refuses 301 and blank questions', async ({ request }) => {
    expect((await ask(request, { question: 'a'.repeat(300) })).status()).toBe(200);
    const long = await ask(request, { question: 'a'.repeat(301) });
    expect(long.status()).toBe(400);
    expect(await long.json()).toMatchObject({ state: 'invalid', field: 'question' });
    expect((await ask(request, { question: '   ' })).status()).toBe(400);
    expect((await ask(request, 'not an object')).status()).toBe(400);
  });

  test('drops an action outside the allowlist', async ({ request }) => {
    const body = await (await ask(request, { question: 'BADTOOL please' })).json();
    expect(body.answer).toBe('Here is that section.');
    expect(body.actions).toEqual([]);
  });

  test('turns provider failures into friendly states', async ({ request }) => {
    test.setTimeout(30_000);
    for (const [question, state] of [['RATELIMIT', 'busy'], ['SERVERERROR', 'error'], ['MALFORMED', 'error'], ['SLOW', 'error']] as const) {
      const response = await ask(request, { question });
      expect(response.status(), question).toBe(503);
      expect(await response.json(), question).toEqual({ state });
    }
  });

  test('refuses requests from other sites', async ({ request }) => {
    expect((await ask(request, { question: 'Hello' }, 'https://evil.example')).status()).toBe(403);
  });

  test('log lines never carry the question', async () => {
    const { formatAskLog } = await import('../src/lib/ask/log');
    const line = JSON.parse(formatAskLog({ requestId: 'r1', outcome: 'answered', ms: 812, tokens: 140 }));
    expect(Object.keys(line).sort()).toEqual(['event', 'ms', 'outcome', 'requestId', 'tokens']);
  });
});
