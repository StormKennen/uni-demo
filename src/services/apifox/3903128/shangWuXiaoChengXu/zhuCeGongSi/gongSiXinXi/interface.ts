/* eslint-disable prettier/prettier */
export interface GetBizCompanyRegisterInfoListQuery {
    /** 订单id  example: undefined */
    order_id?: number
}

export type GetBizCompanyRegisterInfoListRes = GetBizCompanyRegisterInfoListResItem[]
export interface GetBizCompanyRegisterInfoListResItem {
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
export interface GetBizCompanyRegisterInfoDetailQuery {
    /** 订单id  example: undefined */
    order_id?: number
}
export interface GetBizCompanyRegisterInfoDetailResRegistered_address {
    /**  地区 */
    area: Array<string>
    /**  城市 */
    country: string
    /**  详细地址 */
    details: string
    address_aboard: number
    foreign: number
}
export interface GetBizCompanyRegisterInfoDetailResSecretary_address {
    /**   */
    area: Array<string>
    /**  城市 */
    country: string
    /**  详细地址 */
    details: string
}
export interface GetBizCompanyRegisterInfoDetailRes {
    /**   */
    order_id: number
    /**  繁体中文 */
    traditional_chinese: string
    /**  英文 */
    english: string
    /**  注册资本 */
    registered_capital: number
    /**  币种（1 港币；2 人民币 3 美元 4 欧元） */
    currency_type: number
    /**  公司股份总额 */
    total_shares: number
    /**  每股金额 */
    per_share: number
    /**  经营范围（枚举） */
    business_scope: number
    /**  经营范围描述 */
    business_scope_remark: string
    /**  注册地址类型： 1 自有地址；2 秘书地址  0 未知 */
    address_type: number
    /**  自有地址 */
    registered_address: GetBizCompanyRegisterInfoDetailResRegistered_address
    /**  秘书地址 */
    secretary_address: GetBizCompanyRegisterInfoDetailResSecretary_address
    /**  邮箱 */
    email: string
    /**  经营范围 */
    business_scope_name: string
    /**  简体中文 */
    simplified_chinese: string
}
export interface PostBizCompanyRegisterInfoReqRegistered_address {
    /**   */
    area: Array<string>
    /**   */
    country: string
    /**   */
    details: string
}
export interface PostBizCompanyRegisterInfoReqSecretary_address {
    /**   */
    area: Array<string>
    /**   */
    country: string
    /**   */
    details: string
}
export interface PostBizCompanyRegisterInfoReq {
    /**   */
    order_id: number
    /**  注册资本 */
    registered_capital: number
    /**  币种（1 港币；2 人民币 3 美元 4 欧元） */
    currency_type: number
    /**  公司股份总额 */
    total_shares: number
    /**  每股金额 */
    per_share: number
    /**  经营范围（枚举） */
    business_scope: number
    /**  经营范围描述 */
    business_scope_remark: string
    /**  注册地址类型： 1 自有地址；2 秘书地址  0 未知 */
    address_type: number
    /**  自有地址 */
    registered_address: PostBizCompanyRegisterInfoReqRegistered_address
    /**  秘书地址 */
    secretary_address: PostBizCompanyRegisterInfoReqSecretary_address
    /**  1: 保存 2: 提交 */
    operate: number
}

export type PostBizCompanyRegisterInfoRes = any

export type GetBizCompanyRegisterScopeListRes = GetBizCompanyRegisterScopeListResItem[]
export interface GetBizCompanyRegisterScopeListResItem {
    /**  id */
    id: number
    /**  名称 */
    name: string
    /**  描述 */
    business_scope: string
}
