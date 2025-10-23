/* eslint-disable prettier/prettier */
export interface GetBizMpfCertificateListQuery {
    /** 订单id  example: undefined */
    order_id?: number
    /** 项目id  example: undefined */
    business_order_project_id?: number
}

export type GetBizMpfCertificateListRes = GetBizMpfCertificateListResItem[]
export interface GetBizMpfCertificateListResItem {
    /**  证件名称 */
    name?: string
    /**  模板id */
    template_id?: number
    /**  状态, */
    status_text?: string
    /**  资料id */
    id: number
    /**  状态上传状态 ：-1，待开始； 默认0，待上传；1，已上传，待审核 ；2，审核通过 3，审核驳回 */
    status: number
}

export type GetBizMpfFundListRes = GetBizMpfFundListResItem[]
export interface GetBizMpfFundListResItem {
    /**  基金id */
    id: number
    /**  基金名称 */
    name: string
    /**  基金url */
    url: string
}
export interface GetBizMpfBankListQuery {
    /** 1 个户 2 公户  example: undefined */
    bank_type?: number
}

export type GetBizMpfBankListRes = GetBizMpfBankListResItem[]
export interface GetBizMpfBankListResItem {
    /**  银行id */
    id: number
    /**  银行名称 */
    name: string
    /**  银行代码 */
    code: string
}
export interface GetBizMpfFundHomeQuery {
    /** 订单id  example: undefined */
    order_id?: number
    /** 项目id  example: undefined */
    business_order_project_id?: number
}

export type GetBizMpfFundHomeRes = GetBizMpfFundHomeResItem[]
export interface GetBizMpfFundHomeResItem {
    /**  进度数字 */
    progress_num: number
    /**  订单绑定项目id */
    business_order_project_id: number
    /**  基金名称 */
    name: string
    /**  状态 */
    status_text: string
    /**  描述 */
    described: string
    /**  等待结果开启 */
    open: string
}
export interface GetBizMpfDeliveryOrderQuery {
    /** 合同号  example: TT25YKSW0000341 */
    order_sn?: string
}

