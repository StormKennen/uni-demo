<template>
  <view class="container" :class="{ 'bot-mode': pageMode === 'bot' }">
    <!-- 用户模式显示导航栏 -->
    <NavBar
      always-title
      title="图片拼接"
      custom-class="light"
      :custom-style="{ backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }"
    />
    
    <view class="content">
      <!-- 模式选择 -->
      <view v-if="pageMode === 'user'" class="section">
        <view class="section-header">
          <text class="section-title">拼接模式</text>
        </view>
        <view class="mode-tabs">
          <view 
            class="mode-tab" 
            :class="{ active: layoutMode === '1N' }"
            @click="layoutMode = '1N'"
          >
            <text class="mode-icon">↓</text>
            <text>竖排 1×N</text>
          </view>
          <view 
            class="mode-tab" 
            :class="{ active: layoutMode === 'N1' }"
            @click="layoutMode = 'N1'"
          >
            <text class="mode-icon">→</text>
            <text>横排 N×1</text>
          </view>
          <view 
            class="mode-tab" 
            :class="{ active: layoutMode === 'grid' }"
            @click="layoutMode = 'grid'"
          >
            <text class="mode-icon">▦</text>
            <text>自定义</text>
          </view>
        </view>
        
        <!-- 10x10 网格选择器 (仅自定义模式) -->
        <view v-if="layoutMode === 'grid'" class="grid-selector-wrapper">
          <view class="grid-selector-header">
            <text class="grid-selector-title">选择布局</text>
            <text class="grid-selector-value">{{ gridLayout.rows }} × {{ gridLayout.cols }}</text>
          </view>
          <view 
            class="grid-selector"
            @touchmove.prevent="onGridTouchMove"
            @touchend="onGridTouchEnd"
          >
            <view 
              v-for="index in 100" 
              :key="index"
              class="grid-cell"
              :class="{ 
                selected: isCellSelected(index - 1),
                hovered: isCellHovered(index - 1)
              }"
              @click="onGridCellClick(index - 1)"
              @touchstart="onGridCellTouch(index - 1)"
            />
          </view>
        </view>
      </view>
      
      <!-- 属性配置表单 -->
      <view v-if="pageMode === 'user'" class="section">
        <view class="section-header">
          <text class="section-title">样式设置</text>
        </view>
        
        <!-- 单元格尺寸 -->
        <view class="form-row">
          <view class="form-item">
            <text class="form-label">宽度</text>
            <view class="form-input-wrapper">
              <input 
                type="number" 
                class="form-input" 
                v-model="itemWidth"
                placeholder="auto"
              />
              <text class="form-unit">px</text>
            </view>
          </view>
          <view class="form-item">
            <text class="form-label">高度</text>
            <view class="form-input-wrapper">
              <input 
                type="number" 
                class="form-input" 
                v-model="itemHeight"
                placeholder="auto"
              />
              <text class="form-unit">px</text>
            </view>
          </view>
        </view>
        
        <!-- 尺寸提示 -->
        <view v-if="itemWidth && itemHeight" class="form-tip warning">
          <text>⚠️ 同时设置宽高将启用 object-fit: cover 模式</text>
        </view>
        
        <!-- 间距设置 -->
        <view class="control-item">
          <text class="control-label">间距 (gap)</text>
          <text class="control-value">{{ gridGap }}px</text>
        </view>
        <slider 
          :value="gridGap" 
          :min="0" 
          :max="50" 
          :step="1"
          activeColor="#0046B4"
          @change="gridGap = $event.detail.value"
        />
        
        <!-- 背景颜色 -->
        <view class="control-item">
          <text class="control-label">背景颜色</text>
        </view>
        <view class="color-picker">
          <view 
            v-for="color in bgColorOptions" 
            :key="color"
            class="color-option"
            :class="{ active: bgColor === color }"
            :style="{ backgroundColor: color }"
            @click="bgColor = color"
          />
        </view>
      </view>
      
      <!-- 实时预览区域 -->
      <view class="section preview-section">
        <!-- 用户模式显示标题 -->
        <view v-if="pageMode === 'user'" class="section-header">
          <text class="section-title">拼接预览</text>
          <text class="section-subtitle">{{ images.length }}/20张</text>
        </view>
        
        <!-- 海报导出区域 - 容器ID锁定 -->
        <view 
          id="stitch-container" 
          class="poster-wrapper" 
          :class="{ 'is-ready': isRenderReady, 'bot-mode': pageMode === 'bot' }"
          :style="getPosterStyle()"
        >
          <!-- 渲染就绪标记 -->
          <view v-if="isRenderReady && pageMode === 'bot'" id="render-done" class="render-done" />
          
          <!-- 调试信息 (仅后端模式) -->
          <view v-if="pageMode === 'bot'" style="position: absolute; top: 0; left: 0; background: rgba(255,0,0,0.8); color: #fff; padding: 4px 8px; font-size: 12px; z-index: 9999;">
            mode: {{ layoutMode }} | grid: {{ gridLayout.rows }}x{{ gridLayout.cols }} | images: {{ images.length }}
          </view>
          
          <!-- 预览容器 - Grid 模式 -->
          <view 
            v-if="images.length > 0 && layoutMode === 'grid'" 
            class="stitch-preview grid-mode"
            :style="getGridPreviewStyle()"
          >
            <view 
              v-for="(img, index) in displayImages" 
              :key="img.id" 
              class="grid-item"
              :style="getGridItemStyle()"
            >
              <image 
                :src="img.path" 
                :mode="getImageMode()"
                class="grid-thumb"
                :style="getGridImageStyle()"
                @load="onImageLoad"
              />
              <!-- 上传状态遮罩 -->
              <view v-if="uploadingImages.has(img.id)" class="upload-overlay">
                <view class="upload-spinner" />
                <text class="upload-text">上传中...</text>
              </view>
              <!-- 用户模式显示操作按钮 -->
              <template v-if="pageMode === 'user'">
                <view class="image-index">{{ index + 1 }}</view>
                <view class="image-actions">
                  <view class="action-btn replace" @click.stop="replaceImage(index)">
                    <uni-icons type="refreshempty" size="14" color="#fff" />
                  </view>
                  <view class="action-btn delete" @click.stop="removeImage(index)">
                    <uni-icons type="close" size="14" color="#fff" />
                  </view>
                </view>
              </template>
            </view>
          </view>
          
          <!-- 预览容器 - 1N/N1 模式 -->
          <view 
            v-else-if="images.length > 0" 
            class="stitch-preview" 
            :class="computedDirection"
            :style="getLinearPreviewStyle()"
          >
            <view 
              v-for="(img, index) in images" 
              :key="img.id" 
              class="preview-item-wrapper"
            >
              <!-- 图片项 -->
              <view class="preview-item" @longpress="pageMode === 'user' ? showImageActions(index) : null">
                <image 
                  :src="img.path" 
                  :mode="computedDirection === 'vertical' ? 'widthFix' : 'heightFix'" 
                  class="preview-thumb"
                  @load="onImageLoad"
                />
                <!-- 上传状态遮罩 -->
                <view v-if="uploadingImages.has(img.id)" class="upload-overlay">
                  <view class="upload-spinner" />
                  <text class="upload-text">上传中...</text>
                </view>
                <!-- 用户模式显示操作按钮 -->
                <template v-if="pageMode === 'user'">
                  <view class="image-index">{{ index + 1 }}</view>
                  <view class="image-actions">
                    <view class="action-btn replace" @click.stop="replaceImage(index)">
                      <uni-icons type="refreshempty" size="14" color="#fff" />
                    </view>
                    <view class="action-btn delete" @click.stop="removeImage(index)">
                      <uni-icons type="close" size="14" color="#fff" />
                    </view>
                  </view>
                </template>
              </view>
              <!-- 分割线 -->
              <view 
                v-if="showDivider && index < images.length - 1" 
                class="divider-line"
                :style="getDividerStyle()"
              />
            </view>
          </view>
          
          <!-- 空状态 -->
          <view v-else class="empty-state">
            <uni-icons type="image" size="60" color="#ddd" />
            <text class="empty-text">{{ pageMode === 'bot' ? '无图片数据' : '请添加图片开始拼接' }}</text>
          </view>
        </view>
        
        <!-- 用户模式显示添加图片按钮 -->
        <template v-if="pageMode === 'user'">
          <view v-if="images.length < 20" class="add-area" @click="showAddSheet">
            <uni-icons type="plusempty" size="32" color="#0046B4" />
            <text class="add-text">添加图片</text>
          </view>
        </template>
      </view>
      
      <!-- 控制面板 - 仅用户模式 -->
      <template v-if="pageMode === 'user'">
        <view class="section">
          <view class="section-header">
            <text class="section-title">拼接设置</text>
          </view>
          
          <!-- 拼接方向 -->
          <view class="control-item">
            <text class="control-label">拼接方向</text>
            <view class="direction-switch">
              <view 
                class="direction-option" 
                :class="{ active: direction === 'vertical' }"
                @click="direction = 'vertical'"
              >
                <uni-icons type="arrow-down" size="16" :color="direction === 'vertical' ? '#fff' : '#666'" />
                <text>纵向</text>
              </view>
              <view 
                class="direction-option" 
                :class="{ active: direction === 'horizontal' }"
                @click="direction = 'horizontal'"
              >
                <uni-icons type="arrow-right" size="16" :color="direction === 'horizontal' ? '#fff' : '#666'" />
                <text>横向</text>
              </view>
            </view>
          </view>
          
          <!-- 导出宽度输入框 -->
          <view class="control-item">
            <text class="control-label">导出宽度(px)</text>
            <view class="size-input-wrapper">
              <input 
                type="number" 
                class="size-input" 
                v-model="exportWidthInput"
                placeholder="750"
                @blur="onExportWidthBlur"
              />
              <text class="size-unit">px</text>
            </view>
          </view>
          
          <!-- 分割线设置 -->
          <view class="control-item">
            <text class="control-label">分割线</text>
            <switch :checked="showDivider" @change="showDivider = $event.detail.value" color="#0046B4" />
          </view>
          
          <view v-if="showDivider" class="divider-settings">
            <view class="control-item">
              <text class="control-label">线条宽度</text>
              <text class="control-value">{{ dividerWidth }}px</text>
            </view>
            <slider 
              :value="dividerWidth" 
              :min="1" 
              :max="20" 
              :step="1"
              activeColor="#0046B4"
              @change="dividerWidth = $event.detail.value"
            />
            
            <view class="control-item">
              <text class="control-label">线条颜色</text>
            </view>
            <view class="color-picker">
              <view 
                v-for="color in colorOptions" 
                :key="color"
                class="color-option"
                :class="{ active: dividerColor === color }"
                :style="{ backgroundColor: color }"
                @click="dividerColor = color"
              />
            </view>
          </view>
        </view>
      </template>
    </view>
    
    <!-- 底部操作栏 - 仅用户模式 -->
    <template v-if="pageMode === 'user'">
      <view class="bottom-bar">
        <button 
          class="btn-stitch" 
          :disabled="images.length < 1 || isProcessing"
          @click="exportImage"
        >
          <uni-icons v-if="!isProcessing" type="download" size="18" color="#fff" />
          <text>{{ isProcessing ? '处理中...' : '生成海报' }}</text>
        </button>
      </view>
    </template>
    
    <!-- 进度提示 -->
    <view v-if="isProcessing" class="progress-mask">
      <view class="progress-content">
        <view class="progress-spinner" />
        <text class="progress-text">{{ progressText }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from "@dcloudio/uni-app";
import NavBar from '@/components/nav-bar.vue'
import { postPainterGenerateInfo } from '@/services/apifox/NODEJSDEMO/PAINTER/apifox'
import { postFiles } from '@/services/apifox/NODEJSDEMO/FILES/apifox'
import { getOssFormData } from '../oss-upload/utils'
import { getToken } from '@/utils/storage'
import { checkLoginBeforeNavigator } from '@/utils/wxLogin'

// 微信小程序 API 类型声明
declare const wx: any

// 图片信息接口
interface ImageInfo {
  id: string
  path: string
  width: number
  height: number
}

// staticData 协议接口
interface StaticData {
  mode: 'grid' | '1N' | 'N1'
  layout: {
    rows: number
    cols: number
    gap: number
  }
  itemStyle: {
    width: number | 'auto'
    height: number | 'auto'
  }
  bgColor: string
  images: string[]
}

// 页面模式
const pageMode = ref<'user' | 'bot'>('user') // user: 用户交互模式, bot: 后端机器人模式

// 布局模式: 1N(竖排), N1(横排), grid(自定义网格)
const layoutMode = ref<'1N' | 'N1' | 'grid'>('1N')

// 10x10 网格选择器状态
const gridLayout = ref({ rows: 2, cols: 2 })
const hoverCell = ref({ row: 0, col: 0 })
const isHovering = ref(false)

// 属性配置
const itemWidth = ref<string>('')
const itemHeight = ref<string>('')
const gridGap = ref(10)
const bgColor = ref('#ffffff')

// 背景颜色选项
const bgColorOptions = [
  '#ffffff', '#f5f5f5', '#e0e0e0', '#000000',
  '#fff3e0', '#e3f2fd', '#f3e5f5', '#e8f5e9'
]

// 状态
const images = ref<ImageInfo[]>([])
const direction = ref<'vertical' | 'horizontal'>('vertical')
const showDivider = ref(false)
const dividerWidth = ref(5)
const dividerColor = ref('#ffffff')
const isProcessing = ref(false)
const progressText = ref('')
const exportWidth = ref(750)
const exportWidthInput = ref('750')
const replaceIndex = ref(-1)
const isRenderReady = ref(false) // 渲染就绪状态

// OSS上传相关状态
const uploadHost = ref<string>('https://lzk-web.oss-cn-beijing.aliyuncs.com')
const uploadingImages = ref<Set<string>>(new Set()) // 正在上传的图片ID集合

// 从 URL 中解析 stitchData 参数 (H5 hash 模式兼容)
const getStitchDataFromUrl = () => {
  // #ifdef H5
  // H5 端需要从 window.location.href 中解析 hash 路由的 query 参数
  const href = window.location.href
  const hashIndex = href.indexOf('#')
  if (hashIndex > -1) {
    const hashPart = href.substring(hashIndex + 1)
    const queryIndex = hashPart.indexOf('?')
    if (queryIndex > -1) {
      const queryString = hashPart.substring(queryIndex + 1)
      const params = new URLSearchParams(queryString)
      return params.get('stitchData')
    }
  }
  return null
  // #endif
  
  // #ifndef H5
  return null
  // #endif
}

// 页面加载时判断运行环境
onLoad((options) => {
  // H5 端优先从 URL 解析，小程序端使用 options
  const stitchData = getStitchDataFromUrl() || options.stitchData
  
  if (stitchData) {
    // 后端机器人模式
    pageMode.value = 'bot'
    console.log('进入后端机器人模式, stitchData长度:', stitchData.length)
    
    // 解析传入的数据
    try {
      const decodedData = decodeBase64(stitchData)
      const config = JSON.parse(decodedData)
      
      // 应用配置 (支持新版 staticData 协议)
      images.value = config.images || []
      direction.value = config.direction || 'vertical'
      showDivider.value = config.showDivider || false
      dividerWidth.value = config.dividerWidth || 5
      dividerColor.value = config.dividerColor || '#ffffff'
      exportWidth.value = config.exportWidth || 750
      
      // 新版字段
      if (config.layoutMode) {
        layoutMode.value = config.layoutMode
      }
      if (config.gridLayout) {
        gridLayout.value = config.gridLayout
      }
      if (config.gridGap !== undefined) {
        gridGap.value = config.gridGap
      }
      if (config.bgColor) {
        bgColor.value = config.bgColor
      }
      if (config.itemWidth) {
        itemWidth.value = String(config.itemWidth)
      }
      if (config.itemHeight) {
        itemHeight.value = String(config.itemHeight)
      }
      
      // 重置图片加载计数器
      resetImageLoadCounter()
      
      console.log('已应用后端配置:', config)
      console.log('layoutMode:', layoutMode.value, 'gridLayout:', gridLayout.value)
    } catch (error) {
      console.error('解析后端配置失败:', error)
    }
  } else {
    // 用户交互模式
    pageMode.value = 'user'
    console.log('进入用户交互模式')
    
    // 检查登录状态
    checkLogin()
  }
})

// 颜色选项
const colorOptions = [
  '#ffffff', '#000000', '#f5f5f5', '#e0e0e0',
  '#ff4444', '#44ff44', '#4444ff', '#ffff44'
]

// ==================== 10x10 网格选择器逻辑 ====================

// 根据 index 计算行列 (index 从 0 到 99)
const getCellPosition = (index: number) => {
  const row = Math.floor(index / 10) + 1
  const col = (index % 10) + 1
  return { row, col }
}

// 判断单元格是否在选中范围内
const isCellSelected = (index: number) => {
  const { row, col } = getCellPosition(index)
  return row <= gridLayout.value.rows && col <= gridLayout.value.cols
}

// 判断单元格是否在 hover 范围内
const isCellHovered = (index: number) => {
  if (!isHovering.value) return false
  const { row, col } = getCellPosition(index)
  return row <= hoverCell.value.row && col <= hoverCell.value.col
}

// 点击单元格选中布局
const onGridCellClick = (index: number) => {
  const { row, col } = getCellPosition(index)
  gridLayout.value = { rows: row, cols: col }
  isHovering.value = false
}

// 触摸开始
const onGridCellTouch = (index: number) => {
  const { row, col } = getCellPosition(index)
  hoverCell.value = { row, col }
  isHovering.value = true
}

// 触摸移动
const onGridTouchMove = (e: TouchEvent) => {
  const touch = e.touches[0]
  const target = document.elementFromPoint(touch.clientX, touch.clientY)
  if (target && target.classList.contains('grid-cell')) {
    const cells = document.querySelectorAll('.grid-cell')
    const index = Array.from(cells).indexOf(target as Element)
    if (index >= 0) {
      const { row, col } = getCellPosition(index)
      hoverCell.value = { row, col }
    }
  }
}

// 触摸结束
const onGridTouchEnd = () => {
  if (isHovering.value) {
    gridLayout.value = { ...hoverCell.value }
  }
  isHovering.value = false
}

// ==================== 计算属性 ====================

// 根据布局模式计算方向
const computedDirection = computed(() => {
  if (layoutMode.value === '1N') return 'vertical'
  if (layoutMode.value === 'N1') return 'horizontal'
  return direction.value
})

// 显示的图片列表 (Grid 模式下限制数量)
const displayImages = computed(() => {
  if (layoutMode.value === 'grid') {
    const maxCount = gridLayout.value.rows * gridLayout.value.cols
    return images.value.slice(0, maxCount)
  }
  return images.value
})

// 生成 staticData 协议对象
const staticData = computed<StaticData>(() => {
  let rows = 1, cols = 1
  
  if (layoutMode.value === '1N') {
    rows = images.value.length
    cols = 1
  } else if (layoutMode.value === 'N1') {
    rows = 1
    cols = images.value.length
  } else {
    rows = gridLayout.value.rows
    cols = gridLayout.value.cols
  }
  
  return {
    mode: layoutMode.value,
    layout: {
      rows,
      cols,
      gap: gridGap.value
    },
    itemStyle: {
      width: itemWidth.value ? parseInt(itemWidth.value) : 'auto',
      height: itemHeight.value ? parseInt(itemHeight.value) : 'auto'
    },
    bgColor: bgColor.value,
    images: displayImages.value.map(img => img.path)
  }
})

// ==================== 样式计算方法 ====================

// Grid 预览容器样式 (使用 flex 实现兼容性更好的网格)
const getGridPreviewStyle = () => {
  return {
    display: 'flex',
    flexWrap: 'wrap',
    backgroundColor: bgColor.value,
    padding: '16rpx',
    borderRadius: '16rpx',
    gap: `${gridGap.value}px`
  }
}

// Grid 单元格样式 (计算每个单元格的宽度百分比)
const getGridItemStyle = () => {
  const cols = gridLayout.value.cols
  const gap = gridGap.value
  // 计算每个单元格的宽度：(100% - 总间距) / 列数
  // 总间距 = (列数 - 1) * gap
  const gapTotal = (cols - 1) * gap
  const itemWidthPercent = `calc((100% - ${gapTotal}px) / ${cols})`
  
  const style: Record<string, string> = {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '8rpx',
    width: itemWidthPercent,
    boxSizing: 'border-box'
  }
  
  // 如果用户指定了固定宽度，则使用固定宽度
  if (itemWidth.value) {
    style.width = `${itemWidth.value}px`
  }
  if (itemHeight.value) {
    style.height = `${itemHeight.value}px`
  }
  
  return style
}

// Grid 图片样式
const getGridImageStyle = () => {
  const style: Record<string, string> = {
    display: 'block'
  }
  
  if (itemWidth.value && itemHeight.value) {
    style.width = '100%'
    style.height = '100%'
    style.objectFit = 'cover'
  } else if (itemWidth.value) {
    style.width = `${itemWidth.value}px`
    style.height = 'auto'
  } else if (itemHeight.value) {
    style.width = 'auto'
    style.height = `${itemHeight.value}px`
  } else {
    style.width = '100%'
    style.height = 'auto'
  }
  
  return style
}

// 获取图片模式
const getImageMode = () => {
  if (itemWidth.value && itemHeight.value) {
    return 'aspectFill'
  } else if (itemWidth.value) {
    return 'widthFix'
  } else if (itemHeight.value) {
    return 'heightFix'
  }
  return 'widthFix'
}

// 线性布局预览样式
const getLinearPreviewStyle = () => {
  return {
    backgroundColor: bgColor.value
  }
}

// 生成唯一ID
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2)

