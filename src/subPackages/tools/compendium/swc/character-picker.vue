<template>
  <view class="character-picker-page">
    <view class="search-section">
      <SearchActionRow
        v-model="keyword"
        class="search-row"
        placeholder="输入人物名称或 code"
        theme="violet"
        @search="refreshCharacterOptions" />

      <view v-if="showQuickFilters" class="filter-shell">
        <view v-if="!filterExpanded" class="filter-collapsed" @click="filterExpanded = true">
          <text class="filter-icon" :class="{ active: hasActiveFilters }">⚙</text>
          <scroll-view v-if="activeFilterTags.length" class="filter-tags-scroll" scroll-x enable-flex>
            <view class="filter-tags-row">
              <text v-for="tag in activeFilterTags" :key="tag" class="filter-tag">{{ tag }}</text>
            </view>
          </scroll-view>
          <text v-else class="filter-hint">点击展开快速筛选</text>
          <text class="filter-expand-arrow">▼</text>
        </view>

        <view v-else class="filter-expanded">
          <view class="filter-header">
            <text class="filter-title">快速筛选</text>
            <text v-if="hasActiveFilters" class="filter-reset" @click.stop="resetQuickFilters">重置</text>
          </view>

          <view class="filter-section">
            <text class="filter-label">属性</text>
            <scroll-view class="filter-scroll" scroll-x enable-flex>
              <view class="filter-chip-row">
                <view
                  v-for="option in elementOptions"
                  :key="option.value"
                  class="quick-chip element-chip"
                  :class="{ selected: option.value === selectedElement }"
                  @click="selectQuickFilter('element', option.value)">
                  <SwcElementBadge
                    v-if="option.value !== ALL_VALUE"
                    :element-key="option.value"
                    :label="option.label"
                    :size="24"
                    :font-size="24"
                    :gap="8" />
                  <text v-else>{{ option.label }}</text>
                </view>
              </view>
            </scroll-view>
          </view>

          <view class="filter-section">
            <text class="filter-label">形态</text>
            <scroll-view class="filter-scroll" scroll-x enable-flex>
              <view class="filter-chip-row">
                <view
                  v-for="option in awakenOptions"
                  :key="option.value"
                  class="quick-chip"
                  :class="{ selected: option.value === selectedAwaken }"
                  @click="selectQuickFilter('awaken', option.value)">
                  <text>{{ option.label }}</text>
                </view>
              </view>
            </scroll-view>
          </view>

          <view v-if="supportsTypeFilter" class="filter-section">
            <text class="filter-label">类型</text>
            <scroll-view class="filter-scroll" scroll-x enable-flex>
              <view class="filter-chip-row">
                <view
                  v-for="option in typeOptions"
                  :key="option.value"
                  class="quick-chip"
                  :class="{ selected: option.value === selectedType }"
                  @click="selectQuickFilter('type', option.value)">
                  <text>{{ option.label }}</text>
                </view>
              </view>
            </scroll-view>
          </view>

          <view class="filter-section">
            <text class="filter-label">星级</text>
            <scroll-view class="filter-scroll" scroll-x enable-flex>
              <view class="filter-chip-row">
                <view
                  v-for="option in starOptions"
                  :key="option.value"
                  class="quick-chip"
                  :class="{ selected: option.value === selectedStar }"
                  @click="selectQuickFilter('star', option.value)">
                  <text>{{ option.label }}</text>
                </view>
              </view>
            </scroll-view>
          </view>

          <view class="filter-collapse-bar" @click="filterExpanded = false">
            <text class="filter-collapse-text">收起筛选 ▲</text>
          </view>
        </view>
      </view>
    </view>

    <StateBlock v-if="loading && !characterOptions.length" class="state-block" text="加载人物中..." />

    <StateBlock v-else-if="!characterOptions.length && !loading" class="state-block" text="暂无可选人物" />

    <scroll-view v-else class="grid-scroll" scroll-y @scrolltolower="handleScrollToLower">
      <view v-if="filteredCharacterOptions.length" class="grid-wrap">
        <view
          v-for="item in filteredCharacterOptions"
          :key="item.characterId || item.id"
          class="grid-item"
          :class="{ selected: isSelected(item.characterId) }"
          @click="toggleSelect(item)">
          <view class="avatar-wrap">
            <image v-if="item.avatar" class="avatar-image" :src="getAvatarSrc(item.avatar)" mode="aspectFill" lazy-load />
            <view v-else class="avatar-image avatar-placeholder">
              <text>{{ (item.name || '?').slice(0, 1) }}</text>
            </view>
            <view v-if="isSelected(item.characterId)" class="selected-badge">
              <text class="selected-badge-text">{{ getSelectedIndex(item.characterId) }}</text>
            </view>
          </view>
        </view>
      </view>

      <StateBlock v-else class="state-block filter-empty" :text="filteredEmptyText" />

      <view v-if="loadingMore" class="load-more">
        <text class="load-more-text">加载更多中...</text>
      </view>

      <view v-else-if="canLoadMore" class="load-more">
        <button class="load-more-btn" @click="loadMore">加载更多</button>
      </view>

      <view v-else-if="characterOptions.length && !pagination.hasNext" class="load-more">
        <text class="load-more-text muted">没有更多了</text>
      </view>
    </scroll-view>

    <view class="footer-bar">
      <view class="footer-selected-info">
        <text class="footer-count">{{ maxCount > 0 ? `已选 ${draftSelected.length}/${maxCount}` : `已选 ${draftSelected.length}` }}</text>
      </view>
      <button class="footer-cancel-btn" @click="handleCancel">取消</button>
      <button class="footer-confirm-btn" @click="handleConfirm">确认选择</button>
    </view>
  </view>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { onLoad, onReachBottom } from '@dcloudio/uni-app'
  import SearchActionRow from './components/search-action-row.vue'
  import SwcElementBadge from './components/swc-element-badge.vue'
  import StateBlock from './components/state-block.vue'
  import {
    fetchAdminCharacterOptions,
    fetchCharacterOptions as fetchUserCharacterOptions,
    getPaginationOrDefault,
    type CharacterOption,
    type CharacterOptionResult,
    type PaginationState,
  } from '@/services/compendium-lineups'
  import { preloadAvatars, resolveAvatar } from '@/utils/avatar-cache'
  import { isAdminUser } from '@/utils/admin'
  import { getStorageSync, setStorageSync } from '@/utils/storage'

  type QuickFilterKey = 'element' | 'awaken' | 'type' | 'star'

  interface FilterOption {
    label: string
    value: string
  }

  const ALL_VALUE = 'all'
  const DEFAULT_LOCALE = 'zh-CN'
  const DEFAULT_COMPENDIUM_ID = 'swc'

  const elementOptions: FilterOption[] = [
    { label: '全部', value: ALL_VALUE },
    { label: '火', value: 'fire' },
    { label: '水', value: 'water' },
    { label: '风', value: 'wind' },
    { label: '光', value: 'light' },
    { label: '暗', value: 'dark' },
  ]

  const awakenOptions: FilterOption[] = [
    { label: '全部', value: ALL_VALUE },
    { label: '觉醒', value: 'awakened' },
    { label: '未觉醒', value: 'unawakened' },
  ]

  const typeOptions: FilterOption[] = [
    { label: '全部', value: ALL_VALUE },
    { label: '攻击', value: 'attack' },
    { label: '防御', value: 'defense' },
    { label: '体力', value: 'hp' },
    { label: '辅助', value: 'support' },
  ]

  const starOptions: FilterOption[] = [
    { label: '全部', value: ALL_VALUE },
    { label: '5★', value: '5' },
    { label: '4★', value: '4' },
    { label: '3★', value: '3' },
    { label: '2★', value: '2' },
    { label: '1★', value: '1' },
  ]

  const compendiumId = ref(DEFAULT_COMPENDIUM_ID)
  const selectedLocale = ref(DEFAULT_LOCALE)
  const maxCount = ref(0)
  const keyword = ref('')
  const loading = ref(false)
  const loadingMore = ref(false)
  const characterOptions = ref<CharacterOption[]>([])
  const pagination = ref<PaginationState>(getPaginationOrDefault())
  const draftSelected = ref<CharacterOption[]>([])
  const initialized = ref(false)
  const showQuickFilters = ref(true)
  const filterExpanded = ref(true)
  const selectedElement = ref(ALL_VALUE)
  const selectedAwaken = ref('awakened')
  const selectedType = ref(ALL_VALUE)
  const selectedStar = ref(ALL_VALUE)
  const cacheKey = ref('compendium:swc:lineup-edit:picker-draft')
  const resultKey = ref('compendium:swc:lineup-edit:picker-result')
  const avatarCacheRevision = ref(0)
  const pageSize = 50
  const autoLoading = ref(false)
  let requestSequence = 0

  const normalizeText = (value?: string): string => (typeof value === 'string' ? value.trim().toLowerCase() : '')

  const normalizeAwaken = (value?: string): string => {
    const text = normalizeText(value)
    if (!text) return ''
    if (['awakened', 'true', '1', '觉醒', '已觉醒'].includes(text)) return 'awakened'
    if (['unawakened', 'false', '0', '未觉醒', '未觉醒形态'].includes(text)) return 'unawakened'
    return ''
  }

  const normalizeArchetype = (value?: string): string => {
    const text = normalizeText(value)
    if (!text) return ''
    if (['attack', 'atk', '攻击'].includes(text)) return 'attack'
    if (['defense', 'def', '防御'].includes(text)) return 'defense'
    if (['hp', 'health', '体力'].includes(text)) return 'hp'
    if (['support', 'sup', '辅助'].includes(text)) return 'support'
    return ''
  }

  const normalizeStars = (value?: string): string => {
    const text = typeof value === 'string' ? value : ''
    const matched = text.match(/\d+/)
    return matched ? matched[0] : ''
  }

  const normalizeStarsValue = (value?: string): number => {
    const stars = Number(normalizeStars(value))
    return Number.isFinite(stars) ? stars : 0
  }

  const getAvatarSrc = (url: string): string => {
    avatarCacheRevision.value
    return resolveAvatar(url)
  }

  const supportsTypeFilter = computed(() => characterOptions.value.some(option => Boolean(normalizeArchetype(option.archetype))))

  const hasActiveFilters = computed(
    () =>
      selectedElement.value !== ALL_VALUE ||
      selectedAwaken.value !== ALL_VALUE ||
      selectedType.value !== ALL_VALUE ||
      selectedStar.value !== ALL_VALUE,
  )

  const activeFilterTags = computed<string[]>(() => {
    const tags: string[] = []
    if (selectedElement.value !== ALL_VALUE) {
      const label = elementOptions.find(o => o.value === selectedElement.value)?.label
      if (label) tags.push(label)
    }
    if (selectedAwaken.value !== ALL_VALUE) {
      const label = awakenOptions.find(o => o.value === selectedAwaken.value)?.label
      if (label) tags.push(label)
    }
    if (selectedType.value !== ALL_VALUE) {
      const label = typeOptions.find(o => o.value === selectedType.value)?.label
      if (label) tags.push(label)
    }
    if (selectedStar.value !== ALL_VALUE) {
      const label = starOptions.find(o => o.value === selectedStar.value)?.label
      if (label) tags.push(label)
    }
    return tags
  })

  const filteredCharacterOptions = computed(() =>
    characterOptions.value
      .filter(option => {
        const elementKey = normalizeText(option.elementKey || option.element)
        const awaken = normalizeAwaken(option.awaken || option.awakenName)
        const archetype = normalizeArchetype(option.archetype)
        const stars = normalizeStars(option.stars)

        if (selectedElement.value !== ALL_VALUE && elementKey !== selectedElement.value) return false
        if (selectedAwaken.value !== ALL_VALUE && awaken !== selectedAwaken.value) return false
        if (selectedType.value !== ALL_VALUE && archetype !== selectedType.value) return false
        if (selectedStar.value !== ALL_VALUE && stars !== selectedStar.value) return false
        return true
      })
      .map((item, index) => ({ item, index }))
      .sort((left, right) => {
        const starDiff = normalizeStarsValue(right.item.stars) - normalizeStarsValue(left.item.stars)
        if (starDiff !== 0) return starDiff
        return left.index - right.index
      })
      .map(entry => entry.item),
  )

  const filteredEmptyText = computed(() => {
    if (!hasActiveFilters.value) return '暂无可选人物'
    if (pagination.value.hasNext) return '当前已加载人物中暂无符合条件项，可继续下拉加载更多'
    return '暂无符合筛选条件的人物'
  })

  const canLoadMore = computed(
    () => initialized.value && pagination.value.hasNext && !loading.value && !loadingMore.value && !autoLoading.value,
  )

  const isSelected = (characterId: string): boolean => draftSelected.value.some(item => item.characterId === characterId)

  const getSelectedIndex = (characterId: string): number => {
    const idx = draftSelected.value.findIndex(item => item.characterId === characterId)
    return idx >= 0 ? idx + 1 : 0
  }

  const toggleSelect = (option: CharacterOption) => {
    if (isSelected(option.characterId)) {
      draftSelected.value = draftSelected.value.filter(item => item.characterId !== option.characterId)
      return
    }
    if (maxCount.value > 0 && draftSelected.value.length >= maxCount.value) {
      uni.showToast({ title: `最多选择 ${maxCount.value} 个魔灵`, icon: 'none' })
      return
    }
    draftSelected.value = [...draftSelected.value, { ...option }]
  }

  const loadCharacterPage = async (page: number): Promise<CharacterOptionResult> => {
    const loadFn = isAdminUser() ? fetchAdminCharacterOptions : fetchUserCharacterOptions
    return loadFn({
      compendiumId: compendiumId.value,
      locale: selectedLocale.value,
      keyword: keyword.value.trim() || undefined,
      status: 'enabled',
      page,
      pageSize,
    })
  }

  const preloadCharacterBatch = (items: CharacterOption[]) => {
    const urls = items.map(item => item.avatar).filter((url): url is string => Boolean(url))
    if (!urls.length) return
    void preloadAvatars(urls).finally(() => {
      avatarCacheRevision.value += 1
    })
  }

  const loadRemainingPages = async (token: number) => {
    if (autoLoading.value) return
    autoLoading.value = true
    loadingMore.value = true

    try {
      while (token === requestSequence && pagination.value.hasNext) {
        const result = await loadCharacterPage(pagination.value.page + 1)
        if (token !== requestSequence) return
        pagination.value = result.pagination
        characterOptions.value = [...characterOptions.value, ...result.items]
        preloadCharacterBatch(result.items)
      }
    } finally {
      if (token === requestSequence) {
        loadingMore.value = false
      }
      autoLoading.value = false
    }
  }

  const fetchOptions = async (reset = true) => {
    if (reset) {
      const token = ++requestSequence
      loading.value = true
      loadingMore.value = false
      autoLoading.value = false
      errorMessage.value = ''
      pagination.value = getPaginationOrDefault()
      characterOptions.value = []
      initialized.value = false

      try {
        const result = await loadCharacterPage(1)
        if (token !== requestSequence) return
        pagination.value = result.pagination
        characterOptions.value = result.items
        initialized.value = true
        preloadCharacterBatch(result.items)
        if (pagination.value.hasNext) {
          await loadRemainingPages(token)
        }
      } catch (error) {
        uni.showToast({ title: typeof error === 'string' ? error : '加载人物选项失败', icon: 'none' })
      } finally {
        if (token === requestSequence) {
          loading.value = false
        }
      }
      return
    }

    if (loading.value || loadingMore.value || autoLoading.value || !pagination.value.hasNext) return

    const token = ++requestSequence
    loadingMore.value = true
    try {
      const result = await loadCharacterPage(pagination.value.page + 1)
      if (token !== requestSequence) return
      pagination.value = result.pagination
      characterOptions.value = [...characterOptions.value, ...result.items]
      initialized.value = true
      preloadCharacterBatch(result.items)
    } catch (error) {
      uni.showToast({ title: typeof error === 'string' ? error : '加载人物选项失败', icon: 'none' })
    } finally {
      if (token === requestSequence) {
        loadingMore.value = false
      }
    }
  }

  const refreshCharacterOptions = () => {
    void fetchOptions(true)
  }

  const loadMore = () => {
    void fetchOptions(false)
  }

  const handleScrollToLower = () => {
    if (canLoadMore.value) loadMore()
  }

  const selectQuickFilter = (key: QuickFilterKey, value: string) => {
    if (key === 'element') selectedElement.value = value
    if (key === 'awaken') selectedAwaken.value = value
    if (key === 'type') selectedType.value = value
    if (key === 'star') selectedStar.value = value
  }

  const resetQuickFilters = () => {
    selectedElement.value = ALL_VALUE
    selectedAwaken.value = 'awakened'
    selectedType.value = ALL_VALUE
    selectedStar.value = ALL_VALUE
  }

  const handleCancel = () => {
    uni.navigateBack()
  }

  const handleConfirm = () => {
    setStorageSync(
      resultKey.value,
      draftSelected.value.map(item => ({ ...item })),
    )
    uni.navigateBack()
  }

  onLoad((options: Record<string, string | undefined>) => {
    compendiumId.value = options.compendiumId || DEFAULT_COMPENDIUM_ID
    selectedLocale.value = options.locale || DEFAULT_LOCALE
    const parsedMaxCount = Number(options.maxCount)
    maxCount.value = Number.isFinite(parsedMaxCount) && parsedMaxCount > 0 ? parsedMaxCount : 0
    cacheKey.value = options.cacheKey ? decodeURIComponent(options.cacheKey) : cacheKey.value
    resultKey.value = options.resultKey ? decodeURIComponent(options.resultKey) : resultKey.value
    uni.setNavigationBarTitle({ title: '精准人物筛选' })

    const cached = getStorageSync(cacheKey.value)
    if (Array.isArray(cached) && cached.length) {
      draftSelected.value = cached.map((item: CharacterOption) => ({ ...item }))
    }

    fetchOptions(true)
  })

  onReachBottom(() => {
    if (canLoadMore.value) loadMore()
  })
