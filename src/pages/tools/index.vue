<template>
  <PageLayout title="工作间" :show-nav="false" :nav-back="false">
    <view class="tools-page">
      <NavBarBase
        :nav-back="false"
        custom-class="tools-navbar"
        :custom-style="{ background: 'var(--theme-surface)', borderBottom: '1rpx solid var(--theme-border)' }">
        <template #title>
          <view class="tools-navbar-content">
            <!-- <image class="navbar-logo" src="/static/logo.png" mode="aspectFit" /> -->
            <view class="tools-navbar-copy">
              <text class="navbar-title-single">工作间</text>
              <!-- <text class="navbar-subtitle">WORKSPACES</text> -->
            </view>
          </view>
        </template>
      </NavBarBase>

      <!-- <view class="section section--summary">
        <view class="summary-card">
          <text class="summary-title">工作间</text>
          <text class="summary-desc">{{ availableTools.length }} 个{{ platformLabel }}可用工具，按工作间归档。</text>
        </view>
      </view> -->

      <view v-for="workspace in visibleWorkspaces" :key="workspace.key" class="section section--catalog">
        <view class="catalog-card">
          <view class="catalog-head" @click="toggleWorkspaceFold(workspace.key)">
            <view class="catalog-head-main">
              <view class="catalog-title-row">
                <text class="catalog-title">{{ workspace.name }}</text>
                <text class="catalog-subtitle">{{ workspace.subtitle }}</text>
              </view>
              <text class="catalog-brief">{{ workspace.summary }}</text>
            </view>
            <view class="fold-arrow" :class="{ folded: isFolded(workspace.key) }">
              <uni-icons type="down" size="18" color="var(--theme-text-tertiary)" />
            </view>
          </view>

          <view v-if="!isFolded(workspace.key)" class="catalog-body">
            <view v-if="workspace.directoryLayout === 'grid'" class="tools-grid">
              <view
                v-for="item in getToolsByWorkspace(workspace.key)"
                :key="item.key"
                :class="['tool-card', { disabled: item.tool.disabled }]"
                @click="handleToolClick(item.key, item.tool)">
                <view class="tool-card-top">
                  <view class="tool-icon-wrapper" :style="{ background: item.tool.gradient }">
                    <image v-if="item.tool.image" class="tool-entry-image" :src="item.tool.image" mode="aspectFit" />
                    <uni-icons v-else-if="item.tool.icon" :type="item.tool.icon as any" size="20" color="#fff" />
                  </view>
                  <view v-if="item.tool.isNew" class="tool-badge">NEW</view>
                </view>
                <text class="tool-name">{{ item.tool.name }}</text>
                <text class="tool-desc">{{ item.tool.desc }}</text>
              </view>
            </view>

            <view v-else class="tools-list">
              <view
                v-for="item in getToolsByWorkspace(workspace.key)"
                :key="item.key"
                :class="['tool-list-item', { disabled: item.tool.disabled }]"
                @click="handleToolClick(item.key, item.tool)">
                <view class="tool-icon-wrapper mini" :style="{ background: item.tool.gradient }">
                  <image v-if="item.tool.image" class="tool-entry-image tool-entry-image--mini" :src="item.tool.image" mode="aspectFit" />
                  <uni-icons v-else-if="item.tool.icon" :type="item.tool.icon as any" size="18" color="#fff" />
                </view>
                <view class="tool-content">
                  <text class="tool-name">{{ item.tool.name }}</text>
                  <text class="tool-desc">{{ item.tool.desc }}</text>
                </view>
                <text v-if="item.tool.requiresAuth" class="tool-meta">需登录</text>
                <text v-else-if="item.tool.disabled" class="tool-meta">开发中</text>
                <uni-icons v-else type="right" size="14" color="var(--theme-text-tertiary)" />
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="footer">
        <!-- <text class="footer-note">完整入口保留在工具页，首页专注工作台。</text> -->
        <text class="icp-text">粤ICP备2025489016号-2</text>
      </view>

      <!-- #ifdef H5 -->
      <H5TabBar current="tools" />
      <!-- #endif -->
    </view>
  </PageLayout>
</template>

<script setup lang="ts">
  import NavBarBase from '@/components/nav-bar-base.vue'
  import H5TabBar from '@/components/h5-tab-bar.vue'
  import { useShare } from '@/utils/share'
  import { useToolDirectory } from '@/hooks/use-tool-directory'

  const { availableTools, visibleWorkspaces, platformLabel, getToolsByWorkspace, isFolded, toggleWorkspaceFold, handleToolClick } =
    useToolDirectory()

  const { onShareAppMessage, onShareTimeline } = useShare('tools', {
    title: '工作间 · 凉白开工具箱',
    path: '/pages/tools/index',
  })

  defineExpose({ onShareAppMessage, onShareTimeline })
</script>

