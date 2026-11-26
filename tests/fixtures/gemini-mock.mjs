// A stand-in for Gemini's generateContent endpoint, for tests only. Replies are chosen by keywords
// in the visitor's question, so each failure mode can be exercised without calling Google.
import { createServer } from 'node:http';

const reply = (res, status, body) => {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(typeof body === 'string' ? body : JSON.stringify(body));
};
// Replies in the structured-output shape the endpoint asks for: one JSON text part.
const answer = (reply) => ({ candidates: [{ content: { role: 'model', parts: [{ text: JSON.stringify(reply) }] } }], usageMetadata: { totalTokenCount: 120 } });

createServer((req, res) => {
  let raw = '';
  req.on('data', (chunk) => (raw += chunk));
  req.on('end', () => {
    if (req.method !== 'POST' || !/:generateContent$/.test(req.url) || !req.headers['x-goog-api-key']) return reply(res, 404, {});
    const body = JSON.parse(raw);
    const question = body.contents.at(-1).parts.map((p) => p.text).join(' ');
    if (question.includes('RATELIMIT')) return reply(res, 429, { error: { code: 429 } });
    // Only the main model is overloaded; the fallback answers.
    if (question.includes('OVERLOADED') && req.url.includes('gemini-3.1-flash-lite')) return reply(res, 503, { error: { code: 503 } });
    if (question.includes('DUPES')) {
      return reply(res, 200, answer({ answer: 'Happy to help.', actions: [{ type: 'draft_inquiry', summary: 'A shop' }, { type: 'draft_inquiry', summary: 'A shop again' }] }));
    }
    if (question.includes('SERVERERROR')) return reply(res, 500, { error: { code: 500 } });
    if (question.includes('MALFORMED')) return reply(res, 200, 'not json');
    if (question.includes('BADTOOL')) {
      return reply(res, 200, answer({ answer: 'Here is that section.', actions: [{ type: 'show_section', target: 'admin' }] }));
    }
    const normal = answer({
      answer: 'A WordPress site usually takes 3–5 weeks, depending on scope.',
      actions: [{ type: 'show_section', target: 'process' }],
    });
    if (question.includes('SLOW')) return setTimeout(() => reply(res, 200, normal), 9000);
    // Only the main model stalls; the fallback answers.
    if (question.includes('STALLED') && req.url.includes('gemini-3.1-flash-lite')) return setTimeout(() => reply(res, 200, normal), 15000);
    return reply(res, 200, normal);
  });
}).listen(3091, '127.0.0.1');
