<template>
  <view class="home-page">
    <!-- 使用 NavBarBase 组件 -->
    <NavBarBase 
      :nav-back="false"
      custom-class="home-navbar"
      :custom-style="{ background: '#667eea' }"
    >
      <template #title>
        <view class="home-navbar-content">
          <image class="navbar-logo" src="/static/logo.png" mode="aspectFit" />
          <view class="navbar-brand">
            <text class="navbar-title">工具箱</text>
            <text class="navbar-slogan">高效 · 实用 · 专业</text>
          </view>
        </view>
      </template>
    </NavBarBase>
    
    <!-- Nav 区域（不吸顶，随页面滚动） -->
    <view class="nav-section">
      <!-- 搜索栏 -->
      <view class="search-bar" @click="goToSearch">
        <uni-icons type="search" size="18" color="#999" />
        <text class="search-placeholder">搜索工具...</text>
      </view>
      
      <!-- 数据统计 -->
      <view class="stats-row">
        <view class="stat-item">
          <text class="stat-num">{{ enabledToolsCount }}</text>
          <text class="stat-label">可用工具</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-num">免费</text>
          <text class="stat-label">全部功能</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-num">本地</text>
          <text class="stat-label">隐私安全</text>
        </view>
      </view>
    </view>

    <!-- 常用工具 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">常用工具</text>
        <text class="section-subtitle">POPULAR</text>
      </view>
      
      <view class="tools-grid popular">
        <view 
          v-for="tool in popularTools" 
          :key="tool.id"
          :class="['tool-card', 'large', { disabled: tool.disabled }]"
          @click="handleActionClick(tool)"
        >
          <view class="tool-icon-wrapper" :style="{ background: tool.gradient }">
            <uni-icons :type="tool.icon" size="32" color="#fff" />
          </view>
          <view class="tool-info">
            <text class="tool-name">{{ tool.name }}</text>
            <text class="tool-desc">{{ tool.desc }}</text>
          </view>
          <view class="tool-arrow" v-if="!tool.disabled">
            <uni-icons type="right" size="16" color="#ccc" />
          </view>
          <view class="tool-badge" v-if="tool.badge">{{ tool.badge }}</view>
        </view>
      </view>
    </view>

    <!-- 图片工具 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">图片工具</text>
        <text class="section-subtitle">IMAGE</text>
      </view>
      
      <view class="tools-grid">
        <view 
          v-for="tool in imageTools" 
          :key="tool.id"
          :class="['tool-card', { disabled: tool.disabled }]"
          @click="handleActionClick(tool)"
        >
          <view class="tool-icon-wrapper small" :style="{ background: tool.gradient }">
            <uni-icons :type="tool.icon" size="24" color="#fff" />
          </view>
          <text class="tool-name">{{ tool.name }}</text>
          <text class="tool-desc">{{ tool.desc }}</text>
        </view>
      </view>
    </view>

    <!-- 更多工具 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">更多工具</text>
        <text class="section-subtitle">MORE</text>
      </view>
      
      <view class="tools-list">
        <view 
          v-for="tool in moreTools" 
          :key="tool.id"
          :class="['tool-list-item', { disabled: tool.disabled }]"
          @click="handleActionClick(tool)"
        >
          <view class="tool-icon-wrapper mini" :style="{ background: tool.gradient }">
            <uni-icons :type="tool.icon" size="20" color="#fff" />
          </view>
          <view class="tool-content">
            <text class="tool-name">{{ tool.name }}</text>
            <text class="tool-desc">{{ tool.desc }}</text>
          </view>
          <view class="tool-status">
            <text v-if="tool.disabled" class="status-dev">开发中</text>
            <uni-icons v-else type="right" size="16" color="#ccc" />
          </view>
        </view>
      </view>
    </view>



    <!-- 底部信息 -->
    <view class="footer">
      <view class="footer-info">
        <view class="security-row">
          <uni-icons type="locked" size="14" color="#10b981" />
          <text class="security-text">数据本地处理，保护您的隐私安全</text>
        </view>
        <text class="icp-text">粤ICP备2025489016号-2</text>
      </view>
    </view>
    
    <!-- H5 底部导航 -->
    <!-- #ifdef H5 -->
    <H5TabBar current="index" />
    <!-- #endif -->
    
    <!-- 微信小程序隐私授权弹窗 -->
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
// @ts-ignore
import { ref, computed, onMounted } from 'vue'
import { isUserLoggedIn, autoLogin } from '@/utils/autoLogin'
import { useShare } from '@/utils/share'
import NavBarBase from '@/components/nav-bar-base.vue'
import H5TabBar from '@/components/h5-tab-bar.vue'
import PrivacyPopup from '@/components/privacy-popup.vue'

