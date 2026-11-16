// A stand-in for Gemini's generateContent endpoint, for tests only. Replies are chosen by keywords
// in the visitor's question, so each failure mode can be exercised without calling Google.
import { createServer } from 'node:http';

const reply = (res, status, body) => {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(typeof body === 'string' ? body : JSON.stringify(body));
};
const answer = (parts) => ({ candidates: [{ content: { role: 'model', parts } }], usageMetadata: { totalTokenCount: 120 } });

createServer((req, res) => {
  let raw = '';
  req.on('data', (chunk) => (raw += chunk));
  req.on('end', () => {
    if (req.method !== 'POST' || !/:generateContent$/.test(req.url) || !req.headers['x-goog-api-key']) return reply(res, 404, {});
    const body = JSON.parse(raw);
    const question = body.contents.at(-1).parts.map((p) => p.text).join(' ');
    if (question.includes('RATELIMIT')) return reply(res, 429, { error: { code: 429 } });
    if (question.includes('SERVERERROR')) return reply(res, 500, { error: { code: 500 } });
    if (question.includes('MALFORMED')) return reply(res, 200, 'not json');
    if (question.includes('BADTOOL')) {
      return reply(res, 200, answer([{ text: 'Here is that section.' }, { functionCall: { name: 'show_section', args: { id: 'admin' } } }]));
    }
    const normal = answer([
      { text: 'A WordPress site usually takes 3–5 weeks, depending on scope.' },
      { functionCall: { name: 'show_section', args: { id: 'process' } } },
    ]);
    if (question.includes('SLOW')) return setTimeout(() => reply(res, 200, normal), 9000);
    return reply(res, 200, normal);
  });
}).listen(3091, '127.0.0.1');
