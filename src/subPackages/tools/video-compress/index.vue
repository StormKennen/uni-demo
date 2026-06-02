<template>
  <view class="video-compress-page">
    <!-- 顶部导航栏 -->
    <NavBar
      always-title
      title="视频压缩神器"
      custom-class="light"
      :custom-style="{ backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }"
    />

    <!-- 主要内容区域 -->
    <view class="main-content">
      <!-- 视频选择区域 -->
      <view class="upload-section">
        <view v-if="!videoInfo.path" class="upload-area" @click="handleSelectVideo">
          <view class="upload-icon">
            <text class="plus-icon">+</text>
          </view>
          <text class="upload-text">选择文件</text>
          <text class="upload-desc">支持 MP4、MOV 等常见格式</text>
        </view>
        
        <view v-else class="video-preview-section" @click="handleSelectVideo">
          <!-- #ifdef MP-WEIXIN -->
          <video
            v-if="videoInfo.path"
            class="preview-video"
            :src="videoInfo.path"
            :poster="videoInfo.thumbPath"
            :controls="false"
            :autoplay="false"
            object-fit="contain"
          />
          <!-- #endif -->
          <!-- #ifdef H5 -->
          <view class="video-placeholder">
            <uni-icons type="videocam" size="64" color="#667eea" />
            <text class="video-name">{{ videoInfo.name || '已选择视频' }}</text>
          </view>
          <!-- #endif -->
          <view class="reselect-tip">点击重新选择</view>
        </view>
      </view>

      <!-- 压缩参数控制区域 -->
      <view class="compress-controls">
        <!-- 压缩质量预设场景组 -->
        <view class="quality-presets">
          <text class="section-title">压缩预设方案</text>
          <view class="preset-buttons">
            <view 
              v-for="preset in qualityPresets" 
              :key="preset.value"
              class="preset-btn"
              :class="{ active: currentPreset === preset.value }"
              @click="selectPreset(preset.value)"
            >
              {{ preset.label }}
            </view>
          </view>
        </view>

        <!-- 预设方案详细释义说明 -->
        <view class="preset-description">
          <text class="desc-icon">💡</text>
          <text class="desc-text">{{ selectedPresetDesc }}</text>
        </view>

        <!-- 手动微调滑块区域 -->
        <view class="advanced-controls">
          <text class="section-title spec-title">参数微调 (拖动滑块定制)</text>
          
          <!-- 视频码率 -->
          <view class="slider-group">
            <view class="slider-header">
              <text class="slider-label">视频码率 (Bitrate)</text>
              <text class="slider-value" :class="{ 'warning-color': hasBloatRisk }">{{ compressParams.bitrate }} kbps</text>
            </view>
            <slider 
              :value="compressParams.bitrate"
              :min="200"
              :max="10000"
              :step="50"
              @change="onBitrateChange"
              @changing="onBitrateChanging"
              activeColor="#667eea"
              backgroundColor="#E5E7EB"
            />
            <view class="original-bitrate-hint" v-if="originalBitrate > 0">
              <text class="hint-text">原视频码率: ~{{ originalBitrate }} kbps</text>
              <text class="warning-badge" v-if="hasBloatRisk">⚠️ 码率偏高，体积可能膨胀</text>
            </view>
          </view>

          <!-- 视频帧率 -->
          <view class="slider-group">
            <view class="slider-header">
              <text class="slider-label">视频帧率 (FPS)</text>
              <text class="slider-value">{{ compressParams.fps }} fps</text>
            </view>
            <slider 
              :value="compressParams.fps"
              :min="10"
              :max="60"
              :step="1"
              @change="onFpsChange"
              @changing="onFpsChanging"
              activeColor="#667eea"
              backgroundColor="#E5E7EB"
            />
          </view>

          <!-- 分辨率缩放 -->
          <view class="slider-group">
            <view class="slider-header">
              <text class="slider-label">分辨率缩放 (Resolution)</text>
              <text class="slider-value">{{ compressParams.resolution }}%</text>
            </view>
            <slider 
              :value="compressParams.resolution"
              :min="10"
              :max="100"
              :step="5"
              @change="onResolutionChange"
              @changing="onResolutionChanging"
              activeColor="#667eea"
              backgroundColor="#E5E7EB"
            />
          </view>
        </view>
      </view>

      <!-- 数据看板 -->
      <view class="info-dashboard">
        <text class="section-title">视频信息</text>
        <view class="info-grid">
          <view class="info-card">
            <text class="info-title">压缩前</text>
            <view class="info-row">
              <text class="info-label">大小:</text>
              <text class="info-value">{{ formatFileSize(videoInfo.size) }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">分辨率:</text>
              <text class="info-value">{{ videoInfo.width && videoInfo.height ? `${videoInfo.width}×${videoInfo.height}` : '--' }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">时长:</text>
              <text class="info-value">{{ formatDuration(videoInfo.duration) }}</text>
            </view>
          </view>
          <view class="info-card">
            <text class="info-title">压缩后 <text class="estimate-tag">[预估]</text></text>
            <view class="info-row">
              <text class="info-label">大小:</text>
              <text class="info-value highlight">{{ formatFileSize(estimatedSize) }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">分辨率:</text>
              <text class="info-value">{{ estimatedResolution }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">节省:</text>
              <text class="info-value saved">{{ compressionRatio }}%</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-section">
        <button 
          class="compress-btn"
          :disabled="!videoInfo.path || isCompressing"
          @click="handleCompress"
        >
          {{ isCompressing ? '压缩中...' : '开始压缩' }}
        </button>
      </view>

      <!-- 温馨提示 -->
      <view class="tips-section">
        <text class="tips-title">使用说明</text>
        <view class="tips-content">
          <text class="tip-item">• 支持格式：MP4、MOV、AVI、M4V、3GP、MKV</text>
          <text class="tip-item">• 文件限制：最大 500MB，时长不超过 10 分钟</text>
          <text class="tip-item">• 选择方式：从相册选择或从聊天记录选择</text>
          <text class="tip-item">• 压缩后的视频将自动保存到系统相册</text>
          <text class="tip-item">• 如遇问题，请尝试重启小程序或使用聊天记录模式</text>
          <text class="tip-item">• H5 环境暂不支持本地视频压缩功能</text>
        </view>
      </view>
    </view>

    <!-- H5引导弹窗 -->
    <uni-popup ref="h5GuidePopup" type="center">
      <view class="h5-guide-modal">
        <text class="modal-title">功能提示</text>
        <text class="modal-desc">H5 环境暂不支持本地视频压缩，请前往小程序操作</text>
        <image 
          v-if="miniProgramQrCode" 
          class="qr-image" 
          :src="miniProgramQrCode" 
          mode="aspectFit"
        />
        <view class="modal-actions">
          <button class="modal-btn secondary" @click="copyMiniProgramPath">复制小程序路径</button>
          <button class="modal-btn primary" @click="closeH5Guide">我知道了</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup lang="ts">
import NavBar from '@/components/nav-bar.vue'
import { ref, reactive, computed, watch } from 'vue'

// 微信小程序 API 类型声明
declare const wx: any

// 全局常量 - 小程序原始ID和二维码路径
const MINI_PROGRAM_ORIGINAL_ID = 'gh_xxxxxxxx' // 替换为实际的小程序原始ID
const MINI_PROGRAM_PATH = '/subPackages/tools/video-compress/index'
const miniProgramQrCode = ref('/static/image/mp-qrcode.png') // 小程序二维码图片路径

// 压缩场景预设方案
const qualityPresets = [
  { 
    label: '极限超级压缩', 
    value: 'extreme', 
    desc: '最省空间：15%分辨率 + 10fps + 300kbps 码率，适合监控、PPT教学等极限省流发送场景',
    bitrate: 300, 
    fps: 10, 
    resolution: 15 
  },
  { 
    label: '日常微信高清', 
    value: 'wechat', 
    desc: '社交首选：70%分辨率 + 24fps + 1500kbps 码率，肉眼无明显糊感且完美对齐微信分享限流（低于25MB）',
    bitrate: 1500, 
    fps: 24, 
    resolution: 70 
  },
  { 
    label: '轻度体积微调', 
    value: 'light', 
    desc: '温和微调：85%分辨率 + 30fps + 3500kbps 码率，针对微型超限视频轻量修剪，完美保留细节',
    bitrate: 3500, 
    fps: 30, 
    resolution: 85 
  },
  { 
    label: '原画几乎无损', 
    value: 'original', 
    desc: '原画品质：100%分辨率 + 30fps + 6000kbps 码率，去除冗余高码，维持原生像素级画质',
    bitrate: 6000, 
    fps: 30, 
    resolution: 100 
  }
]

// 响应式数据
const currentPreset = ref('wechat')
const isCompressing = ref(false)
const h5GuidePopup = ref<any>(null)

// 选中预设的详细解释
const selectedPresetDesc = computed(() => {
  const preset = qualityPresets.find(p => p.value === currentPreset.value)
  return preset ? preset.desc : '手动微调模式：您可以自由拖动下方滑块定制参数，并实时在下方查看预估大小'
})

// 视频信息
const videoInfo = reactive({
  path: '',
  thumbPath: '',
  name: '',
  size: 0,
  width: 0,
  height: 0,
  duration: 0
})

// 压缩参数
const compressParams = reactive({
  bitrate: 1500,
  fps: 24,
  resolution: 70
})

// 计算预估大小: 预估MB = (码率kbps * 时长s) / 8 / 1024
const calcEstimateSize = (bitrateKbps: number, durationS: number): number => {
  if (!durationS || durationS <= 0) return 0
  const sizeMB = (bitrateKbps * durationS) / 8 / 1024
  return sizeMB * 1024 * 1024 // 转换为字节
}

// 原视频估算码率 (kbps)
const originalBitrate = computed(() => {
  if (!videoInfo.size || !videoInfo.duration) return 0
  // size(bytes) * 8 / duration(seconds) / 1024 => kbps
  return Math.round((videoInfo.size * 8) / videoInfo.duration / 1024)
})

// 是否存在体积膨胀风险（设置码率 > 原片码率）
const hasBloatRisk = computed(() => {
  if (!originalBitrate.value) return false
  return compressParams.bitrate > originalBitrate.value
})

// 预估压缩后大小
const estimatedSize = computed(() => {
  return calcEstimateSize(compressParams.bitrate, videoInfo.duration)
})

// 预估分辨率
const estimatedResolution = computed(() => {
  if (!videoInfo.width || !videoInfo.height) return '--'
  const scale = compressParams.resolution / 100
  const newWidth = Math.round(videoInfo.width * scale)
  const newHeight = Math.round(videoInfo.height * scale)
  return `${newWidth}×${newHeight}`
})

// 压缩率
const compressionRatio = computed(() => {
  if (!videoInfo.size || !estimatedSize.value) return 0
  const ratio = ((videoInfo.size - estimatedSize.value) / videoInfo.size) * 100
  return Math.max(0, Math.round(ratio))
})

// 选择预设
const selectPreset = (preset: string) => {
  currentPreset.value = preset
  const presetConfig = qualityPresets.find(p => p.value === preset)
  if (presetConfig) {
    compressParams.bitrate = presetConfig.bitrate
    compressParams.fps = presetConfig.fps
    compressParams.resolution = presetConfig.resolution
  }
}

// 滑块事件处理
const onBitrateChange = (e: any) => {
  compressParams.bitrate = e.detail.value
  currentPreset.value = ''
}

const onBitrateChanging = (e: any) => {
  compressParams.bitrate = e.detail.value
}

const onFpsChange = (e: any) => {
  compressParams.fps = e.detail.value
  currentPreset.value = ''
}

const onFpsChanging = (e: any) => {
  compressParams.fps = e.detail.value
}

const onResolutionChange = (e: any) => {
  compressParams.resolution = e.detail.value
  currentPreset.value = ''
}

const onResolutionChanging = (e: any) => {
  compressParams.resolution = e.detail.value
}

// 选择视频
const handleSelectVideo = () => {
  // #ifdef MP-WEIXIN
  uni.showActionSheet({
    itemList: ['从相册选择', '从聊天记录选择'],
    success: (res) => {
      if (res.tapIndex === 0) {
        chooseVideoFromAlbum()
      } else if (res.tapIndex === 1) {
        chooseVideoFromChat()
      }
    }
  })
  // #endif
  
  // #ifdef H5
  chooseVideoFromAlbum()
  // #endif
}

// 从相册选择视频 - 只从相册选择，不需要相机权限
const chooseVideoFromAlbum = () => {
  // #ifdef MP-WEIXIN
  // 微信小程序需要先检查隐私授权（与图片压缩保持一致）
  if (wx.getPrivacySetting) {
    wx.getPrivacySetting({
      success: (res: any) => {
        console.log('隐私设置状态:', res)
        doChooseVideo()
      },
      fail: () => {
        doChooseVideo()
      }
    })
  } else {
    doChooseVideo()
  }
  // #endif

  // #ifndef MP-WEIXIN
  doChooseVideo()
  // #endif
}

// 处理选择成功后的视频信息
const applyVideoInfo = (path: string, opts: { thumb?: string; size?: number; duration?: number; width?: number; height?: number } = {}) => {
  videoInfo.path = path
  videoInfo.thumbPath = opts.thumb || ''
  videoInfo.size = opts.size || 0
  videoInfo.duration = opts.duration || 0
  videoInfo.width = opts.width || 0
  videoInfo.height = opts.height || 0
  videoInfo.name = path.split('/').pop() || '视频文件'

  if (!videoInfo.duration || !videoInfo.width || !videoInfo.height || !videoInfo.size) {
    uni.getVideoInfo({
      src: path,
      success: (info: any) => {
        console.log('补充视频信息:', info)
        videoInfo.duration = videoInfo.duration || info.duration || 0
        videoInfo.width = videoInfo.width || info.width || 0
        videoInfo.height = videoInfo.height || info.height || 0
        videoInfo.size = videoInfo.size || info.size || 0
      },
      fail: (err: any) => console.warn('获取视频信息失败:', err)
    })
  }
}

// 实际执行选择视频
const doChooseVideo = () => {
  // #ifdef MP-WEIXIN
  // 微信小程序：优先使用现代 wx.chooseMedia（uni.chooseVideo 在新版基础库已废弃）
  if (typeof wx !== 'undefined' && typeof wx.chooseMedia === 'function') {
    wx.chooseMedia({
      count: 1,
      mediaType: ['video'],
      sourceType: ['album'],
      maxDuration: 60,
      camera: 'back',
      success: (res: any) => {
        console.log('wx.chooseMedia 成功:', res)
        const media = res.tempFiles && res.tempFiles[0]
        if (!media || !media.tempFilePath) {
          uni.showToast({ title: '未获取到视频文件', icon: 'none' })
          return
        }
        applyVideoInfo(media.tempFilePath, {
          thumb: media.thumbTempFilePath,
          size: media.size,
          duration: media.duration,
          width: media.width,
          height: media.height
        })
      },
      fail: (err: any) => {
        console.error('wx.chooseMedia 失败:', JSON.stringify(err))
        if (err.errMsg && err.errMsg.includes('cancel')) return
        uni.showToast({
          title: err.errMsg || '选择视频失败',
          icon: 'none',
          duration: 4000
        })
      }
    })
    return
  }
  // #endif

  uni.chooseVideo({
    sourceType: ['album'],
    compressed: false,
    maxDuration: 60,
    success: (res: any) => {
      console.log('uni.chooseVideo 成功:', res)
      applyVideoInfo(res.tempFilePath, {
        thumb: res.thumbTempFilePath,
        size: res.size,
        duration: res.duration,
        width: res.width,
        height: res.height
      })
    },
    fail: (err: any) => {
      console.error('uni.chooseVideo 失败:', JSON.stringify(err))
      if (err.errMsg && err.errMsg.includes('cancel')) return
      // 暴露真实错误信息，便于排查
      uni.showToast({
        title: err.errMsg || '选择视频失败',
        icon: 'none',
        duration: 4000
      })
    }
  })
}

// 从聊天记录选择视频 (仅微信小程序)
const chooseVideoFromChat = () => {
  // #ifdef MP-WEIXIN
  wx.chooseMessageFile({
    count: 1,
    type: 'video',
    success: (res: any) => {
      console.log('从聊天记录选择成功:', res)
      const file = res.tempFiles[0]
      if (file) {
        videoInfo.path = file.path
        videoInfo.size = file.size || 0
        videoInfo.name = file.name || '视频文件'
        
        // 获取视频信息
        uni.getVideoInfo({
          src: file.path,
          success: (info: any) => {
            console.log('获取聊天视频信息:', info)
            videoInfo.duration = info.duration || 0
            videoInfo.width = info.width || 0
            videoInfo.height = info.height || 0
            if (!videoInfo.size && info.size) {
              videoInfo.size = info.size
            }
          },
          fail: (err: any) => {
            console.warn('获取聊天视频信息失败:', err)
          }
        })
        
        uni.showToast({ 
          title: '视频选择成功', 
          icon: 'success',
          duration: 2000
        })
      }
    },
    fail: (err: any) => {
      console.error('选择文件失败:', err)
      if (err.errMsg && err.errMsg.includes('cancel')) {
        return
      }
      
      let errorMsg = '选择文件失败'
      if (err.errMsg && err.errMsg.includes('permission')) {
        errorMsg = '需要授权访问聊天记录'
      } else if (err.errMsg && err.errMsg.includes('not support')) {
        errorMsg = '当前微信版本不支持此功能'
      }
      
      uni.showToast({ 
        title: errorMsg, 
        icon: 'none',
        duration: 3000
      })
    }
  })
  // #endif
}

// 开始压缩
const handleCompress = () => {
  if (!videoInfo.path) {
    uni.showToast({ title: '请先选择视频', icon: 'none' })
    return
  }

  // #ifdef H5
  // H5端拦截，显示引导弹窗
  showH5Guide()
  return
  // #endif

  // #ifdef MP-WEIXIN
  compressVideoInMiniProgram()
  // #endif
}

// 微信小程序压缩
const compressVideoInMiniProgram = () => {
  // #ifdef MP-WEIXIN
  isCompressing.value = true

  // 统一采用底层硬件精准参数组合（bitrate, fps, resolution）进行压缩。
  // 这直接绕过了微信官方只能传 quality (low/medium/high) 的单一局限，赋能多场景下的完美画质与体积双重调权。
  const baseOptions: any = { src: videoInfo.path }
  const scale = compressParams.resolution / 100
  Object.assign(baseOptions, {
    bitrate: compressParams.bitrate,              // kbps，支持最低 200
    fps: compressParams.fps,                      // 帧率，支持最低 10
    resolution: Math.max(0.1, Math.min(1, scale)) // 缩放比例，(0.1, 1.0]
  })
  console.log('[压缩] 统一硬件精准压制参数:', baseOptions)

  uni.compressVideo({
    ...baseOptions,
    success: (res: any) => {
      console.log('压缩成功:', res)
      // 读出压缩后实际大小用于校验是否真正生效
      uni.getFileInfo({
        filePath: res.tempFilePath,
        success: (info: any) => {
          const before = videoInfo.size
          const after = info.size || 0
          const ratio = before > 0 ? Math.round(((before - after) / before) * 100) : 0
          console.log(`[压缩结果] 原: ${(before / 1024).toFixed(1)}KB → 压缩后: ${(after / 1024).toFixed(1)}KB，节省 ${ratio}%`)
          uni.showToast({
            title: ratio > 0 ? `压缩成功，节省 ${ratio}%` : '压缩完成（变化不大）',
            icon: 'success',
            duration: 2500
          })
          saveVideoToAlbum(res.tempFilePath)
        },
        fail: () => {
          uni.showToast({ title: '压缩成功', icon: 'success' })
          saveVideoToAlbum(res.tempFilePath)
        }
      })
    },
    fail: (err: any) => {
      console.error('压缩失败:', err)
      if (err.errMsg && err.errMsg.includes('ffmpeg')) {
        uni.showModal({
          title: '开发环境提示',
          content: '微信开发者工具需要配置 ffmpeg 才能使用视频压缩功能。请使用真机预览测试，或在开发者工具设置中配置 ffmpeg 路径。',
          showCancel: false,
          confirmText: '我知道了'
        })
      } else {
        uni.showToast({ title: '压缩失败: ' + (err.errMsg || '未知错误'), icon: 'none' })
      }
    },
    complete: () => {
      isCompressing.value = false
    }
  })
  // #endif
}

// 保存视频到相册
const saveVideoToAlbum = (filePath: string) => {
  uni.saveVideoToPhotosAlbum({
    filePath: filePath,
    success: () => {
      uni.showToast({ title: '已保存到相册', icon: 'success' })
    },
    fail: (err: any) => {
      console.error('保存失败:', err)
      // 可能是权限问题
      if (err.errMsg && err.errMsg.includes('auth')) {
        uni.showModal({
          title: '提示',
          content: '需要您授权保存到相册的权限',
          confirmText: '去授权',
          success: (res) => {
            if (res.confirm) {
              uni.openSetting({})
            }
          }
        })
      } else {
        uni.showToast({ title: '保存失败', icon: 'none' })
      }
    }
  })
}

// 显示H5引导弹窗
const showH5Guide = () => {
  // #ifdef H5
  uni.showModal({
    title: '功能提示',
    content: 'H5 环境暂不支持本地视频压缩，请前往小程序操作',
    showCancel: true,
    cancelText: '复制路径',
    confirmText: '我知道了',
    success: (res) => {
      if (!res.confirm) {
        copyMiniProgramPath()
      }
    }
  })
  // #endif
}

// 复制小程序路径
const copyMiniProgramPath = () => {
  uni.setClipboardData({
    data: MINI_PROGRAM_PATH,
    success: () => {
      uni.showToast({ title: '路径已复制', icon: 'success' })
    }
  })
}

// 关闭H5引导弹窗
const closeH5Guide = () => {
  h5GuidePopup.value?.close()
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes === 0) return '--'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 格式化时长
const formatDuration = (seconds: number): string => {
  if (!seconds || seconds <= 0) return '--'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 验证视频文件
const validateVideoFile = (filePath: string, fileSize: number, duration: number): { valid: boolean; message?: string } => {
  // 检查文件路径
  if (!filePath) {
    return { valid: false, message: '视频文件路径无效' }
  }
  
  // 检查文件格式（通过扩展名）
  const supportedFormats = ['.mp4', '.mov', '.avi', '.m4v', '.3gp', '.mkv']
  const fileExtension = filePath.toLowerCase().substring(filePath.lastIndexOf('.'))
  if (!supportedFormats.includes(fileExtension)) {
    return { 
      valid: false, 
      message: `不支持的视频格式 ${fileExtension}，请选择 MP4、MOV 等常见格式` 
    }
  }
  
  // 检查文件大小（限制为 500MB）
  const maxSize = 500 * 1024 * 1024 // 500MB
  if (fileSize > maxSize) {
    return { 
      valid: false, 
      message: `视频文件过大 (${formatFileSize(fileSize)})，请选择小于 500MB 的视频` 
    }
  }
  
  // 检查视频时长（限制为 10 分钟）
  const maxDuration = 600 // 10 minutes
  if (duration > maxDuration) {
    return { 
      valid: false, 
      message: `视频时长过长 (${formatDuration(duration)})，请选择 10 分钟以内的视频` 
    }
  }
  
  // 检查最小文件大小（避免空文件或损坏文件）
  const minSize = 1024 // 1KB
  if (fileSize < minSize) {
    return { 
      valid: false, 
      message: '视频文件可能已损坏，请重新选择' 
    }
  }
  
  return { valid: true }
}

// 处理视频选择成功后的验证和设置
const handleVideoSelected = (tempFilePath: string, size: number, duration: number, width: number, height: number, thumbPath?: string) => {
  // 验证视频文件
  const validation = validateVideoFile(tempFilePath, size, duration)
  if (!validation.valid) {
    uni.showModal({
      title: '视频验证失败',
      content: validation.message || '视频文件不符合要求',
      showCancel: false,
      confirmText: '重新选择'
    })
    return false
  }
  
  // 设置视频信息
  videoInfo.path = tempFilePath
  videoInfo.thumbPath = thumbPath || ''
  videoInfo.size = size
  videoInfo.duration = duration
  videoInfo.width = width
  videoInfo.height = height
  videoInfo.name = tempFilePath.split('/').pop() || '视频文件'
  
  uni.showToast({ 
    title: '视频选择成功', 
    icon: 'success',
    duration: 2000
  })
  
  return true
}
</script>

<style lang="scss" scoped>
// 统一配色变量
$bg-color: #f5f7fa;
$card-bg: #ffffff;
$text-primary: #1a1a1a;
$text-secondary: #666666;
$text-hint: #999999;
$border-color: #eaeef3;
$primary-color: #667eea;
$primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
$shadow-sm: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
$shadow-md: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
$radius-md: 24rpx;

.video-compress-page {
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

// 上传区域
.upload-section {
  margin-bottom: 32rpx;
  
  .upload-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 360rpx;
    background: $card-bg;
    border: 2rpx dashed $border-color;
    border-radius: $radius-md;
    box-shadow: $shadow-sm;
    
    .upload-icon {
      width: 120rpx;
      height: 120rpx;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24rpx;
      
      .plus-icon {
        font-size: 72rpx;
        color: $primary-color;
        font-weight: 300;
      }
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
  
  .video-preview-section {
    background: $card-bg;
    border-radius: $radius-md;
    overflow: hidden;
    box-shadow: $shadow-sm;
    
    .preview-video {
      width: 100%;
      height: 360rpx;
    }
    
    .video-placeholder {
      height: 300rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      
      .video-name {
        margin-top: 16rpx;
        font-size: 28rpx;
        color: $text-secondary;
      }
    }
    
    .reselect-tip {
      text-align: center;
      padding: 20rpx;
      font-size: 24rpx;
      color: $primary-color;
      background: rgba(102, 126, 234, 0.05);
    }
  }
}

// 压缩控制区域
.compress-controls {
  background: $card-bg;
  border-radius: $radius-md;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: $shadow-sm;
  
  .control-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    &.switch-row {
      padding-bottom: 24rpx;
      border-bottom: 1rpx solid $border-color;
      margin-bottom: 24rpx;
    }
    
    .control-label {
      font-size: 30rpx;
      color: $text-primary;
      font-weight: 500;
    }
  }
  
  .section-title {
    display: block;
    font-size: 28rpx;
    color: $text-secondary;
    margin-bottom: 20rpx;
  }
  
  .quality-presets {
    margin-bottom: 24rpx;
    
    .preset-buttons {
      display: flex;
      gap: 20rpx;
      
      .preset-btn {
        flex: 1;
        height: 72rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f0f1f3;
        border-radius: 12rpx;
        font-size: 24rpx; /* 微调字号避免长场景折行 */
        color: $text-primary;
        transition: all 0.2s;
        
        &.active {
          background: $primary-gradient;
          color: white;
        }
      }
    }
  }

  .preset-description {
    display: flex;
    align-items: flex-start;
    background: #f8f9fb;
    border-radius: 16rpx;
    padding: 20rpx 24rpx;
    margin-bottom: 32rpx;
    border-left: 6rpx solid $primary-color;
    
    .desc-icon {
      font-size: 28rpx;
      margin-right: 12rpx;
      line-height: 1.4;
    }
    
    .desc-text {
      font-size: 24rpx;
      color: $text-secondary;
      line-height: 1.5;
    }
  }

  .advanced-controls {
    padding-top: 24rpx;
    border-top: 1rpx solid $border-color;
    
    .spec-title {
      font-size: 28rpx;
      color: $text-primary;
      font-weight: 600;
      margin-bottom: 32rpx;
    }
    
    .slider-group {
      margin-bottom: 32rpx;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .slider-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16rpx;
        
        .slider-label {
          font-size: 26rpx;
          color: $text-secondary;
        }
        
        .slider-value {
          font-size: 26rpx;
          color: $primary-color;
          font-weight: 600;
          transition: color 0.3s;
          
          &.warning-color {
            color: #ef4444;
          }
        }
        
        .original-bitrate-hint {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 10rpx;
          padding: 0 10rpx;
          
          .hint-text {
            font-size: 22rpx;
            color: $text-hint;
          }
          
          .warning-badge {
            font-size: 22rpx;
            color: #ef4444;
            font-weight: 500;
            animation: pulse-hint 2s infinite;
          }
        }
      }
    }
  }
}

// 数据看板
.info-dashboard {
  background: $card-bg;
  border-radius: $radius-md;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: $shadow-sm;
  
  .section-title {
    display: block;
    font-size: 30rpx;
    color: $text-primary;
    font-weight: 600;
    margin-bottom: 24rpx;
  }
  
  .info-grid {
    display: flex;
    gap: 24rpx;
    
    .info-card {
      flex: 1;
      background: #f8f9fb;
      border-radius: 16rpx;
      padding: 24rpx;
      
      .info-title {
        display: block;
        font-size: 26rpx;
        color: $text-secondary;
        margin-bottom: 16rpx;
        font-weight: 500;
        
        .estimate-tag {
          font-size: 22rpx;
          color: $primary-color;
        }
      }
      
      .info-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12rpx;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .info-label {
          font-size: 24rpx;
          color: $text-hint;
        }
        
        .info-value {
          font-size: 24rpx;
          color: $text-primary;
          font-weight: 500;
          
          &.highlight {
            color: $primary-color;
          }
          
          &.saved {
            color: #059669;
          }
        }
      }
    }
  }
}

// 操作按钮
.action-section {
  margin-bottom: 32rpx;
  
  .compress-btn {
    width: 100%;
    height: 96rpx;
    background: $primary-gradient;
    color: white;
    font-size: 32rpx;
    font-weight: 600;
    border-radius: 48rpx;
    border: none;
    
    &:disabled {
      background: #9CA3AF;
      opacity: 0.7;
    }
    
    &::after {
      border: none;
    }
  }
}

// 温馨提示
.tips-section {
  background: $card-bg;
  border-radius: $radius-md;
  padding: 32rpx;
  box-shadow: $shadow-sm;
  
  .tips-title {
    display: block;
    font-size: 28rpx;
    color: $text-primary;
    font-weight: 600;
    margin-bottom: 20rpx;
  }
  
  .tips-content {
    .tip-item {
      display: block;
      font-size: 24rpx;
      color: $text-secondary;
      line-height: 1.8;
    }
  }
}

// H5引导弹窗
.h5-guide-modal {
  width: 600rpx;
  background: white;
  border-radius: $radius-md;
  padding: 48rpx;
  text-align: center;
  
  .modal-title {
    display: block;
    font-size: 36rpx;
    color: $text-primary;
    font-weight: 600;
    margin-bottom: 24rpx;
  }
  
  .modal-desc {
    display: block;
    font-size: 28rpx;
    color: $text-secondary;
    margin-bottom: 32rpx;
    line-height: 1.6;
  }
  
  .qr-image {
    width: 300rpx;
    height: 300rpx;
    margin-bottom: 32rpx;
  }
  
  .modal-actions {
    display: flex;
    gap: 24rpx;
    
    .modal-btn {
      flex: 1;
      height: 80rpx;
      border-radius: 12rpx;
      font-size: 28rpx;
      border: none;
      
      &.secondary {
        background: #f0f1f3;
        color: $text-primary;
      }
      
      &.primary {
        background: $primary-gradient;
        color: white;
      }
      
      &::after {
        border: none;
      }
    }
  }
}
</style>
