# Estado de validación de esta entrega

## Comprobaciones estáticas realizadas

- `package.json`, `public/site.webmanifest` y `wrangler.jsonc`: JSON válido.
- `scripts/self-check.mjs`: sintaxis de Node válida (`node --check`).
- No existe `pnpm-workspace.yaml`.
- Parámetros de idioma/región del iframe de Google Maps: `es` / `pe`; no quedan parámetros `zh-CN`.
- Logo SVG + favicon SVG y PNG 16×16, 32×32 y Apple Touch 180×180 presentes.
- Configuración de dominio concentrada en `const site = ''` de `astro.config.ts`.
- `@astrojs/sitemap` solo se activa cuando `site` tiene valor.
- GA4 no se carga antes del consentimiento de analítica.
- La búsqueda estática no detectó `example.com`, `localhost` ni `chrome-extension://` en el contenido del sitio/configuración (las cadenas sí aparecen deliberadamente dentro del script de autocontrol, porque son precisamente lo que debe buscar en `dist/`).

## Validación CI que NO pudo ejecutarse en este entorno

Esta ejecución no tiene salida de red/DNS hacia `registry.npmjs.org`. Corepack intentó descargar el pnpm fijado por el proyecto y falló con `getaddrinfo EAI_AGAIN registry.npmjs.org`.

Por esa razón, esta entrega **no afirma** haber superado:

```bash
rm -rf node_modules
CI=1 corepack pnpm install --frozen-lockfile
pnpm check
pnpm build
pnpm self-check
```

Tampoco se incluye un `pnpm-lock.yaml` inventado: un lockfile solo debe entregarse después de ser generado/resuelto realmente por pnpm y verificado con `--frozen-lockfile`.

## Fotografías

Las cuatro fotografías usadas son fotos reales con licencia indicada en `CREDITS.md`. Debido a la misma restricción de descarga binaria del entorno, permanecen referenciadas desde Wikimedia Commons en vez de estar copiadas dentro de `public/images/`.
