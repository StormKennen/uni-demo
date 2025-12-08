<script setup lang="ts">
import { getFiles } from '@/services/apifox/NODEJSDEMO/FILES/apifox';
import type { getFilesRes, getFilesResItems } from '@/services/apifox/NODEJSDEMO/FILES/interface';

import { ref } from 'vue'
import { onLoad, onShow, onReachBottom, onPullDownRefresh } from '@dcloudio/uni-app'
import NavBar from '@/components/nav-bar.vue'
import dayjs from 'dayjs'

import { getFilenameAndExtension } from '@/utils/oss-util'
import { getToken } from '@/utils/storage'
 

const title = '文件列表'
const list = ref<getFilesResItems[]>([])
const loading = ref(false)
const refreshing = ref(false)
const page = ref(1)
const pageSize = ref(20)
const total = ref<number | undefined>(undefined)
const hasMore = ref(true)
const userid = ref('')
const token = ref('')
 

 

function formatSize(size?: number) {
  if (!size || size <= 0) return '未知'
  const kb = size / 1024
  if (kb < 1024) return `${kb.toFixed(1)}KB`
  const mb = kb / 1024
  if (mb < 1024) return `${mb.toFixed(1)}MB`
  const gb = mb / 1024
  return `${gb.toFixed(2)}GB`
}

function formatTime(v?: string | number) {
  if (!v) return ''
  const d = typeof v === 'number' ? dayjs(v) : dayjs(v)
  return d.format('YYYY-MM-DD HH:mm')
}

 

 

async function fetchList(reset = false) {
  if (loading.value) return
  loading.value = true
  try {
    if (reset) { page.value = 1; list.value = []; total.value = undefined; hasMore.value = true }
    const params: any = { pageNumber: page.value, pageSize: pageSize.value }
    if (userid.value) params.created_by = userid.value
    const res = await getFiles(params)
    const rows = Array.isArray(res.items) ? res.items : []
    total.value = typeof res.pagination?.total === 'number' ? res.pagination.total : undefined
    list.value = reset ? rows : list.value.concat(rows)
    const nextFlag = res.pagination?.hasNext ?? ((res.pagination?.page || 0) < (res.pagination?.totalPages || 0))
    hasMore.value = !!nextFlag
    page.value += 1
    
  } catch (e: any) {
    uni.showToast({ title: typeof e === 'string' ? e : '加载失败', icon: 'error' })
  } finally {
    loading.value = false
  }
}

async function onDownload(item: getFilesResItems) {
  try {
    uni.showLoading({ title: '下载中' })
    const url = (item.file_url || '').replace(/^http:/, 'https:')
    const { extension } = getFilenameAndExtension(url)
    const ext = (extension || '').toLowerCase()
    const isImage = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'].includes(ext)
    const isVideo = ['.mp4', '.mov', '.avi', '.mkv', '.webm'].includes(ext)
    const res: any = await new Promise((resolve, reject) => {
      uni.downloadFile({ url, success: resolve, fail: reject })
    })
    const tempFilePath = res?.tempFilePath
    if (isImage) {
      await new Promise((resolve, reject) => {
        uni.saveImageToPhotosAlbum({ filePath: tempFilePath, success: resolve, fail: reject })
      })
      uni.showToast({ title: '已保存到相册', icon: 'success' })
    } else if (isVideo) {
      await new Promise((resolve, reject) => {
        uni.saveVideoToPhotosAlbum({ filePath: tempFilePath, success: resolve, fail: reject })
      })
      uni.showToast({ title: '已保存到相册', icon: 'success' })
    } else {
      const saveRes: any = await new Promise((resolve, reject) => {
        uni.saveFile({ tempFilePath, success: resolve, fail: reject })
      })
      const savedFilePath = saveRes?.savedFilePath || tempFilePath
      try {
        await new Promise((resolve, reject) => {
          uni.openDocument({ filePath: savedFilePath, success: resolve, fail: reject })
        })
      } catch {}
      uni.showToast({ title: '下载成功', icon: 'success' })
    }
  } catch (e) {
    uni.showToast({ title: '下载失败', icon: 'error' })
  } finally {
    uni.hideLoading()
  }
}

