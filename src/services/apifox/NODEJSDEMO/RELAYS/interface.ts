/**
 * @description Relays/创建通用接龙--接口请求Body参数
 * @url POST /relays
 */
export interface postRelaysBody {
  description?: string
  fields?: postRelaysBodyFields[]
  settings?: postRelaysBodySettings
  title: string
}

/** postRelaysBodyFieldsConfig */
export interface postRelaysBodyFieldsConfig {
  max?: number
  maxLength?: number
  max_count?: number
  min?: number
}

/** postRelaysBodyFieldsOptions */
export interface postRelaysBodyFieldsOptions {
  label: string
  value: string
}

/** postRelaysBodyFields */
export interface postRelaysBodyFields {
  aggregate?: any
  config?: postRelaysBodyFieldsConfig
  default_value?: string
  key: string
  label: string
  options?: postRelaysBodyFieldsOptions[]
  required?: boolean
  type: 'text' | 'textarea' | 'number' | 'image' | 'single_select'
}

/** postRelaysBodySettings */
export interface postRelaysBodySettings {
  allow_edit_entry?: boolean
  allow_edit_nickname?: boolean
  allow_guest?: boolean
  allow_withdraw?: boolean
  deadline?: any
  max_entries_per_participant?: number
  participant_limit?: any
  show_participant_count?: boolean
  show_sequence?: boolean
  show_statistics?: boolean
}

/**
 * @description Relays/创建通用接龙--接口返回值
 * @url POST /relays
 */
export type postRelaysRes = object

/**
 * @description Relays/获取当前身份的接龙--接口请求Query参数
 * @url GET /relays/mine
 */
export interface getRelaysMineQuery {
  role?: string

  page?: number

  limit?: number

  pageSize?: number
}

/**
 * @description Relays/获取当前身份的接龙--接口返回值
 * @url GET /relays/mine
 */
export type getRelaysMineRes = object

/**
 * @description Relays/通过分享凭证查看接龙--接口返回值
 * @url GET /relays/shared/{shareCode}
 */
export type getRelaysSharedShareCodeRes = object

/**
 * @description Relays/获取可访问的接龙详情--接口返回值
 * @url GET /relays/{relayId}
 */
export type getRelaysRelayIdRes = object

/**
 * @description Relays/更新接龙--接口请求Body参数
 * @url PATCH /relays/{relayId}
 */
export interface patchRelaysRelayIdBody {
  description?: string
  fields?: patchRelaysRelayIdBodyFields[]
  settings?: patchRelaysRelayIdBodySettings
  share?: patchRelaysRelayIdBodyShare
  title?: string
}

/** patchRelaysRelayIdBodyFieldsConfig */
export interface patchRelaysRelayIdBodyFieldsConfig {
  max?: number
  maxLength?: number
  max_count?: number
  min?: number
}

/** patchRelaysRelayIdBodyFieldsOptions */
export interface patchRelaysRelayIdBodyFieldsOptions {
  label: string
  value: string
}

/** patchRelaysRelayIdBodyFields */
export interface patchRelaysRelayIdBodyFields {
  aggregate?: any
  config?: patchRelaysRelayIdBodyFieldsConfig
  default_value?: string
  key: string
  label: string
  options?: patchRelaysRelayIdBodyFieldsOptions[]
  required?: boolean
  type: 'text' | 'textarea' | 'number' | 'image' | 'single_select'
}

/** patchRelaysRelayIdBodySettings */
export interface patchRelaysRelayIdBodySettings {
  allow_edit_entry?: boolean
  allow_edit_nickname?: boolean
  allow_guest?: boolean
  allow_withdraw?: boolean
  deadline?: any
  max_entries_per_participant?: number
  participant_limit?: any
  show_participant_count?: boolean
  show_sequence?: boolean
  show_statistics?: boolean
}

/** patchRelaysRelayIdBodyShare */
export interface patchRelaysRelayIdBodyShare {
  enabled: boolean
}

/**
 * @description Relays/更新接龙--接口返回值
 * @url PATCH /relays/{relayId}
 */
export type patchRelaysRelayIdRes = object

/**
 * @description Relays/软删除接龙--接口返回值
 * @url DELETE /relays/{relayId}
 */
export type deleteRelaysRelayIdRes = object

/**
 * @description Relays/关闭接龙--接口返回值
 * @url POST /relays/{relayId}/close
 */
export type postRelaysRelayIdCloseRes = object

/**
 * @description Relays/重新开启接龙--接口返回值
 * @url POST /relays/{relayId}/reopen
 */
export type postRelaysRelayIdReopenRes = object

/**
 * @description Relays/加入接龙或获取当前参与者--接口请求Body参数
 * @url POST /relays/{relayId}/participants/me
 */
export interface postRelayIdParticipantsMeBody {
  nickname: string
}

/**
 * @description Relays/加入接龙或获取当前参与者--接口返回值
 * @url POST /relays/{relayId}/participants/me
 */
export type postRelayIdParticipantsMeRes = object

/**
 * @description Relays/获取当前接龙参与者--接口返回值
 * @url GET /relays/{relayId}/participants/me
 */
export type getRelayIdParticipantsMeRes = object

/**
 * @description Relays/修改当前参与者昵称--接口请求Body参数
 * @url PATCH /relays/{relayId}/participants/me
 */
export interface patchRelayIdParticipantsMeBody {
  nickname: string
}

/**
 * @description Relays/修改当前参与者昵称--接口返回值
 * @url PATCH /relays/{relayId}/participants/me
 */
export type patchRelayIdParticipantsMeRes = object

/**
 * @description Relays/获取接龙记录--接口请求Query参数
 * @url GET /relays/{relayId}/entries
 */
export interface getRelaysRelayIdEntriesQuery {
  status?: string

  page?: number

  limit?: number

  pageSize?: number
}

/**
 * @description Relays/获取接龙记录--接口返回值
 * @url GET /relays/{relayId}/entries
 */
export type getRelaysRelayIdEntriesRes = object

/**
 * @description Relays/提交接龙记录--接口请求Body参数
 * @url POST /relays/{relayId}/entries
 */
export interface postRelaysRelayIdEntriesBody {
  client_request_id: string
  values: { [key: string]: any }
}

/**
 * @description Relays/提交接龙记录--接口返回值
 * @url POST /relays/{relayId}/entries
 */
export type postRelaysRelayIdEntriesRes = object

/**
 * @description Relays/修改自己的接龙记录--接口路径参数
 * @url PATCH /relays/{relayId}/entries/{entryId}
 */
export interface patchRelayIdEntriesEntryIdPathQuery {
  relayId: string

  entryId: string
}

/**
 * @description Relays/修改自己的接龙记录--接口请求Body参数
 * @url PATCH /relays/{relayId}/entries/{entryId}
 */
export interface patchRelayIdEntriesEntryIdBody {
  values: { [key: string]: any }
}

/**
 * @description Relays/修改自己的接龙记录--接口返回值
 * @url PATCH /relays/{relayId}/entries/{entryId}
 */
export type patchRelayIdEntriesEntryIdRes = object

/**
 * @description Relays/撤回或删除接龙记录--接口路径参数
 * @url DELETE /relays/{relayId}/entries/{entryId}
 */
export interface deleteRelayIdEntriesEntryIdPathQuery {
  relayId: string

  entryId: string
}

/**
 * @description Relays/撤回或删除接龙记录--接口返回值
 * @url DELETE /relays/{relayId}/entries/{entryId}
 */
export type deleteRelayIdEntriesEntryIdRes = object
