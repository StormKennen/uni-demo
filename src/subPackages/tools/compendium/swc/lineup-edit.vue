<template>
  <view class="lineup-edit-page">
    <view class="hero-card">
      <text class="hero-title">{{ isEditMode ? form.name || '编辑阵容' : '创建新阵容' }}</text>
      <text class="hero-subtitle">成员数量需保持 2 到 5 个，提交时会保留你当前的成员顺序。</text>
    </view>

    <StateBlock v-if="loading" class="state-block" text="加载数据中..." />

    <StateBlock
      v-else-if="errorMessage"
      class="state-block"
      :text="errorMessage"
      action-text="重新加载"
      theme="violet"
      @action="loadInitialData" />

    <view v-else class="content">
      <view class="section-card">
        <text class="section-title">基础信息</text>

        <view class="field">
          <text class="field-label">阵容名称</text>
          <input v-model="form.name" class="field-input" placeholder="请输入阵容名称" maxlength="120" />
        </view>

        <view class="field">
          <text class="field-label">阵容类型</text>
          <view class="chip-row">
            <text
              v-for="option in LINEUP_TYPE_OPTIONS"
              :key="option.value"
              class="chip"
              :class="{ active: form.type === option.value }"
              @click="form.type = option.value">
              {{ option.label }}
            </text>
          </view>
        </view>

        <view class="field">
          <text class="field-label">状态</text>
          <view class="chip-row">
            <text
              v-for="option in LINEUP_STATUS_OPTIONS"
              :key="option.value"
              class="chip"
              :class="{ active: form.status === option.value }"
              @click="form.status = option.value">
              {{ option.label }}
            </text>
          </view>
        </view>

        <view class="field">
          <text class="field-label">阵容描述</text>
          <textarea
            v-model="form.description"
            class="field-textarea"
            maxlength="1000"
            placeholder="请输入阵容思路、适用场景或关键打法" />
        </view>
      </view>

      <CharacterPickerPanel
        v-model="selectedMembers"
        :compendium-id="COMPENDIUM_CODE"
        :locale="selectedLocale"
        selection-mode="multiple"
        footer-mode="none"
        :max-count="5"
        selected-title="已选成员"
        search-title="搜索成员"
        search-tip="远程搜索人物名称或 code"
        search-placeholder="输入名称或 code"
        empty-selected-text="还没有选择成员，请从下方搜索结果中添加。"
        empty-search-text="暂无可选人物" />
    </view>

    <StickyActionBar>
      <button class="submit-btn" :loading="submitting" :disabled="submitting" @click="handleSubmit">
        {{ isEditMode ? '保存修改' : '创建阵容' }}
      </button>
    </StickyActionBar>
  </view>
</template>

<script setup lang="ts">
  import { computed, reactive, ref } from 'vue'
  import { onLoad } from '@dcloudio/uni-app'
  import CharacterPickerPanel from './components/character-picker-panel.vue'
  import StateBlock from './components/state-block.vue'
  import StickyActionBar from './components/sticky-action-bar.vue'
  import {
    createAdminLineup,
    fetchAdminLineupDetail,
    type AdminLineupDetail,
    type CharacterOption,
    type LineupStatus,
    type LineupType,
    updateAdminLineup,
  } from '@/services/compendium-lineups'
  import { ensureAdminAccess } from '@/utils/admin'
  import { LINEUP_STATUS_OPTIONS, LINEUP_TYPE_OPTIONS } from './lineup-meta'

  const COMPENDIUM_CODE = 'swc'
  const DEFAULT_LOCALE = 'zh-CN'

  interface FormState {
    name: string
    type: LineupType
    description: string
    status: LineupStatus
  }

  const lineupId = ref('')
  const selectedLocale = ref(DEFAULT_LOCALE)
  const loading = ref(false)
  const submitting = ref(false)
  const errorMessage = ref('')
  const selectedMembers = ref<CharacterOption[]>([])

  const form = reactive<FormState>({
    name: '',
    type: 'defense',
    description: '',
    status: 'enabled',
  })

  const isEditMode = computed(() => Boolean(lineupId.value))

  const buildCurrentUrl = (): string => {
    const params: string[] = [`compendiumId=${encodeURIComponent(COMPENDIUM_CODE)}`, `locale=${encodeURIComponent(selectedLocale.value)}`]
    if (lineupId.value) params.push(`lineupId=${encodeURIComponent(lineupId.value)}`)
    return `/subPackages/tools/compendium/swc/lineup-edit?${params.join('&')}`
  }

  const resetForm = () => {
    form.name = ''
    form.type = 'defense'
    form.description = ''
    form.status = 'enabled'
    selectedMembers.value = []
  }

  const fillForm = (detail: AdminLineupDetail) => {
    form.name = detail.name
    form.type = (detail.type === 'offense' ? 'offense' : 'defense')
    form.description = detail.description
    form.status = (detail.status === 'disabled' ? 'disabled' : 'enabled')
    selectedMembers.value = detail.characters.map(item => ({
      ...item.character,
      characterId: item.characterId || item.character.characterId || item.character.id,
    }))
  }

  const loadInitialData = async () => {
    loading.value = true
    errorMessage.value = ''

    try {
      resetForm()
      if (isEditMode.value) {
        await fetchAdminLineupDetail(lineupId.value, {
          locale: selectedLocale.value,
        }).then(fillForm)
      }
    } catch (error) {
      errorMessage.value = typeof error === 'string' ? error : '加载阵容数据失败，请稍后重试'
    } finally {
      loading.value = false
    }
  }

  const validateForm = (): boolean => {
    if (!form.name.trim()) {
      uni.showToast({
        title: '请输入阵容名称',
        icon: 'none',
      })
      return false
    }

    if (selectedMembers.value.length < 2 || selectedMembers.value.length > 5) {
      uni.showToast({
        title: '成员数量需在 2 到 5 个之间',
        icon: 'none',
      })
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm() || submitting.value) return

    submitting.value = true

    const basePayload = {
      name: form.name.trim(),
      type: form.type,
      description: form.description.trim(),
      status: form.status,
      characterIds: selectedMembers.value.map(member => member.characterId),
    }

    try {
      if (isEditMode.value) {
        await updateAdminLineup(lineupId.value, basePayload)
      } else {
        await createAdminLineup({
          compendiumId: COMPENDIUM_CODE,
          ...basePayload,
        })
      }

      uni.showToast({
        title: isEditMode.value ? '保存成功' : '创建成功',
        icon: 'success',
      })

      setTimeout(() => {
        uni.navigateBack()
      }, 500)
    } catch (error) {
      uni.showToast({
        title: typeof error === 'string' ? error : '保存失败，请稍后重试',
        icon: 'none',
      })
    } finally {
      submitting.value = false
    }
  }

  onLoad((options: Record<string, string | undefined>) => {
    lineupId.value = options.lineupId || ''
    selectedLocale.value = options.locale || DEFAULT_LOCALE

    if (!ensureAdminAccess(buildCurrentUrl())) return

    uni.setNavigationBarTitle({ title: isEditMode.value ? '编辑阵容' : '新建阵容' })
    loadInitialData()
  })
