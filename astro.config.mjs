import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://www.osa.moe',
  vite: {
    plugins: [tailwindcss()],
  },
});
