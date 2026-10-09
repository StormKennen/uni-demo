import { describe, expect, it } from 'vitest'
import { buildMemoDetailPath, buildMemoShareUrl, parseMemoDetailParams } from './navigation'

describe('memo navigation', () => {
  it('builds an internal detail path with encoded parameters', () => {
    expect(buildMemoDetailPath({ id: 'memo/1', shareToken: 'token+a/b', mode: 'private', readonly: true })).toBe(
      '/subPackages/tools/memo/detail?id=memo%2F1&shareToken=token%2Ba%2Fb&mode=private&readonly=1',
    )
  })

  it('builds a hash-router H5 share URL from the current deployment path', () => {
    expect(
      buildMemoShareUrl({
        id: 'memo-1',
        shareToken: 'token/1',
        location: {
          origin: 'https://example.com',
          pathname: '/superAppBridge.html',
          search: '',
          hash: '#/pages/index/index',
        },
      }),
    ).toBe('https://example.com/superAppBridge.html#/subPackages/tools/memo/detail?id=memo-1&shareToken=token%2F1')
  })

  it('builds a history-router H5 share URL from the current route base', () => {
    expect(
      buildMemoShareUrl({
        id: 'memo-1',
        location: {
          origin: 'https://example.com',
          pathname: '/app/subPackages/tools/memo/detail',
          search: '?old=1',
          hash: '',
        },
      }),
    ).toBe('https://example.com/app/subPackages/tools/memo/detail?id=memo-1')
  })

  it('uses a configured H5 hash base when called from a mini program', () => {
    expect(
      buildMemoShareUrl({
        id: 'memo-1',
        shareToken: 'token-1',
        baseUrl: 'https://example.com/app/#',
      }),
    ).toBe('https://example.com/app/#/subPackages/tools/memo/detail?id=memo-1&shareToken=token-1')
  })

  it('parses id and token from uni options before H5 search/hash parameters', () => {
    expect(
      parseMemoDetailParams(
        { id: 'from-options', readonly: '1' },
        {
          origin: 'https://example.com',
          pathname: '/',
          search: '?id=from-search&shareToken=from-search',
          hash: '#/subPackages/tools/memo/detail?id=from-hash&shareToken=from-hash',
        },
      ),
    ).toEqual({ id: 'from-options', shareToken: 'from-hash', readonly: true })
  })

  it('parses hash-only parameters and returns null when id is absent', () => {
    expect(
      parseMemoDetailParams(undefined, {
        origin: 'https://example.com',
        pathname: '/',
        search: '',
        hash: '#/subPackages/tools/memo/detail?id=memo-1&shareToken=token-1&mode=admin',
      }),
    ).toEqual({ id: 'memo-1', shareToken: 'token-1', mode: 'admin' })
    expect(parseMemoDetailParams({ shareToken: 'token-only' }, undefined)).toBeNull()
  })

  it('parses the full H5 href and keeps route hash parameters ahead of base query parameters', () => {
    expect(
      parseMemoDetailParams(undefined, {
        origin: 'https://example.com',
        pathname: '/index.html',
        search: '?source=share',
        hash: '#/subPackages/tools/memo/detail?memoId=memo-2&share_token=token-2',
        href: 'https://example.com/index.html?source=share#/subPackages/tools/memo/detail?memoId=memo-2&share_token=token-2',
      }),
    ).toEqual({ id: 'memo-2', shareToken: 'token-2' })
  })
})
