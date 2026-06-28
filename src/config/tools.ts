/** 工具节点（不含 key，key 作为字典的键） */
export interface ToolItem {
  name: string
  desc: string
  icon: string
  gradient: string
  path: string
  category: string
  unsupportedPlatforms?: string[]
  disabled?: boolean
  badge?: string
  isNew?: boolean
  isWebLink?: boolean
  requiresAuth?: boolean
  adminOnly?: boolean
}

/** 分类配置 */
export interface CategoryConfig {
  key: string
  name: string
  subtitle: string
  layout: 'grid' | 'list'
}

/** Storage Key：最近使用（存放 key 数组） */
export const STORAGE_KEY_RECENT = 'APP_RECENT_TOOLS'
/** Storage Key：分类折叠状态 */
export const STORAGE_KEY_FOLD_STATUS = 'APP_CATEGORY_FOLD_STATUS'
/** 最近使用最大数量 */
export const MAX_RECENT_TOOLS = 6

export const CATEGORIES: CategoryConfig[] = [
  { key: 'wiki', name: '图鉴', subtitle: 'WIKI', layout: 'grid' },
  { key: 'media', name: '媒体', subtitle: 'MEDIA', layout: 'grid' },
  { key: 'qr', name: '二维码', subtitle: 'QR', layout: 'grid' },
  { key: 'record', name: '记录', subtitle: 'RECORD', layout: 'list' },
  { key: 'text', name: '文本', subtitle: 'TEXT', layout: 'grid' },
  { key: 'entertainment', name: '娱乐', subtitle: 'ENTERTAINMENT', layout: 'grid' },
]

/**
 * 全量工具映射表
 * Key 为高语义化字符串，子页面上报和首页渲染共用同一套 Key
 */
export const ALL_TOOLS: Record<string, ToolItem> = {
  // ── 图鉴 ──
  'compendium-swc': {
    name: '魔灵召唤',
    desc: '魔灵图鉴/筛选/详情',
    icon: 'star',
    gradient: 'linear-gradient(135deg, #ff7a59 0%, #f2c94c 100%)',
    path: '/subPackages/tools/compendium/swc/list',
    category: 'wiki',
    isNew: true,
  },
  'compendium-lineups': {
    name: '魔灵召唤阵容',
    desc: '阵容管理/克制关系',
    icon: 'flag',
    gradient: 'linear-gradient(135deg, #b45309 0%, #f59e0b 100%)',
    path: '/subPackages/tools/compendium/swc/lineups?compendiumId=swc',
    category: 'wiki',
    badge: 'ADMIN',
    requiresAuth: true,
    adminOnly: true,
  },
  'summoners-war-coupons': {
    name: '魔灵兑换券',
    desc: '礼包码/账号管理',
    icon: 'gift',
    gradient: 'linear-gradient(135deg, #e94560 0%, #ff7a59 100%)',
    path: '/subPackages/tools/game-coupons/index?gameId=swc&compendiumId=swc',
    category: 'wiki',
    isNew: true,
  },
  // ── 媒体 ──
  'oss-upload': {
    name: '图片上传',
    desc: '安全快速传输',
    icon: 'upload',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    path: '/subPackages/tools/oss-upload/index',
    category: 'media',
  },
  'image-stitch': {
    name: '图片拼接',
    desc: '多图合成长图',
    icon: 'images',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    path: '/subPackages/tools/image-stitch/index',
    category: 'media',
  },
  'image-compress': {
    name: '图片压缩',
    desc: '高效压缩不失真',
    icon: 'image',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    path: '/subPackages/tools/image-compress/index',
    category: 'media',
  },
  'image-format': {
    name: '图片格式转换',
    desc: 'JPG / PNG / WebP',
    icon: 'color-palette',
    gradient: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    path: '/subPackages/tools/image-format/index',
    category: 'media',
  },
  'image-cipher': {
    name: '图片混淆',
    desc: '多次混淆/还原',
    icon: 'locked',
    gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    path: '/subPackages/tools/image-cipher/index',
    category: 'media',
    unsupportedPlatforms: ['mp-weixin'],
  },
  'image-watermark': {
    name: '图片加水印',
    desc: '文字/贴纸叠加',
    icon: 'brush',
    gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
    path: '/subPackages/tools/image-watermark/index',
    category: 'media',
    unsupportedPlatforms: ['mp-weixin'],
  },
  'video-compress': {
    name: '视频压缩',
    desc: '高效压缩省空间',
    icon: 'videocam',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    path: '/subPackages/tools/video-compress/index',
    category: 'media',
  },
  'video-watermark': {
    name: '视频去水印',
    desc: '粘贴解析/保存/复制直链',
    icon: 'link',
    gradient: 'linear-gradient(135deg, #07c160 0%, #12d28c 100%)',
    path: '/subPackages/tools/watermark/index',
    category: 'media',
    unsupportedPlatforms: ['mp-weixin'],
  },
  'video-gif': {
    name: '视频转GIF',
    desc: '纯前端视频转动图',
    icon: 'videocam',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    path: '/subPackages/tools/video-gif/index',
    category: 'media',
  },
  // ── 二维码 ──
  'qr-generator': {
    name: '二维码生成',
    desc: '自定义颜色和 Logo',
    icon: 'scan',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    path: '/subPackages/tools/qr-generator/index',
    category: 'qr',
  },
  'qr-parser': {
    name: '二维码解析',
    desc: '扫码识别或图片上传',
    icon: 'camera',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    path: '/subPackages/tools/qr-parser/index',
    category: 'qr',
  },
  // ── 记录 ──
  calendar: {
    name: '万年历',
    desc: '黄历查询、择吉日',
    icon: 'calendar',
    gradient: 'linear-gradient(135deg, #C83C3C 0%, #D4B375 100%)',
    path: '/subPackages/tools/calendar/index',
    category: 'record',
  },
  chat: {
    name: '笔记收藏',
    desc: '个人笔记随手记',
    icon: 'chat',
    gradient: 'linear-gradient(135deg, #42b913 0%, #42b983 100%)',
    path: '/subPackages/tools/chat/index',
    category: 'record',
  },
  memo: {
    name: '备忘录',
    desc: '备忘录管理，支持分类',
    icon: 'compose',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    path: '/subPackages/tools/memo/list',
    category: 'record',
    requiresAuth: true,
  },
  'family-tree': {
    name: '族谱',
    desc: '实时数据，支持编辑',
    icon: 'personadd',
    gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    path: '/subPackages/tools/family-tree/index',
    category: 'record',
    requiresAuth: true,
  },
  // ── 文本 ──
  markdown: {
    name: 'Markdown 转 HTML',
    desc: 'Markdown 一键预览/导出',
    icon: 'document',
    gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    path: '/subPackages/tools/markdown/index',
    category: 'text',
  },
  'magnet-link': {
    name: '磁力链接',
    desc: '自动补全/过滤/批量替换',
    icon: 'link',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    path: '/subPackages/tools/magnet-link/index',
    category: 'text',
  },
  // ── 娱乐 ──
  'pool-aim': {
    name: '台球瞄准器',
    desc: '台球路线计算/直线/反库',
    icon: 'flag',
    gradient: 'linear-gradient(135deg, #147a54 0%, #28b779 100%)',
    path: '/subPackages/tools/pool-aim/index',
    category: 'entertainment',
    isNew: true,
  },
}
