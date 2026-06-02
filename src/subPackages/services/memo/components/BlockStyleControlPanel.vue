<template>
  <DraftPanelShell
    :visible="visible"
    :title="panelTitle"
    :is-dirty="isDirty"
    layout="bottom-sheet"
    @reset="reset"
    @cancel="cancel"
    @save="save"
  >
    <!-- Section: 边框 -->
    <view class="bcp-section">
      <view class="bcp-section-header" @click="toggle('border')">
        <text class="bcp-section-title">📏 边框</text>
        <text class="bcp-arrow" :class="{ open: open.border }">▾</text>
      </view>
      <view v-show="open.border" class="bcp-section-body">
        <view v-for="side in (['top','bottom','left','right'] as const)" :key="side" class="bcp-border-row">
          <text class="bcp-label">{{ sideLabel[side] }}边框</text>
          <slider
            class="bcp-slider"
            :value="draft.style.border[side].width || 0"
            :min="0"
            :max="10"
            :step="1"
            activeColor="#667eea"
            @change="draft.style.border[side].width = $event.detail.value"
          />
          <text class="bcp-value">{{ draft.style.border[side].width || 0 }}rpx</text>
          <input
            class="bcp-color-input"
            :value="draft.style.border[side].color || '#eeeeee'"
            @input="draft.style.border[side].color = $event.detail.value"
            placeholder="#色值"
          />
        </view>
      </view>
    </view>

    <!-- Section: 对齐 -->
    <view class="bcp-section">
      <view class="bcp-section-header" @click="toggle('align')">
        <text class="bcp-section-title">↔️ 对齐</text>
        <text class="bcp-arrow" :class="{ open: open.align }">▾</text>
      </view>
      <view v-show="open.align" class="bcp-section-body">
        <view class="bcp-align-row">
          <view
            v-for="a in (['left','center','right'] as const)"
            :key="a"
            class="bcp-align-btn"
            :class="{ active: (draft.style.textAlign || 'left') === a }"
            @click="draft.style.textAlign = a"
          >
            {{ alignLabel[a] }}
          </view>
        </view>
      </view>
    </view>

    <!-- Section: 间距与圆角 -->
    <view class="bcp-section">
      <view class="bcp-section-header" @click="toggle('spacing')">
        <text class="bcp-section-title">📐 间距 / 圆角</text>
        <text class="bcp-arrow" :class="{ open: open.spacing }">▾</text>
      </view>
      <view v-show="open.spacing" class="bcp-section-body">
        <view v-for="side in (['top','bottom','left','right'] as const)" :key="side" class="bcp-padding-row">
          <text class="bcp-label">内边距 {{ sideLabel[side] }}</text>
          <slider
            class="bcp-slider"
            :value="draft.style.padding[side] || 0"
            :min="0"
            :max="100"
            :step="4"
            activeColor="#667eea"
            @change="draft.style.padding[side] = $event.detail.value"
          />
          <text class="bcp-value">{{ draft.style.padding[side] || 0 }}rpx</text>
        </view>
        <view class="bcp-padding-row">
          <text class="bcp-label">圆角</text>
          <slider
            class="bcp-slider"
            :value="draft.style.borderRadius || 0"
            :min="0"
            :max="40"
            :step="2"
            activeColor="#667eea"
            @change="draft.style.borderRadius = $event.detail.value"
          />
          <text class="bcp-value">{{ draft.style.borderRadius || 0 }}rpx</text>
        </view>
      </view>
    </view>

    <!-- Section: 颜色 -->
    <view class="bcp-section">
      <view class="bcp-section-header" @click="toggle('color')">
        <text class="bcp-section-title">🎨 颜色</text>
        <text class="bcp-arrow" :class="{ open: open.color }">▾</text>
      </view>
      <view v-show="open.color" class="bcp-section-body">
        <view class="bcp-color-label">背景颜色</view>
        <view class="bcp-color-grid">
          <view
            v-for="c in morandiColors"
            :key="c.value"
            class="bcp-color-option"
            :class="{ active: draft.style.backgroundColor === c.value }"
            :style="{ backgroundColor: c.value }"
            @click="draft.style.backgroundColor = c.value"
          >
            <text v-if="draft.style.backgroundColor === c.value" class="bcp-check">✓</text>
          </view>
          <view
            class="bcp-color-option transparent"
            :class="{ active: !draft.style.backgroundColor }"
            @click="draft.style.backgroundColor = ''"
          >
            <text class="bcp-transparent-label">透明</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Section: 高级 -->
    <view class="bcp-section">
      <view class="bcp-section-header" @click="toggle('advanced')">
        <text class="bcp-section-title">⚙️ 高级</text>
        <text class="bcp-arrow" :class="{ open: open.advanced }">▾</text>
      </view>
      <view v-show="open.advanced" class="bcp-section-body">
        <!-- 块锁定（所有类型可用） -->
        <view class="bcp-switch-row">
          <view class="bcp-switch-info">
            <text class="bcp-switch-label">🔒 锁定此块</text>
            <text class="bcp-switch-desc">锁定后不可拖动 / 删除（仍可编辑内容）</text>
          </view>
          <switch
            :checked="draft.style.locked === true"
            @change="draft.style.locked = $event.detail.value"
            color="#e6a23c"
          />
        </view>

        <!-- Markdown（仅 text） -->
        <view v-if="blockType === 'text'" class="bcp-switch-row">
          <view class="bcp-switch-info">
            <text class="bcp-switch-label">Markdown 模式</text>
            <text class="bcp-switch-desc">开启后支持 Markdown 语法渲染</text>
          </view>
          <switch
            :checked="draft.business.isMarkdown === true"
            @change="draft.business.isMarkdown = $event.detail.value"
            color="#667eea"
          />
        </view>

        <!-- 路径块：显示时间 -->
        <view v-if="blockType === 'route'" class="bcp-switch-row">
          <view class="bcp-switch-info">
            <text class="bcp-switch-label">显示耗时信息</text>
            <text class="bcp-switch-desc">在路径节点旁显示时间和交通方式</text>
          </view>
          <switch
            :checked="draft.business.showTime !== false"
            @change="draft.business.showTime = $event.detail.value"
            color="#667eea"
          />
        </view>

        <!-- 附件块：AppID -->
        <view v-if="blockType === 'attachment'" class="bcp-input-row">
          <text class="bcp-switch-label">小程序 AppID</text>
          <input
            class="bcp-text-input"
            :value="draft.business.appId || 'wxd45c635d754dbf59'"
            @input="draft.business.appId = $event.detail.value"
            placeholder="腾讯文档: wxd45c635d754dbf59"
          />
          <text class="bcp-switch-desc">默认跳转腾讯文档小程序</text>
        </view>

        <!-- 3D 悬浮（图片块） -->
        <view v-if="blockType === 'image'" class="bcp-switch-row">
          <view class="bcp-switch-info">
            <text class="bcp-switch-label">3D 悬浮模式</text>
            <text class="bcp-switch-desc">在详情页生成 3D 悬浮视差</text>
          </view>
          <switch
            :checked="draft.style.enable3DMode === true"
            @change="draft.style.enable3DMode = $event.detail.value"
            color="#667eea"
          />
        </view>

        <!-- 扑克牌翻转（所有） -->
        <view class="bcp-switch-row">
          <view class="bcp-switch-info">
            <text class="bcp-switch-label">🃏 扑克牌翻转</text>
            <text class="bcp-switch-desc">初次加载显示牌背，点击翻开内容</text>
          </view>
          <switch
            :checked="draft.style.enablePokerCard === true"
            @change="draft.style.enablePokerCard = $event.detail.value"
            color="#764ba2"
          />
        </view>
      </view>
    </view>
  </DraftPanelShell>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue'
