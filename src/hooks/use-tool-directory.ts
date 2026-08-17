import { computed, onMounted, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { isUserLoggedIn, autoLogin } from '@/utils/autoLogin'
import { getUserInfo, getWorkspaceFoldStatus, setWorkspaceFoldStatus } from '@/utils/storage'
import { ALL_TOOLS, STORAGE_KEY_RECENT } from '@/config/tools'
import type { ToolItem } from '@/config/tools'
import { WORKSPACES, type WorkspaceKey } from '@/config/workspaces'
import { createToolFlowSession, type ToolFlowId, type ToolFlowStep } from '@/utils/tool-flow'

export interface KeyedToolItem {
  key: string
  tool: ToolItem
}

export interface HeroAction {
  id: string
  title: string
  trigger: string
  tone: 'slate' | 'cyan'
  tool: KeyedToolItem
}

export interface WorkflowScene {
  id: string
  kicker: string
  title: string
  label: string
  benefit: string
  tone: 'slate' | 'cyan'
  primary: KeyedToolItem
  steps: KeyedToolItem[]
}

const workbenchFallbackKeys = ['video-watermark', 'qr-generator', 'compendium-swc']

const workflowBlueprints = [
  {
    id: 'magnet-flow',
    kicker: 'TEXT TO IMAGE',
    title: '磁力链接 → 二维码 → 图片打乱',
    label: '磁力转分享图',
    benefit: '把磁力链接快速转成适合转发的图片',
    tone: 'cyan' as const,
    primaryKey: 'magnet-link',
    stepKeys: ['magnet-link', 'qr-generator', 'image-cipher'],
  },
  {
    id: 'scan-flow',
    kicker: 'SCAN TO ACTION',
    title: '二维码解析 → 磁力补全 → 二维码生成',
    label: '扫码再加工',
    benefit: '解析二维码后补全内容并重新生成',
    tone: 'slate' as const,
    primaryKey: 'qr-parser',
    stepKeys: ['qr-parser', 'magnet-link', 'qr-generator'],
  },
  {
    id: 'media-flow',
    kicker: 'FAST MEDIA',
    title: '图片压缩 → 格式转换 → 图片拼接',
    label: '图片快处理',
    benefit: '压缩、转换、拼接，快速整理成品图',
    tone: 'slate' as const,
    primaryKey: 'image-compress',
    stepKeys: ['image-compress', 'image-format', 'image-stitch'],
  },
]

export function useToolDirectory() {
  const currentUserRole = ref(getUserInfo()?.role || '')
  const loggedIn = ref(isUserLoggedIn())
  const recentToolKeys = ref<string[]>([])
  const foldStatus = ref<Partial<Record<WorkspaceKey, boolean>>>({})
  const currentPlatform = ref<'app' | 'h5' | 'mp-weixin'>('app')

  // #ifdef MP-WEIXIN
  currentPlatform.value = 'mp-weixin'
  // #endif

  // #ifdef H5
  currentPlatform.value = 'h5'
  // #endif

  const isAdmin = computed(() => currentUserRole.value === 'admin')

  const isToolAvailable = (tool: ToolItem): boolean => {
    if (tool.adminOnly && !isAdmin.value) return false
    if (tool.unsupportedPlatforms?.includes(currentPlatform.value)) return false
    return true
  }

  const availableTools = computed<KeyedToolItem[]>(() =>
    Object.entries(ALL_TOOLS)
      .filter(([, tool]) => isToolAvailable(tool) && !tool.hiddenInDirectory)
      .map(([key, tool]) => ({ key, tool })),
  )

  // 综合入口隐藏在工具目录，但仍作为首页工作台的稳定聚合入口保留。
  const workbenchAvailableTools = computed<KeyedToolItem[]>(() =>
    Object.entries(ALL_TOOLS)
      .filter(([key, tool]) => isToolAvailable(tool) && (!tool.hiddenInDirectory || key === 'compendium-swc'))
      .map(([key, tool]) => ({ key, tool })),
  )

  const availableToolMap = computed<Record<string, KeyedToolItem>>(() =>
    availableTools.value.reduce<Record<string, KeyedToolItem>>((map, item) => {
      map[item.key] = item
      return map
    }, {}),
  )

  const workbenchAvailableToolMap = computed<Record<string, KeyedToolItem>>(() =>
    workbenchAvailableTools.value.reduce<Record<string, KeyedToolItem>>((map, item) => {
      map[item.key] = item
      return map
    }, {}),
  )

  const visibleWorkspaces = computed(() =>
    WORKSPACES.filter(workspace => workspace.type !== 'workbench' && getToolsByWorkspace(workspace.key).length > 0),
  )

  function isHiddenInWorkbench(tool: ToolItem): boolean {
    return !!tool.hiddenInWorkbenchPlatforms?.includes(currentPlatform.value)
  }

  const recentTools = computed<KeyedToolItem[]>(() => {
    const available = new Set(workbenchAvailableTools.value.map(item => item.key))
    return recentToolKeys.value
      .filter(key => available.has(key) && ALL_TOOLS[key] && !isHiddenInWorkbench(ALL_TOOLS[key]))
      .map(key => ({ key, tool: ALL_TOOLS[key] }))
  })

  const platformLabel = computed(() => {
    if (currentPlatform.value === 'mp-weixin') return '微信小程序'
    if (currentPlatform.value === 'h5') return 'H5'
    return '多端'
  })

  const heroStatusChips = computed(() => [
    `${availableTools.value.length} 个工具`,
    `${visibleWorkspaces.value.length} 个工作间`,
    loggedIn.value ? '已登录' : '本地优先',
  ])

  const heroFooterText = computed(() =>
    loggedIn.value ? '当前已开启个人功能，继续处理会更顺手。' : '游客模式可直接使用，登录后可同步个人内容。',
  )

  const primaryHeroActions = computed<HeroAction[]>(() => {
    const preferredKeys =
      currentPlatform.value === 'mp-weixin'
        ? ['magnet-link', 'compendium-swc', 'qr-generator']
        : ['magnet-link', 'qr-generator', 'video-watermark']

    return preferredKeys
      .map((key, index) => {
        const item = workbenchAvailableToolMap.value[key]
        if (!item) return null
        return {
          id: `hero-${key}`,
          title: item.tool.name,
          trigger:
            key === 'magnet-link'
              ? '补全后继续生成二维码'
              : key === 'qr-generator'
                ? '生成结果后继续图片处理'
                : key === 'compendium-swc'
                  ? '快速检索人物和阵容'
                  : '快速得到处理结果',
          tone: index === 0 ? 'cyan' : 'slate',
          tool: item,
        }
      })
      .filter((item): item is HeroAction => !!item)
      .slice(0, 3)
  })

  const workflowScenes = computed<WorkflowScene[]>(() =>
    workflowBlueprints
      .map(scene => {
        const primary = availableToolMap.value[scene.primaryKey]
        const steps = scene.stepKeys.map(key => availableToolMap.value[key]).filter((item): item is KeyedToolItem => !!item)
        if (!primary || steps.length < 2) return null
        return {
          ...scene,
          primary,
          steps,
        }
      })
      .filter((item): item is NonNullable<typeof item> => !!item)
      .map(item => item as WorkflowScene),
  )

  const workbenchTools = computed<KeyedToolItem[]>(() => {
    if (recentTools.value.length > 0) return recentTools.value.slice(0, 6)

    const preferred = workbenchFallbackKeys
      .map(key => workbenchAvailableToolMap.value[key])
      .filter((item): item is KeyedToolItem => !!item && !isHiddenInWorkbench(item.tool))
    if (preferred.length >= 3) return preferred.slice(0, 6)

    const preferredKeys = new Set(preferred.map(item => item.key))
    const supplement = workbenchAvailableTools.value
      .filter(item => !preferredKeys.has(item.key) && !isHiddenInWorkbench(item.tool))
      .slice(0, Math.max(0, 6 - preferred.length))
    return [...preferred, ...supplement]
  })

  function getToolsByWorkspace(workspaceKey: WorkspaceKey): KeyedToolItem[] {
    if (workspaceKey === 'workbench') return []
    return availableTools.value.filter(item => item.tool.workspace === workspaceKey)
  }

  function isFolded(workspaceKey: WorkspaceKey): boolean {
    return !!foldStatus.value[workspaceKey]
  }

  function loadRecentTools() {
    try {
      const data = uni.getStorageSync(STORAGE_KEY_RECENT)
      recentToolKeys.value = Array.isArray(data) ? normalizeRecentToolKeys(data) : []
    } catch {
      recentToolKeys.value = []
    }
  }

  function normalizeRecentToolKeys(keys: unknown[]): string[] {
    const result: string[] = []

    keys.forEach(rawKey => {
      if (typeof rawKey !== 'string') return
      const tool = ALL_TOOLS[rawKey]
      if (!tool) return
      const key = tool.recentAliasKey && ALL_TOOLS[tool.recentAliasKey] ? tool.recentAliasKey : rawKey
      if (!result.includes(key)) result.push(key)
    })

    return result
  }

  function loadFoldStatus() {
    foldStatus.value = getWorkspaceFoldStatus()
  }

  function toggleWorkspaceFold(workspaceKey: WorkspaceKey) {
    foldStatus.value = {
      ...foldStatus.value,
      [workspaceKey]: !foldStatus.value[workspaceKey],
    }
    setWorkspaceFoldStatus(foldStatus.value)
  }

  function openLogin() {
    uni.navigateTo({ url: '/pages/mine/login/login' })
  }

  async function handleToolClick(_toolKey: string, tool: ToolItem) {
    if (tool.disabled) {
      uni.showToast({ title: '功能开发中，敬请期待', icon: 'none', duration: 2000 })
      return
    }

    if (tool.unsupportedPlatforms?.includes(currentPlatform.value)) {
      uni.showToast({ title: '当前平台暂不支持该功能', icon: 'none', duration: 2000 })
      return
    }

    if (tool.isWebLink) {
      uni.navigateTo({
        url: `/subPackages/common/webview/h5?path=${encodeURIComponent(tool.path)}&title=${encodeURIComponent(tool.name)}`,
      })
      return
    }

    if (tool.requiresAuth && !isUserLoggedIn()) {
      uni.showModal({
        title: '需要登录',
        content: '该功能需要登录后才能使用',
        confirmText: '去登录',
        cancelText: '取消',
        success: (res: UniApp.ShowModalRes) => {
          if (res.confirm) {
            uni.navigateTo({
              url: `/pages/mine/login/login?redirectUrl=${encodeURIComponent(tool.path)}`,
            })
          }
        },
      })
      return
    }

    uni.navigateTo({ url: tool.path })
  }

  // 推荐流程入口：走页面级工作流的链路先创建 flow session 再跳转首节点
  const flowEntryStepMap: Record<string, ToolFlowStep> = {
    'magnet-flow': 'magnet-link',
    'scan-flow': 'qr-parser',
  }

  async function handleWorkflowClick(scene: WorkflowScene) {
    const primary = scene.primary
    const entryStep = flowEntryStepMap[scene.id]
    const playable = !primary.tool.disabled && !primary.tool.unsupportedPlatforms?.includes(currentPlatform.value)

    if (entryStep && playable) {
      createToolFlowSession(scene.id as ToolFlowId, entryStep, {})
      uni.navigateTo({ url: `${primary.tool.path}?flow=${scene.id}` })
      return
    }

    await handleToolClick(primary.key, primary.tool)
  }

  function syncCurrentUserRole() {
    currentUserRole.value = getUserInfo()?.role || ''
  }

  onMounted(async () => {
    syncCurrentUserRole()
    loadRecentTools()
    loadFoldStatus()

    try {
      await autoLogin()
    } catch {
      /* 静默 */
    }
  })

  onShow(() => {
    syncCurrentUserRole()
    loggedIn.value = isUserLoggedIn()
    loadRecentTools()
  })

  return {
    loggedIn,
    availableTools,
    availableToolMap,
    visibleWorkspaces,
    recentTools,
    platformLabel,
    heroStatusChips,
    heroFooterText,
    primaryHeroActions,
    workflowScenes,
    workbenchTools,
    handleWorkflowClick,
    getToolsByWorkspace,
    isFolded,
    toggleWorkspaceFold,
    openLogin,
    handleToolClick,
  }
}
