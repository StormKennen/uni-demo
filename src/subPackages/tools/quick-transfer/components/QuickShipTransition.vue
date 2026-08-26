<script setup lang="ts">
  import { onBeforeUnmount, onMounted, ref } from 'vue'
  import { QUICK_SHIP_IMAGE_URL, type QuickShipTransitionType } from '@/features/quick-transfer/visual'

  interface Props {
    type: QuickShipTransitionType
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    finished: []
  }>()

  const finished = ref(false)
  let finishTimer: ReturnType<typeof setTimeout> | null = null

  const finish = () => {
    if (finished.value) return
    finished.value = true
    if (finishTimer) clearTimeout(finishTimer)
    finishTimer = null
    emit('finished')
  }

  const handleImageError = () => finish()

  const handleAnimationEnd = (event: { animationName?: string; detail?: { animationName?: string } }) => {
    const animationName = event.animationName || event.detail?.animationName
    if (animationName === 'quick-ship-depart' || animationName === 'quick-ship-arrive') finish()
  }

  onMounted(() => {
    // Reduced-motion 环境不会触发 animationend，用定时器保证 Overlay 始终能够收口。
    finishTimer = setTimeout(finish, 840)
  })

  onBeforeUnmount(() => {
    if (finishTimer) clearTimeout(finishTimer)
  })
</script>

<template>
  <view class="ship-transition-overlay" :class="`ship-transition-overlay--${props.type}`">
    <view class="ship-transition__trail"></view>
    <image
      class="ship-transition__image"
      :src="QUICK_SHIP_IMAGE_URL"
      mode="aspectFit"
      :lazy-load="false"
      @error="handleImageError"
      @animationend="handleAnimationEnd" />
  </view>
</template>

<style scoped lang="scss">
  .ship-transition-overlay {
    position: fixed;
    z-index: 100;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    pointer-events: none;
  }

  .ship-transition__image {
    position: relative;
    z-index: 1;
    width: 340rpx;
    height: 220rpx;
    will-change: transform, opacity;
    animation-duration: 760ms;
    animation-fill-mode: forwards;
  }

  .ship-transition__trail {
    position: absolute;
    width: 320rpx;
    height: 22rpx;
    border-radius: 50%;
    background: linear-gradient(90deg, transparent, rgba(20, 184, 166, 0.32), rgba(37, 99, 235, 0.08));
    filter: blur(10rpx);
    opacity: 0;
    transform: rotate(-16deg) translate(-80rpx, 30rpx);
    animation: quick-ship-trail 760ms ease-out forwards;
  }

  .ship-transition-overlay--depart .ship-transition__image {
    animation-name: quick-ship-depart;
  }

  .ship-transition-overlay--arrive .ship-transition__image {
    animation-name: quick-ship-arrive;
  }

  .ship-transition-overlay--arrive .ship-transition__trail {
    transform: rotate(164deg) translate(-70rpx, 28rpx);
  }

  @keyframes quick-ship-depart {
    0% {
      opacity: 0;
      transform: translate(-58vw, 26vh) rotate(-16deg) scale(0.68);
    }
    18% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: translate(62vw, -25vh) rotate(-16deg) scale(0.72);
    }
  }

  @keyframes quick-ship-arrive {
    0% {
      opacity: 0;
      transform: translate(62vw, -24vh) rotate(10deg) scale(0.72);
    }
    18% {
      opacity: 1;
    }
    78% {
      opacity: 1;
      transform: translate(-12rpx, 0) rotate(0) scale(1.04);
    }
    100% {
      opacity: 0;
      transform: translate(0, 0) rotate(0) scale(1);
    }
  }

  @keyframes quick-ship-trail {
    0% {
      opacity: 0;
      transform: scaleX(0.3) rotate(-16deg) translate(-80rpx, 30rpx);
    }
    20% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: scaleX(1.3) rotate(-16deg) translate(80rpx, -30rpx);
    }
  }

  .ship-transition-overlay--arrive .ship-transition__trail {
    animation-name: quick-ship-arrive-trail;
  }

  @keyframes quick-ship-arrive-trail {
    0% {
      opacity: 0;
      transform: scaleX(1.2) rotate(164deg) translate(-70rpx, 28rpx);
    }
    20% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: scaleX(0.3) rotate(164deg) translate(70rpx, -28rpx);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ship-transition__image,
    .ship-transition__trail {
      animation: none !important;
      opacity: 0 !important;
    }
  }
</style>
