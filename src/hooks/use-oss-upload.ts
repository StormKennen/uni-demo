import { getOssGetSignature } from '@/services/apifox/NODEJSDEMO/oSS/apifox'

export const OSS_UPLOAD_HOST = 'https://lzk-web.oss-cn-beijing.aliyuncs.com'

interface OssSignature {
  policy?: string
  signature?: string
  x_oss_signature_version?: string
  x_oss_credential?: string
  x_oss_date?: string
  security_token?: string
}

const getExtension = (file: string | File): string => {
  const source = typeof file === 'string' ? file : file.name
  const name = source.split('?')[0].split('/').pop() || ''
  return name.includes('.') ? name.substring(name.lastIndexOf('.') + 1).toLowerCase() : 'jpg'
}

const getFileName = (file: string | File, extension: string): string => {
  const source = typeof file === 'string' ? file : file.name
  const name = source.split('?')[0].split('/').pop() || ''
  return name || `${Date.now()}.${extension}`
}

export const getOssFormData = async (name: string, ext: string, dirName = 'common/uni-app-files/'): Promise<Record<string, string>> => {
  const signature = (await getOssGetSignature()) as OssSignature | null
  if (!signature?.policy || !signature.signature || !signature.x_oss_credential || !signature.x_oss_date) {
    throw new Error('上传凭证不可用，请稍后重试')
  }

  const formData: Record<string, string> = {
    policy: signature.policy,
    'x-oss-signature': signature.signature,
    'x-oss-signature-version': signature.x_oss_signature_version || 'OSS4-HMAC-SHA256',
    'x-oss-credential': signature.x_oss_credential,
    'x-oss-date': signature.x_oss_date,
    key: `${dirName}${name || `${Date.now()}.${ext}`}`,
  }
  if (signature.security_token) formData['x-oss-security-token'] = signature.security_token
  return formData
}

export const uploadWithOssSignature = async (
  file: string | File,
  options: { dirName?: string; fileName?: string } = {},
): Promise<string> => {
  const extension = getExtension(file)
  const fileName = options.fileName || getFileName(file, extension)
  const formData = await getOssFormData(fileName, extension, options.dirName)
  const uploadOptions = typeof file === 'string' ? { filePath: file } : { file }

  await new Promise<void>((resolve, reject) => {
    uni.uploadFile({
      ...uploadOptions,
      url: OSS_UPLOAD_HOST,
      name: 'file',
      timeout: 60 * 1000,
      formData,
      success: result => {
        if (result.statusCode >= 200 && result.statusCode < 300) {
          resolve()
          return
        }
        reject(result)
      },
      fail: reject,
    })
  })

  return `${OSS_UPLOAD_HOST}/${formData.key}`
}

export const useOssUpload = () => ({
  uploadFile: uploadWithOssSignature,
})
