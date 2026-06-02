<template>
  <view
    class="tbr-root"
    :class="{ 'tbr-selected': selected }"
    :style="rootStyle"
    @click="$emit('select', blockIndex)"
  >
    <view class="tbr-header">
      <text class="tbr-tag">📝 文字 #L{{ blockIndex + 1 }}</text>
    </view>

    <view class="tbr-body">
      <view
        v-for="(item, idx) in block.children"
        :key="idx"
        class="tbr-item-row"
      >
        <textarea
          class="tbr-item"
          :style="itemTextStyle(item)"
          :value="item.value"
          :auto-height="true"
          :placeholder="`第 ${idx + 1} 段...`"
          @input="onItemInput(idx, $event)"
        />
        <view class="tbr-item-actions">
          <view
            class="tbr-item-cog"
            @click.stop="$emit('select-item', blockIndex, idx)"
          >⚙️</view>
          <view
            class="tbr-item-del"
            @click.stop="removeItem(idx)"
          >🗑️</view>
        </view>
      </view>
      
      <view class="tbr-add-item" @click.stop="$emit('add-item', blockIndex)">
        <text class="tbr-add-text">+ 添加段落</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TextBlockData, TextItem } from '../schemas/blocks/text-block.schema'

interface Props {
  block: TextBlockData
  blockIndex: number
  selected?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'select', blockIndex: number): void
  (e: 'select-item', blockIndex: number, itemIndex: number): void
  (e: 'add-item', blockIndex: number): void
  (e: 'update:block', block: TextBlockData): void
}>()

/** item 文本样式 → CSS object */
const itemTextStyle = (item: TextItem) => {
  const s = item.style || {}
  const css: Record<string, string> = {}
  if (s.bold) css.fontWeight = 'bold'
  if (s.italic) css.fontStyle = 'italic'
  if (s.underline) css.textDecoration = 'underline'
  else if (s.lineThrough) css.textDecoration = 'line-through'
  if (s.fontSize) css.fontSize = `${s.fontSize}px`
  if (s.color) css.color = s.color
  return css
}

const rootStyle = computed(() => {
  const style: Record<string, string> = {}
  const s = props.block.style || {}
  if (s.textAlign) style.textAlign = s.textAlign
  if (s.backgroundColor) style.backgroundColor = s.backgroundColor
  if (s.borderTop) style.borderTop = '2rpx solid #888'
  if (s.borderBottom) style.borderBottom = '2rpx solid #888'
  return style
})

const onItemInput = (idx: number, e: any) => {
  // uni-app textarea 通过 e.detail.value 传值；直接修改 reactive child
  props.block.children[idx].value = e?.detail?.value ?? ''
}

const removeItem = (idx: number) => {
  if (props.block.children.length <= 1) {
    uni.showToast({ title: '至少保留一段', icon: 'none' })
    return
  }
  props.block.children.splice(idx, 1)
}
</script>

<style scoped>
.tbr-root {
  padding: 16rpx;
  background: #fff;
  border-radius: 12rpx;
  margin-bottom: 16rpx;
  transition: box-shadow 0.2s;
}

.tbr-selected {
  box-shadow: 0 0 0 2rpx #667eea;
}

.tbr-header {
  margin-bottom: 8rpx;
}

.tbr-tag {
  font-size: 22rpx;
  color: #888;
  background: #f5f5f5;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.tbr-body {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.tbr-item-row {
  display: flex;
  align-items: flex-start;
  gap: 8rpx;
}

.tbr-item {
  flex: 1;
  width: 100%;
  min-height: 60rpx;
  font-size: 28rpx;
  line-height: 1.6;
  color: #333;
  padding: 8rpx;
  border: none;
  background: transparent;
}

.tbr-item-actions {
  flex-shrink: 0;
  display: flex;
  gap: 8rpx;
}

.tbr-item-cog,
.tbr-item-del {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 50%;
  font-size: 22rpx;
}

.tbr-item-del {
  font-size: 20rpx;
}

.tbr-add-item {
  margin-top: 16rpx;
  padding: 24rpx;
  background: rgba(102, 126, 234, 0.05);
  border: 2rpx dashed rgba(102, 126, 234, 0.3);
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.tbr-add-item:active {
  background: rgba(102, 126, 234, 0.1);
}

.tbr-add-text {
  font-size: 26rpx;
  color: #667eea;
}
</style>
