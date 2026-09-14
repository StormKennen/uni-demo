import type {
  ScoreCacheStatus,
  ScoreConfig,
  ScoreCurrent,
  ScoreCurrentQuality,
  ScoreCutoff,
  ScoreDataStatus,
  ScoreForecast,
  ScoreForecastConfidence,
  ScoreForecastQuality,
  ScoreForecastTarget,
  ScoreHistory,
  ScoreHistoryQuality,
  ScoreMeta,
  ScoreOptions,
  ScorePoint,
  ScoreRankRange,
  ScoreSeasonDiscovery,
  ScoreSeasonHistory,
  ScoreSeasonOption,
  ScoreSeasonStatus,
  ScoreSimpleOption,
  ScoreTargetOption,
  ScoreTrendDirection,
} from './score-types'

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
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

const toInteger = (value: unknown): number | null => {
  const parsed = toFiniteNumber(value)
  return parsed === null ? null : Math.floor(parsed)
}

const toBoolean = (value: unknown, fallback = false): boolean => (typeof value === 'boolean' ? value : fallback)

const toCacheStatus = (value: unknown): ScoreCacheStatus => (value === 'stale' ? 'stale' : 'fresh')

const toSeasonStatus = (value: unknown): ScoreSeasonStatus => {
  if (value === 'current' || value === 'previous' || value === 'historical') return value
  return 'unknown'
}

const toSeasonDiscovery = (value: unknown): ScoreSeasonDiscovery => {
  if (value === 'provider' || value === 'calendar' || value === 'snapshot') return value
  return 'unknown'
}

const unwrapBusinessData = (response: unknown): UnknownRecord => {
  const root = toRecord(response)
  return isRecord(root.data) ? root.data : root
}

const normalizeMeta = (source: unknown, fallbackProvider = ''): ScoreMeta => {
  const record = toRecord(source)
  return {
    provider: toText(record.provider) || fallbackProvider,
    sourceUpdatedAt: toText(record.sourceUpdatedAt) || null,
    fetchedAt: toText(record.fetchedAt),
    cacheStatus: toCacheStatus(record.cacheStatus),
  }
}

const normalizeSelectable = (source: unknown): boolean => toBoolean(toRecord(source).selectable, true)

const normalizeSimpleOption = (source: unknown): ScoreSimpleOption | null => {
  const record = toRecord(source)
  const key = toText(record.key ?? record.value)
  if (!key) return null
  return {
    key,
    name: toText(record.name ?? record.label) || key,
    selectable: normalizeSelectable(source),
  }
}

const normalizeSimpleOptions = (source: unknown): ScoreSimpleOption[] => {
  if (!Array.isArray(source)) return []
  return source.map(normalizeSimpleOption).filter((item): item is ScoreSimpleOption => item !== null)
}

const normalizeSeason = (source: unknown): ScoreSeasonOption | null => {
  const record = toRecord(source)
  const season = toInteger(record.season ?? record.value)
  if (season === null || season < 1) return null
  const status = toSeasonStatus(record.status)
  const statusName =
    status === 'current' ? '当前赛季' : status === 'previous' ? '上一赛季' : status === 'historical' ? '历史赛季' : '状态未知'
  return {
    season,
    status,
    name: toText(record.name) || statusName,
    selectable: normalizeSelectable(source),
    hasData: toBoolean(record.hasData),
    seasonStartsAt: toText(record.seasonStartsAt) || null,
    seasonEndsAt: toText(record.seasonEndsAt) || null,
  }
}

const normalizeSeasons = (source: unknown): ScoreSeasonOption[] => {
  if (!Array.isArray(source)) return []
  return source.map(normalizeSeason).filter((item): item is ScoreSeasonOption => item !== null)
}

const normalizeTarget = (source: unknown): ScoreTargetOption | null => {
  const record = toRecord(source)
  const key = toText(record.key ?? record.value)
  if (!key) return null
  const rank = toInteger(record.rank)
  const latestScore = toFiniteNumber(record.latestScore)
  return {
    key,
    name: toText(record.name ?? record.label) || key,
    group: toText(record.group),
    groupName: toText(record.groupName),
    rank,
    latestScore,
    available: toBoolean(record.available, latestScore !== null),
    selectable: normalizeSelectable(source),
  }
}

