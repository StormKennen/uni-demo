<template>
  <view class="memo-list-page">
    <!-- 导航栏 -->
    <NavBar title="我的备忘录">
      <template #right>
        <view class="nav-actions">
          <view class="action-btn folder-toggle" :class="{ active: !folderPanelCollapsed }" @click="toggleFolderPanel">
            <text class="icon">{{ folderPanelCollapsed ? '☰' : '✕' }}</text>
          </view>
          <view class="action-btn add-btn" @click="createNewMemo">
            <text class="icon">+</text>
          </view>
        </view>
      </template>
    </NavBar>

    <view class="content-wrapper">
      <!-- 左侧文件夹树（可折叠） -->
      <view class="folder-panel" :class="{ collapsed: folderPanelCollapsed }">
        <view class="panel-header">
          <text class="panel-title">分类</text>
          <view class="panel-actions">
            <text class="action-icon" @click="createFolder">+</text>
            <text class="action-icon collapse-btn" @click="toggleFolderPanel">
              {{ folderPanelCollapsed ? '→' : '←' }}
            </text>
          </view>
        </view>
        
        <scroll-view class="folder-tree" scroll-y>
          <!-- 全部备忘录 -->
          <view 
            class="folder-item all-memos"
            :class="{ active: !selectedFolderId }"
            @click="selectFolder(null)"
          >
            <text class="folder-icon">📋</text>
            <text class="folder-name">全部</text>
            <text class="folder-count">{{ totalCount }}</text>
          </view>

          <!-- 文件夹树 -->
          <view 
            v-for="folder in folderTree" 
            :key="folder.id"
            class="folder-item"
            :class="{ active: selectedFolderId === folder.id }"
            :style="{ paddingLeft: (folder.level * 32 + 24) + 'rpx' }"
            @click="selectFolder(folder.id)"
          >
            <text 
              class="folder-toggle" 
              v-if="folder.children && folder.children.length > 0"
              @click.stop="toggleFolder(folder.id)"
            >
              {{ expandedFolders.includes(folder.id) ? '▼' : '▶' }}
            </text>
            <text class="folder-icon">{{ folder.icon || '📁' }}</text>
            <text class="folder-name">{{ folder.name }}</text>
            <text class="folder-count">{{ folderStats[folder.id] || 0 }}</text>
          </view>
        </scroll-view>
      </view>

      <!-- 右侧备忘录列表 -->
      <view class="memo-list-panel">
        <!-- 搜索和筛选 -->
        <view class="search-bar">
          <input 
            class="search-input" 
            v-model="searchKeyword"
            placeholder="搜索备忘录..."
            @confirm="searchMemos"
            @input="onSearchInput"
          />
          <view class="filter-actions">
            <view 
              class="filter-btn"
              :class="{ active: filterPinned }"
              @click="toggleFilter('pinned')"
            >
              📌
            </view>
            <view 
              class="filter-btn"
              :class="{ active: filterFavorite }"
              @click="toggleFilter('favorite')"
            >
              ⭐
            </view>
            <view 
              class="filter-btn"
              :class="{ active: showTagFilter }"
              @click="toggleTagFilter"
            >
              🏷️
            </view>
          </view>
        </view>

        <!-- 标签筛选面板 -->
        <view class="tag-filter-panel" v-if="showTagFilter">
          <view class="tag-filter-header">
            <text class="tag-filter-title">按标签筛选</text>
            <text class="tag-filter-clear" @click="clearTagFilter">清除</text>
          </view>
          <view class="tag-filter-list">
            <view 
              v-for="tag in allTags" 
              :key="tag"
              class="tag-filter-item"
              :class="{ active: selectedTags.includes(tag) }"
              @click="toggleTagSelection(tag)"
            >
              {{ tag }}
            </view>
            <view v-if="allTags.length === 0" class="tag-filter-empty">
              暂无标签
            </view>
          </view>
        </view>

        <!-- 备忘录列表 -->
        <scroll-view 
          class="memo-list" 
          scroll-y
          @scrolltolower="loadMore"
        >
          <view v-if="loading && memos.length === 0" class="loading-state">
            <text>加载中...</text>
          </view>

          <view v-else-if="memos.length === 0" class="empty-state">
            <text class="empty-icon">📝</text>
            <text class="empty-text">暂无备忘录</text>
            <view class="empty-action" @click="createNewMemo">
              <text>创建第一个备忘录</text>
            </view>
          </view>

          <view 
            v-for="memo in memos" 
            :key="memo.id"
            class="memo-item"
            @click="editMemo(memo.id)"
          >
            <!-- <view class="memo-title">{{ memo.name || '-' }}</view> -->
            <view class="memo-header">
              <view class="memo-title-row">
                <text class="memo-name">{{ memo.name }}</text>
                <!-- <text class="memo-pin" v-if="memo.is_pinned">📌</text> -->
                 <text class="action-icon" @click.stop.prevent="togglePin(memo.id, memo.is_pinned)">
                  {{ memo.is_pinned ? '📌' : '📍' }}
                </text>
                <!-- <text class="memo-favorite" v-if="memo.is_favorite">⭐</text> -->
                <text class="action-icon" @click.stop.prevent="toggleFavorite(memo.id, memo.is_favorite)">
                  {{ memo.is_favorite ? '⭐' : '☆' }}
                </text>
                <!-- <text class="memo-title">{{ memo.name || '-' }}</text> -->
              </view>
              <view class="memo-actions" @click.stop>
                <!-- <text class="action-icon" @click="togglePin(memo.id, memo.is_pinned)">
                  {{ memo.is_pinned ? '📌' : '📍' }}
                </text> -->
                <!-- <text class="action-icon" @click="toggleFavorite(memo.id, memo.is_favorite)">
                  {{ memo.is_favorite ? '⭐' : '☆' }}
                </text> -->
                <!-- <text class="action-icon" @click="editMemo(memo.id)">✏️</text>
                <text class="action-icon" @click="deleteMemo(memo.id)">🗑️</text> -->
              </view>
            </view>
            
            <!-- <text class="memo-name">{{ memo.name }}</text> -->
            
            <view class="memo-tags" v-if="memo.tags && memo.tags.length > 0">
              <text 
                v-for="(tag, index) in memo.tags" 
                :key="index"
                class="tag"
              >
                {{ tag }}
              </text>
            </view>
            
            <view class="memo-meta">
              <text class="memo-time">{{ formatTime(memo.updated_at) }}</text>
              <view class="memo-actions">
                <!-- <text class="action-icon" @click="editMemo(memo.id)">✏️</text> -->
                <text class="action-icon" @click.stop.prevent="handleDeleteMemo(memo.id)">🗑️</text>
              </view>
            </view>
          </view>

          <view v-if="hasMore && !loading" class="load-more" @click="loadMore">
            <text>加载更多</text>
          </view>

          <view v-if="loading && memos.length > 0" class="loading-more">
            <text>加载中...</text>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 新建文件夹弹窗 -->
    <view class="modal" v-if="showFolderModal" @click="showFolderModal = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">新建文件夹</text>
          <text class="modal-close" @click="showFolderModal = false">×</text>
        </view>
        <input 
          class="modal-input" 
          v-model="newFolderName"
          placeholder="请输入文件夹名称"
        />
        <view class="modal-actions">
          <view class="modal-btn cancel" @click="showFolderModal = false">取消</view>
          <view class="modal-btn confirm" @click="confirmCreateFolder">确定</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { 
  getMemosTags, 
  getMemos, 
  postMemos,
  deleteMemosMemoId,
  postMemosMemoIdPin,
  postMemosMemoIdFavorite,
  postMemosMemoIdArchive,
  postMemosMemoIdRestore
} from '@/services/apifox/NODEJSDEMO/MEMOS/apifox';

