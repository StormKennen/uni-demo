<template>
  <PageLayout :title="currentWorkspaceConfig.name" :show-nav="false" :nav-back="false">
    <view :class="['home-page', { 'home-page--dark': isDark }]">
      <NavBarBase :nav-back="false" custom-class="home-navbar" :custom-style="navbarStyle">
        <template #title>
          <HomeWorkspaceSwitcher :current-workspace="currentWorkspaceConfig" :workspaces="workspaceOptions" @select="selectWorkspace" />
        </template>
      </NavBarBase>

      <template v-if="currentWorkspace === 'workbench'">
        <view class="section section--workbench">
          <view class="section-header">
            <text class="section-title">常用工具</text>
            <view class="section-link" @click="openToolsTab">
              <text class="section-link-text">全部工作间</text>
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
      </template>

      <view v-else-if="currentWorkspace === 'swc'" class="section section--workspace">
        <!-- <view class="workspace-heading">
          <text class="section-title">魔灵召唤</text>
          <text class="workspace-summary">{{ currentWorkspaceConfig.summary }}</text>
        </view> -->
        <view class="portal-list">
          <view v-for="entry in SWC_PORTAL_ENTRIES" :key="entry.id" class="portal-card" @click="openSwcEntry(entry.path)">
            <view class="portal-icon" :style="{ background: entry.accentSoft }">
              <uni-icons :type="entry.icon as any" size="22" :color="entry.accent" />
            </view>
            <view class="portal-main">
              <text class="portal-title">{{ entry.title }}</text>
              <text class="portal-desc">{{ entry.desc }}</text>
            </view>
            <uni-icons type="right" size="15" color="var(--theme-text-tertiary)" />
          </view>
        </view>
      </view>

      <view v-else class="section section--workspace">
        <!-- <view class="workspace-heading">
          <text class="section-title">{{ currentWorkspaceConfig.name }}</text>
          <text class="workspace-summary">{{ currentWorkspaceConfig.summary }}</text>
        </view> -->
        <HomeWorkspaceToolList :tools="currentWorkspaceTools" @select="openWorkspaceTool" />
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
  import { computed, ref } from 'vue'
  import { onLoad, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
  import { storeToRefs } from 'pinia'
  import HomeWorkspaceSwitcher from './components/HomeWorkspaceSwitcher.vue'
  import HomeWorkspaceToolList from './components/HomeWorkspaceToolList.vue'
  import NavBarBase from '@/components/nav-bar-base.vue'
  import H5TabBar from '@/components/h5-tab-bar.vue'
  import { useThemeStore } from '@/stores/theme'
  import { useToolDirectory, type KeyedToolItem } from '@/hooks/use-tool-directory'
  import { SWC_PORTAL_ENTRIES } from '@/config/swc-portal'
  import { WORKSPACES, WORKSPACE_MAP, isWorkspaceKey, type WorkspaceConfig, type WorkspaceKey } from '@/config/workspaces'
  import { getCurrentWorkspace, getWorkspaceManualSelected, setCurrentWorkspace, setWorkspaceManualSelected } from '@/utils/storage'
  import { reportToolVisit } from '@/utils/tracker'

  const { isDark } = storeToRefs(useThemeStore())
  const {
    recentTools,
    workbenchTools,
    workflowScenes,
    visibleWorkspaces,
    getToolsByWorkspace,
    openLogin,
    handleToolClick,
    handleWorkflowClick,
  } = useToolDirectory()

  const currentWorkspace = ref<WorkspaceKey>('workbench')
  const manualWorkspaceSelected = ref(getWorkspaceManualSelected())

  const hasRecentTools = computed(() => recentTools.value.length > 0)
  const currentWorkspaceConfig = computed(() => WORKSPACE_MAP[currentWorkspace.value])
  const availableWorkspaceKeys = computed(() => {
    const keys = new Set<WorkspaceKey>(['workbench'])
    visibleWorkspaces.value.forEach(workspace => {
      if (workspace.key !== 'swc') keys.add(workspace.key)
    })
    if (SWC_PORTAL_ENTRIES.length > 0) keys.add('swc')
    return keys
  })
  const workspaceOptions = computed<WorkspaceConfig[]>(() => {
    return WORKSPACES.filter(workspace => availableWorkspaceKeys.value.has(workspace.key)).sort(
      (left, right) => left.defaultOrder - right.defaultOrder,
    )
  })
  const currentWorkspaceTools = computed(() => getToolsByWorkspace(currentWorkspace.value))

  const navbarStyle = computed(() => ({
    background: 'var(--theme-surface)',
    borderBottom: '1rpx solid var(--theme-border)',
  }))

  const selectWorkspace = (nextWorkspace: WorkspaceKey) => {
    if (nextWorkspace === currentWorkspace.value || !availableWorkspaceKeys.value.has(nextWorkspace)) return
    currentWorkspace.value = nextWorkspace
    setCurrentWorkspace(nextWorkspace)
    manualWorkspaceSelected.value = true
    setWorkspaceManualSelected(true)
  }

  const openWorkspaceTool = (item: KeyedToolItem) => {
    handleToolClick(item.key, item.tool)
  }

  const openSwcEntry = (path: string) => {
    reportToolVisit('compendium-swc')
    uni.navigateTo({ url: path })
  }

  const openToolsTab = () => {
    uni.switchTab({ url: '/pages/tools/index' })
  }

  const resolveInitialWorkspace = (sharedWorkspace: unknown): WorkspaceKey => {
    if (isWorkspaceKey(sharedWorkspace) && availableWorkspaceKeys.value.has(sharedWorkspace)) return sharedWorkspace
    const savedWorkspace = getCurrentWorkspace()
    return availableWorkspaceKeys.value.has(savedWorkspace) ? savedWorkspace : 'workbench'
  }

  const buildWorkspaceShare = () => {
    const workspace = currentWorkspaceConfig.value
    const title =
      workspace.key === 'workbench'
        ? '凉白开工具箱 · 工作台'
        : workspace.key === 'swc'
          ? '魔灵召唤 · 凉白开工具箱'
          : `${workspace.name}工作间 · 凉白开工具箱`
    return {
      title,
      path: `/pages/index/index?workspace=${workspace.key}`,
      imageUrl: '/static/logo.png',
    }
  }

  onLoad((options: Record<string, string | undefined>) => {
    const sharedWorkspace =
      isWorkspaceKey(options.workspace) && availableWorkspaceKeys.value.has(options.workspace) ? options.workspace : undefined
    currentWorkspace.value = resolveInitialWorkspace(sharedWorkspace)
    if (sharedWorkspace && !manualWorkspaceSelected.value) setCurrentWorkspace(sharedWorkspace)
  })

  // #ifdef MP-WEIXIN
  onShareAppMessage(() => buildWorkspaceShare())
  onShareTimeline(() => {
    const config = buildWorkspaceShare()
    return {
      title: config.title,
      query: `workspace=${currentWorkspace.value}`,
      imageUrl: config.imageUrl,
    }
  })
  // #endif

  function toolAccent(gradient: string): { color: string; soft: string } {
    const match = gradient.match(/#([0-9a-fA-F]{6})/)
    const color = match ? `#${match[1]}` : 'var(--theme-brand)'
    if (!match) return { color, soft: 'var(--theme-surface-2)' }
    const r = parseInt(match[1].slice(0, 2), 16)
    const g = parseInt(match[1].slice(2, 4), 16)
    const b = parseInt(match[1].slice(4, 6), 16)
    return { color, soft: `rgba(${r}, ${g}, ${b}, 0.14)` }
  }

  defineExpose({ openLogin })
</script>

<style lang="scss" scoped>
  .home-page {
    min-height: 100vh;
    overflow-x: hidden;
    background: var(--theme-bg);

    /* #ifdef H5 */
    padding-bottom: 140rpx;
    /* #endif */
  }

  .section {
    padding: 32rpx 32rpx 0;
  }

  .section--workspace {
    padding-top: 28rpx;
  }

  .section-header {
    display: flex;
    margin-bottom: 20rpx;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
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
    min-height: 168rpx;
    padding: 22rpx 14rpx 20rpx;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 1rpx solid var(--theme-border);
    border-radius: 22rpx;
    background: var(--theme-surface);
    box-shadow: 0 8rpx 22rpx var(--theme-shadow-xs);
  }

  .tool-card:active {
    border-color: var(--theme-brand);
    background: var(--theme-surface-2);
    transform: scale(0.98);
  }

  .tool-icon {
    display: flex;
    width: 76rpx;
    height: 76rpx;
    align-items: center;
    justify-content: center;
    border-radius: 22rpx;
    background: var(--theme-surface-2);
  }

  .tool-name,
  .tool-desc {
    display: block;
    width: 100%;
    overflow: hidden;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tool-name {
    margin-top: 16rpx;
    color: var(--theme-text);
    font-size: 25rpx;
    font-weight: 700;
  }

  .tool-desc {
    margin-top: 6rpx;
    color: var(--theme-text-tertiary);
    font-size: 20rpx;
  }

  .workflow-list,
  .portal-list {
    display: grid;
    gap: 16rpx;
  }

  .workflow-card,
  .portal-card {
    border: 1rpx solid var(--theme-border);
    border-radius: 20rpx;
    background: var(--theme-surface);
  }

  .workflow-card {
    padding: 26rpx 24rpx;
  }

  .workflow-card:active,
  .portal-card:active {
    border-color: var(--theme-brand);
    background: var(--theme-surface-2);
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
    margin-top: 18rpx;
    align-items: center;
    flex-wrap: wrap;
    gap: 10rpx;
  }

  .workflow-step {
    padding: 6rpx 14rpx;
    border-radius: 999rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text-secondary);
    font-size: 21rpx;
  }

  .workflow-sep {
    color: var(--theme-text-tertiary);
    font-size: 21rpx;
  }

  .workspace-heading {
    display: flex;
    margin-bottom: 22rpx;
    flex-direction: column;
    gap: 8rpx;
  }

  .workspace-summary {
    color: var(--theme-text-secondary);
    font-size: 24rpx;
  }

  .portal-card {
    display: flex;
    padding: 24rpx;
    align-items: center;
    gap: 18rpx;
  }

  .portal-icon {
    display: flex;
    width: 68rpx;
    height: 68rpx;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-radius: 19rpx;
  }

  .portal-main {
    display: flex;
    min-width: 0;
    flex: 1;
    flex-direction: column;
    gap: 7rpx;
  }

  .portal-title {
    color: var(--theme-text);
    font-size: 29rpx;
    font-weight: 650;
  }

  .portal-desc {
    overflow: hidden;
    color: var(--theme-text-secondary);
    font-size: 23rpx;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .footer {
    display: flex;
    padding: 56rpx 32rpx 40rpx;
    justify-content: center;
  }

  .icp-text {
    color: var(--theme-text-tertiary);
    font-size: 22rpx;
  }
</style>
