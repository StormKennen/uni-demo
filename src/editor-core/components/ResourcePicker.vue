<!--
  ResourcePicker —— 通用资源选择弹窗
  
  两种模式（Tab 切换）：
    1. 云端选择：调用 getFiles API 获取云端文件列表
    2. 外链输入：手动输入 URL
  
  Props：
    - visible：控制弹窗显示
    - accept：过滤文件类型 'image' | 'video' | 'audio' | 'all'
    - title：弹窗标题
  
  Events：
    - update:visible：关闭弹窗
    - confirm：选中资源 { url, name?, size? }
-->
<template>
  <view v-if="visible" class="rp-mask" @click="close">
    <view class="rp-modal" @click.stop>
      <!-- 标题栏 -->
      <view class="rp-header">
        <text class="rp-title">{{ title }}</text>
        <view class="rp-close" @click="close">×</view>
      </view>

      <!-- Tab 切换（云端仅图片类型支持） -->
      <view class="rp-tabs" v-if="showCloudTab">
        <view
          class="rp-tab"
          :class="{ active: activeTab === 'cloud' }"
          @click="activeTab = 'cloud'"
        >
          <text>☁️ 云端图片</text>
        </view>
        <view
          class="rp-tab"
          :class="{ active: activeTab === 'url' }"
          @click="activeTab = 'url'"
        >
          <text>🔗 外链输入</text>
        </view>
      </view>

      <!-- 云端文件列表（仅图片） -->
      <view v-if="showCloudTab && activeTab === 'cloud'" class="rp-body">
        <view v-if="loading" class="rp-status">
          <text>⏳ 加载中...</text>
        </view>
        <view v-else-if="filteredFiles.length === 0" class="rp-status">
          <text>📭 暂无{{ acceptLabel }}文件</text>
        </view>
        <scroll-view v-else scroll-y class="rp-file-list">
          <view
            v-for="file in filteredFiles"
            :key="file.id"
            class="rp-file-item"
            @click="selectCloudFile(file)"
          >
            <view class="rp-file-thumb-wrap">
              <image
                v-if="isImageFile(file.file_name)"
                :src="file.file_url"
                class="rp-file-thumb"
                mode="aspectFill"
              />
              <view v-else class="rp-file-icon">
                <text>{{ getFileIcon(file.file_name) }}</text>
              </view>
            </view>
            <view class="rp-file-info">
              <text class="rp-file-name">{{ file.file_name || '未命名' }}</text>
              <view class="rp-file-meta">
                <text class="rp-file-size">{{ file.file_size_formatted || '' }}</text>
                <text class="rp-file-date">{{ formatDate(file.created_at) }}</text>
              </view>
            </view>
            <view class="rp-file-check">✓</view>
          </view>
        </scroll-view>
      </view>

      <!-- 外链输入（所有类型都支持，不校验格式） -->
      <view v-if="activeTab === 'url' || !showCloudTab" class="rp-body rp-url-body">
        <view class="rp-url-field">
          <text class="rp-url-label">资源 URL</text>
          <input
            class="rp-url-input"
            v-model="urlInput"
            :placeholder="urlPlaceholder"
            @confirm="confirmUrl"
          />
        </view>
        <view class="rp-url-field">
          <text class="rp-url-label">名称（可选）</text>
          <input
            class="rp-url-input"
            v-model="nameInput"
            placeholder="输入名称"
          />
        </view>
        <view class="rp-url-hint">
          <text>提示：直接粘贴链接即可，无需检查格式</text>
        </view>
        <view class="rp-url-actions">
          <view class="rp-url-btn" @click="confirmUrl">确认</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { getFiles } from '@/services/apifox/NODEJSDEMO/FILES/apifox'
import type { getFilesResItems } from '@/services/apifox/NODEJSDEMO/FILES/interface'

interface Props {
  visible: boolean
  /** 过滤文件类型 */
  accept?: 'image' | 'video' | 'audio' | 'all'
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  accept: 'all',
  title: '选择资源',
})

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'confirm', payload: { url: string; name?: string; size?: number }): void
}>()

const showCloudTab = computed(() => props.accept === 'image')
const activeTab = ref<'cloud' | 'url'>('cloud')
const loading = ref(false)
const cloudFiles = ref<getFilesResItems[]>([])

// 外链输入
const urlInput = ref('')
const nameInput = ref('')

const acceptLabel = computed(() => {
  switch (props.accept) {
    case 'image': return '图片'
    case 'video': return '视频'
    case 'audio': return '音频'
    default: return ''
  }
})

const urlPlaceholder = computed(() => {
  switch (props.accept) {
    case 'image': return '输入图片链接，如 https://example.com/photo.jpg'
    case 'video': return '输入视频链接，如 https://example.com/video.mp4'
    case 'audio': return '输入音频链接，如 https://example.com/audio.mp3'
    default: return '输入资源链接'
  }
})

// 图片扩展名
const IMAGE_EXT = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg']
const VIDEO_EXT = ['mp4', 'mov', 'webm', 'm3u8', 'avi', 'mkv']
const AUDIO_EXT = ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac']