import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import NavBar from '@/components/nav-bar.vue'

// 类型定义
interface Folder {
  id: string
  name: string
  icon?: string
  level: number
  children?: Folder[]
}

interface Memo {
  id: string
  name: string
  title: {
    value: string
  }
  tags: string[]
  is_pinned: boolean
  is_favorite: boolean
  updated_at: number
}

// 文件夹相关
const folderTree = ref<Folder[]>([])
const selectedFolderId = ref<string | null>(null)
const folderPanelCollapsed = ref(false)
const expandedFolders = ref<string[]>([])
const folderStats = ref<Record<string, number>>({})
const showFolderModal = ref(false)
const newFolderName = ref('')

// 备忘录列表相关
const memos = ref<Memo[]>([])
const searchKeyword = ref('')
const filterPinned = ref(false)
const filterFavorite = ref(false)
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const hasMore = ref(true)
const totalCount = ref(0)

// 标签筛选相关
const showTagFilter = ref(false)
const allTags = ref<string[]>([])
const selectedTags = ref<string[]>([])
let searchTimer: ReturnType<typeof setTimeout> | null = null

// 切换文件夹面板
const toggleFolderPanel = () => {
  folderPanelCollapsed.value = !folderPanelCollapsed.value
}

// 切换文件夹展开/折叠
const toggleFolder = (folderId: string) => {
  const index = expandedFolders.value.indexOf(folderId)
  if (index > -1) {
    expandedFolders.value.splice(index, 1)
  } else {
    expandedFolders.value.push(folderId)
  }
}

