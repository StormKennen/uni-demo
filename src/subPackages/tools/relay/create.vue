<script setup lang="ts">
  import { computed, reactive, ref } from 'vue'
  import { onLoad, onShareAppMessage } from '@dcloudio/uni-app'
  import PageLayout from '@/components/PageLayout.vue'
  import { postRelays } from '@/services/apifox/NODEJSDEMO/RELAYS/apifox'
  import { getToken } from '@/utils/storage'
  import { buildRelayDetailRoute, RELAY_CREATE_ROUTE, RELAY_HOME_ROUTE, RELAY_SHARE_IMAGE_URL, readRelayErrorMessage } from './constants'
  import { getRelayPreset, RELAY_PRESETS } from './presets'
  import { buildRelayCreatePayload, createRelayFormState, validateRelayForm } from './composables/useRelayForm'
  import { normalizeRelay } from './normalizers'
  import { setRelayShareCode } from './share-code'
  import type { RelayFormState } from './types'

  interface PickerChangeEvent {
    detail?: { value?: string }
    value?: string
  }

  const form = reactive<RelayFormState>(createRelayFormState())
  const isSubmitting = ref(false)
  const isReady = ref(false)
  const deadlineDate = ref('')
  const deadlineTime = ref('')
  const activePreset = computed(() => getRelayPreset(form.preset))

  const syncDeadline = () => {
    form.deadline = deadlineDate.value && deadlineTime.value ? `${deadlineDate.value}T${deadlineTime.value}:00` : ''
  }

  const readPickerValue = (event: PickerChangeEvent): string => event.detail?.value || event.value || ''

  const onDateChange = (event: PickerChangeEvent) => {
    deadlineDate.value = readPickerValue(event)
    syncDeadline()
  }

  const onTimeChange = (event: PickerChangeEvent) => {
    deadlineTime.value = readPickerValue(event)
    syncDeadline()
  }

  const selectPreset = (preset: RelayFormState['preset']) => {
    form.preset = preset
    if (preset !== 'activity') form.enableStatistics = false
  }

  const toggle = (key: 'enableImages' | 'enableStatistics' | 'allowEditNickname' | 'allowEditEntry' | 'allowWithdraw') => {
    form[key] = !form[key]
  }

  const incrementDefaultNumber = (delta: number) => {
    form.defaultNumber = Math.min(20, Math.max(1, form.defaultNumber + delta))
  }

  const submit = async () => {
    const validationMessage = validateRelayForm(form)
    if (validationMessage) {
      uni.showToast({ title: validationMessage, icon: 'none' })
      return
    }
    if (isSubmitting.value) return
    isSubmitting.value = true
    uni.showLoading({ title: '创建中…', mask: true })
    try {
      const raw: unknown = await postRelays(buildRelayCreatePayload(form))
      const relay = normalizeRelay(raw)
      if (!relay.id) throw new Error('创建结果无效')
      if (relay.share.shareCode) setRelayShareCode(relay.id, relay.share.shareCode)
      uni.hideLoading()
      uni.showToast({ title: '接龙创建成功', icon: 'success' })
      setTimeout(() => uni.redirectTo({ url: buildRelayDetailRoute({ id: relay.id, shareCode: relay.share.shareCode || undefined }) }), 350)
    } catch (error: unknown) {
      uni.hideLoading()
      uni.showToast({ title: readRelayErrorMessage(error, '创建失败，请稍后重试'), icon: 'none' })
    } finally {
      isSubmitting.value = false
    }
  }

  onLoad(() => {
    if (!getToken()) {
      uni.redirectTo({ url: `/pages/mine/login/login?redirectUrl=${encodeURIComponent('/subPackages/tools/relay/create')}` })
      return
    }
    isReady.value = true
  })

  // #ifdef MP-WEIXIN
  onShareAppMessage(() => ({ title: '创建一个通用接龙', path: RELAY_CREATE_ROUTE, imageUrl: RELAY_SHARE_IMAGE_URL }))
  // #endif
</script>

