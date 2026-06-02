<!--
  SchemaEditorDemo —— Phase 1 演示页面
  
  布局：
    - 顶栏：标题 + "+文字" / "+图片"（通过 schema.createDefault 创建）
    - 主区：纵向块列表（BlockHost 分发渲染）
    - 弹出：点击块上的 ⚙️ → SchemaDrivenPanel
  
  目的：用最少代码证明 schema → renderer + panel 链路通畅。
-->
<template>
  <view class="sed-page">
    <!-- 顶栏 -->
    <view class="sed-topbar">
      <text class="sed-title">Schema Editor</text>
    </view>

    <!-- 画布 -->
    <scroll-view scroll-y class="sed-canvas">
      <view v-if="!doc.length" class="sed-empty">
        <text class="sed-empty-icon">📄</text>
        <text>点击右下角 "+" 添加第一个内容块</text>
      </view>

      <view
        v-for="(block, idx) in doc"
        :key="idx"
        class="sed-row"
      >
        <BlockHost
          :block="block"
          :block-index="idx"
          :selected="selectedIndex === idx"
          @select="selectedIndex = idx"
          @select-item="onSelectItem"
          @add-item="onAddItem"
        />
        <!-- 块级操作按钮 -->
        <view class="sed-row-actions">
          <view v-if="idx > 0" class="sed-row-btn" @click="moveBlock(idx, -1)">↑</view>
          <view v-if="idx < doc.length - 1" class="sed-row-btn" @click="moveBlock(idx, 1)">↓</view>
          <picker
            mode="selector"
            :range="getMovePositions(idx)"
            range-key="label"
            @change="onMoveBlockPick(idx, Number($event.detail.value))"
          >
            <view class="sed-row-btn" @click.stop>≡</view>
          </picker>
          <view class="sed-row-btn" @click="openBlockPanel(idx)">⚙️</view>
          <view class="sed-row-btn sed-del" @click="removeBlock(idx)">×</view>
        </view>
      </view>
    </scroll-view>

    <!-- FAB 悬浮按钮 -->
    <view class="fab-container" v-if="!panelVisible">
      <view class="fab-overlay" v-if="fabExpanded" @click="fabExpanded = false" />
      <view class="fab-actions" :class="{ expanded: fabExpanded }">
        <view
          v-for="s in allSchemas"
          :key="s.type"
          class="fab-action-btn"
          @click="addBlockAndClose(s.type)"
        >
          <text class="fab-action-text">{{ s.icon }} {{ s.label }}</text>
        </view>
      </view>
      <view class="fab-main-btn" :class="{ active: fabExpanded }" @click="fabExpanded = !fabExpanded">
        <text class="fab-main-icon">{{ fabExpanded ? '×' : '+' }}</text>
      </view>
    </view>

    <!-- 底部操作 -->
    <view class="sed-footer">
      <view class="sed-footer-btn sed-footer-preview" @click="onPreview">预览</view>
      <view class="sed-footer-btn sed-footer-save" @click="onSave">保存</view>
    </view>

    <!-- 控制面板（schema 驱动） — 支持 block / item 两种模式 -->
    <SchemaDrivenPanel
      v-model:visible="panelVisible"
      :schema="editingSchema"
      :block="editingBlock"
      :mode="panelMode"
      :item-index="editingItemIndex"
      @save="onPanelSave"
    />
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import BlockHost from '../renderers/BlockHost.vue'
import SchemaDrivenPanel from '../panels/SchemaDrivenPanel.vue'
// 触发副作用，自动把 Text/Image 注册进 registry
import { getAllBlockSchemas, getBlockSchema } from '../registry'

// 顶部 "+按钮" 数据源
const allSchemas = computed(() => getAllBlockSchemas())

// 文档：根级 block 数组
const doc = reactive<any[]>([])

const selectedIndex = ref<number>(-1)

// ===== FAB 状态 =====
const fabExpanded = ref(false)

const addBlock = (type: string) => {
  const schema = getBlockSchema(type)
  if (!schema) return
  doc.push(schema.createDefault())
}

const addBlockAndClose = (type: string) => {
  addBlock(type)
  fabExpanded.value = false
}

const removeBlock = (idx: number) => {
  doc.splice(idx, 1)
  if (selectedIndex.value === idx) selectedIndex.value = -1
}

// ===== Block 排序 =====
const moveBlock = (idx: number, dir: -1 | 1) => {
  const target = idx + dir
  if (target < 0 || target >= doc.length) return
  const tmp = doc[idx]
  doc.splice(idx, 1)
  doc.splice(target, 0, tmp)
  if (selectedIndex.value === idx) selectedIndex.value = target
}

const getMovePositions = (currentIdx: number) => {
  return doc.map((_: any, i: number) => ({
    label: i === currentIdx ? `位置 ${i + 1}（当前）` : `移到位置 ${i + 1}`,
  }))
}

