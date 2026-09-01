import { describe, expect, it } from 'vitest'
import {
  formatQuickTransferHistoryDate,
  formatQuickTransferHistorySummary,
  getQuickTransferHistoryIconType,
  getQuickTransferHistoryPreview,
  getQuickTransferHistoryTypeLabel,
  shouldShowQuickTransferHistoryPreview,
  shouldShowQuickTransferHistorySummary,
} from './presentation'
import { getQuickTransferHistoryTitle, normalizeQuickTransferHistoryMetadata } from './history'

const emptySummary = {
  hasText: false,
  linkCount: 0,
  fileCount: 0,
  imageCount: 0,
  otherFileCount: 0,
  referenceCount: 0,
}

describe('quick transfer history presentation', () => {
  it('formats image and mixed content counts without using filenames', () => {
    expect(formatQuickTransferHistorySummary({ ...emptySummary, fileCount: 3, imageCount: 3 })).toBe('3 张图片')
    expect(formatQuickTransferHistorySummary({ ...emptySummary, fileCount: 3, imageCount: 2, otherFileCount: 1 })).toBe(
      '2 张图片 · 1 个文件',
    )
    expect(formatQuickTransferHistorySummary({ ...emptySummary, hasText: true, fileCount: 1, imageCount: 1, linkCount: 1 })).toBe(
      '留言 · 1 张图片 · 1 个链接',
    )
  })

  it('uses friendly local dates for history cards', () => {
    const now = new Date(2026, 7, 31, 15, 0)
    expect(formatQuickTransferHistoryDate(new Date(2026, 7, 31, 14, 32).toISOString(), now)).toBe('14:32')
    expect(formatQuickTransferHistoryDate(new Date(2026, 7, 30, 21, 8).toISOString(), now)).toBe('昨天 21:08')
    expect(formatQuickTransferHistoryDate(new Date(2026, 7, 29, 18, 20).toISOString(), now)).toBe('08-29 18:20')
    expect(formatQuickTransferHistoryDate(new Date(2025, 11, 31, 10, 0).toISOString(), now)).toBe('2025-12-31')
  })

  it('maps stable semantic types to existing uni-icons', () => {
    expect(getQuickTransferHistoryTypeLabel('image')).toBe('图片')
    expect(getQuickTransferHistoryIconType('text')).toBe('compose')
    expect(getQuickTransferHistoryIconType('image')).toBe('image')
    expect(getQuickTransferHistoryIconType('file')).toBe('paperclip')
    expect(getQuickTransferHistoryIconType('link')).toBe('link')
    expect(getQuickTransferHistoryIconType('reference')).toBe('flag')
    expect(getQuickTransferHistoryIconType('mixed')).toBe('list')
  })

  it('never shows a random image filename as history preview', () => {
    const preview = { fileName: '294A9B3D0CB782C8.jpeg' }
    expect(getQuickTransferHistoryPreview('image', preview)).toBe('')
    expect(shouldShowQuickTransferHistoryPreview('image', '图片', preview)).toBe(false)
  })

  it('keeps meaningful file names and mixed previews', () => {
    expect(getQuickTransferHistoryPreview('file', { fileName: '香港签证资料.pdf' })).toBe('香港签证资料.pdf')
    expect(shouldShowQuickTransferHistoryPreview('file', 'PDF 文件', { fileName: '香港签证资料.pdf' })).toBe(true)
    expect(getQuickTransferHistoryPreview('mixed', { fileName: 'random.jpeg', referenceTitle: '旅行计划' })).toBe('旅行计划')
    expect(getQuickTransferHistoryPreview('mixed', { text: '请查看', referenceTitle: '旅行计划' })).toBe('请查看')
  })

  it('hides a summary when the backend title already identifies the content', () => {
    expect(shouldShowQuickTransferHistorySummary('image', '3 张图片', { ...emptySummary, fileCount: 3, imageCount: 3 })).toBe(false)
    expect(shouldShowQuickTransferHistorySummary('file', 'PDF 文件', { ...emptySummary, fileCount: 1, otherFileCount: 1 })).toBe(false)
    expect(shouldShowQuickTransferHistorySummary('text', '明天下午三点开会', { ...emptySummary, hasText: true })).toBe(false)
    expect(shouldShowQuickTransferHistorySummary('mixed', '旅行攻略', { ...emptySummary, hasText: true, linkCount: 1 })).toBe(true)
  })

  it('falls back safely when old or unknown metadata is returned', () => {
    expect(
      normalizeQuickTransferHistoryMetadata({
        primaryType: 'unknown',
        summary: { hasText: false, fileCount: 2 },
      }),
    ).toEqual({
      primaryType: 'file',
      summary: { ...emptySummary, fileCount: 2, otherFileCount: 2 },
    })
    expect(
      normalizeQuickTransferHistoryMetadata({
        primaryType: 'image',
        summary: { hasText: false, fileCount: 3 },
      }),
    ).toEqual({
      primaryType: 'image',
      summary: { ...emptySummary, fileCount: 3, imageCount: 3 },
    })
  })

  it('consumes the backend title and falls back only when it is empty', () => {
    expect(getQuickTransferHistoryTitle({ title: '项目交接资料', displayTitle: '旧标题' })).toBe('项目交接资料')
    expect(getQuickTransferHistoryTitle({ title: '   ', displayTitle: '旧标题' })).toBe('旧标题')
    expect(getQuickTransferHistoryTitle({ title: null })).toBe('飞船')
  })
})
