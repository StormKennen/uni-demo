<script setup lang="ts">
  import { computed, useSlots } from 'vue'
  import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
  import { storeToRefs } from 'pinia'
  import { useThemeStore } from '@/stores/theme'
  import { useThemeOnPage } from '@/hooks/useTheme'
  import { LIGHT_TOKENS, DARK_TOKENS } from '@/utils/theme'
  import NavBar from '@/components/nav-bar.vue'
  import PrivacyPopup from '@/components/privacy-popup.vue'

  interface Props {
    /** 页面标题（导航栏 + 分享） */
    title: string
    /** 自定义分享标题，默认 `${title} · 凉白开工具箱` */
    shareTitle?: string
    /** 自定义分享路径，默认取当前页面路由 */
    sharePath?: string
    /** 自定义分享图片 */
    shareImageUrl?: string
    /** 自定义朋友圈分享 query */
    shareTimelineQuery?: string
    /** 自定义朋友圈分享标题；不传时复用分享标题 */
    shareTimelineTitle?: string
    /** 是否显示自定义导航栏 */
    showNav?: boolean
    /** 导航栏是否覆盖在页面内容上方；开启后不占用页面内容高度 */
    navOverlay?: boolean
    /** 导航栏渐变背景（设置后自动应用 light class） */
    navGradient?: string
    /** 导航栏 class；不传时若有 navGradient 则自动 'light' */
    navCustomClass?: string
    /** 导航栏滚动后背景色 */
    navBgColor?: string
    /** 导航栏初始背景色 */
    navInitBgColor?: string
    /** 是否显示导航栏底部分隔线 */
    navDivider?: boolean
    /** 导航栏文字颜色 */
    navTitleColor?: string
    /** 导航栏自定义样式（与 navGradient 合并） */
    navCustomStyle?: Record<string, any>
    /** 是否显示返回按钮 */
    navBack?: boolean
    /** 是否始终显示标题 */
    alwaysTitle?: boolean
    /** 自定义返回 */
    customGoBack?: boolean
    /** 返回前拦截 */
    beforeBack?: () => boolean | Promise<boolean>
    /** 页面栈不足时返回的业务父页面 */
    backFallback?: string
    /** 页面底色 */
    bgColor?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    showNav: true,
    navOverlay: false,
    navBack: true,
    alwaysTitle: true,
    navDivider: false,
    bgColor: '',
  })

  const emit = defineEmits<{
    back: []
  }>()

  const handleBack = () => emit('back')

  const slots = useSlots()

  const themeStore = useThemeStore()
  const { isDark } = storeToRefs(themeStore)
  useThemeOnPage()

  // #ifdef MP-WEIXIN
  onShareAppMessage(() => {
    const shareTitle = props.shareTitle || `${props.title} · 凉白开工具箱`
    const pages = getCurrentPages() // eslint-disable-line no-undef
    const currentPage = pages[pages.length - 1]
    const path = props.sharePath || '/' + currentPage.route
    return { title: shareTitle, path, imageUrl: props.shareImageUrl }
  })

  onShareTimeline(() => {
    const shareTitle = props.shareTimelineTitle || props.shareTitle || `${props.title} · 凉白开工具箱`
    return { title: shareTitle, query: props.shareTimelineQuery || '', imageUrl: props.shareImageUrl }
  })
  // #endif

  const effectiveNavClass = computed(() => {
    if (props.navCustomClass !== undefined) return props.navCustomClass
    return props.navGradient ? 'light' : undefined
  })

  const effectiveNavStyle = computed(() => {
    const s: Record<string, any> = {}
    if (props.navGradient) s.backgroundImage = props.navGradient
    if (props.navCustomStyle) Object.assign(s, props.navCustomStyle)
    if (props.navDivider) {
      s.borderBottom = '1rpx solid var(--theme-border)'
      s.boxShadow = '0 2rpx 10rpx var(--theme-shadow-xs)'
    }
    return Object.keys(s).length ? s : undefined
  })

  /** 内联 CSS 变量 + 背景色，确保即使 page-meta 未生效也能正确展示主题 */
  const layoutStyle = computed(() => {
    const tokens = isDark.value ? DARK_TOKENS : LIGHT_TOKENS
    const vars: Record<string, string> = {}
    for (const [key, value] of Object.entries(tokens)) {
      vars[key] = value
    }
    vars['background-color'] = props.bgColor || tokens['--theme-bg']
    return vars
  })
</script>

<template>
  <view class="page-layout" :style="layoutStyle">
    <NavBar
      v-if="showNav"
      :overlay="navOverlay"
      :always-title="alwaysTitle"
      :title="title"
      :custom-class="effectiveNavClass"
      :custom-style="effectiveNavStyle"
      :bg-color="navBgColor || 'var(--theme-surface)'"
      :init-bg-color="navInitBgColor"
      :nav-back="navBack"
      :title-color="navTitleColor"
      :custom-go-back="customGoBack"
      :before-back="beforeBack"
      :back-fallback="backFallback"
      @back="handleBack">
      <template #right>
        <slot name="nav-right" />
      </template>
    </NavBar>
    <view class="page-layout__body">
      <slot />
    </view>
    <view v-if="slots.footer" class="page-layout__footer">
      <slot name="footer" />
    </view>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>

<style lang="scss">
  .page-layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    box-sizing: border-box;

    &__body {
      flex: 1;
    }

    &__footer {
      flex-shrink: 0;
      position: sticky;
      bottom: 0;
      padding-bottom: env(safe-area-inset-bottom);
      background-color: var(--theme-surface);
    }
  }
</style>
