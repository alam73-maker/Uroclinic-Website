import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';

const root = path.resolve(process.argv[2] ?? 'dist');
const port = Number(process.argv[3] ?? 4321);
const cfg = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.txt': 'text/plain' };
const rx = (src) => new RegExp('^' + src.replace(/\(\.\*\)/g, '.*').replace(/\//g, '\\/') + '$');

http.createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.includes('..')) { res.writeHead(400); return res.end(); }
  let file = path.join(root, p);
  try { if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html'); } catch { file = path.join(root, '404.html'); }
  let body;
  try { body = await readFile(file); } catch { res.writeHead(404); return res.end(); }
  const h = { 'Content-Type': types[path.extname(file)] ?? 'application/octet-stream' };
  for (const rule of cfg.headers) if (rx(rule.source).test(p)) for (const x of rule.headers) h[x.key] = x.value;
  if (/gzip/.test(req.headers['accept-encoding'] ?? '') && /text|javascript|svg|css/.test(h['Content-Type'])) { body = zlib.gzipSync(body); h['Content-Encoding'] = 'gzip'; }
  res.writeHead(file.endsWith('404.html') && !p.endsWith('404.html') ? 404 : 200, h);
  res.end(body);
}).listen(port, () => console.log(`http://localhost:${port}`));
