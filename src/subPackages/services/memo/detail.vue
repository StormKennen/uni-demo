<template>
  <view class="memo-detail-page">
    <NavBar :title="memoTitle"></NavBar>

    <view class="nav-actions">
      <!-- 导出图片按钮 -->
      <view class="action-btn" @click="exportImage" v-if="memoData">
        <text class="icon">导出</text>
      </view>
      <!-- 分享按钮 -->
      <view class="action-btn" @click="shareMemo" v-if="memoData">
        <text class="icon">分享</text>
      </view>
      <!-- 编辑按钮（仅登录用户） -->
      <view class="action-btn" @click="goToEdit" v-if="isLoggedIn && memoData">
        <text class="icon">编辑</text>
      </view>
    </view>

    <!-- 加载中 -->
    <view v-if="loading" class="loading-container">
      <text>加载中...</text>
    </view>

    <!-- 未登录提示 -->
    <view v-if="!loading && !isLoggedIn" class="login-tip">
      <text class="tip-text">👀 您正在以访客模式查看</text>
      <button class="login-btn" @click="goToLogin">登录后可编辑</button>
    </view>

    <!-- 备忘录内容（预览模式） - 作为海报导出区域 -->
    <view v-if="!loading && memoData" id="poster-wrapper" class="memo-content" :class="{ 'is-ready': !loading && memoData }">
      <!-- 标题 -->
      <!-- <view class="memo-header">
        <text class="memo-title">{{ memoData.name || '未命名备忘录' }}</text>
        <view class="memo-meta">
          <text class="meta-item">📅 {{ formatTime(memoData.created_at) }}</text>
          <text class="meta-item" v-if="memoData.updated_at !== memoData.created_at">
            🔄 {{ formatTime(memoData.updated_at) }}
          </text>
        </view>
      </view> -->

      <!-- 标签 -->
      <view class="memo-tags" v-if="memoData.tags && memoData.tags.length > 0">
        <view class="tag" v-for="tag in memoData.tags" :key="tag">
          <text>{{ tag }}</text>
        </view>
      </view>

      <!-- 内容块 - 与editor.vue预览模式一致 -->
      <view class="content-blocks">
        <view 
          v-for="(block, blockIndex) in parsedContent" 
          :key="blockIndex"
          class="content-block"
        >
          <!-- 文本块 -->
          <view v-if="block.type === 'text'" class="text-block" :style="getBlockStyle(block.style)">
            <view 
              v-for="(item, itemIndex) in block.children" 
              :key="itemIndex"
              class="text-item"
            >
              <text class="text-preview" :style="getTextStyle(item.style)">
                {{ item.value || '' }}
              </text>
            </view>
          </view>

          <!-- 图片块 - 与editor.vue结构一致 -->
          <view v-if="block.type === 'image'" class="image-block" :style="getBlockStyle(block.style)">
            <view 
              v-for="(item, itemIndex) in block.children" 
              :key="itemIndex"
              class="image-item"
            >
              <view class="image-preview" v-if="item.value && item.value.url" @click="previewImage(item.value.url)">
                <view class="image-container">
                  <image 
                    :src="item.value.url"
                    :style="getImageStyle(item.style)"
                    :mode="getImageMode(item.style)"
                  />
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 错误提示 -->
    <view v-if="!loading && error" class="error-container">
      <text class="error-text">{{ error }}</text>
      <button class="retry-btn" @click="loadMemoData">重试</button>
    </view>
    
  </view>
</template>

<script setup lang="ts">
import { postPainterGenerateInfo } from '@/services/apifox/NODEJSDEMO/PAINTER/apifox'

