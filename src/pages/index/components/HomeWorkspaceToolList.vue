<script setup lang="ts">
  import type { KeyedToolItem } from '@/hooks/use-tool-directory'

  defineProps<{
    tools: KeyedToolItem[]
  }>()

  const emit = defineEmits<{
    select: [item: KeyedToolItem]
  }>()
</script>

<template>
  <view class="workspace-tool-list">
    <view
      v-for="item in tools"
      :key="item.key"
      class="workspace-tool-card"
      :class="{ 'workspace-tool-card--disabled': item.tool.disabled }"
      @click="emit('select', item)">
      <view class="workspace-tool-icon" :style="{ background: item.tool.gradient }">
        <uni-icons :type="item.tool.icon as any" size="21" color="#fff" />
      </view>
      <view class="workspace-tool-main">
        <view class="workspace-tool-title-row">
          <text class="workspace-tool-title">{{ item.tool.name }}</text>
          <text v-if="item.tool.isNew" class="workspace-tool-badge">NEW</text>
        </view>
        <text class="workspace-tool-desc">{{ item.tool.desc }}</text>
      </view>
      <text v-if="item.tool.requiresAuth" class="workspace-tool-meta">需登录</text>
      <uni-icons v-else type="right" size="15" color="var(--theme-text-tertiary)" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
  .workspace-tool-list {
    display: grid;
    gap: 16rpx;
  }

  .workspace-tool-card {
    display: flex;
    min-height: 112rpx;
    padding: 22rpx 24rpx;
    align-items: center;
    gap: 18rpx;
    box-sizing: border-box;
    border: 1rpx solid var(--theme-border);
    border-radius: 22rpx;
    background: var(--theme-surface);
    box-shadow: 0 8rpx 24rpx var(--theme-shadow-xs);
  }

  .workspace-tool-card:active {
    border-color: var(--theme-brand);
    background: var(--theme-surface-2);
  }

  .workspace-tool-card--disabled {
    opacity: 0.55;
  }

  .workspace-tool-icon {
    display: flex;
    width: 68rpx;
    height: 68rpx;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-radius: 19rpx;
  }

  .workspace-tool-main {
    display: flex;
    min-width: 0;
    flex: 1;
    flex-direction: column;
    gap: 7rpx;
  }

  .workspace-tool-title-row {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }

  .workspace-tool-title {
    overflow: hidden;
    color: var(--theme-text);
    font-size: 29rpx;
    font-weight: 650;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .workspace-tool-desc {
    overflow: hidden;
    color: var(--theme-text-secondary);
    font-size: 23rpx;
    line-height: 1.45;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .workspace-tool-badge {
    padding: 5rpx 10rpx;
    flex-shrink: 0;
    border-radius: 999rpx;
    background: var(--theme-surface-2);
    color: var(--theme-brand);
    font-size: 16rpx;
    line-height: 1;
  }

  .workspace-tool-meta {
    flex-shrink: 0;
    color: var(--theme-text-tertiary);
    font-size: 20rpx;
  }
</style>
