<template>
  <view class="family-tree-list">
    <!-- 成员详情弹窗 -->
    <MemberDetail 
      :visible="showDetail"
      :memberData="selectedMember?.originalData"
      :parentName="selectedMember?.parentName"
      :showEditBtn="false"
      @close="showDetail = false"
    />
    
    <!-- 搜索栏 -->
    <view class="search-bar">
      <uni-icons type="search" size="18" color="#999" />
      <input 
        class="search-input" 
        type="text" 
        v-model="searchKeyword" 
        placeholder="搜索成员姓名" 
        @input="onSearch"
      />
      <view class="clear-btn" v-if="searchKeyword" @click="clearSearch">
        <uni-icons type="clear" size="16" color="#999" />
      </view>
    </view>

    <!-- 筛选栏 -->
    <view class="filter-bar">
      <!-- 固定的"全部"标签 -->
      <view class="filter-item fixed-tag" :class="{ active: filterGeneration === null }" @click="filterGeneration = null">
        全部
      </view>
      
      <!-- 可滚动的代数标签 -->
      <scroll-view class="filter-scroll" scroll-x :scroll-into-view="scrollToGenId">
        <view class="filter-tags">
          <view 
            class="filter-item" 
            v-for="gen in generations" 
            :key="gen"
            :id="'gen-' + gen"
            :class="{ active: filterGeneration === gen }"
            @click="filterGeneration = gen"
          >
            第{{ gen }}代
          </view>
        </view>
      </scroll-view>
      
      <!-- 添加代数按钮 -->
      <view class="add-generation-btn" @click="showGenerationDialog = true">
        <uni-icons type="plusempty" size="16" color="#667eea" />
      </view>
    </view>
    
    <!-- 代数输入弹窗 -->
    <view class="generation-dialog-mask" v-if="showGenerationDialog" @click="showGenerationDialog = false">
      <view class="generation-dialog" @click.stop>
        <view class="dialog-header">
          <text class="dialog-title">输入代数</text>
          <view class="dialog-close" @click="showGenerationDialog = false">
            <uni-icons type="close" size="18" color="#999" />
          </view>
        </view>
        <view class="dialog-body">
          <input 
            class="dialog-input" 
            type="number" 
            v-model="inputGeneration" 
            placeholder="请输入代数"
            :focus="showGenerationDialog"
          />
        </view>
        <view class="dialog-footer">
          <view class="dialog-btn cancel" @click="showGenerationDialog = false">取消</view>
          <view class="dialog-btn confirm" @click="onGenerationInputConfirm">确定</view>
        </view>
      </view>
    </view>

    <!-- 成员卡片列表 -->
    <scroll-view 
      class="member-list" 
      scroll-y
      @scrolltolower="onScrollToLower"
      :lower-threshold="100"
    >
      <!-- 首次加载中 -->
      <view v-if="loading && memberList.length === 0" class="loading-tip">
        <uni-icons type="spinner-cycle" size="32" color="#667eea" />
        <text class="loading-text">加载中...</text>
      </view>
      
      <!-- 空数据 -->
      <view v-else-if="!loading && filteredMembers.length === 0" class="empty-tip">
        <uni-icons type="info" size="48" color="#ccc" />
        <text class="empty-text">暂无成员数据</text>
      </view>
      
      <view class="card-grid" v-else>
        <view 
          class="member-card" 
          v-for="member in filteredMembers" 
          :key="member.id"
          @click="onMemberClick(member)"
        >
          <!-- 卡片头部 -->
          <view class="card-header" :class="{ female: member.gender === 'female' }">
            <view class="card-avatar">
              <text class="avatar-text">{{ member.name.charAt(member.name.length - 1) }}</text>
            </view>
            <text class="generation-badge" v-if="member.generation">{{ member.generation }}代</text>
          </view>
          
          <!-- 卡片内容 -->
          <view class="card-body">
            <text class="card-name">{{ member.name }}</text>
            <view class="card-tags">
              <text class="gender-tag" :class="member.gender">
                {{ member.gender === 'male' ? '男' : member.gender === 'female' ? '女' : '未知' }}
              </text>
            </view>
            <view class="card-meta">
              <view class="meta-row" v-if="member.parentName">
                <text class="meta-label">父</text>
                <text class="meta-value">{{ member.parentName }}</text>
              </view>
              <view class="meta-row" v-if="member.childrenCount">
                <text class="meta-label">子女</text>
                <text class="meta-value">{{ member.childrenCount }}人</text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 加载更多提示 -->
        <view class="load-more-tip" v-if="memberList.length > 0">
          <view v-if="loadingMore" class="loading-more">
            <uni-icons type="spinner-cycle" size="20" color="#667eea" />
            <text class="loading-more-text">加载中...</text>
          </view>
          <view v-else-if="hasMore" class="load-more-btn" @click="loadMoreData">
            <text class="load-more-text">加载更多</text>
          </view>
          <text v-else class="no-more-text">没有更多了</text>
        </view>
      </view>
    </scroll-view>

    <!-- 统计信息 -->
    <view class="stats-bar">
      <text class="stats-text" v-if="filterGeneration">第{{ filterGeneration }}代: {{ totalCount }} 人</text>
      <text class="stats-text" v-else>共 {{ totalCount }} 人</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import MemberDetail from './member-detail.vue';
