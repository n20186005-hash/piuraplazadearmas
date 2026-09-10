import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

/**
 * ÚNICO lugar para configurar el dominio público del sitio.
 * Astro reutiliza este valor para el canonical, Open Graph, JSON-LD y el sitemap.
 */
const site = 'https://piuraplazadearmas.com';

export default defineConfig({
  site,
  output: 'static',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
