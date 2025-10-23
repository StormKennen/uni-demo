/* eslint-disable prettier/prettier */
export interface GetBizCompanyRegisterResultQuery {
    /** 订单id  example: undefined */
    order_id?: number
}
export interface GetBizCompanyRegisterResultResTaskItem {
    /**  任务key */
    task_key?: string
    /**  任务名称 */
    task_key_name?: string
    /**  1:待开始 2:进行中 3:已完成 4:审批异常 */
    status?: number
}
export interface GetBizCompanyRegisterResultResRegister_filesItem {
    /**  文件类型 1.注册证书CI 2.商业登记证BR 3.法团成立表格NNC1和公司章程A&A 4.收据 10.其他文件 */
    type?: number
    /**  名称 */
    name?: string
    /**  url */
    url?: string
}
export interface GetBizCompanyRegisterResultRes {
    /**   */
    task: Array<GetBizCompanyRegisterResultResTaskItem>
    /**   */
    register_files: Array<GetBizCompanyRegisterResultResRegister_filesItem>
    /**  审核异常继续使用 1: 是 0: 未处理 */
    continue_use_approval_fails: number
    /**   */
    simplified_chinese: string
    /**   */
    english: string
    /**   */
    traditional_chinese_name: string
}
export interface GetBizCompanyRegisterResultNextQuery {
    /** 订单id  example: undefined */
    order_id?: string
}

export type GetBizCompanyRegisterResultNextRes = any
export interface PostBizCompanyRegisterResultNameReq {
    /**   */
    order_id: number
    /**   */
    traditional_chinese_name: string
    /**   */
    simplified_chinese: string
    /**   */
    english: string
}
export interface PostBizCompanyRegisterResultNameRes {
}
export interface PostBizCompanyRegisterResultContinueReq {
    /**   */
    order_id: string
}
export interface PostBizCompanyRegisterResultContinueRes {
}
