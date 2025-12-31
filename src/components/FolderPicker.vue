<script setup lang="ts">
import { ref, watch } from 'vue'
import { getFilesFoldersTree, postFilesFolders, putFilesFolders, deleteFilesFolders } from '@/services/apifox/NODEJSDEMO/FILES/apifox'
import type { FolderTreeNode } from '@/services/apifox/NODEJSDEMO/FILES/interface'

const props = defineProps<{
  modelValue: string
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'update:visible', value: boolean): void
  (e: 'change', value: string): void
}>()

const folderTree = ref<FolderTreeNode | null>(null)
const selectedFolder = ref(props.modelValue || '/')
const showNewFolderInput = ref(false)
const newFolderName = ref('')
const editingFolder = ref<string | null>(null)
const editingName = ref('')
const loading = ref(false)
const expandedFolders = ref<Set<string>>(new Set())

// 切换文件夹展开/收起
function toggleExpand(path: string) {
  if (expandedFolders.value.has(path)) {
    expandedFolders.value.delete(path)
  } else {
    expandedFolders.value.add(path)
  }
  // 触发响应式更新
  expandedFolders.value = new Set(expandedFolders.value)
}

watch(() => props.modelValue, (val) => {
  selectedFolder.value = val || '/'
})

watch(() => props.visible, async (val) => {
  if (val) {
    await loadFolderTree()
  }
})

async function loadFolderTree() {
  loading.value = true
  try {
    const res = await getFilesFoldersTree()
    folderTree.value = res
  } catch (e) {
    console.error('加载文件夹失败', e)
  } finally {
    loading.value = false
  }
}

function selectFolder(folder: string) {
  selectedFolder.value = folder
  emit('update:modelValue', folder)
  emit('change', folder)
  closePopup()
}

function closePopup() {
  emit('update:visible', false)
  showNewFolderInput.value = false
  newFolderName.value = ''
  editingFolder.value = null
  editingName.value = ''
}

async function createNewFolder() {
  const name = newFolderName.value.trim()
  if (!name) {
    uni.showToast({ title: '请输入文件夹名称', icon: 'none' })
    return
  }
  
  let basePath = selectedFolder.value
  if (!basePath.endsWith('/')) basePath += '/'
  const newPath = basePath === '/' ? `/${name}/` : `${basePath}${name}/`
  
  try {
    const res = await postFilesFolders({ path: newPath })
    await loadFolderTree()
    selectedFolder.value = newPath
    emit('update:modelValue', newPath)
    newFolderName.value = ''
    showNewFolderInput.value = false
    uni.showToast({ title: res.exists ? '文件夹已存在' : '创建成功', icon: 'success' })
  } catch (err) {
    console.error('创建文件夹失败', err)
    uni.showToast({ title: '创建失败', icon: 'error' })
  }
}

function startRename(folder: FolderTreeNode) {
  editingFolder.value = folder.path
  editingName.value = folder.name
}

async function confirmRename() {
  if (!editingFolder.value || !editingName.value.trim()) {
    uni.showToast({ title: '名称不能为空', icon: 'none' })
    return
  }
  
  try {
    const res = await putFilesFolders({ path: editingFolder.value, newName: editingName.value.trim() })
    await loadFolderTree()
    if (selectedFolder.value === editingFolder.value) {
      selectedFolder.value = res.newPath
      emit('update:modelValue', res.newPath)
    }
    editingFolder.value = null
    editingName.value = ''
    uni.showToast({ title: '重命名成功', icon: 'success' })
  } catch (err: any) {
    console.error('重命名失败', err)
    uni.showToast({ title: err?.message || '重命名失败', icon: 'none' })
  }
}

function cancelRename() {
  editingFolder.value = null
  editingName.value = ''
}

