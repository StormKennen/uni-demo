<template>
  <view class="mapping-page">
    <view class="hero-banner">
      <view>
        <text class="hero-title">魔灵召唤阵容映射</text>
        <text class="hero-subtitle">
          浏览「源阵容 → 目标阵容」的容器化映射，容器内每个阵容可独立点赞/点踩。{{
            isLoggedIn ? '登录用户可创建映射。' : '登录后可创建映射。'
          }}
        </text>
      </view>
      <text v-if="isAdmin" class="hero-badge">ADMIN</text>
    </view>

    <StateBlock v-if="loading && !mappings.length" class="state-block" text="加载映射中..." />

    <StateBlock
      v-else-if="errorMessage && !mappings.length"
      class="state-block"
      :text="errorMessage"
      action-text="重新加载"
      theme="teal"
      @action="refreshList" />

    <view v-else class="content">
      <view class="summary-row">
        <text class="summary-text">共 {{ pagination.total }} 个映射</text>
      </view>

      <StateBlock v-if="!mappings.length" class="empty-block" text="暂无阵容映射，快去创建一个吧" />

      <view v-for="mapping in mappings" :key="mapping.id" class="mapping-card">
        <view class="mapping-head">
          <text class="mapping-desc">{{ mapping.description || '未命名映射' }}</text>
          <view v-if="mapping.canEdit || isAdmin" class="card-actions">
            <button v-if="mapping.canEdit" class="card-btn primary" size="mini" @click="goEdit(mapping.id)">编辑</button>
            <button
              v-if="isAdmin"
              class="card-btn danger"
              size="mini"
              :loading="deletingId === mapping.id"
              @click="confirmDelete(mapping.id)">
              删除
            </button>
          </view>
        </view>

        <view v-for="container in containersOf(mapping)" :key="container.containerId" class="container-block">
          <view class="container-head">
            <text class="container-badge" :class="container.kind">{{ container.kind === 'source' ? '源容器' : '目标容器' }}</text>
            <text class="container-count">{{ container.items.length }} 个阵容</text>
          </view>

          <StateBlock v-if="!container.items.length" class="empty-block inner" text="该容器暂无阵容" />

          <view v-else class="item-list">
            <view v-for="item in container.items" :key="item.itemId || item.lineupId" class="item-card">
              <view class="item-main">
                <text class="item-name">{{ item.lineup?.name || '未命名阵容' }}</text>
                <text v-if="item.lineup?.type" class="item-type">{{ getLineupTypeLabel(item.lineup.type) }}</text>
              </view>
              <view class="reaction-row">
                <view
                  class="reaction-btn"
                  :class="{ active: item.myReaction === 1 }"
                  @click="handleReaction(mapping, container.containerId, item, 1)">
                  <text>👍 {{ item.likeCount }}</text>
                </view>
                <view
                  class="reaction-btn"
                  :class="{ active: item.myReaction === -1 }"
                  @click="handleReaction(mapping, container.containerId, item, -1)">
                  <text>👎 {{ item.dislikeCount }}</text>
                </view>
                <text class="reaction-score">热度 {{ item.score }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view v-if="pagination.hasNext" class="load-more">
        <button class="toolbar-btn" :loading="loadingMore" @click="loadMore">加载更多</button>
      </view>
    </view>

    <view class="fab" @click="goCreate">
      <text class="fab-icon">+</text>
      <text class="fab-text">{{ isLoggedIn ? '创建映射' : '登录创建' }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { onLoad, onShow, onReachBottom } from '@dcloudio/uni-app'
  import { getLineupTypeLabel } from './lineup-meta'
  import StateBlock from './components/state-block.vue'
  import { reportToolVisit } from '@/utils/tracker'
  import {
    deleteLineupMapping,
    fetchLineupMappings,
    reactToContainerLineup,
    type ContainerKind,
    type LineupMapping,
    type LineupMappingContainerItem,
    type PaginationState,
    type ReactionValue,
  } from '@/services/compendium-lineups'
  import { getToken } from '@/utils/storage'
  import { ensureLoginAccess, isAdminUser } from '@/utils/admin'

  const COMPENDIUM_CODE = 'swc'
  const DEFAULT_LOCALE = 'zh-CN'
  const PAGE_SIZE = 20

  const selectedLocale = ref(DEFAULT_LOCALE)
  const mappings = ref<LineupMapping[]>([])
  const pagination = ref<PaginationState>({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0, hasNext: false, hasPrev: false })
  const loading = ref(false)
  const loadingMore = ref(false)
  const errorMessage = ref('')
  const deletingId = ref('')
  const reactingKey = ref('')

  const isAdmin = computed(() => isAdminUser())
  const isLoggedIn = computed(() => !!getToken())

  interface ContainerView {
    kind: ContainerKind
    containerId: string
    items: LineupMappingContainerItem[]
  }

  const containersOf = (mapping: LineupMapping): ContainerView[] => [
    { kind: 'source', containerId: mapping.sourceContainer.containerId, items: mapping.sourceContainer.items },
    { kind: 'target', containerId: mapping.targetContainer.containerId, items: mapping.targetContainer.items },
  ]

  const buildCurrentUrl = (): string =>
    `/subPackages/tools/compendium/swc/lineup-mappings?compendiumId=${encodeURIComponent(COMPENDIUM_CODE)}&locale=${encodeURIComponent(selectedLocale.value)}`

  const loadPage = async (page: number) => {
    const result = await fetchLineupMappings({
      compendiumId: COMPENDIUM_CODE,
      page,
      limit: PAGE_SIZE,
    })
    pagination.value = result.pagination
    if (page <= 1) {
      mappings.value = result.items
    } else {
      mappings.value = [...mappings.value, ...result.items]
    }
  }

  const refreshList = async () => {
    if (loading.value) return
    loading.value = true
    errorMessage.value = ''
    try {
      await loadPage(1)
    } catch (error) {
      errorMessage.value = typeof error === 'string' ? error : '加载映射失败，请稍后重试'
    } finally {
      loading.value = false
    }
  }

  const loadMore = async () => {
    if (loadingMore.value || !pagination.value.hasNext) return
    loadingMore.value = true
    try {
      await loadPage(pagination.value.page + 1)
    } catch (error) {
      uni.showToast({ title: typeof error === 'string' ? error : '加载失败', icon: 'none' })
    } finally {
      loadingMore.value = false
    }
  }

  const resolveError = (error: unknown, fallback: string): string => {
    const status = (error as { code?: number; statusCode?: number })?.code ?? (error as { statusCode?: number })?.statusCode
    if (status === 403) return '无权进行该操作'
    if (status === 404) return '目标不存在或已删除'
    return typeof error === 'string' ? error : fallback
  }

  const handleReaction = async (mapping: LineupMapping, containerId: string, item: LineupMappingContainerItem, value: ReactionValue) => {
    const key = `${mapping.id}:${containerId}:${item.lineupId}`
    if (reactingKey.value) return
    reactingKey.value = key
    try {
      const result = await reactToContainerLineup(mapping.id, containerId, item.lineupId, value)
      item.likeCount = result.likeCount
      item.dislikeCount = result.dislikeCount
      item.score = result.score
      item.myReaction = result.myReaction
    } catch (error) {
      uni.showToast({ title: resolveError(error, '操作失败，请稍后重试'), icon: 'none' })
    } finally {
      reactingKey.value = ''
    }
  }

  const goCreate = () => {
    if (!ensureLoginAccess(buildCurrentUrl())) return
    uni.navigateTo({
      url: `/subPackages/tools/compendium/swc/lineup-mapping-edit?compendiumId=${encodeURIComponent(COMPENDIUM_CODE)}&locale=${encodeURIComponent(selectedLocale.value)}`,
    })
  }

  const goEdit = (mappingId: string) => {
    if (!ensureLoginAccess(buildCurrentUrl())) return
    uni.navigateTo({
      url: `/subPackages/tools/compendium/swc/lineup-mapping-edit?mappingId=${encodeURIComponent(mappingId)}&compendiumId=${encodeURIComponent(COMPENDIUM_CODE)}&locale=${encodeURIComponent(selectedLocale.value)}`,
    })
  }

  const confirmDelete = (mappingId: string) => {
    uni.showModal({
      title: '删除映射',
      content: '删除后该映射将不再展示，确认继续吗？',
      success: async res => {
        if (!res.confirm) return
        deletingId.value = mappingId
        try {
          await deleteLineupMapping(mappingId)
          uni.showToast({ title: '删除成功', icon: 'success' })
          refreshList()
        } catch (error) {
          uni.showToast({ title: resolveError(error, '删除失败，请稍后重试'), icon: 'none' })
        } finally {
          deletingId.value = ''
        }
      },
    })
  }

  onShow(() => {
    reportToolVisit('compendium-lineup-mappings')
  })

  onLoad((options: Record<string, string | undefined>) => {
    selectedLocale.value = options.locale || DEFAULT_LOCALE
    uni.setNavigationBarTitle({ title: '魔灵召唤阵容映射' })
    refreshList()
  })

  onReachBottom(() => {
    loadMore()
  })
</script>

<style scoped lang="scss">
  .mapping-page {
    min-height: 100vh;
    background: #f6f7fb;
    color: #172033;
    padding-bottom: 180rpx;
  }

  .hero-banner {
    margin: 24rpx;
    padding: 28rpx;
    border-radius: 28rpx;
    background: linear-gradient(135deg, #134e4a 0%, #0f766e 100%);
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
    color: rgba(255, 255, 255, 0.8);
    font-size: 24rpx;
    line-height: 1.6;
  }

  .hero-badge {
    align-self: flex-start;
    padding: 8rpx 16rpx;
    border-radius: 999rpx;
    background: rgba(255, 255, 255, 0.16);
    font-size: 22rpx;
    font-weight: 800;
  }

  .mapping-card,
  .empty-block,
  .state-block {
    margin: 0 24rpx 20rpx;
    background: #fff;
    border-radius: 24rpx;
    box-shadow: 0 10rpx 30rpx rgba(15, 23, 42, 0.06);
  }

  .state-block,
  .empty-block {
    padding: 48rpx 28rpx;
    text-align: center;
    color: #667085;
    font-size: 28rpx;
  }

  .empty-block.inner {
    margin: 0;
    box-shadow: none;
    background: #f8fafc;
    padding: 28rpx;
    font-size: 24rpx;
  }

  .summary-row {
    margin: 0 24rpx 16rpx;
  }

  .summary-text {
    color: #667085;
    font-size: 24rpx;
    font-weight: 700;
  }

  .mapping-card {
    padding: 24rpx;
  }

  .mapping-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16rpx;
  }

  .mapping-desc {
    flex: 1;
    font-size: 30rpx;
    font-weight: 800;
    color: #172033;
    line-height: 1.5;
  }

  .card-actions {
    display: flex;
    gap: 12rpx;
  }

  .card-btn,
  .toolbar-btn {
    border-radius: 999rpx;
    font-size: 24rpx;
    font-weight: 700;
  }

  .card-btn.primary {
    background: #0f766e;
    color: #fff;
  }

  .card-btn.danger {
    color: #dc2626;
  }

  .container-block {
    margin-top: 22rpx;
  }

  .container-head {
    display: flex;
    align-items: center;
    gap: 14rpx;
    margin-bottom: 14rpx;
  }

  .container-badge {
    font-size: 22rpx;
    font-weight: 800;
    border-radius: 999rpx;
    padding: 6rpx 16rpx;
  }

  .container-badge.source {
    background: #ede9fe;
    color: #6d28d9;
  }

  .container-badge.target {
    background: #e0f2fe;
    color: #0369a1;
  }

  .container-count {
    color: #667085;
    font-size: 22rpx;
    font-weight: 700;
  }

  .item-list {
    display: flex;
    flex-direction: column;
    gap: 14rpx;
  }

  .item-card {
    padding: 18rpx 20rpx;
    border-radius: 18rpx;
    background: #f8fafc;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
    flex-wrap: wrap;
  }

  .item-main {
    min-width: 0;
    flex: 1;
    display: flex;
    align-items: center;
    gap: 12rpx;
  }

  .item-name {
    color: #172033;
    font-size: 28rpx;
    font-weight: 700;
  }

  .item-type {
    font-size: 22rpx;
    font-weight: 700;
    color: #0f766e;
    background: #ccfbf1;
    border-radius: 999rpx;
    padding: 4rpx 12rpx;
  }

  .reaction-row {
    display: flex;
    align-items: center;
    gap: 16rpx;
  }

  .reaction-btn {
    display: flex;
    align-items: center;
    padding: 8rpx 18rpx;
    border-radius: 999rpx;
    background: #eef2f7;
    color: #475467;
    font-size: 24rpx;
    font-weight: 700;
  }

  .reaction-btn.active {
    background: #0f766e;
    color: #fff;
  }

  .reaction-score {
    color: #667085;
    font-size: 22rpx;
    font-weight: 700;
  }

  .load-more {
    padding: 12rpx 24rpx 24rpx;
    text-align: center;
  }

  .fab {
    position: fixed;
    right: 40rpx;
    bottom: 60rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 128rpx;
    height: 128rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #0f766e 0%, #134e4a 100%);
    color: #fff;
    box-shadow: 0 16rpx 40rpx rgba(15, 118, 110, 0.4);
  }

  .fab-icon {
    font-size: 44rpx;
    font-weight: 800;
    line-height: 1;
  }

  .fab-text {
    margin-top: 4rpx;
    font-size: 20rpx;
    font-weight: 700;
  }
</style>
