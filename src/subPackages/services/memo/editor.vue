<template>
  <view class="editor-page">
    <!-- 导航栏 -->
    <nav-bar always-title title="编辑备忘录" custom-class="light"
      :custom-style="{ backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }">
      <template #right>
        <view class="nav-actions">
          <view class="nav-action-btn" @click="saveAndGoToDetail" v-if="memoId">
            <text>👁️</text>
          </view>
        </view>
      </template>
    </nav-bar>

    <!-- 可滚动内容区域 -->
    <scroll-view class="scrollable-content" scroll-y>
      <!-- 备忘录名称和标签 -->
      <view class="memo-info-section">
        <input class="memo-name-input" v-model="memoName" placeholder="请输入备忘录名称" :maxlength="100" />
        <view class="tags-section">
          <view class="tags-container">
            <view v-for="(tag, index) in tags" :key="index" class="tag-item">
              <text class="tag-text">{{ tag }}</text>
              <text class="tag-remove" @click="removeTag(index)">×</text>
            </view>
            <input class="tag-input" v-model="tagInput" placeholder="添加标签" @confirm="addTag" :maxlength="20" />
          </view>
        </view>
      </view>

      <!-- 内容区域 -->
      <view class="content-section">

        <!-- 内容块列表 -->
        <view v-for="(block, blockIndex) in pageData.content" :key="blockIndex" class="content-block">
          <!-- 文本块 -->
          <view v-if="block.type === 'text'" class="text-block" :style="getBlockBorderStyle(block)">
            <!-- 锚点ID显示 -->
            <!-- <view class="anchor-id-display">
              <view class="anchor-id-badge" @click.stop="copyAnchor(blockIndex + 1)">
                <text class="anchor-tag">#L{{ blockIndex + 1 }}</text>
                <text class="copy-hint">点击复制</text>
              </view>
            </view> -->
            <!-- 编辑模式：显示块头部 -->
            <view class="block-header" @click="selectBlock(blockIndex)">
              <!-- <text class="block-type-label">{{ blockIndex === 0 ? '📌 标题块' : '📝 文本块' }}</text> -->
              <!-- <text class="block-type-label">📝 文本块</text> -->
              <text class="anchor-id-badge" @click.stop="copyAnchor(blockIndex + 1)">
                <text class="anchor-tag">文本容器#L{{ blockIndex + 1 }}</text>
                <!-- <text class="copy-hint">点击复制</text> -->
              </text>
              <view class="block-actions">
                <view class="action-btn" v-if="blockIndex > 0" @click.stop="moveBlock(blockIndex, -1)">↑</view>
                <view class="action-btn" @click.stop="moveBlock(blockIndex, 1)">↓</view>
                <view class="action-btn" @click.stop="selectBlock(blockIndex)">⚙</view>
                <view class="action-btn delete" @click.stop="deleteBlock(blockIndex)">×</view>
              </view>
            </view>

            <view v-for="(item, itemIndex) in block.children" :key="itemIndex" class="text-item" :class="{
              selected: isItemSelected(blockIndex, itemIndex, 'text'),
              'title-item': isTitleItem(blockIndex, itemIndex)
            }">
              <view class="text-display" :class="{ 'title-display': isTitleItem(blockIndex, itemIndex) }"
                :style="getTextStyle(item.style)" @click="selectItem(blockIndex, itemIndex, 'text')">
                {{ item.value || (isTitleItem(blockIndex, itemIndex) ? '我的备忘录' : '文本') }}
              </view>
            </view>

            <!-- 编辑模式：添加按钮 -->
            <view class="add-item-btn" @click="addTextItem(blockIndex)">
              <text class="add-icon">+</text>
              <text class="add-text">添加文本</text>
            </view>
          </view>

          <!-- 图片块 -->
          <view v-if="block.type === 'image'" class="image-block" :style="getBlockBorderStyle(block)">
            <!-- 锚点ID显示 -->
            <!-- <view class="anchor-id-display">
              <view class="anchor-id-badge" @click.stop="copyAnchor(blockIndex + 1)">
                <text class="anchor-tag">#L{{ blockIndex + 1 }}</text>
                <text class="copy-hint">点击复制</text>
              </view>
            </view> -->
            <!-- 编辑模式：显示块头部 -->
            <view class="block-header" @click="selectBlock(blockIndex)">
              <!-- <text class="block-type-label">🖼️ 图片块</text> -->
              <text class="anchor-id-badge" @click.stop="copyAnchor(blockIndex + 1)">
                <text class="anchor-tag">图片容器#L{{ blockIndex + 1 }}</text>
                <!-- <text class="copy-hint">点击复制</text> -->
              </text>
              <view class="block-actions">
                <view class="action-btn" @click.stop="moveBlock(blockIndex, -1)">↑</view>
                <view class="action-btn" @click.stop="moveBlock(blockIndex, 1)">↓</view>
                <view class="action-btn" @click.stop="selectBlock(blockIndex)">⚙</view>
                <view class="action-btn delete" @click.stop="deleteBlock(blockIndex)">×</view>
              </view>
            </view>

            <view v-for="(item, itemIndex) in block.children" :key="itemIndex" class="image-item"
              :class="{ selected: isItemSelected(blockIndex, itemIndex, 'image') }">
              <!-- 图片上传/预览 -->
              <view class="image-upload-area" v-if="!item.value.url" @click="chooseImage(blockIndex, itemIndex)">
                <text class="upload-icon">+</text>
                <text class="upload-text">点击上传</text>
              </view>
              <view class="image-preview" v-else @click="selectItem(blockIndex, itemIndex, 'image')">
                <view class="image-container">
                  <image :src="item.value.url" :style="getImageStyle(item.style)" :mode="getImageMode(item.style)" />
                </view>
              </view>
            </view>

            <!-- 编辑模式：添加按钮 -->
            <view class="add-item-btn" @click="addImageItem(blockIndex)">
              <text class="add-icon">+</text>
              <text class="add-text">添加图片</text>
            </view>
          </view>

        </view>
      </view>
    </scroll-view>

    <!-- 底部新增按钮（仅编辑模式，控制面板显示时隐藏） -->
    <view class="add-block-bar" v-if="!selectedItem && selectedBlock === null">
      <view class="add-block-btn" @click="addTextBlock">
        <!-- <text class="btn-icon">📝</text> -->
        <text class="btn-text">新增文本容器</text>
      </view>
      <view class="add-block-btn" @click="addImageBlock">
        <!-- <text class="btn-icon">🖼️</text> -->
        <text class="btn-text">新增图片容器</text>
      </view>
    </view>

    <!-- 颜色选择器弹窗 -->
    <view class="color-picker-modal" v-if="colorPickerVisible" @click="colorPickerVisible = false">
      <view class="color-picker-content" @click.stop>
        <view class="color-picker-title">选择颜色</view>
        <view class="color-grid">
          <view v-for="color in colors" :key="color" class="color-item" :style="{ backgroundColor: color }"
            @click="selectColor(color)"></view>
        </view>
      </view>
    </view>

    <!-- 文件选择器弹窗 -->
    <view class="file-picker-modal" v-if="filePickerVisible" @click="filePickerVisible = false">
      <view class="file-picker-content" @click.stop>
        <view class="file-picker-header">
          <text class="file-picker-title">选择云端图片</text>
          <text class="file-picker-close" @click="filePickerVisible = false">×</text>
        </view>

        <!-- 云端文件列表 -->
        <view class="file-tab-content">
          <view v-if="loadingFiles" class="loading-files">
            <text class="loading-icon">⏳</text>
            <text>加载中...</text>
          </view>
          <view v-else-if="cloudFiles.length === 0" class="empty-files">
            <text class="empty-icon">�</text>
            <text>暂无图片文件</text>
          </view>
          <scroll-view v-else scroll-y class="file-list">
            <view v-for="file in cloudFiles" :key="file.id" class="file-item" @click="selectCloudFile(file)">
              <view class="file-preview">
                <image :src="file.file_url" class="file-thumb" mode="aspectFill" />
              </view>
              <view class="file-info">
                <text class="file-name">{{ file.file_name }}</text>
                <view class="file-meta">
                  <text class="file-size">{{ file.file_size_formatted }}</text>
                  <text class="file-date">{{ formatDate(file.created_at) }}</text>
                </view>
              </view>
              <view class="file-select-icon">✓</view>
            </view>
          </scroll-view>
        </view>
      </view>
    </view>

    <!-- 写作素材选择弹窗 -->
    <view class="chat-session-modal" v-if="chatSessionPickerVisible" @click="chatSessionPickerVisible = false">
      <view class="chat-session-content" @click.stop>
        <view class="chat-session-header">
          <text class="chat-session-title">选择笔记</text>
          <text class="chat-session-close" @click="chatSessionPickerVisible = false">×</text>
        </view>
        <view v-if="loadingChatSessions" class="loading-sessions">
          <text class="loading-icon">⏳</text>
          <text>加载中...</text>
        </view>
        <view v-else-if="chatSessions.length === 0" class="empty-sessions">
          <text class="empty-icon">📝</text>
          <text>暂无笔记</text>
        </view>
        <scroll-view v-else scroll-y class="chat-session-list">
          <view v-for="session in chatSessions" :key="session.id" class="chat-session-item" @click="selectChatSession(session)">
            <view class="session-icon">📄</view>
            <view class="session-info">
              <text class="session-title">{{ session.title || '新建草稿' }}</text>
              <text class="session-meta">{{ session.messageCount || 0 }} 条素材 · {{ session.updatedAt || session.createdAt }}</text>
            </view>
            <view class="session-select-icon">›</view>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 底部样式面板 -->
    <view class="bottom-style-panel" v-if="selectedItem">
      <!-- 文本样式面板 -->
      <view class="style-panel-content" v-if="selectedItem.type === 'text'">
        <view class="panel-header">
          <view class="panel-title">文本样式</view>
          <view class="panel-close" @click="selectedItem = null">×</view>
        </view>
        <scroll-view class="panel-scroll-content" scroll-y>
          <!-- 文本编辑区 -->
          <textarea class="panel-text-input" v-model="getSelectedItem().value" placeholder="输入文本内容..."
            :style="getTextStyle(getSelectedItem().style)" auto-height :maxlength="10000" />
          <view class="text-style-bar">
            <view class="style-btn" :class="{ active: getSelectedItem()?.style.bold }"
              @click="toggleTextStyle(selectedItem.blockIndex, selectedItem.itemIndex, 'bold')">B</view>
            <view class="style-btn italic" :class="{ active: getSelectedItem()?.style.italic }"
              @click="toggleTextStyle(selectedItem.blockIndex, selectedItem.itemIndex, 'italic')">I</view>
            <view class="style-btn" :class="{ active: getSelectedItem()?.style.underline }"
              @click="toggleTextStyle(selectedItem.blockIndex, selectedItem.itemIndex, 'underline')">U</view>
            <view class="style-btn" :class="{ active: getSelectedItem()?.style.lineThrough }"
              @click="toggleTextStyle(selectedItem.blockIndex, selectedItem.itemIndex, 'lineThrough')">S</view>
            <picker :value="fontSizeIndex(getSelectedItem()?.style.fontSize)" :range="fontSizes"
              @change="(e) => setTextFontSize(selectedItem.blockIndex, selectedItem.itemIndex, e)">
              <view class="style-btn size-btn">{{ getSelectedItem()?.style.fontSize || 16 }}px</view>
            </picker>
            <view class="style-btn color-btn" :style="{ backgroundColor: getSelectedItem()?.style.color || '#333' }"
              @click="showColorPicker(selectedItem.blockIndex, selectedItem.itemIndex)"></view>
            <view class="style-btn delete-item"
              v-if="pageData.content[selectedItem.blockIndex].children.length > 1 && !isTitleItem(selectedItem.blockIndex, selectedItem.itemIndex)"
              @click="deleteTextItem(selectedItem.blockIndex, selectedItem.itemIndex)">🗑</view>
          </view>

          <!-- 链接设置区域 -->
          <view class="link-settings-section">
            <view class="section-header">
              <view class="section-title">🔗 链接设置</view>
              <view class="link-toggle" :class="{ active: getSelectedItem()?.linkInfo }" @click="toggleTextLink()">
                {{ getSelectedItem()?.linkInfo ? '已启用' : '未启用' }}
              </view>
            </view>

            <view v-if="getSelectedItem()?.linkInfo" class="link-settings-content">
              <!-- 链接类型选择 -->
              <view class="link-type-selector compact">
                <view class="type-btn" :class="{ active: getSelectedItem()?.linkInfo?.linkType === 'url' }"
                  @click="setTextLinkType('url')">
                  <text class="type-icon">🔗</text>
                  <text>超链接</text>
                </view>
                <view class="type-btn" :class="{ active: getSelectedItem()?.linkInfo?.linkType === 'navigation' }"
                  @click="setTextLinkType('navigation')">
                  <text class="type-icon">📍</text>
                  <text>导航</text>
                </view>
                <view class="type-btn" :class="{ active: getSelectedItem()?.linkInfo?.linkType === 'internal' }"
                  @click="setTextLinkType('internal')">
                  <text class="type-icon">📄</text>
                  <text>关联素材</text>
                </view>
                <view class="type-btn" :class="{ active: getSelectedItem()?.linkInfo?.linkType === 'anchor' }"
                  @click="setTextLinkType('anchor')">
                  <text class="type-icon">⚓</text>
                  <text>锚点</text>
                </view>
              </view>

              <!-- 超链接输入 -->
              <view class="link-input-group" v-if="getSelectedItem()?.linkInfo?.linkType === 'url'">
                <input class="link-input" v-model="getSelectedItem().linkInfo.url"
                  placeholder="请输入链接地址，如 https://example.com" :maxlength="500" />
              </view>

              <!-- 关联素材选择 -->
              <view v-if="getSelectedItem()?.linkInfo?.linkType === 'internal'" class="internal-link-section">
                <!-- 场景选择 -->
                <view class="link-input-group">
                  <view class="input-label">素材类型</view>
                  <picker :value="0" :range="internalLinkScenes" range-key="label" @change="onInternalSceneChange">
                    <view class="scene-picker-btn">
                      <text>{{ getSelectedItem()?.linkInfo?.internalScene === 'chat' ? '笔记' : '请选择类型' }}</text>
                      <text class="picker-arrow">›</text>
                    </view>
                  </picker>
                </view>
                
                <!-- 写作素材选择 -->
                <view v-if="getSelectedItem()?.linkInfo?.internalScene === 'chat'" class="chat-session-picker">
                  <view class="input-label">选择笔记</view>
                  <view class="session-picker-btn" @click="showChatSessionPicker">
                    <text v-if="getSelectedItem()?.linkInfo?.internalTitle">{{ getSelectedItem()?.linkInfo?.internalTitle }}</text>
                    <text v-else class="placeholder">点击选择笔记</text>
                    <text class="picker-arrow">›</text>
                  </view>
                </view>
              </view>

              <!-- 锚点输入 -->
              <view class="link-input-group" v-if="getSelectedItem()?.linkInfo?.linkType === 'anchor'">
                <view class="input-label">锚点ID（用于跳转定位）</view>
                <input class="link-input" v-model="getSelectedItem().linkInfo.anchorId"
                  placeholder="请输入唯一的锚点ID，如 section-1" :maxlength="50" />
                <!-- <view class="anchor-tip">
                  <text>💡 提示：锚点ID应该是唯一的，建议使用英文和数字，如 section-1、intro、conclusion 等</text>
                </view> -->
              </view>

              <!-- 导航输入 -->
              <view v-if="getSelectedItem()?.linkInfo?.linkType === 'navigation'">
                <!-- 地图选点按钮 -->
                <view class="location-picker-btn" @click="onSelectLocationForText">
                  <text class="picker-icon">📍</text>
                  <text class="picker-text">从地图选择位置</text>
                  <text class="picker-arrow">›</text>
                </view>

                <view class="link-input-group">
                  <view class="input-label">地点名称</view>
                  <input class="link-input" v-model="getSelectedItem().linkInfo.address" placeholder="请输入地点名称"
                    :maxlength="100" />
                </view>
                <view class="link-input-row">
                  <view class="link-input-group half">
                    <view class="input-label">纬度</view>
                    <input class="link-input" type="digit" v-model="getSelectedItem().linkInfo.latitude"
                      placeholder="如 39.908823" />
                  </view>
                  <view class="link-input-group half">
                    <view class="input-label">经度</view>
                    <input class="link-input" type="digit" v-model="getSelectedItem().linkInfo.longitude"
                      placeholder="如 116.39747" />
                  </view>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 图片样式面板 -->
      <view class="style-panel-content" v-if="selectedItem.type === 'image'">
        <view class="panel-header">
          <view class="panel-title">图片样式</view>
          <view class="panel-close" @click="selectedItem = null">×</view>
        </view>
        <scroll-view class="panel-scroll-content" scroll-y>
          <!-- 图片操作区 -->
          <view class="image-actions-bar" v-if="getSelectedItem()?.value.url">
            <view class="action-btn" @click="previewImage(getSelectedItem().value.url)">
              <text class="action-icon">🔍</text>
              <text>预览图片</text>
            </view>
            <view class="action-btn" @click="chooseImage(selectedItem.blockIndex, selectedItem.itemIndex)">
              <text class="action-icon">📷</text>
              <text>更换图片</text>
            </view>
          </view>
          <view class="image-style-bar">
            <view class="style-label">尺寸:</view>
            <picker :value="imageSizeModeIndex(getSelectedItem()?.style.sizeMode)" :range="imageSizeModes"
              :range-key="'label'"
              @change="(e) => setImageSizeMode(selectedItem.blockIndex, selectedItem.itemIndex, e)">
              <view class="style-btn size-mode-btn">
                {{ getImageSizeModeLabel(getSelectedItem()?.style.sizeMode) }}
              </view>
            </picker>
            <view class="size-input-group" v-if="getSelectedItem()?.style.sizeMode === 'fixedWidth'">
              <text>宽:</text>
              <input type="number" v-model="getSelectedItem().style.width" class="size-input" placeholder="600" />
              <text class="unit">rpx</text>
            </view>
            <view class="size-input-group" v-if="getSelectedItem()?.style.sizeMode === 'fixedHeight'">
              <text>高:</text>
              <input type="number" v-model="getSelectedItem().style.height" class="size-input" placeholder="400" />
              <text class="unit">rpx</text>
            </view>
            <view class="size-input-group" v-if="getSelectedItem()?.style.sizeMode === 'percentWidth'">
              <text>宽:</text>
              <input type="number" v-model="getSelectedItem().style.widthPercent" class="size-input" placeholder="80" />
              <text class="unit">%</text>
            </view>
            <view class="size-input-group" v-if="getSelectedItem()?.style.sizeMode === 'percentHeight'">
              <text>高:</text>
              <input type="number" v-model="getSelectedItem().style.heightPercent" class="size-input"
                placeholder="50" />
              <text class="unit">vh</text>
            </view>
          </view>
          <view class="image-rotate-bar">
            <view class="rotate-label">Z轴旋转 (平面): {{ getSelectedItem()?.style.rotate || 0 }}°</view>
            <slider :value="getSelectedItem()?.style.rotate || 0"
              @change="(e) => setImageRotate(selectedItem.blockIndex, selectedItem.itemIndex, e, 'z')" min="0" max="360"
              step="1" block-size="20" activeColor="#1890ff" backgroundColor="#e0e0e0" class="rotate-slider" />
          </view>
          <view class="image-rotate-bar">
            <view class="rotate-label">X轴旋转 (上下翻转): {{ getSelectedItem()?.style.rotateX || 0 }}°</view>
            <slider :value="getSelectedItem()?.style.rotateX || 0"
              @change="(e) => setImageRotate(selectedItem.blockIndex, selectedItem.itemIndex, e, 'x')" min="0" max="360"
              step="1" block-size="20" activeColor="#52c41a" backgroundColor="#e0e0e0" class="rotate-slider" />
          </view>
          <view class="image-rotate-bar">
            <view class="rotate-label">Y轴旋转 (左右翻转): {{ getSelectedItem()?.style.rotateY || 0 }}°</view>
            <slider :value="getSelectedItem()?.style.rotateY || 0"
              @change="(e) => setImageRotate(selectedItem.blockIndex, selectedItem.itemIndex, e, 'y')" min="0" max="360"
              step="1" block-size="20" activeColor="#faad14" backgroundColor="#e0e0e0" class="rotate-slider" />
          </view>
          <view class="rotate-tip">
            <text>💡 提示：3D旋转效果在预览模式下可见，导出图片时仅支持Z轴(平面)旋转</text>
          </view>
          <view class="image-style-bar">
            <view class="style-btn delete-item" v-if="pageData.content[selectedItem.blockIndex].children.length > 1"
              @click="deleteImageItem(selectedItem.blockIndex, selectedItem.itemIndex)">🗑 删除图片</view>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 行样式面板 -->
    <view class="bottom-style-panel" v-if="selectedBlock !== null">
      <view class="style-panel-content">
        <view class="panel-header">
          <view class="panel-title">行样式</view>
          <view class="panel-close" @click="selectedBlock = null">×</view>
        </view>
        <view class="border-style-bar">
          <view class="style-label">边框:</view>
          <view class="style-btn border-btn" :class="{ active: getBlockStyle(selectedBlock)?.borderTop }"
            @click="toggleBlockBorder(selectedBlock, 'borderTop')">上</view>
          <view class="style-btn border-btn" :class="{ active: getBlockStyle(selectedBlock)?.borderBottom }"
            @click="toggleBlockBorder(selectedBlock, 'borderBottom')">下</view>
          <view class="style-btn border-btn" :class="{ active: getBlockStyle(selectedBlock)?.borderLeft }"
            @click="toggleBlockBorder(selectedBlock, 'borderLeft')">左</view>
          <view class="style-btn border-btn" :class="{ active: getBlockStyle(selectedBlock)?.borderRight }"
            @click="toggleBlockBorder(selectedBlock, 'borderRight')">右</view>
        </view>
        <view class="align-style-bar">
          <view class="style-label">对齐:</view>
          <view class="align-btns">
            <view class="style-btn align-btn"
              :class="{ active: !getBlockStyle(selectedBlock)?.textAlign || getBlockStyle(selectedBlock)?.textAlign === 'left' }"
              @click="setBlockAlign(selectedBlock, 'left')">左</view>
            <view class="style-btn align-btn" :class="{ active: getBlockStyle(selectedBlock)?.textAlign === 'center' }"
              @click="setBlockAlign(selectedBlock, 'center')">中</view>
            <view class="style-btn align-btn" :class="{ active: getBlockStyle(selectedBlock)?.textAlign === 'right' }"
              @click="setBlockAlign(selectedBlock, 'right')">右</view>
          </view>
        </view>
        <!-- Markdown 模式开关（仅文本块） -->
        <view class="markdown-toggle-bar" v-if="pageData.content[selectedBlock]?.type === 'text'">
          <view class="style-label">Markdown 模式:</view>
          <switch 
            :checked="(pageData.content[selectedBlock] as TextBlock)?.isMarkdown || false" 
            @change="toggleBlockMarkdown(selectedBlock)"
            color="#667eea"
          />
        </view>
      </view>
    </view>

    <!-- 底部操作按钮 -->
    <view class="footer-actions">
      <view class="footer-btn preview" @click="saveAndGoToDetail">预览</view>
      <view class="footer-btn save" @click="saveData">保存</view>
    </view>

    <!-- 导出用的隐藏Canvas -->
    <canvas v-if="exportLoading" type="2d" id="exportCanvas" class="export-canvas"
      :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"></canvas>
  </view>
