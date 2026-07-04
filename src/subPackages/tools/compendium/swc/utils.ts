import type { LineupCharacterPreview } from '@/services/compendium-lineups'

export interface SwcCharacterView {
  characterId: string
  name: string
  avatar: string
  elementKey: string
  elementName: string
  familyName: string
  archetype: string
  stars: string
  displayStars: number
  awaken: string
}

export type SwcCharacterSource = Partial<
  Pick<
    LineupCharacterPreview,
    | 'characterId'
    | 'id'
    | 'name'
    | 'label'
    | 'avatar'
    | 'element'
    | 'elementKey'
    | 'elementName'
    | 'archetype'
    | 'familyKey'
    | 'familyName'
    | 'awaken'
    | 'awakenName'
    | 'stars'
  >
> & {
  family?: string
  displayStars?: number
  birthStars?: number
}

const toText = (value: unknown): string => {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  return ''
}

const toNumber = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return 0
}

export const parseBirthStars = (starsText: string, awakenText: string): number => {
  const starsValue = Number.parseInt((starsText || '').replace(/\D+/g, ''), 10)
  if (!Number.isFinite(starsValue) || starsValue <= 0) {
    return 0
  }

  const awakenValue = (awakenText || '').toLowerCase()
  if (!awakenValue) return starsValue
  if (awakenValue.includes('unawaken') || awakenValue.includes('未觉醒') || awakenValue.includes('觉醒前')) {
    return starsValue
  }
  if (awakenValue.includes('awaken') || awakenValue.includes('觉醒')) {
    return Math.max(starsValue - 1, 0)
  }
  return starsValue
}

export const toSwcCharacterView = (source: SwcCharacterSource): SwcCharacterView => {
  const stars = toText(source.stars)
  const awaken = toText(source.awaken)
  const displayStars = source.displayStars ?? source.birthStars ?? parseBirthStars(stars, awaken)

  return {
    characterId: toText(source.characterId || source.id),
    name: toText(source.name || source.label),
    avatar: toText(source.avatar),
    elementKey: toText(source.elementKey || source.element),
    elementName: toText(source.elementName || source.element),
    familyName: toText(source.familyName || source.family),
    archetype: toText(source.archetype),
    stars,
    displayStars: toNumber(displayStars),
    awaken,
  }
}
