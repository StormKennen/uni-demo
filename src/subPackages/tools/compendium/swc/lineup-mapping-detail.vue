<template>
  <view class="mapping-detail-page">
    <StateBlock v-if="loading && !mapping" class="state-block" text="加载映射详情中..." />

    <StateBlock
      v-else-if="errorMessage && !mapping"
      class="state-block"
      :text="errorMessage"
      action-text="重新加载"
      theme="teal"
      @action="loadDetail" />

    <template v-else-if="mapping">
      <view class="hero-card">
        <view class="hero-main">
          <text class="hero-title">{{ mapping.name || '未命名映射' }}</text>
          <text class="hero-desc">{{ mapping.description || '暂无描述' }}</text>
        </view>
        <button v-if="mapping.canEdit" class="edit-btn" size="mini" @click="openEdit">编辑</button>
      </view>

      <ContainerSection
        title="源容器阵容"
        :container="mapping.sourceContainer"
        :can-edit="mapping.canEdit"
        :character-map="characterMap"
        :reacting-id="reactingItemId"
        :removing-id="removingItemId"
        @add="openPicker('source')"
        @react="handleReact"
        @remove="handleRemove" />

      <ContainerSection
        title="目标容器阵容"
        :container="mapping.targetContainer"
        :can-edit="mapping.canEdit"
        :character-map="characterMap"
        :reacting-id="reactingItemId"
        :removing-id="removingItemId"
        @add="openPicker('target')"
        @react="handleReact"
        @remove="handleRemove" />
    </template>

    <view v-if="editVisible" class="modal-mask" @click="closeEdit">
      <view class="edit-panel" @click.stop>
        <text class="edit-title">编辑阵容映射</text>

        <text class="field-label">映射名称</text>
        <input v-model="editName" class="name-input" placeholder="请输入映射名称" maxlength="60" />

        <text class="field-label">映射描述</text>
        <textarea v-model="editDescription" class="desc-input" placeholder="最长 500 字，可选" maxlength="500" auto-height />

        <view class="edit-actions">
          <button class="footer-btn ghost" size="mini" @click="closeEdit">取消</button>
          <button class="footer-btn primary" size="mini" :loading="saving" :disabled="!editName.trim()" @click="submitEdit">保存</button>
        </view>
      </view>
    </view>

    <LineupSelectModal
      v-model:visible="pickerVisible"
      :compendium-id="COMPENDIUM_CODE"
      :locale="selectedLocale"
      :title="pickerTarget === 'source' ? '添加到源容器' : '添加到目标容器'"
      :exclude-ids="pickerExcludeIds"
      @confirm="handlePickerConfirm" />
  </view>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { onLoad } from '@dcloudio/uni-app'
  import StateBlock from './components/state-block.vue'
  import LineupSelectModal from './components/lineup-select-modal.vue'
  import ContainerSection from './components/lineup-mapping-container-section.vue'
  import {
    fetchLineupMappingDetail,
    fetchUserLineupDetail,
    reactToContainerLineup,
    updateLineupMapping,
    type ContainerKind,
    type LineupCharacterPreview,
    type LineupMapping,
    type LineupMappingContainer,
    type ReactionValue,
    type UserLineupSummary,
  } from '@/services/compendium-lineups'
  import { ensureLoginAccess } from '@/utils/admin'

  const COMPENDIUM_CODE = 'swc'
  const DEFAULT_LOCALE = 'zh-CN'

  const mappingId = ref('')
  const selectedLocale = ref(DEFAULT_LOCALE)

  const mapping = ref<LineupMapping | null>(null)
  const characterMap = ref<Record<string, LineupCharacterPreview[]>>({})
  const loading = ref(false)
  const errorMessage = ref('')

  const editVisible = ref(false)
  const editName = ref('')
  const editDescription = ref('')
  const saving = ref(false)

  const pickerVisible = ref(false)
  const pickerTarget = ref<ContainerKind>('source')
  const pickerExcludeIds = ref<string[]>([])

  const reactingItemId = ref('')
  const removingItemId = ref('')

  const buildCurrentUrl = (): string =>
    `/subPackages/tools/compendium/swc/lineup-mapping-detail?mappingId=${encodeURIComponent(mappingId.value)}&compendiumId=${encodeURIComponent(COMPENDIUM_CODE)}&locale=${encodeURIComponent(selectedLocale.value)}`

  const containerByKind = (kind: ContainerKind): LineupMappingContainer | null => {
    if (!mapping.value) return null
    return kind === 'source' ? mapping.value.sourceContainer : mapping.value.targetContainer
  }

  const enrichCharacters = async (current: LineupMapping) => {
    const ids = new Set<string>()
    current.sourceContainer.items.forEach(item => ids.add(item.lineupId))
    current.targetContainer.items.forEach(item => ids.add(item.lineupId))

    const missing = [...ids].filter(id => id && !characterMap.value[id])
    if (!missing.length) return

    const results = await Promise.allSettled(missing.map(id => fetchUserLineupDetail(id, { locale: selectedLocale.value })))
    const next = { ...characterMap.value }
    results.forEach((result, index) => {
      const id = missing[index]
      next[id] = result.status === 'fulfilled' ? result.value.characters.map(member => member.character) : []
    })
    characterMap.value = next
  }

  const loadDetail = async () => {
    if (loading.value) return
    loading.value = true
    errorMessage.value = ''
    try {
      const detail = await fetchLineupMappingDetail(mappingId.value)
      mapping.value = detail
      await enrichCharacters(detail)
    } catch (error) {
      errorMessage.value = resolveError(error, '加载详情失败，请稍后重试')
    } finally {
      loading.value = false
    }
  }

  const resolveError = (error: unknown, fallback: string): string => {
    const status = (error as { code?: number; statusCode?: number })?.code ?? (error as { statusCode?: number })?.statusCode
    if (status === 403) return '仅创建者或管理员可进行该操作'
    if (status === 404) return '映射不存在或已删除'
    return typeof error === 'string' ? error : fallback
  }

  const openEdit = () => {
    if (!mapping.value) return
    if (!ensureLoginAccess(buildCurrentUrl())) return
    editName.value = mapping.value.name
    editDescription.value = mapping.value.description
    editVisible.value = true
  }

  const closeEdit = () => {
    if (saving.value) return
    editVisible.value = false
  }

  const submitEdit = async () => {
    if (saving.value || !editName.value.trim()) return
    saving.value = true
    try {
      await updateLineupMapping(mappingId.value, {
        name: editName.value.trim(),
        description: editDescription.value.trim(),
      })
      uni.showToast({ title: '保存成功', icon: 'success' })
      editVisible.value = false
      await loadDetail()
    } catch (error) {
      uni.showToast({ title: resolveError(error, '保存失败，请稍后重试'), icon: 'none' })
    } finally {
      saving.value = false
    }
  }

  const openPicker = (kind: ContainerKind) => {
    if (!ensureLoginAccess(buildCurrentUrl())) return
    const container = containerByKind(kind)
    pickerTarget.value = kind
    pickerExcludeIds.value = container ? container.items.map(item => item.lineupId) : []
    pickerVisible.value = true
  }

  const handlePickerConfirm = async (selected: UserLineupSummary[]) => {
    const container = containerByKind(pickerTarget.value)
    if (!container || !selected.length) return
    try {
      await updateLineupMapping(mappingId.value, {
        add: [{ containerId: container.containerId, lineupIds: selected.map(item => item.id) }],
      })
      uni.showToast({ title: '添加成功', icon: 'success' })
      await loadDetail()
    } catch (error) {
      uni.showToast({ title: resolveError(error, '添加失败，请稍后重试'), icon: 'none' })
    }
  }

  const handleRemove = async (payload: { containerId: string; itemId: string; lineupId: string }) => {
    if (removingItemId.value) return
    removingItemId.value = payload.itemId
    try {
      await updateLineupMapping(mappingId.value, {
        remove: [{ containerId: payload.containerId, lineupIds: [payload.lineupId] }],
      })
      uni.showToast({ title: '已移除', icon: 'success' })
      await loadDetail()
    } catch (error) {
      uni.showToast({ title: resolveError(error, '移除失败，请稍后重试'), icon: 'none' })
    } finally {
      removingItemId.value = ''
    }
  }

  const handleReact = async (payload: { containerId: string; itemId: string; lineupId: string; value: ReactionValue }) => {
    if (reactingItemId.value) return
    if (!ensureLoginAccess(buildCurrentUrl())) return
    reactingItemId.value = payload.itemId
    try {
      const result = await reactToContainerLineup(mappingId.value, payload.containerId, payload.lineupId, payload.value)
      if (!mapping.value) return
      const containers = [mapping.value.sourceContainer, mapping.value.targetContainer]
      containers.forEach(container => {
        if (container.containerId !== payload.containerId) return
        const target = container.items.find(item => item.itemId === payload.itemId)
        if (target) {
          target.likeCount = result.likeCount
          target.dislikeCount = result.dislikeCount
          target.score = result.score
          target.myReaction = result.myReaction
        }
      })
    } catch (error) {
      uni.showToast({ title: resolveError(error, '操作失败，请稍后重试'), icon: 'none' })
    } finally {
      reactingItemId.value = ''
    }
  }

  onLoad((options: Record<string, string | undefined>) => {
    mappingId.value = options.mappingId || ''
    selectedLocale.value = options.locale || DEFAULT_LOCALE
    uni.setNavigationBarTitle({ title: '阵容映射详情' })
    if (!mappingId.value) {
      errorMessage.value = '缺少映射标识'
      return
    }
    loadDetail()
  })
