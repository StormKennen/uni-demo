<template>
  <PageLayout title="阵容克制" nav-init-bg-color="var(--theme-surface)" nav-divider>
    <view class="counter-page">
      <view class="filter-card">
        <view class="mode-row">
          <view class="mode-chip" :class="{ active: selectedMode === '占领战防守' }" @click="setMode('占领战防守')">
            <text>防守</text>
          </view>
          <view class="mode-chip" :class="{ active: selectedMode === '占领战进攻' }" @click="setMode('占领战进攻')">
            <text>进攻</text>
          </view>
        </view>
        <text class="mode-hint">{{ modeHint }}</text>

        <view class="scope-filter">
          <text class="filter-label">范围</text>
          <view class="scope-chip-row">
            <text
              v-for="option in LINEUP_SCOPE_OPTIONS"
              :key="option.value"
              class="scope-chip"
              :class="{ active: selectedScope === option.value }"
              @click="selectScope(option.value)">
              {{ option.label }}
            </text>
          </view>
        </view>

        <view class="filter-head">
          <text class="filter-label">魔灵筛选</text>
          <text v-if="selectedCharacters.length" class="filter-count">已选 {{ selectedCharacters.length }}</text>
        </view>

        <SwcCharacterPickerSlots
          class="character-picker-slots"
          :characters="selectedCharacterViews"
          :max-count="0"
          :size="120"
          @add="openCharacterPicker"
          @remove="handleRemoveSelectedCharacter" />

        <text class="helper-text">阵容需同时包含全部所选人物</text>

        <view class="action-row">
          <button class="toolbar-btn primary" size="mini" :loading="loading" :disabled="loading" @click="refresh">查询</button>
          <button class="reset-btn" size="mini" :disabled="!selectedCharacters.length" @click="clearCharacters">重置</button>
        </view>
      </view>

      <StateBlock v-if="loading && !results.length" class="state-block" text="查询克制关系中..." />

      <StateBlock v-else-if="errorMessage" class="state-block" :text="errorMessage" action-text="重试" theme="teal" @action="refresh" />

      <StateBlock
        v-else-if="emptyReason === 'idle' && !results.length"
        class="state-block"
        text="可以选择魔灵缩小范围，也可以直接点击查询阵容克制" />

      <StateBlock v-else-if="emptyReason === 'no_lineups'" class="state-block" text="暂未找到包含所选魔灵的阵容" />

      <view v-else class="result-list">
        <view v-if="relationMode" class="result-meta">
          <text class="result-meta-text">{{ resultMetaText }}</text>
          <text class="result-meta-count"> 共 {{ pagination.total || results.length }} 组 </text>
        </view>

        <view v-for="group in results" :key="group.lineup.id" class="group-card">
          <view class="group-head">
            <text class="group-title">{{ primaryLabel }}</text>
            <text v-if="group.lineup.name" class="group-name">{{ group.lineup.name }}</text>
            <text class="group-type">{{ getLineupTypeLabel(group.lineup.type) }}</text>
            <button class="relation-inline-btn" size="mini" @click="openRelationCreate(group)">补充克制</button>
          </view>

          <SwcLineup
            class="group-lineup"
            :characters="toMemberViews(group.lineup.characters)"
            :columns="5"
            :avatar-size="92"
            :show-member-name="false"
            :show-family="true"
            :show-stars="true"
            star-position="above"
            :show-element="true"
            :show-member-type="true"
            empty-text="暂无成员" />

          <LineupInteractionBar
            class="group-interaction"
            :like-count="group.lineup.likeCount"
            :dislike-count="group.lineup.dislikeCount"
            :score="group.lineup.score"
            :my-reaction="group.lineup.myReaction"
            :favorite-count="group.lineup.favoriteCount"
            :is-favorite="group.lineup.isFavorited"
            :disabled="reactingId === group.lineup.id || favoritingIds.has(group.lineup.id)"
            @like="handleLike(group.lineup)"
            @dislike="handleDislike(group.lineup)"
            @favorite="handleFavorite(group.lineup)" />

          <view class="related-section">
            <view class="related-head">
              <text class="related-title">{{ relatedLabel }}</text>
              <text class="related-count">{{ group.relatedLineups.length }}</text>
            </view>

            <StateBlock v-if="!group.relatedLineups.length" class="related-empty" text="暂无克制数据" />

            <view v-else class="related-list">
              <view v-for="item in group.relatedLineups" :key="item.lineup.id" class="related-card">
                <view class="related-meta">
                  <text v-if="item.lineup.name" class="related-name">{{ item.lineup.name }}</text>
                  <text class="related-type">{{ getLineupTypeLabel(item.lineup.type) }}</text>
                </view>

                <text v-if="item.relationDescription" class="related-desc">{{ item.relationDescription }}</text>
                <view v-if="item.relationCreatedAt || isOwnRelation(item)" class="relation-origin-row">
                  <text v-if="item.relationCreatedAt" class="relation-origin">
                    {{ isOwnRelation(item) ? '我创建的' : item.relationSource === 'user' ? '玩家补充' : '系统关系' }} ·
                    {{ formatDate(item.relationCreatedAt) }}
                  </text>
                  <button v-if="isOwnRelation(item)" class="relation-edit-btn" size="mini" @click.stop="openRelationEdit(group, item)"
                    >编辑</button
                  >
                </view>

                <SwcLineup
                  :characters="toMemberViews(item.lineup.characters)"
                  :columns="5"
                  :avatar-size="84"
                  :show-member-name="false"
                  :show-family="true"
                  :show-stars="true"
                  star-position="above"
                  :show-element="true"
                  :show-member-type="true"
                  empty-text="暂无成员" />

                <LineupInteractionBar
                  :like-count="item.lineup.likeCount"
                  :dislike-count="item.lineup.dislikeCount"
                  :score="item.lineup.score"
                  :my-reaction="item.lineup.myReaction"
                  :favorite-count="item.lineup.favoriteCount"
                  :is-favorite="item.lineup.isFavorited"
                  :disabled="reactingId === item.lineup.id || favoritingIds.has(item.lineup.id)"
                  @like="handleLike(item.lineup)"
                  @dislike="handleDislike(item.lineup)"
                  @favorite="handleFavorite(item.lineup)" />
              </view>
            </view>
          </view>
        </view>

        <view v-if="pagination.hasNext" class="load-more">
          <button class="toolbar-btn" :loading="loadingMore" @click="loadMore">加载更多</button>
        </view>
      </view>

      <view class="fab" @click="openRelationCreate()">
        <text class="fab-icon">+</text>
        <text class="fab-text">新增克制</text>
      </view>
    </view>
  </PageLayout>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { onLoad, onShow, onReachBottom, onPullDownRefresh, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
  import StateBlock from './components/state-block.vue'
  import SwcLineup from './components/swc-lineup.vue'
  import SwcCharacterPickerSlots from './components/swc-character-picker-slots.vue'
  import LineupInteractionBar from './components/lineup-interaction-bar.vue'
  import { getLineupTypeLabel } from './lineup-meta'
  import { toSwcCharacterView } from './utils'
  import { useLineupRelationQuery } from './composables/use-lineup-relation-query'
  import { buildSwcLineupCounterShare } from './share'
  import type {
    CharacterOption,
    LineupCharacterPreview,
    LineupOption,
    LineupRelationGroup,
    LineupScope,
    RelatedLineupItem,
  } from './lineup-types'
  import {
    RELATION_EDIT_PREFILL_KEY,
    RELATION_EDIT_RESULT_KEY,
    type RelationEditPrefill,
    type RelationEditResult,
  } from './lineup-relation-edit-context'
  import { ensureLoginAccess } from '@/utils/admin'
  import { getStorageSync, getUserInfo, removeStorageSync, setStorageSync } from '@/utils/storage'
  import { reportToolVisit } from '@/utils/tracker'

  const COMPENDIUM_CODE = 'swc'
  const DEFAULT_LOCALE = 'zh-CN'
  const CHARACTER_PICKER_CACHE_KEY = 'compendium:swc:lineup-counter:character-picker:draft'
  const CHARACTER_PICKER_RESULT_KEY = 'compendium:swc:lineup-counter:character-picker:result'
  const LINEUP_COUNTER_PREFILL_KEY = 'compendium:swc:lineup-counter:prefill'

  const selectedLocale = ref(DEFAULT_LOCALE)
  const LINEUP_SCOPE_OPTIONS: Array<{ label: string; value: LineupScope }> = [
    { label: '全部', value: 'all' },
    { label: '我创建的', value: 'mine' },
    { label: '我的收藏', value: 'favorites' },
  ]

  const {
    selectedMode,
    selectedScope,
    selectedCharacters,
    selectedCharacterIds,
    results,
    relationMode,
    pagination,
    loading,
    loadingMore,
    reactingId,
    favoritingIds,
    errorMessage,
    emptyReason,
    primaryLabel,
    relatedLabel,
    modeHint,
    setMode,
    setScope: setScopeState,
    setSelectedCharacters,
    removeCharacter,
    clearCharacters,
    applyRouteQuery,
    refresh,
    loadMore,
    handleReaction,
    handleFavorite: handleFavoriteRequest,
  } = useLineupRelationQuery({
    compendiumId: COMPENDIUM_CODE,
    locale: selectedLocale,
  })

  const selectedCharacterViews = computed(() => selectedCharacters.value.map(item => toSwcCharacterView(item)))

  const selectScope = (scope: LineupScope) => {
    if (scope !== 'all' && !ensureLoginAccess(buildRelationCurrentUrl(scope))) return
    setScopeState(scope)
  }

  const handleRemoveSelectedCharacter = (character: { characterId: string }) => {
    removeCharacter(character.characterId)
  }

  const resultMetaText = computed(() => {
    if (relationMode.value === 'counteredBy') return '防守视角：展示克制该防守的进攻阵容'
    if (relationMode.value === 'counters') return '进攻视角：展示该进攻可克制的防守阵容'
    return '克制关系结果'
  })

  const toMemberViews = (characters: LineupCharacterPreview[]) => characters.map(item => toSwcCharacterView(item))

  const isOwnRelation = (item: RelatedLineupItem): boolean => {
    const currentUserId = getUserInfo()?.id
    return Boolean(currentUserId && item.relationSource === 'user' && item.relationCanEdit && item.relationCreatedBy === currentUserId)
  }

  const handleFavorite = (lineup: (typeof results.value)[number]['lineup']) => {
    if (!ensureLoginAccess(buildRelationCurrentUrl())) return
    void handleFavoriteRequest(lineup)
  }

  const handleLike = (lineup: (typeof results.value)[number]['lineup']) => {
    void handleReaction(lineup, 1)
  }

  const handleDislike = (lineup: (typeof results.value)[number]['lineup']) => {
    void handleReaction(lineup, -1)
  }

  const formatDate = (value: string): string => {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value.slice(0, 10)
    const pad = (part: number) => String(part).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  }

  const toLineupOption = (lineup: (typeof results.value)[number]['lineup']): LineupOption => ({
    id: lineup.id,
    name: lineup.name,
    type: lineup.type,
    description: lineup.description,
    status: lineup.status,
    memberCount: lineup.memberCount,
    targetLineupsCount: lineup.targetLineupsCount,
    sourceLineupsCount: lineup.sourceLineupsCount,
    characters: lineup.characters,
  })

  const buildRelationCurrentUrl = (scope = selectedScope.value): string => {
    const params = [`compendiumId=${encodeURIComponent(COMPENDIUM_CODE)}`, `locale=${encodeURIComponent(selectedLocale.value)}`]
    params.push(`type=${encodeURIComponent(selectedMode.value)}`)
    if (scope !== 'all') params.push(`scope=${encodeURIComponent(scope)}`)
    if (selectedCharacterIds.value.length) params.push(`characterIds=${encodeURIComponent(selectedCharacterIds.value.join(','))}`)
    return `/subPackages/tools/compendium/swc/lineup-counter?${params.join('&')}`
  }

  const navigateToRelationEdit = (prefill?: RelationEditPrefill) => {
    if (!ensureLoginAccess(buildRelationCurrentUrl())) return
    removeStorageSync(RELATION_EDIT_PREFILL_KEY)
    if (prefill) setStorageSync(RELATION_EDIT_PREFILL_KEY, prefill)
    const params = [`mode=${encodeURIComponent(prefill?.mode || 'create')}`, `locale=${encodeURIComponent(selectedLocale.value)}`]
    if (prefill?.relationId) params.push(`relationId=${encodeURIComponent(prefill.relationId)}`)
    if (prefill) params.push(`prefillKey=${encodeURIComponent(RELATION_EDIT_PREFILL_KEY)}`)
    uni.navigateTo({ url: `/subPackages/tools/compendium/swc/lineup-relation-edit?${params.join('&')}` })
  }

  const openRelationCreate = (group?: LineupRelationGroup) => {
    if (!group) {
      navigateToRelationEdit()
      return
    }
    navigateToRelationEdit({
      mode: 'create',
      defense: selectedMode.value === '占领战防守' ? toLineupOption(group.lineup) : null,
      offense: selectedMode.value === '占领战进攻' ? toLineupOption(group.lineup) : null,
      description: '',
    })
  }

  const openRelationEdit = (group: LineupRelationGroup, item: RelatedLineupItem) => {
    if (!ensureLoginAccess(buildRelationCurrentUrl())) return
    if (!isOwnRelation(item) || !item.relationId) {
      uni.showToast({ title: '只能编辑自己创建的克制关系', icon: 'none' })
      return
    }
    const defense = selectedMode.value === '占领战防守' ? group.lineup : item.lineup
    const offense = selectedMode.value === '占领战防守' ? item.lineup : group.lineup
    navigateToRelationEdit({
      relationId: item.relationId,
      relationCreatedBy: item.relationCreatedBy,
      relationSource: item.relationSource,
      relationCanEdit: item.relationCanEdit,
      mode: 'edit',
      defense: toLineupOption(defense),
      offense: toLineupOption(offense),
      description: item.relationDescription,
    })
  }

  const consumeRelationEditResult = () => {
    const value = getStorageSync(RELATION_EDIT_RESULT_KEY)
    if (!value || typeof value !== 'object') return
    const result = value as Partial<RelationEditResult>
    if (result.changed !== true) return
    removeStorageSync(RELATION_EDIT_RESULT_KEY)
    void refresh()
  }

  const buildShareQuery = () => ({
    compendiumId: COMPENDIUM_CODE,
    locale: selectedLocale.value,
    type: selectedMode.value,
    characterIds: selectedCharacterIds.value.length ? selectedCharacterIds.value.join(',') : undefined,
  })

  const openCharacterPicker = () => {
    setStorageSync(
      CHARACTER_PICKER_CACHE_KEY,
      selectedCharacters.value.map(item => ({ ...item })),
    )
    removeStorageSync(CHARACTER_PICKER_RESULT_KEY)
    const selectedIds = selectedCharacterIds.value

    uni.navigateTo({
      url:
        `/subPackages/tools/compendium/swc/character-picker?compendiumId=${encodeURIComponent(COMPENDIUM_CODE)}` +
        `&locale=${encodeURIComponent(selectedLocale.value)}` +
        `&cacheKey=${encodeURIComponent(CHARACTER_PICKER_CACHE_KEY)}` +
        `&resultKey=${encodeURIComponent(CHARACTER_PICKER_RESULT_KEY)}` +
        `&selectedCharacterIds=${encodeURIComponent(selectedIds.join(','))}`,
    })
  }

  onLoad((options: Record<string, string | undefined>) => {
    selectedLocale.value = options.locale || DEFAULT_LOCALE
    applyRouteQuery(options)

    if (selectedScope.value !== 'all' && !ensureLoginAccess(buildRelationCurrentUrl())) return

    if (options.prefill === '1') {
      const prefillCharacters = getStorageSync(LINEUP_COUNTER_PREFILL_KEY)
      removeStorageSync(LINEUP_COUNTER_PREFILL_KEY)
      if (Array.isArray(prefillCharacters)) {
        setSelectedCharacters(prefillCharacters as CharacterOption[])
      }
    }

    if (selectedCharacterIds.value.length) {
      void refresh()
    }
  })

  onShow(() => {
    reportToolVisit('compendium-lineup-counter')
    consumeRelationEditResult()

    const pickerResult = getStorageSync(CHARACTER_PICKER_RESULT_KEY)
    if (Array.isArray(pickerResult)) {
      setSelectedCharacters(pickerResult as CharacterOption[])
      removeStorageSync(CHARACTER_PICKER_RESULT_KEY)
      void refresh()
    }
  })

  onPullDownRefresh(async () => {
    try {
      await refresh()
    } finally {
      uni.stopPullDownRefresh()
    }
  })

  onReachBottom(() => {
    void loadMore()
  })

  // #ifdef MP-WEIXIN
  onShareAppMessage(() => buildSwcLineupCounterShare(buildShareQuery()).app)
  onShareTimeline(() => buildSwcLineupCounterShare(buildShareQuery()).timeline)
  // #endif
</script>

<style scoped lang="scss">
  .counter-page {
    min-height: 100vh;
    padding: 24rpx 24rpx calc(180rpx + env(safe-area-inset-bottom));
    box-sizing: border-box;
    background: var(--theme-bg);
    color: var(--theme-text);
  }

  .filter-card,
  .group-card,
  .related-card {
    background: var(--theme-surface);
    border: 1rpx solid var(--theme-border);
    border-radius: 20rpx;
  }

  .filter-card {
    padding: 22rpx;
    margin-bottom: 24rpx;
  }

  .mode-row {
    display: flex;
    gap: 12rpx;
  }

  .mode-chip {
    flex: 1;
    height: 68rpx;
    border-radius: 999rpx;
    border: 1rpx solid var(--theme-border);
    background: var(--theme-surface-2);
    color: var(--theme-text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26rpx;
    font-weight: 700;
  }

  .mode-chip.active {
    border-color: var(--theme-brand);
    background: rgba(124, 58, 237, 0.12);
    color: var(--theme-brand);
  }

  .mode-hint,
  .helper-text {
    display: block;
    margin-top: 14rpx;
    color: var(--theme-text-tertiary);
    font-size: 22rpx;
    line-height: 1.5;
  }

  .scope-filter {
    margin-top: 18rpx;
    padding-top: 16rpx;
    border-top: 1rpx solid var(--theme-border);
  }

  .scope-chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
  }

  .scope-chip {
    padding: 12rpx 22rpx;
    border-radius: 999rpx;
    border: 1rpx solid var(--theme-border);
    background: var(--theme-surface-2);
    color: var(--theme-text-secondary);
    font-size: 24rpx;
    font-weight: 700;
  }

  .scope-chip.active {
    border-color: var(--theme-brand);
    background: var(--theme-brand);
    color: #fff;
  }

  .filter-head,
  .related-head,
  .group-head,
  .action-row,
  .result-meta {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }

  .filter-head {
    justify-content: space-between;
    margin-top: 18rpx;
    margin-bottom: 14rpx;
  }

  .filter-label,
  .group-title,
  .related-title {
    color: var(--theme-text);
    font-size: 28rpx;
    font-weight: 800;
  }

  .character-picker-slots {
    margin-top: 8rpx;
  }

  .filter-count {
    margin-left: auto;
    color: var(--theme-text-secondary);
    font-size: 22rpx;
    font-weight: 700;
  }

  .action-row {
    margin-top: 16rpx;
    display: block;
  }

  .action-row .toolbar-btn.primary {
    width: 100%;
  }

  .toolbar-btn {
    margin: 0;
    width: 50%;
    min-width: 0;
    height: 56rpx;
    line-height: 56rpx;
    padding: 0 18rpx;
    border-radius: 999rpx;
    border: 1rpx solid var(--theme-border);
    background: var(--theme-surface-2);
    color: var(--theme-text);
    font-size: 22rpx;
  }

  .toolbar-btn.primary {
    border-color: var(--theme-brand);
    background: var(--theme-brand);
    color: #fff;
  }

  .reset-btn {
    display: block;
    width: auto;
    min-width: 96rpx;
    height: 56rpx;
    margin: 8rpx 0 0 auto;
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

  .state-block {
    margin-top: 24rpx;
    padding-top: 24rpx;
  }

  .result-list {
    margin-top: 20rpx;
    display: grid;
    gap: 18rpx;
  }

  .result-meta {
    justify-content: space-between;
    padding: 0 4rpx;
  }

  .result-meta-text,
  .result-meta-count {
    color: var(--theme-text-secondary);
    font-size: 22rpx;
    font-weight: 700;
  }

  .group-card {
    padding: 20rpx;
  }

  .group-head {
    margin-bottom: 12rpx;
    flex-wrap: wrap;
  }

  .relation-inline-btn {
    margin: 0 0 0 auto;
    border-radius: 999rpx;
    color: var(--theme-brand);
    font-size: 20rpx;
    font-weight: 700;
  }

  .group-name {
    color: var(--theme-text-secondary);
    font-size: 24rpx;
    font-weight: 700;
  }

  .group-type,
  .related-type {
    flex-shrink: 0;
    color: var(--theme-text-tertiary);
    font-size: 22rpx;
    font-weight: 700;
  }

  .group-lineup {
    margin-bottom: 16rpx;
  }

  .group-interaction {
    margin: 0 0 16rpx;
  }

  .related-section {
    padding-top: 8rpx;
    border-top: 1rpx solid var(--theme-border);
  }

  .related-head {
    justify-content: space-between;
    margin: 12rpx 0;
  }

  .related-count {
    min-width: 40rpx;
    height: 40rpx;
    padding: 0 12rpx;
    border-radius: 999rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text-secondary);
    font-size: 22rpx;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .related-empty {
    margin-top: 8rpx;
  }

  .related-list {
    display: grid;
    gap: 14rpx;
  }

  .related-card {
    padding: 16rpx;
    background: var(--theme-surface-2);
  }

  .related-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12rpx;
    margin-bottom: 10rpx;
  }

  .related-name {
    min-width: 0;
    color: var(--theme-text);
    font-size: 26rpx;
    font-weight: 800;
  }

  .related-desc {
    display: block;
    margin: -2rpx 0 12rpx;
    color: var(--theme-text-secondary);
    font-size: 22rpx;
    line-height: 1.45;
  }

  .relation-origin {
    display: block;
    color: var(--theme-text-tertiary);
    font-size: 20rpx;
  }

  .relation-origin-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12rpx;
    margin: -4rpx 0 12rpx;
  }

  .relation-edit-btn {
    flex-shrink: 0;
    min-width: 76rpx;
    height: 46rpx;
    margin: 0;
    padding: 0 12rpx;
    border: 0;
    background: transparent;
    color: var(--theme-brand);
    font-size: 20rpx;
    line-height: 46rpx;
    font-weight: 700;
  }

  .reaction-row {
    margin-top: 14rpx;
    display: flex;
    align-items: center;
    gap: 16rpx;
  }

  .reaction-btn {
    min-width: 110rpx;
    height: 52rpx;
    padding: 0 16rpx;
    border-radius: 999rpx;
    border: 1rpx solid var(--theme-border);
    background: var(--theme-surface);
    color: var(--theme-text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22rpx;
    font-weight: 700;
  }

  .reaction-btn.active {
    border-color: var(--theme-brand);
    color: var(--theme-brand);
    background: rgba(15, 118, 110, 0.12);
  }

  .reaction-btn.disabled {
    opacity: 0.6;
  }

  .reaction-score {
    margin-left: auto;
    color: var(--theme-text-tertiary);
    font-size: 22rpx;
    font-weight: 700;
  }

  .load-more {
    display: flex;
    justify-content: center;
    padding: 8rpx 0 12rpx;
  }

  .fab {
    position: fixed;
    right: 32rpx;
    bottom: calc(60rpx + env(safe-area-inset-bottom));
    z-index: 20;
    display: flex;
    align-items: center;
    gap: 8rpx;
    height: 92rpx;
    padding: 0 32rpx;
    border-radius: 999rpx;
    background: linear-gradient(135deg, #f59e0b, #d97706);
    box-shadow: 0 12rpx 28rpx rgba(217, 119, 6, 0.4);
  }

  .fab:active {
    opacity: 0.85;
  }

  .fab-icon {
    color: #fff;
    font-size: 44rpx;
    font-weight: 700;
    line-height: 1;
  }

  .fab-text {
    color: #fff;
    font-size: 28rpx;
    font-weight: 700;
  }
</style>
