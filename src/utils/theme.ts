export type ThemeMode = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'theme_mode'

type ThemeTokens = Record<string, string>

export const LIGHT_TOKENS: ThemeTokens = {
  '--theme-bg': '#f8f9fb',
  '--theme-surface': '#ffffff',
  '--theme-surface-2': '#f5f6f8',
  '--theme-text': '#121a26',
  '--theme-text-secondary': '#435163',
  '--theme-text-tertiary': '#8993a2',
  '--theme-border': '#e9ecf0',
  '--theme-brand': '#0046b4',
  '--theme-mask': 'rgba(0,0,0,0.4)',
  '--theme-elevated': '#ffffff',
  '--theme-shadow-xs': 'rgba(0,0,0,0.05)',
  '--theme-shadow-sm': 'rgba(0,0,0,0.1)',
  '--theme-shadow-md': 'rgba(0,0,0,0.15)',
}

export const DARK_TOKENS: ThemeTokens = {
  '--theme-bg': '#0f141a',
  '--theme-surface': '#1a222d',
  '--theme-surface-2': '#232d3a',
  '--theme-text': '#e9ecf0',
  '--theme-text-secondary': '#b9c1cc',
  '--theme-text-tertiary': '#8993a2',
  '--theme-border': '#2b3644',
  '--theme-brand': '#4a86e8',
  '--theme-mask': 'rgba(0,0,0,0.6)',
  '--theme-elevated': '#2a3746',
  '--theme-shadow-xs': 'rgba(0,0,0,0.3)',
  '--theme-shadow-sm': 'rgba(0,0,0,0.45)',
  '--theme-shadow-md': 'rgba(0,0,0,0.55)',
}

const TOKEN_ORDER: Array<keyof typeof LIGHT_TOKENS> = [
  '--theme-bg',
  '--theme-surface',
  '--theme-surface-2',
  '--theme-text',
  '--theme-text-secondary',
  '--theme-text-tertiary',
  '--theme-border',
  '--theme-brand',
  '--theme-mask',
  '--theme-elevated',
  '--theme-shadow-xs',
  '--theme-shadow-sm',
  '--theme-shadow-md',
]

const getTokens = (mode: ThemeMode): ThemeTokens => (mode === 'dark' ? DARK_TOKENS : LIGHT_TOKENS)

export const buildPageStyleVars = (mode: ThemeMode): string => {
  const tokens = getTokens(mode)
  return TOKEN_ORDER.map(key => `${key}:${tokens[key]}`).join(';')
}
