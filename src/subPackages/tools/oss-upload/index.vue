<script setup lang="ts">
import { postFiles } from '@/services/apifox/NODEJSDEMO/FILES/apifox';
import FolderPicker from '@/components/FolderPicker.vue';

// import { post, getOssGetSignature } from '@/services/apifox/NODEJSDEMO/oSS/apifox';

import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import NavBar from '@/components/nav-bar.vue'
import { generateDefaultOssKey } from '@/services/oss'
import { getOssFormData } from './utils'
import { getToken } from '@/utils/storage'
import { getYhIdByPlatform } from '@/utils/env'
import { checkLoginBeforeNavigator } from '@/utils/wxLogin'

const selectedFilePath = ref<string>('')
const selectedFileName = ref<string>('')
const selectedFileSize = ref<number>(0)
const selectedExt = ref<string>('')
const inputBaseName = ref<string>('')
const uploadedUrl = ref<string>('')
const uploading = ref(false)
const uploadError = ref('')

// URL直接录入模式
const urlInputMode = ref(false)
const directUrl = ref<string>('')
const savingUrl = ref(false)

// 文件夹选择
const selectedFolder = ref<string>('/')
const showFolderPicker = ref(false)

// 进入页面时仅调用一次获取签名并缓存
const ossSignature = ref<any>(null)
const uploadHost = ref<string>('https://lzk-web.oss-cn-beijing.aliyuncs.com')

// 进入页面时检查登录状态
onLoad(() => {
  checkLogin()
})

// 获取文件夹显示名称
function getFolderDisplayName(path: string): string {
  if (path === '/') return '根目录'
  const parts = path.split('/').filter(s => s)
  return parts[parts.length - 1] || '根目录'
}

// 检查登录状态
function checkLogin() {
  const token = getToken()
  if (!token) {
    uni.showModal({
      title: '提示',
      content: '该功能需要登录后使用，是否前往登录？',
      confirmText: '去登录',
      cancelText: '返回',
      success: (res) => {
        if (res.confirm) {
          uni.navigateTo({
            url: '/pages/mine/login/login?redirectUrl=' + encodeURIComponent('/subPackages/tools/oss-upload/index')
          })
        } else {
          uni.navigateBack()
        }
      }
    })
  }
}

const hasFile = computed(() => !!selectedFilePath.value)
// const defaultBaseName = computed(() => (selectedFileName.value || '').replace(/\.[^.]+$/, ''))
const sizeTooLarge = computed(() => selectedFileSize.value > 10 * 1024 * 1024)
const uploadDisabled = computed(() => !hasFile.value || uploading.value || sizeTooLarge.value)