const normalizeTargets = (source: unknown): ScoreTargetOption[] => {
  if (!Array.isArray(source)) return []
  return source.map(normalizeTarget).filter((item): item is ScoreTargetOption => item !== null)
}

const normalizeDataStatus = (value: unknown): ScoreDataStatus => (value === 'unavailable' ? 'unavailable' : 'usable')

const normalizeCurrentQuality = (value: unknown): ScoreCurrentQuality => {
  if (value === 'insufficient' || value === 'stale') return value
  return 'usable'
}

const normalizeHistoryQuality = (value: unknown): ScoreHistoryQuality => (value === 'insufficient' ? 'insufficient' : 'usable')

const normalizeForecastQuality = (value: unknown): ScoreForecastQuality => {
  if (value === 'insufficient' || value === 'low-confidence' || value === 'stale') return value
  return 'usable'
}

const normalizeConfidence = (value: unknown): ScoreForecastConfidence => {
  if (value === 'high' || value === 'medium' || value === 'low') return value
  return 'insufficient'
}

const normalizeDirection = (value: unknown): ScoreTrendDirection => {
  if (value === 'rising' || value === 'flat' || value === 'falling') return value
  return 'unknown'
}

const normalizePoint = (source: unknown): ScorePoint => {
  const record = toRecord(source)
  return {
    rank: toInteger(record.rank),
    score: toFiniteNumber(record.score),
  }
}

const normalizeCutoff = (source: unknown): ScoreCutoff | null => {
  const record = toRecord(source)
  const key = toText(record.key ?? record.value)
  if (!key) return null
  const score = toFiniteNumber(record.score)
  return {
    key,
    name: toText(record.name ?? record.label) || key,
    group: toText(record.group),
    groupName: toText(record.groupName),
    rank: toInteger(record.rank),
    latestScore: score,
    available: toBoolean(record.available, score !== null),
    selectable: true,
    score,
  }
}

const normalizeCutoffs = (source: unknown): ScoreCutoff[] => {
  if (!Array.isArray(source)) return []
  return source.map(normalizeCutoff).filter((item): item is ScoreCutoff => item !== null)
}

export const normalizeScoreOptions = (response: unknown): ScoreOptions => {
  const data = unwrapBusinessData(response)
  return {
    servers: normalizeSimpleOptions(data.servers),
    leagues: normalizeSimpleOptions(data.leagues),
    providers: normalizeSimpleOptions(data.providers),
    seasons: normalizeSeasons(data.seasons),
    targets: normalizeTargets(data.targets),
    defaultSeason: toInteger(data.defaultSeason),
    defaultTarget: toText(data.defaultTarget) || null,
    seasonDiscovery: toSeasonDiscovery(data.seasonDiscovery),
    meta: normalizeMeta(data.meta),
  }
}

export const normalizeScoreConfig = (response: unknown): ScoreConfig => {
  const data = unwrapBusinessData(response)
  const capabilities = toRecord(data.capabilities)
  const provider = toText(data.provider)
  const researchDisplay = toRecord(data.researchDisplay)
  return {
    provider,
    dataStatus: normalizeDataStatus(data.dataStatus),
    seasonDiscovery: toSeasonDiscovery(data.seasonDiscovery),
    capabilities: {
      current: toBoolean(capabilities.current),
      history: toBoolean(capabilities.history),
      historicalSeasonHistory: toBoolean(capabilities.historicalSeasonHistory),
      scoreForecast: toBoolean(capabilities.scoreForecast),
    },
    researchDisplay: {
      available: toBoolean(researchDisplay.available),
      current: toBoolean(researchDisplay.current),
      history: toBoolean(researchDisplay.history),
      providers: Array.isArray(researchDisplay.providers) ? researchDisplay.providers.map(toText).filter(Boolean) : [],
      scopeVerified: toBoolean(researchDisplay.scopeVerified),
      seasonEndsAt: toText(researchDisplay.seasonEndsAt) || null,
      collectionUntil: toText(researchDisplay.collectionUntil) || null,
    },
    meta: normalizeMeta(data.meta, provider),
  }
}

