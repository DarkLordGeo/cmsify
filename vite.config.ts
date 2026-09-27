import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/** `--mode pages` builds only the website (src/site.tsx) for GitHub Pages, served under /cmsify/. */
function siteEntry(): Plugin {
  return {
    name: 'cmsify-site-entry',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) =>
        html
          .replace('/src/main.tsx', '/src/site.tsx')
          .replace('<title>CMSify</title>', '<title>CMSify — Turn your website into a CMS</title>'),
    },
  };
}

export default defineConfig(({ mode }) => ({
  base: mode === 'pages' ? '/cmsify/' : '/',
  plugins: [react(), mode === 'pages' && siteEntry()],
}));
