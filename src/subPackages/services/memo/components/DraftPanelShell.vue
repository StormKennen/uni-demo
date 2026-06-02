<template>
  <!-- 全屏遮罩 + 抽屉式面板（底部弹起） -->
  <view v-if="visible" class="draft-panel-mask" @click="onMaskClick">
    <view
      class="draft-panel-container"
      :class="[layout === 'fullscreen' ? 'is-fullscreen' : 'is-bottom-sheet']"
      @click.stop
    >
      <!-- 顶栏：标题 + 关闭 -->
      <view class="draft-panel-header">
        <text class="draft-panel-title">{{ title }}</text>
        <view class="draft-panel-close" @click="$emit('cancel')">
          <text>×</text>
        </view>
      </view>

      <!-- 可选 Tab 行（具名插槽） -->
      <view v-if="$slots.tabs" class="draft-panel-tabs">
        <slot name="tabs" />
      </view>

      <!-- 内容主体 -->
      <scroll-view scroll-y class="draft-panel-body">
        <slot />
      </scroll-view>

      <!-- 固定底栏：[重置] [取消] [保存] -->
      <view class="draft-panel-footer">
        <view class="draft-btn ghost" @click="$emit('reset')">重置</view>
        <view class="draft-btn ghost" @click="$emit('cancel')">取消</view>
        <view class="draft-btn primary" :class="{ 'is-dirty': isDirty }" @click="$emit('save')">
          保存{{ isDirty ? '*' : '' }}
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean
  title: string
  isDirty?: boolean
  /** 'fullscreen' 全屏 / 'bottom-sheet' 底部抽屉（默认） */
  layout?: 'fullscreen' | 'bottom-sheet'
}>()

const emit = defineEmits<{
  (e: 'reset'): void
  (e: 'cancel'): void
  (e: 'save'): void
}>()

function onMaskClick() {
  // 蒙层点击 = 取消（由父组件 useDraftPanel.cancel 做脏检查）
  emit('cancel')
}
</script>

<style lang="scss" scoped>
.draft-panel-mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: flex-end;
}

.draft-panel-container {
  width: 100%;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &.is-bottom-sheet {
    max-height: 80vh;
    border-radius: 24rpx 24rpx 0 0;
  }

  &.is-fullscreen {
    height: 100vh;
    border-radius: 0;
  }
}

.draft-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid #ebeef5;
  flex-shrink: 0;
}

.draft-panel-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #303133;
}

.draft-panel-close {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  color: #909399;
  border-radius: 50%;
  background: #f5f7fa;

  &:active {
    background: #e4e7ed;
  }
}

.draft-panel-tabs {
  flex-shrink: 0;
  border-bottom: 1rpx solid #ebeef5;
}

.draft-panel-body {
  flex: 1;
  min-height: 200rpx;
  padding: 24rpx 32rpx;
  box-sizing: border-box;
}

.draft-panel-footer {
  display: flex;
  gap: 16rpx;
  padding: 20rpx 32rpx calc(20rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #ebeef5;
  flex-shrink: 0;
  background: #ffffff;
}

.draft-btn {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  font-size: 28rpx;
  transition: all 0.2s ease;

  &.ghost {
    background: #f5f7fa;
    color: #606266;

    &:active {
      background: #e4e7ed;
    }
  }

  &.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #ffffff;
    font-weight: 600;

    &:active {
      opacity: 0.85;
    }

    &.is-dirty {
      box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.4);
    }
  }
}
</style>
