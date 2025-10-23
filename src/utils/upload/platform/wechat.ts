import { BaseUploadStrategy } from "../base";

/** 微信-相册上传 */
export class WechatAlbumUploadStrategy extends BaseUploadStrategy {
  async selectFile(options: UniNamespace.ChooseMediaOption): Promise<any> {
    return new Promise((resolve, reject) => {
      uni.chooseMedia({
        ...options,
        count: 1,
        sourceType: ['album'],
        mediaType: ['image'],
        success:  (result) => {
          console.log('wechat相册选择', result.tempFiles);
          const files = result.tempFiles
          resolve(files[0].tempFilePath)
        },
        fail: (err) => {
          reject(err)
        }
      });
    })
  }
}

/** 微信-相机上传 */
export class WechatCameraUploadStrategy extends BaseUploadStrategy {
  async selectFile(options: UniNamespace.ChooseMediaOption): Promise<any> {
    return new Promise((resolve, reject) => {
      uni.chooseMedia({
        ...options,
        count: 1,
        sourceType: ['camera'],
        mediaType: ['image'],
        success:  (result) => {
          console.log('wechat相机上传', result.tempFiles);
          const files = result.tempFiles
          resolve(files[0].tempFilePath)
        },
        fail: (err) => {
          reject(err)
        }
      });
    })
  }
}

/** 微信-聊天消息文件上传 */
export class WechatMessageFileUploadStrategy extends BaseUploadStrategy {
  async selectFile(options: UniNamespace.ChooseMessageFileOption): Promise<any> {
    return new Promise((resolve, reject) => {
      uni.chooseMessageFile({
        ...options,
        count: 1,
        type: 'all',
        success:  (result) => {
          console.log('wechat聊天消息文件', result.tempFiles);
          const files = result.tempFiles
          resolve(files[0].path)
        },
        fail: (err) => {
          reject(err)
        }
      });
    })
  }
}