<script setup lang="ts">
  import { computed, reactive, ref, watch } from 'vue'
  import { calculateNormalizedCrop } from '@/features/image-compliance/crop'
  import type { NormalizedCrop } from '@/features/image-compliance/types'

  interface TouchPoint {
    clientX?: number
    clientY?: number
    pageX?: number
    pageY?: number
  }

  interface TouchLikeEvent {
    touches: TouchPoint[]
  }

  interface MouseLikeEvent {
    clientX: number
    clientY: number
  }

  const props = defineProps<{
    src: string
    imageWidth: number
    imageHeight: number
    targetWidth: number
    targetHeight: number
  }>()

  const emit = defineEmits<{
    cancel: []
    confirm: [crop: NormalizedCrop]
  }>()

  const frame = computed(() => {
    const ratio = props.targetWidth / props.targetHeight
    const maxWidth = 640
    const maxHeight = 760
    if (maxWidth / maxHeight > ratio) return { width: maxHeight * ratio, height: maxHeight }
    return { width: maxWidth, height: maxWidth / ratio }
  })

  const baseScale = computed(() => Math.max(frame.value.width / props.imageWidth, frame.value.height / props.imageHeight))
  const zoom = ref(1)
  const offset = reactive({ x: 0, y: 0 })
  const gesture = reactive({
    dragging: false,
    startX: 0,
    startY: 0,
    startOffsetX: 0,
    startOffsetY: 0,
    pinchDistance: 0,
    pinchZoom: 1,
  })

  const rpxPerPixel = 750 / uni.getSystemInfoSync().windowWidth
  const renderedImage = computed(() => ({
    width: props.imageWidth * baseScale.value * zoom.value,
    height: props.imageHeight * baseScale.value * zoom.value,
  }))

  const clampOffset = () => {
    const maxX = Math.max(0, (renderedImage.value.width - frame.value.width) / 2)
    const maxY = Math.max(0, (renderedImage.value.height - frame.value.height) / 2)
    offset.x = Math.max(-maxX, Math.min(maxX, offset.x))
    offset.y = Math.max(-maxY, Math.min(maxY, offset.y))
  }

  watch([zoom, frame, baseScale], clampOffset)

  const imageStyle = computed(() => ({
    width: `${renderedImage.value.width}rpx`,
    height: `${renderedImage.value.height}rpx`,
    left: `${(frame.value.width - renderedImage.value.width) / 2 + offset.x}rpx`,
    top: `${(frame.value.height - renderedImage.value.height) / 2 + offset.y}rpx`,
  }))

  const frameStyle = computed(() => ({ width: `${frame.value.width}rpx`, height: `${frame.value.height}rpx` }))

  const pointPosition = (point: TouchPoint) => ({ x: point.clientX ?? point.pageX ?? 0, y: point.clientY ?? point.pageY ?? 0 })
  const pointDistance = (first: TouchPoint, second: TouchPoint) => {
    const a = pointPosition(first)
    const b = pointPosition(second)
    return Math.hypot(a.x - b.x, a.y - b.y)
  }

  const onTouchStart = (event: TouchLikeEvent) => {
    if (event.touches.length >= 2) {
      gesture.pinchDistance = pointDistance(event.touches[0], event.touches[1])
      gesture.pinchZoom = zoom.value
      gesture.dragging = false
      return
    }
    const point = event.touches[0]
    if (!point) return
    const position = pointPosition(point)
    gesture.dragging = true
    gesture.startX = position.x
    gesture.startY = position.y
    gesture.startOffsetX = offset.x
    gesture.startOffsetY = offset.y
  }

  const onTouchMove = (event: TouchLikeEvent) => {
    if (event.touches.length >= 2 && gesture.pinchDistance > 0) {
      const distance = pointDistance(event.touches[0], event.touches[1])
      zoom.value = Math.max(1, Math.min(3, gesture.pinchZoom * (distance / gesture.pinchDistance)))
      clampOffset()
      return
    }
    if (!gesture.dragging || !event.touches[0]) return
    const position = pointPosition(event.touches[0])
    offset.x = gesture.startOffsetX + (position.x - gesture.startX) * rpxPerPixel
    offset.y = gesture.startOffsetY + (position.y - gesture.startY) * rpxPerPixel
    clampOffset()
  }

  const onTouchEnd = () => {
    gesture.dragging = false
    gesture.pinchDistance = 0
  }

  const onMouseDown = (event: MouseLikeEvent) => {
    onTouchStart({ touches: [event] })
  }

  const onMouseMove = (event: MouseLikeEvent) => {
    if (gesture.dragging) onTouchMove({ touches: [event] })
  }

  const onZoomChange = (event: { detail: { value: number } }) => {
    zoom.value = Number(event.detail.value) / 100
    clampOffset()
  }

  const reset = () => {
    zoom.value = 1
    offset.x = 0
    offset.y = 0
  }

  const buildNormalizedCrop = (): NormalizedCrop =>
    calculateNormalizedCrop({
      frameWidth: frame.value.width,
      frameHeight: frame.value.height,
      imageWidth: renderedImage.value.width,
      imageHeight: renderedImage.value.height,
      offsetX: offset.x,
      offsetY: offset.y,
    })
