<template>
  <view class="memo-detail-page" :style="pageStyle">
    <!-- 背景图层 -->
    <view v-if="backgroundLayerStyle" class="background-layer" :style="backgroundLayerStyle"></view>
    
    <nav-bar 
      always-title
      :title="memoTitle"
      custom-class="light"
      :custom-style="{ backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }"
    />

    <view class="nav-actions" v-if="!settings.hideNavActions">
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
    <view v-if="!settings.hideNavActions && !loading && !isLoggedIn" class="login-tip">
      <text class="tip-text">👀 您正在以访客模式查看</text>
      <button class="login-btn" @click="goToLogin">登录后可编辑</button>
    </view>

    <!-- 备忘录内容（预览模式） - 作为海报导出区域 -->
    <view v-if="!loading && memoData" id="poster-wrapper" class="memo-content" :class="{ 'is-ready': isRendered }" :style="memoBodyStyle">
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
      <view class="content-blocks" :style="textStyle">
        <view 
          v-for="(block, blockIndex) in parsedContent" 
          :key="blockIndex"
          :id="'L' + (blockIndex + 1)"
          class="content-block"
        >
          <!-- 锚点标签显示 -->
          <!-- <text class="anchor-tag">#L{{ blockIndex + 1 }}</text> -->
          <!-- 文本块 -->
          <view 
            v-if="block.type === 'text'" 
            class="text-block" 
            :class="{ 'is-markdown': block.isMarkdown }"
            :style="getBlockStyle(block.style)"
          >
            <view 
              v-for="(item, itemIndex) in block.children" 
              :key="itemIndex"
              class="text-item"
              :class="{ 'has-link': item.linkInfo }"
              @click="item.linkInfo ? handleTextLinkClick(item.linkInfo) : null"
            >
              <text v-if="item.linkInfo" class="link-indicator">
                {{ item.linkInfo.linkType === 'navigation' ? '📍' : (item.linkInfo.linkType === 'internal' ? '📄' : '🔗') }}
              </text>
              <!-- Markdown 模式 -->
              <view 
                v-if="block.isMarkdown"
                class="markdown-body" 
                :class="{ 'link-text': item.linkInfo, 'glass-mode': hasCustomBackground }"
                :style="getTextStyleWithVars(item.style)"
                @click="handleMarkdownClick"
              >
                <!-- #ifdef H5 -->
                <rich-text 
                  :nodes="renderMarkdown(item.value, item.style, undefined, false)" 
                  @click="handleMarkdownClick"
                  :user-select="true"
                  :selectable="true"
                ></rich-text>
                <!-- #endif -->
                <!-- #ifdef MP-WEIXIN -->
                <rich-text 
                  :nodes="renderMarkdown(item.value, item.style, undefined, false)" 
                  @tap="handleMarkdownClick" 
                  @touchend="handleMarkdownClick"
                  :data-text="item.value"
                  :user-select="true"
                  :selectable="true"
                ></rich-text>
                <!-- #endif -->
                <!-- #ifndef H5 -->
                <!-- #ifndef MP-WEIXIN -->
                <rich-text 
                  :nodes="renderMarkdown(item.value, item.style, undefined, false)" 
                  @click="handleMarkdownClick"
                  :user-select="true"
                  :selectable="true"
                ></rich-text>
                <!-- #endif -->
                <!-- #endif -->
              </view>
              <!-- 普通文本模式 -->
              <text 
                v-else
                class="text-preview" 
                :class="{ 'link-text': item.linkInfo }"
                :style="getTextStyle(item.style)"
              >{{ item.value || '' }}</text>
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

          <!-- 路径块 - 垂直时间轴 -->
          <view v-if="block.type === 'route'" class="route-container" :style="getBlockStyle(block.style)">
            <view 
              v-for="(node, nodeIndex) in block.content" 
              :key="nodeIndex"
              class="route-node"
              :class="{ 
                'is-start': nodeIndex === 0,
                'is-end': node.isEnd,
                'is-transfer': node.type === 'transfer'
              }"
            >
              <!-- 左侧轴线 -->
              <view class="route-axis">
                <!-- 圆点/徽章 -->
                <view 
                  class="route-dot" 
                  :class="{ 
                    'dot-large': nodeIndex === 0 || node.isEnd,
                    'dot-badge': node.type === 'transfer' && !node.isEnd
                  }"
                ></view>
                <!-- 连线（非终点显示） -->
                <view 
                  v-if="!node.isEnd" 
                  class="route-line"
                  :class="{ 
                    'line-pipe': node.type === 'transfer',
                    'line-dashed': node.type !== 'transfer'
                  }"
                ></view>
              </view>

              <!-- 右侧内容 -->
              <view class="route-content">
                <!-- 站点名称 -->
                <text class="route-name">{{ node.name || '未命名站点' }}</text>
                
                <!-- 信息胶囊（非终点显示） -->
                <view v-if="!node.isEnd && (node.time || node.icon)" class="route-info-tag">
                  <text v-if="node.time" class="tag-time">🕒 {{ node.time }}</text>
                  <text v-if="node.time && node.icon" class="tag-divider">·</text>
                  <text v-if="node.icon" class="tag-icon">{{ node.icon }}</text>
                </view>
                
                <!-- 描述（非终点显示） -->
                <text v-if="!node.isEnd && node.desc" class="route-desc">{{ node.desc }}</text>
              </view>
            </view>
          </view>

          <!-- 附件块 -->
          <view v-if="block.type === 'attachment'" class="attachment-container" :style="getBlockStyle(block.style)">
            <view 
              v-for="(item, itemIndex) in block.children" 
              :key="itemIndex"
              class="attachment-capsule"
              :class="{ 'is-tencent-doc': isTencentDocUrl(item.url) }"
              hover-class="capsule-hover"
              :hover-stay-time="100"
              @click="openAttachment(item)"
            >
              <view class="capsule-icon" :class="{ 'tencent-icon': isTencentDocUrl(item.url) }">📄</view>
              <view class="capsule-content">
                <text class="capsule-title">{{ item.title || '未命名附件' }}</text>
                <text class="capsule-hint">{{ isTencentDocUrl(item.url) ? '点击打开腾讯文档' : '点击查看文档' }}</text>
              </view>
              <view class="capsule-arrow">›</view>
            </view>
          </view>

        </view>
      </view>
      
      <!-- 水印 -->
      <view v-if="settings.features.showWatermark" class="watermark">
        <text class="watermark-text">Powered by Memo</text>
      </view>
    </view>

    <!-- 全局文档关联底部栏 -->
    <view 
      v-if="settings.globalAttachment.enabled && settings.globalAttachment.url" 
      class="global-attachment-bar"
      @click="openGlobalAttachment"
    >
      <view class="bar-content">
        <text class="bar-icon">📄</text>
        <text class="bar-title">{{ settings.globalAttachment.title || '查看原始文档' }}</text>
      </view>
      <text class="bar-arrow">›</text>
    </view>

    <!-- 错误提示 -->
    <view v-if="!loading && error" class="error-container">
      <text class="error-text">{{ error }}</text>
      <button class="retry-btn" @click="loadMemoData">重试</button>
    </view>

    <!-- 回到顶部按钮 -->
    <view 
      class="back-to-top-btn" 
      v-if="showBackToTopBtn" 
      @click="backToTop"
    >
      <!-- <text class="back-to-top-icon">↑</text> -->
      <text class="icon">↑</text>
      <text class="btn-text">顶部</text>
    </view>
    
  </view>
</template>

<script setup lang="ts">
import { postPainterGenerateInfo } from '@/services/apifox/NODEJSDEMO/PAINTER/apifox'

