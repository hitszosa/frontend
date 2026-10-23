import type { UpdateEntry } from './updates';

export const selectFeaturedUpdates = (updates: UpdateEntry[]) =>
  updates
    .filter((entry) => entry.pinned || entry.importance === 'important')
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.date.getTime() - a.date.getTime())
    .slice(0, 3);
