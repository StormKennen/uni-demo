export interface SelectedFile {
  name: string
  path: string
  size?: number
  type?: string
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
