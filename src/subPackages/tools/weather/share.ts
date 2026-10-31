import type { WeatherPoint, WeatherSourceMode } from './weather-api'

export const WEATHER_ROUTE = '/subPackages/tools/weather/index'

export const buildWeatherShare = (point: WeatherPoint) => {
  const params = [`mode=${point.source}`]
  let title = '实时天气｜查询当前位置天气'
  if (point.source === 'place' && point.placeId) {
    params.push(`placeId=${encodeURIComponent(point.placeId)}`)
    title = point.name ? `${point.name}｜实时天气` : '地点实时天气'
  } else if (point.source === 'map') {
    params.push(`lat=${point.latitude.toFixed(6)}`, `lng=${point.longitude.toFixed(6)}`, `cs=${point.coordinateSystem}`)
    if (point.name) params.push(`name=${encodeURIComponent(point.name).slice(0, 160)}`)
    title = point.name ? `${point.name}｜实时天气` : '地图选点｜实时天气'
  }
  return { title, path: `${WEATHER_ROUTE}?${params.join('&')}`, query: params.join('&') }
}

export const parseWeatherShare = (options: Record<string, string | undefined>) => {
  const mode = (options.mode === 'place' || options.mode === 'map' ? options.mode : 'location') as WeatherSourceMode
  if (mode === 'place') return { mode, placeId: options.placeId }
  if (mode === 'map') {
    const latitude = Number(options.lat)
    const longitude = Number(options.lng)
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return { mode: 'location' as const }
    return {
      mode,
      point: {
        latitude,
        longitude,
        coordinateSystem: options.cs === 'gcj02' ? ('gcj02' as const) : ('wgs84' as const),
        source: 'map' as const,
        name: options.name,
      },
    }
  }
  return { mode: 'location' as const }
}
