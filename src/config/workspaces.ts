export type WorkspaceKey = 'workbench' | 'image' | 'video' | 'swc' | 'qr' | 'record' | 'text' | 'entertainment'
export type ToolWorkspaceKey = Exclude<WorkspaceKey, 'workbench'>

export interface WorkspaceConfig {
  key: WorkspaceKey
  name: string
  icon: string
  type: 'workbench' | 'tools' | 'portal'
  defaultOrder: number
  subtitle: string
  summary: string
  directoryLayout: 'grid' | 'list'
}

export const WORKSPACES: WorkspaceConfig[] = [
  {
    key: 'workbench',
    name: '工作台',
    icon: 'home',
    type: 'workbench',
    defaultOrder: 1,
    subtitle: 'WORKBENCH',
    summary: '常用工具与推荐流程。',
    directoryLayout: 'grid',
  },
  {
    key: 'image',
    name: '图片',
    icon: 'image',
    type: 'tools',
    defaultOrder: 2,
    subtitle: 'IMAGE',
    summary: '图片处理、转换与整理。',
    directoryLayout: 'grid',
  },
  {
    key: 'video',
    name: '视频',
    icon: 'videocam',
    type: 'tools',
    defaultOrder: 3,
    subtitle: 'VIDEO',
    summary: '视频压缩、转换与链接处理。',
    directoryLayout: 'grid',
  },
  {
    key: 'swc',
    name: '魔灵召唤',
    icon: 'star',
    type: 'portal',
    defaultOrder: 4,
    subtitle: 'SUMMONERS WAR',
    summary: '图鉴、兑换券、阵容与克制。',
    directoryLayout: 'grid',
  },
  {
    key: 'qr',
    name: '二维码',
    icon: 'scan',
    type: 'tools',
    defaultOrder: 5,
    subtitle: 'QR',
    summary: '生成、解析和常用码保存。',
    directoryLayout: 'grid',
  },
  {
    key: 'record',
    name: '记录',
    icon: 'compose',
    type: 'tools',
    defaultOrder: 6,
    subtitle: 'RECORD',
    summary: '个人内容与长期记录。',
    directoryLayout: 'list',
  },
  {
    key: 'text',
    name: '文本',
    icon: 'font',
    type: 'tools',
    defaultOrder: 7,
    subtitle: 'TEXT',
    summary: '文本补全、转换与分发。',
    directoryLayout: 'grid',
  },
  {
    key: 'entertainment',
    name: '娱乐',
    icon: 'flag',
    type: 'tools',
    defaultOrder: 8,
    subtitle: 'ENTERTAINMENT',
    summary: '轻量娱乐与辅助工具。',
    directoryLayout: 'grid',
  },
]

export const WORKSPACE_MAP = WORKSPACES.reduce<Record<WorkspaceKey, WorkspaceConfig>>(
  (result, workspace) => {
    result[workspace.key] = workspace
    return result
  },
  {} as Record<WorkspaceKey, WorkspaceConfig>,
)

export const isWorkspaceKey = (value: unknown): value is WorkspaceKey => {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(WORKSPACE_MAP, value)
}
