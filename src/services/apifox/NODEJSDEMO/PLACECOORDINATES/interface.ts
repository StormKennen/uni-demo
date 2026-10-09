/**
 * @description PlaceCoordinates/导入全国地点坐标 JSON--接口请求Body参数
 * @url POST /admin/place-coordinates/import
 */
export interface postAdminPlaceCoordinatesImportBody {
  file: string
  /**   example: upsert */
  mode?: string
  /**   example: true */
  dryRun?: boolean
}

/**
 * @description PlaceCoordinates/导入全国地点坐标 JSON--接口返回值
 * @url POST /admin/place-coordinates/import
 */
export type postAdminPlaceCoordinatesImportRes = object
