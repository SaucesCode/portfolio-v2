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
