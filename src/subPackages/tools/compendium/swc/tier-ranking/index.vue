<template>
  <PageLayout
    title="AI评级榜"
    :nav-back="true"
    back-fallback="/subPackages/tools/compendium/swc/index"
    nav-init-bg-color="var(--theme-surface)"
    nav-divider>
    <view class="tier-ranking-page">
      <view class="overview-band">
        <view class="overview-copy">
          <text class="overview-kicker">SUMMONERS WAR · RTA</text>
          <text class="overview-title">AI评级榜</text>
          <text class="overview-subtitle">结合出场、跨池稳定性、队长率与样本胜率</text>
        </view>
        <view v-if="report" class="report-stamp">
          <text class="stamp-provider">{{ providerLabel(report.provider) }}</text>
          <text class="stamp-date">{{ formatReportDate(report.reportDate) }}</text>
        </view>
      </view>

      <view v-if="report" class="report-meta">
        <view class="meta-item">
          <text class="meta-label">报告</text>
          <text class="meta-value">S{{ report.season }} · {{ report.gameVersion }}</text>
        </view>
        <view class="meta-divider" />
        <view class="meta-item">
          <text class="meta-label">区域</text>
          <text class="meta-value">{{ regionLabel(report.region.key) }}</text>
        </view>
        <view class="meta-divider" />
        <view class="meta-item">
          <text class="meta-label">收录</text>
          <text class="meta-value">{{ report.items.length }} 只</text>
        </view>
      </view>

      <view v-if="config" class="filter-panel">
        <view class="picker-row">
          <view class="picker-field">
            <text class="filter-label">来源</text>
            <picker mode="selector" :range="sourceLabels" :value="sourceIndex" @change="handleSourceChange">
              <view class="picker-control">
                <text>{{ providerLabel(selectedProvider) || '暂无来源' }}</text>
                <uni-icons type="bottom" size="13" color="var(--theme-text-tertiary)" />
              </view>
            </picker>
          </view>
          <view class="picker-field">
            <text class="filter-label">区域</text>
            <picker mode="selector" :range="regionLabels" :value="regionIndex" @change="handleRegionChange">
              <view class="picker-control">
                <text>{{ regionLabel(selectedRegion) || '全部区域' }}</text>
                <uni-icons type="bottom" size="13" color="var(--theme-text-tertiary)" />
              </view>
            </picker>
          </view>
        </view>

        <view class="filter-line">
          <text class="filter-label">属性</text>
          <scroll-view class="chip-scroll" scroll-x enable-flex>
            <view class="chip-list">
              <view
                v-for="option in elementOptions"
                :key="option.key"
                class="filter-chip"
                :class="{ active: selectedElement === option.key }"
                @tap="selectElement(option.key)">
                <text>{{ option.name }}</text>
              </view>
            </view>
          </scroll-view>
        </view>

        <view class="filter-line">
          <text class="filter-label">评级</text>
          <scroll-view class="chip-scroll" scroll-x enable-flex>
            <view class="chip-list">
              <view
                v-for="option in tierOptions"
                :key="option.key"
                class="filter-chip tier-chip"
                :class="[`chip-${option.key.toLowerCase()}`, { active: selectedTier === option.key }]"
                @tap="selectTier(option.key)">
                <text>{{ option.name }}</text>
              </view>
            </view>
          </scroll-view>
        </view>

        <view class="search-field">
          <uni-icons type="search" size="18" color="var(--theme-text-tertiary)" />
          <input
            v-model="keyword"
            class="search-input"
            type="text"
            confirm-type="search"
            placeholder="搜索魔灵名称或编码"
            placeholder-class="search-placeholder" />
          <button v-if="keyword" class="clear-button" size="mini" @tap="clearKeyword">×</button>
        </view>
      </view>

      <view v-if="loading && !report" class="skeleton-list">
        <view v-for="index in 6" :key="index" class="skeleton-card">
          <view class="skeleton-rank" />
          <view class="skeleton-avatar" />
          <view class="skeleton-copy">
            <view class="skeleton-line wide" />
            <view class="skeleton-line" />
          </view>
          <view class="skeleton-tier" />
        </view>
      </view>

      <view v-else-if="errorMessage && !report" class="state-card">
        <StateBlock text="AI评级榜加载失败" action-text="重新加载" theme="teal" @action="retry" />
        <text v-if="errorMessage !== 'AI评级榜加载失败'" class="state-detail">{{ errorMessage }}</text>
      </view>

      <view v-else-if="initialized && !visibleItems.length" class="state-card">
        <StateBlock text="当前筛选暂无评级数据" />
        <text class="state-detail">试试切换区域、属性或评级档位</text>
      </view>

      <view v-else class="ranking-content">
        <view class="ranking-heading">
          <view>
            <text class="ranking-title">评级明细</text>
            <text class="ranking-subtitle">{{ visibleItems.length }} 只魔灵 · 点击查看图鉴</text>
          </view>
          <text v-if="loading" class="refreshing-label">更新中</text>
        </view>

        <view class="tier-groups">
          <view v-for="group in visibleGroups" :key="group.key" class="tier-group">
            <view class="group-heading">
              <view class="group-title-wrap">
                <text class="group-marker" :class="`marker-${group.key.toLowerCase()}`" />
                <text class="group-title">{{ group.name }}</text>
                <text class="group-count">{{ group.items.length }}</text>
              </view>
              <text class="group-caption">综合评级</text>
            </view>
            <view class="group-list">
              <TierRankingCard v-for="item in group.items" :key="item.id" :item="item" @select="goToDetail" />
            </view>
          </view>
        </view>
      </view>
    </view>
  </PageLayout>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { onLoad, onPullDownRefresh, onShareAppMessage, onShareTimeline, onShow } from '@dcloudio/uni-app'
  import StateBlock from '../components/state-block.vue'
  import { buildSwcTierRankingShare } from '../share'
  import TierRankingCard from './components/tier-ranking-card.vue'
  import { fetchTierRankingConfig, fetchTierRankingReport } from './api'
  import { formatReportDate, getTierRankingErrorMessage } from './normalizers'
  import {
    TIER_RANKING_LOCALE,
    type TierRankingConfig,
    type TierRankingItem,
    type TierRankingOption,
    type TierRankingReport,
    type TierRankingShareQuery,
  } from './types'
  import { reportToolVisit } from '@/utils/tracker'

  interface PickerChangeEvent {
    detail: {
      value: string | number
    }
  }

  interface TierRankingGroup {
    key: string
    name: string
    items: TierRankingItem[]
  }

  const ALL_VALUE = 'all'
  const REGION_LABELS: Record<string, string> = {
    c1: '金区',
    red: '红区',
    g3: '三红',
    gold: '金区',
    tripleRed: '三红',
  }
  const ELEMENT_LABELS: Record<string, string> = {
    fire: '火',
    water: '水',
    wind: '风',
    light: '光',
    dark: '暗',
  }

  const config = ref<TierRankingConfig | null>(null)
  const report = ref<TierRankingReport | null>(null)
  const selectedProvider = ref('')
  const selectedRegion = ref('')
  const selectedElement = ref(ALL_VALUE)
  const selectedTier = ref(ALL_VALUE)
  const keyword = ref('')
  const loading = ref(false)
  const initialized = ref(false)
  const errorMessage = ref('')
  const shareOptions = ref<TierRankingShareQuery>({})
  let requestVersion = 0

  const providerLabel = (provider: string): string => {
    if (provider === 'rta-ai') return '本项目 AI'
    if (provider === 'swrt') return 'SWRT'
    return provider
  }

  const regionLabel = (region: string): string => REGION_LABELS[region] || region

  const sourceOptions = computed(() => config.value?.providers || [])
  const sourceLabels = computed(() => sourceOptions.value.map(providerLabel))
  const regionOptions = computed(() => config.value?.regions || [])
  const regionLabels = computed(() => regionOptions.value.map(regionLabel))
  const elementOptions = computed<TierRankingOption[]>(() => [
    { key: ALL_VALUE, name: '全部' },
    ...(config.value?.elements || []).map(option => ({
      ...option,
      name: ELEMENT_LABELS[option.key] || option.name,
    })),
  ])
  const tierOptions = computed<TierRankingOption[]>(() => [{ key: ALL_VALUE, name: '全部' }, ...(config.value?.tiers || [])])
  const sourceIndex = computed(() => Math.max(0, sourceOptions.value.indexOf(selectedProvider.value)))
  const regionIndex = computed(() => Math.max(0, regionOptions.value.indexOf(selectedRegion.value)))

  const visibleItems = computed(() => {
    const normalizedKeyword = keyword.value.trim().toLowerCase()
    return (report.value?.items || []).filter(item => {
      if (selectedTier.value !== ALL_VALUE && item.tier.key !== selectedTier.value) return false
      if (!normalizedKeyword) return true
      const name = item.character?.name || item.source.name
      const code = item.character?.code || item.source.externalKey
      return `${name} ${code}`.toLowerCase().includes(normalizedKeyword)
    })
  })

  const visibleGroups = computed<TierRankingGroup[]>(() => {
    const itemMap = new Map<string, TierRankingItem[]>()
    visibleItems.value.forEach(item => {
      const current = itemMap.get(item.tier.key) || []
      current.push(item)
      itemMap.set(item.tier.key, current)
    })
    const configured = (config.value?.tiers || []).slice().sort((left, right) => (right.sortOrder || 0) - (left.sortOrder || 0))
    const seen = new Set<string>()
    const groups: TierRankingGroup[] = []
    configured.forEach(option => {
      const items = itemMap.get(option.key)
      if (!items?.length) return
      seen.add(option.key)
      groups.push({ key: option.key, name: option.name || option.key, items })
    })
    itemMap.forEach((items, key) => {
      if (seen.has(key)) return
      groups.push({ key, name: items[0]?.tier.name || key, items })
    })
    return groups
  })

  const applyShareOptions = (options: TierRankingShareQuery, nextConfig: TierRankingConfig, initialReport: TierRankingReport) => {
    const preferredProvider = nextConfig.providers.includes('rta-ai')
      ? 'rta-ai'
      : nextConfig.provider || nextConfig.providers[0] || initialReport.provider
    selectedProvider.value = options.provider && nextConfig.providers.includes(options.provider) ? options.provider : preferredProvider
    selectedRegion.value =
      options.region && nextConfig.regions.includes(options.region)
        ? options.region
        : nextConfig.regions.includes(initialReport.region.key)
          ? initialReport.region.key
          : nextConfig.regions[0] || initialReport.region.key
    selectedElement.value =
      options.element && nextConfig.elements.some(option => option.key === options.element) ? options.element : ALL_VALUE
    selectedTier.value = options.tier && nextConfig.tiers.some(option => option.key === options.tier) ? options.tier : ALL_VALUE
    keyword.value = options.keyword || ''
  }

  const buildQuery = () => ({
    provider: selectedProvider.value || undefined,
    region: selectedRegion.value || undefined,
    elements: selectedElement.value !== ALL_VALUE ? selectedElement.value : undefined,
    locale: TIER_RANKING_LOCALE,
  })

  const loadInitial = async () => {
    const version = ++requestVersion
    loading.value = true
    errorMessage.value = ''
    try {
      const [nextConfig, initialReport] = await Promise.all([fetchTierRankingConfig(), fetchTierRankingReport()])
      if (version !== requestVersion) return
      config.value = nextConfig
      applyShareOptions(shareOptions.value, nextConfig, initialReport)
      let nextReport = initialReport
      if (
        nextReport.provider !== selectedProvider.value ||
        nextReport.region.key !== selectedRegion.value ||
        selectedElement.value !== ALL_VALUE
      ) {
        nextReport = await fetchTierRankingReport(buildQuery())
      }
      if (version !== requestVersion) return
      report.value = nextReport
      initialized.value = true
    } catch (error) {
      if (version === requestVersion) errorMessage.value = getTierRankingErrorMessage(error, 'AI评级榜加载失败')
    } finally {
      if (version === requestVersion) loading.value = false
    }
  }

  const loadReport = async () => {
    const version = ++requestVersion
    loading.value = true
    errorMessage.value = ''
    report.value = null
    try {
      const nextReport = await fetchTierRankingReport(buildQuery())
      if (version !== requestVersion) return
      report.value = nextReport
      initialized.value = true
    } catch (error) {
      if (version === requestVersion) errorMessage.value = getTierRankingErrorMessage(error, 'AI评级榜加载失败')
    } finally {
      if (version === requestVersion) loading.value = false
    }
  }

  const refresh = async () => {
    const previousReport = report.value
    const version = ++requestVersion
    loading.value = true
    errorMessage.value = ''
    try {
      const nextConfig = await fetchTierRankingConfig()
      if (version !== requestVersion) return
      config.value = nextConfig
      if (!nextConfig.providers.includes(selectedProvider.value)) {
        selectedProvider.value = nextConfig.provider || nextConfig.providers[0] || ''
      }
      if (!nextConfig.regions.includes(selectedRegion.value)) selectedRegion.value = nextConfig.regions[0] || ''
      const nextReport = await fetchTierRankingReport(buildQuery())
      if (version !== requestVersion) return
      report.value = nextReport
    } catch (error) {
      if (version !== requestVersion) return
      report.value = previousReport
      errorMessage.value = getTierRankingErrorMessage(error, 'AI评级榜刷新失败')
    } finally {
      if (version === requestVersion) loading.value = false
    }
  }

  const handleSourceChange = (event: PickerChangeEvent) => {
    const next = sourceOptions.value[Number(event.detail.value)]
    if (!next || next === selectedProvider.value) return
    selectedProvider.value = next
    void loadReport()
  }

  const handleRegionChange = (event: PickerChangeEvent) => {
    const next = regionOptions.value[Number(event.detail.value)]
    if (!next || next === selectedRegion.value) return
    selectedRegion.value = next
    void loadReport()
  }

  const selectElement = (value: string) => {
    if (value === selectedElement.value) return
    selectedElement.value = value
    void loadReport()
  }

  const selectTier = (value: string) => {
    selectedTier.value = value
  }

  const clearKeyword = () => {
    keyword.value = ''
  }

  const retry = async () => {
    if (!config.value) await loadInitial()
    else await loadReport()
  }

  const goToDetail = (item: TierRankingItem) => {
    if (!item.character?.id) return
    const query = [
      `characterId=${encodeURIComponent(item.character.id)}`,
      `name=${encodeURIComponent(item.character.name)}`,
      `avatar=${encodeURIComponent(item.character.avatar)}`,
      `locale=${encodeURIComponent(TIER_RANKING_LOCALE)}`,
      'tab=stats',
    ].join('&')
    uni.navigateTo({ url: `/subPackages/tools/compendium/swc/detail?${query}` })
  }

  const buildShareQuery = (): TierRankingShareQuery => ({
    provider: selectedProvider.value || undefined,
    region: selectedRegion.value || undefined,
    element: selectedElement.value !== ALL_VALUE ? selectedElement.value : undefined,
    tier: selectedTier.value !== ALL_VALUE ? selectedTier.value : undefined,
    keyword: keyword.value.trim() || undefined,
  })

  onLoad((options: Record<string, string | undefined>) => {
    shareOptions.value = {
      provider: options.provider,
      region: options.region,
      element: options.element,
      tier: options.tier,
      keyword: options.keyword,
    }
    void loadInitial()
  })

  onShow(() => {
    reportToolVisit('compendium-swc-tier-ranking')
  })

  onShareAppMessage(() => buildSwcTierRankingShare(buildShareQuery()).app)
  onShareTimeline(() => buildSwcTierRankingShare(buildShareQuery()).timeline)

  onPullDownRefresh(async () => {
    try {
      await refresh()
    } finally {
      uni.stopPullDownRefresh()
    }
  })
