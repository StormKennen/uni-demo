<template>
  <view class="lbr-root" :class="{ 'lbr-selected': selected }" :style="rootStyle" @click="$emit('select', blockIndex)">
    <view class="lbr-header">
      <text class="lbr-tag">☷ 列表 #L{{ blockIndex + 1 }} · {{ block.mode === 'priority' ? '优先级' : '有序' }}</text>
    </view>
    <view v-for="(item, idx) in block.children" :key="idx" class="lbr-item">
      <text class="lbr-marker">{{ idx + 1 }}.</text>
      <view class="lbr-content">
        <view class="lbr-title-row">
          <text v-if="block.mode === 'priority' && isListPriority(item.priority)" class="lbr-priority" :class="`priority-${item.priority}`">
            {{ item.priority }}
          </text>
          <text class="lbr-text">{{ item.text || '未填写内容' }}</text>
        </view>
        <text v-if="item.desc" class="lbr-desc">{{ item.desc }}</text>
      </view>
      <view class="lbr-actions">
        <view class="lbr-btn" :class="{ disabled: idx === 0 }" @click.stop="moveItem(idx, -1)">↑</view>
        <view class="lbr-btn" :class="{ disabled: idx === block.children.length - 1 }" @click.stop="moveItem(idx, 1)">↓</view>
        <view class="lbr-btn" @click.stop="$emit('select-item', blockIndex, idx)">设置</view>
        <view class="lbr-btn danger" @click.stop="removeItem(idx)">×</view>
      </view>
    </view>
    <view v-if="!block.children.length" class="lbr-empty">暂无列表项</view>
    <view class="lbr-add" @click.stop="$emit('add-item', blockIndex)">+ 添加一项</view>
  </view>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { ListBlockData, ListPriority } from '../schemas/blocks/list-block.schema'

  interface Props {
    block: ListBlockData
    blockIndex: number
    selected?: boolean
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    (e: 'select', blockIndex: number): void
    (e: 'select-item', blockIndex: number, itemIndex: number): void
    (e: 'add-item', blockIndex: number): void
    (e: 'update:block', block: ListBlockData): void
  }>()

  const isListPriority = (value: unknown): value is ListPriority => value === 'P0' || value === 'P1' || value === 'P2' || value === 'P3'

  const rootStyle = computed(() => ({
    backgroundColor: props.block.style?.backgroundColor || '',
    textAlign: props.block.style?.textAlign || 'left',
  }))

  const updateBlock = (mutate: (block: ListBlockData) => void) => {
    const next = JSON.parse(JSON.stringify(props.block)) as ListBlockData
    mutate(next)
    emit('update:block', next)
  }

  const moveItem = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= props.block.children.length) return
    updateBlock(block => {
      const [item] = block.children.splice(index, 1)
      block.children.splice(target, 0, item)
    })
  }

  const removeItem = (index: number) => updateBlock(block => block.children.splice(index, 1))
</script>

<style scoped>
  .lbr-root {
    padding: 16rpx;
    margin-bottom: 16rpx;
    border-radius: 12rpx;
    background: #fff;
  }
  .lbr-selected {
    box-shadow: 0 0 0 2rpx #667eea;
  }
  .lbr-header {
    margin-bottom: 12rpx;
  }
  .lbr-tag {
    padding: 4rpx 12rpx;
    border-radius: 8rpx;
    background: #f5f5f5;
    color: #888;
    font-size: 22rpx;
  }
  .lbr-item {
    display: flex;
    align-items: flex-start;
    gap: 12rpx;
    padding: 8rpx 0;
  }
  .lbr-marker {
    width: 42rpx;
    flex-shrink: 0;
    color: #777;
    font-size: 26rpx;
    text-align: right;
  }
  .lbr-content {
    flex: 1;
    min-width: 0;
  }
  .lbr-title-row {
    display: flex;
    align-items: flex-start;
    gap: 10rpx;
  }
  .lbr-text {
    color: #333;
    font-size: 28rpx;
    line-height: 1.55;
  }
  .lbr-desc {
    display: block;
    margin-top: 4rpx;
    color: #777;
    font-size: 23rpx;
    line-height: 1.45;
  }
  .lbr-priority {
    min-width: 44rpx;
    padding: 2rpx 8rpx;
    border-radius: 6rpx;
    font-size: 20rpx;
    line-height: 30rpx;
    text-align: center;
  }
  .priority-P0 {
    background: #fde8e8;
    color: #c53030;
  }
  .priority-P1 {
    background: #fff1dc;
    color: #b7791f;
  }
  .priority-P2 {
    background: #e8f0fe;
    color: #3b62a3;
  }
  .priority-P3 {
    background: #edf2f7;
    color: #718096;
  }
  .lbr-actions {
    display: flex;
    flex-shrink: 0;
    gap: 6rpx;
  }
  .lbr-btn {
    min-width: 42rpx;
    height: 42rpx;
    padding: 0 8rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6rpx;
    background: #f5f5f5;
    color: #666;
    font-size: 20rpx;
  }
  .lbr-btn.disabled {
    opacity: 0.35;
  }
  .lbr-btn.danger {
    color: #d64545;
  }
  .lbr-empty {
    padding: 24rpx;
    color: #aaa;
    font-size: 24rpx;
    text-align: center;
  }
  .lbr-add {
    margin-top: 12rpx;
    padding: 16rpx;
    border: 1rpx dashed #ccd3e8;
    border-radius: 8rpx;
    color: #5269c7;
    font-size: 24rpx;
    text-align: center;
  }
</style>
