# 多媒体容器与文本弹窗实现指南

## 已完成功能

### ✅ 多媒体容器（视频/音频）
1. **类型定义** - `MediaBlock` 和 `MediaItem` 接口已添加
2. **编辑器功能**:
   - FAB 按钮新增 🎬 "视频/音频" 选项
   - 多媒体块编辑界面（标题、URL 输入）
   - 视频预览（.mp4 格式）
   - 音频占位符（.mp3/.m4a）
3. **详情页展示**:
   - 视频播放器（400rpx 高度）
   - 音频展示卡片
4. **样式设计**: 紫色主题，圆角卡片设计

### 🔄 进行中：文本弹窗功能

#### 已完成部分
1. `LinkInfo` 接口已更新，支持 `popup` 类型
2. 新增字段：`popupContent`（弹窗内容）、`popupIsMarkdown`（Markdown 格式标记）
3. 链接类型配置数组已添加

#### 待完成部分

##### 1. 编辑器 (editor.vue) - 添加计算属性和方法

在 `internalLinkSceneLabel` 计算属性后添加：

```typescript
// 链接类型选择器的当前索引与展示文案
const linkTypeIndex = computed(() => {
  const item = getSelectedItem()
  if (!item?.linkInfo?.linkType) return 0
  const idx = linkTypes.findIndex((t) => t.value === item.linkInfo!.linkType)
  return idx >= 0 ? idx : 0
})

const linkTypeLabel = computed(() => {
  const item = getSelectedItem()
  if (!item?.linkInfo?.linkType) return '请选择类型'
  const type = linkTypes.find((t) => t.value === item.linkInfo!.linkType)
  return type?.label ?? '请选择类型'
})

// 链接类型变更处理
const onLinkTypeChange = (e: any) => {
  const item = getSelectedItem()
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
```

##### 2. 编辑器 - 添加弹窗内容编辑区

在超链接输入框后添加：

```vue
<!-- 弹窗内容编辑 -->
<view class="link-input-group" v-if="getSelectedItem()?.linkInfo?.linkType === 'popup'">
  <view class="input-label">弹窗内容</view>
  <textarea 
    class="popup-content-textarea" 
    v-model="getSelectedItem().linkInfo.popupContent"
    placeholder="输入弹窗显示的内容，支持 Markdown 格式" 
    :maxlength="10000"
    auto-height
  />
  <view class="popup-markdown-toggle">
    <text class="toggle-label">Markdown 格式</text>
    <switch 
      :checked="getSelectedItem()?.linkInfo?.popupIsMarkdown || false" 
      @change="getSelectedItem().linkInfo.popupIsMarkdown = !getSelectedItem().linkInfo.popupIsMarkdown"
      color="#667eea"
    />
  </view>
</view>
```

##### 3. 编辑器样式 - 添加弹窗编辑区样式

```scss
.popup-content-textarea {
  width: 100%;
  min-height: 200rpx;
  padding: 16rpx;
  background: #f8f9fa;
  border-radius: 8rpx;
  font-size: 26rpx;
  line-height: 1.6;
  border: 2rpx solid #e0e0e0;
  margin-top: 12rpx;
  
  &:focus {
    background: #fff;
    border-color: #667eea;
  }
}

.popup-markdown-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 0;
  
  .toggle-label {
    font-size: 26rpx;
    color: #666;
  }
}

.link-type-picker-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 20rpx;
  background: #f8f9fa;
  border-radius: 8rpx;
  border: 2rpx solid #e0e0e0;
  
  .picker-arrow {
    font-size: 32rpx;
    color: #999;
  }
}
```

##### 4. 详情页 (detail.vue) - 添加弹窗处理

在 `handleTextLinkClick` 方法中添加 popup 处理：

```typescript
// 弹窗状态
const popupVisible = ref(false)
const popupContent = ref('')
const popupIsMarkdown = ref(false)

// 处理文本链接点击
const handleTextLinkClick = (linkInfo: any) => {
  if (!linkInfo) return
  
  // 弹窗类型
  if (linkInfo.linkType === 'popup') {
    popupContent.value = linkInfo.popupContent || ''
    popupIsMarkdown.value = linkInfo.popupIsMarkdown || false
    popupVisible.value = true
    return
  }
  
  // ... 其他链接类型处理保持不变
}

// 关闭弹窗
const closePopup = () => {
  popupVisible.value = false
  popupContent.value = ''
  popupIsMarkdown.value = false
}
```

##### 5. 详情页模板 - 添加弹窗组件

在页面底部添加：

```vue
<!-- 内容弹窗 -->
<view class="popup-overlay" v-if="popupVisible" @click="closePopup">
  <view class="popup-panel" @click.stop>
    <view class="popup-header">
      <text class="popup-title">详细内容</text>
      <view class="popup-close" @click="closePopup">×</view>
    </view>
    <scroll-view class="popup-body" scroll-y>
      <!-- Markdown 模式 -->
      <view v-if="popupIsMarkdown" class="popup-markdown" v-html="renderMarkdown(popupContent)"></view>
      <!-- 普通文本模式 -->
      <text v-else class="popup-text">{{ popupContent }}</text>
    </scroll-view>
  </view>
</view>
```

##### 6. 详情页样式 - 弹窗样式

```scss
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 9999;
}

.popup-panel {
  width: 100%;
  max-height: 70vh;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24rpx 24rpx 0 0;
  
  .popup-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #fff;
  }
  
  .popup-close {
    font-size: 48rpx;
    color: #fff;
    padding: 0 16rpx;
    line-height: 1;
  }
}

.popup-body {
  flex: 1;
  padding: 32rpx;
  overflow-y: auto;
}

.popup-text {
  font-size: 28rpx;
  line-height: 1.8;
  color: #333;
  white-space: pre-wrap;
}

.popup-markdown {
  font-size: 28rpx;
  line-height: 1.8;
  color: #333;
}
```

