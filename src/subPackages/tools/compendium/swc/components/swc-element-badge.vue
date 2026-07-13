<template>
  <view class="swc-element-badge" :style="rootStyle">
    <SwcSquareIcon
      v-if="resolvedKey"
      kind="element"
      :icon-key="resolvedKey"
      :size="size"
      :radius="0"
      class="swc-element-icon" />
    <text v-if="shouldShowLabel" class="swc-element-label" :style="labelStyle">{{ resolvedLabel }}</text>
  </view>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { normalizeSwcElement } from '../icon-assets'
  import SwcSquareIcon from './swc-square-icon.vue'

  const ELEMENT_LABEL_MAP: Record<string, string> = {
    fire: '火',
    water: '水',
    wind: '风',
    light: '光',
    dark: '暗',
  }

  const props = withDefaults(
    defineProps<{
      elementKey?: string
      label?: string
      size?: number
      fontSize?: number
      gap?: number
      showLabel?: boolean
      iconOnly?: boolean
    }>(),
    {
      elementKey: '',
      label: '',
      size: 28,
      fontSize: 24,
      gap: 8,
      showLabel: true,
      iconOnly: false,
    },
  )

  const resolvedKey = computed(() => normalizeSwcElement(props.elementKey || props.label))

  const resolvedLabel = computed(() => {
    if (props.label) return props.label
    return ELEMENT_LABEL_MAP[resolvedKey.value] || ''
  })

  const shouldShowLabel = computed(() => Boolean(!props.iconOnly && props.showLabel && resolvedLabel.value))

  const rootStyle = computed(() => ({
    gap: shouldShowLabel.value ? `${props.gap}rpx` : '0rpx',
  }))

  const labelStyle = computed(() => ({
    fontSize: `${props.fontSize}rpx`,
    lineHeight: `${props.fontSize + 4}rpx`,
  }))
</script>

<style scoped lang="scss">
  .swc-element-badge {
    display: inline-flex;
    align-items: center;
    min-width: 0;
    color: inherit;
  }

  .swc-element-icon {
    flex: none;
    display: block;
  }

  .swc-element-label {
    min-width: 0;
    color: currentColor;
    font-weight: 700;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
