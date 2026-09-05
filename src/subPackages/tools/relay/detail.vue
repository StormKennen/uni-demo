<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { onLoad, onPullDownRefresh, onReachBottom, onShareAppMessage, onShareTimeline, onShow } from '@dcloudio/uni-app'
  import PageLayout from '@/components/PageLayout.vue'
  import RelayEntryList from './components/RelayEntryList.vue'
  import RelayStatistics from './components/RelayStatistics.vue'
  import RelayStatusBanner from './components/RelayStatusBanner.vue'
  import { deleteRelaysEntries, patchRelaysRelayId } from '@/services/apifox/NODEJSDEMO/RELAYS/apifox'
  import { getToken } from '@/utils/storage'
  import { buildRelayDetailRoute, buildRelayManageRoute, buildRelaySubmitRoute, formatRelayDate, RELAY_HOME_ROUTE, RELAY_SHARE_IMAGE_URL, readRelayErrorMessage } from './constants'
  import { normalizeRelay } from './normalizers'
  import { useRelayDetail } from './composables/useRelayDetail'
  import { useRelayEntries } from './composables/useRelayEntries'
  import { getRelayShareCode, setRelayShareCode } from './share-code'
  import { buildRelayShareUrl } from '@/utilsH5/relay-share'
  import type { RelayEntryViewModel } from './types'

  const relayDetail = useRelayDetail()
  const relayEntries = useRelayEntries()
  const relayId = ref('')
  const shareCode = ref('')
  const hasLoaded = ref(false)
  const isSharing = ref(false)
  const isShown = ref(false)

  const detail = relayDetail.detail
  const canShowEntries = computed(() => Boolean(detail.value?.currentParticipant || detail.value?.permissions.canEditRelay))
  const sharePath = computed(() => {
    if (!detail.value) return RELAY_HOME_ROUTE
    return buildRelayDetailRoute({ id: detail.value.relay.id, shareCode: shareCode.value || detail.value.relay.share.shareCode || undefined })
  })
  const shareTitle = computed(() => `${detail.value?.relay.title || '接龙'}，等你参加`)

  const loadData = async () => {
    if (!shareCode.value && relayId.value) shareCode.value = getRelayShareCode(relayId.value)
    const loadedFromShare = Boolean(shareCode.value)
    let loaded = await relayDetail.load({ id: relayId.value, shareCode: shareCode.value })
    if (!loaded && loadedFromShare && relayId.value && getToken()) {
      loaded = await relayDetail.load({ id: relayId.value })
    }
    if (!loaded) return
    if (shareCode.value) setRelayShareCode(loaded.relay.id, shareCode.value)
    hasLoaded.value = true
    if (loaded.currentParticipant || loaded.permissions.canEditRelay) await relayEntries.load(loaded.relay.id)
  }

  const refresh = async () => {
    await loadData()
  }

  const openSubmit = () => {
    if (!detail.value) return
    // #ifdef H5
    if (!getToken()) {
      uni.navigateTo({ url: `/pages/mine/login/login?redirectUrl=${encodeURIComponent(buildRelaySubmitRoute(detail.value.relay.id, shareCode.value || undefined))}` })
      return
    }
    // #endif
    uni.navigateTo({ url: buildRelaySubmitRoute(detail.value.relay.id, shareCode.value) })
  }

  const openManage = () => {
    if (detail.value) uni.navigateTo({ url: buildRelayManageRoute(detail.value.relay.id, shareCode.value || undefined) })
  }

  const copyShareLink = async () => {
    if (!detail.value || isSharing.value) return
    isSharing.value = true
    try {
      let code = shareCode.value || detail.value.relay.share.shareCode || ''
      if (!detail.value.relay.share.enabled && !detail.value.permissions.canEditRelay) {
        uni.showToast({ title: '分享链接已关闭', icon: 'none' })
        return
      }
      if (!detail.value.relay.share.enabled && detail.value.permissions.canEditRelay) {
        const raw: unknown = await patchRelaysRelayId(detail.value.relay.id, { share: { enabled: true } })
        const relay = normalizeRelay(raw)
        code = code || relay.share.shareCode || ''
        detail.value = { ...detail.value, relay: { ...detail.value.relay, share: { ...detail.value.relay.share, ...relay.share, enabled: true } } }
      }
      if (!code && detail.value.permissions.canEditRelay) {
        const raw: unknown = await patchRelaysRelayId(detail.value.relay.id, { share: { enabled: true } })
        const relay = normalizeRelay(raw)
        code = relay.share.shareCode || ''
        if (code) setRelayShareCode(detail.value.relay.id, code)
        detail.value = { ...detail.value, relay: { ...detail.value.relay, share: { ...detail.value.relay.share, ...relay.share } } }
      }
      if (!code) {
        uni.showToast({ title: '暂时没有可用的分享链接', icon: 'none' })
        return
      }
      shareCode.value = code
      const link = buildRelayShareUrl(buildRelayDetailRoute({ shareCode: code }))
      uni.setClipboardData({ data: link, success: () => uni.showToast({ title: '分享链接已复制', icon: 'none' }) })
    } catch (error: unknown) {
      uni.showToast({ title: readRelayErrorMessage(error, '分享链接生成失败'), icon: 'none' })
    } finally {
      isSharing.value = false
    }
  }

  const withdraw = (entry: RelayEntryViewModel) => {
    if (!detail.value?.permissions.canWithdraw) return
    uni.showModal({
      title: '撤回接龙',
      content: '确认撤回本次接龙？撤回后统计会以服务端最新结果为准。',
      success: result => {
        if (!result.confirm) return
        void deleteRelaysEntries({ relayId: detail.value?.relay.id || '', entryId: entry.id }).then(
          () => {
            uni.showToast({ title: '已撤回', icon: 'none' })
            void refresh()
          },
          error => uni.showToast({ title: readRelayErrorMessage(error, '撤回失败，请重试'), icon: 'none' }),
        )
      },
    })
  }

  const editEntry = (entry: RelayEntryViewModel) => {
    if (entry.isMine && detail.value?.permissions.canEditOwnEntry) openSubmit()
  }

  // #ifdef MP-WEIXIN
  uni.showShareMenu({ withShareTicket: true })
  onShareAppMessage(() => ({ title: shareTitle.value, path: sharePath.value, imageUrl: RELAY_SHARE_IMAGE_URL }))
  onShareTimeline(() => ({ title: shareTitle.value, query: sharePath.value.split('?')[1] || '', imageUrl: RELAY_SHARE_IMAGE_URL }))
  // #endif

  onLoad((options: Record<string, string | undefined>) => {
    relayId.value = options.id?.trim() || ''
    shareCode.value = options.shareCode?.trim() || ''
    void loadData()
  })

  onShow(() => {
    if (isShown.value && hasLoaded.value) void loadData()
    isShown.value = true
  })

  onPullDownRefresh(async () => {
    try {
      await refresh()
    } finally {
      uni.stopPullDownRefresh()
    }
  })

  onReachBottom(() => {
    if (detail.value && canShowEntries.value) void relayEntries.loadMore(detail.value.relay.id)
  })
