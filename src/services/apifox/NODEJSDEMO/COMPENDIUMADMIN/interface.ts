/**
 * @description CompendiumAdmin/更新图鉴人物--接口请求Body参数
 * @url PATCH /admin/compendiums/characters
 */
export interface patchAdminCompendiumsCharactersBody {
  /** 图鉴 ID 或 code */
  compendiumId: string
  /** 人物 ID */
  characterId: string
  /** 人物名称 */
  name?: string
  /** 人物别名列表 */
  aliases?: string[]
  /** 人物描述 */
  description?: string
  /** 人物头像 URL */
  avatar?: string
  /** 人物等级 */
  level?: string
  /** 排序权重 */
  sortOrder?: number
  /** 分类数据（key: 分类 key，value: 选项 key 或选项 name） */
  categories?: Record<string, string>
  /** 属性数据（key: 属性 key，value: 数值） */
  attributes?: Record<string, number | string>
  /** 技能列表 */
  skills?: patchAdminCompendiumsCharactersBodySkill[]
  /** 国际化字段 */
  i18n?: Record<string, patchAdminCompendiumsCharactersBodyI18nLocale>
}

/** 技能更新项 */
export interface patchAdminCompendiumsCharactersBodySkill {
  /** 技能 ID（已有技能传 ID 表示更新，不传表示新增） */
  id?: string
  name?: string
  type?: string
  description?: string
  cost?: string
  cooldown?: string
  attachment?: string
  sortOrder?: number
}

/** 单个 locale 的翻译字段 */
export interface patchAdminCompendiumsCharactersBodyI18nLocale {
  name?: string
  description?: string
  skills?: Record<string, { name?: string; description?: string }>
}

/**
 * @description CompendiumAdmin/更新图鉴人物--接口返回值
 * @url PATCH /admin/compendiums/characters
 */
export interface patchAdminCompendiumsCharactersRes {
  success?: boolean
  message?: string
}
