import type { RuneEvaluationResult, RuneScoreEvaluationRequest, RuneScoreMetadata } from './types'
import {
  getCompendiumsRunesMetadata,
  postCompendiumsRunesEvaluate,
  postCompendiumsRunesRecognize,
} from '@/services/apifox/NODEJSDEMO/SWCRUNE/apifox'
import type {
  getCompendiumsRunesMetadataQuery,
  getCompendiumsRunesMetadataRes,
  postCompendiumsRunesEvaluateBody,
  postCompendiumsRunesEvaluateRes,
  postCompendiumsRunesRecognizeRes,
} from '@/services/apifox/NODEJSDEMO/SWCRUNE/interface'

export type RuneRecognitionResult = postCompendiumsRunesRecognizeRes
export type RuneEvaluationResponse = postCompendiumsRunesEvaluateRes
export type RuneMetadataResponse = getCompendiumsRunesMetadataRes

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null
const isString = (value: unknown): value is string => typeof value === 'string'
const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)
const isStringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every(isString)
const isNullableNumber = (value: unknown): boolean => value === null || isNumber(value)

const isMetadata = (value: unknown): value is RuneScoreMetadata =>
  isRecord(value) &&
  isString(value.ruleVersion) &&
  Array.isArray(value.sets) &&
  value.sets.every(item => isRecord(item) && isString(item.key) && isString(item.name)) &&
  Array.isArray(value.stats) &&
  value.stats.every(item => isRecord(item) && isString(item.key) && isString(item.name))

const isRecognitionResult = (value: unknown): value is RuneRecognitionResult =>
  isRecord(value) &&
  isRecord(value.rune) &&
  Array.isArray(value.pendingFields) &&
  isStringArray(value.pendingFields) &&
  isStringArray(value.warnings)

const isEvaluationResult = (value: unknown): value is RuneEvaluationResult => {
  if (!isRecord(value)) return false
  const quality = value.quality
  const suitability = value.suitability
  const recommendation = value.recommendation
  if (!isRecord(quality) || !isRecord(suitability) || !isRecord(recommendation) || !Array.isArray(value.monsters)) return false
  const potential = quality.maxPotentialRange
  const validBreakdown =
    Array.isArray(quality.scoreBreakdown) &&
    quality.scoreBreakdown.every(
      item => isRecord(item) && isString(item.key) && isString(item.label) && isNumber(item.score) && isString(item.explanation),
    )
  const validRoles =
    Array.isArray(suitability.roles) &&
    suitability.roles.every(item => isRecord(item) && isString(item.key) && isNumber(item.score) && isStringArray(item.reasons))
  const validMonsters = value.monsters.every(
    item =>
      isRecord(item) &&
      isString(item.characterId) &&
      isString(item.context) &&
      isStringArray(item.matchedReasons) &&
      isStringArray(item.warnings),
  )
  return (
    isNumber(quality.qualityScore) &&
    isString(quality.qualityGrade) &&
    isNullableNumber(quality.efficiencyPercent) &&
    isNullableNumber(quality.efficiencyMaxPercent) &&
    isNullableNumber(quality.refinedEfficiencyPercent) &&
    isNumber(quality.currentPotential) &&
    isRecord(potential) &&
    isNumber(potential.min) &&
    isNumber(potential.max) &&
    validBreakdown &&
    isStringArray(quality.warnings) &&
    isString(quality.ruleVersion) &&
    (suitability.bestRole === null || isString(suitability.bestRole)) &&
    validRoles &&
    isStringArray(suitability.strengths) &&
    isStringArray(suitability.weaknesses) &&
    isString(recommendation.action) &&
    isString(recommendation.title) &&
    isString(recommendation.nextStep) &&
    isStringArray(recommendation.reasons) &&
    typeof recommendation.observeFurther === 'boolean' &&
    validMonsters &&
    isString(value.ruleVersion)
  )
}

export const getRuneScoreMetadata = async (): Promise<RuneScoreMetadata> => {
  const query: getCompendiumsRunesMetadataQuery = { compendiumId: 'swc' }
  const response = (await getCompendiumsRunesMetadata(query)) as RuneMetadataResponse
  if (!isMetadata(response)) throw new Error('符文规则数据格式异常，请稍后重试。')
  return response
}

export const recognizeRuneImage = async (
  filePath: string,
  onTask?: (task: { abort: () => void }) => void,
): Promise<RuneRecognitionResult> => {
  const response = (await postCompendiumsRunesRecognize(
    { filePath, compendiumId: 'swc' },
    { timeout: 90_000, onTask },
  )) as RuneRecognitionResult
  if (!isRecognitionResult(response)) throw new Error('识图服务返回格式异常，可继续手动填写。')
  return response
}

export const evaluateRune = async (request: RuneScoreEvaluationRequest): Promise<RuneEvaluationResult> => {
  const body: postCompendiumsRunesEvaluateBody = request
  const response = (await postCompendiumsRunesEvaluate(body)) as RuneEvaluationResponse
  if (!isEvaluationResult(response)) throw new Error('评分服务返回数据不完整，请重试或手动核对。')
  return response
}

export const normalizeRuneRecognitionErrorCode = (error: unknown): string | undefined => {
  if (!error || typeof error !== 'object') return undefined
  const failure = error as { errorCode?: string; data?: { reason?: string }; message?: string }
  return failure.errorCode || failure.data?.reason
}
