/**
 * Auditoría automática del sitio construido.
 * Revisa dist/ y falla (exit 1) si falta alguno de los requisitos de calidad,
 * entidad SEO, PWA, privacidad y accesibilidad del proyecto.
 *
 * Uso: node scripts/self-check.mjs   (después de `pnpm build`)
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = join(root, 'dist');
const banned = ['example.com', 'localhost', 'chrome-extension://', 'ca-pub-', 'adsbygoogle', 'TODO:', 'XXXXXXXX'];
const SITE = 'https://piuraplazadearmas.com';

const errors = [];
const notes = [];
const fail = (message) => errors.push(message);

if (!existsSync(dist)) {
  console.error('dist/ no existe. Ejecuta `npm run build` primero.');
  process.exit(1);
}

const files = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else files.push(path);
  }
};
walk(dist);

const rel = (file) => file.slice(dist.length + 1).replace(/\\/g, '/');
const html = readFileSync(join(dist, 'index.html'), 'utf8');

/* ---------- 1. Contenido prohibido / marcadores de posición ---------- */
for (const file of files) {
  if (!/\.(html|xml|js|css|txt|json|webmanifest)$/i.test(file)) continue;
  const content = readFileSync(file, 'utf8');
  for (const needle of banned) {
    if (content.includes(needle)) fail(`Contenido prohibido "${needle}" en ${rel(file)}`);
  }
}

/* ---------- 2. TDK, canonical, Open Graph ---------- */
const title = (html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
if (!title.includes('Plaza de Armas Piura')) fail('El <title> no contiene el nombre completo del lugar.');
if (!title.includes('Piura')) fail('El <title> no contiene la ciudad.');
if (title.length > 70) fail(`<title> demasiado largo (${title.length} caracteres).`);

const descMatch = html.match(/<meta name="description" content="([^"]*)"/);
const descText = descMatch ? descMatch[1] : '';
if (descText.length < 70 || descText.length > 165) {
  fail(`Meta description fuera de rango (${descText.length} caracteres).`);
}
if (!descText.includes('Piura')) fail('La meta description no menciona la ciudad.');

if (!/<link rel="canonical" href="https:\/\/piuraplazadearmas\.com\/"/.test(html)) {
  fail('Falta canonical absoluto a https://piuraplazadearmas.com/.');
}
if (!new RegExp(`<meta property="og:url" content="${SITE}/"`).test(html)) fail('Falta og:url canónico.');
for (const tag of ['og:title', 'og:description', 'og:image', 'og:image:alt', 'og:type', 'og:locale', 'og:site_name', 'og:image:width', 'og:image:height']) {
  if (!html.includes(`property="${tag}"`)) fail(`Falta ${tag}.`);
}
if (!/og:image" content="https:\/\/piuraplazadearmas\.com\/images\/[^"]+\.jpg"/.test(html)) {
  fail('og:image no apunta a una imagen local absoluta.');
}
for (const tag of ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image', 'twitter:image:alt']) {
  if (!html.includes(`name="${tag}"`)) fail(`Falta ${tag}.`);
}
if (!html.includes('hreflang="es-PE"') || !html.includes('hreflang="x-default"')) fail('Faltan alternates hreflang es-PE / x-default.');
if (!/<meta name="robots" content="index,follow/.test(html)) fail('Meta robots incorrecta.');
if (!/<html lang="es-PE">/.test(html)) fail('El atributo lang no es es-PE.');
if (!html.includes('geo.position')) fail('Faltan metadatos geográficos (geo.position).');

/* ---------- 3. Estructura de encabezados ---------- */
const strip = (value) => value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => strip(m[1]));
if (h1s.length !== 1) fail(`Se esperaba exactamente un <h1>; hay ${h1s.length}.`);
const h1 = h1s[0] || '';
if (!h1.includes('Plaza de Armas') || !h1.includes('Piura') || !h1.includes('Perú')) {
  fail(`El H1 no une nombre completo, ciudad y país: "${h1}"`);
}
const h2s = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => strip(m[1]));
const requiredH2 = [/Sobre la Plaza de Armas Piura/i, /Historia e importancia/i, /cómo visitar/i, /alrededor de la Plaza de Armas Piura/i, /Preguntas frecuentes sobre la Plaza de Armas Piura/i];
for (const pattern of requiredH2) {
  if (!h2s.some((value) => pattern.test(value))) fail(`Falta el H2 obligatorio que coincide con ${pattern}.`);
}

/* ---------- 4. Vinculación semántica de la entidad ---------- */
for (const needle of ['Plaza de Armas Piura', 'Plaza de Armas de Piura', 'Piura Plaza de Armas', 'R93F+58', 'Ayacucho']) {
  if (!html.includes(needle)) fail(`Falta la cadena de entidad "${needle}" en el HTML.`);
}
if (!/Catedral de San Miguel Arcángel/.test(html)) fail('No se menciona el punto de interés 1 (Catedral).');
if (!/MUCEN Piura/.test(html)) fail('No se menciona el punto de interés 2 (MUCEN Piura).');

