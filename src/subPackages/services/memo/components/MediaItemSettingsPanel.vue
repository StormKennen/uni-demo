<template>
  <DraftPanelShell
    :visible="visible"
    title="🎬 媒体设置"
    :is-dirty="isDirty"
    layout="bottom-sheet"
    @reset="reset"
    @cancel="cancel"
    @save="save"
  >
    <!-- 媒体源 URL -->
    <view class="mis-section">
      <view class="mis-section-title">媒体源地址</view>
      <textarea
        class="mis-url-textarea"
        :value="draft.url"
        @input="draft.url = $event.detail.value"
        placeholder="粘贴视频或音频源路径，如 https://example.com/video.mp4"
        :maxlength="1000"
        auto-height
      />
    </view>

    <!-- 媒体属性 -->
    <view class="mis-section">
      <view class="mis-section-title">播放属性</view>
      <view class="mis-prop-row">
        <text class="mis-label">显示控制条</text>
        <switch
          :checked="draft.controls !== false"
          @change="draft.controls = $event.detail.value"
          color="#667eea"
        />
      </view>
      <view class="mis-prop-row">
        <text class="mis-label">自动播放</text>
        <switch
          :checked="draft.autoplay === true"
          @change="draft.autoplay = $event.detail.value"
          color="#667eea"
        />
      </view>
      <view class="mis-prop-row">
        <text class="mis-label">循环播放</text>
        <switch
          :checked="draft.loop === true"
          @change="draft.loop = $event.detail.value"
          color="#667eea"
        />
      </view>
    </view>

    <!-- 预览（基于 draft 实时反映） -->
    <view class="mis-section" v-if="draft.url">
      <view class="mis-section-title">预览</view>
      <video
        v-if="isVideo(draft.url)"
        :src="draft.url"
        class="mis-preview-video"
        :controls="draft.controls !== false"
        :autoplay="false"
      ></video>
      <view v-else-if="isAudio(draft.url)" class="mis-preview-audio">
        <text class="mis-audio-icon">🎵</text>
        <text class="mis-audio-name">{{ draft.title || '音频文件' }}</text>
      </view>
      <text v-else class="mis-preview-hint">无法识别媒体类型，请确认 URL 后缀（.mp4/.mp3/.m4a）</text>
    </view>
  </DraftPanelShell>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { cloneDeep } from 'lodash-es'
import DraftPanelShell from './DraftPanelShell.vue'
import { useDraftPanel } from '../composables/useDraftPanel'

interface MediaItem {
  title?: string
  url: string
  autoplay?: boolean
  controls?: boolean
  loop?: boolean
}

const props = defineProps<{
  modelValue: boolean
  mediaItem: MediaItem | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'save', payload: MediaItem): void
}>()

function isVideo(url: string) {
  return /\.(mp4|webm|mov|m3u8)(\?|$)/i.test(url || '')
}
function isAudio(url: string) {
  return /\.(mp3|m4a|wav|ogg|aac)(\?|$)/i.test(url || '')
}

function extractDraft(item: MediaItem | null): MediaItem {
  if (!item) return { url: '', controls: true, autoplay: false, loop: false }
  return cloneDeep(item)
}

const { visible, draft, isDirty, open: openPanel, reset, cancel, save } = useDraftPanel<MediaItem>({
  source: () => extractDraft(props.mediaItem),
  apply: (d) => emit('save', d),
  onClose: () => emit('update:modelValue', false)
})

watch(() => props.modelValue, (val) => {
  if (val && !visible.value) {
    openPanel()
  } else if (!val && visible.value) {
    visible.value = false
  }
}, { immediate: true })
</script>

<style lang="scss" scoped>
.mis-section {
  margin-bottom: 20rpx;
}
.mis-section-title {
  font-size: 26rpx;
  color: #303133;
  font-weight: 600;
  margin-bottom: 12rpx;
}
.mis-url-textarea {
  width: 100%;
  min-height: 120rpx;
  padding: 16rpx;
  background: #f8f9fb;
  border: 1rpx solid #dcdfe6;
  border-radius: 12rpx;
  font-size: 26rpx;
  box-sizing: border-box;
}
.mis-prop-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f5f7fa;

  &:last-child { border-bottom: none; }
}
.mis-label {
  font-size: 26rpx;
  color: #606266;
}
.mis-preview-video {
  width: 100%;
  height: 360rpx;
  background: #000;
  border-radius: 12rpx;
}
.mis-preview-audio {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 24rpx;
  background: #f8f9fb;
  border-radius: 12rpx;
}
.mis-audio-icon { font-size: 36rpx; }
.mis-audio-name { font-size: 28rpx; color: #303133; }
.mis-preview-hint {
  display: block;
  padding: 16rpx;
  font-size: 24rpx;
  color: #909399;
  background: #fff7e6;
  border-radius: 12rpx;
}
</style>
