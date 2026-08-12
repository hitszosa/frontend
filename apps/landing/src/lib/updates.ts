import { getCollection } from 'astro:content';
import { type ContentImageSource, contentPath } from './content';

export type UpdateKind = 'announcement' | 'event' | 'article';

export interface UpdateEntry {
  kind: UpdateKind;
  label: '公告' | '活动' | '文章';
  title: string;
  summary: string;
  date: Date;
  href: string;
  pinned: boolean;
  importance: 'normal' | 'important';
  warning: boolean;
  upcoming: boolean;
  tags: string[];
  meta?: string;
  cover?: ContentImageSource;
  coverAlt?: string;
}

export async function getUpdates(now = new Date()): Promise<UpdateEntry[]> {
  const [announcements, events, articles] = await Promise.all([
    getCollection('announcements', ({ data }) => !data.hide),
    getCollection('events', ({ data }) => !data.hide),
    getCollection('articles', ({ data }) => !data.hide),
  ]);

  return [
    ...announcements
      .filter((entry) => !entry.data.expires || entry.data.expires > now)
      .map((entry) => ({
        kind: 'announcement' as const,
        label: '公告' as const,
        title: entry.data.title,
        summary: entry.data.summary,
        date: entry.data.date,
        href: `/announcements/${contentPath(entry.id)}/`,
        pinned: entry.data.pinned,
        importance: entry.data.importance,
        warning: entry.data.level === 'warn',
        upcoming: false,
        tags: entry.data.tags,
        cover: entry.data.cover,
        coverAlt: entry.data.coverAlt,
      })),
    ...events.map((entry) => ({
      kind: 'event' as const,
      label: '活动' as const,
      title: entry.data.title,
      summary: entry.data.summary,
      date: entry.data.date,
      href: `/events/${contentPath(entry.id)}/`,
      pinned: entry.data.pinned,
      importance: entry.data.importance,
      warning: false,
      upcoming: entry.data.upcoming,
      tags: [],
      meta: entry.data.type,
      cover: entry.data.cover,
      coverAlt: entry.data.coverAlt,
    })),
    ...articles.map((entry) => ({
      kind: 'article' as const,
      label: '文章' as const,
      title: entry.data.title,
      summary: entry.data.summary,
      date: entry.data.date,
      href: `/articles/${contentPath(entry.id)}/`,
      pinned: entry.data.pinned,
      importance: entry.data.importance,
      warning: false,
      upcoming: false,
      tags: [],
      meta: entry.data.author,
      cover: entry.data.cover,
      coverAlt: entry.data.coverAlt,
    })),
  ].sort(
    (a, b) =>
      Number(b.pinned) - Number(a.pinned) ||
      b.date.getTime() - a.date.getTime(),
  );
}
