<template>
  <PageLayout title="工作台" :show-nav="false" :nav-back="false">
    <view :class="['home-page', { 'home-page--dark': isDark }]">
      <NavBarBase :nav-back="false" custom-class="home-navbar" :custom-style="{ background: navbarBg }">
        <template #title>
          <view class="home-navbar-content">
            <image class="navbar-logo" src="/static/logo.png" mode="aspectFit" />
            <view class="home-navbar-copy">
              <text class="navbar-title-single">工作台</text>
              <text class="navbar-subtitle">WORKBENCH</text>
            </view>
          </view>
        </template>
      </NavBarBase>

      <view class="section section--workbench">
        <view class="section-header">
          <text class="section-title">工作台</text>
          <view class="section-link" @click="openToolsTab">
            <text class="section-link-text">全部工具</text>
            <uni-icons type="right" size="14" color="var(--theme-text-tertiary)" />
          </view>
        </view>

        <view class="workbench-panel">
          <view class="workbench-strip">
            <text v-for="chip in workbenchChips" :key="chip" class="workbench-chip">{{ chip }}</text>
          </view>

          <view class="workbench-grid">
            <view v-for="item in workbenchTools" :key="item.key" class="workbench-card" @click="handleToolClick(item.key, item.tool)">
              <view class="workbench-icon" :style="{ background: item.tool.gradient }">
                <uni-icons :type="item.tool.icon as any" size="20" color="#fff" />
              </view>
              <text class="workbench-name">{{ item.tool.name }}</text>
              <text class="workbench-desc">{{ item.tool.desc }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="section">
        <view class="section-header">
          <text class="section-title">推荐流程</text>
        </view>

        <view class="workflow-list">
          <view
            v-for="workflow in workflowScenes"
            :key="workflow.id"
            :class="['workflow-card', `workflow-card--${workflow.tone}`]"
            @click="handleToolClick(workflow.primary.key, workflow.primary.tool)">
            <view class="workflow-head">
              <text class="workflow-kicker">{{ workflow.kicker }}</text>
              <uni-icons type="right" size="14" color="rgba(255, 255, 255, 0.72)" />
            </view>
            <text class="workflow-title">{{ workflow.title }}</text>
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

      <!-- #ifdef MP-WEIXIN -->
      <PrivacyPopup />
      <!-- #endif -->
    </view>
  </PageLayout>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { storeToRefs } from 'pinia'
  import NavBarBase from '@/components/nav-bar-base.vue'
  import H5TabBar from '@/components/h5-tab-bar.vue'
  import PrivacyPopup from '@/components/privacy-popup.vue'
  import { useThemeStore } from '@/stores/theme'
  import { useShare } from '@/utils/share'
  import { useToolDirectory } from '@/hooks/use-tool-directory'

  const { isDark } = storeToRefs(useThemeStore())
  const { navbarBg, loggedIn, workbenchTools, platformLabel, workflowScenes, openLogin, handleToolClick } = useToolDirectory()

  const workbenchChips = computed(() => {
    const chips = [platformLabel.value]
    chips.push(loggedIn.value ? '最近使用' : '默认常用')
    return chips
  })

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

  .home-page {
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

  .home-page--dark {
    background:
      radial-gradient(circle at top center, rgba(56, 189, 248, 0.08), transparent 30%),
      linear-gradient(180deg, rgba(15, 23, 42, 0.03), transparent 22%),
      $bg-color;
  }

  .home-navbar-content {
    display: flex;
    align-items: center;
    gap: 14rpx;
  }

  .navbar-logo {
    width: 56rpx;
    height: 56rpx;
    border-radius: 14rpx;
  }

  .home-navbar-copy {
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

  .section--workbench {
    padding-top: 24rpx;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
    margin-bottom: 18rpx;
  }

  .section-title {
    color: $text-primary;
    font-size: 32rpx;
    font-weight: 700;
  }

  .section-link {
    display: flex;
    align-items: center;
    gap: 4rpx;
  }

  .section-link-text {
    color: $text-hint;
    font-size: 22rpx;
  }

  .workbench-panel {
    border-radius: 32rpx;
    background: $card-bg;
    border: 1rpx solid $border-color;
    box-shadow: $shadow-card;
    padding: 22rpx;
  }

  .workbench-strip {
    display: flex;
    flex-wrap: wrap;
    gap: 10rpx;
    margin-bottom: 18rpx;
  }

  .workbench-chip {
    padding: 8rpx 16rpx;
    border-radius: 999rpx;
    background: $card-muted;
    color: $text-secondary;
    font-size: 20rpx;
  }

  .workbench-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14rpx;
  }

  .workbench-card {
    min-height: 188rpx;
    padding: 20rpx;
    border-radius: $radius-md;
    background: $card-muted;
  }

  .workbench-icon {
    width: 56rpx;
    height: 56rpx;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .workbench-name {
    display: block;
    margin-top: 18rpx;
    color: $text-primary;
    font-size: 28rpx;
    font-weight: 700;
    line-height: 1.32;
  }

  .workbench-desc {
    display: block;
    margin-top: 10rpx;
    color: $text-secondary;
    font-size: 21rpx;
    line-height: 1.5;
  }

  .workflow-list {
    display: grid;
    gap: 14rpx;
  }

  .workflow-card {
    padding: 24rpx 22rpx;
    border-radius: 28rpx;
    color: #f8fafc;
    box-shadow: 0 16rpx 42rpx rgba(15, 23, 42, 0.14);
  }

  .workflow-card--cyan {
    background: linear-gradient(145deg, #0f766e, #06b6d4);
  }

  .workflow-card--slate {
    background: linear-gradient(145deg, #334155, #0f172a);
  }

  .workflow-kicker {
    display: block;
    color: rgba(255, 255, 255, 0.72);
    font-size: 18rpx;
    letter-spacing: 2rpx;
  }

  .workflow-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12rpx;
  }

  .workflow-title {
    display: block;
    margin-top: 14rpx;
    font-size: 30rpx;
    font-weight: 700;
    line-height: 1.35;
  }

  .workflow-steps {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8rpx;
    margin-top: 18rpx;
  }

  .workflow-step,
  .workflow-sep {
    color: rgba(255, 255, 255, 0.82);
    font-size: 21rpx;
  }

  .footer {
    padding: 48rpx 24rpx 34rpx;
    display: flex;
    justify-content: center;
  }

  .icp-text {
    color: $text-hint;
    font-size: 22rpx;
  }
</style>
