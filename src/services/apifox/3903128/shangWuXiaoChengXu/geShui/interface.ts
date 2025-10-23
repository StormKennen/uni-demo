/* eslint-disable prettier/prettier */
export interface GetBizPersonalTaxSalariesTaxApplicationStatusQuery {
    /** 订单id  example: 123123 */
    order_id?: number
    /** 周期  example: undefined */
    period_id?: number
}
export interface GetBizPersonalTaxSalariesTaxApplicationStatusRes {
    /**  申报情况：1: 已申报 */
    status: number
    /**  薪俸税订单id */
    salaries_tax_order_id: number
}
export interface PostBizPersonalTaxSalariesTaxApplicationStatusReq {
    /** 订单id  */
    order_id: number
    /** 周期  */
    period_id: number
}

export type PostBizPersonalTaxSalariesTaxApplicationStatusRes = any
export interface GetBizPersonalTaxListQuery {
    /** 订单id  example: 324234 */
    order_id?: number
    /** 周期  example: undefined */
    period_id?: number
}
export interface GetBizPersonalTaxListResTaskItem {
    /**   */
    task_key: string
    /**   */
    task_key_name: string
    /**   */
    remark: string
    /**  1:待开始 2:进行中 3:已完成 */
    status: string
    /**  进度 */
    progress: string
    /**  个税下发类型：1: 秘书公司 2: 客户 */
    type: string
}
export interface GetBizPersonalTaxListRes {
    /**   */
    task: Array<GetBizPersonalTaxListResTaskItem>
}
