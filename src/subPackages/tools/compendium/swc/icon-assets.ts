export type SwcSquareIconKind = 'archetype' | 'element' | 'buff' | 'debuff' | 'leader-skill'

export type SwcIconFolder = 'arche-types' | 'elements' | 'buffs' | 'debuffs' | 'leader-skills'

export interface SwcUploadAssetItem {
  kind: SwcSquareIconKind
  folder: SwcIconFolder
  iconKey: string
  fileName: string
  relativePath: string
  objectKey: string
}

const SWC_OSS_BASE_PREFIX = 'swc'
const SWC_ICON_CDN_BASE = 'https://lzk-web.oss-cn-beijing.aliyuncs.com/swc'

const normalizeText = (value?: string): string => (typeof value === 'string' ? value.trim().toLowerCase() : '')

const joinCdnAssetPath = (folder: string, fileName: string): string => `${SWC_ICON_CDN_BASE}/${folder}/${fileName}`

export const normalizeSwcArchetype = (value?: string): string => {
  const text = normalizeText(value)
  if (!text) return ''
  if (['attack', 'atk', '攻击', '攻击型'].includes(text)) return 'attack'
  if (['defense', 'def', '防御', '防御型'].includes(text)) return 'defense'
  if (['hp', 'health', '体力', '体力型'].includes(text)) return 'hp'
  if (['support', 'sup', '辅助', '辅助型'].includes(text)) return 'support'
  return text
}

export const normalizeSwcElement = (value?: string): string => {
  const text = normalizeText(value)
  if (!text) return ''
  if (['fire', '火'].includes(text)) return 'fire'
  if (['water', '水'].includes(text)) return 'water'
  if (['wind', '风'].includes(text)) return 'wind'
  if (['light', '光'].includes(text)) return 'light'
  if (['dark', '暗'].includes(text)) return 'dark'
  return text
}

const normalizeIconKey = (value?: string): string => {
  const text = typeof value === 'string' ? value.trim() : ''
  if (!text) return ''
  return text.toLowerCase().endsWith('.png') ? text.slice(0, -4) : text
}

export const SWC_ARCHETYPE_LABEL_MAP: Record<string, string> = {
  attack: '攻击型',
  defense: '防御型',
  hp: '体力型',
  support: '辅助型',
}

export const SWC_ICON_FILE_MAP = {
  archetype: {
    attack: 'attack.png',
    defense: 'defense.png',
    hp: 'hp.png',
    support: 'support.png',
  },
  element: {
    fire: 'fire.png',
    water: 'water.png',
    wind: 'wind.png',
    light: 'light.png',
    dark: 'dark.png',
  },
  buff: {
    buff_attack_up: 'buff_attack_up.png',
    buff_berserk: 'buff_berserk.png',
    buff_counter: 'buff_counter.png',
    buff_crit_down: 'buff_crit_down.png',
    buff_crit_up: 'buff_crit_up.png',
    buff_defence_up: 'buff_defence_up.png',
    buff_endure: 'buff_endure.png',
    buff_heal: 'buff_heal.png',
    buff_immune: 'buff_immune.png',
    buff_invinciblity: 'buff_invinciblity.png',
    buff_knowledge: 'buff_knowledge.png',
    buff_magic_reflect: 'buff_magic_reflect.png',
    buff_manafury: 'buff_manafury.png',
    buff_protect: 'buff_protect.png',
    buff_reflect: 'buff_reflect.png',
    buff_shield: 'buff_shield.png',
    buff_soul_protect: 'buff_soul_protect.png',
    buff_soul_stone: 'buff_soul_stone.png',
    buff_speed: 'buff_speed.png',
    buff_stealth: 'buff_stealth.png',
    buff_threat: 'buff_threat.png',
    buff_vampire: 'buff_vampire.png',
  },
  debuff: {
    debuff_attack_down: 'debuff_attack_down.png',
    debuff_block_buffs: 'debuff_block_buffs.png',
    debuff_block_heal: 'debuff_block_heal.png',
    debuff_bomb: 'debuff_bomb.png',
    debuff_brand: 'debuff_brand.png',
    debuff_cleanse_block: 'debuff_cleanse_block.png',
    debuff_deathcurse: 'debuff_deathcurse.png',
    debuff_defence_down: 'debuff_defence_down.png',
    debuff_dot: 'debuff_dot.png',
    debuff_freeze: 'debuff_freeze.png',
    debuff_glancing_hit: 'debuff_glancing_hit.png',
    debuff_irresistible: 'debuff_irresistible.png',
    debuff_mark: 'debuff_mark.png',
    debuff_oblivious: 'debuff_oblivious.png',
    debuff_provoke: 'debuff_provoke.png',
    debuff_seal: 'debuff_seal.png',
    debuff_silence: 'debuff_silence.png',
    debuff_sleep: 'debuff_sleep.png',
    debuff_slow: 'debuff_slow.png',
    debuff_stun: 'debuff_stun.png',
    debuff_suppress: 'debuff_suppress.png',
    debuff_unrevivable: 'debuff_unrevivable.png',
  },
  'leader-skill': {
    leader_skill_Accuracy_Arena: 'leader_skill_Accuracy_Arena.png',
    leader_skill_Attack_Power: 'leader_skill_Attack_Power.png',
    leader_skill_Attack_Power_Arena: 'leader_skill_Attack_Power_Arena.png',
    leader_skill_Attack_Power_Dungeon: 'leader_skill_Attack_Power_Dungeon.png',
    leader_skill_Attack_Power_Fire: 'leader_skill_Attack_Power_Fire.png',
    leader_skill_Attack_Speed: 'leader_skill_Attack_Speed.png',
    leader_skill_Attack_Speed_Arena: 'leader_skill_Attack_Speed_Arena.png',
    leader_skill_Critical_Rate: 'leader_skill_Critical_Rate.png',
    leader_skill_Critical_Rate_Arena: 'leader_skill_Critical_Rate_Arena.png',
    leader_skill_Critical_Rate_Guild: 'leader_skill_Critical_Rate_Guild.png',
    leader_skill_Critical_Rate_Water: 'leader_skill_Critical_Rate_Water.png',
    leader_skill_Critical_Rate_Wind: 'leader_skill_Critical_Rate_Wind.png',
    leader_skill_Defense: 'leader_skill_Defense.png',
    leader_skill_Defense_Arena: 'leader_skill_Defense_Arena.png',
    leader_skill_Defense_Fire: 'leader_skill_Defense_Fire.png',
    leader_skill_Defense_Light: 'leader_skill_Defense_Light.png',
    leader_skill_HP_Arena: 'leader_skill_HP_Arena.png',
    leader_skill_HP_Guild: 'leader_skill_HP_Guild.png',
    leader_skill_Resistance_Arena: 'leader_skill_Resistance_Arena.png',
    leader_skill_Resistance_Wind: 'leader_skill_Resistance_Wind.png',
  },
} as const satisfies Record<SwcSquareIconKind, Record<string, string>>

