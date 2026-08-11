import { computed, ref, type Ref } from 'vue'
import type { CharacterOption, LineupScope, PaginationState, UserLineupListResult } from '../lineup-types'
import { normalizeUserLineupListResult } from '../lineup-normalizers'
import { buildAnonymousRequestConfig } from '../request-options'
import { ALL_VALUE, LINEUP_FILTER_STATUS_OPTIONS, LINEUP_FILTER_TYPE_OPTIONS } from '../lineup-meta'
import { getCompendiumsLineups } from '@/services/apifox/NODEJSDEMO/COMPENDIUMLINEUPS/apifox'
import type { getCompendiumsLineupsQuery } from '@/services/apifox/NODEJSDEMO/COMPENDIUMLINEUPS/interface'

const DEFAULT_PAGE_SIZE = 20

const createDefaultPagination = (pageSize: number): PaginationState => ({
  page: 1,
  limit: pageSize,
  total: 0,
  totalPages: 0,
  hasNext: false,
  hasPrev: false,
})

export const useAdminLineupList = (params: { compendiumId: string; locale: Ref<string>; pageSize?: number }) => {
  const pageSize = params.pageSize || DEFAULT_PAGE_SIZE

  const keyword = ref('')
  const selectedType = ref(ALL_VALUE)
  const selectedStatus = ref(ALL_VALUE)
  const selectedScope = ref<LineupScope>('all')
  const selectedCharacterFilters = ref<CharacterOption[]>([])
  const lineups = ref<ReturnType<typeof normalizeUserLineupListResult>['items']>([])
  const pagination = ref<PaginationState>(createDefaultPagination(pageSize))
  const loading = ref(false)
  const loadingMore = ref(false)
  const pendingRefresh = ref(false)
  const errorMessage = ref('')
  let requestVersion = 0

  const selectedTypeLabel = computed(
    () => LINEUP_FILTER_TYPE_OPTIONS.find(option => option.value === selectedType.value)?.label || selectedType.value || '全部',
  )
  const selectedStatusLabel = computed(
    () => LINEUP_FILTER_STATUS_OPTIONS.find(option => option.value === selectedStatus.value)?.label || '全部',
  )
  const selectedScopeLabel = computed(() => {
    if (selectedScope.value === 'mine') return '我创建的'
    if (selectedScope.value === 'favorites') return '我的收藏'
    return '全部'
  })
  const selectedCharacterIds = computed(() => selectedCharacterFilters.value.map(item => item.characterId).filter(Boolean))
  const selectedCharacterLabel = computed(() =>
    selectedCharacterIds.value.length ? `人物 ${selectedCharacterIds.value.length} 个` : '全部人物',
  )

  const createCharacterFilter = (characterId: string, option: Partial<CharacterOption> = {}): CharacterOption => ({
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

  const buildCurrentUrl = (overrides: { characterIds?: string[]; scope?: LineupScope } = {}): string => {
    const characterIds = overrides.characterIds || selectedCharacterIds.value
    const scope = overrides.scope || selectedScope.value
    const query: string[] = []
    if (keyword.value.trim()) query.push(`keyword=${encodeURIComponent(keyword.value.trim())}`)
    if (selectedType.value) query.push(`type=${encodeURIComponent(selectedType.value)}`)
    if (selectedStatus.value) query.push(`status=${encodeURIComponent(selectedStatus.value)}`)
    if (scope !== 'all') query.push(`scope=${encodeURIComponent(scope)}`)
    if (characterIds.length) query.push(`characterIds=${encodeURIComponent(characterIds.join(','))}`)
    query.push(`locale=${encodeURIComponent(params.locale.value)}`)
    return `/subPackages/tools/compendium/swc/lineups${query.length ? `?${query.join('&')}` : ''}`
  }

  const isCharacterFilterSelected = (characterId: string): boolean =>
    selectedCharacterFilters.value.some(item => item.characterId === characterId)

  const fetchPage = async (page: number): Promise<UserLineupListResult> => {
    const query: getCompendiumsLineupsQuery = {
      compendiumId: params.compendiumId,
      locale: params.locale.value,
      scope: selectedScope.value,
      sortBy: 'updatedAt',
      sortOrder: 'desc',
      page,
      pageSize,
    }
    const keywordText = keyword.value.trim()
    if (keywordText) query.keyword = keywordText
    if (selectedCharacterIds.value.length) query.characterIds = selectedCharacterIds.value.join(',')
    if (selectedType.value) query.type = selectedType.value
    if (selectedStatus.value) query.status = selectedStatus.value

    const result = normalizeUserLineupListResult(await getCompendiumsLineups(query, buildAnonymousRequestConfig()))
    const limit = result.pagination.limit || pageSize
    const totalPages = result.pagination.totalPages || (result.pagination.total > 0 ? Math.ceil(result.pagination.total / limit) : 0)

    return {
      items: result.items,
      pagination: {
        ...result.pagination,
        page,
        limit,
        totalPages,
        hasNext: totalPages > 0 ? page < totalPages : result.pagination.hasNext,
        hasPrev: page > 1,
      },
    }
  }

  const fetchList = async (reset = false) => {
    if (loading.value || loadingMore.value) {
      if (reset) pendingRefresh.value = true
      return
    }

    if (reset) loading.value = true
    else {
      if (!pagination.value.hasNext) return
      loadingMore.value = true
    }

    const currentVersion = ++requestVersion
    errorMessage.value = ''
    const nextPage = reset ? 1 : pagination.value.page + 1

    try {
      const result = await fetchPage(nextPage)
      if (currentVersion !== requestVersion) return
      pagination.value = result.pagination
      lineups.value = reset ? result.items : [...lineups.value, ...result.items]
    } catch (error) {
      if (currentVersion !== requestVersion) return
      errorMessage.value = typeof error === 'string' ? error : '加载阵容失败，请稍后重试'
    } finally {
      if (currentVersion === requestVersion) {
        loading.value = false
        loadingMore.value = false
        uni.stopPullDownRefresh()
      }
      if (pendingRefresh.value && currentVersion === requestVersion) {
        pendingRefresh.value = false
        void fetchList(true)
      }
    }
  }

  const refreshList = () => {
    void fetchList(true)
  }

  const loadMore = () => {
    void fetchList(false)
  }

  const selectType = (value: string) => {
    selectedType.value = value
    refreshList()
  }

  const selectStatus = (value: string) => {
    selectedStatus.value = value
    refreshList()
  }

  const selectScope = (value: LineupScope) => {
    selectedScope.value = value
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
    refreshList()
  }

  const applyRouteQuery = (options: Record<string, string | undefined>) => {
    keyword.value = options.keyword || ''
    selectedType.value = options.type || ALL_VALUE
    selectedStatus.value = options.status || ALL_VALUE
    selectedScope.value = options.scope === 'mine' || options.scope === 'favorites' ? options.scope : 'all'
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
    selectedScope,
    selectedCharacterFilters,
    lineups,
    pagination,
    loading,
    loadingMore,
    errorMessage,
    selectedTypeLabel,
    selectedStatusLabel,
    selectedScopeLabel,
    selectedCharacterLabel,
    buildCurrentUrl,
    refreshList,
    loadMore,
    selectType,
    selectStatus,
    selectScope,
    removeCharacterFilter,
    clearCharacterFilters,
    applyRouteQuery,
  }
}