</script>

<template>
  <PageLayout title="接龙详情" :back-fallback="RELAY_HOME_ROUTE" nav-divider>
    <view class="detail-page">
      <view v-if="relayDetail.isLoading.value && !detail" class="state-panel"><text class="state-title">正在读取接龙</text><text class="state-hint">请稍候…</text></view>
      <view v-else-if="relayDetail.error.value && !detail" class="state-panel">
        <text class="state-title">{{ relayDetail.isNotFound.value ? '接龙不存在' : '加载失败' }}</text>
        <text class="state-hint">{{ readRelayErrorMessage(relayDetail.error.value, '分享链接可能已失效') }}</text>
        <button class="secondary-button" @click="loadData">重新加载</button>
      </view>
      <template v-else-if="detail">
        <view class="detail-header">
          <text class="eyebrow">RELAY DETAIL</text>
          <text class="detail-title">{{ detail.relay.title }}</text>
          <text v-if="detail.relay.description" class="detail-description">{{ detail.relay.description }}</text>
          <text class="detail-deadline">{{ detail.relay.settings.deadline ? `截止：${formatRelayDate(detail.relay.settings.deadline)}` : '不限制截止时间' }}</text>
        </view>

        <RelayStatusBanner :relay="detail.relay" :permissions="detail.permissions" />
        <RelayStatistics :detail="detail" />

        <view v-if="!canShowEntries" class="share-view-hint">
          <text>通过分享链接可以查看接龙概况</text>
          <text>参与后即可查看完整接龙列表并管理自己的记录</text>
        </view>
        <view v-else class="entries-section">
          <view class="section-heading"><text class="section-title">参与列表</text><text class="section-hint">按接龙序号排列</text></view>
          <view v-if="relayEntries.isLoading.value && !relayEntries.entries.value.length" class="list-loading">正在加载参与列表…</view>
          <RelayEntryList
            v-else
            :entries="relayEntries.entries.value"
            :fields="detail.relay.fields"
            :show-sequence="detail.relay.settings.showSequence"
            :can-edit="detail.permissions.canEditOwnEntry"
            :can-withdraw="detail.permissions.canWithdraw"
            :loading-more="relayEntries.isLoadingMore.value"
            :has-more="relayEntries.pagination.value.hasNext"
            :error="relayEntries.error.value ? readRelayErrorMessage(relayEntries.error.value) : ''"
            @load-more="relayEntries.loadMore(detail.relay.id)"
            @edit="editEntry"
            @withdraw="withdraw" />
        </view>

        <view class="bottom-actions">
          <button v-if="detail.permissions.canSubmit || detail.permissions.canJoin" class="primary-button" @click="openSubmit">
            {{ detail.currentParticipant ? '修改我的接龙' : '参与接龙' }}
          </button>
          <button v-if="detail.permissions.canEditRelay" class="secondary-button" @click="openManage">管理接龙</button>
          <button v-if="detail.permissions.canEditRelay" class="secondary-button" :disabled="isSharing" @click="copyShareLink">{{ isSharing ? '生成中…' : '复制分享链接' }}</button>
        </view>
      </template>
    </view>
  </PageLayout>
