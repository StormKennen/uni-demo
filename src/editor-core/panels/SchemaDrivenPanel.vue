<!--
  SchemaDrivenPanel —— Phase 1 通用控制面板。
  
  职责：
    - 接收 BlockSchema + 当前 block 数据
    - 进入面板时基于 block 深拷贝出 draft（草稿）
    - 用户在面板里改 draft，原 block 不动
    - 点"保存" → emit('save', draft)，由父组件决定如何写回
    - 点"取消" → 丢弃 draft
  
  这是迁移期的"草稿协议"实现，让 schema 驱动的面板与现有
  useDraftPanel 协议保持一致的 UX（防误改 + 可撤销）。
-->
<template>
  <view v-if="visible && schema" class="sdp-mask" @click.self="onCancel">
    <view class="sdp-sheet">
      <view class="sdp-header">
        <text class="sdp-title">{{ title }}</text>
        <view class="sdp-close" @click="onCancel">×</view>
      </view>

      <scroll-view class="sdp-body" scroll-y>
        <!-- block 模式：渲染 style + business 两组 -->
        <template v-if="mode === 'block'">
          <view v-if="(schema.styleSchema || []).length" class="sdp-section">
            <text class="sdp-section-title">样式</text>
            <SchemaForm :schema="schema.styleSchema!" :model-value="draft" />
          </view>

          <view v-if="(schema.businessSchema || []).length" class="sdp-section">
            <text class="sdp-section-title">业务</text>
            <SchemaForm :schema="schema.businessSchema!" :model-value="draft" />
          </view>
        </template>

        <!-- item 模式：渲染 itemSchema 单组 -->
        <template v-else-if="mode === 'item'">
          <view v-if="(schema.itemSchema || []).length" class="sdp-section">
            <text class="sdp-section-title">条目配置</text>
            <SchemaForm :schema="schema.itemSchema!" :model-value="draft" />
          </view>
        </template>

        <!-- 既无 style 也无 business 时友好提示 -->
        <view v-if="isEmpty" class="sdp-empty">
          <text>该 {{ mode === 'item' ? '条目' : 'Block' }} 暂无可配置项</text>
        </view>
      </scroll-view>

      <view class="sdp-footer">
        <view class="sdp-btn sdp-btn-cancel" @click="onCancel">取消</view>
        <view class="sdp-btn sdp-btn-save" @click="onSave">保存</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { BlockSchema } from '../schemas/block-schema'
import SchemaForm from '../forms/SchemaForm.vue'

interface Props {
  /** 控制可见性，配合 v-model 使用 */
  visible: boolean
  /** 当前 block 的 schema（来自 registry.getBlockSchema(type)） */
  schema: BlockSchema | null
  /** 当前 block 数据，会被深拷贝成 draft（block 模式时是整个 block，item 模式时仍传整个 block） */
  block: any
  /**
   * 面板模式：
   *  - 'block'：配置 styleSchema / businessSchema，draft = 整个 block
   *  - 'item' ：配置 itemSchema，draft = block.children[itemIndex]（或自定义 itemArrayKey）
   * 默认 'block'。
   */
  mode?: 'block' | 'item'
  /** item 模式下指向哪一个子项 */
  itemIndex?: number
}

const props = withDefaults(defineProps<Props>(), { mode: 'block', itemIndex: 0 })

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  /**
   * block 模式：参数 = draft（整个新 block）
   * item  模式：参数 = { itemIndex, item }（让父组件知道改的是哪个 item）
   */
  (e: 'save', payload: any): void
  (e: 'cancel'): void
}>()

const draft = ref<any>(null)

// 取 item 数组的字段名（默认 children；路径块是 content）
const itemArrayKey = computed(() => props.schema?.itemArrayKey || 'children')

// 每次面板打开时，基于 block / item 深拷贝出 draft
watch(
  () => [props.visible, props.block, props.mode, props.itemIndex],
  ([vis, blk, mode, idx]) => {
    if (!vis || !blk) return
    if (mode === 'item') {
      const arr = (blk as any)[itemArrayKey.value] || []
      const target = arr[idx as number]
      draft.value = target ? JSON.parse(JSON.stringify(target)) : null
    } else {
      draft.value = JSON.parse(JSON.stringify(blk))
    }
  },
  { immediate: true }
)

// 显示标题
const title = computed(() => {
  if (!props.schema) return ''
  if (props.mode === 'item') {
    return `${props.schema.label}条目 · 第 ${(props.itemIndex || 0) + 1} 项`
  }
  return `${props.schema.label}设置`
})

const isEmpty = computed(() => {
  if (!props.schema) return true
  if (props.mode === 'item') return (props.schema.itemSchema?.length || 0) === 0
  const a = props.schema.styleSchema?.length || 0
  const b = props.schema.businessSchema?.length || 0
  return a + b === 0
})

const onCancel = () => {
  emit('cancel')
  emit('update:visible', false)
}

const onSave = () => {
  if (!draft.value) {
    emit('update:visible', false)
    return
  }
  if (props.mode === 'item') {
    emit('save', { itemIndex: props.itemIndex, item: draft.value })
  } else {
    emit('save', draft.value)
  }
  emit('update:visible', false)
}
</script>

<style scoped>
.sdp-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-end;
  z-index: 999;
}

.sdp-sheet {
  width: 100%;
  background: #fff;
  border-top-left-radius: 24rpx;
  border-top-right-radius: 24rpx;
  display: flex;
  flex-direction: column;
  max-height: 80vh;
}

.sdp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #eee;
}

.sdp-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.sdp-close {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  color: #999;
}

.sdp-body {
  flex: 1;
  max-height: 60vh;
}

.sdp-section {
  padding: 12rpx 16rpx;
}

.sdp-section-title {
  display: block;
  font-size: 24rpx;
  color: #888;
  padding: 8rpx 16rpx;
  text-transform: uppercase;
}

.sdp-empty {
  padding: 60rpx 32rpx;
  text-align: center;
  color: #888;
  font-size: 26rpx;
}

.sdp-footer {
  display: flex;
  gap: 24rpx;
  padding: 20rpx 32rpx 40rpx;
  border-top: 1rpx solid #eee;
}

.sdp-btn {
  flex: 1;
  text-align: center;
  padding: 24rpx 0;
  border-radius: 12rpx;
  font-size: 28rpx;
}

.sdp-btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.sdp-btn-save {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}
</style>