<style lang="scss" scoped>
  $bg-color: var(--theme-bg);
  $card-bg: var(--theme-surface);
  $card-muted: var(--theme-surface-2);
  $text-primary: var(--theme-text);
  $text-secondary: var(--theme-text-secondary);
  $text-hint: var(--theme-text-tertiary);
  $border-color: var(--theme-border);
  $brand-color: var(--theme-brand);
  $radius-md: 24rpx;
  $radius-lg: 34rpx;
  $shadow-card: 0 10rpx 34rpx var(--theme-shadow-xs);

  .tools-page {
    min-height: 100vh;
    background:
      radial-gradient(circle at top center, rgba(0, 70, 180, 0.08), transparent 30%),
      linear-gradient(180deg, rgba(0, 70, 180, 0.03), transparent 22%), $bg-color;
    overflow-x: hidden;

    /* #ifdef H5 */
    padding-bottom: 140rpx;
    /* #endif */
  }

  .tools-navbar-content {
    display: flex;
    align-items: center;
    gap: 14rpx;
  }

  .navbar-logo {
    width: 56rpx;
    height: 56rpx;
    border-radius: 14rpx;
  }

  .tools-navbar-copy {
    display: flex;
    flex-direction: column;
    gap: 2rpx;
  }

  .navbar-title-single {
    color: var(--theme-text);
    font-size: 30rpx;
    font-weight: 700;
  }

  .navbar-subtitle {
    color: var(--theme-text-tertiary);
    font-size: 18rpx;
    letter-spacing: 2rpx;
  }

  .section {
    padding: 24rpx 24rpx 0;
  }

  .section--summary {
    padding-top: 24rpx;
  }

  .section--catalog {
    padding-top: 18rpx;
  }

  .summary-card,
  .catalog-card {
    border-radius: $radius-lg;
    background: $card-bg;
    border: 1rpx solid $border-color;
    box-shadow: $shadow-card;
  }

  .summary-card {
    padding: 24rpx;
  }

  .summary-title {
    display: block;
    color: $text-primary;
    font-size: 30rpx;
    font-weight: 700;
  }

  .summary-desc {
    display: block;
    margin-top: 10rpx;
    color: $text-secondary;
    font-size: 22rpx;
    line-height: 1.55;
  }

  .catalog-card {
    overflow: hidden;
  }

  .catalog-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18rpx;
    padding: 24rpx;
  }

  .catalog-head-main {
    min-width: 0;
  }

  .catalog-title-row {
    display: flex;
    align-items: center;
    gap: 14rpx;
  }

  .catalog-title {
    color: $text-primary;
    font-size: 30rpx;
    font-weight: 700;
  }

  .catalog-subtitle {
    color: $text-hint;
    font-size: 18rpx;
    letter-spacing: 2rpx;
  }

  .catalog-brief {
    display: block;
    margin-top: 10rpx;
    color: $text-secondary;
    font-size: 22rpx;
    line-height: 1.55;
  }

  .fold-arrow {
    padding-top: 6rpx;
    transition: transform 0.24s ease;
    flex-shrink: 0;
  }

  .fold-arrow.folded {
    transform: rotate(-90deg);
  }

  .catalog-body {
    padding: 0 24rpx 24rpx;
  }

  .tools-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14rpx 12rpx;
  }

  .tool-card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 166rpx;
    padding: 22rpx 12rpx 18rpx;
    border-radius: 22rpx;
    background: $card-muted;
    border: 1rpx solid transparent;
    transition:
      transform 0.2s ease,
      border-color 0.2s ease,
      background-color 0.2s ease;

    &:active {
      transform: scale(0.98);
      border-color: rgba(0, 70, 180, 0.22);
      background: $card-bg;
    }
  }

  .tool-card.disabled,
  .tool-list-item.disabled {
    opacity: 0.6;
  }

  .tool-card-top {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
  }

  .tool-icon-wrapper {
    width: 66rpx;
    height: 66rpx;
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 8rpx 18rpx rgba(15, 23, 42, 0.08);
  }

  .tool-icon-wrapper.mini {
    width: 48rpx;
    height: 48rpx;
    border-radius: 14rpx;
  }

  .tool-entry-image {
    width: 88rpx;
    height: 64rpx;
  }

  .tool-entry-image--mini {
    width: 64rpx;
    height: 44rpx;
  }

  .tool-badge {
    position: absolute;
    top: 12rpx;
    right: 12rpx;
    padding: 6rpx 12rpx;
    border-radius: 999rpx;
    background: rgba(0, 70, 180, 0.12);
    color: $brand-color;
    font-size: 16rpx;
    font-weight: 600;
    line-height: 1;
  }

  .tool-card .tool-name {
    display: block;
    width: 100%;
    margin-top: 14rpx;
    color: $text-primary;
    font-size: 24rpx;
    font-weight: 700;
    line-height: 1.34;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tool-card .tool-desc {
    display: block;
    width: 100%;
    margin-top: 6rpx;
    color: $text-secondary;
    font-size: 19rpx;
    line-height: 1.35;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tool-list-item .tool-name {
    display: block;
    color: $text-primary;
    font-size: 26rpx;
    font-weight: 600;
    line-height: 1.34;
  }

  .tool-list-item .tool-desc {
    display: block;
    margin-top: 8rpx;
    color: $text-secondary;
    font-size: 21rpx;
    line-height: 1.5;
  }

  .tools-list {
    display: grid;
    gap: 10rpx;
  }

  .tool-list-item {
    display: flex;
    align-items: center;
    gap: 14rpx;
    padding: 18rpx;
    border-radius: $radius-md;
    background: $card-muted;
  }

  .tool-content {
    flex: 1;
    min-width: 0;
  }

  .tool-meta {
    color: $text-hint;
    font-size: 20rpx;
    flex-shrink: 0;
  }

  .footer {
    padding: 48rpx 24rpx 34rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12rpx;
  }

  .footer-note {
    color: $brand-color;
    font-size: 22rpx;
  }

  .icp-text {
    color: $text-hint;
    font-size: 22rpx;
  }
</style>
