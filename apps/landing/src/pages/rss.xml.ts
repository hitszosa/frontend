import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getUpdates } from '../lib/updates';

export const GET: APIRoute = async ({ site }) => {
  const updates = (await getUpdates()).sort(
    (a, b) => b.date.getTime() - a.date.getTime(),
  );
  return rss({
    title: 'HITSZ OSA 动态',
    description: '哈尔滨工业大学（深圳）开源技术协会的公告、活动与技术文章。',
    site: site ?? 'https://www.osa.moe',
    items: updates.map((entry) => ({
      title: entry.title,
      description: entry.summary,
      pubDate: entry.date,
      link: entry.href,
      categories: [entry.label],
    })),
    customData: '<language>zh-CN</language>',
  });
};