import { ref, computed } from 'vue'
import { onLoad, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import NavBar from '@/components/nav-bar.vue'
import { getToken } from '@/utils/storage'
import { getMemosPublicDetail, getMemosMemoIdPublic } from '@/services/apifox/NODEJSDEMO/MEMOS/apifox'

const memoId = ref<string>('')
const memoData = ref<any>(null)
const loading = ref(true)
const error = ref('')

// 检查登录状态
const isLoggedIn = computed(() => !!getToken())

// 备忘录标题
const memoTitle = computed(() => {
  if (!memoData.value) return '备忘录详情'
  return memoData.value.name || '未命名备忘录'
})

// 解析内容 - content 已经是数组，无需再次解析
const parsedContent = computed(() => {
  if (!memoData.value || !memoData.value.content) return []
  // 如果是字符串则解析，否则直接返回
  if (typeof memoData.value.content === 'string') {
    try {
      return JSON.parse(memoData.value.content)
    } catch (e) {
      console.error('解析内容失败:', e)
      return []
    }
  }
  return memoData.value.content
})

// 页面加载
onLoad((options: any) => {
  if (options.id) {
    memoId.value = options.id
    loadMemoData()
  } else {
    error.value = '缺少备忘录ID'
    loading.value = false
  }
})

// 加载备忘录数据（使用公开API，无需登录）
const loadMemoData = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await getMemosPublicDetail({
      id: memoId.value
    })
    if (res) {
      memoData.value = res
    } else {
      error.value = '备忘录不存在'
    }
  } catch (e: any) {
    console.error('加载备忘录失败:', e)
    error.value = e.message || '加载失败，请重试'
  } finally {
    loading.value = false
  }
}

// 格式化时间
const formatTime = (timestamp: string) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 获取块边框样式 - 与editor.vue的getBlockBorderStyle一致
const getBlockStyle = (style: any) => {
  if (!style) return {}
  return {
    borderTop: style.borderTop ? '2rpx solid #333' : 'none',
    borderBottom: style.borderBottom ? '2rpx solid #333' : 'none',
    borderLeft: style.borderLeft ? '2rpx solid #333' : 'none',
    borderRight: style.borderRight ? '2rpx solid #333' : 'none',
    padding: (style.borderTop || style.borderBottom || style.borderLeft || style.borderRight) ? '16rpx' : '0',
    textAlign: style.textAlign || 'left'
  }
}

// 获取文本样式 - 与editor.vue的getTextStyle一致
const getTextStyle = (style: any) => {
  if (!style) return {}
  return {
    fontWeight: style.bold ? 'bold' : 'normal',
    fontStyle: style.italic ? 'italic' : 'normal',
    textDecoration: style.underline ? 'underline' : (style.lineThrough ? 'line-through' : 'none'),
    fontSize: (style.fontSize || 16) + 'px',
    color: style.color || '#333'
  }
}

// 获取图片样式 - 与editor.vue完全一致
const getImageStyle = (style: any) => {
  if (!style) return {}
  const result: Record<string, string> = {}
  
  // 解析数值（兼容字符串和数字类型）
  const parseValue = (val: any, defaultVal: number) => {
    if (val === undefined || val === null) return defaultVal
    return typeof val === 'string' ? parseInt(val, 10) : val
  }
  
  switch (style.sizeMode) {
    case 'fixedWidth':
      // 固定宽度模式：读取width字段
      result.width = parseValue(style.width, 600) + 'rpx'
      break
    case 'fixedHeight':
      // 固定高度模式：读取height字段
      result.height = parseValue(style.height, 400) + 'rpx'
      result.maxWidth = '100%'
      break
    case 'percentWidth':
      result.width = parseValue(style.widthPercent, 80) + '%'
      break
    case 'percentHeight':
      result.height = parseValue(style.heightPercent, 50) + 'vh'
      result.maxWidth = '100%'
      break
    case 'auto':
    default:
      // auto模式：默认宽度24rpx
      result.width = '24rpx'
      break
  }
  
  // 添加3D旋转样式
  const transforms = []
  if (style.rotateX) {
    transforms.push(`rotateX(${style.rotateX}deg)`)
  }
  if (style.rotateY) {
    transforms.push(`rotateY(${style.rotateY}deg)`)
  }
  if (style.rotate) {
    transforms.push(`rotateZ(${style.rotate}deg)`)
  }
  if (transforms.length > 0) {
    result.transform = transforms.join(' ')
  }
  
  return result
}

// 获取图片模式
const getImageMode = (style: any) => {
  switch (style?.sizeMode) {
    case 'fixedHeight':
    case 'percentHeight':
      return 'heightFix'
    default:
      return 'widthFix'
  }
}

