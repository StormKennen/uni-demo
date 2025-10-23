/* eslint-disable prettier/prettier */

export type GetSuperAppPresaleAppShopCartRes = GetSuperAppPresaleAppShopCartResItem[]
export interface GetSuperAppPresaleAppShopCartResItemCompany {
    /** 公司id  */
    id: number
    /** 公司code  */
    code: string
    /** 公司名称  */
    name: string
    /**   */
    alias: string
}
export interface GetSuperAppPresaleAppShopCartResItemPresale_products {
    /**   */
    id: number
    /**   */
    product_id: number
    /**   */
    product_assembly_id: number
    /**   */
    type: number
    /**   */
    created_at: string
    /**   */
    updated_at: string
    /**   */
    laravel_through_key: number
}
export interface GetSuperAppPresaleAppShopCartResItem {
    /**   */
    id: number
    /**   */
    name: string
    /**   */
    sn: string
    /**   */
    description: string
    /**   */
    service_deadline: number
    /**   */
    image: string
    /**   */
    banner: string
    /**   */
    cat_attr: number
    /**   */
    operator: number
    /**   */
    operator_name: string
    /**   */
    status: number
    /**   */
    end_time: string | null
    /**   */
    start_time: string | null
    /**   */
    stock: number
    /**   */
    price: string
    /**   */
    line_price: string
    /**   */
    cost: string
    /**   */
    service_cost: string
    /**   */
    third_cost: string
    /**   */
    concessions: string
    /**   */
    deposit: string
    /**   */
    created_at: string
    /**   */
    updated_at: string
    /**   */
    is_deleted: number
    /**   */
    icons: null
    /**   */
    evaluation: number
    /** 公司信息  */
    company: GetSuperAppPresaleAppShopCartResItemCompany
    /**   */
    presale_products: GetSuperAppPresaleAppShopCartResItemPresale_products
}
export interface PostSuperAppPresaleAppShopCartCreateReq {
    /**   */
    id: string
}

export type PostSuperAppPresaleAppShopCartCreateRes = PostSuperAppPresaleAppShopCartCreateResItem[]

export type PostSuperAppPresaleAppShopCartCreateResItem = string
export interface PostSuperAppPresaleAppOrderCreateFromCartReqProductsItem {
    /**   */
    id: number
}
export interface PostSuperAppPresaleAppOrderCreateFromCartReq {
    /**   */
    products: Array<PostSuperAppPresaleAppOrderCreateFromCartReqProductsItem>
}
export interface PostSuperAppPresaleAppOrderCreateFromCartRes {
    /**   */
    id: number
}
export interface PostSuperAppPresaleAppOrderCreateReqProduct {
    /**   */
    id: number
}
export interface PostSuperAppPresaleAppOrderCreateReq {
    /**  1直播 2 录播 */
    source?: number
    /**   */
    product: PostSuperAppPresaleAppOrderCreateReqProduct
    /**  直播或录播id */
    source_id?: number
}
export interface PostSuperAppPresaleAppOrderCreateRes {
    /**   */
    id: number
}
export interface PostSuperAppPresaleAppOrderSetOrderTypeReq {
    /** 订单id  */
    id: number
    /** 1对私，2对公  */
    type: number
}

export type PostSuperAppPresaleAppOrderSetOrderTypeRes = PostSuperAppPresaleAppOrderSetOrderTypeResItem[]

export type PostSuperAppPresaleAppOrderSetOrderTypeResItem = string
export interface PostSuperAppPresaleAppOrderCreateSignReqSign_information {
    /** 邮箱  */
    email: string
    /** 电话  */
    telephone: string
    /** 地址1  */
    detailed_address: string
    /** 对公的签约人  */
    transactor_id_name: string
    /** 甲方  */
    name: string
    /** 地址区域  */
    location: number
    /** 地址  */
    address: string
    /** 对公签约手机  */
    transactor_mobile: string
    /** 身份证  */
    number: string
    /** 企业税号  */
    institution_code: string
    /**   */
    cascader_value: string
    /** 对公名称  */
    institution_name: string
    /** 学生名称  */
    student_name: string
    /**   */
    certificate_type: string
}
export interface PostSuperAppPresaleAppOrderCreateSignReq {
    /**   */
    sign_information: PostSuperAppPresaleAppOrderCreateSignReqSign_information
    /**  订单id必填 */
    id: number
}

export type PostSuperAppPresaleAppOrderCreateSignRes = PostSuperAppPresaleAppOrderCreateSignResItem[]

