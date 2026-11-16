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
