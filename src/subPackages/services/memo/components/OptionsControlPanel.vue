<template>
  <DraftPanelShell
    :visible="visible"
    title="🎨 内容配置"
    :is-dirty="isDirty"
    layout="fullscreen"
    @reset="reset"
    @cancel="cancel"
    @save="save"
  >
    <!-- Tab 切换 -->
    <template #tabs>
      <view class="ocp-tabs">
        <view
          v-for="t in tabs"
          :key="t.key"
          class="ocp-tab"
          :class="{ active: activeTab === t.key }"
          @click="activeTab = t.key"
        >
          <text>{{ t.label }}</text>
        </view>
      </view>
    </template>

    <!-- 🎨 外观 -->
    <view v-show="activeTab === 'appearance'">
      <view class="settings-section">
        <view class="section-title">莫兰迪配色</view>
        <view class="color-palette">
          <view
            v-for="color in morandiColors"
            :key="color.value"
            class="palette-item"
            :class="{ active: draft.settings.appearance.backgroundColor === color.value }"
            :style="{ backgroundColor: color.value }"
            @click="draft.settings.appearance.backgroundColor = color.value"
          >
            <text v-if="draft.settings.appearance.backgroundColor === color.value" class="palette-check">✓</text>
          </view>
        </view>
      </view>

      <view class="settings-section">
        <view class="section-title">背景图片</view>
        <view class="setting-row">
          <input
            class="setting-input"
            :value="draft.settings.appearance.backgroundImage"
            @input="draft.settings.appearance.backgroundImage = $event.detail.value"
            placeholder="输入图片URL或上传"
          />
          <view class="setting-btn" @click="$emit('upload-bg')">上传</view>
        </view>

        <view class="slider-row" v-if="draft.settings.appearance.backgroundImage">
          <text class="slider-label">模糊度</text>
          <slider
            :value="draft.settings.appearance.backgroundBlur"
            :min="0"
            :max="30"
            :step="1"
            activeColor="#667eea"
            @change="draft.settings.appearance.backgroundBlur = $event.detail.value"
          />
          <text class="slider-value">{{ draft.settings.appearance.backgroundBlur }}px</text>
        </view>

        <view class="slider-row" v-if="draft.settings.appearance.backgroundImage">
          <text class="slider-label">透明度</text>
          <slider
            :value="draft.settings.appearance.backgroundOpacity * 100"
            :min="0"
            :max="100"
            :step="5"
            activeColor="#667eea"
            @change="draft.settings.appearance.backgroundOpacity = $event.detail.value / 100"
          />
          <text class="slider-value">{{ Math.round(draft.settings.appearance.backgroundOpacity * 100) }}%</text>
        </view>
      </view>

      <view class="settings-section">
        <view class="section-title">视觉特效</view>
        <view class="setting-item">
          <text class="setting-item-label">动态光斑</text>
          <switch
            :checked="draft.settings.appearance.enableBlob"
            @change="draft.settings.appearance.enableBlob = $event.detail.value"
            color="#667eea"
          />
        </view>
        <view class="slider-row" v-if="draft.settings.appearance.enableBlob">
          <text class="slider-label">光斑模糊度</text>
          <slider
            :value="draft.settings.appearance.blobBlur"
            :min="40"
            :max="120"
            :step="10"
            activeColor="#667eea"
            @change="draft.settings.appearance.blobBlur = $event.detail.value"
          />
          <text class="slider-value">{{ draft.settings.appearance.blobBlur }}px</text>
        </view>
        <view class="setting-item">
          <text class="setting-item-label">科技感网格</text>
          <switch
            :checked="draft.settings.appearance.enableCyberGrid"
            @change="draft.settings.appearance.enableCyberGrid = $event.detail.value"
            color="#667eea"
          />
        </view>
      </view>
    </view>

    <!-- 📐 排版 -->
    <view v-show="activeTab === 'layout'">
      <view class="settings-section">
        <view class="section-title">内容边距 (rpx)</view>
        <view class="padding-grid">
          <view v-for="side in (['top','bottom','left','right'] as const)" :key="side" class="padding-item">
            <text class="padding-label">{{ sideLabel[side] }}</text>
            <input
              type="number"
              class="padding-input"
              :value="draft.settings.padding[side]"
              @input="draft.settings.padding[side] = Number($event.detail.value) || 0"
            />
          </view>
        </view>
      </view>

      <view class="settings-section">
        <view class="section-title">内容边框</view>
        <view class="border-grid">
          <view v-for="side in (['top','bottom','left','right'] as const)" :key="side" class="border-item">
            <text class="border-label">{{ sideLabel[side] }}边框</text>
            <view class="border-controls">
              <input
                type="number"
                class="border-width-input"
                :value="draft.settings.border[side]"
                @input="draft.settings.border[side] = Number($event.detail.value) || 0"
                placeholder="0"
              />
              <text class="border-unit">rpx</text>
            </view>
          </view>
        </view>
        <view class="border-color-row">
          <text class="border-color-label">边框颜色</text>
          <input
            class="border-color-input"
            :value="draft.settings.border.color"
            @input="draft.settings.border.color = $event.detail.value"
            placeholder="#eeeeee"
          />
          <view class="border-color-preview" :style="{ backgroundColor: draft.settings.border.color }"></view>
        </view>
      </view>

      <view class="settings-section">
        <view class="section-title">文字排版</view>
        <view class="setting-row">
          <text class="setting-row-label">字号档位</text>
          <view class="font-size-tabs">
            <view
              v-for="opt in fontSizeOptions"
              :key="opt.value"
              class="font-size-tab"
              :class="{ active: draft.settings.typography.fontSize === opt.value }"
              @click="draft.settings.typography.fontSize = opt.value"
            >
              <text class="tab-label">{{ opt.label }}</text>
              <text class="tab-size">{{ opt.size }}</text>
            </view>
          </view>
        </view>
        <view class="slider-row">
          <text class="slider-label">行高</text>
          <slider
            :value="draft.settings.typography.lineHeight * 10"
            :min="14"
            :max="22"
            :step="1"
            activeColor="#667eea"
            @change="draft.settings.typography.lineHeight = $event.detail.value / 10"
          />
          <text class="slider-value">{{ draft.settings.typography.lineHeight.toFixed(1) }}x</text>
        </view>
      </view>

      <view class="settings-section">
        <view class="section-title">布局</view>
        <view class="setting-item">
          <view class="setting-info">
            <text class="setting-label">居中窄屏模式</text>
            <text class="setting-desc">内容最大宽度1200rpx，适合大屏阅读</text>
          </view>
          <switch
            :checked="draft.settings.layout.contentWidth === 'narrow'"
            @change="draft.settings.layout.contentWidth = draft.settings.layout.contentWidth === 'narrow' ? 'full' : 'narrow'"
            color="#667eea"
          />
        </view>
      </view>
    </view>

    <!-- ✨ 效果 -->
    <view v-show="activeTab === 'effects'">
      <view class="settings-section">
        <view class="section-title">💫 浪漫交互效果</view>
        <view class="setting-item">
          <text class="setting-item-label">毛玻璃滤镜</text>
          <switch
            :checked="draft.settings.romanticEffects.enableGlassBlur"
            @change="draft.settings.romanticEffects.enableGlassBlur = $event.detail.value"
            color="#ff6b9d"
          />
        </view>
        <view class="setting-item">
          <text class="setting-item-label">弹窗动画</text>
          <picker
            :range="['缩放进入', '滑动进入']"
            :value="draft.settings.romanticEffects.popupAnimation === 'zoom-in' ? 0 : 1"
            @change="draft.settings.romanticEffects.popupAnimation = $event.detail.value === 0 ? 'zoom-in' : 'slide-up'"
          >
            <view class="picker-display">
              {{ draft.settings.romanticEffects.popupAnimation === 'zoom-in' ? '缩放进入' : '滑动进入' }}
            </view>
          </picker>
        </view>
        <view class="hint">🌸 开启后，弹窗将具有梦幻般的毛玻璃质感和柔美动画效果</view>
      </view>

      <view class="settings-section">
        <view class="section-title">功能开关</view>
        <view class="setting-item">
          <view class="setting-info">
            <text class="setting-label">显示水印</text>
            <text class="setting-desc">在详情页底部显示水印标识</text>
          </view>
          <switch
            :checked="draft.settings.features.showWatermark"
            @change="draft.settings.features.showWatermark = $event.detail.value"
            color="#667eea"
          />
        </view>
        <view class="setting-item">
          <view class="setting-info">
            <text class="setting-label">启用评论</text>
            <text class="setting-desc">允许访客在详情页留言互动</text>
          </view>
          <switch
            :checked="draft.settings.features.enableComments"
            @change="draft.settings.features.enableComments = $event.detail.value"
            color="#667eea"
          />
        </view>
      </view>

      <view class="settings-section">
        <view class="section-title">详情页显示</view>
        <view class="setting-item">
          <view class="setting-info">
            <text class="setting-label">显示回到顶部</text>
            <text class="setting-desc">详情页滚动时显示回到顶部按钮</text>
          </view>
          <switch
            :checked="draft.settings.showBackToTop"
            @change="draft.settings.showBackToTop = $event.detail.value"
            color="#667eea"
          />
        </view>
        <view class="setting-item">
          <view class="setting-info">
            <text class="setting-label">隐藏操作栏</text>
            <text class="setting-desc">隐藏详情页右上角的导出/分享/编辑按钮</text>
          </view>
          <switch
            :checked="draft.settings.hideNavActions"
            @change="draft.settings.hideNavActions = $event.detail.value"
            color="#667eea"
          />
        </view>
      </view>
    </view>

    <!-- 🔗 高级 -->
    <view v-show="activeTab === 'advanced'">
      <view class="settings-section">
        <view class="section-title">标签管理</view>
        <view class="tags-manager">
          <view class="tags-list" v-if="draft.tags.length > 0">
            <view v-for="(tag, index) in draft.tags" :key="index" class="tag-editable">
              <text class="tag-text">{{ tag }}</text>
              <text class="tag-remove" @click="removeTag(index)">×</text>
            </view>
          </view>
          <view class="tag-add-row">
            <input
              class="tag-add-input"
              v-model="tagInput"
              placeholder="输入标签后回车添加"
              @confirm="addTag"
              :maxlength="20"
            />
            <view class="tag-add-btn" @click="addTag">添加</view>
          </view>
        </view>
      </view>

      <view class="settings-section">
        <view class="section-title">腾讯文档关联</view>
        <view class="setting-item">
          <view class="setting-info">
            <text class="setting-label">启用全局文档关联</text>
            <text class="setting-desc">在详情页底部显示跳转腾讯文档按钮</text>
          </view>
          <switch
            :checked="draft.settings.globalAttachment.enabled"
            @change="draft.settings.globalAttachment.enabled = $event.detail.value"
            color="#667eea"
          />
        </view>
        <view v-if="draft.settings.globalAttachment.enabled" class="attachment-config">
          <view class="setting-row">
            <text class="setting-row-label">按钮文案</text>
            <input
              class="setting-row-input"
              :value="draft.settings.globalAttachment.title"
              @input="draft.settings.globalAttachment.title = $event.detail.value"
              placeholder="查看原始文档"
              :maxlength="30"
            />
          </view>
          <view class="setting-row">
            <text class="setting-row-label">文档链接</text>
            <input
              class="setting-row-input"
              :value="draft.settings.globalAttachment.url"
              @input="draft.settings.globalAttachment.url = $event.detail.value"
              placeholder="粘贴腾讯文档链接"
              :maxlength="500"
            />
          </view>
          <view class="attachment-tip">
            <text>支持腾讯文档/表格/收集表等链接，点击将跳转到腾讯文档小程序</text>
          </view>
        </view>
      </view>
    </view>
  </DraftPanelShell>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import DraftPanelShell from './DraftPanelShell.vue'