export type GetBizMpfDeliveryOrderRes = GetBizMpfDeliveryOrderResItem[]
export interface GetBizMpfDeliveryOrderResItem {
    /**  名称 */
    name: string
    /**  状态1可跳转，0不可跳转 */
    status: string
    /**  59 香港公司强积金年服务，57香港个人开立个户，74香港公司开立公户，77香港公司注册 */
    product: number
    /**  订单id */
    order_id: number
    /**  项目id */
    business_order_project_id: number
    /**  服务年限 */
    service_years: string
    /**  0未知，1 一曲（身份类）2，二曲 3，其他 */
    product_line: number
}
export interface GetBizMpfFirstEnteredInfoQuery {
    /** 项目id example: undefined */
    business_order_project_id: number
}
export interface GetBizMpfFirstEnteredInfoRes {
    /**  0首次 ，1非首次 */
    first_entered: number
}
export interface GetBizMpfFirstEnteredUpdateQuery {
    /** 项目id example: undefined */
    business_order_project_id: number
}
export interface GetBizMpfFirstEnteredUpdateRes {
    /**  0首次 ，1非首次 */
    first_entered: number
}
export interface GetBizMpfProgressInfoQuery {
    /** 项目id example: undefined */
    business_order_project_id: number
}
export interface GetBizMpfProgressInfoRes {
    /**   */
    id: number
    /**  项目id */
    business_order_project_id: number
    /**  订单id */
    order_id: number
    /**  文件上传进度 */
    data_upload_progress: number
    /**  信息填写进度 */
    information_progress: number
    /**  账户开通进度 */
    account_activation_progress: number
    /**  供款缴纳进度 */
    contribution_payment_progress: number
    /**  前五个资料已上传template_id */
    certificate_upload_flag: number
    /**  雇主信息 100 已完成 */
    employer_progress: number
    /**  雇员信息100 已完成 */
    employee_progress: number
    /**  已完成的供款信息 */
    finish_contribution: number
    /**  提交状态：0 未提交；1：已提交 */
    submit_flag: number
    /**  等待结果进度 */
    wait_result_progress: number
}
export interface GetBizMpfTemplateInfoQuery {
    /**   example: undefined */
    template_id?: number
}
export interface GetBizMpfTemplateInfoResMulti_attachment_pathItem {
    /**  附件ur */
    url?: string
    /**  附件名称 */
    name?: string
}
export interface GetBizMpfTemplateInfoRes {
    /**  记录id */
    id: number
    /**  模板名称 */
    name: string
    /**  模板类型'资料类型 0是证件资料。1是文书资料' */
    template_type: number
    /**  模板描述 */
    description: string
    /**  模板附件 */
    multi_attachment_path: Array<GetBizMpfTemplateInfoResMulti_attachment_pathItem>
    /**  是否必须提供：0:必须提供, 1:如无可不提供 */
    upload_requirement: number
    /**  是否启用：1是0否 */
    status: number
}
export interface GetBizMpfEmployerInfoQuery {
    /** 订单id  example: 154725 */
    order_id?: number
    /** 项目id  example: 1274 */
    business_order_project_id?: number
}
export interface GetBizMpfEmployerInfoResBusiness_address {
}
export interface GetBizMpfEmployerInfoRes {
    /**  订单id */
    order_id: number
    /**  雇主名称 */
    name: string
    /**  强积金服务周期 */
    service_period: Array<string>
    /**  收件地址 */
    business_address: GetBizMpfEmployerInfoResBusiness_address
    /**  商业登记号码 */
    business_registration_number: string
    /**  业务性质 */
    business_type: string
    /**  员工数目 */
    number_of_employees: number
    /**  公司是否只属于香港唯一税务居住地？0 没有选择；1 是；2：否 */
    unique_tax_residence: number
    /**  公司纳税号码 */
    tax_number: string
    /**  公司联络人-中文名 */
    contact_name: string
    /**  公司联络人-英文名 */
    contact_en_name: string
    /**  公司联络人-职衔 */
    contact_duty: string
    /**  公司联络人-联系电话 */
    contact_phone: string
    /**  公司联络人-电子邮箱 */
    contact_email: string
    /**  香港银行账户-银行名称(选择其他需要维护) */
    hk_bank_name: string
    /**  香港银行账户-银行账户代码（选择其他需要维护） */
    hk_bank_code: string
    /**  香港银行账户-银行号码 */
    hk_bank_account: string
    /**  香港银行账户-账户持有人联络电话 */
    hk_bank_account_mobile: string
    /**  项目id */
    business_order_project_id: number
    /**  服务截止日期 */
    cutoff_time: string
    /**  香港银行账户- 公司邮箱 */
    hk_bank_email: string
}
export interface PostBizMpfEmployerAddReqBusiness_address {
    /**   */
    area: Array<string>
    /**  国家 */
    country: string
    /**  详情地址 */
    details: string
    /**  国外地址 */
    foreign: string
}
export interface PostBizMpfEmployerAddReq {
    /**  雇主名称 */
    name: string
    /**  强积金服务周期 */
    service_period: string
    /**  业务性质 */
    business_type: string
    /**  收件地址,如未选择，传{"area":[],"country":null,"details":null,"foreign":null,"address_aboard": null} */
    business_address: PostBizMpfEmployerAddReqBusiness_address
    /**  商业登记号码 */
    business_registration_number: string
    /**  员工数目 */
    number_of_employees: number
    /**  公司是否只属于香港唯一税务居住地？0 没有选择；1 否；2：是 */
    unique_tax_residence: number
    /**  公司纳税号码 */
    tax_number: string
    /**  公司联络人-中文名 */
    contact_name: string
    /**  公司联络人-英文名 */
    contact_en_name: string
    /**  公司联络人-职衔 */
    contact_duty: string
    /**  公司联络人-联系电话 */
    contact_phone: string
    /**  公司联络人-电子邮箱 */
    contact_email: string
    /**  香港银行账户-银行名称(选择其他需要维护) */
    hk_bank_name: string
    /**  香港银行账户-银行账户代码（选择其他需要维护） */
    hk_bank_code: string
    /**  香港银行账户-银行号码 */
    hk_bank_account: string
    /**  香港银行账户-账户持有人联络电话 */
    hk_bank_account_mobile: string
    /**  订单id */
    order_id: number
    /**  国籍 0中国，1外国 */
    address_aboard: number
    /**  0,1 提交保存 */
    submit: number
    /**  香港银行记录id */
    hk_bank_id: number
    /**  项目id */
    business_order_project_id: number
    /**  香港银行账户-公司邮箱 */
    hk_bank_email: string
}
export interface PostBizMpfEmployerAddResBusiness_address {
    /**   */
    area: Array<string>
    /**   */
    country: string
    /**   */
    details: string
    /**   */
    foreign: string
}
export interface PostBizMpfEmployerAddRes {
    /**   */
    id: number
    /**   */
    business_order_project_id: number
    /**   */
    order_id: number
    /**   */
    name: string
    /**   */
    service_period: string
    /**   */
    business_address: PostBizMpfEmployerAddResBusiness_address
    /**   */
    business_registration_number: string
    /**   */
    business_type: string
    /**   */
    number_of_employees: number
    /**   */
    tax_number: string
    /**   */
    contact_name: string
    /**   */
    contact_en_name: string
    /**   */
    contact_duty: string
    /**   */
    contact_phone: string
    /**   */
    contact_email: string
    /**   */
    hk_bank_name: string
    /**   */
    hk_bank_code: string
    /**   */
    hk_bank_account: string
    /**   */
    hk_bank_account_mobile: string
    /**   */
    unique_tax_residence: number
    /**   */
    hk_bank_email: string
}
export interface PostBizMpfEmployAddReqAddress {
    /**  省、市 / 市、区 */
    area: Array<string>
    /**  国家 */
    country: string
    /**  详细地址 */
    details: string
    /**  国外地址 */
    foreign: string
    /**   默认值 ""   国籍 0中国，1外国 */
    address_aboard: number
}
export interface PostBizMpfEmployAddReq {
    /**  雇员名称 */
    name: string
    /**  订单id */
    order_id: number
    /**  雇员英文名 */
    en_name: string
    /**  出生日期 */
    birthday: string
    /**  性别 0 未知 1 男；2 女 */
    sex: number
    /**  香港身份证号码 */
    hk_idcard: string
    /**  受雇日期 */
    employment_date: string
    /**  现时居住国家/地址{"area":[],"country":null,"details":null,"foreign":null,"address_aboard": null} */
    address: PostBizMpfEmployAddReqAddress
    /**  邮寄代码 */
    postcode: string
    /**  联系电话 */
    mobile: string
    /**  电子邮箱 */
    email: string
    /**  雇员是否只属于香港税务居民 0 未选择；1：是；2否 */
    is_tax_resident: number
    /**  中国身份证号码 */
    idcard: string
    /**  基金选择 对应的基金 */
    fund_id: number
    /**  雇员每月供款工资 */
    salary: string
    /**  0保存 1提交 */
    sumbit: number
    /**  项目id */
    business_order_project_id: number
}

