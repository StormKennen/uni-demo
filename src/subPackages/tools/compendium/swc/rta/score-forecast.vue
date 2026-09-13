<template>
  <PageLayout
    title="RTA分数线"
    share-title="魔灵召唤 RTA分数预测｜每日分数线趋势"
    :share-image-url="SWC_RTA_SCORE_SHARE_IMAGE"
    :nav-back="true"
    back-fallback="/subPackages/tools/compendium/swc/index"
    nav-init-bg-color="var(--theme-surface)"
    nav-divider>
    <view class="score-page">
      <view v-if="isStale" class="notice-card">
        <uni-icons type="info" size="16" color="var(--theme-text-secondary)" />
        <text>数据可能已过期，当前展示缓存结果</text>
        <button class="notice-action" size="mini" :disabled="loading" @click="refresh">刷新</button>
      </view>

      <view v-if="initialLoading" class="initial-loading">
        <view class="filter-panel filter-skeleton-panel">
          <view class="skeleton-filter-row">
            <view class="skeleton-filter-label" />
            <view class="skeleton-chip-list">
              <view v-for="index in 4" :key="index" class="skeleton-chip" />
            </view>
          </view>
        </view>

        <view class="section-card content-skeleton-card">
          <view class="skeleton-line wide" />
          <view class="skeleton-line content-subtitle-line" />
          <view class="skeleton-cutoff-grid">
            <view v-for="index in 6" :key="index" class="skeleton-cutoff-card">
              <view class="skeleton-line" />
              <view class="skeleton-line wide" />
              <view class="skeleton-line short" />
            </view>
          </view>
        </view>

        <view class="section-card content-skeleton-card">
          <view class="skeleton-line wide" />
          <view class="chart-skeleton">
            <view class="skeleton-line wide" />
            <view class="skeleton-line" />
          </view>
        </view>
      </view>

      <view v-else-if="errorMessage && !options" class="state-card">
        <StateBlock text="RTA 分数数据加载失败" action-text="重新加载" theme="teal" @action="retry" />
        <text class="state-detail">{{ errorMessage }}</text>
      </view>

      <template v-else-if="options">
        <view v-if="displayErrorMessage" class="inline-error">
          <text>{{ displayErrorMessage }}</text>
          <button class="text-button" size="mini" @click="retry">重试</button>
        </view>

        <view v-if="seasonOptions.length" class="filter-panel season-filter-panel">
          <view class="filter-row">
            <text class="filter-label">赛季</text>
            <scroll-view class="chip-scroll" scroll-x enable-flex>
              <view class="chip-list">
                <view
                  v-for="option in seasonOptions"
                  :key="option.season"
                  class="filter-chip season-chip"
                  :class="{ active: season === option.season, disabled: !option.selectable }"
                  @click="selectSeasonOption(option)">
                  <text>{{ getSeasonLabel(option) }}</text>
                </view>
              </view>
            </scroll-view>
          </view>
        </view>

        <view v-if="isHistoricalSeason && seasonHistorySeries.length" class="scope-notice historical-notice">
          <uni-icons type="info" size="16" color="var(--theme-text-secondary)" />
          <text>历史赛季按距结算日读取 FINAL 分数线，暂无可对齐的绝对日期，不展示历史趋势。</text>
        </view>

        <!-- <view v-if="scopeUnverified" class="scope-notice">
          <uni-icons type="info" size="16" color="var(--theme-text-secondary)" />
          <text>来源覆盖范围尚未完成核验，当前页面仅展示可用分数线，不用于分数预测。</text>
        </view> -->

        <view v-if="contentLoading && hasSelection" class="content-loading">
          <view class="section-card content-skeleton-card">
            <view class="skeleton-line wide" />
            <view class="skeleton-line content-subtitle-line" />
            <view class="skeleton-cutoff-grid">
              <view v-for="index in 6" :key="index" class="skeleton-cutoff-card">
                <view class="skeleton-line" />
                <view class="skeleton-line wide" />
                <view class="skeleton-line short" />
              </view>
            </view>
          </view>

          <view v-if="!isHistoricalSeason" class="section-card content-skeleton-card">
            <view class="skeleton-line wide" />
            <view class="chart-skeleton">
              <view class="skeleton-line wide" />
              <view class="skeleton-line" />
            </view>
          </view>
        </view>

        <view v-if="!hasAnyData && !hasDataError && !contentLoading" class="state-card">
          <StateBlock text="暂无数据" action-text="重新加载" theme="teal" @action="retry" />
          <text class="state-detail">可以切换赛季或稍后刷新查看新的数据</text>
        </view>

        <template v-if="hasSelection">
          <view v-if="cutoffGroups.length || currentError" class="section-card cutoff-board-card">
            <view class="section-heading">
              <view class="heading-copy">
                <text class="section-title">分数线</text>
                <!-- <text class="section-subtitle">S{{ season }} · {{ selectedServer?.name || server }} · 各段位当前分数</text> -->
              </view>
            </view>

            <view v-if="cutoffGroups.length" class="cutoff-groups">
              <view v-for="group in cutoffGroups" :key="group.key" class="cutoff-group">
                <view class="cutoff-group-heading">
                  <text class="cutoff-group-title">{{ group.name }}</text>
                  <!-- <text class="cutoff-group-subtitle">一 / 二 / 三</text> -->
                </view>
                <view class="cutoff-group-grid">
                  <view v-for="cutoff in group.cutoffs" :key="cutoff.key" :class="['cutoff-card', `group-${cutoff.group}`]">
                    <text class="cutoff-name">{{ formatTarget(cutoff.key, cutoff.name) }}</text>
                    <text class="cutoff-score">{{ formatScore(cutoff.score) }}</text>
                    <text v-if="cutoff.rank !== null" class="cutoff-rank">目标名次 {{ formatRank(cutoff.rank) }}</text>
                  </view>
                </view>
              </view>
            </view>
            <view v-else-if="currentError" class="section-state section-error-state">
              <text>{{ currentError }}</text>
              <button class="text-button" size="mini" @click="retry">重试</button>
            </view>
            <view v-if="current" class="metadata-row">
              <text>赛季结束 {{ formatDateTime(current.seasonEndsAt) }}</text>
              <text>数据时间 {{ formatDateTime(current.capturedAt) }}</text>
              <!-- <text>来源更新时间 {{ formatDateTime(current.sourceUpdatedAt, '来源未提供') }}</text> -->
            </view>
            <view v-if="current?.seasonEndsAt" class="metadata-row">
              <text>赛季结束 {{ formatDateTime(current.seasonEndsAt) }}</text>
              <!-- <text v-if="config?.researchDisplay.collectionUntil">
                观察截止 {{ formatDateTime(config.researchDisplay.collectionUntil) }}
              </text> -->
            </view>
            <view v-else-if="isHistoricalSeason && seasonHistorySeries.length" class="metadata-row">
              <text>S{{ season }} · 相对结算阶段</text>
              <text>10D～FINAL</text>
            </view>
          </view>

          <!-- <view v-if="historyChartSeries.length" class="section-card">
            <view class="section-heading">
              <view class="heading-copy">
                <text class="section-title">当前趋势</text>
                <text class="section-subtitle">各绿区 / 红区 · 按日期对比</text>
              </view>
              <text class="section-badge">{{ historyChartSeries.length }} 天</text>
            </view>
            <StageLineChart
              :categories="historyChartCategories"
              :series="historyChartSeries"
              :width="chartWidth(historyChartCategories.length)" />
            <view class="metadata-row">
              <text>时间范围 {{ formatDate(historyChartRange.from) }} - {{ formatDate(historyChartRange.to) }}</text>
            </view>
          </view> -->

          <view v-if="!isHistoricalSeason && selectedTargetChartPoints.length" class="section-card">
            <view class="section-heading">
              <view class="heading-copy">
                <text class="section-title">趋势</text>
                <!-- <text class="section-subtitle">按日期变化 · 当前段位独立刻度</text> -->
              </view>
              <!-- <text class="section-badge">{{ selectedTargetChartPoints.length }} 个样本</text> -->
            </view>
            <view v-if="targetOptions.length" class="chart-filter-row">
              <text class="filter-label">目标</text>
              <scroll-view class="chip-scroll" scroll-x enable-flex>
                <view class="chip-list">
                  <view
                    v-for="option in targetOptions"
                    :key="option.key"
                    class="filter-chip"
                    :class="{ active: targetKey === option.key, disabled: !option.selectable }"
                    @click="selectTargetOption(option)">
                    <text>{{ formatTarget(option.key, option.name) }}</text>
                  </view>
                </view>
              </scroll-view>
            </view>
            <StageLineChart
              :categories="selectedTargetChartCategories"
              :series="selectedTargetChartSeries"
              :width="chartWidth(selectedTargetChartCategories.length)" />
            <view class="metadata-row">
              <text>时间范围 {{ formatDate(selectedTargetChartRange.from) }} - {{ formatDate(selectedTargetChartRange.to) }}</text>
            </view>
          </view>

          <view v-if="historyError && !historyChartSeries.length" class="section-card">
            <view class="section-state section-error-state">
              <text>{{ historyError }}</text>
              <button class="text-button" size="mini" @click="retry">重试</button>
            </view>
          </view>

          <view
            v-if="
              !historyChartSeries.length &&
              !selectedTargetChartPoints.length &&
              !historyError &&
              !isHistoricalSeason &&
              (config?.capabilities.history || config?.capabilities.historicalSeasonHistory) &&
              hasAnyData &&
              dataLoading
            "
            class="section-card">
            <view class="section-heading"><text class="section-title">趋势</text></view>
            <view class="chart-skeleton"><view class="skeleton-line wide" /><view class="skeleton-line" /></view>
          </view>
        </template>
      </template>
    </view>
  </PageLayout>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { onLoad, onPullDownRefresh, onShow } from '@dcloudio/uni-app'
  import dayjs from 'dayjs'
  import StateBlock from '../components/state-block.vue'
  import { SWC_RTA_SCORE_SHARE_IMAGE } from '../share'
  import StageLineChart from './score-forecast/stage-line-chart.vue'
  import { useRtaScoreForecast } from './score-forecast/use-rta-score-forecast'
  import type { ScoreCutoff, ScoreHistory, ScoreSeasonOption, ScoreTargetOption } from './score-forecast/score-types'
  import { formatRankValue, formatScoreValue, formatTargetLabel } from './score-forecast/score-normalizers'
  import { reportToolVisit } from '@/utils/tracker'

  interface TrendPoint {
    key: string
    label: string
    score: number
    index: number
  }

  interface TrendSeries {
    key: string
    label: string
    points: TrendPoint[]
  }

  const {
    options,
    config,
    current,
    historySeries,
    seasonHistorySeries,
    server,
    season,
    league,
    targetKey,
    initialized,
    loading,
    dataLoading,
    errorMessage,
    isStale,
    seasonOptions,
    targetOptions,
    selectedTarget,
    currentError,
    historyError,
    isHistoricalSeason,
    initialize,
    refresh,
    selectSeason,
    selectTarget,
    retry,
  } = useRtaScoreForecast()

  const hasSelection = computed(() => Boolean(server.value && season.value && league.value && targetKey.value))
  const hasAnyData = computed(() =>
    Boolean(
      current.value || historySeries.value.some(item => item.points.length) || seasonHistorySeries.value.some(item => item.points.length),
    ),
  )
  const initialLoading = computed(() => loading.value && !initialized.value)
  const contentLoading = computed(() => (loading.value || dataLoading.value) && !hasAnyData.value)
  const hasDataError = computed(() => Boolean(currentError.value || historyError.value))
  const displayErrorMessage = computed(() => [errorMessage.value, currentError.value, historyError.value].filter(Boolean).join('；'))
  const selectedTargetLabel = computed(() => formatTargetLabel(selectedTarget.value?.key, selectedTarget.value?.name || '当前目标'))
  const historicalCutoffs = computed<ScoreCutoff[]>(() =>
    seasonHistorySeries.value
      .map(item => {
        const target = targetOptions.value.find(option => option.key === item.target.key)
        const finalPoint = item.points.find(point => point.phase === 'FINAL' || point.daysToFinal === 0)
        if (!target || typeof finalPoint?.score !== 'number' || !Number.isFinite(finalPoint.score)) return null
        return {
          ...target,
          latestScore: finalPoint.score,
          available: true,
          score: finalPoint.score,
        }
      })
      .filter((cutoff): cutoff is ScoreCutoff => cutoff !== null),
  )
  const cutoffGroups = computed(() => {
    const groups = [
      { key: 'green', name: '绿区' },
      { key: 'red', name: '红区' },
    ]
    const cutoffs = current.value?.cutoffs ?? historicalCutoffs.value
    return groups
      .map(group => ({
        ...group,
        cutoffs: cutoffs.filter(cutoff => cutoff.group === group.key && cutoff.available),
      }))
      .filter(group => group.cutoffs.length)
  })

  const getSeasonLabel = (option: ScoreSeasonOption): string => {
    return option.status === 'current' ? `当前 S${option.season}` : `S${option.season}`
  }

  const formatTarget = (key: string, fallback: string): string => formatTargetLabel(key, fallback)

  const formatDateTime = (value: string | null | undefined, fallback = '--'): string => {
    if (!value || !dayjs(value).isValid()) return fallback
    return dayjs(value).format('MM-DD HH:mm')
  }

  const formatDate = (value: string | null | undefined): string => {
    if (!value || !dayjs(value).isValid()) return '--'
    return dayjs(value).format('MM-DD')
  }

  const formatScore = (value: number | null | undefined): string => formatScoreValue(value)
  const formatRank = (value: number | null | undefined): string => formatRankValue(value)
  const chartWidth = (count: number): string => `${Math.max(300, count * 110)}rpx`

  const trendTargets = computed(() =>
    targetOptions.value.filter(target =>
      historySeries.value.some(
        item =>
          item.target.key === target.key && item.points.some(point => typeof point.score === 'number' && Number.isFinite(point.score)),
      ),
    ),
  )

  const historyChartSeries = computed<TrendSeries[]>(() => {
    const targetIndexes = new Map(trendTargets.value.map((target, index) => [target.key, index]))
    const dateBuckets = new Map<string, { label: string; points: Map<string, TrendPoint> }>()

    historySeries.value.forEach((historyItem: ScoreHistory) => {
      const targetIndex = targetIndexes.get(historyItem.target.key)
      if (targetIndex === undefined) return
      historyItem.points.forEach(point => {
        if (typeof point.score !== 'number' || !Number.isFinite(point.score)) return
        const capturedDate = dayjs(point.capturedAt)
        if (!capturedDate.isValid()) return
        const dateKey = capturedDate.format('YYYY-MM-DD')
        const bucket = dateBuckets.get(dateKey) || { label: capturedDate.format('MM-DD'), points: new Map() }
        bucket.points.set(historyItem.target.key, {
          key: `${dateKey}-${historyItem.target.key}`,
          label: formatTarget(historyItem.target.key, historyItem.target.name),
          score: point.score,
          index: targetIndex,
        })
        dateBuckets.set(dateKey, bucket)
      })
    })

    return [...dateBuckets.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, bucket]) => ({
        key,
        label: bucket.label,
        points: [...bucket.points.values()].sort((left, right) => left.index - right.index),
      }))
      .filter(series => series.points.length > 0)
  })

  const selectedTargetChartPoints = computed(() => {
    const targetHistory = historySeries.value.find(item => item.target.key === targetKey.value)
    return (targetHistory?.points || [])
      .filter(point => typeof point.score === 'number' && Number.isFinite(point.score) && dayjs(point.capturedAt).isValid())
      .map(point => ({
        key: point.capturedAt,
        label: dayjs(point.capturedAt).format('MM-DD'),
        score: point.score as number,
      }))
  })

  const selectedTargetChartCategories = computed(() => selectedTargetChartPoints.value.map(point => point.label))

  const selectedTargetChartSeries = computed<TrendSeries[]>(() => [
    {
      key: `target-${targetKey.value}`,
      label: selectedTargetLabel.value,
      points: selectedTargetChartPoints.value.map((point, index) => ({ ...point, index })),
    },
  ])

  const selectedTargetChartRange = computed(() => ({
    from: selectedTargetChartPoints.value[0]?.key || null,
    to: selectedTargetChartPoints.value[selectedTargetChartPoints.value.length - 1]?.key || null,
  }))

  const selectSeasonOption = (option: ScoreSeasonOption) => {
    if (option.selectable) void selectSeason(option.season)
  }

  const selectTargetOption = (option: ScoreTargetOption) => {
    if (option.selectable) void selectTarget(option.key)
  }

  onLoad(() => {
    void initialize()
  })

  onShow(() => {
    reportToolVisit('compendium-swc-rta-score-forecast')
  })

  onPullDownRefresh(async () => {
    try {
      await refresh()
    } finally {
      uni.stopPullDownRefresh()
    }
  })