import { useDraftPanel } from '../composables/useDraftPanel'

interface MorandiColor { value: string; label: string }
interface FontSizeOption { value: string; label: string; size: string }

const props = defineProps<{
  modelValue: boolean
  settings: any
  tags: string[]
  morandiColors: MorandiColor[]
  fontSizeOptions: FontSizeOption[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'save', payload: { settings: any; tags: string[] }): void
  (e: 'upload-bg'): void
}>()

const activeTab = ref<'appearance' | 'layout' | 'effects' | 'advanced'>('appearance')
const tabs = [
  { key: 'appearance' as const, label: '🎨 外观' },
  { key: 'layout' as const, label: '📐 排版' },
  { key: 'effects' as const, label: '✨ 效果' },
  { key: 'advanced' as const, label: '🔗 高级' }
]

const sideLabel = { top: '上', bottom: '下', left: '左', right: '右' } as const

const { visible, draft, isDirty, open, reset, cancel, save } = useDraftPanel<{ settings: any; tags: string[] }>({
  source: () => ({ settings: props.settings, tags: props.tags }),
  apply: (d) => emit('save', d),
  onClose: () => emit('update:modelValue', false)
})

// 同步外部 modelValue 到内部 visible
watch(() => props.modelValue, (val) => {
  if (val && !visible.value) {
    open()
    activeTab.value = 'appearance'
  } else if (!val && visible.value) {
    visible.value = false
  }
}, { immediate: true })