// 格式化日期ID
const formatDateId = () => {
  const d = new Date()
  const pad = (n: number) => n.toString().padStart(2, '0')
  const yyyy = d.getFullYear()
  const MM = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  const hh = pad(d.getHours())
  const mm = pad(d.getMinutes())
  const ss = pad(d.getSeconds())
  return `${yyyy}${MM}${dd}${hh}${mm}${ss}`
}

// 提取文件扩展名
const extractExtFromPath = (path: string) => {
  const idx = path.lastIndexOf('.')
  if (idx > -1) return path.substring(idx + 1).toLowerCase()
  return ''
}

// 检查登录状态
const checkLogin = () => {
  const token = getToken()
  if (!token) {
    uni.showModal({
      title: '提示',
      content: '该功能需要登录后使用，是否前往登录？',
      confirmText: '去登录',
      cancelText: '返回',
      success: (res) => {
        if (res.confirm) {
          uni.navigateTo({
            url: '/pages/mine/login/login?redirectUrl=' + encodeURIComponent('/subPackages/tools/image-stitch/index')
          })
        } else {
          uni.navigateBack()
        }
      }
    })
    return false
  }
  return true
}

// 上传单个图片到OSS
const uploadImageToOss = async (imagePath: string, imageId: string): Promise<string> => {
  if (!checkLogin()) {
    throw new Error('需要登录才能上传图片')
  }

  uploadingImages.value.add(imageId)
  
  try {
    const ext = extractExtFromPath(imagePath) || 'jpg'
    const fileName = `stitch_${formatDateId()}_${imageId}.${ext}`
    
    // 获取OSS表单数据
    const formData = await getOssFormData(fileName, ext, 'stitch-images/')
    console.log('OSS formData:', formData, fileName)
    
    // 上传文件
    const uploadedUrl = await new Promise<string>((resolve, reject) => {
      uni.uploadFile({
        url: uploadHost.value,
        name: 'file',
        filePath: imagePath,
        formData,
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const url = `${uploadHost.value.replace(/\/$/, '')}/${formData.key}`
            resolve(url)
          } else {
            reject(new Error(`上传失败，状态码: ${res.statusCode}`))
          }
        },
        fail: (err) => reject(new Error(err.errMsg || '上传失败'))
      })
    })
    
    // 保存文件记录
    try {
      await postFiles({
        file_name: fileName,
        file_size: 0, // 这里可以获取实际文件大小
        file_url: uploadedUrl,
        folder: 'stitch-images/',
      })
    } catch (err) {
      console.error('保存文件记录失败', err)
      // 不抛出错误，继续返回URL
    }
    
    console.log('图片上传成功:', uploadedUrl)
    return uploadedUrl
    
  } finally {
    uploadingImages.value.delete(imageId)
  }
}

