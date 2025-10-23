/* eslint-disable prettier/prettier */
export interface PostBizCompanyOpenAccountInterviewSubmitReq {
    /** 开始时间  */
    start_time: string
    /** 结束时间  */
    end_time: string
    /** 委托办理个户 true: 是 false:否 */
    handle_individual_accounts: boolean
    /** 订单id  */
    order_id: number
}
export interface PostBizCompanyOpenAccountInterviewSubmitRes {
}
export interface GetBizCompanyOpenAccountInterviewDetailQuery {
    /** 订单id  example: 1 */
    order_id?: number
}
export interface GetBizCompanyOpenAccountInterviewDetailResInterviewGuidelinesItem {
    /**   */
    name: string
    /**   */
    url: string
}
export interface GetBizCompanyOpenAccountInterviewDetailResInterview {
    /**  地点指引 */
    guidelines: Array<GetBizCompanyOpenAccountInterviewDetailResInterviewGuidelinesItem>
    /**  面试准备 */
    interview_preparation: string
    /**  面签提醒 */
    remind: string
    /**  注意事项 */
    precautions: string
    /**  意向面试时间开始 */
    intention_time_start: string
    /**  意向面试时间结束 */
    intention_time_end: string
    /**  预约时间 */
    time: string
    /**  面试地点 */
    address: string
}
export interface GetBizCompanyOpenAccountInterviewDetailRes {
    /** 订单id  */
    order_id: number
    /**   */
    interview: GetBizCompanyOpenAccountInterviewDetailResInterview
    /** 是否有个户  */
    handle_individual_accounts: boolean
    /** project id  */
    business_order_project_id: number
    /** 面试指导次数  */
    interview_count: number
}
export interface GetBizCompanyOpenAccountInterviewCounselingQuery {
    /** 订单id  example: undefined */
    order_id?: number
}

export type GetBizCompanyOpenAccountInterviewCounselingRes = any
