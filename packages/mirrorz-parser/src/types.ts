export type MenuValue = Record<string, string | boolean>

export interface InputCommon {
  title: string
  note?: string
}

export interface Menu extends InputCommon {
  items: Array<[displayName: string, value: MenuValue]>
}

export interface TextInput extends InputCommon {
  name: string
  defaultValue?: string
}

export interface BooleanInput extends InputCommon {
  name: string
  defaultValue: boolean
  trueValue: string | boolean
  falseValue: string | boolean
}

export type InputType = Menu | TextInput | BooleanInput

export interface ZDocInputCommon {
  _: string
  note?: string
}

export interface ZDocInputOptionSelect {
  _?: string
  [key: string]: string | undefined
}

export interface ZDocInputOption extends ZDocInputCommon {
  option: Record<string, ZDocInputOptionSelect>
  default?: string
}

export interface ZDocInputBool extends ZDocInputCommon {
  true?: string | null
  false?: string | null
  default?: boolean
}

export interface ZDocInputText extends ZDocInputCommon {
  default?: string
}

export type ZDocInput = ZDocInputOption | ZDocInputBool | ZDocInputText

export interface ZDocConfigOnDisk {
  _?: string
  block?: string[]
  input?: Record<string, ZDocInput | null>
}

export interface ZDocConfig {
  name: string
  _: string
  block: string[]
  input: Record<string, ZDocInput>
}

export interface SourceBlock {
  path: string | null
  content: string
}

export interface TocEntry {
  url: string
  content: string
  depth: number
}

export interface LoadMirrorzPageOptions {
  docsDir: string
  localDocsDir?: string
  pageId: string
  language?: string
}

export interface CompileMirrorzPageOptions {
  pageId: string
  config: ZDocConfig
  blocks: SourceBlock[]
}

export interface CompiledMirrorzPage {
  meta: {
    title: string
    cname: string
  }
  mdx: string
  templates: Record<string, string>
  globalVariables: Record<string, MenuValue>
  toc: TocEntry[]
  internalLinks: string[]
}
