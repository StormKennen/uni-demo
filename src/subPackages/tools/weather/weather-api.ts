import { getWeather as getWeatherRequest } from '@/services/apifox/NODEJSDEMO/WEATHER/apifox'

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
  temperature: number | null
  apparentTemperature: number | null
  humidity: number | null
  conditionCode: number | null
  conditionText: string
  precipitation: number
  rain: number
  windSpeed: number | null
  windDirection: number | null
  windDirectionText: string
  windGust: number | null
  visibility: number | null
  cloudCover: number | null
  pressure: number | null
  observedAt: string
}

export interface WeatherHourlyItem {
  time: string
  temperature: number | null
  apparentTemperature: number | null
  conditionCode: number | null
  conditionText: string
  precipitationProbability: number
  precipitation: number
  windSpeed: number | null
  windDirection: number | null
  windGust: number | null
}

export interface WeatherDailyItem {
  date: string
  conditionCode: number | null
  conditionText: string
  temperatureMin: number | null
  temperatureMax: number | null
  precipitationProbability: number
  precipitation: number
  windSpeedMax: number | null
  windGustMax: number | null
  sunrise?: string
  sunset?: string
}

export interface WeatherResult {
  location: { latitude: number; longitude: number; coordinateSystem: 'wgs84'; timezone: string }
  current: WeatherCurrent
  hourly: WeatherHourlyItem[]
  daily: WeatherDailyItem[]
  metadata: { provider: string; queriedAt: string; cached: boolean }
}

type UnknownRecord = Record<string, unknown>

const isRecord = (value: unknown): value is UnknownRecord => typeof value === 'object' && value !== null && !Array.isArray(value)

const recordValue = (record: UnknownRecord, key: string): unknown => record[key]

const numberValue = (value: unknown, fallback: number | null = null): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) return Number(value)
  return fallback
}

const stringValue = (value: unknown, fallback = '') => (typeof value === 'string' ? value : fallback)

const numberOrZero = (value: unknown) => numberValue(value, 0) || 0

const unwrapWeatherResponse = (value: unknown): UnknownRecord => {
  if (!isRecord(value)) return {}
  const nestedData = recordValue(value, 'data')
  if (isRecord(nestedData) && !recordValue(value, 'current') && !recordValue(value, 'location')) return nestedData
  return value
}

const normalizeCurrent = (value: unknown): WeatherCurrent => {
  const source = isRecord(value) ? value : {}
  return {
    temperature: numberValue(recordValue(source, 'temperature')),
    apparentTemperature: numberValue(recordValue(source, 'apparentTemperature')),
    humidity: numberValue(recordValue(source, 'humidity')),
    conditionCode: numberValue(recordValue(source, 'conditionCode')),
    conditionText: stringValue(recordValue(source, 'conditionText'), '未知天气'),
    precipitation: numberOrZero(recordValue(source, 'precipitation')),
    rain: numberOrZero(recordValue(source, 'rain')),
    windSpeed: numberValue(recordValue(source, 'windSpeed')),
    windDirection: numberValue(recordValue(source, 'windDirection')),
    windDirectionText: stringValue(recordValue(source, 'windDirectionText'), '未知'),
    windGust: numberValue(recordValue(source, 'windGust')),
    visibility: numberValue(recordValue(source, 'visibility')),
    cloudCover: numberValue(recordValue(source, 'cloudCover')),
    pressure: numberValue(recordValue(source, 'pressure')),
    observedAt: stringValue(recordValue(source, 'observedAt')),
  }
}

const normalizeHourly = (value: unknown): WeatherHourlyItem[] => {
  if (!Array.isArray(value)) return []
  return value.filter(isRecord).map(item => ({
    time: stringValue(recordValue(item, 'time')),
    temperature: numberValue(recordValue(item, 'temperature')),
    apparentTemperature: numberValue(recordValue(item, 'apparentTemperature')),
    conditionCode: numberValue(recordValue(item, 'conditionCode')),
    conditionText: stringValue(recordValue(item, 'conditionText'), '未知天气'),
    precipitationProbability: numberOrZero(recordValue(item, 'precipitationProbability')),
    precipitation: numberOrZero(recordValue(item, 'precipitation')),
    windSpeed: numberValue(recordValue(item, 'windSpeed')),
    windDirection: numberValue(recordValue(item, 'windDirection')),
    windGust: numberValue(recordValue(item, 'windGust')),
  }))
}

const normalizeDaily = (value: unknown): WeatherDailyItem[] => {
  if (!Array.isArray(value)) return []
  return value.filter(isRecord).map(item => ({
    date: stringValue(recordValue(item, 'date')),
    conditionCode: numberValue(recordValue(item, 'conditionCode')),
    conditionText: stringValue(recordValue(item, 'conditionText'), '未知天气'),
    temperatureMin: numberValue(recordValue(item, 'temperatureMin')),
    temperatureMax: numberValue(recordValue(item, 'temperatureMax')),
    precipitationProbability: numberOrZero(recordValue(item, 'precipitationProbability')),
    precipitation: numberOrZero(recordValue(item, 'precipitation')),
    windSpeedMax: numberValue(recordValue(item, 'windSpeedMax')),
    windGustMax: numberValue(recordValue(item, 'windGustMax')),
    sunrise: stringValue(recordValue(item, 'sunrise')) || undefined,
    sunset: stringValue(recordValue(item, 'sunset')) || undefined,
  }))
}

export const normalizeWeatherResponse = (value: unknown): WeatherResult => {
  const source = unwrapWeatherResponse(value)
  const location = isRecord(recordValue(source, 'location')) ? (recordValue(source, 'location') as UnknownRecord) : {}
  const metadata = isRecord(recordValue(source, 'metadata')) ? (recordValue(source, 'metadata') as UnknownRecord) : {}

  return {
    location: {
      latitude: numberValue(recordValue(location, 'latitude'), 0) || 0,
      longitude: numberValue(recordValue(location, 'longitude'), 0) || 0,
      coordinateSystem: 'wgs84',
      timezone: stringValue(recordValue(location, 'timezone'), 'auto'),
    },
    current: normalizeCurrent(recordValue(source, 'current')),
    hourly: normalizeHourly(recordValue(source, 'hourly')),
    daily: normalizeDaily(recordValue(source, 'daily')),
    metadata: {
      provider: stringValue(recordValue(metadata, 'provider'), 'weather'),
      queriedAt: stringValue(recordValue(metadata, 'queriedAt'), new Date().toISOString()),
      cached: recordValue(metadata, 'cached') === true,
    },
  }
}

export const getWeather = async (point: WeatherPoint): Promise<WeatherResult> => {
  const response = await getWeatherRequest({
    latitude: point.latitude,
    longitude: point.longitude,
    coordinateSystem: point.coordinateSystem,
  })
  return normalizeWeatherResponse(response)
}
