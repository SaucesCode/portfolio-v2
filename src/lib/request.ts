/** On Vercel the platform sets X-Forwarded-For; the first address is the visitor's. */
export const visitorIp = (request: Request) =>
  request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
