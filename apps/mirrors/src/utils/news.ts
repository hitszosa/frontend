import { getCollection, type CollectionEntry } from 'astro:content'
import type { ArticleDigest } from '../components/news/ArticleDigest'

const MIRRORS_TAG = '镜像站'

export const getMirrorNews = async (now = new Date()) =>
  getCollection(
    'news',
    ({ data }) =>
      !data.hide &&
      data.tags.includes(MIRRORS_TAG) &&
      (!data.expires || data.expires > now),
  )

export const toArticleDigest = (
  entry: CollectionEntry<'news'>,
): ArticleDigest => ({
  _path: `https://www.osa.moe/announcements/${entry.id}/`,
  title: entry.data.title,
  description: entry.data.summary,
  date: entry.data.date.toISOString(),
  tags: entry.data.tags,
})

export const sortNewsByDateDesc = (entries: CollectionEntry<'news'>[]) => {
  return [...entries].sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  )
}
