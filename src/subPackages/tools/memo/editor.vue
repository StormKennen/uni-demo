<!--
  memo-v2 编辑器 —— 基于 editor-core schema 驱动架构
  
  功能：
    - 复用 editor-core 的 BlockHost / SchemaDrivenPanel / ResourcePicker
     - 对接 memo API（create / get / patch）
    - 备忘录名称 + 标签管理
    - Block 排序（↑↓ + picker 跳转）
    - FAB 添加 block
    - 底部保存/预览
-->
<template>
  <view class="editor-page">
    <!-- 导航栏 -->
    <nav-bar always-title title="编辑备忘录" custom-class="light"
      :custom-style="{ backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }" />

    <!-- 新增块类型菜单 -->
    <view v-if="addMenuVisible" class="add-menu-overlay" @click="addMenuVisible = false">
      <view class="add-menu-panel" @click.stop>
        <view class="add-menu-header">
          <text class="add-menu-title">选择内容类型</text>
        </view>
        <view class="add-menu-grid">
          <view
            v-for="s in allSchemas"
            :key="s.type"
            class="add-menu-item"
            @click="addBlockAndClose(s.type)"
          >
            <text class="add-menu-icon">{{ s.icon }}</text>
            <text class="add-menu-label">{{ s.label }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 可滚动内容区域 -->
    <scroll-view class="scrollable-content" scroll-y>
      <!-- 备忘录名称和标签 -->
      <view class="memo-info-section">
        <view class="memo-header-row">
          <input class="memo-name-input" v-model="memoName" placeholder="请输入备忘录名称" :maxlength="100" />
          <view class="tag-add-btn" @click="showTagInput = !showTagInput">
            <text>🏷️</text>
          </view>
        </view>
        <view class="tags-section" v-if="showTagInput || tags.length > 0">
          <view class="tags-row">
            <view v-for="(tag, i) in tags" :key="i" class="tag-chip" @click="removeTag(i)">
              <text class="tag-text">{{ tag }}</text>
              <text class="tag-remove">×</text>
            </view>
          </view>
          <view class="tag-input-row" v-if="showTagInput">
            <input class="tag-input" v-model="tagInput" placeholder="输入标签后回车" :maxlength="20"
              @confirm="addTag" />
          </view>
        </view>
      </view>

      <!-- 内容块列表 -->
      <view class="content-section">
        <view v-if="!doc.length" class="empty-hint">
          <text class="empty-icon">📄</text>
          <text class="empty-text">点击右下角 "+" 添加内容块</text>
        </view>

        <view
          v-for="(block, idx) in doc"
          :key="idx"
          class="block-row"
          :class="{ 'is-locked': block.locked }"
        >
          <!-- 锚点徽章 -->
          <view v-if="block.anchor" class="anchor-badge" @click="copyAnchor(block.anchor)">
            <text class="anchor-tag">#{{ block.anchor }}</text>
          </view>
          <BlockHost
            :block="block"
            :block-index="idx"
            :selected="selectedIndex === idx"
            @select="selectedIndex = idx"
            @select-item="onSelectItem"
            @add-item="onAddItem"
          />
          <!-- 块操作按钮 -->
          <view v-if="settings.showBlockActions" class="block-row-actions">
            <view v-if="idx > 0 && !block.locked" class="row-btn" @click="moveBlock(idx, -1)">↑</view>
            <view v-if="idx < doc.length - 1 && !block.locked" class="row-btn" @click="moveBlock(idx, 1)">↓</view>
            <picker
              v-if="!block.locked"
              mode="selector"
              :range="getMovePositions(idx)"
              range-key="label"
              @change="onMoveBlockPick(idx, Number($event.detail.value))"
            >
              <view class="row-btn" @click.stop>≡</view>
            </picker>
            <view class="row-btn" :class="{ 'row-lock-active': block.locked }" @click="toggleBlockLock(idx)">{{ block.locked ? '🔒' : '🔓' }}</view>
            <view class="row-btn" @click="openBlockPanel(idx)">⚙️</view>
            <view
              v-if="(block as any).type === 'route'"
              class="row-btn row-json"
              @click="openJsonImport(idx)"
            >JSON</view>
            <view v-if="!block.locked" class="row-btn row-del" @click="removeBlock(idx)">×</view>
          </view>
        </view>
      </view>
    </scroll-view>


    <!-- 回到顶部 -->
    <view v-if="settings.showBackToTop" class="back-to-top-btn" @click="scrollToTop">
      <text class="back-to-top-icon">↑</text>
    </view>

    <!-- 底部操作 -->
    <view class="footer-actions">
      <view class="footer-btn add" @click="toggleAddMenu">{{ addMenuVisible ? '关闭' : '新增' }}</view>
      <view class="footer-btn preview" @click="saveAndGoToDetail">预览</view>
      <view class="footer-btn save" @click="saveData">保存</view>
      <view class="footer-btn more" @click="moreMenuVisible = true">更多</view>
    </view>

    <view v-if="moreMenuVisible" class="more-menu-overlay" @click="moreMenuVisible = false">
      <view class="more-menu-panel" @click.stop>
        <view class="more-menu-item" :class="{ disabled: !canUndo }" @click="handleMoreUndo">撤销</view>
        <view class="more-menu-item" :class="{ disabled: !canRedo }" @click="handleMoreRedo">重做</view>
        <view class="more-menu-item" @click="handleMoreSettings">设置</view>
        <view class="more-menu-item" @click="handleMorePoster">海报</view>
      </view>
    </view>

    <!-- JSON 导入路径块 Modal -->
    <view v-if="jsonImportVisible" class="json-mask" @click.self="jsonImportVisible = false">
      <view class="json-sheet">
        <view class="json-header">
          <text class="json-title">JSON 导入路径节点</text>
          <view class="json-close" @click="jsonImportVisible = false">×</view>
        </view>
        <view class="json-hint">
          <text>粘贴 RouteNode[] 或 { content: RouteNode[] } 格式</text>
        </view>
        <textarea
          class="json-textarea"
          :value="jsonImportText"
          :placeholder="jsonImportPlaceholder"
          auto-height
          @input="jsonImportText = $event.detail.value"
        />
        <view class="json-footer">
          <view class="json-btn cancel" @click="jsonImportVisible = false">取消</view>
          <view class="json-btn confirm" @click="applyJsonImport">导入</view>
        </view>
      </view>
    </view>

    <!-- 海报生成面板 -->
    <PosterPanel
      v-model:visible="posterVisible"
      :memo-name="memoName"
      :tags="tags"
      :content="doc"
    />

    <!-- Schema 驱动面板 -->
    <SchemaDrivenPanel
      v-model:visible="panelVisible"
      :schema="editingSchema"
      :block="editingBlock"
      :mode="panelMode"
      :item-index="editingItemIndex"
      @save="onPanelSave"
    />

    <!-- 设置面板 -->
    <view v-if="settingsVisible" class="settings-overlay" @click="cancelSettings">
      <view class="settings-panel" @click.stop>
        <view class="settings-header">
          <text class="settings-title">🎨 全局配置</text>
          <view class="settings-close" @click="cancelSettings">×</view>
        </view>
        
        <!-- Tab 切换 -->
        <view class="settings-tabs">
          <view class="tab-item" :class="{ active: activeTab === 'appearance' }" @click="activeTab = 'appearance'">
            <text>外观</text>
          </view>
          <view class="tab-item" :class="{ active: activeTab === 'layout' }" @click="activeTab = 'layout'">
            <text>排版</text>
          </view>
          <view class="tab-item" :class="{ active: activeTab === 'typography' }" @click="activeTab = 'typography'">
            <text>字体</text>
          </view>
        </view>
        
        <scroll-view class="settings-body" scroll-y>
          <!-- 外观 Tab -->
          <view v-show="activeTab === 'appearance'">
            <view class="settings-section">
              <view class="section-title">莫兰迪配色</view>
              <view class="color-palette">
                <view
                  v-for="color in morandiColors"
                  :key="color.value"
                  class="palette-item"
                  :class="{ active: settingsDraft.appearance.backgroundColor === color.value }"
                  :style="{ backgroundColor: color.value }"
                  @click="settingsDraft.appearance.backgroundColor = color.value"
                >
                  <text v-if="settingsDraft.appearance.backgroundColor === color.value" class="palette-check">✓</text>
                </view>
              </view>
            </view>
            
            <view class="settings-section">
              <view class="section-title">背景图片</view>
              <view class="bg-image-row">
                <view
                  v-if="settingsDraft.appearance.backgroundImage"
                  class="bg-image-thumb"
                  :style="{ backgroundImage: `url(${settingsDraft.appearance.backgroundImage})` }"
                />
                <view class="bg-image-btns">
                  <view class="bg-upload-btn" @click="uploadBgImage">
                    <text>{{ settingsDraft.appearance.backgroundImage ? '更换图片' : '＋ 上传图片' }}</text>
                  </view>
                  <view
                    v-if="settingsDraft.appearance.backgroundImage"
                    class="bg-clear-btn"
                    @click="settingsDraft.appearance.backgroundImage = ''"
                  >
                    <text>清除</text>
                  </view>
                </view>
              </view>
              <view v-if="settingsDraft.appearance.backgroundImage" class="settings-item">
                <text class="settings-label">模糊度 {{ settingsDraft.appearance.backgroundBlur }}</text>
                <slider
                  :value="settingsDraft.appearance.backgroundBlur"
                  :min="0" :max="20" :step="1"
                  activeColor="#667eea"
                  @change="settingsDraft.appearance.backgroundBlur = $event.detail.value"
                />
              </view>
              <view v-if="settingsDraft.appearance.backgroundImage" class="settings-item">
                <text class="settings-label">透明度 {{ Math.round(settingsDraft.appearance.backgroundOpacity * 100) }}%</text>
                <slider
                  :value="settingsDraft.appearance.backgroundOpacity * 100"
                  :min="10" :max="100" :step="5"
                  activeColor="#667eea"
                  @change="settingsDraft.appearance.backgroundOpacity = $event.detail.value / 100"
                />
              </view>
            </view>

            <view class="settings-section">
              <view class="section-title">视觉特效</view>
              <view class="settings-item">
                <text class="settings-label">动态光斑</text>
                <switch :checked="settingsDraft.appearance.enableBlob" @change="settingsDraft.appearance.enableBlob = $event.detail.value" color="#667eea" />
              </view>
              <view class="settings-item">
                <text class="settings-label">科技感网格</text>
                <switch :checked="settingsDraft.appearance.enableCyberGrid" @change="settingsDraft.appearance.enableCyberGrid = $event.detail.value" color="#667eea" />
              </view>
            </view>
          </view>
          
          <!-- 排版 Tab -->
          <view v-show="activeTab === 'layout'">
            <view class="settings-section">
              <view class="section-title">内容边距 (rpx)</view>
              <view class="padding-grid">
                <view v-for="side in (['top','bottom','left','right'] as const)" :key="side" class="padding-item">
                  <text class="padding-label">{{ sideLabel[side] }}</text>
                  <input
                    type="number"
                    class="padding-input"
                    :value="String(settingsDraft.padding[side])"
                    @input="settingsDraft.padding[side] = Number($event.detail.value) || 0"
                  />
                </view>
              </view>
            </view>
            
            <view class="settings-section">
              <view class="section-title">内容边框</view>
              <view class="border-grid">
                <view v-for="side in (['top','bottom','left','right'] as const)" :key="side" class="border-item">
                  <text class="border-label">{{ sideLabel[side] }}边框</text>
                  <input
                    type="number"
                    class="border-input"
                    :value="String(settingsDraft.border[side])"
                    @input="settingsDraft.border[side] = Number($event.detail.value) || 0"
                    placeholder="0"
                  />
                </view>
              </view>
              <view class="border-color-row">
                <text class="border-color-label">边框颜色</text>
                <input
                  class="border-color-input"
                  :value="settingsDraft.border.color"
                  @input="settingsDraft.border.color = $event.detail.value"
                  placeholder="#eeeeee"
                />
              </view>
            </view>
            
            <view class="settings-section">
              <view class="section-title">布局宽度</view>
              <view class="settings-item">
                <text class="settings-label">窄屏居中</text>
                <switch :checked="settingsDraft.layout.contentWidth === 'narrow'" @change="settingsDraft.layout.contentWidth = $event.detail.value ? 'narrow' : 'full'" color="#667eea" />
              </view>
            </view>
          </view>
          
          <!-- 字体 Tab -->
          <view v-show="activeTab === 'typography'">
            <view class="settings-section">
              <view class="section-title">字号档位</view>
              <view class="font-size-options">
                <view
                  v-for="opt in fontSizeOptions"
                  :key="opt.value"
                  class="font-size-option"
                  :class="{ active: settingsDraft.typography.fontSize === opt.value }"
                  @click="settingsDraft.typography.fontSize = opt.value"
                >
                  <text>{{ opt.label }}</text>
                </view>
              </view>
            </view>
            
            <view class="settings-section">
              <view class="section-title">行高</view>
              <view class="slider-row">
                <slider
                  :value="settingsDraft.typography.lineHeight * 10"
                  :min="12"
                  :max="24"
                  :step="1"
                  activeColor="#667eea"
                  @change="settingsDraft.typography.lineHeight = $event.detail.value / 10"
                />
                <text class="slider-value">{{ settingsDraft.typography.lineHeight.toFixed(1) }}</text>
              </view>
            </view>
            
            <view class="settings-section">
              <view class="section-title">其他</view>
              <view class="settings-item">
                <text class="settings-label">显示水印</text>
                <switch :checked="settingsDraft.features.showWatermark" @change="settingsDraft.features.showWatermark = $event.detail.value" color="#667eea" />
              </view>
              <view class="settings-item">
                <text class="settings-label">显示块操作</text>
                <switch :checked="settingsDraft.showBlockActions" @change="settingsDraft.showBlockActions = $event.detail.value" color="#667eea" />
              </view>
              <view class="settings-item">
                <text class="settings-label">回到顶部按钮</text>
                <switch :checked="settingsDraft.showBackToTop" @change="settingsDraft.showBackToTop = $event.detail.value" color="#667eea" />
              </view>
            </view>
          </view>
        </scroll-view>
        
        <!-- 底部操作按钮 -->
        <view class="settings-footer">
          <view class="settings-footer-btn reset" @click="resetSettings">
            <text>重置</text>
          </view>
          <view class="settings-footer-btn cancel" @click="cancelSettings">
            <text>取消</text>
          </view>
          <view class="settings-footer-btn save" @click="saveSettings">
            <text>保存</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { postMemos, getMemosMemoId, patchMemosMemoId } from '@/services/apifox/NODEJSDEMO/MEMOS/apifox'
import { ref, reactive, computed, onMounted, watch } from 'vue'
import NavBar from '@/components/nav-bar.vue'
import BlockHost from './components/editor-core/renderers/BlockHost.vue'
import SchemaDrivenPanel from './components/editor-core/panels/SchemaDrivenPanel.vue'
import PosterPanel from './components/PosterPanel.vue'
import { getAllBlockSchemas, getBlockSchema } from './schemas'

// ===== 备忘录元信息 =====
const memoId = ref<string | null>(null)
const memoName = ref('')
const tags = ref<string[]>([])
const tagInput = ref('')
const showTagInput = ref(false)

const addTag = () => {
  const t = tagInput.value.trim()
  if (t && !tags.value.includes(t)) {
    tags.value.push(t)
  }
  tagInput.value = ''
}

const removeTag = (idx: number) => {
  tags.value.splice(idx, 1)
}

// ===== 文档数据 =====
const doc = reactive<any[]>([])
const selectedIndex = ref<number>(-1)

// ===== Schema 数据 =====
const allSchemas = computed(() => getAllBlockSchemas())

// ===== 设置 =====
const settingsVisible = ref(false)
const activeTab = ref<'appearance' | 'layout' | 'typography'>('appearance')

const settings = reactive({
  padding: { top: 32, bottom: 32, left: 32, right: 32 },
  border: { top: 0, bottom: 0, left: 0, right: 0, color: '#eeeeee' },
  appearance: {
    backgroundColor: '#ffffff',
    backgroundImage: '',
    backgroundBlur: 0,
    backgroundOpacity: 1,
    enableBlob: false,
    blobBlur: 80,
    enableCyberGrid: false
  },
  typography: {
    fontSize: 'standard' as 'standard' | 'medium' | 'large',
    lineHeight: 1.6
  },
  layout: {
    contentWidth: 'full' as 'full' | 'narrow'
  },
  features: {
    showWatermark: false
  },
  showBlockActions: true,
  showEditButtons: true,
  showBackToTop: true
})

type SettingsShape = typeof settings
const settingsDraft = reactive<SettingsShape>(JSON.parse(JSON.stringify(settings)))

const openSettings = () => {
  moreMenuVisible.value = false
  settingsDraft.padding = JSON.parse(JSON.stringify(settings.padding))
  settingsDraft.border = JSON.parse(JSON.stringify(settings.border))
  settingsDraft.appearance = JSON.parse(JSON.stringify(settings.appearance))
  settingsDraft.typography = JSON.parse(JSON.stringify(settings.typography))
  settingsDraft.layout = JSON.parse(JSON.stringify(settings.layout))
  settingsDraft.features = JSON.parse(JSON.stringify(settings.features))
  settingsDraft.showBlockActions = settings.showBlockActions
  settingsDraft.showEditButtons = settings.showEditButtons
  settingsDraft.showBackToTop = (settings as any).showBackToTop
  activeTab.value = 'appearance'
  settingsVisible.value = true
}

const cancelSettings = () => {
  settingsVisible.value = false
}

const saveSettings = () => {
  Object.assign(settings.padding, settingsDraft.padding)
  Object.assign(settings.border, settingsDraft.border)
  Object.assign(settings.appearance, settingsDraft.appearance)
  Object.assign(settings.typography, settingsDraft.typography)
  Object.assign(settings.layout, settingsDraft.layout)
  Object.assign(settings.features, settingsDraft.features)
  settings.showBlockActions = settingsDraft.showBlockActions
  settings.showEditButtons = settingsDraft.showEditButtons
  ;(settings as any).showBackToTop = (settingsDraft as any).showBackToTop
  settingsVisible.value = false
}

// ===== 设置重置 =====
const SETTINGS_DEFAULTS = {
  padding: { top: 32, bottom: 32, left: 32, right: 32 },
  border: { top: 0, bottom: 0, left: 0, right: 0, color: '#eeeeee' },
  appearance: {
    backgroundColor: '#ffffff', backgroundImage: '', backgroundBlur: 0,
    backgroundOpacity: 1, enableBlob: false, blobBlur: 80, enableCyberGrid: false
  },
  typography: { fontSize: 'standard' as const, lineHeight: 1.6 },
  layout: { contentWidth: 'full' as const },
  features: { showWatermark: false },
  showBlockActions: true,
  showEditButtons: true,
  showBackToTop: true
}

const resetSettings = () => {
  const d = JSON.parse(JSON.stringify(SETTINGS_DEFAULTS))
  settingsDraft.padding = d.padding
  settingsDraft.border = d.border
  settingsDraft.appearance = d.appearance
  settingsDraft.typography = d.typography
  settingsDraft.layout = d.layout
  settingsDraft.features = d.features
  settingsDraft.showBlockActions = d.showBlockActions
  settingsDraft.showEditButtons = d.showEditButtons
  ;(settingsDraft as any).showBackToTop = d.showBackToTop
  uni.showToast({ title: '已重置为默认设置', icon: 'none' })
}

// 莫兰迪配色方案
const morandiColors = [
  { value: '#ffffff', label: '纯白' },
  { value: '#E4DCD3', label: '燕麦色' },
  { value: '#D6E4E5', label: '灰湖蓝' },
  { value: '#F9F5EB', label: '奶油白' },
  { value: '#E8E4D9', label: '亚麻色' },
  { value: '#D5C4A1', label: '沙棕色' },
  { value: '#C9D6DF', label: '雾霾蓝' },
  { value: '#E6D5C3', label: '杏仁色' }
]

// 字号档位选项
const fontSizeOptions: Array<{ value: 'standard' | 'medium' | 'large'; label: string }> = [
  { value: 'standard', label: '标准' },
  { value: 'medium', label: '中' },
  { value: 'large', label: '大' }
]

const sideLabel = {
  top: '上',
  bottom: '下',
  left: '左',
  right: '右'
}

// ===== 新增菜单 =====
const addMenuVisible = ref(false)
const moreMenuVisible = ref(false)

const toggleAddMenu = () => {
  moreMenuVisible.value = false
  addMenuVisible.value = !addMenuVisible.value
}

const handleMoreUndo = () => {
  if (!canUndo.value) return
  moreMenuVisible.value = false
  undo()
}

const handleMoreRedo = () => {
  if (!canRedo.value) return
  moreMenuVisible.value = false
  redo()
}

const handleMoreSettings = () => {
  moreMenuVisible.value = false
  openSettings()
}

const handleMorePoster = () => {
  moreMenuVisible.value = false
  posterVisible.value = true
}

// ===== 锚点 =====
const generateNextAnchor = (): string => {
  let maxNum = 0
  const pat = /^L(\d+)$/
  doc.forEach((block: any) => {
    if (block.anchor) {
      const m = block.anchor.match(pat)
      if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10))
    }
  })
  return `L${maxNum + 1}`
}

