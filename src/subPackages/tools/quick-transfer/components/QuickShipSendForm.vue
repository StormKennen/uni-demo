<script setup lang="ts">
  import { computed } from 'vue'
  import { getQuickTransferFileStateLabel, getQuickTransferFileTypeLabel } from '@/features/quick-transfer/presentation'
  import { formatQuickTransferFileSize } from '@/features/quick-transfer/helpers'
  import type { QuickShipDraft, QuickShipFileDraft, QuickShipLinkDraft, QuickTransferTtl } from '@/features/quick-transfer/types'

  interface Props {
    draft: QuickShipDraft
    isSending: boolean
    canSubmit: boolean
    sendButtonLabel: string
    fileError: string
    sendError: string
    uploadProgress: number | null
    canRetryUpload: boolean
    hasFailedUploadFiles: boolean
    canRetryComplete: boolean
    maxFileCount: number
    ttlOptions: ReadonlyArray<{ label: string; value: QuickTransferTtl }>
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    'update:text': [value: string]
    'update:expires-in': [value: QuickTransferTtl]
    'update:max-claims': [value: number]
    'add-link': []
    'edit-link': [link: QuickShipLinkDraft]
    'remove-link': [link: QuickShipLinkDraft]
    'add-file': []
    'remove-file': [file: QuickShipFileDraft]
    'remove-reference': [localId: string]
    submit: []
    'retry-upload': []
    'retry-complete': []
    abandon: []
  }>()

  const claimOptions = Array.from({ length: 10 }, (_, index) => `${index + 1} 次`)
  const ttlIndex = computed(() =>
    Math.max(
      0,
      props.ttlOptions.findIndex(option => option.value === props.draft.expiresIn),
    ),
  )
  const claimIndex = computed(() => Math.max(0, props.draft.maxClaims - 1))
  const selectedTtlLabel = computed(() => props.ttlOptions[ttlIndex.value]?.label || '')

  const getInputValue = (event: { detail?: { value?: string } }): string => event.detail?.value ?? ''

  const handleTextInput = (event: { detail?: { value?: string } }) => {
    emit('update:text', getInputValue(event))
  }

  const handleTtlChange = (event: { detail: { value: number | string } }) => {
    const option = props.ttlOptions[Number(event.detail.value)]
    if (option) emit('update:expires-in', option.value)
  }

  const handleClaimsChange = (event: { detail: { value: number | string } }) => {
    const nextValue = Number(event.detail.value) + 1
    if (Number.isInteger(nextValue)) emit('update:max-claims', nextValue)
  }
</script>

