<template>
  <view
    class="mbr-root"
    :class="{ 'mbr-selected': selected }"
    :style="rootStyle"
    @click="$emit('select', blockIndex)"
  >
    <view class="mbr-header">
      <text class="mbr-tag">🎬 多媒体 #L{{ blockIndex + 1 }} · {{ block.children.length }} 项</text>
    </view>

    <view
      v-for="(item, idx) in block.children"
      :key="idx"
      class="mbr-card"
    >
      <text v-if="item.title" class="mbr-title">{{ item.title }}</text>

      <!-- 视频 -->
      <video
        v-if="isVideo(item.url)"
        :src="item.url"
        class="mbr-video"
        :autoplay="!!item.autoplay"
        :controls="item.controls !== false"
        :loop="!!item.loop"
      />

      <!-- 音频 -->
      <view v-else-if="isAudio(item.url)" class="mbr-audio">
        <view class="mbr-audio-icon">🎵</view>
        <view class="mbr-audio-info">
          <text class="mbr-audio-name">{{ item.title || '音频文件' }}</text>
          <view class="mbr-audio-flags">
            <text v-if="item.autoplay" class="mbr-flag">自动播放</text>
            <text v-if="item.loop" class="mbr-flag">循环</text>
          </view>
        </view>
      </view>

      <!-- 有 URL 但未识别格式：显示链接 -->
      <view v-else-if="item.url" class="mbr-unknown-url">
        <text class="mbr-unknown-icon">🔗</text>
        <text class="mbr-unknown-text">{{ item.url }}</text>
      </view>

      <!-- 空 URL 区域 -->
      <view v-else class="mbr-empty-url" @click.stop="openPickerForItem(idx)">
        <text class="mbr-empty-plus">+</text>
        <text>点击选择媒体文件</text>
      </view>

      <view class="mbr-item-actions">
        <view class="mbr-item-btn" @click.stop="openPickerForItem(idx)">🔄</view>
        <view class="mbr-item-btn" @click.stop="$emit('select-item', blockIndex, idx)">⚙️</view>
        <view class="mbr-item-btn" @click.stop="removeItem(idx)">🗑️</view>
      </view>
    </view>

    <view v-if="!block.children.length" class="mbr-empty">
      <text>暂无媒体</text>
    </view>

    <view class="mbr-add-item" @click.stop="openPickerForAdd">
      <text class="mbr-add-text">+ 添加媒体</text>
    </view>

    <!-- 资源选择弹窗 -->
    <ResourcePicker
      v-model:visible="pickerVisible"
      accept="video"
      title="选择媒体文件"
      @confirm="onResourceConfirm"
    />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { MediaBlockData } from '../../../schemas'
import ResourcePicker from '../components/ResourcePicker.vue'

interface Props {
  block: MediaBlockData
  blockIndex: number
  selected?: boolean
}
const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'select', i: number): void
  (e: 'select-item', blockIndex: number, itemIndex: number): void
  (e: 'add-item', blockIndex: number): void
}>()

const removeItem = (idx: number) => {
  props.block.children.splice(idx, 1)
}

// ===== ResourcePicker 集成 =====
const pickerVisible = ref(false)
const pickerTargetIdx = ref(-1)

const openPickerForAdd = () => {
  pickerTargetIdx.value = -1
  pickerVisible.value = true
}

const openPickerForItem = (idx: number) => {
  pickerTargetIdx.value = idx
  pickerVisible.value = true
}

const onResourceConfirm = (payload: { url: string; name?: string }) => {
  if (pickerTargetIdx.value >= 0) {
    const item = props.block.children[pickerTargetIdx.value]
    item.url = payload.url
    if (payload.name) item.title = payload.name
  } else {
    props.block.children.push({
      title: payload.name || '新媒体',
      url: payload.url,
      autoplay: false,
      controls: true,
      loop: false,
    })
  }
}

const rootStyle = computed(() => {
  const r: Record<string, string> = {}
  if (props.block.style?.backgroundColor) r.backgroundColor = props.block.style.backgroundColor
  return r
})

const isVideo = (url?: string) => !!url && /\.(mp4|mov|webm|m3u8)(\?|$)/i.test(url)
const isAudio = (url?: string) => !!url && /\.(mp3|wav|ogg|aac|m4a)(\?|$)/i.test(url)
</script>

<style scoped>
.mbr-root {
  padding: 16rpx;
  background: #fff;
  border-radius: 12rpx;
  margin-bottom: 16rpx;
}
.mbr-selected { box-shadow: 0 0 0 2rpx #667eea; }
.mbr-header { margin-bottom: 12rpx; }
.mbr-tag {
  font-size: 22rpx;
  color: #888;
  background: #f5f5f5;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}
.mbr-card {
  padding: 12rpx;
  background: #fafafa;
  border-radius: 8rpx;
  margin-bottom: 8rpx;
}
.mbr-title {
  font-size: 26rpx;
  color: #333;
  margin-bottom: 8rpx;
  display: block;
}
.mbr-video { width: 100%; height: 360rpx; border-radius: 8rpx; }
.mbr-audio {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx;
  background: #fff;
  border-radius: 8rpx;
}
.mbr-audio-icon { font-size: 40rpx; }
.mbr-audio-info { flex: 1; }
.mbr-audio-name { font-size: 26rpx; color: #333; }
.mbr-audio-flags {
  display: flex;
  gap: 8rpx;
  margin-top: 4rpx;
}
.mbr-flag {
  font-size: 18rpx;
  color: #fff;
  background: #667eea;
  padding: 2rpx 8rpx;
  border-radius: 4rpx;
}
.mbr-unknown {
  padding: 16rpx;
  background: #fff5f5;
  color: #c00;
  font-size: 22rpx;
  border-radius: 8rpx;
}
.mbr-empty {
  padding: 40rpx;
  text-align: center;
  color: #aaa;
  font-size: 24rpx;
}
.mbr-unknown-url {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx;
  background: #f9f9fb;
  border-radius: 8rpx;
}
.mbr-unknown-icon {
  font-size: 28rpx;
  flex-shrink: 0;
}
.mbr-unknown-text {
  font-size: 22rpx;
  color: #666;
  word-break: break-all;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.mbr-empty-url {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
  background: #f9f9f9;
  border: 2rpx dashed #ddd;
  border-radius: 8rpx;
  color: #aaa;
  font-size: 22rpx;
}
.mbr-empty-plus {
  font-size: 48rpx;
  color: #ccc;
  margin-bottom: 4rpx;
}
.mbr-item-actions {
  display: flex;
  gap: 6rpx;
  justify-content: flex-end;
  margin-top: 8rpx;
}
.mbr-item-btn {
  width: 44rpx;
  height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  border-radius: 50%;
  font-size: 20rpx;
}
.mbr-add-item {
  margin-top: 8rpx;
  padding: 24rpx;
  background: rgba(102, 126, 234, 0.05);
  border: 2rpx dashed rgba(102, 126, 234, 0.3);
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.mbr-add-item:active {
  background: rgba(102, 126, 234, 0.1);
}
.mbr-add-text {
  font-size: 26rpx;
  color: #667eea;
}
</style>
