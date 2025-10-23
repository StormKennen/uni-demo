<script setup lang="ts">
import type { Platform, UploadMethod, UploadOptions, cdpFileUploadParams, cdpFileUploadRes } from '@/utils/upload/type';
import MyPopup from '../popup.vue';
import { getSystemInfo } from '@/utils/env';
import { uploadFile, uploadCdpFile } from '@/utils/upload/index';
import { getFilenameAndExtension } from '@/utils/oss-util'
import mime from 'mime';
import { ref } from 'vue';

interface Props {
  private?: boolean
  tips?: string
  fileTypes?: string[]
  maxSize?: number
  uploadSuccess?: (url: cdpFileUploadRes) => void | Promise<void>
  isCdpUpload?: boolean
  cdpUploadOptions?: cdpFileUploadParams
  uploadCdpSuccess?: (url: cdpFileUploadRes) => void | Promise<void>
}

const props = withDefaults(defineProps<Props>(), {
  private: true,
  maxSize: 50, // 默认50MB限制
  isCdpUpload: false,
})

const maxSizeTip = `不能超过${props.maxSize}MB`

const emit = defineEmits<{
  beforeSelectFile: []
  success: [url: cdpFileUploadRes]
  fail: [error: any]
}>();

const sys = getSystemInfo()
const isWeChat = sys.hostName === 'WeChat'
const platform: Platform = isWeChat ? 'wechat' : 'web'

const visible = defineModel<boolean>()


const upload = async (method: UploadMethod) => {
  const onBeforeSelectFile = async () => {
    emit('beforeSelectFile')
  }

  const onAfterSelectFile = async (file: File | string) => {
    let extension = ''
    if (typeof file === 'string') {
      ({ extension } = getFilenameAndExtension(file))
      extension = extension.replace('.', '')
    } else {
      const _mime = mime.getType(file.name)
      extension = mime.getExtension(_mime)
    }
    // 上传文件大小限制
    if (typeof file === 'string') {
      const getInfo = await uni.getFileInfo({
        filePath: file
      })
      if ((getInfo && getInfo.size) > props.maxSize * 1024 * 1024) {
        showTip(maxSizeTip)
        return Promise.reject(maxSizeTip)
      }      
    } else {
      if (file.size > props.maxSize * 1024 * 1024) {
        showTip(maxSizeTip)
        return Promise.reject(maxSizeTip)
      }
    }

    if (!props.fileTypes.some(type => type.toLowerCase() === extension.toLowerCase())) {
      let msg = '不支持该格式'
      if(props.fileTypes.length) {
        msg = `请检查文件格式是否为${props.fileTypes.join('、')}`
      }
      showTip(msg)
      return Promise.reject(`不支持该格式(${extension})`)
    }
  }

  visible.value = false;
  let hideLoading = () => { }
  try {
    let ossUrl = ''
    let cdpRes: cdpFileUploadRes
    const options: UploadOptions = {
      isOssPrivate: props.private,
      cdpUploadOptions: props.cdpUploadOptions,
      // 选择文件前
      onBeforeSelectFile,
      onAfterSelectFile: props.fileTypes?.length ? onAfterSelectFile : undefined,
      // 开始请求接口上传至oss
      onUploadToOssStart: () => {
        // hasShowLoading = true
        uni.showLoading({
          mask: true,
        })
        hideLoading = uni.hideLoading
      },
      // 上传oss失败
      onUploadToOssFail: () => {
        hideLoading()
        uni.showToast({
          title: '上传失败',
          icon: 'error',
        });
      }
    }
    if (method === 'album') {
      // 相册上传
      cdpRes = await uploadCdpFile(platform, 'album', options)
    } else if (method === 'filePicker') {
      // 手机文件上传
      cdpRes = await uploadCdpFile(platform, 'filePicker', options)
    } else if (method === 'wechatFile') {
      // 微信聊天文件
      cdpRes = await uploadCdpFile(platform, 'wechatFile', options)
    }
    else if (method === 'camera') {
      // 相机
      cdpRes = await uploadCdpFile(platform, 'camera', options)
    }
    await props.uploadSuccess?.(cdpRes)

    hideLoading()
    console.log('upload ossUrl', ossUrl);
    uni.showToast({
      icon: 'success',
      title: '上传成功',
    });
    emit('success', cdpRes)
  } catch (error) {

    hideLoading()
    // 取消操作时也会触发失败
    console.error('❌ 上传失败', error)
    emit('fail', error)
  } finally {
    hideLoading = null
  }
}

