<script setup lang="ts">
  import { onLoad } from '@dcloudio/uni-app'
  import { ref } from 'vue'
  import { getAgreementMeta, type AgreementSection, type AgreementType } from '../agreement/content'
  import { safeBack } from '@/utils/navigation'

  type Option = {
    title?: string
    url?: string
    decodeUrl?: string
    type?: AgreementType
  }

  const webviewSrc = ref('')
  const pageTitle = ref('')
  const showError = ref(false)
  const errorMessage = ref('')
  const isLoading = ref(true)
  const agreementType = ref<AgreementType | ''>('')
  const isAgreementPage = ref(false)
  const defaultAgreementMeta = getAgreementMeta('protocol')
  const agreementTitle = ref(defaultAgreementMeta.title)
  const agreementSubtitle = ref(defaultAgreementMeta.subtitle)
  const agreementUpdatedAt = ref(defaultAgreementMeta.updatedAt)
  const agreementSections = ref<AgreementSection[]>([...defaultAgreementMeta.sections])

  const resolveAgreementType = (option: Option): AgreementType | '' => {
    if (option.type === 'privacy' || option.type === 'protocol') {
      return option.type
    }
    const title = option.title || ''
    if (title.includes('隐私') || title.includes('政策')) {
      return 'privacy'
    }
    // 兼容微信后台服务名（如“凉白开工具箱 小程序提供服务”）以及常见协议标题
    if (
      title.includes('用户') ||
      title.includes('服务') ||
      title.includes('协议') ||
      title.includes('提供服务') ||
      title.includes('工具箱')
    ) {
      return 'protocol'
    }
    return ''
  }

  const setupAgreementPage = (type: AgreementType) => {
    const meta = getAgreementMeta(type)
    isAgreementPage.value = true
    agreementType.value = type
    agreementTitle.value = meta.title
    agreementSubtitle.value = meta.subtitle
    agreementUpdatedAt.value = meta.updatedAt
    agreementSections.value = [...meta.sections]
  }

  onLoad(option => {
    console.log('🚀 ~ webview onLoad ~ option:', option)
    const _option = option || ({} as Option)
    const hasExternalUrl = Boolean(_option.url || _option.decodeUrl)
    let resolvedAgreementType = resolveAgreementType(_option)

    // 无外部网页地址时一律展示协议内容，兼容微信审核后台各种入口（无参数 / 仅服务名标题）
    if (!resolvedAgreementType && !hasExternalUrl) {
      resolvedAgreementType = 'protocol'
    }

    if (resolvedAgreementType) {
      setupAgreementPage(resolvedAgreementType)
    }

    // 协议页强制使用标准标题，避免被微信后台服务名覆盖后看起来像空白
    if (isAgreementPage.value) {
      pageTitle.value = agreementTitle.value
    } else {
      pageTitle.value = _option.title || '网页浏览'
    }
    uni.setNavigationBarTitle({
      title: pageTitle.value,
    })

    if (isAgreementPage.value) {
      isLoading.value = false
      showError.value = false
      return
    }

    webviewSrc.value = _option.decodeUrl ? decodeURIComponent(_option.url || '') : _option.url || ''
    console.log('🚀 ~ webview src:', webviewSrc.value)

    // 设置加载超时
    setTimeout(() => {
      if (isLoading.value) {
        isLoading.value = false
        showError.value = true
        errorMessage.value = '页面加载超时，请检查网络连接'
      }
    }, 10000)
  })

  const goBack = () => {
    safeBack()
  }

  const onIframeLoad = () => {
    console.log('🚀 ~ iframe loaded successfully')
    isLoading.value = false
    showError.value = false
  }

  const onIframeError = () => {
    console.log('🚀 ~ iframe load error')
    isLoading.value = false
    showError.value = true
    errorMessage.value = '页面加载失败，可能是网络问题或页面不支持嵌入显示'
  }

  const openInNewTab = () => {
    window.open(webviewSrc.value, '_blank')
  }

  const retry = () => {
    isLoading.value = true
    showError.value = false
    // 强制重新加载iframe
    const iframe = document.querySelector('.h5-iframe') as HTMLIFrameElement
    if (iframe) {
      iframe.src = webviewSrc.value
    }
  }
</script>

