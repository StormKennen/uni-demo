import { buildRelayFields, buildRelaySettings } from '../presets'
import type { RelayEntryFormState, RelayFieldValue, RelayFieldViewModel, RelayFormState } from '../types'
import type { postRelaysBody } from '@/services/apifox/NODEJSDEMO/RELAYS/interface'

export const createRelayFormState = (): RelayFormState => ({
  title: '',
  description: '',
  preset: 'free',
  enableImages: true,
  enableStatistics: false,
  defaultNumber: 1,
  deadline: '',
  maxEntriesPerParticipant: 1,
  allowEditNickname: true,
  allowEditEntry: true,
  allowWithdraw: true,
})

export const validateRelayForm = (form: RelayFormState): string => {
  if (!form.title.trim()) return '请填写接龙标题'
  if (form.title.trim().length > 200) return '接龙标题不能超过 200 字'
  if (form.description.length > 5000) return '接龙说明不能超过 5000 字'
  if (form.preset === 'activity' && (!Number.isInteger(form.defaultNumber) || form.defaultNumber < 1 || form.defaultNumber > 20))
    return '默认报名人数需在 1 到 20 之间'
  if (form.deadline && Number.isNaN(new Date(form.deadline).getTime())) return '截止时间格式不正确'
  return ''
}

export const buildRelayCreatePayload = (form: RelayFormState): postRelaysBody => ({
  title: form.title.trim(),
  description: form.description.trim(),
  fields: buildRelayFields(form),
  settings: buildRelaySettings(form),
})

export const validateRelayEntryForm = (fields: RelayFieldViewModel[], form: RelayEntryFormState): Record<string, string> => {
  const errors: Record<string, string> = {}
  if (!form.nickname.trim()) errors.nickname = '请输入昵称'
  if (form.nickname.trim().length > 100) errors.nickname = '昵称不能超过 100 字'
  fields.forEach(field => {
    const value = form.values[field.key] as RelayFieldValue
    if (field.type === 'image') {
      const images = form.images[field.key] || []
      const uploadedCount = images.filter(item => item.state === 'uploaded' && item.fileId).length
      if (field.required && uploadedCount === 0) errors[field.key] = `请上传${field.label}`
      if (field.config.maxCount && uploadedCount > field.config.maxCount)
        errors[field.key] = `${field.label}最多 ${field.config.maxCount} 张`
      return
    }
    if (field.required && (value === null || value === undefined || value === '')) {
      errors[field.key] = `请填写${field.label}`
      return
    }
    if (field.type === 'number' && value !== null && value !== undefined && typeof value !== 'number')
      errors[field.key] = `${field.label}需填写数字`
    if (field.type === 'number' && typeof value === 'number') {
      if (field.config.min !== undefined && value < field.config.min) errors[field.key] = `${field.label}不能小于 ${field.config.min}`
      if (field.config.max !== undefined && value > field.config.max) errors[field.key] = `${field.label}不能大于 ${field.config.max}`
    }
    if (field.type === 'single_select' && value && !field.options.some(option => option.value === value))
      errors[field.key] = `请选择有效的${field.label}`
    if (
      (field.type === 'text' || field.type === 'textarea') &&
      typeof value === 'string' &&
      field.config.maxLength &&
      value.length > field.config.maxLength
    ) {
      errors[field.key] = `${field.label}不能超过 ${field.config.maxLength} 字`
    }
  })
  return errors
}
