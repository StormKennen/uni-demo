import type { UploadMethod, UploadStrategy } from "./type";
import { WebAlbumUploadStrategy, WebCameraUploadStrategy, WebFilePickerUploadStrategy } from "./platform/web";
import { WechatAlbumUploadStrategy, WechatCameraUploadStrategy, WechatMessageFileUploadStrategy } from "./platform/wechat";

export class WebUploadStrategyFactory {
  static createStrategy(method: UploadMethod): UploadStrategy {
    switch (method) {
      case 'camera':
        return new WebCameraUploadStrategy();
      case 'album':
        return new WebAlbumUploadStrategy();
      case 'filePicker':
        return new WebFilePickerUploadStrategy();
      default:
        throw new Error(`Web不支持该${method}上传方式`);
    }
  }
}

export class WechatUploadStrategyFactory {
  static createStrategy(method: UploadMethod): UploadStrategy {
    switch (method) {
      case 'camera':
        return new WechatCameraUploadStrategy();
      case 'album':
        return new WechatAlbumUploadStrategy();
      case 'wechatFile':
        return new WechatMessageFileUploadStrategy();
      default:
        throw new Error(`微信小程序不支持该${method}上传方式`);
    }
  }
}