</template>

<script setup lang="ts">
import { postMemos, getMemosMemoId, patchMemosMemoId } from '@/services/apifox/NODEJSDEMO/MEMOS/apifox';
import { getGeminiSessions } from '@/services/apifox/NODEJSDEMO/GEMINI/apifox';

import { ref, reactive, computed, watch } from 'vue'
import { onLoad, onReady, onShareAppMessage } from '@dcloudio/uni-app'
import NavBar from '@/components/nav-bar.vue'
import { getFiles } from '@/services/apifox/NODEJSDEMO/FILES/apifox'
import type { getFilesResItems } from '@/services/apifox/NODEJSDEMO/FILES/interface'

// 类型定义
interface TextStyle {
  bold?: boolean
  italic?: boolean
  underline?: boolean
  lineThrough?: boolean
  fontSize?: number
  color?: string
}

// 行样式（边框、对齐等）
interface BlockStyle {
  borderTop?: boolean
  borderBottom?: boolean
  borderLeft?: boolean
  borderRight?: boolean
  textAlign?: 'left' | 'center' | 'right'
}

interface ImageStyle {
  sizeMode?: 'auto' | 'fixedWidth' | 'fixedHeight' | 'percentWidth' | 'percentHeight'
  width?: number
  height?: number
  widthPercent?: number
  heightPercent?: number
  rotate?: number // Z轴旋转角度 0-360
  rotateX?: number // X轴旋转角度 0-360
  rotateY?: number // Y轴3D旋转角度 0-360
}

