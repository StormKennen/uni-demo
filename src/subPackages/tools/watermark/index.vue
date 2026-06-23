<template>
  <view class="watermark-page">
    <NavBar
      always-title
      title="视频去水印"
      custom-class="light"
      :custom-style="{ backgroundImage: 'linear-gradient(135deg, #07c160 0%, #12d28c 100%)' }"
    />

    <PlatformRestrictionNotice
      v-if="isWeixinRestricted"
      description="根据微信小程序平台运营规范，当前平台暂不提供视频去水印功能，请前往 H5 使用。"
      action-text="返回首页"
      @action="goHome"
    />

    <view v-else class="main-content">
    <view class="card input-card" v-if="!parsedVideoUrl">
      <textarea
        v-model="videoLink"
        class="textarea"
        placeholder="请在此处粘贴视频（或图集）链接。"
        :maxlength="-1"
      />
      <view class="btn-row">
        <button class="btn primary full" @click="handlePasteAndParse" :loading="isParsing">粘贴并解析</button>
      </view>
    </view>

    <view class="share-entry" v-if="!isH5 && !parsedVideoUrl">
      <text class="share-tip" v-if="isWeixinMiniProgram">请点击右上角 · 分享给好友</text>
    </view>

    <view class="card result-card" v-if="parsedVideoUrl">
      <view class="tips-row">
        <text class="error-tips clickable" @click="handleReparse">解析有问题，点击重试</text>
      </view>
      <video
        class="preview"
        :src="parsedVideoUrl"
        :poster="parsedCover"
        controls
        object-fit="contain"
      />
      <view class="result-btn-row">
        <button class="btn primary" @click="handleSaveVideo" :loading="isDownloading">保存视频</button>
        <button class="btn ghost" @click="handleCopyLink">复制视频链接</button>
      </view>
      <text class="tips secondary clickable new-link" @click="handleReset">继续解析</text>
    </view>

    </view>
  </view>
</template>

<script setup lang="ts">
import { postVideoProcess } from '@/services/apifox/NODEJSDEMO/VIDEO/apifox'
import { ref } from 'vue'
import { onShow, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { reportToolVisit } from '@/utils/tracker'
import NavBar from '@/components/nav-bar.vue'
import PlatformRestrictionNotice from '@/components/platform-restriction-notice.vue'

const videoLink = ref('')
const parsedVideoUrl = ref('')
const parsedCover = ref('')
const isParsing = ref(false)
const isDownloading = ref(false)
const isWeixinMiniProgram = ref(false)
const isWeixinRestricted = ref(false)
const isH5 = ref(false)

// #ifdef MP-WEIXIN
isWeixinMiniProgram.value = true
isWeixinRestricted.value = true
uni.showShareMenu({ withShareTicket: true })
// #endif

// #ifdef H5
isH5.value = true
// #endif

const SHARE_PATH = '/subPackages/tools/watermark/index'
const SHARE_TITLE = '视频去水印 · 凉白开工具箱'

const goHome = () => {
  uni.switchTab({
    url: '/pages/index/index',
    fail: () => {
      uni.reLaunch({ url: '/pages/index/index' })
    }
  })
}

const extractVideoUrl = (text: string) => {
  if (!text) return ''
  const regex = /(https?:\/\/[^\s]+)/i
  const match = text.match(regex)
  if (!match) return ''
  return match[0].replace(/[)，。！!；;\uFF09]+$/, '')
}

const handlePasteAndParse = () => {
  uni.getClipboardData({
    success: (res) => {
      if (res.data) {
        const cleaned = res.data.trim()
        videoLink.value = cleaned
        parseVideo(cleaned)
      } else if (videoLink.value) {
        parseVideo(videoLink.value)
      } else {
        uni.showToast({ title: '剪贴板为空，请先输入链接', icon: 'none' })
      }
    },
    fail: () => {
      if (videoLink.value) {
        parseVideo(videoLink.value)
      } else {
        uni.showToast({ title: '请先粘贴或输入视频链接', icon: 'none' })
      }
    }
  })
}

const handleReparse = () => {
  if (isParsing.value) return
  const current = videoLink.value.trim()
  if (current) {
    parseVideo(current)
  } else {
    handlePasteAndParse()
  }
}

const handleReset = () => {
  if (isParsing.value) return
  parsedVideoUrl.value = ''
  parsedCover.value = ''
  videoLink.value = ''
}

const parseVideo = async (raw: string) => {
  if (!raw) return
  const cleaned = raw.trim()
  videoLink.value = cleaned
  const link = extractVideoUrl(cleaned)
  if (!link) {
    uni.showToast({ title: '未在文本中找到链接', icon: 'none' })
    return
  }
  isParsing.value = true
  uni.showLoading({ title: '智能解析中...' })

  try {
    const res: any = await postVideoProcess({ videoUrl: link })
    const data = res?.data || res
    if (data?.videoUrl) {
      parsedVideoUrl.value = data.videoUrl
      parsedCover.value = data.cover || ''
      uni.showToast({ title: '解析成功', icon: 'success' })
    } else if (data?.downloadUrl) {
      parsedVideoUrl.value = data.downloadUrl
      parsedCover.value = data.videoInfo?.cover || ''
      uni.showToast({ title: '解析成功', icon: 'success' })
    } else {
      uni.showToast({ title: '未获取到视频地址', icon: 'none' })
    }
  } catch (err: any) {
    console.error(err)
    uni.showToast({ title: err?.message || '解析失败，请检查链接', icon: 'none' })
  } finally {
    isParsing.value = false
    uni.hideLoading()
  }
}

