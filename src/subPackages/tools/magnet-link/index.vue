<template>
  <PageLayout title="磁力链接" nav-gradient="linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)">
    <view class="magnet-page">
      <view class="content">
        <view class="section">
          <view class="section-title">输入磁力链接</view>
          <textarea
            v-model="rawInput"
            class="input-area"
            placeholder="粘贴磁力链接，每行一个（支持不完整链接自动补全）"
            :maxlength="5000" />
          <view class="input-footer">
            <text class="paste-btn" @click="readClipboard">粘贴</text>
            <text class="input-counter">{{ rawInput.length }}/5000</text>
          </view>
        </view>

        <view class="section">
          <view class="section-title">批量替换</view>
          <view class="replace-row">
            <input v-model="findText" class="replace-input" placeholder="查找内容" />
            <text class="replace-arrow">→</text>
            <input v-model="replaceText" class="replace-input" placeholder="替换为" />
          </view>
        </view>

        <view class="action-row">
          <button class="action-btn primary" :disabled="!rawInput.trim()" @click="processLinks">处理链接</button>
          <button class="action-btn" :disabled="!processedLinks.length" @click="copyAll">复制全部</button>
          <button class="action-btn" :disabled="!processedLinks.length" @click="clearAll">清空</button>
        </view>

        <view v-if="stats.total > 0" class="stats-bar">
          <text>共 {{ stats.total }} 条</text>
          <text v-if="stats.completed > 0" class="stat-good">补全 {{ stats.completed }} 条</text>
          <text v-if="stats.removed > 0" class="stat-bad">过滤 {{ stats.removed }} 条</text>
          <text>有效 {{ processedLinks.length }} 条</text>
        </view>

        <view v-if="processedLinks.length" class="section result-section">
          <view class="section-title">处理结果</view>
          <view v-for="(link, index) in processedLinks" :key="index" class="link-item">
            <text class="link-index">{{ index + 1 }}</text>
            <text class="link-text" selectable>{{ link }}</text>
            <view class="link-actions">
              <text class="link-action" @click="copyOne(link)">复制</text>
              <text class="link-action" @click="openQrSheet(link)">二维码</text>
            </view>
          </view>
        </view>
      </view>

      <view v-if="isFlow && flowLink" class="flow-bar-spacer" />

      <ToolSheet v-model="qrSheetVisible" title="二维码生成" description="当前磁力链接会直接生成二维码，你可以保存二维码或继续图片打乱。">
        <QrGeneratorPanel
          v-if="qrSheetVisible"
          mode="sheet"
          :initial-content="selectedLink"
          :editable="false"
          :auto-generate="true"
          @shuffle-image="openShuffleSheet" />
      </ToolSheet>

      <ToolSheet v-model="shuffleSheetVisible" title="图片打乱" description="二维码图片已经带入，可以直接继续处理。">
        <ImageShufflePanel
          v-if="shuffleSheetVisible"
          mode="sheet"
          :initial-image="shuffleImage"
          :auto-run="true"
          :show-share-entry="false" />
      </ToolSheet>
    </view>

    <FlowActionBar
      v-if="isFlow && flowLink"
      title="下一步：生成二维码"
      description="将自动带入当前磁力链接"
      action-text="生成二维码"
      @action="goToQrGenerator" />
  </PageLayout>
</template>

