<template>
  <view class="profile-chart">
    <view class="chart-summary">
      <view class="summary-item">
        <text class="summary-label">最低</text>
        <text class="summary-value">{{ formatAltitude(summary.minAltitudeMeters) }}</text>
      </view>
      <view class="summary-item">
        <text class="summary-label">最高</text>
        <text class="summary-value">{{ formatAltitude(summary.maxAltitudeMeters) }}</text>
      </view>
      <view class="summary-item">
        <text class="summary-label">落差</text>
        <text class="summary-value">{{ formatAltitude(summary.altitudeDeltaMeters) }}</text>
      </view>
    </view>
    <view class="altitude-legend">
      <view v-for="item in warningLegend" :key="item.key" class="legend-item">
        <view class="legend-dot" :style="{ backgroundColor: item.color }" />
        <text>{{ item.legendLabel }}</text>
      </view>
    </view>

    <view v-if="points.length" class="chart-shell">
      <view class="chart-axis">
        <text v-for="tick in chartTicks" :key="tick">{{ formatAltitude(tick) }}</text>
      </view>
      <scroll-view scroll-x class="chart-scroll" :show-scrollbar="false">
        <view class="chart-content" :style="{ width: `${chartWidth}rpx` }">
          <view class="bar-plot-area">
            <view v-for="tick in chartTicks" :key="`grid-${tick}`" class="grid-line" :style="{ bottom: `${(tick / chartMax) * 90}%` }" />
            <view v-for="(point, index) in chartPoints" :key="point.pointId" class="bar-column" :style="{ left: `${xForIndex(index)}%` }">
              <view class="bar-value" :style="{ color: altitudeColor(point.altitudeMeters) }">{{
                formatAltitude(point.altitudeMeters)
              }}</view>
              <view
                class="bar-column-fill"
                :style="{ height: `${barHeight(point.altitudeMeters)}%`, backgroundColor: altitudeColor(point.altitudeMeters) }" />
              <text class="bar-label">{{ shortLabel(point.name) }}</text>
            </view>
          </view>
          <view class="label-list">
            <view
              v-for="(category, index) in categories"
              :key="`${category}-${index}`"
              class="label-item"
              :style="{ left: `${xForIndex(index)}%` }">
              <text>{{ shortLabel(category) }}</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
    <view v-else class="empty-chart">暂无可绘制的景点海拔数据</view>
  </view>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { ALTITUDE_WARNING_CONFIGS, getAltitudeWarningConfig } from '../altitude/altitude-warning'

  interface ProfilePoint {
    pointId: string
    name: string
    altitudeMeters: number
  }

  interface ProfileSummary {
    pointCount: number
    minAltitudeMeters: number | null
    maxAltitudeMeters: number | null
    altitudeDeltaMeters: number | null
  }

  const props = defineProps<{
    categories: string[]
    values: number[]
    points: ProfilePoint[]
    summary: ProfileSummary
  }>()

  const chartWidth = computed(() => Math.max(680, props.points.length * 128))
  const warningLegend = ALTITUDE_WARNING_CONFIGS
  const chartMax = computed(() => {
    const maximum = Math.max(...props.values, ...props.points.map(point => point.altitudeMeters), 0)
    return Math.max(500, Math.ceil(maximum / 500) * 500)
  })
  const chartTicks = computed(() => Array.from({ length: chartMax.value / 500 + 1 }, (_, index) => index * 500).reverse())

  const xForIndex = (index: number) => (props.points.length <= 1 ? 50 : 8 + (index / (props.points.length - 1)) * 84)

  const barHeight = (value: number) => {
    return Math.max(4, (Math.max(0, value) / chartMax.value) * 90)
  }

  const altitudeColor = (value: number) => getAltitudeWarningConfig(value).color

  const chartPoints = computed(() =>
    props.points.map((point, index) => ({
      ...point,
      x: xForIndex(index),
    })),
  )

  const formatAltitude = (value: number | null) => (value === null || !Number.isFinite(value) ? '--' : `${Math.round(value)}m`)
  const shortLabel = (value: string) => (value.length > 6 ? `${value.slice(0, 6)}…` : value)
