/**
 * @description Files/获取文件列表--接口请求Query参数
 * @url GET /files
 */
export interface getFilesQuery {
  pageSize?: number

  pageNumber?: number
  /** 仅管理员可指定，普通用户自动限制为自己 */
  created_by?: string
}

/**
 * @description Files/获取文件列表--接口返回值
 * @url GET /files
 */
export interface getFilesRes {
  items?: getFilesResItems[]
  pagination?: getFilesResPagination
}

/** getFilesResItems */
export interface getFilesResItems {
  created_at?: number
  created_by?: string
  created_time?: string
  file_name?: string
  file_size?: number
  file_size_formatted?: string
  file_url?: string
  id?: string
  status?: 'active' | 'deleted'
}

/** getFilesResPagination */
export interface getFilesResPagination {
  hasNext?: boolean
  hasPrev?: boolean
  limit?: number
  page?: number
  total?: number
  totalPages?: number
}

/**
 * @description Files/创建文件记录--接口请求Body参数
 * @url POST /files
 */
export interface postFilesBody {
  file_name: string
  file_size: number
  file_url: string
}

/**
 * @description Files/创建文件记录--接口返回值
 * @url POST /files
 */
export interface postFilesRes {
  created_at?: number
  created_by?: string
  created_time?: string
  file_name?: string
  file_size?: number
  file_size_formatted?: string
  file_url?: string
  id?: string
  status?: 'active' | 'deleted'
}

/**
 * @description Files/获取文件详情--接口返回值
 * @url GET /files/{id}
 */
export interface getFilesIdRes {
  created_at?: number
  created_by?: string
  created_time?: string
  file_name?: string
  file_size?: number
  file_size_formatted?: string
  file_url?: string
  id?: string
  status?: 'active' | 'deleted'
}

/**
 * @description Files/更新文件记录--接口请求Body参数
 * @url PUT /files/{id}
 */
export interface putFilesIdBody {
  file_name?: string
}

/**
 * @description Files/更新文件记录--接口返回值
 * @url PUT /files/{id}
 */
export interface putFilesIdRes {
  created_at?: number
  created_by?: string
  created_time?: string
  file_name?: string
  file_size?: number
  file_size_formatted?: string
  file_url?: string
  id?: string
  status?: 'active' | 'deleted'
}

/**
 * @description Files/软删除文件记录--接口返回值
 * @url DELETE /files/{id}
 */
export interface deleteFilesIdRes {
  code?: number
  message?: string
  requestId?: string
  timestamp?: number
}

/**
 * @description Files/文件白名单分享--接口请求Body参数
 * @url PUT /files/{id}/share
 */
export interface putFilesIdShareBody {
  userIds?: string[]
}

/**
 * @description Files/文件白名单分享--接口返回值
 * @url PUT /files/{id}/share
 */
export interface putFilesIdShareRes {}

/**
 * @description Files/取消文件白名单分享--接口请求Body参数
 * @url DELETE /files/{id}/share
 */
export interface deleteFilesIdShareBody {
  userIds?: string[]
}

/**
 * @description Files/取消文件白名单分享--接口返回值
 * @url DELETE /files/{id}/share
 */
export interface deleteFilesIdShareRes {}
