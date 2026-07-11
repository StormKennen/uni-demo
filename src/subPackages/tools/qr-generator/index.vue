<template>
  <PageLayout title="二维码生成器" nav-gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
    <view class="qr-generator-page">
      <view class="content">
        <QrGeneratorPanel
          mode="page"
          :initial-content="initialContent"
          :auto-generate="autoGenerate"
          @shuffle-image="openShuffleSheet" />
      </view>

      <ToolSheet v-model="shuffleSheetVisible" title="图片打乱" description="二维码已经带入，你可以直接继续打乱或重组。">
        <ImageShufflePanel
          v-if="shuffleSheetVisible"
          mode="sheet"
          :initial-image="shuffleImage"
          :auto-run="true"
          :show-share-entry="false" />
      </ToolSheet>
    </view>
  </PageLayout>
</template>

<script setup lang="ts">
  import { nextTick, ref } from 'vue'
  import { onLoad, onShareAppMessage, onShareTimeline, onShow } from '@dcloudio/uni-app'
  import QrGeneratorPanel from '@/components/toolkit/business/qr-generator-panel.vue'
  import ImageShufflePanel from '@/components/toolkit/business/image-shuffle-panel.vue'
  import ToolSheet from '@/components/toolkit/base/tool-sheet.vue'
  import type { ToolImagePayload } from '@/components/toolkit/types'
  import { reportToolVisit } from '@/utils/tracker'

  const initialContent = ref('')
  const autoGenerate = ref(false)
  const clipboardAutoRead = ref(false)
  const shuffleSheetVisible = ref(false)
  const shuffleImage = ref<ToolImagePayload | null>(null)

  const openShuffleSheet = async (payload: ToolImagePayload) => {
    shuffleImage.value = payload
    shuffleSheetVisible.value = false
    await nextTick()
    shuffleSheetVisible.value = true
  }

  onLoad((options: Record<string, string | undefined>) => {
    if (typeof options?.content === 'string') {
      initialContent.value = decodeURIComponent(options.content)
      autoGenerate.value = true
      clipboardAutoRead.value = true
    }
  })

  onShow(() => {
    reportToolVisit('qr-generator')
    if (clipboardAutoRead.value || initialContent.value) return

    uni.getClipboardData({
      success: res => {
        const text = res.data?.trim()
        if (!text) return
        uni.showModal({
          title: '检测到剪贴板内容',
          content: text.length > 80 ? `${text.slice(0, 80)}...` : text,
          confirmText: '粘贴',
          cancelText: '取消',
          success: modal => {
            if (modal.confirm) {
              initialContent.value = text
            }
          },
        })
      },
    })
    clipboardAutoRead.value = true
  })

  // #ifdef MP-WEIXIN
  onShareAppMessage(() => ({
    title: '二维码生成器 - 快速生成二维码',
    path: '/subPackages/tools/qr-generator/index',
    imageUrl: '/static/logo.png',
  }))

  onShareTimeline(() => ({
    title: '二维码生成器 - 快速生成二维码',
    path: '/subPackages/tools/qr-generator/index',
    imageUrl: '/static/logo.png',
  }))
  // #endif
</script>

<style scoped lang="scss">
  .qr-generator-page {
    min-height: 100vh;
    background: var(--theme-bg);
  }

  .content {
    padding: calc(32rpx + var(--nav-height, 120rpx)) 32rpx 32rpx;
  }
</style>
