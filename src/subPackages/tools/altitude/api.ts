import http from '@/services/http'

export interface CurrentAltitudeQuery {
  latitude: number
  longitude: number
}

export interface CurrentAltitudeResult {
  latitude: number
  longitude: number
  altitudeMeters: number
  unit: 'm'
  source: 'open-meteo'
  queriedAt: string
}

export const getCurrentAltitude = (params: CurrentAltitudeQuery): Promise<CurrentAltitudeResult> =>
  http.get('/altitude/current', params) as Promise<CurrentAltitudeResult>
