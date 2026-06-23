<template>
  <view class="relation-page">
    <view class="hero-card">
      <text class="hero-title">防御阵容 -> 进攻阵容</text>
      <text class="hero-subtitle">为一个防御阵容配置多个可克制它的进攻阵容，保存时会整组覆盖。</text>
    </view>

    <StateBlock v-if="pageLoading" class="state-block" text="加载关系配置中..." />

    <StateBlock
      v-else-if="errorMessage"
      class="state-block"
      :text="errorMessage"
      action-text="重新加载"
      theme="teal"
      @action="loadInitialData" />

    <view v-else class="content">
      <LineupPickerPanel
        v-model:keyword="sourceKeyword"
        title="防御阵容"
        tip="选择 sourceLineup"
        :options="defenseOptions"
        :selected-items="selectedSource ? [selectedSource] : []"
        :selected-ids="selectedSource ? [selectedSource.id] : []"
        selected-action-text="清空"
        selected-highlight
        search-placeholder="搜索防御阵容"
        loading-text="加载防御阵容中..."
        empty-text="暂无防御阵容可选"
        :loading="defenseLoading"
        @search="searchDefenseOptions"
        @toggle="selectSource"
        @remove="clearSource" />

      <view class="section-card">
        <view class="section-head">
          <text class="section-title">已选进攻阵容</text>
          <text class="section-tip">{{ selectedTargets.length }} 个</text>
        </view>

        <StateBlock v-if="!selectedSource" class="empty-block" text="请先选择防御阵容" />

        <StateBlock v-else-if="!selectedTargets.length" class="empty-block" text="当前还没有配置进攻阵容" />

        <view v-else class="selected-targets">
          <view v-for="target in selectedTargets" :key="target.id" class="selected-card">
            <view class="option-main">
              <text class="option-name">{{ target.name || '未命名阵容' }}</text>
              <text class="option-desc">{{ target.description || '暂无描述' }}</text>
            </view>
            <button class="mini-btn danger" size="mini" @click="removeTarget(target.id)">移除</button>
          </view>
        </view>
      </view>

      <LineupPickerPanel
        v-model:keyword="targetKeyword"
        title="搜索进攻阵容"
        tip="选择 targetLineups"
        :options="offenseOptions"
        :selected-ids="selectedTargets.map(item => item.id)"
        selection-mode="multiple"
        search-placeholder="搜索进攻阵容"
        loading-text="加载进攻阵容中..."
        empty-text="暂无进攻阵容可选"
        :loading="offenseLoading"
        :disabled="!selectedSource"
        @search="searchOffenseOptions"
        @toggle="toggleTarget" />
    </view>

    <StickyActionBar>
      <button class="submit-btn" :loading="saving" :disabled="saving || !selectedSource" @click="saveRelations">
        保存克制关系
      </button>
    </StickyActionBar>
  </view>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { onLoad } from '@dcloudio/uni-app'
  import LineupPickerPanel from './components/lineup-picker-panel.vue'
  import StateBlock from './components/state-block.vue'
  import StickyActionBar from './components/sticky-action-bar.vue'
  import {
    fetchAdminLineupOptions,
    fetchLineupRelationDetail,
    saveLineupRelation,
    type LineupOption,
  } from '@/services/compendium-lineups'
  import { ensureAdminAccess } from '@/utils/admin'

  const COMPENDIUM_CODE = 'swc'
  const DEFAULT_LOCALE = 'zh-CN'

  const selectedLocale = ref(DEFAULT_LOCALE)
  const sourceKeyword = ref('')
  const targetKeyword = ref('')
  const sourceLineupId = ref('')
  const pageLoading = ref(false)
  const defenseLoading = ref(false)
  const offenseLoading = ref(false)
  const saving = ref(false)
  const errorMessage = ref('')
  const defenseOptions = ref<LineupOption[]>([])
  const offenseOptions = ref<LineupOption[]>([])
  const selectedSource = ref<LineupOption | null>(null)
  const selectedTargets = ref<LineupOption[]>([])

  const buildCurrentUrl = (): string => {
    const params: string[] = [`compendiumId=${encodeURIComponent(COMPENDIUM_CODE)}`, `locale=${encodeURIComponent(selectedLocale.value)}`]
    if (sourceLineupId.value) params.push(`sourceLineupId=${encodeURIComponent(sourceLineupId.value)}`)
    return `/subPackages/tools/compendium/swc/lineup-relations?${params.join('&')}`
  }

  const isTargetSelected = (lineupId: string): boolean =>
    selectedTargets.value.some(item => item.id === lineupId)

  const searchDefenseOptions = async () => {
    defenseLoading.value = true
    try {
      defenseOptions.value = await fetchAdminLineupOptions({
        compendiumId: COMPENDIUM_CODE,
        locale: selectedLocale.value,
        keyword: sourceKeyword.value.trim() || undefined,
        type: 'defense',
        status: 'enabled',
        page: 1,
        pageSize: 20,
      })
    } catch (error) {
      uni.showToast({
        title: typeof error === 'string' ? error : '加载防御阵容失败',
        icon: 'none',
      })
    } finally {
      defenseLoading.value = false
    }
  }

  const searchOffenseOptions = async () => {
    offenseLoading.value = true
    try {
      offenseOptions.value = await fetchAdminLineupOptions({
        compendiumId: COMPENDIUM_CODE,
        locale: selectedLocale.value,
        keyword: targetKeyword.value.trim() || undefined,
        type: 'offense',
        status: 'enabled',
        page: 1,
        pageSize: 20,
      })
    } catch (error) {
      uni.showToast({
        title: typeof error === 'string' ? error : '加载进攻阵容失败',
        icon: 'none',
      })
    } finally {
      offenseLoading.value = false
    }
  }

  const loadRelationDetail = async (lineupId: string) => {
    if (!lineupId) {
      selectedTargets.value = []
      return
    }

    try {
      const detail = await fetchLineupRelationDetail(lineupId, {
        locale: selectedLocale.value,
      })
      selectedSource.value = detail.sourceLineup
      selectedTargets.value = detail.targetLineups
    } catch (error) {
      uni.showToast({
        title: typeof error === 'string' ? error : '加载克制关系失败',
        icon: 'none',
      })
      selectedTargets.value = []
    }
  }

  const selectSource = async (option: LineupOption) => {
    sourceLineupId.value = option.id
    selectedSource.value = option
    await loadRelationDetail(option.id)
  }

  const clearSource = () => {
    sourceLineupId.value = ''
    selectedSource.value = null
    selectedTargets.value = []
  }

  const toggleTarget = (option: LineupOption) => {
    if (!selectedSource.value) return

    if (isTargetSelected(option.id)) {
      selectedTargets.value = selectedTargets.value.filter(item => item.id !== option.id)
      return
    }

    selectedTargets.value = [...selectedTargets.value, option]
  }

  const removeTarget = (lineupId: string) => {
    selectedTargets.value = selectedTargets.value.filter(item => item.id !== lineupId)
  }

  const loadInitialData = async () => {
    pageLoading.value = true
    errorMessage.value = ''

    try {
      await Promise.all([searchDefenseOptions(), searchOffenseOptions()])

      if (sourceLineupId.value) {
        await loadRelationDetail(sourceLineupId.value)
        if (!selectedSource.value) {
          selectedSource.value = defenseOptions.value.find(item => item.id === sourceLineupId.value) || null
        }
      }
    } catch (error) {
      errorMessage.value = typeof error === 'string' ? error : '加载关系配置失败，请稍后重试'
    } finally {
      pageLoading.value = false
    }
  }

  const saveRelations = async () => {
    if (!selectedSource.value || saving.value) return

    saving.value = true
    try {
      const result = await saveLineupRelation({
        compendiumId: COMPENDIUM_CODE,
        sourceLineupId: selectedSource.value.id,
        targetLineupIds: selectedTargets.value.map(item => item.id),
      })

      selectedSource.value = result.sourceLineup
      selectedTargets.value = result.targetLineups

      uni.showToast({
        title: '保存成功',
        icon: 'success',
      })
    } catch (error) {
      uni.showToast({
        title: typeof error === 'string' ? error : '保存失败，请稍后重试',
        icon: 'none',
      })
    } finally {
      saving.value = false
    }
  }

  onLoad((options: Record<string, string | undefined>) => {
    selectedLocale.value = options.locale || DEFAULT_LOCALE
    sourceLineupId.value = options.sourceLineupId || ''

    if (!ensureAdminAccess(buildCurrentUrl())) return

    uni.setNavigationBarTitle({ title: '阵容克制关系' })
    loadInitialData()
  })
