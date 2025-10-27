/**
 * @description /获取产品的周期列表 (C端通用接口)--接口请求Query参数
 * @url GET /biz/period/get-period-list
 */
export interface getBizPeriodGetPeriodListQuery {
  business_order_project_id?: number
  [key: string]: any
}

/**
 * @description /获取产品的周期列表 (C端通用接口)--接口返回值
 * @url GET /biz/period/get-period-list
 */
export interface getBizPeriodGetPeriodListRes {
  current_period_info: getBizPeriodGetPeriodListResCurrent_period_info
  period_list: getBizPeriodGetPeriodListResPeriod_listItem[]
  [key: string]: any
}

/** getBizPeriodGetPeriodListResCurrent_period_info */
export interface getBizPeriodGetPeriodListResCurrent_period_info {
  num: number
  period_id: number
  [key: string]: any
}

/** getBizPeriodGetPeriodListResPeriod_list */
export interface getBizPeriodGetPeriodListResPeriod_listItem {
  num: number
  period_id: number
  [key: string]: any
}

/**
 * @description /交易所代码列表--接口返回值
 * @url GET /biz/stock-exchange/code
 */
export type getBizStockExchangeCodeRes = getBizStockExchangeCodeResItemItem[][]

/** getBizStockExchangeCodeResItem */
export interface getBizStockExchangeCodeResItemItem {
  code?: string
  name?: string
}
