import type { QuickTransferErrorInfo } from './types'

const ERROR_MESSAGES: Record<string, string> = {
  TRANSFER_NOT_AVAILABLE: '这艘飞船已经不在了',
  TRANSFER_NOT_FOUND: '这艘飞船已经不在了',
  TRANSFER_ACTIVE_QUOTA_EXCEEDED: '当前飞船数量已达上限',
  TRANSFER_DAILY_FILE_QUOTA_EXCEEDED: '今日文件飞船额度已用完',
  TRANSFER_UPLOAD_NOT_AVAILABLE: '文件上传凭证已失效，请重新校验',
  TRANSFER_FILE_NOT_FOUND: '文件已不存在，请重新准备飞船',
  TRANSFER_FILE_ALREADY_READY: '文件已经完成校验',
  TRANSFER_OBJECT_NOT_FOUND: '尚未检测到上传文件，请重新校验',
  UPLOAD_VERIFICATION_FAILED: '文件校验失败，本次飞船无法发送',
  UPLOAD_DANGEROUS_CONTENT: '文件校验失败，本次飞船无法发送',
  UPLOAD_CONTENT_TYPE_MISMATCH: '文件类型与实际内容不一致，本次飞船无法发送',
  UPLOAD_PROBE_TEMPORARILY_UNAVAILABLE: '文件校验暂时失败，请重新校验',
  UPLOAD_FAILED: '文件上传失败，请重试',
  DIRECT_UPLOAD_FAILED: '文件上传失败，请重试',
  DIRECT_UPLOAD_ABORTED: '文件上传已取消',
  CLAIM_TOKEN_INVALID: '文件访问凭证已失效',
  CLAIM_TOKEN_EXPIRED: '文件访问凭证已失效',
  QUICK_TRANSFER_NOT_CONFIGURED: '飞船服务尚未完成配置，请联系管理员',
  QUICK_TRANSFER_OSS_NOT_CONFIGURED: '文件飞船服务暂不可用',
  QUICK_TRANSFER_API_UNAVAILABLE: '飞船服务暂不可用',
}

const asRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

const getStatusCode = (error: unknown): number | undefined => {
  const root = asRecord(error)
  const data = asRecord(root?.data)
  const candidates = [root?.statusCode, root?.status, root?.code, data?.statusCode, data?.status]
  return candidates.find(candidate => typeof candidate === 'number') as number | undefined
}

export const getQuickTransferErrorCode = (error: unknown): string => {
  const root = asRecord(error)
  const data = asRecord(root?.data)
  const dataEnvelope = asRecord(data?.data)
  const nested = asRecord(root?.error)
  const nestedData = asRecord(nested?.data)
  const nestedDataEnvelope = asRecord(nestedData?.data)
  const response = asRecord(root?.response)
  const responseData = asRecord(response?.data)
  const responseDataEnvelope = asRecord(responseData?.data)
  const candidates = [
    root?.code,
    root?.reason,
    data?.code,
    data?.reason,
    dataEnvelope?.code,
    dataEnvelope?.reason,
    nested?.code,
    nested?.reason,
    nestedData?.code,
    nestedData?.reason,
    nestedDataEnvelope?.code,
    nestedDataEnvelope?.reason,
    response?.code,
    response?.reason,
    responseData?.code,
    responseData?.reason,
    responseDataEnvelope?.code,
    responseDataEnvelope?.reason,
  ]
  const code = candidates.find(candidate => typeof candidate === 'string' && candidate.trim())
  return typeof code === 'string' ? code : ''
}

export const getQuickTransferErrorMessage = (error: unknown, fallback = '飞船操作失败，请稍后重试'): string => {
  const code = getQuickTransferErrorCode(error)
  if (code && ERROR_MESSAGES[code]) return ERROR_MESSAGES[code]

  const root = asRecord(error)
  const data = asRecord(root?.data)
  const statusCode = getStatusCode(error)
  if (statusCode === 401) return '登录状态已失效，请重新登录'
  if (statusCode === 404) return '飞船服务暂不可用'
  if (statusCode === 429) return '请求太频繁了，请稍后再试'
  if (statusCode === -1) return '网络连接失败，请检查网络后重试'
  const message = root?.message ?? data?.message ?? root?.reason ?? data?.reason
  if (typeof message === 'string' && message.trim()) {
    if (/network|timeout|fail|网络|超时/i.test(message)) return '网络连接失败，请检查网络后重试'
    return message
  }
  return fallback
}

const isCompleteRetryCode = (code: string): boolean =>
  code === 'TRANSFER_OBJECT_NOT_FOUND' || code === 'UPLOAD_PROBE_TEMPORARILY_UNAVAILABLE' || code === 'TRANSFER_FILE_ALREADY_READY'

const isUploadRetryCode = (code: string): boolean =>
  code === 'TRANSFER_UPLOAD_NOT_AVAILABLE' ||
  code === 'UPLOAD_FAILED' ||
  code === 'DIRECT_UPLOAD_FAILED' ||
  code === 'DIRECT_UPLOAD_ABORTED'

export const toQuickTransferErrorInfo = (error: unknown, fallback?: string): QuickTransferErrorInfo => {
  const code = getQuickTransferErrorCode(error)
  return {
    code,
    message: getQuickTransferErrorMessage(error, fallback),
    canRetryComplete: isCompleteRetryCode(code),
    canRetryUpload: isUploadRetryCode(code),
  }
}

export const toQuickTransferReceiveErrorInfo = (error: unknown): QuickTransferErrorInfo => {
  const code = getQuickTransferErrorCode(error)
  if (code === 'TRANSFER_NOT_AVAILABLE' || code === 'TRANSFER_NOT_FOUND') return { code, message: '这艘飞船已经不在了' }
  if (getStatusCode(error) === 429) return { code: '429', message: '收船太频繁了，请稍后再试' }
  if (code === 'CLAIM_TOKEN_INVALID' || code === 'CLAIM_TOKEN_EXPIRED') return { code, message: '文件访问凭证已失效' }

  const message = getQuickTransferErrorMessage(error, '暂时联系不上飞船')
  if (getStatusCode(error) === -1 || message === '网络连接失败，请检查网络后重试') {
    return { code: code || 'NETWORK_ERROR', message: '暂时联系不上飞船' }
  }
  return { code, message }
}
