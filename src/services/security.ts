import http from '@/services/http'
import { getToken } from '@/utils/storage'
import { getAppTokenFromQuery } from '@/utilsH5/env'

declare const uni: any

type SecuritySuggestion = 'pass' | 'review' | 'block'

interface RawSecurityDecision {
  safe?: boolean
  pass?: boolean
  reason?: string
  suggest?: string
  suggestion?: string
}

interface RawSecurityResult {
  errCode?: number
  errMsg?: string
  message?: string
  requestId?: string
  result?: SecuritySuggestion | RawSecurityDecision
  safe?: boolean
  pass?: boolean
  reason?: string
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
  const rawResult = response.result
  const nestedResult = rawResult && typeof rawResult === 'object' ? rawResult : undefined
  const rawSuggestion = response.suggestion || (typeof rawResult === 'string' ? rawResult : undefined) || nestedResult?.suggestion || nestedResult?.suggest
  const suggestion = rawSuggestion === 'pass' || rawSuggestion === 'review' || rawSuggestion === 'block' ? rawSuggestion : undefined
  const explicitlyPassed = response.safe === true || response.pass === true || response.reason === 'pass' || nestedResult?.safe === true || nestedResult?.pass === true
  const explicitlyBlocked = response.safe === false || response.pass === false || nestedResult?.safe === false || nestedResult?.pass === false
  const normalizedSuggestion = suggestion || (explicitlyPassed ? 'pass' : explicitlyBlocked ? 'block' : undefined)
  if (!normalizedSuggestion) throw new Error(response.message || response.errMsg || envelope.message || envelope.msg || '内容安全检查结果无效')
  const safe = typeof response.safe === 'boolean' ? response.safe : typeof response.pass === 'boolean' ? response.pass : normalizedSuggestion === 'pass'

  return {
    safe,
    suggestion: normalizedSuggestion,
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
    .catch(error => {
      // 某些旧部署会在 HTTP 200 下返回未带 code 的安全结果，公共请求层会将其
      // 视为业务错误，但错误对象仍保留了响应体。只恢复明确的安全结果，网络
      // 异常或真正的错误继续抛出，不能因为兼容性而放行未检查的图片。
      const responsePayload = error && typeof error === 'object' && 'data' in error ? error.data : undefined
      if (responsePayload && typeof responsePayload === 'object') {
        try {
          return normalizeMediaSecurityResponse(responsePayload as RawSecurityResponse | RawSecurityResult)
        } catch {
          // 保留原始错误，交由调用方按“检查不可用”处理。
        }
      }
      return Promise.reject(error)
    })
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
