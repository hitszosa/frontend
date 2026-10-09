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

const seriesBase = useMockContent
  ? './examples/content/series'
  : '../../content/series';

const associations = {
  series: z.string().min(1).optional(),
  event: z.string().min(1).optional(),
};

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
      series: associations.series,
      report: z.string().min(1).optional(),
      resources: z
        .array(
          z.object({
            label: z.string().min(1),
            href: z
              .string()
              .refine(
                (value) =>
                  /^https?:\/\//.test(value) || /^\/(?!\/)/.test(value),
                'Use an HTTP(S) URL or an absolute site path',
              ),
          }),
        )
        .default([]),
      location: z.string().default(''),
      type: z
        .enum(['讲座', '沙龙', '比赛', '团建', '例会', '招新', '其他'])
        .default('其他'),
      summary: z.string(),
      hide: z.boolean().default(false),
      pinned: z.boolean().default(false),
      importance: z.enum(['normal', 'important']).default('important'),
      status: z.enum(['未开始', '进行中', '已结束']).default('未开始'),
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
      importance: z.enum(['normal', 'important']).default('important'),
      ...associations,
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
      ...associations,
      expires: z.coerce.date().optional(),
      cover: z.union([z.url(), z.string().startsWith('/'), image()]).optional(),
      coverAlt: z.string().optional(),
    }),
});

const series = defineCollection({
  loader: selectedContent(seriesBase, '**/[^_]*.{md,mdx}'),
  schema: z
    .object({
      title: z.string(),
      summary: z.string(),
      start: z.coerce.date(),
      end: z.coerce.date().optional(),
      status: z.enum(['未开始', '进行中', '已结束']).default('未开始'),
      tags: z.array(z.string()).default([]),
      hide: z.boolean().default(false),
    })
    .refine((data) => !data.end || data.end >= data.start, {
      message: 'Series end must not precede start',
      path: ['end'],
    }),
});

export const collections = {
  series,
  services,
  events,
  articles,
  friendLinks,
  members,
  announcements,
};
