<template>
  <PageLayout
    title="RTA排行榜"
    :nav-back="true"
    back-fallback="/subPackages/tools/compendium/swc/index"
    nav-init-bg-color="var(--theme-surface)"
    nav-divider>
    <view class="rta-page">
      <view class="page-intro">
        <view class="intro-main">
          <text class="intro-title">魔灵召唤 RTA排行榜</text>
          <text class="intro-subtitle">按真实对局统计展示</text>
        </view>
        <view v-if="dataTimeText || (activeMeta?.battleCount !== null && activeMeta?.battleCount !== undefined)" class="data-time">
          <text v-if="dataTimeText">数据时间 {{ dataTimeText }}</text>
          <text v-if="activeMeta?.battleCount !== null && activeMeta?.battleCount !== undefined">
            采集场次 {{ formatCount(activeMeta.battleCount) }}
          </text>
        </view>
      </view>

      <RtaCacheNotice v-if="isStale" />

      <view v-if="config" class="filter-panel">
        <view class="filter-row season-row">
          <text class="filter-label">赛季</text>
          <picker mode="selector" :range="seasonLabels" :value="seasonIndex" @change="handleSeasonChange">
            <view class="season-picker">
              <text>赛季 {{ season }}</text>
              <uni-icons type="bottom" size="14" color="var(--theme-text-secondary)" />
            </view>
          </picker>
        </view>

        <view class="filter-row">
          <text class="filter-label">段位</text>
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
        </view>

        <view class="filter-row">
          <text class="filter-label">场次</text>
          <scroll-view class="chip-scroll" scroll-x enable-flex>
            <view class="chip-list">
              <view
                v-for="option in RTA_MIN_PICK_COUNT_OPTIONS"
                :key="option.value"
                class="filter-chip"
                :class="{ active: minPickCount === option.value }"
                @click="selectMinPickCount(option.value)">
                <text>{{ option.label }}</text>
              </view>
            </view>
          </scroll-view>
        </view>

        <view class="filter-row">
          <text class="filter-label">联赛</text>
          <scroll-view class="chip-scroll" scroll-x enable-flex>
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
      </view>

      <view v-if="config" class="sort-panel">
        <view class="section-heading">
          <text class="section-title">排行榜</text>
          <text v-if="total" class="section-meta">共 {{ formatCount(total) }} 只魔灵</text>
        </view>
        <scroll-view class="sort-scroll" scroll-x enable-flex>
          <view class="sort-list">
            <view
              v-for="option in RTA_SORT_OPTIONS"
              :key="option.key"
              class="sort-chip"
              :class="{ active: sortBy === option.key }"
              @click="selectSort(option.key)">
              <text>{{ option.label }}</text>
              <text v-if="sortBy === option.key" class="sort-direction">{{ sortOrder === 'desc' ? '↓' : '↑' }}</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <view v-if="loading && items.length === 0" class="skeleton-list">
        <view v-for="index in 4" :key="index" class="skeleton-card">
          <view class="skeleton-avatar" />
          <view class="skeleton-lines">
            <view class="skeleton-line wide" />
            <view class="skeleton-line" />
            <view class="skeleton-line short" />
          </view>
        </view>
      </view>

      <view v-else-if="errorMessage && items.length === 0" class="state-card">
        <StateBlock text="RTA 数据加载失败" action-text="重新加载" theme="teal" @action="retry" />
        <text v-if="errorMessage !== 'RTA 数据加载失败'" class="state-detail">{{ errorMessage }}</text>
      </view>

      <view v-else-if="initialized && items.length === 0" class="state-card">
        <StateBlock text="当前筛选暂无 RTA 数据" />
      </view>

      <view v-else class="ranking-list">
        <RtaMonsterCard v-for="item in items" :key="getItemKey(item)" :item="item" @select="goToDetail" @unmapped="showUnmappedNotice" />
      </view>

      <view v-if="loadMoreError && items.length" class="inline-error" @click="loadMore">
        <text>{{ loadMoreError }}，点击重试</text>
      </view>
      <view v-else-if="loadingMore" class="load-more"><text>正在加载更多...</text></view>
      <view v-else-if="items.length && !hasMore" class="load-more muted"><text>没有更多了</text></view>
    </view>
  </PageLayout>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { onLoad, onPullDownRefresh, onReachBottom, onShareAppMessage, onShareTimeline, onShow } from '@dcloudio/uni-app'
  import dayjs from 'dayjs'
  import StateBlock from '../components/state-block.vue'
  import { buildSwcRtaShare } from '../share'
  import RtaCacheNotice from './components/rta-cache-notice.vue'
  import RtaMonsterCard from './components/rta-monster-card.vue'
  import { formatCount } from './rta-normalizers'
  import {
    RTA_MIN_PICK_COUNT_OPTIONS,
    RTA_LOCALE,
    RTA_SORT_OPTIONS,
    type RtaRankingInitialQuery,
    type RtaRankingItem,
    type RtaSortBy,
    type RtaSortOrder,
  } from './rta-types'
  import { useRtaRanking } from './use-rta-ranking'
  import { reportToolVisit } from '@/utils/tracker'

  interface PickerChangeEvent {
    detail: {
      value: string | number
    }
  }

  const {
    config,
    items,
    season,
    tier,
    league,
    minPickCount,
    sortBy,
    sortOrder,
    total,
    hasMore,
    loading,
    loadingMore,
    errorMessage,
    loadMoreError,
    initialized,
    activeMeta,
    isStale,
    seasonOptions,
    tierOptions,
    leagueOptions,
    initialize,
    refresh,
    loadMore,
    selectSeason,
    selectTier,
    selectLeague,
    selectMinPickCount,
    selectSort,
    retry,
  } = useRtaRanking()

  const seasonLabels = computed(() => seasonOptions.value.map(value => `赛季 ${value}`))
  const seasonIndex = computed(() => Math.max(0, seasonOptions.value.indexOf(season.value)))
  const dataTimeText = computed(() => {
    const fetchedAt = activeMeta.value?.fetchedAt
    if (!fetchedAt || !dayjs(fetchedAt).isValid()) return ''
    return dayjs(fetchedAt).format('YYYY-MM-DD HH:mm')
  })

  const getLeagueLabel = (key: string, fallback: string): string => {
    if (key === 'rta') return 'RTA'
    if (key === 'special') return '特殊'
    return fallback
  }

  const handleSeasonChange = (event: PickerChangeEvent) => {
    const index = Number(event.detail.value)
    const selected = seasonOptions.value[index]
    if (selected) void selectSeason(selected)
  }

  const getItemKey = (item: RtaRankingItem): string => `${item.rank}:${item.character?.id || item.source.monsterId || item.source.name}`

  const goToDetail = (item: RtaRankingItem) => {
    if (!item.character) return
    if (config.value?.capabilities.monsterDetail !== true) {
      uni.showToast({ title: '人物 RTA 详情暂不可用', icon: 'none' })
      return
    }
    const query = [
      `characterId=${encodeURIComponent(item.character.id)}`,
      `name=${encodeURIComponent(item.character.family?.name || item.character.name || '')}`,
      `avatar=${encodeURIComponent(item.character.avatar || '')}`,
      `locale=${encodeURIComponent(RTA_LOCALE)}`,
      'tab=rta',
      `season=${encodeURIComponent(String(season.value))}`,
      `tier=${encodeURIComponent(tier.value)}`,
      `league=${encodeURIComponent(league.value)}`,
    ].join('&')
    uni.navigateTo({ url: `/subPackages/tools/compendium/swc/detail?${query}` })
  }

  const showUnmappedNotice = () => {
    uni.showToast({ title: '本地图鉴暂未收录该人物', icon: 'none' })
  }

  const parseShareQuery = (options: Record<string, string | undefined>): RtaRankingInitialQuery => {
    const sortKeys: RtaSortBy[] = ['pickRate', 'pickCount', 'banRate', 'winRate', 'leaderRate', 'playedCount']
    const sortBy = sortKeys.includes(options.sortBy as RtaSortBy) ? (options.sortBy as RtaSortBy) : undefined
    const sortOrder: RtaSortOrder | undefined = options.sortOrder === 'asc' || options.sortOrder === 'desc' ? options.sortOrder : undefined
    const parsedSeason = Number(options.season)
    const parsedMinPickCount = Number(options.minPickCount)
    return {
      season: Number.isFinite(parsedSeason) && parsedSeason > 0 ? Math.floor(parsedSeason) : undefined,
      tier: options.tier,
      league: options.league,
      minPickCount: Number.isInteger(parsedMinPickCount) && parsedMinPickCount >= 0 ? parsedMinPickCount : undefined,
      sortBy,
      sortOrder,
    }
  }

  const buildShareQuery = () => ({
    season: season.value || undefined,
    tier: tier.value,
    league: league.value,
    minPickCount: minPickCount.value,
    sortBy: sortBy.value,
    sortOrder: sortOrder.value,
  })

  onLoad((options: Record<string, string | undefined>) => {
    void initialize(parseShareQuery(options))
  })

  onShow(() => {
    reportToolVisit('compendium-swc-rta')
  })

  onShareAppMessage(() => buildSwcRtaShare(buildShareQuery()).app)
  onShareTimeline(() => buildSwcRtaShare(buildShareQuery()).timeline)

  onPullDownRefresh(async () => {
    try {
      await refresh()
    } finally {
      uni.stopPullDownRefresh()
    }
  })

  onReachBottom(() => {
    void loadMore()
  })
