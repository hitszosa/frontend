import { deepStrictEqual, strictEqual } from 'node:assert';
import { test } from 'node:test';
import { groupUpdates, resolveSeries, type SeriesEntry } from '../src/lib/series-model';
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
