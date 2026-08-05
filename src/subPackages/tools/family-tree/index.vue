<template>
  <PageLayout title="家族族谱" nav-gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
    <view class="family-tree-page">
      <!-- 顶部导航栏 -->
      <!-- 操作栏 -->
      <view class="action-bar">
        <!-- 模式切换 -->
        <view class="mode-switch">
          <!-- #ifdef H5 -->
          <view class="mode-btn" :class="{ active: viewMode === 'tree' }" @click="viewMode = 'tree'">
            <uni-icons type="staff" size="16" :color="viewMode === 'tree' ? '#fff' : '#667eea'" />
            <text class="mode-text">图谱</text>
          </view>
          <!-- #endif -->
          <view class="mode-btn" :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'">
            <uni-icons type="bars" size="16" :color="viewMode === 'list' ? '#fff' : '#667eea'" />
            <text class="mode-text">列表</text>
          </view>
        </view>

        <!-- 操作按钮 -->
        <view class="action-btns">
          <view class="refresh-btn" @click="onRefresh">
            <uni-icons type="refreshempty" size="16" color="#667eea" />
            <text class="refresh-text">刷新</text>
          </view>
        </view>
      </view>
      <!-- 列表模式 -->
      <view class="content-wrapper" v-if="viewMode === 'list'">
        <FamilyTreeList ref="listRef" />
      </view>

      <!-- #ifdef H5 -->
      <!-- 图谱面板模式（图谱升级中，保留成员新增能力） -->
      <view class="content-wrapper" v-if="viewMode === 'tree'">
        <FamilyTreeChart ref="chartRef" />
      </view>
      <!-- #endif -->
    </view>
  </PageLayout>
</template>

<script setup>
  import { ref, watch, onMounted, nextTick } from 'vue'
  import { onShow } from '@dcloudio/uni-app'
  import { reportToolVisit } from '@/utils/tracker'
  import FamilyTreeList from './family-tree-list.vue'
  // #ifdef H5
  import FamilyTreeChart from './family-tree-chart.vue'
  // #endif
  import { useShare } from '@/utils/share'

  // 启用分享
  useShare()

  // 视图模式：list 列表 | tree 树形图
  const viewMode = ref('list')

  // #ifdef H5
  viewMode.value = 'tree'
  // #endif

  // 组件引用
  const listRef = ref(null)
  const chartRef = ref(null)

  // 监听视图模式变化，切换到图谱面板时加载成员数据
  watch(viewMode, newMode => {
    if (newMode === 'tree') {
      nextTick(() => {
        chartRef.value?.initChart?.()
      })
    }
  })

  onShow(() => {
    reportToolVisit('family-tree')
  })

  // 页面挂载时，如果默认是图谱面板模式，加载成员数据
  onMounted(() => {
    if (viewMode.value === 'tree') {
      nextTick(() => {
        chartRef.value?.initChart?.()
      })
    }
  })

  // 刷新
  const onRefresh = () => {
    if (viewMode.value === 'list') {
      listRef.value?.refreshList?.()
    } else {
      chartRef.value?.refreshChart?.()
    }
  }
</script>

<style scoped>
  .family-tree-page {
    height: 100vh;
    background-color: var(--theme-bg);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* 操作栏样式 */
  .action-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16rpx 24rpx;
    background-color: var(--theme-surface);
    border-bottom: 1rpx solid var(--theme-border);
  }

  .mode-switch {
    display: flex;
    background-color: var(--theme-surface-2);
    border-radius: 32rpx;
    padding: 4rpx;
  }

  .mode-btn {
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 12rpx 24rpx;
    border-radius: 28rpx;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .mode-btn.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .mode-btn .mode-text {
    font-size: 26rpx;
    color: #667eea;
  }

  .mode-btn.active .mode-text {
    color: #fff;
  }

  .action-btns {
    display: flex;
    gap: 16rpx;
  }

  .refresh-btn {
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 12rpx 24rpx;
    background-color: var(--theme-surface);
    border: 1rpx solid #667eea;
    border-radius: 32rpx;
    cursor: pointer;
  }

  .refresh-text {
    font-size: 26rpx;
    color: #667eea;
  }

  /* 内容容器 - 填充剩余空间 */
  .content-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
  }

  /* 子组件宿主元素样式 - 微信小程序需要 */
  .content-wrapper :deep(family-tree-chart),
  .content-wrapper :deep(family-tree-list) {
    display: flex;
    flex: 1;
    flex-direction: column;
    height: 100%;
    min-height: 0;
  }
</style>
