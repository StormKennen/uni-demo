/* eslint-disable prettier/prettier */
export interface GetBizPersonalTaxBasicListQuery {
    /** 订单id  example: 24324 */
    order_id?: number
    /** 周期  example: 1 */
    period_id?: number
}
export interface GetBizPersonalTaxBasicListResTaskItem {
    /**   */
    task_key?: string
    /**   */
    task_key_name?: string
    /**  1:待开始 2:进行中 3:已完成 */
    status?: number
}
export interface GetBizPersonalTaxBasicListResCustomer_delivery_addressAddress {
    /**   */
    address_aboard: number
    /**   */
    area: string
    /**   */
    country: string
    /**   */
    details: string
    /**   */
    foreign: string
}
export interface GetBizPersonalTaxBasicListResCustomer_delivery_address {
    /**   */
    address: GetBizPersonalTaxBasicListResCustomer_delivery_addressAddress
    /**   */
    receiver: string
    /**   */
    mobile: string
}
export interface GetBizPersonalTaxBasicListResYh_addressAddress {
    /**   */
    address_aboard: string
    /**   */
    area: string
    /**   */
    country: string
    /**   */
    details: string
    /**   */
    foreign: string
}
export interface GetBizPersonalTaxBasicListResYh_address {
    /**   */
    address: GetBizPersonalTaxBasicListResYh_addressAddress
    /**   */
    receiver: string
    /**   */
    mobile: string
}
export interface GetBizPersonalTaxBasicListRes {
    /**   */
    task: Array<GetBizPersonalTaxBasicListResTaskItem>
    /**  客户收件地址 */
    customer_delivery_address: GetBizPersonalTaxBasicListResCustomer_delivery_address
    /**  kai地址 */
    yh_address: GetBizPersonalTaxBasicListResYh_address
    /**  快递单号 */
    tracking_number: string
    /**  是否收到税务局通知 1: 收到 */
    is_received_tax_bureau_notice: number
    /**  签字指引文件链接 */
    signature_guidelines: string
}
export interface GetBizPersonalTaxBasicSignDocumentQuery {
    /** 订单id  example: 3124234 */
    order_id?: number
    /** 周期  example: 1 */
    period_id?: number
}
export interface GetBizPersonalTaxBasicSignDocumentResFilesItem {
    /**   */
    url?: string
    /**   */
    name?: string
    /**   */
    upload_at?: string
}
export interface GetBizPersonalTaxBasicSignDocumentRes {
    /**  证件id */
    id: number
    /**   */
    files: Array<GetBizPersonalTaxBasicSignDocumentResFilesItem>
}
export interface PostBizPersonalTaxBasicSignDocumentReqFilesItem {
    /**  链接 */
    url: string
    /**  名字 */
    name: string
    /**  上传时间 */
    upload_at: string
}
export interface PostBizPersonalTaxBasicSignDocumentReq {
    /**  订单id */
    order_id: number
    /**   */
    files: Array<PostBizPersonalTaxBasicSignDocumentReqFilesItem>
    /**  周期 */
    period_id: number
}
export interface PostBizPersonalTaxBasicSignDocumentRes {
}
export interface PostBizPersonalTaxBasicReceivedTaxBureauNoticeReq {
    /** 123 订单id */
    order_id: number
    /**  周期 */
    period_id: number
}

export type PostBizPersonalTaxBasicReceivedTaxBureauNoticeRes = any
export interface PostBizPersonalTaxCustomerDeliveryAddressReqAddress {
    /**   */
    area: Array<string>
    /**   */
    country: string
    /**   */
    details: string
    /**   */
    foreign: string
    /**   */
    address_aboard: number
}
export interface PostBizPersonalTaxCustomerDeliveryAddressReq {
    /**  订单id */
    order_id: number
    /**   */
    address: PostBizPersonalTaxCustomerDeliveryAddressReqAddress
    /**  收货人 */
    receiver: string
    /**  手机号 */
    mobile: string
    /**  周期 */
    period_id: number
}

export type PostBizPersonalTaxCustomerDeliveryAddressRes = any