</template>

<style scoped lang="scss">
  .detail-page {
    min-height: 100vh;
    padding: 28rpx 28rpx calc(100rpx + env(safe-area-inset-bottom));
    box-sizing: border-box;
    background: var(--theme-bg);
    color: var(--theme-text);
  }

  .detail-header {
    padding: 12rpx 4rpx 28rpx;
  }

  .eyebrow {
    display: block;
    color: var(--theme-brand);
    font-size: 20rpx;
    font-weight: 800;
    letter-spacing: 4rpx;
  }

  .detail-title {
    display: block;
    margin-top: 10rpx;
    color: var(--theme-text);
    font-size: 42rpx;
    font-weight: 800;
    word-break: break-all;
  }

  .detail-description,
  .detail-deadline {
    display: block;
    margin-top: 12rpx;
    color: var(--theme-text-secondary);
    font-size: 24rpx;
    line-height: 1.5;
  }

  .detail-deadline {
    color: var(--theme-brand);
  }

  .share-view-hint,
  .list-loading {
    padding: 60rpx 20rpx;
    color: var(--theme-text-tertiary);
    font-size: 23rpx;
    line-height: 1.7;
    text-align: center;
  }

  .share-view-hint text {
    display: block;
  }

  .section-heading {
    display: flex;
    align-items: baseline;
    margin-bottom: 16rpx;
  }

  .section-title {
    color: var(--theme-text);
    font-size: 29rpx;
    font-weight: 700;
  }

  .section-hint {
    margin-left: 12rpx;
    color: var(--theme-text-tertiary);
    font-size: 22rpx;
  }

  .bottom-actions {
    position: sticky;
    bottom: 20rpx;
    z-index: 3;
    display: flex;
    flex-direction: column;
    gap: 12rpx;
    margin-top: 26rpx;
    padding: 12rpx 0;
    background: var(--theme-bg);
  }

  .primary-button,
  .secondary-button {
    width: 100%;
    height: 82rpx;
    margin: 0;
    border-radius: 18rpx;
    font-size: 27rpx;
    line-height: 82rpx;
  }

  .primary-button {
    background: var(--theme-brand);
    color: var(--theme-bg);
  }

  .secondary-button {
    border: 1rpx solid var(--theme-border);
    background: var(--theme-surface);
    color: var(--theme-brand);
  }

  .primary-button::after,
  .secondary-button::after {
    display: none;
  }

  .state-panel {
    padding: 120rpx 20rpx;
    text-align: center;
  }

  .state-title,
  .state-hint {
    display: block;
  }

  .state-title {
    color: var(--theme-text);
    font-size: 30rpx;
    font-weight: 700;
  }

  .state-hint {
    margin-top: 10rpx;
    color: var(--theme-text-tertiary);
    font-size: 23rpx;
  }

  .state-panel .secondary-button {
    display: inline-block;
    width: auto;
    margin-top: 28rpx;
    padding: 0 28rpx;
  }
</style>
