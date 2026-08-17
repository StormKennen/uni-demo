export interface SwcPortalEntry {
  id: string
  title: string
  desc: string
  icon: string
  accent: string
  accentSoft: string
  path: string
}

export const SWC_PORTAL_ENTRIES: SwcPortalEntry[] = [
  {
    id: 'bestiary',
    title: '魔灵图鉴',
    desc: '检索人物、筛选属性、查看详情',
    icon: 'star',
    accent: '#f97316',
    accentSoft: 'rgba(249, 115, 22, 0.14)',
    path: '/subPackages/tools/compendium/swc/list',
  },
  {
    id: 'rta-ranking',
    title: 'RTA排行榜',
    desc: '查看赛季排行与人物 RTA 数据',
    icon: 'bars',
    accent: '#2563eb',
    accentSoft: 'rgba(37, 99, 235, 0.13)',
    path: '/subPackages/tools/compendium/swc/rta/index',
  },
  {
    id: 'coupons',
    title: '魔灵兑换券',
    desc: '管理账号并快速兑换礼包码',
    icon: 'gift',
    accent: '#e11d48',
    accentSoft: 'rgba(225, 29, 72, 0.13)',
    path: '/subPackages/tools/game-coupons/index?gameId=swc&compendiumId=swc',
  },
  {
    id: 'lineups',
    title: '魔灵阵容',
    desc: '浏览、发布与管理阵容组合',
    icon: 'flag',
    accent: '#d97706',
    accentSoft: 'rgba(217, 119, 6, 0.14)',
    path: '/subPackages/tools/compendium/swc/lineups?compendiumId=swc',
  },
  {
    id: 'counter',
    title: '阵容克制',
    desc: '按魔灵查询阵容克制与被克制关系',
    icon: 'refresh',
    accent: '#7c3aed',
    accentSoft: 'rgba(124, 58, 237, 0.14)',
    path: '/subPackages/tools/compendium/swc/lineup-counter?compendiumId=swc',
  },
]
