<template>
  <view class="watermark-page">
    <NavBar
      always-title
      title="图片加水印"
      custom-class="light"
      :custom-style="{ backgroundImage: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }"
    />

    <view class="main-content">
      <view class="card upload-card">
        <view v-if="!baseImage.src" class="upload-area" @click="selectBaseImage">
          <uni-icons type="image" size="52" color="#96a0b5" />
          <text class="upload-title">点击选择图片</text>
          <text class="upload-desc">支持 JPG、PNG、WEBP 等格式</text>
          <text class="upload-hint">建议使用高清原图，便于输出清晰水印</text>
        </view>

        <view v-else class="preview-area">
          <view class="preview-header">
            <text class="preview-title">预览</text>
            <view class="preview-meta">
              <text>{{ baseImage.width }} × {{ baseImage.height }}</text>
              <text class="divider">|</text>
              <text>{{ formatFileSize(baseImage.size) }}</text>
            </view>
          </view>
          <view class="preview-canvas">
            <image class="base-image" :src="baseImage.previewSrc" mode="widthFix" />
            <view
              v-if="watermarkMode === 'text' && textWatermark.content"
              class="watermark-overlay"
              :style="textOverlayStyle"
            >
              <text :style="textPreviewStyle">{{ textWatermark.content }}</text>
            </view>
            <view
              v-else-if="watermarkMode === 'image' && imageWatermark.previewSrc"
              class="watermark-overlay"
              :style="imageOverlayStyle"
            >
              <image :src="imageWatermark.previewSrc" :style="imagePreviewStyle" mode="widthFix" />
            </view>
          </view>
          <view class="preview-actions">
            <button class="ghost-btn" @click="selectBaseImage">重新选择</button>
            <button class="ghost-btn" @click="resetAll">清空设置</button>
          </view>
        </view>
      </view>

      <view class="mode-switch" v-if="baseImage.src">
        <view
          class="mode-item"
          :class="{ active: watermarkMode === 'text' }"
          @click="setWatermarkMode('text')"
        >文字水印</view>
        <view
          class="mode-item"
          :class="{ active: watermarkMode === 'image' }"
          @click="setWatermarkMode('image')"
        >图片水印</view>
      </view>

      <view class="card control-card" v-if="baseImage.src && watermarkMode === 'text'">
        <view class="control-group">
          <text class="control-label">水印内容</text>
          <textarea
            v-model.trim="textWatermark.content"
            class="text-input"
            :maxlength="50"
            placeholder="输入水印文字，比如：版权所属·银河工具箱"
          />
        </view>

        <view class="control-grid">
          <view class="control-group">
            <text class="control-label">字体大小 {{ textWatermark.fontSize }}px</text>
            <slider
              :value="textWatermark.fontSize"
              :min="16"
              :max="120"
              :step="2"
              @change="(e) => (textWatermark.fontSize = Number(e.detail.value))"
              activeColor="#4facfe"
              backgroundColor="#e5e7eb"
            />
          </view>
          <view class="control-group">
            <text class="control-label">字体粗细 {{ textWatermark.fontWeight }}</text>
            <slider
              :value="textWatermark.fontWeight"
              :min="300"
              :max="900"
              :step="100"
              @change="(e) => (textWatermark.fontWeight = Number(e.detail.value))"
              activeColor="#4facfe"
              backgroundColor="#e5e7eb"
            />
          </view>
        </view>

        <view class="control-grid">
          <view class="control-group">
            <text class="control-label">透明度 {{ Math.round(textWatermark.opacity * 100) }}%</text>
            <slider
              :value="textWatermark.opacity"
              :min="0.1"
              :max="1"
              :step="0.05"
              @change="(e) => (textWatermark.opacity = Number(e.detail.value))"
              activeColor="#4facfe"
              backgroundColor="#e5e7eb"
            />
          </view>
          <view class="control-group">
            <text class="control-label">旋转角度 {{ textWatermark.rotation }}°</text>
            <slider
              :value="textWatermark.rotation"
              :min="-90"
              :max="90"
              :step="1"
              @change="(e) => (textWatermark.rotation = Number(e.detail.value))"
              activeColor="#4facfe"
              backgroundColor="#e5e7eb"
            />
          </view>
        </view>

        <view class="control-grid">
          <view class="control-group">
            <text class="control-label">水平位置 {{ textWatermark.offsetX }}%</text>
            <slider
              :value="textWatermark.offsetX"
              :min="0"
              :max="100"
              :step="1"
              @change="(e) => (textWatermark.offsetX = Number(e.detail.value))"
              activeColor="#4facfe"
              backgroundColor="#e5e7eb"
            />
          </view>
          <view class="control-group">
            <text class="control-label">垂直位置 {{ textWatermark.offsetY }}%</text>
            <slider
              :value="textWatermark.offsetY"
              :min="0"
              :max="100"
              :step="1"
              @change="(e) => (textWatermark.offsetY = Number(e.detail.value))"
              activeColor="#4facfe"
              backgroundColor="#e5e7eb"
            />
          </view>
        </view>

        <view class="control-group">
          <text class="control-label">颜色</text>
          <view class="color-palette">
            <view
              v-for="item in colorPresets"
              :key="item"
              class="color-swatch"
              :class="{ active: textWatermark.color === item }"
              :style="{ backgroundColor: item }"
              @click="() => (textWatermark.color = item)"
            />
            <input class="color-input" v-model.trim="textWatermark.color" :maxlength="9" />
          </view>
        </view>
      </view>

      <view class="card control-card" v-if="baseImage.src && watermarkMode === 'image'">
        <view class="control-group">
          <text class="control-label">内置贴纸</text>
          <view class="sticker-grid">
            <view
              v-for="item in builtinStickers"
              :key="item.src"
              class="sticker-item"
              :class="{ active: imageWatermark.source === item.src }"
              @click="selectBuiltinSticker(item)"
            >
              <image :src="item.src" mode="aspectFit" />
              <text>{{ item.name }}</text>
            </view>
            <view class="sticker-item upload" @click="selectWatermarkImage">
              <uni-icons type="plus" size="22" color="#4facfe" />
              <text>导入图片</text>
            </view>
          </view>
        </view>

        <view v-if="imageWatermark.previewSrc" class="control-grid">
          <view class="control-group">
            <text class="control-label">尺寸 {{ imageWatermark.scale }}%</text>
            <slider
              :value="imageWatermark.scale"
              :min="5"
              :max="60"
              :step="1"
              @change="(e) => (imageWatermark.scale = Number(e.detail.value))"
              activeColor="#4facfe"
              backgroundColor="#e5e7eb"
            />
          </view>
          <view class="control-group">
            <text class="control-label">透明度 {{ Math.round(imageWatermark.opacity * 100) }}%</text>
            <slider
              :value="imageWatermark.opacity"
              :min="0.1"
              :max="1"
              :step="0.05"
              @change="(e) => (imageWatermark.opacity = Number(e.detail.value))"
              activeColor="#4facfe"
              backgroundColor="#e5e7eb"
            />
          </view>
        </view>

        <view v-if="imageWatermark.previewSrc" class="control-grid">
          <view class="control-group">
            <text class="control-label">水平位置 {{ imageWatermark.offsetX }}%</text>
            <slider
              :value="imageWatermark.offsetX"
              :min="0"
              :max="100"
              :step="1"
              @change="(e) => (imageWatermark.offsetX = Number(e.detail.value))"
              activeColor="#4facfe"
              backgroundColor="#e5e7eb"
            />
          </view>
          <view class="control-group">
            <text class="control-label">垂直位置 {{ imageWatermark.offsetY }}%</text>
            <slider
              :value="imageWatermark.offsetY"
              :min="0"
              :max="100"
              :step="1"
              @change="(e) => (imageWatermark.offsetY = Number(e.detail.value))"
              activeColor="#4facfe"
              backgroundColor="#e5e7eb"
            />
          </view>
        </view>
      </view>

      <view class="card action-card" v-if="baseImage.src">
        <button class="primary-btn" :loading="isGenerating" @click="generateWatermark">生成水印图片</button>
        <button
          class="ghost-btn"
          v-if="generatedImage"
          @click="saveResult"
        >保存/下载图片</button>
      </view>

      <view class="card result-card" v-if="generatedImage">
        <view class="result-header">
          <text class="result-title">导出结果</text>
          <text class="result-desc">长按保存或继续调整</text>
        </view>
        <image class="result-image" :src="generatedImage" mode="widthFix" show-menu-by-longpress />
      </view>
    </view>

    <canvas
      canvas-id="watermarkCanvas"
      id="watermarkCanvas"
      class="hidden-canvas"
      :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"
      :width="canvasWidth"
      :height="canvasHeight"
    ></canvas>
  </view>
