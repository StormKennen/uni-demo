/* eslint-disable prettier/prettier */
export interface GetBizCompanySalariesTaxBasicInfoListQuery {
    /** 订单id  example: undefined */
    order_id?: number
    /**  example: 周期ID */
    period_id: number
}

export type GetBizCompanySalariesTaxBasicInfoListRes = GetBizCompanySalariesTaxBasicInfoListResItem[]
export interface GetBizCompanySalariesTaxBasicInfoListResItem {
    /**  员工id */
    person_id: number
    /**  名字 */
    name: string
    /**  状态 1：待补充 2：已完成 */
    status: number
}
export interface PostBizCompanySalariesTaxBasicInfoRemoveReq {
    /**  员工id */
    id: string
}

export type PostBizCompanySalariesTaxBasicInfoRemoveRes = any
export interface PostBizCompanySalariesTaxBasicInfoCertificatesReqFilesItem {
    /**   */
    url: string
    /**   */
    name: string
    /**  front:正面 backend:背面 handheld:手持 */
    sign: string
}
export interface PostBizCompanySalariesTaxBasicInfoCertificatesReq {
    /**  员工id，有则传，新增则是0 */
    id: number
    /**  订单id */
    order_id: number
    /**  2 中国身份证、3 香港身份证、4 护照 */
    id_type: number
    /**   */
    files: Array<PostBizCompanySalariesTaxBasicInfoCertificatesReqFilesItem>
    /**  周期ID */
    period_id: number
}
export interface PostBizCompanySalariesTaxBasicInfoCertificatesRes {
    /**  员工id */
    id: number
}
export interface PostBizCompanySalariesTaxBasicInfoInfoReqUsername_pinyin {
    /**  拼音-姓 */
    family_name: string
    /**  拼音-名 */
    given_name: string
}
export interface PostBizCompanySalariesTaxBasicInfoInfoReqAddress {
    /**  地区 */
    area: Array<string>
    /**  城市 */
    country: string
    /**  详细地址 */
    details: string
    /**  国外地址 */
    foreign: string
    /**  通信地址是否国内外 1国内 2国外  */
    address_aboard: number
}
export interface PostBizCompanySalariesTaxBasicInfoInfoReqSpouse_username_pinyin {
    /**   */
    family_name: string
    /**   */
    given_name: string
}
export interface PostBizCompanySalariesTaxBasicInfoInfoReq {
    /**  自然人id */
    id: number
    /**  姓名 */
    name: string
    /**  拼音 */
    username_pinyin: PostBizCompanySalariesTaxBasicInfoInfoReqUsername_pinyin
    /**  地址 */
    address: PostBizCompanySalariesTaxBasicInfoInfoReqAddress
    /**  1: 保存 2: 提交 */
    operate: number
    /**  受雇单位 */
    employed_unit: string
    /**  工资 */
    salary: number
    /**  婚姻状况 1=已婚,2=未婚,3=离婚,4=分居,5=丧偶 */
    married: number
    /**  1: 有子女 2: 无子女 */
    has_child: number
    /**  子女数量 */
    child_num: number
    /**  配偶姓名 */
    spouse_name: string
    /**  配偶拼音 */
    spouse_username_pinyin: PostBizCompanySalariesTaxBasicInfoInfoReqSpouse_username_pinyin
    /**  证件号码 */
    identity_card: string
    /**  配偶身份证号码 */
    spouse_identity_card: string
    /**  性别:0为未知,1为男,2为女 */
    sex: number
    /**  周期ID */
    period_id: number
}

export type PostBizCompanySalariesTaxBasicInfoInfoRes = any
export interface PostBizCompanySalariesTaxBasicInfoSubmitReq {
    /**  是否秘书代签：1：否 2：是 */
    is_proxy_signature: number
    /**  订单id */
    order_id: number
    /**  周期ID */
    period_id: number
}

export type PostBizCompanySalariesTaxBasicInfoSubmitRes = any
export interface GetBizCompanySalariesTaxBasicInfoDetailQuery {
    /** 员工id  example: undefined */
    id?: number
    /** 订单id  example: undefined */
    order_id?: number
    /** 周期ID  example:  */
    period_id?: number
}
export interface GetBizCompanySalariesTaxBasicInfoDetailResCertificatesFilesItem {
    /**   */
    url?: string
    /**   */
    name?: string
    /**   */
    sign?: string
}
export interface GetBizCompanySalariesTaxBasicInfoDetailResCertificates {
    /**  2 中国身份证、3 香港身份证、4 护照 */
    id_type: number
    /**   */
    files: Array<GetBizCompanySalariesTaxBasicInfoDetailResCertificatesFilesItem>
}
export interface GetBizCompanySalariesTaxBasicInfoDetailResInfoUsername_pinyin {
    /**   */
    family_name: string
    /**   */
    given_name: string
}
export interface GetBizCompanySalariesTaxBasicInfoDetailResInfoAddress {
    /**   */
    area: Array<string>
    /**   */
    country: string
    /**   */
    details: string
    /**   */
    address_aboard: number
    /**   */
    foreign: string
}
export interface GetBizCompanySalariesTaxBasicInfoDetailResInfoSpouse_username_pinyin {
    /**   */
    family_name: string
    /**   */
    given_name: string
}
export interface GetBizCompanySalariesTaxBasicInfoDetailResInfo {
    /**   */
    name: string
    /**   */
    username_pinyin: GetBizCompanySalariesTaxBasicInfoDetailResInfoUsername_pinyin
    /**   */
    identity_card: string
    /**   */
    address: GetBizCompanySalariesTaxBasicInfoDetailResInfoAddress
    /**   */
    employed_unit: string
    /**   */
    salary: string
    /**   */
    married: string
    /**   */
    has_child: number
    /**   */
    child_num: string
    /**   */
    spouse_name: string
    /**   */
    spouse_username_pinyin: GetBizCompanySalariesTaxBasicInfoDetailResInfoSpouse_username_pinyin
    /**   */
    spouse_identity_card: string
}
export interface GetBizCompanySalariesTaxBasicInfoDetailRes {
    /**   */
    certificates: GetBizCompanySalariesTaxBasicInfoDetailResCertificates
    /**   */
    info: GetBizCompanySalariesTaxBasicInfoDetailResInfo
}
