export interface MemoDetailPathOptions {
  id: string
  shareToken?: string
  mode?: 'public' | 'private' | 'admin'
  readonly?: boolean
}

export const buildMemoDetailPath = ({ id, shareToken, mode, readonly }: MemoDetailPathOptions): string => {
  const query: string[] = [`id=${encodeURIComponent(id)}`]
  if (shareToken) query.push(`shareToken=${encodeURIComponent(shareToken)}`)
  if (mode && mode !== 'public') query.push(`mode=${mode}`)
  if (readonly) query.push('readonly=1')
  return `/subPackages/tools/memo/detail?${query.join('&')}`
}
