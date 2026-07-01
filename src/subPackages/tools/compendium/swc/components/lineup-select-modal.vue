<template>
  <view v-if="visible" class="modal-mask" @click="close">
    <view class="modal-panel" @click.stop>
      <view class="modal-head">
        <text class="modal-title">{{ title }}</text>
        <text class="modal-close" @click="close">✕</text>
      </view>

      <SearchActionRow
        v-model="keyword"
        class="modal-search"
        :placeholder="searchPlaceholder"
        theme="teal"
        :disabled="loading"
        @search="reload" />

      <scroll-view scroll-y class="modal-list">
        <StateBlock v-if="loading && !options.length" class="modal-state" text="加载阵容中..." />

        <StateBlock v-else-if="!options.length" class="modal-state" :text="emptyText" />

        <template v-else>
          <view
            v-for="option in options"
            :key="option.id"
            class="option-card"
            :class="{ selected: isSelected(option.id) }"
            @click="toggle(option)">
            <view class="option-body">
              <view class="option-head">
                <text class="option-name">{{ option.name || '未命名阵容' }}</text>
                <text v-if="option.type" class="option-type">{{ getLineupTypeLabel(option.type) }}</text>
              </view>
              <LineupAvatarCard :characters="charactersOf(option)" :columns="6" :avatar-size="72" empty-text="暂无角色" />
            </view>
            <view class="option-check" :class="{ checked: isSelected(option.id) }">
              <text v-if="isSelected(option.id)">✓</text>
            </view>
          </view>

          <view v-if="pagination.hasNext" class="load-more">
            <button class="modal-more-btn" size="mini" :loading="loadingMore" @click="loadMore">加载更多</button>
          </view>
        </template>
      </scroll-view>

      <view class="modal-footer">
        <text class="footer-tip">已选 {{ selected.length }} 个</text>
        <view class="footer-actions">
          <button class="footer-btn ghost" size="mini" @click="close">取消</button>
          <button class="footer-btn primary" size="mini" :disabled="!selected.length" @click="confirm">确认添加</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import SearchActionRow from './search-action-row.vue'
  import StateBlock from './state-block.vue'
  import LineupAvatarCard from './lineup-avatar-card.vue'
  import { getLineupTypeLabel } from '../lineup-meta'
  import {
    fetchUserLineups,
    type LineupCharacterPreview,
    type PaginationState,
    type UserLineupSummary,
  } from '@/services/compendium-lineups'

  const PAGE_SIZE = 20

  const props = withDefaults(
    defineProps<{
      visible: boolean
      compendiumId: string
      locale?: string
      title?: string
      searchPlaceholder?: string
      emptyText?: string
      excludeIds?: string[]
    }>(),
    {
      locale: 'zh-CN',
      title: '选择阵容',
      searchPlaceholder: '搜索阵容名称或描述',
      emptyText: '暂无阵容可选',
      excludeIds: () => [],
    },
  )

  const emit = defineEmits<{
    (event: 'update:visible', value: boolean): void
    (event: 'confirm', value: UserLineupSummary[]): void
  }>()

  const keyword = ref('')
  const loading = ref(false)
  const loadingMore = ref(false)
  const options = ref<UserLineupSummary[]>([])
  const selected = ref<UserLineupSummary[]>([])
  const pagination = ref<PaginationState>({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 0, hasNext: false, hasPrev: false })

  const excludeSet = computed(() => new Set(props.excludeIds))

  const charactersOf = (option: UserLineupSummary): LineupCharacterPreview[] => option.characters || []

  const isSelected = (id: string): boolean => selected.value.some(item => item.id === id)

  const toggle = (option: UserLineupSummary) => {
    if (isSelected(option.id)) {
      selected.value = selected.value.filter(item => item.id !== option.id)
    } else {
      selected.value = [...selected.value, option]
    }
  }

  const loadPage = async (page: number) => {
    const result = await fetchUserLineups({
      compendiumId: props.compendiumId,
      locale: props.locale,
      keyword: keyword.value.trim() || undefined,
      status: 'enabled',
      page,
      pageSize: PAGE_SIZE,
    })
    pagination.value = result.pagination
    const filtered = result.items.filter(item => !excludeSet.value.has(item.id))
    options.value = page <= 1 ? filtered : [...options.value, ...filtered]
  }

  const reload = async () => {
    if (loading.value) return
    loading.value = true
    try {
      await loadPage(1)
    } catch (error) {
      uni.showToast({ title: typeof error === 'string' ? error : '加载阵容失败', icon: 'none' })
    } finally {
      loading.value = false
    }
  }

  const loadMore = async () => {
    if (loadingMore.value || !pagination.value.hasNext) return
    loadingMore.value = true
    try {
      await loadPage(pagination.value.page + 1)
    } catch (error) {
      uni.showToast({ title: typeof error === 'string' ? error : '加载失败', icon: 'none' })
    } finally {
      loadingMore.value = false
    }
  }

  const close = () => {
    emit('update:visible', false)
  }

  const confirm = () => {
    if (!selected.value.length) return
    emit('confirm', selected.value)
    close()
  }

  watch(
    () => props.visible,
    value => {
      if (value) {
        keyword.value = ''
        selected.value = []
        options.value = []
        reload()
      }
    },
  )
