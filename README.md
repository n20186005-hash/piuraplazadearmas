# Plaza de Armas Piura

Guía turística educativa independiente, no oficial y sin fines de lucro. Una página en español del Perú y una página compartida de error404, con el Astro estático, Tailwind y TypeScript originales. Sin servicio de reservas ni función meteorológica.

Versiones exactas: Node24.21.0, pnpm12.3.4 y las dependencias fijadas en package.json/pnpm-lock.yaml.

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm build
pnpm self-check
pnpm exec wrangler deploy --dry-run
```

La configuración predeterminada selecciona el proyecto piuraplazadearmas y src/worker.js antes de Static Assets. El origen canónico es https://piuraplazadearmas.com/. La comprobación de dominios y protocolos de producción es independiente de la compilación local.

El inventario MINCETUR3163, las páginas de los museos y el mapa se atribuyen según su alcance en el contenido. Cuatro fotografías históricas conservan sus autores/licencias y sus bytes locales; véase CREDITS.md y cada pie de foto. La privacidad y los controles existentes están en la página.
