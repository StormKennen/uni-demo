import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getPlayUrl } = vi.hoisted(() => ({ getPlayUrl: vi.fn() }))
vi.mock('./api', () => ({ getPlayUrl }))

interface FakeAudioContext {
  src: string
  loop: boolean
  obeyMuteSwitch: boolean
  currentTime: number
  duration: number
  play: ReturnType<typeof vi.fn>
  pause: ReturnType<typeof vi.fn>
  stop: ReturnType<typeof vi.fn>
  destroy: ReturnType<typeof vi.fn>
  onPlay: (callback: () => void) => void
  offPlay: (callback: () => void) => void
  onPause: (callback: () => void) => void
  offPause: (callback: () => void) => void
  onStop: (callback: () => void) => void
  offStop: (callback: () => void) => void
  onEnded: (callback: () => void) => void
  offEnded: (callback: () => void) => void
  onError: (callback: () => void) => void
  offError: (callback: () => void) => void
  onTimeUpdate: (callback: () => void) => void
  offTimeUpdate: (callback: () => void) => void
  emit: (event: 'play' | 'pause' | 'stop' | 'ended' | 'error' | 'timeUpdate') => void
}

const makeContext = (): FakeAudioContext => {
  const handlers: Partial<Record<'play' | 'pause' | 'stop' | 'ended' | 'error' | 'timeUpdate', () => void>> = {}
  const context: FakeAudioContext = {
    src: '',
    loop: true,
    obeyMuteSwitch: false,
    currentTime: 0,
    duration: 0,
    play: vi.fn(() => handlers.play?.()),
    pause: vi.fn(() => handlers.pause?.()),
    stop: vi.fn(() => handlers.stop?.()),
    destroy: vi.fn(),
    onPlay: callback => {
      handlers.play = callback
    },
    offPlay: callback => {
      if (handlers.play === callback) delete handlers.play
    },
    onPause: callback => {
      handlers.pause = callback
    },
    offPause: callback => {
      if (handlers.pause === callback) delete handlers.pause
    },
    onStop: callback => {
      handlers.stop = callback
    },
    offStop: callback => {
      if (handlers.stop === callback) delete handlers.stop
    },
    onEnded: callback => {
      handlers.ended = callback
    },
    offEnded: callback => {
      if (handlers.ended === callback) delete handlers.ended
    },
    onError: callback => {
      handlers.error = callback
    },
    offError: callback => {
      if (handlers.error === callback) delete handlers.error
    },
    onTimeUpdate: callback => {
      handlers.timeUpdate = callback
    },
    offTimeUpdate: callback => {
      if (handlers.timeUpdate === callback) delete handlers.timeUpdate
    },
    emit: event => handlers[event]?.(),
  }
  return context
}

const expiresAfter = (seconds: number) => new Date(Date.now() + seconds * 1000).toISOString()

import { destroyPlayer, formatPlayerTime, playSound, playerProgressPercent, playerState, stopPlayer } from './player'

