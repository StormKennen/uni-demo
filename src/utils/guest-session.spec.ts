import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearGuestToken,
  ensureGuestSession,
  getGuestToken,
  isGuestTokenValid,
  refreshGuestSession,
  setGuestToken,
  type GuestSessionBootstrap,
  type GuestSessionResponse,
} from './guest-session'

const storage = vi.hoisted(() => new Map<string, unknown>())

vi.mock('./storage', () => ({
  getStorageSync: (key: string) => storage.get(key),
  setStorageSync: (key: string, value: unknown) => storage.set(key, value),
  removeStorageSync: (key: string) => storage.delete(key),
}))

interface LoginOptionsStub {
  success?: (result: { code: string }) => void
}

const loginMock = vi.fn((options: LoginOptionsStub) => {
  options.success?.({ code: 'wx-login-code' })
})

const buildSession = (token: string, lifetimeMs = 60 * 60 * 1000): GuestSessionResponse => ({
  token,
  expires: new Date(Date.now() + lifetimeMs).toISOString(),
  header: 'X-Guest-Token',
  platform: 'wechat_mp',
})

beforeEach(() => {
  storage.clear()
  loginMock.mockClear()
  vi.stubGlobal('uni', {
    login: loginMock,
  })
  clearGuestToken()
})

describe('Guest Session', () => {
  it('首次获取只执行一次微信登录与 bootstrap，并复用有效缓存', async () => {
    const bootstrap: GuestSessionBootstrap = vi.fn(async () => buildSession('guest-token-1'))

    await expect(ensureGuestSession(bootstrap)).resolves.toBe('guest-token-1')
    await expect(ensureGuestSession(bootstrap)).resolves.toBe('guest-token-1')

    expect(loginMock).toHaveBeenCalledTimes(1)
    expect(bootstrap).toHaveBeenCalledTimes(1)
    expect(bootstrap).toHaveBeenCalledWith('wx-login-code')
    expect(isGuestTokenValid()).toBe(true)
  })

  it('十个并发请求共享同一个 in-flight Promise', async () => {
    loginMock.mockImplementation((options: LoginOptionsStub) => {
      queueMicrotask(() => options.success?.({ code: 'concurrent-code' }))
    })
    const bootstrap: GuestSessionBootstrap = vi.fn(async () => buildSession('shared-token'))

    const tokens = await Promise.all(Array.from({ length: 10 }, () => ensureGuestSession(bootstrap)))

    expect(tokens).toEqual(Array.from({ length: 10 }, () => 'shared-token'))
    expect(loginMock).toHaveBeenCalledTimes(1)
    expect(bootstrap).toHaveBeenCalledTimes(1)
  })

  it('临近过期的 Token 会被提前刷新', async () => {
    setGuestToken('expiring-token', Date.now() + 60 * 1000)
    const bootstrap: GuestSessionBootstrap = vi.fn(async () => buildSession('renewed-token'))

    await expect(ensureGuestSession(bootstrap)).resolves.toBe('renewed-token')

    expect(loginMock).toHaveBeenCalledTimes(1)
    expect(getGuestToken()).toBe('renewed-token')
  })

  it('缓存被清除后会自动恢复', async () => {
    setGuestToken('cached-token', Date.now() + 60 * 60 * 1000)
    clearGuestToken()
    const bootstrap: GuestSessionBootstrap = vi.fn(async () => buildSession('restored-token'))

    await expect(ensureGuestSession(bootstrap)).resolves.toBe('restored-token')
    expect(bootstrap).toHaveBeenCalledTimes(1)
  })

  it('Guest 失效并发恢复只创建一个新会话', async () => {
    setGuestToken('failed-token', Date.now() + 60 * 60 * 1000)
    const bootstrap: GuestSessionBootstrap = vi.fn(async () => buildSession('recovered-token'))

    const tokens = await Promise.all(Array.from({ length: 10 }, () => refreshGuestSession(bootstrap, 'failed-token')))

    expect(tokens).toEqual(Array.from({ length: 10 }, () => 'recovered-token'))
    expect(loginMock).toHaveBeenCalledTimes(1)
    expect(bootstrap).toHaveBeenCalledTimes(1)
  })

  it('较新的有效 Token 不会被迟到的旧 401 再次刷新', async () => {
    setGuestToken('newer-token', Date.now() + 60 * 60 * 1000)
    const bootstrap: GuestSessionBootstrap = vi.fn(async () => buildSession('unexpected-token'))

    await expect(refreshGuestSession(bootstrap, 'older-token')).resolves.toBe('newer-token')

    expect(loginMock).not.toHaveBeenCalled()
    expect(bootstrap).not.toHaveBeenCalled()
  })

  it('非 404 bootstrap 错误继续抛给调用方', async () => {
    const bootstrap: GuestSessionBootstrap = vi.fn(async () => Promise.reject({ code: 500 }))

    await expect(ensureGuestSession(bootstrap)).rejects.toEqual({ code: 500 })
    expect(loginMock).toHaveBeenCalledTimes(1)
  })

  it('Guest Session 未部署时降级并在退避期内停止重复探测', async () => {
    const bootstrap: GuestSessionBootstrap = vi.fn(async () => Promise.reject({ code: 404 }))

    await expect(ensureGuestSession(bootstrap)).resolves.toBe('')
    await expect(ensureGuestSession(bootstrap)).resolves.toBe('')

    expect(loginMock).toHaveBeenCalledTimes(1)
    expect(bootstrap).toHaveBeenCalledTimes(1)
    expect(getGuestToken()).toBe('')
  })
})
