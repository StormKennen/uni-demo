import type { NormalizedCrop } from './types'

interface CropGeometry {
  frameWidth: number
  frameHeight: number
  imageWidth: number
  imageHeight: number
  offsetX: number
  offsetY: number
}

export const requiresComplianceCrop = (imageWidth: number, imageHeight: number, targetWidth: number, targetHeight: number): boolean => {
  if (![imageWidth, imageHeight, targetWidth, targetHeight].every(value => Number.isFinite(value) && value > 0)) return false
  return Math.abs(imageWidth * targetHeight - imageHeight * targetWidth) > 0.5
}

const roundUnit = (value: number): number => Number(value.toFixed(6))
const clampUnit = (value: number): number => roundUnit(Math.max(0, Math.min(1, value)))
const clampCropOrigin = (value: number, size: number): number => roundUnit(Math.max(0, Math.min(1 - size, value)))

export const calculateNormalizedCrop = ({
  frameWidth,
  frameHeight,
  imageWidth,
  imageHeight,
  offsetX,
  offsetY,
}: CropGeometry): NormalizedCrop => {
  const imageLeft = (frameWidth - imageWidth) / 2 + offsetX
  const imageTop = (frameHeight - imageHeight) / 2 + offsetY
  const width = clampUnit(frameWidth / imageWidth)
  const height = clampUnit(frameHeight / imageHeight)
  return {
    x: clampCropOrigin(-imageLeft / imageWidth, width),
    y: clampCropOrigin(-imageTop / imageHeight, height),
    width,
    height,
  }
}