</script>

<style scoped lang="scss">
  .modal-mask {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.55);
    display: flex;
    align-items: flex-end;
    z-index: 100;
  }

  .modal-panel {
    width: 100%;
    max-height: 82vh;
    display: flex;
    flex-direction: column;
    background: #f6f7fb;
    border-radius: 28rpx 28rpx 0 0;
    padding: 24rpx;
    box-sizing: border-box;
  }

  .modal-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16rpx;
  }

  .modal-title {
    font-size: 32rpx;
    font-weight: 800;
    color: #172033;
  }

  .modal-close {
    font-size: 30rpx;
    color: #98a2b3;
    padding: 8rpx 12rpx;
  }

  .modal-search {
    margin-bottom: 16rpx;
  }

  .modal-list {
    flex: 1;
    min-height: 320rpx;
  }

  .modal-state {
    padding: 48rpx 28rpx;
    text-align: center;
    color: #667085;
    font-size: 26rpx;
  }

  .option-card {
    display: flex;
    align-items: center;
    gap: 16rpx;
    padding: 20rpx;
    margin-bottom: 16rpx;
    border-radius: 20rpx;
    background: #fff;
    border: 2rpx solid transparent;
  }

  .option-card.selected {
    border-color: #0f766e;
    background: #ecfeff;
  }

  .option-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 12rpx;
  }

  .option-head {
    display: flex;
    align-items: center;
    gap: 12rpx;
    flex-wrap: wrap;
  }

  .option-name {
    color: #172033;
    font-size: 28rpx;
    font-weight: 700;
  }

  .option-type {
    font-size: 22rpx;
    font-weight: 700;
    color: #0f766e;
    background: #ccfbf1;
    border-radius: 999rpx;
    padding: 4rpx 12rpx;
  }

  .option-check {
    width: 44rpx;
    height: 44rpx;
    border-radius: 50%;
    border: 2rpx solid #cbd5e1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 26rpx;
    font-weight: 800;
    flex-shrink: 0;
  }

  .option-check.checked {
    background: #0f766e;
    border-color: #0f766e;
  }

  .load-more {
    padding: 8rpx 0 16rpx;
    text-align: center;
  }

  .modal-more-btn {
    border-radius: 999rpx;
    font-size: 24rpx;
  }

  .modal-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 16rpx;
    border-top: 2rpx solid #e5e7eb;
  }

  .footer-tip {
    color: #667085;
    font-size: 24rpx;
    font-weight: 700;
  }

  .footer-actions {
    display: flex;
    gap: 16rpx;
  }

  .footer-btn {
    border-radius: 999rpx;
    font-size: 26rpx;
    font-weight: 700;
    padding: 0 32rpx;
  }

  .footer-btn.ghost {
    background: #eef2f7;
    color: #475467;
  }

  .footer-btn.primary {
    background: #0f766e;
    color: #fff;
  }
</style>
