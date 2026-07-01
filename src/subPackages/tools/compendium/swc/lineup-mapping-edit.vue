<template>
  <view class="mapping-edit-page">
    <view class="hero-card">
      <text class="hero-title">{{ isEdit ? '编辑阵容映射' : '创建阵容映射' }}</text>
      <text class="hero-subtitle"> 源容器与目标容器可分别放入任意用户创建的阵容；容器内阵容支持独立的点赞/点踩。 </text>
    </view>

    <StateBlock v-if="pageLoading" class="state-block" text="加载映射中..." />

    <StateBlock
      v-else-if="errorMessage"
      class="state-block"
      :text="errorMessage"
      action-text="重新加载"
      theme="teal"
      @action="loadInitialData" />

    <view v-else class="content">
      <view class="section-card">
        <text class="field-label">映射描述</text>
        <textarea
          v-model="description"
          class="desc-input"
          placeholder="例如：防守阵容 → 进攻反制（最长 500 字）"
          maxlength="500"
          auto-height />
      </view>

      <LineupPickerPanel
        v-model:keyword="sourceKeyword"
        title="源容器阵容"
        :tip="`已选 ${sourceSelected.length} 个`"
        :options="sourceOptions"
        :selected-ids="sourceSelectedIds"
        :selected-items="sourceSelectedAsOptions"
        selection-mode="multiple"
        selected-action-text="移除"
        selected-empty-text="源容器暂未选择阵容"
        search-placeholder="搜索要加入源容器的阵容"
        loading-text="加载阵容中..."
        empty-text="暂无阵容可选"
        :loading="sourceLoading"
        @search="searchSourceOptions"
        @toggle="toggleSource"
        @remove="removeSource" />

      <LineupPickerPanel
        v-model:keyword="targetKeyword"
        title="目标容器阵容"
        :tip="`已选 ${targetSelected.length} 个`"
        :options="targetOptions"
        :selected-ids="targetSelectedIds"
        :selected-items="targetSelectedAsOptions"
        selection-mode="multiple"
        selected-action-text="移除"
        selected-empty-text="目标容器暂未选择阵容"
        search-placeholder="搜索要加入目标容器的阵容"
        loading-text="加载阵容中..."
        empty-text="暂无阵容可选"
        :loading="targetLoading"
        @search="searchTargetOptions"
        @toggle="toggleTarget"
        @remove="removeTarget" />
    </view>

    <StickyActionBar>
      <button class="submit-btn" :loading="saving" :disabled="saving || !canSubmit" @click="submit">
        {{ isEdit ? '保存修改' : '创建映射' }}
      </button>
    </StickyActionBar>
  </view>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { onLoad } from '@dcloudio/uni-app'
  import LineupPickerPanel from './components/lineup-picker-panel.vue'
  import StateBlock from './components/state-block.vue'
  import StickyActionBar from './components/sticky-action-bar.vue'
  import {
    createLineupMapping,
    fetchLineupMappingDetail,
    fetchUserLineups,
    updateLineupMapping,
    type LineupMappingContainerChange,
    type LineupOption,
    type UpdateLineupMappingBody,
    type UserLineupSummary,
  } from '@/services/compendium-lineups'
  import { ensureLoginAccess } from '@/utils/admin'

  const COMPENDIUM_CODE = 'swc'
  const DEFAULT_LOCALE = 'zh-CN'

  interface SelectedLineup {
    lineupId: string
    name: string
    type: string
    description: string
  }

  const selectedLocale = ref(DEFAULT_LOCALE)
  const mappingId = ref('')
  const isEdit = computed(() => !!mappingId.value)

  const pageLoading = ref(false)
  const saving = ref(false)
  const errorMessage = ref('')

  const description = ref('')
  const sourceKeyword = ref('')
  const targetKeyword = ref('')
  const sourceLoading = ref(false)
  const targetLoading = ref(false)
  const sourceOptions = ref<LineupOption[]>([])
  const targetOptions = ref<LineupOption[]>([])

  const sourceSelected = ref<SelectedLineup[]>([])
  const targetSelected = ref<SelectedLineup[]>([])

  // 编辑模式下用于计算差异
  const originalSourceIds = ref<string[]>([])
  const originalTargetIds = ref<string[]>([])
  const sourceContainerId = ref('')
  const targetContainerId = ref('')
  const originalDescription = ref('')

  const sourceSelectedIds = computed(() => sourceSelected.value.map(item => item.lineupId))
  const targetSelectedIds = computed(() => targetSelected.value.map(item => item.lineupId))

  const toOption = (item: SelectedLineup): LineupOption => ({
    id: item.lineupId,
    name: item.name,
    type: item.type,
    description: item.description,
    status: '',
    memberCount: 0,
    targetLineupsCount: 0,
    sourceLineupsCount: 0,
    characters: [],
  })
  const sourceSelectedAsOptions = computed(() => sourceSelected.value.map(toOption))
  const targetSelectedAsOptions = computed(() => targetSelected.value.map(toOption))

  const canSubmit = computed(() => {
    if (isEdit.value) return true
    return sourceSelected.value.length > 0 || targetSelected.value.length > 0
  })

  const buildCurrentUrl = (): string => {
    const params = [`compendiumId=${encodeURIComponent(COMPENDIUM_CODE)}`, `locale=${encodeURIComponent(selectedLocale.value)}`]
    if (mappingId.value) params.push(`mappingId=${encodeURIComponent(mappingId.value)}`)
    return `/subPackages/tools/compendium/swc/lineup-mapping-edit?${params.join('&')}`
  }

  const toSelected = (lineup: UserLineupSummary | LineupOption): SelectedLineup => ({
    lineupId: lineup.id,
    name: lineup.name,
    type: lineup.type,
    description: lineup.description,
  })

  const fetchOptions = async (keyword: string): Promise<LineupOption[]> => {
    const result = await fetchUserLineups({
      compendiumId: COMPENDIUM_CODE,
      locale: selectedLocale.value,
      keyword: keyword.trim() || undefined,
      status: 'enabled',
      page: 1,
      pageSize: 20,
    })
    return result.items
  }

  const searchSourceOptions = async () => {
    sourceLoading.value = true
    try {
      sourceOptions.value = await fetchOptions(sourceKeyword.value)
    } catch (error) {
      uni.showToast({ title: typeof error === 'string' ? error : '加载阵容失败', icon: 'none' })
    } finally {
      sourceLoading.value = false
    }
  }

  const searchTargetOptions = async () => {
    targetLoading.value = true
    try {
      targetOptions.value = await fetchOptions(targetKeyword.value)
    } catch (error) {
      uni.showToast({ title: typeof error === 'string' ? error : '加载阵容失败', icon: 'none' })
    } finally {
      targetLoading.value = false
    }
  }

  const toggleSource = (option: LineupOption) => {
    if (sourceSelectedIds.value.includes(option.id)) {
      removeSource(option.id)
      return
    }
    sourceSelected.value = [...sourceSelected.value, toSelected(option)]
  }

  const removeSource = (lineupId: string) => {
    sourceSelected.value = sourceSelected.value.filter(item => item.lineupId !== lineupId)
  }

  const toggleTarget = (option: LineupOption) => {
    if (targetSelectedIds.value.includes(option.id)) {
      removeTarget(option.id)
      return
    }
    targetSelected.value = [...targetSelected.value, toSelected(option)]
  }

  const removeTarget = (lineupId: string) => {
    targetSelected.value = targetSelected.value.filter(item => item.lineupId !== lineupId)
  }

  const loadMappingDetail = async () => {
    const mapping = await fetchLineupMappingDetail(mappingId.value)
    description.value = mapping.description
    originalDescription.value = mapping.description
    sourceContainerId.value = mapping.sourceContainer.containerId
    targetContainerId.value = mapping.targetContainer.containerId

    sourceSelected.value = mapping.sourceContainer.items.map(item => ({
      lineupId: item.lineupId,
      name: item.lineup?.name || '未命名阵容',
      type: item.lineup?.type || '',
      description: '',
    }))
    targetSelected.value = mapping.targetContainer.items.map(item => ({
      lineupId: item.lineupId,
      name: item.lineup?.name || '未命名阵容',
      type: item.lineup?.type || '',
      description: '',
    }))
    originalSourceIds.value = sourceSelectedIds.value
    originalTargetIds.value = targetSelectedIds.value
  }

  const loadInitialData = async () => {
    pageLoading.value = true
    errorMessage.value = ''
    try {
      await Promise.all([searchSourceOptions(), searchTargetOptions()])
      if (isEdit.value) await loadMappingDetail()
    } catch (error) {
      errorMessage.value = typeof error === 'string' ? error : '加载失败，请稍后重试'
    } finally {
      pageLoading.value = false
    }
  }

  const resolveError = (error: unknown, fallback: string): string => {
    const status = (error as { code?: number; statusCode?: number })?.code ?? (error as { statusCode?: number })?.statusCode
    if (status === 403) return '仅创建者或管理员可编辑该映射'
    if (status === 404) return '映射不存在或已删除'
    return typeof error === 'string' ? error : fallback
  }

  const buildUpdatePayload = (): UpdateLineupMappingBody => {
    const payload: UpdateLineupMappingBody = {}
    if (description.value.trim() !== originalDescription.value.trim()) {
      payload.description = description.value.trim()
    }

    const add: LineupMappingContainerChange[] = []
    const remove: LineupMappingContainerChange[] = []

    const diff = (containerId: string, original: string[], current: string[]) => {
      const added = current.filter(id => !original.includes(id))
      const removed = original.filter(id => !current.includes(id))
      if (added.length) add.push({ containerId, lineupIds: added })
      if (removed.length) remove.push({ containerId, lineupIds: removed })
    }

    diff(sourceContainerId.value, originalSourceIds.value, sourceSelectedIds.value)
    diff(targetContainerId.value, originalTargetIds.value, targetSelectedIds.value)

    if (add.length) payload.add = add
    if (remove.length) payload.remove = remove
    return payload
  }

  const submit = async () => {
    if (saving.value || !canSubmit.value) return
    if (!ensureLoginAccess(buildCurrentUrl())) return

    saving.value = true
    try {
      if (isEdit.value) {
        const payload = buildUpdatePayload()
        if (!payload.description && !payload.add && !payload.remove) {
          uni.showToast({ title: '未检测到修改', icon: 'none' })
          return
        }
        await updateLineupMapping(mappingId.value, payload)
      } else {
        await createLineupMapping({
          compendiumId: COMPENDIUM_CODE,
          description: description.value.trim() || undefined,
          sourceLineupIds: sourceSelectedIds.value,
          targetLineupIds: targetSelectedIds.value,
        })
      }
      uni.showToast({ title: isEdit.value ? '保存成功' : '创建成功', icon: 'success' })
      setTimeout(() => uni.navigateBack(), 600)
    } catch (error) {
      uni.showToast({ title: resolveError(error, '保存失败，请稍后重试'), icon: 'none' })
    } finally {
      saving.value = false
    }
  }

  onLoad((options: Record<string, string | undefined>) => {
    selectedLocale.value = options.locale || DEFAULT_LOCALE
    mappingId.value = options.mappingId || ''

    if (!ensureLoginAccess(buildCurrentUrl())) return

    uni.setNavigationBarTitle({ title: isEdit.value ? '编辑阵容映射' : '创建阵容映射' })
    loadInitialData()
  })
