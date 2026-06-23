<template>
  <uni-popup :safe-area="safeArea" ref="popup" :is-mask-click="!disabledMaskClick" @maskClick="maskClick"
    @change="popupChange" :type="type" :backgroundColor="backgroundColor" :borderRadius="borderRadius">
    <view class="popup-shell" @touchmove.prevent>
      <scroll-view
        v-if="scrollable"
        :style="{
          maxHeight: contentHeight,
        }"
        scroll-y>
        <view :style="keyboardHeight ? `padding-bottom:${keyboardHeight}px` : undefined">
          <slot></slot>
        </view>
      </scroll-view>
      <view
        v-else
        class="popup-static-body"
        :style="{
          height: contentHeight,
          paddingBottom: keyboardHeight ? `${keyboardHeight}px` : undefined,
        }">
        <slot></slot>
      </view>
    </view>
  </uni-popup>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

const props = withDefaults(defineProps<{
  type?: string
  safeArea?: boolean
  disabledMaskClick?: boolean
  backgroundColor?: string
  fullScreen?: boolean
  scrollable?: boolean
}>(), {
  type: 'center',
  backgroundColor: '#fff',
  scrollable: true,
})

const visible = defineModel<boolean>()
const popup = ref()
const contentHeight = ref('auto')
const emit = defineEmits(['change'])

uni.getSystemInfo({
  success: (res) => {
    contentHeight.value = `${props.fullScreen ? res.windowHeight : (res.windowHeight - 135)}px`
  },
})

const keyboardHeight = ref(0)
const keyboardHeightChange = (res: {
  height: number
}) => {
  keyboardHeight.value = res.height
}


const borderRadius = computed(() => {
  const radius: Record<string, string> = {
    'top': '0 0 12rpx 12rpx',
    'bottom': '12rpx 12rpx 0 0',
    'center': '12rpx',
  }
  return radius[props.type]
})

watch(visible, val => {
  if (val) {
    popup.value.open(props.type)
    if (props.type === 'bottom' || props.type === 'center') {
      uni.onKeyboardHeightChange?.(keyboardHeightChange)
    }

  } else {
    popup.value?.close?.()
    uni.offKeyboardHeightChange?.(keyboardHeightChange)
  }
})

const popupChange = (e: {
  show: string
}) => {
  emit('change', e)
}


onMounted(() => {
  if (visible.value) {
    popup.value.open(props.type)
    if (props.type === 'bottom' || props.type === 'center') {
      uni.onKeyboardHeightChange?.(keyboardHeightChange)
    }

  }
})

onUnmounted(() => {
  uni.offKeyboardHeightChange?.(keyboardHeightChange)
})


const maskClick = () => {
  if (!!props.disabledMaskClick) {
    return
  }
  visible.value = false
}
</script>

<style scoped>
.popup-shell,
.popup-static-body {
  width: 100%;
}

.popup-static-body {
  overflow: hidden;
}
</style>
