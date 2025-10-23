/* eslint-disable prettier/prettier */
export interface GetBizCompanySalariesTaxListQuery {
    /** 订单id  example: 1 */
    order_id?: number
    /** 周期ID  example:  */
    period_id?: number
}

export type GetBizCompanySalariesTaxListRes = GetBizCompanySalariesTaxListResItem[]
export interface GetBizCompanySalariesTaxListResItem {
    /**  任务key */
    task_key: string
    /**  任务名称 */
    task_key_name: string
    /**  注意事项 */
    remark: string
    /**  1:待开始 2:进行中 3:已完成 */
    status: number
    /**  进度 */
    progress: number
}
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