export type PostBizMpfEmployAddRes = PostBizMpfEmployAddResItem[]

export type PostBizMpfEmployAddResItem = string
export interface PostBizMpfEmploySalaryAddReq {
    /**  订单id */
    order_id: number
    /**  雇员每月供款工资 */
    salary: number
    /**  项目id */
    business_order_project_id: number
}

export type PostBizMpfEmploySalaryAddRes = PostBizMpfEmploySalaryAddResItem[]

export type PostBizMpfEmploySalaryAddResItem = string
export interface GetBizMpfEmployInfoQuery {
    /** 订单id  example: 154725 */
    order_id?: string
    /**   example: 1274 */
    business_order_project_id?: string
}
export interface GetBizMpfEmployInfoResFund_dataItem {
    /**  基金id */
    fund_id?: number
    /**  占比 */
    proportion_num?: number
}
export interface GetBizMpfEmployInfoResAddress {
    /**   */
    area: Array<string>
    /**   */
    country: null
    /**   */
    details: string
    /**   */
    foreign: null
    /**   */
    address_aboard: number
}
export interface GetBizMpfEmployInfoResFund_listItem {
    /**  基金id */
    id: number
    /**  基金名称 */
    name: string
    /**  基金附件url */
    url: string
}
export interface GetBizMpfEmployInfoRes {
    /**  记录id */
    id: number
    /**  项目id */
    business_order_project_id: number
    /**  订单id */
    order_id: number
    /**  雇员名称 */
    name: string
    /**  联系电话 */
    mobile: string
    /**  雇员英文名 */
    en_name: string
    /**  电子邮箱 */
    email: string
    /**  出生日期 */
    birthday: string
    /**  雇员是否只属于香港税务居民 0 未选择；1：是；2否 */
    is_tax_resident: number
    /**  性别 0 未知 1 男；2 女 */
    sex: number
    /**  中国身份证号码 */
    idcard: string
    /**  香港身份证号码 */
    hk_idcard: string
    /**  受雇日期 */
    employment_date: string
    /**  已选基金 */
    fund_data: Array<GetBizMpfEmployInfoResFund_dataItem>
    /**   */
    address: GetBizMpfEmployInfoResAddress
    /**  雇员每月供款工资 */
    salary: number
    /**  邮寄代码 */
    postcode: string
    /**   */
    address_aboard: number
    /**  基金列表 */
    fund_list: Array<GetBizMpfEmployInfoResFund_listItem>
    /**  1提交， 0保存 */
    submit: number
    /**  详细地址 */
    current_residence: string
}
export interface PostBizMpfCertificateUploadReqFilesItem {
    /**  文件名称 */
    name: string
    /**  文件链接 */
    url: string
    /**  文件唯一标识 */
    uid: number
    /**  上传时间2025-01-03 10:10:10 */
    upload_at: string
    /**  默认front:正面，  backend:背面  handheld:手持 */
    sign: string
    /**  image/jpeg */
    type?: string
    /**  success */
    status?: string
}
export interface PostBizMpfCertificateUploadReq {
    /**  文件数组对象 */
    files: Array<PostBizMpfCertificateUploadReqFilesItem>
    /**  资料id */
    id: number
    /**   新增 add ，删除 del，重命名rename */
    operation: string
}

