<template>
  <view class="lineup-page">
    <view class="hero-banner">
      <view>
        <text class="hero-title">SWC 阵容管理</text>
        <text class="hero-subtitle">独立管理进攻、防御阵容，以及防御阵容的克制关系。</text>
      </view>
      <text class="hero-badge">ADMIN</text>
    </view>

    <view class="toolbar-card">
      <view class="search-row">
        <input
          v-model="keyword"
          class="search-input"
          confirm-type="search"
          placeholder="搜索阵容名称或描述"
          @confirm="refreshList" />
        <button class="toolbar-btn primary" size="mini" @click="refreshList">搜索</button>
      </view>

      <view class="filter-group">
        <text class="filter-label">类型</text>
        <view class="chip-row">
          <text
            v-for="option in typeOptions"
            :key="option.value"
            class="chip"
            :class="{ active: selectedType === option.value }"
            @click="selectType(option.value)">
            {{ option.label }}
          </text>
        </view>
      </view>

      <view class="filter-group">
        <text class="filter-label">状态</text>
        <view class="chip-row">
          <text
            v-for="option in statusOptions"
            :key="option.value"
            class="chip"
            :class="{ active: selectedStatus === option.value }"
            @click="selectStatus(option.value)">
            {{ option.label }}
          </text>
        </view>
      </view>

      <view class="action-row">
        <button class="toolbar-btn primary" @click="goCreate">新增阵容</button>
        <button class="toolbar-btn" @click="goRelations()">克制关系</button>
      </view>
    </view>

    <view v-if="loading && !lineups.length" class="state-block">
      <text>加载阵容中...</text>
    </view>

    <view v-else-if="errorMessage && !lineups.length" class="state-block">
      <text>{{ errorMessage }}</text>
      <button class="toolbar-btn primary" @click="refreshList">重新加载</button>
    </view>

    <view v-else class="content">
      <view class="summary-row">
        <text class="summary-text">共 {{ pagination.total }} 条阵容</text>
        <text class="summary-text">当前 {{ selectedTypeLabel }} / {{ selectedStatusLabel }}</text>
      </view>

      <view v-if="!lineups.length" class="empty-block">
        <text>暂无符合条件的阵容</text>
      </view>

      <view v-for="lineup in lineups" :key="lineup.id" class="lineup-card">
        <view class="lineup-head">
          <view class="lineup-title-wrap">
            <text class="lineup-name">{{ lineup.name || '未命名阵容' }}</text>
            <text class="type-badge" :class="lineup.type">{{ getTypeLabel(lineup.type) }}</text>
            <text class="status-badge" :class="lineup.status">{{ getStatusLabel(lineup.status) }}</text>
          </view>
          <text class="lineup-count">{{ lineup.memberCount }} 人</text>
        </view>

        <text v-if="lineup.description" class="lineup-desc">{{ lineup.description }}</text>

        <view class="metric-row">
          <view class="metric-item">
            <text class="metric-label">成员</text>
            <text class="metric-value">{{ lineup.memberCount }}</text>
          </view>
          <view class="metric-item">
            <text class="metric-label">可克制</text>
            <text class="metric-value">{{ lineup.countersCount }}</text>
          </view>
          <view class="metric-item">
            <text class="metric-label">被克制</text>
            <text class="metric-value">{{ lineup.counteredByCount }}</text>
          </view>
        </view>

        <scroll-view v-if="lineup.characters.length" class="member-scroll" scroll-x>
          <view class="member-row">
            <view v-for="member in lineup.characters" :key="member.characterId || member.id" class="member-pill">
              <image v-if="member.avatar" class="member-avatar" :src="member.avatar" mode="aspectFill" />
              <view v-else class="member-avatar member-avatar-placeholder">
                <text>{{ (member.name || '?').slice(0, 1) }}</text>
              </view>
              <view class="member-meta">
                <text class="member-name">{{ member.name || member.label || '未知魔灵' }}</text>
                <text class="member-extra">{{ member.elementName || member.familyName || '--' }}</text>
              </view>
            </view>
          </view>
        </scroll-view>

        <view class="card-actions">
          <button class="card-btn primary" size="mini" @click="goEdit(lineup.id)">编辑</button>
          <button
            v-if="lineup.type === 'defense'"
            class="card-btn"
            size="mini"
            @click="goRelations(lineup.id)">
            克制关系
          </button>
          <button
            class="card-btn danger"
            size="mini"
            :loading="deletingId === lineup.id"
            @click="confirmDelete(lineup.id)">
            删除
          </button>
        </view>
      </view>

      <view v-if="pagination.hasNext" class="load-more">
        <button class="toolbar-btn" :loading="loadingMore" @click="loadMore">加载更多</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
  import { deleteAdminLineup, fetchAdminLineups, type AdminLineupSummary, type PaginationState } from '@/services/compendium-lineups'
  import { ensureAdminAccess } from '@/utils/admin'

  const COMPENDIUM_CODE = 'swc'
  const DEFAULT_LOCALE = 'zh-CN'
  const ALL_VALUE = ''

  interface FilterOption {
    label: string
    value: string
  }

  const typeOptions: FilterOption[] = [
    { label: '全部', value: ALL_VALUE },
    { label: '进攻', value: 'offense' },
    { label: '防御', value: 'defense' },
  ]

  const statusOptions: FilterOption[] = [
    { label: '全部', value: ALL_VALUE },
    { label: '启用', value: 'enabled' },
    { label: '停用', value: 'disabled' },
  ]

  const keyword = ref('')
  const selectedType = ref(ALL_VALUE)
  const selectedStatus = ref(ALL_VALUE)
  const lineups = ref<AdminLineupSummary[]>([])
  const pagination = ref<PaginationState>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  })
  const loading = ref(false)
  const loadingMore = ref(false)
  const errorMessage = ref('')
  const deletingId = ref('')
  const selectedLocale = ref(DEFAULT_LOCALE)

  const selectedTypeLabel = computed(
    () => typeOptions.find(option => option.value === selectedType.value)?.label || '全部',
  )
  const selectedStatusLabel = computed(
    () => statusOptions.find(option => option.value === selectedStatus.value)?.label || '全部',
  )

  const getTypeLabel = (type: string): string => {
    if (type === 'offense') return '进攻'
    if (type === 'defense') return '防御'
    return type || '未知'
  }

  const getStatusLabel = (status: string): string => {
    if (status === 'enabled') return '启用'
    if (status === 'disabled') return '停用'
    return status || '未知'
  }

  const buildCurrentUrl = (): string => {
    const params: string[] = []
    if (keyword.value.trim()) params.push(`keyword=${encodeURIComponent(keyword.value.trim())}`)
    if (selectedType.value) params.push(`type=${encodeURIComponent(selectedType.value)}`)
    if (selectedStatus.value) params.push(`status=${encodeURIComponent(selectedStatus.value)}`)
    params.push(`locale=${encodeURIComponent(selectedLocale.value)}`)
    const query = params.join('&')
    return `/subPackages/tools/compendium/lineups${query ? `?${query}` : ''}`
  }

  const fetchList = async (reset = false) => {
    if (loading.value || loadingMore.value) return

    if (reset) {
      loading.value = true
    } else {
      if (!pagination.value.hasNext) return
      loadingMore.value = true
    }

    errorMessage.value = ''
    const nextPage = reset ? 1 : pagination.value.page + 1

    try {
      const result = await fetchAdminLineups({
        compendiumId: COMPENDIUM_CODE,
        locale: selectedLocale.value,
        keyword: keyword.value.trim() || undefined,
        type: selectedType.value || undefined,
        status: selectedStatus.value || undefined,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
        page: nextPage,
        pageSize: 20,
      })

      pagination.value = result.pagination
      lineups.value = reset ? result.items : [...lineups.value, ...result.items]
    } catch (error) {
      errorMessage.value = typeof error === 'string' ? error : '加载阵容失败，请稍后重试'
    } finally {
      loading.value = false
      loadingMore.value = false
      uni.stopPullDownRefresh()
    }
  }

  const refreshList = () => {
    fetchList(true)
  }

  const loadMore = () => {
    fetchList(false)
  }

  const selectType = (value: string) => {
    selectedType.value = value
    refreshList()
  }

  const selectStatus = (value: string) => {
    selectedStatus.value = value
    refreshList()
  }

  const goCreate = () => {
    uni.navigateTo({
      url: `/subPackages/tools/compendium/lineup-edit?compendiumId=${encodeURIComponent(COMPENDIUM_CODE)}&locale=${encodeURIComponent(selectedLocale.value)}`,
    })
  }

  const goEdit = (lineupId: string) => {
    uni.navigateTo({
      url: `/subPackages/tools/compendium/lineup-edit?lineupId=${encodeURIComponent(lineupId)}&compendiumId=${encodeURIComponent(COMPENDIUM_CODE)}&locale=${encodeURIComponent(selectedLocale.value)}`,
    })
  }

  const goRelations = (sourceLineupId = '') => {
    const params = [`compendiumId=${encodeURIComponent(COMPENDIUM_CODE)}`, `locale=${encodeURIComponent(selectedLocale.value)}`]
    if (sourceLineupId) params.push(`sourceLineupId=${encodeURIComponent(sourceLineupId)}`)
    uni.navigateTo({
      url: `/subPackages/tools/compendium/lineup-relations?${params.join('&')}`,
    })
  }

  const confirmDelete = (lineupId: string) => {
    uni.showModal({
      title: '删除阵容',
      content: '删除后会同时移除关联的克制关系，确认继续吗？',
      success: async res => {
        if (!res.confirm) return
        deletingId.value = lineupId
        try {
          await deleteAdminLineup(lineupId)
          uni.showToast({
            title: '删除成功',
            icon: 'success',
          })
          refreshList()
        } catch (error) {
          uni.showToast({
            title: typeof error === 'string' ? error : '删除失败，请稍后重试',
            icon: 'none',
          })
        } finally {
          deletingId.value = ''
        }
      },
    })
  }

  onLoad((options: Record<string, string | undefined>) => {
    selectedLocale.value = options.locale || DEFAULT_LOCALE
    keyword.value = options.keyword || ''
    selectedType.value = options.type || ALL_VALUE
    selectedStatus.value = options.status || ALL_VALUE

    const redirectUrl = buildCurrentUrl()
    if (!ensureAdminAccess(redirectUrl)) return

    uni.setNavigationBarTitle({ title: '魔灵召唤阵容' })
    refreshList()
  })

  onPullDownRefresh(() => {
    refreshList()
  })

  onReachBottom(() => {
    loadMore()
  })
