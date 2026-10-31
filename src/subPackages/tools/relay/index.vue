<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { onLoad, onPullDownRefresh, onReachBottom, onShow, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
  import { getRelaysMine } from '@/services/apifox/NODEJSDEMO/RELAYS/apifox'
  import PageLayout from '@/components/PageLayout.vue'
  import { isUserLoggedIn } from '@/utils/autoLogin'
  import { getToken } from '@/utils/storage'
  import { buildRelayDetailRoute, RELAY_CREATE_ROUTE, RELAY_HOME_ROUTE, RELAY_SHARE_IMAGE_URL, getDeadlineLabel, getRelayStatusLabel, getRelayStatusTone, readRelayErrorMessage } from './constants'
  import { normalizeRelayMine } from './normalizers'
  import type { RelayMineItemViewModel } from './types'

  type RelayTab = 'participant' | 'owner'

  const activeTab = ref<RelayTab>('participant')
  const items = ref<RelayMineItemViewModel[]>([])
  const page = ref(1)
  const hasMore = ref(false)
  const isLoading = ref(false)
  const isLoadingMore = ref(false)
  const error = ref<unknown>(null)
  const hasLoaded = ref(false)
  const isLoggedIn = computed(() => isUserLoggedIn() || Boolean(getToken()))

  const load = async (reset = true): Promise<void> => {
    if (reset && isLoading.value) return
    if (!reset && (isLoadingMore.value || !hasMore.value)) return
    if (reset) isLoading.value = true
    else isLoadingMore.value = true
    error.value = null
    try {
      const nextPage = reset ? 1 : page.value + 1
      const raw: unknown = await getRelaysMine({ role: activeTab.value, page: nextPage, pageSize: 20 })
      const result = normalizeRelayMine(raw)
      items.value = reset ? result.items : [...items.value, ...result.items]
      page.value = result.pagination.page
      hasMore.value = result.pagination.hasNext
      hasLoaded.value = true
    } catch (loadError: unknown) {
      error.value = loadError
    } finally {
      isLoading.value = false
      isLoadingMore.value = false
    }
  }

  const switchTab = (tab: RelayTab) => {
    if (activeTab.value === tab) return
    activeTab.value = tab
    items.value = []
    void load()
  }

  const openCreate = () => {
    if (!isLoggedIn.value) {
      uni.navigateTo({ url: `/pages/mine/login/login?redirectUrl=${encodeURIComponent(RELAY_CREATE_ROUTE)}` })
      return
    }
    uni.navigateTo({ url: RELAY_CREATE_ROUTE })
  }

  const openDetail = (item: RelayMineItemViewModel) => uni.navigateTo({ url: buildRelayDetailRoute({ id: item.relay.id }) })

  const retry = (): void => {
    void load()
  }

  onLoad(() => void load())

  // #ifdef MP-WEIXIN
  uni.showShareMenu({ withShareTicket: true })
  onShareAppMessage(() => ({ title: '发起一个接龙，邀请大家一起参加', path: RELAY_HOME_ROUTE, imageUrl: RELAY_SHARE_IMAGE_URL }))
  onShareTimeline(() => ({ title: '发起一个接龙，邀请大家一起参加', query: '', imageUrl: RELAY_SHARE_IMAGE_URL }))
  // #endif

  onShow(() => {
    if (hasLoaded.value) void load()
  })
  onPullDownRefresh(async () => {
    try {
      await load()
    } finally {
      uni.stopPullDownRefresh()
    }
  })
  onReachBottom(() => void load(false))
</script>

<template>
  <PageLayout title="接龙" :back-fallback="'/pages/index/index'" nav-divider>
    <view class="relay-page">
      <view class="page-heading">
        <view>
          <text class="eyebrow">RELAY</text>
          <text class="heading-title">接龙</text>
          <text class="heading-hint">轻松发起报名，实时看见每一位参与者</text>
        </view>
        <button class="create-button" @click="openCreate">＋ 创建</button>
      </view>

      <view class="tabs">
        <button class="tab" :class="{ active: activeTab === 'participant' }" @click="switchTab('participant')">我参与的</button>
        <button class="tab" :class="{ active: activeTab === 'owner' }" @click="switchTab('owner')">我创建的</button>
      </view>

      <view v-if="isLoading && !items.length" class="state-panel">
        <text class="state-title">正在读取接龙</text>
        <text class="state-hint">请稍候…</text>
      </view>
      <view v-else-if="error && !items.length" class="state-panel">
        <text class="state-title">加载失败</text>
        <text class="state-hint">{{ readRelayErrorMessage(error) }}</text>
        <button class="secondary-button" @click="retry">重新加载</button>
      </view>
      <view v-else-if="!items.length" class="state-panel">
        <text class="state-icon">⌁</text>
        <text class="state-title">{{ activeTab === 'participant' ? '暂无参与的接龙' : '暂无创建的接龙' }}</text>
        <text class="state-hint">{{ activeTab === 'participant' ? '打开好友分享的接龙，就能在这里找到它' : '创建一个接龙，邀请朋友一起参加' }}</text>
        <button v-if="activeTab === 'owner'" class="secondary-button" @click="openCreate">创建接龙</button>
      </view>
      <template v-else>
        <view v-for="item in items" :key="item.relay.id" class="relay-card" @click="openDetail(item)">
          <view class="card-topline">
            <text class="card-title">{{ item.relay.title }}</text>
            <text class="status-chip" :class="`status-chip--${getRelayStatusTone(item.relay.status)}`">{{ getRelayStatusLabel(item.relay.status) }}</text>
          </view>
          <text v-if="item.relay.description" class="card-description">{{ item.relay.description }}</text>
          <view class="card-meta">
            <text>{{ item.participant ? `昵称：${item.participant.nickname}` : '打开查看参与情况' }}</text>
            <text>{{ getDeadlineLabel(item.relay) }}</text>
          </view>
          <text class="card-open">查看详情 ›</text>
        </view>
        <text v-if="isLoadingMore" class="list-status">正在加载更多…</text>
        <text v-else-if="!hasMore" class="list-status">没有更多了</text>
      </template>
    </view>
  </PageLayout>
</template>

<style scoped lang="scss">
  .relay-page {
    min-height: 100vh;
    padding: 28rpx 28rpx calc(80rpx + env(safe-area-inset-bottom));
    box-sizing: border-box;
    background: var(--theme-bg);
    color: var(--theme-text);
  }

  .page-heading,
  .card-topline,
  .card-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .page-heading {
    margin-bottom: 30rpx;
  }

  .eyebrow {
    display: block;
    color: var(--theme-brand);
    font-size: 20rpx;
    font-weight: 800;
    letter-spacing: 4rpx;
  }

  .heading-title {
    display: block;
    margin-top: 8rpx;
    font-size: 42rpx;
    font-weight: 800;
  }

  .heading-hint {
    display: block;
    margin-top: 8rpx;
    color: var(--theme-text-secondary);
    font-size: 23rpx;
  }

  .create-button,
  .secondary-button {
    height: 70rpx;
    margin: 0;
    padding: 0 24rpx;
    border-radius: 18rpx;
    background: var(--theme-brand);
    color: var(--theme-bg);
    font-size: 24rpx;
    line-height: 70rpx;
  }

  .create-button::after,
  .secondary-button::after,
  .tab::after {
    display: none;
  }

  .tabs {
    display: flex;
    margin-bottom: 20rpx;
    padding: 8rpx;
    border-radius: 18rpx;
    background: var(--theme-surface-2);
  }

  .tab {
    flex: 1;
    height: 64rpx;
    margin: 0;
    border-radius: 14rpx;
    background: transparent;
    color: var(--theme-text-secondary);
    font-size: 25rpx;
    line-height: 64rpx;
  }

  .tab.active {
    background: var(--theme-surface);
    color: var(--theme-brand);
    font-weight: 700;
  }

  .relay-card {
    position: relative;
    margin-bottom: 16rpx;
    padding: 24rpx 22rpx 22rpx;
    border-radius: 20rpx;
    background: var(--theme-surface);
    box-shadow: 0 8rpx 28rpx var(--theme-shadow-xs);
  }

  .card-title {
    flex: 1;
    color: var(--theme-text);
    font-size: 29rpx;
    font-weight: 700;
  }

  .status-chip {
    margin-left: 14rpx;
    padding: 6rpx 12rpx;
    border-radius: 999rpx;
    font-size: 20rpx;
  }

  .status-chip--success {
    background: var(--theme-surface-2);
    color: var(--theme-brand);
  }

  .status-chip--muted {
    background: var(--theme-surface-2);
    color: var(--theme-text-secondary);
  }

  .status-chip--danger {
    background: var(--theme-surface-2);
    color: var(--theme-danger);
  }

  .card-description {
    display: block;
    margin-top: 14rpx;
    color: var(--theme-text-secondary);
    font-size: 24rpx;
    line-height: 1.5;
  }

  .card-meta {
    margin-top: 20rpx;
    color: var(--theme-text-tertiary);
    font-size: 21rpx;
  }

  .card-open {
    display: block;
    margin-top: 16rpx;
    color: var(--theme-brand);
    font-size: 22rpx;
    text-align: right;
  }

  .state-panel {
    padding: 120rpx 20rpx;
    text-align: center;
  }

  .state-icon,
  .state-title,
  .state-hint {
    display: block;
  }

  .state-icon {
    color: var(--theme-brand);
    font-size: 74rpx;
  }

  .state-title {
    margin-top: 12rpx;
    color: var(--theme-text);
    font-size: 29rpx;
    font-weight: 700;
  }

  .state-hint {
    margin-top: 10rpx;
    color: var(--theme-text-tertiary);
    font-size: 23rpx;
    line-height: 1.5;
  }

  .state-panel .secondary-button {
    display: inline-block;
    margin-top: 28rpx;
  }

  .list-status {
    display: block;
    padding: 24rpx;
    color: var(--theme-text-tertiary);
    font-size: 22rpx;
    text-align: center;
  }
</style>
