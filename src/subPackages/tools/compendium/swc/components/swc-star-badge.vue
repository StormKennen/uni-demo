<template>
  <view v-if="normalizedCount > 0" class="swc-star-badge" :class="{ stacked: layout === 'stacked' }" :style="badgeStyle">
    <text v-for="item in normalizedCount" :key="item" class="star-icon">★</text>
  </view>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  type StarLayout = 'flat' | 'stacked'

  const props = withDefaults(
    defineProps<{
      count?: number
      layout?: StarLayout
      size?: number
    }>(),
    {
      count: 0,
      layout: 'flat',
      size: 20,
    },
  )

  const normalizedCount = computed(() => Math.max(0, Math.min(6, Math.floor(Number(props.count) || 0))))

  const badgeStyle = computed(() => ({
    '--star-size': `${props.size}rpx`,
  }))
</script>

<style scoped lang="scss">
  .swc-star-badge {
    display: flex;
    align-items: flex-end;
    gap: 4rpx;
    white-space: nowrap;
  }

  .swc-star-badge.stacked {
    gap: 0;
  }

  .star-icon {
    color: #fbbf24;
    font-size: var(--star-size);
    line-height: 1;
    text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.25);
  }

  .swc-star-badge.stacked .star-icon + .star-icon {
    margin-left: -0.34em;
  }
</style>