const getExt = (name?: string) => {
  if (!name) return ''
  return (name.split('.').pop() || '').toLowerCase()
}

const isImageFile = (name?: string) => IMAGE_EXT.includes(getExt(name))
const isVideoFile = (name?: string) => VIDEO_EXT.includes(getExt(name))
const isAudioFile = (name?: string) => AUDIO_EXT.includes(getExt(name))

const getFileIcon = (name?: string) => {
  if (isVideoFile(name)) return '🎬'
  if (isAudioFile(name)) return '🎵'
  return '📄'
}

const filteredFiles = computed(() => {
  if (props.accept === 'all') return cloudFiles.value
  return cloudFiles.value.filter((f) => {
    const name = f.file_name || ''
    switch (props.accept) {
      case 'image': return isImageFile(name)
      case 'video': return isVideoFile(name)
      case 'audio': return isAudioFile(name)
      default: return true
    }
  })
})

const loadCloudFiles = async () => {
  try {
    loading.value = true
    const res = await getFiles({ pageSize: 50, pageNumber: 1 })
    cloudFiles.value = res.items || []
  } catch (error) {
    console.error('[ResourcePicker] 加载云端文件失败:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

watch(
  () => props.visible,
  (v) => {
    if (v) {
      urlInput.value = ''
      nameInput.value = ''
      // 仅图片类型支持云端，其他类型默认外链 Tab
      if (showCloudTab.value) {
        activeTab.value = 'cloud'
        loadCloudFiles()
      } else {
        activeTab.value = 'url'
      }
    }
  },
)

const close = () => emit('update:visible', false)

const selectCloudFile = (file: getFilesResItems) => {
  emit('confirm', {
    url: file.file_url || '',
    name: file.file_name,
    size: file.file_size,
  })
  close()
}

const confirmUrl = () => {
  const url = urlInput.value.trim()
  if (!url) {
    uni.showToast({ title: '请输入 URL', icon: 'none' })
    return
  }
  emit('confirm', {
    url,
    name: nameInput.value.trim() || undefined,
  })
  close()
}

const formatDate = (timestamp?: number) => {
  if (!timestamp) return ''
  const d = new Date(timestamp * 1000)
  return `${d.getMonth() + 1}/${d.getDate()}`
}
</script>

<style scoped>
.rp-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 999;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.rp-modal {
  width: 100%;
  max-height: 80vh;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.rp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx 16rpx;
}
.rp-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}
.rp-close {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  color: #999;
}
/* Tabs */
.rp-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1rpx solid #eee;
  padding: 0 32rpx;
}
.rp-tab {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  font-size: 26rpx;
  color: #888;
  border-bottom: 4rpx solid transparent;
  transition: all 0.2s;
}
.rp-tab.active {
  color: #667eea;
  border-bottom-color: #667eea;
  font-weight: 600;
}
/* Body */
.rp-body {
  flex: 1;
  min-height: 400rpx;
  max-height: 60vh;
}
.rp-status {
  padding: 80rpx 32rpx;
  text-align: center;
  color: #aaa;
  font-size: 28rpx;
}
/* File list */
.rp-file-list {
  height: 60vh;
  padding: 16rpx 32rpx;
}
.rp-file-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 20rpx 16rpx;
  border-radius: 12rpx;
  margin-bottom: 8rpx;
  background: #fafafa;
}
.rp-file-item:active {
  background: rgba(102, 126, 234, 0.08);
}
.rp-file-thumb-wrap {
  width: 96rpx;
  height: 96rpx;
  border-radius: 8rpx;
  overflow: hidden;
  flex-shrink: 0;
  background: #f0f0f0;
}
.rp-file-thumb {
  width: 100%;
  height: 100%;
}
.rp-file-icon {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
}
.rp-file-info {
  flex: 1;
  min-width: 0;
}
.rp-file-name {
  font-size: 26rpx;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rp-file-meta {
  display: flex;
  gap: 16rpx;
  margin-top: 6rpx;
}
.rp-file-size,
.rp-file-date {
  font-size: 22rpx;
  color: #999;
}
.rp-file-check {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
  font-size: 28rpx;
  font-weight: 700;
  opacity: 0;
  transition: opacity 0.15s;
}
.rp-file-item:active .rp-file-check {
  opacity: 1;
}
/* URL input */
.rp-url-body {
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}
.rp-url-field {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}
.rp-url-label {
  font-size: 24rpx;
  color: #666;
  font-weight: 500;
}
.rp-url-input {
  padding: 20rpx 24rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #333;
}
.rp-url-preview {
  border-radius: 12rpx;
  overflow: hidden;
  background: #f5f5f5;
}
.rp-preview-img {
  width: 100%;
  max-height: 300rpx;
}
.rp-preview-video {
  width: 100%;
  height: 300rpx;
}
.rp-url-actions {
  display: flex;
  justify-content: flex-end;
}
.rp-url-btn {
  padding: 16rpx 48rpx;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  font-size: 28rpx;
  font-weight: 600;
  border-radius: 28rpx;
}
.rp-url-btn:active {
  opacity: 0.85;
}
.rp-url-hint {
  font-size: 22rpx;
  color: #bbb;
}
</style>
