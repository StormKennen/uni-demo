import type { ShareConfig } from '@/utils/share'
import { SWC_GAME_COUPON_CONFIG } from '@/subPackages/tools/game-coupons/config'

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
export const SWC_COUPON_DETAIL_PATH = '/subPackages/tools/game-coupons/detail'
const SWC_LINEUPS_PATH = '/subPackages/tools/compendium/swc/lineups'
const SWC_LINEUP_MAPPINGS_PATH = '/subPackages/tools/compendium/swc/lineup-mappings'
const SWC_LINEUP_MAPPING_DETAIL_PATH = '/subPackages/tools/compendium/swc/lineup-mapping-detail'
const SWC_LINEUP_RELATIONS_PATH = '/subPackages/tools/compendium/swc/lineup-relations'
const SWC_LINEUP_COUNTER_PATH = '/subPackages/tools/compendium/swc/lineup-counter'
const SWC_DETAIL_PATH = '/subPackages/tools/compendium/swc/detail'
const SWC_RTA_PATH = '/subPackages/tools/compendium/swc/rta/index'

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

export function buildSwcRtaShare(query: QueryValueMap = {}) {
  return createShare('魔灵召唤 RTA 排行榜：查看赛季人物数据', SWC_RTA_PATH, query)
}

export function buildSwcDetailShare(options: {
  characterId: string
  name?: string
  avatar?: string
  locale?: string
  tab?: 'stats' | 'skills' | 'equipment' | 'rta'
  season?: number
  tier?: string
  league?: string
}) {
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
      tab: options.tab,
      season: options.season,
      tier: options.tier,
      league: options.league,
    },
    imageUrl,
  )
}

export function buildSwcCouponsShare(query: QueryValueMap = {}) {
  return createShare('魔灵召唤兑换券：快速兑换礼包码', SWC_COUPONS_PATH, query)
}

export function buildSwcCouponDetailShare(options: {
  couponId: string
  code?: string
  reward?: string
  gameId?: string
  compendiumId?: string
  sharerName?: string
  imageUrl?: string
}) {
  const sharerName = String(options.sharerName || '')
    .replace(/\s+/g, ' ')
    .trim()
  const normalizedSharerName = sharerName.length > 12 ? `${sharerName.slice(0, 12)}…` : sharerName
  const title = `${normalizedSharerName || '好友'}分享了魔灵召唤兑换券给你`
  return createShare(
    title,
    SWC_COUPON_DETAIL_PATH,
    {
      couponId: options.couponId,
      gameId: options.gameId || 'swc',
      compendiumId: options.compendiumId || 'swc',
    },
    options.imageUrl || SWC_GAME_COUPON_CONFIG.detailPoster.heroImage,
  )
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

export function buildSwcLineupCounterShare(query: QueryValueMap = {}) {
  return createShare('魔灵召唤阵容克制：按魔灵查询阵容关系', SWC_LINEUP_COUNTER_PATH, query)
}

export function buildSwcSharePath(path: string, query: QueryValueMap = {}) {
  return withQuery(path, query)
}
