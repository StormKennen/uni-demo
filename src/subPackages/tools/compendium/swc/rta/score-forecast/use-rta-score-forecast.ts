import { computed, ref } from 'vue'
import { fetchScoreConfig, fetchScoreCurrent, fetchScoreHistory, fetchScoreOptions, fetchScoreSeasonHistory } from './score-api'
import { getScoreErrorMessage } from './score-normalizers'
import type {
  ScoreConfig,
  ScoreCurrent,
  ScoreHistory,
  ScoreOptions,
  ScoreSeasonOption,
  ScoreSeasonHistory,
  ScoreSelection,
  ScoreSimpleOption,
  ScoreTargetOption,
} from './score-types'

const firstSelectable = <T extends { selectable: boolean }>(items: T[]): T | undefined => items.find(item => item.selectable)
const isVisibleTarget = (item: ScoreTargetOption): boolean => item.available && (item.group === 'green' || item.group === 'red')

const mergeSimpleOptions = (previous: ScoreSimpleOption[], next: ScoreSimpleOption[]): ScoreSimpleOption[] => {
  const merged = new Map(previous.map(item => [item.key, item]))
  next.forEach(item => {
    const previousItem = merged.get(item.key)
    merged.set(item.key, previousItem ? { ...previousItem, ...item } : item)
  })
  return [...merged.values()]
}

const mergeSeasonOptions = (previous: ScoreSeasonOption[], next: ScoreSeasonOption[]): ScoreSeasonOption[] => {
  const merged = new Map(previous.map(item => [item.season, item]))
  next.forEach(item => {
    const previousItem = merged.get(item.season)
    merged.set(item.season, previousItem ? { ...previousItem, ...item } : item)
  })
  return [...merged.values()].sort((left, right) => right.season - left.season)
}

const mergeFilterOptions = (previous: ScoreOptions, next: ScoreOptions): ScoreOptions => ({
  ...next,
  servers: mergeSimpleOptions(previous.servers, next.servers),
  leagues: mergeSimpleOptions(previous.leagues, next.leagues),
  providers: mergeSimpleOptions(previous.providers, next.providers),
  seasons: mergeSeasonOptions(previous.seasons, next.seasons),
})

