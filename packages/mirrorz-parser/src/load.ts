import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { parse as parseYaml } from 'yaml'

import { mergeConfig } from './config'
import type {
  CompileMirrorzPageOptions,
  LoadMirrorzPageOptions,
  SourceBlock,
  ZDocConfigOnDisk,
} from './types'

async function readPreferredFile(
  docsDir: string,
  localDocsDir: string,
  pageId: string,
  filename: string,
  fallback?: string,
): Promise<SourceBlock> {
  const candidates = [
    path.join(localDocsDir, pageId, filename),
    path.join(docsDir, 'global', pageId, filename),
  ]
  for (const candidate of candidates) {
    try {
      return { path: candidate, content: await readFile(candidate, 'utf8') }
    } catch (error) {
      if (
        !(error instanceof Error) ||
        !('code' in error) ||
        error.code !== 'ENOENT'
      ) {
        throw error
      }
    }
  }

  if (fallback !== undefined) {
    return { path: null, content: fallback }
  }
  throw new Error(`File ${filename} not found for page ${pageId}`)
}

export async function loadMirrorzPageSource({
  docsDir,
  localDocsDir = path.join(docsDir, 'local'),
  pageId,
  language = 'zh',
}: LoadMirrorzPageOptions): Promise<CompileMirrorzPageOptions> {
  const configFiles = [
    path.join(docsDir, 'global', pageId, `${language}.yaml`),
    path.join(localDocsDir, pageId, `${language}.yaml`),
  ]
  const configs = await Promise.all(
    configFiles.map(async (filename) => {
      try {
        return parseYaml(await readFile(filename, 'utf8')) as ZDocConfigOnDisk
      } catch (error) {
        if (
          error instanceof Error &&
          'code' in error &&
          error.code === 'ENOENT'
        ) {
          return undefined
        }
        throw error
      }
    }),
  )
  const [globalConfig, localConfig] = configs

  if (!globalConfig && !localConfig) {
    throw new Error(`Config ${language}.yaml not found for page ${pageId}`)
  }

  const config = mergeConfig(pageId, globalConfig ?? {}, localConfig)
  const blocks = await Promise.all(
    config.block.map((block) =>
      readPreferredFile(
        docsDir,
        localDocsDir,
        pageId,
        `${block}.${language}.md`,
        '',
      ),
    ),
  )

  return { pageId, config, blocks }
}
