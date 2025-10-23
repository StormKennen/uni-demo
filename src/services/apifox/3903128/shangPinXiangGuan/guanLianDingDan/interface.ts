/* eslint-disable prettier/prettier */
export interface GetSuperAppPresaleAppAssociatedOrderServerListQuery {
    /** 合同号  example: undefined */
    order_sn?: string
    /** 1: 需要合同号 2:不需要合同号  example: undefined */
    operate_type?: string
}
export interface GetSuperAppPresaleAppAssociatedOrderServerListResListItem {
    /**  主体id */
    server_id: string
    /**  主体名称 */
    server_name: string
}
export interface GetSuperAppPresaleAppAssociatedOrderServerListRes {
    /**   */
    list: Array<GetSuperAppPresaleAppAssociatedOrderServerListResListItem>
    /**  选中id */
    select_server_id: string
}
export interface PostSuperAppPresaleAppAssociatedOrderActionableOrderQuery {
    /** 合同号  example: undefined */
    order_sn?: string
    /** 没有传-1  example: undefined */
    server_id?: string
}

export type PostSuperAppPresaleAppAssociatedOrderActionableOrderReq = any

export type PostSuperAppPresaleAppAssociatedOrderActionableOrderRes = any
export interface GetSuperAppPresaleAppAssociatedOrderBusinessRes {
    /**   */
    created_at: string
    /**  1: 存在 2:不存在 */
    status: string
    /**   */
    order_id: string
    /**   */
    business_order_project_id: string
}
export interface GetSuperAppPresaleAppAssociatedOrderOrderListQuery {
    /** 主体id  example: undefined */
    server_id?: string
}

export type GetSuperAppPresaleAppAssociatedOrderOrderListRes = GetSuperAppPresaleAppAssociatedOrderOrderListResItem[]
export interface GetSuperAppPresaleAppAssociatedOrderOrderListResItemProduct_detailItem {
    /**   */
    product_id: number
    /**  产品名称 */
    product_name: string
    /**  合同号 */
    order_sn: string
    /**  主体名称 */
    server_name: string
    /**  购买时间 */
    purchase_time: string
    /**  周期开始时间 */
    service_period_start: string
    /**  周期结束时间 */
    service_period_end: string
    /**   */
    type: number
    /**  订单id */
    order_id: string
    /**   */
    business_order_project_id: string
    /**  售前产品id */
    presale_product_id: string
}
export interface GetSuperAppPresaleAppAssociatedOrderOrderListResItem {
    /**   */
    server_id: number
    /**  1: 公司 2: 个人 0:无主体 */
    type: number
    /**   */
    product_detail: Array<GetSuperAppPresaleAppAssociatedOrderOrderListResItemProduct_detailItem>
    /**  1: 单轮次 2：多轮次 */
    show_type: string
    /**  进行中 */
    order_id: string
    /**  进行中 */
    business_order_project_id: string
}
