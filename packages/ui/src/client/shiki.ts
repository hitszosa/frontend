export const shikiThemes = {
  light: 'github-light',
  dark: 'github-dark',
} as const

export type ShikiThemeName = (typeof shikiThemes)[keyof typeof shikiThemes]
