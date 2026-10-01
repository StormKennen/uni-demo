import type { AltitudePoint, AltitudeSourceMode } from './altitude-api'

export const ALTITUDE_ROUTE = '/subPackages/tools/altitude/index'

export interface AltitudeShareState {
  mode: AltitudeSourceMode
  placeId?: string
  keyword?: string
  point?: AltitudePoint
}

const encode = (value: string) => encodeURIComponent(value).slice(0, 180)

export const buildAltitudeShare = (state: AltitudeShareState) => {
  const params: string[] = [`mode=${state.mode}`]
  let title = '查询海拔｜选择地点查询参考海拔'

  if (state.mode === 'place') {
    if (state.placeId) params.push(`placeId=${encode(state.placeId)}`)
    else if (state.keyword) params.push(`q=${encode(state.keyword)}`)
    title = '查询海拔｜地点参考海拔'
  }

  if (state.mode === 'map' && state.point) {
    params.push(`lat=${state.point.latitude.toFixed(6)}`)
    params.push(`lng=${state.point.longitude.toFixed(6)}`)
    params.push(`cs=${state.point.coordinateSystem}`)
    if (state.point.name) params.push(`name=${encode(state.point.name)}`)
    title = state.point.name ? `查询海拔｜${state.point.name}` : '查询海拔｜地图选点'
  }

  return {
    title,
    path: `${ALTITUDE_ROUTE}?${params.join('&')}`,
    timelineQuery: params.join('&'),
  }
}

export const parseAltitudeShare = (options: Record<string, string | undefined>) => {
  const mode = options.mode === 'place' || options.mode === 'map' ? options.mode : 'location'
  if (mode === 'place') {
    return { mode, placeId: options.placeId, keyword: options.q }
  }
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
