/**
 * @description Scenic/获取景区行政筛选树--接口返回值
 * @url GET /scenic/administrative-options
 */
export type getScenicAdministrativeOptionsRes = object

/**
 * @description Scenic/分页查询景区--接口返回值
 * @url GET /scenic/areas
 */
export type getScenicAreasRes = object

/**
 * @description Scenic/查询景区详情与景点分页--接口返回值
 * @url GET /scenic/areas/{areaId}
 */
export type getScenicAreasAreaIdRes = object

/**
 * @description Scenic/获取景区景点海拔折线图数据--接口返回值
 * @url GET /scenic/areas/{areaId}/elevation-profile
 */
export type getAreasAreaIdElevationProfileRes = object

/**
 * @description Scenic/分页搜索景点--接口返回值
 * @url GET /scenic/points/search
 */
export type getScenicPointsSearchRes = object
