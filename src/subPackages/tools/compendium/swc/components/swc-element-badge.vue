<template>
  <view class="swc-element-badge" :style="rootStyle">
    <image v-if="iconSrc" class="swc-element-icon" :src="iconSrc" mode="aspectFit" :style="iconStyle" />
    <text v-if="shouldShowLabel" class="swc-element-label" :style="labelStyle">{{ resolvedLabel }}</text>
  </view>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import DarkIcon from '@/static/image/swc/Dark.png'
  import FireIcon from '@/static/image/swc/Fire.png'
  import LightIcon from '@/static/image/swc/Light.png'
  import WaterIcon from '@/static/image/swc/Water.png'
  import WindIcon from '@/static/image/swc/Wind.png'

  const ELEMENT_LABEL_MAP: Record<string, string> = {
    fire: '火',
    water: '水',
    wind: '风',
    light: '光',
    dark: '暗',
  }

  const ELEMENT_ICON_MAP: Record<string, string> = {
    fire: FireIcon,
    water: WaterIcon,
    wind: WindIcon,
    light: LightIcon,
    dark: DarkIcon,
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

  const normalizeElementKey = (value?: string): string => {
    const text = typeof value === 'string' ? value.trim().toLowerCase() : ''
    if (!text) return ''

    const aliasMap: Record<string, string> = {
      fire: 'fire',
      water: 'water',
      wind: 'wind',
      light: 'light',
      dark: 'dark',
      火: 'fire',
      水: 'water',
      风: 'wind',
      光: 'light',
      暗: 'dark',
    }

    return aliasMap[text] || text
  }

  const resolvedKey = computed(() => normalizeElementKey(props.elementKey || props.label))

  const resolvedLabel = computed(() => {
    if (props.label) return props.label
    return ELEMENT_LABEL_MAP[resolvedKey.value] || ''
  })

  const shouldShowLabel = computed(() => Boolean(!props.iconOnly && props.showLabel && resolvedLabel.value))

  const iconSrc = computed(() => ELEMENT_ICON_MAP[resolvedKey.value] || '')

  const rootStyle = computed(() => ({
    gap: shouldShowLabel.value ? `${props.gap}rpx` : '0rpx',
  }))

  const iconStyle = computed(() => ({
    width: `${props.size}rpx`,
    height: `${props.size}rpx`,
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
