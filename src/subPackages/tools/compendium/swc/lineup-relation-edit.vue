<template>
  <PageLayout :title="pageTitle" nav-init-bg-color="var(--theme-surface)" nav-divider>
    <view class="relation-edit-page">
      <LineupRelationEditor
        v-if="ready"
        :mode="mode"
        :defense="defense"
        :offense="offense"
        :description="description"
        :saving="saving"
        @update:description="description = $event"
        @choose-defense="openLineupPicker('defense')"
        @choose-offense="openLineupPicker('offense')"
        @cancel="handleCancel"
        @save="saveRelation" />
    </view>
  </PageLayout>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { onLoad, onShow, onUnload } from '@dcloudio/uni-app'
  import LineupRelationEditor from './components/lineup-relation-editor.vue'
  import type { LineupOption } from './lineup-types'
  import {
    RELATION_EDIT_PICKER_CONTEXT_KEY,
    RELATION_EDIT_PICKER_RESULT_KEY,
    RELATION_EDIT_PREFILL_KEY,
    RELATION_EDIT_RESULT_KEY,
    type RelationEditMode,
    type RelationEditPrefill,
    type RelationEditResult,
    type RelationSide,
  } from './lineup-relation-edit-context'
  import {
    patchCompendiumsLineupRelationsRelationId,
    postCompendiumsLineupRelations,
  } from '@/services/apifox/NODEJSDEMO/COMPENDIUMLINEUPS/apifox'
  import type {
    patchCompendiumsLineupRelationsRelationIdBody,
    postCompendiumsLineupRelationsBody,
  } from '@/services/apifox/NODEJSDEMO/COMPENDIUMLINEUPS/interface'
  import { ensureLoginAccess } from '@/utils/admin'
  import { getStorageSync, getUserInfo, removeStorageSync, setStorageSync } from '@/utils/storage'

  const COMPENDIUM_CODE = 'swc'
  const DEFAULT_LOCALE = 'zh-CN'

  const mode = ref<RelationEditMode>('create')
  const relationId = ref('')
  const selectedLocale = ref(DEFAULT_LOCALE)
  const prefillKey = ref(RELATION_EDIT_PREFILL_KEY)
  const defense = ref<LineupOption | null>(null)
  const offense = ref<LineupOption | null>(null)
  const description = ref('')
  const relationCreatedBy = ref<string | null>(null)
  const relationSource = ref('')
  const relationCanEdit = ref(false)
  const saving = ref(false)
  const ready = ref(false)

  const pageTitle = computed(() => (mode.value === 'edit' ? '编辑克制' : '新增克制'))

  const decodeOption = (value?: string): string => {
    if (!value) return ''
    try {
      return decodeURIComponent(value)
    } catch {
      return value
    }
  }

  const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value)

  const isLineupOption = (value: unknown): value is LineupOption =>
    isRecord(value) && typeof value.id === 'string' && Array.isArray(value.characters)

  const readPrefill = (): RelationEditPrefill | null => {
    const value = getStorageSync(prefillKey.value)
    removeStorageSync(prefillKey.value)
    if (!isRecord(value)) return null
    return {
      mode: value.mode === 'edit' ? 'edit' : 'create',
      relationId: typeof value.relationId === 'string' ? value.relationId : undefined,
      defense: isLineupOption(value.defense) ? value.defense : null,
      offense: isLineupOption(value.offense) ? value.offense : null,
      description: typeof value.description === 'string' ? value.description : '',
      relationCreatedBy: typeof value.relationCreatedBy === 'string' ? value.relationCreatedBy : null,
      relationSource: typeof value.relationSource === 'string' ? value.relationSource : '',
      relationCanEdit: value.relationCanEdit === true,
    }
  }

  const buildCurrentUrl = (): string => {
    const params = [
      `mode=${encodeURIComponent(mode.value)}`,
      `locale=${encodeURIComponent(selectedLocale.value)}`,
      `prefillKey=${encodeURIComponent(prefillKey.value)}`,
    ]
    if (relationId.value) params.push(`relationId=${encodeURIComponent(relationId.value)}`)
    return `/subPackages/tools/compendium/swc/lineup-relation-edit?${params.join('&')}`
  }

  const clearPickerState = () => {
    removeStorageSync(RELATION_EDIT_PICKER_CONTEXT_KEY)
    removeStorageSync(RELATION_EDIT_PICKER_RESULT_KEY)
  }

  const rejectInvalidEdit = () => {
    uni.showToast({ title: '关系信息已失效，请重新进入', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 600)
  }

  const canEditCurrentRelation = (): boolean => {
    const currentUserId = getUserInfo()?.id
    return Boolean(
      relationId.value &&
      currentUserId &&
      relationSource.value === 'user' &&
      relationCanEdit.value &&
      relationCreatedBy.value === currentUserId,
    )
  }

  const openLineupPicker = (side: RelationSide) => {
    if (saving.value) return
    setStorageSync(RELATION_EDIT_PICKER_CONTEXT_KEY, { side })
    removeStorageSync(RELATION_EDIT_PICKER_RESULT_KEY)
    const selected = side === 'defense' ? defense.value : offense.value
    const params = [
      `compendiumId=${encodeURIComponent(COMPENDIUM_CODE)}`,
      `locale=${encodeURIComponent(selectedLocale.value)}`,
      'mode=relation',
      `relationSide=${encodeURIComponent(side)}`,
      `requiredType=${encodeURIComponent(side === 'defense' ? '占领战防守' : '占领战进攻')}`,
      `returnKey=${encodeURIComponent(RELATION_EDIT_PICKER_RESULT_KEY)}`,
    ]
    if (selected?.id) params.push(`selectedId=${encodeURIComponent(selected.id)}`)
    uni.navigateTo({ url: `/subPackages/tools/compendium/swc/lineup-picker?${params.join('&')}` })
  }

  const readPickerResult = () => {
    const value = getStorageSync(RELATION_EDIT_PICKER_RESULT_KEY)
    if (!isRecord(value)) return
    const lineup = isLineupOption(value.lineup) ? value.lineup : isLineupOption(value.selectedLineup) ? value.selectedLineup : null
    if (!lineup) return
    const context = getStorageSync(RELATION_EDIT_PICKER_CONTEXT_KEY)
    const contextSide = isRecord(context) && (context.side === 'defense' || context.side === 'offense') ? context.side : null
    const side = value.side === 'defense' || value.side === 'offense' ? value.side : contextSide
    if (side === 'defense') defense.value = lineup
    if (side === 'offense') offense.value = lineup
    clearPickerState()
  }

  const resolveMutationError = (error: unknown, fallback: string): string => {
    if (typeof error === 'string') return error
    if (!isRecord(error)) return fallback
    const code = typeof error.code === 'number' ? error.code : typeof error.statusCode === 'number' ? error.statusCode : 0
    if (code === 409) return '该克制关系已存在'
    return typeof error.message === 'string' ? error.message : fallback
  }

  const saveRelation = async () => {
    if (!defense.value || !offense.value || saving.value) return
    if (!ensureLoginAccess(buildCurrentUrl())) return
    if (mode.value === 'edit' && !canEditCurrentRelation()) {
      uni.showToast({ title: '只能编辑自己创建的克制关系', icon: 'none' })
      return
    }

    saving.value = true
    try {
      const note = description.value.trim()
      if (mode.value === 'edit') {
        const body: patchCompendiumsLineupRelationsRelationIdBody = {
          sourceLineupId: defense.value.id,
          targetLineupId: offense.value.id,
          description: note,
        }
        await patchCompendiumsLineupRelationsRelationId(relationId.value, body)
      } else {
        const body: postCompendiumsLineupRelationsBody = {
          compendiumId: COMPENDIUM_CODE,
          sourceLineupId: defense.value.id,
          targetLineupId: offense.value.id,
          description: note,
        }
        await postCompendiumsLineupRelations(body)
      }
      const result: RelationEditResult = { changed: true, action: mode.value }
      setStorageSync(RELATION_EDIT_RESULT_KEY, result)
      uni.showToast({ title: mode.value === 'edit' ? '修改成功' : '新增成功', icon: 'success' })
      uni.navigateBack()
    } catch (error) {
      uni.showToast({
        title: resolveMutationError(error, mode.value === 'edit' ? '修改失败，请稍后重试' : '新增失败，请稍后重试'),
        icon: 'none',
      })
    } finally {
      saving.value = false
    }
  }

  const handleCancel = () => {
    if (saving.value) return
    uni.navigateBack()
  }

  onLoad((options: Record<string, string | undefined>) => {
    mode.value = decodeOption(options.mode) === 'edit' ? 'edit' : 'create'
    relationId.value = decodeOption(options.relationId)
    selectedLocale.value = decodeOption(options.locale) || DEFAULT_LOCALE
    prefillKey.value = decodeOption(options.prefillKey) || RELATION_EDIT_PREFILL_KEY
    if (!ensureLoginAccess(buildCurrentUrl())) return

    const prefill = readPrefill()
    if (prefill) {
      defense.value = prefill.defense || null
      offense.value = prefill.offense || null
      description.value = prefill.description || ''
      relationCreatedBy.value = prefill.relationCreatedBy || null
      relationSource.value = prefill.relationSource || ''
      relationCanEdit.value = prefill.relationCanEdit === true
    }

    if (mode.value === 'edit' && (!prefill || !defense.value || !offense.value || !canEditCurrentRelation())) {
      rejectInvalidEdit()
      return
    }
    clearPickerState()
    ready.value = true
  })

  onShow(readPickerResult)

  onUnload(() => {
    clearPickerState()
    removeStorageSync(prefillKey.value)
  })
</script>

<style scoped lang="scss">
  .relation-edit-page {
    min-height: 100vh;
    padding: 1rpx 0 calc(64rpx + env(safe-area-inset-bottom));
    box-sizing: border-box;
    background: var(--theme-bg);
    color: var(--theme-text);
  }
</style>
