import { computed, ref } from 'vue'
import { fetchRtaConfig, fetchRtaRanking } from './rta-api'
import { getRtaErrorMessage } from './rta-normalizers'
import {
  RTA_PAGE_SIZE,
  DEFAULT_MIN_PICK_COUNT,
  type RtaConfig,
  type RtaMeta,
  type RtaRankingItem,
  type RtaRankingInitialQuery,
  type RtaRankingQuery,
  type RtaSortBy,
  type RtaSortOrder,
} from './rta-types'

const getInitialTier = (config: RtaConfig): string =>
  config.tiers.find(option => option.key === 'all')?.key || config.tiers[0]?.key || 'all'
const getInitialLeague = (config: RtaConfig): string =>
  config.leagues.find(option => option.key === 'rta')?.key || config.leagues[0]?.key || 'rta'

const mergeUniqueItems = (current: RtaRankingItem[], next: RtaRankingItem[]): RtaRankingItem[] => {
  const seen = new Set(current.map(item => `${item.rank}:${item.character?.id || item.source.monsterId || item.source.name}`))
  const merged = [...current]
  next.forEach(item => {
    const key = `${item.rank}:${item.character?.id || item.source.monsterId || item.source.name}`
    if (seen.has(key)) return
    seen.add(key)
    merged.push(item)
  })
  return merged
}

