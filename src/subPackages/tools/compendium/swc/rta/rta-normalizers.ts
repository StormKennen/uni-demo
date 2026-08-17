import type {
  RtaCacheStatus,
  RtaCharacter,
  RtaConfig,
  RtaFilters,
  RtaMeta,
  RtaMonsterDetail,
  RtaOption,
  RtaPagination,
  RtaRankingItem,
  RtaRankingResult,
  RtaStats,
} from './rta-types'

type UnknownRecord = Record<string, unknown>

const isRecord = (value: unknown): value is UnknownRecord => typeof value === 'object' && value !== null && !Array.isArray(value)

const toRecord = (value: unknown): UnknownRecord => (isRecord(value) ? value : {})

const toText = (value: unknown): string => {
  if (typeof value === 'string') return value
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return ''
}

const toFiniteNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return null
}

const toBoolean = (value: unknown): boolean => value === true

const toCacheStatus = (value: unknown): RtaCacheStatus => (value === 'stale' ? 'stale' : 'fresh')

const unwrapBusinessData = (response: unknown): UnknownRecord => {
  const root = toRecord(response)
  if (isRecord(root.data)) return root.data
  return root
}

const normalizeOption = (source: unknown): RtaOption | null => {
  const record = toRecord(source)
  const key = toText(record.key ?? record.value)
  const name = toText(record.name ?? record.label ?? key)
  if (!key && !name) return null
  return { key, name }
}

const normalizeOptions = (source: unknown): RtaOption[] => {
  if (!Array.isArray(source)) return []
  return source.map(normalizeOption).filter((item): item is RtaOption => item !== null && Boolean(item.key))
}

const normalizeMeta = (source: unknown, fallbackProvider = ''): RtaMeta => {
  const record = toRecord(source)
  return {
    provider: toText(record.provider) || fallbackProvider,
    fetchedAt: toText(record.fetchedAt),
    cacheStatus: toCacheStatus(record.cacheStatus),
    battleCount: toFiniteNumber(record.battleCount),
  }
}

const normalizeCharacter = (source: unknown): RtaCharacter | null => {
  const record = toRecord(source)
  const id = toText(record.id ?? record._id ?? record.characterId)
  if (!id) return null
  return {
    id,
    code: toText(record.code),
    name: toText(record.name),
    avatar: toText(record.avatar),
    stars: Math.max(0, Math.floor(toFiniteNumber(record.stars) ?? 0)),
    element: normalizeOption(record.element),
    awaken: normalizeOption(record.awaken),
    family: isRecord(record.family) ? { name: toText(record.family.name) } : null,
  }
}

const normalizeStats = (source: unknown): RtaStats => {
  const record = toRecord(source)
  return {
    pickCount: toFiniteNumber(record.pickCount),
    playedCount: toFiniteNumber(record.playedCount),
    banCount: toFiniteNumber(record.banCount),
    winCount: toFiniteNumber(record.winCount),
    pickRate: toFiniteNumber(record.pickRate),
    banRate: toFiniteNumber(record.banRate),
    winRate: toFiniteNumber(record.winRate),
    leaderRate: toFiniteNumber(record.leaderRate),
  }
}

const normalizeRankingItem = (source: unknown, index: number): RtaRankingItem => {
  const record = toRecord(source)
  const sourceRecord = toRecord(record.source)
  return {
    rank: Math.max(0, Math.floor(toFiniteNumber(record.rank) ?? index + 1)),
    character: normalizeCharacter(record.character),
    stats: normalizeStats(record.stats),
    source: {
      provider: toText(sourceRecord.provider),
      monsterId: toFiniteNumber(sourceRecord.monsterId),
      name: toText(sourceRecord.name),
    },
  }
}

const normalizePagination = (source: unknown, itemCount: number): RtaPagination => {
  const record = toRecord(source)
  const page = Math.max(1, Math.floor(toFiniteNumber(record.page) ?? 1))
  const pageSize = Math.max(1, Math.floor(toFiniteNumber(record.pageSize) ?? (itemCount || 30)))
  const total = Math.max(0, Math.floor(toFiniteNumber(record.total) ?? itemCount))
  const hasMore = typeof record.hasMore === 'boolean' ? record.hasMore : page * pageSize < total
  return { page, pageSize, total, hasMore }
}

const normalizeFilters = (source: unknown, fallback: RtaFilters): RtaFilters => {
  const record = toRecord(source)
  return {
    season: Math.floor(toFiniteNumber(record.season) ?? fallback.season),
    tier: toText(record.tier) || fallback.tier,
    league: toText(record.league) || fallback.league,
  }
}

export const formatRate = (value: number | null | undefined): string => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '--'
  return `${(value * 100).toFixed(2)}%`
}

export const formatCount = (value: number | null | undefined): string => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '--'
  return Math.round(value).toLocaleString('en-US')
}

export const normalizeRtaConfig = (response: unknown): RtaConfig => {
  const data = unwrapBusinessData(response)
  const seasons = Array.isArray(data.seasons)
    ? data.seasons
        .map(toFiniteNumber)
        .filter((item): item is number => item !== null)
        .map(item => Math.floor(item))
    : []
  const defaultSeason = Math.floor(toFiniteNumber(data.defaultSeason) ?? seasons[0] ?? 0)
  const provider = toText(data.provider)
  const capabilities = toRecord(data.capabilities)
  if (!seasons.length || !defaultSeason) throw new Error('RTA 配置缺少可用赛季')
  return {
    provider,
    seasons,
    defaultSeason,
    tiers: normalizeOptions(data.tiers),
    leagues: normalizeOptions(data.leagues),
    capabilities: {
      monsterDetail: toBoolean(capabilities.monsterDetail),
      positionFilter: toBoolean(capabilities.positionFilter),
      multiPositionFilter: toBoolean(capabilities.multiPositionFilter),
      counters: toBoolean(capabilities.counters),
      teammates: toBoolean(capabilities.teammates),
    },
    meta: normalizeMeta(data.meta, provider),
  }
}

export const normalizeRtaRanking = (response: unknown): RtaRankingResult => {
  const data = unwrapBusinessData(response)
  const rawItems = Array.isArray(data.items) ? data.items : []
  const items = rawItems.map(normalizeRankingItem)
  return {
    items,
    pagination: normalizePagination(data.pagination, items.length),
    meta: normalizeMeta(data.meta),
  }
}

export const normalizeRtaMonsterDetail = (response: unknown, fallbackFilters: RtaFilters): RtaMonsterDetail => {
  const data = unwrapBusinessData(response)
  const character = normalizeCharacter(data.character)
  if (!character) throw new Error('RTA 人物详情缺少人物数据')
  return {
    character,
    stats: normalizeStats(data.stats),
    positions: Array.isArray(data.positions) ? data.positions : null,
    filters: normalizeFilters(data.filters, fallbackFilters),
    meta: normalizeMeta(data.meta),
  }
}

export const getRtaErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message) return error.message
  const record = toRecord(error)
  return toText(record.message) || fallback
}
