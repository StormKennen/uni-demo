<template>
  <view class="lineup-edit-page">
    <view class="hero-card">
      <text class="hero-title">{{ isEditMode ? form.name || '编辑阵容' : '创建新阵容' }}</text>
      <text class="hero-subtitle">可自由增删成员，提交时会保留你当前的成员顺序。</text>
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
          <input v-model="form.type" class="field-input" placeholder="请输入阵容类型，如竞技场防守" maxlength="60" />
          <view class="preset-head">
            <text class="preset-title">快速填写</text>
            <text class="preset-tip">点选后仍可继续手动修改</text>
          </view>
          <view class="chip-row preset-chip-row">
            <text
              v-for="option in LINEUP_TYPE_PRESET_OPTIONS"
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
          <textarea v-model="form.description" class="field-textarea" maxlength="1000" placeholder="请输入阵容思路、适用场景或关键打法" />
        </view>
      </view>

      <view class="section-card">
        <view class="section-head">
          <text class="section-title">阵容成员</text>
          <text class="section-tip">{{ selectedMembers.length }}</text>
        </view>

        <SwcLineup
          v-if="selectedMembers.length"
          class="selected-members-grid"
          :characters="selectedMemberViews"
          :columns="5"
          editable
          :show-member-name="false"
          :show-stars="false"
          :show-element="true"
          :show-order="true"
          :avatar-size="92"
          empty-text="还没有选择成员，请点击下方按钮添加。"
          @remove="handleRemoveMember" />

        <StateBlock v-else class="empty-block" text="还没有选择成员，请点击下方按钮添加。" />

        <view class="picker-btn-wrap">
          <button class="picker-btn" @click="navigateToCharacterPicker">精准人物筛选</button>
        </view>
      </view>
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
  import { onLoad, onShow } from '@dcloudio/uni-app'
  import StateBlock from './components/state-block.vue'
  import StickyActionBar from './components/sticky-action-bar.vue'
  import SwcLineup from './components/swc-lineup.vue'
  import {
    createUserLineup,
    fetchUserLineupDetail,
    type CharacterOption,
    type LineupStatus,
    type LineupType,
    type UserLineupDetail,
    updateUserLineup,
  } from '@/services/compendium-lineups'
  import { ensureLoginAccess } from '@/utils/admin'
  import { getStorageSync, removeStorageSync, setStorageSync } from '@/utils/storage'
  import { LINEUP_STATUS_OPTIONS, LINEUP_TYPE_PRESET_OPTIONS } from './lineup-meta'
  import { toSwcCharacterView } from './utils'

  const COMPENDIUM_CODE = 'swc'
  const DEFAULT_LOCALE = 'zh-CN'
  const PICKER_CACHE_KEY = 'compendium:swc:lineup-edit:picker-draft'
  const PICKER_RESULT_KEY = 'compendium:swc:lineup-edit:picker-result'

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
    type: '竞技场防守',
    description: '',
    status: 'enabled',
  })

  const isEditMode = computed(() => Boolean(lineupId.value))
  const selectedMemberViews = computed(() => selectedMembers.value.map(item => toSwcCharacterView(item)))

  const handleRemoveMember = (characterId: string) => {
    selectedMembers.value = selectedMembers.value.filter(m => m.characterId !== characterId)
  }

  const navigateToCharacterPicker = () => {
    setStorageSync(
      PICKER_CACHE_KEY,
      selectedMembers.value.map(item => ({ ...item })),
    )
    removeStorageSync(PICKER_RESULT_KEY)
    const params = [
      `compendiumId=${encodeURIComponent(COMPENDIUM_CODE)}`,
      `locale=${encodeURIComponent(selectedLocale.value)}`,
      `cacheKey=${encodeURIComponent(PICKER_CACHE_KEY)}`,
      `resultKey=${encodeURIComponent(PICKER_RESULT_KEY)}`,
      'maxCount=0',
    ]
    uni.navigateTo({ url: `/subPackages/tools/compendium/swc/character-picker?${params.join('&')}` })
  }

  const checkPickerResult = () => {
    const result = getStorageSync(PICKER_RESULT_KEY)
    if (Array.isArray(result) && result.length) {
      selectedMembers.value = result.map((item: CharacterOption) => ({ ...item }))
      removeStorageSync(PICKER_RESULT_KEY)
    }
  }

  const buildCurrentUrl = (): string => {
    const params: string[] = [`compendiumId=${encodeURIComponent(COMPENDIUM_CODE)}`, `locale=${encodeURIComponent(selectedLocale.value)}`]
    if (lineupId.value) params.push(`lineupId=${encodeURIComponent(lineupId.value)}`)
    return `/subPackages/tools/compendium/swc/lineup-edit?${params.join('&')}`
  }

  const resetForm = () => {
    form.name = ''
    form.type = '竞技场防守'
    form.description = ''
    form.status = 'enabled'
    selectedMembers.value = []
  }

  const fillForm = (detail: UserLineupDetail) => {
    form.name = detail.name
    form.type = detail.type || '竞技场防守'
    form.description = detail.description
    form.status = detail.status === 'disabled' ? 'disabled' : 'enabled'
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
        const detail = await fetchUserLineupDetail(lineupId.value, {
          locale: selectedLocale.value,
        })
        if (detail.canEdit === false) {
          uni.showToast({ title: '无权编辑该阵容', icon: 'none' })
          setTimeout(() => uni.navigateBack(), 600)
          return
        }
        fillForm(detail)
      }
    } catch (error) {
      errorMessage.value = typeof error === 'string' ? error : '加载阵容数据失败，请稍后重试'
    } finally {
      loading.value = false
    }
  }

  const validateForm = (): boolean => {
    if (!form.type.trim()) {
      uni.showToast({
        title: '请输入阵容类型',
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
      type: form.type.trim(),
      description: form.description.trim(),
      status: form.status,
      characterIds: selectedMembers.value.map(member => member.characterId),
      ...(form.name.trim() ? { name: form.name.trim() } : {}),
    }

    try {
      if (isEditMode.value) {
        await updateUserLineup(lineupId.value, basePayload)
      } else {
        await createUserLineup({
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
      const status = (error as { code?: number; statusCode?: number })?.code ?? (error as { statusCode?: number })?.statusCode
      uni.showToast({
        title: status === 403 ? '无权操作该阵容' : typeof error === 'string' ? error : '保存失败，请稍后重试',
        icon: 'none',
      })
    } finally {
      submitting.value = false
    }
  }

  onLoad((options: Record<string, string | undefined>) => {
    lineupId.value = options.lineupId || ''
    selectedLocale.value = options.locale || DEFAULT_LOCALE

    if (!ensureLoginAccess(buildCurrentUrl())) return

    removeStorageSync(PICKER_RESULT_KEY)
    uni.setNavigationBarTitle({ title: isEditMode.value ? '编辑阵容' : '新建阵容' })
    loadInitialData()
  })

  onShow(() => {
    checkPickerResult()
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

  .preset-head {
    margin-top: 14rpx;
    margin-bottom: 12rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
  }

  .preset-title {
    color: #475467;
    font-size: 22rpx;
    font-weight: 700;
  }

  .preset-tip {
    color: #98a2b3;
    font-size: 20rpx;
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
    line-height: 1.5;
    box-sizing: border-box;
  }

  .field-input {
    min-height: 88rpx;
    height: 88rpx;
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

  .preset-chip-row {
    margin-top: 0;
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

  .selected-members-grid {
    margin-bottom: 20rpx;
  }

  .picker-btn-wrap {
    margin-top: 16rpx;
  }

  .picker-btn {
    width: 100%;
    height: 80rpx;
    line-height: 80rpx;
    border-radius: 999rpx;
    background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
    color: #fff;
    font-size: 28rpx;
    font-weight: 700;
    letter-spacing: 2rpx;
  }

  .submit-btn {
    width: 100%;
    border-radius: 999rpx;
    font-size: 24rpx;
    font-weight: 700;
    background: #7c3aed;
    color: #fff;
  }

  .empty-block,
  .state-block {
    padding: 48rpx 28rpx;
    text-align: center;
    color: #667085;
    font-size: 28rpx;
  }
</style>
