/* eslint-disable prettier/prettier */
export interface GetBizCompanySalariesTaxDocumentListQuery {
    /** 订单id  example: undefined */
    order_id?: number
    /** 周期ID  example:  */
    period_id?: number
}
export interface GetBizCompanySalariesTaxDocumentListResTaskItem {
    /**  任务key */
    task_key?: string
    /**  任务名称 */
    task_key_name?: string
    /**  1:待开始 2:进行中 3:已完成 */
    status?: number
}
export interface GetBizCompanySalariesTaxDocumentListResSalaries_tax_fileItem {
    /**   */
    name: string
    /**   */
    url: string
}
export interface GetBizCompanySalariesTaxDocumentListResYh_addressAddress {
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
export interface GetBizCompanySalariesTaxDocumentListResYh_address {
    /**   */
    address: GetBizCompanySalariesTaxDocumentListResYh_addressAddress
    /**   */
    receiver: string
    /**   */
    mobile: string
}
export interface GetBizCompanySalariesTaxDocumentListResCustomer_delivery_addressAddress {
    /**  1: 国内 2: 国外 */
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
export interface GetBizCompanySalariesTaxDocumentListResCustomer_delivery_address {
    /**   */
    address: GetBizCompanySalariesTaxDocumentListResCustomer_delivery_addressAddress
    /**   */
    receiver: string
    /**   */
    mobile: string
}
export interface GetBizCompanySalariesTaxDocumentListRes {
    /**   */
    task: Array<GetBizCompanySalariesTaxDocumentListResTaskItem>
    /**  薪俸税文件 */
    salaries_tax_file: Array<GetBizCompanySalariesTaxDocumentListResSalaries_tax_fileItem>
    /**  是否已经成功通知：1：否 需要通知 */
    is_notice: number
    /**  是否秘书代签：1：否 2：是 */
    is_proxy_signature: number
    /**  kai收货地址 */
    yh_address: GetBizCompanySalariesTaxDocumentListResYh_address
    /**  客户收件地址 */
    customer_delivery_address: GetBizCompanySalariesTaxDocumentListResCustomer_delivery_address
    /**  快递单号 */
    tracking_number: string
    /**  是否已确认文件：1：否 2：是 */
    is_confirm: number
}
export interface PostBizCompanySalariesTaxDocumentConfirmationReq {
    /**  订单id */
    order_id: number
    /**  周期ID */
    period_id: number
}

export type PostBizCompanySalariesTaxDocumentConfirmationRes = any
export interface PostBizCompanySalariesTaxDocumentSupplementaryMaterialsReqFilesItem {
    /**   */
    name: string
    /**   */
    url: string
}
export interface PostBizCompanySalariesTaxDocumentSupplementaryMaterialsReq {
    /**  订单id */
    order_id: number
    /**  文件信息 */
    files: Array<PostBizCompanySalariesTaxDocumentSupplementaryMaterialsReqFilesItem>
    /**  周期ID */
    period_id: number
}
export interface PostBizCompanySalariesTaxDocumentSupplementaryMaterialsRes {
}
export interface GetBizCompanySalariesTaxDocumentSupplementaryMaterialsQuery {
    /** 订单id example: undefined */
    order_id: number
    /** 周期ID example:  */
    period_id: number
}
export interface GetBizCompanySalariesTaxDocumentSupplementaryMaterialsResFilesItem {
    /**   */
    name: string
    /**   */
    url: string
}
export interface GetBizCompanySalariesTaxDocumentSupplementaryMaterialsRes {
    /**   */
    files: Array<GetBizCompanySalariesTaxDocumentSupplementaryMaterialsResFilesItem>
}
export interface PostBizCompanySalariesTaxDocumentCustomerDeliveryAddressReqAddress {
    /**   */
    area: Array<string>
    /**   */
    details: string
    /**   */
    foreign: string
    /**   */
    address_aboard: number
    /**   */
    country: string
}
export interface PostBizCompanySalariesTaxDocumentCustomerDeliveryAddressReq {
    /**  订单id */
    order_id: number
    /**   */
    address: PostBizCompanySalariesTaxDocumentCustomerDeliveryAddressReqAddress
    /**  收货人 */
    receiver: string
    /**  手机号 */
    mobile: string
    /**  周期ID */
    period_id: number
}

export type PostBizCompanySalariesTaxDocumentCustomerDeliveryAddressRes = any
export interface PostBizCompanySalariesTaxDocumentSignDocumentReqExpand_fieldsItem {
    /**  文件链接 */
    url: string
    /**  文件名 */
    name: string
    /**  上传于 */
    upload_at: string
}
export interface PostBizCompanySalariesTaxDocumentSignDocumentReq {
    /**  订单id */
    order_id: number
    /**  签署文件 */
    expand_fields: Array<PostBizCompanySalariesTaxDocumentSignDocumentReqExpand_fieldsItem>
    /**  周期ID */
    period_id: number
}

export type PostBizCompanySalariesTaxDocumentSignDocumentRes = any
export interface GetBizCompanySalariesTaxDocumentSignDocumentDetailQuery {
    /** 订单id  example: 1 */
    order_id?: number
    /** 周期ID example:  */
    period_id: number
}
export interface GetBizCompanySalariesTaxDocumentSignDocumentDetailResExpand_fieldsItem {
    /**   */
    url: string
    /**   */
    name: string
    /**   */
    upload_at: string
}
export interface GetBizCompanySalariesTaxDocumentSignDocumentDetailRes {
    /**  文件数据id */
    id: number
    /**   */
    expand_fields: Array<GetBizCompanySalariesTaxDocumentSignDocumentDetailResExpand_fieldsItem>
}
