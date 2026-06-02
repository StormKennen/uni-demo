/**
 * @description Video/获取支持的平台列表--接口返回值
 * @url GET /video/platforms
 */
export interface getVideoPlatformsRes {
  platforms?: getVideoPlatformsResPlatformsItem[]
}

/** getVideoPlatformsResPlatforms */
export interface getVideoPlatformsResPlatformsItem {
  description?: string
  displayName?: string
  name?: string
}

/**
 * @description Video/处理视频去水印--接口请求Body参数
 * @url POST /video/process
 */
export interface postVideoProcessBody {
  /** 是否异步处理 */
  async?: boolean
  /** 任务优先级（数字越大优先级越高） */
  priority?: number
  /** 待处理的视频URL */
  videoUrl: string
}

/**
 * @description Video/处理视频去水印--接口返回值
 * @url POST /video/process
 */
export interface postVideoProcessRes {
  /** 处理后的视频下载链接 */
  downloadUrl?: string
  /** 视频平台信息 */
  platform?: { [key: string]: any }
  /** 视频信息 */
  videoInfo?: { [key: string]: any }
}

/**
 * @description Video/批量处理视频去水印--接口请求Body参数
 * @url POST /video/batch
 */
export interface postVideoBatchBody {
  /** 待处理的视频URL列表（最多10个） */
  videoUrls: string[]
}

/**
 * @description Video/批量处理视频去水印--接口返回值
 * @url POST /video/batch
 */
export type postVideoBatchRes = object

/**
 * @description Video/获取视频信息--接口请求Query参数
 * @url GET /video/info
 */
export interface getVideoInfoQuery {
  /** 视频URL */
  videoUrl: string
}

/**
 * @description Video/获取视频信息--接口返回值
 * @url GET /video/info
 */
export type getVideoInfoRes = object

/**
 * @description Video/获取服务状态--接口返回值
 * @url GET /video/status
 */
export type getVideoStatusRes = object

/**
 * @description Video/获取队列状态--接口返回值
 * @url GET /video/queue/status
 */
export interface getVideoQueueStatusRes {
  /** 正在处理的任务数 */
  active?: number
  /** 已完成的任务数 */
  completed?: number
  /** 失败的任务数 */
  failed?: number
  /** 等待中的任务数 */
  waiting?: number
}

/**
 * @description Video/获取任务状态--接口返回值
 * @url GET /video/task/{taskId}
 */
export interface getVideoTaskTaskIdRes {
  /** 错误信息（仅在failed状态时返回） */
  error?: string
  /** 进度百分比 */
  progress?: number
  /** 处理结果（仅在completed状态时返回） */
  result?: { [key: string]: any }
  status?: 'waiting' | 'active' | 'completed' | 'failed'
  taskId?: string
}

/**
 * @description Video/取消任务--接口返回值
 * @url DELETE /video/task/{taskId}
 */
export type deleteVideoTaskTaskIdRes = object

/**
 * @description Video/提取视频URL--接口请求Body参数
 * @url POST /video/extract-url
 */
export interface postVideoExtractUrlBody {
  /** 视频分享链接 */
  videoUrl: string
}

/**
 * @description Video/提取视频URL--接口返回值
 * @url POST /video/extract-url
 */
export interface postVideoExtractUrlRes {
  /** 作者 */
  author?: string
  /** 封面图片 */
  cover?: string
  /** 原始分享链接 */
  originalUrl?: string
  /** 平台标识 */
  platform?: string
  /** 平台名称 */
  platformName?: string
  /** 视频标题 */
  title?: string
  /** 提取的视频下载链接 */
  videoUrl?: string
}

/**
 * @description Video/代理下载无水印视频--接口请求Query参数
 * @url GET /video/download
 */
export interface getVideoDownloadQuery {
  /** 解析后得到的真实无水印视频直链 */
  url: string
}

/**
 * @description Video/代理下载无水印视频--接口返回值
 * @url GET /video/download
 */
export type getVideoDownloadRes = string