// 标签输入
const tagInput = ref('')
function addTag() {
  const t = tagInput.value.trim()
  if (!t) return
  if (!draft.tags.includes(t)) draft.tags.push(t)
  tagInput.value = ''
}
function removeTag(index: number) {
  draft.tags.splice(index, 1)
}
</script>

<style lang="scss" scoped>
.ocp-tabs {
  display: flex;
  background: #f8f9fb;
}
.ocp-tab {
  flex: 1;
  padding: 22rpx 0;
  text-align: center;
  font-size: 26rpx;
  color: #909399;
  position: relative;
  &.active {
    color: #667eea;
    font-weight: 600;
    background: #ffffff;
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 25%;
      right: 25%;
      height: 4rpx;
      background: linear-gradient(90deg, #667eea, #764ba2);
      border-radius: 2rpx;
    }
  }
}

.settings-section {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  border: 1rpx solid #ebeef5;
}
.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #303133;
  margin-bottom: 20rpx;
}

.color-palette {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}
.palette-item {
  width: 80rpx;
  height: 80rpx;
  border-radius: 12rpx;
  border: 2rpx solid #ebeef5;
  display: flex;
  align-items: center;
  justify-content: center;
  &.active {
    border-color: #667eea;
    border-width: 4rpx;
  }
}
.palette-check {
  color: #303133;
  font-size: 32rpx;
  font-weight: bold;
}