export const normalizeScoreCurrent = (response: unknown): ScoreCurrent => {
  const data = unwrapBusinessData(response)
  const quality = toRecord(data.dataQuality)
  const provider = toText(toRecord(data.meta).provider)
  return {
    server: toText(data.server),
    season: toInteger(data.season),
    league: toText(data.league),
    seasonEndsAt: toText(data.seasonEndsAt) || null,
    capturedAt: toText(data.capturedAt) || null,
    sourceUpdatedAt: toText(data.sourceUpdatedAt) || null,
    rankPoints: Array.isArray(data.rankPoints) ? data.rankPoints.map(normalizePoint) : [],
    cutoffs: normalizeCutoffs(data.cutoffs),
    dataQuality: {
      status: normalizeCurrentQuality(quality.status),
      complete: toBoolean(quality.complete),
      expectedTargetCount: toInteger(quality.expectedTargetCount) ?? undefined,
      availableTargetCount: toInteger(quality.availableTargetCount) ?? undefined,
      missingTargets: Array.isArray(quality.missingTargets) ? quality.missingTargets.map(toText).filter(Boolean) : [],
      warnings: Array.isArray(quality.warnings) ? quality.warnings.map(toText).filter(Boolean) : [],
      latestAgeMinutes: toFiniteNumber(quality.latestAgeMinutes),
    },
    meta: normalizeMeta(data.meta, provider),
  }
}

const normalizeHistoryPoint = (source: unknown): ScoreHistory['points'][number] => {
  const record = toRecord(source)
  return {
    capturedAt: toText(record.capturedAt),
    score: toFiniteNumber(record.score),
    rank: toInteger(record.rank),
    sourceUpdatedAt: toText(record.sourceUpdatedAt) || null,
  }
}

const normalizeHistoryTarget = (source: unknown): ScoreCutoff =>
  normalizeCutoff(source) || {
    key: '',
    name: '',
    group: '',
    groupName: '',
    rank: null,
    latestScore: null,
    available: false,
    selectable: true,
    score: null,
  }

export const normalizeScoreHistory = (response: unknown): ScoreHistory => {
  const data = unwrapBusinessData(response)
  const quality = toRecord(data.dataQuality)
  const range = toRecord(data.range)
  const provider = toText(toRecord(data.meta).provider)
  return {
    target: normalizeHistoryTarget(data.target),
    points: Array.isArray(data.points)
      ? data.points.map(normalizeHistoryPoint).sort((left, right) => left.capturedAt.localeCompare(right.capturedAt))
      : [],
    range: {
      from: toText(range.from) || null,
      to: toText(range.to) || null,
    },
    dataQuality: {
      status: normalizeHistoryQuality(quality.status),
      snapshotCount: Math.max(0, toInteger(quality.snapshotCount) ?? 0),
    },
    meta: normalizeMeta(data.meta, provider),
  }
}

export const normalizeScoreSeasonHistory = (response: unknown): ScoreSeasonHistory => {
  const data = unwrapBusinessData(response)
  const target = toRecord(data.target)
  const quality = toRecord(data.dataQuality)
  const seasonStatus = toText(data.seasonStatus)
  return {
    server: toText(data.server),
    season: toInteger(data.season),
    league: toText(data.league),
    seasonStartsAt: toText(data.seasonStartsAt) || null,
    seasonEndsAt: toText(data.seasonEndsAt) || null,
    seasonStatus: seasonStatus === 'upcoming' || seasonStatus === 'active' || seasonStatus === 'finalized' ? seasonStatus : null,
    provider: toText(data.provider),
    providers: Array.isArray(data.providers) ? data.providers.map(toText).filter(Boolean) : [],
    target: { key: toText(target.key), name: toText(target.name) || undefined },
    seriesType: data.seriesType === 'relative-to-final' ? 'relative-to-final' : '',
    points: Array.isArray(data.points)
      ? data.points
          .map(point => {
            const record = toRecord(point)
            return {
              phase: toText(record.phase),
              daysToFinal: toInteger(record.daysToFinal),
              score: toFiniteNumber(record.score),
            }
          })
          .filter(point => Boolean(point.phase))
          .sort((left, right) => (right.daysToFinal ?? -1) - (left.daysToFinal ?? -1))
      : [],
    dataQuality: {
      scopeVerified: toBoolean(quality.scopeVerified),
      eligibleForForecast: toBoolean(quality.eligibleForForecast),
      merged: toBoolean(quality.merged),
      sourceCount: toInteger(quality.sourceCount) ?? undefined,
      providers: Array.isArray(quality.providers) ? quality.providers.map(toText).filter(Boolean) : [],
    },
  }
}

