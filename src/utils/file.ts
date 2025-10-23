import { getSystemInfo } from "./env"
import { getFilenameAndExtension, toOss } from "./oss-util"
import type { Platform } from "./upload/type"

import bmpSrc from '@/static/image/files/bmp.png'
import hetongSrc from '@/static/image/files/hetong.png'
import jpgSrc from '@/static/image/files/jpg.png'
import pdfSrc from '@/static/image/files/pdf.png'
import pngSrc from '@/static/image/files/png.png'
import pptSrc from '@/static/image/files/ppt.png'
import tiffSrc from '@/static/image/files/tiff.png'
import wordSrc from '@/static/image/files/word.png'
import appDsBridge from "@/utilsH5/appDsBridge"
import { ossPrivate } from './oss-util'

const PreviewFileWechatSupport = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf']
const PreviewFileWebSupport = ['pdf']

/**
 * @description: 判断是否为图片
 */
export const isImageType = (str: string) => {
  // toLowerCase() 将字符串转换为小写，返回一个新的字符串
  return ['png', 'jpg', 'jpeg', 'bmp', 'gif', 'webp', 'svg', 'tiff'].includes(str.toLowerCase())
}


/** 文件预览
 * fileUrl: oss文件URL
 * isPrivate: 是否为私有链接, 默认是
 */
export const previewFile = (fileUrl: string, isPrivate = true) => {
  const publicFileUrl = isPrivate ? toOss(fileUrl) : fileUrl
  uni.showLoading()
  const p = new Promise((resolve, reject) => {
    const {
      extension
    } = getFilenameAndExtension(fileUrl)
    const ext = extension ? extension.replace('.', '') : ''

    const sys = getSystemInfo()
    const isWeChat = sys.hostName === 'WeChat'
    const isYinheApp = sys.isYinheApp
    const platform: Platform = isYinheApp ? 'app' : isWeChat ? 'wechat' : 'web'

    console.log('预览文件', {
      ext,
      isPrivate,
      fileUrl,
      publicFileUrl,
      platform
    });

    if (platform === 'wechat') {
      if (isImageType(ext)) {
        uni.previewImage({
          urls: [publicFileUrl],
        })
        return resolve(true)
      }
      if (!PreviewFileWechatSupport.includes(ext)) {
        reject(`不支持预览该文件`)
        return
      }
      
      uni.downloadFile({
        url: publicFileUrl,
        fail: function (res) {
          console.error(res);
          
          reject('文件下载失败')
        },
        success: function (res) {
          var filePath = res.tempFilePath;
          uni.openDocument({
            filePath: filePath,
            showMenu: true,
            fail: function (res) {
              console.error(res);
              
              reject('文件预览失败')
            },
            success: function (res) {
              resolve(true)
            }
          });
        }
      });
      return
    }

    if (platform === 'app') {
      if (isImageType(ext)) {
        appDsBridge.showPicsSyn({
          curIndex: 0,
          pics: [publicFileUrl]
        })
        return resolve(true)
      }

      console.log('goPreviewFile:fileUrl', fileUrl)
      appDsBridge.goPreviewFile(fileUrl)
      return resolve(true)
    }
    if (platform === 'web') {
      if (isImageType(ext)) {
        uni.previewImage({
          urls: [publicFileUrl],
        })
        return resolve(true)
      }
      if (!PreviewFileWebSupport.includes(ext)) {
        reject('不支持预览该文件')
        return
      }
      resolve(true)
      uni.navigateTo({
        url: `/pages/webview/webview?url=${publicFileUrl}&title=预览`
      })
      return
    }
  })
  p.then(res => {
    uni.hideLoading()
    return res
  })
  .catch(err => {
    uni.hideLoading()
    uni.showToast({
      icon: 'error',
      title: typeof err === 'string'? err : '预览失败',
    })
    return Promise.reject(err)
  })
  return p
}

/** 根据文件类型，获取对应的图片 */
export const getFileTypeImage = (fileType: string) => {
  const map: Record<string, string> = {
    bmp: bmpSrc,
    hetong: hetongSrc,
    jpg: jpgSrc,
    jpeg: jpgSrc,
    pdf: pdfSrc,
    png: pngSrc,
    ppt: pptSrc,
    pptx: pptSrc,
    tiff: tiffSrc,
    doc: wordSrc,
    docx: wordSrc,
    word: wordSrc
  }
  return map[fileType.includes('/') ? fileType.split('/')[1] : fileType] || map['jpg']
}