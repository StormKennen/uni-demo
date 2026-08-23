<script setup lang="ts">
  import { reactive } from 'vue'
  import { createCustomComplianceRule } from '@/features/image-compliance/validator'
  import type { ComplianceCustomRuleInput, ImageComplianceRule } from '@/features/image-compliance/types'

  const emit = defineEmits<{
    cancel: []
    submit: [rule: ImageComplianceRule]
  }>()

  const form = reactive<ComplianceCustomRuleInput>({
    width: '',
    height: '',
    targetFormat: 'jpeg',
    minFileSizeKb: '',
    maxFileSizeKb: '',
    resizeMode: 'cover',
  })

  const submit = () => {
    try {
      emit('submit', createCustomComplianceRule(form))
    } catch (error) {
      uni.showToast({ title: error instanceof Error ? error.message : '规格填写有误', icon: 'none' })
    }
  }
</script>

<template>
  <view class="form-shell">
    <view class="form-header">
      <text class="form-title">自定义规格</text>
      <button class="icon-button" aria-label="关闭" @click="emit('cancel')">
        <uni-icons type="closeempty" size="22" color="var(--theme-text-secondary)" />
      </button>
    </view>

    <view class="form-group">
      <text class="group-title">图片尺寸</text>
      <view class="dimension-row">
        <view class="field-shell">
          <input v-model="form.width" class="field-input" type="number" placeholder="宽" />
          <text class="field-unit">px</text>
        </view>
        <text class="multiply">×</text>
        <view class="field-shell">
          <input v-model="form.height" class="field-input" type="number" placeholder="高" />
          <text class="field-unit">px</text>
        </view>
      </view>
      <text class="field-help">宽高同时留空时保持原图尺寸</text>
    </view>

    <view class="form-group">
      <text class="group-title">文件格式</text>
      <view class="segmented">
        <view class="segment" :class="{ active: form.targetFormat === 'jpeg' }" @click="form.targetFormat = 'jpeg'">JPG</view>
        <view class="segment" :class="{ active: form.targetFormat === 'png' }" @click="form.targetFormat = 'png'">PNG</view>
      </view>
    </view>

    <view class="form-group">
      <text class="group-title">文件大小</text>
      <view class="dimension-row">
        <view class="field-shell">
          <input v-model="form.minFileSizeKb" class="field-input" type="number" placeholder="最小" />
          <text class="field-unit">KB</text>
        </view>
        <text class="multiply">～</text>
        <view class="field-shell">
          <input v-model="form.maxFileSizeKb" class="field-input" type="number" placeholder="最大" />
          <text class="field-unit">KB</text>
        </view>
      </view>
    </view>

    <view v-if="form.width && form.height" class="form-group">
      <text class="group-title">适配方式</text>
      <view class="mode-list">
        <view class="mode-item" :class="{ active: form.resizeMode === 'cover' }" @click="form.resizeMode = 'cover'">
          <uni-icons :type="form.resizeMode === 'cover' ? 'checkbox-filled' : 'circle'" size="20" color="#16845b" />
          <view class="mode-copy">
            <text class="mode-name">裁剪填满</text>
            <text class="field-help">图片完全填满目标尺寸，可能裁掉边缘</text>
          </view>
        </view>
        <view class="mode-item" :class="{ active: form.resizeMode === 'contain' }" @click="form.resizeMode = 'contain'">
          <uni-icons :type="form.resizeMode === 'contain' ? 'checkbox-filled' : 'circle'" size="20" color="#16845b" />
          <view class="mode-copy">
            <text class="mode-name">完整保留</text>
            <text class="field-help">保留完整图片，可能产生留白</text>
          </view>
        </view>
      </view>
    </view>

    <button class="submit-button" @click="submit">使用此规格</button>
  </view>
</template>

<style scoped lang="scss">
  .form-shell {
    display: flex;
    flex-direction: column;
    gap: 30rpx;
    padding: 28rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 8rpx;
    background: var(--theme-surface);
  }

  .form-header,
  .dimension-row,
  .mode-item {
    display: flex;
    align-items: center;
  }

  .form-header {
    justify-content: space-between;
  }

  .form-title {
    color: var(--theme-text);
    font-size: 32rpx;
    font-weight: 650;
  }

  .icon-button {
    display: flex;
    width: 64rpx;
    height: 64rpx;
    align-items: center;
    justify-content: center;
    margin: 0;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: var(--theme-surface-2);
  }

  .icon-button::after,
  .submit-button::after {
    border: 0;
  }

  .form-group,
  .mode-copy {
    display: flex;
    flex-direction: column;
  }

  .form-group {
    gap: 14rpx;
  }

  .group-title,
  .mode-name {
    color: var(--theme-text);
    font-size: 27rpx;
    font-weight: 600;
  }

  .dimension-row {
    gap: 14rpx;
  }

  .field-shell {
    display: flex;
    min-width: 0;
    height: 82rpx;
    flex: 1;
    box-sizing: border-box;
    align-items: center;
    border: 1rpx solid var(--theme-border);
    border-radius: 8rpx;
    background: var(--theme-surface-2);
    padding: 0 18rpx;
  }

  .field-input {
    min-width: 0;
    height: 100%;
    flex: 1;
    color: var(--theme-text);
    font-size: 28rpx;
  }

  .field-unit,
  .multiply,
  .field-help {
    color: var(--theme-text-tertiary);
    font-size: 23rpx;
  }

  .segmented {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    padding: 6rpx;
    border-radius: 8rpx;
    background: var(--theme-surface-2);
  }

  .segment {
    height: 68rpx;
    border-radius: 6rpx;
    color: var(--theme-text-secondary);
    font-size: 27rpx;
    line-height: 68rpx;
    text-align: center;
  }

  .segment.active {
    background: var(--theme-surface);
    box-shadow: 0 2rpx 10rpx var(--theme-shadow-xs);
    color: var(--theme-brand);
    font-weight: 600;
  }

  .mode-list {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
  }

  .mode-item {
    gap: 16rpx;
    padding: 20rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 8rpx;
  }

  .mode-item.active {
    border-color: #16845b;
    background: rgba(22, 132, 91, 0.06);
  }

  .mode-copy {
    gap: 4rpx;
  }

  .submit-button {
    width: 100%;
    height: 88rpx;
    margin: 0;
    border-radius: 8rpx;
    background: var(--theme-brand);
    color: #fff;
    font-size: 29rpx;
    font-weight: 600;
  }
</style>
