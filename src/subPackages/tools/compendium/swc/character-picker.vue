<template>
  <view class="character-picker-page">
    <view class="page-body">
      <CharacterPickerPanel
        ref="pickerPanelRef"
        v-model="selectedCharacters"
        :compendium-id="compendiumId"
        :locale="selectedLocale"
        selection-mode="multiple"
        :max-count="5"
        selected-title="已选筛选魔灵"
        search-title="选择筛选魔灵"
        search-tip="支持多选，只展示同时包含这些魔灵的阵容"
        search-placeholder="输入人物名称或 code"
        empty-selected-text="还没有选中筛选人物。"
        empty-search-text="暂无可选人物"
        confirm-text="应用筛选"
        cancel-text="取消"
        @cancel="handleCancel"
        @confirm="handleConfirm" />
    </view>
  </view>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { onLoad, onReachBottom } from '@dcloudio/uni-app'
  import CharacterPickerPanel from './components/character-picker-panel.vue'
  import type { CharacterOption } from '@/services/compendium-lineups'
  import { getStorageSync, setStorageSync } from '@/utils/storage'

  const DEFAULT_LOCALE = 'zh-CN'
  const DEFAULT_COMPENDIUM_ID = 'swc'

  const compendiumId = ref(DEFAULT_COMPENDIUM_ID)
  const selectedLocale = ref(DEFAULT_LOCALE)
  const selectedCharacters = ref<CharacterOption[]>([])
  const pickerPanelRef = ref<InstanceType<typeof CharacterPickerPanel> | null>(null)
  const cacheKey = ref('compendium:swc:lineups:character-picker:draft')
  const resultKey = ref('compendium:swc:lineups:character-picker:result')

  const handleCancel = () => {
    uni.navigateBack()
  }

  const handleConfirm = (selection: CharacterOption[]) => {
    setStorageSync(
      resultKey.value,
      selection.map(item => ({ ...item })),
    )
    uni.navigateBack()
  }

  onLoad((options: Record<string, string | undefined>) => {
    compendiumId.value = options.compendiumId || DEFAULT_COMPENDIUM_ID
    selectedLocale.value = options.locale || DEFAULT_LOCALE
    cacheKey.value = options.cacheKey ? decodeURIComponent(options.cacheKey) : 'compendium:swc:lineups:character-picker:draft'
    resultKey.value = options.resultKey ? decodeURIComponent(options.resultKey) : 'compendium:swc:lineups:character-picker:result'
    uni.setNavigationBarTitle({ title: '选择筛选魔灵' })

    const cached = getStorageSync(cacheKey.value)
    if (Array.isArray(cached) && cached.length) {
      selectedCharacters.value = cached.map(item => ({ ...item }))
      return
    }

    const selectedCharacterIds = (options.selectedCharacterIds || '')
      .split(',')
      .map(item => item.trim())
      .filter(Boolean)

    selectedCharacters.value = selectedCharacterIds.map(characterId => ({
      id: characterId,
      characterId,
      name: '',
      label: characterId,
      avatar: '',
      element: '',
      elementKey: '',
      elementName: '',
      archetype: '',
      familyKey: '',
      familyName: '',
      awaken: '',
      awakenName: '',
      stars: '',
      status: 'enabled',
    }))
  })

  onReachBottom(() => {
    pickerPanelRef.value?.loadMoreCharacterOptions?.()
  })
</script>

<style scoped lang="scss">
  .character-picker-page {
    height: 100vh;
    background: #f6f7fb;
    overflow: hidden;
  }

  .page-body {
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
</style>
