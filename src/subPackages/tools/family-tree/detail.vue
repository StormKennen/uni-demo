<template>
  <PageLayout
    title="成员详情档案"
    :share-title="memberFullName ? `${memberFullName} - 家族族谱档案` : '家族成员详情'"
    :share-path="memberSharePath"
    back-fallback="/subPackages/tools/family-tree/index"
    nav-gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
    <view class="member-detail-page">
      <!-- 加载中 -->
      <view v-if="loading" class="loading-state">
        <uni-icons type="spinner-cycle" size="36" color="#667eea" class="spinner-anim" />
        <text class="loading-text">正在加载档案...</text>
      </view>

      <!-- 档案内容区 -->
      <view v-else-if="memberData" class="detail-content">
        <!-- 头部个人名片卡 -->
        <view class="profile-card" :class="{ female: memberGender === 'female' }">
          <view class="avatar-box">
            <image v-if="memberData.avatarUrl" class="avatar-img" :src="memberData.avatarUrl" mode="aspectFill" />
            <text v-else class="avatar-char">{{ memberFullName?.charAt(memberFullName?.length - 1) || '?' }}</text>
          </view>
          <view class="profile-info">
            <view class="name-row">
              <text class="profile-name">{{ memberFullName }}</text>
              <text class="gen-badge" v-if="memberGeneration">第 {{ memberGeneration }} 代</text>
            </view>
            <view class="tags-row">
              <text class="gender-tag" :class="memberGender">
                {{ memberGender === 'male' ? '男' : memberGender === 'female' ? '女' : '未知' }}
              </text>
              <text class="id-tag" v-if="memberData.id">ID: {{ memberData.id.slice(0, 8) }}...</text>
            </view>
          </view>
        </view>

        <!-- 详细信息区块 -->
        <view class="info-section">
          <view class="section-header">
            <uni-icons type="person" size="18" color="#667eea" />
            <text class="section-title">基本信息</text>
          </view>
          <view class="info-grid">
            <view class="info-cell">
              <text class="cell-label">姓氏</text>
              <text class="cell-value">{{ memberSurname || '-' }}</text>
            </view>
            <view class="info-cell">
              <text class="cell-label">名字</text>
              <text class="cell-value">{{ memberGivenName || '-' }}</text>
            </view>
            <view class="info-cell">
              <text class="cell-label">性别</text>
              <text class="cell-value">{{ memberGender === 'male' ? '男' : memberGender === 'female' ? '女' : '未知' }}</text>
            </view>
            <view class="info-cell">
              <text class="cell-label">世代辈分</text>
              <text class="cell-value">{{ memberGeneration ? `第 ${memberGeneration} 代` : '-' }}</text>
            </view>
          </view>
        </view>

        <!-- 家族关系区块 -->
        <view class="info-section">
          <view class="section-header">
            <uni-icons type="staff" size="18" color="#667eea" />
            <text class="section-title">家族血缘关系</text>
          </view>
          <view class="info-list">
            <view class="info-item">
              <text class="item-label">父亲 / 母亲 (父级)</text>
              <text class="item-value">{{ parentDisplay }}</text>
            </view>
            <view class="info-item">
              <text class="item-label">子嗣总数</text>
              <text class="item-value">{{ childrenCount }} 人</text>
            </view>
            <view class="info-item" v-if="childrenListNames.length > 0">
              <text class="item-label">子嗣列表</text>
              <text class="item-value highlight">{{ childrenListNames.join('、') }}</text>
            </view>
            <view class="info-item" v-if="memberData.spouseRelations && memberData.spouseRelations.length > 0">
              <text class="item-label">配偶 / 姻亲</text>
              <text class="item-value">{{ memberData.spouseRelations.length }} 人关联</text>
            </view>
          </view>
        </view>

        <!-- 生平备注区块 -->
        <view class="info-section" v-if="memberData.notes">
          <view class="section-header">
            <uni-icons type="compose" size="18" color="#667eea" />
            <text class="section-title">生平事迹与备注</text>
          </view>
          <view class="notes-box">
            <text class="notes-text">{{ memberData.notes }}</text>
          </view>
        </view>

        <!-- 底部管理按钮（仅登录用户可见） -->
        <view class="detail-actions" v-if="isLoggedIn">
          <button class="action-btn primary-btn" @click="handleEdit">
            <uni-icons type="compose" size="16" color="#fff" />
            <text class="btn-text">修改档案</text>
          </button>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-state">
        <uni-icons type="info" size="48" color="#ccc" />
        <text class="empty-title">未找到该成员档案</text>
        <button class="back-btn" @click="goBack">返回族谱首页</button>
      </view>
    </view>
  </PageLayout>
