import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const dist = join(root, 'dist');
const banned = ['example.com', 'localhost', 'chrome-extension://'];

if (!existsSync(dist)) {
  console.error('dist/ no existe. Ejecuta pnpm build primero.');
  process.exit(1);
}

const files = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    statSync(path).isDirectory() ? walk(path) : files.push(path);
  }
};
walk(dist);

let failed = false;
for (const file of files) {
  if (!/\.(html|xml|js|css|txt|json)$/i.test(file)) continue;
  const content = readFileSync(file, 'utf8');
  for (const needle of banned) {
    if (content.includes(needle)) {
      console.error(`Contenido prohibido encontrado: ${needle} en ${file}`);
      failed = true;
    }
  }
}

const sitemapFiles = files.filter((f) => /sitemap.*\.xml$/i.test(f));
if (sitemapFiles.length === 0) {
  console.log('Sitemap no generado: esperado mientras `site` esté vacío en astro.config.ts.');
} else {
  for (const file of sitemapFiles) {
    const xml = readFileSync(file, 'utf8');
    if (/<lastmod>/i.test(xml)) {
      console.error(`lastmod encontrado en ${file}; no debe inventarse una fecha.`);
      failed = true;
    }
    if (!/<loc>https?:\/\//i.test(xml)) {
      console.error(`Sitemap sin URLs absolutas reales: ${file}`);
      failed = true;
    }
  }
}

if (failed) process.exit(1);
console.log(`Self-check OK: ${files.length} archivos revisados.`);
