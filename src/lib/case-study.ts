import type { Metadata } from 'next';
import type { CaseStudyProject } from '@/data/projects';
import { site } from '@/data/site';
import { getBaseUrl } from './seo';

interface CaseCopy {
  /** Page title without the site name; the root layout's template appends it. */
  title: string;
  description: string;
}

export function caseStudyMetadata(project: CaseStudyProject, copy: CaseCopy): Metadata {
  return {
    title: copy.title,
    description: copy.description,
    alternates: { canonical: project.caseStudy },
    openGraph: {
      type: 'article',
      url: project.caseStudy,
      siteName: site.name,
      title: `${copy.title} | ${site.name}`,
      description: copy.description,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${copy.title} | ${site.name}`,
      description: copy.description,
    },
  };
}

/**
 * Structured data for a case study: the article itself, the work it describes (with its source
 * code), and the breadcrumb back to the homepage. The person is the one declared in the root layout.
 */
export function caseStudyJsonLd(project: CaseStudyProject, copy: CaseCopy, work: Record<string, unknown>) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${project.caseStudy}`;
  const person = { '@id': `${baseUrl}/#person` };
  const code = project.links.find((link) => link.href.startsWith('https://github.com/'));
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${url}#article`,
        headline: copy.title,
        description: copy.description,
        url,
        image: `${url}/opengraph-image`,
        author: person,
        publisher: person,
        about: { '@id': `${url}#work` },
        isPartOf: { '@id': `${baseUrl}/#website` },
        inLanguage: 'en',
      },
      {
        '@id': `${url}#work`,
        name: project.title,
        description: project.summary,
        creator: person,
        dateCreated: String(project.year),
        image: `${baseUrl}${project.poster.src}`,
        url: project.links[0].href,
        ...work,
      },
      ...(code
        ? [
            {
              '@type': 'SoftwareSourceCode',
              name: `${project.title} source code`,
              codeRepository: code.href,
              author: person,
              targetProduct: { '@id': `${url}#work` },
            },
          ]
        : []),
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Work', item: `${baseUrl}/` },
          { '@type': 'ListItem', position: 2, name: project.title, item: url },
        ],
      },
    ],
  };
}

export const jsonLdScript = (data: unknown) => ({ __html: JSON.stringify(data).replace(/</g, '\\u003c') });
