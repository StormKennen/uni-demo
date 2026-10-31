<template>
  <view v-if="tier" class="rta-tier-stars" :class="{ stacked: layout === 'stacked' }" :style="starsStyle">
    <text v-for="index in tier.count" :key="index" class="star" :style="{ color: tier.color }">★</text>
  </view>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { getRtaTierMeta } from './rta-tier'

  type StarLayout = 'flat' | 'stacked'

  const props = withDefaults(
    defineProps<{
      targetKey?: string
      layout?: StarLayout
      size?: number
    }>(),
    {
      targetKey: '',
      layout: 'flat',
      size: 24,
    },
  )

  const tier = computed(() => getRtaTierMeta(props.targetKey))
  const starsStyle = computed(() => ({
    '--star-size': `${Math.max(16, Math.min(48, Math.floor(props.size)))}rpx`,
  }))
</script>

<style scoped lang="scss">
  .rta-tier-stars {
    display: inline-flex;
    align-items: flex-end;
    flex-shrink: 0;
    gap: 4rpx;
    white-space: nowrap;
  }

  .rta-tier-stars.stacked {
    gap: 0;
  }

  .star {
    font-size: var(--star-size);
    line-height: 1;
    text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.25);
  }

  .rta-tier-stars.stacked .star + .star {
    margin-left: -0.34em;
  }
</style>