const copyAnchor = (anchor: string) => {
  if (!anchor) return
  uni.setClipboardData({
    data: anchor,
    success: () => uni.showToast({ title: `已复制 #${anchor}`, icon: 'none' })
  })
}

// ===== 块锁定 =====
const toggleBlockLock = (idx: number) => {
  const block = doc[idx] as any
  if (!block) return
  block.locked = !block.locked
  uni.showToast({ title: block.locked ? '块已锁定' : '块已解锁', icon: 'none' })
}

// ===== Undo / Redo =====
const UNDO_LIMIT = 50
const undoStack = ref<string[]>([])
const redoStack = ref<string[]>([])
let undoPushTimer: ReturnType<typeof setTimeout> | null = null
let isRestoring = false

const canUndo = computed(() => undoStack.value.length > 1)
const canRedo = computed(() => redoStack.value.length > 0)

interface EditorSnapshot { memoName: string; tags: string[]; content: any[]; settings: any }

const captureSnapshot = (): EditorSnapshot => ({
  memoName: memoName.value,
  tags: JSON.parse(JSON.stringify(tags.value)),
  content: JSON.parse(JSON.stringify(doc)),
  settings: JSON.parse(JSON.stringify(settings))
})

const applySnapshot = (snap: EditorSnapshot) => {
  isRestoring = true
  memoName.value = snap.memoName
  tags.value.splice(0, tags.value.length, ...snap.tags)
  doc.splice(0, doc.length, ...snap.content)
  const s = snap.settings || {}
  if (s.padding) Object.assign(settings.padding, s.padding)
  if (s.border) Object.assign(settings.border, s.border)
  if (s.appearance) Object.assign(settings.appearance, s.appearance)
  if (s.typography) Object.assign(settings.typography, s.typography)
  if (s.layout) Object.assign(settings.layout, s.layout)
  if (s.features) Object.assign(settings.features, s.features)
  if ('showBlockActions' in s) settings.showBlockActions = s.showBlockActions
  if ('showEditButtons' in s) settings.showEditButtons = s.showEditButtons
  if ('showBackToTop' in s) (settings as any).showBackToTop = s.showBackToTop
  setTimeout(() => { isRestoring = false }, 0)
}

