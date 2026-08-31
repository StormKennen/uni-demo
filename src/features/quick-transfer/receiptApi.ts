import { normalizeQuickTransferContent, unwrapQuickTransferData } from './response'
import { normalizeQuickTransferHistoryMetadata } from './history'
import type {
  QuickTransferFileAccessResult,
  QuickTransferReceiptDetail,
  QuickTransferReceiptListItem,
  QuickTransferReceiptListResult,
  QuickTransferReceiptPagination,
  QuickTransferReceiptPreview,
} from './types'
import {
  deleteQuickTransferReceiptsReceiptId,
  getQuickTransferReceipts,
  getQuickTransferReceiptsReceiptId,
  postQuickTransferReceiptsFilesAccess,
} from '@/services/apifox/NODEJSDEMO/QUICKTRANSFERRECEIPT/apifox'
import type {
  getQuickTransferReceiptsQuery,
  postFilesFileIdAccessPathQuery as ReceiptFileAccessPath,
} from '@/services/apifox/NODEJSDEMO/QUICKTRANSFERRECEIPT/interface'

const asRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

const requiredString = (record: Record<string, unknown>, key: string): string => {
  const value = record[key]
  if (typeof value !== 'string' || !value) throw new Error(`已收飞船接口缺少 ${key}`)
  return value
}

export const isValidQuickTransferReceiptId = (value: string): boolean => /^[A-Za-z0-9_-]+$/.test(value)

const normalizePreview = (value: unknown): QuickTransferReceiptPreview => {
  const record = asRecord(value) || {}
  return {
    text: typeof record.text === 'string' ? record.text : undefined,
    referenceTitle: typeof record.referenceTitle === 'string' ? record.referenceTitle : undefined,
    linkTitle: typeof record.linkTitle === 'string' ? record.linkTitle : undefined,
    fileName: typeof record.fileName === 'string' ? record.fileName : undefined,
  }
}

const normalizeListItem = (value: unknown): QuickTransferReceiptListItem | undefined => {
  const record = asRecord(value)
  if (!record) return undefined
  const metadata = normalizeQuickTransferHistoryMetadata(record)
  return {
    receiptId: requiredString(record, 'receiptId'),
    displayTitle: requiredString(record, 'displayTitle'),
    claimedAt: requiredString(record, 'claimedAt'),
    primaryType: metadata.primaryType,
    summary: metadata.summary,
    preview: normalizePreview(record.preview),
  }
}

const normalizePagination = (value: unknown, fallbackPage: number, fallbackPageSize: number): QuickTransferReceiptPagination => {
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

export const normalizeQuickTransferReceiptList = (
  response: unknown,
  fallbackPage = 1,
  fallbackPageSize = 20,
): QuickTransferReceiptListResult => {
  const record = unwrapQuickTransferData(response)
  const items = Array.isArray(record.items)
    ? record.items.map(normalizeListItem).filter((item): item is QuickTransferReceiptListItem => Boolean(item))
    : []
  return {
    items,
    pagination: normalizePagination(record.pagination, fallbackPage, fallbackPageSize),
  }
}

export const normalizeQuickTransferReceiptDetail = (response: unknown): QuickTransferReceiptDetail => {
  const record = unwrapQuickTransferData(response)
  return {
    receiptId: requiredString(record, 'receiptId'),
    displayTitle: requiredString(record, 'displayTitle'),
    claimedAt: requiredString(record, 'claimedAt'),
    content: normalizeQuickTransferContent(record.content),
  }
}

export const listQuickTransferReceipts = async (page = 1, pageSize = 20): Promise<QuickTransferReceiptListResult> => {
  const query: getQuickTransferReceiptsQuery = { page, pageSize }
  const response = await getQuickTransferReceipts(query)
  return normalizeQuickTransferReceiptList(response, page, pageSize)
}

export const getQuickTransferReceipt = async (receiptId: string): Promise<QuickTransferReceiptDetail> => {
  const response = await getQuickTransferReceiptsReceiptId(receiptId)
  return normalizeQuickTransferReceiptDetail(response)
}

export const deleteQuickTransferReceipt = async (receiptId: string): Promise<string> => {
  const response = await deleteQuickTransferReceiptsReceiptId(receiptId)
  return requiredString(unwrapQuickTransferData(response), 'receiptId')
}

export const accessQuickTransferReceiptFile = async (receiptId: string, fileId: string): Promise<QuickTransferFileAccessResult> => {
  const pathParams: ReceiptFileAccessPath = { receiptId, fileId }
  const response = await postQuickTransferReceiptsFilesAccess(pathParams)
  const record = unwrapQuickTransferData(response)
  return {
    url: requiredString(record, 'url'),
    expiresAt: requiredString(record, 'expiresAt'),
  }
}
