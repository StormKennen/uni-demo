/* eslint-disable prettier/prettier */
export interface GetSuperAppGoodsPlaceByGoodsIdQuery {
    /**   example: undefined */
    id?: string
}
export interface GetSuperAppGoodsPlaceByGoodsIdResDetailsItem {
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
export interface GetSuperAppGoodsPlaceByGoodsIdResIconsItem {
    /** 描述文案  */
    description?: string
    /** 颜色  */
    color?: string
}
export interface GetSuperAppGoodsPlaceByGoodsIdRes {
    /** 商品名称  */
    name?: string
    /** 商品描述  */
    description?: string
    /** 商品主图  */
    image?: string
    /** 商品轮播图  */
    banner?: Array<string>
    /** 商品的详情信息  */
    details?: Array<GetSuperAppGoodsPlaceByGoodsIdResDetailsItem>
    /** 商品ID  */
    id?: string
    /** 商品价格  */
    price?: string
    /** 商品成本  */
    cost?: string
    /** 商品开始时间  */
    startTime?: string
    /** 商品结束时间  */
    endTime?: string
    /** 商品分类  */
    catAttr?: number
    /** 商品分类名称  */
    catAttrText?: string
    /** 商品库存  */
    stock?: number
    /** 上架标价  */
    linePrice?: string
    /** 商品编号  */
    sn?: string
    /** 录播视频ID  */
    recordedVideoId?: string
    /** 直播ID  */
    liveId?: string
    /** 商品图标  */
    icons?: Array<GetSuperAppGoodsPlaceByGoodsIdResIconsItem>
    /** 测评入口 0 无需 1 优才  */
    evaluation?: number
    /** 录播视频地址  */
    recordedVideoUrl?: string
    /** 录播视频封面  */
    recordedVideoCover?: string
}
export interface GetSuperAppGoodsPlaceDetailByGoodsIdQuery {
    /**   example: undefined */
    id?: string
}
export interface GetSuperAppGoodsPlaceDetailByGoodsIdResProductsItem {
    /** 产品ID  */
    id?: string
    /** crm2.0关联的产品的ID  */
    assemblyId?: string
    /** crm2.0关联的产品的类型  */
    assemblyType?: number
}
export interface GetSuperAppGoodsPlaceDetailByGoodsIdResIconsItem {
    /** 描述文案  */
    description?: string
    /** 颜色  */
    color?: string
}
export interface GetSuperAppGoodsPlaceDetailByGoodsIdRes {
    /** 商品名称  */
    name?: string
    /** 商品描述  */
    description?: string
    /** 商品主图  */
    image?: string
    /** 商品轮播图  */
    banner?: Array<string>
    /** 商品ID  */
    id?: string
    /** 商品价格  */
    price?: string
    /** 商品成本  */
    cost?: string
    /** 商品开始时间  */
    startTime?: string
    /** 商品结束时间  */
    endTime?: string
    /** 商品分类  */
    catAttr?: number
    /** 商品分类名称  */
    catAttrText?: string
    /** 商品列表  */
    products?: Array<GetSuperAppGoodsPlaceDetailByGoodsIdResProductsItem>
    /** 上架标价  */
    linePrice?: string
    /** 商品编号  */
    sn?: string
    /** 录播视频ID  */
    recordedVideoId?: string
    /** 直播ID  */
    liveId?: string
    /** 商品图标  */
    icons?: Array<GetSuperAppGoodsPlaceDetailByGoodsIdResIconsItem>
    /** 测评入口 0 无需 1 优才  */
    evaluation?: number
    /** 录播视频地址  */
    recordedVideoUrl?: string
    /** 录播视频封面  */
    recordedVideoCover?: string
}
export interface GetSuperAppGoodsPlaceDetailViewNoticeQuery {
    /**   example: undefined */
    id?: string
}
export interface GetSuperAppGoodsPlaceDetailViewNoticeRes {
    /**  A URL/resource name that uniquely identifies the type of the serialized
protocol buffer message. This string must contain at least
one "/" character. The last segment of the URL's path must represent
the fully qualified name of the type (as in
`path/google.protobuf.Duration`). The name should be in a canonical form
(e.g., leading "." is not accepted).

In practice, teams usually precompile into the binary all types that they
expect it to use in the context of Any. However, for URLs which use the
scheme `http`, `https`, or no scheme, one can optionally set up a type
server that maps type URLs to message definitions as follows:

* If no scheme is provided, `https` is assumed.
* An HTTP GET on the URL must yield a [google.protobuf.Type][]
  value in binary format, or produce an error.
* Applications are allowed to cache lookup results based on the
  URL, or have them precompiled into a binary to avoid any
  lookup. Therefore, binary compatibility needs to be preserved
  on changes to types. (Use versioned type names to manage
  breaking changes.)

Note: this functionality is not currently available in the official
protobuf release, and it is not used for type URLs beginning with
type.googleapis.com. As of May 2023, there are no widely used type server
implementations and no plans to implement one.

Schemes other than `http`, `https` (or the empty scheme) might be
used with implementation specific semantics. */
    '@type'?: string
}
export interface GetSuperAppGoodsOrderPayInfoQuery {
    /** 订单id  example:  */
    order_id?: number
    /** 订单sn  example:  */
    order_sn?: string
}
export interface GetSuperAppGoodsOrderPayInfoResOrder_info {
    /** 创建时间, 计算倒计时  */
    created_at?: string
    /** 订单id  */
    order_id?: string
    /** 订单状态 1:已支付 2:待支付 3:已失效 4:已取消  */
    status?: number
    /** 是否有支付过订单，1未支付，2已部分支付  */
    paid_status?: number
    /** 商品id  */
    goods_id?: number
    /** 支付时间  */
    pay_time: string
    /** 支付截止时间 对公的不需要倒计时，已过期，已支付，已取消等状态不需要倒计时 */
    end_time: string
}
export interface GetSuperAppGoodsOrderPayInfoResPay_infoPayment_link_infoItem {
    /** 主键id  */
    id?: number
    /** 付款时间  */
    payment_time?: string
    /** 付款金额  */
    amount?: string
    /** 付款渠道  */
    channel_name?: string
}
export interface GetSuperAppGoodsOrderPayInfoResPay_info {
    /** 应付金额  */
    actual_service_fee?: string
    /** 未付金额  */
    amount_not_paid?: string
    /** 已付付金额  */
    amount_paid?: string
    /** 折扣金额  */
    amount_discount?: string
    /** 已付款列表  */
    payment_link_info?: Array<GetSuperAppGoodsOrderPayInfoResPay_infoPayment_link_infoItem>
    /** crm order id,用于支付  */
    id?: number
    /** 付款主体  */
    pay_name?: string
    /** 付款货币单位  */
    currency_code?: string
    /** 签署类型 1 对私 2对公  */
    sign_type?: string
}
export interface GetSuperAppGoodsOrderPayInfoRes {
    /**   */
    order_info?: GetSuperAppGoodsOrderPayInfoResOrder_info
    /**   */
    pay_info?: GetSuperAppGoodsOrderPayInfoResPay_info
}
export interface GetSuperAppGoodsOrderPayInfoLinksQuery {
    /** 订单id  example:  */
    order_id?: number
}
export interface GetSuperAppGoodsOrderPayInfoLinksRes {
    /** 长地址  */
    url?: string
    /** 短地址  */
    shortUrl?: string
}
