<script setup lang="ts">
  import type {
    ComplianceImageInfo,
    ComplianceImageResult,
    ComplianceValidationResult,
    ImageComplianceRule,
  } from '@/features/image-compliance/types'
  import { formatComplianceFileSize } from '@/features/image-compliance/validator'

  defineProps<{
    original: ComplianceImageInfo
    result: ComplianceImageResult
    rule: ImageComplianceRule
    validation: ComplianceValidationResult
    reason?: string
  }>()

  const emit = defineEmits<{
    save: []
    next: []
    adjust: []
  }>()
</script>

<template>
  <view class="result-shell">
    <view class="result-status" :class="{ passed: validation.passed, failed: !validation.passed }">
      <uni-icons
        :type="validation.passed ? 'checkbox-filled' : 'info-filled'"
        size="42"
        :color="validation.passed ? '#16845b' : '#b66b00'" />
      <text class="status-title">{{ validation.passed ? '图片已达标' : '未完全满足要求' }}</text>
      <text v-if="reason && !validation.passed" class="status-reason">{{ reason }}</text>
    </view>

    <image class="result-preview" :src="result.previewUrl" mode="aspectFit" show-menu-by-longpress />

    <view class="comparison-table">
      <view class="table-row table-head">
        <text>项目</text>
        <text>原图</text>
        <text>处理后</text>
        <text></text>
      </view>
      <view class="table-row">
        <text class="metric-label">尺寸</text>
        <text>{{ original.width }}×{{ original.height }}</text>
        <text>{{ result.width }}×{{ result.height }}</text>
        <uni-icons
          :type="validation.dimensions.passed ? 'checkbox-filled' : 'closeempty'"
          size="18"
          :color="validation.dimensions.passed ? '#16845b' : '#c64747'" />
      </view>
      <view class="table-row">
        <text class="metric-label">格式</text>
        <text>{{ original.format === 'jpeg' ? 'JPG' : original.format.toUpperCase() }}</text>
        <text>{{ result.mimeType.includes('png') ? 'PNG' : 'JPG' }}</text>
        <uni-icons
          :type="validation.format.passed ? 'checkbox-filled' : 'closeempty'"
          size="18"
          :color="validation.format.passed ? '#16845b' : '#c64747'" />
      </view>
      <view class="table-row">
        <text class="metric-label">大小</text>
        <text>{{ formatComplianceFileSize(original.fileSize) }}</text>
        <text>{{ formatComplianceFileSize(result.fileSize) }}</text>
        <uni-icons
          :type="validation.fileSize.passed ? 'checkbox-filled' : 'closeempty'"
          size="18"
          :color="validation.fileSize.passed ? '#16845b' : '#c64747'" />
      </view>
    </view>

    <view v-if="!validation.passed" class="failure-detail">
      <text v-if="!validation.dimensions.passed">尺寸：{{ validation.dimensions.actual }}，目标 {{ validation.dimensions.expected }}</text>
      <text v-if="!validation.format.passed">格式：{{ validation.format.actual }}，目标 {{ validation.format.expected }}</text>
      <text v-if="!validation.fileSize.passed">文件大小：{{ validation.fileSize.actual }}，目标 {{ validation.fileSize.expected }}</text>
    </view>

    <button class="primary-button" @click="emit('save')">
      <uni-icons type="download" size="20" color="#fff" />
      <text>保存图片</text>
    </button>
    <view class="secondary-actions">
      <button class="secondary-button" @click="emit('next')">使用相同规格处理下一张</button>
      <button class="icon-button" aria-label="重新调整" @click="emit('adjust')">
        <uni-icons type="refreshempty" size="21" color="var(--theme-text-secondary)" />
      </button>
    </view>
  </view>
</template>

<style scoped lang="scss">
  .result-shell,
  .result-status,
  .failure-detail {
    display: flex;
    flex-direction: column;
  }

  .result-shell {
    gap: 22rpx;
  }

  .result-status {
    align-items: center;
    gap: 10rpx;
    padding: 30rpx 20rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 8rpx;
    background: var(--theme-surface);
    text-align: center;
  }

  .status-title {
    color: var(--theme-text);
    font-size: 36rpx;
    font-weight: 700;
  }

  .result-status.passed .status-title {
    color: #16845b;
  }

  .result-status.failed .status-title {
    color: #b66b00;
  }

  .status-reason {
    max-width: 580rpx;
    color: var(--theme-text-secondary);
    font-size: 24rpx;
    line-height: 1.5;
  }

  .result-preview {
    width: 100%;
    height: 600rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 8rpx;
    background: var(--theme-surface-2);
  }

  .comparison-table {
    overflow: hidden;
    border: 1rpx solid var(--theme-border);
    border-radius: 8rpx;
    background: var(--theme-surface);
  }

  .table-row {
    display: grid;
    grid-template-columns: 90rpx minmax(0, 1fr) minmax(0, 1fr) 40rpx;
    align-items: center;
    gap: 10rpx;
    min-height: 92rpx;
    padding: 0 20rpx;
    border-bottom: 1rpx solid var(--theme-border);
    color: var(--theme-text);
    font-size: 23rpx;
  }

  .table-row:last-child {
    border-bottom: 0;
  }

  .table-head {
    min-height: 70rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text-tertiary);
    font-size: 21rpx;
  }

  .metric-label {
    color: var(--theme-text-secondary);
  }

  .failure-detail {
    gap: 8rpx;
    padding: 20rpx;
    border-left: 6rpx solid #c64747;
    border-radius: 4rpx;
    background: rgba(198, 71, 71, 0.08);
    color: var(--theme-text-secondary);
    font-size: 23rpx;
  }

  .primary-button,
  .secondary-button,
  .icon-button {
    height: 88rpx;
    margin: 0;
    border-radius: 8rpx;
    font-size: 27rpx;
  }

  .primary-button {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: center;
    gap: 10rpx;
    background: var(--theme-brand);
    color: #fff;
    font-weight: 600;
  }

  .secondary-actions {
    display: flex;
    gap: 14rpx;
  }

  .secondary-button {
    flex: 1;
    border: 1rpx solid var(--theme-border);
    background: var(--theme-surface);
    color: var(--theme-text-secondary);
  }

  .icon-button {
    display: flex;
    width: 88rpx;
    flex: none;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 1rpx solid var(--theme-border);
    background: var(--theme-surface);
  }

  .primary-button::after,
  .secondary-button::after,
  .icon-button::after {
    border: 0;
  }
</style>