<template>
  <view class="send-form">
    <view class="content-heading">
      <view>
        <text class="content-title">传输内容</text>
        <text class="content-caption">至少添加一项内容</text>
      </view>
      <text v-if="draft.files.length" class="content-count">{{ draft.files.length }} / {{ props.maxFileCount }} 个文件</text>
    </view>

    <view class="message-box">
      <textarea class="content-input" :value="draft.text" placeholder="留句话……" :maxlength="20000" auto-height @input="handleTextInput" />
    </view>

    <view class="add-actions">
      <button class="add-button" :disabled="props.isSending" @click="emit('add-link')">＋ 添加链接</button>
      <button class="add-button" :disabled="props.isSending" @click="emit('add-file')">＋ 添加文件</button>
    </view>

    <view v-if="draft.links.length" class="content-list">
      <view v-for="link in draft.links" :key="link.localId" class="content-row" @click="emit('edit-link', link)">
        <view class="item-icon item-icon--link">↗</view>
        <view class="item-main">
          <text class="item-title">{{ link.title || link.url }}</text>
          <text v-if="link.title" class="item-subtitle">{{ link.url }}</text>
        </view>
        <text class="row-action">编辑</text>
        <button class="remove-button" @click.stop="emit('remove-link', link)">删除</button>
      </view>
    </view>

    <view v-if="draft.files.length" class="content-list">
      <view v-for="file in draft.files" :key="file.clientFileId" class="content-row">
        <view class="item-icon item-icon--file">FILE</view>
        <view class="item-main">
          <text class="item-title">{{ file.name }}</text>
          <text class="item-subtitle"
            >{{ formatQuickTransferFileSize(file.size) }} · {{ getQuickTransferFileTypeLabel(file.mimeType) }}</text
          >
          <text v-if="props.isSending" class="item-status">{{ getQuickTransferFileStateLabel(file) }}</text>
        </view>
        <button v-if="!props.isSending" class="remove-button" @click="emit('remove-file', file)">删除</button>
      </view>
    </view>

    <view v-if="draft.references.length" class="content-list">
      <view v-for="reference in draft.references" :key="reference.localId" class="content-row">
        <view class="item-icon item-icon--reference">↗</view>
        <view class="item-main">
          <text class="item-title">{{ reference.title }}</text>
          <text v-if="reference.subtitle" class="item-subtitle">{{ reference.subtitle }}</text>
        </view>
        <button v-if="!props.isSending" class="remove-button" @click="emit('remove-reference', reference.localId)">删除</button>
      </view>
    </view>

    <view class="settings-block">
      <text class="settings-title">发送设置</text>
      <picker mode="selector" :range="props.ttlOptions" range-key="label" :value="ttlIndex" @change="handleTtlChange">
        <view class="setting-row">
          <text>有效期</text>
          <view class="setting-value"
            ><text>{{ selectedTtlLabel }}</text
            ><text class="setting-arrow">›</text></view
          >
        </view>
      </picker>
      <picker mode="selector" :range="claimOptions" :value="claimIndex" @change="handleClaimsChange">
        <view class="setting-row">
          <text>领取次数</text>
          <view class="setting-value"
            ><text>{{ draft.maxClaims }} 次</text><text class="setting-arrow">›</text></view
          >
        </view>
      </picker>
    </view>

    <view v-if="props.fileError" class="inline-error">{{ props.fileError }}</view>
    <view v-if="props.sendError" class="inline-error">{{ props.sendError }}</view>
    <view v-if="props.uploadProgress !== null && props.isSending" class="progress-wrap">
      <view class="progress-label"
        ><text>正在发送</text><text>{{ props.uploadProgress }}%</text></view
      >
      <view class="progress-bar"><view class="progress-value" :style="{ width: `${props.uploadProgress}%` }"></view></view>
    </view>

    <button class="primary-button submit-button" :disabled="props.isSending || !props.canSubmit" @click="emit('submit')">
      {{ props.sendButtonLabel }}
    </button>
    <button
      v-if="props.canRetryUpload && props.hasFailedUploadFiles"
      class="secondary-button full-button"
      :disabled="props.isSending"
      @click="emit('retry-upload')">
      重新上传失败文件
    </button>
    <button v-if="props.canRetryComplete" class="secondary-button full-button" :disabled="props.isSending" @click="emit('retry-complete')">
      重新校验
    </button>
    <button
      v-if="props.sendError && props.draft.files.length && !props.isSending"
      class="text-button full-button abandon-button"
      @click="emit('abandon')">
      放弃本次飞船
    </button>
  </view>
</template>

