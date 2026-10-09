<template>
  <PageLayout
    :title="pageTitle"
    :share-title="sharePayload.title"
    :share-path="sharePayload.path"
    :share-timeline-query="sharePayload.timelineQuery"
    :share-timeline-title="sharePayload.title"
    back-fallback="/subPackages/tools/altitude/index?mode=manual"
    nav-bg-color="var(--theme-surface)"
    nav-init-bg-color="var(--theme-surface)"
    nav-divider>
    <view class="detail-page">
      <view v-if="loading" class="state-card">正在加载景区海拔快照…</view>
      <view v-else-if="errorMessage" class="state-card error-state">
        <text>{{ errorMessage }}</text>
        <button class="retry-button" @click="loadProfile">重试</button>
      </view>
      <template v-else-if="profile">
        <view class="hero-card">
          <view class="hero-copy">
            <text class="hero-kicker">SCENIC SNAPSHOT</text>
            <text class="hero-title">{{ profile.area.name || areaName || '景区海拔' }}</text>
            <text class="hero-location">{{ areaLocation }}</text>
          </view>
          <view class="snapshot-badge">
            <uni-icons type="bars" size="22" color="var(--theme-brand)" />
            <text>海拔快照</text>
          </view>
        </view>

        <view class="summary-card">
          <view class="summary-item">
            <text class="summary-label">最低海拔</text>
            <text class="summary-value">{{ formatAltitude(profile.summary.minAltitudeMeters) }}</text>
          </view>
          <view class="summary-item">
            <text class="summary-label">最高海拔</text>
            <text class="summary-value">{{ formatAltitude(profile.summary.maxAltitudeMeters) }}</text>
          </view>
          <view class="summary-item">
            <text class="summary-label">景点数量</text>
            <text class="summary-value">{{ profile.summary.pointCount }}</text>
          </view>
        </view>

        <view class="notice-card">
          <uni-icons type="info" size="18" color="var(--theme-brand)" />
          <text>本页展示景区海拔快照数据，仅供参考；分享后可直接打开本景区页面。</text>
        </view>

        <view class="mode-tabs">
          <view class="mode-tab" :class="{ active: detailMode === 'points' }" @click="detailMode = 'points'">数据列表</view>
          <view class="mode-tab" :class="{ active: detailMode === 'chart' }" @click="detailMode = 'chart'">海拔图表</view>
        </view>

        <view v-if="!profile.points.length" class="state-card">该景区暂无可展示的景点海拔快照</view>
        <view v-else-if="detailMode === 'points'" class="points-card">
          <view v-for="point in profile.points" :key="point.pointId" class="point-row">
            <view class="point-copy">
              <text class="point-name">{{ point.name }}</text>
              <text class="point-caption">景区景点 · 快照数据</text>
            </view>
            <text class="point-altitude">{{ formatAltitude(point.altitudeMeters) }}</text>
          </view>
        </view>
        <ElevationProfileChart
          v-else
          :categories="profile.categories"
          :values="profile.series[0]?.data || []"
          :points="profile.points"
          :summary="profile.summary" />
      </template>
      <view v-else class="state-card">缺少景区参数，暂时无法打开景区海拔详情</view>
    </view>
  </PageLayout>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { onLoad, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
  import ElevationProfileChart from '../scenic/elevation-profile-chart.vue'
  import { unwrapApiData, type ScenicElevationProfileResponse } from '../scenic/models'
  import { buildScenicDetailShare, parseScenicDetailShare } from './scenic-share'
  import { getAreasAreaIdElevationProfile } from '@/services/apifox/NODEJSDEMO/SCENIC/apifox'

  const areaId = ref('')
  const areaName = ref('')
  const profile = ref<ScenicElevationProfileResponse | null>(null)
  const loading = ref(false)
  const errorMessage = ref('')
  const detailMode = ref<'points' | 'chart'>('points')

  const pageTitle = computed(() => profile.value?.area.name || areaName.value || '景区海拔')
  const areaLocation = computed(() => {
    const area = profile.value?.area
    if (!area) return '景区海拔快照数据'
    return [area.province, area.city, area.county].filter(Boolean).join(' · ') || '景区海拔快照数据'
  })
  const sharePayload = computed(() =>
    buildScenicDetailShare({
      areaId: areaId.value,
      areaName: profile.value?.area.name || areaName.value,
    }),
  )
  const formatAltitude = (value: number | null | undefined) =>
    typeof value === 'number' && Number.isFinite(value) ? `${Math.round(value)}m` : '--'

  onShareAppMessage(() => ({
    title: sharePayload.value.title,
    path: sharePayload.value.path,
  }))

  onShareTimeline(() => ({
    title: sharePayload.value.title,
    query: sharePayload.value.timelineQuery,
  }))

  const loadProfile = async () => {
    if (!areaId.value || loading.value) return
    loading.value = true
    errorMessage.value = ''
    try {
      const response = await getAreasAreaIdElevationProfile(encodeURIComponent(areaId.value))
      profile.value = unwrapApiData<ScenicElevationProfileResponse>(response)
    } catch {
      profile.value = null
      errorMessage.value = '景区海拔快照加载失败，请稍后重试'
    } finally {
      loading.value = false
    }
  }

  onLoad(async options => {
    const shared = parseScenicDetailShare((options || {}) as Record<string, string | undefined>)
    areaId.value = shared.areaId
    areaName.value = shared.areaName
    if (!areaId.value) {
      errorMessage.value = '缺少景区参数，暂时无法打开景区海拔详情'
      return
    }
    await loadProfile()
  })
</script>

<style scoped lang="scss">
  .detail-page {
    min-height: 100vh;
    padding: 24rpx;
    box-sizing: border-box;
    background: var(--theme-page-background);
  }

  .hero-card,
  .summary-card,
  .notice-card,
  .points-card,
  .state-card {
    border-radius: 24rpx;
    background: var(--theme-surface);
    box-shadow: var(--theme-shadow-card);
  }

  .hero-card {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18rpx;
    padding: 30rpx;
    background: linear-gradient(135deg, var(--theme-brand-soft), var(--theme-surface));
  }

  .hero-copy {
    min-width: 0;
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 8rpx;
  }

  .hero-kicker {
    color: var(--theme-brand);
    font-size: 19rpx;
    letter-spacing: 3rpx;
  }

  .hero-title {
    overflow: hidden;
    color: var(--theme-text-primary);
    font-size: 36rpx;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .hero-location,
  .point-caption {
    color: var(--theme-text-tertiary);
    font-size: 22rpx;
  }

  .snapshot-badge {
    display: flex;
    align-items: center;
    gap: 6rpx;
    flex-shrink: 0;
    padding: 10rpx 12rpx;
    border-radius: 12rpx;
    color: var(--theme-brand);
    background: var(--theme-surface);
    font-size: 20rpx;
  }

  .summary-card {
    display: flex;
    justify-content: space-between;
    gap: 12rpx;
    margin-top: 18rpx;
    padding: 24rpx;
  }

  .summary-item {
    min-width: 0;
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 8rpx;
  }

  .summary-label {
    color: var(--theme-text-tertiary);
    font-size: 21rpx;
  }

  .summary-value {
    overflow: hidden;
    color: var(--theme-text-primary);
    font-size: 28rpx;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .notice-card {
    display: flex;
    align-items: flex-start;
    gap: 10rpx;
    margin-top: 18rpx;
    padding: 18rpx 20rpx;
    color: var(--theme-text-secondary);
    font-size: 22rpx;
    line-height: 1.5;
  }

  .mode-tabs {
    display: flex;
    gap: 12rpx;
    margin: 22rpx 0 16rpx;
  }

  .mode-tab {
    flex: 1;
    padding: 16rpx 0;
    border-radius: 14rpx;
    color: var(--theme-text-secondary);
    background: var(--theme-surface-muted);
    font-size: 23rpx;
    text-align: center;
  }

  .mode-tab.active {
    color: var(--theme-brand);
    background: var(--theme-brand-soft);
    font-weight: 700;
  }

  .points-card {
    padding: 10rpx 24rpx;
  }

  .point-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18rpx;
    padding: 20rpx 0;
    border-bottom: 1rpx solid var(--theme-border-light);
  }

  .point-row:last-child {
    border-bottom: 0;
  }

  .point-copy {
    min-width: 0;
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 6rpx;
  }

  .point-name {
    overflow: hidden;
    color: var(--theme-text-primary);
    font-size: 27rpx;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .point-altitude {
    flex-shrink: 0;
    color: var(--theme-brand);
    font-size: 28rpx;
    font-weight: 700;
  }

  .state-card {
    padding: 46rpx 24rpx;
    color: var(--theme-text-tertiary);
    font-size: 24rpx;
    text-align: center;
  }

  .error-state {
    color: var(--theme-danger);
  }

  .retry-button {
    width: 220rpx;
    margin: 24rpx auto 0;
    color: #fff;
    background: var(--theme-brand);
    font-size: 23rpx;
    line-height: 68rpx;
  }
</style>
