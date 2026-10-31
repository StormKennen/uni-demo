<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { onLoad, onPullDownRefresh, onShareAppMessage, onShareTimeline, onShow } from '@dcloudio/uni-app'
  import PageLayout from '@/components/PageLayout.vue'
  import VoteParticipationPanel from './components/VoteParticipationPanel.vue'
  import VoteResultPanel from './components/VoteResultPanel.vue'
  import VoteRulesSummary from './components/VoteRulesSummary.vue'
  import {
    buildVoteDetailRoute,
    buildVoteLoginRedirect,
    buildVoteShareTitle,
    formatVoteDate,
    getVoteResultWaitingText,
    VOTE_CREATE_ROUTE,
    VOTE_HOME_FALLBACK,
    VOTE_SHARE_IMAGE_URL,
    VOTE_STATUS_LABELS,
    readVoteErrorMessage,
  } from './constants'
  import { voteRepository, VoteRepositoryError } from './repositories'
  import type { VoteDetail } from './types'

  type VotePageState =
    | 'loading'
    | 'ready-not-voted'
    | 'ready-selecting'
    | 'submitting'
    | 'voted'
    | 'editing'
    | 'closed'
    | 'waiting-reveal'
    | 'revealed'
    | 'error'

  const voteId = ref('')
  const detail = ref<VoteDetail | null>(null)
  const pendingOptionIds = ref<string[]>([])
  const selectedOptionIds = ref<string[]>([])
  const error = ref<unknown>(null)
  const isLoading = ref(false)
  const isSubmitting = ref(false)
  const isEditing = ref(false)
  const isActioning = ref(false)
  const hasLoaded = ref(false)
  const editTitle = ref('')
  const editDescription = ref('')

  const isSelectionDirty = computed(() => {
    const saved = detail.value?.myBallot?.optionIds || []
    return saved.length !== selectedOptionIds.value.length || saved.some(optionId => !selectedOptionIds.value.includes(optionId))
  })

  const pageState = computed<VotePageState>(() => {
    if (isLoading.value && !detail.value) return 'loading'
    if (error.value && !detail.value) return 'error'
    if (!detail.value) return 'error'
    if (isSubmitting.value) return 'submitting'
    if (isEditing.value) return 'editing'
    if (detail.value.vote.status === 'revealed') return 'revealed'
    if (detail.value.vote.status === 'closed') return detail.value.viewer.canViewResults ? 'closed' : 'waiting-reveal'
    if (detail.value.viewer.hasVoted && !isSelectionDirty.value) return 'voted'
    if (selectedOptionIds.value.length) return 'ready-selecting'
    return 'ready-not-voted'
  })

  const pageStateLabel = computed(() => {
    const labels: Record<VotePageState, string> = {
      loading: '正在读取投票',
      'ready-not-voted': '等待选择',
      'ready-selecting': '已选择，等待提交',
      submitting: '正在提交',
      voted: '已完成投票',
      editing: '正在编辑',
      closed: '投票已结束',
      'waiting-reveal': '等待公布结果',
      revealed: '结果已公布',
      error: '加载失败',
    }
    return labels[pageState.value]
  })

  const showSubmitAction = computed(() => {
    const current = detail.value
    if (!current || current.vote.status !== 'active') return false
    return !current.viewer.hasVoted || current.viewer.canChangeVote || current.viewer.blockReason === 'login_required'
  })

  const submitActionLabel = computed(() => {
    if (detail.value?.viewer.blockReason === 'login_required') return '登录后提交'
    if (detail.value?.viewer.hasVoted) return '修改选择'
    return '提交投票'
  })

  const load = async () => {
    if (!voteId.value) {
      error.value = new Error('缺少投票 id')
      return
    }
    isLoading.value = true
    error.value = null
    try {
      const loaded = await voteRepository.getDetail(voteId.value)
      detail.value = loaded
      selectedOptionIds.value = loaded.myBallot?.optionIds?.slice() || pendingOptionIds.value.slice()
      editTitle.value = loaded.vote.title
      editDescription.value = loaded.vote.description || ''
      hasLoaded.value = true
    } catch (loadError: unknown) {
      error.value = loadError
    } finally {
      isLoading.value = false
    }
  }

  const retry = (): void => {
    void load()
  }

  const isSelected = (optionId: string): boolean => selectedOptionIds.value.includes(optionId)

  const canSelectOptions = computed(() => {
    const current = detail.value
    if (!current || current.vote.status !== 'active') return false
    return !current.viewer.hasVoted || current.viewer.canChangeVote || current.viewer.blockReason === 'login_required'
  })

  const toggleOption = (optionId: string) => {
    if (!canSelectOptions.value || !detail.value) return
    if (detail.value.vote.voteType === 'single') {
      selectedOptionIds.value = [optionId]
      return
    }
    if (isSelected(optionId)) {
      selectedOptionIds.value = selectedOptionIds.value.filter(item => item !== optionId)
      return
    }
    const maxChoices = detail.value.vote.rules.maxChoices || detail.value.vote.options.length
    if (selectedOptionIds.value.length >= maxChoices) {
      uni.showToast({ title: `最多选择 ${maxChoices} 项`, icon: 'none' })
      return
    }
    selectedOptionIds.value = [...selectedOptionIds.value, optionId]
  }

  const submitVote = async () => {
    if (!detail.value || isSubmitting.value) return
    if (!selectedOptionIds.value.length) {
      uni.showToast({ title: '请先选择投票选项', icon: 'none' })
      return
    }
    isSubmitting.value = true
    try {
      const submit = detail.value.viewer.hasVoted ? voteRepository.updateBallot : voteRepository.submitBallot
      detail.value = await submit(detail.value.vote.id, selectedOptionIds.value)
      selectedOptionIds.value = detail.value.myBallot?.optionIds.slice() || []
      pendingOptionIds.value = []
      uni.showToast({ title: detail.value.viewer.hasVoted ? '投票已保存' : '投票成功', icon: 'success' })
    } catch (submitError: unknown) {
      if (submitError instanceof VoteRepositoryError && submitError.code === 'LOGIN_REQUIRED') {
        uni.navigateTo({ url: buildVoteLoginRedirect(voteId.value, selectedOptionIds.value) })
      } else {
        uni.showToast({ title: readVoteErrorMessage(submitError), icon: 'none' })
        if (submitError instanceof VoteRepositoryError && submitError.code === 'VOTE_CLOSED') void load()
      }
    } finally {
      isSubmitting.value = false
    }
  }

  const startEditing = () => {
    if (!detail.value?.viewer.canEdit) return
    editTitle.value = detail.value.vote.title
    editDescription.value = detail.value.vote.description || ''
    isEditing.value = true
  }

  const cancelEditing = () => {
    isEditing.value = false
    if (detail.value) {
      editTitle.value = detail.value.vote.title
      editDescription.value = detail.value.vote.description || ''
    }
  }

  const saveEditing = async () => {
    if (!detail.value || isActioning.value) return
    if (!editTitle.value.trim()) {
      uni.showToast({ title: '标题不能为空', icon: 'none' })
      return
    }
    isActioning.value = true
    try {
      detail.value = await voteRepository.updateBasicInfo(detail.value.vote.id, {
        title: editTitle.value,
        description: editDescription.value,
      })
      isEditing.value = false
      uni.showToast({ title: '已保存', icon: 'success' })
    } catch (saveError: unknown) {
      uni.showToast({ title: readVoteErrorMessage(saveError, '保存失败，请重试'), icon: 'none' })
    } finally {
      isActioning.value = false
    }
  }

  const closeVote = () => {
    if (!detail.value?.viewer.canClose || isActioning.value) return
    uni.showModal({
      title: '结束投票',
      content: '结束后参与者将无法继续投票，是否确认？',
      success: result => {
        if (!result.confirm || !detail.value) return
        isActioning.value = true
        void voteRepository
          .close(detail.value.vote.id)
          .then(
            updated => {
              detail.value = updated
              uni.showToast({ title: '投票已结束', icon: 'success' })
            },
            closeError => uni.showToast({ title: readVoteErrorMessage(closeError, '结束失败，请重试'), icon: 'none' }),
          )
          .finally(() => {
            isActioning.value = false
          })
      },
    })
  }

  const revealVote = () => {
    if (!detail.value?.viewer.canReveal || isActioning.value) return
    uni.showModal({
      title: '公布结果',
      content: '公布后参与者将可以查看最终结果，是否确认？',
      success: result => {
        if (!result.confirm || !detail.value) return
        isActioning.value = true
        void voteRepository
          .reveal(detail.value.vote.id)
          .then(
            updated => {
              detail.value = updated
              uni.showToast({ title: '结果已公布', icon: 'success' })
            },
            revealError => uni.showToast({ title: readVoteErrorMessage(revealError, '公布失败，请重试'), icon: 'none' }),
          )
          .finally(() => {
            isActioning.value = false
          })
      },
    })
  }

  const copySharePath = () => {
    if (!detail.value) return
    const path = buildVoteDetailRoute(detail.value.vote.id)
    uni.setClipboardData({ data: path, success: () => uni.showToast({ title: '分享路径已复制', icon: 'none' }) })
  }

  const openCreate = () => uni.navigateTo({ url: VOTE_CREATE_ROUTE })

  const refresh = async () => {
    await load()
  }

  const shareTitle = computed(() => buildVoteShareTitle(detail.value?.vote.title, detail.value?.vote.status || 'active'))
  const sharePath = computed(() => (detail.value ? buildVoteDetailRoute(detail.value.vote.id) : VOTE_HOME_FALLBACK))
  const statusLabel = computed(() => (detail.value ? VOTE_STATUS_LABELS[detail.value.vote.status] : ''))
  const deadlineLabel = computed(() => (detail.value ? formatVoteDate(detail.value.vote.schedule.endAt) : ''))

  // #ifdef MP-WEIXIN
  uni.showShareMenu({ withShareTicket: true })
  onShareAppMessage(() => ({ title: shareTitle.value, path: sharePath.value, imageUrl: VOTE_SHARE_IMAGE_URL }))
  onShareTimeline(() => ({ title: shareTitle.value, query: sharePath.value.split('?')[1] || '', imageUrl: VOTE_SHARE_IMAGE_URL }))
  // #endif

  onLoad((options: Record<string, string | undefined>) => {
    voteId.value = options.id?.trim() || ''
    pendingOptionIds.value = options.pendingOptionIds?.split(',').filter(Boolean) || []
    void load()
  })

  onShow(() => {
    if (hasLoaded.value && !isSubmitting.value && !isActioning.value) void load()
  })

  onPullDownRefresh(async () => {
    try {
      await refresh()
    } finally {
      uni.stopPullDownRefresh()
    }
  })
