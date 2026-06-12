<template>
  <view class="compendium-page">
    <view class="filter-shell">
      <view class="filter-header">
        <text class="filter-title">快速筛选</text>
        <text v-if="hasActiveFilters" class="filter-reset" @click="resetFilters">重置</text>
      </view>

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
              <text>{{ option.label }}</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>

    <view v-if="loading && characters.length === 0" class="state-block">
      <text>加载魔灵中...</text>
    </view>

    <view v-else-if="errorMessage" class="state-block">
      <text>{{ errorMessage }}</text>
      <button class="retry-btn" @click="refreshCharacters">重试</button>
    </view>

    <view v-else-if="characters.length === 0" class="state-block">
      <text>{{ emptyText }}</text>
    </view>

    <view v-else class="character-grid">
      <view
        v-for="character in characters"
        :key="character.id"
        class="character-card"
        :class="'card-element-' + character.elementKey"
        @click="goToDetail(character)">
        <view class="avatar-wrap">
          <image v-if="character.avatar" class="avatar" :src="character.avatar" mode="aspectFill" lazy-load />
          <view v-else class="avatar-placeholder">
            <text>{{ character.name.slice(0, 1) || '?' }}</text>
          </view>
          <text v-if="character.stars" class="stars">{{ character.stars }}★</text>
          <view v-if="character.isFavorite" class="favorite-badge">★</view>
        </view>
        <view class="character-info">
          <text class="character-name">{{ character.name || '未知魔灵' }}</text>
          <view class="meta-row">
            <!-- <text v-if="character.code" class="meta-chip">No.{{ character.code }}</text> -->
            <text v-if="character.archetype" class="meta-chip">{{ character.archetype }}</text>
            <text v-if="character.family" class="meta-chip">{{ character.family }}</text>
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
  import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
  import { getCompendiumsCharacters } from '@/services/apifox/NODEJSDEMO/COMPENDIUMS/apifox'
  import type { getCompendiumsCharactersQuery, getCompendiumsCharactersRes } from '@/services/apifox/NODEJSDEMO/COMPENDIUMS/interface'

  type FilterKey = 'element' | 'star' | 'type' | 'sort'
  type RecordValue = string | number | boolean | null | undefined | Record<string, unknown> | unknown[]

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
    { label: '1★', value: '1' },
    { label: '2★', value: '2' },
    { label: '3★', value: '3' },
    { label: '4★', value: '4' },
    { label: '5★', value: '5' },
  ]

  const typeOptions: FilterOption[] = [
    { label: '全部', value: ALL_VALUE },
    { label: '攻击', value: 'attack' },
    { label: '防御', value: 'defense' },
    { label: '体力', value: 'hp' },
    { label: '辅助', value: 'support' },
  ]

  const sortOptions: FilterOption[] = [
    { label: '默认', value: ALL_VALUE },
    { label: '图鉴倒序', value: 'reverse' },
    { label: '体力↓', value: 'hp_desc' },
    { label: '攻击力↓', value: 'attack_desc' },
    { label: '防御力↓', value: 'defense_desc' },
    { label: '速度↓', value: 'speed_desc' },
    { label: '体力↑', value: 'hp_asc' },
    { label: '攻击力↑', value: 'attack_asc' },
    { label: '防御力↑', value: 'defense_asc' },
    { label: '速度↑', value: 'speed_asc' },
    { label: '二觉优先', value: 'second_awaken' },
    { label: '浏览热度', value: 'popularity' },
  ]

  const selectedElement = ref(ALL_VALUE)
  const selectedStar = ref(ALL_VALUE)
  const selectedType = ref(ALL_VALUE)
  const selectedSort = ref(ALL_VALUE)
  const characters = ref<CharacterCard[]>([])
  const favoriteIds = ref<string[]>([])
  const page = ref(1)
  const hasNext = ref(true)
  const loading = ref(false)
  const errorMessage = ref('')

  const hasActiveFilters = computed(
    () =>
      selectedElement.value !== ALL_VALUE ||
      selectedStar.value !== ALL_VALUE ||
      selectedType.value !== ALL_VALUE ||
      selectedSort.value !== ALL_VALUE,
  )
  const emptyText = computed(() => '暂无符合条件的魔灵')

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

    const id = readString(source, ['id', 'characterId', 'code'])
    if (!id) return null

    const categories = readArray(source, ['categories'])
      .map(normalizeCategory)
      .filter((item): item is CharacterCategory => Boolean(item))
    const attributes = readArray(source, ['attributes'])
      .map(normalizeAttribute)
      .filter((item): item is CharacterAttribute => Boolean(item))
    const elementKey = normalizeElementKey(getCategoryValueKey(categories, 'element') || readString(source, ['element']))
    const elementName = getCategoryValue(categories, 'element') || readString(source, ['elementName'])
    const stars = formatAttribute(attributes, 'stars') || readString(source, ['level', 'star', 'rarity'])
    const avatar = readString(source, ['avatar', 'icon', 'image', 'cover', 'portrait'])

    return {
      id,
      name: readString(source, ['name', 'title']),
      code: readString(source, ['code']),
      avatar: normalizeUrl(avatar),
      elementKey,
      elementName,
      level: readString(source, ['level']),
      stars: stars.replace(/星$/, ''),
      archetype: getCategoryValue(categories, 'archetype') || readString(source, ['speciesType', 'type']),
      family: getCategoryValue(categories, 'family'),
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

  const buildQuery = (): getCompendiumsCharactersQuery => {
    const query: getCompendiumsCharactersQuery = {
      compendiumId: COMPENDIUM_CODE,
      page: page.value,
      pageSize: PAGE_SIZE,
    }

    if (selectedElement.value !== ALL_VALUE) {
      query.element = selectedElement.value
    }

    if (selectedType.value !== ALL_VALUE) {
      query.speciesType = selectedType.value
    }

    if (selectedStar.value !== ALL_VALUE) {
      query.attribute = 'stars'
      query.minValue = Number(selectedStar.value)
      query.maxValue = Number(selectedStar.value)
    }

    const [sortBy, sortOrder] = getSortParams(selectedSort.value)
    if (sortBy) query.sortBy = sortBy
    if (sortOrder) query.sortOrder = sortOrder

    return query
  }

  const getSortParams = (value: string): [string, string] => {
    const map: Record<string, [string, string]> = {
      [ALL_VALUE]: ['', ''],
      reverse: ['sortOrder', 'desc'],
      hp_desc: ['hp', 'desc'],
      attack_desc: ['attack', 'desc'],
      defense_desc: ['defense', 'desc'],
      speed_desc: ['speed', 'desc'],
      hp_asc: ['hp', 'asc'],
      attack_asc: ['attack', 'asc'],
      defense_asc: ['defense', 'asc'],
      speed_asc: ['speed', 'asc'],
      second_awaken: ['secondAwakenPriority', 'desc'],
      popularity: ['viewCount', 'desc'],
    }
    return map[value] || map[ALL_VALUE]
  }

  const fetchCharacters = async (reset = false) => {
    if (loading.value) return
    if (!reset && !hasNext.value) return

    loading.value = true
    errorMessage.value = ''

    if (reset) {
      page.value = 1
      hasNext.value = true
    }

    try {
      favoriteIds.value = readFavoriteIds()
      const res = await getCompendiumsCharacters(buildQuery())
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
      errorMessage.value = typeof error === 'string' ? error : '图鉴加载失败，请稍后重试'
    } finally {
      loading.value = false
      uni.stopPullDownRefresh()
    }
  }

  const refreshCharacters = () => {
    fetchCharacters(true)
  }

  const selectFilter = (key: FilterKey, value: string) => {
    if (key === 'element') selectedElement.value = value
    if (key === 'star') selectedStar.value = value
    if (key === 'type') selectedType.value = value
    if (key === 'sort') selectedSort.value = value
    refreshCharacters()
  }

  const resetFilters = () => {
    selectedElement.value = ALL_VALUE
    selectedStar.value = ALL_VALUE
    selectedType.value = ALL_VALUE
    selectedSort.value = ALL_VALUE
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

  .character-card {
    min-width: 0;
    background: #f7f8fb;
    border: 2rpx solid rgba(255, 255, 255, 0.36);
    border-radius: 18rpx;
    color: #fff;
    overflow: hidden;
    box-shadow: 0 6rpx 18rpx rgba(31, 43, 66, 0.08);
  }

  .card-element-fire {
    background: rgba(219, 68, 55, 0.78);
  }

  .card-element-water {
    background: rgba(47, 128, 237, 0.78);
  }

  .card-element-wind {
    background: rgba(36, 154, 104, 0.78);
  }

  .card-element-light {
    background: rgba(255, 238, 171, 0.92);
    color: #121a26;
  }

  .card-element-dark {
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

  .stars {
    position: absolute;
    left: 8rpx;
    top: 8rpx;
    min-width: 46rpx;
    padding: 4rpx 10rpx;
    border-radius: 999rpx;
    background: rgba(255, 255, 255, 0.2);
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
