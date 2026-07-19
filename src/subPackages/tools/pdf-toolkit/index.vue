<template>
  <PageLayout title="PDF 工具箱" nav-gradient="linear-gradient(135deg, #ef4444 0%, #f97316 100%)">
    <view class="pdf-page">
      <view class="content">
        <!-- 任务类型 -->
        <tool-section-card title="选择功能" subtitle="转换 / 合并 / 拆分 / 压缩">
          <view class="type-grid">
            <view
              v-for="opt in taskTypeOptions"
              :key="opt.value"
              class="type-card"
              :class="{ active: taskType === opt.value }"
              @click="switchType(opt.value)">
              <uni-icons :type="opt.icon" size="22" :color="taskType === opt.value ? '#fff' : 'var(--theme-text-secondary)'" />
              <text class="type-name">{{ opt.name }}</text>
            </view>
          </view>
        </tool-section-card>

        <!-- 文件选择 -->
        <tool-section-card title="选择文件" :subtitle="fileHint">
          <button class="primary-btn" :disabled="uploading" @click="chooseFiles">
            <uni-icons type="plusempty" size="16" color="#fff" />
            <text>{{ chooseBtnText }}</text>
          </button>

          <view v-if="queue.length" class="queue">
            <view v-for="item in queue" :key="item.localId" class="queue-item">
              <view class="queue-main">
                <text class="queue-name">{{ item.name }}</text>
                <text class="queue-meta">{{ formatSize(item.size) }} · {{ statusText(item.status) }}</text>
              </view>
              <view class="queue-actions">
                <view v-if="item.status === 'uploading'" class="mini-spinner" />
                <uni-icons v-else-if="item.status === 'done'" type="checkmarkempty" size="18" color="#22c55e" />
                <uni-icons v-else-if="item.status === 'failed'" type="closeempty" size="18" color="#ef4444" />
                <uni-icons v-if="!uploading" type="trash" size="18" color="var(--theme-text-tertiary)" @click="removeQueueItem(item.localId)" />
              </view>
            </view>
          </view>
          <empty-data v-else desc="请选择文件" />
        </tool-section-card>

        <!-- 参数区 -->
        <tool-section-card v-if="taskType === 'images-to-pdf'" title="转换参数">
          <view class="param-row">
            <text class="param-label">页面尺寸</text>
            <view class="seg">
              <view class="seg-item" :class="{ active: pageSize === 'auto' }" @click="pageSize = 'auto'">自适应</view>
              <view class="seg-item" :class="{ active: pageSize === 'a4' }" @click="pageSize = 'a4'">A4</view>
            </view>
          </view>
          <view class="param-row">
            <text class="param-label">方向</text>
            <view class="seg">
              <view class="seg-item" :class="{ active: orientation === 'portrait' }" @click="orientation = 'portrait'">纵向</view>
              <view class="seg-item" :class="{ active: orientation === 'landscape' }" @click="orientation = 'landscape'">横向</view>
            </view>
          </view>
        </tool-section-card>

        <tool-section-card v-else-if="taskType === 'split'" title="拆分参数">
          <view class="param-row stacked">
            <text class="param-label">页码范围</text>
            <input v-model="splitRanges" class="text-input" placeholder="例如 1-3,5" />
            <text class="param-tip">留空则按每页拆分</text>
          </view>
        </tool-section-card>

        <tool-section-card v-else-if="taskType === 'compress'" title="压缩参数">
          <view class="param-row">
            <text class="param-label">压缩质量</text>
            <view class="seg">
              <view class="seg-item" :class="{ active: quality === 'low' }" @click="quality = 'low'">低</view>
              <view class="seg-item" :class="{ active: quality === 'medium' }" @click="quality = 'medium'">中</view>
              <view class="seg-item" :class="{ active: quality === 'high' }" @click="quality = 'high'">高</view>
            </view>
          </view>
        </tool-section-card>

        <!-- 任务状态 -->
        <tool-section-card v-if="currentTask" title="处理进度">
          <view class="task-status">
            <text class="status-badge" :class="`badge--${currentTask.status || 'pending'}`">{{ statusLabel(currentTask.status) }}</text>
            <text v-if="typeof currentTask.progress === 'number'" class="status-progress">{{ currentTask.progress }}%</text>
          </view>
          <view v-if="currentTask.status === 'failed' && currentTask.errorMessage" class="error-text">{{ currentTask.errorMessage }}</view>

          <view v-if="currentResult.url" class="result-box">
            <text class="result-name">{{ currentResult.fileName || '处理结果' }}</text>
            <text v-if="currentResult.size" class="result-meta">{{ formatSize(currentResult.size) }}</text>
            <view class="result-actions">
              <button class="mini-btn primary" @click="previewResult(currentResult.url)">预览</button>
              <button class="mini-btn" @click="copyLink(currentResult.url)">复制链接</button>
            </view>
          </view>
        </tool-section-card>

        <!-- 历史任务 -->
        <tool-section-card title="历史任务">
          <template #header>
            <view class="history-header">
              <text class="tool-section-card__title">历史任务</text>
              <text class="refresh-link" @click="loadHistory">刷新</text>
            </view>
          </template>
          <view v-if="historyLoading" class="hint">加载中...</view>
          <view v-else-if="history.length" class="history-list">
            <view v-for="task in history" :key="task.taskId" class="history-item" @click="openHistory(task)">
              <view class="history-main">
                <text class="history-type">{{ typeName(task.type) }}</text>
                <text class="history-id">{{ task.taskId }}</text>
              </view>
              <text class="status-badge" :class="`badge--${task.status || 'pending'}`">{{ statusLabel(task.status) }}</text>
            </view>
          </view>
          <empty-data v-else desc="暂无历史任务" />
        </tool-section-card>
      </view>
    </view>

    <template #footer>
      <view class="bottom-bar">
        <button class="submit-btn" :disabled="submitDisabled" @click="submit">
          <text>{{ uploading ? '处理中...' : '上传并创建任务' }}</text>
        </button>
      </view>
    </template>
  </PageLayout>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { onLoad, onShow, onUnload } from '@dcloudio/uni-app'
  import {
    getPdfToolkitTasks,
    getPdfToolkitTasksTaskId,
    postPdfToolkitFiles,
    postPdfToolkitTasks,
  } from '@/services/apifox/NODEJSDEMO/PDFTOOLKIT/apifox'
  import type {
    getPdfToolkitTasksTaskIdRes,
    postPdfToolkitTasksBody,
    postPdfToolkitTasksBodyOptions,
  } from '@/services/apifox/NODEJSDEMO/PDFTOOLKIT/interface'
  import { reportToolVisit } from '@/utils/tracker'
  import { getToken } from '@/utils/storage'

  type TaskType = postPdfToolkitTasksBody['type']
  type TaskDetail = getPdfToolkitTasksTaskIdRes

  interface QueueItem {
    localId: string
    name: string
    size: number
    path: string
    ext: string
    status: 'pending' | 'uploading' | 'done' | 'failed'
    fileId?: string
  }

  interface ResultView {
    url?: string
    fileName?: string
    size?: number
  }

  const taskTypeOptions: { value: TaskType; name: string; icon: string }[] = [
    { value: 'images-to-pdf', name: '图片转 PDF', icon: 'image' },
    { value: 'merge', name: 'PDF 合并', icon: 'plus' },
    { value: 'split', name: 'PDF 拆分', icon: 'scissor' },
    { value: 'compress', name: 'PDF 压缩', icon: 'download' },
  ]

  const taskType = ref<TaskType>('images-to-pdf')
  const queue = ref<QueueItem[]>([])
  const uploading = ref(false)

  // 参数
  const pageSize = ref<'auto' | 'a4'>('auto')
  const orientation = ref<'portrait' | 'landscape'>('portrait')
  const splitRanges = ref('')
  const quality = ref<'low' | 'medium' | 'high'>('medium')

  // 任务状态
  const currentTask = ref<TaskDetail | null>(null)
  const currentResult = ref<ResultView>({})
  let pollTimer: ReturnType<typeof setTimeout> | null = null
  let pollCount = 0
  const MAX_POLL = 60
  const POLL_INTERVAL = 1500

  // 历史
  const history = ref<TaskDetail[]>([])
  const historyLoading = ref(false)

  const isImageType = computed(() => taskType.value === 'images-to-pdf')
  const maxCount = computed(() => (isImageType.value ? 9 : taskType.value === 'merge' ? 20 : 1))

  const fileHint = computed(() => {
    switch (taskType.value) {
      case 'images-to-pdf':
        return '选择图片，最多 9 张'
      case 'merge':
        return '选择至少 2 个 PDF'
      case 'split':
        return '选择 1 个 PDF'
      default:
        return '选择 1 个 PDF'
    }
  })

  const chooseBtnText = computed(() => (isImageType.value ? '选择图片' : '选择 PDF 文件'))

  const submitDisabled = computed(() => {
    if (uploading.value) return true
    if (!queue.value.length) return true
    if (taskType.value === 'merge' && queue.value.length < 2) return true
    return false
  })

  const genId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

  const formatSize = (bytes?: number): string => {
    if (!bytes && bytes !== 0) return ''
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = bytes === 0 ? 0 : Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  const extractExt = (name: string): string => {
    const idx = name.lastIndexOf('.')
    return idx > -1 ? name.slice(idx + 1).toLowerCase() : ''
  }

  const statusText = (s: QueueItem['status']): string =>
    ({ pending: '待上传', uploading: '上传中', done: '已上传', failed: '上传失败' })[s]

  const statusLabel = (s?: string): string =>
    ({ pending: '排队中', processing: '处理中', success: '已完成', failed: '失败' })[s || 'pending'] || s || '排队中'

  const typeName = (t?: string): string =>
    taskTypeOptions.find(o => o.value === t)?.name || t || '任务'

  const checkLogin = (): boolean => {
    if (getToken()) return true
    uni.showModal({
      title: '提示',
      content: '该功能需要登录后使用，是否前往登录？',
      confirmText: '去登录',
      cancelText: '返回',
      success: res => {
        if (res.confirm) {
          uni.navigateTo({
            url: '/pages/mine/login/login?redirectUrl=' + encodeURIComponent('/subPackages/tools/pdf-toolkit/index'),
          })
        }
      },
    })
    return false
  }

  const switchType = (t: TaskType) => {
    if (t === taskType.value) return
    taskType.value = t
    queue.value = []
    resetTask()
  }

  const removeQueueItem = (localId: string) => {
    queue.value = queue.value.filter(i => i.localId !== localId)
  }

  const pushFiles = (files: { name: string; size: number; path: string }[]) => {
    const room = maxCount.value - queue.value.length
    files.slice(0, Math.max(room, 0)).forEach(f => {
      queue.value.push({
        localId: genId(),
        name: f.name,
        size: f.size,
        path: f.path,
        ext: extractExt(f.name),
        status: 'pending',
      })
    })
  }

  const chooseFiles = async () => {
    if (!checkLogin()) return
    resetTask()
    if (isImageType.value) {
      try {
        const res = await uni.chooseImage({
          count: Math.max(maxCount.value - queue.value.length, 1),
          sizeType: ['original'],
        })
        const paths: string[] = Array.isArray(res.tempFilePaths) ? res.tempFilePaths : []
        const rawFiles = (res.tempFiles || []) as { size?: number }[]
        pushFiles(
          paths.map((p, idx) => ({
            name: `image_${idx + 1}.${extractExt(p) || 'jpg'}`,
            size: rawFiles[idx]?.size || 0,
            path: p,
          })),
        )
      } catch (e) {
        handleChooseError(e)
      }
      return
    }

    // PDF 文件
    // #ifdef MP-WEIXIN
    try {
      const res = await uni.chooseMessageFile({ count: maxCount.value, type: 'file', extension: ['pdf'] })
      const files = (res.tempFiles || []) as { name?: string; size?: number; path: string }[]
      const pdfs = files.filter(f => extractExt(f.name || f.path) === 'pdf')
      if (pdfs.length !== files.length) uni.showToast({ title: '仅支持 PDF 文件', icon: 'none' })
      pushFiles(pdfs.map(f => ({ name: f.name || 'document.pdf', size: f.size || 0, path: f.path })))
    } catch (e) {
      handleChooseError(e)
    }
    // #endif

    // #ifdef H5
    try {
      const res = await uni.chooseFile({ count: maxCount.value, extension: ['.pdf'] })
      const files = (res.tempFiles || []) as { name?: string; size?: number; path?: string }[]
      const paths: string[] = Array.isArray(res.tempFilePaths) ? res.tempFilePaths : []
      const mapped = files
        .map((f, idx) => ({ name: f.name || `document_${idx + 1}.pdf`, size: f.size || 0, path: f.path || paths[idx] || '' }))
        .filter(f => f.path && extractExt(f.name) === 'pdf')
      if (mapped.length !== files.length) uni.showToast({ title: '仅支持 PDF 文件', icon: 'none' })
      pushFiles(mapped)
    } catch (e) {
      handleChooseError(e)
    }
    // #endif
  }

  const handleChooseError = (e: unknown) => {
    const msg = (e as { errMsg?: string })?.errMsg || ''
    if (msg.includes('cancel')) return
    uni.showToast({ title: '选择文件失败', icon: 'none' })
  }

  // 将本地文件读为 base64 字符串（填入 Apifox postPdfToolkitFiles 的 file 字段）
  const readFileAsBase64 = (path: string): Promise<string> => {
    // #ifdef MP-WEIXIN
    return new Promise<string>((resolve, reject) => {
      uni.getFileSystemManager().readFile({
        filePath: path,
        encoding: 'base64',
        success: res => resolve(res.data as string),
        fail: err => reject(new Error(err.errMsg || '读取文件失败')),
      })
    })
    // #endif

    // #ifndef MP-WEIXIN
    return fetch(path)
      .then(r => r.blob())
      .then(
        blob =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => {
              const result = String(reader.result || '')
              const comma = result.indexOf(',')
              resolve(comma > -1 ? result.slice(comma + 1) : result)
            }
            reader.onerror = () => reject(new Error('读取文件失败'))
            reader.readAsDataURL(blob)
          }),
      )
    // #endif
  }

  const buildOptions = (): postPdfToolkitTasksBodyOptions | undefined => {
    if (taskType.value === 'images-to-pdf') {
      return { pageSize: pageSize.value, orientation: orientation.value }
    }
    if (taskType.value === 'split') {
      const ranges = splitRanges.value.trim()
      return ranges ? { splitRanges: ranges } : undefined
    }
    if (taskType.value === 'compress') {
      return { quality: quality.value }
    }
    return undefined
  }

  const submit = async () => {
    if (submitDisabled.value) return
    if (!checkLogin()) return

    uploading.value = true
    resetTask()
    try {
      const fileIds: string[] = []
      for (const item of queue.value) {
        if (item.fileId) {
          fileIds.push(item.fileId)
          continue
        }
        item.status = 'uploading'
        try {
          const base64 = await readFileAsBase64(item.path)
          const uploaded = await postPdfToolkitFiles({ file: base64 })
          if (!uploaded?.fileId) throw new Error('上传未返回 fileId')
          item.fileId = uploaded.fileId
          item.status = 'done'
          fileIds.push(uploaded.fileId)
        } catch (err) {
          item.status = 'failed'
          throw err
        }
      }

      const options = buildOptions()
      const created = await postPdfToolkitTasks({
        fileIds,
        type: taskType.value,
        ...(options ? { options } : {}),
      })
      if (!created?.taskId) throw new Error('创建任务失败')

      currentTask.value = { taskId: created.taskId, status: created.status, progress: created.progress, type: taskType.value }
      pollCount = 0
      pollTask(created.taskId)
    } catch (err) {
      uni.showToast({ title: (err as Error)?.message || '任务创建失败', icon: 'none' })
    } finally {
      uploading.value = false
    }
  }

  const pollTask = async (taskId: string) => {
    clearPoll()
    try {
      const detail = await getPdfToolkitTasksTaskId(taskId)
      currentTask.value = detail
      const status = detail.status
      if (status === 'success') {
        currentResult.value = readResult(detail.result)
        return
      }
      if (status === 'failed') return
      if (pollCount >= MAX_POLL) {
        uni.showToast({ title: '任务处理超时，请稍后在历史任务中查看', icon: 'none' })
        return
      }
      pollCount += 1
      pollTimer = setTimeout(() => pollTask(taskId), POLL_INTERVAL)
    } catch {
      // 单次轮询失败也继续重试，直到超时上限
      if (pollCount >= MAX_POLL) return
      pollCount += 1
      pollTimer = setTimeout(() => pollTask(taskId), POLL_INTERVAL)
    }
  }

  const readResult = (raw: unknown): ResultView => {
    if (!raw || typeof raw !== 'object') return {}
    const o = raw as Record<string, unknown>
    return {
      url: typeof o.url === 'string' ? o.url : undefined,
      fileName: typeof o.fileName === 'string' ? o.fileName : typeof o.originalName === 'string' ? o.originalName : undefined,
      size: typeof o.size === 'number' ? o.size : undefined,
    }
  }

  const clearPoll = () => {
    if (pollTimer) {
      clearTimeout(pollTimer)
      pollTimer = null
    }
  }

  const resetTask = () => {
    clearPoll()
    currentTask.value = null
    currentResult.value = {}
  }

  const previewResult = (url?: string) => {
    if (!url) return
    // #ifdef H5
    window.open(url)
    // #endif

    // #ifndef H5
    uni.showLoading({ title: '加载中...' })
    uni.downloadFile({
      url,
      success: res => {
        uni.hideLoading()
        if (res.statusCode === 200 && res.tempFilePath) {
          uni.openDocument({ filePath: res.tempFilePath, fileType: 'pdf', showMenu: true })
        } else {
          uni.showToast({ title: '下载失败', icon: 'none' })
        }
      },
      fail: () => {
        uni.hideLoading()
        uni.showToast({ title: '下载失败', icon: 'none' })
      },
    })
    // #endif
  }

  const copyLink = (url?: string) => {
    if (!url) return
    uni.setClipboardData({ data: url, success: () => uni.showToast({ title: '链接已复制', icon: 'none' }) })
  }

  const asTaskList = (raw: unknown): TaskDetail[] => {
    if (Array.isArray(raw)) return raw as TaskDetail[]
    if (raw && typeof raw === 'object') {
      const o = raw as Record<string, unknown>
      for (const key of ['results', 'list', 'tasks', 'data']) {
        if (Array.isArray(o[key])) return o[key] as TaskDetail[]
      }
    }
    return []
  }

  const loadHistory = async () => {
    if (!getToken()) return
    historyLoading.value = true
    try {
      const res = await getPdfToolkitTasks({ page: 1, pageSize: 10 })
      history.value = asTaskList(res)
    } catch {
      history.value = []
    } finally {
      historyLoading.value = false
    }
  }

  const openHistory = async (task: TaskDetail) => {
    if (!task.taskId) return
    resetTask()
    try {
      const detail = await getPdfToolkitTasksTaskId(task.taskId)
      currentTask.value = detail
      if (detail.status === 'success') currentResult.value = readResult(detail.result)
      else if (detail.status !== 'failed') {
        pollCount = 0
        pollTask(task.taskId)
      }
    } catch {
      uni.showToast({ title: '获取任务详情失败', icon: 'none' })
    }
  }

  onLoad(() => {
    checkLogin()
  })

  onShow(() => {
    reportToolVisit('pdf-toolkit')
    if (getToken()) loadHistory()
  })

  onUnload(() => {
    clearPoll()
  })