function getExtFromItem(item: getFilesResItems) {
  const url = (item.file_url || item.file_name || '')
  const { extension } = getFilenameAndExtension(url)
  return (extension || '').toLowerCase()
}

function isImageExt(ext: string) {
  return ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'].includes(ext)
}

function isVideoExt(ext: string) {
  return ['.mp4', '.mov', '.avi', '.mkv', '.webm'].includes(ext)
}

function isAudioExt(ext: string) {
  return ['.mp3', '.wav', '.aac', '.flac', '.ogg'].includes(ext)
}

function getExtLabel(ext: string) {
  const v = (ext || '').replace('.', '').toUpperCase()
  return v || 'FILE'
}

function getTypeClass(ext: string) {
  if (isImageExt(ext)) return 'image'
  if (isVideoExt(ext)) return 'video'
  if (isAudioExt(ext)) return 'audio'
  if (ext === '.pdf') return 'pdf'
  if (ext === '.doc' || ext === '.docx') return 'doc'
  if (ext === '.xls' || ext === '.xlsx') return 'xls'
  if (ext === '.ppt' || ext === '.pptx') return 'ppt'
  if (ext === '.txt') return 'txt'
  if (ext === '.zip' || ext === '.rar' || ext === '.7z') return 'zip'
  return 'file'
}

 

function onCopyLink(item: getFilesResItems) {
  const url = (item.file_url || '').replace(/^http:/, 'https:')
  uni.setClipboardData({ data: url })
  uni.showToast({ title: '链接已复制', icon: 'none' })
}

async function onPreview(item: getFilesResItems) {
  const url = (item.file_url || '').replace(/^http:/, 'https:')
  const { extension } = getFilenameAndExtension(url)
  const ext = (extension || '').toLowerCase()
  if (['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'].includes(ext)) {
    uni.previewImage({ urls: [url] })
    return
  }
  if (['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'].includes(ext)) {
    try {
      const res: any = await new Promise((resolve, reject) => {
        uni.downloadFile({ url, success: resolve, fail: reject })
      })
      const tempFilePath = res?.tempFilePath
      await new Promise((resolve, reject) => {
        uni.openDocument({ filePath: tempFilePath, success: resolve, fail: reject })
      })
      return
    } catch {}
  }
  uni.navigateTo({ url: `/subPackages/common/webview/h5?url=${encodeURIComponent(url)}` })
}

onLoad((opts: any) => {
  userid.value = opts?.userid || ''
  token.value = opts?.token || ''
  
  // 检查登录状态
  checkLogin()
})

// 检查登录状态
function checkLogin() {
  const tokenValue = getToken()
  if (!tokenValue) {
    uni.showModal({
      title: '提示',
      content: '该功能需要登录后使用，是否前往登录？',
      confirmText: '去登录',
      cancelText: '返回',
      success: (res) => {
        if (res.confirm) {
          uni.navigateTo({
            url: '/pages/mine/login/login?redirectUrl=' + encodeURIComponent('/subPackages/tools/oss-upload/fileList')
          })
        } else {
          uni.navigateBack()
        }
      }
    })
  }
}

onShow(() => {
  fetchList(true)
})

onPullDownRefresh(async () => {
  refreshing.value = true
  await fetchList(true)
  refreshing.value = false
  uni.stopPullDownRefresh()
})

onReachBottom(() => {
  if (hasMore.value && !loading.value) fetchList(false)
})
</script>