<script setup lang="ts">
  import { computed, nextTick, reactive, ref } from 'vue'
  import { onLoad, onShow } from '@dcloudio/uni-app'
  import ToolSheet from '@/components/toolkit/base/tool-sheet.vue'
  import FlowActionBar from '@/components/toolkit/base/flow-action-bar.vue'
  import QrGeneratorPanel from '@/subPackages/tools/_shared/features/qr-generator-panel.vue'
  import ImageShufflePanel from '@/components/toolkit/business/image-shuffle-panel.vue'
  import type { ToolImagePayload } from '@/components/toolkit/types'
  import { reportToolVisit } from '@/utils/tracker'
  import {
    readToolFlowSession,
    updateToolFlowSession,
    type MagnetFlowPayload,
    type ScanFlowPayload,
    type ToolFlowId,
  } from '@/utils/tool-flow'

  const MAGNET_PREFIX = 'magnet:?xt=urn:btih:'
  const HASH_REGEX = /^[a-fA-F0-9]{40}$|^[a-zA-Z2-7]{32}$/

  const rawInput = ref('')
  const findText = ref('')
  const replaceText = ref('')
  const processedLinks = ref<string[]>([])
  const stats = reactive({ total: 0, completed: 0, removed: 0 })
  const qrSheetVisible = ref(false)
  const shuffleSheetVisible = ref(false)
  const selectedLink = ref('')
  const shuffleImage = ref<ToolImagePayload | null>(null)
  const isFlow = ref(false)
  const flowId = ref<ToolFlowId | ''>('')

  // flow 场景默认取第一条有效链接进入下一步
  const flowLink = computed(() => processedLinks.value[0] || '')

  const goToQrGenerator = () => {
    const magnet = flowLink.value
    if (!magnet || !flowId.value) return
    // magnet-flow / scan-flow 下一节点均为二维码生成页
    if (flowId.value === 'scan-flow') {
      updateToolFlowSession<ScanFlowPayload>('scan-flow', { magnet }, 'qr-generator')
    } else {
      updateToolFlowSession<MagnetFlowPayload>('magnet-flow', { magnet }, 'qr-generator')
    }
    uni.navigateTo({ url: `/subPackages/tools/qr-generator/index?flow=${flowId.value}` })
  }

  const isValidMagnet = (link: string): boolean => {
    if (!link.toLowerCase().startsWith('magnet:?xt=urn:btih:')) return false
    const hash = link.slice(20).split('&')[0]
    return HASH_REGEX.test(hash)
  }

  const completeMagnet = (line: string): string | null => {
    const trimmed = line.trim()
    if (!trimmed) return null

    if (trimmed.toLowerCase().startsWith('magnet:')) {
      return isValidMagnet(trimmed) ? trimmed : null
    }

    if (HASH_REGEX.test(trimmed)) {
      return MAGNET_PREFIX + trimmed
    }

    const hashMatch = trimmed.match(/[a-fA-F0-9]{40}|[a-zA-Z2-7]{32}/)
    if (hashMatch) {
      const candidate = MAGNET_PREFIX + hashMatch[0]
      return isValidMagnet(candidate) ? candidate : null
    }

    return null
  }

  const processLinks = () => {
    const lines = rawInput.value.split('\n').filter(line => line.trim())
    stats.total = lines.length
    stats.completed = 0
    stats.removed = 0

    const results: string[] = []
    for (const line of lines) {
      let processed = line.trim()
      if (findText.value) {
        processed = processed.split(findText.value).join(replaceText.value)
      }
      const magnet = completeMagnet(processed)
      if (magnet) {
        if (!processed.toLowerCase().startsWith('magnet:')) {
          stats.completed++
        }
        results.push(magnet)
      } else {
        stats.removed++
      }
    }
    processedLinks.value = results
  }

  const copyAll = () => {
    const text = processedLinks.value.join('\n')
    uni.setClipboardData({ data: text, showToast: false })
    uni.showToast({ title: `已复制 ${processedLinks.value.length} 条`, icon: 'success' })
  }

  const copyOne = (link: string) => {
    uni.setClipboardData({ data: link, showToast: false })
    uni.showToast({ title: '已复制', icon: 'success' })
  }

  const openQrSheet = async (link: string) => {
    selectedLink.value = link
    qrSheetVisible.value = false
    await nextTick()
    qrSheetVisible.value = true
  }

  const openShuffleSheet = async (payload: ToolImagePayload) => {
    shuffleImage.value = payload
    qrSheetVisible.value = false
    shuffleSheetVisible.value = false
    await nextTick()
    shuffleSheetVisible.value = true
  }

  const clearAll = () => {
    rawInput.value = ''
    processedLinks.value = []
    stats.total = 0
    stats.completed = 0
    stats.removed = 0
  }

  const readClipboard = () => {
    uni.getClipboardData({
      success: res => {
        if (res.data?.trim()) {
          rawInput.value = rawInput.value ? `${rawInput.value}\n${res.data.trim()}` : res.data.trim()
          uni.showToast({ title: '已粘贴', icon: 'success' })
        } else {
          uni.showToast({ title: '剪贴板为空', icon: 'none' })
        }
      },
      fail: () => {
        uni.showToast({ title: '读取剪贴板失败', icon: 'none' })
      },
    })
  }

  let hasAutoRead = false

  onLoad((options: Record<string, string | undefined>) => {
    if (options?.flow === 'magnet-flow' || options?.flow === 'scan-flow') {
      isFlow.value = true
      flowId.value = options.flow
      // flow 场景禁止自动读取剪贴板
      hasAutoRead = true
    }
    // scan-flow：从二维码解析带入原始文本，自动补全
    if (options?.flow === 'scan-flow') {
      const session = readToolFlowSession<ScanFlowPayload>('scan-flow')
      const rawText = session?.payload.rawText
      if (rawText) {
        rawInput.value = rawText
        processLinks()
      }
    }
    if (options?.input) {
      rawInput.value = decodeURIComponent(options.input)
      hasAutoRead = true
    }
  })

  onShow(() => {
    reportToolVisit('magnet-link')
    if (hasAutoRead || rawInput.value) return
    uni.getClipboardData({
      success: res => {
        const text = res.data?.trim()
        if (!text) return
        const hasMagnetHint = /magnet:|[a-fA-F0-9]{40}|[a-zA-Z2-7]{32}/i.test(text)
        if (hasMagnetHint) {
          uni.showModal({
            title: '检测到剪贴板内容',
            content: '发现疑似磁力链接，是否粘贴？',
            confirmText: '粘贴',
            cancelText: '取消',
            success: modal => {
              if (modal.confirm) {
                rawInput.value = text
              }
            },
          })
        }
      },
    })
    hasAutoRead = true
  })
