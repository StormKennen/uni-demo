<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { onHide, onLoad, onShow, onUnload } from '@dcloudio/uni-app'
  import QuickShipReceivedContent from '../components/QuickShipReceivedContent.vue'
  import PageLayout from '@/components/PageLayout.vue'
  import { QUICK_TRANSFER_ROUTE } from '@/features/quick-transfer/constants'
  import { isQuickTransferDownloadValid } from '@/features/quick-transfer/helpers'
  import { formatQuickTransferReceiptDate, getQuickTransferSentStatusLabel } from '@/features/quick-transfer/presentation'
  import { isValidQuickTransferSentRecordId } from '@/features/quick-transfer/sentRecordApi'
  import { useQuickTransferSentRecords } from '@/features/quick-transfer/useQuickTransferSentRecords'
  import type { QuickTransferContentReference } from '@/features/quick-transfer/types'
  import { downloadFileDirect } from '@/platform/file'
  import { openQuickTransferReference } from '@/features/quick-transfer/reference/registry'
  import { safeBack } from '@/utils/navigation'
  import { openQuickTransferBrowserUrl } from '@/utilsH5/quick-transfer-url'

  const sentRecords = useQuickTransferSentRecords()
  const { detail, error, isLoading, isDeleting, isRecalling, isDownloading } = sentRecords
  const sentRecordId = ref('')
  const isInvalidSentRecordId = ref(false)
  const isSentRecordNotFound = computed(() => error.value?.code === 'QUICK_TRANSFER_SENT_RECORD_NOT_FOUND')
  let progressTimer: ReturnType<typeof setInterval> | undefined

  const loadDetail = () => {
    isInvalidSentRecordId.value = !isValidQuickTransferSentRecordId(sentRecordId.value)
    if (!isInvalidSentRecordId.value) void sentRecords.loadSentRecordDetail(sentRecordId.value)
  }

  const startProgressPolling = () => {
    if (progressTimer || isInvalidSentRecordId.value) return
    progressTimer = setInterval(() => {
      if (!isLoading.value && !isRecalling.value && !isDeleting.value) void sentRecords.refreshSentRecordDetail()
    }, 3000)
  }

  const stopProgressPolling = () => {
    if (!progressTimer) return
    clearInterval(progressTimer)
    progressTimer = undefined
  }

  const backToSentRecordList = () => {
    safeBack({ fallbackUrl: `${QUICK_TRANSFER_ROUTE}?tab=sent` })
  }

  const copyText = () => {
    const text = sentRecords.detail.value?.content.text || ''
    if (text) uni.setClipboardData({ data: text, success: () => uni.showToast({ title: '留言已复制', icon: 'none' }) })
  }

  const openUrl = (url: string) => {
    // #ifdef H5
    openQuickTransferBrowserUrl(url)
    // #endif
    // #ifdef MP-WEIXIN
    uni.setClipboardData({ data: url, success: () => uni.showToast({ title: '链接已复制', icon: 'none' }) })
    // #endif
  }

  const openReference = (reference: QuickTransferContentReference) => openQuickTransferReference(reference)

  const downloadFile = async (fileId: string) => {
    const file = sentRecords.detail.value?.content.files.find(item => item.fileId === fileId)
    if (!file || file.available === false || sentRecords.isDownloading.value || !sentRecordId.value) return
    const access = await sentRecords.accessSentRecordFile(sentRecordId.value, fileId)
    if (!access) {
      const code = sentRecords.error.value?.code
      if (code === 'QUICK_TRANSFER_SENT_FILE_NOT_AVAILABLE' || code === 'QUICK_TRANSFER_SENT_FILE_NOT_FOUND') {
        sentRecords.markFileUnavailable(fileId)
      }
      if (sentRecords.error.value?.message) uni.showToast({ title: sentRecords.error.value.message, icon: 'none' })
      return
    }
    if (!isQuickTransferDownloadValid(access.expiresAt)) {
      uni.showToast({ title: '文件访问链接已失效，请重新打开', icon: 'none' })
      return
    }
    const success = await downloadFileDirect({ url: access.url, fileName: file.name, mimeType: file.mimeType })
    if (!success) uni.showToast({ title: '文件打开失败，请稍后重试', icon: 'none' })
  }

  const confirmRecall = () => {
    const current = detail.value
    if (!current?.canRecall || sentRecords.isRecalling.value || sentRecords.isDeleting.value) return
    uni.showModal({
      title: '召回飞船',
      content: '确定召回这艘飞船？\n\n召回后其他人将无法继续领取，\n已经领取的内容不会受到影响。',
      success: result => {
        if (!result.confirm) return
        void sentRecords.recallSentRecord().then(success => {
          if (success) {
            uni.showToast({ title: '飞船已召回', icon: 'none' })
            return
          }
          if (sentRecords.error.value?.code === 'TRANSFER_NOT_FOUND' || sentRecords.error.value?.code === 'TRANSFER_NOT_AVAILABLE') {
            void sentRecords.refreshSentRecordDetail()
            uni.showToast({ title: '飞船状态已经更新', icon: 'none' })
            return
          }
          if (sentRecords.error.value?.message) uni.showToast({ title: sentRecords.error.value.message, icon: 'none' })
        })
      },
    })
  }

  const confirmDelete = () => {
    const current = detail.value
    if (!current || sentRecords.isDeleting.value || sentRecords.isRecalling.value) return
    const content = current.canRecall
      ? '删除这条发送记录？\n\n这不会召回正在传输的飞船，\n其他人仍然可以继续领取。'
      : '删除这条发送记录？\n\n只会删除历史记录，\n不会影响对方已经收到的内容。'
    uni.showModal({
      title: '删除发送记录',
      content,
      success: result => {
        if (!result.confirm) return
        void sentRecords.deleteSentRecord(current.sentRecordId).then(success => {
          if (success) {
            uni.navigateBack()
            return
          }
          if (sentRecords.error.value?.message) uni.showToast({ title: sentRecords.error.value.message, icon: 'none' })
        })
      },
    })
  }

  onLoad((options: Record<string, string | undefined>) => {
    sentRecordId.value = options.sentRecordId?.trim() || ''
    loadDetail()
    startProgressPolling()
  })

  onShow(() => startProgressPolling())
  onHide(stopProgressPolling)
  onUnload(stopProgressPolling)
