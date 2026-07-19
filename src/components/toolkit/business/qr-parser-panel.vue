<template>
  <view class="qr-parser-panel">
    <!-- #ifdef H5 -->
    <ToolSectionCard title="图片解析（手机浏览器）" subtitle="若解析失败，请确保图片清晰且包含完整二维码">
      <button class="action-btn parse-btn" @click="parseQRCodeFromImage">选择图片并解析二维码</button>
      <view v-if="previewSrc" class="preview-wrap">
        <image :src="previewSrc" class="preview-image" mode="widthFix" />
      </view>
    </ToolSectionCard>
    <!-- #endif -->

    <!-- #ifndef H5 -->
    <ToolSectionCard title="扫码解析（微信小程序/APP）">
      <button class="action-btn scan-btn" @click="scanQRCode">打开相机扫码解析</button>
    </ToolSectionCard>
    <!-- #endif -->

    <ToolSectionCard v-if="parseResult || parseError" title="解析结果">
      <view class="info-item" v-if="parseResult">
        <text class="info-label">内容</text>
        <text class="info-value">{{ parseResult }}</text>
      </view>
      <view v-if="parseResult" class="analysis-card" :class="`risk--${parsedAnalysis.riskLevel}`">
        <view class="analysis-head">
          <text class="analysis-type">{{ parsedAnalysis.typeLabel }}</text>
          <text class="analysis-risk">{{ parsedAnalysis.riskTitle }}</text>
        </view>
        <text v-if="parsedAnalysis.host" class="analysis-host">{{ parsedAnalysis.host }}</text>
        <text class="analysis-desc">{{ parsedAnalysis.riskDesc }}</text>
      </view>
      <view v-if="parseResult" class="quick-actions">
        <button class="mini-btn" @click="copyResult">复制内容</button>
        <button class="mini-btn primary" @click="generateQrFromResult">生成二维码</button>
        <button v-if="parsedAnalysis.canGoMagnet" class="mini-btn accent" @click="goToMagnetLink">磁力补全</button>
      </view>
      <view class="info-item" v-if="parseError">
        <text class="info-label">错误</text>
        <text class="info-value">{{ parseError }}</text>
      </view>
    </ToolSectionCard>
  </view>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import ToolSectionCard from '@/components/toolkit/base/tool-section-card.vue'

  export type QrParsedType = 'text' | 'url' | 'magnetCandidate'
  type RiskLevel = 'safe' | 'warn' | 'neutral'

  interface ParsedAnalysis {
    canGoMagnet: boolean
    host: string
    riskDesc: string
    riskLevel: RiskLevel
    riskTitle: string
    typeLabel: string
  }

  const emit = defineEmits<{
    (e: 'parsed', payload: { text: string; type: QrParsedType }): void
  }>()

  const previewSrc = ref('')
  const parseResult = ref('')
  const parseError = ref('')
  const shortLinkHosts = ['t.cn', 'dwz.cn', 'suo.im', 'bit.ly', 'goo.gl', 'tinyurl.com', 'is.gd', 'cutt.ly', 'ow.ly', 'buff.ly', 'rebrand.ly']

  const detectParsedType = (text: string): QrParsedType => {
    if (/magnet:|[a-fA-F0-9]{40}|[a-zA-Z2-7]{32}/i.test(text)) return 'magnetCandidate'
    if (/^https?:\/\//i.test(text)) return 'url'
    return 'text'
  }

  const extractHost = (text: string): string => {
    const match = text.match(/^https?:\/\/([^/?#]+)/i)
    return match?.[1]?.toLowerCase() || ''
  }

  const parsedAnalysis = computed<ParsedAnalysis>(() => {
    const text = parseResult.value.trim()
    const type = detectParsedType(text)
    const host = extractHost(text)
    const isShortLink = shortLinkHosts.some(item => host === item || host.endsWith(`.${item}`))
    const isIpHost = /^\d{1,3}(\.\d{1,3}){3}(:\d+)?$/.test(host)
    const isHttp = /^http:\/\//i.test(text)

    if (type === 'magnetCandidate') {
      return {
        canGoMagnet: true,
        host: '',
        riskDesc: '识别到磁力链接或 Hash 特征，可以继续补全为标准磁力链接后再生成二维码。',
        riskLevel: 'neutral',
        riskTitle: '可继续处理',
        typeLabel: '磁力/Hash',
      }
    }

    if (type === 'url') {
      if (isShortLink) {
        return {
          canGoMagnet: false,
          host,
          riskDesc: '短链接会隐藏最终跳转地址，打开前建议确认来源可信。',
          riskLevel: 'warn',
          riskTitle: '谨慎打开',
          typeLabel: '短链接',
        }
      }
      if (isHttp || isIpHost) {
        return {
          canGoMagnet: false,
          host,
          riskDesc: isHttp ? '该链接不是 HTTPS，可能存在被篡改或窃听风险。' : '该链接使用 IP 地址，建议确认来源后再访问。',
          riskLevel: 'warn',
          riskTitle: '需要确认',
          typeLabel: '网页链接',
        }
      }
      return {
        canGoMagnet: false,
        host,
        riskDesc: '这是一个普通网页链接。复制或打开前仍建议确认来源。',
        riskLevel: 'safe',
        riskTitle: '未发现明显风险',
        typeLabel: '网页链接',
      }
    }

    return {
      canGoMagnet: false,
      host: '',
      riskDesc: '这是普通文本内容，适合复制、保存或重新生成二维码。',
      riskLevel: 'neutral',
      riskTitle: '普通文本',
      typeLabel: '文本',
    }
  })

  const emitParsed = (text: string) => {
    emit('parsed', { text, type: detectParsedType(text) })
  }

  const copyResult = () => {
    if (!parseResult.value) return
    uni.setClipboardData({
      data: parseResult.value,
      success: () => uni.showToast({ title: '已复制', icon: 'success' }),
    })
  }

  const generateQrFromResult = () => {
    if (!parseResult.value) return
    uni.navigateTo({
      url: `/subPackages/tools/qr-generator/index?content=${encodeURIComponent(parseResult.value)}`,
    })
  }

  const goToMagnetLink = () => {
    if (!parseResult.value) return
    uni.navigateTo({
      url: `/subPackages/tools/magnet-link/index?input=${encodeURIComponent(parseResult.value)}`,
    })
  }

  const parseQRCodeFromImage = async () => {
    parseResult.value = ''
    parseError.value = ''
    try {
      const chooseRes = await new Promise<UniApp.ChooseImageSuccessCallbackResult>((resolve, reject) => {
        uni.chooseImage({ count: 1, success: resolve, fail: reject })
      })
      const path = chooseRes.tempFilePaths?.[0] || chooseRes.tempFiles?.[0]?.path || ''
      if (!path) {
        throw new Error('未选择图片')
      }
      previewSrc.value = path

      // #ifdef H5
      const jsqrMod = await import(/* @vite-ignore */ 'https://cdn.skypack.dev/jsqr')
      const jsQR = jsqrMod.default || jsqrMod
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image()
        image.crossOrigin = 'anonymous'
        image.onload = () => resolve(image)
        image.onerror = () => reject(new Error('图片加载失败'))
        image.src = path
      })

      const offscreen = document.createElement('canvas')
      const width = img.naturalWidth || img.width
      const height = img.naturalHeight || img.height
      offscreen.width = width
      offscreen.height = height
      const context = offscreen.getContext('2d')
      if (!context) {
        throw new Error('图片解析上下文不可用')
      }
      context.imageSmoothingEnabled = false
      context.drawImage(img, 0, 0, width, height)
      const imageData = context.getImageData(0, 0, width, height)
      const result = jsQR(imageData.data, width, height)
      if (result?.data) {
        parseResult.value = result.data
        emitParsed(result.data)
        uni.showToast({ title: '解析成功', icon: 'success' })
      } else {
        parseError.value = '未识别到二维码'
        uni.showToast({ title: '未识别到二维码', icon: 'none' })
      }
      // #endif

      // #ifndef H5
      uni.showToast({ title: '当前环境不支持相册图片解析', icon: 'none' })
      // #endif
    } catch (error) {
      console.error('图片解析失败:', error)
      parseError.value = error instanceof Error ? error.message : '解析失败'
      uni.showToast({ title: '解析失败', icon: 'none' })
    }
  }

  const scanQRCode = async () => {
    parseResult.value = ''
    parseError.value = ''
    try {
      // #ifndef H5
      const result = await new Promise<UniApp.ScanCodeSuccessRes>((resolve, reject) => {
        uni.scanCode({
          onlyFromCamera: true,
          success: resolve,
          fail: reject,
        })
      })
      if (result?.result) {
        parseResult.value = result.result
        emitParsed(result.result)
        uni.showToast({ title: '解析成功', icon: 'success' })
      } else {
        parseError.value = '未识别到二维码'
        uni.showToast({ title: '未识别到二维码', icon: 'none' })
      }
      // #endif

      // #ifdef H5
      uni.showToast({ title: '请在微信小程序或App中使用扫码解析', icon: 'none' })
      // #endif
    } catch (error) {
      console.error('扫码解析失败:', error)
      parseError.value = error instanceof Error ? error.message : '解析失败'
      uni.showToast({ title: '解析失败', icon: 'none' })
    }
  }
</script>

<style scoped lang="scss">
  .qr-parser-panel {
    display: flex;
    flex-direction: column;
    gap: 24rpx;
  }

  .action-btn {
    width: 100%;
    height: 88rpx;
    border: none;
    border-radius: 44rpx;
    font-size: 32rpx;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
  }

  .parse-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
  }

  .scan-btn {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    box-shadow: 0 8rpx 24rpx rgba(240, 147, 251, 0.3);
  }

  .preview-wrap {
    margin-top: 24rpx;
    display: flex;
    justify-content: center;
  }

  .preview-image {
    max-width: 100%;
    border-radius: 16rpx;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
  }

  .info-label {
    font-size: 26rpx;
    color: var(--theme-text-secondary);
  }

  .info-value {
    font-size: 28rpx;
    line-height: 1.6;
    color: var(--theme-text);
    word-break: break-all;
  }

  .analysis-card {
    margin-top: 20rpx;
    padding: 20rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 20rpx;
    background: var(--theme-surface-2);
    display: flex;
    flex-direction: column;
    gap: 8rpx;
  }

  .analysis-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
  }

  .analysis-type,
  .analysis-risk {
    font-size: 24rpx;
    font-weight: 700;
  }

  .analysis-type {
    color: var(--theme-text);
  }

  .analysis-risk {
    color: var(--theme-text-secondary);
  }

  .analysis-host,
  .analysis-desc {
    font-size: 24rpx;
    line-height: 1.5;
    color: var(--theme-text-secondary);
    word-break: break-all;
  }

  .risk--safe {
    border-color: rgba(7, 193, 96, 0.34);
    background: rgba(7, 193, 96, 0.08);

    .analysis-risk {
      color: #07c160;
    }
  }

  .risk--warn {
    border-color: rgba(245, 158, 11, 0.38);
    background: rgba(245, 158, 11, 0.1);

    .analysis-risk {
      color: #d97706;
    }
  }

  .quick-actions {
    margin-top: 20rpx;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14rpx;
  }

  .mini-btn {
    height: 72rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 18rpx;
    background: var(--theme-surface);
    color: var(--theme-text);
    font-size: 24rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .mini-btn.primary {
    border-color: rgba(102, 126, 234, 0.28);
    color: #667eea;
    background: rgba(102, 126, 234, 0.1);
  }

  .mini-btn.accent {
    border-color: rgba(240, 147, 251, 0.3);
    color: #d946ef;
    background: rgba(240, 147, 251, 0.1);
  }
</style>
