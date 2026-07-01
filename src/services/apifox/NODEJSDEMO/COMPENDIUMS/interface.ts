/**
 * @description Compendiums/获取图鉴列表--接口请求Query参数
 * @url GET /compendiums
 */
export interface getCompendiumsQuery {
  /** 关键词模糊搜索，命中人物英文主名称、国际化名称、别名、人物编码、简介。 */
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
 * @description Compendiums/获取图鉴配置（分类定义与属性定义）--接口请求Query参数
 * @url GET /compendiums/config
 */
export interface getCompendiumsConfigQuery {
  /** 图鉴 ID 或 code */
  compendiumId: string
}

/**
 * @description Compendiums/获取图鉴配置（分类定义与属性定义）--接口返回值
 * @url GET /compendiums/config
 */
export interface getCompendiumsConfigRes {
  attributes?: getCompendiumsConfigResAttributes[]
  categories?: getCompendiumsConfigResCategories[]
  game?: getCompendiumsConfigResGame
}

/** getCompendiumsConfigResAttributes */
export interface getCompendiumsConfigResAttributes {
  higherIsBetter?: boolean
  id?: string
  key?: string
  name?: string
  rankable?: boolean
  sortOrder?: number
  unit?: string
  valueType?: 'number' | 'percent' | 'text'
}

/** getCompendiumsConfigResCategoriesOptions */
export interface getCompendiumsConfigResCategoriesOptionsItem {
  color?: string
  icon?: string
  id?: string
  key?: string
  name?: string
  sortOrder?: number
}

/** getCompendiumsConfigResCategories */
export interface getCompendiumsConfigResCategories {
  id?: string
  key?: string
  name?: string
  options?: getCompendiumsConfigResCategoriesOptionsItem[]
  sortOrder?: number
}

/** getCompendiumsConfigResGame */
export interface getCompendiumsConfigResGame {
  code?: string
  description?: string
  icon?: string
  id?: string
  name?: string
  status?: 'enabled' | 'disabled'
}

/**
 * @description Compendiums/获取人物列表--接口请求Query参数
 * @url GET /compendiums/characters
 */
export interface getCompendiumsCharactersQuery {
  compendiumId: string
  /** 关键词模糊搜索，命中人物英文主名称、各语言译名（中文名等）、别名、人物编码、简介；名称匹配跨全部语言，不受 locale 限制。 */
  keyword?: string
  /** 国际化语言参数，例如 en、zh-CN。仅用于结果展示本地化，不影响名称搜索范围；未提供或未找到翻译时自动回退英文。 */
  locale?: string
  /** 已废弃，请改用 categories[element] */
  element?: string
  /** 已废弃，请改用 categories[<分类key>] */
  speciesType?: string
  /** 已废弃，请改用 categories[family] */
  family?: string
  /** 按任意动态分类 key 聚合，例如 family。设置后每个分类选项只返回一个代表人物， 分页总数表示分组数量；不设置时仍返回普通人物列表。 */
  groupBy?: string
  /** 选择代表人物时优先比较的人物字段或动态属性 key。默认使用该图鉴按 sortOrder 排在最前的 rankable 属性；没有可排名属性时使用 level。 */
  representativeSortBy?: string
  /** 代表人物主排序方向，默认 desc。 */
  representativeSortOrder?: string
  /** 主排序值相同时，用哪个动态分类决定代表人物，例如 element。 未设置时按该图鉴所有非分组分类的 definition/option sortOrder 依次比较。 */
  representativeCategory?: string
  /** representativeCategory 的选项优先级，逗号分隔，可传 key 或 name， 例如 dark,light,fire,wind,water。未设置时使用 CategoryOption.sortOrder。 */
  representativeCategoryOrder?: string

  attribute?: string

  minValue?: number

  maxValue?: number
  /** 普通模式按人物字段或动态属性排序；聚合模式按代表人物排序。 聚合模式可传 stars、attack 等动态属性，也可传 group 按分组选项排序。 若传入当前图鉴未配置的排序 key，将回退为 group 排序并正常返回数据。 */
  sortBy?: string

  sortOrder?: string

  page?: number

