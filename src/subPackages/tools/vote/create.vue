<script setup lang="ts">
  import { computed, reactive, ref } from 'vue'
  import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
  import type { VoteCreateInput, VoteIdentityVisibility, VoteParticipationVisibility, VoteResultVisibility, VoteType } from './types'
  import {
    IDENTITY_VISIBILITY_OPTIONS,
    PARTICIPATION_VISIBILITY_OPTIONS,
    RESULT_VISIBILITY_OPTIONS,
    buildVoteShareTitle,
    VOTE_CREATE_ROUTE,
    VOTE_DETAIL_ROUTE,
    VOTE_HOME_FALLBACK,
    VOTE_SHARE_IMAGE_URL,
    VOTE_TYPE_OPTIONS,
    readVoteErrorMessage,
  } from './constants'
  import { voteRepository, VoteRepositoryError } from './repositories'
  import PageLayout from '@/components/PageLayout.vue'

  interface DatePickerEvent {
    detail?: { value?: string }
    value?: string
  }

  const form = reactive<VoteCreateInput>({
    title: '',
    description: '',
    voteType: 'single',
    options: [{ text: '' }, { text: '' }],
    rules: {
      allowGuest: true,
      allowChangeVote: true,
      allowParticipantAddOption: false,
      maxChoices: undefined,
    },
    privacy: {
      identityVisibility: 'public',
      participationVisibility: 'participants',
      resultVisibility: 'realtime',
    },
    schedule: {
      startAt: null,
      endAt: null,
    },
  })

  const isSubmitting = ref(false)
  const showAdvanced = ref(false)
  const deadlineDate = ref('')
  const deadlineTime = ref('')

  const activeType = computed(() => VOTE_TYPE_OPTIONS.find(item => item.value === form.voteType) || VOTE_TYPE_OPTIONS[0])
  const deadlineDisplay = computed(() =>
    deadlineDate.value && deadlineTime.value ? `${deadlineDate.value} ${deadlineTime.value}` : '请选择日期和时间',
  )

  const setVoteType = (type: VoteType) => {
    form.voteType = type
    if (type === 'single') form.rules.maxChoices = undefined
    else form.rules.maxChoices = Math.min(form.options.length, form.rules.maxChoices || 2)
  }

  const addOption = () => {
    if (form.options.length >= 20) {
      uni.showToast({ title: '最多添加 20 个选项', icon: 'none' })
      return
    }
    form.options.push({ text: '' })
    if (form.voteType === 'multiple') form.rules.maxChoices = Math.min(form.options.length, form.rules.maxChoices || 2)
  }

  const removeOption = (index: number) => {
    if (form.options.length <= 2) {
      uni.showToast({ title: '至少保留两个选项', icon: 'none' })
      return
    }
    form.options.splice(index, 1)
    if (form.voteType === 'multiple' && form.rules.maxChoices) form.rules.maxChoices = Math.min(form.rules.maxChoices, form.options.length)
  }

  const readPickerValue = (event: DatePickerEvent): string => event.detail?.value || event.value || ''

  const syncDeadline = () => {
    const localDeadline = deadlineDate.value && deadlineTime.value ? new Date(`${deadlineDate.value}T${deadlineTime.value}:00`) : null
    form.schedule.endAt = localDeadline && !Number.isNaN(localDeadline.getTime()) ? localDeadline.toISOString() : null
  }

  const onDeadlineDateChange = (event: DatePickerEvent) => {
    deadlineDate.value = readPickerValue(event)
    syncDeadline()
  }

  const onDeadlineTimeChange = (event: DatePickerEvent) => {
    deadlineTime.value = readPickerValue(event)
    syncDeadline()
  }

  const clearDeadline = () => {
    deadlineDate.value = ''
    deadlineTime.value = ''
    syncDeadline()
  }

  const validate = (): string => {
    if (!form.title.trim()) return '请填写投票标题'
    if (form.title.trim().length > 120) return '标题不能超过 120 字'
    if (form.description.trim().length > 1000) return '说明不能超过 1000 字'
    const validOptions = form.options.map(option => option.text.trim()).filter(Boolean)
    if (validOptions.length < 2) return '至少填写两个有效选项'
    if (new Set(validOptions).size !== validOptions.length) return '选项不能重复'
    if (
      form.voteType === 'multiple' &&
      (!form.rules.maxChoices || form.rules.maxChoices < 1 || form.rules.maxChoices > validOptions.length)
    ) {
      return `最多选择数需在 1 到 ${validOptions.length} 之间`
    }
    if (!form.schedule.endAt) return '请选择截止时间'
    if (new Date(form.schedule.endAt).getTime() <= Date.now()) return '截止时间必须晚于当前时间'
    return ''
  }

  const createVote = async () => {
    const errorMessage = validate()
    if (errorMessage) {
      uni.showToast({ title: errorMessage, icon: 'none' })
      return
    }
    if (isSubmitting.value) return
    isSubmitting.value = true
    uni.showLoading({ title: '创建中…', mask: true })
    try {
      const created = await voteRepository.create({
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        options: form.options.map(option => ({ text: option.text.trim() })),
      })
      uni.hideLoading()
      uni.showToast({ title: '投票创建成功', icon: 'success' })
      setTimeout(() => uni.redirectTo({ url: `${VOTE_DETAIL_ROUTE}?id=${encodeURIComponent(created.vote.id)}` }), 350)
    } catch (error: unknown) {
      uni.hideLoading()
      if (error instanceof VoteRepositoryError && error.code === 'LOGIN_REQUIRED') {
        uni.navigateTo({ url: `/pages/mine/login/login?redirectUrl=${encodeURIComponent(VOTE_CREATE_ROUTE)}` })
        return
      }
      uni.showToast({ title: readVoteErrorMessage(error, '创建失败，请稍后重试'), icon: 'none' })
    } finally {
      isSubmitting.value = false
    }
  }

  const setIdentityVisibility = (value: VoteIdentityVisibility) => {
    form.privacy.identityVisibility = value
  }

  const setParticipationVisibility = (value: VoteParticipationVisibility) => {
    form.privacy.participationVisibility = value
  }

  const setResultVisibility = (value: VoteResultVisibility) => {
    form.privacy.resultVisibility = value
  }

  const shareTitle = computed(() => buildVoteShareTitle(form.title))

  // #ifdef MP-WEIXIN
  uni.showShareMenu({ withShareTicket: true })
  onShareAppMessage(() => ({ title: shareTitle.value, path: VOTE_CREATE_ROUTE, imageUrl: VOTE_SHARE_IMAGE_URL }))
  onShareTimeline(() => ({ title: shareTitle.value, query: '', imageUrl: VOTE_SHARE_IMAGE_URL }))
  // #endif
