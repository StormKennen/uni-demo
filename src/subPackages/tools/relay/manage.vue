<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { onLoad, onShow, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
  import PageLayout from '@/components/PageLayout.vue'
  import {
    deleteRelaysRelayId,
    patchRelaysRelayId,
    postRelaysRelayIdClose,
    postRelaysRelayIdReopen,
  } from '@/services/apifox/NODEJSDEMO/RELAYS/apifox'
  import { buildRelayDetailRoute, formatRelayDate, RELAY_DETAIL_ROUTE, RELAY_HOME_ROUTE, RELAY_SHARE_IMAGE_URL, readRelayErrorMessage } from './constants'
  import { buildRelayShareUrl } from '@/utilsH5/relay-share'
  import { useRelayDetail } from './composables/useRelayDetail'
  import { normalizeRelay } from './normalizers'
  import { getRelayShareCode, setRelayShareCode } from './share-code'
  import type { RelayFieldViewModel } from './types'

  const relayDetail = useRelayDetail()
  const relayId = ref('')
  const shareCode = ref('')
  const title = ref('')
  const description = ref('')
  const isReady = ref(false)
  const isSaving = ref(false)
  const isActioning = ref(false)
  const isDeleting = ref(false)

  const detail = relayDetail.detail
  const hasChanges = computed(() => {
    if (!detail.value) return false
    return title.value.trim() !== detail.value.relay.title || description.value.trim() !== detail.value.relay.description
  })
  const isBusy = computed(() => isSaving.value || isActioning.value || isDeleting.value)
  const canManage = computed(() => Boolean(detail.value?.permissions.canEditRelay))
  const shareUrl = computed(() => {
    const code = shareCode.value || detail.value?.relay.share.shareCode
    return code ? buildRelayShareUrl(buildRelayDetailRoute({ shareCode: code })) : ''
  })

  const applyDetail = () => {
    if (!detail.value) return
    title.value = detail.value.relay.title
    description.value = detail.value.relay.description
    isReady.value = true
  }

  const load = async () => {
    if (!relayId.value) return
    isReady.value = false
    const loaded = await relayDetail.load({ id: relayId.value })
    if (loaded?.relay.id) {
      if (shareCode.value) setRelayShareCode(loaded.relay.id, shareCode.value)
      applyDetail()
    }
  }

  const saveBasicInfo = async () => {
    if (!detail.value || isBusy.value || !hasChanges.value) return
    const nextTitle = title.value.trim()
    const nextDescription = description.value.trim()
    if (!nextTitle) {
      uni.showToast({ title: '标题不能为空', icon: 'none' })
      return
    }
    if (nextTitle.length > 200) {
      uni.showToast({ title: '标题不能超过 200 字', icon: 'none' })
      return
    }
    if (nextDescription.length > 5000) {
      uni.showToast({ title: '说明不能超过 5000 字', icon: 'none' })
      return
    }

    isSaving.value = true
    try {
      await patchRelaysRelayId(detail.value.relay.id, { title: nextTitle, description: nextDescription })
      await load()
      uni.showToast({ title: '已保存', icon: 'success' })
    } catch (error: unknown) {
      uni.showToast({ title: readRelayErrorMessage(error, '保存失败，请重试'), icon: 'none' })
    } finally {
      isSaving.value = false
    }
  }

  const runStatusAction = async (action: 'close' | 'reopen') => {
    if (!detail.value || isBusy.value) return
    isActioning.value = true
    try {
      if (action === 'close') await postRelaysRelayIdClose(detail.value.relay.id)
      else await postRelaysRelayIdReopen(detail.value.relay.id)
      await load()
      uni.showToast({ title: action === 'close' ? '接龙已关闭' : '接龙已重新开启', icon: 'success' })
    } catch (error: unknown) {
      uni.showToast({ title: readRelayErrorMessage(error, action === 'close' ? '关闭失败，请重试' : '重新开启失败，请重试'), icon: 'none' })
    } finally {
      isActioning.value = false
    }
  }

  const toggleShare = async () => {
    if (!detail.value || isBusy.value) return
    isActioning.value = true
    const nextEnabled = !detail.value.relay.share.enabled
    try {
      const raw: unknown = await patchRelaysRelayId(detail.value.relay.id, { share: { enabled: nextEnabled } })
      const relay = normalizeRelay(raw)
      if (relay.share.shareCode) {
        shareCode.value = relay.share.shareCode
        setRelayShareCode(detail.value.relay.id, relay.share.shareCode)
      }
      await load()
      uni.showToast({ title: nextEnabled ? '分享已开启' : '分享已关闭', icon: 'success' })
    } catch (error: unknown) {
      uni.showToast({ title: readRelayErrorMessage(error, '分享设置保存失败，请重试'), icon: 'none' })
    } finally {
      isActioning.value = false
    }
  }

  const copyShareLink = async () => {
    if (!detail.value || isBusy.value) return
    if (!detail.value.relay.share.enabled) {
      await toggleShare()
      if (!detail.value?.relay.share.enabled) return
    }
    const link = shareUrl.value
    if (!link) {
      uni.showToast({ title: '暂时没有可用的分享链接', icon: 'none' })
      return
    }
    uni.setClipboardData({ data: link, success: () => uni.showToast({ title: '分享链接已复制', icon: 'none' }) })
  }

  const deleteRelay = () => {
    if (!detail.value || isBusy.value) return
    uni.showModal({
      title: '删除接龙',
      content: '删除后将无法继续查看或参与，确认删除吗？',
      success: result => {
        if (!result.confirm || !detail.value) return
        isDeleting.value = true
        void deleteRelaysRelayId(detail.value.relay.id).then(
          () => {
            uni.showToast({ title: '接龙已删除', icon: 'success' })
            setTimeout(() => uni.redirectTo({ url: RELAY_HOME_ROUTE }), 350)
          },
          error => {
            isDeleting.value = false
            uni.showToast({ title: readRelayErrorMessage(error, '删除失败，请重试'), icon: 'none' })
          },
        )
      },
    })
  }

  const fieldTypeLabel = (field: RelayFieldViewModel): string => {
    if (field.type === 'textarea') return '多行文字'
    if (field.type === 'number') return field.aggregate === 'sum' ? '数字 · 合计' : '数字'
    if (field.type === 'image') return '图片'
    if (field.type === 'single_select') return '单选'
    return '文字'
  }

  const fieldConfigLabel = (field: RelayFieldViewModel): string => {
    const config = field.config
    const parts: string[] = []
    if (config.min !== undefined) parts.push(`最小 ${config.min}`)
    if (config.max !== undefined) parts.push(`最大 ${config.max}`)
    if (config.maxLength !== undefined) parts.push(`最多 ${config.maxLength} 字`)
    if (config.maxCount !== undefined) parts.push(`最多 ${config.maxCount} 张`)
    return parts.join(' · ')
  }

  const retry = (): void => {
    void load()
  }

  onLoad((options: Record<string, string | undefined>) => {
    relayId.value = options.id?.trim() || ''
    shareCode.value = options.shareCode?.trim() || getRelayShareCode(relayId.value)
    void load()
  })

  onShow(() => {
    if (isReady.value && !isBusy.value) void load()
  })

  // #ifdef MP-WEIXIN
  uni.showShareMenu({ withShareTicket: true })
  onShareAppMessage(() => ({
    title: detail.value ? `${detail.value.relay.title}，等你参加` : '接龙管理',
    path: buildRelayDetailRoute({ id: relayId.value, shareCode: shareCode.value || undefined }),
    imageUrl: RELAY_SHARE_IMAGE_URL,
  }))
  onShareTimeline(() => ({
    title: detail.value ? `${detail.value.relay.title}，等你参加` : '接龙管理',
    query: buildRelayDetailRoute({ id: relayId.value, shareCode: shareCode.value || undefined }).split('?')[1] || '',
    imageUrl: RELAY_SHARE_IMAGE_URL,
  }))
  // #endif
</script>

<template>
  <PageLayout title="管理接龙" :back-fallback="RELAY_DETAIL_ROUTE + '?id=' + relayId" nav-divider>
    <view class="manage-page">
      <view v-if="relayDetail.isLoading.value && !detail" class="state-panel">
        <text class="state-title">正在读取接龙</text>
        <text class="state-hint">请稍候…</text>
      </view>
      <view v-else-if="relayDetail.error.value || !canManage" class="state-panel">
        <text class="state-title">{{ relayDetail.error.value ? '接龙加载失败' : '没有管理权限' }}</text>
        <text class="state-hint">{{ relayDetail.error.value ? readRelayErrorMessage(relayDetail.error.value, '接龙不存在或已失效') : '只有接龙创建者可以管理接龙' }}</text>
        <button v-if="relayDetail.error.value" class="secondary-button" @click="retry">重新加载</button>
      </view>
      <template v-else-if="detail && isReady">
        <view class="page-heading">
          <text class="eyebrow">RELAY SETTINGS</text>
          <text class="page-title">管理接龙</text>
          <text class="page-hint">基本信息可以调整，动态字段创建后锁定，避免影响已有记录。</text>
        </view>

        <view class="form-card">
          <view class="form-item">
            <text class="form-label">标题</text>
            <input v-model="title" class="text-control" :maxlength="200" placeholder="请输入接龙标题" :disabled="isBusy" />
          </view>
          <view class="form-item">
            <view class="label-with-counter"><text class="form-label">说明</text><text class="counter">{{ description.length }} / 5000</text></view>
            <textarea v-model="description" class="textarea-control" :maxlength="5000" placeholder="补充接龙说明（可选）" auto-height :disabled="isBusy" />
          </view>
          <button class="primary-button" :disabled="isBusy || !hasChanges" @click="saveBasicInfo">{{ isSaving ? '保存中…' : '保存基本信息' }}</button>
        </view>

        <view class="section-heading"><text class="section-title">接龙状态</text><text class="section-hint">{{ detail.relay.status === 'open' ? '当前可继续参与' : '当前不接受新的接龙' }}</text></view>
        <view class="action-card">
          <view class="status-row">
            <view>
              <text class="setting-label">{{ detail.relay.status === 'open' ? '进行中' : '已结束' }}</text>
              <text class="setting-hint">{{ detail.relay.settings.deadline ? `截止：${formatRelayDate(detail.relay.settings.deadline)}` : '没有设置截止时间' }}</text>
            </view>
            <button v-if="detail.permissions.canClose" class="secondary-button compact-button" :disabled="isBusy" @click="runStatusAction('close')">{{ isActioning ? '处理中…' : '关闭接龙' }}</button>
            <button v-else-if="detail.permissions.canReopen" class="secondary-button compact-button" :disabled="isBusy" @click="runStatusAction('reopen')">{{ isActioning ? '处理中…' : '重新开启' }}</button>
          </view>
        </view>

        <view class="section-heading"><text class="section-title">分享设置</text><text class="section-hint">用分享链接邀请好友查看和参与</text></view>
        <view class="action-card">
          <view class="status-row">
            <view><text class="setting-label">允许分享</text><text class="setting-hint">{{ detail.relay.share.enabled ? '已开启分享链接' : '关闭后旧分享链接将不可用' }}</text></view>
            <button class="switch-button" :class="{ on: detail.relay.share.enabled }" :disabled="isBusy" @click="toggleShare">{{ detail.relay.share.enabled ? '已开启' : '已关闭' }}</button>
          </view>
          <button class="secondary-button share-button" :disabled="isBusy" @click="copyShareLink">{{ detail.relay.share.enabled ? '复制分享链接' : '开启并复制分享链接' }}</button>
        </view>

        <view class="section-heading"><text class="section-title">动态字段</text><text class="section-hint">只读</text></view>
        <view class="fields-card">
          <view v-for="field in detail.relay.fields" :key="field.key" class="field-row">
            <view class="field-main">
              <view class="field-title-row"><text class="field-label">{{ field.label }}</text><text v-if="field.required" class="required-mark">必填</text></view>
              <text class="field-meta">{{ fieldTypeLabel(field) }}<text v-if="fieldConfigLabel(field)"> · {{ fieldConfigLabel(field) }}</text></text>
              <view v-if="field.options.length" class="option-list"><text v-for="option in field.options" :key="option.value" class="option-chip">{{ option.label }}</text></view>
            </view>
            <text class="locked-mark">已锁定</text>
          </view>
          <text v-if="!detail.relay.fields.length" class="empty-fields">这个接龙没有动态字段</text>
        </view>

        <button class="danger-button" :disabled="isBusy" @click="deleteRelay">{{ isDeleting ? '删除中…' : '删除接龙' }}</button>
      </template>
    </view>
  </PageLayout>
</template>

<style scoped lang="scss">
  .manage-page {
    min-height: 100vh;
    padding: 28rpx 28rpx calc(90rpx + env(safe-area-inset-bottom));
    box-sizing: border-box;
    background: var(--theme-bg);
    color: var(--theme-text);
  }

  .page-heading {
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
  .field-meta,
  .state-hint,
  .empty-fields {
    color: var(--theme-text-secondary);
    font-size: 22rpx;
    line-height: 1.5;
  }

  .page-hint {
    display: block;
    margin-top: 10rpx;
  }

  .form-card,
  .action-card,
  .fields-card {
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
  .setting-label,
  .field-label {
    color: var(--theme-text);
    font-size: 27rpx;
    font-weight: 700;
  }

  .label-with-counter,
  .status-row,
  .field-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .counter,
  .locked-mark {
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

  .primary-button,
  .secondary-button,
  .danger-button,
  .switch-button {
    border-radius: 16rpx;
    font-size: 24rpx;
  }

  .primary-button {
    width: 100%;
    height: 78rpx;
    margin: 26rpx 0 0;
    background: var(--theme-brand);
    color: var(--theme-bg);
    line-height: 78rpx;
  }

  .secondary-button {
    height: 72rpx;
    margin: 0;
    padding: 0 22rpx;
    border: 1rpx solid var(--theme-border);
    background: var(--theme-surface-2);
    color: var(--theme-brand);
    line-height: 70rpx;
  }

  .compact-button {
    flex-shrink: 0;
    margin-left: 18rpx;
  }

  .secondary-button::after,
  .primary-button::after,
  .danger-button::after,
  .switch-button::after {
    display: none;
  }

  .section-heading {
    display: flex;
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

  .setting-hint,
  .field-meta {
    display: block;
    margin-top: 6rpx;
  }

  .switch-button {
    min-width: 130rpx;
    height: 62rpx;
    margin: 0;
    padding: 0 18rpx;
    border: 1rpx solid var(--theme-border);
    background: var(--theme-surface-2);
    color: var(--theme-text-secondary);
    line-height: 60rpx;
  }

  .switch-button.on {
    border-color: var(--theme-brand);
    background: var(--theme-brand);
    color: var(--theme-bg);
  }

  .share-button {
    width: 100%;
    margin-top: 18rpx;
  }

  .field-row + .field-row {
    margin-top: 24rpx;
    padding-top: 24rpx;
    border-top: 1rpx solid var(--theme-border);
  }

  .field-main {
    min-width: 0;
    flex: 1;
  }

  .field-title-row {
    justify-content: flex-start;
  }

  .required-mark {
    margin-left: 10rpx;
    color: var(--theme-danger);
    font-size: 21rpx;
  }

  .locked-mark {
    flex-shrink: 0;
    margin-left: 18rpx;
  }

  .option-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10rpx;
    margin-top: 12rpx;
  }

  .option-chip {
    padding: 6rpx 14rpx;
    border-radius: 999rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text-secondary);
    font-size: 21rpx;
  }

  .empty-fields {
    display: block;
    text-align: center;
  }

  .danger-button {
    width: 100%;
    height: 78rpx;
    margin-top: 34rpx;
    border: 1rpx solid var(--theme-danger);
    background: var(--theme-surface);
    color: var(--theme-danger);
    line-height: 76rpx;
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
    font-size: 29rpx;
    font-weight: 700;
  }

  .state-hint {
    margin-top: 10rpx;
  }

  .state-panel .secondary-button {
    display: inline-block;
    margin-top: 28rpx;
  }
</style>
