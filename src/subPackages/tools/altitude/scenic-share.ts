export const ALTITUDE_SCENIC_SELECTOR_ROUTE = '/subPackages/tools/altitude/index'
export const ALTITUDE_SCENIC_DETAIL_ROUTE = '/subPackages/tools/altitude/scenic-detail'

export interface ScenicSelectorShareFilters {
  provinceCode?: string
  cityCode?: string
  countyCode?: string
  keyword?: string
}

interface ShareQuery {
  [key: string]: string | undefined
}

const compactQuery = (query: ShareQuery) =>
  Object.entries(query)
    .filter(([, value]) => value !== undefined && value.trim() !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&')

const withQuery = (path: string, query: ShareQuery) => {
  const queryString = compactQuery(query)
  return queryString ? `${path}?${queryString}` : path
}

export const normalizeScenicSelectorShareFilters = (filters: ScenicSelectorShareFilters): ScenicSelectorShareFilters => ({
  provinceCode: filters.provinceCode?.trim() || undefined,
  cityCode: filters.cityCode?.trim() || undefined,
  countyCode: filters.countyCode?.trim() || undefined,
  keyword: filters.keyword?.trim() || undefined,
})

export const buildScenicSelectorShare = (filters: ScenicSelectorShareFilters = {}) => {
  const normalized = normalizeScenicSelectorShareFilters(filters)
  const query: ShareQuery = {
    mode: 'manual',
    provinceCode: normalized.provinceCode,
    cityCode: normalized.cityCode,
    countyCode: normalized.countyCode,
    q: normalized.keyword,
  }
  const queryString = compactQuery(query)

  return {
    title: '查询海拔｜景区筛选',
    path: withQuery(ALTITUDE_SCENIC_SELECTOR_ROUTE, query),
    timelineQuery: queryString,
  }
}

export const parseScenicSelectorShare = (options: Record<string, string | undefined>): ScenicSelectorShareFilters =>
  normalizeScenicSelectorShareFilters({
    provinceCode: options.provinceCode,
    cityCode: options.cityCode,
    countyCode: options.countyCode,
    keyword: options.q,
  })

export const buildScenicDetailShare = (options: { areaId: string; areaName?: string }) => {
  const query: ShareQuery = {
    areaId: options.areaId.trim(),
    name: options.areaName?.trim(),
  }
  const title = options.areaName?.trim() ? `查询海拔｜${options.areaName.trim()}` : '查询海拔｜景区海拔快照'
  const queryString = compactQuery(query)

  return {
    title,
    path: withQuery(ALTITUDE_SCENIC_DETAIL_ROUTE, query),
    timelineQuery: queryString,
  }
}

export const parseScenicDetailShare = (options: Record<string, string | undefined>) => ({
  areaId: options.areaId?.trim() || '',
  areaName: options.name?.trim() || '',
})
