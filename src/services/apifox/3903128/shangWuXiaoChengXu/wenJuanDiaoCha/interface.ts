/* eslint-disable prettier/prettier */
export interface GetBizQuestionListQuery {
    /** 业务类型:biz_person_open_account=个人开户-银行匹配问卷调查 
biz_company_open_account=公司开户-银行匹配问卷调查  example: biz_person_open_account */
    business_key?: string
}
export interface GetBizQuestionListResQuestionsItemOptionsItem {
    /** 选项ID  */
    id: number
    /** 问题ID  */
    question_id: number
    /** 问题题目  */
    title: string
    /**   */
    remark: string
    /**   */
    description: string
    /** 问题序号  */
    number: number
    /** 选中该选项后是否需要额外填写说明 0:无需 1:选填 2:必填  */
    need_extra: number
    /** 该选项对应得分，业务有需要时可用  */
    score: number
}
export interface GetBizQuestionListResQuestionsItem {
    /** 问题ID  */
    id: number
    /** 问卷ID  */
    survey_id: number
    /** 问题题目  */
    title: string
    /**   */
    remark: string
    /**   */
    description: string
    /** 问题序号  */
    number: number
    /** 问题类型 1:单选 2:多选 3:文本输入 4:文件上传  */
    type: number
    /** 是否必须回答 0:否 1:是  */
    is_required: number
    /**   */
    max_file_count: number
    /** 问题选项  */
    options: Array<GetBizQuestionListResQuestionsItemOptionsItem>
}
export interface GetBizQuestionListRes {
    /** 问卷ID  */
    id: number
    /** 业务类型，唯一标识一张业务问券  */
    business_key: string
    /** 问卷标题  */
    title: string
    /**   */
    remark: string
    /**   */
    description: string
    /**   */
    questions: Array<GetBizQuestionListResQuestionsItem>
}
export interface PostBizQuestionSubmitReqAnswer_detailsItemOption_extraItem {
    /** 选项ID  */
    option_id: number
    /** 问题选项额外说明  */
    extra: string
    /** 选项标题  */
    title: string
}
export interface PostBizQuestionSubmitReqAnswer_detailsItem {
    /** 问题ID  */
    question_id: number
    /** 问题类型：1:单选 2:多选 3:文本输入 4:文件上传  */
    question_type: number
    /** 问题标题  */
    title: string
    /** 文本输入内容 仅对文本输入题有效  */
    text: string
    /** 回答的问题选项  */
    option_extra: Array<PostBizQuestionSubmitReqAnswer_detailsItemOption_extraItem>
}
export interface PostBizQuestionSubmitReq {
    /** 问卷id  */
    survey_id: number
    /**   */
    answer_details: Array<PostBizQuestionSubmitReqAnswer_detailsItem>
    /** 订单ID  */
    order_id: number
    /**   */
    business_order_project_id: number
    /** 业务类型:biz_person_open_account=个人开户-银行匹配问卷调查  */
    business_key: string
}

export type PostBizQuestionSubmitRes = string
export interface PostBizQuestionCompanySubmitReqAnswer_detailsItemOption_extraItem {
    /** 选项ID  */
    option_id: number
    /** 问题选项额外说明  */
    extra: string
    /** 选项标题  */
    title: string
}
export interface PostBizQuestionCompanySubmitReqAnswer_detailsItem {
    /** 问题ID  */
    question_id: number
    /** 问题类型：1:单选 2:多选 3:文本输入 4:文件上传  */
    question_type: number
    /** 问题标题  */
    title: string
    /** 文本输入内容 仅对文本输入题有效  */
    text: string
    /** 回答的问题选项  */
    option_extra: Array<PostBizQuestionCompanySubmitReqAnswer_detailsItemOption_extraItem>
}
export interface PostBizQuestionCompanySubmitReq {
    /** 问卷id  */
    survey_id: number
    /**   */
    answer_details: Array<PostBizQuestionCompanySubmitReqAnswer_detailsItem>
    /** 订单id 订单id */
    order_id: number
}

export type PostBizQuestionCompanySubmitRes = string
export interface GetBizQuestionCompanyInfoQuery {
    /** 订单id  example: undefined */
    order_id?: number
}
export interface GetBizQuestionCompanyInfoRes {
    /**   */
    server_id: number
    /**  公司名字 */
    name: string
}
