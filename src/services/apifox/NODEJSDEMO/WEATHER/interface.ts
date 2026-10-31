/**
 * @description Weather/查询实时天气--接口请求Query参数
 * @url GET /weather
 */
export interface getWeatherQuery {
  latitude: number

  longitude: number

  coordinateSystem?: string
}

/**
 * @description Weather/查询实时天气--接口返回值
 * @url GET /weather
 */
export type getWeatherRes = object
