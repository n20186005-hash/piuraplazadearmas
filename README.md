# Plaza de Armas Piura — sitio turístico

Micrositio estático de una sola página, en español de Perú, creado con Astro + Tailwind CSS + TypeScript y preparado para desplegarse como Cloudflare Worker con Static Assets.

## Requisitos fijados

- Node.js 24.21.0 (`.node-version` y `engines`)
- pnpm 12.3.4 (`packageManager` y `engines`)
- Astro 7.3.2
- Tailwind CSS 4.3.3
- TypeScript 6.0.3
- @astrojs/check 0.9.10
- Wrangler 4.129.1

## Dominio: un solo punto de configuración

Edita únicamente `const site = ''` dentro de `astro.config.ts` cuando tengas el dominio definitivo. No dupliques la URL en ningún otro archivo.

Mientras `site` esté vacío:
- la configuración está preparada para construir sin un dominio;
- no se escribe ningún dominio ficticio;
- canonical y `og:url` se omiten;
- `url` en JSON-LD se omite;
- `@astrojs/sitemap` no se activa.

Cuando `site` tenga una URL real, Astro la reutiliza para canonical, Open Graph, JSON-LD y sitemap.

## Desarrollo y validación

```bash
corepack enable
CI=1 corepack pnpm install --frozen-lockfile
pnpm check
pnpm build
pnpm self-check
```

## Cloudflare Worker

```bash
pnpm deploy
```

`wrangler.jsonc` publica `dist/` como Static Assets dentro de Cloudflare Workers.

## Fotografías

Consulta `CREDITS.md`. Las fotografías son reales y con licencia compatible de Wikimedia Commons. En esta entrega permanecen como URLs remotas debido a una restricción de red del entorno que impidió descargar los JPG; el diseño y la atribución ya están preparados para sustituirlas por archivos locales con los mismos nombres.
