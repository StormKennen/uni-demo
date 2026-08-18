/**
 * @description Memos/Create a memo--接口请求Body参数
 * @url POST /memos
 */
export type postMemosBody = any

/**
 * @description Memos/Create a memo--接口返回值
 * @url POST /memos
 */
export type postMemosRes = string

/**
 * @description Memos/Get all memos--接口请求Query参数
 * @url GET /memos
 */
export interface getMemosQuery {
  /** 数据隔离视角。all=我创建的+分享给我的（默认）；owned=仅我创建的；shared=仅分享给我的 */
  viewScope?: string
  /** 按文件夹ID筛选 */
  folder_id?: string
  /** 按状态筛选，默认active */
  status?: string
  /** 筛选置顶备忘录 */
  is_pinned?: boolean
  /** 筛选收藏备忘录 */
  is_favorite?: boolean
  /** 按标签筛选（支持多个，用逗号分隔） */
  tags?: string
  /** 按标题模糊搜索 */
  title?: string
  /** 全文搜索（搜索名称、标签、内容） */
  search?: string
  /** 排序字段，格式 field:asc/desc，默认 is_pinned:desc,createdAt:desc */
  sortBy?: string
  /** 每页数量，默认10 */
  limit?: number
  /** 页码，默认1 */
  page?: number
}

/**
 * @description Memos/Get all memos--接口返回值
 * @url GET /memos
 */
export interface getMemosRes {
  limit?: number
  page?: number
  results?: any[]
  totalPages?: number
  totalResults?: number
}

/**
 * @description Memos/Get all tags--接口返回值
 * @url GET /memos/tags
 */
export type getMemosTagsRes = string[]

/**
 * @description Memos/Get memo statistics--接口返回值
 * @url GET /memos/stats
 */
export interface getMemosStatsRes {
  /** 活跃状态数量 */
  active?: number
  /** 已归档数量 */
  archived?: number
  /** 已删除数量 */
  deleted?: number
  /** 已收藏数量 */
  favorite?: number
  /** 各文件夹备忘录数量 */
  folderStats?: { [key: string]: any }
  /** 已置顶数量 */
  pinned?: number
  /** 最近7天创建数量 */
  recentWeek?: number
  /** 热门标签（前10个） */
  topTags?: getMemosStatsResTopTagsItem[]
  /** 活跃备忘录总数 */
  total?: number
}

/** 热门标签（前10个） */
export interface getMemosStatsResTopTagsItem {
  count?: number
  tag?: string
}

/**
 * @description Memos/Batch update memos--接口请求Body参数
 * @url PATCH /memos/batch
 */
export interface patchMemosBatchBody {
  memo_ids: string[]
  updates: { [key: string]: any }
}

/**
 * @description Memos/Batch update memos--接口返回值
 * @url PATCH /memos/batch
 */
export interface patchMemosBatchRes {
  modifiedCount?: number
}

/**
 * @description Memos/Get a memo--接口返回值
 * @url GET /memos/{memoId}
 */
export type getMemosMemoIdRes = string

/**
 * @description Memos/Update a memo--接口请求Body参数
 * @url PATCH /memos/{memoId}
 */
export type patchMemosMemoIdBody = any

/**
 * @description Memos/Update a memo--接口返回值
 * @url PATCH /memos/{memoId}
 */
export interface patchMemosMemoIdRes {
  color?: string
  content?: { [key: string]: any }[]
  createdAt?: string
  created_by?: string
  folder_id?: any
  id?: string
  is_favorite?: boolean
  is_pinned?: boolean
  name?: string
  reminder_time?: any
  shared_with?: string[]
  status?: 'active' | 'archived' | 'deleted'
  tags?: string[]
  updatedAt?: string
}

/**
 * @description Memos/Delete a memo--接口返回值
 * @url DELETE /memos/{memoId}
 */
export type deleteMemosMemoIdRes = string

/**
 * @description Memos/Get a public memo (no auth required)--接口请求Query参数
 * @url GET /memos/public/detail
 */
export interface getMemosPublicDetailQuery {
  /** 备忘录ID */
  id: string
  /** POST /memos/{memoId}/share 返回的随机分享凭证 */
  shareToken?: string
}

/**
 * @description Memos/Get a public memo (no auth required)--接口返回值
 * @url GET /memos/public/detail
 */
export interface getMemosPublicDetailRes {
  color?: string
  content?: { [key: string]: any }[]
  createdAt?: string
  created_by?: string
  folder_id?: any
  id?: string
  is_favorite?: boolean
  is_pinned?: boolean
  name?: string
  reminder_time?: any
  shared_with?: string[]
  status?: 'active' | 'archived' | 'deleted'
  tags?: string[]
  updatedAt?: string
}

/**
 * @description Memos/Archive a memo--接口返回值
 * @url POST /memos/{memoId}/archive
 */
export interface postMemosMemoIdArchiveRes {
  color?: string
  content?: { [key: string]: any }[]
  createdAt?: string
  created_by?: string
  folder_id?: any
  id?: string
  is_favorite?: boolean
  is_pinned?: boolean
  name?: string
  reminder_time?: any
  shared_with?: string[]
  status?: 'active' | 'archived' | 'deleted'
  tags?: string[]
  updatedAt?: string
}

