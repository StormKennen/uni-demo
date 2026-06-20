/**
 * @description CompendiumAdmin/创建图鉴--接口请求Body参数
 * @url POST /admin/compendiums
 */
export interface postAdminCompendiumsBody {
  code: string
  description?: string
  icon?: string
  name: string
  status?: 'enabled' | 'disabled'
}

/**
 * @description CompendiumAdmin/创建图鉴--接口返回值
 * @url POST /admin/compendiums
 */
export interface postAdminCompendiumsRes {
  code?: string
  description?: string
  icon?: string
  id?: string
  name?: string
  status?: 'enabled' | 'disabled'
}

/**
 * @description CompendiumAdmin/更新图鉴--接口请求Body参数
 * @url PATCH /admin/compendiums
 */
export interface patchAdminCompendiumsBody {
  code?: string
  compendiumId: string
  description?: string
  icon?: string
  name?: string
  status?: 'enabled' | 'disabled'
}

/**
 * @description CompendiumAdmin/更新图鉴--接口返回值
 * @url PATCH /admin/compendiums
 */
export interface patchAdminCompendiumsRes {
  code?: string
  description?: string
  icon?: string
  id?: string
  name?: string
  status?: 'enabled' | 'disabled'
}

/**
 * @description CompendiumAdmin/单条新增人物--接口请求Body参数
 * @url POST /admin/compendiums/characters
 */
export type postAdminCompendiumsCharactersBody = string

/**
 * @description CompendiumAdmin/单条新增人物--接口返回值
 * @url POST /admin/compendiums/characters
 */
export interface postAdminCompendiumsCharactersRes {
  aliases?: string[]
  attributes?: postAdminCompendiumsCharactersResAttributes[]
  avatar?: string
  categories?: postAdminCompendiumsCharactersResCategories[]
  code?: string
  /** 按 locale 返回的人物描述；当前语言缺失时自动回退英文。 */
  description?: string
  id?: string
  level?: string
  /** 按 locale 返回的人物名称；当前语言缺失时自动回退英文。 */
  name?: string
  skills?: postAdminCompendiumsCharactersResSkills[]
  skins?: postAdminCompendiumsCharactersResSkins[]
  sortOrder?: number
  status?: 'enabled' | 'disabled'
}

