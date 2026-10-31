export const SCORE_COMPENDIUM_ID = 'swc'
export const SCORE_LOCALE = 'zh-CN'

export type ScoreCacheStatus = 'fresh' | 'stale'
export type ScoreSeasonStatus = 'current' | 'previous' | 'historical' | 'unknown'
export type ScoreSeasonDiscovery = 'provider' | 'calendar' | 'snapshot' | 'unknown'
export type ScoreDataStatus = 'usable' | 'unavailable'
export type ScoreCurrentQuality = 'usable' | 'insufficient' | 'stale'
export type ScoreHistoryQuality = 'usable' | 'insufficient'
export type ScoreForecastQuality = 'usable' | 'insufficient' | 'low-confidence' | 'stale'
export type ScoreForecastConfidence = 'high' | 'medium' | 'low' | 'insufficient'
export type ScoreTrendDirection = 'rising' | 'flat' | 'falling' | 'unknown'

export interface ScoreMeta {
  provider: string
  sourceUpdatedAt: string | null
  fetchedAt: string
  cacheStatus: ScoreCacheStatus
}

export interface ScoreSimpleOption {
  key: string
  name: string
  selectable: boolean
}

export interface ScoreSeasonOption {
  season: number
  status: ScoreSeasonStatus
  name: string
  selectable: boolean
  hasData: boolean
  seasonStartsAt: string | null
  seasonEndsAt: string | null
}

export interface ScoreTargetOption {
  key: string
  name: string
  group: 'silver' | 'gold' | 'green' | 'red' | 'top' | string
  groupName: string
  rank: number | null
  latestScore: number | null
  available: boolean
  selectable: boolean
}

export interface ScoreOptions {
  servers: ScoreSimpleOption[]
  leagues: ScoreSimpleOption[]
  providers: ScoreSimpleOption[]
  seasons: ScoreSeasonOption[]
  targets: ScoreTargetOption[]
  defaultSeason: number | null
  defaultTarget: string | null
  seasonDiscovery: ScoreSeasonDiscovery
  meta: ScoreMeta
}

export interface ScoreCapabilities {
  current: boolean
  history: boolean
  historicalSeasonHistory: boolean
  scoreForecast: boolean
}

export interface ScoreConfig {
  provider: string
  dataStatus: ScoreDataStatus
  seasonDiscovery: ScoreSeasonDiscovery
  capabilities: ScoreCapabilities
  researchDisplay: {
    available: boolean
    current: boolean
    history: boolean
    providers: string[]
    scopeVerified: boolean
    seasonEndsAt: string | null
    collectionUntil: string | null
  }
  meta: ScoreMeta
}

export interface ScorePoint {
  rank: number | null
  score: number | null
}

export interface ScoreCutoff extends ScoreTargetOption {
  score: number | null
}

export interface ScoreCurrentQualityInfo {
  status: ScoreCurrentQuality
  complete?: boolean
  expectedTargetCount?: number
  availableTargetCount?: number
  missingTargets?: string[]
  warnings: string[]
  latestAgeMinutes: number | null
}

export interface ScoreCurrent {
  server: string
  season: number | null
  league: string
  seasonEndsAt: string | null
  capturedAt: string | null
  sourceUpdatedAt: string | null
  rankPoints: ScorePoint[]
  cutoffs: ScoreCutoff[]
  dataQuality: ScoreCurrentQualityInfo
  meta: ScoreMeta
}

export interface ScoreHistoryPoint {
  capturedAt: string
  score: number | null
  rank: number | null
  sourceUpdatedAt: string | null
}

export type ScoreTrendEstimateStatus = 'available' | 'insufficient-history' | 'missing-season-end' | 'not-current-season' | 'no-future-days'

export interface ScoreTrendEstimatePoint {
  capturedAt: string
  score: number
  minScore: number
  maxScore: number
  daysToFinal: number
  phase: string
}

export interface ScoreTrendEstimate {
  status: ScoreTrendEstimateStatus
  model: string
  confidence: ScoreForecastConfidence
  direction: ScoreTrendDirection
  slopePerDay: number | null
  volatilityPerDay: number | null
  sampleDays: number
  sampleSpanDays: number
  latestObservedAt: string | null
  points: ScoreTrendEstimatePoint[]
}

export interface ScoreHistory {
  server?: string
  season?: number | null
  league?: string
  seasonStartsAt?: string | null
  seasonEndsAt?: string | null
  target: ScoreCutoff
  points: ScoreHistoryPoint[]
  trendEstimate: ScoreTrendEstimate | null
  range: {
    from: string | null
    to: string | null
  }
  dataQuality: {
    status: ScoreHistoryQuality
    snapshotCount: number
  }
  meta: ScoreMeta
}

export interface ScoreSeasonHistoryPoint {
  phase: string
  daysToFinal: number | null
  score: number | null
}

export interface ScoreSeasonHistory {
  server: string
  season: number | null
  league: string
  seasonStartsAt?: string | null
  seasonEndsAt?: string | null
  seasonStatus?: 'upcoming' | 'active' | 'finalized' | null
  provider?: string
  providers?: string[]
  target: {
    key: string
    name?: string
  }
  seriesType: 'relative-to-final' | ''
  points: ScoreSeasonHistoryPoint[]
  dataQuality: {
    scopeVerified: boolean
    eligibleForForecast: boolean
    merged?: boolean
    sourceCount?: number
    providers?: string[]
  }
}

export interface ScoreForecastTarget {
  key: string
  name: string
  rank: number | null
}

export interface ScoreForecastTrend {
  scoreDelta1d: number | null
  scoreDelta3d: number | null
  scoreDelta7d: number | null
  slopePerDay: number | null
  direction: ScoreTrendDirection
}

export interface ScoreRankRange {
  min: number | null
  max: number | null
}

export interface ScoreForecastValues {
  lowerScore: number | null
  expectedScore: number | null
  upperScore: number | null
  safeScore: number | null
  expectedRankRange: ScoreRankRange | null
  confidence: ScoreForecastConfidence
  model: string
}

export interface ScoreForecastQualityInfo {
  status: ScoreForecastQuality
  reason: string
  snapshotCount: number
  historySpanHours: number
  latestAgeMinutes: number | null
  backtest: {
    mae: number | null
    sampleCount: number
  }
}

export interface ScoreForecast {
  server: string
  season: number | null
  league: string
  seasonEndsAt: string | null
  target: ScoreForecastTarget
  latest: {
    score: number | null
    capturedAt: string | null
  }
  trend: ScoreForecastTrend
  forecast: ScoreForecastValues | null
  dataQuality: ScoreForecastQualityInfo
  meta: ScoreMeta
}

export interface ScoreSelection {
  server: string
  season: number
  league: string
  targetKey: string
  provider?: string
}