/**
 * @description Memos/Restore a memo--接口返回值
 * @url POST /memos/{memoId}/restore
 */
export interface postMemosMemoIdRestoreRes {
  color?: string
  content?: { [key: string]: any }[]
  createdAt?: string
  created_by?: string
  folder_id?: any
  id?: string
  is_favorite?: boolean
  is_pinned?: boolean
  name?: string
  reminder_time?: any
  shared_with?: string[]
  status?: 'active' | 'archived' | 'deleted'
  tags?: string[]
  updatedAt?: string
}

/**
 * @description Memos/Toggle pin status--接口返回值
 * @url POST /memos/{memoId}/pin
 */
export interface postMemosMemoIdPinRes {
  color?: string
  content?: { [key: string]: any }[]
  createdAt?: string
  created_by?: string
  folder_id?: any
  id?: string
  is_favorite?: boolean
  is_pinned?: boolean
  name?: string
  reminder_time?: any
  shared_with?: string[]
  status?: 'active' | 'archived' | 'deleted'
  tags?: string[]
  updatedAt?: string
}

/**
 * @description Memos/Toggle favorite status--接口返回值
 * @url POST /memos/{memoId}/favorite
 */
export interface postMemosMemoIdFavoriteRes {
  color?: string
  content?: { [key: string]: any }[]
  createdAt?: string
  created_by?: string
  folder_id?: any
  id?: string
  is_favorite?: boolean
  is_pinned?: boolean
  name?: string
  reminder_time?: any
  shared_with?: string[]
  status?: 'active' | 'archived' | 'deleted'
  tags?: string[]
  updatedAt?: string
}

/**
 * @description Memos/Move memo to folder--接口请求Body参数
 * @url POST /memos/{memoId}/move
 */
export interface postMemosMemoIdMoveBody {
  folder_id?: string
}

/**
 * @description Memos/Move memo to folder--接口返回值
 * @url POST /memos/{memoId}/move
 */
export interface postMemosMemoIdMoveRes {
  color?: string
  content?: { [key: string]: any }[]
  createdAt?: string
  created_by?: string
  folder_id?: any
  id?: string
  is_favorite?: boolean
  is_pinned?: boolean
  name?: string
  reminder_time?: any
  shared_with?: string[]
  status?: 'active' | 'archived' | 'deleted'
  tags?: string[]
  updatedAt?: string
}

/**
 * @description Memos/Permanently delete a memo--接口返回值
 * @url DELETE /memos/{memoId}/permanent
 */
export type deleteMemosMemoIdPermanentRes = string

/**
 * @description Memos/Get a public memo (no auth required)--接口返回值
 * @url GET /memos/{memoId}/public
 */
export type getMemosMemoIdPublicRes = object

/**
 * @description Memos/[Admin] Get all memos (read-only)--接口请求Query参数
 * @url GET /admin/memos
 */
export interface getAdminMemosQuery {
  /** 按创建者用户ID筛选 */
  created_by?: string
  /** 按状态筛选（管理员不设默认状态，缺省返回全部状态） */
  status?: string
  /** 按文件夹ID筛选 */
  folder_id?: string
  /** 筛选置顶备忘录 */
  is_pinned?: boolean
  /** 筛选收藏备忘录 */
  is_favorite?: boolean
  /** 仅返回存在分享（shared_with 非空）的备忘录 */
  shared_only?: boolean
  /** 按标签筛选（支持多个） */
  tags?: string
  /** 搜索名称、标签 */
  search?: string
  /** 排序字段，格式 field:asc/desc，默认 createdAt:desc */
  sortBy?: string
  /** 每页数量，默认10 */
  limit?: number
  /** 页码，默认1 */
  page?: number
}

/**
 * @description Memos/[Admin] Get all memos (read-only)--接口返回值
 * @url GET /admin/memos
 */
export interface getAdminMemosRes {
  limit?: number
  page?: number
  results?: any[]
  totalPages?: number
  totalResults?: number
}

/**
 * @description Memos/[Admin] Get any memo (read-only)--接口返回值
 * @url GET /admin/memos/{memoId}
 */
export type getAdminMemosMemoIdRes = string

/**
 * @description Memos/Get memos received by the current guest--接口请求Query参数
 * @url GET /memos/public/list
 */
export interface getMemosPublicListQuery {
  search?: string

  sortBy?: string

  page?: number

  limit?: number
}

/**
 * @description Memos/Get memos received by the current guest--接口返回值
 * @url GET /memos/public/list
 */
export type getMemosPublicListRes = object

/**
 * @description Memos/Migrate guest memo shares to the logged-in user--接口返回值
 * @url POST /memos/guest/migrate
 */
export type postMemosGuestMigrateRes = object

/**
 * @description Memos/Enable sharing and get a share token--接口返回值
 * @url POST /memos/{memoId}/share
 */
export type postMemosMemoIdShareRes = object

/**
 * @description Memos/Disable sharing--接口返回值
 * @url DELETE /memos/{memoId}/share
 */
export type deleteMemosMemoIdShareRes = object
