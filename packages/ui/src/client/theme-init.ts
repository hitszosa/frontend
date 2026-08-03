import {
  applyTheme,
  getStoredThemeMode,
  isThemeMode,
  THEME_STORAGE_KEY,
  type ThemeMode,
} from './theme.js'

const root = document.documentElement
const storageKey = root.dataset.themeStorageKey ?? THEME_STORAGE_KEY
const defaultMode: ThemeMode = isThemeMode(root.dataset.defaultThemeMode)
  ? root.dataset.defaultThemeMode
  : 'system'

applyTheme(getStoredThemeMode(storageKey, defaultMode))
