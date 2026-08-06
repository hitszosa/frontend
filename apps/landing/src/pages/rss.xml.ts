import type { APIRoute } from 'astro';
import { getUpdates } from '../lib/updates';

const xmlEntities: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

const escapeXml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => xmlEntities[character] ?? character);

export const GET: APIRoute = async ({ site }) => {
  const updates = (await getUpdates()).sort(
    (a, b) => b.date.getTime() - a.date.getTime(),
  );
  const origin = site ?? new URL('https://www.osa.moe');
  const feedUrl = new URL('/rss.xml', origin).toString();
  const items = updates
    .map((entry) => {
      const link = new URL(entry.href, origin).toString();
      return `
    <item>
      <title>${escapeXml(entry.title)}</title>
      <description>${escapeXml(entry.summary)}</description>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${entry.date.toUTCString()}</pubDate>
      <category>${escapeXml(entry.label)}</category>
    </item>`;
    })
    .join('');
  const lastBuildDate = (updates[0]?.date ?? new Date()).toUTCString();

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>HITSZ OSA 动态</title>
    <description>哈尔滨工业大学（深圳）开源技术协会的公告、活动与技术文章。</description>
    <link>${escapeXml(origin.toString())}</link>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
    <language>zh-CN</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>${items}
  </channel>
</rss>
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=900',
    },
  });
};
