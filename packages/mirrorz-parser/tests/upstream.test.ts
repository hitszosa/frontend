import { expect, test } from 'bun:test'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { compile as compileMdx } from '@mdx-js/mdx'

import { compileMirrorzPage, loadMirrorzPageSource } from '../src/index'

type RouteRecord = Record<string, { cname: string }>

const packageDir = path.dirname(fileURLToPath(import.meta.url))
const upstreamDir = path.resolve(packageDir, '../../../vendor/mirrorz-help')

test('compiles every route from the pinned upstream mirrorz-help fixture', async () => {
  const routes = JSON.parse(
    await readFile(path.join(upstreamDir, 'src/routes.json'), 'utf8'),
  ) as RouteRecord
  const pageIds = [
    ...new Set(Object.values(routes).map((route) => route.cname)),
  ]

  const pages = await Promise.all(
    pageIds.map(async (pageId) => {
      const source = await loadMirrorzPageSource({
        docsDir: path.join(upstreamDir, 'zdoc'),
        pageId,
      })
      return { pageId, page: await compileMirrorzPage(source) }
    }),
  )

  expect(pages).toHaveLength(pageIds.length)
  expect(pages).toHaveLength(157)
  for (const { pageId, page } of pages) {
    expect(page.meta.title.length).toBeGreaterThan(0)
    expect(page.mdx.length).toBeGreaterThan(0)
    try {
      await compileMdx(page.mdx)
    } catch (error) {
      throw new Error(`Generated invalid MDX for ${pageId}`, { cause: error })
    }
  }
}, 30_000)