<style scoped lang="scss">
  .send-form {
    color: var(--theme-text);
  }

  .content-heading,
  .progress-label,
  .setting-row,
  .setting-value {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .content-heading {
    margin-bottom: 24rpx;
  }

  .content-title,
  .settings-title {
    display: block;
    color: var(--theme-text);
    font-size: 32rpx;
    font-weight: 700;
  }

  .content-caption,
  .content-count {
    display: block;
    margin-top: 6rpx;
    color: var(--theme-text-secondary);
    font-size: 22rpx;
  }

  .content-count {
    margin-top: 0;
  }

  .message-box {
    padding: 20rpx 22rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 22rpx;
    background: var(--theme-surface);
  }

  .content-input {
    width: 100%;
    min-height: 116rpx;
    padding: 0;
    box-sizing: border-box;
    color: var(--theme-text);
    font-size: 28rpx;
    line-height: 1.6;
  }

  .add-actions {
    display: flex;
    gap: 16rpx;
    margin-top: 18rpx;
  }

  .add-button,
  .primary-button,
  .secondary-button {
    border: 0;
    border-radius: 16rpx;
    font-size: 26rpx;
  }

  .add-button {
    flex: 1;
    min-height: 76rpx;
    padding: 0 12rpx;
    color: var(--theme-brand);
    background: var(--theme-surface-muted);
  }

  .content-list {
    margin-top: 18rpx;
    padding: 0 18rpx;
    border-radius: 18rpx;
    background: var(--theme-surface);
  }

  .content-row {
    display: flex;
    align-items: center;
    gap: 14rpx;
    min-height: 86rpx;
    padding: 14rpx 0;
    border-bottom: 1rpx solid var(--theme-border);
  }

  .content-row:last-child {
    border-bottom: 0;
  }

  .item-icon {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    width: 60rpx;
    height: 60rpx;
    border-radius: 16rpx;
    color: var(--theme-brand);
    background: var(--theme-surface-muted);
    font-size: 24rpx;
    font-weight: 700;
  }

  .item-icon--link,
  .item-icon--reference {
    font-size: 32rpx;
  }

  .item-main {
    flex: 1;
    min-width: 0;
  }

  .item-title,
  .item-subtitle,
  .item-status {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .item-title {
    color: var(--theme-text);
    font-size: 27rpx;
  }

  .item-subtitle,
  .item-status {
    margin-top: 6rpx;
    color: var(--theme-text-secondary);
    font-size: 21rpx;
  }

  .item-status {
    color: var(--theme-brand);
  }

  .row-action,
  .remove-button,
  .text-button {
    flex: 0 0 auto;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--theme-text-secondary);
    font-size: 22rpx;
    line-height: 1.5;
  }

  .remove-button {
    color: var(--theme-danger);
  }

  .settings-block {
    margin-top: 32rpx;
    padding-top: 26rpx;
    border-top: 1rpx solid var(--theme-border);
  }

  .settings-title {
    margin-bottom: 10rpx;
    font-size: 26rpx;
  }

  .setting-row {
    min-height: 74rpx;
    border-bottom: 1rpx solid var(--theme-border);
    color: var(--theme-text);
    font-size: 26rpx;
  }

  .setting-value {
    gap: 10rpx;
    color: var(--theme-text-secondary);
  }

  .setting-arrow {
    color: var(--theme-text-tertiary);
    font-size: 36rpx;
    line-height: 1;
  }

  .inline-error {
    margin-top: 18rpx;
    padding: 16rpx 18rpx;
    border-radius: 14rpx;
    color: var(--theme-danger);
    background: rgba(220, 80, 80, 0.1);
    font-size: 23rpx;
    line-height: 1.5;
  }

  .progress-wrap {
    margin-top: 22rpx;
  }

  .progress-label {
    color: var(--theme-text-secondary);
    font-size: 22rpx;
  }

  .progress-bar {
    height: 10rpx;
    margin-top: 10rpx;
    overflow: hidden;
    border-radius: 10rpx;
    background: var(--theme-surface-muted);
  }

  .progress-value {
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #2563eb, #14b8a6);
    transition: width 0.2s ease;
  }

  .primary-button,
  .secondary-button {
    min-height: 82rpx;
    padding: 0 24rpx;
  }

  .primary-button {
    color: #fff;
    background: linear-gradient(135deg, #2563eb, #14b8a6);
  }

  .secondary-button {
    color: var(--theme-text);
    background: var(--theme-surface-muted);
  }

  .submit-button {
    width: 100%;
    margin-top: 26rpx;
  }

  .full-button {
    width: 100%;
    margin-top: 16rpx;
  }

  .abandon-button {
    color: var(--theme-danger);
  }

  button[disabled] {
    opacity: 0.45;
  }
</style>