const pushUndoSnapshot = () => {
  if (isRestoring) return
  const snapJson = JSON.stringify(captureSnapshot())
  const top = undoStack.value[undoStack.value.length - 1]
  if (top === snapJson) return
  undoStack.value.push(snapJson)
  if (undoStack.value.length > UNDO_LIMIT) undoStack.value.shift()
  if (redoStack.value.length) redoStack.value = []
}

const undo = () => {
  if (!canUndo.value) { uni.showToast({ title: '没有可撤销的操作', icon: 'none' }); return }
  redoStack.value.push(JSON.stringify(captureSnapshot()))
  undoStack.value.pop()
  const prev = undoStack.value[undoStack.value.length - 1]
  if (prev) applySnapshot(JSON.parse(prev))
  uni.showToast({ title: '已撤销', icon: 'none' })
}

const redo = () => {
  if (!canRedo.value) { uni.showToast({ title: '没有可重做的操作', icon: 'none' }); return }
  const next = redoStack.value.pop()!
  undoStack.value.push(next)
  applySnapshot(JSON.parse(next))
  uni.showToast({ title: '已重做', icon: 'none' })
}

// ===== 本地草稿（防丢稿） =====
const LOCAL_DRAFT_PREFIX = 'memo_v2_draft_'
const getDraftKey = () => `${LOCAL_DRAFT_PREFIX}${memoId.value || '__new__'}`
let draftWriteTimer: ReturnType<typeof setTimeout> | null = null
let draftAutoSaveStarted = false

