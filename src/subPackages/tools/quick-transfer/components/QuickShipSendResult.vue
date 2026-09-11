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
    <view class="status-card">
      <view class="status-icon" :class="{ 'status-icon--terminal': props.state !== 'ready' }">
        <text>{{ props.state === 'ready' ? '↗' : '✓' }}</text>
      </view>
      <view class="status-copy">
        <view class="status-heading">
          <text class="status-kicker">飞船状态</text>
          <text class="result-status">{{
            props.state === 'ready' ? '已发出' : props.state === 'consumed' ? '已完成' : props.state === 'expired' ? '已返航' : '已召回'
          }}</text>
        </view>
        <text class="result-title">{{ props.title }}</text>
        <text class="result-description">{{ props.description }}</text>
      </view>
    </view>

    <view class="content-card">
      <view class="section-heading">
        <view class="section-icon"><text>✦</text></view>
        <view class="section-heading-copy">
          <text class="section-kicker">TRANSFER CONTENT</text>
          <text class="section-title">飞船内容</text>
        </view>
      </view>
      <view class="content-preview">
        <text class="content-label">内容标题</text>
        <text v-if="props.shipTitle" class="result-ship-title">{{ props.shipTitle }}</text>
        <text v-else class="content-empty">未设置标题</text>
      </view>
    </view>

    <template v-if="props.state === 'ready'">
      <view class="code-card">
        <view class="section-heading code-heading">
          <view class="section-icon section-icon--code"><text>#</text></view>
          <view class="section-heading-copy">
            <text class="section-kicker">RECEIVE CODE</text>
            <text class="section-title">飞船码</text>
          </view>
          <text class="code-status">已发出</text>
        </view>
        <view class="ready-code-row">
          <text class="ready-code" selectable>{{ props.code }}</text>
          <view class="code-copy-button" aria-label="复制飞船码" @click="emit('copyCode')">
            <text class="copy-icon">⧉</text>
          </view>
        </view>
      </view>

      <view class="result-meta">
        <view class="meta-item">
          <text class="meta-label">有效期</text>
          <text class="meta-value">{{ props.countdown }} 后返航</text>
        </view>
        <view class="meta-divider" />
        <view class="meta-item">
          <text class="meta-label">领取进度</text>
          <text class="meta-value">{{ props.claimLabel }}</text>
        </view>
      </view>

      <view class="action-card">
        <text v-if="props.showShareLinkWarning" class="share-link-warning">网页链接暂不可用，请使用飞船码</text>
        <!-- #ifdef MP-WEIXIN -->
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
      </view>
    </template>
    <template v-else>
      <view class="result-meta result-meta--terminal">
        <view class="meta-item">
          <text class="meta-label">飞船状态</text>
          <text class="meta-value">{{ props.state === 'consumed' ? '已完成' : props.state === 'expired' ? '已返航' : '已召回' }}</text>
        </view>
        <view class="meta-divider" />
        <view class="meta-item">
          <text class="meta-label">领取进度</text>
          <text class="meta-value">{{ props.claimLabel }}</text>
        </view>
      </view>
      <view class="action-card action-card--terminal">
        <button class="quick-ship-button secondary-button full-button" @click="emit('reset')">再发一艘</button>
      </view>
    </template>
  </view>
</template>

<style scoped lang="scss">
  .result-wrap {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
    padding: 4rpx 0 12rpx;
  }

  .status-card,
  .content-card,
  .code-card,
  .result-meta,
  .action-card {
    box-sizing: border-box;
    border: 1rpx solid var(--theme-border);
    border-radius: 22rpx;
    background: var(--theme-surface);
    box-shadow: 0 10rpx 28rpx var(--theme-shadow-xs);
  }

  .status-card {
    display: flex;
    align-items: center;
    gap: 18rpx;
    padding: 24rpx 22rpx;
    border: 1rpx solid rgba(37, 99, 235, 0.2);
    background: linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(20, 184, 166, 0.06)), var(--theme-surface);
  }

  .status-icon,
  .section-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .status-icon {
    flex: 0 0 auto;
    width: 76rpx;
    height: 76rpx;
    border-radius: 24rpx;
    color: #fff;
    background: linear-gradient(135deg, #2563eb, #14b8a6);
    font-size: 42rpx;
    font-weight: 800;
  }

  .status-icon--terminal {
    background: var(--theme-surface-muted);
    color: var(--theme-brand);
  }

  .status-copy,
  .section-heading-copy {
    flex: 1;
    min-width: 0;
  }

  .status-heading,
  .section-heading,
  .result-meta {
    display: flex;
    align-items: center;
  }

  .status-heading {
    gap: 14rpx;
  }

  .status-kicker,
  .section-kicker,
  .meta-label {
    color: var(--theme-text-secondary);
    font-size: 19rpx;
    letter-spacing: 1.5rpx;
  }

  .result-status {
    color: var(--theme-brand);
    font-size: 22rpx;
    font-weight: 600;
  }

  .result-title {
    display: block;
    margin-top: 8rpx;
    color: var(--theme-text);
    font-size: 32rpx;
    font-weight: 800;
  }

  .result-ship-title {
    display: block;
    margin-top: 8rpx;
    color: var(--theme-text);
    font-size: 28rpx;
    font-weight: 600;
    line-height: 1.45;
    word-break: break-all;
  }

  .result-description,
  .content-empty {
    display: block;
    margin-top: 6rpx;
    color: var(--theme-text-secondary);
    font-size: 23rpx;
    line-height: 1.5;
  }

  .content-card,
  .code-card,
  .action-card {
    padding: 22rpx;
  }

  .section-heading {
    gap: 14rpx;
  }

  .section-icon {
    flex: 0 0 auto;
    width: 54rpx;
    height: 54rpx;
    border-radius: 16rpx;
    color: var(--theme-brand);
    background: rgba(37, 99, 235, 0.1);
    font-size: 27rpx;
    font-weight: 700;
  }

  .section-icon--code {
    font-size: 25rpx;
  }

  .section-kicker {
    display: block;
    font-size: 17rpx;
  }

  .section-title {
    display: block;
    margin-top: 4rpx;
    color: var(--theme-text);
    font-size: 28rpx;
    font-weight: 700;
  }

  .content-preview {
    margin-top: 18rpx;
    padding: 18rpx;
    border-radius: 16rpx;
    background: var(--theme-surface-muted);
  }

  .content-label {
    display: block;
    color: var(--theme-text-secondary);
    font-size: 21rpx;
  }

  .ready-code {
    display: block;
    color: var(--theme-brand);
    font-size: 60rpx;
    font-weight: 800;
    letter-spacing: 10rpx;
  }

  .ready-code-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    min-height: 92rpx;
    margin-top: 10rpx;
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
    gap: 0;
    min-height: 104rpx;
    padding: 16rpx 8rpx;
  }

  .result-meta--terminal {
    margin-top: 0;
  }

  .meta-item {
    flex: 1;
    text-align: center;
  }

  .meta-divider {
    width: 1rpx;
    height: 54rpx;
    background: var(--theme-border);
  }

  .share-link-warning {
    display: block;
    margin: 0 8rpx 16rpx;
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

  .code-heading {
    justify-content: flex-start;
  }

  .code-status {
    margin-left: auto;
    color: var(--theme-brand);
    font-size: 22rpx;
    font-weight: 600;
  }

  .quick-ship-button {
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    line-height: 1.2;
    text-align: center;
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
    margin-top: 12rpx;
  }

  .cancel-link {
    margin-top: 18rpx;
    color: var(--theme-danger);
    font-size: 23rpx;
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
