/**
 * @description PdfToolkit/上传文件到 PDF 工具箱--接口请求Body参数
 * @url POST /pdf-toolkit/files
 */
export interface postPdfToolkitFilesBody {
  file: string
}

/**
 * @description PdfToolkit/上传文件到 PDF 工具箱--接口返回值
 * @url POST /pdf-toolkit/files
 */
export interface postPdfToolkitFilesRes {
  fileId?: string
  mimeType?: string
  originalName?: string
  size?: number
  url?: string
}

/**
 * @description PdfToolkit/创建 PDF 处理任务--接口请求Body参数
 * @url POST /pdf-toolkit/tasks
 */
export interface postPdfToolkitTasksBody {
  fileIds: string[]
  options?: postPdfToolkitTasksBodyOptions
  type: 'images-to-pdf' | 'merge' | 'split' | 'compress'
}

/** postPdfToolkitTasksBodyOptions */
export interface postPdfToolkitTasksBodyOptions {
  orientation?: 'portrait' | 'landscape'
  pageSize?: 'a4' | 'auto'
  quality?: 'low' | 'medium' | 'high'
  splitRanges?: string
}

/**
 * @description PdfToolkit/创建 PDF 处理任务--接口返回值
 * @url POST /pdf-toolkit/tasks
 */
export interface postPdfToolkitTasksRes {
  progress?: number
  status?: 'pending' | 'processing' | 'success' | 'failed'
  taskId?: string
}

/**
 * @description PdfToolkit/获取当前用户的任务列表--接口请求Query参数
 * @url GET /pdf-toolkit/tasks
 */
export interface getPdfToolkitTasksQuery {
  page?: number

  pageSize?: number
}

/**
 * @description PdfToolkit/获取当前用户的任务列表--接口返回值
 * @url GET /pdf-toolkit/tasks
 */
export type getPdfToolkitTasksRes = object

/**
 * @description PdfToolkit/查询任务状态与结果--接口返回值
 * @url GET /pdf-toolkit/tasks/{taskId}
 */
export interface getPdfToolkitTasksTaskIdRes {
  errorMessage?: string
  message?: string
  progress?: number
  result?: any
  status?: string
  taskId?: string
  type?: string
}
