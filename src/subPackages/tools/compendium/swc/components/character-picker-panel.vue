<template>
  <view class="character-picker-panel">
    <view class="picker-body">
      <view class="section-card">
        <view class="section-head">
          <text class="section-title">{{ selectedTitle }}</text>
          <text class="section-tip">{{ selectedCountText }}</text>
        </view>

        <StateBlock v-if="!draftSelected.length" class="empty-block" :text="emptySelectedText" />

        <CharacterAvatarGrid
          v-else
          class="selected-list"
          :items="draftSelected"
          :columns="selectedGridColumns"
          :show-order="selectionMode === 'multiple'"
          action-text="移除"
          action-theme="danger"
          @action="removeMember" />
      </view>

      <view class="section-head">
        <text class="section-title">{{ searchTitle }}</text>
        <text v-if="searchTip" class="section-tip">{{ searchTip }}</text>
      </view>

      <view class="section-card search-card">
        <SearchActionRow
          v-model="memberKeyword"
          class="search-row"
          :placeholder="searchPlaceholder"
          theme="violet"
          @search="refreshCharacterOptions" />

        <view v-if="props.showQuickFilters" class="filter-shell">
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

        <StateBlock v-if="memberLoading && !characterOptions.length" class="empty-block" :text="loadingText" />

        <StateBlock v-else-if="!characterOptions.length" class="empty-block" :text="emptySearchText" />

        <view v-else class="options-scroll-wrap" :style="optionsScrollStyle">
          <scroll-view class="options-scroll" scroll-y lower-threshold="120" @scrolltolower="handleOptionsScrollToLower">
            <view v-if="filteredCharacterOptions.length" class="option-list">
              <view v-for="option in filteredCharacterOptions" :key="option.characterId || option.id" class="option-card">
                <image v-if="option.avatar" class="member-avatar" :src="option.avatar" mode="aspectFill" />
                <view v-else class="member-avatar member-avatar-placeholder">
                  <text>{{ (option.name || '?').slice(0, 1) }}</text>
                </view>
                <view class="member-info">
                  <text class="member-name">{{ option.name || option.label || '未知魔灵' }}</text>
                  <view class="member-extra">
                    <view v-if="option.elementName" class="member-meta-pill member-meta-element">
                      <SwcElementBadge
                        :element-key="option.elementKey || option.element"
                        :label="option.elementName"
                        :size="20"
                        :font-size="22"
                        :gap="6" />
                    </view>
                    <text v-if="option.familyName" class="member-meta-pill">{{ option.familyName }}</text>
                    <text v-if="option.stars" class="member-meta-pill">{{ option.stars }}</text>
                    <text v-if="!option.elementName && !option.familyName && !option.stars" class="member-meta-fallback">--</text>
                  </view>
                </view>
                <button class="mini-btn" size="mini" :disabled="isAddDisabled(option.characterId)" @click="toggleMember(option)">
                  {{ getOptionActionText(option.characterId) }}
                </button>
              </view>
            </view>

            <StateBlock v-else class="empty-block filter-empty-block" :text="filteredEmptyText" />

            <view v-if="memberLoadingMore" class="load-more">
              <text class="load-more-text">加载更多中...</text>
            </view>

            <view v-else-if="canLoadMore" class="load-more">
              <button class="action-btn load-more-btn" :loading="memberLoadingMore" @click="handleLoadMoreClick"> 加载更多 </button>
            </view>

            <view v-else-if="showNoMoreText" class="load-more">
              <text class="load-more-text muted">没有更多了</text>
            </view>
          </scroll-view>
        </view>
      </view>
    </view>

    <StickyActionBar v-if="footerMode === 'manual'" :fixed="footerFixed" :bottom-padding="24" background="rgba(246, 247, 251, 0.96)">
      <button class="footer-btn cancel-btn" @click="handleCancel">{{ cancelText }}</button>
      <button class="footer-btn confirm-btn" @click="handleConfirm">{{ confirmText }}</button>
    </StickyActionBar>
  </view>
