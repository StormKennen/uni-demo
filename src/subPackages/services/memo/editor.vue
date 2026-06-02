<template>
  <view class="editor-page">
    <!-- 导航栏 -->
    <nav-bar always-title title="编辑备忘录" custom-class="light"
      :custom-style="{ backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }">
      <template #right>
        <view class="nav-actions">
          <view class="nav-action-btn" :class="{ disabled: !canUndo }" @click="undo">
            <text>↶</text>
          </view>
          <view class="nav-action-btn" :class="{ disabled: !canRedo }" @click="redo">
            <text>↷</text>
          </view>
          <view class="nav-action-btn" @click="saveAndGoToDetail" v-if="memoId">
            <text>👁️</text>
          </view>
        </view>
      </template>
    </nav-bar>

    <!-- 可滚动内容区域 -->
    <scroll-view class="scrollable-content" scroll-y>
      <!-- 备忘录名称和设置按钮 -->
      <view class="memo-info-section">
        <view class="memo-header-row">
          <input class="memo-name-input" v-model="memoName" placeholder="请输入备忘录名称" :maxlength="100" />
          <view class="settings-btn" @click="openConfigPanel">
            <text class="settings-icon">⚙️</text>
          </view>
        </view>
        <!-- 标签预览（只读） -->
        <view class="tags-preview" v-if="tags.length > 0">
          <view v-for="(tag, index) in tags" :key="index" class="tag-preview-item">
            <text class="tag-text">{{ tag }}</text>
          </view>
        </view>
      </view>

      <!-- 内容区域 -->
      <view class="content-section">

        <!-- 内容块列表 -->
        <view
          v-for="(block, blockIndex) in pageData.content"
          :key="blockIndex"
          class="content-block"
          :class="{ 'is-locked': block?.style?.locked === true }"
        >
          <!-- 锁定徽章（右上角，仅锁定块显示） -->
          <view v-if="block?.style?.locked === true" class="locked-badge" @click.stop="onLockedBadgeClick(blockIndex)">
            <text class="locked-icon">🔒</text>
            <text class="locked-text">已锁定</text>
          </view>
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
            <view class="block-header">
              <!-- <text class="block-type-label">{{ blockIndex === 0 ? '📌 标题块' : '📝 文本块' }}</text> -->
              <!-- <text class="block-type-label">📝 文本块</text> -->
              <text class="anchor-id-badge" @click.stop="copyAnchor(blockIndex + 1)">
                <text class="anchor-tag">文本容器#L{{ blockIndex + 1 }}</text>
                <!-- <text class="copy-hint">点击复制</text> -->
              </text>
              <view class="block-actions">
                <view class="action-btn" v-if="blockIndex > 0" @click.stop="moveBlock(blockIndex, -1)">↑</view>
                <view class="action-btn" @click.stop="moveBlock(blockIndex, 1)">↓</view>
                <picker
                  mode="selector"
                  :range="getMovePositions(blockIndex)"
                  range-key="label"
                  @change="onMoveBlockPick(blockIndex, Number($event.detail.value))"
                  @click.stop
                >
                  <view class="action-btn" @click.stop>≡</view>
                </picker>
                <view class="action-btn style-btn" @click.stop="openBlockStylePanel(blockIndex)">⚙️</view>
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
            <view class="block-header">
              <!-- <text class="block-type-label">🖼️ 图片块</text> -->
              <text class="anchor-id-badge" @click.stop="copyAnchor(blockIndex + 1)">
                <text class="anchor-tag">图片容器#L{{ blockIndex + 1 }}</text>
                <!-- <text class="copy-hint">点击复制</text> -->
              </text>
              <view class="block-actions">
                <view class="action-btn" @click.stop="moveBlock(blockIndex, -1)">↑</view>
                <view class="action-btn" @click.stop="moveBlock(blockIndex, 1)">↓</view>
                <picker
                  mode="selector"
                  :range="getMovePositions(blockIndex)"
                  range-key="label"
                  @change="onMoveBlockPick(blockIndex, Number($event.detail.value))"
                  @click.stop
                >
                  <view class="action-btn" @click.stop>≡</view>
                </picker>
                <view class="action-btn" @click.stop="openBlockStylePanel(blockIndex)">⚙️</view>
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

          <!-- 路径块 -->
          <view v-if="block.type === 'route'" class="route-block" :style="getBlockBorderStyle(block)">
            <view class="block-header">
              <text class="anchor-id-badge" @click.stop="copyAnchor(blockIndex + 1)">
                <text class="anchor-tag">行程路径#L{{ blockIndex + 1 }}</text>
              </text>
              <view class="block-actions">
                <view class="action-btn" @click.stop="moveBlock(blockIndex, -1)">↑</view>
                <view class="action-btn" @click.stop="moveBlock(blockIndex, 1)">↓</view>
                <picker
                  mode="selector"
                  :range="getMovePositions(blockIndex)"
                  range-key="label"
                  @change="onMoveBlockPick(blockIndex, Number($event.detail.value))"
                  @click.stop
                >
                  <view class="action-btn" @click.stop>≡</view>
                </picker>
                <view class="action-btn style-btn" @click.stop="openBlockStylePanel(blockIndex)">⚙️</view>
                <view class="action-btn delete" @click.stop="deleteBlock(blockIndex)">×</view>
              </view>
            </view>

            <view class="route-edit-container">
              <!-- 路径编辑工具栏 -->
              <view class="route-toolbar">
                <view class="route-toolbar-btn" @click="showJsonImportModal(blockIndex)">
                  <text class="toolbar-icon">📋</text>
                  <text class="toolbar-text">导入 JSON</text>
                </view>
              </view>

              <view v-for="(node, nodeIndex) in (block as RouteBlock).content" :key="nodeIndex"
                class="route-node-editor">
                <!-- 插入节点按钮（非第一个节点前显示） -->
                <view v-if="nodeIndex > 0" class="insert-node-btn" @click="insertRouteNode(blockIndex, nodeIndex)">
                  <text class="insert-icon">+</text>
                  <text class="insert-text">插入节点</text>
                </view>

                <view class="node-content" :class="{ 'is-end': node.isEnd, 'is-transfer': node.type === 'transfer' }">
                  <view class="node-header">
                    <text class="node-index">{{ nodeIndex + 1 }}</text>
                    <text class="node-type-label">{{ node.isEnd ? '终点' : (node.type === 'transfer' ? '换乘站' : '途经站')
                      }}</text>
                    <!-- 删除按钮（终点不可删除，且至少保留2个节点） -->
                    <view v-if="!node.isEnd && (block as RouteBlock).content.length > 2" class="node-delete-btn"
                      @click="deleteRouteNode(blockIndex, nodeIndex)">×</view>
                  </view>

                  <!-- 站点名称（所有节点都有） -->
                  <view class="node-input-group">
                    <text class="input-label">站点名称</text>
                    <input class="node-input" v-model="node.name" placeholder="请输入站点名称" :maxlength="50" />
                  </view>

                  <!-- 非终点节点的额外字段 -->
                  <template v-if="!node.isEnd">
                    <view class="node-input-row">
                      <view class="node-input-group half">
                        <text class="input-label">耗时</text>
                        <input class="node-input" v-model="node.time" placeholder="如 1h" :maxlength="20" />
                      </view>
                      <view class="node-input-group half">
                        <text class="input-label">交通图标</text>
                        <input class="node-input" v-model="node.icon" placeholder="如 🚗" :maxlength="20" />
                      </view>
                    </view>

                    <view class="node-input-group">
                      <text class="input-label">描述</text>
                      <input class="node-input" v-model="node.desc" placeholder="如 接机、换乘等" :maxlength="100" />
                    </view>

                    <view class="node-switch-row">
                      <text class="switch-label">换乘站点</text>
                      <switch :checked="node.type === 'transfer'" @change="toggleRouteNodeType(blockIndex, nodeIndex)"
                        color="#667eea" />
                    </view>
                  </template>
                </view>
              </view>

              <!-- 在终点前添加节点 -->
              <view class="add-route-node-btn" @click="addRouteNodeBeforeEnd(blockIndex)">
                <text class="add-icon">+</text>
                <text class="add-text">添加途经站</text>
              </view>
            </view>
          </view>

          <!-- 附件块 -->
          <view v-if="block.type === 'attachment'" class="attachment-block" :style="getBlockBorderStyle(block)">
            <view class="block-header">
              <text class="anchor-id-badge">
                <text class="anchor-tag">附件容器#L{{ blockIndex + 1 }}</text>
              </text>
              <view class="block-actions">
                <view class="action-btn" @click.stop="moveBlock(blockIndex, -1)">↑</view>
                <view class="action-btn" @click.stop="moveBlock(blockIndex, 1)">↓</view>
                <picker
                  mode="selector"
                  :range="getMovePositions(blockIndex)"
                  range-key="label"
                  @change="onMoveBlockPick(blockIndex, Number($event.detail.value))"
                  @click.stop
                >
                  <view class="action-btn" @click.stop>≡</view>
                </picker>
                <view class="action-btn style-btn" @click.stop="openBlockStylePanel(blockIndex)">⚙️</view>
                <view class="action-btn delete" @click.stop="deleteBlock(blockIndex)">×</view>
              </view>
            </view>

            <view v-for="(item, itemIndex) in (block as AttachmentBlock).children" :key="itemIndex"
              class="attachment-item">
              <view class="attachment-card">
                <view class="attachment-icon">📄</view>
                <view class="attachment-info">
                  <input class="attachment-title-input" v-model="item.title" placeholder="附件标题" :maxlength="50" />
                  <input class="attachment-url-input" v-model="item.url" placeholder="粘贴腾讯文档链接" :maxlength="500"
                    @blur="onAttachmentUrlBlur(item)" />
                </view>
                <view class="attachment-delete" @click="deleteAttachmentItem(blockIndex, itemIndex)">×</view>
              </view>
            </view>

            <view class="add-item-btn" @click="addAttachmentItem(blockIndex)">
              <text class="add-icon">+</text>
              <text class="add-text">添加附件</text>
            </view>
          </view>

          <!-- 多媒体块 -->
          <view v-if="block.type === 'media'" class="media-block" :style="getBlockBorderStyle(block)">
            <view class="block-header">
              <text class="anchor-tag">多媒体容器#L{{ blockIndex + 1 }}</text>
              <view class="block-actions">
                <view class="action-btn" @click.stop="moveBlock(blockIndex, -1)">↑</view>
                <view class="action-btn" @click.stop="moveBlock(blockIndex, 1)">↓</view>
                <picker
                  mode="selector"
                  :range="getMovePositions(blockIndex)"
                  range-key="label"
                  @change="onMoveBlockPick(blockIndex, Number($event.detail.value))"
                  @click.stop
                >
                  <view class="action-btn" @click.stop>≡</view>
                </picker>
                <view class="action-btn style-btn" @click.stop="openBlockStylePanel(blockIndex)">⚙️</view>
                <view class="action-btn delete" @click.stop="deleteBlock(blockIndex)">×</view>
              </view>
            </view>

            <view v-for="(item, itemIndex) in (block as MediaBlock).children" :key="itemIndex" class="media-card">
              <view class="media-info">
                <input class="media-title-input" v-model="item.title" placeholder="视频/音频名称" :maxlength="50" />
                <view class="media-status-row">
                  <text class="media-url-preview" v-if="item.url">{{ item.url.substring(0, 40) }}{{ item.url.length > 40
                    ?
                    '...' : '' }}</text>
                  <text class="media-url-preview empty" v-else>未设置媒体源</text>
                  <view class="media-props-tags">
                    <text v-if="item.autoplay" class="prop-tag">自动播放</text>
                    <text v-if="item.loop" class="prop-tag">循环</text>
                    <text v-if="item.controls !== false" class="prop-tag">控制条</text>
                  </view>
                </view>
              </view>
              <video v-if="item.url && item.url.includes('.mp4')" :src="item.url" class="mini-preview" controls></video>
              <view v-else-if="item.url && (item.url.includes('.mp3') || item.url.includes('.m4a'))"
                class="audio-placeholder">
                <text class="audio-icon">🎵</text>
                <text class="audio-text">音频文件</text>
              </view>
              <view class="media-card-actions">
                <view class="media-settings-btn" @click="openMediaItemSettings(blockIndex, itemIndex)">⚙️</view>
                <view class="media-delete" @click="deleteMediaItem(blockIndex, itemIndex)">×</view>
              </view>
            </view>

            <view class="add-item-btn" @click="addMediaItem(blockIndex)">
              <text class="add-icon">+</text>
              <text class="add-text">添加媒体</text>
            </view>
          </view>

        </view>
      </view>
    </scroll-view>

    <!-- FAB 悬浮按钮（仅编辑模式，控制面板显示时隐藏） -->
    <view class="fab-container" v-if="!selectedItem && !isAnyPanelOpen">
      <!-- 遮罩层 -->
      <view class="fab-overlay" v-if="fabExpanded" @click="fabExpanded = false"></view>
      <!-- 子按钮 -->
      <view class="fab-actions" :class="{ expanded: fabExpanded }">
        <view class="fab-action-btn" @click="addTextBlockAndClose">
          <!-- <text class="fab-action-icon">📝</text> -->
          <text class="fab-action-text">文字</text>
        </view>
        <view class="fab-action-btn" @click="addImageBlockAndClose">
          <!-- <text class="fab-action-icon">🖼️</text> -->
          <text class="fab-action-text">图片</text>
        </view>
        <view class="fab-action-btn route" @click="addRouteBlockAndClose">
          <!-- <text class="fab-action-icon">🗺️</text> -->
          <text class="fab-action-text">路径</text>
        </view>
        <view class="fab-action-btn attachment" @click="addAttachmentBlockAndClose">
          <!-- <text class="fab-action-icon">📎</text> -->
          <text class="fab-action-text">附件</text>
        </view>
        <view class="fab-action-btn media" @click="addMediaBlockAndClose">
          <!-- <text class="fab-action-icon">🎬</text> -->
          <text class="fab-action-text">视频</text>
        </view>
      </view>
      <!-- 主按钮 -->
      <view class="fab-main-btn" :class="{ active: fabExpanded }" @click="fabExpanded = !fabExpanded">
        <text class="fab-main-icon">{{ fabExpanded ? '×' : '+' }}</text>
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
          <view v-for="session in chatSessions" :key="session.id" class="chat-session-item"
            @click="selectChatSession(session)">
            <view class="session-icon">📄</view>
            <view class="session-info">
              <text class="session-title">{{ session.title || '新建草稿' }}</text>
              <text class="session-meta">{{ session.messageCount || 0 }} 条素材 · {{ session.updatedAt || session.createdAt
                }}</text>
            </view>
            <view class="session-select-icon">›</view>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 备忘录选择弹窗 -->
    <view class="chat-session-modal" v-if="memoPickerVisible" @click="memoPickerVisible = false">
      <view class="chat-session-content" @click.stop>
        <view class="chat-session-header">
          <text class="chat-session-title">选择备忘录</text>
          <text class="chat-session-close" @click="memoPickerVisible = false">×</text>
        </view>
        <view v-if="loadingMemosForPicker" class="loading-sessions">
          <text class="loading-icon">⏳</text>
          <text>加载中...</text>
        </view>
        <view v-else-if="memoListForPicker.length === 0" class="empty-sessions">
          <text class="empty-icon">📋</text>
          <text>暂无备忘录</text>
        </view>
        <scroll-view v-else scroll-y class="chat-session-list">
          <view v-for="memo in memoListForPicker" :key="memo.id" class="chat-session-item" @click="selectMemo(memo)">
            <view class="session-icon">📋</view>
            <view class="session-info">
              <text class="session-title">{{ memo.name || '未命名' }}</text>
              <text class="session-meta">{{ memo.updatedAt ? formatMemoDate(memo.updatedAt) : '' }}</text>
            </view>
            <view class="session-select-icon">›</view>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- JSON 导入弹窗 -->
    <view class="json-import-modal" v-if="jsonImportVisible" @click="jsonImportVisible = false">
      <view class="json-import-content" @click.stop>
        <view class="json-import-header">
          <text class="json-import-title">导入 JSON 路径数据</text>
          <text class="json-import-close" @click="jsonImportVisible = false">×</text>
        </view>
        <view class="json-import-body">
          <textarea class="json-textarea" v-model="jsonImportText"
            placeholder="请粘贴 JSON 数组，如：[{name:机场,time:1h},{name:酒店,isEnd:true}]" :maxlength="100000" />
          <view class="json-import-tip">
            <text>提示：最后一个节点会自动设置为终点</text>
          </view>
        </view>
        <view class="json-import-footer">
          <view class="json-btn cancel" @click="jsonImportVisible = false">取消</view>
          <view class="json-btn confirm" @click="confirmJsonImport">确认导入</view>
        </view>
      </view>
    </view>

    <!-- 选项控制面板（重构后由组件统一管理草稿+确认/取消） -->
    <OptionsControlPanel
      v-model="configPanelVisible"
      :settings="settings"
      :tags="tags"
      :morandi-colors="morandiColors"
      :font-size-options="fontSizeOptions"
      @save="onOptionsPanelSave"
      @upload-bg="uploadBackgroundImage"
    />

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
          :style="getTextStyle(getSelectedItem().style)" auto-height :maxlength="100000" />
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

        <!-- 弹窗模式设置 -->
        <view class="popup-mode-section">
          <view class="section-header">
            <view class="section-title">💬 弹窗模式</view>
            <switch :checked="getSelectedItem()?.interactionType === 'popup'" @change="togglePopupMode"
              color="#667eea" />
          </view>
          <view class="popup-hint" v-if="getSelectedItem()?.interactionType === 'popup'">
            <text>点击此文本将弹出完整内容，而非跳转链接</text>
          </view>
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
            <!-- 链接类型选择 - 改为下拉选择器 -->
            <view class="link-input-group">
              <view class="input-label">链接类型</view>
              <picker :value="linkTypeIndex" :range="linkTypes" range-key="label" @change="onLinkTypeChange">
                <view class="link-type-picker-btn">
                  <text>{{ linkTypeLabel }}</text>
                  <text class="picker-arrow">›</text>
                </view>
              </picker>
            </view>

            <!-- 链接图标自定义 -->
            <view class="link-input-group">
              <view class="input-label">链接图标</view>
              <input class="link-input link-icon-input" v-model="getSelectedItem().linkIcon" placeholder="默认 🔗，可自定义或清空"
                :maxlength="10" />
              <view class="icon-hint">留空则不显示图标</view>
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
                <picker :value="internalLinkSceneIndex" :range="internalLinkScenes" range-key="label"
                  @change="onInternalSceneChange">
                  <view class="scene-picker-btn">
                    <text>{{ internalLinkSceneLabel }}</text>
                    <text class="picker-arrow">›</text>
                  </view>
                </picker>
              </view>

              <!-- 写作素材选择：笔记 -->
              <view v-if="getSelectedItem()?.linkInfo?.internalScene === 'chat'" class="chat-session-picker">
                <view class="input-label">选择笔记</view>
                <view class="session-picker-btn" @click="showChatSessionPicker">
                  <text v-if="getSelectedItem()?.linkInfo?.internalTitle">{{ getSelectedItem()?.linkInfo?.internalTitle
                    }}</text>
                  <text v-else class="placeholder">点击选择笔记</text>
                  <text class="picker-arrow">›</text>
                </view>
              </view>
              <!-- 备忘录选择 -->
              <view v-if="getSelectedItem()?.linkInfo?.internalScene === 'memo'" class="chat-session-picker">
                <view class="input-label">选择备忘录</view>
                <view class="session-picker-btn" @click="showMemoPicker">
                  <text v-if="getSelectedItem()?.linkInfo?.internalTitle">{{ getSelectedItem()?.linkInfo?.internalTitle
                    }}</text>
                  <text v-else class="placeholder">点击选择备忘录</text>
                  <text class="picker-arrow">›</text>
                </view>
              </view>
            </view>

            <!-- 锚点输入 -->
            <view class="link-input-group" v-if="getSelectedItem()?.linkInfo?.linkType === 'anchor'">
              <view class="input-label">锚点ID（用于跳转定位）</view>
              <input class="link-input" v-model="getSelectedItem().linkInfo.anchorId"
                placeholder="请输入唯一的锚点ID，如 section-1" :maxlength="50" />
            </view>

            <!-- 内容弹窗目标锚点选择 -->
            <view class="link-input-group" v-if="getSelectedItem()?.linkInfo?.linkType === 'popup'">
              <view class="input-label">⚓ 目标锚点（弹窗内容来源）</view>
              <input class="link-input" v-model="getSelectedItem().linkInfo.targetAnchor" placeholder="输入目标容器的锚点ID，如 L2"
                :maxlength="50" />

              <!-- 锚点快速选择列表 -->
              <view class="anchor-suggestions" v-if="getAllAnchors.length > 0">
                <view class="suggestions-title">💡 可用锚点：</view>
                <view class="suggestions-list">
                  <view v-for="item in getAllAnchors" :key="item.anchor" class="suggestion-item" :class="{
                    'is-popup-target': item.isPopupTarget,
                    'is-selected': getSelectedItem()?.linkInfo?.targetAnchor === item.anchor
                  }" @click="getSelectedItem().linkInfo.targetAnchor = item.anchor">
                    <text class="anchor-id">{{ item.anchor }}</text>
                    <text class="anchor-type">{{ item.type }}</text>
                    <text v-if="item.isPopupTarget" class="popup-badge">弹窗源</text>
                  </view>
                </view>
              </view>
              <view class="anchor-tip" v-else>
                <text>暂无可用锚点，请先为其他容器设置锚点ID</text>
              </view>
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
            :range-key="'label'" @change="(e) => setImageSizeMode(selectedItem.blockIndex, selectedItem.itemIndex, e)">
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
            <input type="number" v-model="getSelectedItem().style.heightPercent" class="size-input" placeholder="50" />
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


  <!-- 容器控制面板（块级样式，重构后由组件统一管理草稿+确认/取消） -->
  <BlockStyleControlPanel
    v-model="blockStylePanelVisible"
    :block="editingBlockIndex !== null ? pageData.content[editingBlockIndex] : null"
    :morandi-colors="morandiColors"
    @save="onBlockStylePanelSave"
  />

  <!-- 媒体项设置面板（重构后由组件统一管理草稿+确认/取消） -->
  <MediaItemSettingsPanel
    v-model="mediaSettingsPanelVisible"
    :media-item="getEditingMediaItem()"
    @save="onMediaItemPanelSave"
  />

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
import { postMemos, getMemosMemoId, patchMemosMemoId, getMemos } from '@/services/apifox/NODEJSDEMO/MEMOS/apifox';
import { getGeminiSessions } from '@/services/apifox/NODEJSDEMO/GEMINI/apifox';

