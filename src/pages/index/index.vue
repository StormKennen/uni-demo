<template>
  <PageLayout title="工作台" :show-nav="false" :nav-back="false">
    <view :class="['home-page', { 'home-page--dark': isDark }]">
      <NavBarBase :nav-back="false" custom-class="home-navbar" :custom-style="navbarStyle">
        <template #title>
          <view class="home-navbar-content">
            <image class="navbar-logo" src="/static/logo.png" mode="aspectFit" />
            <text class="navbar-title">工作台</text>
          </view>
        </template>
      </NavBarBase>

      <view class="section section--workbench">
        <view class="section-header">
          <text class="section-title">常用工具</text>
          <view class="section-link" @click="openToolsTab">
            <text class="section-link-text">全部工具</text>
            <uni-icons type="right" size="14" color="var(--theme-text-tertiary)" />
          </view>
        </view>

        <text v-if="!hasRecentTools" class="workbench-hint">你最近使用过的工具会显示在这里</text>

        <view class="workbench-grid">
          <view v-for="item in workbenchTools" :key="item.key" class="tool-card" @click="handleToolClick(item.key, item.tool)">
            <view class="tool-icon" :style="{ background: toolAccent(item.tool.gradient).soft }">
              <uni-icons :type="item.tool.icon as any" size="22" :color="toolAccent(item.tool.gradient).color" />
            </view>
            <text class="tool-name">{{ item.tool.name }}</text>
            <text class="tool-desc">{{ item.tool.desc }}</text>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-header">
          <text class="section-title">推荐流程</text>
        </view>

        <view class="workflow-list">
          <view v-for="workflow in workflowScenes" :key="workflow.id" class="workflow-card" @click="handleWorkflowClick(workflow)">
            <view class="workflow-head">
              <text class="workflow-title">{{ workflow.label }}</text>
              <uni-icons type="right" size="14" color="var(--theme-brand)" />
            </view>
            <text class="workflow-benefit">{{ workflow.benefit }}</text>
            <view class="workflow-steps">
              <template v-for="(step, index) in workflow.steps" :key="step.key">
                <text class="workflow-step">{{ step.tool.name }}</text>
                <text v-if="index < workflow.steps.length - 1" class="workflow-sep">/</text>
              </template>
            </view>
          </view>
        </view>
      </view>

      <view class="footer">
        <text class="icp-text">粤ICP备2025489016号-2</text>
      </view>

      <!-- #ifdef H5 -->
      <H5TabBar current="index" />
      <!-- #endif -->
    </view>
  </PageLayout>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { storeToRefs } from 'pinia'
  import NavBarBase from '@/components/nav-bar-base.vue'
  import H5TabBar from '@/components/h5-tab-bar.vue'
  import { useThemeStore } from '@/stores/theme'
  import { useShare } from '@/utils/share'
  import { useToolDirectory } from '@/hooks/use-tool-directory'

  const { isDark } = storeToRefs(useThemeStore())
  const { recentTools, workbenchTools, workflowScenes, openLogin, handleToolClick, handleWorkflowClick } = useToolDirectory()

  const hasRecentTools = computed(() => recentTools.value.length > 0)

  // 从工具已有的 gradient 中取第一个功能识别色，派生「彩色图标 + 浅色底板」，不引入新数据字段
  function toolAccent(gradient: string): { color: string; soft: string } {
    const match = gradient.match(/#([0-9a-fA-F]{6})/)
    const color = match ? `#${match[1]}` : 'var(--theme-brand)'
    if (!match) return { color, soft: 'var(--theme-surface-2)' }
    const r = parseInt(match[1].slice(0, 2), 16)
    const g = parseInt(match[1].slice(2, 4), 16)
    const b = parseInt(match[1].slice(4, 6), 16)
    return { color, soft: `rgba(${r}, ${g}, ${b}, 0.14)` }
  }

  const navbarStyle = computed(() => ({
    background: 'var(--theme-surface)',
    borderBottom: '1rpx solid var(--theme-border)',
  }))

  function openToolsTab() {
    uni.switchTab({
      url: '/pages/tools/index',
    })
  }

  const { onShareAppMessage, onShareTimeline } = useShare('index', {
    title: 'uni-demo · 工具工作台',
    path: '/pages/index/index',
  })

  defineExpose({ onShareAppMessage, onShareTimeline, openLogin })
</script>

<style lang="scss" scoped>
  .home-page {
    min-height: 100vh;
    background: var(--theme-bg);
    overflow-x: hidden;

    /* #ifdef H5 */
    padding-bottom: 140rpx;
    /* #endif */
  }

  .home-navbar-content {
    display: flex;
    align-items: center;
    gap: 14rpx;
  }

  .navbar-logo {
    width: 52rpx;
    height: 52rpx;
    border-radius: 12rpx;
  }

  .navbar-title {
    color: var(--theme-text);
    font-size: 32rpx;
    font-weight: 600;
  }

  .section {
    padding: 32rpx 32rpx 0;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
    margin-bottom: 20rpx;
  }

  .section-title {
    color: var(--theme-text);
    font-size: 34rpx;
    font-weight: 700;
    letter-spacing: 0.5rpx;
  }

  .section-link {
    display: flex;
    align-items: center;
    gap: 4rpx;
  }

  .section-link-text {
    color: var(--theme-text-tertiary);
    font-size: 24rpx;
  }

  .workbench-hint {
    display: block;
    margin: -6rpx 0 18rpx;
    color: var(--theme-text-tertiary);
    font-size: 24rpx;
    line-height: 1.5;
  }

  .workbench-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14rpx;
  }

  .tool-card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 168rpx;
    padding: 22rpx 14rpx 20rpx;
    border-radius: 22rpx;
    background: var(--theme-surface);
    border: 1rpx solid var(--theme-border);
    box-shadow: 0 8rpx 22rpx var(--theme-shadow-xs);
    transition:
      transform 0.2s ease,
      border-color 0.2s ease,
      background-color 0.2s ease;

    &:active {
      transform: scale(0.98);
      border-color: var(--theme-brand);
      background: var(--theme-surface-2);
    }

    &::after {
      content: '';
      position: absolute;
      left: 28rpx;
      right: 28rpx;
      bottom: 0;
      height: 4rpx;
      border-radius: 999rpx 999rpx 0 0;
      background: var(--theme-border);
      opacity: 0.55;
    }
  }

  .tool-icon {
    width: 76rpx;
    height: 76rpx;
    border-radius: 22rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--theme-surface-2);
    box-shadow: inset 0 0 0 1rpx rgba(255, 255, 255, 0.24);
  }

  .tool-name {
    display: block;
    width: 100%;
    margin-top: 16rpx;
    color: var(--theme-text);
    font-size: 25rpx;
    font-weight: 700;
    line-height: 1.3;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tool-desc {
    display: block;
    width: 100%;
    margin-top: 6rpx;
    color: var(--theme-text-tertiary);
    font-size: 20rpx;
    line-height: 1.3;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .workflow-list {
    display: grid;
    gap: 16rpx;
  }

  .workflow-card {
    padding: 26rpx 24rpx;
    border-radius: 20rpx;
    background: var(--theme-surface);
    border: 1rpx solid var(--theme-border);
    transition:
      border-color 0.2s ease,
      background-color 0.2s ease;

    &:active {
      border-color: var(--theme-brand);
      background: var(--theme-surface-2);
    }
  }

  .workflow-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12rpx;
  }

  .workflow-title {
    color: var(--theme-text);
    font-size: 30rpx;
    font-weight: 700;
    line-height: 1.35;
  }

  .workflow-benefit {
    display: block;
    margin-top: 10rpx;
    color: var(--theme-text-secondary);
    font-size: 24rpx;
    line-height: 1.5;
  }

  .workflow-steps {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10rpx;
    margin-top: 18rpx;
  }

  .workflow-step {
    padding: 6rpx 14rpx;
    border-radius: 999rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text-secondary);
    font-size: 21rpx;
    line-height: 1.4;
  }

  .workflow-sep {
    color: var(--theme-text-tertiary);
    font-size: 21rpx;
  }

  .footer {
    padding: 56rpx 32rpx 40rpx;
    display: flex;
    justify-content: center;
  }

  .icp-text {
    color: var(--theme-text-tertiary);
    font-size: 22rpx;
  }
</style>
