<script setup lang="ts">
  import { ref } from 'vue'
  import { postFiles } from '@/services/apifox/NODEJSDEMO/FILES/apifox'
  import { uploadFile } from '@/utils/upload'
  import type { RelayImageValue, RelayFieldViewModel } from '../types'

  const props = withDefaults(
    defineProps<{
      field: RelayFieldViewModel
      modelValue: RelayImageValue[]
      disabled?: boolean
      canUpload?: boolean
      error?: string
    }>(),
    { disabled: false, canUpload: true, error: '' },
  )

  const emit = defineEmits<{
    'update:modelValue': [value: RelayImageValue[]]
    'uploading-change': [value: boolean]
  }>()

  const isUploading = ref(false)
  const uploadPlatform = (): 'web' | 'wechat' => {
    let platform: 'web' | 'wechat' = 'web'
    // #ifdef MP-WEIXIN
    platform = 'wechat'
    // #endif
    return platform
  }

  const replaceItem = (key: string, next: RelayImageValue) => {
    const items = props.modelValue.map(item => (item.localPath === key ? next : item))
    emit('update:modelValue', items)
  }

  const startUpload = async (retryIndex?: number) => {
    if (props.disabled || !props.canUpload || isUploading.value) return
    const maxCount = props.field.config.maxCount || 9
    const retryItem = retryIndex === undefined ? undefined : props.modelValue[retryIndex]
    if (retryIndex !== undefined && (!retryItem || retryItem.state !== 'failed')) return
    if (retryIndex === undefined && props.modelValue.filter(item => item.state === 'uploaded').length >= maxCount) {
      uni.showToast({ title: `最多上传 ${maxCount} 张图片`, icon: 'none' })
      return
    }

    const pendingKey = retryItem?.localPath || `pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const pending: RelayImageValue = { ...(retryItem || {}), fileId: '', url: '', state: 'uploading', localPath: pendingKey }
    emit('update:modelValue', retryIndex === undefined ? [...props.modelValue, pending] : props.modelValue.map((item, index) => (index === retryIndex ? pending : item)))
    isUploading.value = true
    emit('uploading-change', true)
    let selectedName = retryItem?.fileName || `relay-${Date.now()}.jpg`
    let selectedSize = retryItem?.fileSize || 0
    try {
      const url = await uploadFile(uploadPlatform(), 'album', {
        isOssPrivate: true,
        onAfterSelectFile: async file => {
          if (typeof file === 'string') return
          selectedName = file.name || selectedName
          selectedSize = Number.isFinite(file.size) ? file.size : 0
        },
      })
      const file = await postFiles({ file_name: selectedName, file_size: selectedSize, file_url: url, folder: '/接龙/' })
      if (!file.id || !file.file_url) throw new Error('文件记录创建失败')
      replaceItem(pendingKey, { fileId: file.id, url: file.file_url, state: 'uploaded', fileName: selectedName, fileSize: selectedSize })
    } catch {
      replaceItem(pendingKey, { fileId: '', url: '', state: 'failed', localPath: pendingKey, fileName: selectedName, fileSize: selectedSize })
      uni.showToast({ title: '图片上传失败，可重新选择', icon: 'none' })
    } finally {
      isUploading.value = false
      emit('uploading-change', false)
    }
  }

  const removeImage = (index: number) => emit('update:modelValue', props.modelValue.filter((_, itemIndex) => itemIndex !== index))

  const retryUpload = (index: number) => {
    if (!isUploading.value) void startUpload(index)
  }

  const previewImage = (url: string) => {
    if (!url) return
    const urls = props.modelValue.filter(item => item.state === 'uploaded' && item.url).map(item => item.url)
    uni.previewImage({ urls, current: url })
  }
</script>

<template>
  <view class="image-field">
    <view class="field-label-row">
      <view>
        <text class="field-label">{{ field.label }}</text>
        <text v-if="field.required" class="required-mark">必填</text>
      </view>
      <text class="image-count">{{ modelValue.filter(item => item.state === 'uploaded').length }} / {{ field.config.maxCount || 9 }}</text>
    </view>

    <view class="image-grid">
      <view v-for="(item, index) in modelValue" :key="item.localPath || item.fileId || index" class="image-item">
        <image v-if="item.url" class="image-preview" :src="item.url" mode="aspectFill" @click="previewImage(item.url)" />
        <view v-else class="image-placeholder">
          <text v-if="item.state === 'uploading'">上传中</text>
          <text v-else-if="item.state === 'failed'">失败</text>
          <text v-else>已上传</text>
        </view>
        <view class="image-remove" @click="removeImage(index)">×</view>
        <view v-if="item.state === 'failed'" class="image-retry" @click="retryUpload(index)">重试</view>
      </view>
      <view v-if="canUpload && modelValue.filter(item => item.state === 'uploaded').length < (field.config.maxCount || 9)" class="image-add" @click="startUpload">
        <text class="image-add-icon">＋</text>
        <text>添加图片</text>
      </view>
    </view>
    <text v-if="!canUpload" class="image-hint">游客暂不能上传图片，请登录后继续</text>
    <text v-if="error" class="field-error">{{ error }}</text>
  </view>
</template>

<style scoped lang="scss">
  .image-field {
    margin-bottom: 28rpx;
  }

  .field-label-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .field-label {
    color: var(--theme-text);
    font-size: 27rpx;
    font-weight: 700;
  }

  .required-mark,
  .field-error {
    margin-left: 10rpx;
    color: var(--theme-danger);
    font-size: 22rpx;
  }

  .image-count,
  .image-hint {
    color: var(--theme-text-tertiary);
    font-size: 22rpx;
  }

  .image-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 14rpx;
    margin-top: 16rpx;
  }

  .image-item,
  .image-add {
    position: relative;
    width: 190rpx;
    height: 190rpx;
    overflow: hidden;
    border-radius: 16rpx;
    background: var(--theme-surface-2);
  }

  .image-preview,
  .image-placeholder {
    width: 100%;
    height: 100%;
  }

  .image-placeholder,
  .image-add {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--theme-text-tertiary);
    font-size: 23rpx;
  }

  .image-add {
    border: 1rpx dashed var(--theme-border);
  }

  .image-add-icon {
    color: var(--theme-brand);
    font-size: 48rpx;
    line-height: 1;
  }

  .image-remove {
    position: absolute;
    top: 8rpx;
    right: 8rpx;
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    background: var(--theme-mask);
    color: var(--theme-bg);
    font-size: 34rpx;
    line-height: 36rpx;
    text-align: center;
  }

  .image-retry {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    padding: 8rpx 0;
    background: var(--theme-mask);
    color: var(--theme-bg);
    font-size: 21rpx;
    text-align: center;
  }

  .image-hint,
  .field-error {
    display: block;
    margin-top: 10rpx;
  }
</style>