.setting-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}
.setting-row-label {
  font-size: 26rpx;
  color: #606266;
  min-width: 120rpx;
}
.setting-input,
.setting-row-input {
  flex: 1;
  height: 64rpx;
  padding: 0 16rpx;
  border: 1rpx solid #dcdfe6;
  border-radius: 8rpx;
  font-size: 26rpx;
}
.setting-btn {
  padding: 0 20rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  background: #667eea;
  color: #fff;
  border-radius: 8rpx;
  font-size: 24rpx;
}

.slider-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin: 12rpx 0;
  slider {
    flex: 1;
  }
}
.slider-label {
  font-size: 24rpx;
  color: #606266;
  min-width: 120rpx;
}
.slider-value {
  font-size: 24rpx;
  color: #303133;
  min-width: 80rpx;
  text-align: right;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f5f7fa;
  &:last-child {
    border-bottom: none;
  }
}
.setting-info {
  flex: 1;
  margin-right: 16rpx;
}
.setting-label {
  display: block;
  font-size: 26rpx;
  color: #303133;
}
.setting-desc {
  display: block;
  font-size: 22rpx;
  color: #909399;
  margin-top: 4rpx;
}
.setting-item-label {
  font-size: 26rpx;
  color: #303133;
}

.picker-display {
  padding: 10rpx 20rpx;
  background: #f5f7fa;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #303133;
}

.hint {
  font-size: 22rpx;
  color: #909399;
  padding: 12rpx 16rpx;
  background: #fef9f5;
  border-radius: 8rpx;
  margin-top: 12rpx;
}

.padding-grid,
.border-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
}
.padding-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.padding-label {
  font-size: 24rpx;
  color: #606266;
  width: 40rpx;
}
.padding-input {
  flex: 1;
  height: 56rpx;
  padding: 0 12rpx;
  border: 1rpx solid #dcdfe6;
  border-radius: 8rpx;
  font-size: 24rpx;
  text-align: center;
}

.border-item {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}
.border-label {
  font-size: 24rpx;
  color: #606266;
}
.border-controls {
  display: flex;
  align-items: center;
  gap: 8rpx;
}
.border-width-input {
  flex: 1;
  height: 56rpx;
  padding: 0 12rpx;
  border: 1rpx solid #dcdfe6;
  border-radius: 8rpx;
  font-size: 24rpx;
  text-align: center;
}
.border-unit {
  font-size: 22rpx;
  color: #909399;
}
.border-color-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 16rpx;
}
.border-color-label {
  font-size: 24rpx;
  color: #606266;
  min-width: 120rpx;
}
.border-color-input {
  flex: 1;
  height: 56rpx;
  padding: 0 12rpx;
  border: 1rpx solid #dcdfe6;
  border-radius: 8rpx;
  font-size: 24rpx;
}
.border-color-preview {
  width: 56rpx;
  height: 56rpx;
  border-radius: 8rpx;
  border: 1rpx solid #dcdfe6;
}

.font-size-tabs {
  display: flex;
  gap: 12rpx;
  flex: 1;
}
.font-size-tab {
  flex: 1;
  padding: 12rpx;
  background: #f5f7fa;
  border-radius: 8rpx;
  text-align: center;
  border: 2rpx solid transparent;
  &.active {
    background: #ecf0fe;
    border-color: #667eea;
  }
  .tab-label {
    display: block;
    font-size: 24rpx;
    color: #303133;
  }
  .tab-size {
    display: block;
    font-size: 20rpx;
    color: #909399;
    margin-top: 4rpx;
  }
}

.tags-manager {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}
.tag-editable {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  background: #ecf0fe;
  border-radius: 24rpx;
  color: #667eea;
  font-size: 24rpx;
}
.tag-remove {
  color: #909399;
  font-size: 28rpx;
  line-height: 1;
}
.tag-add-row {
  display: flex;
  gap: 12rpx;
}
.tag-add-input {
  flex: 1;
  height: 64rpx;
  padding: 0 16rpx;
  border: 1rpx solid #dcdfe6;
  border-radius: 8rpx;
  font-size: 26rpx;
}
.tag-add-btn {
  padding: 0 24rpx;
  background: #667eea;
  color: #fff;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  font-size: 24rpx;
}

.attachment-config {
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #f5f7fa;
}
.attachment-tip {
  font-size: 22rpx;
  color: #909399;
  margin-top: 12rpx;
}
</style>
