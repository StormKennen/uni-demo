<template>
  <PageLayout
    title="天气"
    :share-title="shareTitle"
    :share-path="sharePath"
    :share-timeline-query="shareQuery"
    :share-timeline-title="shareTitle"
    back-fallback="/pages/tools/index">
    <view class="weather-page">
      <view class="mode-tabs">
        <view class="mode-tab" :class="{ active: mode === 'location' }" @click="switchMode('location')">
          <uni-icons type="location" size="17" :color="mode === 'location' ? 'var(--theme-brand)' : 'var(--theme-text-tertiary)'" />
          <text>当前定位</text>
        </view>
        <view class="mode-tab" :class="{ active: mode === 'place' }" @click="switchMode('place')">
          <uni-icons type="map-pin" size="17" :color="mode === 'place' ? 'var(--theme-brand)' : 'var(--theme-text-tertiary)'" />
          <text>选择地点</text>
        </view>
      </view>

      <view v-if="mode === 'place' && !weather" class="action-card">
        <view class="card-heading">
          <view class="heading-icon heading-icon--blue"><uni-icons type="map-pin" size="22" color="var(--theme-brand)" /></view>
          <view class="heading-copy">
            <text class="heading-title">选择查询地点</text>
            <text class="heading-description">支持行政区、景区和已收录景点</text>
          </view>
        </view>
        <uni-data-picker
          v-model="regionSelection"
          :localdata="regionOptions"
          placeholder="选择省市区 / 景区 / 景点"
          popup-title="选择天气地点"
          :disabled="regionLoading"
          @change="onRegionChange" />
        <view class="place-actions">
          <text v-if="regionLoading" class="place-action-note">正在加载地点选项…</text>
          <text v-else-if="!regionLoaded" class="place-action-link" @click="loadPlaceOptions">重新加载地点选项</text>
          <text class="place-action-link" @click="chooseMapLocation">{{ mapLoading ? '正在打开地图…' : '地图选点' }}</text>
        </view>
        <view class="search-row">
          <input
            v-model="keyword"
            class="search-input"
            :maxlength="80"
            placeholder="也可以搜索地点名称"
            confirm-type="search"
            @confirm="searchPlaces" />
          <button class="search-button" :disabled="loadingPlaces" @click="searchPlaces">{{ loadingPlaces ? '搜索中' : '搜索' }}</button>
        </view>
        <text v-if="placeError" class="error-text">{{ placeError }}</text>
        <view v-else-if="loading" class="empty-state compact-state">
          <uni-icons type="spinner-cycle" size="24" color="var(--theme-brand)" />
          <text>正在查询天气…</text>
        </view>
        <view v-else-if="loadingPlaces" class="empty-state compact-state">
          <uni-icons type="spinner-cycle" size="24" color="var(--theme-brand)" />
          <text>正在搜索地点…</text>
        </view>
        <view v-else-if="places.length" class="place-list">
          <view v-for="place in places" :key="place.id" class="place-row" @click="selectPlace(place)">
            <view class="place-avatar"><uni-icons type="location" size="19" color="var(--theme-brand)" /></view>
            <view class="place-copy">
              <text class="place-name">{{ place.name }}</text>
              <text class="place-path">{{ place.fullName }}</text>
            </view>
            <uni-icons type="right" size="17" color="var(--theme-text-tertiary)" />
          </view>
        </view>
        <view v-else class="empty-state compact-state">
          <text>搜索一个地点，查看当地实时天气</text>
        </view>
      </view>

      <view v-else-if="mode === 'location' && !weather" class="action-card empty-action-card">
        <view class="empty-icon empty-icon--blue"><uni-icons type="location" size="38" color="var(--theme-brand)" /></view>
        <text class="panel-title">查询当前位置天气</text>
        <text class="panel-description">仅用于本次查询，不保存你的定位信息。</text>
        <button class="primary-button" :disabled="loading" @click="queryCurrentWeather">
          {{ loading ? '正在定位…' : '定位并查询' }}
        </button>
        <button v-if="permissionDenied" class="secondary-button" @click="openLocationSettings">去开启定位权限</button>
        <text v-if="errorMessage" class="error-text">{{ errorMessage }}</text>
      </view>

      <view v-else class="weather-content">
        <view class="weather-hero" :class="heroClass">
          <view class="hero-glow hero-glow--one" />
          <view class="hero-glow hero-glow--two" />
          <view class="hero-top">
            <view class="hero-location">
              <view class="location-line">
                <uni-icons type="location-filled" size="17" color="rgba(255,255,255,.86)" />
                <text>{{ locationName || '当前位置' }}</text>
              </view>
              <text class="hero-updated">{{ formatObservedAt(weather?.current.observedAt) }} 更新</text>
            </view>
            <view class="hero-actions">
              <view v-if="!loading && weather" class="hero-action" @click="saveWeatherToMemo">存入备忘录</view>
              <view class="hero-action" :class="{ 'hero-action--loading': loading }" @click="refreshWeather">
                <uni-icons type="refresh" size="19" color="#fff" />
              </view>
            </view>
          </view>

          <view class="hero-main">
            <view class="hero-temperature">
              <text class="temperature">{{ displayNumber(weather?.current.temperature) }}</text>
              <text class="temperature-unit">°</text>
            </view>
            <view class="hero-condition">
              <text class="weather-symbol">{{ weatherSymbol(weather?.current.conditionCode) }}</text>
              <text class="condition-text">{{ weather?.current.conditionText || '未知天气' }}</text>
            </view>
          </view>
          <text class="hero-feels"
            >体感 {{ displayNumber(weather?.current.apparentTemperature) }}° · {{ weather?.current.windDirectionText || '未知风向' }}</text
          >

          <view class="hero-metrics">
            <view class="hero-metric">
              <text class="metric-label">湿度</text>
              <text class="metric-value">{{ displayNumber(weather?.current.humidity) }}%</text>
            </view>
            <view class="hero-metric">
              <text class="metric-label">风速</text>
              <text class="metric-value">{{ displayNumber(weather?.current.windSpeed) }}<text class="metric-unit"> km/h</text></text>
            </view>
            <view class="hero-metric">
              <text class="metric-label">降水</text>
              <text class="metric-value">{{ displayNumber(weather?.current.precipitation, 1) }}<text class="metric-unit"> mm</text></text>
            </view>
          </view>
        </view>

        <view v-if="loading" class="refreshing-tip">
          <uni-icons type="spinner-cycle" size="16" color="var(--theme-brand)" />
          <text>正在更新天气…</text>
        </view>
        <view v-if="errorMessage" class="inline-error"
          ><text>{{ errorMessage }}</text
          ><text class="retry-text" @click="refreshWeather">重试</text></view
        >

        <view class="section-card hourly-card">
          <view class="section-title-row">
            <view>
              <text class="section-title">逐小时预报</text>
              <text class="section-subtitle">未来 24 小时</text>
            </view>
            <text class="section-hint">降雨概率</text>
          </view>
          <scroll-view v-if="weather?.hourly.length" scroll-x class="hourly-scroll" :show-scrollbar="false">
            <view v-for="item in weather?.hourly" :key="item.time" class="hour-item">
              <text class="hour-time">{{ formatHour(item.time) }}</text>
              <text class="hour-symbol">{{ weatherSymbol(item.conditionCode) }}</text>
              <text class="hour-temperature">{{ displayNumber(item.temperature) }}°</text>
              <text class="hour-rain">{{ displayNumber(item.precipitationProbability) }}%</text>
            </view>
          </scroll-view>
          <view v-else class="empty-state"><text>暂无逐小时预报</text></view>
        </view>

        <view class="section-card details-card">
          <view class="section-title-row"><text class="section-title">今日详情</text><text class="section-hint">实时数据</text></view>
          <view class="details-grid">
            <view class="detail-item"
              ><text class="detail-label">能见度</text
              ><text class="detail-value">{{ displayNumber(weather?.current.visibility) }} km</text></view
            >
            <view class="detail-item"
              ><text class="detail-label">云量</text
              ><text class="detail-value">{{ displayNumber(weather?.current.cloudCover) }}%</text></view
            >
            <view class="detail-item"
              ><text class="detail-label">气压</text
              ><text class="detail-value">{{ displayNumber(weather?.current.pressure) }} hPa</text></view
            >
            <view class="detail-item"
              ><text class="detail-label">阵风</text
              ><text class="detail-value">{{ displayNumber(weather?.current.windGust) }} km/h</text></view
            >
          </view>
        </view>

        <view class="section-card daily-card">
          <view class="section-title-row"><text class="section-title">未来 7 天</text><text class="section-hint">天气趋势</text></view>
          <view v-if="weather?.daily.length">
            <view v-for="(item, index) in weather?.daily" :key="item.date" class="daily-row">
              <view class="daily-date"
                ><text class="daily-day">{{ formatDay(item.date, index) }}</text
                ><text class="daily-weekday">{{ formatWeekday(item.date) }}</text></view
              >
              <text class="daily-symbol">{{ weatherSymbol(item.conditionCode) }}</text>
              <view class="daily-condition"
                ><text>{{ item.conditionText }}</text
                ><text class="daily-rain">降水 {{ displayNumber(item.precipitationProbability) }}%</text></view
              >
              <text class="daily-temp"
                ><text class="daily-low">{{ displayNumber(item.temperatureMin) }}°</text><text> / </text
                >{{ displayNumber(item.temperatureMax) }}°</text
              >
            </view>
          </view>
          <view v-else class="empty-state"><text>暂无 7 日预报</text></view>
        </view>

        <text class="updated-at"
          >数据源 {{ weather?.metadata.provider || '天气服务' }} · {{ weather?.metadata.cached ? '短缓存' : '实时请求' }}</text
        >
      </view>
    </view>
  </PageLayout>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { onLoad } from '@dcloudio/uni-app'
  import { navigateToMemoEditorWithQuerySnapshot } from '../memo/query-snapshot-navigation'
  import { getWeather, type WeatherPoint, type WeatherResult, type WeatherSourceMode } from './weather-api'
  import { buildWeatherShare, parseWeatherShare } from './share'
  import { getAltitudePlaces, getAltitudePlacesOptions } from '@/services/apifox/NODEJSDEMO/ALTITUDE/apifox'

  interface AltitudeRegionNode {
    value: string
    text: string
    level: string
    placeId?: string
    children?: AltitudeRegionNode[]
  }

  interface PrecollectedAltitudePlace {
    id: string
    level: string
    name: string
    fullName: string
    latitude: number
    longitude: number
    altitudeMeters: number | null
  }

  class LocationAuthorizationError extends Error {
    readonly code = 'LOCATION_AUTHORIZATION_DENIED'

    constructor() {
      super('定位权限未开启')
      this.name = 'LocationAuthorizationError'
    }
  }

  type LocationResult = { latitude: number; longitude: number }

  const mode = ref<WeatherSourceMode>('location')
  const weather = ref<WeatherResult | null>(null)
  const loading = ref(false)
  const mapLoading = ref(false)
  const permissionDenied = ref(false)
  const errorMessage = ref('')
  const keyword = ref('')
  const loadingPlaces = ref(false)
  const placeError = ref('')
  const places = ref<PrecollectedAltitudePlace[]>([])
  const regionOptions = ref<AltitudeRegionNode[]>([])
  const regionPlaces = ref<Record<string, PrecollectedAltitudePlace>>({})
  const regionSelection = ref('')
  const regionLoaded = ref(false)
  const regionLoading = ref(false)
  const locationName = ref('当前位置')
  const shareTitle = ref('实时天气｜查询当前位置天气')
  const sharePath = ref('/subPackages/tools/weather/index?mode=location')
  const shareQuery = ref('mode=location')
  const lastPoint = ref<WeatherPoint | null>(null)
  let requestSequence = 0

  const heroClass = computed(() => {
    const code = weather.value?.current.conditionCode
    if (code === 0) return 'weather-hero--clear'
    if (code !== null && code !== undefined && code >= 95) return 'weather-hero--storm'
    if (code !== null && code !== undefined && code >= 71 && code <= 86) return 'weather-hero--cold'
    if (code !== null && code !== undefined && code >= 51 && code <= 67) return 'weather-hero--rain'
    return 'weather-hero--cloudy'
  })

  const syncShare = (point: WeatherPoint) => {
    const share = buildWeatherShare(point)
    shareTitle.value = share.title
    sharePath.value = share.path
    shareQuery.value = share.query
  }

  const syncModeShare = (next: WeatherSourceMode) => {
    if (next === 'location') {
      syncShare({ latitude: 0, longitude: 0, coordinateSystem: 'wgs84', source: 'location' })
      return
    }
    shareTitle.value = next === 'place' ? '地点实时天气' : '地图选点｜实时天气'
    shareQuery.value = `mode=${next}`
    sharePath.value = `/subPackages/tools/weather/index?${shareQuery.value}`
  }

  const queryWeather = async (point: WeatherPoint) => {
    const sequence = ++requestSequence
    loading.value = true
    errorMessage.value = ''
    lastPoint.value = point
    try {
      const result = await getWeather(point)
      if (sequence !== requestSequence) return
      weather.value = result
      locationName.value = point.name || (point.source === 'location' ? '当前位置' : '已选地点')
      syncShare(point)
    } catch {
      if (sequence !== requestSequence) return
      errorMessage.value = '天气服务暂时不可用，请稍后重试'
      if (!weather.value) weather.value = null
    } finally {
      if (sequence === requestSequence) loading.value = false
    }
  }

  const saveWeatherToMemo = () => {
    const point = lastPoint.value
    const current = weather.value?.current
    if (!point || !current) return
    navigateToMemoEditorWithQuerySnapshot({
      type: 'weather',
      title: `${locationName.value || point.name || '天气'} 天气`,
      capturedAt: weather.value?.metadata.queriedAt || new Date().toISOString(),
      location: {
        name: locationName.value || point.name || '已选地点',
        latitude: point.latitude,
        longitude: point.longitude,
        coordinateSystem: point.coordinateSystem,
        source: point.source,
        ...(point.placeId ? { placeId: point.placeId } : {}),
      },
      snapshot: {
        temperature: current.temperature,
        apparentTemperature: current.apparentTemperature,
        conditionText: current.conditionText,
        humidity: current.humidity,
        precipitation: current.precipitation,
        windSpeed: current.windSpeed,
        observedAt: current.observedAt,
        hourly: weather.value?.hourly,
        daily: weather.value?.daily,
        provider: weather.value?.metadata.provider,
      },
    })
  }

  const refreshWeather = () => {
    if (lastPoint.value && !loading.value) queryWeather(lastPoint.value)
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

  const getCurrentLocation = (): Promise<LocationResult> =>
    new Promise((resolve, reject) => {
      uni.getLocation({
        type: 'wgs84',
        isHighAccuracy: true,
        success: location => resolve({ latitude: location.latitude, longitude: location.longitude }),
        fail: reject,
      })
    })

  const queryCurrentWeather = async () => {
    if (loading.value) return
    permissionDenied.value = false
    errorMessage.value = ''
    loading.value = true
    try {
      await ensureLocationAuthorization()
      const location = await getCurrentLocation()
      loading.value = false
      await queryWeather({ ...location, coordinateSystem: 'wgs84', source: 'location', name: '当前位置' })
    } catch (error) {
      if (error instanceof LocationAuthorizationError) {
        permissionDenied.value = true
        errorMessage.value = '请在系统设置中开启位置信息权限后重试'
      } else {
        errorMessage.value = '当前无法获取定位，请检查权限和网络连接'
      }
      loading.value = false
    }
  }

  const openLocationSettings = () => {
    // #ifdef MP-WEIXIN
    uni.openSetting({
      success: setting => {
        if (setting.authSetting?.['scope.userLocation']) queryCurrentWeather()
      },
    })
    // #endif
    // #ifndef MP-WEIXIN
    uni.showToast({ title: '请在浏览器设置中允许定位', icon: 'none' })
    // #endif
  }

  const chooseMapLocation = () => {
    if (mapLoading.value) return
    mapLoading.value = true
    errorMessage.value = ''
    // #ifdef MP-WEIXIN
    uni.chooseLocation({
      success: location => {
        queryWeather({
          latitude: location.latitude,
          longitude: location.longitude,
          coordinateSystem: 'gcj02',
          source: 'map',
          name: location.name || location.address || '地图选点',
        })
      },
      fail: error => {
        errorMessage.value = error.errMsg?.includes('cancel') ? '已取消地图选点' : '地图选点暂不可用'
      },
      complete: () => {
        mapLoading.value = false
      },
    })
    // #endif
    // #ifndef MP-WEIXIN
    mapLoading.value = false
    errorMessage.value = '当前环境暂无法打开地图选点，请改用地点搜索'
    // #endif
  }

  const loadPlaceOptions = async () => {
    if (regionLoaded.value || regionLoading.value) return
    regionLoading.value = true
    placeError.value = ''
    try {
      const response = (await getAltitudePlacesOptions()) as unknown as {
        items?: AltitudeRegionNode[]
        places?: PrecollectedAltitudePlace[]
      }
      regionOptions.value = response.items || []
      regionPlaces.value = Object.fromEntries((response.places || []).map(item => [item.id, item]))
      regionLoaded.value = true
    } catch {
      placeError.value = '地点选项加载失败，可直接搜索地点名称'
    } finally {
      regionLoading.value = false
    }
  }

  const onRegionChange = (event: { detail?: { value?: Array<{ value?: string }> } }) => {
    const values = event.detail?.value || []
    const placeId = values[values.length - 1]?.value
    const place = placeId ? regionPlaces.value[placeId] : undefined
    if (place) selectPlace(place)
  }

  const searchPlaces = async () => {
    const searchKeyword = keyword.value.trim()
    if (!searchKeyword || loadingPlaces.value) return
    loadingPlaces.value = true
    placeError.value = ''
    places.value = []
    try {
      const response = (await getAltitudePlaces({ keyword: searchKeyword, page: 1, pageSize: 30 })) as unknown as {
        items?: PrecollectedAltitudePlace[]
      }
      places.value = response.items || []
      if (!places.value.length) placeError.value = '没有找到匹配地点，请换个关键词试试'
    } catch {
      placeError.value = '地点搜索失败，请稍后重试'
    } finally {
      loadingPlaces.value = false
    }
  }

  const selectPlace = (place: PrecollectedAltitudePlace) => {
    queryWeather({
      latitude: place.latitude,
      longitude: place.longitude,
      coordinateSystem: 'wgs84',
      source: 'place',
      placeId: place.id,
      name: place.name,
    })
  }

  const switchMode = async (next: WeatherSourceMode) => {
    if (mode.value === next && !weather.value) return
    requestSequence += 1
    mode.value = next
    weather.value = null
    lastPoint.value = null
    errorMessage.value = ''
    permissionDenied.value = false
    locationName.value = next === 'location' ? '当前位置' : ''
    if (next === 'place') await loadPlaceOptions()
    syncModeShare(next)
  }

  const displayNumber = (value: number | null | undefined, digits = 0) => {
    if (value === null || value === undefined || !Number.isFinite(value)) return '--'
    return value.toFixed(digits).replace(/\.0+$/, '')
  }

  const weatherSymbol = (code: number | null | undefined) => {
    if (code === 0) return '☀️'
    if (code === 1 || code === 2) return '🌤️'
    if (code === 3) return '☁️'
    if (code === 45 || code === 48) return '🌫️'
    if (code !== null && code !== undefined && code >= 51 && code <= 67) return '🌦️'
    if (code !== null && code !== undefined && code >= 71 && code <= 86) return '🌨️'
    if (code !== null && code !== undefined && code >= 95) return '⛈️'
    return '🌤️'
  }

  const formatHour = (time: string) => (time.length >= 16 ? time.slice(11, 16) : '--:--')

  const formatDay = (date: string, index: number) => {
    if (index === 0) return '今天'
    return date.length >= 10 ? date.slice(5).replace('-', '/') : date
  }

  const formatWeekday = (date: string) => {
    const parsed = new Date(`${date}T00:00:00`)
    if (Number.isNaN(parsed.getTime())) return ''
    return `周${'日一二三四五六'[parsed.getDay()]}`
  }

  const formatObservedAt = (time: string | undefined) => {
    if (!time) return '刚刚'
    const value = time.replace('T', ' ')
    return value.length >= 16 ? value.slice(11, 16) : value
  }

  onLoad(async options => {
    const state = parseWeatherShare((options || {}) as Record<string, string | undefined>)
    mode.value = state.mode
    if (state.mode === 'map' && state.point) {
      await queryWeather(state.point)
      return
    }
    if (state.mode === 'place' && state.placeId) {
      await loadPlaceOptions()
      const place = regionPlaces.value[state.placeId]
      if (place) {
        selectPlace(place)
        return
      }
    }
    if (state.mode === 'place') await loadPlaceOptions()
    syncModeShare(state.mode)
  })
</script>

<style lang="scss" scoped>
  .weather-page {
    min-height: 100vh;
    padding: 28rpx 28rpx 52rpx;
    box-sizing: border-box;
    background: var(--theme-bg);
  }

  .mode-tabs {
    display: flex;
    padding: 6rpx;
    border-radius: 20rpx;
    background: var(--theme-surface-2);
  }

  .mode-tab {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    gap: 8rpx;
    height: 72rpx;
    border-radius: 16rpx;
    color: var(--theme-text-secondary);
    font-size: 24rpx;
    transition: all 0.2s ease;
  }

  .mode-tab.active {
    background: var(--theme-surface);
    color: var(--theme-brand);
    font-weight: 700;
    box-shadow: 0 6rpx 18rpx var(--theme-shadow-xs);
  }

  .action-card,
  .section-card {
    margin-top: 24rpx;
    border-radius: 28rpx;
    background: var(--theme-surface);
    box-shadow: 0 12rpx 36rpx var(--theme-shadow-xs);
  }

  .action-card {
    padding: 30rpx;
  }

  .card-heading {
    display: flex;
    align-items: center;
    margin-bottom: 28rpx;
  }

  .heading-icon,
  .empty-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 22rpx;
  }

  .heading-icon {
    width: 72rpx;
    height: 72rpx;
    margin-right: 20rpx;
  }

  .heading-icon--blue,
  .empty-icon--blue {
    background: rgba(14, 165, 233, 0.12);
  }

  .heading-copy {
    display: flex;
    flex: 1;
    flex-direction: column;
  }

  .heading-title,
  .panel-title {
    color: var(--theme-text);
    font-size: 32rpx;
    font-weight: 750;
  }

  .heading-description,
  .panel-description {
    margin-top: 8rpx;
    color: var(--theme-text-secondary);
    font-size: 23rpx;
    line-height: 1.55;
  }

  .place-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 16rpx;
    font-size: 22rpx;
  }

  .place-action-link {
    color: var(--theme-brand);
  }

  .place-action-note {
    color: var(--theme-text-tertiary);
  }

  .search-row {
    display: flex;
    align-items: center;
    margin-top: 20rpx;
  }

  .search-input {
    flex: 1;
    height: 82rpx;
    padding: 0 22rpx;
    border-radius: 18rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text);
    font-size: 25rpx;
    box-sizing: border-box;
  }

  .search-button,
  .primary-button,
  .secondary-button {
    border: 0;
    border-radius: 18rpx;
    font-size: 26rpx;
  }

  .search-button {
    width: 132rpx;
    height: 82rpx;
    margin-left: 14rpx;
    padding: 0;
    background: var(--theme-brand);
    color: #fff;
    line-height: 82rpx;
  }

  .empty-action-card {
    display: flex;
    align-items: center;
    flex-direction: column;
    padding: 62rpx 32rpx 42rpx;
    text-align: center;
  }

  .empty-icon {
    width: 116rpx;
    height: 116rpx;
    margin-bottom: 26rpx;
    border-radius: 36rpx;
  }

  .empty-icon--teal {
    background: rgba(20, 184, 166, 0.13);
  }

  .panel-description {
    max-width: 560rpx;
    margin-top: 14rpx;
    text-align: center;
  }

  .primary-button,
  .secondary-button {
    width: 100%;
    height: 88rpx;
    margin-top: 28rpx;
    padding: 0;
    line-height: 88rpx;
  }

  .primary-button {
    background: var(--theme-brand);
    color: #fff;
    box-shadow: 0 10rpx 20rpx rgba(14, 165, 233, 0.2);
  }

  .secondary-button {
    height: 74rpx;
    margin-top: 16rpx;
    background: var(--theme-surface-2);
    color: var(--theme-brand);
    line-height: 74rpx;
  }

  .place-list {
    margin-top: 22rpx;
  }

  .place-row {
    display: flex;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid var(--theme-border);
  }

  .place-row:last-child {
    border-bottom: 0;
  }

  .place-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 58rpx;
    height: 58rpx;
    margin-right: 16rpx;
    border-radius: 18rpx;
    background: var(--theme-surface-2);
  }

  .place-copy {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    margin-right: 16rpx;
  }

  .place-name {
    color: var(--theme-text);
    font-size: 28rpx;
    font-weight: 700;
  }

  .place-path {
    overflow: hidden;
    margin-top: 6rpx;
    color: var(--theme-text-secondary);
    font-size: 21rpx;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .weather-hero {
    position: relative;
    overflow: hidden;
    margin-top: 24rpx;
    padding: 32rpx 30rpx 26rpx;
    border-radius: 32rpx;
    color: #fff;
    box-shadow: 0 18rpx 38rpx rgba(14, 165, 233, 0.2);
  }

  .weather-hero--clear {
    background: linear-gradient(135deg, #0284c7 0%, #38bdf8 54%, #7dd3fc 100%);
  }

  .weather-hero--cloudy {
    background: linear-gradient(135deg, #2563eb 0%, #38bdf8 100%);
  }

  .weather-hero--rain {
    background: linear-gradient(135deg, #334155 0%, #0f766e 100%);
  }

  .weather-hero--cold {
    background: linear-gradient(135deg, #0f766e 0%, #0891b2 100%);
  }

  .weather-hero--storm {
    background: linear-gradient(135deg, #312e81 0%, #475569 100%);
  }

  .hero-glow {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.12);
  }

  .hero-glow--one {
    top: -120rpx;
    right: -70rpx;
    width: 340rpx;
    height: 340rpx;
  }

  .hero-glow--two {
    right: 110rpx;
    bottom: -180rpx;
    width: 300rpx;
    height: 300rpx;
    background: rgba(255, 255, 255, 0.07);
  }

  .hero-top,
  .location-line,
  .hero-actions,
  .hero-main,
  .hero-metrics,
  .hero-metric,
  .section-title-row,
  .daily-row,
  .daily-date {
    display: flex;
  }

  .hero-top,
  .section-title-row {
    align-items: flex-start;
    justify-content: space-between;
  }

  .hero-location {
    position: relative;
    z-index: 1;
  }

  .location-line {
    align-items: center;
    gap: 6rpx;
    font-size: 29rpx;
    font-weight: 700;
  }

  .hero-updated {
    display: block;
    margin-top: 8rpx;
    color: rgba(255, 255, 255, 0.7);
    font-size: 21rpx;
  }

  .hero-actions {
    position: relative;
    z-index: 1;
  }

  .hero-action {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 58rpx;
    height: 58rpx;
    border: 1rpx solid rgba(255, 255, 255, 0.28);
    border-radius: 18rpx;
    background: rgba(255, 255, 255, 0.14);
  }

  .hero-action--loading {
    opacity: 0.55;
  }

  .hero-main {
    position: relative;
    z-index: 1;
    align-items: center;
    justify-content: space-between;
    margin-top: 38rpx;
  }

  .hero-temperature {
    display: flex;
    align-items: flex-start;
  }

  .temperature {
    font-size: 136rpx;
    font-weight: 300;
    line-height: 0.9;
    letter-spacing: -5rpx;
  }

  .temperature-unit {
    margin: 6rpx 0 0 8rpx;
    font-size: 42rpx;
    line-height: 1;
  }

  .hero-condition {
    display: flex;
    align-items: center;
    flex-direction: column;
    min-width: 130rpx;
  }

  .weather-symbol {
    font-size: 74rpx;
    line-height: 1;
  }

  .condition-text {
    margin-top: 12rpx;
    font-size: 27rpx;
    font-weight: 700;
  }

  .hero-feels {
    position: relative;
    z-index: 1;
    display: block;
    margin-top: 20rpx;
    color: rgba(255, 255, 255, 0.82);
    font-size: 23rpx;
  }

  .hero-metrics {
    position: relative;
    z-index: 1;
    gap: 10rpx;
    margin-top: 34rpx;
  }

  .hero-metric {
    flex: 1;
    align-items: center;
    flex-direction: column;
    padding: 16rpx 8rpx;
    border: 1rpx solid rgba(255, 255, 255, 0.16);
    border-radius: 18rpx;
    background: rgba(255, 255, 255, 0.11);
  }

  .metric-label {
    color: rgba(255, 255, 255, 0.68);
    font-size: 20rpx;
  }

  .metric-value {
    margin-top: 7rpx;
    font-size: 25rpx;
    font-weight: 700;
  }

  .metric-unit {
    font-size: 18rpx;
    font-weight: 400;
  }

  .refreshing-tip,
  .inline-error {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    margin-top: 16rpx;
    color: var(--theme-text-secondary);
    font-size: 21rpx;
  }

  .inline-error {
    padding: 16rpx 20rpx;
    border-radius: 14rpx;
    background: rgba(239, 68, 68, 0.08);
    color: var(--theme-danger);
  }

  .retry-text {
    color: var(--theme-brand);
    font-weight: 700;
  }

  .section-card {
    padding: 28rpx;
  }

  .section-title-row {
    align-items: center;
  }

  .section-title {
    display: block;
    color: var(--theme-text);
    font-size: 30rpx;
    font-weight: 750;
  }

  .section-subtitle {
    display: block;
    margin-top: 6rpx;
    color: var(--theme-text-tertiary);
    font-size: 20rpx;
  }

  .section-hint {
    color: var(--theme-text-tertiary);
    font-size: 21rpx;
  }

  .hourly-scroll {
    width: 100%;
    margin-top: 24rpx;
    white-space: nowrap;
  }

  .hour-item {
    display: inline-flex;
    align-items: center;
    flex-direction: column;
    width: 116rpx;
    margin-right: 10rpx;
    padding: 18rpx 8rpx;
    border-radius: 18rpx;
    background: var(--theme-surface-2);
  }

  .hour-item:first-child {
    background: rgba(14, 165, 233, 0.12);
  }

  .hour-time {
    color: var(--theme-text-secondary);
    font-size: 21rpx;
  }

  .hour-symbol {
    margin-top: 18rpx;
    font-size: 38rpx;
    line-height: 1;
  }

  .hour-temperature {
    margin-top: 16rpx;
    color: var(--theme-text);
    font-size: 27rpx;
    font-weight: 700;
  }

  .hour-rain,
  .daily-rain {
    margin-top: 8rpx;
    color: var(--theme-brand);
    font-size: 20rpx;
  }

  .details-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12rpx;
    margin-top: 22rpx;
  }

  .detail-item {
    padding: 18rpx 20rpx;
    border-radius: 17rpx;
    background: var(--theme-surface-2);
  }

  .detail-label {
    display: block;
    color: var(--theme-text-tertiary);
    font-size: 20rpx;
  }

  .detail-value {
    display: block;
    margin-top: 9rpx;
    color: var(--theme-text);
    font-size: 24rpx;
    font-weight: 700;
  }

  .daily-card {
    padding-bottom: 12rpx;
  }

  .daily-row {
    align-items: center;
    padding: 22rpx 0;
    border-bottom: 1rpx solid var(--theme-border);
  }

  .daily-row:last-child {
    border-bottom: 0;
  }

  .daily-date {
    align-items: flex-start;
    flex-direction: column;
    width: 112rpx;
  }

  .daily-day {
    color: var(--theme-text);
    font-size: 25rpx;
    font-weight: 700;
  }

  .daily-weekday {
    margin-top: 4rpx;
    color: var(--theme-text-tertiary);
    font-size: 19rpx;
  }

  .daily-symbol {
    width: 58rpx;
    font-size: 35rpx;
  }

  .daily-condition {
    display: flex;
    flex: 1;
    flex-direction: column;
    color: var(--theme-text-secondary);
    font-size: 23rpx;
  }

  .daily-condition .daily-rain {
    margin-top: 5rpx;
  }

  .daily-temp {
    width: 146rpx;
    color: var(--theme-text);
    font-size: 24rpx;
    text-align: right;
  }

  .daily-low {
    color: var(--theme-text-tertiary);
  }

  .updated-at {
    display: block;
    margin-top: 22rpx;
    color: var(--theme-text-tertiary);
    font-size: 20rpx;
    text-align: center;
  }

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 96rpx;
    color: var(--theme-text-tertiary);
    font-size: 22rpx;
  }

  .compact-state {
    min-height: 76rpx;
  }

  .error-text {
    display: block;
    margin-top: 18rpx;
    color: var(--theme-danger);
    font-size: 22rpx;
    line-height: 1.5;
    text-align: center;
  }
</style>
