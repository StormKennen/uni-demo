<template>
  <view class="home-page">
    <NavBarBase :nav-back="false" custom-class="home-navbar" :custom-style="{ background: '#667eea' }">
      <template #title>
        <view class="home-navbar-content">
          <image class="navbar-logo" src="/static/logo.png" mode="aspectFit" />
          <text class="navbar-title-single">工具箱</text>
        </view>
      </template>
    </NavBarBase>

    <!-- 最近使用 -->
    <view v-if="recentTools.length > 0" class="section">
      <view class="section-header">
        <text class="section-title">最近使用</text>
        <text class="section-subtitle">RECENT</text>
      </view>
      <view class="recent-grid">
        <view
          v-for="tool in recentTools"
          :key="tool.id"
          class="recent-item"
          @click="handleToolClick(tool)">
          <view class="recent-icon" :style="{ background: tool.gradient }">
            <uni-icons :type="(tool.icon as any)" size="24" color="#fff" />
          </view>
          <text class="recent-name">{{ tool.name }}</text>
        </view>
      </view>
    </view>

    <!-- 全量分类 -->
    <view v-for="cat in visibleCategories" :key="cat.key" class="section">
      <view class="section-header fold-header" @click="toggleCategoryFold(cat.key)">
        <view class="section-header-left">
          <text class="section-title">{{ cat.name }}</text>
          <text class="section-subtitle">{{ cat.subtitle }}</text>
        </view>
        <view class="fold-arrow" :class="{ folded: isFolded(cat.key) }">
          <uni-icons type="down" size="18" color="#999" />
        </view>
      </view>

      <view v-if="!isFolded(cat.key)" class="category-body">
        <!-- 网格布局 -->
        <view v-if="cat.layout === 'grid'" class="tools-grid">
          <view
            v-for="tool in getToolsByCategory(cat.key)"
            :key="tool.id"
            :class="['tool-card', { disabled: tool.disabled }]"
            @click="handleToolClick(tool)">
            <view class="tool-icon-wrapper" :style="{ background: tool.gradient }">
              <uni-icons :type="(tool.icon as any)" size="24" color="#fff" />
            </view>
            <text class="tool-name">{{ tool.name }}</text>
            <text class="tool-desc">{{ tool.desc }}</text>
            <view v-if="tool.isNew" class="new-dot" />
            <view v-if="tool.badge" class="tool-badge">{{ tool.badge }}</view>
          </view>
        </view>

        <!-- 列表布局 -->
        <view v-else class="tools-list">
          <view
            v-for="tool in getToolsByCategory(cat.key)"
            :key="tool.id"
            :class="['tool-list-item', { disabled: tool.disabled }]"
            @click="handleToolClick(tool)">
            <view class="tool-icon-wrapper mini" :style="{ background: tool.gradient }">
              <uni-icons :type="(tool.icon as any)" size="20" color="#fff" />
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
    </view>

    <!-- 底部 -->
    <view class="footer">
      <text class="footer-note">数据本地处理 · 保护您的隐私安全</text>
      <text class="icp-text">粤ICP备2025489016号-2</text>
    </view>

    <!-- #ifdef H5 -->
    <H5TabBar current="index" />
    <!-- #endif -->

    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { onShow } from '@dcloudio/uni-app'
  import { isUserLoggedIn, autoLogin } from '@/utils/autoLogin'
  import { useShare } from '@/utils/share'
  import { getUserInfo } from '@/utils/storage'
  import NavBarBase from '@/components/nav-bar-base.vue'
  import H5TabBar from '@/components/h5-tab-bar.vue'
  import PrivacyPopup from '@/components/privacy-popup.vue'
  import {
    ALL_TOOLS,
    CATEGORIES,
    STORAGE_KEY_RECENT,
    STORAGE_KEY_FOLD_STATUS,
    MAX_RECENT_TOOLS,
  } from '@/config/tools'
  import type { ToolItem } from '@/config/tools'

  declare const uni: any

  // ── 状态 ──

  const currentUserRole = ref(getUserInfo()?.role || '')
  const isAdmin = computed(() => currentUserRole.value === 'admin')
  const recentToolIds = ref<string[]>([])
  const foldStatus = ref<Record<string, boolean>>({})

  // ── 计算属性 ──

  /** 根据角色过滤后的全量工具 */
  const availableTools = computed(() =>
    ALL_TOOLS.filter(t => !t.adminOnly || isAdmin.value),
  )

  /** 可见分类（过滤掉没有工具的分类） */
  const visibleCategories = computed(() =>
    CATEGORIES.filter(cat => getToolsByCategory(cat.key).length > 0),
  )

  /** 最近使用的工具列表（最多 MAX_RECENT_TOOLS 个） */
  const recentTools = computed<ToolItem[]>(() => {
    const toolMap = new Map(availableTools.value.map(t => [t.id, t]))
    return recentToolIds.value
      .map(id => toolMap.get(id))
      .filter((t): t is ToolItem => !!t)
  })

  // ── 工具方法 ──

  function getToolsByCategory(categoryKey: string): ToolItem[] {
    return availableTools.value.filter(t => t.category === categoryKey)
  }

  function isFolded(categoryKey: string): boolean {
    return !!foldStatus.value[categoryKey]
  }

  // ── Storage 读写 ──

  function loadRecentTools() {
    try {
      const data = uni.getStorageSync(STORAGE_KEY_RECENT)
      recentToolIds.value = Array.isArray(data) ? data : []
    } catch {
      recentToolIds.value = []
    }
  }

  function saveRecentTools() {
    try {
      uni.setStorageSync(STORAGE_KEY_RECENT, recentToolIds.value)
    } catch {
      /* 静默 */
    }
  }

  function loadFoldStatus() {
    try {
      const data = uni.getStorageSync(STORAGE_KEY_FOLD_STATUS)
      foldStatus.value = data && typeof data === 'object' ? data : {}
    } catch {
      foldStatus.value = {}
    }
  }

  function saveFoldStatus() {
    try {
      uni.setStorageSync(STORAGE_KEY_FOLD_STATUS, foldStatus.value)
    } catch {
      /* 静默 */
    }
  }

  // ── 核心逻辑 ──

  /** 记录最近使用 */
  function recordRecentTool(toolId: string) {
    const list = [...recentToolIds.value]
    const idx = list.indexOf(toolId)
    if (idx !== -1) list.splice(idx, 1)
    list.unshift(toolId)
    if (list.length > MAX_RECENT_TOOLS) list.length = MAX_RECENT_TOOLS
    recentToolIds.value = list
    saveRecentTools()
  }

  /** 切换分类折叠状态 */
  function toggleCategoryFold(categoryKey: string) {
    foldStatus.value = {
      ...foldStatus.value,
      [categoryKey]: !foldStatus.value[categoryKey],
    }
    saveFoldStatus()
  }

  // ── 点击处理 ──

  const handleToolClick = async (tool: ToolItem) => {
    if (tool.disabled) {
      uni.showToast({ title: '功能开发中，敬请期待', icon: 'none', duration: 2000 })
      return
    }

    recordRecentTool(tool.id)

    if (tool.isWebLink) {
      uni.navigateTo({
        url: `/subPackages/common/webview/h5?path=${encodeURIComponent(tool.path)}&title=${encodeURIComponent(tool.name)}`,
      })
      return
    }

    const needLoginServices = ['/subPackages/tools/memo/list']
    if (needLoginServices.includes(tool.path)) {
      if (!isUserLoggedIn()) {
        uni.showModal({
          title: '需要登录',
          content: '该功能需要登录后才能使用',
          confirmText: '去登录',
          cancelText: '取消',
          success: (res: UniApp.ShowModalRes) => {
            if (res.confirm) {
              uni.navigateTo({
                url: `/pages/mine/login/login?redirectUrl=${encodeURIComponent(tool.path)}`,
              })
            }
          },
        })
        return
      }
    }

    uni.navigateTo({ url: tool.path })
  }

  // ── 生命周期 ──

  const syncCurrentUserRole = () => {
    currentUserRole.value = getUserInfo()?.role || ''
  }

  onMounted(() => {
    syncCurrentUserRole()
    loadRecentTools()
    loadFoldStatus()
  })

  onMounted(async () => {
    try {
      await autoLogin()
    } catch {
      /* 静默 */
    }
  })

  onShow(() => {
    syncCurrentUserRole()
    loadRecentTools()
  })

  // ── 分享 ──

  const { onShareAppMessage, onShareTimeline } = useShare('index', {
    title: '工具箱 - 高效实用的工具集合',
    path: '/pages/index/index',
  })

  defineExpose({ onShareAppMessage, onShareTimeline })