import { cloneDeep } from 'lodash-es'
import DraftPanelShell from './DraftPanelShell.vue'
import { useDraftPanel } from '../composables/useDraftPanel'

interface MorandiColor { value: string; label: string }

const props = defineProps<{
  modelValue: boolean
  block: any | null
  morandiColors: MorandiColor[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'save', payload: { style: any; business: Record<string, any> }): void
}>()

const open = reactive({
  border: true,
  align: true,
  spacing: true,
  color: true,
  advanced: true
})
function toggle(key: keyof typeof open) { open[key] = !open[key] }

const sideLabel = { top: '上', bottom: '下', left: '左', right: '右' } as const
const alignLabel = { left: '左', center: '中', right: '右' } as const

const blockType = computed(() => props.block?.type || 'text')
const panelTitle = computed(() => {
  const map: Record<string, string> = {
    text: '文本块',
    image: '图片块',
    route: '路径块',
    attachment: '附件块',
    media: '媒体块',
    checklist: '清单块',
    quote: '引用块',
    divider: '分割线块',
    code: '代码块'
  }
  return (map[blockType.value] || '内容块') + ' 设置'
})

// 从 block 中提取出 style + business
function extractFromBlock(block: any) {
  const style = cloneDeep(block?.style || {}) as any
  // 确保结构齐全（避免渲染时空指针）
  style.padding ||= { top: 0, bottom: 0, left: 0, right: 0 }
  style.border ||= {
    top: { width: 0, color: '#eeeeee' },
    bottom: { width: 0, color: '#eeeeee' },
    left: { width: 0, color: '#eeeeee' },
    right: { width: 0, color: '#eeeeee' }
  }
  ;(['top', 'bottom', 'left', 'right'] as const).forEach(s => {
    if (typeof style.border[s] !== 'object' || style.border[s] === null) {
      style.border[s] = { width: 0, color: '#eeeeee' }
    }
  })
  style.textAlign ||= 'left'
  style.backgroundColor ??= ''
  style.borderRadius ||= 0
  style.enable3DMode ??= false
  style.enablePokerCard ??= false
  style.locked ??= false

  const business: Record<string, any> = {}
  if (block?.type === 'text') business.isMarkdown = block.isMarkdown === true
  if (block?.type === 'route') business.showTime = block.showTime !== false
  if (block?.type === 'attachment') business.appId = block.appId || 'wxd45c635d754dbf59'

  return { style, business }
}

