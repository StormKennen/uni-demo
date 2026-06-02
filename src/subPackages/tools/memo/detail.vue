<template>
  <view class="memo-detail-page" :style="pageStyle">
    <!-- 背景图层 -->
    <view v-if="backgroundLayerStyle" class="background-layer" :style="backgroundLayerStyle"></view>
    
    <!-- 动态光斑效果 -->
    <view v-if="settings.appearance.enableBlob" class="blob-container">
      <view class="blob-circle blob-1" :style="{ filter: `blur(${settings.appearance.blobBlur}px)` }"></view>
      <view class="blob-circle blob-2" :style="{ filter: `blur(${settings.appearance.blobBlur}px)` }"></view>
    </view>
    
    <!-- 科技感网格背景 -->
    <view v-if="settings.appearance.enableCyberGrid" class="cyber-grid"></view>
    
    <nav-bar 
      always-title
      :title="memoTitle"
      custom-class="light"
      :custom-style="{ backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }"
    />

    <view class="nav-actions" v-if="!settings.hideNavActions">
      <!-- 导出图片按钮 -->
      <view class="action-btn ghost" @click="exportImage" v-if="memoData">
        <text class="icon">导出</text>
      </view>
      <!-- 分享按钮 -->
      <view class="action-btn ghost" @click="shareMemo" v-if="memoData">
        <text class="icon">分享</text>
      </view>
      <!-- 编辑按钮（仅登录用户） -->
      <view class="action-btn primary" @click="goToEdit" v-if="isLoggedIn && memoData">
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
    <view v-if="!loading && memoData" id="poster-wrapper" class="memo-content" :class="[
      'theme-' + currentSmartTheme,
      { 'is-ready': isRendered, 'has-custom-bg': hasCustomBackground, 'is-narrow': settings.layout.contentWidth === 'narrow' }
    ]" :style="memoBodyStyle">
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
          :id="block.anchor || ('L' + (blockIndex + 1))"
          class="content-block"
          :class="{ 
            'is-popup-source': isBlockPopupTarget(block),
            'has-block-style': hasCustomBlockStyle(block.style)
          }"
          v-show="!isBlockPopupTarget(block)"
        >
          <!-- 扑克牌翻转容器 -->
          <view 
            v-if="block.style?.enablePokerCard" 
            class="poker-card-container"
            @click="handlePokerFlip(Number(blockIndex))"
          >
            <view class="poker-card-inner" :class="{ 'is-flipped': isBlockFlipped(Number(blockIndex)) }">
              <!-- 扑克牌背面 - 黑金高级感设计 -->
              <view class="card-back">
                <view class="card-back-logo">
                  <text class="logo-icon">✦</text>
                </view>
                <text class="card-corner-suits">♠ ♥ ♣ ♦</text>
                <view class="card-shine"></view>
              </view>
              <!-- 扑克牌正面（内容） -->
              <view class="card-front">
                <!-- 文本块 -->
                <view 
                  v-if="block.type === 'text'" 
                  class="text-block" 
                  :class="{ 'is-markdown': block.isMarkdown, 'card-3d': block.style?.enable3DMode }"
                  :style="getBlockStyle(block.style)"
                >
                  <view 
                    v-for="(item, itemIndex) in block.children" 
                    :key="itemIndex"
                    class="text-item"
                    :class="{ 'has-link': item.linkInfo, 'no-select': item.interactionType === 'popup' }"
                    @click.stop="handleTextItemClick(item)"
                  >
                    <text v-if="item.linkIcon" class="link-indicator">{{ item.linkIcon }}</text>
                    <text class="text-preview" :class="{ 'link-text': item.linkInfo }" :style="getTextStyle(item.style)">{{ item.value || '' }}</text>
                  </view>
                </view>
                <!-- 图片块 -->
                <view v-if="block.type === 'image'" class="image-block" :style="getBlockStyle(block.style)">
                  <!-- grid 布局 -->
                  <view 
                    v-if="!block.layout || block.layout.type === 'grid'"
                    class="image-grid" 
                    :style="{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${block.layout?.columns || 2}, 1fr)`,
                      gap: `${block.layout?.gap || 12}rpx`
                    }"
                  >
                    <view v-for="(item, itemIndex) in block.children" :key="itemIndex" class="image-item">
                      <view class="image-preview" v-if="(item.url || (item.value && item.value.url))" @click.stop="previewImage(item.url || item.value.url)">
                        <view class="image-container">
                          <image :src="item.url || item.value.url" :style="getImageStyle(item.style)" :mode="getImageMode(item.style)" />
                        </view>
                      </view>
                    </view>
                  </view>

                  <!-- carousel 布局 -->
                  <swiper
                    v-else-if="block.layout.type === 'carousel'"
                    class="image-swiper"
                    indicator-dots
                    circular
                    :autoplay="false"
                  >
                    <swiper-item v-for="(item, itemIndex) in block.children" :key="itemIndex">
                      <view class="swiper-item-content" @click.stop="previewImage(item.url || item.value.url)">
                        <image 
                          v-if="(item.url || (item.value && item.value.url))"
                          :src="item.url || item.value.url" 
                          class="swiper-image"
                          mode="aspectFill"
                        />
                      </view>
                    </swiper-item>
                  </swiper>

                  <!-- free 布局：垂直堆叠 -->
                  <view v-else class="image-free">
                    <view 
                      v-for="(item, itemIndex) in block.children" 
                      :key="itemIndex"
                      class="image-free-item"
                      @click.stop="previewImage(item.url || item.value.url)"
                    >
                      <image 
                        v-if="(item.url || (item.value && item.value.url))"
                        :src="item.url || item.value.url"
                        class="free-image"
                        mode="widthFix"
                      />
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>

          <!-- 普通内容块（无扑克牌效果） -->
          <template v-else>
          <!-- 锚点标签显示 -->
          <!-- <text class="anchor-tag">#L{{ blockIndex + 1 }}</text> -->
          <!-- 文本块 -->
          <view 
            v-if="block.type === 'text'" 
            class="text-block" 
            :class="{ 'is-markdown': block.isMarkdown, 'card-3d': block.style?.enable3DMode }"
            :style="getBlockStyle(block.style)"
          >
            <view 
              v-for="(item, itemIndex) in block.children" 
              :key="itemIndex"
              class="text-item"
              :class="{ 'has-link': item.linkInfo, 'no-select': item.interactionType === 'popup' }"
              @click="handleTextItemClick(item)"
            >
              <text v-if="item.linkIcon" class="link-indicator">{{ item.linkIcon }}</text>
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
            <!-- grid 布局 -->
            <view 
              v-if="!block.layout || block.layout.type === 'grid'"
              class="image-grid" 
              :style="{
                display: 'grid',
                gridTemplateColumns: `repeat(${block.layout?.columns || 2}, 1fr)`,
                gap: `${block.layout?.gap || 12}rpx`
              }"
            >
              <view 
                v-for="(item, itemIndex) in block.children" 
                :key="itemIndex"
                class="image-item"
              >
                <view class="image-preview" v-if="(item.url || (item.value && item.value.url))" @click="previewImage(item.url || item.value.url)">
                  <view class="image-container">
                    <image 
                      :src="item.url || item.value.url"
                      :style="getImageStyle(item.style)"
                      :mode="getImageMode(item.style)"
                    />
                  </view>
                </view>
              </view>
            </view>

            <!-- carousel 布局 -->
            <swiper
              v-else-if="block.layout.type === 'carousel'"
              class="image-swiper"
              indicator-dots
              circular
              :autoplay="false"
            >
              <swiper-item v-for="(item, itemIndex) in block.children" :key="itemIndex">
                <view class="swiper-item-content" @click="previewImage(item.url || item.value.url)">
                  <image 
                    v-if="(item.url || (item.value && item.value.url))"
                    :src="item.url || item.value.url" 
                    class="swiper-image"
                    mode="aspectFill"
                  />
                </view>
              </swiper-item>
            </swiper>

            <!-- free 布局：垂直堆叠 -->
            <view v-else class="image-free">
              <view 
                v-for="(item, itemIndex) in block.children" 
                :key="itemIndex"
                class="image-free-item"
                @click="previewImage(item.url || item.value.url)"
              >
                <image 
                  v-if="(item.url || (item.value && item.value.url))"
                  :src="item.url || item.value.url"
                  class="free-image"
                  mode="widthFix"
                />
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

          <!-- 多媒体块 -->
          <view v-if="block.type === 'media'" class="media-container" :style="getBlockStyle(block.style)">
            <view 
              v-for="(item, itemIndex) in block.children" 
              :key="itemIndex"
              class="media-item"
            >
              <text v-if="item.title" class="media-title">{{ item.title }}</text>
              <video 
                v-if="item.url && (item.url.includes('.mp4') || item.url.includes('.mov') || item.url.includes('.avi'))" 
                :src="item.url" 
                class="media-video" 
                :controls="item.controls !== false"
                :autoplay="item.autoplay === true"
                :loop="item.loop === true"
                :show-center-play-btn="true"
                :show-play-btn="true"
              ></video>
              <view 
                v-else-if="item.url && (item.url.includes('.mp3') || item.url.includes('.m4a') || item.url.includes('.wav'))" 
                class="media-audio-wrapper"
                :class="{ 'has-controls': item.controls !== false }"
              >
                <view class="audio-icon">🎵</view>
                <text class="audio-name">{{ item.title || '音频文件' }}</text>
                <text v-if="item.loop" class="audio-loop-tag">循环</text>
              </view>
            </view>
          </view>
          </template>

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

    <!-- 浪漫毛玻璃弹窗 -->
    <view 
      v-if="glassModalVisible" 
      class="glass-modal"
      @click="closeGlassModal"
    >
      <view 
        class="glass-content"
        :class="[
          glassModalAnimation === 'zoom-in' ? 'zoom-in-enter-active' : 'slide-up-enter-active',
          settings.romanticEffects.enableGlassBlur ? 'popup-glass' : '',
          'romantic-content'
        ]"
        @click.stop
      >
        <view class="glass-close" @click="closeGlassModal">✕</view>
        <view class="glass-text">{{ glassModalContent }}</view>
      </view>
    </view>

    <!-- 锚点弹窗 - 渲染隐藏的block内容 -->
    <view 
      v-if="popupBlockVisible && popupBlockData" 
      class="anchor-popup-overlay"
      :class="{ 'glass-blur': settings.romanticEffects.enableGlassBlur }"
      @click="closePopupBlock"
    >
      <view 
        class="anchor-popup-content"
        :class="[
          settings.romanticEffects.popupAnimation === 'zoom-in' ? 'zoom-in-enter-active' : 'slide-up-enter-active',
          settings.romanticEffects.enableGlassBlur ? 'popup-glass' : ''
        ]"
        @click.stop
      >
        <view class="anchor-popup-header">
          <text class="anchor-popup-title">💫 详细内容</text>
          <view class="anchor-popup-close" @click="closePopupBlock">✕</view>
        </view>
        <scroll-view class="anchor-popup-body" scroll-y>
          <!-- 文本块渲染 -->
          <view v-if="popupBlockData.type === 'text'" class="popup-text-block">
            <view 
              v-for="(item, idx) in popupBlockData.children" 
              :key="idx"
              class="popup-text-item"
            >
              <text :style="getTextStyle(item.style)">{{ item.value }}</text>
            </view>
          </view>
          
          <!-- 图片块渲染 -->
          <view v-if="popupBlockData.type === 'image'" class="popup-image-block">
            <image 
              v-for="(item, idx) in popupBlockData.children" 
              :key="idx"
              :src="item.value?.url || item.value"
              mode="widthFix"
              class="popup-image"
              @click="previewImage(item.value?.url || item.value)"
            />
          </view>
          
          <!-- 多媒体块渲染 -->
          <view v-if="popupBlockData.type === 'media'" class="popup-media-block">
            <view 
              v-for="(item, idx) in popupBlockData.children" 
              :key="idx"
              class="popup-media-item"
            >
              <text v-if="item.title" class="media-title">{{ item.title }}</text>
              <video 
                v-if="item.url && (item.url.includes('.mp4') || item.url.includes('.mov'))"
                :src="item.url"
                class="popup-video"
                controls
              />
            </view>
          </view>
        </scroll-view>
      </view>
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
// 浪漫弹窗状态
const glassModalVisible = ref(false)
const glassModalContent = ref('')
const glassModalAnimation = ref('zoom-in')

