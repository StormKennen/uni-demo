export interface SelectedFile {
  name: string
  path: string
  size?: number
  type?: string
  /** H5 保留浏览器 File，微信端使用 path。仅当前页面内存使用。 */
  raw?: unknown
}

export interface PickImageOptions {
  count?: number
  sizeType?: Array<'original' | 'compressed'>
  sourceType?: Array<'album' | 'camera'>
}

export interface PickFileOptions {
  count?: number
  extensions?: string[]
  type?: 'all' | 'file' | 'image' | 'video'
}

export interface FilePicker {
  pickImage(options?: PickImageOptions): Promise<SelectedFile[]>
  pickFile(options?: PickFileOptions): Promise<SelectedFile[]>
}
