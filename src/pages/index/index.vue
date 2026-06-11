<template>
  <view class="home-page">
    <!-- 使用 NavBarBase 组件 -->
    <NavBarBase :nav-back="false" custom-class="home-navbar" :custom-style="{ background: '#667eea' }">
      <template #title>
        <view class="home-navbar-content">
          <image class="navbar-logo" src="/static/logo.png" mode="aspectFit" />
          <text class="navbar-title-single">工具箱</text>
        </view>
      </template>
    </NavBarBase>

    <!-- Nav 区域（不吸顶，随页面滚动） -->
    <!-- <view class="nav-section">
      <view class="search-bar" @click="goToSearch">
        <uni-icons type="search" size="18" color="#999" />
        <text class="search-placeholder">搜索工具...</text>
      </view>
      
      <view class="stats-row-lite">
        <view class="stat-highlight">
          <text class="stat-num">{{ enabledToolsCount }}</text>
          <text class="stat-label">个工具可用</text>
        </view>
        <text class="stat-desc">全部免费 · 本地处理 · 隐私安全</text>
      </view>
    </view> -->

    <!-- 常用工具 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">常用</text>
        <view class="section-actions">
          <text class="section-subtitle">COMMON</text>
          <!-- <view class="manage-placeholder" aria-hidden="true">管理</view> -->
        </view>
      </view>

      <view class="tools-grid popular">
        <view
          v-for="tool in commonTools"
          :key="tool.id"
          :class="['tool-card', 'large', { disabled: tool.disabled }]"
          @click="handleActionClick(tool)">
          <view class="tool-icon-wrapper" :style="{ background: tool.gradient }">
            <uni-icons :type="tool.icon as any" size="32" color="#fff" />
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

    <!-- 分类模块 -->
    <view v-for="category in categories" :key="category.title" class="section">
      <view class="section-header">
        <text class="section-title">{{ category.title }}</text>
        <text class="section-subtitle">{{ category.subtitle }}</text>
      </view>

      <view v-if="category.layout === 'grid'" class="tools-grid">
        <view
          v-for="tool in category.tools"
          :key="tool.id"
          :class="['tool-card', { disabled: tool.disabled }]"
          @click="handleActionClick(tool)">
          <view class="tool-icon-wrapper small" :style="{ background: tool.gradient }">
            <uni-icons :type="tool.icon as any" size="24" color="#fff" />
          </view>
          <text class="tool-name">{{ tool.name }}</text>
          <text class="tool-desc">{{ tool.desc }}</text>
        </view>
      </view>

      <view v-else class="tools-list">
        <view
          v-for="tool in category.tools"
          :key="tool.id"
          :class="['tool-list-item', { disabled: tool.disabled }]"
          @click="handleActionClick(tool)">
          <view class="tool-icon-wrapper mini" :style="{ background: tool.gradient }">
            <uni-icons :type="tool.icon as any" size="20" color="#fff" />
          </view>
          <view class="tool-content">
            <text class="tool-name">{{ tool.name }}</text>
            <text class="tool-desc">{{ tool.desc }}</text>
          </view>
          <view class="tool-status">
            <text v-if="tool.requiresAuth" class="login-badge">需登录</text>
            <text v-else-if="tool.disabled" class="status-dev">开发中</text>
            <uni-icons v-else type="right" size="16" color="#ccc" />
          </view>
        </view>
      </view>
    </view>

    <!-- 底部信息 -->
    <view class="footer">
      <text class="footer-note">数据本地处理 · 保护您的隐私安全</text>
      <text class="icp-text">粤ICP备2025489016号-2</text>
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

  const poolAimTool: Tool = {
    id: 20,
    name: '台球瞄准器',
    desc: '两球定位/直线/一库反弹',
    icon: 'flag',
    gradient: 'linear-gradient(135deg, #147a54 0%, #28b779 100%)',
    link: '/subPackages/tools/pool-aim/index',
    disabled: false,
    badge: 'NEW',
  }

  // 常用工具集合
  const commonTools = ref<(Tool & { usageCount?: number; priority?: number })[]>([
    {
      id: 15,
      name: '视频去水印',
      desc: '粘贴解析/保存/复制直链',
      icon: 'link',
      gradient: 'linear-gradient(135deg, #07c160 0%, #12d28c 100%)',
      link: '/subPackages/tools/watermark/index',
      disabled: false,
      usageCount: 0,
      priority: 1,
    },
    {
      id: 11,
      name: '视频压缩',
      desc: '高效压缩省空间',
      icon: 'videocam',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      link: '/subPackages/tools/video-compress/index',
      disabled: false,
      usageCount: 0,
      priority: 2,
    },
    {
      id: 4,
      name: '图片压缩',
      desc: '高效压缩不失真',
      icon: 'image',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      link: '/subPackages/tools/image-compress/index',
      disabled: false,
      usageCount: 0,
      priority: 3,
    },
    // {
    //   id: 16,
    //   name: '图片加水印',
    //   desc: '文字/贴纸一键叠加',
    //   icon: 'brush',
    //   gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
    //   link: '/subPackages/tools/image-watermark/index',
    //   disabled: false,
    //   usageCount: 0,
    //   priority: 4,
    // },
    // {
    //   id: 10,
    //   name: '万年历',
    //   desc: '黄历查询、择吉日',
    //   icon: 'calendar',
    //   gradient: 'linear-gradient(135deg, #C83C3C 0%, #D4B375 100%)',
    //   link: '/subPackages/tools/calendar/index',
    //   disabled: false,
    //   usageCount: 0,
    //   priority: 6,
    // },
    // {
    //   id: 17,
    //   name: 'Markdown 转 HTML',
    //   desc: '实时预览/复制/下载',
    //   icon: 'document',
    //   gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    //   link: '/subPackages/tools/markdown/index',
    //   disabled: false,
    //   usageCount: 0,
    //   priority: 2,
    // },
    // {
    //   id: 18,
    //   name: '图片格式转换',
    //   desc: 'JPG / PNG / WebP',
    //   icon: 'color-palette',
    //   gradient: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    //   link: '/subPackages/tools/image-format/index',
    //   disabled: false,
    //   usageCount: 0,
    //   priority: 3,
    // },
    {
      id: 19,
      name: '图片加密',
      desc: '多次混淆/还原',
      icon: 'locked',
      gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
      link: '/subPackages/tools/image-cipher/index',
      disabled: false,
      usageCount: 0,
      priority: 2,
    },
    {
      id: 1,
      name: '二维码生成',
      desc: '自定义颜色和 Logo',
      icon: 'scan',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      link: '/subPackages/tools/qr-generator/index',
      disabled: false,
      usageCount: 0,
      priority: 4,
    },
    {
      id: 2,
      name: '二维码解析',
      desc: '扫码识别或图片上传',
      icon: 'camera',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      link: '/subPackages/tools/qr-parser/index',
      disabled: false,
      usageCount: 0,
      priority: 5,
    },
    {
      ...poolAimTool,
      usageCount: 0,
      priority: 6,
    },
  ])

  const textTools = ref<Tool[]>([
    {
      id: 17,
      name: 'Markdown 转 HTML',
      desc: 'Markdown 一键预览/导出',
      icon: 'document',
      gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
      link: '/subPackages/tools/markdown/index',
      disabled: false,
    },
  ])

  // 图片工具
  const imageTools = ref<Tool[]>([
    {
      id: 3,
      name: '图片上传',
      desc: '安全快速传输',
      icon: 'upload',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      link: '/subPackages/tools/oss-upload/index',
      disabled: false,
    },
    {
      id: 12,
      name: '图片拼接',
      desc: '多图合成长图',
      icon: 'images',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      link: '/subPackages/tools/image-stitch/index',
      disabled: false,
    },
    {
      id: 4,
      name: '图片压缩',
      desc: '高效压缩不失真',
      icon: 'image',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      link: '/subPackages/tools/image-compress/index',
      disabled: false,
    },
    {
      id: 18,
      name: '图片格式转换',
      desc: 'JPG / PNG / WebP',
      icon: 'color-palette',
      gradient: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
      link: '/subPackages/tools/image-format/index',
      disabled: false,
    },
    {
      id: 19,
      name: '图片加密',
      desc: '多次混淆/还原',
      icon: 'locked',
      gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
      link: '/subPackages/tools/image-cipher/index',
      disabled: false,
    },
    {
      id: 16,
      name: '图片加水印',
      desc: '文字/贴纸叠加',
      icon: 'brush',
      gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
      link: '/subPackages/tools/image-watermark/index',
      disabled: false,
    },
    {
      id: 11,
      name: '视频压缩',
      desc: '高效压缩省空间',
      icon: 'videocam',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      link: '/subPackages/tools/video-compress/index',
      disabled: false,
    },
    {
      id: 15,
      name: '视频去水印',
      desc: '粘贴解析/保存/复制直链',
      icon: 'link',
      gradient: 'linear-gradient(135deg, #07c160 0%, #12d28c 100%)',
      link: '/subPackages/tools/watermark/index',
      disabled: false,
    },
  ])

  const qrTools = ref<Tool[]>([
    {
      id: 1,
      name: '二维码生成',
      desc: '自定义颜色和 Logo',
      icon: 'scan',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      link: '/subPackages/tools/qr-generator/index',
      disabled: false,
    },
    {
      id: 2,
      name: '二维码解析',
      desc: '扫码识别或图片上传',
      icon: 'camera',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      link: '/subPackages/tools/qr-parser/index',
      disabled: false,
    },
  ])

  const efficiencyTools = ref<(Tool & { requiresAuth?: boolean })[]>([
    {
      id: 10,
      name: '万年历',
      desc: '黄历查询、择吉日',
      icon: 'calendar',
      gradient: 'linear-gradient(135deg, #C83C3C 0%, #D4B375 100%)',
      link: '/subPackages/tools/calendar/index',
      disabled: false,
    },
    {
      id: 13,
      name: '笔记收藏',
      desc: '个人笔记随手记',
      icon: 'chat',
      gradient: 'linear-gradient(135deg, #42b913 0%, #42b983 100%)',
      link: '/subPackages/tools/chat/index',
      disabled: false,
    },
    {
      id: 5,
      name: '备忘录',
      desc: '备忘录管理，支持分类',
      icon: 'compose',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      link: '/subPackages/tools/memo/list',
      disabled: false,
      requiresAuth: true,
    },
    {
      id: 8,
      name: '族谱',
      desc: '实时数据，支持编辑',
      icon: 'personadd',
      gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
      link: '/subPackages/tools/family-tree/index',
      disabled: false,
      requiresAuth: true,
    },
  ])

  const entertainmentTools = ref<Tool[]>([poolAimTool])

  const categories = computed(() => [
    {
      title: '媒体',
      subtitle: 'MEDIA',
      layout: 'grid' as const,
      tools: imageTools.value,
    },
    {
      title: '二维码',
      subtitle: 'QR',
      layout: 'grid' as const,
      tools: qrTools.value,
    },
    {
      title: '记录',
      subtitle: 'RECORD',
      layout: 'list' as const,
      tools: efficiencyTools.value,
    },
    {
      title: '文本',
      subtitle: 'TEXT',
      layout: 'grid' as const,
      tools: textTools.value,
    },
    {
      title: '娱乐',
      subtitle: 'ENTERTAINMENT',
      layout: 'grid' as const,
      tools: entertainmentTools.value,
    },
  ])

  // 计算可用工具数量
  const enabledToolsCount = computed(() => {
    const uniqueMap = new Map<number, Tool>()
    const addList = (list: Tool[]) => {
      list.forEach(tool => {
        if (!tool.disabled) {
          uniqueMap.set(tool.id, tool)
        }
      })
    }

    addList(commonTools.value)
    categories.value.forEach(category => addList(category.tools))

    return uniqueMap.size
  })

  const recordUsage = (_tool: Tool) => {
    // TODO: connect to local storage or backend analytics
  }

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
        duration: 2000,
      })
      return
    }

    recordUsage(tool)

    // 处理外部链接
    if (tool.isWebLink) {
      uni.navigateTo({
        url: `/subPackages/common/webview/h5?path=${encodeURIComponent(tool.link)}&title=${encodeURIComponent(tool.name)}`,
      })
      return
    }

    // 需要登录的服务列表
    const needLoginServices: string[] = ['/subPackages/tools/memo/list']

    if (needLoginServices.includes(tool.link)) {
      // 检查本地登录状态，未登录则拦截并提示
      if (!isUserLoggedIn()) {
        uni.showModal({
          title: '需要登录',
          content: '该功能需要登录后才能使用',
          confirmText: '去登录',
          cancelText: '取消',
          success: (res: UniApp.ShowModalRes) => {
            if (res.confirm) {
              uni.navigateTo({
                url: `/pages/mine/login/login?redirectUrl=${encodeURIComponent(tool.link)}`,
              })
            }
          },
        })
        return
      }
    }

    uni.navigateTo({ url: tool.link })
  }

  // 搜索
  const goToSearch = () => {
    uni.showToast({
      title: '搜索功能开发中',
      icon: 'none',
    })
  }

  // 分享功能
  const { onShareAppMessage, onShareTimeline } = useShare('index', {
    title: '工具箱 - 高效实用的工具集合',
    path: '/pages/index/index',
  })

  defineExpose({
    onShareAppMessage,
    onShareTimeline,
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
      /* box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15); */
    }

    .navbar-title-single {
      font-size: 32rpx;
      font-weight: 700;
      color: #fff;
      letter-spacing: 1rpx;
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
  .stats-row-lite {
    margin-top: 28rpx;
    background: rgba(255, 255, 255, 0.12);
    border-radius: $radius-lg;
    padding: 20rpx 28rpx;
    display: flex;
    flex-direction: column;
    gap: 8rpx;

    .stat-highlight {
      display: flex;
      align-items: baseline;
      gap: 12rpx;

      .stat-num {
        font-size: 40rpx;
        font-weight: 700;
        color: #fff;
      }

      .stat-label {
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.9);
      }
    }

    .stat-desc {
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.8);
    }
  }

  // 通用区块
  .section {
    padding: 32rpx;

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
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
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12rpx;

    .footer-note {
      font-size: 24rpx;
      color: #10b981;
    }

    .icp-text {
      font-size: 22rpx;
      color: $text-hint;
    }
  }

  .login-badge {
    color: #999;
    font-size: 22rpx;
  }
</style>
