import { BaseUploadStrategy } from "../base";

/** web-手机文件上传 */
export class WebFilePickerUploadStrategy extends BaseUploadStrategy {
  async selectFile(options: UniNamespace.ChooseFileOptions): Promise<File> {
    return new Promise((resolve, reject) => {
      uni.chooseFile({
        count: 1,
        type: 'all',
        ...options,
        fail: (result) => {
          reject(result)
        },
        success: function (result) {
          console.log('web 文件选择', result.tempFiles);
          const files = result.tempFiles as File[]
          resolve(files[0])
        }
      });
    })
  }
}

/** web-相册上传 */
export class WebAlbumUploadStrategy extends BaseUploadStrategy {
  async selectFile(options: UniNamespace.ChooseImageOptions): Promise<File> {
    return new Promise((resolve, reject) => {
      uni.chooseImage({
        count: 1,
        sourceType: ['album'],
        ...options,
        fail: (result) => {
          reject(result)
        },
        success: function (result) {
          console.log('web 相册选择', result.tempFiles);
          const files = result.tempFiles as File[]
          resolve(files[0])
        }
      });
    })
  }
}

/** web-相机上传 */
export class WebCameraUploadStrategy extends BaseUploadStrategy {
  async selectFile(options: UniNamespace.ChooseImageOptions): Promise<File> {
    return new Promise((resolve, reject) => {
      uni.chooseImage({
        count: 1,
        sourceType: ['camera'],
        ...options,
        fail: (result) => {
          reject(result)
        },
        success: function (result) {
          console.log('web 拍照上传', result.tempFiles);
          const files = result.tempFiles as File[]
          resolve(files[0])
        }
      });
    })
  }
}