interface ImageInfo {
  id: string
  url: string
  name?: string
  size?: number
}

interface TextItem {
  value: string
  style: TextStyle
  linkInfo?: LinkInfo  // 可选的链接信息
}

interface ImageItem {
  value: ImageInfo
  style: ImageStyle
}

interface TextBlock {
  type: 'text'
  children: TextItem[]
  style?: BlockStyle
  isMarkdown?: boolean
}

interface ImageBlock {
  type: 'image'
  children: ImageItem[]
  style?: BlockStyle
}

// 链接信息
interface LinkInfo {
  label: string // 显示的文本
  linkType: 'url' | 'navigation' | 'internal' | 'anchor' // 链接类型：超链接、导航、内部链接或锚点
  url?: string // 超链接地址
  latitude?: number // 导航纬度
  longitude?: number // 导航经度
  address?: string // 导航地址名称
  internalScene?: 'chat' // 内部链接场景
  internalId?: string // 内部链接目标ID
  internalTitle?: string // 内部链接目标标题
  internalPath?: string // 内部链接路径
  anchorId?: string // 锚点ID
}

// 创作助手接口
interface ChatSession {
  id: string
  title: string
  messageCount: number
  createdAt: string
  updatedAt: string
  isShared?: boolean
}

interface PageData {
  content: (TextBlock | ImageBlock)[]
}

// 页面数据
const pageData = reactive<PageData>({
  content: [
    // {
    //   type: 'text',
    //   children: [
    //     {
    //       value: '我的备忘录',
    //       style: {
    //         bold: true,
    //         italic: false,
    //         fontSize: 36
    //       }
    //     }
    //   ]
    // }
  ]
})

// 判断是否为标题项（第一个文本块的第一项）
const isTitleItem = (blockIndex: number, itemIndex: number) => {
  return blockIndex === 0 && itemIndex === 0 && pageData.content[0]?.type === 'text'
}

// 备忘录名称和标签
const memoName = ref('')
const tags = ref<string[]>([])
const tagInput = ref('')
const memoId = ref<string | null>(null)

// 字体大小选项
const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48]

// 颜色选项
const colors = [
  '#333333', '#666666', '#999999', '#000000',
  '#FF4757', '#FF6B81', '#FFA502', '#FFDD59',
  '#2ED573', '#7BED9F', '#1E90FF', '#70A1FF',
  '#5352ED', '#A29BFE', '#FF6348', '#747D8C'
]

// 图片尺寸模式
const imageSizeModes = [
  { value: 'auto', label: '自适应' },
  { value: 'fixedWidth', label: '固定宽度' },
  { value: 'fixedHeight', label: '固定高度' },
  { value: 'percentWidth', label: '百分比宽度' },
  { value: 'percentHeight', label: '百分比高度' }
]

// 编辑模式（移除预览模式，详情页负责预览）

// 颜色选择器状态
const colorPickerVisible = ref(false)
const currentColorTarget = ref<{ blockIndex: number; itemIndex: number } | null>(null)
const showTitleSizePicker = ref(false)

// 文件选择器状态
const filePickerVisible = ref(false)
const currentImageTarget = ref<{ blockIndex: number; itemIndex: number } | null>(null)
const cloudFiles = ref<getFilesResItems[]>([])
const loadingFiles = ref(false)

// 关联素材相关状态
const internalLinkScenes = [
  { value: 'chat', label: '笔记' }
]
const chatSessionPickerVisible = ref(false)
const chatSessions = ref<ChatSession[]>([])
const loadingChatSessions = ref(false)

// 选中状态
const selectedItem = ref<{ blockIndex: number; itemIndex: number; type: 'text' | 'image' } | null>(null)

// 选中项目
const selectItem = (blockIndex: number, itemIndex: number, type: 'text' | 'image') => {
  selectedItem.value = { blockIndex, itemIndex, type }
  selectedBlock.value = null // 关闭行面板
}

// 判断是否选中
const isItemSelected = (blockIndex: number, itemIndex: number, type: 'text' | 'image') => {
  return selectedItem.value?.blockIndex === blockIndex &&
    selectedItem.value?.itemIndex === itemIndex &&
    selectedItem.value?.type === type
}

// 获取当前选中的项目
const getSelectedItem = () => {
  if (!selectedItem.value) return null
  const { blockIndex, itemIndex, type } = selectedItem.value
  const block = pageData.content[blockIndex]
  if (!block || block.type !== type) return null
  return block.children[itemIndex]
}

// 选中行状态
const selectedBlock = ref<number | null>(null)

// 选中行
const selectBlock = (blockIndex: number) => {
  selectedBlock.value = blockIndex
  selectedItem.value = null
}

// 获取行样式
const getBlockStyle = (blockIndex: number) => {
  const block = pageData.content[blockIndex]
  if (!block) return null
  return block.style || {}
}

// 切换行边框
const toggleBlockBorder = (blockIndex: number, key: 'borderTop' | 'borderBottom' | 'borderLeft' | 'borderRight') => {
  const block = pageData.content[blockIndex]
  if (!block) return
  if (!block.style) {
    block.style = {}
  }
  block.style[key] = !block.style[key]
}

// 获取行样式（边框、对齐等，用于渲染）
const getBlockBorderStyle = (block: TextBlock | ImageBlock) => {
  const style = block.style || {}
  return {
    borderTop: style.borderTop ? '2rpx solid #333' : 'none',
    borderBottom: style.borderBottom ? '2rpx solid #333' : 'none',
    borderLeft: style.borderLeft ? '2rpx solid #333' : 'none',
    borderRight: style.borderRight ? '2rpx solid #333' : 'none',
    padding: (style.borderTop || style.borderBottom || style.borderLeft || style.borderRight) ? '16rpx' : '0',
    textAlign: style.textAlign || 'left'
  }
}

// 保存并跳转到详情页
const saveAndGoToDetail = async () => {
  // 先保存
  await saveData()
  // 如果保存成功且有memoId，跳转到详情页
  if (memoId.value) {
    uni.redirectTo({
      url: `/subPackages/services/memo/detail?id=${memoId.value}`
    })
  }
}

// 文本样式
const getTextStyle = (style: TextStyle) => {
  return {
    fontWeight: style.bold ? 'bold' : 'normal',
    fontStyle: style.italic ? 'italic' : 'normal',
    textDecoration: style.underline ? 'underline' : (style.lineThrough ? 'line-through' : 'none'),
    fontSize: (style.fontSize || 16) + 'px',
    color: style.color || '#333'
  }
}

const toggleTextStyle = (blockIndex: number, itemIndex: number, key: keyof TextStyle) => {
  const block = pageData.content[blockIndex] as TextBlock
  const item = block.children[itemIndex]
  if (key === 'bold' || key === 'italic' || key === 'underline' || key === 'lineThrough') {
    item.style[key] = !item.style[key]
  }
}

// 设置行对齐方式
const setBlockAlign = (blockIndex: number, align: 'left' | 'center' | 'right') => {
  const block = pageData.content[blockIndex]
  if (!block) return
  if (!block.style) {
    block.style = {}
  }
  block.style.textAlign = align
}

// 切换文本块的 Markdown 模式
const toggleBlockMarkdown = (blockIndex: number) => {
  const block = pageData.content[blockIndex] as TextBlock
  if (!block || block.type !== 'text') return
  block.isMarkdown = !block.isMarkdown
}

const fontSizeIndex = (size?: number) => {
  const idx = fontSizes.indexOf(size || 16)
  return idx >= 0 ? idx : 2
}

const setTextFontSize = (blockIndex: number, itemIndex: number, e: any) => {
  const block = pageData.content[blockIndex] as TextBlock
  block.children[itemIndex].style.fontSize = fontSizes[e.detail.value]
}

const showColorPicker = (blockIndex: number, itemIndex: number) => {
  currentColorTarget.value = { blockIndex, itemIndex }
  colorPickerVisible.value = true
}

const selectColor = (color: string) => {
  if (currentColorTarget.value) {
    const { blockIndex, itemIndex } = currentColorTarget.value
    const block = pageData.content[blockIndex] as TextBlock
    block.children[itemIndex].style.color = color
  }
  colorPickerVisible.value = false
}

// 图片样式
const getImageStyle = (style: ImageStyle) => {
  const result: Record<string, string> = {}
  switch (style.sizeMode) {
    case 'fixedWidth':
      result.width = (style.width || 600) + 'rpx'
      break
    case 'fixedHeight':
      result.height = (style.height || 400) + 'rpx'
      result.maxWidth = '100%'
      break
    case 'percentWidth':
      result.width = (style.widthPercent || 80) + '%'
      break
    case 'percentHeight':
      result.height = (style.heightPercent || 50) + 'vh'
      result.maxWidth = '100%'
      break
    case 'auto':
    default:
      // auto模式：默认宽度24rpx
      result.width = '24rpx'
      break
  }
  // 添加3D旋转样式
  const transforms = []
  if (style.rotateX) {
    transforms.push(`rotateX(${style.rotateX}deg)`)
  }
  if (style.rotateY) {
    transforms.push(`rotateY(${style.rotateY}deg)`)
  }
  if (style.rotate) {
    transforms.push(`rotateZ(${style.rotate}deg)`)
  }
  if (transforms.length > 0) {
    result.transform = transforms.join(' ')
  }
  return result
}

// 图片模式
const getImageMode = (style: ImageStyle) => {
  switch (style.sizeMode) {
    case 'fixedHeight':
    case 'percentHeight':
      return 'heightFix'
    default:
      return 'widthFix'
  }
}

const imageSizeModeIndex = (mode?: string) => {
  const idx = imageSizeModes.findIndex(m => m.value === mode)
  return idx >= 0 ? idx : 0
}

const getImageSizeModeLabel = (mode?: string) => {
  const item = imageSizeModes.find(m => m.value === mode)
  return item ? item.label : '自适应'
}