// 获取图片容器样式（用于inline-block布局中的宽度控制）
const getImageContainerStyle = (style: any) => {
  if (!style) return {}
  const result: Record<string, string> = {}
  
  // 解析数值（兼容字符串和数字类型）
  const parseValue = (val: any, defaultVal: number) => {
    if (val === undefined || val === null) return defaultVal
    return typeof val === 'string' ? parseInt(val, 10) : val
  }
  
  switch (style.sizeMode) {
    case 'fixedWidth':
      // 固定宽度模式：读取width字段
      result.width = parseValue(style.width, 600) + 'rpx'
      break
    case 'fixedHeight':
      // fixedHeight模式不设置容器宽度，让图片自适应
      break
    case 'percentWidth':
      result.width = parseValue(style.widthPercent, 80) + '%'
      break
    case 'percentHeight':
      // percentHeight模式不设置容器宽度，让图片自适应
      break
    case 'auto':
    default:
      result.width = '24rpx'
      break
  }
  
  return result
}

// 获取所有图片URL
const getAllImageUrls = () => {
  const urls: string[] = []
  for (const block of parsedContent.value) {
    if (block.type === 'image') {
      for (const item of block.children || []) {
        if (item.value?.url) {
          urls.push(item.value.url)
        }
      }
    }
  }
  return urls
}

// 预览图片（支持多图切换）
const previewImage = (url: string) => {
  const urls = getAllImageUrls()
  const current = urls.indexOf(url)
  uni.previewImage({
    urls,
    current: current >= 0 ? current : 0
  })
}

// 去登录
const goToLogin = () => {
  const currentUrl = `/subPackages/services/memo/detail?id=${memoId.value}`
  uni.navigateTo({
    url: `/pages/mine/login/login?redirectUrl=${encodeURIComponent(currentUrl)}`
  })
}

// 去编辑
const goToEdit = () => {
  uni.navigateTo({
    url: `/subPackages/services/memo/editor?id=${memoId.value}&mode=edit`
  })
}

// ========== 导出图片功能 ==========
const exportLoading = ref(false)

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

// 导出图片（统一使用后端海报生成接口）
const exportImage = async () => {
  if (exportLoading.value) return
  
  try {
    exportLoading.value = true
    uni.showLoading({
      title: '正在生成图片...',
      mask: true
    })
    
    const targetUrl = `${import.meta.env.VITE_PUBLIC_THIS_H5_URL}/subPackages/services/memo/detail?id=${memoId.value}`
    const posterId = `memo_${memoId.value}_${Date.now()}`
    
    console.log('开始生成海报, posterId:', posterId)
    console.log('targetUrl:', targetUrl)
    
    // 第一步：调用接口生成海报
    const generateRes = await postPainterGenerateInfo({
      id: posterId,
      targetUrl: targetUrl,
      selector: '.memo-content',
      options: {
        width: 375,
        deviceScaleFactor: 2,
        readySelector: '.is-ready'
      }
    })
    
    console.log('生成海报响应:', generateRes)
    
    if (!generateRes?.id) {
      throw new Error('生成海报失败')
    }
    
    console.log('开始下载海报图片')
    
    // 第二步：下载图片
    // #ifdef H5
    await downloadImageForH5(posterId)
    // #endif
    
    // #ifndef H5
    await downloadImageForMp(posterId)
    // #endif
    
  } catch (error: any) {
    console.error('导出图片失败:', error)
    uni.hideLoading()
    uni.showToast({
      title: error.message || '导出失败，请重试',
      icon: 'none'
    })
    exportLoading.value = false
  }
}

// H5端下载图片
const downloadImageForH5 = async (posterId: string) => {
  const imageUrl = `${import.meta.env.VITE_APP_BASE_URL}/painter/${posterId}`
  
  // 使用fetch获取图片blob，然后触发下载
  const response = await fetch(imageUrl)
  if (!response.ok) {
    throw new Error(`下载失败，状态码: ${response.status}`)
  }
  
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  
  // 创建下载链接
  const link = document.createElement('a')
  link.href = url
  link.download = `备忘录_${formatExportDate()}.png`
  link.click()
  
  // 释放URL对象
  URL.revokeObjectURL(url)
  
  uni.hideLoading()
  uni.showToast({
    title: '图片已下载',
    icon: 'success'
  })
  exportLoading.value = false
}