// 定义类型
interface Tool {
  id: number
  name: string
  desc: string
  icon: string
  gradient: string
  link: string
  disabled?: boolean
  badge?: string
  isWebLink?: boolean
}

// 声明uni全局对象
declare const uni: any

// 常用工具 - 二维码相关
const popularTools = ref<Tool[]>([
  {
    id: 1,
    name: '二维码生成',
    desc: '支持多种样式，自定义颜色和Logo',
    icon: 'scan',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    link: '/subPackages/tools/qr-generator/index',
    disabled: false,
    badge: '热门'
  },
  {
    id: 2,
    name: '二维码解析',
    desc: '扫码识别或图片上传解析',
    icon: 'camera',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    link: '/subPackages/tools/qr-parser/index',
    disabled: false
  }
])

// 图片工具
const imageTools = ref<Tool[]>([
  {
    id: 3,
    name: '图片压缩',
    desc: '智能压缩不失真',
    icon: 'image',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    link: '/subPackages/tools/image-compress/index',
    disabled: false
  },
  {
    id: 4,
    name: '文件上传',
    desc: '安全快速传输',
    icon: 'upload',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    link: '/subPackages/tools/oss-upload/index',
    disabled: false
  }
])

// 更多工具
const moreTools = ref<Tool[]>([
  {
    id: 5,
    name: '食谱大全',
    desc: '中文食谱，食材筛选',
    icon: 'flag',
    gradient: 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)',
    link: '/subPackages/services/recipe/index',
    disabled: false,
    badge: '新'
  },
  {
    id: 6,
    name: '族谱查看',
    desc: '快照模式，仅供浏览',
    icon: 'person',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    link: '/subPackages/tools/family-tree/demo',
    disabled: false
  },
  {
    id: 7,
    name: '族谱编辑',
    desc: '实时数据，支持编辑',
    icon: 'personadd',
    gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    link: '/subPackages/tools/family-tree/index',
    disabled: false
  },
  {
    id: 8,
    name: '更多工具',
    desc: '敬请期待更多实用功能',
    icon: 'more',
    gradient: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
    link: '',
    disabled: true
  }
])

// 计算可用工具数量
const enabledToolsCount = computed(() => {
  const all = [...popularTools.value, ...imageTools.value, ...moreTools.value]
  return all.filter(t => !t.disabled).length
})

// 生命周期
onMounted(async () => {
  // 执行自动登录检查
  try {
    const result = await autoLogin()
    console.log('首页自动登录检查结果:', result)
  } catch (error) {
    console.log('首页自动登录检查失败:', error)
  }
})

