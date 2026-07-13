import type { ToolImagePayload } from '@/components/toolkit/types'
import { getStorageSync, removeStorageSync, setStorageSync } from '@/utils/storage'

export type ToolFlowId = 'magnet-flow' | 'scan-flow'

export type ToolFlowStep = 'magnet-link' | 'qr-generator' | 'image-cipher' | 'qr-parser'

export interface ToolFlowSession<T = Record<string, unknown>> {
  flowId: ToolFlowId
  step: ToolFlowStep
  payload: T
  updatedAt: number
}

// magnet-flow 链路载荷：磁力链接 -> 二维码图片
export interface MagnetFlowPayload extends Record<string, unknown> {
  magnet?: string
  qrImage?: ToolImagePayload
}

// scan-flow 链路载荷：二维码解析文本 -> 磁力链接
export interface ScanFlowPayload extends Record<string, unknown> {
  rawText?: string
  magnet?: string
}

const STORAGE_PREFIX = 'tool-flow:'

const flowStorageKey = (flowId: ToolFlowId): string => `${STORAGE_PREFIX}${flowId}`

export function createToolFlowSession<T extends Record<string, unknown>>(
  flowId: ToolFlowId,
  step: ToolFlowStep,
  payload: T = {} as T,
): ToolFlowSession<T> {
  const session: ToolFlowSession<T> = { flowId, step, payload, updatedAt: Date.now() }
  setStorageSync(flowStorageKey(flowId), session)
  return session
}

export function readToolFlowSession<T = Record<string, unknown>>(flowId: ToolFlowId): ToolFlowSession<T> | null {
  const session = getStorageSync(flowStorageKey(flowId)) as ToolFlowSession<T> | undefined
  if (!session || session.flowId !== flowId) return null
  return session
}

export function updateToolFlowSession<T extends Record<string, unknown>>(
  flowId: ToolFlowId,
  payload: Partial<T>,
  step?: ToolFlowStep,
): ToolFlowSession<T> | null {
  const current = readToolFlowSession<T>(flowId)
  if (!current) return null
  const next: ToolFlowSession<T> = {
    ...current,
    step: step ?? current.step,
    payload: { ...current.payload, ...payload },
    updatedAt: Date.now(),
  }
  setStorageSync(flowStorageKey(flowId), next)
  return next
}

export function clearToolFlowSession(flowId: ToolFlowId): void {
  removeStorageSync(flowStorageKey(flowId))
}

// 读完即删：进入链路终点消费载荷后清理，避免返回时脏数据串页
export function consumeToolFlowSession<T = Record<string, unknown>>(flowId: ToolFlowId): ToolFlowSession<T> | null {
  const session = readToolFlowSession<T>(flowId)
  if (session) clearToolFlowSession(flowId)
  return session
}
