<template>
  <view class="home-page">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="header-content">
        <view class="logo-section">
          <image class="logo" src="/static/logo.png" mode="aspectFit" />
          <view class="company-info">
            <text class="company-name">kai</text>
            <text class="company-slogan">专业商务服务平台</text>
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
        <text class="title-desc">一站式商务解决方案</text>
      </view>
      
      <view class="action-grid">
        <view 
          class="action-item" 
          v-for="(action, index) in quickActions" 
          :key="index"
          @click="handleActionClick(action)"
        >
          <view class="action-icon" :style="{ background: action.bgColor }">
            <uni-icons :type="action.icon" size="24" color="white" />
          </view>
          <text class="action-name">{{ action.name }}</text>
          <text class="action-desc">{{ action.desc }}</text>
        </view>
      </view>
    </view>

    <!-- 热门服务 -->
    <view class="hot-services">
      <view class="section-title">
        <text class="title-text">热门服务</text>
        <text class="more-btn" @click="goToMoreServices">更多 ></text>
      </view>
      
      <view class="service-list">
        <view 
          class="service-card" 
          v-for="(service, index) in hotServices" 
          :key="index"
          @click="handleServiceClick(service)"
        >
          <image class="service-image" :src="service.image" mode="aspectFill" />
          <view class="service-info">
            <text class="service-name">{{ service.name }}</text>
            <text class="service-desc">{{ service.desc }}</text>
            <view class="service-tags">
              <text 
                class="service-tag" 
                v-for="(tag, tagIndex) in service.tags" 
                :key="tagIndex"
              >
                {{ tag }}
              </text>
            </view>
          </view>
          <view class="service-arrow">
            <uni-icons type="right" size="16" color="#999" />
          </view>
        </view>
      </view>
    </view>

    <!-- 业务分类 -->
    <view class="business-categories">
      <view class="section-title">
        <text class="title-text">业务分类</text>
      </view>
      
      <view class="category-list">
        <view 
          class="category-item" 
          v-for="(category, index) in businessCategories" 
          :key="index"
          @click="handleCategoryClick(category)"
        >
          <view class="category-icon">
            <image :src="category.icon" mode="aspectFit" />
          </view>
          <text class="category-name">{{ category.name }}</text>
          <text class="category-count">{{ category.count }}项服务</text>
        </view>
      </view>
    </view>

    <!-- 底部推荐 -->
    <view class="bottom-recommend">
      <view class="section-title">
        <text class="title-text">为您推荐</text>
      </view>
      
      <view class="recommend-content">
        <view class="recommend-card" @click="goToCalculator">
          <view class="recommend-icon">
            <uni-icons type="calculator" size="32" color="#0046B4" />
          </view>
          <view class="recommend-info">
            <text class="recommend-title">税务计算器</text>
            <text class="recommend-desc">快速计算税务，智能规划财务</text>
          </view>
          <view class="recommend-arrow">
            <uni-icons type="right" size="16" color="#999" />
          </view>
        </view>
        
        <view class="recommend-card" @click="goToChat">
          <view class="recommend-icon">
            <uni-icons type="chat" size="32" color="#55CBA0" />
          </view>
          <view class="recommend-info">
            <text class="recommend-title">AI商务规划师</text>
            <text class="recommend-desc">智能咨询，专业建议</text>
          </view>
          <view class="recommend-arrow">
            <uni-icons type="right" size="16" color="#999" />
          </view>
        </view>
      </view>
    </view>

    <!-- 底部安全提示 -->
    <view class="safety-tips">
      <view class="tips-content">
        <uni-icons type="info" size="16" color="#999" />
        <text class="tips-text">银河商务平台已通过安全认证，请放心使用</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
// @ts-ignore
import { ref, onMounted } from 'vue'
import { isUserLoggedIn, autoLogin } from '@/utils/autoLogin'

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
const banners = ref([
  {
    id: 1,
    image: '/static/image/home/cooking.jpg',
    title: 'AI智能商务规划',
    link: '/pages/introduce/introduce'
  },
  {
    id: 2,
    image: '/static/image/home/cooking.jpg',
    title: '专业税务服务',
    link: '/pages/calculator/tax-calculator/index'
  }
])

