<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
  import {
    QUICK_SHIP_ANIMATION_DURATION_MS,
    QUICK_SHIP_IMAGE_URL,
    QUICK_SHIP_REDUCED_MOTION_FINISH_MS,
    getQuickShipAnimationFinishTimeoutMs,
    getQuickShipAnimationLayout,
    type QuickShipAnimationLayout,
    type QuickShipAnimationType,
  } from '@/features/quick-transfer/visual'

  interface Props {
    type: QuickShipAnimationType
    layout?: QuickShipAnimationLayout
    hold?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    hold: false,
  })
  const emit = defineEmits<{
    finished: []
  }>()

  const resolvedLayout = computed(() => props.layout || getQuickShipAnimationLayout(props.type, { hold: props.hold }))
  const durationMs = computed(() => QUICK_SHIP_ANIMATION_DURATION_MS[props.type])
  const imageFailed = ref(false)
  const finished = ref(false)
  const parked = ref(false)
  let finishTimer: ReturnType<typeof setTimeout> | null = null

  const shouldAutoFinish = computed(
    () => props.type !== 'standby' && (resolvedLayout.value === 'overlay' || (props.hold && props.type === 'arrive')),
  )

  const finish = () => {
    if (finished.value || !shouldAutoFinish.value) return
    finished.value = true
    if (finishTimer) clearTimeout(finishTimer)
    finishTimer = null
    if (props.hold && props.type === 'arrive') parked.value = true
    emit('finished')
  }

  const handleImageError = () => {
    imageFailed.value = true
    finish()
  }

  const handleAnimationEnd = (event: { animationName?: string; detail?: { animationName?: string } }) => {
    const animationName = event.animationName || event.detail?.animationName
    if (
      animationName === 'quick-ship-depart' ||
      animationName === 'quick-ship-arrive' ||
      animationName === 'quick-ship-arrive-hold' ||
      animationName === 'quick-ship-depart-reduce' ||
      animationName === 'quick-ship-arrive-reduce' ||
      animationName === 'quick-ship-arrive-hold-reduce'
    ) {
      finish()
    }
  }

  onMounted(() => {
    if (!shouldAutoFinish.value) return
    let timeout = getQuickShipAnimationFinishTimeoutMs(props.type)
    // #ifdef WEB
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      timeout = QUICK_SHIP_REDUCED_MOTION_FINISH_MS
    }
    // #endif
    finishTimer = setTimeout(finish, timeout)
  })

  onBeforeUnmount(() => {
    if (finishTimer) clearTimeout(finishTimer)
    finish()
  })
</script>

<template>
  <view
    v-if="!imageFailed"
    class="ship-animation"
    :class="[
      `ship-animation--${props.type}`,
      `ship-animation--${resolvedLayout}`,
      { 'ship-animation--hold': props.hold, 'ship-animation--parked': parked },
    ]"
    :style="{ '--ship-duration': `${durationMs}ms` }"
    @animationend="handleAnimationEnd">
    <view v-if="resolvedLayout === 'overlay'" class="ship-animation__flash"></view>
    <view v-if="props.type === 'arrive'" class="ship-animation__wave"></view>
    <view v-if="props.type !== 'standby'" class="ship-animation__streaks">
      <view class="ship-animation__line ship-animation__line--1"></view>
      <view class="ship-animation__line ship-animation__line--2"></view>
      <view class="ship-animation__line ship-animation__line--3"></view>
    </view>
    <view class="ship-animation__motion" @animationend="handleAnimationEnd">
      <view class="ship-animation__facing">
        <view class="ship-animation__exhaust"></view>
        <view class="ship-animation__glow"></view>
        <image class="ship-animation__image" :src="QUICK_SHIP_IMAGE_URL" mode="aspectFit" :lazy-load="false" @error="handleImageError" />
      </view>
    </view>
    <view class="ship-animation__particles">
      <view class="ship-animation__particle ship-animation__particle--1"></view>
      <view class="ship-animation__particle ship-animation__particle--2"></view>
      <view v-if="resolvedLayout === 'overlay'" class="ship-animation__particle ship-animation__particle--3"></view>
    </view>
  </view>
