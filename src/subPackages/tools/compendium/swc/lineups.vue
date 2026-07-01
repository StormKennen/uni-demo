<template>
  <view class="lineup-page">
    <view class="hero-banner">
      <view>
        <text class="hero-title">魔灵召唤阵容</text>
        <text class="hero-subtitle">{{
          isAdmin ? '管理阵容类型与映射关系，支持一个阵容对应多个目标阵容。' : '浏览大家分享的阵容，登录后可发布并管理自己的阵容。'
        }}</text>
      </view>
      <text v-if="isAdmin" class="hero-badge">ADMIN</text>
    </view>

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
        <view class="filter-head" @click="toggleCharacterFilter">
          <text class="filter-label">
            人物精准筛选{{ selectedCharacterFilters.length ? ` · 已选 ${selectedCharacterFilters.length}` : '' }}
          </text>
          <text class="filter-toggle">{{ characterFilterExpanded ? '收起' : '展开' }}</text>
        </view>

        <view v-if="characterFilterExpanded" class="filter-body">
          <view class="filter-head">
            <text class="filter-helper">
              {{
                selectedCharacterFilters.length ? `已选 ${selectedCharacterFilters.length} 个，可多选精准筛选` : '未选择人物，默认不过滤'
              }}
            </text>
            <button class="toolbar-btn primary" size="mini" @click="openCharacterPicker">选择魔灵</button>
          </view>

          <CharacterAvatarGrid
            v-if="selectedCharacterFilters.length"
            class="selected-avatar-list"
            :items="selectedCharacterFilters"
            :columns="5"
            action-text="移除"
            action-theme="danger"
            @action="removeCharacterFilter" />

          <view v-if="selectedCharacterFilters.length" class="action-row filter-action-row">
            <button class="toolbar-btn" size="mini" @click="clearCharacterFilters">清空人物筛选</button>
          </view>
        </view>
      </view>

      <view class="action-row">
        <button class="toolbar-btn" @click="goMappings()">阵容映射</button>
        <button v-if="isAdmin" class="toolbar-btn" @click="goRelations()">克制关系</button>
      </view>
    </view>

    <StateBlock v-if="loading && !lineups.length" class="state-block" text="加载阵容中..." />

    <StateBlock
      v-else-if="errorMessage && !lineups.length"
      class="state-block"
      :text="errorMessage"
      action-text="重新加载"
      theme="amber"
      @action="refreshList" />

    <view v-else class="content">
      <view class="summary-row">
        <text class="summary-text">共 {{ pagination.total }} 条阵容</text>
        <text class="summary-text">{{
          isAdmin
            ? `当前 ${selectedTypeLabel} / ${selectedStatusLabel} / ${selectedCharacterLabel}`
            : `当前 ${selectedTypeLabel} / ${selectedCharacterLabel}`
        }}</text>
      </view>

      <StateBlock v-if="!lineups.length" class="empty-block" text="暂无符合条件的阵容" />

      <view v-for="lineup in lineups" :key="lineup.id" class="lineup-card">
        <view class="lineup-head">
          <view class="lineup-title-wrap">
            <text class="lineup-name">{{ lineup.name || '未命名阵容' }}</text>
            <text class="type-badge" :class="getLineupTypeToneClass(lineup.type)">{{ getLineupTypeLabel(lineup.type) }}</text>
            <text v-if="isAdmin" class="status-badge" :class="lineup.status">{{ getLineupStatusLabel(lineup.status) }}</text>
          </view>
          <text class="lineup-count">{{ lineup.memberCount }} 人</text>
        </view>

        <text v-if="lineup.description" class="lineup-desc">{{ lineup.description }}</text>

        <view v-if="isAdmin" class="metric-row">
          <view class="metric-item">
            <text class="metric-label">成员</text>
            <text class="metric-value">{{ lineup.memberCount }}</text>
          </view>
          <view class="metric-item">
            <text class="metric-label">目标阵容</text>
            <text class="metric-value">{{ lineup.targetLineupsCount }}</text>
          </view>
          <view class="metric-item">
            <text class="metric-label">上游阵容</text>
            <text class="metric-value">{{ lineup.sourceLineupsCount }}</text>
          </view>
        </view>

        <scroll-view v-if="lineup.characters.length" class="member-scroll" scroll-x>
          <view class="member-row">
            <view v-for="member in lineup.characters" :key="member.characterId || member.id" class="member-pill">
              <image v-if="member.avatar" class="member-avatar" :src="member.avatar" mode="aspectFill" />
              <view v-else class="member-avatar member-avatar-placeholder">
                <text>{{ (member.name || '?').slice(0, 1) }}</text>
              </view>
              <view class="member-meta">
                <text class="member-name">{{ member.name || member.label || '未知魔灵' }}</text>
                <text class="member-extra">{{ member.elementName || member.familyName || '--' }}</text>
              </view>
            </view>
          </view>
        </scroll-view>

        <view class="reaction-row">
          <view class="reaction-btn" :class="{ active: lineup.myReaction === 1 }" @click="handleReaction(lineup, 1)">
            <text>👍 {{ lineup.likeCount }}</text>
          </view>
          <view class="reaction-btn" :class="{ active: lineup.myReaction === -1 }" @click="handleReaction(lineup, -1)">
            <text>👎 {{ lineup.dislikeCount }}</text>
          </view>
          <text class="reaction-score">热度 {{ lineup.score }}</text>
        </view>

        <view v-if="canManageLineup(lineup) || isAdmin" class="card-actions">
          <button v-if="canManageLineup(lineup)" class="card-btn primary" size="mini" @click="goEdit(lineup.id)">编辑</button>
          <button v-if="isAdmin" class="card-btn" size="mini" @click="goRelations(lineup.id)"> 映射关系 </button>
          <button
            v-if="canManageLineup(lineup)"
            class="card-btn danger"
            size="mini"
            :loading="deletingId === lineup.id"
            @click="confirmDelete(lineup.id)">
            删除
          </button>
        </view>
      </view>

      <view v-if="pagination.hasNext" class="load-more">
        <button class="toolbar-btn" :loading="loadingMore" @click="loadMore">加载更多</button>
      </view>
    </view>

    <view class="fab" @click="goCreate">
      <text class="fab-icon">+</text>
      <text class="fab-text">{{ isLoggedIn ? '新增阵容' : '登录发布' }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { onLoad, onShow, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
  import { reportToolVisit } from '@/utils/tracker'
  import {
    deleteUserLineup,
    fetchAdminLineupTypes,
    reactToLineup,
    type LineupTypeOption,
    type ReactionValue,
    type UserLineupSummary,
  } from '@/services/compendium-lineups'
  import { getStorageSync, getToken, removeStorageSync, setStorageSync } from '@/utils/storage'
  import CharacterAvatarGrid from './components/character-avatar-grid.vue'
  import SearchActionRow from './components/search-action-row.vue'
  import StateBlock from './components/state-block.vue'
  import { canManageLineup, ensureLoginAccess, isAdminUser } from '@/utils/admin'
  import {
    ALL_VALUE,
    getLineupTypeToneClass,
    getLineupStatusLabel,
    getLineupTypeLabel,
    LINEUP_FILTER_STATUS_OPTIONS,
    LINEUP_TYPE_PRESET_OPTIONS,
  } from './lineup-meta'
  import { useAdminLineupList } from './composables/use-admin-lineup-list'

  const COMPENDIUM_CODE = 'swc'
  const DEFAULT_LOCALE = 'zh-CN'
  const CHARACTER_PICKER_CACHE_KEY = 'compendium:swc:lineups:character-picker:draft'
  const CHARACTER_PICKER_RESULT_KEY = 'compendium:swc:lineups:character-picker:result'
  const selectedLocale = ref(DEFAULT_LOCALE)
  const dynamicLineupTypes = ref<LineupTypeOption[]>([])
  const {
    keyword,
    selectedType,
    selectedStatus,
    selectedCharacterFilters,
    lineups,
    pagination,
    loading,
    loadingMore,
    errorMessage,
    selectedTypeLabel,
    selectedStatusLabel,
    selectedCharacterLabel,
    buildCurrentUrl,
    refreshList,
    loadMore,
    selectType,
    selectStatus,
    removeCharacterFilter,
    clearCharacterFilters,
    applyRouteQuery,
  } = useAdminLineupList({
    compendiumId: COMPENDIUM_CODE,
    locale: selectedLocale,
  })
  const deletingId = ref('')
  const reactingId = ref('')
  const characterFilterExpanded = ref(false)
  const isAdmin = computed(() => isAdminUser())
  const isLoggedIn = computed(() => !!getToken())

  const toggleCharacterFilter = () => {
    characterFilterExpanded.value = !characterFilterExpanded.value
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
      dynamicLineupTypes.value = await fetchAdminLineupTypes({
        compendiumId: COMPENDIUM_CODE,
      })
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
    if (!ensureLoginAccess(buildCurrentUrl())) return
    uni.navigateTo({
      url: `/subPackages/tools/compendium/swc/lineup-edit?lineupId=${encodeURIComponent(lineupId)}&compendiumId=${encodeURIComponent(COMPENDIUM_CODE)}&locale=${encodeURIComponent(selectedLocale.value)}`,
    })
  }

  const goMappings = () => {
    uni.navigateTo({
      url: `/subPackages/tools/compendium/swc/lineup-mappings?compendiumId=${encodeURIComponent(COMPENDIUM_CODE)}&locale=${encodeURIComponent(selectedLocale.value)}`,
    })
  }

  const goRelations = (sourceLineupId = '') => {
    const params = [`compendiumId=${encodeURIComponent(COMPENDIUM_CODE)}`, `locale=${encodeURIComponent(selectedLocale.value)}`]
    if (sourceLineupId) params.push(`sourceLineupId=${encodeURIComponent(sourceLineupId)}`)
    uni.navigateTo({
      url: `/subPackages/tools/compendium/swc/lineup-relations?${params.join('&')}`,
    })
  }

  const confirmDelete = (lineupId: string) => {
    uni.showModal({
      title: '删除阵容',
      content: '删除后会同时移除关联的克制关系，确认继续吗？',
      success: async res => {
        if (!res.confirm) return
        deletingId.value = lineupId
        try {
          await deleteUserLineup(lineupId)
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

  const handleReaction = async (lineup: UserLineupSummary, value: ReactionValue) => {
    if (reactingId.value) return
    reactingId.value = lineup.id
    try {
      const result = await reactToLineup(lineup.id, value)
      lineup.likeCount = result.likeCount
      lineup.dislikeCount = result.dislikeCount
      lineup.score = result.score
      lineup.myReaction = result.myReaction
    } catch (error) {
      uni.showToast({
        title: typeof error === 'string' ? error : '操作失败，请稍后重试',
        icon: 'none',
      })
    } finally {
      reactingId.value = ''
    }
  }

  onShow(() => {
    reportToolVisit('compendium-lineups')
    loadLineupTypes()

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
</script>

<style scoped lang="scss">
  .lineup-page {
    min-height: 100vh;
    background: #f6f7fb;
    color: #172033;
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
  .lineup-card,
  .empty-block,
  .state-block {
    margin: 0 24rpx 20rpx;
    background: #fff;
    border-radius: 24rpx;
    box-shadow: 0 10rpx 30rpx rgba(15, 23, 42, 0.06);
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
    color: #667085;
    font-weight: 700;
  }

  .filter-head .filter-label {
    margin-bottom: 0;
  }

  .filter-helper {
    display: block;
    margin-top: 12rpx;
    color: #667085;
    font-size: 22rpx;
    font-weight: 700;
  }

  .chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
  }

  .chip {
    padding: 12rpx 22rpx;
    border-radius: 999rpx;
    background: #eef2f7;
    color: #667085;
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
    background: #b45309;
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
    color: #667085;
    font-size: 24rpx;
    font-weight: 700;
  }

  .selected-avatar-list {
    margin-top: 18rpx;
  }

  .state-block,
  .empty-block {
    padding: 48rpx 28rpx;
    text-align: center;
    color: #667085;
    font-size: 28rpx;
  }

  .lineup-card {
    padding: 24rpx;
  }

  .lineup-head {
    justify-content: space-between;
    align-items: flex-start;
  }

  .lineup-title-wrap {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    gap: 10rpx;
    align-items: center;
  }

  .lineup-name {
    font-size: 32rpx;
    font-weight: 800;
    color: #172033;
  }

  .lineup-count,
  .type-badge,
  .status-badge {
    font-size: 22rpx;
    font-weight: 800;
    border-radius: 999rpx;
    padding: 6rpx 14rpx;
  }

  .type-badge.offense {
    background: #e0f2fe;
    color: #0369a1;
  }

  .type-badge.defense {
    background: #ede9fe;
    color: #6d28d9;
  }

  .type-badge.custom {
    background: #ecfeff;
    color: #0f766e;
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
    background: #f3f5f9;
    color: #475467;
  }

  .lineup-desc {
    display: block;
    margin-top: 16rpx;
    color: #475467;
    font-size: 26rpx;
    line-height: 1.7;
  }

  .metric-row {
    margin-top: 18rpx;
  }

  .metric-item {
    flex: 1;
    padding: 18rpx;
    border-radius: 18rpx;
    background: #f8fafc;
  }

  .metric-label {
    display: block;
    color: #667085;
    font-size: 22rpx;
  }

  .metric-value {
    display: block;
    margin-top: 6rpx;
    color: #111827;
    font-size: 30rpx;
    font-weight: 800;
  }

  .member-scroll {
    margin-top: 20rpx;
    white-space: nowrap;
  }

  .member-row {
    display: inline-flex;
    gap: 14rpx;
    padding-bottom: 4rpx;
  }

  .member-pill {
    width: 240rpx;
    padding: 14rpx;
    border-radius: 18rpx;
    background: #f8fafc;
    display: flex;
    align-items: center;
    gap: 12rpx;
  }

  .member-avatar {
    width: 60rpx;
    height: 60rpx;
    border-radius: 16rpx;
    background: #e5e7eb;
    flex-shrink: 0;
  }

  .member-avatar-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #92400e;
    font-weight: 800;
  }

  .member-meta {
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
    color: #172033;
    font-size: 24rpx;
    font-weight: 700;
  }

  .member-extra {
    margin-top: 6rpx;
    color: #667085;
    font-size: 22rpx;
  }

  .mini-btn.danger {
    color: #dc2626;
  }

  .card-actions {
    margin-top: 22rpx;
    justify-content: flex-end;
  }

  .reaction-row {
    display: flex;
    align-items: center;
    gap: 20rpx;
    margin-top: 20rpx;
  }

  .reaction-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 120rpx;
    min-height: 64rpx;
    padding: 0 28rpx;
    border-radius: 999rpx;
    background: #f3f5f9;
    color: #475467;
    font-size: 26rpx;
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
    color: #98a2b3;
    font-size: 22rpx;
    font-weight: 700;
  }

  .filter-action-row {
    justify-content: flex-end;
  }

  .load-more {
    display: flex;
    justify-content: center;
    margin-top: 12rpx;
  }

  .filter-toggle {
    flex-shrink: 0;
    font-size: 24rpx;
    color: #b45309;
    font-weight: 700;
  }

  .filter-body {
    margin-top: 16rpx;
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