function formatSize(bytes: number): string {
  if (!bytes && bytes !== 0) return ''
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
const defaultBaseName = computed(() => (selectedFileName.value || '').replace(/\.[^.]+$/, ''))

function formatDateId() {
  const d = new Date()
  const pad = (n: number) => n.toString().padStart(2, '0')
  const yyyy = d.getFullYear()
  const MM = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  const hh = pad(d.getHours())
  const mm = pad(d.getMinutes())
  const ss = pad(d.getSeconds())
  return `${yyyy}${MM}${dd}${hh}${mm}${ss}`
}

function extractExtFromPath(path: string) {
  const idx = path.lastIndexOf('.')
  if (idx > -1) return path.substring(idx + 1).toLowerCase()
  return 'jpg'
}

async function chooseFile() {
  uploadError.value = ''
  // #ifdef MP-WEIXIN
  try {
    const res = await uni.chooseMessageFile({ count: 1, type: 'all' })
    const f = Array.isArray(res.tempFiles) ? res.tempFiles[0] : null
    const filePath = f?.path || ''
    if (filePath) {
      selectedFilePath.value = filePath
      const ext = extractExtFromPath(f?.name || filePath)
      selectedFileName.value = `${formatDateId()}.${ext}`
      selectedFileSize.value = f?.size || 0
      selectedExt.value = ext
      inputBaseName.value = ''
    }
  } catch (e) {
    console.error('选择文件失败', e)
    uni.showToast({ title: '选择文件失败', icon: 'none' })
  }
  // #endif
  // #ifndef MP-WEIXIN
  const res = await uni.chooseImage({ count: 1 }) as UniApp.ChooseImageSuccessCallbackResult
  const filePath = (Array.isArray(res.tempFilePaths) && res.tempFilePaths[0])
    || (Array.isArray(res.tempFiles) && res.tempFiles[0]?.path)
  if (filePath) {
    selectedFilePath.value = filePath
    const ext = extractExtFromPath(filePath)
    selectedFileName.value = `${formatDateId()}.${ext}`
    const size = Array.isArray(res.tempFiles) ? (res.tempFiles[0]?.size || 0) : 0
    selectedFileSize.value = size
    selectedExt.value = ext
    inputBaseName.value = ''
  }
  // #endif
}

async function chooseImageAction() {
  uploadError.value = ''
  try {
    const res: any = await uni.chooseImage({ count: 1, sourceType: ['album', 'camera'] })
    const filePath = (Array.isArray(res.tempFilePaths) && res.tempFilePaths[0])
      || (Array.isArray(res.tempFiles) && res.tempFiles[0]?.path)
    
    if (filePath) {
      selectedFilePath.value = filePath
      
      // H5平台特殊处理：从tempFiles中获取文件信息
      let ext = 'jpg'
      let size = 0
      
      // #ifdef H5
      if (Array.isArray(res.tempFiles) && res.tempFiles[0]) {
        const file = res.tempFiles[0]
        // H5的tempFiles包含原始File对象
        if (file.name) {
          ext = extractExtFromPath(file.name)
        } else if (file.type) {
          // 从MIME类型推断扩展名
          const mimeMap: Record<string, string> = {
            'image/jpeg': 'jpg',
            'image/jpg': 'jpg',
            'image/png': 'png',
            'image/gif': 'gif',
            'image/webp': 'webp',
            'image/bmp': 'bmp'
          }
          ext = mimeMap[file.type] || 'jpg'
        }
        size = file.size || 0
      }
      // #endif
      
      // #ifndef H5
      ext = extractExtFromPath(filePath)
      size = Array.isArray(res.tempFiles) ? (res.tempFiles[0]?.size || 0) : 0
      // #endif
      
      selectedFileName.value = `${formatDateId()}.${ext}`
      selectedFileSize.value = size
      selectedExt.value = ext
      inputBaseName.value = ''
    }
  } catch (e) {
    console.error('选择图片失败:', e)
    uni.showToast({ title: '选择图片失败', icon: 'none' })
  }
}

async function chooseFileAction() {
  uploadError.value = ''
  // #ifdef MP-WEIXIN
  try {
    const res = await uni.chooseMessageFile({ count: 1, type: 'all' })
    const f = Array.isArray(res.tempFiles) ? res.tempFiles[0] : null
    const filePath = f?.path || ''
    if (filePath) {
      selectedFilePath.value = filePath
      const ext = extractExtFromPath(f?.name || filePath)
      selectedFileName.value = `${formatDateId()}.${ext}`
      selectedFileSize.value = f?.size || 0
      selectedExt.value = ext
      inputBaseName.value = ''
    }
  } catch (e) {
    uni.showToast({ title: '选择文件失败', icon: 'none' })
  }
  // #endif
  // #ifndef MP-WEIXIN
  uni.showToast({ title: '当前平台仅支持图片选择', icon: 'none' })
  // #endif
}

function resetSelection() {
  selectedFilePath.value = ''
  selectedFileName.value = ''
  selectedFileSize.value = 0
  selectedExt.value = ''
  inputBaseName.value = ''
  uploadError.value = ''
  uploadedUrl.value = ''
}

async function upload() {
  if (!hasFile.value) {
    uni.showToast({ title: '请先选择文件', icon: 'none' })
    return
  }
  if (sizeTooLarge.value) {
    uni.showToast({ title: '超过10MB不可上传', icon: 'none' })
    return
  }
  // if (!ossSignature.value) {
  //   // 未获取到签名时尝试重新获取一次
  //   // await prefetchSignature()
  //   if (!ossSignature.value) {
  //     uni.showToast({ title: '上传凭证未准备就绪', icon: 'none' })
  //     return
  //   }
  // }
  uploading.value = true
  uploadError.value = ''
  uploadedUrl.value = ''
  try {
    const ext = selectedExt.value || extractExtFromPath(selectedFileName.value || selectedFilePath.value)
    const base = (inputBaseName.value || '').trim()
    const finalName = base ? `${base}.${ext}` : (selectedFileName.value || `${formatDateId()}.${ext}`)
    const formData = await getOssFormData(finalName, ext)
    console.log('formData', formData, finalName)
    const uploadUrl = uploadHost.value
    await new Promise<void>((resolve, reject) => {
      uni.uploadFile({
        url: uploadUrl,
        name: 'file',
        filePath: selectedFilePath.value,
        formData,
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            uploadedUrl.value = `${uploadUrl.replace(/\/$/, '')}/${formData.key}`
            resolve()
          } else {
            reject(res)
          }
        },
        fail: (err) => reject(err)
      })
    })
    try {
      const postFileName = base ? `${base}.${ext}` : (selectedFileName.value || formData.key)
      await postFiles({
        file_name: postFileName,
        file_size: selectedFileSize.value || 0,
        file_url: uploadedUrl.value,
        folder: selectedFolder.value,
      })
    } catch (err) {
      console.error('生成文件记录失败', err)
      uni.showToast({ title: '记录保存失败', icon: 'none' })
    }
    // const key = generateDefaultOssKey('upload/images', selectedFileName.value || `image_${formatDateId()}.${ext}`)
    // const sign = ossSignature.value

    // const uploadUrl = sign?.host || uploadHost.value
    // // 对齐 ./test.vue 的 formData 字段
    // const formData: Record<string, any> = {
    //   success_action_status: '200',
    //   key: sign.key || key,
    //   policy: typeof sign.policy === 'string' ? sign.policy : JSON.stringify(sign.policy),
    //   'x-oss-signature': sign['x-oss-signature'],
    //   'x-oss-signature-version': sign['x-oss-signature-version'] || 'OSS4-HMAC-SHA256',
    //   'x-oss-credential': sign['x-oss-credential'],
    //   'x-oss-date': sign['x-oss-date'],
    // }
    // if (sign['x-oss-security-token']) {
    //   formData['x-oss-security-token'] = sign['x-oss-security-token']
    // }

    // await new Promise<void>((resolve, reject) => {
    //   uni.uploadFile({
    //     url: uploadUrl,
    //     name: 'file',
    //     filePath: selectedFilePath.value,
    //     formData,
    //     success: (res) => {
    //       if (res.statusCode >= 200 && res.statusCode < 300) {
    //         uploadedUrl.value = `${uploadUrl.replace(/\/$/, '')}/${formData.key}`
    //         resolve()
    //       } else {
    //         reject(res)
    //       }
    //     },
    //     fail: (err) => reject(err)
    //   })
    // })

    uni.showToast({ title: '上传成功', icon: 'success' })
    selectedFilePath.value = ''
    selectedFileName.value = ''
    selectedFileSize.value = 0
    selectedExt.value = ''
    inputBaseName.value = ''
  } catch (e: any) {
    console.error('上传失败', e)
    uploadError.value = typeof e === 'string' ? e : (e?.message || '上传失败')
    uni.showToast({ title: '上传失败', icon: 'error' })
  } finally {
    uploading.value = false
  }
}

