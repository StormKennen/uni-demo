<template>
  <view class="schema-demo-page">
    <!-- 导航栏 -->
    <nav-bar 
      always-title
      title="Schema 编辑器 Demo"
      custom-class="light"
      :custom-style="{ backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }"
    />
    
    <!-- 操作栏 -->
    <view class="action-bar">
      <view class="action-bar-left">
        <text class="info-text">新一代 Schema 驱动编辑器</text>
      </view>
      <view class="action-bar-right">
        <view class="action-btn demo-btn" @click="goToDemo">
          <text class="icon">🚀</text>
          <text class="btn-text">进入 Demo</text>
        </view>
      </view>
    </view>

    <!-- 功能介绍 -->
    <view class="content-wrapper">
      <view class="feature-list">
        <view class="feature-item">
          <text class="feature-icon">📝</text>
          <view class="feature-content">
            <text class="feature-title">文字块 (TextBlock)</text>
            <text class="feature-desc">支持富文本样式：粗体、斜体、下划线、删除线、字号、颜色</text>
            <text class="feature-status">✅ itemSchema 已完成</text>
          </view>
        </view>

        <view class="feature-item">
          <text class="feature-icon">🖼️</text>
          <view class="feature-content">
            <text class="feature-title">图片块 (ImageBlock)</text>
            <text class="feature-desc">支持多种布局：网格、轮播、自由布局</text>
            <text class="feature-status">⏸ itemSchema 待补全</text>
          </view>
        </view>

        <view class="feature-item">
          <text class="feature-icon">🗺️</text>
          <view class="feature-content">
            <text class="feature-title">路径块 (RouteBlock)</text>
            <text class="feature-desc">时间轴式路径展示，支持节点配置</text>
            <text class="feature-status">⏸ itemSchema 待补全</text>
          </view>
        </view>

        <view class="feature-item">
          <text class="feature-icon">📎</text>
          <view class="feature-content">
            <text class="feature-title">附件块 (AttachmentBlock)</text>
            <text class="feature-desc">文件附件管理</text>
            <text class="feature-status">⏸ itemSchema 待补全</text>
          </view>
        </view>

        <view class="feature-item">
          <text class="feature-icon">🎬</text>
          <view class="feature-content">
            <text class="feature-title">媒体块 (MediaBlock)</text>
            <text class="feature-desc">音视频播放控制</text>
            <text class="feature-status">⏸ itemSchema 待补全</text>
          </view>
        </view>
      </view>

      <!-- 测试说明 -->
      <view class="test-guide">
        <text class="guide-title">📋 测试指南</text>
        <view class="guide-steps">
          <text class="guide-step">1. 点击"进入 Demo"按钮</text>
          <text class="guide-step">2. 点击顶部 5 个按钮创建不同类型的 Block</text>
          <text class="guide-step">3. 点击 Block 右上角 ⚙️ 打开 Block 设置面板</text>
          <text class="guide-step">4. 点击文字块内每段右边的 ⚙️ 打开 Item 设置面板</text>
          <text class="guide-step">5. 在 Item 面板中修改粗体/字号/颜色，保存后立即生效</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import NavBar from '@/components/nav-bar.vue'

const goToDemo = () => {
  uni.navigateTo({
    url: '/editor-core/demo/SchemaEditorDemo'
  })
}
</script>

<style lang="scss" scoped>
.schema-demo-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 24rpx;
  background: #fff;
  border-bottom: 1rpx solid #eee;
  
  .action-bar-left {
    flex: 1;
    
    .info-text {
      font-size: 26rpx;
      color: #666;
    }
  }
  
  .action-bar-right {
    .action-btn {
      display: flex;
      align-items: center;
      gap: 8rpx;
      padding: 12rpx 24rpx;
      border-radius: 8rpx;
      
      .icon {
        font-size: 28rpx;
      }
      
      .btn-text {
        font-size: 26rpx;
      }
      
      &.demo-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        
        .icon, .btn-text {
          color: #fff;
        }
      }
      
      &:active {
        opacity: 0.8;
      }
    }
  }
}

.content-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 24rpx;
}

.feature-list {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
  
  .feature-item {
    display: flex;
    gap: 24rpx;
    padding: 32rpx 24rpx;
    border-bottom: 1rpx solid #eee;
    
    &:last-child {
      border-bottom: none;
    }
    
    .feature-icon {
      font-size: 48rpx;
      flex-shrink: 0;
    }
    
    .feature-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8rpx;
      
      .feature-title {
        font-size: 30rpx;
        font-weight: 600;
        color: #333;
      }
      
      .feature-desc {
        font-size: 26rpx;
        color: #666;
        line-height: 1.5;
      }
      
      .feature-status {
        font-size: 24rpx;
        color: #52c41a;
        margin-top: 4rpx;
      }
    }
  }
}

.test-guide {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx 24rpx;
  
  .guide-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    display: block;
    margin-bottom: 24rpx;
  }
  
  .guide-steps {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
    
    .guide-step {
      font-size: 28rpx;
      color: #666;
      line-height: 1.6;
      padding-left: 32rpx;
      position: relative;
      
      &::before {
        content: '';
        position: absolute;
        left: 8rpx;
        top: 12rpx;
        width: 8rpx;
        height: 8rpx;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
      }
    }
  }
}
</style>
