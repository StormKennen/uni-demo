<template>
  <PageLayout
    title="查询海拔"
    :share-title="shareTitle"
    :share-path="sharePath"
    :share-timeline-query="shareTimelineQuery"
    :share-timeline-title="shareTitle"
    back-fallback="/pages/tools/index"
    nav-bg-color="var(--theme-surface)"
    nav-init-bg-color="var(--theme-surface)"
    nav-title-color="var(--theme-text)"
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

      <view class="mode-segmented-pill">
        <view class="pill-item" :class="{ active: queryMode === 'location' }" @click="handleLocationAction">
          <uni-icons type="location" size="14" :color="queryMode === 'location' ? 'var(--theme-surface)' : 'var(--theme-text-secondary)'" />
          <text class="pill-label">当前海拔</text>
        </view>
        <view class="pill-item" :class="{ active: queryMode === 'manual' }" @click="switchMode('manual')">
          <uni-icons type="map" size="14" :color="queryMode === 'manual' ? 'var(--theme-surface)' : 'var(--theme-text-secondary)'" />
          <text class="pill-label">景区查询</text>
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
          <uni-icons class="spinner-anim" type="spinner-cycle" size="32" color="var(--theme-brand)" />
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
          <view class="elevation-dashboard">
            <view class="dial-wrap" :class="{ 'dial-wrap--dark': themeStore.isDark }">
              <view class="dial-track" />
              <view class="dial-arc" :style="dialArcStyle" />
              <view class="dial-tick-layer">
                <view v-for="marker in gaugeMarkers" :key="marker.value" class="dial-tick-anchor" :style="marker.anchorStyle">
                  <view class="dial-tick" :class="{ 'dial-tick--major': marker.major }" />
                  <text class="dial-mark-label" :style="marker.labelStyle">{{ marker.label }}</text>
                </view>
              </view>
              <view class="dial-readout">
                <text class="dial-readout-caption">ALTITUDE</text>
                <view class="dial-value-row">
                  <text class="dial-value">{{ Math.round(result.altitudeMeters).toLocaleString() }}<text class="dial-unit">米</text></text>
                </view>
                <!-- <text class="dial-unit">米 · 当前海拔</text> -->
              </view>
              <view class="dial-needle-origin" :style="gaugeNeedleStyle">
                <view class="dial-needle" />
              </view>
              <view class="dial-hub" />
              <!-- <text class="dial-live">LIVE · {{ result.sourceMode === 'location' ? 'GPS' : 'PLACE' }}</text> -->
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
  import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
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
  import { useThemeStore } from '@/stores/theme'

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
  const DEFAULT_GAUGE_MAX = 5000
  const EXPANDED_GAUGE_MAX = 10000

  class LocationAuthorizationError extends Error {
    readonly code = 'LOCATION_AUTHORIZATION_DENIED'

    constructor() {
      super('定位权限未开启')
      this.name = 'LocationAuthorizationError'
    }
  }

  const themeStore = useThemeStore()
  const loading = ref(false)
  const errorMessage = ref('')
  const permissionDenied = ref(false)
  const showLocationPrompt = ref(false)
  const result = ref<CurrentAltitudeViewModel | null>(null)
  const animatedAltitude = ref(0)
  let gaugeAnimationTimer: ReturnType<typeof setInterval> | undefined
  let gaugeSwayTimer: ReturnType<typeof setInterval> | undefined
  const gaugeSwayMeters = ref(0)
  const queryMode = ref<QueryMode>('location')
  const sourceMode = ref<AltitudeSourceMode>('location')
  let altitudeRequestGeneration = 0

  const isCurrentLocationRequest = (generation: number) => generation === altitudeRequestGeneration && queryMode.value === 'location'
  const shareTitle = ref('查询海拔｜查询当前位置海拔')
  const sharePath = ref('/subPackages/tools/altitude/index?mode=location')
  const shareTimelineQuery = ref('mode=location')
  const scenicFilters = ref<ScenicSelectorShareFilters>({})
  const gaugeScale = computed(() => ({
    max: (result.value?.altitudeMeters ?? 0) > DEFAULT_GAUGE_MAX ? EXPANDED_GAUGE_MAX : DEFAULT_GAUGE_MAX,
  }))

  const gaugePercent = computed(() => {
    if (!result.value) return 0
    const percent = (Math.max(0, animatedAltitude.value + gaugeSwayMeters.value) / gaugeScale.value.max) * 100
    return Math.min(100, Math.max(0, percent))
  })

  const gaugeNeedleAngle = computed(() => -90 + gaugePercent.value * 1.8)
  const gaugeProgressAngle = computed(() => gaugePercent.value * 1.8)
  const gaugeNeedleStyle = computed(() => ({
    '--needle-angle': `${gaugeNeedleAngle.value}deg`,
  }))

  const dialArcStyle = computed(() => {
    const max = gaugeScale.value.max
    const progressStop = (gaugeProgressAngle.value / 360) * 100
    const thresholds = [0, 1500, 2500, 3500, max]
    const colors = ['#22c55e', '#f59e0b', '#f97316', '#ef4444']
    const colorStops = colors.flatMap((color, index) => {
      const start = Math.min((thresholds[index] / max) * 50, progressStop)
      const end = Math.min((thresholds[index + 1] / max) * 50, progressStop)
      return end > start ? [`${color} ${start}% ${end}%`] : []
    })
    const progressGradient =
      progressStop > 0 && colorStops.length
        ? `conic-gradient(from 270deg, ${colorStops.join(', ')}, transparent ${progressStop}% 50%, transparent 50% 100%)`
        : 'conic-gradient(from 270deg, transparent 0% 100%)'

    return {
      '--dial-progress-gradient': progressGradient,
    }
  })

  const gaugeMarkers = computed(() => {
    const markerValues = [0, 1500, 2500, 3500, DEFAULT_GAUGE_MAX]
    const tickStartRadiusX = 50
    const tickStartRadiusY = 80
    const dialCenterX = 50
    const dialCenterY = 88

    return markerValues.map(value => {
      const ratio = value / DEFAULT_GAUGE_MAX
      const angle = 180 + ratio * 180
      const radians = (angle * Math.PI) / 180
      const x = dialCenterX + Math.cos(radians) * tickStartRadiusX
      const y = dialCenterY + Math.sin(radians) * tickStartRadiusY
      const inwardAngle = angle + 90
      const label = value === 0 ? '0' : `${value}m`

      return {
        value,
        label,
        major: value === 0 || value === DEFAULT_GAUGE_MAX || value === 2500,
        anchorStyle: {
          left: `${x}%`,
          top: `${y}%`,
          transform: `translate(-50%, -50%) rotate(${inwardAngle}deg)`,
        },
        labelStyle: {
          transform: `translateX(-50%) rotate(${-inwardAngle}deg)`,
        },
      }
    })
  })

  const altitudeWarning = computed(() => getAltitudeWarningConfig(animatedAltitude.value || result.value?.altitudeMeters))
  const altitudeLevel = computed<AltitudeWarningLevel>(() => altitudeWarning.value.key)

  watch(
    () => result.value?.altitudeMeters,
    targetAltitude => {
      if (gaugeAnimationTimer) clearInterval(gaugeAnimationTimer)
      if (targetAltitude == null) {
        animatedAltitude.value = 0
        gaugeSwayMeters.value = 0
        if (gaugeSwayTimer) clearInterval(gaugeSwayTimer)
        return
      }
      gaugeSwayMeters.value = 0
      if (gaugeSwayTimer) clearInterval(gaugeSwayTimer)
      let swayDirection = 1
      gaugeSwayTimer = setInterval(() => {
        swayDirection *= -1
        const swayMagnitude = Math.min(20, Math.max(3, targetAltitude * 0.01))
        gaugeSwayMeters.value = swayDirection * swayMagnitude
      }, 850)
      const startAltitude = animatedAltitude.value
      const duration = 700
      const startedAt = Date.now()
      gaugeAnimationTimer = setInterval(() => {
        const progress = Math.min(1, (Date.now() - startedAt) / duration)
        const eased = 1 - (1 - progress) ** 3
        animatedAltitude.value = startAltitude + (targetAltitude - startAltitude) * eased
        if (progress >= 1) {
          animatedAltitude.value = targetAltitude
          if (gaugeAnimationTimer) clearInterval(gaugeAnimationTimer)
          gaugeAnimationTimer = undefined
        }
      }, 16)
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    if (gaugeAnimationTimer) clearInterval(gaugeAnimationTimer)
    if (gaugeSwayTimer) clearInterval(gaugeSwayTimer)
  })
  const altitudeStyle = computed<Record<string, string>>(() => ({
    '--meter-color': altitudeWarning.value.color,
    '--meter-color-deep': altitudeWarning.value.colorDeep,
  }))

  const switchMode = (mode: QueryMode) => {
    altitudeRequestGeneration += 1
    queryMode.value = mode
    loading.value = false
    errorMessage.value = ''
    permissionDenied.value = false
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

  const queryAltitude = async (point: AltitudePoint, generation: number) => {
    errorMessage.value = ''
    permissionDenied.value = false
    try {
      const payload = await getElevation(point)
      if (!isCurrentLocationRequest(generation)) return null

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
      if (!isCurrentLocationRequest(generation)) return null
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
    const generation = ++altitudeRequestGeneration
    queryMode.value = 'location'
    loading.value = true
    errorMessage.value = ''
    permissionDenied.value = false

    try {
      await ensureLocationAuthorization()
      if (!isCurrentLocationRequest(generation)) return

      const location = await getCurrentLocation()
      if (!isCurrentLocationRequest(generation)) return

      await queryAltitude(location, generation)
    } catch (error) {
      if (!isCurrentLocationRequest(generation)) return
      result.value = null
      if (error instanceof LocationAuthorizationError) {
        permissionDenied.value = true
        errorMessage.value = '请在微信设置中开启位置信息权限后重试'
      } else {
        const message = typeof error === 'object' && error !== null && 'message' in error ? String(error.message) : ''
        errorMessage.value = message.includes('定位') ? message : '请检查定位权限和网络连接后重试'
      }
    } finally {
      if (isCurrentLocationRequest(generation)) loading.value = false
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

  .mode-segmented-pill {
    display: flex;
    padding: 6rpx;
    margin: 16rpx 0 20rpx;
    border-radius: 999rpx;
    background: var(--theme-surface-2);
    border: 1rpx solid var(--theme-border);
  }

  .pill-item {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    flex: 1;
    height: 64rpx;
    border-radius: 999rpx;
    transition: all 250ms ease;
  }

  .pill-item.active {
    background: var(--theme-brand);
    box-shadow: 0 4rpx 12rpx var(--theme-shadow-xs);
  }

  .pill-label {
    color: var(--theme-text-secondary);
    font-size: 24rpx;
    font-weight: 600;
  }

  .pill-item.active .pill-label {
    color: var(--theme-surface);
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
    display: block;
    min-height: 0;
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
    position: relative;
    width: 100%;
    margin-top: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .dial-wrap {
    position: relative;
    width: 100%;
    max-width: 760rpx;
    height: 400rpx;
    margin: 0 auto;
    overflow: hidden;
    border-radius: 28rpx;
    background: #f4f5f6;
    color: var(--dial-panel-text);
    --dial-panel-text: #20242a;
    --dial-muted-text: #59616a;
    --dial-subtle-text: #747d87;
    --dial-track: #d0d5db;
    --dial-tick: #59616a;
    --dial-progress: #e6463d;
  }

  .dial-wrap--dark {
    background: #17191c;
    --dial-panel-text: #f3f4f5;
    --dial-muted-text: var(--theme-text-secondary);
    --dial-subtle-text: var(--theme-text-tertiary);
    --dial-track: #686f78;
    --dial-tick: var(--theme-text-secondary);
    --dial-progress: #e6463d;
  }

  .dial-track,
  .dial-arc {
    position: absolute;
    left: 50%;
    border-radius: 50%;
    transform: translateX(-50%);
    pointer-events: none;
  }

  .dial-track {
    top: 3%;
    width: 680rpx;
    height: 680rpx;
    background: conic-gradient(from 270deg, var(--dial-track) 0deg 180deg, transparent 180deg 360deg);
    -webkit-mask: radial-gradient(transparent 65%, #000 66% 79%, transparent 80%);
    mask: radial-gradient(transparent 65%, #000 66% 79%, transparent 80%);
  }

  .dial-arc {
    top: 10.5%;
    width: 620rpx;
    height: 620rpx;
    background: var(--dial-progress-gradient, conic-gradient(from 270deg, transparent 0% 100%));
    -webkit-mask-image: radial-gradient(transparent 62%, #000 63% 79%, transparent 80%);
    mask-image: radial-gradient(transparent 62%, #000 63% 79%, transparent 80%);
  }

  .dial-tick-layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .dial-tick-anchor {
    position: absolute;
    width: 0;
    height: 0;
  }

  .dial-tick {
    position: absolute;
    top: 0;
    left: 50%;
    width: 4rpx;
    height: 22rpx;
    background: var(--dial-tick);
    transform: translateX(-50%);
  }

  .dial-tick--major {
    height: 28rpx;
  }

  .dial-mark-label {
    position: absolute;
    top: 34rpx;
    left: 50%;
    color: var(--dial-tick);
    font-size: 22rpx;
    line-height: 1;
    white-space: nowrap;
  }

  .dial-needle-origin {
    position: absolute;
    bottom: 12%;
    left: 50%;
    width: 0;
    height: 0;
    transform: rotate(var(--needle-angle, -90deg));
    transform-origin: center;
    transition: transform 700ms cubic-bezier(0.22, 0.8, 0.25, 1);
    z-index: 2;
  }

  .dial-needle {
    position: absolute;
    left: -2.5rpx;
    bottom: 0;
    width: 5rpx;
    height: 221rpx;
    border-radius: 999rpx;
    background: var(--dial-progress);
    transform-origin: 50% 100%;
  }

  .dial-hub {
    position: absolute;
    bottom: 12%;
    left: 50%;
    width: 22rpx;
    height: 22rpx;
    border-radius: 50%;
    background: var(--dial-progress);
    transform: translate(-50%, 50%);
    z-index: 3;
  }

  .dial-readout {
    position: absolute;
    top: 41%;
    left: 50%;
    display: flex;
    align-items: center;
    flex-direction: column;
    transform: translateX(-50%);
    z-index: 1;
  }

  .dial-readout-caption {
    color: var(--dial-subtle-text);
    font-size: 24rpx;
    letter-spacing: 4rpx;
  }

  .dial-value-row {
    display: flex;
    align-items: baseline;
    margin-top: 12rpx;
  }

  .dial-value {
    color: var(--dial-panel-text);
    font-size: 108rpx;
    font-weight: 500;
    letter-spacing: -4rpx;
    line-height: 1;
    font-family: Arial, sans-serif;
  }

  .dial-unit {
    margin-top: 8rpx;
    color: var(--dial-muted-text);
    font-size: 26rpx;
  }

  .dial-live {
    position: absolute;
    bottom: 8%;
    left: 50%;
    color: var(--dial-subtle-text);
    font-size: 22rpx;
    letter-spacing: 3rpx;
    transform: translateX(-50%);
    white-space: nowrap;
    z-index: 4;
  }

  .dial-range-note {
    position: absolute;
    right: 5%;
    bottom: 8%;
    color: var(--dial-subtle-text);
    font-size: 18rpx;
  }

  .dashboard-telemetry-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12rpx;
    margin-top: 16rpx;
  }

  .telemetry-cell {
    flex: 1;
    padding: 14rpx 18rpx;
    border-radius: 12rpx;
    border: 1rpx solid var(--theme-border);
    background: var(--theme-surface-2);
  }

  .telemetry-cell-title {
    display: block;
    color: var(--theme-text-tertiary);
    font-size: 18rpx;
    font-weight: 600;
    letter-spacing: 1rpx;
  }

  .telemetry-cell-val {
    display: block;
    margin-top: 4rpx;
    color: var(--theme-text);
    font-size: 24rpx;
    font-weight: 800;
    font-family: monospace, sans-serif;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .dashboard-notice {
    display: flex;
    align-items: center;
    gap: 14rpx;
    margin-top: 16rpx;
    padding: 16rpx 20rpx;
    border-radius: 12rpx;
    border: 1rpx solid var(--theme-border);
    background: var(--theme-surface-2);
  }

  .dashboard-notice-indicator {
    width: 8rpx;
    height: 36rpx;
    border-radius: 4rpx;
    background: var(--meter-color, var(--theme-brand));
    box-shadow: 0 0 10rpx var(--meter-color, var(--theme-brand));
    animation: altitude-live-pulse 1.2s ease-in-out infinite;
    flex-shrink: 0;
  }

  .dashboard-notice-content {
    flex: 1;
    overflow: hidden;
  }

  .dashboard-notice-label {
    display: block;
    color: var(--meter-color, var(--theme-brand));
    font-size: 19rpx;
    font-weight: 800;
    letter-spacing: 1rpx;
  }

  .dashboard-notice-text {
    display: block;
    margin-top: 2rpx;
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

  @keyframes spinner-rotate {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .spinner-anim {
    display: inline-block;
    animation: spinner-rotate 0.9s linear infinite;
  }
</style>
