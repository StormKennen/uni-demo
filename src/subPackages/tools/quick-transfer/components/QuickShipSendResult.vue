<script setup lang="ts">
  import type { QuickTransferSendState } from '@/features/quick-transfer/types'

  interface Props {
    state: QuickTransferSendState
    shipTitle: string
    title: string
    description: string
    code: string
    countdown: string
    claimLabel: string
    showShareLink: boolean
    showShareLinkWarning: boolean
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    copyCode: []
    copyShareUrl: []
    cancel: []
    reset: []
    'view-history': []
  }>()
</script>

<template>
  <view class="result-wrap">
    <view class="result-card">
      <view class="result-topline">
        <text class="result-kicker">QUICK TRANSFER</text>
        <text class="result-status">{{
          props.state === 'ready' ? '已发出' : props.state === 'consumed' ? '已完成' : props.state === 'expired' ? '已返航' : '已召回'
        }}</text>
      </view>
      <text class="result-title">{{ props.title }}</text>
      <text v-if="props.shipTitle" class="result-ship-title">{{ props.shipTitle }}</text>
      <text class="result-description">{{ props.description }}</text>
      <template v-if="props.state === 'ready'">
        <text class="result-label">飞船码</text>
        <view class="ready-code-row">
          <text class="ready-code" selectable>{{ props.code }}</text>
          <view class="code-copy-button" aria-label="复制飞船码" @click="emit('copyCode')">
            <text class="copy-icon">⧉</text>
          </view>
        </view>
        <view class="result-meta">
          <view
            ><text class="meta-label">有效期</text><text class="meta-value">{{ props.countdown }} 后返航</text></view
          >
          <view
            ><text class="meta-label">领取进度</text><text class="meta-value">{{ props.claimLabel }}</text></view
          >
        </view>
        <text v-if="props.showShareLinkWarning" class="share-link-warning">网页链接暂不可用，请使用飞船码</text>
        <!-- #ifdef MP-WEIXIN -->
        <button class="quick-ship-button primary-button full-button" open-type="share">分享给微信好友</button>
        <button v-if="props.showShareLink" class="quick-ship-button secondary-button full-button" @click="emit('copyShareUrl')"
          >复制网页链接</button
        >
        <!-- #endif -->
        <!-- #ifdef H5 -->
        <button v-if="props.showShareLink" class="quick-ship-button primary-button full-button" @click="emit('copyShareUrl')"
          >复制分享链接</button
        >
        <!-- #endif -->
        <button class="quick-ship-button text-button full-button" @click="emit('view-history')">查看发送记录</button>
        <view class="cancel-link" @click="emit('cancel')">召回飞船</view>
      </template>
      <template v-else>
        <view class="terminal-mark">✓</view>
        <button class="quick-ship-button secondary-button full-button" @click="emit('reset')">再发一艘</button>
      </template>
    </view>
  </view>
</template>

<style scoped lang="scss">
  .result-wrap {
    padding: 4rpx 0 12rpx;
  }

  .result-card {
    padding: 26rpx 22rpx 30rpx;
    border: 1rpx solid rgba(37, 99, 235, 0.2);
    border-radius: 24rpx;
    background: var(--theme-surface);
    box-shadow: 0 14rpx 34rpx var(--theme-shadow-xs);
  }

  .result-topline,
  .result-meta,
  .action-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .result-topline {
    padding-bottom: 20rpx;
    border-bottom: 1rpx dashed var(--theme-border);
  }

  .result-kicker,
  .result-status,
  .meta-label {
    color: var(--theme-text-secondary);
    font-size: 20rpx;
    letter-spacing: 2rpx;
  }

  .result-status {
    color: var(--theme-brand);
    letter-spacing: 0;
  }

  .result-title {
    display: block;
    margin-top: 28rpx;
    color: var(--theme-text);
    font-size: 36rpx;
    font-weight: 800;
    text-align: center;
  }

  .result-ship-title {
    display: block;
    margin-top: 12rpx;
    color: var(--theme-text);
    font-size: 28rpx;
    font-weight: 600;
    text-align: center;
  }

  .result-description {
    display: block;
    margin-top: 10rpx;
    color: var(--theme-text-secondary);
    font-size: 24rpx;
    line-height: 1.5;
    text-align: center;
  }

  .result-label {
    display: block;
    margin-top: 30rpx;
    color: var(--theme-text-secondary);
    font-size: 22rpx;
    text-align: center;
  }

  .ready-code {
    color: var(--theme-brand);
    font-size: 64rpx;
    font-weight: 800;
    letter-spacing: 10rpx;
    text-align: center;
  }

  .ready-code-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    min-height: 92rpx;
    margin-top: 6rpx;
  }

  .code-copy-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64rpx;
    height: 64rpx;
    margin-left: 2rpx;
    border-radius: 32rpx;
  }

  .code-copy-button:active {
    background: var(--theme-surface-muted);
  }

  .copy-icon {
    color: var(--theme-brand);
    font-size: 38rpx;
    line-height: 1;
  }

  .result-meta {
    gap: 12rpx;
    margin-top: 22rpx;
    padding: 18rpx 0;
    border-top: 1rpx solid var(--theme-border);
    border-bottom: 1rpx solid var(--theme-border);
  }

  .result-meta > view {
    flex: 1;
    text-align: center;
  }

  .share-link-warning {
    display: block;
    margin-top: 18rpx;
    color: var(--theme-text-secondary);
    font-size: 22rpx;
    line-height: 1.5;
    text-align: center;
  }

  .meta-label,
  .meta-value {
    display: block;
  }

  .meta-value {
    margin-top: 6rpx;
    color: var(--theme-text);
    font-size: 23rpx;
  }

  .action-row {
    gap: 14rpx;
    margin-top: 22rpx;
  }

  .action-row > button {
    flex: 1;
  }

  .primary-button,
  .secondary-button {
    min-height: 78rpx;
    padding: 0 18rpx;
    border: 0;
    border-radius: 14rpx;
    font-size: 25rpx;
  }

  .primary-button {
    color: #fff;
    background: linear-gradient(135deg, #2563eb, #14b8a6);
  }

  .secondary-button {
    color: var(--theme-text);
    background: var(--theme-surface-muted);
  }

  .full-button {
    width: 100%;
    margin-top: 14rpx;
  }

  .cancel-link {
    margin-top: 24rpx;
    color: var(--theme-danger);
    font-size: 23rpx;
    text-align: center;
  }

  .terminal-mark {
    margin-top: 24rpx;
    color: var(--theme-brand);
    font-size: 56rpx;
    font-weight: 800;
    text-align: center;
  }

  .quick-ship-button::after {
    border: 0;
  }

  .text-button {
    min-height: 54rpx;
    padding: 0;
    color: var(--theme-brand);
    background: transparent;
  }
</style>
