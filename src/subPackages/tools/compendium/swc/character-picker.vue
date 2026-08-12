<template>
  <PageLayout title="选择筛选魔灵" nav-init-bg-color="var(--theme-surface)" nav-divider>
    <view class="character-picker-page">
      <view class="search-section">
        <SearchActionRow v-model="keyword" class="search-row" placeholder="输入人物名称或 code" theme="violet" @search="onSearchSubmit" />

        <view class="filter-shell">
          <view v-if="!filterExpanded" class="filter-collapsed" @click="filterExpanded = true">
            <text class="filter-icon" :class="{ active: hasActiveFilters }">⚙</text>
            <scroll-view v-if="activeFilterTags.length" class="filter-tags-scroll" scroll-x enable-flex>
              <view class="filter-tags-row">
                <text v-for="tag in activeFilterTags" :key="tag" class="filter-tag">{{ tag }}</text>
              </view>
            </scroll-view>
            <text v-else class="filter-hint">默认展示觉醒魔灵，按星级排序</text>
            <text class="filter-expand-arrow">▼</text>
          </view>

          <view v-else class="filter-expanded">
            <view class="filter-header">
              <text class="filter-title">更多筛选</text>
              <text v-if="hasActiveFilters" class="filter-reset" @click.stop="resetFilters">重置</text>
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
                    @click="selectFilter('element', option.value)">
                    <SwcElementBadge
                      v-if="option.value !== ALL_VALUE"
                      :element-key="option.value"
                      :label="option.label"
                      :size="22"
                      :font-size="22"
                      :gap="6" />
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
                    @click="selectFilter('awaken', option.value)">
                    <text>{{ option.label }}</text>
                  </view>
                </view>
              </scroll-view>
            </view>

            <view class="filter-section">
              <text class="filter-label">类型</text>
              <scroll-view class="filter-scroll" scroll-x enable-flex>
                <view class="filter-chip-row">
                  <view
                    v-for="option in typeOptions"
                    :key="option.value"
                    class="quick-chip"
                    :class="{ selected: option.value === selectedType }"
                    @click="selectFilter('type', option.value)">
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
                    @click="selectFilter('star', option.value)">
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

      <StateBlock v-if="loading && !characters.length" class="state-block" text="加载人物中..." />

      <StateBlock
        v-else-if="errorMessage && !characters.length"
        class="state-block"
        :text="errorMessage"
        action-text="重试"
        theme="violet"
        @action="refreshCharacters" />

      <StateBlock v-else-if="!characters.length && !loading" class="state-block" :text="emptyText" />

      <scroll-view v-else class="grid-scroll" scroll-y :lower-threshold="160" enable-back-to-top @scrolltolower="handleScrollToLower">
        <view class="grid-wrap">
          <view
            v-for="character in characters"
            :key="character.characterId"
            class="grid-item"
            :class="{ selected: selectedIndexById.has(character.characterId) }"
            @tap="toggleSelect(character)">
            <SwcAvatarFrame class="grid-avatar" :src="character.avatar" :name="character.name" :size="92" />
            <view v-if="selectedIndexById.has(character.characterId)" class="grid-selected-badge">
              <text>{{ selectedIndexById.get(character.characterId) }}</text>
            </view>
          </view>
        </view>

        <view v-if="loadingMore" class="load-more">
          <text class="load-more-text">加载更多中...</text>
        </view>
        <view v-else-if="characters.length && !canLoadMore" class="load-more">
          <text class="load-more-text muted">没有更多了</text>
        </view>
      </scroll-view>

      <view class="footer-bar">
        <view class="footer-selected-info">
          <text class="footer-count">
            {{ maxCount > 0 ? `已选 ${draftSelected.length}/${maxCount}` : `已选 ${draftSelected.length}` }}
          </text>
        </view>
        <button class="footer-cancel-btn" @click="handleCancel">取消</button>
        <button class="footer-confirm-btn" @click="handleConfirm">确认选择</button>
      </view>
    </view>
  </PageLayout>
</template>

