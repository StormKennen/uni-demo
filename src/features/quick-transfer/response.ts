import type {
  QuickTransferContent,
  QuickTransferContentLink,
  QuickTransferContentReference,
  QuickTransferFileMetadata,
  QuickTransferResolvedResult,
} from './types'
import { getQuickTransferMimeType } from './helpers'

const asRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

const asRuntimeValue = (value: unknown): unknown => {
  if (typeof value !== 'string') return value
  try {
    return JSON.parse(value) as unknown
  } catch {
    return value
  }
}

const unwrapData = (value: unknown): Record<string, unknown> => {
  const parsed = asRuntimeValue(value)
  const record = asRecord(parsed)
  if (!record) throw new Error('快船接口返回格式异常')
  const data = asRecord(record.data)
  if (data && Object.keys(data).length > 0) return data
  return record
}

const requiredString = (records: Array<Record<string, unknown> | null>, key: string): string => {
  const value = records.map(record => record?.[key]).find(candidate => typeof candidate === 'string' && candidate)
  if (typeof value !== 'string') throw new Error(`快船接口缺少 ${key}`)
  return value
}

const toArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])

const normalizeFile = (value: unknown): QuickTransferFileMetadata | undefined => {
  const record = asRecord(value)
  if (!record) return undefined
  const name = typeof record.name === 'string' ? record.name : ''
  const size = typeof record.size === 'number' ? record.size : Number(record.size)
  const fileId = typeof record.fileId === 'string' ? record.fileId : typeof record.id === 'string' ? record.id : undefined
  const selectedMimeType = typeof record.mimeType === 'string' ? record.mimeType : typeof record.type === 'string' ? record.type : undefined
  if (!name || !Number.isFinite(size)) return undefined
  return { fileId, name, size, mimeType: getQuickTransferMimeType(name, selectedMimeType) }
}

const normalizeLink = (value: unknown): QuickTransferContentLink | undefined => {
  const record = asRecord(value)
  if (!record || typeof record.url !== 'string') return undefined
  return {
    title: typeof record.title === 'string' ? record.title : undefined,
    url: record.url,
  }
}

const normalizeReference = (value: unknown): QuickTransferContentReference | undefined => {
  const record = asRecord(value)
  if (!record || typeof record.type !== 'string' || typeof record.title !== 'string') return undefined
  const params = asRecord(record.params)
  return {
    type: record.type,
    resourceId: typeof record.resourceId === 'string' ? record.resourceId : undefined,
    params: params || undefined,
    title: record.title,
    subtitle: typeof record.subtitle === 'string' ? record.subtitle : undefined,
  }
}

const normalizeContent = (value: unknown): QuickTransferContent => {
  const record = asRecord(value) || {}
  const text = typeof record.text === 'string' ? record.text : undefined
  const links = toArray(record.links)
    .map(normalizeLink)
    .filter((item): item is QuickTransferContentLink => Boolean(item))
  const files = toArray(record.files)
    .map(normalizeFile)
    .filter((item): item is QuickTransferFileMetadata => Boolean(item))
  const references = toArray(record.references)
    .map(normalizeReference)
    .filter((item): item is QuickTransferContentReference => Boolean(item))
  return { text, links, files, references }
}

export const normalizeQuickTransferResolvedResult = (response: unknown): QuickTransferResolvedResult => {
  const record = unwrapData(response)
  const content = normalizeContent(record.content)
  return {
    transferId: requiredString([record, asRecord(record.content)], 'transferId'),
    claimToken: requiredString([record], 'claimToken'),
    content,
  }
}