// 工具点击处理
const handleActionClick = async (tool: Tool) => {
  if (tool.disabled) {
    uni.showToast({
      title: '功能开发中，敬请期待',
      icon: 'none',
      duration: 2000
    })
    return
  }
  
  // 处理外部链接
  if (tool.isWebLink) {
    uni.navigateTo({
      url: `/subPackages/common/webview/h5?path=${encodeURIComponent(tool.link)}&title=${encodeURIComponent(tool.name)}`
    })
    return
  }
  
  // 需要登录的服务列表
  const needLoginServices: string[] = []
  
  if (needLoginServices.includes(tool.link)) {
    if (!isUserLoggedIn()) {
      uni.showToast({ title: '请先登录', icon: 'none' })
      try {
        const result = await autoLogin()
        if (result.isLoggedIn) {
          uni.navigateTo({ url: tool.link })
        } else {
          setTimeout(() => uni.navigateTo({ url: '/pages/mine/login/login' }), 1000)
        }
      } catch {
        setTimeout(() => uni.navigateTo({ url: '/pages/mine/login/login' }), 1000)
      }
      return
    }
  }
  
  uni.navigateTo({ url: tool.link })
}

// 搜索
const goToSearch = () => {
  uni.showToast({
    title: '搜索功能开发中',
    icon: 'none'
  })
}

// 分享功能
const { onShareAppMessage, onShareTimeline } = useShare('index', {
  title: '工具箱 - 高效实用的工具集合',
  path: '/pages/index/index'
})

defineExpose({
  onShareAppMessage,
  onShareTimeline
})
</script>

<style lang="scss" scoped>
// 现代简洁配色
$bg-color: #f5f7fa;
$card-bg: #ffffff;
$text-primary: #1a1a1a;
$text-secondary: #666666;
$text-hint: #999999;
$border-color: #eaeef3;
$shadow-sm: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
$shadow-md: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
$radius-sm: 16rpx;
$radius-md: 24rpx;
$radius-lg: 32rpx;

.home-page {
  min-height: 100vh;
  background: $bg-color;
  overflow-x: hidden; // 防止水平滚动
  
  /* #ifdef H5 */
  padding-bottom: 140rpx;
  /* #endif */
}

// 首页导航栏内容
.home-navbar-content {
  display: flex;
  align-items: center;
  gap: 16rpx;
  
  .navbar-logo {
    width: 56rpx;
    height: 56rpx;
    border-radius: 12rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
  }
  
  .navbar-brand {
    display: flex;
    flex-direction: column;
    justify-content: center;
    
    .navbar-title {
      font-size: 32rpx;
      font-weight: 700;
      color: #fff;
      letter-spacing: 1rpx;
      line-height: 1.2;
    }
    
    .navbar-slogan {
      font-size: 18rpx;
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.2;
    }
  }
}

// Nav 区域（不吸顶）
.nav-section {
  background: #667eea; // 纯色，与导航栏统一
  padding: 24rpx 32rpx 40rpx;
  border-radius: 0 0 48rpx 48rpx;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -20rpx;
    left: 50%;
    transform: translateX(-50%);
    width: 200rpx;
    height: 40rpx;
    background: inherit;
    filter: blur(30rpx);
    opacity: 0.3;
    border-radius: 50%;
  }
}

// 搜索栏
.search-bar {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx 32rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: $radius-lg;
  box-shadow: $shadow-md;
  
  .search-placeholder {
    font-size: 28rpx;
    color: $text-hint;
  }
}

// 数据统计
.stats-row {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-top: 32rpx;
  padding: 24rpx 0;
  
  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    
    .stat-num {
      font-size: 36rpx;
      font-weight: 700;
      color: #fff;
    }
    
    .stat-label {
      font-size: 22rpx;
      color: rgba(255, 255, 255, 0.8);
      margin-top: 8rpx;
    }
  }
  
  .stat-divider {
    width: 1px;
    height: 48rpx;
    background: rgba(255, 255, 255, 0.3);
  }
}

// 通用区块
.section {
  padding: 32rpx;
  
  .section-header {
    display: flex;
    align-items: baseline;
    gap: 12rpx;
    margin-bottom: 24rpx;
    
    .section-title {
      font-size: 34rpx;
      font-weight: 600;
      color: $text-primary;
    }
    
    .section-subtitle {
      font-size: 20rpx;
      color: $text-hint;
      letter-spacing: 2rpx;
    }
  }
}

