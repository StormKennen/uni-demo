/* eslint-disable prettier/prettier */

export type GetSuperAppAssociatedOrderServicesRes = GetSuperAppAssociatedOrderServicesResItem[]
export interface GetSuperAppAssociatedOrderServicesResItem {
    /**  主体对应id */
    service_id?: number
    /**  主体名 */
    name?: string
}

export type GetSuperAppAssociatedOrderBusinessListRes = GetSuperAppAssociatedOrderBusinessListResItem[]
export interface GetSuperAppAssociatedOrderBusinessListResItemProduct_detailItem {
    /**   */
    product_name?: string
    /**   */
    cycle_start?: string
    /**   */
    cycle_end?: string
    /**   */
    order_id: string
}
export interface GetSuperAppAssociatedOrderBusinessListResItem {
    /**  主体id */
    server_id?: number
    /**  主体名字 */
    server_name?: string
    /**  产品名字 */
    product_name?: string
    /**  产品详情 */
    product_detail?: Array<GetSuperAppAssociatedOrderBusinessListResItemProduct_detailItem>
}
export interface PostSuperAppAssociatedOrderServicesLinkQuery {
    /** 主体id 0:暂不选择  example: undefined */
    service_id?: number
    /** 合同号  example: undefined */
    order_sn?: string
}

export type PostSuperAppAssociatedOrderServicesLinkReq = any
export interface PostSuperAppAssociatedOrderServicesLinkRes {
}
