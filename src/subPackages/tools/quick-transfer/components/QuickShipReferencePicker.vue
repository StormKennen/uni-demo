<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { getMemos } from '@/services/apifox/NODEJSDEMO/MEMOS/apifox'
  import type { getMemosQuery } from '@/services/apifox/NODEJSDEMO/MEMOS/interface'
  import { getQuickTransferErrorMessage } from '@/features/quick-transfer/errors'
  import { QUICK_TRANSFER_REFERENCE_SCENES, type QuickTransferReferenceScene } from '@/features/quick-transfer/reference/scenes'
  import type { QuickShipReferenceDraft } from '@/features/quick-transfer/types'

  interface Props {
    visible: boolean
  }

  interface MemoOption {
    id: string
    name: string
    source: 'owned' | 'shared'
  }

  const props = defineProps<Props>()
  const emit = defineEmits<{
    cancel: []
    selected: [reference: QuickShipReferenceDraft]
  }>()

  const selectedScene = ref<QuickTransferReferenceScene>('memo')
  const selectedMemoIndex = ref(-1)
  const memoOptions = ref<MemoOption[]>([])
  const loading = ref(false)
  const errorMessage = ref('')
  let referenceSequence = 0

  const sceneLabels = computed(() => QUICK_TRANSFER_REFERENCE_SCENES.map(scene => scene.label))
  const memoLabels = computed(() => memoOptions.value.map(memo => `[${memo.source === 'owned' ? '我的' : '分享'}] ${memo.name}`))
  const selectedMemo = computed(() => memoOptions.value[selectedMemoIndex.value])
  const selectedMemoLabel = computed(() => {
    const memo = selectedMemo.value
    return memo ? `[${memo.source === 'owned' ? '我的' : '分享'}] ${memo.name}` : '请选择备忘录'
  })

  const isRecord = (value: unknown): value is Record<string, unknown> =>
    Boolean(value) && typeof value === 'object' && !Array.isArray(value)

  const readString = (value: unknown): string => (typeof value === 'string' ? value.trim() : '')

  const getMemoName = (item: Record<string, unknown>): string => {
    const name = readString(item.name)
    if (name) return name
    const title = item.title
    if (typeof title === 'string') return title.trim()
    if (isRecord(title)) return readString(title.value)
    return '未命名备忘录'
  }

  const readMemoItems = (response: unknown): unknown[] => {
    if (Array.isArray(response)) return response
    if (!isRecord(response)) return []
    if (response.data !== undefined) return readMemoItems(response.data)
    if (Array.isArray(response.results)) return response.results
    if (Array.isArray(response.items)) return response.items
    if (Array.isArray(response.memos)) return response.memos
    return []
  }

  const normalizeMemoOptions = (response: unknown, source: MemoOption['source']): MemoOption[] =>
    readMemoItems(response).flatMap(item => {
      if (!isRecord(item)) return []
      const id = readString(item.id) || readString(item._id)
      if (!id) return []
      return [{ id, name: getMemoName(item), source }]
    })

  const loadMemos = async () => {
    loading.value = true
    errorMessage.value = ''
    try {
      const baseQuery: Omit<getMemosQuery, 'viewScope'> = {
        status: 'active',
        limit: 100,
        page: 1,
        sortBy: 'updatedAt:desc',
      }
      const [ownedResponse, sharedResponse] = await Promise.all([
        getMemos({ ...baseQuery, viewScope: 'owned' }),
        getMemos({ ...baseQuery, viewScope: 'shared' }),
      ])
      const options = [...normalizeMemoOptions(ownedResponse, 'owned'), ...normalizeMemoOptions(sharedResponse, 'shared')]
      const seen = new Set<string>()
      memoOptions.value = options.filter(option => {
        if (seen.has(option.id)) return false
        seen.add(option.id)
        return true
      })
      selectedMemoIndex.value = -1
    } catch (error) {
      memoOptions.value = []
      selectedMemoIndex.value = -1
      errorMessage.value = getQuickTransferErrorMessage(error, '备忘录加载失败，请重试')
    } finally {
      loading.value = false
    }
  }

  const handleSceneChange = (event: { detail: { value: number | string } }) => {
    const scene = QUICK_TRANSFER_REFERENCE_SCENES[Number(event.detail.value)]
    if (!scene) return
    selectedScene.value = scene.value
    selectedMemoIndex.value = -1
  }

  const handleMemoChange = (event: { detail: { value: number | string } }) => {
    const index = Number(event.detail.value)
    selectedMemoIndex.value = Number.isInteger(index) ? index : -1
  }

  const addReference = () => {
    const memo = selectedMemo.value
    if (selectedScene.value !== 'memo' || !memo) return
    referenceSequence += 1
    emit('selected', {
      localId: `memo-reference-${Date.now()}-${referenceSequence}`,
      type: 'memoDetail',
      resourceId: memo.id,
      title: memo.name,
      subtitle: memo.source === 'owned' ? '我创建的' : '分享给我的',
    })
  }

  onMounted(() => {
    if (props.visible) void loadMemos()
  })
