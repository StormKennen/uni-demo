import { QUICK_TRANSFER_RECEIVE_ROUTE } from './constants'

export interface QuickTransferPublicReceiveUrlOptions {
  baseUrl: string
  shareToken: string
}

export const normalizeQuickTransferPublicH5BaseUrl = (value: string): string => value.trim().replace(/^['"]|['"]$/g, '')

export const isValidQuickTransferPublicH5BaseUrl = (value: string): boolean => {
  const baseUrl = normalizeQuickTransferPublicH5BaseUrl(value)
  return /^https?:\/\/[^\s/]+(?:[/?#][^\s]*)?$/i.test(baseUrl)
}

export const isLocalQuickTransferPublicH5BaseUrl = (value: string): boolean => {
  const baseUrl = normalizeQuickTransferPublicH5BaseUrl(value)
  const hostWithPort = baseUrl.match(/^https?:\/\/([^/?#]+)/i)?.[1] || ''
  const host = hostWithPort.startsWith('[') ? hostWithPort.slice(1, hostWithPort.indexOf(']')) : hostWithPort.split(':')[0]
  return host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0' || host === '::1'
}

export const buildQuickTransferPublicReceiveUrl = ({ baseUrl, shareToken }: QuickTransferPublicReceiveUrlOptions): string => {
  const normalizedBaseUrl = normalizeQuickTransferPublicH5BaseUrl(baseUrl)
  const normalizedShareToken = shareToken.trim()
  if (!normalizedShareToken || !isValidQuickTransferPublicH5BaseUrl(normalizedBaseUrl)) return ''

  const hashIndex = normalizedBaseUrl.indexOf('#')
  const basePath = hashIndex >= 0 ? normalizedBaseUrl.slice(0, hashIndex) : normalizedBaseUrl.replace(/\/+$/, '') + '/'
  return `${basePath}#${QUICK_TRANSFER_RECEIVE_ROUTE}?shareToken=${encodeURIComponent(normalizedShareToken)}`
}
