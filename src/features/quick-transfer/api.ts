import type {
  QuickTransferCreatePayload,
  QuickTransferCreateResult,
  QuickTransferFileAccessResult,
  QuickTransferInspectResult,
  QuickTransferResolvedResult,
  QuickTransferStatusResult,
  QuickTransferStatus,
  QuickTransferSummary,
  QuickTransferUploadDescriptor,
} from './types'
import { QUICK_TRANSFER_DEFAULT_MAX_CLAIMS } from './constants'
import { normalizeQuickTransferClaimCount, normalizeQuickTransferMaxClaims } from './helpers'
import { normalizeQuickTransferResolvedResult } from './response'
import type { ParticalUniAppRequestOptions } from '@/services/interface'
import {
  deleteQuickTransfersTransferId,
  getQuickTransfersTransferId,
  postQuickTransfers,
  postQuickTransfersFilesAccess,
  postQuickTransfersFilesComplete,
  postQuickTransfersFilesUploadPolicy,
  postQuickTransfersResolve,
  postQuickTransfersShareInspect,
} from '@/services/apifox/NODEJSDEMO/QUICKTRANSFER/apifox'
import type {
  postFilesFileIdAccessBody,
  postFilesFileIdAccessPathQuery,
  postFilesFileIdCompletePathQuery,
  postFilesFileIdUploadPolicyPathQuery,
  postQuickTransfersBody,
  postQuickTransfersResolveBody,
  postQuickTransfersShareInspectBody,
} from '@/services/apifox/NODEJSDEMO/QUICKTRANSFER/interface'

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
  if (!record) throw new Error('快船接口返回格式异常')
  const data = asRecord(record.data)
  if (data && (record.code === undefined || record.status === undefined) && Object.keys(data).length > 0) return data
  return record
}

const requiredString = (record: Record<string, unknown>, key: string): string => {
  const value = record[key]
  if (typeof value !== 'string' || !value) throw new Error(`快船接口缺少 ${key}`)
  return value
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
  throw new Error('快船接口返回了未知状态')
}

const normalizeUpload = (value: unknown, fallbackClientFileId = ''): QuickTransferUploadDescriptor | undefined => {
  const record = asRecord(value)
  if (!record) return undefined
  const policy = asRecord(record.uploadPolicy) || asRecord(record.policy) || asRecord(record.upload) || record
  const fieldsRecord = asRecord(policy.fields)
  const clientFileId = typeof record.clientFileId === 'string' ? record.clientFileId : fallbackClientFileId
  const fileId =
    typeof record.fileId === 'string'
      ? record.fileId
      : typeof record.id === 'string'
        ? record.id
        : typeof policy.fileId === 'string'
          ? policy.fileId
          : ''
  const url = typeof policy.url === 'string' ? policy.url : ''
  const expiresAt = typeof policy.expiresAt === 'string' ? policy.expiresAt : ''
  const fileField = typeof policy.fileField === 'string' ? policy.fileField : typeof policy.name === 'string' ? policy.name : 'file'
  const successStatus = Number(policy.successStatus ?? policy.success_status ?? 201)
  if (!fieldsRecord || !clientFileId || !fileId || !url || !expiresAt || !Number.isFinite(successStatus)) return undefined

  const fields: Record<string, string> = {}
  Object.entries(fieldsRecord).forEach(([key, fieldValue]) => {
    fields[key] = typeof fieldValue === 'string' ? fieldValue : String(fieldValue ?? '')
  })
  return { method: 'POST', clientFileId, fileId, url, fileField, fields, successStatus, expiresAt }
}

const normalizeStatusResponse = (
  response: unknown,
  fallbackMaxClaims = QUICK_TRANSFER_DEFAULT_MAX_CLAIMS,
  fallbackTransferId = '',
  fallbackExpiresAt = '',
): QuickTransferStatusResult => {
  const record = unwrapData(response)
  return {
    claimCount: normalizeQuickTransferClaimCount(record.claimCount),
    transferId:
      typeof record.transferId === 'string' && record.transferId
        ? record.transferId
        : fallbackTransferId || requiredString(record, 'transferId'),
    status: normalizeStatusValue(record.status),
    maxClaims: normalizeQuickTransferMaxClaims(record.maxClaims, fallbackMaxClaims),
    expiresAt:
      typeof record.expiresAt === 'string' && record.expiresAt
        ? record.expiresAt
        : fallbackExpiresAt || requiredString(record, 'expiresAt'),
    consumedAt: typeof record.consumedAt === 'string' ? record.consumedAt : undefined,
    cancelledAt: typeof record.cancelledAt === 'string' ? record.cancelledAt : undefined,
  }
}