import { ref, reactive, computed, nextTick, getCurrentInstance } from 'vue'
import { marked } from 'marked'
import { onLoad, onPageScroll, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import NavBar from '@/components/nav-bar.vue'
import { getToken } from '@/utils/storage'
import { getMemosPublicDetail, getMemosMemoIdPublic } from '@/services/apifox/NODEJSDEMO/MEMOS/apifox'
import { openMapNavigation, openExternalLink } from '@/utils/map'

// 获取组件实例用于 uni.createSelectorQuery()
const instance = getCurrentInstance()

const memoId = ref<string>('')
const memoData = ref<any>(null)
const loading = ref(true)
const error = ref('')

// 设置（从 memoData 中读取）
const settings = reactive({
  padding: { top: 32, bottom: 32, left: 32, right: 32 },
  border: { top: 0, bottom: 0, left: 0, right: 0, color: '#eeeeee' },
  appearance: {
    backgroundColor: '#ffffff',
    backgroundImage: '',
    backgroundBlur: 0,
    backgroundOpacity: 1
  },
  typography: {
    fontSize: 'standard' as 'standard' | 'medium' | 'large',
    lineHeight: 1.6
  },
  layout: {
    contentWidth: 'full' as 'full' | 'narrow'
  },
  features: {
    showWatermark: false,
    enableComments: false
  },
  showBackToTop: true,
  hideNavActions: false,
  globalAttachment: {
    enabled: false,
    url: '',
    title: '查看原始文档'
  }
})

// 滚动状态 - 用于回到顶部按钮
const scrollTop = ref(0)
const showBackToTopBtn = computed(() => settings.showBackToTop && scrollTop.value > 400)

// 字号映射
const fontSizeMap: Record<string, string> = {
  standard: '28rpx',
  medium: '32rpx',
  large: '36rpx'
}

// 页面整体样式 - 背景颜色
const pageStyle = computed(() => {
  return {
    backgroundColor: settings.appearance.backgroundColor
  }
})

// 背景图层样式
const backgroundLayerStyle = computed(() => {
  if (!settings.appearance.backgroundImage) return null
  return {
    backgroundImage: 'url(' + settings.appearance.backgroundImage + ')',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: 'blur(' + settings.appearance.backgroundBlur + 'px)',
    opacity: settings.appearance.backgroundOpacity
  }
})

// 是否存在自定义背景（用于开启毛玻璃模式）
const hasCustomBackground = computed(() => {
  // 有全局背景图 OR 有容器背景色/背景图时，开启透视模式
  return !!backgroundLayerStyle.value || 
         !!(memoData.value && memoData.value.containerStyle) ||
         !!(settings.appearance.backgroundColor && settings.appearance.backgroundColor !== '#ffffff')
})

// 文本全局样式
const textStyle = computed(() => {
  return {
    fontSize: fontSizeMap[settings.typography.fontSize] || '28rpx',
    lineHeight: String(settings.typography.lineHeight)
  }
})

// 动态内容样式 - 根据 settings 计算
const contentStyle = computed(() => {
  const style: Record<string, string> = {
    paddingTop: settings.padding.top + 'rpx',
    paddingBottom: settings.padding.bottom + 'rpx',
    paddingLeft: settings.padding.left + 'rpx',
    paddingRight: settings.padding.right + 'rpx'
  }
  
  if (settings.border.top > 0) {
    style.borderTop = settings.border.top + 'rpx solid ' + settings.border.color
  }
  if (settings.border.bottom > 0) {
    style.borderBottom = settings.border.bottom + 'rpx solid ' + settings.border.color
  }
  if (settings.border.left > 0) {
    style.borderLeft = settings.border.left + 'rpx solid ' + settings.border.color
  }
  if (settings.border.right > 0) {
    style.borderRight = settings.border.right + 'rpx solid ' + settings.border.color
  }
  
  // 居中窄屏模式
  if (settings.layout.contentWidth === 'narrow') {
    style.maxWidth = '1200rpx'
    style.marginLeft = 'auto'
    style.marginRight = 'auto'
  }
  
  return style
})

// 统一的备忘录主体样式 - 合并 padding, border, backgroundColor
const memoBodyStyle = computed(() => {
  const style: Record<string, string> = {
    backgroundColor: settings.appearance.backgroundColor,
    paddingTop: settings.padding.top + 'rpx',
    paddingBottom: settings.padding.bottom + 'rpx',
    paddingLeft: settings.padding.left + 'rpx',
    paddingRight: settings.padding.right + 'rpx'
  }
  
  // 边框样式
  if (settings.border.top > 0) {
    style.borderTop = settings.border.top + 'rpx solid ' + settings.border.color
  }
  if (settings.border.bottom > 0) {
    style.borderBottom = settings.border.bottom + 'rpx solid ' + settings.border.color
  }
  if (settings.border.left > 0) {
    style.borderLeft = settings.border.left + 'rpx solid ' + settings.border.color
  }
  if (settings.border.right > 0) {
    style.borderRight = settings.border.right + 'rpx solid ' + settings.border.color
  }
  
  // 居中窄屏模式
  if (settings.layout.contentWidth === 'narrow') {
    style.maxWidth = '1200rpx'
    style.marginLeft = 'auto'
    style.marginRight = 'auto'
  }
  
  return style
})

// 渲染完成状态锁 - 用于确保截图时 Markdown 已完全渲染
const isRendered = ref(false)

// 配置 marked 选项 - 回退到基础 Markdown 解析模式（消除 JS 报错）
marked.setOptions({
  breaks: true,
  gfm: true
  // 移除 html: true 和 sanitize: false 以确保渲染器稳定
})

// 判断是否为 H5 环境
const isH5 = () => {
  // #ifdef H5
  return true
  // #endif
  // #ifndef H5
  return false
  // #endif
}

// Markdown 渲染方法 - 强力内联样式注入（绕过 WXSS 编译）
const renderMarkdown = (content: string, blockStyle?: any, anchorId?: string, isForExport?: boolean): string => {
  if (!content) return ''
  
  try {
    // 1. 处理占位符 [w数字] 转换为 &nbsp;
    let html = marked.parse(content.replace(/\[w(\d+)\]/g, (m, w) => {
      const width = parseInt(w)
      return isNaN(width) ? '' : '&nbsp;'.repeat(Math.max(1, Math.floor(width / 12)))
    })) as string

    // 2. 准备内联样式变量
    const color = blockStyle?.color || '#333'
    const fontSize = blockStyle?.fontSize ? blockStyle.fontSize + 'rpx' : '28rpx'
    const fontWeight = blockStyle?.bold ? 'bold' : 'normal'
    const fontStyle = blockStyle?.italic ? 'italic' : 'normal'
    const textDecoration = blockStyle?.underline ? 'underline' : (blockStyle?.lineThrough ? 'line-through' : 'none')
    const cellStyle = `border:1px solid #e0e0e0;padding:12rpx;color:${color};font-size:${fontSize};`

    let thStyle = `${cellStyle}font-weight:bold;`
    if (hasCustomBackground.value) {
      thStyle += `background-color: transparent;`
    } else {
      thStyle += `background-color:#f8f9fa;`
    }

    // 3. 强力内联注入 (绕过 WXSS 编译) - 使用边界匹配避免误伤
    // 注意：背景色由 CSS 控制（通过 glass-mode class），这里只注入结构样式
    html = html
      .replace(/<table(?=\s|>)/gi, '<div style="overflow-x:auto;margin:20rpx 0;"><table style="width:100%;border-collapse:collapse;"')
      .replace(/<\/table>/gi, '</table></div>')
      .replace(/<th(?=\s|>)/gi, `<th style="${thStyle}"`)
      .replace(/<td(?=\s|>)/gi, `<td style="${cellStyle}"`)
      .replace(/<(p|li|span)(?=\s|>)/gi, `<$1 style="color:${color};font-size:${fontSize};font-weight:${fontWeight};font-style:${fontStyle};text-decoration:${textDecoration};line-height:1.6;"`)
      .replace(/<(h[1-6])(?=\s|>)/gi, `<$1 style="color:${color};font-size:${fontSize};font-weight:bold;margin:16rpx 0;"`)
      .replace(/<(strong|b)(?=\s|>)/gi, `<$1 style="color:${color};font-size:${fontSize};font-weight:bold;"`)
      .replace(/<(em|i)(?=\s|>)/gi, `<$1 style="color:${color};font-size:${fontSize};font-style:italic;"`)
      .replace(/<code(?=\s|>)/gi, `<code style="color:${color};font-size:${fontSize};padding:2rpx 6rpx;border-radius:4rpx;font-family:monospace;"`)
      .replace(/<pre(?=\s|>)/gi, `<pre style="color:${color};font-size:${fontSize};padding:16rpx;border-radius:8rpx;overflow-x:auto;"`)
      .replace(/<blockquote(?=\s|>)/gi, `<blockquote style="border-left:4rpx solid #667eea;margin:0;padding:0 16rpx;color:${color};font-size:${fontSize};"`)
      .replace(/<a(?=\s|>)/gi, `<a style="color:#007bff;text-decoration:underline;font-size:${fontSize};"`)
    
    // 调试补丁：检查生成的 HTML 是否异常
    if (!html || html.trim().length === 0) {
      console.warn('renderMarkdown 返回空 HTML:', { content, blockStyle })
    }
    if (html.includes('<th') && html.includes('ead>')) {
      console.error('HTML 存在无效标签（正则误伤）:', html)
    }
    if (html.includes('<') && !html.includes('>')) {
      console.error('HTML 标签不闭合:', html)
    }
    
    // 渲染同步延迟锁
    setTimeout(() => {
      isRendered.value = true
    }, 500)
    
    return html
  } catch (e) {
    console.error('Markdown 解析失败:', e)
    return content
  }
}

// 滚动到指定锚点（兼容H5和微信小程序，优化版本）
const scrollToAnchor = (anchorId: string) => {
  if (!anchorId) return
  
  console.log('scrollToAnchor called with:', anchorId)
  
  // 使用 nextTick 确保 DOM 元素已渲染
  nextTick(() => {
    // 等待一小段时间确保元素完全渲染
    setTimeout(() => {
      const query = uni.createSelectorQuery().in(instance.proxy)
      query.select(`#${anchorId}`).boundingClientRect(data => {
        console.log('Anchor element data:', data)
        if (data) {
          let targetScrollTop = 0
          
          // 平台特定的滚动位置计算
          // #ifdef H5
          // H5环境：需要考虑已滚动的偏移量
          const currentScrollTop = window?.pageYOffset || document.documentElement.scrollTop || 0
          targetScrollTop = data.top + currentScrollTop - 80 // H5减去60px顶栏间距
          console.log('H5 scrolling - current:', currentScrollTop, 'element top:', data.top, 'target:', targetScrollTop)
          // #endif
          
          // #ifdef MP-WEIXIN
          // 微信小程序环境：直接使用元素的top值
          targetScrollTop = data.top - 70 // 微信小程序减去50px顶栏间距
          console.log('WeChat scrolling - element top:', data.top, 'target:', targetScrollTop)
          // #endif
          
          // #ifndef H5
          // #ifndef MP-WEIXIN
          // 其他平台（如其他小程序）
          targetScrollTop = data.top - 70
          console.log('Other platform scrolling - element top:', data.top, 'target:', targetScrollTop)
          // #endif
          // #endif
          
          uni.pageScrollTo({
            scrollTop: Math.max(0, targetScrollTop),
            duration: 300,
            success: () => {
              console.log('Scroll to anchor successful')
            },
            fail: (err) => {
              console.error('Scroll to anchor failed:', err)
            }
          })
        } else {
          console.warn('Anchor element not found:', anchorId)
          uni.showToast({
            title: '未找到目标位置',
            icon: 'none',
            duration: 2000
          })
        }
      }).exec()
    }, 100) // 等待100ms确保元素完全渲染
  })
}

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
      // 加载设置
      if (res.settings) {
        if (res.settings.padding) {
          settings.padding.top = res.settings.padding.top ?? 32
          settings.padding.bottom = res.settings.padding.bottom ?? 32
          settings.padding.left = res.settings.padding.left ?? 32
          settings.padding.right = res.settings.padding.right ?? 32
        }
        if (res.settings.border) {
          settings.border.top = res.settings.border.top ?? 0
          settings.border.bottom = res.settings.border.bottom ?? 0
          settings.border.left = res.settings.border.left ?? 0
          settings.border.right = res.settings.border.right ?? 0
          settings.border.color = res.settings.border.color || '#eeeeee'
        }
        if (res.settings.appearance) {
          settings.appearance.backgroundColor = res.settings.appearance.backgroundColor || '#ffffff'
          settings.appearance.backgroundImage = res.settings.appearance.backgroundImage || ''
          settings.appearance.backgroundBlur = res.settings.appearance.backgroundBlur ?? 0
          settings.appearance.backgroundOpacity = res.settings.appearance.backgroundOpacity ?? 1
        }
        if (res.settings.typography) {
          settings.typography.fontSize = res.settings.typography.fontSize || 'standard'
          settings.typography.lineHeight = res.settings.typography.lineHeight ?? 1.6
        }
        if (res.settings.layout) {
          settings.layout.contentWidth = res.settings.layout.contentWidth || 'full'
        }
        if (res.settings.features) {
          settings.features.showWatermark = res.settings.features.showWatermark === true
          settings.features.enableComments = res.settings.features.enableComments === true
        }
        settings.showBackToTop = res.settings.showBackToTop !== false
        settings.hideNavActions = res.settings.hideNavActions === true
      }
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

// 获取块边框样式 - 支持新版块级样式系统
const getBlockStyle = (style: any) => {
  if (!style) return {}
  const result: Record<string, string> = {}
  
  // 新版块级样式优先
  if (style.padding) {
    result.paddingTop = (style.padding.top || 0) + 'rpx'
    result.paddingBottom = (style.padding.bottom || 0) + 'rpx'
    result.paddingLeft = (style.padding.left || 0) + 'rpx'
    result.paddingRight = (style.padding.right || 0) + 'rpx'
  }
  
  // 新版边框样式
  if (style.border) {
    if (style.border.top && style.border.top.width) {
      result.borderTop = style.border.top.width + 'rpx solid ' + (style.border.top.color || '#eeeeee')
    }
    if (style.border.bottom && style.border.bottom.width) {
      result.borderBottom = style.border.bottom.width + 'rpx solid ' + (style.border.bottom.color || '#eeeeee')
    }
    if (style.border.left && style.border.left.width) {
      result.borderLeft = style.border.left.width + 'rpx solid ' + (style.border.left.color || '#eeeeee')
    }
    if (style.border.right && style.border.right.width) {
      result.borderRight = style.border.right.width + 'rpx solid ' + (style.border.right.color || '#eeeeee')
    }
  } else {
    // 旧版简单边框开关（向后兼容）
    if (style.borderTop) result.borderTop = '2rpx solid #333'
    if (style.borderBottom) result.borderBottom = '2rpx solid #333'
    if (style.borderLeft) result.borderLeft = '2rpx solid #333'
    if (style.borderRight) result.borderRight = '2rpx solid #333'
    
    // 旧版有边框时默认 padding
    if (!style.padding && (style.borderTop || style.borderBottom || style.borderLeft || style.borderRight)) {
      result.padding = '16rpx'
    }
  }
  
  // 背景色
  if (style.backgroundColor) {
    result.backgroundColor = style.backgroundColor
  }
  
  // 圆角
  if (style.borderRadius) {
    result.borderRadius = style.borderRadius + 'rpx'
  }
  
  // 文本对齐
  if (style.textAlign) {
    result.textAlign = style.textAlign
  }
  
  return result
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

// 获取文本样式（带 CSS 变量，用于 Markdown 模式）
const getTextStyleWithVars = (style: any) => {
  if (!style) return {}
  return {
    '--memo-fs': (style.fontSize || 16) + 'px',
    '--memo-color': style.color || '#333',
    '--memo-fw': style.bold ? 'bold' : 'normal',
    '--memo-fs-italic': style.italic ? 'italic' : 'normal',
    '--memo-text-decoration': style.underline ? 'underline' : (style.lineThrough ? 'line-through' : 'none')
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

// 获取链接样式
const getLinkStyle = (style: any) => {
  if (!style) return {}
  return {
    fontSize: (style.fontSize || 16) + 'px',
    color: style.color || '#1890ff',
    fontWeight: style.bold ? 'bold' : 'normal'
  }
}

// 处理链接点击（通用）
const handleLinkClick = (linkInfo: any) => {
  if (!linkInfo) return
  
  // 检查是否是锚点跳转链接
  if (linkInfo.url && linkInfo.url.startsWith('memo://scroll?id=')) {
    const anchorId = linkInfo.url.replace('memo://scroll?id=', '')
    scrollToAnchor(anchorId)
    return
  }
  
  if (linkInfo.linkType === 'navigation') {
    // 导航类型
    if (linkInfo.latitude && linkInfo.longitude) {
      // #ifdef H5
      // H5 环境下打开地图网页
      const mapUrl = `https://uri.amap.com/marker?position=${linkInfo.longitude},${linkInfo.latitude}&name=${encodeURIComponent(linkInfo.address || linkInfo.label || '目的地')}`
      window.open(mapUrl, '_blank')
      // #endif
      // #ifndef H5
      openMapNavigation(
        Number(linkInfo.latitude),
        Number(linkInfo.longitude),
        linkInfo.address || linkInfo.label || '目的地',
        linkInfo.address
      )
      // #endif
    } else {
      uni.showToast({
        title: '缺少经纬度信息',
        icon: 'none'
      })
    }
  } else if (linkInfo.linkType === 'internal') {
    // 内部链接类型
    if (linkInfo.internalPath) {
      // #ifdef H5
      // H5 环境下使用 router 或直接跳转
      const basePath = window.location.origin
      window.location.href = `${basePath}${linkInfo.internalPath}`
      // #endif
      // #ifndef H5
      uni.navigateTo({
        url: linkInfo.internalPath
      })
      // #endif
    } else {
      uni.showToast({
        title: '内部链接无效',
        icon: 'none'
      })
    }
  } else if (linkInfo.linkType === 'anchor') {
    // 锚点链接类型
    if (linkInfo.anchorId) {
      scrollToAnchor(linkInfo.anchorId)
    } else {
      uni.showToast({
        title: '锚点ID为空',
        icon: 'none'
      })
    }
  } else {
    // 超链接类型
    if (linkInfo.url) {
      // #ifdef H5
      // H5 环境下使用 window.open 打开外部链接
      // 检测是否在微信浏览器中
      const isWechat = /MicroMessenger/i.test(navigator.userAgent)
      if (isWechat) {
        // 微信内 H5 无法直接打开外部链接，提示用户
        uni.showModal({
          title: '提示',
          content: '请点击右上角菜单，选择"在浏览器中打开"后访问链接',
          showCancel: false
        })
      } else {
        window.open(linkInfo.url, '_blank')
      }
      // #endif
      // #ifndef H5
      openExternalLink(linkInfo.url)
      // #endif
    } else {
      uni.showToast({
        title: '链接地址为空',
        icon: 'none'
      })
    }
  }
}

// 腾讯文档小程序 AppID（官方正确 AppID）
var TENCENT_DOC_APPID = 'wxd44b036e1369325'

// 解析结果类型
interface TencentDocParseResult {
  type: 'shortLink' | 'url' | 'unknown'
  isTencentDoc: boolean
  isTencent: boolean
  url: string
  cleanUrl: string
}

// 解析腾讯文档 URL，清洗并识别（支持 HTTPS 和小程序 Scheme 格式）
var parseTencentDocUrl = function(url: string): TencentDocParseResult {
  if (!url) {
    return { type: 'unknown', isTencentDoc: false, isTencent: false, url: '', cleanUrl: '' }
  }
  
  // 先 trim 去除首尾空格
  var trimmedUrl = url.trim()
  
  // 检查是否为小程序 Scheme 格式：#小程序://腾讯文档/xxx
  // 使用微信原生 shortLink 属性跳转
  if (trimmedUrl.indexOf('#小程序://') === 0) {
    return {
      type: 'shortLink',
      isTencentDoc: true,
      isTencent: true,
      url: trimmedUrl,
      cleanUrl: trimmedUrl
    }
  }
  
  // 检查是否为 HTTPS 腾讯文档链接
  var isTencentDoc = trimmedUrl.indexOf('docs.qq.com') !== -1 || trimmedUrl.indexOf('doc.weixin.qq.com') !== -1
  
  // 清洗 URL：去除 ? 后的所有查询参数
  var cleanUrl = trimmedUrl.split('?')[0]
  
  // 去除 # 后的锚点
  cleanUrl = cleanUrl.split('#')[0]
  
  // 去除末尾斜杠
  while (cleanUrl.length > 0 && cleanUrl.charAt(cleanUrl.length - 1) === '/') {
    cleanUrl = cleanUrl.slice(0, -1)
  }
  
  // 强制使用 https 协议
  if (cleanUrl.indexOf('http://') === 0) {
    cleanUrl = 'https://' + cleanUrl.slice(7)
  }
  
  // 确保有 https 前缀
  if (cleanUrl.indexOf('https://') !== 0 && cleanUrl.indexOf('docs.qq.com') === 0) {
    cleanUrl = 'https://' + cleanUrl
  }
  
  return { 
    type: isTencentDoc ? 'url' : 'unknown', 
    isTencentDoc: isTencentDoc,
    isTencent: isTencentDoc,
    url: trimmedUrl, 
    cleanUrl: cleanUrl 
  }
}

// 判断是否为腾讯文档链接（用于模板中显示图标）
var isTencentDocUrl = function(url: string): boolean {
  if (!url) return false
  var trimmedUrl = url.trim()
  // 支持 HTTPS 链接和小程序 Scheme 格式
  return trimmedUrl.indexOf('docs.qq.com') !== -1 || 
         trimmedUrl.indexOf('doc.weixin.qq.com') !== -1 ||
         trimmedUrl.indexOf('#小程序://') === 0
}

// 跳转失败处理函数
var handleJumpFail = function(originalUrl: string, err: any) {
  console.error('[handleJumpFail] 跳转小程序失败:', err)
  // 弹窗提示并提供复制功能
  uni.showModal({
    title: '跳转受限',
    content: '由于系统限制，无法直接打开文档。是否复制链接后手动打开？',
    confirmText: '复制链接',
    cancelText: '取消',
    success: function(res) {
      if (res.confirm) {
        uni.setClipboardData({
          data: originalUrl,
          success: function() {
            uni.showToast({ title: '链接已复制', icon: 'success' })
          }
        })
      }
    }
  })
}

// 打开附件（跳转腾讯文档小程序）
// 注意：此方法必须由 @click 直接调用，中间不能有异步操作
var openAttachment = function(item: any) {
  if (!item || !item.url) {
    uni.showToast({ title: '附件链接为空', icon: 'none' })
    return
  }
  
  var originalUrl = item.url.trim()
  var parsed = parseTencentDocUrl(originalUrl)
  
  console.log('[openAttachment] 原始URL:', originalUrl)
  console.log('[openAttachment] 解析结果:', parsed)
  
  // #ifdef MP-WEIXIN
  if (parsed.type === 'shortLink') {
    // 显示加载状态
    uni.showLoading({ title: '正在打开文档', mask: true })
    // 小程序 Scheme 格式：使用微信原生 shortLink 属性
    console.log('[openAttachment] 使用 shortLink 模式跳转')
    uni.navigateToMiniProgram({
      appId: TENCENT_DOC_APPID,
      shortLink: parsed.url,
      complete: function() {
        uni.hideLoading()
      },
      fail: function(err) {
        handleJumpFail(originalUrl, err)
      }
    })
  } else if (parsed.type === 'url' && parsed.isTencentDoc) {
    // 显示加载状态
    uni.showLoading({ title: '正在打开文档', mask: true })
    // HTTPS 链接格式：使用 path + url 参数跳转
    var jumpPath = 'pages/tabs/index/index?url=' + encodeURIComponent(parsed.cleanUrl)
    console.log('[openAttachment] 使用 path 模式跳转:', jumpPath)
    uni.navigateToMiniProgram({
      appId: TENCENT_DOC_APPID,
      path: jumpPath,
      complete: function() {
        uni.hideLoading()
      },
      fail: function(err) {
        handleJumpFail(originalUrl, err)
      }
    })
  } else {
    // 非腾讯文档：复制链接
    uni.setClipboardData({
      data: originalUrl,
      success: function() {
        uni.showToast({ title: '链接已复制，请在浏览器打开', icon: 'none' })
      }
    })
  }
  // #endif
  
  // #ifdef H5
  window.open(originalUrl, '_blank')
  // #endif
  
  // #ifndef MP-WEIXIN
  // #ifndef H5
  // 其他平台复制链接
  uni.setClipboardData({
    data: originalUrl,
    success: function() {
      uni.showToast({ title: '链接已复制，请在浏览器中打开', icon: 'none' })
    }
  })
  // #endif
  // #endif
}

// 打开全局关联文档
const openGlobalAttachment = () => {
  const url = settings.globalAttachment.url
  if (!url) {
    uni.showToast({ title: '文档链接为空', icon: 'none' })
    return
  }
  
  openAttachment({
    url: url,
    appId: TENCENT_DOC_APPID,
    title: settings.globalAttachment.title
  })
}

// 检查文本中是否包含锚点链接
const extractAnchorFromText = (text: string): string | null => {
  // 匹配 Markdown 格式的锚点链接 [text](#anchor-id)
  const markdownMatch = text.match(/\[([^\]]+)\]\(#([^)]+)\)/)
  if (markdownMatch) {
    return markdownMatch[2] // 返回 anchor-id
  }
  
  // 匹配 memo://scroll?id=xxx 格式
  const memoMatch = text.match(/memo:\/\/scroll\?id=([^\s"'<>]+)/)
  if (memoMatch) {
    return memoMatch[1]
  }
  
  return null
}

// 处理 Markdown 内容中的链接点击（兼容H5和微信小程序）
const handleMarkdownClick = (event: any) => {
  console.log('handleMarkdownClick triggered:', event)
  
  // Try to get link information from different platforms
  let href = ''
  let anchorId = ''
  
  // #ifdef H5
  if (event.target && event.target.tagName === 'A') {
    href = event.target.href || ''
    anchorId = event.target.getAttribute('data-anchor') || ''
    
    // Task 4: Intercept anchor links in Markdown [text](#anchor-id)
    if (href.includes('#') && !href.includes('://')) {
      const hashIndex = href.lastIndexOf('#')
      if (hashIndex > -1) {
        anchorId = href.substring(hashIndex + 1)
        console.log('H5 - extracted anchor from hash:', anchorId)
      }
    }
    
    // Check for memo://scroll format
    if (href && href.startsWith('memo://scroll?id=') && anchorId) {
      event.preventDefault()
      event.stopPropagation()
      scrollToAnchor(anchorId)
      return false
    }
    
    // Task 4: Handle #L{number} format links (sequential anchors)
    if (anchorId && anchorId.match(/^L\d+$/i)) {
      event.preventDefault()
      event.stopPropagation()
      scrollToAnchor(anchorId)
      return false
    }
    
    console.log('H5 - href:', href, 'anchorId:', anchorId)
  }
  // #endif
  
  // #ifdef MP-WEIXIN
  // WeChat Mini Program environment: Get from event.detail
  if (event.detail && event.detail.href) {
    href = event.detail.href
    
    // Task 4: Intercept anchor links in Markdown
    if (href.includes('#') && !href.includes('://')) {
      const hashIndex = href.lastIndexOf('#')
      if (hashIndex > -1) {
        anchorId = href.substring(hashIndex + 1)
        console.log('WeChat - extracted anchor from hash:', anchorId)
      }
    }
    
    // Extract anchor ID from memo://scroll format
    const anchorMatch = href.match(/memo:\/\/scroll\?id=([^&]+)/)
    if (anchorMatch) {
      anchorId = anchorMatch[1]
    }
    
    console.log('WeChat - href:', href, 'anchorId:', anchorId)
  }
  // #endif
  
  // Other platform compatibility handling
  // #ifndef H5
  // #ifndef MP-WEIXIN
  if (event.detail && event.detail.href) {
    href = event.detail.href
    
    // Intercept anchor links
    if (href.includes('#') && !href.includes('://')) {
      const hashIndex = href.lastIndexOf('#')
      if (hashIndex > -1) {
        anchorId = href.substring(hashIndex + 1)
        console.log('Other platform - extracted anchor from hash:', anchorId)
      }
    }
    
    const anchorMatch = href.match(/memo:\/\/scroll\?id=([^&]+)/)
    if (anchorMatch) {
      anchorId = anchorMatch[1]
    }
    console.log('Other platform - href:', href, 'anchorId:', anchorId)
  }
  // #endif
  // #endif
  
  // Task 4: Handle anchor jump (directly trigger scrollToAnchor instead of navigating URL)
  if (anchorId) {
    console.log('Processing anchor jump to:', anchorId)
    event.preventDefault && event.preventDefault()
    event.stopPropagation && event.stopPropagation()
    
    // Try to find element directly by ID
    scrollToAnchor(anchorId)
    return
  }
  
  // Handle other types of links
  if (href) {
    console.log('Processing other link:', href)
    handleLinkClick({ linkType: 'url', url: href })
  }
  
  console.log('No anchor link found in click event')
}

// 处理文本项链接点击（复用handleLinkClick）
const handleTextLinkClick = handleLinkClick

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

// 监听页面滚动
onPageScroll((e: { scrollTop: number }) => {
  scrollTop.value = e.scrollTop
})

// 回到顶部
const backToTop = () => {
  uni.pageScrollTo({
    scrollTop: 0,
    duration: 300
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
  // 使用uni.showToast调试，因为console.log在生产环境可能被移除
  // uni.showToast({ title: '导出函数被调用', icon: 'none', duration: 1000 })
  
  console.log('exportImage被调用, exportLoading:', exportLoading.value)
  
  if (exportLoading.value) {
    console.log('exportLoading为true，直接返回')
    uni.showToast({ title: '正在处理中...', icon: 'none' })
    return
  }
  
  try {
    exportLoading.value = true
    console.log('设置exportLoading为true')
    
    // 任务三：导出时的确定性检查 - 显式判断 isRendered 状态
    if (!isRendered.value) {
      uni.showLoading({
        title: '准备内容中...',
        mask: true
      })
      console.log('等待 Markdown 渲染完成...')
      // isRendered 为 false 说明还没渲染完或开关刚打开，等待 1 秒后再继续
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('1秒等待完成, isRendered:', isRendered.value)
      // 如果仍未渲染完成，继续等待最多 2 秒
      let waitCount = 0
      while (!isRendered.value && waitCount < 20) {
        await new Promise(resolve => setTimeout(resolve, 100))
        waitCount++
      }
      console.log('渲染等待完成, isRendered:', isRendered.value)
    }
    
    uni.showLoading({
      title: '正在生成图片...',
      mask: true
    })
    
    // 任务三：增加主动等待时间，给浏览器留出重绘时间
    console.log('主动等待 800ms，确保页面完全渲染...')
    await new Promise(resolve => setTimeout(resolve, 800))
    
    console.log('=== 开始导出图片 ===')
    console.log('当前平台:', process.env.UNI_PLATFORM || 'unknown')
    console.log('memoId:', memoId.value)
    
    // 构建目标URL（去除可能的引号）
    const baseUrl = String(import.meta.env.VITE_PUBLIC_THIS_H5_URL || '').replace(/['"]/g, '')
    const targetUrl = `${baseUrl}/subPackages/services/memo/detail?id=${memoId.value}`
    const posterId = `memo_${memoId.value}_${Date.now()}`
    
    console.log('步骤1: 准备参数')
    console.log('- posterId:', posterId)
    console.log('- targetUrl:', targetUrl)
    console.log('- baseUrl:', baseUrl)
    console.log('- VITE_APP_BASE_URL:', import.meta.env.VITE_APP_BASE_URL)
    
    // 第一步：调用接口生成海报
    console.log('步骤2: 调用海报生成接口...')
    
    // 任务四：增加超时控制到 60 秒
    const apiTimeout = 60000 // 60秒超时
    let generateRes
    
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('接口调用超时(60秒)')), apiTimeout)
      })
      
      const apiPromise = postPainterGenerateInfo({
        id: posterId,
        targetUrl: targetUrl,
        selector: '.memo-content',
        options: {
          width: 375,
          deviceScaleFactor: 2,
          readySelector: '.is-ready',
          timeout: 90000,  // 任务四：增加后端超时时间
          waitTime: 1000   // 任务四：显式延时截图参数
        }
      })
      
      generateRes = await Promise.race([apiPromise, timeoutPromise])
      console.log('步骤2完成: 海报生成响应:', JSON.stringify(generateRes))
    } catch (apiErr: any) {
      console.error('步骤2失败: 调用海报接口失败')
      console.error('- 错误信息:', apiErr?.message || apiErr)
      throw new Error(`生成海报接口错误: ${apiErr.message || '未知错误'}`)
    }
    
    if (!generateRes?.id) {
      console.error('步骤2失败: 海报响应无效')
      console.error('- generateRes:', JSON.stringify(generateRes))
      throw new Error('生成海报失败，服务器未返回有效数据')
    }
    
    console.log('步骤3: 开始下载海报图片')
    
    // 第二步：下载图片
    // #ifdef H5
    console.log('- 使用H5下载方式')
    await downloadImageForH5(posterId)
    // #endif
    
    // #ifndef H5
    console.log('- 使用小程序下载方式')
    await downloadImageForMp(posterId)
    // #endif
    
  } catch (error: any) {
    console.error('导出图片失败:', error)
    uni.hideLoading()
    
    // 使用showModal显示详细错误，便于调试
    const errorDetail = error?.message || error?.errMsg || String(error) || '未知错误'
    console.error('错误详情:', errorDetail)
    
    uni.showModal({
      title: '导出失败',
      content: errorDetail.substring(0, 200),
      showCancel: false
    })
  } finally {
    // 确保在任何情况下都重置loading状态
    exportLoading.value = false
    console.log('exportLoading已重置为false')
  }
}

// H5端下载图片
const downloadImageForH5 = async (posterId: string) => {
  const imageUrl = `${import.meta.env.VITE_APP_BASE_URL}/painter/${posterId}`
  
  // 检测是否在微信浏览器中
  const isWechat = /MicroMessenger/i.test(navigator.userAgent)
  
  try {
    // 使用fetch获取图片blob
    const response = await fetch(imageUrl, {
      mode: 'cors',
      credentials: 'omit'
    })
    if (!response.ok) {
      throw new Error(`下载失败，状态码: ${response.status}`)
    }
    
    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)
    
    uni.hideLoading()
    
    // 微信内 H5 浏览器不支持 download 属性，使用预览方式
    if (isWechat) {
      // 显示图片预览弹窗，提示用户长按保存
      showImagePreviewModal(blobUrl)
    } else {
      // 尝试使用 a 标签下载（适用于大多数现代浏览器）
      const downloadSuccess = await tryDownloadWithLink(blobUrl, `备忘录_${formatExportDate()}.png`)
      
      if (downloadSuccess) {
        uni.showToast({
          title: '图片已下载',
          icon: 'success'
        })
      } else {
        // 下载失败，显示图片预览让用户手动保存
        showImagePreviewModal(blobUrl)
      }
    }
  } catch (fetchError: any) {
    console.error('Fetch 下载失败:', fetchError)
    uni.hideLoading()
    
    // 备用方案：直接打开图片链接让用户手动保存
    showImagePreviewModal(imageUrl)
  }
  
  exportLoading.value = false
}

// 尝试使用 a 标签下载文件
const tryDownloadWithLink = (url: string, filename: string): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.style.display = 'none'
      
      // 检测浏览器是否支持 download 属性
      if (typeof link.download === 'undefined') {
        resolve(false)
        return
      }
      
      document.body.appendChild(link)
      link.click()
      
      // 延迟移除元素和释放 URL
      setTimeout(() => {
        document.body.removeChild(link)
        // 只有 blob URL 才需要释放
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url)
        }
      }, 100)
      
      resolve(true)
    } catch (e) {
      console.error('下载链接创建失败:', e)
      resolve(false)
    }
  })
}

