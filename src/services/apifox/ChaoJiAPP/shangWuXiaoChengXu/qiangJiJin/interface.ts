/**
 * @description /强积金首页--接口请求Query参数
 * @url GET /biz/mpf/fund/home
 */
export interface getMpfFundHomeQuery {
  /** 订单id */
  order_id?: number
  [key: string]: any
}

/**
 * @description /强积金首页--接口返回值
 * @url GET /biz/mpf/fund/home
 */
export type getMpfFundHomeRes = getMpfFundHomeResItemItem[]

/** getMpfFundHomeResItem */
export interface getMpfFundHomeResItemItem {
  business_order_project_id: number
  described: string
  name: string
  progress_num: number
  status_text: string
  [key: string]: any
}

/**
 * @description /强积金=账号开通页面--接口请求Query参数
 * @url GET /biz/mpf/mpf-account/info
 */
export interface getMpfMpfAccountInfoQuery {
  order_id?: number

  business_order_project_id?: number
  [key: string]: any
}

/**
 * @description /强积金=账号开通页面--接口返回值
 * @url GET /biz/mpf/mpf-account/info
 */
export interface getMpfMpfAccountInfoRes {
  account: string
  password: string
  [key: string]: any
}

/**
 * @description /保存客户填写的地址--接口请求Body参数
 * @url POST /biz/mpf/express/address/save
 */
export interface postExpressAddressSaveBody {
  business_order_project_id: number
  order_id: number
  recipient_address: postExpressAddressSaveBodyRecipient_address
  recipient_mobile: string
  recipient_name: string
  [key: string]: any
}

/** postExpressAddressSaveBodyRecipient_address */
export interface postExpressAddressSaveBodyRecipient_address {
  address_aboard: number
  area: string[]
  country: string
  details: string
  foreign: string
  [key: string]: any
}

/**
 * @description /保存客户填写的地址--接口返回值
 * @url POST /biz/mpf/express/address/save
 */
export interface postExpressAddressSaveRes {
  [key: string]: any
}

/**
 * @description /强积金-等待结果--接口请求Query参数
 * @url GET /biz/mpf/wait-result/task
 */
export interface getMpfWaitResultTaskQuery {
  /** 订单id */
  order_id: number
  /** id */
  business_order_project_id?: number
  [key: string]: any
}

/**
 * @description /强积金-等待结果--接口返回值
 * @url GET /biz/mpf/wait-result/task
 */
export type getMpfWaitResultTaskRes = getMpfWaitResultTaskResItemItem[]

/** getMpfWaitResultTaskResItemExtendFile_item */
export interface getMpfWaitResultTaskResItemExtendFile_item {
  '@type': string
  file_id: number
  file_name: string
  msg: string
  status: number
  [key: string]: any
}

/** getMpfWaitResultTaskResItemExtendIs_need_to_handle */
export interface getMpfWaitResultTaskResItemExtendIs_need_to_handle {
  '@type': string
  value: string
  [key: string]: any
}

/** getMpfWaitResultTaskResItemExtendRecipient_address */
export interface getMpfWaitResultTaskResItemExtendRecipient_address {
  '@type': string
  address_aboard: number
  area: string[]
  country: string
  details: string
  foreign: string
  [key: string]: any
}

/** getMpfWaitResultTaskResItemExtendRecipient_confirm_flag */
export interface getMpfWaitResultTaskResItemExtendRecipient_confirm_flag {
  '@type': string
  value: string
  [key: string]: any
}

/** getMpfWaitResultTaskResItemExtendRecipient_mobile */
export interface getMpfWaitResultTaskResItemExtendRecipient_mobile {
  '@type': string
  value: string
  [key: string]: any
}

/** getMpfWaitResultTaskResItemExtendRecipient_name */
export interface getMpfWaitResultTaskResItemExtendRecipient_name {
  '@type': string
  value: string
  [key: string]: any
}

/** getMpfWaitResultTaskResItemExtendSign_filesItems */
export interface getMpfWaitResultTaskResItemExtendSign_filesItemsItem {
  name: string
  url: string
  [key: string]: any
}

/** getMpfWaitResultTaskResItemExtendSign_files */
export interface getMpfWaitResultTaskResItemExtendSign_files {
  '@type': string
  items: getMpfWaitResultTaskResItemExtendSign_filesItemsItem[]
  [key: string]: any
}

/** getMpfWaitResultTaskResItemExtendTracking_number_to_customer */
export interface getMpfWaitResultTaskResItemExtendTracking_number_to_customer {
  '@type': string
  value: string
  [key: string]: any
}

/** getMpfWaitResultTaskResItemExtendTracking_number_to_yh */
export interface getMpfWaitResultTaskResItemExtendTracking_number_to_yh {
  '@type': string
  value: string
  [key: string]: any
}

/** getMpfWaitResultTaskResItemExtendYh_recipient_address */
export interface getMpfWaitResultTaskResItemExtendYh_recipient_address {
  '@type': string
  address_aboard: number
  area: string[]
  country: string
  details: string
  foreign: string
  [key: string]: any
}

/** getMpfWaitResultTaskResItemExtendYh_recipient_mobile */
export interface getMpfWaitResultTaskResItemExtendYh_recipient_mobile {
  '@type': string
  value: string
  [key: string]: any
}

/** getMpfWaitResultTaskResItemExtendYh_recipient_name */
export interface getMpfWaitResultTaskResItemExtendYh_recipient_name {
  '@type': string
  value: string
  [key: string]: any
}

/** getMpfWaitResultTaskResItemExtend */
export interface getMpfWaitResultTaskResItemExtend {
  file_item?: getMpfWaitResultTaskResItemExtendFile_item
  is_need_to_handle?: getMpfWaitResultTaskResItemExtendIs_need_to_handle
  recipient_address?: getMpfWaitResultTaskResItemExtendRecipient_address
  recipient_confirm_flag?: getMpfWaitResultTaskResItemExtendRecipient_confirm_flag
  recipient_mobile?: getMpfWaitResultTaskResItemExtendRecipient_mobile
  recipient_name?: getMpfWaitResultTaskResItemExtendRecipient_name
  sign_files?: getMpfWaitResultTaskResItemExtendSign_files
  tracking_number_to_customer?: getMpfWaitResultTaskResItemExtendTracking_number_to_customer
  tracking_number_to_yh: getMpfWaitResultTaskResItemExtendTracking_number_to_yh
  yh_recipient_address?: getMpfWaitResultTaskResItemExtendYh_recipient_address
  yh_recipient_mobile?: getMpfWaitResultTaskResItemExtendYh_recipient_mobile
  yh_recipient_name?: getMpfWaitResultTaskResItemExtendYh_recipient_name
  [key: string]: any
}

/** getMpfWaitResultTaskResItem */
export interface getMpfWaitResultTaskResItemItem {
  extend: getMpfWaitResultTaskResItemExtend
  status: number
  task_key: string
  task_name: string
  tips: string
  [key: string]: any
}