import { ref, reactive, computed, watch, onMounted } from 'vue'
import { onLoad, onReady, onShareAppMessage } from '@dcloudio/uni-app'
import NavBar from '@/components/nav-bar.vue'
import { getFiles } from '@/services/apifox/NODEJSDEMO/FILES/apifox'
import type { getFilesResItems } from '@/services/apifox/NODEJSDEMO/FILES/interface'
import OptionsControlPanel from './components/OptionsControlPanel.vue'
import BlockStyleControlPanel from './components/BlockStyleControlPanel.vue'
import MediaItemSettingsPanel from './components/MediaItemSettingsPanel.vue'

// 类型定义
interface TextStyle {
  bold?: boolean
  italic?: boolean
  underline?: boolean
  lineThrough?: boolean
  fontSize?: number
  color?: string
}

// 块级边框样式
interface BlockBorderSide {
  width?: number
  color?: string
}

// 行样式（边框、对齐等）- 扩展为完整块级样式
interface BlockStyle {
  // 旧版简单边框开关（向后兼容）
  borderTop?: boolean
  borderBottom?: boolean
  borderLeft?: boolean
  borderRight?: boolean
  textAlign?: 'left' | 'center' | 'right'
  // 新版块级独立样式
  padding?: {
    top?: number
    bottom?: number
    left?: number
    right?: number
  }
  border?: {
    top?: BlockBorderSide
    bottom?: BlockBorderSide
    left?: BlockBorderSide
    right?: BlockBorderSide
  }
  backgroundColor?: string
  borderRadius?: number
  enable3DMode?: boolean  // 3D悬浮模式
  enablePokerCard?: boolean  // 扑克牌翻转效果
  locked?: boolean  // 块锁定：锁定后不可被拖动/删除/移动
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
  interactionType?: 'normal' | 'popup'  // 交互类型：普通或弹窗
  linkIcon?: string  // 自定义链接图标
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
  anchor?: string // 锚点ID，用于隐藏-触发系统
}

interface ImageBlock {
  type: 'image'
  children: ImageItem[]
  style?: BlockStyle
  anchor?: string // 锚点ID，用于隐藏-触发系统
}

// 路径节点
interface RouteNode {
  name: string
  time?: string
  icon?: string
  desc?: string
  type?: 'normal' | 'transfer'
  isEnd?: boolean
}

// 路径块
interface RouteBlock {
  type: 'route'
  content: RouteNode[]
  style?: BlockStyle
  anchor?: string // 锚点ID，用于隐藏-触发系统
}

// 附件块（腾讯文档等）
interface AttachmentItem {
  title: string
  url: string
  appId?: string  // 小程序 AppID，如腾讯文档: wxd45c635d754dbf59
  path?: string   // 小程序路径
  icon?: string   // 图标
}

interface AttachmentBlock {
  type: 'attachment'
  children: AttachmentItem[]
  style?: BlockStyle
  anchor?: string // 锚点ID，用于隐藏-触发系统
}

// 多媒体项（视频/音频）
interface MediaItem {
  title: string
  url: string
  autoplay?: boolean  // 自动播放
  controls?: boolean  // 显示控制条
  loop?: boolean      // 循环播放
}

interface MediaBlock {
  type: 'media'
  children: MediaItem[]
  style?: BlockStyle
  anchor?: string // 锚点ID，用于隐藏-触发系统
}