describe('animal sound player sessions', () => {
  let contexts: FakeAudioContext[]
  const createInnerAudioContext = vi.fn(() => {
    const context = makeContext()
    contexts.push(context)
    return context as unknown as ReturnType<typeof uni.createInnerAudioContext>
  })

  beforeEach(() => {
    destroyPlayer()
    vi.unstubAllGlobals()
    contexts = []
    getPlayUrl.mockReset()
    vi.stubGlobal('uni', { createInnerAudioContext })
    createInnerAudioContext.mockClear()
  })

  it('uses one instance and toggles pause/resume from real player events', async () => {
    getPlayUrl.mockResolvedValue({
      soundId: 'cat-sound',
      playUrl: 'https://media.example.test/cat',
      expiresAt: expiresAfter(120),
      durationMs: 4000,
      mimeType: 'audio/mpeg',
      mediaVersion: 'v1',
    })
    await playSound('cat-sound', 'cat')
    expect(createInnerAudioContext).toHaveBeenCalledTimes(1)
    expect(playerState.status).toBe('playing')
    await playSound('cat-sound', 'cat')
    expect(playerState.status).toBe('paused')
    await playSound('cat-sound', 'cat')
    expect(playerState.status).toBe('playing')
    expect(contexts[0].loop).toBe(false)
  })

  it('ignores an older play URL response after a newer sound starts', async () => {
    let resolveCat:
      | ((value: {
          soundId: string
          playUrl: string
          expiresAt: string
          durationMs: number
          mimeType: string
          mediaVersion: string
        }) => void)
      | undefined
    getPlayUrl.mockImplementation((soundId: string) =>
      soundId === 'cat-sound'
        ? new Promise(resolve => {
            resolveCat = resolve
          })
        : Promise.resolve({
            soundId,
            playUrl: 'https://media.example.test/dog',
            expiresAt: expiresAfter(120),
            durationMs: 3000,
            mimeType: 'audio/mpeg',
            mediaVersion: 'v1',
          }),
    )
    const first = playSound('cat-sound', 'cat')
    await playSound('dog-sound', 'dog')
    resolveCat?.({
      soundId: 'cat-sound',
      playUrl: 'https://media.example.test/cat',
      expiresAt: expiresAfter(120),
      durationMs: 2500,
      mimeType: 'audio/mpeg',
      mediaVersion: 'v1',
    })
    await first
    expect(playerState.soundId).toBe('dog-sound')
    expect(contexts[0].src).toBe('https://media.example.test/dog')
  })

  it('reuses an unexpired URL and refreshes once after a media error', async () => {
    getPlayUrl
      .mockResolvedValueOnce({
        soundId: 'cat-sound',
        playUrl: 'https://media.example.test/cat-old',
        expiresAt: expiresAfter(120),
        durationMs: 4000,
        mimeType: 'audio/mpeg',
        mediaVersion: 'v1',
      })
      .mockResolvedValueOnce({
        soundId: 'cat-sound',
        playUrl: 'https://media.example.test/cat-new',
        expiresAt: expiresAfter(120),
        durationMs: 4000,
        mimeType: 'audio/mpeg',
        mediaVersion: 'v2',
      })
    await playSound('cat-sound', 'cat')
    expect(getPlayUrl).toHaveBeenCalledTimes(1)
    await playSound('cat-sound', 'cat')
    expect(getPlayUrl).toHaveBeenCalledTimes(1)
    contexts[0].emit('error')
    await vi.waitFor(() => expect(contexts[0].src).toBe('https://media.example.test/cat-new'))
    expect(getPlayUrl).toHaveBeenCalledTimes(2)
  })

  it('updates progress only from the timeupdate event and formats it safely', async () => {
    getPlayUrl.mockResolvedValue({
      soundId: 'cat-sound',
      playUrl: 'https://media.example.test/cat',
      expiresAt: expiresAfter(120),
      durationMs: 10000,
      mimeType: 'audio/mpeg',
      mediaVersion: 'v1',
    })
    await playSound('cat-sound', 'cat')
    contexts[0].currentTime = 2.5
    contexts[0].duration = 10
    contexts[0].emit('timeUpdate')
    expect(playerState.currentTime).toBe(2.5)
    expect(playerProgressPercent()).toBe(25)
    expect(formatPlayerTime(65)).toBe('1:05')
  })

  it('stops and destroys the context during page lifecycle cleanup', async () => {
    getPlayUrl.mockResolvedValue({
      soundId: 'cat-sound',
      playUrl: 'https://media.example.test/cat',
      expiresAt: expiresAfter(120),
      durationMs: 4000,
      mimeType: 'audio/mpeg',
      mediaVersion: 'v1',
    })
    await playSound('cat-sound', 'cat')
    stopPlayer()
    expect(playerState.status).toBe('stopped')
    destroyPlayer()
    expect(contexts[0].destroy).toHaveBeenCalledTimes(1)
    expect(playerState.status).toBe('idle')
  })
})
