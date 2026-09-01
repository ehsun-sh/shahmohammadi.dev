// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://shahmohammadi.dev',
  // Custom domain via public/CNAME, so the site is served from the root.
  // Do not change this to a repo subpath.
  base: '/',
  output: 'static',
  // `always`, and it is not a preference — it is making the site agree with
  // itself. Astro's default `directory` build emits /projects/index.html, so
  // the canonical tags and the sitemap have always said `/projects/`, while
  // every hand-written link said `/projects`. `ignore` let those two disagree
  // in silence: the host resolved it with a 307 to the slashed form, so every
  // internal navigation on the site paid a redirect and every canonical pointed
  // at a URL other than the one being linked.
  //
  // `always` makes the dev server refuse the unslashed form, which turns that
  // from something you measure on a deployment into something that fails the
  // moment you write the link.
  trailingSlash: 'always',
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
