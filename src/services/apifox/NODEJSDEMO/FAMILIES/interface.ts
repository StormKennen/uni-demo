/**
 * @description Families/获取家族成员列表--接口请求Query参数
 * @url GET /families/members
 */
export interface getFamiliesMembersQuery {
  surname?: string

  fullName?: string

  gender?: string

  'nameZh.full'?: string

  'nameEn.first'?: string

  'nameEn.last'?: string

  'nameEn.full'?: string

  'namePy.surname'?: string

  'namePy.given'?: string

  'namePy.full'?: string

  name?: string

  q?: string

  birthDateStart?: string

  birthDateEnd?: string

  generation?: number

  generationMin?: number

  generationMax?: number

  currentAddress?: string

  villageAddress?: string

  phone?: string

  email?: string

  wechatId?: string

  qqNumber?: string

  sortBy?: string

  limit?: number

  page?: number
}

/**
 * @description Families/获取家族成员列表--接口返回值
 * @url GET /families/members
 */
export interface getFamiliesMembersRes {
  items?: getFamiliesMembersResItems[]
  pagination?: getFamiliesMembersResPagination
}

/** getFamiliesMembersResItemsAddress */
export interface getFamiliesMembersResItemsAddress {
  currentAddress?: string
  villageAddress?: string
}

/** getFamiliesMembersResItemsContact */
export interface getFamiliesMembersResItemsContact {
  email?: string
  phone?: string
  qqNumber?: string
  wechatId?: string
  wechatQrUrl?: string
}

/** getFamiliesMembersResItemsNameEn */
export interface getFamiliesMembersResItemsNameEn {
  /** 英文名 */
  first?: string
  /** 英文全名（只读，由模型生成） */
  full?: string
  /** 英文姓 */
  last?: string
}

/** getFamiliesMembersResItemsNamePy */
export interface getFamiliesMembersResItemsNamePy {
  /** 拼音全名（只读，由模型生成） */
  full?: string
  /** 拼音名字 */
  given?: string
  /** 拼音姓氏 */
  surname?: string
}

/** getFamiliesMembersResItemsNameZh */
export interface getFamiliesMembersResItemsNameZh {
  /** 中文全名（只读，由模型生成） */
  full?: string
  /** 中文名字 */
  given?: string
  /** 中文姓氏 */
  surname?: string
}

/** getFamiliesMembersResItems */
export interface getFamiliesMembersResItems {
  address?: getFamiliesMembersResItemsAddress
  albumImages?: string[]
  avatarUrl?: string
  birthDate?: string
  children?: string[]
  contact?: getFamiliesMembersResItemsContact
  createdAt?: string
  gender?: 'male' | 'female' | 'unknown'
  /** 世代，整数类型，范围0-100，默认为0（未设置） */
  generation?: number
  givenName?: string
  id?: string
  nameEn?: getFamiliesMembersResItemsNameEn
  namePy?: getFamiliesMembersResItemsNamePy
  nameZh?: getFamiliesMembersResItemsNameZh
  notes?: string
  parents?: string[]
  surname?: string
  updatedAt?: string
}

/** getFamiliesMembersResPagination */
export interface getFamiliesMembersResPagination {
  /** 是否有下一页 */
  hasNext?: boolean
  hasNextPage?: boolean
  /** 是否有上一页 */
  hasPrev?: boolean
  hasPrevPage?: boolean
  /** 每页数量 */
  limit?: number
  /** 当前页码 */
  page?: number
  /** 总记录数 */
  total?: number
  /** 总页数 */
  totalPages?: number
  totalResults?: number
}

/**
 * @description Families/创建家族成员（需登录）--接口请求Body参数
 * @url POST /families/members
 */
export interface postFamiliesMembersBody {
  address?: postFamiliesMembersBodyAddress
  albumImages?: string[]
  avatarUrl?: string
  birthDate?: string
  contact?: postFamiliesMembersBodyContact
  gender?: 'male' | 'female' | 'unknown'
  /** 世代，整数类型，范围0-100，默认为0（未设置） */
  generation?: number
  givenName: string
  nameEn?: postFamiliesMembersBodyNameEn
  namePy?: postFamiliesMembersBodyNamePy
  nameZh?: postFamiliesMembersBodyNameZh
  notes?: string
  parents?: string[]
  surname: string
}

