<template>
  <view class="rta-character-panel">
    <view v-if="loading && !detail" class="detail-loading">
      <view class="loading-line title" />
      <view class="loading-line" />
      <view class="loading-line short" />
    </view>

    <view v-else-if="errorMessage && !detail" class="state-card">
      <StateBlock text="人物 RTA 详情加载失败" action-text="重新加载" theme="teal" @action="retry" />
      <text v-if="errorMessage !== '人物 RTA 详情加载失败'" class="state-detail">{{ errorMessage }}</text>
    </view>

    <template v-else-if="detail && hasStats">
      <RtaCacheNotice v-if="detail.meta.cacheStatus === 'stale'" />

      <view v-if="refreshError" class="refresh-error">
        <text>{{ refreshError }}</text>
      </view>

      <view class="range-card">
        <text class="section-title">当前数据范围</text>
        <view class="range-controls">
          <picker mode="selector" :range="seasonLabels" :value="seasonIndex" @change="handleSeasonChange">
            <view class="season-picker">
              <text>S{{ season }}</text>
              <uni-icons type="bottom" size="14" color="var(--theme-text-secondary)" />
            </view>
          </picker>
          <scroll-view class="chip-scroll" scroll-x enable-flex>
            <view class="chip-list">
              <view
                v-for="option in tierOptions"
                :key="option.key"
                class="filter-chip"
                :class="{ active: tier === option.key }"
                @click="selectTier(option.key)">
                <text>{{ option.name }}</text>
              </view>
            </view>
          </scroll-view>
          <scroll-view class="chip-scroll league-scroll" scroll-x enable-flex>
            <view class="chip-list">
              <view
                v-for="option in leagueOptions"
                :key="option.key"
                class="filter-chip"
                :class="{ active: league === option.key }"
                @click="selectLeague(option.key)">
                <text>{{ getLeagueLabel(option.key, option.name) }}</text>
              </view>
            </view>
          </scroll-view>
        </view>
        <text v-if="dataTimeText" class="data-time">数据时间 {{ dataTimeText }}</text>
      </view>

      <view class="stats-card">
        <text class="section-title">核心指标</text>
        <view class="stats-grid rate-grid">
          <view v-for="metric in rateMetrics" :key="metric.label" class="stat-item">
            <text class="stat-value" :class="{ positive: metric.positive }">{{ metric.value }}</text>
            <text class="stat-label">{{ metric.label }}</text>
          </view>
        </view>
      </view>

      <view class="stats-card">
        <text class="section-title">场次统计</text>
        <view class="stats-grid count-grid">
          <view v-for="metric in countMetrics" :key="metric.label" class="stat-item">
            <text class="stat-value count-value">{{ metric.value }}</text>
            <text class="stat-label">{{ metric.label }}</text>
          </view>
        </view>
        <text class="count-note">选择场次与实际出战口径不同，分别来自 pickCount 与 playedCount。</text>
      </view>
    </template>

    <view v-else class="state-card empty-card">
      <text>当前条件暂无 RTA 数据</text>
    </view>
  </view>
</template>

<script setup lang="ts">
  import { computed, toRef, watch } from 'vue'
  import dayjs from 'dayjs'
  import StateBlock from '../../components/state-block.vue'
  import { formatCount, formatRate } from '../rta-normalizers'
  import { useRtaCharacterDetail } from '../use-rta-character-detail'
  import type { RtaFilters } from '../rta-types'
  import RtaCacheNotice from './rta-cache-notice.vue'

  const props = defineProps<{
    characterId: string
    enabled: boolean
    initialSeason?: number
    initialTier?: string
    initialLeague?: string
  }>()

  const emit = defineEmits<{
    (event: 'context-change', context: RtaFilters): void
  }>()

  const state = useRtaCharacterDetail({
    characterId: toRef(props, 'characterId'),
    enabled: toRef(props, 'enabled'),
    initialSeason: toRef(props, 'initialSeason'),
    initialTier: toRef(props, 'initialTier'),
    initialLeague: toRef(props, 'initialLeague'),
  })

  const {
    config,
    detail,
    season,
    tier,
    league,
    loading,
    errorMessage,
    refreshError,
    refresh,
    selectSeason: selectSeasonRaw,
    selectTier: selectTierRaw,
    selectLeague: selectLeagueRaw,
    retry,
  } = state

  defineExpose({ refresh })

  const seasonLabels = computed(() => config.value?.seasons.map(value => `S${value}`) || [])
  const seasonIndex = computed(() => Math.max(0, (config.value?.seasons || []).indexOf(season.value)))
  const tierOptions = computed(() => config.value?.tiers || [])
  const leagueOptions = computed(() => config.value?.leagues || [])
  const hasStats = computed(() =>
    Object.values(detail.value?.stats || {}).some(value => typeof value === 'number' && Number.isFinite(value)),
  )
  const dataTimeText = computed(() => {
    const fetchedAt = detail.value?.meta.fetchedAt
    if (!fetchedAt || !dayjs(fetchedAt).isValid()) return ''
    return dayjs(fetchedAt).format('YYYY-MM-DD HH:mm')
  })

  const rateMetrics = computed(() => {
    const stats = detail.value?.stats
    return [
      { label: '选择率', value: formatRate(stats?.pickRate) },
      { label: '被 Ban 率', value: formatRate(stats?.banRate) },
      { label: '队伍胜率', value: formatRate(stats?.winRate), positive: true },
      { label: '队长选取率', value: formatRate(stats?.leaderRate) },
    ]
  })

  const countMetrics = computed(() => {
    const stats = detail.value?.stats
    return [
      { label: '选择场次', value: formatCount(stats?.pickCount) },
      { label: '实际出战', value: formatCount(stats?.playedCount) },
      { label: '被 Ban 次数', value: formatCount(stats?.banCount) },
      { label: '胜场', value: formatCount(stats?.winCount) },
    ]
  })

  const getLeagueLabel = (key: string, fallback: string): string => {
    if (key === 'rta') return 'RTA'
    if (key === 'special') return '特殊'
    return fallback
  }

  const handleSeasonChange = (event: { detail?: { value?: string | number } }) => {
    const index = Number(event.detail?.value)
    const selected = config.value?.seasons[index]
    if (selected) void selectSeason(selected)
  }

  const emitContext = () => {
    if (season.value && tier.value && league.value) emit('context-change', { season: season.value, tier: tier.value, league: league.value })
  }

  // 首次解析配置和每次用户选择后都向父级同步当前上下文。
  const selectSeasonWithContext = async (value: number) => {
    await selectSeasonRaw(value)
    emitContext()
  }
  const selectTierWithContext = async (value: string) => {
    await selectTierRaw(value)
    emitContext()
  }
  const selectLeagueWithContext = async (value: string) => {
    await selectLeagueRaw(value)
    emitContext()
  }

  // 保持模板事件处理稳定，同时让父级可以把当前上下文写入分享链接。
  const selectSeason = selectSeasonWithContext
  const selectTier = selectTierWithContext
  const selectLeague = selectLeagueWithContext

  watch([season, tier, league], emitContext, { immediate: true })