</script>

<style scoped lang="scss">
  .score-page {
    min-height: 100vh;
    padding: 24rpx 24rpx 72rpx;
    box-sizing: border-box;
    background: var(--theme-bg);
    color: var(--theme-text);
  }

  .section-heading,
  .metadata-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16rpx;
  }

  .page-intro {
    margin-bottom: 20rpx;
  }

  .heading-copy {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
  }

  .section-subtitle,
  .metadata-row,
  .state-detail {
    color: var(--theme-text-tertiary);
    font-size: 21rpx;
    line-height: 1.45;
  }

  .notice-card,
  .scope-notice {
    display: flex;
    align-items: center;
    gap: 10rpx;
    margin-bottom: 20rpx;
    padding: 16rpx 18rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 18rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text-secondary);
    font-size: 22rpx;
    line-height: 1.45;
  }

  .scope-notice {
    margin-top: 20rpx;
    margin-bottom: 0;
  }

  .notice-action {
    min-width: 92rpx;
    margin: 0 0 0 auto;
    border: 1rpx solid var(--theme-border);
    border-radius: 999rpx;
    background: var(--theme-surface);
    color: var(--theme-brand);
    font-size: 21rpx;
  }

  .filter-panel,
  .section-card {
    margin-top: 20rpx;
    padding: 22rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 22rpx;
    background: var(--theme-surface);
    box-shadow: 0 6rpx 18rpx var(--theme-shadow-xs);
  }

  .filter-row {
    display: flex;
    align-items: center;
    gap: 16rpx;
  }

  .filter-row + .filter-row {
    margin-top: 18rpx;
  }

  .chart-filter-row {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin-bottom: 18rpx;
  }

  .filter-label {
    width: 64rpx;
    flex-shrink: 0;
    color: var(--theme-text-secondary);
    font-size: 23rpx;
    font-weight: 700;
  }

  .chip-scroll,
  .phase-scroll {
    min-width: 0;
    flex: 1;
    white-space: nowrap;
  }

  .chip-list {
    display: inline-flex;
    align-items: center;
    gap: 12rpx;
    padding-right: 8rpx;
  }

  .filter-chip {
    min-height: 62rpx;
    padding: 0 20rpx;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    border: 1rpx solid var(--theme-border);
    border-radius: 999rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text-secondary);
    font-size: 22rpx;
    font-weight: 650;
  }

  .filter-chip.active {
    border-color: var(--theme-brand);
    background: var(--theme-brand);
    color: var(--theme-surface);
  }

  .filter-chip.disabled {
    opacity: 0.42;
  }

  .section-heading {
    align-items: center;
    margin-bottom: 18rpx;
  }

  .section-title {
    color: var(--theme-text);
    font-size: 28rpx;
    font-weight: 800;
    line-height: 1.3;
  }

  .section-badge {
    flex-shrink: 0;
    padding: 6rpx 12rpx;
    border-radius: 999rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text-secondary);
    font-size: 20rpx;
  }

  .stage-bar-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14rpx;
  }

  .stage-bar-card {
    min-width: 0;
    padding: 16rpx 12rpx 12rpx;
    overflow: hidden;
    border: 1rpx solid var(--theme-border);
    border-radius: 18rpx;
    background: var(--theme-surface-2);
  }

  .stage-bar-heading {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8rpx;
    margin-bottom: 10rpx;
  }

  .stage-bar-title {
    color: var(--theme-text);
    font-size: 24rpx;
    font-weight: 800;
  }

  .stage-bar-latest {
    flex-shrink: 0;
    color: var(--theme-text-tertiary);
    font-size: 18rpx;
  }

  .cutoff-group-grid,
  .stage-summary-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12rpx;
  }

  .cutoff-groups {
    display: flex;
    flex-direction: column;
    gap: 18rpx;
  }

  .cutoff-group-heading {
    display: flex;
    align-items: baseline;
    gap: 10rpx;
    margin-bottom: 10rpx;
  }

  .cutoff-group-title {
    color: var(--theme-text);
    font-size: 23rpx;
    font-weight: 800;
  }

  .cutoff-group-subtitle {
    color: var(--theme-text-tertiary);
    font-size: 19rpx;
  }

  .cutoff-group-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .cutoff-card,
  .stage-summary-card {
    min-width: 0;
    padding: 18rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 18rpx;
    background: var(--theme-surface-2);
  }

  .cutoff-card.group-green {
    border-left: 6rpx solid #4ba36d;
  }

  .cutoff-card.group-red {
    border-left: 6rpx solid #cf6679;
  }

  .cutoff-name,
  .cutoff-score,
  .cutoff-rank,
  .stage-summary-label,
  .stage-summary-score,
  .stage-summary-phase {
    display: block;
  }

  .cutoff-name,
  .stage-summary-label {
    color: var(--theme-text-secondary);
    font-size: 22rpx;
  }

  .cutoff-score,
  .stage-summary-score {
    margin-top: 8rpx;
    color: var(--theme-text);
    font-size: 34rpx;
    font-weight: 800;
  }

  .cutoff-rank,
  .stage-summary-phase {
    margin-top: 6rpx;
    color: var(--theme-text-tertiary);
    font-size: 20rpx;
  }

  .metadata-row {
    margin-top: 16rpx;
    flex-wrap: wrap;
    justify-content: flex-start;
    color: var(--theme-text-tertiary);
    font-size: 20rpx;
  }

  .quality-notice {
    margin-top: 14rpx;
    padding: 14rpx 16rpx;
    border-radius: 14rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text-secondary);
    font-size: 21rpx;
    line-height: 1.5;
  }

  .scope-notice + .state-card,
  .filter-panel + .state-card {
    margin-top: 20rpx;
  }

  .empty-data-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10rpx;
    text-align: center;
  }

  .empty-data-icon {
    width: 72rpx;
    height: 72rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: var(--theme-surface-2);
  }

  .empty-data-title {
    color: var(--theme-text);
    font-size: 24rpx;
    font-weight: 700;
  }

  .empty-data-detail {
    max-width: 580rpx;
    color: var(--theme-text-tertiary);
    font-size: 21rpx;
    line-height: 1.5;
  }

  .section-state {
    min-height: 100rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14rpx;
    color: var(--theme-text-secondary);
    font-size: 22rpx;
    text-align: center;
  }

  .inline-error {
    margin-top: 18rpx;
    padding: 14rpx 16rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 14rpx;
    background: var(--theme-surface);
    color: var(--theme-danger);
    font-size: 21rpx;
  }

  .text-button {
    margin: 0;
    padding: 0 18rpx;
    border-radius: 999rpx;
    background: var(--theme-surface-2);
    color: var(--theme-brand);
    font-size: 21rpx;
  }

  .chart-skeleton {
    min-height: 260rpx;
    padding: 24rpx;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: 18rpx;
    border-radius: 18rpx;
    background: var(--theme-surface-2);
  }

  .state-card {
    min-height: 300rpx;
    margin-top: 20rpx;
    padding: 48rpx 24rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 18rpx;
    box-sizing: border-box;
    border: 1rpx solid var(--theme-border);
    border-radius: 22rpx;
    background: var(--theme-surface);
  }

  .state-detail {
    max-width: 560rpx;
    text-align: center;
  }

  .initial-loading,
  .content-loading {
    display: flex;
    flex-direction: column;
  }

  .filter-skeleton-panel,
  .content-skeleton-card {
    overflow: hidden;
  }

  .skeleton-filter-row {
    display: flex;
    align-items: center;
    gap: 16rpx;
  }

  .skeleton-filter-label {
    width: 64rpx;
    height: 28rpx;
    flex-shrink: 0;
    border-radius: 12rpx;
    background: var(--theme-surface-2);
    animation: skeleton-pulse 1.35s ease-in-out infinite;
  }

  .skeleton-chip-list {
    min-width: 0;
    flex: 1;
    display: flex;
    gap: 12rpx;
    overflow: hidden;
  }

  .skeleton-chip {
    width: 128rpx;
    height: 62rpx;
    flex-shrink: 0;
    border-radius: 999rpx;
    background: var(--theme-surface-2);
    animation: skeleton-pulse 1.35s ease-in-out infinite;
  }

  .content-skeleton-card {
    min-height: 250rpx;
  }

  .content-subtitle-line {
    width: 54%;
    margin-top: 16rpx;
  }

  .skeleton-cutoff-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12rpx;
    margin-top: 22rpx;
  }

  .skeleton-cutoff-card {
    min-width: 0;
    min-height: 132rpx;
    padding: 18rpx;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 18rpx;
    box-sizing: border-box;
    border: 1rpx solid var(--theme-border);
    border-radius: 22rpx;
    background: var(--theme-surface-2);
  }

  .skeleton-line {
    width: 68%;
    height: 22rpx;
    border-radius: 12rpx;
    background: var(--theme-surface-2);
    animation: skeleton-pulse 1.35s ease-in-out infinite;
  }

  .skeleton-line.wide {
    width: 92%;
    height: 30rpx;
  }

  .skeleton-line.short {
    width: 46%;
  }

  @keyframes skeleton-pulse {
    0%,
    100% {
      opacity: 0.52;
    }

    50% {
      opacity: 1;
    }
  }
</style>