const onMoveBlockPick = (fromIdx: number, toIdx: number) => {
  if (fromIdx === toIdx) return
  const tmp = doc[fromIdx]
  doc.splice(fromIdx, 1)
  doc.splice(toIdx, 0, tmp)
  if (selectedIndex.value === fromIdx) selectedIndex.value = toIdx
}

// ===== 控制面板状态 =====
const panelVisible = ref(false)
const panelMode = ref<'block' | 'item'>('block')
const editingIndex = ref<number>(-1)
const editingItemIndex = ref<number>(0)

const editingBlock = computed(() =>
  editingIndex.value >= 0 ? doc[editingIndex.value] : null
)
const editingSchema = computed(() => {
  const blk = editingBlock.value
  return blk ? getBlockSchema(blk.type) || null : null
})

const openBlockPanel = (idx: number) => {
  editingIndex.value = idx
  selectedIndex.value = idx
  panelMode.value = 'block'
  panelVisible.value = true
}

/** Renderer 内 item 上点击 ⚙️ 时触发 */
const onSelectItem = (blockIndex: number, itemIndex: number) => {
  editingIndex.value = blockIndex
  selectedIndex.value = blockIndex
  editingItemIndex.value = itemIndex
  panelMode.value = 'item'
  panelVisible.value = true
}

/** 用户点击 Renderer 内的"+ 添加项"按钮 */
const onAddItem = (blockIndex: number) => {
  const block = doc[blockIndex]
  if (!block) return
  const schema = getBlockSchema(block.type)
  if (!schema || !schema.createDefaultItem) {
    uni.showToast({ title: '该 Block 不支持添加 item', icon: 'none' })
    return
  }
  const arrKey = schema.itemArrayKey || 'children'
  const arr: any[] = block[arrKey] || []
  arr.push(schema.createDefaultItem())
}

const onPanelSave = (payload: any) => {
  if (editingIndex.value < 0) return
  if (panelMode.value === 'item') {
    // payload = { itemIndex, item }
    const block = doc[editingIndex.value]
    if (!block) return
    const arrKey = editingSchema.value?.itemArrayKey || 'children'
    const arr: any[] = block[arrKey] || []
    arr.splice(payload.itemIndex, 1, payload.item)
  } else {
    // block 模式：payload = 整块新 block
    doc.splice(editingIndex.value, 1, payload)
  }
}

// ===== 底部操作 =====
const onPreview = () => {
  console.log('[Preview] doc:', JSON.parse(JSON.stringify(doc)))
  uni.showToast({ title: '数据已打印到控制台', icon: 'none' })
}

const onSave = () => {
  console.log('[Save] doc:', JSON.parse(JSON.stringify(doc)))
  uni.showToast({ title: '保存成功（Demo 仅控制台输出）', icon: 'none' })
}
</script>

<style scoped>
.sed-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

/* ===== 顶栏 ===== */
.sed-topbar {
  flex-shrink: 0;
  padding: 24rpx 32rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.sed-title {
  font-size: 36rpx;
  font-weight: 600;
}

/* ===== 画布 ===== */
.sed-canvas {
  flex: 1;
  padding: 16rpx;
  padding-bottom: 180rpx;
}

.sed-empty {
  padding: 120rpx 24rpx;
  text-align: center;
  color: #aaa;
  font-size: 26rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.sed-empty-icon {
  font-size: 80rpx;
  opacity: 0.3;
}

.sed-row {
  position: relative;
  margin-bottom: 16rpx;
}

/* ===== 块操作按钮 ===== */
.sed-row-actions {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  display: flex;
  gap: 8rpx;
}

.sed-row-btn {
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.sed-del {
  color: #f55;
  font-size: 34rpx;
}

/* ===== FAB 悬浮按钮 ===== */
.fab-container {
  position: fixed;
  right: 40rpx;
  bottom: 200rpx;
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 16rpx;
}

.fab-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
  z-index: 99;
}

.fab-actions {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  opacity: 0;
  transform: translateY(20rpx);
  pointer-events: none;
  transition: all 0.25s ease;
}

.fab-actions.expanded {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.fab-action-btn {
  padding: 16rpx 32rpx;
  background: #fff;
  border-radius: 40rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.12);
  z-index: 101;
}

.fab-action-btn:active {
  background: #f5f5f5;
}

.fab-action-text {
  font-size: 26rpx;
  color: #333;
  white-space: nowrap;
}

.fab-main-btn {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.4);
  z-index: 101;
  transition: transform 0.25s ease;
}

.fab-main-btn.active {
  transform: rotate(45deg);
}

.fab-main-icon {
  font-size: 48rpx;
  color: #fff;
  font-weight: 300;
}

/* ===== 底部操作 ===== */
.sed-footer {
  flex-shrink: 0;
  display: flex;
  gap: 24rpx;
  padding: 20rpx 32rpx 40rpx;
  background: #fff;
  border-top: 1rpx solid #eee;
}

.sed-footer-btn {
  flex: 1;
  text-align: center;
  padding: 24rpx 0;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 500;
}

.sed-footer-preview {
  background: #f5f5f5;
  color: #666;
}

.sed-footer-save {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}
</style>