const saveLocalDraft = () => {
  try {
    uni.setStorageSync(getDraftKey(), JSON.stringify({
      memoId: memoId.value,
      memoName: memoName.value,
      tags: JSON.parse(JSON.stringify(tags.value)),
      content: JSON.parse(JSON.stringify(doc)),
      settings: JSON.parse(JSON.stringify(settings)),
      savedAt: Date.now()
    }))
  } catch (e) { console.warn('[draft] 保存失败', e) }
}

const loadLocalDraft = (): any | null => {
  try {
    const raw = uni.getStorageSync(getDraftKey())
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

const clearLocalDraft = () => {
  try { uni.removeStorageSync(getDraftKey()) } catch { /* ignore */ }
}

const applyDraftToState = (draft: any) => {
  if (!draft) return
  if (typeof draft.memoName === 'string') memoName.value = draft.memoName
  if (Array.isArray(draft.tags)) tags.value.splice(0, tags.value.length, ...draft.tags)
  if (Array.isArray(draft.content)) doc.splice(0, doc.length, ...draft.content)
  if (draft.settings) {
    const s = draft.settings
    if (s.padding) Object.assign(settings.padding, s.padding)
    if (s.border) Object.assign(settings.border, s.border)
    if (s.appearance) Object.assign(settings.appearance, s.appearance)
    if (s.typography) Object.assign(settings.typography, s.typography)
    if (s.layout) Object.assign(settings.layout, s.layout)
    if (s.features) Object.assign(settings.features, s.features)
    if ('showBlockActions' in s) settings.showBlockActions = s.showBlockActions
    if ('showBackToTop' in s) (settings as any).showBackToTop = s.showBackToTop
  }
}

const checkAndPromptDraftRestore = () => {
  const draft = loadLocalDraft()
  if (!draft?.savedAt) return
  const minutes = Math.max(1, Math.round((Date.now() - draft.savedAt) / 60000))
  uni.showModal({
    title: '检测到未保存的草稿',
    content: `约 ${minutes} 分钟前有未保存的本地修改，是否恢复？`,
    confirmText: '恢复',
    cancelText: '丢弃',
    success: ({ confirm }) => {
      if (confirm) { applyDraftToState(draft); uni.showToast({ title: '已恢复草稿', icon: 'success' }) }
      else clearLocalDraft()
    }
  })
}

const startDraftAutoSave = () => {
  if (draftAutoSaveStarted) return
  draftAutoSaveStarted = true
  watch(
    () => [memoName.value, tags.value, doc, settings] as const,
    () => {
      if (draftWriteTimer) clearTimeout(draftWriteTimer)
      draftWriteTimer = setTimeout(saveLocalDraft, 1000)
      if (!isRestoring) {
        if (undoPushTimer) clearTimeout(undoPushTimer)
        undoPushTimer = setTimeout(pushUndoSnapshot, 800)
      }
    },
    { deep: true }
  )
}

// ===== 回到顶部 =====
const scrollToTop = () => {
  uni.pageScrollTo({ scrollTop: 0, duration: 300 })
}

// ===== 海报生成 =====
const posterVisible = ref(false)

// ===== 背景图上传 =====
const uploadBgImage = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      const tempPath = res.tempFilePaths[0]
      settingsDraft.appearance.backgroundImage = tempPath
      uni.showToast({ title: '已设置背景图（仅预览）', icon: 'none' })
    }
  })
}

