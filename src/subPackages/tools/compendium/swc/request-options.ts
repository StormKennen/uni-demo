import { getAnonymousId } from '@/utils/anonymous-id'

/** 为可选认证阵容接口附加游客设备标识头。 */
export const buildAnonymousRequestConfig = (config: Record<string, any> = {}) => ({
  ...config,
  header: {
    ...(config.header || {}),
    'X-Anonymous-Id': getAnonymousId(),
  },
})

export const sanitizeQuery = <T extends Record<string, any>>(query: T): Partial<T> => {
  const entries = Object.entries(query).filter(([, value]) => value !== undefined && value !== null && value !== '')
  return Object.fromEntries(entries) as Partial<T>
}