</template>

<script setup lang="ts">
  import { computed, getCurrentInstance, nextTick, onMounted, ref, watch } from 'vue'
  import CharacterAvatarGrid from './character-avatar-grid.vue'
  import SearchActionRow from './search-action-row.vue'
  import SwcElementBadge from './swc-element-badge.vue'
  import StateBlock from './state-block.vue'
  import StickyActionBar from './sticky-action-bar.vue'
  import {
    fetchAdminCharacterOptions,
    fetchCharacterOptions as fetchUserCharacterOptions,
    getPaginationOrDefault,
    type CharacterOption,
    type CharacterOptionResult,
    type PaginationState,
  } from '@/services/compendium-lineups'
  import { isAdminUser } from '@/utils/admin'

  type SelectionMode = 'single' | 'multiple'
  type FooterMode = 'manual' | 'none'
  type QuickFilterKey = 'element' | 'awaken' | 'type' | 'star'

  interface FilterOption {
    label: string
    value: string
  }

  const ALL_VALUE = 'all'

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

  const props = withDefaults(
    defineProps<{
      active?: boolean
      compendiumId: string
      locale?: string
      modelValue?: CharacterOption[]
      selectionMode?: SelectionMode
      footerMode?: FooterMode
      maxCount?: number
      selectedTitle?: string
      searchTitle?: string
      searchTip?: string
      searchPlaceholder?: string
      emptySelectedText?: string
      emptySearchText?: string
      loadingText?: string
      cancelText?: string
      confirmText?: string
      showQuickFilters?: boolean
      footerFixed?: boolean
    }>(),
    {
      active: true,
      locale: 'zh-CN',
      modelValue: () => [],
      selectionMode: 'multiple',
      footerMode: 'manual',
      maxCount: 5,
      selectedTitle: '已选成员',
      searchTitle: '搜索成员',
      searchTip: '远程搜索人物名称或 code',
      searchPlaceholder: '输入名称或 code',
      emptySelectedText: '还没有选择成员，请从下方搜索结果中添加。',
      emptySearchText: '暂无可选人物',
      loadingText: '搜索成员中...',
      cancelText: '取消',
      confirmText: '确认',
      showQuickFilters: true,
      footerFixed: true,
    },
  )

  const emit = defineEmits<{
    (event: 'update:modelValue', value: CharacterOption[]): void
    (event: 'confirm', value: CharacterOption[]): void
    (event: 'cancel'): void
    (event: 'change', value: CharacterOption[]): void
  }>()

  const memberKeyword = ref('')
  const memberLoading = ref(false)
  const memberLoadingMore = ref(false)
  const characterOptions = ref<CharacterOption[]>([])
  const characterPagination = ref<PaginationState>(getPaginationOrDefault())
  const draftSelected = ref<CharacterOption[]>([])
  const initialized = ref(false)
  const optionsScrollHeight = ref(360)
  const filterExpanded = ref(true)
  const selectedElement = ref(ALL_VALUE)
  const selectedAwaken = ref(ALL_VALUE)
  const selectedType = ref(ALL_VALUE)
  const selectedStar = ref(ALL_VALUE)
  const instance = getCurrentInstance()

  const cloneSelection = (items: CharacterOption[] = []): CharacterOption[] => items.map(item => ({ ...item }))

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

  const syncDraftFromModel = () => {
    draftSelected.value = cloneSelection(props.modelValue)
  }

  const selectedCountText = computed(() => {
    if (props.selectionMode === 'single') {
      return draftSelected.value.length ? '已选择 1 个' : '未选择'
    }
    return `${draftSelected.value.length}/${props.maxCount}`
  })

  const selectedGridColumns = computed(() => (props.selectionMode === 'single' ? 1 : Math.min(Math.max(props.maxCount, 1), 5)))

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
      const label = elementOptions.find(option => option.value === selectedElement.value)?.label
      if (label) tags.push(label)
    }
    if (selectedAwaken.value !== ALL_VALUE) {
      const label = awakenOptions.find(option => option.value === selectedAwaken.value)?.label
      if (label) tags.push(label)
    }
    if (selectedType.value !== ALL_VALUE) {
      const label = typeOptions.find(option => option.value === selectedType.value)?.label
      if (label) tags.push(label)
    }
    if (selectedStar.value !== ALL_VALUE) {
      const label = starOptions.find(option => option.value === selectedStar.value)?.label
      if (label) tags.push(label)
    }
    return tags
  })

  const filteredCharacterOptions = computed(() =>
    characterOptions.value.filter(option => {
      const elementKey = normalizeText(option.elementKey || option.element)
      const awaken = normalizeAwaken(option.awaken || option.awakenName)
      const archetype = normalizeArchetype(option.archetype)
      const stars = normalizeStars(option.stars)

      if (selectedElement.value !== ALL_VALUE && elementKey !== selectedElement.value) return false
      if (selectedAwaken.value !== ALL_VALUE && awaken !== selectedAwaken.value) return false
      if (selectedType.value !== ALL_VALUE && archetype !== selectedType.value) return false
      if (selectedStar.value !== ALL_VALUE && stars !== selectedStar.value) return false
      return true
    }),
  )

  const filteredEmptyText = computed(() => {
    if (!hasActiveFilters.value) return props.emptySearchText
    if (characterPagination.value.hasNext) return '当前已加载人物中暂无符合条件项，可继续下拉加载更多'
    return '暂无符合筛选条件的人物'
  })

  const canLoadMore = computed(() => initialized.value && characterPagination.value.hasNext && !memberLoading.value)

  const showNoMoreText = computed(() => initialized.value && !characterPagination.value.hasNext && characterOptions.value.length > 0)

  const optionsScrollStyle = computed(() => ({
    height: `${optionsScrollHeight.value}px`,
  }))

  const updateOptionsScrollHeight = () => {
    nextTick(() => {
      setTimeout(() => {
        if (!instance?.proxy) return
        const query = uni.createSelectorQuery().in(instance?.proxy)
        query.select('.character-picker-panel').boundingClientRect()
        query.select('.options-scroll-wrap').boundingClientRect()
        query.select('.sticky-action-bar').boundingClientRect()
        query.exec((rects: any[]) => {
          const [panelRect, scrollRect, footerRect] = rects || []
          if (typeof scrollRect?.top !== 'number') return

          let windowHeight = 0
          try {
            windowHeight = uni.getSystemInfoSync().windowHeight || 0
          } catch (error) {
            windowHeight = 0
          }

          const panelBottom = panelRect?.height ? panelRect.top + panelRect.height : windowHeight
          const footerTop = footerRect?.top || panelBottom || windowHeight
          const availableBottom = Math.min(footerTop, panelBottom || footerTop, windowHeight || footerTop)
          const nextHeight = Math.floor(availableBottom - scrollRect.top)

          if (nextHeight > 120) {
            optionsScrollHeight.value = nextHeight
          }
        })
      }, 50)
    })
  }

  const isMemberSelected = (characterId: string): boolean => draftSelected.value.some(member => member.characterId === characterId)

  const isAddDisabled = (characterId: string): boolean => {
    if (isMemberSelected(characterId)) return false
    if (props.selectionMode === 'single') return false
    return draftSelected.value.length >= props.maxCount
  }

  const getOptionActionText = (characterId: string): string =>
    isMemberSelected(characterId) ? '移除' : props.selectionMode === 'single' ? '选择' : '添加'

  const emitSelection = (selection: CharacterOption[]) => {
    const payload = cloneSelection(selection)
    draftSelected.value = payload
    emit('update:modelValue', payload)
    emit('change', payload)
  }

  const applySelection = (selection: CharacterOption[]) => {
    const payload = cloneSelection(selection)
    if (props.footerMode === 'manual') {
      draftSelected.value = payload
      return
    }
    emitSelection(payload)
  }

  const toggleMember = (option: CharacterOption) => {
    const selected = isMemberSelected(option.characterId)

    if (selected) {
      applySelection(draftSelected.value.filter(member => member.characterId !== option.characterId))
      return
    }

    if (props.selectionMode === 'single') {
      applySelection([option])
      return
    }

    if (draftSelected.value.length >= props.maxCount) {
      uni.showToast({
        title: `最多选择 ${props.maxCount} 个魔灵`,
        icon: 'none',
      })
      return
    }

    applySelection([...draftSelected.value, option])
  }

  const removeMember = (characterId: string) => {
    if (!isMemberSelected(characterId)) return
    applySelection(draftSelected.value.filter(member => member.characterId !== characterId))
  }

  const fetchCharacterOptions = async (reset = true) => {
    if (!props.active || memberLoading.value || memberLoadingMore.value) return

    if (reset) {
      memberLoading.value = true
    } else {
      if (!characterPagination.value.hasNext) return
      memberLoadingMore.value = true
    }

    try {
      const nextPage = reset ? 1 : characterPagination.value.page + 1
      const loadOptions = isAdminUser() ? fetchAdminCharacterOptions : fetchUserCharacterOptions
      const result: CharacterOptionResult = await loadOptions({
        compendiumId: props.compendiumId,
        locale: props.locale,
        keyword: memberKeyword.value.trim() || undefined,
        status: 'enabled',
        page: nextPage,
        pageSize: 20,
      })

      characterPagination.value = result.pagination
      characterOptions.value = reset ? result.items : [...characterOptions.value, ...result.items]
      initialized.value = true
      updateOptionsScrollHeight()
    } catch (error) {
      uni.showToast({
        title: typeof error === 'string' ? error : '加载人物选项失败',
        icon: 'none',
      })
    } finally {
      memberLoading.value = false
      memberLoadingMore.value = false
      updateOptionsScrollHeight()
    }
  }

  const refreshCharacterOptions = () => {
    fetchCharacterOptions(true)
  }

  const loadMoreCharacterOptions = () => {
    fetchCharacterOptions(false)
  }

  const handleOptionsScrollToLower = () => {
    if (!canLoadMore.value) return
    loadMoreCharacterOptions()
  }

  const handleLoadMoreClick = () => {
    if (!canLoadMore.value) return
    loadMoreCharacterOptions()
  }

  const ensureInitialLoad = () => {
    if (!initialized.value) {
      fetchCharacterOptions(true)
    }
  }

  const selectQuickFilter = (key: QuickFilterKey, value: string) => {
    if (key === 'element') selectedElement.value = value
    if (key === 'awaken') selectedAwaken.value = value
    if (key === 'type') selectedType.value = value
    if (key === 'star') selectedStar.value = value
  }

  const resetQuickFilters = () => {
    selectedElement.value = ALL_VALUE
    selectedAwaken.value = ALL_VALUE
    selectedType.value = ALL_VALUE
    selectedStar.value = ALL_VALUE
  }

  const handleCancel = () => {
    syncDraftFromModel()
    emit('cancel')
  }

  const handleConfirm = () => {
    emitSelection(draftSelected.value)
    emit('confirm', cloneSelection(draftSelected.value))
  }

  watch(
    () => props.modelValue,
    () => {
      if (props.footerMode === 'none' || !props.active) {
        syncDraftFromModel()
      }
    },
    { deep: true },
  )

  watch(
    () => props.active,
    active => {
      if (!active) return
      syncDraftFromModel()
      ensureInitialLoad()
    },
    { immediate: true },
  )

  watch(supportsTypeFilter, supported => {
    if (!supported && selectedType.value !== ALL_VALUE) {
      selectedType.value = ALL_VALUE
    }
  })

  watch(
    () => [
      props.active,
      props.footerMode,
      props.showQuickFilters,
      filterExpanded.value,
      draftSelected.value.length,
      characterOptions.value.length,
      filteredCharacterOptions.value.length,
    ],
    () => updateOptionsScrollHeight(),
    { flush: 'post' },
  )

  onMounted(() => {
    updateOptionsScrollHeight()
  })

  defineExpose({
    refreshCharacterOptions,
    loadMoreCharacterOptions,
    syncDraftFromModel,
    updateOptionsScrollHeight,
  })