// ===== JSON 导入路径块 =====
const jsonImportVisible = ref(false)
const jsonImportText = ref('')
const jsonImportBlockIdx = ref(-1)
const jsonImportPlaceholder = '[{"name":"起点","type":"normal"},{"name":"终点","isEnd":true}]'

const openJsonImport = (idx: number) => {
  jsonImportBlockIdx.value = idx
  jsonImportText.value = ''
  jsonImportVisible.value = true
}

const applyJsonImport = () => {
  const raw = jsonImportText.value.trim()
  if (!raw) {
    uni.showToast({ title: '请先输入 JSON', icon: 'none' })
    return
  }
  try {
    const parsed = JSON.parse(raw)
    const nodes: any[] = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed.content) ? parsed.content : null
    if (!nodes) throw new Error('需要 RouteNode[] 或 { content: RouteNode[] } 格式')
    if (!nodes.every(n => typeof n.name === 'string'))
      throw new Error('每个节点需要 name 字段')
    const block = doc[jsonImportBlockIdx.value] as any
    if (!block) throw new Error('块不存在')
    block.content = nodes
    jsonImportVisible.value = false
    uni.showToast({ title: `已导入 ${nodes.length} 个节点`, icon: 'success' })
  } catch (e: any) {
    uni.showToast({ title: `JSON 错误: ${e.message}`, icon: 'none' })
  }
}