</script>

<style scoped lang="scss">
  .character-picker-page {
    min-height: 100vh;
    background: #f6f7fb;
    display: flex;
    flex-direction: column;
    padding-bottom: 140rpx;
  }

  .search-section {
    flex-shrink: 0;
    padding: 20rpx 24rpx 0;
  }

  .search-row {
    margin-bottom: 16rpx;
  }

  .filter-shell {
    margin-bottom: 16rpx;
    border: 1rpx solid #eef0f5;
    border-radius: 20rpx;
    background: #f8fafc;
    overflow: hidden;
  }

  .filter-collapsed {
    display: flex;
    align-items: center;
    gap: 16rpx;
    min-height: 72rpx;
    padding: 16rpx 20rpx;
  }

  .filter-icon {
    flex: none;
    color: #b0b8c4;
    font-size: 34rpx;
  }

  .filter-icon.active {
    color: #7c3aed;
  }

  .filter-tags-scroll {
    flex: 1;
    min-width: 0;
    white-space: nowrap;
  }

  .filter-tags-row {
    display: flex;
    align-items: center;
    gap: 10rpx;
  }

  .filter-tag {
    flex: none;
    height: 44rpx;
    line-height: 44rpx;
    padding: 0 16rpx;
    border-radius: 999rpx;
    background: rgba(124, 58, 237, 0.12);
    color: #7c3aed;
    font-size: 22rpx;
    font-weight: 700;
  }

  .filter-hint,
  .filter-expand-arrow,
  .filter-collapse-text {
    color: #98a2b3;
    font-size: 24rpx;
    font-weight: 700;
  }

  .filter-hint {
    flex: 1;
  }

  .filter-expanded {
    padding-top: 8rpx;
  }

  .filter-header,
  .filter-collapse-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20rpx;
  }

  .filter-header {
    height: 64rpx;
  }

  .filter-title {
    color: #111827;
    font-size: 24rpx;
    font-weight: 800;
  }

  .filter-reset {
    color: #7c3aed;
    font-size: 24rpx;
    font-weight: 700;
  }

  .filter-collapse-bar {
    justify-content: center;
    height: 60rpx;
    border-top: 1rpx solid #eef0f5;
  }

  .filter-section {
    display: flex;
    align-items: center;
    gap: 12rpx;
    padding: 0 0 14rpx 20rpx;
  }

  .filter-label {
    flex: none;
    width: 56rpx;
    color: #667085;
    font-size: 24rpx;
    font-weight: 800;
  }

  .filter-scroll {
    flex: 1;
    min-width: 0;
    white-space: nowrap;
  }

  .filter-chip-row {
    display: flex;
    align-items: center;
    gap: 12rpx;
    padding-right: 20rpx;
  }

  .quick-chip {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10rpx;
    height: 52rpx;
    padding: 0 20rpx;
    border: 1rpx solid #e7ebf2;
    border-radius: 999rpx;
    background: #fff;
    color: #465164;
    font-size: 24rpx;
    font-weight: 700;
  }

  .quick-chip.selected {
    border-color: #111827;
    background: #111827;
    color: #fff;
  }

  .element-chip {
    padding-left: 18rpx;
    padding-right: 18rpx;
  }

  .element-chip.selected {
    color: #fff;
  }

  .state-block {
    padding: 60rpx 28rpx;
    text-align: center;
    color: #667085;
    font-size: 28rpx;
  }

  .filter-empty {
    padding: 30rpx 28rpx;
  }

  .grid-scroll {
    flex: 1;
    min-height: 0;
  }

  .grid-wrap {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 20rpx 12rpx;
    padding: 12rpx 24rpx 24rpx;
  }

  .grid-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
  }

  .avatar-wrap {
    position: relative;
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .avatar-image {
    width: 110rpx;
    height: 110rpx;
    border-radius: 24rpx;
    background: #e5e7eb;
    box-shadow: 0 8rpx 20rpx rgba(15, 23, 42, 0.1);
  }

  .avatar-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #7c3aed;
    font-size: 32rpx;
    font-weight: 800;
  }

  .grid-item.selected .avatar-image {
    border: 4rpx solid #7c3aed;
    box-shadow: 0 8rpx 24rpx rgba(124, 58, 237, 0.3);
  }

  .selected-badge {
    position: absolute;
    top: -8rpx;
    right: 4rpx;
    min-width: 36rpx;
    height: 36rpx;
    line-height: 36rpx;
    padding: 0 8rpx;
    border-radius: 999rpx;
    background: #7c3aed;
    text-align: center;
    z-index: 1;
  }

  .selected-badge-text {
    color: #fff;
    font-size: 22rpx;
    font-weight: 800;
  }

  .load-more {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 16rpx 24rpx 24rpx;
  }

  .load-more-text {
    color: #667085;
    font-size: 24rpx;
    font-weight: 700;
  }

  .load-more-text.muted {
    color: #98a2b3;
  }

  .load-more-btn {
    min-width: 220rpx;
    border-radius: 999rpx;
    font-size: 24rpx;
    font-weight: 700;
    color: #7c3aed;
  }

  .footer-bar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    gap: 16rpx;
    padding: 20rpx 24rpx;
    padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
    background: rgba(246, 247, 251, 0.96);
    border-top: 1rpx solid #eef0f5;
    box-shadow: 0 -6rpx 20rpx rgba(15, 23, 42, 0.06);
  }

  .footer-selected-info {
    flex: 1;
    min-width: 0;
  }

  .footer-count {
    color: #475467;
    font-size: 24rpx;
    font-weight: 700;
  }

  .footer-cancel-btn,
  .footer-confirm-btn {
    flex: none;
    min-width: 160rpx;
    height: 72rpx;
    line-height: 72rpx;
    border-radius: 999rpx;
    font-size: 26rpx;
    font-weight: 700;
  }

  .footer-cancel-btn {
    color: #667085;
    background: #fff;
    border: 1rpx solid #e5e7eb;
  }

  .footer-confirm-btn {
    background: #7c3aed;
    color: #fff;
  }
</style>