// 链接信息
interface LinkInfo {
  label: string // 显示的文本
  linkType: 'url' | 'navigation' | 'internal' | 'anchor' | 'popup' // 链接类型：超链接、导航、内部链接、锚点或弹窗
  url?: string // 超链接地址
  latitude?: number // 导航纬度
  longitude?: number // 导航经度
  address?: string // 导航地址名称
  internalScene?: 'chat' | 'memo' // 内部链接场景：笔记、备忘录
  internalId?: string // 内部链接目标ID
  internalTitle?: string // 内部链接目标标题
  internalPath?: string // 内部链接路径
  anchorId?: string // 锚点ID
  targetAnchor?: string // 目标锚点ID（用于内容弹窗触发）
  popupContent?: string // 弹窗内容
  popupIsMarkdown?: boolean // 弹窗内容是否为Markdown格式
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
  content: (TextBlock | ImageBlock | RouteBlock | AttachmentBlock | MediaBlock)[]
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

// 锚点自动生成算法
const generateNextAnchor = (): string => {
  // 查找所有现有锚点中 L+数字 格式的最大值
  const anchorPattern = /^L(\d+)$/
  let maxNumber = 0

  pageData.content.forEach(block => {
    if (block.anchor) {
      const match = block.anchor.match(anchorPattern)
      if (match) {
        const num = parseInt(match[1], 10)
        if (num > maxNumber) {
          maxNumber = num
        }
      }
    }
  })

  // 返回下一个锚点ID
  return `L${maxNumber + 1}`
}

// 获取所有现有锚点列表（用于联想提示）
const getAllAnchors = computed(() => {
  return pageData.content
    .filter(block => block.anchor)
    .map(block => ({
      anchor: block.anchor!,
      type: block.type,
      isPopupTarget: isAnchorReferencedAsPopup(block.anchor!)
    }))
})

// 判断锚点是否被引用为弹窗目标
const isAnchorReferencedAsPopup = (anchor: string): boolean => {
  for (const block of pageData.content) {
    if (block.type === 'text') {
      const textBlock = block as TextBlock
      for (const item of textBlock.children) {
        if (item.linkInfo?.linkType === 'popup' && item.linkInfo?.targetAnchor === anchor) {
          return true
        }
      }
    }
  }
  return false
}

// 获取所有被引用为弹窗目标的锚点集合
const popupTargetAnchors = computed(() => {
  const anchors = new Set<string>()
  pageData.content.forEach(block => {
    if (block.type === 'text') {
      const textBlock = block as TextBlock
      textBlock.children.forEach(item => {
        if (item.linkInfo?.linkType === 'popup' && item.linkInfo?.targetAnchor) {
          anchors.add(item.linkInfo.targetAnchor)
        }
      })
    }
  })
  return anchors
})

// 链接类型配置
const linkTypes = [
  { value: 'url', label: '🔗 外部链接' },
  { value: 'popup', label: '💬 内容弹窗' },
  { value: 'navigation', label: '📍 地图导航' },
  { value: 'internal', label: '📄 关联素材' },
  { value: 'anchor', label: '⚓ 锚点跳转' }
]

// 关联素材相关状态
const internalLinkScenes = [
  { value: 'chat', label: '笔记' },
  { value: 'memo', label: '备忘录' }
]
const chatSessionPickerVisible = ref(false)
const chatSessions = ref<ChatSession[]>([])
const loadingChatSessions = ref(false)

// 备忘录选择（内部链接类型为「备忘录」时使用）
interface MemoItem {
  id: string
  name: string
  updatedAt?: number
}
const memoPickerVisible = ref(false)
const memoListForPicker = ref<MemoItem[]>([])
const loadingMemosForPicker = ref(false)

// JSON 导入相关
const jsonImportVisible = ref(false)
const jsonImportText = ref('')
const jsonImportTargetBlock = ref<number | null>(null)

// FAB 悬浮按钮状态
const fabExpanded = ref(false)

// 设置面板状态
const settingsVisible = ref(false)
const configPanelVisible = ref(false)
const configPopup = ref()
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
  romanticEffects: {
    popupAnimation: 'zoom-in', // 'zoom-in' | 'slide-up'
    enableGlassBlur: true
  },
  typography: {
    fontSize: 'standard' as 'standard' | 'medium' | 'large',
    lineHeight: 1.6
  },
  layout: {
    contentWidth: 'full' as 'full' | 'narrow'
  },
  features: {
    showWatermark: false,
    enableComments: false
  },
  showBackToTop: true,
  hideNavActions: false,
  // 腾讯文档全局关联
  globalAttachment: {
    enabled: false,
    url: '',
    title: '查看原始文档'
  }
})

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
const fontSizeOptions = [
  { value: 'standard', label: '标准', size: '28rpx' },
  { value: 'medium', label: '中', size: '32rpx' },
  { value: 'large', label: '大', size: '36rpx' }
]

// 选中状态
const selectedItem = ref<{ blockIndex: number; itemIndex: number; type: 'text' | 'image' } | null>(null)

// 选中项目
const selectItem = (blockIndex: number, itemIndex: number, type: 'text' | 'image') => {
  selectedItem.value = { blockIndex, itemIndex, type }
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

// 内部链接场景选择器的当前索引与展示文案
const internalLinkSceneIndex = computed(() => {
  const item = getSelectedItem()
  if (!item?.linkInfo?.internalScene) return 0
  const idx = internalLinkScenes.findIndex((s) => s.value === item.linkInfo!.internalScene)
  return idx >= 0 ? idx : 0
})
const internalLinkSceneLabel = computed(() => {
  const item = getSelectedItem()
  if (!item?.linkInfo?.internalScene) return '请选择类型'
  const scene = internalLinkScenes.find((s) => s.value === item.linkInfo!.internalScene)
  return scene?.label ?? '请选择类型'
})

// 链接类型选择器的当前索引与展示文案
const linkTypeIndex = computed(() => {
  const item = getSelectedItem() as TextItem | null
  if (!item?.linkInfo?.linkType) return 0
  const idx = linkTypes.findIndex((t) => t.value === item.linkInfo!.linkType)
  return idx >= 0 ? idx : 0
})

const linkTypeLabel = computed(() => {
  const item = getSelectedItem() as TextItem | null
  if (!item?.linkInfo?.linkType) return '请选择类型'
  const type = linkTypes.find((t) => t.value === item.linkInfo!.linkType)
  return type?.label ?? '请选择类型'
})

// 链接类型变更处理
const onLinkTypeChange = (e: any) => {
  const item = getSelectedItem() as TextItem | null
  if (!item || !item.linkInfo) return
  const index = e.detail.value
  const selectedType = linkTypes[index]
  item.linkInfo.linkType = selectedType.value as any

  // 清理其他类型的数据
  if (selectedType.value !== 'url') item.linkInfo.url = undefined
  if (selectedType.value !== 'navigation') {
    item.linkInfo.latitude = undefined
    item.linkInfo.longitude = undefined
    item.linkInfo.address = undefined
  }
  if (selectedType.value !== 'internal') {
    item.linkInfo.internalScene = undefined
    item.linkInfo.internalId = undefined
    item.linkInfo.internalTitle = undefined
    item.linkInfo.internalPath = undefined
  }
  if (selectedType.value !== 'anchor') {
    item.linkInfo.anchorId = undefined
  }
  if (selectedType.value !== 'popup') {
    item.linkInfo.popupContent = undefined
    item.linkInfo.popupIsMarkdown = undefined
  }
}

// 块级样式设置面板状态
const blockStylePanelVisible = ref(false)
const editingBlockIndex = ref<number | null>(null)

// 计算属性：判断是否有任何面板打开
const isAnyPanelOpen = computed(() => {
  return configPanelVisible.value || 
         blockStylePanelVisible.value || 
         settingsVisible.value ||
         editingBlockIndex.value !== null
})
// 打开块级样式设置面板（重构后所有草稿状态由 BlockStyleControlPanel 组件管理）
const openBlockStylePanel = (blockIndex: number) => {
  editingBlockIndex.value = blockIndex
  blockStylePanelVisible.value = true
  selectedItem.value = null
}

// Canvas浪漫效果合成器
const generateRomanticPoster = async (mediaUrl: string, effectType: 'hearts' | 'light-streaks' | 'sparkles' = 'hearts') => {
  try {
    // 创建Canvas上下文
    const canvas = uni.createCanvasContext('romanticCanvas')

    // 设置画布尺寸
    const canvasWidth = 750
    const canvasHeight = 1334

    // 绘制背景渐变
    const gradient = canvas.createLinearGradient(0, 0, canvasWidth, canvasHeight)
    gradient.addColorStop(0, 'rgba(255, 107, 157, 0.1)')
    gradient.addColorStop(0.5, 'rgba(116, 185, 255, 0.05)')
    gradient.addColorStop(1, 'rgba(102, 126, 234, 0.1)')

    canvas.setFillStyle(gradient)
    canvas.fillRect(0, 0, canvasWidth, canvasHeight)

    // 绘制原始媒体内容
    if (mediaUrl) {
      canvas.drawImage(mediaUrl, 0, 0, canvasWidth, canvasHeight * 0.8)
    }

    // 绘制浪漫效果
    drawRomanticEffects(canvas, effectType, canvasWidth, canvasHeight)

    // 绘制水印
    drawWatermark(canvas, canvasWidth, canvasHeight)

    // 渲染Canvas
    canvas.draw(true, () => {
      // 导出合成图片
      uni.canvasToTempFilePath({
        canvasId: 'romanticCanvas',
        success: (res) => {
          uni.showToast({
            title: '浪漫海报生成成功',
            icon: 'success'
          })
        },
        fail: () => {
          uni.showToast({
            title: '生成失败',
            icon: 'error'
          })
        }
      })
    })
  } catch (error) {
    console.error('Canvas合成失败:', error)
  }
}

// 绘制浪漫效果
const drawRomanticEffects = (canvas: any, effectType: string, width: number, height: number) => {
  canvas.save()

  switch (effectType) {
    case 'hearts':
      // 绘制心形效果
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        const size = Math.random() * 30 + 10
        const opacity = Math.random() * 0.6 + 0.2

        canvas.globalAlpha = opacity
        canvas.setFillStyle('#ff6b9d')
        drawHeart(canvas, x, y, size)
      }
      break

    case 'light-streaks':
      // 绘制光线效果
      for (let i = 0; i < 8; i++) {
        const gradient = canvas.createRadialGradient(
          Math.random() * width,
          Math.random() * height,
          0,
          Math.random() * width,
          Math.random() * height,
          200
        )
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)')
        gradient.addColorStop(1, 'rgba(116, 185, 255, 0.1)')

        canvas.setFillStyle(gradient)
        canvas.fillRect(0, 0, width, height)
      }
      break

    case 'sparkles':
      // 绘制星光效果
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * width
        const y = Math.random() * height
        const size = Math.random() * 4 + 2

        canvas.setFillStyle('#74b9ff')
        canvas.globalAlpha = Math.random() * 0.8 + 0.2
        drawStar(canvas, x, y, size)
      }
      break
  }

  canvas.restore()
}

// 绘制心形
const drawHeart = (canvas: any, x: number, y: number, size: number) => {
  canvas.save()
  canvas.translate(x, y)
  canvas.scale(size / 20, size / 20)
  canvas.beginPath()
  canvas.moveTo(0, 0)
  canvas.bezierCurveTo(-10, -8, -10, -16, 0, -12)
  canvas.bezierCurveTo(10, -16, 10, -8, 0, 0)
  canvas.fill()
  canvas.restore()
}

// 绘制星形
const drawStar = (canvas: any, x: number, y: number, size: number) => {
  canvas.save()
  canvas.translate(x, y)
  canvas.beginPath()
  canvas.moveTo(0, -size)
  canvas.lineTo(size * 0.3, -size * 0.3)
  canvas.lineTo(size, 0)
  canvas.lineTo(size * 0.3, size * 0.3)
  canvas.lineTo(0, size)
  canvas.lineTo(-size * 0.3, size * 0.3)
  canvas.lineTo(-size, 0)
  canvas.lineTo(-size * 0.3, -size * 0.3)
  canvas.closePath()
  canvas.fill()
  canvas.restore()
}

// 绘制水印
const drawWatermark = (canvas: any, width: number, height: number) => {
  canvas.setFillStyle('rgba(102, 126, 234, 0.6)')
  canvas.setFontSize(24)
  canvas.setTextAlign('right')
  canvas.fillText('💫 Windsurf Romantic', width - 40, height - 40)
}

// 全屏配置面板控制（重构后由 OptionsControlPanel 组件管理草稿+保存）
const openConfigPanel = () => {
  configPanelVisible.value = true
}

const closeConfigPanel = () => {
  try { uni.vibrateShort() } catch (e) { /* 震动不可用，忽略 */ }
  configPanelVisible.value = false
}

