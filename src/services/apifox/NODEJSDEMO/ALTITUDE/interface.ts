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

/**
 * @description Altitude/搜索预采集地点海拔--接口请求Query参数
 * @url GET /altitude/places
 */
export interface getAltitudePlacesQuery {
  /** 地点名称、别名、省市区县或景区关键词 */
  keyword?: string
  /** 地点层级 */
  level?: string

  page?: number

  pageSize?: number
}

/**
 * @description Altitude/搜索预采集地点海拔--接口返回值
 * @url GET /altitude/places
 */
export type getAltitudePlacesRes = object

/**
 * @description Altitude/获取预采集地点选择树--接口返回值
 * @url GET /altitude/places/options
 */
export type getAltitudePlacesOptionsRes = object

/**
 * @description Altitude/导入海拔 JSON--接口请求Body参数
 * @url POST /admin/altitude/places/import
 */
export interface postAltitudePlacesImportBody {
  file: string
  /**   example: upsert */
  mode?: string
  /**   example: true */
  dryRun?: boolean
}

/**
 * @description Altitude/导入海拔 JSON--接口返回值
 * @url POST /admin/altitude/places/import
 */
export type postAltitudePlacesImportRes = object

/**
 * @description Altitude/查询地点海拔--接口返回值
 * @url GET /altitude/places/{placeId}/elevation
 */
export type getPlacesPlaceIdElevationRes = object