const tipPopupVisble = ref(false)
const tip_msg = ref('')
const showTip = (text: string) => {
  tipPopupVisble.value = true
  tip_msg.value = text
}
const hideTip = () => {
  tipPopupVisble.value = false
}
</script>

<template>
  <MyPopup type="bottom" v-model="visible">
    <view class="upload-popup-container">
      <view class="popup-content">
        <view class="header">
          <text class="title">请选择上传方式</text>
          <view class="close" @click="visible = false"></view>
        </view>
        <!-- 分割线 -->
        <template v-if="tips">
          <view class="divider"></view>
          <text class="notice">
            {{ tips }}
          </text>
        </template>

        <view class="divider"></view>
        <view class="item" @click="() => upload('camera')">
          <view class="item-text">
            拍照上传
          </view>
          <view class="divider"></view>
        </view>
        <view class="item" @click="() => upload('album')" >
          <view class="item-text">
            相册上传
          </view>
          <view class="divider"></view>
        </view>
        <view class="item" v-if="isWeChat === false" @click="() => upload('filePicker')">
          <view class="item-text">
            手机文件上传
            <view class="item-sub-text">从手机文件管理中上传</view>
          </view>
          <view class="divider"></view>
        </view>
        <view class="item" v-if="isWeChat === true" @click="() => upload('wechatFile')">
          <view class="item-text">
            微信上传
          </view>
          <view class="divider"></view>
        </view>
        <view class="cancel" @click="visible = false">
          取消
        </view>
      </view>
    </view>
  </MyPopup>
  <MyPopup type="center" v-model="tipPopupVisble">
    <view class="tip-content-box" style="width: 600rpx;height: 536rpx;">
      <view class="icon"></view>
      <view style="margin-top: 32rpx;color: #121A26; font-size: 34rpx;font-weight: 500;">上传失败</view>
      <view class="tip-text">
        {{ tip_msg }}
      </view>
      <view class="tip-button" @click="hideTip">
        <button>我知道了</button>
      </view>
    </view>
  </MyPopup>
</template>

<style lang="scss" scoped>
.tip-content-box {
  width: 600rpx;
  height: 536rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  .icon {
    width: 106rpx;
    height: 106rpx;
    margin-top: 60rpx;
    background-image: url('@/static/image/error.png');
    background-size: cover;
  }
  .tip-text {
    color: #435163;
    font-size: 28rpx;
    font-weight: 400;
    word-wrap: break-word;
    width: 520rpx;
    line-height:normal;
  }
  .tip-button {
    margin-top: 60rpx;
    button {
      height: 90rpx;
      width: 500rpx;
      background: #0046B4;
      border-radius: 6rpx;
      color: white;
      font-size: 28rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 400;
    }
  }
}


.upload-popup-container {
  width: 100%;
  // height: 968rpx;
  padding-bottom: 40rpx;

  .popup-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    padding: 0 40rpx;
    box-sizing: border-box;
    font-size: 28rpx;


    .header {
      padding: 32rpx 0;
      width: 100%;
      display: flex;
      align-items: center;
      position: relative;

      .title {
        text-align: center;
        color: #222222;
        font-size: 34rpx;
        font-family: PingFang SC;
        font-weight: 600;
        flex: 1;
      }

      .close {
        width: 48rpx;
        height: 48rpx;
        background-image: url('@/static/image/close.png');
        background-size: cover;
        margin-left: auto;
      }
    }

    .divider {
      width: 100%;
      height: 1rpx;
      background: #F0F0F0;
    }

    .notice {
      padding: 40rpx 0;
      color: #8993A2;
      font-size: 28rpx;
      font-family: PingFang SC;
      font-weight: 400;
      white-space: pre-wrap;
    }

    .item {
      width: 100%;



      .item-text {
        box-sizing: border-box;
        height: 116rpx;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        color: $ga-gray-8;
        font-weight: 500;
        line-height: 40rpx;
      }
      .item-sub-text{
        color: #8993A2;
        font-size: 22rpx;
        font-weight: 400;
        line-height: normal;
      }
    }

    .cancel {
      padding: 40rpx 0;
      width: 100%;
      font-weight: 500;
      color: $ga-gray-6;
      text-align: center;
    }
  }
}
</style>