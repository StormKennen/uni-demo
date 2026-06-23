<template>
  <view class="section-card">
    <view class="section-head">
      <text class="section-title">{{ title }}</text>
      <text v-if="tip" class="section-tip">{{ tip }}</text>
    </view>

    <view v-if="selectedItems.length" class="selected-list">
      <view
        v-for="item in selectedItems"
        :key="item.id"
        class="selected-card"
        :class="{ highlight: selectedHighlight }">
        <view class="option-main">
          <text class="option-name">{{ item.name || '未命名阵容' }}</text>
          <text class="option-desc">{{ item.description || '暂无描述' }}</text>
        </view>
        <button class="mini-btn danger" size="mini" @click="$emit('remove', item.id)">{{ selectedActionText }}</button>
      </view>
    </view>

    <StateBlock v-else-if="selectedEmptyText" class="empty-block selected-empty-block" :text="selectedEmptyText" />

    <SearchActionRow
      v-model="draftKeyword"
      class="search-row"
      :placeholder="searchPlaceholder"
      :button-text="searchButtonText"
      theme="teal"
      :disabled="disabled"
      @search="emitSearch" />

    <StateBlock v-if="loading && !options.length" class="empty-block" :text="loadingText" />

    <StateBlock v-else-if="!options.length" class="empty-block" :text="emptyText" />

    <view v-else class="option-list">
      <view v-for="option in options" :key="option.id" class="option-card">
        <view class="option-main">
          <text class="option-name">{{ option.name || '未命名阵容' }}</text>
          <text class="option-desc">{{ option.description || '暂无描述' }}</text>
        </view>
        <button class="mini-btn" size="mini" :disabled="disabled" @click="$emit('toggle', option)">
          {{ getActionText(option.id) }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import type { LineupOption } from '@/services/compendium-lineups'
  import SearchActionRow from './search-action-row.vue'
  import StateBlock from './state-block.vue'

  type SelectionMode = 'single' | 'multiple'

  const props = withDefaults(defineProps<{
    title: string
    tip?: string
    keyword?: string
    options?: LineupOption[]
    selectedIds?: string[]
    selectedItems?: LineupOption[]
    selectionMode?: SelectionMode
    selectedEmptyText?: string
    selectedActionText?: string
    selectedHighlight?: boolean
    searchPlaceholder?: string
    searchButtonText?: string
    loadingText?: string
    emptyText?: string
    loading?: boolean
    disabled?: boolean
  }>(), {
    tip: '',
    keyword: '',
    options: () => [],
    selectedIds: () => [],
    selectedItems: () => [],
    selectionMode: 'single',
    selectedEmptyText: '',
    selectedActionText: '移除',
    selectedHighlight: false,
    searchPlaceholder: '请输入关键词',
    searchButtonText: '搜索',
    loadingText: '加载中...',
    emptyText: '暂无可选项',
    loading: false,
    disabled: false,
  })

  const emit = defineEmits<{
    (event: 'update:keyword', value: string): void
    (event: 'search'): void
    (event: 'toggle', option: LineupOption): void
    (event: 'remove', lineupId: string): void
  }>()

  const draftKeyword = ref(props.keyword)

  const isSelected = (lineupId: string): boolean =>
    props.selectedIds.includes(lineupId)

  const getActionText = (lineupId: string): string => {
    if (props.selectionMode === 'single') {
      return isSelected(lineupId) ? '当前已选' : '选择'
    }
    return isSelected(lineupId) ? '移除' : '添加'
  }

  const emitSearch = () => {
    emit('update:keyword', draftKeyword.value)
    emit('search')
  }

  watch(
    () => props.keyword,
    value => {
      draftKeyword.value = value
    },
  )
</script>

<style scoped lang="scss">
  .section-card {
    margin: 24rpx;
    padding: 24rpx;
    border-radius: 24rpx;
    background: #fff;
    box-shadow: 0 10rpx 30rpx rgba(15, 23, 42, 0.06);
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
    margin-top: 20rpx;
    margin-bottom: 20rpx;
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
    gap: 16rpx;
    padding: 20rpx;
    border-radius: 20rpx;
    background: #f8fafc;
  }

  .selected-card.highlight {
    background: #ecfeff;
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

  .mini-btn {
    border-radius: 999rpx;
    font-size: 24rpx;
    font-weight: 700;
  }

  .mini-btn.danger {
    color: #dc2626;
  }

  .empty-block {
    padding: 48rpx 28rpx;
    text-align: center;
    color: #667085;
    font-size: 28rpx;
  }

  .selected-empty-block {
    padding-top: 12rpx;
    padding-bottom: 12rpx;
  }
</style>