</script>

<template>
  <PageLayout title="我发送的" :back-fallback="`${QUICK_TRANSFER_ROUTE}?tab=sent`" nav-gradient="linear-gradient(135deg, #2563eb, #14b8a6)">
    <view class="sent-detail-page">
      <view v-if="isInvalidSentRecordId" class="state-panel">
        <text class="state-title">记录参数无效</text>
        <text class="state-description">找不到要查看的发送记录。</text>
        <button class="quick-ship-button secondary-button" @click="backToSentRecordList">返回我发送的</button>
      </view>

      <view v-else-if="isLoading && !detail" class="state-panel">
        <text class="state-title">正在读取发送记录</text>
        <text class="state-description">请稍候…</text>
      </view>

      <view v-else-if="error && !detail" class="state-panel">
        <text class="state-title">{{ isSentRecordNotFound ? '记录不存在' : '加载失败' }}</text>
        <text class="state-description">{{ error.message }}</text>
        <button v-if="isSentRecordNotFound" class="quick-ship-button secondary-button" @click="backToSentRecordList">返回我发送的</button>
        <button v-else class="quick-ship-button secondary-button" @click="loadDetail">重新加载</button>
      </view>

      <template v-else-if="detail">
        <view class="detail-heading">
          <text class="detail-kicker">SENT SHIP</text>
          <text class="detail-title">{{ detail.displayTitle }}</text>
          <text class="detail-meta">{{ formatQuickTransferReceiptDate(detail.sentAt) }} 发送</text>
        </view>

        <view class="status-card">
          <view class="status-card__line">
            <text class="status-card__label">状态</text>
            <text class="status-card__value">{{ getQuickTransferSentStatusLabel(detail.status) }}</text>
          </view>
          <view class="status-card__line">
            <text class="status-card__label">领取进度</text>
            <text class="status-card__value">已领取 {{ detail.claimCount }} / {{ detail.maxClaims }}</text>
          </view>
        </view>

        <QuickShipReceivedContent
          :content="detail.content"
          context="sent"
          :is-downloading="isDownloading"
          @copy-text="copyText"
          @open-url="openUrl"
          @download-file="downloadFile"
          @open-reference="openReference" />

        <view class="detail-actions">
          <button v-if="detail.canRecall" class="quick-ship-button recall-button" :disabled="isRecalling" @click="confirmRecall">
            {{ isRecalling ? '召回中…' : '召回飞船' }}
          </button>
          <button class="quick-ship-button delete-button" :disabled="isDeleting" @click="confirmDelete">
            {{ isDeleting ? '删除中…' : '删除记录' }}
          </button>
          <text class="delete-hint">删除历史不会自动召回飞船</text>
        </view>
      </template>
    </view>
  </PageLayout>