</template>

<script setup>
  import { ref, computed } from 'vue'
  import { onLoad, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
  import { getFamilyMemberDetail } from '@/api/family-tree'
  import { getToken } from '@/utils/storage'

  const memberId = ref('')
  const memberData = ref(null)
  const loading = ref(false)
  const isLoggedIn = computed(() => !!getToken())

  onLoad(options => {
    if (options && options.id) {
      memberId.value = options.id
      fetchDetail(options.id)
    }
  })

  const fetchDetail = async id => {
    try {
      loading.value = true
      const res = await getFamilyMemberDetail(id)
      memberData.value = res
    } catch (error) {
      console.error('获取成员详情失败:', error)
      uni.showToast({ title: '加载档案失败', icon: 'none' })
    } finally {
      loading.value = false
    }
  }

  // 计算属性
  const memberGender = computed(() => memberData.value?.gender || 'unknown')
  const memberGeneration = computed(() => memberData.value?.generation)
  const memberSurname = computed(() => memberData.value?.nameZh?.surname || memberData.value?.surname)
  const memberGivenName = computed(() => memberData.value?.nameZh?.given || memberData.value?.givenName)
  const memberFullName = computed(
    () => memberData.value?.nameZh?.full || memberData.value?.name || `${memberSurname.value || ''}${memberGivenName.value || ''}` || '未知成员',
  )

  const parentDisplay = computed(() => {
    if (!memberData.value?.parents || memberData.value.parents.length === 0) return '无记录'
    return memberData.value.parents.join(', ')
  })

  const childrenCount = computed(() => memberData.value?.children?.length || 0)

  const childrenListNames = computed(() => {
    if (!memberData.value?.children) return []
    return memberData.value.children.map(c => (typeof c === 'string' ? c : c.name)).filter(Boolean)
  })

  const memberSharePath = computed(() => `/subPackages/tools/family-tree/detail?id=${memberId.value}`)

  onShareAppMessage(() => ({
    title: `${memberFullName.value} - 家族族谱档案`,
    path: memberSharePath.value,
    imageUrl: memberData.value?.avatarUrl || '/static/logo.png',
  }))

  onShareTimeline(() => ({
    title: `${memberFullName.value} - 家族族谱档案`,
    path: memberSharePath.value,
    imageUrl: memberData.value?.avatarUrl || '/static/logo.png',
  }))

  const handleEdit = () => {
    uni.showToast({ title: '请在族谱图谱/列表页进行编辑', icon: 'none' })
  }

  const goBack = () => {
    uni.navigateBack({
      fail: () => {
        uni.redirectTo({ url: '/subPackages/tools/family-tree/index' })
      },
    })
  }
</script>

<style scoped>
  .member-detail-page {
    padding: 24rpx;
    background-color: var(--theme-bg);
    min-height: 100vh;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 24rpx;
  }

  .loading-state,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 120rpx 0;
    gap: 16rpx;
  }

  .spinner-anim {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .loading-text,
  .empty-title {
    font-size: 28rpx;
    color: var(--theme-text-secondary);
  }

  .back-btn {
    margin-top: 24rpx;
    padding: 16rpx 48rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    font-size: 28rpx;
    border-radius: 32rpx;
    border: none;
  }

  /* 个人名片头 */
  .profile-card {
    display: flex;
    align-items: center;
    padding: 32rpx;
    background: linear-gradient(135deg, #f0f7ff 0%, #e0edff 100%);
    border: 1rpx solid #93c5fd;
    border-radius: 24rpx;
    box-shadow: 0 8rpx 24rpx var(--theme-shadow-sm);
    gap: 24rpx;

    &.female {
      background: linear-gradient(135deg, #fff5f7 0%, #ffe4e6 100%);
      border-color: #fbcfe8;

      .avatar-box {
        background: #ec4899;
      }
    }
  }

  .avatar-box {
    width: 108rpx;
    height: 108rpx;
    border-radius: 50%;
    background: #3b82f6;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 40rpx;
    font-weight: 700;
    flex-shrink: 0;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
    overflow: hidden;
  }

  .avatar-img {
    width: 100%;
    height: 100%;
  }

  .profile-info {
    flex: 1;
    min-width: 0;
  }

  .name-row {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin-bottom: 12rpx;
    flex-wrap: wrap;
  }

  .profile-name {
    font-size: 36rpx;
    font-weight: 700;
    color: var(--theme-text);
  }

  .gen-badge {
    font-size: 22rpx;
    padding: 4rpx 14rpx;
    border-radius: 20rpx;
    background: rgba(102, 126, 234, 0.15);
    color: #667eea;
    font-weight: 600;
  }

  .tags-row {
    display: flex;
    align-items: center;
    gap: 16rpx;
  }

  .gender-tag {
    font-size: 22rpx;
    padding: 2rpx 12rpx;
    border-radius: 8rpx;
    font-weight: 600;

    &.male {
      background: rgba(59, 130, 246, 0.15);
      color: #3b82f6;
    }
    &.female {
      background: rgba(236, 72, 153, 0.15);
      color: #ec4899;
    }
    &.unknown {
      background: rgba(148, 163, 184, 0.15);
      color: #64748b;
    }
  }

  .id-tag {
    font-size: 20rpx;
    color: var(--theme-text-secondary);
  }

  /* 信息区块 */
  .info-section {
    background: var(--theme-surface);
    border: 1rpx solid var(--theme-border);
    border-radius: 20rpx;
    padding: 24rpx;
    box-shadow: 0 4rpx 16rpx var(--theme-shadow-xs);
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 20rpx;
    padding-bottom: 12rpx;
    border-bottom: 1rpx solid var(--theme-border);
  }

  .section-title {
    font-size: 30rpx;
    font-weight: 700;
    color: var(--theme-text);
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16rpx;
  }

  .info-cell {
    background: var(--theme-surface-2);
    padding: 16rpx 20rpx;
    border-radius: 12rpx;
    display: flex;
    flex-direction: column;
    gap: 6rpx;
  }

  .cell-label {
    font-size: 22rpx;
    color: var(--theme-text-secondary);
  }

  .cell-value {
    font-size: 28rpx;
    font-weight: 600;
    color: var(--theme-text);
  }

  .info-list {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
  }

  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12rpx 0;
    border-bottom: 1rpx dashed var(--theme-border);

    &:last-child {
      border-bottom: none;
    }
  }

  .item-label {
    font-size: 26rpx;
    color: var(--theme-text-secondary);
  }

  .item-value {
    font-size: 26rpx;
    font-weight: 600;
    color: var(--theme-text);

    &.highlight {
      color: #667eea;
    }
  }

  .notes-box {
    background: var(--theme-surface-2);
    padding: 20rpx;
    border-radius: 12rpx;
  }

  .notes-text {
    font-size: 26rpx;
    color: var(--theme-text);
    line-height: 1.6;
  }

  .detail-actions {
    margin-top: 16rpx;
  }

  .primary-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    width: 100%;
    height: 88rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    font-size: 30rpx;
    font-weight: 600;
    border-radius: 16rpx;
    border: none;
  }
</style>
