<script setup lang="ts">
  import type { QuickTransferSendState } from '@/features/quick-transfer/types'

  interface Props {
    state: QuickTransferSendState
    title: string
    description: string
    code: string
    countdown: string
    claimLabel: string
    showShareLink: boolean
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    copyCode: []
    copyShareUrl: []
    cancel: []
    reset: []
  }>()
</script>

<template>
  <view class="result-wrap">
    <view class="result-ticket">
      <view class="ticket-topline">
        <text class="ticket-kicker">TRANSFER TICKET</text>
        <text class="ticket-status">{{
          props.state === 'ready' ? '已发出' : props.state === 'consumed' ? '已完成' : props.state === 'expired' ? '已返航' : '已召回'
        }}</text>
      </view>
      <text class="result-title">{{ props.title }}</text>
      <text class="result-description">{{ props.description }}</text>
      <template v-if="props.state === 'ready'">
        <text class="result-label">收船码</text>
        <text class="ready-code" selectable>{{ props.code }}</text>
        <view class="result-meta">
          <view
            ><text class="meta-label">有效期</text><text class="meta-value">{{ props.countdown }} 后返航</text></view
          >
          <view
            ><text class="meta-label">领取进度</text><text class="meta-value">{{ props.claimLabel }}</text></view
          >
        </view>
        <view class="action-row">
          <button class="primary-button" @click="emit('copyCode')">复制收船码</button>
          <!-- #ifdef H5 -->
          <button v-if="props.showShareLink" class="secondary-button" @click="emit('copyShareUrl')">分享</button>
          <!-- #endif -->
        </view>
        <!-- #ifdef MP-WEIXIN -->
        <button class="secondary-button full-button" open-type="share">分享给好友</button>
        <!-- #endif -->
        <view class="cancel-link" @click="emit('cancel')">召回飞船</view>
      </template>
      <template v-else>
        <view class="terminal-mark">✓</view>
        <button class="secondary-button full-button" @click="emit('reset')">重新发送</button>
      </template>
    </view>
  </view>
</template>

<style scoped lang="scss">
  .result-wrap {
    padding: 4rpx 0 12rpx;
  }

  .result-ticket {
    position: relative;
    padding: 26rpx 22rpx 30rpx;
    border: 1rpx solid rgba(37, 99, 235, 0.2);
    border-radius: 24rpx;
    background: var(--theme-surface);
    box-shadow: 0 14rpx 34rpx var(--theme-shadow-xs);
  }

  .result-ticket::before,
  .result-ticket::after {
    position: absolute;
    top: 50%;
    width: 20rpx;
    height: 40rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 50%;
    background: var(--theme-bg);
    content: '';
    transform: translateY(-50%);
  }

  .result-ticket::before {
    left: -11rpx;
    border-left: 0;
  }

  .result-ticket::after {
    right: -11rpx;
    border-right: 0;
  }

  .ticket-topline,
  .result-meta,
  .action-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .ticket-topline {
    padding-bottom: 20rpx;
    border-bottom: 1rpx dashed var(--theme-border);
  }

  .ticket-kicker,
  .ticket-status,
  .meta-label {
    color: var(--theme-text-secondary);
    font-size: 20rpx;
    letter-spacing: 2rpx;
  }

  .ticket-status {
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
    display: block;
    margin-top: 6rpx;
    color: var(--theme-brand);
    font-size: 64rpx;
    font-weight: 800;
    letter-spacing: 10rpx;
    text-align: center;
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
</style>
