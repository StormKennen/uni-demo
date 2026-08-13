<template>
  <PageLayout title="魔灵召唤阵容" nav-init-bg-color="var(--theme-surface)" nav-divider>
    <view class="lineup-page">
      <template>
        <!-- <view class="hero-banner">
          <view>
            <text class="hero-title">魔灵召唤阵容</text>
            <text class="hero-subtitle">{{
              isAdmin ? '管理阵容类型与映射关系，支持一个阵容对应多个目标阵容。' : '浏览大家分享的阵容，登录后可发布并管理自己的阵容。'
            }}</text>
          </view>
          <text v-if="isAdmin" class="hero-badge">ADMIN</text>
        </view> -->

        <!-- <view class="mapping-entry" @click="goMappings()">
          <view class="mapping-entry-main">
            <text class="mapping-entry-title">阵容映射</text>
            <text class="mapping-entry-desc">查看「源阵容 → 目标阵容」的容器化映射，支持新增与容器内点赞点踩</text>
          </view>
          <text class="mapping-entry-arrow">›</text>
        </view> -->

        <view class="toolbar-card">
          <SearchActionRow v-model="keyword" class="search-row" placeholder="搜索阵容名称或描述" theme="amber" @search="refreshList" />

          <view class="filter-group">
            <text class="filter-label">类型</text>
            <view class="chip-row">
              <text
                v-for="option in lineupTypeOptions"
                :key="option.value"
                class="chip"
                :class="{ active: selectedType === option.value }"
                @click="selectType(option.value)">
                {{ option.label }}
              </text>
            </view>
          </view>

          <view class="filter-group">
            <text class="filter-label">范围</text>
            <view class="chip-row">
              <text
                v-for="option in LINEUP_SCOPE_OPTIONS"
                :key="option.value"
                class="chip"
                :class="{ active: selectedScope === option.value }"
                @click="selectScope(option.value)">
                {{ option.label }}
              </text>
            </view>
          </view>

          <view v-if="isAdmin" class="filter-group">
            <text class="filter-label">状态</text>
            <view class="chip-row">
              <text
                v-for="option in LINEUP_FILTER_STATUS_OPTIONS"
                :key="option.value"
                class="chip"
                :class="{ active: selectedStatus === option.value }"
                @click="selectStatus(option.value)">
                {{ option.label }}
              </text>
            </view>
          </view>

          <view class="filter-group">
            <view class="filter-head">
              <text class="filter-label">人物</text>
              <text v-if="selectedCharacterFilters.length" class="filter-count">已选 {{ selectedCharacterFilters.length }}</text>
            </view>

            <SwcCharacterPickerSlots
              class="character-picker-slots"
              :characters="selectedCharacterViews"
              :max-count="0"
              :size="120"
              @add="openCharacterPicker"
              @remove="handleRemoveCharacterFilter" />

            <text class="filter-helper">阵容需同时包含全部所选人物</text>

            <view class="filter-action-row">
              <button class="reset-btn" size="mini" :disabled="!hasResettableFilters" @click="resetFilters">重置</button>
            </view>
          </view>

          <view class="action-row counter-entry-row">
            <button class="toolbar-btn primary" :disabled="!selectedCharacterFilters.length" @click="goLineupCounter">查看阵容克制</button>
          </view>
        </view>

        <StateBlock v-if="loading && !lineups.length" class="state-card" text="加载阵容中..." />

        <StateBlock
          v-else-if="errorMessage && !lineups.length"
          class="state-card"
          :text="errorMessage"
          action-text="重新加载"
          theme="amber"
          @action="refreshList" />

        <view v-else class="content">
          <view class="summary-row">
            <text class="summary-text">共 {{ pagination.total }} 条阵容</text>
            <text class="summary-text">{{
              isAdmin
                ? `当前 ${selectedScopeLabel} / ${selectedTypeLabel} / ${selectedStatusLabel} / ${selectedCharacterLabel}`
                : `当前 ${selectedScopeLabel} / ${selectedTypeLabel} / ${selectedCharacterLabel}`
            }}</text>
          </view>

          <StateBlock v-if="!lineups.length" class="state-card" :text="emptyScopeText" />

          <view v-for="lineup in lineups" :key="lineup.id" class="lineup-card">
            <view class="lineup-ribbons">
              <text class="type-badge" :class="getLineupTypeToneClass(lineup.type)">{{ getLineupTypeLabel(lineup.type) }}</text>
              <text v-if="isAdmin" class="status-badge" :class="lineup.status">{{ getLineupStatusLabel(lineup.status) }}</text>
            </view>

            <view class="lineup-head">
              <view class="lineup-title-wrap">
                <text v-if="lineup.name" class="lineup-name">{{ lineup.name }}</text>
              </view>
            </view>

            <text v-if="lineup.description" class="lineup-desc">{{ lineup.description }}</text>

            <text v-if="lineup.createdAt" class="lineup-origin">
              {{ lineup.source === 'user' ? (lineup.canEdit ? '我创建的' : '玩家创建') : '系统阵容' }} · {{ formatDate(lineup.createdAt) }}
            </text>

            <view v-if="isAdmin" class="metric-row" aria-label="阵容统计">
              <text class="metric-item">
                成员 <text class="metric-value">{{ lineup.memberCount }}</text>
              </text>
              <text class="metric-item">
                进攻 <text class="metric-value">{{ lineup.targetLineupsCount }}</text>
              </text>
              <text class="metric-item">
                防御 <text class="metric-value">{{ lineup.sourceLineupsCount }}</text>
              </text>
            </view>

            <SwcLineup
              v-if="lineup.characters.length"
              class="lineup-members"
              :characters="toMemberViews(lineup.characters)"
              :columns="5"
              :avatar-size="92"
              :show-member-name="false"
              :show-family="false"
              :show-stars="true"
              star-position="above"
              :show-element="true"
              :show-member-type="true"
              empty-text="暂无成员" />

            <view class="lineup-footer">
              <LineupInteractionBar
                :like-count="lineup.likeCount"
                :dislike-count="lineup.dislikeCount"
                :score="lineup.score"
                :my-reaction="lineup.myReaction"
                :favorite-count="lineup.favoriteCount"
                :is-favorite="lineup.isFavorited"
                :disabled="reactingId === lineup.id || favoritingIds.has(lineup.id)"
                @like="handleLike(lineup)"
                @dislike="handleDislike(lineup)"
                @favorite="handleFavorite(lineup)" />

              <view v-if="isAdmin || canEditLineup(lineup)" class="card-actions">
                <button class="card-btn primary" size="mini" @click="goEdit(lineup.id)">编辑</button>
                <button v-if="isAdmin" class="card-btn" size="mini" @click="goRelations(lineup.id)">映射</button>
                <button
                  v-if="isAdmin"
                  class="card-btn danger"
                  size="mini"
                  :loading="deletingId === lineup.id"
                  @click="confirmDelete(lineup.id)">
                  删除
                </button>
              </view>
            </view>
          </view>

          <view class="load-more-status">
            <text>{{ loadingMore ? '正在加载更多...' : pagination.hasNext ? '继续上拉加载更多' : '已加载全部阵容' }}</text>
          </view>
        </view>

        <view class="fab" @click="goCreate">
          <text class="fab-icon">+</text>
          <text class="fab-text">{{ isLoggedIn ? '新增阵容' : '登录发布' }}</text>
        </view>
      </template>
    </view>
  </PageLayout>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { onLoad, onShow, onPullDownRefresh, onReachBottom, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
  import type {
    LineupCharacterPreview,
    LineupReactionRequest,
    LineupScope,
    LineupTypeOption,
    ReactionValue,
    UserLineupSummary,
  } from './lineup-types'
  import { normalizeLineupTypes, normalizeReactionResult } from './lineup-normalizers'
  import { buildAnonymousRequestConfig } from './request-options'
  import SearchActionRow from './components/search-action-row.vue'
  import StateBlock from './components/state-block.vue'
  import SwcCharacterPickerSlots from './components/swc-character-picker-slots.vue'
  import SwcLineup from './components/swc-lineup.vue'
  import LineupInteractionBar from './components/lineup-interaction-bar.vue'
  import {
    ALL_VALUE,
    getLineupTypeToneClass,
    getLineupStatusLabel,
    getLineupTypeLabel,
    LINEUP_FILTER_STATUS_OPTIONS,
    LINEUP_TYPE_PRESET_OPTIONS,
  } from './lineup-meta'
  import { useAdminLineupList } from './composables/use-admin-lineup-list'
  import { toSwcCharacterView } from './utils'
  import { buildSwcLineupsShare } from './share'
  import { canManageLineup, ensureLoginAccess, ensureLineupFeatureAccess, isAdminUser } from '@/utils/admin'
  import { getStorageSync, getToken, removeStorageSync, setStorageSync } from '@/utils/storage'
  import { getAnonymousId } from '@/utils/anonymous-id'
  import {
    deleteCompendiumsLineupsLineupId,
    getAdminLineupsTypes,
    postLineupsLineupIdReaction,
  } from '@/services/apifox/NODEJSDEMO/COMPENDIUMLINEUPS/apifox'
  import { reportToolVisit } from '@/utils/tracker'

  const COMPENDIUM_CODE = 'swc'
  const DEFAULT_LOCALE = 'zh-CN'
  const CHARACTER_PICKER_CACHE_KEY = 'compendium:swc:lineups:character-picker:draft'
  const CHARACTER_PICKER_RESULT_KEY = 'compendium:swc:lineups:character-picker:result'
  const LINEUP_COUNTER_PREFILL_KEY = 'compendium:swc:lineup-counter:prefill'
  const LINEUP_COUNTER_PICKER_RESULT_KEY = 'compendium:swc:lineup-counter:character-picker:result'
  const LINEUP_SCOPE_OPTIONS = [
    { label: '全部', value: 'all' },
    { label: '我创建的', value: 'mine' },
    { label: '我的收藏', value: 'favorites' },
  ] as const
  const selectedLocale = ref(DEFAULT_LOCALE)
  const dynamicLineupTypes = ref<LineupTypeOption[]>([])
  const {
    keyword,
    selectedType,
    selectedStatus,
    selectedScope,
    selectedCharacterFilters,
    lineups,
    pagination,
    loading,
    loadingMore,
    errorMessage,
    selectedTypeLabel,
    selectedStatusLabel,
    selectedScopeLabel,
    selectedCharacterLabel,
    buildCurrentUrl,
    refreshList,
    loadMore,
    selectType,
    selectStatus,
    selectScope: selectScopeState,
    removeCharacterFilter,
    resetFilters: resetLineupFilters,
    applyRouteQuery,
  } = useAdminLineupList({
    compendiumId: COMPENDIUM_CODE,
    locale: selectedLocale,
  })
  const deletingId = ref('')
  const reactingId = ref('')
  const favoritingIds = ref(new Set<string>())
  const isAdmin = computed(() => isAdminUser())
  const isLoggedIn = computed(() => !!getToken())
  const selectedCharacterViews = computed(() => selectedCharacterFilters.value.map(item => toSwcCharacterView(item)))
  const hasResettableFilters = computed(
    () =>
      Boolean(keyword.value.trim()) ||
      selectedType.value !== ALL_VALUE ||
      selectedStatus.value !== ALL_VALUE ||
      selectedScope.value !== 'all' ||
      selectedCharacterFilters.value.length > 0,
  )
  const resetFilters = () => resetLineupFilters()
  const canEditLineup = (lineup: UserLineupSummary): boolean => isAdmin.value || canManageLineup(lineup)
  const emptyScopeText = computed(() => {
    if (selectedScope.value === 'mine') return '暂无自己创建的阵容'
    if (selectedScope.value === 'favorites') return '暂无收藏阵容'
    return '暂无符合条件的阵容'
  })
  const toMemberViews = (characters: LineupCharacterPreview[]) => characters.map(item => toSwcCharacterView(item))

  const handleRemoveCharacterFilter = (character: { characterId: string }) => {
    removeCharacterFilter(character.characterId)
  }
  const lineupTypeOptions = computed(() => {
    if (isAdmin.value) {
      return [
        { label: '全部', value: ALL_VALUE },
        ...dynamicLineupTypes.value.map(option => ({
          label: option.count > 0 ? `${option.label} (${option.count})` : option.label,
          value: option.value,
        })),
      ]
    }

    const seen = new Set<string>()
    const derived: Array<{ label: string; value: string }> = []
    const pushType = (value: string) => {
      const type = (value || '').trim()
      if (!type || seen.has(type)) return
      seen.add(type)
      derived.push({ label: getLineupTypeLabel(type), value: type })
    }
    LINEUP_TYPE_PRESET_OPTIONS.forEach(option => pushType(option.value))
    lineups.value.forEach(lineup => pushType(lineup.type))
    return [{ label: '全部', value: ALL_VALUE }, ...derived]
  })

  const loadLineupTypes = async () => {
    if (!isAdmin.value) {
      dynamicLineupTypes.value = []
      return
    }
    try {
      dynamicLineupTypes.value = normalizeLineupTypes(await getAdminLineupsTypes({ compendiumId: COMPENDIUM_CODE }, {}))
    } catch (error) {
      dynamicLineupTypes.value = []
    }
  }

  const openCharacterPicker = () => {
    setStorageSync(
      CHARACTER_PICKER_CACHE_KEY,
      selectedCharacterFilters.value.map(item => ({ ...item })),
    )
    removeStorageSync(CHARACTER_PICKER_RESULT_KEY)
    const selectedCharacterIds = selectedCharacterFilters.value.map(item => item.characterId).filter(Boolean)

    uni.navigateTo({
      url:
        `/subPackages/tools/compendium/swc/character-picker?compendiumId=${encodeURIComponent(COMPENDIUM_CODE)}` +
        `&locale=${encodeURIComponent(selectedLocale.value)}` +
        `&cacheKey=${encodeURIComponent(CHARACTER_PICKER_CACHE_KEY)}` +
        `&resultKey=${encodeURIComponent(CHARACTER_PICKER_RESULT_KEY)}` +
        `&selectedCharacterIds=${encodeURIComponent(selectedCharacterIds.join(','))}`,
    })
  }

  const goCreate = () => {
    if (!ensureLoginAccess(buildCurrentUrl())) return
    uni.navigateTo({
      url: `/subPackages/tools/compendium/swc/lineup-edit?compendiumId=${encodeURIComponent(COMPENDIUM_CODE)}&locale=${encodeURIComponent(selectedLocale.value)}`,
    })
  }

  const goEdit = (lineupId: string) => {
    const lineup = lineups.value.find(item => item.id === lineupId)
    if (!lineup || !canEditLineup(lineup)) return
    if (!ensureLoginAccess(buildCurrentUrl())) return
    uni.navigateTo({
      url: `/subPackages/tools/compendium/swc/lineup-edit?lineupId=${encodeURIComponent(lineupId)}&compendiumId=${encodeURIComponent(COMPENDIUM_CODE)}&locale=${encodeURIComponent(selectedLocale.value)}`,
    })
  }

  const goRelations = (sourceLineupId = '') => {
    if (!isAdmin.value) return
    if (!ensureLineupFeatureAccess(buildCurrentUrl())) return
    const params = [`compendiumId=${encodeURIComponent(COMPENDIUM_CODE)}`, `locale=${encodeURIComponent(selectedLocale.value)}`]
    if (sourceLineupId) params.push(`sourceLineupId=${encodeURIComponent(sourceLineupId)}`)
    uni.navigateTo({
      url: `/subPackages/tools/compendium/swc/lineup-relations?${params.join('&')}`,
    })
  }

  const goLineupCounter = () => {
    if (!selectedCharacterFilters.value.length) return
    const params = [
      `compendiumId=${encodeURIComponent(COMPENDIUM_CODE)}`,
      `locale=${encodeURIComponent(selectedLocale.value)}`,
      'prefill=1',
    ]
    const characterIds = selectedCharacterFilters.value.map(item => item.characterId).filter(Boolean)
    if (characterIds.length) params.push(`characterIds=${encodeURIComponent(characterIds.join(','))}`)
    const targetUrl = `/subPackages/tools/compendium/swc/lineup-counter?${params.join('&')}`

    removeStorageSync(LINEUP_COUNTER_PICKER_RESULT_KEY)
    setStorageSync(
      LINEUP_COUNTER_PREFILL_KEY,
      selectedCharacterFilters.value.map(item => ({ ...item })),
    )
    uni.navigateTo({ url: targetUrl })
  }

  const confirmDelete = (lineupId: string) => {
    if (!isAdmin.value) return
    uni.showModal({
      title: '删除阵容',
      content: '删除后会同时移除关联的克制关系，确认继续吗？',
      success: async res => {
        if (!res.confirm) return
        deletingId.value = lineupId
        try {
          await deleteCompendiumsLineupsLineupId(lineupId, buildAnonymousRequestConfig())
          uni.showToast({
            title: '删除成功',
            icon: 'success',
          })
          refreshList()
        } catch (error) {
          uni.showToast({
            title: resolveReactionError(error, '删除失败，请稍后重试'),
            icon: 'none',
          })
        } finally {
          deletingId.value = ''
        }
      },
    })
  }

  const resolveReactionError = (error: unknown, fallback: string): string => {
    const status = (error as { code?: number; statusCode?: number })?.code ?? (error as { statusCode?: number })?.statusCode
    if (status === 403) return '无权操作该阵容'
    return typeof error === 'string' ? error : fallback
  }

  const buildShareQuery = () => ({
    compendiumId: COMPENDIUM_CODE,
    locale: selectedLocale.value,
    type: selectedType.value !== ALL_VALUE ? selectedType.value : undefined,
    status: isAdmin.value && selectedStatus.value !== ALL_VALUE ? selectedStatus.value : undefined,
    characterIds: selectedCharacterFilters.value.length
      ? selectedCharacterFilters.value
          .map(item => item.characterId)
          .filter(Boolean)
          .join(',')
      : undefined,
  })

  type GeneratedReactionBody = Parameters<typeof postLineupsLineupIdReaction>[1]

  const toGeneratedReactionBody = (body: LineupReactionRequest): GeneratedReactionBody => body as unknown as GeneratedReactionBody

  const handleReaction = async (lineup: UserLineupSummary, value: ReactionValue) => {
    if (reactingId.value) return
    reactingId.value = lineup.id
    try {
      const result = normalizeReactionResult(
        await postLineupsLineupIdReaction(
          lineup.id,
          toGeneratedReactionBody({ value, anonymousId: getAnonymousId() }),
          buildAnonymousRequestConfig(),
        ),
        lineup.id,
      )
      lineup.likeCount = result.likeCount
      lineup.dislikeCount = result.dislikeCount
      lineup.score = result.score
      lineup.myReaction = result.myReaction
      lineup.favoriteCount = result.favoriteCount
      lineup.isFavorited = result.isFavorited
    } catch (error) {
      uni.showToast({
        title: typeof error === 'string' ? error : '操作失败，请稍后重试',
        icon: 'none',
      })
    } finally {
      reactingId.value = ''
    }
  }

  const handleLike = (lineup: UserLineupSummary) => {
    void handleReaction(lineup, 1)
  }

  const handleDislike = (lineup: UserLineupSummary) => {
    void handleReaction(lineup, -1)
  }

  const handleFavorite = async (lineup: UserLineupSummary) => {
    if (!ensureLoginAccess(buildCurrentUrl())) return
    if (favoritingIds.value.has(lineup.id)) return
    favoritingIds.value.add(lineup.id)
    try {
      const result = normalizeReactionResult(
        await postLineupsLineupIdReaction(lineup.id, toGeneratedReactionBody({ action: 'favorite' }), buildAnonymousRequestConfig()),
        lineup.id,
      )
      lineup.favoriteCount = result.favoriteCount
      lineup.isFavorited = result.isFavorited
    } catch (error) {
      uni.showToast({ title: typeof error === 'string' ? error : '收藏操作失败，请稍后重试', icon: 'none' })
    } finally {
      favoritingIds.value.delete(lineup.id)
    }
  }

  const selectScope = (scope: LineupScope) => {
    if (scope !== 'all' && !ensureLoginAccess(buildCurrentUrl({ scope }))) return
    selectScopeState(scope)
  }

  const formatDate = (value: string): string => {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value.slice(0, 10)
    const pad = (part: number) => String(part).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  }

  onShow(() => {
    reportToolVisit('compendium-lineups')

    const pickerResult = getStorageSync(CHARACTER_PICKER_RESULT_KEY)
    if (Array.isArray(pickerResult)) {
      selectedCharacterFilters.value = pickerResult.map(item => ({ ...item }))
      removeStorageSync(CHARACTER_PICKER_RESULT_KEY)
      refreshList()
    }
  })

  onLoad((options: Record<string, string | undefined>) => {
    selectedLocale.value = options.locale || DEFAULT_LOCALE
    applyRouteQuery(options)

    if (selectedScope.value !== 'all' && !ensureLoginAccess(buildCurrentUrl())) return

    uni.setNavigationBarTitle({ title: '魔灵召唤阵容' })
    loadLineupTypes()
    refreshList()
  })

  onPullDownRefresh(() => {
    refreshList()
  })

  onReachBottom(() => {
    loadMore()
  })

  // #ifdef MP-WEIXIN
  onShareAppMessage(() => buildSwcLineupsShare(buildShareQuery()).app)
  onShareTimeline(() => buildSwcLineupsShare(buildShareQuery()).timeline)
  // #endif
</script>

<style scoped lang="scss">
  .lineup-page {
    min-height: 100vh;
    background: var(--theme-bg);
    color: var(--theme-text);
    padding-bottom: 180rpx;
  }

  .hero-banner {
    margin: 24rpx;
    padding: 28rpx;
    border-radius: 28rpx;
    background: linear-gradient(135deg, #1f2937 0%, #92400e 100%);
    color: #fff;
    display: flex;
    justify-content: space-between;
    gap: 20rpx;
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
    line-height: 1.6;
  }

  .hero-badge {
    align-self: flex-start;
    padding: 8rpx 16rpx;
    border-radius: 999rpx;
    background: rgba(255, 255, 255, 0.14);
    font-size: 22rpx;
    font-weight: 800;
  }

  .toolbar-card,
  .lineup-card {
    margin: 0 24rpx 20rpx;
    background: var(--theme-surface);
    border: 1rpx solid var(--theme-border);
    border-radius: 24rpx;
    box-shadow: 0 10rpx 30rpx var(--theme-shadow-xs);
  }

  .mapping-entry {
    margin: 0 24rpx 20rpx;
    padding: 26rpx 28rpx;
    border-radius: 24rpx;
    background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
    box-shadow: 0 12rpx 30rpx rgba(15, 118, 110, 0.28);
  }

  .mapping-entry-main {
    min-width: 0;
    flex: 1;
  }

  .mapping-entry-title {
    display: block;
    font-size: 32rpx;
    font-weight: 800;
  }

  .mapping-entry-desc {
    display: block;
    margin-top: 8rpx;
    font-size: 22rpx;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.85);
  }

  .mapping-entry-arrow {
    font-size: 44rpx;
    font-weight: 300;
    line-height: 1;
  }

  .toolbar-card {
    padding: 24rpx;
  }

  .action-row,
  .summary-row,
  .lineup-head,
  .metric-row,
  .card-actions {
    display: flex;
    align-items: center;
    gap: 16rpx;
  }

  .search-row {
    margin-bottom: 24rpx;
  }

  .filter-group + .filter-group {
    margin-top: 20rpx;
  }

  .filter-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
  }

  .filter-label {
    display: block;
    margin-bottom: 12rpx;
    font-size: 24rpx;
    color: var(--theme-text-secondary);
    font-weight: 700;
  }

  .filter-head .filter-label {
    margin-bottom: 0;
  }

  .filter-helper {
    display: block;
    margin-top: 12rpx;
    color: var(--theme-text-tertiary);
    font-size: 22rpx;
    font-weight: 700;
  }

  .filter-count {
    color: var(--theme-brand);
    font-size: 22rpx;
    font-weight: 800;
  }

  .character-picker-slots {
    margin-top: 16rpx;
  }

  .chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
  }

  .chip {
    padding: 12rpx 22rpx;
    border-radius: 999rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text-secondary);
    border: 1rpx solid var(--theme-border);
    font-size: 24rpx;
    font-weight: 700;
  }

  .chip.active {
    background: #f59e0b;
    color: #fff;
  }

  .action-row {
    margin-top: 24rpx;
  }

  .toolbar-btn,
  .card-btn,
  .mini-btn {
    border-radius: 999rpx;
    font-size: 24rpx;
    font-weight: 700;
  }

  .toolbar-btn.primary,
  .card-btn.primary {
    border-color: var(--theme-brand);
    background: var(--theme-brand);
    color: #fff;
  }

  .card-btn.danger {
    color: #dc2626;
  }

  .content {
    padding-bottom: 24rpx;
  }

  .summary-row {
    justify-content: space-between;
    margin: 0 24rpx 16rpx;
  }

  .summary-text {
    color: var(--theme-text-secondary);
    font-size: 24rpx;
    font-weight: 700;
  }

  .state-card {
    width: calc(100% - 48rpx);
    margin: 0 24rpx 20rpx;
    box-sizing: border-box;
    border: 1rpx solid var(--theme-border);
    border-radius: 24rpx;
    background: var(--theme-surface);
    padding: 48rpx 28rpx;
    min-height: 168rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: var(--theme-text-secondary);
    font-size: 28rpx;
    box-shadow: 0 10rpx 30rpx var(--theme-shadow-xs);
  }

  .lineup-card {
    position: relative;
    padding: 18rpx 20rpx;
    overflow: hidden;
  }

  .lineup-ribbons {
    position: absolute;
    top: 14rpx;
    right: 16rpx;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6rpx;
    max-width: 46%;
  }

  .lineup-head {
    justify-content: space-between;
    align-items: flex-start;
    padding-right: 132rpx;
    min-height: 42rpx;
  }

  .lineup-title-wrap {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    gap: 10rpx;
    align-items: center;
  }

  .lineup-name {
    font-size: 29rpx;
    font-weight: 800;
    color: var(--theme-text);
    line-height: 1.3;
  }

  .lineup-count,
  .type-badge,
  .status-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    white-space: nowrap;
    font-size: 20rpx;
    font-weight: 800;
    line-height: 1;
  }

  .type-badge {
    max-width: 100%;
    min-height: 42rpx;
    padding: 0 14rpx;
    overflow: hidden;
    border-radius: 999rpx;
    color: #fff;
    text-overflow: ellipsis;
  }

  .type-badge.offense {
    background: #0284c7;
  }

  .type-badge.defense {
    background: #7c3aed;
  }

  .type-badge.custom {
    background: #0f766e;
  }

  .status-badge {
    height: 38rpx;
    margin-top: 6rpx;
    padding: 0 10rpx;
    border-radius: 999rpx;
    font-size: 18rpx;
  }

  .status-badge.enabled {
    background: #dcfce7;
    color: #15803d;
  }

  .status-badge.disabled {
    background: #fee2e2;
    color: #b91c1c;
  }

  .lineup-count {
    background: var(--theme-surface-2);
    color: var(--theme-text-secondary);
  }

  .lineup-desc {
    display: block;
    margin-top: 8rpx;
    color: var(--theme-text-secondary);
    font-size: 22rpx;
    line-height: 1.45;
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .lineup-origin {
    display: block;
    margin-top: 8rpx;
    color: var(--theme-text-tertiary);
    font-size: 20rpx;
  }

  .metric-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8rpx;
    margin-top: 10rpx;
  }

  .metric-item {
    padding: 4rpx 10rpx;
    border-radius: 6rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text-tertiary);
    font-size: 19rpx;
    line-height: 1.4;
  }

  .metric-value {
    margin-left: 4rpx;
    color: var(--theme-text);
    font-size: 21rpx;
    font-weight: 800;
  }

  .lineup-members {
    margin-top: 12rpx;
  }

  .mini-btn.danger {
    color: #dc2626;
  }

  .lineup-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12rpx;
    margin-top: 12rpx;
  }

  .card-actions {
    flex-shrink: 0;
    justify-content: flex-end;
    gap: 8rpx;
  }

  .card-btn {
    min-height: 50rpx;
    margin: 0;
    padding: 0 14rpx;
    font-size: 20rpx;
    line-height: 50rpx;
  }

  .reaction-row {
    display: flex;
    align-items: center;
    gap: 8rpx;
    min-width: 0;
  }

  .reaction-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 72rpx;
    min-height: 48rpx;
    padding: 0 14rpx;
    border-radius: 999rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text-secondary);
    border: 1rpx solid var(--theme-border);
    font-size: 21rpx;
    font-weight: 700;
  }

  .reaction-btn:active {
    opacity: 0.7;
  }

  .reaction-btn.active {
    background: #fef3c7;
    color: #b45309;
  }

  .reaction-score {
    margin-left: auto;
    color: var(--theme-text-tertiary);
    font-size: 22rpx;
    font-weight: 700;
  }

  .filter-action-row {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    min-height: 56rpx;
    margin-top: 12rpx;
  }

  .counter-entry-row {
    display: block;
  }

  .counter-entry-row .toolbar-btn {
    width: 100%;
  }

  .reset-btn {
    width: auto;
    min-width: 96rpx;
    height: 56rpx;
    margin: 0;
    padding: 0 12rpx;
    border: 0;
    background: transparent;
    color: var(--theme-brand);
    font-size: 22rpx;
    line-height: 56rpx;
  }

  .reset-btn[disabled],
  .toolbar-btn[disabled] {
    opacity: 0.45;
  }

  .load-more-status {
    display: flex;
    justify-content: center;
    margin-top: 12rpx;
    padding: 12rpx 0 24rpx;
    color: var(--theme-text-tertiary);
    font-size: 22rpx;
  }

  .fab {
    position: fixed;
    right: 32rpx;
    bottom: 60rpx;
    z-index: 20;
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 0 32rpx;
    height: 92rpx;
    border-radius: 999rpx;
    background: linear-gradient(135deg, #f59e0b, #d97706);
    box-shadow: 0 12rpx 28rpx rgba(217, 119, 6, 0.4);
  }

  .fab:active {
    opacity: 0.85;
  }

  .fab-icon {
    font-size: 44rpx;
    color: #fff;
    font-weight: 700;
    line-height: 1;
  }

  .fab-text {
    font-size: 28rpx;
    color: #fff;
    font-weight: 700;
  }
</style>
