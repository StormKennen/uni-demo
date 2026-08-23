import http from '@/services/http'
import { getToken } from '@/utils/storage'
import { getAppTokenFromQuery } from '@/utilsH5/env'

declare const uni: any

type SecuritySuggestion = 'pass' | 'review' | 'block'

interface RawSecurityResult {
  errCode?: number
  errMsg?: string
  message?: string
  requestId?: string
  result?: SecuritySuggestion
  safe?: boolean
  suggestion?: SecuritySuggestion
  traceId?: string
}

interface RawSecurityResponse {
  code?: number
  data?: RawSecurityResult
  message?: string
  msg?: string
}

export interface MediaSecurityCheckResult {
  message?: string
  requestId?: string
  safe: boolean
  suggestion: SecuritySuggestion
  traceId?: string
}

export interface TextSecurityCheckResult extends MediaSecurityCheckResult {}

function getAuthorization(): string {
  let token = ''
  // #ifdef WEB
  token = getAppTokenFromQuery() || ''
  // #endif
  // #ifndef WEB
  token = getToken() || ''
  // #endif
  return token ? `Bearer ${token}` : ''
}

function buildSecurityHeaders(): Record<string, string> {
  const authorization = getAuthorization()
  return authorization ? { Authorization: authorization } : {}
}

function normalizeMediaSecurityResponse(payload: RawSecurityResponse | RawSecurityResult): MediaSecurityCheckResult {
  const envelope = payload as RawSecurityResponse
  const response: RawSecurityResult = envelope.data || (payload as RawSecurityResult)
  const suggestion = response.suggestion || response.result || (response.safe === true ? 'pass' : response.safe === false ? 'block' : undefined)
  if (!suggestion) throw new Error(response.message || response.errMsg || envelope.message || envelope.msg || '内容安全检查结果无效')
  const safe = typeof response.safe === 'boolean' ? response.safe : suggestion === 'pass'

  return {
    safe,
    suggestion,
    message: response.message || response.errMsg,
    requestId: response.requestId,
    traceId: response.traceId,
  }
}

export function checkMediaSecurity(filePath: string, scene = 'image_compress'): Promise<MediaSecurityCheckResult> {
  return http
    .upload<RawSecurityResponse | RawSecurityResult>('/security/media-check', {
      filePath,
      formData: {
        mediaType: 'image',
        scene,
      },
      name: 'media',
    })
    .then(normalizeMediaSecurityResponse)
}

export function checkTextSecurity(content: string, scene = 'default'): Promise<TextSecurityCheckResult> {
  const baseURL = String(import.meta.env.VITE_APP_BASE_URL || '').replace(/\/$/, '')
  const url = `${baseURL}/security/msg-check`

  return new Promise((resolve, reject) => {
    uni.request({
      data: {
        content,
        scene,
      },
      header: buildSecurityHeaders(),
      method: 'POST',
      success: (res: any) => {
        try {
          const payload = res.data
          if (res.statusCode !== 200) {
            reject(new Error(payload?.message || payload?.msg || '文本安全校验失败'))
            return
          }

          if (payload?.code && payload.code !== 200) {
            reject(new Error(payload?.message || payload?.msg || '文本安全校验失败'))
            return
          }

          resolve(normalizeMediaSecurityResponse(payload))
        } catch (error) {
          reject(error)
        }
      },
      fail: (error: any) => {
        reject(error)
      },
      url,
    })
  })
}