const setImageSizeMode = (blockIndex: number, itemIndex: number, e: any) => {
  const block = pageData.content[blockIndex] as ImageBlock
  block.children[itemIndex].style.sizeMode = imageSizeModes[e.detail.value].value as ImageStyle['sizeMode']
}

const setImageRotate = (blockIndex: number, itemIndex: number, e: any, axis: 'x' | 'y' | 'z' = 'z') => {
  const block = pageData.content[blockIndex] as ImageBlock
  if (axis === 'x') {
    block.children[itemIndex].style.rotateX = e.detail.value
  } else if (axis === 'y') {
    block.children[itemIndex].style.rotateY = e.detail.value
  } else {
    block.children[itemIndex].style.rotate = e.detail.value
  }
}

// 复制锚点链接到剪贴板（Markdown格式）
const copyAnchor = (num: number) => {
  const anchor = `L${num}`
  
  // #ifdef H5
  if (navigator.clipboard) {
    navigator.clipboard.writeText(anchor).then(() => {
      uni.showToast({
        title: `已复制: #L${num}`,
        icon: 'success',
        duration: 2000
      })
    }).catch(() => {
      uni.showModal({
        title: '锚点链接',
        content: anchor,
        showCancel: false
      })
    })
  } else {
    uni.showModal({
      title: '锚点链接',
      content: anchor,
      showCancel: false
    })
  }
  // #endif
  
  // #ifndef H5
  uni.setClipboardData({
    data: anchor,
    success: () => {
      uni.showToast({
        title: `已复制: [跳转](#L${num})`,
        icon: 'success',
        duration: 2000
      })
    },
    fail: () => {
      uni.showModal({
        title: '锚点链接',
        content: anchor,
        showCancel: false
      })
    }
  })
  // #endif
}

// 添加文本块
const addTextBlock = () => {
  pageData.content.push({
    type: 'text',
    children: [{
      value: '',
      style: { fontSize: 16, color: '#333' }
    }]
  })
}

// 添加图片块
const addImageBlock = () => {
  pageData.content.push({
    type: 'image',
    children: [{
      value: { id: '', url: '' },
      style: { sizeMode: 'auto', rotate: 0, rotateX: 0, rotateY: 0 }
    }]
  })
}

// 添加文本项
const addTextItem = (blockIndex: number) => {
  const block = pageData.content[blockIndex] as TextBlock
  block.children.push({
    value: '',
    style: { fontSize: 16, color: '#333' }
  })
}

// 添加图片项
const addImageItem = (blockIndex: number) => {
  const block = pageData.content[blockIndex] as ImageBlock
  block.children.push({
    value: { id: '', url: '' },
    style: { sizeMode: 'auto', rotate: 0, rotateX: 0, rotateY: 0 }
  })
}

// 删除文本项
const deleteTextItem = (blockIndex: number, itemIndex: number) => {
  const block = pageData.content[blockIndex] as TextBlock
  block.children.splice(itemIndex, 1)
  // 清除选中状态
  if (isItemSelected(blockIndex, itemIndex, 'text')) {
    selectedItem.value = null
  }
}

// 删除图片项
const deleteImageItem = (blockIndex: number, itemIndex: number) => {
  const block = pageData.content[blockIndex] as ImageBlock
  block.children.splice(itemIndex, 1)
  // 清除选中状态
  if (isItemSelected(blockIndex, itemIndex, 'image')) {
    selectedItem.value = null
  }
}

// 切换文本项的链接状态
const toggleTextLink = () => {
  const item = getSelectedItem() as TextItem | null
  if (!item) return

  if (item.linkInfo) {
    // 移除链接，同时移除链接样式
    item.linkInfo = undefined
    item.style.underline = false
    // 如果颜色是链接蓝色，恢复为默认黑色
    if (item.style.color === '#1890ff') {
      item.style.color = '#333333'
    }
  } else {
    // 添加链接，同时设置链接样式（下划线+蓝色）
    item.linkInfo = {
      label: item.value || '',
      linkType: 'url',
      url: ''
    }
    item.style.underline = true
    item.style.color = '#1890ff'
  }
}

// 设置文本链接类型
const setTextLinkType = (type: 'url' | 'navigation' | 'internal' | 'anchor') => {
  const item = getSelectedItem() as TextItem | null
  if (!item || !item.linkInfo) return

  item.linkInfo.linkType = type
  // 清空其他类型的数据
  if (type === 'url') {
    item.linkInfo.latitude = undefined
    item.linkInfo.longitude = undefined
    item.linkInfo.address = undefined
    item.linkInfo.internalScene = undefined
    item.linkInfo.internalId = undefined
    item.linkInfo.internalTitle = undefined
    item.linkInfo.internalPath = undefined
    item.linkInfo.anchorId = undefined
  } else if (type === 'navigation') {
    item.linkInfo.url = undefined
    item.linkInfo.internalScene = undefined
    item.linkInfo.internalId = undefined
    item.linkInfo.internalTitle = undefined
    item.linkInfo.internalPath = undefined
    item.linkInfo.anchorId = undefined
  } else if (type === 'internal') {
    item.linkInfo.url = undefined
    item.linkInfo.latitude = undefined
    item.linkInfo.longitude = undefined
    item.linkInfo.address = undefined
    item.linkInfo.anchorId = undefined
  } else if (type === 'anchor') {
    item.linkInfo.url = undefined
    item.linkInfo.latitude = undefined
    item.linkInfo.longitude = undefined
    item.linkInfo.address = undefined
    item.linkInfo.internalScene = undefined
    item.linkInfo.internalId = undefined
    item.linkInfo.internalTitle = undefined
    item.linkInfo.internalPath = undefined
  }
}

// 内部链接场景选择
const onInternalSceneChange = (e: any) => {
  const item = getSelectedItem() as TextItem | null
  if (!item || !item.linkInfo) return
  
  const scene = internalLinkScenes[e.detail.value]
  item.linkInfo.internalScene = scene.value as 'chat'
  // 清空之前选择的数据
  item.linkInfo.internalId = undefined
  item.linkInfo.internalTitle = undefined
  item.linkInfo.internalPath = undefined
}

// 显示写作素材选择器
const showChatSessionPicker = async () => {
  chatSessionPickerVisible.value = true
  loadingChatSessions.value = true
  
  try {
    const res: any = await getGeminiSessions({ page: 1, limit: 50 })
    chatSessions.value = res.results || []
  } catch (error) {
    console.error('获取笔记失败:', error)
    uni.showToast({ title: '获取笔记列表失败', icon: 'none' })
  } finally {
    loadingChatSessions.value = false
  }
}

// 选择写作素材
const selectChatSession = (session: ChatSession) => {
  const item = getSelectedItem() as TextItem | null
  if (!item || !item.linkInfo) return
  
  item.linkInfo.internalId = session.id
  item.linkInfo.internalTitle = session.title || '新建草稿'
  item.linkInfo.internalPath = `/subPackages/tools/chat/index?chatId=${session.id}`
  
  chatSessionPickerVisible.value = false
  uni.showToast({ title: '已关联素材', icon: 'success' })
}

// 唤起地图选点（文本项用）
const onSelectLocationForText = () => {
  const item = getSelectedItem() as TextItem | null
  if (!item || !item.linkInfo) {
    uni.showToast({ title: '请先启用链接', icon: 'none' })
    return
  }

  // #ifdef MP-WEIXIN
  // 直接使用 wx.chooseLocation 原生方法（已申请权限）
  // @ts-ignore
  wx.chooseLocation({
    success: (res: any) => {
      if (item.linkInfo) {
        item.linkInfo.latitude = res.latitude
        item.linkInfo.longitude = res.longitude
        item.linkInfo.address = res.name || res.address || ''
      }
      uni.showToast({ title: '位置已同步', icon: 'success' })
    },
    fail: (err: any) => {
      console.log('用户取消或选点失败', err)
      if (err.errMsg && !err.errMsg.includes('cancel')) {
        uni.showToast({ title: '选点失败', icon: 'none' })
      }
    }
  })
  // #endif

  // #ifdef H5
  uni.showToast({
    title: 'H5暂不支持地图选点，请手动输入经纬度',
    icon: 'none',
    duration: 2000
  })
  // #endif
}

// 删除块
const deleteBlock = (blockIndex: number) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个内容块吗？',
    success: (res) => {
      if (res.confirm) {
        // 清除选中状态
        if (selectedItem.value?.blockIndex === blockIndex) {
          selectedItem.value = null
        }
        pageData.content.splice(blockIndex, 1)
      }
    }
  })
}

// 移动块
const moveBlock = (blockIndex: number, direction: number) => {
  const newIndex = blockIndex + direction
  if (newIndex < 0 || newIndex >= pageData.content.length) return
  const temp = pageData.content[blockIndex]
  pageData.content[blockIndex] = pageData.content[newIndex]
  pageData.content[newIndex] = temp
}

// 选择图片 - 打开文件选择器
const chooseImage = async (blockIndex: number, itemIndex: number) => {
  currentImageTarget.value = { blockIndex, itemIndex }
  filePickerVisible.value = true

  // 加载云端文件
  await loadCloudFiles()
}

// 加载云端文件
const loadCloudFiles = async () => {
  try {
    loadingFiles.value = true
    const res = await getFiles({
      pageSize: 50,
      pageNumber: 1
    })

    if (res.items) {
      // 只显示图片文件
      cloudFiles.value = res.items.filter(file =>
        isImageFile(file.file_name)
      )
    }
    // cloudFiles.value = [
    //   {
    //     id: 'mock-1',
    //     file_name: '示例图片.png',
    //     file_url: 'https://img2.baidu.com/it/u=3937590892,2751365619&fm=253&fmt=auto&app=138&f=PNG?w=75&h=103',
    //     file_size: 15360,
    //     file_size_formatted: '15 KB',
    //     created_at: Math.floor(Date.now() / 1000)
    //   },
    //   {

    //     id: 'mock-1',
    //     file_name: '示例图片.png',
    //     file_url: 'https://bkimg.cdn.bcebos.com/pic/c75c10385343fbf2eb976ff5be7eca8064388fa9',
    //     file_size: 15360,
    //     file_size_formatted: '15 KB',
    //     created_at: Math.floor(Date.now() / 1000)
    //   }
    // ]
  } catch (error) {
    console.error('加载云端文件失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loadingFiles.value = false
  }
}

// 判断是否为图片文件
const isImageFile = (filename?: string) => {
  if (!filename) return false
  const ext = filename.split('.').pop()?.toLowerCase()
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext || '')
}

// 选择云端文件
const selectCloudFile = (file: getFilesResItems) => {
  if (!currentImageTarget.value) return

  const { blockIndex, itemIndex } = currentImageTarget.value
  const block = pageData.content[blockIndex] as ImageBlock

  block.children[itemIndex].value = {
    id: file.id || Date.now().toString(),
    url: file.file_url || '',
    name: file.file_name,
    size: file.file_size
  }

  filePickerVisible.value = false
  currentImageTarget.value = null
}

