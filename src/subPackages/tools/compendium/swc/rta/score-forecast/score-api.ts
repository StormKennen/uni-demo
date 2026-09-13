import {
  normalizeScoreConfig,
  normalizeScoreCurrent,
  normalizeScoreForecast,
  normalizeScoreHistory,
  normalizeScoreOptions,
  normalizeScoreSeasonHistory,
} from './score-normalizers'
import {
  SCORE_COMPENDIUM_ID,
  SCORE_LOCALE,
  type ScoreConfig,
  type ScoreCurrent,
  type ScoreForecast,
  type ScoreHistory,
  type ScoreOptions,
  type ScoreSeasonHistory,
  type ScoreSelection,
} from './score-types'
import {
  getRtaScoreConfig,
  getRtaScoreCurrent,
  getRtaScoreForecast,
  getRtaScoreHistory,
  getRtaScoreOptions,
  getRtaScoreSeasonHistory,
} from '@/services/apifox/NODEJSDEMO/RTASCORE/apifox'
import type {
  getRtaScoreConfigQuery,
  getRtaScoreCurrentQuery,
  getRtaScoreForecastQuery,
  getRtaScoreHistoryQuery,
  getRtaScoreOptionsQuery,
  getRtaScoreSeasonHistoryQuery,
} from '@/services/apifox/NODEJSDEMO/RTASCORE/interface'

type SelectionQuery = Pick<ScoreSelection, 'server' | 'season' | 'league' | 'provider'>

const buildSelectionParams = (selection?: Partial<SelectionQuery>) => ({
  compendiumId: SCORE_COMPENDIUM_ID,
  ...(selection?.server ? { server: selection.server } : {}),
  ...(selection?.season ? { season: selection.season } : {}),
  ...(selection?.league ? { league: selection.league } : {}),
  ...(selection?.provider ? { provider: selection.provider } : {}),
  locale: SCORE_LOCALE,
})

export const fetchScoreOptions = async (selection?: Partial<SelectionQuery>): Promise<ScoreOptions> => {
  const query: getRtaScoreOptionsQuery = buildSelectionParams(selection)
  return normalizeScoreOptions(await getRtaScoreOptions(query))
}

export const fetchScoreConfig = async (selection?: Partial<SelectionQuery>): Promise<ScoreConfig> => {
  const query: getRtaScoreConfigQuery = buildSelectionParams(selection)
  return normalizeScoreConfig(await getRtaScoreConfig(query))
}

export const fetchScoreCurrent = async (selection: SelectionQuery): Promise<ScoreCurrent> => {
  const query: getRtaScoreCurrentQuery = buildSelectionParams(selection)
  return normalizeScoreCurrent(await getRtaScoreCurrent(query))
}

export const fetchScoreHistory = async (selection: ScoreSelection): Promise<ScoreHistory> => {
  const query: getRtaScoreHistoryQuery = {
    ...buildSelectionParams(selection),
    targetKey: selection.targetKey,
    interval: 'day',
  }
  return normalizeScoreHistory(await getRtaScoreHistory(query))
}

export const fetchScoreSeasonHistory = async (selection: ScoreSelection): Promise<ScoreSeasonHistory> => {
  const query: getRtaScoreSeasonHistoryQuery = {
    compendiumId: SCORE_COMPENDIUM_ID,
    ...(selection.server ? { server: selection.server } : {}),
    season: selection.season,
    targetKey: selection.targetKey,
    ...(selection.league ? { league: selection.league } : {}),
    ...(selection.provider ? { provider: selection.provider } : {}),
  }
  return normalizeScoreSeasonHistory(await getRtaScoreSeasonHistory(query))
}

export const fetchScoreForecast = async (selection: ScoreSelection, currentScore: number | null): Promise<ScoreForecast> => {
  const query: getRtaScoreForecastQuery = {
    ...buildSelectionParams(selection),
    targetKey: selection.targetKey,
    ...(currentScore !== null ? { currentScore } : {}),
  }
  return normalizeScoreForecast(await getRtaScoreForecast(query))
}