</template>

<script setup lang="ts">
import NavBar from '@/components/nav-bar.vue'
import { ref, reactive, computed, getCurrentInstance } from 'vue'

const canvasId = 'watermarkCanvas'
const baseImage = reactive({
  src: '',
  previewSrc: '',
  width: 0,
  height: 0,
  size: 0
})
const watermarkMode = ref<'text' | 'image'>('text')
const generatedImage = ref('')
const isGenerating = ref(false)
const canvasWidth = ref(0)
const canvasHeight = ref(0)

const textWatermark = reactive({
  content: '银河工具箱 Galaxy Tools',
  fontSize: 48,
  fontWeight: 600,
  color: '#ffffff',
  opacity: 0.85,
  rotation: -12,
  offsetX: 82,
  offsetY: 90
})

const imageWatermark = reactive({
  source: '',
  previewSrc: '',
  scale: 25,
  opacity: 0.8,
  offsetX: 80,
  offsetY: 15
})

const watermarkImageInfo = reactive({
  path: '',
  width: 0,
  height: 0
})

const builtinStickers = [
  { name: '银河 Logo', src: '/static/logo.png' }
]

const colorPresets = ['#ffffff', '#000000', '#ff6b6b', '#07c160', '#1d4ed8', '#ffb703']

const textOverlayStyle = computed(() => ({
  left: `${textWatermark.offsetX}%`,
  top: `${textWatermark.offsetY}%`,
  transform: `translate(-50%, -50%) rotate(${textWatermark.rotation}deg)`
}))

