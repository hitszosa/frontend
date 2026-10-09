import { getCollection } from 'astro:content';
import { getSeriesData } from './series';
import { contentPath, type ContentImageSource } from './content';

export type UpdateKind = 'announcement' | 'event' | 'article';

export type EventStatus = '未开始' | '进行中' | '已结束';

export const EVENT_STATUS_TONE: Record<
  EventStatus,
  'warning' | 'success' | 'muted'
> = {
  未开始: 'warning',
  进行中: 'success',
  已结束: 'muted',
};

export interface UpdateEntry {
  id: string;
  series?: string;
  kind: UpdateKind;
  label: '公告' | '活动' | '文章';
  title: string;
  summary: string;
  date: Date;
  href: string;
  pinned: boolean;
  importance: 'normal' | 'important';
  warning: boolean;
  status?: EventStatus;
  tags: string[];
  meta?: string;
  cover?: ContentImageSource;
  coverAlt?: string;
}

export async function getUpdates(now = new Date()): Promise<UpdateEntry[]> {
  const [announcements, events, articles, seriesData] = await Promise.all([
    getCollection('announcements', ({ data }) => !data.hide),
    getCollection('events', ({ data }) => !data.hide),
    getCollection('articles', ({ data }) => !data.hide),
    getSeriesData(),
  ]);

  return [
    ...announcements
      .filter((entry) => !entry.data.expires || entry.data.expires > now)
      .map((entry) => ({
        id: entry.id,
        series: seriesData.membership.get(`announcements/${entry.id}`),
        kind: 'announcement' as const,
        label: '公告' as const,
        title: entry.data.title,
        summary: entry.data.summary,
        date: entry.data.date,
        href: `/announcements/${contentPath(entry.id)}/`,
        pinned: entry.data.pinned,
        importance: entry.data.importance,
        warning: entry.data.level === 'warn',
        status: undefined,
        tags: entry.data.tags,
        cover: entry.data.cover,
        coverAlt: entry.data.coverAlt,
      })),
    ...events.map((entry) => ({
      id: entry.id,
      series: seriesData.membership.get(`events/${entry.id}`),
      kind: 'event' as const,
      label: '活动' as const,
      title: entry.data.title,
      summary: entry.data.summary,
      date: entry.data.date,
      href: `/events/${contentPath(entry.id)}/`,
      pinned: entry.data.pinned,
      importance: entry.data.importance,
      warning: false,
      status: entry.data.status,
      tags: [],
      meta: entry.data.type,
      cover: entry.data.cover,
      coverAlt: entry.data.coverAlt,
    })),
    ...articles.map((entry) => ({
      id: entry.id,
      series: seriesData.membership.get(`articles/${entry.id}`),
      kind: 'article' as const,
      label: '文章' as const,
      title: entry.data.title,
      summary: entry.data.summary,
      date: entry.data.date,
      href: `/articles/${contentPath(entry.id)}/`,
      pinned: entry.data.pinned,
      importance: entry.data.importance,
      warning: false,
      status: undefined,
      tags: [],
      meta: `@${entry.data.author}`,
      cover: entry.data.cover,
      coverAlt: entry.data.coverAlt,
    })),
  ].sort(
    (a, b) =>
      Number(b.pinned) - Number(a.pinned) ||
      b.date.getTime() - a.date.getTime(),
  );
}
