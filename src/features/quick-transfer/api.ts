import type {
  QuickTransferCreatePayload,
  QuickTransferCreateResult,
  QuickTransferDownloadDescriptor,
  QuickTransferFileMetadata,
  QuickTransferResolvedResult,
  QuickTransferStatusResult,
  QuickTransferStatus,
  QuickTransferUploadDescriptor,
} from './types'
import type { ParticalUniAppRequestOptions } from '@/services/interface'
import {
  deleteQuickTransfersTransferId,
  getQuickTransfersTransferId,
  postQuickTransfers,
  postQuickTransfersResolve,
  postQuickTransfersTransferIdComplete,
} from '@/services/apifox/NODEJSDEMO/QUICKTRANSFER/apifox'
import type { postQuickTransfersBody, postQuickTransfersResolveBody } from '@/services/apifox/NODEJSDEMO/QUICKTRANSFER/interface'
const receiveRequestConfig = { _skipGuestSession: true } as unknown as ParticalUniAppRequestOptions

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
  if (!record) throw new Error('快传接口返回格式异常')
  if (typeof record.transferId === 'string' || typeof record.status === 'string' || typeof record.code === 'string') return record
  return asRecord(record.data) || record
}

const requiredString = (record: Record<string, unknown>, key: string): string => {
  const value = record[key]
  if (typeof value !== 'string' || !value) throw new Error(`快传接口缺少 ${key}`)
  return value
}

const normalizeFile = (value: unknown): QuickTransferFileMetadata | undefined => {
  const record = asRecord(value)
  if (!record) return undefined
  const name = typeof record.name === 'string' ? record.name : ''
  const size = typeof record.size === 'number' ? record.size : Number(record.size)
  const mimeType = typeof record.mimeType === 'string' ? record.mimeType : ''
  if (!name || !Number.isFinite(size) || !mimeType) return undefined
  return { name, size, mimeType }
}

const normalizeUpload = (value: unknown): QuickTransferUploadDescriptor | undefined => {
  const record = asRecord(value)
  if (!record) return undefined
  const fieldsRecord = asRecord(record.fields)
  const url = typeof record.url === 'string' ? record.url : ''
  const expiresAt = typeof record.expiresAt === 'string' ? record.expiresAt : ''
  const fileField = typeof record.fileField === 'string' ? record.fileField : ''
  const successStatus = Number(record.successStatus)
  if (!fieldsRecord || !url || !expiresAt || !fileField || !Number.isFinite(successStatus)) return undefined

  const fields: Record<string, string> = {}
  Object.entries(fieldsRecord).forEach(([key, fieldValue]) => {
    fields[key] = typeof fieldValue === 'string' ? fieldValue : String(fieldValue ?? '')
  })
  return { method: 'POST', url, fileField, fields, successStatus, expiresAt }
}

const normalizeType = (value: unknown): 'text' | 'url' | 'file' => {
  if (value === 'text' || value === 'url' || value === 'file') return value
  throw new Error('快传接口返回了未知内容类型')
}

const normalizeStatusValue = (value: unknown): QuickTransferStatus => {
  if (
    value === 'uploading' ||
    value === 'ready' ||
    value === 'consumed' ||
    value === 'expired' ||
    value === 'cancelled' ||
    value === 'deleting' ||
    value === 'deleted'
  ) {
    return value
  }
  throw new Error('快传接口返回了未知状态')
}

export const createQuickTransfer = async (payload: QuickTransferCreatePayload): Promise<QuickTransferCreateResult> => {
  const response = await postQuickTransfers(payload as unknown as postQuickTransfersBody)
  const record = unwrapData(response)
  return {
    code: requiredString(record, 'code'),
    expiresAt: requiredString(record, 'expiresAt'),
    shareToken: requiredString(record, 'shareToken'),
    status: record.status === 'uploading' ? 'uploading' : 'ready',
    transferId: requiredString(record, 'transferId'),
    type: normalizeType(record.type),
    upload: normalizeUpload(record.upload),
  }
}

export const completeQuickTransfer = async (transferId: string): Promise<QuickTransferStatusResult> => {
  const response = await postQuickTransfersTransferIdComplete(transferId)
  return normalizeStatusResponse(response)
}

export const getQuickTransferStatus = async (transferId: string): Promise<QuickTransferStatusResult> => {
  const response = await getQuickTransfersTransferId(transferId)
  return normalizeStatusResponse(response)
}

export const cancelQuickTransfer = async (transferId: string): Promise<QuickTransferStatusResult> => {
  const response = await deleteQuickTransfersTransferId(transferId)
  return normalizeStatusResponse(response)
}

const normalizeStatusResponse = (response: unknown): QuickTransferStatusResult => {
  const record = unwrapData(response)
  const status = normalizeStatusValue(record.status)
  return {
    transferId: requiredString(record, 'transferId'),
    type: normalizeType(record.type),
    status,
    expiresAt: requiredString(record, 'expiresAt'),
    file: normalizeFile(record.file),
    consumedAt: typeof record.consumedAt === 'string' ? record.consumedAt : undefined,
    cancelledAt: typeof record.cancelledAt === 'string' ? record.cancelledAt : undefined,
  }
}

const normalizeDownload = (value: unknown): QuickTransferDownloadDescriptor | undefined => {
  const record = asRecord(value)
  if (!record || typeof record.url !== 'string' || typeof record.expiresAt !== 'string') return undefined
  return { url: record.url, expiresAt: record.expiresAt }
}

export const resolveQuickTransfer = async (input: { code?: string; shareToken?: string }): Promise<QuickTransferResolvedResult> => {
  const payload = input.shareToken ? { shareToken: input.shareToken } : { code: input.code || '' }
  const response = await postQuickTransfersResolve(payload as unknown as postQuickTransfersResolveBody, receiveRequestConfig)
  const record = unwrapData(response)
  const type = normalizeType(record.type)
  const fileRecord = asRecord(record.file)
  const download = normalizeDownload(record.download) || normalizeDownload(fileRecord?.download)
  const file = normalizeFile(record.file)
  return {
    transferId: requiredString(record, 'transferId'),
    type,
    text:
      typeof record.text === 'string' ? record.text : type === 'text' && typeof record.content === 'string' ? record.content : undefined,
    url: typeof record.url === 'string' ? record.url : undefined,
    file,
    download,
  }
}
