<script setup lang="ts">
  import { computed, onBeforeUnmount, ref } from 'vue'
  import { onShow } from '@dcloudio/uni-app'
  import ComplianceRulePicker from './components/ComplianceRulePicker.vue'
  import ComplianceRuleForm from './components/ComplianceRuleForm.vue'
  import OriginalImageInfo from './components/OriginalImageInfo.vue'
  import ImageCropper from './components/ImageCropper.vue'
  import ComplianceResult from './components/ComplianceResult.vue'
  import { requiresComplianceCrop } from '@/features/image-compliance/crop'
  import { filePicker, isFilePickerCancel, type SelectedFile } from '@/platform/file'
  import { checkMediaSecurity } from '@/services/security'
  import { reportToolVisit } from '@/utils/tracker'
  import { processImageCompliance } from '@/features/image-compliance/api'
  import {
    createComplianceImageResult,
    readResultImageInfo,
    releaseComplianceImageResult,
  } from '@/features/image-compliance/result-adapter'
  import { getCompliancePresets, getRecentComplianceRules, saveRecentComplianceRule } from '@/features/image-compliance/presets'
  import { normalizeImageFormat, validateCompliance } from '@/features/image-compliance/validator'
  import type {
    ComplianceImageInfo,
    ComplianceImageResult,
    ComplianceStep,
    ComplianceValidationResult,
    ImageComplianceRule,
    NormalizedCrop,
  } from '@/features/image-compliance/types'

  const MAX_SOURCE_SIZE = 10 * 1024 * 1024

  const step = ref<ComplianceStep>('rule')
  const presets = ref(getCompliancePresets())
  const recentRules = ref(getRecentComplianceRules())
  const selectedRule = ref<ImageComplianceRule>()
  const showCustomForm = ref(false)
  const originalImage = ref<ComplianceImageInfo>()
  const crop = ref<NormalizedCrop>()
  const result = ref<ComplianceImageResult>()
  const resultValidation = ref<ComplianceValidationResult>()
  const resultReason = ref('')
  const selecting = ref(false)
  const processing = ref(false)

  onShow(() => reportToolVisit('image-compliance'))

  const stepIndex = computed(() => {
    if (step.value === 'rule') return 0
    if (step.value === 'image' || step.value === 'crop') return 1
    return 2
  })

  const originalValidation = computed(() => {
    if (!originalImage.value || !selectedRule.value) return undefined
    return validateCompliance(originalImage.value, selectedRule.value)
  })

  const needsCrop = computed(() => {
    const rule = selectedRule.value
    const image = originalImage.value
    return Boolean(
      rule?.cropEnabled &&
      rule.width &&
      rule.height &&
      rule.resizeMode === 'cover' &&
      image &&
      requiresComplianceCrop(image.width, image.height, rule.width, rule.height),
    )
  })

  const reasonText = (reason: unknown): string => {
    if (typeof reason === 'string') return reason
    if (reason && typeof reason === 'object') {
      const record = reason as { message?: unknown; reason?: unknown }
      if (typeof record.message === 'string') return record.message
      if (typeof record.reason === 'string') return record.reason
    }
    return ''
  }

  const selectRule = (rule: ImageComplianceRule) => {
    selectedRule.value = { ...rule }
    showCustomForm.value = false
  }

  const applyCustomRule = (rule: ImageComplianceRule) => {
    selectRule(rule)
    continueWithRule()
  }

  const continueWithRule = () => {
    if (!selectedRule.value) {
      uni.showToast({ title: '请先选择目标规格', icon: 'none' })
      return
    }
    recentRules.value = saveRecentComplianceRule(selectedRule.value)
    step.value = 'image'
  }

  const getFileSize = async (file: SelectedFile): Promise<number> => {
    if (file.size !== undefined) return file.size
    return new Promise((resolve, reject) => {
      uni.getFileInfo({ filePath: file.path, success: info => resolve(info.size), fail: reject })
    })
  }

  const getImageInfo = (src: string): Promise<{ path: string; width: number; height: number; type?: string }> =>
    new Promise((resolve, reject) => {
      uni.getImageInfo({
        src,
        success: info => resolve({ path: info.path, width: info.width, height: info.height, type: info.type }),
        fail: reject,
      })
    })

  const inferFormat = (file: SelectedFile, type?: string): string => {
    const extension = file.name.split('.').pop() || ''
    return normalizeImageFormat(type || file.type || extension)
  }

  type ImageSecurityStatus = 'pass' | 'blocked'

  const checkSelectedImageSecurity = async (filePath: string): Promise<ImageSecurityStatus> => {
    let status: ImageSecurityStatus = 'pass'
    // #ifndef MP-WEIXIN
    status = 'pass'
    // #endif

    // #ifdef MP-WEIXIN
    const security = await checkMediaSecurity(filePath, 'image_compliance')
    status = security.safe && security.suggestion === 'pass' ? 'pass' : 'blocked'
    // #endif
    return status
  }

  const selectImage = async () => {
    if (selecting.value) return
    selecting.value = true
    try {
      const [file] = await filePicker.pickImage({ count: 1, sizeType: ['original'] })
      if (!file) return
      const fileSize = await getFileSize(file)
      if (fileSize > MAX_SOURCE_SIZE) {
        uni.showToast({ title: '原图超过 10MB，暂时无法处理', icon: 'none', duration: 3000 })
        return
      }

      let securityStatus: ImageSecurityStatus
      try {
        securityStatus = await checkSelectedImageSecurity(file.path)
      } catch (error) {
        console.error('[image-compliance] security check failed', error)
        uni.showToast({ title: '内容安全检查暂不可用，请稍后重试', icon: 'none', duration: 3000 })
        return
      }
      if (securityStatus === 'blocked') {
        uni.showToast({ title: '图片未通过内容安全检查，请更换后重试', icon: 'none', duration: 3000 })
        return
      }

      const info = await getImageInfo(file.path)
      await clearResult()
      crop.value = undefined
      originalImage.value = {
        file: { ...file, path: info.path, size: fileSize },
        previewUrl: info.path,
        width: info.width,
        height: info.height,
        fileSize,
        mimeType: info.type ? `image/${normalizeImageFormat(info.type)}` : file.type || '',
        format: inferFormat(file, info.type),
      }
      step.value = 'image'
    } catch (error) {
      if (!isFilePickerCancel(error)) {
        console.error('[image-compliance] select image failed', error)
        uni.showToast({ title: '图片读取失败，请重新选择', icon: 'none' })
      }
    } finally {
      selecting.value = false
    }
  }

  const startProcessing = () => {
    if (!originalImage.value || !selectedRule.value) return
    if (originalValidation.value?.passed) {
      saveOriginal()
      return
    }
    if (needsCrop.value) {
      step.value = 'crop'
      return
    }
    void processImage()
  }

  const confirmCrop = (nextCrop: NormalizedCrop) => {
    crop.value = nextCrop
    void processImage()
  }

  const processImage = async () => {
    if (!originalImage.value || !selectedRule.value || processing.value) return
    processing.value = true
    step.value = 'processing'
    try {
      await clearResult()
      const response = await processImageCompliance(originalImage.value.file, selectedRule.value, crop.value)
      const adapted = await createComplianceImageResult(response.result)
      result.value = adapted
      try {
        const actualInfo = await readResultImageInfo(adapted.previewUrl)
        adapted.width = actualInfo.width
        adapted.height = actualInfo.height
        if (actualInfo.type) adapted.mimeType = `image/${normalizeImageFormat(actualInfo.type)}`
      } catch (error) {
        if (!adapted.width || !adapted.height) throw error
      }

      resultValidation.value = validateCompliance(
        {
          width: adapted.width || 0,
          height: adapted.height || 0,
          fileSize: adapted.fileSize,
          format: adapted.mimeType,
          mimeType: adapted.mimeType,
        },
        selectedRule.value,
        originalImage.value,
      )
      resultReason.value = reasonText(response.reason)
      step.value = 'result'
    } catch (error) {
      console.error('[image-compliance] process failed', error)
      await clearResult()
      step.value = needsCrop.value ? 'crop' : 'image'
      const message = (error as { message?: string })?.message || '处理失败，请稍后重试'
      uni.showToast({ title: message, icon: 'none', duration: 3000 })
    } finally {
      processing.value = false
    }
  }

  const savePath = (path: string, fileName: string) => {
    // #ifdef H5
    const link = document.createElement('a')
    link.href = path
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    uni.showToast({ title: '已开始下载', icon: 'success' })
    // #endif

    // #ifdef MP-WEIXIN
    uni.saveImageToPhotosAlbum({
      filePath: path,
      success: () => uni.showToast({ title: '已保存到相册', icon: 'success' }),
      fail: () => uni.showToast({ title: '保存失败，请检查相册权限', icon: 'none' }),
    })
    // #endif
  }

  const saveOriginal = () => {
    if (!originalImage.value || !selectedRule.value) return
    const extension = selectedRule.value.targetFormat === 'png' ? 'png' : 'jpg'
    savePath(originalImage.value.previewUrl, `compliant-image-${Date.now()}.${extension}`)
  }

  const saveResult = () => {
    if (!result.value || !selectedRule.value) return
    const extension = result.value.mimeType.includes('png') ? 'png' : 'jpg'
    savePath(result.value.previewUrl, `compliant-image-${Date.now()}.${extension}`)
  }

  const clearResult = async () => {
    const previous = result.value
    result.value = undefined
    resultValidation.value = undefined
    resultReason.value = ''
    await releaseComplianceImageResult(previous)
  }

  const processNext = async () => {
    await clearResult()
    originalImage.value = undefined
    crop.value = undefined
    step.value = 'image'
    void selectImage()
  }

  const adjustAgain = async () => {
    await clearResult()
    step.value = needsCrop.value ? 'crop' : 'image'
  }

  const changeRule = async () => {
    await clearResult()
    originalImage.value = undefined
    crop.value = undefined
    step.value = 'rule'
  }

  onBeforeUnmount(() => {
    void releaseComplianceImageResult(result.value)
  })