const addBlock = (type: string) => {
  const schema = getBlockSchema(type)
  if (!schema) return
  const block = schema.createDefault() as any
  block.anchor = generateNextAnchor()
  doc.push(block)
}

const addBlockAndClose = (type: string) => {
  addBlock(type)
  addMenuVisible.value = false
}

const removeBlock = (idx: number) => {
  if ((doc[idx] as any)?.locked) {
    uni.showToast({ title: '该块已锁定，无法删除', icon: 'none' })
    return
  }
  doc.splice(idx, 1)
  if (selectedIndex.value === idx) selectedIndex.value = -1
}

// ===== Block 排序 =====
const moveBlock = (idx: number, dir: -1 | 1) => {
  const target = idx + dir
  if (target < 0 || target >= doc.length) return
  if ((doc[idx] as any)?.locked || (doc[target] as any)?.locked) {
    uni.showToast({ title: '锁定块无法移动', icon: 'none' })
    return
  }
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
  if ((doc[fromIdx] as any)?.locked) {
    uni.showToast({ title: '锁定块无法移动', icon: 'none' })
    return
  }
  const tmp = doc[fromIdx]
  doc.splice(fromIdx, 1)
  doc.splice(toIdx, 0, tmp)
  if (selectedIndex.value === fromIdx) selectedIndex.value = toIdx
}

// ===== 控制面板 =====
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

const onSelectItem = (blockIndex: number, itemIndex: number) => {
  editingIndex.value = blockIndex
  selectedIndex.value = blockIndex
  editingItemIndex.value = itemIndex
  panelMode.value = 'item'
  panelVisible.value = true
}

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
    const block = doc[editingIndex.value]
    if (!block) return
    const arrKey = editingSchema.value?.itemArrayKey || 'children'
    const arr: any[] = block[arrKey] || []
    arr.splice(payload.itemIndex, 1, payload.item)
  } else {
    doc.splice(editingIndex.value, 1, payload)
  }
}

// ===== API 对接 =====
const generateDefaultMemoName = () => {
  const now = new Date()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const h = String(now.getHours()).padStart(2, '0')
  const min = String(now.getMinutes()).padStart(2, '0')
  return `备忘录_${m}${d}_${h}${min}`
}

const loadData = async () => {
  if (!memoId.value) {
    console.log('[editor-v2] 新建备忘录模式')
    return
  }

  try {
    uni.showLoading({ title: '加载中...', mask: true })
    const memo: any = await getMemosMemoId(memoId.value)
    uni.hideLoading()

    if (memo && memo.id) {
      memoName.value = memo.name || ''
      tags.value = memo.tags || []

      if (memo.content && Array.isArray(memo.content)) {
        doc.splice(0, doc.length, ...memo.content)
      }
      console.log('[editor-v2] 加载成功:', memo.id)
    }
  } catch (error: any) {
    uni.hideLoading()
    console.error('[editor-v2] 加载失败:', error)
    uni.showToast({ title: error?.message || '加载失败', icon: 'none' })
  }
}

const saveData = async () => {
  if (!memoName.value.trim()) {
    memoName.value = generateDefaultMemoName()
  }

  try {
    uni.showLoading({ title: '保存中...', mask: true })

    const memoData: any = {
      name: memoName.value,
      content: JSON.parse(JSON.stringify(doc)),
      tags: tags.value,
    }

    const isCreate = !memoId.value
    let result: any

    if (memoId.value) {
      result = await patchMemosMemoId(memoId.value, memoData)
    } else {
      result = await postMemos(memoData)
    }

    if (result && result.id) {
      memoId.value = result.id
    }

    uni.hideLoading()
    uni.showToast({ title: isCreate ? '创建成功' : '更新成功', icon: 'success' })
    clearLocalDraft()
    uni.$emit('memo-list-refresh')
  } catch (error: any) {
    uni.hideLoading()
    console.error('[editor-v2] 保存失败:', error)
    uni.showToast({ title: error?.message || '保存失败', icon: 'none' })
  }
}

