<template>
  <view
    class="abr-root"
    :class="{ 'abr-selected': selected }"
    :style="rootStyle"
    @click="$emit('select', blockIndex)"
  >
    <view class="abr-header">
      <text class="abr-tag">📎 附件 #L{{ blockIndex + 1 }} · {{ block.children.length }} 项</text>
    </view>

    <view
      v-for="(item, idx) in block.children"
      :key="idx"
      class="abr-card"
    >
      <view v-if="item.url" class="abr-icon">📄</view>
      <view v-if="item.url" class="abr-info">
        <text class="abr-name">{{ item.name || '未命名附件' }}</text>
        <text v-if="item.size" class="abr-size">{{ formatSize(item.size) }}</text>
      </view>
      <view v-if="!item.url" class="abr-empty-url" @click.stop="openPickerForItem(idx)">
        <text class="abr-empty-plus">+</text>
        <text>点击选择附件</text>
      </view>
      <view class="abr-item-actions">
        <view class="abr-item-btn" @click.stop="openPickerForItem(idx)">🔄</view>
        <view class="abr-item-btn" @click.stop="$emit('select-item', blockIndex, idx)">⚙️</view>
        <view class="abr-item-btn" @click.stop="removeItem(idx)">🗑️</view>
      </view>
    </view>

    <view v-if="!block.children.length" class="abr-empty">
      <text>暂无附件</text>
    </view>

    <view class="abr-add-item" @click.stop="openPickerForAdd">
      <text class="abr-add-text">+ 添加附件</text>
    </view>

    <!-- 资源选择弹窗 -->
    <ResourcePicker
      v-model:visible="pickerVisible"
      accept="all"
      title="选择附件"
      @confirm="onResourceConfirm"
    />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { AttachmentBlockData } from '../../../schemas'
import ResourcePicker from '../components/ResourcePicker.vue'

interface Props {
  block: AttachmentBlockData
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

const onResourceConfirm = (payload: { url: string; name?: string; size?: number }) => {
  if (pickerTargetIdx.value >= 0) {
    const item = props.block.children[pickerTargetIdx.value]
    item.url = payload.url
    if (payload.name) item.name = payload.name
    if (payload.size) item.size = payload.size
  } else {
    props.block.children.push({
      name: payload.name || '新附件',
      url: payload.url,
      size: payload.size,
    })
  }
}

const rootStyle = computed(() => {
  const r: Record<string, string> = {}
  if (props.block.style?.backgroundColor) r.backgroundColor = props.block.style.backgroundColor
  return r
})

const formatSize = (b: number) => {
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / 1024 / 1024).toFixed(1)} MB`
}
</script>

<style scoped>
.abr-root {
  padding: 16rpx;
  background: #fff;
  border-radius: 12rpx;
  margin-bottom: 16rpx;
}
.abr-selected { box-shadow: 0 0 0 2rpx #667eea; }
.abr-header { margin-bottom: 12rpx; }
.abr-tag {
  font-size: 22rpx;
  color: #888;
  background: #f5f5f5;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}
.abr-card {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx;
  background: #fafafa;
  border-radius: 8rpx;
  margin-bottom: 8rpx;
}
.abr-icon {
  font-size: 40rpx;
  flex-shrink: 0;
}
.abr-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.abr-name { font-size: 26rpx; color: #333; }
.abr-size { font-size: 20rpx; color: #999; margin-top: 4rpx; }
.abr-empty {
  padding: 40rpx;
  text-align: center;
  color: #aaa;
  font-size: 24rpx;
}
.abr-empty-url {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16rpx;
  color: #aaa;
  font-size: 22rpx;
}
.abr-empty-plus {
  font-size: 40rpx;
  color: #ccc;
}
.abr-item-actions {
  flex-shrink: 0;
  display: flex;
  gap: 6rpx;
}
.abr-item-btn {
  width: 44rpx;
  height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  border-radius: 50%;
  font-size: 20rpx;
}
.abr-add-item {
  margin-top: 8rpx;
  padding: 24rpx;
  background: rgba(102, 126, 234, 0.05);
  border: 2rpx dashed rgba(102, 126, 234, 0.3);
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.abr-add-item:active {
  background: rgba(102, 126, 234, 0.1);
}
.abr-add-text {
  font-size: 26rpx;
  color: #667eea;
}
</style>
