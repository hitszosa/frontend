import { getCollection } from 'astro:content';
import { resolveSeries } from './series-model';
export * from './series-model';

export const getSeriesData = async () => {
  const [series, events, articles, announcements] = await Promise.all([
    getCollection('series'),
    getCollection('events'),
    getCollection('articles'),
    getCollection('announcements'),
  ]);
  return resolveSeries({ series, events, articles, announcements });
};
