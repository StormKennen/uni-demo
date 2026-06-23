<template>
  <view class="markdown-page">
    <NavBar
      always-title
      title="Markdown 转 HTML"
      custom-class="light"
      :custom-style="{ backgroundImage: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' }"
    />

    <view class="content">
      <view class="card input-card">
        <view class="card-header">
          <text class="card-title">Markdown 输入</text>
          <view class="actions">
            <button class="ghost-btn" @click="insertSample">插入示例</button>
            <button class="ghost-btn" @click="clearContent">清空</button>
          </view>
        </view>
        <textarea
          class="markdown-input"
          v-model="markdownContent"
          placeholder="在此粘贴或编写 Markdown 文本"
          :auto-height="false"
        ></textarea>
        <view class="stats">
          <text>字数 {{ textStats.chars }}</text>
          <text>行数 {{ textStats.lines }}</text>
        </view>
      </view>

      <view class="card tabs-card">
        <view class="tab-bar">
          <view
            v-for="tab in tabs"
            :key="tab.value"
            class="tab-item"
            :class="{ active: activeTab === tab.value }"
            @click="activeTab = tab.value"
          >{{ tab.label }}</view>
        </view>

        <view class="tab-content" v-if="activeTab === 'preview'">
          <view class="preview-toolbar">
            <text>实时预览（已做基础 XSS 过滤）</text>
            <view class="preview-options">
              <label class="switch">
                <text>深色背景</text>
                <switch :checked="darkPreview" @change="togglePreviewTheme" color="#a18cd1" />
              </label>
            </view>
          </view>
          <view class="preview-box" :class="{ dark: darkPreview }">
            <!-- #ifdef H5 -->
            <div class="preview-html" v-html="safeHtml"></div>
            <!-- #endif -->
            <!-- #ifndef H5 -->
            <rich-text class="preview-html" :nodes="safeHtml" />
            <!-- #endif -->
          </view>
        </view>

        <view class="tab-content" v-else>
          <view class="code-header">
            <text>HTML 源码</text>
            <view class="code-actions">
              <button class="ghost-btn" @click="copyHtml" :disabled="!safeHtml">复制 HTML</button>
              <button class="ghost-btn" @click="downloadHtml" :disabled="!safeHtml">下载 .html</button>
            </view>
          </view>
          <scroll-view scroll-y class="code-box">
            <text selectable>{{ formattedHtml }}</text>
          </scroll-view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { reportToolVisit } from '@/utils/tracker'
import { marked } from 'marked'
import NavBar from '@/components/nav-bar.vue'

onShow(() => {
  reportToolVisit('markdown')
})

marked.setOptions({ gfm: true, breaks: true })

const markdownContent = ref(`# Markdown 转 HTML 工具

- 支持实时预览
- 可复制或下载 HTML

> 欢迎体验凉白开工具箱！`)
const activeTab = ref<'preview' | 'html'>('preview')
const darkPreview = ref(false)

const tabs = [
  { label: '预览', value: 'preview' as const },
  { label: 'HTML 源码', value: 'html' as const }
]

const sanitizeHtml = (html: string) => {
  if (!html) return ''
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/on[a-z]+\s*=\s*"[^"]*"/gi, '')
    .replace(/on[a-z]+\s*=\s*'[^']*'/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:text\/html/gi, 'data:')
}

const safeHtml = computed(() => {
  try {
    const raw = marked.parse(markdownContent.value || '') as string
    return sanitizeHtml(raw)
  } catch (err) {
    console.error('Markdown parse error', err)
    return ''
  }
})

const formattedHtml = computed(() => {
  if (!safeHtml.value) return ''
  return safeHtml.value.replace(/></g, '><\n<')
})

const textStats = computed(() => {
  const text = markdownContent.value || ''
  return {
    chars: text.length,
    lines: text.split(/\n/).length
  }
})

const clearContent = () => {
  markdownContent.value = ''
}