## 媒体容器智能识别功能

### 1. 添加直链检测函数 (detail.vue)

```typescript
// 检测是否为直链媒体
const isDirectMedia = (url: string): boolean => {
  if (!url) return false
  const videoFormats = ['.mp4', '.mov', '.avi', '.webm', '.m4v']
  const audioFormats = ['.mp3', '.m4a', '.wav', '.ogg', '.aac']
  const lowerUrl = url.toLowerCase()
  return [...videoFormats, ...audioFormats].some(format => lowerUrl.endsWith(format))
}

// 处理媒体操作
const handleMediaAction = (item: any) => {
  if (isDirectMedia(item.url)) {
    // 直链逻辑：已在 template 渲染为 video/audio，无需处理
    return
  } else {
    // 非直链逻辑：复制链接并提示
    uni.setClipboardData({
      data: item.url,
      success: () => {
        uni.vibrateShort()
        uni.showToast({ 
          title: '分享链接已复制，请在浏览器查看', 
          icon: 'none',
          duration: 2500
        })
      }
    })
  }
}
```

### 2. 更新媒体块模板 (detail.vue)

```vue
<!-- 多媒体块 -->
<view v-if="block.type === 'media'" class="media-container" :style="getBlockStyle(block.style)">
  <view 
    v-for="(item, itemIndex) in block.children" 
    :key="itemIndex"
    class="media-item"
  >
    <text v-if="item.title" class="media-title">{{ item.title }}</text>
    
    <!-- 直链视频 -->
    <video 
      v-if="item.url && isDirectMedia(item.url) && item.url.match(/\.(mp4|mov|avi|webm|m4v)$/i)" 
      :src="item.url" 
      class="media-video" 
      controls
      :show-center-play-btn="true"
      :show-play-btn="true"
    ></video>
    
    <!-- 直链音频 -->
    <view 
      v-else-if="item.url && isDirectMedia(item.url) && item.url.match(/\.(mp3|m4a|wav|ogg|aac)$/i)" 
      class="media-audio-wrapper"
    >
      <view class="audio-icon">🎵</view>
      <text class="audio-name">{{ item.title || '音频文件' }}</text>
    </view>
    
    <!-- 非直链：显示复制卡片 -->
    <view 
      v-else-if="item.url"
      class="media-link-card"
      hover-class="link-card-hover"
      @click="handleMediaAction(item)"
    >
      <view class="link-card-icon">🎬</view>
      <view class="link-card-content">
        <text class="link-card-title">{{ item.title || '媒体链接' }}</text>
        <text class="link-card-hint">点击复制分享链接</text>
      </view>
      <view class="link-card-action">📋</view>
    </view>
  </view>
</view>
```

### 3. 非直链卡片样式 (detail.vue)

```scss
.media-link-card {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
  border: 2rpx solid rgba(118, 75, 162, 0.2);
  border-radius: 16rpx;
  transition: all 0.2s ease;
  
  &.link-card-hover {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
    transform: scale(0.98);
  }
  
  .link-card-icon {
    font-size: 48rpx;
    margin-right: 20rpx;
  }
  
  .link-card-content {
    flex: 1;
    
    .link-card-title {
      display: block;
      font-size: 30rpx;
      font-weight: 500;
      color: #333;
      margin-bottom: 4rpx;
    }
    
    .link-card-hint {
      display: block;
      font-size: 24rpx;
      color: #999;
    }
  }
  
  .link-card-action {
    font-size: 36rpx;
    color: #667eea;
  }
}
```

### 4. 编辑器提示 (editor.vue)

在媒体 URL 输入框下方添加智能提示：

```vue
<view v-if="item.url && !isDirectMediaUrl(item.url)" class="media-url-warning">
  <text class="warning-icon">⚠️</text>
  <text class="warning-text">检测到非视频直链，小程序前端将引导用户复制访问</text>
</view>
```

添加检测方法：

```typescript
const isDirectMediaUrl = (url: string): boolean => {
  if (!url) return false
  const formats = ['.mp4', '.mov', '.avi', '.webm', '.m4v', '.mp3', '.m4a', '.wav', '.ogg', '.aac']
  return formats.some(format => url.toLowerCase().endsWith(format))
}
```

添加警告样式：

```scss
.media-url-warning {
  display: flex;
  align-items: center;
  padding: 12rpx 16rpx;
  background: rgba(255, 152, 0, 0.1);
  border-radius: 8rpx;
  margin-top: 12rpx;
  
  .warning-icon {
    font-size: 28rpx;
    margin-right: 8rpx;
  }
  
  .warning-text {
    flex: 1;
    font-size: 22rpx;
    color: #ff9800;
    line-height: 1.4;
  }
}
```

## 测试清单

- [ ] 文本弹窗：创建、编辑、预览
- [ ] 文本弹窗：Markdown 渲染
- [ ] 媒体容器：直链视频播放
- [ ] 媒体容器：直链音频显示
- [ ] 媒体容器：非直链复制引导
- [ ] 媒体容器：震动反馈
- [ ] 编辑器：非直链警告提示

## 注意事项

1. TypeScript 类型警告可以忽略，运行时有类型守卫保护
2. 确保 `marked` 库已正确导入用于 Markdown 渲染
3. 测试时使用真实的媒体 URL
4. 非直链检测基于文件扩展名，可根据需要扩展格式列表
