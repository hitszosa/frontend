import type { CollectionEntry } from 'astro:content';
import { contentPath } from './content';
import type { UpdateEntry } from './updates';

export type SeriesEntry = CollectionEntry<'series'>;
export type EventEntry = CollectionEntry<'events'>;
export type RelatedEntry =
  | CollectionEntry<'articles'>
  | CollectionEntry<'announcements'>;

export const entryHref = (entry: SeriesEntry | EventEntry | RelatedEntry) =>
  `/${entry.collection}/${contentPath(entry.id)}/`;
export const formatSeriesDate = (date: Date) =>
  new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);

// Validate all entries, including hidden content, before exposing public links.
export const resolveSeries = (collections: {
  series: SeriesEntry[];
  events: EventEntry[];
  articles: CollectionEntry<'articles'>[];
  announcements: CollectionEntry<'announcements'>[];
}) => {
  const seriesById = new Map(
    collections.series.map((entry) => [entry.id, entry]),
  );
  const eventsById = new Map(
    collections.events.map((entry) => [entry.id, entry]),
  );
  const articlesById = new Map(
    collections.articles.map((entry) => [entry.id, entry]),
  );
  const requireTarget = <T>(
    map: Map<string, T>,
    id: string,
    source: string,
  ): T => {
    const target = map.get(id);
    if (!target) throw new Error(`${source}: missing reference "${id}"`);
    return target;
  };
  for (const entry of collections.series) {
    if (entry.data.end && entry.data.end < entry.data.start)
      throw new Error(`series/${entry.id}: end precedes start`);
  }
  for (const event of collections.events) {
    if (event.data.series)
      requireTarget(seriesById, event.data.series, `events/${event.id}`);
  }
  const membership = new Map<string, string | undefined>();
  for (const entry of [...collections.articles, ...collections.announcements]) {
    const source = `${entry.collection}/${entry.id}`;
    const event = entry.data.event
      ? requireTarget(eventsById, entry.data.event, source)
      : undefined;
    if (entry.data.series) requireTarget(seriesById, entry.data.series, source);
    if (entry.data.series && event && entry.data.series !== event.data.series)
      throw new Error(`${source}: series does not match event`);
    membership.set(source, entry.data.series ?? event?.data.series);
  }
  for (const event of collections.events) {
    membership.set(`events/${event.id}`, event.data.series);
    if (!event.data.report) continue;
    const report = requireTarget(
      articlesById,
      event.data.report,
      `events/${event.id}`,
    );
    if (report.data.event && report.data.event !== event.id)
      throw new Error(`events/${event.id}: report belongs to another event`);
    const reportSeries = membership.get(`articles/${report.id}`);
    if (reportSeries && reportSeries !== event.data.series)
      throw new Error(`events/${event.id}: report belongs to another series`);
  }
  const publicSeries = (id?: string) => {
    const entry = id ? seriesById.get(id) : undefined;
    return entry && !entry.data.hide ? entry : undefined;
  };
  const publicEvent = (id?: string) => {
    const entry = id ? eventsById.get(id) : undefined;
    return entry && !entry.data.hide ? entry : undefined;
  };
  const publicReport = (event: EventEntry) => {
    const entry = event.data.report
      ? articlesById.get(event.data.report)
      : undefined;
    return entry && !entry.data.hide ? entry : undefined;
  };
  const seriesFor = (entry: EventEntry | RelatedEntry) =>
    publicSeries(membership.get(`${entry.collection}/${entry.id}`));
  const scheduleFor = (id: string) =>
    collections.events
      .filter((entry) => !entry.data.hide && entry.data.series === id)
      .sort(
        (a, b) =>
          a.data.date.getTime() - b.data.date.getTime() ||
          a.id.localeCompare(b.id),
      );
  const relatedFor = (id: string, now = new Date()) => {
    const usedReports = new Set(
      scheduleFor(id)
        .filter((event) => event.data.status === '已结束')
        .map((event) => publicReport(event)?.id)
        .filter(Boolean),
    );
    return [...collections.articles, ...collections.announcements]
      .filter(
        (entry) =>
          !entry.data.hide &&
          membership.get(`${entry.collection}/${entry.id}`) === id,
      )
      .filter(
        (entry) =>
          entry.collection !== 'announcements' ||
          !entry.data.expires ||
          entry.data.expires > now,
      )
      .filter(
        (entry) =>
          entry.collection !== 'articles' || !usedReports.has(entry.id),
      )
      .sort(
        (a, b) =>
          Number(b.data.pinned) - Number(a.data.pinned) ||
          b.data.date.getTime() - a.data.date.getTime() ||
          a.id.localeCompare(b.id),
      );
  };
  return {
    membership,
    publicSeries,
    publicEvent,
    publicReport,
    seriesFor,
    scheduleFor,
    relatedFor,
    series: collections.series.filter((entry) => !entry.data.hide),
  };
};

export type UpdateGroup =
  | {
      kind: 'entry';
      entry: UpdateEntry;
      date: Date;
      pinned: boolean;
      key: string;
    }
  | {
      kind: 'series';
      series: SeriesEntry;
      entries: UpdateEntry[];
      date: Date;
      pinned: boolean;
      key: string;
    };

export const groupUpdates = (
  updates: UpdateEntry[],
  data: ReturnType<typeof resolveSeries>,
): UpdateGroup[] => {
  const groups = new Map<string, UpdateGroup>();
  for (const entry of updates) {
    const series = data.publicSeries(entry.series);
    const key = series ? `series/${series.id}` : `${entry.kind}/${entry.id}`;
    const group = groups.get(key);
    if (group?.kind === 'series') {
      group.entries.push(entry);
      group.pinned ||= entry.pinned;
      if (entry.date > group.date) group.date = entry.date;
    } else if (series) {
      groups.set(key, {
        kind: 'series',
        series,
        entries: [entry],
        date: entry.date,
        pinned: entry.pinned,
        key,
      });
    } else {
      groups.set(key, {
        kind: 'entry',
        entry,
        date: entry.date,
        pinned: entry.pinned,
        key,
      });
    }
  }
  const compare = (
    a: { pinned: boolean; date: Date },
    b: { pinned: boolean; date: Date },
  ) =>
    Number(b.pinned) - Number(a.pinned) || b.date.getTime() - a.date.getTime();
  for (const group of groups.values())
    if (group.kind === 'series')
      group.entries.sort((a, b) => compare(a, b) || a.id.localeCompare(b.id));
  return [...groups.values()].sort(
    (a, b) => compare(a, b) || a.key.localeCompare(b.key),
  );
};
