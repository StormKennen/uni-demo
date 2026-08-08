<template>
  <PageLayout title="克制与被克制">
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

        <view class="filter-head">
          <text class="filter-label">魔灵筛选</text>
          <button class="toolbar-btn primary" size="mini" @click="openCharacterPicker">选择魔灵</button>
        </view>

        <SwcLineup
          v-if="selectedCharacters.length"
          class="selected-characters"
          :characters="selectedCharacterViews"
          :columns="5"
          editable
          :show-member-name="false"
          :show-family="true"
          :show-stars="true"
          :show-element="true"
          :show-member-type="true"
          :avatar-size="92"
          empty-text="请选择魔灵"
          @remove="removeCharacter" />

        <view v-else class="helper-text">请选择魔灵查询阵容</view>

        <view v-if="selectedCharacters.length" class="action-row">
          <button class="toolbar-btn" size="mini" @click="clearCharacters">清空魔灵</button>
          <button class="toolbar-btn primary" size="mini" :loading="loading" @click="refresh">重新查询</button>
        </view>
      </view>

      <StateBlock v-if="loading && !results.length" class="state-block" text="查询克制关系中..." />

      <StateBlock v-else-if="errorMessage" class="state-block" :text="errorMessage" action-text="重试" theme="teal" @action="refresh" />

      <StateBlock v-else-if="emptyReason === 'no_characters'" class="state-block" text="请选择魔灵查询阵容" />

      <StateBlock v-else-if="emptyReason === 'no_lineups'" class="state-block" text="暂未找到包含所选魔灵的阵容" />

      <view v-else class="result-list">
        <view v-for="group in results" :key="group.lineup.id" class="group-card">
          <view class="group-head">
            <text class="group-title">{{ primaryLabel }}</text>
            <text v-if="group.lineup.name" class="group-name">{{ group.lineup.name }}</text>
          </view>

          <SwcLineup
            class="group-lineup"
            :characters="toMemberViews(group.lineup.characters)"
            :columns="5"
            :avatar-size="92"
            :show-member-name="false"
            :show-family="true"
            :show-stars="true"
            :show-element="true"
            :show-member-type="true"
            empty-text="暂无成员" />

          <view class="related-section">
            <view class="related-head">
              <text class="related-title">{{ relatedLabel }}</text>
              <text class="related-count">{{ group.relatedLineups.length }}</text>
            </view>

            <StateBlock v-if="!group.relatedLineups.length" class="related-empty" text="暂无克制数据" />

            <view v-else class="related-list">
              <view v-for="related in group.relatedLineups" :key="related.id" class="related-card">
                <view class="related-meta">
                  <text v-if="related.name" class="related-name">{{ related.name }}</text>
                  <text class="related-type">{{ getLineupTypeLabel(related.type) }}</text>
                </view>

                <SwcLineup
                  :characters="toMemberViews(related.characters)"
                  :columns="5"
                  :avatar-size="84"
                  :show-member-name="false"
                  :show-family="true"
                  :show-stars="true"
                  :show-element="true"
                  :show-member-type="true"
                  empty-text="暂无成员" />

                <view class="reaction-row">
                  <view class="reaction-btn" :class="{ active: related.myReaction === 1 }" @click="handleReaction(related, 1)">
                    <text>👍 {{ related.likeCount }}</text>
                  </view>
                  <view class="reaction-btn" :class="{ active: related.myReaction === -1 }" @click="handleReaction(related, -1)">
                    <text>👎 {{ related.dislikeCount }}</text>
                  </view>
                  <text class="reaction-score">热度 {{ related.score }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <view v-if="pagination.hasNext" class="load-more">
          <button class="toolbar-btn" :loading="loadingMore" @click="loadMore">加载更多</button>
        </view>
      </view>
    </view>
  </PageLayout>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { onLoad, onShow, onReachBottom, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
  import StateBlock from './components/state-block.vue'
  import SwcLineup from './components/swc-lineup.vue'
  import { getLineupTypeLabel } from './lineup-meta'
  import { toSwcCharacterView } from './utils'
  import { useLineupRelationQuery } from './composables/use-lineup-relation-query'
  import { buildSwcLineupCounterShare } from './share'
  import { getStorageSync, removeStorageSync, setStorageSync } from '@/utils/storage'
  import { ensureLineupFeatureAccess } from '@/utils/admin'
  import { reportToolVisit } from '@/utils/tracker'
  import type { LineupCharacterPreview } from './lineup-types'

  const COMPENDIUM_CODE = 'swc'
  const DEFAULT_LOCALE = 'zh-CN'
  const CHARACTER_PICKER_CACHE_KEY = 'compendium:swc:lineup-counter:character-picker:draft'
  const CHARACTER_PICKER_RESULT_KEY = 'compendium:swc:lineup-counter:character-picker:result'

  const selectedLocale = ref(DEFAULT_LOCALE)
  const accessChecked = ref(false)
  const hasFeatureAccess = ref(false)

  const {
    selectedMode,
    selectedCharacters,
    selectedCharacterIds,
    results,
    pagination,
    loading,
    loadingMore,
    errorMessage,
    emptyReason,
    primaryLabel,
    relatedLabel,
    setMode,
    setSelectedCharacters,
    removeCharacter,
    clearCharacters,
    applyRouteQuery,
    refresh,
    loadMore,
    handleReaction,
  } = useLineupRelationQuery({
    compendiumId: COMPENDIUM_CODE,
    locale: selectedLocale,
  })

  const selectedCharacterViews = computed(() => selectedCharacters.value.map(item => toSwcCharacterView(item)))

  const toMemberViews = (characters: LineupCharacterPreview[]) => characters.map(item => toSwcCharacterView(item))

  const buildCurrentUrl = () => {
    const query: string[] = [`compendiumId=${encodeURIComponent(COMPENDIUM_CODE)}`, `locale=${encodeURIComponent(selectedLocale.value)}`]
    if (selectedMode.value) query.push(`type=${encodeURIComponent(selectedMode.value)}`)
    if (selectedCharacterIds.value.length) {
      query.push(`characterIds=${encodeURIComponent(selectedCharacterIds.value.join(','))}`)
    }
    return `/subPackages/tools/compendium/swc/lineup-counter?${query.join('&')}`
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
    hasFeatureAccess.value = ensureLineupFeatureAccess(buildCurrentUrl())
    accessChecked.value = true
    if (hasFeatureAccess.value && selectedCharacterIds.value.length) {
      void refresh()
    }
  })

  onShow(() => {
    reportToolVisit('compendium-lineup-counter')
    if (!hasFeatureAccess.value) return

    const pickerResult = getStorageSync(CHARACTER_PICKER_RESULT_KEY)
    if (Array.isArray(pickerResult)) {
      setSelectedCharacters(pickerResult as any[])
      removeStorageSync(CHARACTER_PICKER_RESULT_KEY)
      void refresh()
    }
  })

  onReachBottom(() => {
    if (!hasFeatureAccess.value) return
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
    padding: 24rpx 24rpx 48rpx;
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
  }

  .mode-row {
    display: flex;
    gap: 12rpx;
    margin-bottom: 18rpx;
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

  .filter-head,
  .related-head,
  .group-head,
  .action-row {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }

  .filter-head {
    justify-content: space-between;
    margin-bottom: 14rpx;
  }

  .filter-label,
  .group-title,
  .related-title {
    color: var(--theme-text);
    font-size: 28rpx;
    font-weight: 800;
  }

  .selected-characters {
    margin-top: 8rpx;
  }

  .helper-text {
    color: var(--theme-text-tertiary);
    font-size: 24rpx;
    line-height: 1.5;
  }

  .action-row {
    margin-top: 16rpx;
    justify-content: flex-end;
  }

  .toolbar-btn {
    margin: 0;
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

  .state-block {
    margin-top: 24rpx;
  }

  .result-list {
    margin-top: 20rpx;
    display: grid;
    gap: 18rpx;
  }

  .group-card {
    padding: 20rpx;
  }

  .group-head {
    margin-bottom: 12rpx;
    flex-wrap: wrap;
  }

  .group-name {
    color: var(--theme-text-secondary);
    font-size: 24rpx;
    font-weight: 700;
  }

  .group-lineup {
    margin-bottom: 16rpx;
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

  .related-type {
    flex-shrink: 0;
    color: var(--theme-text-tertiary);
    font-size: 22rpx;
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
</style>