import { getFamiliesMembers } from '@/services/apifox/NODEJSDEMO/FAMILIES/apifox';

// 详情弹窗
const showDetail = ref(false);
const selectedMember = ref(null);

const emit = defineEmits(['member-click']);

const searchKeyword = ref('');
const filterGeneration = ref(null);
const inputGeneration = ref('');
const showGenerationDialog = ref(false);
const scrollToGenId = ref('');
const loading = ref(false);
const loadingMore = ref(false);
const memberList = ref([]);

// 分页相关
const pageSize = 10;
const currentPage = ref(1);
const hasMore = ref(true);
const totalCount = ref(0);

// 预置代数标签（从大到小排序）
const presetGenerations = [32, 31, 30, 29];
const generations = ref([...presetGenerations]);

// 动态追加代数到标签列表
const addGenerationToList = (gen) => {
  if (gen && !generations.value.includes(gen)) {
    generations.value.push(gen);
    generations.value.sort((a, b) => b - a);
  }
};

// 加载成员列表
const loadMembers = async (isLoadMore = false) => {
  if (isLoadMore) {
    if (loadingMore.value || !hasMore.value) return;
    loadingMore.value = true;
  } else {
    loading.value = true;
    currentPage.value = 1;
    memberList.value = [];
    hasMore.value = true;
  }
  
  try {
    const params = {
      limit: pageSize,
      page: currentPage.value,
      sortBy: 'surname'
    };
    
    // 如果有代数筛选，添加 generation 参数
    if (filterGeneration.value !== null) {
      params.generation = filterGeneration.value;
    }
    
    const response = await getFamiliesMembers(params);
    
    console.log('成员列表数据:', response);
    
    if (response?.items) {
      const newMembers = response.items.map(member => ({
        id: member.id,
        name: member.nameZh?.full || `${member.surname || ''}${member.givenName || ''}` || '未知',
        surname: member.nameZh?.surname || member.surname,
        givenName: member.nameZh?.givenName || member.givenName,
        gender: member.gender,
        generation: member.generation,
        parentName: '',
        childrenCount: 0,
        originalData: member
      }));
      
      if (isLoadMore) {
        memberList.value = [...memberList.value, ...newMembers];
      } else {
        memberList.value = newMembers;
      }
      
      // 动态追加新发现的代数到标签列表
      newMembers.forEach(member => {
        if (member.generation) {
          addGenerationToList(member.generation);
        }
      });
      
      // 更新总数（从 pagination 对象获取）
      if (response.pagination?.total !== undefined) {
        totalCount.value = response.pagination.total;
      }
      
      // 判断是否还有更多数据（从 pagination 对象获取）
      hasMore.value = response.pagination?.hasNext ?? (newMembers.length === pageSize);
      
      if (hasMore.value) {
        currentPage.value++;
      }
    } else {
      hasMore.value = false;
    }
  } catch (error) {
    console.error('加载成员列表失败:', error);
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
};

// 滚动到底部加载更多
const onScrollToLower = () => {
  if (!searchKeyword.value && filterGeneration.value === null) {
    // 只有在没有搜索和筛选时才分页加载
    loadMembers(true);
  }
};

// 点击加载更多按钮
const loadMoreData = () => {
  loadMembers(true);
};

// 刷新列表
const refreshList = () => {
  loadMembers();
};

// 暴露刷新方法给父组件
defineExpose({
  refreshList
});

// 页面加载时获取数据
onMounted(() => {
  loadMembers();
});

// 监听代数筛选变化，重新加载数据
watch(filterGeneration, () => {
  loadMembers();
});

// 输入框确认筛选
const onGenerationInputConfirm = () => {
  const gen = parseInt(inputGeneration.value);
  if (gen && gen > 0) {
    addGenerationToList(gen);
    filterGeneration.value = gen;
    inputGeneration.value = '';
    showGenerationDialog.value = false;
    
    // 滚动到选中的标签
    setTimeout(() => {
      scrollToGenId.value = 'gen-' + gen;
    }, 100);
  }
};

// 筛选后的成员列表
const filteredMembers = computed(() => {
  let result = memberList.value;
  
  // 代数筛选已通过接口参数实现，这里不需要再筛选
  
  // 按关键词搜索（本地筛选）
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    result = result.filter(m => 
      m.name.toLowerCase().includes(keyword) ||
      (m.surname && m.surname.toLowerCase().includes(keyword)) ||
      (m.givenName && m.givenName.toLowerCase().includes(keyword))
    );
  }
  
  return result;
});

const onSearch = () => {
  // 搜索时自动清除代数筛选
};

const clearSearch = () => {
  searchKeyword.value = '';
};

const onMemberClick = (member) => {
  selectedMember.value = member;
  showDetail.value = true;
};
</script>