const saveAndGoToDetail = async () => {
  await saveData()
  if (memoId.value) {
    uni.navigateTo({ url: `/subPackages/tools/memo/detail?id=${memoId.value}` })
  }
}

// ===== 页面加载 =====
onMounted(async () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = (currentPage as any).options as any

  if (options?.id) {
    memoId.value = options.id
    console.log('[editor-v2] 加载备忘录 ID:', options.id)
  }

  await loadData()
  checkAndPromptDraftRestore()
  undoStack.value = [JSON.stringify(captureSnapshot())]
  redoStack.value = []
  startDraftAutoSave()
})
</script>

<style scoped>
.editor-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

/* ===== 备忘录信息区 ===== */
.memo-info-section {
  background: #fff;
  padding: 24rpx 32rpx;
  margin-bottom: 16rpx;
}

.memo-header-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.memo-name-input {
  flex: 1;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  border: none;
  padding: 8rpx 0;
}

.tag-add-btn {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  background: #f5f5f5;
  border-radius: 50%;
}

.tags-section {
  margin-top: 16rpx;
}

.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.tag-chip {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 8rpx 20rpx;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 24rpx;
}

.tag-text {
  font-size: 24rpx;
  color: #667eea;
}

.tag-remove {
  font-size: 26rpx;
  color: #999;
  margin-left: 4rpx;
}

.tag-input-row {
  margin-top: 12rpx;
}

.tag-input {
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  padding: 12rpx 16rpx;
  font-size: 26rpx;
  background: #fafafa;
}

/* ===== 内容区 ===== */
.scrollable-content {
  flex: 1;
  padding-bottom: 180rpx;
}

.content-section {
  padding: 0 16rpx 16rpx;
}

.empty-hint {
  padding: 120rpx 24rpx;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.empty-icon {
  font-size: 80rpx;
  opacity: 0.3;
}

.empty-text {
  font-size: 26rpx;
  color: #aaa;
}

.block-row {
  position: relative;
  margin-bottom: 16rpx;
}

/* ===== 块操作按钮 ===== */
.block-row-actions {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  display: flex;
  gap: 8rpx;
}

.row-btn {
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

.row-del {
  color: #f55;
  font-size: 34rpx;
}

/* ===== 新增菜单 ===== */
.add-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 999;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 120rpx;
}

.add-menu-panel {
  width: 90%;
  max-width: 600rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.15);
  overflow: hidden;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-40rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.add-menu-header {
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
}

.add-menu-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.add-menu-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rpx;
  background: #f5f5f5;
  padding: 1rpx;
}

.add-menu-item {
  background: #fff;
  padding: 32rpx 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  transition: background 0.2s;
}

.add-menu-item:active {
  background: #f8f8f8;
}

.add-menu-icon {
  font-size: 48rpx;
}

.add-menu-label {
  font-size: 24rpx;
  color: #666;
  text-align: center;
}

/* ===== 底部操作 ===== */
.footer-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 16rpx;
  padding: 16rpx 24rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1rpx solid #eee;
  z-index: 90;
  box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.footer-btn {
  flex: 1;
  text-align: center;
  padding: 22rpx 0;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 500;
}

.footer-btn.add,
.footer-btn.more {
  background: #f5f5f5;
  color: #666;
}

.footer-btn.preview {
  background: #f5f5f5;
  color: #666;
}

.footer-btn.save {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.more-menu-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 120;
  display: flex;
  align-items: flex-end;
  padding: 0 24rpx;
  padding-bottom: calc(136rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.more-menu-panel {
  width: 100%;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 -8rpx 32rpx rgba(0, 0, 0, 0.12);
  animation: slideUp 0.2s ease;
}

.more-menu-item {
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  color: #333;
  border-bottom: 1rpx solid #f0f0f0;
}

.more-menu-item:last-child {
  border-bottom: none;
}

.more-menu-item:active {
  background: #f8f8f8;
}

.more-menu-item.disabled {
  color: #bbb;
  background: #fafafa;
}

/* ===== 设置面板 ===== */
.settings-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: flex-end;
}

.settings-panel {
  width: 100%;
  max-height: 80vh;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding-bottom: env(safe-area-inset-bottom);
  animation: slideUp 0.3s ease;
  display: flex;
  flex-direction: column;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 1rpx solid #eee;
  flex-shrink: 0;
}

.settings-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.settings-close {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  color: #999;
  line-height: 1;
}

.settings-tabs {
  display: flex;
  border-bottom: 1rpx solid #eee;
  flex-shrink: 0;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 24rpx 0;
  font-size: 28rpx;
  color: #999;
  position: relative;
  transition: color 0.2s;
}

.tab-item.active {
  color: #667eea;
  font-weight: 500;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx;
  height: 4rpx;
  background: #667eea;
  border-radius: 2rpx;
}

.settings-body {
  flex: 1;
  overflow-y: auto;
  padding: 32rpx;
  box-sizing: border-box;
}

.settings-section {
  margin-bottom: 48rpx;
}

.settings-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 26rpx;
  color: #999;
  margin-bottom: 24rpx;
  font-weight: 500;
}

.settings-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.settings-item:last-child {
  border-bottom: none;
}

.settings-label {
  font-size: 28rpx;
  color: #333;
}

/* 莫兰迪配色板 */
.color-palette {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
}

.palette-item {
  aspect-ratio: 1;
  border-radius: 12rpx;
  border: 3rpx solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.palette-item.active {
  border-color: #667eea;
  box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.3);
}

