import mdx from '@astrojs/mdx'
import vue from '@astrojs/vue'
import { defineConfig } from 'astro/config'
import icon from 'astro-icon'
import mockDataIntegration from './scripts/mock-data-integration.mjs'

const mockValue = process.env.MOCK
if (mockValue !== undefined && mockValue !== 'true' && mockValue !== 'false') {
  throw new Error('MOCK must be either true or false')
}
const useMockData = mockValue === 'true'

export default defineConfig({
  integrations: [
    mdx(),
    vue({
      appEntrypoint: '/src/vue/setup',
    }),
    icon({
      include: {
        mdi: ['*'],
        'icon-park-outline': ['*'],
      },
    }),
    ...(useMockData ? [mockDataIntegration()] : []),
  ],
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  experimental: {
    clientPrerender: true,
  },
  vite: {
    define: {
      'import.meta.env.PUBLIC_MOCK': JSON.stringify(useMockData),
    },
  },
})
