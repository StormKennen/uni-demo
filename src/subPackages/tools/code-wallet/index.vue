<template>
  <PageLayout title="码包" nav-gradient="linear-gradient(135deg, #10b981 0%, #06b6d4 100%)">
    <view class="wallet-page">
      <view class="content">
        <!-- 搜索与筛选 -->
        <view class="toolbar">
          <view class="search-box">
            <uni-icons type="search" size="18" color="var(--theme-text-tertiary)" />
            <input v-model="keyword" class="search-input" placeholder="搜索名称/内容/标签" confirm-type="search" @input="onKeywordInput" />
            <uni-icons v-if="keyword" type="clear" size="18" color="var(--theme-text-tertiary)" @click="clearKeyword" />
          </view>
          <view class="filter-row">
            <view class="seg">
              <view
                v-for="opt in typeFilters"
                :key="opt.value"
                class="seg-item"
                :class="{ active: typeFilter === opt.value }"
                @click="switchTypeFilter(opt.value)">
                {{ opt.label }}
              </view>
            </view>
            <text v-if="isLoggedIn && localItems.length" class="sync-btn" @click="syncLocal">同步本地({{ localItems.length }})</text>
          </view>
        </view>

        <view v-if="!isLoggedIn" class="mode-tip">未登录，当前为本地模式，数据仅保存在本机。</view>

        <!-- 列表 -->
        <view v-if="loading && !displayItems.length" class="hint">加载中...</view>
        <view v-else-if="displayItems.length" class="card-list">
          <view v-for="item in displayItems" :key="itemKey(item)" class="wallet-card" @click="openPreview(item)">
            <view class="card-swatch" :style="{ background: item.backgroundColor || 'var(--theme-surface-2)' }">
              <uni-icons :type="item.codeType === 'barcode' ? 'bars' : 'scan'" size="26" :color="item.color || 'var(--theme-text-secondary)'" />
            </view>
            <view class="card-body">
              <view class="card-title-row">
                <uni-icons v-if="item.pinned" type="star-filled" size="14" color="#f59e0b" />
                <text class="card-name">{{ item.name }}</text>
              </view>
              <text class="card-content">{{ summary(item.content) }}</text>
              <view class="card-meta">
                <text class="type-tag">{{ item.codeType === 'barcode' ? '条形码' : '二维码' }}</text>
                <text v-if="item.tag" class="tag-chip">{{ item.tag }}</text>
                <text v-if="item.updatedAt" class="update-time">{{ formatTime(item.updatedAt) }}</text>
              </view>
            </view>
            <view class="card-ops" @click.stop>
              <uni-icons type="star" size="18" :color="item.pinned ? '#f59e0b' : 'var(--theme-text-tertiary)'" @click="togglePin(item)" />
              <uni-icons type="compose" size="18" color="var(--theme-text-tertiary)" @click="openForm(item)" />
              <uni-icons type="trash" size="18" color="var(--theme-text-tertiary)" @click="removeItem(item)" />
            </view>
          </view>
          <view v-if="isLoggedIn && hasMore" class="hint" @click="loadMore">{{ loadingMore ? '加载中...' : '加载更多' }}</view>
        </view>
        <empty-data v-else :desc="emptyText" />
      </view>
    </view>

    <template #footer>
      <view class="bottom-bar">
        <button class="submit-btn" @click="openForm()">
          <uni-icons type="plusempty" size="16" color="#fff" />
          <text>新增码</text>
        </button>
      </view>
    </template>

    <!-- 新增/编辑表单 -->
    <uni-popup ref="formPopup" type="bottom" background-color="transparent">
      <view class="sheet">
        <view class="sheet-header">
          <text class="sheet-title">{{ editingId || editingLocalId ? '编辑码' : '新增码' }}</text>
          <uni-icons type="closeempty" size="20" color="var(--theme-text-tertiary)" @click="closeForm" />
        </view>
        <scroll-view scroll-y class="sheet-body">
          <view class="field">
            <text class="field-label">名称</text>
            <input v-model="form.name" class="field-input" placeholder="如：会员码" :maxlength="40" />
          </view>
          <view class="field">
            <text class="field-label">内容</text>
            <textarea v-model="form.content" class="field-textarea" placeholder="码内容/链接" :maxlength="500" auto-height />
          </view>
          <view class="field">
            <text class="field-label">类型</text>
            <view class="seg">
              <view class="seg-item" :class="{ active: form.codeType === 'qr' }" @click="form.codeType = 'qr'">二维码</view>
              <view class="seg-item" :class="{ active: form.codeType === 'barcode' }" @click="form.codeType = 'barcode'">条形码</view>
            </view>
          </view>
          <view v-if="form.codeType === 'barcode'" class="field">
            <text class="field-label">条码格式</text>
            <view class="seg wrap">
              <view
                v-for="fmt in barcodeFormats"
                :key="fmt"
                class="seg-item"
                :class="{ active: form.barcodeFormat === fmt }"
                @click="form.barcodeFormat = fmt">
                {{ fmt }}
              </view>
            </view>
          </view>
          <view class="field">
            <text class="field-label">标签</text>
            <input v-model="form.tag" class="field-input" placeholder="可选，如 支付" :maxlength="20" />
          </view>
          <view class="field-inline">
            <view class="field-color">
              <text class="field-label">前景色</text>
              <input v-model="form.color" class="field-input" placeholder="#000000" :maxlength="9" />
            </view>
            <view class="field-color">
              <text class="field-label">背景色</text>
              <input v-model="form.backgroundColor" class="field-input" placeholder="#ffffff" :maxlength="9" />
            </view>
          </view>
        </scroll-view>
        <view class="sheet-footer">
          <button class="sheet-btn" :disabled="saving" @click="closeForm">取消</button>
          <button class="sheet-btn primary" :disabled="saving || !formValid" @click="saveForm">{{ saving ? '保存中...' : '保存' }}</button>
        </view>
      </view>
    </uni-popup>

    <!-- 预览 -->
    <uni-popup ref="previewPopup" type="bottom" background-color="transparent">
      <view class="sheet">
        <view class="sheet-header">
          <text class="sheet-title">{{ previewItem?.name || '预览' }}</text>
          <uni-icons type="closeempty" size="20" color="var(--theme-text-tertiary)" @click="closePreview" />
        </view>
        <scroll-view scroll-y class="sheet-body">
          <QrGeneratorPanel
            v-if="previewItem && previewItem.codeType === 'qr'"
            mode="sheet"
            :editable="false"
            :auto-generate="true"
            :initial-content="previewItem.content" />
          <view v-else-if="previewItem" class="barcode-preview">
            <view class="barcode-placeholder" :style="{ background: previewItem.backgroundColor || 'var(--theme-surface-2)' }">
              <text class="barcode-format">{{ previewItem.barcodeFormat || 'barcode' }}</text>
              <text class="barcode-content" selectable>{{ previewItem.content }}</text>
            </view>
            <text class="barcode-tip">条形码图形渲染将在后续版本补充，当前可复制内容使用。</text>
            <button class="sheet-btn primary" @click="copyContent(previewItem.content)">复制内容</button>
          </view>
        </scroll-view>
      </view>
    </uni-popup>
  </PageLayout>
