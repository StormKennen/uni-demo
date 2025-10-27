/**
 * @description /客户主体列表--接口请求Query参数
 * @url GET /super-app/presale/app/associated-order/server/list
 */
export interface getAssociatedOrderServerListQuery {
  /** 合同号 */
  order_sn?: string
}

/**
 * @description /客户主体列表--接口返回值
 * @url GET /super-app/presale/app/associated-order/server/list
 */
export interface getAssociatedOrderServerListRes {
  list: getAssociatedOrderServerListResListItem[]
  select_server_id: string
}

/** getAssociatedOrderServerListResList */
export interface getAssociatedOrderServerListResListItem {
  server_id: string
  server_name: string
}

/**
 * @description /首页-交付服务--接口返回值
 * @url GET /super-app/presale/app/associated-order/business
 */
export interface getAppAssociatedOrderBusinessRes {
  business_order_project_id: string
  created_at: string
  order_id: string
  status: string
}

/**
 * @description /关联订单列表--接口请求Query参数
 * @url GET /super-app/presale/app/associated-order/order/list
 */
export interface getAssociatedOrderOrderListQuery {
  /** 主体id */
  server_id?: string
}

/**
 * @description /关联订单列表--接口返回值
 * @url GET /super-app/presale/app/associated-order/order/list
 */
export type getAssociatedOrderOrderListRes =
  getAssociatedOrderOrderListResItemItem[][]

/** getAssociatedOrderOrderListResItemProduct_detail */
export interface getAssociatedOrderOrderListResItemProduct_detailItem {
  business_order_project_id: string
  order_id: string
  order_sn: string
  presale_product_id: string
  product_id: number
  product_name: string
  purchase_time: string
  server_name: string
  service_period_end: string
  service_period_start: string
  type: number
}

/** getAssociatedOrderOrderListResItem */
export interface getAssociatedOrderOrderListResItemItem {
  business_order_project_id: string
  order_id: string
  product_detail: getAssociatedOrderOrderListResItemProduct_detailItem[]
  server_id: number
  show_type: string
  type: number
}

/**
 * @description /关联订单--接口请求Query参数
 * @url POST /super-app/presale/app/associated-order/actionable-order
 */
export interface postAppAssociatedOrderActionableOrderQuery {
  /** 合同号 */
  order_sn?: string
  /** 没有传-1 */
  server_id?: string
}

/**
 * @description /关联订单--接口返回值
 * @url POST /super-app/presale/app/associated-order/actionable-order
 */
export interface postAppAssociatedOrderActionableOrderRes {
  code: number
  msg: string
}
