import { computed, ref, type Ref } from 'vue'
import {
  fetchAdminLineups,
  type AdminLineupSummary,
  type CharacterOption,
  type PaginationState,
} from '@/services/compendium-lineups'
import {
  ALL_VALUE,
  LINEUP_FILTER_STATUS_OPTIONS,
  LINEUP_FILTER_TYPE_OPTIONS,
} from '../lineup-meta'

const DEFAULT_PAGE_SIZE = 20

const createDefaultPagination = (pageSize: number): PaginationState => ({
  page: 1,
  limit: pageSize,
  total: 0,
  totalPages: 0,
  hasNext: false,
  hasPrev: false,
})

export const useAdminLineupList = (params: {
  compendiumId: string
  locale: Ref<string>
  pageSize?: number
}) => {
  const pageSize = params.pageSize || DEFAULT_PAGE_SIZE

  const keyword = ref('')
  const selectedType = ref(ALL_VALUE)
  const selectedStatus = ref(ALL_VALUE)
  const selectedCharacterFilters = ref<CharacterOption[]>([])
  const allMatchedLineups = ref<AdminLineupSummary[]>([])
  const lineups = ref<AdminLineupSummary[]>([])
  const pagination = ref<PaginationState>(createDefaultPagination(pageSize))
  const loading = ref(false)
  const loadingMore = ref(false)
  const pendingRefresh = ref(false)
  const errorMessage = ref('')

  const selectedTypeLabel = computed(
    () => LINEUP_FILTER_TYPE_OPTIONS.find(option => option.value === selectedType.value)?.label || '全部',
  )
  const selectedStatusLabel = computed(
    () => LINEUP_FILTER_STATUS_OPTIONS.find(option => option.value === selectedStatus.value)?.label || '全部',
  )
  const selectedCharacterIds = computed(() =>
    selectedCharacterFilters.value.map(item => item.characterId).filter(Boolean),
  )
  const selectedCharacterLabel = computed(() =>
    selectedCharacterIds.value.length ? `人物 ${selectedCharacterIds.value.length} 个` : '全部人物',
  )
  const hasMultiCharacterFilter = computed(() => selectedCharacterIds.value.length > 1)

  const createCharacterFilter = (
    characterId: string,
    option: Partial<CharacterOption> = {},
  ): CharacterOption => ({
    id: option.id || characterId,
    characterId,
    name: option.name || option.label || characterId,
    label: option.label || option.name || characterId,
    avatar: option.avatar || '',
    element: option.element || '',
    elementKey: option.elementKey || '',
    elementName: option.elementName || '',
    archetype: option.archetype || '',
    familyKey: option.familyKey || '',
    familyName: option.familyName || '',
    awaken: option.awaken || '',
    awakenName: option.awakenName || '',
    stars: option.stars || '',
    status: option.status || 'enabled',
  })

  const buildCurrentUrl = (): string => {
    const query: string[] = []
    if (keyword.value.trim()) query.push(`keyword=${encodeURIComponent(keyword.value.trim())}`)
    if (selectedType.value) query.push(`type=${encodeURIComponent(selectedType.value)}`)
    if (selectedStatus.value) query.push(`status=${encodeURIComponent(selectedStatus.value)}`)
    if (selectedCharacterIds.value.length) {
      query.push(`characterIds=${encodeURIComponent(selectedCharacterIds.value.join(','))}`)
    }
    query.push(`locale=${encodeURIComponent(params.locale.value)}`)
    return `/subPackages/tools/compendium/swc/lineups${query.length ? `?${query.join('&')}` : ''}`
  }

  const isCharacterFilterSelected = (characterId: string): boolean =>
    selectedCharacterFilters.value.some(item => item.characterId === characterId)

  const matchesSelectedCharacters = (lineup: AdminLineupSummary): boolean => {
    if (!selectedCharacterIds.value.length) return true
    const memberIds = new Set(lineup.characters.map(item => item.characterId).filter(Boolean))
    return selectedCharacterIds.value.every(characterId => memberIds.has(characterId))
  }

  const updateLocalPagination = (page: number, total: number) => {
    const totalPages = total > 0 ? Math.ceil(total / pageSize) : 0
    pagination.value = {
      page,
      limit: pageSize,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    }
  }

  const fetchAllMatchedLineups = async (): Promise<AdminLineupSummary[]> => {
    const [primaryCharacterId] = selectedCharacterIds.value
    const collected: AdminLineupSummary[] = []
    let nextPage = 1
    let hasNext = true

    while (hasNext) {
      const result = await fetchAdminLineups({
        compendiumId: params.compendiumId,
        locale: params.locale.value,
        keyword: keyword.value.trim() || undefined,
        characterId: primaryCharacterId || undefined,
        type: selectedType.value || undefined,
        status: selectedStatus.value || undefined,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
        page: nextPage,
        pageSize,
      })

      collected.push(...result.items)
      hasNext = result.pagination.hasNext
      nextPage = result.pagination.page + 1
    }

    return collected.filter(matchesSelectedCharacters)
  }

  const fetchList = async (reset = false) => {
    if (loading.value || loadingMore.value) {
      if (reset) pendingRefresh.value = true
      return
    }

    if (reset) {
      loading.value = true
    } else {
      if (!pagination.value.hasNext) return
      loadingMore.value = true
    }

    errorMessage.value = ''
    const nextPage = reset ? 1 : pagination.value.page + 1

    try {
      if (hasMultiCharacterFilter.value) {
        if (reset) {
          const matched = await fetchAllMatchedLineups()
          allMatchedLineups.value = matched
          lineups.value = matched.slice(0, pageSize)
          updateLocalPagination(1, matched.length)
          return
        }

        const end = nextPage * pageSize
        lineups.value = allMatchedLineups.value.slice(0, end)
        updateLocalPagination(nextPage, allMatchedLineups.value.length)
        return
      }

      const result = await fetchAdminLineups({
        compendiumId: params.compendiumId,
        locale: params.locale.value,
        keyword: keyword.value.trim() || undefined,
        characterId: selectedCharacterIds.value[0] || undefined,
        type: selectedType.value || undefined,
        status: selectedStatus.value || undefined,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
        page: nextPage,
        pageSize,
      })

      allMatchedLineups.value = []
      pagination.value = result.pagination
      lineups.value = reset ? result.items : [...lineups.value, ...result.items]
    } catch (error) {
      errorMessage.value = typeof error === 'string' ? error : '加载阵容失败，请稍后重试'
    } finally {
      loading.value = false
      loadingMore.value = false
      uni.stopPullDownRefresh()

      if (pendingRefresh.value) {
        pendingRefresh.value = false
        fetchList(true)
      }
    }
  }

  const refreshList = () => {
    fetchList(true)
  }

  const loadMore = () => {
    fetchList(false)
  }

  const selectType = (value: string) => {
    selectedType.value = value
    refreshList()
  }

  const selectStatus = (value: string) => {
    selectedStatus.value = value
    refreshList()
  }

  const removeCharacterFilter = (characterId: string) => {
    if (!isCharacterFilterSelected(characterId)) return
    selectedCharacterFilters.value = selectedCharacterFilters.value.filter(item => item.characterId !== characterId)
    refreshList()
  }

  const clearCharacterFilters = () => {
    if (!selectedCharacterFilters.value.length) return
    selectedCharacterFilters.value = []
    allMatchedLineups.value = []
    refreshList()
  }

  const applyRouteQuery = (options: Record<string, string | undefined>) => {
    keyword.value = options.keyword || ''
    selectedType.value = options.type || ALL_VALUE
    selectedStatus.value = options.status || ALL_VALUE
    selectedCharacterFilters.value = (options.characterIds || '')
      .split(',')
      .map(item => item.trim())
      .filter(Boolean)
      .map(characterId => createCharacterFilter(characterId))
  }

  return {
    keyword,
    selectedType,
    selectedStatus,
    selectedCharacterFilters,
    lineups,
    pagination,
    loading,
    loadingMore,
    errorMessage,
    selectedTypeLabel,
    selectedStatusLabel,
    selectedCharacterLabel,
    buildCurrentUrl,
    refreshList,
    loadMore,
    selectType,
    selectStatus,
    removeCharacterFilter,
    clearCharacterFilters,
    applyRouteQuery,
  }
}