</template>

<script setup lang="ts">
  import { computed, reactive, ref } from 'vue'
  import { onLoad, onShow } from '@dcloudio/uni-app'
  import { debounce } from 'lodash-es'
  import QrGeneratorPanel from '@/components/toolkit/business/qr-generator-panel.vue'
  import {
    deleteCodeWalletItemsItemId,
    getCodeWalletItems,
    patchCodeWalletItemsItemId,
    postCodeWalletItems,
    postCodeWalletItemsSync,
  } from '@/services/apifox/NODEJSDEMO/CODEWALLET/apifox'
  import type {
    postCodeWalletItemsBody,
    postCodeWalletItemsRes,
    postCodeWalletItemsSyncBodyItemsItem,
  } from '@/services/apifox/NODEJSDEMO/CODEWALLET/interface'
  import { getStorageSync, getToken, setStorageSync } from '@/utils/storage'
  import { reportToolVisit } from '@/utils/tracker'

  type CodeType = 'qr' | 'barcode'
  type BarcodeFormat = NonNullable<postCodeWalletItemsBody['barcodeFormat']>

  interface WalletItem {
    id?: string
    localId?: string
    name: string
    content: string
    codeType: CodeType
    barcodeFormat?: string
    color?: string
    backgroundColor?: string
    tag?: string
    pinned?: boolean
    sortOrder?: number
    updatedAt?: number
  }

  const LOCAL_KEY = 'TOOL_CODE_WALLET_LOCAL_ITEMS'
  const PAGE_SIZE = 20
  const barcodeFormats: BarcodeFormat[] = ['code128', 'ean13', 'ean8', 'upc']

  const typeFilters: { label: string; value: '' | CodeType }[] = [
    { label: '全部', value: '' },
    { label: '二维码', value: 'qr' },
    { label: '条形码', value: 'barcode' },
  ]

  const isLoggedIn = computed(() => !!getToken())

  const keyword = ref('')
  const typeFilter = ref<'' | CodeType>('')
  const loading = ref(false)
  const loadingMore = ref(false)
  const hasMore = ref(false)
  const page = ref(1)
  const saving = ref(false)

  const cloudItems = ref<WalletItem[]>([])
  const localItems = ref<WalletItem[]>([])

  const formPopup = ref<{ open: () => void; close: () => void } | null>(null)
  const previewPopup = ref<{ open: () => void; close: () => void } | null>(null)
  const previewItem = ref<WalletItem | null>(null)

  const editingId = ref<string | undefined>(undefined)
  const editingLocalId = ref<string | undefined>(undefined)
  const form = reactive<WalletItem>({
    name: '',
    content: '',
    codeType: 'qr',
    barcodeFormat: 'code128',
    tag: '',
    color: '',
    backgroundColor: '',
  })

  const formValid = computed(() => form.name.trim().length > 0 && form.content.trim().length > 0)

  const emptyText = computed(() => (isLoggedIn.value ? '暂无码，点击下方新增' : '本地暂无码，点击下方新增'))

  const genId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

  const sortItems = (list: WalletItem[]): WalletItem[] =>
    [...list].sort((a, b) => {
      if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1
      return (b.updatedAt || 0) - (a.updatedAt || 0)
    })

  const filterLocal = (list: WalletItem[]): WalletItem[] => {
    const kw = keyword.value.trim().toLowerCase()
    return list.filter(i => {
      if (typeFilter.value && i.codeType !== typeFilter.value) return false
      if (!kw) return true
      return [i.name, i.content, i.tag].some(v => (v || '').toLowerCase().includes(kw))
    })
  }

  const displayItems = computed<WalletItem[]>(() => {
    const source = isLoggedIn.value ? cloudItems.value : filterLocal(localItems.value)
    return sortItems(source)
  })

  const itemKey = (item: WalletItem) => item.id || item.localId || item.content
  const summary = (content: string) => (content.length > 40 ? `${content.slice(0, 40)}...` : content)

  const formatTime = (ts?: number): string => {
    if (!ts) return ''
    const d = new Date(ts)
    const pad = (n: number) => `${n}`.padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  }

  // ── 本地存储 ──
  const loadLocal = () => {
    const raw = getStorageSync(LOCAL_KEY)
    localItems.value = Array.isArray(raw) ? (raw as WalletItem[]) : []
  }

  const persistLocal = () => {
    setStorageSync(LOCAL_KEY, localItems.value)
  }

  // ── 云端列表解析 ──
  const toWalletItem = (raw: postCodeWalletItemsRes): WalletItem => ({
    id: raw.id,
    name: raw.name || '',
    content: raw.content || '',
    codeType: raw.codeType === 'barcode' ? 'barcode' : 'qr',
    barcodeFormat: typeof raw.barcodeFormat === 'string' ? raw.barcodeFormat : undefined,
    color: raw.color,
    backgroundColor: raw.backgroundColor,
    tag: raw.tag,
    pinned: raw.pinned,
    sortOrder: raw.sortOrder,
  })

  const asItemList = (raw: unknown): postCodeWalletItemsRes[] => {
    if (Array.isArray(raw)) return raw as postCodeWalletItemsRes[]
    if (raw && typeof raw === 'object') {
      const o = raw as Record<string, unknown>
      for (const key of ['results', 'list', 'items', 'data']) {
        if (Array.isArray(o[key])) return o[key] as postCodeWalletItemsRes[]
      }
    }
    return []
  }

  const loadCloud = async (reset = true) => {
    if (!isLoggedIn.value) {
      loadLocal()
      return
    }
    if (reset) {
      page.value = 1
      loading.value = true
    }
    try {
      const res = await getCodeWalletItems({
        page: page.value,
        pageSize: PAGE_SIZE,
        ...(keyword.value.trim() ? { keyword: keyword.value.trim() } : {}),
        ...(typeFilter.value ? { codeType: typeFilter.value } : {}),
      })
      const list = asItemList(res).map(toWalletItem)
      cloudItems.value = reset ? list : [...cloudItems.value, ...list]
      hasMore.value = list.length >= PAGE_SIZE
    } catch {
      if (reset) cloudItems.value = []
      hasMore.value = false
    } finally {
      loading.value = false
      loadingMore.value = false
    }
  }

  const loadMore = async () => {
    if (loadingMore.value || !hasMore.value) return
    loadingMore.value = true
    page.value += 1
    await loadCloud(false)
  }

  const refresh = () => {
    if (isLoggedIn.value) loadCloud(true)
    else loadLocal()
  }

  const debouncedSearch = debounce(() => refresh(), 350)
  const onKeywordInput = () => debouncedSearch()
  const clearKeyword = () => {
    keyword.value = ''
    refresh()
  }
  const switchTypeFilter = (v: '' | CodeType) => {
    if (typeFilter.value === v) return
    typeFilter.value = v
    refresh()
  }

  // ── 表单 ──
  const resetForm = () => {
    editingId.value = undefined
    editingLocalId.value = undefined
    form.name = ''
    form.content = ''
    form.codeType = 'qr'
    form.barcodeFormat = 'code128'
    form.tag = ''
    form.color = ''
    form.backgroundColor = ''
  }

  const openForm = (item?: WalletItem) => {
    if (item) {
      editingId.value = item.id
      editingLocalId.value = item.localId
      form.name = item.name
      form.content = item.content
      form.codeType = item.codeType
      form.barcodeFormat = (item.barcodeFormat as BarcodeFormat) || 'code128'
      form.tag = item.tag || ''
      form.color = item.color || ''
      form.backgroundColor = item.backgroundColor || ''
    } else {
      resetForm()
    }
    formPopup.value?.open()
  }

  const closeForm = () => formPopup.value?.close()

  const buildCreateBody = (): postCodeWalletItemsBody => {
    const body: postCodeWalletItemsBody = {
      name: form.name.trim(),
      content: form.content.trim(),
      codeType: form.codeType,
    }
    if (form.codeType === 'barcode' && form.barcodeFormat) body.barcodeFormat = form.barcodeFormat as BarcodeFormat
    if (form.tag?.trim()) body.tag = form.tag.trim()
    if (form.color?.trim()) body.color = form.color.trim()
    if (form.backgroundColor?.trim()) body.backgroundColor = form.backgroundColor.trim()
    return body
  }

  const saveForm = async () => {
    if (!formValid.value || saving.value) return
    saving.value = true
    try {
      if (isLoggedIn.value) {
        const body = buildCreateBody()
        if (editingId.value) {
          await patchCodeWalletItemsItemId(editingId.value, body)
          uni.showToast({ title: '已更新', icon: 'none' })
        } else {
          await postCodeWalletItems(body)
          uni.showToast({ title: '已保存到云端', icon: 'none' })
        }
        closeForm()
        await loadCloud(true)
      } else {
        const now = Date.now()
        const localId = editingLocalId.value || genId()
        const next: WalletItem = {
          localId,
          name: form.name.trim(),
          content: form.content.trim(),
          codeType: form.codeType,
          barcodeFormat: form.codeType === 'barcode' ? form.barcodeFormat : undefined,
          tag: form.tag?.trim() || undefined,
          color: form.color?.trim() || undefined,
          backgroundColor: form.backgroundColor?.trim() || undefined,
          pinned: editingLocalId.value ? localItems.value.find(i => i.localId === localId)?.pinned : false,
          updatedAt: now,
        }
        const idx = localItems.value.findIndex(i => i.localId === localId)
        if (idx > -1) localItems.value.splice(idx, 1, next)
        else localItems.value.push(next)
        persistLocal()
        closeForm()
        uni.showToast({ title: '已保存到本地', icon: 'none' })
      }
    } catch (err) {
      uni.showToast({ title: (err as Error)?.message || '保存失败', icon: 'none' })
    } finally {
      saving.value = false
    }
  }

  const togglePin = async (item: WalletItem) => {
    if (isLoggedIn.value && item.id) {
      try {
        await patchCodeWalletItemsItemId(item.id, { pinned: !item.pinned })
        item.pinned = !item.pinned
      } catch {
        uni.showToast({ title: '操作失败', icon: 'none' })
      }
    } else if (item.localId) {
      const target = localItems.value.find(i => i.localId === item.localId)
      if (target) {
        target.pinned = !target.pinned
        target.updatedAt = Date.now()
        persistLocal()
      }
    }
  }

  const removeItem = (item: WalletItem) => {
    uni.showModal({
      title: '删除确认',
      content: `确定删除「${item.name}」吗？`,
      success: async res => {
        if (!res.confirm) return
        if (isLoggedIn.value && item.id) {
          try {
            await deleteCodeWalletItemsItemId(item.id)
            cloudItems.value = cloudItems.value.filter(i => i.id !== item.id)
            uni.showToast({ title: '已删除', icon: 'none' })
          } catch {
            uni.showToast({ title: '删除失败', icon: 'none' })
          }
        } else if (item.localId) {
          localItems.value = localItems.value.filter(i => i.localId !== item.localId)
          persistLocal()
          uni.showToast({ title: '已删除', icon: 'none' })
        }
      },
    })
  }

  const syncLocal = async () => {
    if (!isLoggedIn.value || !localItems.value.length || saving.value) return
    saving.value = true
    uni.showLoading({ title: '同步中...' })
    try {
      const items: postCodeWalletItemsSyncBodyItemsItem[] = localItems.value.map(i => ({
        name: i.name,
        content: i.content,
        codeType: i.codeType,
        ...(i.barcodeFormat ? { barcodeFormat: i.barcodeFormat } : {}),
        ...(i.localId ? { localId: i.localId } : {}),
        ...(typeof i.pinned === 'boolean' ? { pinned: i.pinned } : {}),
        ...(i.tag ? { tag: i.tag } : {}),
        ...(i.updatedAt ? { updatedAt: i.updatedAt } : {}),
      }))
      const res = await postCodeWalletItemsSync({ items })
      localItems.value = []
      persistLocal()
      uni.hideLoading()
      uni.showToast({ title: `同步完成 新增${res.created || 0}/更新${res.updated || 0}`, icon: 'none' })
      await loadCloud(true)
    } catch (err) {
      uni.hideLoading()
      uni.showToast({ title: (err as Error)?.message || '同步失败', icon: 'none' })
    } finally {
      saving.value = false
    }
  }

  const openPreview = (item: WalletItem) => {
    previewItem.value = item
    previewPopup.value?.open()
  }
  const closePreview = () => previewPopup.value?.close()

  const copyContent = (content: string) => {
    uni.setClipboardData({ data: content, success: () => uni.showToast({ title: '已复制', icon: 'none' }) })
  }

  onLoad(query => {
    loadLocal()
    const content = query?.content ? decodeURIComponent(query.content) : ''
    if (content) {
      resetForm()
      form.content = content
      form.codeType = query?.codeType === 'barcode' ? 'barcode' : 'qr'
      form.name = content.length > 20 ? `${content.slice(0, 20)}...` : content
      setTimeout(() => formPopup.value?.open(), 300)
    }
  })

  onShow(() => {
    reportToolVisit('code-wallet')
    refresh()
  })
