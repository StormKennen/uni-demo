import { normalizeTierRankingConfig, normalizeTierRankingReport } from './normalizers'
import {
  TIER_RANKING_COMPENDIUM_ID,
  TIER_RANKING_LOCALE,
  type TierRankingConfig,
  type TierRankingQuery,
  type TierRankingReport,
} from './types'
import { getCompendiumsTierRankingsConfig, getCompendiumsTierRankingsLatest } from '@/services/apifox/NODEJSDEMO/TIERRANKING/apifox'
import type {
  getCompendiumsTierRankingsConfigQuery,
  getCompendiumsTierRankingsLatestQuery,
} from '@/services/apifox/NODEJSDEMO/TIERRANKING/interface'
import type { ParticalUniAppRequestOptions } from '@/services/interface'

const hasQueryValue = (value: string | undefined): value is string => typeof value === 'string' && Boolean(value.trim())

// 评级榜是公开读取接口，不应因游客会话初始化失败而阻塞微信端首屏。
const TIER_RANKING_PUBLIC_REQUEST_CONFIG = { _skipGuestSession: true } as ParticalUniAppRequestOptions & {
  _skipGuestSession: true
}

const normalizeTierFilterForApi = (value: string): string =>
  value
    .split(',')
    .flatMap(item => (item.trim().toLowerCase() === 'f' ? ['F', 'Other'] : [item.trim()]))
    .filter(Boolean)
    .filter((item, index, items) => items.indexOf(item) === index)
    .join(',')

export const fetchTierRankingConfig = async (): Promise<TierRankingConfig> => {
  const query: getCompendiumsTierRankingsConfigQuery = {
    compendiumId: TIER_RANKING_COMPENDIUM_ID,
    locale: TIER_RANKING_LOCALE,
  }
  return normalizeTierRankingConfig(await getCompendiumsTierRankingsConfig(query, TIER_RANKING_PUBLIC_REQUEST_CONFIG))
}

export const fetchTierRankingReport = async (query: TierRankingQuery = {}): Promise<TierRankingReport> => {
  const apiQuery: getCompendiumsTierRankingsLatestQuery & { stars?: string; archetypes?: string; characterIds?: string } = {
    compendiumId: TIER_RANKING_COMPENDIUM_ID,
    locale: TIER_RANKING_LOCALE,
  }

  if (hasQueryValue(query.provider)) apiQuery.provider = query.provider
  if (hasQueryValue(query.region)) apiQuery.region = query.region
  if (hasQueryValue(query.elements)) apiQuery.elements = query.elements
  if (hasQueryValue(query.tiers)) apiQuery.tiers = normalizeTierFilterForApi(query.tiers)
  if (hasQueryValue(query.stars)) apiQuery.stars = query.stars
  if (hasQueryValue(query.archetypes)) apiQuery.archetypes = query.archetypes
  if (hasQueryValue(query.characterIds)) apiQuery.characterIds = query.characterIds

  return normalizeTierRankingReport(await getCompendiumsTierRankingsLatest(apiQuery, TIER_RANKING_PUBLIC_REQUEST_CONFIG))
}
