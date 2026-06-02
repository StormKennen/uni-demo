<template>
  <view
    class="ibr-root"
    :class="{ 'ibr-selected': selected }"
    :style="rootStyle"
    @click="$emit('select', blockIndex)"
  >
    <view class="ibr-header">
      <text class="ibr-tag">
        🖼️ 图片 #L{{ blockIndex + 1 }} · {{ layoutLabel }}
        <text v-if="isGrid"> · {{ columns }}列</text>
      </text>
    </view>

    <!-- grid 布局 -->
    <view v-if="isGrid" class="ibr-grid" :style="gridStyle">
      <view
        v-for="(item, idx) in block.children"
        :key="idx"
        class="ibr-cell"
      >
        <image
          v-if="item.url && !errorItems.has(idx)"
          :src="item.url"
          class="ibr-img"
          mode="aspectFill"
          @error="onImgError(idx)"
        />
        <view v-else-if="item.url && errorItems.has(idx)" class="ibr-error" @click.stop="openPickerForItem(idx)">
          <text class="ibr-error-icon">⚠️</text>
          <text class="ibr-error-text">图片加载失败</text>
          <text class="ibr-error-url">{{ item.url }}</text>
        </view>
        <view v-else class="ibr-empty" @click.stop="openPickerForItem(idx)">
          <text class="ibr-empty-plus">+</text>
          <text>点击选择图片</text>
        </view>
        <view class="ibr-item-actions">
          <view class="ibr-item-btn" @click.stop="openPickerForItem(idx)">🔄</view>
          <view class="ibr-item-btn" @click.stop="$emit('select-item', blockIndex, idx)">⚙️</view>
          <view class="ibr-item-btn" @click.stop="removeItem(idx)">🗑️</view>
        </view>
      </view>
    </view>

    <!-- carousel 布局 -->
    <swiper
      v-else-if="isCarousel"
      class="ibr-swiper"
      indicator-dots
      circular
      :autoplay="false"
    >
      <swiper-item v-for="(item, idx) in block.children" :key="idx">
        <view class="ibr-swiper-item">
          <image
            v-if="item.url && !errorItems.has(idx)"
            :src="item.url"
            class="ibr-swiper-img"
            mode="aspectFill"
            @error="onImgError(idx)"
          />
          <view v-else-if="item.url && errorItems.has(idx)" class="ibr-error" @click.stop="openPickerForItem(idx)">
            <text class="ibr-error-icon">⚠️</text>
            <text class="ibr-error-text">图片加载失败</text>
          </view>
          <view v-else class="ibr-empty" @click.stop="openPickerForItem(idx)">
            <text class="ibr-empty-plus">+</text>
            <text>点击选择图片</text>
          </view>
          <view class="ibr-item-actions">
            <view class="ibr-item-btn" @click.stop="openPickerForItem(idx)">🔄</view>
            <view class="ibr-item-btn" @click.stop="$emit('select-item', blockIndex, idx)">⚙️</view>
            <view class="ibr-item-btn" @click.stop="removeItem(idx)">🗑️</view>
          </view>
        </view>
      </swiper-item>
    </swiper>

    <!-- free 布局：垂直堆叠 -->
    <view v-else class="ibr-free">
      <view
        v-for="(item, idx) in block.children"
        :key="idx"
        class="ibr-free-row"
      >
        <image
          v-if="item.url && !errorItems.has(idx)"
          :src="item.url"
          class="ibr-free-img"
          mode="widthFix"
          @error="onImgError(idx)"
        />
        <view v-else-if="item.url && errorItems.has(idx)" class="ibr-error ibr-free-empty" @click.stop="openPickerForItem(idx)">
          <text class="ibr-error-icon">⚠️</text>
          <text class="ibr-error-text">图片加载失败</text>
          <text class="ibr-error-url">{{ item.url }}</text>
        </view>
        <view v-else class="ibr-empty ibr-free-empty" @click.stop="openPickerForItem(idx)">
          <text class="ibr-empty-plus">+</text>
          <text>点击选择图片</text>
        </view>
        <view class="ibr-item-actions">
          <view class="ibr-item-btn" @click.stop="openPickerForItem(idx)">🔄</view>
          <view class="ibr-item-btn" @click.stop="$emit('select-item', blockIndex, idx)">⚙️</view>
          <view class="ibr-item-btn" @click.stop="removeItem(idx)">🗑️</view>
        </view>
      </view>
    </view>

    <!-- 添加图片按钮 -->
    <view class="ibr-add-item" @click.stop="openPickerForAdd">
      <text class="ibr-add-text">+ 添加图片</text>
    </view>

    <!-- 资源选择弹窗 -->
    <ResourcePicker
      v-model:visible="pickerVisible"
      accept="image"
      title="选择图片"
      @confirm="onResourceConfirm"
    />
  </view>
</template>

