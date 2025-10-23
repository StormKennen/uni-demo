import { isCdpUrl, getCdpFilePublicUrlSync } from './upload/cdpOss'
/**
 * OSS安全跳转链接,加密算法
 */
export const toOss = (url: string) => {
  if (!url || typeof url !== 'string') return ''
  url = url?.startsWith('https') ? url : url?.replace('http', 'https')
  if(isCdpUrl(url)) {
    console.log('CDP OSS URL', getCdpFilePublicUrlSync(url))
    return getCdpFilePublicUrlSync(url)
  } 
  return `${import.meta.env.VITE_APP_OSS_HOST}/oss/storage/getTempUrl?fileUrl=${url}`;
}

interface GetFilenameAndExtensionReturn {
  /** 文件名 */
  filename: string
  /** 文件名扩展名包含点号, 示例: .pdf | .jpg */
  extension: string
}

/**
 * 
 * @param contentUrl 
 * @returns extension 示例: '.pdf'
  */
export function getFilenameAndExtension(contentUrl: string): GetFilenameAndExtensionReturn {
  const url = contentUrl.includes('fileUrl') ? contentUrl.split('?')[1] : (contentUrl.includes('?')
    ? contentUrl.split('?')[0]
    : contentUrl);
  // 使用正则表达式匹配文件名和后缀
  // eslint-disable-next-line no-useless-escape
  const regex = /\/([^\/]+)(\.\w+)$/;
  const match = url.match(regex);
  if (match) {
    // match[1] 是文件名（不包含后缀），match[2] 是文件后缀
    return {
      filename: match[1],
      extension: match[2]?.toLowerCase() ?? '',
    };
  }
  return {
    filename: '',
    extension: '',
  };
}

/**
 * 
 * @param {需要私有化的文件url} url 
 * 文件私有化接口方法
 */
export const ossPrivate = async (url: string) => {
  return uni.request({
    url: `${import.meta.env.VITE_APP_OSS_HOST}/oss/storage/setObjectPrivate?fileUrl=${encodeURIComponent(url)}`,
  }).then((res: any) => res.data.data as string)


}