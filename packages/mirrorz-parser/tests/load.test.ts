import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { afterEach, describe, expect, test } from 'bun:test'

import { loadMirrorzPageSource } from '../src/index'

const tempDirectories: string[] = []

async function createFixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'mirrorz-parser-load-'))
  tempDirectories.push(root)
  const docsDir = path.join(root, 'zdoc')
  const localDocsDir = path.join(root, 'overrides')
  return { docsDir, localDocsDir }
}

afterEach(async () => {
  await Promise.all(
    tempDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  )
})

describe('loadMirrorzPageSource local overrides', () => {
  test('overrides upstream config and blocks from a separate directory', async () => {
    const { docsDir, localDocsDir } = await createFixture()
    const globalPage = path.join(docsDir, 'global', 'ubuntu')
    const localPage = path.join(localDocsDir, 'ubuntu')
    await Promise.all([
      mkdir(globalPage, { recursive: true }),
      mkdir(localPage, { recursive: true }),
    ])
    await Promise.all([
      writeFile(
        path.join(globalPage, 'zh.yaml'),
        '_: Global title\nblock:\n  - usage\ninput:\n  release:\n    _: Release\n    default: stable\n',
      ),
      writeFile(path.join(globalPage, 'usage.zh.md'), 'upstream usage'),
      writeFile(path.join(localPage, 'zh.yaml'), '_: OSA title\n'),
      writeFile(path.join(localPage, 'usage.zh.md'), 'OSA usage'),
    ])

    const source = await loadMirrorzPageSource({
      docsDir,
      localDocsDir,
      pageId: 'ubuntu',
    })

    expect(source.config._).toBe('OSA title')
    expect(source.config.block).toEqual(['usage'])
    expect(source.config.input.release).toEqual({
      _: 'Release',
      default: 'stable',
    })
    expect(source.blocks).toEqual([
      {
        path: path.join(localPage, 'usage.zh.md'),
        content: 'OSA usage',
      },
    ])
  })

  test('loads a new page entirely from the separate local directory', async () => {
    const { docsDir, localDocsDir } = await createFixture()
    const localPage = path.join(localDocsDir, 'osa-only')
    await mkdir(localPage, { recursive: true })
    await Promise.all([
      writeFile(
        path.join(localPage, 'zh.yaml'),
        '_: OSA only\nblock:\n  - index\n',
      ),
      writeFile(path.join(localPage, 'index.zh.md'), '# OSA only'),
    ])

    const source = await loadMirrorzPageSource({
      docsDir,
      localDocsDir,
      pageId: 'osa-only',
    })

    expect(source.config.name).toBe('osa-only')
    expect(source.config._).toBe('OSA only')
    expect(source.blocks[0]?.content).toBe('# OSA only')
  })
})
