import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const base = process.env.PUBLIC_BASE || '/master-website/';
const site = process.env.PUBLIC_SITE || 'http://localhost:4321';

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
