import http from '@/services/http'

export type AltitudeSourceMode = 'location' | 'place' | 'map'
export type CoordinateSystem = 'wgs84' | 'gcj02'

export interface AltitudePoint {
  latitude: number
  longitude: number
  coordinateSystem: CoordinateSystem
  source: AltitudeSourceMode
  placeId?: string
  name?: string
}

export interface AltitudeElevationResult {
  latitude: number
  longitude: number
  coordinateSystem: 'wgs84'
  inputCoordinateSystem: CoordinateSystem
  altitudeMeters: number
  unit: 'm'
  source: string
  queriedAt: string
}

export const getElevation = (point: AltitudePoint): Promise<AltitudeElevationResult> =>
  http.get('/altitude/elevation', {
    latitude: point.latitude,
    longitude: point.longitude,
    coordinateSystem: point.coordinateSystem,
  }) as Promise<AltitudeElevationResult>
