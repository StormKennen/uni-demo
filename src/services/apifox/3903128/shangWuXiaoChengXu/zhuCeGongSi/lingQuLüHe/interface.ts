/* eslint-disable prettier/prettier */
export interface GetBizCompanyRegisterGreenBoxBasicQuery {
    /** 订单id  example: undefined */
    order_id?: number
}
export interface GetBizCompanyRegisterGreenBoxBasicRes {
    /**  1:待确认 2:已完成 */
    status: number
    /**  绿盒信息id */
    id: number
}
export interface GetBizCompanyRegisterGreenBoxDetailQuery {
    /** 绿盒id  example: undefined */
    id?: number
    /**   example: undefined */
    order_id?: number
}
export interface GetBizCompanyRegisterGreenBoxDetailResReceivingAddress {
    /**  0-国内 1-国外 */
    address_aboard: number
    /**   */
    area: Array<string>
    /**   */
    country: string
    /**   */
    details: string
    /**   */
    foreign: string
}
export interface GetBizCompanyRegisterGreenBoxDetailResReceiving {
    /**  收货人 */
    receiver: string
    /**  手机号 */
    mobile: string
    /**  地址 */
    address: GetBizCompanyRegisterGreenBoxDetailResReceivingAddress
    /**  顺丰单号 */
    tracking_number: string
    /**  1: 已提交 2: 未提交 */
    has_handle: number
}
export interface GetBizCompanyRegisterGreenBoxDetailResKyc_info {
    /**  文件url */
    file_url: string
    /**  状态 2000代签署 2001审核中 2002已完成 */
    status: number
    /**  kyc id */
    id: number
}
export interface GetBizCompanyRegisterGreenBoxDetailRes {
    /**   */
    receiving: GetBizCompanyRegisterGreenBoxDetailResReceiving
    /**   */
    kyc_info: GetBizCompanyRegisterGreenBoxDetailResKyc_info
}
export interface PostBizCompanyRegisterGreenBoxReceivingReqAddress {
    /**  1-国内 2-国外 */
    address_aboard: number
    /**   */
    area: Array<string>
    /**   */
    country: string
    /**   */
    details: string
    /**  外国填写 */
    foreign: string
}
export interface PostBizCompanyRegisterGreenBoxReceivingReq {
    /**  收货人 */
    receiver: string
    /**  手机号 */
    mobile: string
    /**  地址 */
    address: PostBizCompanyRegisterGreenBoxReceivingReqAddress
    /**  绿盒id */
    id: number
}
export interface PostBizCompanyRegisterGreenBoxReceivingRes {
}
export interface GetBizCompanyRegisterGreenBoxKycDetailQuery {
    /** kyc 对应id  example: undefined */
    id?: number
}
export interface GetBizCompanyRegisterGreenBoxKycDetailResSigned_documentItem {
    /**   */
    name: string
    /**   */
    url: string
}
export interface GetBizCompanyRegisterGreenBoxKycDetailRes {
    /**  文件url */
    file_url: string
    /**  状态 2000代签署 2001审核中 2002已完成 */
    status: string
    /**  签字文件 */
    signed_document: Array<GetBizCompanyRegisterGreenBoxKycDetailResSigned_documentItem>
}
export interface PostBizCompanyRegisterGreenBoxKycUploadReqSigned_documentItem {
    /**   */
    name: string
    /**   */
    url: string
}
export interface PostBizCompanyRegisterGreenBoxKycUploadReq {
    /**  kyc 对应id */
    id: number
    /**   */
    signed_document: Array<PostBizCompanyRegisterGreenBoxKycUploadReqSigned_documentItem>
}

export type PostBizCompanyRegisterGreenBoxKycUploadRes = any
export interface PostBizCompanyRegisterGreenBoxKycSignReq {
    /** kyc文书id  */
    id: number
    /**  1：h5  2：小程序 */
    scene: number
}
export interface PostBizCompanyRegisterGreenBoxKycSignRes {
    /**   */
    url: string
    /**   */
    psnId: string
    /**   */
    flowId: string
}
