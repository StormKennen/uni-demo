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
