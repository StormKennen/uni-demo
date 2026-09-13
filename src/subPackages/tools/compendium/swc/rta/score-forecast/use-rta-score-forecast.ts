import { computed, ref } from 'vue'
import { fetchScoreConfig, fetchScoreCurrent, fetchScoreHistory, fetchScoreOptions } from './score-api'
import { getScoreErrorMessage } from './score-normalizers'
import type {
  ScoreConfig,
  ScoreCurrent,
  ScoreHistory,
  ScoreOptions,
  ScoreSeasonOption,
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
  let requestVersion = 0

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

  const selectionKey = (): string => `${server.value}:${season.value || ''}:${league.value}:${provider.value}:${targetKey.value}`

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
  }

  const loadHistorySeries = async (selection: ScoreSelection, targets: ScoreTargetOption[]): Promise<ScoreHistory[]> => {
    const results = await Promise.allSettled(targets.map(target => fetchScoreHistory({ ...selection, targetKey: target.key })))
    const successful = results
      .filter((result): result is PromiseFulfilledResult<ScoreHistory> => result.status === 'fulfilled')
      .map(result => result.value)
    if (successful.length || !results.length) return successful
    const failure = results.find((result): result is PromiseRejectedResult => result.status === 'rejected')
    throw failure?.reason || new Error('当前趋势暂不可用')
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
    const currentSelectionKey = selectionKey()
    const capabilities = config.value?.capabilities
    if (!keepData) clearData()
    currentError.value = ''
    historyError.value = ''
    dataLoading.value = true

    const currentTask =
      capabilities?.current || config.value?.researchDisplay.current ? fetchScoreCurrent(selection) : Promise.resolve(null)
    const historyTask =
      capabilities?.history || config.value?.researchDisplay.history
        ? loadHistorySeries(selection, targetOptions.value)
        : Promise.resolve([] as ScoreHistory[])
    const results = await Promise.allSettled([currentTask, historyTask])
    if (version !== requestVersion || currentSelectionKey !== selectionKey()) return

    const [currentResult, historyResult] = results
    if (currentResult.status === 'fulfilled') current.value = currentResult.value
    else currentError.value = getScoreErrorMessage(currentResult.reason, '当前分数线暂不可用')
    if (historyResult.status === 'fulfilled') historySeries.value = historyResult.value
    else historyError.value = getScoreErrorMessage(historyResult.reason, '当前趋势暂不可用')
    dataLoading.value = false
  }

  const loadSelection = async (reloadOptions: boolean, keepData: boolean): Promise<boolean> => {
    const version = ++requestVersion
    errorMessage.value = ''
    loading.value = true
    const previousSelectionKey = selectionKey()
    if (!keepData) clearData()
    try {
      if (reloadOptions || !options.value) {
        const scopedOptions = await fetchScoreOptions(getSelection() || undefined)
        if (version !== requestVersion) return false
        const nextOptions = options.value ? mergeFilterOptions(options.value, scopedOptions) : scopedOptions
        applyOptions(nextOptions, Boolean(options.value))
      }
      if (previousSelectionKey !== selectionKey()) {
        keepData = false
        clearData()
      }
      const selection = getSelection()
      const nextConfig = await fetchScoreConfig(selection || undefined)
      if (version !== requestVersion) return false
      config.value = nextConfig
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
      return false
    } finally {
      if (version === requestVersion) {
        loading.value = false
        dataLoading.value = false
      }
    }
  }

  const initialize = async (): Promise<void> => {
    if (initialized.value || loading.value) return
    await loadSelection(true, false)
  }

  const refresh = async (): Promise<void> => {
    if (loading.value) return
    await loadSelection(true, true)
  }

  const selectServer = async (value: string): Promise<void> => {
    if (!serverOptions.value.some(item => item.key === value && item.selectable) || value === server.value) return
    server.value = value
    await loadSelection(true, false)
  }

  const selectSeason = async (value: number): Promise<void> => {
    if (!seasonOptions.value.some(item => item.season === value && item.selectable) || value === season.value) return
    season.value = value
    await loadSelection(true, false)
  }

  const selectLeague = async (value: string): Promise<void> => {
    if (!leagueOptions.value.some(item => item.key === value && item.selectable) || value === league.value) return
    league.value = value
    await loadSelection(true, false)
  }

  const selectProvider = async (value: string): Promise<void> => {
    if (!providerOptions.value.some(item => item.key === value && item.selectable) || value === provider.value) return
    provider.value = value
    await loadSelection(true, false)
  }

  const selectTarget = async (value: string): Promise<void> => {
    if (!targetOptions.value.some(item => item.key === value && item.selectable) || value === targetKey.value) return
    targetKey.value = value
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
