<script setup lang="ts">
  import { ref } from 'vue'
  import type { WorkspaceConfig, WorkspaceKey } from '@/config/workspaces'

  interface Props {
    currentWorkspace: WorkspaceConfig
    workspaces: WorkspaceConfig[]
  }

  defineProps<Props>()

  const emit = defineEmits<{
    select: [workspace: WorkspaceKey]
  }>()

  const opened = ref(false)

  const toggle = () => {
    opened.value = !opened.value
  }

  const close = () => {
    opened.value = false
  }

  const selectWorkspace = (workspace: WorkspaceKey) => {
    emit('select', workspace)
    close()
  }
</script>

<template>
  <view class="workspace-switcher">
    <view v-if="opened" class="workspace-mask" @click="close" />
    <view class="workspace-trigger" @click="toggle">
      <image class="workspace-logo" src="/static/logo.png" mode="aspectFit" />
      <text class="workspace-name">{{ currentWorkspace.name }}</text>
      <uni-icons :type="opened ? 'up' : 'down'" size="15" color="var(--theme-text-secondary)" />
    </view>

    <view v-if="opened" class="workspace-menu">
      <scroll-view class="workspace-scroll" scroll-y>
        <view
          v-for="workspace in workspaces"
          :key="workspace.key"
          class="workspace-option"
          :class="{ 'workspace-option--active': workspace.key === currentWorkspace.key }"
          @click="selectWorkspace(workspace.key)">
          <view class="option-icon">
            <uni-icons
              :type="workspace.icon as any"
              size="19"
              :color="workspace.key === currentWorkspace.key ? 'var(--theme-brand)' : 'var(--theme-text-secondary)'" />
          </view>
          <text class="option-name">{{ workspace.name }}</text>
          <uni-icons v-if="workspace.key === currentWorkspace.key" type="checkmarkempty" size="19" color="var(--theme-brand)" />
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
  .workspace-switcher {
    position: relative;
  }

  .workspace-mask {
    position: fixed;
    z-index: 1;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: var(--theme-mask);
  }

  .workspace-trigger {
    position: relative;
    z-index: 3;
    display: flex;
    min-height: 64rpx;
    padding: 0 12rpx 0 0;
    align-items: center;
    gap: 12rpx;
    border-radius: 18rpx;
  }

  .workspace-trigger:active {
    opacity: 0.78;
  }

  .workspace-logo {
    width: 52rpx;
    height: 52rpx;
    border-radius: 12rpx;
  }

  .workspace-name {
    max-width: 220rpx;
    overflow: hidden;
    color: var(--theme-text);
    font-size: 32rpx;
    font-weight: 650;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .workspace-menu {
    position: absolute;
    z-index: 4;
    top: 76rpx;
    left: 0;
    width: 430rpx;
    overflow: hidden;
    border: 1rpx solid var(--theme-border);
    border-radius: 24rpx;
    background: var(--theme-elevated);
    box-shadow: 0 18rpx 56rpx var(--theme-shadow-md);
  }

  .workspace-scroll {
    max-height: 620rpx;
  }

  .workspace-option {
    display: flex;
    min-height: 92rpx;
    padding: 12rpx 22rpx;
    align-items: center;
    gap: 16rpx;
    box-sizing: border-box;

    & + & {
      border-top: 1rpx solid var(--theme-border);
    }
  }

  .workspace-option:active,
  .workspace-option--active {
    background: var(--theme-surface-2);
  }

  .option-icon {
    display: flex;
    width: 56rpx;
    height: 56rpx;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-radius: 16rpx;
    background: var(--theme-surface-2);
  }

  .option-name {
    flex: 1;
    color: var(--theme-text);
    font-size: 28rpx;
    font-weight: 500;
  }

  .workspace-option--active .option-name {
    color: var(--theme-brand);
    font-weight: 650;
  }
</style>
