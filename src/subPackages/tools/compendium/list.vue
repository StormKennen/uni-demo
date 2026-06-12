<template>
  <view class="compendium-page">
    <view class="filter-bar">
      <view
        v-for="tab in filterTabs"
        :key="tab.key"
        class="filter-tab"
        :class="{ active: activePanel === tab.key }"
        @click="togglePanel(tab.key)">
        <text>{{ tab.label }}</text>
        <text v-if="tab.icon" class="tab-icon">{{ tab.icon }}</text>
      </view>
      <view class="filter-button" @click="resetFilters">
        <uni-icons type="filter" size="26" color="#121A26" />
      </view>
    </view>

    <view v-if="activePanel" class="filter-panel">
      <view class="option-grid">
        <view
          v-for="option in panelOptions"
          :key="option.value"
          class="filter-option"
          :class="{ selected: option.value === currentPanelValue }"
          @click="selectPanelOption(option.value)">
          <text>{{ option.label }}</text>
          <text v-if="option.icon" class="option-icon">{{ option.icon }}</text>
        </view>
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
      <view v-for="character in characters" :key="character.id" class="character-card" @click="goToDetail(character)">
        <view class="avatar-wrap">
          <image v-if="character.avatar" class="avatar" :src="character.avatar" mode="aspectFill" lazy-load />
          <view v-else class="avatar-placeholder">
            <text>{{ character.name.slice(0, 1) || '?' }}</text>
          </view>
          <view v-if="character.elementName" class="element-badge" :class="'element-' + character.elementKey">
            <text>{{ character.elementIcon }}</text>
            <text>{{ character.elementName }}</text>
          </view>
          <view v-if="character.isFavorite" class="favorite-badge">★</view>
        </view>
        <view class="character-info">
          <view class="name-row">
            <text class="character-name">{{ character.name || '未知魔灵' }}</text>
            <text v-if="character.stars" class="stars">{{ character.stars }}★</text>
          </view>
          <view class="meta-row">
            <text v-if="character.code" class="meta-chip">No.{{ character.code }}</text>
            <text v-if="character.archetype" class="meta-chip">{{ character.archetype }}</text>
            <text v-if="character.family" class="meta-chip">{{ character.family }}</text>
          </view>
          <view class="stat-row">
            <view v-for="stat in character.stats" :key="stat.key" class="mini-stat">
              <text class="mini-stat-label">{{ stat.label }}</text>
              <text class="mini-stat-value">{{ stat.value }}</text>
            </view>
          </view>
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

  type PanelKey = 'element' | 'star' | 'type' | 'sort'
  type RecordValue = string | number | boolean | null | undefined | Record<string, unknown> | unknown[]

  interface FilterOption {
    label: string
    value: string
    icon?: string
  }

  interface CharacterCard {
    id: string
    name: string
    code: string
    avatar: string
    elementKey: string
    elementName: string
    elementIcon: string
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
    { label: '全部属性', value: ALL_VALUE },
    { label: '火', value: 'fire', icon: '🔥' },
    { label: '水', value: 'water', icon: '🌊' },
    { label: '风', value: 'wind', icon: '🌪️' },
    { label: '光', value: 'light', icon: '🛡️' },
    { label: '暗', value: 'dark', icon: '🟣' },
  ]

  const starOptions: FilterOption[] = [
    { label: '全部星级', value: ALL_VALUE },
    { label: '1★', value: '1' },
    { label: '2★', value: '2' },
    { label: '3★', value: '3' },
    { label: '4★', value: '4' },
    { label: '5★', value: '5' },
  ]

  const typeOptions: FilterOption[] = [
    { label: '全部类型', value: ALL_VALUE },
    { label: '攻击型', value: 'attack' },
    { label: '防御型', value: 'defense' },
    { label: '体力型', value: 'hp' },
    { label: '辅助型', value: 'support' },
  ]

  const sortOptions: FilterOption[] = [
    { label: '默认排序', value: ALL_VALUE },
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

  const activePanel = ref<PanelKey | ''>('')
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

  const filterTabs = computed(() => [
    {
      key: 'element' as const,
      label: selectedElementLabel.value,
      icon: selectedElementIcon.value,
    },
    { key: 'star' as const, label: getOptionLabel(starOptions, selectedStar.value) },
    { key: 'type' as const, label: getOptionLabel(typeOptions, selectedType.value) },
    { key: 'sort' as const, label: getOptionLabel(sortOptions, selectedSort.value) },
  ])

  const panelOptions = computed(() => {
    if (activePanel.value === 'element') return elementOptions
    if (activePanel.value === 'star') return starOptions
    if (activePanel.value === 'type') return typeOptions
    if (activePanel.value === 'sort') return sortOptions
    return []
  })

  const currentPanelValue = computed(() => {
    if (activePanel.value === 'element') return selectedElement.value
    if (activePanel.value === 'star') return selectedStar.value
    if (activePanel.value === 'type') return selectedType.value
    if (activePanel.value === 'sort') return selectedSort.value
    return ''
  })

  const selectedElementLabel = computed(() => {
    const label = getOptionLabel(elementOptions, selectedElement.value)
    return selectedElement.value === ALL_VALUE ? label : `${label}属性`
  })

  const selectedElementIcon = computed(() => getOptionIcon(elementOptions, selectedElement.value))

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

  const getOptionLabel = (options: FilterOption[], value: string) => options.find(option => option.value === value)?.label || ''

  const getOptionIcon = (options: FilterOption[], value: string) => options.find(option => option.value === value)?.icon || ''

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

  const getAttribute = (attributes: CharacterAttribute[], key: string): CharacterAttribute | undefined =>
    attributes.find(attribute => attribute.key === key || attribute.name === key)

  const formatAttribute = (attributes: CharacterAttribute[], key: string): string => {
    const attribute = getAttribute(attributes, key)
    if (!attribute) return ''
    const value = attribute.displayValue || attribute.value
    return value ? `${value}${attribute.unit || ''}` : ''
  }

  const getElementIcon = (elementKey: string, elementName: string): string => {
    const key = elementKey || elementName
    const map: Record<string, string> = {
      fire: '🔥',
      火: '🔥',
      water: '🌊',
      水: '🌊',
      wind: '🌪️',
      风: '🌪️',
      light: '🛡️',
      光: '🛡️',
      dark: '🟣',
      暗: '🟣',
    }
    return map[key] || '✦'
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
    const elementKey = readString(source, ['element']) || getCategoryValueKey(categories, 'element')
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
      elementIcon: getElementIcon(elementKey, elementName),
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
    activePanel.value = ''
    fetchCharacters(true)
  }

  const togglePanel = (panel: PanelKey) => {
    activePanel.value = activePanel.value === panel ? '' : panel
  }

  const selectPanelOption = (value: string) => {
    if (activePanel.value === 'element') selectedElement.value = value
    if (activePanel.value === 'star') selectedStar.value = value
    if (activePanel.value === 'type') selectedType.value = value
    if (activePanel.value === 'sort') selectedSort.value = value
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

  .filter-bar {
    position: sticky;
    top: 0;
    z-index: 10;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr)) 74rpx;
    align-items: center;
    background: #fff;
    border-bottom: 1rpx solid #eef0f5;
  }

  .filter-tab {
    position: relative;
    min-width: 0;
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    padding: 0 10rpx;
    font-size: 28rpx;
    white-space: nowrap;
    border-right: 1rpx solid #eef0f5;
  }

  .filter-tab.active {
    color: #e8bd27;
  }

  .filter-tab.active::after {
    content: '';
    position: absolute;
    left: 18rpx;
    right: 18rpx;
    bottom: 0;
    height: 4rpx;
    background: #f2c72c;
    border-radius: 6rpx;
  }

  .tab-icon {
    font-size: 28rpx;
  }

  .filter-button {
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
  }

  .filter-panel {
    position: sticky;
    top: 88rpx;
    z-index: 9;
    padding: 18rpx 28rpx 22rpx;
    background: #fff;
    box-shadow: 0 10rpx 18rpx rgba(30, 42, 64, 0.08);
  }

  .option-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14rpx 18rpx;
  }

  .filter-option {
    height: 74rpx;
    border-radius: 12rpx;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    font-size: 28rpx;
    font-weight: 700;
    box-shadow: 0 2rpx 12rpx rgba(28, 37, 54, 0.18);
  }

  .filter-option.selected {
    color: #fff;
    background: #72b8f5;
    box-shadow: 0 2rpx 14rpx rgba(70, 149, 222, 0.28);
  }

  .option-icon {
    font-size: 28rpx;
  }

  .character-grid {
    padding: 18rpx 18rpx 30rpx;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18rpx;
  }

  .character-card {
    min-width: 0;
    background: #fff;
    border: 2rpx solid #eef0f5;
    border-radius: 18rpx;
    overflow: hidden;
    box-shadow: 0 6rpx 18rpx rgba(31, 43, 66, 0.08);
  }

  .avatar-wrap {
    position: relative;
    width: 100%;
    height: 260rpx;
    background: radial-gradient(circle at 50% 40%, #fff2c6 0%, #f5d283 48%, #d99a4c 100%);
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
    color: #bd6152;
    font-size: 32rpx;
    font-weight: 700;
  }

  .element-badge {
    position: absolute;
    left: 10rpx;
    top: 10rpx;
    min-width: 74rpx;
    height: 40rpx;
    padding: 0 12rpx;
    border-radius: 999rpx;
    background: rgba(255, 255, 255, 0.9);
    color: #344054;
    font-size: 22rpx;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4rpx;
  }

  .element-fire {
    color: #e9493f;
  }

  .element-water {
    color: #287ee6;
  }

  .element-wind {
    color: #22a06b;
  }

  .element-light {
    color: #d49915;
  }

  .element-dark {
    color: #6f42c1;
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

  .name-row {
    display: flex;
    align-items: center;
    gap: 8rpx;
  }

  .character-name {
    display: block;
    min-width: 0;
    flex: 1;
    height: 44rpx;
    line-height: 44rpx;
    font-size: 30rpx;
    font-weight: 800;
    color: #161b25;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .stars {
    flex: none;
    padding: 3rpx 10rpx;
    border-radius: 999rpx;
    background: #fff4d6;
    color: #d28a00;
    font-size: 22rpx;
    font-weight: 900;
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
    background: #f2f4f7;
    color: #667085;
    font-size: 22rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .stat-row {
    margin-top: 12rpx;
    padding-top: 12rpx;
    border-top: 1rpx solid #edf0f5;
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
    color: #98a2b3;
    font-size: 22rpx;
    font-weight: 700;
  }

  .mini-stat-value {
    min-width: 0;
    color: #182230;
    font-size: 24rpx;
    font-weight: 800;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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
