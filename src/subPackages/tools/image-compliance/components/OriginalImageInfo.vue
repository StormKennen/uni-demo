<script setup lang="ts">
  import type { ComplianceImageInfo, ComplianceValidationResult, ImageComplianceRule } from '@/features/image-compliance/types'
  import { formatComplianceFileSize, formatRuleDimensions, formatRuleFileSize } from '@/features/image-compliance/validator'

  defineProps<{
    image: ComplianceImageInfo
    rule: ImageComplianceRule
    validation: ComplianceValidationResult
  }>()
</script>

<template>
  <view class="image-info-block">
    <view class="preview-shell">
      <image class="preview-image" :src="image.previewUrl" mode="aspectFit" />
      <view class="preview-meta">
        <text>{{ image.width }} × {{ image.height }}</text>
        <text>{{ validation.format.actual }}</text>
        <text>{{ formatComplianceFileSize(image.fileSize) }}</text>
      </view>
    </view>

    <view class="comparison">
      <view class="comparison-header">
        <text class="comparison-title">目标要求与当前状态</text>
        <view v-if="validation.passed" class="passed-banner">
          <uni-icons type="checkbox-filled" size="18" color="#16845b" />
          <text>当前图片已经符合目标要求</text>
        </view>
      </view>
      <view class="comparison-row">
        <text class="metric-name">尺寸</text>
        <view class="metric-values">
          <text>{{ formatRuleDimensions(rule) }}</text>
          <text class="actual-value">当前 {{ validation.dimensions.actual }}</text>
        </view>
        <uni-icons
          :type="validation.dimensions.passed ? 'checkbox-filled' : 'info-filled'"
          size="20"
          :color="validation.dimensions.passed ? '#16845b' : '#b66b00'" />
      </view>
      <view class="comparison-row">
        <text class="metric-name">格式</text>
        <view class="metric-values">
          <text>{{ rule.targetFormat === 'jpeg' ? 'JPG' : 'PNG' }}</text>
          <text class="actual-value">当前 {{ validation.format.actual }}</text>
        </view>
        <uni-icons
          :type="validation.format.passed ? 'checkbox-filled' : 'info-filled'"
          size="20"
          :color="validation.format.passed ? '#16845b' : '#b66b00'" />
      </view>
      <view class="comparison-row">
        <text class="metric-name">大小</text>
        <view class="metric-values">
          <text>{{ formatRuleFileSize(rule) }}</text>
          <text class="actual-value">当前 {{ validation.fileSize.actual }}</text>
        </view>
        <uni-icons
          :type="validation.fileSize.passed ? 'checkbox-filled' : 'info-filled'"
          size="20"
          :color="validation.fileSize.passed ? '#16845b' : '#b66b00'" />
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
  .image-info-block,
  .preview-shell,
  .comparison,
  .metric-values {
    display: flex;
    flex-direction: column;
  }

  .image-info-block {
    gap: 24rpx;
  }

  .preview-shell,
  .comparison {
    overflow: hidden;
    border: 1rpx solid var(--theme-border);
    border-radius: 8rpx;
    background: var(--theme-surface);
  }

  .preview-image {
    width: 100%;
    height: 520rpx;
    background: var(--theme-surface-2);
  }

  .preview-meta {
    display: flex;
    justify-content: center;
    gap: 24rpx;
    padding: 20rpx;
    color: var(--theme-text-secondary);
    font-size: 24rpx;
  }

  .comparison {
    padding: 26rpx;
  }

  .comparison-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12rpx;
    margin-bottom: 8rpx;
  }

  .comparison-title {
    color: var(--theme-text);
    font-size: 29rpx;
    font-weight: 650;
  }

  .passed-banner {
    display: flex;
    align-items: center;
    gap: 6rpx;
    color: #16845b;
    font-size: 22rpx;
  }

  .comparison-row {
    display: grid;
    grid-template-columns: 90rpx minmax(0, 1fr) 42rpx;
    align-items: center;
    gap: 14rpx;
    min-height: 104rpx;
    border-bottom: 1rpx solid var(--theme-border);
  }

  .comparison-row:last-child {
    border-bottom: 0;
  }

  .metric-name {
    color: var(--theme-text-secondary);
    font-size: 25rpx;
  }

  .metric-values {
    min-width: 0;
    gap: 4rpx;
    color: var(--theme-text);
    font-size: 26rpx;
  }

  .actual-value {
    color: var(--theme-text-tertiary);
    font-size: 22rpx;
  }
</style>