</script>

<template>
  <PageLayout title="投票详情" :back-fallback="VOTE_HOME_FALLBACK" nav-divider>
    <view class="detail-page">
      <view v-if="pageState === 'loading'" class="state-panel"
        ><text class="state-title">正在读取投票</text><text class="state-hint">请稍候…</text></view
      >
      <view v-else-if="pageState === 'error'" class="state-panel">
        <text class="state-title">投票不存在或加载失败</text>
        <text class="state-hint">{{ readVoteErrorMessage(error, '请检查分享路径后重试') }}</text>
        <button class="secondary-button state-button" @click="retry">重新加载</button>
        <button class="secondary-button state-button" @click="openCreate">创建投票</button>
      </view>
      <template v-else-if="detail">
        <view class="detail-header">
          <view class="header-topline"
            ><text class="eyebrow">VOTE DETAIL</text><text class="page-state">{{ pageStateLabel }}</text></view
          >
          <text class="detail-title">{{ detail.vote.title }}</text>
          <text v-if="detail.vote.description" class="detail-description">{{ detail.vote.description }}</text>
          <view class="creator-line"
            ><text>发起人 · {{ detail.viewer.isCreator ? '我' : '投票发起人' }}</text
            ><text class="status-chip" :class="`status-${detail.vote.status}`">{{ statusLabel }}</text></view
          >
        </view>

        <VoteRulesSummary :vote="detail.vote" />

        <view v-if="detail.viewer.type === 'guest' || detail.viewer.blockReason === 'login_required'" class="guest-hint">
          <text class="guest-hint-title">{{ detail.viewer.type === 'guest' ? '当前以游客身份浏览' : '当前未登录浏览' }}</text>
          <text class="guest-hint-copy">{{
            detail.viewer.type === 'guest' && detail.vote.rules.allowGuest ? '可以直接参与这次投票。' : '可以浏览和选择，提交时需要登录。'
          }}</text>
        </view>

        <view v-if="detail.vote.status === 'active'" class="options-card">
          <view class="section-heading"
            ><text class="section-title">{{ detail.vote.voteType === 'multiple' ? '请选择，可多选' : '请选择一项' }}</text
            ><text v-if="detail.vote.voteType === 'multiple'" class="section-hint"
              >最多 {{ detail.vote.rules.maxChoices || detail.vote.options.length }} 项</text
            ></view
          >
          <view
            v-for="option in detail.vote.options"
            :key="option.id"
            class="option-card"
            :class="{ selected: isSelected(option.id), disabled: !canSelectOptions }"
            @click="toggleOption(option.id)">
            <view class="option-marker">{{ isSelected(option.id) ? '✓' : '' }}</view>
            <text class="option-text">{{ option.text }}</text>
          </view>
          <text v-if="detail.viewer.blockReason === 'login_required'" class="selection-hint"
            >可以先选择，点击提交后将跳转登录并保留选择。</text
          >
          <text v-else-if="detail.viewer.hasVoted && !detail.viewer.canChangeVote" class="selection-hint"
            >你已经投过票，发起人未开放修改。</text
          >
        </view>

        <view v-if="detail.viewer.canViewResults" class="result-section"
          ><VoteResultPanel :options="detail.vote.options" :result="detail.result"
        /></view>
        <view v-else class="waiting-card"
          ><text class="waiting-title">结果暂未展示</text
          ><text class="waiting-copy">{{ getVoteResultWaitingText(detail.vote) }}</text></view
        >

        <VoteParticipationPanel
          :participation="detail.participation"
          :can-view-count="detail.viewer.canViewParticipationCount"
          :can-view-participants="detail.viewer.canViewParticipants" />

        <view v-if="detail.viewer.isCreator" class="creator-card">
          <view class="section-heading"><text class="section-title">管理投票</text><text class="section-hint">创建者操作</text></view>
          <template v-if="isEditing">
            <input v-model="editTitle" class="edit-input" :maxlength="120" placeholder="投票标题" :disabled="isActioning" />
            <textarea
              v-model="editDescription"
              class="edit-textarea"
              :maxlength="1000"
              placeholder="投票说明"
              auto-height
              :disabled="isActioning" />
            <view class="edit-actions"
              ><button class="secondary-button" :disabled="isActioning" @click="cancelEditing">取消</button
              ><button class="primary-small-button" :disabled="isActioning" @click="saveEditing">{{
                isActioning ? '保存中…' : '保存编辑'
              }}</button></view
            >
          </template>
          <template v-else>
            <view class="management-actions">
              <button v-if="detail.viewer.canEdit" class="secondary-button" @click="startEditing">编辑说明</button>
              <button v-if="detail.viewer.canClose" class="danger-outline-button" :disabled="isActioning" @click="closeVote"
                >结束投票</button
              >
              <button v-if="detail.viewer.canReveal" class="primary-small-button" :disabled="isActioning" @click="revealVote"
                >公布结果</button
              >
            </view>
            <text v-if="detail.vote.privacy.identityVisibility === 'anonymous'" class="anonymous-note"
              >完全匿名模式不会出现“谁选择了什么”的管理入口。</text
            >
          </template>
        </view>

        <view v-if="showSubmitAction" class="bottom-actions">
          <button class="primary-button" :disabled="isSubmitting || !selectedOptionIds.length" @click="submitVote">{{
            isSubmitting ? '提交中…' : submitActionLabel
          }}</button>
          <text v-if="!selectedOptionIds.length" class="bottom-hint">请选择至少一项后提交</text>
        </view>
        <view class="share-action"><button class="secondary-button" @click="copySharePath">复制分享路径</button></view>
      </template>
    </view>
  </PageLayout>
