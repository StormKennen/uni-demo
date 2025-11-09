<template>
  <view class="home-page">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="header-content">
        <view class="logo-section">
          <image class="logo" src="/static/logo.png" mode="aspectFit" />
          <view class="company-info">
            <text class="company-name">kai</text>
            <text class="company-slogan">专业服务平台</text>
          </view>
        </view>
        <view class="header-actions">
          <view class="search-btn" @click="goToSearch">
            <uni-icons type="search" size="20" color="#666" />
          </view>
          <view class="notification-btn" @click="goToNotification">
            <uni-icons type="notification" size="20" color="#666" />
            <view v-if="hasNotification" class="notification-dot"></view>
          </view>
        </view>
      </view>
    </view>

    <!-- 轮播图 -->
    <view class="banner-section">
      <swiper class="banner-swiper" :indicator-dots="true" :autoplay="true" :interval="3000" :duration="500">
        <swiper-item v-for="(banner, index) in banners" :key="index">
          <image class="banner-image" :src="banner.image" mode="aspectFill" @click="handleBannerClick(banner)" />
        </swiper-item>
      </swiper>
    </view>

    <!-- 快捷功能入口 -->
    <view class="quick-actions">
      <view class="section-title">
        <text class="title-text">快捷服务</text>
        <text class="title-desc">一站式解决方案</text>
      </view>
      
      <view class="action-grid">
        <view 
          :class="['action-item', { 'action-item-disabled': action.disabled }]" 
          v-for="(action, index) in quickActions" 
          :key="index"
          @click.prevent.stop="handleActionClick(action)"
        >
          <view class="action-icon" :style="{ background: action.bgColor }">
            <uni-icons :type="action.icon" size="24" color="white" />
          </view>
          <text class="action-name">{{ action.name }}</text>
          <text class="action-desc">{{ action.desc }}</text>
        </view>
      </view>
    </view>






    <!-- 底部安全提示 -->
    <view class="safety-tips">
      <view class="tips-content">
        <uni-icons type="info" size="16" color="#999" />
        <text class="tips-text">平台已通过安全认证，请放心使用</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
// @ts-ignore
import { ref, onMounted } from 'vue'
import { isUserLoggedIn, autoLogin } from '@/utils/autoLogin'
import { useShare } from '@/utils/share'

// 定义类型
interface Banner {
  id: number
  image: string
  title: string
  link: string
}

interface QuickAction {
  id: number
  name: string
  desc: string
  icon: string
  bgColor: string
  link: string
}

interface HotService {
  id: number
  name: string
  desc: string
  image: string
  tags: string[]
  link: string
}

interface BusinessCategory {
  id: number
  name: string
  icon: string
  count: number
  link: string
}

// 声明uni全局对象
declare const uni: any

// 轮播图数据
const banners = ref([])

// 快捷功能
const quickActions = ref([
  // {
  //   id: 1,
  //   name: '食谱',
  //   desc: '今天我们来做菜',
  //   icon: 'home',
  //   bgColor: '#0046B4',
  //   // link: '/pages/pagesServices/recipe/index',
  //   link: 'https://eat.lz-t.top',
  //   disabled: false,
  //   isWebLink: true // 是外链
  // },
  {
    id: 1,
    name: '图片压缩',
    desc: '智能压缩',
    icon: 'image',
    bgColor: '#FF6B35',
    link: '/subPackages/tools/image-compress/index',
    disabled: false
  },
  {
    id: 2,
    name: '二维码生成',
    desc: '支持样式编辑',
    icon: 'scan',
    bgColor: '#FF6600',
    link: '/subPackages/tools/qr-generator/index',
    disabled: false
  },
  {
    id: 8,
    name: '解析二维码',
    desc: '图片解析/扫码解析',
    icon: 'scan',
    bgColor: '#6A5ACD',
    link: '/subPackages/tools/qr-parser/index',
    disabled: false
  },
  {
    id: 3,
    name: '族谱（快照）',
    desc: '不可编辑',
    icon: 'person',
    bgColor: '#55CBA0',
    link: '/subPackages/tools/family-tree/demo',
    disabled: false
  },
  {
    id: 4,
    name: '族谱（实时）',
    desc: '数据实时更新',
    icon: 'person',
    bgColor: '#FF9933',
    link: '/subPackages/tools/family-tree/index',
    disabled: false
  },
  {
    id: 5,
    name: '开发中',
    desc: '开发中',
    icon: 'chat',
    bgColor: '#999999',
    link: '',
    disabled: true
  },
  {
    id: 6,
    name: '开发中',
    desc: '开发中',
    icon: 'shop',
    bgColor: '#999999',
    link: '',
    disabled: true
  },
  {
    id: 7,
    name: '开发中',
    desc: '开发中',
    icon: 'list',
    bgColor: '#999999',
    link: '',
    disabled: true
  },

])



// 状态数据
const hasNotification = ref(false)