export const useRtaScoreForecast = () => {
  const options = ref<ScoreOptions | null>(null)
  const config = ref<ScoreConfig | null>(null)
  const current = ref<ScoreCurrent | null>(null)
  const historySeries = ref<ScoreHistory[]>([])
  const seasonHistorySeries = ref<ScoreSeasonHistory[]>([])
  const server = ref('')
  const season = ref<number | null>(null)
  const league = ref('')
  const provider = ref('')
  const targetKey = ref('')
  const initialized = ref(false)
  const loading = ref(false)
  const dataLoading = ref(false)
  const errorMessage = ref('')
  const currentError = ref('')
  const historyError = ref('')
  const configCache = new Map<string, ScoreConfig>()
  const currentCache = new Map<string, ScoreCurrent>()
  const historyCache = new Map<string, ScoreHistory>()
  const seasonHistoryCache = new Map<string, ScoreSeasonHistory>()
  let requestVersion = 0
  let chartRequestVersion = 0

  const serverOptions = computed<ScoreSimpleOption[]>(() => options.value?.servers || [])
  const seasonOptions = computed<ScoreSeasonOption[]>(() => options.value?.seasons || [])
  const leagueOptions = computed<ScoreSimpleOption[]>(() => options.value?.leagues || [])
  const providerOptions = computed<ScoreSimpleOption[]>(() => options.value?.providers || [])
  const targetOptions = computed<ScoreTargetOption[]>(() => (options.value?.targets || []).filter(isVisibleTarget))
  const selectedServer = computed(() => serverOptions.value.find(item => item.key === server.value) || null)
  const selectedSeason = computed(() => seasonOptions.value.find(item => item.season === season.value) || null)
  const selectedLeague = computed(() => leagueOptions.value.find(item => item.key === league.value) || null)
  const selectedProvider = computed(() => providerOptions.value.find(item => item.key === provider.value) || null)
  const selectedTarget = computed(() => targetOptions.value.find(item => item.key === targetKey.value) || null)
  const isStale = computed(() => [options.value?.meta.cacheStatus, config.value?.meta.cacheStatus].includes('stale'))
  const isHistoricalSeason = computed(() =>
    Boolean(
      config.value?.capabilities.historicalSeasonHistory && !config.value.capabilities.current && !config.value.researchDisplay.current,
    ),
  )

  const selectionKey = (): string => `${server.value}:${season.value || ''}:${league.value}:${provider.value}:${targetKey.value}`

  const getFilterCacheKey = (selection: Pick<ScoreSelection, 'server' | 'season' | 'league' | 'provider'>): string =>
    `${selection.server}:${selection.season}:${selection.league}:${selection.provider || ''}`

  const getSelection = (): ScoreSelection | null => {
    if (!server.value || !season.value || !league.value || !targetKey.value) return null
    return {
      server: server.value,
      season: season.value,
      league: league.value,
      targetKey: targetKey.value,
      ...(provider.value ? { provider: provider.value } : {}),
    }
  }

  const clearData = () => {
    current.value = null
    historySeries.value = []
    seasonHistorySeries.value = []
  }

  const syncTargetOptions = (nextCurrent: ScoreCurrent) => {
    if (!options.value) return
    const cutoffByKey = new Map(nextCurrent.cutoffs.map(cutoff => [cutoff.key, cutoff]))
    const nextTargets = options.value.targets.map(target => {
      const cutoff = cutoffByKey.get(target.key)
      return cutoff
        ? {
            ...target,
            rank: cutoff.rank,
            latestScore: cutoff.score,
            available: cutoff.available,
          }
        : target
    })
    options.value = { ...options.value, targets: nextTargets }
    const nextVisibleTargets = nextTargets.filter(isVisibleTarget)
    if (!nextVisibleTargets.some(target => target.key === targetKey.value)) {
      targetKey.value = nextVisibleTargets[0]?.key || targetKey.value
    }
  }

  const getHistoryCacheKey = (selection: ScoreSelection): string =>
    `${selection.server}:${selection.season}:${selection.league}:${selection.provider || ''}:${selection.targetKey}`

  const loadHistorySeries = async (selection: ScoreSelection): Promise<ScoreHistory[]> => {
    const cacheKey = getHistoryCacheKey(selection)
    const cached = historyCache.get(cacheKey)
    if (cached) return [cached]
    const result = await fetchScoreHistory(selection)
    historyCache.set(cacheKey, result)
    return [result]
  }

  const loadSeasonHistorySeries = async (selection: ScoreSelection, targets: ScoreTargetOption[]): Promise<ScoreSeasonHistory[]> => {
    const resultsByKey = new Map<string, ScoreSeasonHistory>()
    const pendingTargets = targets.filter(target => {
      const cacheKey = getHistoryCacheKey({ ...selection, targetKey: target.key })
      const cached = seasonHistoryCache.get(cacheKey)
      if (cached) resultsByKey.set(target.key, cached)
      return !cached
    })
    const results = await Promise.allSettled(pendingTargets.map(target => fetchScoreSeasonHistory({ ...selection, targetKey: target.key })))
    results.forEach((result, index) => {
      if (result.status !== 'fulfilled') return
      const target = pendingTargets[index]
      const cacheKey = getHistoryCacheKey({ ...selection, targetKey: target.key })
      seasonHistoryCache.set(cacheKey, result.value)
      resultsByKey.set(target.key, result.value)
    })
    const successful = targets.map(target => resultsByKey.get(target.key)).filter((item): item is ScoreSeasonHistory => Boolean(item))
    if (successful.length || !results.length) return successful
    const failure = results.find((result): result is PromiseRejectedResult => result.status === 'rejected')
    throw failure?.reason || new Error('历史赛季趋势暂不可用')
  }

  const applyOptions = (nextOptions: ScoreOptions, preserveSelection: boolean) => {
    const oldSelection = {
      server: server.value,
      season: season.value,
      league: league.value,
      provider: provider.value,
      targetKey: targetKey.value,
    }
    options.value = nextOptions

    const serverCandidate = preserveSelection
      ? nextOptions.servers.find(item => item.key === oldSelection.server && item.selectable)
      : undefined
    const leagueCandidate = preserveSelection
      ? nextOptions.leagues.find(item => item.key === oldSelection.league && item.selectable)
      : undefined
    const providerCandidate = preserveSelection
      ? nextOptions.providers.find(item => item.key === oldSelection.provider && item.selectable)
      : undefined
    const seasonCandidate = preserveSelection
      ? nextOptions.seasons.find(item => item.season === oldSelection.season && item.selectable)
      : undefined
    const visibleTargets = nextOptions.targets.filter(isVisibleTarget)
    const targetCandidate = preserveSelection
      ? visibleTargets.find(item => item.key === oldSelection.targetKey && item.selectable)
      : undefined
    const defaultSeason =
      nextOptions.seasons.find(item => item.season === nextOptions.defaultSeason && item.selectable) || firstSelectable(nextOptions.seasons)
    const defaultTarget =
      visibleTargets.find(item => item.key === nextOptions.defaultTarget && item.selectable) || firstSelectable(visibleTargets)
    const defaultProvider =
      nextOptions.providers.find(item => item.key === 'swrt' && item.selectable) || firstSelectable(nextOptions.providers)

    server.value = serverCandidate?.key || firstSelectable(nextOptions.servers)?.key || ''
    league.value = leagueCandidate?.key || firstSelectable(nextOptions.leagues)?.key || ''
    season.value = seasonCandidate?.season || defaultSeason?.season || null
    provider.value = providerCandidate?.key || defaultProvider?.key || ''
    targetKey.value = targetCandidate?.key || defaultTarget?.key || ''
  }

  const loadData = async (version: number, keepData: boolean): Promise<void> => {
    const selection = getSelection()
    if (!selection) throw new Error('暂无可用的 RTA 分数筛选项')
    const capabilities = config.value?.capabilities
    if (!keepData) clearData()
    currentError.value = ''
    historyError.value = ''
    dataLoading.value = true
    const currentCacheKey = getFilterCacheKey(selection)
    const cachedCurrent = currentCache.get(currentCacheKey)
    const shouldLoadCurrent = Boolean(cachedCurrent || capabilities?.current || config.value?.researchDisplay.current)
    const currentTask = shouldLoadCurrent
      ? cachedCurrent
        ? Promise.resolve(cachedCurrent)
        : fetchScoreCurrent(selection)
      : Promise.resolve(null)
    const [currentResult] = await Promise.allSettled([currentTask])
    if (version !== requestVersion) return
    if (currentResult.status === 'fulfilled') {
      current.value = currentResult.value
      if (currentResult.value) {
        currentCache.set(currentCacheKey, currentResult.value)
        syncTargetOptions(currentResult.value)
      }
    } else currentError.value = getScoreErrorMessage(currentResult.reason, '当前分数线暂不可用')

    const nextSelection = getSelection()
    if (!nextSelection) {
      dataLoading.value = false
      return
    }
    const chartSelectionKey = selectionKey()
    const chartVersion = ++chartRequestVersion
    const nextCapabilities = config.value?.capabilities
    const chartIsHistorical = isHistoricalSeason.value
    const historyTask =
      !chartIsHistorical && (nextCapabilities?.history || config.value?.researchDisplay.history)
        ? loadHistorySeries(nextSelection)
        : Promise.resolve([] as ScoreHistory[])
    const seasonHistoryTask = chartIsHistorical
      ? loadSeasonHistorySeries(nextSelection, targetOptions.value)
      : Promise.resolve([] as ScoreSeasonHistory[])
    const chartTask = Promise.allSettled([historyTask, seasonHistoryTask]).then(([historyResult, seasonHistoryResult]) => {
      if (version !== requestVersion || chartVersion !== chartRequestVersion || chartSelectionKey !== selectionKey()) return
      if (historyResult.status === 'fulfilled') historySeries.value = historyResult.value
      else historyError.value = getScoreErrorMessage(historyResult.reason, '当前趋势暂不可用')
      if (seasonHistoryResult.status === 'fulfilled') seasonHistorySeries.value = seasonHistoryResult.value
      else historyError.value = getScoreErrorMessage(seasonHistoryResult.reason, '历史赛季趋势暂不可用')
      dataLoading.value = false
    })
    void chartTask
  }

  const loadSelection = async (reloadOptions: boolean, keepData: boolean): Promise<boolean> => {
    const version = ++requestVersion
    errorMessage.value = ''
    currentError.value = ''
    historyError.value = ''
    loading.value = true
    const previousSelectionKey = selectionKey()
    if (!keepData) clearData()
    try {
      const shouldLoadOptions = reloadOptions || !options.value
      let preloadedConfig: ScoreConfig | undefined
      if (shouldLoadOptions) {
        const requestedSelection = getSelection() || undefined
        const [scopedOptions, parallelConfig] = await Promise.all([
          fetchScoreOptions(requestedSelection),
          fetchScoreConfig(requestedSelection),
        ])
        if (version !== requestVersion) return false
        const nextOptions = options.value ? mergeFilterOptions(options.value, scopedOptions) : scopedOptions
        applyOptions(nextOptions, Boolean(options.value))
        preloadedConfig = parallelConfig
      }
      if (previousSelectionKey !== selectionKey()) {
        keepData = false
        clearData()
      }
      const selection = getSelection()
      const configCacheKey = selection ? getFilterCacheKey(selection) : ''
      const cachedConfig = configCacheKey ? configCache.get(configCacheKey) : undefined
      const nextConfig = preloadedConfig || cachedConfig || (await fetchScoreConfig(selection || undefined))
      if (version !== requestVersion) return false
      config.value = nextConfig
      if (configCacheKey && !cachedConfig) configCache.set(configCacheKey, nextConfig)
      if (!selection) {
        clearData()
        currentError.value = '暂无可用的 RTA 分数筛选项'
        historyError.value = '暂无可用的 RTA 分数筛选项'
        dataLoading.value = false
      } else {
        await loadData(version, keepData)
      }
      initialized.value = true
      return true
    } catch (error) {
      if (version !== requestVersion) return false
      errorMessage.value = getScoreErrorMessage(error, 'RTA 分数数据加载失败')
      dataLoading.value = false
      return false
    } finally {
      if (version === requestVersion) {
        loading.value = false
      }
    }
  }

  const initialize = async (): Promise<void> => {
    if (initialized.value || loading.value) return
    await loadSelection(true, false)
  }

  const refresh = async (): Promise<void> => {
    if (loading.value) return
    configCache.clear()
    currentCache.clear()
    historyCache.clear()
    seasonHistoryCache.clear()
    await loadSelection(true, true)
  }

  const selectServer = async (value: string): Promise<void> => {
    if (!serverOptions.value.some(item => item.key === value && item.selectable) || value === server.value) return
    server.value = value
    await loadSelection(false, false)
  }

  const selectSeason = async (value: number): Promise<void> => {
    if (!seasonOptions.value.some(item => item.season === value && item.selectable) || value === season.value) return
    season.value = value
    await loadSelection(false, false)
  }

  const selectLeague = async (value: string): Promise<void> => {
    if (!leagueOptions.value.some(item => item.key === value && item.selectable) || value === league.value) return
    league.value = value
    await loadSelection(false, false)
  }

  const selectProvider = async (value: string): Promise<void> => {
    if (!providerOptions.value.some(item => item.key === value && item.selectable) || value === provider.value) return
    provider.value = value
    await loadSelection(false, false)
  }

  const selectTarget = async (value: string): Promise<void> => {
    if (!targetOptions.value.some(item => item.key === value && item.selectable) || value === targetKey.value) return
    targetKey.value = value
    if (isHistoricalSeason.value) return

    const selection = getSelection()
    if (!selection) return
    const chartVersion = ++chartRequestVersion
    const cacheKey = getHistoryCacheKey(selection)
    const cached = historyCache.get(cacheKey)
    historySeries.value = cached ? [cached] : []
    historyError.value = ''
    if (cached) {
      dataLoading.value = false
      return
    }
    dataLoading.value = true
    try {
      const result = await fetchScoreHistory(selection)
      if (
        chartVersion !== chartRequestVersion ||
        selectionKey() !== `${selection.server}:${selection.season}:${selection.league}:${selection.provider || ''}:${value}`
      )
        return
      historyCache.set(cacheKey, result)
      historySeries.value = [result]
    } catch (error) {
      if (chartVersion === chartRequestVersion) historyError.value = getScoreErrorMessage(error, '当前趋势暂不可用')
    } finally {
      if (chartVersion === chartRequestVersion) dataLoading.value = false
    }
  }

  const retry = async (): Promise<void> => {
    if (!initialized.value) await initialize()
    else await loadSelection(true, true)
  }

  return {
    options,
    config,
    current,
    historySeries,
    seasonHistorySeries,
    server,
    season,
    league,
    provider,
    targetKey,
    initialized,
    loading,
    dataLoading,
    errorMessage,
    currentError,
    historyError,
    isStale,
    isHistoricalSeason,
    serverOptions,
    seasonOptions,
    leagueOptions,
    providerOptions,
    targetOptions,
    selectedServer,
    selectedSeason,
    selectedLeague,
    selectedProvider,
    selectedTarget,
    initialize,
    refresh,
    selectServer,
    selectSeason,
    selectLeague,
    selectProvider,
    selectTarget,
    retry,
  }
}