function goToFileList() {
  const token = getToken() || ''
  const userid = getYhIdByPlatform()
  const url = `/subPackages/tools/oss-upload/fileList?token=${encodeURIComponent(token)}&userid=${encodeURIComponent(userid)}`
  uni.navigateTo({ url })
}

// 切换URL输入模式
function toggleUrlInputMode() {
  urlInputMode.value = !urlInputMode.value
  if (urlInputMode.value) {
    // 切换到URL模式时，清空文件选择
    resetSelection()
  } else {
    // 切换回文件模式时，清空URL
    directUrl.value = ''
  }
}

// 从URL中提取文件名
function extractFileNameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    const segments = pathname.split('/').filter(s => s)
    if (segments.length > 0) {
      return decodeURIComponent(segments[segments.length - 1])
    }
  } catch (e) {
    // URL解析失败，尝试简单截取
    const lastSlash = url.lastIndexOf('/')
    if (lastSlash > -1 && lastSlash < url.length - 1) {
      const name = url.substring(lastSlash + 1)
      // 去掉查询参数
      const queryIndex = name.indexOf('?')
      return queryIndex > -1 ? name.substring(0, queryIndex) : name
    }
  }
  return 'unknown_file'
}

// 保存URL记录
async function saveUrlRecord() {
  const url = directUrl.value.trim()
  if (!url) {
    uni.showToast({ title: '请输入文件地址', icon: 'none' })
    return
  }
  
  // 简单验证URL格式
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    uni.showToast({ title: '请输入有效的URL地址', icon: 'none' })
    return
  }
  
  savingUrl.value = true
  try {
    const fileName = extractFileNameFromUrl(url)
    const fileSize = 10 * 1024 * 1024 // 固定10MB
    
    await postFiles({
      file_name: fileName,
      file_size: fileSize,
      file_url: url,
      folder: selectedFolder.value,
    })
    
    uni.showToast({ title: '记录保存成功', icon: 'success' })
    directUrl.value = ''
  } catch (err) {
    console.error('保存URL记录失败', err)
    uni.showToast({ title: '保存失败', icon: 'none' })
  } finally {
    savingUrl.value = false
  }
}
</script>

