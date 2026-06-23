<template>
  <view class="state-block-inner">
    <text>{{ text }}</text>
    <button
      v-if="actionText"
      class="state-action-btn"
      :class="theme"
      :size="resolvedActionSize"
      @click="$emit('action')">
      {{ actionText }}
    </button>
  </view>
</template>

<script setup lang="ts">
  const props = withDefaults(defineProps<{
    text: string
    actionText?: string
    theme?: 'amber' | 'teal' | 'violet'
    actionSize?: 'default' | 'mini'
  }>(), {
    actionText: '',
    theme: 'violet',
    actionSize: 'default',
  })

  defineEmits<{
    (event: 'action'): void
  }>()

  const resolvedActionSize = props.actionSize === 'mini' ? 'mini' : undefined
</script>

<style scoped lang="scss">
  .state-block-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 18rpx;
  }

  .state-action-btn {
    border-radius: 999rpx;
    font-size: 24rpx;
    font-weight: 700;
  }

  .state-action-btn.amber {
    background: #b45309;
    color: #fff;
  }

  .state-action-btn.teal {
    background: #0f766e;
    color: #fff;
  }

  .state-action-btn.violet {
    background: #7c3aed;
    color: #fff;
  }
</style>