async function deleteFolder(folder: FolderTreeNode) {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除文件夹「${folder.name}」吗？`,
    confirmColor: '#ef4444',
    success: async (res) => {
      if (res.confirm) {
        try {
          await deleteFilesFolders({ path: folder.path })
          await loadFolderTree()
          if (selectedFolder.value === folder.path) {
            selectedFolder.value = '/'
            emit('update:modelValue', '/')
          }
          uni.showToast({ title: '删除成功', icon: 'success' })
        } catch (err: any) {
          console.error('删除失败', err)
          uni.showToast({ title: err?.message || '删除失败', icon: 'none' })
        }
      }
    }
  })
}
</script>

<template>
  <view class="folder-picker-mask" v-if="visible" @click="closePopup"></view>
  <view class="folder-picker-popup" :class="{ show: visible }">
    <view class="popup-header">
      <text class="popup-title">选择存放目录</text>
      <view class="popup-close" @click="closePopup">
        <uni-icons type="close" size="20" color="#999" />
      </view>
    </view>
    
    <view v-if="loading" class="loading-wrap">
      <text>加载中...</text>
    </view>
    
    <scroll-view v-else class="folder-list" scroll-y>
      <!-- 根目录 -->
      <view class="folder-item" :class="{ active: selectedFolder === '/' }" @click="selectFolder('/')">
        <uni-icons type="folder" size="20" color="#667eea" />
        <text class="folder-name">根目录</text>
        <text class="folder-count" v-if="folderTree">{{ folderTree.count }}个文件</text>
        <uni-icons v-if="selectedFolder === '/'" type="checkmarkempty" size="18" color="#667eea" />
      </view>
      
      <!-- 递归渲染子文件夹 -->
      <template v-if="folderTree?.children">
        <template v-for="folder in folderTree.children" :key="folder.path">
          <!-- 渲染当前文件夹 -->
          <view class="folder-item" :class="{ active: selectedFolder === folder.path }" :style="{ paddingLeft: '32rpx' }">
            <!-- 展开/收起按钮 -->
            <view 
              v-if="folder.children && folder.children.length > 0" 
              class="expand-btn" 
              @click.stop="toggleExpand(folder.path)"
            >
              <uni-icons :type="expandedFolders.has(folder.path) ? 'bottom' : 'right'" size="14" color="#999" />
            </view>
            <view v-else class="expand-placeholder"></view>
            
            <!-- 编辑模式 -->
            <view v-if="editingFolder === folder.path" class="folder-edit-row">
              <input class="folder-edit-input" v-model="editingName" :focus="true" @confirm="confirmRename" />
              <text class="action-btn confirm" @click="confirmRename">确定</text>
              <text class="action-btn cancel" @click="cancelRename">取消</text>
            </view>
            
            <!-- 正常模式 -->
            <view v-else class="folder-content" @click="selectFolder(folder.path)">
              <uni-icons type="folder" size="20" color="#667eea" />
              <text class="folder-name">{{ folder.name }}</text>
              <text class="folder-count">{{ folder.totalCount }}个文件</text>
              <uni-icons v-if="selectedFolder === folder.path" type="checkmarkempty" size="18" color="#667eea" />
            </view>
            
            <!-- 操作按钮 -->
            <view v-if="editingFolder !== folder.path" class="folder-actions">
              <view class="action-icon" @click.stop="startRename(folder)"><uni-icons type="compose" size="18" color="#666" /></view>
              <view class="action-icon delete" @click.stop="deleteFolder(folder)"><uni-icons type="trash" size="18" color="#ef4444" /></view>
            </view>
          </view>
          
          <!-- 递归渲染子文件夹（展开时显示） -->
          <template v-if="folder.children && folder.children.length > 0 && expandedFolders.has(folder.path)">
            <template v-for="child in folder.children" :key="child.path">
              <view class="folder-item" :class="{ active: selectedFolder === child.path }" :style="{ paddingLeft: '64rpx' }">
                <view v-if="child.children && child.children.length > 0" class="expand-btn" @click.stop="toggleExpand(child.path)">
                  <uni-icons :type="expandedFolders.has(child.path) ? 'bottom' : 'right'" size="14" color="#999" />
                </view>
                <view v-else class="expand-placeholder"></view>
                
                <view v-if="editingFolder === child.path" class="folder-edit-row">
                  <input class="folder-edit-input" v-model="editingName" :focus="true" @confirm="confirmRename" />
                  <text class="action-btn confirm" @click="confirmRename">确定</text>
                  <text class="action-btn cancel" @click="cancelRename">取消</text>
                </view>
                
                <view v-else class="folder-content" @click="selectFolder(child.path)">
                  <uni-icons type="folder" size="20" color="#667eea" />
                  <text class="folder-name">{{ child.name }}</text>
                  <text class="folder-count">{{ child.totalCount }}个文件</text>
                  <uni-icons v-if="selectedFolder === child.path" type="checkmarkempty" size="18" color="#667eea" />
                </view>
                
                <view v-if="editingFolder !== child.path" class="folder-actions">
                  <view class="action-icon" @click.stop="startRename(child)"><uni-icons type="compose" size="18" color="#666" /></view>
                  <view class="action-icon delete" @click.stop="deleteFolder(child)"><uni-icons type="trash" size="18" color="#ef4444" /></view>
                </view>
              </view>
              
              <!-- 第三级 -->
              <template v-if="child.children && child.children.length > 0 && expandedFolders.has(child.path)">
                <view 
                  v-for="grandchild in child.children" 
                  :key="grandchild.path"
                  class="folder-item" 
                  :class="{ active: selectedFolder === grandchild.path }" 
                  :style="{ paddingLeft: '96rpx' }"
                >
                  <view class="expand-placeholder"></view>
                  <view v-if="editingFolder === grandchild.path" class="folder-edit-row">
                    <input class="folder-edit-input" v-model="editingName" :focus="true" @confirm="confirmRename" />
                    <text class="action-btn confirm" @click="confirmRename">确定</text>
                    <text class="action-btn cancel" @click="cancelRename">取消</text>
                  </view>
                  <view v-else class="folder-content" @click="selectFolder(grandchild.path)">
                    <uni-icons type="folder" size="20" color="#667eea" />
                    <text class="folder-name">{{ grandchild.name }}</text>
                    <text class="folder-count">{{ grandchild.totalCount }}个文件</text>
                    <uni-icons v-if="selectedFolder === grandchild.path" type="checkmarkempty" size="18" color="#667eea" />
                  </view>
                  <view v-if="editingFolder !== grandchild.path" class="folder-actions">
                    <view class="action-icon" @click.stop="startRename(grandchild)"><uni-icons type="compose" size="18" color="#666" /></view>
                    <view class="action-icon delete" @click.stop="deleteFolder(grandchild)"><uni-icons type="trash" size="18" color="#ef4444" /></view>
                  </view>
                </view>
              </template>
            </template>
          </template>
        </template>
      </template>
    </scroll-view>
    
    <!-- 新建文件夹 -->
    <view class="new-folder-section">
      <view v-if="!showNewFolderInput" class="new-folder-btn" @click="showNewFolderInput = true">
        <uni-icons type="plusempty" size="18" color="#667eea" />
        <text>新建文件夹</text>
      </view>
      <view v-else class="new-folder-input-box">
        <input 
          class="new-folder-input" 
          v-model="newFolderName" 
          placeholder="输入文件夹名称" 
          :focus="true"
          @confirm="createNewFolder"
        />
        <view class="new-folder-actions">
          <text class="cancel-btn" @click="showNewFolderInput = false; newFolderName = ''">取消</text>
          <text class="confirm-btn" @click="createNewFolder">确定</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
$bg-color: #f5f7fa;
$card-bg: #ffffff;
$text-primary: #1a1a1a;
$text-secondary: #666666;
$text-hint: #999999;
$border-color: #eaeef3;

.folder-picker-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
}

.folder-picker-popup {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: $card-bg;
  border-radius: 32rpx 32rpx 0 0;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 999;
  transform: translateY(100%);
  transition: transform 0.3s ease;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  
  &.show {
    transform: translateY(0);
  }
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 1rpx solid $border-color;
  flex-shrink: 0;
}

.popup-title {
  font-size: 32rpx;
  font-weight: 600;
  color: $text-primary;
}

.popup-close {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-wrap {
  padding: 60rpx;
  text-align: center;
  color: $text-hint;
}

.folder-list {
  flex: 1;
  padding: 16rpx 0;
  overflow-y: auto;
}

.folder-item {
  display: flex;
  align-items: center;
  padding: 20rpx 32rpx;
  transition: background 0.2s;
  
  &:active, &.active {
    background: rgba(102, 126, 234, 0.05);
  }
}

.expand-btn {
  width: 32rpx;
  height: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8rpx;
}

.expand-placeholder {
  width: 32rpx;
  height: 32rpx;
  margin-right: 8rpx;
}

.folder-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.folder-name {
  flex: 1;
  font-size: 30rpx;
  color: $text-primary;
}

.folder-count {
  font-size: 24rpx;
  color: $text-hint;
  margin-right: 8rpx;
}

.folder-actions {
  display: flex;
  gap: 16rpx;
  margin-left: 16rpx;
}

.action-icon {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border-radius: 12rpx;
  
  &.delete {
    background: rgba(239, 68, 68, 0.1);
  }
}

.folder-edit-row {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.folder-edit-input {
  flex: 1;
  height: 64rpx;
  background: #f5f7fa;
  border: 1rpx solid $border-color;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
}

.action-btn {
  font-size: 26rpx;
  padding: 8rpx 16rpx;
  
  &.confirm {
    color: #667eea;
    font-weight: 600;
  }
  
  &.cancel {
    color: $text-hint;
  }
}

.new-folder-section {
  padding: 24rpx 32rpx;
  border-top: 1rpx solid $border-color;
  flex-shrink: 0;
}

.new-folder-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 24rpx;
  border: 2rpx dashed $border-color;
  border-radius: 16rpx;
  color: #667eea;
  font-size: 28rpx;
}

.new-folder-input-box {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.new-folder-input {
  height: 80rpx;
  background: #fafbfc;
  border: 1rpx solid $border-color;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
}

.new-folder-actions {
  display: flex;
  justify-content: flex-end;
  gap: 24rpx;
}

.cancel-btn {
  font-size: 28rpx;
  color: $text-hint;
  padding: 12rpx 24rpx;
}

.confirm-btn {
  font-size: 28rpx;
  color: #667eea;
  font-weight: 600;
  padding: 12rpx 24rpx;
}
</style>