// 图片加载计数器
let loadedImageCount = 0

// 图片加载完成回调
const onImageLoad = () => {
  loadedImageCount++
  // Grid 模式下使用 displayImages 的数量，其他模式使用 images 的数量
  const targetCount = layoutMode.value === 'grid' ? displayImages.value.length : images.value.length
  console.log(`图片加载进度: ${loadedImageCount}/${targetCount}, layoutMode: ${layoutMode.value}`)
  
  // 检查是否所有图片都已加载
  if (loadedImageCount >= targetCount && targetCount > 0) {
    isRenderReady.value = true
    console.log('所有图片加载完成，渲染就绪')
  }
}

// 重置图片加载计数
const resetImageLoadCounter = () => {
  loadedImageCount = 0
  isRenderReady.value = false
}

// Base64编码工具函数（微信小程序兼容）
const encodeBase64 = (str: string) => {
  // 微信小程序不支持TextEncoder，使用简单的Base64编码
  // 这里使用encodeURIComponent + btoa的替代方案
  try {
    // #ifdef H5
    return btoa(encodeURIComponent(str))
    // #endif
    
    // #ifndef H5
    // 微信小程序使用uni.arrayBufferToBase64
    const utf8 = []
    for (let i = 0; i < str.length; i++) {
      const charcode = str.charCodeAt(i)
      if (charcode < 0x80) utf8.push(charcode)
      else if (charcode < 0x800) {
        utf8.push(0xc0 | (charcode >> 6), 
               0x80 | (charcode & 0x3f))
      }
      else if (charcode < 0xd800 || charcode >= 0xe000) {
        utf8.push(0xe0 | (charcode >> 12), 
               0x80 | ((charcode>>6) & 0x3f), 
               0x80 | (charcode & 0x3f))
      }
      else {
        i++
        charcode = 0x10000 + (((charcode & 0x3ff)<<10) 
                  | (str.charCodeAt(i) & 0x3ff))
        utf8.push(0xf0 | (charcode >>18), 
               0x80 | ((charcode>>12) & 0x3f), 
               0x80 | ((charcode>>6) & 0x3f), 
               0x80 | (charcode & 0x3f))
      }
    }
    const buffer = new Uint8Array(utf8)
    return uni.arrayBufferToBase64(buffer)
    // #endif
  } catch (error) {
    console.error('Base64编码失败:', error)
    throw error
  }
}