const { visible, draft, isDirty, open: openPanel, reset, cancel, save } = useDraftPanel<{ style: any; business: Record<string, any> }>({
  source: () => extractFromBlock(props.block),
  apply: (d) => emit('save', d),
  onClose: () => emit('update:modelValue', false)
})

watch(() => props.modelValue, (val) => {
  if (val && !visible.value) {
    openPanel()
  } else if (!val && visible.value) {
    visible.value = false
  }
}, { immediate: true })
</script>

<style lang="scss" scoped>
.bcp-section {
  margin-bottom: 16rpx;
  background: #f8f9fb;
  border-radius: 12rpx;
  overflow: hidden;
}
.bcp-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 24rpx;
  background: #ffffff;
  border-bottom: 1rpx solid #ebeef5;
}
.bcp-section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #303133;
}
.bcp-arrow {
  color: #909399;
  font-size: 24rpx;
  transition: transform 0.2s ease;
  &.open {
    transform: rotate(0deg);
  }
  &:not(.open) {
    transform: rotate(-90deg);
  }
}
.bcp-section-body {
  padding: 16rpx 24rpx;
  background: #ffffff;
}

.bcp-border-row,
.bcp-padding-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
}
.bcp-label {
  font-size: 24rpx;
  color: #606266;
  min-width: 120rpx;
}
.bcp-slider {
  flex: 1;
}
.bcp-value {
  font-size: 22rpx;
  color: #303133;
  min-width: 80rpx;
  text-align: right;
}
.bcp-color-input {
  width: 140rpx;
  height: 56rpx;
  padding: 0 12rpx;
  border: 1rpx solid #dcdfe6;
  border-radius: 8rpx;
  font-size: 22rpx;
}

.bcp-align-row {
  display: flex;
  gap: 12rpx;
}
.bcp-align-btn {
  flex: 1;
  padding: 16rpx;
  background: #f5f7fa;
  text-align: center;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #606266;
  border: 2rpx solid transparent;
  &.active {
    background: #ecf0fe;
    color: #667eea;
    border-color: #667eea;
    font-weight: 600;
  }
}

.bcp-color-label {
  font-size: 24rpx;
  color: #606266;
  margin-bottom: 12rpx;
}
.bcp-color-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}
.bcp-color-option {
  width: 72rpx;
  height: 72rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid #ebeef5;
  &.active {
    border-color: #667eea;
    border-width: 4rpx;
  }
  &.transparent {
    background: repeating-conic-gradient(#e0e0e0 0% 25%, transparent 0% 50%) 50% / 16rpx 16rpx;
  }
}
.bcp-check {
  font-size: 28rpx;
  color: #303133;
  font-weight: bold;
}
.bcp-transparent-label {
  font-size: 20rpx;
  color: #606266;
}

.bcp-switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f5f7fa;
  &:last-child {
    border-bottom: none;
  }
}
.bcp-switch-info {
  flex: 1;
  margin-right: 16rpx;
}
.bcp-switch-label {
  display: block;
  font-size: 26rpx;
  color: #303133;
}
.bcp-switch-desc {
  display: block;
  font-size: 22rpx;
  color: #909399;
  margin-top: 4rpx;
}

.bcp-input-row {
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f5f7fa;
}
.bcp-text-input {
  margin-top: 12rpx;
  height: 64rpx;
  padding: 0 16rpx;
  border: 1rpx solid #dcdfe6;
  border-radius: 8rpx;
  font-size: 26rpx;
  width: 100%;
  box-sizing: border-box;
}
</style>