</script>

<template>
  <view class="cropper-shell">
    <view class="crop-heading">
      <view>
        <text class="crop-title">调整裁剪区域</text>
        <text class="crop-subtitle">移动或缩放图片，保留需要的部分</text>
      </view>
      <button class="reset-button" @click="reset">
        <uni-icons type="refreshempty" size="18" color="var(--theme-text-secondary)" />
        <text>重置</text>
      </button>
    </view>

    <view class="editor-stage">
      <view
        class="crop-frame"
        :style="frameStyle"
        @touchstart="onTouchStart"
        @touchmove.stop.prevent="onTouchMove"
        @touchend="onTouchEnd"
        @touchcancel="onTouchEnd"
        @mousedown="onMouseDown"
        @mousemove="onMouseMove"
        @mouseup="onTouchEnd"
        @mouseleave="onTouchEnd">
        <image class="source-image" :src="src" mode="scaleToFill" :style="imageStyle" :draggable="false" />
        <view class="grid-line vertical first" />
        <view class="grid-line vertical second" />
        <view class="grid-line horizontal first" />
        <view class="grid-line horizontal second" />
        <view class="frame-border" />
      </view>
    </view>

    <view class="zoom-control">
      <uni-icons type="minus" size="18" color="var(--theme-text-tertiary)" />
      <slider
        class="zoom-slider"
        :value="Math.round(zoom * 100)"
        :min="100"
        :max="300"
        :step="1"
        activeColor="#16845b"
        backgroundColor="var(--theme-border)"
        block-color="#16845b"
        :block-size="20"
        @changing="onZoomChange"
        @change="onZoomChange" />
      <uni-icons type="plus" size="18" color="var(--theme-text-tertiary)" />
    </view>

    <view class="crop-actions">
      <button class="secondary-button" @click="emit('cancel')">返回</button>
      <button class="primary-button" @click="emit('confirm', buildNormalizedCrop())">确认裁剪</button>
    </view>
  </view>
</template>

<style scoped lang="scss">
  .cropper-shell {
    display: flex;
    flex-direction: column;
    gap: 24rpx;
  }

  .crop-heading,
  .reset-button,
  .zoom-control,
  .crop-actions {
    display: flex;
    align-items: center;
  }

  .crop-heading {
    justify-content: space-between;
    gap: 16rpx;
  }

  .crop-title,
  .crop-subtitle {
    display: block;
  }

  .crop-title {
    color: var(--theme-text);
    font-size: 31rpx;
    font-weight: 650;
  }

  .crop-subtitle {
    margin-top: 6rpx;
    color: var(--theme-text-tertiary);
    font-size: 23rpx;
  }

  .reset-button {
    height: 66rpx;
    gap: 6rpx;
    margin: 0;
    padding: 0 22rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 8rpx;
    background: var(--theme-surface);
    color: var(--theme-text-secondary);
    font-size: 24rpx;
  }

  .reset-button::after,
  .secondary-button::after,
  .primary-button::after {
    border: 0;
  }

  .editor-stage {
    display: flex;
    min-height: 820rpx;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 8rpx;
    background: #11161d;
  }

  .crop-frame {
    position: relative;
    flex: none;
    overflow: hidden;
    touch-action: none;
  }

  .source-image {
    position: absolute;
    max-width: none;
    will-change: left, top, width, height;
  }

  .frame-border,
  .grid-line {
    position: absolute;
    z-index: 2;
    pointer-events: none;
  }

  .frame-border {
    inset: 0;
    border: 3rpx solid #fff;
    box-sizing: border-box;
    box-shadow: 0 0 0 2000rpx rgba(0, 0, 0, 0.42);
  }

  .grid-line {
    background: rgba(255, 255, 255, 0.45);
  }

  .grid-line.vertical {
    top: 0;
    bottom: 0;
    width: 1rpx;
  }

  .grid-line.horizontal {
    left: 0;
    right: 0;
    height: 1rpx;
  }

  .grid-line.first.vertical {
    left: 33.333%;
  }

  .grid-line.second.vertical {
    left: 66.666%;
  }

  .grid-line.first.horizontal {
    top: 33.333%;
  }

  .grid-line.second.horizontal {
    top: 66.666%;
  }

  .zoom-control {
    gap: 12rpx;
    padding: 0 12rpx;
  }

  .zoom-slider {
    flex: 1;
    margin: 0;
  }

  .crop-actions {
    gap: 16rpx;
  }

  .secondary-button,
  .primary-button {
    height: 88rpx;
    flex: 1;
    margin: 0;
    border-radius: 8rpx;
    font-size: 28rpx;
    font-weight: 600;
  }

  .secondary-button {
    border: 1rpx solid var(--theme-border);
    background: var(--theme-surface);
    color: var(--theme-text-secondary);
  }

  .primary-button {
    background: var(--theme-brand);
    color: #fff;
  }
</style>
