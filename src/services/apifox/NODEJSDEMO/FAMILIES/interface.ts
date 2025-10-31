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
export type getFamiliesMembersRes = getFamiliesMembersResItem[]

/** getFamiliesMembersResItemAddress */
export interface getFamiliesMembersResItemAddress {
  currentAddress?: string
  villageAddress?: string
}

/** getFamiliesMembersResItemContact */
export interface getFamiliesMembersResItemContact {
  email?: string
  phone?: string
  qqNumber?: string
  wechatId?: string
  wechatQrUrl?: string
}

/** getFamiliesMembersResItemNameEn */
export interface getFamiliesMembersResItemNameEn {
  first?: string
  full?: string
  last?: string
}

/** getFamiliesMembersResItemNamePy */
export interface getFamiliesMembersResItemNamePy {
  full?: string
  given?: string
  surname?: string
}

/** getFamiliesMembersResItemNameZh */
export interface getFamiliesMembersResItemNameZh {
  full?: string
  given?: string
  surname?: string
}

/** getFamiliesMembersResItem */
export interface getFamiliesMembersResItem {
  address?: getFamiliesMembersResItemAddress
  albumImages?: string[]
  avatarUrl?: string
  birthDate?: string
  children?: string[]
  contact?: getFamiliesMembersResItemContact
  createdAt?: string
  gender?: 'male' | 'female' | 'unknown'
  givenName?: string
  id?: string
  nameEn?: getFamiliesMembersResItemNameEn
  namePy?: getFamiliesMembersResItemNamePy
  nameZh?: getFamiliesMembersResItemNameZh
  notes?: string
  parents?: string[]
  surname?: string
  updatedAt?: string
}

/**
 * @description Families/按姓氏获取家族树--接口请求Query参数
 * @url GET /families/trees
 */
export interface getFamiliesTreesQuery {
  /** 姓氏 */
  surname: string
  /** 最大深度 */
  maxDepth?: number
  /** 返回格式 */
  format?: string
}

/**
 * @description Families/按姓氏获取家族树--接口返回值
 * @url GET /families/trees
 */
export interface getFamiliesTreesRes {
  roots?: string[]
  surname?: string
  trees?: getFamiliesTreesResTreesItem[]
}

/** getFamiliesTreesResTrees */
export interface getFamiliesTreesResTreesItem {}

/**
 * @description Families/创建家族成员（需登录）--接口请求Body参数
 * @url POST /families/members
 */
export interface postFamiliesMembersBody {
  gender?: 'male' | 'female' | 'unknown'
  givenName: string
  nameEn?: postFamiliesMembersBodyNameEn
  namePy?: postFamiliesMembersBodyNamePy
  nameZh?: postFamiliesMembersBodyNameZh
  surname: string
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
export type postFamiliesMembersRes = string

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
  first?: string
  full?: string
  last?: string
}

/** getFamiliesMembersMemberIdResNamePy */
export interface getFamiliesMembersMemberIdResNamePy {
  full?: string
  given?: string
  surname?: string
}

/** getFamiliesMembersMemberIdResNameZh */
export interface getFamiliesMembersMemberIdResNameZh {
  full?: string
  given?: string
  surname?: string
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
  first?: string
  full?: string
  last?: string
}

/** patchFamiliesMembersMemberIdResNamePy */
export interface patchFamiliesMembersMemberIdResNamePy {
  full?: string
  given?: string
  surname?: string
}

/** patchFamiliesMembersMemberIdResNameZh */
export interface patchFamiliesMembersMemberIdResNameZh {
  full?: string
  given?: string
  surname?: string
}

/**
 * @description Families/删除成员（需登录）--接口返回值
 * @url DELETE /families/members/{memberId}
 */
export type deleteFamiliesMembersMemberIdRes = string

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
export type postMembersMemberIdShareRes = string

/**
 * @description Families/获取分享信息--接口返回值
 * @url POST /families/share/{shareId}
 */
export interface postFamiliesShareShareIdRes {}

/**
 * @description Families/更新分享设置--接口返回值
 * @url PUT /families/share/{shareId}
 */
export interface putFamiliesShareShareIdRes {}

/**
 * @description Families/删除分享--接口返回值
 * @url DELETE /families/share/{shareId}
 */
export type deleteFamiliesShareShareIdRes = string

/**
 * @description Families/获取分享的家族数据--接口返回值
 * @url POST /families/share/{shareId}/data
 */
export interface postShareShareIdDataRes {}

/**
 * @description Families/获取成员的分享列表--接口返回值
 * @url GET /families/members/{memberId}/shares
 */
export interface getMembersMemberIdSharesRes {}

/**
 * @description Families/为成员创建事件--接口返回值
 * @url POST /families/members/{memberId}/events
 */
export type postMembersMemberIdEventsRes = string

/**
 * @description Families/获取家族事件列表--接口返回值
 * @url GET /families/events
 */
export interface getFamiliesEventsRes {}

/**
 * @description Families/获取事件详情--接口返回值
 * @url GET /families/events/{eventId}
 */
export interface getFamiliesEventsEventIdRes {}

/**
 * @description Families/更新事件信息--接口返回值
 * @url PUT /families/events/{eventId}
 */
export interface putFamiliesEventsEventIdRes {}

/**
 * @description Families/删除事件--接口返回值
 * @url DELETE /families/events/{eventId}
 */
export type deleteFamiliesEventsEventIdRes = string

/**
 * @description Families/获取家族时间线数据--接口返回值
 * @url GET /families/timeline
 */
export interface getFamiliesTimelineRes {}

/**
 * @description Families/建立父母与子女关系（需登录）--接口返回值
 * @url POST /families/relationships/link
 */
export interface postFamiliesRelationshipsLinkRes {}