const normalizeForecastTarget = (source: unknown): ScoreForecastTarget => {
  const record = toRecord(source)
  return {
    key: toText(record.key),
    name: toText(record.name),
    rank: toInteger(record.rank),
  }
}

const normalizeRankRange = (source: unknown): ScoreRankRange | null => {
  if (!isRecord(source)) return null
  const min = toInteger(source.min)
  const max = toInteger(source.max)
  if (min === null || max === null) return null
  return {
    min,
    max,
  }
}

export const normalizeScoreForecast = (response: unknown): ScoreForecast => {
  const data = unwrapBusinessData(response)
  const trend = toRecord(data.trend)
  const forecast = isRecord(data.forecast) ? data.forecast : null
  const quality = toRecord(data.dataQuality)
  const backtest = toRecord(quality.backtest)
  const provider = toText(toRecord(data.meta).provider)
  return {
    server: toText(data.server),
    season: toInteger(data.season),
    league: toText(data.league),
    seasonEndsAt: toText(data.seasonEndsAt) || null,
    target: normalizeForecastTarget(data.target),
    latest: {
      score: toFiniteNumber(toRecord(data.latest).score),
      capturedAt: toText(toRecord(data.latest).capturedAt) || null,
    },
    trend: {
      scoreDelta1d: toFiniteNumber(trend.scoreDelta1d),
      scoreDelta3d: toFiniteNumber(trend.scoreDelta3d),
      scoreDelta7d: toFiniteNumber(trend.scoreDelta7d),
      slopePerDay: toFiniteNumber(trend.slopePerDay),
      direction: normalizeDirection(trend.direction),
    },
    forecast: forecast
      ? {
          lowerScore: toFiniteNumber(forecast.lowerScore),
          expectedScore: toFiniteNumber(forecast.expectedScore),
          upperScore: toFiniteNumber(forecast.upperScore),
          safeScore: toFiniteNumber(forecast.safeScore),
          expectedRankRange: normalizeRankRange(forecast.expectedRankRange),
          confidence: normalizeConfidence(forecast.confidence),
          model: toText(forecast.model),
        }
      : null,
    dataQuality: {
      status: normalizeForecastQuality(quality.status),
      reason: toText(quality.reason),
      snapshotCount: Math.max(0, toInteger(quality.snapshotCount) ?? 0),
      historySpanHours: Math.max(0, toFiniteNumber(quality.historySpanHours) ?? 0),
      latestAgeMinutes: toFiniteNumber(quality.latestAgeMinutes),
      backtest: {
        mae: toFiniteNumber(backtest.mae),
        sampleCount: Math.max(0, toInteger(backtest.sampleCount) ?? 0),
      },
    },
    meta: normalizeMeta(data.meta, provider),
  }
}

export const formatScoreValue = (value: number | null | undefined): string => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '--'
  return Math.round(value).toLocaleString('en-US')
}

export const formatRankValue = (value: number | null | undefined): string => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '--'
  return Math.round(value).toLocaleString('en-US')
}

const RTA_TARGET_LABELS: Readonly<Record<string, string>> = {
  f1: '一银',
  f2: '二银',
  f3: '三银',
  c1: '一金',
  c2: '二金',
  c3: '三金',
  p1: '一绿',
  p2: '二绿',
  p3: '三绿',
  g1: '一红',
  g2: '二红',
  g3: '三红',
  top100: '前百',
  'top-100': '前百',
  'silver-1': '一银',
  'silver-2': '二银',
  'silver-3': '三银',
  'gold-1': '一金',
  'gold-2': '二金',
  'gold-3': '三金',
  'green-1': '一绿',
  'green-2': '二绿',
  'green-3': '三绿',
  'red-1': '一红',
  'red-2': '二红',
  'red-3': '三红',
}

export const formatTargetLabel = (key: string | null | undefined, fallback = ''): string => {
  const normalizedKey = toText(key).trim().toLowerCase()
  return RTA_TARGET_LABELS[normalizedKey] || toText(fallback) || normalizedKey.toUpperCase() || '--'
}

export const getScoreErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message) return error.message
  if (isRecord(error) && typeof error.message === 'string' && error.message) return error.message
  return fallback
}
