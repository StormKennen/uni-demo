import { type ThemeMode, LIGHT_TOKENS, DARK_TOKENS } from '@/utils/theme'

// #ifdef WEB
export const applyThemeToHtml = (mode: ThemeMode): void => {
  const root = document.documentElement
  root.setAttribute('data-theme', mode)

  const tokens = mode === 'dark' ? DARK_TOKENS : LIGHT_TOKENS
  const style = root.style
  for (const [key, value] of Object.entries(tokens)) {
    style.setProperty(key, value)
  }
}
// #endif

// #ifndef WEB
export const applyThemeToHtml = (_mode: ThemeMode): void => {}
// #endif
