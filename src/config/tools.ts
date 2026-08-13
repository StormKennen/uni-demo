import type { ToolWorkspaceKey } from '@/config/workspaces'

/** 工具节点（不含 key，key 作为字典的键） */
export interface ToolItem {
  name: string
  desc: string
  icon: string
  gradient: string
  path: string
  workspace: ToolWorkspaceKey
  unsupportedPlatforms?: string[]
  hiddenInWorkbenchPlatforms?: string[]
  disabled?: boolean
  badge?: string
  isNew?: boolean
  isWebLink?: boolean
  requiresAuth?: boolean
  adminOnly?: boolean
  hiddenInDirectory?: boolean
  recentAliasKey?: string
}

/** Storage Key：最近使用（存放 key 数组） */
export const STORAGE_KEY_RECENT = 'APP_RECENT_TOOLS'
/** 最近使用最大数量 */
export const MAX_RECENT_TOOLS = 6

/**
 * 全量工具映射表
 * Key 为高语义化字符串，子页面上报和首页渲染共用同一套 Key
 */
export const ALL_TOOLS: Record<string, ToolItem> = {
  // ── 魔灵召唤 ──
  'compendium-swc': {
    name: '魔灵召唤',
    desc: '图鉴/兑换券/阵容',
    icon: 'star',
    gradient: 'linear-gradient(135deg, #ff7a59 0%, #f2c94c 100%)',
    path: '/subPackages/tools/compendium/swc/index',
    workspace: 'swc',
    isNew: true,
  },
  'compendium-swc-admin': {
    name: '魔灵召唤·图鉴管理',
    desc: '管理员内联编辑图鉴',
    icon: 'compose',
    gradient: 'linear-gradient(135deg, #0f766e 0%, #38bdf8 100%)',
    path: '/subPackages/tools/compendium/swc/admin-list',
    workspace: 'swc',
    adminOnly: true,
  },
  'compendium-lineups': {
    name: '魔灵召唤阵容',
    desc: '阵容分享/点赞，登录后可发布',
    icon: 'flag',
    gradient: 'linear-gradient(135deg, #b45309 0%, #f59e0b 100%)',
    path: '/subPackages/tools/compendium/swc/lineups?compendiumId=swc',
    workspace: 'swc',
    isNew: true,
    hiddenInDirectory: true,
    recentAliasKey: 'compendium-swc',
  },
  'compendium-lineup-mappings': {
    name: '魔灵召唤阵容映射',
    desc: '源/目标容器阵容映射，容器内阵容可点赞点踩',
    icon: 'link',
    gradient: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)',
    path: '/subPackages/tools/compendium/swc/lineup-mappings?compendiumId=swc',
    workspace: 'swc',
    isNew: true,
    hiddenInDirectory: true,
    recentAliasKey: 'compendium-swc',
  },
  'compendium-lineup-counter': {
    name: '阵容克制',
    desc: '按魔灵查询阵容阵容克制关系',
    icon: 'refresh',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
    path: '/subPackages/tools/compendium/swc/lineup-counter?compendiumId=swc',
    workspace: 'swc',
    isNew: true,
    hiddenInDirectory: true,
    recentAliasKey: 'compendium-swc',
  },
  'summoners-war-coupons': {
    name: '魔灵兑换券',
    desc: '礼包码/账号管理',
    icon: 'gift',
    gradient: 'linear-gradient(135deg, #e94560 0%, #ff7a59 100%)',
    path: '/subPackages/tools/game-coupons/index?gameId=swc&compendiumId=swc',
    workspace: 'swc',
    isNew: true,
    hiddenInDirectory: true,
    recentAliasKey: 'compendium-swc',
  },
  // ── 图片 / 视频 ──
  'oss-upload': {
    name: '图片上传',
    desc: '安全快速传输',
    icon: 'upload',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    path: '/subPackages/tools/oss-upload/index',
    workspace: 'image',
  },
  'image-stitch': {
    name: '图片拼接',
    desc: '多图合成长图',
    icon: 'images',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    path: '/subPackages/tools/image-stitch/index',
    workspace: 'image',
  },
  'image-compress': {
    name: '图片压缩',
    desc: '高效压缩不失真',
    icon: 'image',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    path: '/subPackages/tools/image-compress/index',
    workspace: 'image',
  },
  'image-privacy': {
    name: '图片隐私清理',
    desc: '去元信息/遮挡敏感区',
    icon: 'eye-slash',
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #22c55e 100%)',
    path: '/subPackages/tools/image-privacy/index',
    workspace: 'image',
    isNew: true,
    hiddenInDirectory: true,
  },
  'image-format': {
    name: '图片格式转换',
    desc: 'JPG / PNG / WebP',
    icon: 'image',
    gradient: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    path: '/subPackages/tools/image-format/index',
    workspace: 'image',
  },
  'image-cipher': {
    name: '图片打乱',
    desc: '按密钥打乱/重组',
    icon: 'locked',
    gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    path: '/subPackages/tools/image-cipher/index',
    workspace: 'image',
  },
  'image-watermark': {
    name: '图片加水印',
    desc: '文字/贴纸叠加',
    icon: 'compose',
    gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
    path: '/subPackages/tools/image-watermark/index',
    workspace: 'image',
    hiddenInDirectory: true,
  },
  'video-compress': {
    name: '视频压缩',
    desc: '高效压缩省空间',
    icon: 'videocam',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    path: '/subPackages/tools/video-compress/index',
    workspace: 'video',
  },
  'video-watermark': {
    name: '视频去水印',
    desc: '提取/复制原始链接',
    icon: 'link',
    gradient: 'linear-gradient(135deg, #07c160 0%, #12d28c 100%)',
    path: '/subPackages/tools/watermark/index',
    workspace: 'video',
  },
  'video-gif': {
    name: '视频转GIF',
    desc: '纯前端视频转动图',
    icon: 'videocam',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    path: '/subPackages/tools/video-gif/index',
    workspace: 'video',
    unsupportedPlatforms: ['mp-weixin'],
  },
  'document-scan': {
    name: '文档扫描',
    desc: '多页整理成长图',
    icon: 'paperclip',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
    path: '/subPackages/tools/document-scan/index',
    workspace: 'image',
    isNew: true,
    hiddenInDirectory: true,
  },
  'pdf-toolkit': {
    name: 'PDF 工具箱',
    desc: '转换/合并/拆分/压缩',
    icon: 'paperclip',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
    path: '/subPackages/tools/pdf-toolkit/index',
    workspace: 'image',
    isNew: true,
    // 内容未完整落地前，先隐藏入口，避免审核/用户进入半成品页
    hiddenInDirectory: true,
  },
  // ── 二维码 ──
  'qr-generator': {
    name: '二维码生成',
    desc: '自定义颜色和 Logo',
    icon: 'scan',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    path: '/subPackages/tools/qr-generator/index',
    workspace: 'qr',
  },
  'qr-parser': {
    name: '二维码解析',
    desc: '扫码识别或图片上传',
    icon: 'camera',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    path: '/subPackages/tools/qr-parser/index',
    workspace: 'qr',
  },
  'code-wallet': {
    name: '码包',
    desc: '常用码保存/同步',
    icon: 'scan',
    gradient: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
    path: '/subPackages/tools/code-wallet/index',
    workspace: 'qr',
    isNew: true,
  },
  // ── 记录 ──
  calendar: {
    name: '万年历',
    desc: '黄历查询、择吉日',
    icon: 'calendar',
    gradient: 'linear-gradient(135deg, #C83C3C 0%, #D4B375 100%)',
    path: '/subPackages/tools/calendar/index',
    workspace: 'record',
  },
  chat: {
    name: '笔记收藏',
    desc: '个人笔记随手记',
    icon: 'chat',
    gradient: 'linear-gradient(135deg, #42b913 0%, #42b983 100%)',
    path: '/subPackages/tools/chat/index',
    workspace: 'record',
  },
  memo: {
    name: '备忘录',
    desc: '备忘录管理，支持分类',
    icon: 'compose',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    path: '/subPackages/tools/memo/list',
    workspace: 'record',
    requiresAuth: true,
  },
  'family-tree': {
    name: '族谱',
    desc: '实时数据，支持编辑',
    icon: 'personadd',
    gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    path: '/subPackages/tools/family-tree/index',
    workspace: 'record',
    requiresAuth: true,
    // 图谱能力升级中，暂不在工具目录展示正式入口；路由与成员数据能力保留
    hiddenInDirectory: true,
  },
  // ── 文本 ──
  markdown: {
    name: 'Markdown 转 HTML',
    desc: 'Markdown 一键预览/导出',
    icon: 'font',
    gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    path: '/subPackages/tools/markdown/index',
    workspace: 'text',
  },
  'magnet-link': {
    name: '磁力链接',
    desc: '自动补全/过滤/批量替换',
    icon: 'link',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    path: '/subPackages/tools/magnet-link/index',
    workspace: 'text',
  },
  // ── 娱乐 ──
  'pool-aim': {
    name: '台球瞄准器',
    desc: '台球路线计算/直线/反库',
    icon: 'flag',
    gradient: 'linear-gradient(135deg, #147a54 0%, #28b779 100%)',
    path: '/subPackages/tools/pool-aim/index',
    workspace: 'entertainment',
    isNew: true,
  },
}
