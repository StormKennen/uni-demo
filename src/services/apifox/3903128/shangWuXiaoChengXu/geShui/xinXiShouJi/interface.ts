/* eslint-disable prettier/prettier */
export interface GetBizPersonalTaxReporterInfoListQuery {
    /** 订单id  example: 4324 */
    order_id?: number
    /** 周期  example: 1 */
    period_id?: number
}

export type GetBizPersonalTaxReporterInfoListRes = GetBizPersonalTaxReporterInfoListResItem[]
export interface GetBizPersonalTaxReporterInfoListResItem {
    /**  员工id */
    person_id?: number
    /**  名字 */
    name?: string
    /**  状态 1：待补充 2：已完成 */
    status?: number
}
export interface GetBizPersonalTaxReporterInfoFileListQuery {
    /** 订单id  example: undefined */
    order_id?: number
    /** 员工id  example: undefined */
    id?: number
    /** 周期  example: undefined */
    period_id?: number
}

export type GetBizPersonalTaxReporterInfoFileListRes = GetBizPersonalTaxReporterInfoFileListResItem[]
export interface GetBizPersonalTaxReporterInfoFileListResItemMulti_attachment_pathItem {
    /**   */
    name: string
    /**   */
    url: string
}
export interface GetBizPersonalTaxReporterInfoFileListResItemFilesItem {
    /**   */
    name: string
    /**   */
    url: string
    /**   */
    uid: string
    /**   */
    upload_at: string
}
export interface GetBizPersonalTaxReporterInfoFileListResItem {
    /**  名称 */
    name?: string
    /**  上传状态 ：0，待上传；1，已上传，待审核 ；2，审核通过 3，审核驳回 */
    status?: number
    /** 资料类型 0是证件资料。1是文书资料 */
    template_type?: number
    /**  模板id */
    template_id: number
    /**   */
    multi_attachment_path: Array<GetBizPersonalTaxReporterInfoFileListResItemMulti_attachment_pathItem>
    /**  certificates表id */
    certificates_id: number
    /**  提醒 */
    notice: string
    /**  0:必须提供, 1:如无可不提供 */
    upload_requirement: number
    /**  文件id */
    id: number
    /**   */
    files: Array<GetBizPersonalTaxReporterInfoFileListResItemFilesItem>
    /**  模板描述 */
    template_description: string
    /**  驳回原因 */
    audit_desc: string
}
export interface PostBizPersonalTaxReporterInfoCertificatesReqFilesItem {
    /**   */
    url: string
    /**   */
    name: string
    /**  front:正面 backend:背面 handheld:手持 */
    sign: string
}
export interface PostBizPersonalTaxReporterInfoCertificatesReq {
    /**  员工id，有则传，新增则是0 */
    id: number
    /**  订单id */
    order_id: number
    /**  2 中国身份证、3 香港身份证、4 护照 */
    id_type: number
    /**   */
    files: Array<PostBizPersonalTaxReporterInfoCertificatesReqFilesItem>
    /**  周期 */
    period_id: number
}
export interface PostBizPersonalTaxReporterInfoCertificatesRes {
    /**  员工id */
    id: number
}
export interface PostBizPersonalTaxReporterInfoInfoReqUsername_pinyin {
    /**  拼音-姓 */
    family_name: string
    /**  拼音-名 */
    given_name: string
}
export interface PostBizPersonalTaxReporterInfoInfoReqEmployer_pinyin {
    /**  拼音-姓 */
    family_name: string
    /**  拼音-名 */
    given_name: string
}
export interface PostBizPersonalTaxReporterInfoInfoReq {
    /**  自然人id */
    id: number
    /**  姓名 */
    name: string
    /**  拼音 */
    username_pinyin: PostBizPersonalTaxReporterInfoInfoReqUsername_pinyin
    /**  1: 保存 2: 提交 */
    operate: number
    /**  在职期间的工资收入总额 */
    salary: string
    /**  婚姻状况 1=已婚,2=未婚,3=离婚,4=分居,5=丧偶 */
    married: number
    /**  1: 有子女 2: 无子女 */
    has_child: number
    /**  证件号码 */
    identity_card: string
    /**  性别:0为未知,1为男,2为女 */
    sex: number
    /**  1: 有赡养父母 2: 无赡养父母 */
    has_parent: number
    /**  1: 有申报出租物业收入信息 2: 无申报出租物业收入信息 */
    has_rental_income: number
    /**  出租物业的地址 */
    rental_address: string
    /**  物业的持有比例 */
    rental_percentage: string
    /**  租金收入金额 */
    rental_income: string
    /**  出租期间支付的差饷总额 */
    rental_pay: string
    /**  雇主姓名 */
    employer_name: string
    /**  雇主拼音 */
    employer_pinyin: PostBizPersonalTaxReporterInfoInfoReqEmployer_pinyin
    /**  在职时间开始 */
    entry_time_start: string
    /**  在职时间结束 */
    entry_time_end: string
    /**  在职期间雇员自己支付的MPF公款总金额 */
    employee_mpf_fund: string
    /**  有无申报的独资业务收入  1:有 2 无 */
    has_business_income: number
    /**  独资企业名称 */
    business_company_name: string
    /**  配偶姓名 */
    spouse_name: string
    /**  出租时间-开始 */
    rental_at_start: string
    /**  出租时间-结束 */
    rental_at_end: string
    /**  受雇职位 */
    employed_job: string
    /**  周期 */
    period_id: number
}

