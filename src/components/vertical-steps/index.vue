<template>
  <view class="vertical-steps">
    <slot>
    </slot>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useVerticalStepProvide } from './hook'
const props = withDefaults(defineProps<{
  // 当前步骤
  active?: number
}>(), {
  active: 0
})

const activeStep = computed(() => props.active)
useVerticalStepProvide({
  activeStep
})
</script>

<style lang="scss" scoped></style>