</script>

<style lang="scss" scoped>
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
    overflow-x: hidden;

    /* #ifdef H5 */
    padding-bottom: 140rpx;
    /* #endif */
  }

  .home-navbar-content {
    display: flex;
    align-items: center;
    gap: 16rpx;

    .navbar-logo {
      width: 56rpx;
      height: 56rpx;
      border-radius: 12rpx;
    }

    .navbar-title-single {
      font-size: 32rpx;
      font-weight: 700;
      color: #fff;
      letter-spacing: 1rpx;
    }
  }

  // ── 通用区块 ──
  .section {
    padding: 28rpx 32rpx 8rpx;
  }

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

  // ── 折叠头部 ──
  .fold-header {
    cursor: pointer;

    .section-header-left {
      display: flex;
      align-items: center;
      gap: 16rpx;
    }
  }

  .fold-arrow {
    transition: transform 0.3s ease;
  }

  .fold-arrow.folded {
    transform: rotate(-90deg);
  }

  // ── 最近使用 ──
  .recent-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20rpx;
  }

  .recent-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12rpx;
    padding: 20rpx 8rpx;
    border-radius: $radius-md;
    background: $card-bg;
    box-shadow: $shadow-sm;
    transition: all 0.2s ease;

    &:active {
      transform: scale(0.95);
      box-shadow: $shadow-md;
    }
  }

  .recent-icon {
    width: 80rpx;
    height: 80rpx;
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .recent-name {
    font-size: 24rpx;
    font-weight: 500;
    color: $text-primary;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
  }

  // ── 分类内容区 ──
  .category-body {
    animation: fadeIn 0.25s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-8rpx); }
    to { opacity: 1; transform: translateY(0); }
  }

  // ── 网格工具卡片 ──
  .tools-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24rpx;
  }

  .tool-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 36rpx 24rpx;
    background: $card-bg;
    border-radius: $radius-md;
    box-shadow: $shadow-sm;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;

    &:active {
      transform: scale(0.96);
      box-shadow: $shadow-md;
    }

    &.disabled {
      opacity: 0.5;

      &:active {
        transform: none;
      }
    }

    .tool-icon-wrapper {
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

    .new-dot {
      position: absolute;
      top: 16rpx;
      right: 16rpx;
      width: 16rpx;
      height: 16rpx;
      border-radius: 50%;
      background: #ff4d4f;
    }

    .tool-badge {
      position: absolute;
      top: 0;
      right: 0;
      padding: 6rpx 16rpx;
      background: linear-gradient(135deg, #ff6b6b, #ee5a24);
      color: #fff;
      font-size: 18rpx;
      font-weight: 600;
      border-radius: 0 $radius-md 0 $radius-sm;
    }
  }

  // ── 列表工具 ──
  .tools-list {
    background: $card-bg;
    border-radius: $radius-md;
    box-shadow: $shadow-sm;
    overflow: hidden;
  }

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

    &.disabled {
      opacity: 0.6;

      &:active {
        background: transparent;
      }
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
  }

  .login-badge {
    color: #999;
    font-size: 22rpx;
  }

  // ── 底部 ──
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
</style>