export type PostBizPersonalTaxReporterInfoInfoRes = any
export interface PostBizPersonalTaxReporterInfoFileReqFiles {
    /**   */
    name: string
    /**   */
    url: string
    /**   */
    uid: number
    /**   */
    upload_at: string
}
export interface PostBizPersonalTaxReporterInfoFileReq {
    /**  证件id */
    id: number
    /**   */
    files: PostBizPersonalTaxReporterInfoFileReqFiles
    /**  员工id */
    person_id: number
    /**  合同id */
    order_id: number
    /**  add/rename/del */
    operation: string
    /**  周期 */
    period_id: number
}
export interface PostBizPersonalTaxReporterInfoFileRes {
}
export interface GetBizPersonalTaxReporterInfoDetailQuery {
    /** 员工id  example: undefined */
    id?: number
    /** 订单id  example: undefined */
    order_id?: number
    /** 周期  example: undefined */
    period_id?: number
}
export interface GetBizPersonalTaxReporterInfoDetailResCertificatesFilesItem {
    /**   */
    url: string
    /**   */
    name: string
    /**   */
    sign: string
}
export interface GetBizPersonalTaxReporterInfoDetailResCertificates {
    /**   */
    id_type: number
    /**   */
    files: Array<GetBizPersonalTaxReporterInfoDetailResCertificatesFilesItem>
}
export interface GetBizPersonalTaxReporterInfoDetailResInfoUsername_pinyin {
    /**   */
    family_name: string
    /**   */
    given_name: string
}
export interface GetBizPersonalTaxReporterInfoDetailResInfoRental_address {
    /**   */
    area: Array<string>
    /**   */
    country: string
    /**   */
    details: string
    /**   */
    foreign: string
    /**   */
    address_aboard: string
}
export interface GetBizPersonalTaxReporterInfoDetailResInfoEmployer_pinyin {
    /**   */
    family_name: string
    /**   */
    given_name: string
}
export interface GetBizPersonalTaxReporterInfoDetailResInfo {
    /**   */
    name: string
    /**   */
    username_pinyin: GetBizPersonalTaxReporterInfoDetailResInfoUsername_pinyin
    /**   */
    sex: number
    /**   */
    identity_card: string
    /**   */
    married: number
    /**   */
    spouse_name: string
    /**   */
    has_child: number
    /**   */
    has_parent: number
    /**   */
    has_rental_income: number
    /**   */
    rental_address: GetBizPersonalTaxReporterInfoDetailResInfoRental_address
    /**   */
    rental_percentage: string
    /**   */
    rental_income: string
    /**   */
    rental_pay: string
    /**   */
    employer_name: string
    /**   */
    employer_pinyin: GetBizPersonalTaxReporterInfoDetailResInfoEmployer_pinyin
    /**   */
    entry_time_start: string
    /**   */
    entry_time_end: string
    /**   */
    salary: string
    /**   */
    employee_mpf_fund: string
    /**  有无申报的独资业务收入  1:有 2 无 */
    has_business_income: number
    /**   */
    business_company_name: string
    /**   */
    rental_at_start: string
    /**   */
    rental_at_end: string
    /**   */
    employed_job: string
}
export interface GetBizPersonalTaxReporterInfoDetailRes {
    /**   */
    certificates: GetBizPersonalTaxReporterInfoDetailResCertificates
    /**   */
    info: GetBizPersonalTaxReporterInfoDetailResInfo
}
export interface PostBizPersonalTaxReporterInfoFileSubmitReq {
    /**  成员id */
    id: number
    /**  订单id */
    order_id: number
    /**  周期 */
    period_id: number
}
export interface PostBizPersonalTaxReporterInfoFileSubmitRes {
}
export interface PostBizPersonalTaxReporterInfoListSubmitReq {
    /**   */
    order_id: string
    /**  周期 */
    period_id: number
}
export interface PostBizPersonalTaxReporterInfoListSubmitRes {
}
export interface PostBizPersonalTaxReporterInfoInfoRemoveReq {
    /**  成员id */
    person_id: number
    /**  周期 */
    period_id: number
}
export interface PostBizPersonalTaxReporterInfoInfoRemoveRes {
}