export const SWC_ICON_FOLDER_MAP: Record<SwcSquareIconKind, SwcIconFolder> = {
  archetype: 'arche-types',
  element: 'elements',
  buff: 'buffs',
  debuff: 'debuffs',
  'leader-skill': 'leader-skills',
}

const resolveNormalizedIconKey = (kind: SwcSquareIconKind, iconKey?: string): string => {
  if (kind === 'archetype') return normalizeSwcArchetype(iconKey)
  if (kind === 'element') return normalizeSwcElement(iconKey)
  return normalizeIconKey(iconKey)
}

export const getSwcIconFileName = (kind: SwcSquareIconKind, iconKey?: string): string => {
  const normalizedKey = resolveNormalizedIconKey(kind, iconKey)
  if (!normalizedKey) return ''
  const fileNameMap = SWC_ICON_FILE_MAP[kind]
  if (fileNameMap[normalizedKey]) return fileNameMap[normalizedKey]

  const caseInsensitiveKey = Object.keys(fileNameMap).find(key => key.toLowerCase() === normalizedKey.toLowerCase())
  return caseInsensitiveKey ? fileNameMap[caseInsensitiveKey] : ''
}

export const getSwcIconRelativePath = (kind: SwcSquareIconKind, iconKey?: string): string => {
  const fileName = getSwcIconFileName(kind, iconKey)
  if (!fileName) return ''
  return `${SWC_ICON_FOLDER_MAP[kind]}/${fileName}`
}

export const getSwcIconObjectKey = (kind: SwcSquareIconKind, iconKey?: string, prefix = SWC_OSS_BASE_PREFIX): string => {
  const relativePath = getSwcIconRelativePath(kind, iconKey)
  if (!relativePath) return ''
  return `${prefix}/${relativePath}`
}

export const listSwcUploadAssets = (prefix = SWC_OSS_BASE_PREFIX): SwcUploadAssetItem[] =>
  (Object.keys(SWC_ICON_FILE_MAP) as SwcSquareIconKind[]).flatMap(kind => {
    const folder = SWC_ICON_FOLDER_MAP[kind]
    return Object.entries(SWC_ICON_FILE_MAP[kind]).map(([iconKey, fileName]) => {
      const relativePath = `${folder}/${fileName}`
      return {
        kind,
        folder,
        iconKey,
        fileName,
        relativePath,
        objectKey: `${prefix}/${relativePath}`,
      }
    })
  })

export const resolveSwcSquareIcon = (kind: SwcSquareIconKind, iconKey?: string): string => {
  const fileName = getSwcIconFileName(kind, iconKey)
  if (!fileName) return ''
  return joinCdnAssetPath(SWC_ICON_FOLDER_MAP[kind], fileName)
}