/** postFamiliesMembersBodyAddress */
export interface postFamiliesMembersBodyAddress {
  currentAddress?: string
  villageAddress?: string
}

/** postFamiliesMembersBodyContact */
export interface postFamiliesMembersBodyContact {
  email?: string
  phone?: string
  qqNumber?: string
  wechatId?: string
  wechatQrUrl?: string
}

/** postFamiliesMembersBodyNameEn */
export interface postFamiliesMembersBodyNameEn {
  first?: string
  last?: string
}

/** postFamiliesMembersBodyNamePy */
export interface postFamiliesMembersBodyNamePy {
  given?: string
  surname?: string
}

/** postFamiliesMembersBodyNameZh */
export interface postFamiliesMembersBodyNameZh {
  given?: string
  surname?: string
}

/**
 * @description Families/创建家族成员（需登录）--接口返回值
 * @url POST /families/members
 */
export interface postFamiliesMembersRes {
  address?: postFamiliesMembersResAddress
  albumImages?: string[]
  avatarUrl?: string
  birthDate?: string
  children?: string[]
  contact?: postFamiliesMembersResContact
  createdAt?: string
  gender?: 'male' | 'female' | 'unknown'
  /** 世代，整数类型，范围0-100，默认为0（未设置） */
  generation?: number
  givenName?: string
  id?: string
  nameEn?: postFamiliesMembersResNameEn
  namePy?: postFamiliesMembersResNamePy
  nameZh?: postFamiliesMembersResNameZh
  notes?: string
  parents?: string[]
  surname?: string
  updatedAt?: string
}

/** postFamiliesMembersResAddress */
export interface postFamiliesMembersResAddress {
  currentAddress?: string
  villageAddress?: string
}

/** postFamiliesMembersResContact */
export interface postFamiliesMembersResContact {
  email?: string
  phone?: string
  qqNumber?: string
  wechatId?: string
  wechatQrUrl?: string
}

/** postFamiliesMembersResNameEn */
export interface postFamiliesMembersResNameEn {
  /** 英文名 */
  first?: string
  /** 英文全名（只读，由模型生成） */
  full?: string
  /** 英文姓 */
  last?: string
}

/** postFamiliesMembersResNamePy */
export interface postFamiliesMembersResNamePy {
  /** 拼音全名（只读，由模型生成） */
  full?: string
  /** 拼音名字 */
  given?: string
  /** 拼音姓氏 */
  surname?: string
}

/** postFamiliesMembersResNameZh */
export interface postFamiliesMembersResNameZh {
  /** 中文全名（只读，由模型生成） */
  full?: string
  /** 中文名字 */
  given?: string
  /** 中文姓氏 */
  surname?: string
}

/**
 * @description Families/获取成员详情--接口返回值
 * @url GET /families/members/{memberId}
 */
export interface getFamiliesMembersMemberIdRes {
  address?: getFamiliesMembersMemberIdResAddress
  albumImages?: string[]
  avatarUrl?: string
  birthDate?: string
  children?: string[]
  contact?: getFamiliesMembersMemberIdResContact
  createdAt?: string
  gender?: 'male' | 'female' | 'unknown'
  /** 世代，整数类型，范围0-100，默认为0（未设置） */
  generation?: number
  givenName?: string
  id?: string
  nameEn?: getFamiliesMembersMemberIdResNameEn
  namePy?: getFamiliesMembersMemberIdResNamePy
  nameZh?: getFamiliesMembersMemberIdResNameZh
  notes?: string
  parents?: string[]
  surname?: string
  updatedAt?: string
}

/** getFamiliesMembersMemberIdResAddress */
export interface getFamiliesMembersMemberIdResAddress {
  currentAddress?: string
  villageAddress?: string
}

