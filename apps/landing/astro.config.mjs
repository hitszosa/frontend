import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import remarkGfm from 'remark-gfm';

export default defineConfig({
  site: 'https://www.osa.moe',
  integrations: [mdx({ remarkPlugins: [remarkGfm] })],
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