// 选项面板保存：把组件返回的 draft 深合并回正式 settings + 替换 tags
const onOptionsPanelSave = (payload: { settings: any; tags: string[] }) => {
  const s = payload.settings || {}
  if (s.padding) Object.assign(settings.padding, s.padding)
  if (s.border) Object.assign(settings.border, s.border)
  if (s.appearance) Object.assign(settings.appearance, s.appearance)
  if (s.romanticEffects) Object.assign(settings.romanticEffects, s.romanticEffects)
  if (s.typography) Object.assign(settings.typography, s.typography)
  if (s.layout) Object.assign(settings.layout, s.layout)
  if (s.features) Object.assign(settings.features, s.features)
  if (s.globalAttachment) Object.assign(settings.globalAttachment, s.globalAttachment)
  if ('showBackToTop' in s) settings.showBackToTop = s.showBackToTop
  if ('hideNavActions' in s) settings.hideNavActions = s.hideNavActions
  // 替换 tags
  tags.value.splice(0, tags.value.length, ...(payload.tags || []))
}

// 容器面板保存：把组件返回的 style + business 写回 block
const onBlockStylePanelSave = (payload: { style: any; business: Record<string, any> }) => {
  if (editingBlockIndex.value === null) return
  const block = pageData.content[editingBlockIndex.value] as any
  if (!block) return
  block.style = payload.style
  if (block.type === 'text' && 'isMarkdown' in payload.business) {
    block.isMarkdown = payload.business.isMarkdown
  }
  if (block.type === 'route' && 'showTime' in payload.business) {
    block.showTime = payload.business.showTime
  }
  if (block.type === 'attachment' && 'appId' in payload.business) {
    block.appId = payload.business.appId
  }
}

// （以上 editingBlockStyle / saveBlockStyle / resetBlockStyle / popupContentEditor /
//  previewPopup / uploadImageToPopup / getEditingBlock* / toggleEditingBlock* /
//  setEditingBlockSetting 已随面板重构一同移除，现存逻辑全部走
//  BlockStyleControlPanel 组件内部的 useDraftPanel）

// 获取行样式（边框、对齐等，用于渲染）- 支持新版块级样式
const getBlockBorderStyle = (block: TextBlock | ImageBlock | RouteBlock | AttachmentBlock) => {
  const style = block.style || {}
  const result: Record<string, string> = {}

  // 新版块级样式优先
  if (style.padding) {
    result.paddingTop = (style.padding.top || 0) + 'rpx'
    result.paddingBottom = (style.padding.bottom || 0) + 'rpx'
    result.paddingLeft = (style.padding.left || 0) + 'rpx'
    result.paddingRight = (style.padding.right || 0) + 'rpx'
  }

  // 新版边框样式
  if (style.border) {
    if (style.border.top && style.border.top.width) {
      result.borderTop = style.border.top.width + 'rpx solid ' + (style.border.top.color || '#eeeeee')
    }
    if (style.border.bottom && style.border.bottom.width) {
      result.borderBottom = style.border.bottom.width + 'rpx solid ' + (style.border.bottom.color || '#eeeeee')
    }
    if (style.border.left && style.border.left.width) {
      result.borderLeft = style.border.left.width + 'rpx solid ' + (style.border.left.color || '#eeeeee')
    }
    if (style.border.right && style.border.right.width) {
      result.borderRight = style.border.right.width + 'rpx solid ' + (style.border.right.color || '#eeeeee')
    }
  } else {
    // 旧版简单边框开关（向后兼容）
    result.borderTop = style.borderTop ? '2rpx solid #333' : 'none'
    result.borderBottom = style.borderBottom ? '2rpx solid #333' : 'none'
    result.borderLeft = style.borderLeft ? '2rpx solid #333' : 'none'
    result.borderRight = style.borderRight ? '2rpx solid #333' : 'none'

    // 旧版有边框时默认 padding
    if (!style.padding && (style.borderTop || style.borderBottom || style.borderLeft || style.borderRight)) {
      result.padding = '16rpx'
    }
  }

  // 背景色
  if (style.backgroundColor) {
    result.backgroundColor = style.backgroundColor
  }

  // 圆角
  if (style.borderRadius) {
    result.borderRadius = style.borderRadius + 'rpx'
  }

  // 文本对齐
  result.textAlign = style.textAlign || 'left'

  return result
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

// 上传背景图片
const uploadBackgroundImage = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0]
      uni.showLoading({ title: '上传中...', mask: true })

      uni.uploadFile({
        url: String(import.meta.env.VITE_APP_BASE_URL || '') + '/upload/image',
        filePath: tempFilePath,
        name: 'file',
        header: {
          'Authorization': 'Bearer ' + uni.getStorageSync('token')
        },
        success: (uploadRes) => {
          uni.hideLoading()
          try {
            const data = JSON.parse(uploadRes.data)
            if (data.data && data.data.url) {
              settings.appearance.backgroundImage = data.data.url
              uni.showToast({ title: '上传成功', icon: 'success' })
            } else {
              uni.showToast({ title: '上传失败', icon: 'none' })
            }
          } catch (e) {
            uni.showToast({ title: '解析失败', icon: 'none' })
          }
        },
        fail: () => {
          uni.hideLoading()
          uni.showToast({ title: '上传失败', icon: 'none' })
        }
      })
    }
  })
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
    anchor: generateNextAnchor(),
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
    anchor: generateNextAnchor(),
    children: [{
      value: { id: '', url: '' },
      style: { sizeMode: 'auto', rotate: 0, rotateX: 0, rotateY: 0 }
    }]
  })
}

// 添加路径块
const addRouteBlock = () => {
  pageData.content.push({
    type: 'route',
    anchor: generateNextAnchor(),
    content: [
      { name: '起点', time: '1h', icon: '🚗', desc: '', type: 'normal' },
      { name: '终点', isEnd: true }
    ]
  })
}

// 添加附件块
const addAttachmentBlock = () => {
  pageData.content.push({
    type: 'attachment',
    anchor: generateNextAnchor(),
    children: [{
      title: '',
      url: '',
      appId: 'wxd45c635d754dbf59',  // 腾讯文档小程序 AppID
      icon: '📄'
    }]
  })
}

// 添加附件项
const addAttachmentItem = (blockIndex: number) => {
  const block = pageData.content[blockIndex] as AttachmentBlock
  if (block && block.type === 'attachment') {
    block.children.push({
      title: '',
      url: '',
      appId: 'wxd45c635d754dbf59',
      icon: '📄'
    })
  }
}

// 删除附件项
const deleteAttachmentItem = (blockIndex: number, itemIndex: number) => {
  const block = pageData.content[blockIndex] as AttachmentBlock
  if (block && block.type === 'attachment' && block.children.length > 1) {
    block.children.splice(itemIndex, 1)
  } else if (block && block.type === 'attachment' && block.children.length === 1) {
    // 只剩一个附件时，删除整个块
    pageData.content.splice(blockIndex, 1)
  }
}

// 附件 URL 输入框失焦时自动识别格式
const onAttachmentUrlBlur = (item: any) => {
  if (!item || !item.url) return

  var url = item.url.trim()
  var schemePrefix = '#小程序://腾讯文档/'

  // 检查是否为小程序 Scheme 格式
  if (url.indexOf(schemePrefix) === 0) {
    // 提取 Scheme ID
    var schemeId = url.slice(schemePrefix.length).trim()
    // 标记为小程序 Scheme 格式
    item.isMiniProgramScheme = true
    item.schemeId = schemeId
    // 更新 AppID 为腾讯文档官方 AppID
    item.appId = 'wxd44b036e1369325'
    item.icon = '📊'
    console.log('[onAttachmentUrlBlur] 识别到小程序Scheme格式，ID:', schemeId)
  } else if (url.indexOf('docs.qq.com') !== -1 || url.indexOf('doc.weixin.qq.com') !== -1) {
    // HTTPS 腾讯文档链接
    item.isMiniProgramScheme = false
    item.schemeId = ''
    item.appId = 'wxd44b036e1369325'
    item.icon = '📊'
    console.log('[onAttachmentUrlBlur] 识别到腾讯文档HTTPS链接')
  } else {
    // 其他链接
    item.isMiniProgramScheme = false
    item.schemeId = ''
    item.icon = '📄'
  }
}

// FAB 按钮操作（添加后关闭菜单）
const addTextBlockAndClose = () => {
  addTextBlock()
  fabExpanded.value = false
}

const addImageBlockAndClose = () => {
  addImageBlock()
  fabExpanded.value = false
}

const addAttachmentBlockAndClose = () => {
  addAttachmentBlock()
  fabExpanded.value = false
}

const addRouteBlockAndClose = () => {
  addRouteBlock()
  fabExpanded.value = false
}

// 添加多媒体块
const addMediaBlock = () => {
  pageData.content.push({
    type: 'media',
    style: { borderTop: 0, borderBottom: 0, borderLeft: 0, borderRight: 0, borderColor: '#eeeeee' },
    children: [{
      title: '',
      url: '',
      autoplay: false,
      controls: true,
      loop: false
    }]
  })
}

const addMediaBlockAndClose = () => {
  addMediaBlock()
  fabExpanded.value = false
}

// 添加多媒体项
const addMediaItem = (blockIndex: number) => {
  const block = pageData.content[blockIndex] as MediaBlock
  if (block && block.type === 'media') {
    block.children.push({
      title: '',
      url: '',
      autoplay: false,
      controls: true,
      loop: false
    })
  }
}

// 删除多媒体项
const deleteMediaItem = (blockIndex: number, itemIndex: number) => {
  const block = pageData.content[blockIndex] as MediaBlock
  if (block && block.type === 'media' && block.children.length > 1) {
    block.children.splice(itemIndex, 1)
  } else if (block && block.type === 'media' && block.children.length === 1) {
    pageData.content.splice(blockIndex, 1)
  }
}

// 媒体项设置面板状态
const mediaSettingsPanelVisible = ref(false)
const editingMediaBlockIndex = ref<number | null>(null)
const editingMediaItemIndex = ref<number | null>(null)

// 打开媒体项设置面板
const openMediaItemSettings = (blockIndex: number, itemIndex: number) => {
  editingMediaBlockIndex.value = blockIndex
  editingMediaItemIndex.value = itemIndex
  mediaSettingsPanelVisible.value = true
}

// 关闭媒体项设置面板
const closeMediaItemSettings = () => {
  mediaSettingsPanelVisible.value = false
  editingMediaBlockIndex.value = null
  editingMediaItemIndex.value = null
}

// 获取当前编辑的媒体项
const getEditingMediaItem = () => {
  if (editingMediaBlockIndex.value === null || editingMediaItemIndex.value === null) return null
  const block = pageData.content[editingMediaBlockIndex.value] as MediaBlock
  if (!block || block.type !== 'media') return null
  return block.children[editingMediaItemIndex.value]
}

// 媒体项面板保存：把组件返回的 draft 写回到对应 block.children[itemIndex]
const onMediaItemPanelSave = (payload: { title?: string; url: string; autoplay?: boolean; controls?: boolean; loop?: boolean }) => {
  if (editingMediaBlockIndex.value === null || editingMediaItemIndex.value === null) return
  const block = pageData.content[editingMediaBlockIndex.value] as MediaBlock
  if (!block || block.type !== 'media') return
  const item = block.children[editingMediaItemIndex.value]
  if (!item) return
  // 逐字段覆盖（保留 title 等其他字段）
  if (payload.title !== undefined) item.title = payload.title
  item.url = payload.url
  item.autoplay = payload.autoplay
  item.controls = payload.controls
  item.loop = payload.loop
}

// 在指定位置插入路径节点
const insertRouteNode = (blockIndex: number, nodeIndex: number) => {
  const block = pageData.content[blockIndex] as RouteBlock
  if (!block || block.type !== 'route') return

  block.content.splice(nodeIndex, 0, {
    name: '',
    time: '',
    icon: '🚗',
    desc: '',
    type: 'normal'
  })
}

// 删除路径节点
const deleteRouteNode = (blockIndex: number, nodeIndex: number) => {
  const block = pageData.content[blockIndex] as RouteBlock
  if (!block || block.type !== 'route') return

  // 确保至少保留2个节点（起点和终点）
  if (block.content.length <= 2) return

  // 不能删除终点
  if (block.content[nodeIndex].isEnd) return

  block.content.splice(nodeIndex, 1)
}

// 切换路径节点类型（普通/换乘）
const toggleRouteNodeType = (blockIndex: number, nodeIndex: number) => {
  const block = pageData.content[blockIndex] as RouteBlock
  if (!block || block.type !== 'route') return

  const node = block.content[nodeIndex]
  if (node.isEnd) return

  node.type = node.type === 'transfer' ? 'normal' : 'transfer'
}

// 在终点前添加节点
const addRouteNodeBeforeEnd = (blockIndex: number) => {
  const block = pageData.content[blockIndex] as RouteBlock
  if (!block || block.type !== 'route') return

  // 找到终点的位置
  const endIndex = block.content.findIndex(node => node.isEnd)
  if (endIndex === -1) return

  block.content.splice(endIndex, 0, {
    name: '',
    time: '',
    icon: '🚗',
    desc: '',
    type: 'normal'
  })
}

// 显示 JSON 导入弹窗
const showJsonImportModal = (blockIndex: number) => {
  jsonImportTargetBlock.value = blockIndex
  jsonImportText.value = ''
  jsonImportVisible.value = true
}

