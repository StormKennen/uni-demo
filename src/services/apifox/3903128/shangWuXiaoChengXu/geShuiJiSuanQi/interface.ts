/* eslint-disable prettier/prettier */
export interface PostBizTaxCalculateReq {
    /** 月薪  example:  */
    monthlySalary?: number
    /** 奖金  example:  */
    bonus?: number
    /** 婚姻状态 1-未婚 2-已婚  example:  */
    maritalStatus?: number
    /** 居住状态   example:  */
    housingStatus?: number
    /** 房屋地区 1 香港 2大陆 3都有  example:  */
    houseLocation?: number
    /** 子女数量  example:  */
    childrenCount?: number
    /** 赡养老人数量  example:  */
    careCount?: number
    /** 继续教育 1-无 2-有  example:  */
    continueEducation?: number
    /** 是否赡养子女 0-无 1-有  example:  */
    childrenStatus?: number
    /** 是否赡养老人 0-无 1-有  example:  */
    careStatus?: number
}

export type PostBizTaxCalculateRes = PostBizTaxCalculateResItem[]
export interface PostBizTaxCalculateResItemTaxDeductionsItem {
    /**   */
    currency: string
    /**   */
    name: string
    /**   */
    amount: number
}
export interface PostBizTaxCalculateResItem {
    /**   */
    taxArea: string
    /**   */
    totalIncome: number
    /**   */
    taxDeductions: Array<PostBizTaxCalculateResItemTaxDeductionsItem>
    /**   */
    exchangeRate: number | number
    /**   */
    totalTax?: number
    /**   */
    taxRate?: number
}
export interface GetBizTaxCalculateRecordQuery {
    /** 记录id example: 1 */
    recordId: number
}

export type GetBizTaxCalculateRecordRes = GetBizTaxCalculateRecordResItem[]
export interface GetBizTaxCalculateRecordResItemTaxDeductionsItem {
    /**   */
    currency: string
    /**   */
    name: string
    /**   */
    amount: number
}
export interface GetBizTaxCalculateRecordResItem {
    /**   */
    taxArea: string
    /**   */
    totalIncome: number
    /**   */
    totalTax: number | number
    /**   */
    taxDeductions: Array<GetBizTaxCalculateRecordResItemTaxDeductionsItem>
    /**   */
    exchangeRate: number | number
    /**   */
    taxRate: number
}
