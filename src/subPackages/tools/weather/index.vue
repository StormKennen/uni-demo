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
        <view class="mode-tab" :class="{ active: mode === 'location' }" @click="switchMode('location')">当前定位</view>
        <view class="mode-tab" :class="{ active: mode === 'place' }" @click="switchMode('place')">选择地点</view>
        <view class="mode-tab" :class="{ active: mode === 'map' }" @click="switchMode('map')">地图选点</view>
      </view>

      <view v-if="mode === 'place' && !weather" class="place-panel">
        <uni-data-picker :localdata="regionOptions" placeholder="选择省市区/景区/景点" popup-title="选择地点" @change="onRegionChange" />
        <view class="search-row">
          <input v-model="keyword" class="search-input" placeholder="或输入地点名称搜索" confirm-type="search" @confirm="searchPlaces" />
          <button class="search-button" :disabled="loadingPlaces" @click="searchPlaces">{{ loadingPlaces ? '搜索中' : '搜索' }}</button>
        </view>
        <view v-if="placeError" class="error-text">{{ placeError }}</view>
        <view v-for="place in places" :key="place.id" class="place-row" @click="selectPlace(place)">
          <view class="place-copy">
            <text class="place-name">{{ place.name }}</text>
            <text class="place-path">{{ place.fullName }}</text>
          </view>
          <text class="place-altitude">{{ place.altitudeMeters == null ? '待查' : `${place.altitudeMeters}m` }}</text>
        </view>
      </view>

      <view v-else-if="mode === 'map' && !weather" class="map-panel">
        <uni-icons type="map" size="44" color="var(--theme-brand)" />
        <text class="panel-title">从地图选择天气位置</text>
        <text class="panel-description">选择后会按该坐标查询实时天气，不保存天气历史。</text>
        <button class="primary-button" @click="chooseMapLocation">{{ mapLoading ? '打开中…' : '打开地图选点' }}</button>
        <text v-if="errorMessage" class="error-text">{{ errorMessage }}</text>
      </view>

      <view v-else-if="mode === 'location' && !weather" class="location-panel">
        <uni-icons type="location" size="44" color="var(--theme-brand)" />
        <text class="panel-title">查询当前位置天气</text>
        <text class="panel-description">需要定位权限，仅用于本次天气查询。</text>
        <button class="primary-button" :disabled="loading" @click="queryCurrentWeather">{{
          loading ? '查询中…' : '允许定位并查询'
        }}</button>
        <text v-if="errorMessage" class="error-text">{{ errorMessage }}</text>
      </view>

      <view v-else class="weather-content">
        <view class="current-card">
          <view class="current-head">
            <view>
              <text class="eyebrow">{{ locationName || '当前位置' }}</text>
              <text class="condition-text">{{ weather?.current.conditionText }}</text>
            </view>
            <uni-icons type="refresh" size="22" color="var(--theme-text-tertiary)" @click="refreshWeather" />
          </view>
          <view class="temperature-row">
            <text class="temperature">{{ weather?.current.temperature }}</text>
            <text class="temperature-unit">°C</text>
          </view>
          <text class="feels-like">体感 {{ weather?.current.apparentTemperature }}°C · 湿度 {{ weather?.current.humidity }}%</text>
          <view class="weather-metrics">
            <view
              ><text>降水</text><text>{{ weather?.current.precipitation }} mm</text></view
            >
            <view
              ><text>风速</text><text>{{ weather?.current.windSpeed }} km/h</text></view
            >
            <view
              ><text>阵风</text><text>{{ weather?.current.windGust }} km/h</text></view
            >
          </view>
        </view>

        <view class="section-card">
          <view class="section-title-row"><text class="section-title">未来 24 小时</text><text class="section-more">降雨概率</text></view>
          <scroll-view scroll-x class="hourly-scroll">
            <view v-for="item in weather?.hourly" :key="item.time" class="hour-item">
              <text>{{ formatHour(item.time) }}</text>
              <text class="hour-condition">{{ item.conditionText }}</text>
              <text class="hour-temperature">{{ item.temperature }}°</text>
              <text class="hour-rain">{{ item.precipitationProbability }}%</text>
            </view>
          </scroll-view>
        </view>

        <view class="section-card wind-card">
          <view class="section-title-row"><text class="section-title">风况</text></view>
          <view class="wind-grid">
            <view
              ><text>风速</text><text>{{ weather?.current.windSpeed }} km/h</text></view
            >
            <view
              ><text>阵风</text><text>{{ weather?.current.windGust }} km/h</text></view
            >
            <view
              ><text>方向</text><text>{{ weather?.current.windDirectionText }}</text></view
            >
          </view>
        </view>

        <view class="section-card">
          <view class="section-title-row"><text class="section-title">未来 7 天</text></view>
          <view v-for="item in weather?.daily" :key="item.date" class="daily-row">
            <text class="daily-date">{{ formatDate(item.date) }}</text>
            <text class="daily-condition">{{ item.conditionText }}</text>
            <text class="daily-temp">{{ item.temperatureMin }}° / {{ item.temperatureMax }}°</text>
            <text class="daily-rain">{{ item.precipitationProbability }}%</text>
          </view>
        </view>

        <text class="updated-at">更新于 {{ weather?.metadata.queriedAt }} · {{ weather?.metadata.cached ? '短缓存' : '实时请求' }}</text>
      </view>
    </view>
  </PageLayout>
