<template>
  <view class="magnet-page">
    <PageLayout title="磁力链接" nav-gradient="linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" />

    <view class="content">
      <view class="section">
        <view class="section-title">输入磁力链接</view>
        <textarea v-model="rawInput" class="input-area" placeholder="粘贴磁力链接，每行一个（支持不完整链接自动补全）" :maxlength="5000" />
        <view class="input-counter">{{ rawInput.length }}/5000</view>
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
            <text class="link-action" @click="generateQr(link)">二维码</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
  import { ref, reactive } from 'vue'
  import { onLoad } from '@dcloudio/uni-app'
  import PageLayout from '@/components/PageLayout.vue'

  const MAGNET_PREFIX = 'magnet:?xt=urn:btih:'
  const HASH_REGEX = /^[a-fA-F0-9]{40}$|^[a-zA-Z2-7]{32}$/

  const rawInput = ref('')
  const findText = ref('')
  const replaceText = ref('')
  const processedLinks = ref<string[]>([])
  const stats = reactive({ total: 0, completed: 0, removed: 0 })

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
    const lines = rawInput.value.split('\n').filter(l => l.trim())
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

  const generateQr = (link: string) => {
    uni.navigateTo({
      url: `/subPackages/tools/qr-generator/index?content=${encodeURIComponent(link)}`,
    })
  }

  const clearAll = () => {
    rawInput.value = ''
    processedLinks.value = []
    stats.total = 0
    stats.completed = 0
    stats.removed = 0
  }

  onLoad((options: Record<string, string | undefined>) => {
    if (options?.input) {
      rawInput.value = decodeURIComponent(options.input)
    }
  })
</script>

<style scoped lang="scss">
  .magnet-page {
    min-height: 100vh;
    background: #f4f6fb;
  }

  .content {
    padding: 24rpx;
  }

  .section {
    margin-bottom: 24rpx;
    padding: 24rpx;
    border-radius: 18rpx;
    background: #fff;
    box-shadow: 0 2rpx 12rpx rgba(34, 48, 76, 0.05);
  }

  .section-title {
    font-size: 28rpx;
    font-weight: 800;
    color: #1b2434;
    margin-bottom: 16rpx;
  }

  .input-area {
    width: 100%;
    min-height: 200rpx;
    padding: 20rpx;
    border: 2rpx solid #e8edf5;
    border-radius: 12rpx;
    font-size: 26rpx;
    line-height: 1.6;
    color: #333;
    box-sizing: border-box;
  }

  .input-counter {
    text-align: right;
    font-size: 22rpx;
    color: #9ba3b1;
    margin-top: 8rpx;
  }

  .replace-row {
    display: flex;
    align-items: center;
    gap: 16rpx;
  }

  .replace-input {
    flex: 1;
    height: 72rpx;
    padding: 0 20rpx;
    border: 2rpx solid #e8edf5;
    border-radius: 12rpx;
    font-size: 26rpx;
    color: #333;
  }

  .replace-arrow {
    color: #8b5cf6;
    font-size: 32rpx;
    font-weight: 700;
  }

  .action-row {
    display: flex;
    gap: 16rpx;
    margin-bottom: 24rpx;
  }

  .action-btn {
    flex: 1;
    height: 80rpx;
    border-radius: 14rpx;
    font-size: 28rpx;
    font-weight: 700;
    background: #e8eef5;
    color: #4a5568;
    border: none;
    line-height: 80rpx;
  }

  .action-btn.primary {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: #fff;
  }

  .action-btn[disabled] {
    opacity: 0.5;
  }

  .stats-bar {
    display: flex;
    gap: 20rpx;
    padding: 16rpx 24rpx;
    margin-bottom: 24rpx;
    border-radius: 12rpx;
    background: #fff;
    font-size: 24rpx;
    color: #667085;
    font-weight: 700;
  }

  .stat-good {
    color: #10b981;
  }

  .stat-bad {
    color: #ef4444;
  }

  .result-section {
    max-height: 800rpx;
    overflow-y: auto;
  }

  .link-item {
    display: flex;
    align-items: flex-start;
    gap: 12rpx;
    padding: 16rpx 0;
    border-bottom: 1rpx solid #f0f2f5;
  }

  .link-item:last-child {
    border-bottom: none;
  }

  .link-index {
    flex: none;
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    background: #eef2ff;
    color: #6366f1;
    font-size: 22rpx;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 40rpx;
    text-align: center;
  }

  .link-text {
    flex: 1;
    font-size: 22rpx;
    color: #374151;
    line-height: 1.5;
    word-break: break-all;
  }

  .link-actions {
    flex: none;
    display: flex;
    gap: 12rpx;
  }

  .link-action {
    padding: 6rpx 16rpx;
    border-radius: 8rpx;
    background: #eef2ff;
    color: #6366f1;
    font-size: 22rpx;
    font-weight: 700;
  }
</style>
