import http from '@/services/http'

export interface PlaceElevationResult {
  id: string
  name: string
  latitude: number
  longitude: number
  altitudeMeters: number
  source: 'database' | 'live'
  queriedAt: string
}

export const getAltitudePlaceElevation = (placeId: string): Promise<PlaceElevationResult> =>
  http.get(`/altitude/places/${encodeURIComponent(placeId)}/elevation`) as Promise<PlaceElevationResult>