<script setup lang="ts">
import { computed, ref, reactive } from 'vue'
import type { ImageBlockData } from '../schemas/blocks/image-block.schema'
import ResourcePicker from '../components/ResourcePicker.vue'

interface Props {
  block: ImageBlockData
  blockIndex: number
  selected?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'select', blockIndex: number): void
  (e: 'select-item', blockIndex: number, itemIndex: number): void
  (e: 'add-item', blockIndex: number): void
}>()

const removeItem = (idx: number) => {
  props.block.children.splice(idx, 1)
}

// ===== 图片加载失败占位 =====
const errorItems = reactive(new Set<number>())
const onImgError = (idx: number) => {
  errorItems.add(idx)
}

// ===== ResourcePicker 集成 =====
const pickerVisible = ref(false)
/** -1 = 新增模式，>=0 = 替换指定 item */
const pickerTargetIdx = ref(-1)

const openPickerForAdd = () => {
  pickerTargetIdx.value = -1
  pickerVisible.value = true
}

const openPickerForItem = (idx: number) => {
  pickerTargetIdx.value = idx
  pickerVisible.value = true
}

const onResourceConfirm = (payload: { url: string; name?: string; size?: number }) => {
  if (pickerTargetIdx.value >= 0) {
    // 替换现有 item，清除错误标记
    errorItems.delete(pickerTargetIdx.value)
    props.block.children[pickerTargetIdx.value].url = payload.url
  } else {
    // 新增 item
    props.block.children.push({ url: payload.url, style: { sizeMode: 'auto' } })
  }
}

const isGrid = computed(() => props.block.layout?.type === 'grid')
const isCarousel = computed(() => props.block.layout?.type === 'carousel')

const columns = computed(() => Math.max(1, props.block.layout?.columns || 2))
const gap = computed(() => props.block.layout?.gap ?? 12)

const layoutLabel = computed(() => {
  const t = props.block.layout?.type
  return t === 'grid' ? '网格' : t === 'carousel' ? '轮播' : '自由'
})

const rootStyle = computed(() => {
  const result: Record<string, string> = {}
  if (props.block.style?.backgroundColor) {
    result.backgroundColor = props.block.style.backgroundColor
  }
  return result
})

const gridStyle = computed(() => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${columns.value}, 1fr)`,
  gap: `${gap.value}rpx`,
}))
</script>

<style scoped>
.ibr-root {
  padding: 16rpx;
  background: #fff;
  border-radius: 12rpx;
  margin-bottom: 16rpx;
  transition: box-shadow 0.2s;
}

.ibr-selected {
  box-shadow: 0 0 0 2rpx #667eea;
}

.ibr-header {
  margin-bottom: 12rpx;
}

.ibr-tag {
  font-size: 22rpx;
  color: #888;
  background: #f5f5f5;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.ibr-grid {
  width: 100%;
}

.ibr-cell {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  background: #f5f5f5;
  border-radius: 8rpx;
  overflow: hidden;
}

.ibr-img {
  width: 100%;
  height: 100%;
}

.ibr-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #aaa;
  font-size: 22rpx;
  cursor: pointer;
}

.ibr-empty-plus {
  font-size: 48rpx;
  color: #ccc;
  margin-bottom: 4rpx;
}

.ibr-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 120rpx;
  background: #fff5f5;
  border: 2rpx dashed #ffb3b3;
  border-radius: 8rpx;
  padding: 16rpx;
  gap: 4rpx;
}

.ibr-error-icon {
  font-size: 36rpx;
}

.ibr-error-text {
  font-size: 22rpx;
  color: #e53935;
}

.ibr-error-url {
  font-size: 18rpx;
  color: #999;
  word-break: break-all;
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.ibr-empty-block {
  padding: 40rpx 0;
  text-align: center;
  color: #aaa;
  font-size: 24rpx;
}

.ibr-swiper {
  width: 100%;
  height: 360rpx;
}

.ibr-swiper-img {
  width: 100%;
  height: 100%;
}

.ibr-free {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.ibr-free-img {
  width: 100%;
  border-radius: 8rpx;
}

.ibr-free-row {
  position: relative;
}

.ibr-free-empty {
  width: 100%;
  height: 120rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
}

.ibr-swiper-item {
  position: relative;
  width: 100%;
  height: 100%;
}

.ibr-item-actions {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  display: flex;
  gap: 6rpx;
  z-index: 2;
}

.ibr-item-btn {
  width: 44rpx;
  height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  font-size: 20rpx;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.15);
}

.ibr-add-item {
  margin-top: 16rpx;
  padding: 24rpx;
  background: rgba(102, 126, 234, 0.05);
  border: 2rpx dashed rgba(102, 126, 234, 0.3);
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ibr-add-item:active {
  background: rgba(102, 126, 234, 0.1);
}

.ibr-add-text {
  font-size: 26rpx;
  color: #667eea;
}
</style>
