<template>
  <view class="container">
    <NavBar
      always-title
      title="我的草稿"
      custom-class="light"
      :custom-style="{ backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }"
    />
    
    <!-- 未登录状态 -->
    <view v-if="!isLoggedIn" class="login-required">
      <view class="login-icon">🔒</view>
      <text class="login-title">请登录后查看草稿</text>
      <text class="login-desc">登录后可保存和查看所有个人笔记</text>
      <view class="login-btn" @click="goToLogin">
        <text>去登录</text>
      </view>
    </view>
    
    <!-- 会话列表 -->
    <scroll-view 
      v-else
      class="session-list" 
      scroll-y 
      :refresher-enabled="true"
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="loadMore"
    >
      <!-- 空状态 -->
      <view v-if="!isLoading && sessions.length === 0" class="empty-state">
        <view class="empty-icon">📝</view>
        <text class="empty-title">暂无草稿</text>
        <text class="empty-desc">点击下方按钮新建草稿</text>
      </view>
      
      <!-- 会话列表项 -->
      <view 
        v-for="session in sessions" 
        :key="session.id" 
        class="session-item"
        :class="{ 'actions-visible': expandedSessionId === session.id }"
      >
        <!-- 左侧主内容区域 -->
        <view class="session-main" @click="openSession(session.id)">
          <view class="session-icon">📄</view>
          <view class="session-info">
            <view class="session-title-row">
              <text class="session-title">{{ session.title || '新建草稿' }}</text>
              <view v-if="session.isShared" class="shared-tag">
                <text>共享</text>
              </view>
            </view>
            <view class="session-meta">
              <text class="session-count">{{ session.messageCount || 0 }} 条素材</text>
              <text class="session-time">{{ session.updatedAt || session.createdAt }}</text>
            </view>
          </view>
        </view>
        
        <!-- 右侧操作按钮 -->
        <view class="session-actions">
          <view 
            class="action-btn edit" 
            @click.stop="renameSessionDirect(session)"
          >
            <text>编辑</text>
          </view>
          <view 
            class="action-btn delete" 
            @click.stop="deleteSessionDirect(session)"
          >
            <text>删除</text>
          </view>
        </view>
        
        <!-- 展开/收起按钮 -->
        <view 
          class="session-toggle" 
          @click.stop="toggleActions(session.id)"
        >
          <text class="toggle-icon">{{ expandedSessionId === session.id ? '×' : '⋮' }}</text>
        </view>
      </view>
      
      <!-- 加载更多 -->
      <view v-if="isLoadingMore" class="loading-more">
        <text>加载中...</text>
      </view>
      
      <!-- 没有更多 -->
      <view v-if="!hasMore && sessions.length > 0" class="no-more">
        <text>没有更多了</text>
      </view>
      
      <!-- 底部占位 -->
      <view class="bottom-placeholder"></view>
    </scroll-view>
    
    <!-- 新建会话按钮 - 仅登录用户可见 -->
    <view v-if="isLoggedIn" class="fab-btn" @click="createNewSession">
      <text class="fab-icon">+</text>
    </view>
    
    <!-- 操作弹窗 -->
    <uni-popup ref="actionPopup" type="bottom">
      <view class="action-sheet">
        <view class="action-item" @click="renameSession">
          <text class="action-icon">✏️</text>
          <text class="action-text">重命名</text>
        </view>
        <view class="action-item danger" @click="deleteSessionConfirm">
          <text class="action-icon">🗑️</text>
          <text class="action-text">删除</text>
        </view>
        <view class="action-cancel" @click="closeActions">
          <text>取消</text>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup lang="ts">
import { deleteGeminiSessionId, patchGeminiSessionId, getGeminiSessions } from '@/services/apifox/NODEJSDEMO/GEMINI/apifox';

import { ref, onMounted } from 'vue'
import NavBar from '@/components/nav-bar.vue'

interface Session {
  id: string
  title: string
  messageCount: number
  createdAt: string
  updatedAt: string
  isShared?: boolean // 是否为被分享的会话
}

// 状态
const sessions = ref<Session[]>([])
const isLoading = ref(false)
const isRefreshing = ref(false)
const isLoadingMore = ref(false)
const hasMore = ref(true)
const currentPage = ref(1)
const selectedSession = ref<Session | null>(null)
const actionPopup = ref()
const isLoggedIn = ref(false)
const expandedSessionId = ref<string | null>(null) // 当前展开操作的会话 ID

// 切换操作按钮显示
const toggleActions = (sessionId: string) => {
  expandedSessionId.value = expandedSessionId.value === sessionId ? null : sessionId
}

// 直接重命名草稿
const renameSessionDirect = (session: Session) => {
  uni.showModal({
    title: '重命名草稿',
    editable: true,
    placeholderText: '请输入新标题',
    content: session.title,
    success: async (res) => {
      if (res.confirm && res.content) {
        try {
          await patchGeminiSessionId(session.id, { title: res.content })
          uni.showToast({ title: '重命名成功', icon: 'success' })
          expandedSessionId.value = null
          fetchSessions(1, false)
        } catch (error) {
          uni.showToast({ title: '重命名失败', icon: 'none' })
        }
      }
    }
  })
}

