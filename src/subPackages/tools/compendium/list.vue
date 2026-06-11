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
          <view v-if="character.isFavorite" class="favorite-badge">★</view>
        </view>
        <text class="character-name">{{ character.name || '未知魔灵' }}</text>
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
    avatar: string
    element: string
    elementName: string
    level: string
    role: string
    isFavorite: boolean
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

  const readString = (record: Record<string, unknown>, keys: string[]): string => {
    for (const key of keys) {
      const value = readRecordValue(record, key)
      if (typeof value === 'string' && value.trim()) return value
      if (typeof value === 'number') return String(value)
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

  const normalizeCharacter = (source: unknown): CharacterCard | null => {
    if (!isRecord(source)) return null

    const id = readString(source, ['id', 'characterId', 'code'])
    if (!id) return null

    const categories = readArray(source, ['categories'])
      .filter(isRecord)
      .map(item => ({
        key: readString(item, ['key', 'valueKey']),
        name: readString(item, ['name']),
        value: readString(item, ['value']),
      }))

    const elementCategory = categories.find(
      category => ['element', 'attribute'].includes(category.key) || ['火', '水', '风', '光', '暗'].includes(category.name),
    )
    const typeCategory = categories.find(category => ['type', 'role', 'speciesType'].includes(category.key) || category.name.includes('型'))

    const name = readString(source, ['name', 'title'])
    const avatar = readString(source, ['avatar', 'icon', 'image', 'cover', 'portrait'])

    return {
      id,
      name,
      avatar: normalizeUrl(avatar),
      element: readString(source, ['element']) || elementCategory?.value || elementCategory?.name || '',
      elementName: elementCategory?.name || readString(source, ['elementName']),
      level: readString(source, ['level', 'star', 'rarity']),
      role: readString(source, ['speciesType', 'type']) || typeCategory?.value || typeCategory?.name || '',
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
      query.attribute = 'level'
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
    padding: 16rpx 8rpx 30rpx;
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 12rpx;
  }

  .character-card {
    min-width: 0;
    background: #fff;
    border: 2rpx solid #ea6a5f;
    border-radius: 10rpx;
    overflow: hidden;
  }

  .avatar-wrap {
    position: relative;
    width: 100%;
    height: 132rpx;
    background: linear-gradient(135deg, #f9dd96, #f7efe2);
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

  .character-name {
    display: block;
    height: 40rpx;
    line-height: 40rpx;
    padding: 0 4rpx;
    text-align: center;
    font-size: 24rpx;
    color: #161b25;
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
