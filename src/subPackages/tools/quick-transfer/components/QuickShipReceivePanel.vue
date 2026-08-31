<script setup lang="ts">
  import { QUICK_TRANSFER_COPY } from '@/features/quick-transfer/presentation'
  import { formatQuickTransferExpiry } from '@/features/quick-transfer/helpers'
  import type { QuickTransferInspectResult, QuickTransferReceiveState } from '@/features/quick-transfer/types'

  interface Props {
    shareToken: string
    receiveState: QuickTransferReceiveState
    inspectResult: QuickTransferInspectResult | null
    receiveCode: string
    isReceiving: boolean
    isContentOpened: boolean
    hasReceipt: boolean
    summaryText: string
    receiveErrorMessage: string
    receiveErrorTitle: string
    receiveErrorDescription: string
    isClaimTokenError: boolean
    isReceiveUnavailable: boolean
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    'update:receive-code': [value: string]
    claim: []
    'open-content': []
    retry: []
    dismiss: []
  }>()

  const getInputValue = (event: { detail?: { value?: string } }): string => event.detail?.value ?? ''
</script>

<template>
  <view class="receive-panel">
    <view v-if="props.shareToken && props.receiveState === 'inspecting'" class="receive-state-panel">
      <view class="receive-orbit"><text>···</text></view>
      <text class="receive-title">正在确认飞船</text>
      <text class="receive-description">正在读取航行凭证</text>
    </view>

    <view v-else-if="props.shareToken && props.inspectResult && props.receiveState !== 'received'" class="inspect-panel">
      <text class="panel-eyebrow">INCOMING TRANSFER</text>
      <text class="receive-title">有人给你发来一艘飞船</text>
      <text class="receive-description">{{ props.summaryText }}</text>
      <view class="inspect-meta">
        <text>还可领取 {{ props.inspectResult.remainingClaims }} 次</text>
        <text>{{ formatQuickTransferExpiry(props.inspectResult.expiresAt) }}</text>
      </view>
      <button class="quick-ship-button primary-button full-button" :disabled="props.isReceiving" @click="emit('claim')">接收飞船</button>
    </view>

    <view v-else-if="props.receiveState === 'received' && !props.isContentOpened" class="arrived-panel">
      <text class="success-mark">✓</text>
      <text class="receive-title">{{ QUICK_TRANSFER_COPY.receivedTitle }}</text>
      <text class="receive-description">{{ QUICK_TRANSFER_COPY.receivedDescription }}</text>
      <text v-if="props.hasReceipt" class="receipt-saved-hint">已保存到「已收飞船」</text>
      <button class="quick-ship-button primary-button full-button" @click="emit('open-content')">{{
        QUICK_TRANSFER_COPY.openReceived
      }}</button>
    </view>

    <view v-else-if="!props.isContentOpened && !props.shareToken" class="manual-panel">
      <text class="panel-eyebrow">RECEIVE TRANSFER</text>
      <text class="receive-title">接收飞船</text>
      <text class="receive-description">输入 6 位收船码，打开另一台设备送来的内容</text>
      <input
        class="code-input"
        type="number"
        :value="props.receiveCode"
        :maxlength="6"
        placeholder="000000"
        @input="emit('update:receive-code', getInputValue($event))" />
      <button
        class="quick-ship-button primary-button submit-button"
        :disabled="props.isReceiving || props.receiveCode.replace(/\D/g, '').length !== 6"
        @click="emit('claim')">
        {{ props.isReceiving ? QUICK_TRANSFER_COPY.receiveLoading : QUICK_TRANSFER_COPY.receiveButton }}
      </button>
    </view>

    <view v-if="props.receiveErrorMessage" class="receive-error-panel">
      <text class="receive-error-title">{{ props.receiveErrorTitle }}</text>
      <text class="receive-error-description">{{ props.receiveErrorDescription }}</text>
      <view v-if="props.isClaimTokenError" class="action-row">
        <button class="quick-ship-button secondary-button" @click="emit('dismiss')">返回</button>
        <button class="quick-ship-button primary-button" @click="emit('retry')">重新收船</button>
      </view>
      <button v-else-if="!props.isReceiveUnavailable" class="quick-ship-button secondary-button full-button" @click="emit('retry')"
        >重新尝试</button
      >
    </view>
  </view>
</template>

<style scoped lang="scss">
  .receive-panel {
    padding: 4rpx 0 12rpx;
    text-align: center;
  }

  .receive-state-panel,
  .inspect-panel,
  .arrived-panel,
  .manual-panel {
    padding: 16rpx 0;
  }

  .panel-eyebrow {
    display: block;
    color: var(--theme-brand);
    font-size: 19rpx;
    font-weight: 700;
    letter-spacing: 3rpx;
  }

  .receive-orbit {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 90rpx;
    height: 90rpx;
    margin: 0 auto 20rpx;
    border: 2rpx solid rgba(37, 99, 235, 0.35);
    border-radius: 50%;
    color: var(--theme-brand);
    font-size: 28rpx;
    animation: receive-pulse 1.1s ease-in-out infinite;
  }

  .receive-title {
    display: block;
    margin-top: 18rpx;
    color: var(--theme-text);
    font-size: 34rpx;
    font-weight: 700;
  }

  .receive-description,
  .receive-error-description,
  .receipt-saved-hint {
    display: block;
    margin-top: 12rpx;
    color: var(--theme-text-secondary);
    font-size: 25rpx;
    line-height: 1.6;
  }

  .receipt-saved-hint {
    color: var(--theme-brand);
    font-size: 22rpx;
  }

  .inspect-meta {
    display: flex;
    justify-content: center;
    gap: 18rpx;
    margin-top: 24rpx;
    color: var(--theme-text-secondary);
    font-size: 23rpx;
  }

  .full-button,
  .submit-button {
    width: 100%;
    margin-top: 24rpx;
  }

  .primary-button,
  .secondary-button {
    min-height: 82rpx;
    padding: 0 22rpx;
    border: 0;
    border-radius: 16rpx;
    font-size: 26rpx;
  }

  .primary-button {
    color: #fff;
    background: linear-gradient(135deg, #2563eb, #14b8a6);
  }

  .secondary-button {
    color: var(--theme-text);
    background: var(--theme-surface-muted);
  }

  .code-input {
    width: 100%;
    height: 100rpx;
    margin-top: 26rpx;
    padding: 0 24rpx;
    box-sizing: border-box;
    border: 1rpx solid var(--theme-border);
    border-radius: 20rpx;
    color: var(--theme-text);
    background: var(--theme-surface);
    font-size: 42rpx;
    letter-spacing: 14rpx;
    text-align: center;
  }

  .success-mark {
    display: block;
    color: var(--theme-brand);
    font-size: 76rpx;
    font-weight: 800;
  }

  .receive-error-panel {
    margin-top: 22rpx;
    padding: 18rpx;
    border-radius: 16rpx;
    background: rgba(220, 80, 80, 0.1);
    text-align: left;
  }

  .receive-error-title {
    display: block;
    color: var(--theme-text);
    font-size: 28rpx;
    font-weight: 700;
  }

  .action-row {
    display: flex;
    gap: 14rpx;
    margin-top: 20rpx;
  }

  .action-row > button {
    flex: 1;
  }

  button[disabled] {
    opacity: 0.45;
  }

  .quick-ship-button::after {
    border: 0;
  }

  @keyframes receive-pulse {
    0%,
    100% {
      opacity: 0.55;
      transform: scale(0.92);
    }
    50% {
      opacity: 1;
      transform: scale(1.05);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .receive-orbit {
      animation: none;
    }
  }
</style>