</script>

<style scoped lang="scss">
  .lineup-edit-page {
    min-height: 100vh;
    background: #f6f7fb;
    padding-bottom: 180rpx;
  }

  .hero-card,
  .section-card,
  .state-block {
    margin: 24rpx;
    border-radius: 24rpx;
    background: #fff;
    box-shadow: 0 10rpx 30rpx rgba(15, 23, 42, 0.06);
  }

  .hero-card {
    background: linear-gradient(135deg, #4c1d95 0%, #a855f7 100%);
    color: #fff;
    padding: 28rpx;
  }

  .hero-title {
    display: block;
    font-size: 36rpx;
    font-weight: 800;
  }

  .hero-subtitle {
    display: block;
    margin-top: 10rpx;
    color: rgba(255, 255, 255, 0.78);
    font-size: 24rpx;
    line-height: 1.7;
  }

  .section-card {
    padding: 24rpx;
  }

  .section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
    margin-bottom: 18rpx;
  }

  .section-title {
    display: block;
    color: #111827;
    font-size: 30rpx;
    font-weight: 800;
  }

  .section-tip {
    color: #667085;
    font-size: 22rpx;
    font-weight: 700;
  }

  .field + .field {
    margin-top: 22rpx;
  }

  .field-label {
    display: block;
    margin-bottom: 12rpx;
    color: #475467;
    font-size: 24rpx;
    font-weight: 700;
  }

  .field-input,
  .field-textarea {
    width: 100%;
    border-radius: 18rpx;
    background: #f3f5f9;
    padding: 22rpx 24rpx;
    font-size: 28rpx;
    box-sizing: border-box;
  }

  .field-textarea {
    min-height: 220rpx;
    line-height: 1.7;
  }

  .chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
  }

  .chip {
    padding: 12rpx 20rpx;
    border-radius: 999rpx;
    background: #eef2ff;
    color: #6b7280;
    font-size: 24rpx;
    font-weight: 700;
  }

  .chip.active {
    background: #7c3aed;
    color: #fff;
  }

  .selected-list,
  .option-list {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
  }

  .selected-card,
  .option-card {
    display: flex;
    align-items: center;
    gap: 14rpx;
    padding: 18rpx;
    border-radius: 20rpx;
    background: #f8fafc;
  }

  .member-order {
    width: 40rpx;
    text-align: center;
    color: #7c3aed;
    font-size: 24rpx;
    font-weight: 800;
  }

  .member-avatar {
    width: 72rpx;
    height: 72rpx;
    border-radius: 18rpx;
    background: #e5e7eb;
    flex-shrink: 0;
  }

  .member-avatar-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #7c3aed;
    font-weight: 800;
  }

  .member-info {
    min-width: 0;
    flex: 1;
  }

  .member-name,
  .member-extra {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .member-name {
    color: #111827;
    font-size: 26rpx;
    font-weight: 700;
  }

  .member-extra {
    margin-top: 6rpx;
    color: #667085;
    font-size: 22rpx;
  }

  .search-row {
    display: flex;
    align-items: center;
    gap: 14rpx;
    margin-bottom: 20rpx;
  }

  .action-btn,
  .mini-btn,
  .submit-btn {
    border-radius: 999rpx;
    font-size: 24rpx;
    font-weight: 700;
  }

  .submit-btn {
    background: #7c3aed;
    color: #fff;
  }

  .mini-btn.danger {
    color: #dc2626;
  }

  .empty-block,
  .state-block {
    padding: 48rpx 28rpx;
    text-align: center;
    color: #667085;
    font-size: 28rpx;
  }

  .load-more {
    margin-top: 20rpx;
    display: flex;
    justify-content: center;
  }

  .submit-btn {
    width: 100%;
  }
</style>
