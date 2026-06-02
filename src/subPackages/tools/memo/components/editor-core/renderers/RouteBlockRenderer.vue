<template>
  <view
    class="rbr-root"
    :class="{ 'rbr-selected': selected }"
    :style="rootStyle"
    @click="$emit('select', blockIndex)"
  >
    <view class="rbr-header">
      <text class="rbr-tag">🗺️ 路径 #L{{ blockIndex + 1 }} · {{ block.content.length }} 个节点</text>
    </view>

    <view class="rbr-timeline">
      <view
        v-for="(node, idx) in block.content"
        :key="idx"
        class="rbr-node"
        :class="{ 'rbr-node-end': node.isEnd, 'rbr-node-transfer': node.type === 'transfer' }"
      >
        <view class="rbr-dot">
          <text>{{ node.isEnd ? '🏁' : (node.type === 'transfer' ? '🔄' : '📍') }}</text>
        </view>
        <view class="rbr-content">
          <view class="rbr-name-row">
            <text class="rbr-name">{{ node.name || '未命名站点' }}</text>
            <text v-if="showTime && node.time" class="rbr-time">{{ node.time }}</text>
          </view>
          <text v-if="node.desc" class="rbr-desc">{{ node.desc }}</text>
        </view>
        <view class="rbr-item-actions">
          <view class="rbr-item-btn" @click.stop="$emit('select-item', blockIndex, idx)">⚙️</view>
          <view class="rbr-item-btn" @click.stop="removeItem(idx)">🗑️</view>
        </view>
      </view>

      <view v-if="!block.content.length" class="rbr-empty">
        <text>暂无节点</text>
      </view>
    </view>

    <view class="rbr-add-item" @click.stop="$emit('add-item', blockIndex)">
      <text class="rbr-add-text">+ 添加节点</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RouteBlockData } from '../../../schemas'

interface Props {
  block: RouteBlockData
  blockIndex: number
  selected?: boolean
}
const props = defineProps<Props>()
defineEmits<{
  (e: 'select', i: number): void
  (e: 'select-item', blockIndex: number, itemIndex: number): void
  (e: 'add-item', blockIndex: number): void
}>()

const removeItem = (idx: number) => {
  props.block.content.splice(idx, 1)
}

const showTime = computed(() => props.block.showTime !== false)

const rootStyle = computed(() => {
  const r: Record<string, string> = {}
  if (props.block.style?.backgroundColor) r.backgroundColor = props.block.style.backgroundColor
  if (props.block.style?.textAlign) r.textAlign = props.block.style.textAlign
  return r
})
</script>

<style scoped>
.rbr-root {
  padding: 16rpx;
  background: #fff;
  border-radius: 12rpx;
  margin-bottom: 16rpx;
}
.rbr-selected { box-shadow: 0 0 0 2rpx #667eea; }
.rbr-header { margin-bottom: 12rpx; }
.rbr-tag {
  font-size: 22rpx;
  color: #888;
  background: #f5f5f5;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}
.rbr-timeline { padding: 0 8rpx; }
.rbr-node {
  display: flex;
  gap: 16rpx;
  position: relative;
  padding-bottom: 24rpx;
}
.rbr-node:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 28rpx;
  top: 64rpx;
  bottom: 0;
  width: 2rpx;
  background: #ddd;
}
.rbr-dot {
  flex-shrink: 0;
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  z-index: 1;
}
.rbr-node-end .rbr-dot { background: #ffebee; }
.rbr-node-transfer .rbr-dot { background: #e3f2fd; }
.rbr-content { flex: 1; padding-top: 8rpx; }
.rbr-name-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 16rpx;
}
.rbr-name { font-size: 28rpx; font-weight: 500; color: #333; }
.rbr-time { font-size: 22rpx; color: #888; flex-shrink: 0; }
.rbr-desc { font-size: 24rpx; color: #666; margin-top: 6rpx; display: block; }
.rbr-empty {
  padding: 40rpx;
  text-align: center;
  color: #aaa;
  font-size: 24rpx;
}
.rbr-item-actions {
  flex-shrink: 0;
  display: flex;
  gap: 6rpx;
  align-self: flex-start;
}
.rbr-item-btn {
  width: 44rpx;
  height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 50%;
  font-size: 20rpx;
}
.rbr-add-item {
  margin-top: 16rpx;
  padding: 24rpx;
  background: rgba(102, 126, 234, 0.05);
  border: 2rpx dashed rgba(102, 126, 234, 0.3);
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.rbr-add-item:active {
  background: rgba(102, 126, 234, 0.1);
}
.rbr-add-text {
  font-size: 26rpx;
  color: #667eea;
}
</style>
