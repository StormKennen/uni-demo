<template>
  <PageLayout
    title="RTA分数线"
    :share-title="rtaShareTitle"
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
          <view v-if="scoreSummaryGroups.length || currentError" class="section-card cutoff-board-card">
            <view class="section-heading">
              <view class="heading-copy">
                <text class="section-title">分数线</text>
                <!-- <text class="section-subtitle">S{{ season }} · {{ selectedServer?.name || server }} · 各段位当前分数</text> -->
              </view>
              <text v-if="current" class="section-generated-at">生成于 {{ formatDateTime(current.capturedAt) }}</text>
            </view>

            <view v-if="scoreSummaryGroups.length" class="score-summary-groups">
              <view v-for="group in scoreSummaryGroups" :key="group.key" class="score-summary-group">
                <view class="cutoff-group-heading">
                  <text class="cutoff-group-title">{{ group.name }}</text>
                </view>
                <view class="score-summary-list">
                  <view v-for="cutoff in group.cutoffs" :key="cutoff.key" :class="['score-summary-item', `group-${cutoff.group}`]">
                    <view class="score-summary-target">
                      <RtaTierStars :target-key="cutoff.key" :size="24" />
                      <!-- <text class="score-summary-name">{{ formatTarget(cutoff.key, cutoff.name) }}</text> -->
                    </view>
                    <text class="score-summary-score">{{ formatScore(cutoff.score) }}</text>
                    <text v-if="cutoff.rank !== null" class="score-summary-rank">第 {{ formatRank(cutoff.rank) }} 名</text>
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
              <!-- <text>来源更新时间 {{ formatDateTime(current.sourceUpdatedAt, '来源未提供') }}</text> -->
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

          <view v-if="!isHistoricalSeason && phaseTableRows.length" class="section-card">
            <view class="section-heading">
              <view class="heading-copy">
                <text class="section-title">阶段明细</text>
                <text class="section-subtitle">按距结算倒计时对照分数</text>
              </view>
            </view>
            <scroll-view class="phase-table-scroll" scroll-x enable-flex>
              <view class="phase-table" :style="{ width: phaseTableWidth }">
                <view class="phase-table-row phase-table-header">
                  <view class="phase-table-cell phase-table-phase">阶段</view>
                  <view v-for="target in phaseTableTargets" :key="target.key" class="phase-table-cell phase-table-target">
                    <RtaTierStars :target-key="target.key" :size="20" layout="stacked" />
                  </view>
                </view>
                <view v-for="row in phaseTableRows" :key="row.phase" class="phase-table-row">
                  <view class="phase-table-cell phase-table-phase">{{ row.phase }}</view>
                  <view v-for="target in phaseTableTargets" :key="`${row.phase}-${target.key}`" class="phase-table-cell phase-table-score">
                    <text>{{ formatScore(row.scores[target.key]) }}</text>
                  </view>
                </view>
              </view>
            </scroll-view>
          </view>

          <view v-if="!isHistoricalSeason && trendChartSeries.length" class="section-card">
            <view class="section-heading trend-section-heading">
              <view class="heading-copy">
                <text class="section-title">趋势</text>
                <text class="section-subtitle">{{ trendChartMode === 'phase' ? '多目标 · 按距结算倒计时展示' : '按日期展示' }}</text>
              </view>
              <view v-if="hasAvailableTrendEstimate" class="trend-estimate-toggle">
                <text>显示趋势估算</text>
                <switch :checked="showTrendEstimate" color="var(--theme-brand)" @change="toggleTrendEstimate" />
              </view>
            </view>
            <view v-if="trendTargetFilterOptions.length > 1" class="chart-filter-row">
              <text class="filter-label">分段</text>
              <scroll-view class="chip-scroll" scroll-x enable-flex>
                <view class="chip-list">
                  <view class="filter-chip" :class="{ active: !trendTargetFilter }" @click="selectTrendTarget('')">
                    <text>全部</text>
                  </view>
                  <view
                    v-for="option in trendTargetFilterOptions"
                    :key="option.key"
                    class="filter-chip"
                    :class="{ active: trendTargetFilter === option.key }"
                    @click="selectTrendTarget(option.key)">
                    <RtaTierStars :target-key="option.key" :size="20" />
                    <text>{{ option.name }}</text>
                  </view>
                </view>
              </scroll-view>
            </view>
            <StageLineChart
              :categories="trendChartCategories"
              :series="visibleTrendChartSeries"
              :width="chartWidth(trendChartCategories.length)" />
            <view class="metadata-row">
              <text v-if="trendChartMode === 'phase'">
                阶段 {{ trendChartCategories[0] }} - {{ trendChartCategories[trendChartCategories.length - 1] }}
              </text>
              <text v-else>时间范围 {{ formatDate(trendChartRange.from) }} - {{ formatDate(trendChartRange.to) }}</text>
            </view>
            <view v-if="trendChartMode === 'date'" class="chart-style-legend">
              <text class="chart-style-item"><text class="chart-style-line actual" />实际</text>
              <text v-if="hasAvailableTrendEstimate" class="chart-style-item"><text class="chart-style-line estimated" />趋势估算</text>
            </view>
          </view>

          <view v-if="historyError && !trendChartSeries.length && !phaseTableRows.length" class="section-card">
            <view class="section-state section-error-state">
              <text>{{ historyError }}</text>
              <button class="text-button" size="mini" @click="retry">重试</button>
            </view>
          </view>

          <view
            v-if="
              !trendChartSeries.length &&
              !phaseTableRows.length &&
              !historyError &&
              !isHistoricalSeason &&
              (config?.capabilities.history || config?.capabilities.historicalSeasonHistory || config?.researchDisplay.history) &&
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
  import { computed, ref, watch } from 'vue'
  import { onLoad, onPullDownRefresh, onShareAppMessage, onShareTimeline, onShow } from '@dcloudio/uni-app'
  import dayjs from 'dayjs'
  import StateBlock from '../components/state-block.vue'
  import { SWC_RTA_SCORE_SHARE_IMAGE } from '../share'
  import StageLineChart from './score-forecast/stage-line-chart.vue'
  import RtaTierStars from './score-forecast/RtaTierStars.vue'
  import { getRtaTierColor, getRtaTierMeta } from './score-forecast/rta-tier'
  import { useRtaScoreForecast } from './score-forecast/use-rta-score-forecast'
  import type {
    ScoreCutoff,
    ScoreSeasonHistory,
    ScoreSeasonHistoryPoint,
    ScoreSeasonOption,
    ScoreTrendEstimatePoint,
  } from './score-forecast/score-types'
  import { formatRankValue, formatScoreValue, formatTargetLabel } from './score-forecast/score-normalizers'
  import { reportToolVisit } from '@/utils/tracker'

  interface TrendPoint {
    key: string
    label: string
    score: number
    index: number
    estimated?: boolean
  }

  interface TrendSeries {
    key: string
    targetKey: string
    label: string
    color?: string
    points: TrendPoint[]
  }

  interface PhaseChartPoint extends ScoreSeasonHistoryPoint {
    label: string
  }

  interface ScoreSummaryGroup {
    key: 'green' | 'red'
    name: string
    cutoffs: ScoreCutoff[]
  }

  interface PhaseTableRow {
    phase: string
    scores: Record<string, number | null>
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
    currentError,
    historyError,
    isHistoricalSeason,
    initialize,
    refresh,
    selectSeason,
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
  const isRenderableScore = (value: number | null | undefined): value is number =>
    typeof value === 'number' && Number.isFinite(value) && value !== 1
  const historicalCutoffs = computed<ScoreCutoff[]>(() =>
    seasonHistorySeries.value
      .map(item => {
        const target = options.value?.targets.find(option => option.key === item.target.key)
        const finalPoint = item.points.find(point => point.phase === 'FINAL' || point.daysToFinal === 0)
        if (!target || !isRenderableScore(finalPoint?.score)) return null
        return {
          ...target,
          latestScore: finalPoint.score,
          available: true,
          score: finalPoint.score,
        }
      })
      .filter((cutoff): cutoff is ScoreCutoff => cutoff !== null),
  )
  const scoreSummaryGroups = computed<ScoreSummaryGroup[]>(() => {
    const groups: Array<{ key: ScoreSummaryGroup['key']; name: string }> = [
      { key: 'red', name: '红区' },
      { key: 'green', name: '绿区' },
    ]
    const sourceCutoffs = current.value?.cutoffs ?? historicalCutoffs.value
    const cutoffByKey = new Map(sourceCutoffs.map(cutoff => [cutoff.key, cutoff]))
    return groups
      .map(group => ({
        ...group,
        cutoffs: (options.value?.targets || [])
          .filter(target => target.group === group.key)
          .map(target => {
            const cutoff = cutoffByKey.get(target.key)
            const score = isRenderableScore(cutoff?.score) ? cutoff.score : null
            return {
              ...target,
              ...(cutoff
                ? {
                    rank: cutoff.rank,
                    latestScore: score,
                    available: cutoff.available && score !== null,
                  }
                : { available: false, latestScore: null }),
              score,
            }
          }),
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
  const defaultRtaShareTitle = '魔灵召唤 RTA分数预测｜趋势'
  const shareNow = ref(Date.now())

  const rtaShareTitle = computed(() => {
    shareNow.value
    if (isHistoricalSeason.value || !current.value?.seasonEndsAt) return defaultRtaShareTitle
    if (current.value.season !== null && current.value.season !== season.value) return defaultRtaShareTitle

    const seasonEndsAt = dayjs(current.value.seasonEndsAt)
    const remainingDays = seasonEndsAt.diff(dayjs(shareNow.value), 'day', true)
    if (!seasonEndsAt.isValid() || remainingDays <= 0) return defaultRtaShareTitle
    return `RTA分数预测 ｜ 赛季还剩${Math.ceil(remainingDays)}天`
  })

  const formatPhase = (point: ScoreSeasonHistoryPoint): string => {
    if (point.daysToFinal === 0 || point.phase.trim().toUpperCase() === 'FINAL') return '结算'
    if (point.daysToFinal !== null && point.daysToFinal > 0) return `剩${point.daysToFinal}天`
    const match = /^(\d+)\s*D$/i.exec(point.phase.trim())
    return match ? `剩${Number(match[1])}天` : point.phase.trim()
  }

  const phaseOrder = (point: PhaseChartPoint): number => {
    if (point.daysToFinal !== null) return point.daysToFinal
    if (point.label === '结算' || point.label.toUpperCase() === 'FINAL') return 0
    const match = /^剩(\d+)天$/.exec(point.label) || /^(\d+)D$/.exec(point.label)
    return match ? Number(match[1]) : -1
  }

  const phaseTrendOrder = (point: PhaseChartPoint): number => {
    if (point.label === '结算' || point.label.toUpperCase() === 'FINAL') return Number.MAX_SAFE_INTEGER
    const order = phaseOrder(point)
    return order > 0 ? order : Number.MAX_SAFE_INTEGER - 1
  }

  const dailyHistoryAsPhaseSeries = computed<ScoreSeasonHistory[]>(() => {
    if (isHistoricalSeason.value || !current.value?.seasonEndsAt || seasonHistorySeries.value.some(item => item.points.length)) return []
    const endOfSeason = dayjs(current.value.seasonEndsAt)
    if (!endOfSeason.isValid()) return []
    return historySeries.value
      .map((history): ScoreSeasonHistory | null => {
        const points = history.points
          .filter(point => isRenderableScore(point.score) && dayjs(point.capturedAt).isValid())
          .map(point => {
            const daysToFinal = Math.max(0, endOfSeason.startOf('day').diff(dayjs(point.capturedAt).startOf('day'), 'day'))
            return {
              phase: daysToFinal === 0 ? 'FINAL' : `${daysToFinal}D`,
              daysToFinal,
              score: point.score,
            }
          })
        if (!points.length) return null
        return {
          server: server.value,
          season: season.value,
          league: league.value,
          seasonEndsAt: current.value?.seasonEndsAt || null,
          provider: history.meta.provider,
          target: { key: history.target.key, name: history.target.name },
          seriesType: 'relative-to-final',
          points,
          dataQuality: { scopeVerified: false, eligibleForForecast: false },
        }
      })
      .filter((series): series is ScoreSeasonHistory => series !== null)
  })

  const phaseSourceSeries = computed<ScoreSeasonHistory[]>(() =>
    seasonHistorySeries.value.some(item => item.points.length) ? seasonHistorySeries.value : dailyHistoryAsPhaseSeries.value,
  )

  const phaseChartCategories = computed(() => {
    const pointsByPhase = new Map<string, PhaseChartPoint>()
    phaseSourceSeries.value.forEach(targetHistory => {
      targetHistory.points.forEach(point => {
        const label = formatPhase(point)
        if (!label || label === '--') return
        const previous = pointsByPhase.get(label)
        if (!previous || phaseOrder({ ...point, label }) > phaseOrder(previous)) pointsByPhase.set(label, { ...point, label })
      })
    })
    return [...pointsByPhase.values()].sort((left, right) => phaseTrendOrder(left) - phaseTrendOrder(right)).map(point => point.label)
  })

  const phaseChartSeries = computed<TrendSeries[]>(() =>
    phaseSourceSeries.value
      .map((item): TrendSeries | null => {
        const target = options.value?.targets.find(option => option.key === item.target.key)
        const points = item.points
          .filter(point => isRenderableScore(point.score))
          .map(point => {
            const label = formatPhase(point)
            return {
              key: `${item.target.key}-${label}`,
              label,
              score: point.score as number,
              index: phaseChartCategories.value.indexOf(label),
            }
          })
          .filter(point => point.index >= 0)
        if (!target || !points.length) return null
        return {
          key: `phase-${item.target.key}`,
          targetKey: target.key,
          label: formatTarget(target.key, target.name),
          color: getRtaTierColor(target.key),
          points,
        }
      })
      .filter((series): series is TrendSeries => series !== null),
  )

  const targetGroupOrder = (targetKey: string): number => {
    const group = options.value?.targets.find(target => target.key === targetKey)?.group
    return group === 'red' ? 0 : group === 'green' ? 1 : 2
  }

  const sortTrendSeries = (left: TrendSeries, right: TrendSeries): number =>
    targetGroupOrder(left.targetKey) - targetGroupOrder(right.targetKey)

  const orderedPhaseChartSeries = computed<TrendSeries[]>(() => [...phaseChartSeries.value].sort(sortTrendSeries))

  const phaseTableTargets = computed(() => {
    const groupOrder: Record<string, number> = { red: 0, green: 1 }
    return (options.value?.targets || [])
      .filter(target => target.group === 'red' || target.group === 'green')
      .sort((left, right) => {
        const groupDiff = groupOrder[left.group] - groupOrder[right.group]
        if (groupDiff !== 0) return groupDiff
        return (getRtaTierMeta(right.key)?.count || 0) - (getRtaTierMeta(left.key)?.count || 0)
      })
  })

  const phaseTableRows = computed<PhaseTableRow[]>(() =>
    phaseChartCategories.value.map(phase => {
      const scores: Record<string, number | null> = {}
      phaseTableTargets.value.forEach(target => {
        const targetHistory = phaseSourceSeries.value.find(item => item.target.key === target.key)
        const point = targetHistory?.points.find(item => formatPhase(item) === phase)
        scores[target.key] = isRenderableScore(point?.score) ? point.score : null
      })
      return { phase, scores }
    }),
  )

  const phaseTableWidth = computed(() => `${Math.max(760, 150 + phaseTableTargets.value.length * 150)}rpx`)

  const showTrendEstimate = ref(true)
  const hasAvailableTrendEstimate = computed(
    () =>
      !isHistoricalSeason.value &&
      historySeries.value.some(item => item.trendEstimate?.status === 'available' && item.trendEstimate.points.length > 0),
  )

  const dateChartCategories = computed(() => {
    const labels = new Map<string, number>()
    historySeries.value.forEach(item => {
      item.points
        .filter(point => isRenderableScore(point.score) && dayjs(point.capturedAt).isValid())
        .forEach(point => labels.set(dayjs(point.capturedAt).format('MM-DD'), dayjs(point.capturedAt).valueOf()))
      if (showTrendEstimate.value) {
        item.trendEstimate?.points
          .filter(point => isRenderableScore(point.score) && dayjs(point.capturedAt).isValid())
          .forEach(point => labels.set(dayjs(point.capturedAt).format('MM-DD'), dayjs(point.capturedAt).valueOf()))
      }
    })
    return [...labels.entries()].sort((left, right) => left[1] - right[1]).map(([label]) => label)
  })

  const dateChartSeries = computed<TrendSeries[]>(() =>
    historySeries.value
      .map((item): TrendSeries | null => {
        const target = options.value?.targets.find(option => option.key === item.target.key)
        if (!target) return null
        const actualPoints = item.points
          .filter(point => isRenderableScore(point.score) && dayjs(point.capturedAt).isValid())
          .map(point => {
            const label = dayjs(point.capturedAt).format('MM-DD')
            return {
              key: `${item.target.key}-${point.capturedAt}`,
              label,
              score: point.score as number,
              index: dateChartCategories.value.indexOf(label),
              estimated: false,
            }
          })
        const estimatedPoints = showTrendEstimate.value
          ? (item.trendEstimate?.points || [])
              .filter(point => isRenderableScore(point.score) && dayjs(point.capturedAt).isValid())
              .map((point: ScoreTrendEstimatePoint) => {
                const label = dayjs(point.capturedAt).format('MM-DD')
                return {
                  key: `${item.target.key}-estimate-${point.capturedAt}`,
                  label,
                  score: point.score,
                  index: dateChartCategories.value.indexOf(label),
                  estimated: true,
                }
              })
          : []
        const points = [...actualPoints, ...estimatedPoints].filter(point => point.index >= 0)
        if (!points.length) return null
        return {
          key: `date-${item.target.key}`,
          targetKey: target.key,
          label: formatTarget(target.key, target.name),
          color: getRtaTierColor(target.key),
          points,
        }
      })
      .filter((series): series is TrendSeries => series !== null),
  )

  const orderedDateChartSeries = computed<TrendSeries[]>(() => [...dateChartSeries.value].sort(sortTrendSeries))

  const trendChartMode = computed<'phase' | 'date'>(() =>
    !isHistoricalSeason.value && orderedDateChartSeries.value.length ? 'date' : orderedPhaseChartSeries.value.length ? 'phase' : 'date',
  )
  const trendChartCategories = computed(() => (trendChartMode.value === 'phase' ? phaseChartCategories.value : dateChartCategories.value))
  const trendChartSeries = computed<TrendSeries[]>(() =>
    trendChartMode.value === 'phase' ? orderedPhaseChartSeries.value : orderedDateChartSeries.value,
  )
  const trendTargetFilter = ref('')
  const trendTargetFilterOptions = computed(() =>
    trendChartSeries.value.map(series => ({
      key: series.targetKey,
      name: formatTarget(series.targetKey, series.label),
    })),
  )
  watch(trendTargetFilterOptions, nextOptions => {
    if (trendTargetFilter.value && !nextOptions.some(option => option.key === trendTargetFilter.value)) {
      trendTargetFilter.value = ''
    }
  })
  const visibleTrendChartSeries = computed<TrendSeries[]>(() => {
    if (!trendTargetFilter.value || !trendChartSeries.value.some(series => series.targetKey === trendTargetFilter.value)) {
      return trendChartSeries.value
    }
    return trendChartSeries.value.filter(series => series.targetKey === trendTargetFilter.value)
  })
  const selectTrendTarget = (key: string): void => {
    trendTargetFilter.value = key
  }

  const toggleTrendEstimate = (event: { detail?: { value?: boolean } }): void => {
    showTrendEstimate.value = event.detail?.value === true
  }

  const trendChartRange = computed(() => {
    const points = historySeries.value
      .flatMap(item => item.points)
      .filter(point => isRenderableScore(point.score) && dayjs(point.capturedAt).isValid())
      .sort((left, right) => left.capturedAt.localeCompare(right.capturedAt))
    return {
      from: points[0]?.capturedAt || null,
      to: points[points.length - 1]?.capturedAt || null,
    }
  })

  const selectSeasonOption = (option: ScoreSeasonOption) => {
    if (option.selectable) void selectSeason(option.season)
  }

  onLoad(() => {
    void initialize()
  })

  onShow(() => {
    shareNow.value = Date.now()
    reportToolVisit('compendium-swc-rta-score-forecast')
  })

  // #ifdef MP-WEIXIN
  onShareAppMessage(() => ({
    title: rtaShareTitle.value,
    path: '/subPackages/tools/compendium/swc/rta/score-forecast',
    imageUrl: SWC_RTA_SCORE_SHARE_IMAGE,
  }))

  onShareTimeline(() => ({
    title: rtaShareTitle.value,
    query: '',
    imageUrl: SWC_RTA_SCORE_SHARE_IMAGE,
  }))
  // #endif

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

  .section-generated-at {
    flex-shrink: 0;
    color: var(--theme-text-tertiary);
    font-size: 20rpx;
    line-height: 1.45;
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

  .season-filter-panel,
  .initial-loading .filter-skeleton-panel {
    margin-top: 0;
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

  .trend-section-heading {
    align-items: flex-start;
  }

  .trend-estimate-toggle {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 8rpx;
    color: var(--theme-text-secondary);
    font-size: 20rpx;
    line-height: 1.2;
  }

  .trend-estimate-toggle switch {
    transform: scale(0.72);
    transform-origin: right center;
    margin-right: -12rpx;
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

  .score-summary-groups {
    display: flex;
    flex-direction: column;
    gap: 18rpx;
  }

  .score-summary-group .cutoff-group-heading {
    margin-bottom: 10rpx;
  }

  .score-summary-list {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12rpx;
  }

  .score-summary-item {
    min-width: 0;
    min-height: 126rpx;
    padding: 14rpx 12rpx 12rpx;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
    border: 1rpx solid var(--theme-border);
    border-left-width: 6rpx;
    border-radius: 18rpx;
    background: var(--theme-surface-2);
  }

  .score-summary-item.group-green {
    border-left-color: #4aa875;
  }

  .score-summary-item.group-gold {
    border-left-color: #e0a52f;
  }

  .score-summary-item.group-red {
    border-left-color: #d45d69;
  }

  .score-summary-target {
    max-width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6rpx;
  }

  .score-summary-name,
  .score-summary-score,
  .score-summary-rank {
    display: block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .score-summary-name {
    color: var(--theme-text-secondary);
    font-size: 22rpx;
    font-weight: 700;
  }

  .score-summary-score {
    margin-top: 8rpx;
    color: var(--theme-text);
    font-size: 32rpx;
    font-weight: 800;
    line-height: 1.1;
  }

  .score-summary-rank {
    margin-top: 6rpx;
    color: var(--theme-text-tertiary);
    font-size: 18rpx;
  }

  .phase-table-scroll {
    width: 100%;
    white-space: nowrap;
  }

  .phase-table {
    overflow: hidden;
    border: 1rpx solid var(--theme-border);
    border-radius: 18rpx;
    background: var(--theme-surface-2);
  }

  .phase-table-row {
    min-height: 78rpx;
    display: flex;
    align-items: stretch;
    border-top: 1rpx solid var(--theme-border);
  }

  .phase-table-row:first-child {
    border-top: 0;
  }

  .phase-table-header {
    min-height: 106rpx;
    background: var(--theme-surface);
  }

  .phase-table-cell {
    flex: 0 0 150rpx;
    padding: 12rpx 10rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    color: var(--theme-text-secondary);
    font-size: 20rpx;
    text-align: center;
  }

  .phase-table-phase {
    flex-basis: 110rpx;
    justify-content: flex-start;
    color: var(--theme-text);
    font-weight: 800;
    text-align: left;
  }

  .phase-table-target {
    flex-direction: column;
    gap: 4rpx;
    font-size: 18rpx;
    font-weight: 700;
  }

  .phase-table-score {
    color: var(--theme-text);
    font-size: 24rpx;
    font-weight: 800;
  }

  .chart-style-legend {
    display: flex;
    align-items: center;
    gap: 24rpx;
    margin-top: 14rpx;
    color: var(--theme-text-tertiary);
    font-size: 19rpx;
  }

  .chart-style-item {
    display: inline-flex;
    align-items: center;
    gap: 8rpx;
  }

  .chart-style-line {
    display: inline-block;
    width: 26rpx;
    height: 4rpx;
    border-radius: 999rpx;
    background: var(--theme-text-tertiary);
  }

  .chart-style-line.estimated {
    height: 0;
    border-top: 4rpx dashed var(--theme-text-tertiary);
    background: transparent;
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
