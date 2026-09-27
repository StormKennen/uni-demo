<template>
  <PageLayout
    title="查询海拔"
    share-title="查询海拔｜查询当前位置海拔"
    share-path="/subPackages/tools/altitude/index"
    share-timeline-title="查询海拔"
    back-fallback="/pages/tools/index">
    <view class="altitude-page">
      <view class="intro-card">
        <view class="intro-icon">
          <uni-icons type="location" size="30" color="var(--theme-brand)" />
        </view>
        <view class="intro-copy">
          <text class="intro-title">查询当前位置海拔</text>
          <text class="intro-description">允许定位后，查询你所在位置的海拔高度</text>
        </view>
      </view>

      <view class="result-card" :class="{ 'result-card-loading': loading }">
        <view v-if="showLocationPrompt" class="state-box location-consent-box">
          <view class="location-consent-icon">
            <uni-icons type="location" size="32" color="var(--theme-brand)" />
          </view>
          <text class="state-title">需要使用位置信息</text>
          <text class="state-description">仅用于查询并展示当前位置海拔，不保存位置历史。你可以在微信设置中随时关闭定位权限。</text>
          <button class="consent-button" :disabled="loading" @click="requestLocationAndQuery">允许定位并查询</button>
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

        <view v-else-if="result" class="success-box">
          <text class="result-label">海拔高度</text>
          <view class="altitude-value-row">
            <text class="altitude-value">{{ result.altitudeMeters.toFixed(1) }}</text>
            <text class="altitude-unit">米</text>
          </view>
          <text class="result-hint">相对于平均海平面高度</text>
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

      <button v-if="!showLocationPrompt" class="locate-button" :disabled="loading" @click="queryCurrentAltitude">
        {{ loading ? '查询中…' : result || errorMessage ? '重新定位' : '查询当前位置海拔' }}
      </button>

      <text class="source-note">海拔数据由高程服务提供，仅供参考</text>
    </view>
  </PageLayout>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { getAltitudeCurrent } from '@/services/apifox/NODEJSDEMO/ALTITUDE/apifox'
  import type { getAltitudeCurrentRes } from '@/services/apifox/NODEJSDEMO/ALTITUDE/interface'
  import { reportToolVisit } from '@/utils/tracker'

  interface LocationCoordinate {
    latitude: number
    longitude: number
  }

  interface CurrentAltitudeViewModel {
    latitude: number
    longitude: number
    altitudeMeters: number
    unit: 'm'
    source: string
    queriedAt: string
  }

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
  const showLocationPrompt = ref(true)
  const result = ref<CurrentAltitudeViewModel | null>(null)

  const normalizeAltitudeResult = (payload: getAltitudeCurrentRes): CurrentAltitudeViewModel => {
    if (
      typeof payload.latitude !== 'number' ||
      typeof payload.longitude !== 'number' ||
      typeof payload.altitudeMeters !== 'number' ||
      typeof payload.queriedAt !== 'string'
    ) {
      throw new Error('海拔数据格式异常')
    }

    return {
      latitude: payload.latitude,
      longitude: payload.longitude,
      altitudeMeters: payload.altitudeMeters,
      unit: 'm',
      source: payload.source || 'open-meteo',
      queriedAt: payload.queriedAt,
    }
  }

  const formattedQueryTime = computed(() => {
    if (!result.value) return ''
    return result.value.queriedAt.replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC')
  })

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

  const getCurrentLocation = (): Promise<LocationCoordinate> =>
    new Promise((resolve, reject) => {
      uni.getLocation({
        type: 'gcj02',
        success: location => resolve({ latitude: location.latitude, longitude: location.longitude }),
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
      result.value = normalizeAltitudeResult(await getAltitudeCurrent(location))
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

  .state-box,
  .success-box {
    display: flex;
    align-items: center;
    flex-direction: column;
    text-align: center;
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
