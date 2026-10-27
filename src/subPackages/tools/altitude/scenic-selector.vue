<template>
  <view class="scenic-selector">
    <!-- Unified Compact Toolbar: Region Picker + Keyword Search -->
    <view class="scenic-toolbar">
      <view class="toolbar-region-btn" @click="openRegionPicker">
        <uni-icons type="map-filled" size="16" color="var(--theme-brand)" />
        <text class="toolbar-region-text">{{ filterSummary.startsWith('点击') ? '全国地区' : filterSummary }}</text>
        <uni-icons type="bottom" size="12" color="var(--theme-text-tertiary)" />
      </view>
      <view class="toolbar-search-box">
        <uni-icons type="search" size="16" color="var(--theme-text-tertiary)" />
        <input
          v-model="keyword"
          class="toolbar-search-input"
          :maxlength="80"
          confirm-type="search"
          placeholder="搜索景区名称"
          @confirm="applyQuery" />
        <text v-if="keyword" class="toolbar-search-clear" @click="keyword = ''; applyQuery()">×</text>
      </view>
    </view>

    <view v-if="regionPickerVisible" class="region-picker-mask" @click="closeRegionPicker">
      <view class="region-picker-sheet" @click.stop>
        <view class="region-picker-header">
          <view>
            <text class="region-picker-title">选择地区</text>
            <text class="region-picker-subtitle">选择省份后，可继续选择城市/州和区县</text>
          </view>
          <uni-icons type="close" size="20" color="var(--theme-text-tertiary)" @click="closeRegionPicker" />
        </view>

        <view class="region-path">
          <view
            v-for="item in regionPath"
            :key="item.level"
            class="region-path-item"
            :class="{ active: regionPickerLevel === item.level }"
            @click="regionPickerLevel = item.level">
            <text>{{ item.label }}</text>
          </view>
        </view>

        <view v-if="adminLoading && regionPickerLevel !== 'province' && !regionPickerChildren.length" class="region-picker-state">
          正在加载城市/区县数据…
        </view>
        <view v-else class="region-picker-options-wrap">
          <view v-if="adminError" class="region-picker-hint">{{ adminError }}</view>
          <scroll-view class="region-option-list" scroll-y :show-scrollbar="false">
            <view
              v-for="option in regionPickerOptions"
              :key="`${option.level}-${option.value || 'all'}`"
              class="region-option"
              :class="{ selected: isRegionOptionSelected(option) }"
              @click="selectRegionOption(option)">
              <view class="region-option-copy">
                <text class="region-option-name">{{ option.text }}</text>
                <text v-if="option.level !== 'all' && option.children?.length" class="region-option-meta">
                  {{ option.children.length }} 个下级地区
                </text>
              </view>
              <uni-icons
                v-if="option.level !== 'all' && option.children?.length"
                type="right"
                size="16"
                color="var(--theme-text-tertiary)" />
              <uni-icons v-else-if="isRegionOptionSelected(option)" type="checkmarkempty" size="18" color="var(--theme-brand)" />
            </view>
          </scroll-view>
        </view>

        <button class="region-picker-done" @click="confirmRegionPicker">完成</button>
      </view>
    </view>

    <view v-if="errorMessage" class="selector-state selector-error">{{ errorMessage }}</view>
    <view v-else-if="loading && !areas.length" class="selector-state">正在加载景区…</view>
    <view v-else class="area-list">
      <view v-for="area in areas" :key="area.id" class="area-card" @click="openArea(area)">
        <view class="area-header">
          <view class="area-title-wrap">
            <text class="area-name">{{ area.name }}</text>
            <text v-if="area.grade" class="grade-badge">{{ area.grade }}</text>
          </view>
          <uni-icons type="right" size="16" color="var(--theme-text-tertiary)" />
        </view>
        <text class="area-location">{{ area.province }} · {{ area.city }}{{ area.county ? ` · ${area.county}` : '' }}</text>
        <view class="area-meta">
          <text class="meta-tag altitude-tag">海拔 {{ formatAltitude(area.altitudeMeters) }}</text>
          <text class="meta-tag point-tag">{{ area.pointCount }} 个景点</text>
        </view>
      </view>
      <button v-if="hasNext" class="load-more-button" :disabled="loading" @click="loadMore">{{ loading ? '加载中…' : '加载更多' }}</button>
      <view v-if="!areas.length && !loading" class="selector-state">暂无匹配景区</view>
    </view>
  </view>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue'
  import {
    buildQueryConfig,
    normalizeAdministrativeCode,
    unwrapApiData,
    type ScenicAdminNode,
    type ScenicAdministrativeOptionsResponse,
    type ScenicAreaCard,
    type ScenicAreasResponse,
  } from '../scenic/models'
  import { clonePresetScenicProvinces } from './scenic-admin-preset'
  import { getScenicAdministrativeOptions, getScenicAreas } from '@/services/apifox/NODEJSDEMO/SCENIC/apifox'
  import { getStorageSync, setStorageSync } from '@/utils/storage'

  interface ScenicSelectorFilters {
    provinceCode?: string
    cityCode?: string
    countyCode?: string
    keyword?: string
  }

  type RegionPickerLevel = 'province' | 'city' | 'county'
  type RegionPickerOption = ScenicAdminNode | ReturnType<typeof allOption>

  const props = withDefaults(
    defineProps<{
      initialFilters?: ScenicSelectorFilters
    }>(),
    {
      initialFilters: () => ({}),
    },
  )

  const emit = defineEmits<{
    'filter-change': [filters: ScenicSelectorFilters]
  }>()

  const SCENIC_ADMIN_CACHE_KEY = 'altitude:scenic-admin-options:v1'
  const allOption = (text: string) => ({ value: '', text, level: 'all' as const })

  const isScenicAdminNode = (value: unknown): value is ScenicAdminNode => {
    if (typeof value !== 'object' || value === null) return false
    const record = value as Record<string, unknown>
    return (
      typeof record.value === 'string' &&
      typeof record.text === 'string' &&
      (record.level === 'province' || record.level === 'city' || record.level === 'county') &&
      (record.children === undefined || Array.isArray(record.children))
    )
  }

  const readCachedAdminOptions = (): ScenicAdminNode[] => {
    const cached = getStorageSync(SCENIC_ADMIN_CACHE_KEY) as unknown
    return Array.isArray(cached) && cached.every(isScenicAdminNode) ? (cached as ScenicAdminNode[]) : []
  }

  const normalizeAdminText = (value: string) => value.replace(/(特别行政区|自治区|省|市)$/u, '')
  const sameAdminNode = (left: ScenicAdminNode, right: ScenicAdminNode) =>
    left.value === right.value || normalizeAdminText(left.text) === normalizeAdminText(right.text)

  const cachedAdminOptions = readCachedAdminOptions()
  const adminOptions = ref<ScenicAdminNode[]>(cachedAdminOptions.length ? cachedAdminOptions : clonePresetScenicProvinces())
  const areas = ref<ScenicAreaCard[]>([])
  const keyword = ref('')
  const selectedProvinceCode = ref('')
  const selectedCityCode = ref('')
  const selectedCountyCode = ref('')
  const draftProvinceCode = ref('')
  const draftCityCode = ref('')
  const draftCountyCode = ref('')
  const page = ref(1)
  const hasNext = ref(false)
  const loading = ref(false)
  const errorMessage = ref('')
  const adminLoading = ref(cachedAdminOptions.length === 0)
  const adminError = ref('')
  const regionPickerVisible = ref(false)
  const regionPickerLevel = ref<RegionPickerLevel>('province')

  const provinceOptions = computed(() => [allOption('全部省份'), ...adminOptions.value])
  const draftProvince = computed(() => adminOptions.value.find(item => item.value === draftProvinceCode.value))
  const cityOptions = computed(() => [allOption('全部城市/州'), ...(draftProvince.value?.children || [])])
  const draftCity = computed(() => draftProvince.value?.children?.find(item => item.value === draftCityCode.value))
  const countyOptions = computed(() => [allOption('全部区县'), ...(draftCity.value?.children || [])])
  const provinceText = computed(() => draftProvince.value?.text || '全部省份')
  const cityText = computed(() => draftCity.value?.text || '全部城市/州')
  const countyText = computed(() => draftCity.value?.children?.find(item => item.value === draftCountyCode.value)?.text || '全部区县')
  const hasRegionSelection = computed(() => Boolean(draftProvinceCode.value || draftCityCode.value || draftCountyCode.value))
  const filterSummary = computed(
    () =>
      [provinceText.value, cityText.value, countyText.value].filter(value => !value.startsWith('全部')).join(' · ') ||
      '点击选择省、市/州或区县',
  )
  const regionPath = computed(() => [
    { level: 'province' as const, label: provinceText.value },
    { level: 'city' as const, label: cityText.value },
    { level: 'county' as const, label: countyText.value },
  ])
  const regionPickerOptions = computed<RegionPickerOption[]>(() => {
    if (regionPickerLevel.value === 'province') return provinceOptions.value
    if (regionPickerLevel.value === 'city') return cityOptions.value
    return countyOptions.value
  })
  const regionPickerChildren = computed(() => {
    if (regionPickerLevel.value === 'city') return draftProvince.value?.children || []
    if (regionPickerLevel.value === 'county') return draftCity.value?.children || []
    return adminOptions.value
  })
  const formatAltitude = (value: number | null | undefined) => (typeof value === 'number' ? `${Math.round(value)}m` : '待采集')
  const unwrap = <T,>(value: unknown) => unwrapApiData<T>(value)

  const loadAdmin = async () => {
    adminLoading.value = true
    adminError.value = ''
    try {
      const response = await getScenicAdministrativeOptions()
      const remoteOptions = unwrap<ScenicAdministrativeOptionsResponse>(response).items || []
      if (!remoteOptions.length) {
        adminError.value = '暂未获取到城市和区县数据，请稍后重试'
        return
      }

      const usedRemoteValues = new Set<string>()
      const mergedOptions = adminOptions.value.map(localItem => {
        const remoteItem = remoteOptions.find(item => !usedRemoteValues.has(item.value) && sameAdminNode(localItem, item))
        if (!remoteItem) return localItem
        usedRemoteValues.add(remoteItem.value)
        return remoteItem
      })
      const nextOptions = [
        ...mergedOptions,
        ...remoteOptions.filter(
          item => !usedRemoteValues.has(item.value) && !mergedOptions.some(localItem => sameAdminNode(localItem, item)),
        ),
      ]
      const selectedProvince = adminOptions.value.find(item => item.value === draftProvinceCode.value)
      const selectedProvinceText = selectedProvince?.text
      const nextProvince = selectedProvinceText
        ? nextOptions.find(item => normalizeAdminText(item.text) === normalizeAdminText(selectedProvinceText))
        : undefined
      adminOptions.value = nextOptions
      if (nextProvince && draftProvinceCode.value !== nextProvince.value) {
        draftProvinceCode.value = nextProvince.value
        if (selectedProvinceCode.value) selectedProvinceCode.value = nextProvince.value
      }
      setStorageSync(SCENIC_ADMIN_CACHE_KEY, nextOptions)
    } catch {
      adminError.value = '城市和区县数据加载失败，请稍后重试'
    } finally {
      adminLoading.value = false
    }
  }
  const loadAreas = async (reset = true) => {
    loading.value = true
    errorMessage.value = ''
    const currentPage = reset ? 1 : page.value
    try {
      const response = await getScenicAreas(
        buildQueryConfig({
          provinceCode: selectedProvinceCode.value || undefined,
          cityCode: normalizeAdministrativeCode(selectedCityCode.value),
          countyCode: selectedCountyCode.value || undefined,
          keyword: keyword.value.trim() || undefined,
          page: currentPage,
          pageSize: 10,
        }),
      )
      const data = unwrap<ScenicAreasResponse>(response)
      areas.value = reset ? data.items || [] : [...areas.value, ...(data.items || [])]
      page.value = data.pagination?.page || currentPage
      hasNext.value = data.pagination?.hasNext === true
    } catch {
      errorMessage.value = '景区加载失败，请稍后重试'
    } finally {
      loading.value = false
    }
  }
  const applyQuery = () => {
    selectedProvinceCode.value = draftProvinceCode.value
    selectedCityCode.value = draftCityCode.value
    selectedCountyCode.value = draftCountyCode.value
    const filters = {
      provinceCode: selectedProvinceCode.value || undefined,
      cityCode: selectedCityCode.value || undefined,
      countyCode: selectedCountyCode.value || undefined,
      keyword: keyword.value.trim() || undefined,
    }
    emit('filter-change', filters)
    void loadAreas(true)
  }
  const openRegionPicker = () => {
    draftProvinceCode.value = selectedProvinceCode.value
    draftCityCode.value = selectedCityCode.value
    draftCountyCode.value = selectedCountyCode.value
    regionPickerLevel.value = selectedCountyCode.value ? 'county' : selectedCityCode.value ? 'city' : 'province'
    regionPickerVisible.value = true
  }
  const closeRegionPicker = () => {
    regionPickerVisible.value = false
  }
  const confirmRegionPicker = () => {
    applyQuery()
    closeRegionPicker()
  }
  const isRegionOptionSelected = (option: RegionPickerOption) => {
    if (option.level === 'province') return option.value === draftProvinceCode.value
    if (option.level === 'city') return option.value === draftCityCode.value
    if (option.level === 'county') return option.value === draftCountyCode.value
    return regionPickerLevel.value === 'province'
      ? !draftProvinceCode.value
      : regionPickerLevel.value === 'city'
        ? !draftCityCode.value
        : !draftCountyCode.value
  }
  const selectRegionOption = (option: RegionPickerOption) => {
    if (regionPickerLevel.value === 'province') {
      draftProvinceCode.value = option.value
      draftCityCode.value = ''
      draftCountyCode.value = ''
      if (!option.value) {
        confirmRegionPicker()
      } else {
        regionPickerLevel.value = 'city'
      }
      return
    }
    if (regionPickerLevel.value === 'city') {
      draftCityCode.value = option.value
      draftCountyCode.value = ''
      if (!option.value) {
        confirmRegionPicker()
      } else {
        regionPickerLevel.value = 'county'
      }
      return
    }
    draftCountyCode.value = option.value
    if (!option.value) confirmRegionPicker()
  }
  const loadMore = () => {
    if (hasNext.value && !loading.value) {
      page.value += 1
      loadAreas(false)
    }
  }
  const openArea = (area: ScenicAreaCard) => {
    uni.navigateTo({
      url: `/subPackages/tools/altitude/scenic-detail?areaId=${encodeURIComponent(area.id)}&name=${encodeURIComponent(area.name)}`,
    })
  }

  const applyInitialFilters = (filters: ScenicSelectorFilters) => {
    keyword.value = filters.keyword || ''
    draftProvinceCode.value = filters.provinceCode || ''
    draftCityCode.value = filters.cityCode || ''
    draftCountyCode.value = filters.countyCode || ''
    selectedProvinceCode.value = draftProvinceCode.value
    selectedCityCode.value = draftCityCode.value
    selectedCountyCode.value = draftCountyCode.value
  }

  watch(
    () => props.initialFilters,
    filters => {
      applyInitialFilters(filters)
    },
    { deep: true, immediate: true },
  )

  onMounted(async () => {
    void loadAdmin()
    await loadAreas(true)
    emit('filter-change', {
      provinceCode: selectedProvinceCode.value || undefined,
      cityCode: selectedCityCode.value || undefined,
      countyCode: selectedCountyCode.value || undefined,
      keyword: keyword.value.trim() || undefined,
    })
  })
