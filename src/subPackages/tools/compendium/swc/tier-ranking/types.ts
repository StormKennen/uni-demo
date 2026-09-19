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
  stars: TierRankingOption[]
  archetypes: TierRankingOption[]
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
  archetype: string
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
  available: boolean
  status: 'published' | 'empty'
  reason: string | null
  id: string
  reportDate: string | null
  season: number | null
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
  tiers?: string
  stars?: string
  archetypes?: string
  locale?: string
}

export interface TierRankingShareQuery {
  [key: string]: string | undefined
  provider?: string
  region?: string
  element?: string
  tier?: string
  elements?: string
  tiers?: string
  stars?: string
  archetypes?: string
  keyword?: string
  viewMode?: 'list' | 'card' | string
  showTierCount?: string
  showAvatarElementBadge?: string
  showScore?: string
}
