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

export const fetchTierRankingConfig = async (): Promise<TierRankingConfig> => {
  const query: getCompendiumsTierRankingsConfigQuery = {
    compendiumId: TIER_RANKING_COMPENDIUM_ID,
    locale: TIER_RANKING_LOCALE,
  }
  return normalizeTierRankingConfig(await getCompendiumsTierRankingsConfig(query))
}

export const fetchTierRankingReport = async (query: TierRankingQuery = {}): Promise<TierRankingReport> => {
  const apiQuery: getCompendiumsTierRankingsLatestQuery = {
    compendiumId: TIER_RANKING_COMPENDIUM_ID,
    locale: TIER_RANKING_LOCALE,
    ...query,
  }
  return normalizeTierRankingReport(await getCompendiumsTierRankingsLatest(apiQuery))
}
