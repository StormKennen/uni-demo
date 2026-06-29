/**
 * @description GameCoupons/获取当前可用券码列表--接口请求Query参数
 * @url GET /game-coupons/{gameId}/codes
 */
export interface getGameCouponsGameIdCodesQuery {
  /** 图鉴 ID（可选，用于关联来源） */
  compendium_id?: string
}

/**
 * @description GameCoupons/获取当前可用券码列表--接口返回值
 * @url GET /game-coupons/{gameId}/codes
 */
export interface getGameCouponsGameIdCodesRes {
  /** 是否为缓存结果 */
  cached?: boolean
  /** 当前有效券码列表 */
  codes?: getGameCouponsGameIdCodesResCodes[]
  compendiumId?: string
  gameId?: string
  /** 码池最近更新时间 */
  updatedAt?: string
}

/** 券码对象 */
export interface getGameCouponsGameIdCodesResCodes {
  /** 券码字符串（大写） */
  code?: string
  /** 奖励描述 */
  reward?: string
  /** 券码来源：preset=预置 | upstream=社区同步 | manual=手动 | admin=后台 | swgt=官方 */
  source?: 'preset' | 'upstream' | 'manual' | 'admin' | 'swgt'
}

/**
 * @description GameCoupons/手动添加券码--接口请求Query参数
 * @url POST /game-coupons/{gameId}/codes/manual
 */
export interface postGameIdCodesManualQuery {
  /** 图鉴 ID（可选） */
  compendium_id?: string
}

/**
 * @description GameCoupons/手动添加券码--接口请求Body参数
 * @url POST /game-coupons/{gameId}/codes/manual
 */
export interface postGameIdCodesManualBody {
  /** 券码字符串（不区分大小写，后端自动转大写） */
  code: string
  /** 奖励描述（可选） */
  reward?: string
  /** 来源标记（可选，默认 manual） */
  source?: string
}

/**
 * @description GameCoupons/手动添加券码--接口返回值
 * @url POST /game-coupons/{gameId}/codes/manual
 */
export type postGameIdCodesManualRes = string

/**
 * @description GameCoupons/查询账号资料（昵称验证）--接口请求Query参数
 * @url GET /game-coupons/{gameId}/profile
 */
export interface getGameCouponsGameIdProfileQuery {
  /** Hive ID（玩家账号标识，纯数字） example: 123456789 */
  account_id: string
  /** 区服：global=全球服 | korea=韩国服 | japan=日本服 | china=中国服 | asia=亚洲服 | europe=欧洲服 */
  server: string
  /** 图鉴 ID（可选） */
  compendium_id?: string
}

/**
 * @description GameCoupons/查询账号资料（昵称验证）--接口返回值
 * @url GET /game-coupons/{gameId}/profile
 */
export interface getGameCouponsGameIdProfileRes {
  /** 查询的 Hive ID */
  accountId?: string
  /** 是否查询成功（true=Hive ID 有效且获取到昵称） */
  available?: boolean
  compendiumId?: string
  gameId?: string
  /** 结果描述信息 */
  message?: string
  /** 游戏内昵称（wizard_name） */
  nickname?: string
  /** 查询的区服 */
  server?: 'global' | 'korea' | 'japan' | 'china' | 'asia' | 'europe'
  /** 官方返回的区服全名 */
  serverName?: string
}

/**
 * @description GameCoupons/执行兑换（支持多账号多券码批量）--接口请求Query参数
 * @url POST /game-coupons/{gameId}/redeem
 */
export interface postGameCouponsGameIdRedeemQuery {
  /** 图鉴 ID（可选） */
  compendium_id?: string
}

/**
 * @description GameCoupons/执行兑换（支持多账号多券码批量）--接口请求Body参数
 * @url POST /game-coupons/{gameId}/redeem
 */
