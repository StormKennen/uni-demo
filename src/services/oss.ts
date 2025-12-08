import http from '@/services/http'

/**
 * 生成默认的 OSS 文件 key
 * @param fileName 原始文件名
 * @returns 格式化的 OSS key
 */
export function generateDefaultOssKey(fileName: string): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const timestamp = now.getTime()
  const random = Math.random().toString(36).substring(2, 8)
  const ext = fileName.includes('.') ? fileName.substring(fileName.lastIndexOf('.')) : ''
  return `uploads/${year}${month}${day}/${timestamp}_${random}${ext}`
}

export interface UserFileItem {
  id?: string
  name: string
  url: string
  size?: number
  remark?: string
  uploadedAt?: string | number
}

export interface GetUserFileListParams {
  page: number
  pageSize: number
}

export interface GetUserFileListRes {
  list: UserFileItem[]
  total?: number
  page?: number
  pageSize?: number
}

export const getUserFileList = async (params: GetUserFileListParams): Promise<GetUserFileListRes> => {
  const baseURL = import.meta.env.VITE_APP_OSS_HOST
  const data: any = await http.get('/oss/storage/listUserFiles', params, { baseURL })
  const list: UserFileItem[] = Array.isArray(data?.list) ? data.list : Array.isArray(data) ? data : []
  const total = typeof data?.total === 'number' ? data.total : undefined
  const page = typeof data?.page === 'number' ? data.page : params.page
  const pageSize = typeof data?.pageSize === 'number' ? data.pageSize : params.pageSize
  return { list, total, page, pageSize }
}

export const getFileDownloadLink = async (fileUrl: string): Promise<string> => {
  const baseURL = import.meta.env.VITE_APP_OSS_HOST
  const data: any = await http.get('/oss/storage/getTempUrl', { fileUrl }, { baseURL })
  const url: string = typeof data === 'string' ? data : data?.url || ''
  return url
}