<template>
  <view class="qr-parser">
    <!-- 导航栏（统一样式） -->
    <nav-bar
      always-title
      title="二维码解析"
      custom-class="light"
      :custom-style="{ backgroundImage: 'linear-gradient(135deg, #0046B4 0%, #1E40AF 100%)' }"
    />

    <!-- 内容区域 -->
    <view class="content">
      <!-- 图片解析（仅 H5 展示） -->
      <!-- #ifdef H5 -->
      <view class="parse-section">
        <view class="section-title">图片解析（手机浏览器）</view>
        <button class="action-btn parse-btn" @click="parseQRCodeFromImage">
          选择图片并解析二维码
        </button>
        <view class="tips">若解析失败，请确保图片清晰且包含完整二维码</view>
        <view v-if="previewSrc" class="preview-wrap">
          <image :src="previewSrc" class="preview-image" mode="widthFix" />
        </view>
      </view>
      <!-- #endif -->

      <!-- 扫码解析（小程序/APP 展示） -->
      <!-- #ifndef H5 -->
      <view class="parse-section">
        <view class="section-title">扫码解析（微信小程序/APP）</view>
        <button class="action-btn scan-btn" @click="scanQRCode">
          打开相机扫码解析
        </button>
      </view>
      <!-- #endif -->

      <!-- 解析结果 -->
      <view class="result-section" v-if="parseResult || parseError">
        <view class="section-title">解析结果</view>
        <view class="info-item" v-if="parseResult">
          <text class="info-label">内容：</text>
          <text class="info-value">{{ parseResult }}</text>
        </view>
        <view class="info-item" v-if="parseError">
          <text class="info-label">错误：</text>
          <text class="info-value">{{ parseError }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import NavBar from '@/components/nav-bar.vue'

export default {
  name: 'QRParser',
  components: {
    NavBar
  },
  data() {
    return {
      previewSrc: '',
      parseResult: '',
      parseError: ''
    }
  },
  methods: {
    // 解析：从图片选择并解析（H5）
    async parseQRCodeFromImage() {
      this.parseResult = ''
      this.parseError = ''
      try {
        const chooseRes = await new Promise((resolve, reject) => {
          uni.chooseImage({ count: 1, success: resolve, fail: reject })
        })
        const path = chooseRes.tempFilePaths?.[0] || chooseRes.tempFiles?.[0]?.path
        if (!path) {
          throw new Error('未选择图片')
        }
        this.previewSrc = path
        // #ifdef H5
        const jsqrMod = await import(/* @vite-ignore */ 'https://cdn.skypack.dev/jsqr')
        const jsQR = jsqrMod.default || jsqrMod
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.src = path
        await new Promise((r, j) => { img.onload = () => r(null); img.onerror = j })
        const off = document.createElement('canvas')
        const w = img.naturalWidth || img.width
        const h = img.naturalHeight || img.height
        off.width = w
        off.height = h
        const octx = off.getContext('2d')
        octx.imageSmoothingEnabled = false
        octx.drawImage(img, 0, 0, w, h)
        const imgData = octx.getImageData(0, 0, w, h)
        const result = jsQR(imgData.data, w, h)
        if (result?.data) {
          this.parseResult = result.data
          uni.showToast({ title: '解析成功', icon: 'success' })
        } else {
          this.parseError = '未识别到二维码'
          uni.showToast({ title: '未识别到二维码', icon: 'none' })
        }
        // #endif
        // #ifndef H5
        uni.showToast({ title: '当前环境不支持相册图片解析', icon: 'none' })
        // #endif
      } catch (err) {
        console.error('图片解析失败:', err)
        this.parseError = (err && err.message) || '解析失败'
        uni.showToast({ title: '解析失败', icon: 'none' })
      }
    },

    // 解析：相机扫码（小程序）
    async scanQRCode() {
      this.parseResult = ''
      this.parseError = ''
      try {
        // #ifndef H5
        const res = await new Promise((resolve, reject) => {
          uni.scanCode({
            onlyFromCamera: true,
            success: resolve,
            fail: reject
          })
        })
        if (res && res.result) {
          this.parseResult = res.result
          uni.showToast({ title: '解析成功', icon: 'success' })
        } else {
          this.parseError = '未识别到二维码'
          uni.showToast({ title: '未识别到二维码', icon: 'none' })
        }
        // #endif
        // #ifdef H5
        uni.showToast({ title: '请在微信小程序或App中使用扫码解析', icon: 'none' })
        // #endif
      } catch (err) {
        console.error('扫码解析失败:', err)
        this.parseError = (err && err.message) || '解析失败'
        uni.showToast({ title: '解析失败', icon: 'none' })
      }
    },

    // 微信小程序分享功能
    onShareAppMessage() {
      return {
        title: '二维码解析 - 图片与扫码解析',
        path: '/subPackages/tools/qr-parser/index',
        imageUrl: '/static/logo.png'
      }
    },

    // 朋友圈分享功能
    onShareTimeline() {
      return {
        title: '二维码解析 - 图片与扫码解析',
        path: '/subPackages/tools/qr-parser/index',
        imageUrl: '/static/logo.png'
      }
    }
  }
}
</script>

<style scoped>
.qr-parser {
  min-height: 100vh;
  background: linear-gradient(135deg, #4C8BF5 0%, #6A5ACD 100%);
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  padding: 20rpx;
  padding-top: calc(32rpx + var(--nav-height, 120rpx));
  overflow-y: auto;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.parse-section {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.1);
}

.action-btn {
  width: 100%;
  padding: 25rpx;
  border: none;
  border-radius: 50rpx;
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.parse-btn {
  background: linear-gradient(45deg, #8E24AA, #AB47BC);
  color: white;
}

.scan-btn {
  background: linear-gradient(45deg, #FF7043, #FF8A65);
  color: white;
}

.preview-wrap {
  margin-top: 20rpx;
  display: flex;
  justify-content: center;
}

.preview-image {
  max-width: 100%;
  border-radius: 12rpx;
}

.result-section {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.1);
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.info-label {
  font-size: 26rpx;
  color: #666;
}

.info-value {
  font-size: 26rpx;
  color: #333;
  font-weight: bold;
}
</style>