<template>
  <view class="image-compress-page">
    <!-- 顶部导航栏（统一组件） -->
    <NavBar
      always-title
      title="图片压缩"
      custom-class="light"
      :custom-style="{ backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }"
    />

    <!-- 主要内容区域 -->
    <view class="main-content">
      <!-- 图片上传区域 -->
      <view class="upload-section">
        <view v-if="!originalImage" class="upload-area" @click="selectImage">
          <view class="upload-icon">
            <uni-icons type="image" size="48" color="#999" />
          </view>
          <text class="upload-text">点击选择图片</text>
          <text class="upload-desc">支持 JPG、PNG、WEBP 格式</text>
        </view>
        
        <view v-else class="image-preview-section">
          <!-- 原始图片预览 -->
          <view class="image-preview">
            <text class="preview-title">原始图片</text>
            <image 
              class="preview-image" 
              :src="originalImage" 
              mode="aspectFit"
            />
            <view class="image-info">
              <text class="image-size">{{ formatFileSize(originalSize) }}</text>
              <text class="image-dimensions">{{ originalDimensions }}</text>
            </view>
          </view>

          <!-- 压缩后图片预览 -->
          <view v-if="compressedImage" class="image-preview">
            <text class="preview-title">压缩后图片</text>
            <image 
              class="preview-image" 
              :src="compressedImage" 
              mode="aspectFit"
            />
            <view class="image-info">
              <text class="image-size">{{ formatFileSize(compressedSize) }}</text>
              <text class="compression-ratio">压缩率: {{ compressionRatio }}%</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 压缩控制区域 -->
      <view v-if="originalImage" class="compress-controls">
        <view class="control-section">
          <text class="control-title">压缩质量</text>
          
          <!-- 滑动条控制 -->
          <view class="slider-control">
            <text class="quality-label">{{ quality }}%</text>
            <slider 
              class="quality-slider"
              :value="quality"
              :min="10"
              :max="100"
              :step="5"
              @change="onQualityChange"
              activeColor="#667eea"
              backgroundColor="#E5E7EB"
            />
          </view>

          <!-- 输入框控制 -->
          <view class="input-control">
            <text class="input-label">质量百分比:</text>
            <input 
              class="quality-input"
              type="number"
              :value="quality"
              @input="onQualityInput"
              placeholder="10-100"
            />
            <text class="input-unit">%</text>
          </view>
        </view>

        <!-- 操作按钮 -->
        <view class="action-buttons">
          <button class="action-btn secondary-btn" @click="resetImage">
            重新选择
          </button>
          <button 
            class="action-btn primary-btn" 
            @click="compressImage"
            :disabled="isCompressing"
          >
            {{ isCompressing ? '压缩中...' : '开始压缩' }}
          </button>
          <button 
            v-if="compressedImage"
            class="action-btn download-btn" 
            @click="downloadImage"
          >
            下载图片
          </button>
        </view>
      </view>

      <!-- 压缩信息展示 -->
      <view v-if="compressedImage" class="compress-info">
        <view class="info-card">
          <view class="info-item">
            <text class="info-label">原始大小:</text>
            <text class="info-value">{{ formatFileSize(originalSize) }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">压缩后大小:</text>
            <text class="info-value">{{ formatFileSize(compressedSize) }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">节省空间:</text>
            <text class="info-value saved">{{ formatFileSize(savedSpace) }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">压缩率:</text>
            <text class="info-value">{{ compressionRatio }}%</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import NavBar from '@/components/nav-bar.vue'
import { ref, computed } from 'vue'

// 声明uni全局对象
declare const uni: any

// 响应式数据
const originalImage = ref<string>('')
const compressedImage = ref<string>('')
const originalSize = ref<number>(0)
const compressedSize = ref<number>(0)
const originalDimensions = ref<string>('')
const quality = ref<number>(80)
const isCompressing = ref<boolean>(false)
const originalFile = ref<File | null>(null)

// 计算属性
const compressionRatio = computed(() => {
  if (originalSize.value === 0 || compressedSize.value === 0) return 0
  return Math.round(((originalSize.value - compressedSize.value) / originalSize.value) * 100)
})

const savedSpace = computed(() => {
  if (originalSize.value === 0 || compressedSize.value === 0) return 0
  return originalSize.value - compressedSize.value
})

// 方法

const selectImage = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['original'],
    sourceType: ['album', 'camera'],
    success: (res: any) => {
      const tempFilePath = res.tempFilePaths[0]
      
      // 获取文件信息
      uni.getFileInfo({
        filePath: tempFilePath,
        success: (fileInfo: any) => {
          originalSize.value = fileInfo.size
          originalImage.value = tempFilePath
          
          // 获取图片信息
          uni.getImageInfo({
            src: tempFilePath,
            success: (imageInfo: any) => {
              originalDimensions.value = `${imageInfo.width} × ${imageInfo.height}`
            }
          })
          
          // 转换为File对象用于压缩
          convertToFile(tempFilePath)
        }
      })
    },
    fail: (err: any) => {
      console.error('选择图片失败:', err)
      uni.showToast({
        title: '选择图片失败',
        icon: 'none'
      })
    }
  })
}