<template>
  <view class="page">
    <NavBar
      always-title
      title="文件上传"
      custom-class="light"
      :custom-style="{ backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }"
    />
    <view class="entry" @click="goToFileList">
      <view class="entry-left"><uni-icons type="list" size="24" color="#2B7EFF" /></view>
      <view class="entry-content">
        <text class="entry-title">文件列表</text>
        <text class="entry-desc">查看并下载已上传文件</text>
      </view>
      <view class="entry-right"><uni-icons type="right" size="20" color="#7B8794" /></view>
    </view>
  <view class="content">
    <view class="section upload-section">
      <!-- 模式切换 -->
      <view class="mode-switch">
        <view class="mode-btn" :class="{ active: !urlInputMode }" @click="urlInputMode = false">
          <uni-icons type="upload" size="18" :color="!urlInputMode ? '#667eea' : '#999'" />
          <text>上传文件</text>
        </view>
        <view class="mode-btn" :class="{ active: urlInputMode }" @click="urlInputMode = true">
          <uni-icons type="link" size="18" :color="urlInputMode ? '#667eea' : '#999'" />
          <text>录入URL</text>
        </view>
      </view>
      
      <!-- 文件夹选择 -->
      <view class="folder-selector" @click="showFolderPicker = true">
        <view class="folder-icon">
          <uni-icons type="folder" size="20" color="#667eea" />
        </view>
        <view class="folder-info">
          <text class="folder-label">存放目录</text>
          <text class="folder-path">{{ selectedFolder === '/' ? '根目录' : selectedFolder }}</text>
        </view>
        <uni-icons type="right" size="16" color="#999" />
      </view>
      
      <!-- URL录入模式 -->
      <view v-if="urlInputMode" class="url-input-section">
        <view class="url-input-box">
          <uni-icons type="link" size="20" color="#999" />
          <input 
            class="url-input" 
            v-model="directUrl" 
            placeholder="请输入文件URL地址" 
            confirm-type="done"
          />
        </view>
        <view class="url-hint">
          <text>文件名将从URL中自动提取，大小固定为10MB</text>
        </view>
        <button class="btn primary" :disabled="savingUrl || !directUrl.trim()" @click="saveUrlRecord">
          {{ savingUrl ? '保存中...' : '保存记录' }}
        </button>
      </view>
      
      <!-- 文件上传模式 -->
      <view v-else-if="!hasFile" class="upload-area">
        <view class="upload-choices">
          <view class="choice" @click="chooseImageAction">
            <uni-icons type="camera" size="48" color="#999" />
            <text class="upload-text">选择图片</text>
            <text class="upload-desc">相机/相册</text>
          </view>
          <view class="choice" @click="chooseFileAction">
            <uni-icons type="paperclip" size="48" color="#999" />
            <text class="upload-text">选择文件</text>
            <text class="upload-desc">聊天记录</text>
          </view>
        </view>
      </view>
      <view v-else class="selected-card">
        <view class="selected-top">
          <image v-if="['jpg','jpeg','png','webp','gif','bmp'].includes(selectedExt.toLowerCase())" class="selected-image" :src="selectedFilePath" mode="aspectFit" />
          <view v-else class="file-placeholder"><uni-icons type="paperclip" size="48" color="#999" /></view>
        </view>
        <view class="size-box mt-16rpx">
          <text class="size-text">名称：</text>
          <input class="edit-input" v-model="inputBaseName" placeholder="请输入文件名，默认是随机命名" confirm-type="done" />
          <text class="size-text">.{{ selectedExt }}</text>
        </view>
        <view class="size-box mt-16rpx">
          <text class="size-text">大小：{{ formatSize(selectedFileSize) }}</text>
          <text v-if="sizeTooLarge" class="size-warn">超过10MB不可上传</text>
        </view>
        <view class="selected-actions">
          <button class="action-btn" @click="resetSelection">重新选择</button>
        </view>
    </view>
  </view>
      <view class="section">
        <button class="btn primary" :disabled="uploadDisabled" @click="upload">
          {{ uploading ? '上传中...' : '上传到OSS' }}
        </button>
        <!-- <view class="result" v-if="uploadedUrl">
          <text>上传地址：</text>
          <text class="link">{{ uploadedUrl }}</text>
        </view> -->
        <view class="error" v-if="uploadError">
          <text>错误：{{ uploadError }}</text>
        </view>
      </view>
    </view>
    
    <!-- 文件夹选择弹窗 -->
    <FolderPicker 
      v-model="selectedFolder" 
      v-model:visible="showFolderPicker"
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
$shadow-md: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
$radius-md: 24rpx;

