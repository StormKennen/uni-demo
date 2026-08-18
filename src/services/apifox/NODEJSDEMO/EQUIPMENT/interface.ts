/**
 * @description Equipment/获取人物推荐装备--接口请求Query参数
 * @url GET /compendiums/character-equipment
 */
export interface getCompendiumsCharacterEquipmentQuery {
  compendiumId: string
  /** 人物 character.code，与 SWLens unit_master_id 相同；与 characterId 二选一 */
  code?: string
  /** 本地人物 Mongo id；与 code 二选一 */
  characterId?: string
}

/**
 * @description Equipment/获取人物推荐装备--接口返回值
 * @url GET /compendiums/character-equipment
 */
export interface getCompendiumsCharacterEquipmentRes {
  character?: getCompendiumsCharacterEquipmentResCharacter
  equipmentRecommendations?: getCompendiumsCharacterEquipmentResEquipmentRecommendations
}

/** getCompendiumsCharacterEquipmentResCharacter */
export interface getCompendiumsCharacterEquipmentResCharacter {
  code?: string
  id?: string
  name?: string
}

/** getCompendiumsCharacterEquipmentResEquipmentRecommendationsArtifactsItemAttributePreferredEffectsUsage */
export interface getCompendiumsCharacterEquipmentResEquipmentRecommendationsArtifactsItemAttributePreferredEffectsUsage {
  count?: any
  rate?: any
}

/** getCompendiumsCharacterEquipmentResEquipmentRecommendationsArtifactsItemAttributePreferredEffects */
export interface getCompendiumsCharacterEquipmentResEquipmentRecommendationsArtifactsItemAttributePreferredEffects {
  effectId?: any
  property?: string
  propertyZh?: any
  rank?: any
  usage?: getCompendiumsCharacterEquipmentResEquipmentRecommendationsArtifactsItemAttributePreferredEffectsUsage
}

/** getCompendiumsCharacterEquipmentResEquipmentRecommendationsArtifactsItemAttribute */
export interface getCompendiumsCharacterEquipmentResEquipmentRecommendationsArtifactsItemAttribute {
  preferredEffects?: getCompendiumsCharacterEquipmentResEquipmentRecommendationsArtifactsItemAttributePreferredEffects[]
  primaries?: getCompendiumsCharacterEquipmentResEquipmentRecommendationsArtifactsItemAttributePreferredEffects[]
}

/** getCompendiumsCharacterEquipmentResEquipmentRecommendationsArtifacts */
export interface getCompendiumsCharacterEquipmentResEquipmentRecommendationsArtifactsItem {
  attribute?: getCompendiumsCharacterEquipmentResEquipmentRecommendationsArtifactsItemAttribute
  context?: string
  label?: string
  labelZh?: string
  type?: getCompendiumsCharacterEquipmentResEquipmentRecommendationsArtifactsItemAttribute
  unspecified?: getCompendiumsCharacterEquipmentResEquipmentRecommendationsArtifactsItemAttribute
}

/** getCompendiumsCharacterEquipmentResEquipmentRecommendationsRunesItemPriorityStats */
export interface getCompendiumsCharacterEquipmentResEquipmentRecommendationsRunesItemPriorityStatsItem {
  priority?: number
  stat?: string
  statZh?: string
  usage?: getCompendiumsCharacterEquipmentResEquipmentRecommendationsArtifactsItemAttributePreferredEffectsUsage
}

/** getCompendiumsCharacterEquipmentResEquipmentRecommendationsRunesItemSets */
export interface getCompendiumsCharacterEquipmentResEquipmentRecommendationsRunesItemSets {
  rank?: any
  setKey?: string
  /** 同时装备的套装，不是二选一 */
  sets?: string[]
  setsZh?: string[]
  usage?: getCompendiumsCharacterEquipmentResEquipmentRecommendationsArtifactsItemAttributePreferredEffectsUsage
}

/** getCompendiumsCharacterEquipmentResEquipmentRecommendationsRunesItemSlots2 */
export interface getCompendiumsCharacterEquipmentResEquipmentRecommendationsRunesItemSlots2 {
  rank?: any
  stat?: string
  statZh?: any
  usage?: getCompendiumsCharacterEquipmentResEquipmentRecommendationsArtifactsItemAttributePreferredEffectsUsage
}

/** getCompendiumsCharacterEquipmentResEquipmentRecommendationsRunesItemSlots */
export interface getCompendiumsCharacterEquipmentResEquipmentRecommendationsRunesItemSlots {
  '2'?: getCompendiumsCharacterEquipmentResEquipmentRecommendationsRunesItemSlots2[]
  '4'?: getCompendiumsCharacterEquipmentResEquipmentRecommendationsRunesItemSlots2[]
  '6'?: getCompendiumsCharacterEquipmentResEquipmentRecommendationsRunesItemSlots2[]
}

/** getCompendiumsCharacterEquipmentResEquipmentRecommendationsRunes */
export interface getCompendiumsCharacterEquipmentResEquipmentRecommendationsRunesItem {
  context?: 'rta' | 'siege' | 'arena' | 'pve' | 'general'
  label?: string
  labelZh?: string
  priorityStats?: getCompendiumsCharacterEquipmentResEquipmentRecommendationsRunesItemPriorityStatsItem[]
  sets?: getCompendiumsCharacterEquipmentResEquipmentRecommendationsRunesItemSets[]
  slots?: getCompendiumsCharacterEquipmentResEquipmentRecommendationsRunesItemSlots
}

/** getCompendiumsCharacterEquipmentResEquipmentRecommendations */
export interface getCompendiumsCharacterEquipmentResEquipmentRecommendations {
  artifacts?: getCompendiumsCharacterEquipmentResEquipmentRecommendationsArtifactsItem[]
  runes?: getCompendiumsCharacterEquipmentResEquipmentRecommendationsRunesItem[]
}

/**
 * @description Equipment/批量导入人物推荐装备--接口请求Body参数
 * @url POST /compendiums/character-equipment/import
 */
export interface postCompendiumsCharacterEquipmentImportBody {
  characters: { [key: string]: any }[]
  compendiumId?: 'swc'
  unmatched?: { [key: string]: any }[]
}

/**
 * @description Equipment/批量导入人物推荐装备--接口返回值
 * @url POST /compendiums/character-equipment/import
 */
export interface postCompendiumsCharacterEquipmentImportRes {
  /** 按人物计数 */
  characterNotFound?: number
  plannedWrites?: number
  skippedManual?: number
  /** 按人物计数 */
  skippedUnmatched?: number
  unchanged?: number
  written?: number
}