const convertToFile = (filePath: string) => {
  // 在H5环境下，我们需要将图片转换为File对象
  // #ifdef H5
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const img = new Image()
  
  img.onload = () => {
    canvas.width = img.width
    canvas.height = img.height
    ctx?.drawImage(img, 0, 0)
    
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'image.jpg', { type: 'image/jpeg' })
        originalFile.value = file
      }
    }, 'image/jpeg', 1.0)
  }
  
  img.src = filePath
  // #endif
  
  // #ifndef H5
  // 非H5环境暂时不支持File对象，使用路径
  // #endif
}

const onQualityChange = (e: any) => {
  quality.value = e.detail.value
}

const onQualityInput = (e: any) => {
  let value = parseInt(e.detail.value)
  if (isNaN(value)) value = 80
  if (value < 10) value = 10
  if (value > 100) value = 100
  quality.value = value
}

const compressImage = async () => {
  if (!originalImage.value) return
  
  isCompressing.value = true
  
  try {
    // #ifdef H5
    if (originalFile.value) {
      const compressed = await compressImageFile(originalFile.value, quality.value / 100)
      compressedImage.value = URL.createObjectURL(compressed)
      compressedSize.value = compressed.size
    }
    // #endif
    
    // #ifndef H5
    // 非H5环境使用uni-app的压缩API
    uni.compressImage({
      src: originalImage.value,
      quality: quality.value,
      success: (res: any) => {
        compressedImage.value = res.tempFilePath
        
        uni.getFileInfo({
          filePath: res.tempFilePath,
          success: (fileInfo: any) => {
            compressedSize.value = fileInfo.size
          }
        })
      },
      fail: (err: any) => {
        console.error('压缩失败:', err)
        uni.showToast({
          title: '压缩失败',
          icon: 'none'
        })
      }
    })
    // #endif
    
  } catch (error) {
    console.error('压缩失败:', error)
    uni.showToast({
      title: '压缩失败',
      icon: 'none'
    })
  } finally {
    isCompressing.value = false
  }
}

// H5环境下的图片压缩函数
const compressImageFile = (file: File, quality: number): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // 设置canvas尺寸
      canvas.width = img.width
      canvas.height = img.height
      
      // 绘制图片
      ctx?.drawImage(img, 0, 0, img.width, img.height)
      
      // 转换为blob
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('压缩失败'))
        }
      }, 'image/jpeg', quality)
    }
    
    img.onerror = () => {
      reject(new Error('图片加载失败'))
    }
    
    img.src = URL.createObjectURL(file)
  })
}

const downloadImage = () => {
  if (!compressedImage.value) return
  
  // #ifdef H5
  const link = document.createElement('a')
  link.href = compressedImage.value
  link.download = `compressed_image_${Date.now()}.jpg`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  uni.showToast({
    title: '下载成功',
    icon: 'success'
  })
  // #endif
  
  // #ifndef H5
  uni.saveImageToPhotosAlbum({
    filePath: compressedImage.value,
    success: () => {
      uni.showToast({
        title: '保存成功',
        icon: 'success'
      })
    },
    fail: (err: any) => {
      console.error('保存失败:', err)
      uni.showToast({
        title: '保存失败',
        icon: 'none'
      })
    }
  })
  // #endif
}

