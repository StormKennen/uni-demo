<template>
  <view class="container">
    <NavBar
      always-title
      :title="pageTitle"
      custom-class="light"
      :custom-style="{ backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }"
    />
    
    <!-- 操作行：游客警告 + 历史入口（审核模式下隐藏历史入口） -->
    <view class="header-actions">
      <view class="guest-warning" v-if="!isLoggedIn && !isAuditMode">
        <text>⚠️ 未登录，草稿将在刷新后清除</text>
      </view>
      <view class="history-link" @click="goToHistory" v-if="isLoggedIn && !isAuditMode">
        <text class="icon">📂</text>
        <text>我的草稿</text>
      </view>
    </view>
    
    <scroll-view 
      class="draft-list" 
      scroll-y 
      :scroll-top="scrollTop"
      :scroll-with-animation="true"
    >
      <!-- 加载中 -->
      <view v-if="isLoadingHistory" class="loading-history">
        <view class="loading-dots">
          <view class="dot"></view>
          <view class="dot"></view>
          <view class="dot"></view>
        </view>
        <text>加载素材中...</text>
      </view>
      
      <!-- 欢迎区域 -->
      <view v-else-if="messages.length === 0 && isOwner" class="welcome-section">
        <view class="welcome-icon">📝</view>
        <text class="welcome-title">个人笔记收藏</text>
        <text class="welcome-desc">记录您的灵感与想法，整理个人笔记，随时查阅收藏内容。</text>
        <view class="welcome-tips">
          <view class="tip-item" @click="sendQuickMessage('帮我整理一份工作日志大纲')">
            <text>📋 工作日志记录</text>
          </view>
          <view class="tip-item" @click="sendQuickMessage('整理一下关于健康饮食的知识要点')">
            <text>📚 日常随笔记录</text>
          </view>
        </view>
      </view>
      
      <!-- 内容卡片列表 -->
      <view 
        v-for="(msg, index) in messages" 
        :key="index" 
        class="content-card"
      >
        <!-- 用户需求卡片 -->
        <view v-if="msg.role === 'user'" class="requirement-card">
          <view class="card-header">
            <text class="card-label">📌 需求记录</text>
            <text class="card-index">#{{ Math.floor(index/2) + 1 }}</text>
          </view>
          <view class="card-body">
            <text class="requirement-text">{{ msg.content }}</text>
          </view>
        </view>
        
        <!-- 素材结果卡片 -->
        <view v-else class="result-card">
          <view class="card-header">
            <text class="card-label">📄 素材内容</text>
            <view class="card-actions">
              <text class="action-btn" @click="copyResponse(msg.content)">复制</text>
            </view>
          </view>
          <view class="card-body">
            <rich-text 
              :nodes="formatMarkdown(msg.content)" 
              class="markdown-content"
            />
          </view>
        </view>
      </view>
      
      <!-- 加载中状态 -->
      <view v-if="isLoading" class="content-card">
        <view class="result-card loading">
          <view class="card-header">
            <text class="card-label">📄 素材整理中</text>
          </view>
          <view class="card-body">
            <view class="loading-dots">
              <view class="dot"></view>
              <view class="dot"></view>
              <view class="dot"></view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 底部占位 -->
      <view class="bottom-placeholder"></view>
    </scroll-view>
    
    <!-- 输入区域 - 仅创建者可见 -->
    <view v-if="isOwner" class="input-area">
      <view class="input-wrapper">
        <textarea 
          v-model="inputText" 
          class="input-field"
          :placeholder="inputPlaceholder"
          :auto-height="true"
          :maxlength="2000"
          :disabled="isLoading"
          @confirm="sendMessage"
        />
      </view>
      <view 
        class="send-btn" 
        :class="{ disabled: !inputText.trim() || isLoading }"
        @click="sendMessage"
      >
        <text v-if="isLoading">⏳</text>
        <text v-else>{{ submitBtnText }}</text>
      </view>
    </view>
    
    <!-- 只读模式提示 -->
    <view v-else class="read-only-bar" @click="createNewChat">
      <text class="read-only-text">当前为预览模式</text>
      <view class="read-only-btn">
        <text>新建草稿</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { postGeminiChat, getGeminiSessionId, postGeminiSession, getGeminiAuditStatus } from '@/services/apifox/NODEJSDEMO/GEMINI/apifox';
