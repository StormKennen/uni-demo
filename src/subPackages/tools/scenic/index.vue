<template>
  <PageLayout
    title="景区模式"
    back-fallback="/pages/tools/index"
    nav-bg-color="var(--theme-surface)"
    nav-init-bg-color="var(--theme-surface)"
    nav-divider>
    <view class="scenic-page">
      <view class="hero-card">
        <view class="hero-copy">
          <text class="hero-kicker">SCENIC MODE</text>
          <text class="hero-title">按行政区探索景区</text>
          <text class="hero-description">省、市、区县都可以停留，景区与景点按页加载。</text>
        </view>
        <uni-icons type="map-filled" size="44" color="var(--theme-brand)" />
      </view>

      <view class="filter-card">
        <view class="filter-row">
          <picker :range="provincePickerOptions" range-key="text" :value="provinceIndex" @change="onProvinceChange">
            <view class="picker-field"
              ><text class="picker-label">省份</text><text class="picker-value">{{ selectedProvinceText }}</text
              ><uni-icons type="bottom" size="15" color="var(--theme-text-tertiary)"
            /></view>
          </picker>
          <picker :range="cityPickerOptions" range-key="text" :value="cityIndex" @change="onCityChange">
            <view class="picker-field"
              ><text class="picker-label">城市/州</text><text class="picker-value">{{ selectedCityText }}</text
              ><uni-icons type="bottom" size="15" color="var(--theme-text-tertiary)"
            /></view>
          </picker>
          <picker :range="countyPickerOptions" range-key="text" :value="countyIndex" @change="onCountyChange">
            <view class="picker-field"
              ><text class="picker-label">区县</text><text class="picker-value">{{ selectedCountyText }}</text
              ><uni-icons type="bottom" size="15" color="var(--theme-text-tertiary)"
            /></view>
          </picker>
        </view>
        <view class="search-row">
          <input
            v-model="areaKeyword"
            class="search-input"
            :maxlength="80"
            confirm-type="search"
            placeholder="搜索景区名称"
            @confirm="confirmFilters" />
          <button class="search-button" :disabled="areasLoading" @click="confirmFilters">查询</button>
        </view>
        <view class="filter-footer">
          <text class="filter-summary">{{ filterSummary }}</text>
        </view>
      </view>

      <view class="section-header">
        <view
          ><text class="section-title">景区列表</text
          ><text class="section-subtitle">{{ areaTotal ? `共 ${areaTotal} 个景区` : '选择区域开始探索' }}</text></view
        >
        <text v-if="areasLoading" class="loading-text">加载中…</text>
      </view>
      <view v-if="areasError" class="state-card error-state">{{ areasError }}</view>
      <view v-else-if="!areas.length && !areasLoading" class="state-card">暂无匹配景区</view>
      <view v-else class="area-list">
        <view v-for="area in areas" :key="area.id" class="area-card" @click="openArea(area)">
          <view class="area-card-header"
            ><view class="area-title-wrap"
              ><text class="area-name">{{ area.name }}</text
              ><text v-if="area.grade" class="grade-badge">{{ area.grade }}</text></view
            ><uni-icons type="right" size="18" color="var(--theme-text-tertiary)"
          /></view>
          <text class="area-location">{{ area.province }} · {{ area.city }}{{ area.county ? ` · ${area.county}` : '' }}</text>
          <view class="area-meta"
            ><text>海拔 {{ formatAltitude(area.altitudeMeters) }}</text
            ><text>{{ area.pointCount }} 个景点</text></view
          >
          <button class="area-detail-button" @click.stop="openArea(area)">查看景点海拔</button>
          <scroll-view v-if="area.previewPoints.length" scroll-x class="preview-scroll" :show-scrollbar="false"
            ><view v-for="point in area.previewPoints" :key="point.id" class="preview-point"
              ><text class="preview-name">{{ point.name }}</text
              ><text class="preview-altitude">{{ formatAltitude(point.altitudeMeters) }}</text></view
            ></scroll-view
          >
        </view>
      </view>
      <button v-if="areasPagination.hasNext" class="load-more-button" :disabled="areasLoading" @click="loadMoreAreas">{{
        areasLoading ? '加载中…' : '加载更多景区'
      }}</button>

      <view class="section-header point-header"
        ><view
          ><text class="section-title">景点搜索</text><text class="section-subtitle">搜索博物馆、街区、湖泊和景区内部点位</text></view
        ></view
      >
      <view class="filter-card point-search-card">
        <view class="search-row"
          ><input
            v-model="pointKeyword"
            class="search-input"
            :maxlength="80"
            confirm-type="search"
            placeholder="例如：博物馆、五花海、宽窄巷子"
            @confirm="searchPoints" /><button class="search-button" :disabled="pointsLoading" @click="searchPoints">搜索景点</button></view
        >
        <view v-if="pointResults.length" class="point-results"
          ><view v-for="point in pointResults" :key="point.id" class="point-row" @click="openPointWeather(point)"
            ><view class="point-copy"
              ><text class="point-name">{{ point.name }}</text
              ><text class="point-area">{{ point.scenicAreaName || '未分组景点' }}</text></view
            ><view class="point-value-wrap"
              ><text class="point-altitude">{{ formatAltitude(point.altitudeMeters) }}</text
              ><text class="point-weather-link">天气</text></view
            ></view
          ></view
        >
        <text v-else-if="pointsSearched && !pointsLoading" class="empty-inline">没有找到匹配景点</text>
      </view>

      <view v-if="activeArea" id="scenic-area-detail" class="detail-card">
        <view class="detail-header"
          ><view
            ><text class="section-title">{{ activeArea.name }}</text
            ><text class="section-subtitle">景区海拔变化</text></view
          ><uni-icons type="close" size="20" color="var(--theme-text-tertiary)" @click="activeArea = null"
        /></view>
        <view class="detail-mode-tabs">
          <view class="detail-mode-tab" :class="{ active: detailMode === 'points' }" @click="detailMode = 'points'">数据列表</view>
          <view class="detail-mode-tab" :class="{ active: detailMode === 'chart' }" @click="detailMode = 'chart'">图表</view>
        </view>
        <view v-if="profileLoading" class="state-card">正在加载海拔曲线…</view>
        <view v-else-if="profileError" class="state-card error-state">{{ profileError }}</view>
        <view v-else-if="profile && !profile.points.length" class="state-card">该景区暂无可展示的景点海拔数据</view>
        <view v-else-if="profile && detailMode === 'points'" class="detail-point-list">
          <view v-for="point in profile.points" :key="point.pointId" class="detail-point-row">
            <text class="detail-point-name">{{ point.name }}</text>
            <text class="detail-point-altitude">{{ formatAltitude(point.altitudeMeters) }}</text>
          </view>
        </view>
        <ElevationProfileChart
          v-else-if="profile"
          :categories="profile.categories"
          :values="profile.series[0]?.data || []"
          :points="profile.points"
          :summary="profile.summary" />
        <text v-if="weatherSummary" class="weather-summary">{{ weatherSummary }}</text>
        <button class="secondary-button" :disabled="weatherLoading" @click="loadAreaWeather">{{
          weatherLoading ? '天气查询中…' : '查看景区实时天气'
        }}</button>
      </view>
    </view>
  </PageLayout>
