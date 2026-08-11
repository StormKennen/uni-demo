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
  /** 优先返回镜像后的 OSS/CDN 缩略图；未镜像时回退原始第三方头像地址 */
  avatar?: string
  avatarOriginal?: string
  avatarSource?: 'remote' | 'oss'
  avatarStatus?: 'empty' | 'remote' | 'pending' | 'mirrored' | 'failed'
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
  /** 仅导入请求使用的人物翻译。 */
  translations?: postAdminCompendiumsCharactersResSkillsTranslations[]
}

/** postAdminCompendiumsCharactersResAttributes */
export interface postAdminCompendiumsCharactersResAttributes {
  displayValue?: string
  key?: string
  /** 属性展示名称，按 locale 返回；缺失时回退默认名称，再回退 key。 */
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
  /** 稳定分类定义 key，用于程序逻辑和筛选，不随 locale 变化。 */
  key?: string
  /** 分类定义展示名称，按 locale 返回；缺失时回退默认名称，再回退 key。 */
  name?: string
  /** 分类选项展示名称，按 locale 返回；缺失时回退默认名称，再回退 valueKey。 */
  value?: string
  /** 稳定分类选项 key，筛选时应传该字段，不随 locale 变化。 */
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

/** postAdminCompendiumsCharactersResSkillsEffectsItemEffect */
export interface postAdminCompendiumsCharactersResSkillsEffectsItemEffect {
  description?: string
  /** 效果图标完整 URL */
  icon?: string
  iconFilename?: string
  id?: any
  isBuff?: boolean
  name?: string
  type?: string
}

/** 技能附带效果列表（来自 SWARFARM effects）。可能为空数组。 */
export interface postAdminCompendiumsCharactersResSkillsEffectsItem {
  all?: boolean
  aoe?: boolean
  chance?: any
  damage?: boolean
  effect?: postAdminCompendiumsCharactersResSkillsEffectsItemEffect
  note?: string
  onCrit?: boolean
  onDeath?: boolean
  quantity?: number
  random?: boolean
  selfEffect?: boolean
  selfHp?: boolean
  singleTarget?: boolean
  targetHp?: boolean
}

/** postAdminCompendiumsCharactersResSkills */
export interface postAdminCompendiumsCharactersResSkills {
  attachment?: string
  /** 技能业务编码；没有时可仅使用 id。 */
  code?: string
  coefficients?: postAdminCompendiumsCharactersResSkillsCoefficients[]
  cooldown?: string
  /** 从 cooldown 文本中提取的回合数，便于前端直接展示。 */
  cooldownTurns?: any
  cost?: string
  /** 按 locale 返回的技能描述；当前语言缺失时自动回退英文。 */
  description?: string
  /** 技能附带效果列表（来自 SWARFARM effects）。可能为空数组。 */
  effects?: postAdminCompendiumsCharactersResSkillsEffectsItem[]
  /** 命中次数；未明确提供时为 null。 */
  hitCount?: any
  /** 技能唯一 ID。更新人物或国际化文案时建议原样回传，用于稳定匹配技能记录。 */
  id?: string
  /** 队长技能结构化字段（attribute/amount/area/element）。普通技能为 null。服务端不拼装游戏专属图标 URL。 */
  leaderSkill?: any
  /** 技能系数字符串，保留完整展示公式，不参与计算。 */
  multiplierFormula?: string
  /** 按 locale 返回的技能名称；当前语言缺失时自动回退英文。 */
  name?: string
  sortOrder?: number
  /** 仅导入请求使用的技能翻译。 */
  translations?: { [key: string]: any }[]
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
  /** 优先返回镜像后的 OSS/CDN 缩略图；未镜像时回退原始第三方头像地址 */
  avatar?: string
  avatarOriginal?: string
  avatarSource?: 'remote' | 'oss'
  avatarStatus?: 'empty' | 'remote' | 'pending' | 'mirrored' | 'failed'
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
  /** 仅导入请求使用的人物翻译。 */
  translations?: patchAdminCompendiumsCharactersResSkillsTranslations[]
}

/** patchAdminCompendiumsCharactersResAttributes */
export interface patchAdminCompendiumsCharactersResAttributes {
  displayValue?: string
  key?: string
  /** 属性展示名称，按 locale 返回；缺失时回退默认名称，再回退 key。 */
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
  /** 稳定分类定义 key，用于程序逻辑和筛选，不随 locale 变化。 */
  key?: string
  /** 分类定义展示名称，按 locale 返回；缺失时回退默认名称，再回退 key。 */
  name?: string
  /** 分类选项展示名称，按 locale 返回；缺失时回退默认名称，再回退 valueKey。 */
  value?: string
  /** 稳定分类选项 key，筛选时应传该字段，不随 locale 变化。 */
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

/** patchAdminCompendiumsCharactersResSkillsEffectsItemEffect */
export interface patchAdminCompendiumsCharactersResSkillsEffectsItemEffect {
  description?: string
  /** 效果图标完整 URL */
  icon?: string
  iconFilename?: string
  id?: any
  isBuff?: boolean
  name?: string
  type?: string
}

/** 技能附带效果列表（来自 SWARFARM effects）。可能为空数组。 */
export interface patchAdminCompendiumsCharactersResSkillsEffectsItem {
  all?: boolean
  aoe?: boolean
  chance?: any
  damage?: boolean
  effect?: patchAdminCompendiumsCharactersResSkillsEffectsItemEffect
  note?: string
  onCrit?: boolean
  onDeath?: boolean
  quantity?: number
  random?: boolean
  selfEffect?: boolean
  selfHp?: boolean
  singleTarget?: boolean
  targetHp?: boolean
}

/** patchAdminCompendiumsCharactersResSkills */
export interface patchAdminCompendiumsCharactersResSkills {
  attachment?: string
  /** 技能业务编码；没有时可仅使用 id。 */
  code?: string
  coefficients?: patchAdminCompendiumsCharactersResSkillsCoefficients[]
  cooldown?: string
  /** 从 cooldown 文本中提取的回合数，便于前端直接展示。 */
  cooldownTurns?: any
  cost?: string
  /** 按 locale 返回的技能描述；当前语言缺失时自动回退英文。 */
  description?: string
  /** 技能附带效果列表（来自 SWARFARM effects）。可能为空数组。 */
  effects?: patchAdminCompendiumsCharactersResSkillsEffectsItem[]
  /** 命中次数；未明确提供时为 null。 */
  hitCount?: any
  /** 技能唯一 ID。更新人物或国际化文案时建议原样回传，用于稳定匹配技能记录。 */
  id?: string
  /** 队长技能结构化字段（attribute/amount/area/element）。普通技能为 null。服务端不拼装游戏专属图标 URL。 */
  leaderSkill?: any
  /** 技能系数字符串，保留完整展示公式，不参与计算。 */
  multiplierFormula?: string
  /** 按 locale 返回的技能名称；当前语言缺失时自动回退英文。 */
  name?: string
  sortOrder?: number
  /** 仅导入请求使用的技能翻译。 */
  translations?: { [key: string]: any }[]
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

/** postCompendiumsCharactersBatchBodyCharactersSkillsEffectsItemEffect */
export interface postCompendiumsCharactersBatchBodyCharactersSkillsEffectsItemEffect {
  description?: string
  /** 效果图标完整 URL */
  icon?: string
  iconFilename?: string
  id?: any
  isBuff?: boolean
  name?: string
  type?: string
}

/** 技能附带效果列表（来自 SWARFARM effects）。可能为空数组。 */
export interface postCompendiumsCharactersBatchBodyCharactersSkillsEffectsItem {
  all?: boolean
  aoe?: boolean
  chance?: any
  damage?: boolean
  effect?: postCompendiumsCharactersBatchBodyCharactersSkillsEffectsItemEffect
  note?: string
  onCrit?: boolean
  onDeath?: boolean
  quantity?: number
  random?: boolean
  selfEffect?: boolean
  selfHp?: boolean
  singleTarget?: boolean
  targetHp?: boolean
}

/** postCompendiumsCharactersBatchBodyCharactersSkills */
export interface postCompendiumsCharactersBatchBodyCharactersSkills {
  attachment?: string
  /** 技能业务编码；没有时可仅使用 id。 */
  code?: string
  coefficients?: postCompendiumsCharactersBatchBodyCharactersSkillsCoefficients[]
  cooldown?: string
  /** 从 cooldown 文本中提取的回合数，便于前端直接展示。 */
  cooldownTurns?: any
  cost?: string
  /** 按 locale 返回的技能描述；当前语言缺失时自动回退英文。 */
  description?: string
  /** 技能附带效果列表（来自 SWARFARM effects）。可能为空数组。 */
  effects?: postCompendiumsCharactersBatchBodyCharactersSkillsEffectsItem[]
  /** 命中次数；未明确提供时为 null。 */
  hitCount?: any
  /** 技能唯一 ID。更新人物或国际化文案时建议原样回传，用于稳定匹配技能记录。 */
  id?: string
  /** 队长技能结构化字段（attribute/amount/area/element）。普通技能为 null。服务端不拼装游戏专属图标 URL。 */
  leaderSkill?: any
  /** 技能系数字符串，保留完整展示公式，不参与计算。 */
  multiplierFormula?: string
  /** 按 locale 返回的技能名称；当前语言缺失时自动回退英文。 */
  name?: string
  sortOrder?: number
  /** 仅导入请求使用的技能翻译。 */
  translations?: { [key: string]: any }[]
  type?: string
}

/** postCompendiumsCharactersBatchBodyCharacters */
export interface postCompendiumsCharactersBatchBodyCharacters {
  aliases?: string[]
  /** 通用属性（数据驱动，适用于任意游戏图鉴，如魔灵召唤的 stars/hp 等）。 支持两种形态，二选一： 1) 对象形态 { "stars": 6, "hp": { "value": 12000 } }； 2) 数组形态 [{ "key": "stars", "value": 6 }]，即详情/列表接口返回的 attributes 结构可原样回传后直接修改（如只改 star）。数组项中的只读字段 （name/unit/rank 等）会被忽略。属性 key 必须已在该图鉴的属性定义中存在。 注意：更新为整体替换，未提交的属性会被清空，请回传完整 attributes。 */
  attributes?: string
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
  /** 属性展示名称，按 locale 返回；缺失时回退默认名称，再回退 key。 */
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
  /** 稳定分类定义 key，用于程序逻辑和筛选，不随 locale 变化。 */
  key?: string
  /** 分类定义展示名称，按 locale 返回；缺失时回退默认名称，再回退 key。 */
  name?: string
  /** 分类选项展示名称，按 locale 返回；缺失时回退默认名称，再回退 valueKey。 */
  value?: string
  /** 稳定分类选项 key，筛选时应传该字段，不随 locale 变化。 */
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

/** postCompendiumsCharactersBatchResItemSkillsEffectsItemEffect */
export interface postCompendiumsCharactersBatchResItemSkillsEffectsItemEffect {
  description?: string
  /** 效果图标完整 URL */
  icon?: string
  iconFilename?: string
  id?: any
  isBuff?: boolean
  name?: string
  type?: string
}

/** 技能附带效果列表（来自 SWARFARM effects）。可能为空数组。 */
export interface postCompendiumsCharactersBatchResItemSkillsEffectsItem {
  all?: boolean
  aoe?: boolean
  chance?: any
  damage?: boolean
  effect?: postCompendiumsCharactersBatchResItemSkillsEffectsItemEffect
  note?: string
  onCrit?: boolean
  onDeath?: boolean
  quantity?: number
  random?: boolean
  selfEffect?: boolean
  selfHp?: boolean
  singleTarget?: boolean
  targetHp?: boolean
}

/** postCompendiumsCharactersBatchResItemSkills */
export interface postCompendiumsCharactersBatchResItemSkills {
  attachment?: string
  /** 技能业务编码；没有时可仅使用 id。 */
  code?: string
  coefficients?: postCompendiumsCharactersBatchResItemSkillsCoefficients[]
  cooldown?: string
  /** 从 cooldown 文本中提取的回合数，便于前端直接展示。 */
  cooldownTurns?: any
  cost?: string
  /** 按 locale 返回的技能描述；当前语言缺失时自动回退英文。 */
  description?: string
  /** 技能附带效果列表（来自 SWARFARM effects）。可能为空数组。 */
  effects?: postCompendiumsCharactersBatchResItemSkillsEffectsItem[]
  /** 命中次数；未明确提供时为 null。 */
  hitCount?: any
  /** 技能唯一 ID。更新人物或国际化文案时建议原样回传，用于稳定匹配技能记录。 */
  id?: string
  /** 队长技能结构化字段（attribute/amount/area/element）。普通技能为 null。服务端不拼装游戏专属图标 URL。 */
  leaderSkill?: any
  /** 技能系数字符串，保留完整展示公式，不参与计算。 */
  multiplierFormula?: string
  /** 按 locale 返回的技能名称；当前语言缺失时自动回退英文。 */
  name?: string
  sortOrder?: number
  /** 仅导入请求使用的技能翻译。 */
  translations?: { [key: string]: any }[]
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
  /** 优先返回镜像后的 OSS/CDN 缩略图；未镜像时回退原始第三方头像地址 */
  avatar?: string
  avatarOriginal?: string
  avatarSource?: 'remote' | 'oss'
  avatarStatus?: 'empty' | 'remote' | 'pending' | 'mirrored' | 'failed'
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
  /** 仅导入请求使用的人物翻译。 */
  translations?: postCompendiumsCharactersBatchResItemSkillsTranslations[]
}

/**
 * @description CompendiumAdmin/使用 JSON 请求体导入图鉴--接口请求Body参数
 * @url POST /admin/compendiums/import-json
 */
export interface postAdminCompendiumsImportJsonBody {
  /** 属性定义，可带 translations 数组。 */
  attributes?: postAdminCompendiumsImportJsonBodyAttributes[]
  /** 分类定义（含选项），定义和选项均可带 translations 数组。 */
  categories?: postAdminCompendiumsImportJsonBodyCategories[]
  /** 人物数据；人物和技能均可带 translations 数组。 */
  characters?: postAdminCompendiumsImportJsonBodyCharacters[]
  compendiumId: string
  /** 可选，图鉴基本信息更新 */
  game?: { [key: string]: any }
  importMode?: 'upsert' | 'replace_all'
  matchBy?: 'name' | 'code'
}

/** postAdminCompendiumsImportJsonBodyAttributesTranslations */
export interface postAdminCompendiumsImportJsonBodyAttributesTranslations {
  locale: string
  name: string
  status?: 'draft' | 'published'
}

/** postAdminCompendiumsImportJsonBodyAttributes */
export interface postAdminCompendiumsImportJsonBodyAttributes {
  higherIsBetter?: boolean
  id?: string
  /** 稳定属性 key，用于筛选和排序，不随 locale 变化。 */
  key?: string
  /** 按 locale 返回的属性名称。 */
  name?: string
  rankable?: boolean
  sortOrder?: number
  /** 仅导入请求使用的属性翻译。 */
  translations?: postAdminCompendiumsImportJsonBodyAttributesTranslations[]
  unit?: string
  valueType?: 'number' | 'percent' | 'text'
}

/** postAdminCompendiumsImportJsonBodyCategoriesOptions */
export interface postAdminCompendiumsImportJsonBodyCategoriesOptionsItem {
  color?: string
  icon?: string
  id?: string
  /** 稳定分类选项 key，用于筛选，不随 locale 变化。 */
  key?: string
  /** 按 locale 返回的分类选项名称。 */
  name?: string
  sortOrder?: number
  /** 仅导入请求使用的分类选项翻译。 */
  translations?: postAdminCompendiumsImportJsonBodyAttributesTranslations[]
}

/** postAdminCompendiumsImportJsonBodyCategories */
export interface postAdminCompendiumsImportJsonBodyCategories {
  id?: string
  /** 稳定分类定义 key，用于程序逻辑和筛选，不随 locale 变化。 */
  key?: string
  /** 按 locale 返回的分类定义名称。 */
  name?: string
  options?: postAdminCompendiumsImportJsonBodyCategoriesOptionsItem[]
  sortOrder?: number
  /** 仅导入请求使用的分类定义翻译。 */
  translations?: postAdminCompendiumsImportJsonBodyAttributesTranslations[]
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

/** postAdminCompendiumsImportJsonBodyCharactersSkillsEffectsItemEffect */
export interface postAdminCompendiumsImportJsonBodyCharactersSkillsEffectsItemEffect {
  description?: string
  /** 效果图标完整 URL */
  icon?: string
  iconFilename?: string
  id?: any
  isBuff?: boolean
  name?: string
  type?: string
}

/** 技能附带效果列表（来自 SWARFARM effects）。可能为空数组。 */
export interface postAdminCompendiumsImportJsonBodyCharactersSkillsEffectsItem {
  all?: boolean
  aoe?: boolean
  chance?: any
  damage?: boolean
  effect?: postAdminCompendiumsImportJsonBodyCharactersSkillsEffectsItemEffect
  note?: string
  onCrit?: boolean
  onDeath?: boolean
  quantity?: number
  random?: boolean
  selfEffect?: boolean
  selfHp?: boolean
  singleTarget?: boolean
  targetHp?: boolean
}

/** postAdminCompendiumsImportJsonBodyCharactersSkills */
export interface postAdminCompendiumsImportJsonBodyCharactersSkills {
  attachment?: string
  /** 技能业务编码；没有时可仅使用 id。 */
  code?: string
  coefficients?: postAdminCompendiumsImportJsonBodyCharactersSkillsCoefficients[]
  cooldown?: string
  /** 从 cooldown 文本中提取的回合数，便于前端直接展示。 */
  cooldownTurns?: any
  cost?: string
  /** 按 locale 返回的技能描述；当前语言缺失时自动回退英文。 */
  description?: string
  /** 技能附带效果列表（来自 SWARFARM effects）。可能为空数组。 */
  effects?: postAdminCompendiumsImportJsonBodyCharactersSkillsEffectsItem[]
  /** 命中次数；未明确提供时为 null。 */
  hitCount?: any
  /** 技能唯一 ID。更新人物或国际化文案时建议原样回传，用于稳定匹配技能记录。 */
  id?: string
  /** 队长技能结构化字段（attribute/amount/area/element）。普通技能为 null。服务端不拼装游戏专属图标 URL。 */
  leaderSkill?: any
  /** 技能系数字符串，保留完整展示公式，不参与计算。 */
  multiplierFormula?: string
  /** 按 locale 返回的技能名称；当前语言缺失时自动回退英文。 */
  name?: string
  sortOrder?: number
  /** 仅导入请求使用的技能翻译。 */
  translations?: { [key: string]: any }[]
  type?: string
}

/** postAdminCompendiumsImportJsonBodyCharacters */
export interface postAdminCompendiumsImportJsonBodyCharacters {
  aliases?: string[]
  /** 通用属性（数据驱动，适用于任意游戏图鉴，如魔灵召唤的 stars/hp 等）。 支持两种形态，二选一： 1) 对象形态 { "stars": 6, "hp": { "value": 12000 } }； 2) 数组形态 [{ "key": "stars", "value": 6 }]，即详情/列表接口返回的 attributes 结构可原样回传后直接修改（如只改 star）。数组项中的只读字段 （name/unit/rank 等）会被忽略。属性 key 必须已在该图鉴的属性定义中存在。 注意：更新为整体替换，未提交的属性会被清空，请回传完整 attributes。 */
  attributes?: string
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
  attributeTranslations?: number
  attributes?: number
  categories?: number
  categoryOptionTranslations?: number
  categoryOptions?: number
  categoryTranslations?: number
  characterAttributes?: number
  characterCategories?: number
  characterTranslations?: number
  characters?: number
  deletedCharacters?: number
  skillCoefficients?: number
  skillTranslations?: number
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
  attributeTranslations?: number
  attributes?: number
  categories?: number
  categoryOptionTranslations?: number
  categoryOptions?: number
  categoryTranslations?: number
  characterAttributes?: number
  characterCategories?: number
  characterTranslations?: number
  characters?: number
  deletedCharacters?: number
  skillCoefficients?: number
  skillTranslations?: number
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
  attributeTranslations?: number
  attributes?: number
  categories?: number
  categoryOptionTranslations?: number
  categoryOptions?: number
  categoryTranslations?: number
  characterAttributes?: number
  characterCategories?: number
  characterTranslations?: number
  characters?: number
  deletedCharacters?: number
  skillCoefficients?: number
  skillTranslations?: number
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
