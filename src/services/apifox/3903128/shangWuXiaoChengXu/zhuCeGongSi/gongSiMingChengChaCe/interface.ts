/* eslint-disable prettier/prettier */
export interface PostBizCompanyRegisterNameTranslateReq {
    /** 简体中文  */
    name: string
}
export interface PostBizCompanyRegisterNameTranslateRes {
    /**   */
    id: number
    /**   */
    simplified_chinese: string
    /**   */
    traditional_chinese: string
    /**   */
    english: string
}
export interface PostBizCompanyRegisterSubmitNameReq {
    /**  简体中午 */
    simplified_chinese: string
    /**  繁体中文 */
    traditional_chinese: string
    /**  英文 */
    english: string
    /**  订单id */
    order_id: number
    /**  备用英文名称 */
    spare_english_name: string
    /**  备用公司名称繁体 */
    spare_traditional_chinese: string
    /**  备用企业名称 */
    spare_name: string
    /**  是否有备用名信息：0 没有1，有 */
    has_spare_info: number
}
export interface PostBizCompanyRegisterSubmitNameRes {
    /**  状态：1:通过 2:不通过 */
    status: number
    /**  提醒 */
    msg: string
}
export interface GetBizCompanyRegisterNameQuery {
    /** 订单id  example: 1 */
    order_id?: number
}
export interface GetBizCompanyRegisterNameRes {
    /**  订单id */
    order_id: number
    /**  简体中文 */
    simplified_chinese: string
    /**  繁体中文 */
    traditional_chinese: string
    /**  英文 */
    english: string
}
