<template>
  <view v-if="iconSrc" class="swc-square-icon" :style="rootStyle">
    <image class="swc-square-icon__image" :src="iconSrc" mode="aspectFit" :style="imageStyle" @error="handleImageError" />
  </view>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { ensureSwcIconCached, invalidateSwcIconCache, resolveSwcCachedIcon } from '../icon-cache'
  import { resolveSwcSquareIcon, type SwcSquareIconKind } from '../icon-assets'

  const props = withDefaults(
    defineProps<{
      kind: SwcSquareIconKind
      iconKey?: string
      size?: number
      padding?: number
      radius?: number
      background?: string
    }>(),
    {
      iconKey: '',
      size: 32,
      padding: 0,
      radius: 8,
      background: 'transparent',
    },
  )

  const iconSrc = ref('')
  const remoteIconSrc = computed(() => resolveSwcSquareIcon(props.kind, props.iconKey))

  let syncVersion = 0

  const syncIconSrc = async () => {
    const currentVersion = ++syncVersion
    const fallbackSrc = remoteIconSrc.value
    iconSrc.value = resolveSwcCachedIcon(props.kind, props.iconKey)

    const resolvedSrc = await ensureSwcIconCached(props.kind, props.iconKey)
    if (currentVersion !== syncVersion) return

    iconSrc.value = resolvedSrc || fallbackSrc
  }

  const handleImageError = async () => {
    const fallbackSrc = remoteIconSrc.value
    if (!fallbackSrc) {
      iconSrc.value = ''
      return
    }

    await invalidateSwcIconCache(props.kind, props.iconKey)
    iconSrc.value = fallbackSrc
    void ensureSwcIconCached(props.kind, props.iconKey)
  }

  watch(
    () => [props.kind, props.iconKey],
    () => {
      void syncIconSrc()
    },
    { immediate: true },
  )

  const rootStyle = computed(() => ({
    width: `${props.size}rpx`,
    height: `${props.size}rpx`,
    padding: `${props.padding}rpx`,
    borderRadius: `${props.radius}rpx`,
    background: props.background,
  }))

  const imageStyle = computed(() => ({
    borderRadius: `${Math.max(props.radius - props.padding, 0)}rpx`,
  }))
</script>

<style scoped lang="scss">
  .swc-square-icon {
    box-sizing: border-box;
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .swc-square-icon__image {
    width: 100%;
    height: 100%;
    display: block;
    flex: none;
  }
</style>