<style scoped>
.family-tree-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f5f5f5;
  box-sizing: border-box;
}

.search-bar {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  background-color: #fff;
  gap: 16rpx;
}

.search-input {
  flex: 1;
  height: 64rpx;
  padding: 0 16rpx;
  font-size: 28rpx;
  background-color: #f5f5f5;
  border-radius: 32rpx;
}

.clear-btn {
  padding: 8rpx;
}

.filter-bar {
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  background-color: #fff;
  border-top: 1rpx solid #eee;
  gap: 16rpx;
  box-sizing: border-box;
  width: 100%;
}

.filter-scroll {
  flex: 1;
  white-space: nowrap;
  min-width: 0;
  overflow-x: auto;
}

.filter-tags {
  display: inline-flex;
  gap: 16rpx;
}

.add-generation-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56rpx;
  height: 56rpx;
  background-color: #f5f5f5;
  border-radius: 50%;
  flex-shrink: 0;
  border: 2rpx dashed #667eea;
}

.generation-input-wrap {
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 24rpx;
  padding: 0 8rpx 0 16rpx;
  flex-shrink: 0;
}

.generation-input {
  width: 80rpx;
  height: 56rpx;
  font-size: 26rpx;
  text-align: center;
}

.generation-input-btn {
  padding: 8rpx;
}

.filter-item {
  padding: 12rpx 24rpx;
  font-size: 26rpx;
  color: #666;
  background-color: #f5f5f5;
  border-radius: 24rpx;
  flex-shrink: 0;
}

.filter-item.fixed-tag {
  flex-shrink: 0;
}

.filter-item.active {
  color: #fff;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.member-list {
  flex: 1;
  padding: 16rpx;
  min-height: 0;
  overflow-y: auto;
  box-sizing: border-box;
}

.loading-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.loading-text {
  margin-top: 16rpx;
  font-size: 28rpx;
  color: #667eea;
}

.empty-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-text {
  margin-top: 16rpx;
  font-size: 28rpx;
  color: #999;
}

/* 卡片列表布局 */
.card-grid {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.member-card {
  width: 100%;
  background-color: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.member-card:active {
  transform: scale(0.98);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

/* 卡片头部 - 横向布局 */
.card-header {
  position: relative;
  padding: 24rpx;
  background: linear-gradient(135deg, #87CEEB 0%, #5BA3C6 100%);
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.card-header.female {
  background: linear-gradient(135deg, #FFB6C1 0%, #FF8DA1 100%);
}

.card-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-text {
  font-size: 44rpx;
  color: #fff;
  font-weight: bold;
}

.generation-badge {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  padding: 6rpx 16rpx;
  font-size: 22rpx;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 20rpx;
}

/* 卡片内容 */
.card-body {
  padding: 24rpx;
}

.card-name {
  display: block;
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
}

.card-tags {
  display: flex;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.gender-tag {
  padding: 4rpx 16rpx;
  font-size: 22rpx;
  border-radius: 12rpx;
}

.gender-tag.male {
  color: #1890ff;
  background-color: #e6f7ff;
}

.gender-tag.female {
  color: #eb2f96;
  background-color: #fff0f6;
}

.gender-tag.unknown {
  color: #666;
  background-color: #f5f5f5;
}

.card-meta {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.meta-label {
  font-size: 22rpx;
  color: #999;
  flex-shrink: 0;
}

.meta-value {
  font-size: 22rpx;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stats-bar {
  display: flex;
  justify-content: center;
  padding: 16rpx;
  background-color: #fff;
  border-top: 1rpx solid #eee;
  gap: 16rpx;
  flex-shrink: 0;
}

.stats-text {
  font-size: 24rpx;
  color: #999;
}

/* 加载更多提示 */
.load-more-tip {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 32rpx 0;
  width: 100%;
}

.loading-more {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.loading-more-text {
  font-size: 26rpx;
  color: #667eea;
}

.load-more-btn {
  padding: 20rpx 60rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 40rpx;
  cursor: pointer;
}

.load-more-btn:active {
  opacity: 0.8;
}

.load-more-text {
  font-size: 28rpx;
  color: #fff;
}

.no-more-text {
  font-size: 26rpx;
  color: #999;
}

/* 代数输入弹窗 */
.generation-dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.generation-dialog {
  width: 560rpx;
  background-color: #fff;
  border-radius: 24rpx;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 1rpx solid #eee;
}

.dialog-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.dialog-close {
  padding: 8rpx;
}

.dialog-body {
  padding: 40rpx 32rpx;
}

.dialog-input {
  width: 100%;
  height: 88rpx;
  padding: 0 24rpx;
  font-size: 32rpx;
  background-color: #f5f5f5;
  border-radius: 16rpx;
  text-align: center;
  box-sizing: border-box;
}

.dialog-footer {
  display: flex;
  border-top: 1rpx solid #eee;
}

.dialog-btn {
  flex: 1;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
}

.dialog-btn.cancel {
  color: #666;
  border-right: 1rpx solid #eee;
}

.dialog-btn.confirm {
  color: #667eea;
  font-weight: 600;
}
</style>
