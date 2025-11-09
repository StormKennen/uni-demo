<script setup lang="ts">
import { onPageScroll } from '@dcloudio/uni-app';
import { defineProps, ref } from 'vue';
import NavBarBase from '@/components/nav-bar-base.vue';

interface Props {
  initBgColor?: string
  bgColor?: string;

  title?: string
  alwaysTitle?: boolean

  customStyle?: Record<string, any>
  customClass?: string
  titleColor?: string
  navBack?: boolean
  onBack?: ()=>void
  customGoBack?: boolean
  beforeBack?: () => boolean | Promise<boolean>
}

const props = withDefaults(defineProps<Props>(), {
  initBgColor: 'transparent',
  bgColor: 'white',
  navBack: true,
  alwaysTitle: false,
  customGoBack: false,
})

const emit = defineEmits<{
  back: []
}>();

const navBgColor = ref(props.initBgColor)
const navTitle = ref(props.alwaysTitle ? props.title : '')

const onBack = () => {
  uni.navigateBack()
  props?.onBack()
}
onPageScroll((event: any) => {
  const scrollTop = event.scrollTop; // 获取滚动距离
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
    :bg-color="navBgColor"
    :title="navTitle"
    :custom-class="props.customClass"
    :custom-style="props.customStyle"
    :nav-back="props.navBack"
    :custom-go-back="props.customGoBack"
    :before-back="props.beforeBack"
    :title-color="props.titleColor"
    @back="emit('back')"
  >
    <template #title>
      <slot name="title" />
    </template>
    <template #right>
      <slot name="right" />
    </template>
  </NavBarBase>
</template>
