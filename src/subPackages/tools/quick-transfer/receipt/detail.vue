<script setup lang="ts">
  import { onLoad } from '@dcloudio/uni-app'
  import { computed, ref } from 'vue'
  import QuickShipReceivedContent from '../components/QuickShipReceivedContent.vue'
  import PageLayout from '@/components/PageLayout.vue'
  import { QUICK_TRANSFER_RECEIPTS_ROUTE } from '@/features/quick-transfer/constants'
  import { isQuickTransferDownloadValid } from '@/features/quick-transfer/helpers'
  import { openQuickTransferReference } from '@/features/quick-transfer/reference/registry'
  import { isValidQuickTransferReceiptId } from '@/features/quick-transfer/receiptApi'
  import { useQuickTransferReceipts } from '@/features/quick-transfer/useQuickTransferReceipts'
  import type { QuickTransferContentReference } from '@/features/quick-transfer/types'
  import { formatQuickTransferReceiptDate } from '@/features/quick-transfer/presentation'
  import { downloadFileDirect } from '@/platform/file'
  import { safeBack } from '@/utils/navigation'
  import { openQuickTransferBrowserUrl } from '@/utilsH5/quick-transfer-url'
  import { registerQuickTransferPageShare } from '@/features/quick-transfer/pageShare'
  import { getQuickTransferToolSharePayload } from '@/features/quick-transfer/share'

  const receipts = useQuickTransferReceipts()
  const { detail, error, isLoading } = receipts
  const receiptId = ref('')
  const isInvalidReceiptId = ref(false)
  const isDownloading = ref(false)
  const isReceiptNotFound = computed(() => error.value?.code === 'QUICK_TRANSFER_RECEIPT_NOT_FOUND')
  const sharePayload = getQuickTransferToolSharePayload()
  registerQuickTransferPageShare(sharePayload)

  const loadDetail = () => {
    isInvalidReceiptId.value = !isValidQuickTransferReceiptId(receiptId.value)
    if (!isInvalidReceiptId.value) void receipts.loadReceiptDetail(receiptId.value)
  }

  const backToReceiptList = () => {
    safeBack({ fallbackUrl: QUICK_TRANSFER_RECEIPTS_ROUTE })
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
    try {
      const access = await receipts.accessReceiptFile(receiptId.value, fileId)
      if (!access) {
        const code = receipts.error.value?.code
        if (code === 'QUICK_TRANSFER_RECEIPT_FILE_NOT_AVAILABLE' || code === 'QUICK_TRANSFER_RECEIPT_FILE_NOT_FOUND') {
          receipts.markDetailFileUnavailable(fileId)
        }
        if (receipts.error.value?.message) uni.showToast({ title: receipts.error.value.message, icon: 'none' })
        return
      }
      if (!isQuickTransferDownloadValid(access.expiresAt)) {
        uni.showToast({ title: '文件访问链接已失效，请重新打开', icon: 'none' })
        return
      }
      const success = await downloadFileDirect({ url: access.url, fileName: file.name, mimeType: file.mimeType })
      if (!success) uni.showToast({ title: '文件打开失败，请稍后重试', icon: 'none' })
    } catch {
      uni.showToast({ title: '文件打开失败，请稍后重试', icon: 'none' })
    } finally {
      isDownloading.value = false
    }
  }

  onLoad((options: Record<string, string | undefined>) => {
    receiptId.value = options.receiptId?.trim() || ''
    loadDetail()
  })
</script>

<template>
  <PageLayout
    title="已收飞船"
    :share-title="sharePayload.title"
    :share-path="sharePayload.path"
    :share-image-url="sharePayload.imageUrl"
    :back-fallback="QUICK_TRANSFER_RECEIPTS_ROUTE"
    nav-gradient="linear-gradient(135deg, #2563eb, #14b8a6)">
    <view class="receipt-detail-page">
      <view v-if="isInvalidReceiptId" class="state-panel">
        <text class="state-title">记录参数无效</text>
        <text class="state-description">找不到要查看的已收飞船记录。</text>
        <button class="quick-ship-button secondary-button" @click="backToReceiptList">返回已收飞船</button>
      </view>

      <view v-else-if="isLoading && !detail" class="state-panel">
        <text class="state-title">正在读取已收飞船</text>
        <text class="state-description">请稍候…</text>
      </view>

      <view v-else-if="error && !detail" class="state-panel">
        <text class="state-title">{{ isReceiptNotFound ? '记录不存在' : '加载失败' }}</text>
        <text class="state-description">{{ error.message }}</text>
        <button v-if="isReceiptNotFound" class="quick-ship-button secondary-button" @click="backToReceiptList">返回已收飞船</button>
        <button v-else class="quick-ship-button secondary-button" @click="loadDetail">重新加载</button>
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
  .state-description {
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

  .quick-ship-button::after {
    border: 0;
  }
</style>