const resetImage = () => {
  originalImage.value = ''
  compressedImage.value = ''
  originalSize.value = 0
  compressedSize.value = 0
  originalDimensions.value = ''
  quality.value = 80
  originalFile.value = null
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style lang="scss" scoped>
// 统一配色变量（与首页一致）
$bg-color: #f5f7fa;
$card-bg: #ffffff;
$text-primary: #1a1a1a;
$text-secondary: #666666;
$text-hint: #999999;
$border-color: #eaeef3;
$primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
$shadow-sm: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
$shadow-md: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
$radius-md: 24rpx;

.image-compress-page {
  min-height: 100vh;
  background: $bg-color;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 32rpx;
  padding-top: calc(32rpx + var(--nav-height, 120rpx));
  overflow-y: auto;
}

.upload-section {
  margin-bottom: 32rpx;
  
  .upload-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 400rpx;
    background: $card-bg;
    border: 2rpx dashed $border-color;
    border-radius: $radius-md;
    box-shadow: $shadow-sm;
    
    .upload-icon {
      margin-bottom: 24rpx;
    }
    
    .upload-text {
      font-size: 32rpx;
      color: $text-primary;
      margin-bottom: 12rpx;
    }
    
    .upload-desc {
      font-size: 24rpx;
      color: $text-hint;
    }
  }
  
  .image-preview-section {
    display: flex;
    flex-direction: column;
    gap: 32rpx;
    
    .image-preview {
      background: $card-bg;
      border-radius: $radius-md;
      padding: 24rpx;
      box-shadow: $shadow-sm;
      
      .preview-title {
        display: block;
        font-size: 28rpx;
        font-weight: 600;
        color: $text-primary;
        margin-bottom: 16rpx;
      }
      
      .preview-image {
        width: 100%;
        height: 400rpx;
        border-radius: 12rpx;
        margin-bottom: 16rpx;
      }
      
      .image-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .image-size,
        .image-dimensions,
        .compression-ratio {
          font-size: 24rpx;
          color: $text-secondary;
        }
        
        .compression-ratio {
          color: #059669;
          font-weight: 600;
        }
      }
    }
  }
}

.compress-controls {
  background: $card-bg;
  border-radius: $radius-md;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: $shadow-sm;
  
  .control-section {
    margin-bottom: 32rpx;
    
    .control-title {
      display: block;
      font-size: 32rpx;
      font-weight: 600;
      color: $text-primary;
      margin-bottom: 24rpx;
    }
    
    .slider-control {
      display: flex;
      align-items: center;
      margin-bottom: 24rpx;
      
      .quality-label {
        font-size: 28rpx;
        color: #667eea;
        font-weight: 600;
        margin-right: 24rpx;
        min-width: 80rpx;
      }
      
      .quality-slider {
        flex: 1;
      }
    }
    
    .input-control {
      display: flex;
      align-items: center;
      
      .input-label {
        font-size: 28rpx;
        color: $text-primary;
        margin-right: 16rpx;
      }
      
      .quality-input {
        flex: 1;
        height: 80rpx;
        padding: 0 24rpx;
        border: 2rpx solid $border-color;
        border-radius: 12rpx;
        font-size: 28rpx;
        margin-right: 16rpx;
      }
      
      .input-unit {
        font-size: 28rpx;
        color: $text-secondary;
      }
    }
  }
  
  .action-buttons {
    display: flex;
    gap: 16rpx;
    
    .action-btn {
      flex: 1;
      height: 88rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12rpx;
      font-size: 28rpx;
      font-weight: 600;
      border: none;
      
      &.secondary-btn {
        background: #f0f1f3;
        color: $text-primary;
      }
      
      &.primary-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        
        &:disabled {
          background: #9CA3AF;
        }
      }
      
      &.download-btn {
        background: #059669;
        color: white;
      }
    }
  }
}

.compress-info {
  .info-card {
    background: $card-bg;
    border-radius: $radius-md;
    padding: 32rpx;
    box-shadow: $shadow-sm;
    
    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16rpx 0;
      border-bottom: 1rpx solid #F3F4F6;
      
      &:last-child {
        border-bottom: none;
      }
      
      .info-label {
        font-size: 28rpx;
        color: $text-secondary;
      }
      
      .info-value {
        font-size: 28rpx;
        color: $text-primary;
        font-weight: 600;
        
        &.saved {
          color: #059669;
        }
      }
    }
  }
}
</style>