// 确认 JSON 导入
const confirmJsonImport = () => {
  if (jsonImportTargetBlock.value === null) return

  const block = pageData.content[jsonImportTargetBlock.value] as RouteBlock
  if (!block || block.type !== 'route') return

  try {
    const inputText = jsonImportText.value.trim()
    if (!inputText) {
      uni.showToast({ title: '请输入 JSON 数据', icon: 'none' })
      return
    }

    const importedList = JSON.parse(inputText)

    if (!Array.isArray(importedList) || importedList.length === 0) {
      uni.showToast({ title: '请输入有效的数组格式', icon: 'none' })
      return
    }

    // 自动补全缺失字段，确保格式兼容
    const processedNodes: RouteNode[] = importedList.map((node, index) => ({
      name: node.name || '',
      time: node.time || '',
      icon: node.icon || '',
      desc: node.desc || '',
      type: node.type || 'normal',
      isEnd: false // 先全部设为 false
    }))

    // 确保最后一个节点是终点
    if (processedNodes.length > 0) {
      const lastNode = processedNodes[processedNodes.length - 1]
      lastNode.isEnd = true
      // 终点不需要 time/icon/desc
      lastNode.time = ''
      lastNode.icon = ''
      lastNode.desc = ''
      lastNode.type = 'normal'
    }

    // 更新路径块内容
    block.content = processedNodes

    // 关闭弹窗
    jsonImportVisible.value = false
    jsonImportText.value = ''
    jsonImportTargetBlock.value = null

    uni.showToast({ title: '导入成功', icon: 'success' })
  } catch (e) {
    console.error('JSON 解析失败:', e)
    uni.showToast({ title: 'JSON 格式错误', icon: 'none' })
  }
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

// 切换弹窗模式
const togglePopupMode = () => {
  const item = getSelectedItem() as TextItem | null
  if (!item) return

  if (item.interactionType === 'popup') {
    item.interactionType = 'normal'
  } else {
    item.interactionType = 'popup'
  }
}

// 切换文本项的链接状态
const toggleTextLink = () => {
  const item = getSelectedItem() as TextItem | null
  if (!item) return

  if (item.linkInfo) {
    // 移除链接，同时移除链接样式
    item.linkInfo = undefined
    item.linkIcon = undefined
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
    item.linkIcon = '🔗'  // 默认填充链接图标
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
  item.linkInfo.internalScene = scene.value as 'chat' | 'memo'
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

// 显示备忘录选择器
const showMemoPicker = async () => {
  memoPickerVisible.value = true
  loadingMemosForPicker.value = true
  try {
    const res: any = await getMemos({ page: 1, limit: 50, status: 'active' })
    memoListForPicker.value = (res.results || []).map((m: any) => ({
      id: m.id,
      name: m.name || m.title?.value || '未命名',
      updatedAt: m.updatedAt
    }))
  } catch (error) {
    console.error('获取备忘录列表失败:', error)
    uni.showToast({ title: '获取备忘录列表失败', icon: 'none' })
  } finally {
    loadingMemosForPicker.value = false
  }
}

// 格式化备忘录日期（时间戳）
const formatMemoDate = (ts: number) => {
  if (!ts) return ''
  const d = new Date(typeof ts === 'number' && ts < 1e12 ? ts * 1000 : ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// 选择备忘录
const selectMemo = (memo: MemoItem) => {
  const item = getSelectedItem() as TextItem | null
  if (!item || !item.linkInfo) return

  item.linkInfo.internalId = memo.id
  item.linkInfo.internalTitle = memo.name || '未命名'
  item.linkInfo.internalPath = `/subPackages/services/memo/editor?id=${memo.id}`

  memoPickerVisible.value = false
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

// 判断块是否被锁定（容器面板里的 locked 开关）
const isBlockLocked = (blockIndex: number) => {
  const b = pageData.content[blockIndex] as any
  return b?.style?.locked === true
}

// 点击锁定徽章：提示用户并询问是否打开容器面板解锁
const onLockedBadgeClick = (blockIndex: number) => {
  uni.showModal({
    title: '该块已锁定',
    content: '锁定状态下无法删除/移动。是否打开容器设置以解锁？',
    confirmText: '去解锁',
    cancelText: '取消',
    success: (res) => {
      if (res.confirm) {
        openBlockStylePanel(blockIndex)
      }
    }
  })
}

// 删除块
const deleteBlock = (blockIndex: number) => {
  if (isBlockLocked(blockIndex)) {
    uni.showToast({ title: '该块已锁定，无法删除', icon: 'none' })
    return
  }
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

// 构建"移动到..."的可选位置列表（picker range）
// 返回 { label, target }[]：target 是 splice 插入位置（0..content.length）
const getMovePositions = (blockIndex: number) => {
  const out: { label: string; target: number }[] = []
  const total = pageData.content.length
  for (let i = 0; i <= total; i++) {
    // 跳过原地（i === blockIndex 表示"在自己当前位置之前"，i === blockIndex+1 表示"在自己之后"）
    if (i === blockIndex || i === blockIndex + 1) continue
    if (i === total) {
      out.push({ label: `移到末尾（第 ${total} 行后）`, target: i })
    } else {
      out.push({ label: `移到第 ${i + 1} 行之前`, target: i })
    }
  }
  return out
}

// 把块从 fromIndex 移动到 toIndex（splice 语义的目标位置）
const moveBlockTo = (fromIndex: number, toIndex: number) => {
  if (isBlockLocked(fromIndex)) {
    uni.showToast({ title: '该块已锁定，无法移动', icon: 'none' })
    return
  }
  if (fromIndex === toIndex || fromIndex === toIndex - 1) return
  const [item] = pageData.content.splice(fromIndex, 1)
  const adjusted = toIndex > fromIndex ? toIndex - 1 : toIndex
  pageData.content.splice(adjusted, 0, item)
  uni.showToast({ title: '已移动', icon: 'success' })
}

// picker 选中回调：从 getMovePositions 得到的 index 找出 target，然后调 moveBlockTo
const onMoveBlockPick = (blockIndex: number, pickerIndex: number) => {
  const positions = getMovePositions(blockIndex)
  const picked = positions[pickerIndex]
  if (!picked) return
  moveBlockTo(blockIndex, picked.target)
}

// 移动块
const moveBlock = (blockIndex: number, direction: number) => {
  const newIndex = blockIndex + direction
  if (newIndex < 0 || newIndex >= pageData.content.length) return
  // 任一端锁定都阻止交换，避免锁定块被动位移
  if (isBlockLocked(blockIndex) || isBlockLocked(newIndex)) {
    uni.showToast({ title: '存在锁定块，无法移动', icon: 'none' })
    return
  }
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
      settings: {
        padding: {
          top: settings.padding.top,
          bottom: settings.padding.bottom,
          left: settings.padding.left,
          right: settings.padding.right
        },
        border: {
          top: settings.border.top,
          bottom: settings.border.bottom,
          left: settings.border.left,
          right: settings.border.right,
          color: settings.border.color
        },
        appearance: {
          backgroundColor: settings.appearance.backgroundColor,
          backgroundImage: settings.appearance.backgroundImage,
          backgroundBlur: settings.appearance.backgroundBlur,
          backgroundOpacity: settings.appearance.backgroundOpacity
        },
        typography: {
          fontSize: settings.typography.fontSize,
          lineHeight: settings.typography.lineHeight
        },
        layout: {
          contentWidth: settings.layout.contentWidth
        },
        features: {
          showWatermark: settings.features.showWatermark,
          enableComments: settings.features.enableComments
        },
        showBackToTop: settings.showBackToTop,
        hideNavActions: settings.hideNavActions
      }
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
      // 服务端保存成功后清除本地草稿，避免下次进入页面再次弹恢复提示
      clearLocalDraft()
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

// 重置所有数据字段（防止数据串号）
const resetFields = () => {
  // 清空备忘录基础信息
  memoId.value = null
  memoName.value = ''
  tags.value = []
  tagInput.value = ''

  // 清空内容
  pageData.content = []

  // 重置设置为默认值
  settings.padding = { top: 32, bottom: 32, left: 32, right: 32 }
  settings.border = { top: 0, bottom: 0, left: 0, right: 0, color: '#eeeeee' }
  settings.appearance = {
    backgroundColor: '#ffffff',
    backgroundImage: '',
    backgroundBlur: 0,
    backgroundOpacity: 1,
    enableBlob: false,
    blobBlur: 80,
    enableCyberGrid: false
  }
  settings.typography = {
    fontSize: 'standard',
    lineHeight: 1.6
  }
  settings.layout = {
    contentWidth: 'full'
  }
  settings.features = {
    showWatermark: false,
    enableComments: false
  }
  settings.showBackToTop = true
  settings.hideNavActions = false
  settings.globalAttachment = {
    enabled: false,
    url: '',
    title: '查看原始文档'
  }

  // 关闭所有面板状态
  selectedItem.value = null
  blockStylePanelVisible.value = false
  editingBlockIndex.value = null
  settingsVisible.value = false
  colorPickerVisible.value = false
  filePickerVisible.value = false
  jsonImportVisible.value = false
  fabExpanded.value = false
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
      console.log('请求到的数据', result);

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

        // 加载设置
        if (memo.settings) {
          if (memo.settings.padding) {
            settings.padding.top = memo.settings.padding.top ?? 32
            settings.padding.bottom = memo.settings.padding.bottom ?? 32
            settings.padding.left = memo.settings.padding.left ?? 32
            settings.padding.right = memo.settings.padding.right ?? 32
          }
          if (memo.settings.border) {
            settings.border.top = memo.settings.border.top ?? 0
            settings.border.bottom = memo.settings.border.bottom ?? 0
            settings.border.left = memo.settings.border.left ?? 0
            settings.border.right = memo.settings.border.right ?? 0
            settings.border.color = memo.settings.border.color || '#eeeeee'
          }
          if (memo.settings.appearance) {
            settings.appearance.backgroundColor = memo.settings.appearance.backgroundColor || '#ffffff'
            settings.appearance.backgroundImage = memo.settings.appearance.backgroundImage || ''
            settings.appearance.backgroundBlur = memo.settings.appearance.backgroundBlur ?? 0
            settings.appearance.backgroundOpacity = memo.settings.appearance.backgroundOpacity ?? 1
          }
          if (memo.settings.typography) {
            settings.typography.fontSize = memo.settings.typography.fontSize || 'standard'
            settings.typography.lineHeight = memo.settings.typography.lineHeight ?? 1.6
          }
          if (memo.settings.layout) {
            settings.layout.contentWidth = memo.settings.layout.contentWidth || 'full'
          }
          if (memo.settings.features) {
            settings.features.showWatermark = memo.settings.features.showWatermark === true
            settings.features.enableComments = memo.settings.features.enableComments === true
          }
          settings.showBackToTop = memo.settings.showBackToTop !== false
          settings.hideNavActions = memo.settings.hideNavActions === true
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

// ===== 本地草稿（防丢稿） + Undo/Redo =====
// 行为：
//  - 编辑时每 1s 防抖写一份本地草稿；下次进入页面发现草稿则提示恢复
//  - 编辑时每 800ms 防抖把当前状态推入 undoStack；点 undo/redo 时跳过新快照写入
const LOCAL_DRAFT_PREFIX = 'memo_draft_'
const getDraftKey = () => `${LOCAL_DRAFT_PREFIX}${memoId.value || '__new__'}`

let draftWriteTimer: ReturnType<typeof setTimeout> | null = null
let draftAutoSaveStarted = false

// undo/redo 状态
const UNDO_LIMIT = 50
const undoStack = ref<string[]>([])  // 用 JSON 字符串存以省内存
const redoStack = ref<string[]>([])
let undoPushTimer: ReturnType<typeof setTimeout> | null = null
// 应用快照中：watch 期间跳过 draft 写入和 undo 推送
let isRestoring = false

const canUndo = computed(() => undoStack.value.length > 1) // 至少要有 1 个 baseline 才能退一步
const canRedo = computed(() => redoStack.value.length > 0)

interface EditorSnapshot {
  memoName: string
  tags: string[]
  content: any[]
  settings: any
}

const captureSnapshot = (): EditorSnapshot => ({
  memoName: memoName.value,
  tags: JSON.parse(JSON.stringify(tags.value)),
  content: JSON.parse(JSON.stringify(pageData.content)),
  settings: JSON.parse(JSON.stringify(settings))
})

const applySnapshot = (snap: EditorSnapshot) => {
  isRestoring = true
  memoName.value = snap.memoName
  tags.value.splice(0, tags.value.length, ...snap.tags)
  pageData.content.splice(0, pageData.content.length, ...snap.content)
  // settings 深合并（与 applyDraftToState 同语义）
  const s = snap.settings || {}
  if (s.padding) Object.assign(settings.padding, s.padding)
  if (s.border) Object.assign(settings.border, s.border)
  if (s.appearance) Object.assign(settings.appearance, s.appearance)
  if (s.romanticEffects) Object.assign(settings.romanticEffects, s.romanticEffects)
  if (s.typography) Object.assign(settings.typography, s.typography)
  if (s.layout) Object.assign(settings.layout, s.layout)
  if (s.features) Object.assign(settings.features, s.features)
  if (s.globalAttachment) Object.assign(settings.globalAttachment, s.globalAttachment)
  if ('showBackToTop' in s) settings.showBackToTop = s.showBackToTop
  if ('hideNavActions' in s) settings.hideNavActions = s.hideNavActions
  // 等下一个微任务释放，让 watch 看到一次变化（用于触发 draft autosave 写入新内容），
  // 但 push undo 会被 isRestoring 拦截
  setTimeout(() => { isRestoring = false }, 0)
}

const pushUndoSnapshot = () => {
  if (isRestoring) return
  const snapJson = JSON.stringify(captureSnapshot())
  const top = undoStack.value[undoStack.value.length - 1]
  if (top === snapJson) return  // 无变化跳过
  undoStack.value.push(snapJson)
  if (undoStack.value.length > UNDO_LIMIT) undoStack.value.shift()
  // 任何新编辑都会清空 redo（与浏览器历史一致）
  if (redoStack.value.length) redoStack.value = []
}

const undo = () => {
  if (!canUndo.value) {
    uni.showToast({ title: '没有可撤销的操作', icon: 'none' })
    return
  }
  // 把当前状态推入 redo，然后回到 undoStack 的前一项
  const current = JSON.stringify(captureSnapshot())
  redoStack.value.push(current)
  undoStack.value.pop() // 弹出当前
  const prev = undoStack.value[undoStack.value.length - 1]
  if (prev) applySnapshot(JSON.parse(prev))
  uni.showToast({ title: '已撤销', icon: 'none' })
}

const redo = () => {
  if (!canRedo.value) {
    uni.showToast({ title: '没有可重做的操作', icon: 'none' })
    return
  }
  const next = redoStack.value.pop()!
  // 把恢复的状态也压回 undoStack（保持栈顶始终是当前）
  undoStack.value.push(next)
  applySnapshot(JSON.parse(next))
  uni.showToast({ title: '已重做', icon: 'none' })
}

const saveLocalDraft = () => {
  try {
    const draft = {
      memoId: memoId.value,
      memoName: memoName.value,
      tags: JSON.parse(JSON.stringify(tags.value)),
      content: JSON.parse(JSON.stringify(pageData.content)),
      settings: JSON.parse(JSON.stringify(settings)),
      savedAt: Date.now()
    }
    uni.setStorageSync(getDraftKey(), JSON.stringify(draft))
  } catch (e) {
    console.warn('[draft] 保存本地草稿失败', e)
  }
}

const loadLocalDraft = (): any | null => {
  try {
    const raw = uni.getStorageSync(getDraftKey())
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const clearLocalDraft = () => {
  try {
    uni.removeStorageSync(getDraftKey())
  } catch {
    /* ignore */
  }
}

const applyDraftToState = (draft: any) => {
  if (!draft) return
  if (typeof draft.memoName === 'string') memoName.value = draft.memoName
  if (Array.isArray(draft.tags)) {
    tags.value.splice(0, tags.value.length, ...draft.tags)
  }
  if (Array.isArray(draft.content)) {
    pageData.content.splice(0, pageData.content.length, ...draft.content)
  }
  if (draft.settings && typeof draft.settings === 'object') {
    // 深合并已知字段，避免覆盖未来新增字段
    const s = draft.settings
    if (s.padding) Object.assign(settings.padding, s.padding)
    if (s.border) Object.assign(settings.border, s.border)
    if (s.appearance) Object.assign(settings.appearance, s.appearance)
    if (s.romanticEffects) Object.assign(settings.romanticEffects, s.romanticEffects)
    if (s.typography) Object.assign(settings.typography, s.typography)
    if (s.layout) Object.assign(settings.layout, s.layout)
    if (s.features) Object.assign(settings.features, s.features)
    if (s.globalAttachment) Object.assign(settings.globalAttachment, s.globalAttachment)
    if ('showBackToTop' in s) settings.showBackToTop = s.showBackToTop
    if ('hideNavActions' in s) settings.hideNavActions = s.hideNavActions
  }
}

const startDraftAutoSave = () => {
  if (draftAutoSaveStarted) return
  draftAutoSaveStarted = true
  watch(
    () => [memoName.value, tags.value, pageData.content, settings] as const,
    () => {
      // 撤销/重做应用快照时，跳过 undo 推送，但仍写本地草稿
      if (draftWriteTimer) clearTimeout(draftWriteTimer)
      draftWriteTimer = setTimeout(() => { saveLocalDraft() }, 1000)

      if (!isRestoring) {
        if (undoPushTimer) clearTimeout(undoPushTimer)
        undoPushTimer = setTimeout(() => { pushUndoSnapshot() }, 800)
      }
    },
    { deep: true }
  )
}

// 启动时检查是否有比服务端更新的本地草稿，弹窗询问恢复
const checkAndPromptDraftRestore = () => {
  const draft = loadLocalDraft()
  if (!draft || !draft.savedAt) return
  // 简单策略：只要存在本地草稿就提示（避免对比时间戳依赖服务器 updatedAt）
  const minutes = Math.max(1, Math.round((Date.now() - draft.savedAt) / 60000))
  uni.showModal({
    title: '检测到未保存的草稿',
    content: `约 ${minutes} 分钟前有未保存的本地修改，是否恢复？`,
    confirmText: '恢复',
    cancelText: '丢弃',
    success: ({ confirm }) => {
      if (confirm) {
        applyDraftToState(draft)
        uni.showToast({ title: '已恢复草稿', icon: 'success' })
      } else {
        clearLocalDraft()
      }
    }
  })
}

// 页面加载时初始化数据
onMounted(async () => {
  // 【关键】先重置所有数据，防止数据串号
  resetFields()

  // 从 URL 参数获取模式和 memoId
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options as any

  // 如果有 id，设置 memoId
  if (options.id) {
    memoId.value = options.id
    console.log('[editor] 加载备忘录 ID:', options.id)
  } else {
    console.log('[editor] 新建备忘录模式')
  }

  await loadData()
  // 数据加载完毕后再做草稿检查 + 启动 autosave，避免把空 state 写成草稿
  checkAndPromptDraftRestore()
  // 推入 baseline 快照（用户后续每次编辑都会基于它累加）
  undoStack.value = [JSON.stringify(captureSnapshot())]
  redoStack.value = []
  startDraftAutoSave()
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
  color: #fff;
  transition: opacity 0.2s ease;

  &.disabled {
    opacity: 0.35;
    pointer-events: none;
  }
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
  padding-bottom: 60rpx; // 为 FAB 按钮预留空间
}

.memo-info-section {
  background: #fff;
  padding: 24rpx 32rpx;

  .memo-header-row {
    display: flex;
    align-items: center;
    gap: 16rpx;
  }

  .memo-name-input {
    flex: 1;
    font-size: 32rpx;
    font-weight: 600;
    padding: 20rpx 0;
    border-bottom: 2rpx solid #eee;
  }

  .settings-btn {
    width: 72rpx;
    height: 72rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8f9fa;
    border-radius: 50%;
    flex-shrink: 0;

    .settings-icon {
      font-size: 36rpx;
    }

    &:active {
      background: #eee;
    }
  }

  .tags-preview {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
    margin-top: 16rpx;

    .tag-preview-item {
      padding: 6rpx 16rpx;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      border-radius: 24rpx;
      font-size: 22rpx;

      .tag-text {
        max-width: 200rpx;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
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
  position: relative;
  margin-top: 8rpx;
  background: #fff;
  border-radius: 0;
  overflow: hidden;

  /* 锁定块视觉标记 */
  &.is-locked {
    outline: 2rpx dashed rgba(230, 162, 60, 0.55);
    outline-offset: -2rpx;
    background: linear-gradient(
      to right,
      rgba(230, 162, 60, 0.04),
      transparent 20%,
      transparent 80%,
      rgba(230, 162, 60, 0.04)
    );
  }
  .locked-badge {
    position: absolute;
    top: 12rpx;
    right: 12rpx;
    z-index: 5;
    display: inline-flex;
    align-items: center;
    gap: 4rpx;
    padding: 4rpx 12rpx;
    background: rgba(230, 162, 60, 0.92);
    color: #fff;
    border-radius: 999rpx;
    font-size: 20rpx;
    line-height: 1;
    box-shadow: 0 2rpx 8rpx rgba(230, 162, 60, 0.35);
  }
  .locked-icon { font-size: 22rpx; }
  .locked-text { font-size: 20rpx; font-weight: 500; }
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

.text-item {
  max-height: 160rpx;
  overflow: hidden;
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

// FAB 悬浮按钮容器 - 固定定位，主按钮始终在底部
.fab-container {
  position: fixed;
  right: 32rpx;
  bottom: 240rpx;
  z-index: 500;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

// FAB 遮罩层
.fab-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
  z-index: -1;
}

// FAB 子按钮容器 - 绝对定位在主按钮上方
.fab-actions {
  position: absolute;
  bottom: 140rpx;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 24rpx;
  opacity: 0;
  transform: translateY(20rpx) scale(0.8);
  pointer-events: none;
  transition: all 0.2s ease-out;

  &.expanded {
    opacity: 1;
    transform: translateY(0) scale(1);
    pointer-events: auto;
  }
}

// FAB 子按钮
.fab-action-btn {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 24rpx;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 40rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.15);
  white-space: nowrap;

  .fab-action-icon {
    font-size: 32rpx;
  }

  .fab-action-text {
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
  }

  &.route {
    .fab-action-text {
      color: #11998e;
    }
  }

  &.attachment {
    .fab-action-text {
      color: #667eea;
    }
  }

  &:active {
    transform: scale(0.95);
    background: rgba(240, 240, 240, 0.95);
  }
}

// 附件块样式
.attachment-block {
  margin: 16rpx 0;
  padding: 16rpx;
  background: rgba(102, 126, 234, 0.04);
  border-radius: 12rpx;
}

.attachment-item {
  margin: 12rpx 0;
}

.attachment-card {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  background: #fff;
  border: 2rpx solid rgba(102, 126, 234, 0.2);
  border-radius: 12rpx;

  .attachment-icon {
    font-size: 40rpx;
    margin-right: 16rpx;
    flex-shrink: 0;
  }

  .attachment-info {
    flex: 1;
    min-width: 0;

    .attachment-title-input {
      width: 100%;
      font-size: 28rpx;
      font-weight: 500;
      color: #333;
      padding: 8rpx 0;
      border: none;
      background: transparent;
    }

    .attachment-url-input {
      width: 100%;
      font-size: 24rpx;
      color: #999;
      padding: 8rpx 0;
      border: none;
      background: transparent;
    }
  }

  .attachment-delete {
    font-size: 36rpx;
    color: #999;
    padding: 8rpx 16rpx;
    margin-left: 8rpx;

    &:active {
      color: #ff4757;
    }
  }
}

// 多媒体块样式
.media-block {
  margin: 16rpx 0;
  padding: 16rpx;
  background: rgba(118, 75, 162, 0.04);
  border-radius: 12rpx;

  .media-card {
    background: #fff;
    padding: 20rpx;
    border-radius: 8rpx;
    border: 2rpx solid rgba(118, 75, 162, 0.1);
    margin: 12rpx 0;
    position: relative;

    .media-info {
      margin-bottom: 16rpx;

      .media-title-input {
        width: 100%;
        font-size: 28rpx;
        font-weight: 500;
        color: #333;
        padding: 8rpx 0;
        border: none;
        background: transparent;
        margin-bottom: 8rpx;
      }

      .media-url-input {
        width: 100%;
        font-size: 24rpx;
        color: #999;
        padding: 8rpx 0;
        border: none;
        background: transparent;
      }
    }

    .mini-preview {
      width: 100%;
      height: 300rpx;
      margin-top: 16rpx;
      border-radius: 8rpx;
      background: #000;
    }

    .audio-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40rpx;
      background: rgba(118, 75, 162, 0.05);
      border-radius: 8rpx;
      margin-top: 16rpx;

      .audio-icon {
        font-size: 60rpx;
        margin-bottom: 12rpx;
      }

      .audio-text {
        font-size: 24rpx;
        color: #999;
      }
    }

    .media-status-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 8rpx;

      .media-url-preview {
        font-size: 22rpx;
        color: #999;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        &.empty {
          color: #ccc;
          font-style: italic;
        }
      }

      .media-props-tags {
        display: flex;
        gap: 8rpx;
        margin-left: 12rpx;

        .prop-tag {
          font-size: 18rpx;
          padding: 4rpx 10rpx;
          background: rgba(118, 75, 162, 0.1);
          color: #764ba2;
          border-radius: 8rpx;
        }
      }
    }

    .media-card-actions {
      position: absolute;
      top: 12rpx;
      right: 12rpx;
      display: flex;
      gap: 12rpx;

      .media-settings-btn {
        font-size: 32rpx;
        padding: 8rpx;
        color: #667eea;

        &:active {
          opacity: 0.7;
        }
      }

      .media-delete {
        font-size: 36rpx;
        color: #999;
        padding: 8rpx;

        &:active {
          color: #ff4757;
        }
      }
    }
  }
}

// 媒体设置面板样式
.media-settings-panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.media-settings-panel {
  width: 100%;
  max-height: 80vh;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  display: flex;
  flex-direction: column;

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx 32rpx;
    border-bottom: 2rpx solid #f0f0f0;

    .panel-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
    }

    .panel-close {
      font-size: 48rpx;
      color: #999;
      padding: 0 16rpx;
    }
  }

  .panel-scroll {
    flex: 1;
    padding: 24rpx 32rpx;
    // max-height: 60vh;
    box-sizing: border-box;
  }

  .style-section {
    margin-bottom: 32rpx;

    .section-title {
      font-size: 26rpx;
      color: #666;
      margin-bottom: 16rpx;
    }
  }

  .media-url-textarea {
    width: 100%;
    min-height: 120rpx;
    padding: 16rpx;
    background: #f8f9fa;
    border-radius: 8rpx;
    font-size: 26rpx;
    line-height: 1.6;
    border: 2rpx solid #e0e0e0;

    &:focus {
      background: #fff;
      border-color: #667eea;
    }
  }

  .media-prop-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16rpx 0;
    border-bottom: 1rpx solid #f5f5f5;

    .prop-label {
      font-size: 28rpx;
      color: #333;
    }
  }

  .media-preview-video {
    width: 100%;
    height: 300rpx;
    border-radius: 8rpx;
    background: #000;
  }

  .media-preview-audio {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40rpx;
    background: rgba(118, 75, 162, 0.05);
    border-radius: 8rpx;

    .audio-icon {
      font-size: 60rpx;
      margin-bottom: 12rpx;
    }

    .audio-name {
      font-size: 24rpx;
      color: #666;
    }
  }

  .panel-footer {
    padding: 24rpx 32rpx;
    border-top: 2rpx solid #f0f0f0;

    .panel-btn.confirm {
      width: 100%;
      padding: 24rpx;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      font-size: 30rpx;
      font-weight: 500;
      text-align: center;
      border-radius: 12rpx;
    }
  }
}

// FAB 主按钮 - 始终固定在容器底部
.fab-main-btn {
  width: 112rpx;
  height: 112rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  box-shadow: 0 8rpx 30rpx rgba(118, 75, 162, 0.4);
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
  flex-shrink: 0;

  .fab-main-icon {
    font-size: 56rpx;
    color: #fff;
    font-weight: 300;
    line-height: 1;
  }

  &.active {
    box-shadow: 0 8rpx 40rpx rgba(118, 75, 162, 0.6);
    transform: rotate(45deg);
  }

  &:active {
    transform: scale(0.9);
  }

  &.active:active {
    transform: scale(0.9) rotate(45deg);
  }
}

.bottom-style-panel {
  flex-shrink: 0;
  background: #fff;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.15);
  // height: 80vh;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 20vh;
  bottom: 0;
  left: 0;
  right: 0;
  overflow-y: auto;

  .style-panel-content {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;

    .panel-scroll-content {
      flex: 1;
      // max-height: calc(50vh - 100rpx);
      padding: 0 32rpx 24rpx;
      box-sizing: border-box;
    }

    .panel-text-input {
      width: 100%;
      min-height: 120rpx;
      max-height: 240px;
      overflow-y: auto;
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

// 锚点建议列表样式
.anchor-suggestions {
  margin-top: 16rpx;
  padding: 16rpx;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(255, 107, 157, 0.08));
  border-radius: 12rpx;
  border: 1rpx solid rgba(102, 126, 234, 0.2);

  .suggestions-title {
    font-size: 24rpx;
    color: #667eea;
    margin-bottom: 12rpx;
    font-weight: 500;
  }

  .suggestions-list {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;

    .suggestion-item {
      display: flex;
      align-items: center;
      gap: 8rpx;
      padding: 12rpx 16rpx;
      background: white;
      border-radius: 8rpx;
      border: 2rpx solid #e0e0e0;
      cursor: pointer;
      transition: all 0.2s ease;

      &:active {
        transform: scale(0.96);
      }

      &.is-selected {
        border-color: #667eea;
        background: rgba(102, 126, 234, 0.1);
      }

      &.is-popup-target {
        opacity: 0.6;
        border-style: dashed;
      }

      .anchor-id {
        font-size: 26rpx;
        font-weight: 600;
        color: #333;
      }

      .anchor-type {
        font-size: 22rpx;
        color: #999;
        padding: 4rpx 8rpx;
        background: #f5f5f5;
        border-radius: 4rpx;
      }

      .popup-badge {
        font-size: 20rpx;
        color: white;
        background: linear-gradient(135deg, #ff6b9d, #667eea);
        padding: 4rpx 10rpx;
        border-radius: 6rpx;
      }
    }
  }
}

.anchor-tip {
  margin-top: 12rpx;
  font-size: 24rpx;
  color: #999;
  padding: 12rpx;
  background: #f9f9f9;
  border-radius: 8rpx;
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

// 弹窗模式设置样式
.popup-mode-section {
  margin-top: 20rpx;
  padding: 16rpx 20rpx;
  background: rgba(102, 126, 234, 0.04);
  border-radius: 12rpx;
  border: 2rpx solid rgba(102, 126, 234, 0.1);

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .section-title {
      font-size: 26rpx;
      color: #666;
    }
  }

  .popup-hint {
    margin-top: 12rpx;
    font-size: 22rpx;
    color: #999;
    line-height: 1.4;
  }
}

// 链接图标输入样式
.link-icon-input {
  text-align: center;
  font-size: 32rpx !important;
}

.icon-hint {
  font-size: 22rpx;
  color: #999;
  margin-top: 8rpx;
}

// 链接类型选择器样式
.link-type-picker-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 20rpx;
  background: #f8f9fa;
  border-radius: 8rpx;
  border: 2rpx solid #e0e0e0;
  font-size: 26rpx;
  color: #333;
  transition: all 0.2s;

  &:active {
    background: #e8e8e8;
    border-color: #667eea;
  }

  .picker-arrow {
    font-size: 32rpx;
    color: #999;
  }
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

// 路径块编辑器样式
.route-block {
  background: #fff;
  border-radius: 0;
  overflow: hidden;
}

.route-edit-container {
  padding: 24rpx;
  background: #f8f9fa;
}

.route-node-editor {
  position: relative;
}

.insert-node-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 16rpx;
  margin: 16rpx 0;
  background: #fff;
  border: 2rpx dashed #667eea;
  border-radius: 8rpx;
  color: #667eea;
  font-size: 24rpx;

  .insert-icon {
    font-size: 28rpx;
  }

  &:active {
    background: #f0f5ff;
  }
}

.node-content {
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  border-left: 6rpx solid #e0e0e0;

  &.is-transfer {
    border-left-color: #667eea;
    background: #fafbff;
  }

  &.is-end {
    border-left-color: #52c41a;
    background: #f6ffed;
  }
}

.node-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 16rpx;

  .node-index {
    width: 40rpx;
    height: 40rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24rpx;
    font-weight: 600;
  }

  .node-type-label {
    font-size: 26rpx;
    color: #666;
    flex: 1;
  }

  .node-delete-btn {
    width: 48rpx;
    height: 48rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #ffebee;
    color: #f44336;
    border-radius: 50%;
    font-size: 32rpx;

    &:active {
      background: #ffcdd2;
    }
  }
}

.node-input-group {
  margin-bottom: 16rpx;

  &.half {
    flex: 1;
  }

  .input-label {
    display: block;
    font-size: 24rpx;
    color: #999;
    margin-bottom: 8rpx;
  }

  .node-input {
    width: 100%;
    padding: 16rpx;
    background: #f8f9fa;
    border: 2rpx solid #e0e0e0;
    border-radius: 8rpx;
    font-size: 28rpx;

    &:focus {
      background: #fff;
      border-color: #667eea;
    }
  }
}

.node-input-row {
  display: flex;
  gap: 16rpx;
}

.node-switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 0;
  border-top: 2rpx solid #f0f0f0;
  margin-top: 8rpx;

  .switch-label {
    font-size: 26rpx;
    color: #666;
  }
}

.add-route-node-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 24rpx;
  background: #fff;
  border-radius: 12rpx;
  margin-top: 8rpx;

  .add-icon {
    font-size: 36rpx;
    color: #667eea;
  }

  .add-text {
    font-size: 28rpx;
    color: #667eea;
  }

  &:active {
    background: #f0f5ff;
  }
}

// 工具栏路径按钮样式
.add-block-btn.route {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

// 路径编辑工具栏
.route-toolbar {
  display: flex;
  gap: 16rpx;
  margin-bottom: 20rpx;
  padding-bottom: 16rpx;
  border-bottom: 2rpx solid #e0e0e0;
}

.route-toolbar-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 20rpx;
  background: #fff;
  border: 2rpx solid #667eea;
  border-radius: 8rpx;
  color: #667eea;
  font-size: 24rpx;

  .toolbar-icon {
    font-size: 28rpx;
  }

  &:active {
    background: #f0f5ff;
  }
}

// JSON 导入弹窗
.json-import-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
}

.json-import-content {
  width: 100%;
  max-width: 680rpx;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
}

.json-import-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 2rpx solid #f0f0f0;

  .json-import-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
  }

  .json-import-close {
    font-size: 40rpx;
    color: #999;
    padding: 8rpx;
  }
}

.json-import-body {
  padding: 32rpx;
}

.json-textarea {
  width: 100%;
  min-height: 300rpx;
  padding: 20rpx;
  background: #f8f9fa;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  font-size: 26rpx;
  font-family: monospace;
  line-height: 1.6;

  &:focus {
    background: #fff;
    border-color: #667eea;
  }
}

.json-import-tip {
  margin-top: 16rpx;
  padding: 12rpx 16rpx;
  background: #fffbe6;
  border-radius: 8rpx;

  text {
    font-size: 24rpx;
    color: #d48806;
  }
}

.json-import-footer {
  display: flex;
  gap: 24rpx;
  padding: 24rpx 32rpx 32rpx;

  .json-btn {
    flex: 1;
    height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 40rpx;
    font-size: 28rpx;

    &.cancel {
      background: #f0f0f0;
      color: #666;
    }

    &.confirm {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
    }

    &:active {
      opacity: 0.8;
    }
  }
}

// 设置面板样式
.settings-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.settings-content {
  width: 100%;
  max-height: 80vh;
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  display: flex;
  flex-direction: column;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 2rpx solid #f0f0f0;
  flex-shrink: 0;

  .settings-title {
    font-size: 34rpx;
    font-weight: 600;
    color: #333;
  }

  .settings-close {
    font-size: 44rpx;
    color: #999;
    padding: 8rpx;
    line-height: 1;
  }
}

.settings-body {
  flex: 1;
  padding: 0 32rpx;
  max-height: 60vh;
  box-sizing: border-box;
}

.settings-section {
  padding: 24rpx 0;
  border-bottom: 2rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }

  .section-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 20rpx;
  }
}

.tags-manager {
  .tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
    margin-bottom: 16rpx;
  }

  .tag-editable {
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
      font-size: 28rpx;
      line-height: 1;
      opacity: 0.8;

      &:active {
        opacity: 1;
      }
    }
  }

  .tag-add-row {
    display: flex;
    gap: 12rpx;
    align-items: center;
  }

  .tag-add-input {
    flex: 1;
    height: 72rpx;
    padding: 0 20rpx;
    background: #f8f9fa;
    border: 2rpx solid #e0e0e0;
    border-radius: 36rpx;
    font-size: 26rpx;

    &:focus {
      background: #fff;
      border-color: #667eea;
    }
  }

  .tag-add-btn {
    height: 72rpx;
    padding: 0 28rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    border-radius: 36rpx;
    font-size: 26rpx;
    display: flex;
    align-items: center;
    justify-content: center;

    &:active {
      opacity: 0.8;
    }
  }
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;

  .setting-info {
    flex: 1;

    .setting-label {
      display: block;
      font-size: 28rpx;
      color: #333;
      margin-bottom: 4rpx;
    }

    .setting-desc {
      display: block;
      font-size: 24rpx;
      color: #999;
    }
  }
}

// 边距设置网格
.padding-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
}

.padding-item {
  display: flex;
  // flex-direction: column;
  // align-items: center;
  // gap: 8rpx;

  .padding-label {
    font-size: 24rpx;
    color: #666;
  }

  .padding-input {
    width: 100%;
    height: 64rpx;
    text-align: center;
    background: #f8f9fa;
    border: 2rpx solid #e0e0e0;
    border-radius: 12rpx;
    font-size: 26rpx;

    &:focus {
      background: #fff;
      border-color: #667eea;
    }
  }
}

// 边框设置网格
.border-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.border-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12rpx 16rpx;
  background: #f8f9fa;
  border-radius: 12rpx;

  .border-label {
    font-size: 24rpx;
    color: #666;
  }

  .border-controls {
    display: flex;
    flex: 1;
  }

  .border-width-input {
    width: 80rpx;
    height: 48rpx;
    text-align: center;
    background: #fff;
    border: 2rpx solid #e0e0e0;
    border-radius: 8rpx;
    font-size: 24rpx;

    &:focus {
      border-color: #667eea;
    }
  }

  .border-unit {
    font-size: 22rpx;
    color: #999;
  }
}

.border-color-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 12rpx 0;

  .border-color-label {
    font-size: 26rpx;
    color: #333;
    flex-shrink: 0;
  }

  .border-color-input {
    flex: 1;
    height: 56rpx;
    padding: 0 16rpx;
    background: #f8f9fa;
    border: 2rpx solid #e0e0e0;
    border-radius: 12rpx;
    font-size: 26rpx;
    font-family: monospace;

    &:focus {
      background: #fff;
      border-color: #667eea;
    }
  }

  .border-color-preview {
    width: 56rpx;
    height: 56rpx;
    border-radius: 12rpx;
    border: 2rpx solid #e0e0e0;
    flex-shrink: 0;
  }
}