</script>

<template>
  <PageLayout title="创建投票" :back-fallback="VOTE_HOME_FALLBACK" nav-divider>
    <view class="create-page">
      <view class="page-heading">
        <text class="eyebrow">START A VOTE</text>
        <text class="page-title">创建投票</text>
        <text class="page-hint">把问题交给大家一起选择，结果和隐私规则都可以提前说明。</text>
      </view>

      <view class="form-card">
        <view class="form-item">
          <view class="label-row"><text class="form-label">标题</text><text class="required-mark">必填</text></view>
          <input v-model="form.title" class="text-control" :maxlength="120" placeholder="例如：周末晚餐吃什么？" :disabled="isSubmitting" />
        </view>
        <view class="form-item">
          <view class="label-row"
            ><text class="form-label">说明</text><text class="counter">{{ form.description.length }} / 1000</text></view
          >
          <textarea
            v-model="form.description"
            class="textarea-control"
            :maxlength="1000"
            placeholder="补充背景或投票规则（可选）"
            auto-height
            :disabled="isSubmitting" />
        </view>
      </view>

      <view class="section-heading"
        ><text class="section-title">投票方式</text><text class="section-hint">{{ activeType.description }}</text></view
      >
      <view class="choice-grid">
        <view
          v-for="item in VOTE_TYPE_OPTIONS"
          :key="item.value"
          class="choice-card"
          :class="{ selected: form.voteType === item.value }"
          @click="setVoteType(item.value)">
          <view class="choice-radio">{{ form.voteType === item.value ? '✓' : '' }}</view>
          <view
            ><text class="choice-label">{{ item.label }}</text
            ><text class="choice-description">{{ item.description }}</text></view
          >
        </view>
      </view>

      <view class="section-heading"
        ><text class="section-title">投票选项</text><text class="section-hint">至少两个，文字选项为主</text></view
      >
      <view class="form-card options-card">
        <view v-for="(option, index) in form.options" :key="index" class="option-row">
          <text class="option-index">{{ index + 1 }}</text>
          <input v-model="option.text" class="option-input" :maxlength="100" :placeholder="`选项 ${index + 1}`" :disabled="isSubmitting" />
          <button class="remove-button" :disabled="form.options.length <= 2 || isSubmitting" @click="removeOption(index)">删除</button>
        </view>
        <button class="add-option-button" :disabled="isSubmitting" @click="addOption">＋ 添加选项</button>
        <view v-if="form.voteType === 'multiple'" class="max-choice-row">
          <view><text class="setting-label">最多选择</text><text class="setting-hint">每人最多可以提交几项</text></view>
          <input v-model.number="form.rules.maxChoices" class="number-input" type="number" min="1" :max="form.options.length" />
          <text class="setting-suffix">项</text>
        </view>
      </view>

      <view class="section-heading deadline-heading">
        <view class="deadline-title-row"><text class="section-title">截止时间</text><text class="required-mark">必填</text></view>
        <text class="section-hint">投票结束后不能再提交</text>
      </view>

      <view class="form-card setting-card deadline-card">
        <view class="deadline-summary">
          <text class="deadline-value" :class="{ placeholder: !form.schedule.endAt }">{{ deadlineDisplay }}</text>
          <text class="setting-hint">投票必须设置结束时间</text>
        </view>
        <view class="picker-row">
          <picker mode="date" :value="deadlineDate" @change="onDeadlineDateChange"
            ><view class="picker-value">{{ deadlineDate || '选择日期' }}</view></picker
          >
          <picker mode="time" :value="deadlineTime" @change="onDeadlineTimeChange"
            ><view class="picker-value">{{ deadlineTime || '选择时间' }}</view></picker
          >
          <button v-if="form.schedule.endAt" class="clear-button" @click="clearDeadline">清除</button>
        </view>
      </view>

      <view class="advanced-header" @click="showAdvanced = !showAdvanced">
        <view><text class="section-title">更多设置</text><text class="section-hint">参与、隐私和结果展示（可选）</text></view>
        <text class="collapse-icon">{{ showAdvanced ? '收起' : '展开' }}</text>
      </view>

      <view v-if="showAdvanced" class="advanced-content">
        <view class="form-card setting-card">
          <view class="setting-row" @click="form.rules.allowGuest = !form.rules.allowGuest">
            <view><text class="setting-label">允许游客参与</text><text class="setting-hint">关闭后仍可浏览，提交时需要登录</text></view>
            <text class="toggle" :class="{ on: form.rules.allowGuest }">{{ form.rules.allowGuest ? '开' : '关' }}</text>
          </view>
          <view class="setting-row" @click="form.rules.allowChangeVote = !form.rules.allowChangeVote">
            <view><text class="setting-label">允许修改投票</text><text class="setting-hint">投票结束前可以重新选择</text></view>
            <text class="toggle" :class="{ on: form.rules.allowChangeVote }">{{ form.rules.allowChangeVote ? '开' : '关' }}</text>
          </view>
        </view>

        <view class="section-heading compact-heading"
          ><text class="section-title">投票身份</text><text class="section-hint">选择别人能看到什么</text></view
        >
        <view class="advanced-choice-list">
          <view
            v-for="item in IDENTITY_VISIBILITY_OPTIONS"
            :key="item.value"
            class="advanced-choice"
            :class="{ selected: form.privacy.identityVisibility === item.value }"
            @click="setIdentityVisibility(item.value)">
            <view class="choice-radio">{{ form.privacy.identityVisibility === item.value ? '✓' : '' }}</view>
            <view
              ><text class="choice-label">{{ item.label }}</text
              ><text class="choice-description">{{ item.description }}</text></view
            >
          </view>
        </view>

        <view class="section-heading compact-heading"
          ><text class="section-title">参与情况</text><text class="section-hint">控制成员列表的展示范围</text></view
        >
        <view class="advanced-choice-list">
          <view
            v-for="item in PARTICIPATION_VISIBILITY_OPTIONS"
            :key="item.value"
            class="advanced-choice"
            :class="{ selected: form.privacy.participationVisibility === item.value }"
            @click="setParticipationVisibility(item.value)">
            <view class="choice-radio">{{ form.privacy.participationVisibility === item.value ? '✓' : '' }}</view>
            <view
              ><text class="choice-label">{{ item.label }}</text
              ><text class="choice-description">{{ item.description }}</text></view
            >
          </view>
        </view>

        <view class="section-heading compact-heading"
          ><text class="section-title">结果展示</text><text class="section-hint">参与者何时能看到结果</text></view
        >
        <view class="advanced-choice-list">
          <view
            v-for="item in RESULT_VISIBILITY_OPTIONS"
            :key="item.value"
            class="advanced-choice"
            :class="{ selected: form.privacy.resultVisibility === item.value }"
            @click="setResultVisibility(item.value)">
            <view class="choice-radio">{{ form.privacy.resultVisibility === item.value ? '✓' : '' }}</view>
            <view
              ><text class="choice-label">{{ item.label }}</text
              ><text class="choice-description">{{ item.description }}</text></view
            >
          </view>
        </view>
      </view>

      <button class="primary-button" :disabled="isSubmitting" @click="createVote">{{ isSubmitting ? '创建中…' : '发布投票' }}</button>
    </view>
  </PageLayout>
