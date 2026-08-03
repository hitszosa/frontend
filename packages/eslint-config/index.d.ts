export const sharedIgnores: string[]

interface AstroConfigDependencies {
  js: any
  astro: any
  tsParser: any
  tsPlugin: any
  globals?: Record<string, string>
}

export function createAstroConfig(
  dependencies: AstroConfigDependencies,
): any[]
