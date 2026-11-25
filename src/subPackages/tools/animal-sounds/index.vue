<script setup lang="ts">
  import { computed, onBeforeUnmount, ref } from 'vue'
  import { onHide, onLoad, onPullDownRefresh, onReachBottom, onUnload } from '@dcloudio/uni-app'
  import {
    getAnimal,
    getAnimals,
    getCategories,
    getSoundTypes,
    getTags,
    type AnimalCard,
    type AnimalCategory,
    type AnimalDetail,
    type AnimalQuery,
    type SoundType,
    type TagDictionaries,
  } from './api'
  import { destroyPlayer, formatPlayerTime, playSound, playerProgressPercent, playerState, playerStatusLabel, stopPlayer } from './player'
  import PageLayout from '@/components/PageLayout.vue'

  const categories = ref<AnimalCategory[]>([])
  const soundTypes = ref<SoundType[]>([])
  const tags = ref<TagDictionaries>({ emotions: [], contexts: [] })
  const animals = ref<AnimalCard[]>([])
  const cardDetails = ref<Record<string, AnimalDetail>>({})
  const cardDetailLoadingId = ref('')
  const coverRefreshAttempts = ref<Record<string, boolean>>({})
  const coverFailedIds = ref<Record<string, boolean>>({})
  const keyword = ref('')
  const selectedCategory = ref('')
  const selectedSoundType = ref('')
  const selectedEmotion = ref('')
  const selectedContext = ref('')
  const displayMode = ref<'grid' | 'cards'>('grid')
  const currentCardIndex = ref(0)
  const showCardBack = ref(false)
  const loading = ref(false)
  const loadingMore = ref(false)
  const loadError = ref('')
  const dictionaryError = ref('')
  const hasNext = ref(false)
  const page = ref(1)
  const pageSize = 20
  let requestSequence = 0
  let cardDetailSequence = 0
  let searchTimer: ReturnType<typeof setTimeout> | undefined

  const categoriesWithAll = computed(() => [{ id: '', name: '全部动物', animalCount: 0 }, ...categories.value])
  const typeOptions = computed(() => [{ id: '', name: '全部声音' }, ...soundTypes.value])
  const emotionOptions = computed(() => [{ code: '', name: '全部情绪' }, ...tags.value.emotions])
  const contextOptions = computed(() => [{ code: '', name: '全部场景' }, ...tags.value.contexts])
  const activeCategoryName = computed(() => categories.value.find(item => item.id === selectedCategory.value)?.name || '全部动物')
  const activeAnimal = computed(() => animals.value[currentCardIndex.value])

  const querySnapshot = (targetPage: number): AnimalQuery => ({
    page: targetPage,
    limit: pageSize,
    sortBy: 'sort',
    ...(selectedCategory.value ? { categoryId: selectedCategory.value } : {}),
    ...(keyword.value.trim() ? { keyword: keyword.value.trim() } : {}),
    ...(selectedSoundType.value ? { soundTypeId: selectedSoundType.value } : {}),
    ...(selectedEmotion.value ? { emotionTag: selectedEmotion.value } : {}),
    ...(selectedContext.value ? { contextTag: selectedContext.value } : {}),
  })

  const loadDictionaries = async () => {
    const [categoryResult, typeResult, tagResult] = await Promise.allSettled([getCategories(), getSoundTypes(), getTags()])
    if (categoryResult.status === 'fulfilled') categories.value = categoryResult.value
    if (typeResult.status === 'fulfilled') soundTypes.value = typeResult.value
    if (tagResult.status === 'fulfilled') tags.value = tagResult.value
    dictionaryError.value = [categoryResult, typeResult, tagResult].some(result => result.status === 'rejected')
      ? '部分筛选条件暂时无法读取。'
      : ''
  }

  const loadAnimals = async (reset = true) => {
    if (!reset && (loading.value || loadingMore.value)) return
    const seq = reset ? ++requestSequence : requestSequence
    if (reset) {
      if (playerState.animalId) stopPlayer()
      coverRefreshAttempts.value = {}
      coverFailedIds.value = {}
    }
    const targetPage = reset ? 1 : page.value + 1
    if (reset) {
      loading.value = true
      loadingMore.value = false
      loadError.value = ''
    } else {
      if (!hasNext.value) return
      loadingMore.value = true
    }
    try {
      const result = await getAnimals(querySnapshot(targetPage))
      if (seq !== requestSequence) return
      animals.value = reset ? result.results : animals.value.concat(result.results)
      page.value = result.page
      hasNext.value = result.hasNext
      if (reset) currentCardIndex.value = 0
      showCardBack.value = false
    } catch {
      if (seq === requestSequence) loadError.value = '动物资料暂时无法加载，请检查网络后重试。'
    } finally {
      if (seq === requestSequence) {
        loading.value = false
        loadingMore.value = false
      }
    }
  }

  const refreshAnimalCover = async (animalId: string): Promise<void> => {
    if (coverRefreshAttempts.value[animalId]) {
      coverFailedIds.value[animalId] = true
      return
    }
    coverRefreshAttempts.value[animalId] = true
    const current = requestSequence
    try {
      const refreshed = await getAnimal(animalId)
      if (current !== requestSequence) return
      const index = animals.value.findIndex(item => item.id === animalId)
      if (index < 0) return
      const previousUrl = animals.value[index].coverUrl
      if (!refreshed.coverUrl || refreshed.coverUrl === previousUrl) {
        coverFailedIds.value[animalId] = true
        return
      }
      animals.value[index] = { ...animals.value[index], coverUrl: refreshed.coverUrl, coverExpiresAt: refreshed.coverExpiresAt }
    } catch {
      if (current === requestSequence) coverFailedIds.value[animalId] = true
    }
  }

  const scheduleSearch = () => {
    if (searchTimer) clearTimeout(searchTimer)
    searchTimer = setTimeout(() => void loadAnimals(true), 350)
  }
  const changeFilter = (kind: 'type' | 'emotion' | 'context', event: { detail: { value: number } }) => {
    const index = Number(event.detail.value)
    if (kind === 'type') selectedSoundType.value = typeOptions.value[index]?.id || ''
    if (kind === 'emotion') selectedEmotion.value = emotionOptions.value[index]?.code || ''
    if (kind === 'context') selectedContext.value = contextOptions.value[index]?.code || ''
    void loadAnimals(true)
  }
  const onSearchInput = (event: { detail: { value: string } }) => {
    keyword.value = event.detail.value
    scheduleSearch()
  }
  const clearSearch = () => {
    keyword.value = ''
    scheduleSearch()
  }
  const selectCategory = (id: string) => {
    if (selectedCategory.value === id) return
    selectedCategory.value = id
    void loadAnimals(true)
  }
  const retryDictionaries = (): void => {
    void loadDictionaries()
  }
  const retryLoad = (): void => {
    void loadAnimals(true)
  }
  const loadNext = (): void => {
    void loadAnimals(false)
  }
  const refresh = async () => {
    if (searchTimer) clearTimeout(searchTimer)
    await loadAnimals(true)
    uni.stopPullDownRefresh()
  }
  const openAnimal = (animal: AnimalCard) =>
    uni.navigateTo({ url: '/subPackages/tools/animal-sounds/detail?animalId=' + encodeURIComponent(animal.id) })
  const playAnimal = (animal: AnimalCard) => {
    if (!animal.defaultSoundId) {
      uni.showToast({ title: '这只动物暂无可播放声音', icon: 'none' })
      return
    }
    void playSound(animal.defaultSoundId, animal.id)
  }
  const handleSwiperChange = (event: { detail: { current: number } }) => {
    const previousAnimal = animals.value[currentCardIndex.value]
    const nextAnimal = animals.value[event.detail.current]
    if (previousAnimal?.id !== nextAnimal?.id && playerState.animalId) stopPlayer()
    ++cardDetailSequence
    cardDetailLoadingId.value = ''
    currentCardIndex.value = event.detail.current
    showCardBack.value = false
  }
  const navigateCard = (offset: number) => {
    const targetIndex = currentCardIndex.value + offset
    if (targetIndex < 0 || targetIndex >= animals.value.length) return
    handleSwiperChange({ detail: { current: targetIndex } })
  }
  const flipCard = async () => {
    showCardBack.value = !showCardBack.value
    if (!showCardBack.value || !activeAnimal.value || cardDetails.value[activeAnimal.value.id]) return
    const animal = activeAnimal.value
    const seq = ++cardDetailSequence
    cardDetailLoadingId.value = animal.id
    try {
      const detail = await getAnimal(animal.id)
      if (seq === cardDetailSequence && activeAnimal.value?.id === animal.id) cardDetails.value[animal.id] = detail
    } catch {
      if (seq === cardDetailSequence) cardDetailLoadingId.value = ''
    } finally {
      if (seq === cardDetailSequence) cardDetailLoadingId.value = ''
    }
  }

  onLoad(() => {
    void loadDictionaries()
    void loadAnimals()
  })
  onPullDownRefresh(() => void refresh())
  onReachBottom(loadNext)
  onHide(stopPlayer)
  onUnload(destroyPlayer)
  onBeforeUnmount(() => {
    if (searchTimer) clearTimeout(searchTimer)
  })
