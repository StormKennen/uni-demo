export interface GameCouponServerOption {
  value: string
  label: string
  shortLabel: string
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
  servers: GameCouponServerOption[]
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
  defaultServer: 'global',
  servers: [
    { value: 'global', label: '国际服 Global', shortLabel: 'Global' },
    { value: 'korea', label: '韩服 Korea', shortLabel: 'Korea' },
    { value: 'japan', label: '日服 Japan', shortLabel: 'Japan' },
    { value: 'china', label: '国服 China', shortLabel: 'China' },
    { value: 'asia', label: '亚服 Asia', shortLabel: 'Asia' },
    { value: 'europe', label: '欧服 Europe', shortLabel: 'Europe' },
  ],
}

export const GAME_COUPON_CONFIGS: Record<string, GameCouponConfig> = {
  [SWC_GAME_COUPON_CONFIG.gameId]: SWC_GAME_COUPON_CONFIG,
}

export function getGameCouponConfig(gameId = SWC_GAME_COUPON_CONFIG.gameId) {
  return GAME_COUPON_CONFIGS[gameId] || SWC_GAME_COUPON_CONFIG
}
