import { describe, expect, it } from 'vitest'
import { QUICK_TRANSFER_RECEIVE_ROUTE, QUICK_TRANSFER_ROUTE } from './constants'
import {
  getQuickTransferReceiveSharePayload,
  getQuickTransferToolSharePayload,
  getQuickTransferTransferSharePayload,
  QUICK_TRANSFER_RECEIVE_SHARE_TITLE,
  QUICK_TRANSFER_TOOL_SHARE_TITLE,
  QUICK_TRANSFER_TRANSFER_SHARE_TITLE,
} from './share'
import { QUICK_SHIP_TOOL_SHARE_COVER_URL, QUICK_SHIP_TRANSFER_SHARE_COVER_URL } from './visual'

describe('quick transfer share semantics', () => {
  it('always uses the tool share on management pages', () => {
    expect(getQuickTransferToolSharePayload()).toEqual({
      kind: 'tool',
      title: QUICK_TRANSFER_TOOL_SHARE_TITLE,
      path: QUICK_TRANSFER_ROUTE,
      imageUrl: QUICK_SHIP_TOOL_SHARE_COVER_URL,
    })
  })

  it('uses the receiver route only for a live transfer ticket', () => {
    const payload = getQuickTransferTransferSharePayload('share/a', '2026-08-27T12:00:00.000Z', Date.parse('2026-08-27T11:00:00.000Z'))
    expect(payload).toEqual({
      kind: 'transfer',
      title: QUICK_TRANSFER_TRANSFER_SHARE_TITLE,
      path: `${QUICK_TRANSFER_RECEIVE_ROUTE}?shareToken=share%2Fa`,
      imageUrl: QUICK_SHIP_TRANSFER_SHARE_COVER_URL,
    })
  })

  it('uses the canonical title for a live transfer share', () => {
    expect(
      getQuickTransferTransferSharePayload('share-1', '2026-08-27T12:00:00.000Z', '营业执照.jpg', Date.parse('2026-08-27T11:00:00.000Z')),
    ).toMatchObject({
      kind: 'transfer',
      title: '飞船｜营业执照.jpg',
    })
  })

  it('shares the receiver scene when no transfer ticket is present', () => {
    expect(getQuickTransferReceiveSharePayload()).toEqual({
      kind: 'receiver',
      title: QUICK_TRANSFER_RECEIVE_SHARE_TITLE,
      path: QUICK_TRANSFER_RECEIVE_ROUTE,
      imageUrl: QUICK_SHIP_TOOL_SHARE_COVER_URL,
    })
  })

  it('falls back to tool share when the ticket is expired or incomplete', () => {
    expect(getQuickTransferTransferSharePayload('', '2026-08-27T12:00:00.000Z', Date.parse('2026-08-27T11:00:00.000Z')).kind).toBe('tool')
    expect(getQuickTransferTransferSharePayload('share-1', '2026-08-27T10:00:00.000Z', Date.parse('2026-08-27T11:00:00.000Z')).kind).toBe(
      'tool',
    )
  })
})
