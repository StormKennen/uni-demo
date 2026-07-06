import { watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useThemeStore } from '@/stores/theme'
import { LIGHT_TOKENS, DARK_TOKENS } from '@/utils/theme'

export function useTheme() {
  const store = useThemeStore()
  const { mode, isDark } = storeToRefs(store)

  const applyNativeChrome = (): void => {
    const frontColor = isDark.value ? '#ffffff' : '#000000'
    const bgColor = isDark.value ? DARK_TOKENS['--theme-bg'] : LIGHT_TOKENS['--theme-bg']

    uni.setNavigationBarColor({
      frontColor,
      backgroundColor: bgColor,
      animation: { duration: 200, timingFunc: 'easeIn' },
    })

    uni.setTabBarStyle({
      color: isDark.value ? '#8993a2' : '#8993a2',
      selectedColor: isDark.value ? '#e9ecf0' : '#121A26',
      backgroundColor: isDark.value ? DARK_TOKENS['--theme-surface'] : LIGHT_TOKENS['--theme-surface'],
      borderStyle: isDark.value ? 'black' : 'white',
    })
  }

  const pickAsset = (light: string, dark: string): string => (isDark.value ? dark : light)

  return {
    mode,
    isDark,
    toggle: store.toggle,
    setMode: store.setMode,
    applyNativeChrome,
    pickAsset,
  }
}

export function useThemeOnPage() {
  const theme = useTheme()

  onMounted(() => {
    theme.applyNativeChrome()
  })

  watch(theme.isDark, () => {
    theme.applyNativeChrome()
  })

  return theme
}
