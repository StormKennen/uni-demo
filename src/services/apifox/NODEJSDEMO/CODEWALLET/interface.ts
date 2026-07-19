/**
 * @description CodeWallet/获取码包列表--接口请求Query参数
 * @url GET /code-wallet/items
 */
export interface getCodeWalletItemsQuery {
  keyword?: string

  codeType?: string

  tag?: string

  page?: number

  pageSize?: number
}

/**
 * @description CodeWallet/获取码包列表--接口返回值
 * @url GET /code-wallet/items
 */
export type getCodeWalletItemsRes = object

/**
 * @description CodeWallet/创建码包条目--接口请求Body参数
 * @url POST /code-wallet/items
 */
export interface postCodeWalletItemsBody {
  backgroundColor?: string
  barcodeFormat?: 'code128' | 'ean13' | 'ean8' | 'upc'
  codeType: 'qr' | 'barcode'
  color?: string
  content: string
  name: string
  tag?: string
}

/**
 * @description CodeWallet/创建码包条目--接口返回值
 * @url POST /code-wallet/items
 */
export interface postCodeWalletItemsRes {
  backgroundColor?: string
  barcodeFormat?: any
  codeType?: 'qr' | 'barcode'
  color?: string
  content?: string
  id?: string
  name?: string
  pinned?: boolean
  sortOrder?: number
  status?: 'enabled' | 'disabled'
  tag?: string
}

/**
 * @description CodeWallet/本地码包同步到云端--接口请求Body参数
 * @url POST /code-wallet/items/sync
 */
export interface postCodeWalletItemsSyncBody {
  items: postCodeWalletItemsSyncBodyItemsItem[]
}

/** postCodeWalletItemsSyncBodyItems */
export interface postCodeWalletItemsSyncBodyItemsItem {
  barcodeFormat?: string
  codeType: 'qr' | 'barcode'
  content: string
  localId?: string
  name: string
  pinned?: boolean
  tag?: string
  /** 毫秒时间戳 */
  updatedAt?: number
}

/**
 * @description CodeWallet/本地码包同步到云端--接口返回值
 * @url POST /code-wallet/items/sync
 */
export interface postCodeWalletItemsSyncRes {
  created?: number
  skipped?: number
  updated?: number
}

/**
 * @description CodeWallet/获取码包详情--接口返回值
 * @url GET /code-wallet/items/{itemId}
 */
export interface getCodeWalletItemsItemIdRes {
  backgroundColor?: string
  barcodeFormat?: any
  codeType?: 'qr' | 'barcode'
  color?: string
  content?: string
  id?: string
  name?: string
  pinned?: boolean
  sortOrder?: number
  status?: 'enabled' | 'disabled'
  tag?: string
}

/**
 * @description CodeWallet/更新码包条目--接口请求Body参数
 * @url PATCH /code-wallet/items/{itemId}
 */
export interface patchCodeWalletItemsItemIdBody {
  backgroundColor?: string
  barcodeFormat?: 'code128' | 'ean13' | 'ean8' | 'upc'
  codeType?: 'qr' | 'barcode'
  color?: string
  content?: string
  name?: string
  pinned?: boolean
  sortOrder?: number
  status?: 'enabled' | 'disabled'
  tag?: string
}

/**
 * @description CodeWallet/更新码包条目--接口返回值
 * @url PATCH /code-wallet/items/{itemId}
 */
export interface patchCodeWalletItemsItemIdRes {
  backgroundColor?: string
  barcodeFormat?: any
  codeType?: 'qr' | 'barcode'
  color?: string
  content?: string
  id?: string
  name?: string
  pinned?: boolean
  sortOrder?: number
  status?: 'enabled' | 'disabled'
  tag?: string
}

/**
 * @description CodeWallet/删除码包条目（软删除）--接口返回值
 * @url DELETE /code-wallet/items/{itemId}
 */
export type deleteCodeWalletItemsItemIdRes = object