</script>

<template>
  <PageLayout title="图片达标助手" nav-divider>
    <view class="compliance-page">
      <view class="stepper" aria-label="处理进度">
        <view
          v-for="(label, index) in ['目标规格', '选择图片', '达标结果']"
          :key="label"
          class="step-item"
          :class="{ active: stepIndex >= index }">
          <view class="step-dot">
            <uni-icons v-if="stepIndex > index" type="checkmarkempty" size="14" color="#fff" />
            <text v-else>{{ index + 1 }}</text>
          </view>
          <text>{{ label }}</text>
        </view>
      </view>

      <view v-if="step === 'rule'" class="stage-content">
        <view class="stage-heading">
          <text class="stage-title">你需要什么样的图片？</text>
          <text class="stage-subtitle">选择目标要求，剩下的交给系统完成</text>
        </view>
        <ComplianceRuleForm v-if="showCustomForm" @cancel="showCustomForm = false" @submit="applyCustomRule" />
        <ComplianceRulePicker
          v-else
          :presets="presets"
          :recent-rules="recentRules"
          :selected-id="selectedRule?.id"
          @select="selectRule"
          @custom="showCustomForm = true" />

        <view v-if="selectedRule && !showCustomForm" class="selected-rule-bar">
          <view class="selected-rule-copy">
            <text class="selected-label">已选择</text>
            <text class="selected-name">{{ selectedRule.name }}</text>
          </view>
          <button class="continue-button" @click="continueWithRule">下一步</button>
        </view>
      </view>

      <view v-else-if="step === 'image'" class="stage-content">
        <view class="stage-heading inline">
          <view>
            <text class="stage-title">选择一张图片</text>
            <text class="stage-subtitle">单张原图不超过 10MB</text>
          </view>
          <button class="text-button" @click="changeRule">修改规格</button>
        </view>

        <view v-if="!originalImage" class="upload-area" @click="selectImage">
          <view class="upload-icon">
            <uni-icons type="image" size="40" color="var(--theme-brand)" />
          </view>
          <text class="upload-title">{{ selecting ? '正在读取图片...' : '选择图片' }}</text>
          <text class="upload-hint">JPG / PNG · 原图优先</text>
        </view>

        <template v-else-if="selectedRule && originalValidation">
          <OriginalImageInfo :image="originalImage" :rule="selectedRule" :validation="originalValidation" />
          <view class="image-actions">
            <button class="secondary-button" @click="selectImage">重新选择</button>
            <button class="primary-button" @click="startProcessing">
              {{ originalValidation.passed ? '保存原图' : needsCrop ? '调整裁剪并处理' : '一键处理' }}
            </button>
          </view>
        </template>
      </view>

      <view v-else-if="step === 'crop' && originalImage && selectedRule?.width && selectedRule?.height" class="stage-content">
        <ImageCropper
          :src="originalImage.previewUrl"
          :image-width="originalImage.width"
          :image-height="originalImage.height"
          :target-width="selectedRule.width"
          :target-height="selectedRule.height"
          @cancel="step = 'image'"
          @confirm="confirmCrop" />
      </view>

      <view v-else-if="step === 'processing'" class="processing-state">
        <view class="processing-spinner" />
        <text class="processing-title">正在按目标规格处理</text>
        <text class="processing-hint">正在调整尺寸、格式和文件大小</text>
      </view>

      <view v-else-if="step === 'result' && originalImage && result && resultValidation && selectedRule" class="stage-content">
        <ComplianceResult
          :original="originalImage"
          :result="result"
          :rule="selectedRule"
          :validation="resultValidation"
          :reason="resultReason"
          @save="saveResult"
          @next="processNext"
          @adjust="adjustAgain" />
      </view>
    </view>
  </PageLayout>