</script>

<style scoped lang="scss">
  .lineup-page {
    min-height: 100vh;
    background: #f6f7fb;
    color: #172033;
    padding-bottom: 36rpx;
  }

  .hero-banner {
    margin: 24rpx;
    padding: 28rpx;
    border-radius: 28rpx;
    background: linear-gradient(135deg, #1f2937 0%, #92400e 100%);
    color: #fff;
    display: flex;
    justify-content: space-between;
    gap: 20rpx;
  }

  .hero-title {
    display: block;
    font-size: 36rpx;
    font-weight: 800;
  }

  .hero-subtitle {
    display: block;
    margin-top: 10rpx;
    color: rgba(255, 255, 255, 0.78);
    font-size: 24rpx;
    line-height: 1.6;
  }

  .hero-badge {
    align-self: flex-start;
    padding: 8rpx 16rpx;
    border-radius: 999rpx;
    background: rgba(255, 255, 255, 0.14);
    font-size: 22rpx;
    font-weight: 800;
  }

  .toolbar-card,
  .lineup-card,
  .empty-block,
  .state-block {
    margin: 0 24rpx 20rpx;
    background: #fff;
    border-radius: 24rpx;
    box-shadow: 0 10rpx 30rpx rgba(15, 23, 42, 0.06);
  }

  .toolbar-card {
    padding: 24rpx;
  }

  .search-row,
  .action-row,
  .summary-row,
  .lineup-head,
  .metric-row,
  .card-actions {
    display: flex;
    align-items: center;
    gap: 16rpx;
  }

  .search-row {
    margin-bottom: 24rpx;
  }

  .search-input {
    flex: 1;
    height: 76rpx;
    padding: 0 24rpx;
    border-radius: 18rpx;
    background: #f3f5f9;
    font-size: 28rpx;
  }

  .filter-group + .filter-group {
    margin-top: 20rpx;
  }

  .filter-label {
    display: block;
    margin-bottom: 12rpx;
    font-size: 24rpx;
    color: #667085;
    font-weight: 700;
  }

  .chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
  }

  .chip {
    padding: 12rpx 22rpx;
    border-radius: 999rpx;
    background: #eef2f7;
    color: #667085;
    font-size: 24rpx;
    font-weight: 700;
  }

  .chip.active {
    background: #f59e0b;
    color: #fff;
  }

  .action-row {
    margin-top: 24rpx;
  }

  .toolbar-btn,
  .card-btn {
    border-radius: 999rpx;
    font-size: 24rpx;
    font-weight: 700;
  }

  .toolbar-btn.primary,
  .card-btn.primary {
    background: #b45309;
    color: #fff;
  }

  .card-btn.danger {
    color: #dc2626;
  }

  .content {
    padding-bottom: 24rpx;
  }

  .summary-row {
    justify-content: space-between;
    margin: 0 24rpx 16rpx;
  }

  .summary-text {
    color: #667085;
    font-size: 24rpx;
    font-weight: 700;
  }

  .state-block,
  .empty-block {
    padding: 48rpx 28rpx;
    text-align: center;
    color: #667085;
    font-size: 28rpx;
  }

  .lineup-card {
    padding: 24rpx;
  }

  .lineup-head {
    justify-content: space-between;
    align-items: flex-start;
  }

  .lineup-title-wrap {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    gap: 10rpx;
    align-items: center;
  }

  .lineup-name {
    font-size: 32rpx;
    font-weight: 800;
    color: #172033;
  }

  .lineup-count,
  .type-badge,
  .status-badge {
    font-size: 22rpx;
    font-weight: 800;
    border-radius: 999rpx;
    padding: 6rpx 14rpx;
  }

  .type-badge.offense {
    background: #e0f2fe;
    color: #0369a1;
  }

  .type-badge.defense {
    background: #ede9fe;
    color: #6d28d9;
  }

  .status-badge.enabled {
    background: #dcfce7;
    color: #15803d;
  }

  .status-badge.disabled {
    background: #fee2e2;
    color: #b91c1c;
  }

  .lineup-count {
    background: #f3f5f9;
    color: #475467;
  }

  .lineup-desc {
    display: block;
    margin-top: 16rpx;
    color: #475467;
    font-size: 26rpx;
    line-height: 1.7;
  }

  .metric-row {
    margin-top: 18rpx;
  }

  .metric-item {
    flex: 1;
    padding: 18rpx;
    border-radius: 18rpx;
    background: #f8fafc;
  }

  .metric-label {
    display: block;
    color: #667085;
    font-size: 22rpx;
  }

  .metric-value {
    display: block;
    margin-top: 6rpx;
    color: #111827;
    font-size: 30rpx;
    font-weight: 800;
  }

  .member-scroll {
    margin-top: 20rpx;
    white-space: nowrap;
  }

  .member-row {
    display: inline-flex;
    gap: 14rpx;
    padding-bottom: 4rpx;
  }

  .member-pill {
    width: 240rpx;
    padding: 14rpx;
    border-radius: 18rpx;
    background: #f8fafc;
    display: flex;
    align-items: center;
    gap: 12rpx;
  }

  .member-avatar {
    width: 60rpx;
    height: 60rpx;
    border-radius: 16rpx;
    background: #e5e7eb;
    flex-shrink: 0;
  }

  .member-avatar-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #92400e;
    font-weight: 800;
  }

  .member-meta {
    min-width: 0;
    flex: 1;
  }

  .member-name,
  .member-extra {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .member-name {
    color: #172033;
    font-size: 24rpx;
    font-weight: 700;
  }

  .member-extra {
    margin-top: 6rpx;
    color: #667085;
    font-size: 22rpx;
  }

  .card-actions {
    margin-top: 22rpx;
    justify-content: flex-end;
  }

  .load-more {
    display: flex;
    justify-content: center;
    margin-top: 12rpx;
  }
</style>