// 子标题
.subsection-title {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 12rpx;
}

// 莫兰迪配色面板
.color-palette {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.palette-item {
  height: 80rpx;
  border-radius: 12rpx;
  border: 2rpx solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  &.active {
    border-color: #667eea;
    border-width: 4rpx;
  }

  .palette-check {
    color: #667eea;
    font-size: 32rpx;
    font-weight: bold;
  }
}

// 设置行
.setting-row {
  margin-bottom: 20rpx;

  .setting-row-label {
    display: block;
    font-size: 26rpx;
    color: #333;
    margin-bottom: 12rpx;
  }
}

// 背景图片控制
.bg-image-controls {
  display: flex;
  gap: 12rpx;

  .bg-image-input {
    flex: 1;
    height: 64rpx;
    padding: 0 16rpx;
    background: #f8f9fa;
    border: 2rpx solid #e0e0e0;
    border-radius: 12rpx;
    font-size: 24rpx;

    &:focus {
      background: #fff;
      border-color: #667eea;
    }
  }

  .bg-image-upload {
    height: 64rpx;
    padding: 0 24rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    border-radius: 12rpx;
    font-size: 24rpx;
    display: flex;
    align-items: center;
    justify-content: center;

    &:active {
      opacity: 0.8;
    }
  }
}

// 滑块行
.slider-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;

  .slider-label {
    font-size: 24rpx;
    color: #666;
    width: 80rpx;
    flex-shrink: 0;
  }

  slider {
    flex: 1;
  }

  .slider-value {
    font-size: 24rpx;
    color: #333;
    width: 80rpx;
    text-align: right;
    flex-shrink: 0;
  }
}

