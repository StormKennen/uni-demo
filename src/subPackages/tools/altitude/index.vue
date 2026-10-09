<template>
  <PageLayout
    title="查询海拔"
    :share-title="shareTitle"
    :share-path="sharePath"
    :share-timeline-query="shareTimelineQuery"
    :share-timeline-title="shareTitle"
    back-fallback="/pages/tools/index">
    <view class="altitude-page">
      <view class="intro-card">
        <view class="intro-icon">
          <uni-icons type="location" size="30" color="var(--theme-brand)" />
        </view>
        <view class="intro-copy">
          <text class="intro-title">查询当前位置海拔</text>
          <text class="intro-description">定位是可选的，也可以直接选择景区、景点或地图位置</text>
        </view>
      </view>

      <view class="mode-tabs">
        <view class="mode-tab" :class="{ active: queryMode === 'location' }" @click="switchMode('location')">当前定位</view>
        <view class="mode-tab" :class="{ active: queryMode === 'manual' }" @click="switchMode('manual')">选择地点</view>
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
          <text class="state-description">仅用于查询并展示当前位置海拔，不保存位置历史。你可以在微信设置中随时关闭定位权限。</text>
          <button class="consent-button" :disabled="loading" @click="requestLocationAndQuery">定位并查询</button>
        </view>

        <view v-else-if="loading" class="state-box">
          <uni-icons type="spinner-cycle" size="32" color="var(--theme-brand)" />
          <text class="state-title">正在定位并查询海拔…</text>
          <text class="state-description">首次查询可能需要几秒钟</text>
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
            <text class="result-label">海拔高度</text>
            <view class="located-badge">
              <view class="located-dot" />
              <text>{{ altitudeStatus.label }}</text>
            </view>
          </view>

          <view class="dashboard-gauge">
            <view class="dashboard-readout">
              <text class="dashboard-value">{{ result.altitudeMeters.toFixed(1) }}</text>
              <text class="dashboard-unit">m</text>
            </view>
            <text class="dashboard-caption">{{ altitudeStatus.notice }}</text>

            <view class="dashboard-scale">
              <view class="scale-track">
                <view class="scale-zone scale-zone-normal" />
                <view class="scale-zone scale-zone-attention" />
                <view class="scale-zone scale-zone-high" />
                <view class="scale-zone scale-zone-danger" />
                <view class="scale-progress" :style="{ width: `${gaugePercent}%` }" />
                <view class="scale-marker" :style="{ left: `${gaugePercent}%` }" />
              </view>
              <view class="scale-labels">
                <text v-for="tick in gaugeTicks" :key="tick">{{ tick }}m</text>
              </view>
            </view>

            <view class="dashboard-meta">
              <view class="dashboard-meta-item">
                <text class="dashboard-meta-label">位置</text>
                <text class="dashboard-meta-value">{{ result.latitude.toFixed(4) }}°N · {{ result.longitude.toFixed(4) }}°E</text>
              </view>
              <view class="dashboard-meta-item">
                <text class="dashboard-meta-label">来源</text>
                <text class="dashboard-meta-value">{{
                  result.source === 'database' ? '预采集数据' : result.source === 'live' ? '实时高程' : '定位查询'
                }}</text>
              </view>
            </view>
          </view>
        </view>

        <view v-else class="state-box">
          <uni-icons type="location" size="32" color="var(--theme-brand)" />
          <text class="state-title">准备查询当前位置</text>
          <text class="state-description">点击下方按钮开始定位</text>
        </view>
      </view>

      <view v-if="result" class="detail-card">
        <view class="detail-row">
          <text class="detail-label">纬度</text>
          <text class="detail-value">{{ result.latitude.toFixed(6) }}</text>
        </view>
        <view class="detail-row">
          <text class="detail-label">经度</text>
          <text class="detail-value">{{ result.longitude.toFixed(6) }}</text>
        </view>
        <view class="detail-row">
          <text class="detail-label">查询时间</text>
          <text class="detail-value">{{ formattedQueryTime }}</text>
        </view>
      </view>

      <button
        v-if="queryMode === 'location' && !showLocationPrompt"
        class="locate-button"
        :disabled="loading"
        @click="queryCurrentAltitude">
        {{ loading ? '查询中…' : result || errorMessage ? '重新定位' : '查询当前位置海拔' }}
      </button>

      <text v-if="queryMode === 'location' && result?.source === 'database'" class="source-note"> 数据库预采集参考海拔，仅供参考 </text>
      <text v-else-if="queryMode === 'location' && result?.source === 'live'" class="source-note"> 坐标高程实时查询结果，仅供参考 </text>
      <text v-else-if="queryMode === 'location'" class="source-note">海拔数据由高程服务提供，仅供参考</text>
    </view>
  </PageLayout>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { onLoad, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
  import { getElevation, type AltitudePoint, type AltitudeSourceMode } from './altitude-api'
  import { getAltitudeWarningConfig, type AltitudeWarningLevel } from './altitude-warning'
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

  const gaugeScale = computed(() => {
    const altitude = result.value?.altitudeMeters ?? 0
    const interval = altitude > 2000 ? 500 : altitude > 800 ? 200 : 100
    const min = Math.min(0, Math.floor((altitude - interval) / interval) * interval)
    const max = Math.max(interval * 5, Math.ceil((altitude + interval) / interval) * interval)
    const step = (max - min) / 4
    const ticks = Array.from({ length: 5 }, (_, index) => Math.round(max - step * index))

    return { min, max, ticks }
  })

  const gaugeTicks = computed(() => gaugeScale.value.ticks)

  const gaugePercent = computed(() => {
    if (!result.value) return 0
    const { min, max } = gaugeScale.value
    const percent = ((result.value.altitudeMeters - min) / (max - min)) * 100
    return Math.min(100, Math.max(0, percent))
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

  const formattedQueryTime = computed(() => {
    if (!result.value) return ''
    return result.value.queriedAt.replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC')
  })

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
    loading.value = true
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
    } finally {
      loading.value = false
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
  .result-card,
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
    margin-top: 24rpx;
    padding: 6rpx;
    border-radius: 18rpx;
    background: var(--theme-surface-2);
  }

  .mode-tab {
    flex: 1;
    padding: 18rpx 0;
    border-radius: 14rpx;
    color: var(--theme-text-secondary);
    font-size: 26rpx;
    text-align: center;
  }

  .mode-tab.active {
    background: var(--theme-surface);
    color: var(--theme-brand);
    font-weight: 700;
    box-shadow: 0 4rpx 12rpx var(--theme-shadow-xs);
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
    padding: 36rpx;
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

  .dashboard-gauge {
    width: 100%;
    padding: 28rpx 24rpx 22rpx;
    margin-top: 22rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 28rpx;
    background: var(--theme-surface-2);
    box-sizing: border-box;
  }

  .dashboard-readout {
    display: flex;
    align-items: baseline;
  }

  .dashboard-value {
    color: var(--meter-color, var(--theme-brand));
    font-size: 112rpx;
    font-weight: 800;
    letter-spacing: -3rpx;
    line-height: 1;
  }

  .dashboard-unit {
    margin-left: 12rpx;
    color: var(--theme-text-secondary);
    font-size: 30rpx;
    font-weight: 700;
  }

  .dashboard-caption {
    display: block;
    margin-top: 14rpx;
    color: var(--meter-color, var(--theme-brand));
    font-size: 24rpx;
    line-height: 1.5;
  }

  .dashboard-scale {
    margin-top: 30rpx;
  }

  .scale-track {
    position: relative;
    display: flex;
    height: 24rpx;
    overflow: visible;
    border-radius: 999rpx;
    background: var(--theme-border);
  }

  .scale-zone {
    flex: 1;
    height: 100%;
  }

  .scale-zone:first-child {
    border-radius: 999rpx 0 0 999rpx;
  }

  .scale-zone:last-of-type {
    border-radius: 0 999rpx 999rpx 0;
  }

  .scale-zone-normal {
    background: var(--theme-brand);
  }

  .scale-zone-attention {
    background: var(--theme-warning);
  }

  .scale-zone-high {
    background: var(--theme-danger);
    opacity: 0.78;
  }

  .scale-zone-danger {
    background: var(--theme-danger);
  }

  .scale-progress {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    border-radius: 999rpx;
    background: var(--meter-color, var(--theme-brand));
    box-shadow: 0 4rpx 12rpx var(--theme-shadow-sm);
    transition: width 450ms ease;
  }

  .scale-marker {
    position: absolute;
    top: 50%;
    width: 34rpx;
    height: 34rpx;
    border: 6rpx solid var(--theme-surface);
    border-radius: 50%;
    background: var(--meter-color, var(--theme-brand));
    box-shadow: 0 4rpx 12rpx var(--theme-shadow-sm);
    transform: translate(-50%, -50%);
    transition: left 450ms ease;
  }

  .scale-labels {
    display: flex;
    justify-content: space-between;
    margin-top: 14rpx;
    color: var(--theme-text-tertiary);
    font-size: 20rpx;
  }

  .dashboard-meta {
    display: flex;
    margin-top: 26rpx;
    padding-top: 20rpx;
    border-top: 1rpx solid var(--theme-border);
  }

  .dashboard-meta-item {
    display: flex;
    flex: 1;
    align-items: flex-start;
    flex-direction: column;
  }

  .dashboard-meta-item + .dashboard-meta-item {
    padding-left: 20rpx;
    border-left: 1rpx solid var(--theme-border);
  }

  .dashboard-meta-label {
    color: var(--theme-text-tertiary);
    font-size: 20rpx;
  }

  .dashboard-meta-value {
    max-width: 100%;
    margin-top: 6rpx;
    overflow: hidden;
    color: var(--theme-text-secondary);
    font-size: 21rpx;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .located-badge {
    display: flex;
    align-items: center;
    padding: 8rpx 14rpx;
    border-radius: 999rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text-secondary);
    font-size: 22rpx;
  }

  .located-dot {
    width: 12rpx;
    height: 12rpx;
    margin-right: 8rpx;
    border-radius: 50%;
    background: var(--meter-color, var(--theme-brand));
  }

  .meter-reading {
    display: flex;
    align-items: center;
    width: 100%;
    margin-top: 18rpx;
  }

  .meter-scale {
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    width: 76rpx;
    height: 330rpx;
    padding: 10rpx 0 18rpx;
    box-sizing: border-box;
  }

  .scale-row {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    color: var(--theme-text-tertiary);
    font-size: 20rpx;
  }

  .scale-line {
    width: 20rpx;
    height: 1rpx;
    margin-right: 8rpx;
    background: var(--theme-border);
  }

  .thermometer {
    position: relative;
    width: 82rpx;
    height: 360rpx;
    margin: 0 28rpx 0 12rpx;
  }

  .thermometer-track {
    position: absolute;
    right: 27rpx;
    bottom: 40rpx;
    width: 28rpx;
    height: 292rpx;
    overflow: hidden;
    border: 6rpx solid var(--theme-surface-2);
    border-radius: 24rpx;
    background: var(--theme-bg);
    box-shadow: inset 0 0 0 1rpx var(--theme-border);
  }

  .thermometer-fill {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    border-radius: 18rpx;
    background: linear-gradient(180deg, var(--meter-color-deep, var(--theme-danger)) 0%, var(--meter-color, var(--theme-brand)) 72%);
    transition: height 300ms ease;
  }

  .thermometer-bulb {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 82rpx;
    height: 82rpx;
    border: 6rpx solid var(--theme-surface-2);
    border-radius: 50%;
    background: var(--meter-color, var(--theme-brand));
    box-shadow: 0 8rpx 20rpx var(--theme-shadow-sm);
  }

  .reading-number {
    display: flex;
    flex: 1;
    align-items: flex-start;
    flex-direction: column;
  }

  .altitude-value-row {
    display: flex;
    align-items: baseline;
    margin-top: 14rpx;
  }

  .altitude-value {
    color: var(--theme-brand);
    font-size: 108rpx;
    font-weight: 800;
    line-height: 1.1;
  }

  .altitude-unit {
    margin-left: 12rpx;
    color: var(--theme-text-secondary);
    font-size: 30rpx;
  }

  .result-hint {
    margin-top: 14rpx;
    font-size: 24rpx;
  }

  .status-note {
    margin-top: 10rpx;
    color: var(--meter-color, var(--theme-brand));
    font-size: 22rpx;
    line-height: 1.5;
  }

  .reading-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding-top: 18rpx;
    border-top: 1rpx solid var(--theme-border);
    color: var(--theme-text-tertiary);
    font-size: 20rpx;
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

  .locate-button {
    margin-top: 28rpx;
    border: 0;
    border-radius: 18rpx;
    background: var(--theme-brand);
    color: var(--theme-surface);
    font-size: 30rpx;
    line-height: 96rpx;
  }

  .locate-button::after {
    border: 0;
  }

  .locate-button[disabled] {
    opacity: 0.55;
  }

  .source-note {
    display: block;
    margin-top: 24rpx;
    font-size: 22rpx;
    text-align: center;
  }
</style>