</script>

<style scoped lang="scss">
  .scenic-selector {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
  }

  .scenic-toolbar {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }

  .toolbar-region-btn {
    display: flex;
    align-items: center;
    gap: 8rpx;
    height: 72rpx;
    padding: 0 20rpx;
    border-radius: 16rpx;
    background: var(--theme-surface-2);
    border: 1rpx solid var(--theme-border);
    flex-shrink: 0;
  }

  .toolbar-region-text {
    color: var(--theme-text-primary);
    font-size: 24rpx;
    font-weight: 600;
    max-width: 160rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .toolbar-search-box {
    display: flex;
    align-items: center;
    flex: 1;
    height: 72rpx;
    padding: 0 20rpx;
    border-radius: 16rpx;
    background: var(--theme-surface-2);
    border: 1rpx solid var(--theme-border);
    gap: 10rpx;
  }

  .toolbar-search-input {
    flex: 1;
    height: 100%;
    color: var(--theme-text);
    font-size: 24rpx;
  }

  .toolbar-search-clear {
    color: var(--theme-text-tertiary);
    font-size: 32rpx;
    padding: 0 8rpx;
  }

  .area-card {
    padding: 20rpx 24rpx;
    margin-bottom: 12rpx;
    border-radius: 18rpx;
    background: var(--theme-surface-2);
    border: 1rpx solid var(--theme-border);
    transition: all 200ms ease;
  }

  .area-card:active {
    background: var(--theme-surface);
    border-color: var(--theme-brand);
  }

  .area-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .area-title-wrap {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }

  .area-name {
    color: var(--theme-text-primary);
    font-size: 28rpx;
    font-weight: 700;
  }

  .grade-badge {
    padding: 2rpx 10rpx;
    border-radius: 6rpx;
    background: var(--theme-brand-soft);
    color: var(--theme-brand);
    font-size: 18rpx;
    font-weight: 700;
  }

  .area-location {
    display: block;
    margin-top: 6rpx;
    color: var(--theme-text-tertiary);
    font-size: 22rpx;
  }

  .area-meta {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin-top: 12rpx;
    padding-top: 10rpx;
    border-top: 1rpx dashed var(--theme-border);
    color: var(--theme-text-secondary);
    font-size: 21rpx;
  }

  .altitude-tag {
    color: var(--theme-brand);
    font-weight: 700;
  }

  .region-picker-mask {
    position: fixed;
    z-index: 20;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    align-items: flex-end;
    background: rgba(0, 0, 0, 0.4);
  }

  .region-picker-sheet {
    width: 100%;
    height: 88vh;
    max-height: 92vh;
    padding: 32rpx 24rpx calc(28rpx + env(safe-area-inset-bottom));
    border-radius: 28rpx 28rpx 0 0;
    background: var(--theme-surface);
    box-sizing: border-box;
    overflow: hidden;
  }

  .region-picker-header,
  .region-path,
  .region-option {
    display: flex;
    align-items: center;
  }

  .region-picker-header {
    justify-content: space-between;
    gap: 16rpx;
  }

  .region-picker-header > view {
    display: flex;
    flex-direction: column;
    gap: 6rpx;
  }

  .region-picker-title {
    color: var(--theme-text-primary);
    font-size: 30rpx;
    font-weight: 700;
  }

  .region-picker-subtitle {
    color: var(--theme-text-tertiary);
    font-size: 21rpx;
  }

  .region-path {
    gap: 10rpx;
    margin-top: 28rpx;
    padding-bottom: 18rpx;
    border-bottom: 1rpx solid var(--theme-border-light);
  }

  .region-path-item {
    display: flex;
    min-width: 0;
    min-height: 64rpx;
    flex: 1;
    align-items: center;
    justify-content: center;
    padding: 10rpx 8rpx;
    border-radius: 12rpx;
    border: 1rpx solid var(--theme-border-light);
    color: var(--theme-text-tertiary);
    background: var(--theme-surface-muted);
    font-size: 22rpx;
    text-align: center;
  }

  .region-path-item.active {
    color: var(--theme-brand);
    background: var(--theme-brand-soft);
    border-color: var(--theme-brand);
    font-weight: 700;
  }

  .region-picker-options-wrap {
    min-height: 500rpx;
  }

  .region-picker-hint {
    padding: 14rpx 0 4rpx;
    color: var(--theme-danger);
  }

  .region-picker-state {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 500rpx;
    color: var(--theme-text-tertiary);
    font-size: 23rpx;
  }

  .region-option-list {
    height: 600rpx;
    margin-top: 16rpx;
  }

  .region-option {
    justify-content: space-between;
    gap: 16rpx;
    min-height: 76rpx;
    margin: 4rpx 0;
    padding: 18rpx 16rpx;
    border-radius: 14rpx;
    border-bottom: 1rpx solid var(--theme-border-light);
  }

  .region-option.selected {
    border-bottom-color: transparent;
    background: var(--theme-brand-soft);
  }

  .region-option-copy {
    min-width: 0;
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 5rpx;
  }

  .region-option-name {
    color: var(--theme-text-primary);
    font-size: 25rpx;
  }

  .region-option-meta {
    color: var(--theme-text-tertiary);
    font-size: 19rpx;
  }

  .region-option.selected .region-option-name {
    color: var(--theme-brand);
    font-weight: 700;
  }

  .region-picker-done {
    margin: 18rpx 0 0;
    color: #fff;
    background: var(--theme-brand);
    font-size: 24rpx;
    line-height: 72rpx;
    border-radius: 16rpx;
    border: 0;
  }

  .area-list {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
  }

  .load-more-button {
    margin: 8rpx 0;
    border-radius: 16rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text-secondary);
    font-size: 24rpx;
    line-height: 72rpx;
    border: 1rpx solid var(--theme-border);
  }

  .selector-state {
    padding: 36rpx 0;
    color: var(--theme-text-tertiary);
    font-size: 24rpx;
    text-align: center;
  }

  .selector-error {
    color: var(--theme-danger);
  }
</style>
