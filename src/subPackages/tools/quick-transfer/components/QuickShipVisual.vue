<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { QUICK_SHIP_IMAGE_URL, type QuickShipVisualState } from '@/features/quick-transfer/visual'

  interface Props {
    state: QuickShipVisualState
    compact?: boolean
  }

  const props = withDefaults(defineProps<Props>(), { compact: false })
  const imageFailed = ref(false)
  const transitionFinished = ref(false)

  const visualState = computed<QuickShipVisualState | 'arrived-static'>(() => {
    if (props.state === 'departing' && transitionFinished.value) return 'traveling'
    if (props.state === 'arrived' && transitionFinished.value) return 'arrived-static'
    return props.state
  })

  watch(
    () => props.state,
    () => {
      transitionFinished.value = false
      imageFailed.value = false
    },
  )

  const handleImageError = () => {
    imageFailed.value = true
  }

  const handleAnimationEnd = (event: { animationName?: string; detail?: { animationName?: string } }) => {
    const animationName = event.animationName || event.detail?.animationName
    if (animationName === 'quick-ship-depart' || animationName === 'quick-ship-arrive') transitionFinished.value = true
  }
</script>

<template>
  <view
    v-if="!imageFailed"
    class="quick-ship-visual"
    :class="[`quick-ship-visual--${visualState}`, { 'quick-ship-visual--compact': compact }]">
    <image
      class="quick-ship-visual__image"
      :src="QUICK_SHIP_IMAGE_URL"
      mode="aspectFit"
      :lazy-load="false"
      @error="handleImageError"
      @animationend="handleAnimationEnd" />
  </view>
</template>

<style scoped lang="scss">
  .quick-ship-visual {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 260rpx;
    overflow: visible;
    pointer-events: none;
  }

  .quick-ship-visual--compact {
    min-height: 150rpx;
  }

  .quick-ship-visual__image {
    width: 380rpx;
    height: 240rpx;
    will-change: transform, opacity;
  }

  .quick-ship-visual--compact .quick-ship-visual__image {
    width: 280rpx;
    height: 170rpx;
  }

  .quick-ship-visual--idle .quick-ship-visual__image,
  .quick-ship-visual--traveling .quick-ship-visual__image,
  .quick-ship-visual--arrived-static .quick-ship-visual__image {
    animation: quick-ship-float 2.6s ease-in-out infinite;
  }

  .quick-ship-visual--loading .quick-ship-visual__image {
    animation: quick-ship-loading 1.7s ease-in-out infinite;
  }

  .quick-ship-visual--departing .quick-ship-visual__image {
    animation: quick-ship-depart 850ms ease-in forwards;
  }

  .quick-ship-visual--arrived .quick-ship-visual__image {
    animation: quick-ship-arrive 850ms cubic-bezier(0.2, 1.3, 0.4, 1) forwards;
  }

  .quick-ship-visual--returned .quick-ship-visual__image {
    animation: quick-ship-return 800ms ease-in forwards;
  }

  .quick-ship-visual--cancelled .quick-ship-visual__image {
    animation: quick-ship-cancel 800ms ease-in forwards;
  }

  @keyframes quick-ship-float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10rpx);
    }
  }

  @keyframes quick-ship-loading {
    0%,
    100% {
      transform: translate(0, 0) scale(1);
      opacity: 0.92;
    }
    50% {
      transform: translate(8rpx, -8rpx) scale(1.02);
      opacity: 1;
    }
  }

  @keyframes quick-ship-depart {
    0% {
      transform: translate(0, 0) scale(1);
      opacity: 1;
    }
    100% {
      transform: translate(100vw, -20rpx) scale(0.75);
      opacity: 0.2;
    }
  }

  @keyframes quick-ship-arrive {
    0% {
      transform: translateX(-110vw) scale(0.8);
      opacity: 0.25;
    }
    78% {
      transform: translateX(20rpx) scale(1.05);
      opacity: 1;
    }
    100% {
      transform: translateX(0) scale(1);
      opacity: 1;
    }
  }

  @keyframes quick-ship-return {
    0% {
      transform: translate(0, 0) scale(1);
      opacity: 1;
    }
    100% {
      transform: translateX(-110vw) scale(0.72);
      opacity: 0;
    }
  }

  @keyframes quick-ship-cancel {
    0% {
      transform: translateX(0) scaleX(1);
      opacity: 1;
    }
    100% {
      transform: translateX(-110vw) scaleX(-1);
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .quick-ship-visual__image {
      animation: none !important;
      transform: none !important;
      opacity: 1 !important;
    }
  }
</style>