</template>

<style scoped lang="scss">
  .compliance-page {
    min-height: 100vh;
    box-sizing: border-box;
    padding: calc(var(--nav-height, 120rpx) + 28rpx) 28rpx 80rpx;
    background: var(--theme-bg);
  }

  .stepper {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    margin-bottom: 42rpx;
  }

  .step-item {
    position: relative;
    display: flex;
    min-width: 0;
    flex-direction: column;
    align-items: center;
    gap: 9rpx;
    color: var(--theme-text-tertiary);
    font-size: 22rpx;
  }

  .step-item::before,
  .step-item::after {
    position: absolute;
    top: 24rpx;
    width: calc(50% - 26rpx);
    height: 2rpx;
    background: var(--theme-border);
    content: '';
  }

  .step-item::before {
    left: 0;
  }

  .step-item::after {
    right: 0;
  }

  .step-item:first-child::before,
  .step-item:last-child::after {
    display: none;
  }

  .step-item.active {
    color: var(--theme-text);
  }

  .step-item.active::before,
  .step-item.active::after {
    background: #16845b;
  }

  .step-dot {
    position: relative;
    z-index: 1;
    display: flex;
    width: 48rpx;
    height: 48rpx;
    align-items: center;
    justify-content: center;
    border: 2rpx solid var(--theme-border);
    border-radius: 50%;
    background: var(--theme-surface);
    color: var(--theme-text-tertiary);
  }

  .step-item.active .step-dot {
    border-color: #16845b;
    background: #16845b;
    color: #fff;
  }

  .stage-content {
    display: flex;
    flex-direction: column;
    gap: 28rpx;
  }

  .stage-heading.inline,
  .selected-rule-bar,
  .image-actions {
    display: flex;
    align-items: center;
  }

  .stage-heading.inline {
    justify-content: space-between;
    gap: 18rpx;
  }

  .stage-title,
  .stage-subtitle {
    display: block;
  }

  .stage-title {
    color: var(--theme-text);
    font-size: 38rpx;
    font-weight: 700;
    line-height: 1.3;
  }

  .stage-subtitle {
    margin-top: 9rpx;
    color: var(--theme-text-tertiary);
    font-size: 24rpx;
  }

  .selected-rule-bar {
    position: sticky;
    bottom: 20rpx;
    z-index: 5;
    justify-content: space-between;
    gap: 18rpx;
    padding: 18rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 8rpx;
    background: var(--theme-elevated);
    box-shadow: 0 8rpx 30rpx var(--theme-shadow-sm);
  }

  .selected-rule-copy {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 3rpx;
  }

  .selected-label {
    color: var(--theme-text-tertiary);
    font-size: 20rpx;
  }

  .selected-name {
    overflow: hidden;
    color: var(--theme-text);
    font-size: 25rpx;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .continue-button,
  .primary-button,
  .secondary-button,
  .text-button {
    margin: 0;
  }

  .continue-button {
    width: 176rpx;
    height: 72rpx;
    flex: none;
    border-radius: 8rpx;
    background: var(--theme-brand);
    color: #fff;
    font-size: 26rpx;
    line-height: 72rpx;
  }

  .text-button {
    height: 64rpx;
    padding: 0 20rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 8rpx;
    background: var(--theme-surface);
    color: var(--theme-brand);
    font-size: 24rpx;
  }

  .upload-area {
    display: flex;
    min-height: 520rpx;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 13rpx;
    border: 2rpx dashed var(--theme-border);
    border-radius: 8rpx;
    background: var(--theme-surface);
  }

  .upload-icon {
    display: flex;
    width: 92rpx;
    height: 92rpx;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: var(--theme-surface-2);
  }

  .upload-title {
    color: var(--theme-text);
    font-size: 30rpx;
    font-weight: 650;
  }

  .upload-hint {
    color: var(--theme-text-tertiary);
    font-size: 23rpx;
  }

  .image-actions {
    gap: 16rpx;
  }

  .primary-button,
  .secondary-button {
    height: 88rpx;
    flex: 1;
    border-radius: 8rpx;
    font-size: 27rpx;
    font-weight: 600;
  }

  .primary-button {
    background: var(--theme-brand);
    color: #fff;
  }

  .secondary-button {
    border: 1rpx solid var(--theme-border);
    background: var(--theme-surface);
    color: var(--theme-text-secondary);
  }

  .continue-button::after,
  .primary-button::after,
  .secondary-button::after,
  .text-button::after {
    border: 0;
  }

  .processing-state {
    display: flex;
    min-height: 700rpx;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14rpx;
  }

  .processing-spinner {
    width: 72rpx;
    height: 72rpx;
    margin-bottom: 10rpx;
    border: 7rpx solid var(--theme-border);
    border-top-color: #16845b;
    border-radius: 50%;
    animation: compliance-spin 0.9s linear infinite;
  }

  .processing-title {
    color: var(--theme-text);
    font-size: 31rpx;
    font-weight: 650;
  }

  .processing-hint {
    color: var(--theme-text-tertiary);
    font-size: 23rpx;
  }

  @keyframes compliance-spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
