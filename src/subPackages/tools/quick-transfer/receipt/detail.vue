<script setup lang="ts">
  import { onLoad } from '@dcloudio/uni-app'
  import { ref } from 'vue'
  import QuickShipReceivedContent from '../components/QuickShipReceivedContent.vue'
  import PageLayout from '@/components/PageLayout.vue'
  import { isQuickTransferDownloadValid } from '@/features/quick-transfer/helpers'
  import { openQuickTransferReference } from '@/features/quick-transfer/reference/registry'
  import { useQuickTransferReceipts } from '@/features/quick-transfer/useQuickTransferReceipts'
  import type { QuickTransferContentReference } from '@/features/quick-transfer/types'
  import { formatQuickTransferReceiptDate } from '@/features/quick-transfer/presentation'
  import { downloadFileDirect } from '@/platform/file'
  import { openQuickTransferBrowserUrl } from '@/utilsH5/quick-transfer-url'

  const receipts = useQuickTransferReceipts()
  const { detail, error, isLoading } = receipts
  const receiptId = ref('')
  const isDownloading = ref(false)

  const loadDetail = () => {
    if (receiptId.value) void receipts.loadReceiptDetail(receiptId.value)
  }

  const copyText = () => {
    const text = receipts.detail.value?.content.text || ''
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
    const file = receipts.detail.value?.content.files.find(item => item.fileId === fileId)
    if (!file || file.available === false || isDownloading.value || !receiptId.value) return
    isDownloading.value = true
    const access = await receipts.accessReceiptFile(receiptId.value, fileId)
    if (!access || !isQuickTransferDownloadValid(access.expiresAt)) {
      const code = receipts.error.value?.code
      if (code === 'QUICK_TRANSFER_RECEIPT_FILE_NOT_AVAILABLE' || code === 'QUICK_TRANSFER_RECEIPT_FILE_NOT_FOUND') {
        receipts.markDetailFileUnavailable(fileId)
      }
      if (receipts.error.value?.message) uni.showToast({ title: receipts.error.value.message, icon: 'none' })
      isDownloading.value = false
      return
    }
    const success = await downloadFileDirect({ url: access.url, fileName: file.name, mimeType: file.mimeType })
    if (!success) uni.showToast({ title: '文件打开失败，请稍后重试', icon: 'none' })
    isDownloading.value = false
  }

  const confirmDelete = () => {
    if (!receiptId.value || receipts.isLoading.value) return
    uni.showModal({
      title: '删除已收记录',
      content: '删除这条已收飞船记录？只删除本条记录，不影响发送方文件或原飞船。',
      success: result => {
        if (!result.confirm) return
        void receipts.deleteReceipt(receiptId.value).then(success => {
          if (success) {
            uni.navigateBack()
            return
          }
          if (receipts.error.value?.message) uni.showToast({ title: receipts.error.value.message, icon: 'none' })
        })
      },
    })
  }

  onLoad((options: Record<string, string | undefined>) => {
    receiptId.value = options.receiptId || ''
    loadDetail()
  })
</script>

<template>
  <PageLayout title="已收飞船" nav-gradient="linear-gradient(135deg, #2563eb, #14b8a6)">
    <view class="receipt-detail-page">
      <view v-if="isLoading && !detail" class="state-panel">
        <text class="state-title">正在读取已收飞船</text>
        <text class="state-description">请稍候…</text>
      </view>

      <view v-else-if="error && !detail" class="state-panel">
        <text class="state-title">加载失败</text>
        <text class="state-description">{{ error.message }}</text>
        <button class="secondary-button" @click="loadDetail">重新加载</button>
      </view>

      <template v-else-if="detail">
        <view class="detail-heading">
          <text class="detail-kicker">RECEIVED SHIP</text>
          <text class="detail-title">{{ detail.displayTitle }}</text>
          <text class="detail-meta">{{ formatQuickTransferReceiptDate(detail.claimedAt) }} 收到</text>
        </view>

        <QuickShipReceivedContent
          :content="detail.content"
          :is-downloading="isDownloading"
          @copy-text="copyText"
          @open-url="openUrl"
          @download-file="downloadFile"
          @open-reference="openReference" />

        <view class="detail-actions">
          <button class="delete-button" @click="confirmDelete">删除记录</button>
          <text class="delete-hint">只删除这条已收记录</text>
        </view>
      </template>
    </view>
  </PageLayout>
</template>

<style scoped lang="scss">
  .receipt-detail-page {
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

  .delete-button {
    min-height: 70rpx;
    padding: 0 24rpx;
    border: 0;
    color: #dc2626;
    background: transparent;
    font-size: 25rpx;
  }

  .delete-hint {
    margin-top: 0;
    font-size: 21rpx;
  }
</style>
