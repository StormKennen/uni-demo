<template>
  <scroll-view class="agreement-scroll" scroll-y enable-back-to-top>
    <view class="agreement-page">
      <view class="agreement-hero">
        <text class="agreement-title">{{ title }}</text>
        <text class="agreement-subtitle">{{ subtitle }}</text>
        <text class="agreement-date">更新日期：{{ updatedAt }}</text>
      </view>

      <view v-if="!sections.length" class="agreement-card">
        <text class="agreement-section-title">内容加载中</text>
        <view class="agreement-item">
          <text class="agreement-dot">•</text>
          <text class="agreement-text">若长时间未显示，请返回后重新进入本页。</text>
        </view>
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
  import {
    getAgreementMeta,
    normalizeAgreementType,
    type AgreementSection,
    type AgreementType,
  } from './content'

  // 防空白：初始化即填入默认协议正文，不依赖 onLoad / 网络 / 登录
  const defaultMeta = getAgreementMeta('protocol')
  const title = ref(defaultMeta.title)
  const subtitle = ref(defaultMeta.subtitle)
  const updatedAt = ref(defaultMeta.updatedAt)
  const sections = ref<AgreementSection[]>([...defaultMeta.sections])

  const applyType = (type: AgreementType) => {
    const meta = getAgreementMeta(type)
    title.value = meta.title
    subtitle.value = meta.subtitle
    updatedAt.value = meta.updatedAt
    sections.value = [...meta.sections]
    uni.setNavigationBarTitle({ title: meta.title })
  }

  const resolveTypeFromOptions = (option: Record<string, string | undefined> = {}): AgreementType => {
    if (option.type === 'privacy' || option.type === 'protocol') {
      return normalizeAgreementType(option.type)
    }
    const t = option.title || ''
    if (t.includes('隐私') || t.includes('政策')) return 'privacy'
    return 'protocol'
  }

  onLoad(option => {
    try {
      const type = resolveTypeFromOptions((option || {}) as Record<string, string | undefined>)
      applyType(type)
    } catch (error) {
      // 任何异常都回退到默认协议，避免审核环境空白
      applyType('protocol')
    }
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
