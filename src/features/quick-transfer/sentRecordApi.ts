import { normalizeQuickTransferContent, unwrapQuickTransferData } from './response'
import { normalizeQuickTransferHistoryMetadata } from './history'
import type {
  QuickTransferFileAccessResult,
  QuickTransferSentRecordDetail,
  QuickTransferSentRecordListItem,
  QuickTransferSentRecordListResult,
  QuickTransferSentRecordPreview,
  QuickTransferStatus,
} from './types'
import {
  deleteQuickTransferSentRecordsSentRecordId,
  getQuickTransferSentRecords,
  getQuickTransferSentRecordsSentRecordId,
  postQuickTransferSentRecordsFilesAccess,
} from '@/services/apifox/NODEJSDEMO/QUICKTRANSFERSENTRECORD/apifox'
import type {
  getQuickTransferSentRecordsQuery,
  postFilesFileIdAccessPathQuery as SentFileAccessPath,
} from '@/services/apifox/NODEJSDEMO/QUICKTRANSFERSENTRECORD/interface'

const asRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

const requiredString = (record: Record<string, unknown>, key: string): string => {
  const value = record[key]
  if (typeof value !== 'string' || !value) throw new Error(`我发送的接口缺少 ${key}`)
  return value
}

const optionalString = (record: Record<string, unknown>, key: string): string | undefined => {
  const value = record[key]
  return typeof value === 'string' && value ? value : undefined
}

const normalizeStatus = (value: unknown): QuickTransferStatus => {
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
  throw new Error('我发送的接口返回了未知状态')
}

const normalizeCount = (value: unknown): number => {
  const count = Number(value)
  return Number.isFinite(count) && count >= 0 ? Math.floor(count) : 0
}

const normalizePreview = (value: unknown): QuickTransferSentRecordPreview => {
  const record = asRecord(value) || {}
  return {
    text: typeof record.text === 'string' ? record.text : undefined,
    referenceTitle: typeof record.referenceTitle === 'string' ? record.referenceTitle : undefined,
    linkTitle: typeof record.linkTitle === 'string' ? record.linkTitle : undefined,
    fileName: typeof record.fileName === 'string' ? record.fileName : undefined,
  }
}

const normalizePagination = (value: unknown, fallbackPage: number, fallbackPageSize: number) => {
  const record = asRecord(value) || {}
  const page = Number(record.page ?? record.currentPage ?? fallbackPage)
  const pageSize = Number(record.pageSize ?? fallbackPageSize)
  const total = Number(record.total)
  const totalPages = Number(record.totalPages)
  const hasNextValue = record.hasNext ?? record.hasMore
  const hasNext =
    typeof hasNextValue === 'boolean'
      ? hasNextValue
      : Number.isFinite(totalPages) && totalPages > 0
        ? page < totalPages
        : Number.isFinite(total) && total >= 0
          ? page * pageSize < total
          : false
  return {
    page: Number.isFinite(page) && page > 0 ? page : fallbackPage,
    pageSize: Number.isFinite(pageSize) && pageSize > 0 ? pageSize : fallbackPageSize,
    ...(Number.isFinite(total) && total >= 0 ? { total } : {}),
    ...(Number.isFinite(totalPages) && totalPages >= 0 ? { totalPages } : {}),
    hasNext,
  }
}

const normalizeListItem = (value: unknown): QuickTransferSentRecordListItem | undefined => {
  const record = asRecord(value)
  if (!record) return undefined
  const metadata = normalizeQuickTransferHistoryMetadata(record)
  return {
    sentRecordId: requiredString(record, 'sentRecordId'),
    transferId: requiredString(record, 'transferId'),
    displayTitle: requiredString(record, 'displayTitle'),
    sentAt: requiredString(record, 'sentAt'),
    status: normalizeStatus(record.status),
    claimCount: normalizeCount(record.claimCount),
    maxClaims: normalizeCount(record.maxClaims),
    expiresAt: optionalString(record, 'expiresAt'),
    canRecall: Boolean(record.canRecall),
    primaryType: metadata.primaryType,
    summary: metadata.summary,
    preview: normalizePreview(record.preview),
  }
}

export const isValidQuickTransferSentRecordId = (value: string): boolean => /^[A-Za-z0-9_-]+$/.test(value)

export const normalizeQuickTransferSentRecordList = (
  response: unknown,
  fallbackPage = 1,
  fallbackPageSize = 20,
): QuickTransferSentRecordListResult => {
  const record = unwrapQuickTransferData(response)
  const items = Array.isArray(record.items)
    ? record.items.map(normalizeListItem).filter((item): item is QuickTransferSentRecordListItem => Boolean(item))
    : []
  return { items, pagination: normalizePagination(record.pagination, fallbackPage, fallbackPageSize) }
}

export const normalizeQuickTransferSentRecordDetail = (response: unknown): QuickTransferSentRecordDetail => {
  const record = unwrapQuickTransferData(response)
  return {
    sentRecordId: requiredString(record, 'sentRecordId'),
    transferId: requiredString(record, 'transferId'),
    displayTitle: requiredString(record, 'displayTitle'),
    sentAt: requiredString(record, 'sentAt'),
    status: normalizeStatus(record.status),
    claimCount: normalizeCount(record.claimCount),
    maxClaims: normalizeCount(record.maxClaims),
    expiresAt: optionalString(record, 'expiresAt'),
    readyAt: optionalString(record, 'readyAt'),
    consumedAt: optionalString(record, 'consumedAt'),
    cancelledAt: optionalString(record, 'cancelledAt'),
    canRecall: Boolean(record.canRecall),
    content: normalizeQuickTransferContent(record.content),
  }
}

export const listQuickTransferSentRecords = async (page = 1, pageSize = 20): Promise<QuickTransferSentRecordListResult> => {
  const query: getQuickTransferSentRecordsQuery = { page, pageSize }
  const response = await getQuickTransferSentRecords(query)
  return normalizeQuickTransferSentRecordList(response, page, pageSize)
}

export const getQuickTransferSentRecord = async (sentRecordId: string): Promise<QuickTransferSentRecordDetail> => {
  const response = await getQuickTransferSentRecordsSentRecordId(sentRecordId)
  return normalizeQuickTransferSentRecordDetail(response)
}

export const deleteQuickTransferSentRecord = async (sentRecordId: string): Promise<string> => {
  const response = await deleteQuickTransferSentRecordsSentRecordId(sentRecordId)
  return requiredString(unwrapQuickTransferData(response), 'sentRecordId')
}

export const accessQuickTransferSentRecordFile = async (sentRecordId: string, fileId: string): Promise<QuickTransferFileAccessResult> => {
  const pathParams: SentFileAccessPath = { sentRecordId, fileId }
  const response = await postQuickTransferSentRecordsFilesAccess(pathParams)
  const record = unwrapQuickTransferData(response)
  return {
    url: requiredString(record, 'url'),
    expiresAt: requiredString(record, 'expiresAt'),
  }
}
