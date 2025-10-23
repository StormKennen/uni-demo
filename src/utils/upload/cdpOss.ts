import { getToken } from "@/utils/storage";
import type { cdpFileUploadRes, cdpFileUploadParams } from "./type";
import { getAppTokenFromQuery } from "@/utilsH5/env";
import { generateUUID } from "@/utils/uid";
const CDP_HOST = import.meta.env.VITE_APP_CDP_HOST

function getAuthorization() {
    let token = ''
    // #ifdef WEB
    token = getAppTokenFromQuery() || ''
    // #endif
    // #ifndef WEB
    token = getToken() || ''
    // #endif
    return `Bearer ${token}` 
}

/**
 * @description 上传文件到文件中心
 * @param fileUrl
 * @param params cpd文件上传参数
 * @returns
 */
export function uploadToCdp(fileUrl: string | File, params: cdpFileUploadParams) {
  return new Promise<cdpFileUploadRes>((resolve, reject) => {
    const isFile = fileUrl instanceof File
    const options = !isFile ? {
      filePath: fileUrl
    } : {
      file: fileUrl
    }
    
    let targetUrl = CDP_HOST + `/fileworker/common/${isFile ? 'upload' : 'uploadByUrl'}`
    console.log('uploadToCdp---params', params);
    
    const formData = {
        fileType: 'COMMON',
        caller: 'app',
        service: 'front',
        belongUserId: '0',
        ...(params?.value || params),
    }
    if (!isFile) {
        formData.fileName = generateUUID()
    }
    
    console.log('上传CDP：', {...(params?.value || params)})
    uni.uploadFile({
      ...options,
      url: targetUrl,
      timeout: 60 * 1000,
      name: 'file',
      header: {
        'Authorization': getAuthorization()
      },
      formData,
      success: (data) => {
        const res = JSON.parse(data.data)
        if (data.statusCode === 200 && res.code === 200) {
            const resData = JSON.parse(data.data).data
            resData.file_id = resData.fileId
            resData.upload_at = resData.createdAt
            resData.sign = formData.service
            resolve({ ...resData })
        } else {
          reject(data)
        }
      },
      fail: (err) => {
        console.log('上传CDP失败：', err)
        reject(err)
      }
    })
  })
}


/**
 * @description 异步获取文件的临时地址（公有），可用于页面内预览或window.open()打开进行下载
 * @param fileUrl OSS文件地址（私有）
 * @returns Promise<string>
 */
export function getCdpFilePublicUrlAsync(fileUrl: string) {
    return new Promise<string>((resolve, reject) => {
        uni.request({
            url: `${CDP_HOST}/fileworker/common/transformer?url=${fileUrl}`,
            header: {
                'Authorization': getAuthorization()
            },
            success: (data) => {
                if (data.statusCode === 200) {
                    resolve(data.data as string)
                } else {
                    console.error(data)
                    reject(data)
                }
            },
            fail: (err) => {
                console.log('异步链接获取失败：', err)
                reject(err)
            }
        })
    })
}

/**
 * @description 同步获取文件的临时地址（公有），可用于页面内预览或window.open()打开进行下载
 * @param fileUrl OSS文件地址（私有）
 * @returns string
 */
export function getCdpFilePublicUrlSync(fileUrl: string) {
    return `${CDP_HOST}/fileworker/common/forwardURL?url=${fileUrl}`     
}


 /**
 * @description 删除文件
 * @param fileMd5 加密MD5值
 * @param fileId  文件ID
 * @returns Promise<void>
 */
export function cdpDeleteFile(fileId: string) {
    return new Promise<string>((resolve, reject) => {
        uni.request({
            url: `${CDP_HOST}/fileworker/common/deleteFile?fileId=${fileId}`,
            header: {
                'Authorization': getAuthorization()
            },
            success: (data) => {
                if (data.statusCode === 200) {
                    resolve(data.data as string)
                } else {
                    console.error(data)
                    reject(data)
                }
            },
            fail: (err) => {
                console.log('删除失败：', err)
                reject(err)
            }
        })
    })
}

/**
 * @description 重命名
 * @param fileId 文件ID
 * @param newName 文件名称
 * @returns Promise<void>
 */
 export function cdpRename(fileId: string, newName: string) {
    return new Promise<void>((resolve, reject) => {
        uni.request({
            url: `${CDP_HOST}/fileworker/common/rename?fileId=${fileId}&newName=${newName}`,
            header: {
                'Authorization': getAuthorization()
            },
            success: (data) => {
                if (data.statusCode === 200) {
                    resolve()
                } else {
                    console.error(data)
                    reject(data)
                }
            },
            fail: (err) => {
                console.log('删除失败：', err)
                reject(err)
            }
        })
    })
}

/**
 * @description 判断是否CDP文件地址
 * @param url  CDP文件地址
 * @returns Boolean
 */
export function isCdpUrl(url: string) {
    return (url || '').includes('galaxy-filecenter.galaxy-immi.com')
}

function getFileworkerOcrLpOcrResult (fileId: string) {
    return new Promise<string>((resolve, reject) => {
        uni.request({
            url: `${CDP_HOST}/fileworker/ocr/lpOcrResult?fileId=${fileId}`,
            header: {
                'Authorization': getAuthorization()
            },
            success: (data) => {
                if (data.statusCode === 200) {
                    resolve(data.data?.data as string)
                } else {
                    console.error(data)
                    reject(data)
                }
            },
            fail: (err) => {
                console.log('Ocr获取失败：', err)
                reject(err)
            }
        })
    })
}

export async function cdpOcrLoop(fileId: string) {
    let times = 0
    async function getData(): Promise<any> {
        times += 1
        // return http.get('/fileworker/ocr/lpOcrResult', params, _config)
        const data = await getFileworkerOcrLpOcrResult(fileId)
        console.log('ocrLoop:', data);
        
        if (data.status === 1) {
            return data.result
        }
        if (times > 10 || data.status === 2) {
            return false
        }
        // 继续轮询
        return new Promise((resolve) => {
            setTimeout(async () => {
                resolve(await getData())
            }, 3000)
        })
    }

    return getData()
}

// export async function cdpOcr(file) {
//     if (file.file_id) {
//         return cdpOcrLoop(file.file_id)
//     }
//     else {
//         return GetCommonFileRecogniseLetterDate({ url: file.url })
//     }
// }