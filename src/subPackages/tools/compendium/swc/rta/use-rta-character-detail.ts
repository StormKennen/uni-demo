import { computed, ref, watch, type Ref } from 'vue'
import { fetchRtaConfig, fetchRtaMonsterDetail } from './rta-api'
import { getRtaErrorMessage } from './rta-normalizers'
import type { RtaConfig, RtaFilters, RtaMonsterDetail } from './rta-types'

interface UseRtaCharacterDetailOptions {
  characterId: Readonly<Ref<string>>
  enabled: Readonly<Ref<boolean>>
  initialSeason: Readonly<Ref<number | undefined>>
  initialTier: Readonly<Ref<string | undefined>>
  initialLeague: Readonly<Ref<string | undefined>>
}

const getDefaultTier = (config: RtaConfig): string =>
  config.tiers.find(option => option.key === 'all')?.key || config.tiers[0]?.key || 'all'
const getDefaultLeague = (config: RtaConfig): string =>
  config.leagues.find(option => option.key === 'rta')?.key || config.leagues[0]?.key || 'rta'

export const useRtaCharacterDetail = (options: UseRtaCharacterDetailOptions) => {
  const config = ref<RtaConfig | null>(null)
  const detail = ref<RtaMonsterDetail | null>(null)
  const season = ref(0)
  const tier = ref('')
  const league = ref('')
  const loading = ref(false)
  const errorMessage = ref('')
  const refreshError = ref('')
  const initialized = ref(false)
  const currentQuery = computed<RtaFilters | null>(() => {
    if (!season.value || !tier.value || !league.value) return null
    return { season: season.value, tier: tier.value, league: league.value }
  })

  let requestVersion = 0
  let loadedKey = ''

  const applyConfig = (nextConfig: RtaConfig) => {
    const preferredSeason = season.value || options.initialSeason.value
    const preferredTier = tier.value || options.initialTier.value
    const preferredLeague = league.value || options.initialLeague.value
    config.value = nextConfig
    season.value = preferredSeason && nextConfig.seasons.includes(preferredSeason) ? preferredSeason : nextConfig.defaultSeason
    tier.value = preferredTier && nextConfig.tiers.some(option => option.key === preferredTier) ? preferredTier : getDefaultTier(nextConfig)
    league.value =
      preferredLeague && nextConfig.leagues.some(option => option.key === preferredLeague) ? preferredLeague : getDefaultLeague(nextConfig)
  }

  const ensureConfig = async (force = false): Promise<RtaConfig> => {
    if (!force && config.value) return config.value
    const nextConfig = await fetchRtaConfig()
    applyConfig(nextConfig)
    return nextConfig
  }

  const load = async (force = false): Promise<void> => {
    if (!options.enabled.value) return
    const characterId = options.characterId.value
    if (!characterId) {
      detail.value = null
      initialized.value = false
      errorMessage.value = '缺少魔灵 ID'
      return
    }

    if (
      !force &&
      currentQuery.value &&
      loadedKey === `${characterId}:${currentQuery.value.season}:${currentQuery.value.tier}:${currentQuery.value.league}`
    )
      return

    const version = ++requestVersion
    const hadDetail = Boolean(detail.value)
    loading.value = true
    if (hadDetail) refreshError.value = ''
    else errorMessage.value = ''

    try {
      const nextConfig = await ensureConfig()
      const nextQuery = currentQuery.value
      if (!nextQuery) throw new Error('RTA 配置缺少有效筛选项')
      const nextKey = `${characterId}:${nextQuery.season}:${nextQuery.tier}:${nextQuery.league}`
      if (!force && loadedKey === nextKey && detail.value) return
      const nextDetail = await fetchRtaMonsterDetail({ characterId, ...nextQuery })
      if (version !== requestVersion) return
      config.value = nextConfig
      detail.value = nextDetail
      loadedKey = nextKey
      initialized.value = true
      errorMessage.value = ''
    } catch (error) {
      if (version !== requestVersion) return
      const message = getRtaErrorMessage(error, '人物 RTA 详情加载失败')
      if (hadDetail) refreshError.value = message
      else errorMessage.value = message
    } finally {
      if (version === requestVersion) {
        loading.value = false
      }
    }
  }

  const invalidate = () => {
    requestVersion += 1
    loadedKey = ''
    detail.value = null
    initialized.value = false
    errorMessage.value = ''
    refreshError.value = ''
    loading.value = false
  }

  const refresh = async (): Promise<void> => {
    if (!options.enabled.value) return
    loadedKey = ''
    try {
      await ensureConfig(true)
      await load(true)
    } catch (error) {
      const message = getRtaErrorMessage(error, '人物 RTA 详情刷新失败')
      if (detail.value) refreshError.value = message
      else errorMessage.value = message
    }
  }

  const selectSeason = async (value: number): Promise<void> => {
    if (!config.value?.seasons.includes(value) || value === season.value) return
    season.value = value
    await load(true)
  }

  const selectTier = async (value: string): Promise<void> => {
    if (!config.value?.tiers.some(option => option.key === value) || value === tier.value) return
    tier.value = value
    await load(true)
  }

  const selectLeague = async (value: string): Promise<void> => {
    if (!config.value?.leagues.some(option => option.key === value) || value === league.value) return
    league.value = value
    await load(true)
  }

  const retry = async (): Promise<void> => {
    await load(true)
  }

  watch(options.characterId, () => {
    invalidate()
    if (options.enabled.value) void load()
  })

  watch(options.enabled, enabled => {
    if (enabled) void load()
  })

  return {
    config,
    detail,
    season,
    tier,
    league,
    loading,
    errorMessage,
    refreshError,
    initialized,
    currentQuery,
    load,
    refresh,
    invalidate,
    selectSeason,
    selectTier,
    selectLeague,
    retry,
  }
}
