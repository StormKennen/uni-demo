<script setup lang="ts">
  import { onLoad, onPullDownRefresh, onReachBottom, onShow } from '@dcloudio/uni-app'
  import { computed, ref } from 'vue'
  import QuickShipReceiptList from './components/QuickShipReceiptList.vue'
  import QuickShipSentRecordList from './components/QuickShipSentRecordList.vue'
  import PageLayout from '@/components/PageLayout.vue'
  import { getQuickTransferToolSharePayload, QUICK_TRANSFER_TOOL_SHARE_TITLE } from '@/features/quick-transfer/share'
  import { QUICK_TRANSFER_RECEIVE_ROUTE, QUICK_TRANSFER_SEND_CREATE_ROUTE } from '@/features/quick-transfer/constants'
  import type { QuickTransferManagementTab } from '@/features/quick-transfer/types'
  import { getToken } from '@/utils/storage'

  const activeTab = ref<QuickTransferManagementTab>('operation')
  const isMiniProgram = ref(false)
  const isLoggedIn = ref(false)
  const historyRefreshKey = ref(0)
  const sentListRef = ref<InstanceType<typeof QuickShipSentRecordList> | null>(null)
  const receiptListRef = ref<InstanceType<typeof QuickShipReceiptList> | null>(null)

  // #ifdef MP-WEIXIN
  isMiniProgram.value = true
  // #endif

  const sharePayload = getQuickTransferToolSharePayload()
  const canViewHistory = computed(() => isMiniProgram.value || isLoggedIn.value)

  const readTab = (value?: string): QuickTransferManagementTab => {
    if (value === 'sent' || value === 'received') return value
    return 'operation'
  }

  const setTab = (tab: QuickTransferManagementTab) => {
    activeTab.value = tab
  }

  const openSendCreate = () => {
    uni.navigateTo({ url: QUICK_TRANSFER_SEND_CREATE_ROUTE })
  }

  const openReceive = () => {
    uni.navigateTo({ url: QUICK_TRANSFER_RECEIVE_ROUTE })
  }

  const refreshPageState = () => {
    isLoggedIn.value = Boolean(getToken())
    historyRefreshKey.value += 1
  }

  onLoad(options => {
    const query = (options || {}) as { mode?: string; shareToken?: string; tab?: string }
    if (query.shareToken?.trim()) {
      uni.redirectTo({ url: `${QUICK_TRANSFER_RECEIVE_ROUTE}?shareToken=${encodeURIComponent(query.shareToken.trim())}` })
      return
    }
    if (query.mode === 'receive') {
      uni.redirectTo({ url: QUICK_TRANSFER_RECEIVE_ROUTE })
      return
    }
    activeTab.value = readTab(query.tab)
  })

  onShow(refreshPageState)

  onPullDownRefresh(async () => {
    if (activeTab.value === 'sent') await sentListRef.value?.refresh()
    if (activeTab.value === 'received') await receiptListRef.value?.refresh()
    uni.stopPullDownRefresh()
  })

  onReachBottom(() => {
    if (activeTab.value === 'sent') void sentListRef.value?.loadMore()
    if (activeTab.value === 'received') void receiptListRef.value?.loadMore()
  })
</script>

<template>
  <PageLayout
    title=""
    :share-title="sharePayload.title"
    :share-path="sharePayload.path"
    :share-image-url="sharePayload.imageUrl"
    :share-timeline-title="QUICK_TRANSFER_TOOL_SHARE_TITLE"
    nav-overlay
    nav-bg-color="transparent"
    nav-init-bg-color="transparent"
    nav-custom-class="light">
    <view class="quick-transfer-page">
      <view class="hero-panel">
        <view class="hero-glow hero-glow--left"></view>
        <view class="hero-glow hero-glow--right"></view>
        <view class="hero-orbit hero-orbit--one"></view>
        <view class="hero-orbit hero-orbit--two"></view>
        <text class="hero-kicker">FAST TRANSFER</text>
        <text class="hero-title">飞船</text>
        <text class="hero-desc">跨设备快速传递内容</text>
      </view>

      <view class="management-sheet">
        <view class="management-tabs">
          <view class="management-tab" :class="{ active: activeTab === 'operation' }" @click="setTab('operation')">操作</view>
          <view class="management-tab" :class="{ active: activeTab === 'sent' }" @click="setTab('sent')">我发送的</view>
          <view class="management-tab" :class="{ active: activeTab === 'received' }" @click="setTab('received')">我收到的</view>
        </view>

        <view v-if="activeTab === 'operation'" class="operation-content">
          <view class="operation-card operation-card--send" @click="openSendCreate">
            <view class="operation-card__icon">🚀</view>
            <view class="operation-card__main">
              <text class="operation-card__title">发送飞船</text>
              <text class="operation-card__description">发送文字、图片、文件给别人</text>
            </view>
            <text class="operation-card__arrow">›</text>
          </view>
          <view class="operation-card operation-card--receive" @click="openReceive">
            <view class="operation-card__icon">↓</view>
            <view class="operation-card__main">
              <text class="operation-card__title">接收飞船</text>
              <text class="operation-card__description">使用 6 位飞船码接收内容</text>
            </view>
            <text class="operation-card__arrow">›</text>
          </view>
        </view>

        <QuickShipSentRecordList
          ref="sentListRef"
          v-else-if="activeTab === 'sent'"
          :can-view-history="canViewHistory"
          :refresh-key="historyRefreshKey"
          embedded />
        <QuickShipReceiptList v-else ref="receiptListRef" :can-view-history="canViewHistory" :refresh-key="historyRefreshKey" embedded />
      </view>
    </view>
  </PageLayout>
