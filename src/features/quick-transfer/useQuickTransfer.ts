import { computed, onBeforeUnmount, ref } from 'vue'
import { cancelQuickTransfer, completeQuickTransfer, createQuickTransfer, getQuickTransferStatus, resolveQuickTransfer } from './api'
import { QUICK_TRANSFER_POLL_INTERVAL } from './constants'
import { getQuickTransferErrorMessage, toQuickTransferErrorInfo } from './errors'
import {
  canTransitionQuickTransferSendState,
  formatQuickTransferCountdown,
  isQuickTransferDownloadValid,
  isQuickTransferTerminalStatus,
} from './helpers'
import type {
  QuickTransferCreatePayload,
  QuickTransferDownloadDescriptor,
  QuickTransferErrorInfo,
  QuickTransferReceiveState,
  QuickTransferResolvedResult,
  QuickTransferSendState,
  QuickTransferStatus,
} from './types'
import type { SelectedFile } from '@/platform/file'
import { downloadFileDirect, uploadFileDirect } from '@/platform/file'

export const useQuickTransfer = () => {
  const sendState = ref<QuickTransferSendState>('idle')
  const receiveState = ref<QuickTransferReceiveState>('idle')
  const sendError = ref<QuickTransferErrorInfo | null>(null)
  const receiveError = ref<QuickTransferErrorInfo | null>(null)
  const transferId = ref('')
  const code = ref('')
  const shareToken = ref('')
  const expiresAt = ref('')
  const sendType = ref<QuickTransferCreatePayload['type']>('file')
  const uploadProgress = ref<number | null>(null)
  const senderStatus = ref<QuickTransferStatus | null>(null)
  const receivedResult = ref<QuickTransferResolvedResult | null>(null)
  const downloadDescriptor = ref<QuickTransferDownloadDescriptor | null>(null)
  const countdown = ref('')
  const isActionRunning = ref(false)
  const isDownloading = ref(false)
  const canRetryComplete = computed(() => Boolean(sendError.value?.canRetryComplete && transferId.value))

  let pollTimer: ReturnType<typeof setInterval> | null = null
  let countdownTimer: ReturnType<typeof setInterval> | null = null
  let uploadAbort: (() => void) | null = null

  const clearPollTimer = () => {
    if (pollTimer) clearInterval(pollTimer)
    pollTimer = null
  }

  const clearCountdownTimer = () => {
    if (countdownTimer) clearInterval(countdownTimer)
    countdownTimer = null
  }

  const clearTimers = () => {
    clearPollTimer()
    clearCountdownTimer()
  }

  const updateCountdown = () => {
    if (!expiresAt.value) {
      countdown.value = ''
      return
    }
    countdown.value = formatQuickTransferCountdown(expiresAt.value)
    if (countdown.value === '00:00') {
      clearCountdownTimer()
      if (sendState.value === 'ready') sendState.value = 'expired'
    }
  }

  const startCountdown = () => {
    clearCountdownTimer()
    updateCountdown()
    countdownTimer = setInterval(updateCountdown, 1000)
  }

  const applySenderStatus = (status: QuickTransferStatus) => {
    senderStatus.value = status
    if (status === 'consumed' && canTransitionQuickTransferSendState(sendState.value, 'consumed')) sendState.value = 'consumed'
    if (status === 'expired' && canTransitionQuickTransferSendState(sendState.value, 'expired')) sendState.value = 'expired'
    if (status === 'cancelled' || status === 'deleted') {
      if (canTransitionQuickTransferSendState(sendState.value, 'cancelled')) sendState.value = 'cancelled'
      clearTimers()
    }
    if (isQuickTransferTerminalStatus(status)) clearPollTimer()
  }

  const pollSenderStatus = async () => {
    if (!transferId.value || sendState.value !== 'ready') return
    try {
      const status = await getQuickTransferStatus(transferId.value)
      applySenderStatus(status.status)
    } catch (error) {
      sendError.value = toQuickTransferErrorInfo(error, '状态暂时无法刷新，稍后将继续重试')
    }
  }

  const startPolling = () => {
    clearPollTimer()
    void pollSenderStatus()
    pollTimer = setInterval(() => void pollSenderStatus(), QUICK_TRANSFER_POLL_INTERVAL)
  }

  const resetSendResult = () => {
    clearTimers()
    uploadAbort?.()
    uploadAbort = null
    sendState.value = 'idle'
    sendError.value = null
    transferId.value = ''
    code.value = ''
    shareToken.value = ''
    expiresAt.value = ''
    sendType.value = 'file'
    uploadProgress.value = null
    senderStatus.value = null
    countdown.value = ''
  }

  const complete = async () => {
    if (!transferId.value || isActionRunning.value) return false
    isActionRunning.value = true
    sendError.value = null
    sendState.value = 'completing'
    try {
      const result = await completeQuickTransfer(transferId.value)
      applySenderStatus(result.status)
      if (result.status !== 'ready') {
        const errorInfo: QuickTransferErrorInfo = {
          code: 'TRANSFER_OBJECT_NOT_FOUND',
          message: '尚未检测到上传文件，请稍后重试',
          canRetryComplete: true,
        }
        sendError.value = errorInfo
        sendState.value = 'error'
        return false
      }
      sendState.value = 'ready'
      startCountdown()
      startPolling()
      return true
    } catch (error) {
      const errorInfo = toQuickTransferErrorInfo(error)
      sendError.value = errorInfo
      sendState.value = 'error'
      return false
    } finally {
      isActionRunning.value = false
    }
  }

  const send = async (payload: QuickTransferCreatePayload, file?: SelectedFile): Promise<boolean> => {
    if (
      isActionRunning.value ||
      sendState.value === 'ready' ||
      sendState.value === 'uploading' ||
      sendState.value === 'completing' ||
      (Boolean(transferId.value) && (sendState.value === 'error' || sendState.value === 'cancelled'))
    ) {
      return false
    }
    isActionRunning.value = true
    sendError.value = null
    sendType.value = payload.type
    uploadProgress.value = null
    sendState.value = 'creating'
    try {
      const created = await createQuickTransfer(payload)
      transferId.value = created.transferId
      code.value = created.code
      shareToken.value = created.shareToken
      expiresAt.value = created.expiresAt

      if (payload.type === 'file') {
        if (!file || !created.upload) throw new Error('文件上传信息不可用，请重新发送')
        sendState.value = 'uploading'
        const uploadTask = uploadFileDirect({
          file,
          url: created.upload.url,
          fileField: created.upload.fileField,
          fields: created.upload.fields,
          onProgress: progress => {
            uploadProgress.value = progress
          },
        })
        uploadAbort = uploadTask.abort
        const uploadResult = await uploadTask.promise
        if (uploadResult.statusCode !== created.upload.successStatus) {
          throw new Error('文件上传未成功，请重试')
        }
        uploadAbort = null
        isActionRunning.value = false
        return await complete()
      }

      sendState.value = 'ready'
      startCountdown()
      startPolling()
      return true
    } catch (error) {
      const errorInfo = toQuickTransferErrorInfo(error, getQuickTransferErrorMessage(error))
      sendError.value = errorInfo
      if ((sendState.value as QuickTransferSendState) !== 'cancelled') sendState.value = 'error'
      return false
    } finally {
      isActionRunning.value = false
    }
  }

  const cancel = async (): Promise<boolean> => {
    if (!transferId.value || (isActionRunning.value && sendState.value === 'creating')) return false
    isActionRunning.value = true
    uploadAbort?.()
    uploadAbort = null
    clearTimers()
    try {
      await cancelQuickTransfer(transferId.value)
      sendState.value = 'cancelled'
      senderStatus.value = 'cancelled'
      return true
    } catch (error) {
      sendError.value = toQuickTransferErrorInfo(error, '取消失败，请稍后重试')
      return false
    } finally {
      isActionRunning.value = false
    }
  }

  const receive = async (input: { code?: string; shareToken?: string }): Promise<boolean> => {
    if (isActionRunning.value || receiveState.value === 'resolving') return false
    isActionRunning.value = true
    receiveState.value = 'resolving'
    receiveError.value = null
    try {
      const result = await resolveQuickTransfer(input)
      receivedResult.value = result
      downloadDescriptor.value = result.download || null
      receiveState.value = 'received'
      if (result.type === 'file') void downloadReceivedFile()
      return true
    } catch (error) {
      receiveError.value = toQuickTransferErrorInfo(error, '提取码无效或内容已失效')
      receiveState.value = 'error'
      return false
    } finally {
      isActionRunning.value = false
    }
  }

  const downloadReceivedFile = async (): Promise<boolean> => {
    const result = receivedResult.value
    const download = downloadDescriptor.value
    if (!result?.file || !download) {
      receiveError.value = { code: 'DOWNLOAD_NOT_AVAILABLE', message: '下载信息不可用，请联系发送方重新发送' }
      return false
    }
    if (!isQuickTransferDownloadValid(download.expiresAt)) {
      receiveError.value = { code: 'DOWNLOAD_EXPIRED', message: '下载链接已失效，无法再次领取' }
      return false
    }
    if (isDownloading.value) return false
    isDownloading.value = true
    const success = await downloadFileDirect({ url: download.url, fileName: result.file.name, mimeType: result.file.mimeType })
    isDownloading.value = false
    if (!success) receiveError.value = { code: 'DOWNLOAD_FAILED', message: '文件下载失败，请稍后重试' }
    return success
  }

  const pauseTimers = () => {
    clearTimers()
  }

  const resumeTimers = () => {
    if (sendState.value !== 'ready') return
    startCountdown()
    startPolling()
  }

  onBeforeUnmount(() => {
    clearTimers()
    uploadAbort?.()
  })

  return {
    sendState,
    receiveState,
    sendError,
    receiveError,
    transferId,
    code,
    shareToken,
    expiresAt,
    sendType,
    uploadProgress,
    senderStatus,
    receivedResult,
    downloadDescriptor,
    countdown,
    isActionRunning,
    isDownloading,
    canRetryComplete,
    send,
    complete,
    cancel,
    receive,
    downloadReceivedFile,
    resetSendResult,
    pauseTimers,
    resumeTimers,
  }
}
