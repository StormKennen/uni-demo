<template>
  <view class="qr-parser-panel">
    <!-- #ifdef H5 -->
    <ToolSectionCard title="图片解析（手机浏览器）" subtitle="若解析失败，请确保图片清晰且包含完整二维码">
      <button class="action-btn parse-btn" @click="parseQRCodeFromImage">选择图片并解析二维码</button>
      <view v-if="previewSrc" class="preview-wrap">
        <image :src="previewSrc" class="preview-image" mode="widthFix" />
      </view>
    </ToolSectionCard>
    <!-- #endif -->

    <!-- #ifndef H5 -->
    <ToolSectionCard title="扫码解析（微信小程序/APP）">
      <button class="action-btn scan-btn" @click="scanQRCode">打开相机扫码解析</button>
    </ToolSectionCard>
    <!-- #endif -->

    <ToolSectionCard v-if="parseResult || parseError" title="解析结果">
      <view class="info-item" v-if="parseResult">
        <text class="info-label">内容</text>
        <text class="info-value">{{ parseResult }}</text>
      </view>
      <view class="info-item" v-if="parseError">
        <text class="info-label">错误</text>
        <text class="info-value">{{ parseError }}</text>
      </view>
    </ToolSectionCard>
  </view>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import ToolSectionCard from '@/components/toolkit/base/tool-section-card.vue'

  const previewSrc = ref('')
  const parseResult = ref('')
  const parseError = ref('')

  const parseQRCodeFromImage = async () => {
    parseResult.value = ''
    parseError.value = ''
    try {
      const chooseRes = await new Promise<UniApp.ChooseImageSuccessCallbackResult>((resolve, reject) => {
        uni.chooseImage({ count: 1, success: resolve, fail: reject })
      })
      const path = chooseRes.tempFilePaths?.[0] || chooseRes.tempFiles?.[0]?.path || ''
      if (!path) {
        throw new Error('未选择图片')
      }
      previewSrc.value = path

      // #ifdef H5
      const jsqrMod = await import(/* @vite-ignore */ 'https://cdn.skypack.dev/jsqr')
      const jsQR = jsqrMod.default || jsqrMod
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image()
        image.crossOrigin = 'anonymous'
        image.onload = () => resolve(image)
        image.onerror = () => reject(new Error('图片加载失败'))
        image.src = path
      })

      const offscreen = document.createElement('canvas')
      const width = img.naturalWidth || img.width
      const height = img.naturalHeight || img.height
      offscreen.width = width
      offscreen.height = height
      const context = offscreen.getContext('2d')
      if (!context) {
        throw new Error('图片解析上下文不可用')
      }
      context.imageSmoothingEnabled = false
      context.drawImage(img, 0, 0, width, height)
      const imageData = context.getImageData(0, 0, width, height)
      const result = jsQR(imageData.data, width, height)
      if (result?.data) {
        parseResult.value = result.data
        uni.showToast({ title: '解析成功', icon: 'success' })
      } else {
        parseError.value = '未识别到二维码'
        uni.showToast({ title: '未识别到二维码', icon: 'none' })
      }
      // #endif

      // #ifndef H5
      uni.showToast({ title: '当前环境不支持相册图片解析', icon: 'none' })
      // #endif
    } catch (error) {
      console.error('图片解析失败:', error)
      parseError.value = error instanceof Error ? error.message : '解析失败'
      uni.showToast({ title: '解析失败', icon: 'none' })
    }
  }

  const scanQRCode = async () => {
    parseResult.value = ''
    parseError.value = ''
    try {
      // #ifndef H5
      const result = await new Promise<UniApp.ScanCodeSuccessRes>((resolve, reject) => {
        uni.scanCode({
          onlyFromCamera: true,
          success: resolve,
          fail: reject,
        })
      })
      if (result?.result) {
        parseResult.value = result.result
        uni.showToast({ title: '解析成功', icon: 'success' })
      } else {
        parseError.value = '未识别到二维码'
        uni.showToast({ title: '未识别到二维码', icon: 'none' })
      }
      // #endif

      // #ifdef H5
      uni.showToast({ title: '请在微信小程序或App中使用扫码解析', icon: 'none' })
      // #endif
    } catch (error) {
      console.error('扫码解析失败:', error)
      parseError.value = error instanceof Error ? error.message : '解析失败'
      uni.showToast({ title: '解析失败', icon: 'none' })
    }
  }
</script>

<style scoped lang="scss">
  .qr-parser-panel {
    display: flex;
    flex-direction: column;
    gap: 24rpx;
  }

  .action-btn {
    width: 100%;
    height: 88rpx;
    border: none;
    border-radius: 44rpx;
    font-size: 32rpx;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
  }

  .parse-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
  }

  .scan-btn {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    box-shadow: 0 8rpx 24rpx rgba(240, 147, 251, 0.3);
  }

  .preview-wrap {
    margin-top: 24rpx;
    display: flex;
    justify-content: center;
  }

  .preview-image {
    max-width: 100%;
    border-radius: 16rpx;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
  }

  .info-label {
    font-size: 26rpx;
    color: var(--theme-text-secondary);
  }

  .info-value {
    font-size: 28rpx;
    line-height: 1.6;
    color: var(--theme-text);
    word-break: break-all;
  }
</style>