</template>

<style scoped lang="scss">
  .ship-animation {
    --ship-duration: 2400ms;
  }

  .ship-animation--overlay {
    position: fixed;
    z-index: 1200;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .ship-animation--inline {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 188rpx;
    margin: 4rpx auto 8rpx;
    overflow: visible;
    pointer-events: none;
  }

  .ship-animation__flash,
  .ship-animation__wave,
  .ship-animation__streaks,
  .ship-animation__particles,
  .ship-animation__motion {
    position: absolute;
  }

  .ship-animation__flash {
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: radial-gradient(circle at 52% 48%, rgba(20, 184, 166, 0.18), rgba(37, 99, 235, 0.06) 38%, transparent 70%);
    opacity: 0;
  }

  .ship-animation--depart .ship-animation__flash {
    animation: quick-ship-flash-depart var(--ship-duration) linear forwards;
  }

  .ship-animation--arrive .ship-animation__flash {
    animation: quick-ship-flash-arrive var(--ship-duration) linear forwards;
  }

  .ship-animation__wave {
    left: 50%;
    top: 50%;
    width: 120rpx;
    height: 120rpx;
    margin: -60rpx 0 0 -60rpx;
    border: 4rpx solid rgba(20, 184, 166, 0.45);
    border-radius: 50%;
    opacity: 0;
    animation: quick-ship-wave var(--ship-duration) linear forwards;
  }

  .ship-animation__streaks,
  .ship-animation__particles {
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }

  .ship-animation--inline .ship-animation__particles {
    left: 50%;
    width: 280rpx;
    margin-left: -140rpx;
  }

  .ship-animation__motion {
    left: 50%;
    top: 50%;
    width: 340rpx;
    height: 220rpx;
    margin: -110rpx 0 0 -170rpx;
    will-change: transform, opacity;
  }

  .ship-animation--inline .ship-animation__motion {
    width: 220rpx;
    height: 142rpx;
    margin: -71rpx 0 0 -110rpx;
  }

  .ship-animation--depart .ship-animation__motion {
    opacity: 0;
    transform: translate3d(-52vw, 28vh, 0) rotate(-18deg) scale(0.9);
    animation: quick-ship-depart var(--ship-duration) linear forwards;
  }

  .ship-animation--arrive .ship-animation__motion {
    opacity: 0;
    transform: translate3d(64vw, -28vh, 0) rotate(12deg) scale(0.72);
    animation: quick-ship-arrive var(--ship-duration) linear forwards;
  }

  .ship-animation--arrive.ship-animation--hold .ship-animation__motion {
    animation-name: quick-ship-arrive-hold;
  }

  .ship-animation--arrive.ship-animation--parked .ship-animation__motion {
    opacity: 1;
    transform: translate3d(0, 8rpx, 0) rotate(-1deg);
    animation: quick-ship-standby 3600ms ease-in-out infinite;
  }

  .ship-animation--standby .ship-animation__motion {
    animation: quick-ship-standby var(--ship-duration) ease-in-out infinite;
  }

  .ship-animation--arrive .ship-animation__facing {
    transform: scaleX(-1);
  }

  .ship-animation__facing {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .ship-animation__image {
    width: 100%;
    height: 100%;
  }

  .ship-animation__exhaust,
  .ship-animation__glow {
    position: absolute;
    pointer-events: none;
  }

  .ship-animation__exhaust {
    left: -72rpx;
    top: 50%;
    width: 150rpx;
    height: 26rpx;
    margin-top: -13rpx;
    border-radius: 50%;
    background: linear-gradient(90deg, rgba(37, 99, 235, 0), rgba(20, 184, 166, 0.58) 52%, rgba(37, 99, 235, 0.2));
    opacity: 0;
  }

  .ship-animation--depart .ship-animation__exhaust,
  .ship-animation--arrive .ship-animation__exhaust {
    animation: quick-ship-exhaust var(--ship-duration) linear forwards;
  }

  .ship-animation--standby .ship-animation__exhaust,
  .ship-animation--arrive.ship-animation--parked .ship-animation__exhaust {
    left: -36rpx;
    width: 90rpx;
    height: 18rpx;
    margin-top: -9rpx;
    opacity: 0.42;
    animation: quick-ship-glow-breathe 3600ms ease-in-out infinite;
  }

  .ship-animation__glow {
    left: 18%;
    top: 52%;
    width: 120rpx;
    height: 42rpx;
    margin-top: -21rpx;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(20, 184, 166, 0.42), rgba(37, 99, 235, 0.08) 62%, transparent 74%);
    opacity: 0;
  }

  .ship-animation--depart .ship-animation__glow,
  .ship-animation--arrive .ship-animation__glow {
    animation: quick-ship-glow var(--ship-duration) linear forwards;
  }

  .ship-animation--standby .ship-animation__glow,
  .ship-animation--arrive.ship-animation--parked .ship-animation__glow {
    left: 16%;
    width: 88rpx;
    height: 28rpx;
    margin-top: -14rpx;
    opacity: 0.45;
    animation: quick-ship-glow-breathe 3600ms ease-in-out infinite;
  }

  .ship-animation__line {
    position: absolute;
    height: 4rpx;
    border-radius: 999rpx;
    background: linear-gradient(90deg, transparent, rgba(20, 184, 166, 0.72), rgba(37, 99, 235, 0.16));
    opacity: 0;
    transform: rotate(-16deg);
  }

  .ship-animation__line--1 {
    top: 42%;
    left: 18%;
    width: 240rpx;
  }

  .ship-animation__line--2 {
    top: 50%;
    left: 26%;
    width: 170rpx;
  }

  .ship-animation__line--3 {
    top: 58%;
    left: 22%;
    width: 128rpx;
  }

  .ship-animation--depart .ship-animation__line {
    animation: quick-ship-line-depart var(--ship-duration) linear forwards;
  }

  .ship-animation--arrive .ship-animation__line {
    transform: rotate(164deg);
    animation: quick-ship-line-arrive var(--ship-duration) linear forwards;
  }

  .ship-animation--depart .ship-animation__line--2,
  .ship-animation--arrive .ship-animation__line--2 {
    animation-delay: 40ms;
  }

  .ship-animation--depart .ship-animation__line--3,
  .ship-animation--arrive .ship-animation__line--3 {
    animation-delay: 70ms;
  }

  .ship-animation__particle {
    position: absolute;
    width: 8rpx;
    height: 8rpx;
    border-radius: 50%;
    background: rgba(20, 184, 166, 0.72);
    opacity: 0;
  }

  .ship-animation__particle--1 {
    top: 46%;
    left: 30%;
  }

  .ship-animation__particle--2 {
    top: 58%;
    left: 38%;
    width: 6rpx;
    height: 6rpx;
    background: rgba(37, 99, 235, 0.7);
  }

  .ship-animation__particle--3 {
    top: 40%;
    left: 48%;
    width: 5rpx;
    height: 5rpx;
  }

  .ship-animation--depart .ship-animation__particle,
  .ship-animation--arrive .ship-animation__particle {
    animation: quick-ship-particle-fly var(--ship-duration) linear forwards;
  }

  .ship-animation--arrive .ship-animation__particle--1 {
    animation-delay: 30ms;
  }

  .ship-animation--depart .ship-animation__particle--2,
  .ship-animation--arrive .ship-animation__particle--2 {
    animation-delay: 60ms;
  }

  .ship-animation--standby .ship-animation__particle--1,
  .ship-animation--arrive.ship-animation--parked .ship-animation__particle--1 {
    animation: quick-ship-particle-drift 3600ms ease-in-out infinite;
  }

  .ship-animation--standby .ship-animation__particle--2,
  .ship-animation--arrive.ship-animation--parked .ship-animation__particle--2 {
    animation: quick-ship-particle-drift 3600ms ease-in-out 900ms infinite;
  }

  .ship-animation--arrive.ship-animation--parked .ship-animation__flash,
  .ship-animation--arrive.ship-animation--parked .ship-animation__wave,
  .ship-animation--arrive.ship-animation--parked .ship-animation__line,
  .ship-animation--arrive.ship-animation--parked .ship-animation__particle--3 {
    animation: none;
    opacity: 0;
  }

  @keyframes quick-ship-depart {
    0% {
      opacity: 0;
      transform: translate3d(-52vw, 28vh, 0) rotate(-18deg) scale(0.9);
    }
    8% {
      opacity: 1;
      transform: translate3d(-50vw, 26vh, 0) rotate(-16deg) scale(0.9);
    }
    18% {
      opacity: 1;
      transform: translate3d(-54vw, 30vh, 0) rotate(-20deg) scale(0.86);
    }
    28% {
      opacity: 1;
      transform: translate3d(-42vw, 18vh, 0) rotate(-16deg) scale(1);
    }
    58% {
      opacity: 1;
      transform: translate3d(10vw, -6vh, 0) rotate(-15deg) scale(1.02);
    }
    100% {
      opacity: 0;
      transform: translate3d(68vw, -32vh, 0) rotate(-14deg) scale(0.6);
    }
  }

  @keyframes quick-ship-arrive {
    0% {
      opacity: 0;
      transform: translate3d(64vw, -28vh, 0) rotate(12deg) scale(0.7);
    }
    22% {
      opacity: 1;
      transform: translate3d(20vw, -10vh, 0) rotate(7deg) scale(0.9);
    }
    48% {
      opacity: 1;
      transform: translate3d(-20rpx, 10rpx, 0) rotate(-2deg) scale(1.06);
    }
    64% {
      opacity: 1;
      transform: translate3d(12rpx, -6rpx, 0) rotate(1deg) scale(1);
    }
    78% {
      opacity: 1;
      transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
    }
    100% {
      opacity: 0;
      transform: translate3d(0, 8rpx, 0) rotate(0deg) scale(0.96);
    }
  }

  @keyframes quick-ship-arrive-hold {
    0% {
      opacity: 0;
      transform: translate3d(64vw, -28vh, 0) rotate(12deg) scale(0.7);
    }
    22% {
      opacity: 1;
      transform: translate3d(20vw, -10vh, 0) rotate(7deg) scale(0.9);
    }
    48% {
      opacity: 1;
      transform: translate3d(-20rpx, 10rpx, 0) rotate(-2deg) scale(1.06);
    }
    64% {
      opacity: 1;
      transform: translate3d(12rpx, -6rpx, 0) rotate(1deg) scale(1);
    }
    82% {
      opacity: 1;
      transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
    }
    100% {
      opacity: 1;
      transform: translate3d(0, 8rpx, 0) rotate(-1deg) scale(1);
    }
  }

  @keyframes quick-ship-standby {
    0%,
    100% {
      transform: translate3d(0, 8rpx, 0) rotate(-1deg);
    }
    50% {
      transform: translate3d(0, -8rpx, 0) rotate(1deg);
    }
  }

  @keyframes quick-ship-exhaust {
    0%,
    10% {
      opacity: 0;
      transform: scaleX(0.5);
    }
    22% {
      opacity: 0.85;
      transform: scaleX(0.85);
    }
    32% {
      opacity: 1;
      transform: scaleX(1.15);
    }
    70% {
      opacity: 0.7;
      transform: scaleX(1.35);
    }
    100% {
      opacity: 0;
      transform: scaleX(0.7);
    }
  }

  @keyframes quick-ship-glow {
    0%,
    12% {
      opacity: 0;
    }
    24% {
      opacity: 0.85;
    }
    100% {
      opacity: 0;
    }
  }

  @keyframes quick-ship-glow-breathe {
    0%,
    100% {
      opacity: 0.28;
      transform: scale(0.92);
    }
    50% {
      opacity: 0.62;
      transform: scale(1.08);
    }
  }

  @keyframes quick-ship-flash-depart {
    0%,
    16% {
      opacity: 0;
    }
    28% {
      opacity: 0.9;
    }
    46% {
      opacity: 0.28;
    }
    100% {
      opacity: 0;
    }
  }

  @keyframes quick-ship-flash-arrive {
    0%,
    48% {
      opacity: 0;
    }
    62% {
      opacity: 0.55;
    }
    100% {
      opacity: 0;
    }
  }

  @keyframes quick-ship-wave {
    0%,
    54% {
      opacity: 0;
      transform: scale(0.45);
    }
    64% {
      opacity: 0.8;
      transform: scale(0.85);
    }
    100% {
      opacity: 0;
      transform: scale(2.35);
    }
  }

  @keyframes quick-ship-line-depart {
    0%,
    20% {
      opacity: 0;
      transform: rotate(-16deg) translate3d(-40rpx, 20rpx, 0) scaleX(0.4);
    }
    36% {
      opacity: 0.85;
      transform: rotate(-16deg) translate3d(20rpx, -8rpx, 0) scaleX(1);
    }
    100% {
      opacity: 0;
      transform: rotate(-16deg) translate3d(180rpx, -70rpx, 0) scaleX(1.3);
    }
  }

  @keyframes quick-ship-line-arrive {
    0% {
      opacity: 0;
      transform: rotate(164deg) translate3d(-20rpx, 12rpx, 0) scaleX(1.2);
    }
    24% {
      opacity: 0.8;
      transform: rotate(164deg) translate3d(10rpx, -6rpx, 0) scaleX(1);
    }
    70%,
    100% {
      opacity: 0;
      transform: rotate(164deg) translate3d(90rpx, -40rpx, 0) scaleX(0.4);
    }
  }

  @keyframes quick-ship-particle-fly {
    0%,
    18% {
      opacity: 0;
      transform: translate3d(0, 0, 0) scale(0.6);
    }
    36% {
      opacity: 0.9;
      transform: translate3d(40rpx, -18rpx, 0) scale(1);
    }
    100% {
      opacity: 0;
      transform: translate3d(160rpx, -70rpx, 0) scale(0.4);
    }
  }

  @keyframes quick-ship-particle-drift {
    0%,
    100% {
      opacity: 0;
      transform: translate3d(-20rpx, 12rpx, 0);
    }
    30% {
      opacity: 0.7;
    }
    70% {
      opacity: 0.2;
      transform: translate3d(36rpx, -18rpx, 0);
    }
  }

  @keyframes quick-ship-depart-reduce {
    0% {
      opacity: 0;
    }
    40% {
      opacity: 0.55;
    }
    100% {
      opacity: 0;
    }
  }

  @keyframes quick-ship-arrive-reduce {
    0% {
      opacity: 0;
    }
    40% {
      opacity: 0.55;
    }
    100% {
      opacity: 0;
    }
  }

  @keyframes quick-ship-arrive-hold-reduce {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ship-animation--depart .ship-animation__motion {
      transform: none;
      animation: quick-ship-depart-reduce 280ms ease forwards;
    }

    .ship-animation--arrive .ship-animation__motion {
      transform: none;
      animation: quick-ship-arrive-reduce 280ms ease forwards;
    }

    .ship-animation--arrive.ship-animation--hold .ship-animation__motion {
      animation: quick-ship-arrive-hold-reduce 280ms ease forwards;
    }

    .ship-animation--arrive.ship-animation--parked .ship-animation__motion {
      opacity: 1;
      transform: none;
      animation: none !important;
    }

    .ship-animation--standby .ship-animation__motion,
    .ship-animation--standby .ship-animation__exhaust,
    .ship-animation--standby .ship-animation__glow,
    .ship-animation--standby .ship-animation__particle,
    .ship-animation--arrive.ship-animation--parked .ship-animation__exhaust,
    .ship-animation--arrive.ship-animation--parked .ship-animation__glow,
    .ship-animation--arrive.ship-animation--parked .ship-animation__particle {
      animation: none !important;
    }

    .ship-animation__flash,
    .ship-animation__wave,
    .ship-animation__line,
    .ship-animation--depart .ship-animation__particle,
    .ship-animation--arrive .ship-animation__particle,
    .ship-animation--depart .ship-animation__exhaust,
    .ship-animation--arrive .ship-animation__exhaust,
    .ship-animation--depart .ship-animation__glow,
    .ship-animation--arrive .ship-animation__glow {
      animation: none !important;
      opacity: 0 !important;
    }
  }
</style>
