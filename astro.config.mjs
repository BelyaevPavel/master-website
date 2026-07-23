import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Переменные окружения доступны через import.meta.env
const base = import.meta.env.PUBLIC_BASE || '/';
const site = import.meta.env.PUBLIC_SITE || 'http://localhost:4321';

export default defineConfig({
  site: site,
  base: base,
  integrations: [sitemap()],
  output: 'static',
  build: {
    format: 'directory',
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          silenceDeprecations: [
            'mixed-decls',
            'color-functions',
            'global-builtin',
            'import',
            'if-function',
          ],
        },
      },
    },
  },
});
