import GithubSlugger from 'github-slugger'
import MarkdownIt from 'markdown-it'
import { mystPlugin } from 'markdown-it-myst'
import { gfmTableToMarkdown } from 'mdast-util-gfm-table'
import { mdxToMarkdown } from 'mdast-util-mdx'
import { toMarkdown } from 'mdast-util-to-markdown'
import { toString } from 'mdast-util-to-string'
import { tokensToMyst } from 'myst-parser'
import { visit, SKIP } from 'unist-util-visit'
import { VFile } from 'vfile'

import { createInitialState, transpileInputs } from './input'
import type {
  CompiledMirrorzPage,
  CompileMirrorzPageOptions,
  TocEntry,
} from './types'

type AstNode = {
  type: string
  name?: string
  value?: string
  depth?: number
  url?: string
  children?: AstNode[]
  options?: Record<string, unknown>
  attributes?: Array<Record<string, unknown>>
}

type AstParent = AstNode & { children: AstNode[] }

const customIdPattern = / {#(?<id>.+)}$/
const externalLinkPattern = /^(?:[a-z][a-z\d+.-]*:|\/\/)/i

function stringAttribute(name: string, value: string) {
  return {
    type: 'mdxJsxAttribute',
    name,
    value,
  }
}

function expressionAttribute(name: string, value: unknown) {
  return {
    type: 'mdxJsxAttribute',
    name,
    value: {
      type: 'mdxJsxAttributeValueExpression',
      value: JSON.stringify(value),
    },
  }
}

function parseMarkdown(content: string, path: string | null): AstNode {
  const markdown = MarkdownIt('commonmark').enable('table').use(mystPlugin)
  const tokens = markdown.parse(content, {
    vfile: new VFile(path ? { path } : undefined),
  })
  return tokensToMyst(content, tokens) as unknown as AstNode
}

export async function compileMirrorzPage({
  pageId,
  config,
  blocks,
}: CompileMirrorzPageOptions): Promise<CompiledMirrorzPage> {
  const templateIds = new Map<string, string>()
  const templates: Record<string, string> = {}
  const globalVariables: CompiledMirrorzPage['globalVariables'] = {}
  const toc: TocEntry[] = []
  const internalLinks: string[] = []
  const internalLinkSet = new Set<string>()
  const headingIds = new Set<string>()
  const slugger = new GithubSlugger()
  let nextGlobalMenuId = 0

  const registerTemplate = (source: string): string => {
    const existing = templateIds.get(source)
    if (existing !== undefined) {
      return existing
    }

    const id = `template-${templateIds.size}`
    templateIds.set(source, id)
    templates[id] = source
    return id
  }

  const compiledBlocks = blocks.map((block) => {
    const tree = parseMarkdown(block.content, block.path)

    visit(tree as never, 'html', (node: AstNode, index, parent) => {
      if (
        typeof index === 'number' &&
        parent &&
        node.value?.trim().startsWith('<!--')
      ) {
        ;(parent as unknown as AstParent).children.splice(index, 1)
        return [SKIP, index]
      }
      return undefined
    })

    visit(tree as never, 'link', (node: AstNode) => {
      const href = node.url
      if (
        href &&
        !href.startsWith('#') &&
        !externalLinkPattern.test(href) &&
        !internalLinkSet.has(href)
      ) {
        internalLinkSet.add(href)
        internalLinks.push(href)
      }
    })

    visit(tree as never, 'heading', (node: AstNode) => {
      const depth = node.depth
      if (depth === undefined || depth > 3) {
        return
      }

      const lastChild = node.children?.at(-1)
      const customIdMatch =
        lastChild?.type === 'text'
          ? customIdPattern.exec(lastChild.value ?? '')
          : null
      const content = customIdMatch
        ? toString(node as never).slice(0, customIdMatch.index)
        : toString(node as never)
      const id = customIdMatch?.groups?.id ?? slugger.slug(content)

      if (customIdMatch?.groups?.id) {
        const idSlugger = new GithubSlugger()
        if (id !== idSlugger.slug(id)) {
          throw new Error(`Invalid header ID: ${id}`)
        }
        if (lastChild?.value !== undefined) {
          lastChild.value = lastChild.value.slice(0, customIdMatch.index)
        }
      }

      if (headingIds.has(id)) {
        throw new Error(
          `Cannot have a duplicate header with id "${id}" on page ${pageId}`,
        )
      }
      headingIds.add(id)
      toc.push({ url: `#${id}`, content, depth })

      node.children?.unshift({
        type: 'mdxJsxTextElement',
        name: 'a',
        attributes: [stringAttribute('id', id)],
        children: [],
      })
    })

    visit(
      tree as never,
      ['mystDirectiveError', 'mystRoleError'],
      (node: AstNode) => {
        throw new Error(
          `${node.type} on page ${pageId}${block.path ? ` in ${block.path}` : ''}`,
        )
      },
    )

    visit(tree as never, ['mystDirective', 'mystRole'], (node: AstNode) => {
      if (node.name !== 'ztmpl') {
        throw new Error(
          `Unsupported ${node.type} ${node.name} on page ${pageId}${block.path ? ` in ${block.path}` : ''}`,
        )
      }

      const isRole = node.type === 'mystRole'
      const options: Record<string, unknown> = isRole
        ? Object.fromEntries(
            (node.children ?? [])
              .filter((child) => child.type === 'mystOption' && child.name)
              .map((child) => [child.name as string, child.value]),
          )
        : (node.options ?? {})
      const menus = transpileInputs(
        typeof options.input === 'string' ? options.input : null,
        config.input,
      )
      if (typeof menus === 'string') {
        throw new TypeError(
          `Input ${menus} is not defined on page ${pageId}${block.path ? ` in ${block.path}` : ''}`,
        )
      }

      if (options.global) {
        if (!options.input) {
          throw new Error(`Global directive must have inputs on page ${pageId}`)
        }
        const id = `globalMenu-${nextGlobalMenuId++}`
        globalVariables[id] = createInitialState(menus)
        node.type = 'mdxJsxFlowElement'
        node.name = 'GlobalMenu'
        node.attributes = [
          expressionAttribute('menus', menus),
          stringAttribute('id', id),
        ]
        node.children = []
        return
      }

      const source = node.value ?? ''
      const component = isRole ? 'CodeInline' : 'CodeBlock'
      const templateId = registerTemplate(source)
      const attributes: Array<Record<string, unknown>> = [
        expressionAttribute('menus', menus),
        stringAttribute('templateId', templateId),
      ]

      if (typeof options.lang === 'string') {
        attributes.push(stringAttribute('codeLanguage', options.lang))
      }
      if (component === 'CodeBlock' && typeof options.path === 'string') {
        attributes.push(stringAttribute('filepath', options.path))
        attributes.push(expressionAttribute('enableQuickSetup', true))
      }
      if (component === 'CodeBlock' && options.append) {
        attributes.push(expressionAttribute('append', true))
      }

      node.type =
        component === 'CodeInline' ? 'mdxJsxTextElement' : 'mdxJsxFlowElement'
      node.name = component
      node.attributes = attributes
      node.children = []
    })

    visit(tree as never, 'code', (node: AstNode, index, parent) => {
      if (typeof index !== 'number' || !parent) {
        return
      }

      const attributes: Array<Record<string, unknown>> = [
        stringAttribute('code', node.value ?? ''),
      ]
      const language = (node as AstNode & { lang?: string }).lang
      const meta = (node as AstNode & { meta?: string }).meta
      if (language) {
        attributes.push(stringAttribute('language', language))
      }
      if (meta) {
        attributes.push(stringAttribute('meta', meta))
      }

      ;(parent as unknown as AstParent).children[index] = {
        type: 'mdxJsxFlowElement',
        name: 'SyntaxHighlight',
        attributes,
        children: [],
      }
      return [SKIP, index]
    })

    return toMarkdown(tree as never, {
      extensions: [mdxToMarkdown(), gfmTableToMarkdown()],
    })
  })

  if (toc.length > 0) {
    toc.unshift({ url: '#', content: 'Overview', depth: 2 })
  }

  return {
    meta: { title: config._, cname: pageId },
    mdx: compiledBlocks.join('\n\n'),
    templates,
    globalVariables,
    toc,
    internalLinks,
  }
}