// 工具网格 - 常用工具（大卡片）
.tools-grid.popular {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  
  .tool-card.large {
    display: flex;
    align-items: center;
    padding: 32rpx;
    background: $card-bg;
    border-radius: $radius-md;
    box-shadow: $shadow-sm;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
    
    &:active {
      transform: scale(0.98);
      box-shadow: $shadow-md;
    }
    
    .tool-icon-wrapper {
      width: 100rpx;
      height: 100rpx;
      border-radius: $radius-md;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .tool-info {
      flex: 1;
      margin-left: 28rpx;
      
      .tool-name {
        font-size: 32rpx;
        font-weight: 600;
        color: $text-primary;
        display: block;
      }
      
      .tool-desc {
        font-size: 24rpx;
        color: $text-secondary;
        margin-top: 8rpx;
        display: block;
      }
    }
    
    .tool-arrow {
      flex-shrink: 0;
    }
    
    .tool-badge {
      position: absolute;
      top: 0;
      right: 0;
      padding: 8rpx 20rpx;
      background: linear-gradient(135deg, #ff6b6b, #ee5a24);
      color: #fff;
      font-size: 20rpx;
      font-weight: 500;
      border-radius: 0 $radius-md 0 $radius-sm;
    }
    
    &.disabled {
      opacity: 0.5;
      
      &:active {
        transform: none;
      }
    }
  }
}

// 工具网格 - 图片工具（小卡片）
.tools-grid:not(.popular) {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
  
  .tool-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 36rpx 24rpx;
    background: $card-bg;
    border-radius: $radius-md;
    box-shadow: $shadow-sm;
    transition: all 0.3s ease;
    
    &:active {
      transform: scale(0.96);
      box-shadow: $shadow-md;
    }
    
    .tool-icon-wrapper.small {
      width: 80rpx;
      height: 80rpx;
      border-radius: 20rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20rpx;
    }
    
    .tool-name {
      font-size: 28rpx;
      font-weight: 600;
      color: $text-primary;
      margin-bottom: 8rpx;
    }
    
    .tool-desc {
      font-size: 22rpx;
      color: $text-hint;
    }
    
    &.disabled {
      opacity: 0.5;
      
      &:active {
        transform: none;
      }
    }
  }
}

// 工具列表
.tools-list {
  background: $card-bg;
  border-radius: $radius-md;
  box-shadow: $shadow-sm;
  overflow: hidden;
  
  .tool-list-item {
    display: flex;
    align-items: center;
    padding: 28rpx 32rpx;
    border-bottom: 1rpx solid $border-color;
    transition: background 0.2s ease;
    
    &:last-child {
      border-bottom: none;
    }
    
    &:active {
      background: #f8f9fa;
    }
    
    .tool-icon-wrapper.mini {
      width: 64rpx;
      height: 64rpx;
      border-radius: 16rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .tool-content {
      flex: 1;
      margin-left: 24rpx;
      
      .tool-name {
        font-size: 28rpx;
        font-weight: 500;
        color: $text-primary;
        display: block;
      }
      
      .tool-desc {
        font-size: 22rpx;
        color: $text-hint;
        margin-top: 4rpx;
        display: block;
      }
    }
    
    .tool-status {
      flex-shrink: 0;
      
      .status-dev {
        font-size: 22rpx;
        color: $text-hint;
        padding: 6rpx 16rpx;
        background: #f0f0f0;
        border-radius: 20rpx;
      }
    }
    
    &.disabled {
      opacity: 0.6;
      
      &:active {
        background: transparent;
      }
    }
  }
}

// 底部信息
.footer {
  padding: 48rpx 32rpx 32rpx;
  
  .footer-info {
    text-align: center;
    
    .security-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8rpx;
      margin-bottom: 16rpx;
      
      .security-text {
        font-size: 24rpx;
        color: #10b981;
      }
    }
    
    .icp-text {
      font-size: 22rpx;
      color: $text-hint;
    }
  }
}
</style>
