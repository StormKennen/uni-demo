/* eslint-disable prettier/prettier */
export interface GetBizPersonOpenAccountListQuery {
    /**   example: 154701 */
    order_id?: number
    /** 节点状态：1:待开始 2:进行中 3:已完成  example: 1 */
    status?: number
    /**   example: 1270 */
    business_order_project_id?: number
}

export type GetBizPersonOpenAccountListRes = GetBizPersonOpenAccountListResItem[]
export interface GetBizPersonOpenAccountListResItem {
    /** 任务key  */
    task_key: string
    /** 任务名称  */
    task_key_name: string
    /** 提醒  */
    remark: string
    /** 1:待开始 2:进行中 3:已完成  */
    status: number
    /** 进度  */
    progress: number
}
export interface GetBizPersonOpenAccountMatchBankQuery {
    /**   example: 154701 */
    order_id?: number
    /** business_order_project.id  example: 1270 */
    business_order_project_id?: number
}
export interface GetBizPersonOpenAccountMatchBankRes {
    /** business_order_project.id  */
    business_order_project_id: number
    /** 银行名称  */
    name: string
    /** 银行类型 1 个户银行；2 公户银行  */
    type: string
    /** 银行代码  */
    code: string
    /** 预计开户周期  */
    account_opening_cycle: string
    /** 账号管理费用  */
    cost: string
    /** 账户类型  */
    account_type: string
    /** 开户要求  */
    requirement: string
    /** 备注  */
    remark: string
}
export interface PostBizPersonOpenAccountCertUploadReqCertsItemFilesItem {
    /** 正面  */
    name?: string
    /** 正面图片  */
    url?: string
    /** 图片的正反面  front=正面   back=反面  */
    scope: string
}
export interface PostBizPersonOpenAccountCertUploadReqCertsItem {
    /** 证件类型 0：证件 1：文书 2: 内地身份证 3: 香港身份证 4: 护照(港澳通行证) 5: 现实居住地址证明  */
    type: number
    /** 文件  */
    files: Array<PostBizPersonOpenAccountCertUploadReqCertsItemFilesItem>
    /** 是否必须提供：0:必须提供, 1:如无可不提供  */
    upload_requirement: number
}
export interface PostBizPersonOpenAccountCertUploadReq {
    /**   */
    order_id: number
    /**   */
    business_order_project_id: number
    /**   */
    certs: Array<PostBizPersonOpenAccountCertUploadReqCertsItem>
    /** 是否提交 1=提交  0=仅仅保存  */
    is_submit: number
}
export interface PostBizPersonOpenAccountCertUploadRes {
}
export interface PostBizPersonOpenAccountUserinfoSaveReqCity {
    /**   */
    area: Array<string>
}
export interface PostBizPersonOpenAccountUserinfoSaveReqAddress {
    /** 地区：["广东", "深圳"] 根据address_aboard==1 ？ 中国-China : "外国" */
    area: Array<string>
    /** 国家  */
    country: string
    /** 详细地址  */
    details: string
    /** 国外详细地址  */
    foreign: string
}
export interface PostBizPersonOpenAccountUserinfoSaveReq {
    /**   */
    order_id: number
    /**   */
    business_order_project_id: number
    /** 银行代码  */
    bank_code: string
    /** 姓名  */
    name: string
    /** 手机号  */
    mobile?: string
    /** 邮箱  */
    email?: string
    /** 居住城市  */
    city: PostBizPersonOpenAccountUserinfoSaveReqCity
    /** 通信地址是否国内外 1国内 2国外 0未选  */
    address_aboard: number
    /** 地址信息  */
    address: PostBizPersonOpenAccountUserinfoSaveReqAddress
    /** 婚姻状况 1=已婚,2=未婚,3=离婚,4=分居,5=丧偶,6=事实婚姻,7=鳏寡 */
    married?: number
    /** 是否美国绿卡 1是 2否 0未选  */
    is_green_card?: number
    /** 当前是否在职 1在职 2不在职 0未选  */
    is_be_on_the_job?: number
    /** 公司名称  */
    company_name?: string
    /** 职位  */
    position?: string
    /** 行业  */
    industry?: string
    /** 年收入类型 1人民币 2美元 3港币 4欧元  */
    annual_income_type?: number
    /** 年收入  */
    annual_income?: string
    /** 港账户预计入款金额类型 1人民币 2美元 3港币 4欧元  */
    hk_incoming_amount_type?: number
    /** 香港账户预计入款金额  */
    hk_incoming_amount?: string
    /** 开户用途 开户用户，多选，必填，枚举值：1=日常储蓄与消费、2=投资交易、3=跨境业务结算、4=资产配置与财富管理、5=保险缴费与理赔、6=其他 */
    purpose?: string
    /** 资金来源 资金来源，多选，必填，枚举值：1=工资收入、2=投资收益、3=经营所得、4=跨境业务收入、5=亲友馈赠、6=遗产继承、7=其他 */
    source?: string
    /** 是否提交  1=是   0=否  */
    is_submit: number
}
export interface PostBizPersonOpenAccountUserinfoSaveRes {
}
export interface GetBizPersonOpenAccountUserinfoGetQuery {
    /**   example: 154701 */
    order_id?: number
    /**   example: 1270 */
    business_order_project_id?: number
}
export interface GetBizPersonOpenAccountUserinfoGetResCity {
    /** 居住城市  */
    city: string
}
export interface GetBizPersonOpenAccountUserinfoGetResAddress {
    /** 国家: 中国-China || 美国  */
    country: string
    /** 省  */
    province: string
    /** 市  */
    city: string
    /** 区  */
    region: string
    /** 详细地址：国外的地址也是这个  */
    detail: string
}
export interface GetBizPersonOpenAccountUserinfoGetRes {
    /**   */
    order_id: number
    /**   */
    business_order_project_id: number
    /** 银行代码  */
    bank_code: string
    /** 姓名  */
    name: string
    /** 手机号  */
    mobile: string
    /** 邮箱  */
    email: string
    /**   */
    city: GetBizPersonOpenAccountUserinfoGetResCity
    /** 通信地址是否国内外 1国内 2国外 0未选  */
    address_aboard: number
    /**   */
    address: GetBizPersonOpenAccountUserinfoGetResAddress
    /** 婚姻状况 1=已婚,2=未婚,3=离婚,4=分居,5=丧偶,6=事实婚姻,7=鳏寡  */
    married: number
    /** 是否美国绿卡 1是 2否 0未选  */
    is_green_card: number
    /** 当前是否在职 1在职 2不在职 0未选  */
    is_be_on_the_job: number
    /** 公司名称  */
    company_name: string
    /** 职位  */
    position: string
    /** 行业  */
    industry: string
    /** 年收入类型 1人民币 2美元 3港币 4欧元  */
    annual_income_type: number
    /** 年收入  */
    annual_income: string
    /** 港账户预计入款金额类型 1人民币 2美元 3港币 4欧元  */
    hk_incoming_amount_type: number
    /** 香港账户预计入款金额  */
    hk_incoming_amount: string
    /** 开户用户，多选，必填，枚举值：1=日常储蓄与消费、2=投资交易、3=跨境业务结算、4=资产配置与财富管理、5=保险缴费与理赔、6=其他  */
    purpose: string
    /** 资金来源，多选，必填，枚举值：1=工资收入、2=投资收益、3=经营所得、4=跨境业务收入、5=亲友馈赠、6=遗产继承、7=其他  */
    source: string
}
export interface GetBizPersonOpenAccountInterviewGetQuery {
    /**   example: 154701 */
    order_id?: number
    /**   example: 1270 */
    business_order_project_id?: number
}
export interface GetBizPersonOpenAccountInterviewGetRes {
    /**   */
    id: number
    /**   */
    business_order_project_id: number
    /**   */
    server_id: number
    /** 意向面试时间开始  */
    intention_time_start: string
    /** 意向面试时间结束  */
    intention_time_end: string
    /** 明确面试时间  */
    interview_time: string
    /** 明确面试地点  */
    interview_location: string
    /** 地点指引  */
    interview_location_guide: string
    /** 面试准备  */
    interview_prepare: string
    /** 注意事项  */
    interview_remind: string
}
export interface PostBizPersonOpenAccountInterviewSubmitReq {
    /**   */
    order_id: number
    /**   */
    business_order_project_id: number
    /** 意向面试时间开始  */
    intention_time_start: string
    /** 意向面试时间结束  */
    intention_time_end: string
}
export interface PostBizPersonOpenAccountInterviewSubmitRes {
}
export interface GetBizPersonOpenAccountCertGetQuery {
    /**   example: 154701 */
    order_id?: number
    /**   example: 1270 */
    business_order_project_id?: number
}

export type GetBizPersonOpenAccountCertGetRes = GetBizPersonOpenAccountCertGetResItem[]
export interface GetBizPersonOpenAccountCertGetResItemFilesItem {
    /**   */
    name: string
    /**   */
    url: string
    /**   */
    scope: string
}
export interface GetBizPersonOpenAccountCertGetResItem {
    /** 证件类型 0：证件 1：文书 2: 内地身份证 3: 香港身份证 4: 护照(港澳通行证) 5: 现实居住地址证明  */
    type: number
    /**   */
    files: Array<GetBizPersonOpenAccountCertGetResItemFilesItem>
    /** 是否必须提供：0:必须提供, 1:如无可不提供  */
    upload_requirement: number
}
