import http from '@/services/http'

export type PrecollectedPlaceLevel = 'province' | 'city' | 'county' | 'scenic_point'

export interface SearchAltitudePlacesQuery {
  keyword?: string
  level?: PrecollectedPlaceLevel
  page?: number
  pageSize?: number
}

export interface PrecollectedAltitudePlace {
  id: string
  level: PrecollectedPlaceLevel
  name: string
  aliases?: string[]
  fullName: string
  province?: string
  city?: string
  county?: string
  scenicArea?: string
  referenceType: string
  latitude: number
  longitude: number
  altitudeMeters: number
  source?: string
  collectedAt?: string
}

export interface SearchAltitudePlacesResult {
  items: PrecollectedAltitudePlace[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasNext: boolean
  }
  dataset?: {
    province?: { code?: string; name?: string }
    generatedAt?: string
  }
}

export const searchAltitudePlaces = (params: SearchAltitudePlacesQuery): Promise<SearchAltitudePlacesResult> =>
  http.get('/altitude/places', params) as Promise<SearchAltitudePlacesResult>
