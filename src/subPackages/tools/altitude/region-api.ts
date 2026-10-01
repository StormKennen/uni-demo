import http from '@/services/http'

export interface AltitudeRegionNode {
  value: string
  text: string
  level: 'province' | 'city' | 'county' | 'scenic_area' | 'scenic_point'
  placeId?: string
  children?: AltitudeRegionNode[]
}

export interface AltitudePlaceOptionRecord {
  id: string
  level: 'province' | 'city' | 'county' | 'scenic_area' | 'scenic_point'
  name: string
  fullName: string
  referenceType: string
  latitude: number
  longitude: number
  altitudeMeters: number
  scenicArea?: string
  collectedAt?: string
}

export interface AltitudePlaceOptionsResult {
  items: AltitudeRegionNode[]
  places: AltitudePlaceOptionRecord[]
}

export const getAltitudePlaceOptions = (): Promise<AltitudePlaceOptionsResult> =>
  http.get('/altitude/places/options') as Promise<AltitudePlaceOptionsResult>
