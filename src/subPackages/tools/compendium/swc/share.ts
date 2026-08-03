import type { ShareConfig } from '@/utils/share'

export interface TimelineShareConfig {
  title: string
  query?: string
  imageUrl?: string
}

export interface SwcShareResult {
  app: ShareConfig
  timeline: TimelineShareConfig
}

interface QueryValueMap {
  [key: string]: string | number | boolean | null | undefined
}

const SWC_SHARE_IMAGE = '/static/logo.png'
const SWC_HOME_PATH = '/subPackages/tools/compendium/swc/index'
const SWC_LIST_PATH = '/subPackages/tools/compendium/swc/list'
const SWC_COUPONS_PATH = '/subPackages/tools/game-coupons/index'
const SWC_LINEUPS_PATH = '/subPackages/tools/compendium/swc/lineups'
const SWC_LINEUP_MAPPINGS_PATH = '/subPackages/tools/compendium/swc/lineup-mappings'
const SWC_LINEUP_MAPPING_DETAIL_PATH = '/subPackages/tools/compendium/swc/lineup-mapping-detail'
const SWC_LINEUP_RELATIONS_PATH = '/subPackages/tools/compendium/swc/lineup-relations'
const SWC_DETAIL_PATH = '/subPackages/tools/compendium/swc/detail'

function compactQuery(query: QueryValueMap = {}) {
  return Object.entries(query)
    .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&')
}

function withQuery(path: string, query: QueryValueMap = {}) {
  const queryString = compactQuery(query)
  return queryString ? `${path}?${queryString}` : path
}

function createShare(title: string, path: string, query: QueryValueMap = {}, imageUrl = SWC_SHARE_IMAGE): SwcShareResult {
  const queryString = compactQuery(query)
  return {
    app: {
      title,
      path: queryString ? `${path}?${queryString}` : path,
      imageUrl,
    },
    timeline: {
      title,
      query: queryString,
      imageUrl,
    },
  }
}

export function buildSwcHomeShare() {
  return createShare('魔灵召唤工具箱：图鉴、兑换券、阵容管理', SWC_HOME_PATH)
}

export function buildSwcListShare(query: QueryValueMap = {}) {
  return createShare('魔灵召唤图鉴：快速查找魔灵资料', SWC_LIST_PATH, query)
}

export function buildSwcDetailShare(options: { characterId: string; name?: string; avatar?: string; locale?: string }) {
  const title = `魔灵召唤｜${options.name || '魔灵详情'}`
  const imageUrl = options.avatar || SWC_SHARE_IMAGE
  return createShare(
    title,
    SWC_DETAIL_PATH,
    {
      characterId: options.characterId,
      name: options.name,
      avatar: options.avatar,
      locale: options.locale,
    },
    imageUrl,
  )
}

export function buildSwcCouponsShare(query: QueryValueMap = {}) {
  return createShare('魔灵召唤兑换券：快速兑换礼包码', SWC_COUPONS_PATH, query)
}

export function buildSwcLineupsShare(query: QueryValueMap = {}) {
  return createShare('魔灵召唤阵容库：浏览与管理常用阵容', SWC_LINEUPS_PATH, query)
}

export function buildSwcLineupMappingsShare(query: QueryValueMap = {}) {
  return createShare('魔灵召唤阵容映射：查看克制关系', SWC_LINEUP_MAPPINGS_PATH, query)
}

export function buildSwcLineupMappingDetailShare(options: { mappingId: string; name?: string; locale?: string }) {
  return createShare(`魔灵召唤阵容映射｜${options.name || '映射详情'}`, SWC_LINEUP_MAPPING_DETAIL_PATH, {
    mappingId: options.mappingId,
    compendiumId: 'swc',
    locale: options.locale,
  })
}

export function buildSwcLineupRelationsShare(query: QueryValueMap = {}) {
  return createShare('魔灵召唤阵容克制关系配置', SWC_LINEUP_RELATIONS_PATH, query)
}

export function buildSwcSharePath(path: string, query: QueryValueMap = {}) {
  return withQuery(path, query)
}