</template>

<script setup lang="ts">
  import { computed, nextTick, onMounted, ref } from 'vue'
  import ElevationProfileChart from './elevation-profile-chart.vue'
  import {
    buildQueryConfig,
    normalizeAdministrativeCode,
    unwrapApiData,
    type ScenicAdminNode,
    type ScenicAdministrativeOptionsResponse,
    type ScenicAreaCard,
    type ScenicAreasResponse,
    type ScenicElevationProfileResponse,
    type ScenicPointSearchItem,
    type ScenicPointSearchResponse,
  } from './models'
  import {
    getScenicAdministrativeOptions,
    getScenicAreas,
    getAreasAreaIdElevationProfile,
    getScenicPointsSearch,
  } from '@/services/apifox/NODEJSDEMO/SCENIC/apifox'
  import { getWeather } from '@/services/apifox/NODEJSDEMO/WEATHER/apifox'

  const allOption = (text: string) => ({ value: '', text, level: 'all' as const })
  const areas = ref<ScenicAreaCard[]>([])
  const pointResults = ref<ScenicPointSearchItem[]>([])
  const adminOptions = ref<ScenicAdminNode[]>([])
  const areaKeyword = ref('')
  const pointKeyword = ref('')
  const selectedProvinceCode = ref('')
  const selectedCityCode = ref('')
  const selectedCountyCode = ref('')
  const draftProvinceCode = ref('')
  const draftCityCode = ref('')
  const draftCountyCode = ref('')
  const areasPage = ref(1)
  const areasLoading = ref(false)
  const pointsLoading = ref(false)
  const pointsSearched = ref(false)
  const areasError = ref('')
  const areaTotal = ref(0)
  const areasHasNext = ref(false)
  const activeArea = ref<ScenicAreaCard | null>(null)
  const profile = ref<ScenicElevationProfileResponse | null>(null)
  const profileLoading = ref(false)
  const profileError = ref('')
  const weatherLoading = ref(false)
  const weatherSummary = ref('')
  const detailMode = ref<'points' | 'chart'>('points')

  const provincePickerOptions = computed(() => [allOption('全部省份'), ...adminOptions.value])
  const draftProvince = computed(() => adminOptions.value.find(item => item.value === draftProvinceCode.value))
  const cityPickerOptions = computed(() => [allOption('全部城市/州'), ...(draftProvince.value?.children || [])])
  const draftCity = computed(() => draftProvince.value?.children?.find(item => item.value === draftCityCode.value))
  const countyPickerOptions = computed(() => [allOption('全部区县'), ...(draftCity.value?.children || [])])
  const selectedProvinceText = computed(() => draftProvince.value?.text || '全部省份')
  const selectedCityText = computed(() => draftCity.value?.text || '全部城市/州')
  const selectedCountyText = computed(
    () => draftCity.value?.children?.find(item => item.value === draftCountyCode.value)?.text || '全部区县',
  )
  const provinceIndex = computed(() =>
    Math.max(
      0,
      provincePickerOptions.value.findIndex(item => item.value === draftProvinceCode.value),
    ),
  )
  const cityIndex = computed(() =>
    Math.max(
      0,
      cityPickerOptions.value.findIndex(item => item.value === draftCityCode.value),
    ),
  )
  const countyIndex = computed(() =>
    Math.max(
      0,
      countyPickerOptions.value.findIndex(item => item.value === draftCountyCode.value),
    ),
  )
  const filterSummary = computed(
    () =>
      [selectedProvinceText.value, selectedCityText.value, selectedCountyText.value]
        .filter(value => !value.startsWith('全部'))
        .join(' · ') || '未选择行政区',
  )
  const areasPagination = computed(() => ({ page: areasPage.value, pageSize: 10, hasNext: areasHasNext.value }))
  const unwrap = <T,>(value: unknown) => unwrapApiData<T>(value)
  const formatAltitude = (value: number | null | undefined) => (typeof value === 'number' ? `${Math.round(value)}m` : '待采集')

  const loadAdministrativeOptions = async () => {
    const response = await getScenicAdministrativeOptions()
    adminOptions.value = unwrap<ScenicAdministrativeOptionsResponse>(response).items || []
  }

  const loadAreas = async (reset = false) => {
    if (areasLoading.value) return
    areasLoading.value = true
    areasError.value = ''
    const page = reset ? 1 : areasPage.value
    try {
      const response = await getScenicAreas(
        buildQueryConfig({
          provinceCode: selectedProvinceCode.value || undefined,
          cityCode: normalizeAdministrativeCode(selectedCityCode.value),
          countyCode: selectedCountyCode.value || undefined,
          keyword: areaKeyword.value.trim() || undefined,
          page,
          pageSize: 10,
        }),
      )
      const data = unwrap<ScenicAreasResponse>(response)
      areas.value = reset ? data.items || [] : [...areas.value, ...(data.items || [])]
      areasPage.value = data.pagination?.page || page
      areaTotal.value = data.pagination?.total || 0
      areasHasNext.value = data.pagination?.hasNext === true
    } catch {
      areasError.value = '景区加载失败，请稍后重试'
    } finally {
      areasLoading.value = false
    }
  }

  const onProvinceChange = (event: { detail?: { value?: number } }) => {
    const item = provincePickerOptions.value[event.detail?.value || 0]
    draftProvinceCode.value = item?.value || ''
    draftCityCode.value = ''
    draftCountyCode.value = ''
  }
  const onCityChange = (event: { detail?: { value?: number } }) => {
    const item = cityPickerOptions.value[event.detail?.value || 0]
    draftCityCode.value = item?.value || ''
    draftCountyCode.value = ''
  }
  const onCountyChange = (event: { detail?: { value?: number } }) => {
    const item = countyPickerOptions.value[event.detail?.value || 0]
    draftCountyCode.value = item?.value || ''
  }
  const confirmFilters = () => {
    selectedProvinceCode.value = draftProvinceCode.value
    selectedCityCode.value = draftCityCode.value
    selectedCountyCode.value = draftCountyCode.value
    loadAreas(true)
  }
  const loadMoreAreas = () => {
    if (!areasHasNext.value || areasLoading.value) return
    areasPage.value += 1
    loadAreas(false)
  }

  const searchPoints = async () => {
    if (pointsLoading.value) return
    pointsLoading.value = true
    pointsSearched.value = true
    try {
      const response = await getScenicPointsSearch(
        buildQueryConfig({
          provinceCode: selectedProvinceCode.value || undefined,
          cityCode: normalizeAdministrativeCode(selectedCityCode.value),
          countyCode: selectedCountyCode.value || undefined,
          keyword: pointKeyword.value.trim() || undefined,
          page: 1,
          pageSize: 30,
        }),
      )
      pointResults.value = unwrap<ScenicPointSearchResponse>(response).items || []
    } finally {
      pointsLoading.value = false
    }
  }

  const openArea = async (area: ScenicAreaCard) => {
    activeArea.value = area
    detailMode.value = 'points'
    profile.value = null
    profileError.value = ''
    profileLoading.value = true
    weatherSummary.value = ''
    try {
      const response = await getAreasAreaIdElevationProfile(encodeURIComponent(area.id))
      profile.value = unwrap<ScenicElevationProfileResponse>(response)
      await nextTick()
      uni.pageScrollTo({ selector: '#scenic-area-detail', duration: 240 })
    } catch {
      profileError.value = '景区景点海拔数据加载失败，请稍后重试'
    } finally {
      profileLoading.value = false
    }
  }

  const loadAreaWeather = async () => {
    if (!activeArea.value || weatherLoading.value) return
    weatherLoading.value = true
    try {
      const response = await getWeather({
        latitude: activeArea.value.latitude,
        longitude: activeArea.value.longitude,
        coordinateSystem: 'wgs84',
      })
      const data = unwrap<{ current?: { temperature?: number; conditionText?: string } }>(response)
      weatherSummary.value = `当前天气：${data.current?.conditionText || '未知'} ${data.current?.temperature ?? '--'}°C`
    } finally {
      weatherLoading.value = false
    }
  }

  const openPointWeather = (point: ScenicPointSearchItem) => {
    uni.navigateTo({
      url: `/subPackages/tools/weather/index?mode=map&lat=${point.latitude}&lng=${point.longitude}&cs=wgs84&name=${encodeURIComponent(point.name)}`,
    })
  }

  onMounted(async () => {
    try {
      await loadAdministrativeOptions()
      draftProvinceCode.value = selectedProvinceCode.value
      draftCityCode.value = selectedCityCode.value
      draftCountyCode.value = selectedCountyCode.value
      await loadAreas(true)
    } catch {
      areasError.value = '景区页面初始化失败，请稍后重试'
    }
  })