// 小程序端下载图片
const downloadImageForMp = async (posterId: string) => {
  const downloadRes = await new Promise<UniApp.DownloadSuccessData>((resolve, reject) => {
    uni.downloadFile({
      url: `${import.meta.env.VITE_APP_BASE_URL}/painter/${posterId}`,
      success: (res) => {
        console.log('下载结果:', res)
        resolve(res)
      },
      fail: (err) => {
        console.error('下载失败:', err)
        reject(err)
      }
    })
  })
  
  if (downloadRes.statusCode !== 200) {
    throw new Error(`下载失败，状态码: ${downloadRes.statusCode}`)
  }
  
  console.log('保存到相册, tempFilePath:', downloadRes.tempFilePath)
  
  // 先隐藏loading，避免遮挡隐私授权弹窗
  uni.hideLoading()
  
  // 保存到相册
  await uni.saveImageToPhotosAlbum({
    filePath: downloadRes.tempFilePath
  })
  uni.showToast({
    title: '已保存到相册',
    icon: 'success'
  })
  exportLoading.value = false
}

// 分享备忘录
const shareMemo = () => {
  // #ifdef MP-WEIXIN
  // 微信小程序使用右上角分享
  uni.showToast({
    title: '请点击右上角分享',
    icon: 'none'
  })
  // #endif
  
  // #ifdef H5
  // H5使用复制链接
  const shareUrl = `${window.location.origin}/subPackages/services/memo/detail?id=${memoId.value}`
  // @ts-ignore
  if (navigator.clipboard) {
    // @ts-ignore
    navigator.clipboard.writeText(shareUrl).then(() => {
      uni.showToast({
        title: '链接已复制',
        icon: 'success'
      })
    }).catch(() => {
      uni.showModal({
        title: '分享链接',
        content: shareUrl,
        showCancel: false
      })
    })
  } else {
    uni.showModal({
      title: '分享链接',
      content: shareUrl,
      showCancel: false
    })
  }
  // #endif
}

// 微信小程序分享配置
// #ifdef MP-WEIXIN
onShareAppMessage(() => {
  return {
    title: memoTitle.value,
    path: `/subPackages/services/memo/detail?id=${memoId.value}`,
    imageUrl: ''
  }
})

onShareTimeline(() => {
  return {
    title: memoTitle.value,
    query: `id=${memoId.value}`
  }
})
// #endif
</script>

<style lang="scss" scoped>
.memo-detail-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.nav-actions {
  display: flex;
  gap: 16rpx;
  background-color: #ffeaa7;
}

.action-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  padding-right: 16rpx;
  .icon {
    font-size: 32rpx;
    color: #1890ff;
  }
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 32rpx;
  text-align: center;
}

.error-text {
  color: #ef4444;
  font-size: 28rpx;
  margin-bottom: 32rpx;
}

.retry-btn {
  padding: 16rpx 48rpx;
  background: #667eea;
  color: #fff;
  border-radius: 8rpx;
  border: none;
}

.login-tip {
  background: #fff3cd;
  padding: 24rpx 32rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1rpx solid #ffeaa7;
}

.tip-text {
  font-size: 28rpx;
  color: #856404;
}

.login-btn {
  padding: 12rpx 32rpx;
  background: #667eea;
  color: #fff;
  border-radius: 8rpx;
  font-size: 26rpx;
  border: none;
}

.memo-content {
  // padding: 32rpx;
}

.memo-header {
  background: #fff;
  padding: 32rpx;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.memo-title {
  font-size: 40rpx;
  font-weight: 600;
  color: #1a1a1a;
  display: block;
  margin-bottom: 16rpx;
}

.memo-meta {
  display: flex;
  gap: 24rpx;
  flex-wrap: wrap;
}

.meta-item {
  font-size: 24rpx;
  color: #999;
}

.memo-tags {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
  margin-bottom: 24rpx;
}

.tag {
  padding: 8rpx 20rpx;
  background: #e8f4ff;
  color: #1890ff;
  border-radius: 24rpx;
  font-size: 24rpx;
}

.content-blocks {
  background: #fff;
  // border-radius: 16rpx;
  padding: 16rpx;
  // box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.content-block {
  margin-bottom: 24rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.text-block, .image-block {
  // padding-left: 24rpx;
}

.text-item, .image-item {
  border-radius: 8rpx;
  display: inline-block;
}

.text-preview {
  display: inline;
  line-height: 1.8;
  word-break: break-word;
}

.image-preview {
  background: #f8f9fa;
  border-radius: 12rpx;
  overflow: hidden;
  display: inline-block;
  
  .image-container {
    min-height: 100rpx;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    
    image {
      display: block;
    }
  }
}

// 隐藏的导出Canvas
.export-canvas {
  position: fixed;
  left: -9999px;
  top: -9999px;
}
</style>