<template>
  <view class="page">
    <NavBar 
      :title="title" 
      :alwaysTitle="true" 
      custom-class="light"
      :custom-style="{ backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }"
    />
    <view class="content">
      <view v-if="!list.length && !loading" class="empty">暂无文件</view>
      <view v-for="(item, idx) in list" :key="idx" class="card">
        <view class="thumb-wrap">
          <image v-if="isImageExt(getExtFromItem(item))" class="thumb" :src="(item.file_url || '').replace(/^http:/, 'https:')" mode="aspectFill" />
          <view v-else :class="['thumb', 'thumb-icon', getTypeClass(getExtFromItem(item))]">
            <text class="thumb-label">{{ getExtLabel(getExtFromItem(item)) }}</text>
          </view>
        </view>
        <view class="info">
          <view class="name-row">
            <text class="name fs-36">{{ item.file_name }}</text>
          </view>
          <view class="sub-row">
            <text class="sub">{{ formatSize(item.file_size) }}</text>
            <text class="sub">{{ formatTime(item.created_time || item.created_at) }}</text>
          </view>
          <view class="icon-actions">
            <view class="icon-btn" @click="onPreview(item)"><uni-icons type="eye" size="22" color="#1F2A37" /></view>
            <view class="icon-btn" @click="onCopyLink(item)"><uni-icons type="link" size="22" color="#1F2A37" /></view>
            <view class="icon-btn" @click="onDownload(item)"><uni-icons type="download" size="22" color="#1F2A37" /></view>
          </view>
        </view>
      </view>
      <view class="footer">
        <view v-if="loading" class="loading">加载中...</view>
        <view v-else-if="!hasMore" class="no-more">没有更多了</view>
      </view>
      
    </view>
  </view>
  
</template>

<style scoped lang="scss">
/* 统一配色变量（与首页一致） */
$bg-color: #f5f7fa;
$card-bg: #ffffff;
$text-primary: #1a1a1a;
$text-secondary: #666666;
$text-hint: #999999;
$border-color: #eaeef3;
$primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
$shadow-sm: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
$radius-md: 24rpx;

.page { 
  min-height: 100vh; 
  background: $bg-color;
}

.content { 
  padding: 32rpx;
}

.empty { 
  padding: 80rpx 0; 
  text-align: center; 
  color: $text-hint;
}

.card { 
  background: $card-bg; 
  border-radius: $radius-md; 
  padding: 24rpx; 
  margin-bottom: 20rpx; 
  box-shadow: $shadow-sm; 
  display: flex; 
  align-items: center;
}

.thumb-wrap { 
  width: 96rpx; 
  height: 96rpx; 
  margin-right: 20rpx;
}

.thumb { 
  width: 96rpx; 
  height: 96rpx; 
  border-radius: 16rpx; 
  background: #f0f1f3;
}

.thumb-icon { 
  display: flex; 
  align-items: center; 
  justify-content: center;
}

.thumb-label { 
  font-size: 22rpx; 
  color: #fff; 
  font-weight: 600;
}

.thumb-icon.image { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.thumb-icon.video { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.thumb-icon.audio { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
.thumb-icon.pdf { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.thumb-icon.doc { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.thumb-icon.xls { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
.thumb-icon.ppt { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
.thumb-icon.txt { background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%); }
.thumb-icon.zip { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.thumb-icon.file { background: linear-gradient(135deg, #d299c2 0%, #fef9d7 100%); }

.info { 
  flex: 1;
}

.name-row { 
  display: flex; 
  justify-content: space-between; 
  align-items: center;
}

.name { 
  color: $text-primary;
  font-weight: 600; 
  word-break: break-all;
}

.sub-row { 
  display: flex; 
  justify-content: space-between; 
  color: $text-secondary; 
  margin-top: 8rpx;
}

.sub { 
  font-size: 26rpx;
}

.icon-actions { 
  display: flex; 
  gap: 16rpx; 
  margin-top: 16rpx;
}

.icon-btn { 
  width: 64rpx; 
  height: 64rpx; 
  border-radius: 50%; 
  background: #f0f1f3; 
  border: 1rpx solid $border-color; 
  display: flex; 
  align-items: center; 
  justify-content: center;
  transition: all 0.2s ease;
  
  &:active {
    transform: scale(0.95);
  }
}

.icon-btn.primary { 
  background: $primary-gradient; 
  border: none;
}

.icon-btn::after { 
  border: 0;
}

.footer { 
  padding: 16rpx; 
  text-align: center; 
  color: $text-hint;
}

.loading { 
  color: $text-secondary;
}

.no-more { 
  color: $text-hint;
}

.fs-30 { font-size: 30rpx; }
.fs-36 { font-size: 36rpx; }
</style>