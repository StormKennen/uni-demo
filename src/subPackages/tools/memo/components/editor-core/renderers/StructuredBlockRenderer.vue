<template>
  <view
    class="sbr-root"
    :class="[{ 'sbr-selected': selected, 'sbr-readonly': mode === 'readonly' }, `sbr-${block.type}`]"
    @click="selectBlock">
    <view v-if="mode === 'edit'" class="sbr-editor-header">
      <text class="sbr-tag">{{ blockLabel }}</text>
      <view class="sbr-header-btn" @click.stop="$emit('configure-block', blockIndex)">设置</view>
    </view>

    <view v-if="block.type === 'list'" class="sbr-list">
      <view v-for="(item, itemIndex) in block.children" :key="itemIndex" class="sbr-list-item">
        <view v-if="block.mode === 'checklist'" class="sbr-check" :class="{ checked: item.checked }" @click.stop="toggleChecked(itemIndex)">
          <text>{{ item.checked ? '✓' : '' }}</text>
        </view>
        <text v-else class="sbr-marker">{{ block.mode === 'number' ? `${itemIndex + 1}.` : '•' }}</text>
        <view class="sbr-list-content">
          <text class="sbr-list-text" :class="{ checked: item.checked }">{{ item.text || '未填写内容' }}</text>
          <text v-if="item.description" class="sbr-list-description">{{ item.description }}</text>
        </view>
        <view v-if="mode === 'edit'" class="sbr-item-actions">
          <view class="sbr-icon-btn" :class="{ disabled: itemIndex === 0 }" @click.stop="moveItem(itemIndex, -1)">↑</view>
          <view class="sbr-icon-btn" :class="{ disabled: itemIndex === block.children.length - 1 }" @click.stop="moveItem(itemIndex, 1)"
            >↓</view
          >
          <view class="sbr-icon-btn" @click.stop="$emit('select-item', blockIndex, itemIndex)">设置</view>
          <view class="sbr-icon-btn danger" @click.stop="removeItem(itemIndex)">×</view>
        </view>
      </view>
      <view v-if="mode === 'edit'" class="sbr-add" @click.stop="$emit('add-item', blockIndex)">+ 添加一项</view>
    </view>

    <view v-else-if="block.type === 'table'" class="sbr-table-wrap">
      <scroll-view class="sbr-table-scroll" :scroll-x="block.horizontalScroll">
        <view class="sbr-table" :style="tableStyle">
          <view v-if="block.header" class="sbr-table-row sbr-table-header">
            <view v-for="(_, columnIndex) in block.columns" :key="columnIndex" class="sbr-cell">
              <input
                v-if="mode === 'edit'"
                class="sbr-cell-input"
                :value="block.columns[columnIndex]"
                placeholder="列名"
                @input="updateColumn(columnIndex, $event)" />
              <text v-else>{{ block.columns[columnIndex] }}</text>
            </view>
          </view>
          <view v-for="(row, rowIndex) in block.children" :key="rowIndex" class="sbr-table-row">
            <view v-for="(_, columnIndex) in block.columns" :key="columnIndex" class="sbr-cell">
              <input
                v-if="mode === 'edit'"
                class="sbr-cell-input"
                :value="row.cells[columnIndex] || ''"
                placeholder="输入内容"
                @input="updateCell(rowIndex, columnIndex, $event)" />
              <text v-else>{{ row.cells[columnIndex] || '' }}</text>
            </view>
          </view>
        </view>
      </scroll-view>
      <view v-if="mode === 'edit'" class="sbr-table-actions">
        <view class="sbr-add compact" @click.stop="$emit('add-item', blockIndex)">+ 行</view>
        <view class="sbr-add compact" @click.stop="addColumn">+ 列</view>
        <view v-if="block.columns.length > 2" class="sbr-add compact danger" @click.stop="removeColumn">- 列</view>
      </view>
      <view v-if="mode === 'edit'" class="sbr-table-row-controls">
        <view v-for="(_, rowIndex) in block.children" :key="rowIndex" class="sbr-table-row-control">
          <text>第 {{ rowIndex + 1 }} 行</text>
          <view class="sbr-item-actions">
            <view class="sbr-icon-btn" :class="{ disabled: rowIndex === 0 }" @click.stop="moveTableRow(rowIndex, -1)">↑</view>
            <view class="sbr-icon-btn" :class="{ disabled: rowIndex === block.children.length - 1 }" @click.stop="moveTableRow(rowIndex, 1)"
              >↓</view
            >
            <view class="sbr-icon-btn danger" @click.stop="removeItem(rowIndex)">删除</view>
          </view>
        </view>
      </view>
    </view>

    <view v-else-if="block.type === 'callout'" class="sbr-callout" :class="`tone-${block.tone}`">
      <text class="sbr-callout-icon">{{ block.icon || toneIcon }}</text>
      <view class="sbr-callout-content">
        <text v-if="block.title" class="sbr-callout-title">{{ block.title }}</text>
        <text class="sbr-callout-text">{{ block.content || '暂无内容' }}</text>
      </view>
    </view>

    <view v-else-if="block.type === 'linkCard'" class="sbr-link-card" @click.stop="activateLinkCard">
      <image v-if="block.cover" class="sbr-link-cover" :src="block.cover" mode="aspectFill" />
      <view v-else class="sbr-link-icon">{{ block.icon || '↗' }}</view>
      <view class="sbr-link-content">
        <text class="sbr-link-title">{{ block.title || '未命名入口' }}</text>
        <text v-if="block.description" class="sbr-link-description">{{ block.description }}</text>
      </view>
      <text class="sbr-link-button">{{ block.buttonText || '查看' }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { ContentAction, StructuredMemoBlock, TableBlockData } from '../../../content-model'

  interface Props {
    block: StructuredMemoBlock
    blockIndex: number
    selected?: boolean
    mode?: 'edit' | 'readonly'
  }

  const props = withDefaults(defineProps<Props>(), { mode: 'edit', selected: false })
  const emit = defineEmits<{
    (e: 'select', blockIndex: number): void
    (e: 'select-item', blockIndex: number, itemIndex: number): void
    (e: 'add-item', blockIndex: number): void
    (e: 'configure-block', blockIndex: number): void
    (e: 'action', action: ContentAction): void
    (e: 'update:block', block: StructuredMemoBlock): void
  }>()

  const updateBlock = (mutate: (block: StructuredMemoBlock) => void) => {
    const nextBlock = JSON.parse(JSON.stringify(props.block)) as StructuredMemoBlock
    mutate(nextBlock)
    emit('update:block', nextBlock)
  }

  const blockLabel = computed(() => {
    const labels: Record<StructuredMemoBlock['type'], string> = {
      list: '列表 / 清单',
      table: '表格 / 信息',
      callout: '提示',
      linkCard: '链接卡片',
    }
    return labels[props.block.type]
  })

  const selectBlock = () => {
    if (props.mode === 'edit') emit('select', props.blockIndex)
  }

  const toggleChecked = (itemIndex: number) => {
    if (props.block.type !== 'list') return
    if (props.mode === 'readonly') return
    updateBlock(block => {
      if (block.type === 'list') block.children[itemIndex].checked = !block.children[itemIndex].checked
    })
  }

  const moveItem = (itemIndex: number, direction: -1 | 1) => {
    if (props.block.type !== 'list') return
    const target = itemIndex + direction
    if (target < 0 || target >= props.block.children.length) return
    updateBlock(block => {
      if (block.type !== 'list') return
      const [item] = block.children.splice(itemIndex, 1)
      block.children.splice(target, 0, item)
    })
  }

  const removeItem = (itemIndex: number) => {
    if (props.block.type !== 'list' && props.block.type !== 'table') return
    updateBlock(block => {
      if (block.type === 'list' || block.type === 'table') block.children.splice(itemIndex, 1)
    })
  }

  const tableBlock = computed<TableBlockData | null>(() => (props.block.type === 'table' ? props.block : null))
  const tableStyle = computed(() => ({
    gridTemplateColumns: `repeat(${Math.max(2, tableBlock.value?.columns.length || 2)}, minmax(180rpx, 1fr))`,
    textAlign: tableBlock.value?.align || 'left',
  }))

  const eventValue = (event: unknown): string => {
    if (!event || typeof event !== 'object') return ''
    const detail = (event as { detail?: { value?: unknown } }).detail
    return typeof detail?.value === 'string' ? detail.value : ''
  }

  const updateColumn = (columnIndex: number, event: unknown) => {
    if (!tableBlock.value) return
    updateBlock(block => {
      if (block.type === 'table') block.columns[columnIndex] = eventValue(event)
    })
  }

  const updateCell = (rowIndex: number, columnIndex: number, event: unknown) => {
    if (!tableBlock.value) return
    updateBlock(block => {
      if (block.type !== 'table') return
      const row = block.children[rowIndex]
      while (row.cells.length < block.columns.length) row.cells.push('')
      row.cells[columnIndex] = eventValue(event)
    })
  }

  const addColumn = () => {
    if (!tableBlock.value) return
    updateBlock(block => {
      if (block.type !== 'table') return
      block.columns.push(`列 ${block.columns.length + 1}`)
      block.children.forEach(row => row.cells.push(''))
    })
  }

  const removeColumn = () => {
    if (!tableBlock.value || tableBlock.value.columns.length <= 2) return
    updateBlock(block => {
      if (block.type !== 'table') return
      block.columns.pop()
      block.children.forEach(row => row.cells.pop())
    })
  }

  const moveTableRow = (rowIndex: number, direction: -1 | 1) => {
    if (!tableBlock.value) return
    const target = rowIndex + direction
    if (target < 0 || target >= tableBlock.value.children.length) return
    updateBlock(block => {
      if (block.type !== 'table') return
      const [row] = block.children.splice(rowIndex, 1)
      block.children.splice(target, 0, row)
    })
  }

  const toneIcon = computed(() => {
    if (props.block.type !== 'callout') return ''
    return { info: 'i', warning: '!', danger: '!!', success: '✓', note: '•' }[props.block.tone]
  })

  const activateLinkCard = () => {
    if (props.block.type !== 'linkCard') return
    if (props.mode === 'edit') emit('configure-block', props.blockIndex)
    else emit('action', props.block.action)
  }
</script>

<style scoped>
  .sbr-root {
    padding: 20rpx;
    margin-bottom: 16rpx;
    border-radius: 8rpx;
    background: var(--theme-surface);
  }
  .sbr-selected {
    box-shadow: 0 0 0 2rpx #667eea;
  }
  .sbr-readonly {
    padding: 0;
    background: transparent;
  }
  .sbr-editor-header,
  .sbr-table-actions,
  .sbr-item-actions {
    display: flex;
    align-items: center;
    gap: 8rpx;
  }
  .sbr-editor-header {
    justify-content: space-between;
    margin-bottom: 16rpx;
  }
  .sbr-tag {
    color: var(--theme-text-tertiary);
    font-size: 22rpx;
  }
  .sbr-header-btn,
  .sbr-icon-btn {
    min-width: 52rpx;
    height: 48rpx;
    padding: 0 12rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text-secondary);
    font-size: 22rpx;
    box-sizing: border-box;
  }
  .sbr-icon-btn.disabled {
    opacity: 0.35;
  }
  .sbr-icon-btn.danger,
  .sbr-add.danger {
    color: #d64545;
  }
  .sbr-list {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
  }
  .sbr-list-item {
    display: flex;
    align-items: flex-start;
    gap: 12rpx;
    min-height: 56rpx;
  }
  .sbr-check {
    width: 36rpx;
    height: 36rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2rpx solid var(--theme-border);
    border-radius: 6rpx;
    color: #fff;
    flex-shrink: 0;
  }
  .sbr-check.checked {
    background: #2f855a;
    border-color: #2f855a;
  }
  .sbr-marker {
    width: 36rpx;
    color: var(--theme-text-tertiary);
    text-align: right;
    flex-shrink: 0;
  }
  .sbr-list-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }
  .sbr-list-text {
    color: var(--theme-text);
    font-size: 28rpx;
    line-height: 1.55;
  }
  .sbr-list-text.checked {
    color: var(--theme-text-tertiary);
    text-decoration: line-through;
  }
  .sbr-list-description {
    margin-top: 4rpx;
    color: var(--theme-text-secondary);
    font-size: 23rpx;
    line-height: 1.45;
  }
  .sbr-add {
    padding: 18rpx;
    border: 1rpx dashed var(--theme-border);
    border-radius: 8rpx;
    color: #5269c7;
    font-size: 24rpx;
    text-align: center;
  }
  .sbr-add.compact {
    flex: 1;
    padding: 14rpx;
  }
  .sbr-table-scroll {
    width: 100%;
  }
  .sbr-table {
    min-width: 100%;
    display: grid;
    border-top: 1rpx solid var(--theme-border);
    border-left: 1rpx solid var(--theme-border);
  }
  .sbr-table-row {
    display: contents;
  }
  .sbr-cell {
    min-height: 72rpx;
    padding: 14rpx 16rpx;
    display: flex;
    align-items: center;
    border-right: 1rpx solid var(--theme-border);
    border-bottom: 1rpx solid var(--theme-border);
    color: var(--theme-text);
    font-size: 24rpx;
    box-sizing: border-box;
  }
  .sbr-table-header .sbr-cell {
    background: var(--theme-surface-2);
    font-weight: 600;
  }
  .sbr-cell-input {
    width: 100%;
    color: var(--theme-text);
    font-size: 24rpx;
  }
  .sbr-table-row-action {
    display: none;
  }
  .sbr-table-actions {
    margin-top: 12rpx;
  }
  .sbr-table-row-controls {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
    margin-top: 12rpx;
  }
  .sbr-table-row-control {
    min-height: 56rpx;
    padding: 8rpx 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: var(--theme-text-secondary);
    font-size: 22rpx;
    border-bottom: 1rpx solid var(--theme-border);
  }
  .sbr-callout {
    display: flex;
    gap: 16rpx;
    padding: 22rpx;
    border-left: 8rpx solid #3b82b6;
    border-radius: 6rpx;
    background: rgba(59, 130, 182, 0.1);
  }
  .sbr-callout.tone-warning {
    border-color: #c48224;
    background: rgba(196, 130, 36, 0.11);
  }
  .sbr-callout.tone-danger {
    border-color: #c84b4b;
    background: rgba(200, 75, 75, 0.1);
  }
  .sbr-callout.tone-success {
    border-color: #2f855a;
    background: rgba(47, 133, 90, 0.1);
  }
  .sbr-callout.tone-note {
    border-color: #777;
    background: var(--theme-surface-2);
  }
  .sbr-callout-icon {
    width: 40rpx;
    flex-shrink: 0;
    color: var(--theme-text-secondary);
    font-size: 28rpx;
    font-weight: 700;
  }
  .sbr-callout-content {
    display: flex;
    flex-direction: column;
    gap: 6rpx;
  }
  .sbr-callout-title {
    color: var(--theme-text);
    font-size: 27rpx;
    font-weight: 600;
  }
  .sbr-callout-text {
    color: var(--theme-text-secondary);
    font-size: 25rpx;
    line-height: 1.6;
  }
  .sbr-link-card {
    display: flex;
    align-items: center;
    gap: 18rpx;
    min-height: 112rpx;
    padding: 18rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 8rpx;
    background: var(--theme-surface);
  }
  .sbr-link-cover,
  .sbr-link-icon {
    width: 88rpx;
    height: 88rpx;
    border-radius: 6rpx;
    flex-shrink: 0;
  }
  .sbr-link-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--theme-surface-2);
    color: var(--theme-text-secondary);
    font-size: 36rpx;
  }
  .sbr-link-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6rpx;
  }
  .sbr-link-title {
    color: var(--theme-text);
    font-size: 28rpx;
    font-weight: 600;
  }
  .sbr-link-description {
    color: var(--theme-text-secondary);
    font-size: 23rpx;
    line-height: 1.4;
  }
  .sbr-link-button {
    color: #5269c7;
    font-size: 24rpx;
    flex-shrink: 0;
  }
</style>
