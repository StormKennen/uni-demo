<template>
  <view class="gif-page">
    <nav-bar
      always-title
      title="视频转GIF"
      custom-class="light"
      :custom-style="{ backgroundImage: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' }" />

    <view class="content">
      <view class="section">
        <view class="section-title">选择视频</view>
        <view class="upload-area" @click="chooseVideo">
          <view v-if="!videoSrc" class="upload-placeholder">
            <text class="upload-icon">🎬</text>
            <text class="upload-text">点击选择视频文件</text>
            <text class="upload-hint">支持 MP4/MOV 等常见格式</text>
          </view>
          <view v-else class="video-preview">
            <video :src="videoSrc" class="preview-video" :controls="false" :autoplay="false" :show-center-play-btn="false" />
            <view class="video-info">
              <text>时长：{{ formatDuration(videoDuration) }}</text>
              <text class="reselect" @click.stop="chooseVideo">重新选择</text>
            </view>
          </view>
        </view>
      </view>

      <view v-if="videoSrc" class="section">
        <view class="section-title">参数设置</view>
        <view class="param-row">
          <text class="param-label">帧率 (FPS)</text>
          <view class="param-control">
            <text class="param-btn" @click="fps = Math.max(2, fps - 1)">−</text>
            <text class="param-value">{{ fps }}</text>
            <text class="param-btn" @click="fps = Math.min(15, fps + 1)">+</text>
          </view>
        </view>
        <view class="param-row">
          <text class="param-label">宽度 (px)</text>
          <view class="param-control">
            <text class="param-btn" @click="outputWidth = Math.max(100, outputWidth - 50)">−</text>
            <text class="param-value">{{ outputWidth }}</text>
            <text class="param-btn" @click="outputWidth = Math.min(800, outputWidth + 50)">+</text>
          </view>
        </view>
        <view class="param-row">
          <text class="param-label">起止时间 (秒)</text>
          <view class="time-inputs">
            <input v-model="startTime" class="time-input" type="digit" placeholder="起始" />
            <text class="time-sep">~</text>
            <input v-model="endTime" class="time-input" type="digit" placeholder="结束" />
          </view>
        </view>
        <view class="param-hint"> 预计帧数：{{ estimatedFrames }}，建议不超过 100 帧 </view>
      </view>

      <button v-if="videoSrc" class="convert-btn" :disabled="converting" @click="startConvert">
        {{ converting ? `转换中 ${progress}%` : '开始转换 GIF' }}
      </button>

      <view v-if="converting" class="progress-section">
        <view class="progress-bar">
          <view class="progress-inner" :style="{ width: progress + '%' }" />
        </view>
        <text class="progress-text">{{ statusText }}</text>
      </view>

      <view v-if="gifResult" class="section result-section">
        <view class="section-title">转换结果</view>
        <image :src="gifResult" class="gif-preview" mode="widthFix" />
        <view class="result-info">
          <text>尺寸：{{ resultSize }}</text>
        </view>
        <view class="result-actions">
          <button class="action-btn primary" @click="saveGif">保存到相册</button>
          <button class="action-btn" @click="shareGif">分享</button>
        </view>
      </view>

      <!-- H5 hidden elements -->
      <!-- #ifdef H5 -->
      <video ref="hiddenVideoRef" :src="videoSrc" class="hidden-video" muted preload="auto" />
      <canvas ref="frameCanvasRef" class="hidden-canvas" :width="canvasWidth" :height="canvasHeight" />
      <!-- #endif -->
    </view>
  </view>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'

  const videoSrc = ref('')
  const videoDuration = ref(0)
  const fps = ref(8)
  const outputWidth = ref(320)
  const startTime = ref('')
  const endTime = ref('')
  const converting = ref(false)
  const progress = ref(0)
  const statusText = ref('')
  const gifResult = ref('')
  const resultSize = ref('')
  const canvasWidth = ref(320)
  const canvasHeight = ref(180)

  const estimatedFrames = computed(() => {
    const start = Number(startTime.value) || 0
    const end = Number(endTime.value) || videoDuration.value
    const duration = Math.max(0, end - start)
    return Math.ceil(duration * fps.value)
  })

  const formatDuration = (seconds: number): string => {
    const m = Math.floor(seconds / 60)
    const s = Math.round(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const chooseVideo = () => {
    uni.chooseVideo({
      sourceType: ['album'],
      compressed: false,
      success: res => {
        videoSrc.value = res.tempFilePath
        videoDuration.value = res.duration || 0
        gifResult.value = ''
        if (!endTime.value && res.duration) {
          endTime.value = String(Math.min(res.duration, 5))
        }
      },
    })
  }

  // GIF encoder - pure JS implementation (LZW based)
  class GifEncoder {
    private width: number
    private height: number
    private frames: ImageData[] = []
    private delay: number

    constructor(width: number, height: number, fps: number) {
      this.width = width
      this.height = height
      this.delay = Math.round(100 / fps)
    }

    addFrame(imageData: ImageData) {
      this.frames.push(imageData)
    }

    encode(): Uint8Array {
      const stream: number[] = []

      // GIF89a header
      stream.push(0x47, 0x49, 0x46, 0x38, 0x39, 0x61)

      // Logical Screen Descriptor
      stream.push(this.width & 0xff, (this.width >> 8) & 0xff)
      stream.push(this.height & 0xff, (this.height >> 8) & 0xff)
      stream.push(0xf7, 0x00, 0x00) // GCT flag, 256 colors

      // Global Color Table (256 colors, uniform quantization)
      for (let r = 0; r < 8; r++) {
        for (let g = 0; g < 8; g++) {
          for (let b = 0; b < 4; b++) {
            stream.push(Math.round((r / 7) * 255))
            stream.push(Math.round((g / 7) * 255))
            stream.push(Math.round((b / 3) * 255))
          }
        }
      }

      // Netscape extension for looping
      stream.push(0x21, 0xff, 0x0b)
      const netscape = 'NETSCAPE2.0'
      for (let i = 0; i < netscape.length; i++) stream.push(netscape.charCodeAt(i))
      stream.push(0x03, 0x01, 0x00, 0x00, 0x00)

      for (const frame of this.frames) {
        // Graphic Control Extension
        stream.push(0x21, 0xf9, 0x04)
        stream.push(0x00) // no transparency
        stream.push(this.delay & 0xff, (this.delay >> 8) & 0xff)
        stream.push(0x00, 0x00)

        // Image Descriptor
        stream.push(0x2c)
        stream.push(0x00, 0x00, 0x00, 0x00) // position
        stream.push(this.width & 0xff, (this.width >> 8) & 0xff)
        stream.push(this.height & 0xff, (this.height >> 8) & 0xff)
        stream.push(0x00) // no LCT

        // Image data - LZW encode
        const pixels = this.quantizeFrame(frame)
        const encoded = this.lzwEncode(8, pixels)
        stream.push(8) // LZW min code size
        // Write sub-blocks
        let offset = 0
        while (offset < encoded.length) {
          const blockSize = Math.min(255, encoded.length - offset)
          stream.push(blockSize)
          for (let i = 0; i < blockSize; i++) {
            stream.push(encoded[offset + i])
          }
          offset += blockSize
        }
        stream.push(0x00) // block terminator
      }

      stream.push(0x3b) // GIF trailer
      return new Uint8Array(stream)
    }

    private quantizeFrame(imageData: ImageData): number[] {
      const data = imageData.data
      const pixels: number[] = []
      for (let i = 0; i < data.length; i += 4) {
        const r = Math.round((data[i] / 255) * 7)
        const g = Math.round((data[i + 1] / 255) * 7)
        const b = Math.round((data[i + 2] / 255) * 3)
        pixels.push(r * 32 + g * 4 + b)
      }
      return pixels
    }

    private lzwEncode(minCodeSize: number, pixels: number[]): number[] {
      const clearCode = 1 << minCodeSize
      const eoiCode = clearCode + 1
      let codeSize = minCodeSize + 1
      let nextCode = eoiCode + 1
      const maxCode = 4096

      const output: number[] = []
      let buffer = 0
      let bufferBits = 0

      const emit = (code: number) => {
        buffer |= code << bufferBits
        bufferBits += codeSize
        while (bufferBits >= 8) {
          output.push(buffer & 0xff)
          buffer >>= 8
          bufferBits -= 8
        }
      }

      const table = new Map<string, number>()
      const resetTable = () => {
        table.clear()
        for (let i = 0; i < clearCode; i++) {
          table.set(String(i), i)
        }
        codeSize = minCodeSize + 1
        nextCode = eoiCode + 1
      }

      resetTable()
      emit(clearCode)

      if (pixels.length === 0) {
        emit(eoiCode)
        if (bufferBits > 0) output.push(buffer & 0xff)
        return output
      }

      let current = String(pixels[0])
      for (let i = 1; i < pixels.length; i++) {
        const next = current + ',' + pixels[i]
        if (table.has(next)) {
          current = next
        } else {
          emit(table.get(current)!)
          if (nextCode < maxCode) {
            table.set(next, nextCode++)
            if (nextCode > 1 << codeSize && codeSize < 12) {
              codeSize++
            }
          } else {
            emit(clearCode)
            resetTable()
          }
          current = String(pixels[i])
        }
      }
      emit(table.get(current)!)
      emit(eoiCode)
      if (bufferBits > 0) output.push(buffer & 0xff)
      return output
    }
  }

  const startConvert = async () => {
    // #ifdef H5
    await convertH5()
    // #endif
    // #ifndef H5
    uni.showToast({ title: '该功能仅支持 H5 端', icon: 'none' })
    // #endif
  }

  // #ifdef H5
  const convertH5 = async () => {
    converting.value = true
    progress.value = 0
    statusText.value = '准备中...'
    gifResult.value = ''

    try {
      const video = document.createElement('video')
      video.src = videoSrc.value
      video.muted = true
      video.preload = 'auto'
      video.crossOrigin = 'anonymous'

      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => resolve()
        video.onerror = () => reject(new Error('视频加载失败'))
        video.load()
      })

      const start = Number(startTime.value) || 0
      const end = Number(endTime.value) || Math.min(video.duration, 5)
      const totalFrames = Math.ceil((end - start) * fps.value)
      const ratio = video.videoHeight / video.videoWidth
      const w = outputWidth.value
      const h = Math.round(w * ratio)
      canvasWidth.value = w
      canvasHeight.value = h

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')!

      const encoder = new GifEncoder(w, h, fps.value)
      statusText.value = '提取帧...'

      for (let i = 0; i < totalFrames; i++) {
        const time = start + i / fps.value
        video.currentTime = time
        await new Promise<void>(resolve => {
          video.onseeked = () => resolve()
        })
        ctx.drawImage(video, 0, 0, w, h)
        const imageData = ctx.getImageData(0, 0, w, h)
        encoder.addFrame(imageData)
        progress.value = Math.round(((i + 1) / totalFrames) * 80)
        statusText.value = `提取帧 ${i + 1}/${totalFrames}`
      }

      statusText.value = '编码 GIF...'
      progress.value = 85

      // Yield to UI
      await new Promise(resolve => setTimeout(resolve, 50))

      const gifData = encoder.encode()
      progress.value = 95
      statusText.value = '生成文件...'

      const blob = new Blob([gifData], { type: 'image/gif' })
      gifResult.value = URL.createObjectURL(blob)
      resultSize.value = formatFileSize(blob.size)
      progress.value = 100
      statusText.value = '完成'
    } catch (error) {
      const message = error instanceof Error ? error.message : '转换失败'
      uni.showToast({ title: message, icon: 'none' })
    } finally {
      converting.value = false
    }
  }
  // #endif

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const saveGif = () => {
    // #ifdef H5
    if (gifResult.value) {
      const a = document.createElement('a')
      a.href = gifResult.value
      a.download = `video-${Date.now()}.gif`
      a.click()
    }
    // #endif
    // #ifndef H5
    uni.showToast({ title: '请长按图片保存', icon: 'none' })
    // #endif
  }

  const shareGif = () => {
    uni.showToast({ title: '请长按图片分享', icon: 'none' })
  }
