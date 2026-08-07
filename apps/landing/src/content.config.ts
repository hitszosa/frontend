import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const mockValue = process.env.MOCK;
if (mockValue !== undefined && mockValue !== 'true' && mockValue !== 'false') {
  throw new Error('MOCK must be either true or false');
}
const useMockContent = mockValue === 'true';
const eventsBase = useMockContent
  ? './examples/content/events'
  : '../../content/events';
const announcementsBase = useMockContent
  ? './examples/content/announcements'
  : '../../content/announcements';
const articlesBase = useMockContent
  ? './examples/content/articles'
  : '../../content/articles';

const selectedContent = (base: string, pattern: string) => {
  const loader = glob({ base, pattern });

  return {
    ...loader,
    name: `selected-content:${base}`,
    async load(context: Parameters<typeof loader.load>[0]) {
      context.store.clear();
      await loader.load(context);
    },
  };
};

const services = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: '../../content/services' }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    href: z.string(),
    order: z.number().default(99),
    category: z.enum(['service', 'project']).default('service'),
    featured: z.boolean().default(false),
    hide: z.boolean().default(false),
    scope: z.enum(['public', 'campus']).default('public'),
    status: z
      .enum(['online', 'beta', 'maintaining', 'active', 'developing'])
      .default('online'),
    since: z.coerce.date().optional(),
  }),
});

const events = defineCollection({
  loader: selectedContent(eventsBase, '**/[^_]*.{md,mdx}'),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      endDate: z.coerce.date().optional(),
      location: z.string().default(''),
      type: z
        .enum(['讲座', '沙龙', '比赛', '团建', '例会', '其他'])
        .default('其他'),
      summary: z.string(),
      hide: z.boolean().default(false),
      pinned: z.boolean().default(false),
      importance: z.enum(['normal', 'important']).default('normal'),
      upcoming: z.boolean().default(false),
      cover: z.union([z.url(), z.string().startsWith('/'), image()]).optional(),
      coverAlt: z.string().optional(),
    }),
});

const articles = defineCollection({
  loader: selectedContent(articlesBase, '**/[^_]*.{md,mdx}'),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      date: z.coerce.date(),
      hide: z.boolean().default(false),
      pinned: z.boolean().default(false),
      importance: z.enum(['normal', 'important']).default('normal'),
      author: z.string().optional(),
      cover: z.union([z.url(), z.string().startsWith('/'), image()]).optional(),
      coverAlt: z.string().optional(),
    }),
});

const friendLinks = defineCollection({
  loader: glob({
    pattern: '**/[^_]*.yaml',
    base: '../../content/friend-links',
  }),
  schema: z.object({
    name: z.string(),
    href: z.string(),
    description: z.string().default(''),
    logo: z.string().min(1),
    order: z.number().default(99),
  }),
});

const memberProject = z.object({
  name: z.string(),
  description: z.string().default(''),
  href: z.url(),
  logo: z.string().min(1).optional(),
  type: z.enum(['project', 'website', 'other']).default('project'),
});

const members = defineCollection({
  loader: glob({
    pattern: '**/[^_]*.yaml',
    base: '../../content/members',
  }),
  schema: z.object({
    name: z.string(),
    github: z.string().optional(),
    image: z.string().min(1).optional(),
    order: z.number().default(100),
    projects: z.array(memberProject).default([]),
  }),
});

const announcements = defineCollection({
  loader: selectedContent(announcementsBase, '**/[^_]*.{md,mdx}'),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      tags: z.array(z.string()).default([]),
      level: z.enum(['info', 'warn']).default('info'),
      hide: z.boolean().default(false),
      pinned: z.boolean().default(false),
      importance: z.enum(['normal', 'important']).default('normal'),
      date: z.coerce.date(),
      expires: z.coerce.date().optional(),
      cover: z.union([z.url(), z.string().startsWith('/'), image()]).optional(),
      coverAlt: z.string().optional(),
    }),
});

export const collections = {
  services,
  events,
  articles,
  friendLinks,
  members,
  announcements,
};