export interface postGameCouponsGameIdRedeemBody {
  /** 要兑换的账号列表（至少 1 个） */
  accounts: postGameCouponsGameIdRedeemBodyAccountsItem[]
  /** 要兑换的券码列表（至少 1 个） */
  codes: postGameCouponsGameIdRedeemBodyCodesItem[]
}

/** 要兑换的账号列表（至少 1 个） */
export interface postGameCouponsGameIdRedeemBodyAccountsItem {
  /** Hive ID */
  accountId?: string
  /** Hive ID（与 accountId 二选一） */
  account_id?: string
  /** 前端临时 ID（用于结果对应） */
  id?: string
  /** 玩家昵称（可选，仅前端展示用） */
  nickname?: string
  /** 区服 */
  server: 'global' | 'korea' | 'japan' | 'china' | 'asia' | 'europe'
}

/** 要兑换的券码列表（至少 1 个） */
export interface postGameCouponsGameIdRedeemBodyCodesItem {
  /** 券码字符串 */
  code: string
  /** 奖励描述（可选） */
  reward?: string
}

/**
 * @description GameCoupons/执行兑换（支持多账号多券码批量）--接口返回值
 * @url POST /game-coupons/{gameId}/redeem
 */
export interface postGameCouponsGameIdRedeemRes {
  /** 按账号分组的详细结果 */
  accountResults?: postGameCouponsGameIdRedeemResAccountResults[]
  /** 总已使用数 */
  alreadyUsed?: number
  /** 总失败数 */
  failed?: number
  /** 总成功数 */
  success?: number
}

/** postGameCouponsGameIdRedeemResAccountResultsAccount */
export interface postGameCouponsGameIdRedeemResAccountResultsAccount {
  /** Hive ID（脱敏或原始值，取决于是否登录） */
  accountId?: string
  id?: string
  server?: 'global' | 'korea' | 'japan' | 'china' | 'asia' | 'europe'
}

/** 单条兑换结果 */
export interface postGameCouponsGameIdRedeemResAccountResultsResults {
  /** 券码 */
  code?: string
  /** 官方返回消息 */
  message?: string
  /** 奖励描述 */
  reward?: string
  /** 兑换结果：success | already_used | invalid_coupon | invalid_id | failed */
  status?:
    | 'success'
    | 'already_used'
    | 'invalid_coupon'
    | 'invalid_id'
    | 'failed'
}

/** 单账号兑换结果汇总 */
export interface postGameCouponsGameIdRedeemResAccountResults {
  account?: postGameCouponsGameIdRedeemResAccountResultsAccount
  /** 已使用数量 */
  alreadyUsed?: number
  /** 失败数量 */
  failed?: number
  results?: postGameCouponsGameIdRedeemResAccountResultsResults[]
  /** 成功数量 */
  success?: number
}

/**
 * @description GameCoupons/获取当前用户托管账号列表--接口请求Query参数
 * @url GET /game-coupons/{gameId}/accounts
 */
export interface getGameCouponsGameIdAccountsQuery {
  /** 图鉴 ID（可选） */
  compendium_id?: string
}

/**
 * @description GameCoupons/获取当前用户托管账号列表--接口返回值
 * @url GET /game-coupons/{gameId}/accounts
 */
export interface getGameCouponsGameIdAccountsRes {
  accounts?: getGameCouponsGameIdAccountsResAccounts[]
  compendiumId?: string
  gameId?: string
}

/** 托管账号对象 */
export interface getGameCouponsGameIdAccountsResAccounts {
  /** Hive ID 脱敏值（如 123****789），用于前端展示 */
  accountIdMasked?: string
  /** 用户自定义账号备注名 */
  accountLabel?: string
  /** 是否开启自动兑换托管 */
  autoRedeemEnabled?: boolean
  /** 账号记录 ID（MongoDB ObjectId） */
  id?: string
  /** 是否为默认账号 */
  isDefault?: boolean
  /** 最近一次兑换时间 */
  lastRedeemAt?: any
  /** 最近一次官方验证时间 */
  lastVerifiedAt?: any
  /** 游戏内昵称（wizard_name），通过官方 checkUser 接口获取 */
  nickname?: string
  /** 昵称是否可用（true=已通过官方验证获取到昵称） */
  profileAvailable?: boolean
  /** 区服：global | korea | japan | china | asia | europe */
  server?: 'global' | 'korea' | 'japan' | 'china' | 'asia' | 'europe'
  /** 账号状态：active=正常 | invalid=无效 | pending=待验证 | disabled=已停用 */
  status?: 'active' | 'invalid' | 'pending' | 'disabled'
}

