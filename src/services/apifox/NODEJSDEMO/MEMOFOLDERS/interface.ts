/**
 * @description MemoFolders/Create a folder--接口请求Body参数
 * @url POST /memo-folders
 */
export interface postMemoFoldersBody {
  color?: string
  description?: string
  icon?: string
  name: string
  order?: number
  parent_id?: string
}

/**
 * @description MemoFolders/Create a folder--接口返回值
 * @url POST /memo-folders
 */
export type postMemoFoldersRes = string

/**
 * @description MemoFolders/Get all folders--接口请求Query参数
 * @url GET /memo-folders
 */
export interface getMemoFoldersQuery {
  parent_id?: string

  tree?: string
}

/**
 * @description MemoFolders/Get all folders--接口返回值
 * @url GET /memo-folders
 */
export interface getMemoFoldersRes {}

/**
 * @description MemoFolders/Get folder statistics--接口返回值
 * @url GET /memo-folders/stats
 */
export interface getMemoFoldersStatsRes {}

/**
 * @description MemoFolders/Get a folder--接口返回值
 * @url GET /memo-folders/{folderId}
 */
export interface getMemoFoldersFolderIdRes {}

/**
 * @description MemoFolders/Update a folder--接口请求Body参数
 * @url PATCH /memo-folders/{folderId}
 */
export interface patchMemoFoldersFolderIdBody {
  color?: string
  description?: string
  icon?: string
  name?: string
  order?: number
  parent_id?: string
}

/**
 * @description MemoFolders/Update a folder--接口返回值
 * @url PATCH /memo-folders/{folderId}
 */
export interface patchMemoFoldersFolderIdRes {}

/**
 * @description MemoFolders/Delete a folder--接口返回值
 * @url DELETE /memo-folders/{folderId}
 */
export type deleteMemoFoldersFolderIdRes = string
