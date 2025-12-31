/**
 * @description Files/获取文件列表--接口请求Query参数
 * @url GET /files
 */
export interface getFilesQuery {
  pageSize?: number
  pageNumber?: number
  /** 仅管理员可指定，普通用户自动限制为自己 */
  created_by?: string
  /** 模糊搜索文件名 */
  keyword?: string
  /** 文件夹路径过滤 */
  folder?: string
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
  folder?: string
  is_shared?: boolean
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
  folder?: string
  note?: string
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
  folder?: string
  note?: string
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

/** 文件夹列表项 */
export interface FolderItem {
  folder: string
  count: number
}

/** 文件夹树形节点 */
export interface FolderTreeNode {
  id: string
  name: string
  path: string
  count: number
  totalCount: number
  children: FolderTreeNode[]
}

/** 获取文件夹列表返回值 */
export type getFilesFoldersRes = FolderItem[]

/** 获取文件夹树形结构返回值 */
export type getFilesFoldersTreeRes = FolderTreeNode
