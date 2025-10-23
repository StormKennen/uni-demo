/* eslint-disable prettier/prettier */
export interface GetInfoflowOrderInformationGet_informationQuery {
    /** 订单id  example: 132699 */
    order_id?: string
}
export interface GetInfoflowOrderInformationGet_informationResBirth_place {
    /**   */
    country: string
    /**   */
    area: Array<string>
    /**   */
    foreign: string
    /**   */
    details: string
}
export interface GetInfoflowOrderInformationGet_informationResCertificates {
}
export interface GetInfoflowOrderInformationGet_informationResAddress {
    /**   */
    country: string
    /**   */
    area: Array<string>
    /**   */
    foreign: string
    /**   */
    details: string
}
export interface GetInfoflowOrderInformationGet_informationResUsername_pinyin {
    /**   */
    family_name: string
    /**   */
    given_name: string
}
export interface GetInfoflowOrderInformationGet_informationRes {
    /**   */
    id: number
    /**   */
    email: string
    /**   */
    has_hk_id: number
    /**   */
    hk_id_number: string
    /**   */
    is_handled: number
    /**   */
    is_live_oversea_year: number
    /**   */
    married: number
    /**   */
    mobile: string
    /**   */
    nationality: string
    /**   */
    order_id: string
    /**   */
    sex: number
    /**   */
    step: number
    /**   */
    surname: string
    /**   */
    used_name: string
    /**   */
    username: string
    /**   */
    birthday: string
    /**   */
    birth_place_aboard: number
    /**   */
    age: string
    /**   */
    address_aboard: number
    /**   */
    birth_place: GetInfoflowOrderInformationGet_informationResBirth_place
    /**   */
    certificates: GetInfoflowOrderInformationGet_informationResCertificates
    /**   */
    address: GetInfoflowOrderInformationGet_informationResAddress
    /**   */
    username_pinyin: GetInfoflowOrderInformationGet_informationResUsername_pinyin
}
export interface GetInfoflowOrderInformationPreview_informationQuery {
    /** 订单id  example: 132699 */
    order_id?: string
}
export interface GetInfoflowOrderInformationPreview_informationResCertificatesCn_identity_card {
    /**   */
    img_back: string
    /**   */
    img_front: string
    /**   */
    issue_at: string
    /**   */
    issue_date_end_at: string
    /**   */
    issue_date_start_at: string
    /**   */
    number: string
    /**   */
    type: string
}
export interface GetInfoflowOrderInformationPreview_informationResCertificatesHk_macao_pass {
    /**   */
    img_back: string
    /**   */
    img_front: string
    /**   */
    issue_at: string
    /**   */
    issue_date_end_at: string
    /**   */
    issue_date_start_at: string
    /**   */
    number: string
    /**   */
    type: string
}
export interface GetInfoflowOrderInformationPreview_informationResCertificatesPassport {
    /**   */
    img_back: string
    /**   */
    img_front: string
    /**   */
    issue_at: string
    /**   */
    issue_date_end_at: string
    /**   */
    issue_date_start_at: string
    /**   */
    number: string
    /**   */
    type: string
}
export interface GetInfoflowOrderInformationPreview_informationResCertificates {
    /**   */
    cn_identity_card: GetInfoflowOrderInformationPreview_informationResCertificatesCn_identity_card
    /**   */
    hk_macao_pass: GetInfoflowOrderInformationPreview_informationResCertificatesHk_macao_pass
    /**   */
    passport: GetInfoflowOrderInformationPreview_informationResCertificatesPassport
}
export interface GetInfoflowOrderInformationPreview_informationResHasId {
    /**   */
    has: string
    /**   */
    number: string
}
export interface GetInfoflowOrderInformationPreview_informationRes {
    /**   */
    username: string
    /**   */
    surname: string
    /**   */
    used_name: string
    /**   */
    sex: string
    /**   */
    email: string
    /**   */
    mobile: string
    /**   */
    married: string
    /**   */
    username_pinyin: string
    /**   */
    birth_place: string
    /**   */
    birth_place_details: string
    /**   */
    birthday: string
    /**   */
    nationality: string
    /**   */
    live_address_detail: string
    /**   */
    live_address: string
    /**   */
    is_live_oversea_year: number
    /**   */
    is_handled: number
    /**   */
    certificates: GetInfoflowOrderInformationPreview_informationResCertificates
    /**   */
    hasId: GetInfoflowOrderInformationPreview_informationResHasId
}
export interface GetInfoflowOrderInformationGet_simple_informationQuery {
    /** 订单id  example: 132699 */
    order_id?: string
}
export interface GetInfoflowOrderInformationGet_simple_informationResBirth_place {
    /**   */
    country: string
    /**   */
    area: Array<string>
    /**   */
    foreign: string
    /**   */
    details: string
}
export interface GetInfoflowOrderInformationGet_simple_informationResCertificates {
}
export interface GetInfoflowOrderInformationGet_simple_informationResAddress {
    /**   */
    country: string
    /**   */
    area: Array<string>
    /**   */
    foreign: string
    /**   */
    details: string
}
export interface GetInfoflowOrderInformationGet_simple_informationResUsername_pinyin {
    /**   */
    family_name: string
    /**   */
    given_name: string
}
export interface GetInfoflowOrderInformationGet_simple_informationRes {
    /**   */
    id: number
    /**   */
    email: string
    /**   */
    has_hk_id: number
    /**   */
    hk_id_number: string
    /**   */
    is_handled: number
    /**   */
    is_live_oversea_year: number
    /**   */
    married: number
    /**   */
    mobile: string
    /**   */
    nationality: string
    /**   */
    order_id: string
    /**   */
    sex: number
    /**   */
    step: number
    /**   */
    surname: string
    /**   */
    used_name: string
    /**   */
    username: string
    /**   */
    birthday: string
    /**   */
    birth_place_aboard: number
    /**   */
    age: string
    /**   */
    address_aboard: number
    /**   */
    birth_place: GetInfoflowOrderInformationGet_simple_informationResBirth_place
    /**   */
    certificates: GetInfoflowOrderInformationGet_simple_informationResCertificates
    /**   */
    address: GetInfoflowOrderInformationGet_simple_informationResAddress
    /**   */
    username_pinyin: GetInfoflowOrderInformationGet_simple_informationResUsername_pinyin
}
export interface GetInfoflowCountryQuery {
    /**   example: a */
    keyword?: string
}