<template>
  <PageLayout title="创建接龙" :back-fallback="RELAY_HOME_ROUTE">
    <view v-if="isReady" class="create-page">
      <view class="intro-block">
        <text class="eyebrow">START A RELAY</text>
        <text class="page-title">创建接龙</text>
        <text class="page-hint">先选一个最接近的方式，之后也能继续查看和管理。</text>
      </view>

      <view class="form-card">
        <view class="form-item">
          <text class="form-label">标题</text>
          <input v-model="form.title" class="text-control" :maxlength="200" placeholder="例如：周末烧烤接龙" />
        </view>
        <view class="form-item">
          <view class="label-with-counter">
            <text class="form-label">说明</text>
            <text class="counter">{{ form.description.length }} / 5000</text>
          </view>
          <textarea v-model="form.description" class="textarea-control" :maxlength="5000" placeholder="补充时间、地点或参与规则（可选）" auto-height />
        </view>
      </view>

      <view class="section-heading">
        <text class="section-title">接龙内容</text>
        <text class="section-hint">昵称会单独保存，不会占用动态字段</text>
      </view>
      <view class="preset-list">
        <view v-for="preset in RELAY_PRESETS" :key="preset.key" class="preset-card" :class="{ selected: form.preset === preset.key }" @click="selectPreset(preset.key)">
          <view class="preset-radio">{{ form.preset === preset.key ? '✓' : '' }}</view>
          <view class="preset-copy">
            <text class="preset-label">{{ preset.label }}</text>
            <text class="preset-description">{{ preset.description }}</text>
          </view>
        </view>
      </view>

      <view class="form-card setting-card">
        <view class="setting-row" @click="toggle('enableImages')">
          <view><text class="setting-label">允许图片</text><text class="setting-hint">参与者可以上传图片</text></view>
          <text class="toggle" :class="{ on: form.enableImages }">{{ form.enableImages ? '开' : '关' }}</text>
        </view>
        <view class="setting-row" @click="toggle('enableStatistics')">
          <view><text class="setting-label">数量统计</text><text class="setting-hint">活动报名会统计 number 字段合计</text></view>
          <text class="toggle" :class="{ on: form.enableStatistics, disabled: form.preset !== 'activity' }">{{ form.enableStatistics && form.preset === 'activity' ? '开' : '关' }}</text>
        </view>
        <view v-if="form.preset === 'activity'" class="setting-row">
          <view><text class="setting-label">默认报名人数</text><text class="setting-hint">参与时可继续调整</text></view>
          <view class="number-stepper"><button @click.stop="incrementDefaultNumber(-1)">−</button><text>{{ form.defaultNumber }}</text><button @click.stop="incrementDefaultNumber(1)">＋</button></view>
        </view>
        <view class="setting-row">
          <view><text class="setting-label">截止时间</text><text class="setting-hint">{{ form.deadline ? '到期后由后端禁止提交' : '不限制' }}</text></view>
          <view class="picker-group">
            <picker mode="date" :value="deadlineDate" @change="onDateChange"><view class="picker-value">{{ deadlineDate || '选择日期' }}</view></picker>
            <picker mode="time" :value="deadlineTime" @change="onTimeChange"><view class="picker-value">{{ deadlineTime || '时间' }}</view></picker>
          </view>
        </view>
        <view v-if="form.deadline" class="clear-deadline" @click="deadlineDate = ''; deadlineTime = ''; syncDeadline()">清除截止时间</view>
      </view>

      <view class="form-card setting-card">
        <view class="setting-row" @click="toggle('allowEditNickname')"><text class="setting-label">允许修改昵称</text><text class="toggle" :class="{ on: form.allowEditNickname }">{{ form.allowEditNickname ? '开' : '关' }}</text></view>
        <view class="setting-row" @click="toggle('allowEditEntry')"><text class="setting-label">允许修改自己的接龙</text><text class="toggle" :class="{ on: form.allowEditEntry }">{{ form.allowEditEntry ? '开' : '关' }}</text></view>
        <view class="setting-row" @click="toggle('allowWithdraw')"><text class="setting-label">允许撤回自己的接龙</text><text class="toggle" :class="{ on: form.allowWithdraw }">{{ form.allowWithdraw ? '开' : '关' }}</text></view>
      </view>

      <button class="submit-button" :disabled="isSubmitting" @click="submit">{{ isSubmitting ? '创建中…' : '创建接龙' }}</button>
      <text class="schema-hint">{{ activePreset.label }}将转换为通用动态字段，创建后无需接触字段配置。</text>
    </view>
  </PageLayout>
</template>