.page {
  min-height: 100vh;
  background: $bg-color;
}

.content {
  padding: 32rpx;
}

.upload-section { 
  margin-bottom: 24rpx; 
}

.mode-switch {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;
  background: $card-bg;
  border-radius: $radius-md;
  padding: 8rpx;
  box-shadow: $shadow-sm;
}

.mode-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 20rpx 0;
  border-radius: 16rpx;
  font-size: 28rpx;
  color: $text-hint;
  transition: all 0.2s ease;
  
  &.active {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
    font-weight: 600;
  }
}

.url-input-section {
  background: $card-bg;
  border-radius: $radius-md;
  padding: 24rpx;
  box-shadow: $shadow-sm;
}

.url-input-box {
  display: flex;
  align-items: center;
  gap: 12rpx;
  background: #fafbfc;
  border: 1rpx solid $border-color;
  border-radius: 12rpx;
  padding: 0 16rpx;
  margin-bottom: 16rpx;
}

.url-input {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  font-size: 28rpx;
  color: $text-primary;
}

.url-hint {
  margin-bottom: 24rpx;
  text {
    font-size: 24rpx;
    color: $text-hint;
  }
}

.upload-area { 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center; 
  background: $card-bg; 
  border: 2rpx dashed $border-color; 
  border-radius: $radius-md; 
  padding: 24rpx;
  box-shadow: $shadow-sm;
}

.upload-choices { 
  width: 100%; 
  display: flex; 
  gap: 24rpx; 
}

.choice { 
  flex: 1; 
  height: 280rpx; 
  background: $card-bg; 
  border: 2rpx dashed $border-color; 
  border-radius: $radius-md; 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center;
  transition: all 0.2s ease;
  
  &:active {
    transform: scale(0.98);
    border-color: #667eea;
  }
}

.upload-icon { 
  margin-bottom: 24rpx;
}

.upload-text { 
  font-size: 32rpx; 
  color: $text-primary; 
  margin-bottom: 12rpx;
}

.upload-desc { 
  font-size: 24rpx; 
  color: $text-hint;
}

.selected-card { 
  background: $card-bg; 
  border-radius: $radius-md; 
  padding: 24rpx; 
  box-shadow: $shadow-sm;
}

.selected-top { 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  height: 300rpx;
}

.selected-image { 
  width: 100%; 
  height: 300rpx; 
  border-radius: 16rpx;
}

