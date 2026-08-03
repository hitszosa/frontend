import rawManifest from '@generated/help/manifest.json'

import type { MenuValue, TocEntry } from '@hitszosa/mirrorz-parser'

export interface HelpRoute {
  title: string
  fullTitle: string
  file: string
  cname: string
  slug: string
}

export interface HelpPageData {
  meta: {
    title: string
    cname: string
  }
  templates: Record<string, string>
  globalVariables: Record<string, MenuValue>
  toc: TocEntry[]
  internalLinks: string[]
}

export interface HelpManifest {
  generatedAt: string
  routes: HelpRoute[]
  pages: Record<string, HelpPageData>
}

export const helpManifest = rawManifest as HelpManifest

export function getHelpPageData(pageId: string): HelpPageData {
  const page = helpManifest.pages[pageId]
  if (!page) {
    throw new Error(`Generated help data not found for ${pageId}`)
  }
  return page
}
