<template>
  <view class="flow-action-bar">
    <view class="flow-action-bar__info">
      <text class="flow-action-bar__title">{{ title }}</text>
      <text v-if="description" class="flow-action-bar__desc">{{ description }}</text>
    </view>
    <button class="flow-action-bar__btn" :disabled="disabled" @click="handleClick">{{ actionText }}</button>
  </view>
</template>

<script setup lang="ts">
  const props = withDefaults(
    defineProps<{
      title: string
      description?: string
      actionText?: string
      disabled?: boolean
    }>(),
    {
      description: '',
      actionText: '下一步',
      disabled: false,
    },
  )

  const emit = defineEmits<{
    (e: 'action'): void
  }>()

  const handleClick = () => {
    if (props.disabled) return
    emit('action')
  }
</script>

<style scoped lang="scss">
  .flow-action-bar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 90;
    display: flex;
    align-items: center;
    gap: 20rpx;
    padding: 20rpx 24rpx;
    padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
    padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
    background: var(--theme-surface);
    box-shadow: 0 -6rpx 24rpx var(--theme-shadow-xs);
  }

  .flow-action-bar__info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4rpx;
  }

  .flow-action-bar__title {
    font-size: 28rpx;
    font-weight: 800;
    color: var(--theme-text);
  }

  .flow-action-bar__desc {
    font-size: 22rpx;
    color: var(--theme-text-secondary);
  }

  .flow-action-bar__btn {
    flex-shrink: 0;
    min-width: 200rpx;
    height: 84rpx;
    padding: 0 36rpx;
    border: none;
    border-radius: 999rpx;
    font-size: 28rpx;
    font-weight: 700;
    color: #fff;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    box-shadow: 0 8rpx 24rpx rgba(99, 102, 241, 0.3);
  }

  .flow-action-bar__btn:disabled {
    opacity: 0.5;
    box-shadow: none;
  }
</style>