</template>

<style scoped lang="scss">
  .sent-detail-page {
    min-height: 100vh;
    padding: 28rpx 28rpx calc(72rpx + env(safe-area-inset-bottom));
    box-sizing: border-box;
    color: var(--theme-text);
  }

  .detail-heading {
    padding: 18rpx 4rpx 28rpx;
    text-align: center;
  }

  .detail-kicker {
    display: block;
    color: var(--theme-brand);
    font-size: 19rpx;
    font-weight: 700;
    letter-spacing: 3rpx;
  }

  .detail-title {
    display: block;
    margin-top: 10rpx;
    color: var(--theme-text);
    font-size: 40rpx;
    font-weight: 800;
    word-break: break-all;
  }

  .detail-meta,
  .state-description,
  .delete-hint {
    display: block;
    margin-top: 10rpx;
    color: var(--theme-text-secondary);
    font-size: 23rpx;
  }

  .status-card {
    margin-bottom: 22rpx;
    padding: 20rpx 22rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 18rpx;
    background: var(--theme-surface);
  }

  .status-card__line {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 48rpx;
  }

  .status-card__label {
    color: var(--theme-text-secondary);
    font-size: 24rpx;
  }

  .status-card__value {
    color: var(--theme-text);
    font-size: 26rpx;
    font-weight: 700;
  }

  .state-panel {
    padding: 110rpx 28rpx;
    text-align: center;
  }

  .state-title {
    display: block;
    color: var(--theme-text);
    font-size: 30rpx;
    font-weight: 700;
  }

  .state-description {
    line-height: 1.6;
  }

  .secondary-button {
    min-height: 72rpx;
    margin-top: 24rpx;
    padding: 0 22rpx;
    border: 0;
    border-radius: 14rpx;
    color: var(--theme-text);
    background: var(--theme-surface-muted);
    font-size: 24rpx;
  }

  .detail-actions {
    margin-top: 38rpx;
    padding-top: 24rpx;
    border-top: 1rpx solid var(--theme-border);
    text-align: center;
  }

  .recall-button,
  .delete-button {
    min-height: 70rpx;
    margin: 0 auto;
    padding: 0 24rpx;
    border: 0;
    background: transparent;
    font-size: 25rpx;
  }

  .recall-button {
    color: var(--theme-brand);
  }

  .delete-button {
    display: block;
    margin-top: 4rpx;
    color: #dc2626;
  }

  .delete-hint {
    margin-top: 0;
    font-size: 21rpx;
  }

  .quick-ship-button::after {
    border: 0;
  }
</style>
