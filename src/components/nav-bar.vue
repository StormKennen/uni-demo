<script setup lang="ts">
  import { onPageScroll } from '@dcloudio/uni-app'
  import { defineProps, ref } from 'vue'
  import NavBarBase from '@/components/nav-bar-base.vue'

  interface Props {
    initBgColor?: string
    bgColor?: string
    overlay?: boolean

    title?: string
    alwaysTitle?: boolean

    customStyle?: Record<string, any>
    customClass?: string
    titleColor?: string
    navBack?: boolean
    onBack?: () => void
    customGoBack?: boolean
    beforeBack?: () => boolean | Promise<boolean>
    backFallback?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    initBgColor: 'transparent',
    bgColor: 'var(--theme-surface)',
    overlay: false,
    navBack: true,
    alwaysTitle: false,
    customGoBack: false,
  })

  const emit = defineEmits<{
    back: []
  }>()

  const navBgColor = ref(props.initBgColor)
  const navTitle = ref(props.alwaysTitle ? props.title : '')

  onPageScroll((event: any) => {
    const scrollTop = event.scrollTop // 获取滚动距离
    if (scrollTop > 10) {
      navBgColor.value = props.bgColor
      navTitle.value = props.title
    } else {
      navBgColor.value = props.initBgColor
      if (props.alwaysTitle) {
        navTitle.value = props.title
      } else {
        navTitle.value = undefined
      }
    }
  })
</script>

<template>
  <NavBarBase
    :overlay="props.overlay"
    :bg-color="navBgColor"
    :title="navTitle"
    :custom-class="props.customClass"
    :custom-style="props.customStyle"
    :nav-back="props.navBack"
    :custom-go-back="props.customGoBack"
    :before-back="props.beforeBack"
    :back-fallback="props.backFallback"
    :title-color="props.titleColor"
    @back="emit('back')">
    <template #title>
      <slot name="title">{{ navTitle }}</slot>
    </template>
    <template #right>
      <slot name="right"></slot>
    </template>
  </NavBarBase>
</template>