// 显示图片预览弹窗（用于不支持自动下载的环境）
const showImagePreviewModal = (imageUrl: string) => {
  // 创建遮罩层
  const overlay = document.createElement('div')
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.85);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
  `
  
  // 提示文字
  const tip = document.createElement('div')
  tip.style.cssText = `
    color: #fff;
    font-size: 16px;
    margin-bottom: 20px;
    text-align: center;
  `
  tip.textContent = '长按图片保存到相册'
  
  // 图片元素
  const img = document.createElement('img')
  img.src = imageUrl
  img.style.cssText = `
    max-width: 90%;
    max-height: 70vh;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  `
  
  // 关闭按钮
  const closeBtn = document.createElement('button')
  closeBtn.textContent = '关闭'
  closeBtn.style.cssText = `
    margin-top: 20px;
    padding: 12px 40px;
    background: #fff;
    color: #333;
    border: none;
    border-radius: 24px;
    font-size: 16px;
    cursor: pointer;
  `
  closeBtn.onclick = () => {
    document.body.removeChild(overlay)
    // 释放 blob URL
    if (imageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imageUrl)
    }
  }
  
  // 点击遮罩关闭
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      document.body.removeChild(overlay)
      if (imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl)
      }
    }
  }
  
  overlay.appendChild(tip)
  overlay.appendChild(img)
  overlay.appendChild(closeBtn)
  document.body.appendChild(overlay)
  
  uni.showToast({
    title: '长按图片保存',
    icon: 'none',
    duration: 2000
  })
}

// 小程序端下载并保存图片
const downloadImageForMp = async (posterId: string) => {
  console.log('=== 小程序保存图片开始 ===')
  
  // 构建下载URL
  const baseUrl = String(import.meta.env.VITE_APP_BASE_URL || '').replace(/['"]/g, '')
  const imageUrl = `${baseUrl}/painter/${posterId}`
  console.log('图片URL:', imageUrl)
  
  // 使用uni.getImageInfo获取网络图片（会自动下载到本地临时文件）
  console.log('正在获取图片...')
  
  let tempFilePath: string
  
  try {
    const imageInfo = await new Promise<UniApp.GetImageInfoSuccessData>((resolve, reject) => {
      uni.getImageInfo({
        src: imageUrl,
        success: (res) => {
          console.log('获取图片成功:', res.path)
          resolve(res)
        },
        fail: (err) => {
          console.error('获取图片失败:', err)
          reject(new Error(err.errMsg || '获取图片失败'))
        }
      })
    })
    tempFilePath = imageInfo.path
  } catch (err: any) {
    // 如果getImageInfo失败，尝试使用downloadFile
    console.log('getImageInfo失败，尝试downloadFile...')
    try {
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
    } catch (downloadErr: any) {
      throw new Error(`下载图片失败: ${downloadErr.message}`)
    }
  }
  
  console.log('临时文件路径:', tempFilePath)
  
  // 隐藏loading
  uni.hideLoading()
  
  // 保存到相册
  console.log('正在保存到相册...')
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
    console.error('保存失败:', saveErr)
    
    // 权限问题
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
  
  console.log('=== 小程序保存图片完成 ===')
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
  position: relative;
  // 移除 overflow: hidden，否则 sticky 定位会失效
  overflow-x: hidden;
  overflow-y: visible;
}

// 背景图层 - 确保不干扰导航栏
.background-layer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  pointer-events: none;
}

// 水印
.watermark {
  padding: 40rpx 32rpx;
  text-align: center;
  
  .watermark-text {
    font-size: 24rpx;
    color: #ccc;
    letter-spacing: 2rpx;
  }
}

.nav-actions {
  // padding-left: 32rpx;
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
  padding: 32rpx;
  background: transparent;
  position: relative;
  z-index: 1;
}

.memo-header {
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

.content-block {
  position: relative;
  box-shadow: none;
  background: transparent;
  margin-bottom: 0;
}

// 锚点标签样式
.anchor-tag {
  position: absolute;
  left: -40rpx; // 悬浮在内容左侧
  top: 8rpx;
  font-size: 20rpx;
  color: #ccc;
  opacity: 0.5;
  font-family: monospace;
  z-index: 1;
  background: rgba(255, 255, 255, 0.8);
  padding: 2rpx 6rpx;
  border-radius: 4rpx;
  
  // 在小屏幕上调整位置
  @media (max-width: 750rpx) {
    left: -30rpx;
    font-size: 18rpx;
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

// Markdown 渲染样式（极简版本 - 避免 WXSS 编译错误）
.markdown-body {
  word-break: break-all;
  line-height: 1.8;
  display: inline;
  
  /* 核心：开启选中 */
  -webkit-user-select: text !important;
  user-select: text !important;
  pointer-events: auto !important;
  
  // 默认状态（纯白底时）- 实心浅灰背景
  // th {
  //   background-color: #f8f9fa;
  // }
  
  td {
    background-color: transparent;
  }
  
  code {
    background-color: #f1f3f4;
  }
  
  pre {
    background-color: #f8f9fa;
  }
  
  blockquote {
    background-color: transparent;
  }
  
  // 透视状态（有自定义背景时）- 半透明毛玻璃效果
  &.glass-mode {
    // th {
    //   background-color: rgba(255, 255, 255, 0.15) !important;
    // }
    
    // td {
    //   background-color: rgba(255, 255, 255, 0.05) !important;
    // }
    
    code {
      background-color: rgba(255, 255, 255, 0.25) !important;
    }
    
    pre {
      background-color: rgba(255, 255, 255, 0.15) !important;
      // #ifdef H5
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      // #endif
    }
    
    blockquote {
      background-color: rgba(255, 255, 255, 0.1) !important;
    }
    
    table {
      background-color: transparent !important;
    }
    
    tr {
      background-color: transparent !important;
      
      &:nth-child(even) {
        background-color: rgba(255, 255, 255, 0.05) !important;
      }
    }
  }
}

// 表格容器样式（仅保留布局）
.table-container {
  overflow-x: auto;
  margin: 16rpx 0;
  width: 100%;
}

// 确保父级容器支持文本选中
.content-blocks {
  -webkit-user-select: text !important;
  user-select: text !important;
  pointer-events: auto !important;
}

.content-block {
  -webkit-user-select: text !important;
  user-select: text !important;
  pointer-events: auto !important;
}

.text-block {
  -webkit-user-select: text !important;
  user-select: text !important;
  pointer-events: auto !important;
}

.text-item {
  -webkit-user-select: text !important;
  user-select: text !important;
  pointer-events: auto !important;
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

// 文本项链接样式
.text-item {
  &.has-link {
    // display: flex;
    // align-items: center;
    // gap: 8rpx;
    cursor: pointer;
    
    &:active {
      opacity: 0.7;
    }
    
    .link-text {
      text-decoration: underline;
      text-decoration-color: currentColor;
    }
    
    .link-indicator {
      font-size: 24rpx;
      flex-shrink: 0;
    }
  }
}

/* #ifdef H5 */
// H5 端增强样式：处理 uni-rich-text 节点和 CSS 变量穿透
.markdown-body {
  // H5 下使用 block 布局更稳健
  display: block;
  
  -webkit-user-select: text !important;
  user-select: text !important;
  pointer-events: auto !important;
}

.content-blocks {
  overflow-x: hidden;
}

.text-block {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
/* #endif */

/* #ifdef MP-WEIXIN */
.content-blocks,
.content-block,
.text-block,
.text-item {
  -webkit-user-select: text !important;
  user-select: text !important;
  pointer-events: auto !important;
}
/* #endif */

// 路径容器样式 - 垂直时间轴
.route-container {
  background: transparent;
  padding: 24rpx 0;
  margin: 16rpx 0;
}

.route-node {
  display: flex;
  position: relative;
  min-height: 80rpx;
  
  &.is-end {
    min-height: 48rpx;
  }
}

// 左侧轴线
.route-axis {
  width: 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  position: relative;
}

.route-dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  background: #fff;
  border: 4rpx solid #999;
  z-index: 2;
  flex-shrink: 0;
  
  &.dot-large {
    width: 28rpx;
    height: 28rpx;
    background: #667eea;
    border: none;
  }
  
  // 菱形徽章样式（换乘站）
  &.dot-badge {
    width: 24rpx;
    height: 24rpx;
    border-radius: 6rpx;
    transform: rotate(45deg);
    // background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    background: #667eea;
    border: 2rpx solid #fff;
    box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.4);
  }
}

.route-line {
  width: 4rpx;
  flex: 1;
  min-height: 80rpx;
  margin-top: 8rpx;
  position: relative;
  
  &.line-dashed {
    background: repeating-linear-gradient(
      to bottom,
      #ccc 0rpx,
      #ccc 8rpx,
      transparent 8rpx,
      transparent 16rpx
    );
  }
  
  // 管道感连线样式（换乘线）
  &.line-pipe {
    width: 8rpx;
    background: #667eea;
    border-radius: 4rpx;
    
    &::before {
      content: '';
      position: absolute;
      top: -4rpx;
      bottom: -4rpx;
      left: 50%;
      transform: translateX(-50%);
      width: 24rpx;
      background: rgba(102, 126, 234, 0.15);
      border-radius: 12rpx;
      z-index: -1;
    }
  }
}

// 右侧内容
.route-content {
  flex: 1;
  padding-left: 16rpx;
  padding-bottom: 32rpx;
  
  .route-node.is-end & {
    padding-bottom: 0;
  }
}

.route-name {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
}

// 信息胶囊标签
.route-info-tag {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  margin-top: 12rpx;
  padding: 8rpx 20rpx;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
  border: 2rpx solid rgba(102, 126, 234, 0.2);
  border-radius: 32rpx;
  
  .tag-time {
    font-size: 24rpx;
    color: #667eea;
    font-weight: 500;
  }
  
  .tag-divider {
    font-size: 24rpx;
    color: #999;
  }
  
  .tag-icon {
    font-size: 24rpx;
  }
}

.route-desc {
  display: block;
  margin-top: 8rpx;
  font-size: 26rpx;
  color: #999;
  line-height: 1.5;
}

// 回到顶部按钮
// .back-to-top-btn {
//   position: fixed;
//   right: 32rpx;
//   bottom: 200rpx;
//   width: 88rpx;
//   height: 88rpx;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   background: rgba(255, 255, 255, 0.95);
//   backdrop-filter: blur(10px);
//   border-radius: 50%;
//   box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.15);
//   z-index: 99;
//   padding-bottom: constant(safe-area-inset-bottom);
//   padding-bottom: env(safe-area-inset-bottom);
  
//   .back-to-top-icon {
//     font-size: 40rpx;
//     color: #667eea;
//     font-weight: bold;
//   }
  
//   &:active {
//     transform: scale(0.9);
//     background: rgba(240, 240, 240, 0.95);
//   }
// }

.back-to-top-btn {
  position: fixed;
  right: 40rpx;
  bottom: 60rpx;
  /* 强制固定宽高，确保正圆 */
  width: 96rpx;
  height: 96rpx;
  background-color: #ffffff;
  border-radius: 50%;
  /* 增加阴影提升悬浮感 */
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 0; /* 清除边距干扰 */
  border: 1rpx solid rgba(102, 126, 234, 0.1);
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.9);
    background-color: #f0f2ff;
  }

  .icon {
    font-size: 36rpx;
    font-weight: bold;
    color: #667eea;
    line-height: 1;
    margin-bottom: 4rpx;
  }

  .btn-text {
    font-size: 20rpx;
    color: #667eea;
    font-weight: 500;
    line-height: 1;
  }
}

// 附件块样式 - 适配块级样式引擎
.attachment-container {
  // 默认无边距，由块级样式控制
  background: transparent;
  
  // 当有块级背景色时，附件卡片自动居中填充
  &[style*="background"] {
    .attachment-capsule {
      background: rgba(255, 255, 255, 0.6);
    }
  }
}

.attachment-capsule {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  margin: 12rpx 0;
  background: rgba(102, 126, 234, 0.08);
  border: 2rpx solid rgba(102, 126, 234, 0.2);
  border-radius: 16rpx;
  transition: all 0.15s ease;
  
  &:first-child {
    margin-top: 0;
  }
  
  &:last-child {
    margin-bottom: 0;
  }
  
  // 腾讯文档特殊样式
  &.is-tencent-doc {
    background: rgba(7, 193, 96, 0.08);
    border-color: rgba(7, 193, 96, 0.25);
    
    .capsule-icon {
      color: #07c160;
    }
    
    .capsule-arrow {
      color: #07c160;
    }
  }
  
  // 点击态反馈（hover-class）
  &.capsule-hover {
    transform: scale(0.98);
    background: rgba(102, 126, 234, 0.18);
  }
  
  &.is-tencent-doc.capsule-hover {
    background: rgba(7, 193, 96, 0.18);
  }
  
  &:active {
    background: rgba(102, 126, 234, 0.15);
  }
  
  .capsule-icon {
    font-size: 40rpx;
    margin-right: 20rpx;
    flex-shrink: 0;
  }
  
  .capsule-content {
    flex: 1;
    min-width: 0;
    
    .capsule-title {
      display: block;
      font-size: 30rpx;
      font-weight: 500;
      color: #333;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .capsule-hint {
      display: block;
      font-size: 24rpx;
      color: #999;
      margin-top: 4rpx;
    }
  }
  
  .capsule-arrow {
    font-size: 36rpx;
    color: #999;
    margin-left: 16rpx;
    flex-shrink: 0;
  }
}

// 全局文档关联底部栏
.global-attachment-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 40rpx;
  padding-bottom: calc(24rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1rpx solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.08);
  z-index: 100;
  
  .bar-content {
    display: flex;
    align-items: center;
    gap: 16rpx;
    
    .bar-icon {
      font-size: 36rpx;
    }
    
    .bar-title {
      font-size: 30rpx;
      font-weight: 500;
      color: #667eea;
    }
  }
  
  .bar-arrow {
    font-size: 40rpx;
    color: #667eea;
  }
  
  &:active {
    background: rgba(240, 240, 250, 0.95);
  }
}

// Markdown 表格透明化 - 与全局背景融合
.markdown-body {
  // 表格背景透明
  table {
    background: transparent !important;
    border-collapse: collapse;
    width: 100%;
    margin: 16rpx 0;
  }
  
  thead {
    background: transparent !important;
  }
  
  tr {
    background: transparent !important;
    
    &:nth-child(even) {
      background: rgba(0, 0, 0, 0.02) !important;
    }
  }
  
  th {
    background: transparent !important;
    border-bottom: 2rpx solid rgba(0, 0, 0, 0.1) !important;
    padding: 16rpx 20rpx;
    font-weight: 600;
    text-align: left;
  }
  
  td {
    background: transparent !important;
    border-bottom: 1rpx solid rgba(0, 0, 0, 0.05) !important;
    padding: 12rpx 20rpx;
  }
  
  // 行内代码块样式优化 - 半透明底色适配全局背景
  code {
    background: rgba(0, 0, 0, 0.05) !important;
    padding: 4rpx 10rpx !important;
    border-radius: 8rpx !important;
    font-family: Consolas, Monaco, monospace !important;
    font-size: 0.9em !important;
    color: inherit !important;
  }
  
  // 代码块样式
  pre {
    background: rgba(0, 0, 0, 0.04) !important;
    padding: 20rpx !important;
    border-radius: 12rpx !important;
    overflow-x: auto;
    
    code {
      background: transparent !important;
      padding: 0 !important;
      border-radius: 0 !important;
    }
  }
}

// 深色模式下的代码块样式
@media (prefers-color-scheme: dark) {
  .markdown-body {
    code {
      background: rgba(255, 255, 255, 0.1) !important;
    }
    
    pre {
      background: rgba(255, 255, 255, 0.08) !important;
    }
    
    tr:nth-child(even) {
      background: rgba(255, 255, 255, 0.03) !important;
    }
    
    th {
      border-bottom-color: rgba(255, 255, 255, 0.15) !important;
    }
    
    td {
      border-bottom-color: rgba(255, 255, 255, 0.08) !important;
    }
  }
}
</style>
