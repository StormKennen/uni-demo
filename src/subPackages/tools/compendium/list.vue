<template>
  <view class="compendium-page">
    <view class="filter-shell">
      <!-- <view class="filter-header">
        <text class="filter-title">{{ isFamilyMode ? '物种图鉴' : '快速筛选' }}</text>
        <text v-if="hasActiveFilters" class="filter-reset" @click="resetFilters">重置</text>
      </view> -->

      <view class="filter-section">
        <text class="filter-label">属性</text>
        <scroll-view class="filter-scroll" scroll-x enable-flex>
          <view class="filter-chip-row">
            <view
              v-for="option in elementOptions"
              :key="option.value"
              class="quick-chip element-chip"
              :class="[{ selected: option.value === selectedElement }, option.value !== ALL_VALUE ? 'element-filter-' + option.value : '']"
              @click="selectFilter('element', option.value)">
              <text v-if="option.value !== ALL_VALUE" class="element-dot"></text>
              <text>{{ option.label }}</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- <view v-if="isFamilyMode" class="family-mode-tip">
        <text>筛选和排序基于代表魔灵，每个物种展示一张卡片</text>
      </view> -->

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

      <view class="filter-section">
        <text class="filter-label">排序</text>
        <scroll-view class="filter-scroll" scroll-x enable-flex>
          <view class="filter-chip-row">
            <view
              v-for="option in sortOptions"
              :key="option.value"
              class="quick-chip"
              :class="{ selected: option.value === selectedSort }"
              @click="selectFilter('sort', option.value)">
              <text>{{ getSortOptionLabel(option) }}</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>

    <view v-if="loading && characters.length === 0" class="state-block">
      <text>{{ isFamilyMode ? '加载物种中...' : '加载魔灵中...' }}</text>
    </view>

    <view v-else-if="errorMessage" class="state-block">
      <text>{{ errorMessage }}</text>
      <button class="retry-btn" @click="refreshCharacters">重试</button>
    </view>

    <view v-else-if="characters.length === 0" class="state-block">
      <text>{{ emptyText }}</text>
    </view>

    <view v-else class="character-grid" :class="{ 'family-grid': isFamilyMode }">
      <view
        v-for="character in characters"
        :key="character.id"
        class="character-card"
        :class="['card-element-' + character.elementKey, { 'family-card': isFamilyMode }]"
        @click="goToDetail(character)">
        <view class="avatar-wrap">
          <image v-if="character.avatar" class="avatar" :src="character.avatar" mode="aspectFill" lazy-load />
          <view v-else class="avatar-placeholder">
            <text>{{ character.name.slice(0, 1) || '?' }}</text>
          </view>
          <text v-if="character.stars" class="stars">{{ character.stars }}★</text>
          <!-- <text v-if="isFamilyMode" class="family-badge">物种</text> -->
          <!-- <view v-if="!isFamilyMode && character.isFavorite" class="favorite-badge">★</view> -->
        </view>
        <view class="character-info">
          <text class="character-name">
            {{ isFamilyMode ? character.family || character.name || '未知物种' : character.name || '未知魔灵' }}
          </text>
          <view v-if="isFamilyMode" class="representative-row">
            <text class="representative-label">代表魔灵</text>
            <text class="representative-name">{{ character.name || '未知魔灵' }}</text>
          </view>
          <view v-else class="meta-row">
            <!-- <text v-if="character.code" class="meta-chip">No.{{ character.code }}</text> -->
            <text v-if="character.archetype" class="meta-chip">{{ character.archetype }}</text>
            <text v-if="character.family" class="meta-chip">{{ character.family }}</text>
          </view>
          <view v-if="isFamilyMode" class="meta-row family-meta-row">
            <text v-if="character.elementName" class="meta-chip">{{ character.elementName }}</text>
            <text v-if="character.archetype" class="meta-chip">{{ character.archetype }}</text>
          </view>
          <!-- <view class="stat-row">
            <view v-for="stat in character.stats" :key="stat.key" class="mini-stat">
              <text class="mini-stat-label">{{ stat.label }}</text>
              <text class="mini-stat-value">{{ stat.value }}</text>
            </view>
          </view> -->
        </view>
      </view>
    </view>

    <view v-if="loading && characters.length > 0" class="load-more">继续加载...</view>
    <view v-else-if="!hasNext && characters.length > 0" class="load-more muted">没有更多了</view>
  </view>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { onLoad, onPullDownRefresh, onReachBottom, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
  import { getCompendiumsCharacters } from '@/services/apifox/NODEJSDEMO/COMPENDIUMS/apifox'
  import type { getCompendiumsCharactersQuery, getCompendiumsCharactersRes } from '@/services/apifox/NODEJSDEMO/COMPENDIUMS/interface'

  type FilterKey = 'element' | 'star' | 'type' | 'sort'
  type SortOrder = 'asc' | 'desc'
  type RecordValue = string | number | boolean | null | undefined | Record<string, unknown> | unknown[]
  type CompendiumCharactersQueryParams = getCompendiumsCharactersQuery & {
    'categories[awaken]'?: string
    'categories[element]'?: string
    'categories[archetype]'?: string
  }

  interface FilterOption {
    label: string
    value: string
  }

  interface CharacterCard {
    id: string
    name: string
    code: string
    avatar: string
    elementKey: string
    elementName: string
    level: string
    stars: string
    archetype: string
    family: string
    stats: CharacterStat[]
    isFavorite: boolean
  }

  interface CharacterStat {
    key: string
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
    totalPages?: number
  }

  const COMPENDIUM_CODE = 'swc'
  const ALL_VALUE = 'all'
  const PAGE_SIZE = 40
  const FAVORITE_KEY = `compendium:${COMPENDIUM_CODE}:favoriteCharacters`
  const DEFAULT_SORT_FIELD = 'stars'
  const DEFAULT_SORT_ORDER: SortOrder = 'desc'

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

  const sortOptions: FilterOption[] = [
    // { label: '全部', value: ALL_VALUE },
    { label: '星级', value: 'stars' },
    { label: '体力', value: 'hp' },
    { label: '攻击力', value: 'attack' },
    { label: '防御力', value: 'defense' },
    { label: '速度', value: 'speed' },
    { label: '暴击率', value: 'critRate' },
    { label: '暴击伤害', value: 'critDamage' },
    { label: '效果命中', value: 'accuracy' },
    { label: '效果抵抗', value: 'resistance' },
    // { label: '二觉优先', value: 'second_awaken' },
    // { label: '浏览热度', value: 'popularity' },
  ]

  const selectedElement = ref(ALL_VALUE)
  const selectedStar = ref(ALL_VALUE)
  const selectedType = ref(ALL_VALUE)
  const selectedSort = ref(DEFAULT_SORT_FIELD)
  const selectedSortOrder = ref<SortOrder>(DEFAULT_SORT_ORDER)
  const characters = ref<CharacterCard[]>([])
  const favoriteIds = ref<string[]>([])
  const page = ref(1)
  const hasNext = ref(true)
  const loading = ref(false)
  const errorMessage = ref('')
  let requestSequence = 0
  const isFamilyMode = computed(() => false) // computed(() => selectedElement.value === ALL_VALUE)

  const hasActiveFilters = computed(
    () =>
      selectedElement.value !== ALL_VALUE ||
      selectedStar.value !== ALL_VALUE ||
      selectedType.value !== ALL_VALUE ||
      selectedSort.value !== ALL_VALUE,
  )
  const emptyText = computed(() => (isFamilyMode.value ? '暂无物种数据' : '暂无符合条件的魔灵'))

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
      const value = readRecordValue(record, key)
      const text = stringifyValue(value)
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

  const readFavoriteIds = (): string[] => {
    const value = uni.getStorageSync(FAVORITE_KEY)
    return Array.isArray(value) ? value.filter(item => typeof item === 'string') : []
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

  const normalizeCharacter = (source: unknown): CharacterCard | null => {
    if (!isRecord(source)) return null

    const nestedCharacter = ['representative', 'representativeCharacter', 'character', 'item'].map(key => source[key]).find(isRecord)
    const characterSource = nestedCharacter || source
    const groupSource = isRecord(source.group) ? source.group : null

    const id = readString(characterSource, ['id', 'characterId', 'code'])
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
    const avatar = readString(characterSource, ['avatar', 'icon', 'image', 'cover', 'portrait'])
    const groupFamily =
      stringifyValue(source.group as RecordValue) ||
      readString(source, ['groupValue', 'groupName', 'familyName']) ||
      (groupSource ? readString(groupSource, ['value', 'name', 'label', 'key']) : '')

    return {
      id,
      name: readString(characterSource, ['name', 'title']),
      code: readString(characterSource, ['code']),
      avatar: normalizeUrl(avatar),
      elementKey,
      elementName,
      level: readString(characterSource, ['level']),
      stars: stars.replace(/星$/, ''),
      archetype: getCategoryValue(categories, 'archetype') || readString(characterSource, ['speciesType', 'type']),
      family: getCategoryValue(categories, 'family') || groupFamily,
      stats: [
        { key: 'hp', label: 'HP', value: formatAttribute(attributes, 'hp') },
        { key: 'attack', label: '攻', value: formatAttribute(attributes, 'attack') },
        { key: 'defense', label: '防', value: formatAttribute(attributes, 'defense') },
        { key: 'speed', label: '速', value: formatAttribute(attributes, 'speed') },
      ].filter(stat => Boolean(stat.value)),
      isFavorite: favoriteIds.value.includes(id),
    }
  }

  const normalizeUrl = (url: string): string => {
    if (!url) return ''
    if (url.startsWith('http://')) return url.replace(/^http:/, 'https:')
    return url
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

  const getSortOptionLabel = (option: FilterOption): string => {
    if (option.value === ALL_VALUE || selectedSort.value !== option.value) return option.label
    return `${option.label}${selectedSortOrder.value === 'desc' ? '↓' : '↑'}`
  }

  const buildQuery = (): CompendiumCharactersQueryParams => {
    const query: CompendiumCharactersQueryParams = {
      compendiumId: COMPENDIUM_CODE,
      page: page.value,
      pageSize: PAGE_SIZE,
      'categories[awaken]': 'awakened',
    }

    // if (isFamilyMode.value) {
    //   query.groupBy = 'family'
    // }

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

    if (isFamilyMode.value && selectedSort.value === ALL_VALUE) {
      query.sortBy = 'group'
      query.sortOrder = 'asc'
    } else {
      const [sortBy, sortOrder] = getSortParams(selectedSort.value, selectedSortOrder.value)
      query.sortBy = sortBy
      query.sortOrder = sortOrder
    }

    return query
  }

  const getSortParams = (value: string, order: SortOrder): [string, SortOrder] => {
    const map: Record<string, string> = {
      [ALL_VALUE]: DEFAULT_SORT_FIELD,
      stars: 'stars',
      hp: 'hp',
      attack: 'attack',
      defense: 'defense',
      speed: 'speed',
      critRate: 'critRate',
      critDamage: 'critDmg',
      accuracy: 'accuracy',
      resistance: 'resistance',
      second_awaken: 'secondAwakenPriority',
      popularity: 'viewCount',
    }
    const sortBy = map[value] || DEFAULT_SORT_FIELD
    return [sortBy, value === ALL_VALUE ? DEFAULT_SORT_ORDER : order]
  }

  const fetchCharacters = async (reset = false) => {
    if (loading.value && !reset) return
    if (!reset && !hasNext.value) return

    const requestId = reset ? ++requestSequence : requestSequence
    loading.value = true
    errorMessage.value = ''

    if (reset) {
      page.value = 1
      hasNext.value = true
      characters.value = []
    }

    try {
      favoriteIds.value = readFavoriteIds()
      const res = await getCompendiumsCharacters(buildQuery())
      if (requestId !== requestSequence) return

      const items = extractItems(res)
        .map(normalizeCharacter)
        .filter((item): item is CharacterCard => Boolean(item))

      characters.value = reset ? items : [...characters.value, ...items]

      const pagination = isRecord(res) ? readPagination(res) : {}
      hasNext.value = Boolean(
        pagination.hasNext ||
        pagination.hasNextPage ||
        (pagination.totalPages && pagination.page && pagination.page < pagination.totalPages) ||
        items.length >= PAGE_SIZE,
      )
      page.value += 1
    } catch (error) {
      if (requestId !== requestSequence) return
      errorMessage.value = typeof error === 'string' ? error : '图鉴加载失败，请稍后重试'
    } finally {
      if (requestId === requestSequence) {
        loading.value = false
        uni.stopPullDownRefresh()
      }
    }
  }

  const refreshCharacters = () => {
    fetchCharacters(true)
  }

  const selectFilter = (key: FilterKey, value: string) => {
    if (key === 'element') {
      selectedElement.value = value
    }
    if (key === 'star') selectedStar.value = value
    if (key === 'type') selectedType.value = value
    if (key === 'sort') {
      if (value === ALL_VALUE) {
        selectedSort.value = ALL_VALUE
        selectedSortOrder.value = DEFAULT_SORT_ORDER
      } else if (selectedSort.value === value) {
        selectedSortOrder.value = selectedSortOrder.value === 'desc' ? 'asc' : 'desc'
      } else {
        selectedSort.value = value
        selectedSortOrder.value = 'desc'
      }
    }
    refreshCharacters()
  }

  const resetFilters = () => {
    selectedElement.value = ALL_VALUE
    selectedStar.value = ALL_VALUE
    selectedType.value = ALL_VALUE
    selectedSort.value = ALL_VALUE
    selectedSortOrder.value = DEFAULT_SORT_ORDER
    refreshCharacters()
  }

  const goToDetail = (character: CharacterCard) => {
    const params = [
      `characterId=${encodeURIComponent(character.id)}`,
      `name=${encodeURIComponent(character.name)}`,
      `avatar=${encodeURIComponent(character.avatar)}`,
    ].join('&')
    uni.navigateTo({ url: `/subPackages/tools/compendium/detail?${params}` })
  }

  onLoad(() => {
    uni.setNavigationBarTitle({ title: '魔灵 wiki-图鉴' })
    fetchCharacters(true)
  })

  onPullDownRefresh(() => {
    refreshCharacters()
  })

  onReachBottom(() => {
    fetchCharacters()
  })

  // #ifdef MP-WEIXIN
  onShareAppMessage(() => ({
    title: '魔灵图鉴 · 凉白开工具箱',
    path: '/subPackages/tools/compendium/list',
  }))

  onShareTimeline(() => ({
    title: '魔灵图鉴 · 凉白开工具箱',
    query: '',
  }))
  // #endif
</script>

<style scoped lang="scss">
  .compendium-page {
    min-height: 100vh;
    background: #f7f8fb;
    color: #121a26;
  }

  .filter-shell {
    position: sticky;
    top: 0;
    z-index: 10;
    background: #fff;
    border-bottom: 1rpx solid #eef0f5;
    box-shadow: 0 8rpx 22rpx rgba(30, 42, 64, 0.06);
  }

  .filter-header {
    height: 64rpx;
    padding: 0 24rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .filter-title {
    color: #121a26;
    font-size: 26rpx;
    font-weight: 800;
  }

  .filter-reset {
    height: 44rpx;
    line-height: 44rpx;
    padding: 0 18rpx;
    border-radius: 999rpx;
    background: #f6f8fb;
    color: #667085;
    font-size: 24rpx;
    font-weight: 700;
  }

  .filter-section {
    display: flex;
    align-items: center;
    gap: 12rpx;
    padding: 0 0 14rpx 24rpx;
  }

  .family-mode-tip {
    padding: 0 24rpx 16rpx 92rpx;
    color: #8b94a4;
    font-size: 22rpx;
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
    padding-right: 24rpx;
  }

  .quick-chip {
    flex: none;
    height: 52rpx;
    padding: 0 20rpx;
    border: 1rpx solid #e7ebf2;
    border-radius: 999rpx;
    background: #f8fafc;
    color: #465164;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10rpx;
    font-size: 24rpx;
    font-weight: 700;
  }

  .quick-chip.selected {
    border-color: #121a26;
    background: #121a26;
    color: #fff;
  }

  .element-chip {
    padding-left: 14rpx;
  }

  .element-dot {
    width: 18rpx;
    height: 18rpx;
    border-radius: 50%;
    background: currentColor;
  }

  .element-filter-fire {
    color: #d94b3f;
  }

  .element-filter-water {
    color: #2f80ed;
  }

  .element-filter-wind {
    color: #249a68;
  }

  .element-filter-light {
    color: #b78a16;
  }

  .element-filter-dark {
    color: #2a2342;
  }

  .element-chip.selected {
    color: #fff;
  }

  .element-chip.selected .element-dot {
    background: #fff;
  }

  .element-filter-fire.selected {
    border-color: #d94b3f;
    background: #d94b3f;
  }

  .element-filter-water.selected {
    border-color: #2f80ed;
    background: #2f80ed;
  }

  .element-filter-wind.selected {
    border-color: #249a68;
    background: #249a68;
  }

  .element-filter-light.selected {
    border-color: #ffe9a3;
    background: #ffe9a3;
    color: #121a26;
  }

  .element-filter-light.selected .element-dot {
    background: #121a26;
  }

  .element-filter-dark.selected {
    border-color: #2a2342;
    background: #2a2342;
  }

  .character-grid {
    padding: 18rpx 18rpx 30rpx;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 18rpx;
  }

  .family-grid {
    padding-right: 30rpx;
    padding-bottom: 42rpx;
    gap: 28rpx 22rpx;
  }

  .character-card {
    min-width: 0;
    background: #f7f8fb;
    border: 2rpx solid rgba(255, 255, 255, 0.36);
    border-radius: 18rpx;
    color: #fff;
    overflow: hidden;
    box-shadow: 0 6rpx 18rpx rgba(31, 43, 66, 0.08);
  }

  .family-card {
    position: relative;
    z-index: 0;
    isolation: isolate;
    overflow: visible;
    margin-right: 10rpx;
    margin-bottom: 10rpx;
    box-shadow: 0 8rpx 22rpx rgba(31, 43, 66, 0.14);
  }

  .family-card::before,
  .family-card::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    border: 2rpx solid rgba(255, 255, 255, 0.52);
    border-radius: 18rpx;
    background: var(--family-stack-color, rgba(148, 163, 184, 0.46));
    pointer-events: none;
  }

  .family-card::before {
    transform: translate(6rpx, 6rpx);
    opacity: 0.72;
    box-shadow: 0 5rpx 12rpx rgba(31, 43, 66, 0.1);
  }

  .family-card::after {
    transform: translate(12rpx, 12rpx);
    opacity: 0.38;
    box-shadow: 0 6rpx 14rpx rgba(31, 43, 66, 0.08);
  }

  .family-card .avatar-wrap {
    border-radius: 16rpx 16rpx 0 0;
  }

  .family-card .character-info {
    position: relative;
    border-radius: 0 0 16rpx 16rpx;
    background: inherit;
  }

  .card-element-fire {
    --family-stack-color: rgba(219, 68, 55, 0.68);
    background: rgba(219, 68, 55, 0.78);
  }

  .card-element-water {
    --family-stack-color: rgba(47, 128, 237, 0.68);
    background: rgba(47, 128, 237, 0.78);
  }

  .card-element-wind {
    --family-stack-color: rgba(36, 154, 104, 0.68);
    background: rgba(36, 154, 104, 0.78);
  }

  .card-element-light {
    --family-stack-color: rgba(239, 205, 91, 0.7);
    background: rgba(255, 238, 171, 0.92);
    color: #121a26;
  }

  .card-element-dark {
    --family-stack-color: rgba(42, 35, 66, 0.72);
    background: rgba(42, 35, 66, 0.86);
  }

  .avatar-wrap {
    position: relative;
    width: 100%;
    height: 260rpx;
    background: rgba(255, 255, 255, 0.14);
    overflow: hidden;
  }

  .avatar,
  .avatar-placeholder {
    width: 100%;
    height: 100%;
  }

  .avatar-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    color: currentColor;
    font-size: 32rpx;
    font-weight: 700;
  }

  .favorite-badge {
    position: absolute;
    right: 4rpx;
    top: 4rpx;
    width: 32rpx;
    height: 32rpx;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.9);
    color: #f2bd24;
    font-size: 22rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .family-badge {
    position: absolute;
    right: 8rpx;
    top: 8rpx;
    padding: 4rpx 10rpx;
    border: 1rpx solid rgba(255, 255, 255, 0.42);
    border-radius: 999rpx;
    background: rgba(18, 26, 38, 0.54);
    color: #fff;
    font-size: 20rpx;
    font-weight: 800;
    letter-spacing: 2rpx;
  }

  .character-info {
    padding: 12rpx 14rpx 16rpx;
  }

  .character-name {
    display: block;
    min-width: 0;
    height: 44rpx;
    line-height: 44rpx;
    font-size: 30rpx;
    font-weight: 800;
    color: currentColor;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .representative-row {
    min-width: 0;
    height: 38rpx;
    margin-top: 4rpx;
    display: flex;
    align-items: center;
    gap: 8rpx;
  }

  .representative-label {
    flex: none;
    padding: 2rpx 8rpx;
    border-radius: 6rpx;
    background: rgba(255, 255, 255, 0.16);
    color: currentColor;
    font-size: 18rpx;
    font-weight: 700;
  }

  .representative-name {
    min-width: 0;
    color: currentColor;
    font-size: 22rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .stars {
    position: absolute;
    left: 8rpx;
    top: 8rpx;
    min-width: 46rpx;
    padding: 4rpx 10rpx;
    border-radius: 999rpx;
    background: rgba(255, 255, 255, 0.7);
    color: currentColor;
    font-size: 22rpx;
    font-weight: 900;
    text-align: center;
  }

  .card-element-light .stars {
    background: rgba(18, 26, 38, 0.08);
  }

  .meta-row {
    min-height: 44rpx;
    margin-top: 8rpx;
    display: flex;
    flex-wrap: wrap;
    gap: 8rpx;
  }

  .family-meta-row {
    margin-top: 4rpx;
  }

  .meta-chip {
    max-width: 150rpx;
    height: 36rpx;
    line-height: 36rpx;
    padding: 0 10rpx;
    border-radius: 8rpx;
    background: rgba(255, 255, 255, 0.16);
    color: currentColor;
    font-size: 22rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .stat-row {
    margin-top: 12rpx;
    padding-top: 12rpx;
    border-top: 1rpx solid rgba(255, 255, 255, 0.2);
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8rpx 12rpx;
  }

  .mini-stat {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8rpx;
    min-width: 0;
  }

  .mini-stat-label {
    color: currentColor;
    opacity: 0.72;
    font-size: 22rpx;
    font-weight: 700;
  }

  .mini-stat-value {
    min-width: 0;
    color: currentColor;
    font-size: 24rpx;
    font-weight: 800;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .card-element-light .meta-chip {
    background: rgba(18, 26, 38, 0.08);
  }

  .card-element-light .representative-label {
    background: rgba(18, 26, 38, 0.08);
  }

  .card-element-light .stat-row {
    border-top-color: rgba(18, 26, 38, 0.1);
  }

  .state-block {
    min-height: 520rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20rpx;
    color: #8b94a4;
    font-size: 28rpx;
  }

  .retry-btn {
    height: 68rpx;
    line-height: 68rpx;
    padding: 0 42rpx;
    border-radius: 999rpx;
    background: #667eea;
    color: #fff;
    font-size: 26rpx;
  }

  .load-more {
    padding: 24rpx 0 40rpx;
    text-align: center;
    color: #8b94a4;
    font-size: 24rpx;
  }

  .load-more.muted {
    color: #c0c6d0;
  }
</style>
