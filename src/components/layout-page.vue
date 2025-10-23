<template>
  <view class="layout-page-container" :class="{ 'safe-area-inset-bottom': !isShowFooter }" :style="styles?.container">
    <!-- 页头 -->
    <view class="layout-page-header" :style="headerStyle" v-if="slots.header || title">
      <NavBarBase :beforeBack="beforeBack" :customGoBack="customGoBack" :navBack="navBack" @back="goBack"
        :alwaysTitle="true" :customStyle="navStyle" v-if="title" :title="title"></NavBarBase>
      <slot name="header"></slot>
    </view>
    <!-- 页面内容 -->
    <view class="layout-page-content" :style="styles?.content">
      <slot></slot>
    </view>
    <!-- 页脚 -->
    <view class="layout-page-footer" v-if="isShowFooter">
      <slot name="footer"></slot>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed, useSlots } from 'vue';
import NavBarBase from './nav-bar-base.vue'
import { useLayoutPageProvide } from '@/hooks/layout-page'

const props = withDefaults(defineProps<{
  styles?: {
    container?: Record<string, number | string> | string;
    content?: Record<string, number | string> | string;
    header?: Record<string, number | string>;
  },
  title?: string
  navBack?: boolean
  customGoBack?: boolean
  // 要通屏效果时,传入
  scrollTop?: number,
  // 默认导航栏背景色
  defaultHeaderBgColor?: string,
  // 滚动时,导航栏背景色,默认#fff
  headerBgColor?: string
  showFooter?: boolean
  beforeBack?: () => boolean | Promise<boolean>
}>(), {
  navBack: true,
  defaultHeaderBgColor: '#fff',
  // transparent
  headerBgColor: '#fff',
  showFooter: true
})
const slots = useSlots()

const navStyle = {
  position: 'static'
}

const isShowFooter = computed(() => props.showFooter && slots.footer)
useLayoutPageProvide()
const headerStyle = computed(() => {

  const extraStyle: Record<string, string> = {
    backgroundColor: props.defaultHeaderBgColor,
  }
  if (props.scrollTop > 5) {
    extraStyle.backgroundColor = props.headerBgColor
    extraStyle.backgroundImage = 'none'
  }
  return {
    ...props.styles?.header,
    ...extraStyle
  }
})

const emit = defineEmits<{
  back: []
}>();

const goBack = () => {
  emit('back')
}


</script>

<style lang="scss">
.layout-page-container {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  min-height: 100%;

  &.safe-area-inset-bottom {
    padding-bottom: env(safe-area-inset-bottom);
  }
}

.layout-page-content {
  flex: 1;
  box-sizing: border-box;
}



.layout-page-header,
.layout-page-footer {
  flex-shrink: 0;
  position: sticky;
  width: 100%;
  z-index: 9; // 不要小于9，容易有坑
}

.layout-page-header {
  top: 0;
  background-color: transparent;
  transition: all 250ms;
}

.layout-page-footer {
  bottom: 0;
  padding-bottom: env(safe-area-inset-bottom);
  background-color: #fff;

  &:empty {
    display: none;
  }
}
</style>