</script>

<style scoped lang="scss">
  .character-picker-panel {
    height: 100%;
    min-height: 0;
    background: #f6f7fb;
    display: flex;
    flex-direction: column;
  }

  .picker-body {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .section-card {
    margin: 24rpx;
    border-radius: 24rpx;
    background: #fff;
    box-shadow: 0 10rpx 30rpx rgba(15, 23, 42, 0.06);
    overflow: hidden;
    flex-shrink: 0;
  }

  .search-card {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
    padding: 24rpx 24rpx 0;
  }

  .section-title {
    display: block;
    color: #111827;
    font-size: 30rpx;
    font-weight: 800;
  }

  .section-tip {
    color: #667085;
    font-size: 22rpx;
    font-weight: 700;
  }

  .search-row {
    padding: 0 24rpx;
    margin: 20rpx 0;
  }

  .filter-shell {
    margin: 0 24rpx 20rpx;
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

  .selected-list {
    padding: 0 24rpx 24rpx;
  }

  .option-list {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
    padding: 0 24rpx 24rpx;
  }

  .options-scroll-wrap {
    overflow: hidden;
  }

  .options-scroll {
    height: 100%;
  }

  .option-card {
    display: flex;
    align-items: center;
    gap: 14rpx;
    padding: 18rpx;
    border-radius: 20rpx;
    background: #f8fafc;
  }

  .member-avatar {
    width: 72rpx;
    height: 72rpx;
    border-radius: 18rpx;
    background: #e5e7eb;
    flex-shrink: 0;
  }

  .member-avatar-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #7c3aed;
    font-weight: 800;
  }

  .member-info {
    min-width: 0;
    flex: 1;
  }

  .member-name,
  .member-extra {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .member-name {
    color: #111827;
    font-size: 26rpx;
    font-weight: 700;
  }

  .member-extra {
    min-height: 34rpx;
    margin-top: 8rpx;
    display: flex;
    flex-wrap: wrap;
    gap: 8rpx;
    align-items: center;
  }

  .member-meta-pill {
    max-width: 180rpx;
    min-height: 34rpx;
    padding: 4rpx 10rpx;
    border-radius: 999rpx;
    background: #eef2f7;
    color: #667085;
    font-size: 22rpx;
    line-height: 26rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .member-meta-element {
    display: inline-flex;
    align-items: center;
    padding-right: 12rpx;
  }

  .member-meta-fallback {
    color: #98a2b3;
    font-size: 22rpx;
  }

  .action-btn,
  .mini-btn,
  .footer-btn {
    border-radius: 999rpx;
    font-size: 24rpx;
    font-weight: 700;
  }

  .action-btn {
    color: #7c3aed;
  }

  .confirm-btn {
    background: #7c3aed;
    color: #fff;
  }

  .mini-btn.danger,
  .cancel-btn {
    color: #dc2626;
  }

  .empty-block {
    padding: 48rpx 28rpx;
    text-align: center;
    color: #667085;
    font-size: 28rpx;
  }

  .filter-empty-block {
    padding-top: 20rpx;
    padding-bottom: 20rpx;
  }

  .load-more {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 24rpx 24rpx;
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
  }

  .footer-btn {
    flex: 1;
  }
</style>