</script>

<style scoped lang="scss">
  .mapping-edit-page {
    min-height: 100vh;
    background: #f6f7fb;
    padding-bottom: 180rpx;
  }

  .hero-card,
  .section-card,
  .state-block {
    margin: 24rpx;
    border-radius: 24rpx;
    background: #fff;
    box-shadow: 0 10rpx 30rpx rgba(15, 23, 42, 0.06);
  }

  .hero-card {
    padding: 28rpx;
    background: linear-gradient(135deg, #134e4a 0%, #14b8a6 100%);
    color: #fff;
  }

  .hero-title {
    display: block;
    font-size: 36rpx;
    font-weight: 800;
  }

  .hero-subtitle {
    display: block;
    margin-top: 10rpx;
    color: rgba(255, 255, 255, 0.8);
    font-size: 24rpx;
    line-height: 1.7;
  }

  .section-card {
    padding: 24rpx;
  }

  .field-label {
    display: block;
    margin-bottom: 14rpx;
    color: #667085;
    font-size: 24rpx;
    font-weight: 700;
  }

  .desc-input {
    width: 100%;
    min-height: 120rpx;
    padding: 20rpx;
    border-radius: 18rpx;
    background: #f8fafc;
    font-size: 26rpx;
    color: #172033;
    line-height: 1.6;
    box-sizing: border-box;
  }

  .state-block {
    padding: 48rpx 28rpx;
    text-align: center;
    color: #667085;
    font-size: 28rpx;
  }

  .submit-btn {
    width: 100%;
    border-radius: 999rpx;
    font-size: 28rpx;
    font-weight: 700;
    background: #0f766e;
    color: #fff;
  }
</style>
