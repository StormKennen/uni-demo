<template>
  <view class="swc-avatar-frame" :class="{ circle: shape === 'circle' }" :style="frameStyle">
    <view class="avatar-placeholder" :class="{ circle: shape === 'circle' }">
      <text>{{ placeholderText }}</text>
    </view>
    <image
      v-if="src && !loadError"
      :key="src"
      class="avatar-image"
      :class="{ circle: shape === 'circle', loaded }"
      :src="src"
      :data-avatar-src="src"
      mode="aspectFill"
      lazy-load
      @load="handleLoad"
      @error="handleError" />

    <slot />

    <view v-if="$slots['top-left']" class="corner top-left">
      <slot name="top-left" />
    </view>
    <view v-if="$slots['top-right']" class="corner top-right">
      <slot name="top-right" />
    </view>
    <view v-if="$slots['bottom-left']" class="corner bottom-left">
      <slot name="bottom-left" />
    </view>
    <view v-if="$slots['bottom-right']" class="corner bottom-right">
      <slot name="bottom-right" />
    </view>
  </view>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'

  type AvatarShape = 'square' | 'circle'

  interface AvatarLoadEvent {
    currentTarget?: {
      dataset?: {
        avatarSrc?: string
      }
    }
  }

  const props = withDefaults(
    defineProps<{
      src?: string
      name?: string
      size?: number
      shape?: AvatarShape
    }>(),
    {
      src: '',
      name: '',
      size: 240,
      shape: 'square',
    },
  )

  const frameStyle = computed(() => ({
    '--avatar-size': `${props.size}rpx`,
  }))

  const placeholderText = computed(() => props.name.slice(0, 1) || '?')
  const loaded = ref(false)
  const loadError = ref(false)

  const resetLoadState = () => {
    loaded.value = false
    loadError.value = false
  }

  const isCurrentSourceEvent = (event: AvatarLoadEvent): boolean => {
    const eventSource = event.currentTarget?.dataset?.avatarSrc
    return !eventSource || eventSource === props.src
  }

  const handleLoad = (event: AvatarLoadEvent) => {
    if (!isCurrentSourceEvent(event)) return
    loaded.value = true
    loadError.value = false
  }

  const handleError = (event: AvatarLoadEvent) => {
    if (!isCurrentSourceEvent(event)) return
    loaded.value = false
    loadError.value = true
  }

  watch(() => props.src, resetLoadState, { flush: 'sync' })
</script>

<style scoped lang="scss">
  .swc-avatar-frame {
    position: relative;
    width: 100%;
    height: var(--avatar-size);
    background: linear-gradient(180deg, rgba(15, 23, 42, 0.1), rgba(15, 23, 42, 0.02));
    overflow: hidden;
  }

  .swc-avatar-frame.circle {
    padding: 12rpx;
    box-sizing: border-box;
  }

  .avatar-image,
  .avatar-placeholder {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
  }

  .avatar-image {
    z-index: 1;
    opacity: 0;
    transition: opacity 180ms ease;
  }

  .avatar-image.loaded {
    opacity: 1;
  }

  .avatar-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 44rpx;
    font-weight: 800;
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.26), rgba(15, 23, 42, 0.12));
  }

  .avatar-image.circle,
  .avatar-placeholder.circle {
    border-radius: 50%;
  }

  .corner {
    position: absolute;
    z-index: 2;
    display: flex;
    align-items: center;
  }

  .top-left {
    top: 10rpx;
    left: 10rpx;
  }

  .top-right {
    top: 10rpx;
    right: 10rpx;
  }

  .bottom-left {
    left: 10rpx;
    bottom: 10rpx;
  }

  .bottom-right {
    right: 10rpx;
    bottom: 10rpx;
  }
</style>
