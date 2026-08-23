import { createReadStream, existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const root = process.cwd();
const types = { '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.html': 'text/html; charset=utf-8', '.png': 'image/png' };
createServer((req, res) => {
  const pathname = (req.url || '/').split('?')[0] === '/' ? '/index.html' : (req.url || '/').split('?')[0];
  if (pathname === '/favicon.ico') { res.writeHead(204); res.end(); return; }
  const target = normalize(join(root, pathname));
  if (!target.startsWith(root) || !existsSync(target)) { res.writeHead(404); res.end('Not found'); return; }
  res.writeHead(200, { 'Content-Type': types[extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  createReadStream(target).pipe(res);
}).listen(4173, '127.0.0.1', () => console.log('Conference home preview: http://127.0.0.1:4173/'));
