export type DamageStatKey = 'hp' | 'attack' | 'defense' | 'speed'

export interface DamageStats {
  hp: number
  attack: number
  defense: number
  speed: number
  critRate: number
  critDamage: number
}

export interface SkillCoefficientInput {
  name?: string
  value?: string | number | null
  formula?: string
  unit?: string
}

export interface SkillDamageInput {
  multiplierFormula?: string
  hitCount?: string | number | null
  coefficients?: SkillCoefficientInput[]
}

export interface DamageTerm {
  statKey: DamageStatKey
  coefficient: number
  sourceText: string
}

export interface SkillDamageResult {
  calculable: boolean
  formulaText: string
  hitCount: number
  terms: DamageTerm[]
  singleNormal: number
  totalNormal: number
  totalCritical: number
  totalExpected: number
}

const STAT_PATTERNS: Array<{ key: DamageStatKey; patterns: RegExp[] }> = [
  { key: 'attack', patterns: [/攻击力?/, /\batk\b/i, /\battack\b/i] },
  { key: 'defense', patterns: [/防御力?/, /\bdef\b/i, /\bdefense\b/i] },
  { key: 'hp', patterns: [/体力/, /生命/, /\bhp\b/i, /\bhealth\b/i] },
  { key: 'speed', patterns: [/速度/, /\bspd\b/i, /\bspeed\b/i] },
]

const numberPattern = /-?\d+(?:\.\d+)?/

export function parseNumber(value: string | number | null | undefined): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value !== 'string') return 0

  const normalized = value.replace(/,/g, '').trim()
  const matched = normalized.match(numberPattern)
  if (!matched) return 0

  const parsed = Number(matched[0])
  return Number.isFinite(parsed) ? parsed : 0
}

function detectStatKey(text: string): DamageStatKey | null {
  const normalized = text.toLowerCase()
  const matched = STAT_PATTERNS.find(item => item.patterns.some(pattern => pattern.test(normalized)))
  return matched?.key || null
}

function parseCoefficient(text: string): number {
  const percentMatch = text.match(/(-?\d+(?:\.\d+)?)\s*%/)
  if (percentMatch) return Number(percentMatch[1]) / 100

  const numeric = parseNumber(text)
  if (!numeric) return 0

  return Math.abs(numeric) > 10 ? numeric / 100 : numeric
}

function splitFormulaText(text: string): string[] {
  return text
    .replace(/[(){}[\]]/g, ' ')
    .split(/[+＋/／,，;；|]/)
    .map(item => item.trim())
    .filter(Boolean)
}

function parseTermsFromText(text: string): DamageTerm[] {
  const source = text.trim()
  if (!source) return []

  const chunks = splitFormulaText(source)
  const candidates = chunks.length ? chunks : [source]

  return candidates
    .map(chunk => {
      const statKey = detectStatKey(chunk)
      const coefficient = parseCoefficient(chunk)
      if (!statKey || coefficient <= 0) return null

      return {
        statKey,
        coefficient,
        sourceText: chunk,
      }
    })
    .filter((item): item is DamageTerm => Boolean(item))
}

function parseTermsFromCoefficient(coefficient: SkillCoefficientInput): DamageTerm[] {
  const text = [coefficient.name, coefficient.formula, coefficient.value, coefficient.unit].filter(Boolean).join(' ')
  return parseTermsFromText(text)
}

function normalizeHitCount(value: string | number | null | undefined): number {
  const parsed = parseNumber(value)
  if (!parsed || parsed < 1) return 1
  return Math.max(1, Math.floor(parsed))
}

function roundDamage(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.round(value))
}

export function calculateSkillDamage(input: SkillDamageInput, stats: DamageStats): SkillDamageResult {
  const coefficientTerms = (input.coefficients || []).flatMap(parseTermsFromCoefficient)
  const formulaTerms = coefficientTerms.length ? [] : parseTermsFromText(input.multiplierFormula || '')
  const terms = coefficientTerms.length ? coefficientTerms : formulaTerms
  const hitCount = normalizeHitCount(input.hitCount)
  const formulaText = input.multiplierFormula || terms.map(item => item.sourceText).join(' + ')

  if (!terms.length) {
    return {
      calculable: false,
      formulaText,
      hitCount,
      terms: [],
      singleNormal: 0,
      totalNormal: 0,
      totalCritical: 0,
      totalExpected: 0,
    }
  }

  const singleNormal = terms.reduce((sum, term) => sum + stats[term.statKey] * term.coefficient, 0)
  const totalNormal = singleNormal * hitCount
  const critRate = Math.min(100, Math.max(0, stats.critRate))
  const critDamage = Math.max(0, stats.critDamage)
  const totalCritical = totalNormal * (1 + critDamage / 100)
  const totalExpected = totalNormal * (1 + (critRate / 100) * (critDamage / 100))

  return {
    calculable: true,
    formulaText,
    hitCount,
    terms,
    singleNormal: roundDamage(singleNormal),
    totalNormal: roundDamage(totalNormal),
    totalCritical: roundDamage(totalCritical),
    totalExpected: roundDamage(totalExpected),
  }
}