// Base64解码工具函数（微信小程序兼容）
const decodeBase64 = (str: string) => {
  try {
    // #ifdef H5
    return decodeURIComponent(atob(str))
    // #endif
    
    // #ifndef H5
    // 微信小程序使用uni.base64ToArrayBuffer
    const buffer = uni.base64ToArrayBuffer(str)
    const uint8Array = new Uint8Array(buffer)
    let result = ''
    let i = 0
    while (i < uint8Array.length) {
      if (uint8Array[i] < 0x80) {
        result += String.fromCharCode(uint8Array[i])
        i++
      } else if (uint8Array[i] < 0xe0) {
        result += String.fromCharCode(
          ((uint8Array[i] & 0x1f) << 6) | (uint8Array[i + 1] & 0x3f)
        )
        i += 2
      } else {
        result += String.fromCharCode(
          ((uint8Array[i] & 0x0f) << 12) | 
          ((uint8Array[i + 1] & 0x3f) << 6) | 
          (uint8Array[i + 2] & 0x3f)
        )
        i += 3
      }
    }
    return decodeURIComponent(result)
    // #endif
  } catch (error) {
    console.error('Base64解码失败:', error)
    throw error
  }
}

// 生成海报URL（安全传输配置数据）
const generatePosterUrl = (config: any) => {
  try {
    const jsonString = JSON.stringify(config)
    const encodedData = encodeBase64(jsonString)
    const baseUrl = String(import.meta.env.VITE_PUBLIC_THIS_H5_URL || '').replace(/['"]/g, '')
    console.log(`${baseUrl}/subPackages/tools/image-stitch/index?stitchData=${encodedData}`);
    
    return `${baseUrl}/subPackages/tools/image-stitch/index?stitchData=${encodedData}`
  } catch (error) {
    console.error('生成海报URL失败:', error)
    throw error
  }
}

// 导出宽度输入框失焦处理
const onExportWidthBlur = () => {
  let val = parseInt(exportWidthInput.value) || 750
  if (val < 100) val = 100
  if (val > 4000) val = 4000
  exportWidth.value = val
  exportWidthInput.value = String(val)
}

// 获取海报容器样式
const getPosterStyle = () => {
  return {
    width: '100%',
    background: '#f8f8f8'
  }
}

// 获取分割线样式
const getDividerStyle = () => {
  if (direction.value === 'vertical') {
    return {
      width: '100%',
      height: dividerWidth.value + 'px',
      backgroundColor: dividerColor.value
    }
  } else {
    return {
      width: dividerWidth.value + 'px',
      height: '100%',
      backgroundColor: dividerColor.value
    }
  }
}

// 显示图片操作菜单
const showImageActions = (index: number) => {
  uni.showActionSheet({
    itemList: ['更换图片', '删除图片'],
    success: (res) => {
      if (res.tapIndex === 0) {
        replaceImage(index)
      } else if (res.tapIndex === 1) {
        removeImage(index)
      }
    }
  })
}

// 更换图片
const replaceImage = (index: number) => {
  replaceIndex.value = index
  
  // #ifdef MP-WEIXIN
  uni.showActionSheet({
    itemList: ['从相册选择', '从聊天记录选择'],
    success: (res) => {
      if (res.tapIndex === 0) {
        chooseForReplace()
      } else if (res.tapIndex === 1) {
        chooseFromChatForReplace()
      }
    }
  })
  // #endif
  
  // #ifndef MP-WEIXIN
  chooseForReplace()
  // #endif
}

// 选择图片用于替换
const chooseForReplace = async () => {
  try {
    // #ifdef MP-WEIXIN
    // 微信小程序需要先检查隐私授权
    if (wx.getPrivacySetting) {
      await new Promise((resolve, reject) => {
        wx.getPrivacySetting({
          success: (res: any) => {
            console.log('隐私设置状态:', res)
            resolve(res)
          },
          fail: () => {
            resolve(null)
          }
        })
      })
    }
    // #endif
    
    const res: any = await uni.chooseImage({
      count: 1,
      sizeType: ['original'],
      sourceType: ['album']
    })
    
    const path = Array.isArray(res.tempFilePaths) ? res.tempFilePaths[0] : null
    if (!path) {
      uni.showToast({ title: '未选择到有效图片', icon: 'none' })
      replaceIndex.value = -1
      return
    }
    
    try {
      isProcessing.value = true
      progressText.value = '正在处理图片...'
      
      // 获取图片尺寸
      const info = await getImageInfo(path)
      
      // 上传到OSS
      progressText.value = '正在上传图片...'
      const imageId = generateId()
      const ossUrl = await uploadImageToOss(path, imageId)
      
      // 替换图片
      if (replaceIndex.value >= 0 && replaceIndex.value < images.value.length) {
        images.value[replaceIndex.value] = {
          id: imageId,
          path: ossUrl,
          width: info.width,
          height: info.height
        }
        uni.showToast({ title: '图片已替换', icon: 'success' })
      }
    } catch (err: any) {
      console.error('图片处理失败:', err)
      uni.showToast({ title: err.message || '图片处理失败', icon: 'none' })
    } finally {
      isProcessing.value = false
      replaceIndex.value = -1
    }
  } catch (err: any) {
    console.error('选择图片失败:', err)
    if (err.errMsg && err.errMsg.includes('cancel')) {
      replaceIndex.value = -1
      return
    }
    
    let errorMsg = '选择图片失败'
    if (err.errMsg && err.errMsg.includes('permission')) {
      errorMsg = '需要授权访问相册'
    } else if (err.errMsg && err.errMsg.includes('not support')) {
      errorMsg = '当前环境不支持此功能'
    }
    
    uni.showToast({ 
      title: errorMsg, 
      icon: 'none',
      duration: 3000
    })
    replaceIndex.value = -1
  }
}

// 从聊天记录选择用于替换
const chooseFromChatForReplace = () => {
  // #ifdef MP-WEIXIN
  wx.chooseMessageFile({
    count: 1,
    type: 'image',
    success: async (res: any) => {
      console.log('从聊天记录选择替换图片成功:', res)
      try {
        const path = res.tempFiles?.[0]?.path
        if (!path) {
          uni.showToast({ title: '未选择到有效图片', icon: 'none' })
          replaceIndex.value = -1
          return
        }
        
        isProcessing.value = true
        progressText.value = '正在处理图片...'
        
        // 获取图片尺寸
        const info = await getImageInfo(path)
        
        // 上传到OSS
        progressText.value = '正在上传图片...'
        const imageId = generateId()
        const ossUrl = await uploadImageToOss(path, imageId)
        
        // 替换图片
        if (replaceIndex.value >= 0 && replaceIndex.value < images.value.length) {
          images.value[replaceIndex.value] = {
            id: imageId,
            path: ossUrl,
            width: info.width,
            height: info.height
          }
          uni.showToast({ title: '图片已替换', icon: 'success' })
        }
      } catch (err: any) {
        console.error('处理聊天记录图片失败:', err)
        uni.showToast({ title: err.message || '图片处理失败', icon: 'none' })
      } finally {
        isProcessing.value = false
        replaceIndex.value = -1
      }
    },
    fail: (err: any) => {
      console.error('选择聊天记录文件失败:', err)
      if (err.errMsg && err.errMsg.includes('cancel')) {
        replaceIndex.value = -1
        return
      }
      
      let errorMsg = '选择失败'
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
      replaceIndex.value = -1
    }
  })
  // #endif
}

// 显示添加图片选项
const showAddSheet = () => {
  // #ifdef MP-WEIXIN
  uni.showActionSheet({
    itemList: ['从相册选择', '从聊天记录选择'],
    success: (res) => {
      if (res.tapIndex === 0) {
        chooseFromAlbum()
      } else if (res.tapIndex === 1) {
        chooseFromChat()
      }
    }
  })
  // #endif
  
  // #ifndef MP-WEIXIN
  chooseFromAlbum()
  // #endif
}

// 从相册选择图片
const chooseFromAlbum = async () => {
  try {
    // #ifdef MP-WEIXIN
    // 微信小程序需要先检查隐私授权
    if (wx.getPrivacySetting) {
      await new Promise((resolve, reject) => {
        wx.getPrivacySetting({
          success: (res: any) => {
            console.log('隐私设置状态:', res)
            resolve(res)
          },
          fail: () => {
            resolve(null)
          }
        })
      })
    }
    // #endif
    
    await doChooseFromAlbum()
  } catch (e) {
    console.error('选择图片失败:', e)
    uni.showToast({ title: '选择图片失败', icon: 'none' })
  }
}

const doChooseFromAlbum = async () => {
  const remainCount = 20 - images.value.length
  
  try {
    const res: any = await uni.chooseImage({
      count: Math.min(remainCount, 9),
      sizeType: ['original'],
      sourceType: ['album']
    })
    
    // 获取图片路径
    const filePaths = Array.isArray(res.tempFilePaths) ? res.tempFilePaths : []
    
    if (filePaths.length > 0) {
      await processSelectedImages(filePaths)
    }
  } catch (err: any) {
    console.error('选择图片失败:', err)
    if (err.errMsg && err.errMsg.includes('cancel')) {
      return
    }
    
    let errorMsg = '选择图片失败'
    if (err.errMsg && err.errMsg.includes('permission')) {
      errorMsg = '需要授权访问相册'
    } else if (err.errMsg && err.errMsg.includes('not support')) {
      errorMsg = '当前环境不支持此功能'
    }
    
    uni.showToast({ 
      title: errorMsg, 
      icon: 'none',
      duration: 3000
    })
  }
}

// 从聊天记录选择 (仅微信小程序)
const chooseFromChat = () => {
  // #ifdef MP-WEIXIN
  const remainCount = 20 - images.value.length
  
  wx.chooseMessageFile({
    count: Math.min(remainCount, 9),
    type: 'image',
    success: async (res: any) => {
      console.log('从聊天记录选择成功:', res)
      try {
        const paths = res.tempFiles?.map((f: any) => f.path).filter(Boolean) || []
        if (paths.length > 0) {
          await processSelectedImages(paths)
        } else {
          uni.showToast({ title: '未选择到有效图片', icon: 'none' })
        }
      } catch (error) {
        console.error('处理聊天记录图片失败:', error)
        uni.showToast({ title: '处理图片失败', icon: 'none' })
      }
    },
    fail: (err: any) => {
      console.error('选择聊天记录文件失败:', err)
      if (err.errMsg && err.errMsg.includes('cancel')) {
        return
      }
      
      let errorMsg = '选择失败'
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


// 验证图片文件
const validateImageFile = (path: string): { valid: boolean; message?: string } => {
  if (!path) {
    return { valid: false, message: '图片路径无效' }
  }
  
  // 检查文件扩展名
  const supportedFormats = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp']
  const fileExtension = path.toLowerCase().substring(path.lastIndexOf('.'))
  
  if (fileExtension && !supportedFormats.includes(fileExtension)) {
    return { 
      valid: false, 
      message: `不支持的图片格式 ${fileExtension}，请选择 JPG、PNG 等常见格式` 
    }
  }
  
  return { valid: true }
}

// 处理选中的图片，获取尺寸信息并上传到OSS
const processSelectedImages = async (paths: string[]) => {
  isProcessing.value = true
  progressText.value = '正在处理图片...'
  
  try {
    // 重置图片加载计数
    resetImageLoadCounter()
    
    for (let i = 0; i < paths.length; i++) {
      const path = paths[i]
      
      // 验证图片文件
      const validation = validateImageFile(path)
      if (!validation.valid) {
        console.warn(`跳过无效图片: ${path}, 原因: ${validation.message}`)
        uni.showToast({ 
          title: validation.message || '图片格式不支持', 
          icon: 'none',
          duration: 2000
        })
        continue
      }
      
      const imageId = generateId()
      progressText.value = `处理图片 ${i + 1}/${paths.length}...`
      
      try {
        // 获取图片尺寸
        const info = await getImageInfo(path)
        
        // 上传到OSS
        progressText.value = `上传图片 ${i + 1}/${paths.length}...`
        const ossUrl = await uploadImageToOss(path, imageId)
        
        // 添加到图片列表
        images.value.push({
          id: imageId,
          path: ossUrl, // 使用OSS URL
          width: info.width,
          height: info.height
        })
      } catch (err: any) {
        console.error(`处理图片 ${i + 1} 失败:`, err)
        uni.showToast({ 
          title: `图片 ${i + 1} 处理失败: ${err.message || '未知错误'}`, 
          icon: 'none',
          duration: 2000
        })
        // 继续处理下一张图片
        continue
      }
    }
    
    uni.showToast({ title: '图片处理完成', icon: 'success' })
  } catch (err: any) {
    console.error('处理图片失败:', err)
    uni.showToast({ title: err.message || '处理图片失败', icon: 'none' })
  } finally {
    isProcessing.value = false
  }
}

// 获取图片信息
const getImageInfo = (path: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    uni.getImageInfo({
      src: path,
      success: (res) => {
        resolve({ width: res.width, height: res.height })
      },
      fail: reject
    })
  })
}

// 删除图片
const removeImage = (index: number) => {
  images.value.splice(index, 1)
}

// 格式化导出日期
const formatExportDate = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hour = String(now.getHours()).padStart(2, '0')
  const minute = String(now.getMinutes()).padStart(2, '0')
  return `${year}${month}${day}_${hour}${minute}`
}

// 导出图片（使用后端海报生成接口）
const exportImage = async () => {
  if (images.value.length < 1) {
    uni.showToast({ title: '请至少选择1张图片', icon: 'none' })
    return
  }
  
  if (isProcessing.value) {
    uni.showToast({ title: '正在处理中...', icon: 'none' })
    return
  }
  
  try {
    isProcessing.value = true
    progressText.value = '正在生成海报...'
    
    uni.showLoading({
      title: '正在生成图片...',
      mask: true
    })
    
    const posterId = `stitch_${Date.now()}`
    
    // 构建配置数据 (使用 staticData 协议)
    const config = {
      // 新版 staticData 协议
      staticData: staticData.value,
      // 兼容旧版字段
      images: displayImages.value,
      direction: computedDirection.value,
      showDivider: showDivider.value,
      dividerWidth: dividerWidth.value,
      dividerColor: dividerColor.value,
      exportWidth: exportWidth.value,
      // 新增字段
      layoutMode: layoutMode.value,
      gridLayout: gridLayout.value,
      gridGap: gridGap.value,
      bgColor: bgColor.value,
      itemWidth: itemWidth.value ? parseInt(itemWidth.value) : null,
      itemHeight: itemHeight.value ? parseInt(itemHeight.value) : null
    }
    
    // 生成带Base64编码数据的URL
    const targetUrl = generatePosterUrl(config)
    
    console.log('海报生成参数:', { posterId, targetUrl })
    
    // 调用海报生成接口
    const generateRes = await postPainterGenerateInfo({
      id: posterId,
      targetUrl: targetUrl,
      selector: '#stitch-container',
      options: {
        width: exportWidth.value,
        deviceScaleFactor: 2,
        readySelector: '#render-done',
        timeout: 60000
      }
    })
    
    console.log('海报生成响应:', generateRes)
    
    if (!generateRes?.id) {
      throw new Error('生成海报失败，服务器未返回有效数据')
    }
    
    // 下载图片
    // #ifdef H5
    await downloadImageForH5(posterId)
    // #endif
    
    // #ifndef H5
    await downloadImageForMp(posterId)
    // #endif
    
  } catch (error: any) {
    console.error('导出图片失败:', error)
    uni.hideLoading()
    
    const errorDetail = error?.message || error?.errMsg || String(error) || '未知错误'
    uni.showModal({
      title: '导出失败',
      content: errorDetail.substring(0, 200),
      showCancel: false
    })
  } finally {
    isProcessing.value = false
  }
}

// H5端下载图片
const downloadImageForH5 = async (posterId: string) => {
  const imageUrl = `${import.meta.env.VITE_APP_BASE_URL}/painter/${posterId}`
  
  const response = await fetch(imageUrl)
  if (!response.ok) {
    throw new Error(`下载失败，状态码: ${response.status}`)
  }
  
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `拼接图_${formatExportDate()}.png`
  link.click()
  
  URL.revokeObjectURL(url)
  
  uni.hideLoading()
  uni.showToast({
    title: '图片已下载',
    icon: 'success'
  })
}

// 小程序端下载并保存图片
const downloadImageForMp = async (posterId: string) => {
  const baseUrl = String(import.meta.env.VITE_APP_BASE_URL || '').replace(/['"]/g, '')
  const imageUrl = `${baseUrl}/painter/${posterId}`
  
  let tempFilePath: string
  
  try {
    const imageInfo = await new Promise<UniApp.GetImageInfoSuccessData>((resolve, reject) => {
      uni.getImageInfo({
        src: imageUrl,
        success: resolve,
        fail: (err) => reject(new Error(err.errMsg || '获取图片失败'))
      })
    })
    tempFilePath = imageInfo.path
  } catch (err: any) {
    // 如果getImageInfo失败，尝试使用downloadFile
    const downloadRes = await new Promise<UniApp.DownloadSuccessData>((resolve, reject) => {
      uni.downloadFile({
        url: imageUrl,
        success: resolve,
        fail: (err) => reject(new Error(err.errMsg || '下载失败'))
      })
    })
    
    if (downloadRes.statusCode !== 200 || !downloadRes.tempFilePath) {
      throw new Error(`下载失败，状态码: ${downloadRes.statusCode}`)
    }
    tempFilePath = downloadRes.tempFilePath
  }
  
  uni.hideLoading()
  
  // 保存到相册
  try {
    await new Promise<void>((resolve, reject) => {
      uni.saveImageToPhotosAlbum({
        filePath: tempFilePath,
        success: () => resolve(),
        fail: (err) => reject(err)
      })
    })
    
    uni.showToast({
      title: '已保存到相册',
      icon: 'success'
    })
  } catch (saveErr: any) {
    if (saveErr.errMsg && (saveErr.errMsg.includes('auth') || saveErr.errMsg.includes('deny'))) {
      uni.showModal({
        title: '需要授权',
        content: '请授权保存图片到相册',
        confirmText: '去设置',
        success: (res) => {
          if (res.confirm) {
            uni.openSetting()
          }
        }
      })
      return
    }
    
    // 其他错误，使用预览方式
    uni.previewImage({
      urls: [tempFilePath],
      current: tempFilePath
    })
    uni.showToast({
      title: '长按图片可保存',
      icon: 'none',
      duration: 2000
    })
  }
}

</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: calc(140rpx + env(safe-area-inset-bottom));
}

.content {
  padding: 24rpx;
}

.section {
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
}

.preview-section {
  min-height: 400rpx;
}

// ==================== 模式选择器样式 ====================
.mode-tabs {
  display: flex;
  gap: 16rpx;
}

.mode-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 24rpx 16rpx;
  background: #f5f5f5;
  border-radius: 16rpx;
  font-size: 26rpx;
  color: #666;
  transition: all 0.3s;
  
  &.active {
    background: #0046B4;
    color: #fff;
  }
}

.mode-icon {
  font-size: 32rpx;
}

// ==================== 10x10 网格选择器样式 ====================
.grid-selector-wrapper {
  margin-top: 24rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid #f0f0f0;
}

.grid-selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.grid-selector-title {
  font-size: 28rpx;
  color: #333;
}

.grid-selector-value {
  font-size: 28rpx;
  color: #0046B4;
  font-weight: 600;
}

.grid-selector {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 4rpx;
  padding: 16rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
}

.grid-cell {
  aspect-ratio: 1;
  background: #e0e0e0;
  border-radius: 4rpx;
  transition: all 0.15s;
  cursor: pointer;
  
  &.selected {
    background: #0046B4;
  }
  
  &.hovered {
    background: rgba(0, 70, 180, 0.5);
  }
}

// ==================== 表单样式 ====================
.form-row {
  display: flex;
  gap: 24rpx;
  margin-bottom: 16rpx;
}

.form-item {
  flex: 1;
}

.form-label {
  display: block;
  font-size: 26rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.form-input-wrapper {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 16rpx;
}

.form-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  background: transparent;
}

.form-unit {
  font-size: 24rpx;
  color: #999;
  margin-left: 8rpx;
}

.form-tip {
  padding: 16rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  margin-bottom: 16rpx;
  
  &.warning {
    background: #fff3e0;
    color: #e65100;
  }
}

// ==================== Grid 预览样式 ====================
.stitch-preview.grid-mode {
  display: flex !important;
  flex-direction: row !important;
  flex-wrap: wrap !important;
  align-items: flex-start !important;
  max-height: none;
  overflow: visible;
}

.grid-item {
  position: relative;
  overflow: hidden;
  border-radius: 8rpx;
  background: #f0f0f0;
  flex-shrink: 0;
}

.grid-thumb {
  display: block;
  width: 100%;
  height: auto;
}

// 海报容器
.poster-wrapper {
  border-radius: 16rpx;
  overflow: hidden;
  
  // 后端模式样式优化
  &.bot-mode {
    border-radius: 0;
    background: #f8f8f8;
    min-height: 100vh;
    
    // 隐藏所有滚动条
    ::-webkit-scrollbar {
      display: none;
    }
    
    // 确保内容不被截断
    overflow: visible;
  }
}

// 渲染就绪标记
.render-done {
  position: absolute;
  top: -9999px;
  left: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
}

// 后端模式容器样式
.bot-mode {
  // 隐藏导航栏
  .nav-bar {
    display: none;
  }
  
  // 隐藏控制面板
  .section:not(.preview-section) {
    display: none;
  }
  
  // 隐藏添加按钮
  .add-area {
    display: none;
  }
  
  // 隐藏底部操作栏
  .bottom-bar {
    display: none;
  }
  
  // 隐藏进度提示
  .progress-mask {
    display: none;
  }
  
  // 隐藏图片操作按钮
  .image-index,
  .image-actions {
    display: none;
  }
  
  // 隐藏section标题
  .section-header {
    display: none;
  }
  
  // 优化预览区域
  .preview-section {
    padding: 0;
    margin: 0;
    background: transparent;
    border-radius: 0;
  }
  
  // 确保拼接区域占满整个视口
  .poster-wrapper {
    width: 100vw;
    min-height: 100vh;
  }
  
  // 优化图片显示
  .stitch-preview {
    background: transparent;
    padding: 0;
    max-height: none;
    overflow: visible;
  }
  
  // 移除容器的padding
  .content {
    padding: 0;
  }
  
  // 移除容器的底部padding
  .container {
    padding-bottom: 0;
    min-height: auto;
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.section-subtitle {
  font-size: 26rpx;
  color: #999;
}

// 实时预览区域
.stitch-preview {
  background: #f8f8f8;
  border-radius: 16rpx;
  padding: 16rpx;
  max-height: 800rpx;
  overflow-y: auto;
  overflow-x: hidden;
  
  &.vertical {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  &.horizontal {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    overflow-x: auto;
    overflow-y: hidden;
  }
}

.preview-item-wrapper {
  display: flex;
  
  .vertical & {
    flex-direction: column;
    width: 100%;
  }
  
  .horizontal & {
    flex-direction: row;
    height: 300rpx;
  }
}

.preview-item {
  position: relative;
  
  .vertical & {
    width: 100%;
  }
  
  .horizontal & {
    height: 100%;
  }
}

.preview-thumb {
  display: block;
  
  .vertical & {
    width: 100%;
  }
  
  .horizontal & {
    height: 100%;
    width: auto;
  }
}

.image-index {
  position: absolute;
  left: 12rpx;
  top: 12rpx;
  width: 40rpx;
  height: 40rpx;
  background: rgba(0, 70, 180, 0.9);
  border-radius: 50%;
  font-size: 24rpx;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.image-actions {
  position: absolute;
  right: 12rpx;
  top: 12rpx;
  display: flex;
  gap: 8rpx;
}

.action-btn {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &.replace {
    background: rgba(0, 70, 180, 0.9);
  }
  
  &.delete {
    background: rgba(255, 68, 68, 0.9);
  }
}

// 上传状态遮罩
.upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  border-radius: 8rpx;
}

.upload-spinner {
  width: 40rpx;
  height: 40rpx;
  border: 3rpx solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.upload-text {
  font-size: 24rpx;
  color: #fff;
  font-weight: 500;
}

.divider-line {
  flex-shrink: 0;
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
  gap: 16rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

// 添加图片区域
.add-area {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 24rpx;
  margin-top: 24rpx;
  border: 2rpx dashed #0046B4;
  border-radius: 12rpx;
  background: rgba(0, 70, 180, 0.05);
}

.add-text {
  font-size: 28rpx;
  color: #0046B4;
  font-weight: 500;
}

// 控制项
.control-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
}

.control-label {
  font-size: 28rpx;
  color: #333;
}

.control-value {
  font-size: 28rpx;
  color: #0046B4;
  font-weight: 500;
}

// 尺寸输入框
.size-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  padding: 8rpx 16rpx;
}

.size-input {
  width: 120rpx;
  font-size: 28rpx;
  color: #333;
  text-align: right;
}

.size-unit {
  font-size: 24rpx;
  color: #999;
}

// 方向切换
.direction-switch {
  display: flex;
  background: #f5f5f5;
  border-radius: 8rpx;
  overflow: hidden;
}

.direction-option {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 24rpx;
  font-size: 26rpx;
  color: #666;
  transition: all 0.3s;
  
  &.active {
    background: #0046B4;
    color: #fff;
  }
}

// 分割线设置
.divider-settings {
  padding-top: 16rpx;
  border-top: 1rpx solid #f0f0f0;
  margin-top: 16rpx;
}

// 颜色选择器
.color-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  padding: 16rpx 0;
}

.color-option {
  width: 60rpx;
  height: 60rpx;
  border-radius: 8rpx;
  border: 2rpx solid #e0e0e0;
  cursor: pointer;
  
  &.active {
    border: 4rpx solid #0046B4;
    box-shadow: 0 0 0 2rpx #fff inset;
  }
}

// 底部操作栏
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 24rpx 32rpx calc(24rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 24rpx;
}

.btn-stitch,
.btn-save {
  flex: 1;
  height: 88rpx;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  font-size: 30rpx;
  font-weight: 500;
  border: none;
  
  &::after {
    display: none;
  }
}

.btn-stitch {
  background: linear-gradient(135deg, #0046B4 0%, #0066FF 100%);
  color: #fff;
  
  &[disabled] {
    background: #ccc;
    color: #fff;
  }
}

.btn-save {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: #fff;
}

// 进度遮罩
.progress-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.progress-content {
  background: #fff;
  border-radius: 24rpx;
  padding: 48rpx 64rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
}

.progress-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid #f0f0f0;
  border-top-color: #0046B4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.progress-text {
  font-size: 28rpx;
  color: #666;
}
</style>