</template>

<style scoped lang="scss">
  .detail-page {
    min-height: 100vh;
    padding: 28rpx 28rpx calc(48rpx + env(safe-area-inset-bottom));
    box-sizing: border-box;
    background: var(--theme-bg);
    color: var(--theme-text);
  }

  .detail-header {
    padding: 8rpx 2rpx 24rpx;
  }

  .header-topline,
  .creator-line,
  .section-heading,
  .edit-actions,
  .management-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .eyebrow {
    color: var(--theme-brand);
    font-size: 20rpx;
    font-weight: 800;
    letter-spacing: 4rpx;
  }

  .page-state {
    color: var(--theme-text-tertiary);
    font-size: 21rpx;
  }

  .detail-title {
    display: block;
    margin-top: 12rpx;
    color: var(--theme-text);
    font-size: 42rpx;
    font-weight: 800;
    line-height: 1.25;
    word-break: break-all;
  }

  .detail-description,
  .creator-line {
    display: block;
    margin-top: 12rpx;
    color: var(--theme-text-secondary);
    font-size: 23rpx;
    line-height: 1.6;
  }

  .creator-line {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .status-chip {
    padding: 7rpx 14rpx;
    border-radius: 999rpx;
    font-size: 20rpx;
  }

  .status-active {
    background: var(--theme-surface-2);
    color: var(--theme-brand);
  }

  .status-closed,
  .status-revealed {
    background: var(--theme-surface-2);
    color: var(--theme-text-secondary);
  }

  .guest-hint,
  .waiting-card,
  .creator-card,
  .options-card {
    margin-bottom: 20rpx;
    padding: 22rpx;
    border-radius: 20rpx;
    background: var(--theme-surface);
    box-shadow: 0 8rpx 28rpx var(--theme-shadow-xs);
  }

  .guest-hint {
    border-left: 6rpx solid var(--theme-brand);
  }

  .guest-hint-title,
  .waiting-title {
    display: block;
    color: var(--theme-text);
    font-size: 26rpx;
    font-weight: 700;
  }

  .guest-hint-copy,
  .waiting-copy,
  .selection-hint,
  .bottom-hint,
  .anonymous-note {
    display: block;
    margin-top: 8rpx;
    color: var(--theme-text-secondary);
    font-size: 22rpx;
    line-height: 1.5;
  }

  .section-heading {
    align-items: baseline;
    margin-bottom: 16rpx;
  }

  .section-title {
    color: var(--theme-text);
    font-size: 28rpx;
    font-weight: 700;
  }

  .section-hint {
    margin-left: 12rpx;
    color: var(--theme-text-tertiary);
    font-size: 21rpx;
  }

  .option-card {
    display: flex;
    align-items: center;
    min-height: 82rpx;
    margin-top: 12rpx;
    padding: 0 18rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 16rpx;
    background: var(--theme-surface-2);
  }

  .option-card.selected {
    border-color: var(--theme-brand);
    background: var(--theme-bg);
  }

  .option-card.disabled {
    opacity: 0.68;
  }

  .option-marker {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34rpx;
    height: 34rpx;
    margin-right: 14rpx;
    border: 2rpx solid var(--theme-border);
    border-radius: 50%;
    color: var(--theme-brand);
    font-size: 22rpx;
    font-weight: 800;
  }

  .selected .option-marker {
    border-color: var(--theme-brand);
  }

  .option-text {
    color: var(--theme-text);
    font-size: 26rpx;
  }

  .selection-hint {
    margin-bottom: 0;
  }

  .waiting-card {
    text-align: center;
  }

  .waiting-copy {
    margin-bottom: 0;
  }

  .creator-card {
    border: 1rpx solid var(--theme-border);
  }

  .management-actions,
  .edit-actions {
    justify-content: flex-start;
    gap: 12rpx;
    flex-wrap: wrap;
  }

  .secondary-button,
  .primary-small-button,
  .danger-outline-button {
    height: 68rpx;
    margin: 0;
    padding: 0 20rpx;
    border-radius: 14rpx;
    font-size: 23rpx;
    line-height: 66rpx;
  }

  .secondary-button {
    border: 1rpx solid var(--theme-border);
    background: var(--theme-surface-2);
    color: var(--theme-brand);
  }

  .primary-small-button {
    border: 1rpx solid var(--theme-brand);
    background: var(--theme-brand);
    color: var(--theme-bg);
  }

  .danger-outline-button {
    border: 1rpx solid var(--theme-danger);
    background: transparent;
    color: var(--theme-danger);
  }

  .secondary-button::after,
  .primary-small-button::after,
  .danger-outline-button::after,
  .primary-button::after {
    display: none;
  }

  .edit-input,
  .edit-textarea {
    width: 100%;
    margin-bottom: 12rpx;
    padding: 0 16rpx;
    box-sizing: border-box;
    border: 1rpx solid var(--theme-border);
    border-radius: 14rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text);
    font-size: 24rpx;
  }

  .edit-input {
    height: 70rpx;
  }

  .edit-textarea {
    min-height: 110rpx;
    padding-top: 14rpx;
    padding-bottom: 14rpx;
  }

  .bottom-actions {
    position: sticky;
    bottom: 12rpx;
    z-index: 2;
    margin-top: 24rpx;
    padding: 12rpx;
    border-radius: 20rpx;
    background: var(--theme-elevated);
    box-shadow: 0 6rpx 24rpx var(--theme-shadow-sm);
  }

  .primary-button {
    width: 100%;
    height: 78rpx;
    margin: 0;
    border-radius: 16rpx;
    background: var(--theme-brand);
    color: var(--theme-bg);
    font-size: 26rpx;
    line-height: 78rpx;
  }

  .bottom-hint {
    margin-bottom: 0;
    text-align: center;
  }

  .share-action {
    margin-top: 18rpx;
    text-align: center;
  }

  .share-action .secondary-button {
    width: 100%;
  }

  .state-panel {
    padding: 130rpx 20rpx;
    text-align: center;
  }

  .state-title,
  .state-hint {
    display: block;
  }

  .state-title {
    color: var(--theme-text);
    font-size: 30rpx;
    font-weight: 700;
  }

  .state-hint {
    margin-top: 10rpx;
    color: var(--theme-text-tertiary);
    font-size: 23rpx;
  }

  .state-button {
    display: inline-block;
    margin: 28rpx 6rpx 0;
  }
</style>
