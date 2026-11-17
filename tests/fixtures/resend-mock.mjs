// A stand-in for Resend's send-email endpoint, for tests only. It records what it would have sent
// so tests can check the email without delivering anything.
import { createServer } from 'node:http';

const sent = new Map();
let last = null;

const reply = (res, status, body) => {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
};

createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/last') return reply(res, 200, last ?? {});
  if (req.method === 'GET' && req.url === '/count') return reply(res, 200, { count: sent.size });
  let raw = '';
  req.on('data', (chunk) => (raw += chunk));
  req.on('end', () => {
    if (req.method !== 'POST' || req.url !== '/emails' || req.headers.authorization !== 'Bearer test') return reply(res, 401, { message: 'unauthorised' });
    const body = JSON.parse(raw);
    if (body.text?.includes('RESENDFAIL')) return reply(res, 500, { message: 'internal' });
    // Resend returns the first response again for a repeated Idempotency-Key, without sending twice.
    const key = req.headers['idempotency-key'] ?? crypto.randomUUID();
    if (!sent.has(key)) {
      sent.set(key, { id: `email_${sent.size + 1}` });
      last = body;
    }
    reply(res, 200, sent.get(key));
  });
}).listen(3092, '127.0.0.1');