export type PostSuperAppPresaleAppOrderCreateSignResItem = string
export interface GetSuperAppPresaleAppOrderGetEsignUrlQuery {
    /**   example: 8 */
    id?: number
    /**   example:  */
    callback?: string
}
export interface GetSuperAppPresaleAppOrderGetEsignUrlRes {
    /**  可访问的长连接 */
    url: string
    /**  可访问的短链接 */
    shortUrl: string
}
export interface PostSuperAppPresaleAppOrderCreatePayLinkReq {
    /** 付款金额  */
    amount: number
    /** 订单id  */
    id: number
}

export type PostSuperAppPresaleAppOrderCreatePayLinkRes = PostSuperAppPresaleAppOrderCreatePayLinkResItem[]

export type PostSuperAppPresaleAppOrderCreatePayLinkResItem = string
export interface PostSuperAppPresaleAppOrderDeleteReq {
    /** 订单id  */
    id: number
}

export type PostSuperAppPresaleAppOrderDeleteRes = PostSuperAppPresaleAppOrderDeleteResItem[]

export type PostSuperAppPresaleAppOrderDeleteResItem = string
export interface PostSuperAppPresaleAppShopCartDeleteReq {
    /** 商品id  */
    ids: Array<string>
}

export type PostSuperAppPresaleAppShopCartDeleteRes = PostSuperAppPresaleAppShopCartDeleteResItem[]

export type PostSuperAppPresaleAppShopCartDeleteResItem = string
export interface PostSuperAppPresaleAppOrderCancelReq {
    /**   */
    id: number
}

export type PostSuperAppPresaleAppOrderCancelRes = PostSuperAppPresaleAppOrderCancelResItem[]

export type PostSuperAppPresaleAppOrderCancelResItem = string
export interface GetSuperAppPresaleAppOrderPaymentInfoQuery {
    /**  example: 8 */
    id: string
}
export interface GetSuperAppPresaleAppOrderPaymentInfoResPaid_listItem {
    /**   */
    id?: number
    /**   */
    payment_time?: string
    /**   */
    company_name?: string
    /**   */
    amount?: string
}
export interface GetSuperAppPresaleAppOrderPaymentInfoRes {
    /**   */
    total_amount: string
    /**   */
    discount: string
    /**   */
    amount: string
    /**   */
    amount_not_paid: number
    /**   */
    amount_paid: number
    /**   */
    paid_list: Array<GetSuperAppPresaleAppOrderPaymentInfoResPaid_listItem>
}
export interface GetSuperAppPresaleAppOrderGetInstitutionNameQuery {
    /**   example:  */
    institution_name?: string
}

