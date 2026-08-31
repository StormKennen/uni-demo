<script setup lang="ts">
  import { onLoad, onPullDownRefresh, onReachBottom, onShow } from '@dcloudio/uni-app'
  import { computed, ref } from 'vue'
  import QuickShipReceiptList from './components/QuickShipReceiptList.vue'
  import QuickShipSentRecordList from './components/QuickShipSentRecordList.vue'
  import PageLayout from '@/components/PageLayout.vue'
  import { registerQuickTransferPageShare } from '@/features/quick-transfer/pageShare'
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
  registerQuickTransferPageShare(sharePayload)
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
          <button class="operation-button operation-button--send" hover-class="operation-button--hover" @click="openSendCreate">
            <!-- <uni-icons type="paperplane" size="24" color="#ffffff" /> -->
            <text>发船</text>
          </button>
          <button class="operation-button operation-button--receive" hover-class="operation-button--hover" @click="openReceive">
            <!-- <uni-icons type="down" size="24" color="var(--theme-brand)" /> -->
            <text>收船</text>
          </button>
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
    min-height: 280rpx;
    padding: 132rpx 34rpx 54rpx;
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

  .hero-title,
  .hero-desc {
    position: relative;
    z-index: 1;
    display: block;
  }

  .hero-title {
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
    display: flex;
    gap: 18rpx;
    padding-top: 24rpx;
  }

  .operation-button {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    height: 104rpx;
    margin: 0;
    padding: 0 12rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 22rpx;
    font-size: 28rpx;
    font-weight: 700;
  }

  .operation-button::after {
    border: 0;
  }

  .operation-button--send {
    color: #fff;
    background: linear-gradient(135deg, #2563eb, #14b8a6);
  }

  .operation-button--receive {
    color: var(--theme-brand);
    background: var(--theme-surface-muted);
  }

  .operation-button--hover {
    opacity: 0.82;
  }
</style>
