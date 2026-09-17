export const TIER_RANKING_COMPENDIUM_ID = 'swc'
export const TIER_RANKING_LOCALE = 'zh-CN'

export type TierRankingElementKey = 'fire' | 'water' | 'wind' | 'light' | 'dark'

export interface TierRankingOption {
  key: string
  name: string
  sortOrder?: number
}

export interface TierRankingConfig {
  provider: string
  providers: string[]
  tiers: TierRankingOption[]
  regions: string[]
  elements: TierRankingOption[]
  capabilities: {
    tierRanking: boolean
    mapping: boolean
    import: boolean
    publish: boolean
    history: boolean
  }
}

export interface TierRankingCharacter {
  id: string
  code: string
  name: string
  avatar: string
  stars: number | null
  element: TierRankingOption | null
}

export interface TierRankingItem {
  id: string
  rank: number
  character: TierRankingCharacter | null
  tier: TierRankingOption
  sortOrder: number
  score: number | null
  source: {
    externalKey: string
    name: string
  }
}

export interface TierRankingReport {
  id: string
  reportDate: string
  season: number
  gameVersion: string
  region: TierRankingOption
  provider: string
  revision: number
  items: TierRankingItem[]
}

export interface TierRankingQuery {
  provider?: string
  region?: string
  elements?: string
  locale?: string
}

export interface TierRankingShareQuery {
  [key: string]: string | undefined
  provider?: string
  region?: string
  element?: string
  tier?: string
  keyword?: string
}
