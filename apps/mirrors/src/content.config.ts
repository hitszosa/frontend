import { defineCollection } from 'astro:content'
import { z } from 'astro/zod'
import { glob } from 'astro/loaders'

const news = defineCollection({
  loader: glob({
    pattern: '**/[^_]*.{md,mdx}',
    base: '../../content/announcements',
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      date: z.coerce.date(),
      tags: z.array(z.string()).default([]),
      level: z.enum(['info', 'warn']).default('info'),
      hide: z.boolean().default(false),
      pinned: z.boolean().default(false),
      importance: z.enum(['normal', 'important']).default('normal'),
      expires: z.coerce.date().optional(),
      cover: z.union([z.url(), z.string().startsWith('/'), image()]).optional(),
      coverAlt: z.string().optional(),
    }),
})

export const collections = { news }
