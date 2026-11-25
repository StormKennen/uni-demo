export type RuneStat = 'HP' | 'HP%' | 'ATK' | 'ATK%' | 'DEF' | 'DEF%' | 'SPD' | 'CR' | 'CD' | 'ACC' | 'RES'
export type RuneGrade = 'common' | 'magic' | 'rare' | 'hero' | 'legend'
export type RuneContext = 'rta' | 'siege' | 'arena' | 'pve' | 'general'
export type PlayerStage = 'early' | 'mid' | 'late'
export type RuneAction = 'KEEP' | 'POWER_UP' | 'GRIND' | 'GEM' | 'REAPPRAISE' | 'CONSIDER_SELL' | 'REVIEW_REQUIRED'

export interface RuneProperty {
  stat: RuneStat | null
  value: number | null
  refineValue?: number | null
  gemState?: 'none' | 'converted' | 'unknown'
  unknown?: boolean
  ambiguous?: boolean
}

export interface RuneRecognition {
  status: 'manual' | 'recognized' | 'needs_review' | 'failed'
  fieldStatus: Record<string, 'recognized' | 'needs_review' | 'unknown'>
  pendingFields: string[]
  warnings: string[]
}

export interface RuneData {
  game: 'swc'
  setKey: string | null
  slot: number | null
  stars: number | null
  grade: RuneGrade | null
  ancient: boolean | null
  level: number | null
  mainStat: RuneProperty | null
  innateStat: RuneProperty | null
  subStats: RuneProperty[]
  recognition: RuneRecognition
  source: 'image' | 'manual'
}

export interface RuneScoreMetadata {
  ruleVersion: string
  sets: Array<{ key: string; name: string }>
  stats: Array<{ key: RuneStat; name: string; valueType: 'flat' | 'percent' }>
  slots: number[]
  contexts: Array<{ key: RuneContext; label: string }>
  playerStages: Array<{ key: PlayerStage; label: string }>
  grades: Array<{ key: RuneGrade; label: string }>
}

export interface RuneQualityResult {
  efficiencyPercent: number | null
  efficiencyMaxPercent: number | null
  refinedEfficiencyPercent: number | null
  qualityScore: number
  qualityGrade: string
  currentPotential: number
  maxPotentialRange: { min: number; max: number }
  scoreBreakdown: Array<{ key: string; label: string; score: number; explanation: string }>
  warnings: string[]
  ruleVersion: string
}

export interface RuneSuitabilityResult {
  bestRole: string | null
  roles: Array<{ key: string; label: string; score: number; reasons: string[] }>
  strengths: string[]
  weaknesses: string[]
}

export interface RuneAdviceResult {
  action: RuneAction
  title: string
  reasons: string[]
  nextStep: string
  observeFurther: boolean
  playerStage: PlayerStage
}

export interface RuneMonsterRecommendation {
  characterId: string
  characterCode: string
  name: string
  avatar: string
  element: string
  context: RuneContext
  matchScore: number
  matchLevel: 'high' | 'medium' | 'low'
  matchedReasons: string[]
  warnings: string[]
  matchedRuneSet: string | null
  matchedMainStat: string | null
  matchedSubStats: string[]
  dataSource: string
  dataQuality: string
}

export interface RuneEvaluationResult {
  quality: RuneQualityResult
  suitability: RuneSuitabilityResult
  recommendation: RuneAdviceResult
  monsters: RuneMonsterRecommendation[]
  ruleVersion: string
  recommendationWarning?: string
}

export interface RuneScoreEvaluationRequest {
  compendiumId: 'swc'
  rune: RuneData
  context: RuneContext
  playerStage: PlayerStage
  recommendationLimit: 5 | 10
}

export interface ApiFailure extends Error {
  errorCode?: string
  data?: unknown
}

