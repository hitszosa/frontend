import { describe, expect, test } from 'bun:test'

import { compileMirrorzPage, mergeConfig } from '../src/index'

function componentTag(mdx: string, component: string): string {
  const match = mdx.match(new RegExp(`<${component}\\b[^>]*>`))
  expect(match).not.toBeNull()
  return match?.[0] ?? ''
}

function expectStringProp(tag: string, name: string, value: string): void {
  const doubleQuoted = `${name}="${value}"`
  const singleQuoted = `${name}='${value}'`
  expect(tag.includes(doubleQuoted) || tag.includes(singleQuoted)).toBe(true)
}

describe('compileMirrorzPage', () => {
  test('converts a ztmpl block with local inputs and file options', async () => {
    const pageId = 'fixture-page'
    const template = 'deb {{endpoint}} {{suite}} main'
    const config = mergeConfig(pageId, {
      _: 'Fixture page',
      input: {
        release: {
          _: 'Release',
          default: 'stable',
          option: {
            testing: {
              _: 'Testing',
              suite: 'testing',
            },
            stable: {
              _: 'Stable',
              suite: 'bookworm',
            },
          },
        },
      },
    })

    const result = await compileMirrorzPage({
      pageId,
      config,
      blocks: [
        {
          path: 'usage.zh.md',
          content: [
            '```{ztmpl lang="bash" input="release" path="/etc/apt/sources.list" append="true"}',
            template,
            '```',
          ].join('\n'),
        },
      ],
    })

    expect(result.meta).toEqual({ title: 'Fixture page', cname: pageId })
    expect(result.templates).toEqual({ 'template-0': template })
    expect(result.globalVariables).toEqual({})

    const tag = componentTag(result.mdx, 'CodeBlock')
    expectStringProp(tag, 'templateId', 'template-0')
    expectStringProp(tag, 'codeLanguage', 'bash')
    expectStringProp(tag, 'filepath', '/etc/apt/sources.list')
    expect(tag).toContain('enableQuickSetup={true}')
    expect(tag).toContain('append={true}')
    expect(tag).toMatch(/"release"\s*:\s*"stable"/)
    expect(tag).toMatch(/"suite"\s*:\s*"bookworm"/)
  })

  test('converts an inline ztmpl role to CodeInline', async () => {
    const pageId = 'inline-page'
    const template = '{{endpoint}}/releases'
    const config = mergeConfig(pageId, { _: 'Inline page' })

    const result = await compileMirrorzPage({
      pageId,
      config,
      blocks: [
        {
          path: 'inline.zh.md',
          content: `Download from {ztmpl lang="text"}\`${template}\`.`,
        },
      ],
    })

    expect(result.templates).toEqual({ 'template-0': template })
    const tag = componentTag(result.mdx, 'CodeInline')
    expectStringProp(tag, 'templateId', 'template-0')
    expectStringProp(tag, 'codeLanguage', 'text')
  })

  test('records initial state only for an explicit global directive', async () => {
    const pageId = 'global-menu-page'
    const config = mergeConfig(pageId, {
      _: 'Global menu page',
      input: {
        channel: {
          _: 'Channel',
          default: 'stable',
          option: {
            edge: {
              _: 'Edge',
              suite: 'edge',
            },
            stable: {
              _: 'Stable',
              suite: 'stable',
              branch: 'main',
            },
          },
        },
        label: {
          _: 'Label',
          default: 'primary',
        },
        feature: {
          _: 'Feature',
          default: true,
          true: null,
          false: null,
        },
      },
    })

    const result = await compileMirrorzPage({
      pageId,
      config,
      blocks: [
        {
          path: 'global.zh.md',
          content: [
            '```{ztmpl global="true" input="channel label feature"}',
            'this content is ignored',
            '```',
          ].join('\n'),
        },
      ],
    })

    expect(result.templates).toEqual({})
    expect(result.globalVariables).toEqual({
      'globalMenu-0': {
        channel: 'stable',
        suite: 'stable',
        branch: 'main',
        label: 'primary',
        feature: true,
      },
    })

    const tag = componentTag(result.mdx, 'GlobalMenu')
    expectStringProp(tag, 'id', 'globalMenu-0')
    expect(tag).toMatch(/"trueValue"\s*:\s*true/)
    expect(tag).toMatch(/"falseValue"\s*:\s*false/)
  })

  test('converts an ordinary fenced block to SyntaxHighlight', async () => {
    const pageId = 'code-page'
    const config = mergeConfig(pageId, { _: 'Code page' })

    const result = await compileMirrorzPage({
      pageId,
      config,
      blocks: [
        {
          path: 'code.zh.md',
          content: ['```bash', 'echo hello', '```'].join('\n'),
        },
      ],
    })

    expect(result.templates).toEqual({})
    const tag = componentTag(result.mdx, 'SyntaxHighlight')
    expectStringProp(tag, 'code', 'echo hello')
    expectStringProp(tag, 'language', 'bash')
  })

  test('rejects an undefined directive input with input and page context', async () => {
    const pageId = 'missing-input-page'
    const config = mergeConfig(pageId, { _: 'Missing input page' })
    let thrown: unknown

    try {
      await compileMirrorzPage({
        pageId,
        config,
        blocks: [
          {
            path: 'usage.zh.md',
            content: ['```{ztmpl input="missing"}', '{{missing}}', '```'].join(
              '\n',
            ),
          },
        ],
      })
    } catch (error) {
      thrown = error
    }

    expect(thrown).toBeInstanceOf(TypeError)
    const message = (thrown as Error).message
    expect(message).toContain('missing')
    expect(message).toContain(pageId)
  })

  test('collects h1-h3 headings and unique internal links in source order', async () => {
    const pageId = 'navigation-page'
    const config = mergeConfig(pageId, { _: 'Navigation page' })

    const result = await compileMirrorzPage({
      pageId,
      config,
      blocks: [
        {
          path: 'navigation.zh.md',
          content: [
            '# Overview',
            '## Install {#install-guide}',
            '### Verify setup',
            '#### Not in the table of contents',
            '',
            '[Jump to install](#install-guide)',
            '[Debian guide](../debian/)',
            '[Ubuntu guide](/ubuntu/)',
            '[Debian guide again](../debian/)',
            '[External reference](https://example.test/docs)',
          ].join('\n'),
        },
      ],
    })

    expect(result.toc).toEqual([
      { url: '#', content: 'Overview', depth: 2 },
      { url: '#overview', content: 'Overview', depth: 1 },
      { url: '#install-guide', content: 'Install', depth: 2 },
      { url: '#verify-setup', content: 'Verify setup', depth: 3 },
    ])
    expect(result.internalLinks).toEqual(['../debian/', '/ubuntu/'])
  })
})
