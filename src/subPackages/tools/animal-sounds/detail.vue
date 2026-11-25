<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { onHide, onLoad, onReachBottom, onUnload } from '@dcloudio/uni-app'
  import {
    getAnimal,
    getAnimalSounds,
    getSound,
    getSoundTypes,
    getTags,
    type AnimalDetail,
    type AnimalSoundCard,
    type SoundDetail,
    type SoundQuery,
    type SoundType,
    type TagDictionaries,
  } from './api'
  import { destroyPlayer, formatPlayerTime, playSound, playerProgressPercent, playerState, playerStatusLabel, stopPlayer } from './player'
  import PageLayout from '@/components/PageLayout.vue'

  const animal = ref<AnimalDetail | null>(null)
  const coverRefreshAttempted = ref(false)
  const coverFailed = ref(false)
  const sounds = ref<AnimalSoundCard[]>([])
  const soundDetails = ref<Record<string, SoundDetail | null>>({})
  const sourceExpanded = ref<Record<string, boolean>>({})
  const sourceLoading = ref<Record<string, boolean>>({})
  const sourceErrors = ref<Record<string, string>>({})
  const soundTypes = ref<SoundType[]>([])
  const tags = ref<TagDictionaries>({ emotions: [], contexts: [] })
  const animalId = ref('')
  const selectedSoundType = ref('')
  const selectedEmotion = ref('')
  const selectedContext = ref('')
  const loading = ref(true)
  const loadingMore = ref(false)
  const errorMessage = ref('')
  const hasNext = ref(false)
  const page = ref(1)
  const pageSize = 20
  let sequence = 0

  const soundGroups = computed(() => {
    const groups: { id: string; name: string; nameEn?: string; sounds: AnimalSoundCard[] }[] = []
    sounds.value.forEach(sound => {
      let group = groups.find(item => item.id === sound.soundTypeId)
      if (!group) {
        group = { id: sound.soundTypeId, name: sound.soundTypeName, nameEn: sound.soundTypeNameEn, sounds: [] }
        groups.push(group)
      }
      group.sounds.push(sound)
    })
    return groups
  })

  const typeOptions = () => [{ id: '', name: '全部类型' }, ...soundTypes.value]
  const emotionOptions = () => [{ code: '', name: '全部情绪' }, ...tags.value.emotions]
  const contextOptions = () => [{ code: '', name: '全部场景' }, ...tags.value.contexts]
  const query = (targetPage: number): SoundQuery => ({
    page: targetPage,
    limit: pageSize,
    sortBy: 'sort',
    ...(selectedSoundType.value ? { soundTypeId: selectedSoundType.value } : {}),
    ...(selectedEmotion.value ? { emotionTag: selectedEmotion.value } : {}),
    ...(selectedContext.value ? { contextTag: selectedContext.value } : {}),
  })

  const loadSounds = async (reset = true) => {
    if (!animalId.value || (!reset && (loadingMore.value || !hasNext.value))) return
    const current = reset ? ++sequence : sequence
    const targetPage = reset ? 1 : page.value + 1
    if (reset) {
      loading.value = true
      loadingMore.value = false
      sourceLoading.value = {}
      errorMessage.value = ''
    } else loadingMore.value = true
    try {
      const result = await getAnimalSounds(animalId.value, query(targetPage))
      if (current !== sequence) return
      sounds.value = reset ? result.results : sounds.value.concat(result.results)
      page.value = result.page
      hasNext.value = result.hasNext
    } catch {
      if (current === sequence) errorMessage.value = '声音样本暂时无法加载，请重试。'
    } finally {
      if (current === sequence) {
        loading.value = false
        loadingMore.value = false
      }
    }
  }

  const reload = (): void => {
    void loadSounds(true)
  }
  const updateFilter = (kind: 'type' | 'emotion' | 'context', event: { detail: { value: number } }) => {
    const index = Number(event.detail.value)
    if (kind === 'type') selectedSoundType.value = typeOptions()[index]?.id || ''
    if (kind === 'emotion') selectedEmotion.value = emotionOptions()[index]?.code || ''
    if (kind === 'context') selectedContext.value = contextOptions()[index]?.code || ''
    void loadSounds(true)
  }
  const retryAll = () => {
    if (!animalId.value) return
    loading.value = true
    errorMessage.value = ''
    void Promise.allSettled([getAnimal(animalId.value), getSoundTypes(), getTags()])
      .then(([animalResult, typeResult, tagResult]) => {
        coverRefreshAttempted.value = false
        coverFailed.value = false
        if (animalResult.status !== 'fulfilled') {
          animal.value = null
          loading.value = false
          errorMessage.value = '动物详情暂时无法加载，请稍后重试。'
          return
        }
        animal.value = animalResult.value
        if (typeResult.status === 'fulfilled') soundTypes.value = typeResult.value
        if (tagResult.status === 'fulfilled') tags.value = tagResult.value
        void loadSounds(true)
      })
      .catch(() => {
        loading.value = false
        errorMessage.value = '动物详情暂时无法加载，请稍后重试。'
      })
  }
  const play = (sound: AnimalSoundCard): void => {
    void playSound(sound.id, sound.animalId)
  }
  const loadSoundSource = async (sound: AnimalSoundCard): Promise<void> => {
    if (soundDetails.value[sound.id] || sourceLoading.value[sound.id]) return
    const current = sequence
    sourceLoading.value[sound.id] = true
    sourceErrors.value[sound.id] = ''
    try {
      const detail = await getSound(sound.id)
      if (current === sequence) soundDetails.value[sound.id] = detail
    } catch {
      if (current === sequence) sourceErrors.value[sound.id] = '来源许可暂时无法读取，请重试。'
    } finally {
      if (current === sequence) sourceLoading.value[sound.id] = false
    }
  }
  const toggleSource = (sound: AnimalSoundCard): void => {
    const shouldOpen = !sourceExpanded.value[sound.id]
    sourceExpanded.value[sound.id] = shouldOpen
    if (shouldOpen) void loadSoundSource(sound)
  }
  const retrySource = (sound: AnimalSoundCard): void => {
    sourceErrors.value[sound.id] = ''
    void loadSoundSource(sound)
  }
  const formatDuration = (durationMs: number) => {
    const seconds = Math.max(1, Math.round(durationMs / 1000))
    return Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0')
  }
  const sourceLabel = (source: SoundDetail['source']) => source.license || '许可信息暂不可用'
  const openExternalSource = (url: string) => uni.navigateTo({ url: '/subPackages/common/webview/webview?url=' + encodeURIComponent(url) })
  const refreshDetailCover = async (): Promise<void> => {
    if (coverRefreshAttempted.value) {
      coverFailed.value = true
      return
    }
    coverRefreshAttempted.value = true
    const current = sequence
    try {
      const refreshed = await getAnimal(animalId.value)
      if (current !== sequence || !animal.value) return
      if (!refreshed.coverUrl || refreshed.coverUrl === animal.value.coverUrl) {
        coverFailed.value = true
        return
      }
      animal.value = refreshed
    } catch {
      if (current === sequence) coverFailed.value = true
    }
  }

  onLoad(async (options?: Record<string, string | undefined>) => {
    animalId.value = options?.animalId || ''
    if (!animalId.value) {
      loading.value = false
      errorMessage.value = '没有收到动物编号，请返回列表重新打开。'
      return
    }
    const [animalResult, typesResult, tagsResult] = await Promise.allSettled([getAnimal(animalId.value), getSoundTypes(), getTags()])
    if (animalResult.status === 'fulfilled') animal.value = animalResult.value
    else errorMessage.value = '动物详情暂时无法加载，请稍后重试。'
    if (typesResult.status === 'fulfilled') soundTypes.value = typesResult.value
    if (tagsResult.status === 'fulfilled') tags.value = tagsResult.value
    if (animal.value) await loadSounds(true)
    else loading.value = false
  })
  onReachBottom(() => void loadSounds(false))
  onHide(stopPlayer)
  onUnload(() => {
    ++sequence
    destroyPlayer()
  })