/* ---------- 5. Imágenes ---------- */
const imgs = [...html.matchAll(/<img [^>]*>/g)].map((m) => m[0]);
if (imgs.length < 5) fail(`Se esperaban al menos 5 imágenes; hay ${imgs.length}.`);
for (const img of imgs) {
  if (!/alt="[^"]+"/.test(img)) fail(`Imagen sin alt significativo: ${img.slice(0, 80)}`);
}
const heroImg = imgs.find((img) => img.includes('/images/plaza-de-armas-piura-hero.jpg')) || '';
if (!/alt="Plaza de Armas Piura - vista principal en Piura, Perú"/.test(heroImg)) {
  fail('El alt de la imagen principal no sigue el patrón de entidad.');
}
for (const image of ['plaza-de-armas-piura-hero.jpg', 'plaza-de-armas-piura-vista.jpg', 'catedral-de-piura.jpg', 'alegoria-a-la-libertad.jpg']) {
  if (!existsSync(join(dist, 'images', image))) fail(`Falta la imagen local ${image}.`);
}

/* ---------- 6. Datos estructurados ---------- */
const ldBlocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
if (ldBlocks.length !== 1) fail(`Se esperaba un único bloque JSON-LD consolidado; hay ${ldBlocks.length}.`);
let graph = [];
try {
  const parsed = JSON.parse(ldBlocks[0][1]);
  graph = parsed['@graph'] || [parsed];
} catch (error) {
  fail(`El JSON-LD no es JSON válido: ${error.message}`);
}
const byType = (type) => graph.find((node) => [].concat(node['@type']).includes(type));
const attraction = byType('TouristAttraction');
if (!attraction) fail('Falta el nodo TouristAttraction.');
else {
  const required = ['@id', 'name', 'alternateName', 'description', 'url', 'image', 'isAccessibleForFree', 'address', 'geo', 'hasMap', 'sameAs', 'openingHoursSpecification'];
  for (const key of required) {
    if (!(key in attraction)) fail(`TouristAttraction sin la propiedad "${key}".`);
  }
  if (attraction['@id'] !== `${SITE}/#attraction`) fail('El @id de TouristAttraction no es el ancla #attraction.');
  if (!Array.isArray(attraction.image) || attraction.image.length < 2) fail('TouristAttraction necesita varias imágenes absolutas.');
  for (const url of attraction.image) {
    if (!url.startsWith(`${SITE}/images/`)) fail(`Imagen de schema no absoluta o fuera de /images: ${url}`);
  }
  if (attraction.address.addressCountry !== 'PE') fail('El país del schema no es PE.');
  if (attraction.address.postalCode !== '20001') fail('El código postal del schema no es 20001.');
  if (attraction.geo.latitude !== -5.1970998 || attraction.geo.longitude !== -80.62668) fail('Coordenadas del schema distintas de las oficiales.');
  if (!attraction.sameAs.some((url) => url.includes('maps.app.goo.gl'))) fail('sameAs sin enlace de Google Maps.');
  if (!attraction.sameAs.some((url) => url.includes('.gob.pe'))) fail('sameAs sin dominio oficial .gob.pe.');
  if (attraction.aggregateRating.ratingValue !== 4.3 || attraction.aggregateRating.ratingCount !== 16985) fail('aggregateRating no coincide con 4,3 / 16.985.');
}
for (const type of ['Organization', 'WebSite', 'WebPage', 'BreadcrumbList', 'FAQPage']) {
  if (!byType(type)) fail(`Falta el nodo ${type} en el grafo JSON-LD.`);
}
const faq = byType('FAQPage');
const faqItems = faq && faq.mainEntity ? faq.mainEntity.length : 0;
const detailsCount = [...html.matchAll(/<details>/g)].length;
if (faqItems !== detailsCount) fail(`FAQPage declara ${faqItems} preguntas pero la página muestra ${detailsCount} <details>.`);
if (faqItems < 8) fail(`Se esperaban al menos 8 preguntas frecuentes; hay ${faqItems}.`);
const webpage = byType('WebPage');
if (!webpage || !webpage.dateModified) fail('WebPage sin dateModified.');
if (!webpage.inLanguage || webpage.inLanguage !== 'es-PE') fail('WebPage.inLanguage incorrecto.');

/* ---------- 7. Mapa y enlaces autoritativos ---------- */
const iframe = (html.match(/<iframe [^>]*>/) || [''])[0];
if (!iframe) fail('Falta el iframe del mapa.');
if (!iframe.includes('loading="lazy"')) fail('El iframe del mapa no usa loading="lazy"');
if (!iframe.includes('referrerpolicy="strict-origin-when-cross-origin"')) fail('El iframe del mapa no aplica referrerpolicy estricta.');
if (!iframe.includes('title="')) fail('El iframe del mapa no tiene título accesible.');
if (!iframe.includes('-5.197099794758691')) fail('El iframe no usa las coordenadas del embed indicado.');
const external = [...html.matchAll(/<a [^>]*href="(https?:[^"]+)"[^>]*>/g)]
  .map((m) => m[0])
  .filter((anchor) => !anchor.includes(`href="${SITE}`));
