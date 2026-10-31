import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_BACK_FALLBACK, isTabBarRoute, safeBack } from './navigation'

const navigateBack = vi.fn()
const redirectTo = vi.fn()
const switchTab = vi.fn()
const reLaunch = vi.fn()

const setPageStack = (routes: string[]): void => {
  vi.stubGlobal(
    'getCurrentPages',
    vi.fn(() => routes.map(route => ({ route }))),
  )
}

describe('safeBack', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
    vi.stubGlobal('uni', { navigateBack, redirectTo, switchTab, reLaunch })
  })

  it('uses navigateBack when a real previous page exists', () => {
    setPageStack(['pages/tools/index', 'subPackages/tools/calendar/detail'])

    safeBack({ fallbackUrl: '/subPackages/tools/calendar/index' })

    expect(navigateBack).toHaveBeenCalledWith(expect.objectContaining({ delta: 1 }))
    expect(redirectTo).not.toHaveBeenCalled()
    expect(switchTab).not.toHaveBeenCalled()
  })

  it('replaces a single detail page with its normal fallback', () => {
    setPageStack(['subPackages/tools/calendar/detail'])

    safeBack({ fallbackUrl: '/subPackages/tools/calendar/index' })

    expect(redirectTo).toHaveBeenCalledWith(expect.objectContaining({ url: '/subPackages/tools/calendar/index' }))
  })

  it('uses switchTab when the fallback route is a tabBar page', () => {
    setPageStack(['pages/mine/login/login'])

    safeBack()

    expect(DEFAULT_BACK_FALLBACK).toBe('/pages/index/index')
    expect(switchTab).toHaveBeenCalledWith(expect.objectContaining({ url: DEFAULT_BACK_FALLBACK }))
    expect(redirectTo).not.toHaveBeenCalled()
  })

  it('recovers from a normal fallback failure through the home tab', () => {
    setPageStack(['subPackages/tools/calendar/detail'])
    redirectTo.mockImplementationOnce(({ fail }: { fail: () => void }) => fail())

    safeBack({ fallbackUrl: '/subPackages/tools/calendar/index' })

    expect(switchTab).toHaveBeenCalledWith(expect.objectContaining({ url: DEFAULT_BACK_FALLBACK }))
  })

  it('uses reLaunch only when the home tab fallback also fails', () => {
    setPageStack(['subPackages/tools/calendar/detail'])
    redirectTo.mockImplementationOnce(({ fail }: { fail: () => void }) => fail())
    switchTab.mockImplementationOnce(({ fail }: { fail: () => void }) => fail())

    safeBack({ fallbackUrl: '/subPackages/tools/calendar/index' })

    expect(reLaunch).toHaveBeenCalledWith({ url: DEFAULT_BACK_FALLBACK })
  })

  it('does not navigate to the route that is already current', () => {
    setPageStack(['pages/index/index'])

    safeBack()

    expect(navigateBack).not.toHaveBeenCalled()
    expect(redirectTo).not.toHaveBeenCalled()
    expect(switchTab).not.toHaveBeenCalled()
    expect(reLaunch).not.toHaveBeenCalled()
  })
})

describe('isTabBarRoute', () => {
  it('matches the registered tabBar routes without query parameters', () => {
    expect(isTabBarRoute('/pages/index/index?from=share')).toBe(true)
    expect(isTabBarRoute('/pages/tools/index?from=share')).toBe(true)
    expect(isTabBarRoute('/subPackages/tools/calendar/index')).toBe(false)
  })
})