export type GetSuperAppPresaleAppOrderGetInstitutionNameRes = string
export interface GetSuperAppPresaleAppOrderInfoQuery {
    /**  example: 10 */
    id: string
}
export interface GetSuperAppPresaleAppOrderInfoResProductsItemPresale_products {
    /**   */
    id: number
    /**   */
    type: number
    /**   */
    created_at: string
    /**   */
    product_id: number
    /**   */
    updated_at: string
    /**   */
    laravel_through_key: number
    /**   */
    product_assembly_id: number
}
export interface GetSuperAppPresaleAppOrderInfoResProductsItem {
    /**   */
    id: number
    /**   */
    sn: string
    /**   */
    cost: string
    /**   */
    name: string
    /**   */
    icons: null
    /**   */
    image: string
    /**   */
    price: string
    /**   */
    stock: number
    /**   */
    banner: string
    /**   */
    status: number
    /**   */
    deposit: string
    /**   */
    cat_attr: number
    /**   */
    end_time: string | null
    /**   */
    operator: number
    /**   */
    created_at: string
    /**   */
    evaluation: number
    /**   */
    is_deleted: number
    /**   */
    line_price: string
    /**   */
    start_time: string | null
    /**   */
    third_cost: string
    /**   */
    updated_at: string
    /**   */
    concessions: string
    /**   */
    description: string
    /**   */
    service_cost: string
    /**   */
    operator_name: string
    /**   */
    presale_products: GetSuperAppPresaleAppOrderInfoResProductsItemPresale_products
    /**   */
    service_deadline: number
}
export interface GetSuperAppPresaleAppOrderInfoResSign_info {
    /** 甲方  */
    name: string
    /** 邮箱  */
    email: string
    /** 身份证号  */
    number: string
    /** 地址信息  */
    address: string
    /** 地址区域  */
    location: number
    /** 电话  */
    telephone: string
    /**   */
    cascader_value: string
    /**   */
    certificate_type: string
    /**   */
    detailed_address: string
}
export interface GetSuperAppPresaleAppOrderInfoResPay_info {
    /** 订单总金额  */
    total_amount: string
    /** 折扣  */
    discount: string
    /** 应付金额  */
    amount: string
    /** 待付金额  */
    amount_not_paid: number
    /** 已付金额  */
    amount_paid: number
    /** 付款信息详细  */
    paid_list: Array<string>
}
export interface GetSuperAppPresaleAppOrderInfoResCompany_code {
    /**   */
    id: number
    /**   */
    code: string
    /**   */
    name: string
    /**   */
    comment: string
    /**   */
    alias: string
    /**   */
    sort: number
    /**   */
    create_order_status: number
    /**   */
    created_at: string
    /**   */
    updated_at: string
    /**   */
    deleted_at: null
}
export interface GetSuperAppPresaleAppOrderInfoRes {
    /**   */
    id: number
    /** 订单号  */
    order_number: string
    /**   */
    yh_id: number
    /** 订单商品  */
    products: Array<GetSuperAppPresaleAppOrderInfoResProductsItem>
    /** 类型，对公2，对私1  */
    type: number
    /** 公司id  */
    company: number
    /** 签署信息  */
    sign_info: GetSuperAppPresaleAppOrderInfoResSign_info
    /** 价格  */
    price: string
    /** 折扣  */
    discount: string
    /** 标价  */
    amount: string
    /** 订单状态:1:已支付 2:待支付 3:已失效 4:已取消 5:待签署  */
    status: number
    /** 来源 1直播2录播0其他  */
    source: number
    /** 文件id  */
    file_id: string
    /** 签署id  */
    sign_flow_id: string
    /** 支付时间  */
    pay_time: null
    /** 首次付款时间  */
    first_pay_time: null
    /** 签署时间  */
    sign_time: null
    /** 取消时间  */
    cancel_time: null
    /**   */
    created_at: string
    /**   */
    updated_at: string
    /**   */
    deleted_at: null
    /** 是否含有教育  */
    is_jy: boolean
    /** 付款信息  */
    pay_info: GetSuperAppPresaleAppOrderInfoResPay_info
    /** 用户名  */
    user_name: string
    /** 公司详细信息  */
    company_code: GetSuperAppPresaleAppOrderInfoResCompany_code
}
export interface GetSuperAppPresaleAppOrderListQuery {
    /** 1:已支付 2:待支付 3:已失效 4:已取消 5:待签署  example:  */
    status?: number
}

