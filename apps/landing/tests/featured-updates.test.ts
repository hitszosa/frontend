import { deepStrictEqual } from 'node:assert';
import { test } from 'node:test';
import { selectFeaturedUpdates } from '../src/lib/featured-updates';
import type { UpdateEntry } from '../src/lib/updates';

test('pinned overview, upcoming lecture and completed report occupy the three featured slots', () => {
  const base: UpdateEntry = {
    id: 'first', kind: 'event', label: '活动', title: 'First lecture report', summary: 'Report',
    date: new Date('2026-10-17'), href: '/series/linux101/26/01/',
    pinned: false, importance: 'important', warning: false, status: '已结束', tags: [],
  };
  const overview: UpdateEntry = { ...base, id: 'overview', kind: 'series', label: '系列', pinned: true, importance: 'normal', date: new Date('2026-10-11'), status: undefined };
  const upcoming: UpdateEntry = { ...base, id: 'second', date: new Date('2026-10-24'), status: '未开始' };
  const older: UpdateEntry = { ...base, id: 'older', kind: 'article', label: '文章', date: new Date('2026-09-27') };
  const ordinary: UpdateEntry = { ...base, id: 'ordinary', importance: 'normal', date: new Date('2026-11-01') };
  const input = [older, base, ordinary, upcoming, overview];
  deepStrictEqual(selectFeaturedUpdates(input).map(e => e.id), ['overview', 'second', 'first']);
  deepStrictEqual(input.map(e => e.id), ['older', 'first', 'ordinary', 'second', 'overview']);
  deepStrictEqual(selectFeaturedUpdates([ordinary]), []);
});
