const OSS_HOST = import.meta.env.VITE_APP_OSS_HOST
export function uploadToOss(fileUrl: string | File, isPrivate = true) {

  return new Promise<{
    url: string
  }>((resolve, reject) => {
    const options = typeof fileUrl === 'string' ? {
      filePath: fileUrl
    } : {
      file: fileUrl
    }
    uni.uploadFile({
      ...options,
      url: OSS_HOST + '/oss/upload/storage',
      header: {
        businessCode: isPrivate ? '4002008' : '5000000'
      },
      timeout: 60 * 1000,
      name: 'file',
      success: (data) => {
        if (data.statusCode === 200) {
          resolve({ url: JSON.parse(data.data).data })
        } else {
          reject(data)
        }
      },
      fail: (err) => {
        console.log('上传OSS失败：', err)
        reject(err)
      }
    })
  })
}