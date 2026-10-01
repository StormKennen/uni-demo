import http from '@/services/http'

export type WeatherSourceMode = 'location' | 'place' | 'map'
export type WeatherCoordinateSystem = 'wgs84' | 'gcj02'

export interface WeatherPoint {
  latitude: number
  longitude: number
  coordinateSystem: WeatherCoordinateSystem
  source: WeatherSourceMode
  placeId?: string
  name?: string
}

export interface WeatherCurrent {
  temperature: number
  apparentTemperature: number
  humidity: number
  conditionCode: number | string
  conditionText: string
  precipitation: number
  rain: number
  windSpeed: number
  windDirection: number
  windDirectionText: string
  windGust: number
  observedAt: string
}

export interface WeatherHourlyItem {
  time: string
  temperature: number
  apparentTemperature: number
  conditionCode: number | string
  conditionText: string
  precipitationProbability: number
  precipitation: number
  windSpeed: number
  windDirection: number
  windGust: number
}

export interface WeatherDailyItem {
  date: string
  conditionCode: number | string
  conditionText: string
  temperatureMin: number
  temperatureMax: number
  precipitationProbability: number
  precipitation: number
  windSpeedMax?: number
  windGustMax?: number
  sunrise?: string
  sunset?: string
}

export interface WeatherResult {
  location: { latitude: number; longitude: number; coordinateSystem: 'wgs84'; timezone?: string }
  current: WeatherCurrent
  hourly: WeatherHourlyItem[]
  daily: WeatherDailyItem[]
  metadata: { provider: string; queriedAt: string; cached: boolean }
}

export const getWeather = (point: WeatherPoint): Promise<WeatherResult> =>
  http.get('/weather', {
    latitude: point.latitude,
    longitude: point.longitude,
    coordinateSystem: point.coordinateSystem,
  }) as Promise<WeatherResult>