/**
 * @description GameCoupons/添加托管账号--接口请求Query参数
 * @url POST /game-coupons/{gameId}/accounts
 */
export interface postGameCouponsGameIdAccountsQuery {
  /** 图鉴 ID（可选） */
  compendium_id?: string
}

/**
 * @description GameCoupons/添加托管账号--接口请求Body参数
 * @url POST /game-coupons/{gameId}/accounts
 */
export interface postGameCouponsGameIdAccountsBody {
  /** Hive ID（与 account_id 二选一，必填其一） */
  accountId?: string
  /** 自定义备注名（可选，最长 50 字符） */
  accountLabel?: string
  /** Hive ID（与 accountId 二选一） */
  account_id?: string
  /** 区服 */
  server: 'global' | 'korea' | 'japan' | 'china' | 'asia' | 'europe'
}

/**
 * @description GameCoupons/添加托管账号--接口返回值
 * @url POST /game-coupons/{gameId}/accounts
 */
export type postGameCouponsGameIdAccountsRes = string

/**
 * @description GameCoupons/获取单个托管账号详情--接口路径参数
 * @url GET /game-coupons/{gameId}/accounts/{accountId}
 */
export interface getGameIdAccountsAccountIdPathQuery {
  /** 游戏标识 */
  gameId: string
  /** 托管账号记录 ID（MongoDB ObjectId） */
  accountId: string
}

/**
 * @description GameCoupons/获取单个托管账号详情--接口返回值
 * @url GET /game-coupons/{gameId}/accounts/{accountId}
 */
export interface getGameIdAccountsAccountIdRes {
  /** Hive ID 脱敏值（如 123****789），用于前端展示 */
  accountIdMasked?: string
  /** 用户自定义账号备注名 */
  accountLabel?: string
  /** 是否开启自动兑换托管 */
  autoRedeemEnabled?: boolean
  /** 账号记录 ID（MongoDB ObjectId） */
  id?: string
  /** 是否为默认账号 */
  isDefault?: boolean
  /** 最近一次兑换时间 */
  lastRedeemAt?: any
  /** 最近一次官方验证时间 */
  lastVerifiedAt?: any
  /** 游戏内昵称（wizard_name），通过官方 checkUser 接口获取 */
  nickname?: string
  /** 昵称是否可用（true=已通过官方验证获取到昵称） */
  profileAvailable?: boolean
  /** 区服：global | korea | japan | china | asia | europe */
  server?: 'global' | 'korea' | 'japan' | 'china' | 'asia' | 'europe'
  /** 账号状态：active=正常 | invalid=无效 | pending=待验证 | disabled=已停用 */
  status?: 'active' | 'invalid' | 'pending' | 'disabled'
}

/**
 * @description GameCoupons/更新托管账号信息--接口路径参数
 * @url PATCH /game-coupons/{gameId}/accounts/{accountId}
 */
export interface patchGameIdAccountsAccountIdPathQuery {
  /** 游戏标识 */
  gameId: string
  /** 托管账号记录 ID */
  accountId: string
}

/**
 * @description GameCoupons/更新托管账号信息--接口请求Body参数
 * @url PATCH /game-coupons/{gameId}/accounts/{accountId}
 */
