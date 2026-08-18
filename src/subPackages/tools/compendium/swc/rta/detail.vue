<template>
  <PageLayout
    :title="pageTitle"
    :nav-back="true"
    back-fallback="/subPackages/tools/compendium/swc/rta/index"
    nav-init-bg-color="var(--theme-surface)"
    nav-divider>
    <view class="detail-page">
      <view v-if="loading && !detail" class="detail-loading">
        <view class="loading-avatar" />
        <view class="loading-copy">
          <view class="loading-line title" />
          <view class="loading-line" />
        </view>
      </view>

      <view v-else-if="errorMessage && !detail" class="state-card">
        <StateBlock
          :text="invalidQuery ? '缺少有效的人物 RTA 参数' : '人物 RTA 详情加载失败'"
          :action-text="invalidQuery ? '返回' : '重新加载'"
          theme="teal"
          @action="invalidQuery ? goBack() : loadDetail()" />
        <text v-if="!invalidQuery && errorMessage !== '人物 RTA 详情加载失败'" class="state-detail">{{ errorMessage }}</text>
      </view>

      <template v-else-if="detail">
        <view class="hero-card">
          <view class="hero-avatar">
            <SwcAvatarFrame :src="detail.character.avatar" :name="detail.character.name" :size="160" shape="square" />
          </view>
          <view class="hero-copy">
            <text class="character-name">{{ detail.character.name }}</text>
            <view class="character-meta">
              <SwcElementBadge
                v-if="detail.character.element"
                :element-key="detail.character.element.key"
                :label="detail.character.element.name"
                :size="28"
                :font-size="24" />
              <SwcStarBadge v-if="detail.character.stars" :count="detail.character.stars" :size="22" />
            </view>
            <text v-if="dataTimeText" class="data-time">数据时间 {{ dataTimeText }}</text>
          </view>
        </view>

        <RtaCacheNotice v-if="detail.meta.cacheStatus === 'stale'" class="cache-notice-block" />

        <view v-if="refreshError" class="refresh-error">
          <text>{{ refreshError }}</text>
        </view>

        <view class="range-card">
          <text class="section-title">当前数据范围</text>
          <view class="range-tags">
            <text class="range-tag">S{{ detail.filters.season }}</text>
            <text class="range-tag">{{ tierLabel }}</text>
            <text class="range-tag">{{ leagueLabel }}</text>
          </view>
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
    </view>
  </PageLayout>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { onLoad, onPullDownRefresh, onShow } from '@dcloudio/uni-app'
  import dayjs from 'dayjs'
  import StateBlock from '../components/state-block.vue'
  import SwcAvatarFrame from '../components/swc-avatar-frame.vue'
  import SwcElementBadge from '../components/swc-element-badge.vue'
  import SwcStarBadge from '../components/swc-star-badge.vue'
  import RtaCacheNotice from './components/rta-cache-notice.vue'
  import { fetchRtaConfig, fetchRtaMonsterDetail } from './rta-api'
  import { formatCount, formatRate, getRtaErrorMessage } from './rta-normalizers'
  import type { RtaConfig, RtaMonsterDetail, RtaMonsterDetailQuery } from './rta-types'
  import { reportToolVisit } from '@/utils/tracker'
  import { safeBack } from '@/utils/navigation'

  interface MetricView {
    label: string
    value: string
    positive?: boolean
  }

  const detail = ref<RtaMonsterDetail | null>(null)
  const config = ref<RtaConfig | null>(null)
  const query = ref<RtaMonsterDetailQuery | null>(null)
  const loading = ref(false)
  const errorMessage = ref('')
  const refreshError = ref('')
  const invalidQuery = ref(false)
  let requestVersion = 0

  const pageTitle = computed(() => (detail.value ? `${detail.value.character.name} · RTA` : '人物 RTA 详情'))
  const dataTimeText = computed(() => {
    const fetchedAt = detail.value?.meta.fetchedAt
    if (!fetchedAt || !dayjs(fetchedAt).isValid()) return ''
    return dayjs(fetchedAt).format('YYYY-MM-DD HH:mm')
  })
  const tierLabel = computed(() => {
    const key = detail.value?.filters.tier || ''
    return config.value?.tiers.find(option => option.key === key)?.name || key || '--'
  })
  const leagueLabel = computed(() => {
    const key = detail.value?.filters.league || ''
    const configured = config.value?.leagues.find(option => option.key === key)?.name
    if (key === 'rta') return '普通 RTA'
    if (key === 'special') return 'Special League'
    return configured || key || '--'
  })
  const rateMetrics = computed<MetricView[]>(() => {
    const stats = detail.value?.stats
    return [
      { label: '选择率', value: formatRate(stats?.pickRate) },
      { label: '被 Ban 率', value: formatRate(stats?.banRate) },
      { label: '队伍胜率', value: formatRate(stats?.winRate), positive: true },
      { label: '队长选取率', value: formatRate(stats?.leaderRate) },
    ]
  })
  const countMetrics = computed<MetricView[]>(() => {
    const stats = detail.value?.stats
    return [
      { label: '选择场次', value: formatCount(stats?.pickCount) },
      { label: '实际出战', value: formatCount(stats?.playedCount) },
      { label: '被 Ban 次数', value: formatCount(stats?.banCount) },
      { label: '胜场', value: formatCount(stats?.winCount) },
    ]
  })

  const parseQuery = (options: Record<string, string | undefined>): RtaMonsterDetailQuery | null => {
    const characterId = options.characterId || ''
    const season = Number(options.season)
    const tier = options.tier || ''
    const league = options.league || ''
    if (!characterId || !Number.isFinite(season) || season <= 0 || !tier || !league) return null
    return { characterId, season: Math.floor(season), tier, league }
  }

  const loadDetail = async (): Promise<void> => {
    if (!query.value) {
      invalidQuery.value = true
      errorMessage.value = '缺少有效的人物 RTA 参数'
      return
    }
    const version = ++requestVersion
    const hadDetail = Boolean(detail.value)
    loading.value = true
    errorMessage.value = ''
    refreshError.value = ''
    try {
      const [nextConfig, nextDetail] = await Promise.all([fetchRtaConfig(), fetchRtaMonsterDetail(query.value)])
      if (version !== requestVersion) return
      config.value = nextConfig
      detail.value = nextDetail
      uni.setNavigationBarTitle({ title: `${nextDetail.character.name} · RTA` })
    } catch (error) {
      if (version !== requestVersion) return
      const message = getRtaErrorMessage(error, '人物 RTA 详情加载失败')
      if (hadDetail) refreshError.value = message
      else errorMessage.value = message
    } finally {
      if (version === requestVersion) loading.value = false
    }
  }

  const goBack = () => {
    safeBack({ fallbackUrl: '/subPackages/tools/compendium/swc/rta/index' })
  }

  onLoad((options: Record<string, string | undefined>) => {
    query.value = parseQuery(options)
    invalidQuery.value = !query.value
    void loadDetail()
  })

  onShow(() => {
    reportToolVisit('compendium-swc-rta')
  })

  onPullDownRefresh(async () => {
    try {
      await loadDetail()
    } finally {
      uni.stopPullDownRefresh()
    }
  })