</script>

<style scoped lang="scss">
  .pdf-page {
    min-height: 100vh;
    background: var(--theme-bg);
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 24rpx;
    padding: calc(24rpx + var(--nav-height, 120rpx)) 24rpx 24rpx;
  }

  .type-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16rpx;
  }

  .type-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10rpx;
    padding: 24rpx 8rpx;
    border-radius: 16rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text-secondary);

    &.active {
      background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
      color: #fff;
    }
  }

  .type-name {
    font-size: 22rpx;
  }

  .primary-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10rpx;
    width: 100%;
    height: 84rpx;
    border: none;
    border-radius: 16rpx;
    font-size: 28rpx;
    color: #fff;
    background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);

    &:disabled {
      opacity: 0.5;
    }
  }

  .queue {
    margin-top: 20rpx;
    display: flex;
    flex-direction: column;
    gap: 12rpx;
  }

  .queue-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
    padding: 20rpx;
    border-radius: 14rpx;
    background: var(--theme-surface-2);
  }

  .queue-main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6rpx;
  }

  .queue-name {
    font-size: 26rpx;
    color: var(--theme-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .queue-meta {
    font-size: 22rpx;
    color: var(--theme-text-tertiary);
  }

  .queue-actions {
    display: flex;
    align-items: center;
    gap: 16rpx;
  }

  .mini-spinner,
  .status-progress {
    flex-shrink: 0;
  }

  .mini-spinner {
    width: 30rpx;
    height: 30rpx;
    border: 4rpx solid var(--theme-border);
    border-top-color: #f97316;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .param-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20rpx;
    padding: 12rpx 0;

    &.stacked {
      flex-direction: column;
      align-items: stretch;
      gap: 12rpx;
    }
  }

  .param-label {
    font-size: 26rpx;
    color: var(--theme-text);
  }

  .param-tip {
    font-size: 22rpx;
    color: var(--theme-text-tertiary);
  }

  .seg {
    display: flex;
    gap: 8rpx;
    background: var(--theme-surface-2);
    padding: 6rpx;
    border-radius: 12rpx;
  }

  .seg-item {
    padding: 12rpx 24rpx;
    border-radius: 10rpx;
    font-size: 24rpx;
    color: var(--theme-text-secondary);

    &.active {
      background: var(--theme-surface);
      color: #f97316;
      font-weight: 600;
    }
  }

  .text-input {
    height: 76rpx;
    padding: 0 24rpx;
    border-radius: 12rpx;
    background: var(--theme-surface-2);
    font-size: 26rpx;
    color: var(--theme-text);
  }

  .task-status {
    display: flex;
    align-items: center;
    gap: 16rpx;
  }

  .status-badge {
    padding: 6rpx 18rpx;
    border-radius: 999rpx;
    font-size: 22rpx;
    background: var(--theme-surface-2);
    color: var(--theme-text-secondary);
  }

  .badge--processing,
  .badge--pending {
    background: rgba(249, 115, 22, 0.15);
    color: #f97316;
  }

  .badge--success {
    background: rgba(34, 197, 94, 0.15);
    color: #22c55e;
  }

  .badge--failed {
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
  }

  .status-progress {
    font-size: 24rpx;
    color: var(--theme-text-secondary);
  }

  .error-text {
    margin-top: 16rpx;
    font-size: 24rpx;
    color: #ef4444;
  }

  .result-box {
    margin-top: 20rpx;
    padding: 20rpx;
    border-radius: 14rpx;
    background: var(--theme-surface-2);
    display: flex;
    flex-direction: column;
    gap: 10rpx;
  }

  .result-name {
    font-size: 26rpx;
    color: var(--theme-text);
  }

  .result-meta {
    font-size: 22rpx;
    color: var(--theme-text-tertiary);
  }

  .result-actions,
  .history-header {
    display: flex;
    align-items: center;
  }

  .result-actions {
    gap: 16rpx;
    margin-top: 8rpx;
  }

  .history-header {
    justify-content: space-between;
  }

  .refresh-link {
    font-size: 24rpx;
    color: #f97316;
  }

  .mini-btn {
    margin: 0;
    padding: 0 28rpx;
    height: 64rpx;
    line-height: 64rpx;
    font-size: 24rpx;
    border-radius: 999rpx;
    background: var(--theme-surface);
    color: var(--theme-text);
    border: 1rpx solid var(--theme-border);

    &.primary {
      background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
      color: #fff;
      border: none;
    }
  }

  .hint {
    font-size: 24rpx;
    color: var(--theme-text-tertiary);
    padding: 24rpx 0;
    text-align: center;
  }

  .history-list {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
  }

  .history-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
    padding: 20rpx;
    border-radius: 14rpx;
    background: var(--theme-surface-2);
  }

  .history-main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6rpx;
  }

  .history-type {
    font-size: 26rpx;
    color: var(--theme-text);
  }

  .history-id {
    font-size: 20rpx;
    color: var(--theme-text-tertiary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .bottom-bar {
    padding: 16rpx 24rpx calc(16rpx + env(safe-area-inset-bottom));
  }

  .submit-btn {
    width: 100%;
    height: 88rpx;
    border: none;
    border-radius: 999rpx;
    font-size: 30rpx;
    font-weight: 700;
    color: #fff;
    background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);

    &:disabled {
      opacity: 0.5;
    }
  }
</style>
