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

const hasQueryValue = (value: string | undefined): value is string => typeof value === 'string' && Boolean(value.trim())

export const fetchTierRankingConfig = async (): Promise<TierRankingConfig> => {
  const query: getCompendiumsTierRankingsConfigQuery = {
    compendiumId: TIER_RANKING_COMPENDIUM_ID,
    locale: TIER_RANKING_LOCALE,
  }
  return normalizeTierRankingConfig(await getCompendiumsTierRankingsConfig(query))
}

export const fetchTierRankingReport = async (query: TierRankingQuery = {}): Promise<TierRankingReport> => {
  const apiQuery: getCompendiumsTierRankingsLatestQuery & { stars?: string; archetypes?: string } = {
    compendiumId: TIER_RANKING_COMPENDIUM_ID,
    locale: TIER_RANKING_LOCALE,
  }

  if (hasQueryValue(query.provider)) apiQuery.provider = query.provider
  if (hasQueryValue(query.region)) apiQuery.region = query.region
  if (hasQueryValue(query.elements)) apiQuery.elements = query.elements
  if (hasQueryValue(query.tiers)) apiQuery.tiers = query.tiers
  if (hasQueryValue(query.stars)) apiQuery.stars = query.stars
  if (hasQueryValue(query.archetypes)) apiQuery.archetypes = query.archetypes

  return normalizeTierRankingReport(await getCompendiumsTierRankingsLatest(apiQuery))
}