/** postAdminCompendiumsCharactersResAttributes */
export interface postAdminCompendiumsCharactersResAttributes {
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

/** postAdminCompendiumsCharactersResCategories */
export interface postAdminCompendiumsCharactersResCategories {
  color?: string
  icon?: string
  key?: string
  name?: string
  value?: string
  valueKey?: string
}

/** postAdminCompendiumsCharactersResSkillsCoefficients */
export interface postAdminCompendiumsCharactersResSkillsCoefficients {
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

/** postAdminCompendiumsCharactersResSkills */
export interface postAdminCompendiumsCharactersResSkills {
  attachment?: string
  /** 技能业务编码；没有时可仅使用 id。 */
  code?: string
  coefficients?: postAdminCompendiumsCharactersResSkillsCoefficients[]
  cooldown?: string
  cost?: string
  /** 按 locale 返回的技能描述；当前语言缺失时自动回退英文。 */
  description?: string
  /** 技能唯一 ID。更新人物或国际化文案时建议原样回传，用于稳定匹配技能记录。 */
  id?: string
  /** 按 locale 返回的技能名称；当前语言缺失时自动回退英文。 */
  name?: string
  sortOrder?: number
  type?: string
}

/** postAdminCompendiumsCharactersResSkins */
export interface postAdminCompendiumsCharactersResSkins {
  attachment?: string
  /** 按 locale 返回的人物描述；当前语言缺失时自动回退英文。 */
  description?: string
  id?: string
  image?: string
  isDefault?: boolean
  name?: string
  sortOrder?: number
}

/**
 * @description CompendiumAdmin/更新人物--接口请求Body参数
 * @url PATCH /admin/compendiums/characters
 */
export type patchAdminCompendiumsCharactersBody = string

/**
 * @description CompendiumAdmin/更新人物--接口返回值
 * @url PATCH /admin/compendiums/characters
 */
export interface patchAdminCompendiumsCharactersRes {
  aliases?: string[]
  attributes?: patchAdminCompendiumsCharactersResAttributes[]
  avatar?: string
  categories?: patchAdminCompendiumsCharactersResCategories[]
  code?: string
  /** 按 locale 返回的人物描述；当前语言缺失时自动回退英文。 */
  description?: string
  id?: string
  level?: string
  /** 按 locale 返回的人物名称；当前语言缺失时自动回退英文。 */
  name?: string
  skills?: patchAdminCompendiumsCharactersResSkills[]
  skins?: patchAdminCompendiumsCharactersResSkins[]
  sortOrder?: number
  status?: 'enabled' | 'disabled'
}

/** patchAdminCompendiumsCharactersResAttributes */
export interface patchAdminCompendiumsCharactersResAttributes {
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

/** patchAdminCompendiumsCharactersResCategories */
export interface patchAdminCompendiumsCharactersResCategories {
  color?: string
  icon?: string
  key?: string
  name?: string
  value?: string
  valueKey?: string
}

/** patchAdminCompendiumsCharactersResSkillsCoefficients */
export interface patchAdminCompendiumsCharactersResSkillsCoefficients {
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

/** patchAdminCompendiumsCharactersResSkills */
export interface patchAdminCompendiumsCharactersResSkills {
  attachment?: string
  /** 技能业务编码；没有时可仅使用 id。 */
  code?: string
  coefficients?: patchAdminCompendiumsCharactersResSkillsCoefficients[]
  cooldown?: string
  cost?: string
  /** 按 locale 返回的技能描述；当前语言缺失时自动回退英文。 */
  description?: string
  /** 技能唯一 ID。更新人物或国际化文案时建议原样回传，用于稳定匹配技能记录。 */
  id?: string
  /** 按 locale 返回的技能名称；当前语言缺失时自动回退英文。 */
  name?: string
  sortOrder?: number
  type?: string
}

/** patchAdminCompendiumsCharactersResSkins */
export interface patchAdminCompendiumsCharactersResSkins {
  attachment?: string
  /** 按 locale 返回的人物描述；当前语言缺失时自动回退英文。 */
  description?: string
  id?: string
  image?: string
  isDefault?: boolean
  name?: string
  sortOrder?: number
}

/**
 * @description CompendiumAdmin/批量新增人物--接口请求Body参数
 * @url POST /admin/compendiums/characters/batch
 */
export interface postCompendiumsCharactersBatchBody {
  characters: postCompendiumsCharactersBatchBodyCharacters[]
  compendiumId: string
}

/** postCompendiumsCharactersBatchBodyCharactersSkillsCoefficients */
export interface postCompendiumsCharactersBatchBodyCharactersSkillsCoefficients {
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

/** postCompendiumsCharactersBatchBodyCharactersSkills */
export interface postCompendiumsCharactersBatchBodyCharactersSkills {
  attachment?: string
  /** 技能业务编码；没有时可仅使用 id。 */
  code?: string
  coefficients?: postCompendiumsCharactersBatchBodyCharactersSkillsCoefficients[]
  cooldown?: string
  cost?: string
  /** 按 locale 返回的技能描述；当前语言缺失时自动回退英文。 */
  description?: string
  /** 技能唯一 ID。更新人物或国际化文案时建议原样回传，用于稳定匹配技能记录。 */
  id?: string
  /** 按 locale 返回的技能名称；当前语言缺失时自动回退英文。 */
  name?: string
  sortOrder?: number
  type?: string
}

/** postCompendiumsCharactersBatchBodyCharacters */
export interface postCompendiumsCharactersBatchBodyCharacters {
  aliases?: string[]
  attributes?: { [key: string]: any }
  avatar?: string
  categories?: { [key: string]: any }
  code?: string
  description?: string
  level?: string
  /** 国际化语言参数。更新人物时，locale=en（默认）表示修改英文主数据； 其他语言（如 zh-CN）表示修改对应语言的翻译文案。 */
  locale?: string
  name?: string
  skills?: postCompendiumsCharactersBatchBodyCharactersSkills[]
  skins?: { [key: string]: any }[]
  sortOrder?: number
  status?: 'enabled' | 'disabled'
}

/**
 * @description CompendiumAdmin/批量新增人物--接口返回值
 * @url POST /admin/compendiums/characters/batch
 */
export type postCompendiumsCharactersBatchRes =
  postCompendiumsCharactersBatchResItem[]

/** postCompendiumsCharactersBatchResItemAttributes */
export interface postCompendiumsCharactersBatchResItemAttributes {
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

/** postCompendiumsCharactersBatchResItemCategories */
export interface postCompendiumsCharactersBatchResItemCategories {
  color?: string
  icon?: string
  key?: string
  name?: string
  value?: string
  valueKey?: string
}

/** postCompendiumsCharactersBatchResItemSkillsCoefficients */
export interface postCompendiumsCharactersBatchResItemSkillsCoefficients {
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

/** postCompendiumsCharactersBatchResItemSkills */
export interface postCompendiumsCharactersBatchResItemSkills {
  attachment?: string
  /** 技能业务编码；没有时可仅使用 id。 */
  code?: string
  coefficients?: postCompendiumsCharactersBatchResItemSkillsCoefficients[]
  cooldown?: string
  cost?: string
  /** 按 locale 返回的技能描述；当前语言缺失时自动回退英文。 */
  description?: string
  /** 技能唯一 ID。更新人物或国际化文案时建议原样回传，用于稳定匹配技能记录。 */
  id?: string
  /** 按 locale 返回的技能名称；当前语言缺失时自动回退英文。 */
  name?: string
  sortOrder?: number
  type?: string
}

/** postCompendiumsCharactersBatchResItemSkins */
export interface postCompendiumsCharactersBatchResItemSkins {
  attachment?: string
  /** 按 locale 返回的人物描述；当前语言缺失时自动回退英文。 */
  description?: string
  id?: string
  image?: string
  isDefault?: boolean
  name?: string
  sortOrder?: number
}

/** postCompendiumsCharactersBatchResItem */
export interface postCompendiumsCharactersBatchResItem {
  aliases?: string[]
  attributes?: postCompendiumsCharactersBatchResItemAttributes[]
  avatar?: string
  categories?: postCompendiumsCharactersBatchResItemCategories[]
  code?: string
  /** 按 locale 返回的人物描述；当前语言缺失时自动回退英文。 */
  description?: string
  id?: string
  level?: string
  /** 按 locale 返回的人物名称；当前语言缺失时自动回退英文。 */
  name?: string
  skills?: postCompendiumsCharactersBatchResItemSkills[]
  skins?: postCompendiumsCharactersBatchResItemSkins[]
  sortOrder?: number
  status?: 'enabled' | 'disabled'
}

/**
 * @description CompendiumAdmin/使用 JSON 请求体导入图鉴--接口请求Body参数
 * @url POST /admin/compendiums/import-json
 */
export interface postAdminCompendiumsImportJsonBody {
  /** 属性定义 */
  attributes?: postAdminCompendiumsImportJsonBodyAttributes[]
  /** 分类定义（含选项） */
  categories?: postAdminCompendiumsImportJsonBodyCategories[]
  /** 人物数据 */
  characters?: postAdminCompendiumsImportJsonBodyCharacters[]
  compendiumId: string
  /** 可选，图鉴基本信息更新 */
  game?: { [key: string]: any }
  importMode?: 'upsert' | 'replace_all'
  matchBy?: 'name' | 'code'
}

/** postAdminCompendiumsImportJsonBodyAttributes */
export interface postAdminCompendiumsImportJsonBodyAttributes {
  higherIsBetter?: boolean
  id?: string
  key?: string
  name?: string
  rankable?: boolean
  sortOrder?: number
  unit?: string
  valueType?: 'number' | 'percent' | 'text'
}

/** postAdminCompendiumsImportJsonBodyCategoriesOptions */
export interface postAdminCompendiumsImportJsonBodyCategoriesOptionsItem {
  color?: string
  icon?: string
  id?: string
  key?: string
  name?: string
  sortOrder?: number
}

/** postAdminCompendiumsImportJsonBodyCategories */
export interface postAdminCompendiumsImportJsonBodyCategories {
  id?: string
  key?: string
  name?: string
  options?: postAdminCompendiumsImportJsonBodyCategoriesOptionsItem[]
  sortOrder?: number
}

/** postAdminCompendiumsImportJsonBodyCharactersSkillsCoefficients */
export interface postAdminCompendiumsImportJsonBodyCharactersSkillsCoefficients {
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

/** postAdminCompendiumsImportJsonBodyCharactersSkills */
export interface postAdminCompendiumsImportJsonBodyCharactersSkills {
  attachment?: string
  /** 技能业务编码；没有时可仅使用 id。 */
  code?: string
  coefficients?: postAdminCompendiumsImportJsonBodyCharactersSkillsCoefficients[]
  cooldown?: string
  cost?: string
  /** 按 locale 返回的技能描述；当前语言缺失时自动回退英文。 */
  description?: string
  /** 技能唯一 ID。更新人物或国际化文案时建议原样回传，用于稳定匹配技能记录。 */
  id?: string
  /** 按 locale 返回的技能名称；当前语言缺失时自动回退英文。 */
  name?: string
  sortOrder?: number
  type?: string
}

/** postAdminCompendiumsImportJsonBodyCharacters */
export interface postAdminCompendiumsImportJsonBodyCharacters {
  aliases?: string[]
  attributes?: { [key: string]: any }
  avatar?: string
  categories?: { [key: string]: any }
  code?: string
  description?: string
  level?: string
  /** 国际化语言参数。更新人物时，locale=en（默认）表示修改英文主数据； 其他语言（如 zh-CN）表示修改对应语言的翻译文案。 */
  locale?: string
  name?: string
  skills?: postAdminCompendiumsImportJsonBodyCharactersSkills[]
  skins?: { [key: string]: any }[]
  sortOrder?: number
  status?: 'enabled' | 'disabled'
}

/**
 * @description CompendiumAdmin/使用 JSON 请求体导入图鉴--接口返回值
 * @url POST /admin/compendiums/import-json
 */
export interface postAdminCompendiumsImportJsonRes {
  game?: postAdminCompendiumsImportJsonResGame
  importMode?: string
  imported?: postAdminCompendiumsImportJsonResImported
  matchBy?: string
}

/** postAdminCompendiumsImportJsonResGame */
export interface postAdminCompendiumsImportJsonResGame {
  code?: string
  description?: string
  icon?: string
  id?: string
  name?: string
  status?: 'enabled' | 'disabled'
}

/** postAdminCompendiumsImportJsonResImported */
export interface postAdminCompendiumsImportJsonResImported {
  aliases?: number
  attributes?: number
  categories?: number
  categoryOptions?: number
  characterAttributes?: number
  characterCategories?: number
  characters?: number
  deletedCharacters?: number
  skillCoefficients?: number
  skills?: number
  skins?: number
}

/**
 * @description CompendiumAdmin/上传 JSON 文件导入图鉴--接口请求Body参数
 * @url POST /admin/compendiums/import-json-file
 */
export interface postAdminCompendiumsImportJsonFileBody {
  compendiumId: string
  fileContent: string
  fileName?: string
  importMode?: 'upsert' | 'replace_all'
  matchBy?: 'name' | 'code'
}

/**
 * @description CompendiumAdmin/上传 JSON 文件导入图鉴--接口返回值
 * @url POST /admin/compendiums/import-json-file
 */
export interface postAdminCompendiumsImportJsonFileRes {
  game?: postAdminCompendiumsImportJsonFileResGame
  importMode?: string
  imported?: postAdminCompendiumsImportJsonFileResImported
  matchBy?: string
}

/** postAdminCompendiumsImportJsonFileResGame */
export interface postAdminCompendiumsImportJsonFileResGame {
  code?: string
  description?: string
  icon?: string
  id?: string
  name?: string
  status?: 'enabled' | 'disabled'
}

/** postAdminCompendiumsImportJsonFileResImported */
export interface postAdminCompendiumsImportJsonFileResImported {
  aliases?: number
  attributes?: number
  categories?: number
  categoryOptions?: number
  characterAttributes?: number
  characterCategories?: number
  characters?: number
  deletedCharacters?: number
  skillCoefficients?: number
  skills?: number
  skins?: number
}

/**
 * @description CompendiumAdmin/上传 Excel 文件导入图鉴--接口请求Body参数
 * @url POST /admin/compendiums/import-excel
 */
export interface postAdminCompendiumsImportExcelBody {
  compendiumId: string
  fileContent: string
  fileName?: string
  importMode?: 'upsert' | 'replace_all'
  matchBy?: 'name' | 'code'
}

/**
 * @description CompendiumAdmin/上传 Excel 文件导入图鉴--接口返回值
 * @url POST /admin/compendiums/import-excel
 */
export interface postAdminCompendiumsImportExcelRes {
  game?: postAdminCompendiumsImportExcelResGame
  importMode?: string
  imported?: postAdminCompendiumsImportExcelResImported
  matchBy?: string
}

/** postAdminCompendiumsImportExcelResGame */
export interface postAdminCompendiumsImportExcelResGame {
  code?: string
  description?: string
  icon?: string
  id?: string
  name?: string
  status?: 'enabled' | 'disabled'
}

/** postAdminCompendiumsImportExcelResImported */
export interface postAdminCompendiumsImportExcelResImported {
  aliases?: number
  attributes?: number
  categories?: number
  categoryOptions?: number
  characterAttributes?: number
  characterCategories?: number
  characters?: number
  deletedCharacters?: number
  skillCoefficients?: number
  skills?: number
  skins?: number
}

/**
 * @description CompendiumAdmin/重建排行--接口请求Body参数
 * @url POST /admin/compendiums/rebuild-rankings
 */
export interface postAdminCompendiumsRebuildRankingsBody {
  compendiumId: string
}

/**
 * @description CompendiumAdmin/重建排行--接口返回值
 * @url POST /admin/compendiums/rebuild-rankings
 */
export interface postAdminCompendiumsRebuildRankingsRes {
  cached?: boolean
  enabledCharacters?: number
  message?: string
  rankableAttributes?: number
}
