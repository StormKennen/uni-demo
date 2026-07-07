import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { buildPageStyleVars, type ThemeMode } from '@/utils/theme'
import { getThemeMode, setThemeMode } from '@/utils/storage'

// #ifdef WEB
import { applyThemeToHtml } from '@/utilsH5/theme'
// #endif

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<ThemeMode>(getThemeMode() || 'light')
  const isDark = computed(() => mode.value === 'dark')
  const pageStyle = computed(() => buildPageStyleVars(mode.value))

  const setMode = (next: ThemeMode) => {
    mode.value = next
    setThemeMode(next)
    // #ifdef WEB
    applyThemeToHtml(next)
    // #endif
  }

  const toggle = () => {
    setMode(isDark.value ? 'light' : 'dark')
  }

  const init = () => {
    // #ifdef WEB
    applyThemeToHtml(mode.value)
    // #endif
  }

  // H5 端立即应用主题变量，不依赖 onLaunch 时机
  // #ifdef WEB
  applyThemeToHtml(mode.value)
  // #endif

  return {
    mode,
    isDark,
    pageStyle,
    setMode,
    toggle,
    init,
  }
})