</script>

<template>
  <PageLayout title="动物叫声大全" nav-divider>
    <view class="sound-page">
      <view class="intro-block">
        <view class="intro-copy">
          <text class="eyebrow">ANIMAL SOUND LIBRARY</text>
          <text class="page-heading">听见自然的声音</text>
          <text class="intro-note">按动物探索已审核的声音与来源</text>
        </view>
        <view class="intro-mark" aria-hidden="true"><text>听</text></view>
      </view>
      <view class="search-box">
        <text class="search-symbol" aria-hidden="true">⌕</text>
        <input
          class="search-input"
          type="text"
          confirm-type="search"
          :value="keyword"
          placeholder="搜索动物、学名或叫声"
          @input="onSearchInput" />
        <button v-if="keyword" class="clear-search" aria-label="清空搜索" @click="clearSearch">×</button>
      </view>
      <scroll-view class="category-scroll" scroll-x :show-scrollbar="false">
        <view class="category-row">
          <button
            v-for="item in categoriesWithAll"
            :key="item.id || 'all'"
            class="category-chip"
            :class="{ active: selectedCategory === item.id }"
            @click="selectCategory(item.id)">
            {{ item.name }}<text v-if="item.id" class="category-count">{{ item.animalCount }}</text>
          </button>
        </view>
      </scroll-view>
      <view class="filter-row">
        <picker mode="selector" :range="typeOptions.map(item => item.name)" @change="changeFilter('type', $event)">
          <view class="filter-picker"
            >{{ typeOptions.find(item => item.id === selectedSoundType)?.name || '声音类型' }} <text>⌄</text></view
          >
        </picker>
        <picker mode="selector" :range="emotionOptions.map(item => item.name)" @change="changeFilter('emotion', $event)">
          <view class="filter-picker"
            >{{ emotionOptions.find(item => item.code === selectedEmotion)?.name || '情绪标签' }} <text>⌄</text></view
          >
        </picker>
        <picker mode="selector" :range="contextOptions.map(item => item.name)" @change="changeFilter('context', $event)">
          <view class="filter-picker"
            >{{ contextOptions.find(item => item.code === selectedContext)?.name || '声音场景' }} <text>⌄</text></view
          >
        </picker>
      </view>
      <view v-if="dictionaryError" class="dictionary-error">
        <text>{{ dictionaryError }}</text>
        <button class="dictionary-retry" @click="retryDictionaries">重试筛选项</button>
      </view>
      <view class="results-heading">
        <view
          ><text class="section-title">{{ activeCategoryName }}</text
          ><text class="result-count">{{ loading && !animals.length ? '正在读取资料' : '收录 ' + animals.length + ' 种' }}</text></view
        >
        <view class="mode-switch" role="group" aria-label="切换展示方式">
          <button class="mode-button" :class="{ chosen: displayMode === 'grid' }" aria-label="双列列表" @click="displayMode = 'grid'"
            >▦</button
          >
          <button class="mode-button" :class="{ chosen: displayMode === 'cards' }" aria-label="卡片浏览" @click="displayMode = 'cards'"
            >▤</button
          >
        </view>
      </view>
      <view v-if="loading && !animals.length" class="animal-grid">
        <view v-for="n in 4" :key="n" class="skeleton-card"
          ><view class="skeleton-image" /><view class="skeleton-line" /><view class="skeleton-line short"
        /></view>
      </view>
      <view v-else-if="loadError" class="state-panel">
        <text class="state-title">资料暂时不可用</text><text class="state-copy">{{ loadError }}</text
        ><button class="retry-button" @click="retryLoad">重试</button>
      </view>
      <view v-else-if="!animals.length" class="state-panel empty-panel">
        <view class="empty-icon">♪</view><text class="state-title">这里还没有动物资料</text
        ><text class="state-copy">试试其他分类或关键词；仅展示服务端已发布的内容。</text>
      </view>
      <view v-else-if="displayMode === 'grid'" class="animal-grid">
        <view v-for="animal in animals" :key="animal.id" class="animal-card" @click="openAnimal(animal)">
          <view class="animal-cover-wrap">
            <image
              v-if="animal.coverUrl && !coverFailedIds[animal.id]"
              class="animal-cover"
              :src="animal.coverUrl"
              mode="aspectFill"
              :alt="animal.name + '封面'"
              @error="refreshAnimalCover(animal.id)" />
            <view v-else class="cover-empty"><text>暂无封面</text></view>
            <view class="sound-count">{{ animal.soundCount }} 段声音</view>
            <button class="quick-play" :aria-label="'播放' + animal.name + '的代表声音'" @click.stop="playAnimal(animal)">{{
              playerState.soundId === animal.defaultSoundId && playerState.status === 'playing' ? 'Ⅱ' : '▶'
            }}</button>
          </view>
          <view class="animal-copy"
            ><text class="animal-name">{{ animal.name }}</text
            ><text v-if="animal.nameEn" class="animal-name-en">{{ animal.nameEn }}</text
            ><text class="animal-meta">{{ animal.soundTypeCount }} 种声音 · 点开查看介绍</text
            ><view v-if="playerState.animalId === animal.id" class="animal-progress">
              <view v-if="playerState.duration > 0" class="progress-track"
                ><view class="progress-fill" :style="{ width: playerProgressPercent() + '%' }"
              /></view>
              <view class="progress-controls">
                <text class="progress-time">{{
                  playerState.duration > 0
                    ? formatPlayerTime(playerState.currentTime) + ' / ' + formatPlayerTime(playerState.duration)
                    : playerStatusLabel(playerState.status)
                }}</text>
                <button class="stop-active" aria-label="停止当前声音" @click.stop="stopPlayer">停止</button>
              </view>
            </view></view
          >
          >
        </view>
      </view>
      <view v-else class="card-mode">
        <view class="card-mode-top"
          ><text class="card-position">{{ Math.min(currentCardIndex + 1, animals.length) }} / {{ animals.length }}</text
          ><text class="card-hint">点卡片查看背面</text></view
        >
        <swiper class="animal-swiper" :current="currentCardIndex" :duration="220" @change="handleSwiperChange">
          <swiper-item v-for="(animal, index) in animals" :key="animal.id">
            <view class="animal-flashcard" :class="{ flipped: showCardBack && index === currentCardIndex }" @click="flipCard">
              <view v-if="!showCardBack || index !== currentCardIndex" class="flash-front">
                <image
                  v-if="animal.coverUrl && !coverFailedIds[animal.id]"
                  class="flash-cover"
                  :src="animal.coverUrl"
                  mode="aspectFill"
                  :alt="animal.name + '封面'"
                  @error="refreshAnimalCover(animal.id)" /><view v-else class="flash-cover cover-empty"><text>暂无封面</text></view>
                <view class="flash-caption"
                  ><text class="flash-name">{{ animal.name }}</text
                  ><text class="animal-name-en">{{ animal.nameEn || animal.scientificName }}</text></view
                >
              </view>
              <view v-else class="flash-back"
                ><text class="back-label">动物档案</text><text class="back-name">{{ animal.name }}</text
                ><text class="back-scientific">{{ animal.scientificName || '暂无科学名称' }}</text
                ><text class="back-description">{{
                  cardDetails[animal.id]?.description ||
                  (cardDetailLoadingId === animal.id ? '正在读取动物介绍…' : '介绍暂不可用，请进入详情查看样本来源与许可。')
                }}</text
                ><text v-if="cardDetails[animal.id]?.categoryIds.length" class="back-meta">{{
                  cardDetails[animal.id]?.categoryIds.map(item => item.name).join(' · ')
                }}</text
                ><text v-if="cardDetails[animal.id]?.soundTypes.length" class="back-meta"
                  >声音类型：{{ cardDetails[animal.id]?.soundTypes.map(item => item.name).join('、') }}</text
                ><text class="back-meta">{{ animal.soundCount }} 段声音 · {{ animal.soundTypeCount }} 种类型</text></view
              >
              <view class="flash-actions" @click.stop>
                <button class="flash-play" :aria-label="'播放' + animal.name + '的代表声音'" @click.stop="playAnimal(animal)">{{
                  playerState.soundId === animal.defaultSoundId && playerState.status === 'playing' ? 'Ⅱ 暂停' : '▶ 播放代表声音'
                }}</button>
                <button v-if="playerState.animalId === animal.id" class="flash-stop" aria-label="停止当前声音" @click.stop="stopPlayer"
                  >停止</button
                >
                <button class="flash-flip" :aria-label="showCardBack ? '翻回正面' : '查看动物档案背面'" @click.stop="flipCard">{{
                  showCardBack ? '正面' : '翻面'
                }}</button>
                <button class="flash-detail" @click.stop="openAnimal(animal)">详情</button>
              </view>
            </view>
          </swiper-item>
        </swiper>
        <view class="card-navigation">
          <button class="card-nav-button" :disabled="currentCardIndex === 0" aria-label="上一个动物" @click="navigateCard(-1)"
            >上一个</button
          >
          <text class="card-nav-position">{{ currentCardIndex + 1 }} / {{ animals.length }}</text>
          <button
            class="card-nav-button"
            :disabled="currentCardIndex >= animals.length - 1"
            aria-label="下一个动物"
            @click="navigateCard(1)"
            >下一个</button
          >
        </view>
        <view class="swipe-note">左右滑动切换动物 · 点击卡片正反面切换</view>
      </view>
      <view v-if="loadingMore" class="loading-more">正在载入更多动物…</view
      ><button v-else-if="hasNext && animals.length" class="more-button" @click="loadNext">继续加载</button
      ><text v-else-if="animals.length && !hasNext" class="end-note">已显示全部结果</text>
      <view v-if="playerState.status === 'error'" class="player-error">{{ playerState.errorMessage }}</view>
    </view>
  </PageLayout>
