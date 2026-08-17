import { normalizeRtaConfig, normalizeRtaMonsterDetail, normalizeRtaRanking } from './rta-normalizers'
import {
  RTA_COMPENDIUM_ID,
  RTA_LOCALE,
  type RtaConfig,
  type RtaMonsterDetail,
  type RtaMonsterDetailQuery,
  type RtaRankingQuery,
  type RtaRankingResult,
} from './rta-types'
import { getCompendiumsRtaConfig, getCompendiumsRtaMonster, getCompendiumsRtaMonsters } from '@/services/apifox/NODEJSDEMO/RTA/apifox'
import type {
  getCompendiumsRtaConfigQuery,
  getCompendiumsRtaMonsterQuery,
  getCompendiumsRtaMonstersQuery,
} from '@/services/apifox/NODEJSDEMO/RTA/interface'

export const fetchRtaConfig = async (): Promise<RtaConfig> => {
  const query: getCompendiumsRtaConfigQuery = {
    compendiumId: RTA_COMPENDIUM_ID,
    locale: RTA_LOCALE,
  }
  return normalizeRtaConfig(await getCompendiumsRtaConfig(query))
}

export const fetchRtaRanking = async (query: RtaRankingQuery): Promise<RtaRankingResult> => {
  const apiQuery: getCompendiumsRtaMonstersQuery = {
    compendiumId: RTA_COMPENDIUM_ID,
    locale: RTA_LOCALE,
    ...query,
  }
  return normalizeRtaRanking(await getCompendiumsRtaMonsters(apiQuery))
}

export const fetchRtaMonsterDetail = async (query: RtaMonsterDetailQuery): Promise<RtaMonsterDetail> => {
  const apiQuery: getCompendiumsRtaMonsterQuery = {
    compendiumId: RTA_COMPENDIUM_ID,
    locale: RTA_LOCALE,
    ...query,
  }
  return normalizeRtaMonsterDetail(await getCompendiumsRtaMonster(apiQuery), query)
}