// 字号档位选项卡
.font-size-tabs {
  display: flex;
  gap: 12rpx;
}

.font-size-tab {
  flex: 1;
  padding: 16rpx 12rpx;
  background: #f8f9fa;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  text-align: center;

  &.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-color: #667eea;

    .tab-label,
    .tab-size {
      color: #fff;
    }
  }

  .tab-label {
    display: block;
    font-size: 26rpx;
    color: #333;
    font-weight: 500;
  }

  .tab-size {
    display: block;
    font-size: 22rpx;
    color: #999;
    margin-top: 4rpx;
  }
}

.settings-footer {
  padding: 24rpx 32rpx;
  flex-shrink: 0;

  .settings-done-btn {
    height: 88rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    border-radius: 44rpx;
    font-size: 30rpx;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;

    &:active {
      opacity: 0.8;
    }
  }
}

// 块级样式设置面板 - 90vh Fixed 规范
.block-style-panel-overlay {
  position: fixed;
  // top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  z-index: 2000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  overflow-y: auto;
}

.block-style-panel {
  width: 100%;
  height: 90vh;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 40rpx 40rpx 0 0;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -10rpx 40rpx rgba(0, 0, 0, 0.1);
  animation: slideUp 0.3s ease-out;
  
  /* 预留小程序顶部安全区域 */
  padding-top: env(safe-area-inset-top);
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }

  to {
    transform: translateY(0);
  }
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
  flex-shrink: 0;

  .panel-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
  }

  .panel-close {
    font-size: 40rpx;
    color: #999;
    padding: 8rpx 16rpx;

    &:active {
      color: #333;
    }
  }
}