// 选择文件夹
const selectFolder = (folderId: string | null) => {
  selectedFolderId.value = folderId
  currentPage.value = 1
  memos.value = []
  loadMemos()
}

// 切换筛选
const toggleFilter = (type: 'pinned' | 'favorite') => {
  if (type === 'pinned') {
    filterPinned.value = !filterPinned.value
  } else {
    filterFavorite.value = !filterFavorite.value
  }
  currentPage.value = 1
  memos.value = []
  loadMemos()
}

// 切换标签筛选面板
const toggleTagFilter = () => {
  showTagFilter.value = !showTagFilter.value
}

// 切换标签选择
const toggleTagSelection = (tag: string) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
  currentPage.value = 1
  memos.value = []
  loadMemos()
}

// 清除标签筛选
const clearTagFilter = () => {
  selectedTags.value = []
  currentPage.value = 1
  memos.value = []
  loadMemos()
}

// 搜索输入防抖
const onSearchInput = () => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  searchTimer = setTimeout(() => {
    searchMemos()
  }, 500)
}

// 搜索备忘录
const searchMemos = () => {
  currentPage.value = 1
  memos.value = []
  loadMemos()
}

// 加载文件夹树（使用标签作为分类）
const loadFolders = async () => {
  try {
    // 调用 getMemosTags 获取所有标签作为分类
    const res = await getMemosTags()
    
    // 处理返回数据
    let tags: string[] = []
    if (res && res.data) {
      tags = Array.isArray(res.data) ? res.data : []
    } else if (Array.isArray(res)) {
      tags = res
    }
    
    // 保存所有标签用于筛选
    allTags.value = tags
    
    // 将标签转换为文件夹结构
    folderTree.value = tags.map((tag) => ({
      id: tag,
      name: tag,
      icon: '🏷️',
      level: 0,
      children: []
    }))
    
    // 如果没有标签，添加默认主目录
    if (folderTree.value.length === 0) {
      folderTree.value = [
        { id: 'main', name: '主目录', icon: '📁', level: 0, children: [] }
      ]
    }
    
    console.log('加载的分类:', folderTree.value)
  } catch (error) {
    console.error('加载分类失败:', error)
    // 失败时也显示默认主目录
    folderTree.value = [
      { id: 'main', name: '主目录', icon: '📁', level: 0, children: [] }
    ]
  }
}

// 加载文件夹统计（基于标签统计备忘录数量）
const loadFolderStats = async () => {
  try {
    // 统计每个标签下的备忘录数量
    const statsMap: Record<string, number> = {}
    
    // 遍历所有备忘录，统计标签
    memos.value.forEach(memo => {
      if (memo.tags && Array.isArray(memo.tags)) {
        memo.tags.forEach(tag => {
          statsMap[tag] = (statsMap[tag] || 0) + 1
        })
      }
    })
    
    folderStats.value = statsMap
  } catch (error) {
    console.error('加载统计失败:', error)
  }
}