</template>

<style scoped lang="scss">
  .create-page {
    min-height: 100vh;
    padding: 28rpx 28rpx calc(72rpx + env(safe-area-inset-bottom));
    box-sizing: border-box;
    background: var(--theme-bg);
    color: var(--theme-text);
  }

  .page-heading {
    padding: 8rpx 2rpx 26rpx;
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
    font-size: 42rpx;
    font-weight: 800;
  }

  .page-hint,
  .section-hint,
  .setting-hint,
  .choice-description {
    color: var(--theme-text-secondary);
    font-size: 22rpx;
    line-height: 1.5;
  }

  .page-hint {
    display: block;
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

  .label-row,
  .section-heading,
  .advanced-header,
  .setting-row,
  .max-choice-row,
  .picker-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .form-label,
  .setting-label,
  .choice-label {
    color: var(--theme-text);
    font-size: 27rpx;
    font-weight: 700;
  }

  .required-mark {
    color: var(--theme-danger);
    font-size: 20rpx;
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
    min-height: 140rpx;
    padding-top: 18rpx;
    padding-bottom: 18rpx;
    line-height: 1.5;
  }

  .section-heading {
    align-items: baseline;
    margin: 28rpx 2rpx 16rpx;
  }

  .section-title {
    color: var(--theme-text);
    font-size: 28rpx;
    font-weight: 700;
  }

  .section-hint {
    margin-left: 12rpx;
  }

  .choice-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14rpx;
  }

  .choice-card,
  .advanced-choice {
    display: flex;
    align-items: flex-start;
    border: 1rpx solid var(--theme-border);
    border-radius: 18rpx;
    background: var(--theme-surface);
  }

  .choice-card {
    min-height: 122rpx;
    padding: 18rpx;
  }

  .choice-card.selected,
  .advanced-choice.selected {
    border-color: var(--theme-brand);
    background: var(--theme-surface-2);
  }

  .choice-radio {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 34rpx;
    height: 34rpx;
    margin-right: 12rpx;
    border: 2rpx solid var(--theme-border);
    border-radius: 50%;
    color: var(--theme-brand);
    font-size: 22rpx;
    font-weight: 800;
  }

  .selected .choice-radio {
    border-color: var(--theme-brand);
  }

  .choice-label,
  .choice-description {
    display: block;
  }

  .choice-description {
    margin-top: 6rpx;
  }

  .options-card {
    padding-bottom: 18rpx;
  }

  .option-row {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }

  .option-row + .option-row {
    margin-top: 16rpx;
  }

  .option-index {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44rpx;
    height: 44rpx;
    border-radius: 50%;
    background: var(--theme-surface-2);
    color: var(--theme-text-secondary);
    font-size: 22rpx;
  }

  .option-input,
  .number-input {
    height: 70rpx;
    padding: 0 16rpx;
    box-sizing: border-box;
    border: 1rpx solid var(--theme-border);
    border-radius: 14rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text);
    font-size: 25rpx;
  }

  .option-input {
    flex: 1;
  }

  .remove-button,
  .clear-button {
    flex-shrink: 0;
    height: 58rpx;
    margin: 0;
    padding: 0 12rpx;
    border: 0;
    background: transparent;
    color: var(--theme-danger);
    font-size: 21rpx;
    line-height: 58rpx;
  }

  .remove-button::after,
  .clear-button::after,
  .add-option-button::after,
  .primary-button::after {
    display: none;
  }

  .add-option-button {
    width: 100%;
    height: 68rpx;
    margin: 20rpx 0 0;
    border: 1rpx dashed var(--theme-border);
    background: transparent;
    color: var(--theme-brand);
    font-size: 23rpx;
    line-height: 66rpx;
  }

  .max-choice-row {
    margin-top: 22rpx;
    padding-top: 22rpx;
    border-top: 1rpx solid var(--theme-border);
  }

  .setting-hint {
    display: block;
    margin-top: 6rpx;
  }

  .number-input {
    width: 100rpx;
    text-align: center;
  }

  .setting-suffix {
    margin-left: 8rpx;
    color: var(--theme-text-secondary);
    font-size: 24rpx;
  }

  .advanced-header {
    margin: 30rpx 2rpx 16rpx;
    padding: 20rpx 18rpx;
    border-radius: 18rpx;
    background: var(--theme-surface-2);
  }

  .collapse-icon {
    color: var(--theme-brand);
    font-size: 22rpx;
  }

  .advanced-content {
    padding-bottom: 4rpx;
  }

  .setting-card {
    padding-top: 8rpx;
    padding-bottom: 8rpx;
  }

  .deadline-heading {
    margin-top: 28rpx;
  }

  .deadline-title-row {
    display: flex;
    align-items: center;
    gap: 10rpx;
  }

  .deadline-summary {
    padding: 8rpx 0 20rpx;
  }

  .deadline-value {
    display: block;
    color: var(--theme-text);
    font-size: 30rpx;
    font-weight: 700;
  }

  .deadline-value.placeholder {
    color: var(--theme-text-tertiary);
    font-weight: 500;
  }

  .setting-row {
    min-height: 92rpx;
    gap: 20rpx;
  }

  .setting-row + .setting-row {
    border-top: 1rpx solid var(--theme-border);
  }

  .toggle {
    flex-shrink: 0;
    min-width: 62rpx;
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

  .compact-heading {
    margin-top: 22rpx;
  }

  .advanced-choice-list {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
  }

  .advanced-choice {
    padding: 18rpx;
  }

  .deadline-card {
    margin-bottom: 0;
  }

  .picker-row {
    justify-content: flex-start;
    gap: 12rpx;
    padding: 0 0 8rpx;
  }

  .picker-value {
    min-width: 190rpx;
    padding: 16rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 14rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text-secondary);
    font-size: 22rpx;
    text-align: center;
  }

  .primary-button {
    width: 100%;
    height: 82rpx;
    margin: 24rpx 0 34rpx;
    border-radius: 18rpx;
    background: var(--theme-brand);
    color: var(--theme-bg);
    font-size: 27rpx;
    line-height: 82rpx;
  }
</style>