<script setup lang="ts">
  import { computed, nextTick, ref, watch } from 'vue'
  import { onLoad, onReachBottom, onUnload } from '@dcloudio/uni-app'
  import SearchActionRow from './components/search-action-row.vue'
  import SwcAvatarFrame from './components/swc-avatar-frame.vue'
  import SwcElementBadge from './components/swc-element-badge.vue'
  import StateBlock from './components/state-block.vue'
  import { getCachedSwcCharacterPage } from './composables/swc-character-cache'
  import type { CharacterOption } from './lineup-types'
  import { toSwcCharacterView, type SwcCharacterView } from './utils'
  import { getCompendiumsCharacters } from '@/services/apifox/NODEJSDEMO/COMPENDIUMS/apifox'
  import type { getCompendiumsCharactersQuery, getCompendiumsCharactersRes } from '@/services/apifox/NODEJSDEMO/COMPENDIUMS/interface'
  import { getStorageSync, setStorageSync } from '@/utils/storage'
  import { preloadAvatars, resolveAvatar } from '@/utils/avatar-cache'

  type FilterKey = 'element' | 'star' | 'type' | 'awaken'
  type SortOrder = 'asc' | 'desc'
  type RecordValue = string | number | boolean | null | undefined | Record<string, unknown> | unknown[]
  type CompendiumCharactersQueryParams = getCompendiumsCharactersQuery &
    Record<string, string | number | undefined> & {
      'categories[awaken]'?: string
      'categories[element]'?: string
      'categories[archetype]'?: string
      'categories[entry_type]'?: string
    }

  interface FilterOption {
    label: string
    value: string
  }

  interface CharacterCategory {
    key: string
    name: string
    valueKey: string
    value: string
  }

  interface CharacterAttribute {
    key: string
    name: string
    value: string
    displayValue: string
    unit: string
  }

  interface PaginationLike {
    hasNext?: boolean
    hasNextPage?: boolean
    page?: number
    limit?: number
    pageSize?: number
    total?: number
    totalResults?: number
    totalPages?: number
  }

  const ALL_VALUE = 'all'
  const PAGE_SIZE = 100
  const RENDER_BATCH_SIZE = 50
  const INITIAL_AVATAR_PRELOAD_COUNT = 16
  const DEFAULT_SORT_FIELD = 'stars'
  const DEFAULT_SORT_ORDER: SortOrder = 'desc'
  const DEFAULT_LOCALE = 'zh-CN'
  const DEFAULT_COMPENDIUM_ID = 'swc'
  const SEARCH_DEBOUNCE_MS = 300

  const elementOptions: FilterOption[] = [
    { label: '全部', value: ALL_VALUE },
    { label: '火', value: 'fire' },
    { label: '水', value: 'water' },
    { label: '风', value: 'wind' },
    { label: '光', value: 'light' },
    { label: '暗', value: 'dark' },
  ]

  const starOptions: FilterOption[] = [
    { label: '全部', value: ALL_VALUE },
    { label: '5★', value: '5' },
    { label: '4★', value: '4' },
    { label: '3★', value: '3' },
    { label: '2★', value: '2' },
    { label: '1★', value: '1' },
  ]

  const typeOptions: FilterOption[] = [
    { label: '全部', value: ALL_VALUE },
    { label: '攻击', value: 'attack' },
    { label: '防御', value: 'defense' },
    { label: '体力', value: 'hp' },
    { label: '辅助', value: 'support' },
  ]

  // 与 list 一致默认觉醒；另提供“全部”以便不传 awaken 条件
  const awakenOptions: FilterOption[] = [
    { label: '全部', value: ALL_VALUE },
    { label: '觉醒', value: 'awakened' },
    { label: '未觉醒', value: 'unawakened' },
    { label: 'Boss', value: 'boss' },
  ]

  const compendiumId = ref(DEFAULT_COMPENDIUM_ID)
  const selectedLocale = ref(DEFAULT_LOCALE)
  const maxCount = ref(0)
  const keyword = ref('')
  const filterExpanded = ref(false)
  const selectedElement = ref(ALL_VALUE)
  const selectedStar = ref(ALL_VALUE)
  const selectedType = ref(ALL_VALUE)
  const selectedAwaken = ref('awakened')
  const selectedSort = ref(DEFAULT_SORT_FIELD)
  const selectedSortOrder = ref<SortOrder>(DEFAULT_SORT_ORDER)
  const allCharacters = ref<SwcCharacterView[]>([])
  const characters = ref<SwcCharacterView[]>([])
  const renderedCount = ref(0)
  const draftSelected = ref<CharacterOption[]>([])
  const page = ref(1)
  const hasNext = ref(true)
  const loading = ref(false)
  const loadingMore = ref(false)
  const errorMessage = ref('')
  const cacheKey = ref('compendium:swc:lineup-edit:picker-draft')
  const resultKey = ref('compendium:swc:lineup-edit:picker-result')
  let requestSequence = 0
  let avatarPreloadTimer: ReturnType<typeof setTimeout> | null = null
  let searchTimer: ReturnType<typeof setTimeout> | null = null
  let suppressKeywordWatch = false
  const hasBufferedCharacters = computed(() => characters.value.length < allCharacters.value.length)
  const canLoadMore = computed(() => hasBufferedCharacters.value || hasNext.value)

  const hasActiveFilters = computed(
    () =>
      Boolean(keyword.value.trim()) ||
      selectedElement.value !== ALL_VALUE ||
      selectedStar.value !== ALL_VALUE ||
      selectedType.value !== ALL_VALUE ||
      selectedAwaken.value !== 'awakened',
  )

  const activeFilterTags = computed<string[]>(() => {
    const tags: string[] = []
    if (keyword.value.trim()) tags.push(`关键词:${keyword.value.trim()}`)
    if (selectedElement.value !== ALL_VALUE) {
      const label = elementOptions.find(o => o.value === selectedElement.value)?.label
      if (label) tags.push(label)
    }
    if (selectedAwaken.value !== 'awakened') {
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

  const emptyText = computed(() => {
    const kw = keyword.value.trim()
    if (kw) return `没有找到“${kw}”相关人物`
    if (hasActiveFilters.value) return '暂无符合当前筛选条件的人物'
    return '暂无人物'
  })

  const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value)

  const readRecordValue = (record: Record<string, unknown>, key: string): RecordValue => record[key] as RecordValue

  const stringifyValue = (value: RecordValue): string => {
    if (typeof value === 'string') return value.trim()
    if (typeof value === 'number') return String(value)
    if (typeof value === 'boolean') return value ? '是' : '否'
    return ''
  }

  const readString = (record: Record<string, unknown>, keys: string[]): string => {
    for (const key of keys) {
      const text = stringifyValue(readRecordValue(record, key))
      if (text) return text
    }
    return ''
  }

  const readArray = (record: Record<string, unknown>, keys: string[]): unknown[] => {
    for (const key of keys) {
      const value = record[key]
      if (Array.isArray(value)) return value
    }
    return []
  }

  const readPagination = (record: Record<string, unknown>): PaginationLike => {
    const pagination = record.pagination
    if (isRecord(pagination)) return pagination as PaginationLike
    return {}
  }

  const normalizeCategory = (source: unknown): CharacterCategory | null => {
    if (!isRecord(source)) return null
    return {
      key: readString(source, ['key']),
      name: readString(source, ['name']),
      valueKey: readString(source, ['valueKey']),
      value: readString(source, ['value']),
    }
  }

  const normalizeAttribute = (source: unknown): CharacterAttribute | null => {
    if (!isRecord(source)) return null
    return {
      key: readString(source, ['key']),
      name: readString(source, ['name']),
      value: readString(source, ['value']),
      displayValue: readString(source, ['displayValue']),
      unit: readString(source, ['unit']),
    }
  }

  const getCategoryValue = (categories: CharacterCategory[], key: string): string =>
    categories.find(category => category.key === key)?.value || ''

  const getCategoryValueKey = (categories: CharacterCategory[], key: string): string =>
    categories.find(category => category.key === key)?.valueKey || ''

  const normalizeElementKey = (value: string): string => {
    const map: Record<string, string> = {
      火: 'fire',
      水: 'water',
      风: 'wind',
      光: 'light',
      暗: 'dark',
    }
    return map[value] || value
  }

  const getAttribute = (attributes: CharacterAttribute[], key: string): CharacterAttribute | undefined =>
    attributes.find(attribute => attribute.key === key || attribute.name === key)

  const formatAttribute = (attributes: CharacterAttribute[], key: string): string => {
    const attribute = getAttribute(attributes, key)
    if (!attribute) return ''
    const value = attribute.displayValue || attribute.value
    return value ? `${value}${attribute.unit || ''}` : ''
  }

  const normalizeUrl = (url: string): string => {
    if (!url) return ''
    if (url.startsWith('http://')) return url.replace(/^http:/, 'https:')
    return url
  }

  // 对齐 list.vue 的人物 normalize
  const normalizeCharacter = (source: unknown): SwcCharacterView | null => {
    if (!isRecord(source)) return null

    const nestedCharacter = ['representative', 'representativeCharacter', 'character', 'item'].map(key => source[key]).find(isRecord)
    const characterSource = nestedCharacter || source
    const groupSource = isRecord(source.group) ? source.group : null

    const id = readString(characterSource, ['id', 'characterId', 'code', '_id'])
    if (!id) return null

    const categories = readArray(characterSource, ['categories'])
      .map(normalizeCategory)
      .filter((item): item is CharacterCategory => Boolean(item))
    const attributes = readArray(characterSource, ['attributes'])
      .map(normalizeAttribute)
      .filter((item): item is CharacterAttribute => Boolean(item))
    const elementKey = normalizeElementKey(getCategoryValueKey(categories, 'element') || readString(characterSource, ['element']))
    const elementName = getCategoryValue(categories, 'element') || readString(characterSource, ['elementName'])
    const stars = formatAttribute(attributes, 'stars') || readString(characterSource, ['level', 'star', 'rarity'])
    const awaken = getCategoryValue(categories, 'awaken') || readString(characterSource, ['awaken', 'awakening', 'awakened'])
    const avatar = readString(characterSource, ['avatar', 'icon', 'image', 'cover', 'portrait'])
    const groupFamily =
      stringifyValue(source.group as RecordValue) ||
      readString(source, ['groupValue', 'groupName', 'familyName']) ||
      (groupSource ? readString(groupSource, ['value', 'name', 'label', 'key']) : '')

    return toSwcCharacterView({
      characterId: id,
      name: readString(characterSource, ['name', 'title']),
      avatar: normalizeUrl(avatar),
      elementKey,
      elementName,
      familyName: getCategoryValue(categories, 'family') || groupFamily,
      archetype: getCategoryValue(categories, 'archetype') || readString(characterSource, ['speciesType', 'type']),
      stars: stars.replace(/星$/, ''),
      awaken,
    })
  }

  const extractItems = (res: getCompendiumsCharactersRes): unknown[] => {
    if (Array.isArray(res)) return res
    if (!isRecord(res)) return []

    const directItems = readArray(res, ['items', 'list', 'records', 'data'])
    if (directItems.length) return directItems

    const nestedData = res.data
    if (isRecord(nestedData)) return readArray(nestedData, ['items', 'list', 'records'])
    return []
  }

  const getSortField = (value: string): string => {
    const map: Record<string, string> = {
      [ALL_VALUE]: DEFAULT_SORT_FIELD,
      stars: 'stars',
    }
    return map[value] || DEFAULT_SORT_FIELD
  }

  const buildCharactersSortBy = (value: string, order: SortOrder): string => {
    const field = getSortField(value)
    const direction: SortOrder = value === ALL_VALUE ? DEFAULT_SORT_ORDER : order
    return `${field}:${direction},code:desc`
  }

  const buildCharacterQuery = (pageNo: number): CompendiumCharactersQueryParams => {
    const query: CompendiumCharactersQueryParams = {
      compendiumId: compendiumId.value,
      locale: selectedLocale.value,
      page: pageNo,
      pageSize: PAGE_SIZE,
      sortBy: buildCharactersSortBy(selectedSort.value, selectedSortOrder.value),
    }

    const keywordText = keyword.value.trim()
    if (keywordText) query.keyword = keywordText

    // 与 list.vue 一致：形态走服务端 categories
    if (selectedAwaken.value === 'boss') {
      query['categories[entry_type]'] = 'boss'
    } else if (selectedAwaken.value !== ALL_VALUE) {
      query['categories[awaken]'] = selectedAwaken.value
    }

    if (selectedElement.value !== ALL_VALUE) {
      query['categories[element]'] = selectedElement.value
    }

    if (selectedType.value !== ALL_VALUE) {
      query['categories[archetype]'] = selectedType.value
    }

    if (selectedStar.value !== ALL_VALUE) {
      query.attribute = 'stars'
      query.minValue = Number(selectedStar.value)
      query.maxValue = Number(selectedStar.value)
    }

    return query
  }

  const toCharacterOption = (character: SwcCharacterView): CharacterOption => ({
    id: character.characterId,
    characterId: character.characterId,
    name: character.name,
    label: character.name,
    avatar: character.avatar,
    element: character.elementKey,
    elementKey: character.elementKey,
    elementName: character.elementName,
    archetype: character.archetype,
    familyKey: '',
    familyName: character.familyName,
    awaken: character.awaken,
    awakenName: character.awaken,
    stars: character.stars,
    status: 'enabled',
  })

  // 人物进入列表时解析一次头像，避免每次选中状态变化都重新扫描本地缓存。
  const resolveCardAvatar = (character: SwcCharacterView): SwcCharacterView => ({
    ...character,
    avatar: resolveAvatar(character.avatar) || character.avatar,
  })

  const selectedIndexById = computed(() => new Map(draftSelected.value.map((item, index) => [item.characterId, index + 1])))

  const resolveHasNext = (pagination: PaginationLike, itemCount: number): boolean => {
    if (typeof pagination.hasNext === 'boolean') return pagination.hasNext
    if (typeof pagination.hasNextPage === 'boolean') return pagination.hasNextPage
    if (typeof pagination.totalPages === 'number' && typeof pagination.page === 'number') {
      return pagination.page < pagination.totalPages
    }
    return itemCount >= PAGE_SIZE
  }

  const toggleSelect = (character: SwcCharacterView) => {
    if (selectedIndexById.value.has(character.characterId)) {
      draftSelected.value = draftSelected.value.filter(item => item.characterId !== character.characterId)
      return
    }
    if (maxCount.value > 0 && draftSelected.value.length >= maxCount.value) {
      uni.showToast({ title: `最多选择 ${maxCount.value} 个魔灵`, icon: 'none' })
      return
    }
    draftSelected.value = [...draftSelected.value, toCharacterOption(character)]
  }

  const mergeUniqueCharacters = (base: SwcCharacterView[], next: SwcCharacterView[]): SwcCharacterView[] => {
    const seen = new Set(base.map(item => item.characterId))
    const merged = [...base]
    next.forEach(item => {
      if (!item.characterId || seen.has(item.characterId)) return
      seen.add(item.characterId)
      merged.push(item)
    })
    return merged
  }

  const syncRenderedCharacters = () => {
    characters.value = allCharacters.value.slice(0, renderedCount.value)
  }

  const revealNextRenderBatch = (): boolean => {
    if (!hasBufferedCharacters.value) return false
    renderedCount.value = Math.min(allCharacters.value.length, renderedCount.value + RENDER_BATCH_SIZE)
    syncRenderedCharacters()
    return true
  }

  const clearScheduledAvatarPreload = () => {
    if (!avatarPreloadTimer) return
    clearTimeout(avatarPreloadTimer)
    avatarPreloadTimer = null
  }

  const scheduleInitialAvatarPreload = (items: SwcCharacterView[], requestId: number) => {
    const urls = items
      .slice(0, INITIAL_AVATAR_PRELOAD_COUNT)
      .map(item => item.avatar)
      .filter(Boolean)
    if (!urls.length) return

    void nextTick().then(() => {
      if (requestId !== requestSequence) return
      clearScheduledAvatarPreload()
      avatarPreloadTimer = setTimeout(() => {
        avatarPreloadTimer = null
        if (requestId !== requestSequence) return
        void preloadAvatars(urls)
      }, 0)
    })
  }

  const fetchCharacters = async (reset = false) => {
    if (loading.value && !reset) return
    if (loadingMore.value && !reset) return
    if (!reset && !hasNext.value) return

    const requestId = reset ? ++requestSequence : requestSequence
    if (reset) {
      clearScheduledAvatarPreload()
      loading.value = true
      loadingMore.value = false
      errorMessage.value = ''
      page.value = 1
      hasNext.value = true
      allCharacters.value = []
      characters.value = []
      renderedCount.value = 0
    } else {
      loadingMore.value = true
    }

    try {
      const queryPage = reset ? 1 : page.value
      const result = await getCachedSwcCharacterPage(buildCharacterQuery(queryPage), async () => {
        const res = await getCompendiumsCharacters(buildCharacterQuery(queryPage))
        const items = extractItems(res)
          .map(normalizeCharacter)
          .filter((item): item is SwcCharacterView => Boolean(item))

        const pagination = isRecord(res) ? readPagination(res) : {}
        return {
          items,
          pagination: {
            page: pagination.page || queryPage,
            limit: pagination.limit || pagination.pageSize || PAGE_SIZE,
            total: pagination.total || pagination.totalResults || 0,
            totalPages: pagination.totalPages || 0,
            hasNext: resolveHasNext(pagination, items.length),
            hasPrev: Boolean(pagination.page && pagination.page > 1),
          },
        }
      })
      if (requestId !== requestSequence) return

      const displayItems = result.items.map(resolveCardAvatar)
      allCharacters.value = reset ? mergeUniqueCharacters([], displayItems) : mergeUniqueCharacters(allCharacters.value, displayItems)
      renderedCount.value = reset
        ? Math.min(RENDER_BATCH_SIZE, allCharacters.value.length)
        : Math.min(allCharacters.value.length, renderedCount.value + RENDER_BATCH_SIZE)
      syncRenderedCharacters()
      hasNext.value = result.pagination.hasNext
      page.value = queryPage + 1
      if (reset) scheduleInitialAvatarPreload(result.items, requestId)
    } catch (error) {
      if (requestId !== requestSequence) return
      errorMessage.value = typeof error === 'string' ? error : '人物加载失败，请稍后重试'
      if (reset) {
        allCharacters.value = []
        characters.value = []
        renderedCount.value = 0
      }
    } finally {
      if (requestId === requestSequence) {
        loading.value = false
        loadingMore.value = false
      }
    }
  }

  const refreshCharacters = () => {
    void fetchCharacters(true)
  }

  const loadMore = () => {
    if (revealNextRenderBatch()) return
    void fetchCharacters(false)
  }

  const handleScrollToLower = () => {
    if (!loading.value && !loadingMore.value && canLoadMore.value) loadMore()
  }

  const selectFilter = (key: FilterKey, value: string) => {
    if (key === 'element') selectedElement.value = value
    if (key === 'star') selectedStar.value = value
    if (key === 'type') selectedType.value = value
    if (key === 'awaken') selectedAwaken.value = value
    refreshCharacters()
  }

  const resetFilters = () => {
    suppressKeywordWatch = true
    keyword.value = ''
    selectedElement.value = ALL_VALUE
    selectedStar.value = ALL_VALUE
    selectedType.value = ALL_VALUE
    selectedAwaken.value = 'awakened'
    selectedSort.value = DEFAULT_SORT_FIELD
    selectedSortOrder.value = DEFAULT_SORT_ORDER
    suppressKeywordWatch = false
    refreshCharacters()
  }

  const onSearchSubmit = () => {
    if (searchTimer) {
      clearTimeout(searchTimer)
      searchTimer = null
    }
    refreshCharacters()
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

  watch(keyword, () => {
    if (suppressKeywordWatch) return
    if (searchTimer) clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
      searchTimer = null
      refreshCharacters()
    }, SEARCH_DEBOUNCE_MS)
  })

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

    refreshCharacters()
  })

  onReachBottom(() => {
    if (!loading.value && !loadingMore.value && canLoadMore.value) loadMore()
  })

  onUnload(() => {
    // 使在途列表请求失效，避免页面销毁后回写 state
    requestSequence += 1
    clearScheduledAvatarPreload()
    if (searchTimer) {
      clearTimeout(searchTimer)
      searchTimer = null
    }
  })
