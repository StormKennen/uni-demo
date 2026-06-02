<template>
  <TextBlockRenderer
    v-if="block?.type === 'text'"
    :block="block"
    :block-index="blockIndex"
    :selected="selected"
    @select="(i: number) => $emit('select', i)"
    @select-item="(i: number, j: number) => $emit('select-item', i, j)"
    @add-item="(i: number) => $emit('add-item', i)"
    @update:block="(b: any) => $emit('update:block', b)"
  />
  <ImageBlockRenderer
    v-else-if="block?.type === 'image'"
    :block="block"
    :block-index="blockIndex"
    :selected="selected"
    @select="(i: number) => $emit('select', i)"
    @select-item="(i: number, j: number) => $emit('select-item', i, j)"
    @add-item="(i: number) => $emit('add-item', i)"
    @update:block="(b: any) => $emit('update:block', b)"
  />
  <RouteBlockRenderer
    v-else-if="block?.type === 'route'"
    :block="block"
    :block-index="blockIndex"
    :selected="selected"
    @select="(i: number) => $emit('select', i)"
    @select-item="(i: number, j: number) => $emit('select-item', i, j)"
    @add-item="(i: number) => $emit('add-item', i)"
    @update:block="(b: any) => $emit('update:block', b)"
  />
  <AttachmentBlockRenderer
    v-else-if="block?.type === 'attachment'"
    :block="block"
    :block-index="blockIndex"
    :selected="selected"
    @select="(i: number) => $emit('select', i)"
    @select-item="(i: number, j: number) => $emit('select-item', i, j)"
    @add-item="(i: number) => $emit('add-item', i)"
    @update:block="(b: any) => $emit('update:block', b)"
  />
  <MediaBlockRenderer
    v-else-if="block?.type === 'media'"
    :block="block"
    :block-index="blockIndex"
    :selected="selected"
    @select="(i: number) => $emit('select', i)"
    @select-item="(i: number, j: number) => $emit('select-item', i, j)"
    @add-item="(i: number) => $emit('add-item', i)"
    @update:block="(b: any) => $emit('update:block', b)"
  />
  <view v-else class="bh-unknown">
    <text>⚠️ 未注册的 Block 类型：{{ block?.type }}</text>
  </view>
</template>

<script setup lang="ts">
import TextBlockRenderer from './TextBlockRenderer.vue'
import ImageBlockRenderer from './ImageBlockRenderer.vue'
import RouteBlockRenderer from './RouteBlockRenderer.vue'
import AttachmentBlockRenderer from './AttachmentBlockRenderer.vue'
import MediaBlockRenderer from './MediaBlockRenderer.vue'

interface Props {
  block: any
  blockIndex: number
  selected?: boolean
}

defineProps<Props>()

defineEmits<{
  (e: 'select', blockIndex: number): void
  (e: 'select-item', blockIndex: number, itemIndex: number): void
  (e: 'add-item', blockIndex: number): void
  (e: 'update:block', block: any): void
}>()
</script>

<style scoped>
.bh-unknown {
  padding: 24rpx;
  background: #fff5f5;
  border: 2rpx dashed #f55;
  color: #f55;
  font-size: 24rpx;
  border-radius: 8rpx;
  margin-bottom: 16rpx;
}
</style>
