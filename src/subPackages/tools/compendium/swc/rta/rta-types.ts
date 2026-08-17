export const RTA_COMPENDIUM_ID = 'swc'
export const RTA_LOCALE = 'zh-CN'
export const RTA_PAGE_SIZE = 30
export const DEFAULT_MIN_PICK_COUNT = 100

export type RtaCacheStatus = 'fresh' | 'stale'
export type RtaSortBy = 'pickRate' | 'pickCount' | 'banRate' | 'winRate' | 'leaderRate' | 'playedCount'
export type RtaSortOrder = 'asc' | 'desc'

export interface RtaOption {
  key: string
  name: string
}

export interface RtaCapabilities {
  monsterDetail: boolean
  positionFilter: boolean
  multiPositionFilter: boolean
  counters: boolean
  teammates: boolean
}

export interface RtaMeta {
  provider: string
  fetchedAt: string
  cacheStatus: RtaCacheStatus
  battleCount: number | null
}

export interface RtaConfig {
  provider: string
  seasons: number[]
  defaultSeason: number
  tiers: RtaOption[]
  leagues: RtaOption[]
  capabilities: RtaCapabilities
  meta: RtaMeta
}

export interface RtaCharacter {
  id: string
  code: string
  name: string
  avatar: string
  stars: number
  element: RtaOption | null
  awaken: RtaOption | null
  family: {
    name: string
  } | null
}

export interface RtaStats {
  pickCount: number | null
  playedCount: number | null
  banCount: number | null
  winCount: number | null
  pickRate: number | null
  banRate: number | null
  winRate: number | null
  leaderRate: number | null
}

export interface RtaSource {
  provider: string
  monsterId: number | null
  name: string
}

export interface RtaRankingItem {
  rank: number
  character: RtaCharacter | null
  stats: RtaStats
  source: RtaSource
}

export interface RtaPagination {
  page: number
  pageSize: number
  total: number
  hasMore: boolean
}

export interface RtaRankingResult {
  items: RtaRankingItem[]
  pagination: RtaPagination
  meta: RtaMeta
}

export interface RtaFilters {
  season: number
  tier: string
  league: string
}

export interface RtaMonsterDetail {
  character: RtaCharacter
  stats: RtaStats
  positions: unknown[] | null
  filters: RtaFilters
  meta: RtaMeta
}

export interface RtaRankingQuery extends RtaFilters {
  minPickCount: number
  sortBy: RtaSortBy
  sortOrder: RtaSortOrder
  page: number
  pageSize: number
}

export interface RtaRankingInitialQuery {
  season?: number
  tier?: string
  league?: string
  minPickCount?: number
  sortBy?: RtaSortBy
  sortOrder?: RtaSortOrder
}

export interface RtaMonsterDetailQuery extends RtaFilters {
  characterId: string
}

export interface RtaSortOption {
  key: RtaSortBy
  label: string
}

export interface RtaMinPickCountOption {
  label: string
  value: number
}

export const RTA_MIN_PICK_COUNT_OPTIONS: RtaMinPickCountOption[] = [
  { label: '不限', value: 0 },
  { label: '≥ 100', value: 100 },
  { label: '≥ 500', value: 500 },
  { label: '≥ 1,000', value: 1000 },
  { label: '≥ 5,000', value: 5000 },
]

export const RTA_SORT_OPTIONS: RtaSortOption[] = [
  { key: 'pickRate', label: '选择率' },
  { key: 'banRate', label: '被 Ban 率' },
  { key: 'leaderRate', label: '队长选取率' },
  { key: 'winRate', label: '队伍胜率' },
]
