/* eslint-disable prettier/prettier */
export interface GetBizCompanyOpenAccountMatchingProgrammeQuery {
    /** 合同id  example: undefined */
    order_id?: number
}
export interface GetBizCompanyOpenAccountMatchingProgrammeRes {
    /**  账户类型 */
    account_type: string
    /**  备注 */
    remark: string
    /**  银行名称 */
    name: string
    /**  银行代码 */
    code: string
    /**  这是一段管理费 */
    cost: string
    /**  开户要求 */
    requirement: string
    /**  开户周期 */
    account_opening_cycle: string
}
export interface PostBizCompanyOpenAccountMatchingProgrammeReq {
    /**   */
    order_id: number
}
export interface PostBizCompanyOpenAccountMatchingProgrammeRes {
}
