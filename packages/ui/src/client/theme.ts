export const THEME_STORAGE_KEY = 'theme-preference'
export const THEME_MODES = ['light', 'dark', 'system'] as const

export type ThemeMode = (typeof THEME_MODES)[number]

export const themeIcons: Record<ThemeMode, string> = {
  light: 'material-symbols:light-mode',
  dark: 'material-symbols:dark-mode',
  system: 'material-symbols:brightness-auto',
}

export const isThemeMode = (
  value: string | null | undefined,
): value is ThemeMode =>
  value === 'light' || value === 'dark' || value === 'system'

export const getSystemTheme = (): Exclude<ThemeMode, 'system'> =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

export const resolveThemeMode = (
  mode: ThemeMode,
): Exclude<ThemeMode, 'system'> => (mode === 'system' ? getSystemTheme() : mode)

export const applyTheme = (mode: ThemeMode) => {
  const resolvedTheme = resolveThemeMode(mode)
  document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
  document.documentElement.dataset.theme = mode
}

export const getStoredThemeMode = (
  storageKey = THEME_STORAGE_KEY,
  fallback: ThemeMode = 'system',
): ThemeMode => {
  const stored = localStorage.getItem(storageKey)
  if (isThemeMode(stored)) {
    return stored
  }

  const domValue = document.documentElement.dataset.theme
  if (isThemeMode(domValue)) {
    return domValue
  }

  return fallback
}

export const saveThemeMode = (
  mode: ThemeMode,
  storageKey = THEME_STORAGE_KEY,
) => {
  localStorage.setItem(storageKey, mode)
}

export const cycleThemeMode = (mode: ThemeMode): ThemeMode => {
  const index = THEME_MODES.indexOf(mode)
  return THEME_MODES[(index + 1) % THEME_MODES.length]
}
