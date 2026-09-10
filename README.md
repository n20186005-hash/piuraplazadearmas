# Plaza de Armas Piura — sitio turístico

Micrositio estático de una sola página, en español de Perú, creado con Astro + Tailwind CSS + TypeScript y preparado para desplegarse como Cloudflare Worker con Static Assets.

- Sitio: **https://piuraplazadearmas.com**
- Idioma: `es-PE` (una sola página)
- Entidad: **Plaza de Armas Piura** (Plaza de Armas de Piura) · Piura, Piura, Perú

## Requisitos fijados

- Node.js 24.21.0 (`.node-version` y `engines`)
- pnpm 12.3.4 (`packageManager` y `engines`)
- Astro 7.3.2
- Tailwind CSS 4.3.3
- TypeScript 6.0.3
- @astrojs/check 0.9.10
- @astrojs/sitemap 3.7.4
- Wrangler 4.129.1

## Dominio: un solo punto de configuración

El dominio vive únicamente en `const site` dentro de `astro.config.ts`. Astro lo reutiliza para el `canonical`, Open Graph, `hreflang`, JSON-LD y el sitemap; las imágenes de schema y de OG se construyen a partir de él. No dupliques la URL en otros archivos.

## Entidad y datos verificados

| Dato | Valor |
| --- | --- |
| Nombre oficial | Plaza de Armas de Piura |
| Nombre común / dominio | Plaza de Armas Piura (Piura Plaza de Armas) |
| Ciudad / Región / País | Piura / Piura / Perú (PE) |
| Dirección | Ayacucho, Piura 20001 |
| Plus Code | R93F+58, Piura |
| Coordenadas | -5.1970998, -80.62668 |
| Horario / Entrada | Acceso libre 24 h · gratuito |
| Altitud | 22 m s. n. m. |
| Patrimonio | Patrimonio Cultural de la Nación (R.M. N.º 303-1987-ED) |
| Calificación | 4,3 · 16.985 reseñas |
| Google Maps | https://maps.app.goo.gl/WAjRRUEwGccZYiKd9 |

Fuentes oficiales usadas: ficha de inventario N.º 3163 del MINCETUR, Gob.pe (Municipalidad Provincial de Piura), Portal Turístico de Piura, Perú Travel (PROMPERÚ), Ministerio de Cultura (Casa Museo Gran Almirante Grau) y el MUCEN del BCRP.

## SEO y datos estructurados

- `title` + `description` con nombre completo, ciudad y país; `canonical`; `hreflang` `es-PE` + `x-default`.
- Open Graph y Twitter Card completos (`og:image` absoluta 1280×866, `og:image:alt`, `og:image:width/height`, `og:locale`).
- Metadatos geográficos (`geo.position`, `geo.placename`, `geo.region`, `ICBM`).
- Un único bloque JSON-LD consolidado en `@graph` con `Organization`, `WebSite`, `WebPage` (con `dateModified`), `BreadcrumbList`, `TouristAttraction` (con `@id` ancla, `image`, `alternateName`, dirección, `geo`, `hasMap`, `sameAs`, horario, `aggregateRating`) y `FAQPage` con 10 preguntas idénticas a los `<details>` visibles.
- Jerarquía `H1` única con nombre completo + ciudad + país y `H2` con entidad en Sobre / Historia / Ubicación / Alrededores / FAQ.
- Enlaces de salida a dominios oficiales `.gob.pe` desde el mapa y la sección de fuentes.
- `sitemap-index.xml` (sin `lastmod` inventado) y `robots.txt` con `Allow: /` y la referencia al sitemap.

## PWA

`public/site.webmanifest` (start_url `/`, `es-PE`, tema `#244433`), iconos PNG 192/512 y 512 maskable generados con `pnpm icons`, `public/icons/icon.svg` y `public/sw.js` con estrategia network-first para navegación y respaldo offline en `/`.

## Desarrollo y validación

```bash
corepack enable
corepack pnpm install
pnpm check
pnpm build
pnpm self-check
pnpm icons        # regenera los PNG de la PWA
```

`pnpm self-check` audita `dist/`: TDK, canonical/OG, estructura de encabezados, imágenes y atributos `alt`, JSON-LD (tipos, `@id`, `geo`, `image`, `aggregateRating`), enlaces externos con `rel` de seguridad, PWA, consentimiento de GA4, sitemap/robots y ausencia de marcadores de posición.

## Cloudflare Worker

```bash
pnpm deploy
```

`wrangler.jsonc` publica `dist/` como Static Assets dentro de Cloudflare Workers.

## Privacidad y analítica

GA4 (`G-HXM22WWPKP`) se carga **solo** después del consentimiento guardado en `localStorage`, con `anonymize_ip`. Nunca se inyecta la etiqueta en el HTML estático.

## Fotografías

Consulta `CREDITS.md`. Las cuatro fotografías son imágenes reales con licencia CC BY-SA 4.0 y ya están servidas localmente desde `public/images/`. Todas las imágenes del sitio son propiedad de sus respectivos fotógrafos.