  pageSize?: number
}

/**
 * @description Compendiums/获取人物列表--接口返回值
 * @url GET /compendiums/characters
 */
export interface getCompendiumsCharactersRes {
  items?: any[]
  pagination?: getCompendiumsCharactersResPagination
}

/** getCompendiumsCharactersResPagination */
export interface getCompendiumsCharactersResPagination {
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
 * @description Compendiums/获取人物详情（含技能和排名）--接口请求Query参数
 * @url GET /compendiums/character
 */
export interface getCompendiumsCharacterQuery {
  /** 图鉴 ID 或 code */
  compendiumId: string
  /** 人物 ID */
  characterId: string
  /** 国际化语言参数，例如 en、zh-CN。未提供或未找到翻译时自动回退英文。 */
  locale?: string
}

/**
 * @description Compendiums/获取人物详情（含技能和排名）--接口返回值
 * @url GET /compendiums/character
 */
export type getCompendiumsCharacterRes = string

/**
 * @description Compendiums/获取单个人物的各属性排名--接口请求Query参数
 * @url GET /compendiums/character-rankings
 */
export interface getCompendiumsCharacterRankingsQuery {
  /** 图鉴 ID 或 code */
  compendiumId: string
  /** 人物 ID */
  characterId: string
}

/**
 * @description Compendiums/获取单个人物的各属性排名--接口返回值
 * @url GET /compendiums/character-rankings
 */
export type getCompendiumsCharacterRankingsRes =
  getCompendiumsCharacterRankingsResItem[]

/** getCompendiumsCharacterRankingsResItem */
export interface getCompendiumsCharacterRankingsResItem {
  /** 属性名称 */
  attribute?: string
  /** 展示值 */
  displayValue?: string
  /** 属性 key */
  key?: string
  /** 排名 */
  rank?: number
  /** 总参与排名数 */
  total?: number
  /** 单位 */
  unit?: string
  /** 属性值 */
  value?: number
}

/**
 * @description Compendiums/获取属性排行榜--接口请求Query参数
 * @url GET /compendiums/rankings
 */
export interface getCompendiumsRankingsQuery {
  /** 图鉴 ID 或 code */
  compendiumId: string
  /** 属性 key（必须为 rankable 属性） */
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
  /** 图鉴 ID 或 code */
  compendiumId: string
  /** 逗号分隔的人物 ID 列表 */
  ids: string
}

/**
 * @description Compendiums/对比多个人物--接口返回值
 * @url GET /compendiums/compare
 */
export type getCompendiumsCompareRes = getCompendiumsCompareResItem[]

/** getCompendiumsCompareResItemAttributes */
export interface getCompendiumsCompareResItemAttributes {
  displayValue?: string
  key?: string
  name?: string
  rank?: any
  rankable?: boolean
  sortOrder?: number
  total?: any
  unit?: string
  value?: string
  valueType?: 'number' | 'percent' | 'text'
}

/** getCompendiumsCompareResItemCategories */
export interface getCompendiumsCompareResItemCategories {
  color?: string
  icon?: string
  key?: string
  name?: string
  value?: string
  valueKey?: string
}

/** getCompendiumsCompareResItemSkillsCoefficients */
export interface getCompendiumsCompareResItemSkillsCoefficients {
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

/** getCompendiumsCompareResItemSkills */
export interface getCompendiumsCompareResItemSkills {
  attachment?: string
  /** 技能业务编码；没有时可仅使用 id。 */
  code?: string
  coefficients?: getCompendiumsCompareResItemSkillsCoefficients[]
  cooldown?: string
  /** 从 cooldown 文本中提取的回合数，便于前端直接展示。 */
  cooldownTurns?: any
  cost?: string
  /** 按 locale 返回的技能描述；当前语言缺失时自动回退英文。 */
  description?: string
  /** 命中次数；未明确提供时为 null。 */
  hitCount?: any
  /** 技能唯一 ID。更新人物或国际化文案时建议原样回传，用于稳定匹配技能记录。 */
  id?: string
  /** 技能系数字符串，保留完整展示公式，不参与计算。 */
  multiplierFormula?: string
  /** 按 locale 返回的技能名称；当前语言缺失时自动回退英文。 */
  name?: string
  sortOrder?: number
  type?: string
}

/** getCompendiumsCompareResItemSkins */
export interface getCompendiumsCompareResItemSkins {
  attachment?: string
  /** 按 locale 返回的人物描述；当前语言缺失时自动回退英文。 */
  description?: string
  id?: string
  image?: string
  isDefault?: boolean
  name?: string
  sortOrder?: number
}

/** getCompendiumsCompareResItem */
export interface getCompendiumsCompareResItem {
  aliases?: string[]
  attributes?: getCompendiumsCompareResItemAttributes[]
  avatar?: string
  categories?: getCompendiumsCompareResItemCategories[]
  code?: string
  /** 按 locale 返回的人物描述；当前语言缺失时自动回退英文。 */
  description?: string
  id?: string
  level?: string
  /** 按 locale 返回的人物名称；当前语言缺失时自动回退英文。 */
  name?: string
  skills?: getCompendiumsCompareResItemSkills[]
  skins?: getCompendiumsCompareResItemSkins[]
  sortOrder?: number
  status?: 'enabled' | 'disabled'
}
