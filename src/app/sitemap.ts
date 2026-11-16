import type { MetadataRoute } from 'next';
import { caseStudies } from '@/data/projects';
import { getBaseUrl } from '@/lib/seo';

// Only routes that exist: the homepage and the case studies listed in the project registry.
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();
  return [
    { url: `${baseUrl}/`, changeFrequency: 'monthly', priority: 1 },
    ...caseStudies.map((project) => ({
      url: `${baseUrl}${project.caseStudy}`,
      lastModified: project.caseStudyDates.updated,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}
