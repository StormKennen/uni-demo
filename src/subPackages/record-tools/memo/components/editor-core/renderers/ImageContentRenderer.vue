<template>
  <view class="icr-root" :style="rootStyle">
    <view v-if="layoutType === 'grid'" class="icr-grid" :style="gridStyle">
      <view
        v-for="(item, index) in block.children"
        :key="index"
        class="icr-grid-cell"
        :style="gridCellStyle(item)"
        @click.stop="activate(item)">
        <image v-if="item.url" class="icr-image" :src="item.url" :style="imageStyle(item)" :mode="imageMode(item)" />
      </view>
    </view>

    <swiper v-else-if="layoutType === 'carousel'" class="icr-carousel" indicator-dots circular :autoplay="false">
      <swiper-item v-for="(item, index) in block.children" :key="index">
        <view class="icr-carousel-item" @click.stop="activate(item)">
          <image v-if="item.url" class="icr-image" :src="item.url" :style="imageStyle(item)" :mode="imageMode(item)" />
        </view>
      </swiper-item>
    </swiper>

    <scroll-view v-else-if="layoutType === 'horizontal'" class="icr-horizontal" scroll-x>
      <view class="icr-horizontal-track" :style="{ gap: `${gap}rpx` }">
        <view
          v-for="(item, index) in block.children"
          :key="index"
          class="icr-horizontal-item"
          :style="itemContainerStyle(item)"
          @click.stop="activate(item)">
          <image v-if="item.url" class="icr-image" :src="item.url" :style="imageStyle(item)" :mode="imageMode(item)" />
        </view>
      </view>
    </scroll-view>

    <view v-else-if="layoutType === 'feature'" class="icr-feature" :style="{ gap: `${gap}rpx` }">
      <view v-for="(item, index) in block.children.slice(0, 3)" :key="index" class="icr-feature-item" @click.stop="activate(item)">
        <image v-if="item.url" class="icr-image" :src="item.url" :style="imageStyle(item)" :mode="imageMode(item)" />
      </view>
    </view>

    <view v-else class="icr-single">
      <view v-for="(item, index) in block.children" :key="index" class="icr-single-item" @click.stop="activate(item)">
        <image v-if="item.url" class="icr-single-image" :src="item.url" :style="imageStyle(item)" :mode="imageMode(item)" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { ContentAction } from '../../../content-model'
  import type { ImageBlockData, ImageItem } from '../../../schemas'

  const props = defineProps<{ block: ImageBlockData }>()
  const emit = defineEmits<{ (e: 'action', action: ContentAction): void }>()

  const layoutType = computed(() => props.block.layout?.type || 'grid')
  const gap = computed(() => props.block.layout?.gap ?? 12)
  const columns = computed(() => Math.max(1, props.block.layout?.columns || 2))
  const rootStyle = computed(() => (props.block.style?.backgroundColor ? { backgroundColor: props.block.style.backgroundColor } : {}))
  const gridStyle = computed(() => ({ gridTemplateColumns: `repeat(${columns.value}, minmax(0, 1fr))`, gap: `${gap.value}rpx` }))

  const toNumber = (value: number | string | undefined, fallback: number): number => {
    const parsed = typeof value === 'number' ? value : Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }

  const getSizeMode = (item: ImageItem): NonNullable<ImageItem['style']>['sizeMode'] => item.style?.sizeMode || 'auto'

  const imageStyle = (item: ImageItem): Record<string, string> => {
    const style = item.style || {}
    const result: Record<string, string> = {}
    const sizeMode = getSizeMode(item)

    if (sizeMode === 'auto') {
      result.width = '100%'
    } else if (sizeMode === 'fixedWidth') {
      result.width = `${toNumber(style.width, 300)}rpx`
      result.maxWidth = '100%'
    } else if (sizeMode === 'fixedHeight') {
      // fixedHeight 必须同时设置宽高，不能继续使用 widthFix 覆盖高度。
      result.width = '100%'
      result.height = `${toNumber(style.height, 300)}rpx`
    } else if (sizeMode === 'percentWidth') {
      result.width = `${Math.min(100, Math.max(1, toNumber(style.widthPercent, 100)))}%`
      result.maxWidth = '100%'
    } else if (sizeMode === 'percentHeight') {
      result.width = '100%'
      result.height = `${Math.min(100, Math.max(1, toNumber(style.heightPercent, 100)))}%`
    }

    const transforms: string[] = []
    if (style.rotateX) transforms.push(`rotateX(${style.rotateX}deg)`)
    if (style.rotateY) transforms.push(`rotateY(${style.rotateY}deg)`)
    if (style.rotate) transforms.push(`rotateZ(${style.rotate}deg)`)
    if (transforms.length) result.transform = transforms.join(' ')
    return result
  }

  const imageMode = (item: ImageItem): 'aspectFill' | 'heightFix' | 'widthFix' => {
    const sizeMode = getSizeMode(item)
    if (sizeMode === 'fixedHeight' || sizeMode === 'percentHeight') return 'aspectFill'
    if (sizeMode === 'fixedWidth' || sizeMode === 'percentWidth') return 'widthFix'
    return layoutType.value === 'single' ? 'widthFix' : 'aspectFill'
  }

  const gridCellStyle = (item: ImageItem): Record<string, string> => {
    const style = item.style || {}
    if (getSizeMode(item) === 'fixedHeight') {
      return {
        aspectRatio: 'auto',
        height: `${toNumber(style.height, 300)}rpx`,
      }
    }
    return {}
  }

  const itemContainerStyle = (item: ImageItem): Record<string, string> => {
    const style = item.style || {}
    if (getSizeMode(item) === 'fixedHeight') return { height: `${toNumber(style.height, 300)}rpx` }
    return {}
  }

  const activate = (item: ImageItem) => {
    const action = item.action || { type: 'previewImage', url: item.url }
    emit('action', { ...action, url: action.url || item.url })
  }
</script>

<style scoped>
  .icr-root {
    width: 100%;
    overflow: hidden;
  }
  .icr-grid {
    display: grid;
  }
  .icr-grid-cell {
    width: 100%;
    aspect-ratio: 1;
    overflow: hidden;
    border-radius: 6rpx;
    background: var(--theme-surface-2);
  }
  .icr-image {
    width: 100%;
    height: 100%;
  }
  .icr-carousel {
    width: 100%;
    height: 420rpx;
  }
  .icr-carousel-item {
    width: 100%;
    height: 100%;
  }
  .icr-horizontal {
    width: 100%;
    white-space: nowrap;
  }
  .icr-horizontal-track {
    display: inline-flex;
  }
  .icr-horizontal-item {
    width: 320rpx;
    height: 250rpx;
    overflow: hidden;
    border-radius: 6rpx;
    flex-shrink: 0;
  }
  .icr-feature {
    display: grid;
    grid-template-columns: 2fr 1fr;
    grid-template-rows: repeat(2, 210rpx);
  }
  .icr-feature-item {
    overflow: hidden;
    border-radius: 6rpx;
  }
  .icr-feature-item:first-child {
    grid-row: 1 / span 2;
  }
  .icr-single {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
  }
  .icr-single-item,
  .icr-single-image {
    width: 100%;
  }
  .icr-single-item {
    overflow: hidden;
    border-radius: 6rpx;
  }
</style>
