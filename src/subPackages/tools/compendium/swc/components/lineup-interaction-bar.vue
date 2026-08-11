<template>
  <view class="interaction-bar" :class="{ disabled: props.disabled }">
    <view class="interaction-actions">
      <view
        class="interaction-btn"
        :class="{ active: props.myReaction === 1 }"
        :aria-disabled="props.disabled"
        @click="emitReaction('like')">
        <text>👍 {{ props.likeCount }}</text>
      </view>
      <view
        class="interaction-btn"
        :class="{ active: props.myReaction === -1 }"
        :aria-disabled="props.disabled"
        @click="emitReaction('dislike')">
        <text>👎 {{ props.dislikeCount }}</text>
      </view>
      <view
        class="interaction-btn favorite-btn"
        :class="{ active: props.isFavorite }"
        :aria-disabled="props.disabled"
        @click="emitReaction('favorite')">
        <text>{{ props.isFavorite ? '★' : '☆' }} 收藏</text>
      </view>
    </view>
    <text v-if="props.showScore" class="interaction-score">热度 {{ props.score }}</text>
  </view>
</template>

<script setup lang="ts">
  const props = withDefaults(
    defineProps<{
      likeCount?: number
      dislikeCount?: number
      score?: number
      myReaction?: number
      isFavorite?: boolean
      showScore?: boolean
      disabled?: boolean
    }>(),
    {
      likeCount: 0,
      dislikeCount: 0,
      score: 0,
      myReaction: 0,
      isFavorite: false,
      showScore: true,
      disabled: false,
    },
  )

  const emit = defineEmits<{
    (event: 'like'): void
    (event: 'dislike'): void
    (event: 'favorite'): void
  }>()

  const emitReaction = (action: 'like' | 'dislike' | 'favorite') => {
    if (props.disabled) return
    // BACKEND-CONTRACT-PENDING: 收藏动作等待后端接口与 Apifox 类型生成后接入。
    if (action === 'like') emit('like')
    else if (action === 'dislike') emit('dislike')
    else emit('favorite')
  }
</script>

<style scoped lang="scss">
  .interaction-bar {
    display: flex;
    align-items: center;
    gap: 12rpx;
    min-width: 0;
  }

  .interaction-actions {
    display: flex;
    align-items: center;
    gap: 8rpx;
    min-width: 0;
  }

  .interaction-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 72rpx;
    min-height: 48rpx;
    padding: 0 14rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 999rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text-secondary);
    font-size: 21rpx;
    font-weight: 700;
    box-sizing: border-box;
  }

  .interaction-btn:active {
    opacity: 0.7;
  }

  .interaction-btn.active {
    border-color: var(--theme-brand);
    background: #fef3c7;
    color: #b45309;
  }

  .favorite-btn.active {
    color: #b45309;
  }

  .interaction-score {
    margin-left: auto;
    flex-shrink: 0;
    color: var(--theme-text-tertiary);
    font-size: 22rpx;
    font-weight: 700;
  }

  .interaction-bar.disabled {
    opacity: 0.6;
  }
</style>
