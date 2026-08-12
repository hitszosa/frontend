declare module '*.astro' {
  import type { AstroComponentFactory } from 'astro/runtime/server/index.js'

  const Component: AstroComponentFactory
  export default Component
}

declare module '*.svg' {
  const asset: {
    src: string
  }
  export default asset
}