.file-placeholder { 
  width: 120rpx; 
  height: 120rpx; 
  border-radius: 16rpx; 
  background: #f0f1f3; 
  display: flex; 
  align-items: center; 
  justify-content: center;
}

.selected-actions { 
  display: flex; 
  justify-content: flex-end; 
  margin-top: 16rpx;
}

.size-box { 
  display: flex; 
  align-items: center; 
  gap: 12rpx; 
  margin-right: auto;
}

.size-text { 
  color: $text-primary; 
  font-size: 26rpx;
}

.size-warn { 
  color: #ef4444; 
  font-size: 26rpx;
}

.action-btn { 
  height: 72rpx; 
  padding: 0 24rpx; 
  border-radius: 12rpx; 
  font-size: 28rpx; 
  background: #f0f1f3; 
  color: $text-primary; 
  border: none;
}

.action-btn::after { 
  border: 0;
}

.entry { 
  display: flex; 
  align-items: center; 
  gap: 16rpx; 
  background: $card-bg; 
  border-radius: $radius-md; 
  margin: 16rpx 32rpx 0; 
  padding: 24rpx; 
  box-shadow: $shadow-sm;
}

.entry-left { 
  width: 48rpx; 
  height: 48rpx; 
  display: flex; 
  align-items: center; 
  justify-content: center;
}

.entry-content { 
  flex: 1; 
  display: flex; 
  flex-direction: column;
}

.entry-title { 
  color: $text-primary; 
  font-size: 32rpx; 
  font-weight: 600;
}

.entry-desc { 
  color: $text-hint; 
  font-size: 26rpx; 
  margin-top: 4rpx;
}

.entry-right { 
  width: 40rpx; 
  height: 40rpx; 
  display: flex; 
  align-items: center; 
  justify-content: center;
}

.section { 
  margin-bottom: 24rpx;
}

.btn { 
  width: 100%; 
  height: 88rpx; 
  border-radius: 44rpx; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  background: #f0f1f3; 
  color: $text-primary; 
  border: none; 
  font-size: 30rpx;
  font-weight: 600;
}

.btn::after { 
  border: 0;
}

.btn.primary { 
  background: $primary-gradient; 
  color: #fff; 
  border: none;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
}

.btn:disabled,
.btn[disabled] { 
  background: #E5E7EB; 
  color: #9CA3AF; 
  border: none;
  box-shadow: none;
}

.btn.primary:disabled,
.btn.primary[disabled] { 
  background: #CBD5E1; 
  color: #9CA3AF; 
  border: none;
  box-shadow: none;
}

.file-info { 
  margin-top: 16rpx; 
  color: $text-secondary;
}

.edit-row { 
  display: flex; 
  align-items: center; 
  gap: 12rpx; 
  margin-top: 12rpx;
}

.edit-label { 
  font-size: 28rpx;
}

.edit-input { 
  flex: 1; 
  height: 72rpx; 
  line-height: 72rpx; 
  background: #fafbfc; 
  border: 1rpx solid $border-color; 
  border-radius: 12rpx; 
  padding: 0 16rpx; 
  font-size: 28rpx; 
  color: $text-primary;
}

.edit-ext { 
  color: $text-hint; 
  font-size: 28rpx;
}

.preview { 
  width: 100%; 
  max-height: 480rpx; 
  margin-top: 12rpx; 
  border-radius: 12rpx;
}

.result { 
  margin-top: 16rpx; 
  word-break: break-all;
}

.error { 
  margin-top: 12rpx; 
  color: #ef4444;
}

.mt-16rpx { 
  margin-top: 16rpx;
}

// 文件夹选择器样式
.folder-selector {
  display: flex;
  align-items: center;
  gap: 16rpx;
  background: $card-bg;
  border-radius: $radius-md;
  padding: 20rpx 24rpx;
  margin-bottom: 24rpx;
  box-shadow: $shadow-sm;
}

.folder-icon {
  width: 48rpx;
  height: 48rpx;
  border-radius: 12rpx;
  background: rgba(102, 126, 234, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.folder-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.folder-label {
  font-size: 24rpx;
  color: $text-hint;
}

.folder-path {
  font-size: 28rpx;
  color: $text-primary;
  font-weight: 500;
  margin-top: 4rpx;
}

</style>
