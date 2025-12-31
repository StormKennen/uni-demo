/**
 * 备忘录 API 包装层
 * 修复 apifox 生成的 API 中路径参数未正确替换的问题
 */
import http from '@/services/http'
import type { ParticalUniAppRequestOptions } from '@/services/interface'
import type {
  deleteMemosMemoIdPermanentRes,
  deleteMemosMemoIdRes,
  getMemosMemoIdRes,
  patchMemosMemoIdBody,
  patchMemosMemoIdRes,
  postMemosMemoIdArchiveRes,
  postMemosMemoIdFavoriteRes,
  postMemosMemoIdMoveBody,
  postMemosMemoIdMoveRes,
  postMemosMemoIdPinRes,
  postMemosMemoIdRestoreRes,
} from './apifox/NODEJSDEMO/MEMOS/interface'

type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

/**
 * @description 获取单个备忘录（需要登录）
 */
export const getMemoById = async (
  memoId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getMemosMemoIdRes>> => {
  return http.get(`/memos/${memoId}`, {}, config)
}

/**
 * @description 获取公开的备忘录详情（无需登录）
 * 用于分享链接访问
 */
export const getPublicMemoById = async (
  memoId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<getMemosMemoIdRes>> => {
  return http.get(`/memos/${memoId}/public`, {}, config)
}

/**
 * @description 更新备忘录
 */
export const updateMemo = async (
  memoId: string,
  data: Expand<patchMemosMemoIdBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<patchMemosMemoIdRes>> => {
  return http.patch(`/memos/${memoId}`, data, config)
}

/**
 * @description 删除备忘录（软删除）
 */
export const deleteMemo = async (
  memoId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<deleteMemosMemoIdRes>> => {
  return http.delete(`/memos/${memoId}`, {}, config)
}

/**
 * @description 归档备忘录
 */
export const archiveMemo = async (
  memoId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postMemosMemoIdArchiveRes>> => {
  return http.post(`/memos/${memoId}/archive`, {}, config)
}

/**
 * @description 恢复备忘录
 */
export const restoreMemo = async (
  memoId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postMemosMemoIdRestoreRes>> => {
  return http.post(`/memos/${memoId}/restore`, {}, config)
}

/**
 * @description 切换置顶状态
 */
export const toggleMemoPin = async (
  memoId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postMemosMemoIdPinRes>> => {
  return http.post(`/memos/${memoId}/pin`, {}, config)
}

/**
 * @description 切换收藏状态
 */
export const toggleMemoFavorite = async (
  memoId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postMemosMemoIdFavoriteRes>> => {
  return http.post(`/memos/${memoId}/favorite`, {}, config)
}

/**
 * @description 移动备忘录到文件夹
 */
export const moveMemoToFolder = async (
  memoId: string,
  data: Expand<postMemosMemoIdMoveBody>,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<postMemosMemoIdMoveRes>> => {
  return http.post(`/memos/${memoId}/move`, data, config)
}

/**
 * @description 永久删除备忘录
 */
export const permanentlyDeleteMemo = async (
  memoId: string,
  config?: Expand<ParticalUniAppRequestOptions>,
): Promise<Expand<deleteMemosMemoIdPermanentRes>> => {
  return http.delete(`/memos/${memoId}/permanent`, {}, config)
}
