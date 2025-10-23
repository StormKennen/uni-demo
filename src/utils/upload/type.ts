
export type Platform = 'web' | 'wechat' | 'app';

export type UploadMethod = 'camera' | 'album' | 'filePicker' | 'wechatFile';

export interface UploadStrategy {
  selectFile(options?: Record<string, any>): Promise<File | string>;
  uploadFile(file: File | string, isOssPrivate: boolean): Promise<string>;
  cdpUploadFile(fileUrl: string | File, params: cdpFileUploadParams, isOssPrivate: boolean): Promise<cdpFileUploadRes>;
}

export type UploadOptions = {
  isOssPrivate?: boolean
  onBeforeSelectFile?: () => Promise<any>
  onAfterSelectFile?: (file: string | File) => Promise<any>
  onUploadToOssStart?: () => void
  onUploadToOssFail?: () => void
  [k: string]: any
}

export interface cdpFileUploadParams {
  file?: string
  fileType?: string
  belongUserId?: string
  caller?: string
  service?: string
  [key: string]: any
}

export interface cdpFileUploadRes {
  url: string
  fileName: string
  fileId: string
  fileSuffix: string
  createdAt: string
}