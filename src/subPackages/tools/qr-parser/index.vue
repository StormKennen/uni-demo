<template>
  <PageLayout title="二维码解析" nav-gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
    <view class="qr-parser-page">
      <view class="content">
        <QrParserPanel @parsed="handleParsed" />
        <view v-if="!isFlow && parsedText" class="save-wallet-row">
          <button class="save-wallet-btn" @click="saveToCodeWallet">保存到码包</button>
        </view>
        <view v-if="isFlow && canContinue" class="flow-bar-spacer" />
      </view>
    </view>

    <FlowActionBar
      v-if="isFlow && canContinue"
      title="下一步：磁力补全"
      description="将自动带入解析结果并补全磁力链接"
      action-text="磁力补全"
      @action="goToMagnetLink" />
  </PageLayout>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { onLoad, onShareAppMessage, onShareTimeline, onShow } from '@dcloudio/uni-app'
  import QrParserPanel, { type QrParsedType } from '@/components/toolkit/business/qr-parser-panel.vue'
  import FlowActionBar from '@/components/toolkit/base/flow-action-bar.vue'
  import { reportToolVisit } from '@/utils/tracker'
  import { updateToolFlowSession, type ScanFlowPayload } from '@/utils/tool-flow'

  const isFlow = ref(false)
  const canContinue = ref(false)
  const parsedText = ref('')

  const handleParsed = (payload: { text: string; type: QrParsedType }) => {
    parsedText.value = payload.text
    if (!isFlow.value) return
    // 仅当解析出磁力/hash 特征时才允许继续链路
    canContinue.value = payload.type === 'magnetCandidate'
  }

  const saveToCodeWallet = () => {
    if (!parsedText.value) return
    uni.navigateTo({
      url: `/subPackages/tools/code-wallet/index?content=${encodeURIComponent(parsedText.value)}&codeType=qr`,
    })
  }

  const goToMagnetLink = () => {
    if (!canContinue.value || !parsedText.value) return
    updateToolFlowSession<ScanFlowPayload>('scan-flow', { rawText: parsedText.value }, 'magnet-link')
    uni.navigateTo({ url: '/subPackages/tools/magnet-link/index?flow=scan-flow' })
  }

  onLoad((options: Record<string, string | undefined>) => {
    if (options?.flow === 'scan-flow') {
      isFlow.value = true
    }
  })

  onShow(() => {
    reportToolVisit('qr-parser')
  })

  // #ifdef MP-WEIXIN
  onShareAppMessage(() => ({
    title: '二维码解析 - 图片与扫码解析',
    path: '/subPackages/tools/qr-parser/index',
    imageUrl: '/static/logo.png',
  }))

  onShareTimeline(() => ({
    title: '二维码解析 - 图片与扫码解析',
    path: '/subPackages/tools/qr-parser/index',
    imageUrl: '/static/logo.png',
  }))
  // #endif
</script>

<style scoped lang="scss">
  .qr-parser-page {
    min-height: 100vh;
    background: var(--theme-bg);
  }

  .content {
    padding: calc(32rpx + var(--nav-height, 120rpx)) 32rpx 32rpx;
  }

  .flow-bar-spacer {
    height: 180rpx;
  }

  .save-wallet-row {
    margin-top: 24rpx;
  }

  .save-wallet-btn {
    width: 100%;
    height: 84rpx;
    border: none;
    border-radius: 999rpx;
    font-size: 28rpx;
    color: #fff;
    background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
  }
</style>