import { onLoad, onShow, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { ref, nextTick, computed } from 'vue'
import NavBar from '@/components/nav-bar.vue'

interface ContentBlock {
  role: 'user' | 'model'
  content: string
}

// API 基础 URL
const baseUrl = import.meta.env.VITE_APP_BASE_URL

// 状态
const messages = ref<ContentBlock[]>([])
const inputText = ref('')
const isLoading = ref(false)
const isLoadingHistory = ref(false)
const scrollTop = ref(0)
const currentChatId = ref<string | null>(null)
const sessionTitle = ref('')
const isOwner = ref(true) // 默认为创建者
const isLoggedIn = ref(false) // 登录状态
const isAuditMode = ref(false) // 审核模式状态

// 动态标题
const pageTitle = computed(() => isAuditMode.value ? '笔记收藏' : '个人笔记收藏')
// 动态输入框占位符
const inputPlaceholder = computed(() => isAuditMode.value ? '搜索我的记录...' : '输入关键词，查找我的记录...')
// 动态按钮文案
const submitBtnText = computed(() => isAuditMode.value ? '搜索' : '整理')

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

// 获取审核模式状态
const fetchAuditStatus = async () => {
  try {
    const res: any = await getGeminiAuditStatus()
    isAuditMode.value = res.isAuditMode || false
  } catch (error) {
    console.error('获取审核状态失败:', error)
    isAuditMode.value = false
  }
}

// 页面加载
onLoad((options: any) => {
  checkLoginStatus()
  fetchAuditStatus()
  
  if (options.chatId) {
    currentChatId.value = options.chatId
    loadHistory(options.chatId)
  }
})

// 页面显示时检查登录状态
onShow(() => {
  checkLoginStatus()
})

// 加载历史消息
const loadHistory = async (chatId: string) => {
  isLoadingHistory.value = true
  try {
    const data: any = await getGeminiSessionId(chatId)
    messages.value = data.messages || []
    sessionTitle.value = data.session?.title || ''
    isOwner.value = data.isOwner !== false // 默认为 true
    scrollToBottom()
  } catch (error) {
    console.error('加载历史消息失败:', error)
  } finally {
    isLoadingHistory.value = false
  }
}

// 发送消息
const sendMessage = async () => {
  const text = inputText.value.trim()
  if (!text || isLoading.value || !isOwner.value) return
  
  // 添加用户消息
  messages.value.push({
    role: 'user',
    content: text
  })
  
  inputText.value = ''
  isLoading.value = true
  scrollToBottom()
  
  try {
    // 构建历史对话
    const history = messages.value.slice(0, -1).map(msg => ({
      role: msg.role,
      content: msg.content
    }))
    
    const token = getToken()
    
    // 调用后端 API
    const data: any = await postGeminiChat({
      chatId: currentChatId.value,
      history,
      prompt: text
    })
    // 更新 chatId（首次发送时会自动创建）
    if (data.chatId && !currentChatId.value) {
      currentChatId.value = data.chatId
    }
    
    // 添加系统回复
    messages.value.push({
      role: 'model',
      content: data.content
    })
  } catch (error: any) {
    console.error('搜索消息失败:', error)
    messages.value.push({
      role: 'model',
      content: `❌ 请求失败: ${error.message || '未知错误'}`
    })
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

// 快捷消息
const sendQuickMessage = (text: string) => {
  if (!isOwner.value) return
  inputText.value = text
  sendMessage()
}

// 跳转到历史会话列表
const goToHistory = () => {
  uni.navigateTo({
    url: '/subPackages/tools/chat/list'
  })
}

// 创建新对话（只读模式下使用）
const createNewChat = () => {
  uni.redirectTo({
    url: '/subPackages/tools/chat/index'
  })
}

// 微信分享
onShareAppMessage(() => {
  // 游客或空草稿：分享首页
  if (!isLoggedIn.value || !currentChatId.value) {
    return {
      title: '个人笔记收藏工具',
      path: '/subPackages/tools/chat/index'
    }
  }
  
  // 已登录且有记录：分享当前草稿
  const firstUserMessage = messages.value.find(m => m.role === 'user')
  const shareTitle = firstUserMessage 
    ? firstUserMessage.content.slice(0, 30) + (firstUserMessage.content.length > 30 ? '...' : '')
    : sessionTitle.value || '我的笔记'
  
  return {
    title: shareTitle,
    path: `/subPackages/tools/chat/index?chatId=${currentChatId.value}`
  }
})

// 分享到朋友圈
onShareTimeline(() => {
  if (!isLoggedIn.value || !currentChatId.value) {
    return {
      title: '个人笔记收藏工具',
      query: ''
    }
  }
  
  return {
    title: sessionTitle.value || '我的笔记',
    query: `chatId=${currentChatId.value}`
  }
})

// 复制回复内容
const copyResponse = (text: string) => {
  if (!text) return;
  
  // 微信小程序特有处理：过滤掉一些可能引起乱码的特殊字符
  const cleanText = text.replace(/<[^>]*>/g, ''); // 如果你想复制纯文本
  
  uni.setClipboardData({
    data: text, // 保持原样复制 Markdown，或者用 cleanText 复制纯文本
    showToast: false, // 关闭系统默认的“已复制”提示，用我们自定义的更好看
    success: () => {
      // 增加一个微小的震动反馈，提升手感
      uni.vibrateShort({});
      uni.showToast({
        title: '内容已复制',
        icon: 'success',
        duration: 1500
      });
    },
    fail: (err) => {
      console.error('复制失败：', err);
      uni.showToast({
        title: '复制失败，请重试',
        icon: 'none'
      });
    }
  });
};

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    scrollTop.value = scrollTop.value === 99999 ? 100000 : 99999
  })
}