</script>

<style scoped lang="scss">
  .rta-page {
    min-height: 100vh;
    padding: 24rpx 24rpx 64rpx;
    box-sizing: border-box;
    background: var(--theme-bg);
    color: var(--theme-text);
  }

  .page-intro {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18rpx;
    margin-bottom: 20rpx;
  }

  .intro-main {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
  }

  .intro-title {
    color: var(--theme-text);
    font-size: 32rpx;
    font-weight: 800;
    line-height: 1.3;
  }

  .intro-subtitle,
  .data-time {
    color: var(--theme-text-tertiary);
    font-size: 21rpx;
    line-height: 1.4;
  }

  .data-time {
    flex-shrink: 0;
    padding-top: 6rpx;
    display: flex;
    flex-direction: column;
    gap: 4rpx;
    text-align: right;
  }

  .filter-panel,
  .sort-panel {
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

  .season-picker {
    min-width: 190rpx;
    min-height: 66rpx;
    padding: 0 18rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20rpx;
    box-sizing: border-box;
    border: 1rpx solid var(--theme-border);
    border-radius: 16rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text);
    font-size: 24rpx;
    font-weight: 700;
  }

  .chip-scroll,
  .sort-scroll {
    min-width: 0;
    flex: 1;
    white-space: nowrap;
  }

  .chip-list,
  .sort-list {
    display: inline-flex;
    align-items: center;
    gap: 12rpx;
    padding-right: 8rpx;
  }

  .filter-chip,
  .sort-chip {
    min-height: 64rpx;
    padding: 0 22rpx;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    box-sizing: border-box;
    border: 1rpx solid var(--theme-border);
    border-radius: 999rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text-secondary);
    font-size: 23rpx;
    font-weight: 650;
  }

  .filter-chip.active,
  .sort-chip.active {
    border-color: var(--theme-brand);
    background: var(--theme-brand);
    color: var(--theme-surface);
  }

  .sort-panel {
    padding-bottom: 18rpx;
  }

  .section-heading {
    margin-bottom: 18rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
  }

  .section-title {
    color: var(--theme-text);
    font-size: 27rpx;
    font-weight: 800;
  }

  .section-meta {
    color: var(--theme-text-tertiary);
    font-size: 21rpx;
  }

  .sort-scroll {
    width: 100%;
  }

  .sort-direction {
    font-size: 26rpx;
    font-weight: 800;
  }

  .ranking-list,
  .skeleton-list {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
    margin-top: 20rpx;
  }

  .skeleton-card {
    min-height: 204rpx;
    padding: 22rpx;
    display: flex;
    align-items: center;
    gap: 22rpx;
    box-sizing: border-box;
    border: 1rpx solid var(--theme-border);
    border-radius: 22rpx;
    background: var(--theme-surface);
  }

  .skeleton-avatar,
  .skeleton-line {
    border-radius: 14rpx;
    background: var(--theme-surface-2);
  }

  .skeleton-avatar {
    width: 112rpx;
    height: 112rpx;
    flex-shrink: 0;
  }

  .skeleton-lines {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 18rpx;
  }

  .skeleton-line {
    width: 68%;
    height: 22rpx;
  }

  .skeleton-line.wide {
    width: 92%;
    height: 30rpx;
  }

  .skeleton-line.short {
    width: 46%;
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
    color: var(--theme-text-secondary);
  }

  .state-detail {
    max-width: 560rpx;
    color: var(--theme-text-tertiary);
    font-size: 21rpx;
    line-height: 1.45;
    text-align: center;
  }

  .load-more,
  .inline-error {
    padding: 28rpx 12rpx 8rpx;
    color: var(--theme-text-secondary);
    font-size: 22rpx;
    text-align: center;
  }

  .load-more.muted {
    color: var(--theme-text-tertiary);
  }

  .inline-error {
    color: var(--theme-brand);
  }
</style>