export const createQuickTransfer = async (payload: QuickTransferCreatePayload): Promise<QuickTransferCreateResult> => {
  const response = await postQuickTransfers(payload as unknown as postQuickTransfersBody)
  const record = unwrapData(response)
  const uploads = Array.isArray(record.uploads)
    ? record.uploads.map(value => normalizeUpload(value)).filter((value): value is QuickTransferUploadDescriptor => Boolean(value))
    : []
  return {
    code: requiredString(record, 'code'),
    claimCount: normalizeQuickTransferClaimCount(record.claimCount),
    expiresAt: requiredString(record, 'expiresAt'),
    maxClaims: normalizeQuickTransferMaxClaims(record.maxClaims, payload.maxClaims),
    shareToken: requiredString(record, 'shareToken'),
    status: record.status === 'uploading' ? 'uploading' : 'ready',
    transferId: requiredString(record, 'transferId'),
    uploads,
  }
}

export const completeQuickTransferFile = async (
  transferId: string,
  fileId: string,
  fallbackExpiresAt = '',
): Promise<QuickTransferStatusResult> => {
  const pathParams = { transferId, fileId } as postFilesFileIdCompletePathQuery
  const response = await postQuickTransfersFilesComplete(pathParams)
  return normalizeStatusResponse(response, QUICK_TRANSFER_DEFAULT_MAX_CLAIMS, transferId, fallbackExpiresAt)
}

export const refreshQuickTransferUploadPolicy = async (
  transferId: string,
  fileId: string,
  clientFileId: string,
): Promise<QuickTransferUploadDescriptor> => {
  const pathParams = { transferId, fileId } as postFilesFileIdUploadPolicyPathQuery
  const response = await postQuickTransfersFilesUploadPolicy(pathParams)
  const upload = normalizeUpload({ ...(unwrapData(response) as Record<string, unknown>), fileId }, clientFileId)
  if (!upload) throw new Error('快船接口返回的上传凭证不可用')
  return upload
}

export const getQuickTransferStatus = async (
  transferId: string,
  fallbackMaxClaims = QUICK_TRANSFER_DEFAULT_MAX_CLAIMS,
): Promise<QuickTransferStatusResult> => {
  const response = await getQuickTransfersTransferId(transferId)
  return normalizeStatusResponse(response, fallbackMaxClaims)
}

export const cancelQuickTransfer = async (
  transferId: string,
  fallbackMaxClaims = QUICK_TRANSFER_DEFAULT_MAX_CLAIMS,
): Promise<QuickTransferStatusResult> => {
  const response = await deleteQuickTransfersTransferId(transferId)
  return normalizeStatusResponse(response, fallbackMaxClaims)
}

export const inspectQuickTransferShare = async (shareToken: string): Promise<QuickTransferInspectResult> => {
  const response = await postQuickTransfersShareInspect({ shareToken } as postQuickTransfersShareInspectBody, receiveRequestConfig)
  const record = unwrapData(response)
  const rawSummary = asRecord(record.summary) || {}
  const summary: QuickTransferSummary = {
    hasText: Boolean(rawSummary.hasText ?? rawSummary.text ?? record.hasText ?? record.text),
    links: Number(rawSummary.links ?? record.links ?? 0) || 0,
    files: Number(rawSummary.files ?? record.files ?? 0) || 0,
    references: Number(rawSummary.references ?? record.references ?? 0) || 0,
  }
  return {
    transferId: typeof record.transferId === 'string' ? record.transferId : undefined,
    expiresAt: requiredString(record, 'expiresAt'),
    remainingClaims: normalizeQuickTransferClaimCount(record.remainingClaims ?? record.claimsRemaining),
    summary,
  }
}

export const resolveQuickTransfer = async (input: { code?: string; shareToken?: string }): Promise<QuickTransferResolvedResult> => {
  const payload = input.shareToken ? { shareToken: input.shareToken } : { code: input.code || '' }
  const response = await postQuickTransfersResolve(payload as unknown as postQuickTransfersResolveBody, receiveRequestConfig)
  return normalizeQuickTransferResolvedResult(response)
}

export const accessQuickTransferFile = async (
  transferId: string,
  fileId: string,
  claimToken: string,
): Promise<QuickTransferFileAccessResult> => {
  const pathParams = { transferId, fileId } as postFilesFileIdAccessPathQuery
  const body = { claimToken } as postFilesFileIdAccessBody
  const response = await postQuickTransfersFilesAccess(pathParams, body, receiveRequestConfig)
  const record = unwrapData(response)
  const url = typeof record.url === 'string' ? record.url : typeof record.signedUrl === 'string' ? record.signedUrl : ''
  if (!url) throw new Error('快船接口缺少 url')
  return {
    url,
    expiresAt: requiredString(record, 'expiresAt'),
  }
}