</script>

<template>
  <PageLayout title="动物详情" nav-divider>
    <view class="detail-page">
      <view v-if="loading && !animal" class="detail-skeleton"
        ><view class="hero-skeleton" /><view class="line-skeleton" /><view class="line-skeleton short"
      /></view>
      <view v-else-if="errorMessage && !animal" class="state-panel">
        <text class="state-title">暂时无法打开详情</text><text class="state-copy">{{ errorMessage }}</text
        ><button class="primary-button" @click="retryAll">重试</button>
      </view>
      <template v-else-if="animal">
        <view class="animal-hero">
          <image
            v-if="animal.coverUrl && !coverFailed"
            class="hero-image"
            :src="animal.coverUrl"
            mode="aspectFill"
            :alt="animal.name + '封面'"
            @error="refreshDetailCover" />
          <view v-else class="hero-image hero-empty"><text>暂无封面</text></view>
        </view>
        <view class="animal-title-block">
          <text class="animal-title">{{ animal.name }}</text>
          <text v-if="animal.nameEn" class="animal-en">{{ animal.nameEn }}</text>
          <text v-if="animal.scientificName" class="scientific-name">{{ animal.scientificName }}</text>
          <view class="meta-row"
            ><text>{{ animal.soundCount }} 段声音</text><text>{{ animal.soundTypeCount }} 种声音类型</text></view
          >
          <text v-if="animal.description" class="description">{{ animal.description }}</text>
          <view class="category-row"
            ><text v-for="category in animal.categoryIds" :key="category.id" class="category-tag">{{ category.name }}</text></view
          >
        </view>
        <view class="call-disclaimer">
          <text class="disclaimer-title">叫声说明</text>
          <text class="disclaimer-copy">动物叫声的含义会因个体和情境而异；页面中的趣味标题仅作描述，不代表可靠或逐字翻译。</text>
        </view>
        <view v-if="animal.coverSource?.license || animal.coverSource?.attribution" class="cover-credit">
          <text class="credit-label">封面来源</text
          ><text v-if="animal.coverSource.author" class="credit-copy">{{ animal.coverSource.author }}</text>
          <text v-if="animal.coverSource.license" class="credit-copy">{{ animal.coverSource.license }}</text>
          <text v-if="animal.coverSource.attribution" class="credit-copy">{{ animal.coverSource.attribution }}</text>
          <text v-if="animal.coverSource.licenseUrl" class="credit-link" @click="openExternalSource(animal.coverSource.licenseUrl)"
            >查看许可来源</text
          >
        </view>
        <view class="sounds-heading"
          ><view><text class="section-title">声音样本</text><text class="section-note">播放地址按需获取，不自动播放</text></view></view
        >
        <view class="filter-row">
          <picker mode="selector" :range="typeOptions().map(item => item.name)" @change="updateFilter('type', $event)"
            ><view class="filter-picker"
              >{{ typeOptions().find(item => item.id === selectedSoundType)?.name || '全部类型' }}<text>⌄</text></view
            ></picker
          >
          <picker mode="selector" :range="emotionOptions().map(item => item.name)" @change="updateFilter('emotion', $event)"
            ><view class="filter-picker"
              >{{ emotionOptions().find(item => item.code === selectedEmotion)?.name || '情绪标签' }}<text>⌄</text></view
            ></picker
          >
          <picker mode="selector" :range="contextOptions().map(item => item.name)" @change="updateFilter('context', $event)"
            ><view class="filter-picker"
              >{{ contextOptions().find(item => item.code === selectedContext)?.name || '声音场景' }}<text>⌄</text></view
            ></picker
          >
        </view>
        <view v-if="loading && !sounds.length" class="sound-loading"><view v-for="n in 3" :key="n" class="sound-skeleton" /></view>
        <view v-else-if="errorMessage" class="inline-error"
          ><text>{{ errorMessage }}</text
          ><button class="small-retry" @click="reload">重试</button></view
        >
        <view v-else-if="!sounds.length" class="state-panel small-state"
          ><text class="state-title">暂无匹配的声音</text><text class="state-copy">可以更换筛选条件后再试。</text></view
        >
        <view v-else class="sound-groups">
          <view v-for="group in soundGroups" :key="group.id" class="sound-group">
            <view class="sound-group-heading" role="heading" aria-level="3">
              <text class="sound-group-title">{{ group.name }}</text>
              <text v-if="group.nameEn" class="sound-group-subtitle">{{ group.nameEn }}</text>
              <text class="sound-group-count">{{ group.sounds.length }} 段</text>
            </view>
            <view class="sound-list">
              <view v-for="sound in group.sounds" :key="sound.id" class="sound-card">
                <view class="sound-head">
                  <view class="sound-main"
                    ><text class="sound-title">{{ sound.title }}</text
                    ><text v-if="sound.titleEn" class="sound-en">{{ sound.titleEn }}</text
                    ><text class="sound-type"
                      >{{ sound.soundTypeName }}<text v-if="sound.soundTypeNameEn"> · {{ sound.soundTypeNameEn }}</text></text
                    ></view
                  >
                  <button class="sound-play" :aria-label="'播放' + sound.title" @click="play(sound)">{{
                    playerState.soundId === sound.id && playerState.status === 'playing' ? 'Ⅱ' : '▶'
                  }}</button>
                </view>
                <text v-if="sound.description" class="sound-description">{{ sound.description }}</text>
                <view class="tag-row"
                  ><text v-for="tag in sound.emotionTags" :key="'e-' + tag" class="sound-tag">{{
                    tags.emotions.find(item => item.code === tag)?.name || tag
                  }}</text
                  ><text v-for="tag in sound.contextTags" :key="'c-' + tag" class="sound-tag context-tag">{{
                    tags.contexts.find(item => item.code === tag)?.name || tag
                  }}</text></view
                >
                <view class="sound-meta">
                  <text>{{ formatDuration(sound.durationMs) }}</text>
                  <text>{{ playerState.soundId === sound.id ? playerStatusLabel(playerState.status) : '手动播放' }}</text>
                </view>
                <view v-if="playerState.soundId === sound.id" class="sound-progress">
                  <view v-if="playerState.duration > 0" class="progress-track"
                    ><view class="progress-fill" :style="{ width: playerProgressPercent() + '%' }"
                  /></view>
                  <view class="sound-progress-controls">
                    <text class="progress-time">{{
                      playerState.duration > 0
                        ? formatPlayerTime(playerState.currentTime) + ' / ' + formatPlayerTime(playerState.duration)
                        : playerStatusLabel(playerState.status)
                    }}</text>
                    <button class="sound-stop" aria-label="停止当前声音" @click="stopPlayer">停止</button>
                  </view>
                </view>
                <view class="license-disclosure">
                  <button class="license-toggle" @click="toggleSource(sound)">
                    {{ sourceExpanded[sound.id] ? '收起来源与许可' : '查看来源与许可' }}
                  </button>
                  <view v-if="sourceExpanded[sound.id]" class="license-panel">
                    <text class="license-title">声音来源与许可</text>
                    <text v-if="sourceLoading[sound.id]" class="license-copy">正在读取来源许可…</text>
                    <view v-else-if="sourceErrors[sound.id]" class="source-error">
                      <text class="license-copy">{{ sourceErrors[sound.id] }}</text>
                      <button class="source-retry" @click="retrySource(sound)">重试</button>
                    </view>
                    <template v-else-if="soundDetails[sound.id]?.source">
                      <text class="license-copy">{{ sourceLabel(soundDetails[sound.id]!.source) }}</text>
                      <text v-if="soundDetails[sound.id]?.source.author" class="license-copy"
                        >作者：{{ soundDetails[sound.id]?.source.author }}</text
                      >
                      <text v-if="soundDetails[sound.id]?.source.attribution" class="license-copy"
                        >署名：{{ soundDetails[sound.id]?.source.attribution }}</text
                      >
                      <text
                        v-if="soundDetails[sound.id]?.source.modified && soundDetails[sound.id]?.source.modificationNotes"
                        class="license-copy">
                        处理说明：{{ soundDetails[sound.id]?.source.modificationNotes }}
                      </text>
                      <text
                        v-if="soundDetails[sound.id]?.source.sourceUrl"
                        class="license-link"
                        @click="openExternalSource(soundDetails[sound.id]?.source.sourceUrl || '')"
                        >打开来源页面</text
                      >
                      <text
                        v-if="soundDetails[sound.id]?.source.licenseUrl"
                        class="license-link"
                        @click="openExternalSource(soundDetails[sound.id]?.source.licenseUrl || '')"
                        >查看许可条款</text
                      >
                    </template>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
        <view v-if="loadingMore" class="load-more">正在加载更多声音…</view
        ><button v-else-if="sounds.length && hasNext" class="load-more-button" @click="loadSounds(false)">继续加载声音</button
        ><text v-else-if="sounds.length" class="load-more">已显示全部声音</text>
        <view v-if="playerState.status === 'error'" class="player-error">{{ playerState.errorMessage }}</view>
      </template>
    </view>
  </PageLayout>