// 生命周期
onMounted(async () => {
  // 检查是否有通知
  checkNotifications()
  
  // 执行自动登录检查
  try {
    const result = await autoLogin()
    console.log('首页自动登录检查结果:', result)
  } catch (error) {
    console.log('首页自动登录检查失败:', error)
  }
})

// 方法
const checkNotifications = () => {
  // 这里可以调用API检查是否有新通知
  hasNotification.value = Math.random() > 0.5
}

const handleBannerClick = (banner: any) => {
  uni.navigateTo({
    url: banner.link
  })
}

const handleActionClick = async (action: any) => {
  // 检查是否为禁用状态
  if (action.disabled) {
    uni.showToast({
      title: '功能开发中，敬请期待',
      icon: 'none',
      duration: 2000
    })
    return
  }
  
  // 特殊处理使用h5页面打开外部链接
  if (action.isWebLink) {
    // 检查当前运行环境
    // #ifdef MP-WEIXIN
    // 微信小程序环境，由于web-view域名限制，提示用户
    // uni.showModal({
    //   title: '提示',
    //   content: '由于微信小程序限制，食谱功能暂时无法使用。请在H5版本中体验此功能。',
    //   showCancel: false,
    //   confirmText: '我知道了'
    // })
    // return
    // #endif
    
    // 其他环境（H5、App等）正常跳转
    uni.navigateTo({
      url: `/subPackages/common/webview/h5?path=${encodeURIComponent(action.link)}&title=${encodeURIComponent('食谱')}`
    })
    return
  }
  
  // 定义需要登录的服务列表
  const needLoginServices = [
    '/pages/pagesServices/business/company-account-open/index',
    '/pages/mall/mall',
    '/subPackages/user/order/order'
  ]
  
  // 检查是否需要登录
  if (needLoginServices.includes(action.link)) {
    if (!isUserLoggedIn()) {
      // 需要登录，跳转到登录页面
      uni.showToast({
        title: '请先登录',
        icon: 'none'
      })
      
      try {
        const result = await autoLogin()
        if (result.isLoggedIn) {
          // 自动登录成功，继续跳转
          uni.navigateTo({
            url: action.link
          })
        } else {
          // 自动登录失败，跳转登录页面
          setTimeout(() => {
            uni.navigateTo({
              url: '/pages/mine/login/login'
            })
          }, 1000);
        }
      } catch (error) {
        console.log('自动登录检查失败:', error)
        setTimeout(() => {
          uni.navigateTo({
            url: '/pages/mine/login/login'
          })
        }, 1000);
      }
      return
    }
  }
  
  // 不需要登录或已登录，直接跳转
  uni.navigateTo({
    url: action.link
  })
}



const goToSearch = () => {
  uni.navigateTo({
    url: '/pages/country-search/index'
  })
}

const goToNotification = () => {
  uni.showToast({
    title: '暂无新通知',
    icon: 'none'
  })
}







const handleDisabledClick = () => {
  uni.showToast({
    title: '功能开发中，敬请期待',
    icon: 'none'
  })
}

// 分享功能
const { onShareAppMessage, onShareTimeline } = useShare('index', {
  title: 'kai - 专业服务平台',
  path: '/pages/index/index'
})

// 导出分享方法供微信小程序调用
defineExpose({
  onShareAppMessage,
  onShareTimeline
})
</script>

<style lang="scss" scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #F8FCFF 0%, #FFFFFF 100%);
}

.header {
  background: linear-gradient(135deg, #0046B4 0%, #1E40AF 100%);
  padding: 88rpx 32rpx 32rpx;
  color: white;
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .logo-section {
      display: flex;
      align-items: center;
      
      .logo {
        width: 80rpx;
        height: 80rpx;
        margin-right: 24rpx;
      }
      
      .company-info {
        display: flex;
        flex-direction: column;
        
        .company-name {
          font-size: 36rpx;
          font-weight: 600;
          margin-bottom: 8rpx;
        }
        
        .company-slogan {
          font-size: 24rpx;
          opacity: 0.8;
        }
      }
    }
    
    .header-actions {
      display: flex;
      align-items: center;
      gap: 32rpx;
      
      .search-btn,
      .notification-btn {
        width: 64rpx;
        height: 64rpx;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        
        .notification-dot {
          position: absolute;
          top: 8rpx;
          right: 8rpx;
          width: 16rpx;
          height: 16rpx;
          background: #EF4444;
          border-radius: 50%;
        }
      }
    }
  }
}

.banner-section {
  margin: -16rpx 32rpx 0;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 32rpx rgba(0, 70, 180, 0.1);
  
  .banner-swiper {
    height: 320rpx;
    
    .banner-image {
      width: 100%;
      height: 100%;
    }
  }
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
  
  .title-text {
    font-size: 36rpx;
    font-weight: 600;
    color: #121A26;
  }
  
  .title-desc {
    font-size: 24rpx;
    color: #666;
    margin-left: 16rpx;
  }
  
  .more-btn {
    font-size: 28rpx;
    color: #0046B4;
  }
}