</template>

<script setup lang="ts">
  import { onLoad } from '@dcloudio/uni-app'
  import { ref } from 'vue'
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

  const mode = ref<WeatherSourceMode>('location')
  const weather = ref<WeatherResult | null>(null)
  const loading = ref(false)
  const mapLoading = ref(false)
  const errorMessage = ref('')
  const keyword = ref('')
  const loadingPlaces = ref(false)
  const placeError = ref('')
  const places = ref<PrecollectedAltitudePlace[]>([])
  const regionOptions = ref<AltitudeRegionNode[]>([])
  const regionPlaces = ref<Record<string, PrecollectedAltitudePlace>>({})
  const locationName = ref('当前位置')
  const shareTitle = ref('实时天气｜查询当前位置天气')
  const sharePath = ref('/subPackages/tools/weather/index?mode=location')
  const shareQuery = ref('mode=location')
  const lastPoint = ref<WeatherPoint | null>(null)

  const syncShare = (point: WeatherPoint) => {
    const share = buildWeatherShare(point)
    shareTitle.value = share.title
    sharePath.value = share.path
    shareQuery.value = share.query
  }

  const queryWeather = async (point: WeatherPoint) => {
    loading.value = true
    errorMessage.value = ''
    lastPoint.value = point
    try {
      weather.value = await getWeather(point)
      locationName.value = point.name || locationName.value
      syncShare(point)
    } catch {
      weather.value = null
      errorMessage.value = '天气服务暂时不可用，请稍后重试'
    } finally {
      loading.value = false
    }
  }

  const refreshWeather = () => {
    if (lastPoint.value) queryWeather(lastPoint.value)
  }

  const queryCurrentWeather = () => {
    // #ifdef MP-WEIXIN
    uni.getLocation({
      type: 'wgs84',
      isHighAccuracy: true,
      success: location =>
        queryWeather({ latitude: location.latitude, longitude: location.longitude, coordinateSystem: 'wgs84', source: 'location' }),
      fail: () => {
        errorMessage.value = '请允许定位后再查询天气'
      },
    })
    // #endif
    // #ifndef MP-WEIXIN
    uni.getLocation({
      type: 'wgs84',
      success: location =>
        queryWeather({ latitude: location.latitude, longitude: location.longitude, coordinateSystem: 'wgs84', source: 'location' }),
      fail: () => {
        errorMessage.value = '当前环境无法获取定位，请改用地点选择'
      },
    })
    // #endif
  }

  const chooseMapLocation = () => {
    mapLoading.value = true
    // #ifdef MP-WEIXIN
    uni.chooseLocation({
      success: location =>
        queryWeather({
          latitude: location.latitude,
          longitude: location.longitude,
          coordinateSystem: 'gcj02',
          source: 'map',
          name: location.name || location.address,
        }),
      fail: () => {
        errorMessage.value = '地图选点失败或已取消'
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
    const response = (await getAltitudePlacesOptions()) as unknown as { items?: AltitudeRegionNode[]; places?: PrecollectedAltitudePlace[] }
    regionOptions.value = response.items || []
    regionPlaces.value = Object.fromEntries((response.places || []).map(item => [item.id, item]))
  }

  const onRegionChange = (event: { detail?: { value?: Array<{ value?: string }> } }) => {
    const values = event.detail?.value || []
    const placeId = values[values.length - 1]?.value
    if (placeId) {
      const place = regionPlaces.value[placeId]
      if (place) selectPlace(place)
    }
  }

  const searchPlaces = async () => {
    const response = (await getAltitudePlaces({ keyword: keyword.value.trim(), page: 1, pageSize: 30 })) as unknown as {
      items?: PrecollectedAltitudePlace[]
    }
    places.value = response.items || []
  }

  const selectPlace = (place: PrecollectedAltitudePlace) => {
    if (place.level === 'scenic_area') return
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
    mode.value = next
    weather.value = null
    errorMessage.value = ''
    if (next === 'place') {
      await loadPlaceOptions().catch(() => {
        errorMessage.value = '地点选项加载失败'
      })
    }
  }

  const formatHour = (time: string) => time.slice(11, 16)
  const formatDate = (date: string) => date.slice(5)

  onLoad(async options => {
    const state = parseWeatherShare((options || {}) as Record<string, string | undefined>)
    if (state.mode === 'map' && state.point) return queryWeather(state.point)
    if (state.mode === 'place' && state.placeId) {
      await loadPlaceOptions()
      const place = regionPlaces.value[state.placeId]
      if (place) return selectPlace(place)
    }
    mode.value = state.mode
    if (mode.value === 'place') await loadPlaceOptions()
  })
</script>

<style lang="scss" scoped>
  .weather-page {
    min-height: 100vh;
    padding: 28rpx;
    background: var(--theme-bg);
    box-sizing: border-box;
  }
  .mode-tabs {
    display: flex;
    padding: 6rpx;
    border-radius: 18rpx;
    background: var(--theme-surface-2);
  }
  .mode-tab {
    flex: 1;
    padding: 18rpx 0;
    border-radius: 14rpx;
    color: var(--theme-text-secondary);
    font-size: 25rpx;
    text-align: center;
  }
  .mode-tab.active {
    background: var(--theme-surface);
    color: var(--theme-brand);
    font-weight: 700;
  }
  .current-card,
  .section-card,
  .place-panel,
  .map-panel,
  .location-panel {
    margin-top: 24rpx;
    padding: 28rpx;
    border-radius: 24rpx;
    background: var(--theme-surface);
    box-shadow: 0 10rpx 30rpx var(--theme-shadow-xs);
  }
  .current-head,
  .section-title-row,
  .search-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .eyebrow,
  .condition-text,
  .feels-like,
  .section-title,
  .section-more,
  .weather-metrics text,
  .wind-grid text,
  .daily-row text {
    display: block;
  }
  .eyebrow {
    color: var(--theme-text-secondary);
    font-size: 24rpx;
  }
  .condition-text {
    margin-top: 8rpx;
    color: var(--theme-text);
    font-size: 34rpx;
    font-weight: 700;
  }
  .temperature-row {
    display: flex;
    align-items: baseline;
    margin-top: 26rpx;
  }
  .temperature {
    color: var(--theme-brand);
    font-size: 112rpx;
    font-weight: 800;
    line-height: 1;
  }
  .temperature-unit {
    margin-left: 10rpx;
    color: var(--theme-text-secondary);
    font-size: 30rpx;
  }
  .feels-like {
    margin-top: 16rpx;
    color: var(--theme-text-secondary);
    font-size: 24rpx;
  }
  .weather-metrics,
  .wind-grid {
    display: flex;
    gap: 12rpx;
    margin-top: 28rpx;
  }
  .weather-metrics view,
  .wind-grid view {
    flex: 1;
    padding: 18rpx;
    border-radius: 16rpx;
    background: var(--theme-surface-2);
  }
  .weather-metrics text:first-child,
  .wind-grid text:first-child,
  .section-more {
    color: var(--theme-text-tertiary);
    font-size: 21rpx;
  }
  .weather-metrics text:last-child,
  .wind-grid text:last-child {
    margin-top: 8rpx;
    color: var(--theme-text);
    font-size: 24rpx;
    font-weight: 700;
  }
  .section-title {
    color: var(--theme-text);
    font-size: 30rpx;
    font-weight: 700;
  }
  .hourly-scroll {
    margin-top: 24rpx;
    white-space: nowrap;
  }
  .hour-item {
    display: inline-flex;
    align-items: center;
    flex-direction: column;
    width: 120rpx;
    margin-right: 12rpx;
    padding: 18rpx 8rpx;
    border-radius: 16rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text-secondary);
    font-size: 21rpx;
  }
  .hour-condition {
    margin-top: 18rpx;
    color: var(--theme-text);
  }
  .hour-temperature {
    margin-top: 12rpx;
    color: var(--theme-brand);
    font-size: 28rpx;
    font-weight: 700;
  }
  .hour-rain,
  .daily-rain {
    margin-top: 8rpx;
    color: var(--theme-brand);
  }
  .daily-row {
    display: flex;
    align-items: center;
    padding: 22rpx 0;
    border-bottom: 1rpx solid var(--theme-border);
    color: var(--theme-text-secondary);
    font-size: 23rpx;
  }
  .daily-row:last-child {
    border-bottom: 0;
  }
  .daily-date {
    width: 100rpx;
    color: var(--theme-text);
    font-weight: 700;
  }
  .daily-condition {
    flex: 1;
  }
  .daily-temp {
    width: 160rpx;
    text-align: right;
  }
  .daily-rain {
    width: 70rpx;
    margin-top: 0;
    text-align: right;
  }
  .updated-at {
    display: block;
    margin-top: 22rpx;
    color: var(--theme-text-tertiary);
    font-size: 20rpx;
    text-align: center;
  }
  .panel-title {
    margin-top: 20rpx;
    color: var(--theme-text);
    font-size: 32rpx;
    font-weight: 700;
  }
  .panel-description {
    margin-top: 14rpx;
    color: var(--theme-text-secondary);
    font-size: 24rpx;
    line-height: 1.6;
    text-align: center;
  }
  .primary-button {
    width: 100%;
    margin-top: 26rpx;
    border: 0;
    border-radius: 16rpx;
    background: var(--theme-brand);
    color: var(--theme-surface);
    line-height: 88rpx;
  }
  .search-row {
    margin-top: 24rpx;
  }
  .search-input {
    flex: 1;
    height: 82rpx;
    padding: 0 20rpx;
    border-radius: 16rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text);
  }
  .search-button {
    width: 130rpx;
    height: 82rpx;
    margin-left: 14rpx;
    border: 0;
    border-radius: 16rpx;
    background: var(--theme-brand);
    color: var(--theme-surface);
    line-height: 82rpx;
  }
  .place-row {
    display: flex;
    justify-content: space-between;
    padding: 22rpx 0;
    border-bottom: 1rpx solid var(--theme-border);
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
    margin-top: 6rpx;
    overflow: hidden;
    color: var(--theme-text-secondary);
    font-size: 21rpx;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .place-altitude {
    align-self: center;
    color: var(--theme-brand);
    font-size: 27rpx;
    font-weight: 700;
  }
  .error-text {
    display: block;
    margin-top: 18rpx;
    color: var(--theme-danger);
    font-size: 23rpx;
    text-align: center;
  }
</style>