</script>

<style scoped lang="scss">
  .mapping-detail-page {
    min-height: 100vh;
    background: #f6f7fb;
    color: #172033;
    padding-bottom: 60rpx;
  }

  .hero-card {
    margin: 24rpx;
    padding: 28rpx;
    border-radius: 28rpx;
    background: linear-gradient(135deg, #134e4a 0%, #0f766e 100%);
    color: #fff;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20rpx;
  }

  .hero-main {
    min-width: 0;
    flex: 1;
  }

  .hero-title {
    display: block;
    font-size: 36rpx;
    font-weight: 800;
  }

  .hero-desc {
    display: block;
    margin-top: 12rpx;
    color: rgba(255, 255, 255, 0.85);
    font-size: 24rpx;
    line-height: 1.6;
  }

  .edit-btn {
    flex-shrink: 0;
    border-radius: 999rpx;
    font-size: 24rpx;
    font-weight: 700;
    background: rgba(255, 255, 255, 0.18);
    color: #fff;
  }

  .state-block {
    margin: 24rpx;
    padding: 48rpx 28rpx;
    text-align: center;
    color: #667085;
    font-size: 28rpx;
    background: #fff;
    border-radius: 24rpx;
  }

  .modal-mask {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    padding: 40rpx;
    box-sizing: border-box;
  }

  .edit-panel {
    width: 100%;
    background: #fff;
    border-radius: 28rpx;
    padding: 32rpx;
    box-sizing: border-box;
  }

  .edit-title {
    display: block;
    font-size: 32rpx;
    font-weight: 800;
    margin-bottom: 20rpx;
  }

  .field-label {
    display: block;
    margin: 16rpx 0 12rpx;
    color: #667085;
    font-size: 24rpx;
    font-weight: 700;
  }

  .name-input,
  .desc-input {
    width: 100%;
    padding: 20rpx;
    border-radius: 18rpx;
    background: #f8fafc;
    font-size: 26rpx;
    color: #172033;
    box-sizing: border-box;
  }

  .desc-input {
    min-height: 140rpx;
    line-height: 1.6;
  }

  .edit-actions {
    margin-top: 28rpx;
    display: flex;
    justify-content: flex-end;
    gap: 16rpx;
  }

  .footer-btn {
    border-radius: 999rpx;
    font-size: 26rpx;
    font-weight: 700;
    padding: 0 32rpx;
  }

  .footer-btn.ghost {
    background: #eef2f7;
    color: #475467;
  }

  .footer-btn.primary {
    background: #0f766e;
    color: #fff;
  }
</style>