<template>
  <view class="webview-container">
    <!-- 自定义导航栏 -->
    <!-- #ifdef H5 -->
    <view class="custom-navbar">
      <view class="navbar-content">
        <view class="back-btn" @click="goBack">
          <uni-icons type="left" size="20" color="#333" />
          <text class="back-text">返回</text>
        </view>
        <view class="navbar-title">{{ pageTitle }}</view>
        <view class="placeholder"></view>
      </view>
    </view>
    <!-- #endif -->

    <view class="webview-content">
      <view v-if="isAgreementPage" class="agreement-page">
        <view class="agreement-hero">
          <text class="agreement-title">{{ agreementTitle }}</text>
          <text class="agreement-subtitle">{{ agreementSubtitle }}</text>
          <text class="agreement-date">更新日期：{{ agreementUpdatedAt }}</text>
        </view>

        <view v-for="section in agreementSections" :key="section.title" class="agreement-card">
          <text class="agreement-section-title">{{ section.title }}</text>
          <view v-for="item in section.items" :key="item" class="agreement-item">
            <text class="agreement-dot">•</text>
            <text class="agreement-text">{{ item }}</text>
          </view>
        </view>
      </view>

      <!-- #ifdef H5 -->
      <!-- 加载状态 -->
      <view v-if="!isAgreementPage && isLoading" class="loading-container">
        <view class="loading-spinner"></view>
        <text class="loading-text">正在加载页面...</text>
      </view>

      <!-- 错误状态 -->
      <view v-if="!isAgreementPage && showError" class="error-container">
        <view class="error-icon">⚠️</view>
        <text class="error-message">{{ errorMessage }}</text>
        <view class="error-actions">
          <button class="retry-btn" @click="retry">重试</button>
          <button class="open-btn" @click="openInNewTab">在新窗口打开</button>
        </view>
      </view>

      <!-- iframe内容 -->
      <iframe
        v-if="!isAgreementPage && webviewSrc && !showError"
        :src="webviewSrc"
        class="h5-iframe"
        frameborder="0"
        allowfullscreen
        @load="onIframeLoad"
        @error="onIframeError"></iframe>
      <!-- #endif -->

      <!-- #ifndef H5 -->
      <web-view v-if="!isAgreementPage && webviewSrc" :src="webviewSrc" bindmessage=""></web-view>
      <!-- #endif -->
    </view>
  </view>
</template>

<style lang="scss" scoped>
  .webview-container {
    min-height: 100vh;
    background: var(--theme-bg, #f6f7fb);
  }

  .agreement-page {
    min-height: 100vh;
    padding: 32rpx 28rpx 56rpx;
    box-sizing: border-box;
    background: var(--theme-bg, #f6f7fb);
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
    color: var(--theme-text, #121826);
  }

  .agreement-subtitle,
  .agreement-date {
    font-size: 26rpx;
    line-height: 40rpx;
    color: var(--theme-text-secondary, #687386);
  }

  .agreement-card {
    margin-top: 20rpx;
    padding: 28rpx;
    border: 1rpx solid var(--theme-border, #e6e8ef);
    border-radius: 16rpx;
    background: var(--theme-surface, #ffffff);
  }

  .agreement-section-title {
    display: block;
    margin-bottom: 16rpx;
    font-size: 31rpx;
    line-height: 42rpx;
    font-weight: 700;
    color: var(--theme-text, #121826);
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
    color: var(--theme-brand, #4768f5);
  }

  .agreement-text {
    flex: 1;
    font-size: 27rpx;
    line-height: 42rpx;
    color: var(--theme-text, #121826);
  }

  /* #ifdef H5 */
  .custom-navbar {
    height: 44px;
    background-color: var(--theme-surface);
    border-bottom: 1px solid var(--theme-border);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;

    .navbar-content {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;

      .back-btn {
        display: flex;
        align-items: center;
        cursor: pointer;

        .back-text {
          margin-left: 4px;
          font-size: 16px;
          color: var(--theme-text);
        }
      }

      .navbar-title {
        font-size: 16px;
        font-weight: 500;
        color: var(--theme-text);
        text-align: center;
        flex: 1;
      }

      .placeholder {
        width: 60px;
      }
    }
  }

  .webview-content {
    flex: 1;
    margin-top: 44px;
    position: relative;

    .h5-iframe {
      width: 100%;
      height: 100%;
      border: none;
    }

    .loading-container {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;

      .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #007aff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 16px;
      }

      .loading-text {
        color: var(--theme-text-secondary);
        font-size: 14px;
      }
    }

    .error-container {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      padding: 20px;

      .error-icon {
        font-size: 48px;
        margin-bottom: 16px;
      }

      .error-message {
        color: var(--theme-text-secondary);
        font-size: 14px;
        line-height: 1.5;
        margin-bottom: 20px;
        display: block;
      }

      .error-actions {
        display: flex;
        gap: 12px;
        justify-content: center;

        button {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s;

          &.retry-btn {
            background-color: #007aff;
            color: white;

            &:hover {
              background-color: #0056cc;
            }
          }

          &.open-btn {
            background-color: var(--theme-surface-2);
            color: var(--theme-text);

            &:hover {
              background-color: #e0e0e0;
            }
          }
        }
      }
    }

    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  }
  /* #endif */

  /* #ifndef H5 */
  .webview-content {
    flex: 1;
  }
  /* #endif */
</style>
