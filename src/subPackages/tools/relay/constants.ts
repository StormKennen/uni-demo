import type { RelayFieldValue, RelayFieldViewModel, RelayStatus, RelayViewModel } from './types'
import { QUICK_SHIP_IMAGE_URL } from '@/features/quick-transfer/visual'

export const RELAY_HOME_ROUTE = '/subPackages/tools/relay/index'
export const RELAY_DETAIL_ROUTE = '/subPackages/tools/relay/detail'
export const RELAY_CREATE_ROUTE = '/subPackages/tools/relay/create'
export const RELAY_SHARE_IMAGE_URL = 'https://lzk-web.oss-cn-beijing.aliyuncs.com/img/share/relay-share.jpg'
export const RELAY_ANIMATION_IMAGE_URL = QUICK_SHIP_IMAGE_URL

export const buildRelayDetailRoute = (options: { id?: string; shareCode?: string }): string => {
  const query = options.shareCode ? `shareCode=${encodeURIComponent(options.shareCode)}` : `id=${encodeURIComponent(options.id || '')}`
  return `${RELAY_DETAIL_ROUTE}?${query}`
}

export const buildRelaySubmitRoute = (id: string, shareCode?: string): string => {
  const query = shareCode ? `id=${encodeURIComponent(id)}&shareCode=${encodeURIComponent(shareCode)}` : `id=${encodeURIComponent(id)}`
  return `${RELAY_DETAIL_ROUTE.replace('/detail', '/submit')}?${query}`
}

export const buildRelayManageRoute = (id: string, shareCode?: string): string => {
  const query = `id=${encodeURIComponent(id)}${shareCode ? `&shareCode=${encodeURIComponent(shareCode)}` : ''}`
  return `${RELAY_DETAIL_ROUTE.replace('/detail', '/manage')}?${query}`
}

export const createClientRequestId = (): string => {
  const time = Date.now().toString(36)
  const random = Math.random().toString(36).slice(2, 12)
  return `relay-${time}-${random}`
}

export const getRelayStatusLabel = (status: RelayStatus): string => {
  if (status === 'closed') return '已结束'
  if (status === 'deleted') return '已删除'
  return '进行中'
}

export const getRelayStatusTone = (status: RelayStatus): 'success' | 'muted' | 'danger' => {
  if (status === 'closed') return 'muted'
  if (status === 'deleted') return 'danger'
  return 'success'
}

export const formatRelayDate = (value: string | null | undefined, withTime = true): string => {
  if (!value) return '不限制'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '时间待定'
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  if (!withTime) return `${month}-${day}`
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${month}-${day} ${hours}:${minutes}`
}

export const getDeadlineLabel = (relay: RelayViewModel): string =>
  relay.settings.deadline ? `截止 ${formatRelayDate(relay.settings.deadline)}` : '不限制截止时间'

export const getFieldDefaultValue = (field: RelayFieldViewModel): RelayFieldValue => {
  if (field.defaultValue !== null && field.defaultValue !== undefined) return field.defaultValue
  if (field.type === 'number') return field.config.min ?? 1
  if (field.type === 'image') return []
  return ''
}

export const readRelayErrorMessage = (error: unknown, fallback = '操作失败，请稍后重试'): string => {
  if (!error || typeof error !== 'object') return fallback
  const source = error as { message?: unknown; data?: unknown }
  if (typeof source.message === 'string' && source.message.trim()) return normalizeRelayErrorMessage(source.message)
  if (source.data && typeof source.data === 'object') {
    const data = source.data as { message?: unknown; msg?: unknown }
    const message = typeof data.message === 'string' ? data.message : typeof data.msg === 'string' ? data.msg : ''
    if (message) return normalizeRelayErrorMessage(message)
  }
  return fallback
}

const normalizeRelayErrorMessage = (message: string): string => {
  if (message.includes('截止')) return '接龙已截止'
  if (message.includes('关闭') || message.includes('结束')) return '接龙已结束'
  if (message.includes('满') || message.includes('上限')) return '接龙名额已满或已达到个人次数上限'
  if (message.includes('不存在') || message.includes('分享')) return '接龙不存在或分享链接已失效'
  if (message.includes('昵称')) return '昵称更新失败，请重试'
  if (message.includes('字段结构')) return '接龙已有记录，字段结构不能再修改'
  return message.length > 80 ? '操作失败，请稍后重试' : message
}

export const isSafeFieldKey = (field: RelayFieldViewModel): boolean => /^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(field.key)
