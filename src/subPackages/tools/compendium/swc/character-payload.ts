export type CharacterRecord = Record<string, unknown>

export interface CharacterAttributePayload {
  key: string
  value: number | string
}

export const isRecord = (value: unknown): value is CharacterRecord => typeof value === 'object' && value !== null && !Array.isArray(value)

export const toArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])

export const extractData = (res: unknown): CharacterRecord => {
  if (isRecord(res) && isRecord(res.data)) return res.data as CharacterRecord
  if (isRecord(res)) return res
  return {}
}

export const toText = (value: unknown): string => {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  return ''
}

export const cloneAttribute = (source: unknown): CharacterRecord => (isRecord(source) ? { ...source } : {})

export const normalizeNumberLike = (value: string): number | string | undefined => {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  const parsed = Number(trimmed)
  return Number.isNaN(parsed) ? trimmed : parsed
}

const findAttribute = (attributes: CharacterRecord[], key: string): CharacterRecord | undefined =>
  attributes.find(item => toText(item.key) === key || toText(item.name) === key)

export const readStarsAttributeText = (attributes: CharacterRecord[]): string => {
  const attribute = findAttribute(attributes, 'stars')
  if (!attribute) return ''
  const text = toText(attribute.value ?? attribute.rawValue ?? attribute.total ?? attribute.displayValue ?? attribute.text)
  const digits = text.replace(/\D+/g, '')
  return digits || text
}

export const toNumberValue = (value: string): number | undefined => {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : undefined
}

export const buildAttributesPayload = (attributes: CharacterRecord[], starsValue?: number): CharacterAttributePayload[] => {
  const list = attributes
    .map(item => {
      const key = toText(item.key) || toText(item.name)
      const rawValue = item.value ?? item.rawValue ?? item.displayValue ?? item.text
      return { key, value: normalizeNumberLike(toText(rawValue)) }
    })
    .filter((item): item is CharacterAttributePayload => Boolean(item.key) && item.value !== undefined)

  if (typeof starsValue === 'number' && Number.isFinite(starsValue)) {
    const index = list.findIndex(item => item.key === 'stars')
    if (index >= 0) {
      list[index] = { key: 'stars', value: starsValue }
    } else {
      list.push({ key: 'stars', value: starsValue })
    }
  }

  return list
}

export const buildCategoriesPayload = (categories: CharacterRecord[]): Record<string, string> => {
  const result: Record<string, string> = {}
  categories.forEach(item => {
    const key = toText(item.key) || toText(item.name)
    const value = toText(item.valueKey) || toText(item.value)
    if (key && value) {
      result[key] = value
    }
  })
  return result
}
