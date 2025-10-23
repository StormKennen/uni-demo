/* eslint-disable prettier/prettier */
export interface GetBizCompanyOpenAccountMessageListQuery {
    /** 订单id  example: undefined */
    order_id?: number
}

export type GetBizCompanyOpenAccountMessageListRes = GetBizCompanyOpenAccountMessageListResItem[]
export interface GetBizCompanyOpenAccountMessageListResItemMulti_attachment_pathItem {
    /**   */
    name: string
    /**   */
    url: string
}
export interface GetBizCompanyOpenAccountMessageListResItem {
    /**  名称 */
    name?: string
    /**  上传状态 ：0，待上传；1，已上传，待审核 ；2，审核通过 3，审核驳回 */
    status?: number
    /** 资料类型 0是证件资料。1是文书资料 */
    template_type?: number
    /**  模板id */
    template_id: number
    /**   */
    multi_attachment_path: Array<GetBizCompanyOpenAccountMessageListResItemMulti_attachment_pathItem>
    /**  certificates表id */
    certificates_id: number
    /**  提醒 */
    notice: string
    /**  0:必须提供, 1:如无可不提供 */
    upload_requirement: number
}
export interface GetBizCompanyOpenAccountMessageCertificatesDetailQuery {
    /** certificates表id  example: undefined */
    id?: number
}
export interface GetBizCompanyOpenAccountMessageCertificatesDetailResFilesItem {
    /**   */
    name: string
    /**   */
    url: string
    /**   */
    upload_time: string
}
export interface GetBizCompanyOpenAccountMessageCertificatesDetailResMulti_attachment_pathItem {
    /**   */
    name: string
    /**   */
    url: string
}
export interface GetBizCompanyOpenAccountMessageCertificatesDetailRes {
    /**   */
    template_type: number
    /**   */
    name: string
    /**  0，待上传；1，已上传，待审核 ；2，审核通过 3，审核驳回 */
    status: number
    /**   */
    description: string
    /**   */
    files: Array<GetBizCompanyOpenAccountMessageCertificatesDetailResFilesItem>
    /**   */
    multi_attachment_path: Array<GetBizCompanyOpenAccountMessageCertificatesDetailResMulti_attachment_pathItem>
    /**  模板文件url */
    template_url: string
    /**  驳回原因 */
    audit_desc: string
    /**  是否必须提供：0:必须提供, 1:如无可不提供 */
    upload_requirement: number
}
export interface GetBizCompanyOpenAccountMessageHsPlanQuery {
    /** 证件/文书id  example: undefined */
    id?: number
}
export interface GetBizCompanyOpenAccountMessageHsPlanRes {
    /**  香港公司背景 */
    hk_company_background: string
    /**  个人背景 */
    personal_background: string
    /**  产品介绍 */
    product_introduction: string
    /**  销售渠道 */
    distribution_channel: string
    /**  资金来源 */
    source_of_funds: string
    /**  收入比例 */
    income_ratio_region: string
    /**  营业额 */
    expected_revenue: string
}
export interface GetBizCompanyOpenAccountMessageZhKycQuery {
    /** 证件/文书id  example: undefined */
    id?: number
}
export interface GetBizCompanyOpenAccountMessageZhKycRes {
    /**  联系电话 */
    contact_number: string
    /**  电子邮箱 */
    email: string
    /**  工作经验 */
    hands_on_background: string
    /**  公司业务 */
    company_business: string
    /**  服务/产品 */
    service_product: string
    /**  营业额 */
    turnover: string
    /**  运营模式 */
    operation_mode: string
    /**  主要国家 */
    main_countries: string
    /**  员工人数 */
    employees_nums: string
    /**  工作地点 */
    work_location: string
    /**  主要供应国家 */
    main_supply: string
}
export interface PostBizCompanyOpenAccountMessageCertificatesReqFilesItem {
    /**   */
    name?: string
    /**   */
    url?: string
    /**  上传时间 */
    upload_time: string
}
export interface PostBizCompanyOpenAccountMessageCertificatesReq {
    /**   */
    id: number
    /**   */
    files: Array<PostBizCompanyOpenAccountMessageCertificatesReqFilesItem>
}
export interface PostBizCompanyOpenAccountMessageCertificatesRes {
}
export interface GetBizCompanyOpenAccountMessageCertificatesSendEmailQuery {
    /** 模板文件  example: undefined */
    template_url?: string
    /** 收件人邮箱  example: undefined */
    email?: string
}
export interface GetBizCompanyOpenAccountMessageCertificatesSendEmailRes {
}
export interface PostBizCompanyOpenAccountMessageHsPlanReq {
    /** 证件/文书id  */
    id: number
    /**   */
    hk_company_background: string
    /**   */
    personal_background: string
    /**   */
    distribution_channel: string
    /**   */
    product_introduction: string
    /**   */
    source_of_funds: string
    /**   */
    income_ratio_region: string
    /**   */
    expected_revenue: string
}
export interface PostBizCompanyOpenAccountMessageHsPlanRes {
}
export interface PostBizCompanyOpenAccountMessageZhKycReq {
    /**  id */
    id: number
    /**  联系电话 */
    contact_number: string
    /**  电子邮箱 */
    email: string
    /**  工作经验 */
    hands_on_background: string
    /**  公司业务 */
    company_business: string
    /**  服务/产品 */
    service_product: string
    /**  营业额 */
    turnover: string
    /**  运营模式 */
    operation_mode: string
    /**  主要国家 */
    main_countries: string
    /**  员工人数 */
    employees_nums: string
    /**  工作地点 */
    work_location: string
    /**  主要供应国家 */
    main_supply: string
}
export interface PostBizCompanyOpenAccountMessageZhKycRes {
}
