import { deepStrictEqual, strictEqual, throws } from 'node:assert';
import { test } from 'node:test';
import { entryHref, groupUpdates, resolveSeries, type SeriesEntry, type EventEntry } from '../src/lib/series-model';
import type { UpdateEntry } from '../src/lib/updates';

test('series introductions do not become branch nodes or suppress same-ID articles', () => {
  const series: SeriesEntry = {
    id: 'linux101',
    collection: 'series',
    data: {
      title: 'Linux 101',
      summary: 'Introduction',
      start: new Date('2026-10-11'),
      status: '未开始',
      tags: [],
      hide: false,
      pinned: false,
      importance: 'normal',
      hideCover: false,
    },
  };
  const intro: UpdateEntry = {
    id: series.id,
    kind: 'series',
    label: '系列',
    title: series.data.title,
    summary: series.data.summary,
    date: series.data.start,
    href: '/series/linux101/',
    pinned: false,
    importance: 'important',
    warning: false,
    tags: [],
  };
  const event: UpdateEntry = {
    ...intro, id: 'first', kind: 'event', label: '活动',
    series: series.id, href: '/events/first/', date: new Date('2026-10-17'),
  };
  const article: UpdateEntry = {
    ...intro, kind: 'article', label: '文章', href: '/articles/linux101/',
  };
  const data = resolveSeries({ series: [series], events: [], articles: [], announcements: [] });
  const groups = groupUpdates([intro, event, article], data);
  strictEqual(groups.length, 2);
  strictEqual(groups[0].kind, 'series');
  if (groups[0].kind === 'series') deepStrictEqual(groups[0].entries, [event]);
  strictEqual(groups[1].kind, 'entry');
  if (groups[1].kind === 'entry') deepStrictEqual(groups[1].entry, article);
  deepStrictEqual(groupUpdates([intro], data), []);
});

test('nested lessons keep series URLs, schedule order and membership without duplicate overviews', () => {
  const overview: SeriesEntry = {
    id: 'linux101/26', collection: 'series',
    data: { title: 'Linux101', summary: 'Overview', start: new Date('2026-10-11'), status: '进行中', tags: [], hide: false, pinned: false, importance: 'normal', hideCover: true },
  };
  const first: EventEntry = {
    id: 'linux101/26/01', collection: 'lessons',
    data: { title: 'First lecture', summary: 'Report', date: new Date('2026-10-17'), series: overview.id, status: '已结束', location: 'T3201', type: '讲座', resources: [], hide: false, pinned: false, importance: 'important' },
  };
  const second: EventEntry = { ...first, id: 'linux101/26/02', data: { ...first.data, title: 'Second lecture', date: new Date('2026-10-24'), status: '未开始' } };
  const hidden: EventEntry = { ...first, id: 'linux101/26/03', data: { ...first.data, hide: true } };
  const collections = { series: [overview], events: [second, hidden, first], articles: [], announcements: [] };
  const data = resolveSeries(collections);
  deepStrictEqual(data.scheduleFor(overview.id).map(e => e.id), [second.id, first.id]);
  strictEqual(data.seriesFor(first)?.id, overview.id);
  strictEqual(data.membership.get('lessons/linux101/26/02'), overview.id);
  deepStrictEqual(data.series.map(e => e.id), [overview.id]);
  deepStrictEqual(data.lessons.map(e => e.id), [second.id, first.id]);
  strictEqual(entryHref(first), '/series/linux101/26/01/');
  strictEqual(entryHref(overview), '/series/linux101/26/');
  strictEqual(entryHref({ ...first, collection: 'events' }), '/events/linux101/26/01/');
  strictEqual(data.publicEvent(hidden.id), undefined);
  throws(() => resolveSeries({ ...collections, series: [] }), /missing reference/);
});
