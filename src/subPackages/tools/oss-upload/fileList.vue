<script setup lang="ts">
import { getFiles, deleteFilesId, getFilesFoldersTree } from '@/services/apifox/NODEJSDEMO/FILES/apifox';
import type { getFilesResItems, FolderTreeNode } from '@/services/apifox/NODEJSDEMO/FILES/interface';

import { ref } from 'vue'
import { onLoad, onShow, onReachBottom, onPullDownRefresh } from '@dcloudio/uni-app'
import NavBar from '@/components/nav-bar.vue'
import FolderPicker from '@/components/FolderPicker.vue'
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

// 文件夹树形结构
const folderTree = ref<FolderTreeNode | null>(null)
const currentFolder = ref<string>('/')
const showFolderPanel = ref(true)
const searchKeyword = ref<string>('')
const isSearching = ref(false)
const showFolderPicker = ref(false)

// 文件夹变更后刷新
function onFolderChange(folder: string) {
  currentFolder.value = folder
  isSearching.value = false
  searchKeyword.value = ''
  fetchList(true)
  loadFolderTree()
}

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
    // 只有当 userid 是有效的24位十六进制字符串时才添加
    if (userid.value && /^[a-fA-F0-9]{24}$/.test(userid.value)) {
      params.created_by = userid.value
    }
    // 添加文件夹过滤（根目录 '/' 表示全部文件，不传 folder 参数）
    if (currentFolder.value && currentFolder.value !== '/' && !isSearching.value) {
      params.folder = currentFolder.value
    }
    // 添加搜索关键词
    if (searchKeyword.value.trim()) {
      params.keyword = searchKeyword.value.trim()
    }
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

// 加载文件夹树
async function loadFolderTree() {
  try {
    const res = await getFilesFoldersTree()
    folderTree.value = res
  } catch (e) {
    console.error('加载文件夹失败', e)
  }
}

// 将树形结构转换为平铺列表（用于文件夹面板展示）
function flattenFolderTree(node: FolderTreeNode | null, level = 0): Array<{ path: string; name: string; displayName: string; count: number; totalCount: number; level: number }> {
  if (!node) return []
  const result: Array<{ path: string; name: string; displayName: string; count: number; totalCount: number; level: number }> = []
  
  // 递归遍历子节点
  function traverse(n: FolderTreeNode, depth: number, parentPath: string) {
    // 构建显示名称：/A、/A/B、/A/B/C
    const displayName = n.path === '/' ? '全部文件' : n.path.replace(/\/$/, '')
    result.push({
      path: n.path,
      name: n.name,
      displayName,
      count: n.count,
      totalCount: n.totalCount,
      level: depth
    })
    
    if (n.children && n.children.length > 0) {
      n.children.forEach(child => traverse(child, depth + 1, n.path))
    }
  }
  
  traverse(node, level, '')
  return result
}

// 获取平铺的文件夹列表
function getFlatFolders() {
  return flattenFolderTree(folderTree.value)
}

// 选择文件夹
function selectFolder(folder: string) {
  currentFolder.value = folder
  isSearching.value = false
  searchKeyword.value = ''
  fetchList(true)
}

// 搜索文件
function onSearch() {
  if (searchKeyword.value.trim()) {
    isSearching.value = true
    fetchList(true)
  }
}

// 清除搜索
function clearSearch() {
  searchKeyword.value = ''
  isSearching.value = false
  fetchList(true)
}

// 切换文件夹面板显示
function toggleFolderPanel() {
  showFolderPanel.value = !showFolderPanel.value
}