</script>

<style scoped lang="scss">
  .magnet-page {
    min-height: 100vh;
    background: var(--theme-bg);
  }

  .content {
    padding: calc(24rpx + var(--nav-height, 120rpx)) 24rpx 24rpx;
  }

  .flow-bar-spacer {
    height: 180rpx;
  }

  .section {
    margin-bottom: 24rpx;
    padding: 24rpx;
    border-radius: 18rpx;
    background: var(--theme-surface);
    box-shadow: 0 2rpx 12rpx var(--theme-shadow-xs);
  }

  .section-title {
    font-size: 28rpx;
    font-weight: 800;
    color: var(--theme-text);
    margin-bottom: 16rpx;
  }

  .input-area {
    width: 100%;
    min-height: 200rpx;
    padding: 20rpx;
    border: 2rpx solid var(--theme-border);
    border-radius: 12rpx;
    font-size: 26rpx;
    line-height: 1.6;
    color: var(--theme-text);
    box-sizing: border-box;
    background: var(--theme-surface-2);
  }

  .input-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 8rpx;
  }

  .paste-btn {
    padding: 6rpx 20rpx;
    border-radius: 8rpx;
    background: #eef2ff;
    color: #6366f1;
    font-size: 24rpx;
    font-weight: 700;
  }

  .input-counter {
    font-size: 22rpx;
    color: #9ba3b1;
  }

  .replace-row {
    display: flex;
    align-items: center;
    gap: 16rpx;
  }

  .replace-input {
    flex: 1;
    min-width: 0;
    height: 80rpx;
    padding: 0 20rpx;
    border: 2rpx solid var(--theme-border);
    border-radius: 12rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text);
    font-size: 26rpx;
  }

  .replace-arrow {
    font-size: 32rpx;
    color: #8b5cf6;
    font-weight: 700;
  }

  .action-row {
    display: flex;
    gap: 16rpx;
    margin-bottom: 24rpx;
  }

  .action-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 84rpx;
    min-width: 0;
    padding: 0 16rpx;
    border-radius: 20rpx;
    border: none;
    background: var(--theme-surface);
    color: var(--theme-text);
    font-size: 28rpx;
    font-weight: 700;
    line-height: 1.2;
    box-sizing: border-box;
    box-shadow: 0 2rpx 10rpx var(--theme-shadow-xs);

    &::after {
      border: none;
    }
  }

  .action-btn.primary {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: #fff;
  }

  .action-btn:disabled {
    opacity: 0.5;
    box-shadow: none;
  }

  .stats-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    margin-bottom: 24rpx;
    padding: 18rpx 20rpx;
    border-radius: 16rpx;
    background: rgba(99, 102, 241, 0.08);
    color: var(--theme-text-secondary);
    font-size: 24rpx;
  }

  .stat-good {
    color: #0f9f6e;
  }

  .stat-bad {
    color: #ef4444;
  }

  .result-section {
    padding-bottom: 12rpx;
  }

  .link-item {
    display: flex;
    align-items: flex-start;
    gap: 18rpx;
    padding: 18rpx 0;
    border-bottom: 1rpx solid var(--theme-border);
  }

  .link-item:last-child {
    border-bottom: 0;
    padding-bottom: 0;
  }

  .link-index {
    width: 36rpx;
    flex-shrink: 0;
    font-size: 24rpx;
    line-height: 1.8;
    color: #8b5cf6;
    font-weight: 700;
  }

  .link-text {
    flex: 1;
    min-width: 0;
    font-size: 24rpx;
    line-height: 1.7;
    color: var(--theme-text);
    word-break: break-all;
  }

  .link-actions {
    display: flex;
    gap: 12rpx;
    flex-shrink: 0;
  }

  .link-action {
    padding: 6rpx 16rpx;
    border-radius: 999rpx;
    background: rgba(99, 102, 241, 0.12);
    color: #5b63da;
    font-size: 22rpx;
    font-weight: 700;
  }
</style>