</template>

<style lang="scss">
  .quick-transfer-page {
    min-height: 100vh;
    box-sizing: border-box;
    background: var(--theme-bg);
  }

  .hero-panel {
    position: relative;
    min-height: 300rpx;
    padding: 132rpx 34rpx 66rpx;
    overflow: hidden;
    box-sizing: border-box;
    color: #fff;
    background: linear-gradient(155deg, #071426 0%, #102b51 48%, #07566a 100%);
    text-align: center;
  }

  .hero-glow,
  .hero-orbit {
    position: absolute;
    pointer-events: none;
  }

  .hero-glow {
    width: 300rpx;
    height: 220rpx;
    border-radius: 50%;
    filter: blur(46rpx);
    opacity: 0.5;
  }

  .hero-glow--left {
    top: 78rpx;
    left: -110rpx;
    background: rgba(37, 99, 235, 0.68);
  }

  .hero-glow--right {
    right: -100rpx;
    bottom: 16rpx;
    background: rgba(20, 184, 166, 0.62);
  }

  .hero-orbit {
    width: 500rpx;
    height: 130rpx;
    border: 1rpx solid rgba(165, 243, 252, 0.22);
    border-radius: 50%;
    transform: rotate(-15deg);
  }

  .hero-orbit--one {
    top: 138rpx;
    left: -230rpx;
  }

  .hero-orbit--two {
    right: -230rpx;
    bottom: 60rpx;
    transform: rotate(22deg);
  }

  .hero-kicker,
  .hero-title,
  .hero-desc {
    position: relative;
    z-index: 1;
    display: block;
  }

  .hero-kicker {
    color: rgba(255, 255, 255, 0.62);
    font-size: 20rpx;
    font-weight: 700;
    letter-spacing: 5rpx;
  }

  .hero-title {
    margin-top: 10rpx;
    font-size: 60rpx;
    font-weight: 800;
    letter-spacing: 8rpx;
  }

  .hero-desc {
    margin-top: 6rpx;
    color: rgba(255, 255, 255, 0.8);
    font-size: 27rpx;
  }

  .management-sheet {
    position: relative;
    z-index: 2;
    min-height: calc(100vh - 264rpx);
    margin-top: -28rpx;
    padding: 18rpx 28rpx calc(72rpx + env(safe-area-inset-bottom));
    box-sizing: border-box;
    border-radius: 34rpx 34rpx 0 0;
    background: var(--theme-bg);
  }

  .management-tabs {
    display: flex;
    border-bottom: 1rpx solid var(--theme-border);
  }

  .management-tab {
    position: relative;
    flex: 1;
    padding: 22rpx 0 18rpx;
    color: var(--theme-text-secondary);
    font-size: 26rpx;
    text-align: center;
  }

  .management-tab.active {
    color: var(--theme-text);
    font-weight: 700;
  }

  .management-tab.active::after {
    position: absolute;
    right: 22rpx;
    bottom: -1rpx;
    left: 22rpx;
    height: 5rpx;
    border-radius: 5rpx;
    background: var(--theme-brand);
    content: '';
  }

  .operation-content {
    padding-top: 28rpx;
  }

  .operation-card {
    display: flex;
    align-items: center;
    gap: 20rpx;
    min-height: 156rpx;
    margin-bottom: 18rpx;
    padding: 24rpx 22rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 24rpx;
    background: var(--theme-surface);
    box-shadow: 0 12rpx 30rpx var(--theme-shadow-xs);
  }

  .operation-card__icon {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    width: 82rpx;
    height: 82rpx;
    border-radius: 24rpx;
    color: #fff;
    background: linear-gradient(135deg, #2563eb, #14b8a6);
    font-size: 38rpx;
  }

  .operation-card--receive .operation-card__icon {
    color: var(--theme-brand);
    background: var(--theme-surface-muted);
    font-size: 46rpx;
    font-weight: 700;
  }

  .operation-card__main {
    flex: 1;
    min-width: 0;
  }

  .operation-card__title,
  .operation-card__description {
    display: block;
  }

  .operation-card__title {
    color: var(--theme-text);
    font-size: 31rpx;
    font-weight: 800;
  }

  .operation-card__description {
    margin-top: 8rpx;
    color: var(--theme-text-secondary);
    font-size: 23rpx;
  }

  .operation-card__arrow {
    flex: 0 0 auto;
    color: var(--theme-text-secondary);
    font-size: 46rpx;
  }
</style>
