<template>
  <PageLayout
    title="魔灵强度榜"
    :share-title="shareTitle"
    :share-timeline-title="shareTitle"
    :share-path="sharePath"
    :share-timeline-query="shareQueryString"
    :share-image-url="SWC_AI_TIER_RANKING_SHARE_IMAGE_URL"
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

          <view class="filter-line character-filter-line">
            <text class="filter-label">人物</text>
            <view class="character-filter-content">
              <SwcCharacterPickerSlots
                class="character-picker-slots"
                :characters="selectedCharacterViews"
                :max-count="0"
                :size="72"
                @add="openCharacterPicker"
                @remove="handleRemoveCharacterFilter" />
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
                  :class="{
                    active: option.key === ALL_VALUE ? !selectedElements.length : selectedElements.includes(option.key),
                    'icon-only-filter-chip': option.key !== ALL_VALUE,
                  }"
                  @tap="selectElement(option.key)">
                  <SwcElementBadge
                    v-if="option.key !== ALL_VALUE"
                    :element-key="option.key"
                    icon-only
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
                  :class="{
                    active: option.key === ALL_VALUE ? !selectedArchetypes.length : selectedArchetypes.includes(option.key),
                    'icon-only-filter-chip': option.key !== ALL_VALUE,
                  }"
                  @tap="selectArchetype(option.key)">
                  <SwcSquareIcon v-if="option.key !== ALL_VALUE" kind="archetype" :icon-key="option.key" :size="24" :radius="5" />
                  <text v-if="option.key === ALL_VALUE">全部</text>
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
              class="display-text-button"
              :class="{ active: showTierCount }"
              :aria-label="showTierCount ? '隐藏品级数量' : '显示品级数量'"
              :title="showTierCount ? '隐藏品级数量' : '显示品级数量'"
              @tap="toggleTierCount">
              <text>数量</text>
            </view>
            <view
              class="display-text-button"
              :class="{ active: showAvatarElementBadge }"
              :aria-label="showAvatarElementBadge ? '隐藏头像属性图标' : '显示头像属性图标'"
              :title="showAvatarElementBadge ? '隐藏头像属性图标' : '显示头像属性图标'"
              @tap="toggleAvatarElementBadge">
              <text>属性</text>
            </view>
            <view
              class="display-text-button"
              :class="{ active: showScore }"
              :aria-label="showScore ? '隐藏评分' : '显示评分'"
              :title="showScore ? '隐藏评分' : '显示评分'"
              @tap="toggleScore">
              <text>评分</text>
            </view>
          </view>

          <view
            class="display-text-button"
            :class="{ active: viewMode === 'card', disabled: viewModeSwitching }"
            :aria-label="viewModeSwitching ? '正在切换展示模式' : viewMode === 'card' ? '切换为列表模式' : '切换为卡片聚合模式'"
            :title="viewModeSwitching ? '正在切换展示模式' : viewMode === 'card' ? '切换为列表模式' : '切换为卡片聚合模式'"
            @tap="toggleViewMode">
            <text>{{ viewModeSwitching ? '切换中' : viewMode === 'card' ? '卡片' : '列表' }}</text>
          </view>
          <view class="display-action-spacer" />
          <view
            class="display-text-button export-button"
            :class="{ disabled: exportLoading }"
            aria-label="导出图片"
            title="导出图片"
            @tap="exportRankingImage">
            <text>{{ exportLoading ? '导出中' : '导出' }}</text>
          </view>
        </view>

        <view class="filter-line hidden-character-filter-line">
          <text class="filter-label hidden-filter-label">幻神人物</text>
          <view class="character-filter-content">
            <SwcCharacterPickerSlots
              class="character-picker-slots"
              :characters="selectedPhantomCharacterViews"
              :max-count="0"
              :size="72"
              @add="() => openHiddenCharacterPicker('phantom')"
              @remove="character => handleRemoveHiddenCharacter('phantom', character.characterId)" />
          </view>
        </view>

        <view class="filter-line hidden-character-filter-line">
          <text class="filter-label hidden-filter-label">神级人物</text>
          <view class="character-filter-content">
            <SwcCharacterPickerSlots
              class="character-picker-slots"
              :characters="selectedGodCharacterViews"
              :max-count="0"
              :size="72"
              @add="() => openHiddenCharacterPicker('god')"
              @remove="character => handleRemoveHiddenCharacter('god', character.characterId)" />
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

      <view v-else-if="initialized && report && !report.available && !hasHiddenCharacters" class="state-card">
        <StateBlock text="暂无已发布评级数据" />
        <text class="state-detail">评级数据采集并发布后会显示在这里</text>
      </view>

      <view v-else-if="initialized && !visibleGroups.length" class="state-card">
        <StateBlock text="当前筛选暂无评级数据" />
        <text class="state-detail">试试切换区域、属性或评级档位</text>
      </view>

      <view v-else class="ranking-content" :id="isPosterMode ? 'tier-ranking-poster' : undefined">
        <view v-if="isPosterMode" class="poster-heading">
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
                <text class="group-marker" :class="`marker-${tierClass(group.key)}`" />
                <text class="group-title">{{ group.name }}</text>
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
  import type { CharacterOption } from '../lineup-types'
  import { toSwcCharacterView, type SwcCharacterView } from '../utils'
  import StateBlock from '../components/state-block.vue'
  import SwcCharacterPickerSlots from '../components/swc-character-picker-slots.vue'
  import SwcElementBadge from '../components/swc-element-badge.vue'
  import SwcSquareIcon from '../components/swc-square-icon.vue'
  import { buildSwcTierRankingShare, getSwcTierRankingShareTitle } from '../share'
  import TierRankingRow from './components/tier-ranking-card.vue'
  import TierRankingAggregate from './components/tier-ranking-list.vue'
  import { fetchTierRankingConfig, fetchTierRankingReport } from './api'
  import { getTierRankingErrorMessage } from './normalizers'
  import {
    TIER_RANKING_EXPECTED_TIERS,
    TIER_RANKING_HIDDEN_TIERS,
    TIER_RANKING_LOCALE,
    type TierRankingConfig,
    type TierRankingItem,
    type TierRankingMockCharacter,
    type TierRankingOption,
    type TierRankingReport,
    type TierRankingShareQuery,
  } from './types'
  import { useDeployedH5PosterExport } from '@/hooks/use-deployed-h5-poster-export'
  import { SWC_AI_TIER_RANKING_SHARE_IMAGE_URL } from '@/config/tool-assets'
  import { getStorageSync, removeStorageSync, setStorageSync } from '@/utils/storage'
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

  type HiddenCharacterKind = 'phantom' | 'god'

  interface CharacterPickerConfig {
    cacheKey: string
    resultKey: string
  }

  const ALL_VALUE = 'all'
  const CHARACTER_PICKER_CACHE_KEY = 'compendium:swc:tier-ranking:character-picker:draft'
  const CHARACTER_PICKER_RESULT_KEY = 'compendium:swc:tier-ranking:character-picker:result'
  const PHANTOM_CHARACTER_PICKER_CACHE_KEY = 'compendium:swc:tier-ranking:phantom-character-picker:draft'
  const PHANTOM_CHARACTER_PICKER_RESULT_KEY = 'compendium:swc:tier-ranking:phantom-character-picker:result'
  const GOD_CHARACTER_PICKER_CACHE_KEY = 'compendium:swc:tier-ranking:god-character-picker:draft'
  const GOD_CHARACTER_PICKER_RESULT_KEY = 'compendium:swc:tier-ranking:god-character-picker:result'
  const HIDDEN_CHARACTER_PICKER_CONFIG: Record<HiddenCharacterKind, CharacterPickerConfig> = {
    phantom: {
      cacheKey: PHANTOM_CHARACTER_PICKER_CACHE_KEY,
      resultKey: PHANTOM_CHARACTER_PICKER_RESULT_KEY,
    },
    god: {
      cacheKey: GOD_CHARACTER_PICKER_CACHE_KEY,
      resultKey: GOD_CHARACTER_PICKER_RESULT_KEY,
    },
  }
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
  const selectedCharacterFilters = ref<CharacterOption[]>([])
  const selectedPhantomCharacters = ref<CharacterOption[]>([])
  const selectedGodCharacters = ref<CharacterOption[]>([])
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
  const selectedCharacterViews = computed<SwcCharacterView[]>(() => selectedCharacterFilters.value.map(item => toSwcCharacterView(item)))
  const selectedCharacterIds = computed(() => selectedCharacterFilters.value.map(item => item.characterId).filter(Boolean))
  const selectedPhantomCharacterViews = computed<SwcCharacterView[]>(() =>
    selectedPhantomCharacters.value.map(item => toSwcCharacterView(item)),
  )
  const selectedGodCharacterViews = computed<SwcCharacterView[]>(() => selectedGodCharacters.value.map(item => toSwcCharacterView(item)))
  const selectedPhantomCharacterIds = computed(() => selectedPhantomCharacters.value.map(item => item.characterId).filter(Boolean))
  const selectedGodCharacterIds = computed(() => selectedGodCharacters.value.map(item => item.characterId).filter(Boolean))
  const hasPhantomCharacters = computed(() => selectedPhantomCharacters.value.length > 0)
  const hasGodCharacters = computed(() => selectedGodCharacters.value.length > 0)
  const hasHiddenCharacters = computed(() => hasPhantomCharacters.value || hasGodCharacters.value)
  const tierClass = (key: string): string => {
    if (key === 'Ω') return 'omega'
    if (key.toLowerCase() === 'other') return 'f'
    return key.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  }
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
    if (selectedCharacterFilters.value.length) parts.push(`人物${selectedCharacterFilters.value.length}个`)
    if (hasPhantomCharacters.value) parts.push(`幻神${selectedPhantomCharacters.value.length}个`)
    if (hasGodCharacters.value) parts.push(`神级${selectedGodCharacters.value.length}个`)
    return parts.join(' · ')
  })

  const toMockCharacter = (source: CharacterOption): TierRankingMockCharacter => {
    const id = source.characterId || source.id
    const parsedStars = Number.parseInt(source.stars || '', 10)
    return {
      id,
      code: source.id || id,
      name: source.name || source.label || id,
      avatar: source.avatar || '',
      stars: Number.isFinite(parsedStars) ? parsedStars : null,
      element: source.elementKey
        ? {
            key: source.elementKey,
            name: source.elementName || ELEMENT_LABELS[source.elementKey] || source.elementKey,
          }
        : null,
      archetype: source.archetype || '',
    }
  }

  const buildHiddenTierItems = (characters: CharacterOption[], tierKey: 'EX' | 'Ω'): TierRankingItem[] =>
    characters.map((source, index) => {
      const character = toMockCharacter(source)
      return {
        id: `mock-${tierKey}-${character.id}`,
        rank: index + 1,
        character,
        tier: { key: tierKey, name: tierKey, sortOrder: tierKey === 'Ω' ? 110 : 100 },
        sortOrder: index + 1,
        score: null,
        source: {
          externalKey: character.code,
          name: character.name,
        },
      }
    })

  const getHiddenTierDisplayTitle = (): string => {
    if (hasGodCharacters.value && hasPhantomCharacters.value) return '幻神真神齐现'
    if (hasGodCharacters.value) return '真神出炉'
    if (hasPhantomCharacters.value) return '这就是幻神'
    return ''
  }

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
    const tierOrder = new Map<string, number>(
      TIER_RANKING_EXPECTED_TIERS.slice()
        .reverse()
        .map((key, index) => [key, index]),
    )
    const configured = (config.value?.tiers || []).slice().sort((left, right) => {
      const leftOrder = tierOrder.get(left.key) ?? 100
      const rightOrder = tierOrder.get(right.key) ?? 100
      return leftOrder - rightOrder || (right.sortOrder || 0) - (left.sortOrder || 0)
    })
    const seen = new Set<string>()
    const groups: TierRankingGroup[] = []
    if (hasGodCharacters.value) groups.push({ key: 'Ω', name: 'Ω', items: buildHiddenTierItems(selectedGodCharacters.value, 'Ω') })
    if (hasPhantomCharacters.value)
      groups.push({ key: 'EX', name: 'EX', items: buildHiddenTierItems(selectedPhantomCharacters.value, 'EX') })
    configured.forEach(option => {
      if (TIER_RANKING_HIDDEN_TIERS.includes(option.key as (typeof TIER_RANKING_HIDDEN_TIERS)[number])) return
      const items = itemMap.get(option.key)
      if (!items?.length) return
      seen.add(option.key)
      groups.push({ key: option.key, name: option.name || option.key, items })
    })
    Array.from(itemMap.entries())
      .filter(([key]) => !seen.has(key))
      .sort(([leftKey], [rightKey]) => (tierOrder.get(leftKey) ?? 100) - (tierOrder.get(rightKey) ?? 100))
      .forEach(([key, items]) => groups.push({ key, name: items[0]?.tier.name || key, items }))
    return groups
  })

  const exportTitle = computed(() => {
    const elements = selectedElements.value
      .map(key => elementOptions.value.find(option => option.key === key))
      .filter((option): option is TierRankingOption => Boolean(option))
      .map(option => option.name)
    const tiers = selectedTiers.value
      .map(key => tierOptions.value.find(option => option.key === key))
      .filter((option): option is TierRankingOption => Boolean(option))
      .map(option => option.name)
    const stars = selectedStars.value.map(key => `${key}星`)
    const archetypes = selectedArchetypes.value
      .map(key => archetypeOptions.value.find(option => option.key === key))
      .filter((option): option is TierRankingOption => Boolean(option))
      .map(option => option.name)
    const hasExtraFilters =
      elements.length ||
      stars.length ||
      archetypes.length ||
      selectedCharacterIds.value.length ||
      keyword.value.trim() ||
      hasPhantomCharacters.value ||
      hasGodCharacters.value
    if (tiers.length === 1 && !hasExtraFilters) return tiers[0]

    const parts: string[] = []
    const region = regionLabel(selectedRegion.value)
    if (region) parts.push(region)
    if (tiers.length) parts.push(tiers.join('/'))
    if (elements.length) parts.push(elements.join('/'))
    if (stars.length) parts.push(stars.join('/'))
    if (archetypes.length) parts.push(archetypes.join('/'))
    if (selectedCharacterIds.value.length) parts.push(`人物${selectedCharacterIds.value.length}个`)
    if (keyword.value.trim()) parts.push(keyword.value.trim())
    const hiddenTitle = getHiddenTierDisplayTitle()
    return parts.length ? `${hiddenTitle ? `${hiddenTitle} · ` : ''}${parts.join(' ')}` : hiddenTitle || region || '当前筛选'
  })

  const buildPosterTargetUrl = (): string => {
    const baseUrl = String(import.meta.env.VITE_PUBLIC_THIS_H5_URL || '').replace(/['"]/g, '')
    if (!baseUrl) throw new Error('H5 地址未配置，部署 H5 后再试')
    const queryString = stringifyTierRankingQuery({ ...buildShareQuery(), poster: '1' })
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

  const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value)

  const textValue = (value: unknown): string => {
    if (typeof value === 'string') return value
    if (typeof value === 'number' && Number.isFinite(value)) return String(value)
    return ''
  }

  const createCharacterFilter = (characterId: string, source: Record<string, unknown> = {}): CharacterOption => ({
    id: textValue(source.id) || characterId,
    characterId: textValue(source.characterId) || characterId,
    name: textValue(source.name) || textValue(source.label) || characterId,
    label: textValue(source.label) || textValue(source.name) || characterId,
    avatar: textValue(source.avatar),
    element: textValue(source.element) || textValue(source.elementKey),
    elementKey: textValue(source.elementKey) || textValue(source.element),
    elementName: textValue(source.elementName),
    archetype: textValue(source.archetype),
    familyKey: textValue(source.familyKey),
    familyName: textValue(source.familyName),
    awaken: textValue(source.awaken),
    awakenName: textValue(source.awakenName),
    stars: textValue(source.stars),
    status: textValue(source.status) || 'enabled',
  })

  const parseCharacterPayload = (value: string | undefined): CharacterOption[] => {
    if (!value) return []
    const candidates = [value]
    try {
      const decoded = decodeURIComponent(value)
      if (decoded !== value) candidates.push(decoded)
    } catch {
      // 兼容已经解码过的分享参数。
    }
    for (const candidate of candidates) {
      try {
        const parsed: unknown = JSON.parse(candidate)
        if (!Array.isArray(parsed)) continue
        return parsed
          .filter(isRecord)
          .map(item => createCharacterFilter(textValue(item.characterId) || textValue(item.id), item))
          .filter(item => Boolean(item.characterId))
      } catch {
        // 尝试下一个候选编码。
      }
    }
    return []
  }

  const parseCharacterSelections = (payload: string | undefined, ids: string | undefined): CharacterOption[] => {
    const fromPayload = parseCharacterPayload(payload)
    if (fromPayload.length) return fromPayload
    return parseFilterValues(ids).map(item => createCharacterFilter(item))
  }

  const serializeCharacterFilters = (characters: CharacterOption[]): string | undefined => {
    if (!characters.length) return undefined
    return JSON.stringify(
      characters.map(item => ({
        id: item.id,
        characterId: item.characterId,
        name: item.name,
        label: item.label,
        avatar: item.avatar,
        elementKey: item.elementKey,
        elementName: item.elementName,
        archetype: item.archetype,
        stars: item.stars,
      })),
    )
  }

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
    selectedCharacterFilters.value = parseFilterValues(options.characterIds).map(item => createCharacterFilter(item))
    selectedPhantomCharacters.value = parseCharacterSelections(options.phantomCharacters, options.phantomCharacterIds)
    selectedGodCharacters.value = parseCharacterSelections(options.godCharacters, options.godCharacterIds)
    keyword.value = options.keyword || ''
  }

  const buildQuery = () => ({
    provider: selectedProvider.value || undefined,
    region: selectedRegion.value || undefined,
    elements: selectedElements.value.length ? selectedElements.value.join(',') : undefined,
    tiers: selectedTiers.value.length ? selectedTiers.value.join(',') : undefined,
    stars: selectedStars.value.length ? selectedStars.value.join(',') : undefined,
    archetypes: selectedArchetypes.value.length ? selectedArchetypes.value.join(',') : undefined,
    characterIds: selectedCharacterIds.value.length ? selectedCharacterIds.value.join(',') : undefined,
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
        selectedArchetypes.value.length > 0 ||
        selectedCharacterIds.value.length > 0
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

  const openCharacterPicker = () => {
    setStorageSync(
      CHARACTER_PICKER_CACHE_KEY,
      selectedCharacterFilters.value.map(item => ({ ...item })),
    )
    removeStorageSync(CHARACTER_PICKER_RESULT_KEY)
    uni.navigateTo({
      url:
        '/subPackages/tools/compendium/swc/character-picker?compendiumId=swc' +
        `&locale=${encodeURIComponent(TIER_RANKING_LOCALE)}` +
        `&cacheKey=${encodeURIComponent(CHARACTER_PICKER_CACHE_KEY)}` +
        `&resultKey=${encodeURIComponent(CHARACTER_PICKER_RESULT_KEY)}` +
        `&selectedCharacterIds=${encodeURIComponent(selectedCharacterIds.value.join(','))}` +
        '&maxCount=0',
    })
  }

  const getHiddenCharacters = (kind: HiddenCharacterKind): CharacterOption[] =>
    kind === 'phantom' ? selectedPhantomCharacters.value : selectedGodCharacters.value

  const setHiddenCharacters = (kind: HiddenCharacterKind, characters: CharacterOption[]) => {
    if (kind === 'phantom') selectedPhantomCharacters.value = characters
    else selectedGodCharacters.value = characters
  }

  const openHiddenCharacterPicker = (kind: HiddenCharacterKind) => {
    const picker = HIDDEN_CHARACTER_PICKER_CONFIG[kind]
    const selected = getHiddenCharacters(kind)
    setStorageSync(
      picker.cacheKey,
      selected.map(item => ({ ...item })),
    )
    removeStorageSync(picker.resultKey)
    uni.navigateTo({
      url:
        '/subPackages/tools/compendium/swc/character-picker?compendiumId=swc' +
        `&locale=${encodeURIComponent(TIER_RANKING_LOCALE)}` +
        `&cacheKey=${encodeURIComponent(picker.cacheKey)}` +
        `&resultKey=${encodeURIComponent(picker.resultKey)}` +
        `&selectedCharacterIds=${encodeURIComponent(selected.map(item => item.characterId).join(','))}` +
        '&maxCount=0',
    })
  }

  const handleRemoveCharacterFilter = (character: { characterId: string }) => {
    selectedCharacterFilters.value = selectedCharacterFilters.value.filter(item => item.characterId !== character.characterId)
    void loadReport()
  }

  const handleRemoveHiddenCharacter = (kind: HiddenCharacterKind, characterId: string) => {
    setHiddenCharacters(
      kind,
      getHiddenCharacters(kind).filter(item => item.characterId !== characterId),
    )
    schedulePosterPreload()
  }

  const consumeCharacterPickerResult = (kind: HiddenCharacterKind | 'regular'): boolean => {
    const picker = kind === 'regular' ? { resultKey: CHARACTER_PICKER_RESULT_KEY } : HIDDEN_CHARACTER_PICKER_CONFIG[kind]
    const result = getStorageSync(picker.resultKey)
    if (!Array.isArray(result)) return false
    const characters = result
      .filter(isRecord)
      .map(item => createCharacterFilter(textValue(item.characterId) || textValue(item.id), item))
      .filter(item => Boolean(item.characterId))
    if (kind === 'regular') selectedCharacterFilters.value = characters
    else setHiddenCharacters(kind, characters)
    removeStorageSync(picker.resultKey)
    return true
  }

  const checkCharacterPickerResult = () => {
    const regularChanged = consumeCharacterPickerResult('regular')
    const phantomChanged = consumeCharacterPickerResult('phantom')
    const godChanged = consumeCharacterPickerResult('god')
    if (regularChanged) void loadReport()
    if (phantomChanged || godChanged) schedulePosterPreload()
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
    characterIds: selectedCharacterIds.value.length ? selectedCharacterIds.value.join(',') : undefined,
    phantomCharacterIds: selectedPhantomCharacterIds.value.length ? selectedPhantomCharacterIds.value.join(',') : undefined,
    godCharacterIds: selectedGodCharacterIds.value.length ? selectedGodCharacterIds.value.join(',') : undefined,
    phantomCharacters: serializeCharacterFilters(selectedPhantomCharacters.value),
    godCharacters: serializeCharacterFilters(selectedGodCharacters.value),
    keyword: keyword.value.trim() || undefined,
    viewMode: viewMode.value,
    filterExpanded: filterExpanded.value ? '1' : '0',
    showTierCount: showTierCount.value ? '1' : '0',
    showAvatarElementBadge: showAvatarElementBadge.value ? '1' : '0',
    showScore: showScore.value ? '1' : '0',
  })

  const stringifyTierRankingQuery = (query: TierRankingShareQuery): string =>
    Object.entries(query)
      .filter(([, value]) => Boolean(value))
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value || '')}`)
      .join('&')

  const shareQueryString = computed(() => stringifyTierRankingQuery(buildShareQuery()))
  const shareTitle = computed(() => getSwcTierRankingShareTitle(buildShareQuery()))
  const sharePath = computed(() => {
    const query = shareQueryString.value
    return `/subPackages/tools/compendium/swc/tier-ranking/index${query ? `?${query}` : ''}`
  })

  onLoad((options: Record<string, string | undefined>) => {
    isPosterMode.value = options.poster === '1'
    viewMode.value = options.viewMode === 'list' ? 'list' : 'card'
    filterExpanded.value = options.filterExpanded === '1'
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
      characterIds: options.characterIds,
      phantomCharacterIds: options.phantomCharacterIds,
      godCharacterIds: options.godCharacterIds,
      phantomCharacters: options.phantomCharacters,
      godCharacters: options.godCharacters,
      keyword: options.keyword,
      viewMode: options.viewMode,
      filterExpanded: options.filterExpanded,
      showTierCount: options.showTierCount,
      showAvatarElementBadge: options.showAvatarElementBadge,
      showScore: options.showScore,
    }
    void loadInitial()
  })

  onShow(() => {
    checkCharacterPickerResult()
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

  .character-filter-content {
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }

  .hidden-character-filter-line {
    align-items: flex-start;
  }

  .hidden-filter-label {
    width: 92rpx !important;
    padding-top: 22rpx;
    color: var(--theme-text-secondary);
    font-weight: 700;
  }

  .character-picker-slots {
    max-width: 100%;
    overflow-x: auto;
    flex-wrap: nowrap;
    gap: 8rpx;
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

  .icon-only-filter-chip {
    width: 52rpx;
    min-width: 52rpx;
    padding: 0;
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

  .display-text-button {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: center;
    min-width: 76rpx;
    height: 52rpx;
    padding: 0 14rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 10rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text-secondary);
    font-size: 21rpx;
    line-height: 1.2;
    box-sizing: border-box;
  }

  .display-text-button.active {
    border-color: var(--theme-brand);
    background: var(--theme-brand);
    color: #fff;
    font-weight: 700;
  }

  .display-text-button.disabled {
    pointer-events: none;
    opacity: 0.65;
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
  .chip-d,
  .chip-f {
    --tier-color: #64748b;
  }

  .chip-ex {
    --tier-color: #d97706;
  }

  .chip-ω {
    --tier-color: #db2777;
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

  .marker-ex {
    --tier-color: #d97706;
  }

  .marker-omega {
    --tier-color: #db2777;
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
  .marker-d,
  .marker-f {
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
