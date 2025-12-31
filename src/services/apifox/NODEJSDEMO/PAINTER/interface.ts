/**
 * @description Painter/生成海报--接口请求Body参数
 * @url POST /painter/generate
 */
export interface postPainterGenerateBody {
  id: string
  options?: postPainterGenerateBodyOptions
  selector: string
  targetUrl: string
}

/** 可选配置 */
export interface postPainterGenerateBodyOptions {
  deviceScaleFactor?: number
  forceRefresh?: boolean
  height?: number
  readySelector?: string
  timeout?: number
  width?: number
}

/**
 * @description Painter/生成海报--接口返回值
 * @url POST /painter/generate
 */
export type postPainterGenerateRes = string

/**
 * @description Painter/生成海报（返回信息）--接口请求Body参数
 * @url POST /painter/generate/info
 */
export interface postPainterGenerateInfoBody {
  id: string
  options?: postPainterGenerateInfoBodyOptions
  selector: string
  targetUrl: string
}

/** postPainterGenerateInfoBodyOptions */
export interface postPainterGenerateInfoBodyOptions {}

/**
 * @description Painter/生成海报（返回信息）--接口返回值
 * @url POST /painter/generate/info
 */
export interface postPainterGenerateInfoRes {
  filename?: string
  fromCache?: boolean
  id?: string
}

/**
 * @description Painter/批量生成海报--接口请求Body参数
 * @url POST /painter/batch
 */
export interface postPainterBatchBody {
  tasks: postPainterBatchBodyTasksItem[]
}

/** postPainterBatchBodyTasksOptions */
export interface postPainterBatchBodyTasksOptions {}

/** postPainterBatchBodyTasks */
export interface postPainterBatchBodyTasksItem {
  id?: string
  options?: postPainterBatchBodyTasksOptions
  selector?: string
  targetUrl?: string
}

/**
 * @description Painter/批量生成海报--接口返回值
 * @url POST /painter/batch
 */
export interface postPainterBatchRes {}

/**
 * @description Painter/获取服务状态--接口返回值
 * @url GET /painter/status
 */
export interface getPainterStatusRes {
  activeLocks?: string[]
  browserConnected?: boolean
  platform?: string
  storageDir?: string
}

/**
 * @description Painter/清空所有缓存--接口返回值
 * @url DELETE /painter/cache/all
 */
export interface deletePainterCacheAllRes {
  deletedCount?: number
}

/**
 * @description Painter/获取缓存的海报--接口返回值
 * @url GET /painter/{id}
 */
export type getPainterIdRes = string

/**
 * @description Painter/删除缓存的海报--接口返回值
 * @url DELETE /painter/{id}
 */
export interface deletePainterIdRes {}