</script>

<style scoped lang="scss">
  .gif-page {
    min-height: 100vh;
    background: #f4f6fb;
  }

  .content {
    padding: 24rpx;
  }

  .section {
    margin-bottom: 24rpx;
    padding: 24rpx;
    border-radius: 18rpx;
    background: #fff;
    box-shadow: 0 2rpx 12rpx rgba(34, 48, 76, 0.05);
  }

  .section-title {
    font-size: 28rpx;
    font-weight: 800;
    color: #1b2434;
    margin-bottom: 16rpx;
  }

  .upload-area {
    border: 3rpx dashed #d1d5db;
    border-radius: 16rpx;
    overflow: hidden;
  }

  .upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60rpx 0;
    gap: 12rpx;
  }

  .upload-icon {
    font-size: 64rpx;
  }

  .upload-text {
    font-size: 28rpx;
    color: #4b5563;
    font-weight: 700;
  }

  .upload-hint {
    font-size: 22rpx;
    color: #9ca3af;
  }

  .video-preview {
    padding: 20rpx;
  }

  .preview-video {
    width: 100%;
    height: 300rpx;
    border-radius: 12rpx;
  }

  .video-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 12rpx;
    font-size: 24rpx;
    color: #6b7280;
  }

  .reselect {
    color: #f59e0b;
    font-weight: 700;
  }

  .param-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16rpx 0;
    border-bottom: 1rpx solid #f3f4f6;
  }

  .param-row:last-child {
    border-bottom: none;
  }

  .param-label {
    font-size: 26rpx;
    color: #374151;
    font-weight: 700;
  }

  .param-control {
    display: flex;
    align-items: center;
    gap: 24rpx;
  }

  .param-btn {
    width: 56rpx;
    height: 56rpx;
    border-radius: 50%;
    background: #f3f4f6;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    font-weight: 700;
    color: #374151;
    line-height: 56rpx;
    text-align: center;
  }

  .param-value {
    min-width: 80rpx;
    text-align: center;
    font-size: 30rpx;
    font-weight: 800;
    color: #1f2937;
  }

  .time-inputs {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }

  .time-input {
    width: 120rpx;
    height: 60rpx;
    border: 2rpx solid #e5e7eb;
    border-radius: 10rpx;
    text-align: center;
    font-size: 26rpx;
  }

  .time-sep {
    color: #9ca3af;
    font-size: 28rpx;
  }

  .param-hint {
    margin-top: 12rpx;
    font-size: 22rpx;
    color: #9ca3af;
  }

  .convert-btn {
    width: 100%;
    height: 88rpx;
    border-radius: 16rpx;
    background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
    color: #fff;
    font-size: 30rpx;
    font-weight: 800;
    border: none;
    margin-bottom: 24rpx;
    line-height: 88rpx;
  }

  .convert-btn[disabled] {
    opacity: 0.6;
  }

  .progress-section {
    margin-bottom: 24rpx;
  }

  .progress-bar {
    height: 12rpx;
    border-radius: 999rpx;
    background: #e5e7eb;
    overflow: hidden;
  }

  .progress-inner {
    height: 100%;
    border-radius: 999rpx;
    background: linear-gradient(90deg, #f59e0b, #ef4444);
    transition: width 0.3s;
  }

  .progress-text {
    display: block;
    margin-top: 8rpx;
    font-size: 22rpx;
    color: #6b7280;
    text-align: center;
  }

  .gif-preview {
    width: 100%;
    border-radius: 12rpx;
  }

  .result-info {
    margin-top: 12rpx;
    font-size: 24rpx;
    color: #6b7280;
  }

  .result-actions {
    display: flex;
    gap: 16rpx;
    margin-top: 20rpx;
  }

  .action-btn {
    flex: 1;
    height: 72rpx;
    border-radius: 12rpx;
    font-size: 26rpx;
    font-weight: 700;
    background: #f3f4f6;
    color: #374151;
    border: none;
    line-height: 72rpx;
  }

  .action-btn.primary {
    background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
    color: #fff;
  }

  .hidden-video,
  .hidden-canvas {
    position: fixed;
    left: -9999rpx;
    top: -9999rpx;
    opacity: 0;
    pointer-events: none;
  }
</style>