// 格式化日期
const formatDate = (timestamp?: number) => {
  if (!timestamp) return ''
  const date = new Date(timestamp * 1000)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return '今天'
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${month}月${day}日`
  }
}

// 预览图片（编辑模式）
const previewImage = (url: string) => {
  uni.previewImage({
    urls: [url],
    current: url
  })
}

// 预览图片（预览模式，支持多图切换）
const previewImageFull = (url: string) => {
  const urls = getAllImageUrls()
  const current = urls.indexOf(url)
  uni.previewImage({
    urls,
    current: current >= 0 ? current : 0
  })
}

// 获取所有图片URL
const getAllImageUrls = () => {
  const urls: string[] = []
  pageData.content.forEach(block => {
    if (block.type === 'image') {
      (block as ImageBlock).children.forEach(item => {
        if (item.value.url) {
          urls.push(item.value.url)
        }
      })
    }
  })
  return urls
}

// 添加标签
const addTag = () => {
  const tag = tagInput.value.trim()
  if (tag && !tags.value.includes(tag)) {
    tags.value.push(tag)
    tagInput.value = ''
  }
}

// 移除标签
const removeTag = (index: number) => {
  tags.value.splice(index, 1)
}

// 分享内容
const shareContent = () => {
  shareMemo()
}

// 分享备忘录
const shareMemo = () => {
  if (!memoId.value) {
    uni.showToast({
      title: '请先保存备忘录',
      icon: 'none'
    })
    return
  }

  // #ifdef MP-WEIXIN
  // 微信小程序使用右上角分享
  uni.showToast({
    title: '请点击右上角分享',
    icon: 'none'
  })
  // #endif

  // #ifdef H5
  // H5使用复制链接
  const shareUrl = `${window.location.origin}/subPackages/services/memo/detail?id=${memoId.value}`
  // @ts-ignore
  if (navigator.clipboard) {
    // @ts-ignore
    navigator.clipboard.writeText(shareUrl).then(() => {
      uni.showToast({
        title: '链接已复制',
        icon: 'success'
      })
    }).catch(() => {
      uni.showModal({
        title: '分享链接',
        content: shareUrl,
        showCancel: false
      })
    })
  } else {
    uni.showModal({
      title: '分享链接',
      content: shareUrl,
      showCancel: false
    })
  }
  // #endif
}

// ========== 导出图片功能 ==========
const exportLoading = ref(false)
const canvasWidth = ref(375)
const canvasHeight = ref(600)

// 导出为图片
const exportToImage = async () => {
  if (exportLoading.value) return

  try {
    exportLoading.value = true
    uni.showLoading({
      title: '正在生成图片...',
      mask: true
    })

    // 固定导出宽度为375px
    const canvasW = 375
    const padding = 4
    const contentWidth = canvasW - padding * 2
    const pixelRatio = 1

    // 预计算内容高度
    let totalHeight = padding

    for (const block of pageData.content) {
      if (block.type === 'text') {
        for (const item of (block as TextBlock).children) {
          const fontSize = item.style.fontSize || 16
          const text = item.value || ''
          const charsPerLine = Math.floor(contentWidth / fontSize)
          const lines = Math.ceil(text.length / charsPerLine) || 1
          totalHeight += lines * fontSize * 1.8 + 16
        }
      } else if (block.type === 'image') {
        for (const item of (block as ImageBlock).children) {
          if (item.value.url) {
            // 根据图片样式估算高度，与预览模式保持一致
            const imageStyle = item.style
            let estimatedHeight = 150
            switch (imageStyle.sizeMode) {
              case 'fixedWidth':
                estimatedHeight = (imageStyle.width || 600) * 375 / 750 * 0.75
                break
              case 'fixedHeight':
                estimatedHeight = (imageStyle.height || 400) * 375 / 750
                break
              case 'percentWidth':
                estimatedHeight = contentWidth * (imageStyle.widthPercent || 80) / 100 * 0.75
                break
              case 'percentHeight':
                estimatedHeight = 200 * (imageStyle.heightPercent || 50) / 100
                break
              case 'auto':
              default:
                // auto模式：24rpx在375px宽度下换算为24px
                estimatedHeight = 24 * 0.7
                break
            }
            totalHeight += estimatedHeight + 16
          }
        }
      }
      totalHeight += 20
    }

    totalHeight += padding
    totalHeight = Math.max(totalHeight, 300)

    canvasWidth.value = canvasW
    canvasHeight.value = totalHeight

    await new Promise(resolve => setTimeout(resolve, 150))

    // #ifdef H5
    await drawWithH5Canvas(canvasW, totalHeight, padding, contentWidth, pixelRatio)
    // #endif

    // #ifndef H5
    await drawWithMpCanvas(canvasW, totalHeight, padding, contentWidth, pixelRatio)
    // #endif

  } catch (error) {
    console.error('导出图片失败:', error)
    uni.hideLoading()
    uni.showToast({
      title: '导出失败，请重试',
      icon: 'none'
    })
    exportLoading.value = false
  }
}

// H5端绘制
const drawWithH5Canvas = async (canvasW: number, totalHeight: number, padding: number, contentWidth: number, pixelRatio: number) => {
  const canvas = document.createElement('canvas')
  canvas.width = canvasW * pixelRatio
  canvas.height = totalHeight * pixelRatio
  const ctx = canvas.getContext('2d')!
  ctx.scale(pixelRatio, pixelRatio)

  // 绘制背景
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvasW, totalHeight)

  let y = padding

  // 绘制内容块（模拟 inline-block 布局，第一个文本块的第一项为标题）
  for (const block of pageData.content) {
    const blockStyle = block.style || {}
    const blockPadding = (blockStyle.borderTop || blockStyle.borderBottom || blockStyle.borderLeft || blockStyle.borderRight) ? 8 : 0
    const blockStartY = y
    const blockStartX = padding

    if (block.type === 'text') {
      const textAlign = blockStyle.textAlign || 'left'
      let x = padding + blockPadding
      let lineHeight = 0
      let lineStartY = y + blockPadding
      y = lineStartY

      for (const item of (block as TextBlock).children) {
        const fontSize = item.style.fontSize || 16
        const fontWeight = item.style.bold ? 'bold' : 'normal'
        const fontStyle = item.style.italic ? 'italic' : 'normal'

        ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px sans-serif`
        ctx.fillStyle = item.style.color || '#333333'
        ctx.textBaseline = 'top'

        const text = item.value || ''
        const textWidth = ctx.measureText(text).width
        const itemHeight = fontSize * 1.4

        // 检查是否需要换行
        if (x + textWidth > padding + contentWidth - blockPadding && x > padding + blockPadding) {
          y = lineStartY + lineHeight + 8
          lineStartY = y
          x = padding + blockPadding
          lineHeight = 0
        }

        // 根据行对齐方式计算绘制位置
        let drawX = x
        if (textAlign === 'center') {
          drawX = padding + (contentWidth - textWidth) / 2
        } else if (textAlign === 'right') {
          drawX = padding + contentWidth - blockPadding - textWidth
        }

        // 绘制文本
        ctx.fillText(text, drawX, y)

        // 更新位置
        x += textWidth + 4
        lineHeight = Math.max(lineHeight, itemHeight)
      }

      y = lineStartY + lineHeight + blockPadding
    } else if (block.type === 'image') {
      const imageAlign = blockStyle.textAlign || 'left'
      let x = padding + blockPadding
      let lineHeight = 0
      let lineStartY = y + blockPadding
      y = lineStartY

      for (const item of (block as ImageBlock).children) {
        if (item.value.url) {
          try {
            const img = await loadImageForExport(item.value.url)
            if (img) {
              // 根据图片样式计算绘制尺寸，与预览模式保持一致
              const imageStyle = item.style
              let drawWidth = img.width || 200
              let drawHeight = img.height || 150
              const aspectRatio = drawWidth / drawHeight

              switch (imageStyle.sizeMode) {
                case 'fixedWidth':
                  drawWidth = (imageStyle.width || 600) * 375 / 750
                  drawHeight = drawWidth / aspectRatio
                  break
                case 'fixedHeight':
                  drawHeight = (imageStyle.height || 400) * 375 / 750
                  drawWidth = drawHeight * aspectRatio
                  break
                case 'percentWidth':
                  drawWidth = contentWidth * (imageStyle.widthPercent || 80) / 100
                  drawHeight = drawWidth / aspectRatio
                  break
                case 'percentHeight':
                  drawHeight = 200 * (imageStyle.heightPercent || 50) / 100
                  drawWidth = drawHeight * aspectRatio
                  break
                case 'auto':
                default:
                  // auto模式：24rpx在375px宽度下换算为24px
                  drawWidth = 24 * 375 / 750
                  drawHeight = drawWidth / aspectRatio
                  break
              }

              // 限制最大宽度不超过内容区域
              if (drawWidth > contentWidth) {
                drawHeight = (contentWidth / drawWidth) * drawHeight
                drawWidth = contentWidth
              }

              // 检查是否需要换行
              if (x + drawWidth > padding + contentWidth - blockPadding && x > padding + blockPadding) {
                y = lineStartY + lineHeight + 8
                lineStartY = y
                x = padding + blockPadding
                lineHeight = 0
              }

              // 根据行对齐方式计算绘制位置
              let drawX = x
              if (imageAlign === 'center') {
                drawX = padding + (contentWidth - drawWidth) / 2
              } else if (imageAlign === 'right') {
                drawX = padding + contentWidth - blockPadding - drawWidth
              }

              // 应用旋转变换
              const rotate = imageStyle.rotate || 0
              if (rotate !== 0) {
                ctx.save()
                const centerX = drawX + drawWidth / 2
                const centerY = y + drawHeight / 2
                ctx.translate(centerX, centerY)
                ctx.rotate((rotate * Math.PI) / 180)
                ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)
                ctx.restore()
              } else {
                ctx.drawImage(img, drawX, y, drawWidth, drawHeight)
              }

              x += drawWidth
              lineHeight = Math.max(lineHeight, drawHeight)
            }
          } catch (e) {
            console.error('绘制图片失败:', e)
          }
        }
      }

      y = lineStartY + lineHeight + blockPadding
    }

    // 绘制行边框
    const blockEndY = y
    const blockWidth = contentWidth
    if (blockStyle.borderTop || blockStyle.borderBottom || blockStyle.borderLeft || blockStyle.borderRight) {
      ctx.strokeStyle = '#333333'
      ctx.lineWidth = 1
      if (blockStyle.borderTop) {
        ctx.beginPath()
        ctx.moveTo(blockStartX, blockStartY)
        ctx.lineTo(blockStartX + blockWidth, blockStartY)
        ctx.stroke()
      }
      if (blockStyle.borderBottom) {
        ctx.beginPath()
        ctx.moveTo(blockStartX, blockEndY)
        ctx.lineTo(blockStartX + blockWidth, blockEndY)
        ctx.stroke()
      }
      if (blockStyle.borderLeft) {
        ctx.beginPath()
        ctx.moveTo(blockStartX, blockStartY)
        ctx.lineTo(blockStartX, blockEndY)
        ctx.stroke()
      }
      if (blockStyle.borderRight) {
        ctx.beginPath()
        ctx.moveTo(blockStartX + blockWidth, blockStartY)
        ctx.lineTo(blockStartX + blockWidth, blockEndY)
        ctx.stroke()
      }
    }

    y += 8
  }

  // 下载图片（使用最高质量）
  const dataURL = canvas.toDataURL('image/png', 1.0)
  const link = document.createElement('a')
  link.download = `备忘录_${formatExportDate()}.png`
  link.href = dataURL
  link.click()

  uni.hideLoading()
  uni.showToast({
    title: '图片已下载',
    icon: 'success'
  })
  exportLoading.value = false
}

