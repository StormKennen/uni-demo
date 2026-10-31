<script setup lang="ts">
  import { computed } from 'vue'
  import type { ImageComplianceRule } from '@/features/image-compliance/types'
  import { formatRuleDimensions, formatRuleFileSize } from '@/features/image-compliance/validator'

  const props = defineProps<{
    presets: ImageComplianceRule[]
    recentRules: ImageComplianceRule[]
    selectedId?: string
  }>()

  const emit = defineEmits<{
    select: [rule: ImageComplianceRule]
    custom: []
  }>()

  const categories = computed(() => {
    const names = ['常用场景', '文件大小', '其他']
    return names.map(name => ({ name, rules: props.presets.filter(rule => rule.category === name) })).filter(group => group.rules.length)
  })

  const ruleSummary = (rule: ImageComplianceRule) =>
    `${formatRuleDimensions(rule)} · ${rule.targetFormat === 'jpeg' ? 'JPG' : 'PNG'} · ${formatRuleFileSize(rule)}`
</script>

<template>
  <view class="rule-picker">
    <view v-if="recentRules.length" class="rule-section">
      <text class="section-title">最近使用</text>
      <scroll-view class="recent-scroll" scroll-x :show-scrollbar="false">
        <view class="recent-row">
          <view
            v-for="rule in recentRules"
            :key="rule.id"
            class="recent-item"
            :class="{ selected: selectedId === rule.id }"
            @click="emit('select', rule)">
            <text class="recent-name">{{ rule.name }}</text>
            <text class="recent-summary">{{ ruleSummary(rule) }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <view v-for="group in categories" :key="group.name" class="rule-section">
      <text class="section-title">{{ group.name }}</text>
      <view class="rule-grid">
        <view
          v-for="rule in group.rules"
          :key="rule.id"
          class="rule-item"
          :class="{ selected: selectedId === rule.id }"
          @click="emit('select', rule)">
          <view class="rule-heading">
            <text class="rule-name">{{ rule.name }}</text>
            <text v-if="rule.recommended" class="recommend-badge">推荐</text>
          </view>
          <text class="rule-description">{{ rule.description || ruleSummary(rule) }}</text>
          <uni-icons v-if="selectedId === rule.id" class="selected-icon" type="checkbox-filled" size="20" color="#16845b" />
        </view>
      </view>
    </view>

    <button class="custom-button" @click="emit('custom')">
      <uni-icons type="gear" size="19" color="var(--theme-text-secondary)" />
      <text>自定义规格</text>
      <uni-icons type="right" size="16" color="var(--theme-text-tertiary)" />
    </button>
  </view>
</template>

<style scoped lang="scss">
  .rule-picker,
  .rule-section {
    display: flex;
    flex-direction: column;
  }

  .rule-picker {
    gap: 34rpx;
  }

  .rule-section {
    gap: 16rpx;
  }

  .section-title {
    color: var(--theme-text);
    font-size: 30rpx;
    font-weight: 650;
  }

  .recent-scroll {
    width: 100%;
    white-space: nowrap;
  }

  .recent-row {
    display: flex;
    gap: 16rpx;
    padding-bottom: 4rpx;
  }

  .recent-item,
  .rule-item {
    box-sizing: border-box;
    border: 1rpx solid var(--theme-border);
    border-radius: 8rpx;
    background: var(--theme-surface);
  }

  .recent-item {
    display: inline-flex;
    width: 380rpx;
    flex-direction: column;
    gap: 8rpx;
    padding: 22rpx;
    white-space: normal;
  }

  .recent-item.selected,
  .rule-item.selected {
    border-color: #16845b;
    box-shadow: 0 0 0 2rpx rgba(22, 132, 91, 0.12);
  }

  .recent-name,
  .rule-name {
    color: var(--theme-text);
    font-size: 28rpx;
    font-weight: 600;
  }

  .recent-summary,
  .rule-description {
    color: var(--theme-text-tertiary);
    font-size: 23rpx;
    line-height: 1.45;
  }

  .rule-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16rpx;
  }

  .rule-item {
    position: relative;
    min-height: 150rpx;
    padding: 22rpx;
  }

  .rule-heading {
    display: flex;
    min-width: 0;
    align-items: flex-start;
    gap: 8rpx;
    padding-right: 26rpx;
  }

  .rule-name {
    overflow-wrap: anywhere;
  }

  .recommend-badge {
    flex-shrink: 0;
    border-radius: 6rpx;
    background: rgba(22, 132, 91, 0.12);
    color: #16845b;
    font-size: 20rpx;
    padding: 3rpx 7rpx;
  }

  .rule-description {
    display: block;
    margin-top: 10rpx;
  }

  .selected-icon {
    position: absolute;
    top: 16rpx;
    right: 14rpx;
  }

  .custom-button {
    display: flex;
    width: 100%;
    height: 90rpx;
    box-sizing: border-box;
    align-items: center;
    justify-content: space-between;
    margin: 0;
    border: 1rpx solid var(--theme-border);
    border-radius: 8rpx;
    background: var(--theme-surface);
    color: var(--theme-text);
    font-size: 28rpx;
  }

  .custom-button::after {
    border: 0;
  }
</style>
