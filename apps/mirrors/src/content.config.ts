import { defineCollection } from 'astro:content'
import { z } from 'astro/zod'
import { glob } from 'astro/loaders'

const news = defineCollection({
  loader: glob({
    pattern: '**/[^_]*.{md,mdx}',
    base: '../../content/announcements',
  }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    level: z.enum(['info', 'warn']).default('info'),
    pinned: z.boolean().default(false),
    importance: z.enum(['normal', 'important']).default('normal'),
    expires: z.coerce.date().optional(),
    cover: z.string().optional(),
    coverAlt: z.string().optional(),
  }),
})

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
  }),
})

export const collections = { news, pages }