.panel-scroll {
  flex: 1;
  padding: 0 32rpx;
  // max-height: 60vh;
  box-sizing: border-box;
}

.style-section {
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f5f5f5;

  .section-title {
    font-size: 28rpx;
    font-weight: 500;
    color: #333;
    margin-bottom: 20rpx;
  }
}

// 颜色选择网格
.color-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.color-option {
  width: 72rpx;
  height: 72rpx;
  border-radius: 12rpx;
  border: 2rpx solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  &.active {
    border-color: #667eea;
    border-width: 4rpx;
  }

  &.transparent {
    background: linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%),
      linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%);
    background-size: 20rpx 20rpx;
    background-position: 0 0, 10rpx 10rpx;

    .transparent-label {
      font-size: 20rpx;
      color: #999;
    }
  }

  .check-icon {
    font-size: 28rpx;
    color: #667eea;
    font-weight: bold;
  }
}

// 内边距设置
.padding-grid {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.padding-item {
  display: flex;
  align-items: center;
  gap: 16rpx;

  .padding-label {
    width: 48rpx;
    font-size: 26rpx;
    color: #666;
    flex-shrink: 0;
  }

  slider {
    flex: 1;
  }

  .padding-value {
    width: 60rpx;
    font-size: 24rpx;
    color: #999;
    text-align: right;
    flex-shrink: 0;
  }
}

// 边框设置
.border-grid {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.border-item {
  .border-label {
    font-size: 26rpx;
    color: #666;
    margin-bottom: 12rpx;
    display: block;
  }

  .border-controls {
    display: flex;
    align-items: center;
    gap: 12rpx;

    .border-slider {
      flex: 1;
    }

    .border-value {
      width: 80rpx;
      font-size: 24rpx;
      color: #999;
      flex-shrink: 0;
    }

    .border-color-input {
      width: 140rpx;
      height: 56rpx;
      border: 2rpx solid #e0e0e0;
      border-radius: 8rpx;
      padding: 0 12rpx;
      font-size: 24rpx;
      color: #333;
      flex-shrink: 0;
    }
  }
}

// 圆角设置
.radius-row {
  display: flex;
  align-items: center;
  gap: 16rpx;

  .radius-slider {
    flex: 1;
  }

  .radius-value {
    width: 80rpx;
    font-size: 24rpx;
    color: #999;
    text-align: right;
    flex-shrink: 0;
  }
}

// 面板底部按钮
.panel-footer {
  display: flex;
  gap: 24rpx;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #f0f0f0;
  flex-shrink: 0;

  .panel-btn {
    flex: 1;
    height: 80rpx;
    border-radius: 40rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    font-weight: 500;

    &.reset {
      background: #f5f5f5;
      color: #666;

      &:active {
        background: #e8e8e8;
      }
    }

    &.confirm {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;

      &:active {
        opacity: 0.8;
      }
    }
  }
}

// 设置按钮高亮样式
.action-btn.style-btn {
  &:active {
    background: rgba(102, 126, 234, 0.1);
  }
}

// 业务属性区域样式
.business-section {
  background: rgba(102, 126, 234, 0.04);
  margin: 0 -32rpx;
  padding: 24rpx 32rpx !important;
  border-bottom: none !important;
}

.business-item {
  margin-bottom: 16rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.business-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.business-label {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.business-hint {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
  line-height: 1.4;
}

.business-input-group {
  margin-bottom: 12rpx;

  .business-label {
    display: block;
    margin-bottom: 8rpx;
  }

  .business-input {
    width: 100%;
    height: 72rpx;
    border: 2rpx solid #e0e0e0;
    border-radius: 12rpx;
    padding: 0 20rpx;
    font-size: 26rpx;
    color: #333;
    background: #fff;

    &:focus {
      border-color: #667eea;
    }
  }
}

// 90vh 底部固定配置面板样式
.full-screen-panel {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 90vh;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 40rpx 40rpx 0 0;
  display: flex;
  flex-direction: column;
  z-index: 2000;
  box-shadow: 0 -10rpx 40rpx rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  
  /* 预留小程序顶部安全区域 */
  padding-top: env(safe-area-inset-top);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 40rpx;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-bottom: 2rpx solid rgba(102, 126, 234, 0.1);
  flex-shrink: 0; /* 防止标题区被压缩 */

  .panel-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #2d3436;
  }

  .save-btn {
    padding: 16rpx 32rpx;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border: none;
    border-radius: 24rpx;
    font-size: 28rpx;
    font-weight: 500;
    box-shadow: 0 8rpx 20rpx rgba(102, 126, 234, 0.3);
    transition: all 0.3s ease;

    &:active {
      transform: scale(0.95);
      box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.4);
    }
  }
}

.config-tabs {
  display: flex;
  padding: 0 40rpx;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(15px);
  flex-shrink: 0; /* 防止标签区被压缩 */

  .tab-item {
    flex: 1;
    text-align: center;
    padding: 24rpx 16rpx;
    position: relative;
    transition: all 0.3s ease;

    text {
      font-size: 28rpx;
      color: #74b9ff;
      font-weight: 500;
    }

    &.active {
      text {
        color: #667eea;
        font-weight: 600;
      }

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60rpx;
        height: 6rpx;
        background: linear-gradient(135deg, #667eea, #764ba2);
        border-radius: 3rpx;
      }
    }
  }
}

.tab-content {
  flex: 1;
  padding: 40rpx;
  overflow-y: auto;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom)); /* 预留底部安全区域 */
}

// 卡片化配置区块
.config-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow:
    0 12rpx 40rpx rgba(102, 126, 234, 0.1),
    0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(20px);
  border: 2rpx solid rgba(255, 255, 255, 0.8);

  .card-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #2d3436;
    margin-bottom: 24rpx;
    display: flex;
    align-items: center;
    gap: 12rpx;
  }

  .card-content {
    .config-hint {
      text {
        font-size: 24rpx;
        color: #74b9ff;
        line-height: 1.5;
      }
    }

    .romantic-hint {
      background: linear-gradient(135deg, #ff6b9d1a, #74b9ff1a);
      padding: 20rpx;
      border-radius: 16rpx;
      margin-top: 24rpx;
      border: 2rpx solid rgba(255, 107, 157, 0.2);

      text {
        font-size: 24rpx;
        color: #e84393;
        line-height: 1.6;
      }
    }
  }
}

// 浪漫交互控件样式
.picker-display {
  padding: 12rpx 24rpx;
  background: linear-gradient(135deg, #74b9ff1a, #667eea1a);
  color: #667eea;
  border-radius: 20rpx;
  font-size: 24rpx;
  font-weight: 500;
  border: 2rpx solid rgba(102, 126, 234, 0.2);
}

// 弹窗内容编辑器
.popup-content-section {
  margin-top: 32rpx;

  .section-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #2d3436;
    margin-bottom: 20rpx;
  }
}

.popup-editor-card {
  background: linear-gradient(135deg, #ff6b9d1a, #667eea1a);
  border-radius: 20rpx;
  padding: 24rpx;
  border: 2rpx solid rgba(255, 107, 157, 0.3);

  .popup-content-input {
    width: 100%;
    min-height: 200rpx;
    padding: 20rpx;
    background: rgba(255, 255, 255, 0.8);
    border: 2rpx solid rgba(116, 185, 255, 0.3);
    border-radius: 16rpx;
    font-size: 26rpx;
    color: #2d3436;
    line-height: 1.6;
    backdrop-filter: blur(10px);
  }

  .popup-controls {
    display: flex;
    gap: 16rpx;
    margin-top: 20rpx;

    .control-btn {
      flex: 1;
      padding: 20rpx;
      border-radius: 16rpx;
      font-size: 26rpx;
      font-weight: 500;
      border: none;
      transition: all 0.3s ease;

      &.primary {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        box-shadow: 0 6rpx 16rpx rgba(102, 126, 234, 0.3);

        &:active {
          transform: translateY(2rpx);
          box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.4);
        }
      }

      &.secondary {
        background: linear-gradient(135deg, #ff6b9d, #e84393);
        color: white;
        box-shadow: 0 6rpx 16rpx rgba(255, 107, 157, 0.3);

        &:active {
          transform: translateY(2rpx);
          box-shadow: 0 4rpx 12rpx rgba(255, 107, 157, 0.4);
        }
      }
    }
  }
}

// 弹窗图片预览样式
.popup-images {
  margin-top: 24rpx;

  .images-title {
    font-size: 26rpx;
    color: #667eea;
    font-weight: 500;
    margin-bottom: 16rpx;
  }

  .images-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;

    .image-item {
      position: relative;
      width: 120rpx;
      height: 120rpx;
      border-radius: 12rpx;
      overflow: hidden;

      .image-preview {
        width: 100%;
        height: 100%;
        border-radius: 12rpx;
        border: 2rpx solid rgba(102, 126, 234, 0.2);
      }

      .image-remove {
        position: absolute;
        top: -8rpx;
        right: -8rpx;
        width: 32rpx;
        height: 32rpx;
        background: #ff6b9d;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20rpx;
        font-weight: 600;
        box-shadow: 0 4rpx 12rpx rgba(255, 107, 157, 0.4);
        border: 2rpx solid white;
      }
    }
  }
}
</style>
