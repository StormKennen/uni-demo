import { http } from '@/utils/http'

// 备忘录相关接口
export interface MemoData {
  id?: string
  name: string
  title: {
    value: string
    style: {
      bold?: boolean
      italic?: boolean
      fontSize?: number
    }
  }
  content: any[]
  folder_id?: string | null
  tags?: string[]
  is_pinned?: boolean
  is_favorite?: boolean
  color?: string
  reminder_time?: string | null
  status?: 'active' | 'archived' | 'deleted'
}

export interface MemoListParams {
  page?: number
  limit?: number
  folder_id?: string
  status?: 'active' | 'archived' | 'deleted'
  is_pinned?: boolean
  is_favorite?: boolean
  tags?: string | string[]
  search?: string
  sortBy?: string
}

export interface MemoListResponse {
  results: MemoData[]
  page: number
  limit: number
  totalPages: number
  totalResults: number
}

// 文件夹相关接口
export interface FolderData {
  id?: string
  name: string
  parent_id?: string | null
  order?: number
  icon?: string
  color?: string
  description?: string
  level?: number
  children?: FolderData[]
}

/**
 * 创建备忘录
 */
export const createMemo = (data: Omit<MemoData, 'id'>) => {
  return http<MemoData>({
    url: '/memos',
    method: 'POST',
    data,
  })
}

/**
 * 获取备忘录列表
 */
export const getMemos = (params: MemoListParams) => {
  return http<MemoListResponse>({
    url: '/memos',
    method: 'GET',
    data: params,
  })
}

/**
 * 获取备忘录详情
 */
export const getMemo = (id: string) => {
  return http<MemoData>({
    url: `/memos/${id}`,
    method: 'GET',
  })
}

/**
 * 更新备忘录
 */
export const updateMemo = (id: string, data: Partial<MemoData>) => {
  return http<MemoData>({
    url: `/memos/${id}`,
    method: 'PATCH',
    data,
  })
}

/**
 * 删除备忘录（软删除）
 */
export const deleteMemo = (id: string) => {
  return http({
    url: `/memos/${id}`,
    method: 'DELETE',
  })
}

/**
 * 永久删除备忘录
 */
export const permanentlyDeleteMemo = (id: string) => {
  return http({
    url: `/memos/${id}/permanent`,
    method: 'DELETE',
  })
}

/**
 * 归档备忘录
 */
export const archiveMemo = (id: string) => {
  return http<MemoData>({
    url: `/memos/${id}/archive`,
    method: 'POST',
  })
}

/**
 * 恢复备忘录
 */
export const restoreMemo = (id: string) => {
  return http<MemoData>({
    url: `/memos/${id}/restore`,
    method: 'POST',
  })
}

/**
 * 切换置顶状态
 */
export const togglePin = (id: string) => {
  return http<MemoData>({
    url: `/memos/${id}/pin`,
    method: 'POST',
  })
}

/**
 * 切换收藏状态
 */
export const toggleFavorite = (id: string) => {
  return http<MemoData>({
    url: `/memos/${id}/favorite`,
    method: 'POST',
  })
}

/**
 * 移动备忘录到文件夹
 */
export const moveToFolder = (id: string, folderId: string | null) => {
  return http<MemoData>({
    url: `/memos/${id}/move`,
    method: 'POST',
    data: { folder_id: folderId },
  })
}

/**
 * 获取所有标签
 */
export const getTags = () => {
  return http<string[]>({
    url: '/memos/tags',
    method: 'GET',
  })
}

/**
 * 批量更新备忘录
 */
export const batchUpdateMemos = (memoIds: string[], updates: Partial<MemoData>) => {
  return http({
    url: '/memos/batch',
    method: 'PATCH',
    data: {
      memo_ids: memoIds,
      updates,
    },
  })
}

// ==================== 文件夹相关 ====================

/**
 * 创建文件夹
 */
export const createFolder = (data: Omit<FolderData, 'id' | 'level' | 'children'>) => {
  return http<FolderData>({
    url: '/memo-folders',
    method: 'POST',
    data,
  })
}

/**
 * 获取文件夹列表
 */
export const getFolders = (params?: { parent_id?: string | null; tree?: boolean }) => {
  return http<FolderData[]>({
    url: '/memo-folders',
    method: 'GET',
    data: params,
  })
}

/**
 * 获取文件夹详情
 */
export const getFolder = (id: string) => {
  return http<FolderData>({
    url: `/memo-folders/${id}`,
    method: 'GET',
  })
}

/**
 * 更新文件夹
 */
export const updateFolder = (id: string, data: Partial<FolderData>) => {
  return http<FolderData>({
    url: `/memo-folders/${id}`,
    method: 'PATCH',
    data,
  })
}

/**
 * 删除文件夹
 */
export const deleteFolder = (id: string) => {
  return http({
    url: `/memo-folders/${id}`,
    method: 'DELETE',
  })
}

/**
 * 获取文件夹统计
 */
export const getFolderStats = () => {
  return http<Record<string, number>>({
    url: '/memo-folders/stats',
    method: 'GET',
  })
}