</script>

<style scoped lang="scss">
  .wallet-page {
    min-height: 100vh;
    background: var(--theme-bg);
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
    padding: calc(24rpx + var(--nav-height, 120rpx)) 24rpx 24rpx;
  }

  .toolbar {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
  }

  .search-box {
    display: flex;
    align-items: center;
    gap: 12rpx;
    height: 80rpx;
    padding: 0 24rpx;
    border-radius: 16rpx;
    background: var(--theme-surface);
    border: 1rpx solid var(--theme-border);
  }

  .search-input {
    flex: 1;
    font-size: 26rpx;
    color: var(--theme-text);
  }

  .filter-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
  }

  .seg {
    display: flex;
    gap: 8rpx;
    background: var(--theme-surface-2);
    padding: 6rpx;
    border-radius: 12rpx;

    &.wrap {
      flex-wrap: wrap;
    }
  }

  .seg-item {
    padding: 12rpx 24rpx;
    border-radius: 10rpx;
    font-size: 24rpx;
    color: var(--theme-text-secondary);

    &.active {
      background: var(--theme-surface);
      color: #10b981;
      font-weight: 600;
    }
  }

  .sync-btn {
    font-size: 24rpx;
    color: #10b981;
    padding: 8rpx 16rpx;
  }

  .mode-tip {
    font-size: 22rpx;
    color: var(--theme-text-tertiary);
    padding: 4rpx 8rpx;
  }

  .card-list {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
  }

  .wallet-card {
    display: flex;
    align-items: center;
    gap: 20rpx;
    padding: 20rpx;
    border-radius: 18rpx;
    background: var(--theme-surface);
    border: 1rpx solid var(--theme-border);
  }

  .card-swatch {
    width: 88rpx;
    height: 88rpx;
    border-radius: 14rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .card-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 8rpx;
  }

  .card-title-row {
    display: flex;
    align-items: center;
    gap: 8rpx;
  }

  .card-name {
    font-size: 28rpx;
    font-weight: 600;
    color: var(--theme-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .card-content {
    font-size: 24rpx;
    color: var(--theme-text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .card-meta {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }

  .type-tag,
  .tag-chip {
    font-size: 20rpx;
    padding: 4rpx 12rpx;
    border-radius: 999rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text-secondary);
  }

  .update-time {
    font-size: 20rpx;
    color: var(--theme-text-tertiary);
  }

  .card-ops {
    display: flex;
    flex-direction: column;
    gap: 18rpx;
    padding-left: 8rpx;
  }

  .hint {
    font-size: 24rpx;
    color: var(--theme-text-tertiary);
    padding: 24rpx 0;
    text-align: center;
  }

  .bottom-bar {
    padding: 16rpx 24rpx calc(16rpx + env(safe-area-inset-bottom));
  }

  .submit-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10rpx;
    width: 100%;
    height: 88rpx;
    border: none;
    border-radius: 999rpx;
    font-size: 30rpx;
    font-weight: 700;
    color: #fff;
    background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
  }

  /* sheet */
  .sheet {
    background: var(--theme-surface);
    border-radius: 24rpx 24rpx 0 0;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
  }

  .sheet-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 28rpx 32rpx;
    border-bottom: 1rpx solid var(--theme-border);
  }

  .sheet-title {
    font-size: 30rpx;
    font-weight: 700;
    color: var(--theme-text);
  }

  .sheet-body {
    padding: 24rpx 32rpx;
    max-height: 56vh;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
    margin-bottom: 24rpx;
  }

  .field-inline {
    display: flex;
    gap: 20rpx;
    margin-bottom: 24rpx;
  }

  .field-color {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12rpx;
  }

  .field-label {
    font-size: 24rpx;
    color: var(--theme-text-secondary);
  }

  .field-input {
    height: 76rpx;
    padding: 0 24rpx;
    border-radius: 12rpx;
    background: var(--theme-surface-2);
    font-size: 26rpx;
    color: var(--theme-text);
  }

  .field-textarea {
    min-height: 120rpx;
    padding: 20rpx 24rpx;
    border-radius: 12rpx;
    background: var(--theme-surface-2);
    font-size: 26rpx;
    color: var(--theme-text);
    width: 100%;
    box-sizing: border-box;
  }

  .sheet-footer {
    display: flex;
    gap: 20rpx;
    padding: 20rpx 32rpx calc(20rpx + env(safe-area-inset-bottom));
    border-top: 1rpx solid var(--theme-border);
  }

  .sheet-btn {
    flex: 1;
    height: 84rpx;
    border-radius: 999rpx;
    font-size: 28rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text);
    border: none;

    &.primary {
      background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
      color: #fff;
    }

    &:disabled {
      opacity: 0.5;
    }
  }

  .barcode-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24rpx;
    padding: 20rpx 0;
  }

  .barcode-placeholder {
    width: 100%;
    padding: 48rpx 24rpx;
    border-radius: 16rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16rpx;
  }

  .barcode-format {
    font-size: 22rpx;
    color: var(--theme-text-tertiary);
    text-transform: uppercase;
  }

  .barcode-content {
    font-size: 30rpx;
    letter-spacing: 4rpx;
    color: var(--theme-text);
    word-break: break-all;
    text-align: center;
  }

  .barcode-tip {
    font-size: 22rpx;
    color: var(--theme-text-tertiary);
    text-align: center;
  }
</style>
