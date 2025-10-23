/* eslint-disable prettier/prettier */
export interface GetSuperAppGoodsCategoryInfoQuery {
    /** 品类ID  example:  */
    pid?: string
}

export type GetSuperAppGoodsCategoryInfoRes = GetSuperAppGoodsCategoryInfoResItem[]
export interface GetSuperAppGoodsCategoryInfoResItem {
    /** 位置ID  */
    id?: string
    /** 名称  */
    name?: string
    /** 图片  */
    image?: string
}
export interface GetSuperAppGoodsInfoQuery {
    /** 商品种类 2: 香港身份 3：香港生活  example:  */
    categoryId?: string
    /** 一二曲商品ID 4：优才 5：高才 6：专才 7：留学 8：创业 9：教育 10：永居  example:  */
    levelId?: string
}
export interface GetSuperAppGoodsInfoResProductsItemDetailsItem {
    /** 标题  */
    name?: string
    /** 标题图片  */
    image?: string
    /** 标题展示 1：展示  2：不展示  */
    show_name?: number
    /** 类型  1：图片   2：视频  */
    type?: number
    /** 视频连接  */
    video?: string
}
export interface GetSuperAppGoodsInfoResProductsItem {
    /** 商品名称  */
    name?: string
    /** 商品描述  */
    description?: string
    /** 商品主图  */
    image?: string
    /** 商品轮播图  */
    banner?: Array<string>
    /** 商品的详情信息  */
    details?: Array<GetSuperAppGoodsInfoResProductsItemDetailsItem>
    /** 商品ID  */
    id?: string
}
export interface GetSuperAppGoodsInfoRes {
    /**   */
    products?: Array<GetSuperAppGoodsInfoResProductsItem>
    /** 默认二维码  */
    imageUrlDefault?: string
    /** 下载二维码  */
    imageUrlDefaultDownload?: string
}
