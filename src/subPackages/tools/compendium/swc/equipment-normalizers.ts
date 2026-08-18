import type {
  getCompendiumsCharacterEquipmentRes,
  getCompendiumsCharacterEquipmentResEquipmentRecommendationsArtifactsItem,
  getCompendiumsCharacterEquipmentResEquipmentRecommendationsArtifactsItemAttribute,
  getCompendiumsCharacterEquipmentResEquipmentRecommendationsArtifactsItemAttributePreferredEffects,
  getCompendiumsCharacterEquipmentResEquipmentRecommendationsRunesItem,
} from '@/services/apifox/NODEJSDEMO/EQUIPMENT/interface'

export interface EquipmentUsageViewModel {
  count: number | null
  rate: number | null
  text: string
}

export interface EquipmentRankedTextViewModel {
  key: string
  label: string
  rank: number | null
  usage: EquipmentUsageViewModel
}

export interface RuneSetViewModel {
  key: string
  rank: number | null
  runes: Array<{ key: string; label: string }>
  usage: EquipmentUsageViewModel
}

export interface RuneSlotViewModel {
  slot: '2' | '4' | '6'
  stats: EquipmentRankedTextViewModel[]
}

export interface RuneRecommendationViewModel {
  key: string
  context: string
  label: string
  sets: RuneSetViewModel[]
  slots: RuneSlotViewModel[]
  priorityStats: EquipmentRankedTextViewModel[]
}

export type ArtifactGroupKey = 'attribute' | 'type' | 'unspecified'

export interface ArtifactGroupViewModel {
  key: ArtifactGroupKey
  label: string
  primaries: EquipmentRankedTextViewModel[]
  preferredEffects: EquipmentRankedTextViewModel[]
}

export interface ArtifactRecommendationViewModel {
  key: string
  context: string
  label: string
  groups: ArtifactGroupViewModel[]
}

export interface EquipmentRecommendationsViewModel {
  runes: RuneRecommendationViewModel[]
  artifacts: ArtifactRecommendationViewModel[]
}

const toText = (value: unknown): string => {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return ''
}

const toNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return null
}

const formatUsage = (usage: unknown): EquipmentUsageViewModel => {
  const record = typeof usage === 'object' && usage !== null ? (usage as Record<string, unknown>) : {}
  const count = toNumber(record.count)
  const rate = toNumber(record.rate)
  const parts: string[] = []
  if (rate !== null) parts.push(`${(rate * 100).toFixed(rate >= 0.1 ? 1 : 2)}%`)
  if (count !== null) parts.push(`${count.toLocaleString('en-US')} 次`)
  return { count, rate, text: parts.join(' · ') }
}

const normalizeRankedText = (
  item: getCompendiumsCharacterEquipmentResEquipmentRecommendationsArtifactsItemAttributePreferredEffects,
  index: number,
  labelKeys: Array<'propertyZh' | 'property' | 'statZh' | 'stat'>,
): EquipmentRankedTextViewModel => {
  let label = ''
  const record = item as Record<string, unknown>
  for (const key of labelKeys) {
    label = toText(record[key])
    if (label) break
  }

  return {
    key: `${toText(record.effectId) || label || 'item'}-${index}`,
    label,
    rank: toNumber(record.rank),
    usage: formatUsage(record.usage),
  }
}

const normalizeContextLabel = (context: string, labelZh?: string, label?: string): string =>
  toText(labelZh) || toText(label) || context.toUpperCase() || '通用'

const normalizeRuneRecommendation = (
  item: getCompendiumsCharacterEquipmentResEquipmentRecommendationsRunesItem,
  index: number,
): RuneRecommendationViewModel => {
  const context = toText(item.context) || `context-${index}`
  const slotIds: Array<'2' | '4' | '6'> = ['2', '4', '6']

  return {
    key: context,
    context,
    label: normalizeContextLabel(context, item.labelZh, item.label),
    sets: (item.sets || []).map((set, setIndex) => {
      const setKeys = (set.sets || []).map(toText).filter(Boolean)
      const setLabels = (set.setsZh || []).map(toText)
      return {
        key: toText(set.setKey) || `${context}-set-${setIndex}`,
        rank: toNumber(set.rank),
        runes: setKeys.map((key, runeIndex) => ({ key, label: setLabels[runeIndex] || key })),
        usage: formatUsage(set.usage),
      }
    }),
    slots: slotIds.map(slot => ({
      slot,
      stats: (item.slots?.[slot] || []).map((stat, statIndex) => normalizeRankedText(stat, statIndex, ['statZh', 'stat'])),
    })),
    priorityStats: (item.priorityStats || []).map((stat, statIndex) => normalizeRankedText(stat, statIndex, ['statZh', 'stat'])),
  }
}

const ARTIFACT_GROUP_LABELS: Record<ArtifactGroupKey, string> = {
  attribute: '属性神器',
  type: '类型神器',
  unspecified: '通用神器',
}

const normalizeArtifactGroup = (
  key: ArtifactGroupKey,
  group?: getCompendiumsCharacterEquipmentResEquipmentRecommendationsArtifactsItemAttribute,
): ArtifactGroupViewModel => ({
  key,
  label: ARTIFACT_GROUP_LABELS[key],
  primaries: (group?.primaries || []).map((item, index) => normalizeRankedText(item, index, ['propertyZh', 'property'])),
  preferredEffects: (group?.preferredEffects || []).map((item, index) => normalizeRankedText(item, index, ['propertyZh', 'property'])),
})

const normalizeArtifactRecommendation = (
  item: getCompendiumsCharacterEquipmentResEquipmentRecommendationsArtifactsItem,
  index: number,
): ArtifactRecommendationViewModel => {
  const context = toText(item.context) || `context-${index}`
  const groups = (['attribute', 'type', 'unspecified'] as ArtifactGroupKey[])
    .map(key => normalizeArtifactGroup(key, item[key]))
    .filter(group => group.primaries.length > 0 || group.preferredEffects.length > 0)

  return {
    key: context,
    context,
    label: normalizeContextLabel(context, item.labelZh, item.label),
    groups,
  }
}

export const normalizeEquipmentRecommendations = (response: getCompendiumsCharacterEquipmentRes): EquipmentRecommendationsViewModel => {
  const recommendations = response.equipmentRecommendations
  return {
    runes: (recommendations?.runes || []).map(normalizeRuneRecommendation),
    artifacts: (recommendations?.artifacts || []).map(normalizeArtifactRecommendation).filter(item => item.groups.length > 0),
  }
}