export interface patchGameIdAccountsAccountIdBody {
  /** 修改 Hive ID（修改后昵称会被清空，需重新验证） */
  accountId?: string
  /** 修改备注名 */
  accountLabel?: string
  /** 修改 Hive ID（与 accountId 等价） */
  account_id?: string
  /** 开关自动兑换 */
  autoRedeemEnabled?: boolean
  /** 设为默认账号 */
  isDefault?: boolean
  /** 修改区服 */
  server?: 'global' | 'korea' | 'japan' | 'china' | 'asia' | 'europe'
}

/**
 * @description GameCoupons/更新托管账号信息--接口返回值
 * @url PATCH /game-coupons/{gameId}/accounts/{accountId}
 */
export interface patchGameIdAccountsAccountIdRes {
  /** Hive ID 脱敏值（如 123****789），用于前端展示 */
  accountIdMasked?: string
  /** 用户自定义账号备注名 */
  accountLabel?: string
  /** 是否开启自动兑换托管 */
  autoRedeemEnabled?: boolean
  /** 账号记录 ID（MongoDB ObjectId） */
  id?: string
  /** 是否为默认账号 */
  isDefault?: boolean
  /** 最近一次兑换时间 */
  lastRedeemAt?: any
  /** 最近一次官方验证时间 */
  lastVerifiedAt?: any
  /** 游戏内昵称（wizard_name），通过官方 checkUser 接口获取 */
  nickname?: string
  /** 昵称是否可用（true=已通过官方验证获取到昵称） */
  profileAvailable?: boolean
  /** 区服：global | korea | japan | china | asia | europe */
  server?: 'global' | 'korea' | 'japan' | 'china' | 'asia' | 'europe'
  /** 账号状态：active=正常 | invalid=无效 | pending=待验证 | disabled=已停用 */
  status?: 'active' | 'invalid' | 'pending' | 'disabled'
}

/**
 * @description GameCoupons/删除托管账号--接口路径参数
 * @url DELETE /game-coupons/{gameId}/accounts/{accountId}
 */
export interface deleteGameIdAccountsAccountIdPathQuery {
  /** 游戏标识 */
  gameId: string
  /** 托管账号记录 ID */
  accountId: string
}

/**
 * @description GameCoupons/删除托管账号--接口返回值
 * @url DELETE /game-coupons/{gameId}/accounts/{accountId}
 */
export type deleteGameIdAccountsAccountIdRes = string

/**
 * @description GameCoupons/验证托管账号有效性--接口路径参数
 * @url POST /game-coupons/{gameId}/accounts/{accountId}/verify
 */
export interface postAccountsAccountIdVerifyPathQuery {
  /** 游戏标识 */
  gameId: string
  /** 托管账号记录 ID */
  accountId: string
}

/**
 * @description GameCoupons/验证托管账号有效性--接口返回值
 * @url POST /game-coupons/{gameId}/accounts/{accountId}/verify
 */
export type postAccountsAccountIdVerifyRes = string

/**
 * @description GameCoupons/设置自动兑换开关--接口路径参数
 * @url POST /game-coupons/{gameId}/accounts/{accountId}/auto-redeem
 */
export interface postAccountsAccountIdAutoRedeemPathQuery {
  /** 游戏标识 */
  gameId: string
  /** 托管账号记录 ID */
  accountId: string
}

/**
 * @description GameCoupons/设置自动兑换开关--接口请求Body参数
 * @url POST /game-coupons/{gameId}/accounts/{accountId}/auto-redeem
 */
export interface postAccountsAccountIdAutoRedeemBody {
  /** true=开启自动兑换 | false=关闭 */
  enabled: boolean
}

/**
 * @description GameCoupons/设置自动兑换开关--接口返回值
 * @url POST /game-coupons/{gameId}/accounts/{accountId}/auto-redeem
 */