export type PostBizMpfCertificateUploadRes = PostBizMpfCertificateUploadResItem[]

export type PostBizMpfCertificateUploadResItem = string
export interface GetBizMpfCertificateInfoQuery {
    /** 资料id  example: undefined */
    id?: number
}
export interface GetBizMpfCertificateInfoResFilesItem {
    /**  文件名称 */
    name?: string
    /**  文件链接 */
    url?: string
    /**  上传时间 */
    upload_at?: string
    /**  文件id */
    uid: number
}
export interface GetBizMpfCertificateInfoResTemplateItem {
    /**  模板名称 */
    name: string
    /**  模板url */
    url: string
}
export interface GetBizMpfCertificateInfoRes {
    /**  资料文件 */
    files: Array<GetBizMpfCertificateInfoResFilesItem>
    /**  证件名称 */
    name: string
    /**  审核原因 */
    audit_desc: string
    /**  模板 */
    template: Array<GetBizMpfCertificateInfoResTemplateItem>
    /**  0，待上传；1，已上传，待审核 ；2，审核通过 3，审核驳回 */
    status: number
    /**  模板说明 */
    template_description: string
}
export interface GetBizMpfWaitResultTaskQuery {
    /** 订单id example:  */
    order_id: number
    /** 商务id  example:  */
    business_order_project_id?: number
}