export type GetSuperAppPresaleAppOrderListRes = GetSuperAppPresaleAppOrderListResItem[]
export interface GetSuperAppPresaleAppOrderListResItemProductsItemPresale_productsProductMiddleItem {
    /**   */
    id: number
    /**   */
    created_at: string
    /**   */
    created_by: number
    /**   */
    deleted_at: null
    /**   */
    deleted_by: number
    /**   */
    presale_id: number
    /**   */
    updated_at: string
    /**   */
    assembly_id: number
    /**   */
    discount_price: string
}
export interface GetSuperAppPresaleAppOrderListResItemProductsItemPresale_productsProductProductsItem {
    /**   */
    id: number
    /**   */
    name: string
    /**   */
    sort: number
    /**   */
    type: number
    /**   */
    gears: number
    /**   */
    price: string
    /**   */
    status: number
    /**   */
    company: number
    /**   */
    deposit: string
    /**   */
    cost_fee: string
    /**   */
    edited_by: number
    /**   */
    is_report: number
    /**   */
    third_fee: string
    /**   */
    created_at: string
    /**   */
    created_by: number
    /**   */
    deleted_at: null
    /**   */
    deleted_by: number
    /**   */
    product_id: number
    /**   */
    remind_fee: string
    /**   */
    updated_at: string
    /**   */
    product_line: number
    /**   */
    product_type: number
    /**   */
    service_list: string
    /**   */
    service_years: number
    /**   */
    is_performance: number
    /**   */
    report_content: string
    /**   */
    top_discount_fee: string
    /**   */
    laravel_through_key: number
}
export interface GetSuperAppPresaleAppOrderListResItemProductsItemPresale_productsProduct {
    /**   */
    id: number
    /**   */
    name: string
    /**   */
    sort: number
    /**   */
    type: number
    /**   */
    gears: number
    /**   */
    price: string
    /**   */
    middle: Array<GetSuperAppPresaleAppOrderListResItemProductsItemPresale_productsProductMiddleItem>
    /**   */
    status: number
    /**   */
    company: number
    /**   */
    deposit: string
    /**   */
    cost_fee: string
    /**   */
    products: Array<GetSuperAppPresaleAppOrderListResItemProductsItemPresale_productsProductProductsItem>
    /**   */
    edited_by: number
    /**   */
    is_report: number
    /**   */
    third_fee: string
    /**   */
    created_at: string
    /**   */
    created_by: number
    /**   */
    deleted_at: null
    /**   */
    deleted_by: number
    /**   */
    product_id: number
    /**   */
    remind_fee: string
    /**   */
    updated_at: string
    /**   */
    product_line: number
    /**   */
    service_years: number
    /**   */
    is_performance: number
    /**   */
    report_content: string
    /**   */
    top_discount_fee: string
    /**   */
    product_type?: number
    /**   */
    service_list?: null
}
export interface GetSuperAppPresaleAppOrderListResItemProductsItemPresale_products {
    /**   */
    id: number
    /**   */
    type: number
    /**   */
    product: GetSuperAppPresaleAppOrderListResItemProductsItemPresale_productsProduct
    /**   */
    created_at: string
    /**   */
    product_id: number
    /**   */
    updated_at: string
    /**   */
    laravel_through_key: number
    /**   */
    product_assembly_id: number
}
export interface GetSuperAppPresaleAppOrderListResItemProductsItem {
    /**   */
    id: number
    /**   */
    sn: string
    /**   */
    cost: string | number
    /**   */
    name: string
    /**   */
    icons: string
    /**   */
    image: string
    /**   */
    price: string
    /**   */
    stock: number
    /**   */
    banner: string
    /**   */
    status: number
    /**   */
    deposit: string
    /**   */
    cat_attr: number
    /**   */
    end_time: string
    /**   */
    operator: number
    /**   */
    created_at: string
    /**   */
    evaluation: number
    /**   */
    is_deleted: number
    /**   */
    line_price: string
    /**   */
    start_time: string
    /**   */
    third_cost: string
    /**   */
    updated_at: string
    /**   */
    concessions: string
    /**   */
    description: string
    /**   */
    service_cost: string
    /**   */
    operator_name: string
    /**   */
    presale_products: GetSuperAppPresaleAppOrderListResItemProductsItemPresale_products
    /**   */
    service_deadline: number
}
export interface GetSuperAppPresaleAppOrderListResItemSign_info {
    /**   */
    name: string
    /**   */
    email: string
    /**   */
    number: string
    /**   */
    address: string
    /**   */
    location: number
    /**   */
    telephone: string
    /**   */
    cascader_value: string
    /**   */
    certificate_type: string
    /**   */
    detailed_address: string
    /**   */
    institution_code: string
    /**   */
    transactor_mobile: string
}
export interface GetSuperAppPresaleAppOrderListResItemPay_infoPaid_listItem {
    /**   */
    id: number
    /**   */
    payment_time: string
    /**   */
    company_name: string
    /**   */
    amount: string
}
export interface GetSuperAppPresaleAppOrderListResItemPay_info {
    /**   */
    order_number: string
    /**   */
    sign_type: number
    /**   */
    username: string
    /**   */
    total_amount: string
    /**   */
    discount: string
    /**   */
    amount: string
    /**   */
    amount_not_paid: string
    /**   */
    amount_paid: string
    /**   */
    paid_list: Array<GetSuperAppPresaleAppOrderListResItemPay_infoPaid_listItem>
}
export interface GetSuperAppPresaleAppOrderListResItemAttachmentItem {
    /**   */
    isMain: number
    /**   */
    fileUrl: string
    /**   */
    fileName: string
}
export interface GetSuperAppPresaleAppOrderListResItemOrder_mainsItemAttachmentItem {
    /**   */
    isMain?: number
    /**   */
    fileUrl?: string
    /**   */
    fileName?: string
}
export interface GetSuperAppPresaleAppOrderListResItemOrder_mainsItem {
    /**   */
    id?: number
    /**   */
    parent_id?: number
    /**   */
    group_id?: number
    /**   */
    company?: number
    /**   */
    customer_id?: number
    /**   */
    username?: string
    /**   */
    mobile?: string
    /**   */
    sex?: number
    /**   */
    interview?: null
    /**   */
    presale_product_id?: number
    /**   */
    presale_product_name?: string
    /**   */
    project_list?: string
    /**   */
    order_sn?: string
    /**   */
    email?: string
    /**   */
    sign_time?: string
    /**   */
    status?: number
    /**   */
    owner_user_id?: number
    /**   */
    create_user_id?: number
    /**   */
    joint_signature_owner?: string
    /**   */
    commission?: string
    /**   */
    score?: number
    /**   */
    apply_reason?: string
    /**   */
    apply_attach?: null
    /**   */
    attachment?: Array<GetSuperAppPresaleAppOrderListResItemOrder_mainsItemAttachmentItem>
    /**   */
    total_fee?: string
    /**   */
    product_total_fee?: string
    /**   */
    third_total_fee?: string
    /**   */
    product_discount_total_fee?: string
    /**   */
    third_discount_total_fee?: string
    /**   */
    other_discount_total_fee?: string
    /**   */
    cost_total_fee?: string
    /**   */
    frozen_time?: string
    /**   */
    frozen?: number
    /**   */
    type?: number
    /**   */
    questions?: null
    /**   */
    remark?: string
    /**   */
    invoice_type?: null
    /**   */
    invoice_date?: null
    /**   */
    invoice_remark?: string
    /**   */
    invoice_head?: string
    /**   */
    invoice_amount?: string
    /**   */
    give_items_id?: string
    /**   */
    individual_enterprise?: number
    /**   */
    invoicing_party?: string
    /**   */
    third_party_protocol?: null
    /**   */
    transfer_order_sn?: string
    /**   */
    is_new_client?: number
    /**   */
    is_new_service?: number
    /**   */
    source_type_id?: number
    /**   */
    recommend_id?: number
    /**   */
    recommend_username?: string
    /**   */
    client_attribute?: number
    /**   */
    pay_company_name?: string
    /**   */
    business_type?: number
    /**   */
    set_meal_id?: number
    /**   */
    sign_type?: number
    /**   */
    created_at?: string
    /**   */
    updated_at?: string
    /**   */
    deleted_at?: null
    /**   */
    sync_service?: number
    /**   */
    start_service_product_id?: number
    /**   */
    contract_attachment_status?: null
    /**   */
    attachment_status_user_id?: number
    /**   */
    contract_attachment_remark?: null
    /**   */
    received_approval_type?: number
    /**   */
    zs_service_id?: number
    /**   */
    attachment_first_time?: null
    /**   */
    attachment_last_time?: null
    /**   */
    financial_mark?: string
    /**   */
    hk_biz_question?: null
    /**   */
    source?: number
    /**   */
    app_order_number?: string
    /**   */
    app_order_id?: number
    /**   */
    foreign_service_fee?: string
    /**   */
    foreign_cost_fee?: string
    /**   */
    discount_attach?: null
    /**   */
    misc_data?: null
}
export interface GetSuperAppPresaleAppOrderListResItem {
    /**   */
    id: number
    /**   */
    order_number: string
    /**   */
    yh_id: number | string
    /**   */
    products: Array<GetSuperAppPresaleAppOrderListResItemProductsItem>
    /**   */
    type: number | string
    /**   */
    company: number
    /**   */
    sign_info: GetSuperAppPresaleAppOrderListResItemSign_info
    /**   */
    price: string
    /**   */
    discount: string | number
    /**   */
    amount: string
    /**   */
    status: number
    /**   */
    source: number
    /**   */
    source_id: number | null
    /**   */
    file_id: string | number
    /**   */
    sign_flow_id: string | number
    /**   */
    pay_time: string
    /**   */
    first_pay_time: null
    /**   */
    sign_time: string
    /**   */
    cancel_time: null
    /**   */
    created_at: string
    /**   */
    updated_at: string
    /**   */
    deleted_at: null
    /**   */
    customer_id: number
    /** 付款信息  */
    pay_info: GetSuperAppPresaleAppOrderListResItemPay_info
    /**   */
    hsitory_order: number
    /**   */
    attachment: Array<GetSuperAppPresaleAppOrderListResItemAttachmentItem>
    /**   */
    order_mains?: Array<GetSuperAppPresaleAppOrderListResItemOrder_mainsItem>
    /** 1历史订单 0 非历史订单  */
    history_order: number
}
export interface PostSuperAppPresaleAppShopCartStoreReq {
    /**   */
    ids: Array<string>
}

export type PostSuperAppPresaleAppShopCartStoreRes = PostSuperAppPresaleAppShopCartStoreResItem[]

export type PostSuperAppPresaleAppShopCartStoreResItem = string
