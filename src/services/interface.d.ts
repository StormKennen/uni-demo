

export interface Options extends UniApp.RequestOptions {
  baseURL: string
  params?: Record<string, string | number | boolean | undefined>
}

export type ParticalUniAppRequestOptions = Partial<Options>