export type GetBizMpfWaitResultTaskRes = GetBizMpfWaitResultTaskResItem[]
export interface GetBizMpfWaitResultTaskResItemExtendIs_need_to_handle {
    /**   */
    '@type': string
    /**   */
    value: string
}
export interface GetBizMpfWaitResultTaskResItemExtendRecipient_address {
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
export interface GetBizMpfWaitResultTaskResItemExtendRecipient_confirm_flag {
    /**   */
    '@type': string
    /**   */
    value: string
}
export interface GetBizMpfWaitResultTaskResItemExtendRecipient_mobile {
    /**   */
    '@type': string
    /**   */
    value: string
}
export interface GetBizMpfWaitResultTaskResItemExtendRecipient_name {
    /**   */
    '@type': string
    /**   */
    value: string
}
export interface GetBizMpfWaitResultTaskResItemExtendTracking_number_to_customer {
    /**   */
    '@type': string
    /**   */
    value: string
}
export interface GetBizMpfWaitResultTaskResItemExtendSign_filesItemsItem {
    /**   */
    name: string
    /**   */
    url: string
}
export interface GetBizMpfWaitResultTaskResItemExtendSign_files {
    /**   */
    '@type': string
    /**   */
    items: Array<GetBizMpfWaitResultTaskResItemExtendSign_filesItemsItem>
}
export interface GetBizMpfWaitResultTaskResItemExtendFile_item {
    /**   */
    '@type': string
    /**   */
    status: number
    /**   */
    msg: string
    /**   */
    file_id: number
    /**   */
    file_name: string
}
export interface GetBizMpfWaitResultTaskResItemExtendYh_recipient_address {
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
export interface GetBizMpfWaitResultTaskResItemExtendYh_recipient_mobile {
    /**   */
    '@type': string
    /**   */
    value: string
}
export interface GetBizMpfWaitResultTaskResItemExtendYh_recipient_name {
    /**   */
    '@type': string
    /**   */
    value: string
}
export interface GetBizMpfWaitResultTaskResItemExtendTracking_number_to_yh {
    /**   */
    '@type': string
    /**   */
    value: string
}
export interface GetBizMpfWaitResultTaskResItemExtend {
    /**   */
    is_need_to_handle?: GetBizMpfWaitResultTaskResItemExtendIs_need_to_handle
    /**   */
    recipient_address?: GetBizMpfWaitResultTaskResItemExtendRecipient_address
    /**   */
    recipient_confirm_flag?: GetBizMpfWaitResultTaskResItemExtendRecipient_confirm_flag
    /**   */
    recipient_mobile?: GetBizMpfWaitResultTaskResItemExtendRecipient_mobile
    /**   */
    recipient_name?: GetBizMpfWaitResultTaskResItemExtendRecipient_name
    /**   */
    tracking_number_to_customer?: GetBizMpfWaitResultTaskResItemExtendTracking_number_to_customer
    /**   */
    sign_files?: GetBizMpfWaitResultTaskResItemExtendSign_files
    /**   */
    file_item?: GetBizMpfWaitResultTaskResItemExtendFile_item
    /**   */
    yh_recipient_address?: GetBizMpfWaitResultTaskResItemExtendYh_recipient_address
    /**   */
    yh_recipient_mobile?: GetBizMpfWaitResultTaskResItemExtendYh_recipient_mobile
    /**   */
    yh_recipient_name?: GetBizMpfWaitResultTaskResItemExtendYh_recipient_name
    /**   */
    tracking_number_to_yh: GetBizMpfWaitResultTaskResItemExtendTracking_number_to_yh
}
export interface GetBizMpfWaitResultTaskResItem {
    /**   */
    task_key: string
    /**   */
    task_name: string
    /**   */
    tips: string
    /**   */
    status: number
    /**   */
    extend: GetBizMpfWaitResultTaskResItemExtend
}
export interface GetBizMpfMpfAccountInfoQuery {
    /**   example: 154925 */
    order_id?: number
    /**   example: 1291 */
    business_order_project_id?: number
}
export interface GetBizMpfMpfAccountInfoRes {
    /**   */
    account: string
    /**   */
    password: string
}
export interface GetBizMpfContributionRecordQuery {
    /** 项目id  example: 1291 */
    business_order_project_id?: number
    /** 订单ID  example: 154925 */
    order_id?: number
    /** -1->查询所有，0->查询待缴， 1->查询已缴  example: -1 */
    status?: number
    /** 可以为空，代表不传开始时间  example: 2024-12 */
    start_time?: string
    /** 可以为空，代表不传开介绍时间  example: 2025-01 */
    end_time?: string
    /** 页数  example: 1 */
    page?: number
    /** 每页大小  example: 10 */
    page_size?: number
}
export interface GetBizMpfContributionRecordResListItemEmployeeItem {
    /**   */
    employee_name?: string
    /**   */
    hk_dollar?: string
}
export interface GetBizMpfContributionRecordResListItem {
    /**   */
    business_order_project_id?: number
    /**   */
    order_id?: number
    /**   */
    number_of_periods?: number
    /**   */
    contribution_date?: string
    /**   */
    hk_dollar?: string
    /**   */
    status?: number
    /**   */
    employee?: Array<GetBizMpfContributionRecordResListItemEmployeeItem>
}
export interface GetBizMpfContributionRecordRes {
    /**   */
    total: number
    /**   */
    list: Array<GetBizMpfContributionRecordResListItem>
}
export interface PostBizMpfContributionDownloadEmailReq {
    /**   */
    business_order_project_id: number
    /**   */
    order_id: number
    /**   */
    start_time: string
    /**   */
    end_time: string
    /**   */
    email: string
}
export interface PostBizMpfContributionDownloadEmailRes {
}
export interface PostBizMpfContributionCanDownloadEmailReq {
}
export interface PostBizMpfContributionCanDownloadEmailRes {
    /**   */
    can_download: number
}
export interface PostBizMpfExpressAddressSaveReqRecipient_address {
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
export interface PostBizMpfExpressAddressSaveReq {
    /**   */
    business_order_project_id: number
    /**   */
    order_id: number
    /**   */
    recipient_name: string
    /**   */
    recipient_address: PostBizMpfExpressAddressSaveReqRecipient_address
    /**   */
    recipient_mobile: string
}
export interface PostBizMpfExpressAddressSaveRes {
}
export interface GetBizMpfContributionRecordDetailQuery {
    /**   example: 1 */
    record_id?: number
    /**   example: 1291 */
    business_order_project_id?: number
}
export interface GetBizMpfContributionRecordDetailResEmployeeItem {
    /**   */
    employee_name?: string
    /**   */
    hk_dollar?: string
}
export interface GetBizMpfContributionRecordDetailResFilesItem {
    /**   */
    url?: string
    /**   */
    name?: string
}
export interface GetBizMpfContributionRecordDetailRes {
    /**   */
    record_id: number
    /**   */
    business_order_project_id: number
    /**   */
    company_hk_dollar: string
    /**   */
    employee: Array<GetBizMpfContributionRecordDetailResEmployeeItem>
    /**   */
    files: Array<GetBizMpfContributionRecordDetailResFilesItem>
}