.palette-check {
  font-size: 32rpx;
  color: #667eea;
  font-weight: bold;
}

/* 边距网格 */
.padding-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.padding-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.padding-label {
  font-size: 26rpx;
  color: #666;
  min-width: 48rpx;
}

.padding-input {
  flex: 1;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  padding: 12rpx 16rpx;
  font-size: 26rpx;
  text-align: center;
}

/* 边框网格 */
.border-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.border-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.border-label {
  font-size: 26rpx;
  color: #666;
  min-width: 80rpx;
}

.border-input {
  flex: 1;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  padding: 12rpx 16rpx;
  font-size: 26rpx;
  text-align: center;
}

.border-color-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.border-color-label {
  font-size: 26rpx;
  color: #666;
  min-width: 120rpx;
}

.border-color-input {
  flex: 1;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  padding: 12rpx 16rpx;
  font-size: 26rpx;
}

/* 字号选项 */
.font-size-options {
  display: flex;
  gap: 16rpx;
}

.font-size-option {
  flex: 1;
  padding: 20rpx;
  text-align: center;
  border: 2rpx solid #eee;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #666;
  transition: all 0.2s;
}

.font-size-option.active {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
  color: #667eea;
  font-weight: 500;
}

/* 滑块行 */
.slider-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.slider-row slider {
  flex: 1;
}

.slider-value {
  font-size: 26rpx;
  color: #667eea;
  min-width: 80rpx;
  text-align: right;
  font-weight: 500;
}

/* 设置底部按钮 */
.settings-footer {
  display: flex;
  gap: 16rpx;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #eee;
  flex-shrink: 0;
}

.settings-footer-btn {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 500;
  transition: all 0.2s;
}

.settings-footer-btn:active {
  opacity: 0.8;
  transform: scale(0.98);
}

.settings-footer-btn.reset {
  flex: 0.8;
  background: #f0f0f0;
  color: #888;
}

.settings-footer-btn.cancel {
  background: #f5f5f5;
  color: #666;
}

.settings-footer-btn.save {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.35);
}

/* 锚点徽章 */
.anchor-badge {
  display: inline-flex;
  align-items: center;
  margin-bottom: 6rpx;
  padding: 2rpx 12rpx;
  background: rgba(102, 126, 234, 0.08);
  border: 1rpx solid rgba(102, 126, 234, 0.2);
  border-radius: 20rpx;
}

.anchor-tag {
  font-size: 20rpx;
  color: #667eea;
  font-family: monospace;
}

/* 块锁定状态 */
.block-row.is-locked {
  opacity: 0.85;
  position: relative;
}

.block-row.is-locked::before {
  content: '';
  position: absolute;
  inset: 0;
  border: 2rpx dashed rgba(255, 152, 0, 0.5);
  border-radius: 12rpx;
  pointer-events: none;
  z-index: 1;
}

.row-lock-active {
  color: #ff9800 !important;
  background: rgba(255, 152, 0, 0.12) !important;
}

/* 回到顶部按钮 */
.back-to-top-btn {
  position: fixed;
  right: 32rpx;
  bottom: 160rpx;
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 6rpx 24rpx rgba(102, 126, 234, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.back-to-top-btn:active {
  opacity: 0.8;
  transform: scale(0.95);
}

.back-to-top-icon {
  font-size: 36rpx;
  color: #fff;
  font-weight: bold;
  line-height: 1;
}

/* ── 背景图上传 ── */
.bg-image-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 8rpx 0;
}

.bg-image-thumb {
  width: 100rpx;
  height: 80rpx;
  border-radius: 8rpx;
  background-size: cover;
  background-position: center;
  border: 1rpx solid #ddd;
  flex-shrink: 0;
}

.bg-image-btns {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.bg-upload-btn {
  padding: 12rpx 24rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 8rpx;
  font-size: 26rpx;
  text-align: center;
}

.bg-clear-btn {
  padding: 10rpx 24rpx;
  background: #f5f5f5;
  color: #e53935;
  border-radius: 8rpx;
  font-size: 24rpx;
  text-align: center;
}

/* ── JSON 导入 row-btn ── */
.row-json {
  font-size: 18rpx !important;
  padding: 4rpx 10rpx !important;
  background: rgba(67, 160, 71, 0.15) !important;
  color: #43a047 !important;
}

/* ── JSON 导入 Modal ── */
.json-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1010;
}

.json-sheet {
  width: 100%;
  background: #fff;
  border-top-left-radius: 28rpx;
  border-top-right-radius: 28rpx;
  display: flex;
  flex-direction: column;
  padding-bottom: env(safe-area-inset-bottom);
}

.json-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx 16rpx;
  border-bottom: 1rpx solid #eee;
}

.json-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.json-close {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  color: #999;
}

.json-hint {
  padding: 12rpx 32rpx;
  background: #f9f9f9;
}

.json-hint text {
  font-size: 22rpx;
  color: #888;
}

.json-textarea {
  margin: 16rpx 32rpx;
  padding: 16rpx;
  border: 1rpx solid #ddd;
  border-radius: 12rpx;
  font-size: 24rpx;
  color: #333;
  background: #fafafa;
  min-height: 200rpx;
  width: calc(100% - 64rpx);
  box-sizing: border-box;
  font-family: monospace;
}

.json-footer {
  display: flex;
  gap: 20rpx;
  padding: 16rpx 32rpx 32rpx;
}

.json-btn {
  flex: 1;
  text-align: center;
  padding: 24rpx 0;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 500;
}

.json-btn.cancel {
  background: #f5f5f5;
  color: #666;
}

.json-btn.confirm {
  background: linear-gradient(135deg, #43a047 0%, #66bb6a 100%);
  color: #fff;
}

</style>
