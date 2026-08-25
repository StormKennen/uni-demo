export interface GameCouponServerOption {
  value: string
  label: string
  shortLabel: string
}

export interface GameCouponDetailPoster {
  heroImage: string
  contentBackground: string
}

export interface GameCouponConfig {
  gameId: string
  compendiumId: string
  gameName: string
  title: string
  subtitle: string
  heroBadge: string
  accountIdLabel: string
  accountIdPlaceholder: string
  accountIdEmptyText: string
  storageKey: string
  backendDocPath: string
  defaultServer: string
  managementHeroImage: string
  servers: GameCouponServerOption[]
  detailPoster: GameCouponDetailPoster
}

export const SWC_GAME_COUPON_CONFIG: GameCouponConfig = {
  gameId: 'swc',
  compendiumId: 'swc',
  gameName: '魔灵召唤',
  title: '魔灵召唤兑换券',
  subtitle: '保存常用 Hive ID，一键获取可用礼包码并提交兑换。',
  heroBadge: 'Summoners War',
  accountIdLabel: 'Hive ID',
  accountIdPlaceholder: '输入 Hive ID',
  accountIdEmptyText: '待填写 Hive ID',
  storageKey: 'GAME_COUPON_ACCOUNTS_swc',
  backendDocPath: 'docs/summoners-war-coupon-backend.md',
  defaultServer: 'china',
  managementHeroImage: 'https://lzk-web.oss-cn-beijing.aliyuncs.com/swc/game-coupons/detail/top.jpg',
  detailPoster: {
    heroImage: 'https://lzk-web.oss-cn-beijing.aliyuncs.com/swc/game-coupons/detail/poster01.jpeg',
    contentBackground: 'https://lzk-web.oss-cn-beijing.aliyuncs.com/swc/game-coupons/detail/poster02.jpeg',
  },
  servers: [
    { value: 'china', label: '国服', shortLabel: '国服' },
    { value: 'global', label: '国际服', shortLabel: '国际服' },
    { value: 'korea', label: '韩服', shortLabel: '韩服' },
    { value: 'japan', label: '日服', shortLabel: '日服' },
    { value: 'asia', label: '亚服', shortLabel: '亚服' },
    { value: 'europe', label: '欧服', shortLabel: '欧服' },
  ],
}

export const GAME_COUPON_CONFIGS: Record<string, GameCouponConfig> = {
  [SWC_GAME_COUPON_CONFIG.gameId]: SWC_GAME_COUPON_CONFIG,
}

export function getGameCouponConfig(gameId = SWC_GAME_COUPON_CONFIG.gameId) {
  return GAME_COUPON_CONFIGS[gameId] || SWC_GAME_COUPON_CONFIG
}
