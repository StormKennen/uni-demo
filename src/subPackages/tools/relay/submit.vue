<script setup lang="ts">
  import { computed, reactive, ref } from 'vue'
  import { onLoad, onShareAppMessage } from '@dcloudio/uni-app'
  import PageLayout from '@/components/PageLayout.vue'
  import RelayDynamicForm from './components/RelayDynamicForm.vue'
  import { patchRelayIdParticipantsMe, patchRelaysEntries, postRelayIdParticipantsMe, postRelaysRelayIdEntries } from '@/services/apifox/NODEJSDEMO/RELAYS/apifox'
  import { getUserInfo, getToken } from '@/utils/storage'
  import { buildRelayDetailRoute, RELAY_DETAIL_ROUTE, RELAY_SHARE_IMAGE_URL, readRelayErrorMessage } from './constants'
  import { getFieldDefaultValue } from './constants'
  import { useRelayDetail } from './composables/useRelayDetail'
  import { useRelayEntries } from './composables/useRelayEntries'
  import { validateRelayEntryForm } from './composables/useRelayForm'
  import { normalizeParticipant } from './normalizers'
  import type { RelayEntryFormState, RelayImageValue, RelayFieldValue } from './types'

  const relayDetail = useRelayDetail()
  const relayEntries = useRelayEntries()
  const relayId = ref('')
  const shareCode = ref('')
  const isReady = ref(false)
  const isSubmitting = ref(false)
  const isUploading = ref(false)
  const currentEntryId = ref('')
  const validationErrors = ref<Record<string, string>>({})
  const form = reactive<RelayEntryFormState>({
    nickname: getUserInfo()?.name || '',
    values: {},
    images: {},
  })

  const detail = relayDetail.detail
  const isEditing = computed(() => Boolean(currentEntryId.value))
  const pageTitle = computed(() => (isEditing.value ? '修改我的接龙' : '参与接龙'))
  const canUploadImages = computed(() => Boolean(getToken()))

  const setInitialValues = () => {
    if (!detail.value) return
    const nextValues: Record<string, RelayFieldValue> = {}
    const nextImages: Record<string, RelayImageValue[]> = {}
    detail.value.relay.fields.forEach(field => {
      const defaultValue = getFieldDefaultValue(field)
      nextValues[field.key] = defaultValue
      if (field.type === 'image') nextImages[field.key] = []
    })
    form.values = nextValues
    form.images = nextImages
  }

  const applyCurrentEntry = () => {
    const entry = relayEntries.entries.value.find(item => item.isMine && item.status === 'active')
    if (!entry || !detail.value) return
    currentEntryId.value = entry.id
    form.values = { ...form.values, ...Object.entries(entry.values).reduce<Record<string, RelayFieldValue>>((result, [key, value]) => {
      if (typeof value === 'string' || typeof value === 'number' || value === null || Array.isArray(value)) result[key] = value as RelayFieldValue
      return result
    }, {}) }
    detail.value.relay.fields.filter(field => field.type === 'image').forEach(field => {
      const raw = entry.values[field.key]
      const images = Array.isArray(raw) ? raw.filter((item): item is string => typeof item === 'string').map(fileId => ({ fileId, url: fileId.startsWith('http') ? fileId : '', state: 'uploaded' as const })) : []
      form.images = { ...form.images, [field.key]: images }
    })
  }

  const load = async () => {
    const loaded = await relayDetail.load({ id: relayId.value, shareCode: shareCode.value })
    if (!loaded) return
    setInitialValues()
    if (loaded.currentParticipant) form.nickname = loaded.currentParticipant.nickname
    if (loaded.currentParticipant || loaded.permissions.canEditRelay) {
      await relayEntries.load(loaded.relay.id)
      applyCurrentEntry()
    }
    isReady.value = true
  }

  const updateNickname = async (): Promise<boolean> => {
    if (!detail.value || !form.nickname.trim()) return false
    const participant = normalizeParticipant(detail.value.currentParticipant)
    if (!participant) {
      const raw: unknown = await postRelayIdParticipantsMe(detail.value.relay.id, { nickname: form.nickname.trim() })
      const created = normalizeParticipant(raw)
      if (!created) throw new Error('参与者创建结果无效')
      detail.value = { ...detail.value, currentParticipant: created }
      return true
    }
    if (detail.value.permissions.canEditNickname && participant.nickname !== form.nickname.trim()) {
      const raw: unknown = await patchRelayIdParticipantsMe(detail.value.relay.id, { nickname: form.nickname.trim() })
      const updated = normalizeParticipant(raw)
      if (updated) detail.value = { ...detail.value, currentParticipant: updated }
    }
    return true
  }

  const submit = async () => {
    if (!detail.value || isSubmitting.value || isUploading.value) {
      if (isUploading.value) uni.showToast({ title: '图片正在上传，请稍候', icon: 'none' })
      return
    }
    validationErrors.value = validateRelayEntryForm(detail.value.relay.fields, form)
    if (Object.keys(validationErrors.value).length) {
      uni.showToast({ title: validationErrors.value.nickname || '请完善接龙内容', icon: 'none' })
      return
    }
    isSubmitting.value = true
    uni.showLoading({ title: isEditing.value ? '保存中…' : '提交中…', mask: true })
    try {
      await updateNickname()
      if (isEditing.value) {
        await patchRelaysEntries({ relayId: detail.value.relay.id, entryId: currentEntryId.value }, { values: form.values })
      } else {
        await postRelaysRelayIdEntries(detail.value.relay.id, {
          client_request_id: `relay-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`,
          values: form.values,
        })
      }
      uni.hideLoading()
      uni.showToast({ title: isEditing.value ? '修改成功' : '接龙成功', icon: 'success' })
      setTimeout(() => uni.redirectTo({ url: buildRelayDetailRoute({ id: detail.value?.relay.id || relayId.value }) }), 350)
    } catch (error: unknown) {
      uni.hideLoading()
      uni.showToast({ title: readRelayErrorMessage(error, '提交失败，请稍后重试'), icon: 'none' })
    } finally {
      isSubmitting.value = false
    }
  }

  const updateValues = (values: Record<string, RelayFieldValue>) => {
    form.values = values
  }

  const updateImages = (images: Record<string, RelayImageValue[]>) => {
    form.images = images
  }

  onLoad((options: Record<string, string | undefined>) => {
    relayId.value = options.id?.trim() || ''
    shareCode.value = options.shareCode?.trim() || ''
    if (!relayId.value) return
    void load()
  })

  // #ifdef MP-WEIXIN
  onShareAppMessage(() => ({
    title: detail.value ? `${detail.value.relay.title}，等你参加` : '参加接龙',
    path: buildRelayDetailRoute({ id: relayId.value, shareCode: shareCode.value || undefined }),
    imageUrl: RELAY_SHARE_IMAGE_URL,
  }))
  // #endif
