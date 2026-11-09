import type { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/seo';

// Only routes that exist. Add case-study routes here as they are built.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${getBaseUrl()}/`, changeFrequency: 'monthly', priority: 1 }];
}
