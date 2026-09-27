/**
 * @description Altitude/查询当前海拔--接口请求Query参数
 * @url GET /altitude/current
 */
export interface getAltitudeCurrentQuery {
  /** 纬度 */
  latitude: number
  /** 经度 */
  longitude: number
}

/**
 * @description Altitude/查询当前海拔--接口返回值
 * @url GET /altitude/current
 */
export interface getAltitudeCurrentRes {
  /** 海拔，单位米 */
  altitudeMeters?: number
  latitude?: number
  longitude?: number
  queriedAt?: string
  source?: string
  unit?: string
}