</script>

<style scoped lang="scss">
  .tier-ranking-page {
    min-height: 100vh;
    box-sizing: border-box;
    padding: 28rpx 24rpx 72rpx;
    background: var(--theme-bg);
    color: var(--theme-text);
  }

  .overview-band {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 18rpx;
    padding: 8rpx 2rpx 26rpx;
    border-bottom: 1rpx solid var(--theme-border);
  }

  .overview-copy {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 7rpx;
  }

  .overview-kicker {
    color: var(--theme-brand);
    font-size: 17rpx;
    font-weight: 800;
    letter-spacing: 1rpx;
    line-height: 1.2;
  }

  .overview-title {
    color: var(--theme-text);
    font-size: 42rpx;
    font-weight: 900;
    line-height: 1.1;
  }

  .overview-subtitle {
    color: var(--theme-text-secondary);
    font-size: 22rpx;
    line-height: 1.4;
  }

  .report-stamp {
    flex: none;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6rpx;
    padding-bottom: 3rpx;
  }

  .stamp-provider {
    color: var(--theme-brand);
    font-size: 21rpx;
    font-weight: 750;
  }

  .stamp-date {
    color: var(--theme-text-tertiary);
    font-size: 19rpx;
  }

  .report-meta {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    align-items: center;
    margin-top: 18rpx;
    padding: 14rpx 4rpx;
    border-bottom: 1rpx solid var(--theme-border);
  }

  .meta-item {
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5rpx;
  }

  .meta-label {
    color: var(--theme-text-tertiary);
    font-size: 18rpx;
  }

  .meta-value {
    max-width: 100%;
    overflow: hidden;
    color: var(--theme-text);
    font-size: 22rpx;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .meta-divider {
    display: none;
  }

  .filter-panel {
    margin-top: 20rpx;
    padding: 20rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 16rpx;
    background: var(--theme-surface);
    box-shadow: 0 6rpx 18rpx var(--theme-shadow-xs);
  }

  .picker-row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14rpx;
  }

  .picker-field {
    min-width: 0;
  }

  .filter-label {
    display: block;
    margin-bottom: 8rpx;
    color: var(--theme-text-tertiary);
    font-size: 19rpx;
    line-height: 1.2;
  }

  .picker-control {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8rpx;
    min-width: 0;
    padding: 16rpx 14rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 10rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text);
    font-size: 23rpx;
  }

  .picker-control text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .filter-line {
    display: flex;
    align-items: center;
    gap: 14rpx;
    margin-top: 18rpx;
  }

  .filter-line .filter-label {
    width: 42rpx;
    flex: none;
    margin: 0;
  }

  .chip-scroll {
    min-width: 0;
    flex: 1;
    white-space: nowrap;
  }

  .chip-list {
    display: inline-flex;
    gap: 10rpx;
  }

  .filter-chip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 68rpx;
    padding: 10rpx 16rpx;
    box-sizing: border-box;
    border: 1rpx solid var(--theme-border);
    border-radius: 999rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text-secondary);
    font-size: 21rpx;
    line-height: 1.2;
  }

  .filter-chip.active {
    border-color: var(--theme-brand);
    background: var(--theme-brand);
    color: #fff;
    font-weight: 700;
  }

  .tier-chip:not(.active) {
    color: var(--tier-color, var(--theme-text-secondary));
  }

  .chip-sss {
    --tier-color: #b45309;
  }

  .chip-ss {
    --tier-color: #c2410c;
  }

  .chip-s {
    --tier-color: #7c3aed;
  }

  .chip-a {
    --tier-color: #2563eb;
  }

  .chip-b {
    --tier-color: #0f766e;
  }

  .chip-c,
  .chip-other {
    --tier-color: #64748b;
  }

  .search-field {
    display: flex;
    align-items: center;
    gap: 10rpx;
    margin-top: 20rpx;
    padding: 0 12rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 10rpx;
    background: var(--theme-surface-2);
  }

  .search-input {
    flex: 1;
    min-width: 0;
    height: 74rpx;
    color: var(--theme-text);
    font-size: 23rpx;
  }

  .search-placeholder {
    color: var(--theme-text-tertiary);
  }

  .clear-button {
    width: 42rpx;
    height: 42rpx;
    margin: 0;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: var(--theme-border);
    color: var(--theme-text-secondary);
    font-size: 30rpx;
    line-height: 40rpx;
  }

  .ranking-content {
    margin-top: 26rpx;
  }

  .ranking-heading {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16rpx;
    margin-bottom: 14rpx;
  }

  .ranking-heading > view {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 5rpx;
  }

  .ranking-title {
    color: var(--theme-text);
    font-size: 30rpx;
    font-weight: 800;
  }

  .ranking-subtitle,
  .refreshing-label {
    color: var(--theme-text-tertiary);
    font-size: 19rpx;
  }

  .refreshing-label {
    color: var(--theme-brand);
  }

  .tier-groups {
    display: grid;
    gap: 24rpx;
  }

  .tier-group {
    min-width: 0;
  }

  .group-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12rpx;
    padding: 0 4rpx 10rpx;
  }

  .group-title-wrap {
    display: flex;
    align-items: center;
    min-width: 0;
    gap: 9rpx;
  }

  .group-marker {
    width: 8rpx;
    height: 28rpx;
    border-radius: 5rpx;
    background: var(--tier-color, var(--theme-brand));
  }

  .marker-sss {
    --tier-color: #b45309;
  }

  .marker-ss {
    --tier-color: #c2410c;
  }

  .marker-s {
    --tier-color: #7c3aed;
  }

  .marker-a {
    --tier-color: #2563eb;
  }

  .marker-b {
    --tier-color: #0f766e;
  }

  .marker-c,
  .marker-other {
    --tier-color: #64748b;
  }

  .group-title {
    color: var(--theme-text);
    font-size: 26rpx;
    font-weight: 800;
  }

  .group-count {
    min-width: 34rpx;
    padding: 4rpx 8rpx;
    border-radius: 999rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text-tertiary);
    font-size: 17rpx;
    text-align: center;
  }

  .group-caption {
    color: var(--theme-text-tertiary);
    font-size: 18rpx;
  }

  .group-list {
    display: grid;
    gap: 10rpx;
  }

  .state-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300rpx;
    margin-top: 24rpx;
    padding: 28rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 16rpx;
    background: var(--theme-surface);
  }

  .state-detail {
    max-width: 100%;
    margin-top: 16rpx;
    color: var(--theme-text-tertiary);
    font-size: 20rpx;
    line-height: 1.4;
    text-align: center;
  }

  .skeleton-list {
    display: grid;
    gap: 10rpx;
    margin-top: 24rpx;
  }

  .skeleton-card {
    display: grid;
    grid-template-columns: 42rpx 92rpx minmax(0, 1fr) 72rpx;
    align-items: center;
    gap: 14rpx;
    min-height: 132rpx;
    padding: 18rpx 16rpx;
    border-radius: 16rpx;
    background: var(--theme-surface);
  }

  .skeleton-rank,
  .skeleton-avatar,
  .skeleton-tier,
  .skeleton-line {
    background: var(--theme-surface-2);
  }

  .skeleton-rank {
    width: 32rpx;
    height: 24rpx;
    border-radius: 6rpx;
  }

  .skeleton-avatar {
    width: 92rpx;
    height: 92rpx;
    border-radius: 14rpx;
  }

  .skeleton-copy {
    display: grid;
    gap: 14rpx;
  }

  .skeleton-line {
    width: 55%;
    height: 20rpx;
    border-radius: 6rpx;
  }

  .skeleton-line.wide {
    width: 82%;
  }

  .skeleton-tier {
    width: 72rpx;
    height: 62rpx;
    border-radius: 12rpx;
  }

  @media screen and (min-width: 700px) {
    .tier-ranking-page {
      max-width: 1120rpx;
      margin: 0 auto;
    }

    .tier-groups {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      align-items: start;
    }
  }
</style>