// 获取当前文件夹名称
function getCurrentFolderName(): string {
  if (currentFolder.value === '/') return '全部文件'
  const parts = currentFolder.value.split('/').filter(s => s)
  return parts[parts.length - 1] || '全部文件'
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

async function onDelete(item: getFilesResItems) {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除文件「${item.file_name}」吗？`,
    confirmColor: '#ef4444',
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '删除中...' })
          console.log('删除文件:', item.id, item.file_name)
          const result = await deleteFilesId(item.id)
          console.log('删除结果:', result)
          uni.hideLoading()
          uni.showToast({ title: '删除成功', icon: 'success' })
          // 从列表中移除该项
          list.value = list.value.filter(f => f.id !== item.id)
          if (total.value !== undefined) total.value -= 1
          // 刷新文件夹树
          await loadFolderTree()
        } catch (e: any) {
          console.error('删除失败:', e)
          uni.hideLoading()
          uni.showToast({ title: e?.message || '删除失败', icon: 'none' })
        }
      }
    }
  })
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
  loadFolderTree()
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
    
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input-wrap">
        <uni-icons type="search" size="18" color="#999" />
        <input 
          class="search-input" 
          v-model="searchKeyword" 
          placeholder="搜索文件名" 
          confirm-type="search"
          @confirm="onSearch"
        />
        <view v-if="searchKeyword" class="search-clear" @click="clearSearch">
          <uni-icons type="clear" size="16" color="#999" />
        </view>
      </view>
      <view class="folder-toggle" @click="toggleFolderPanel">
        <uni-icons :type="showFolderPanel ? 'folder' : 'folder'" size="20" color="#667eea" />
      </view>
      <view class="folder-manage" @click="showFolderPicker = true">
        <uni-icons type="gear" size="20" color="#667eea" />
      </view>
    </view>
    
    <!-- 当前位置 -->
    <view class="current-path" v-if="!isSearching">
      <uni-icons type="folder" size="16" color="#667eea" />
      <text class="path-text">{{ getCurrentFolderName() }}</text>
      <text class="file-count" v-if="total !== undefined">({{ total }}个文件)</text>
    </view>
    <view class="current-path" v-else>
      <uni-icons type="search" size="16" color="#667eea" />
      <text class="path-text">搜索: {{ searchKeyword }}</text>
      <text class="file-count" v-if="total !== undefined">({{ total }}个结果)</text>
    </view>
    
    <view class="main-content">
      <!-- 文件夹面板（平铺模式展示分级目录） -->
      <view class="folder-panel" v-if="showFolderPanel">
        <scroll-view class="folder-scroll" scroll-y>
          <view 
            v-for="folder in getFlatFolders()" 
            :key="folder.path"
            class="folder-item"
            :class="{ active: currentFolder === folder.path && !isSearching }"
            :style="{ paddingLeft: (16 + folder.level * 24) + 'rpx' }"
            @click="selectFolder(folder.path)"
          >
            <uni-icons type="folder" size="18" color="#667eea" />
            <text class="folder-name">{{ folder.displayName }}</text>
            <text class="folder-count">{{ folder.totalCount }}</text>
          </view>
        </scroll-view>
      </view>
      
      <!-- 文件列表 -->
      <view class="file-list-wrap">
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
            <view class="icon-btn delete-btn" @click="onDelete(item)"><uni-icons type="trash" size="22" color="#ef4444" /></view>
          </view>
        </view>
      </view>
      <view class="footer">
        <view v-if="loading" class="loading">加载中...</view>
        <view v-else-if="!hasMore" class="no-more">没有更多了</view>
      </view>
      </view>
    </view>
    
    <!-- 文件夹管理弹窗 -->
    <FolderPicker 
      v-model="currentFolder" 
      v-model:visible="showFolderPicker"
      @change="onFolderChange"
    />
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

// 搜索栏样式
.search-bar {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 32rpx;
  background: $card-bg;
}

.search-input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12rpx;
  background: #f5f7fa;
  border-radius: 16rpx;
  padding: 0 20rpx;
  height: 72rpx;
}

.search-input {
  flex: 1;
  height: 72rpx;
  font-size: 28rpx;
  color: $text-primary;
}

.search-clear {
  padding: 8rpx;
}

.folder-toggle {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 16rpx;
}

.folder-manage {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 16rpx;
}

// 当前路径
.current-path {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx 32rpx;
  background: $card-bg;
  border-top: 1rpx solid $border-color;
}

.path-text {
  font-size: 26rpx;
  color: $text-primary;
  font-weight: 500;
}

.file-count {
  font-size: 24rpx;
  color: $text-hint;
}

// 主内容区
.main-content {
  display: flex;
  flex-direction: column;
}

// 文件夹面板
.folder-panel {
  background: $card-bg;
  border-bottom: 1rpx solid $border-color;
  max-height: 300rpx;
}

.folder-scroll {
  max-height: 300rpx;
}

.folder-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 20rpx 32rpx;
  transition: background 0.2s;
  
  &:active, &.active {
    background: rgba(102, 126, 234, 0.08);
  }
}

.folder-name {
  flex: 1;
  font-size: 28rpx;
  color: $text-primary;
}

.folder-count {
  font-size: 24rpx;
  color: $text-hint;
  background: #f0f1f3;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

// 文件列表区域
.file-list-wrap {
  flex: 1;
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

.icon-btn.delete-btn {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.2);
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