</script>

<template>
  <view v-if="props.visible" class="reference-picker-mask" @click="emit('cancel')">
    <view class="reference-picker" @click.stop>
      <view class="picker-header">
        <text class="picker-title">新增引用</text>
        <text class="picker-close" @click="emit('cancel')">×</text>
      </view>

      <text class="picker-label">场景</text>
      <picker
        mode="selector"
        :range="sceneLabels"
        :value="
          Math.max(
            0,
            QUICK_TRANSFER_REFERENCE_SCENES.findIndex(scene => scene.value === selectedScene),
          )
        "
        @change="handleSceneChange">
        <view class="picker-select">
          <text>{{ QUICK_TRANSFER_REFERENCE_SCENES.find(scene => scene.value === selectedScene)?.label }}</text>
          <text class="picker-arrow">›</text>
        </view>
      </picker>

      <text class="picker-label">备忘录</text>
      <picker
        v-if="!loading && !errorMessage && memoOptions.length"
        mode="selector"
        :range="memoLabels"
        :value="Math.max(0, selectedMemoIndex)"
        @change="handleMemoChange">
        <view class="picker-select">
          <text :class="{ 'placeholder-text': !selectedMemo }">{{ selectedMemoLabel }}</text>
          <text class="picker-arrow">›</text>
        </view>
      </picker>
      <view v-else class="picker-select picker-select--disabled">
        <text v-if="loading" class="placeholder-text">正在加载备忘录…</text>
        <text v-else-if="errorMessage" class="error-text">{{ errorMessage }}</text>
        <text v-else class="placeholder-text">暂无可引用的备忘录</text>
      </view>

      <view class="picker-actions">
        <button class="picker-button picker-button--cancel" @click="emit('cancel')">取消</button>
        <button class="picker-button picker-button--confirm" :disabled="loading || !selectedMemo" @click="addReference">添加</button>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
  .reference-picker-mask {
    position: fixed;
    z-index: 30;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    align-items: flex-end;
    background: rgba(0, 0, 0, 0.45);
  }

  .reference-picker {
    width: 100%;
    padding: 30rpx 24rpx calc(30rpx + env(safe-area-inset-bottom));
    box-sizing: border-box;
    border-radius: 28rpx 28rpx 0 0;
    background: var(--theme-surface);
  }

  .picker-header,
  .picker-select,
  .picker-actions {
    display: flex;
    align-items: center;
  }

  .picker-header,
  .picker-select {
    justify-content: space-between;
  }

  .picker-title {
    color: var(--theme-text);
    font-size: 32rpx;
    font-weight: 700;
  }

  .picker-close {
    padding: 0 8rpx;
    color: var(--theme-text-tertiary);
    font-size: 42rpx;
    line-height: 1;
  }

  .picker-label {
    display: block;
    margin-top: 24rpx;
    margin-bottom: 12rpx;
    color: var(--theme-text);
    font-size: 26rpx;
    font-weight: 700;
  }

  .picker-select {
    min-height: 82rpx;
    padding: 0 22rpx;
    box-sizing: border-box;
    border: 1rpx solid var(--theme-border);
    border-radius: 16rpx;
    color: var(--theme-text);
    background: var(--theme-surface-muted);
    font-size: 28rpx;
  }

  .picker-select--disabled {
    align-items: center;
  }

  .picker-select > text:first-child {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .picker-arrow {
    margin-left: 16rpx;
    color: var(--theme-text-secondary);
    font-size: 34rpx;
  }

  .placeholder-text {
    color: var(--theme-text-tertiary);
  }

  .error-text {
    color: var(--theme-danger);
    font-size: 24rpx;
  }

  .picker-actions {
    gap: 16rpx;
    margin-top: 30rpx;
  }

  .picker-button {
    flex: 1;
    min-height: 78rpx;
    margin: 0;
    border: 0;
    border-radius: 16rpx;
    font-size: 26rpx;
  }

  .picker-button::after {
    border: 0;
  }

  .picker-button--cancel {
    color: var(--theme-text-secondary);
    background: var(--theme-surface-muted);
  }

  .picker-button--confirm {
    color: #fff;
    background: linear-gradient(135deg, #2563eb, #14b8a6);
  }

  .picker-button--confirm[disabled] {
    color: var(--theme-text-tertiary);
    background: var(--theme-border);
  }
</style>
