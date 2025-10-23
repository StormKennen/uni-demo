/* eslint-disable prettier/prettier */
export interface GetBizCompanyRegisterShareholdersBasicQuery {
    /** 订单id  example: undefined */
    order_id?: number
}
export interface GetBizCompanyRegisterShareholdersBasicResShareholderItem {
    /**  名字 */
    name?: string
    /**  1: 已提交 2: 未提交 */
    status: number
    /**  自然人 id */
    id: number
}
export interface GetBizCompanyRegisterShareholdersBasicRes {
    /**   */
    shareholder: Array<GetBizCompanyRegisterShareholdersBasicResShareholderItem>
    /**  法团 1: 选中 2: 未选中 */
    corporations: number
}
export interface PostBizCompanyRegisterShareholdersRemoveReq {
    /**  自然人id */
    id: number
}

export type PostBizCompanyRegisterShareholdersRemoveRes = any
export interface PostBizCompanyRegisterShareholdersCertificatesReqFilesItem {
    /**   */
    url: string
    /**   */
    name: string
    /**  front:正面  backend:背面  handheld:手持 */
    sign: string
}
export interface PostBizCompanyRegisterShareholdersCertificatesReqAddress_proofItem {
    /**   */
    name?: string
    /**   */
    url?: string
}
export interface PostBizCompanyRegisterShareholdersCertificatesReq {
    /**  2 中国身份证、3 香港身份证、4 护照 */
    id_type: number
    /**   */
    files: Array<PostBizCompanyRegisterShareholdersCertificatesReqFilesItem>
    /**   */
    address_proof: Array<PostBizCompanyRegisterShareholdersCertificatesReqAddress_proofItem>
    /**  列表id */
    id: number
    /**  合同id */
    order_id: number
    /**  1: 保存 2: 提交 */
    operate: number
}
export interface PostBizCompanyRegisterShareholdersCertificatesRes {
    /**  自然人id */
    id: number
}
export interface PostBizCompanyRegisterShareholdersInfoReqUsername_pinyin {
    /**  拼音-姓 */
    family_name: string
    /**  拼音-名 */
    given_name: string
}
export interface PostBizCompanyRegisterShareholdersInfoReqAddress {
    /**  地区 */
    area: Array<string>
    /**  城市 */
    country: string
    /**  详细地址 */
    details: string
    /**  国外地址 */
    foreign: string
    /**  1-国内 2-国外 */
    address_aboard: number
}
export interface PostBizCompanyRegisterShareholdersInfoReq {
    /**  自然人id */
    id: number
    /**  姓名 */
    name: string
    /**  拼音 */
    username_pinyin: PostBizCompanyRegisterShareholdersInfoReqUsername_pinyin
    /**  证件号码 */
    identity_card: string
    /**  birthday */
    birthday: string
    /**  国籍 */
    nationality: string
    /**  联系电话 */
    mobile: string
    /**  邮箱 */
    email: string
    /**  地址 */
    address: PostBizCompanyRegisterShareholdersInfoReqAddress
    /**  公司管理角色  1：股东；2：董事；3：股东+董事 */
    company_role: number
    /**  占股比例 */
    percentage: string
    /**  1: 保存 2: 提交 */
    operate: number
}

export type PostBizCompanyRegisterShareholdersInfoRes = any
export interface GetBizCompanyRegisterShareholdersDetailQuery {
    /** 自然人id  example: 1 */
    id?: number
}
export interface GetBizCompanyRegisterShareholdersDetailResCertificatesFilesItem {
    /**   */
    url?: string
    /**   */
    name?: string
    /**   */
    sign: string
}
export interface GetBizCompanyRegisterShareholdersDetailResCertificatesAddress_proofItem {
    /**   */
    name?: string
    /**   */
    url?: string
}
export interface GetBizCompanyRegisterShareholdersDetailResCertificates {
    /**  1: 内地身份证 2: 香港身份证 3: 护照 4: 现实居住地址证明 */
    id_type: number
    /**   */
    files: Array<GetBizCompanyRegisterShareholdersDetailResCertificatesFilesItem>
    /**   */
    address_proof: Array<GetBizCompanyRegisterShareholdersDetailResCertificatesAddress_proofItem>
}
export interface GetBizCompanyRegisterShareholdersDetailResInfoUsername_pinyin {
    /**   */
    family_name: string
    /**   */
    given_name: string
}
export interface GetBizCompanyRegisterShareholdersDetailResInfoAddress {
    /**   */
    area: Array<string>
    /**   */
    country: string
    /**   */
    details: string
    address_aboard: number
    foreign: string
}
export interface GetBizCompanyRegisterShareholdersDetailResInfo {
    /**   */
    name: string
    /**   */
    username_pinyin: GetBizCompanyRegisterShareholdersDetailResInfoUsername_pinyin
    /**   */
    identity_card: string
    /**   */
    birthday: string
    /**   */
    nationality: string
    /**   */
    mobile: string
    /**   */
    email: string
    /**   */
    address: GetBizCompanyRegisterShareholdersDetailResInfoAddress
    /**   */
    company_role: number
    /**   */
    percentage: string
}
export interface GetBizCompanyRegisterShareholdersDetailRes {
    /**   */
    certificates: GetBizCompanyRegisterShareholdersDetailResCertificates
    /**   */
    info: GetBizCompanyRegisterShareholdersDetailResInfo
}
export interface GetBizCompanyRegisterShareholdersListQuery {
    /** 订单id  example: undefined */
    order_id?: number
}

export type GetBizCompanyRegisterShareholdersListRes = GetBizCompanyRegisterShareholdersListResItem[]
export interface GetBizCompanyRegisterShareholdersListResItemUsername_pinyin {
    /**   */
    family_name: string
    /**   */
    given_name: string
}
export interface GetBizCompanyRegisterShareholdersListResItemAddress {
    /**   */
    area: Array<string>
    /**   */
    country: string
    /**   */
    details: string
}
export interface GetBizCompanyRegisterShareholdersListResItem {
    /**   */
    name?: string
    /**   */
    username_pinyin?: GetBizCompanyRegisterShareholdersListResItemUsername_pinyin
    /**   */
    identity_card?: string
    /**   */
    birthday?: string
    /**   */
    nationality?: string
    /**   */
    mobile?: string
    /**   */
    email?: string
    /**   */
    address?: GetBizCompanyRegisterShareholdersListResItemAddress
    /**   */
    company_role?: number
    /**   */
    percentage?: string
    /**  对应id */
    id: number
}
export interface PostBizCompanyRegisterShareholdersCheckReq {
    /**   */
    order_id: number
}
export interface PostBizCompanyRegisterShareholdersCheckRes {
}
export interface PostBizCompanyRegisterShareholdersSubmitReq {
    /**  订单id */
    order_id: number
    /**  法团 1: 选中 2: 未选中 */
    corporations: number
    /**  1: 只保存法团信息 2：正常保存 */
    operate_type: number
}
export interface PostBizCompanyRegisterShareholdersSubmitRes {
}