const settings = reactive({
  padding: { top: 32, bottom: 32, left: 32, right: 32 },
  border: { top: 0, bottom: 0, left: 0, right: 0, color: '#eeeeee' },
  appearance: {
    backgroundColor: '#ffffff',
    backgroundImage: '',
    backgroundBlur: 0,
    backgroundOpacity: 1,
    enableBlob: false,
    blobBlur: 80,
    enableCyberGrid: false
  },
  romanticEffects: {
    popupAnimation: 'zoom-in', // 'zoom-in' | 'slide-up'
    enableGlassBlur: true
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

// 智能主题识别
const currentSmartTheme = computed(() => {
  if (!memoData.value) return 'standard'
  
  // 1. 如果包含任何扑克牌样式 block，或者是黑底背景，走“卡牌互动(cyber-poker)”主题
  const hasPoker = parsedContent.value.some((b: any) => b.style?.enablePokerCard)
  const isDarkBg = settings.appearance.backgroundColor === '#1a1a1a' || settings.appearance.backgroundColor === '#000000'
  if (hasPoker || isDarkBg) {
    return 'cyber-poker'
  }
  
  // 2. 如果是自定义背景图片，或者是莫兰迪配色里的唯美颜色，或者是启用了 enableBlob 动态光斑，走“唯美毛玻璃(romantic-glass)”主题
  const hasBgImg = !!settings.appearance.backgroundImage
  const isMorandi = ['#E4DCD3', '#D6E4E5', '#F9F5EB', '#E8E4D9', '#D5C4A1', '#C9D6DF', '#E6D5C3'].includes(settings.appearance.backgroundColor)
  if (hasBgImg || isMorandi || settings.appearance.enableBlob) {
    return 'romantic-glass'
  }
  
  // 3. 否则，走标准的“优雅简约(elegant-minimal)”主题
  return 'elegant-minimal'
})

// 判断块是否有自定义的背景色或边框，避免样式叠加冲突
const hasCustomBlockStyle = (style: any) => {
  if (!style) return false
  return !!(
    style.backgroundColor || 
    (style.border && (
      (style.border.top && style.border.top.width) || 
      (style.border.bottom && style.border.bottom.width) || 
      (style.border.left && style.border.left.width) || 
      (style.border.right && style.border.right.width)
    ))
  )
}

// 滚动状态 - 用于回到顶部按钮
const scrollTop = ref(0)
const showBackToTopBtn = computed(() => settings.showBackToTop && scrollTop.value > 400)

// 锚点弹窗系统 - 获取所有被引用为弹窗目标的锚点集合
const popupTargetAnchors = computed(() => {
  const anchors = new Set<string>()
  if (!parsedContent.value) return anchors
  
  parsedContent.value.forEach((block: any) => {
    if (block.type === 'text' && block.children) {
      block.children.forEach((item: any) => {
        if (item.linkInfo?.linkType === 'popup' && item.linkInfo?.targetAnchor) {
          anchors.add(item.linkInfo.targetAnchor)
        }
      })
    }
  })
  return anchors
})

// 判断某个block是否被引用为弹窗目标（应该隐藏）
const isBlockPopupTarget = (block: any): boolean => {
  if (!block.anchor) return false
  return popupTargetAnchors.value.has(block.anchor)
}

// 根据锚点ID查找对应的block数据
const findBlockByAnchor = (anchor: string): any => {
  if (!parsedContent.value) return null
  return parsedContent.value.find((block: any) => block.anchor === anchor)
}

// 弹窗内容block状态
const popupBlockData = ref<any>(null)
const popupBlockVisible = ref(false)

// 扑克牌翻转状态 - 记录哪些块已被翻开
const flippedBlocks = reactive<Record<number, boolean>>({})
// 翻转动画进行中的状态 - 防止动画期间误触
const flippingBlocks = reactive<Record<number, boolean>>({})

// 处理扑克牌翻转点击
const handlePokerFlip = (blockIndex: number) => {
  // 如果已经翻开或正在翻转中，不执行任何操作
  if (flippedBlocks[blockIndex] || flippingBlocks[blockIndex]) return
  
  // 标记为翻转中
  flippingBlocks[blockIndex] = true
  
  // 触发震动反馈
  try {
    uni.vibrateShort({ type: 'medium' })
  } catch (e) {
    console.log('震动功能不可用')
  }
  
  // 设置为已翻开
  flippedBlocks[blockIndex] = true
  
  // 动画完成后解除翻转中状态（与 CSS 动画时长一致 2.5s）
  setTimeout(() => {
    flippingBlocks[blockIndex] = false
  }, 2500)
}

// 检查块是否已翻开（用于导出时强制翻开）
const isBlockFlipped = (blockIndex: number, forExport = false): boolean => {
  // 导出模式下强制显示已翻开状态
  if (forExport || isExporting.value) return true
  return !!flippedBlocks[blockIndex]
}

// 导出状态标记
const isExporting = ref(false)

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
      
      // 同步导航栏标题
      uni.setNavigationBarTitle({
        title: res?.name ?? '备忘录详情'
      })
      
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
          settings.appearance.enableBlob = res.settings.appearance.enableBlob === true
          settings.appearance.blobBlur = res.settings.appearance.blobBlur ?? 80
          settings.appearance.enableCyberGrid = res.settings.appearance.enableCyberGrid === true
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
      // auto模式：不设置固定宽高，让图片填充容器（适配grid布局）
      result.width = '100%'
      result.height = '100%'
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
    case 'fixedWidth':
    case 'percentWidth':
      return 'widthFix'
    case 'auto':
    default:
      // auto模式使用aspectFill，适配grid布局的正方形单元格
      return 'aspectFill'
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
    // 内部链接类型：区分「笔记」与「备忘录」
    const targetUrl =
      linkInfo.internalScene === 'memo' && linkInfo.internalId
        ? `/subPackages/services/memo/detail?id=${linkInfo.internalId}`
        : linkInfo.internalScene === 'chat' && linkInfo.internalPath
          ? linkInfo.internalPath
          : linkInfo.internalPath || null
    if (targetUrl) {
      // #ifdef H5
      const basePath = window.location.origin
      window.location.href = `${basePath}${targetUrl}`
      // #endif
      // #ifndef H5
      uni.navigateTo({
        url: targetUrl
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

// 关闭浪漫弹窗
const closeGlassModal = () => {
  glassModalVisible.value = false
  glassModalContent.value = ''
}

// 打开浪漫弹窗
const openGlassModal = (content: string) => {
  glassModalContent.value = content
  glassModalAnimation.value = settings.romanticEffects.popupAnimation
  glassModalVisible.value = true
}

// 处理文本项点击（优先链接，其次弹窗）
const handleTextItemClick = (item: any) => {
  // 1. 处理锚点弹窗链接（linkType === 'popup' 且有 targetAnchor）
  if (item.linkInfo?.linkType === 'popup' && item.linkInfo?.targetAnchor) {
    const targetBlock = findBlockByAnchor(item.linkInfo.targetAnchor)
    if (targetBlock) {
      // 找到目标block，显示在弹窗中
      popupBlockData.value = targetBlock
      popupBlockVisible.value = true
      
      // 触发震动反馈
      try {
        uni.vibrateShort()
      } catch (e) {
        console.log('震动功能不可用')
      }
    } else {
      uni.showToast({
        title: '未找到目标内容',
        icon: 'none'
      })
    }
    return
  }
  
  // 2. 处理其他链接跳转
  if (item.linkInfo && (item.linkInfo.url || item.linkInfo.linkType)) {
    handleLinkClick(item.linkInfo)
    return
  }
  
  // 3. 处理旧版弹窗展示（interactionType === 'popup'）
  if (item.interactionType === 'popup') {
    if (settings.romanticEffects.enableGlassBlur) {
      // 使用浪漫毛玻璃弹窗
      openGlassModal(item.value || '暂无内容')
    } else {
      // 使用默认系统弹窗
      uni.showModal({
        title: '详细内容',
        content: item.value || '',
        showCancel: false,
        confirmText: '关闭'
      })
    }
  }
}

// 关闭锚点弹窗
const closePopupBlock = () => {
  popupBlockVisible.value = false
  popupBlockData.value = null
  try {
    uni.vibrateShort()
  } catch (e) {
    console.log('震动功能不可用')
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
        // 兼容新旧数据结构：item.url（新）或 item.value.url（旧）
        const url = item.url || item.value?.url
        if (url) {
          urls.push(url)
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
    url: `/subPackages/tools/memo/editor?id=${memoId.value}`
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
    isExporting.value = true  // 导出模式：强制所有扑克牌翻开
    console.log('设置exportLoading为true, isExporting为true')
    
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
    isExporting.value = false  // 重置导出模式
    console.log('exportLoading和isExporting已重置为false')
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

// 动态光斑容器
.blob-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
}

// 光斑圆形
.blob-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.6;
  
  &.blob-1 {
    width: 400rpx;
    height: 400rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    top: 10%;
    left: -10%;
    animation: blob-move-1 15s ease-in-out infinite;
  }
  
  &.blob-2 {
    width: 300rpx;
    height: 300rpx;
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    bottom: 20%;
    right: -5%;
    animation: blob-move-2 18s ease-in-out infinite;
  }
}

@keyframes blob-move-1 {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(100rpx, 50rpx) scale(1.1);
  }
  50% {
    transform: translate(50rpx, 100rpx) scale(0.9);
  }
  75% {
    transform: translate(-50rpx, 50rpx) scale(1.05);
  }
}

@keyframes blob-move-2 {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(-80rpx, -60rpx) scale(1.15);
  }
  66% {
    transform: translate(40rpx, -80rpx) scale(0.85);
  }
}

// 科技感网格背景
.cyber-grid {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  pointer-events: none;
  background-image: 
    linear-gradient(rgba(102, 126, 234, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(102, 126, 234, 0.1) 1px, transparent 1px);
  background-size: 40rpx 40rpx;
}

// 3D卡片效果
.card-3d {
  transform-style: preserve-3d;
  perspective: 1000px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-8rpx) rotateX(2deg) rotateY(-2deg);
    box-shadow: 
      0 20rpx 40rpx rgba(102, 126, 234, 0.15),
      0 10rpx 20rpx rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(-4rpx) rotateX(1deg) rotateY(-1deg);
  }
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
  padding: 20rpx 32rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-top: 12rpx;
}

.action-btn {
  flex: 1;
  padding: 18rpx 0;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 30rpx rgba(102, 126, 234, 0.08);
  backdrop-filter: blur(10px);
  border: 1rpx solid rgba(255, 255, 255, 0.55);
  background: rgba(255, 255, 255, 0.85);

  &:active {
    transform: translateY(1rpx) scale(0.98);
  }

  .icon {
    font-size: 26rpx;
    font-weight: 600;
  }
}

.action-btn.ghost {
  color: #667eea;
}

.action-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  box-shadow: 0 12rpx 28rpx rgba(102, 126, 234, 0.25);
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

.text-item {
  border-radius: 8rpx;
  display: inline-block;
}

.image-item {
  border-radius: 8rpx;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
}

.image-preview {
  width: 100%;
  height: 100%;
}

.image-container {
  width: 100%;
  height: 100%;
}

.image-container image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 轮播布局 */
.image-swiper {
  width: 100%;
  height: 500rpx;
  border-radius: 8rpx;
  overflow: hidden;
}

.swiper-item-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.swiper-image {
  width: 100%;
  height: 100%;
}

/* 垂直堆叠布局 */
.image-free {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.image-free-item {
  width: 100%;
  border-radius: 8rpx;
  overflow: hidden;
}

.free-image {
  width: 100%;
  display: block;
}

// 弹窗类型文本不可选中
.text-item.no-select {
  -webkit-user-select: none !important;
  user-select: none !important;
  cursor: pointer;
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

// 多媒体块样式 - 强制100%宽度
.media-container {
  background: transparent;
  width: 100% !important;
  max-width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  
  .media-item {
    margin: 16rpx 0;
    
    &:first-child {
      margin-top: 0;
    }
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .media-title {
      display: block;
      font-size: 28rpx;
      font-weight: 500;
      color: #333;
      margin-bottom: 12rpx;
    }
    
    .media-video {
      width: 100%;
      height: 400rpx;
      border-radius: 12rpx;
      background: #000;
    }
    
    .media-audio-wrapper {
      display: flex;
      align-items: center;
      padding: 32rpx;
      background: rgba(118, 75, 162, 0.08);
      border: 2rpx solid rgba(118, 75, 162, 0.2);
      border-radius: 12rpx;
      
      .audio-icon {
        font-size: 48rpx;
        margin-right: 20rpx;
      }
      
      .audio-name {
        font-size: 28rpx;
        color: #333;
        font-weight: 500;
      }
    }
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

// 浪漫弹窗动画系统
.popup-glass {
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.65);
  border: 2rpx solid rgba(255, 255, 255, 0.8);
  box-shadow: 
    0 20rpx 60rpx rgba(102, 126, 234, 0.2),
    0 8rpx 24rpx rgba(0, 0, 0, 0.1);
}

// 缩放进入动画
.zoom-in-enter {
  transform: scale(0.8);
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.zoom-in-enter-active {
  transform: scale(1);
  opacity: 1;
}

.zoom-in-leave {
  transform: scale(1);
  opacity: 1;
  transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.zoom-in-leave-active {
  transform: scale(0.9);
  opacity: 0;
}

// 滑动进入动画
.slide-up-enter {
  transform: translateY(100rpx);
  opacity: 0;
  transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.slide-up-enter-active {
  transform: translateY(0);
  opacity: 1;
}

.slide-up-leave {
  transform: translateY(0);
  opacity: 1;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.slide-up-leave-active {
  transform: translateY(50rpx);
  opacity: 0;
}

// 浪漫质感增强
.romantic-content {
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      45deg,
      transparent 30%,
      rgba(255, 107, 157, 0.1) 50%,
      transparent 70%
    );
    animation: romantic-shimmer 3s ease-in-out infinite;
    pointer-events: none;
  }
}

@keyframes romantic-shimmer {
  0% {
    transform: translateX(-100%) translateY(-100%) rotate(45deg);
  }
  50% {
    transform: translateX(-50%) translateY(-50%) rotate(45deg);
  }
  100% {
    transform: translateX(100%) translateY(100%) rotate(45deg);
  }
}

// 锚点弹窗样式
.anchor-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;

  &.glass-blur {
    backdrop-filter: blur(15px);
    background: rgba(0, 0, 0, 0.3);
  }
}

.anchor-popup-content {
  width: 90%;
  max-height: 80vh;
  background: white;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.2);

  &.popup-glass {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(20px);
  }
}

.anchor-popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(255, 107, 157, 0.1));
}

.anchor-popup-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.anchor-popup-close {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 50%;
  font-size: 28rpx;
  color: #666;
}

.anchor-popup-body {
  max-height: 60vh;
  padding: 32rpx;
}

.popup-text-block {
  .popup-text-item {
    margin-bottom: 16rpx;
    line-height: 1.8;
  }
}

.popup-image-block {
  .popup-image {
    width: 100%;
    border-radius: 12rpx;
    margin-bottom: 16rpx;
  }
}

.popup-media-block {
  .popup-media-item {
    margin-bottom: 24rpx;

    .media-title {
      font-size: 28rpx;
      font-weight: 500;
      color: #333;
      margin-bottom: 12rpx;
      display: block;
    }

    .popup-video {
      width: 100%;
      border-radius: 12rpx;
    }
  }
}

// 毛玻璃弹窗容器
.glass-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 40rpx;
}

.glass-content {
  max-width: 90%;
  max-height: 80%;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 32rpx;
  padding: 40rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.8);
  box-shadow: 
    0 32rpx 80rpx rgba(102, 126, 234, 0.25),
    0 12rpx 32rpx rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2rpx;
    background: linear-gradient(90deg, 
      transparent,
      rgba(255, 107, 157, 0.6),
      rgba(116, 185, 255, 0.6),
      transparent
    );
  }

  .glass-text {
    font-size: 32rpx;
    line-height: 1.8;
    color: #2d3436;
    text-align: center;
  }

  .glass-close {
    position: absolute;
    top: 20rpx;
    right: 20rpx;
    width: 60rpx;
    height: 60rpx;
    background: rgba(255, 107, 157, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24rpx;
    color: #e84393;
    font-weight: 600;
    backdrop-filter: blur(10px);
  }
}

// ==================== 扑克牌翻转效果 ====================
/* 扑克牌容器 */
.poker-card-container {
  perspective: 1500rpx;
  -webkit-perspective: 1500rpx;
  margin: 30rpx 0;
  cursor: pointer;

  .poker-card-inner {
    position: relative;
    width: 100%;
    min-height: 300rpx;
    /* 增加旋转圈数: 180deg (半圈) -> 540deg (一圈半) */
    transition: transform 2.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    -webkit-transition: -webkit-transform 2.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    transform-style: preserve-3d;
    -webkit-transform-style: preserve-3d;
    color: #fff;
    &.is-flipped {
      transform: rotateY(540deg);
      -webkit-transform: rotateY(540deg);
    }
  }

  .card-front, .card-back {
    width: 100%;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    border-radius: 24rpx;
    box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.15);
  }

  /* 扑克正面：内容展示 */
  .card-front {
    transform: rotateY(540deg); /* 初始状态与 inner 抵消 */
    -webkit-transform: rotateY(540deg);
  }

  /* 扑克背面：高级感设计 */
  .card-back {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    z-index: 2;
    background-color: #1a1a1a; /* 深色底底 */
    /* 精致的几何网格背景 */
    background-image: 
      radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.1) 0%, transparent 60%),
      repeating-conic-gradient(#2a2a2a 0% 25%, #1a1a1a 0% 50%) 0% 0% / 40rpx 40rpx;
    border: 6rpx solid #d4af37; /* 经典金边 */
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    /* 内部装饰装饰框 */
    &::before {
      content: '';
      position: absolute;
      top: 20rpx;
      left: 20rpx;
      right: 20rpx;
      bottom: 20rpx;
      border: 2rpx solid rgba(212, 175, 55, 0.4);
      border-radius: 12rpx;
      pointer-events: none;
    }

    /* 中心图标装饰 */
    .card-back-logo {
      width: 120rpx;
      height: 120rpx;
      background: linear-gradient(135deg, #d4af37, #f9f295, #b8860b);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 30rpx rgba(212, 175, 55, 0.5);
      
      .logo-icon {
        font-size: 60rpx;
        filter: drop-shadow(0 2rpx 4rpx rgba(0,0,0,0.3));
      }
    }
    
    /* 四角的装饰细节 - 使用单独元素 */
    .card-corner-suits {
      position: absolute;
      bottom: 10rpx;
      right: 15rpx;
      font-size: 20rpx;
      color: rgba(212, 175, 55, 0.6);
      letter-spacing: 4rpx;
    }
    
    /* 扫光流光效果 */
    .card-shine {
      position: absolute;
      top: 0;
      left: -100%;
      width: 50%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.1) 50%,
        transparent 100%
      );
      animation: shine-sweep 3s ease-in-out infinite;
      pointer-events: none;
    }
  }
}

