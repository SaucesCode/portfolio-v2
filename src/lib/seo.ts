import { site } from '@/data/site';

/**
 * The origin every canonical URL, sitemap entry and social image points at. It is the production
 * domain even on preview deploys, so search engines only ever see one address for each page.
 * NEXT_PUBLIC_SITE_URL overrides it for a copy served elsewhere.
 */
export const getBaseUrl = (): string => (process.env.NEXT_PUBLIC_SITE_URL || site.url).replace(/\/$/, '');