// 快捷功能
const quickActions = ref([
  {
    id: 1,
    name: '食谱',
    desc: '今天我们来做菜',
    icon: 'home',
    bgColor: '#0046B4',
    link: '/pages/pagesServices/recipe/index'
  },
  {
    id: 2,
    name: '税务服务',
    desc: '专业税务规划',
    icon: 'wallet',
    bgColor: '#55CBA0',
    link: '/pages/calculator/tax-calculator/index'
  },
  {
    id: 3,
    name: '银行开户',
    desc: '便捷开户服务',
    icon: 'credit-card',
    bgColor: '#FF6B35',
    link: '/pages/pagesServices/business/company-account-open/index'
  },
  {
    id: 4,
    name: 'AI咨询',
    desc: '智能商务咨询',
    icon: 'chat',
    bgColor: '#8B5CF6',
    link: '/pages/introduce/introduce'
  },
  {
    id: 5,
    name: '商品商城',
    desc: '优质商品推荐',
    icon: 'shop',
    bgColor: '#F59E0B',
    link: '/pages/mall/mall'
  },
  {
    id: 6,
    name: '订单管理',
    desc: '订单状态查询',
    icon: 'list',
    bgColor: '#EF4444',
    link: '/pages/mine/order/order'
  },
  {
    id: 7,
    name: 'Token测试',
    desc: '测试Token过期逻辑',
    icon: 'gear',
    bgColor: '#6B7280',
    link: '/pages/test-token'
  }
])

// 热门服务
const hotServices = ref([
  {
    id: 1,
    name: '强制公积金服务',
    desc: '专业公积金开户及管理服务',
    image: '/static/image/home/liucheng.svg',
    tags: ['热门', '推荐'],
    link: '/pages/pagesServices/business/mandatory-provident-fund/home'
  },
  {
    id: 2,
    name: '个人税务服务',
    desc: '个人税务申报及规划',
    image: '/static/image/home/shuishou.svg',
    tags: ['专业', '高效'],
    link: '/pages/pagesPersonalTax/home'
  },
  {
    id: 3,
    name: '薪俸税服务',
    desc: '薪俸税计算及申报',
    image: '/static/image/home/youshi.svg',
    tags: ['精准', '快速'],
    link: '/pages/pagesSalaryTax/home/index'
  },

])

// 业务分类
const businessCategories = ref([
  {
    id: 1,
    name: '公司服务',
    icon: '/static/image/home/anli.svg',
    count: 12,
    link: '/pages/pagesServices/business'
  },
  {
    id: 2,
    name: '税务服务',
    icon: '/static/image/home/shuishou.svg',
    count: 8,
    link: '/pages/calculator/tax-calculator/index'
  },
  {
    id: 3,
    name: '个人服务',
    icon: '/static/image/home/youshi.svg',
    count: 6,
    link: '/pages/pagesPersonalTax/home'
  },
  {
    id: 4,
    name: '金融服务',
    icon: '/static/image/home/liucheng.svg',
    count: 10,
    link: '/pages/pagesServices/business/company-account-open/index'
  }
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
  // 定义需要登录的服务列表
  const needLoginServices = [
    '/pages/calculator/tax-calculator/index',
    '/pages/pagesServices/business/company-account-open/index',
    '/pages/mall/mall',
    '/pages/mine/order/order'
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

const handleServiceClick = async (service: any) => {
  // 定义需要登录的服务列表
  const needLoginServices = [
    '/pages/pagesServices/business/mandatory-provident-fund/home',
    '/pages/pagesPersonalTax/home',
    '/pages/pagesSalaryTax/home/index'
  ]
  
  // 检查是否需要登录
  if (needLoginServices.includes(service.link)) {
    if (!isUserLoggedIn()) {
      // 需要登录，跳转到登录页面
      uni.showToast({
        title: '请先登录',
        icon: 'none'
      })
      // 跳转前，触发自动登录。无法自动登录，再跳转页面
      try {
        const result = await autoLogin()
        if (result.isLoggedIn) {
          // 自动登录成功，继续跳转
          uni.navigateTo({
            url: service.link
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
    url: service.link
  })
}



const handleCategoryClick = (category: any) => {
  uni.navigateTo({
    url: category.link
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

const goToMoreServices = () => {
  uni.navigateTo({
    url: '/pages/pagesServices/business'
  })
}

const goToCalculator = () => {
  uni.navigateTo({
    url: '/pages/calculator/tax-calculator/index'
  })
}

const goToChat = () => {
  uni.navigateTo({
    url: '/pages/introduce/introduce'
  })
}
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
