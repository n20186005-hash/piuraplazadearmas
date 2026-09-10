import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

/**
 * ÚNICO lugar para configurar el dominio público del sitio.
 * Cuando se compre el dominio, rellena únicamente la constante `site` de abajo.
 * Déjalo vacío durante desarrollo; el build seguirá funcionando sin URLs ficticias.
 */
const site = '';

export default defineConfig({
  site: site || undefined,
  output: 'static',
  integrations: site ? [sitemap()] : [],
  vite: {
    plugins: [tailwindcss()],
  },
});
