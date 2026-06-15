<script setup lang="ts">
  import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
  import NavBar from '@/components/nav-bar.vue'

  interface Props {
    /** 页面标题（同时用于导航栏和分享） */
    title: string
    /** 自定义分享标题，默认 `${title} · 凉白开工具箱` */
    shareTitle?: string
    /** 自定义分享路径，默认取当前页面路由 */
    sharePath?: string
    /** 导航栏渐变背景 */
    navGradient?: string
    /** 导航栏自定义 class，默认 'light' */
    navCustomClass?: string
    /** 是否显示返回按钮 */
    navBack?: boolean
    /** 是否始终显示标题 */
    alwaysTitle?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    navCustomClass: 'light',
    navBack: true,
    alwaysTitle: true,
  })

  // #ifdef MP-WEIXIN
  onShareAppMessage(() => {
    const title = props.shareTitle || `${props.title} · 凉白开工具箱`
    const pages = getCurrentPages() // eslint-disable-line no-undef
    const currentPage = pages[pages.length - 1]
    const path = props.sharePath || '/' + currentPage.route
    return { title, path }
  })

  onShareTimeline(() => {
    const title = props.shareTitle || `${props.title} · 凉白开工具箱`
    return { title, query: '' }
  })
  // #endif
</script>

<template>
  <NavBar
    :always-title="alwaysTitle"
    :title="title"
    :custom-class="navCustomClass"
    :custom-style="navGradient ? { backgroundImage: navGradient } : {}"
    :nav-back="navBack">
    <template #right>
      <slot name="nav-right" />
    </template>
  </NavBar>
  <slot />
</template>
