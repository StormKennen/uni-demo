import { uploadToOss } from "./oss";
import { uploadToCdp } from "./cdpOss";
import type { UploadStrategy, cdpFileUploadRes, cdpFileUploadParams } from "./type";

export abstract class BaseUploadStrategy implements UploadStrategy {
  // 通用的 uploadFile 方法
  async uploadFile(file: File | string, isPrivate = true): Promise<string> {
    console.log(`OSS文件上传...: `, file, isPrivate);
    const { url } = await uploadToOss(file, isPrivate)
    return url
  }

  async cdpUploadFile(file: File | string, params: cdpFileUploadParams): Promise<cdpFileUploadRes> {
    return await uploadToCdp(file, params)
  }

  // 抽象方法，子类必须实现
  abstract selectFile(options?: Record<string, any>): Promise<File>;
}