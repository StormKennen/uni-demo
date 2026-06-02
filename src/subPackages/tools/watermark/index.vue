<template>
  <view class="watermark-page">
    <NavBar
      always-title
      title="视频去水印"
      custom-class="light"
      :custom-style="{ backgroundImage: 'linear-gradient(135deg, #07c160 0%, #12d28c 100%)' }"
    />

    <view class="main-content">
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

    <view class="card result-card" v-if="parsedVideoUrl">
      <view class="tips-row">
        <text class="error-tips clickable" @click="handleReparse">解析有问题，重试</text>
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
import NavBar from '@/components/nav-bar.vue'

const videoLink = ref('')
const parsedVideoUrl = ref('')
const parsedCover = ref('')
const isParsing = ref(false)
const isDownloading = ref(false)

const handlePasteAndParse = () => {
  uni.getClipboardData({
    success: (res) => {
      if (res.data) {
        videoLink.value = res.data
        parseVideo(res.data)
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

const parseVideo = async (url: string) => {
  if (!url) return
  isParsing.value = true
  uni.showLoading({ title: '智能解析中...' })

  try {
    const res: any = await postVideoProcess({ videoUrl: url })
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
            success: () => uni.showToast({ title: '已保存到相册', icon: 'success' }),
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

.preview {
  width: 100%;
  height: 800rpx;
  background: #000;
  border-radius: 16rpx;
}
</style>
