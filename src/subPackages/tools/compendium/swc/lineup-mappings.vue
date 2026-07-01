<template>
  <view class="mapping-page">
    <view class="hero-banner">
      <view>
        <text class="hero-title">魔灵召唤阵容映射</text>
        <text class="hero-subtitle">
          浏览「源阵容 → 目标阵容」的容器化映射，点击查看详情。{{ isLoggedIn ? '登录用户可创建映射。' : '登录后可创建映射。' }}
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

      <view v-for="mapping in mappings" :key="mapping.id" class="mapping-card" @click="goDetail(mapping.id)">
        <view class="mapping-main">
          <text class="mapping-name">{{ mapping.name || '未命名映射' }}</text>
          <text class="mapping-desc">{{ mapping.description || '暂无描述' }}</text>
          <view class="mapping-meta">
            <text class="meta-chip">源 {{ mapping.sourceContainer.items.length }}</text>
            <text class="meta-chip">目标 {{ mapping.targetContainer.items.length }}</text>
          </view>
        </view>
        <view class="mapping-tail">
          <button
            v-if="isAdmin"
            class="card-btn danger"
            size="mini"
            :loading="deletingId === mapping.id"
            @click.stop="confirmDelete(mapping.id)">
            删除
          </button>
          <text class="mapping-arrow">›</text>
        </view>
      </view>

      <view v-if="pagination.hasNext" class="load-more">
        <button class="toolbar-btn" :loading="loadingMore" @click="loadMore">加载更多</button>
      </view>
    </view>

    <view class="fab" @click="openCreate">
      <text class="fab-icon">+</text>
      <text class="fab-text">{{ isLoggedIn ? '创建映射' : '登录创建' }}</text>
    </view>

    <view v-if="createVisible" class="modal-mask" @click="closeCreate">
      <view class="create-panel" @click.stop>
        <text class="create-title">创建阵容映射</text>

        <text class="field-label">映射名称</text>
        <input v-model="createName" class="name-input" placeholder="请输入映射名称" maxlength="60" />

        <text class="field-label">映射描述</text>
        <textarea
          v-model="createDescription"
          class="desc-input"
          placeholder="例如：防守阵容 → 进攻反制（最长 500 字，可选）"
          maxlength="500"
          auto-height />

        <view class="create-actions">
          <button class="footer-btn ghost" size="mini" @click="closeCreate">取消</button>
          <button class="footer-btn primary" size="mini" :loading="creating" :disabled="!createName.trim()" @click="submitCreate">
            确认创建
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { onLoad, onShow, onReachBottom } from '@dcloudio/uni-app'
  import StateBlock from './components/state-block.vue'
  import { reportToolVisit } from '@/utils/tracker'
  import {
    createLineupMapping,
    deleteLineupMapping,
    fetchLineupMappings,
    type LineupMapping,
    type PaginationState,
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

  const createVisible = ref(false)
  const createName = ref('')
  const createDescription = ref('')
  const creating = ref(false)

  const isAdmin = computed(() => isAdminUser())
  const isLoggedIn = computed(() => !!getToken())

  const buildCurrentUrl = (): string =>
    `/subPackages/tools/compendium/swc/lineup-mappings?compendiumId=${encodeURIComponent(COMPENDIUM_CODE)}&locale=${encodeURIComponent(selectedLocale.value)}`

  const loadPage = async (page: number) => {
    const result = await fetchLineupMappings({ compendiumId: COMPENDIUM_CODE, page, limit: PAGE_SIZE })
    pagination.value = result.pagination
    mappings.value = page <= 1 ? result.items : [...mappings.value, ...result.items]
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

  const goDetail = (mappingId: string) => {
    uni.navigateTo({
      url: `/subPackages/tools/compendium/swc/lineup-mapping-detail?mappingId=${encodeURIComponent(mappingId)}&compendiumId=${encodeURIComponent(COMPENDIUM_CODE)}&locale=${encodeURIComponent(selectedLocale.value)}`,
    })
  }

  const openCreate = () => {
    if (!ensureLoginAccess(buildCurrentUrl())) return
    createName.value = ''
    createDescription.value = ''
    createVisible.value = true
  }

  const closeCreate = () => {
    if (creating.value) return
    createVisible.value = false
  }

  const submitCreate = async () => {
    if (creating.value || !createName.value.trim()) return
    creating.value = true
    try {
      const created = await createLineupMapping({
        compendiumId: COMPENDIUM_CODE,
        name: createName.value.trim(),
        description: createDescription.value.trim() || undefined,
      })
      uni.showToast({ title: '创建成功', icon: 'success' })
      createVisible.value = false
      await refreshList()
      if (created.id) goDetail(created.id)
    } catch (error) {
      uni.showToast({ title: resolveError(error, '创建失败，请稍后重试'), icon: 'none' })
    } finally {
      creating.value = false
    }
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
    display: flex;
    align-items: center;
    gap: 16rpx;
  }

  .mapping-main {
    flex: 1;
    min-width: 0;
  }

  .mapping-name {
    display: block;
    font-size: 30rpx;
    font-weight: 800;
    color: #172033;
  }

  .mapping-desc {
    display: block;
    margin-top: 8rpx;
    color: #667085;
    font-size: 24rpx;
    line-height: 1.6;
  }

  .mapping-meta {
    margin-top: 14rpx;
    display: flex;
    gap: 12rpx;
  }

  .meta-chip {
    font-size: 20rpx;
    font-weight: 700;
    color: #0f766e;
    background: #ccfbf1;
    border-radius: 999rpx;
    padding: 4rpx 14rpx;
  }

  .mapping-tail {
    display: flex;
    align-items: center;
    gap: 12rpx;
    flex-shrink: 0;
  }

  .mapping-arrow {
    font-size: 44rpx;
    font-weight: 300;
    color: #cbd5e1;
    line-height: 1;
  }

  .card-btn,
  .toolbar-btn {
    border-radius: 999rpx;
    font-size: 24rpx;
    font-weight: 700;
  }

  .card-btn.danger {
    color: #dc2626;
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

  .modal-mask {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    padding: 40rpx;
    box-sizing: border-box;
  }

  .create-panel {
    width: 100%;
    background: #fff;
    border-radius: 28rpx;
    padding: 32rpx;
    box-sizing: border-box;
  }

  .create-title {
    display: block;
    font-size: 32rpx;
    font-weight: 800;
    color: #172033;
    margin-bottom: 20rpx;
  }

  .field-label {
    display: block;
    margin: 16rpx 0 12rpx;
    color: #667085;
    font-size: 24rpx;
    font-weight: 700;
  }

  .name-input,
  .desc-input {
    width: 100%;
    padding: 20rpx;
    border-radius: 18rpx;
    background: #f8fafc;
    font-size: 26rpx;
    color: #172033;
    box-sizing: border-box;
  }

  .desc-input {
    min-height: 140rpx;
    line-height: 1.6;
  }

  .create-actions {
    margin-top: 28rpx;
    display: flex;
    justify-content: flex-end;
    gap: 16rpx;
  }

  .footer-btn {
    border-radius: 999rpx;
    font-size: 26rpx;
    font-weight: 700;
    padding: 0 32rpx;
  }

  .footer-btn.ghost {
    background: #eef2f7;
    color: #475467;
  }

  .footer-btn.primary {
    background: #0f766e;
    color: #fff;
  }
</style>
