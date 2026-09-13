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

          <view
            v-for="segment in segments"
            :key="segment.key"
            class="line-segment"
            :style="{ ...segment.style, backgroundColor: segment.color }" />

          <template v-for="series in chartSeries" :key="series.key">
            <view v-for="point in series.points" :key="point.key" class="line-point" :style="{ left: `${point.x}%`, top: `${point.y}%` }">
              <text class="point-score" :style="{ color: point.color }">{{ formatScore(point.score) }}</text>
              <view class="point-dot" :style="{ backgroundColor: point.color, boxShadow: `0 0 0 2rpx ${point.color}` }" />
            </view>
          </template>
        </view>

        <view class="label-list">
          <view v-for="(category, index) in categories" :key="category" class="label-item" :style="{ left: `${xForIndex(index)}%` }">
            <text>{{ category }}</text>
          </view>
        </view>

        <view class="chart-legend">
          <view v-for="series in chartSeries" :key="`${series.key}-legend`" class="legend-item">
            <view class="legend-line" :style="{ backgroundColor: series.color }" />
            <text>{{ series.label }}</text>
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
    index: number
  }

  interface StageLineSeries {
    key: string
    label: string
    points: StageLinePoint[]
  }

  interface ChartPoint extends StageLinePoint {
    x: number
    y: number
    color: string
  }

  interface ChartSeries extends StageLineSeries {
    color: string
    points: ChartPoint[]
  }

  interface ChartSegment {
    key: string
    color: string
    style: {
      left: string
      top: string
      width: string
      transform: string
    }
  }

  const props = defineProps<{
    categories: string[]
    series: StageLineSeries[]
    width: string
  }>()

  const COLORS = ['#2864c7', '#31a36c', '#e08a2e', '#9b5bc7', '#d05264', '#4d849f']
  const plotWidth = computed(() => Math.max(300, props.categories.length * 110))
  const plotHeight = 230
  const scores = computed(() =>
    props.series.flatMap(series => series.points.map(point => point.score)).filter(score => Number.isFinite(score)),
  )
  const chartMax = computed(() => (scores.value.length ? Math.max(...scores.value) : null))
  const chartMin = computed(() => (scores.value.length ? Math.min(...scores.value) : null))
  const chartMid = computed(() => {
    if (chartMax.value === null || chartMin.value === null) return null
    return Math.round((chartMax.value + chartMin.value) / 2)
  })

  const xForIndex = (index: number): number => {
    if (props.categories.length <= 1) return 50
    return 10 + (index / (props.categories.length - 1)) * 80
  }

  const yForScore = (score: number): number => {
    if (chartMax.value === null || chartMin.value === null || chartMax.value === chartMin.value) return 50
    const ratio = (score - chartMin.value) / (chartMax.value - chartMin.value)
    return 88 - ratio * 76
  }

  const chartSeries = computed<ChartSeries[]>(() =>
    props.series.map((series, seriesIndex) => ({
      ...series,
      color: COLORS[seriesIndex % COLORS.length],
      points: series.points.map(point => ({
        ...point,
        x: xForIndex(point.index),
        y: yForScore(point.score),
        color: COLORS[seriesIndex % COLORS.length],
      })),
    })),
  )

  const segments = computed<ChartSegment[]>(() =>
    chartSeries.value.flatMap(series =>
      series.points.slice(1).flatMap((point, pointIndex) => {
        const previous = series.points[pointIndex]
        if (point.index !== previous.index + 1) return []
        const x1 = (previous.x / 100) * plotWidth.value
        const y1 = (previous.y / 100) * plotHeight
        const x2 = (point.x / 100) * plotWidth.value
        const y2 = (point.y / 100) * plotHeight
        const dx = x2 - x1
        const dy = y2 - y1
        const length = Math.sqrt(dx * dx + dy * dy)
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI
        return [
          {
            key: `${series.key}-${previous.key}-${point.key}`,
            color: series.color,
            style: {
              left: `${previous.x}%`,
              top: `${previous.y}%`,
              width: `${length}rpx`,
              transform: `rotate(${angle}deg)`,
            },
          },
        ]
      }),
    ),
  )

  const formatScore = (value: number | null): string => formatScoreValue(value)
</script>

<style scoped lang="scss">
  .stage-chart {
    min-height: 360rpx;
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
    height: 360rpx;
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

  .chart-legend {
    min-height: 48rpx;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12rpx 24rpx;
    padding-top: 8rpx;
  }

  .legend-item {
    display: inline-flex;
    align-items: center;
    gap: 8rpx;
    color: var(--theme-text-tertiary);
    font-size: 18rpx;
    line-height: 1;
  }

  .legend-line {
    width: 24rpx;
    height: 4rpx;
    border-radius: 999rpx;
  }
</style>
