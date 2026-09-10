# Estado de validación de esta entrega

## Comprobaciones ejecutadas en este entorno

- `npm install` completado (el aviso `EBADENGINE` de Node 24.14 frente al 24.21 fijado es decorativo).
- `npx astro check` → **0 errores, 0 avisos, 0 sugerencias**.
- `npx astro build` → build correcto; `dist/` con `index.html`, `sw.js`, `site.webmanifest`, `robots.txt`, `sitemap-index.xml`, `sitemap-0.xml`, `images/` e `icons/`.
- `node scripts/self-check.mjs` → **Self-check OK**: 6 nodos JSON-LD, 10 preguntas frecuentes, 0 problemas.

## Cobertura del autocontrol (`scripts/self-check.mjs`)

1. Cadenas prohibidas: `example.com`, `localhost`, `chrome-extension://`, `ca-pub-`, `adsbygoogle`, `TODO:`, `XXXXXXXX` (0 coincidencias en `dist/`).
2. TDK, `canonical` absoluto, `hreflang` `es-PE` + `x-default`, metadatos geográficos, Open Graph y Twitter Card completos con `og:image` absoluta y dimensiones reales.
3. Estructura de encabezados: un único `H1` con nombre completo + ciudad + país y los cinco `H2` con entidad (Sobre / Historia / Ubicación y cómo visitar / Alrededores / FAQ).
4. Vinculación semántica: presencia de «Plaza de Armas Piura», «Plaza de Armas de Piura», «Piura Plaza de Armas», Plus Code `R93F+58` y las direcciones del centro histórico.
5. Imágenes: todas con `alt`, hero con el patrón de entidad y los cuatro JPG locales presentes en `dist/images/`.
6. JSON-LD válido y consolidado: `Organization`, `WebSite`, `WebPage` (`dateModified`, `inLanguage`), `BreadcrumbList`, `TouristAttraction` (`@id` ancla, imágenes absolutas, `address` PE/20001, `geo` -5.1970998/-80.62668, `hasMap`, `sameAs` con `maps.app.goo.gl` y `.gob.pe`, `aggregateRating` 4,3/16.985) y `FAQPage` con un número de preguntas idéntico a los `<details>` visibles.
7. Mapa: `iframe` con `loading="lazy"`, `referrerpolicy` estricta, `title` accesible y las coordenadas del embed solicitado; enlaces externos con `target="_blank"` y `rel="noopener noreferrer"`.
8. PWA: manifest con `start_url` `/` e iconos existentes, service worker con los eventos `install`/`activate`/`fetch` y respaldo offline, registro del SW y metadatos para iOS.
9. GA4 `G-HXM22WWPKP` presente pero **no** inyectado estáticamente: solo se carga tras el consentimiento y con `anonymize_ip`.
10. Sitemap sin `lastmod` inventado, URLs absolutas del dominio real y `robots.txt` con `Allow: /` y referencia al sitemap.
11. Contenido verificado presente: «Alegoría a la Libertad», «tamarindos», «R.M. N.º 303-1987-ED», «MINCETUR» y la nota de propiedad de las imágenes.

## Cambios respecto a la entrega anterior

- Dominio definitivo configurado en `astro.config.ts` (`https://piuraplazadearmas.com`) y sitemap activado.
- Las cuatro fotografías pasaron de URLs remotas de Wikimedia a archivos locales en `public/images/`.
- Nuevas secciones «Sobre la Plaza de Armas Piura» y «Fuentes y verificación»; los `H2` de las secciones existentes se reformularon con la entidad y el texto original se conserva como entradilla visible.
- JSON-LD ampliado de dos bloques a un grafo con seis nodos; FAQ ampliado de 6 a 10 preguntas.
- PWA completada (iconos PNG reales, manifest, service worker, metadatos iOS).
- `scripts/self-check.mjs` reescrito como auditoría de 11 grupos con corrección de rutas en Windows.

## Pendientes / notas

- La comprobación visual en navegador y el `lighthouse` no se ejecutaron en este entorno; conviene una revisión visual antes de publicar.
- El contenido está en español de Perú y no requiere traducción; sí conviene una revisión editorial final de los textos nuevos.
- `public/images/README.md` se publica como archivo interno del repositorio; su contenido es solo documentación.
