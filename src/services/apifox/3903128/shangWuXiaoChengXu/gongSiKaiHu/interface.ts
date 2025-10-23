/* eslint-disable prettier/prettier */
export interface GetBizCompanyOpenAccountListQuery {
    /** 订单id  example: 1 */
    order_id?: number
}

export type GetBizCompanyOpenAccountListRes = GetBizCompanyOpenAccountListResItem[]
export interface GetBizCompanyOpenAccountListResItem {
    /**  任务key */
    task_key: string
    /**  任务名称 */
    task_key_name: string
    /**  提醒 */
    remark: string
    /**  1:待开始 2:进行中 3:已完成 */
    status: number
    /**  进度 */
    progress: number
}
export interface PostBizCompanySendEmailReq {
    /** 订单ID  */
    order_id: number
    /** 类型 1: 注册公司KYC 文件  2: 注册公司-注册文件 3: 恒生银行-KYC模板   */
    type: number
    /**  邮箱地址 */
    email_addr: string
    /**   */
    sign: number
}
export interface PostBizCompanySendEmailRes {
}
