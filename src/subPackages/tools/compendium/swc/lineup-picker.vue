<template>
  <PageLayout title="选择阵容" nav-init-bg-color="var(--theme-surface)" nav-divider>
    <view class="picker-page">
      <view class="toolbar-card">
        <SearchActionRow v-model="keyword" class="search-row" placeholder="搜索阵容名称或描述" theme="violet" @search="refreshList" />

        <view class="filter-group">
          <text class="filter-label">阵容类型</text>
          <scroll-view class="filter-scroll" scroll-x enable-flex>
            <view class="chip-row">
              <text
                v-for="option in typeOptions"
                :key="option.value || 'all'"
                class="chip"
                :class="{ active: selectedType === option.value }"
                @click="selectType(option.value)">
                {{ option.label }}
              </text>
            </view>
          </scroll-view>
        </view>

        <view class="filter-group">
          <view class="filter-head">
            <text class="filter-label">人物精准筛选</text>
            <text v-if="selectedCharacterFilters.length" class="filter-count">已选 {{ selectedCharacterFilters.length }}</text>
          </view>

          <SwcCharacterPickerSlots
            class="character-picker-slots"
            :characters="selectedCharacterViews"
            :max-count="0"
            :size="100"
            @add="openCharacterPicker"
            @remove="handleRemoveCharacterFilter" />
          <text class="filter-helper">阵容需同时包含全部所选人物</text>
          <button v-if="selectedCharacterFilters.length" class="clear-btn" size="mini" @click="clearCharacterFilters">清空人物筛选</button>
        </view>
      </view>

      <view class="context-tip">
        <text v-if="isRelationMode">正在为{{ relationSideLabel }}选择阵容，确认后返回上一页。</text>
        <text v-else>请选择一个阵容，确认后返回上一页。</text>
      </view>

      <StateBlock v-if="loading && !options.length" class="state-block" text="加载阵容中..." />
      <StateBlock
        v-else-if="errorMessage && !options.length"
        class="state-block"
        :text="errorMessage"
        action-text="重试"
        theme="violet"
        @action="refreshList" />
      <StateBlock v-else-if="!options.length" class="state-block" text="暂无符合条件的阵容" />

      <view v-else class="option-list">
        <view
          v-for="option in options"
          :key="option.id"
          class="option-card"
          :class="{ selected: selectedLineup?.id === option.id }"
          @click="toggleSelection(option)">
          <view class="option-head">
            <view class="option-title-wrap">
              <text class="option-name">{{ option.name || '未命名阵容' }}</text>
              <text v-if="option.type" class="option-type">{{ getLineupTypeLabel(option.type) }}</text>
            </view>
            <view class="option-check" :class="{ checked: selectedLineup?.id === option.id }">
              <text v-if="selectedLineup?.id === option.id">✓</text>
            </view>
          </view>
          <text v-if="option.description" class="option-desc">{{ option.description }}</text>
          <SwcLineup
            v-if="option.characters.length"
            class="option-lineup"
            :characters="toMemberViews(option.characters)"
            :columns="5"
            :avatar-size="72"
            :show-member-name="false"
            :show-family="false"
            :show-stars="true"
            :show-element="true"
            empty-text="暂无成员" />
          <text v-else class="option-empty">暂无成员信息</text>
        </view>

        <view v-if="pagination.hasNext" class="load-more">
          <button class="load-more-btn" :loading="loadingMore" @click="loadMore">加载更多</button>
        </view>
        <view v-else class="end-tip">已展示全部阵容</view>
      </view>

      <view class="quick-create-card">
        <text class="quick-create-title">没有合适的阵容？</text>
        <text class="quick-create-desc">创建后会返回本页；若后端返回可识别的新阵容 ID，将自动选中。</text>
        <button class="quick-create-btn" @click="goCreate">快捷创建阵容</button>
      </view>

      <view class="footer-bar">
        <text class="footer-selected">{{ selectedLineup ? `已选：${selectedLineup.name || '未命名阵容'}` : '尚未选择阵容' }}</text>
        <button class="footer-cancel" @click="handleCancel">取消</button>
        <button class="footer-confirm" :disabled="!selectedLineup" @click="handleConfirm">确认选择</button>
      </view>
    </view>
  </PageLayout>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { onLoad, onReachBottom, onShow } from '@dcloudio/uni-app'
  import SearchActionRow from './components/search-action-row.vue'
  import StateBlock from './components/state-block.vue'
  import SwcCharacterPickerSlots from './components/swc-character-picker-slots.vue'
  import SwcLineup from './components/swc-lineup.vue'
  import { getLineupTypeLabel, LINEUP_TYPE_OPTIONS, LINEUP_TYPE_PRESET_OPTIONS, ALL_VALUE } from './lineup-meta'
  import type { CharacterOption, LineupCharacterPreview, PaginationState, UserLineupSummary } from './lineup-types'
  import { normalizeUserLineupListResult } from './lineup-normalizers'
  import { toSwcCharacterView, type SwcCharacterView } from './utils'
  import { buildAnonymousRequestConfig } from './request-options'
  import { getCompendiumsLineups } from '@/services/apifox/NODEJSDEMO/COMPENDIUMLINEUPS/apifox'
  import type { getCompendiumsLineupsQuery } from '@/services/apifox/NODEJSDEMO/COMPENDIUMLINEUPS/interface'
  import { getStorageSync, removeStorageSync, setStorageSync } from '@/utils/storage'

  type PickerMode = 'lineup' | 'relation'
  type RelationSide = 'defense' | 'offense'

  const COMPENDIUM_CODE = 'swc'
  const DEFAULT_LOCALE = 'zh-CN'
  const PAGE_SIZE = 20
  const CHARACTER_PICKER_CACHE_KEY = 'compendium:swc:lineup-picker:character-picker:draft'
  const CHARACTER_PICKER_RESULT_KEY = 'compendium:swc:lineup-picker:character-picker:result'
  const DEFAULT_RESULT_KEY = 'compendium:swc:lineup-picker:result'

  const selectedLocale = ref(DEFAULT_LOCALE)
  const pickerMode = ref<PickerMode>('lineup')
  const relationSide = ref<RelationSide>('defense')
  const requiredType = ref('')
  const returnKey = ref(DEFAULT_RESULT_KEY)
  const initialSelectedId = ref('')
  const keyword = ref('')
  const selectedType = ref(ALL_VALUE)
  const selectedCharacterFilters = ref<CharacterOption[]>([])
  const options = ref<UserLineupSummary[]>([])
  const selectedLineup = ref<UserLineupSummary | null>(null)
  const pagination = ref<PaginationState>({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0, hasNext: false, hasPrev: false })
  const loading = ref(false)
  const loadingMore = ref(false)
  const errorMessage = ref('')

  const isRelationMode = computed(() => pickerMode.value === 'relation')
  const relationSideLabel = computed(() => (relationSide.value === 'offense' ? '进攻阵容' : '防守阵容'))
  const selectedCharacterViews = computed<SwcCharacterView[]>(() => selectedCharacterFilters.value.map(item => toSwcCharacterView(item)))
  const typeOptions = computed(() => {
    if (requiredType.value) return [{ label: getLineupTypeLabel(requiredType.value), value: requiredType.value }]
    const seen = new Set<string>()
    const result: Array<{ label: string; value: string }> = [{ label: '全部', value: ALL_VALUE }]
    ;[...LINEUP_TYPE_OPTIONS, ...LINEUP_TYPE_PRESET_OPTIONS].forEach(option => {
      if (!option.value || seen.has(option.value)) return
      seen.add(option.value)
      result.push({ label: option.label, value: option.value })
    })
    return result
  })

  const decodeOption = (value?: string): string => {
    if (!value) return ''
    try {
      return decodeURIComponent(value)
    } catch {
      return value
    }
  }

  const toMemberViews = (characters: LineupCharacterPreview[]) => characters.map(item => toSwcCharacterView(item))

  const createCharacterFilter = (characterId: string): CharacterOption => ({
    id: characterId,
    characterId,
    name: characterId,
    label: characterId,
    avatar: '',
    element: '',
    elementKey: '',
    elementName: '',
    archetype: '',
    familyKey: '',
    familyName: '',
    awaken: '',
    awakenName: '',
    stars: '',
    status: 'enabled',
  })

  const selectedCharacterIds = computed(() => selectedCharacterFilters.value.map(item => item.characterId).filter(Boolean))

  const buildQuery = (page: number): getCompendiumsLineupsQuery => {
    const query: getCompendiumsLineupsQuery = {
      compendiumId: COMPENDIUM_CODE,
      locale: selectedLocale.value,
      status: 'enabled',
      page,
      pageSize: PAGE_SIZE,
      sortBy: 'updatedAt',
      sortOrder: 'desc',
    }
    const text = keyword.value.trim()
    if (text) query.keyword = text
    if (selectedType.value) query.type = selectedType.value
    if (selectedCharacterIds.value.length === 1) query.characterId = selectedCharacterIds.value[0]
    if (selectedCharacterIds.value.length > 1) query.characterIds = selectedCharacterIds.value.join(',')
    return query
  }

  const refreshList = async () => {
    if (loading.value) return
    loading.value = true
    loadingMore.value = false
    errorMessage.value = ''
    try {
      const result = normalizeUserLineupListResult(await getCompendiumsLineups(buildQuery(1), buildAnonymousRequestConfig()))
      options.value = result.items
      const limit = result.pagination.limit || PAGE_SIZE
      pagination.value = {
        ...result.pagination,
        page: 1,
        limit,
        hasNext: result.pagination.hasNext || result.items.length >= limit,
      }
      if (initialSelectedId.value) {
        selectedLineup.value = result.items.find(item => item.id === initialSelectedId.value) || selectedLineup.value
      }
    } catch (error) {
      errorMessage.value = typeof error === 'string' ? error : '加载阵容失败，请稍后重试'
      options.value = []
    } finally {
      loading.value = false
    }
  }

  const loadMore = async () => {
    if (loading.value || loadingMore.value || !pagination.value.hasNext) return
    loadingMore.value = true
    try {
      const nextPage = pagination.value.page + 1
      const result = normalizeUserLineupListResult(await getCompendiumsLineups(buildQuery(nextPage), buildAnonymousRequestConfig()))
      options.value = [...options.value, ...result.items]
      const limit = result.pagination.limit || PAGE_SIZE
      pagination.value = {
        ...result.pagination,
        page: nextPage,
        limit,
        hasNext: result.pagination.hasNext || result.items.length >= limit,
      }
      if (initialSelectedId.value && !selectedLineup.value) {
        selectedLineup.value = result.items.find(item => item.id === initialSelectedId.value) || null
      }
    } catch (error) {
      uni.showToast({ title: typeof error === 'string' ? error : '加载更多失败', icon: 'none' })
    } finally {
      loadingMore.value = false
    }
  }

  const selectType = (value: string) => {
    if (requiredType.value && value !== requiredType.value) return
    if (selectedType.value === value) return
    selectedType.value = value
    void refreshList()
  }

  const toggleSelection = (option: UserLineupSummary) => {
    selectedLineup.value = selectedLineup.value?.id === option.id ? null : option
  }

  const clearCharacterFilters = () => {
    selectedCharacterFilters.value = []
    void refreshList()
  }

  const handleRemoveCharacterFilter = (character: { characterId: string }) => {
    selectedCharacterFilters.value = selectedCharacterFilters.value.filter(item => item.characterId !== character.characterId)
    void refreshList()
  }

  const openCharacterPicker = () => {
    setStorageSync(
      CHARACTER_PICKER_CACHE_KEY,
      selectedCharacterFilters.value.map(item => ({ ...item })),
    )
    removeStorageSync(CHARACTER_PICKER_RESULT_KEY)
    uni.navigateTo({
      url:
        `/subPackages/tools/compendium/swc/character-picker?compendiumId=${encodeURIComponent(COMPENDIUM_CODE)}` +
        `&locale=${encodeURIComponent(selectedLocale.value)}` +
        `&cacheKey=${encodeURIComponent(CHARACTER_PICKER_CACHE_KEY)}` +
        `&resultKey=${encodeURIComponent(CHARACTER_PICKER_RESULT_KEY)}` +
        '&maxCount=0',
    })
  }

  const checkCharacterPickerResult = () => {
    const result = getStorageSync(CHARACTER_PICKER_RESULT_KEY)
    if (!Array.isArray(result)) return
    selectedCharacterFilters.value = result.map((item: CharacterOption) => ({ ...item }))
    removeStorageSync(CHARACTER_PICKER_RESULT_KEY)
    void refreshList()
  }

  const readReturnedLineup = () => {
    const result = getStorageSync(returnKey.value)
    if (!result || typeof result !== 'object') return
    const record = result as { side?: RelationSide; lineup?: UserLineupSummary; selectedLineup?: UserLineupSummary }
    const lineup = record.lineup || record.selectedLineup
    if (!lineup || typeof lineup !== 'object' || !lineup.id) return
    if (isRelationMode.value && record.side && record.side !== relationSide.value) return
    selectedLineup.value = lineup
    removeStorageSync(returnKey.value)
  }

  const goCreate = () => {
    const params = [
      `compendiumId=${encodeURIComponent(COMPENDIUM_CODE)}`,
      `locale=${encodeURIComponent(selectedLocale.value)}`,
      'returnMode=lineup-picker',
      `returnKey=${encodeURIComponent(returnKey.value)}`,
      `presetType=${encodeURIComponent(requiredType.value || selectedType.value || (relationSide.value === 'offense' ? '竞技场进攻' : '竞技场防守'))}`,
      `lockType=${encodeURIComponent(requiredType.value || isRelationMode.value ? '1' : '0')}`,
    ]
    if (isRelationMode.value) params.push(`returnSide=${encodeURIComponent(relationSide.value)}`)
    uni.navigateTo({ url: `/subPackages/tools/compendium/swc/lineup-edit?${params.join('&')}` })
  }

  const handleCancel = () => uni.navigateBack()

  const handleConfirm = () => {
    if (!selectedLineup.value) return
    if (isRelationMode.value) {
      setStorageSync(returnKey.value, { side: relationSide.value, lineup: selectedLineup.value })
    } else {
      setStorageSync(returnKey.value, { lineup: selectedLineup.value, selectedLineup: selectedLineup.value })
    }
    uni.navigateBack()
  }

  onLoad((options: Record<string, string | undefined>) => {
    selectedLocale.value = decodeOption(options.locale) || DEFAULT_LOCALE
    pickerMode.value = decodeOption(options.mode) === 'relation' ? 'relation' : 'lineup'
    relationSide.value = decodeOption(options.relationSide || options.returnSide) === 'offense' ? 'offense' : 'defense'
    const routeReturnKey = decodeOption(options.resultKey || options.returnKey)
    returnKey.value = routeReturnKey || DEFAULT_RESULT_KEY
    if (!routeReturnKey) removeStorageSync(DEFAULT_RESULT_KEY)
    keyword.value = decodeOption(options.keyword)
    const routeType = decodeOption(options.type)
    requiredType.value = decodeOption(options.requiredType)
    selectedType.value = requiredType.value || (routeType === 'all' ? ALL_VALUE : routeType)
    initialSelectedId.value = decodeOption(options.selectedId || options.selectedLineupId)
    const ids = decodeOption(options.characterIds || options.selectedCharacterIds)
      .split(',')
      .map(item => item.trim())
      .filter(Boolean)
    selectedCharacterFilters.value = ids.map(createCharacterFilter)
    uni.setNavigationBarTitle({ title: isRelationMode.value ? `选择${relationSideLabel.value}` : '选择阵容' })
    void refreshList()
  })

  onShow(() => {
    checkCharacterPickerResult()
    readReturnedLineup()
  })

  onReachBottom(() => {
    void loadMore()
  })
