/* eslint-disable prettier/prettier */
export interface GetBizAuditTaxGetCurrentNumQuery {
    /**  example: 156798 */
    order_id: number
    /**  example: 2335 */
    business_order_project_id: number
}
export interface GetBizAuditTaxGetCurrentNumRes {
    /**   */
    current_num: number
    /**   */
    total_num: number
    /**   */
    num_list: Array<number>
}
export interface GetBizAuditTaxGetMainProcessQuery {
    /**  example: 156798 */
    order_id: number
    /**  example: 2335 */
    business_order_project_id: number
    /**  example: 1 */
    current_num: number
    /** 周期ID  example:  */
    period_id?: number
}

export type GetBizAuditTaxGetMainProcessRes = GetBizAuditTaxGetMainProcessResItem[]
export interface GetBizAuditTaxGetMainProcessResItem {
    /**   */
    id: string
    /**   */
    name: string
    /**   */
    percentage: number
    /**   */
    status: number
    /**   */
    open: number
    /**   */
    description: string
}
export interface GetBizAuditTaxGetBaseInfoQuery {
    /**  example: 156798 */
    order_id: number
    /**  example: 2335 */
    business_order_project_id: number
    /**  example: 1 */
    current_num: number
    /** 周期ID  example:  */
    period_id?: number
}
export interface GetBizAuditTaxGetBaseInfoRes {
    /**   */
    audit_num: number
    /**   */
    audit_start_date: string
    /**   */
    audit_end_date: string
    /**  是否有经营性收入 1：是, 2：否 */
    is_has_sales: number
    /**  是否kai担任代理秘书 1：是, 2：否 */
    is_yinhe_proxy: number
    /**  评估你近一年的营业额，下拉枚举值 */
    evaluate_turnover_sales: number
    /**   */
    evaluate_turnover_profit: number
    /**   */
    company_name: string
    /**  审计周期可选的结束时间 */
    select_audit_date: Array<string>
    /**  提交按钮状态：0 未提交（可展示）；1：已提交（不展示）(提交后C端不可修改) */
    submit_status?: number
}
export interface PostBizAuditTaxSaveReportExpressAddressReqRecipient_address {
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
export interface PostBizAuditTaxSaveReportExpressAddressReq {
    /**   */
    business_order_project_id: number
    /**   */
    order_id: number
    /**   */
    current_num: number
    /**   */
    recipient_name: string
    /**   */
    recipient_address: PostBizAuditTaxSaveReportExpressAddressReqRecipient_address
    /**   */
    recipient_mobile: string
    /**  周期ID */
    period_id: number
}
export interface PostBizAuditTaxSaveReportExpressAddressRes {
}
export interface GetBizAuditTaxGetCertificatesListQuery {
    /**  example: 156798 */
    order_id: number
    /**  example: 2335 */
    business_order_project_id: number
    /**  example: 1 */
    current_num: number
    /** 周期ID  example: 123456 */
    period_id?: number
}

export type GetBizAuditTaxGetCertificatesListRes = GetBizAuditTaxGetCertificatesListResItem[]
export interface GetBizAuditTaxGetCertificatesListResItemTemplate_filesItem {
    /**   */
    uid?: string
    /**   */
    name?: string
    /**   */
    url?: string
    /**   */
    upload_at?: string
    /**   */
    sign?: string
    /**   */
    size?: number
    /**   */
    type?: string
    /**   */
    status?: string
}
export interface GetBizAuditTaxGetCertificatesListResItem {
    /**   */
    template_id?: number
    /**   */
    certificates_id?: number
    /**   */
    name?: string
    /**   */
    status?: number
    /**   */
    template_files?: Array<GetBizAuditTaxGetCertificatesListResItemTemplate_filesItem>
    /**   */
    description?: string
    /**   */
    upload_requirement?: number
    /**   */
    files?: Array<string>
}
export interface GetBizAuditTaxGetCertificatesDetailQuery {
    /**  example: 156798 */
    order_id: number
    /**  example: 2335 */
    business_order_project_id: number
    /** 从证书列表中获取 example: 3704 */
    certificates_id: number
}
export interface GetBizAuditTaxGetCertificatesDetailResTemplate_filesItem {
    /**   */
    uid?: string
    /**   */
    name?: string
    /**   */
    url?: string
    /**   */
    upload_at?: string
    /**   */
    sign?: string
    /**   */
    size?: number
    /**   */
    type?: string
    /**   */
    status?: string
}
export interface GetBizAuditTaxGetCertificatesDetailResFilesItem {
    /**   */
    uid?: string
    /**   */
    name?: string
    /**   */
    url?: string
    /**   */
    upload_at?: string
    /**   */
    sign?: string
    /**   */
    size?: number
    /**   */
    type?: string
    /**   */
    status?: string
}
export interface GetBizAuditTaxGetCertificatesDetailRes {
    /**   */
    template_id: number
    /**   */
    certificates_id: number
    /**   */
    name: string
    /**   */
    status: number
    /**   */
    template_files: Array<GetBizAuditTaxGetCertificatesDetailResTemplate_filesItem>
    /**   */
    description: string
    /**   */
    upload_requirement: number
    /**   */
    files: Array<GetBizAuditTaxGetCertificatesDetailResFilesItem>
    /**   */
    audit_desc: string
}
export interface PostBizAuditTaxDelCertificatesFileQuery {
    /**  example: 3704 */
    certificates_id: number
    /**  example: 2041 */
    business_order_project_id: number
    /**  example: 625485219022089 */
    uid: number
}

export type PostBizAuditTaxDelCertificatesFileReq = any
export interface PostBizAuditTaxDelCertificatesFileRes {
}
export interface PostBizAuditTaxSaveBaseInfoReq {
    /**   */
    order_id: number
    /**   */
    business_order_project_id: number
    /**   */
    current_num: number
    /**   */
    audit_start_date: string
    /**   */
    audit_end_date: string
    /**  是否有经营性收入 1：是, 2：否 */
    is_has_sales: number
    /**  是否kai担任代理秘书 1：是, 2：否 */
    is_yinhe_proxy: number
    /**  评估你近一年的营业额，下拉枚举值 */
    evaluate_turnover_sales: number
    /**   */
    company_name: string
    /**  周期ID */
    period_id: number
}
export interface PostBizAuditTaxSaveBaseInfoRes {
}
export interface PostBizAuditTaxUpdateCertificatesFileNameReq {
    /**   */
    certificates_id: number
    /**   */
    business_order_project_id: number
    /**   */
    uid: number
    /**   */
    file_name: string
}
export interface PostBizAuditTaxUpdateCertificatesFileNameRes {
}
export interface GetBizAuditTaxWaitResultTaskProcessQuery {
    /**  example: 156798 */
    order_id: number
    /**  example: 2335 */
    business_order_project_id: number
    /**  example: 1 */
    current_num: number
    /** 周期ID example:  */
    period_id: number
}
export interface GetBizAuditTaxWaitResultTaskProcessResProcess_listItemExtendConfirm_status {
    /**   */
    '@type': string
    /**   */
    value: number
}
export interface GetBizAuditTaxWaitResultTaskProcessResProcess_listItemExtendConfirm_status_tips {
    /**   */
    '@type': string
    /**   */
    value: string
}
export interface GetBizAuditTaxWaitResultTaskProcessResProcess_listItemExtendIs_need_to_handle {
    /**   */
    '@type': string
    /**   */
    value: number
}
export interface GetBizAuditTaxWaitResultTaskProcessResProcess_listItemExtendRecipient_address {
    /**   */
    '@type': string
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
export interface GetBizAuditTaxWaitResultTaskProcessResProcess_listItemExtendRecipient_mobile {
    /**   */
    '@type': string
    /**   */
    value: string
}
export interface GetBizAuditTaxWaitResultTaskProcessResProcess_listItemExtendRecipient_name {
    /**   */
    '@type': string
    /**   */
    value: string
}
export interface GetBizAuditTaxWaitResultTaskProcessResProcess_listItemExtendReportFilesItem {
    /**   */
    uid: string
    /**   */
    name: string
    /**   */
    url: string
    /**   */
    upload_at: string
    /**   */
    sign: string
    /**   */
    size: number
    /**   */
    type: string
    /**   */
    status: string
}
export interface GetBizAuditTaxWaitResultTaskProcessResProcess_listItemExtendReport {
    /**   */
    '@type': string
    /**   */
    files: Array<GetBizAuditTaxWaitResultTaskProcessResProcess_listItemExtendReportFilesItem>
}
export interface GetBizAuditTaxWaitResultTaskProcessResProcess_listItemExtendTracking_number {
    /**   */
    '@type': string
    /**   */
    value: string
}
export interface GetBizAuditTaxWaitResultTaskProcessResProcess_listItemExtendCertificates_id {
    /**   */
    '@type': string
    /**   */
    value: number
}
export interface GetBizAuditTaxWaitResultTaskProcessResProcess_listItemExtendJump_status {
    /**   */
    '@type': string
    /**   */
    value: number
}
export interface GetBizAuditTaxWaitResultTaskProcessResProcess_listItemExtend {
    /**   */
    confirm_status?: GetBizAuditTaxWaitResultTaskProcessResProcess_listItemExtendConfirm_status
    /**   */
    confirm_status_tips?: GetBizAuditTaxWaitResultTaskProcessResProcess_listItemExtendConfirm_status_tips
    /**   */
    is_need_to_handle?: GetBizAuditTaxWaitResultTaskProcessResProcess_listItemExtendIs_need_to_handle
    /**   */
    recipient_address: GetBizAuditTaxWaitResultTaskProcessResProcess_listItemExtendRecipient_address
    /**   */
    recipient_mobile?: GetBizAuditTaxWaitResultTaskProcessResProcess_listItemExtendRecipient_mobile
    /**   */
    recipient_name: GetBizAuditTaxWaitResultTaskProcessResProcess_listItemExtendRecipient_name
    /**   */
    report?: GetBizAuditTaxWaitResultTaskProcessResProcess_listItemExtendReport
    /**   */
    tracking_number?: GetBizAuditTaxWaitResultTaskProcessResProcess_listItemExtendTracking_number
    /**   */
    certificates_id?: GetBizAuditTaxWaitResultTaskProcessResProcess_listItemExtendCertificates_id
    /**   */
    jump_status?: GetBizAuditTaxWaitResultTaskProcessResProcess_listItemExtendJump_status
}
export interface GetBizAuditTaxWaitResultTaskProcessResProcess_listItem {
    /**   */
    task_key: string
    /**   */
    task_name: string
    /**   */
    tips: string
    /**   */
    status: number
    /**   */
    extend: GetBizAuditTaxWaitResultTaskProcessResProcess_listItemExtend
}
export interface GetBizAuditTaxWaitResultTaskProcessRes {
    /**   */
    has_result: number
    /**   */
    process_list: Array<GetBizAuditTaxWaitResultTaskProcessResProcess_listItem>
}
export interface PostBizAuditTaxSaveCustomerAddressReqRecipient_address {
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
export interface PostBizAuditTaxSaveCustomerAddressReq {
    /**   */
    business_order_project_id: number
    /**   */
    order_id: number
    /**   */
    current_num: number
    /**   */
    recipient_name: string
    /**   */
    recipient_address: PostBizAuditTaxSaveCustomerAddressReqRecipient_address
    /**   */
    recipient_mobile: string
    /**  周期ID */
    period_id: number
}
export interface PostBizAuditTaxSaveCustomerAddressResRecipient_address {
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
export interface PostBizAuditTaxSaveCustomerAddressRes {
    /**   */
    business_order_project_id: number
    /**   */
    order_id: number
    /**   */
    current_num: number
    /**   */
    recipient_name: string
    /**   */
    recipient_address: PostBizAuditTaxSaveCustomerAddressResRecipient_address
    /**   */
    recipient_mobile: string
}
export interface GetBizAuditTaxGetExtendFileListQuery {
    /**  example: 156798 */
    order_id: number
    /**  example: 2335 */
    business_order_project_id: number
    /**  example: 1 */
    current_num: number
    /** 周期ID example:  */
    period_id: number
}
export interface GetBizAuditTaxGetExtendFileListResExtend_listItemFilesItem {
    /**   */
    uid: string
    /**   */
    name: string
    /**   */
    url: string
    /**   */
    upload_at: string
    /**   */
    sign: string
    /**   */
    size: number
    /**   */
    type: string
    /**   */
    status: string
}
export interface GetBizAuditTaxGetExtendFileListResExtend_listItem {
    /**   */
    certificates_id: number
    /**   */
    certificate_name: string
    /**   */
    status: number
    /**   */
    status_text: string
    /**   */
    description: string
    /**   */
    require_description: number
    /**   */
    require_upload_requirement: number
    /**   */
    files: Array<GetBizAuditTaxGetExtendFileListResExtend_listItemFilesItem>
    /**   */
    submit_flag: number
    /**   */
    remark: string
}
export interface GetBizAuditTaxGetExtendFileListRes {
    /**   */
    audit_start_date: string
    /**   */
    audit_end_date: string
    /**   */
    submit_flag: number
    /**   */
    extend_list: Array<GetBizAuditTaxGetExtendFileListResExtend_listItem>
}
export interface PostBizAuditTaxSaveExtendFileReqFilesItem {
    /**   */
    uid: string
    /**   */
    name: string
    /**   */
    url: string
    /**   */
    upload_at: string
    /**   */
    sign: string
    /**   */
    size: number
    /**   */
    type: string
    /**   */
    status: string
}
export interface PostBizAuditTaxSaveExtendFileReq {
    /**   */
    order_id: number
    /**   */
    business_order_project_id: number
    /**   */
    current_num: number
    /**   */
    certificates_id: number
    /**   */
    certificate_name: string
    /**   */
    description: string
    /**   */
    require_description: number
    /**   */
    require_upload_requirement: number
    /**   */
    files: Array<PostBizAuditTaxSaveExtendFileReqFilesItem>
    /**  周期ID */
    period_id: number
}
export interface PostBizAuditTaxSaveExtendFileRes {
}
export interface GetBizAuditTaxGetResultQuery {
    /**   example: 156798 */
    order_id?: number
    /**  example: 2335 */
    business_order_project_id: number
    /**  example: 1 */
    current_num: number
    /** 周期ID example:  */
    period_id: number
}
export interface GetBizAuditTaxGetResultResCustomer_infoRecipient_address {
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
export interface GetBizAuditTaxGetResultResCustomer_info {
    /**   */
    recipient_name: string
    /**   */
    recipient_mobile: string
    /**   */
    tracking_number: string
    /**   */
    recipient_address: GetBizAuditTaxGetResultResCustomer_infoRecipient_address
}
export interface GetBizAuditTaxGetResultResReport_file_listItemFilesItem {
    /**   */
    uid: string
    /**   */
    name: string
    /**   */
    url: string
    /**   */
    upload_at: string
    /**   */
    sign: string
    /**   */
    size: number
    /**   */
    type: string
    /**   */
    status: string
}
export interface GetBizAuditTaxGetResultResReport_file_listItem {
    /**   */
    report_name: string
    /**   */
    files: Array<GetBizAuditTaxGetResultResReport_file_listItemFilesItem>
}
export interface GetBizAuditTaxGetResultRes {
    /**   */
    customer_info: GetBizAuditTaxGetResultResCustomer_info
    /**   */
    report_file_list: Array<GetBizAuditTaxGetResultResReport_file_listItem>
    /**  0->不能下一个周期 ,1->可以进入下一个周期 */
    can_next: number
}
export interface PostBizAuditTaxDownloadReportFileReq {
    /**   */
    business_order_project_id: number
    /**   */
    order_id: number
    /**   */
    current_num: number
    /**   */
    receive_email: string
    /**  1->是确认信息里面的下载， 2->审计结果的下载 */
    from_type: number
    /**  周期ID */
    period_id: number
}
export interface PostBizAuditTaxDownloadReportFileRes {
}
export interface GetBizAuditTaxGetAddressDetailQuery {
    /**  example: 156798 */
    order_id: number
    /**  example: 2335 */
    business_order_project_id: number
    /**  example: 1 */
    current_num: number
    /** 1->是从小流程页面获取， 2->从审核结果页面进来获取 example: 1 */
    from_page: number
    /** 周期ID  example:  */
    period_id?: number
}
export interface GetBizAuditTaxGetAddressDetailResRecipient_address {
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
export interface GetBizAuditTaxGetAddressDetailRes {
    /**   */
    recipient_name: string
    /**   */
    recipient_address: GetBizAuditTaxGetAddressDetailResRecipient_address
    /**   */
    recipient_mobile: string
}
export interface PostBizAuditTaxSaveCertificatesReqFilesItem {
    /**   */
    uid: string
    /**   */
    name: string
    /**   */
    url: string
    /**   */
    upload_at: string
    /**   */
    sign: string
    /**   */
    size: number
    /**   */
    type: string
    /**   */
    status?: string
}
export interface PostBizAuditTaxSaveCertificatesReq {
    /**   */
    order_id: number
    /**   */
    business_order_project_id: number
    /**   */
    current_num: number
    /**   */
    certificates_id: number
    /**   */
    files: Array<PostBizAuditTaxSaveCertificatesReqFilesItem>
    /**  周期ID */
    period_id: number
}
export interface PostBizAuditTaxSaveCertificatesRes {
}
export interface PostBizAuditTaxRollbackProcessTaskReq {
    /**   */
    order_id: number
    /**   */
    business_order_project_id: number
    /**   */
    current_num: number
    /**  周期ID */
    period_id: number
}
export interface PostBizAuditTaxRollbackProcessTaskRes {
}
export interface GetBizAuditTaxGetExtendFileDetailQuery {
    /**  example: 1 */
    certificates_id: number
    /**  example: 156798 */
    order_id: number
    /**  example: 2335 */
    business_order_project_id: number
    /**  example: 1 */
    current_num: number
    /** 周期ID example:  */
    period_id: number
}
export interface GetBizAuditTaxGetExtendFileDetailResFilesItem {
    /**   */
    uid: string
    /**   */
    name: string
    /**   */
    url: string
    /**   */
    upload_at: string
    /**   */
    sign: string
    /**   */
    size: number
    /**   */
    type: string
    /**   */
    status: string
}
export interface GetBizAuditTaxGetExtendFileDetailRes {
    /**   */
    certificates_id: number
    /**   */
    certificate_name: string
    /**   */
    status: number
    /**   */
    status_text: string
    /**   */
    description: string
    /**   */
    require_description: number
    /**   */
    require_upload_requirement: number
    /**   */
    files: Array<GetBizAuditTaxGetExtendFileDetailResFilesItem>
    /**   */
    submit_flag: number
}
export interface PostBizAuditTaxDelExtendFileReq {
    /**   */
    certificates_id: number
    /**   */
    business_order_project_id: number
    /**   */
    order_id: number
    /**   */
    current_num: number
    /**  周期ID */
    period_id: number
}
export interface PostBizAuditTaxDelExtendFileRes {
}
export interface PostBizAuditTaxSubmitExtendFileReq {
    /**   */
    business_order_project_id: number
    /**   */
    order_id: number
    /**   */
    current_num: number
    /**  周期ID */
    period_id: number
}
export interface PostBizAuditTaxSubmitExtendFileRes {
}
export interface PostBizAuditTaxCustomerConfirmInfoReq {
    /**   */
    business_order_project_id: number
    /**   */
    order_id: number
    /**   */
    current_num: number
    /**  周期ID */
    period_id: number
}
export interface PostBizAuditTaxCustomerConfirmInfoRes {
}
export interface GetBizAuditTaxCanNextHandleQuery {
    /**  example: 157401 */
    order_id: number
    /**  example: 2598 */
    business_order_project_id: number
    /**  example: 1 */
    current_num: number
    /** 周期ID example:  */
    period_id: number
}
export interface GetBizAuditTaxCanNextHandleRes {
    /**  0->不能下一步， 1->可以下一步 */
    can_next: number
}
