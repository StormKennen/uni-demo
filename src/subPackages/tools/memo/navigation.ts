export interface MemoDetailPathOptions {
  id: string
  shareToken?: string
  mode?: 'public' | 'private' | 'admin'
  readonly?: boolean
  exportMode?: boolean
}

export interface MemoDetailRouteParams {
  id: string
  shareToken?: string
  mode?: 'public' | 'private' | 'admin'
  readonly?: boolean
  exportMode?: boolean
}

export interface MemoH5LocationLike {
  origin: string
  pathname: string
  search: string
  hash: string
  href?: string
}

const MEMO_DETAIL_ROUTE = '/subPackages/tools/memo/detail'

const buildMemoQuery = ({ id, shareToken, mode, readonly, exportMode }: MemoDetailPathOptions): string => {
  const query: string[] = [`id=${encodeURIComponent(id)}`]
  if (shareToken) query.push(`shareToken=${encodeURIComponent(shareToken)}`)
  if (mode && mode !== 'public') query.push(`mode=${mode}`)
  if (readonly) query.push('readonly=1')
  if (exportMode) query.push('export=1')
  return query.join('&')
}

export const buildMemoDetailQuery = (options: MemoDetailPathOptions): string => buildMemoQuery(options)

export const buildMemoDetailPath = (options: MemoDetailPathOptions): string => `${MEMO_DETAIL_ROUTE}?${buildMemoQuery(options)}`

const getRuntimeH5Location = (): MemoH5LocationLike | undefined => {
  if (typeof window === 'undefined') return undefined

  // #ifdef H5
  return {
    origin: window.location.origin,
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
    href: window.location.href,
  }
  // #endif
  return undefined
}

const getConfiguredH5BaseUrl = (): string =>
  String(import.meta.env.VITE_PUBLIC_THIS_H5_URL || '')
    .trim()
    .replace(/^['"]|['"]$/g, '')

const getHistoryBasePath = (pathname: string): string => {
  const routeMarkers = ['/subPackages/', '/pages/']
  const routeIndex = routeMarkers
    .map(marker => pathname.indexOf(marker))
    .filter(index => index >= 0)
    .sort((left, right) => left - right)[0]

  if (routeIndex !== undefined) return pathname.slice(0, routeIndex).replace(/\/+$/, '')

  const normalizedPath = pathname.replace(/\/+$/, '')
  if (!normalizedPath || normalizedPath === '/') return ''
  if (/\.html$/i.test(normalizedPath)) return normalizedPath

  const lastSlashIndex = normalizedPath.lastIndexOf('/')
  return lastSlashIndex >= 0 ? normalizedPath.slice(0, lastSlashIndex + 1).replace(/\/+$/, '') : ''
}

const buildMemoShareUrlFromBase = (baseUrl: string, path: string): string => {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '')
  const hashIndex = normalizedBaseUrl.indexOf('#')
  if (hashIndex >= 0) return `${normalizedBaseUrl.slice(0, hashIndex)}#${path}`
  return `${normalizedBaseUrl}${path}`
}

/** 构建 H5 外部分享地址，兼容 hash/history 路由及部署在子目录下的场景。 */
export const buildMemoShareUrl = (options: MemoDetailPathOptions & { location?: MemoH5LocationLike; baseUrl?: string }): string => {
  const path = buildMemoDetailPath(options)
  const location = options.location || getRuntimeH5Location()

  if (location?.origin) {
    const isHashRouter = location.hash.startsWith('#/') || location.hash.includes(`${MEMO_DETAIL_ROUTE}?`)
    if (isHashRouter) return `${location.origin}${location.pathname}#${path}`
    return `${location.origin}${getHistoryBasePath(location.pathname)}${path}`
  }

  const configuredBaseUrl = options.baseUrl || getConfiguredH5BaseUrl()
  if (configuredBaseUrl) return buildMemoShareUrlFromBase(configuredBaseUrl, path)
  return path
}

const getOptionValue = (options: unknown, key: string): string => {
  if (!options || typeof options !== 'object') return ''
  const value = (options as Record<string, unknown>)[key]
  if (Array.isArray(value)) return String(value[0] || '')
  return value === undefined || value === null ? '' : String(value)
}

const parseQuery = (query: string): Record<string, string> => {
  const decodedQuery = query.includes('%3F') || query.includes('%26') ? decodeURIComponent(query) : query
  const queryIndex = decodedQuery.indexOf('?')
  const normalizedQuery = (queryIndex >= 0 ? decodedQuery.slice(queryIndex + 1) : decodedQuery.replace(/^\?/, '')).split('#')[0]
  if (!normalizedQuery) return {}

  const params = new URLSearchParams(normalizedQuery)
  return Object.fromEntries(params.entries())
}

const parseLocationParams = (location: MemoH5LocationLike | undefined): Record<string, string> => {
  if (!location) return {}
  const hrefParams = parseQuery(location.href || '')
  const searchParams = parseQuery(location.search)
  const hashParams = parseQuery(location.hash)
  return { ...hrefParams, ...searchParams, ...hashParams }
}

const parseReadonly = (value: string): boolean | undefined => {
  if (!value) return undefined
  return value === '1' || value === 'true'
}

/** 统一解析 uni-app onLoad、H5 search 和 hash 路由中的备忘录参数。 */
export const parseMemoDetailParams = (
  options?: unknown,
  location: MemoH5LocationLike | undefined = getRuntimeH5Location(),
): MemoDetailRouteParams | null => {
  const h5Params = parseLocationParams(location)
  const id = getOptionValue(options, 'id') || getOptionValue(options, 'memoId') || h5Params.id || h5Params.memoId || h5Params.memo_id
  if (!id) return null

  const shareToken =
    getOptionValue(options, 'shareToken') || getOptionValue(options, 'share_token') || h5Params.shareToken || h5Params.share_token
  const modeValue = getOptionValue(options, 'mode') || h5Params.mode
  const mode = modeValue === 'private' || modeValue === 'admin' || modeValue === 'public' ? modeValue : undefined
  const readonly = parseReadonly(getOptionValue(options, 'readonly') || h5Params.readonly)
  const exportMode = parseReadonly(getOptionValue(options, 'export') || h5Params.export)

  return {
    id,
    ...(shareToken ? { shareToken } : {}),
    ...(mode ? { mode } : {}),
    ...(readonly !== undefined ? { readonly } : {}),
    ...(exportMode !== undefined ? { exportMode } : {}),
  }
}
