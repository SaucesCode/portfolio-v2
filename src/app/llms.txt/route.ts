import { getBaseUrl } from '@/lib/seo';
import { siteKnowledge } from '@/lib/site-knowledge';

// A plain-text map of the site for language models (https://llmstxt.org), built from the same
// data as the pages so it never drifts from them.
export const dynamic = 'force-static';

export function GET() {
  return new Response(siteKnowledge(getBaseUrl()), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