// 加载备忘录列表
const loadMemos = async () => {
  if (loading.value) return
  
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      limit: pageSize.value,
      status: 'active',
    }
    
    // 如果选择了分类（标签），按标签筛选
    if (selectedFolderId.value && selectedFolderId.value !== 'main') {
      params.tags = selectedFolderId.value
    }
    
    // 如果有选中的标签筛选
    if (selectedTags.value.length > 0) {
      params.tags = selectedTags.value
    }
    
    if (filterPinned.value) {
      params.is_pinned = true
    }
    
    if (filterFavorite.value) {
      params.is_favorite = true
    }
    
    if (searchKeyword.value) {
      params.search = searchKeyword.value
    }
    
    // 调用 Apifox 生成的 API
    const res = await getMemos(params)
    
    // 处理返回数据
    if (res && res.results) {
      memos.value = [...memos.value, ...res.results]
      hasMore.value = res.page < res.totalPages
      totalCount.value = res.totalResults
    } else {
      // 如果返回格式不同，直接使用返回值
      const results = Array.isArray(res) ? res : []
      memos.value = [...memos.value, ...results]
      hasMore.value = false
      totalCount.value = results.length
    }
  } catch (error) {
    console.error('加载备忘录失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none',
    })
    // 如果是第一页加载失败，显示空状态
    if (currentPage.value === 1) {
      memos.value = []
    }
  } finally {
    loading.value = false
  }
}

// 加载更多
const loadMore = () => {
  if (!hasMore.value || loading.value) return
  currentPage.value++
  loadMemos()
}

// 创建新备忘录
const createNewMemo = () => {
  uni.navigateTo({
    url: '/subPackages/services/memo/editor',
  })
}

// 查看备忘录（预览模式）
const viewMemo = (id: string) => {
  uni.navigateTo({
    url: `/subPackages/services/memo/editor?id=${id}&mode=preview`,
  })
}

// 编辑备忘录
const editMemo = (id: string) => {
  uni.navigateTo({
    url: `/subPackages/services/memo/editor?id=${id}&mode=edit`,
  })
}

// 切换置顶状态
const togglePin = async (id: string, isPinned: boolean) => {
  try {
    // 调用 API 切换置顶状态
    const result = await postMemosMemoIdPin(id)
    
    // 更新本地列表数据
    const memo = memos.value.find(m => m.id === id)
    if (memo) {
      memo.is_pinned = !isPinned
    }
    
    // 重新排序（置顶的在前）
    memos.value.sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1
      if (!a.is_pinned && b.is_pinned) return 1
      return 0
    })
    
    uni.showToast({
      title: isPinned ? '已取消置顶' : '已置顶',
      icon: 'success',
    })
  } catch (error) {
    console.error('置顶操作失败:', error)
    uni.showToast({
      title: '操作失败',
      icon: 'none',
    })
  }
}

// 切换收藏状态
const toggleFavorite = async (id: string, isFavorite: boolean) => {
  try {
    // 调用 API 切换收藏状态
    const result = await postMemosMemoIdFavorite(id)
    
    // 更新本地列表数据
    const memo = memos.value.find(m => m.id === id)
    if (memo) {
      memo.is_favorite = !isFavorite
    }
    
    uni.showToast({
      title: isFavorite ? '已取消收藏' : '已收藏',
      icon: 'success',
    })
  } catch (error) {
    console.error('收藏操作失败:', error)
    uni.showToast({
      title: '操作失败',
      icon: 'none',
    })
  }
}

// 删除备忘录
const handleDeleteMemo = async (id: string) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个备忘录吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({
            title: '删除中...',
            mask: true
          })
          
          // 调用 Apifox 生成的删除 API
          await deleteMemosMemoId(id)
          
          // 从列表中移除
          memos.value = memos.value.filter(m => m.id !== id)
          totalCount.value = Math.max(0, totalCount.value - 1)
          
          uni.hideLoading()
          uni.showToast({
            title: '删除成功',
            icon: 'success',
          })
        } catch (error) {
          console.error('删除失败:', error)
          uni.hideLoading()
          uni.showToast({
            title: error.message || '删除失败',
            icon: 'none',
          })
        }
      }
    },
  })
}

// 创建文件夹
const createFolder = () => {
  showFolderModal.value = true
  newFolderName.value = ''
}

