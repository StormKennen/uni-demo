<template>
  <PageLayout
    title="查询海拔"
    :share-title="shareTitle"
    :share-path="sharePath"
    :share-timeline-query="shareTimelineQuery"
    :share-timeline-title="shareTitle"
    back-fallback="/pages/tools/index"
    nav-bg-color="#fff"
    nav-init-bg-color="#fff"
    nav-title-color="#111827"
    nav-divider>
    <view class="altitude-page">
      <!-- <view class="intro-card">
        <view class="intro-icon">
          <uni-icons type="location" size="30" color="var(--theme-brand)" />
        </view>
        <view class="intro-copy">
          <text class="intro-title">海拔查询</text>
        </view>
      </view> -->

      <view class="mode-tabs">
        <view class="mode-tab" :class="{ active: queryMode === 'location' }" @click="handleLocationAction">
          <text class="mode-tab-label">获取当前海拔</text>
        </view>
        <view class="mode-tab" :class="{ active: queryMode === 'manual' }" @click="switchMode('manual')">
          <text class="mode-tab-label">景区海拔</text>
        </view>
      </view>

      <view v-if="queryMode === 'manual' && !result" class="manual-search-card">
        <ScenicSelector :initial-filters="scenicFilters" @filter-change="onScenicFilterChange" />
      </view>

      <view
        v-else
        class="result-card"
        :class="[result ? `result-card--${altitudeLevel}` : '', { 'result-card-loading': loading, 'result-card-reading': result }]"
        :style="altitudeStyle">
        <view v-if="showLocationPrompt" class="state-box location-consent-box">
          <view class="location-consent-icon">
            <uni-icons type="location" size="32" color="var(--theme-brand)" />
          </view>
          <text class="state-title">需要使用位置信息</text>
          <button class="consent-button" :disabled="loading" @click="requestLocationAndQuery">定位并查询</button>
        </view>

        <view v-else-if="loading" class="state-box">
          <uni-icons type="spinner-cycle" size="32" color="var(--theme-brand)" />
          <text class="state-title">正在获取当前海拔…</text>
        </view>

        <view v-else-if="errorMessage" class="state-box">
          <view class="error-icon">
            <uni-icons type="closeempty" size="28" color="var(--theme-danger)" />
          </view>
          <text class="state-title">暂时无法获取海拔</text>
          <text class="state-description">{{ errorMessage }}</text>
          <button v-if="permissionDenied" class="settings-button" @click="openLocationSettings">去开启定位权限</button>
        </view>

        <view v-else-if="result" class="reading-box">
          <view class="reading-header">
            <text class="result-label">当前海拔</text>
          </view>

          <view class="elevation-dashboard">
            <view class="dashboard-overline">
              <view class="dashboard-status">
                <view class="dashboard-live-dot" />
                <text class="dashboard-status-label">{{ altitudeStatus.label }}</text>
              </view>
              <text class="dashboard-range">MAX {{ gaugeScale.max }}m</text>
            </view>

            <view class="dial-wrap">
              <view class="dial-bezel" />
              <view class="dial-inner-ring" />
              <view v-for="segment in gaugeSegments" :key="segment.index" class="dial-segment" :style="segment.style" />
              <view class="dial-scan" />
              <view class="dial-needle" :style="{ transform: `translateX(-50%) rotate(${gaugeNeedleAngle}deg)` }" />
              <view class="dial-hub">
                <view class="dial-hub-dot" />
              </view>
              <view class="dial-readout">
                <text class="dial-readout-caption">当前海拔</text>
                <view class="dial-value-row">
                  <text class="dial-value">{{ result.altitudeMeters.toFixed(1) }}</text>
                  <text class="dial-unit">m</text>
                </view>
              </view>
              <view v-for="marker in gaugeMarkers" :key="marker.value" class="dial-marker" :style="marker.style">
                <view class="dial-marker-tick" :style="{ backgroundColor: marker.color }" />
                <text class="dial-marker-label" :style="{ color: marker.color }">{{ marker.label }}</text>
              </view>
            </view>

            <view class="dashboard-notice">
              <text class="dashboard-notice-label">高度状态</text>
              <text class="dashboard-notice-text">{{ altitudeStatus.notice }}</text>
            </view>

            <view class="dashboard-legend">
              <view v-for="warning in altitudeWarningConfigs" :key="warning.key" class="dashboard-legend-item">
                <view class="dashboard-legend-dot" :style="{ backgroundColor: warning.color }" />
                <text>{{ warning.legendLabel }}</text>
              </view>
            </view>
          </view>
        </view>

        <view v-else class="state-box">
          <uni-icons type="location" size="32" color="var(--theme-brand)" />
          <text class="state-title">准备查询当前位置</text>
          <text class="state-description">点击上方按钮开始定位</text>
        </view>
      </view>
      <button v-if="queryMode === 'location' && result && !loading" class="refresh-text-button" @click="queryCurrentAltitude">
        重新获取当前海拔
      </button>
    </view>
  </PageLayout>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { onLoad, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
  import { getElevation, type AltitudePoint, type AltitudeSourceMode } from './altitude-api'
  import { ALTITUDE_WARNING_CONFIGS, getAltitudeWarningConfig, type AltitudeWarningLevel } from './altitude-warning'
  import {
    buildScenicSelectorShare,
    normalizeScenicSelectorShareFilters,
    parseScenicSelectorShare,
    type ScenicSelectorShareFilters,
  } from './scenic-share'
  import { buildAltitudeShare } from './share'
  import ScenicSelector from './scenic-selector.vue'
  import { reportToolVisit } from '@/utils/tracker'

  interface CurrentAltitudeViewModel {
    latitude: number
    longitude: number
    altitudeMeters: number
    unit: 'm'
    source: string
    sourceMode: AltitudeSourceMode
    placeId?: string
    name?: string
    queriedAt: string
  }

  type QueryMode = 'location' | 'manual'
  const GAUGE_MAX_ALTITUDE = 10000

  class LocationAuthorizationError extends Error {
    readonly code = 'LOCATION_AUTHORIZATION_DENIED'

    constructor() {
      super('定位权限未开启')
      this.name = 'LocationAuthorizationError'
    }
  }

  const loading = ref(false)
  const errorMessage = ref('')
  const permissionDenied = ref(false)
  const showLocationPrompt = ref(false)
  const result = ref<CurrentAltitudeViewModel | null>(null)
  const queryMode = ref<QueryMode>('location')
  const sourceMode = ref<AltitudeSourceMode>('location')
  const shareTitle = ref('查询海拔｜查询当前位置海拔')
  const sharePath = ref('/subPackages/tools/altitude/index?mode=location')
  const shareTimelineQuery = ref('mode=location')
  const scenicFilters = ref<ScenicSelectorShareFilters>({})
  const altitudeWarningConfigs = ALTITUDE_WARNING_CONFIGS
  const gaugeScale = { max: GAUGE_MAX_ALTITUDE }

  const gaugePercent = computed(() => {
    if (!result.value) return 0
    const percent = (Math.max(0, result.value.altitudeMeters) / gaugeScale.max) * 100
    return Math.min(100, Math.max(0, percent))
  })

  const gaugeNeedleAngle = computed(() => 225 + (gaugePercent.value / 100) * 270)

  const gaugeSegments = computed(() => {
    const segmentCount = 32
    const progress = gaugePercent.value / 100
    const max = gaugeScale.max

    return Array.from({ length: segmentCount }, (_, index) => {
      const ratio = index / (segmentCount - 1)
      const angle = 135 + ratio * 270
      const radians = (angle * Math.PI) / 180
      const warning = getAltitudeWarningConfig(ratio * max)

      return {
        index,
        style: {
          left: `${50 + Math.cos(radians) * 42}%`,
          top: `${54 + Math.sin(radians) * 42}%`,
          transform: `translate(-50%, -50%) rotate(${angle + 90}deg)`,
          backgroundColor: warning.color,
          boxShadow: ratio <= progress ? `0 0 10rpx ${warning.color}` : `0 0 4rpx ${warning.color}`,
          opacity: ratio <= progress ? '1' : '0.46',
        },
      }
    })
  })

  const gaugeMarkers = computed(() => {
    const markerValues = [0, 1500, 2500, 3500, 5000, GAUGE_MAX_ALTITUDE]

    return markerValues.map(value => {
      const ratio = value / gaugeScale.max
      const angle = 135 + ratio * 270
      const radians = (angle * Math.PI) / 180
      const warning = getAltitudeWarningConfig(value)

      return {
        value,
        label: `${value}m`,
        color: warning.color,
        style: {
          left: `${50 + Math.cos(radians) * 48}%`,
          top: `${54 + Math.sin(radians) * 48}%`,
        },
      }
    })
  })

  const altitudeWarning = computed(() => getAltitudeWarningConfig(result.value?.altitudeMeters))
  const altitudeLevel = computed<AltitudeWarningLevel>(() => altitudeWarning.value.key)
  const altitudeStyle = computed<Record<string, string>>(() => ({
    '--meter-color': altitudeWarning.value.color,
    '--meter-color-deep': altitudeWarning.value.colorDeep,
  }))

  const altitudeStatus = computed(() => ({
    label: altitudeWarning.value.label,
    notice: altitudeWarning.value.notice,
  }))

  const switchMode = (mode: QueryMode) => {
    queryMode.value = mode
    if (mode === 'manual') {
      result.value = null
      sourceMode.value = 'place'
      showLocationPrompt.value = false
      syncShareState()
      return
    }
    sourceMode.value = 'location'
    showLocationPrompt.value = false
    syncShareState()
  }

  const handleLocationAction = () => {
    if (queryMode.value !== 'location') switchMode('location')
    if (!loading.value) void queryCurrentAltitude()
  }

  const syncShareState = () => {
    if (queryMode.value === 'manual' && !result.value) {
      const share = buildScenicSelectorShare(scenicFilters.value)
      shareTitle.value = share.title
      sharePath.value = share.path
      shareTimelineQuery.value = share.timelineQuery
      return
    }
    const share = buildAltitudeShare({
      mode: sourceMode.value,
    })
    shareTitle.value = share.title
    sharePath.value = share.path
    shareTimelineQuery.value = share.timelineQuery
  }

  const onScenicFilterChange = (filters: ScenicSelectorShareFilters) => {
    scenicFilters.value = normalizeScenicSelectorShareFilters(filters)
    if (queryMode.value === 'manual' && !result.value) syncShareState()
  }

  onShareAppMessage(() => ({
    title: shareTitle.value,
    path: sharePath.value,
  }))

  onShareTimeline(() => ({
    title: shareTitle.value,
    query: shareTimelineQuery.value,
  }))

  const queryAltitude = async (point: AltitudePoint) => {
    errorMessage.value = ''
    permissionDenied.value = false
    try {
      const payload = await getElevation(point)
      sourceMode.value = point.source
      result.value = {
        latitude: payload.latitude,
        longitude: payload.longitude,
        altitudeMeters: payload.altitudeMeters,
        unit: payload.unit,
        source: payload.source,
        sourceMode: point.source,
        placeId: point.placeId,
        name: point.name,
        queriedAt: payload.queriedAt,
      }
      syncShareState()
      return result.value
    } catch (error) {
      result.value = null
      const message = typeof error === 'object' && error !== null && 'message' in error ? String(error.message) : ''
      errorMessage.value = message || '海拔查询失败，请稍后重试'
      throw error
    }
  }

  const ensureLocationAuthorization = (): Promise<void> =>
    new Promise((resolve, reject) => {
      // #ifdef MP-WEIXIN
      uni.getSetting({
        success: setting => {
          const authorization = setting.authSetting?.['scope.userLocation']
          if (authorization === true) {
            resolve()
            return
          }

          if (authorization === false) {
            reject(new LocationAuthorizationError())
            return
          }

          uni.authorize({
            scope: 'scope.userLocation',
            success: () => resolve(),
            fail: () => reject(new LocationAuthorizationError()),
          })
        },
        fail: () => reject(new LocationAuthorizationError()),
      })
      // #endif

      // #ifndef MP-WEIXIN
      resolve()
      // #endif
    })

  const getCurrentLocation = (): Promise<AltitudePoint> =>
    new Promise((resolve, reject) => {
      uni.getLocation({
        // 高程服务要求 WGS84；GCJ02 只用于国内地图/导航坐标。
        type: 'wgs84',
        isHighAccuracy: true,
        highAccuracyExpireTime: 5000,
        success: location =>
          resolve({
            latitude: location.latitude,
            longitude: location.longitude,
            coordinateSystem: 'wgs84',
            source: 'location',
          }),
        fail: reject,
      })
    })

  const requestLocationAndQuery = async () => {
    showLocationPrompt.value = false
    await queryCurrentAltitude()
  }

  const openLocationSettings = () => {
    // #ifdef MP-WEIXIN
    uni.openSetting({
      success: setting => {
        if (setting.authSetting?.['scope.userLocation']) {
          showLocationPrompt.value = false
          queryCurrentAltitude()
        }
      },
    })
    // #endif
  }

  const queryCurrentAltitude = async () => {
    if (loading.value) return

    loading.value = true
    errorMessage.value = ''
    permissionDenied.value = false

    try {
      await ensureLocationAuthorization()
      const location = await getCurrentLocation()
      queryMode.value = 'location'
      await queryAltitude(location)
    } catch (error) {
      result.value = null
      if (error instanceof LocationAuthorizationError) {
        permissionDenied.value = true
        errorMessage.value = '请在微信设置中开启位置信息权限后重试'
      } else {
        const message = typeof error === 'object' && error !== null && 'message' in error ? String(error.message) : ''
        errorMessage.value = message.includes('定位') ? message : '请检查定位权限和网络连接后重试'
      }
    } finally {
      loading.value = false
    }
  }

  onLoad(async options => {
    scenicFilters.value = parseScenicSelectorShare((options || {}) as Record<string, string | undefined>)
    if (options?.mode === 'manual') {
      queryMode.value = 'manual'
      sourceMode.value = 'place'
      showLocationPrompt.value = false
      syncShareState()
    } else {
      sourceMode.value = 'location'
      queryMode.value = 'location'
      syncShareState()
      void queryCurrentAltitude()
    }
  })

  onMounted(() => {
    reportToolVisit('current-altitude')
  })
</script>

<style lang="scss" scoped>
  .altitude-page {
    min-height: 100vh;
    padding: 32rpx;
    box-sizing: border-box;
    background: var(--theme-bg);
  }

  .intro-card,
  .detail-card {
    border-radius: 24rpx;
    background: var(--theme-surface);
    box-shadow: 0 12rpx 36rpx var(--theme-shadow-xs);
  }

  .intro-card {
    display: flex;
    align-items: center;
    padding: 28rpx;
  }

  .intro-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 76rpx;
    height: 76rpx;
    margin-right: 22rpx;
    border-radius: 22rpx;
    background: var(--theme-surface-2);
  }

  .intro-copy {
    display: flex;
    flex: 1;
    flex-direction: column;
  }

  .mode-tabs {
    display: flex;
    border-bottom: 1rpx solid var(--theme-border);
    margin-top: 24rpx;
  }

  .mode-tab {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 72rpx;
    flex: 1;
    padding: 0 12rpx;
  }

  .mode-tab.active {
    background: transparent;
  }

  .mode-tab.active::after {
    position: absolute;
    right: 34rpx;
    bottom: -1rpx;
    left: 34rpx;
    height: 5rpx;
    border-radius: 999rpx;
    background: var(--theme-brand);
    content: '';
  }

  .mode-tab-label {
    color: var(--theme-text-secondary);
    font-size: 24rpx;
    font-weight: 600;
    line-height: 1;
  }

  .mode-tab.active .mode-tab-label {
    color: var(--theme-brand);
    font-weight: 700;
  }

  .manual-search-card {
    margin-top: 24rpx;
    padding: 28rpx;
    border-radius: 24rpx;
    background: var(--theme-surface);
    box-shadow: 0 12rpx 36rpx var(--theme-shadow-xs);
  }

  .map-select-card {
    display: flex;
    align-items: center;
    flex-direction: column;
    margin-top: 24rpx;
    padding: 48rpx 32rpx;
    border-radius: 24rpx;
    background: var(--theme-surface);
    box-shadow: 0 12rpx 36rpx var(--theme-shadow-xs);
    text-align: center;
  }

  .map-select-button {
    width: 100%;
    margin-top: 26rpx;
    border: 0;
    border-radius: 16rpx;
    background: var(--theme-brand);
    color: var(--theme-surface);
    font-size: 28rpx;
    line-height: 86rpx;
  }

  .map-select-button::after {
    border: 0;
  }

  .region-picker-block {
    padding-bottom: 24rpx;
    margin-bottom: 24rpx;
    border-bottom: 1rpx solid var(--theme-border);
  }

  .region-picker-title {
    display: block;
    margin-bottom: 14rpx;
    color: var(--theme-text);
    font-size: 26rpx;
    font-weight: 700;
  }

  .region-confirm-button {
    height: 72rpx;
    margin-top: 18rpx;
    padding: 0 28rpx;
    border: 0;
    border-radius: 14rpx;
    background: var(--theme-brand);
    color: var(--theme-surface);
    font-size: 25rpx;
    line-height: 72rpx;
  }

  .region-confirm-button::after {
    border: 0;
  }

  .search-row {
    display: flex;
    align-items: center;
  }

  .search-input {
    flex: 1;
    height: 82rpx;
    padding: 0 22rpx;
    border-radius: 16rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text);
    font-size: 26rpx;
  }

  .search-button {
    width: 132rpx;
    height: 82rpx;
    margin-left: 16rpx;
    padding: 0;
    border: 0;
    border-radius: 16rpx;
    background: var(--theme-brand);
    color: var(--theme-surface);
    font-size: 26rpx;
    line-height: 82rpx;
  }

  .search-button::after {
    border: 0;
  }

  .search-button[disabled] {
    opacity: 0.55;
  }

  .manual-hint,
  .manual-state {
    display: block;
    color: var(--theme-text-tertiary);
    font-size: 22rpx;
    line-height: 1.6;
  }

  .manual-hint {
    margin-top: 18rpx;
  }

  .manual-state {
    padding: 32rpx 0 8rpx;
    text-align: center;
  }

  .manual-error {
    color: var(--theme-danger);
  }

  .place-results {
    margin-top: 18rpx;
  }

  .scenic-points-card {
    margin-top: 24rpx;
    padding-top: 22rpx;
    border-top: 1rpx solid var(--theme-border);
  }

  .place-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20rpx 0;
    border-top: 1rpx solid var(--theme-border);
  }

  .place-copy {
    display: flex;
    flex: 1;
    align-items: flex-start;
    flex-direction: column;
    min-width: 0;
    margin-right: 18rpx;
  }

  .place-name {
    color: var(--theme-text);
    font-size: 28rpx;
    font-weight: 700;
  }

  .place-path {
    overflow: hidden;
    width: 100%;
    margin-top: 6rpx;
    color: var(--theme-text-secondary);
    font-size: 22rpx;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .place-type {
    margin-top: 6rpx;
    color: var(--theme-text-tertiary);
    font-size: 20rpx;
  }

  .place-altitude {
    display: flex;
    align-items: baseline;
    flex-shrink: 0;
  }

  .place-altitude-value {
    color: var(--theme-brand);
    font-size: 32rpx;
    font-weight: 700;
  }

  .place-altitude-unit {
    margin-left: 4rpx;
    color: var(--theme-text-tertiary);
    font-size: 20rpx;
  }

  .intro-title,
  .state-title,
  .result-label {
    color: var(--theme-text);
    font-weight: 700;
  }

  .intro-title {
    font-size: 34rpx;
  }

  .intro-description,
  .state-description,
  .result-hint,
  .source-note {
    color: var(--theme-text-secondary);
  }

  .intro-description {
    margin-top: 10rpx;
    font-size: 24rpx;
    line-height: 1.5;
  }

  .result-card {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 390rpx;
    margin-top: 28rpx;
    padding: 0;
    box-sizing: border-box;
  }

  .result-card-loading {
    opacity: 0.86;
  }

  .result-card--normal {
    --meter-color: var(--theme-brand);
    --meter-color-deep: var(--theme-brand);
  }

  .result-card--attention {
    --meter-color: var(--theme-warning);
    --meter-color-deep: var(--theme-warning);
  }

  .result-card--high {
    --meter-color: var(--theme-warning);
    --meter-color-deep: var(--theme-danger);
  }

  .result-card--very-high {
    --meter-color: var(--theme-danger);
    --meter-color-deep: var(--theme-danger);
  }

  .state-box,
  .reading-box {
    display: flex;
    align-items: center;
    flex-direction: column;
    text-align: center;
  }

  .reading-box {
    width: 100%;
    text-align: left;
  }

  .state-title {
    margin-top: 24rpx;
    font-size: 30rpx;
  }

  .state-description {
    max-width: 520rpx;
    margin-top: 12rpx;
    font-size: 24rpx;
    line-height: 1.6;
  }

  .location-consent-box {
    width: 100%;
  }

  .location-consent-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 76rpx;
    height: 76rpx;
    border-radius: 50%;
    background: var(--theme-surface-2);
  }

  .consent-button,
  .settings-button {
    width: 100%;
    margin-top: 28rpx;
    border: 0;
    border-radius: 18rpx;
    background: var(--theme-brand);
    color: var(--theme-surface);
    font-size: 28rpx;
    line-height: 82rpx;
  }

  .consent-button::after,
  .settings-button::after {
    border: 0;
  }

  .consent-button[disabled] {
    opacity: 0.55;
  }

  .settings-button {
    width: auto;
    min-width: 280rpx;
    padding: 0 32rpx;
  }

  .error-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 72rpx;
    height: 72rpx;
    border-radius: 50%;
    background: var(--theme-surface-2);
  }

  .result-label {
    font-size: 26rpx;
  }

  .reading-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .elevation-dashboard {
    width: 100%;
    margin-top: 22rpx;
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
    box-sizing: border-box;
  }

  .dashboard-overline {
    display: flex;
    align-items: center;
    color: var(--theme-text-secondary);
    font-size: 20rpx;
  }

  .dashboard-status {
    display: flex;
    align-items: center;
    gap: 8rpx;
  }

  .dashboard-status-label {
    color: var(--meter-color, var(--theme-brand));
    font-weight: 700;
  }

  .dashboard-live-dot {
    width: 12rpx;
    height: 12rpx;
    margin-right: 8rpx;
    border-radius: 50%;
    background: var(--meter-color, var(--theme-brand));
    box-shadow: 0 0 0 6rpx var(--theme-border);
    animation: altitude-live-pulse 1.8s ease-in-out infinite;
  }

  .dashboard-range {
    margin-left: auto;
    color: var(--theme-text-tertiary);
    font-size: 19rpx;
    font-weight: 700;
    letter-spacing: 1rpx;
  }

  .dial-wrap {
    position: relative;
    width: 100%;
    max-width: 520rpx;
    height: 440rpx;
    margin: 12rpx auto 0;
  }

  .dial-bezel,
  .dial-inner-ring {
    position: absolute;
    top: 54%;
    left: 50%;
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }

  .dial-bezel {
    width: 420rpx;
    height: 420rpx;
    border: 2rpx solid var(--theme-border);
    background: radial-gradient(circle, var(--theme-surface-2) 0%, var(--theme-surface) 62%, var(--theme-bg) 100%);
    box-shadow:
      inset 0 0 0 12rpx var(--theme-shadow-xs),
      inset 0 0 34rpx var(--theme-shadow-sm),
      0 10rpx 24rpx var(--theme-shadow-sm);
  }

  .dial-inner-ring {
    width: 318rpx;
    height: 318rpx;
    border: 1rpx solid var(--theme-border);
    box-shadow: inset 0 0 18rpx var(--theme-shadow-xs);
  }

  .dial-segment {
    position: absolute;
    width: 12rpx;
    height: 42rpx;
    border-radius: 999rpx;
    transition:
      opacity 550ms ease,
      background-color 550ms ease,
      box-shadow 550ms ease;
  }

  .dial-scan,
  .dial-needle {
    position: absolute;
    bottom: 46%;
    left: 50%;
    width: 4rpx;
    height: 174rpx;
    border-radius: 999rpx;
    transform-origin: 50% 100%;
    transform: translateX(-50%);
  }

  .dial-scan {
    background: linear-gradient(180deg, transparent, var(--meter-color, var(--theme-brand)) 75%, transparent);
    opacity: 0.3;
    animation: altitude-dial-scan 4.2s ease-in-out infinite;
  }

  .dial-needle {
    width: 6rpx;
    background: var(--meter-color, var(--theme-brand));
    box-shadow: 0 0 16rpx var(--meter-color, var(--theme-brand));
    transition: transform 650ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .dial-hub {
    position: absolute;
    top: 54%;
    left: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48rpx;
    height: 48rpx;
    border: 6rpx solid var(--theme-surface);
    border-radius: 50%;
    background: var(--meter-color, var(--theme-brand));
    box-shadow:
      0 0 0 3rpx var(--meter-color, var(--theme-brand)),
      0 8rpx 18rpx var(--theme-shadow-md);
    transform: translate(-50%, -50%);
    z-index: 2;
  }

  .dial-hub-dot {
    width: 14rpx;
    height: 14rpx;
    border-radius: 50%;
    background: var(--theme-text);
    animation: altitude-hub-pulse 1.8s ease-in-out infinite;
  }

  .dial-readout {
    position: absolute;
    top: 64%;
    left: 50%;
    display: flex;
    align-items: center;
    flex-direction: column;
    transform: translateX(-50%);
    z-index: 3;
  }

  .dial-readout-caption {
    color: var(--theme-text-tertiary);
    font-size: 21rpx;
    letter-spacing: 2rpx;
  }

  .dial-value-row {
    display: flex;
    align-items: baseline;
    margin-top: 8rpx;
  }

  .dial-value {
    color: var(--theme-text);
    font-size: 88rpx;
    font-weight: 800;
    letter-spacing: -2rpx;
    line-height: 1;
  }

  .dial-unit {
    margin-left: 8rpx;
    color: var(--theme-text-secondary);
    font-size: 27rpx;
    font-weight: 700;
  }

  .dial-marker {
    position: absolute;
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 4rpx;
    transform: translate(-50%, -50%);
    z-index: 2;
  }

  .dial-marker-tick {
    width: 18rpx;
    height: 4rpx;
    border-radius: 999rpx;
  }

  .dial-marker-label {
    font-size: 18rpx;
    font-weight: 700;
    white-space: nowrap;
  }

  .dashboard-notice {
    display: flex;
    align-items: center;
    gap: 12rpx;
    padding: 14rpx 16rpx;
    border-radius: 16rpx;
    background: var(--theme-surface-2);
  }

  .dashboard-notice-label {
    flex-shrink: 0;
    color: var(--meter-color, var(--theme-brand));
    font-size: 21rpx;
    font-weight: 700;
  }

  .dashboard-notice-text {
    overflow: hidden;
    color: var(--theme-text-secondary);
    font-size: 20rpx;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .dashboard-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 10rpx 16rpx;
    margin-top: 18rpx;
    padding-top: 16rpx;
    border-top: 1rpx solid var(--theme-border);
  }

  .dashboard-legend-item {
    display: flex;
    align-items: center;
    color: var(--theme-text-tertiary);
    font-size: 18rpx;
  }

  .dashboard-legend-dot {
    width: 10rpx;
    height: 10rpx;
    margin-right: 6rpx;
    border-radius: 50%;
  }

  @keyframes altitude-live-pulse {
    0%,
    100% {
      opacity: 0.55;
      transform: scale(0.88);
    }
    50% {
      opacity: 1;
      transform: scale(1.12);
    }
  }

  @keyframes altitude-hub-pulse {
    0%,
    100% {
      opacity: 0.72;
      transform: scale(0.82);
    }
    50% {
      opacity: 1;
      transform: scale(1.12);
    }
  }

  @keyframes altitude-dial-scan {
    0%,
    100% {
      transform: translateX(-50%) rotate(225deg);
    }
    50% {
      transform: translateX(-50%) rotate(495deg);
    }
  }

  .detail-card {
    margin-top: 24rpx;
    padding: 10rpx 28rpx;
  }

  .detail-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx 0;
    border-bottom: 1rpx solid var(--theme-border);
  }

  .detail-row:last-child {
    border-bottom: 0;
  }

  .detail-label {
    color: var(--theme-text-secondary);
    font-size: 26rpx;
  }

  .detail-value {
    color: var(--theme-text);
    font-size: 26rpx;
    font-weight: 600;
  }

  .refresh-text-button {
    display: block;
    margin: 16rpx auto 0;
    padding: 0 16rpx;
    border: 0;
    color: var(--theme-brand);
    background: transparent;
    font-size: 24rpx;
    line-height: 64rpx;
  }

  .refresh-text-button::after {
    border: 0;
  }

  .source-note {
    display: block;
    margin-top: 24rpx;
    font-size: 22rpx;
    text-align: center;
  }
</style>
