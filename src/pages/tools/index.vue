<template>
  <PageLayout title="工具库" :show-nav="false" :nav-back="false">
    <view class="tools-page">
      <NavBarBase :nav-back="false" custom-class="tools-navbar" :custom-style="{ background: navbarBg }">
        <template #title>
          <view class="tools-navbar-content">
            <image class="navbar-logo" src="/static/logo.png" mode="aspectFit" />
            <view class="tools-navbar-copy">
              <text class="navbar-title-single">工具库</text>
              <text class="navbar-subtitle">TOOL DIRECTORY</text>
            </view>
          </view>
        </template>
      </NavBarBase>

      <view class="section section--summary">
        <view class="summary-card">
          <text class="summary-title">工具大全</text>
          <!-- <text class="summary-desc">{{ availableTools.length }} 个工具，按任务域归档。这里不放工作台、最近使用，只保留完整目录。</text> -->
        </view>
      </view>

      <view v-for="cat in visibleCategories" :key="cat.key" class="section section--catalog">
        <view class="catalog-card">
          <view class="catalog-head" @click="toggleCategoryFold(cat.key)">
            <view class="catalog-head-main">
              <view class="catalog-title-row">
                <text class="catalog-title">{{ cat.name }}</text>
                <text class="catalog-subtitle">{{ cat.subtitle }}</text>
              </view>
              <text class="catalog-brief">{{ getCategorySummary(cat.key) }}</text>
            </view>
            <view class="fold-arrow" :class="{ folded: isFolded(cat.key) }">
              <uni-icons type="down" size="18" color="var(--theme-text-tertiary)" />
            </view>
          </view>

          <view v-if="!isFolded(cat.key)" class="catalog-body">
            <view v-if="cat.layout === 'grid'" class="tools-grid">
              <view
                v-for="item in getToolsByCategory(cat.key)"
                :key="item.key"
                :class="['tool-card', { disabled: item.tool.disabled }]"
                @click="handleToolClick(item.key, item.tool)">
                <view class="tool-card-top">
                  <view class="tool-icon-wrapper" :style="{ background: item.tool.gradient }">
                    <uni-icons :type="item.tool.icon as any" size="20" color="#fff" />
                  </view>
                  <view v-if="item.tool.isNew" class="tool-badge">NEW</view>
                </view>
                <text class="tool-name">{{ item.tool.name }}</text>
                <text class="tool-desc">{{ item.tool.desc }}</text>
              </view>
            </view>

            <view v-else class="tools-list">
              <view
                v-for="item in getToolsByCategory(cat.key)"
                :key="item.key"
                :class="['tool-list-item', { disabled: item.tool.disabled }]"
                @click="handleToolClick(item.key, item.tool)">
                <view class="tool-icon-wrapper mini" :style="{ background: item.tool.gradient }">
                  <uni-icons :type="item.tool.icon as any" size="18" color="#fff" />
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

  const { navbarBg, availableTools, visibleCategories, getToolsByCategory, getCategorySummary, isFolded, toggleCategoryFold, handleToolClick } =
    useToolDirectory()

  const { onShareAppMessage, onShareTimeline } = useShare('tools', {
    title: 'uni-demo · 工具库',
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
      linear-gradient(180deg, rgba(0, 70, 180, 0.03), transparent 22%),
      $bg-color;
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
    color: #fff;
    font-size: 30rpx;
    font-weight: 700;
  }

  .navbar-subtitle {
    color: rgba(255, 255, 255, 0.62);
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
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14rpx;
  }

  .tool-card {
    min-height: 188rpx;
    padding: 20rpx;
    border-radius: $radius-md;
    background: $card-muted;
  }

  .tool-card.disabled,
  .tool-list-item.disabled {
    opacity: 0.6;
  }

  .tool-card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12rpx;
  }

  .tool-icon-wrapper {
    width: 54rpx;
    height: 54rpx;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .tool-icon-wrapper.mini {
    width: 48rpx;
    height: 48rpx;
    border-radius: 14rpx;
  }

  .tool-badge {
    padding: 6rpx 12rpx;
    border-radius: 999rpx;
    background: rgba(0, 70, 180, 0.12);
    color: $brand-color;
    font-size: 18rpx;
    font-weight: 600;
  }

  .tool-name {
    display: block;
    color: $text-primary;
    font-size: 26rpx;
    font-weight: 600;
    line-height: 1.34;
  }

  .tool-desc {
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