/* 扫光动画 */
@keyframes shine-sweep {
  0% {
    left: -100%;
  }
  50% {
    left: 150%;
  }
  100% {
    left: 150%;
  }
}

@keyframes pulse-hint {
  0%, 100% {
    opacity: 0.9;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(0.95);
  }
}

// ==================== 智能主题融合样式 ====================

/* 共享的内容块基础过渡效果 */
.content-block {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-sizing: border-box;
}

/* 1. 唯美毛玻璃 (romantic-glass) 主题 */
.theme-romantic-glass {
  .content-block:not(.has-block-style):not(.is-popup-source) {
    background: rgba(255, 255, 255, 0.45);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1rpx solid rgba(255, 255, 255, 0.55);
    border-radius: 20rpx;
    box-shadow: 0 10rpx 35rpx rgba(102, 126, 234, 0.04);
    margin-bottom: 24rpx;
    padding: 24rpx;
    
    &:active {
      transform: translateY(2rpx) scale(0.99);
    }
  }
}

/* 2. 趣味卡牌/黑金 (cyber-poker) 主题 */
.theme-cyber-poker {
  color: #ffffff;
  
  .content-block:not(.has-block-style):not(.is-popup-source) {
    background: rgba(26, 26, 26, 0.8);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1rpx solid rgba(212, 175, 55, 0.25);
    border-radius: 24rpx;
    box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.35);
    margin-bottom: 28rpx;
    padding: 26rpx;
    
    &.is-popup-source {
      box-shadow: 0 0 35rpx rgba(212, 175, 55, 0.2);
    }
    
    &:active {
      transform: translateY(1rpx) scale(0.995);
    }
  }
  
  // 调整文字颜色使其符合高对比度黑金风格
  .text-preview, .markdown-body p, .markdown-body li {
    color: #e2e8f0 !important;
  }
  
  .link-text {
    color: #f9f295 !important;
    border-bottom: 1rpx dashed #d4af37 !important;
  }
  
  // 路径/时间轴块在黑金下的微调
  .route-name {
    color: #f9f295 !important;
  }
  .route-desc {
    color: #cbd5e1 !important;
  }
  .route-dot {
    background: #d4af37 !important;
    box-shadow: 0 0 12rpx rgba(212, 175, 55, 0.6) !important;
  }
  .route-line {
    background-color: rgba(212, 175, 55, 0.3) !important;
  }
}

/* 3. 优雅简约 (elegant-minimal) 主题 */
.theme-elegant-minimal {
  .content-block:not(.has-block-style):not(.is-popup-source) {
    background: #ffffff;
    border-radius: 16rpx;
    border: 1rpx solid #f1f3f5;
    box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.02);
    margin-bottom: 20rpx;
    padding: 24rpx;
    
    &:active {
      transform: translateY(1rpx);
    }
  }
}
</style>
