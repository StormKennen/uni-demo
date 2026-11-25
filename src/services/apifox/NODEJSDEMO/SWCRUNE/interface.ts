/**
 * @description SWCRune/识别符文截图（仅抽取字段）--接口请求Body参数
 * @url POST /compendiums/runes/recognize
 */
export interface postCompendiumsRunesRecognizeBody {
  /** 图鉴标识 */
  compendiumId: 'swc'
  /** 符文图片，multipart/form-data 文件字段；项目通过 uni.uploadFile 临时路径提交 */
  image: string
}

export type SwcRuneStat = 'HP' | 'HP%' | 'ATK' | 'ATK%' | 'DEF' | 'DEF%' | 'SPD' | 'CR' | 'CD' | 'ACC' | 'RES'
export type SwcRuneGrade = 'common' | 'magic' | 'rare' | 'hero' | 'legend'
export type SwcRuneContext = 'rta' | 'siege' | 'arena' | 'pve' | 'general'
export type SwcRuneStage = 'early' | 'mid' | 'late'

export interface SwcRuneProperty {
  stat: SwcRuneStat | null
  value: number | null
  refineValue?: number | null
  gemState?: 'none' | 'converted' | 'unknown'
  unknown?: boolean
  ambiguous?: boolean
}

export interface SwcRuneData {
  game: 'swc'
  setKey: string | null
  slot: number | null
  stars: number | null
  grade: SwcRuneGrade | null
  ancient: boolean | null
  level: number | null
  mainStat: SwcRuneProperty | null
  innateStat: SwcRuneProperty | null
  subStats: SwcRuneProperty[]
  recognition: {
    status: 'manual' | 'recognized' | 'needs_review' | 'failed'
    fieldStatus: Record<string, 'recognized' | 'needs_review' | 'unknown'>
    pendingFields: string[]
    warnings: string[]
  }
  source: 'image' | 'manual'
}

/**
 * @description SWCRune/确定性评估符文并推荐适配人物--接口请求Body参数
 * @url POST /compendiums/runes/evaluate
 */
export interface postCompendiumsRunesEvaluateBody {
  compendiumId: 'swc'
  rune: SwcRuneData
  context?: SwcRuneContext
  playerStage: SwcRuneStage
  recommendationLimit?: 5 | 10
}

/**
 * @description SWCRune/获取 SWC 符文规则元数据--接口请求Query参数
 * @url GET /compendiums/runes/metadata
 */
export interface getCompendiumsRunesMetadataQuery {
  compendiumId: 'swc'
}

export interface SwcRuneRecognitionResult {
  rune: SwcRuneData
  fieldStatus: Record<string, 'recognized' | 'needs_review' | 'unknown'>
  pendingFields: string[]
  warnings: string[]
}

export interface SwcRuneScoreMetadata {
  ruleVersion: string
  sets: Array<{ key: string; name: string }>
  stats: Array<{ key: SwcRuneStat; name: string; valueType: 'flat' | 'percent' }>
  slots: number[]
  contexts: Array<{ key: SwcRuneContext; label: string }>
  playerStages: Array<{ key: SwcRuneStage; label: string }>
  grades: Array<{ key: SwcRuneGrade; label: string }>
}

export interface SwcRuneEvaluationResult {
  compendiumId: 'swc'
  rune: SwcRuneData
  context: SwcRuneContext
  playerStage: SwcRuneStage
  quality: {
    efficiencyPercent: number | null
    efficiencyMaxPercent: number | null
    refinedEfficiencyPercent: number | null
    qualityScore: number
    qualityGrade: 'high' | 'promising' | 'moderate' | 'developing'
    currentPotential: number
    maxPotentialRange: { min: number; max: number }
    scoreBreakdown: Array<{ key: string; label: string; score: number; explanation: string }>
    warnings: string[]
    ruleVersion: string
  }
  suitability: {
    bestRole: string | null
    roles: Array<{ key: string; label: string; score: number; reasons: string[] }>
    strengths: string[]
    weaknesses: string[]
  }
  recommendation: {
    action: 'KEEP' | 'POWER_UP' | 'GRIND' | 'GEM' | 'REAPPRAISE' | 'CONSIDER_SELL' | 'REVIEW_REQUIRED'
    title: string
    reasons: string[]
    nextStep: string
    observeFurther: boolean
    playerStage: SwcRuneStage
  }
  monsters: Array<{
    characterId: string
    characterCode: string
    name: string
    avatar: string
    element: string
    context: SwcRuneContext
    matchScore: number
    matchLevel: 'high' | 'medium' | 'low'
    matchedReasons: string[]
    warnings: string[]
    matchedRuneSet: string | null
    matchedMainStat: string | null
    matchedSubStats: string[]
    dataSource: string
    dataQuality: string
  }>
  recommendationLimit: 5 | 10
  ruleVersion: string
  recommendationWarning?: string
}

/**
 * @description SWCRune/识别符文截图（仅抽取字段）--接口返回值
 * @url POST /compendiums/runes/recognize
 */
export type postCompendiumsRunesRecognizeRes = SwcRuneRecognitionResult

/**
 * @description SWCRune/确定性评估符文并推荐适配人物--接口返回值
 * @url POST /compendiums/runes/evaluate
 */
export type postCompendiumsRunesEvaluateRes = SwcRuneEvaluationResult

/**
 * @description SWCRune/获取 SWC 符文规则元数据--接口返回值
 * @url GET /compendiums/runes/metadata
 */
export type getCompendiumsRunesMetadataRes = SwcRuneScoreMetadata