const insertSample = () => {
  markdownContent.value = `# 凉白开工具箱 Markdown 示例

> 为运营/产品/开发提供的一站式小工具集合

## 支持特性
- **实时预览** markdown
- 自动生成 HTML 代码
- 一键复制 / 下载

## 技巧
1. 使用 \`code\` 表示行内代码
2. 使用 \` \`\`\`js ... \`\`\` \` 显示多行代码

### 表格
| 工具 | 功能 |
| --- | --- |
| 图片加水印 | 文字/贴纸叠加 |
| Markdown 转 HTML | 输入即得 |
`
}

const togglePreviewTheme = (event: any) => {
  darkPreview.value = !!event.detail?.value
}

const copyHtml = () => {
  if (!safeHtml.value) return
  uni.setClipboardData({
    data: safeHtml.value,
    success: () => {
      uni.showToast({ title: '已复制 HTML', icon: 'success' })
    }
  })
}

const downloadHtml = () => {
  if (!safeHtml.value) return
  // #ifdef H5
  const blob = new Blob([safeHtml.value], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'markdown.html'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  // #endif
  // #ifndef H5
  uni.showToast({ title: '请复制 HTML 后在 H5 下载', icon: 'none' })
  // #endif
}
</script>

<style scoped lang="scss">
.markdown-page {
  min-height: 100vh;
  background: #f7f5fb;
}

.content {
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.card {
  background: #fff;
  border-radius: 24rpx;
  padding: 28rpx;
  box-shadow: 0 10rpx 30rpx rgba(24, 8, 43, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16rpx;
  flex-wrap: wrap;
}

.card-title {
  font-size: 32rpx;
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 16rpx;
}

.ghost-btn {
  height: 72rpx;
  padding: 0 28rpx;
  border-radius: 18rpx;
  background: #f3e8ff;
  color: #7c3aed;
  border: none;
  font-size: 26rpx;
}

.markdown-input {
  margin-top: 24rpx;
  min-height: 320rpx;
  border: 1rpx solid #e5e7eb;
  border-radius: 18rpx;
  padding: 20rpx;
  font-size: 28rpx;
}

.stats {
  margin-top: 12rpx;
  display: flex;
  gap: 24rpx;
  color: #94a3b8;
  font-size: 24rpx;
}

.tab-bar {
  display: flex;
  gap: 16rpx;
  background: #f5f0ff;
  padding: 12rpx;
  border-radius: 20rpx;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  border-radius: 16rpx;
  font-weight: 600;
  color: #6b7280;
}

.tab-item.active {
  background: #fff;
  color: #7c3aed;
  box-shadow: 0 8rpx 18rpx rgba(124, 58, 237, 0.12);
}

.preview-toolbar,
.code-header {
  margin-top: 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #475569;
}

.preview-box {
  margin-top: 16rpx;
  border: 1rpx solid #eae7ff;
  border-radius: 20rpx;
  padding: 24rpx;
  background: #fff;
  min-height: 320rpx;
}

.preview-box.dark {
  background: #0f172a;
  color: #f8fafc;
  border-color: #1e293b;
}

.preview-html {
  font-size: 28rpx;
  line-height: 1.7;
  color: inherit;
  word-break: break-word;
}

.preview-html h1,
.preview-html h2,
.preview-html h3 {
  margin: 24rpx 0 16rpx;
}

.preview-html pre {
  background: rgba(15, 23, 42, 0.85);
  color: #f1f5f9;
  padding: 20rpx;
  border-radius: 16rpx;
  overflow-x: auto;
}

.code-box {
  margin-top: 16rpx;
  border: 1rpx solid #eae7ff;
  border-radius: 20rpx;
  padding: 24rpx;
  height: 360rpx;
  background: #09090b;
}

.code-box text {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  color: #e2e8f0;
  white-space: pre-wrap;
}

.switch {
  display: flex;
  align-items: center;
  gap: 12rpx;
  font-size: 26rpx;
  color: #6b7280;
}
</style>
