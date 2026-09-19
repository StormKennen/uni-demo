<template>
  <PageLayout
    title="魔灵强度榜"
    :nav-back="true"
    back-fallback="/subPackages/tools/compendium/swc/index"
    nav-init-bg-color="var(--theme-surface)"
    nav-divider>
    <view class="tier-ranking-page" :class="{ 'is-poster-mode': isPosterMode }">
      <!-- <view class="overview-band">
        <view class="overview-copy">
          <text class="overview-kicker">SUMMONERS WAR · RTA</text>
          <text class="overview-title">魔灵强度榜</text>
          <text class="overview-subtitle">结合出场、跨池稳定性、队长率与样本胜率</text>
        </view>
        <view v-if="report?.available" class="report-stamp">
          <text class="stamp-provider">{{ providerLabel(report.provider) }}</text>
          <text class="stamp-date">{{ formatReportDate(report.reportDate) }}</text>
        </view>
      </view> -->

      <!-- <view v-if="report?.available" class="report-meta">
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
          <text class="meta-value">{{ report.items.length }}</text>
        </view>
      </view> -->

      <view v-if="config && !isPosterMode" class="filter-panel">
        <view class="filter-summary-row" @tap="toggleFilterExpanded">
          <view class="filter-summary-copy">
            <text class="filter-summary-label">筛选</text>
            <text class="filter-summary-value">{{ filterSummary }}</text>
          </view>
          <uni-icons :type="filterExpanded ? 'top' : 'bottom'" size="16" color="var(--theme-text-tertiary)" />
        </view>

        <view v-if="filterExpanded" class="filter-details">
          <view class="filter-line region-filter-line">
            <text class="filter-label">区域</text>
            <picker mode="selector" :range="regionLabels" :value="regionIndex" @change="handleRegionChange">
              <view class="picker-control">
                <text>{{ regionLabel(selectedRegion) || '全部区域' }}</text>
                <uni-icons type="bottom" size="13" color="var(--theme-text-tertiary)" />
              </view>
            </picker>
          </view>

          <view class="filter-line">
            <text class="filter-label">属性</text>
            <scroll-view class="chip-scroll" scroll-x enable-flex>
              <view class="chip-list">
                <view
                  v-for="option in elementOptions"
                  :key="option.key"
                  class="filter-chip"
                  :class="{ active: option.key === ALL_VALUE ? !selectedElements.length : selectedElements.includes(option.key) }"
                  @tap="selectElement(option.key)">
                  <SwcElementBadge
                    v-if="option.key !== ALL_VALUE"
                    :element-key="option.key"
                    :label="option.name"
                    :size="24"
                    :font-size="20"
                    :gap="4" />
                  <text v-else>全部</text>
                </view>
              </view>
            </scroll-view>
          </view>

          <view class="filter-line">
            <text class="filter-label">星级</text>
            <scroll-view class="chip-scroll" scroll-x enable-flex>
              <view class="chip-list">
                <view
                  v-for="option in starOptions"
                  :key="option.key"
                  class="filter-chip"
                  :class="{ active: option.key === ALL_VALUE ? !selectedStars.length : selectedStars.includes(option.key) }"
                  @tap="selectStar(option.key)">
                  <text>{{ option.key === ALL_VALUE ? '全部' : `${option.name}★` }}</text>
                </view>
              </view>
            </scroll-view>
          </view>

          <view class="filter-line">
            <text class="filter-label">类型</text>
            <scroll-view class="chip-scroll" scroll-x enable-flex>
              <view class="chip-list">
                <view
                  v-for="option in archetypeOptions"
                  :key="option.key"
                  class="filter-chip"
                  :class="{ active: option.key === ALL_VALUE ? !selectedArchetypes.length : selectedArchetypes.includes(option.key) }"
                  @tap="selectArchetype(option.key)">
                  <SwcSquareIcon v-if="option.key !== ALL_VALUE" kind="archetype" :icon-key="option.key" :size="24" :radius="5" />
                  <text>{{ option.key === ALL_VALUE ? '全部' : option.name }}</text>
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
                  :class="[
                    `chip-${option.key.toLowerCase()}`,
                    { active: option.key === ALL_VALUE ? !selectedTiers.length : selectedTiers.includes(option.key) },
                  ]"
                  @tap="selectTier(option.key)">
                  <text>{{ option.name }}</text>
                </view>
              </view>
            </scroll-view>
          </view>

          <!-- <view class="search-field">
            <uni-icons type="search" size="18" color="var(--theme-text-tertiary)" />
            <input
              v-model="keyword"
              class="search-input"
              type="text"
              confirm-type="search"
              placeholder="搜索魔灵名称或编码"
              placeholder-class="search-placeholder" />
            <button v-if="keyword" class="clear-button" size="mini" @tap="clearKeyword">×</button>
          </view> -->
        </view>

        <view class="filter-line display-filter-line">
          <text class="filter-label">显示</text>
          <view class="chip-list">
            <view
              class="display-icon-button"
              :class="{ active: showTierCount }"
              :aria-label="showTierCount ? '隐藏品级数量' : '显示品级数量'"
              :title="showTierCount ? '隐藏品级数量' : '显示品级数量'"
              @tap="toggleTierCount">
              <uni-icons :type="showTierCount ? 'bars' : 'list'" size="18" :color="showTierCount ? '#fff' : 'var(--theme-text-tertiary)'" />
            </view>
            <view
              class="display-icon-button"
              :class="{ active: showAvatarElementBadge }"
              :aria-label="showAvatarElementBadge ? '隐藏头像属性图标' : '显示头像属性图标'"
              :title="showAvatarElementBadge ? '隐藏头像属性图标' : '显示头像属性图标'"
              @tap="toggleAvatarElementBadge">
              <uni-icons
                :type="showAvatarElementBadge ? 'color-filled' : 'color'"
                size="18"
                :color="showAvatarElementBadge ? '#fff' : 'var(--theme-text-tertiary)'" />
            </view>
            <view
              class="display-icon-button"
              :class="{ active: showScore }"
              :aria-label="showScore ? '隐藏评分' : '显示评分'"
              :title="showScore ? '隐藏评分' : '显示评分'"
              @tap="toggleScore">
              <uni-icons :type="showScore ? 'star-filled' : 'star'" size="18" :color="showScore ? '#fff' : 'var(--theme-text-tertiary)'" />
            </view>
          </view>
          <view
            class="display-icon-button"
            :class="{ active: viewMode === 'card', disabled: viewModeSwitching }"
            :aria-label="viewModeSwitching ? '正在切换展示模式' : viewMode === 'card' ? '切换为列表模式' : '切换为卡片聚合模式'"
            :title="viewModeSwitching ? '正在切换展示模式' : viewMode === 'card' ? '切换为列表模式' : '切换为卡片聚合模式'"
            @tap="toggleViewMode">
            <uni-icons
              :type="viewModeSwitching ? 'loop' : viewMode === 'card' ? 'images' : 'list'"
              size="18"
              :class="{ 'is-switching-icon': viewModeSwitching }"
              :color="viewMode === 'card' ? '#fff' : 'var(--theme-text-tertiary)'" />
          </view>
          <view class="display-action-spacer" />
          <view
            class="display-icon-button export-button"
            :class="{ disabled: exportLoading }"
            aria-label="导出图片"
            title="导出图片"
            @tap="exportRankingImage">
            <uni-icons type="download" size="18" :color="exportLoading ? 'var(--theme-text-tertiary)' : 'var(--theme-brand)'" />
          </view>
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
        <StateBlock text="魔灵强度榜加载失败" action-text="重新加载" theme="teal" @action="retry" />
        <text v-if="errorMessage !== '魔灵强度榜加载失败'" class="state-detail">{{ errorMessage }}</text>
      </view>

      <view v-else-if="initialized && report && !report.available" class="state-card">
        <StateBlock text="暂无已发布评级数据" />
        <text class="state-detail">评级数据采集并发布后会显示在这里</text>
      </view>

      <view v-else-if="initialized && !visibleItems.length" class="state-card">
        <StateBlock text="当前筛选暂无评级数据" />
        <text class="state-detail">试试切换区域、属性或评级档位</text>
      </view>

      <view v-else class="ranking-content" :id="isPosterMode ? 'tier-ranking-poster' : undefined">
        <view v-if="isPosterMode" class="poster-heading">
          <text class="poster-kicker">魔灵强度榜 · 当前筛选</text>
          <text class="poster-title">{{ exportTitle }}</text>
        </view>

        <TierRankingAggregate
          v-if="viewMode === 'card'"
          :groups="visibleGroups"
          :show-avatar-element-badge="showAvatarElementBadge"
          :show-counts="showTierCount"
          :show-score="showScore"
          @select="goToDetail" />
        <view v-else class="tier-groups">
          <view v-for="group in visibleGroups" :key="group.key" class="tier-group">
            <view class="group-heading">
              <view class="group-title-wrap">
                <text class="group-marker" :class="`marker-${group.key.toLowerCase()}`" />
                <text class="group-title" :class="{ 'group-title--other': group.key.toLowerCase() === 'other' }">{{ group.name }}</text>
                <text v-if="showTierCount" class="group-count">{{ group.items.length }}</text>
              </view>
              <text class="group-caption">综合评级</text>
            </view>
            <view class="group-list">
              <TierRankingRow
                v-for="item in group.items"
                :key="item.id"
                :item="item"
                :show-avatar-element-badge="showAvatarElementBadge"
                :show-score="showScore"
                @select="goToDetail" />
            </view>
          </view>
        </view>
        <view v-if="isPosterMode" id="tier-ranking-poster-ready" class="poster-ready" />
      </view>
    </view>
  </PageLayout>