export interface postAccountsAccountIdAutoRedeemRes {
  /** Hive ID 脱敏值（如 123****789），用于前端展示 */
  accountIdMasked?: string
  /** 用户自定义账号备注名 */
  accountLabel?: string
  /** 是否开启自动兑换托管 */
  autoRedeemEnabled?: boolean
  /** 账号记录 ID（MongoDB ObjectId） */
  id?: string
  /** 是否为默认账号 */
  isDefault?: boolean
  /** 最近一次兑换时间 */
  lastRedeemAt?: any
  /** 最近一次官方验证时间 */
  lastVerifiedAt?: any
  /** 游戏内昵称（wizard_name），通过官方 checkUser 接口获取 */
  nickname?: string
  /** 昵称是否可用（true=已通过官方验证获取到昵称） */
  profileAvailable?: boolean
  /** 区服：global | korea | japan | china | asia | europe */
  server?: 'global' | 'korea' | 'japan' | 'china' | 'asia' | 'europe'
  /** 账号状态：active=正常 | invalid=无效 | pending=待验证 | disabled=已停用 */
  status?: 'active' | 'invalid' | 'pending' | 'disabled'
}

/**
 * @description GameCoupons/获取兑换记录列表--接口请求Query参数
 * @url GET /game-coupons/{gameId}/redeem-records
 */
export interface getGameCouponsGameIdRedeemRecordsQuery {
  /** 按兑换结果状态筛选：
- `success` - 兑换成功
- `already_used` - 已使用
- `invalid_coupon` - 券码无效/不存在/已过期
- `invalid_id` - Hive ID 无效
- `failed` - 失败
- `pending` - 等待处理
- `redeeming` - 执行中
 */
  resultStatus?: string
  /** 按券码筛选 */
  couponCode?: string
  /** 图鉴 ID（可选） */
  compendium_id?: string
  /** 排序字段（如 redeemedAt:desc） example: redeemedAt:desc */
  sortBy?: string
  /** 每页数量 */
  limit?: number
  /** 页码 */
  page?: number
}

/**
 * @description GameCoupons/获取兑换记录列表--接口返回值
 * @url GET /game-coupons/{gameId}/redeem-records
 */
export interface getGameCouponsGameIdRedeemRecordsRes {
  /** 每页数量 */
  limit?: number
  /** 当前页码 */
  page?: number
  results?: getGameCouponsGameIdRedeemRecordsResResults[]
  /** 总页数 */
  totalPages?: number
  /** 总记录数 */
  totalResults?: number
}

/** 兑换记录 */
export interface getGameCouponsGameIdRedeemRecordsResResults {
  /** Hive ID 脱敏值 */
  accountIdMasked?: string
  /** 券码 */
  couponCode?: string
  /** 记录 ID */
  id?: string
  /** 兑换执行时间 */
  redeemedAt?: string
  /** 官方原始返回码标识（如 official_100, official_303） */
  resultCode?: string
  /** 结果消息（可能为官方原文或系统翻译） */
  resultMessage?: string
  /** 兑换结果状态：success | already_used | invalid_coupon | invalid_id | failed */
  resultStatus?:
    | 'success'
    | 'already_used'
    | 'invalid_coupon'
    | 'invalid_id'
    | 'failed'
    | 'pending'
    | 'redeeming'
  /** 兑换时使用的区服 */
  server?: 'global' | 'korea' | 'japan' | 'china' | 'asia' | 'europe'
}

/**
 * @description GameCoupons/获取兑换统计--接口请求Query参数
 * @url GET /game-coupons/{gameId}/redeem-records/summary
 */
export interface getGameIdRedeemRecordsSummaryQuery {
  /** 图鉴 ID（可选） */
  compendium_id?: string
}

/**
 * @description GameCoupons/获取兑换统计--接口返回值
 * @url GET /game-coupons/{gameId}/redeem-records/summary
 */
export interface getGameIdRedeemRecordsSummaryRes {
  /** 已使用次数 */
  alreadyUsed?: number
  /** 失败次数 */
  failed?: number
  gameId?: string
  /** 成功次数 */
  success?: number
  /** 总兑换次数 */
  total?: number
}