const textPreviewStyle = computed(() => ({
  color: textWatermark.color,
  opacity: textWatermark.opacity,
  fontSize: `${textWatermark.fontSize}px`,
  fontWeight: textWatermark.fontWeight
}))

const imageOverlayStyle = computed(() => ({
  left: `${imageWatermark.offsetX}%`,
  top: `${imageWatermark.offsetY}%`,
  transform: 'translate(-50%, -50%)'
}))

const imagePreviewStyle = computed(() => ({
  width: `${imageWatermark.scale * 3}px`,
  opacity: imageWatermark.opacity
}))

const { proxy } = getCurrentInstance() as any

const setWatermarkMode = (mode: 'text' | 'image') => {
  watermarkMode.value = mode
}

const formatFileSize = (size: number) => {
  if (!size) return '0B'
  if (size < 1024) return `${size}B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}KB`
  return `${(size / 1024 / 1024).toFixed(2)}MB`
}

const selectBaseImage = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['original'],
    success: (res) => {
      const temp = res.tempFilePaths[0]
      uni.getImageInfo({
        src: temp,
        success: (info) => {
          baseImage.src = info.path
          baseImage.previewSrc = info.path
          baseImage.width = info.width
          baseImage.height = info.height
          const tempFiles = res.tempFiles as any
          baseImage.size = Array.isArray(tempFiles) ? tempFiles[0]?.size || 0 : tempFiles?.size || 0
          canvasWidth.value = info.width
          canvasHeight.value = info.height
          generatedImage.value = ''
        },
        fail: () => {
          uni.showToast({ title: '图片加载失败', icon: 'none' })
        }
      })
    }
  })
}