</template>

<script setup lang="ts">
  import { computed, nextTick, ref } from 'vue'
  import { onLoad, onPullDownRefresh, onShareAppMessage, onShareTimeline, onShow } from '@dcloudio/uni-app'
  import StateBlock from '../components/state-block.vue'
  import SwcElementBadge from '../components/swc-element-badge.vue'
  import SwcSquareIcon from '../components/swc-square-icon.vue'
  import { buildSwcTierRankingShare } from '../share'
  import TierRankingRow from './components/tier-ranking-card.vue'
  import TierRankingAggregate from './components/tier-ranking-list.vue'
  import { fetchTierRankingConfig, fetchTierRankingReport } from './api'
  import { getTierRankingErrorMessage } from './normalizers'
  import {
    TIER_RANKING_LOCALE,
    type TierRankingConfig,
    type TierRankingItem,
    type TierRankingOption,
    type TierRankingReport,
    type TierRankingShareQuery,
  } from './types'
  import { useDeployedH5PosterExport } from '@/hooks/use-deployed-h5-poster-export'
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
  const selectedElements = ref<string[]>([])
  const selectedTiers = ref<string[]>([])
  const selectedStars = ref<string[]>([])
  const selectedArchetypes = ref<string[]>([])
  const keyword = ref('')
  const loading = ref(false)
  const initialized = ref(false)
  const errorMessage = ref('')
  const shareOptions = ref<TierRankingShareQuery>({})
  const viewMode = ref<'list' | 'card'>('card')
  const showTierCount = ref(false)
  const showAvatarElementBadge = ref(false)
  const showScore = ref(false)
  const viewModeSwitching = ref(false)
  const filterExpanded = ref(false)
  let canPreloadPoster = false

  // #ifdef H5
  canPreloadPoster = true
  // #endif

  const isPosterMode = ref(false)
  const {
    exporting: exportLoading,
    exportPoster,
    preloadPoster,
    cancelPreload: cancelPosterPreload,
    getErrorMessage: getPosterExportErrorMessage,
  } = useDeployedH5PosterExport()
  let requestVersion = 0

  const regionLabel = (region: string): string => REGION_LABELS[region] || region

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
  const starOptions = computed<TierRankingOption[]>(() => [
    { key: ALL_VALUE, name: '全部' },
    ...(config.value?.stars || [
      { key: '6', name: '6' },
      { key: '5', name: '5' },
      { key: '4', name: '4' },
      { key: '3', name: '3' },
      { key: '2', name: '2' },
      { key: '1', name: '1' },
    ]),
  ])
  const archetypeOptions = computed<TierRankingOption[]>(() => [
    { key: ALL_VALUE, name: '全部' },
    ...(config.value?.archetypes || [
      { key: 'attack', name: '攻击型' },
      { key: 'defense', name: '防御型' },
      { key: 'hp', name: '体力型' },
      { key: 'support', name: '辅助型' },
    ]),
  ])
  const regionIndex = computed(() => Math.max(0, regionOptions.value.indexOf(selectedRegion.value)))
  const filterSummary = computed(() => {
    const parts = [regionLabel(selectedRegion.value) || '全部区域']
    const elements = selectedElements.value.map(key => elementOptions.value.find(option => option.key === key)?.name).filter(Boolean)
    const tiers = selectedTiers.value.map(key => tierOptions.value.find(option => option.key === key)?.name).filter(Boolean)
    const stars = selectedStars.value.map(key => `${key}星`)
    const archetypes = selectedArchetypes.value.map(key => archetypeOptions.value.find(option => option.key === key)?.name).filter(Boolean)
    if (elements.length) parts.push(elements.join('、'))
    if (tiers.length) parts.push(tiers.join('、'))
    if (stars.length) parts.push(stars.join('、'))
    if (archetypes.length) parts.push(archetypes.join('、'))
    return parts.join(' · ')
  })

  const visibleItems = computed(() => {
    const normalizedKeyword = keyword.value.trim().toLowerCase()
    return (report.value?.items || []).filter(item => {
      if (selectedTiers.value.length && !selectedTiers.value.includes(item.tier.key)) return false
      if (selectedElements.value.length && !selectedElements.value.includes(item.character?.element?.key || '')) return false
      if (selectedStars.value.length && !selectedStars.value.includes(String(item.character?.stars ?? ''))) return false
      if (selectedArchetypes.value.length && !selectedArchetypes.value.includes(item.character?.archetype || '')) return false
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

  const exportTitle = computed(() => {
    const parts: string[] = []
    const region = regionLabel(selectedRegion.value)
    if (region) parts.push(region)
    const elements = selectedElements.value
      .map(key => elementOptions.value.find(option => option.key === key))
      .filter((option): option is TierRankingOption => Boolean(option))
      .map(option => option.name)
    if (elements.length) parts.push(`${elements.join('、')}属性`)
    const tiers = selectedTiers.value
      .map(key => tierOptions.value.find(option => option.key === key))
      .filter((option): option is TierRankingOption => Boolean(option))
      .map(option => option.name)
    if (tiers.length) parts.push(`${tiers.join('、')}评级`)
    const stars = selectedStars.value.map(key => `${key}星`)
    const archetypes = selectedArchetypes.value
      .map(key => archetypeOptions.value.find(option => option.key === key))
      .filter((option): option is TierRankingOption => Boolean(option))
      .map(option => option.name)
    if (stars.length) parts.push(stars.join('、'))
    if (archetypes.length) parts.push(`${archetypes.join('、')}类型`)
    if (keyword.value.trim()) parts.push(keyword.value.trim())
    return parts.join(' ') || '魔灵强度榜'
  })

  const buildPosterTargetUrl = (): string => {
    const baseUrl = String(import.meta.env.VITE_PUBLIC_THIS_H5_URL || '').replace(/['"]/g, '')
    if (!baseUrl) throw new Error('H5 地址未配置，部署 H5 后再试')
    const query = {
      ...buildShareQuery(),
      poster: '1',
    }
    const queryString = Object.entries(query)
      .filter(([, value]) => Boolean(value))
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&')
    return `${baseUrl}/subPackages/tools/compendium/swc/tier-ranking/index?${queryString}`
  }

  const hashPosterSeed = (value: string): string => {
    let hash = 2166136261
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index)
      hash = Math.imul(hash, 16777619)
    }
    return (hash >>> 0).toString(36)
  }

  const buildPosterOptions = () => {
    const targetUrl = buildPosterTargetUrl()
    const reportKey = report.value?.id || `revision-${report.value?.revision || 'latest'}`
    const posterId = `swc-tier-ranking-${hashPosterSeed(`${reportKey}|${targetUrl}`)}`
    return {
      fileName: `魔灵强度榜-${exportTitle.value.replace(/\s+/g, '-')}-${Date.now()}.png`,
      posterId,
      targetUrl,
      selector: '#tier-ranking-poster',
      readySelector: '#tier-ranking-poster-ready',
      width: 375,
      deviceScaleFactor: 2,
      timeout: 120000,
      extraWaitTime: 1500,
    }
  }

  const schedulePosterPreload = () => {
    // 只在 H5 页面预热。小程序端无需额外建立游客会话或抢占导出服务资源。
    if (!canPreloadPoster || isPosterMode.value || !initialized.value || !visibleGroups.value.length) return
    void nextTick(() => {
      if (isPosterMode.value || !visibleGroups.value.length) return
      preloadPoster(buildPosterOptions())
    })
  }

  const exportRankingImage = async () => {
    if (exportLoading.value) return
    if (!visibleGroups.value.length) {
      uni.showToast({ title: '当前没有可导出的评级', icon: 'none' })
      return
    }

    uni.showLoading({ title: '正在生成图片...', mask: true })
    try {
      await exportPoster(buildPosterOptions())
      uni.showToast({ title: '图片已导出', icon: 'success' })
    } catch (error: unknown) {
      const detail = getPosterExportErrorMessage(error)
      if (detail.includes('auth deny') || detail.includes('authorize')) {
        uni.showModal({
          title: '需要授权',
          content: '请授权保存图片到相册',
          confirmText: '去设置',
          success: result => {
            if (result.confirm) uni.openSetting()
          },
        })
      } else {
        uni.showToast({ title: detail || '导出失败，请重试', icon: 'none' })
      }
    } finally {
      uni.hideLoading()
    }
  }

  const parseFilterValues = (value: string | undefined): string[] => [
    ...new Set(
      String(value || '')
        .split(',')
        .map(item => item.trim())
        .filter(Boolean),
    ),
  ]

  const filterConfiguredValues = (values: string[], options: TierRankingOption[]): string[] =>
    values.filter(value => options.some(option => option.key === value))

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
    selectedElements.value = filterConfiguredValues(parseFilterValues(options.elements || options.element), nextConfig.elements)
    selectedTiers.value = filterConfiguredValues(parseFilterValues(options.tiers || options.tier), nextConfig.tiers)
    selectedStars.value = filterConfiguredValues(parseFilterValues(options.stars), nextConfig.stars || [])
    selectedArchetypes.value = filterConfiguredValues(parseFilterValues(options.archetypes), nextConfig.archetypes || [])
    keyword.value = options.keyword || ''
  }

  const buildQuery = () => ({
    provider: selectedProvider.value || undefined,
    region: selectedRegion.value || undefined,
    elements: selectedElements.value.length ? selectedElements.value.join(',') : undefined,
    tiers: selectedTiers.value.length ? selectedTiers.value.join(',') : undefined,
    stars: selectedStars.value.length ? selectedStars.value.join(',') : undefined,
    archetypes: selectedArchetypes.value.length ? selectedArchetypes.value.join(',') : undefined,
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
        selectedElements.value.length > 0 ||
        selectedTiers.value.length > 0 ||
        selectedStars.value.length > 0 ||
        selectedArchetypes.value.length > 0
      ) {
        nextReport = await fetchTierRankingReport(buildQuery())
      }
      if (version !== requestVersion) return
      report.value = nextReport
      initialized.value = true
      schedulePosterPreload()
    } catch (error) {
      if (version === requestVersion) errorMessage.value = getTierRankingErrorMessage(error, '魔灵强度榜加载失败')
    } finally {
      if (version === requestVersion) loading.value = false
    }
  }

  const loadReport = async () => {
    cancelPosterPreload()
    const version = ++requestVersion
    loading.value = true
    errorMessage.value = ''
    report.value = null
    try {
      const nextReport = await fetchTierRankingReport(buildQuery())
      if (version !== requestVersion) return
      report.value = nextReport
      initialized.value = true
      schedulePosterPreload()
    } catch (error) {
      if (version === requestVersion) errorMessage.value = getTierRankingErrorMessage(error, '魔灵强度榜加载失败')
    } finally {
      if (version === requestVersion) loading.value = false
    }
  }

  const refresh = async () => {
    cancelPosterPreload()
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
      selectedElements.value = filterConfiguredValues(selectedElements.value, nextConfig.elements)
      selectedTiers.value = filterConfiguredValues(selectedTiers.value, nextConfig.tiers)
      selectedStars.value = filterConfiguredValues(selectedStars.value, nextConfig.stars || [])
      selectedArchetypes.value = filterConfiguredValues(selectedArchetypes.value, nextConfig.archetypes || [])
      const nextReport = await fetchTierRankingReport(buildQuery())
      if (version !== requestVersion) return
      report.value = nextReport
      schedulePosterPreload()
    } catch (error) {
      if (version !== requestVersion) return
      report.value = previousReport
      errorMessage.value = getTierRankingErrorMessage(error, '魔灵强度榜刷新失败')
    } finally {
      if (version === requestVersion) loading.value = false
    }
  }

  const handleRegionChange = (event: PickerChangeEvent) => {
    const next = regionOptions.value[Number(event.detail.value)]
    if (!next || next === selectedRegion.value) return
    selectedRegion.value = next
    void loadReport()
  }

  const toggleFilterValue = (current: string[], value: string): string[] => {
    if (value === ALL_VALUE) return []
    return current.includes(value) ? current.filter(item => item !== value) : [...current, value]
  }

  const selectElement = (value: string) => {
    selectedElements.value = toggleFilterValue(selectedElements.value, value)
    void loadReport()
  }

  const selectTier = (value: string) => {
    selectedTiers.value = toggleFilterValue(selectedTiers.value, value)
    void loadReport()
  }

  const selectStar = (value: string) => {
    selectedStars.value = toggleFilterValue(selectedStars.value, value)
    void loadReport()
  }

  const selectArchetype = (value: string) => {
    selectedArchetypes.value = toggleFilterValue(selectedArchetypes.value, value)
    void loadReport()
  }

  const toggleTierCount = () => {
    showTierCount.value = !showTierCount.value
    schedulePosterPreload()
  }

  const toggleAvatarElementBadge = () => {
    showAvatarElementBadge.value = !showAvatarElementBadge.value
    schedulePosterPreload()
  }

  const toggleScore = () => {
    showScore.value = !showScore.value
    schedulePosterPreload()
  }

  const toggleViewMode = async () => {
    if (viewModeSwitching.value) return
    viewModeSwitching.value = true
    viewMode.value = viewMode.value === 'card' ? 'list' : 'card'
    await nextTick()
    schedulePosterPreload()
    setTimeout(() => {
      viewModeSwitching.value = false
    }, 220)
  }

  const toggleFilterExpanded = () => {
    filterExpanded.value = !filterExpanded.value
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
    elements: selectedElements.value.length ? selectedElements.value.join(',') : undefined,
    tiers: selectedTiers.value.length ? selectedTiers.value.join(',') : undefined,
    stars: selectedStars.value.length ? selectedStars.value.join(',') : undefined,
    archetypes: selectedArchetypes.value.length ? selectedArchetypes.value.join(',') : undefined,
    keyword: keyword.value.trim() || undefined,
    viewMode: viewMode.value,
    showTierCount: showTierCount.value ? '1' : '0',
    showAvatarElementBadge: showAvatarElementBadge.value ? '1' : '0',
    showScore: showScore.value ? '1' : '0',
  })

  onLoad((options: Record<string, string | undefined>) => {
    isPosterMode.value = options.poster === '1'
    viewMode.value = options.viewMode === 'list' ? 'list' : 'card'
    showTierCount.value = options.showTierCount === '1'
    showAvatarElementBadge.value = options.showAvatarElementBadge === '1'
    showScore.value = options.showScore === '1'
    shareOptions.value = {
      provider: options.provider,
      region: options.region,
      elements: options.elements || options.element,
      tiers: options.tiers || options.tier,
      stars: options.stars,
      archetypes: options.archetypes,
      keyword: options.keyword,
      viewMode: options.viewMode,
      showTierCount: options.showTierCount,
      showAvatarElementBadge: options.showAvatarElementBadge,
      showScore: options.showScore,
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

  .is-poster-mode {
    min-height: 0;
    padding: 24rpx;
    background: #f4f6fa;
  }

  .is-poster-mode .ranking-content {
    margin-top: 0;
  }

  .is-poster-mode .tier-list {
    box-shadow: none;
  }

  .poster-heading {
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 10rpx;
    margin-bottom: 18rpx;
    padding: 18rpx 22rpx 20rpx;
    border: 1rpx solid #d9e4f2;
    border-radius: 20rpx;
    background: linear-gradient(135deg, #ffffff 0%, #edf5ff 100%);
    box-shadow: 0 8rpx 20rpx rgba(37, 99, 235, 0.08);
    text-align: center;
  }

  .poster-kicker {
    color: #3972b8;
    font-size: 19rpx;
    font-weight: 800;
    letter-spacing: 2rpx;
    line-height: 1.2;
  }

  .poster-title {
    max-width: 100%;
    color: #172033;
    font-size: 34rpx;
    font-weight: 900;
    line-height: 1.35;
    word-break: break-word;
    text-align: center;
    white-space: normal;
  }

  .poster-ready {
    width: 1rpx;
    height: 1rpx;
    opacity: 0;
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

  .filter-summary-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
    min-width: 0;
    min-height: 42rpx;
  }

  .filter-summary-copy {
    display: flex;
    align-items: baseline;
    min-width: 0;
    gap: 12rpx;
  }

  .filter-summary-label {
    flex: none;
    color: var(--theme-text-tertiary);
    font-size: 19rpx;
  }

  .filter-summary-value {
    min-width: 0;
    overflow: hidden;
    color: var(--theme-text-secondary);
    font-size: 21rpx;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
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

  .region-filter-line picker {
    flex: 1;
    min-width: 0;
  }

  .region-filter-line .picker-control {
    width: 100%;
    box-sizing: border-box;
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
    height: 52rpx;
    min-width: 68rpx;
    padding: 0 16rpx;
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

  .display-filter-line {
    margin-top: 18rpx;
  }

  .display-icon-button {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 52rpx;
    height: 52rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 10rpx;
    background: var(--theme-surface-2);
  }

  .display-icon-button.active {
    border-color: var(--theme-brand);
    background: var(--theme-brand);
  }

  .display-icon-button.disabled {
    pointer-events: none;
    opacity: 0.65;
  }

  .is-switching-icon {
    animation: view-mode-switching 560ms linear infinite;
  }

  @keyframes view-mode-switching {
    to {
      transform: rotate(360deg);
    }
  }

  .display-action-spacer {
    flex: 1;
    min-width: 0;
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

  .export-button {
    background: var(--theme-surface);
  }

  .export-button:active {
    background: var(--theme-surface-2);
  }

  .export-button.disabled {
    opacity: 0.55;
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

  .group-title--other {
    font-size: 22rpx;
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