.quick-actions {
  padding: 48rpx 32rpx 0;
  
  .action-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 32rpx;
    
    .action-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32rpx 16rpx;
      background: white;
      border-radius: 16rpx;
      box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease;
      
      &:active {
        transform: scale(0.95);
      }
      
      .action-icon {
        width: 80rpx;
        height: 80rpx;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 16rpx;
      }
      
      .action-name {
        font-size: 28rpx;
        font-weight: 600;
        color: #121A26;
        margin-bottom: 8rpx;
        text-align: center;
      }
      
      .action-desc {
        font-size: 22rpx;
        color: #666;
        text-align: center;
      }
      
      &.action-item-disabled {
        opacity: 0.6;
        
        &:active {
          transform: none;
        }
        
        .action-name,
        .action-desc {
          color: #999;
        }
      }
    }
  }
}

.hot-services {
  padding: 48rpx 32rpx 0;
  
  .service-list {
    display: flex;
    flex-direction: column;
    gap: 24rpx;
    
    .service-card {
      display: flex;
      align-items: center;
      padding: 24rpx;
      background: white;
      border-radius: 16rpx;
      box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease;
      
      &:active {
        transform: scale(0.98);
      }
      
      .service-image {
        width: 120rpx;
        height: 120rpx;
        border-radius: 12rpx;
        margin-right: 24rpx;
      }
      
      .service-info {
        flex: 1;
        
        .service-name {
          font-size: 32rpx;
          font-weight: 600;
          color: #121A26;
          margin-bottom: 8rpx;
          display: block;
        }
        
        .service-desc {
          font-size: 26rpx;
          color: #666;
          margin-bottom: 16rpx;
          display: block;
        }
        
        .service-tags {
          display: flex;
          gap: 12rpx;
          
          .service-tag {
            padding: 8rpx 16rpx;
            background: #F0F9FF;
            color: #0046B4;
            font-size: 22rpx;
            border-radius: 20rpx;
          }
        }
      }
      
      .service-arrow {
        margin-left: 16rpx;
      }
      
      // 禁用状态样式
      &.service-card-disabled {
        opacity: 0.6;
        
        &:active {
          transform: none;
        }
        
        .service-name,
        .service-desc {
          color: #999;
        }
        
        .service-tag {
          background: #f5f5f5;
          color: #999;
        }
      }
    }
  }
}

.business-categories {
  padding: 48rpx 32rpx 0;
  
  .category-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24rpx;
    
    .category-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32rpx 24rpx;
      background: white;
      border-radius: 16rpx;
      box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease;
      
      &:active {
        transform: scale(0.95);
      }
      
      .category-icon {
        width: 80rpx;
        height: 80rpx;
        margin-bottom: 16rpx;
        
        image {
          width: 100%;
          height: 100%;
        }
      }
      
      .category-name {
        font-size: 28rpx;
        font-weight: 600;
        color: #121A26;
        margin-bottom: 8rpx;
        text-align: center;
      }
      
      .category-count {
        font-size: 22rpx;
        color: #666;
        text-align: center;
      }
      
      // 禁用状态样式
      &.category-item-disabled {
        opacity: 0.6;
        
        &:active {
          transform: none;
        }
        
        .category-name,
        .category-count {
          color: #999;
        }
      }
    }
  }
}

.bottom-recommend {
  padding: 48rpx 32rpx 0;
  
  .recommend-content {
    display: flex;
    flex-direction: column;
    gap: 24rpx;
    
    .recommend-card {
      display: flex;
      align-items: center;
      padding: 32rpx;
      background: white;
      border-radius: 16rpx;
      box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease;
      
      &:active {
        transform: scale(0.98);
      }
      
      .recommend-icon {
        margin-right: 24rpx;
      }
      
      .recommend-info {
        flex: 1;
        
        .recommend-title {
          font-size: 32rpx;
          font-weight: 600;
          color: #121A26;
          margin-bottom: 8rpx;
          display: block;
        }
        
        .recommend-desc {
          font-size: 26rpx;
          color: #666;
          display: block;
        }
      }
      
      .recommend-arrow {
        margin-left: 16rpx;
      }
      
      // 禁用状态样式
      &.recommend-card-disabled {
        opacity: 0.6;
        
        &:active {
          transform: none;
        }
        
        .recommend-title,
        .recommend-desc {
          color: #999;
        }
      }
    }
  }
}

.safety-tips {
  padding: 48rpx 32rpx 32rpx;
  
  .tips-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16rpx;
    padding: 24rpx;
    background: rgba(0, 70, 180, 0.05);
    border-radius: 12rpx;
    
    .tips-text {
      font-size: 24rpx;
      color: #666;
    }
  }
}

// 响应式设计
@media screen and (max-width: 750rpx) {
  .quick-actions .action-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .business-categories .category-list {
    grid-template-columns: 1fr;
  }
}
</style>