</script>

<style scoped lang="scss">
  .profile-chart {
    padding: 24rpx;
    border-radius: 24rpx;
    background: var(--theme-surface-muted);
  }

  .chart-summary {
    display: flex;
    justify-content: space-between;
    margin-bottom: 22rpx;
  }

  .altitude-legend {
    display: flex;
    gap: 24rpx;
    margin-bottom: 20rpx;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 6rpx;
    color: var(--theme-text-tertiary);
    font-size: 20rpx;
  }

  .legend-dot {
    width: 14rpx;
    height: 14rpx;
    border-radius: 50%;
  }

  .legend-dot--low {
    background: #22c55e;
  }

  .legend-dot--middle {
    background: #f59e0b;
  }

  .legend-dot--high {
    background: #ef4444;
  }

  .summary-item {
    display: flex;
    flex-direction: column;
    gap: 6rpx;
  }

  .summary-label {
    color: var(--theme-text-tertiary);
    font-size: 22rpx;
  }

  .summary-value {
    color: var(--theme-text-primary);
    font-size: 28rpx;
    font-weight: 700;
  }

  .chart-shell {
    display: flex;
    min-width: 0;
  }

  .chart-axis {
    width: 64rpx;
    height: 360rpx;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 8rpx 0;
    color: var(--theme-text-tertiary);
    font-size: 20rpx;
    text-align: right;
  }

  .chart-scroll {
    flex: 1;
    min-width: 0;
  }

  .chart-content {
    position: relative;
    height: 450rpx;
    padding: 0 24rpx;
    box-sizing: border-box;
  }

  .bar-plot-area {
    position: relative;
    height: 360rpx;
    margin-bottom: 50rpx;
  }

  .bar-column {
    position: absolute;
    bottom: 0;
    width: 54rpx;
    height: 360rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    transform: translateX(-50%);
  }

  .bar-value {
    margin-bottom: 6rpx;
    color: var(--theme-brand);
    font-size: 17rpx;
    white-space: nowrap;
  }

  .bar-column-fill {
    width: 34rpx;
    min-height: 10rpx;
    border-radius: 10rpx 10rpx 4rpx 4rpx;
    background: linear-gradient(180deg, var(--theme-brand), var(--theme-brand-strong));
  }

  .bar-label {
    position: absolute;
    top: 378rpx;
    width: 120rpx;
    overflow: hidden;
    color: var(--theme-text-secondary);
    font-size: 18rpx;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .grid-line {
    position: absolute;
    left: 0;
    right: 0;
    height: 1rpx;
    background: var(--theme-border-light);
  }

  .line-segment {
    position: absolute;
    height: 5rpx;
    transform-origin: left center;
    border-radius: 5rpx;
    background: var(--theme-brand);
  }

  .chart-point {
    position: absolute;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4rpx;
  }

  .point-dot {
    width: 16rpx;
    height: 16rpx;
    border: 4rpx solid var(--theme-surface);
    border-radius: 50%;
    background: var(--theme-brand);
    box-shadow: 0 0 0 3rpx var(--theme-brand);
  }

  .point-value {
    color: var(--theme-brand);
    font-size: 18rpx;
    white-space: nowrap;
  }

  .label-list {
    position: absolute;
    left: 24rpx;
    right: 24rpx;
    bottom: 0;
    height: 44rpx;
  }

  .label-item {
    position: absolute;
    transform: translateX(-50%);
    max-width: 120rpx;
    overflow: hidden;
    color: var(--theme-text-secondary);
    font-size: 19rpx;
    text-align: center;
    white-space: nowrap;
  }

  .empty-chart {
    padding: 48rpx 0;
    color: var(--theme-text-tertiary);
    font-size: 24rpx;
    text-align: center;
  }
</style>
