<template>
  <view v-if="iconSrc" class="swc-leader-skill-icon" :style="rootStyle">
    <text v-if="amountText" class="swc-leader-skill-icon__amount">{{ amountText }}</text>
    <image class="swc-leader-skill-icon__image" :src="iconSrc" mode="aspectFit" lazy-load />
  </view>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import {
    buildLeaderSkillIconUrl,
    formatLeaderSkillAmountText,
    type SwcLeaderSkillInput,
  } from '../icon-assets'

  const props = withDefaults(
    defineProps<{
      leaderSkill?: SwcLeaderSkillInput | null
      size?: number
      radius?: number
      background?: string
    }>(),
    {
      leaderSkill: null,
      size: 80,
      radius: 14,
      background: 'var(--theme-surface-2)',
    },
  )

  const iconSrc = computed(() => buildLeaderSkillIconUrl(props.leaderSkill))
  const amountText = computed(() => formatLeaderSkillAmountText(props.leaderSkill?.amount))

  const rootStyle = computed(() => ({
    width: `${props.size}rpx`,
    height: `${props.size}rpx`,
    borderRadius: `${props.radius}rpx`,
    background: props.background,
  }))
</script>

<style scoped lang="scss">
  .swc-leader-skill-icon {
    position: relative;
    box-sizing: border-box;
    flex: none;
    overflow: hidden;
    border: 1rpx solid var(--theme-border);
  }

  .swc-leader-skill-icon__image {
    display: block;
    width: 100%;
    height: 100%;
  }

  .swc-leader-skill-icon__amount {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    max-width: 100%;
    padding: 2rpx 6rpx;
    border-bottom-right-radius: 10rpx;
    background: rgba(18, 24, 38, 0.78);
    color: #fff;
    font-size: 18rpx;
    font-weight: 700;
    line-height: 1.2;
  }
</style>
