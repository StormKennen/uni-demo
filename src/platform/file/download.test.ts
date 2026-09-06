import { describe, expect, it, vi } from 'vitest'

vi.mock('@/utilsH5/quick-transfer-download', () => ({ openQuickTransferBrowserDownload: vi.fn() }), { virtual: true })

import { saveLocalFileWithWeixinAdapter } from './download'
import type { DirectDownloadOptions, LocalFile, WeixinFileSaveAdapter } from './download'

const localFile: LocalFile = { path: '/tmp/quick-transfer-file', isRemote: false }
type SaveImageOptions = Parameters<WeixinFileSaveAdapter['saveImage']>[0]
type SaveVideoOptions = Parameters<WeixinFileSaveAdapter['saveVideo']>[0]
type SaveFileOptions = Parameters<WeixinFileSaveAdapter['saveFile']>[0]

const options = (mimeType: string): DirectDownloadOptions => ({
  url: 'https://signed.example/file',
  fileName: 'attachment',
  mimeType,
  fileId: 'file-1',
})

const createSuccessfulAdapter = (): WeixinFileSaveAdapter => ({
  saveImage: vi.fn((saveOptions: SaveImageOptions) => saveOptions.success()),
  saveVideo: vi.fn((saveOptions: SaveVideoOptions) => saveOptions.success()),
  saveFile: vi.fn((saveOptions: SaveFileOptions) => saveOptions.success()),
})

describe('WeChat local file saving', () => {
  it('routes videos to the photo album and supports saving the same valid temp file again', async () => {
    const adapter = createSuccessfulAdapter()

    await expect(saveLocalFileWithWeixinAdapter(localFile, options('video/mp4'), adapter)).resolves.toEqual({
      success: true,
      consumesSource: false,
    })
    await expect(saveLocalFileWithWeixinAdapter(localFile, options('video/mp4'), adapter)).resolves.toEqual({
      success: true,
      consumesSource: false,
    })

    expect(adapter.saveVideo).toHaveBeenCalledTimes(2)
    expect(adapter.saveImage).not.toHaveBeenCalled()
    expect(adapter.saveFile).not.toHaveBeenCalled()
  })

  it('keeps images on the image album path and marks ordinary saved files as consumed', async () => {
    const adapter = createSuccessfulAdapter()

    await expect(saveLocalFileWithWeixinAdapter(localFile, options('image/jpeg'), adapter)).resolves.toEqual({
      success: true,
      consumesSource: false,
    })
    await expect(saveLocalFileWithWeixinAdapter(localFile, options('application/pdf'), adapter)).resolves.toEqual({
      success: true,
      consumesSource: true,
    })

    expect(adapter.saveImage).toHaveBeenCalledTimes(1)
    expect(adapter.saveVideo).not.toHaveBeenCalled()
    expect(adapter.saveFile).toHaveBeenCalledTimes(1)
  })

  it('keeps a denied album save retryable without consuming the temp file', async () => {
    const adapter = createSuccessfulAdapter()
    adapter.saveVideo = vi.fn((saveOptions: SaveVideoOptions) => saveOptions.fail({ errMsg: 'authorize:fail auth deny' }))

    await expect(saveLocalFileWithWeixinAdapter(localFile, options('video/mp4'), adapter)).resolves.toEqual({
      success: false,
      consumesSource: false,
    })
  })
})
