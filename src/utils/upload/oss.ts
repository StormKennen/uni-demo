import { uploadWithOssSignature } from '@/hooks/use-oss-upload'

export async function uploadToOss(fileUrl: string | File, isPrivate = true): Promise<{ url: string }> {
  const dirName = isPrivate ? 'private/uni-app-files/' : 'common/uni-app-files/'
  return { url: await uploadWithOssSignature(fileUrl, { dirName }) }
}