</script>

<style scoped lang="scss">
  .detail-page {
    min-height: 100vh;
    padding: 24rpx 24rpx 64rpx;
    box-sizing: border-box;
    background: var(--theme-bg);
    color: var(--theme-text);
  }

  .hero-card,
  .range-card,
  .stats-card,
  .detail-loading,
  .state-card {
    border: 1rpx solid var(--theme-border);
    border-radius: 22rpx;
    background: var(--theme-surface);
    box-shadow: 0 6rpx 18rpx var(--theme-shadow-xs);
  }

  .hero-card {
    padding: 26rpx;
    display: flex;
    align-items: center;
    gap: 24rpx;
  }

  .hero-avatar {
    width: 160rpx;
    height: 160rpx;
    flex-shrink: 0;
    overflow: hidden;
    border: 1rpx solid var(--theme-border);
    border-radius: 24rpx;
  }

  .hero-copy {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 14rpx;
  }

  .character-name {
    max-width: 100%;
    overflow: hidden;
    color: var(--theme-text);
    font-size: 36rpx;
    font-weight: 800;
    line-height: 1.3;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .character-meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 16rpx;
    color: var(--theme-text-secondary);
  }

  .data-time {
    color: var(--theme-text-tertiary);
    font-size: 21rpx;
  }

  .cache-notice-block,
  .range-card,
  .stats-card,
  .refresh-error {
    margin-top: 20rpx;
  }

  .range-card,
  .stats-card {
    padding: 24rpx;
  }

  .section-title {
    color: var(--theme-text);
    font-size: 27rpx;
    font-weight: 800;
  }

  .range-tags {
    margin-top: 18rpx;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12rpx;
  }

  .range-tag {
    padding: 12rpx 20rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 999rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text-secondary);
    font-size: 23rpx;
    font-weight: 650;
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

  .stat-label {
    color: var(--theme-text-tertiary);
    font-size: 22rpx;
  }

  .count-note {
    display: block;
    margin-top: 18rpx;
    color: var(--theme-text-tertiary);
    font-size: 21rpx;
    line-height: 1.5;
  }

  .refresh-error {
    padding: 16rpx 20rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 16rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text-secondary);
    font-size: 22rpx;
  }

  .detail-loading {
    min-height: 220rpx;
    padding: 28rpx;
    display: flex;
    align-items: center;
    gap: 24rpx;
  }

  .loading-avatar,
  .loading-line {
    background: var(--theme-surface-2);
  }

  .loading-avatar {
    width: 160rpx;
    height: 160rpx;
    flex-shrink: 0;
    border-radius: 24rpx;
  }

  .loading-copy {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 22rpx;
  }

  .loading-line {
    width: 66%;
    height: 24rpx;
    border-radius: 12rpx;
  }

  .loading-line.title {
    width: 86%;
    height: 34rpx;
  }

  .state-card {
    min-height: 360rpx;
    padding: 48rpx 24rpx;
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
</style>