</script>

<style scoped lang="scss">
  .rta-character-panel {
    color: var(--theme-text);
  }

  .range-card,
  .stats-card,
  .detail-loading,
  .state-card,
  .refresh-error {
    margin-top: 20rpx;
    padding: 24rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 22rpx;
    background: var(--theme-surface);
    box-shadow: 0 6rpx 18rpx var(--theme-shadow-xs);
  }

  .section-title {
    color: var(--theme-text);
    font-size: 27rpx;
    font-weight: 800;
  }

  .data-time {
    display: block;
    margin-top: 16rpx;
    color: var(--theme-text-tertiary);
    font-size: 21rpx;
  }

  .range-controls {
    margin-top: 18rpx;
    display: flex;
    align-items: center;
    gap: 12rpx;
    min-width: 0;
  }

  .season-picker {
    min-width: 124rpx;
    min-height: 60rpx;
    padding: 0 16rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12rpx;
    box-sizing: border-box;
    border: 1rpx solid var(--theme-border);
    border-radius: 16rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text-secondary);
    font-size: 23rpx;
    font-weight: 700;
  }

  .chip-scroll {
    min-width: 0;
    flex: 1;
    white-space: nowrap;
  }

  .league-scroll {
    flex: 1.15;
  }

  .chip-list {
    display: inline-flex;
    align-items: center;
    gap: 10rpx;
    padding-right: 4rpx;
  }

  .filter-chip {
    min-height: 60rpx;
    padding: 0 18rpx;
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

  .stats-grid {
    margin-top: 20rpx;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14rpx;
  }

  .stat-item {
    min-width: 0;
    min-height: 132rpx;
    padding: 20rpx 12rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10rpx;
    box-sizing: border-box;
    border: 1rpx solid var(--theme-border);
    border-radius: 18rpx;
    background: var(--theme-surface-2);
    text-align: center;
  }

  .stat-value {
    max-width: 100%;
    overflow: hidden;
    color: var(--theme-text);
    font-size: 32rpx;
    font-weight: 800;
    line-height: 1.2;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .stat-value.positive {
    color: var(--theme-brand);
  }

  .count-value {
    font-size: 29rpx;
  }

  .stat-label,
  .count-note,
  .refresh-error {
    color: var(--theme-text-tertiary);
    font-size: 21rpx;
  }

  .count-note {
    display: block;
    margin-top: 18rpx;
    line-height: 1.5;
  }

  .refresh-error {
    color: var(--theme-text-secondary);
  }

  .detail-loading {
    min-height: 220rpx;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 20rpx;
  }

  .loading-line {
    width: 72%;
    height: 24rpx;
    border-radius: 12rpx;
    background: var(--theme-surface-2);
  }

  .loading-line.title {
    width: 90%;
    height: 34rpx;
  }

  .loading-line.short {
    width: 48%;
  }

  .state-card {
    min-height: 300rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 18rpx;
    box-sizing: border-box;
    color: var(--theme-text-secondary);
  }

  .state-detail {
    max-width: 560rpx;
    color: var(--theme-text-tertiary);
    font-size: 21rpx;
    line-height: 1.45;
    text-align: center;
  }

  .empty-card {
    font-size: 23rpx;
  }
</style>
