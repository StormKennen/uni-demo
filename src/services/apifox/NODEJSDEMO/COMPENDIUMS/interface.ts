/**
 * @description Compendiums/获取图鉴详情--接口请求Query参数
 * @url GET /compendiums/detail
 */
export interface getCompendiumsDetailQuery {
  /** 图鉴 ID 或 code */
  compendiumId: string
}

/**
 * @description Compendiums/获取图鉴详情--接口返回值
 * @url GET /compendiums/detail
 */
export interface getCompendiumsDetailRes {
  code?: string
  description?: string
  icon?: string
  id?: string
  name?: string
  status?: 'enabled' | 'disabled'
}

/**
 * @description Compendiums/获取图鉴配置--接口请求Query参数
 * @url GET /compendiums/config
 */
export interface getCompendiumsConfigQuery {
  compendiumId: string
}

/**
 * @description Compendiums/获取图鉴配置--接口返回值
 * @url GET /compendiums/config
 */
export type getCompendiumsConfigRes = object

/**
 * @description Compendiums/获取人物列表--接口请求Query参数
 * @url GET /compendiums/characters
 */
export interface getCompendiumsCharactersQuery {
  compendiumId: string

  keyword?: string

  element?: string

  speciesType?: string

  attribute?: string

  minValue?: number

  maxValue?: number

  sortBy?: string

  sortOrder?: string

  page?: number

  pageSize?: number
}

/**
 * @description Compendiums/获取人物列表--接口返回值
 * @url GET /compendiums/characters
 */
export type getCompendiumsCharactersRes = object

/**
 * @description Compendiums/获取人物详情--接口请求Query参数
 * @url GET /compendiums/character
 */
export interface getCompendiumsCharacterQuery {
  compendiumId: string

  characterId: string
}

/**
 * @description Compendiums/获取人物详情--接口返回值
 * @url GET /compendiums/character
 */
export interface getCompendiumsCharacterRes {
  aliases?: string[]
  attributes?: getCompendiumsCharacterResAttributes[]
  avatar?: string
  categories?: getCompendiumsCharacterResCategories[]
  code?: string
  description?: string
  id?: string
  level?: string
  name?: string
  skills?: getCompendiumsCharacterResSkills[]
  skins?: getCompendiumsCharacterResSkins[]
  sortOrder?: number
  status?: 'enabled' | 'disabled'
}

/** getCompendiumsCharacterResAttributes */
export interface getCompendiumsCharacterResAttributes {
  displayValue?: string
  key?: string
  name?: string
  rank?: any
  rankable?: boolean
  total?: any
  unit?: string
  value?: string
  valueType?: 'number' | 'percent' | 'text'
}

/** getCompendiumsCharacterResCategories */
export interface getCompendiumsCharacterResCategories {
  color?: string
  icon?: string
  key?: string
  name?: string
  value?: string
  valueKey?: string
}

/** getCompendiumsCharacterResSkillsCoefficients */
export interface getCompendiumsCharacterResSkillsCoefficients {
  attachment?: string
  condition?: string
  description?: string
  formula?: string
  id?: string
  key?: string
  level?: string
  name?: string
  triggerProbability?: any
  triggerUnit?: string
  unit?: string
  value?: number
}

/** getCompendiumsCharacterResSkills */
export interface getCompendiumsCharacterResSkills {
  attachment?: string
  coefficients?: getCompendiumsCharacterResSkillsCoefficients[]
  cooldown?: string
  cost?: string
  description?: string
  id?: string
  name?: string
  sortOrder?: number
  type?: string
}

/** getCompendiumsCharacterResSkins */
export interface getCompendiumsCharacterResSkins {
  attachment?: string
  description?: string
  id?: string
  image?: string
  isDefault?: boolean
  name?: string
  sortOrder?: number
}

/**
 * @description Compendiums/获取人物属性排名--接口请求Query参数
 * @url GET /compendiums/character-rankings
 */
export interface getCompendiumsCharacterRankingsQuery {
  compendiumId: string

  characterId: string
}

/**
 * @description Compendiums/获取人物属性排名--接口返回值
 * @url GET /compendiums/character-rankings
 */
export type getCompendiumsCharacterRankingsRes = object

/**
 * @description Compendiums/获取属性排行榜--接口请求Query参数
 * @url GET /compendiums/rankings
 */
export interface getCompendiumsRankingsQuery {
  compendiumId: string

  attribute: string

  sortOrder?: string

  page?: number

  pageSize?: number
}

/**
 * @description Compendiums/获取属性排行榜--接口返回值
 * @url GET /compendiums/rankings
 */
export type getCompendiumsRankingsRes = getCompendiumsRankingsResItem[]

/** getCompendiumsRankingsResItem */
export interface getCompendiumsRankingsResItem {
  avatar?: string
  characterId?: string
  displayValue?: string
  name?: string
  rank?: number
  total?: number
  value?: number
}

/**
 * @description Compendiums/对比多个人物--接口请求Query参数
 * @url GET /compendiums/compare
 */
export interface getCompendiumsCompareQuery {
  compendiumId: string
  /** 逗号分隔的人物 ID 列表 */
  ids: string
}

/**
 * @description Compendiums/对比多个人物--接口返回值
 * @url GET /compendiums/compare
 */
export type getCompendiumsCompareRes = object

/**
 * @description Compendiums/获取图鉴列表--接口请求Query参数
 * @url GET /compendiums
 */
export interface getCompendiumsQuery {
  keyword?: string

  status?: string

  page?: number

  pageSize?: number

  sortBy?: string
}

/**
 * @description Compendiums/获取图鉴列表--接口返回值
 * @url GET /compendiums
 */
export interface getCompendiumsRes {
  items?: getCompendiumsResItems[]
  pagination?: getCompendiumsResPagination
}

/** getCompendiumsResItems */
export interface getCompendiumsResItems {
  code?: string
  description?: string
  icon?: string
  id?: string
  name?: string
  status?: 'enabled' | 'disabled'
}

/** getCompendiumsResPagination */
export interface getCompendiumsResPagination {
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