const handleCopyLink = () => {
  const directUrl = parsedVideoUrl.value.trim()
  if (!directUrl) return

  uni.setClipboardData({
    data: directUrl,
    success: () => uni.showToast({ title: '链接已复制', icon: 'success' })
  })
}

const handleSaveVideo = () => {
  const directUrl = parsedVideoUrl.value.trim()
  if (!directUrl) return

  isDownloading.value = true
  uni.showLoading({ title: '视频下载中...' })

  const buildProxyUrl = () => {
    const base = (import.meta.env.VITE_APP_BASE_URL || '').replace(/\/$/, '')
    return base ? `${base}/video/download?url=${encodeURIComponent(directUrl)}` : ''
  }

  const finalize = () => {
    isDownloading.value = false
    uni.hideLoading()
  }

  const downloadWithUrl = (targetUrl: string, isRetry = false) => {
    uni.downloadFile({
      url: targetUrl,
      success: (res) => {
        if (res.statusCode === 200) {
          uni.saveVideoToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => uni.showToast({ title: '已保存到相册', icon: 'success', duration: 1500 }),
            fail: (err) => {
              console.error(err)
              uni.showToast({ title: '保存失败，请检查相册权限', icon: 'none' })
            },
            complete: finalize
          })
        } else if (!isRetry) {
          const proxyUrl = buildProxyUrl()
          if (proxyUrl && proxyUrl !== targetUrl) {
            downloadWithUrl(proxyUrl, true)
          } else {
            uni.showToast({ title: '视频下载失败', icon: 'none' })
            finalize()
          }
        } else {
          uni.showToast({ title: '视频下载失败', icon: 'none' })
          finalize()
        }
      },
      fail: (err) => {
        console.error(err)
        if (!isRetry) {
          const proxyUrl = buildProxyUrl()
          if (proxyUrl && proxyUrl !== targetUrl) {
            downloadWithUrl(proxyUrl, true)
            return
          }
        }
        uni.showToast({ title: '网络中断或下载失败', icon: 'none' })
        finalize()
      }
    })
  }

  downloadWithUrl(directUrl)
}

const handleShare = () => {
  if (!isH5.value) {
    uni.showToast({ title: '请点击右上角分享', icon: 'none' })
    return
  }
  const shareUrl = `${window.location.origin}${SHARE_PATH}`
  if (navigator?.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        uni.showToast({ title: '链接已复制', icon: 'success' })
      })
      .catch(() => {
        uni.showModal({ title: '分享链接', content: shareUrl, showCancel: false })
      })
  } else {
    uni.showModal({ title: '分享链接', content: shareUrl, showCancel: false })
  }
}

onShow(() => {
  reportToolVisit('video-watermark')
})

// #ifdef MP-WEIXIN
onShareAppMessage(() => ({
  title: SHARE_TITLE,
  path: SHARE_PATH,
  imageUrl: parsedCover.value || ''
}))

onShareTimeline(() => ({
  title: SHARE_TITLE,
  query: ''
}))
// #endif
</script>

<style scoped lang="scss">
.watermark-page {
  min-height: 100vh;
  background: #f6f7fb;
}

.main-content {
  padding: 32rpx;
}

.card {
  background: #fff;
  border-radius: 24rpx;
  padding: 24rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.05);
  margin-bottom: 32rpx;
}

.textarea {
  width: 100%;
  height: 160rpx;
  font-size: 24rpx;
  line-height: 1.4;
  overflow: hidden;
}

.btn-row,
.result-btn-row {
  margin-top: 24rpx;
  display: flex;
  gap: 24rpx;
}

.btn {
  flex: 1;
  height: 88rpx;
  border-radius: 16rpx;
  font-size: 30rpx;
}

.btn.primary {
  background: linear-gradient(135deg, #07c160, #12d28c);
  color: #fff;
}

.btn.ghost {
  background: #f2f2f2;
  color: #333;
}

.tips-row {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20rpx;
}

.tips {
  font-size: 26rpx;
  color: #08c060;
  text-decoration: underline;
}

.tips.secondary {
  color: #8f8f8f;
  text-decoration: underline;
}

.error-tips {
  color: #8f8f8f;
  text-decoration: underline;
}

.new-link {
  display: block;
  text-align: center;
  margin-top: 16rpx;
  font-size: 26rpx;
  color: #6b6b6b;
  text-decoration: underline;
}

.share-entry {
  padding: 24rpx;
  text-align: center;
}

.share-title {
  font-size: 28rpx;
  font-weight: 600;
  margin-bottom: 16rpx;
  color: #333;
}

.share-btn {
  width: 100%;
  height: 96rpx;
  border-radius: 999rpx;
  border: 2rpx dashed #12d28c;
  background: #fff;
  color: #07c160;
  font-size: 30rpx;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.share-tip {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #9da0a8;
}

.preview {
  width: 100%;
  height: 800rpx;
  background: #000;
  border-radius: 16rpx;
}
</style>
