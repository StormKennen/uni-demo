<template>
  <view class="audio-player" :class="{ 'is-disabled': !src }">
    <button
      v-if="controls"
      class="audio-player-toggle"
      :disabled="!src"
      :aria-label="isPlaying ? '暂停' : '播放'"
      @click.stop="togglePlayback">
      <view v-if="isPlaying" class="audio-player-pause" aria-hidden="true">
        <view></view>
        <view></view>
      </view>
      <view v-else class="audio-player-play" aria-hidden="true"></view>
    </button>

    <view class="audio-player-main">
      <view class="audio-player-heading">
        <text class="audio-player-title">{{ title || '音频文件' }}</text>
        <text v-if="errorMessage" class="audio-player-error">{{ errorMessage }}</text>
      </view>

      <view v-if="controls" class="audio-player-progress">
        <text class="audio-player-time">{{ formatTime(displayCurrentTime) }}</text>
        <slider
          class="audio-player-slider"
          :value="displayCurrentTime"
          :min="0"
          :max="sliderMax"
          :step="1"
          :disabled="!src"
          activeColor="#5b63d3"
          backgroundColor="#d9dce8"
          block-color="#5b63d3"
          :block-size="14"
          @changing="onSeeking"
          @change="onSeek" />
        <text class="audio-player-time">{{ formatTime(duration) }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

  interface Props {
    src: string
    title?: string
    autoplay?: boolean
    controls?: boolean
    loop?: boolean
  }

  interface SliderEvent {
    detail: {
      value: number
    }
  }

  const props = withDefaults(defineProps<Props>(), {
    title: '',
    autoplay: false,
    controls: true,
    loop: false,
  })

  const currentTime = ref(0)
  const duration = ref(0)
  const isPlaying = ref(false)
  const isSeeking = ref(false)
  const seekingTime = ref(0)
  const errorMessage = ref('')
  let audioContext: ReturnType<typeof uni.createInnerAudioContext> | null = null

  const sliderMax = computed(() => Math.max(1, Math.ceil(duration.value)))
  const displayCurrentTime = computed(() => (isSeeking.value ? seekingTime.value : currentTime.value))

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
    const wholeSeconds = Math.floor(seconds)
    const minutes = Math.floor(wholeSeconds / 60)
    return `${minutes}:${String(wholeSeconds % 60).padStart(2, '0')}`
  }

  const syncDuration = () => {
    if (!audioContext) return
    const nextDuration = Number(audioContext.duration)
    if (Number.isFinite(nextDuration) && nextDuration > 0) duration.value = nextDuration
  }

  const applySource = () => {
    if (!audioContext) return
    audioContext.stop()
    currentTime.value = 0
    duration.value = 0
    errorMessage.value = ''
    audioContext.loop = props.loop
    audioContext.autoplay = props.autoplay
    if (props.src) audioContext.src = props.src
  }

  const togglePlayback = () => {
    if (!audioContext || !props.src) return
    errorMessage.value = ''
    if (isPlaying.value) audioContext.pause()
    else audioContext.play()
  }

  const onSeeking = (event: SliderEvent) => {
    isSeeking.value = true
    seekingTime.value = event.detail.value
  }

  const onSeek = (event: SliderEvent) => {
    if (!audioContext || !props.src) return
    const nextTime = Math.min(event.detail.value, duration.value || event.detail.value)
    audioContext.seek(nextTime)
    currentTime.value = nextTime
    seekingTime.value = nextTime
    isSeeking.value = false
  }

  onMounted(() => {
    audioContext = uni.createInnerAudioContext()
    audioContext.onCanplay(syncDuration)
    audioContext.onTimeUpdate(() => {
      if (!audioContext) return
      syncDuration()
      if (!isSeeking.value) currentTime.value = audioContext.currentTime || 0
    })
    audioContext.onPlay(() => {
      isPlaying.value = true
      errorMessage.value = ''
    })
    audioContext.onPause(() => {
      isPlaying.value = false
    })
    audioContext.onStop(() => {
      isPlaying.value = false
      currentTime.value = 0
    })
    audioContext.onEnded(() => {
      isPlaying.value = false
      if (!props.loop) currentTime.value = duration.value
    })
    audioContext.onError(() => {
      isPlaying.value = false
      errorMessage.value = '音频加载失败'
    })
    applySource()
  })

  watch(
    () => props.src,
    () => applySource(),
  )

  watch(
    () => props.loop,
    loop => {
      if (audioContext) audioContext.loop = loop
    },
  )

  watch(
    () => props.autoplay,
    autoplay => {
      if (audioContext) audioContext.autoplay = autoplay
    },
  )

  onBeforeUnmount(() => {
    audioContext?.destroy()
    audioContext = null
  })
</script>

<style scoped>
  .audio-player {
    display: flex;
    align-items: center;
    gap: 16rpx;
    width: 100%;
    min-width: 0;
  }

  .audio-player.is-disabled {
    opacity: 0.6;
  }

  .audio-player-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 64rpx;
    width: 64rpx;
    height: 64rpx;
    min-width: 64rpx;
    margin: 0;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: #5b63d3;
  }

  .audio-player-toggle::after {
    border: 0;
  }

  .audio-player-toggle[disabled] {
    background: #b9bdcf;
  }

  .audio-player-play {
    width: 0;
    height: 0;
    margin-left: 6rpx;
    border-top: 13rpx solid transparent;
    border-bottom: 13rpx solid transparent;
    border-left: 20rpx solid #fff;
  }

  .audio-player-pause {
    display: flex;
    gap: 7rpx;
  }

  .audio-player-pause view {
    width: 7rpx;
    height: 26rpx;
    border-radius: 2rpx;
    background: #fff;
  }

  .audio-player-main {
    flex: 1;
    min-width: 0;
  }

  .audio-player-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12rpx;
    min-width: 0;
  }

  .audio-player-title {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    color: var(--theme-text, #25262b);
    font-size: 26rpx;
    font-weight: 500;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .audio-player-error {
    flex-shrink: 0;
    color: #c53f3f;
    font-size: 20rpx;
  }

  .audio-player-progress {
    display: flex;
    align-items: center;
    gap: 8rpx;
    width: 100%;
    margin-top: 6rpx;
  }

  .audio-player-slider {
    flex: 1;
    min-width: 0;
    margin: 0;
  }

  .audio-player-time {
    flex: 0 0 62rpx;
    color: var(--theme-text-secondary, #777b87);
    font-size: 20rpx;
    font-variant-numeric: tabular-nums;
    text-align: center;
  }
</style>