export type GetInfoflowCountryRes = GetInfoflowCountryResItem[]
export interface GetInfoflowCountryResItem {
    /**   */
    code: string
    /**   */
    name_cn: string
    /**   */
    name_en: string
}
export interface PostInfoflowOrderInformationGet_hk_macao_passReq {
    /** 是否背面  */
    is_back: number
}
export interface PostInfoflowOrderInformationGet_hk_macao_passRes {
    /** 身份证姓名  */
    name?: string
    /** 拼音  */
    pingyin?: string
    /** 出生日期  */
    birth?: string
    /** 性别  */
    gender?: string
    /** 有效期开始;  */
    term_begins?: string
    /** 有效期结束时间;  */
    end_of_term?: string
    /** 证件地址;  */
    issuing_authority?: string
    /** 身份证号;  */
    card_num?: string
    /** 有效期开始;  */
    back_term_begins?: string
    /** 有效期结束时间;  */
    back_end_of_term?: string
    /** 香港类型;  */
    back_hk_type?: string
    /** 备注;  */
    back_remarks?: string
    /** 往返次数;  */
    back_round_trip_number?: string
}
export interface PostInfoflowOrderInformationGet_id_cardReq {
    /** 是否背面 1背面 0正面 */
    is_back?: number
}
export interface PostInfoflowOrderInformationGet_id_cardRes {
    /** 身份证姓名  */
    name?: string
    /** 性别  */
    gender?: string
    /** 国家  */
    nationality?: string
    /** 出生日期  */
    birth?: string
    /** 地址  */
    address?: string
    /** 身份证号  */
    card_num?: string
    /** 证件地址  */
    issuing_authority?: string
    /** 有效期开始  */
    term_begins?: string
    /** 有效期结束时间  */
    end_of_term?: string
}
export interface PostInfoflowOrderInformationUpdate_informationReqCertificates {
}
export interface PostInfoflowOrderInformationUpdate_informationReqUsername_pinyin {
    /**   */
    family_name?: string
    /**   */
    given_name?: string
}
export interface PostInfoflowOrderInformationUpdate_informationReqBirth_place {
    /** 国家  */
    country?: string
    /** 省市  */
    area?: Array<string>
    /** 国外地区  */
    foreign?: string
    /** 详细地址  */
    details?: string
}
export interface PostInfoflowOrderInformationUpdate_informationReqAddress {
    /** 国家  */
    country?: string
    /** 省市  */
    area?: Array<string>
    /** 国外地区  */
    foreign?: string
    /** 详细地址  */
    details?: string
}
export interface PostInfoflowOrderInformationUpdate_informationReq {
    /** 主键id  */
    id?: number
    /** 订单id  */
    order_id?: number
    /** 个人主信息填写进度：(优才)<0 初始信息 1 证件上传 2 证件信息 3 基本信息>  */
    step?: number
    /** 保存类型  */
    save_type?: string
    /** 是否国外生活  */
    is_live_oversea_year?: number
    /** 国家  */
    nationality?: string
    /** 是否办理；0-未办理；1-已办理；2-未知  */
    is_handled?: number
    /** 证件信息  */
    certificates?: PostInfoflowOrderInformationUpdate_informationReqCertificates
    /** 主申姓名  */
    username?: string
    /** 曾用名  */
    used_name?: string
    /** 婚前姓氏  */
    surname?: string
    /** 名称拼音  */
    username_pinyin?: PostInfoflowOrderInformationUpdate_informationReqUsername_pinyin
    /** 生日  */
    birthday?: string
    /** 出生城市类型  0-国内 1-国外 2-未知  */
    birth_place_aboard?: number
    /**   */
    birth_place?: PostInfoflowOrderInformationUpdate_informationReqBirth_place
    /** 性别:0为未知,1为男,2为女  */
    sex?: number
    /** 婚姻状态 1=已婚,2=未婚,3=离婚,4=分居,5=丧偶,6=事实婚姻,7=鳏寡  */
    married?: number
    /** 手机号  */
    mobile?: string
    /** 邮箱  */
    email?: string
    /** 现居住地址  0-国内 1-国外 2-未知  */
    address_aboard?: number
    /**   */
    address?: PostInfoflowOrderInformationUpdate_informationReqAddress
    /** 是否办理过香港身份证  */
    has_hk_id?: number
    /** 香港身份证号码  */
    hk_id_number?: string
    /** 海外居住时间  */
    residence_time?: string
    /** 是否  */
    have_permanent_residency?: number
}
export interface PostInfoflowOrderInformationUpdate_informationRes {
}