/** getFamiliesMembersMemberIdResContact */
export interface getFamiliesMembersMemberIdResContact {
  email?: string
  phone?: string
  qqNumber?: string
  wechatId?: string
  wechatQrUrl?: string
}

/** getFamiliesMembersMemberIdResNameEn */
export interface getFamiliesMembersMemberIdResNameEn {
  /** 英文名 */
  first?: string
  /** 英文全名（只读，由模型生成） */
  full?: string
  /** 英文姓 */
  last?: string
}

/** getFamiliesMembersMemberIdResNamePy */
export interface getFamiliesMembersMemberIdResNamePy {
  /** 拼音全名（只读，由模型生成） */
  full?: string
  /** 拼音名字 */
  given?: string
  /** 拼音姓氏 */
  surname?: string
}

/** getFamiliesMembersMemberIdResNameZh */
export interface getFamiliesMembersMemberIdResNameZh {
  /** 中文全名（只读，由模型生成） */
  full?: string
  /** 中文名字 */
  given?: string
  /** 中文姓氏 */
  surname?: string
}

/**
 * @description Families/更新成员信息（需登录）--接口路径参数
 * @url PATCH /families/members/{memberId}
 */
export interface patchFamiliesMembersMemberIdPathQuery {
  /** Bearer Token example: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 */
  memberId: string

  memberId: string
}

/**
 * @description Families/更新成员信息（需登录）--接口请求Body参数
 * @url PATCH /families/members/{memberId}
 */
export interface patchFamiliesMembersMemberIdBody {
  gender?: 'male' | 'female' | 'unknown'
  givenName?: string
  nameEn?: patchFamiliesMembersMemberIdBodyNameEn
  namePy?: patchFamiliesMembersMemberIdBodyNamePy
  nameZh?: patchFamiliesMembersMemberIdBodyNameZh
  surname?: string
}

/** patchFamiliesMembersMemberIdBodyNameEn */
export interface patchFamiliesMembersMemberIdBodyNameEn {
  first?: string
  last?: string
}

/** patchFamiliesMembersMemberIdBodyNamePy */
export interface patchFamiliesMembersMemberIdBodyNamePy {
  given?: string
  surname?: string
}

/** patchFamiliesMembersMemberIdBodyNameZh */
export interface patchFamiliesMembersMemberIdBodyNameZh {
  given?: string
  surname?: string
}

/**
 * @description Families/更新成员信息（需登录）--接口返回值
 * @url PATCH /families/members/{memberId}
 */
export interface patchFamiliesMembersMemberIdRes {
  address?: patchFamiliesMembersMemberIdResAddress
  albumImages?: string[]
  avatarUrl?: string
  birthDate?: string
  children?: string[]
  contact?: patchFamiliesMembersMemberIdResContact
  createdAt?: string
  gender?: 'male' | 'female' | 'unknown'
  /** 世代，整数类型，范围0-100，默认为0（未设置） */
  generation?: number
  givenName?: string
  id?: string
  nameEn?: patchFamiliesMembersMemberIdResNameEn
  namePy?: patchFamiliesMembersMemberIdResNamePy
  nameZh?: patchFamiliesMembersMemberIdResNameZh
  notes?: string
  parents?: string[]
  surname?: string
  updatedAt?: string
}

/** patchFamiliesMembersMemberIdResAddress */
export interface patchFamiliesMembersMemberIdResAddress {
  currentAddress?: string
  villageAddress?: string
}

/** patchFamiliesMembersMemberIdResContact */
export interface patchFamiliesMembersMemberIdResContact {
  email?: string
  phone?: string
  qqNumber?: string
  wechatId?: string
  wechatQrUrl?: string
}

/** patchFamiliesMembersMemberIdResNameEn */
export interface patchFamiliesMembersMemberIdResNameEn {
  /** 英文名 */
  first?: string
  /** 英文全名（只读，由模型生成） */
  full?: string
  /** 英文姓 */
  last?: string
}