const resetAll = () => {
  textWatermark.content = '银河工具箱 Galaxy Tools'
  textWatermark.fontSize = 48
  textWatermark.fontWeight = 600
  textWatermark.color = '#ffffff'
  textWatermark.opacity = 0.85
  textWatermark.rotation = -12
  textWatermark.offsetX = 82
  textWatermark.offsetY = 90

  imageWatermark.source = ''
  imageWatermark.previewSrc = ''
  imageWatermark.scale = 25
  imageWatermark.opacity = 0.8
  imageWatermark.offsetX = 80
  imageWatermark.offsetY = 15
  watermarkImageInfo.path = ''
  watermarkImageInfo.width = 0
  watermarkImageInfo.height = 0
  generatedImage.value = ''
}

const selectBuiltinSticker = (item: { name: string; src: string }) => {
  imageWatermark.source = item.src
  imageWatermark.previewSrc = item.src
  loadWatermarkImage(item.src)
}

const selectWatermarkImage = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['original'],
    success: (res) => {
      const temp = res.tempFilePaths[0]
      imageWatermark.source = temp
      imageWatermark.previewSrc = temp
      loadWatermarkImage(temp)
    }
  })
}

const loadWatermarkImage = (src: string) => {
  uni.getImageInfo({
    src,
    success: (info) => {
      watermarkImageInfo.path = info.path
      watermarkImageInfo.width = info.width
      watermarkImageInfo.height = info.height
    },
    fail: () => {
      uni.showToast({ title: '贴纸加载失败', icon: 'none' })
    }
  })
}

const getCanvasPosition = (offsetX: number, offsetY: number) => {
  return {
    x: (offsetX / 100) * canvasWidth.value,
    y: (offsetY / 100) * canvasHeight.value
  }
}