</script>

<style scoped lang="scss">
  .picker-page {
    min-height: 100vh;
    padding: 16rpx 24rpx 180rpx;
    background: var(--theme-bg);
  }

  .toolbar-card,
  .quick-create-card,
  .option-card {
    border: 1rpx solid var(--theme-border);
    border-radius: 22rpx;
    background: var(--theme-surface);
  }

  .toolbar-card {
    padding: 22rpx;
  }

  .search-row {
    margin-bottom: 22rpx;
  }

  .filter-group + .filter-group {
    margin-top: 22rpx;
  }

  .filter-label,
  .filter-count {
    color: var(--theme-text);
    font-size: 26rpx;
    font-weight: 800;
  }

  .filter-head,
  .option-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12rpx;
  }

  .filter-count {
    color: var(--theme-text-secondary);
    font-size: 22rpx;
  }

  .filter-scroll {
    width: 100%;
    margin-top: 14rpx;
    white-space: nowrap;
  }

  .chip-row {
    display: inline-flex;
    gap: 12rpx;
  }

  .chip {
    display: inline-flex;
    padding: 12rpx 20rpx;
    border-radius: 999rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text-secondary);
    font-size: 22rpx;
    font-weight: 700;
  }

  .chip.active {
    background: var(--theme-brand);
    color: #fff;
  }

  .character-picker-slots {
    margin-top: 14rpx;
  }

  .filter-helper,
  .context-tip,
  .option-empty,
  .end-tip {
    display: block;
    color: var(--theme-text-tertiary);
    font-size: 22rpx;
    line-height: 1.5;
  }

  .filter-helper {
    margin-top: 12rpx;
  }

  .clear-btn {
    margin: 14rpx 0 0;
    border-radius: 999rpx;
    color: var(--theme-text-secondary);
  }

  .context-tip {
    padding: 18rpx 4rpx;
  }

  .state-block {
    padding: 50rpx 20rpx;
    text-align: center;
  }

  .option-list {
    display: grid;
    gap: 16rpx;
  }

  .option-card {
    padding: 20rpx;
  }

  .option-card.selected {
    border-color: var(--theme-brand);
    background: rgba(124, 58, 237, 0.06);
  }

  .option-title-wrap {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
    gap: 10rpx;
  }

  .option-name {
    min-width: 0;
    color: var(--theme-text);
    font-size: 28rpx;
    font-weight: 800;
    word-break: break-word;
  }

  .option-type {
    flex-shrink: 0;
    padding: 4rpx 10rpx;
    border-radius: 999rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text-secondary);
    font-size: 20rpx;
  }

  .option-check {
    width: 38rpx;
    height: 38rpx;
    border: 2rpx solid var(--theme-border);
    border-radius: 50%;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26rpx;
    font-weight: 800;
  }

  .option-check.checked {
    border-color: var(--theme-brand);
    background: var(--theme-brand);
  }

  .option-desc {
    display: block;
    margin-top: 12rpx;
    color: var(--theme-text-secondary);
    font-size: 22rpx;
    line-height: 1.55;
  }

  .option-lineup {
    margin-top: 16rpx;
  }

  .option-empty {
    margin-top: 12rpx;
  }

  .load-more {
    padding: 8rpx 0;
  }

  .load-more-btn,
  .quick-create-btn {
    border-radius: 999rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text);
    font-size: 24rpx;
  }

  .end-tip {
    padding: 16rpx;
    text-align: center;
  }

  .quick-create-card {
    margin-top: 20rpx;
    padding: 22rpx;
  }

  .quick-create-title {
    display: block;
    color: var(--theme-text);
    font-size: 26rpx;
    font-weight: 800;
  }

  .quick-create-desc {
    display: block;
    margin-top: 8rpx;
    color: var(--theme-text-tertiary);
    font-size: 22rpx;
    line-height: 1.5;
  }

  .quick-create-btn {
    margin: 16rpx 0 0;
    background: var(--theme-brand);
    color: #fff;
  }

  .footer-bar {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 12rpx;
    padding: 18rpx 24rpx calc(18rpx + env(safe-area-inset-bottom));
    background: var(--theme-surface);
    box-shadow: 0 -8rpx 22rpx rgba(15, 23, 42, 0.08);
  }

  .footer-selected {
    flex: 1;
    min-width: 0;
    color: var(--theme-text-secondary);
    font-size: 22rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .footer-cancel,
  .footer-confirm {
    margin: 0;
    border-radius: 999rpx;
    font-size: 24rpx;
    font-weight: 700;
  }

  .footer-cancel {
    color: var(--theme-text-secondary);
  }

  .footer-confirm {
    background: var(--theme-brand);
    color: #fff;
  }

  .footer-confirm[disabled] {
    opacity: 0.45;
  }
</style>