</template>

<style lang="scss" scoped>
  .sound-page {
    min-height: 100vh;
    padding: 28rpx 30rpx 64rpx;
    background: var(--theme-bg);
    color: var(--theme-text);
    box-sizing: border-box;
  }
  .intro-block {
    min-height: 166rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8rpx 6rpx 24rpx;
  }
  .intro-copy {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  .eyebrow {
    color: var(--theme-text-tertiary);
    font-size: 18rpx;
    letter-spacing: 3rpx;
  }
  .page-heading {
    margin-top: 10rpx;
    font-size: 40rpx;
    line-height: 1.25;
    font-weight: 700;
    letter-spacing: -1rpx;
  }
  .intro-note {
    margin-top: 10rpx;
    color: var(--theme-text-secondary);
    font-size: 24rpx;
  }
  .intro-mark {
    width: 104rpx;
    height: 104rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 32rpx;
    background: var(--theme-surface-2);
    color: var(--theme-brand);
    font-size: 44rpx;
    font-weight: 600;
  }
  .search-box {
    height: 88rpx;
    display: flex;
    align-items: center;
    padding: 0 22rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 20rpx;
    background: var(--theme-surface);
    box-sizing: border-box;
  }
  .search-symbol {
    color: var(--theme-text-secondary);
    font-size: 42rpx;
    line-height: 1;
  }
  .search-input {
    flex: 1;
    min-width: 0;
    margin-left: 16rpx;
    color: var(--theme-text);
    font-size: 28rpx;
  }
  .clear-search {
    width: 88rpx;
    height: 88rpx;
    line-height: 86rpx;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--theme-text-tertiary);
    font-size: 40rpx;
  }
  .category-scroll {
    margin: 24rpx -30rpx 0;
    white-space: nowrap;
  }
  .category-row {
    display: flex;
    gap: 12rpx;
    padding: 0 30rpx 8rpx;
  }
  .category-chip {
    flex-shrink: 0;
    min-height: 88rpx;
    padding: 0 22rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 999rpx;
    background: var(--theme-surface);
    color: var(--theme-text-secondary);
    font-size: 23rpx;
    line-height: 86rpx;
  }
  .category-chip.active {
    border-color: var(--theme-brand);
    background: var(--theme-brand);
    color: var(--theme-surface);
  }
  .category-count {
    margin-left: 8rpx;
    opacity: 0.78;
  }
  .filter-row {
    display: flex;
    gap: 12rpx;
    margin-top: 20rpx;
  }
  .filter-picker {
    min-height: 88rpx;
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 0 16rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 14rpx;
    color: var(--theme-text-secondary);
    background: var(--theme-surface);
    font-size: 21rpx;
    white-space: nowrap;
  }
  .filter-picker text {
    color: var(--theme-text-tertiary);
  }
  .dictionary-error {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12rpx;
    margin-top: 12rpx;
    color: var(--theme-danger);
    font-size: 20rpx;
  }
  .dictionary-retry {
    flex-shrink: 0;
    min-height: 88rpx;
    padding: 0 16rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 999rpx;
    background: var(--theme-surface);
    color: var(--theme-text);
    font-size: 20rpx;
    line-height: 86rpx;
  }
  .results-heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 30rpx 0 20rpx;
  }
  .section-title {
    display: block;
    font-size: 30rpx;
    font-weight: 650;
  }
  .result-count {
    display: block;
    margin-top: 6rpx;
    color: var(--theme-text-tertiary);
    font-size: 21rpx;
  }
  .mode-switch {
    display: flex;
    padding: 5rpx;
    border-radius: 14rpx;
    background: var(--theme-surface-2);
  }
  .mode-button {
    width: 88rpx;
    height: 88rpx;
    padding: 0;
    border: 0;
    border-radius: 10rpx;
    background: transparent;
    color: var(--theme-text-tertiary);
    font-size: 32rpx;
    line-height: 88rpx;
  }
  .mode-button.chosen {
    background: var(--theme-surface);
    color: var(--theme-brand);
    box-shadow: 0 2rpx 8rpx var(--theme-shadow-xs);
  }
  .animal-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18rpx;
  }
  .animal-card {
    min-width: 0;
    overflow: hidden;
    border-radius: 22rpx;
    background: var(--theme-surface);
    box-shadow: 0 4rpx 18rpx var(--theme-shadow-xs);
  }
  .animal-cover-wrap {
    position: relative;
    height: 240rpx;
    background: var(--theme-surface-2);
  }
  .animal-cover {
    width: 100%;
    height: 100%;
    display: block;
  }
  .cover-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--theme-surface-2);
    color: var(--theme-text-tertiary);
    font-size: 22rpx;
  }
  .sound-count {
    position: absolute;
    left: 14rpx;
    bottom: 14rpx;
    padding: 8rpx 12rpx;
    border-radius: 999rpx;
    background: var(--theme-mask);
    color: var(--theme-surface);
    font-size: 18rpx;
  }
  .quick-play {
    position: absolute;
    right: 12rpx;
    bottom: 10rpx;
    width: 88rpx;
    height: 88rpx;
    padding: 0;
    border: 2rpx solid var(--theme-surface);
    border-radius: 50%;
    background: var(--theme-brand);
    color: var(--theme-surface);
    font-size: 27rpx;
    line-height: 84rpx;
    box-shadow: 0 4rpx 14rpx var(--theme-shadow-sm);
  }
  .animal-copy {
    display: flex;
    flex-direction: column;
    padding: 18rpx 18rpx 20rpx;
  }
  .animal-name {
    overflow: hidden;
    color: var(--theme-text);
    font-size: 27rpx;
    font-weight: 650;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .animal-name-en {
    margin-top: 4rpx;
    color: var(--theme-text-secondary);
    font-size: 20rpx;
  }
  .animal-meta {
    margin-top: 12rpx;
    color: var(--theme-text-tertiary);
    font-size: 19rpx;
  }
  .animal-progress {
    display: flex;
    flex-direction: column;
    gap: 6rpx;
    margin-top: 12rpx;
  }
  .progress-track {
    height: 6rpx;
    overflow: hidden;
    border-radius: 999rpx;
    background: var(--theme-surface-2);
  }
  .progress-fill {
    height: 100%;
    border-radius: 999rpx;
    background: var(--theme-brand);
  }
  .progress-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10rpx;
  }
  .stop-active {
    min-width: 88rpx;
    min-height: 88rpx;
    padding: 0 12rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 999rpx;
    background: var(--theme-surface);
    color: var(--theme-text);
    font-size: 21rpx;
    line-height: 86rpx;
  }
  .progress-time {
    color: var(--theme-text-tertiary);
    font-size: 18rpx;
  }
  .state-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 70rpx 36rpx;
    border-radius: 22rpx;
    background: var(--theme-surface);
    text-align: center;
  }
  .state-title {
    color: var(--theme-text);
    font-size: 29rpx;
    font-weight: 650;
  }
  .state-copy {
    margin-top: 12rpx;
    color: var(--theme-text-secondary);
    font-size: 23rpx;
    line-height: 1.6;
  }
  .retry-button {
    min-width: 160rpx;
    min-height: 88rpx;
    margin-top: 24rpx;
    padding: 0 24rpx;
    border: 0;
    border-radius: 999rpx;
    background: var(--theme-brand);
    color: var(--theme-surface);
    font-size: 24rpx;
    line-height: 86rpx;
  }
  .empty-icon {
    margin-bottom: 16rpx;
    color: var(--theme-brand);
    font-size: 58rpx;
  }
  .skeleton-card {
    height: 340rpx;
    padding: 12rpx;
    border-radius: 22rpx;
    background: var(--theme-surface);
  }
  .skeleton-image {
    height: 220rpx;
    border-radius: 16rpx;
    background: var(--theme-surface-2);
  }
  .skeleton-line {
    width: 70%;
    height: 18rpx;
    margin: 18rpx 4rpx 0;
    border-radius: 999rpx;
    background: var(--theme-surface-2);
  }
  .skeleton-line.short {
    width: 45%;
    height: 14rpx;
    margin-top: 12rpx;
  }
  .card-mode {
    padding: 0 4rpx;
  }
  .card-mode-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 8rpx 4rpx 14rpx;
  }
  .card-position {
    color: var(--theme-text);
    font-size: 23rpx;
    font-weight: 600;
  }
  .card-hint,
  .swipe-note {
    color: var(--theme-text-tertiary);
    font-size: 20rpx;
  }
  .card-navigation {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12rpx;
    margin-top: 14rpx;
  }
  .card-nav-button {
    min-width: 140rpx;
    min-height: 88rpx;
    padding: 0 18rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 999rpx;
    background: var(--theme-surface);
    color: var(--theme-text);
    font-size: 22rpx;
    line-height: 86rpx;
  }
  .card-nav-button[disabled] {
    color: var(--theme-text-tertiary);
    opacity: 0.6;
  }
  .card-nav-position {
    color: var(--theme-text-secondary);
    font-size: 21rpx;
  }
  .animal-swiper {
    height: 690rpx;
  }
  .animal-flashcard {
    position: relative;
    height: 100%;
    overflow: hidden;
    border-radius: 28rpx;
    background: var(--theme-surface);
    box-shadow: 0 6rpx 24rpx var(--theme-shadow-xs);
  }
  .flash-front {
    position: relative;
    height: 100%;
    padding-bottom: 124rpx;
    box-sizing: border-box;
  }
  .flash-cover {
    width: 100%;
    height: 100%;
    display: block;
  }
  .flash-caption {
    position: absolute;
    right: 0;
    bottom: 124rpx;
    left: 0;
    display: flex;
    flex-direction: column;
    padding: 72rpx 26rpx 22rpx;
    background: linear-gradient(transparent, var(--theme-mask));
    color: var(--theme-surface);
  }
  .flash-name {
    font-size: 38rpx;
    font-weight: 700;
  }
  .flash-caption .animal-name-en {
    color: var(--theme-surface);
    font-size: 22rpx;
  }
  .flash-back {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    padding: 40rpx;
    box-sizing: border-box;
    background: var(--theme-surface-2);
  }
  .back-label {
    color: var(--theme-brand);
    font-size: 21rpx;
    letter-spacing: 2rpx;
  }
  .back-name {
    margin-top: 18rpx;
    color: var(--theme-text);
    font-size: 40rpx;
    font-weight: 700;
  }
  .back-scientific {
    margin-top: 8rpx;
    color: var(--theme-text-secondary);
    font-size: 23rpx;
  }
  .back-description {
    margin-top: 28rpx;
    color: var(--theme-text-secondary);
    font-size: 24rpx;
    line-height: 1.6;
  }
  .back-meta {
    margin-top: 18rpx;
    color: var(--theme-text);
    font-size: 22rpx;
  }
  .flash-actions {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    height: 124rpx;
    display: flex;
    align-items: center;
    gap: 16rpx;
    padding: 18rpx 20rpx;
    box-sizing: border-box;
    background: var(--theme-surface);
  }
  .flash-play,
  .flash-flip,
  .flash-stop,
  .flash-detail {
    height: 88rpx;
    padding: 0 18rpx;
    border-radius: 14rpx;
    font-size: 22rpx;
    line-height: 88rpx;
    white-space: nowrap;
  }
  .flash-play {
    flex: 1;
    border: 0;
    background: var(--theme-brand);
    color: var(--theme-surface);
  }
  .flash-stop,
  .flash-flip,
  .flash-detail {
    min-width: 88rpx;
    flex-shrink: 0;
    border: 1rpx solid var(--theme-border);
    background: var(--theme-surface);
    color: var(--theme-text);
  }
  .swipe-note {
    margin: 18rpx 0 8rpx;
    text-align: center;
  }
  .loading-more,
  .end-note {
    display: block;
    padding: 28rpx 0;
    color: var(--theme-text-tertiary);
    font-size: 21rpx;
    text-align: center;
  }
  .more-button {
    min-height: 88rpx;
    margin: 20rpx auto;
    padding: 0 26rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 999rpx;
    background: var(--theme-surface);
    color: var(--theme-text-secondary);
    font-size: 22rpx;
  }
  .player-error {
    position: fixed;
    right: 24rpx;
    bottom: 24rpx;
    left: 24rpx;
    z-index: 5;
    padding: 18rpx 22rpx;
    border-radius: 14rpx;
    background: var(--theme-surface);
    color: var(--theme-danger);
    font-size: 22rpx;
    box-shadow: 0 4rpx 20rpx var(--theme-shadow-sm);
  }
</style>
