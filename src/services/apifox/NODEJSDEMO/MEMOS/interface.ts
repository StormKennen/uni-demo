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
  results?: getMemosResResultsItem[]
  totalPages?: number
  totalResults?: number
}

/** getMemosResResults */
export interface getMemosResResultsItem {}

/**
 * @description Memos/Get all tags--接口返回值
 * @url GET /memos/tags
 */
export type getMemosTagsRes = string[][]

/**
 * @description Memos/Batch update memos--接口请求Body参数
 * @url PATCH /memos/batch
 */
export interface patchMemosBatchBody {
  memo_ids: string[]
  updates: patchMemosBatchBodyUpdates
}

/** patchMemosBatchBodyUpdates */
export interface patchMemosBatchBodyUpdates {}

/**
 * @description Memos/Batch update memos--接口返回值
 * @url PATCH /memos/batch
 */
export interface patchMemosBatchRes {}

/**
 * @description Memos/Get a memo--接口返回值
 * @url GET /memos/{memoId}
 */
export interface getMemosMemoIdRes {}

/**
 * @description Memos/Update a memo--接口请求Body参数
 * @url PATCH /memos/{memoId}
 */
export type patchMemosMemoIdBody = any

/**
 * @description Memos/Update a memo--接口返回值
 * @url PATCH /memos/{memoId}
 */
export interface patchMemosMemoIdRes {}

/**
 * @description Memos/Delete a memo--接口返回值
 * @url DELETE /memos/{memoId}
 */
export type deleteMemosMemoIdRes = string

/**
 * @description Memos/Archive a memo--接口返回值
 * @url POST /memos/{memoId}/archive
 */
export interface postMemosMemoIdArchiveRes {}

/**
 * @description Memos/Restore a memo--接口返回值
 * @url POST /memos/{memoId}/restore
 */
export interface postMemosMemoIdRestoreRes {}

/**
 * @description Memos/Toggle pin status--接口返回值
 * @url POST /memos/{memoId}/pin
 */
export interface postMemosMemoIdPinRes {}

/**
 * @description Memos/Toggle favorite status--接口返回值
 * @url POST /memos/{memoId}/favorite
 */
export interface postMemosMemoIdFavoriteRes {}

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
export interface postMemosMemoIdMoveRes {}

/**
 * @description Memos/Permanently delete a memo--接口返回值
 * @url DELETE /memos/{memoId}/permanent
 */
export type deleteMemosMemoIdPermanentRes = string

/**
 * @description Memos/Get memo statistics--接口返回值
 * @url GET /memos/stats
 */
export interface getMemosStatsRes {
  active?: number
  archived?: number
  deleted?: number
  favorite?: number
  folderStats?: getMemosStatsResFolderStats
  pinned?: number
  recentWeek?: number
  topTags?: getMemosStatsResTopTagsItem[]
  total?: number
}

/** 各文件夹备忘录数量 */
export interface getMemosStatsResFolderStats {}

/** 热门标签（前10个） */
export interface getMemosStatsResTopTagsItem {
  count?: number
  tag?: string
}