</script>

<style scoped lang="scss">
  .character-picker-page {
    min-height: 100vh;
    background: var(--theme-bg);
    display: flex;
    flex-direction: column;
    padding-bottom: 120rpx;
  }

  .search-section {
    flex-shrink: 0;
    padding: 16rpx 16rpx 0;
  }

  .search-row {
    margin-bottom: 12rpx;
  }

  .filter-shell {
    margin-bottom: 12rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 16rpx;
    background: var(--theme-surface-2);
    overflow: hidden;
  }

  .filter-collapsed {
    display: flex;
    align-items: center;
    gap: 10rpx;
    padding: 12rpx 14rpx;
  }

  .filter-icon {
    color: var(--theme-text-tertiary);
    font-size: 26rpx;
  }

  .filter-icon.active {
    color: var(--theme-brand);
  }

  .filter-tags-scroll {
    flex: 1;
    min-width: 0;
    white-space: nowrap;
  }

  .filter-tags-row {
    display: inline-flex;
    gap: 8rpx;
  }

  .filter-tag {
    padding: 4rpx 12rpx;
    border-radius: 999rpx;
    background: var(--theme-surface);
    color: var(--theme-text-secondary);
    font-size: 20rpx;
    font-weight: 700;
  }

  .filter-hint {
    flex: 1;
    color: var(--theme-text-tertiary);
    font-size: 20rpx;
  }

  .filter-expand-arrow {
    color: var(--theme-text-tertiary);
    font-size: 20rpx;
  }

  .filter-expanded {
    padding: 12rpx 14rpx 8rpx;
  }

  .filter-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10rpx;
  }

  .filter-title {
    color: var(--theme-text);
    font-size: 24rpx;
    font-weight: 800;
  }

  .filter-reset {
    color: var(--theme-brand);
    font-size: 22rpx;
    font-weight: 700;
  }

  .filter-section {
    margin-bottom: 12rpx;
  }

  .filter-label {
    display: block;
    margin-bottom: 8rpx;
    color: var(--theme-text-secondary);
    font-size: 20rpx;
    font-weight: 700;
  }

  .filter-scroll {
    white-space: nowrap;
  }

  .filter-chip-row {
    display: inline-flex;
    gap: 10rpx;
  }

  .quick-chip {
    min-height: 48rpx;
    padding: 0 14rpx;
    border-radius: 999rpx;
    border: 1rpx solid var(--theme-border);
    background: var(--theme-surface);
    color: var(--theme-text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20rpx;
    font-weight: 700;
  }

  .quick-chip.selected {
    border-color: var(--theme-brand);
    color: var(--theme-brand);
    background: rgba(124, 58, 237, 0.1);
  }

  .filter-collapse-bar {
    padding: 4rpx 0;
    text-align: center;
  }

  .filter-collapse-text {
    color: var(--theme-text-tertiary);
    font-size: 20rpx;
  }

  .state-block {
    margin: 32rpx 20rpx;
  }

  .grid-scroll {
    flex: 1;
    min-height: 0;
    box-sizing: border-box;
  }

  .grid-wrap {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 10rpx;
    padding: 12rpx 12rpx 152rpx;
  }

  .grid-item {
    position: relative;
    min-width: 0;
    height: 92rpx;
    border: 2rpx solid var(--theme-border);
    border-radius: 12rpx;
    box-sizing: border-box;
    overflow: hidden;
    background: var(--theme-surface-2);
  }

  .grid-item.selected {
    border-color: var(--theme-brand);
    box-shadow: 0 0 0 2rpx rgba(124, 58, 237, 0.35);
  }

  .grid-avatar {
    width: 100%;
    height: 100%;
    display: block;
  }

  .grid-avatar-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 24rpx;
    font-weight: 800;
    background: var(--theme-surface-2);
  }

  .grid-selected-badge {
    position: absolute;
    top: 4rpx;
    right: 4rpx;
    z-index: 2;
    min-width: 30rpx;
    height: 30rpx;
    padding: 0 6rpx;
    border-radius: 999rpx;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--theme-brand);
    color: #fff;
    font-size: 20rpx;
    font-weight: 800;
    line-height: 1;
  }

  .load-more {
    padding: 8rpx 0 24rpx;
    text-align: center;
  }

  .load-more-text {
    color: var(--theme-text-secondary);
    font-size: 20rpx;
  }

  .load-more-text.muted {
    color: var(--theme-text-tertiary);
  }

  .footer-bar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 20;
    display: flex;
    align-items: center;
    gap: 10rpx;
    padding: 12rpx 16rpx calc(12rpx + env(safe-area-inset-bottom));
    background: var(--theme-surface);
    border-top: 1rpx solid var(--theme-border);
  }

  .footer-selected-info {
    flex: 1;
    min-width: 0;
  }

  .footer-count {
    color: var(--theme-text);
    font-size: 22rpx;
    font-weight: 800;
  }

  .footer-cancel-btn,
  .footer-confirm-btn {
    margin: 0;
    min-width: 120rpx;
    height: 64rpx;
    line-height: 64rpx;
    border-radius: 999rpx;
    font-size: 22rpx;
    font-weight: 700;
  }

  .footer-cancel-btn {
    background: var(--theme-surface-2);
    color: var(--theme-text-secondary);
    border: 1rpx solid var(--theme-border);
  }

  .footer-confirm-btn {
    background: var(--theme-brand);
    color: #fff;
    border: none;
  }
</style>
