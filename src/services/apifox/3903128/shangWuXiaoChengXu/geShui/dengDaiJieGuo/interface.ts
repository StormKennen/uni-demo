/* eslint-disable prettier/prettier */
export interface GetBizPersonalTaxResultListQuery {
    /** 订单id  example: 123123 */
    order_id?: number
    /** 周期  example: undefined */
    period_id?: number
}
export interface GetBizPersonalTaxResultListResTaskItem {
    /**   */
    task_key: string
    /**   */
    task_key_name: string
    /**   */
    status: number
}
export interface GetBizPersonalTaxResultListResPersonal_tax_filesItem {
    /**   */
    name: string
    /**   */
    url: string
}
export interface GetBizPersonalTaxResultListResPersonal_tax_return_receiptItem {
    /**   */
    name: string
    /**   */
    url: string
}
export interface GetBizPersonalTaxResultListRes {
    /**   */
    task: Array<GetBizPersonalTaxResultListResTaskItem>
    /**  个税文件 */
    personal_tax_files: Array<GetBizPersonalTaxResultListResPersonal_tax_filesItem>
    /**  1:已递交至税局 2:下发评税通知 3.无需缴费 */
    personal_tax_results: number
    /**  评税通知 */
    tax_assessment_notice: string
    /**  回执 */
    personal_tax_return_receipt: Array<GetBizPersonalTaxResultListResPersonal_tax_return_receiptItem>
    /**  是否已进行信息确认：1: 已确认 */
    is_info_confirmation: string
}
export interface PostBizPersonalTaxResultDocumentConfirmationReq {
    /**  订单id */
    order_id: number
    /**  周期 */
    period_id: number
}

export type PostBizPersonalTaxResultDocumentConfirmationRes = any
export interface PostBizCompanyDocumentSendEmailReqFilesItem {
    /**   */
    name: string
    /**   */
    url: string
}
export interface PostBizCompanyDocumentSendEmailReq {
    /**  收件邮箱 */
    email_addr: string
    /**  发送文件 */
    files: Array<PostBizCompanyDocumentSendEmailReqFilesItem>
}
export interface PostBizCompanyDocumentSendEmailRes {
}
export interface PostBizPersonalTaxResultDocumentSupplementaryMaterialsReqFilesItem {
    /**   */
    name: string
    /**   */
    url: string
}
export interface PostBizPersonalTaxResultDocumentSupplementaryMaterialsReq {
    /**  订单id */
    order_id: number
    /**  文件信息 */
    files: Array<PostBizPersonalTaxResultDocumentSupplementaryMaterialsReqFilesItem>
    /**  名称 */
    name: string
    /**  补充说明 */
    desc: string
    /**  材料id，有值代表update */
    id: number
    /**  周期 */
    period_id: number
}
export interface PostBizPersonalTaxResultDocumentSupplementaryMaterialsRes {
}
export interface GetBizPersonalTaxResultDocumentSupplementaryMaterialsQuery {
    /** 订单id  example: undefined */
    order_id?: number
    /** 周期  example: undefined */
    period_id?: number
}

export type GetBizPersonalTaxResultDocumentSupplementaryMaterialsRes = GetBizPersonalTaxResultDocumentSupplementaryMaterialsResItem[]
export interface GetBizPersonalTaxResultDocumentSupplementaryMaterialsResItem {
    /**  资料名称 */
    name: string
    /**  补充说明  */
    desc: string
    /**  上传状态 0，待补充；1，已补充 */
    status: number
    /**   */
    id: number
}
export interface PostBizPersonalTaxResultDocumentSupplementaryMaterialsRemoveReq {
    /**  文件id */
    id: number
    /**  周期 */
    period_id: number
}

export type PostBizPersonalTaxResultDocumentSupplementaryMaterialsRemoveRes = any
export interface GetBizPersonalTaxResultDocumentSupplementaryMaterialsDetailQuery {
    /** 补充材料id  example: 1 */
    id?: number
    /** 周期  example: undefined */
    period_id?: number
}
export interface GetBizPersonalTaxResultDocumentSupplementaryMaterialsDetailResFilesItem {
    /**   */
    name?: number
    /**   */
    url?: string
}
export interface GetBizPersonalTaxResultDocumentSupplementaryMaterialsDetailRes {
    /**   */
    name: string
    /**   */
    desc: string
    /**   */
    files: Array<GetBizPersonalTaxResultDocumentSupplementaryMaterialsDetailResFilesItem>
    /**   */
    id: number
}