</script>

<style scoped lang="scss">
  .relation-page {
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
    padding: 28rpx;
    background: linear-gradient(135deg, #134e4a 0%, #14b8a6 100%);
    color: #fff;
  }

  .hero-title {
    display: block;
    font-size: 36rpx;
    font-weight: 800;
  }

  .hero-subtitle {
    display: block;
    margin-top: 10rpx;
    color: rgba(255, 255, 255, 0.8);
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
    color: #111827;
    font-size: 30rpx;
    font-weight: 800;
  }

  .section-tip {
    color: #667085;
    font-size: 22rpx;
    font-weight: 700;
  }

  .selected-card,
  .option-card {
    display: flex;
    align-items: center;
    gap: 16rpx;
    padding: 20rpx;
    border-radius: 20rpx;
    background: #f8fafc;
  }

  .selected-targets,
  .option-list {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
  }

  .option-main {
    min-width: 0;
    flex: 1;
  }

  .option-name {
    display: block;
    color: #111827;
    font-size: 28rpx;
    font-weight: 700;
  }

  .option-desc {
    display: block;
    margin-top: 8rpx;
    color: #667085;
    font-size: 22rpx;
    line-height: 1.6;
  }

  .mini-btn,
  .submit-btn {
    border-radius: 999rpx;
    font-size: 24rpx;
    font-weight: 700;
  }

  .submit-btn {
    background: #0f766e;
    color: #fff;
  }

  .mini-btn.danger {
    color: #dc2626;
  }

  .state-block,
  .empty-block {
    padding: 48rpx 28rpx;
    text-align: center;
    color: #667085;
    font-size: 28rpx;
  }

  .submit-btn {
    width: 100%;
  }
</style>
