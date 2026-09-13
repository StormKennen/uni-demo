<template>
  <PageLayout
    title="RTA分数线"
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

      <view v-if="loading && !options" class="skeleton-list">
        <view v-for="index in 4" :key="index" class="skeleton-card">
          <view class="skeleton-line wide" />
          <view class="skeleton-line" />
          <view class="skeleton-line short" />
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

        <view class="filter-panel">
          <view v-if="serverOptions.length" class="filter-row">
            <text class="filter-label">区服</text>
            <scroll-view class="chip-scroll" scroll-x enable-flex>
              <view class="chip-list">
                <view
                  v-for="option in serverOptions"
                  :key="option.key"
                  class="filter-chip"
                  :class="{ active: server === option.key, disabled: !option.selectable }"
                  @click="selectServerOption(option)">
                  <text>{{ option.name }}</text>
                </view>
              </view>
            </scroll-view>
          </view>

          <view v-if="seasonOptions.length" class="filter-row">
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

          <view v-if="leagueOptions.length" class="filter-row">
            <text class="filter-label">分区</text>
            <scroll-view class="chip-scroll" scroll-x enable-flex>
              <view class="chip-list">
                <view
                  v-for="option in leagueOptions"
                  :key="option.key"
                  class="filter-chip"
                  :class="{ active: league === option.key, disabled: !option.selectable }"
                  @click="selectLeagueOption(option)">
                  <text>{{ option.name }}</text>
                </view>
              </view>
            </scroll-view>
          </view>

          <view v-if="targetOptions.length" class="filter-row">
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
        </view>

        <view v-if="scopeUnverified" class="scope-notice">
          <uni-icons type="info" size="16" color="var(--theme-text-secondary)" />
          <text>来源覆盖范围尚未完成核验，当前页面仅展示已采集数据，不用于分数预测。</text>
        </view>

        <view v-if="!hasAnyData && !hasDataError && !dataLoading" class="state-card">
          <StateBlock text="当前筛选暂无可展示数据" action-text="重新加载" theme="teal" @action="retry" />
          <text class="state-detail">可以切换赛季或稍后刷新查看新的采集结果</text>
        </view>

        <template v-if="hasSelection">
          <view class="section-card cutoff-board-card">
            <view class="section-heading">
              <view class="heading-copy">
                <text class="section-title">当前赛季分段分界线</text>
                <text class="section-subtitle">S{{ season }} · {{ selectedServer?.name || server }} · 各段位当前分数</text>
              </view>
              <text v-if="current?.cutoffs.length" class="section-badge">{{ current.cutoffs.length }} 个分段</text>
            </view>

            <view v-if="current?.cutoffs.length" class="cutoff-grid">
              <view
                v-for="cutoff in current.cutoffs"
                :key="cutoff.key"
                class="cutoff-card"
                :class="{ highlighted: targetKey === cutoff.key }">
                <text class="cutoff-name">{{ formatTarget(cutoff.key, cutoff.name) }}</text>
                <text class="cutoff-score">{{ formatScore(cutoff.score) }}</text>
                <text class="cutoff-rank">目标名次 {{ formatRank(cutoff.rank) }}</text>
              </view>
            </view>
            <view v-else-if="currentError" class="section-state section-error-state">
              <text>{{ currentError }}</text>
              <button class="text-button" size="mini" @click="retry">重试</button>
            </view>
            <view v-else class="section-state cutoff-board-empty">
              <text>当前筛选暂无实时分界线快照</text>
              <text class="state-detail">历史趋势仍可查看；待分数线快照采集并入库后，这里会展示各段位分界线。</text>
            </view>

            <view v-if="current" class="metadata-row">
              <text>采集时间 {{ formatDateTime(current.capturedAt) }}</text>
              <text>来源更新时间 {{ formatDateTime(current.sourceUpdatedAt, '来源未提供') }}</text>
            </view>
            <view v-if="current?.dataQuality.warnings.length" class="warning-list">
              <text v-for="warning in current.dataQuality.warnings" :key="warning">{{ warning }}</text>
            </view>
          </view>

          <view v-if="historyChartPoints.length" class="section-card">
            <view class="section-heading">
              <view class="heading-copy">
                <text class="section-title">当前采集趋势</text>
                <text class="section-subtitle">{{ selectedTargetLabel }} · 按采集时间</text>
              </view>
              <text class="section-badge">{{ historyChartPoints.length }} 个样本</text>
            </view>
            <StageBarChart :points="historyChartPoints" :width="chartWidth(historyChartPoints.length)" />
            <view class="metadata-row">
              <text>时间范围 {{ formatDate(history?.range.from) }} - {{ formatDate(history?.range.to) }}</text>
              <text v-if="history?.dataQuality.status === 'insufficient'">样本较少</text>
            </view>
          </view>

          <view v-else-if="historyError" class="section-card">
            <view class="section-state section-error-state">
              <text>{{ historyError }}</text>
              <button class="text-button" size="mini" @click="retry">重试</button>
            </view>
          </view>

          <view v-else-if="config?.capabilities.history && dataLoading" class="section-card">
            <view class="section-heading"><text class="section-title">当前采集趋势</text></view>
            <view class="chart-skeleton"><view class="skeleton-line wide" /><view class="skeleton-line" /></view>
          </view>

          <view v-if="selectedSeasonHistory" class="section-card">
            <view class="section-heading">
              <view class="heading-copy">
                <text class="section-title">选定赛季走势</text>
                <text class="section-subtitle">{{ selectedTargetLabel }} · 相对结算阶段</text>
              </view>
              <text class="section-badge">{{ selectedSeasonHistory.points.length }} 个阶段</text>
            </view>

            <view class="stage-summary-grid">
              <view v-for="item in selectedStageSummary" :key="item.phase" class="stage-summary-card">
                <text class="stage-summary-label">{{ item.label }}</text>
                <text class="stage-summary-score">{{ formatScore(item.score) }}</text>
                <text class="stage-summary-phase">{{ item.phase }}</text>
              </view>
            </view>

            <StageBarChart :points="selectedSeasonChartPoints" :width="chartWidth(selectedSeasonChartPoints.length)" />
            <view class="metadata-row">
              <text>横轴为距离 FINAL 的阶段，不代表自然日</text>
              <text v-if="!selectedSeasonHistory.dataQuality.scopeVerified">范围待核验</text>
            </view>
          </view>

          <view v-else-if="seasonHistoryError && !seasonHistories.length" class="section-card">
            <view class="section-state">
              <text>{{ seasonHistoryError }}</text>
              <button class="text-button" size="mini" @click="retry">重试</button>
            </view>
          </view>

          <view v-if="seasonHistories.length" class="section-card">
            <view class="section-heading">
              <view class="heading-copy">
                <text class="section-title">多赛季对比</text>
                <text class="section-subtitle">同一目标在不同赛季的阶段分数</text>
              </view>
              <text class="section-badge">{{ seasonHistories.length }} 个赛季</text>
            </view>

            <scroll-view class="phase-scroll" scroll-x enable-flex>
              <view class="chip-list">
                <view
                  v-for="phase in phaseOptions"
                  :key="phase.phase"
                  class="filter-chip phase-chip"
                  :class="{ active: comparisonPhase === phase.phase }"
                  @click="comparisonPhase = phase.phase">
                  <text>{{ phase.phase }}</text>
                </view>
              </view>
            </scroll-view>

            <view v-if="comparisonChartPoints.length" class="comparison-chart-wrap">
              <StageBarChart :points="comparisonChartPoints" :width="chartWidth(comparisonChartPoints.length)" />
            </view>
            <view v-else class="section-state"><text>该阶段暂无可对比分数</text></view>
            <view class="quality-notice"><text>历史序列按赛季分别保存；当前数据范围仍处于核验阶段。</text></view>
          </view>
        </template>
      </template>
    </view>
  </PageLayout>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { onLoad, onPullDownRefresh, onShow } from '@dcloudio/uni-app'
  import dayjs from 'dayjs'
  import StateBlock from '../components/state-block.vue'
  import StageBarChart from './score-forecast/stage-bar-chart.vue'
  import { useRtaScoreForecast } from './score-forecast/use-rta-score-forecast'
  import type { ScoreSeasonHistoryPoint, ScoreSeasonOption, ScoreSimpleOption, ScoreTargetOption } from './score-forecast/score-types'
  import { formatRankValue, formatScoreValue, formatTargetLabel } from './score-forecast/score-normalizers'
  import { reportToolVisit } from '@/utils/tracker'

  interface InputPoint {
    key: string
    label: string
    score: number
  }

  interface PhaseOption {
    phase: string
    daysToFinal: number | null
  }

  const {
    options,
    config,
    current,
    history,
    seasonHistories,
    selectedSeasonHistory,
    server,
    season,
    league,
    targetKey,
    loading,
    dataLoading,
    errorMessage,
    isStale,
    serverOptions,
    seasonOptions,
    leagueOptions,
    targetOptions,
    selectedServer,
    selectedTarget,
    currentError,
    historyError,
    initialize,
    refresh,
    selectServer,
    selectSeason,
    selectLeague,
    selectTarget,
    retry,
    seasonHistoryError,
  } = useRtaScoreForecast()

  const comparisonPhase = ref('')
  const hasSelection = computed(() => Boolean(server.value && season.value && league.value && targetKey.value))
  const hasAnyData = computed(() =>
    Boolean(current.value || history.value?.points.length || seasonHistories.value.length || selectedSeasonHistory.value),
  )
  const hasDataError = computed(() => Boolean(currentError.value || historyError.value || seasonHistoryError.value))
  const displayErrorMessage = computed(() =>
    [errorMessage.value, currentError.value, historyError.value, seasonHistoryError.value].filter(Boolean).join('；'),
  )
  const scopeUnverified = computed(
    () =>
      seasonHistories.value.some(item => !item.dataQuality.scopeVerified) ||
      Boolean(selectedSeasonHistory.value && !selectedSeasonHistory.value.dataQuality.scopeVerified),
  )
  const selectedTargetLabel = computed(() => formatTargetLabel(selectedTarget.value?.key, selectedTarget.value?.name || '当前目标'))

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
  const chartWidth = (count: number): string => `${Math.max(100, count * 92)}rpx`

  const toInputPoints = (points: Array<{ label: string; score: number | null; key?: string }>): InputPoint[] => {
    const validPoints = points.filter(
      (point): point is { label: string; score: number; key?: string } => typeof point.score === 'number' && Number.isFinite(point.score),
    )
    if (!validPoints.length) return []
    return validPoints.map((point, index) => ({
      key: `${point.key || point.label}-${index}`,
      label: point.label,
      score: point.score,
    }))
  }

  const historyChartPoints = computed(() =>
    toInputPoints(
      (history.value?.points || []).map(point => ({
        label: dayjs(point.capturedAt).format('MM-DD'),
        score: point.score,
        key: point.capturedAt,
      })),
    ),
  )

  const selectedSeasonChartPoints = computed(() =>
    toInputPoints(
      (selectedSeasonHistory.value?.points || []).map(point => ({
        label: point.phase,
        score: point.score,
        key: `${point.phase}-${point.daysToFinal}`,
      })),
    ),
  )

  const selectedStageSummary = computed(() => {
    const points = (selectedSeasonHistory.value?.points || []).filter(
      (point): point is ScoreSeasonHistoryPoint & { score: number } => typeof point.score === 'number' && Number.isFinite(point.score),
    )
    if (!points.length) return []
    const first = points[0]
    const final = points.find(point => point.daysToFinal === 0)
    const summary: Array<{ label: string; phase: string; score: number }> = [{ label: '最早采集', phase: first.phase, score: first.score }]
    if (final && final.phase !== first.phase) summary.push({ label: 'FINAL', phase: final.phase, score: final.score })
    return summary
  })

  const phaseOptions = computed<PhaseOption[]>(() => {
    const phases = new Map<string, number | null>()
    seasonHistories.value.forEach(item => {
      item.points.forEach(point => {
        if (!point.phase || phases.has(point.phase)) return
        phases.set(point.phase, point.daysToFinal)
      })
    })
    return [...phases.entries()]
      .map(([phase, daysToFinal]) => ({ phase, daysToFinal }))
      .sort((left, right) => (right.daysToFinal ?? -1) - (left.daysToFinal ?? -1))
  })

  watch(
    phaseOptions,
    nextPhases => {
      if (!nextPhases.some(item => item.phase === comparisonPhase.value)) comparisonPhase.value = nextPhases[0]?.phase || ''
    },
    { immediate: true },
  )

  const comparisonChartPoints = computed(() => {
    const points = seasonHistories.value
      .map(item => {
        const point = item.points.find(candidate => candidate.phase === comparisonPhase.value)
        return point && typeof point.score === 'number' && Number.isFinite(point.score)
          ? { season: item.season || 0, score: point.score }
          : null
      })
      .filter((point): point is { season: number; score: number } => point !== null)
      .sort((left, right) => left.season - right.season)
    return toInputPoints(points.map(point => ({ label: `S${point.season}`, score: point.score, key: String(point.season) })))
  })

  const selectServerOption = (option: ScoreSimpleOption) => {
    if (option.selectable) void selectServer(option.key)
  }

  const selectSeasonOption = (option: ScoreSeasonOption) => {
    if (option.selectable) void selectSeason(option.season)
  }

  const selectLeagueOption = (option: ScoreSimpleOption) => {
    if (option.selectable) void selectLeague(option.key)
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

  .cutoff-grid,
  .stage-summary-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12rpx;
  }

  .cutoff-card,
  .stage-summary-card {
    min-width: 0;
    padding: 18rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 18rpx;
    background: var(--theme-surface-2);
  }

  .cutoff-card.highlighted {
    border-color: var(--theme-brand);
  }

  .cutoff-board-empty {
    flex-direction: column;
    padding: 28rpx 18rpx;
    text-align: center;
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

  .warning-list,
  .quality-notice {
    margin-top: 14rpx;
    padding: 14rpx 16rpx;
    border-radius: 14rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text-secondary);
    font-size: 21rpx;
    line-height: 1.5;
  }

  .warning-list {
    display: flex;
    flex-direction: column;
    gap: 4rpx;
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

  .comparison-chart-wrap {
    margin-top: 18rpx;
  }

  .phase-scroll {
    margin-bottom: 4rpx;
  }

  .phase-chip {
    min-height: 54rpx;
    padding: 0 18rpx;
    font-size: 20rpx;
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

  .skeleton-list {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
    margin-top: 20rpx;
  }

  .skeleton-card {
    min-height: 170rpx;
    padding: 26rpx;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 18rpx;
    box-sizing: border-box;
    border: 1rpx solid var(--theme-border);
    border-radius: 22rpx;
    background: var(--theme-surface);
  }

  .skeleton-line {
    width: 68%;
    height: 22rpx;
    border-radius: 12rpx;
    background: var(--theme-surface-2);
  }

  .skeleton-line.wide {
    width: 92%;
    height: 30rpx;
  }

  .skeleton-line.short {
    width: 46%;
  }
</style>
