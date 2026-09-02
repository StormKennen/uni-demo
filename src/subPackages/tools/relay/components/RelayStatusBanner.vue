<script setup lang="ts">
  import { computed } from 'vue'
  import { formatRelayDate } from '../constants'
  import type { RelayPermissionsViewModel, RelayViewModel } from '../types'

  const props = defineProps<{
    relay: RelayViewModel
    permissions: RelayPermissionsViewModel
  }>()

  const title = computed(() => {
    if (props.relay.status === 'closed') return '接龙已结束'
    if (props.relay.status === 'deleted') return '接龙已删除'
    if (!props.permissions.canSubmit && props.relay.settings.deadline) return `接龙已截止 · ${formatRelayDate(props.relay.settings.deadline)}`
    if (!props.permissions.canSubmit && props.relay.settings.participantLimit) return '接龙名额已满'
    return ''
  })
</script>

<template>
  <view v-if="title" class="status-banner">
    <text class="status-banner__title">{{ title }}</text>
    <text class="status-banner__hint">仍可查看已有接龙记录</text>
  </view>
</template>

<style scoped lang="scss">
  .status-banner {
    margin-bottom: 20rpx;
    padding: 20rpx 22rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 18rpx;
    background: var(--theme-surface-2);
  }

  .status-banner__title,
  .status-banner__hint {
    display: block;
  }

  .status-banner__title {
    color: var(--theme-text);
    font-size: 27rpx;
    font-weight: 700;
  }

  .status-banner__hint {
    margin-top: 8rpx;
    color: var(--theme-text-secondary);
    font-size: 22rpx;
  }
</style>
