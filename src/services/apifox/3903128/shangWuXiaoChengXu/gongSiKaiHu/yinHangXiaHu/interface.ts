/* eslint-disable prettier/prettier */
export interface GetBizCompanyOpenAccountClosureBasicQuery {
    /** 订单id  example: undefined */
    order_id?: number
}
export interface GetBizCompanyOpenAccountClosureBasicRes {
    /**  是否有强积金 */
    has_mpf: boolean
    /**  强积金订单id */
    mpf_order_id: number
    /**  下户日期 */
    invest_date: string
    /**  昵称 */
    nickname: string
    /**  强积金 project id */
    mpf_business_order_project_id: string
}
export interface PostBizCompanyOpenAccountClosureDeliveryAddressReqAddress {
    /**  1-国内 2-国外 */
    address_aboard: number
    /**   */
    area: Array<string>
    /**   */
    country: string
    /**   */
    details: string
    /**   */
    foreign: string
}
export interface PostBizCompanyOpenAccountClosureDeliveryAddressReq {
    /**   */
    order_id: number
    /**   */
    receiver: string
    /**   */
    mobile: string
    /**   */
    address: PostBizCompanyOpenAccountClosureDeliveryAddressReqAddress
}

export type PostBizCompanyOpenAccountClosureDeliveryAddressRes = any
export interface GetBizCompanyOpenAccountClosureDeliveryAddressQuery {
    /**   example: undefined */
    order_id?: number
}
export interface GetBizCompanyOpenAccountClosureDeliveryAddressResAddress {
    /**   */
    address_aboard: number
    /**   */
    area: Array<string>
    /**   */
    country: string
    /**   */
    details: string
    /**   */
    foreign: string
}
export interface GetBizCompanyOpenAccountClosureDeliveryAddressRes {
    /**   */
    order_id: number
    /**   */
    receiver: string
    /**   */
    mobile: string
    /**   */
    address: GetBizCompanyOpenAccountClosureDeliveryAddressResAddress
    /**  单号 */
    tracking_number: string
}
