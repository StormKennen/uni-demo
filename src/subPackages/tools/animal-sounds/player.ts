import { reactive } from 'vue'
import { getPlayUrl, type SignedPlayUrl } from './api'

type PlayerStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'stopped' | 'ended' | 'error'
type AudioContext = ReturnType<typeof uni.createInnerAudioContext>
type PlayListener = Parameters<AudioContext['onPlay']>[0]
type PauseListener = Parameters<AudioContext['onPause']>[0]
type EndedListener = Parameters<AudioContext['onEnded']>[0]
type ErrorListener = Parameters<AudioContext['onError']>[0]
type TimeUpdateListener = Parameters<AudioContext['onTimeUpdate']>[0]

export const playerState = reactive({
  soundId: '',
  animalId: '',
  status: 'idle' as PlayerStatus,
  currentTime: 0,
  duration: 0,
  currentPlayUrl: '',
  expiresAt: '',
  errorMessage: '',
})

let audioContext: AudioContext | null = null
let requestSequence = 0
let activeSession = 0
let retryUsed = false
const signedUrlCache = new Map<string, SignedPlayUrl>()
const EARLY_REFRESH_MS = 30_000
let listeners: {
  play?: PlayListener
  pause?: PauseListener
  ended?: EndedListener
  error?: ErrorListener
  timeUpdate?: TimeUpdateListener
} = {}

const ensureContext = () => {
  if (!audioContext) {
    audioContext = uni.createInnerAudioContext()
    audioContext.loop = false
    // #ifdef MP-WEIXIN
    audioContext.obeyMuteSwitch = true
    // #endif
  }
  return audioContext
}

const detachSessionEvents = (context: AudioContext) => {
  if (listeners.play) context.offPlay(listeners.play)
  if (listeners.pause) context.offPause(listeners.pause)
  if (listeners.ended) context.offEnded(listeners.ended)
  if (listeners.error) context.offError(listeners.error)
  if (listeners.timeUpdate) context.offTimeUpdate(listeners.timeUpdate)
  listeners = {}
}

const resetVisibleState = (status: PlayerStatus) => {
  playerState.status = status
  playerState.soundId = ''
  playerState.animalId = ''
  playerState.currentTime = 0
  playerState.duration = 0
  playerState.currentPlayUrl = ''
  playerState.expiresAt = ''
  playerState.errorMessage = ''
}

const getSignedPlayUrl = async (soundId: string, forceRefresh: boolean): Promise<SignedPlayUrl> => {
  const cached = signedUrlCache.get(soundId)
  const cachedExpiresAt = cached ? Date.parse(cached.expiresAt) : 0
  if (!forceRefresh && cached && Number.isFinite(cachedExpiresAt) && cachedExpiresAt > Date.now() + EARLY_REFRESH_MS) {
    return cached
  }
  if (forceRefresh) signedUrlCache.delete(soundId)
  const signed = await getPlayUrl(soundId)
  const expiresAt = Date.parse(signed.expiresAt)
  if (signed.playUrl && Number.isFinite(expiresAt) && expiresAt > Date.now()) {
    if (!signedUrlCache.has(soundId) && signedUrlCache.size >= 50) {
      const oldestSoundId = signedUrlCache.keys().next().value
      if (oldestSoundId) signedUrlCache.delete(oldestSoundId)
    }
    signedUrlCache.set(soundId, signed)
  }
  return signed
}