export const RUNE_STAT_OPTIONS: RuneStat[] = ['HP', 'HP%', 'ATK', 'ATK%', 'DEF', 'DEF%', 'SPD', 'CR', 'CD', 'ACC', 'RES']
export const RUNE_GRADE_OPTIONS: RuneGrade[] = ['common', 'magic', 'rare', 'hero', 'legend']
export const RUNE_CONTEXT_OPTIONS: Array<{ key: RuneContext; label: string }> = [
  { key: 'rta', label: 'RTA' },
  { key: 'siege', label: '占领战' },
  { key: 'arena', label: '竞技场' },
  { key: 'pve', label: 'PVE' },
  { key: 'general', label: '综合' },
]
export const PLAYER_STAGE_OPTIONS: Array<{ key: PlayerStage; label: string }> = [
  { key: 'early', label: '前期' },
  { key: 'mid', label: '中期' },
  { key: 'late', label: '后期' },
]

export const createEmptyRune = (): RuneData => ({
  game: 'swc',
  setKey: null,
  slot: null,
  stars: null,
  grade: null,
  ancient: null,
  level: null,
  mainStat: { stat: null, value: null },
  innateStat: null,
  subStats: Array.from({ length: 4 }, () => ({ stat: null, value: null, refineValue: null, gemState: 'unknown', unknown: true })),
  recognition: { status: 'manual', fieldStatus: {}, pendingFields: [], warnings: [] },
  source: 'manual',
})

export const RUNE_SET_LABELS: Record<string, string> = {
  Energy: '能量',
  Guard: '守护',
  Swift: '迅速',
  Blade: '刀刃',
  Rage: '激怒',
  Focus: '集中',
  Endure: '忍耐',
  Fatal: '猛攻',
  Despair: '绝望',
  Vampire: '吸血',
  Nemesis: '复仇',
  Violent: '暴走',
  Will: '意志',
  Shield: '护盾',
  Revenge: '反击',
  Destroy: '毁灭',
  Fight: '斗志',
  Determination: '决心',
  Enhance: '强化',
  Accuracy: '命中',
  Tolerance: '抵抗',
  Seal: '封印',
  Intangible: '幻影',
}

export const formatStatLabel = (stat: string | null): string => {
  if (!stat) return '未识别'
  const labels: Record<string, string> = {
    HP: '体力',
    'HP%': '体力%',
    ATK: '攻击',
    'ATK%': '攻击%',
    DEF: '防御',
    'DEF%': '防御%',
    SPD: '速度',
    CR: '暴击率',
    CD: '暴击伤害',
    ACC: '效果命中',
    RES: '效果抵抗',
  }
  return labels[stat] || stat
}

export const runeSetLabel = (key: string | null): string => (key ? `${RUNE_SET_LABELS[key] || key}（${key}）` : '选择符文套装')
export const gradeLabel = (grade: RuneGrade | null): string =>
  ({ common: '普通', magic: '魔法', rare: '稀有', hero: '英雄', legend: '传说' })[grade || 'common']
export const actionLabel = (action: RuneAction): string =>
  ({
    KEEP: '建议保留',
    POWER_UP: '建议强化观察',
    GRIND: '建议精炼',
    GEM: '建议宝石转换',
    REAPPRAISE: '建议重新评估',
    CONSIDER_SELL: '可考虑出售',
    REVIEW_REQUIRED: '需要复核',
  })[action]
export const roleLabel = (key: string): string =>
  ({
    speed_support: '高速辅助',
    control_support: '控制辅助',
    burst_damage: '爆发输出',
    sustained_damage: '持续输出',
    tank_survival: '坦克生存',
    counter: '反击 / 反伤',
  })[key] || key
export const errorLabel = (code?: string): string =>
  ({
    INVALID_IMAGE: '图片无效，请上传清晰的 JPEG 或 PNG 符文截图。',
    NOT_RUNE_SCREENSHOT: '未能确认这是符文界面，可以改为手动填写。',
    MULTIPLE_RUNES: '图片中可能包含多个符文，请裁剪后重试。',
    LOW_CONFIDENCE: '部分字段无法可靠识别，请在下方核对或手动录入。',
    MODEL_UNAVAILABLE: '图片识别服务暂不可用，可继续手动填写。',
    MODEL_NOT_MULTIMODAL: '当前模型不支持图片输入，可继续手动填写。',
    MODEL_TIMEOUT: '识别超时，可稍后重试或手动填写。',
  })[code || ''] || '识别未完成，可继续手动填写符文属性。'
