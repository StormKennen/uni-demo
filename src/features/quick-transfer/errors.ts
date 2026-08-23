import type { QuickTransferErrorInfo } from './types'

const ERROR_MESSAGES: Record<string, string> = {
  TRANSFER_NOT_AVAILABLE: '提取码无效或内容已失效',
  TRANSFER_ACTIVE_QUOTA_EXCEEDED: '当前快传数量已达上限',
  TRANSFER_DAILY_FILE_QUOTA_EXCEEDED: '今日文件快传额度已用完',
  TRANSFER_UPLOAD_NOT_AVAILABLE: '上传凭证已失效，请重新发送',
  TRANSFER_OBJECT_NOT_FOUND: '尚未检测到上传文件，请稍后重试',
  UPLOAD_VERIFICATION_FAILED: '文件校验失败',
  UPLOAD_DANGEROUS_CONTENT: '该文件暂不支持传输',
  UPLOAD_CONTENT_TYPE_MISMATCH: '文件类型与实际内容不一致',
  UPLOAD_PROBE_TEMPORARILY_UNAVAILABLE: '文件校验暂时失败，请重试',
  QUICK_TRANSFER_OSS_NOT_CONFIGURED: '文件快传服务暂不可用',
  QUICK_TRANSFER_API_UNAVAILABLE: '快传服务暂不可用',
}

const asRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

export const getQuickTransferErrorCode = (error: unknown): string => {
  const root = asRecord(error)
  const data = asRecord(root?.data)
  const nested = asRecord(root?.error)
  const codeCandidates = [root?.code, data?.code, nested?.code]
  const code = codeCandidates.find(candidate => typeof candidate === 'string')
  return typeof code === 'string' ? code : ''
}

export const getQuickTransferErrorMessage = (error: unknown, fallback = '快传操作失败，请稍后重试'): string => {
  const code = getQuickTransferErrorCode(error)
  if (code && ERROR_MESSAGES[code]) return ERROR_MESSAGES[code]

  const root = asRecord(error)
  const data = asRecord(root?.data)
  const statusCode = root?.statusCode ?? (typeof root?.code === 'number' ? root.code : undefined)
  if (statusCode === 401) return '游客会话初始化失败，请稍后重试'
  if (statusCode === 404) return '快传服务暂不可用'
  if (statusCode === -1) return '网络连接失败，请检查网络后重试'
  const message = root?.message ?? data?.message
  if (typeof message === 'string' && message.trim()) {
    if (/network|timeout|fail|网络|超时/i.test(message)) return '网络连接失败，请检查网络后重试'
    return message
  }
  return fallback
}

export const toQuickTransferErrorInfo = (error: unknown, fallback?: string): QuickTransferErrorInfo => {
  const code = getQuickTransferErrorCode(error)
  return {
    code,
    message: getQuickTransferErrorMessage(error, fallback),
    canRetryComplete: code === 'UPLOAD_PROBE_TEMPORARILY_UNAVAILABLE',
  }
}
