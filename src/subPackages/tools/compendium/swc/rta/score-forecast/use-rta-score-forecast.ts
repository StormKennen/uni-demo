import { computed, ref } from 'vue'
import { fetchScoreConfig, fetchScoreCurrent, fetchScoreHistoryBatch, fetchScoreOptions, fetchScoreSeasonHistoryBatch } from './score-api'
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
  const providerOptions = computed<ScoreSimpleOption[]>(() => [
    { key: '', name: '综合', selectable: true },
    ...(options.value?.providers || []),
  ])
  const targetOptions = computed<ScoreTargetOption[]>(() => (options.value?.targets || []).filter(isVisibleTarget))
  const selectedServer = computed(() => serverOptions.value.find(item => item.key === server.value) || null)
  const selectedSeason = computed(() => seasonOptions.value.find(item => item.season === season.value) || null)
  const selectedLeague = computed(() => leagueOptions.value.find(item => item.key === league.value) || null)
  const selectedProvider = computed(() => providerOptions.value.find(item => item.key === provider.value) || null)
  const selectedTarget = computed(() => targetOptions.value.find(item => item.key === targetKey.value) || null)
  const isStale = computed(() => [options.value?.meta.cacheStatus, config.value?.meta.cacheStatus].includes('stale'))
  const isHistoricalSeason = computed(() => Boolean(selectedSeason.value && selectedSeason.value.status !== 'current'))

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

  const loadHistorySeries = async (selection: ScoreSelection, targetKeys = [selection.targetKey]): Promise<ScoreHistory[]> => {
    const resultsByKey = new Map<string, ScoreHistory>()
    const pendingTargetKeys = targetKeys.filter(targetKey => {
      const cacheKey = getHistoryCacheKey({ ...selection, targetKey })
      const cached = historyCache.get(cacheKey)
      if (cached) resultsByKey.set(targetKey, cached)
      return !cached
    })
    if (pendingTargetKeys.length) {
      const results = await fetchScoreHistoryBatch(selection, pendingTargetKeys)
      results.forEach(result => {
        const targetKey = result.target.key
        const cacheKey = getHistoryCacheKey({ ...selection, targetKey })
        historyCache.set(cacheKey, result)
        resultsByKey.set(targetKey, result)
      })
    }
    const successful = targetKeys.map(targetKey => resultsByKey.get(targetKey)).filter((item): item is ScoreHistory => Boolean(item))
    if (successful.length || !pendingTargetKeys.length) return successful
    throw new Error('当前趋势暂不可用')
  }

  const loadSeasonHistorySeries = async (selection: ScoreSelection, targets: ScoreTargetOption[]): Promise<ScoreSeasonHistory[]> => {
    const resultsByKey = new Map<string, ScoreSeasonHistory>()
    const pendingTargets = targets.filter(target => {
      const cacheKey = getHistoryCacheKey({ ...selection, targetKey: target.key })
      const cached = seasonHistoryCache.get(cacheKey)
      if (cached) resultsByKey.set(target.key, cached)
      return !cached
    })
    if (pendingTargets.length) {
      const results = await fetchScoreSeasonHistoryBatch(
        selection,
        pendingTargets.map(target => target.key),
      )
      results.forEach(result => {
        const targetKey = result.target.key
        const cacheKey = getHistoryCacheKey({ ...selection, targetKey })
        seasonHistoryCache.set(cacheKey, result)
        resultsByKey.set(targetKey, result)
      })
    }
    const successful = targets.map(target => resultsByKey.get(target.key)).filter((item): item is ScoreSeasonHistory => Boolean(item))
    if (successful.length || !pendingTargets.length) return successful
    throw new Error('历史赛季趋势暂不可用')
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
    server.value = serverCandidate?.key || firstSelectable(nextOptions.servers)?.key || ''
    league.value = leagueCandidate?.key || firstSelectable(nextOptions.leagues)?.key || ''
    season.value = seasonCandidate?.season || defaultSeason?.season || null
    // An empty provider means the backend's resolved view: SWRT first and
    // personal/SWRTA.TOP values only fill missing target/phase points. Users
    // can still select one concrete provider from the filter row.
    provider.value = providerCandidate?.key || ''
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
    // Config is loaded in the background so it never blocks the first useful
    // response. Until it arrives, the data endpoints are the source of truth.
    const shouldLoadCurrent = Boolean(cachedCurrent || !capabilities || capabilities.current || config.value?.researchDisplay.current)
    const currentTask = shouldLoadCurrent
      ? cachedCurrent
        ? Promise.resolve(cachedCurrent)
        : fetchScoreCurrent(selection)
      : Promise.resolve(null)
    const chartSelectionKey = selectionKey()
    const chartVersion = ++chartRequestVersion
    const nextCapabilities = config.value?.capabilities
    const chartIsHistorical = isHistoricalSeason.value
    const historyTask =
      !chartIsHistorical && (!nextCapabilities || nextCapabilities.history || config.value?.researchDisplay.history)
        ? loadHistorySeries(
            selection,
            targetOptions.value.map(target => target.key),
          )
        : Promise.resolve([] as ScoreHistory[])
    const phaseTargets = targetOptions.value
    // Active-season phase rows are derived from the daily observations. The
    // relative historical endpoint is only needed when the user opens a
    // historical season, avoiding a second set of identical requests.
    const seasonHistoryTask = chartIsHistorical
      ? loadSeasonHistorySeries(selection, phaseTargets)
      : Promise.resolve([] as ScoreSeasonHistory[])

    // Current data and chart data are independent reads. Start all of them
    // together so a slow trend aggregation cannot delay the useful cutoff
    // board, and a slow current read cannot delay the chart response.
    const currentResult = currentTask.then(
      result => {
        if (version !== requestVersion) return
        current.value = result
        if (result) {
          currentCache.set(currentCacheKey, result)
          syncTargetOptions(result)
        }
      },
      reason => {
        if (version === requestVersion) currentError.value = getScoreErrorMessage(reason, '当前分数线暂不可用')
      },
    )
    const chartTask = Promise.allSettled([historyTask, seasonHistoryTask]).then(([historyResult, seasonHistoryResult]) => {
      if (version !== requestVersion || chartVersion !== chartRequestVersion || chartSelectionKey !== selectionKey()) return
      if (historyResult.status === 'fulfilled') historySeries.value = historyResult.value
      if (seasonHistoryResult.status === 'fulfilled') seasonHistorySeries.value = seasonHistoryResult.value
      const hasDailyHistory = historyResult.status === 'fulfilled' && historyResult.value.some(item => item.points.length > 0)
      const hasPhaseHistory = seasonHistoryResult.status === 'fulfilled' && seasonHistoryResult.value.some(item => item.points.length > 0)
      if (chartIsHistorical && seasonHistoryResult.status === 'rejected') {
        historyError.value = getScoreErrorMessage(seasonHistoryResult.reason, '历史赛季数据暂不可用')
      } else if (!chartIsHistorical && !hasDailyHistory && !hasPhaseHistory) {
        const reason =
          seasonHistoryResult.status === 'rejected'
            ? seasonHistoryResult.reason
            : historyResult.status === 'rejected'
              ? historyResult.reason
              : undefined
        historyError.value = getScoreErrorMessage(reason, '当前趋势暂不可用')
      }
      dataLoading.value = false
    })
    await Promise.all([currentResult, chartTask])
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
      if (shouldLoadOptions) {
        const requestedSelection = getSelection() || undefined
        const scopedOptions = await fetchScoreOptions(requestedSelection)
        if (version !== requestVersion) return false
        const nextOptions = options.value ? mergeFilterOptions(options.value, scopedOptions) : scopedOptions
        applyOptions(nextOptions, Boolean(options.value))
      }
      if (previousSelectionKey !== selectionKey()) {
        keepData = false
        clearData()
      }
      const selection = getSelection()
      const configCacheKey = selection ? getFilterCacheKey(selection) : ''
      const cachedConfig = configCacheKey ? configCache.get(configCacheKey) : undefined
      if (cachedConfig) {
        config.value = cachedConfig
      } else {
        config.value = null
        // Config only controls optional capabilities and labels. Load it after
        // options so it never competes with the first current/history reads.
        void fetchScoreConfig(selection || undefined)
          .then(nextConfig => {
            if (version !== requestVersion) return
            config.value = nextConfig
            if (configCacheKey) configCache.set(configCacheKey, nextConfig)
          })
          .catch(() => {
            // Config is advisory; current/history errors remain visible while
            // a transient config failure must not blank the score page.
          })
      }
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
    const targetKeys = targetOptions.value.map(target => target.key)
    const cachedDailySeries = targetKeys
      .map(target => historyCache.get(getHistoryCacheKey({ ...selection, targetKey: target })))
      .filter((item): item is ScoreHistory => Boolean(item))
    const cachedPhaseSeries = targetKeys
      .map(target => seasonHistoryCache.get(getHistoryCacheKey({ ...selection, targetKey: target })))
      .filter((item): item is ScoreSeasonHistory => Boolean(item))
    historySeries.value = cachedDailySeries
    seasonHistorySeries.value = cachedPhaseSeries
    historyError.value = ''
    if (cachedDailySeries.length || cachedPhaseSeries.length) {
      dataLoading.value = false
    }
    if (cachedDailySeries.length === targetKeys.length && cachedPhaseSeries.length === targetKeys.length) return
    dataLoading.value = true
    try {
      const [dailyResult, phaseResult] = await Promise.allSettled([
        cachedDailySeries.length === targetKeys.length ? Promise.resolve(cachedDailySeries) : loadHistorySeries(selection, targetKeys),
        !isHistoricalSeason.value || cachedPhaseSeries.length === targetKeys.length
          ? Promise.resolve(cachedPhaseSeries)
          : loadSeasonHistorySeries(selection, targetOptions.value),
      ])
      if (
        chartVersion !== chartRequestVersion ||
        selectionKey() !== `${selection.server}:${selection.season}:${selection.league}:${selection.provider || ''}:${value}`
      )
        return
      if (dailyResult.status === 'fulfilled') {
        historySeries.value = dailyResult.value
      }
      if (phaseResult.status === 'fulfilled') {
        seasonHistorySeries.value = phaseResult.value
      }
      const hasDailyHistory = dailyResult.status === 'fulfilled' && dailyResult.value.some(item => item.points.length > 0)
      const hasPhaseHistory = phaseResult.status === 'fulfilled' && phaseResult.value.some(item => item.points.length > 0)
      if (!hasDailyHistory && !hasPhaseHistory) {
        const reason =
          phaseResult.status === 'rejected' ? phaseResult.reason : dailyResult.status === 'rejected' ? dailyResult.reason : undefined
        historyError.value = getScoreErrorMessage(reason, '当前趋势暂不可用')
      }
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