export const useRtaRanking = () => {
  const config = ref<RtaConfig | null>(null)
  const items = ref<RtaRankingItem[]>([])
  const rankingMeta = ref<RtaMeta | null>(null)
  const season = ref(0)
  const tier = ref('all')
  const league = ref('rta')
  const minPickCount = ref(DEFAULT_MIN_PICK_COUNT)
  const sortBy = ref<RtaSortBy>('pickRate')
  const sortOrder = ref<RtaSortOrder>('desc')
  const currentPage = ref(0)
  const hasMore = ref(true)
  const loading = ref(false)
  const loadingMore = ref(false)
  const refreshing = ref(false)
  const errorMessage = ref('')
  const loadMoreError = ref('')
  const initialized = ref(false)
  const total = ref(0)
  let requestVersion = 0
  const inFlightPages = new Set<string>()

  const activeMeta = computed(() => rankingMeta.value || config.value?.meta || null)
  const isStale = computed(() => activeMeta.value?.cacheStatus === 'stale')
  const supportsPositionFilter = computed(() => config.value?.capabilities.positionFilter === true)
  const seasonOptions = computed(() => config.value?.seasons || [])
  const tierOptions = computed(() => config.value?.tiers || [])
  const leagueOptions = computed(() => config.value?.leagues || [])

  const buildQuery = (page: number): RtaRankingQuery => ({
    season: season.value,
    tier: tier.value,
    league: league.value,
    minPickCount: minPickCount.value,
    sortBy: sortBy.value,
    sortOrder: sortOrder.value,
    page,
    pageSize: RTA_PAGE_SIZE,
  })

  const applyConfig = (nextConfig: RtaConfig, preserveCurrentSeason: boolean) => {
    const canKeepSeason = preserveCurrentSeason && nextConfig.seasons.includes(season.value)
    config.value = nextConfig
    season.value = canKeepSeason ? season.value : nextConfig.defaultSeason
    if (!nextConfig.tiers.some(option => option.key === tier.value)) tier.value = getInitialTier(nextConfig)
    if (!nextConfig.leagues.some(option => option.key === league.value)) league.value = getInitialLeague(nextConfig)
  }

  const loadFirstPage = async (): Promise<void> => {
    if (!config.value || !season.value) return
    const version = ++requestVersion
    loading.value = true
    loadingMore.value = false
    errorMessage.value = ''
    loadMoreError.value = ''
    items.value = []
    currentPage.value = 0
    total.value = 0
    hasMore.value = true
    inFlightPages.clear()
    const requestKey = `${version}:1`
    inFlightPages.add(requestKey)

    try {
      const result = await fetchRtaRanking(buildQuery(1))
      if (version !== requestVersion) return
      items.value = mergeUniqueItems([], result.items)
      rankingMeta.value = result.meta
      currentPage.value = result.pagination.page
      total.value = result.pagination.total
      hasMore.value = result.pagination.hasMore
    } catch (error) {
      if (version !== requestVersion) return
      errorMessage.value = getRtaErrorMessage(error, 'RTA 数据加载失败')
    } finally {
      inFlightPages.delete(requestKey)
      if (version === requestVersion) loading.value = false
    }
  }

  const initialize = async (initialQuery: RtaRankingInitialQuery = {}): Promise<void> => {
    if (initialized.value || loading.value) return
    loading.value = true
    errorMessage.value = ''
    try {
      applyConfig(await fetchRtaConfig(), false)
      if (initialQuery.season && seasonOptions.value.includes(initialQuery.season)) season.value = initialQuery.season
      if (initialQuery.tier && tierOptions.value.some(option => option.key === initialQuery.tier)) tier.value = initialQuery.tier
      if (initialQuery.league && leagueOptions.value.some(option => option.key === initialQuery.league)) league.value = initialQuery.league
      if (initialQuery.minPickCount !== undefined && Number.isInteger(initialQuery.minPickCount) && initialQuery.minPickCount >= 0) {
        minPickCount.value = initialQuery.minPickCount
      }
      if (initialQuery.sortBy) sortBy.value = initialQuery.sortBy
      if (initialQuery.sortOrder) sortOrder.value = initialQuery.sortOrder
      initialized.value = true
      await loadFirstPage()
    } catch (error) {
      errorMessage.value = getRtaErrorMessage(error, 'RTA 数据加载失败')
      loading.value = false
    }
  }

  const refresh = async (): Promise<void> => {
    const refreshVersion = ++requestVersion
    refreshing.value = true
    errorMessage.value = ''
    loadMoreError.value = ''
    try {
      const nextConfig = await fetchRtaConfig()
      if (refreshVersion !== requestVersion) return
      applyConfig(nextConfig, true)
      await loadFirstPage()
    } catch (error) {
      if (refreshVersion !== requestVersion) return
      const message = getRtaErrorMessage(error, 'RTA 数据刷新失败')
      if (items.value.length) loadMoreError.value = message
      else errorMessage.value = message
    } finally {
      refreshing.value = false
    }
  }

  const loadMore = async (): Promise<void> => {
    if (!initialized.value || loading.value || loadingMore.value || !hasMore.value) return
    const nextPage = currentPage.value + 1
    const version = requestVersion
    const requestKey = `${version}:${nextPage}`
    if (inFlightPages.has(requestKey)) return
    inFlightPages.add(requestKey)
    loadingMore.value = true
    loadMoreError.value = ''
    try {
      const result = await fetchRtaRanking(buildQuery(nextPage))
      if (version !== requestVersion) return
      items.value = mergeUniqueItems(items.value, result.items)
      rankingMeta.value = result.meta
      currentPage.value = result.pagination.page
      total.value = result.pagination.total
      hasMore.value = result.pagination.hasMore
    } catch (error) {
      if (version === requestVersion) loadMoreError.value = getRtaErrorMessage(error, '下一页加载失败，请稍后重试')
    } finally {
      inFlightPages.delete(requestKey)
      if (version === requestVersion) loadingMore.value = false
    }
  }

  const selectSeason = async (value: number): Promise<void> => {
    if (value === season.value || !seasonOptions.value.includes(value)) return
    season.value = value
    await loadFirstPage()
  }

  const selectTier = async (value: string): Promise<void> => {
    if (value === tier.value || !tierOptions.value.some(option => option.key === value)) return
    tier.value = value
    await loadFirstPage()
  }

  const selectLeague = async (value: string): Promise<void> => {
    if (value === league.value || !leagueOptions.value.some(option => option.key === value)) return
    league.value = value
    await loadFirstPage()
  }

  const selectMinPickCount = async (value: number): Promise<void> => {
    if (!Number.isInteger(value) || value < 0 || value === minPickCount.value) return
    minPickCount.value = value
    await loadFirstPage()
  }

  const selectSort = async (value: RtaSortBy): Promise<void> => {
    if (value === sortBy.value) sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
    else {
      sortBy.value = value
      sortOrder.value = 'desc'
    }
    await loadFirstPage()
  }

  const retry = async (): Promise<void> => {
    if (!initialized.value || !config.value) await initialize()
    else await loadFirstPage()
  }

  return {
    config,
    items,
    season,
    tier,
    league,
    minPickCount,
    sortBy,
    sortOrder,
    currentPage,
    total,
    hasMore,
    loading,
    loadingMore,
    refreshing,
    errorMessage,
    loadMoreError,
    initialized,
    activeMeta,
    isStale,
    supportsPositionFilter,
    seasonOptions,
    tierOptions,
    leagueOptions,
    initialize,
    refresh,
    loadMore,
    selectSeason,
    selectTier,
    selectLeague,
    selectMinPickCount,
    selectSort,
    retry,
  }
}
