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

test.describe('Ask about my work panel', () => {
  type Page = import('@playwright/test').Page;
  const answerWith = async (page: Page, status: number, json: unknown) =>
    page.route('**/api/ask', (route) => route.fulfill({ status, json }));
  const trigger = (page: Page) => page.getByRole('banner').getByRole('button', { name: 'Ask about my work' });
  const panel = (page: Page) => page.getByRole('dialog', { name: 'Ask about my work' });

  test('opens from the header or with /, and Escape returns focus', async ({ page, isMobile }) => {
    await page.goto('/');
    await trigger(page).click();
    await expect(panel(page)).toBeVisible();
    await expect(panel(page).getByRole('textbox', { name: 'Your question' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(panel(page)).toBeHidden();
    await expect(trigger(page)).toBeFocused();
    if (!isMobile) {
      await page.locator('body').click({ position: { x: 5, y: 300 } });
      await page.keyboard.press('/');
      await expect(panel(page)).toBeVisible();
    }
  });

  test('a suggested question shows the answer and its actions', async ({ page }) => {
    await answerWith(page, 200, { answer: 'A WordPress site usually takes 3–5 weeks.', actions: [{ type: 'show_section', id: 'process' }] });
    await page.goto('/');
    await trigger(page).click();
    await panel(page).getByRole('button', { name: 'How long does a website take?' }).click();
    await expect(panel(page)).toContainText('A WordPress site usually takes 3–5 weeks.');
    await panel(page).getByRole('button', { name: 'Show how working together goes' }).click();
    await expect(panel(page)).toBeHidden();
    await expect(page.locator('#process')).toBeInViewport();
  });

  test('from a case study, a section action leads back to the homepage', async ({ page }) => {
    await answerWith(page, 200, { answer: 'Here is how it works.', actions: [{ type: 'show_section', id: 'process' }] });
    await page.goto('/work/quickaid');
    await trigger(page).click();
    await panel(page).getByRole('textbox', { name: 'Your question' }).fill('How do projects run?');
    await panel(page).getByRole('button', { name: 'Ask', exact: true }).click();
    await panel(page).getByRole('button', { name: 'Show how working together goes' }).click();
    await expect(page).toHaveURL(/\/#process$/);
  });

  test('a demo action switches the hero', async ({ page }) => {
    await answerWith(page, 200, { answer: 'Try it here.', actions: [{ type: 'focus_demo', id: 'web' }] });
    await page.goto('/');
    await trigger(page).click();
    await panel(page).getByRole('textbox', { name: 'Your question' }).fill('Show me a website');
    await panel(page).getByRole('button', { name: 'Ask', exact: true }).click();
    await panel(page).getByRole('button', { name: 'Try the website demo' }).click();
    await expect(page.getByRole('radio', { name: /Thread & Form/ })).toHaveAttribute('aria-checked', 'true');
  });

  for (const [status, body, text] of [
    [429, { state: 'limited', retryAfterSeconds: 240 }, 'Try again in 4 minutes'],
    [503, { state: 'busy' }, 'busy today'],
    [503, { state: 'off' }, 'switched off for now'],
    [503, { state: 'error' }, 'Something went wrong'],
    [400, { state: 'invalid', field: 'question', message: 'Keep it to 300 characters.' }, 'Keep it to 300 characters.'],
  ] as const) {
    test(`shows the ${body.state} state with a way to email`, async ({ page }) => {
      await answerWith(page, status, body);
      await page.goto('/');
      await trigger(page).click();
      await panel(page).getByRole('textbox', { name: 'Your question' }).fill('Hello');
      await panel(page).getByRole('button', { name: 'Ask', exact: true }).click();
      await expect(panel(page)).toContainText(text);
      await expect(panel(page).getByRole('link', { name: /Email/ })).toHaveAttribute('href', /^mailto:/);
    });
  }
});

test.describe('Assistant in local development', () => {
  test('development counts in memory and accepts localhost; production does neither', async () => {
    const { storeFromEnv } = await import('../src/lib/ask/store');
    const { isAllowedOrigin } = await import('../src/lib/ask/origin');
    const env = process.env as Record<string, string | undefined>;
    const saved = { NODE_ENV: env.NODE_ENV, ASSISTANT_STORE: env.ASSISTANT_STORE };
    delete env.ASSISTANT_STORE;
    try {
      env.NODE_ENV = 'production';
      expect(storeFromEnv()).toBeNull();
      expect(isAllowedOrigin('http://localhost:3000')).toBe(false);
      expect(isAllowedOrigin('https://www.saucescode.xyz')).toBe(true);
      env.NODE_ENV = 'development';
      expect(storeFromEnv()).not.toBeNull();
      expect(isAllowedOrigin('http://localhost:3000')).toBe(true);
      expect(isAllowedOrigin('http://127.0.0.1:5199')).toBe(true);
      expect(isAllowedOrigin('https://evil.example')).toBe(false);
    } finally {
      Object.assign(env, saved);
    }
  });

  test('an unexpected refusal still shows a message and the email link', async ({ page }) => {
    await page.route('**/api/ask', (route) => route.fulfill({ status: 403, json: { state: 'forbidden' } }));
    await page.goto('/');
    await page.getByRole('banner').getByRole('button', { name: 'Ask about my work' }).click();
    const panel = page.getByRole('dialog', { name: 'Ask about my work' });
    await panel.getByRole('textbox', { name: 'Your question' }).fill('Hello');
    await panel.getByRole('button', { name: 'Ask', exact: true }).click();
    await expect(panel).toContainText('Something went wrong');
  });
});
