import type { ThemeMode } from '@/utils/theme'

// #ifdef WEB
export const applyThemeToHtml = (mode: ThemeMode): void => {
  document.documentElement.setAttribute('data-theme', mode)
}
// #endif

// #ifndef WEB
export const applyThemeToHtml = (_mode: ThemeMode): void => {}
// #endif
