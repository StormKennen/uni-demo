import { normalizeSwcArchetype } from '../icon-assets'
import type { TierRankingCharacter, TierRankingConfig, TierRankingItem, TierRankingOption, TierRankingReport } from './types'

type UnknownRecord = Record<string, unknown>

const isRecord = (value: unknown): value is UnknownRecord => typeof value === 'object' && value !== null && !Array.isArray(value)

const toRecord = (value: unknown): UnknownRecord => (isRecord(value) ? value : {})

const toText = (value: unknown): string => {
  if (typeof value === 'string') return value
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return ''
}

const toNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

const unwrapBusinessData = (response: unknown): UnknownRecord => {
  const root = toRecord(response)
  return isRecord(root.data) ? root.data : root
}

const normalizeOption = (source: unknown, fallbackKey = ''): TierRankingOption => {
  const record = toRecord(source)
  const key = toText(record.key ?? record.value) || fallbackKey
  const name = toText(record.name ?? record.label) || key
  const sortOrder = toNumber(record.sortOrder)
  return {
    key,
    name,
    ...(sortOrder === null ? {} : { sortOrder }),
  }
}

const DEFAULT_STAR_OPTIONS: TierRankingOption[] = ['6', '5', '4', '3', '2', '1'].map(key => ({ key, name: key }))
const DEFAULT_ARCHETYPE_OPTIONS: TierRankingOption[] = [
  { key: 'attack', name: '攻击型' },
  { key: 'defense', name: '防御型' },
  { key: 'hp', name: '体力型' },
  { key: 'support', name: '辅助型' },
]

const normalizeValueKey = (source: unknown): string => {
  const text = toText(source)
  if (text) return text
  return normalizeOption(source).key
}

const findCategoryValue = (categories: unknown, key: string): string => {
  if (!Array.isArray(categories)) return ''
  const category = categories.find(item => {
    const record = toRecord(item)
    return toText(record.key) === key
  })
  const record = toRecord(category)
  return normalizeValueKey(record.valueKey) || normalizeValueKey(record.value) || normalizeValueKey(record.name)
}

const normalizeCharacter = (source: unknown): TierRankingCharacter | null => {
  const record = toRecord(source)
  const id = toText(record.id ?? record._id ?? record.characterId)
  if (!id) return null
  const stars = toNumber(record.stars)
  const archetype =
    normalizeValueKey(record.archetype) ||
    normalizeValueKey(record.archetypeKey) ||
    normalizeValueKey(record.speciesType) ||
    findCategoryValue(record.categories, 'archetype')
  return {
    id,
    code: toText(record.code),
    name: toText(record.name) || toText(record.code),
    avatar: toText(record.avatar),
    stars,
    element: record.element ? normalizeOption(record.element) : null,
    archetype: normalizeSwcArchetype(archetype),
  }
}

const normalizeItem = (source: unknown, index: number): TierRankingItem => {
  const record = toRecord(source)
  const tier = normalizeOption(record.tier)
  const sourceRecord = toRecord(record.source)
  return {
    id: toText(record.id) || `${tier.key}:${index}`,
    rank: toNumber(record.rank) ?? toNumber(record.sortOrder) ?? index + 1,
    character: normalizeCharacter(record.character),
    tier,
    sortOrder: toNumber(record.sortOrder) ?? index + 1,
    score: toNumber(record.score),
    source: {
      externalKey: toText(sourceRecord.externalKey),
      name: toText(sourceRecord.name),
    },
  }
}

export const normalizeTierRankingConfig = (response: unknown): TierRankingConfig => {
  const data = unwrapBusinessData(response)
  const rawProviders = Array.isArray(data.providers) ? data.providers : []
  const rawRegions = Array.isArray(data.regions) ? data.regions : []
  const rawTiers = Array.isArray(data.tiers) ? data.tiers : []
  const rawElements = Array.isArray(data.elements) ? data.elements : []
  const rawStars = Array.isArray(data.stars) ? data.stars : []
  const rawArchetypes = Array.isArray(data.archetypes) ? data.archetypes : []
  const capabilities = toRecord(data.capabilities)
  return {
    provider: toText(data.provider),
    providers: rawProviders.map(toText).filter(Boolean),
    regions: rawRegions.map(toText).filter(Boolean),
    tiers: rawTiers.map(item => normalizeOption(item)).filter(item => Boolean(item.key)),
    elements: rawElements.map(item => normalizeOption(item)).filter(item => Boolean(item.key)),
    stars: (rawStars.length ? rawStars : DEFAULT_STAR_OPTIONS).map(item => normalizeOption(item)).filter(item => Boolean(item.key)),
    archetypes: (rawArchetypes.length ? rawArchetypes : DEFAULT_ARCHETYPE_OPTIONS)
      .map(item => normalizeOption(item))
      .filter(item => Boolean(item.key)),
    capabilities: {
      tierRanking: capabilities.tierRanking === true,
      mapping: capabilities.mapping === true,
      import: capabilities.import === true,
      publish: capabilities.publish === true,
      history: capabilities.history === true,
    },
  }
}

export const normalizeTierRankingReport = (response: unknown): TierRankingReport => {
  const data = unwrapBusinessData(response)
  const rawItems = Array.isArray(data.items) ? data.items : []
  const region = normalizeOption(data.region)
  return {
    available: data.available !== false,
    status: toText(data.status) === 'empty' ? 'empty' : 'published',
    reason: data.reason === null || data.reason === undefined ? null : toText(data.reason),
    id: toText(data.id),
    reportDate: data.reportDate === null ? null : toText(data.reportDate),
    season: data.season === null ? null : Math.floor(toNumber(data.season) ?? 0),
    gameVersion: toText(data.gameVersion),
    region,
    provider: toText(data.provider),
    revision: Math.floor(toNumber(data.revision) ?? 1),
    items: rawItems.map(normalizeItem),
  }
}

export const getTierRankingErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message) return error.message
  if (isRecord(error) && typeof error.message === 'string' && error.message) return error.message
  return fallback
}

export const formatReportDate = (value: string | null): string => {
  if (!value) return '--'
  const date = value.slice(0, 10)
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : value
}
