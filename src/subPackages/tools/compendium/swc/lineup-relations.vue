<template>
  <view class="relation-page">
    <view class="hero-card">
      <text class="hero-title">防御阵容 -> 进攻阵容</text>
      <text class="hero-subtitle">为一个防御阵容配置多个可克制它的进攻阵容，保存时会整组覆盖。</text>
    </view>

    <view v-if="pageLoading" class="state-block">
      <text>加载关系配置中...</text>
    </view>

    <view v-else-if="errorMessage" class="state-block">
      <text>{{ errorMessage }}</text>
      <button class="action-btn primary" @click="loadInitialData">重新加载</button>
    </view>

    <view v-else class="content">
      <view class="section-card">
        <view class="section-head">
          <text class="section-title">防御阵容</text>
          <text class="section-tip">选择 sourceLineup</text>
        </view>

        <view class="search-row">
          <input
            v-model="sourceKeyword"
            class="field-input"
            confirm-type="search"
            placeholder="搜索防御阵容"
            @confirm="searchDefenseOptions" />
          <button class="action-btn primary" size="mini" @click="searchDefenseOptions">搜索</button>
        </view>

        <view v-if="selectedSource" class="selected-source-card">
          <view class="source-main">
            <text class="source-name">{{ selectedSource.name }}</text>
            <text class="source-desc">{{ selectedSource.description || '暂无描述' }}</text>
          </view>
          <button class="mini-btn danger" size="mini" @click="clearSource">清空</button>
        </view>

        <view v-if="defenseLoading && !defenseOptions.length" class="empty-block">
          <text>加载防御阵容中...</text>
        </view>

        <view v-else-if="!defenseOptions.length" class="empty-block">
          <text>暂无防御阵容可选</text>
        </view>

        <view v-else class="option-list">
          <view v-for="option in defenseOptions" :key="option.id" class="option-card">
            <view class="option-main">
              <text class="option-name">{{ option.name || '未命名阵容' }}</text>
              <text class="option-desc">{{ option.description || '暂无描述' }}</text>
            </view>
            <button class="mini-btn" size="mini" @click="selectSource(option)">
              {{ selectedSource?.id === option.id ? '当前已选' : '选择' }}
            </button>
          </view>
        </view>
      </view>

      <view class="section-card">
        <view class="section-head">
          <text class="section-title">已选进攻阵容</text>
          <text class="section-tip">{{ selectedTargets.length }} 个</text>
        </view>

        <view v-if="!selectedSource" class="empty-block">
          <text>请先选择防御阵容</text>
        </view>

        <view v-else-if="!selectedTargets.length" class="empty-block">
          <text>当前还没有配置进攻阵容</text>
        </view>

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
          <text class="section-title">搜索进攻阵容</text>
          <text class="section-tip">选择 targetLineups</text>
        </view>

        <view class="search-row">
          <input
            v-model="targetKeyword"
            class="field-input"
            confirm-type="search"
            placeholder="搜索进攻阵容"
            @confirm="searchOffenseOptions" />
          <button class="action-btn primary" size="mini" @click="searchOffenseOptions">搜索</button>
        </view>

        <view v-if="offenseLoading && !offenseOptions.length" class="empty-block">
          <text>加载进攻阵容中...</text>
        </view>

        <view v-else-if="!offenseOptions.length" class="empty-block">
          <text>暂无进攻阵容可选</text>
        </view>

        <view v-else class="option-list">
          <view v-for="option in offenseOptions" :key="option.id" class="option-card">
            <view class="option-main">
              <text class="option-name">{{ option.name || '未命名阵容' }}</text>
              <text class="option-desc">{{ option.description || '暂无描述' }}</text>
            </view>
            <button
              class="mini-btn"
              size="mini"
              :disabled="!selectedSource"
              @click="toggleTarget(option)">
              {{ isTargetSelected(option.id) ? '移除' : '添加' }}
            </button>
          </view>
        </view>
      </view>
    </view>

    <view class="bottom-bar">
      <button class="submit-btn" :loading="saving" :disabled="saving || !selectedSource" @click="saveRelations">
        保存克制关系
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { onLoad } from '@dcloudio/uni-app'
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

  .search-row {
    display: flex;
    align-items: center;
    gap: 14rpx;
    margin-bottom: 20rpx;
  }

  .field-input {
    flex: 1;
    height: 76rpx;
    padding: 0 24rpx;
    border-radius: 18rpx;
    background: #f3f5f9;
    font-size: 28rpx;
  }

  .selected-source-card,
  .selected-card,
  .option-card {
    display: flex;
    align-items: center;
    gap: 16rpx;
    padding: 20rpx;
    border-radius: 20rpx;
    background: #f8fafc;
  }

  .selected-source-card {
    margin-bottom: 18rpx;
    background: #ecfeff;
  }

  .selected-targets,
  .option-list {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
  }

  .source-main,
  .option-main {
    min-width: 0;
    flex: 1;
  }

  .source-name,
  .option-name {
    display: block;
    color: #111827;
    font-size: 28rpx;
    font-weight: 700;
  }

  .source-desc,
  .option-desc {
    display: block;
    margin-top: 8rpx;
    color: #667085;
    font-size: 22rpx;
    line-height: 1.6;
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