// 小程序端绘制
const drawWithMpCanvas = async (canvasW: number, totalHeight: number, padding: number, contentWidth: number, pixelRatio: number) => {
  const query = uni.createSelectorQuery()
  query.select('#exportCanvas')
    .fields({ node: true, size: true })
    .exec(async (res) => {
      if (!res[0] || !res[0].node) {
        uni.hideLoading()
        uni.showToast({ title: '导出失败', icon: 'none' })
        exportLoading.value = false
        return
      }

      const canvas = res[0].node
      const ctx = canvas.getContext('2d')

      canvas.width = canvasW * pixelRatio
      canvas.height = totalHeight * pixelRatio
      ctx.scale(pixelRatio, pixelRatio)

      // 绘制背景
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvasW, totalHeight)

      let y = padding

      // 绘制内容块（模拟 inline-block 布局，第一个文本块的第一项为标题）
      for (const block of pageData.content) {
        const blockStyle = block.style || {}
        const blockPadding = (blockStyle.borderTop || blockStyle.borderBottom || blockStyle.borderLeft || blockStyle.borderRight) ? 8 : 0
        const blockStartY = y
        const blockStartX = padding

        if (block.type === 'text') {
          const textAlign = blockStyle.textAlign || 'left'
          let x = padding + blockPadding
          let lineHeight = 0
          let lineStartY = y + blockPadding
          y = lineStartY

          for (const item of (block as TextBlock).children) {
            const fontSize = item.style.fontSize || 16
            const fontWeight = item.style.bold ? 'bold' : 'normal'
            const fontStyle = item.style.italic ? 'italic' : 'normal'

            ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px sans-serif`
            ctx.fillStyle = item.style.color || '#333333'
            ctx.textBaseline = 'top'

            const text = item.value || ''
            const textWidth = ctx.measureText(text).width
            const itemHeight = fontSize * 1.4

            // 检查是否需要换行
            if (x + textWidth > padding + contentWidth - blockPadding && x > padding + blockPadding) {
              y = lineStartY + lineHeight + 8
              lineStartY = y
              x = padding + blockPadding
              lineHeight = 0
            }

            // 根据行对齐方式计算绘制位置
            let drawX = x
            if (textAlign === 'center') {
              drawX = padding + (contentWidth - textWidth) / 2
            } else if (textAlign === 'right') {
              drawX = padding + contentWidth - blockPadding - textWidth
            }

            // 绘制文本
            ctx.fillText(text, drawX, y)

            x += textWidth + 4
            lineHeight = Math.max(lineHeight, itemHeight)
          }

          y = lineStartY + lineHeight + blockPadding
        } else if (block.type === 'image') {
          const imageAlign = blockStyle.textAlign || 'left'
          let x = padding + blockPadding
          let lineHeight = 0
          let lineStartY = y + blockPadding
          y = lineStartY

          for (const item of (block as ImageBlock).children) {
            if (item.value.url) {
              try {
                const imgPath = await downloadImageForExport(item.value.url)
                if (imgPath) {
                  const img = canvas.createImage()
                  await new Promise<void>((resolve, reject) => {
                    img.onload = () => resolve()
                    img.onerror = reject
                    img.src = imgPath
                  })

                  // 根据图片样式计算绘制尺寸，与预览模式保持一致
                  const imageStyle = item.style
                  let drawWidth = img.width || 200
                  let drawHeight = img.height || 150
                  const aspectRatio = drawWidth / drawHeight

                  switch (imageStyle.sizeMode) {
                    case 'fixedWidth':
                      drawWidth = (imageStyle.width || 600) * 375 / 750
                      drawHeight = drawWidth / aspectRatio
                      break
                    case 'fixedHeight':
                      drawHeight = (imageStyle.height || 400) * 375 / 750
                      drawWidth = drawHeight * aspectRatio
                      break
                    case 'percentWidth':
                      drawWidth = contentWidth * (imageStyle.widthPercent || 80) / 100
                      drawHeight = drawWidth / aspectRatio
                      break
                    case 'percentHeight':
                      drawHeight = 200 * (imageStyle.heightPercent || 50) / 100
                      drawWidth = drawHeight * aspectRatio
                      break
                    case 'auto':
                    default:
                      // auto模式：24rpx在375px宽度下换算为24px
                      drawWidth = 24
                      drawHeight = drawWidth / aspectRatio
                      break
                  }

                  // 限制最大宽度不超过内容区域
                  if (drawWidth > contentWidth) {
                    drawHeight = (contentWidth / drawWidth) * drawHeight
                    drawWidth = contentWidth
                  }

                  // 检查是否需要换行
                  if (x + drawWidth > padding + contentWidth - blockPadding && x > padding + blockPadding) {
                    y = lineStartY + lineHeight + 8
                    lineStartY = y
                    x = padding + blockPadding
                    lineHeight = 0
                  }

                  // 根据行对齐方式计算绘制位置
                  let drawX = x
                  if (imageAlign === 'center') {
                    drawX = padding + (contentWidth - drawWidth) / 2
                  } else if (imageAlign === 'right') {
                    drawX = padding + contentWidth - blockPadding - drawWidth
                  }

                  // 应用旋转变换
                  const rotate = imageStyle.rotate || 0
                  if (rotate !== 0) {
                    ctx.save()
                    const centerX = drawX + drawWidth / 2
                    const centerY = y + drawHeight / 2
                    ctx.translate(centerX, centerY)
                    ctx.rotate((rotate * Math.PI) / 180)
                    ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)
                    ctx.restore()
                  } else {
                    ctx.drawImage(img, drawX, y, drawWidth, drawHeight)
                  }

                  x += drawWidth
                  lineHeight = Math.max(lineHeight, drawHeight)
                }
              } catch (e) {
                console.error('绘制图片失败:', e)
              }
            }
          }

          y = lineStartY + lineHeight + blockPadding
        }

        // 绘制行边框
        const blockEndY = y
        const blockWidth = contentWidth
        if (blockStyle.borderTop || blockStyle.borderBottom || blockStyle.borderLeft || blockStyle.borderRight) {
          ctx.strokeStyle = '#333333'
          ctx.lineWidth = 1
          if (blockStyle.borderTop) {
            ctx.beginPath()
            ctx.moveTo(blockStartX, blockStartY)
            ctx.lineTo(blockStartX + blockWidth, blockStartY)
            ctx.stroke()
          }
          if (blockStyle.borderBottom) {
            ctx.beginPath()
            ctx.moveTo(blockStartX, blockEndY)
            ctx.lineTo(blockStartX + blockWidth, blockEndY)
            ctx.stroke()
          }
          if (blockStyle.borderLeft) {
            ctx.beginPath()
            ctx.moveTo(blockStartX, blockStartY)
            ctx.lineTo(blockStartX, blockEndY)
            ctx.stroke()
          }
          if (blockStyle.borderRight) {
            ctx.beginPath()
            ctx.moveTo(blockStartX + blockWidth, blockStartY)
            ctx.lineTo(blockStartX + blockWidth, blockEndY)
            ctx.stroke()
          }
        }

        y += 8
      }

      // 导出图片并保存到相册（使用最高质量）
      setTimeout(() => {
        uni.canvasToTempFilePath({
          canvas,
          width: canvasW,
          height: totalHeight,
          destWidth: canvasW * pixelRatio,
          destHeight: totalHeight * pixelRatio,
          fileType: 'png',
          quality: 1.0,
          success: (res) => {
            saveImageToAlbum(res.tempFilePath)
          },
          fail: (err) => {
            console.error('生成图片失败:', err)
            uni.hideLoading()
            uni.showToast({ title: '生成图片失败', icon: 'none' })
            exportLoading.value = false
          }
        })
      }, 100)
    })
}

// 文本换行处理
const wrapTextForCanvas = (ctx: any, text: string, maxWidth: number): string[] => {
  const lines: string[] = []
  if (!text) return ['']

  let currentLine = ''
  for (const char of text) {
    const testLine = currentLine + char
    const metrics = ctx.measureText(testLine)
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = char
    } else {
      currentLine = testLine
    }
  }
  if (currentLine) {
    lines.push(currentLine)
  }
  return lines.length ? lines : ['']
}

// H5端加载图片
const loadImageForExport = (url: string): Promise<HTMLImageElement | null> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => {
      console.error('图片加载失败:', url)
      resolve(null)
    }
    img.src = url + (url.includes('?') ? '&' : '?') + '_t=' + Date.now()
  })
}

// 小程序端下载图片
const downloadImageForExport = (url: string): Promise<string> => {
  return new Promise((resolve) => {
    if (url.startsWith('wxfile://') || url.startsWith('http://tmp') || url.startsWith('/')) {
      resolve(url)
      return
    }

    uni.downloadFile({
      url,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.tempFilePath)
        } else {
          resolve('')
        }
      },
      fail: () => resolve('')
    })
  })
}

// 保存图片到相册
const saveImageToAlbum = (tempFilePath: string) => {
  uni.saveImageToPhotosAlbum({
    filePath: tempFilePath,
    success: () => {
      uni.hideLoading()
      uni.showToast({
        title: '已保存到相册',
        icon: 'success'
      })
      exportLoading.value = false
    },
    fail: (err) => {
      console.error('保存到相册失败:', err)
      if (err.errMsg?.includes('auth deny') || err.errMsg?.includes('authorize')) {
        uni.hideLoading()
        uni.showModal({
          title: '提示',
          content: '需要您授权保存图片到相册',
          confirmText: '去授权',
          success: (res) => {
            if (res.confirm) {
              uni.openSetting({
                success: (settingRes) => {
                  if (settingRes.authSetting['scope.writePhotosAlbum']) {
                    saveImageToAlbum(tempFilePath)
                  } else {
                    exportLoading.value = false
                  }
                }
              })
            } else {
              exportLoading.value = false
            }
          }
        })
      } else {
        uni.hideLoading()
        uni.showToast({ title: '保存失败', icon: 'none' })
        exportLoading.value = false
      }
    }
  })
}

// 格式化导出日期
const formatExportDate = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hour = String(now.getHours()).padStart(2, '0')
  const minute = String(now.getMinutes()).padStart(2, '0')
  return `${year}${month}${day}_${hour}${minute}`
}

// 生成默认备忘录名称
const generateDefaultMemoName = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hour = String(now.getHours()).padStart(2, '0')
  const minute = String(now.getMinutes()).padStart(2, '0')
  const second = String(now.getSeconds()).padStart(2, '0')
  const serial = `${hour}${minute}${second}`
  return `备忘录-${year}${month}${day}-${serial}`
}

// 获取标题值（第一个文本块的第一项）
const getTitleValue = () => {
  const firstBlock = pageData.content[0]
  if (firstBlock?.type === 'text') {
    return (firstBlock as TextBlock).children[0]?.value || '我的备忘录'
  }
  return '我的备忘录'
}

// 保存数据
const saveData = async () => {
  // 备忘录名称默认值
  if (!memoName.value.trim()) {
    memoName.value = generateDefaultMemoName()
  }

  // 确保标题有值
  // const firstBlock = pageData.content[0]
  // if (firstBlock?.type === 'text') {
  //   const titleItem = (firstBlock as TextBlock).children[0]
  //   if (titleItem && !titleItem.value.trim()) {
  //     titleItem.value = '我的备忘录'
  //   }
  // }

  // 关闭面板
  selectedBlock.value = null
  selectedItem.value = null

  try {
    uni.showLoading({
      title: '保存中...',
      mask: true
    })

    const memoData = {
      name: memoName.value,
      content: pageData.content,
      tags: tags.value,
    }

    console.log('保存的数据:', JSON.stringify(memoData, null, 2))

    // 调用 API 保存
    const isCreate = !memoId.value
    let savedMemo
    if (memoId.value) {
      // 更新现有备忘录
      savedMemo = await patchMemosMemoId(memoId.value, memoData)
    } else {
      // 创建新备忘录
      savedMemo = await postMemos(memoData)
    }

    // 处理返回结果 - HTTP拦截器已经返回data字段，所以直接使用result
    if (savedMemo && savedMemo.id) {
      memoId.value = savedMemo.id
      console.log('保存成功，备忘录ID:', memoId.value)

      // 同时保存到本地存储作为备份
      uni.setStorageSync('richEditorData', JSON.stringify({
        ...memoData,
        id: memoId.value
      }))
    }

    uni.hideLoading()
    uni.showToast({
      title: isCreate ? '创建成功' : '更新成功',
      icon: 'success'
    })

    // 触发列表刷新事件
    uni.$emit('memo-list-refresh')
  } catch (error) {
    console.error('保存失败:', error)
    uni.hideLoading()
    uni.showToast({
      title: error.message || '保存失败',
      icon: 'none'
    })
  }
}

// 加载数据
const loadData = async () => {
  try {
    // 如果有 memoId，从 API 加载
    if (memoId.value) {
      uni.showLoading({
        title: '加载中...',
        mask: true
      })

      // 调用 API 获取备忘录详情
      const result = await getMemosMemoId(memoId.value)

      uni.hideLoading()

      // 处理返回数据 - HTTP拦截器已经返回data字段，所以直接使用result
      const memo = result
      if (memo && memo.id) {
        memoName.value = memo.name || ''
        tags.value = memo.tags || []

        // 加载内容（第一个文本块的第一项为标题）
        if (memo.content && Array.isArray(memo.content)) {
          pageData.content = memo.content
        }

        // 兼容旧数据：如果有独立的 title 字段，将其合并到第一个文本块
        if (memo.title && memo.title.value) {
          const firstBlock = pageData.content[0]
          if (firstBlock?.type === 'text') {
            const titleItem = (firstBlock as TextBlock).children[0]
            if (titleItem) {
              titleItem.value = memo.title.value
              Object.assign(titleItem.style, memo.title.style)
            }
          }
        }

        console.log('从 API 加载的数据:', memo)

        // 同时保存到本地存储作为备份
        uni.setStorageSync('richEditorData', JSON.stringify({
          id: memo.id,
          name: memo.name,
          content: memo.content,
          tags: memo.tags
        }))
      } else {
        // 如果 API 返回格式不同，尝试从本地存储加载
        console.warn('API 返回格式异常，尝试从本地存储加载')
        const savedData = uni.getStorageSync('richEditorData')
        if (savedData) {
          const data = JSON.parse(savedData)
          memoName.value = data.name || ''
          tags.value = data.tags || []
          if (data.content) {
            pageData.content = data.content
          }
          // 兼容旧数据：如果有独立的 title 字段，将其合并到第一个文本块
          if (data.title && data.title.value) {
            const firstBlock = pageData.content[0]
            if (firstBlock?.type === 'text') {
              const titleItem = (firstBlock as TextBlock).children[0]
              if (titleItem) {
                titleItem.value = data.title.value
                Object.assign(titleItem.style, data.title.style)
              }
            }
          }
        }
      }
      return
    }

    // 新建备忘录，使用空白页面
    console.log('新建备忘录，使用空白页面')
  } catch (error) {
    console.error('加载数据失败:', error)
    uni.hideLoading()

    // 尝试从本地存储加载作为降级方案
    if (memoId.value) {
      const savedData = uni.getStorageSync('richEditorData')
      if (savedData) {
        try {
          const data = JSON.parse(savedData)
          if (data.id === memoId.value) {
            memoName.value = data.name || ''
            tags.value = data.tags || []
            if (data.content) {
              pageData.content = data.content
            }
            // 兼容旧数据：如果有独立的 title 字段，将其合并到第一个文本块
            if (data.title && data.title.value) {
              const firstBlock = pageData.content[0]
              if (firstBlock?.type === 'text') {
                const titleItem = (firstBlock as TextBlock).children[0]
                if (titleItem) {
                  titleItem.value = data.title.value
                  Object.assign(titleItem.style, data.title.style)
                }
              }
            }
            uni.showToast({
              title: '已从缓存加载',
              icon: 'none'
            })
            return
          }
        } catch (e) {
          console.error('解析本地数据失败:', e)
        }
      }
    }

    uni.showToast({
      title: error.message || '加载数据失败',
      icon: 'none'
    })
  }
}

// 页面加载时初始化数据
onMounted(() => {
  // 从 URL 参数获取模式和 memoId
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options as any

  // 如果有 id，设置 memoId
  if (options.id) {
    memoId.value = options.id
  }

  loadData()
})


// 微信小程序分享配置
// #ifdef MP-WEIXIN
onShareAppMessage(() => {
  return {
    title: memoName.value || '我的备忘录',
    path: `/subPackages/services/memo/detail?id=${memoId.value}`,
    imageUrl: '' // 可以设置分享图片
  }
})
// #endif
</script>

<style lang="scss" scoped>
.editor-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.nav-actions {
  display: flex;
  gap: 16rpx;
  align-items: center;
}

.nav-action-btn {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  font-size: 28rpx;
}

.nav-mode-switch {
  padding: 8rpx 24rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 24rpx;
  font-size: 26rpx;
  color: #fff;
}

.scrollable-content {
  flex: 1;
  overflow-y: auto;
}

.memo-info-section {
  background: #fff;
  padding: 24rpx 32rpx;

  .memo-name-input {
    width: 100%;
    font-size: 32rpx;
    font-weight: 600;
    padding: 20rpx 0;
    border-bottom: 2rpx solid #eee;
    margin-bottom: 20rpx;
  }

  .tags-section {
    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 12rpx;
      align-items: center;

      .tag-item {
        display: flex;
        align-items: center;
        gap: 8rpx;
        padding: 8rpx 16rpx;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #fff;
        border-radius: 24rpx;
        font-size: 24rpx;

        .tag-text {
          max-width: 200rpx;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .tag-remove {
          font-size: 32rpx;
          line-height: 1;
          cursor: pointer;
          opacity: 0.8;

          &:active {
            opacity: 1;
          }
        }
      }

      .tag-input {
        flex: 1;
        min-width: 120rpx;
        padding: 8rpx 16rpx;
        background: #f8f9fa;
        border-radius: 24rpx;
        font-size: 24rpx;
        border: 2rpx solid #eee;

        &:focus {
          background: #fff;
          border-color: #667eea;
        }
      }
    }
  }
}

.title-section {
  background: #fff;
  padding: 32rpx;

  .title-input {
    width: 100%;
    font-size: 36rpx;
    font-weight: bold;
    padding: 20rpx 0;
    border-bottom: 2rpx solid #eee;
  }

  .title-preview {
    display: block;
    font-size: 40rpx;
    line-height: 1.4;
  }

  .title-style-bar {
    display: flex;
    gap: 16rpx;
    margin-top: 20rpx;
  }
}

.content-section {
  padding: 0;

  .empty-tip {
    text-align: center;
    color: #999;
    padding: 60rpx 0;
    font-size: 28rpx;
  }
}

.content-block {
  background: #fff;
  border-radius: 0;
  overflow: hidden;
}

.block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 24rpx;
  background: #f8f9fa;
  border-bottom: 1rpx solid #eee;

  .block-type-label {
    font-size: 26rpx;
    color: #666;
  }

  .block-actions {
    display: flex;
    gap: 16rpx;

    .action-btn {
      width: 48rpx;
      height: 48rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #eee;
      border-radius: 8rpx;
      font-size: 24rpx;

      &.delete {
        background: #ffebee;
        color: #f44336;
      }
    }
  }
}

.text-block,
.image-block {
  padding: 24rpx;
  position: relative; // 为锚点ID显示定位
}

// 锚点ID显示样式
.anchor-id-display {
  // position: absolute;
  // top: 8rpx;
  // right: 8rpx;
  // z-index: 10;
  
  .anchor-id-badge {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: rgba(102, 126, 234, 0.1);
    border: 1rpx solid rgba(102, 126, 234, 0.3);
    border-radius: 12rpx;
    padding: 8rpx 12rpx;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background: rgba(102, 126, 234, 0.2);
      transform: scale(1.05);
    }
    
    &:active {
      background: rgba(102, 126, 234, 0.3);
      transform: scale(0.95);
    }
    
    .anchor-tag {
      font-size: 24rpx;
      color: #667eea;
      font-weight: 600;
      font-family: monospace;
      margin-bottom: 2rpx;
    }
    
    .copy-hint {
      font-size: 18rpx;
      color: #999;
      opacity: 0.8;
    }
  }
}

.text-item,
.image-item {
  border-radius: 8rpx;
  transition: all 0.3s;
  display: inline-block;

  &:last-child {
    border-bottom: none;
  }

  &.selected {
    background: #e6f7ff;
    border: 2rpx solid #1890ff;
    padding: 16rpx;
    margin: -16rpx;
    margin-bottom: 8rpx;
  }
}

.text-input {
  width: 100%;
  min-height: 80rpx;
  padding: 16rpx;
  background: #f8f9fa;
  border-radius: 8rpx;
  font-size: 28rpx;
  line-height: 1.6;
}

.text-display {
  width: 100%;
  min-height: 80rpx;
  padding: 16rpx;
  background: #f8f9fa;
  border-radius: 8rpx;
  font-size: 28rpx;
  line-height: 1.6;
  word-wrap: break-word;
  white-space: pre-wrap;
  cursor: pointer;
  transition: all 0.3s;

  &:active {
    background: #e8eaf0;
  }
}

.text-preview {
  display: block;
  line-height: 1.8;
  word-wrap: break-word;
}

.image-preview-only {
  display: block;
  width: 100%;
  border-radius: 12rpx;
}

.text-style-bar,
.image-style-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 16rpx;
  align-items: center;

  .style-label {
    font-size: 24rpx;
    color: #666;
    margin-right: 4rpx;
  }

  .rotate-slider {
    flex: 1;
    min-width: 200rpx;
  }

  .rotate-value {
    font-size: 24rpx;
    color: #333;
    min-width: 60rpx;
    text-align: center;
  }
}

.image-rotate-bar {
  margin-top: 16rpx;
  padding: 16rpx;
  background: #f8f9fa;
  border-radius: 8rpx;

  .rotate-label {
    font-size: 26rpx;
    color: #333;
    font-weight: 500;
    margin-bottom: 12rpx;
  }

  .rotate-slider {
    width: 100%;
  }
}

.rotate-tip {
  margin-top: 16rpx;
  padding: 12rpx 16rpx;
  background: #fff7e6;
  border-left: 4rpx solid #faad14;
  border-radius: 4rpx;

  text {
    font-size: 24rpx;
    color: #d48806;
    line-height: 1.5;
  }
}

.style-btn {
  min-width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #333;
  padding: 0 16rpx;

  &.active {
    background: #1890ff;
    color: #fff;
  }

  &.italic {
    font-style: italic;
  }

  &.size-btn,
  &.size-mode-btn {
    font-size: 22rpx;
    min-width: 80rpx;
  }

  &.color-btn {
    width: 56rpx;
    border: 2rpx solid #ddd;
  }

  &.delete-item {
    background: #ffebee;
    margin-left: auto;
  }

  &.align-btn {
    font-size: 20rpx;
    min-width: 48rpx;
    padding: 0 8rpx;
  }
}

.align-btns {
  display: flex;
  gap: 4rpx;
  background: #e8e8e8;
  border-radius: 8rpx;
  padding: 4rpx;

  .align-btn:first-child {
    text-align: left;
  }

  .align-btn:nth-child(2) {
    text-align: center;
  }

  .align-btn:last-child {
    text-align: right;
  }
}

.size-input-group {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 24rpx;
  color: #666;

  .size-input {
    width: 120rpx;
    height: 56rpx;
    background: #fff;
    border: 1rpx solid #ddd;
    border-radius: 8rpx;
    text-align: center;
    font-size: 24rpx;
    padding: 0 8rpx;
  }

  .unit {
    font-size: 22rpx;
    color: #999;
  }
}

.image-upload-area {
  width: 100%;
  height: 300rpx;
  background: #f8f9fa;
  border: 2rpx dashed #ddd;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .upload-icon {
    font-size: 80rpx;
    color: #ccc;
  }

  .upload-text {
    font-size: 26rpx;
    color: #999;
    margin-top: 16rpx;
  }
}

.image-preview {
  background: #f8f9fa;
  border-radius: 12rpx;
  overflow: hidden;

  .image-container {
    width: 100%;
    min-height: 200rpx;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;

    image {
      width: 100%;
      display: block;
    }
  }

  .image-info {
    padding: 20rpx;
    background: #fff;
    border-top: 1rpx solid #eee;

    .image-name {
      font-size: 26rpx;
      color: #333;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-bottom: 12rpx;
    }

    .image-actions {
      display: flex;
      gap: 24rpx;

      .action-link {
        font-size: 26rpx;
        color: #1890ff;
        padding: 8rpx 0;

        &:active {
          opacity: 0.7;
        }
      }
    }
  }
}

.add-item-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 24rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  margin-top: 16rpx;

  .add-icon {
    font-size: 36rpx;
    color: #1890ff;
  }

  .add-text {
    font-size: 26rpx;
    color: #1890ff;
  }
}

.add-block-bar {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  gap: 32rpx;
  padding: 24rpx;
  background: #fff;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);

  .add-block-btn {
    display: flex;
    align-items: center;
    gap: 12rpx;
    padding: 20rpx 40rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    border-radius: 40rpx;
    font-size: 28rpx;

    .btn-icon {
      font-size: 32rpx;
    }
  }
}

.bottom-style-panel {
  flex-shrink: 0;
  background: #fff;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.15);
  max-height: 50vh;
  display: flex;
  flex-direction: column;

  .style-panel-content {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;

    .panel-scroll-content {
      flex: 1;
      max-height: calc(50vh - 100rpx);
      padding: 0 32rpx 24rpx;
      box-sizing: border-box;
    }

    .panel-text-input {
      width: 100%;
      min-height: 120rpx;
      padding: 16rpx;
      background: #f8f9fa;
      border-radius: 8rpx;
      font-size: 28rpx;
      line-height: 1.6;
      margin-bottom: 20rpx;
      border: 2rpx solid #e0e0e0;

      &:focus {
        background: #fff;
        border-color: #1890ff;
      }
    }

    .image-actions-bar {
      display: flex;
      gap: 16rpx;
      margin-bottom: 20rpx;

      .action-btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8rpx;
        padding: 20rpx;
        background: #f0f7ff;
        border: 2rpx solid #1890ff;
        border-radius: 8rpx;
        color: #1890ff;
        font-size: 26rpx;
        transition: all 0.3s;

        .action-icon {
          font-size: 32rpx;
        }

        &:active {
          background: #1890ff;
          color: #fff;
        }
      }
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24rpx 32rpx 16rpx;
      flex-shrink: 0;
      background: #fff;

      .panel-title {
        font-size: 28rpx;
        font-weight: bold;
        color: #333;
      }

      .panel-close {
        width: 56rpx;
        height: 56rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f0f0f0;
        border-radius: 50%;
        font-size: 48rpx;
        color: #666;
        line-height: 1;
        transition: all 0.3s;

        &:active {
          background: #e0e0e0;
          transform: scale(0.95);
        }
      }
    }
  }
}

// 边框样式栏
.border-style-bar,
.align-style-bar,
.markdown-toggle-bar {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 16rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid #eee;

  .style-label {
    font-size: 24rpx;
    color: #666;
    margin-right: 8rpx;
  }

  .border-btn {
    min-width: 56rpx;
    font-size: 24rpx;

    &.active {
      background: #1890ff;
      color: #fff;
    }
  }
}

.footer-actions {
  flex-shrink: 0;
  display: flex;
  padding: 20rpx 32rpx;
  background: #fff;
  gap: 24rpx;
  padding-bottom: calc(32rpx + env(safe-area-inset-bottom));

  .footer-btn {
    flex: 1;
    height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 40rpx;
    font-size: 28rpx;

    &.preview,
    &.edit {
      background: #f0f0f0;
      color: #333;
    }

    &.save {
      background: #1890ff;
      color: #fff;
    }

    &.share {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
    }

    &.export {
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      color: #fff;
    }
  }
}

// 隐藏的导出Canvas
.export-canvas {
  position: fixed;
  left: -9999px;
  top: -9999px;
  opacity: 0;
  pointer-events: none;
  z-index: -1;
}

.color-picker-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;

  .color-picker-content {
    width: 600rpx;
    background: #fff;
    border-radius: 24rpx;
    padding: 32rpx;

    .color-picker-title {
      font-size: 32rpx;
      font-weight: bold;
      text-align: center;
      margin-bottom: 32rpx;
    }

    .color-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24rpx;

      .color-item {
        aspect-ratio: 1;
        border-radius: 12rpx;
        border: 2rpx solid #eee;
      }
    }
  }
}

.file-picker-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;

  .file-picker-content {
    width: 90%;
    max-width: 700rpx;
    height: 80vh;
    background: #fff;
    border-radius: 24rpx;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .file-picker-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 32rpx;
      border-bottom: 1rpx solid #eee;

      .file-picker-title {
        font-size: 32rpx;
        font-weight: bold;
      }

      .file-picker-close {
        font-size: 48rpx;
        color: #999;
        line-height: 1;
      }
    }

    .file-tab-content {
      flex: 1;
      overflow: hidden;

      .loading-files,
      .empty-files {
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 16rpx;
        color: #999;
        font-size: 28rpx;

        .loading-icon,
        .empty-icon {
          font-size: 80rpx;
        }
      }

      .file-list {
        height: 100%;
        padding: 16rpx;

        .file-item {
          display: flex;
          align-items: center;
          padding: 20rpx;
          margin-bottom: 16rpx;
          background: #fff;
          border: 2rpx solid #eee;
          border-radius: 12rpx;
          transition: all 0.3s;
          position: relative;

          &:active {
            background: #f0f7ff;
            border-color: #1890ff;
          }

          .file-preview {
            width: 120rpx;
            height: 120rpx;
            margin-right: 20rpx;
            border-radius: 8rpx;
            overflow: hidden;
            background: #f5f5f5;

            .file-thumb {
              width: 100%;
              height: 100%;
            }
          }

          .file-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 12rpx;
            min-width: 0;

            .file-name {
              font-size: 28rpx;
              font-weight: 500;
              color: #333;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            .file-meta {
              display: flex;
              gap: 16rpx;

              .file-size {
                font-size: 24rpx;
                color: #999;
              }

              .file-date {
                font-size: 24rpx;
                color: #1890ff;
              }
            }
          }

          .file-select-icon {
            width: 48rpx;
            height: 48rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32rpx;
            color: #1890ff;
            opacity: 0;
            transition: opacity 0.3s;
          }

          &:active .file-select-icon {
            opacity: 1;
          }
        }
      }
    }
  }
}

// 链接样式面板
.link-input-group {
  margin-bottom: 20rpx;

  &.half {
    flex: 1;
  }

  .input-label {
    font-size: 26rpx;
    color: #666;
    margin-bottom: 12rpx;
  }

  .link-input {
    width: 100%;
    padding: 20rpx;
    background: #f8f9fa;
    border: 2rpx solid #e0e0e0;
    border-radius: 8rpx;
    font-size: 28rpx;

    &:focus {
      background: #fff;
      border-color: #1890ff;
    }
  }
}

.link-input-row {
  display: flex;
  gap: 20rpx;
}

.link-type-selector {
  margin-bottom: 20rpx;

  .input-label {
    font-size: 26rpx;
    color: #666;
    margin-bottom: 12rpx;
  }

  .type-btns {
    display: flex;
    gap: 20rpx;

    .type-btn {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8rpx;
      padding: 24rpx;
      background: #f8f9fa;
      border: 2rpx solid #e0e0e0;
      border-radius: 12rpx;
      font-size: 26rpx;
      color: #666;
      transition: all 0.2s;

      .type-icon {
        font-size: 40rpx;
      }

      &.active {
        background: #e6f7ff;
        border-color: #1890ff;
        color: #1890ff;
      }
    }
  }
}

.nav-tip {
  padding: 16rpx;
  background: #fffbe6;
  border-radius: 8rpx;
  margin-top: 12rpx;

  text {
    font-size: 24rpx;
    color: #faad14;
  }
}

.link-style-bar {
  display: flex;
  justify-content: flex-end;
  margin-top: 20rpx;
}

// 链接设置区域样式
.link-settings-section {
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 2rpx solid #f0f0f0;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;

    .section-title {
      font-size: 26rpx;
      color: #666;
    }

    .link-toggle {
      padding: 8rpx 20rpx;
      font-size: 24rpx;
      border-radius: 20rpx;
      background: #f5f5f5;
      color: #999;
      transition: all 0.2s;

      &.active {
        background: #e6f7ff;
        color: #1890ff;
      }
    }
  }

  .link-settings-content {
    margin-top: 16rpx;
  }
}

.link-type-selector.compact {
  display: flex;
  gap: 16rpx;
  margin-bottom: 16rpx;

  .type-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    padding: 16rpx;
    background: #f8f9fa;
    border: 2rpx solid #e0e0e0;
    border-radius: 8rpx;
    font-size: 24rpx;
    color: #666;
    transition: all 0.2s;

    .type-icon {
      font-size: 28rpx;
    }

    &.active {
      background: #e6f7ff;
      border-color: #1890ff;
      color: #1890ff;
    }
  }
}

// 地图选点按钮样式
.location-picker-btn {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx 28rpx;
  margin-bottom: 20rpx;
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  border-radius: 12rpx;
  color: #fff;
  transition: all 0.2s;

  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }

  .picker-icon {
    font-size: 36rpx;
  }

  .picker-text {
    flex: 1;
    font-size: 28rpx;
    font-weight: 500;
  }

  .picker-arrow {
    font-size: 32rpx;
    font-weight: bold;
  }
}

// 内部链接相关样式
.internal-link-section {
  .scene-picker-btn,
  .session-picker-btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20rpx;
    background: #f8f9fa;
    border: 2rpx solid #e0e0e0;
    border-radius: 8rpx;
    font-size: 28rpx;
    color: #333;
    
    .placeholder {
      color: #999;
    }
    
    .picker-arrow {
      color: #999;
      font-size: 28rpx;
    }
  }
  
  .chat-session-picker {
    margin-top: 16rpx;
  }
}

// 创作助手选择弹窗
.chat-session-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  
  .chat-session-content {
    width: 100%;
    max-height: 70vh;
    background: #fff;
    border-radius: 24rpx 24rpx 0 0;
    display: flex;
    flex-direction: column;
    
    .chat-session-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 32rpx;
      border-bottom: 2rpx solid #f0f0f0;
      
      .chat-session-title {
        font-size: 32rpx;
        font-weight: 600;
        color: #333;
      }
      
      .chat-session-close {
        font-size: 40rpx;
        color: #999;
        padding: 8rpx;
      }
    }
    
    .loading-sessions,
    .empty-sessions {
      height: 400rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16rpx;
      color: #999;
      font-size: 28rpx;
      
      .loading-icon,
      .empty-icon {
        font-size: 80rpx;
      }
    }
    
    .chat-session-list {
      flex: 1;
      max-height: 60vh;
      padding: 16rpx;
      
      .chat-session-item {
        display: flex;
        align-items: center;
        padding: 24rpx;
        margin-bottom: 16rpx;
        background: #f8f9fa;
        border-radius: 12rpx;
        transition: all 0.2s;
        
        &:active {
          background: #e6f7ff;
        }
        
        .session-icon {
          width: 72rpx;
          height: 72rpx;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32rpx;
          margin-right: 20rpx;
        }
        
        .session-info {
          flex: 1;
          min-width: 0;
          
          .session-title {
            font-size: 28rpx;
            font-weight: 500;
            color: #333;
            display: block;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          
          .session-meta {
            font-size: 24rpx;
            color: #999;
            margin-top: 8rpx;
          }
        }
        
        .session-select-icon {
          font-size: 32rpx;
          color: #999;
        }
      }
    }
  }
}
</style>
