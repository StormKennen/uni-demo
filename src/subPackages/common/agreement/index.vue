<template>
  <scroll-view class="agreement-scroll" scroll-y>
    <view class="agreement-page">
      <view class="agreement-hero">
        <text class="agreement-title">{{ title }}</text>
        <text class="agreement-subtitle">{{ subtitle }}</text>
        <text class="agreement-date">更新日期：2026年8月7日</text>
      </view>

      <view v-for="section in sections" :key="section.title" class="agreement-card">
        <text class="agreement-section-title">{{ section.title }}</text>
        <view v-for="item in section.items" :key="item" class="agreement-item">
          <text class="agreement-dot">•</text>
          <text class="agreement-text">{{ item }}</text>
        </view>
      </view>
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
  import { onLoad } from '@dcloudio/uni-app'
  import { ref } from 'vue'
  import { getAgreementMeta, type AgreementSection, type AgreementType } from './content'

  const title = ref('用户服务协议')
  const subtitle = ref('')
  const sections = ref<AgreementSection[]>([])

  const resolveType = (option: Record<string, string | undefined> = {}): AgreementType => {
    if (option.type === 'privacy' || option.type === 'protocol') return option.type
    const t = option.title || ''
    if (t.includes('隐私') || t.includes('政策')) return 'privacy'
    return 'protocol'
  }

  onLoad(option => {
    const type = resolveType((option || {}) as Record<string, string | undefined>)
    const meta = getAgreementMeta(type)
    title.value = meta.title
    subtitle.value = meta.subtitle
    sections.value = meta.sections
    uni.setNavigationBarTitle({ title: meta.title })
  })
</script>

<style lang="scss" scoped>
  .agreement-scroll {
    height: 100vh;
    background: #f6f7fb;
  }

  .agreement-page {
    min-height: 100vh;
    padding: 32rpx 28rpx 56rpx;
    box-sizing: border-box;
    background: #f6f7fb;
  }

  .agreement-hero {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
    padding: 8rpx 4rpx 24rpx;
  }

  .agreement-title {
    font-size: 42rpx;
    line-height: 56rpx;
    font-weight: 700;
    color: #121826;
  }

  .agreement-subtitle,
  .agreement-date {
    font-size: 26rpx;
    line-height: 40rpx;
    color: #687386;
  }

  .agreement-card {
    margin-top: 20rpx;
    padding: 28rpx;
    border: 1rpx solid #e6e8ef;
    border-radius: 16rpx;
    background: #ffffff;
  }

  .agreement-section-title {
    display: block;
    margin-bottom: 16rpx;
    font-size: 31rpx;
    line-height: 42rpx;
    font-weight: 700;
    color: #121826;
  }

  .agreement-item {
    display: flex;
    align-items: flex-start;
    gap: 12rpx;
    margin-top: 14rpx;
  }

  .agreement-dot {
    width: 18rpx;
    flex-shrink: 0;
    font-size: 28rpx;
    line-height: 40rpx;
    color: #4768f5;
  }

  .agreement-text {
    flex: 1;
    font-size: 27rpx;
    line-height: 42rpx;
    color: #121826;
  }
</style>