// 直接删除草稿
const deleteSessionDirect = (session: Session) => {
  uni.showModal({
    title: '删除草稿',
    content: '确定要删除这个草稿吗？删除后无法恢复。',
    confirmColor: '#ff4444',
    success: async (res) => {
      if (res.confirm) {
        try {
          await deleteGeminiSessionId(session.id)
          uni.showToast({ title: '删除成功', icon: 'success' })
          expandedSessionId.value = null
          fetchSessions(1, false)
        } catch (error) {
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    }
  })
}

// API 基础 URL
const baseUrl = import.meta.env.VITE_APP_BASE_URL

// 获取 Token
const getToken = () => {
  return uni.getStorageSync('token') || ''
}

// 检查登录状态
const checkLoginStatus = () => {
  const token = getToken()
  isLoggedIn.value = !!token
  return !!token
}

// 跳转登录页
const goToLogin = () => {
  uni.navigateTo({
    url: '/pages/mine/login/login'
  })
}

// 获取会话列表
const fetchSessions = async (page = 1, append = false) => {
  try {
    if (page === 1) {
      isLoading.value = true
    } else {
      isLoadingMore.value = true
    }
    
    const token = getToken()
    if (!token) {
      uni.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    
    // const res: any = await new Promise((resolve, reject) => {
    //   uni.request({
    //     url: `${baseUrl}/gemini/sessions?page=${page}&limit=20`,
    //     method: 'GET',
    //     header: {
    //       'Authorization': `Bearer ${token}`
    //     },
    //     success: resolve,
    //     fail: reject
    //   })
    // })
    const data: any = await getGeminiSessions({
      page,
      limit: 20
    })
    
    if (append) {
      sessions.value = [...sessions.value, ...data.results]
    } else {
      sessions.value = data.results
    }
    hasMore.value = data.page < data.totalPages
    currentPage.value = data.page
  } catch (error) {
    console.error('获取会话列表失败:', error)
  } finally {
    isLoading.value = false
    isRefreshing.value = false
    isLoadingMore.value = false
  }
}

// 下拉刷新
const onRefresh = () => {
  isRefreshing.value = true
  currentPage.value = 1
  fetchSessions(1, false)
}

// 加载更多
const loadMore = () => {
  if (!isLoadingMore.value && hasMore.value) {
    fetchSessions(currentPage.value + 1, true)
  }
}

// 打开会话
const openSession = (sessionId: string) => {
  uni.navigateTo({
    url: `/subPackages/tools/chat/index?chatId=${sessionId}`
  })
}

// 创建新会话
const createNewSession = () => {
  uni.navigateTo({
    url: '/subPackages/tools/chat/index'
  })
}

// 显示操作菜单
const showActions = (session: Session) => {
  selectedSession.value = session
  actionPopup.value?.open()
}

// 关闭操作菜单
const closeActions = () => {
  actionPopup.value?.close()
  selectedSession.value = null
}

// 重命名会话
const renameSession = () => {
  closeActions()
  if (!selectedSession.value) return
  
  uni.showModal({
    title: '重命名会话',
    editable: true,
    placeholderText: '请输入新标题',
    content: selectedSession.value.title,
    success: async (res) => {
      if (res.confirm && res.content) {
        try {
          const token = getToken()
          const response: any = await patchGeminiSessionId(selectedSession.value?.id, { title: res.content })
          // const response: any = await new Promise((resolve, reject) => {
          //   uni.request({
          //     url: `${baseUrl}/gemini/session/${selectedSession.value!.id}`,
          //     method: 'PATCH',
          //     header: {
          //       'Authorization': `Bearer ${token}`,
          //       'Content-Type': 'application/json'
          //     },
          //     data: { title: res.content },
          //     success: resolve,
          //     fail: reject
          //   })
          // })
          uni.showToast({ title: '重命名成功', icon: 'success' })
          fetchSessions(1, false)
          // if (response.statusCode === 200) {
          //   uni.showToast({ title: '重命名成功', icon: 'success' })
          //   fetchSessions(1, false)
          // }
        } catch (error) {
          uni.showToast({ title: '重命名失败', icon: 'none' })
        }
      }
    }
  })
}

// 删除会话确认
const deleteSessionConfirm = () => {
  closeActions()
  if (!selectedSession.value) return
  
  uni.showModal({
    title: '删除会话',
    content: '确定要删除这个会话吗？删除后无法恢复。',
    confirmColor: '#ff4444',
    success: async (res) => {
      if (res.confirm) {
        try {
          const token = getToken()
          const response: any = await deleteGeminiSessionId(selectedSession.value?.id)
          // const response: any = await new Promise((resolve, reject) => {
          //   uni.request({
          //     url: `${baseUrl}/gemini/session/${selectedSession.value!.id}`,
          //     method: 'DELETE',
          //     header: {
          //       'Authorization': `Bearer ${token}`
          //     },
          //     success: resolve,
          //     fail: reject
          //   })
          // })
          
          uni.showToast({ title: '删除成功', icon: 'success' })
          fetchSessions(1, false)
        } catch (error) {
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    }
  })
}

// 页面加载
onMounted(() => {
  if (checkLoginStatus()) {
    fetchSessions()
  }
})

// 页面显示时刷新
onShow(() => {
  if (checkLoginStatus()) {
    fetchSessions()
  }
})
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
}

.session-list {
  height: calc(100vh - 88rpx);
  padding: 24rpx;
  box-sizing: border-box;
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 40rpx;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 24rpx;
}

.empty-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 12rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: #999;
}

// 会话列表项
.session-item {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 0;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
}

// 左侧主内容区域
.session-main {
  display: flex;
  align-items: center;
  flex: 1;
  padding: 24rpx;
  padding-right: 80rpx; // 为右侧按钮留空间
  min-width: 0;
  
  &:active {
    background: #f8f8f8;
  }
}

// 右侧操作按钮组
.session-actions {
  display: flex;
  position: absolute;
  right: 60rpx;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
  
  .action-btn {
    padding: 12rpx 20rpx;
    border-radius: 8rpx;
    margin-left: 12rpx;
    
    text {
      font-size: 24rpx;
      font-weight: 500;
    }
    
    &.edit {
      background: #e3f2fd;
      text { color: #1a73e8; }
    }
    
    &.delete {
      background: #ffebee;
      text { color: #d32f2f; }
    }
    
    &:active {
      opacity: 0.7;
    }
  }
}

// 展开/收起按钮
.session-toggle {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .toggle-icon {
    font-size: 36rpx;
    color: #999;
  }
  
  &:active {
    background: #f0f0f0;
  }
}

// 展开状态
.session-item.actions-visible {
  .session-main {
    padding-right: 220rpx; // 展开时为操作按钮留更多空间
  }
  
  .session-actions {
    opacity: 1;
    pointer-events: auto;
  }
  
  .session-toggle .toggle-icon {
    color: #1a73e8;
  }
}

.session-icon {
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #1a73e8 0%, #4285f4 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  flex-shrink: 0;
}

.session-info {
  flex: 1;
  margin-left: 20rpx;
  overflow: hidden;
  min-width: 0;
}

.session-title-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.session-title {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.shared-tag {
  flex-shrink: 0;
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
  
  text {
    font-size: 20rpx;
    color: #fff;
    font-weight: 500;
  }
}

.session-meta {
  display: flex;
  align-items: center;
  margin-top: 8rpx;
  gap: 16rpx;
}

.session-count {
  font-size: 24rpx;
  color: #999;
}

.session-time {
  font-size: 24rpx;
  color: #bbb;
}

// 加载状态
.loading-more, .no-more {
  text-align: center;
  padding: 24rpx;
  
  text {
    font-size: 24rpx;
    color: #999;
  }
}

// 底部占位
.bottom-placeholder {
  height: 160rpx;
}

// 悬浮按钮
.fab-btn {
  position: fixed;
  right: 40rpx;
  bottom: calc(40rpx + env(safe-area-inset-bottom));
  width: 112rpx;
  height: 112rpx;
  background: linear-gradient(135deg, #1a73e8 0%, #4285f4 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(26, 115, 232, 0.4);
  
  &:active {
    transform: scale(0.95);
  }
}

.fab-icon {
  font-size: 56rpx;
  color: #fff;
  font-weight: 300;
}

// 操作弹窗
.action-sheet {
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding-bottom: env(safe-area-inset-bottom);
}

.action-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
  
  &.danger .action-text {
    color: #ff4444;
  }
}

.action-icon {
  font-size: 36rpx;
  margin-right: 16rpx;
}

.action-text {
  font-size: 30rpx;
  color: #333;
}

.action-cancel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
  background: #f8f8f8;
  
  text {
    font-size: 30rpx;
    color: #666;
  }
}

// 未登录状态
.login-required {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 160rpx 60rpx;
  min-height: 60vh;
}

.login-icon {
  font-size: 120rpx;
  margin-bottom: 32rpx;
}

.login-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
}

.login-desc {
  font-size: 26rpx;
  color: #999;
  text-align: center;
  margin-bottom: 48rpx;
}

.login-btn {
  background: linear-gradient(135deg, #1a73e8 0%, #4285f4 100%);
  padding: 24rpx 80rpx;
  border-radius: 48rpx;
  box-shadow: 0 8rpx 24rpx rgba(26, 115, 232, 0.3);
  
  text {
    font-size: 30rpx;
    color: #fff;
    font-weight: 500;
  }
  
  &:active {
    transform: scale(0.98);
  }
}
</style>
