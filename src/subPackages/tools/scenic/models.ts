import type { ParticalUniAppRequestOptions } from '@/services/interface'

export type ScenicRequestConfig = ParticalUniAppRequestOptions

export interface ScenicAdminNode {
  value: string
  text: string
  level: 'province' | 'city' | 'county'
  children?: ScenicAdminNode[]
}

export interface ScenicPointPreview {
  id: string
  placeKey?: string
  level: 'scenic_point'
  name: string
  fullName: string
  scenicArea?: string
  latitude: number
  longitude: number
  altitudeMeters: number | null
  coordinateSystem?: 'wgs84' | 'gcj02' | 'bd09'
  referenceType?: string
}

export interface ScenicAreaCard {
  id: string
  placeKey?: string
  level: 'scenic_area'
  name: string
  fullName: string
  province: string
  provinceCode: string
  city: string
  cityCode: string
  county: string
  countyCode: string
  latitude: number
  longitude: number
  altitudeMeters: number | null
  coordinateSystem?: 'wgs84' | 'gcj02' | 'bd09'
  grade?: string
  pointCount: number
  coverImage?: string
  previewPoints: ScenicPointPreview[]
}

export interface ScenicPagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasNext: boolean
}

export interface ScenicAreasResponse {
  items: ScenicAreaCard[]
  pagination: ScenicPagination
}

export interface ScenicPointSearchItem extends ScenicPointPreview {
  scenicAreaId: string
  scenicAreaName: string
  province?: string
  city?: string
  county?: string
}

export interface ScenicPointSearchResponse {
  items: ScenicPointSearchItem[]
  pagination: ScenicPagination
}

export interface ScenicProfileSeries {
  name: string
  unit: string
  data: number[]
}

export interface ScenicElevationProfileResponse {
  area: ScenicAreaCard
  categories: string[]
  series: ScenicProfileSeries[]
  points: Array<{
    pointId: string
    name: string
    altitudeMeters: number
    latitude: number
    longitude: number
  }>
  summary: {
    pointCount: number
    minAltitudeMeters: number | null
    maxAltitudeMeters: number | null
    altitudeDeltaMeters: number | null
  }
}

export interface ScenicAdministrativeOptionsResponse {
  items: ScenicAdminNode[]
}

export interface WeatherSummary {
  current?: {
    temperature?: number | null
    conditionText?: string
  }
  location?: {
    latitude?: number
    longitude?: number
  }
}

export const unwrapApiData = <T>(value: unknown): T => {
  if (typeof value === 'object' && value !== null && 'data' in value) {
    const nested = (value as { data?: unknown }).data
    if (nested !== undefined) return nested as T
  }
  return value as T
}

export const normalizeAdministrativeCode = (value: string | undefined) => {
  if (!value || value.includes(':')) return undefined
  return value
}

export const buildQueryConfig = (params: Record<string, string | number | boolean | undefined>): ScenicRequestConfig => ({
  params: Object.entries(params).reduce<Record<string, string | number | boolean>>((result, [key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      result[key] = value
    }
    return result
  }, {}),
})
