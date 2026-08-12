import type { Linter } from 'eslint'

export const sharedIgnores: string[]

interface AstroConfigDependencies {
  js: unknown
  astro: unknown
  tsParser: unknown
  tsPlugin: unknown
  globals?: Record<string, string>
}

export function createAstroConfig(
  dependencies: AstroConfigDependencies,
): Linter.Config[]
