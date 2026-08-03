declare module '*.astro' {
  const Component: any
  export default Component
}

declare module '*.svg' {
  const asset: {
    src: string
  }
  export default asset
}