/** patchFamiliesMembersMemberIdResNamePy */
export interface patchFamiliesMembersMemberIdResNamePy {
  /** 拼音全名（只读，由模型生成） */
  full?: string
  /** 拼音名字 */
  given?: string
  /** 拼音姓氏 */
  surname?: string
}

/** patchFamiliesMembersMemberIdResNameZh */
export interface patchFamiliesMembersMemberIdResNameZh {
  /** 中文全名（只读，由模型生成） */
  full?: string
  /** 中文名字 */
  given?: string
  /** 中文姓氏 */
  surname?: string
}

/**
 * @description Families/删除成员（需登录）--接口路径参数
 * @url DELETE /families/members/{memberId}
 */
export interface deleteFamiliesMembersMemberIdPathQuery {
  /** Bearer Token example: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 */
  memberId: string

  memberId: string
}

/**
 * @description Families/删除成员（需登录）--接口返回值
 * @url DELETE /families/members/{memberId}
 */
export type deleteFamiliesMembersMemberIdRes = any

/**
 * @description Families/按姓氏获取家族树--接口请求Query参数
 * @url GET /families/trees
 */
export interface getFamiliesTreesQuery {
  /** 姓氏 example: 王 */
  surname: string
  /** 最大深度 example: 5 */
  maxDepth?: number
  /** 返回格式 example: raw */
  format?: string
}

/**
 * @description Families/按姓氏获取家族树--接口返回值
 * @url GET /families/trees
 */
export interface getFamiliesTreesRes {
  roots?: string[]
  surname?: string
  trees?: { [key: string]: any }[]
}

/**
 * @description Families/按成员ID获取家族树--接口请求Query参数
 * @url GET /families/trees/member/{memberId}
 */
export interface getTreesMemberMemberIdQuery {
  maxDepth?: number

  format?: string
}

/**
 * @description Families/按成员ID获取家族树--接口返回值
 * @url GET /families/trees/member/{memberId}
 */
export type getTreesMemberMemberIdRes = string

/**
 * @description Families/创建家族分享链接--接口返回值
 * @url POST /families/members/{memberId}/share
 */
export interface postMembersMemberIdShareRes {
  expiresAt?: string
  memberId?: string
  shareId?: string
}

/**
 * @description Families/获取分享信息--接口返回值
 * @url POST /families/share/{shareId}
 */
export type postFamiliesShareShareIdRes = object

/**
 * @description Families/更新分享设置--接口返回值
 * @url PUT /families/share/{shareId}
 */
export type putFamiliesShareShareIdRes = object

/**
 * @description Families/删除分享--接口返回值
 * @url DELETE /families/share/{shareId}
 */
export type deleteFamiliesShareShareIdRes = string

/**
 * @description Families/获取分享的家族数据--接口返回值
 * @url POST /families/share/{shareId}/data
 */
export type postShareShareIdDataRes = object

/**
 * @description Families/获取成员的分享列表--接口返回值
 * @url GET /families/members/{memberId}/shares
 */
export type getMembersMemberIdSharesRes = { [key: string]: any }[]

/**
 * @description Families/为成员创建事件--接口返回值
 * @url POST /families/members/{memberId}/events
 */
export type postMembersMemberIdEventsRes = object

/**
 * @description Families/获取家族事件列表--接口返回值
 * @url GET /families/events
 */
export type getFamiliesEventsRes = { [key: string]: any }[]

/**
 * @description Families/获取事件详情--接口返回值
 * @url GET /families/events/{eventId}
 */
export type getFamiliesEventsEventIdRes = object

/**
 * @description Families/更新事件信息--接口返回值
 * @url PUT /families/events/{eventId}
 */
export type putFamiliesEventsEventIdRes = object

/**
 * @description Families/删除事件--接口返回值
 * @url DELETE /families/events/{eventId}
 */
export type deleteFamiliesEventsEventIdRes = string

/**
 * @description Families/获取家族时间线数据--接口返回值
 * @url GET /families/timeline
 */
export type getFamiliesTimelineRes = object
