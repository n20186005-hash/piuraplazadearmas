/* Utilidad temporal: sirve dist/ y toma capturas con Chrome sin interfaz. */
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = join(root, 'dist');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.xml': 'application/xml', '.txt': 'text/plain' };

const server = createServer((req, res) => {
  let path = decodeURIComponent(req.url.split('?')[0]);
  if (path.endsWith('/')) path += 'index.html';
  const file = join(dist, path);
  if (!existsSync(file) || statSync(file).isDirectory()) {
    res.writeHead(404);
    res.end('not found');
    return;
  }
  res.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream' });
  res.end(readFileSync(file));
});

await new Promise((resolve) => server.listen(4399, '127.0.0.1', resolve));

const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const shots = [
  ['shot-desktop.png', '1440,3400'],
  ['shot-mobile.png', '414,2400'],
];

for (const [name, size] of shots) {
  const out = join(root, name);
  spawnSync(chrome, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-sandbox',
    '--force-device-scale-factor=1',
    `--window-size=${size}`,
    '--virtual-time-budget=6000',
    `--screenshot=${out}`,
    'http://127.0.0.1:4399/',
  ], { stdio: 'inherit' });
  console.log('captura:', name);
}

server.close();
