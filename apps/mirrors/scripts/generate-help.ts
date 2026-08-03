import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  compileMirrorzPage,
  loadMirrorzPageSource,
} from '@hitszosa/mirrorz-parser'

interface UpstreamRoute {
  cname: string
  title: string
  fullTitle: string
  file: string
}

interface GeneratedRoute extends UpstreamRoute {
  slug: string
}

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const monorepoDir = path.resolve(appDir, '../..')
const upstreamDir = path.join(monorepoDir, 'vendor/mirrorz-help')
const docsDir = path.join(upstreamDir, 'zdoc')
const localDocsDir = path.join(monorepoDir, 'content/mirrors/help-overrides')
const outputDir = path.join(appDir, 'generated/help')
const legacyOutputDir = path.join(appDir, 'src/generated/help')
const pagesDir = path.join(outputDir, 'pages')
const upstreamRoutes = JSON.parse(
  await readFile(path.join(upstreamDir, 'src/routes.json'), 'utf8'),
) as Record<string, UpstreamRoute>

const overrideEntries = await readdir(localDocsDir, {
  withFileTypes: true,
}).catch((error: unknown) => {
  if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
    return []
  }
  throw error
})
const overridePageIds = overrideEntries
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
const upstreamPageIds = new Set(
  Object.values(upstreamRoutes).map((route) => route.cname),
)
const addedPageIds = overridePageIds.filter(
  (pageId) => !upstreamPageIds.has(pageId),
)
const baseRoutes: GeneratedRoute[] = [
  ...Object.entries(upstreamRoutes).map(([route, value]) => ({
    ...value,
    slug: route.replace(/^\/+|\/+$/g, ''),
  })),
  ...addedPageIds.map((pageId) => ({
    cname: pageId,
    title: pageId,
    fullTitle: `${pageId} 镜像使用帮助`,
    file: `${pageId}.mdx`,
    slug: pageId,
  })),
]
const pageIds = [...new Set(baseRoutes.map((route) => route.cname))]
const routeSlugs = new Set(baseRoutes.map((route) => route.slug))

await rm(outputDir, { recursive: true, force: true })
await rm(legacyOutputDir, { recursive: true, force: true })
await mkdir(pagesDir, { recursive: true })

const pages = Object.fromEntries(
  await Promise.all(
    pageIds.map(async (pageId) => {
      if (!/^[\w.+-]+$/i.test(pageId)) {
        throw new Error(`Unsafe mirrorz page ID: ${pageId}`)
      }

      const source = await loadMirrorzPageSource({
        docsDir,
        localDocsDir,
        pageId,
      })
      const compiled = await compileMirrorzPage(source)
      const imports = [
        "import CodeBlock from '@components/help/mdx/CodeBlock.astro'",
        "import CodeInline from '@components/help/mdx/CodeInline.astro'",
        "import GlobalMenu from '@components/help/mdx/GlobalMenu.astro'",
        "import SyntaxHighlight from '@components/help/mdx/SyntaxHighlight.astro'",
      ].join('\n')
      const pageAwareMdx = compiled.mdx
        .replaceAll(
          '<CodeBlock ',
          `<CodeBlock pageId=${JSON.stringify(pageId)} `,
        )
        .replaceAll(
          '<CodeInline ',
          `<CodeInline pageId=${JSON.stringify(pageId)} `,
        )
        .replaceAll(
          '<GlobalMenu ',
          `<GlobalMenu pageId=${JSON.stringify(pageId)} `,
        )
        .replaceAll(/\]\(\/(?<slug>[\w.+-]+)\/\)/g, (match, _slug, groups) =>
          groups?.slug && routeSlugs.has(groups.slug)
            ? `](/help/${groups.slug}/)`
            : match,
        )

      await writeFile(
        path.join(pagesDir, `${pageId}.mdx`),
        `${imports}\n\n${pageAwareMdx}\n`,
      )

      return [
        pageId,
        {
          meta: compiled.meta,
          templates: compiled.templates,
          globalVariables: compiled.globalVariables,
          toc: compiled.toc,
          internalLinks: compiled.internalLinks,
        },
      ]
    }),
  ),
)

const generatedRoutes = baseRoutes.map((route) => {
  const title = pages[route.cname].meta.title
  return {
    ...route,
    title,
    fullTitle: `${title}镜像使用帮助`,
    file: `${route.cname}.mdx`,
  }
})
const manifest = {
  generatedAt: new Date().toISOString(),
  routes: generatedRoutes,
  pages,
}
await writeFile(
  path.join(outputDir, 'manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
)
await writeFile(
  path.join(outputDir, 'help-list.json'),
  `${JSON.stringify(pageIds, null, 2)}\n`,
)

console.log(
  `Generated ${pageIds.length} MirrorZ MDX pages for ${generatedRoutes.length} routes with ${overridePageIds.length} local override(s).`,
)
