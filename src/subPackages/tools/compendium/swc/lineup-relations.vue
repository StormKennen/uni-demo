<template>
  <view class="relation-page">
    <view class="hero-card">
      <text class="hero-title">阵容映射关系</text>
      <text class="hero-subtitle">为一个源阵容配置多个目标阵容，保存时会整组覆盖；也会展示哪些上游阵容正在引用当前阵容。</text>
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
        title="源阵容"
        tip="选择 sourceLineup"
        :options="sourceOptions"
        :selected-items="selectedSource ? [selectedSource] : []"
        :selected-ids="selectedSource ? [selectedSource.id] : []"
        selected-action-text="清空"
        selected-highlight
        search-placeholder="搜索源阵容"
        loading-text="加载源阵容中..."
        empty-text="暂无源阵容可选"
        :loading="sourceLoading"
        @search="searchSourceOptions"
        @toggle="selectSource"
        @remove="clearSource" />

      <view class="section-card">
        <view class="section-head">
          <text class="section-title">已选目标阵容</text>
          <text class="section-tip">{{ selectedTargets.length }} 个</text>
        </view>

        <StateBlock v-if="!selectedSource" class="empty-block" text="请先选择源阵容" />

        <StateBlock v-else-if="!selectedTargets.length" class="empty-block" text="当前还没有配置目标阵容" />

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

      <view class="section-card">
        <view class="section-head">
          <text class="section-title">上游引用阵容</text>
          <text class="section-tip">{{ incomingLineups.length }} 个</text>
        </view>

        <StateBlock v-if="!selectedSource" class="empty-block" text="请先选择源阵容" />

        <StateBlock v-else-if="!incomingLineups.length" class="empty-block" text="当前没有上游阵容引用它" />

        <view v-else class="selected-targets">
          <view v-for="lineup in incomingLineups" :key="lineup.id" class="selected-card">
            <view class="option-main">
              <text class="option-name">{{ lineup.name || '未命名阵容' }}</text>
              <text class="option-desc">{{ lineup.description || '暂无描述' }}</text>
            </view>
          </view>
        </view>
      </view>

      <LineupPickerPanel
        v-model:keyword="targetKeyword"
        title="搜索目标阵容"
        tip="选择 targetLineups"
        :options="targetOptions"
        :selected-ids="selectedTargets.map(item => item.id)"
        selection-mode="multiple"
        search-placeholder="搜索目标阵容"
        loading-text="加载目标阵容中..."
        empty-text="暂无目标阵容可选"
        :loading="targetLoading"
        :disabled="!selectedSource"
        @search="searchTargetOptions"
        @toggle="toggleTarget" />
    </view>

    <StickyActionBar>
      <button class="submit-btn" :loading="saving" :disabled="saving || !selectedSource" @click="saveRelations"> 保存映射关系 </button>
    </StickyActionBar>
  </view>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { onLoad } from '@dcloudio/uni-app'
  import LineupPickerPanel from './components/lineup-picker-panel.vue'
  import StateBlock from './components/state-block.vue'
  import StickyActionBar from './components/sticky-action-bar.vue'
  import { fetchAdminLineupOptions, fetchLineupRelationDetail, saveLineupRelation, type LineupOption } from '@/services/compendium-lineups'
  import { ensureAdminAccess } from '@/utils/admin'

  const COMPENDIUM_CODE = 'swc'
  const DEFAULT_LOCALE = 'zh-CN'

  const selectedLocale = ref(DEFAULT_LOCALE)
  const sourceKeyword = ref('')
  const targetKeyword = ref('')
  const sourceLineupId = ref('')
  const pageLoading = ref(false)
  const sourceLoading = ref(false)
  const targetLoading = ref(false)
  const saving = ref(false)
  const errorMessage = ref('')
  const sourceOptions = ref<LineupOption[]>([])
  const rawTargetOptions = ref<LineupOption[]>([])
  const selectedSource = ref<LineupOption | null>(null)
  const selectedTargets = ref<LineupOption[]>([])
  const incomingLineups = ref<LineupOption[]>([])

  const targetOptions = computed(() => rawTargetOptions.value.filter(option => option.id && option.id !== selectedSource.value?.id))

  const buildCurrentUrl = (): string => {
    const params: string[] = [`compendiumId=${encodeURIComponent(COMPENDIUM_CODE)}`, `locale=${encodeURIComponent(selectedLocale.value)}`]
    if (sourceLineupId.value) params.push(`sourceLineupId=${encodeURIComponent(sourceLineupId.value)}`)
    return `/subPackages/tools/compendium/swc/lineup-relations?${params.join('&')}`
  }

  const isTargetSelected = (lineupId: string): boolean => selectedTargets.value.some(item => item.id === lineupId)

  const searchSourceOptions = async () => {
    sourceLoading.value = true
    try {
      sourceOptions.value = await fetchAdminLineupOptions({
        compendiumId: COMPENDIUM_CODE,
        locale: selectedLocale.value,
        keyword: sourceKeyword.value.trim() || undefined,
        status: 'enabled',
        page: 1,
        pageSize: 20,
      })
    } catch (error) {
      uni.showToast({
        title: typeof error === 'string' ? error : '加载源阵容失败',
        icon: 'none',
      })
    } finally {
      sourceLoading.value = false
    }
  }

  const searchTargetOptions = async () => {
    targetLoading.value = true
    try {
      rawTargetOptions.value = await fetchAdminLineupOptions({
        compendiumId: COMPENDIUM_CODE,
        locale: selectedLocale.value,
        keyword: targetKeyword.value.trim() || undefined,
        status: 'enabled',
        page: 1,
        pageSize: 20,
      })
    } catch (error) {
      uni.showToast({
        title: typeof error === 'string' ? error : '加载目标阵容失败',
        icon: 'none',
      })
    } finally {
      targetLoading.value = false
    }
  }

  const loadRelationDetail = async (lineupId: string) => {
    if (!lineupId) {
      selectedTargets.value = []
      incomingLineups.value = []
      return
    }

    try {
      const detail = await fetchLineupRelationDetail(lineupId, {
        locale: selectedLocale.value,
      })
      selectedSource.value = detail.sourceLineup
      selectedTargets.value = detail.targetLineups
      incomingLineups.value = detail.incomingLineups
    } catch (error) {
      uni.showToast({
        title: typeof error === 'string' ? error : '加载映射关系失败',
        icon: 'none',
      })
      selectedTargets.value = []
      incomingLineups.value = []
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
    incomingLineups.value = []
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
      await Promise.all([searchSourceOptions(), searchTargetOptions()])

      if (sourceLineupId.value) {
        await loadRelationDetail(sourceLineupId.value)
        if (!selectedSource.value) {
          selectedSource.value = sourceOptions.value.find(item => item.id === sourceLineupId.value) || null
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
      incomingLineups.value = result.incomingLineups

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

    uni.setNavigationBarTitle({ title: '阵容映射关系' })
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
