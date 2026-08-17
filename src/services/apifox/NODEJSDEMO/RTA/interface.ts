/**
 * @description RTA/获取 RTA 赛季、筛选项和已实现能力--接口请求Query参数
 * @url GET /compendiums/rta/config
 */
export interface getCompendiumsRtaConfigQuery {
  compendiumId: string

  locale?: string
}

/**
 * @description RTA/获取 RTA 赛季、筛选项和已实现能力--接口返回值
 * @url GET /compendiums/rta/config
 */
export type getCompendiumsRtaConfigRes = object

/**
 * @description RTA/获取 RTA 人物排行榜--接口请求Query参数
 * @url GET /compendiums/rta/monsters
 */
export interface getCompendiumsRtaMonstersQuery {
  compendiumId: string

  season: number

  tier?: string

  league?: string

  sortBy?: string

  sortOrder?: string
  /** 最低选择场次，按 pickCount 过滤；0 表示不限 */
  minPickCount?: number

  page?: number

  pageSize?: number

  locale?: string
}

/**
 * @description RTA/获取 RTA 人物排行榜--接口返回值
 * @url GET /compendiums/rta/monsters
 */
export interface getCompendiumsRtaMonstersRes {
  filters?: getCompendiumsRtaMonstersResFilters
  items?: getCompendiumsRtaMonstersResItemsItem[]
  meta?: getCompendiumsRtaMonstersResMeta
  pagination?: getCompendiumsRtaMonstersResPagination
}

/** getCompendiumsRtaMonstersResFilters */
export interface getCompendiumsRtaMonstersResFilters {
  league?: 'rta' | 'special'
  /** 最低选择场次；0 表示不限 */
  minPickCount?: number
  season?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  tier?: 'all' | 'g3'
}

/** getCompendiumsRtaMonstersResItemsItemCharacter */
export interface getCompendiumsRtaMonstersResItemsItemCharacter {
  any
}

/** getCompendiumsRtaMonstersResItemsItemSource */
export interface getCompendiumsRtaMonstersResItemsItemSource {
  monsterId?: number
  name?: string
  provider?: 'swarena'
}

/** getCompendiumsRtaMonstersResItemsItemStats */
export interface getCompendiumsRtaMonstersResItemsItemStats {
  banCount: number
  banRate: number
  leaderRate: any
  /** 排行榜“场次”展示值 */
  pickCount: number
  pickRate: number
  /** picks - bans */
  playedCount: number
  winCount: number
  /** 直接使用 Swarena win_rate */
  winRate: number
}

/** getCompendiumsRtaMonstersResItems */
export interface getCompendiumsRtaMonstersResItemsItem {
  character?: getCompendiumsRtaMonstersResItemsItemCharacter
  rank?: number
  source?: getCompendiumsRtaMonstersResItemsItemSource
  stats?: getCompendiumsRtaMonstersResItemsItemStats
}

/** getCompendiumsRtaMonstersResMeta */
export interface getCompendiumsRtaMonstersResMeta {
  cacheStatus?: 'fresh' | 'stale'
  fetchedAt?: string
  provider?: 'swarena'
}

/** getCompendiumsRtaMonstersResPagination */
export interface getCompendiumsRtaMonstersResPagination {
  hasMore?: boolean
  page?: number
  pageSize?: number
  total?: number
}

/**
 * @description RTA/按本地 Character ID 获取人物 RTA 详情--接口请求Query参数
 * @url GET /compendiums/rta/monster
 */
export interface getCompendiumsRtaMonsterQuery {
  compendiumId: string

  characterId: string

  season: number

  tier?: string

  league?: string

  locale?: string
}

/**
 * @description RTA/按本地 Character ID 获取人物 RTA 详情--接口返回值
 * @url GET /compendiums/rta/monster
 */
export interface getCompendiumsRtaMonsterRes {
  character?: getCompendiumsRtaMonsterResCharacter
  meta?: getCompendiumsRtaMonsterResMeta
  positions?: any
  stats?: getCompendiumsRtaMonsterResStats
}

/** getCompendiumsRtaMonsterResCharacter */
export interface getCompendiumsRtaMonsterResCharacter {
  any
}

/** getCompendiumsRtaMonsterResMeta */
export interface getCompendiumsRtaMonsterResMeta {
  cacheStatus?: 'fresh' | 'stale'
  fetchedAt?: string
  provider?: 'swarena'
}

/** getCompendiumsRtaMonsterResStats */
export interface getCompendiumsRtaMonsterResStats {
  banCount: number
  banRate: number
  leaderRate: any
  /** 排行榜“场次”展示值 */
  pickCount: number
  pickRate: number
  /** picks - bans */
  playedCount: number
  winCount: number
  /** 直接使用 Swarena win_rate */
  winRate: number
}
