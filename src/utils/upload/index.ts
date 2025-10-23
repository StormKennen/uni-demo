import type { Platform, UploadMethod, UploadOptions, UploadStrategy, cdpFileUploadRes } from "./type";
import { WebUploadStrategyFactory, WechatUploadStrategyFactory } from "./factory";

class UploadContext {
  private strategy: UploadStrategy;

  constructor(platform: Platform, method: UploadMethod) {
    switch (platform) {
      case 'web':
        this.strategy = WebUploadStrategyFactory.createStrategy(method);
        break;
      case 'wechat':
        this.strategy = WechatUploadStrategyFactory.createStrategy(method);
        break;
      default:
        throw new Error('Unsupported platform');
    }
  }

  async executeUpload(options: UploadOptions): Promise<string> {
    const { isOssPrivate = true, ...rest } = options
    try {
      await options.onBeforeSelectFile?.()
    } catch (error) {      
      throw error
    }
    const file = await this.strategy.selectFile(rest);
    try {
      await options.onAfterSelectFile?.(file)
    } catch (error) {      
      throw error
    }
    
    try {
      options.onUploadToOssStart?.()
      const url = await this.strategy.uploadFile(file, isOssPrivate);
      return url
    } catch (error) {
      options.onUploadToOssFail?.()
      throw error
    }
  }

  async executeCdpUpload(options: UploadOptions): Promise<cdpFileUploadRes> {
    const { isOssPrivate = true, cdpUploadOptions, ...rest } = options
    try {
      await options.onBeforeSelectFile?.()
    } catch (error) {      
      throw error
    }
    const file = await this.strategy.selectFile(rest);
    try {
      await options.onAfterSelectFile?.(file)
    } catch (error) {      
      throw error
    }
    
    try {
      options.onUploadToOssStart?.()
      const res = await this.strategy.cdpUploadFile(file, cdpUploadOptions,isOssPrivate);
      return res
    } catch (error) {
      options.onUploadToOssFail?.()
      throw error
    }
  }
}

export async function uploadFile(platform: Platform, method: UploadMethod, options: UploadOptions) {
  const uploadContext = new UploadContext(platform, method);
  return uploadContext.executeUpload(options);
}

/** 上传CDP 文件中心 */
export async function uploadCdpFile(platform: Platform, method: UploadMethod, options: UploadOptions) {
  const uploadContext = new UploadContext(platform, method);
  return uploadContext.executeCdpUpload(options);
}