import type { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, changeFrequency: 'monthly', priority: 1.0 },
    { url: `${baseUrl}/work`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/services`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/about`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/contact`, changeFrequency: 'monthly', priority: 0.8 },
  ];

  return staticRoutes;
}