</script>

<style scoped lang="scss">
  .scenic-page {
    padding: 24rpx;
    background: var(--theme-page-background);
  }
  .hero-card,
  .filter-card,
  .area-card,
  .detail-card,
  .state-card {
    border-radius: 24rpx;
    background: var(--theme-surface);
    box-shadow: var(--theme-shadow-card);
  }
  .hero-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx;
    background: linear-gradient(135deg, var(--theme-brand-soft), var(--theme-surface));
  }
  .hero-copy,
  .section-header > view,
  .detail-header > view {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
  }
  .hero-kicker {
    color: var(--theme-brand);
    font-size: 20rpx;
    letter-spacing: 3rpx;
  }
  .hero-title,
  .section-title {
    color: var(--theme-text-primary);
    font-size: 32rpx;
    font-weight: 700;
  }
  .hero-description,
  .section-subtitle,
  .area-location,
  .preview-altitude,
  .point-area,
  .empty-inline {
    color: var(--theme-text-tertiary);
    font-size: 23rpx;
  }
  .filter-card {
    margin-top: 20rpx;
    padding: 20rpx;
  }
  .filter-row {
    display: flex;
    gap: 12rpx;
  }
  .picker-field {
    min-width: 0;
    flex: 1;
    display: flex;
    align-items: center;
    gap: 6rpx;
    padding: 14rpx;
    border-radius: 14rpx;
    background: var(--theme-surface-muted);
  }
  .picker-label {
    color: var(--theme-text-tertiary);
    font-size: 20rpx;
  }
  .picker-value {
    flex: 1;
    overflow: hidden;
    color: var(--theme-text-primary);
    font-size: 22rpx;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .search-row {
    display: flex;
    gap: 12rpx;
    margin-top: 16rpx;
  }
  .search-input {
    flex: 1;
    height: 72rpx;
    padding: 0 20rpx;
    border-radius: 16rpx;
    background: var(--theme-surface-muted);
    color: var(--theme-text-primary);
    font-size: 24rpx;
  }
  .search-button,
  .load-more-button,
  .secondary-button {
    color: #fff;
    background: var(--theme-brand);
    font-size: 24rpx;
  }
  .search-button {
    width: 132rpx;
    margin: 0;
    line-height: 72rpx;
  }

  .filter-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
    margin-top: 16rpx;
  }

  .filter-summary {
    flex: 1;
    overflow: hidden;
    color: var(--theme-text-tertiary);
    font-size: 22rpx;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .confirm-filter-button {
    flex-shrink: 0;
    margin: 0;
    padding: 0 22rpx;
    border-radius: 14rpx;
    color: #fff;
    background: var(--theme-brand);
    font-size: 22rpx;
    line-height: 62rpx;
  }
  .section-header,
  .detail-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 20rpx;
    margin: 30rpx 4rpx 16rpx;
  }
  .section-title {
    font-size: 30rpx;
  }
  .loading-text {
    color: var(--theme-brand);
    font-size: 22rpx;
  }
  .area-card {
    margin-bottom: 18rpx;
    padding: 24rpx;
  }
  .area-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .area-title-wrap {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }
  .area-name,
  .point-name {
    color: var(--theme-text-primary);
    font-size: 29rpx;
    font-weight: 700;
  }
  .grade-badge {
    padding: 4rpx 10rpx;
    border-radius: 8rpx;
    color: var(--theme-brand);
    background: var(--theme-brand-soft);
    font-size: 19rpx;
  }
  .area-location {
    display: block;
    margin-top: 10rpx;
  }
  .area-meta {
    display: flex;
    gap: 24rpx;
    margin-top: 14rpx;
    color: var(--theme-text-secondary);
    font-size: 23rpx;
  }
  .area-detail-button {
    width: 100%;
    margin: 14rpx 0 0;
    color: var(--theme-brand);
    background: var(--theme-brand-soft);
    font-size: 22rpx;
    line-height: 62rpx;
  }
  .preview-scroll {
    margin-top: 18rpx;
    white-space: nowrap;
  }
  .preview-point {
    display: inline-flex;
    flex-direction: column;
    gap: 4rpx;
    width: 180rpx;
    margin-right: 12rpx;
    padding: 14rpx;
    border-radius: 14rpx;
    background: var(--theme-surface-muted);
  }
  .preview-name {
    overflow: hidden;
    color: var(--theme-text-primary);
    font-size: 23rpx;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .load-more-button,
  .secondary-button {
    margin: 18rpx 0 0;
    line-height: 76rpx;
  }
  .point-header {
    margin-top: 34rpx;
  }
  .point-search-card {
    padding-top: 4rpx;
  }
  .point-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
    padding: 20rpx 0;
    border-bottom: 1rpx solid var(--theme-border-light);
  }
  .point-copy {
    min-width: 0;
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 6rpx;
  }
  .point-area {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .point-value-wrap {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6rpx;
  }
  .point-altitude {
    color: var(--theme-brand);
    font-size: 25rpx;
    font-weight: 700;
  }
  .point-weather-link {
    color: var(--theme-text-tertiary);
    font-size: 20rpx;
  }
  .detail-card {
    margin-top: 24rpx;
    padding: 24rpx;
  }

  .detail-mode-tabs {
    display: flex;
    gap: 12rpx;
    margin: 18rpx 0;
  }

  .detail-mode-tab {
    padding: 12rpx 20rpx;
    border-radius: 14rpx;
    color: var(--theme-text-secondary);
    background: var(--theme-surface-muted);
    font-size: 22rpx;
  }

  .detail-mode-tab.active {
    color: var(--theme-brand);
    background: var(--theme-brand-soft);
    font-weight: 700;
  }

  .detail-point-list {
    padding: 8rpx 0;
  }

  .detail-point-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18rpx 0;
    border-bottom: 1rpx solid var(--theme-border-light);
  }

  .detail-point-name {
    color: var(--theme-text-primary);
    font-size: 25rpx;
  }

  .detail-point-altitude {
    color: var(--theme-brand);
    font-size: 24rpx;
    font-weight: 700;
  }
  .state-card {
    padding: 42rpx 24rpx;
    color: var(--theme-text-tertiary);
    font-size: 24rpx;
    text-align: center;
  }
  .error-state {
    color: var(--theme-danger);
  }
  .weather-summary {
    display: block;
    margin-top: 18rpx;
    color: var(--theme-text-secondary);
    font-size: 24rpx;
  }
</style>
