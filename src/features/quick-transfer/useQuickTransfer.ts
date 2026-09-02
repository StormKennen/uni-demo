import { computed, onBeforeUnmount, ref } from 'vue'
import {
  accessQuickTransferFile,
  cancelQuickTransfer,
  completeQuickTransferFile,
  createQuickTransfer,
  getQuickTransferStatus,
  inspectQuickTransferShare,
  refreshQuickTransferUploadPolicy,
  resolveQuickTransfer,
} from './api'
import { QUICK_TRANSFER_POLL_INTERVAL, QUICK_TRANSFER_UPLOAD_CONCURRENCY } from './constants'
import {
  canTransitionQuickTransferSendState,
  formatQuickTransferCountdown,
  getFinalQuickTransferDisplayName,
  hasQuickShipPayload,
  isQuickTransferDownloadValid,
  isQuickTransferTerminalStatus,
  isValidQuickTransferTitle,
  normalizeQuickTransferTitle,
  validateQuickTransferFiles,
} from './helpers'
import {
  getQuickTransferErrorCode,
  getQuickTransferErrorMessage,
  isQuickTransferClaimResultUnknown,
  toQuickTransferErrorInfo,
  toQuickTransferReceiveErrorInfo,
} from './errors'
import type {
  QuickShipDraft,
  QuickShipFileDraft,
  QuickTransferCreatePayload,
  QuickTransferErrorInfo,
  QuickTransferFileAccessResult,
  QuickTransferInspectResult,
  QuickTransferReceiveState,
  QuickTransferReceiveInput,
  QuickTransferResolvedResult,
  QuickTransferSendState,
  QuickTransferSendResultContext,
  QuickTransferStatusResult,
  QuickTransferStatus,
  QuickTransferUploadDescriptor,
} from './types'
import { createQuickTransferClaimRequestId } from './requestId'
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
  const uploadProgress = ref<number | null>(null)
  const senderStatus = ref<QuickTransferStatusResult | null>(null)
  const uploadDescriptors = ref<Record<string, QuickTransferUploadDescriptor>>({})
  const receivedResult = ref<QuickTransferResolvedResult | null>(null)
  const claimToken = ref('')
  const activeClaimRequestId = ref<string | null>(null)
  const activeClaimInputKey = ref('')
  const inspectResult = ref<QuickTransferInspectResult | null>(null)
  const resolvedTitle = ref('')
  const countdown = ref('')
  const isActionRunning = ref(false)
  const isDownloading = ref(false)
  const canRetryComplete = computed(() => Boolean(sendError.value?.canRetryComplete && transferId.value))
  const canRetryUpload = computed(() => Boolean(sendError.value?.canRetryUpload && transferId.value))

  let pollTimer: ReturnType<typeof setInterval> | null = null
  let countdownTimer: ReturnType<typeof setInterval> | null = null
  const uploadAborts = new Map<string, () => void>()

  const createUploadError = (message: string, code = 'UPLOAD_FAILED'): Error & { code: string } =>
    Object.assign(new Error(message), { code })

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

  const abortUploads = () => {
    uploadAborts.forEach(abort => abort())
    uploadAborts.clear()
  }

  const updateCountdown = () => {
    if (!expiresAt.value) {
      countdown.value = ''
      return
    }
    countdown.value = formatQuickTransferCountdown(expiresAt.value)
    if (countdown.value === '00:00') {
      clearCountdownTimer()
      clearPollTimer()
      if (sendState.value === 'ready') sendState.value = 'expired'
    }
  }

  const startCountdown = () => {
    clearCountdownTimer()
    updateCountdown()
    countdownTimer = setInterval(updateCountdown, 1000)
  }

  const applySenderStatus = (result: QuickTransferStatusResult) => {
    senderStatus.value = result
    if (result.status === 'consumed' && canTransitionQuickTransferSendState(sendState.value, 'consumed')) {
      sendState.value = 'consumed'
      clearCountdownTimer()
    }
    if (result.status === 'expired' && canTransitionQuickTransferSendState(sendState.value, 'expired')) {
      sendState.value = 'expired'
      clearCountdownTimer()
    }
    if (result.status === 'cancelled' || result.status === 'deleted') {
      if (canTransitionQuickTransferSendState(sendState.value, 'cancelled')) sendState.value = 'cancelled'
      clearTimers()
    }
    if (isQuickTransferTerminalStatus(result.status)) clearPollTimer()
  }

  const pollSenderStatus = async () => {
    if (!transferId.value || sendState.value !== 'ready') return
    try {
      applySenderStatus(await getQuickTransferStatus(transferId.value, senderStatus.value?.maxClaims))
    } catch (error) {
      sendError.value = toQuickTransferErrorInfo(error, '状态暂时无法刷新，稍后将继续重试')
    }
  }

  const startPolling = () => {
    clearPollTimer()
    void pollSenderStatus()
    pollTimer = setInterval(() => void pollSenderStatus(), QUICK_TRANSFER_POLL_INTERVAL)
  }

  const updateOverallProgress = (files: QuickShipFileDraft[]) => {
    if (!files.length) {
      uploadProgress.value = null
      return
    }
    const total = files.reduce((sum, file) => sum + (file.uploadState === 'ready' ? 100 : file.progress || 0), 0)
    uploadProgress.value = Math.round(total / files.length)
  }

  const completeFile = async (file: QuickShipFileDraft): Promise<QuickTransferStatusResult> => {
    if (!transferId.value || !file.serverFileId) throw createUploadError('文件校验信息不可用，请重新准备飞船', 'TRANSFER_FILE_NOT_FOUND')
    const previousState = file.uploadState
    file.uploadState = 'completing'
    try {
      const result = await completeQuickTransferFile(transferId.value, file.serverFileId, expiresAt.value)
      file.uploadState = 'ready'
      file.progress = 100
      file.error = undefined
      file.errorCode = undefined
      return result
    } catch (error) {
      if (getQuickTransferErrorCode(error) === 'TRANSFER_FILE_ALREADY_READY') {
        file.uploadState = 'ready'
        file.progress = 100
        file.error = undefined
        file.errorCode = undefined
        return (
          senderStatus.value || {
            transferId: transferId.value,
            status: 'uploading',
            claimCount: 0,
            maxClaims: 1,
            expiresAt: expiresAt.value,
          }
        )
      }
      file.uploadState = previousState === 'ready' ? 'ready' : 'uploaded'
      file.error = getQuickTransferErrorMessage(error, `${getFinalQuickTransferDisplayName(file)} 校验失败，请重新校验`)
      file.errorCode = getQuickTransferErrorCode(error) || 'COMPLETE_FAILED'
      throw error
    }
  }

  const uploadOneFile = async (file: QuickShipFileDraft, descriptor: QuickTransferUploadDescriptor, files: QuickShipFileDraft[]) => {
    const selectedFile: SelectedFile | undefined = file.selectedFile
    if (!selectedFile) throw createUploadError(`${getFinalQuickTransferDisplayName(file)} 的本地文件不可用，请重新选择`)
    file.uploadState = 'uploading'
    file.progress = 0
    file.error = undefined
    file.errorCode = undefined
    const uploadTask = uploadFileDirect({
      file: selectedFile,
      url: descriptor.url,
      fileField: descriptor.fileField,
      fields: descriptor.fields,
      onProgress: progress => {
        file.progress = progress ?? undefined
        updateOverallProgress(files)
      },
    })
    uploadAborts.set(file.clientFileId, uploadTask.abort)
    let completeAttempted = false
    try {
      const uploadResult = await uploadTask.promise
      if (uploadResult.statusCode !== descriptor.successStatus)
        throw createUploadError(`${getFinalQuickTransferDisplayName(file)} 上传未成功，请重试`)
      file.uploadState = 'uploaded'
      file.progress = 100
      updateOverallProgress(files)
      completeAttempted = true
      await completeFile(file)
      updateOverallProgress(files)
    } catch (error) {
      if (!completeAttempted) {
        file.uploadState = 'error'
        file.errorCode = getQuickTransferErrorCode(error) || 'UPLOAD_FAILED'
      }
      file.error = getQuickTransferErrorMessage(error, `${getFinalQuickTransferDisplayName(file)} 上传失败，请重试`)
      throw error
    } finally {
      uploadAborts.delete(file.clientFileId)
    }
  }

  const uploadFiles = async (draft: QuickShipDraft, files: QuickShipFileDraft[]) => {
    let cursor = 0
    const errors: unknown[] = []
    const worker = async () => {
      while (cursor < files.length) {
        const index = cursor
        cursor += 1
        const file = files[index]
        if (!file) return
        const descriptor = uploadDescriptors.value[file.clientFileId]
        if (!descriptor) {
          const error = createUploadError(
            `${getFinalQuickTransferDisplayName(file)} 的上传凭证不可用，请重新准备飞船`,
            'TRANSFER_UPLOAD_NOT_AVAILABLE',
          )
          file.uploadState = 'error'
          file.error = getQuickTransferErrorMessage(error)
          file.errorCode = 'TRANSFER_UPLOAD_NOT_AVAILABLE'
          errors.push(error)
          continue
        }
        try {
          await uploadOneFile(file, descriptor, draft.files)
        } catch (error) {
          errors.push(error)
        }
      }
    }
    await Promise.all(Array.from({ length: Math.min(QUICK_TRANSFER_UPLOAD_CONCURRENCY, files.length) }, () => worker()))
    if (errors.length) throw errors[0]
  }

  const getCompleteCandidates = (draft: QuickShipDraft): QuickShipFileDraft[] =>
    draft.files.filter(file => file.uploadState === 'uploaded' || file.uploadState === 'completing' || file.uploadState === 'ready')

  const getUploadErrors = (draft: QuickShipDraft): QuickShipFileDraft[] => draft.files.filter(file => file.uploadState === 'error')

  const getUnfinishedFiles = (draft: QuickShipDraft): QuickShipFileDraft[] =>
    draft.files.filter(file => file.uploadState === 'pending' || file.uploadState === 'uploading')

  const isRetryableUploadError = (file: QuickShipFileDraft): boolean =>
    ['TRANSFER_UPLOAD_NOT_AVAILABLE', 'UPLOAD_FAILED', 'DIRECT_UPLOAD_FAILED', 'DIRECT_UPLOAD_ABORTED'].includes(file.errorCode || '')

  const setRecoveryError = (draft: QuickShipDraft, fallback: string, error?: unknown): void => {
    const uploadErrors = getUploadErrors(draft)
    const retryableUploadErrors = uploadErrors.filter(file => Boolean(file.serverFileId) && isRetryableUploadError(file))
    const completeCandidates = getCompleteCandidates(draft).filter(file => file.uploadState !== 'ready')
    const unfinishedFiles = getUnfinishedFiles(draft)
    const info = toQuickTransferErrorInfo(error, fallback)
    sendError.value = {
      ...info,
      canRetryUpload: Boolean(retryableUploadErrors.length || (info.canRetryUpload && !uploadErrors.length)),
      canRetryComplete: Boolean(info.canRetryComplete || completeCandidates.length),
    }
    if (unfinishedFiles.length) {
      sendError.value = {
        ...sendError.value,
        code: sendError.value.code || 'UPLOAD_INCOMPLETE',
        message: sendError.value.message || '仍有文件尚未完成上传，请重试',
        canRetryUpload: Boolean(retryableUploadErrors.length),
      }
    }
    sendState.value = 'error'
  }

  const reconcileUploadState = async (draft: QuickShipDraft): Promise<boolean> => {
    if (getUploadErrors(draft).length || getUnfinishedFiles(draft).length) {
      setRecoveryError(draft, '仍有文件未完成，请先处理失败文件')
      return false
    }
    if (getCompleteCandidates(draft).some(file => file.uploadState !== 'ready')) {
      setRecoveryError(draft, '文件已上传，但仍有内容需要重新校验')
      return false
    }
    return finalizeReady(draft)
  }

  const finalizeReady = async (draft: QuickShipDraft): Promise<boolean> => {
    const result = await getQuickTransferStatus(transferId.value, draft.maxClaims)
    applySenderStatus(result)
    if (result.status !== 'ready') {
      sendError.value = {
        code: 'UPLOAD_PROBE_TEMPORARILY_UNAVAILABLE',
        message: '文件已上传，但服务端暂时无法完成校验',
        canRetryComplete: true,
      }
      sendState.value = 'error'
      return false
    }
    sendState.value = 'ready'
    startCountdown()
    startPolling()
    return true
  }

  const initializeSendResult = (context: QuickTransferSendResultContext): void => {
    clearTimers()
    abortUploads()
    sendError.value = null
    uploadProgress.value = null
    uploadDescriptors.value = {}
    transferId.value = context.transferId
    resolvedTitle.value = context.title
    code.value = context.code
    shareToken.value = context.shareToken
    expiresAt.value = context.expiresAt
    senderStatus.value = {
      transferId: context.transferId,
      status: context.status,
      claimCount: context.claimCount,
      maxClaims: context.maxClaims,
      expiresAt: context.expiresAt,
    }
    const stateByStatus: Record<QuickTransferStatus, QuickTransferSendState> = {
      uploading: 'uploading',
      ready: 'ready',
      consumed: 'consumed',
      expired: 'expired',
      cancelled: 'cancelled',
      deleting: 'cancelled',
      deleted: 'cancelled',
    }
    sendState.value = stateByStatus[context.status]
    if (sendState.value === 'ready') {
      startCountdown()
      startPolling()
    }
  }

  const resetSendResult = (draft?: QuickShipDraft) => {
    clearTimers()
    abortUploads()
    sendState.value = 'idle'
    sendError.value = null
    transferId.value = ''
    resolvedTitle.value = ''
    code.value = ''
    shareToken.value = ''
    expiresAt.value = ''
    uploadDescriptors.value = {}
    uploadProgress.value = null
    senderStatus.value = null
    countdown.value = ''
    if (draft) {
      draft.title = ''
      draft.text = ''
      draft.links.splice(0)
      draft.files.splice(0)
      draft.references.splice(0)
    }
  }

  const send = async (draft: QuickShipDraft): Promise<boolean> => {
    if (isActionRunning.value || sendState.value === 'ready' || ['uploading', 'completing'].includes(sendState.value)) return false
    if (sendState.value === 'error' && transferId.value) return false
    if (!isValidQuickTransferTitle(draft.title)) {
      sendError.value = {
        code: 'INVALID_TITLE',
        message: '标题最多 40 个字符',
      }
      return false
    }
    if (!hasQuickShipPayload(draft)) {
      sendError.value = { code: 'EMPTY_PAYLOAD', message: '请至少填写标题或添加一项飞船内容' }
      return false
    }
    const fileError = validateQuickTransferFiles(draft.files)
    if (fileError) {
      sendError.value = { code: 'FILE_LIMIT_EXCEEDED', message: fileError }
      return false
    }
    isActionRunning.value = true
    sendError.value = null
    sendState.value = 'creating'
    const payload: QuickTransferCreatePayload = {
      ...(normalizeQuickTransferTitle(draft.title) ? { title: normalizeQuickTransferTitle(draft.title) } : {}),
      content: {
        text: draft.text.trim() || undefined,
        links: draft.links.map(link => ({ title: link.title.trim() || undefined, url: link.url.trim() })),
        files: draft.files.map(file => ({
          clientFileId: file.clientFileId,
          name: file.name,
          displayName: getFinalQuickTransferDisplayName(file),
          size: file.size,
          mimeType: file.mimeType,
        })),
        references: draft.references.map(reference => ({
          type: reference.type,
          resourceId: reference.resourceId,
          params: reference.params,
          title: reference.title.trim(),
          subtitle: reference.subtitle?.trim() || undefined,
        })),
      },
      expiresIn: draft.expiresIn,
      maxClaims: draft.maxClaims,
    }
    try {
      const created = await createQuickTransfer(payload)
      transferId.value = created.transferId
      resolvedTitle.value = created.title
      code.value = created.code
      shareToken.value = created.shareToken
      expiresAt.value = created.expiresAt
      senderStatus.value = {
        claimCount: created.claimCount,
        transferId: created.transferId,
        status: created.status,
        maxClaims: created.maxClaims,
        expiresAt: created.expiresAt,
      }
      uploadDescriptors.value = Object.fromEntries(created.uploads.map(upload => [upload.clientFileId, upload]))
      draft.files.forEach(file => {
        const descriptor = uploadDescriptors.value[file.clientFileId]
        file.serverFileId = descriptor?.fileId
        file.uploadState = descriptor ? 'pending' : 'error'
        file.progress = descriptor ? 0 : undefined
        file.error = descriptor ? undefined : `${getFinalQuickTransferDisplayName(file)} 的上传凭证不可用，请重新准备飞船`
        file.errorCode = descriptor ? undefined : 'TRANSFER_UPLOAD_NOT_AVAILABLE'
      })
      if (!draft.files.length) {
        sendState.value = 'ready'
        startCountdown()
        startPolling()
        return true
      }
      const pendingFiles = draft.files.filter(file => Boolean(uploadDescriptors.value[file.clientFileId]))
      if (pendingFiles.length !== draft.files.length)
        throw createUploadError('部分文件没有获得上传凭证，请重新准备飞船', 'TRANSFER_UPLOAD_NOT_AVAILABLE')
      sendState.value = 'uploading'
      await uploadFiles(draft, pendingFiles)
      sendState.value = 'completing'
      return await finalizeReady(draft)
    } catch (error) {
      setRecoveryError(draft, getQuickTransferErrorMessage(error), error)
      return false
    } finally {
      isActionRunning.value = false
    }
  }

  const retryUpload = async (draft: QuickShipDraft): Promise<boolean> => {
    const files = getUploadErrors(draft)
    if (!files.length || !transferId.value || isActionRunning.value) return false
    isActionRunning.value = true
    sendError.value = null
    sendState.value = 'uploading'
    let cursor = 0
    const errors: unknown[] = []
    const worker = async () => {
      while (cursor < files.length) {
        const index = cursor
        cursor += 1
        const file = files[index]
        if (!file) return
        try {
          if (!file.serverFileId)
            throw createUploadError(`${getFinalQuickTransferDisplayName(file)} 的上传信息不可用，请重新准备飞船`, 'TRANSFER_FILE_NOT_FOUND')
          const descriptor = await refreshQuickTransferUploadPolicy(transferId.value, file.serverFileId, file.clientFileId)
          uploadDescriptors.value = { ...uploadDescriptors.value, [file.clientFileId]: descriptor }
          file.uploadState = 'pending'
          await uploadOneFile(file, descriptor, draft.files)
        } catch (error) {
          file.uploadState = 'error'
          file.error = getQuickTransferErrorMessage(error, `${getFinalQuickTransferDisplayName(file)} 上传失败，请重试`)
          file.errorCode = getQuickTransferErrorCode(error) || 'UPLOAD_FAILED'
          errors.push(error)
        }
      }
    }
    try {
      await Promise.all(Array.from({ length: Math.min(QUICK_TRANSFER_UPLOAD_CONCURRENCY, files.length) }, () => worker()))
      if (errors.length || getUploadErrors(draft).length) {
        setRecoveryError(draft, '文件上传失败，请重试', errors[0])
        return false
      }
      sendState.value = 'completing'
      return await reconcileUploadState(draft)
    } catch (error) {
      setRecoveryError(draft, '文件上传失败，请重试', error)
      return false
    } finally {
      isActionRunning.value = false
    }
  }

  const retryComplete = async (draft: QuickShipDraft): Promise<boolean> => {
    if (!transferId.value || isActionRunning.value) return false
    isActionRunning.value = true
    sendError.value = null
    sendState.value = 'completing'
    const pendingFiles = getCompleteCandidates(draft).filter(file => Boolean(file.serverFileId))
    if (!pendingFiles.length) {
      isActionRunning.value = false
      return reconcileUploadState(draft)
    }
    let cursor = 0
    const errors: unknown[] = []
    const worker = async () => {
      while (cursor < pendingFiles.length) {
        const index = cursor
        cursor += 1
        const file = pendingFiles[index]
        if (!file) return
        try {
          await completeFile(file)
        } catch (error) {
          errors.push(error)
        }
      }
    }
    try {
      await Promise.all(Array.from({ length: Math.min(QUICK_TRANSFER_UPLOAD_CONCURRENCY, pendingFiles.length) }, () => worker()))
      if (errors.length) {
        setRecoveryError(draft, '文件校验暂时失败，请重新校验', errors[0])
        return false
      }
      return await reconcileUploadState(draft)
    } catch (error) {
      setRecoveryError(draft, '文件校验暂时失败，请重新校验', error)
      return false
    } finally {
      isActionRunning.value = false
    }
  }

  const cancel = async (): Promise<boolean> => {
    if (!transferId.value || isActionRunning.value) return false
    isActionRunning.value = true
    abortUploads()
    clearTimers()
    try {
      applySenderStatus(await cancelQuickTransfer(transferId.value, senderStatus.value?.maxClaims))
      return true
    } catch (error) {
      sendError.value = toQuickTransferErrorInfo(error, '召回失败，请稍后重试')
      return false
    } finally {
      isActionRunning.value = false
    }
  }

  const inspectShare = async (share: string): Promise<boolean> => {
    if (!share || isActionRunning.value) return false
    isActionRunning.value = true
    receiveState.value = 'inspecting'
    receiveError.value = null
    try {
      inspectResult.value = await inspectQuickTransferShare(share)
      receiveState.value = 'idle'
      return true
    } catch (error) {
      inspectResult.value = null
      receiveError.value = toQuickTransferReceiveErrorInfo(error)
      receiveState.value = 'error'
      return false
    } finally {
      isActionRunning.value = false
    }
  }

  const receive = async (input: QuickTransferReceiveInput): Promise<boolean> => {
    if (isActionRunning.value || receiveState.value === 'resolving') return false
    const inputKey = input.shareToken ? `share:${input.shareToken}` : `code:${input.code || ''}`
    if (!activeClaimRequestId.value || activeClaimInputKey.value !== inputKey) {
      activeClaimRequestId.value = createQuickTransferClaimRequestId()
      activeClaimInputKey.value = inputKey
    }
    isActionRunning.value = true
    receiveState.value = 'resolving'
    receiveError.value = null
    receivedResult.value = null
    claimToken.value = ''
    try {
      const result = await resolveQuickTransfer({ ...input, claimRequestId: activeClaimRequestId.value || undefined })
      receivedResult.value = result
      claimToken.value = result.claimToken || ''
      activeClaimRequestId.value = null
      activeClaimInputKey.value = ''
      receiveState.value = 'received'
      return true
    } catch (error) {
      const errorInfo = toQuickTransferReceiveErrorInfo(error)
      if (errorInfo.code === 'TRANSFER_NOT_AVAILABLE' || errorInfo.code === 'TRANSFER_NOT_FOUND') inspectResult.value = null
      if (!isQuickTransferClaimResultUnknown(error)) {
        activeClaimRequestId.value = null
        activeClaimInputKey.value = ''
      }
      receiveError.value = errorInfo
      receiveState.value = 'error'
      return false
    } finally {
      isActionRunning.value = false
    }
  }

  const resetReceive = () => {
    receiveState.value = 'idle'
    receiveError.value = null
    receivedResult.value = null
    claimToken.value = ''
    inspectResult.value = null
  }

  const clearReceiveError = () => {
    receiveError.value = null
  }

  const getReceivedFileAccess = async (fileId: string): Promise<QuickTransferFileAccessResult | null> => {
    const file = receivedResult.value?.content.files.find(item => item.fileId === fileId)
    if (!file || file.available === false || !claimToken.value || !fileId) return null
    try {
      return await accessQuickTransferFile(receivedResult.value.transferId, fileId, claimToken.value)
    } catch (error) {
      receiveError.value = toQuickTransferReceiveErrorInfo(error)
      return null
    }
  }

  const downloadReceivedFile = async (fileId: string): Promise<boolean> => {
    const file = receivedResult.value?.content.files.find(item => item.fileId === fileId)
    if (!file || isDownloading.value) return false
    isDownloading.value = true
    const access = await getReceivedFileAccess(fileId)
    if (!access || !isQuickTransferDownloadValid(access.expiresAt)) {
      isDownloading.value = false
      if (!access) receiveError.value ||= { code: 'DOWNLOAD_NOT_AVAILABLE', message: '文件访问凭证已失效' }
      return false
    }
    const success = await downloadFileDirect({ url: access.url, fileName: file.displayName, mimeType: file.mimeType })
    isDownloading.value = false
    if (!success) receiveError.value = { code: 'DOWNLOAD_FAILED', message: '文件打开失败，请稍后重试' }
    return success
  }

  const pauseTimers = () => clearTimers()

  const resumeTimers = () => {
    if (sendState.value !== 'ready') return
    startCountdown()
    startPolling()
  }

  onBeforeUnmount(() => {
    clearTimers()
    abortUploads()
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
    uploadProgress,
    senderStatus,
    uploadDescriptors,
    receivedResult,
    resolvedTitle,
    claimToken,
    activeClaimRequestId,
    inspectResult,
    countdown,
    isActionRunning,
    isDownloading,
    canRetryComplete,
    canRetryUpload,
    initializeSendResult,
    send,
    retryUpload,
    retryComplete,
    cancel,
    inspectShare,
    receive,
    resetReceive,
    clearReceiveError,
    getReceivedFileAccess,
    downloadReceivedFile,
    resetSendResult,
    pauseTimers,
    resumeTimers,
  }
}