for (const anchor of external) {
  if (!/target="_blank"/.test(anchor)) fail(`Enlace externo sin target="_blank": ${anchor.slice(0, 90)}`);
  if (!/rel="noopener noreferrer"/.test(anchor)) fail(`Enlace externo sin rel de seguridad: ${anchor.slice(0, 90)}`);
}
if (!external.some((anchor) => anchor.includes('gob.pe'))) fail('No hay enlaces de salida a dominios oficiales .gob.pe.');
if (!external.some((anchor) => anchor.includes('maps.app.goo.gl/WAjRRUEwGccZYiKd9'))) fail('Falta el enlace corto de Google Maps indicado.');

/* ---------- 8. PWA ---------- */
const manifestPath = join(dist, 'site.webmanifest');
if (!existsSync(manifestPath)) fail('Falta site.webmanifest.');
else {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  if (manifest.start_url !== '/') fail('El start_url del manifest no es /.');
  if (!manifest.icons || manifest.icons.length < 3) fail('El manifest no declara suficientes iconos.');
  for (const icon of manifest.icons) {
    if (icon.type === 'image/png' && !existsSync(join(dist, icon.src.replace(/^\//, '')))) {
      fail(`El manifest referencia un icono inexistente: ${icon.src}`);
    }
  }
}
if (!existsSync(join(dist, 'sw.js'))) fail('Falta el service worker.');
else {
  const sw = readFileSync(join(dist, 'sw.js'), 'utf8');
  for (const event of ['install', 'activate', 'fetch']) {
    if (!sw.includes(`addEventListener('${event}'`)) fail(`El service worker no escucha "${event}".`);
  }
  if (!sw.includes("caches.match(OFFLINE_URL)")) fail('El service worker no tiene respaldo offline.');
}
if (!html.includes('site.webmanifest')) fail('El HTML no enlaza el manifest.');
if (!html.includes('navigator.serviceWorker.register')) fail('El HTML no registra el service worker.');
if (!html.includes('apple-touch-icon')) fail('Faltan metadatos de icono para iOS.');

/* ---------- 9. Privacidad / GA4 ---------- */
if (!html.includes('G-HXM22WWPKP')) fail('Falta el identificador GA4 G-HXM22WWPKP.');
if (/<script[^>]+googletagmanager\.com/.test(html)) fail('GA4 se carga de forma estática antes del consentimiento.');
if (!html.includes('anonymize_ip')) fail('GA4 no anonimiza la IP.');
if (!html.includes('localStorage')) fail('No hay control de consentimiento en el cliente.');

/* ---------- 10. Sitemap ---------- */
const sitemapFiles = files.filter((file) => /sitemap.*\.xml$/i.test(file));
if (sitemapFiles.length === 0) fail('No se generó el sitemap.');
for (const file of sitemapFiles) {
  const xml = readFileSync(file, 'utf8');
  if (/<lastmod>/i.test(xml)) fail(`lastmod encontrado en ${rel(file)}; no debe inventarse una fecha.`);
  if (!xml.includes(`<loc>${SITE}/`)) fail(`Sitemap sin URLs absolutas del dominio real: ${rel(file)}`);
}
const robots = existsSync(join(dist, 'robots.txt')) ? readFileSync(join(dist, 'robots.txt'), 'utf8') : '';
if (!/^Allow: \//m.test(robots)) fail('robots.txt no permite el rastreo.');
if (!robots.includes('Sitemap: https://piuraplazadearmas.com/sitemap-index.xml')) fail('robots.txt no declara el sitemap.');

/* ---------- 11. Contenido turístico mínimo ---------- */
for (const needle of ['Alegoría a la Libertad', 'tamarindos', 'R.M. N.º 303-1987-ED', 'MINCETUR']) {
  if (!html.includes(needle)) fail(`Falta contenido verificado esperado: "${needle}"`);
}
if (!html.includes('propiedad de sus respectivos fotógrafos')) fail('Falta la nota de propiedad de las imágenes.');

/* ---------- Resultado ---------- */
if (notes.length) notes.forEach((note) => console.log(`Nota: ${note}`));
if (errors.length) {
  console.error(`\nAuditoría FALLIDA (${errors.length} problema/s):`);
  for (const error of errors) console.error(` - ${error}`);
  process.exit(1);
}
console.log(`Self-check OK: ${files.length} archivos revisados, ${graph.length} nodos JSON-LD, ${faqItems} preguntas frecuentes.`);
console.log(`  title (${title.length}): ${title}`);
console.log(`  description (${descText.length}): ${descText}`);
console.log(`  h1: ${h1}`);
h2s.forEach((value) => console.log(`  h2: ${value}`));
console.log(`  imágenes: ${imgs.length} (todas con alt) · enlaces externos: ${external.length}`);
