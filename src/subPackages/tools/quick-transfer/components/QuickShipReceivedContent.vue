<script setup lang="ts">
  import { formatQuickTransferFileSize } from '@/features/quick-transfer/helpers'
  import { getQuickTransferFileTypeLabel } from '@/features/quick-transfer/presentation'
  import type {
    QuickTransferContent,
    QuickTransferContentReference,
    QuickTransferFileMetadata,
    QuickTransferContentLink,
  } from '@/features/quick-transfer/types'

  interface Props {
    content: QuickTransferContent
    isDownloading: boolean
    context?: 'received' | 'sent'
  }

  const props = withDefaults(defineProps<Props>(), { context: 'received' })
  const emit = defineEmits<{
    copyText: []
    openUrl: [url: string]
    downloadFile: [fileId: string]
    openReference: [reference: QuickTransferContentReference]
  }>()

  const isImageFile = (file: QuickTransferFileMetadata): boolean => file.mimeType.startsWith('image/')
  const linkKey = (link: QuickTransferContentLink, index: number): string => `${link.url}-${index}`
  const referenceKey = (reference: QuickTransferContentReference, index: number): string =>
    `${reference.type}-${reference.resourceId || reference.title}-${index}`
</script>

<template>
  <view class="received-content">
    <view class="received-heading">
      <text class="received-kicker">{{ props.context === 'sent' ? 'TRANSFER SENT' : 'TRANSFER RECEIVED' }}</text>
      <text class="received-title">{{ props.context === 'sent' ? '发送内容' : '收到的内容' }}</text>
    </view>

    <view v-if="props.content.text" class="received-section">
      <view class="section-heading"><text class="section-title">留言</text><text class="section-count">1 条</text></view>
      <text class="received-text" selectable>{{ props.content.text }}</text>
      <button class="quick-ship-button secondary-button full-button" @click="emit('copyText')">复制留言</button>
    </view>

    <view v-if="props.content.links.length" class="received-section">
      <view class="section-heading"
        ><text class="section-title">链接</text><text class="section-count">{{ props.content.links.length }} 个</text></view
      >
      <view
        v-for="(link, index) in props.content.links"
        :key="linkKey(link, index)"
        class="received-row"
        @click="emit('openUrl', link.url)">
        <view class="item-icon">↗</view>
        <view class="item-main">
          <text class="item-title">{{ link.title || link.url }}</text>
          <text v-if="link.title" class="item-subtitle">{{ link.url }}</text>
        </view>
        <text class="item-arrow">›</text>
      </view>
    </view>

    <view v-if="props.content.files.length" class="received-section">
      <view class="section-heading"
        ><text class="section-title">文件</text><text class="section-count">{{ props.content.files.length }} 个</text></view
      >
      <view v-for="(file, index) in props.content.files" :key="`${file.fileId || file.displayName}-${index}`" class="received-row">
        <view class="item-icon item-icon--file">FILE</view>
        <view class="item-main">
          <text class="item-title">{{ file.displayName }}</text>
          <text class="item-subtitle"
            >{{ formatQuickTransferFileSize(file.size) }} · {{ getQuickTransferFileTypeLabel(file.mimeType) }}</text
          >
        </view>
        <text v-if="file.available === false" class="file-expired-badge">已过期</text>
        <button
          v-else
          class="quick-ship-button primary-small-button"
          :disabled="props.isDownloading"
          @click="emit('downloadFile', file.fileId || '')">
          {{ isImageFile(file) ? '预览' : '打开' }}
        </button>
      </view>
    </view>

    <view v-if="props.content.references.length" class="received-section received-section--last">
      <view class="section-heading"
        ><text class="section-title">引用</text><text class="section-count">{{ props.content.references.length }} 个</text></view
      >
      <view
        v-for="(reference, index) in props.content.references"
        :key="referenceKey(reference, index)"
        class="received-row"
        @click="emit('openReference', reference)">
        <view class="item-icon">↗</view>
        <view class="item-main">
          <text class="item-title">{{ reference.title }}</text>
          <text v-if="reference.subtitle" class="item-subtitle">{{ reference.subtitle }}</text>
        </view>
        <text class="item-arrow">›</text>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
  .received-content {
    color: var(--theme-text);
  }

  .received-heading {
    padding: 10rpx 0 22rpx;
    text-align: center;
  }

  .received-kicker {
    display: block;
    color: var(--theme-brand);
    font-size: 19rpx;
    font-weight: 700;
    letter-spacing: 3rpx;
  }

  .received-title {
    display: block;
    margin-top: 10rpx;
    color: var(--theme-text);
    font-size: 36rpx;
    font-weight: 800;
  }

  .received-section {
    padding: 24rpx 0;
    border-top: 1rpx solid var(--theme-border);
  }

  .received-section--last {
    padding-bottom: 4rpx;
  }

  .section-heading,
  .received-row {
    display: flex;
    align-items: center;
  }

  .section-heading {
    justify-content: space-between;
  }

  .section-title {
    color: var(--theme-text);
    font-size: 28rpx;
    font-weight: 700;
  }

  .section-count,
  .item-subtitle {
    color: var(--theme-text-secondary);
    font-size: 22rpx;
  }

  .received-text {
    display: block;
    margin-top: 14rpx;
    padding: 18rpx;
    border-radius: 16rpx;
    color: var(--theme-text);
    background: var(--theme-surface);
    font-size: 27rpx;
    line-height: 1.7;
    white-space: pre-wrap;
    word-break: break-all;
  }

  .received-row {
    gap: 14rpx;
    min-height: 82rpx;
    padding: 12rpx 0;
    border-bottom: 1rpx solid var(--theme-border);
  }

  .received-row:last-child {
    border-bottom: 0;
  }

  .item-icon {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    width: 58rpx;
    height: 58rpx;
    border-radius: 15rpx;
    color: var(--theme-brand);
    background: var(--theme-surface-muted);
    font-size: 29rpx;
  }

  .item-icon--file {
    font-size: 17rpx;
    font-weight: 700;
  }

  .item-main {
    flex: 1;
    min-width: 0;
  }

  .item-title,
  .item-subtitle {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .item-title {
    color: var(--theme-text);
    font-size: 27rpx;
  }

  .item-subtitle {
    margin-top: 6rpx;
  }

  .file-expired-badge {
    flex: 0 0 auto;
    padding: 10rpx 14rpx;
    border-radius: 12rpx;
    color: var(--theme-text-secondary);
    background: var(--theme-surface-muted);
    font-size: 22rpx;
  }

  .item-arrow {
    flex: 0 0 auto;
    color: var(--theme-text-secondary);
    font-size: 40rpx;
  }

  .primary-small-button,
  .secondary-button {
    flex: 0 0 auto;
    border: 0;
    border-radius: 13rpx;
    font-size: 23rpx;
  }

  .primary-small-button {
    padding: 13rpx 16rpx;
    color: #fff;
    background: linear-gradient(135deg, #2563eb, #14b8a6);
  }

  .secondary-button {
    min-height: 76rpx;
    padding: 0 20rpx;
    color: var(--theme-text);
    background: var(--theme-surface-muted);
  }

  .full-button {
    width: 100%;
    margin-top: 16rpx;
  }

  .quick-ship-button::after {
    border: 0;
  }

  button[disabled] {
    opacity: 0.45;
  }
</style>