const requestAndPlay = async (soundId: string, animalId: string, session: number, forceRefresh: boolean) => {
  try {
    const signed = await getSignedPlayUrl(soundId, forceRefresh)
    const context = audioContext
    if (session !== activeSession || session !== requestSequence || !context) return
    if (!signed.playUrl) throw new Error('播放地址暂不可用')
    const expiresAt = Date.parse(signed.expiresAt)
    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now() + EARLY_REFRESH_MS) {
      signedUrlCache.delete(soundId)
      if (!retryUsed) {
        retryUsed = true
        await requestAndPlay(soundId, animalId, session, true)
        return
      }
      throw new Error('播放地址已过期')
    }
    playerState.duration = signed.durationMs / 1000
    playerState.currentPlayUrl = signed.playUrl
    playerState.expiresAt = signed.expiresAt
    context.src = signed.playUrl
    context.play()
  } catch {
    if (session !== activeSession || session !== requestSequence) return
    playerState.status = 'error'
    playerState.errorMessage = forceRefresh ? '播放地址已失效，请稍后重试' : '声音暂时无法播放，请重试'
  }
}

export const playSound = async (soundId: string, animalId: string): Promise<void> => {
  const context = ensureContext()
  if (playerState.soundId === soundId && playerState.status === 'loading') return
  if (playerState.soundId === soundId && playerState.status === 'playing') {
    context.pause()
    return
  }
  if (playerState.soundId === soundId && playerState.status === 'paused') {
    context.play()
    return
  }

  const session = ++requestSequence
  activeSession = session
  retryUsed = false
  playerState.soundId = soundId
  playerState.animalId = animalId
  playerState.status = 'loading'
  playerState.currentTime = 0
  playerState.duration = 0
  playerState.currentPlayUrl = ''
  playerState.expiresAt = ''
  playerState.errorMessage = ''
  detachSessionEvents(context)
  context.stop()

  listeners.play = () => {
    if (session === activeSession) playerState.status = 'playing'
  }
  listeners.pause = () => {
    if (session === activeSession) playerState.status = 'paused'
  }
  listeners.ended = () => {
    if (session === activeSession) playerState.status = 'ended'
  }
  listeners.error = () => {
    if (session !== activeSession) return
    if (!retryUsed) {
      retryUsed = true
      signedUrlCache.delete(soundId)
      playerState.currentPlayUrl = ''
      playerState.expiresAt = ''
      playerState.status = 'loading'
      void requestAndPlay(soundId, animalId, session, true)
      return
    }
    playerState.status = 'error'
    playerState.errorMessage = '声音暂时无法播放，请稍后重试'
  }
  context.onPlay(listeners.play)
  context.onPause(listeners.pause)
  context.onEnded(listeners.ended)
  context.onError(listeners.error)
  listeners.timeUpdate = () => {
    if (session !== activeSession) return
    const currentTime = context.currentTime
    const duration = context.duration
    if (Number.isFinite(currentTime) && currentTime >= 0) playerState.currentTime = currentTime
    if (Number.isFinite(duration) && duration > 0) playerState.duration = duration
  }
  context.onTimeUpdate(listeners.timeUpdate)

  await requestAndPlay(soundId, animalId, session, false)
}

export const stopPlayer = (): void => {
  ++requestSequence
  activeSession = requestSequence
  if (audioContext) {
    detachSessionEvents(audioContext)
    audioContext.stop()
  }
  resetVisibleState('stopped')
}

export const destroyPlayer = (): void => {
  ++requestSequence
  activeSession = requestSequence
  if (audioContext) {
    detachSessionEvents(audioContext)
    audioContext.stop()
    audioContext.destroy()
    audioContext = null
  }
  signedUrlCache.clear()
  resetVisibleState('idle')
}

export const formatPlayerTime = (seconds: number): string => {
  const safeSeconds = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0
  return Math.floor(safeSeconds / 60) + ':' + String(safeSeconds % 60).padStart(2, '0')
}

export const playerProgressPercent = (): number =>
  playerState.duration > 0 ? Math.max(0, Math.min(100, (playerState.currentTime / playerState.duration) * 100)) : 0

export const playerStatusLabel = (status: PlayerStatus): string =>
  ({
    idle: '播放',
    loading: '获取播放地址…',
    playing: '正在播放',
    paused: '已暂停',
    stopped: '已停止',
    ended: '播放完成',
    error: '播放失败',
  })[status]
