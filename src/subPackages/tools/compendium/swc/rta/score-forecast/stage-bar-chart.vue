<template>
  <view class="stage-chart">
    <view class="chart-axis">
      <text>{{ formatScore(chartMax) }}</text>
      <text>{{ formatScore(chartMid) }}</text>
      <text>{{ formatScore(chartMin) }}</text>
    </view>
    <scroll-view class="chart-scroll" scroll-x enable-flex>
      <view class="chart-content" :style="{ width }">
        <view class="grid-line top" />
        <view class="grid-line middle" />
        <view class="grid-line bottom" />
        <view class="bar-list">
          <view v-for="point in chartPoints" :key="point.key" class="bar-item">
            <text class="bar-score">{{ formatScore(point.score) }}</text>
            <view class="bar-track">
              <view class="bar-fill" :style="{ height: `${point.height}%` }" />
            </view>
            <text class="bar-label">{{ point.label }}</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { formatScoreValue } from './score-normalizers'

  interface StageBarPoint {
    key: string
    label: string
    score: number
  }

  interface ChartPoint extends StageBarPoint {
    height: number
  }

  const props = defineProps<{
    points: StageBarPoint[]
    width: string
  }>()

  const scores = computed(() => props.points.map(point => point.score).filter(score => Number.isFinite(score)))
  const chartMax = computed(() => (scores.value.length ? Math.max(...scores.value) : null))
  const chartMin = computed(() => (scores.value.length ? Math.min(...scores.value) : null))
  const chartMid = computed(() => {
    if (chartMax.value === null || chartMin.value === null) return null
    return Math.round((chartMax.value + chartMin.value) / 2)
  })
  const chartPoints = computed<ChartPoint[]>(() => {
    if (chartMax.value === null || chartMin.value === null) return []
    const span = chartMax.value - chartMin.value
    return props.points.map(point => ({
      ...point,
      height: span > 0 ? Math.max(10, ((point.score - chartMin.value) / span) * 90 + 10) : 55,
    }))
  })

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
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 6rpx 0 34rpx;
    box-sizing: border-box;
    color: var(--theme-text-tertiary);
    font-size: 18rpx;
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

  .grid-line {
    position: absolute;
    left: 0;
    right: 0;
    border-top: 1rpx dashed var(--theme-border);
  }

  .grid-line.top {
    top: 8rpx;
  }

  .grid-line.middle {
    top: 132rpx;
  }

  .grid-line.bottom {
    bottom: 34rpx;
  }

  .bar-list {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    align-items: stretch;
    gap: 8rpx;
    overflow: hidden;
  }

  .bar-item {
    min-width: 72rpx;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    gap: 6rpx;
  }

  .bar-score,
  .bar-label {
    max-width: 86rpx;
    overflow: hidden;
    color: var(--theme-text-tertiary);
    font-size: 17rpx;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .bar-track {
    width: 100%;
    height: 220rpx;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }

  .bar-fill {
    width: 62%;
    min-height: 10rpx;
    border-radius: 10rpx 10rpx 4rpx 4rpx;
    background: var(--theme-brand);
  }
</style>