// 确认创建文件夹
const confirmCreateFolder = async () => {
  if (!newFolderName.value.trim()) {
    uni.showToast({
      title: '请输入文件夹名称',
      icon: 'none',
    })
    return
  }
  
  try {
    // TODO: 调用 API
    // await createFolder({ name: newFolderName.value })
    
    showFolderModal.value = false
    loadFolders()
    uni.showToast({
      title: '创建成功',
      icon: 'success',
    })
  } catch (error) {
    console.error('创建文件夹失败:', error)
    uni.showToast({
      title: '创建失败',
      icon: 'none',
    })
  }
}

// 格式化时间
const formatTime = (timestamp: number) => {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  
  const date = new Date(timestamp)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

// 刷新页面数据
const refreshData = async () => {
  currentPage.value = 1
  memos.value = []
  hasMore.value = true
  await loadMemos()
  await loadFolders()
  loadFolderStats()
}

// 页面显示时刷新（从编辑器返回时）
const onPageShow = () => {
  refreshData()
}

// 页面加载
onMounted(async () => {
  // 先加载备忘录数据
  await loadMemos()
  // 然后基于备忘录数据加载分类和统计
  await loadFolders()
  loadFolderStats()
  
  // 监听页面显示事件
  uni.$on('memo-list-refresh', onPageShow)
})

// 页面卸载时清理
onUnmounted(() => {
  // 移除事件监听
  uni.$off('memo-list-refresh', onPageShow)
  
  // 清理定时器
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
})
</script>

<style lang="scss" scoped>
.memo-list-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.nav-actions {
  display: flex;
  gap: 20rpx;
  
  .action-btn {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    transition: all 0.2s;
    
    .icon {
      font-size: 32rpx;
      color: #fff;
    }
    
    &:active {
      transform: scale(0.9);
    }
  }
  
  .folder-toggle {
    &.active {
      background: rgba(255, 255, 255, 0.4);
    }
  }
  
  .add-btn {
    background: #fff;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
    
    .icon {
      font-size: 40rpx;
      font-weight: bold;
      color: #667eea;
    }
  }
}

.content-wrapper {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.folder-panel {
  width: 400rpx;
  background: #fff;
  border-right: 1rpx solid #eee;
  display: flex;
  flex-direction: column;
  transition: all 0.3s;
  
  &.collapsed {
    width: 0;
    border-right: none;
  }
  
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx;
    border-bottom: 1rpx solid #eee;
    
    .panel-title {
      font-size: 28rpx;
      font-weight: 600;
      color: #333;
    }
    
    .panel-actions {
      display: flex;
      gap: 16rpx;
      
      .action-icon {
        width: 48rpx;
        height: 48rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f0f0f0;
        border-radius: 8rpx;
        font-size: 28rpx;
        color: #666;
        
        &.collapse-btn {
          font-size: 24rpx;
        }
      }
    }
  }
  
  .folder-tree {
    flex: 1;
    
    .folder-item {
      display: flex;
      align-items: center;
      padding: 20rpx 24rpx;
      gap: 12rpx;
      transition: all 0.2s;
      
      &.all-memos {
        font-weight: 600;
        background: #f8f9fa;
      }
      
      &.active {
        background: #e6f7ff;
        border-left: 4rpx solid #1890ff;
      }
      
      &:active {
        background: #f0f0f0;
      }
      
      .folder-toggle {
        font-size: 20rpx;
        color: #999;
        width: 32rpx;
      }
      
      .folder-icon {
        font-size: 32rpx;
      }
      
      .folder-name {
        flex: 1;
        font-size: 28rpx;
        color: #333;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .folder-count {
        font-size: 24rpx;
        color: #999;
        background: #f0f0f0;
        padding: 4rpx 12rpx;
        border-radius: 12rpx;
      }
    }
  }
}

.memo-list-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  
  .search-bar {
    display: flex;
    align-items: center;
    gap: 16rpx;
    padding: 24rpx;
    border-bottom: 1rpx solid #eee;
    
    .search-input {
      flex: 1;
      height: 64rpx;
      padding: 0 24rpx;
      background: #f8f9fa;
      border-radius: 32rpx;
      font-size: 28rpx;
    }
    
    .filter-actions {
      display: flex;
      gap: 12rpx;
      
      .filter-btn {
        width: 64rpx;
        height: 64rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f8f9fa;
        border-radius: 50%;
        font-size: 32rpx;
        transition: all 0.2s;
        
        &.active {
          background: #1890ff;
          transform: scale(1.1);
        }
      }
    }
  }
  
  .tag-filter-panel {
    padding: 16rpx 24rpx;
    background: #f8f9fa;
    border-bottom: 1rpx solid #eee;
    
    .tag-filter-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16rpx;
      
      .tag-filter-title {
        font-size: 26rpx;
        color: #666;
      }
      
      .tag-filter-clear {
        font-size: 24rpx;
        color: #1890ff;
      }
    }
    
    .tag-filter-list {
      display: flex;
      flex-wrap: wrap;
      gap: 12rpx;
      
      .tag-filter-item {
        padding: 8rpx 20rpx;
        background: #fff;
        border: 1rpx solid #ddd;
        border-radius: 24rpx;
        font-size: 24rpx;
        color: #666;
        transition: all 0.2s;
        
        &.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: transparent;
          color: #fff;
        }
      }
      
      .tag-filter-empty {
        font-size: 24rpx;
        color: #999;
        padding: 8rpx 0;
      }
    }
  }
  
  .memo-list {
    flex: 1;
    
    .loading-state,
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 120rpx 0;
      color: #999;
      
      .empty-icon {
        font-size: 120rpx;
        margin-bottom: 24rpx;
      }
      
      .empty-text {
        font-size: 28rpx;
        margin-bottom: 32rpx;
      }
      
      .empty-action {
        padding: 16rpx 48rpx;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #fff;
        border-radius: 40rpx;
        font-size: 28rpx;
      }
    }
    
    .memo-item {
      padding: 24rpx;
      border-bottom: 1rpx solid #eee;
      transition: all 0.2s;
      
      &:active {
        background: #f8f9fa;
      }
      
      .memo-header {
        // display: flex;
        // justify-content: space-between;
        // align-items: flex-start;
        margin-bottom: 12rpx;
        
        .memo-title-row {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8rpx;
          
          .memo-pin,
          .memo-favorite {
            font-size: 24rpx;
          }
          
          .memo-title {
            flex: 1;
            font-size: 32rpx;
            font-weight: 600;
            color: #333;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
        
        .memo-actions {
          display: flex;
          gap: 16rpx;
          
          .action-icon {
            font-size: 28rpx;
            padding: 8rpx;
          }
        }
      }

      .memo-meta {
        .action-icon {
          font-size: 20rpx;
          padding: 8rpx;
        }
      }
      
      .memo-name {
        font-size: 28rpx;
        color: #666;
        margin-bottom: 12rpx;
        display: block;
      }
      
      .memo-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 12rpx;
        margin-bottom: 12rpx;
        
        .tag {
          padding: 4rpx 16rpx;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
          border-radius: 16rpx;
          font-size: 22rpx;
        }
      }
      
      .memo-meta {
        display: flex;
        justify-content: space-between;
        .memo-time {
          font-size: 24rpx;
          color: #999;
        }
      }
    }
    
    .load-more,
    .loading-more {
      text-align: center;
      padding: 32rpx;
      color: #999;
      font-size: 28rpx;
    }
  }
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  
  .modal-content {
    width: 600rpx;
    background: #fff;
    border-radius: 24rpx;
    padding: 32rpx;
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32rpx;
      
      .modal-title {
        font-size: 32rpx;
        font-weight: 600;
        color: #333;
      }
      
      .modal-close {
        font-size: 48rpx;
        color: #999;
        line-height: 1;
      }
    }
    
    .modal-input {
      width: 100%;
      height: 80rpx;
      padding: 0 24rpx;
      background: #f8f9fa;
      border-radius: 12rpx;
      font-size: 28rpx;
      margin-bottom: 32rpx;
    }
    
    .modal-actions {
      display: flex;
      gap: 24rpx;
      
      .modal-btn {
        flex: 1;
        height: 80rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 40rpx;
        font-size: 28rpx;
        
        &.cancel {
          background: #f0f0f0;
          color: #666;
        }
        
        &.confirm {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
        }
      }
    }
  }
}
</style>
