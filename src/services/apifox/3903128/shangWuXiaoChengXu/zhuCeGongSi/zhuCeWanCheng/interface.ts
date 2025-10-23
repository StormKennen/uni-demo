/* eslint-disable prettier/prettier */
export interface GetBizCompanyRegisterFinishQuery {
    /** 订单id  example: undefined */
    order_id?: number
}
export interface GetBizCompanyRegisterFinishResRegister_filesItem {
    /**  文件类型 1.注册证书CI 2.商业登记证BR 3.法团成立表格NNC1和公司章程A&A 4.收据 10.其他文件 */
    type?: number
    /**  名称 */
    name?: string
    /**  url */
    url?: string
}
export interface GetBizCompanyRegisterFinishResRegister_info {
    /**  繁体 */
    traditional_chinese: string
    /**  英语 */
    english: string
    /**  商业登记号 */
    business_register_number: string
    /**  注册完成时间 */
    register_finish_date: string
}
export interface GetBizCompanyRegisterFinishRes {
    /**  注册文件 */
    register_files: Array<GetBizCompanyRegisterFinishResRegister_filesItem>
    /**  注册信息 */
    register_info: GetBizCompanyRegisterFinishResRegister_info
}