</script>

<template>
  <PageLayout :title="pageTitle" :back-fallback="RELAY_DETAIL_ROUTE + '?id=' + relayId">
    <view class="submit-page">
      <view v-if="relayDetail.isLoading.value && !detail" class="state-panel"><text>正在准备接龙表单…</text></view>
      <view v-else-if="relayDetail.error.value && !detail" class="state-panel"><text>接龙不存在或分享链接已失效</text></view>
      <template v-else-if="detail && isReady">
        <view class="submit-heading">
          <text class="eyebrow">YOUR ENTRY</text>
          <text class="page-title">{{ pageTitle }}</text>
          <text class="relay-title">{{ detail.relay.title }}</text>
        </view>

        <view class="form-card">
          <view class="field-title-row"><text class="field-title">你的昵称</text><text class="required-mark">必填</text></view>
          <input v-model="form.nickname" class="nickname-input" :maxlength="100" placeholder="请输入昵称" />
          <text v-if="validationErrors.nickname" class="field-error">{{ validationErrors.nickname }}</text>
        </view>

        <view class="form-card">
          <RelayDynamicForm
            :fields="detail.relay.fields"
            :model-value="form.values"
            :images="form.images"
            :validation-errors="validationErrors"
            :disabled="isSubmitting"
            :can-upload-images="canUploadImages"
            @update:model-value="updateValues"
            @update:images="updateImages"
            @uploading-change="isUploading = $event" />
        </view>

        <button class="submit-button" :disabled="isSubmitting || isUploading" @click="submit">{{ isSubmitting ? '保存中…' : isEditing ? '保存修改' : '确认接龙' }}</button>
        <text class="form-hint">提交后会立即返回详情页，统计和序号以服务端结果为准。</text>
      </template>
    </view>
  </PageLayout>
</template>

<style scoped lang="scss">
  .submit-page {
    min-height: 100vh;
    padding: 28rpx 28rpx calc(90rpx + env(safe-area-inset-bottom));
    box-sizing: border-box;
    background: var(--theme-bg);
  }

  .submit-heading {
    padding: 10rpx 2rpx 26rpx;
  }

  .eyebrow {
    display: block;
    color: var(--theme-brand);
    font-size: 20rpx;
    font-weight: 800;
    letter-spacing: 4rpx;
  }

  .page-title {
    display: block;
    margin-top: 8rpx;
    color: var(--theme-text);
    font-size: 40rpx;
    font-weight: 800;
  }

  .relay-title,
  .form-hint,
  .state-panel {
    display: block;
    color: var(--theme-text-secondary);
    font-size: 23rpx;
  }

  .relay-title {
    margin-top: 10rpx;
  }

  .form-card {
    margin-bottom: 20rpx;
    padding: 24rpx 22rpx;
    border-radius: 20rpx;
    background: var(--theme-surface);
    box-shadow: 0 8rpx 28rpx var(--theme-shadow-xs);
  }

  .field-title-row {
    display: flex;
    align-items: center;
  }

  .field-title {
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

  .nickname-input {
    width: 100%;
    height: 84rpx;
    margin-top: 14rpx;
    padding: 0 20rpx;
    box-sizing: border-box;
    border: 1rpx solid var(--theme-border);
    border-radius: 16rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text);
    font-size: 27rpx;
  }

  .field-error {
    display: block;
    margin-top: 8rpx;
  }

  .submit-button {
    width: 100%;
    height: 88rpx;
    margin-top: 30rpx;
    border-radius: 20rpx;
    background: var(--theme-brand);
    color: var(--theme-bg);
    font-size: 29rpx;
    font-weight: 700;
    line-height: 88rpx;
  }

  .submit-button::after {
    display: none;
  }

  .form-hint {
    margin-top: 14rpx;
    color: var(--theme-text-tertiary);
    text-align: center;
  }

  .state-panel {
    padding: 130rpx 20rpx;
    color: var(--theme-text-tertiary);
    text-align: center;
  }
</style>
