<template>
  <view class="lineup-edit-page">
    <view class="hero-card">
      <text class="hero-title">{{ isEditMode ? form.name || '编辑阵容' : '创建新阵容' }}</text>
      <text class="hero-subtitle">成员数量需保持 2 到 5 个，提交时会保留你当前的成员顺序。</text>
    </view>

    <view v-if="loading" class="state-block">
      <text>加载数据中...</text>
    </view>

    <view v-else-if="errorMessage" class="state-block">
      <text>{{ errorMessage }}</text>
      <button class="action-btn primary" @click="loadInitialData">重新加载</button>
    </view>

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
              v-for="option in typeOptions"
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
              v-for="option in statusOptions"
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

      <view class="section-card">
        <view class="section-head">
          <text class="section-title">已选成员</text>
          <text class="section-tip">{{ selectedMembers.length }}/5</text>
        </view>

        <view v-if="!selectedMembers.length" class="empty-block">
          <text>还没有选择成员，请从下方搜索结果中添加。</text>
        </view>

        <view v-else class="selected-list">
          <view v-for="(member, index) in selectedMembers" :key="member.characterId || member.id" class="selected-card">
            <text class="member-order">{{ index + 1 }}</text>
            <image v-if="member.avatar" class="member-avatar" :src="member.avatar" mode="aspectFill" />
            <view v-else class="member-avatar member-avatar-placeholder">
              <text>{{ (member.name || '?').slice(0, 1) }}</text>
            </view>
            <view class="member-info">
              <text class="member-name">{{ member.name || member.label || '未知魔灵' }}</text>
              <text class="member-extra">{{ member.familyName || member.elementName || '--' }}</text>
            </view>
            <button class="mini-btn danger" size="mini" @click="removeMember(member.characterId)">移除</button>
          </view>
        </view>
      </view>

      <view class="section-card">
        <view class="section-head">
          <text class="section-title">搜索成员</text>
          <text class="section-tip">远程搜索人物名称或 code</text>
        </view>

        <view class="search-row">
          <input
            v-model="memberKeyword"
            class="field-input"
            confirm-type="search"
            placeholder="输入名称或 code"
            @confirm="refreshCharacterOptions" />
          <button class="action-btn primary" size="mini" @click="refreshCharacterOptions">搜索</button>
        </view>

        <view v-if="memberLoading && !characterOptions.length" class="empty-block">
          <text>搜索成员中...</text>
        </view>

        <view v-else-if="!characterOptions.length" class="empty-block">
          <text>暂无可选人物</text>
        </view>

        <view v-else class="option-list">
          <view v-for="option in characterOptions" :key="option.characterId || option.id" class="option-card">
            <image v-if="option.avatar" class="member-avatar" :src="option.avatar" mode="aspectFill" />
            <view v-else class="member-avatar member-avatar-placeholder">
              <text>{{ (option.name || '?').slice(0, 1) }}</text>
            </view>
            <view class="member-info">
              <text class="member-name">{{ option.name || option.label || '未知魔灵' }}</text>
              <text class="member-extra">
                {{ option.elementName || '--' }} / {{ option.familyName || '--' }} / {{ option.stars || '--' }}
              </text>
            </view>
            <button
              class="mini-btn"
              size="mini"
              :disabled="isMemberSelected(option.characterId) || selectedMembers.length >= 5"
              @click="addMember(option)">
              {{ isMemberSelected(option.characterId) ? '已选择' : '添加' }}
            </button>
          </view>
        </view>

        <view v-if="characterPagination.hasNext" class="load-more">
          <button class="action-btn" :loading="memberLoadingMore" @click="loadMoreCharacterOptions">加载更多</button>
        </view>
      </view>
    </view>

    <view class="bottom-bar">
      <button class="submit-btn" :loading="submitting" :disabled="submitting" @click="handleSubmit">
        {{ isEditMode ? '保存修改' : '创建阵容' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
  import { computed, reactive, ref } from 'vue'
  import { onLoad } from '@dcloudio/uni-app'
  import {
    createAdminLineup,
    fetchAdminCharacterOptions,
    fetchAdminLineupDetail,
    getPaginationOrDefault,
    type AdminLineupDetail,
    type CharacterOption,
    type CharacterOptionResult,
    type PaginationState,
    updateAdminLineup,
  } from '@/services/compendium-lineups'
  import { ensureAdminAccess } from '@/utils/admin'

  const COMPENDIUM_CODE = 'swc'
  const DEFAULT_LOCALE = 'zh-CN'

  interface ChoiceOption {
    label: string
    value: 'offense' | 'defense' | 'enabled' | 'disabled'
  }

  interface FormState {
    name: string
    type: 'offense' | 'defense'
    description: string
    status: 'enabled' | 'disabled'
  }

  const typeOptions: ChoiceOption[] = [
    { label: '进攻阵容', value: 'offense' },
    { label: '防御阵容', value: 'defense' },
  ]

  const statusOptions: ChoiceOption[] = [
    { label: '启用', value: 'enabled' },
    { label: '停用', value: 'disabled' },
  ]

  const lineupId = ref('')
  const selectedLocale = ref(DEFAULT_LOCALE)
  const loading = ref(false)
  const submitting = ref(false)
  const errorMessage = ref('')
  const memberKeyword = ref('')
  const memberLoading = ref(false)
  const memberLoadingMore = ref(false)
  const characterOptions = ref<CharacterOption[]>([])
  const characterPagination = ref<PaginationState>(getPaginationOrDefault())
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

  const isMemberSelected = (characterId: string): boolean =>
    selectedMembers.value.some(member => member.characterId === characterId)

  const addMember = (option: CharacterOption) => {
    if (isMemberSelected(option.characterId) || selectedMembers.value.length >= 5) return
    selectedMembers.value = [...selectedMembers.value, option]
  }

  const removeMember = (characterId: string) => {
    selectedMembers.value = selectedMembers.value.filter(member => member.characterId !== characterId)
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

  const fetchCharacterOptions = async (reset = true) => {
    if (memberLoading.value || memberLoadingMore.value) return

    if (reset) {
      memberLoading.value = true
    } else {
      if (!characterPagination.value.hasNext) return
      memberLoadingMore.value = true
    }

    try {
      const nextPage = reset ? 1 : characterPagination.value.page + 1
      const result: CharacterOptionResult = await fetchAdminCharacterOptions({
        compendiumId: COMPENDIUM_CODE,
        locale: selectedLocale.value,
        keyword: memberKeyword.value.trim() || undefined,
        status: 'enabled',
        page: nextPage,
        pageSize: 20,
      })

      characterPagination.value = result.pagination
      characterOptions.value = reset ? result.items : [...characterOptions.value, ...result.items]
    } catch (error) {
      uni.showToast({
        title: typeof error === 'string' ? error : '加载人物选项失败',
        icon: 'none',
      })
    } finally {
      memberLoading.value = false
      memberLoadingMore.value = false
    }
  }

  const refreshCharacterOptions = () => {
    fetchCharacterOptions(true)
  }

  const loadMoreCharacterOptions = () => {
    fetchCharacterOptions(false)
  }

  const loadInitialData = async () => {
    loading.value = true
    errorMessage.value = ''

    try {
      resetForm()
      const tasks: Promise<unknown>[] = [fetchCharacterOptions(true)]

      if (isEditMode.value) {
        tasks.unshift(
          fetchAdminLineupDetail(lineupId.value, {
            locale: selectedLocale.value,
          }).then(fillForm),
        )
      }

      await Promise.all(tasks)
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

  .action-btn.primary,
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

  .bottom-bar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 20rpx 24rpx 32rpx;
    background: rgba(246, 247, 251, 0.96);
    backdrop-filter: blur(12rpx);
  }

  .submit-btn {
    width: 100%;
  }
</style>