const hexToRgba = (hex: string, alpha: number) => {
  let normalized = hex.replace('#', '')
  if (normalized.length === 3) {
    normalized = normalized.split('').map((c) => c + c).join('')
  }
  const bigint = parseInt(normalized, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const generateWatermark = () => {
  if (!baseImage.src) {
    uni.showToast({ title: '请先选择图片', icon: 'none' })
    return
  }
  if (watermarkMode.value === 'image' && !watermarkImageInfo.path) {
    uni.showToast({ title: '请选择水印图片', icon: 'none' })
    return
  }
  isGenerating.value = true
  const ctx = uni.createCanvasContext(canvasId, proxy)
  ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value)
  ctx.drawImage(baseImage.src, 0, 0, canvasWidth.value, canvasHeight.value)

  if (watermarkMode.value === 'text' && textWatermark.content) {
    const { x, y } = getCanvasPosition(textWatermark.offsetX, textWatermark.offsetY)
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate((textWatermark.rotation * Math.PI) / 180)
    ctx.font = `${textWatermark.fontWeight} ${textWatermark.fontSize}px sans-serif`
    ctx.setFillStyle(hexToRgba(textWatermark.color, textWatermark.opacity))
    ctx.setTextBaseline('middle')
    ctx.setTextAlign('center')
    ctx.fillText(textWatermark.content, 0, 0)
    ctx.restore()
  }

  if (watermarkMode.value === 'image' && watermarkImageInfo.path) {
    const { x, y } = getCanvasPosition(imageWatermark.offsetX, imageWatermark.offsetY)
    const drawWidth = (canvasWidth.value * imageWatermark.scale) / 100
    const ratio = watermarkImageInfo.width / watermarkImageInfo.height || 1
    const drawHeight = drawWidth / ratio
    ctx.save()
    ctx.globalAlpha = imageWatermark.opacity
    ctx.drawImage(watermarkImageInfo.path, x - drawWidth / 2, y - drawHeight / 2, drawWidth, drawHeight)
    ctx.restore()
  }

  ctx.draw(false, () => {
    uni.canvasToTempFilePath(
      {
        canvasId,
        width: canvasWidth.value,
        height: canvasHeight.value,
        destWidth: canvasWidth.value,
        destHeight: canvasHeight.value,
        success: (res) => {
          generatedImage.value = res.tempFilePath
          uni.showToast({ title: '生成成功', icon: 'success' })
        },
        fail: (err) => {
          console.error(err)
          uni.showToast({ title: '生成失败', icon: 'none' })
        },
        complete: () => {
          isGenerating.value = false
        }
      },
      proxy
    )
  })
}

const saveResult = () => {
  if (!generatedImage.value) return
  // #ifdef MP-WEIXIN
  uni.saveImageToPhotosAlbum({
    filePath: generatedImage.value,
    success: () => uni.showToast({ title: '已保存到相册', icon: 'success' }),
    fail: () => uni.showToast({ title: '保存失败', icon: 'none' })
  })
  // #endif
  // #ifdef H5
  const link = document.createElement('a')
  link.href = generatedImage.value
  link.download = 'watermark-image.png'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  // #endif
}
</script>

<style scoped lang="scss">
.watermark-page {
  min-height: 100vh;
  background: #f5f7fb;
}

.main-content {
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.card {
  background: #fff;
  border-radius: 24rpx;
  padding: 28rpx;
  box-shadow: 0 12rpx 30rpx rgba(15, 23, 42, 0.05);
}

.upload-area {
  border: 2rpx dashed #d5dbe8;
  border-radius: 24rpx;
  padding: 120rpx 32rpx;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  color: #5a6478;
}

.upload-title {
  font-size: 32rpx;
  font-weight: 600;
}

.upload-desc {
  font-size: 26rpx;
}

.upload-hint {
  font-size: 24rpx;
  color: #9aa3b7;
}

.preview-area {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-title {
  font-size: 30rpx;
  font-weight: 600;
}

.preview-meta {
  font-size: 24rpx;
  color: #94a3b8;
  display: flex;
  gap: 8rpx;
}

.divider {
  color: #cbd5f5;
}

.preview-canvas {
  position: relative;
  border-radius: 20rpx;
  overflow: hidden;
  background: #0f172a;
}

.base-image {
  width: 100%;
  display: block;
}

.watermark-overlay {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.preview-actions {
  display: flex;
  gap: 16rpx;
}

.mode-switch {
  display: flex;
  gap: 16rpx;
}

.mode-item {
  flex: 1;
  padding: 24rpx;
  text-align: center;
  border-radius: 18rpx;
  background: #f1f5f9;
  font-weight: 600;
  color: #475569;
}

.mode-item.active {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  color: #fff;
}

.control-card {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.control-label {
  font-size: 28rpx;
  font-weight: 600;
}

.text-input {
  min-height: 150rpx;
  border: 1rpx solid #e2e8f0;
  border-radius: 16rpx;
  padding: 16rpx;
  font-size: 28rpx;
}

.control-grid {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

@media (min-width: 768px) {
  .control-grid {
    flex-direction: row;
    gap: 32rpx;
  }
  .control-group {
    flex: 1;
  }
}

.color-palette {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
}

.color-swatch {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  border: 2rpx solid transparent;
}

.color-swatch.active {
  border-color: #1d4ed8;
}

.color-input {
  border: 1rpx solid #e2e8f0;
  border-radius: 12rpx;
  padding: 8rpx 12rpx;
  min-width: 160rpx;
  font-size: 26rpx;
}

.sticker-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180rpx, 1fr));
  gap: 16rpx;
}

.sticker-item {
  border: 1rpx solid #e2e8f0;
  border-radius: 16rpx;
  padding: 16rpx;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  color: #475569;
}

.sticker-item.active {
  border-color: #4facfe;
  box-shadow: 0 8rpx 16rpx rgba(79, 172, 254, 0.15);
}

.sticker-item image {
  width: 100%;
  height: 120rpx;
  object-fit: contain;
}

.sticker-item.upload {
  border-style: dashed;
  color: #4facfe;
  justify-content: center;
  align-items: center;
}

.action-card {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.primary-btn,
.ghost-btn {
  height: 96rpx;
  border-radius: 20rpx;
  font-size: 30rpx;
}

.primary-btn {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  color: #fff;
}

.ghost-btn {
  background: #eef2ff;
  color: #1d4ed8;
}

.result-card {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.result-header {
  display: flex;
  justify-content: space-between;
  color: #94a3b8;
}

.result-image {
  width: 100%;
  border-radius: 18rpx;
  border: 1rpx solid #e2e8f0;
}

.hidden-canvas {
  position: fixed;
  left: -9999px;
  top: -9999px;
}

.ghost-btn,
.primary-btn {
  border: none;
}
</style>