<style scoped lang="scss">
  .create-page {
    min-height: 100vh;
    padding: 28rpx 28rpx calc(80rpx + env(safe-area-inset-bottom));
    box-sizing: border-box;
    background: var(--theme-bg);
  }

  .intro-block {
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

  .page-hint,
  .section-hint,
  .setting-hint,
  .schema-hint {
    display: block;
    color: var(--theme-text-secondary);
    font-size: 22rpx;
    line-height: 1.5;
  }

  .page-hint {
    margin-top: 10rpx;
  }

  .form-card {
    margin-bottom: 22rpx;
    padding: 24rpx 22rpx;
    border-radius: 20rpx;
    background: var(--theme-surface);
    box-shadow: 0 8rpx 28rpx var(--theme-shadow-xs);
  }

  .form-item + .form-item {
    margin-top: 28rpx;
  }

  .form-label,
  .setting-label {
    color: var(--theme-text);
    font-size: 27rpx;
    font-weight: 700;
  }

  .label-with-counter {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .counter {
    color: var(--theme-text-tertiary);
    font-size: 20rpx;
  }

  .text-control,
  .textarea-control {
    width: 100%;
    margin-top: 14rpx;
    padding: 0 20rpx;
    box-sizing: border-box;
    border: 1rpx solid var(--theme-border);
    border-radius: 16rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text);
    font-size: 26rpx;
  }

  .text-control {
    height: 82rpx;
  }

  .textarea-control {
    min-height: 160rpx;
    padding-top: 18rpx;
    padding-bottom: 18rpx;
    line-height: 1.5;
  }

  .section-heading {
    margin: 28rpx 2rpx 16rpx;
  }

  .section-title {
    color: var(--theme-text);
    font-size: 28rpx;
    font-weight: 700;
  }

  .section-hint {
    display: inline;
    margin-left: 12rpx;
    color: var(--theme-text-tertiary);
  }

  .preset-card {
    display: flex;
    align-items: center;
    margin-bottom: 14rpx;
    padding: 20rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 18rpx;
    background: var(--theme-surface);
  }

  .preset-card.selected {
    border-color: var(--theme-brand);
  }

  .preset-radio {
    width: 40rpx;
    height: 40rpx;
    margin-right: 16rpx;
    border: 2rpx solid var(--theme-brand);
    border-radius: 50%;
    color: var(--theme-brand);
    font-size: 26rpx;
    line-height: 36rpx;
    text-align: center;
  }

  .preset-copy {
    flex: 1;
  }

  .preset-label,
  .preset-description {
    display: block;
  }

  .preset-label {
    color: var(--theme-text);
    font-size: 27rpx;
    font-weight: 700;
  }

  .preset-description {
    margin-top: 6rpx;
    color: var(--theme-text-secondary);
    font-size: 22rpx;
  }

  .setting-card {
    padding-top: 8rpx;
    padding-bottom: 8rpx;
  }

  .setting-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 90rpx;
    border-bottom: 1rpx solid var(--theme-border);
  }

  .setting-row:last-child {
    border-bottom: 0;
  }

  .setting-hint {
    margin-top: 4rpx;
  }

  .toggle {
    min-width: 58rpx;
    padding: 8rpx 12rpx;
    border-radius: 999rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text-tertiary);
    font-size: 21rpx;
    text-align: center;
  }

  .toggle.on {
    background: var(--theme-brand);
    color: var(--theme-bg);
  }

  .toggle.disabled {
    opacity: 0.5;
  }

  .number-stepper,
  .picker-group {
    display: flex;
    align-items: center;
    gap: 10rpx;
  }

  .number-stepper button {
    width: 54rpx;
    height: 54rpx;
    padding: 0;
    border: 1rpx solid var(--theme-border);
    border-radius: 12rpx;
    background: var(--theme-surface-2);
    color: var(--theme-brand);
    font-size: 27rpx;
    line-height: 52rpx;
  }

  .number-stepper button::after {
    display: none;
  }

  .number-stepper text {
    min-width: 34rpx;
    color: var(--theme-text);
    text-align: center;
  }

  .picker-value {
    padding: 10rpx 12rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 12rpx;
    color: var(--theme-brand);
    font-size: 21rpx;
  }

  .clear-deadline {
    padding: 14rpx 0 8rpx;
    color: var(--theme-brand);
    font-size: 22rpx;
    text-align: right;
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

  .schema-hint {
    margin-top: 14rpx;
    color: var(--theme-text-tertiary);
    text-align: center;
  }
</style>