// 格式化 Markdown 为 HTML (针对小程序 rich-text 深度优化版)
const formatMarkdown = (text: string): string => {
  if (!text) return ''
  
  let html = text
  
  // 1. 处理代码块 (增加深色背景和内边距)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const escapedCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;')
    return `<pre style="background:#1e1e1e; color:#d4d4d4; padding:15px; border-radius:12px; margin:15px 0; overflow-x:auto; font-family:monospace; font-size:12px; line-height:1.5;"><code>${escapedCode}</code></pre>`
  })
  
  // 2. 处理表格 (核心优化：增加外层滚动容器防止撑破气泡)
  html = html.replace(/(\|.+\|[\r\n]+\|[-:| ]+\|[\r\n]+(?:\|.+\|[\r\n]*)+)/g, (table) => {
    const rows = table.trim().split('\n').filter(row => row.trim())
    if (rows.length < 2) return table
    
    // 使用 div 包装 table 实现横向滚动
    let tableHtml = '<div style="overflow-x:auto; -webkit-overflow-scrolling:touch; margin:20rpx 0; border:1rpx solid #e8eaed; border-radius:12rpx;">'
    tableHtml += '<table style="width:100%; border-collapse:collapse; font-size:12px; min-width:500rpx; background:#ffffff;">'
    
    rows.forEach((row, index) => {
      // 过滤掉 Markdown 的分隔行 (|---|---|)
      if (row.match(/^\|\s*[-:| ]+\s*\|$/)) return
      
      const cells = row.split('|').filter((cell, i, arr) => i > 0 && i < arr.length - 1)
      const isHeader = index === 0
      const tag = isHeader ? 'th' : 'td'
      
      // 样式定制：表头浅灰色背景，内容行底部细边框
      const style = isHeader 
        ? 'background-color:#f8f9fa; font-weight:600; color:#202124; border-bottom:2rpx solid #e8eaed;' 
        : 'border-bottom:1rpx solid #f1f3f4; color:#3c4043;'
      
      tableHtml += '<tr>'
      cells.forEach(cell => {
        tableHtml += `<${tag} style="${style} padding:12px 8px; text-align:left;">${cell.trim()}</${tag}>`
      })
      tableHtml += '</tr>'
    })
    
    tableHtml += '</table></div>'
    return tableHtml
  })
  
  // 3. 处理行内代码
  html = html.replace(/`([^`]+)`/g, '<code style="background:#f1f3f4; color:#d93025; padding:2rpx 8rpx; border-radius:6rpx; font-family:monospace; margin:0 4rpx;">$1</code>')
  
  // 4. 处理标题 (增加边距和层级感)
  html = html.replace(/^### (.+)$/gm, '<h3 style="margin:20rpx 0 10rpx 0; font-size:30rpx; font-weight:600; color:#202124;">$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2 style="margin:25rpx 0 12rpx 0; font-size:34rpx; font-weight:600; color:#202124; border-left:8rpx solid #1a73e8; padding-left:16rpx;">$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1 style="margin:30rpx 0 15rpx 0; font-size:38rpx; font-weight:600; color:#202124;">$1</h1>')
  
  // 5. 列表处理
  html = html.replace(/^- (.+)$/gm, '<div style="margin:10rpx 0; padding-left:20rpx; color:#3c4043; display:flex;"><span style="margin-right:12rpx;">•</span><span>$1</span></div>')
  html = html.replace(/^(\d+)\. (.+)$/gm, '<div style="margin:10rpx 0; padding-left:20rpx; color:#3c4043; display:flex;"><span style="margin-right:12rpx;">$1.</span><span>$2</span></div>')
  
  // 6. 基础样式优化：加粗、斜体、引用
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight:600; color:#202124;">$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em style="font-style:italic;">$1</em>')
  html = html.replace(/^> (.+)$/gm, '<div style="border-left:8rpx solid #dfe1e5; padding-left:24rpx; color:#5f6368; margin:15rpx 0; font-style:italic;">$1</div>')

  // 7. 处理换行 (必须放在最后，且避免破坏已生成的标签)
  // 仅对非标签包裹的纯文本换行进行处理
  html = html.replace(/\n/g, '<br/>')
  
  return html
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.draft-list {
  flex: 1;
  padding: 24rpx;
  padding-bottom: 0;
  box-sizing: border-box;
}

// 欢迎区域
.welcome-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 40rpx;
}

.welcome-icon {
  font-size: 120rpx;
  margin-bottom: 24rpx;
}

.welcome-title {
  font-size: 40rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
}

.welcome-desc {
  font-size: 28rpx;
  color: #666;
  text-align: center;
  line-height: 1.6;
  margin-bottom: 48rpx;
}

.welcome-tips {
  width: 100%;
}

.tip-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx 32rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
  
  text {
    font-size: 28rpx;
    color: #333;
  }
}

// 内容卡片
.content-card {
  margin-bottom: 24rpx;
}

.requirement-card,
.result-card {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.requirement-card {
  border-left: 6rpx solid #667eea;
  margin-bottom: 16rpx;
}

.result-card {
  border-left: 6rpx solid #52c41a;
  
  &.loading {
    border-left-color: #faad14;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 24rpx;
  background: #fafafa;
  border-bottom: 1rpx solid #f0f0f0;
}

.card-label {
  font-size: 24rpx;
  color: #666;
  font-weight: 500;
}

.card-index {
  font-size: 22rpx;
  color: #999;
}

.card-actions {
  display: flex;
  gap: 16rpx;
  
  .action-btn {
    font-size: 24rpx;
    color: #1a73e8;
    padding: 4rpx 12rpx;
    background: #e8f0fe;
    border-radius: 8rpx;
    
    &:active {
      background: #d2e3fc;
    }
  }
}

.card-body {
  padding: 24rpx;
}

.requirement-text {
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
  word-break: break-word;
}

// Markdown 内容样式
.markdown-content {
  font-size: 28rpx;
  line-height: 1.6;
  
  :deep(h1), :deep(h2), :deep(h3) {
    margin: 16rpx 0;
    font-weight: 600;
  }
  
  :deep(h1) { font-size: 36rpx; }
  :deep(h2) { font-size: 32rpx; }
  :deep(h3) { font-size: 30rpx; }
  
  :deep(code) {
    background: #f0f0f0;
    padding: 4rpx 12rpx;
    border-radius: 8rpx;
    font-family: monospace;
    font-size: 26rpx;
  }
  
  :deep(pre) {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 24rpx;
    border-radius: 12rpx;
    overflow-x: auto;
    margin: 16rpx 0;
    
    code {
      background: transparent;
      padding: 0;
      color: inherit;
    }
  }
  
  :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 16rpx 0;
    font-size: 26rpx;
  }
  
  :deep(th), :deep(td) {
    border: 1rpx solid #e0e0e0;
    padding: 16rpx;
    text-align: left;
  }
  
  :deep(th) {
    background: #f5f5f5;
    font-weight: 600;
  }
  
  :deep(li) {
    margin: 8rpx 0;
  }
  
  :deep(strong) {
    font-weight: 600;
  }
  
  :deep(em) {
    font-style: italic;
  }
}


// 加载动画
.loading-dots {
  display: flex;
  gap: 8rpx;
}

.dot {
  width: 16rpx;
  height: 16rpx;
  background: #999;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
  
  &:nth-child(1) { animation-delay: -0.32s; }
  &:nth-child(2) { animation-delay: -0.16s; }
}

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

// 底部占位
.bottom-placeholder {
  height: 200rpx;
}

// 输入区域
.input-area {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 24rpx 32rpx calc(32rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: flex-end;
  gap: 16rpx;
}

.input-wrapper {
  flex: 1;
  background: #f5f5f5;
  border-radius: 24rpx;
  padding: 16rpx 24rpx;
}

.input-field {
  width: 100%;
  font-size: 28rpx;
  color: #333;
  min-height: 40rpx;
  max-height: 200rpx;
}

.send-btn {
  width: 120rpx;
  height: 72rpx;
  background: linear-gradient(135deg, #0046B4 0%, #0066FF 100%);
  border-radius: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 28rpx;
  font-weight: 500;
  flex-shrink: 0;
  
  &.disabled {
    background: #ccc;
  }
}

// 导航栏历史按钮
.nav-history {
  padding: 8rpx 16rpx;
  
  text {
    font-size: 28rpx;
    color: #1a73e8;
  }
}

// 加载历史消息
.loading-history {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;
  
  text {
    margin-top: 24rpx;
    font-size: 28rpx;
    color: #999;
  }
}

// 只读模式底部栏
.read-only-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 24rpx 32rpx calc(24rpx + env(safe-area-inset-bottom));
  background: linear-gradient(135deg, #f8f9fa 0%, #e8eaed 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.read-only-text {
  font-size: 26rpx;
  color: #5f6368;
}

.read-only-btn {
  background: linear-gradient(135deg, #1a73e8 0%, #4285f4 100%);
  padding: 16rpx 32rpx;
  border-radius: 32rpx;
  
  text {
    font-size: 26rpx;
    color: #fff;
    font-weight: 500;
  }
}

// 操作行样式
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10rpx 30rpx;
  background: #fff;
  border-bottom: 1rpx solid #eee;
  min-height: 60rpx;

  .guest-warning {
    font-size: 22rpx;
    color: #ff9800;
    background: #fff3e0;
    padding: 8rpx 16rpx;
    border-radius: 8rpx;
    
    text {
      font-size: 22rpx;
    }
  }

  .history-link {
    font-size: 26rpx;
    color: #1a73e8;
    display: flex;
    align-items: center;
    margin-left: auto;
    
    .icon { 
      margin-right: 8rpx; 
    }
  }
}
</style>
