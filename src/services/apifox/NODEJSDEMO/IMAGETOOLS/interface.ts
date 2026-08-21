/**
 * @description ImageTools/云端长截图拼接--接口请求Body参数
 * @url POST /image-tools/stitch
 */
export interface postImageToolsStitchBody {
  images: any[]

  mode?: string
  /** JSON 数组或逗号分隔，如 ["top","bottom"] */
  masks?: string
  /**   example: 750 */
  outputWidth?: number
  /**   example: 12 */
  gap?: number
  /**   example: #ffffff */
  backgroundColor?: string
}

/**
 * @description ImageTools/云端长截图拼接--接口返回值
 * @url POST /image-tools/stitch
 */
export interface postImageToolsStitchRes {
  fileName?: string
  fileSize?: number
  height?: number
  mimeType?: string
  url?: string
  width?: number
}

/**
 * @description ImageTools/图片上传合规处理--接口请求Body参数
 * @url POST /image-tools/compliance
 */
export interface postImageToolsComplianceBody {
  /** 原始图片，服务端会读取真实图片信息，单文件最大 10MB。 */
  image: string
  /**   example: jpeg */
  targetFormat?: string

  width?: number

  height?: number
  /**   example: cover */
  resizeMode?: string
  /** 目标文件大小下限，单位 bytes。 */
  minFileSize?: number
  /** 目标文件大小上限，单位 bytes。 */
  maxFileSize?: number
  /** JSON 字符串，0-1 oriented-normalized 坐标，基于 EXIF 方向修正后的图片；x/y 为起点，width/height 为区域比例。  example: {"x":0.1,"y":0.1,"width":0.8,"height":0.8} */
  crop?: string
}

/**
 * @description ImageTools/图片上传合规处理--接口返回值
 * @url POST /image-tools/compliance
 */
export interface postImageToolsComplianceRes {
  alreadyCompliant: boolean
  checks: postImageToolsComplianceResChecks
  original: postImageToolsComplianceResOriginal
  passed: boolean
  reason: any
  result: string
}

/** postImageToolsComplianceResChecksFileSize */
export interface postImageToolsComplianceResChecksFileSize {
  actual: any
  expected?: any
  max?: any
  min?: any
  passed: boolean
}

/** postImageToolsComplianceResChecks */
export interface postImageToolsComplianceResChecks {
  fileSize?: postImageToolsComplianceResChecksFileSize
  format?: postImageToolsComplianceResChecksFileSize
  height?: postImageToolsComplianceResChecksFileSize
  width?: postImageToolsComplianceResChecksFileSize
}

/** postImageToolsComplianceResOriginal */
export interface postImageToolsComplianceResOriginal {
  fileSize: number
  format: string
  height: number
  mimeType: string
  orientation?: any
  width: number
}
