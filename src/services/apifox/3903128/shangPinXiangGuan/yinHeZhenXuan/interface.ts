/* eslint-disable prettier/prettier */
export interface GetSuperAppGoodsCategoryListRes {
}
export interface GetSuperAppGoodsListQuery {
    /**   example: 6 */
    goods_category_id?: number
    /**   example: 1 */
    page?: number
    /**   example: 20 */
    page_size?: number
    /** 排序类型: 0 默认排序，1 热门降序， 2 价格升序， 3 价格降序  example: undefined */
    sort_type?: number
    /** 展示场景,100，app 101 小程序  example:  */
    show_scene?: string
}
export interface GetSuperAppGoodsListResListItem {
    /**   */
    id: string
    /**   */
    name: string
    /**   */
    products: Array<string>
    /**   */
    catAttr: number
    /**   */
    price: string
    /**   */
    cost: string
    /**   */
    thirdCost: string
    /**   */
    concessions: string
    /**   */
    deposit: string
    /**   */
    operator: string
    /**   */
    status: number
    /**   */
    createdAt: string
    /**   */
    updatedAt: string
    /**   */
    sn: string
    /**   */
    image: string
    /**   */
    banner: Array<string>
    /**   */
    viewConfig: null
    /**   */
    description: string
    /**   */
    serviceDeadline: string
    /**   */
    serviceCost: string
    /**   */
    linePrice: string
    /**   */
    details: Array<string>
    /**   */
    stock: number
    /**   */
    startTime: string
    /**   */
    endTime: string
    /**   */
    statusText: string
    /**   */
    catAttrText: string
    /**   */
    icons: Array<string>
}
export interface GetSuperAppGoodsListRes {
    /**   */
    list: Array<GetSuperAppGoodsListResListItem>
    /**   */
    total: number
}
