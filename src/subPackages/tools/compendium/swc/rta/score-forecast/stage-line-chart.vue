<template>
  <view class="stage-chart">
    <view class="chart-axis">
      <text>{{ formatScore(chartMax) }}</text>
      <text>{{ formatScore(chartMid) }}</text>
      <text>{{ formatScore(chartMin) }}</text>
    </view>

    <scroll-view class="chart-scroll" scroll-x enable-flex>
      <view class="chart-content" :style="{ width }">
        <view class="plot-area">
          <view class="grid-line top" />
          <view class="grid-line middle" />
          <view class="grid-line bottom" />

          <view v-for="segment in segments" :key="segment.key" class="line-segment" :style="segment.style" />

          <view v-for="point in chartPoints" :key="point.key" class="line-point" :style="{ left: `${point.x}%`, top: `${point.y}%` }">
            <text class="point-score">{{ formatScore(point.score) }}</text>
            <view class="point-dot" />
          </view>
        </view>

        <view class="label-list">
          <view v-for="point in chartPoints" :key="`${point.key}-label`" class="label-item" :style="{ left: `${point.x}%` }">
            <text>{{ point.label }}</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { formatScoreValue } from './score-normalizers'

  interface StageLinePoint {
    key: string
    label: string
    score: number
  }

  interface ChartPoint extends StageLinePoint {
    x: number
    y: number
  }

  interface ChartSegment {
    key: string
    style: {
      left: string
      top: string
      width: string
      transform: string
    }
  }

  const props = defineProps<{
    points: StageLinePoint[]
    width: string
  }>()

  const plotWidth = computed(() => Math.max(300, props.points.length * 110))
  const plotHeight = 230
  const scores = computed(() => props.points.map(point => point.score).filter(score => Number.isFinite(score)))
  const chartMax = computed(() => (scores.value.length ? Math.max(...scores.value) : null))
  const chartMin = computed(() => (scores.value.length ? Math.min(...scores.value) : null))
  const chartMid = computed(() => {
    if (chartMax.value === null || chartMin.value === null) return null
    return Math.round((chartMax.value + chartMin.value) / 2)
  })

  const xForIndex = (index: number): number => {
    if (props.points.length <= 1) return 50
    return 10 + (index / (props.points.length - 1)) * 80
  }

  const yForScore = (score: number): number => {
    if (chartMax.value === null || chartMin.value === null || chartMax.value === chartMin.value) return 50
    const ratio = (score - chartMin.value) / (chartMax.value - chartMin.value)
    return 88 - ratio * 76
  }

  const chartPoints = computed<ChartPoint[]>(() =>
    props.points.map((point, index) => ({
      ...point,
      x: xForIndex(index),
      y: yForScore(point.score),
    })),
  )

  const segments = computed<ChartSegment[]>(() =>
    chartPoints.value.slice(1).map((point, index) => {
      const previous = chartPoints.value[index]
      const x1 = (previous.x / 100) * plotWidth.value
      const y1 = (previous.y / 100) * plotHeight
      const x2 = (point.x / 100) * plotWidth.value
      const y2 = (point.y / 100) * plotHeight
      const dx = x2 - x1
      const dy = y2 - y1
      const length = Math.sqrt(dx * dx + dy * dy)
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI
      return {
        key: `${previous.key}-${point.key}`,
        style: {
          left: `${previous.x}%`,
          top: `${previous.y}%`,
          width: `${length}rpx`,
          transform: `rotate(${angle}deg)`,
        },
      }
    }),
  )

  const formatScore = (value: number | null): string => formatScoreValue(value)
</script>

<style scoped lang="scss">
  .stage-chart {
    min-height: 300rpx;
    display: flex;
    gap: 14rpx;
  }

  .chart-axis {
    width: 74rpx;
    height: 230rpx;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 0 0 0;
    box-sizing: border-box;
    color: var(--theme-text-tertiary);
    font-size: 18rpx;
    line-height: 1;
    text-align: right;
  }

  .chart-scroll {
    min-width: 0;
    flex: 1;
    white-space: nowrap;
  }

  .chart-content {
    position: relative;
    height: 300rpx;
  }

  .plot-area {
    position: relative;
    height: 230rpx;
    overflow: visible;
  }

  .grid-line {
    position: absolute;
    left: 0;
    right: 0;
    border-top: 1rpx dashed var(--theme-border);
  }

  .grid-line.top {
    top: 0;
  }

  .grid-line.middle {
    top: 50%;
  }

  .grid-line.bottom {
    bottom: 0;
  }

  .line-segment {
    position: absolute;
    height: 4rpx;
    border-radius: 999rpx;
    background: var(--theme-brand);
    transform-origin: left center;
  }

  .line-point {
    position: absolute;
    z-index: 1;
    width: 0;
    height: 0;
  }

  .point-score {
    position: absolute;
    right: auto;
    bottom: 14rpx;
    left: 0;
    transform: translateX(-50%);
    white-space: nowrap;
    color: var(--theme-text-secondary);
    font-size: 18rpx;
    line-height: 1;
  }

  .point-dot {
    position: absolute;
    top: -8rpx;
    left: -8rpx;
    width: 16rpx;
    height: 16rpx;
    border: 4rpx solid var(--theme-surface);
    border-radius: 50%;
    background: var(--theme-brand);
    box-shadow: 0 0 0 2rpx var(--theme-brand);
  }

  .label-list {
    position: relative;
    height: 48rpx;
  }

  .label-item {
    position: absolute;
    top: 12rpx;
    width: 110rpx;
    color: var(--theme-text-tertiary);
    font-size: 18rpx;
    line-height: 1;
    text-align: center;
    transform: translateX(-50%);
  }
</style>