</template>

<style lang="scss" scoped>
  .detail-page {
    min-height: 100vh;
    padding: 0 30rpx 64rpx;
    background: var(--theme-bg);
    color: var(--theme-text);
    box-sizing: border-box;
  }
  .animal-hero {
    height: 430rpx;
    margin: 0 -30rpx;
    background: var(--theme-surface-2);
  }
  .hero-image {
    width: 100%;
    height: 100%;
    display: block;
  }
  .hero-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--theme-text-tertiary);
    font-size: 24rpx;
  }
  .animal-title-block {
    padding: 28rpx 2rpx 26rpx;
  }
  .animal-title {
    display: block;
    color: var(--theme-text);
    font-size: 42rpx;
    font-weight: 700;
    line-height: 1.2;
  }
  .animal-en {
    display: block;
    margin-top: 8rpx;
    color: var(--theme-text-secondary);
    font-size: 25rpx;
  }
  .scientific-name {
    display: block;
    margin-top: 6rpx;
    color: var(--theme-text-tertiary);
    font-size: 22rpx;
    font-style: italic;
  }
  .meta-row {
    display: flex;
    gap: 20rpx;
    margin-top: 20rpx;
    color: var(--theme-brand);
    font-size: 22rpx;
  }
  .description {
    display: block;
    margin-top: 22rpx;
    color: var(--theme-text-secondary);
    font-size: 25rpx;
    line-height: 1.7;
  }
  .category-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10rpx;
    margin-top: 18rpx;
  }
  .category-tag,
  .sound-tag {
    padding: 7rpx 14rpx;
    border-radius: 999rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text-secondary);
    font-size: 20rpx;
  }
  .call-disclaimer {
    display: flex;
    flex-direction: column;
    gap: 6rpx;
    margin: 0 0 18rpx;
    padding: 16rpx 18rpx;
    border-radius: 14rpx;
    background: var(--theme-surface-2);
  }
  .disclaimer-title {
    color: var(--theme-text-secondary);
    font-size: 20rpx;
    font-weight: 600;
  }
  .disclaimer-copy {
    color: var(--theme-text-secondary);
    font-size: 20rpx;
    line-height: 1.55;
  }
  .cover-credit {
    display: flex;
    flex-direction: column;
    gap: 7rpx;
    padding: 18rpx 20rpx;
    border-radius: 16rpx;
    background: var(--theme-surface);
  }
  .credit-label,
  .license-title {
    color: var(--theme-text);
    font-size: 21rpx;
    font-weight: 650;
  }
  .credit-copy,
  .license-copy {
    color: var(--theme-text-secondary);
    font-size: 19rpx;
    line-height: 1.5;
    word-break: break-word;
  }
  .credit-link,
  .license-link {
    display: flex;
    align-items: center;
    min-height: 88rpx;
    margin-top: 6rpx;
    color: var(--theme-brand);
    font-size: 20rpx;
  }
  .sounds-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 38rpx 0 18rpx;
  }
  .section-title {
    display: block;
    font-size: 31rpx;
    font-weight: 650;
  }
  .section-note {
    display: block;
    margin-top: 6rpx;
    color: var(--theme-text-tertiary);
    font-size: 20rpx;
  }
  .filter-row {
    display: flex;
    gap: 10rpx;
    margin-bottom: 18rpx;
  }
  .filter-picker {
    min-height: 88rpx;
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 0 14rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 14rpx;
    background: var(--theme-surface);
    color: var(--theme-text-secondary);
    font-size: 20rpx;
    white-space: nowrap;
  }
  .filter-picker text {
    color: var(--theme-text-tertiary);
  }
  .sound-groups {
    display: flex;
    flex-direction: column;
    gap: 28rpx;
  }
  .sound-group {
    display: flex;
    flex-direction: column;
    gap: 14rpx;
  }
  .sound-group-heading {
    display: flex;
    align-items: baseline;
    gap: 10rpx;
    padding: 0 4rpx;
  }
  .sound-group-title {
    color: var(--theme-text);
    font-size: 27rpx;
    font-weight: 650;
  }
  .sound-group-subtitle,
  .sound-group-count {
    color: var(--theme-text-tertiary);
    font-size: 20rpx;
  }
  .sound-group-count {
    margin-left: auto;
  }
  .sound-list {
    display: flex;
    flex-direction: column;
    gap: 18rpx;
  }
  .sound-card {
    padding: 22rpx;
    border-radius: 20rpx;
    background: var(--theme-surface);
    box-shadow: 0 3rpx 14rpx var(--theme-shadow-xs);
  }
  .sound-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16rpx;
  }
  .sound-main {
    min-width: 0;
    display: flex;
    flex-direction: column;
  }
  .sound-title {
    color: var(--theme-text);
    font-size: 27rpx;
    font-weight: 650;
    line-height: 1.4;
  }
  .sound-en {
    margin-top: 4rpx;
    color: var(--theme-text-secondary);
    font-size: 20rpx;
  }
  .sound-type {
    margin-top: 10rpx;
    color: var(--theme-brand);
    font-size: 20rpx;
  }
  .sound-play {
    flex-shrink: 0;
    width: 88rpx;
    height: 88rpx;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: var(--theme-brand);
    color: var(--theme-surface);
    font-size: 25rpx;
    line-height: 88rpx;
  }
  .sound-description {
    display: block;
    margin-top: 16rpx;
    color: var(--theme-text-secondary);
    font-size: 22rpx;
    line-height: 1.6;
  }
  .tag-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8rpx;
    margin-top: 15rpx;
  }
  .context-tag {
    background: var(--theme-surface);
    border: 1rpx solid var(--theme-border);
  }
  .sound-meta {
    display: flex;
    gap: 16rpx;
    margin-top: 16rpx;
    color: var(--theme-text-tertiary);
    font-size: 20rpx;
  }
  .sound-progress {
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
  .sound-progress-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10rpx;
  }
  .sound-stop {
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
  .license-toggle {
    min-height: 88rpx;
    margin-top: 18rpx;
    padding: 0 16rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 14rpx;
    background: var(--theme-surface);
    color: var(--theme-text-secondary);
    font-size: 21rpx;
    line-height: 86rpx;
  }
  .license-panel {
    display: flex;
    flex-direction: column;
    gap: 7rpx;
    margin-top: 18rpx;
    padding: 16rpx;
    border-radius: 14rpx;
    background: var(--theme-surface-2);
  }
  .source-error {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8rpx;
  }
  .source-retry {
    min-width: 88rpx;
    min-height: 88rpx;
    padding: 0 16rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 999rpx;
    background: var(--theme-surface);
    color: var(--theme-text);
    font-size: 20rpx;
  }
  .state-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 60rpx 32rpx;
    border-radius: 20rpx;
    background: var(--theme-surface);
    text-align: center;
  }
  .state-title {
    color: var(--theme-text);
    font-size: 28rpx;
    font-weight: 650;
  }
  .state-copy {
    margin-top: 12rpx;
    color: var(--theme-text-secondary);
    font-size: 22rpx;
    line-height: 1.6;
  }
  .primary-button,
  .small-retry {
    min-height: 88rpx;
    margin-top: 20rpx;
    padding: 0 24rpx;
    border: 0;
    border-radius: 999rpx;
    background: var(--theme-brand);
    color: var(--theme-surface);
    font-size: 22rpx;
    line-height: 86rpx;
  }
  .small-state {
    padding: 38rpx;
  }
  .inline-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24rpx;
    color: var(--theme-danger);
    font-size: 22rpx;
  }
  .small-retry {
    min-height: 88rpx;
    line-height: 86rpx;
  }
  .detail-skeleton {
    padding-top: 22rpx;
  }
  .hero-skeleton {
    height: 430rpx;
    border-radius: 20rpx;
    background: var(--theme-surface-2);
  }
  .line-skeleton {
    width: 68%;
    height: 26rpx;
    margin-top: 24rpx;
    border-radius: 999rpx;
    background: var(--theme-surface-2);
  }
  .line-skeleton.short {
    width: 42%;
    height: 20rpx;
    margin-top: 16rpx;
  }
  .sound-loading {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
  }
  .sound-skeleton {
    height: 220rpx;
    border-radius: 20rpx;
    background: var(--theme-surface);
  }
  .load-more-button {
    display: block;
    min-width: 200rpx;
    min-height: 88rpx;
    margin: 12rpx auto;
    padding: 0 24rpx;
    border: 1rpx solid var(--theme-border);
    border-radius: 999rpx;
    background: var(--theme-surface);
    color: var(--theme-text-secondary);
    font-size: 22rpx;
    line-height: 86rpx;
    text-align: center;
  }
  .load-more {
    display: block;
    padding: 28rpx;
    color: var(--theme-text-tertiary);
    font-size: 21rpx;
    text-align: center;
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
